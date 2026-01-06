<!--
  🏫 移动端AI助手组件
  
  基于 04-组件开发指南.md 的AI交互设计
  特性：语音输入、智能推荐、上下文理解、悬浮窗模式
-->

<template>
  <div class="mobile-ai-assistant">
    <!-- 悬浮按钮 -->
    <div 
      v-if="!visible && showFloatingButton"
      class="ai-assistant__floating-btn"
      :style="floatingButtonStyle"
      @click="openAssistant"
    >
      <div class="floating-btn__icon">
        <el-icon><ChatRound /></el-icon>
      </div>
      <div v-if="hasNewMessage" class="floating-btn__indicator" />
    </div>

    <!-- AI助手弹窗 -->
    <el-drawer
      v-model="visible"
      direction="btt"
      :size="drawerHeight"
      :with-header="false"
      :modal="false"
      class="ai-assistant__drawer"
      :class="drawerClasses"
    >
      <div class="ai-assistant__container">
        <!-- 头部操作栏 -->
        <div class="assistant__header">
          <div class="header__handle" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
            <div class="handle__bar" />
          </div>
          
          <div class="header__content">
            <div class="header__left">
              <div class="header__avatar">
                <el-avatar :size="32" src="/images/ai-avatar.png">
                  <el-icon><Robot /></el-icon>
                </el-avatar>
                <div class="avatar__status" :class="{ 'status--active': isAiOnline }" />
              </div>
              <div class="header__info">
                <h3 class="header__title">{{ assistantName }}</h3>
                <p class="header__status">{{ statusText }}</p>
              </div>
            </div>
            
            <div class="header__actions">
              <button class="header__action" @click="toggleVoiceMode">
                <el-icon>
                  <component :is="voiceMode ? 'MicrophoneFilled' : 'Microphone'" />
                </el-icon>
              </button>
              <button class="header__action" @click="showSettings">
                <el-icon><Setting /></el-icon>
              </button>
              <button class="header__action" @click="closeAssistant">
                <el-icon><Close /></el-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- 快捷操作区 -->
        <div class="assistant__shortcuts" v-if="showShortcuts">
          <div class="shortcuts__title">快捷操作</div>
          <div class="shortcuts__grid">
            <button
              v-for="shortcut in shortcuts"
              :key="shortcut.id"
              class="shortcut__item"
              @click="handleShortcut(shortcut)"
            >
              <el-icon>
                <component :is="shortcut.icon" />
              </el-icon>
              <span>{{ shortcut.title }}</span>
            </button>
          </div>
        </div>

        <!-- 聊天消息区 -->
        <div class="assistant__messages" ref="messagesRef">
          <div class="messages__container">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="`message--${message.type}`"
            >
              <!-- 用户消息 -->
              <div v-if="message.type === 'user'" class="message__user">
                <div class="message__content">
                  <div class="message__text">{{ message.content }}</div>
                  <div class="message__time">{{ formatTime(message.timestamp) }}</div>
                </div>
                <div class="message__avatar">
                  <el-avatar :size="28" :src="userAvatar">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                </div>
              </div>

              <!-- AI消息 -->
              <div v-else class="message__ai">
                <div class="message__avatar">
                  <el-avatar :size="28" src="/images/ai-avatar.png">
                    <el-icon><Robot /></el-icon>
                  </el-avatar>
                </div>
                <div class="message__content">
                  <div class="message__text" v-html="formatAiMessage(message.content)"></div>
                  <div class="message__actions" v-if="message.actions">
                    <button
                      v-for="action in message.actions"
                      :key="action.id"
                      class="action__btn"
                      @click="handleMessageAction(action)"
                    >
                      {{ action.title }}
                    </button>
                  </div>
                  <div class="message__time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>

              <!-- 系统消息 -->
              <div v-if="message.type === 'system'" class="message__system">
                <div class="system__content">
                  <el-icon><InfoFilled /></el-icon>
                  <span>{{ message.content }}</span>
                </div>
              </div>
            </div>

            <!-- 输入指示器 -->
            <div v-if="isTyping" class="message message--ai">
              <div class="message__avatar">
                <el-avatar :size="28" src="/images/ai-avatar.png">
                  <el-icon><Robot /></el-icon>
                </el-avatar>
              </div>
              <div class="message__content">
                <div class="typing-indicator">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="assistant__input">
          <!-- 语音输入模式 -->
          <div v-if="voiceMode" class="input__voice">
            <div class="voice__content">
              <div class="voice__indicator" :class="{ 'indicator--active': isRecording }">
                <div class="voice__waves">
                  <div class="wave" v-for="i in 5" :key="i" :style="getWaveStyle(i)"></div>
                </div>
                <el-icon class="voice__icon"><Microphone /></el-icon>
              </div>
              <p class="voice__text">{{ voiceStatusText }}</p>
              <div class="voice__actions">
                <button
                  class="voice__btn voice__btn--cancel"
                  @click="cancelVoiceInput"
                >
                  取消
                </button>
                <button
                  class="voice__btn voice__btn--record"
                  :class="{ 'btn--active': isRecording }"
                  @touchstart="startRecording"
                  @touchend="stopRecording"
                  @mousedown="startRecording"
                  @mouseup="stopRecording"
                >
                  {{ isRecording ? '松开发送' : '按住说话' }}
                </button>
                <button
                  class="voice__btn voice__btn--text"
                  @click="switchToTextMode"
                >
                  键盘
                </button>
              </div>
            </div>
          </div>

          <!-- 文本输入模式 -->
          <div v-else class="input__text">
            <div class="input__container">
              <button class="input__voice-btn" @click="toggleVoiceMode">
                <el-icon><Microphone /></el-icon>
              </button>
              
              <div class="input__field">
                <el-input
                  v-model="inputText"
                  type="textarea"
                  :rows="inputRows"
                  :maxlength="500"
                  placeholder="输入您的问题..."
                  :disabled="isLoading"
                  @keydown="handleKeydown"
                  @input="handleInput"
                  resize="none"
                  class="input__textarea"
                />
              </div>
              
              <button
                class="input__send-btn"
                :disabled="!canSend"
                @click="sendMessage"
              >
                <el-icon>
                  <component :is="isLoading ? 'Loading' : 'Promotion'" />
                </el-icon>
              </button>
            </div>
            
            <!-- 建议词 -->
            <div v-if="suggestions.length > 0" class="input__suggestions">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                class="suggestion__item"
                @click="applySuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAiAssistantStore } from '../stores/ai-assistant'
import { useMobileStore } from '../stores/mobile'
import {
  ChatRound,
  Robot,
  User,
  Microphone,
  MicrophoneFilled,
  Setting,
  Close,
  InfoFilled,
  Loading,
  Promotion,
  // 快捷操作图标
  Search,
  Calendar,
  Document,
  DataAnalysis,
  Phone,
  Location
} from '@element-plus/icons-vue'

// Props定义
interface Props {
  visible: boolean
  position?: { bottom: string; right: string }
  showFloatingButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: () => ({ bottom: '80px', right: '20px' }),
  showFloatingButton: true
})

// Emits定义
interface Emits {
  'update:visible': [visible: boolean]
  close: []
}

const emit = defineEmits<Emits>()

// 数据
const userStore = useUserStore()
const aiStore = useAiAssistantStore()
const mobileStore = useMobileStore()

const messagesRef = ref<HTMLElement>()
const inputText = ref('')
const voiceMode = ref(false)
const isRecording = ref(false)
const isTyping = ref(false)
const isLoading = ref(false)
const hasNewMessage = ref(false)
const drawerHeight = ref('70%')
const touchStartY = ref(0)
const suggestions = ref<string[]>([])

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const floatingButtonStyle = computed(() => ({
  bottom: props.position.bottom,
  right: props.position.right
}))

const drawerClasses = computed(() => ({
  'drawer--voice': voiceMode.value,
  'drawer--ios': mobileStore.isIOS,
  'drawer--android': mobileStore.isAndroid
}))

const assistantName = computed(() => 'AI小园丁')
const isAiOnline = computed(() => true)
const statusText = computed(() => 
  isLoading.value ? '正在思考...' : (isAiOnline.value ? '在线' : '离线')
)

const userAvatar = computed(() => userStore.userInfo?.avatar || '')

const inputRows = computed(() => {
  const lines = inputText.value.split('\n').length
  return Math.min(Math.max(lines, 1), 4)
})

const canSend = computed(() => 
  inputText.value.trim().length > 0 && !isLoading.value
)

const voiceStatusText = computed(() => {
  if (isRecording.value) {
    return '正在录音，请说话...'
  }
  return '按住按钮开始录音'
})

// 消息数据
const messages = ref([
  {
    id: '1',
    type: 'system',
    content: '欢迎使用AI小园丁！我可以帮您解答幼儿园管理相关问题。',
    timestamp: new Date()
  },
  {
    id: '2',
    type: 'ai',
    content: '您好！我是您的智能助手，可以帮您：\n\n• 查询学生信息\n• 安排课程表\n• 生成报告\n• 家长沟通建议\n\n有什么需要帮助的吗？',
    timestamp: new Date(),
    actions: [
      { id: 'query-student', title: '查询学生' },
      { id: 'schedule', title: '查看课表' },
      { id: 'report', title: '生成报告' }
    ]
  }
])

// 快捷操作
const shortcuts = [
  { id: 'search', title: '智能搜索', icon: Search },
  { id: 'schedule', title: '今日日程', icon: Calendar },
  { id: 'report', title: '生成报告', icon: Document },
  { id: 'analysis', title: '数据分析', icon: DataAnalysis },
  { id: 'contact', title: '联系家长', icon: Phone },
  { id: 'location', title: '校园导航', icon: Location }
]

const showShortcuts = computed(() => messages.value.length <= 2)

// 方法
const openAssistant = () => {
  visible.value = true
  hasNewMessage.value = false
  nextTick(() => {
    scrollToBottom()
  })
}

const closeAssistant = () => {
  visible.value = false
  emit('close')
}

const toggleVoiceMode = () => {
  voiceMode.value = !voiceMode.value
  if (voiceMode.value) {
    inputText.value = ''
  }
}

const switchToTextMode = () => {
  voiceMode.value = false
}

const handleShortcut = (shortcut: any) => {
  const shortcutMessages: Record<string, string> = {
    'search': '帮我智能搜索相关信息',
    'schedule': '显示我今天的日程安排',
    'report': '帮我生成一份报告',
    'analysis': '分析最新的数据趋势',
    'contact': '我需要联系家长的建议',
    'location': '校园导航和位置信息'
  }
  
  const message = shortcutMessages[shortcut.id]
  if (message) {
    inputText.value = message
    sendMessage()
  }
}

const sendMessage = async () => {
  if (!canSend.value) return
  
  const content = inputText.value.trim()
  inputText.value = ''
  
  // 添加用户消息
  const userMessage = {
    id: Date.now().toString(),
    type: 'user',
    content,
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  
  // 显示输入指示器
  isLoading.value = true
  isTyping.value = true
  
  nextTick(() => {
    scrollToBottom()
  })
  
  try {
    // 调用AI服务
    const response = await aiStore.sendMessage(content)
    
    // 添加AI回复
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: response.content,
      timestamp: new Date(),
      actions: response.actions
    }
    
    messages.value.push(aiMessage)
    
    // 更新建议词
    suggestions.value = response.suggestions || []
    
  } catch (error) {
    console.error('AI message failed:', error)
    
    const errorMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '抱歉，我现在有些问题，请稍后再试。',
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
  } finally {
    isLoading.value = false
    isTyping.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const handleMessageAction = (action: any) => {
  inputText.value = `执行操作：${action.title}`
  sendMessage()
}

const applySuggestion = (suggestion: string) => {
  inputText.value = suggestion
  suggestions.value = []
}

const handleInput = () => {
  // 智能建议（简化版）
  if (inputText.value.length > 2) {
    const commonSuggestions = [
      '今天的课程安排怎么样？',
      '帮我查看学生出勤情况',
      '生成本月的教学总结',
      '有哪些家长需要联系？'
    ]
    
    suggestions.value = commonSuggestions.filter(s => 
      s.includes(inputText.value.trim())
    ).slice(0, 3)
  } else {
    suggestions.value = []
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 语音相关方法
const startRecording = () => {
  if (!isRecording.value) {
    isRecording.value = true
    // 这里应该启动语音识别
    console.log('开始录音')
  }
}

const stopRecording = async () => {
  if (isRecording.value) {
    isRecording.value = false
    console.log('停止录音')
    
    // 模拟语音转文字
    setTimeout(() => {
      inputText.value = '刚才通过语音输入的内容'
      voiceMode.value = false
      sendMessage()
    }, 1000)
  }
}

const cancelVoiceInput = () => {
  isRecording.value = false
  voiceMode.value = false
}

// 语音波形动画
const getWaveStyle = (index: number) => {
  if (!isRecording.value) return { height: 'var(--spacing-xs)' }
  
  const heights = ['12px', '20px', 'var(--spacing-md)', '2var(--spacing-xs)', 'var(--spacing-sm)']
  return {
    height: heights[index % heights.length],
    animationDelay: `${index * 0.1}s`
  }
}

// 触摸手势处理
const handleTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.touches[0].clientY
}

const handleTouchMove = (event: TouchEvent) => {
  const currentY = event.touches[0].clientY
  const deltaY = touchStartY.value - currentY
  
  if (deltaY > 50) {
    // 向上滑动，展开
    drawerHeight.value = '90%'
  } else if (deltaY < -50) {
    // 向下滑动，收起
    drawerHeight.value = '70%'
  }
}

const handleTouchEnd = () => {
  // 手势结束处理
}

const scrollToBottom = () => {
  if (messagesRef.value) {
    const container = messagesRef.value.querySelector('.messages__container')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAiMessage = (content: string) => {
  // 简单的Markdown格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/•/g, '·')
}

const showSettings = () => {
  // 显示AI助手设置
  console.log('显示AI助手设置')
}

// 生命周期
onMounted(() => {
  // 监听键盘弹起
  window.addEventListener('resize', scrollToBottom)
})

onUnmounted(() => {
  window.removeEventListener('resize', scrollToBottom)
})

// 监听消息变化
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })
</script>

<style lang="scss" scoped>
.mobile-ai-assistant {
  position: relative;
}

// 悬浮按钮
.ai-assistant__floating-btn {
  position: fixed;
  z-index: 1000;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  border-radius: var(--radius-full);
  box-shadow: 0 var(--spacing-xs) var(--spacing-md) rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px var(--shadow-medium);
  }
  
  &:active {
    transform: scale(0.95);
  }

  .floating-btn__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: white;
    font-size: 2var(--spacing-xs);
  }

  .floating-btn__indicator {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    width: 12px;
    height: 12px;
    background: var(--el-color-danger);
    border-radius: var(--radius-full);
    border: 2px solid var(--border-color);
  }
}

// 抽屉样式
.ai-assistant__drawer {
  :deep(.el-drawer) {
    border-radius: var(--spacing-md) var(--spacing-md) 0 0;
    background: var(--el-bg-color);
  }

  :deep(.el-drawer__body) {
    padding: 0;
    height: 100%;
  }

  &.drawer--ios {
    :deep(.el-drawer) {
      border-radius: 20px 20px 0 0;
    }
  }
}

// 主容器
.ai-assistant__container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

// 头部
.assistant__header {
  background: var(--el-bg-color);
  border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);

  .header__handle {
    display: flex;
    justify-content: center;
    padding: var(--spacing-sm) 0 var(--spacing-xs);
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    .handle__bar {
      width: var(--spacing-xl);
      height: var(--spacing-xs);
      background: var(--el-border-color-light);
      border-radius: 2px;
    }
  }

  .header__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px var(--spacing-md);
  }

  .header__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header__avatar {
    position: relative;

    .avatar__status {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: var(--spacing-sm);
      height: var(--spacing-sm);
      background: var(--el-color-success);
      border-radius: var(--radius-full);
      border: 2px solid var(--el-bg-color);

      &.status--active {
        background: var(--el-color-success);
      }
    }
  }

  .header__info {
    .header__title {
      margin: 0 0 2px 0;
      font-size: var(--spacing-md);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .header__status {
      margin: 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .header__actions {
    display: flex;
    gap: var(--spacing-sm);

    .header__action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--spacing-xl);
      height: var(--spacing-xl);
      border: none;
      border-radius: var(--radius-full);
      background: transparent;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--el-fill-color-light);
      }

      &:active {
        background: var(--el-fill-color);
      }
    }
  }
}

// 快捷操作
.assistant__shortcuts {
  padding: var(--spacing-md);
  border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);

  .shortcuts__title {
    margin-bottom: 12px;
    font-size: 1var(--spacing-xs);
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .shortcuts__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .shortcut__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px var(--spacing-sm);
    border: none;
    border-radius: var(--spacing-sm);
    background: var(--el-fill-color-lighter);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--el-fill-color-light);
      transform: translateY(-var(--border-width-base));
    }

    &:active {
      transform: translateY(0);
    }

    .el-icon {
      font-size: 20px;
      color: var(--el-color-primary);
    }

    span {
      font-size: 12px;
      color: var(--el-text-color-primary);
    }
  }
}

// 消息区域
.assistant__messages {
  flex: 1;
  overflow: hidden;

  .messages__container {
    height: 100%;
    padding: var(--spacing-md);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .message {
    margin-bottom: var(--spacing-md);

    &:last-child {
      margin-bottom: 0;
    }

    // 用户消息
    .message__user {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      gap: var(--spacing-sm);

      .message__content {
        max-width: 70%;
        background: var(--el-color-primary);
        border-radius: var(--spacing-md) var(--spacing-md) var(--spacing-xs) var(--spacing-md);
        padding: 12px var(--spacing-md);
        color: white;

        .message__text {
          font-size: 1var(--spacing-xs);
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message__time {
          margin-top: 6px;
          font-size: 1var(--border-width-base);
          opacity: 0.8;
        }
      }
    }

    // AI消息
    .message__ai {
      display: flex;
      align-items: flex-end;
      gap: var(--spacing-sm);

      .message__content {
        max-width: 70%;
        background: var(--el-fill-color-lighter);
        border-radius: var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-xs);
        padding: 12px var(--spacing-md);

        .message__text {
          font-size: 1var(--spacing-xs);
          line-height: 1.4;
          color: var(--el-text-color-primary);
          word-wrap: break-word;

          :deep(strong) {
            font-weight: 600;
          }

          :deep(em) {
            font-style: italic;
          }
        }

        .message__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-top: 12px;

          .action__btn {
            padding: 6px 12px;
            border: var(--border-width-base) solid var(--el-color-primary);
            border-radius: var(--spacing-md);
            background: transparent;
            color: var(--el-color-primary);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background: var(--el-color-primary);
              color: white;
            }
          }
        }

        .message__time {
          margin-top: 6px;
          font-size: 1var(--border-width-base);
          color: var(--el-text-color-secondary);
        }
      }
    }

    // 系统消息
    .message__system {
      display: flex;
      justify-content: center;

      .system__content {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: var(--spacing-sm) 12px;
        background: var(--el-color-info-light-9);
        border-radius: 12px;
        font-size: 12px;
        color: var(--el-color-info);
      }
    }
  }
}

// 输入指示器
.typing-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) 0;

  .typing-dot {
    width: 6px;
    height: 6px;
    background: var(--el-text-color-secondary);
    border-radius: var(--radius-full);
    animation: typing-bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0; }
  }
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 输入区域
.assistant__input {
  background: var(--el-bg-color);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom, 0));

  // 语音输入
  .input__voice {
    .voice__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
    }

    .voice__indicator {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      border-radius: var(--radius-full);
      background: var(--el-fill-color-lighter);
      transition: all 0.3s ease;

      &.indicator--active {
        background: var(--el-color-primary-light-9);
      }

      .voice__waves {
        position: absolute;
        display: flex;
        align-items: end;
        gap: 2px;
        
        .wave {
          width: 3px;
          background: var(--el-color-primary);
          border-radius: 1.5px;
          animation: wave-pulse 0.8s infinite ease-in-out;
        }
      }

      .voice__icon {
        font-size: var(--spacing-xl);
        color: var(--el-color-primary);
        z-index: 1;
      }
    }

    .voice__text {
      text-align: center;
      font-size: 1var(--spacing-xs);
      color: var(--el-text-color-secondary);
    }

    .voice__actions {
      display: flex;
      gap: 12px;
      width: 100%;

      .voice__btn {
        flex: 1;
        padding: 12px var(--spacing-md);
        border: var(--border-width-base) solid var(--el-border-color);
        border-radius: var(--spacing-sm);
        background: var(--el-bg-color);
        font-size: 1var(--spacing-xs);
        cursor: pointer;
        transition: all 0.2s ease;

        &--cancel {
          color: var(--el-text-color-secondary);
          
          &:hover {
            border-color: var(--el-color-danger);
            color: var(--el-color-danger);
          }
        }

        &--record {
          color: var(--el-color-primary);
          border-color: var(--el-color-primary);

          &.btn--active {
            background: var(--el-color-primary);
            color: white;
          }
        }

        &--text {
          color: var(--el-text-color-primary);
          
          &:hover {
            border-color: var(--el-color-primary);
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  // 文本输入
  .input__text {
    .input__container {
      display: flex;
      align-items: flex-end;
      gap: var(--spacing-sm);
    }

    .input__voice-btn,
    .input__send-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .input__voice-btn {
      background: var(--el-fill-color-light);
      color: var(--el-text-color-regular);

      &:hover {
        background: var(--el-fill-color);
      }
    }

    .input__send-btn {
      background: var(--el-color-primary);
      color: white;

      &:disabled {
        background: var(--el-fill-color-light);
        color: var(--el-text-color-placeholder);
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        background: var(--el-color-primary-light-3);
      }
    }

    .input__field {
      flex: 1;

      :deep(.el-textarea__inner) {
        border-radius: 20px;
        border-color: var(--el-border-color-light);
        padding: 12px var(--spacing-md);
        line-height: 1.4;
        resize: none;

        &:focus {
          border-color: var(--el-color-primary);
          box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
        }
      }
    }

    .input__suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);

      .suggestion__item {
        padding: 6px 12px;
        border: var(--border-width-base) solid var(--el-border-color-light);
        border-radius: var(--spacing-md);
        background: var(--el-bg-color);
        font-size: 12px;
        color: var(--el-text-color-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--el-color-primary);
          color: var(--el-color-primary);
        }
      }
    }
  }
}

@keyframes wave-pulse {
  0%, 100% {
    height: var(--spacing-xs);
    opacity: 0.4;
  }
  50% {
    height: 100%;
    opacity: 1;
  }
}

// 响应式适配
@media (max-width: 480px) {
  .ai-assistant__floating-btn {
    width: 4var(--spacing-sm);
    height: 4var(--spacing-sm);
    
    .floating-btn__icon {
      font-size: 20px;
    }
  }

  .assistant__shortcuts {
    .shortcuts__grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .assistant__messages {
    .message {
      .message__user .message__content,
      .message__ai .message__content {
        max-width: 85%;
      }
    }
  }
}
</style>