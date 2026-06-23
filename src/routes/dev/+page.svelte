<script lang="ts">
  // Fenêtre DEV séparée — émet des actions vers la fenêtre principale (devbridge).
  import "@fontsource/pixelify-sans/400.css";
  import "@fontsource/pixelify-sans/600.css";
  import "@fontsource/pixelify-sans/700.css";
  import { emitDevAction } from "$lib/game/devbridge";

  let timeScale = $state(1);

  function setSpeed(v: number) {
    timeScale = v;
    void emitDevAction({ type: "timeScale", value: v });
  }
</script>

<main class="dev">
  <h1>🛠 Tamapokon — Dev</h1>
  <p class="hint">Contrôle la fenêtre principale du jeu.</p>

  <section>
    <label class="col">
      <span>Vitesse du temps <b>×{timeScale}</b></span>
      <input
        class="slider"
        type="range"
        min="1"
        max="100"
        step="1"
        value={timeScale}
        oninput={(e) => setSpeed(Number(e.currentTarget.value))}
      />
    </label>
  </section>

  <section>
    <h2>Œuf</h2>
    <button class="act" onclick={() => emitDevAction({ type: "skipIncubation" })}>
      🐣 Éclore maintenant
    </button>
  </section>

  <section>
    <h2>Progression</h2>
    <div class="grid">
      <button class="act" onclick={() => emitDevAction({ type: "addXp", value: 20 })}>+20 XP</button>
      <button class="act" onclick={() => emitDevAction({ type: "evolveNext" })}>Évoluer →</button>
      <button class="act" onclick={() => emitDevAction({ type: "drain" })}>Vider jauges</button>
      <button class="act" onclick={() => emitDevAction({ type: "fill" })}>Remplir jauges</button>
    </div>
  </section>

  <section>
    <h2>Animations</h2>
    <div class="grid">
      <button class="act" onclick={() => emitDevAction({ type: "previewLevelUp" })}>
        ✨ Level-up
      </button>
      <button class="act" onclick={() => emitDevAction({ type: "previewEvolve" })}>
        🌟 Évolution
      </button>
    </div>
  </section>

  <button class="act danger" onclick={() => emitDevAction({ type: "reset" })}>
    ♻️ Réinitialiser (nouvel œuf)
  </button>
</main>

<style>
  :global(html, body) {
    margin: 0;
    background: #eef2fb;
    font-family: "Pixelify Sans", system-ui, sans-serif;
    color: #3a4f8c;
  }
  .dev {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 16px 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  h1 {
    margin: 0;
    font-size: 17px;
    color: #4d63a6;
  }
  .hint {
    margin: -6px 0 0;
    font-size: 12px;
    color: #7c89b5;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  h2 {
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #8a96c4;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
  }
  .col b {
    color: #2f4488;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .act {
    border: 2px solid #8fa3d9;
    border-radius: 6px;
    background: #dde6fb;
    color: #3a4f8c;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 8px;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(77, 99, 166, 0.22);
  }
  .act:hover {
    background: #cdd9f6;
  }
  .act:active {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  .act.danger {
    border-color: #d98fb0;
    background: #f6d4e4;
    color: #a85677;
    box-shadow: 2px 2px 0 rgba(176, 106, 134, 0.22);
  }
  .slider {
    appearance: none;
    width: 100%;
    height: 10px;
    border: 2px solid #8fa3d9;
    border-radius: 4px;
    background: #dde6fb;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid #3a4f8c;
    border-radius: 3px;
    background: #6f8bd6;
  }
  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: 2px solid #3a4f8c;
    border-radius: 3px;
    background: #6f8bd6;
  }
</style>
