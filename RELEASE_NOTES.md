<!--
  Release notes for the NEXT release. This text becomes the GitHub release
  body AND the notes shown in the in-app update dialog before the user
  chooses to update, so lead with the changelog and keep it plain markdown.

  Fill in the bullets (and delete any section that doesn't apply) as part of
  the version-bump commit. The release workflow refuses to publish while
  empty "-" bullets remain. This comment block is stripped before publishing.
-->

## Changelog

### Fix
- Generated play.ps1 no longer tries to unescape anything containing `\` which lead to cosmetic issues and stdout noise.

## Installation
1. Download and run the `.exe` installer from the assets below (`.deb` or `.AppImage` on Linux).
   - Your browser may warn about the download - choose `Keep` to continue.
   - Windows may warn about an unknown publisher - click `More info`, then `Run anyway`.
