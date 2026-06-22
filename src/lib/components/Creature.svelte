<script lang="ts">
  import { SPECIES, xpForLevel } from "$lib/game/config";
  import {
    game,
    feed,
    giveTreat,
    play,
    pet,
    wash,
    toggleSleep,
  } from "$lib/game/state.svelte";
  import StatBar from "./StatBar.svelte";

  const info = $derived(game.species ? SPECIES[game.species] : SPECIES.mochi);

  const mood = $derived.by(() => {
    if (game.asleep) return { face: "😴", label: "dort" };
    const s = game.stats;
    if (s.hunger < 20) return { face: "😖", label: "a faim" };
    if (s.happiness < 30) return { face: "😒", label: "grognon" };
    if (s.energy < 20) return { face: "🥱", label: "fatigué" };
    if (s.cleanliness < 20) return { face: "🫧", label: "tout sale" };
    if (s.happiness > 75) return { face: "😊", label: "content" };
    return { face: "🙂", label: "ça va" };
  });

  const xpNeeded = $derived(xpForLevel(game.level));
</script>

<div class="screen">
  <div class="topbar">
    <span class="lvl">Nv {game.level}</span>
    <div class="xp"><div class="xpfill" style:width={`${(game.xp / xpNeeded) * 100}%`}></div></div>
  </div>

  <!-- La créature : clic = câlin. Déplaçable en glissant. -->
  <button
    class="creature"
    class:asleep={game.asleep}
    style:background={`radial-gradient(circle at 40% 35%, #fff 0%, ${info.color} 62%)`}
    onclick={pet}
    data-tauri-drag-region
    title="Câliner"
  >
    <span class="face">{game.asleep ? "💤" : mood.face}</span>
  </button>

  <p class="name">{game.name}</p>
  <p class="mood">{mood.label}</p>

  <div class="stats">
    <StatBar icon="🍖" value={game.stats.hunger} color="#ff8aa6" />
    <StatBar icon="🍰" value={game.stats.treat} color="#ffc46b" />
    <StatBar icon="😴" value={game.stats.energy} color="#8fb6f0" />
    <StatBar icon="❤️" value={game.stats.happiness} color="#f088b4" />
    <StatBar icon="🧼" value={game.stats.cleanliness} color="#7fd9cf" />
  </div>

  <div class="tools">
    <button onclick={feed} title="Nourrir">🍖</button>
    <button onclick={giveTreat} title="Friandise">🍰</button>
    <button onclick={play} title="Jouer">🎮</button>
    <button onclick={wash} title="Laver">🧼</button>
    <button onclick={toggleSleep} title={game.asleep ? "Réveiller" : "Dodo"}>
      {game.asleep ? "☀️" : "😴"}
    </button>
  </div>
</div>

<style>
  .screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 22px 10px 10px;
    box-sizing: border-box;
  }
  .topbar {
    position: absolute;
    top: 9px;
    left: 12px;
    right: 34px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .lvl {
    font-size: 12px;
    font-weight: 700;
    color: #b06a86;
  }
  .xp {
    flex: 1;
    height: 8px;
    border: 2px solid #b78cf0;
    border-radius: 3px;
    background: #fff;
    overflow: hidden;
  }
  .xpfill {
    height: 100%;
    background: #b78cf0;
    transition: width 0.3s ease;
  }

  .creature {
    width: 92px;
    height: 92px;
    border: 3px solid #e29cbb;
    border-radius: 30% 30% 36% 36%; /* forme blob un peu « blocky » */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 4px 4px 0 rgba(176, 106, 134, 0.18);
    animation: bob 2.8s ease-in-out infinite;
  }
  .creature.asleep {
    animation-duration: 5.5s;
  }
  .face {
    font-size: 38px;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  .name {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #a85677;
  }
  .mood {
    margin: -4px 0 0;
    font-size: 12px;
    color: #8a7d86;
  }

  .stats {
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 2px;
  }

  .tools {
    display: flex;
    justify-content: center;
    gap: 7px;
    margin-top: 2px;
  }
  .tools button {
    width: 34px;
    height: 34px;
    border: 2px solid #e29cbb;
    border-radius: 5px;
    background: #ffffff;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(176, 106, 134, 0.22);
    transition: background 0.15s ease;
  }
  .tools button:hover {
    background: #ffe4ef;
  }
  .tools button:active {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
</style>
