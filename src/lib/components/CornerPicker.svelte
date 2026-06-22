<script lang="ts">
  import type { Corner } from "$lib/game/types";
  import { game, setCorner } from "$lib/game/state.svelte";

  const corners: { id: Corner; label: string }[] = [
    { id: "top-left", label: "↖" },
    { id: "top-right", label: "↗" },
    { id: "bottom-left", label: "↙" },
    { id: "bottom-right", label: "↘" },
  ];
</script>

<div class="picker" title="Coin de l'écran">
  {#each corners as c (c.id)}
    <button
      class:active={game.corner === c.id}
      onclick={() => setCorner(c.id)}
      title={c.id}>{c.label}</button
    >
  {/each}
</div>

<style>
  .picker {
    display: grid;
    grid-template-columns: repeat(2, 16px);
    gap: 3px;
    width: max-content;
  }
  button {
    width: 16px;
    height: 16px;
    border: 2px solid #d98fb0;
    border-radius: 3px;
    background: #fff;
    color: #b06a86;
    font-size: 9px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
  }
  button.active {
    background: #f088b4;
    color: #fff;
  }
</style>
