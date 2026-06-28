// Paramètres d'équilibrage — pensés « doux » : on doit pouvoir ignorer la créature
// 1–2 h sans drame (cf. spec). Tout est en TEMPS APP-ACTIF (ticks), jamais en temps calendaire.

import type { ColorMorph, CreatureForm, MoodFace, Stage } from "./types";

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

/** La créature unique du jeu (le joueur la renomme ; défaut « Pokon »). */
export const CREATURE = {
  label: "Papillon",
  favorite: "le nectar des fleurs",
  /** Halo pastel derrière le sprite. */
  color: "#e3d2f7",
} as const;

/**
 * Forme visuelle selon l'étape : moth duveteux aux stades bébé/petit (niv 1–9),
 * puis métamorphose en papillon aux stades ado/adulte (niv 10+).
 */
export function creatureForm(stage: Stage): CreatureForm {
  return stage === "teen" || stage === "adult" ? "papillon" : "moth";
}

/** Sprite SVG de la créature selon sa forme et son expression d'humeur. */
export function creatureSprite(form: CreatureForm, face: MoodFace): string {
  return `/sprites/creatures/${form}-${face}.svg`;
}

export interface MorphInfo {
  label: string;
  /** Filtre CSS appliqué au sprite (« none » pour le roux d'origine). */
  filter: string;
}
export const COLOR_MORPHS: Record<ColorMorph, MorphInfo> = {
  ginger: { label: "Roux", filter: "none" },
  mint: { label: "Menthe", filter: "hue-rotate(110deg) saturate(0.95)" },
  sky: { label: "Ciel", filter: "hue-rotate(165deg) saturate(1.05)" },
  lavender: { label: "Lavande", filter: "hue-rotate(225deg) saturate(1)" },
  rose: { label: "Rose", filter: "hue-rotate(310deg) saturate(1.1)" },
};
export const ALL_MORPHS: ColorMorph[] = ["ginger", "mint", "sky", "lavender", "rose"];

/** Filtre CSS de la variante de couleur (vide si aucune). */
export function morphFilter(m: ColorMorph | null): string {
  return m ? COLOR_MORPHS[m].filter : "none";
}

/** Sprite unique de l'œuf (les « skins » ne sont plus que des teintes CSS). */
export const EGG_SPRITE = "/sprites/eggs/egg.png";
export function eggSprite(_skin?: number): string {
  return EGG_SPRITE;
}
/** Teinte cosmétique de l'œuf au choix (0 = d'origine). */
const EGG_TINTS = ["none", "hue-rotate(120deg) saturate(1.1)", "hue-rotate(255deg)"] as const;
export function eggTint(skin: number): string {
  return EGG_TINTS[skin] ?? "none";
}

/** Chemin d'une icône pixel (UI). */
export function iconSrc(name: string): string {
  return `/sprites/icons/${name}.png`;
}
/** Chemin d'une humeur pixel (bulle de la créature). */
export function moodSrc(name: string): string {
  return `/sprites/moods/${name}.png`;
}
