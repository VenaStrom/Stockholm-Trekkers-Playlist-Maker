use hf;
use std::fs::create_dir_all;
use time::macros::format_description;
use time::OffsetDateTime;
use tauri_plugin_log::{RotationStrategy, Target, TargetKind, TimezoneStrategy};

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
        .format(|out, message, record| {
          let now = OffsetDateTime::now_local().unwrap_or_else(|_| OffsetDateTime::now_utc());
          let time_format = format_description!("[hour]:[minute]:[second]");
          let time = now
            .format(&time_format)
            .unwrap_or_else(|_| "00:00:00".to_string());

          let level = record.level();
          let target = compact_log_target(record.target());

          out.finish(format_args!("[{time}][{level}][{target}] {message}"));
        })
        .rotation_strategy(RotationStrategy::KeepAll)
        .max_file_size(1024 * 1024)
        .targets([
          Target::new(TargetKind::LogDir {
            file_name: Some(log_file_name),
          }),
          Target::new(TargetKind::Stdout),
          Target::new(TargetKind::Webview),
        ])
        .build(),
    )
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![close, get_cli_args, mkdir,])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
