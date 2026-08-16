#!/usr/bin/env pwsh

# Functions
function print {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsIn
  )

  if (-not $ArgsIn) {
    return
  }

  $codes = @()
  $index = 0
  while ($index -lt $ArgsIn.Length -and $ArgsIn[$index] -match '^[0-9]+([;][0-9]+)*$') {
    $codes += $ArgsIn[$index]
    $index++
  }

  $text = if ($index -lt $ArgsIn.Length) { $ArgsIn[$index] } else { "" }
  # Only \n is used as an escape; Regex.Unescape would throw on backslashes in paths like C:\Program Files
  $text = $text.Replace('\n', "`n")

  $ansiEsc = [char]27
  if ($codes.Count -gt 0) {
    $seq = ($codes | ForEach-Object { "$ansiEsc[$_" + "m" }) -join ""
    Write-Host -NoNewline ($seq + $text + "$ansiEsc[0m")
  }
  else {
    Write-Host -NoNewline $text
  }
}

# ANSI color codes
$RED = 31
$GREEN = 32
$YELLOW = 33
$BLUE = 34
$MAGENTA = 35
$CYAN = 36
$WHITE = 37
$GRAY = 90
$BOLD = 1
$ITALIC = 3
$UNDERLINE = 4
$VLC_BASE_ARGS = @("--one-instance", "--fullscreen", "--sub-language=swe,eng,any", "--deinterlace=0", "--embedded-video", "--no-loop", "--no-play-and-pause", "--no-random", "--no-repeat", "--no-video-title-show", "--qt-auto-raise=0", "--qt-continue=0", "--qt-fullscreen-screennumber=1", "--qt-notification=0", "--no-qt-fs-controller", "--no-qt-name-in-title", "--no-qt-recentplay", "--no-qt-privacy-ask")
$VLC_LOG_FILE = "./vlc.log"

function log_vlc_line {
  param([string]$Line)

  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -Path $VLC_LOG_FILE -Value "[$timestamp] $Line"
}

function run_vlc {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$VlcArgs
  )

  log_vlc_line "CMD: vlc $($VlcArgs -join ' ')"
  & vlc @VlcArgs 2>&1 | ForEach-Object {
    log_vlc_line "$_"
  }
  $exitCode = $LASTEXITCODE
  log_vlc_line "EXIT: $exitCode"
  return $exitCode
}

function ensure_vlc_installed {
  if (Get-Command vlc -ErrorAction SilentlyContinue) {
    return
  }

  # VLC installs are usually not on PATH on Windows, so probe the default locations
  $defaultDirs = @(
    "C:\Program Files\VideoLAN\VLC",
    "C:\Program Files (x86)\VideoLAN\VLC"
  )
  foreach ($dir in $defaultDirs) {
    if (Test-Path (Join-Path $dir "vlc.exe")) {
      $env:PATH = "$dir;" + $env:PATH
      print "$GRAY" "Found VLC at $dir\n"
      return
    }
  }

  print "$BOLD" "$RED" "VLC was not found on this computer.\n"
  print "Install VLC from https://www.videolan.org/ and run this script again.\n"
  exit 1
}

function kill_existing_vlc {
  $procs = Get-Process -Name vlc -ErrorAction SilentlyContinue
  if ($procs) {
    print "$BOLD" "$YELLOW" "WARNING: VLC is already running. Closing it so the playlist starts from a clean slate...\n"
    $procs | Stop-Process -Force
    Start-Sleep -Seconds 2
  }
}

function ensure_vlc_running {
  $ensureArgs = @($VLC_BASE_ARGS + @("--playlist-enqueue", "--no-playlist-autostart"))
  log_vlc_line "CMD(BG): vlc $($ensureArgs -join ' ')"
  try {
    $proc = Start-Process -FilePath "vlc" -ArgumentList $ensureArgs -PassThru
    log_vlc_line "STARTED(BG): pid=$($proc.Id)"
  }
  catch {
    log_vlc_line "START_FAILED(BG): $($_.Exception.Message)"
  }
  Start-Sleep -Seconds 1
}

function play {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsIn
  )

  $silent = $false
  $index = 0
  while ($index -lt $ArgsIn.Length -and ($ArgsIn[$index] -eq "silent=true" -or $ArgsIn[$index] -eq "--silent")) {
    $silent = $true
    $index++
  }

  $file = if ($index -lt $ArgsIn.Length) { $ArgsIn[$index] } else { "" }
  if (-not $silent) {
    print "$GREEN" "> Now playing: "
    print "$file\n"
  }

  run_vlc @VLC_BASE_ARGS $file | Out-Null
  Start-Sleep -Seconds 1
}

function enqueue {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsIn
  )

  $silent = $false
  $index = 0
  while ($index -lt $ArgsIn.Length -and ($ArgsIn[$index] -eq "silent=true" -or $ArgsIn[$index] -eq "--silent")) {
    $silent = $true
    $index++
  }

  $file = if ($index -lt $ArgsIn.Length) { $ArgsIn[$index] } else { "" }
  if (-not $silent) {
    print "$GRAY" "  + Queued: $file\n"
  }

  run_vlc @VLC_BASE_ARGS "--playlist-enqueue" $file | Out-Null
  Start-Sleep -Seconds 1
}

function long_pause {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsIn
  )

  $playNow = $false
  foreach ($arg in $ArgsIn) {
    if ($arg -eq "play=true") {
      $playNow = $true
    }
  }

  print "$GRAY" "Queueing pause filler (8 x 30 min = 4 h)\n"
  if ($playNow) {
    play silent=true "clips/30_min_pause.mp4"
  }
  else {
    enqueue silent=true "clips/30_min_pause.mp4"
  }

  enqueue silent=true "clips/30_min_pause.mp4"
  enqueue silent=true "clips/30_min_pause.mp4"
  enqueue silent=true "clips/30_min_pause.mp4"
  enqueue silent=true "clips/30_min_pause.mp4"
  enqueue silent=true "clips/30_min_pause.mp4"
  enqueue silent=true "clips/30_min_pause.mp4"
  enqueue silent=true "clips/30_min_pause.mp4"
}

function wait_until {
  param(
    [string]$time_string, # Examples: "10:10", "10:10:30", or "10:10.30"
    [string]$label = "Playback"
  )

  if ($time_string -match '^([0-9]{1,2}):([0-9]{2})([:.]([0-9]{2}))?$') {
    $hour = [int]$Matches[1]
    $minute = [int]$Matches[2]
    $second = if ($Matches[4]) { [int]$Matches[4] } else { 0 }

    if ($hour -gt 23 -or $minute -gt 59 -or $second -gt 59) {
      print "$BOLD" "$YELLOW" "WARNING: Invalid time value '$time_string'. Expected HH:MM, HH:MM:SS, or HH:MM.SS. Continuing without waiting.\n"
      return
    }

    $targetTime = (Get-Date).Date.AddHours($hour).AddMinutes($minute).AddSeconds($second)
    if ((Get-Date) -ge $targetTime) {
      print "$BOLD" "$YELLOW" "WARNING: $label was scheduled for $time_string, which has already passed. Continuing immediately.\n"
      return
    }

    $ansiEsc = [char]27
    while ((Get-Date) -lt $targetTime) {
      $remaining = $targetTime - (Get-Date)
      $countdown = "{0:hh\:mm\:ss}" -f $remaining
      $nowClock = Get-Date -Format "HH:mm:ss"
      # Live countdown, redrawn in place on one line
      Write-Host -NoNewline ("`r$ansiEsc[K$ansiEsc[36m$label starts at $time_string$ansiEsc[0m$ansiEsc[90m - in $countdown (clock: $nowClock)$ansiEsc[0m")
      Start-Sleep -Seconds 1
    }
    Write-Host -NoNewline ("`r$ansiEsc[K")
    print "$GREEN" "Reached $time_string - starting $label.\n"
  }
  else {
    print "$BOLD" "$YELLOW" "WARNING: Invalid time format '$time_string'. Expected HH:MM, HH:MM:SS, or HH:MM.SS. Continuing without waiting.\n"
  }
}

print "\n"
print "$BOLD" "This file was generated by Stockholm Trekkers Playlist Maker, made by __SIGN_OFF_NAME__.\n"
print "$GRAY" "# Author: __AUTHOR__\n"
print "$GRAY" "# Playlist maker version: __APP_VERSION__\n"
print "$GRAY" "# Repository: __REPO_URL__\n"
print "$GRAY" "# Contact: __EMAIL__\n"
print "$GRAY" "# Options revision: __OPTIONS_REV__\n"
print "$GRAY" "# Playlist date: __PLAYLIST_DATE__\n"
print "$GRAY" "# Created date: __CREATED_DATE__\n"
print "$GRAY" "# Export date: __EXPORTED_DATE__\n"
print "$GRAY" "# Playlist ID: __PLAYLIST_ID__\n"
print "$GRAY" "# Block count: __BLOCK_COUNT__\n"
print "$GRAY" "# Episode count: __EPISODE_COUNT__\n"

print "$BOLD" "$YELLOW" "\n!!NOTICE!!\n"
print "- Copy playlist folder to the computer.\n"
print "- Check the computers time and timezone settings.\n"
print "- Keep this computer disconnected from the internet for security.\n"
print "\n"
print "$GRAY" "VLC logs will be written to $VLC_LOG_FILE\n"

print "Waiting 3 seconds...\n"
Start-Sleep -Seconds 3

# Ensure VLC is installed, close stray instances, then start ours ready for control commands
ensure_vlc_installed
kill_existing_vlc
ensure_vlc_running

print "Embedded description:\n"
__DESCRIPTION_CODE__
print "\n\n"

# Constructed "schedule" from the playlist data
print "Parsed playlist\n"
__PARSED_PLAYLIST_CODE__
print "\n\n"

# Playback logic
print "Starting playback...\n\n"
print "Leading pause block to have something to display\n"
long_pause play=true
print "\n"

__BLOCKS_CODE__

print "$BOLD" "Playlist ended. No more blocks to play.\n"
print "You may now exit VLC and this script.\n\n"
print "Have a nice evening! :3\n"
print "/ __SIGN_OFF_NAME__ $([char]27)[31m<3$([char]27)[0m\n"