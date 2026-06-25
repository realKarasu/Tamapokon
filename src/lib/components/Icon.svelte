<script lang="ts">
  import { iconSrc, moodSrc } from "$lib/game/config";

  let {
    name,
    kind = "icon",
    fallback,
    size = 16,
  }: { name: string; kind?: "icon" | "mood"; fallback: string; size?: number } = $props();

  // Si le PNG n'existe pas encore (asset non généré), on retombe sur l'emoji Unicode.
  let failed = $state(false);
  const src = $derived(kind === "mood" ? moodSrc(name) : iconSrc(name));
</script>

{#if failed}
  <span class="emoji" style:font-size={`${size}px`}>{fallback}</span>
{:else}
  <img
    class="pixel ico"
    src={src}
    alt={fallback}
    style:width={`${size}px`}
    style:height={`${size}px`}
    onerror={() => (failed = true)}
  />
{/if}

<style>
  .ico {
    object-fit: contain;
    display: inline-block;
    vertical-align: middle;
  }
  .emoji {
    line-height: 1;
    display: inline-block;
    vertical-align: middle;
  }
</style>
