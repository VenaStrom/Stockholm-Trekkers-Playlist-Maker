# Parity with v3 (Electron)

- [x] Block options UI: per-block dropdown to toggle leading/trailing clips (countdown, emergency, covid, sign-in reminder) with option dots in the block header — data model and export already support this, only the UI is missing
  - [x] Reconcile saved options against the current clip catalog on load (carry over checked state) so renamed/removed clips degrade gracefully
  - [x] Settings panel (gear in header) where the default options for new blocks are user-definable (persisted in localStorage)
- [x] Export feedback: real progress, a working cancel (terminate + delete partial folder), and error/cancelled/success end states with an open-folder button (currently "[No feedback implemented yet]")
- [x] Export validation: block export on missing episode files (currently warn + skip) and on missing date; confirm before overwriting an existing export folder (`export-project.ts` TODO)
- [x] Import save file (native picker, overwrite confirm) + migration from the v3 save format (see `old-save-file.json`)
  - Auto-migration sweeps `$HOME/stockholm-trekkers-playlist-maker/user-data/save-files` on launch (non-destructive, marker file tracks progress)
- [x] Editor validation warnings: duplicate and overlapping block times, invalid/very early/very late/non-5-min times, past/weekday/far-future dates (+ easter eggs: 47, 17:01, 2063-04-05 🖖)
- [x] Flush save on close/quit — Ctrl+Q is an immediate exit and can lose the 500 ms debounce window
- [x] Ctrl+S manual save
- [x] CI: build + draft-release workflows (no `.github/` on this branch)
- [x] Installer: keep-save-files prompt on uninstall, preserve user data on update (v3 `installer.nsh` behavior)
  - Tauri's NSIS keeps appdata by default (`deleteAppDataOnUninstall: false`), so v4 needs no custom installer script
- [x] Play scripts: kill pre-existing VLC instances and show a "VLC not found, install it" message like v3's ps1
  - ps1 also probes the default `C:\Program Files\VideoLAN\VLC` install dirs since VLC is rarely on PATH on Windows

# Bugs

- [x] Delete-project dialog copy: "This will project contains N blocks…"

# Polish

- [ ] Give user feedback when exporting a project save file (currently an a tag with download)
- [ ] Make toasts stay when hovering
- [ ] When no projects exist, create and open a new project automatically without landing on the project
  - [ ] Is this even desirable?
- [ ] Add date input to date input instead of just text input
- [x] Toggle auto save in menu bar (move light mode as well?)
  - Lives in the settings dialog (the app has no native menu bar); light mode stays as the header button
- [x] Rework project card to be a button to edit project (+ mini preview of blocks/episodes like v3 cards)
  - Card stays a plain card (decided against whole-card button); shows description + v3-style block/episode preview; export button sized like the other actions
- [ ] Save indicator in editor (when saving, saved, error)
- [x] Polish the command line output of the play files (`play.sh` / `play.ps1`) so it's as easy as possible to parse what is happening at a glance: clear now-playing/queued lines, which block is active and when the next one starts, visible countdown while waiting, and warnings that stand out from normal status
- [x] the outputted project save file should be relative to bundle root, not the device dependant absolute paths of assets.
- [ ] Size:
  - [x] show estimated export size in GB before starting the export
  - [ ] show which disks have enough space to export to (maybe? not sure if this it too handholdy without real benefit)
  - [x] show exported size in GB (kept separate from the estimate so zipped output can diverge)
- [x] confirm leave when unsaved changes exist (autosave off): Back / Alt+left / close ask Save-and-leave / Leave-without-saving / Cancel
- [x] setting to zip output
  - Checkbox on the export confirmation (default on); Rust `zip_export` streams sources straight into `<date>.zip` (stored media entries + zip64, deflated scripts), no staging folder
- [ ] make all checkboxes consistent and clearly a checkbox. Either a check mark, or maybe a star fleet delta as the check.

# Features

- [x] Over-the-air in-place updates so people don't have to re-download from GitHub (`tauri-plugin-updater`)
  - Keypair at `~/.tauri/stplay-updater.key` (no password) — add `TAURI_SIGNING_PRIVATE_KEY` (+ empty `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`) as GitHub Actions secrets before running the Release workflow
  - Release workflow publishes (non-draft) with `latest.json`; AppImage target added for Linux self-update (deb stays for apt-style installs)
- [ ] On home screen, index folder for episodes with fuzzy search to prefill when given a schedule
- [ ] Re-encode to h264 by default but allow for other strategies like "preserve", "h264", "h265" ...
- [ ] Run ffmpeg to grab previews throughout all the episodes to visually validate the project
- [ ] On export, show a summery view of the project
- [x] Compile `.sh` and `.ps1` simultaneously
- [ ] In runtime save progress per episode to be able to resume playback after interruption
- [ ] When playing a playlist "too late" in the day, do a more graceful skip to the correct block and episode (episode times manifest?)
- [x] Put more than 3 hours of pauses before the playlist and after every block (both are 8 x 30 min = 4 h)
