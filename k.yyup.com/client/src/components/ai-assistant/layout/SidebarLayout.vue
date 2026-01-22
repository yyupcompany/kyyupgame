<!--
  AI助手侧边栏布局组件 v2.0

  功能：
  - 侧边栏模式的AI助手布局
  - 精简的UI设计
  - 与MainLayout集成

  使用方式：
  <SidebarLayout
    :visible="visible"
    @close="handleClose"
    @toggle-fullscreen="handleToggleFullscreen"
  >
    <template #chat-container>
      <ChatContainer ... />
    </template>
  </SidebarLayout>
-->

<template>
  <Transition name="sidebar-slide">
    <div v-if="visible" class="ai-sidebar-layout" :style="{ width: sidebarWidth + 'px' }">
      <!-- 侧边栏头部 -->
      <div class="sidebar-header">
        <div class="header-left">
          <!-- AI助手图标 -->
          <div class="ai-service-icon">
            <UnifiedIcon name="ai-center" />
          </div>
          <span class="header-title">AI助手</span>
        </div>
        <div class="header-actions">
          <!-- 切换到全屏模式 -->
          <button
            class="icon-btn"
            @click="emit('toggle-fullscreen')"
            title="全屏模式 (Enter)"
          >
            <UnifiedIcon name="expand" :size="14" />
          </button>

          <!-- 关闭AI助手 -->
          <button
            class="icon-btn close"
            @click="emit('close')"
            title="关闭 (Esc)"
          >
            <UnifiedIcon name="close" :size="14" />
          </button>
        </div>
      </div>

      <!-- 🆕 快捷导航区域 -->
      <div v-if="showQuickActions" class="quick-actions-section">
        <QuickActionsPanel
          display-mode="sidebar"
          :show-title="false"
          @action-click="handleQuickActionClick"
        />
      </div>

      <!-- 聊天容器 -->
      <div class="sidebar-content">
        <slot name="chat-container" />
      </div>

      <!-- 底部快捷键提示 -->
      <div v-if="showShortcuts" class="shortcut-hint">
        <span class="hint-item"><kbd>Enter</kbd> 发送</span>
        <span class="hint-item"><kbd>Esc</kbd> 关闭</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import QuickActionsPanel from '../components/QuickActionsPanel.vue'
import type { QuickAction } from '@/config/ai-quick-actions'

// Props
interface Props {
  visible: boolean
  showShortcuts?: boolean  // 是否显示快捷键提示
  showQuickActions?: boolean  // 是否显示快捷导航
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  showShortcuts: true,
  showQuickActions: true
})

// Emits
const emit = defineEmits<{
  close: []
  'toggle-fullscreen': []
  'quick-action': [text: string, action: QuickAction]
}>()

// 处理快捷导航点击
const handleQuickActionClick = (text: string, action: QuickAction) => {
  console.log('🎯 [SidebarLayout] 快捷导航点击:', { text, action })
  emit('quick-action', text, action)
}

// 侧边栏宽度
const sidebarWidth = ref(400)  // 精简宽度
const minWidth = 320
const maxWidth = 600

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return

  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  } else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
    // 只在输入框外生效
    const activeEl = document.activeElement
    if (activeEl && activeEl.tagName !== 'TEXTAREA' && activeEl.tagName !== 'INPUT') {
      e.preventDefault()
      emit('toggle-fullscreen')
    }
  }
}

onMounted(() => {
  // 加载保存的宽度
  const savedWidth = localStorage.getItem('ai-sidebar-width')
  if (savedWidth) {
    const width = parseInt(savedWidth)
    if (width >= minWidth && width <= maxWidth) {
      sidebarWidth.value = width
    }
  }

  // 键盘事件
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
/* design-tokens 已全局注入 */

.ai-sidebar-layout {
  width: 100%;
  height: 100%;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: var(--shadow-lg);
  border-left: var(--border-width) solid var(--border-color);
}

// 侧边栏头部
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: var(--border-width) solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .ai-service-icon {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-md);
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.el-icon),
      :deep(svg) {
        color: var(--text-on-primary);
        font-size: 14px;
      }
    }

    .header-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
}

// 图标按钮
.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &.close:hover {
    background: var(--danger-color-light-9);
    color: var(--danger-color);
  }
}

// 快捷导航区域
.quick-actions-section {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: var(--border-width) solid var(--border-color);
  background: var(--bg-card);
  flex-shrink: 0;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: var(--radius-full);

    &:hover {
      background: var(--text-placeholder);
    }
  }
}

// 聊天容器
.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: var(--radius-full);

    &:hover {
      background: var(--text-placeholder);
    }
  }
}

// 底部快捷键提示
.shortcut-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-top: var(--border-width) solid var(--border-color);
  background: var(--bg-secondary);
  font-size: 10px;
  color: var(--text-placeholder);
  flex-shrink: 0;

  .hint-item {
    display: flex;
    align-items: center;
    gap: 4px;

    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 16px;
      padding: 0 4px;
      background: var(--bg-tertiary);
      border-radius: var(--radius-2xs);
      font-family: inherit;
      font-size: 10px;
      color: var(--text-secondary);
    }
  }
}

// 侧边栏滑入动画
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(100%);
}

// 暗黑主题
.dark {
  .ai-sidebar-layout {
    background: var(--bg-primary-dark);
    border-left-color: var(--border-color-dark);
  }

  .sidebar-header {
    background: var(--bg-secondary-dark);
    border-bottom-color: var(--border-color-dark);
  }

  .shortcut-hint {
    background: var(--bg-secondary-dark);
    border-top-color: var(--border-color-dark);
  }
}

// 响应式
@media (max-width: var(--breakpoint-md)) {
  .ai-sidebar-layout {
    width: 100% !important;
  }

  .shortcut-hint {
    display: none;
  }
}
</style>

