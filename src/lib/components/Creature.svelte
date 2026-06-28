<script lang="ts">
  import { CREATURE, creatureForm, creatureSprite, morphFilter, xpForLevel } from "$lib/game/config";
  import type { MoodFace } from "$lib/game/types";
  import {
    game, fx, feed, giveTreat, play, pet, wash, toggleSleep,
  } from "$lib/game/state.svelte";
  import StatBar from "./StatBar.svelte";
  import Icon from "./Icon.svelte";

  // Humeur → { name pixel (badge), emoji fallback, label texte, expr du visage }.
  const mood = $derived.by(() => {
    if (game.asleep) return { name: "zzz", emoji: "💤", label: "dort", expr: "sleep" as MoodFace };
    const s = game.stats;
    if (s.hunger < 20) return { name: "hungry", emoji: "😖", label: "a faim", expr: "sad" as MoodFace };
    if (s.happiness < 30) return { name: "grumpy", emoji: "😒", label: "grognon", expr: "sad" as MoodFace };
    if (s.energy < 20) return { name: "sleepy", emoji: "🥱", label: "fatigué", expr: "sad" as MoodFace };
    if (s.cleanliness < 20) return { name: "dirty", emoji: "🫧", label: "tout sale", expr: "sad" as MoodFace };
    return { name: "happy", emoji: "😊", label: s.happiness > 75 ? "content" : "ça va", expr: (s.happiness > 75 ? "happy" : "normal") as MoodFace };
  });

  // Sprite = forme (métamorphose selon le niveau) × expression d'humeur.
  const sprite = $derived(creatureSprite(creatureForm(game.stage), mood.expr));
  const filter = $derived(morphFilter(game.colorMorph));

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
        {#each ["sparkle", "star", "sparkle", "star", "sparkle"] as c, i (i)}
          <span style:--i={i}><Icon name={c} fallback="✨" size={16} /></span>
        {/each}
      </div>
    {/if}
    <button
      class="creature"
      class:asleep={game.asleep}
      class:levelup={fx.levelUp}
      class:evolve={fx.evolve}
      style:--halo={CREATURE.color}
      onclick={pet}
      data-tauri-drag-region
      title="Câliner"
    >
      <img class="sprite pixel" src={sprite} alt={CREATURE.label} style:filter={filter} />
    </button>

    <!-- Badge d'humeur : son survol/focus révèle les jauges (discrètes). -->
    <button type="button" class="mood-badge" aria-label={`Humeur : ${mood.label}. Voir les jauges`}>
      <Icon name={mood.name} kind="mood" fallback={mood.emoji} size={42} />
    </button>
  </div>

  {#if fx.levelUp}<div class="banner"><Icon name="sparkle" fallback="✨" size={13} /> Niveau {game.level} !</div>{/if}
  {#if fx.evolve}<div class="banner evo"><Icon name="star" fallback="🌟" size={13} /> Évolution !</div>{/if}

  <p class="name">{game.name}</p>
  <p class="mood">{mood.label}</p>

  <!-- Jauges discrètes : masquées par défaut, révélées au survol/focus du badge. -->
  <div class="stats" role="group" aria-label="Jauges">
    <StatBar name="meat" fallback="🍖" value={game.stats.hunger} color="#ff8aa6" />
    <StatBar name="cake" fallback="🍰" value={game.stats.treat} color="#ffc46b" />
    <StatBar name="moon" fallback="😴" value={game.stats.energy} color="#8fb6f0" />
    <StatBar name="heart" fallback="❤️" value={game.stats.happiness} color="#f088b4" />
    <StatBar name="soap" fallback="🧼" value={game.stats.cleanliness} color="#7fd9cf" />
  </div>

  <!-- Outils : survol d'un emoji → sa jauge associée apparaît au-dessus. -->
  <div class="tools">
    <div class="tool">
      <div class="tool-bar"><StatBar name="meat" fallback="🍖" value={game.stats.hunger} color="#ff8aa6" /></div>
      <button onclick={feed} title="Nourrir"><Icon name="meat" fallback="🍖" size={46} /></button>
    </div>
    <div class="tool">
      <div class="tool-bar"><StatBar name="cake" fallback="🍰" value={game.stats.treat} color="#ffc46b" /></div>
      <button onclick={giveTreat} title="Friandise"><Icon name="cake" fallback="🍰" size={46} /></button>
    </div>
    <div class="tool">
      <div class="tool-bar"><StatBar name="heart" fallback="❤️" value={game.stats.happiness} color="#f088b4" /></div>
      <button onclick={play} title="Jouer"><Icon name="fishtoy" fallback="🎮" size={46} /></button>
    </div>
    <div class="tool">
      <div class="tool-bar"><StatBar name="soap" fallback="🧼" value={game.stats.cleanliness} color="#7fd9cf" /></div>
      <button onclick={wash} title="Laver"><Icon name="soap" fallback="🧼" size={46} /></button>
    </div>
    <div class="tool">
      <div class="tool-bar"><StatBar name="moon" fallback="😴" value={game.stats.energy} color="#8fb6f0" /></div>
      <button onclick={toggleSleep} title={game.asleep ? "Réveiller" : "Dodo"}>
        {#if game.asleep}<Icon name="sun" fallback="☀️" size={46} />{:else}<Icon name="moon" fallback="😴" size={46} />{/if}
      </button>
    </div>
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
    top: 40px;
    left: 14px;
    right: 14px;
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
    width: 140px;
    height: 140px;
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
    width: 136px;
    height: 136px;
    object-fit: contain;
    /* SVG vectoriel : rendu lissé (pas le nearest-neighbor « découpé » du pixel-art). */
    image-rendering: auto;
  }

  /* Badge d'humeur : petit pictogramme cliquable, coin haut-droit de la créature. */
  .mood-badge {
    position: absolute;
    top: -2px;
    right: 2px;
    z-index: 6;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 2px solid #e29cbb;
    /* Carré arrondi (pas un cercle) ; l'icône peut déborder un peu (emoji « sticker »). */
    border-radius: 8px;
    overflow: visible;
    background: #fff;
    cursor: pointer;
    box-shadow: 1px 1px 0 rgba(176, 106, 134, 0.25);
  }
  .mood-badge:hover {
    background: #ffe4ef;
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

  /* Jauges discrètes : panneau flottant (hors flux → ne décentre pas la créature),
     invisible jusqu'au survol/focus du badge d'humeur — révélé en fondu. */
  .stats {
    position: absolute;
    bottom: 56px;
    left: 50%;
    width: 84%;
    box-sizing: border-box;
    transform: translateX(-50%) translateY(6px);
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 9px 11px;
    background: rgba(255, 255, 255, 0.96);
    border: 2px solid #e29cbb;
    border-radius: 8px;
    box-shadow: 2px 3px 0 rgba(176, 106, 134, 0.2);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.16s ease, transform 0.16s ease;
    z-index: 5;
  }
  .screen:has(.mood-badge:hover) .stats,
  .screen:has(.mood-badge:focus-visible) .stats,
  .screen:has(.stats:hover) .stats {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  .tools {
    position: absolute;
    bottom: 12px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 10px;
  }
  .tool {
    position: relative;
    display: flex;
  }
  /* Jauge contextuelle : apparaît au-dessus de l'emoji d'action survolé. */
  .tool-bar {
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    width: 84px;
    box-sizing: border-box;
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.97);
    border: 2px solid #e29cbb;
    border-radius: 7px;
    box-shadow: 2px 3px 0 rgba(176, 106, 134, 0.2);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 8;
  }
  /* La 1re/dernière jauge s'aligne sur son bouton pour rester dans l'écran. */
  .tool:first-child .tool-bar { left: 0; transform: none; }
  .tool:last-child .tool-bar { left: auto; right: 0; transform: none; }
  .tool:hover .tool-bar,
  .tool:focus-within .tool-bar {
    opacity: 1;
  }
  .tools button {
    width: 40px;
    height: 40px;
    border: 2px solid #e29cbb;
    border-radius: 6px;
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
