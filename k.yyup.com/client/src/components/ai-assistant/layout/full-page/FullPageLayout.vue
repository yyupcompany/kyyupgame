<!--
  AI助手独立全屏页面布局包装器
  完整的页面布局系统,包含头部、侧边栏、对话区、输入区
  使用插槽模式,各部分可独立替换
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
          <!-- 侧边栏内容 -->
          <div class="sidebar-content">
            <slot name="sidebar">
              <!-- 默认侧边栏内容 -->
            </slot>
          </div>
        </aside>

        <!-- 中间主区域 -->
        <main class="page-main">
          <!-- 会话管理标签页 - 可折叠抽屉 -->
          <div 
            class="conversation-section" 
            :class="{ 'collapsed': conversationCollapsed }"
          >
            <div class="conversation-header">
              <ConversationTabs />
              <button 
                class="collapse-btn"
                @click="toggleConversation"
                :title="conversationCollapsed ? '展开会话' : '收起会话'"
              >
                <span class="collapse-icon" :class="{ 'rotated': conversationCollapsed }">▼</span>
              </button>
            </div>
          </div>

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

      <!-- 底部快捷键提示 -->
      <div v-if="showShortcuts" class="shortcut-hint">
        <span class="hint-item"><kbd>Enter</kbd> 发送</span>
        <span class="hint-item"><kbd>Shift+Enter</kbd> 换行</span>
        <span class="hint-item"><kbd>Esc</kbd> 关闭</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// 会话管理组件
import ConversationTabs from '../../components/ConversationTabs.vue'

interface Props {
  sidebarCollapsed?: boolean
  showShortcuts?: boolean  // 是否显示快捷键提示
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false,
  showShortcuts: true
})

interface Emits {
  'update:sidebarCollapsed': [value: boolean]
  'update:conversationCollapsed': [value: boolean]
}

const emit = defineEmits<Emits>()

// 会话标签折叠状态
const conversationCollapsed = ref(false)

const toggleConversation = () => {
  conversationCollapsed.value = !conversationCollapsed.value
  emit('update:conversationCollapsed', conversationCollapsed.value)
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.ai-full-page-layout {
  /* 独立全屏页面 - 固定定位,覆盖整个视口 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  /* ✨ 修复：使用 dvh 替代 vh，避免移动端地址栏遮挡 */
  height: 100dvh;
  height: 100vh; /* 降级方案，不支持 dvh 的浏览器 */
  background: var(--bg-primary);
  /* ✨ 修复：使用 z-index 分层系统 */
  z-index: 50; /* modal 层级 */
  overflow: hidden;
}

.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  gap: var(--spacing-xs);
}

/* 头部插槽区域 */
.page-header-slot {
  flex-shrink: 0;
  width: 100%;
}

/* 主内容区 */
.page-content {
  flex: 1;
  display: flex;
  gap: var(--spacing-sm);
  overflow: hidden;
  min-height: 0;
}

/* 侧边栏插槽 - 抽屉模式 */
.page-sidebar-slot {
  width: 320px; /* ✨ 优化：从220px增加到320px，扩大100px */
  flex-shrink: 0;
  /* ✨ 优化：使用 transform 和 opacity 进行 GPU 加速动画 */
  transition: transform var(--transition-base), opacity var(--transition-base);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity; /* 提示浏览器优化 */

  &.drawer-mode {
    /* 抽屉模式样式 */
  }

  &.collapsed {
    /* ✨ 优化：不使用 width 动画，改用 transform 提升性能 */
    width: 320px; /* 保持宽度不变，与上面一致 */
    opacity: 0;
    transform: translateX(-100%); /* 完全移出视口 */
    pointer-events: none; /* 禁用交互 */
  }
}

/* 侧边栏内容区域 */
.sidebar-content {
  flex: 1;
  overflow: hidden;
}

/* 会话管理区域 - 可折叠抽屉 */
.conversation-section {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
  transition: max-height var(--transition-base), opacity var(--transition-base);
  max-height: 60px;
  overflow: hidden;

  &.collapsed {
    max-height: 0;
    border-bottom: none;
    opacity: 0.5;
  }
}

.conversation-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding-right: var(--spacing-xs);
}

.collapse-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  color: var(--text-secondary);

  &:hover {
    background: var(--bg-active);
    color: var(--primary-color);
  }
}

.collapse-icon {
  font-size: 10px;
  transition: transform var(--transition-base);

  &.rotated {
    transform: rotate(-90deg);
  }
}

/* 主区域 */
.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  overflow: hidden;
  min-width: 0;
}

/* 对话区插槽 - 最大化空间 */
.dialog-area-slot {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* 输入区插槽 */
.input-area-slot {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .page-sidebar-slot {
    width: 200px;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-xs);
  }

  .page-sidebar-slot {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 240px;
    background: var(--bg-card);
    box-shadow: var(--shadow-lg);
    z-index: 10;
    /* ✨ 优化：默认是折叠状态，通过 transform 切换 */
    transform: translateX(-100%);
    transition: transform var(--transition-base) cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
}

/* 底部快捷键提示 */
.shortcut-hint {
  position: fixed;
  bottom: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  z-index: var(--z-fixed);

  .hint-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);

    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 18px;
      padding: 0 var(--spacing-xs);
      background: var(--bg-tertiary);
      border: var(--border-width) solid var(--border-color);
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 10px;
      color: var(--text-secondary);
    }
  }
}

/* 暗黑主题适配 */
.dark {
  .shortcut-hint {
    background: var(--bg-tertiary);
    border-color: var(--border-color-dark);

    .hint-item kbd {
      background: var(--bg-secondary-dark);
      border-color: var(--border-color-dark);
    }
  }
}

/* 移动端隐藏快捷键提示 */
@media (max-width: var(--breakpoint-md)) {
  .shortcut-hint {
    display: none;
  }
}
</style>

