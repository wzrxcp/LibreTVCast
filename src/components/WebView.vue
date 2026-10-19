<template>
  <div class="tv-placeholder">
    <p class="loading">正在加载 LibreTV…</p>
    <p class="hint">按遥控器「返回」键可回到设置页</p>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";

export default {
  data() {
    return {
      url: localStorage.getItem("videoUrl") || "",
      listener: null,
    };
  },
  async mounted() {
    // 没有有效地址时直接回到设置页，避免加载失效/空站点
    if (!this.url) {
      this.$emit("hidden");
      return;
    }
    try {
      const TvOverlay = Capacitor.Plugins.TvOverlay;
      if (!TvOverlay) {
        console.error("TvOverlay plugin not available");
        return;
      }
      this.listener = await TvOverlay.addListener("overlayHidden", () => {
        this.$emit("hidden");
      });
      await TvOverlay.show({ url: this.url });
    } catch (e) {
      console.error("TvOverlay show failed:", e);
    }
  },
  beforeUnmount() {
    if (this.listener && this.listener.remove) {
      this.listener.remove();
    }
  },
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

.tv-placeholder {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0b0b0f;
  color: #e5e7eb;
}

.tv-placeholder .loading {
  font-size: 22px;
}

.tv-placeholder .hint {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}
</style>
