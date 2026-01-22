<!--
  AI助手独立页面 - 对话区组件
  显示欢迎界面和消息列表
-->

<template>
  <!-- 简化层级：直接使用div，只有一层背景 -->
  <div class="full-page-dialog">
    <!-- 欢迎界面 -->
    <div v-if="!hasMessages" class="ai-welcome-section">
      <!-- 欢迎头部 -->
      <div class="welcome-header">
        <UnifiedIcon name="robot" :size="48" class="welcome-icon" />
        <h3 class="welcome-title">{{ welcomeTitle }}</h3>
        <p class="welcome-text">{{ welcomeText }}</p>
      </div>

      <!-- 快捷导航区域 - 简化，无额外背景框 -->
      <div class="quick-nav-section">
        <div class="section-header">
          <UnifiedIcon name="lightning" :size="16" />
          <span>快捷导航</span>
        </div>
        <QuickActionsPanel
          display-mode="fullpage"
          :show-title="false"
          :icon-size="18"
          @action-click="handleQuickActionClick"
        />
      </div>

      <!-- 建议问题 -->
      <div class="welcome-suggestions">
        <span class="suggestion-label">不知道怎么问？试试：</span>
        <div class="suggestion-chips">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            class="suggestion-chip"
            @click="emit('suggestion-click', suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div v-else class="message-list">
      <slot name="messages">
        <!-- 消息内容插槽 -->
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import QuickActionsPanel from '../../components/QuickActionsPanel.vue'
import type { QuickAction } from '@/config/ai-quick-actions'

interface Props {
  hasMessages?: boolean
  welcomeTitle?: string
  welcomeText?: string
  suggestions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  hasMessages: false,
  welcomeTitle: '您好！我是AI助手',
  welcomeText: '我可以帮助您处理各种任务，有什么可以帮助您的吗？',
  suggestions: () => [
    '生成招生推文，突出亮点课程亮点',
    '制定家长会流程并输出提醒',
    '汇总今日出勤并给出家长通知'
  ]
})

interface Emits {
  'quick-action': [text: string, action: QuickAction]
  'suggestion-click': [suggestion: string]
}

const emit = defineEmits<Emits>()

// 处理快捷操作点击
const handleQuickActionClick = (text: string, action: QuickAction) => {
  emit('quick-action', text, action)
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

/* 简化层级：只有一层背景框 - 添加边框 */
.full-page-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-height: 100%;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
}

/* 欢迎界面 - 优化布局：紧凑居中 */
.ai-welcome-section {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl) var(--spacing-xl);
  overflow-y: auto;
  flex: 1;
  background: transparent;
  justify-content: flex-start;  /* 改为从上开始，避免内容分散 */
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding-top: 10%;  /* 顶部留白，让内容视觉居中 */
}

/* 欢迎头部 - 优化间距和宽度 */
.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0;
  margin-bottom: var(--spacing-xl);
  background: transparent;
  width: 100%;
  box-sizing: border-box;
}

.welcome-icon {
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);  /* 减少间距 */
  width: 64px;  /* 缩小图标 */
  height: 64px;
}

.welcome-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-xl);  /* 减小标题字号 */
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1.4;
}

.welcome-text {
  margin: 0;
  font-size: var(--text-sm);  /* 减小描述字号 */
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 400px;
}

/* 快捷导航区域 - 充分利用宽度 */
.quick-nav-section {
  margin-bottom: var(--spacing-xl);
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border: none;
  padding: 0 var(--spacing-lg);  /* 左右留少量边距 */

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-sm);  /* 减小标题字号 */
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);  /* 减少间距 */
    justify-content: center;

    .unified-icon {
      color: var(--primary-color);
    }
  }
}

/* 建议问题 - 优化布局和宽度 */
.welcome-suggestions {
  margin-top: 0;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: center;
  width: 100%;
  padding: 0 var(--spacing-lg);  /* 左右留少量边距 */
  box-sizing: border-box;
}

.suggestion-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.suggestion-chips {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.suggestion-chip {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-card);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-light-bg, rgba(99, 102, 241, 0.05));
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
}

/* 消息列表 - 添加内边距和边框 */
.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: var(--spacing-lg);
  min-height: 0;
  scroll-behavior: smooth;
  border-top: 1px solid var(--border-color-light);
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar,
.ai-welcome-section::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track,
.ai-welcome-section::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.message-list::-webkit-scrollbar-thumb,
.ai-welcome-section::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);

  &:hover {
    background: var(--text-placeholder);
  }
}
</style>

