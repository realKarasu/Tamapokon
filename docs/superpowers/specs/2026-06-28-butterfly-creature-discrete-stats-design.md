# Tamapokon — Créature papillon/moth + jauges discrètes

**Date:** 2026-06-28
**Status:** Approved (design)

## Goal

Remplacer la créature pixel-art « Requinou » (4 sprites PNG par stade) par les
8 SVG fournis par le joueur : un **Moth** duveteux et un **Papillon** élégant,
chacun avec 4 expressions (`normal`, `happy`, `sad`, `sleep`). Le visage de la
créature traduit désormais son humeur. En parallèle, **rendre les 5 jauges
discrètes** : masquées par défaut, révélées au survol (ou focus) d'un petit
badge d'humeur.

## Créature : forme + expression

Deux axes indépendants pilotent le sprite affiché :

- **Forme** (métamorphose, dérivée de l'étape/niveau) :
  - `moth` aux stades `baby`/`child` (niv 1–9)
  - `papillon` aux stades `teen`/`adult` (niv 10+)
  - La métamorphose visuelle tombe au niv 10 ; les seuils d'évolution existants
    (`stageForLevel`) sont **inchangés**.
- **Expression** (humeur, dérivée de l'état) — `MoodFace` :

  | État du jeu | Expression |
  |---|---|
  | endormi (`asleep`) | `sleep` |
  | détresse : faim<20 **ou** bonheur<30 **ou** énergie<20 **ou** propreté<20 | `sad` |
  | bonheur>75 | `happy` |
  | sinon | `normal` |

Sprite = `/sprites/creatures/{form}-{face}.svg`. Le filtre couleur
(`morphFilter(colorMorph)`, tiré aléatoirement à l'éclosion) continue de
s'appliquer sur l'`<img>` → variantes menthe/ciel/lavande/rose en surprise.

## Jauges discrètes

- La rangée des 5 `StatBar` toujours visible est **supprimée**.
- Un petit **badge d'humeur** (icône pixel existante : `hungry`/`grumpy`/
  `sleepy`/`dirty`/`zzz`/`happy`, avec fallback emoji) reste dans le coin
  haut-droit de la créature. Il indique la *raison* précise de l'humeur.
- **Au survol — ou focus clavier — du badge**, un panneau flottant révèle les
  5 jauges (`StatBar`), puis se cache à la sortie. Un pont invisible
  (`::before`) couvre l'espace badge↔panneau pour que le survol ne se rompe pas.
- Le badge devient un `<button type="button">` **sorti** du bouton « câlin »
  (pas de boutons imbriqués). Le clic-câlin et le glisser de la créature
  (`data-tauri-drag-region`) restent intacts. Le `:focus-within` rend le panneau
  accessible au clavier et au tactile (clic = focus = révélation).

## Assets

- Ajout dans `static/sprites/creatures/` :
  `moth-{normal,happy,sad,sleep}.svg`, `papillon-{normal,happy,sad,sleep}.svg`
  (viewBox `0 0 128 128`, servis comme `<img src>` → pas de collision de classes).
- Suppression des anciens `creatures/{baby,child,teen,adult}.png` (plus utilisés).
- Œuf, icônes et humeurs PNG : **conservés**.

## Code changes

- **`types.ts`** — ajout `CreatureForm = "moth" | "papillon"` et
  `MoodFace = "normal" | "happy" | "sad" | "sleep"`.
- **`config.ts`** — remplacer `STAGE_SPRITES`/`stageSprite` par
  `creatureForm(stage)` + `creatureSprite(form, face)`. `CREATURE` : `label`
  → « Papillon », `favorite` → « le nectar des fleurs », `color` (halo) →
  lavande douce.
- **`Creature.svelte`** — calcule `form` + `face` ; sprite via `creatureSprite` ;
  restructure le badge d'humeur + popover de jauges (révélé au survol/focus) ;
  retire le bloc `.stats` permanent.
- **`Hatching.svelte`** — sprite via `creatureSprite("moth", "happy")`.

## Out of scope

- Seuils/niveaux d'évolution (inchangés).
- Nouvelles jauges ou mécaniques de jeu.
- Renommage des `colorMorph` (les libellés « Roux »… restent ; seul le filtre
  compte visuellement).

## Verification

- `pnpm check` (svelte-check) sans erreur TypeScript après remplacement de
  `stageSprite`.
- Flux complet : éclosion → révèle le **moth** (happy) → humeurs changent le
  visage (faim → sad, dodo → sleep, bonheur élevé → happy) → niv 10 →
  métamorphose en **papillon**.
- Jauges masquées par défaut, révélées au survol du badge, cachées à la sortie.
