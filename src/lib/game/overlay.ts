// Positionnement de l'overlay (cross-platform via l'API Tauri).
//
// Comportement voulu : la fenêtre est librement déplaçable et reste EXACTEMENT là où
// on la relâche, même après des interactions et après redémarrage. Le sélecteur de coin
// n'est qu'un raccourci qui repositionne puis mémorise la position.

import type { Corner } from "./types";

const MARGIN = 16; // marge logique par rapport au bord

type Pos = { x: number; y: number };

/** Position physique courante de la fenêtre, ou null hors Tauri. */
export async function getPosition(): Promise<Pos | null> {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const p = await getCurrentWindow().outerPosition();
    return { x: p.x, y: p.y };
  } catch {
    return null;
  }
}

/** Déplace la fenêtre à une position physique exacte. No-op hors Tauri. */
export async function setPosition(pos: Pos): Promise<void> {
  try {
    const { getCurrentWindow, PhysicalPosition } = await import("@tauri-apps/api/window");
    await getCurrentWindow().setPosition(new PhysicalPosition(Math.round(pos.x), Math.round(pos.y)));
  } catch {
    /* hors Tauri */
  }
}

/** Calcule la position physique correspondant à un coin de l'écran courant. */
export async function cornerPosition(corner: Corner): Promise<Pos | null> {
  try {
    const { getCurrentWindow, currentMonitor } = await import("@tauri-apps/api/window");
    const monitor = await currentMonitor();
    if (!monitor) return null;
    const size = await getCurrentWindow().outerSize();
    const m = Math.round(MARGIN * monitor.scaleFactor);

    const left = monitor.position.x + m;
    const top = monitor.position.y + m;
    const right = monitor.position.x + monitor.size.width - size.width - m;
    const bottom = monitor.position.y + monitor.size.height - size.height - m;

    const map: Record<Corner, Pos> = {
      "top-left": { x: left, y: top },
      "top-right": { x: right, y: top },
      "bottom-left": { x: left, y: bottom },
      "bottom-right": { x: right, y: bottom },
    };
    return map[corner];
  } catch {
    return null;
  }
}

/** Écoute les déplacements de la fenêtre ; rappelle avec la nouvelle position physique. */
export async function onMoved(cb: (pos: Pos) => void): Promise<() => void> {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    return await getCurrentWindow().onMoved(({ payload }) => cb({ x: payload.x, y: payload.y }));
  } catch {
    return () => {};
  }
}
