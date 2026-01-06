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
            :key="index"
            @click="handleQuickQuestion(question)"
            class="question-btn"
          >
            {{ question }}
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
const quickQuestions = ref<string[]>([])
const suggestions = ref<string[]>([])
const relatedResources = ref<Array<{ title: string; url: string }>>([])
const messagesRef = ref<HTMLElement | null>(null)

// 加载快捷问题
const loadQuickQuestions = async () => {
  try {
    const response = await request.get('/api/parent-assistant/quick-questions')
    if (response.data?.success) {
      quickQuestions.value = response.data.data || []
    }
  } catch (error) {
    console.error('加载快捷问题失败:', error)
  }
}

// 处理快捷问题
const handleQuickQuestion = (question: string) => {
  inputMessage.value = question
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
.ai-assistant-page {
  min-height: 100vh;
  background: var(--bg-hover);
  padding: var(--text-2xl);

  .container {
    max-width: 1000px;
    margin: 0 auto;

    .header {
      text-align: center;
      margin-bottom: var(--spacing-8xl);

      h1 {
        margin-bottom: var(--spacing-2xl);
        color: var(--text-primary);
      }

      .subtitle {
        color: var(--text-secondary);
      }
    }

    .quick-questions {
      background: white;
      border-radius: var(--spacing-sm);
      padding: var(--spacing-8xl);
      margin-bottom: var(--text-2xl);

      h3 {
        margin-bottom: var(--text-2xl);
        color: var(--text-primary);
      }

      .questions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-2xl);

        .question-btn {
          white-space: normal;
          height: auto;
          padding: var(--spacing-4xl);
          text-align: left;
        }
      }
    }

    .chat-container {
      background: white;
      border-radius: var(--spacing-sm);
      padding: var(--text-2xl);
      display: flex;
      flex-direction: column;
      height: 600px;

      .messages {
        flex: 1;
        overflow-y: auto;
        margin-bottom: var(--text-2xl);
        padding: var(--spacing-2xl);

        .message {
          margin-bottom: var(--text-2xl);

          &.user {
            .message-content {
              background: var(--primary-color);
              color: white;
              margin-left: auto;
              max-width: 70%;
            }
          }

          &.assistant {
            .message-content {
              background: #f0f2f5;
              color: var(--text-primary);
              margin-right: auto;
              max-width: 70%;
            }
          }

          .message-content {
            padding: var(--text-sm) var(--text-lg);
            border-radius: var(--spacing-sm);
            display: inline-block;

            .message-text {
              line-height: 1.6;
            }

            .message-time {
              font-size: var(--text-sm);
              opacity: 0.7;
              margin-top: var(--spacing-base);
            }
          }

          .loading-dots {
            display: flex;
            gap: var(--spacing-base);

            span {
              width: var(--spacing-sm);
              height: var(--spacing-sm);
              border-radius: var(--radius-full);
              background: var(--primary-color);
              animation: bounce 1.4s infinite ease-in-out;

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

      .suggestions-panel {
        margin-bottom: var(--text-2xl);
        padding: var(--spacing-4xl);
        background: var(--bg-gray-light);
        border-radius: var(--spacing-sm);

        h4 {
          margin-bottom: var(--spacing-2xl);
          color: var(--text-primary);
        }

        .suggestions-section {
          margin-bottom: var(--spacing-4xl);

          ul {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
              padding: var(--spacing-sm) 0;
              color: var(--text-regular);
              border-bottom: var(--border-width-base) solid var(--border-color);

              &:last-child {
                border-bottom: none;
              }

              &:before {
                content: '•';
                color: var(--primary-color);
                margin-right: var(--spacing-sm);
              }
            }
          }
        }

        .resources-section {
          .resources-list {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-2xl);
          }
        }
      }

      .input-container {
        border-top: var(--border-width-base) solid var(--border-color);
        padding-top: var(--spacing-4xl);

        .input-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-2xl);
          margin-top: var(--spacing-2xl);
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
</style>





