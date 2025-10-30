use std::fs::create_dir_all;

#[tauri::command]
fn close() {
  println!("Closing application");
  std::process::exit(0);
}

#[tauri::command]
async fn make_app_dir_folder(folder_name: String, app_dir: String) -> Result<(), String> {
  // Create the application directory folder
  println!("Creating app data dir folder: {}", folder_name);

  let full_path = std::path::Path::new(&app_dir).join(&folder_name).join(".target");

  create_dir_all(full_path).map_err(|e| format!("Failed to create directory: {}", e))?;
  Ok(())
}

#[tauri::command]
async fn delete_project(project_id: String) -> Result<(), String> {
  println!("Deleting project with ID: {}", project_id);
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      close,
      delete_project,
      make_app_dir_folder
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
