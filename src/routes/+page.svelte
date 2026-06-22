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

  let showSettings = $state(false);

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

<main class="room" class:acrylic={game.settings.acrylic} style:opacity={game.settings.opacity}>
  <!-- Contrôles overlay : réglages + masquer. Discrets, visibles au survol. -->
  <div class="controls">
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
    position: relative;
    height: 100vh;
    background: linear-gradient(160deg, #fdeef4 0%, #eef3fb 100%);
    /* Cadre « pixel » : coins peu arrondis + double bordure nette. */
    border-radius: 10px;
    box-shadow:
      inset 0 0 0 3px #ffffff,
      inset 0 0 0 6px #f3c2d8;
    overflow: hidden;
  }
  /* Fond acrylique actif : on rend la « pièce » translucide pour laisser voir le flou de l'OS. */
  .room.acrylic {
    background: linear-gradient(160deg, rgba(253, 238, 244, 0.3) 0%, rgba(238, 243, 251, 0.3) 100%);
    box-shadow:
      inset 0 0 0 3px rgba(255, 255, 255, 0.5),
      inset 0 0 0 6px rgba(243, 194, 216, 0.6);
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
</style>
