# Tamapokon — Single Evolving Creature ("Requinou") + Pixel Emoji

**Date:** 2026-06-25
**Status:** Approved (design)

## Goal

Replace the current 4-random-species system with **one** creature — a ginger
kitten wearing a plush shark hood — that visibly **evolves** across its life
stages and **changes color**. Replace **all** Unicode emoji in the UI with
PixelLab-generated pixel-art icons.

Reference: a chibi ginger kitten in an oversized blue shark hoodie, sitting,
front-facing, underwater pastel scene (user-provided image).

## Constraints

- **PixelLab budget: ~32 generations** remaining (trial, $0 credits). The plan
  must fit in budget (~23 used) and leave headroom (~9) for re-rolls. If budget
  runs low, prioritize in this order: creature stages → functional icons →
  mood emotes → decorative (confetti/sparkles).
- Existing stack unchanged: Tauri 2 + Svelte 5 (runes), French UI, overlay that
  only advances time while the window is visible.
- Existing pixel-art conventions: `image-rendering: pixelated`, transparent PNGs
  served from `static/sprites/`, creatures ~92px, eggs ~64px.

## Creature concept & evolution ("shark-side awakens")

The single creature is internally referenced as **Requinou** (label shown at
hatch; the player still names their own pet, default "Pokon"). Each of the four
life stages gets its **own** sprite — unlike today, where every stage reuses one
sprite. Stage is derived from level exactly as today
(`stageForLevel`: baby <5, child 5–9, teen 10–17, adult 18+).

| Stage | Level | Sprite direction |
|---|---|---|
| **Bébé** (baby) | 1–4 | Tiny round ginger kitten almost entirely swallowed by an oversized soft baby-blue plush shark hood; only face + paws peek out; huge eyes; max chibi. Palette: soft ginger + baby blue + cream. |
| **Petit** (child) | 5–9 | A bit bigger, sitting up; hood fits better; a small dorsal fin now visible on its back; one tiny fang; curious. Palette: brighter ginger + teal hood. |
| **Ado** (teen) | 10–17 | Half-cat / half-shark: real side fins, tail becoming a shark tail, sharper eyes, two small fangs; hood merged into body markings. Palette: deeper teal/ocean gradient + ginger stripes. |
| **Adulte** (adult) | 18+ | Majestic shark-cat: full dorsal fin, shark tail, gill marks, confident pose, ocean-gradient body (teal→deep blue) with faint glow. Palette: deep ocean gradient + glowing accents. |

All four are front-facing single-view sprites (the overlay never rotates the
creature), generated to match the reference style.

## Color ("both")

1. **Per-stage palette** — baked into each stage sprite (the ginger→ocean
   progression above). No extra generations.
2. **Random color morph at hatch** — one of `ginger | mint | sky | lavender |
   rose`, chosen randomly in `hatch()` and stored on the save. Rendered as a CSS
   `filter: hue-rotate(...) saturate(...)` on the creature `<img>`. Costs **0**
   generations and inherits the "surprise reveal" role the random species used
   to play. `ginger` is the identity (no filter).

## Asset inventory (~23 generations)

Saved as transparent PNGs:

- `static/sprites/creatures/` — `baby.png`, `child.png`, `teen.png`, `adult.png` (4)
- `static/sprites/eggs/` — `egg.png` (1 themed shark-egg: blue, spotted, tiny
  fin). The four old cosmetic egg skins collapse to this one sprite; the
  selection screen offers a few **CSS-tinted** color choices of the same sprite
  (the old "no hint" joke no longer applies with a single creature).
- `static/sprites/icons/` (12): `meat`, `cake`, `moon`, `heart`, `soap`,
  `fishtoy`, `sun`, `fire`, `snowflake`, `sparkle`, `star`, `gear`.
- `static/sprites/moods/` (6): `happy`, `hungry`, `grumpy`, `sleepy`, `dirty`, `zzz`.

### Emoji → asset mapping

| Old emoji | Where | New asset |
|---|---|---|
| 🍖 | hunger stat + feed button | `icons/meat` |
| 🍰 | treat stat + treat button | `icons/cake` |
| 😴 | energy stat + sleep button | `icons/moon` |
| ❤️ / 🤍 | happiness stat / cuddle egg | `icons/heart` (cuddle = white-tinted) |
| 🧼 | cleanliness stat + wash button | `icons/soap` |
| 🎮 | play button | `icons/fishtoy` |
| ☀️ | wake button | `icons/sun` |
| 🔥 | warm egg + incubation bar | `icons/fire` |
| 🥶 | cold egg warning | `icons/snowflake` |
| 🥚 | incubation bar | reuse `eggs/egg` (scaled) |
| 🎉 ✨ ⭐ 🎊 💫 | level-up confetti | `icons/sparkle` + `icons/star` |
| ✨ 🌟 | level/evolution banners | `icons/sparkle` / `icons/star` |
| ⚙️ | settings | `icons/gear` |
| 😊 / 🙂 | content / ok mood | `moods/happy` |
| 😖 | hungry mood | `moods/hungry` |
| 😒 | grumpy mood | `moods/grumpy` |
| 🥱 | tired mood | `moods/sleepy` |
| 🫧 | dirty mood | `moods/dirty` |
| 😴 / 💤 | asleep mood / sleep bubble | `moods/zzz` |

Kept as-is (structural / dev-only, not "emoji" in the gameplay sense): `×`
(close), `↖↗↙↘` (corner arrows), `🛠` (dev-window button, dev build only),
`🤫` egg-select hint (dropped with the egg-choice rework).

## Code changes

- **`types.ts`** — remove `Species`; add `ColorMorph` type; keep `Stage`,
  `EggSkin` may be simplified/removed. Add `colorMorph` to `GameState`; remove
  `species` (migrated away).
- **`config.ts`** — remove `SPECIES` / `ALL_SPECIES`; add:
  - `CREATURE` info (`label: "Requinou"`, `favorite`, base `color`).
  - `STAGE_SPRITES: Record<Exclude<Stage,"egg">, string>` + `stageSprite(stage)`.
  - `COLOR_MORPHS: Record<ColorMorph, { label; filter }>` + `ALL_MORPHS`.
  - `iconSrc(name)` / `moodSrc(name)` path helpers; keep `eggSprite`.
- **`state.svelte.ts`** — `hatch()` picks a random `colorMorph` (not a species);
  `defaultState()` gains `colorMorph`; drop species. Bump save `version` to 2
  with a migration: old saves with `species` set → keep `phase`/stats, assign a
  default `colorMorph`, drop `species`.
- **New `Icon.svelte`** — `{ name, kind?: "icon"|"mood", size? }` → renders an
  `<img class="pixel">` from the right folder.
- **`StatBar.svelte`** — `icon` prop becomes an icon **name** → renders `Icon`.
- **`Creature.svelte`** — sprite = `stageSprite(game.stage)` with the color-morph
  CSS filter; mood bubble, tool buttons, confetti, banners use `Icon`.
- **`Incubation.svelte`** — fire / cold / cuddle-heart / egg use `Icon`.
- **`EggSelect.svelte`** — single egg sprite with a few CSS-tinted choices;
  drop the hint emoji.
- **`Hatching.svelte`** — show the **baby** sprite with the chosen color morph;
  copy becomes "Voici Requinou !".
- **`Settings.svelte`** — gear uses `Icon`.

## Asset pipeline

PixelLab MCP generates async (returns a job id; poll `get_*`). Single-view
front-facing sprites are generated with the object-creation tool (transparent
background), then downloaded and written into `static/sprites/...`.

**Risk control — validate before batch:** the **first** implementation step
generates exactly **one** sprite end-to-end (the baby creature) to (a) lock the
art style against the reference and (b) confirm the generate → fetch PNG →
`static/` pipeline works. Only after that succeeds do we batch-generate the
remaining ~22 assets. This caps wasted budget at 1 generation if the approach
needs adjustment.

## Testing / verification

- App builds and runs (`pnpm` dev) with no TypeScript errors after the
  `Species` removal + migration.
- A fresh save runs the full flow: choose egg → incubate → hatch (reveals baby +
  a random color morph) → evolve through child/teen/adult (sprite changes at
  each threshold).
- An **existing** save (with `species`) loads without crashing (migration).
- No Unicode gameplay emoji remain in the rendered UI; all replaced by pixel
  PNGs (visual check + grep for emoji in components).

## Out of scope

- Multiple creatures / species (explicitly dropped).
- New gameplay mechanics, stats, or balancing changes.
- Walk/idle directional animations (overlay shows a single front view).
