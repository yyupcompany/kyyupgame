<!--
  AI助手独立全屏页面布局包装器
  完整的页面布局系统，包含头部、侧边栏、对话区、输入区
  使用插槽模式，各部分可独立替换
  支持抽屉模式收缩侧边栏和会话标签
-->

<template>
  <div class="ai-full-page-layout">
    <!-- 页面容器 -->
    <div class="page-container">
      <!-- 头部插槽 -->
      <header class="page-header-slot">
        <slot name="header">
          <!-- 默认头部内容 -->
        </slot>
      </header>

      <!-- 主内容区 -->
      <div class="page-content">
        <!-- 左侧边栏插槽 - 支持抽屉式收缩 -->
        <aside
          class="page-sidebar-slot"
          :class="{ 'collapsed': sidebarCollapsed, 'drawer-mode': true }"
        >
          <slot name="sidebar">
            <!-- 默认侧边栏内容 -->
          </slot>
        </aside>

        <!-- 中间主区域 -->
        <main class="page-main">
          <!-- 对话区插槽 -->
          <div class="dialog-area-slot">
            <slot name="dialog">
              <!-- 默认对话区内容 -->
            </slot>
          </div>

          <!-- 输入区插槽 -->
          <div class="input-area-slot">
            <slot name="input">
              <!-- 默认输入区内容 -->
            </slot>
          </div>
        </main>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  sidebarCollapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false
})
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.ai-full-page-layout {
  /* 独立全屏页面 - 固定定位，覆盖整个视口 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100dvh;
  height: 100vh;
  background: var(--bg-color-page);
  z-index: 50;
  overflow: hidden;
}

.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
  max-width: 1600px;
  margin: 0 auto;
}

/* 头部插槽区域 */
.page-header-slot {
  flex-shrink: 0;
  width: 100%;
}

/* 主内容区 - 优化间距和分隔 */
.page-content {
  flex: 1;
  display: flex;
  gap: var(--spacing-md);
  overflow: hidden;
  min-height: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin: 0;
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
}

/* 侧边栏插槽 - 优化宽度和边框，简化层级 */
.page-sidebar-slot {
  width: 280px;
  flex-shrink: 0;
  transition: transform var(--transition-base), opacity var(--transition-base);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
  background: var(--bg-card) !important;

  &.collapsed {
    width: 280px;
    opacity: 0;
    transform: translateX(-100%);
    pointer-events: none;
  }
}

/* 主区域 - 优化间距和边框 */
.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  min-width: 0;
  background: transparent;
  padding: 0;
}

/* 对话区插槽 - 只作为容器，不添加样式 */
.dialog-area-slot {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  background: transparent;
  margin-bottom: var(--spacing-md);
}

/* 输入区插槽 - 添加边框和分隔线 */
.input-area-slot {
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  border-top: 2px solid var(--border-color);
  padding: var(--spacing-md);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .page-container {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .page-content {
    gap: var(--spacing-md);
  }

  .page-sidebar-slot {
    width: 260px;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-sm);
  }

  .page-sidebar-slot {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 280px;
    background: var(--bg-card);
    box-shadow: var(--shadow-xl);
    z-index: 100;
    transform: translateX(-100%);
    transition: transform var(--transition-base) cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    border-radius: 0;

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
}

</style>
