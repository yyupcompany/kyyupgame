<template>
  <div class="ai-assistant-page">
    <div class="container">
      <div class="header">
        <h1>AI育儿助手</h1>
        <p class="subtitle">专业的育儿建议，解答您的疑问</p>
      </div>

      <!-- 快捷问题 -->
      <div v-if="quickQuestions.length > 0 && messages.length === 0" class="quick-questions">
        <h3>常见问题</h3>
        <div class="questions-grid">
          <el-button
            v-for="(question, index) in quickQuestions"
            :key="question.id || index"
            @click="handleQuickQuestion(question)"
            class="question-btn"
          >
            {{ question.question }}
          </el-button>
        </div>
      </div>

      <!-- 聊天区域 -->
      <div class="chat-container">
        <div class="messages" ref="messagesRef">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          <div v-if="loading" class="message assistant">
            <div class="message-content">
              <div class="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 建议和资源 -->
        <div v-if="suggestions.length > 0 || relatedResources.length > 0" class="suggestions-panel">
          <div v-if="suggestions.length > 0" class="suggestions-section">
            <h4>建议</h4>
            <ul>
              <li v-for="(suggestion, index) in suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>
          <div v-if="relatedResources.length > 0" class="resources-section">
            <h4>相关资源</h4>
            <div class="resources-list">
              <el-button
                v-for="(resource, index) in relatedResources"
                :key="index"
                text
                type="primary"
                @click="navigateTo(resource.url)"
              >
                {{ resource.title }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题..."
            @keydown.enter.ctrl="handleSend"
            @keydown.enter.exact.prevent="handleSend"
          />
          <div class="input-actions">
            <el-button @click="handleClear">清空</el-button>
            <el-button type="primary" @click="handleSend" :loading="loading">
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const quickQuestions = ref<Array<{ id: string; question: string; category: string; frequency: number; tags: string[] }>>([])
const suggestions = ref<string[]>([])
const relatedResources = ref<Array<{ title: string; url: string }>>([])
const messagesRef = ref<HTMLElement | null>(null)

// 加载快捷问题
const loadQuickQuestions = async () => {
  try {
    const response = await request.get('/api/parent-assistant/quick-questions')
    if (response.data?.success) {
      // 后端返回的数据结构：{ questions: [], categories: [], total: number }
      const data = response.data.data || {}
      quickQuestions.value = data.questions || []
    }
  } catch (error) {
    console.error('加载快捷问题失败:', error)
  }
}

// 处理快捷问题
const handleQuickQuestion = (question: string | { question: string }) => {
  // 兼容字符串和对象两种格式
  const questionText = typeof question === 'string' ? question : question.question
  inputMessage.value = questionText
  handleSend()
}

// 发送消息
const handleSend = async () => {
  const question = inputMessage.value.trim()
  if (!question || loading.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: question,
    timestamp: new Date()
  })

  inputMessage.value = ''
  loading.value = true
  suggestions.value = []
  relatedResources.value = []

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  try {
    const response = await request.post('/api/parent-assistant/answer', {
      question
    })

    if (response.data?.success) {
      const result = response.data.data
      
      // 添加AI回复
      messages.value.push({
        role: 'assistant',
        content: result.answer,
        timestamp: new Date()
      })

      // 显示建议和资源
      if (result.suggestions) {
        suggestions.value = result.suggestions
      }
      if (result.relatedResources) {
        relatedResources.value = result.relatedResources
      }
    } else {
      ElMessage.error('获取回答失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '发送失败')
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 清空对话
const handleClear = () => {
  messages.value = []
  suggestions.value = []
  relatedResources.value = []
}

// 格式化消息
const formatMessage = (content: string): string => {
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 导航
const navigateTo = (url: string) => {
  router.push(url)
}

// 监听消息变化，自动滚动
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

onMounted(() => {
  loadQuickQuestions()
})
</script>

<style scoped lang="scss">
/* 使用设计令牌 */

/* ==================== AI助手页面 ==================== */
.ai-assistant-page {
  min-height: 100vh;
  background: var(--el-fill-color-light);
  padding: var(--spacing-lg);

  .container {
    max-width: var(--breakpoint-xl);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: calc(100vh - var(--spacing-4xl));
  }

  /* ==================== 头部 ==================== */
  .header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);

    h1 {
      margin-bottom: var(--spacing-xs);
      color: var(--el-text-color-primary);
      font-size: var(--text-xl);
      font-weight: 600;
    }

    .subtitle {
      color: var(--el-text-color-secondary);
      font-size: var(--text-sm);
    }
  }

  /* ==================== 快捷问题 ==================== */
  .quick-questions {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-sm);

    h3 {
      margin-bottom: var(--spacing-md);
      color: var(--el-text-color-primary);
      font-size: var(--text-base);
      font-weight: 600;
    }

    .questions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-sm);

      .question-btn {
        white-space: normal;
        height: auto;
        padding: var(--spacing-md);
        text-align: left;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        transition: all var(--transition-base);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      }
    }
  }

  /* ==================== 聊天容器 ==================== */
  .chat-container {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    box-shadow: var(--shadow-sm);
  }

  /* ==================== 消息区域 ==================== */
  .messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);

    .message {
      margin-bottom: var(--spacing-md);

      &.user {
        .message-content {
          background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
          color: white;
          margin-left: auto;
          max-width: 85%;
          border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
        }
      }

      &.assistant {
        .message-content {
          background: var(--el-fill-color-light);
          color: var(--el-text-color-primary);
          margin-right: auto;
          max-width: 85%;
          border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
          border: 1px solid var(--border-color-lighter);
        }
      }

      .message-content {
        padding: var(--spacing-sm) var(--spacing-md);
        display: inline-block;

        .message-text {
          line-height: var(--leading-relaxed);
          font-size: var(--text-sm);
        }

        .message-time {
          font-size: var(--text-xs);
          color: var(--el-text-color-secondary);
          opacity: 0.7;
          margin-top: var(--spacing-xs);
        }
      }

      .loading-dots {
        display: flex;
        gap: var(--spacing-xs);

        span {
          width: var(--spacing-sm);
          height: var(--spacing-sm);
          border-radius: var(--radius-full);
          background: var(--el-color-primary);
          animation: bounce 1.4s infinite ease-in-out both;

          &:nth-child(1) {
            animation-delay: -0.32s;
          }
          &:nth-child(2) {
            animation-delay: -0.16s;
          }
        }
      }
    }
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  /* ==================== 建议面板 ==================== */
  .suggestions-panel {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--el-fill-color-light);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color-lighter);

    h4 {
      margin-bottom: var(--spacing-sm);
      color: var(--el-text-color-primary);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .suggestions-section {
      margin-bottom: var(--spacing-md);

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: var(--spacing-xs) 0;
          color: var(--el-text-color-regular);
          font-size: var(--text-sm);
          border-bottom: 1px solid var(--border-color-lighter);

          &:last-child {
            border-bottom: none;
          }

          &::before {
            content: '•';
            color: var(--el-color-primary);
            margin-right: var(--spacing-xs);
          }
        }
      }
    }

    .resources-section {
      .resources-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
      }
    }
  }

  /* ==================== 输入区域 ==================== */
  .input-container {
    border-top: 1px solid var(--border-color-lighter);
    padding-top: var(--spacing-md);

    :deep(.el-textarea__inner) {
      border-radius: var(--radius-md);
      resize: none;
    }

    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
    }
  }

  /* ==================== 响应式设计 ==================== */
  @media (max-width: var(--breakpoint-md)) {
    padding: var(--spacing-sm);

    .container {
      height: calc(100vh - var(--spacing-2xl));
    }

    .quick-questions {
      .questions-grid {
        grid-template-columns: 1fr;
      }
    }

    .messages .message {
      &.user .message-content,
      &.assistant .message-content {
        max-width: 95%;
      }
    }
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>





