
#[tauri::command]
fn close() {
  println!("Closing application");
  std::process::exit(0);
}

#[tauri::command]
async fn delete_project(project_id: String) -> Result<(), String> {
  println!("Deleting project with ID: {}", project_id);
  let project_path = std::path::Path::new("projects").join(&project_id);
  if project_path.exists() {
    std::fs::remove_dir_all(&project_path)
      .map_err(|e| format!("Failed to delete project directory: {}", e))?;
  } else {
    return Err(format!(
      "Project directory does not exist: {}",
      project_path.display()
    ));
  }
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
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
