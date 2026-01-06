<!--
  AI助手独立页面 - 对话区组件
  显示欢迎界面和消息列表
-->

<template>
  <el-card class="full-page-dialog" shadow="never">
    <!-- 欢迎界面 -->
    <div v-if="!hasMessages" class="welcome-section">
      <!-- ✨ 修复：使用 robot 机器人图标(有天线)替代 cpu 图标 -->
      <UnifiedIcon name="robot" :size="64" class="welcome-icon" />
      <h3 class="welcome-title">{{ welcomeTitle }}</h3>
      <p class="welcome-text">{{ welcomeText }}</p>
      
      <!-- 功能标签 -->
      <div class="welcome-badges">
        <span v-for="badge in badges" :key="badge">{{ badge }}</span>
      </div>

      <!-- 快速操作按钮 -->
      <div class="quick-actions">
        <el-button 
          v-for="action in quickActions" 
          :key="action.label"
          :type="action.type || 'default'"
          :plain="action.plain"
          @click="emit('quick-action', action.action)"
        >
          <UnifiedIcon :name="action.icon" :size="16" />
          {{ action.label }}
        </el-button>
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
  </el-card>
</template>

<script setup lang="ts">
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface QuickAction {
  label: string
  icon: string
  action: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  plain?: boolean
}

interface Props {
  hasMessages?: boolean
  welcomeTitle?: string
  welcomeText?: string
  badges?: string[]
  quickActions?: QuickAction[]
  suggestions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  hasMessages: false,
  welcomeTitle: '您好！我是AI助手',
  welcomeText: '我可以帮助您处理各种任务，有什么可以帮助您的吗？',
  badges: () => ['场景洞察', '步骤指导', '数据生成'],
  quickActions: () => [
    { label: '智能创建活动', icon: 'document', action: 'create-activity', type: 'primary' },
    { label: '数据分析', icon: 'data-analysis', action: 'data-analysis', plain: true },
    { label: '任务管理', icon: 'list', action: 'task-management', plain: true }
  ],
  suggestions: () => [
    '生成招生推文，突出亮点课程亮点',
    '制定家长会流程并输出提醒',
    '汇总今日出勤并给出家长通知'
  ]
})

interface Emits {
  'quick-action': [action: string]
  'suggestion-click': [suggestion: string]
}

const emit = defineEmits<Emits>()
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.full-page-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  /* ✨ 修复：确保对话框不超出父容器 */
  overflow: hidden;
  max-height: 100%;

  :deep(.el-card__body) {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* ✨ 修复：改为hidden，让内部滚动 */
  }
}

/* 欢迎界面 */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
  border-radius: var(--radius-xl);
  background: var(--bg-tertiary, linear-gradient(145deg, var(--primary-color-alpha-light), var(--primary-color-alpha-lighter)));
  border: 1px solid var(--border-color);
  flex: 1;
}

.welcome-icon {
  color: var(--primary-color);
  margin-bottom: var(--spacing-lg);
}

.welcome-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.welcome-text {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.welcome-badges {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: var(--spacing-lg);

  span {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    background: var(--primary-color-ultra-light);
    color: var(--primary-color);
    font-size: var(--text-xs);
  }
}

.quick-actions {
  // ✨ 优化：改为2列网格布局,更紧凑
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  justify-items: center;
  margin-bottom: var(--spacing-lg);
  max-width: 600px; // 限制最大宽度,避免过度拉伸

  :deep(.el-button) {
    width: 100%;
    min-width: unset; // ✨ 移除固定最小宽度,让grid自动分配
    max-width: 280px; // 限制单个按钮最大宽度
  }

  // ✨ 响应式：小屏幕保持单列
  @media (max-width: var(--breakpoint-sm)) {
    grid-template-columns: 1fr;
  }
}

.welcome-suggestions {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: center;
  width: 100%;
  max-width: 800px;
}

.suggestion-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.suggestion-chips {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: center;
}

.suggestion-chip {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: 6px var(--spacing-md);
  background: var(--bg-card);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }
}

/* 消息列表 */
.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: var(--spacing-md);
  /* ✨ 修复：确保滚动条正常工作 */
  min-height: 0;
  /* ✨ 修复：使用平滑滚动 */
  scroll-behavior: smooth;
}

/* 滚动条样式 - 消息列表 */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.message-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);

  &:hover {
    background: var(--text-placeholder);
  }
}

/* 保持el-card__body的滚动条样式（欢迎界面需要） */
:deep(.el-card__body)::-webkit-scrollbar {
  width: 6px;
}

:deep(.el-card__body)::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

:deep(.el-card__body)::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);

  &:hover {
    background: var(--text-placeholder);
  }
}
</style>

