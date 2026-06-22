// Effets de fenêtre cross-platform (acrylique / vibrancy) + always-on-top.
// L'acrylique n'est visible que parce que la fenêtre est transparente : le CSS de la
// « pièce » devient translucide quand l'acrylique est actif (voir +page.svelte).

/** Applique (ou retire) un fond acrylique adapté à l'OS. No-op hors Tauri / Linux. */
export async function applyAcrylic(enabled: boolean): Promise<void> {
  try {
    const { getCurrentWindow, Effect } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    if (!enabled) {
      await win.clearEffects();
      return;
    }
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    let effect: import("@tauri-apps/api/window").Effect | null = null;
    if (ua.includes("Mac")) effect = Effect.HudWindow; // matériau vibrancy macOS
    else if (ua.includes("Windows")) effect = Effect.Acrylic; // Windows 10/11
    // Linux : pas d'acrylique fiable → on laisse le fond CSS opaque.
    if (effect) await win.setEffects({ effects: [effect] });
    else await win.clearEffects();
  } catch {
    /* hors Tauri / effet indisponible */
  }
}

/** Active/désactive le « toujours au-dessus ». No-op hors Tauri. */
export async function applyAlwaysOnTop(enabled: boolean): Promise<void> {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().setAlwaysOnTop(enabled);
  } catch {
    /* hors Tauri */
  }
}
