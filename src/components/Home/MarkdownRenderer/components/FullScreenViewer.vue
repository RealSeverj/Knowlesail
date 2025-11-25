<script setup>
const isFullScreen = defineModel({ type: Boolean })
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-right">
      <div v-if="isFullScreen" class="full-screen-viewer">
        <div class="content">
          <div class="header">
            <var-icon name="chevron-left" @click="isFullScreen = false" />
            <div class="title">可视化面板</div>
            <var-icon name="refresh" />
          </div>
          <div class="main">Htmath插入</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
::-webkit-scrollbar {
  display: block; /* 覆盖全局的display: none */
  width: 6px; /* 纵向滚动条宽度 */
  height: 6px; /* 横向滚动条高度 */
  background: #f3f4f6; /* 滚动条背景色 */
}
::-webkit-scrollbar-thumb {
  border-radius: 3px; /* 滑块圆角 */
  background: #ccc; /* 滑块颜色 */
  transition: background 0.2s;
}

.full-screen-viewer {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  /* 确保外层可被 translateX 移动 */
  will-change: transform, opacity;
  overflow: hidden;
}

.content {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* 横屏样式 */
@media screen and (orientation: landscape) {
  .content {
    transform: none;
    transform-origin: 0 0;
  }

  .slide-right-enter-from,
  .slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0.98;
  }
  .slide-right-enter-to,
  .slide-right-leave-from {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 竖屏样式 */
@media screen and (orientation: portrait) {
  .content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vh; /* 旋转后宽高互换 */
    height: 100vw;
    transform-origin: 0 0;
    transform: rotate(90deg) translateY(-100%);
  }

  .slide-right-enter-from,
  .slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0.98;
  }
  .slide-right-enter-to,
  .slide-right-leave-from {
    transform: translateX(0);
    opacity: 1;
  }
}

.header {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 10px;
  font-size: 14px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  line-height: 1.5;
  color: var(--color-text-secondary);
  background-color: #f3f4f6;
}

.main {
  padding: 20px;
  overflow: auto;
}

/* 过渡动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 300ms ease;
  will-change: transform, opacity;
}
</style>
