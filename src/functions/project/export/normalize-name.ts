/**
 * Bundle file names end up inside double-quoted strings in the generated play
 * scripts, where characters like `"`, `$`, `` ` `` and `\` are shell- or
 * PowerShell-active. Sources keep their original names on disk; this maps them
 * to safe names used inside the export bundle (copies, zip entries, scripts,
 * and the portable save file - they must all agree).
 *
 * Keeps letters, digits, dots, dashes, and common title punctuation;
 * whitespace and everything else becomes "_" (runs collapsed), so bundle
 * paths are also painless to type or tab-complete in a terminal.
 * Leading/trailing dots are trimmed since Windows rejects them.
 */
export function normalizeBundleFileName(fileName: string): string {
  const normalized = fileName
    .replace(/[^A-Za-z0-9._\-()&+,']/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[._]+|[._]+$/g, "");
  return normalized || "unnamed";
}
