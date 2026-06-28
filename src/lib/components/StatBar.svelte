<script lang="ts">
  import Icon from "./Icon.svelte";
  let {
    name,
    fallback,
    value,
    color = "#f3a9cb",
  }: { name: string; fallback: string; value: number; color?: string } = $props();
</script>

<div class="stat" title={`${Math.round(value)}%`}>
  <span class="icon"><Icon {name} {fallback} size={22} /></span>
  <div class="track">
    <div class="fill" style:width={`${Math.max(0, Math.min(100, value))}%`} style:background={color}></div>
  </div>
</div>

<style>
  .stat { display: flex; align-items: center; gap: 6px; }
  .icon { width: 24px; text-align: center; }
  .track {
    flex: 1; height: 12px; border: 2px solid #e29cbb;
    border-radius: 3px; background: #fff; overflow: hidden;
  }
  .fill { height: 100%; transition: width 0.3s ease; }
</style>
