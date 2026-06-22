<script lang="ts">
  import { SPECIES } from "$lib/game/config";
  import { game, confirmHatch } from "$lib/game/state.svelte";

  let name = $state("");
  const info = $derived(game.species ? SPECIES[game.species] : null);

  function validate(e: Event) {
    e.preventDefault();
    confirmHatch(name);
  }
</script>

<div class="screen" data-tauri-drag-region>
  <p class="title">✨ Ça éclot ! ✨</p>

  {#if info}
    <span class="creature" style:background={`radial-gradient(circle at 40% 35%, #fff 0%, ${info.color} 60%)`}>
      {info.emoji}
    </span>
    <p class="species">C'est un <b>{info.label}</b> !</p>
  {/if}

  <form onsubmit={validate}>
    <input bind:value={name} maxlength="14" placeholder="Son nom…" />
    <button type="submit">OK</button>
  </form>
</div>

<style>
  .screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }
  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #a85677;
  }
  .creature {
    width: 80px;
    height: 80px;
    border: 3px solid #e29cbb;
    border-radius: 32% 32% 38% 38%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: 0 4px 0 rgba(176, 106, 134, 0.18);
    animation: pop 0.5s ease;
  }
  @keyframes pop {
    0% { transform: scale(0.3); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .species {
    margin: 0;
    font-size: 13px;
    color: #6b4a59;
  }
  form {
    display: flex;
    gap: 6px;
    margin-top: 2px;
  }
  input {
    width: 120px;
    border: 2px solid #d98fb0;
    border-radius: 5px;
    padding: 8px 10px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
  }
  button {
    border: 2px solid #a85677;
    border-radius: 5px;
    background: #f088b4;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    padding: 8px 14px;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(176, 106, 134, 0.25);
  }
  button:active { box-shadow: none; transform: translate(2px, 2px); }
</style>
