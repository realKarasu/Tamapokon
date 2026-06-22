<script lang="ts">
  import { EGG_COLORS } from "$lib/game/config";
  import { game, warmEgg, cuddleEgg } from "$lib/game/state.svelte";

  const color = $derived(EGG_COLORS[game.eggSkin ?? 0]);
  // Plus la chaleur est basse, plus l'œuf paraît terne (le soin conditionne l'éclosion).
  const cold = $derived(game.warmth < 35);
</script>

<div class="screen" data-tauri-drag-region>
  <span
    class="egg"
    class:cold
    style:background={`radial-gradient(circle at 38% 32%, #fff 0%, ${color} 55%, ${color} 100%)`}
    data-tauri-drag-region
  ></span>

  <div class="bars">
    <div class="row"><span>🥚</span><div class="track"><div class="fill inc" style:width={`${game.incubation}%`}></div></div></div>
    <div class="row"><span>🔥</span><div class="track"><div class="fill warm" style:width={`${game.warmth}%`}></div></div></div>
  </div>

  {#if cold}<p class="warn">L'œuf a froid… réchauffe-le 🥶</p>{/if}

  <div class="actions">
    <button onclick={warmEgg}>🔥 Réchauffer</button>
    <button onclick={cuddleEgg}>🤍 Câliner</button>
  </div>
</div>

<style>
  .screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .egg {
    width: 84px;
    height: 104px;
    border: 3px solid #e29cbb;
    border-radius: 46% 46% 42% 42% / 56% 56% 44% 44%;
    box-shadow: 4px 4px 0 rgba(176, 106, 134, 0.18);
    animation: wobble 2.6s ease-in-out infinite;
  }
  .egg.cold {
    filter: grayscale(0.5) brightness(0.95);
    animation-duration: 5s;
  }
  @keyframes wobble {
    0%, 100% { transform: rotate(-4deg); }
    50% { transform: rotate(4deg); }
  }
  .bars {
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }
  .track {
    flex: 1;
    height: 10px;
    border: 2px solid #e29cbb;
    border-radius: 3px;
    background: #fff;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  .fill.inc { background: #c9a7f0; }
  .fill.warm { background: #ffb27a; }
  .warn {
    margin: 0;
    font-size: 12px;
    color: #a85677;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 2px;
  }
  button {
    border: 2px solid #d98fb0;
    border-radius: 5px;
    background: #f6d4e4;
    color: #a85677;
    font-weight: 600;
    font-size: 12px;
    padding: 8px 11px;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(176, 106, 134, 0.22);
  }
  button:hover { background: #f3c2d8; }
  button:active { box-shadow: none; transform: translate(2px, 2px); }
</style>
