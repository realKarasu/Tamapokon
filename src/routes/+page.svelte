<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";

  // Placeholder de démarrage — l'aventure commence par un œuf (cf. docs/Spécification Tamagotchi.md).
  // Le vrai gameplay (choix des 4 œufs, incubation ~30 h temps app-actif, éclosion-reveal,
  // stats, sauvegarde avec pause hors-app) sera construit par-dessus ce socle.

  const appWindow = getCurrentWindow();

  async function hide() {
    await appWindow.hide(); // on masque plutôt que quitter — le compagnon reste en tray
  }
</script>

<!-- data-tauri-drag-region : toute la scène est déplaçable (fenêtre sans bordure) -->
<main class="scene" data-tauri-drag-region>
  <button class="close" onclick={hide} title="Masquer">×</button>

  <div class="egg" data-tauri-drag-region></div>

  <h1>Tamapokon</h1>
  <p class="tagline">Un compagnon qui respecte ta vie 🌸</p>
</main>

<style>
  :global(html, body) {
    margin: 0;
    height: 100%;
    background: transparent; /* fenêtre transparente : seul le perso + son décor sont visibles */
    overflow: hidden;
    image-rendering: pixelated; /* rendu pixel-art : pas de lissage */
    font-family: "Press Start 2P", "Courier New", monospace;
    user-select: none;
    cursor: default;
  }

  .scene {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    /* petite « pièce » pastel arrondie, le décor par défaut */
    background: linear-gradient(160deg, #fdeef4 0%, #eef3fb 100%);
    border-radius: 18px;
    box-shadow: inset 0 0 0 2px #f6d4e4;
  }

  .close {
    position: absolute;
    top: 8px;
    right: 10px;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 6px;
    background: #f6d4e4;
    color: #b06a86;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
  }
  .close:hover {
    background: #f3c2d8;
  }

  /* Œuf placeholder en CSS (sera remplacé par un sprite pixel-art) */
  .egg {
    width: 96px;
    height: 120px;
    background: radial-gradient(circle at 38% 32%, #ffffff 0%, #ffd9ea 45%, #f7b8d6 100%);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    box-shadow: 0 6px 0 rgba(176, 106, 134, 0.15);
    animation: wobble 3.2s ease-in-out infinite;
  }

  @keyframes wobble {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  h1 {
    margin: 0;
    font-size: 1rem;
    color: #b06a86;
    letter-spacing: 1px;
  }

  .tagline {
    margin: 0;
    font-size: 0.5rem;
    color: #8a93b8;
    text-align: center;
    line-height: 1.5;
  }
</style>
