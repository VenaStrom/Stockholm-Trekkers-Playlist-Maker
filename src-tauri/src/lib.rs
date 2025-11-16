use hf;
use std::fs::create_dir_all;

#[tauri::command]
fn close() {
  println!("Closing application");
  std::process::exit(0);
}

#[tauri::command]
async fn mkdir(dir_path: String, hidden: bool) -> Result<(), String> {
  // Create the application directory folder
  println!("Creating app data dir folder: {}", dir_path);

  let full_path = std::path::Path::new(&dir_path);

  // If it already exists, nothing to do
  if full_path.exists() {
    return Ok(());
  }

  create_dir_all(&full_path).map_err(|e| format!("Failed to create directory: {}", e))?;

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
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![close, mkdir,])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
