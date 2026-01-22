<!--
  AI助手独立页面 - 左侧边栏组件
  显示会话历史列表
  设计参考：Claude Chat、ChatGPT 风格
-->

<template>
  <div class="full-page-sidebar">
    <!-- 新建对话按钮 -->
    <div class="sidebar-actions">
      <button class="new-conversation-btn" @click="emit('new-conversation')">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke-linecap="round"/>
        </svg>
        <span>新建对话</span>
      </button>
    </div>

    <!-- 会话列表 -->
    <div class="conversation-list-container">
      <div class="conversation-list-header">
        <span class="list-label">最近会话</span>
        <span class="list-count" v-if="conversations.length">{{ conversations.length }}</span>
      </div>

      <div class="conversation-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="conversations.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5"/>
              <path d="M16 20C16 16.686 18.686 14 22 14H26C29.314 14 32 16.686 32 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="24" cy="32" r="3" fill="currentColor"/>
            </svg>
          </div>
          <p>暂无会话记录</p>
          <span>开始一段新的对话吧</span>
        </div>

        <!-- 会话列表 -->
        <div
          v-else
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ 'is-active': conv.id === activeConversationId }"
          @click="emit('select-conversation', conv.id)"
        >
          <div class="conv-indicator"></div>
          <div class="conv-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="conv-content">
            <div class="conv-title">{{ conv.title || '新对话' }}</div>
            <div class="conv-meta">
              <span class="conv-time">{{ formatTime(conv.updatedAt || conv.createdAt) }}</span>
              <span v-if="conv.messageCount" class="conv-count">{{ conv.messageCount }} 条消息</span>
            </div>
          </div>
          <button
            v-if="conv.id === activeConversationId"
            class="conv-delete"
            @click.stop="emit('delete-conversation', conv.id)"
            title="删除会话"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" stroke-linecap="round"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="sidebar-footer">
      <el-tooltip
        :content="usageTooltip"
        placement="top"
        :disabled="!usageTooltip"
      >
        <button class="footer-btn" @click="emit('common-feature', 'statistics')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10M12 20V4M6 20v-6" stroke-linecap="round"/>
          </svg>
          <span>使用统计</span>
        </button>
      </el-tooltip>
      <button 
        class="footer-btn theme-toggle-btn" 
        @click="handleThemeToggle"
        :title="currentTheme === 'dark' ? '切换到明亮主题' : '切换到暗黑主题'"
      >
        <UnifiedIcon :name="currentTheme === 'dark' ? 'sun' : 'moon'" :size="18" />
        <span>主题</span>
      </button>
      <button class="footer-btn" @click="emit('common-feature', 'settings')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-linecap="round"/>
        </svg>
        <span>设置</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { currentTheme as globalTheme, toggleTheme as toggleAppTheme } from '@/utils/theme'

interface Conversation {
  id: string | number
  title?: string
  messageCount?: number
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface Props {
  conversations?: Conversation[]
  activeConversationId?: string | number | null
  loading?: boolean
  tokenUsage?: {
    used?: number
    totalLimit?: number
    today?: number
    remaining?: number
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  conversations: () => [],
  activeConversationId: null,
  loading: false,
  tokenUsage: null
})

interface Emits {
  'new-conversation': []
  'select-conversation': [id: string | number]
  'delete-conversation': [id: string | number]
  'common-feature': [action: string]
}

const emit = defineEmits<Emits>()

// 当前主题（使用全局主题系统）
const currentTheme = ref(globalTheme.value)

// 切换主题
const handleThemeToggle = () => {
  toggleAppTheme()
  currentTheme.value = globalTheme.value
  ElMessage.success(
    currentTheme.value === 'dark'
      ? '已切换到暗黑主题'
      : '已切换到明亮主题'
  )
}

// 使用统计tooltip内容
const usageTooltip = computed(() => {
  if (!props.tokenUsage) {
    return '暂无用量数据'
  }
  
  const used = props.tokenUsage.used || 0
  const total = props.tokenUsage.totalLimit || 100000
  const today = props.tokenUsage.today || 0
  const remaining = props.tokenUsage.remaining || (total - used)
  const percent = total > 0 ? Math.round((used / total) * 100) : 0
  
  return `今日用量: ${today.toLocaleString()}\n总用量: ${used.toLocaleString()} / ${total.toLocaleString()} (${percent}%)\n剩余: ${remaining.toLocaleString()}`
})

// 获取Token用量数据
const fetchTokenUsage = async () => {
  try {
    const token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token')
    if (!token) return

    const response = await fetch('/api/ai/token-monitor/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        // 通过emit传递给父组件更新
        // 这里我们直接使用props，由父组件传递
      }
    }
  } catch (error) {
    console.warn('获取Token用量失败:', error)
  }
}

onMounted(() => {
  fetchTokenUsage()
})

// 格式化时间
const formatTime = (time?: string | Date): string => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 今天
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getDate() === yesterday.getDate()) {
    return '昨天'
  }
  // 其他
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.full-page-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

/* 暗色主题适配 */
:global([data-theme="dark"]) .full-page-sidebar,
:global(.theme-dark) .full-page-sidebar {
  background: var(--bg-card);

  .sidebar-actions {
    background: rgba(255, 255, 255, 1) !important;
    background-image: none;
    border: none;
  }

  .conversation-item {
    &:hover {
      background: var(--bg-hover);
    }

    &.is-active {
      background: var(--bg-secondary-dark);
      border-color: var(--border-color-dark);

      .conv-title {
        color: var(--text-primary-dark);
      }

      .conv-icon {
        background: var(--primary-color);
        color: var(--text-on-primary);

        svg {
          stroke: var(--text-on-primary);
        }
      }
    }

    .conv-count {
      background: var(--bg-tertiary-dark);
    }
  }

  .sidebar-footer {
    border-top-color: var(--border-color-dark);
    background: var(--bg-card) !important;
  }

  .conversation-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}


/* 新建对话按钮区域 */
.sidebar-actions {
  padding: var(--spacing-lg) var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary) !important;
  background-image: none;
  border: none;
  box-shadow: none;

  /* 暗黑主题：与侧栏保持一致的深色背景 */
  :global([data-theme="dark"]) :deep(.full-page-sidebar .sidebar-actions),
  :global(.theme-dark) :deep(.full-page-sidebar .sidebar-actions) {
    background: var(--bg-secondary-dark) !important;
    border: none;
    box-shadow: none;
  }

  .new-conversation-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    height: 36px;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);

    /* 暗黑主题下按钮背景同步变暗 */
    :global([data-theme="dark"]) :deep(.full-page-sidebar .sidebar-actions .new-conversation-btn),
    :global(.theme-dark) :deep(.full-page-sidebar .sidebar-actions .new-conversation-btn) {
      background: var(--bg-card);
      border-color: var(--border-color-dark);
      color: var(--text-primary);

      &:hover {
        background: var(--bg-hover);
        border-color: var(--primary-light);
        color: var(--primary-light);
      }
    }

    .btn-icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    &:hover {
      background: var(--bg-hover);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

/* 会话列表容器 */
.conversation-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.conversation-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-sm);
  flex-shrink: 0;

  .list-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .list-count {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-tertiary);
    background: var(--bg-color);
    padding: 2px 8px;
    border-radius: var(--radius-full);
  }
}

/* 会话列表 */
.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--spacing-sm);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  gap: var(--spacing-sm);

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
  text-align: center;

  .empty-icon {
    width: 40px;
    height: 40px;
    margin-bottom: var(--spacing-md);
    color: var(--text-tertiary);
    opacity: 0.5;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  p {
    margin: 0 0 var(--spacing-xs);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  span {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }
}

/* 会话项 */
.conversation-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: 2px;
  position: relative;
  border: 1px solid transparent;

  &:hover {
    background: var(--bg-hover);

    .conv-delete {
      opacity: 1;
    }
  }

  &.is-active {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color-light);

    .conv-indicator {
      opacity: 1;
      background: var(--primary-color);
    }

    .conv-title {
      color: var(--text-primary);
      font-weight: 600;
    }

    .conv-icon {
      background: var(--primary-color);
      color: var(--text-on-primary);

      svg {
        stroke: var(--text-on-primary);
      }
    }
  }

  .conv-indicator {
    width: 3px;
    height: 20px;
    background: var(--primary-color);
    border-radius: var(--radius-full);
    opacity: 0;
    transition: opacity var(--transition-fast);
    flex-shrink: 0;
  }

  .conv-icon {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all var(--transition-fast);

    svg {
      width: 14px;
      height: 14px;
      stroke: var(--primary-color);
    }
  }

  .conv-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .conv-title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
    transition: color var(--transition-fast);
  }

  .conv-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .conv-count {
    background: var(--bg-tertiary);
    padding: 1px 6px;
    border-radius: var(--radius-full);
  }

  .conv-delete {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--text-tertiary);
    cursor: pointer;
    opacity: 0;
    transition: all var(--transition-fast);
    flex-shrink: 0;

    svg {
      width: 14px;
      height: 14px;
      stroke: currentColor;
    }

    &:hover {
      background: var(--danger-light-bg);
      color: var(--danger-color);
    }
  }
}

/* 底部工具栏 */
.sidebar-footer {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-sm);
  border-top: 1px solid var(--border-color-light);
  background: var(--bg-card) !important;
  flex-shrink: 0;
  gap: var(--spacing-xs);

  .footer-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 11px;
    flex: 1;

    svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      transition: stroke var(--transition-fast);
    }

    span {
      font-weight: 500;
    }

    &:hover {
      background: var(--bg-hover);
      border-color: var(--primary-color);
      color: var(--primary-color);

      svg {
        stroke: var(--primary-color);
      }
    }

    &.theme-toggle-btn {
      :deep(.unified-icon) {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

/* 滚动条样式 */
.conversation-list::-webkit-scrollbar {
  width: 4px;
}

.conversation-list::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);

  &:hover {
    background: var(--text-tertiary);
  }
}
</style>
