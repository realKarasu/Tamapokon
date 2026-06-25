# Single Evolving Creature ("Requinou") + Pixel Emoji — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 4-random-species system with one creature (kitten-in-a-shark-hood) that visibly evolves across 4 stages and changes color, and replace every Unicode gameplay emoji with PixelLab pixel-art icons.

**Architecture:** Code-first, assets-last. Tasks 1–4 refactor the data model and UI so the app fully works using a new `Icon` component that **falls back to the original Unicode emoji when a PNG is missing**. Tasks 5–6 then generate the PixelLab assets (cheap creatures first, the 20–40-gen icon batch last) which progressively upgrade the visuals. This ordering guarantees a working build at every step and makes the limited PixelLab budget non-fatal.

**Tech Stack:** Tauri 2, SvelteKit + Svelte 5 (runes), TypeScript, `@tauri-apps/plugin-store`, PixelLab MCP. No unit-test framework exists; verification is `pnpm check` (svelte-check + tsc), `pnpm build`, manual run, `grep`, and `mcp__pixellab__get_balance`.

## Global Constraints

- **UI language is French.** All user-facing copy in French; match existing tone.
- **Svelte 5 runes** (`$state`, `$derived`, `$props`) — follow existing components.
- **Time only advances while the window is visible** — do not touch the tick/pause logic.
- **Pixel rendering:** all sprites use `image-rendering: pixelated` (already global for `img`/`.pixel`).
- **PixelLab budget ≤ 32 generations, $0 credits.** `create_character` = 1 gen each; one `create_1_direction_object` batch = 20–40 gens total. Check `get_balance` before any batch; never fire an unaffordable call.
- **Color morph `ginger` = identity (no CSS filter).** Other morphs are CSS `filter` only.
- **Assets are transparent PNGs** served from `static/sprites/{creatures,eggs,icons,moods}/`.
- **No new gameplay mechanics, stats, or balancing.** Stage thresholds stay: baby <5, child 5–9, teen 10–17, adult 18+.
- **Commit in French**, ending each message with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 1: `Icon` component with Unicode fallback

The single most-reused new unit. Renders a pixel PNG; if the file is absent (not yet generated, or never will be) it shows the original Unicode emoji so the UI never breaks.

**Files:**
- Create: `src/lib/components/Icon.svelte`
- Modify: `src/lib/game/config.ts` (add `iconSrc`, `moodSrc` helpers)

**Interfaces:**
- Produces: `iconSrc(name: string): string` → `/sprites/icons/${name}.png`; `moodSrc(name: string): string` → `/sprites/moods/${name}.png`.
- Produces: `Icon.svelte` props `{ name: string; kind?: "icon" | "mood"; fallback: string; size?: number }`. Renders an `<img>`; on load error, swaps to a `<span>` showing `fallback`.

- [ ] **Step 1: Add path helpers to `config.ts`**

Append to `src/lib/game/config.ts`:

```ts
/** Chemin d'une icône pixel (UI). */
export function iconSrc(name: string): string {
  return `/sprites/icons/${name}.png`;
}
/** Chemin d'une humeur pixel (bulle de la créature). */
export function moodSrc(name: string): string {
  return `/sprites/moods/${name}.png`;
}
```

- [ ] **Step 2: Create `Icon.svelte`**

```svelte
<script lang="ts">
  import { iconSrc, moodSrc } from "$lib/game/config";

  let {
    name,
    kind = "icon",
    fallback,
    size = 16,
  }: { name: string; kind?: "icon" | "mood"; fallback: string; size?: number } = $props();

  // Si le PNG n'existe pas encore (asset non généré), on retombe sur l'emoji Unicode.
  let failed = $state(false);
  const src = $derived(kind === "mood" ? moodSrc(name) : iconSrc(name));
</script>

{#if failed}
  <span class="emoji" style:font-size={`${size}px`}>{fallback}</span>
{:else}
  <img
    class="pixel ico"
    src={src}
    alt={fallback}
    style:width={`${size}px`}
    style:height={`${size}px`}
    onerror={() => (failed = true)}
  />
{/if}

<style>
  .ico {
    object-fit: contain;
    display: inline-block;
    vertical-align: middle;
  }
  .emoji {
    line-height: 1;
    display: inline-block;
    vertical-align: middle;
  }
</style>
```

- [ ] **Step 3: Verify it typechecks**

Run: `pnpm check`
Expected: no new errors referencing `Icon.svelte` or `config.ts` (a pre-existing clean tree should stay at 0 errors).

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/Icon.svelte src/lib/game/config.ts
git commit -m "Composant Icon (pixel + repli emoji Unicode)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Data model — drop `Species`, add `ColorMorph` + stage sprites + save migration

Replaces the 4-species concept with one creature, a per-save random color morph, and stage-keyed sprites. Adds a v2 save migration so existing saves (which have `species`) load without crashing.

**Files:**
- Modify: `src/lib/game/types.ts`
- Modify: `src/lib/game/config.ts`
- Modify: `src/lib/game/state.svelte.ts`

**Interfaces:**
- Consumes: `Stage` from `types.ts`; `stageForLevel`, `xpForLevel` from `config.ts` (unchanged).
- Produces (`types.ts`): `export type ColorMorph = "ginger" | "mint" | "sky" | "lavender" | "rose";` and `GameState.colorMorph: ColorMorph | null` (replacing `species`).
- Produces (`config.ts`): `CREATURE` const; `stageSprite(stage: Stage): string`; `COLOR_MORPHS: Record<ColorMorph, { label: string; filter: string }>`; `ALL_MORPHS: ColorMorph[]`; `morphFilter(m: ColorMorph | null): string`; `EGG_SPRITE: string`; `eggSprite(skin?: number): string`; `eggTint(skin: number): string`.
- Produces (`state.svelte.ts`): `hatch()` sets `game.colorMorph` randomly; `migrate()` upgrades old saves.

- [ ] **Step 1: Edit `types.ts`**

Replace the `Species` type declaration:

```ts
/** Espèce unique du jeu : variante de couleur tirée à l'éclosion. */
export type ColorMorph = "ginger" | "mint" | "sky" | "lavender" | "rose";
```

(Delete the old `export type Species = "mochi" | "braisille" | "axolo" | "sylphe";` line.)

In `GameState`, replace the species field:

```ts
  /** Variante de couleur révélée à l'éclosion (aléatoire). */
  colorMorph: ColorMorph | null;
```

(Delete `species: Species | null;` and update the doc comment above it.)

- [ ] **Step 2: Edit `config.ts` — remove species block, add creature/morph/egg config**

Change the import line `import type { Species, Stage } from "./types";` to:

```ts
import type { ColorMorph, Stage } from "./types";
```

Delete `interface SpeciesInfo {…}`, the `SPECIES` record, `ALL_SPECIES`, the old `EGG_COLORS`, and the old `eggSprite`. Replace with:

```ts
/** La créature unique du jeu (le joueur la renomme ; défaut « Pokon »). */
export const CREATURE = {
  label: "Requinou",
  favorite: "petits poissons",
  /** Halo pastel derrière le sprite. */
  color: "#bfe6ff",
} as const;

/** Sprite pixel-art par étape d'évolution (l'œuf réutilise le sprite « baby »). */
export const STAGE_SPRITES: Record<Exclude<Stage, "egg">, string> = {
  baby: "/sprites/creatures/baby.png",
  child: "/sprites/creatures/child.png",
  teen: "/sprites/creatures/teen.png",
  adult: "/sprites/creatures/adult.png",
};
export function stageSprite(stage: Stage): string {
  return STAGE_SPRITES[stage === "egg" ? "baby" : stage];
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
```

> Note: `EggSkin` in `types.ts` stays as-is (`0 | 1 | 2 | 3`) but now indexes a CSS tint rather than a separate sprite; `eggTint` clamps unknown values to `"none"`.

- [ ] **Step 3: Edit `state.svelte.ts` — morph instead of species, + migration**

Change the import block: replace `Species` (type) and `ALL_SPECIES` with `ColorMorph` and `ALL_MORPHS`.

In the `import type { Corner, EggSkin, GameState, Species, Stats } from "./types";` line, drop `Species`, add `ColorMorph`:

```ts
import type { ColorMorph, Corner, EggSkin, GameState, Stats } from "./types";
```

In the config import, replace `ALL_SPECIES,` with `ALL_MORPHS,`.

In `defaultState()`, bump version and swap the field:

```ts
    version: 2,
```
and replace `species: null,` with:
```ts
    colorMorph: null,
```

Replace the body of `hatch()`:

```ts
function hatch() {
  game.colorMorph = ALL_MORPHS[Math.floor(Math.random() * ALL_MORPHS.length)] as ColorMorph;
  game.phase = "hatching";
  void save();
}
```

Add a migration helper above `init()`:

```ts
/** Met à niveau une sauvegarde ancienne (v1 : champ `species`) vers le schéma courant. */
function migrate(saved: Record<string, unknown>): Partial<GameState> {
  const next = { ...saved } as Record<string, unknown>;
  if ("species" in next) delete next.species; // l'espèce n'existe plus
  if (next.colorMorph == null) next.colorMorph = "ginger"; // variante par défaut
  next.version = 2;
  return next as Partial<GameState>;
}
```

In `init()`, route the loaded save through `migrate()`:

```ts
  const saved = await loadState();
  if (saved)
    assign({
      ...defaultState(),
      ...migrate(saved as unknown as Record<string, unknown>),
      stats: { ...defaultState().stats, ...saved.stats },
      settings: { ...defaultState().settings, ...saved.settings },
    });
```

- [ ] **Step 4: Verify typecheck — expect failures in components still using `SPECIES`/`species`**

Run: `pnpm check`
Expected: errors ONLY in `Creature.svelte` and `Hatching.svelte` (they still import `SPECIES` / read `game.species`). These are fixed in Tasks 3–4. No errors in `types.ts`, `config.ts`, `state.svelte.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/game/types.ts src/lib/game/config.ts src/lib/game/state.svelte.ts
git commit -m "Modèle : créature unique + variante de couleur + migration v2

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `Creature.svelte` — stage sprite, color morph, pixel icons

The main screen: sprite now keyed by `game.stage` with the color-morph filter; mood bubble, stat icons, tool buttons, confetti and banners all use `Icon`.

**Files:**
- Modify: `src/lib/components/Creature.svelte`
- Modify: `src/lib/components/StatBar.svelte`

**Interfaces:**
- Consumes: `stageSprite`, `morphFilter`, `CREATURE`, `xpForLevel` from `config.ts`; `Icon` from Task 1; `game`, `fx`, actions from `state.svelte`.
- Produces (`StatBar.svelte`): new props `{ name: string; fallback: string; value: number; color?: string }` — renders `Icon` instead of a raw emoji string.

- [ ] **Step 1: Rewrite `StatBar.svelte` to use `Icon`**

```svelte
<script lang="ts">
  import Icon from "./Icon.svelte";
  let {
    name,
    fallback,
    value,
    color = "#f3a9cb",
  }: { name: string; fallback: string; value: number; color?: string } = $props();
</script>

<div class="stat" title={`${Math.round(value)}%`}>
  <span class="icon"><Icon {name} {fallback} size={14} /></span>
  <div class="track">
    <div class="fill" style:width={`${Math.max(0, Math.min(100, value))}%`} style:background={color}></div>
  </div>
</div>

<style>
  .stat { display: flex; align-items: center; gap: 6px; }
  .icon { width: 16px; text-align: center; }
  .track {
    flex: 1; height: 10px; border: 2px solid #e29cbb;
    border-radius: 3px; background: #fff; overflow: hidden;
  }
  .fill { height: 100%; transition: width 0.3s ease; }
</style>
```

- [ ] **Step 2: Update `Creature.svelte` script block**

Replace the imports + `info`/`mood` derivations:

```ts
  import { CREATURE, stageSprite, morphFilter, xpForLevel } from "$lib/game/config";
  import {
    game, fx, feed, giveTreat, play, pet, wash, toggleSleep,
  } from "$lib/game/state.svelte";
  import StatBar from "./StatBar.svelte";
  import Icon from "./Icon.svelte";

  const sprite = $derived(stageSprite(game.stage));
  const filter = $derived(morphFilter(game.colorMorph));

  // Humeur → { name pixel, fallback emoji, label }.
  const mood = $derived.by(() => {
    if (game.asleep) return { name: "zzz", face: "💤", label: "dort" };
    const s = game.stats;
    if (s.hunger < 20) return { name: "hungry", face: "😖", label: "a faim" };
    if (s.happiness < 30) return { name: "grumpy", face: "😒", label: "grognon" };
    if (s.energy < 20) return { name: "sleepy", face: "🥱", label: "fatigué" };
    if (s.cleanliness < 20) return { name: "dirty", face: "🫧", label: "tout sale" };
    return { name: "happy", face: "😊", label: s.happiness > 75 ? "content" : "ça va" };
  });

  const xpNeeded = $derived(xpForLevel(game.level));
```

- [ ] **Step 3: Update `Creature.svelte` markup**

Replace the sprite `<img>`, mood bubble, confetti, banners, stats and tools.

Sprite + mood bubble (inside `.creature` button) — apply the morph filter and use `Icon` for the mood:

```svelte
      <img class="sprite pixel" src={sprite} alt={CREATURE.label} style:filter={filter} />
      <span class="mood-bubble"><Icon name={mood.name} kind="mood" fallback={mood.face} size={18} /></span>
```

Set `style:--halo={CREATURE.color}` on the `.creature` button (replacing `style:--halo={info.color}`).

Confetti — replace the emoji list with alternating pixel sparkles/stars:

```svelte
    {#if fx.levelUp}
      <div class="confetti">
        {#each ["sparkle", "star", "sparkle", "star", "sparkle"] as c, i (i)}
          <span style:--i={i}><Icon name={c} fallback="✨" size={16} /></span>
        {/each}
      </div>
    {/if}
```

Banners:

```svelte
  {#if fx.levelUp}<div class="banner"><Icon name="sparkle" fallback="✨" size={13} /> Niveau {game.level} !</div>{/if}
  {#if fx.evolve}<div class="banner evo"><Icon name="star" fallback="🌟" size={13} /> Évolution !</div>{/if}
```

Name line uses the player's name (unchanged): `<p class="name">{game.name}</p>`.

Stats block — swap each `StatBar`:

```svelte
  <div class="stats">
    <StatBar name="meat" fallback="🍖" value={game.stats.hunger} color="#ff8aa6" />
    <StatBar name="cake" fallback="🍰" value={game.stats.treat} color="#ffc46b" />
    <StatBar name="moon" fallback="😴" value={game.stats.energy} color="#8fb6f0" />
    <StatBar name="heart" fallback="❤️" value={game.stats.happiness} color="#f088b4" />
    <StatBar name="soap" fallback="🧼" value={game.stats.cleanliness} color="#7fd9cf" />
  </div>
```

Tools block — each button wraps an `Icon`:

```svelte
  <div class="tools">
    <button onclick={feed} title="Nourrir"><Icon name="meat" fallback="🍖" size={18} /></button>
    <button onclick={giveTreat} title="Friandise"><Icon name="cake" fallback="🍰" size={18} /></button>
    <button onclick={play} title="Jouer"><Icon name="fishtoy" fallback="🎮" size={18} /></button>
    <button onclick={wash} title="Laver"><Icon name="soap" fallback="🧼" size={18} /></button>
    <button onclick={toggleSleep} title={game.asleep ? "Réveiller" : "Dodo"}>
      {#if game.asleep}<Icon name="sun" fallback="☀️" size={18} />{:else}<Icon name="moon" fallback="😴" size={18} />{/if}
    </button>
  </div>
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm check`
Expected: no errors in `Creature.svelte` or `StatBar.svelte` (Hatching.svelte may still error — fixed in Task 4).

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Creature.svelte src/lib/components/StatBar.svelte
git commit -m "Créature : sprite par étape + filtre couleur + icônes pixel

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Incubation, EggSelect, Hatching, Settings, +page — pixel icons + single egg + baby reveal

Swaps the remaining gameplay emoji and switches the egg flow to a single tinted sprite. After this task the whole app is emoji-free (gameplay-wise) and typechecks clean.

**Files:**
- Modify: `src/lib/components/Incubation.svelte`
- Modify: `src/lib/components/EggSelect.svelte`
- Modify: `src/lib/components/Hatching.svelte`
- Modify: `src/lib/components/Settings.svelte`
- Modify: `src/routes/+page.svelte`

**Interfaces:**
- Consumes: `Icon` (Task 1); `eggSprite`, `eggTint`, `stageSprite`, `morphFilter`, `CREATURE`, `COLOR_MORPHS` from `config.ts`; `game` + actions from `state.svelte`.

- [ ] **Step 1: `Incubation.svelte` — single egg + tint, pixel icons**

In the script, import the tint helper and compute it:

```ts
  import { eggSprite, eggTint } from "$lib/game/config";
  import { game, warmEgg, cuddleEgg } from "$lib/game/state.svelte";
  import Icon from "./Icon.svelte";

  const sprite = $derived(eggSprite());
  const tint = $derived(eggTint(game.eggSkin ?? 0));
  const cold = $derived(game.warmth < 35);
```

Apply the tint to the egg `<img>`: add `style:filter={tint}` to the existing `<img class="egg pixel" …>`.

Replace the bars/warning/actions emoji:

```svelte
  <div class="bars">
    <div class="row"><Icon name="egg-mini" fallback="🥚" size={14} /><div class="track"><div class="fill inc" style:width={`${game.incubation}%`}></div></div></div>
    <div class="row"><Icon name="fire" fallback="🔥" size={14} /><div class="track"><div class="fill warm" style:width={`${game.warmth}%`}></div></div></div>
  </div>

  {#if cold}<p class="warn">L'œuf a froid… réchauffe-le <Icon name="snowflake" fallback="🥶" size={13} /></p>{/if}

  <div class="actions">
    <button onclick={warmEgg}><Icon name="fire" fallback="🔥" size={14} /> Réchauffer</button>
    <button onclick={cuddleEgg}><Icon name="heart" fallback="🤍" size={14} /> Câliner</button>
  </div>
```

> The incubation bar's egg uses a dedicated tiny `egg-mini` icon name; since no such PNG is generated, it cleanly falls back to 🥚. (We could point it at the egg sprite, but the fallback keeps the row height tidy.)

- [ ] **Step 2: `EggSelect.svelte` — one sprite, three tinted choices**

```svelte
<script lang="ts">
  import type { EggSkin } from "$lib/game/types";
  import { eggSprite, eggTint } from "$lib/game/config";
  import { chooseEgg } from "$lib/game/state.svelte";

  const skins: EggSkin[] = [0, 1, 2];
  const sprite = eggSprite();
</script>

<div class="screen" data-tauri-drag-region>
  <p class="title">Choisis ton œuf</p>
  <div class="eggs">
    {#each skins as skin (skin)}
      <button class="egg-btn" onclick={() => chooseEgg(skin)} title="Choisir cet œuf">
        <img class="egg pixel" src={sprite} alt="Œuf" style:filter={eggTint(skin)} />
      </button>
    {/each}
  </div>
  <p class="hint">Juste une question de couleur !</p>
</div>

<style>
  .screen { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
  .title { margin: 0; font-size: 16px; font-weight: 700; color: #a85677; }
  .eggs { display: flex; gap: 14px; }
  .egg-btn { border: none; background: none; cursor: pointer; padding: 2px; }
  .egg { display: block; width: 58px; height: 58px; object-fit: contain; transition: transform 0.15s ease; }
  .egg-btn:hover .egg { transform: translateY(-3px) scale(1.05); }
  .hint { margin: 0; font-size: 11px; color: #8a7d86; }
</style>
```

> `chooseEgg(skin: EggSkin)` is unchanged in `state.svelte.ts`; `EggSkin` still accepts `0|1|2`.

- [ ] **Step 3: `Hatching.svelte` — reveal the baby sprite + color morph**

```svelte
<script lang="ts">
  import { CREATURE, stageSprite, morphFilter } from "$lib/game/config";
  import { game, confirmHatch } from "$lib/game/state.svelte";

  let name = $state("");
  const filter = $derived(morphFilter(game.colorMorph));

  function validate(e: Event) {
    e.preventDefault();
    confirmHatch(name);
  }
</script>

<div class="screen" data-tauri-drag-region>
  <p class="title">✨ Ça éclot ! ✨</p>

  <span class="creature" style:--halo={CREATURE.color}>
    <img class="pixel" src={stageSprite("baby")} alt={CREATURE.label} style:filter={filter} />
  </span>
  <p class="species">Voici un <b>{CREATURE.label}</b> !</p>

  <form onsubmit={validate}>
    <input bind:value={name} maxlength="14" placeholder="Son nom…" />
    <button type="submit">OK</button>
  </form>
</div>

<style>
  .screen { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; }
  .title { margin: 0; font-size: 16px; font-weight: 700; color: #a85677; }
  .creature {
    width: 92px; height: 92px; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; background: radial-gradient(circle, var(--halo, #ffd9ea) 0%, transparent 68%);
    animation: pop 0.5s ease;
  }
  .creature img { width: 88px; height: 88px; object-fit: contain; }
  @keyframes pop { 0% { transform: scale(0.3); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  .species { margin: 0; font-size: 13px; color: #6b4a59; }
  form { display: flex; gap: 6px; margin-top: 2px; }
  input { width: 120px; border: 2px solid #d98fb0; border-radius: 5px; padding: 8px 10px; font-size: 14px; font-family: inherit; outline: none; }
  button { border: 2px solid #a85677; border-radius: 5px; background: #f088b4; color: #fff; font-weight: 700; font-size: 14px; padding: 8px 14px; cursor: pointer; box-shadow: 2px 2px 0 rgba(176, 106, 134, 0.25); }
  button:active { box-shadow: none; transform: translate(2px, 2px); }
</style>
```

> The `✨` in the title are decorative text, left as Unicode (matches the spec's "kept as-is" list spirit). The species `<b>` line no longer references `SPECIES`/`game.species`.

- [ ] **Step 4: `Settings.svelte` — gear icon**

Add `import Icon from "./Icon.svelte";` to the script, then replace the title:

```svelte
    <span class="title"><Icon name="gear" fallback="⚙️" size={15} /> Paramètres</span>
```

- [ ] **Step 5: `+page.svelte` — settings-button gear icon**

Add `import Icon from "$lib/components/Icon.svelte";` to the script block, then replace the settings control button content:

```svelte
    <button class="ctrl" onclick={() => (showSettings = true)} title="Paramètres"><Icon name="gear" fallback="⚙️" size={12} /></button>
```

(Leave the `🛠` dev button and `×` close button untouched.)

- [ ] **Step 6: Verify the whole app typechecks**

Run: `pnpm check`
Expected: **0 errors** across the project.

- [ ] **Step 7: Run the app and walk the full flow (Unicode fallbacks visible)**

Run: `pnpm dev` (browser) — or `pnpm tauri dev` for the real overlay.
Expected: choose egg → incubate → hatch (reveals the baby + a color morph) → the creature screen renders. All icons currently show as Unicode emoji (no PNGs yet) with no broken-image glyphs and no console errors. Confirm with the dev window (`pnpm tauri dev`, then the 🛠 button) that `Évoluer →` swaps the creature sprite source per stage.

- [ ] **Step 8: Commit**

```bash
git add src/lib/components/Incubation.svelte src/lib/components/EggSelect.svelte src/lib/components/Hatching.svelte src/lib/components/Settings.svelte src/routes/+page.svelte
git commit -m "UI : œuf unique teinté, éclosion du bébé, icônes pixel partout

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: PixelLab — generate the 4 creature stages (cheap, irreplaceable, first)

Probe cost on the first generation, then generate all four. Each `create_character` = 1 generation; download the front/"south" frame.

**Files:**
- Create: `static/sprites/creatures/baby.png`, `child.png`, `teen.png`, `adult.png`

**Tools:** `mcp__pixellab__get_balance`, `mcp__pixellab__create_character`, `mcp__pixellab__get_character`, then `curl` the frame URL.

Shared style suffix (append to every stage description for visual coherence):
`", chibi proportions, big head, soft pastel pixel art, single black outline, front view, transparent background, cute kawaii"`.

- [ ] **Step 1: Record starting balance**

Call `mcp__pixellab__get_balance`. Note `generations_remaining` (expected 32).

- [ ] **Step 2: Generate the baby (style probe)**

Call `mcp__pixellab__create_character` with:
- `description`: `"baby ginger kitten almost entirely swallowed by an oversized soft baby-blue plush shark hood, only its tiny face and paws peek out, huge eyes"` + the shared style suffix
- `proportions`: `'{"type": "preset", "name": "chibi"}'`
- `size`: `64`
- `view`: `"side"`
- `name`: `"Requinou baby"`

Poll `mcp__pixellab__get_character(character_id)` until `completed`.

- [ ] **Step 3: Verify style + measure cost**

View the preview from `get_character`. Confirm it reads as "ginger kitten in a blue shark hood, chibi, front-facing". Call `get_balance` again; cost should be ~1 generation. If the style is wrong, adjust the description and retry (only ~1 gen lost). **Do not proceed until the baby looks right.**

- [ ] **Step 4: Download the baby's front frame**

From `get_character`, take the front/"south" direction frame's download URL and save it:

```bash
curl -fsSL "<south-frame-url>" -o static/sprites/creatures/baby.png
```

Verify it's a valid PNG: `sips -g pixelWidth -g pixelHeight static/sprites/creatures/baby.png`.

- [ ] **Step 5: Generate child, teen, adult**

Repeat Steps 2–4 (no re-probe needed) for:
- **child** → `"young ginger kitten sitting up in a fitted blue shark hood, a small dorsal fin on its back, one tiny fang, curious"` + suffix → `static/sprites/creatures/child.png`
- **teen** → `"half-cat half-shark creature, real side fins, a tail turning into a shark tail, sharper eyes, two small fangs, deep teal and ginger stripes, the hood merged into body markings"` + suffix → `static/sprites/creatures/teen.png`
- **adult** → `"majestic shark-cat with a full dorsal fin, shark tail, gill marks, confident pose, glowing ocean-gradient body from teal to deep blue"` + suffix → `static/sprites/creatures/adult.png`

After each, `curl` the south frame to the right path.

- [ ] **Step 6: Verify in the running app**

With `pnpm tauri dev` running, use the dev window `Évoluer →` to step baby→child→teen→adult and confirm each sprite loads (no fallback, no broken image) and the color morph filter still applies.

- [ ] **Step 7: Record remaining balance + commit**

Call `get_balance`; note `generations_remaining` (expected ~28). Then:

```bash
git add static/sprites/creatures/baby.png static/sprites/creatures/child.png static/sprites/creatures/teen.png static/sprites/creatures/adult.png
git commit -m "Sprites créature : 4 étapes d'évolution (PixelLab)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: PixelLab — batch-generate icons + moods + egg (the 20–40-gen call, last)

One `create_1_direction_object` produces all 19 items. **Gate on budget first.**

**Files:**
- Create: `static/sprites/icons/{meat,cake,moon,heart,soap,fishtoy,sun,fire,snowflake,sparkle,star,gear}.png`
- Create: `static/sprites/moods/{happy,hungry,grumpy,sleepy,dirty,zzz}.png`
- Create: `static/sprites/eggs/egg.png`

**Tools:** `mcp__pixellab__get_balance`, `mcp__pixellab__create_1_direction_object`, `mcp__pixellab__get_object`, `mcp__pixellab__select_object_frames`, `mcp__pixellab__dismiss_review`, then `curl`.

- [ ] **Step 1: Budget gate**

Call `get_balance`. The batch costs 20–40 gens. If `generations_remaining < 20`, **stop**: the creatures + code already shipped with Unicode fallback. Report to the user that finishing the pixel icons needs more PixelLab credits, and end the plan here. Otherwise continue.

- [ ] **Step 2: Fire the batch**

Call `mcp__pixellab__create_1_direction_object` with `view: "top-down"`, `size: 64`, and `item_descriptions` (in this exact order so we can map frames back to names):

```
1  meat        "small piece of cooked meat on a bone, food icon"
2  cake         "slice of pink strawberry cake, dessert icon"
3  moon         "cute crescent moon with a small zzz, sleep icon"
4  heart         "plump red heart icon"
5  soap         "bar of soap with bubbles, cleaning icon"
6  fishtoy      "small blue fish plush cat toy"
7  sun          "smiling yellow sun icon"
8  fire         "small warm orange flame icon"
9  snowflake    "pale blue snowflake icon"
10 sparkle      "four-point sparkle, shiny star glint"
11 star         "golden five-point star icon"
12 gear         "settings cog gear icon, pink"
13 happy        "round kawaii face, big happy smile, rosy cheeks (emote bubble)"
14 hungry       "kawaii face with watering mouth, hungry expression (emote bubble)"
15 grumpy       "kawaii face, grumpy pouting expression (emote bubble)"
16 sleepy       "kawaii face, sleepy half-closed eyes, yawning (emote bubble)"
17 dirty        "kawaii face looking dizzy with a small dirt smudge (emote bubble)"
18 zzz          "blue sleep bubble with zzz letters"
19 egg          "speckled pastel-blue egg with a tiny shark dorsal fin on top"
```

All share the implicit style of soft pastel pixel-art icons, single outline, transparent background — append `", soft pastel pixel art, single outline, transparent background"` to each description.

Note the returned `object_id`.

- [ ] **Step 3: Inspect candidates**

Poll `mcp__pixellab__get_object(object_id)` until status is `review` (or `completed`). Inspect the inline candidate previews and map each to its `item_descriptions` index (1-based above; frames are 0-based in the API).

- [ ] **Step 4: Select one frame per item**

Call `mcp__pixellab__select_object_frames(object_id, indices=[…])` keeping exactly one good frame per item (19 indices). If any single item looks unusable, keep the best available — it can still be improved later; the Unicode fallback covers gaps in the meantime.

- [ ] **Step 5: Download each frame to its path**

After selection, `get_object` exposes per-frame download URLs. `curl` each to its destination, using the order mapping from Step 2:

```bash
mkdir -p static/sprites/icons static/sprites/moods
curl -fsSL "<frame-url-meat>"   -o static/sprites/icons/meat.png
curl -fsSL "<frame-url-cake>"   -o static/sprites/icons/cake.png
# … moon, heart, soap, fishtoy, sun, fire, snowflake, sparkle, star, gear → static/sprites/icons/
# happy, hungry, grumpy, sleepy, dirty, zzz → static/sprites/moods/
curl -fsSL "<frame-url-zzz>"    -o static/sprites/moods/zzz.png
curl -fsSL "<frame-url-egg>"    -o static/sprites/eggs/egg.png
```

Verify a couple are valid PNGs with `sips -g pixelWidth static/sprites/icons/meat.png`.

- [ ] **Step 6: Verify in the running app**

Reload `pnpm tauri dev`. Confirm: stat icons, tool buttons, mood bubble, confetti (dev `✨ Level-up` / `🌟 Évolution` preview buttons), settings gear, incubation fire/snowflake/heart, and the egg-select sprite all now show PIXEL art (no Unicode fallback). Walk a fresh game from egg → adult.

- [ ] **Step 7: Commit**

```bash
git add static/sprites/icons static/sprites/moods static/sprites/eggs/egg.png
git commit -m "Icônes/humeurs/œuf pixel-art (lot PixelLab)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Final verification & cleanup

Confirm the full feature works, old assets are removed, and no stray gameplay emoji remain.

**Files:**
- Delete: `static/sprites/creatures/{mochi,axolo,braisille,sylphe}.png`, `static/sprites/eggs/egg-{0,1,2,3}.png`

- [ ] **Step 1: Remove obsolete species/egg assets**

```bash
git rm static/sprites/creatures/mochi.png static/sprites/creatures/axolo.png static/sprites/creatures/braisille.png static/sprites/creatures/sylphe.png
git rm static/sprites/eggs/egg-0.png static/sprites/eggs/egg-1.png static/sprites/eggs/egg-2.png static/sprites/eggs/egg-3.png
```

- [ ] **Step 2: Grep for leftover references and gameplay emoji**

Run:
```bash
grep -rn "SPECIES\|ALL_SPECIES\|game.species\|\.species\b\|mochi\|braisille\|axolo\|sylphe" src/
grep -rn "🍖\|🍰\|🧼\|🎮\|☀️\|🥚\|🥶\|🤍\|😴\|😖\|😒\|🥱\|🫧\|😊\|🙂\|💤\|🎉\|🎊\|⭐\|🌟\|💫\|⚙️" src/lib src/routes/+page.svelte
```
Expected: first grep prints nothing. Second grep prints only `fallback="…"` props (the intentional Unicode fallbacks) — no bare rendered emoji. (Decorative `✨` in `Hatching.svelte`/dev window are allowed.)

- [ ] **Step 3: Final typecheck + build**

Run: `pnpm check && pnpm build`
Expected: 0 errors, build succeeds.

- [ ] **Step 4: Migration check (existing save)**

With a build that has an old v1 save present (a `tamapokon.json` containing `"species":"mochi"`), launch `pnpm tauri dev`. Expected: loads without crashing; the creature renders at its stage with the default `ginger` morph; no console errors. (If no old save is handy, simulate by hand-editing the store JSON to include `"species":"mochi"` and removing `colorMorph`.)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "Nettoyage : suppression des anciens sprites d'espèces + vérif finale

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- One evolving creature, 4 stages → Tasks 2 (stageSprite), 3 (render), 5 (sprites). ✔
- Color: per-stage palette (baked into sprites, Task 5) + random hatch morph (Tasks 2 hatch, 3/4 filter). ✔
- All gameplay emoji → pixel art with mapping → Tasks 1 (Icon), 3, 4 (wiring), 6 (assets); mapping table matches spec. ✔
- Single themed egg + CSS-tinted choices → Tasks 2 (eggSprite/eggTint), 4 (EggSelect/Incubation), 6 (egg.png). ✔
- Code changes list (types/config/state/Icon/StatBar/Creature/Incubation/EggSelect/Hatching/Settings/+page) → all covered. ✔
- Save migration v2 → Task 2 Step 3, verified Task 7 Step 4. ✔
- Budget safeguards (cheap-first, balance gates, Unicode fallback) → Tasks 1, 5, 6. ✔
- Cleanup of old assets → Task 7. ✔

**Placeholder scan:** No TBD/TODO; every code step shows complete code; PixelLab descriptions are concrete. The only runtime-adaptive steps (PixelLab frame indices/URLs) are inherent to the async review API and are handled by inspect-then-act with explicit tool calls. ✔

**Type consistency:** `colorMorph`/`ColorMorph` used identically in types/config/state/components; `stageSprite`, `morphFilter`, `eggSprite`, `eggTint`, `iconSrc`, `moodSrc`, `CREATURE`, `ALL_MORPHS` names match across tasks; `Icon` props `{name, kind, fallback, size}` and `StatBar` props `{name, fallback, value, color}` are consistent everywhere they're used. ✔
