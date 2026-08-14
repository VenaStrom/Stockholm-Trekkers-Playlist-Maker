<!--
  Release notes for the NEXT release. This text becomes the GitHub release
  body AND the notes shown in the in-app update dialog before the user
  chooses to update, so lead with the changelog and keep it plain markdown.

  Fill in the bullets (and delete any section that doesn't apply) as part of
  the version-bump commit. The release workflow refuses to publish while
  empty "-" bullets remain. This comment block is stripped before publishing.
-->

## Changelog

### Features
- New command line interface: `list`, `show`, `create`, `apply`, `delete`, and `export` commands for making and modifying playlists without opening the app. See the [CLI docs](https://github.com/VenaStrom/Stockholm-Trekkers-Playlist-Maker/blob/main/docs/cli.md).
- CLI export supports `--zip` and `--encoding`.

### Fixes
- Project cards now show the correct "Modified" date.
- Failed CLI exports now exit with an error code.

## Installation
1. Download and run the `.exe` installer from the assets below (`.deb` or `.AppImage` on Linux).
   - Your browser may warn about the download - choose `Keep` to continue.
   - Windows may warn about an unknown publisher - click `More info`, then `Run anyway`.
