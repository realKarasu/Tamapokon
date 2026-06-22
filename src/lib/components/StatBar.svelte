<script lang="ts">
  let { icon, value, color = "#f3a9cb" }: { icon: string; value: number; color?: string } =
    $props();
</script>

<div class="stat" title={`${Math.round(value)}%`}>
  <span class="icon">{icon}</span>
  <div class="track">
    <div class="fill" style:width={`${Math.max(0, Math.min(100, value))}%`} style:background={color}></div>
  </div>
</div>

<style>
  .stat {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .icon {
    font-size: 13px;
    width: 16px;
    text-align: center;
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
    transition: width 0.3s ease;
  }
</style>
