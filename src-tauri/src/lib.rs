#[tauri::command]
fn close() {
  std::process::exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![close])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
