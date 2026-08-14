# Headless CLI

The app doubles as a headless CLI: launched with a subcommand it runs without
showing a window, prints a single JSON result line to stdout, and exits with
code 0 on success or 1 on failure. This is primarily meant for scripting and
for letting AI assistants create and modify playlists.

## Invocation

```sh
# Installed binary
stockholm-trekkers-playlist-maker <command> [flags]

# From the repo during development (args after the second `--` reach the app)
yarn tauri dev -- -- <command> [flags]
```

Log lines share stdout with the result but are prefixed (`[INFO]...` or ANSI
color codes), so the result is the line starting with `{`:

```sh
stockholm-trekkers-playlist-maker list | grep '^{' | jq
```

## Commands

| Command | Flags | Effect |
| --- | --- | --- |
| `help` | | Print usage and the spec format with all valid option keys |
| `list` | | List all projects (meta only) |
| `show` | `--project <id>` | Print one full project as JSON |
| `create` | `[--spec <file.json>]` | Create a project, optionally filling it from a spec |
| `apply` | `--project <id> --spec <file.json>` | Apply a spec to an existing project |
| `delete` | `--project <id>` | Delete a project |
| `export` | `--project <id> --out <dir> [--zip] [--encoding preserve\|h264\|hevc]` | Export a playlist bundle (overwrites an existing bundle) |

Flag aliases: `--project` / `-p` / `--id` / `--project-id`, `--out` / `-o` / `--output`,
`--spec` / `-s` / `--file`. Both `--flag value` and `--flag=value` work.

## Spec files

A spec is a JSON description of a playlist. All fields are optional; omitted
fields are left untouched on `apply`. A `blocks` array **replaces** all
existing blocks and episodes in the project.

```json
{
  "date": "2026-09-12",
  "description": "TNG night",
  "blocks": [
    {
      "startTime": "18:00",
      "options": { "leading__countdown": true, "leading__sign_in_reminder": true },
      "episodes": [
        "/absolute/path/episode1.mkv",
        { "file": "/absolute/path/episode2.mkv" }
      ]
    }
  ]
}
```

- `date` and `startTime` accept the same lenient formats as the editor
  (`"1915"` becomes `"19:15"`), and are stored normalized.
- `options` keys are `<placement>__<clipID>` (run `help` for the full list);
  unset options fall back to the user's saved defaults, unknown keys are
  ignored with a warning.
- `episodes` play in order within their block. Files must exist — each one is
  probed with ffprobe on apply (results are cached per file path, so
  re-applying is fast), and episode start/end times are computed from the
  block's `startTime`.

The result JSON includes the saved project and a `warnings` array with the
same non-blocking sanity checks the editor shows (date in the past, block
overlap, odd times, ...). Warnings never fail the command.

## Typical assistant workflow

```sh
app list                                   # find or check existing projects
app create --spec my-playlist.json         # spec -> ready project in one step
app show -p <id>                           # inspect what got saved
app apply -p <id> --spec my-playlist.json  # iterate on the same project
app export -p <id> -o /path/to/usb-stick   # produce the playable bundle
```
