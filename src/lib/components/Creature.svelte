<script lang="ts">
  import { SPECIES, xpForLevel } from "$lib/game/config";
  import {
    game,
    fx,
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
  <div class="stage">
    {#if fx.evolve}<div class="evolve-glow"></div>{/if}
    {#if fx.levelUp}
      <div class="confetti">
        {#each ["🎉", "✨", "⭐", "🎊", "💫"] as c, i (i)}
          <span style:--i={i}>{c}</span>
        {/each}
      </div>
    {/if}
    <button
      class="creature"
      class:asleep={game.asleep}
      class:levelup={fx.levelUp}
      class:evolve={fx.evolve}
      style:--halo={info.color}
      onclick={pet}
      data-tauri-drag-region
      title="Câliner"
    >
      <img class="sprite pixel" src={info.sprite} alt={info.label} />
      <span class="mood-bubble">{game.asleep ? "💤" : mood.face}</span>
    </button>
  </div>

  {#if fx.levelUp}<div class="banner">✨ Niveau {game.level} !</div>{/if}
  {#if fx.evolve}<div class="banner evo">🌟 Évolution !</div>{/if}

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
    position: relative;
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
    position: relative;
    width: 96px;
    height: 96px;
    border: none;
    background: radial-gradient(circle at 50% 58%, var(--halo, #ffd9ea) 0%, transparent 66%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    animation: bob 2.8s ease-in-out infinite;
  }
  .creature.asleep {
    animation-duration: 5.5s;
  }
  .creature.asleep .sprite {
    filter: brightness(0.92) saturate(0.85);
  }
  .sprite {
    width: 92px;
    height: 92px;
    object-fit: contain;
  }
  .mood-bubble {
    position: absolute;
    top: 2px;
    right: 6px;
    font-size: 18px;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15));
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  /* --- Animations level-up / évolution --- */
  .stage {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .creature.levelup {
    animation: bob 2.8s ease-in-out infinite, flash 0.4s ease 2;
  }
  .creature.evolve {
    animation: bob 2.8s ease-in-out infinite, evolvePulse 0.6s ease-in-out 3;
  }
  @keyframes flash {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.9); }
  }
  @keyframes evolvePulse {
    0%, 100% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.18); filter: brightness(2.2) saturate(1.4); }
  }
  .evolve-glow {
    position: absolute;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 244, 180, 0.9) 0%, rgba(255, 214, 240, 0) 70%);
    animation: glowPulse 0.6s ease-in-out 3;
    pointer-events: none;
  }
  @keyframes glowPulse {
    0%, 100% { transform: scale(0.7); opacity: 0.3; }
    50% { transform: scale(1.2); opacity: 1; }
  }
  .confetti {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .confetti span {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 16px;
    animation: pop-out 1.2s ease-out forwards;
    animation-delay: calc(var(--i) * 0.05s);
  }
  .confetti span:nth-child(1) { --dx: -60px; --dy: -50px; }
  .confetti span:nth-child(2) { --dx: 55px; --dy: -45px; }
  .confetti span:nth-child(3) { --dx: -45px; --dy: 45px; }
  .confetti span:nth-child(4) { --dx: 60px; --dy: 40px; }
  .confetti span:nth-child(5) { --dx: 0px; --dy: -65px; }
  @keyframes pop-out {
    0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1); opacity: 0; }
  }
  .banner {
    position: absolute;
    top: 26px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff3c4;
    border: 2px solid #e8c45a;
    border-radius: 6px;
    padding: 4px 9px;
    font-size: 12px;
    font-weight: 700;
    color: #a8791f;
    white-space: nowrap;
    box-shadow: 2px 2px 0 rgba(168, 121, 31, 0.25);
    animation: drop-in 0.3s ease;
    z-index: 4;
  }
  .banner.evo {
    background: #ffe3f3;
    border-color: #e98fc0;
    color: #a8417f;
    box-shadow: 2px 2px 0 rgba(168, 65, 127, 0.25);
  }
  @keyframes drop-in {
    0% { transform: translate(-50%, -8px); opacity: 0; }
    100% { transform: translate(-50%, 0); opacity: 1; }
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
