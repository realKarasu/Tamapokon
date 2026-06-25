// Paramètres d'équilibrage — pensés « doux » : on doit pouvoir ignorer la créature
// 1–2 h sans drame (cf. spec). Tout est en TEMPS APP-ACTIF (ticks), jamais en temps calendaire.

import type { Species, Stage } from "./types";

/** Un tick toutes les 4 s, uniquement quand l'app est active (fenêtre visible). */
export const TICK_MS = 4000;

/** ~30 h de temps app-actif pour 100 % d'incubation, si l'œuf est gardé bien au chaud. */
const INCUBATION_HOURS = 30;
export const INCUBATION_TICKS = (INCUBATION_HOURS * 3600 * 1000) / TICK_MS;
/** Gain d'incubation par tick à chaleur maximale (warmth = 100). */
export const INCUBATION_RATE = 100 / INCUBATION_TICKS;
/** La chaleur de l'œuf décroît un peu chaque tick ; le soin la fait remonter. */
export const WARMTH_DECAY = 0.5;

/** Décroissance des jauges par tick (douce). */
export const DECAY = {
  hunger: 0.12,
  treat: 0.08,
  energy: 0.06,
  cleanliness: 0.05,
} as const;

/** Au-delà de ce délai sans interaction (en temps app-actif), le bonheur baisse (solitude). */
export const LONELY_AFTER_MS = 8 * 60 * 1000;

/** Plafond du temps de réveil « offline » mis en scène (le reste est ignoré). */
export const WAKE_ANIM_CAP_MS = 3 * 60 * 1000;

/** XP nécessaire pour passer du niveau n au niveau n+1. */
export function xpForLevel(level: number): number {
  return 20 + level * 12;
}

/** Étape d'évolution dérivée du niveau (cf. table de la spec). */
export function stageForLevel(level: number): Stage {
  if (level >= 18) return "adult";
  if (level >= 10) return "teen";
  if (level >= 5) return "child";
  return "baby";
}

interface SpeciesInfo {
  label: string;
  emoji: string;
  /** Couleur pastel dominante (halo/accent derrière le sprite). */
  color: string;
  favorite: string;
  /** Sprite pixel-art (généré via PixelLab), servi depuis static/. */
  sprite: string;
}

export const SPECIES: Record<Species, SpeciesInfo> = {
  mochi: { label: "Mochi", emoji: "🌸", color: "#ffc9de", favorite: "dango", sprite: "/sprites/creatures/mochi.png" },
  braisille: { label: "Braisille", emoji: "🔥", color: "#ffcaa8", favorite: "baies épicées", sprite: "/sprites/creatures/braisille.png" },
  axolo: { label: "Axolo", emoji: "💧", color: "#b6ead9", favorite: "gelée d'algue", sprite: "/sprites/creatures/axolo.png" },
  sylphe: { label: "Sylphe", emoji: "🌿", color: "#d9d2f5", favorite: "baies sucrées", sprite: "/sprites/creatures/sylphe.png" },
};

export const ALL_SPECIES: Species[] = ["mochi", "braisille", "axolo", "sylphe"];

/** Teintes pastel des 4 œufs (cosmétique). */
export const EGG_COLORS = ["#f7b8d6", "#bfe0f7", "#c3eccb", "#e6cdf2"] as const;

/** Sprite d'œuf (pixel-art) pour une apparence donnée. */
export function eggSprite(skin: number): string {
  return `/sprites/eggs/egg-${skin}.png`;
}

/** Chemin d'une icône pixel (UI). */
export function iconSrc(name: string): string {
  return `/sprites/icons/${name}.png`;
}
/** Chemin d'une humeur pixel (bulle de la créature). */
export function moodSrc(name: string): string {
  return `/sprites/moods/${name}.png`;
}
