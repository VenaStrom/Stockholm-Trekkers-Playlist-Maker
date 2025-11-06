use std::fs::create_dir_all;

#[tauri::command]
fn close() {
  println!("Closing application");
  std::process::exit(0);
}

#[tauri::command]
async fn mkdir(dir_path: String) -> Result<(), String> {
  // Create the application directory folder
  println!("Creating app data dir folder: {}", dir_path);

  let full_path = std::path::Path::new(&dir_path).join(".target");

  create_dir_all(full_path).map_err(|e| format!("Failed to create directory: {}", e))?;

  // Hide the folder on Windows
  #[cfg(target_os = "windows")]
  {
    use std::fs;
    use std::os::windows::fs::MetadataExt;
    let metadata = fs::metadata(std::path::Path::new(&app_dir).join(&dir_path))
      .map_err(|e| format!("Failed to get metadata: {}", e))?;
    let mut permissions = metadata.permissions();
    permissions.set_readonly(true);
    fs::set_permissions(std::path::Path::new(&app_dir).join(&dir_path), permissions)
      .map_err(|e| format!("Failed to set permissions: {}", e))
  }
  // On linux and macOS, prefixing the folder name with a dot should suffice to hide it
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
