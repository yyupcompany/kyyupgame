<template>
  <div class="ai-assistant-container" :class="{ 'ai-assistant-container--mobile': isMobile }">
    <!-- Top Bar -->
    <div class="ai-assistant-top-bar">
      <div class="top-bar-left">
        <div class="ai-avatar">
          <UnifiedIcon name="brain" :size="24" />
        </div>
        <div class="ai-info">
          <h3 class="ai-title">AI 助手</h3>
          <div class="ai-status">
            <span class="status-indicator online"></span>
            <span class="status-text">在线</span>
          </div>
        </div>
      </div>
      <div class="top-bar-right">
        <button class="icon-btn" :title="isSidebarOpen ? '收起侧边栏' : '展开侧边栏'" @click="toggleSidebar">
          <UnifiedIcon :name="isSidebarOpen ? 'chevron-left' : 'menu'" :size="20" />
        </button>
        <button class="icon-btn" title="设置">
          <UnifiedIcon name="settings" :size="20" />
        </button>
      </div>
    </div>

    <div class="ai-assistant-main">
      <!-- Sidebar -->
      <aside class="ai-sidebar" :class="{ 'closed': !isSidebarOpen }">
        <div class="sidebar-section">
          <h4 class="sidebar-title">
            <UnifiedIcon name="message-circle" :size="16" />
            聊天
          </h4>
          <div class="sidebar-item active">
            <UnifiedIcon name="message-circle" :size="14" />
            <span>新对话</span>
          </div>
        </div>

        <div class="sidebar-section">
          <h4 class="sidebar-title">
            <UnifiedIcon name="history" :size="16" />
            历史记录
          </h4>
          <div class="sidebar-item">
            <UnifiedIcon name="clock" :size="14" />
            <span>昨天</span>
          </div>
          <div class="sidebar-item">
            <UnifiedIcon name="clock" :size="14" />
            <span>本周</span>
          </div>
        </div>

        <div class="sidebar-section">
          <h4 class="sidebar-title">
            <UnifiedIcon name="star" :size="16" />
            保存的提示词
          </h4>
          <div class="sidebar-item">
            <UnifiedIcon name="star" :size="14" />
            <span>创建活动</span>
          </div>
          <div class="sidebar-item">
            <UnifiedIcon name="star" :size="14" />
            <span>检查考勤</span>
          </div>
          <div class="sidebar-item">
            <UnifiedIcon name="star" :size="14" />
            <span>生成报告</span>
          </div>
        </div>

        <div class="sidebar-section">
          <h4 class="sidebar-title">
            <UnifiedIcon name="cog" :size="16" />
            设置
          </h4>
          <div class="sidebar-item">
            <UnifiedIcon name="user" :size="14" />
            <span>个人设置</span>
          </div>
          <div class="sidebar-item">
            <UnifiedIcon name="bell" :size="14" />
            <span>通知</span>
          </div>
        </div>
      </aside>

      <!-- Chat Container -->
      <div class="chat-container">
        <div class="message-list">
          <!-- Welcome Message -->
          <div class="welcome-message">
            <div class="welcome-icon">
              <UnifiedIcon name="brain" :size="48" />
            </div>
            <h2 class="welcome-title">您好！</h2>
            <p class="welcome-text">我是您的AI助手，有什么可以帮助您的吗？</p>
          </div>

          <!-- Example Messages -->
          <div class="message user-message">
            <div class="message-content">
              <div class="message-text">创建一个2025年春季的新生入学活动</div>
              <div class="message-time">10:30</div>
            </div>
          </div>

          <div class="message ai-message">
            <div class="message-content">
              <div class="message-text">已为您创建2025年春季新生入学活动，包含以下内容：</div>
              <div class="message-time">10:31</div>
            </div>
          </div>
        </div>

        <!-- Prompt Suggestions -->
        <div class="prompt-suggestions">
          <div class="suggestion-tag" @click="selectPrompt('创建一个亲子活动')">
            <UnifiedIcon name="plus" :size="12" />
            创建一个亲子活动
          </div>
          <div class="suggestion-tag" @click="selectPrompt('统计本月考勤情况')">
            <UnifiedIcon name="calendar" :size="12" />
            统计本月考勤情况
          </div>
          <div class="suggestion-tag" @click="selectPrompt('生成学生成长报告')">
            <UnifiedIcon name="file-text" :size="12" />
            生成学生成长报告
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <div class="input-container">
            <button class="input-btn" title="附件">
              <UnifiedIcon name="paperclip" :size="20" />
            </button>
            <textarea
              class="message-input"
              v-model="inputMessage"
              placeholder="输入您的问题或需求..."
              rows="1"
              @input="autoResize"
              @keydown.enter.exact="sendMessage"
              @keydown.enter.shift="handleShiftEnter"
            ></textarea>
            <button class="input-btn" title="工具">
              <UnifiedIcon name="wrench" :size="20" />
            </button>
            <button class="send-btn" @click="sendMessage" title="发送">
              <UnifiedIcon name="send" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

const inputMessage = ref('')
const isSidebarOpen = ref(true)
const isMobile = ref(false)

const sendMessage = () => {
  if (inputMessage.value.trim()) {
    // Send message logic
    console.log('Sending message:', inputMessage.value)
    inputMessage.value = ''
    autoResize()
  }
}

const handleShiftEnter = (event: KeyboardEvent) => {
  // Allow newline with Shift+Enter
  event.preventDefault()
  inputMessage.value += '\n'
  nextTick(() => {
    autoResize()
  })
}

const autoResize = () => {
  const textarea = document.querySelector('.message-input') as HTMLTextAreaElement
  if (textarea) {
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 150)
    textarea.style.height = `${newHeight}px`
  }
}

const selectPrompt = (prompt: string) => {
  inputMessage.value = prompt
  autoResize()
  const textarea = document.querySelector('.message-input') as HTMLTextAreaElement
  textarea?.focus()
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
// Bright mode theme using project design tokens
.ai-assistant-container {
  width: 100%;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-family);
  overflow: hidden;

  &--mobile {
    max-width: 100%;
  }
}

.ai-assistant-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  z-index: 10;

  .top-bar-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .ai-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--border-radius-full);
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .ai-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .ai-title {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .ai-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-xs);
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: var(--border-radius-full);

    &.online {
      background-color: var(--success-color);
      box-shadow: 0 0 8px var(--success-color);
      animation: pulse 2s infinite;
    }
  }

  .top-bar-right {
    display: flex;
    gap: var(--spacing-xs);
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius-md);
    border: none;
    background-color: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-normal);

    &:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }
  }
}

.ai-assistant-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - var(--header-height));
}

.ai-sidebar {
  width: 280px;
  background-color: var(--bg-card);
  border-right: 1px solid var(--border-color);
  padding: var(--spacing-md);
  overflow-y: auto;
  transition: all var(--transition-normal);

  &.closed {
    width: 0;
    padding: 0;
    overflow: hidden;
  }

  .sidebar-section {
    margin-bottom: var(--spacing-xl);
  }

  .sidebar-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--text-tertiary);
    text-transform: uppercase;
    margin-bottom: var(--spacing-sm);
    letter-spacing: 0.5px;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    transition: all var(--transition-fast);

    &:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }

    &.active {
      background-color: var(--bg-primary);
      color: var(--primary-color);
      font-weight: var(--font-medium);
      border-left: 3px solid var(--primary-color);
    }
  }
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  overflow: hidden;
}

.message-list {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);

  .welcome-message {
    text-align: center;
    margin: var(--spacing-xl) 0;
    padding: var(--spacing-xl);
    background-color: var(--bg-card);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);

    .welcome-icon {
      margin-bottom: var(--spacing-md);
    }

    .welcome-title {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-2xl);
      color: var(--text-primary);
    }

    .welcome-text {
      margin: 0;
      font-size: var(--text-base);
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }
  }

  .message {
    display: flex;

    &.user-message {
      justify-content: flex-end;
    }

    &.ai-message {
      justify-content: flex-start;
    }

    .message-content {
      max-width: 75%;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .message-text {
      padding: var(--spacing-md);
      border-radius: var(--border-radius-lg);
      line-height: 1.6;
      font-size: var(--text-base);
      word-wrap: break-word;

      .user-message & {
        background-color: var(--primary-color);
        color: white;
        border-bottom-right-radius: var(--border-radius-sm);
      }

      .ai-message & {
        background-color: var(--bg-card);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        border-bottom-left-radius: var(--border-radius-sm);
      }
    }

    .message-time {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
      padding: 0 var(--spacing-xs);

      .user-message & {
        align-self: flex-end;
      }

      .ai-message & {
        align-self: flex-start;
      }
    }
  }
}

.prompt-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-card);
  overflow-x: auto;

  .suggestion-tag {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-full);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;

    &:hover {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  }
}

.input-area {
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);

  .input-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius-md);
    border: none;
    background-color: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-normal);
    flex-shrink: 0;

    &:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }
  }

  .message-input {
    flex: 1;
    min-height: 36px;
    max-height: 150px;
    border: none;
    background-color: transparent;
    color: var(--text-primary);
    font-size: var(--text-base);
    font-family: inherit;
    resize: none;
    padding: var(--spacing-xs) 0;
    outline: none;
    overflow-y: auto;

    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  .send-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--border-radius-md);
    border: none;
    background-color: var(--primary-color);
    color: white;
    cursor: pointer;
    transition: all var(--transition-normal);
    flex-shrink: 0;

    &:hover {
      background-color: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

// Animations
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

// Responsive Design
@media (max-width: var(--breakpoint-md)) {
  .ai-sidebar {
    position: absolute;
    left: 0;
    top: var(--header-height);
    height: calc(100vh - var(--header-height));
    z-index: 100;
    box-shadow: var(--shadow-lg);

    &.closed {
      left: -280px;
    }
  }

  .message .message-content {
    max-width: 90%;
  }

  .ai-assistant-main {
    position: relative;
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .ai-assistant-top-bar {
    padding: var(--spacing-md);
  }

  .ai-avatar {
    width: 36px;
    height: 36px;
  }

  .ai-title {
    font-size: var(--text-base);
  }

  .icon-btn {
    width: 32px;
    height: 32px;
  }

  .message-list {
    padding: var(--spacing-md);
  }

  .prompt-suggestions {
    padding: var(--spacing-sm);
  }

  .input-area {
    padding: var(--spacing-md);
  }
}
</style>
