<script lang="ts">
  // Panneau de debug — rendu UNIQUEMENT en build dev (voir +page.svelte).
  // Sert à tester rapidement les états et animations sans attendre le temps réel.
  import {
    game,
    dev,
    setTimeScale,
    devSkipIncubation,
    devAddXp,
    devEvolveNext,
    devSetStat,
    devPreviewLevelUp,
    devPreviewEvolve,
    resetGame,
  } from "$lib/game/state.svelte";
  import type { Stats } from "$lib/game/types";

  let { onclose }: { onclose: () => void } = $props();

  function drain() {
    devSetStat("hunger", 15);
    devSetStat("energy", 15);
    devSetStat("cleanliness", 15);
    devSetStat("happiness", 20);
  }
  function fill() {
    (["hunger", "treat", "energy", "happiness", "cleanliness"] as (keyof Stats)[]).forEach((k) =>
      devSetStat(k, 100),
    );
  }
</script>

<div class="dev" data-tauri-drag-region>
  <div class="head">
    <span class="title">🛠 Dev</span>
    <button class="close" onclick={onclose} title="Fermer">×</button>
  </div>

  <label class="col">
    <span>Vitesse du temps <b>×{dev.timeScale}</b></span>
    <input
      class="slider"
      type="range"
      min="1"
      max="100"
      step="1"
      value={dev.timeScale}
      oninput={(e) => setTimeScale(Number(e.currentTarget.value))}
    />
  </label>

  {#if game.phase === "incubating"}
    <button class="act" onclick={devSkipIncubation}>🐣 Éclore maintenant</button>
  {/if}

  {#if game.phase === "alive"}
    <div class="grid">
      <button class="act" onclick={() => devAddXp(20)}>+20 XP</button>
      <button class="act" onclick={devEvolveNext}>Évoluer →</button>
      <button class="act" onclick={drain}>Vider jauges</button>
      <button class="act" onclick={fill}>Remplir jauges</button>
    </div>
  {/if}

  <div class="grid">
    <button class="act" onclick={devPreviewLevelUp}>✨ Anim level-up</button>
    <button class="act" onclick={devPreviewEvolve}>🌟 Anim évolution</button>
  </div>

  <button class="act danger" onclick={resetGame}>♻️ Réinitialiser (nouvel œuf)</button>
</div>

<style>
  .dev {
    position: absolute;
    inset: 0;
    z-index: 6;
    background: #f3f6ff;
    border-radius: 10px;
    box-shadow:
      inset 0 0 0 3px #ffffff,
      inset 0 0 0 6px #9db4e8;
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 14px 16px;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title {
    font-size: 15px;
    font-weight: 700;
    color: #4d63a6;
  }
  .close {
    width: 24px;
    height: 24px;
    border: 2px solid #8fa3d9;
    border-radius: 5px;
    background: #dde6fb;
    color: #4d63a6;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    box-shadow: 2px 2px 0 rgba(77, 99, 166, 0.25);
  }
  .close:active {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
    color: #4d63a6;
  }
  .col b {
    color: #2f4488;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .act {
    border: 2px solid #8fa3d9;
    border-radius: 5px;
    background: #dde6fb;
    color: #3a4f8c;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    padding: 7px 6px;
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
    height: 8px;
    border: 2px solid #8fa3d9;
    border-radius: 3px;
    background: #dde6fb;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border: 2px solid #3a4f8c;
    border-radius: 2px;
    background: #6f8bd6;
  }
  .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 2px solid #3a4f8c;
    border-radius: 2px;
    background: #6f8bd6;
  }
</style>
