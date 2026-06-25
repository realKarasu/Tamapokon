// Cœur de jeu réactif (Svelte 5 runes).
//
// ⚠️ Principe central : le temps n'avance QUE quand l'app est active (fenêtre visible et
// non mise en pause). Quand on masque/quitte → plus aucune décroissance. Au retour, on
// reprend tel quel, sans appliquer le temps écoulé hors-app.

import type { ColorMorph, Corner, EggSkin, GameState, Stats } from "./types";
import type { DevAction } from "./devbridge";
import {
  ALL_MORPHS,
  DECAY,
  INCUBATION_RATE,
  LONELY_AFTER_MS,
  TICK_MS,
  WARMTH_DECAY,
  stageForLevel,
  xpForLevel,
} from "./config";
import { loadState, saveState } from "./persistence";
import { cornerPosition, onMoved, setPosition } from "./overlay";
import { applyAcrylic, applyAlwaysOnTop } from "./effects";

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

function defaultState(): GameState {
  return {
    version: 2,
    phase: "choosing",
    eggSkin: null,
    warmth: 0,
    incubation: 0,
    colorMorph: null,
    name: "",
    stage: "egg",
    level: 1,
    xp: 0,
    stats: { hunger: 80, treat: 60, energy: 90, happiness: 80, cleanliness: 90 },
    asleep: false,
    corner: "bottom-right",
    pos: null,
    settings: { alwaysOnTop: true, acrylic: false, opacity: 1 },
    lastActiveAt: Date.now(),
    lastInteractionAt: Date.now(),
  };
}

/** État global réactif. Les composants lisent/écrivent via cet objet. */
export const game = $state<GameState>(defaultState());

/**
 * Effets visuels transitoires (NON persistés) : déclenchés sur level-up / évolution.
 * Les composants lisent `fx.levelUp` / `fx.evolve` pour jouer une anim.
 */
export const fx = $state<{ levelUp: boolean; evolve: boolean; lastLevel: number }>({
  levelUp: false,
  evolve: false,
  lastLevel: 0,
});

/** Réglages de debug (build dev uniquement) : accélération du temps. */
export const dev = $state<{ timeScale: number }>({ timeScale: 1 });

let levelFxTimer: ReturnType<typeof setTimeout> | null = null;
let evolveFxTimer: ReturnType<typeof setTimeout> | null = null;

function flashLevelUp() {
  fx.levelUp = true;
  if (levelFxTimer) clearTimeout(levelFxTimer);
  levelFxTimer = setTimeout(() => (fx.levelUp = false), 1400);
}
function flashEvolve() {
  fx.evolve = true;
  if (evolveFxTimer) clearTimeout(evolveFxTimer);
  evolveFxTimer = setTimeout(() => (fx.evolve = false), 1800);
}

let timer: ReturnType<typeof setInterval> | null = null;
let paused = false;
let ticksSinceSave = 0;
let ready = false;
let savePosTimer: ReturnType<typeof setTimeout> | null = null;
let unlistenMoved: (() => void) | null = null;

/** Mémorise la nouvelle position (débounce) → la fenêtre reste où on l'a relâchée. */
function persistPosition(pos: { x: number; y: number }) {
  game.pos = pos;
  if (savePosTimer) clearTimeout(savePosTimer);
  savePosTimer = setTimeout(() => void save(), 500);
}

function assign(next: GameState) {
  Object.assign(game, next);
  // Au chargement : on IGNORE le temps offline. On se contente de réancrer les timestamps.
  game.lastActiveAt = Date.now();
  game.lastInteractionAt = Date.now();
}

/** Met à niveau une sauvegarde ancienne (v1 : champ `species`) vers le schéma courant. */
function migrate(saved: Record<string, unknown>): Partial<GameState> {
  const next = { ...saved } as Record<string, unknown>;
  if ("species" in next) delete next.species; // l'espèce n'existe plus
  if (next.colorMorph == null) next.colorMorph = "ginger"; // variante par défaut
  next.version = 2;
  return next as Partial<GameState>;
}

/** À appeler une fois au démarrage de l'app. */
export async function init(): Promise<void> {
  if (ready) return;
  const saved = await loadState();
  if (saved)
    assign({
      ...defaultState(),
      ...migrate(saved as unknown as Record<string, unknown>),
      stats: { ...defaultState().stats, ...saved.stats },
      settings: { ...defaultState().settings, ...saved.settings },
    });
  ready = true;
  // Applique les réglages overlay au démarrage.
  void applyAlwaysOnTop(game.settings.alwaysOnTop);
  void applyAcrylic(game.settings.acrylic);
  // Restaure la position EXACTE mémorisée (ou le coin par défaut au tout premier lancement).
  const target = game.pos ?? (await cornerPosition(game.corner));
  if (target) await setPosition(target);
  // Mémorise toute position où l'utilisateur déplace ensuite la fenêtre.
  unlistenMoved = await onMoved(persistPosition);
  start();
}

function start() {
  if (timer) return;
  timer = setInterval(tick, TICK_MS);
}

/** Pause logique : aucune décroissance (utilisé quand on masque l'overlay). */
export function pause() {
  paused = true;
  game.lastActiveAt = Date.now();
  void save();
}

export function resume() {
  paused = false;
  game.lastActiveAt = Date.now();
}

function tick() {
  // Temps app-actif uniquement : on saute le tick si en pause ou fenêtre masquée/minimisée.
  if (paused || (typeof document !== "undefined" && document.hidden)) return;

  if (game.phase === "incubating") tickIncubation();
  else if (game.phase === "alive") tickAlive();

  game.lastActiveAt = Date.now();
  if (++ticksSinceSave >= 15) {
    ticksSinceSave = 0;
    void save();
  }
}

function tickIncubation() {
  const k = dev.timeScale; // accélérateur dev (x1 en prod)
  game.warmth = clamp(game.warmth - WARMTH_DECAY * k);
  // Le soin conditionne l'éclosion : la progression dépend de la chaleur.
  game.incubation = clamp(game.incubation + INCUBATION_RATE * (game.warmth / 100) * k);
  if (game.incubation >= 100) hatch();
}

function tickAlive() {
  const k = dev.timeScale; // accélérateur dev (x1 en prod)
  const s = game.stats;
  s.hunger = clamp(s.hunger - DECAY.hunger * k);
  s.treat = clamp(s.treat - DECAY.treat * k);
  s.cleanliness = clamp(s.cleanliness - DECAY.cleanliness * k);

  if (game.asleep) {
    s.energy = clamp(s.energy + 0.3 * k);
    if (s.energy >= 100) game.asleep = false; // réveil naturel
  } else {
    s.energy = clamp(s.energy - DECAY.energy * k);
    if (s.energy <= 0) game.asleep = true; // s'endort tout seul
  }

  // Bonheur : baisse avec la faim, la saleté et la solitude (en temps app-actif).
  let dh = 0;
  if (s.hunger < 20) dh -= 0.1;
  if (s.cleanliness < 20) dh -= 0.1;
  if (Date.now() - game.lastInteractionAt > LONELY_AFTER_MS) dh -= 0.05;
  s.happiness = clamp(s.happiness + dh);
}

// ---- Progression ----

function grantXp(base: number) {
  // Une créature heureuse progresse mieux.
  const factor = 0.5 + game.stats.happiness / 200; // 0.5 → 1.0
  game.xp += Math.round(base * factor);
  applyLevelUps();
}

/** Applique les passages de niveau (et déclenche les anims level-up / évolution). */
function applyLevelUps() {
  const prevStage = game.stage;
  let leveled = false;
  while (game.xp >= xpForLevel(game.level)) {
    game.xp -= xpForLevel(game.level);
    game.level += 1;
    leveled = true;
  }
  game.stage = stageForLevel(game.level);
  if (leveled) flashLevelUp();
  if (game.stage !== prevStage) flashEvolve();
}

function touch() {
  game.lastInteractionAt = Date.now();
}

// ---- Phase œuf ----

export function chooseEgg(skin: EggSkin) {
  game.eggSkin = skin;
  game.phase = "incubating";
  game.warmth = 60;
  game.incubation = 0;
  game.stage = "egg";
  void save();
}

/** Réchauffer l'œuf (le garder au chaud). */
export function warmEgg() {
  game.warmth = clamp(game.warmth + 25);
  touch();
}

/** Câliner l'œuf. */
export function cuddleEgg() {
  game.warmth = clamp(game.warmth + 12);
  game.incubation = clamp(game.incubation + INCUBATION_RATE * 2);
  touch();
}

function hatch() {
  game.colorMorph = ALL_MORPHS[Math.floor(Math.random() * ALL_MORPHS.length)] as ColorMorph;
  game.phase = "hatching";
  void save();
}

/** Valide l'éclosion : on nomme la créature et la vie commence. */
export function confirmHatch(name: string) {
  game.name = name.trim() || "Pokon";
  game.phase = "alive";
  game.level = 1;
  game.xp = 0;
  game.stage = "baby";
  game.stats = { hunger: 80, treat: 60, energy: 90, happiness: 90, cleanliness: 100 };
  game.asleep = false;
  touch();
  void save();
}

// ---- Interactions (phase alive) ----

export function feed() {
  if (game.asleep) return;
  game.stats.hunger = clamp(game.stats.hunger + 30);
  game.stats.happiness = clamp(game.stats.happiness + 5);
  grantXp(4);
  touch();
}

export function giveTreat() {
  if (game.asleep) return;
  game.stats.treat = clamp(game.stats.treat + 30);
  game.stats.happiness = clamp(game.stats.happiness + 8);
  grantXp(3);
  touch();
}

export function play() {
  if (game.asleep || game.stats.energy < 12) return;
  game.stats.happiness = clamp(game.stats.happiness + 12);
  game.stats.energy = clamp(game.stats.energy - 10);
  game.stats.hunger = clamp(game.stats.hunger - 5);
  grantXp(8);
  touch();
}

export function pet() {
  if (game.asleep) return;
  game.stats.happiness = clamp(game.stats.happiness + 6);
  grantXp(2);
  touch();
}

export function wash() {
  if (game.asleep) return;
  game.stats.cleanliness = 100;
  game.stats.happiness = clamp(game.stats.happiness + 4);
  grantXp(2);
  touch();
}

export function toggleSleep() {
  game.asleep = !game.asleep;
  touch();
}

// ---- Overlay ----

/** Raccourci : repositionne l'overlay dans un coin, puis mémorise cette position. */
export async function setCorner(corner: Corner) {
  game.corner = corner;
  const pos = await cornerPosition(corner);
  if (pos) {
    await setPosition(pos);
    game.pos = pos;
  }
  await save();
}

export function setAlwaysOnTop(on: boolean) {
  game.settings.alwaysOnTop = on;
  void applyAlwaysOnTop(on);
  void save();
}

export function setAcrylic(on: boolean) {
  game.settings.acrylic = on;
  void applyAcrylic(on);
  void save();
}

/** Opacité du FOND uniquement (0 = fond transparent, 1 = opaque). Sauvegarde débouncée. */
export function setOpacity(value: number) {
  game.settings.opacity = Math.max(0, Math.min(1, value));
  if (savePosTimer) clearTimeout(savePosTimer);
  savePosTimer = setTimeout(() => void save(), 400);
}

/** Nettoyage (retire l'écoute des déplacements). */
export function dispose() {
  if (unlistenMoved) unlistenMoved();
  unlistenMoved = null;
  if (timer) clearInterval(timer);
  timer = null;
}

// ---- Outils DEV (build dev uniquement — voir DevPanel.svelte) ----

/** Multiplicateur de vitesse du temps (x1 = normal). Clampé 1..200. */
export function setTimeScale(value: number) {
  dev.timeScale = Math.max(1, Math.min(200, Math.round(value)));
}

/** Fait éclore l'œuf immédiatement (si en incubation). */
export function devSkipIncubation() {
  if (game.phase !== "incubating") return;
  game.incubation = 100;
  hatch();
}

/** Ajoute de l'XP (déclenche level-up / évolution si seuils franchis). */
export function devAddXp(amount: number) {
  if (game.phase !== "alive") return;
  game.xp += amount;
  applyLevelUps();
  void save();
}

/** Saute directement à l'étape d'évolution suivante. */
export function devEvolveNext() {
  if (game.phase !== "alive") return;
  const next = [5, 10, 18].find((l) => l > game.level);
  if (!next) return;
  game.level = next;
  game.xp = 0;
  applyLevelUps();
  void save();
}

/** Force la valeur d'une jauge (0..100). */
export function devSetStat(key: keyof Stats, value: number) {
  game.stats[key] = clamp(value);
}

/** Rejoue une animation isolément (sans changer l'état) pour la tester. */
export function devPreviewLevelUp() {
  flashLevelUp();
}
export function devPreviewEvolve() {
  flashEvolve();
}

/** Vide les jauges pour tester les humeurs (faim, grognon, fatigué, sale). */
export function devDrain() {
  devSetStat("hunger", 15);
  devSetStat("energy", 15);
  devSetStat("cleanliness", 15);
  devSetStat("happiness", 20);
}
/** Remplit toutes les jauges. */
export function devFill() {
  (["hunger", "treat", "energy", "happiness", "cleanliness"] as (keyof Stats)[]).forEach((k) =>
    devSetStat(k, 100),
  );
}

/** Applique une action reçue de la fenêtre dev (voir devbridge.ts). */
export function applyDevAction(a: DevAction) {
  switch (a.type) {
    case "timeScale":
      setTimeScale(a.value);
      break;
    case "skipIncubation":
      devSkipIncubation();
      break;
    case "addXp":
      devAddXp(a.value);
      break;
    case "evolveNext":
      devEvolveNext();
      break;
    case "drain":
      devDrain();
      break;
    case "fill":
      devFill();
      break;
    case "previewLevelUp":
      devPreviewLevelUp();
      break;
    case "previewEvolve":
      devPreviewEvolve();
      break;
    case "reset":
      resetGame();
      break;
  }
}

/** Repart de zéro (nouvel œuf) en conservant les préférences d'overlay. */
export function resetGame() {
  const keep = { corner: game.corner, pos: game.pos, settings: { ...game.settings } };
  assign({ ...defaultState(), ...keep });
  dev.timeScale = 1;
  void save();
}

// ---- Sauvegarde ----

export async function save(): Promise<void> {
  game.lastActiveAt = Date.now();
  await saveState($state.snapshot(game));
}
