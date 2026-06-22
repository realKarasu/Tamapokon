<script lang="ts">
  import { game, setAlwaysOnTop, setAcrylic, setOpacity } from "$lib/game/state.svelte";
  import CornerPicker from "./CornerPicker.svelte";

  let { onclose }: { onclose: () => void } = $props();
</script>

<div class="settings" data-tauri-drag-region>
  <div class="head">
    <span class="title">⚙️ Paramètres</span>
    <button class="close" onclick={onclose} title="Fermer">×</button>
  </div>

  <label class="row">
    <span>Toujours au-dessus</span>
    <input
      type="checkbox"
      checked={game.settings.alwaysOnTop}
      onchange={(e) => setAlwaysOnTop(e.currentTarget.checked)}
    />
  </label>

  <label class="row">
    <span>Fond acrylique</span>
    <input
      type="checkbox"
      checked={game.settings.acrylic}
      onchange={(e) => setAcrylic(e.currentTarget.checked)}
    />
  </label>

  <label class="row col">
    <span>Opacité du fond <b>{Math.round(game.settings.opacity * 100)}%</b></span>
    <input
      class="slider"
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={game.settings.opacity}
      oninput={(e) => setOpacity(Number(e.currentTarget.value))}
    />
  </label>

  <div class="row corner">
    <span>Coin de l'écran</span>
    <CornerPicker />
  </div>
</div>

<style>
  .settings {
    position: absolute;
    inset: 0;
    z-index: 5;
    background: #fff6fa;
    border-radius: 10px;
    box-shadow:
      inset 0 0 0 3px #ffffff,
      inset 0 0 0 6px #f3c2d8;
    display: flex;
    flex-direction: column;
    gap: 11px;
    padding: 16px 18px;
    box-sizing: border-box;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title {
    font-size: 15px;
    font-weight: 700;
    color: #a85677;
  }
  .close {
    width: 24px;
    height: 24px;
    border: 2px solid #d98fb0;
    border-radius: 5px;
    background: #f6d4e4;
    color: #a85677;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    box-shadow: 2px 2px 0 rgba(176, 106, 134, 0.25);
  }
  .close:hover {
    background: #f3c2d8;
  }
  .close:active {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: #6b4a59;
  }
  .row.col {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
  .row.corner {
    margin-top: 2px;
  }
  .row b {
    color: #a85677;
  }

  /* Cases à cocher « pixel » : carrées, bordure nette. */
  input[type="checkbox"] {
    appearance: none;
    width: 20px;
    height: 20px;
    margin: 0;
    border: 2px solid #d98fb0;
    border-radius: 3px;
    background: #fff;
    cursor: pointer;
  }
  input[type="checkbox"]:checked {
    background: #f088b4;
    box-shadow: inset 0 0 0 3px #fff6fa;
  }

  /* Slider « pixel » : piste plate, curseur carré. */
  .slider {
    appearance: none;
    width: 100%;
    height: 8px;
    border: 2px solid #d98fb0;
    border-radius: 3px;
    background: #ffe4ef;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    margin-top: -1px;
    border: 2px solid #a85677;
    border-radius: 2px;
    background: #f088b4;
  }
  .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 2px solid #a85677;
    border-radius: 2px;
    background: #f088b4;
  }
</style>
