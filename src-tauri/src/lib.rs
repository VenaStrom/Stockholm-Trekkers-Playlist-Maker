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

  create_dir_all(&full_path).map_err(|e| format!("Failed to create directory: {}", e))?;

  if !hidden {
    return Ok(());
  }
  hf::hide(&full_path).unwrap();
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
