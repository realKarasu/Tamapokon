// Point d'entrée de l'app Tamapokon (Tauri 2).
// Cross-platform : Windows, macOS, Linux. La fenêtre est configurée dans tauri.conf.json
// (frameless, transparente, always-on-top, déplaçable).
//
// Les commandes Rust (#[tauri::command]) — boucle de jeu, sauvegarde avec pause hors-app,
// détection de l'app au premier plan — viendront se brancher ici via `invoke_handler`.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
