// Sauvegarde locale via le plugin store de Tauri (fichier JSON dans le dossier app-data).
//
// ⚠️ Principe central : à chaque sauvegarde on stocke un timestamp, mais au chargement
// on N'APPLIQUE PAS le temps écoulé hors-app. La créature « dort » avec le joueur.

import type { GameState } from "./types";

const STORE_FILE = "tamapokon.json";
const KEY = "state";

type StoreLike = {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  save(): Promise<void>;
};

let storePromise: Promise<StoreLike | null> | null = null;

/** Charge le store Tauri si disponible (sinon null → fallback mémoire, ex. en dev navigateur). */
async function getStore(): Promise<StoreLike | null> {
  if (!storePromise) {
    storePromise = (async () => {
      try {
        const { load } = await import("@tauri-apps/plugin-store");
        return (await load(STORE_FILE, { autoSave: false, defaults: {} })) as unknown as StoreLike;
      } catch {
        return null; // pas dans Tauri (ou plugin indisponible)
      }
    })();
  }
  return storePromise;
}

export async function loadState(): Promise<GameState | null> {
  const store = await getStore();
  if (!store) return null;
  try {
    const saved = await store.get<GameState>(KEY);
    return saved ?? null;
  } catch {
    return null;
  }
}

export async function saveState(state: GameState): Promise<void> {
  const store = await getStore();
  if (!store) return;
  try {
    await store.set(KEY, state);
    await store.save();
  } catch {
    // best-effort : on ne casse jamais le jeu pour une erreur d'écriture
  }
}
