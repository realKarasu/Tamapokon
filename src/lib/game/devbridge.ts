// Pont d'événements entre la fenêtre DEV (séparée) et la fenêtre principale du jeu.
// Les deux fenêtres ont des contextes JS isolés : le panneau dev N'ÉCRIT PAS directement
// l'état du jeu, il émet des actions que la fenêtre principale écoute et applique.

/** Action déclenchée depuis la fenêtre dev. */
export type DevAction =
  | { type: "timeScale"; value: number }
  | { type: "skipIncubation" }
  | { type: "addXp"; value: number }
  | { type: "evolveNext" }
  | { type: "drain" }
  | { type: "fill" }
  | { type: "previewLevelUp" }
  | { type: "previewEvolve" }
  | { type: "reset" };

const EVENT = "dev:action";

/** Émis depuis la fenêtre dev. */
export async function emitDevAction(action: DevAction): Promise<void> {
  try {
    const { emit } = await import("@tauri-apps/api/event");
    await emit(EVENT, action);
  } catch {
    /* hors Tauri */
  }
}

/** Écouté par la fenêtre principale. Retourne une fonction de désinscription. */
export async function listenDevActions(handler: (a: DevAction) => void): Promise<() => void> {
  try {
    const { listen } = await import("@tauri-apps/api/event");
    return await listen<DevAction>(EVENT, (e) => handler(e.payload));
  } catch {
    return () => {};
  }
}
