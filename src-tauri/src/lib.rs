use hf;
use std::fmt::Arguments;
use std::fs::create_dir_all;
use tauri_plugin_log::fern::FormatCallback;
use tauri_plugin_log::log::Record;
use tauri_plugin_log::{RotationStrategy, Target, TargetKind, TimezoneStrategy};
use time::macros::format_description;
use time::OffsetDateTime;

fn compact_log_target(raw_target: &str) -> String {
  // Keep only the last identifier and trim noisy line/column suffixes.
  // Example:
  // webview:info@http://localhost:1420/node_modules/.vite/deps/@tauri-apps_plugin-log.js:179:12
  // ->
  // webview:info@tauri-apps_plugin-log.js:179:12
  let Some((prefix, target)) = raw_target.split_once('@') else {
    return raw_target.to_string();
  };

  let target = target.trim();
  if target.is_empty() {
    return raw_target.to_string();
  }

  // Remove query/fragment noise and keep only the final path segment.
  let target = target.split(['?', '#']).next().unwrap_or(target);
  let target = target
    .rsplit(['/', '\\'])
    .find(|segment| !segment.is_empty())
    .unwrap_or(target);
  let target = target.strip_prefix('@').unwrap_or(target);

  format!("{prefix}@{target}")
}

fn daily_log_file_name() -> String {
  let now = OffsetDateTime::now_local().unwrap_or_else(|_| OffsetDateTime::now_utc());
  let date_format = format_description!("[year]-[month]-[day]");
  let date = now
    .format(&date_format)
    .unwrap_or_else(|_| "unknown-date".to_string());

  format!("app_{date}")
}

fn format_log_record(out: FormatCallback, message: &Arguments, record: &Record, use_color: bool) {
  let now = OffsetDateTime::now_local().unwrap_or_else(|_| OffsetDateTime::now_utc());
  let date_time_format = format_description!("[year]-[month]-[day] [hour]:[minute]:[second]");
  let timestamp = now
    .format(&date_time_format)
    .unwrap_or_else(|_| "unknown-date 00:00:00".to_string());

  let level = record.level();
  let target = compact_log_target(record.target());

  if use_color {
    let level_color = match level {
      log::Level::Trace => "90", // bright black / gray
      log::Level::Debug => "36", // cyan
      log::Level::Info => "32",  // green
      log::Level::Warn => "33",  // yellow
      log::Level::Error => "31", // red
    };

    // Keep metadata visually quiet while leaving the message content unchanged.
    out.finish(format_args!(
      "\x1b[{level_color}m[{level}]\x1b[0m\x1b[90m[{timestamp}]\x1b[0m {message} \x1b[90m{target}\x1b[0m"
    ));
    return;
  }

  out.finish(format_args!("[{level}][{timestamp}][{target}] {message}"));
}

#[tauri::command]
fn close() {
  log::info!("Closing application");
  std::process::exit(0);
}

#[tauri::command]
fn get_cli_args() -> Vec<String> {
  std::env::args().collect()
}

#[tauri::command]
async fn mkdir(dir_path: String, hidden: Option<bool>) -> Result<(), String> {
  // Create the application directory folder
  log::info!("Creating app data dir folder: {}", dir_path);

  let full_path = std::path::Path::new(&dir_path);

  // If it already exists, nothing to do
  if full_path.exists() {
    return Ok(());
  }

  create_dir_all(&full_path).map_err(|e| format!("Failed to create directory: {}", e))?;

  // Treat missing `hidden` argument as false by default
  let hidden = hidden.unwrap_or(false);

  if hidden {
    // Don't attempt to hide if it's already hidden; surface errors instead of unwrap/panic
    match hf::is_hidden(&full_path) {
      Ok(true) => {
        // If already hidden, nothing to do
        return Ok(());
      }
      Ok(false) => {
        hf::hide(&full_path)
          .map_err(|e| format!("Failed to hide directory '{}': {}", dir_path, e))?;
      }
      Err(e) => {
        return Err(format!(
          "Failed to determine hidden state for '{}': {}",
          dir_path, e
        ));
      }
    }
  }

  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let log_file_name = daily_log_file_name();

  tauri::Builder::default()
    .plugin(
      tauri_plugin_log::Builder::new()
        .level(log::LevelFilter::Info)
        .timezone_strategy(TimezoneStrategy::UseLocal)
        .clear_format()
        .rotation_strategy(RotationStrategy::KeepAll)
        .max_file_size(1024 * 1024)
        .targets([
          Target::new(TargetKind::LogDir {
            file_name: Some(log_file_name),
          })
          .format(|out, message, record| format_log_record(out, message, record, false)),
          Target::new(TargetKind::Stdout)
            .format(|out, message, record| format_log_record(out, message, record, true)),
          Target::new(TargetKind::Webview)
            .format(|out, message, record| format_log_record(out, message, record, false)),
        ])
        .build(),
    )
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .invoke_handler(tauri::generate_handler![close, get_cli_args, mkdir,])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
