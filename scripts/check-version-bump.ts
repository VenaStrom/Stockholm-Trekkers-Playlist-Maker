import { execFileSync } from "node:child_process";

/**
 * CI guard against forgotten version bumps. Two modes:
 *
 * - `pr` (default when GITHUB_BASE_REF is set): fails when the package.json
 *   version is not greater than the one on the PR's base branch.
 * - `release`: fails when a git tag for the current package.json version
 *   already exists on origin — dispatching the Release workflow without a bump
 *   would otherwise clobber the published release of the previous version.
 *
 * The current version comes from `process.env.npm_package_version`, which yarn
 * injects when this runs through `yarn check:version [mode]`.
 */

type SemverParts = {
  core: [number, number, number];
  prerelease: string[];
};

/** Parse a `major.minor.patch[-prerelease]` string, ignoring any build metadata (`+...`). */
function parseVersion(version: string): SemverParts | null {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(version.trim());
  if (!match) return null;

  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ? match[4].split(".") : [],
  };
}

/** Compare two prerelease identifier lists per semver precedence rules. Returns -1, 0, or 1. */
function comparePrerelease(a: string[], b: string[]): number {
  // A version with no prerelease outranks one that has a prerelease (1.0.0 > 1.0.0-rc).
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return -1;

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const idA = a[i] as string;
    const idB = b[i] as string;
    const numA = /^\d+$/.test(idA) ? Number(idA) : null;
    const numB = /^\d+$/.test(idB) ? Number(idB) : null;

    if (numA !== null && numB !== null) {
      if (numA !== numB) return numA < numB ? -1 : 1;
    } else if (numA !== null) {
      return -1; // numeric identifiers have lower precedence than alphanumeric
    } else if (numB !== null) {
      return 1;
    } else if (idA !== idB) {
      return idA < idB ? -1 : 1;
    }
  }

  // All shared identifiers equal: the longer list has higher precedence.
  if (a.length === b.length) return 0;
  return a.length < b.length ? -1 : 1;
}

/** Returns true when `head` is strictly greater than `base` per semver precedence. */
function isGreater(head: SemverParts, base: SemverParts): boolean {
  for (let i = 0; i < 3; i++) {
    if (head.core[i] !== base.core[i]) return (head.core[i] as number) > (base.core[i] as number);
  }
  return comparePrerelease(head.prerelease, base.prerelease) > 0;
}

function fail(message: string): never {
  console.error(`::error::${message}`);
  process.exit(1);
}

const currentRaw = process.env.npm_package_version;
if (!currentRaw) {
  fail("npm_package_version is not set - run this script through yarn (e.g. `yarn check:version`).");
}
const current = parseVersion(currentRaw);
if (!current) fail(`Could not parse the package.json version: "${currentRaw}".`);

const mode = process.argv[2] ?? (process.env.GITHUB_BASE_REF ? "pr" : "release");

if (mode === "pr") {
  const baseRef = process.env.GITHUB_BASE_REF || "main";

  let baseRaw: string;
  try {
    // Shallow checkouts don't have the base branch; fetch just its tip
    execFileSync("git", ["fetch", "--quiet", "--depth=1", "origin", baseRef]);
    const basePackageJson = execFileSync("git", ["show", "FETCH_HEAD:package.json"], { encoding: "utf8" });
    baseRaw = (JSON.parse(basePackageJson) as { version: string; }).version;
  }
  catch (err) {
    fail(`Could not read package.json version from origin/${baseRef}: ${err instanceof Error ? err.message : String(err)}`);
  }

  const base = parseVersion(baseRaw);
  if (!base) fail(`Could not parse the base (origin/${baseRef}) package.json version: "${baseRaw}".`);

  if (!isGreater(current, base)) {
    fail(
      `package.json version (${currentRaw}) must be greater than the version on ${baseRef} (${baseRaw}). `
      + "Bump the version before merging.",
    );
  }

  console.info(`OK version bumped: ${baseRaw} -> ${currentRaw}`);
}
else if (mode === "release") {
  const tag = `v${currentRaw}`;

  let remoteTags: string;
  try {
    remoteTags = execFileSync("git", ["ls-remote", "--tags", "origin", `refs/tags/${tag}`], { encoding: "utf8" });
  }
  catch (err) {
    fail(`Could not list remote tags: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (remoteTags.trim() !== "") {
    fail(
      `Tag ${tag} already exists on origin - releasing now would clobber the published ${tag} release. `
      + "Bump the version in package.json first.",
    );
  }

  console.info(`OK ${tag} is unreleased, safe to publish.`);
}
else {
  fail(`Unknown mode "${mode}". Use "pr" or "release".`);
}
