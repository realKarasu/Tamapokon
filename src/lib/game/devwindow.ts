// Ouvre le panneau de debug dans une FENÊTRE séparée (route /dev), pour pouvoir tester
// confortablement sans encombrer l'overlay. No-op hors Tauri.

export async function openDevWindow(): Promise<void> {
  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const existing = await WebviewWindow.getByLabel("dev");
    if (existing) {
      await existing.show();
      await existing.setFocus();
      return;
    }
    new WebviewWindow("dev", {
      url: "/dev",
      title: "Tamapokon — Dev",
      width: 300,
      height: 470,
      resizable: true,
      decorations: true,
      alwaysOnTop: true,
    });
  } catch {
    /* hors Tauri */
  }
}
