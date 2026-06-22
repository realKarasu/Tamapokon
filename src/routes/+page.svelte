<script lang="ts">
  import { onMount } from "svelte";
  import "@fontsource/pixelify-sans/400.css";
  import "@fontsource/pixelify-sans/600.css";
  import "@fontsource/pixelify-sans/700.css";
  import { game, init, pause, resume, save, dispose } from "$lib/game/state.svelte";
  import EggSelect from "$lib/components/EggSelect.svelte";
  import Incubation from "$lib/components/Incubation.svelte";
  import Hatching from "$lib/components/Hatching.svelte";
  import Creature from "$lib/components/Creature.svelte";
  import Settings from "$lib/components/Settings.svelte";
  import DevPanel from "$lib/components/DevPanel.svelte";

  const isDev = import.meta.env.DEV;
  let showSettings = $state(false);
  let showDev = $state(false);

  onMount(() => {
    void init();

    // Temps app-actif : on gèle la créature quand la fenêtre est masquée/minimisée.
    const onVisibility = () => (document.hidden ? pause() : resume());
    document.addEventListener("visibilitychange", onVisibility);
    const onUnload = () => void save();
    window.addEventListener("beforeunload", onUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onUnload);
      dispose();
    };
  });

  async function hide() {
    pause(); // gèle l'état (sauvegarde incluse) avant de masquer
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().hide();
    } catch {
      /* hors Tauri */
    }
  }
</script>

<main class="room" class:acrylic={game.settings.acrylic} style:--bg-alpha={game.settings.opacity}>
  <!-- Contrôles overlay : réglages + masquer. Discrets, visibles au survol. -->
  <div class="controls">
    {#if isDev}
      <button class="ctrl dev" onclick={() => (showDev = true)} title="Dev">🛠</button>
    {/if}
    <button class="ctrl" onclick={() => (showSettings = true)} title="Paramètres">⚙️</button>
    <button class="ctrl" onclick={hide} title="Masquer">×</button>
  </div>

  {#if game.phase === "choosing"}
    <EggSelect />
  {:else if game.phase === "incubating"}
    <Incubation />
  {:else if game.phase === "hatching"}
    <Hatching />
  {:else}
    <Creature />
  {/if}

  {#if showSettings}
    <Settings onclose={() => (showSettings = false)} />
  {/if}

  {#if isDev && showDev}
    <DevPanel onclose={() => (showDev = false)} />
  {/if}
</main>

<style>
  :global(html, body) {
    margin: 0;
    height: 100%;
    background: transparent;
    overflow: hidden;
    font-family: "Pixelify Sans", "Trebuchet MS", system-ui, sans-serif;
    font-size: 15px;
    color: #6b4a59;
    user-select: none;
    cursor: default;
    -webkit-font-smoothing: none; /* texte plus « pixel », sans anti-aliasing */
  }
  /* Le rendu pixelisé s'applique aux sprites. */
  :global(img),
  :global(.pixel) {
    image-rendering: pixelated;
  }

  .room {
    --bg-alpha: 1; /* piloté par le slider de transparence (alpha du FOND uniquement) */
    position: relative;
    height: 100vh;
    /* Seul le fond utilise l'alpha → la créature et l'UI restent pleinement visibles. */
    background: linear-gradient(
      160deg,
      rgb(253 238 244 / var(--bg-alpha)) 0%,
      rgb(238 243 251 / var(--bg-alpha)) 100%
    );
    /* Cadre « pixel » : coins peu arrondis + double bordure nette (alpha suit le fond). */
    border-radius: 10px;
    box-shadow:
      inset 0 0 0 3px rgb(255 255 255 / var(--bg-alpha)),
      inset 0 0 0 6px rgb(243 194 216 / var(--bg-alpha));
    overflow: hidden;
  }
  /* Fond acrylique actif : tint translucide par-dessus le flou de l'OS (×0.4 de l'alpha choisi). */
  .room.acrylic {
    background: linear-gradient(
      160deg,
      rgb(253 238 244 / calc(var(--bg-alpha) * 0.4)) 0%,
      rgb(238 243 251 / calc(var(--bg-alpha) * 0.4)) 100%
    );
  }

  .controls {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: flex-start;
    gap: 5px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 3;
  }
  .room:hover .controls {
    opacity: 1;
  }
  .ctrl {
    width: 24px;
    height: 24px;
    border: 2px solid #d98fb0;
    border-radius: 5px;
    background: #f6d4e4;
    color: #a85677;
    font-size: 12px;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(176, 106, 134, 0.25);
  }
  .ctrl:hover {
    background: #f3c2d8;
  }
  .ctrl:active {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  .ctrl.dev {
    border-color: #8fa3d9;
    background: #dde6fb;
    color: #4d63a6;
    box-shadow: 2px 2px 0 rgba(77, 99, 166, 0.25);
  }
  .ctrl.dev:hover {
    background: #cdd9f6;
  }
</style>
