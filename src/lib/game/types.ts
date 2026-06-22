// Modèle de données de Tamapokon.
// Voir docs/Spécification Tamagotchi.md pour les règles produit.

/** Les 4 espèces possibles (tirées au hasard à l'éclosion). */
export type Species = "mochi" | "braisille" | "axolo" | "sylphe";

/** Étapes d'évolution (cf. table « Évolution en 5 étapes »). */
export type Stage = "egg" | "baby" | "child" | "teen" | "adult";

/** Apparence d'œuf — purement cosmétique, aucun indice sur la créature. */
export type EggSkin = 0 | 1 | 2 | 3;

/** Coin de l'écran où poser l'overlay. */
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Phase du parcours de jeu. */
export type Phase = "choosing" | "incubating" | "hatching" | "alive";

/** Réglages de l'overlay. */
export interface Settings {
  /** Toujours au-dessus des autres fenêtres. */
  alwaysOnTop: boolean;
  /** Fond acrylique (flou translucide de l'OS) — Windows/macOS. */
  acrylic: boolean;
  /** Opacité globale de l'overlay (0.3 → 1). */
  opacity: number;
}

/** Les jauges à gérer (0..100). */
export interface Stats {
  /** Faim 🍖 — besoin vital. */
  hunger: number;
  /** Gourmandise 🍰 — envie de sucré. */
  treat: number;
  /** Sommeil / énergie 😴. */
  energy: number;
  /** Bonheur ❤️ — moteur de l'XP. */
  happiness: number;
  /** Propreté 🧼. */
  cleanliness: number;
}

export interface GameState {
  /** Version du schéma de sauvegarde (migrations futures). */
  version: number;
  phase: Phase;

  /** Œuf choisi (cosmétique). */
  eggSkin: EggSkin | null;
  /** Chaleur de l'œuf 0..100 — décroît, remontée par le soin ; conditionne l'éclosion. */
  warmth: number;
  /** Progression d'incubation 0..100. */
  incubation: number;

  /** Espèce révélée à l'éclosion (aléatoire). */
  species: Species | null;
  /** Nom donné par le joueur. */
  name: string;

  stage: Stage;
  level: number;
  xp: number;
  stats: Stats;
  asleep: boolean;

  /** Coin de l'écran par défaut (raccourci du sélecteur de coin). */
  corner: Corner;
  /**
   * Position exacte de l'overlay en pixels physiques.
   * Mémorisée à chaque déplacement → la fenêtre reste là où on l'a relâchée,
   * et est restaurée telle quelle au lancement (jamais re-snappée par une interaction).
   */
  pos: { x: number; y: number } | null;

  /** Réglages utilisateur (overlay). */
  settings: Settings;

  /**
   * Timestamp (ms) de la dernière activité.
   * ⚠️ Principe central : le temps offline est IGNORÉ pour la décroissance.
   * On le stocke uniquement pour une éventuelle petite anim de réveil.
   */
  lastActiveAt: number;
  /** Dernière interaction (ms) — pour la baisse de bonheur due à la solitude, en temps app-actif. */
  lastInteractionAt: number;
}
