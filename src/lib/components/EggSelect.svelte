<script lang="ts">
  import type { EggSkin } from "$lib/game/types";
  import { EGG_COLORS } from "$lib/game/config";
  import { chooseEgg } from "$lib/game/state.svelte";

  const skins: EggSkin[] = [0, 1, 2, 3];
</script>

<div class="screen" data-tauri-drag-region>
  <p class="title">Choisis ton œuf</p>
  <div class="eggs">
    {#each skins as skin (skin)}
      <button class="egg-btn" onclick={() => chooseEgg(skin)} title="Choisir cet œuf">
        <span class="egg" style:background={`radial-gradient(circle at 38% 32%, #fff 0%, ${EGG_COLORS[skin]} 55%, ${EGG_COLORS[skin]} 100%)`}></span>
      </button>
    {/each}
  </div>
  <p class="hint">L'apparence est purement cosmétique 🤫</p>
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
  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #a85677;
  }
  .eggs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  .egg-btn {
    border: none;
    background: none;
    cursor: pointer;
    padding: 2px;
  }
  .egg {
    display: block;
    width: 54px;
    height: 68px;
    border: 3px solid #e29cbb;
    border-radius: 46% 46% 42% 42% / 56% 56% 44% 44%;
    box-shadow: 3px 3px 0 rgba(176, 106, 134, 0.18);
    transition: transform 0.15s ease;
  }
  .egg-btn:hover .egg {
    transform: translateY(-3px) scale(1.05);
  }
  .hint {
    margin: 0;
    font-size: 11px;
    color: #8a7d86;
  }
</style>
