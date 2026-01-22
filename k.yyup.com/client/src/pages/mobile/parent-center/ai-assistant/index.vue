<template>
  <MobileSubPageLayout title="AI育儿助手" back-path="/mobile/parent-center">
    <div class="mobile-ai-assistant">
      <!-- 页面头部 -->
      <div class="ai-header">
        <div class="header-content">
          <div class="ai-avatar">
            <van-icon name="bulb-o" size="24" />
          </div>
          <div class="header-info">
            <h2>AI育儿助手</h2>
            <p>专业的育儿建议，解答您的疑问</p>
          </div>
        </div>

        <!-- 数据统计 -->
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-number">{{ conversationCount }}</div>
            <div class="stat-label">对话次数</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ resolvedCount }}</div>
            <div class="stat-label">解决问题</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ satisfactionScore }}</div>
            <div class="stat-label">满意度</div>
          </div>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索历史对话或问题..."
          @search="handleSearch"
          @clear="handleSearchClear"
        />
      </div>

      <!-- 快捷问题 -->
      <div v-if="quickQuestions.length > 0 && messages.length === 0" class="quick-questions">
        <div class="section-title">
          <van-icon name="question-o" />
          <span>常见问题</span>
        </div>
        <div class="questions-grid">
          <van-button
            v-for="(question, index) in quickQuestions"
            :key="question.id || index"
            @click="handleQuickQuestion(question)"
            class="question-btn"
            size="small"
            type="primary"
            plain
          >
            {{ question.question }}
          </van-button>
        </div>
      </div>

      <!-- 聊天区域 -->
      <div v-if="messages.length > 0" class="chat-container">
        <div class="messages" ref="messagesRef">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-avatar">
              <van-icon
                :name="message.role === 'user' ? 'contact' : 'bulb-o'"
                size="16"
              />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          <div v-if="loading" class="message assistant">
            <div class="message-avatar">
              <van-icon name="bulb-o" size="16" />
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 建议和资源 -->
        <div v-if="suggestions.length > 0 || relatedResources.length > 0" class="suggestions-panel">
          <div v-if="suggestions.length > 0" class="suggestions-section">
            <div class="suggestions-title">
              <van-icon name="lightbulb-o" />
              <span>建议</span>
            </div>
            <van-cell-group inset>
              <van-cell
                v-for="(suggestion, index) in suggestions"
                :key="index"
                :title="suggestion"
                icon="check"
              />
            </van-cell-group>
          </div>

          <div v-if="relatedResources.length > 0" class="resources-section">
            <div class="resources-title">
              <van-icon name="bookmark-o" />
              <span>相关资源</span>
            </div>
            <van-cell-group inset>
              <van-cell
                v-for="(resource, index) in relatedResources"
                :key="index"
                :title="resource.title"
                is-link
                @click="navigateTo(resource.url)"
              />
            </van-cell-group>
          </div>
        </div>

        <!-- 评价区域 -->
        <div v-if="showRating" class="rating-section">
          <div class="rating-title">对本次回答满意吗？</div>
          <van-rate
            v-model="currentRating"
            :size="20"
            color="#ffd21e"
            void-icon="star"
            void-color="#c8c9cc"
            @change="handleRating"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="messages.length === 0 && !loading && !searchKeyword" class="empty-state">
        <van-empty
          image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
          description="开始对话，获取专业育儿建议"
        >
          <van-button
            type="primary"
            size="small"
            @click="showQuickQuestions = true"
          >
            查看常见问题
          </van-button>
        </van-empty>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchKeyword" class="search-results">
        <div class="section-title">
          <van-icon name="search" />
          <span>搜索结果</span>
        </div>
        <van-list>
          <van-cell
            v-for="(history, index) in searchResults"
            :key="index"
            :title="history.question"
            :label="formatTime(history.timestamp)"
            is-link
            @click="loadHistoryConversation(history)"
          />
        </van-list>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-section">
      <div class="input-container">
        <van-field
          v-model="inputMessage"
          type="textarea"
          :autosize="{ minHeight: 44, maxHeight: 120 }"
          placeholder="请输入您的问题..."
          @keydown.enter.ctrl="handleSend"
          @keydown.enter.exact.prevent="handleSend"
          :disabled="loading"
        >
          <template #button>
            <div class="input-buttons">
              <!-- 图片上传按钮 -->
              <van-button
                size="small"
                type="default"
                :loading="uploadingImage"
                @click="triggerImageUpload"
                :disabled="loading"
                circle
              >
                <van-icon name="photo" />
              </van-button>
              <!-- 文档上传按钮 -->
              <van-button
                size="small"
                type="default"
                :loading="uploadingFile"
                @click="triggerFileUpload"
                :disabled="loading"
                circle
              >
                <van-icon name="description" />
              </van-button>
              <!-- 语音输入按钮 -->
              <van-button
                size="small"
                type="default"
                :loading="isListening"
                @click="handleToggleVoiceInput"
                :disabled="loading"
                circle
              >
                <van-icon :name="isListening ? 'close' : 'microphone'" />
              </van-button>
              <!-- 发送按钮 -->
              <van-button
                type="primary"
                size="small"
                @click="handleSend"
                :loading="loading"
                :disabled="!inputMessage.trim()"
              >
                发送
              </van-button>
            </div>
          </template>
        </van-field>
      </div>

      <div class="input-actions">
        <van-button
          size="small"
          @click="handleClear"
          :disabled="messages.length === 0"
        >
          <van-icon name="clear" />
          清空
        </van-button>
        <van-button
          size="small"
          @click="showHistory = true"
        >
          <van-icon name="records" />
          历史
        </van-button>
      </div>
    </div>

    <!-- 隐藏的文件上传输入框 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf,.doc,.docx,.txt,.json,.xml,.xlsx,.xls,.csv"
      style="display: none"
      @change="handleFileUpload"
    />
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      capture="environment"
      style="display: none"
      @change="handleImageUpload"
    />

    <!-- 语音录制状态提示 -->
    <van-overlay :show="isListening" @click="handleToggleVoiceInput">
      <div class="voice-recording-overlay">
        <div class="voice-recording-content">
          <van-loading type="spinner" color="#fff" />
          <p>正在聆听...</p>
          <p class="voice-hint">点击任意位置取消</p>
        </div>
      </div>
    </van-overlay>

    <!-- 历史记录抽屉 -->
    <van-popup
      v-model:show="showHistory"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="drawer-header">
        <span class="drawer-title">对话历史</span>
        <van-icon name="cross" @click="showHistory = false" />
      </div>
      <div class="history-content">
        <van-tabs v-model:active="activeHistoryTab">
          <van-tab title="全部对话">
            <van-list>
              <van-cell
                v-for="(history, index) in conversationHistory"
                :key="index"
                :title="history.question"
                :label="formatTime(history.timestamp)"
                :value="history.answer ? '已回复' : '未回复'"
                is-link
                @click="loadHistoryConversation(history)"
              />
            </van-list>
          </van-tab>
          <van-tab title="收藏">
            <van-empty description="暂无收藏内容" />
          </van-tab>
        </van-tabs>
      </div>
    </van-popup>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import request from '@/utils/request'
import { mobileAIBridge, type ChatMessage } from '@/utils/mobile-ai-bridge'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

const router = useRouter()

// 上传相关引用
const fileInputRef = ref<HTMLInputElement>()
const imageInputRef = ref<HTMLInputElement>()

// 上传状态
const uploadingFile = ref(false)
const uploadingImage = ref(false)

// 语音输入状态
const isListening = ref(false)

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface QuickQuestion {
  id: string
  question: string
  category: string
  frequency: number
  tags: string[]
}

interface ConversationHistory {
  id: string
  question: string
  answer?: string
  timestamp: Date
  rating?: number
}

// 响应式数据
const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const quickQuestions = ref<QuickQuestion[]>([])
const suggestions = ref<string[]>([])
const relatedResources = ref<Array<{ title: string; url: string }>>([])
const messagesRef = ref<HTMLElement | null>(null)
const aiEnvironmentInfo = ref<any>(null)

// 数据统计
const conversationCount = ref(0)
const resolvedCount = ref(0)
const satisfactionScore = ref(0)

// 搜索相关
const searchKeyword = ref('')
const searchResults = ref<ConversationHistory[]>([])

// 历史记录
const showHistory = ref(false)
const activeHistoryTab = ref(0)
const conversationHistory = ref<ConversationHistory[]>([])
const showQuickQuestions = ref(false)

// 评价相关
const showRating = ref(false)
const currentRating = ref(0)

// 加载快捷问题
const loadQuickQuestions = async () => {
  try {
    const response = await request.get('/api/parent-assistant/quick-questions')
    if (response.data?.success) {
      const data = response.data.data || {}
      quickQuestions.value = data.questions || []
    }
  } catch (error) {
    console.error('加载快捷问题失败:', error)
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await request.get('/api/parent-assistant/statistics')
    if (response.data?.success) {
      const stats = response.data.data
      conversationCount.value = stats.conversationCount || 0
      resolvedCount.value = stats.resolvedCount || 0
      satisfactionScore.value = stats.satisfactionScore || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载历史记录
const loadHistory = async () => {
  try {
    const response = await request.get('/api/parent-assistant/history')
    if (response.data?.success) {
      conversationHistory.value = response.data.data || []
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 处理快捷问题
const handleQuickQuestion = (question: QuickQuestion | string) => {
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
    // ✅ 使用统一AI Bridge
    console.log('📤 [AI助手] 使用统一AI Bridge发送请求', {
      environment: aiEnvironmentInfo.value
    })

    // 构建聊天历史
    const chatMessages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的幼儿园育儿助手，能够为家长提供专业的育儿建议和解答疑问。请用友好、专业、简洁的语言回答问题。'
      },
      ...messages.value.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ]

    const response = await mobileAIBridge.chat({
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000
    })

    if (response.success && response.data?.content) {
      // 添加AI回复
      messages.value.push({
        role: 'assistant',
        content: response.data.content,
        timestamp: new Date()
      })

      // 显示评价选项
      showRating.value = true

      // 更新统计数据
      conversationCount.value++
      resolvedCount.value++

      console.log('✅ [AI助手] AI回复成功')
    } else {
      console.error('❌ [AI助手] AI回复失败:', response.error)
      showToast(response.error || '获取回答失败')
    }
  } catch (error: any) {
    console.error('❌ [AI助手] 发送消息失败:', error)
    showToast(error.message || '发送失败')
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
  showRating.value = false
  currentRating.value = 0
  showSuccessToast('对话已清空')
}

// 搜索功能
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    const response = await request.get('/api/parent-assistant/search', {
      params: { keyword: searchKeyword.value }
    })

    if (response.data?.success) {
      searchResults.value = response.data.data || []
    }
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

// 清空搜索
const handleSearchClear = () => {
  searchKeyword.value = ''
  searchResults.value = []
}

// 加载历史对话
const loadHistoryConversation = (history: ConversationHistory) => {
  if (history.answer) {
    messages.value = [
      {
        role: 'user',
        content: history.question,
        timestamp: history.timestamp
      },
      {
        role: 'assistant',
        content: history.answer,
        timestamp: history.timestamp
      }
    ]
    showHistory.value = false
    searchKeyword.value = ''
    searchResults.value = []
    nextTick(() => scrollToBottom())
  }
}

// 处理评价
const handleRating = (rating: number) => {
  // 这里可以调用API保存评价
  showSuccessToast(`感谢您的评价：${rating}星`)
  showRating.value = false
  currentRating.value = 0

  // 更新满意度分数
  satisfactionScore.value = Math.round((satisfactionScore.value + rating) / 2)
}

// 格式化消息
const formatMessage = (content: string): string => {
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (date: Date): string => {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return target.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return target.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    })
  }
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

// 监听搜索关键词变化
watch(searchKeyword, () => {
  if (searchKeyword.value.trim()) {
    handleSearch()
  } else {
    searchResults.value = []
  }
})

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  // ✅ 获取AI环境信息
  aiEnvironmentInfo.value = mobileAIBridge.getEnvironmentInfo()
  console.log('🔧 [AI助手] AI环境信息:', aiEnvironmentInfo.value)

  loadQuickQuestions()
  loadStatistics()
  loadHistory()
})

// ==================== 文件上传功能 ====================
// 触发文件上传
const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

// 触发图片上传
const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

// 处理文件上传
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    console.log('📁 [AI助手] 上传文件:', file.name)
    uploadingFile.value = true

    // 模拟上传过程
    setTimeout(() => {
      uploadingFile.value = false
      showSuccessToast(`文件 ${file.name} 上传成功`)
      // 将文件信息添加到输入框
      inputMessage.value = `[已上传文件: ${file.name}] 请分析这份文档的内容`
      target.value = ''
    }, 1500)
  }
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    console.log('🖼️ [AI助手] 上传图片:', file.name)
    uploadingImage.value = true

    // 模拟上传过程
    setTimeout(() => {
      uploadingImage.value = false
      showSuccessToast(`图片 ${file.name} 上传成功`)
      // 将图片信息添加到输入框
      inputMessage.value = `[已上传图片: ${file.name}] 请分析这张图片的内容`
      target.value = ''
    }, 1500)
  }
}

// ==================== 语音输入功能 ====================
// 切换语音输入
const handleToggleVoiceInput = () => {
  if (isListening.value) {
    // 停止录音
    isListening.value = false
    console.log('🛑 [AI助手] 停止语音输入')
  } else {
    // 开始录音
    isListening.value = true
    console.log('🎤 [AI助手] 开始语音输入')
    showToast('语音输入功能开发中，请直接输入文字')

    // 模拟自动停止
    setTimeout(() => {
      isListening.value = false
    }, 3000)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-ai-assistant {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--app-bg-color);
  padding-bottom: 80px; // 为输入区域预留空间

  .ai-header {
    background: var(--primary-gradient);
    color: var(--text-white);
    padding: var(--spacing-md) var(--spacing-lg);
    position: relative;

    .header-content {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-md);

      .ai-avatar {
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-md);
      }

      .header-info {
        flex: 1;

        h2 {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: 600;
          margin-bottom: 4px;
        }

        p {
          margin: 0;
          font-size: var(--text-sm);
          opacity: 0.8;
        }
      }
    }

    .stats-container {
      display: flex;
      justify-content: space-around;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: var(--spacing-sm);

      .stat-item {
        text-align: center;
        flex: 1;

        .stat-number {
          font-size: var(--text-xl);
          font-weight: 600;
          margin-bottom: 2px;
        }

        .stat-label {
          font-size: var(--text-xs);
          opacity: 0.8;
        }
      }

      .stat-divider {
        width: 1px;
        background: rgba(255, 255, 255, 0.2);
        margin: 0 var(--spacing-sm);
      }
    }
  }

  .search-section {
    padding: var(--spacing-md);
    background: var(--card-bg);
    margin-bottom: var(--spacing-xs);
  }

  .quick-questions {
    background: var(--card-bg);
    margin-bottom: var(--spacing-xs);
    padding: var(--spacing-lg);

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-md);
      font-weight: 600;
      color: var(--van-text-color);

      .van-icon {
        margin-right: var(--spacing-xs);
        color: var(--van-primary-color);
      }
    }

    .questions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--spacing-sm);

      .question-btn {
        height: auto;
        padding: var(--spacing-sm);
        white-space: normal;
        text-align: left;
        line-height: 1.4;
      }
    }
  }

  .chat-container {
    background: var(--card-bg);
    margin-bottom: var(--spacing-xs);

    .messages {
      max-height: 400px;
      overflow-y: auto;
      padding: var(--spacing-lg);

      .message {
        display: flex;
        margin-bottom: var(--spacing-lg);
        align-items: flex-start;

        &.user {
          flex-direction: row-reverse;

          .message-content {
            background: var(--van-primary-color);
            color: var(--text-white);
            margin-right: var(--spacing-sm);
            margin-left: 0;
          }

          .message-avatar {
            background: var(--van-primary-color);
            color: var(--text-white);
          }
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--spacing-sm);
          flex-shrink: 0;
        }

        .message-content {
          max-width: 70%;
          background: #f0f0f0;
          border-radius: 12px;
          padding: var(--spacing-sm) var(--spacing-md);
          margin-left: var(--spacing-sm);

          .message-text {
            line-height: 1.5;
            word-break: break-word;
          }

          .message-time {
            font-size: var(--text-xs);
            opacity: 0.7;
            margin-top: var(--spacing-xs);
          }
        }
      }

      .typing-indicator {
        display: flex;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) 0;

        span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: typing 1.4s infinite;

          &:nth-child(2) {
            animation-delay: 0.2s;
          }

          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }
    }

    .suggestions-panel {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--van-border-color);

      .suggestions-section,
      .resources-section {
        margin-bottom: var(--spacing-md);

        &:last-child {
          margin-bottom: 0;
        }
      }

      .suggestions-title,
      .resources-title {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-sm);
        font-weight: 600;
        color: var(--van-text-color);

        .van-icon {
          margin-right: var(--spacing-xs);
          color: var(--van-primary-color);
        }
      }
    }

    .rating-section {
      padding: var(--spacing-lg);
      text-align: center;
      border-top: 1px solid var(--van-border-color);

      .rating-title {
        margin-bottom: var(--spacing-sm);
        color: var(--van-text-color);
      }
    }
  }

  .empty-state {
    background: var(--card-bg);
    padding: var(--spacing-xl) var(--spacing-lg);
    text-align: center;
  }

  .search-results {
    background: var(--card-bg);
    padding: var(--spacing-lg);

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-md);
      font-weight: 600;
      color: var(--van-text-color);

      .van-icon {
        margin-right: var(--spacing-xs);
        color: var(--van-primary-color);
      }
    }
  }

  .input-section {
    position: fixed;
    bottom: var(--van-tabbar-height);
    left: 0;
    right: 0;
    background: var(--card-bg);
    border-top: 1px solid var(--van-border-color);
    z-index: 100;

    .input-container {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .input-buttons {
        display: flex;
        gap: var(--spacing-xs);
        align-items: center;

        .van-button {
          min-width: 36px;
          height: 36px;
          padding: 0;
        }
      }
    }

    .input-actions {
      display: flex;
      justify-content: space-around;
      padding: var(--spacing-sm);

      .van-button {
        flex: 1;
        margin: 0 var(--spacing-xs);

        .van-icon {
          margin-right: var(--spacing-xs);
        }
      }
    }
  }

  .history-content {
    padding: var(--spacing-lg);
    height: 100%;
    overflow-y: auto;
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--van-gray-3);

    .drawer-title {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
    }

    .van-icon {
      font-size: var(--van-font-size-lg);
      color: var(--van-gray-6);
      padding: var(--spacing-xs);
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-ai-assistant {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>

<!-- 全局样式覆盖 -->
<style lang="scss">
.voice-recording-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  .voice-recording-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    background: rgba(0, 0, 0, 0.7);
    border-radius: var(--radius-lg);
    color: #fff;

    p {
      margin-top: var(--spacing-md);
      font-size: var(--text-lg);

      &.voice-hint {
        font-size: var(--text-sm);
        opacity: 0.7;
        margin-top: var(--spacing-sm);
      }
    }
  }
}
</style>

