/**
 * User-authored text (the project description, episode file names) ends up as
 * arguments to `print` in the generated play scripts. Inside double quotes,
 * `"`, `$`, `` ` `` and `\` are shell- or PowerShell-active, so a stray `"` in
 * a description flips the quote state and the whole script fails to parse.
 * Single-quoted strings are literal in both shells; only the quote character
 * itself needs escaping. `print` still expands `\n` from the text afterwards.
 */

/** Literal string for play.sh (bash). Backslashes are doubled since `print` runs the text through `printf %b`. */
export function shQuote(text: string): string {
  return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "'\\''")}'`;
}

/** Literal string for play.ps1 (PowerShell). Only `'` needs escaping, by doubling it. */
export function psQuote(text: string): string {
  return `'${text.replace(/'/g, "''")}'`;
}
