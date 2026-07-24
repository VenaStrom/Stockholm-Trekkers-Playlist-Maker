# Parity with v3 (Electron)

- [ ] Block options UI: per-block dropdown to toggle leading/trailing clips (countdown, emergency, covid, sign-in reminder) with option dots in the block header — data model and export already support this, only the UI is missing
  - [ ] Reconcile saved options against the current clip catalog on load (carry over checked state) so renamed/removed clips degrade gracefully
- [ ] Export feedback: real progress, a working cancel (terminate + delete partial folder), and error/cancelled/success end states with an open-folder button (currently "[No feedback implemented yet]")
- [ ] Export validation: block export on missing episode files (currently warn + skip) and on missing date; confirm before overwriting an existing export folder (`export-project.ts` TODO)
- [ ] Import save file (native picker, overwrite confirm) + migration from the v3 save format (see `old-save-file.json`)
- [ ] Editor validation warnings: duplicate and overlapping block times, invalid/very early/very late/non-5-min times, past/weekday/far-future dates (+ easter eggs: 47, 17:01, 2063-04-05 🖖)
- [x] Flush save on close/quit — Ctrl+Q is an immediate exit and can lose the 500 ms debounce window
- [x] Ctrl+S manual save
- [ ] CI: build + draft-release workflows (no `.github/` on this branch)
- [ ] Installer: keep-save-files prompt on uninstall, preserve user data on update (v3 `installer.nsh` behavior)
- [ ] Play scripts: kill pre-existing VLC instances and show a "VLC not found, install it" message like v3's ps1

# Bugs

- [x] Delete-project dialog copy: "This will project contains N blocks…"

# Polish

- Give user feedback when exporting a project save file (currently an a tag with download)
- Make toasts stay when hovering
- When no projects exist, create and open a new project automatically without landing on the project
  - Is this even desirable?
- Add date input to date input instead of just text input
- Toggle auto save in menu bar (move light mode as well?)
- Rework project card to be a button to edit project (+ mini preview of blocks/episodes like v3 cards)
- Save indicator in editor (when saving, saved, error)
- Polish the command line output of the play files (`play.sh` / `play.ps1`) so it's as easy as possible to parse what is happening at a glance: clear now-playing/queued lines, which block is active and when the next one starts, visible countdown while waiting, and warnings that stand out from normal status

# Features

- [ ] Over-the-air in-place updates so people don't have to re-download from GitHub (`tauri-plugin-updater`)
  - Needs a signing keypair and a `latest.json` manifest — GitHub Releases can host both, but the release must be published (not draft) for the updater to see it
  - Updater supports NSIS on Windows but **not** `.deb` on Linux — add an AppImage bundle target if Linux should self-update too
- [ ] On home screen, index folder for episodes with fuzzy search to prefill when given a schedule
- [ ] Re-encode to h264 by default but allow for other strategies like "preserve", "h264", "h265" ...
- [ ] Run ffmpeg to grab previews throughout all the episodes to visually validate the project
- [ ] On export, show a summery view of the project
- [x] Compile `.sh` and `.ps1` simultaneously
- [ ] In runtime save progress per episode to be able to resume playback after interruption
- [ ] When playing a playlist "too late" in the day, do a more graceful skip to the correct block and episode (episode times manifest?)
- [ ] Put more than 3 hours of pauses before the playlist and after every block
