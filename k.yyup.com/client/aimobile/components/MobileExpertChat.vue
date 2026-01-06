<template>
  <div class="mobile-expert-chat">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="expert-info">
        <div class="expert-avatar">{{ currentExpertIcon }}</div>
        <div class="expert-details">
          <h3>{{ currentExpertName }}</h3>
          <p>{{ currentExpertDescription }}</p>
        </div>
      </div>
      
      <!-- 专家切换 -->
      <div class="expert-selector">
        <select v-model="selectedExpertId" @change="switchExpert" class="expert-select">
          <option v-for="expert in availableExperts" :key="expert.id" :value="expert.id">
            {{ expert.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="['message', message.role]"
      >
        <!-- 用户消息 -->
        <div v-if="message.role === 'user'" class="user-message">
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
        
        <!-- 专家消息 -->
        <div v-else class="expert-message">
          <div class="expert-avatar-small">{{ getExpertIcon(message.expertId) }}</div>
          <div class="message-bubble">
            <div class="expert-name">{{ getExpertName(message.expertId) }}</div>
            <div class="message-content" v-html="formatMessage(message.content)"></div>
            <div class="message-meta">
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              <span v-if="message.confidence" class="confidence">
                置信度: {{ Math.round(message.confidence * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 正在输入指示器 -->
      <div v-if="isTyping" class="typing-indicator">
        <div class="expert-avatar-small">{{ currentExpertIcon }}</div>
        <div class="typing-bubble">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速回复建议 -->
    <div v-if="quickReplies.length > 0" class="quick-replies">
      <div class="quick-replies-title">快速回复</div>
      <div class="quick-replies-list">
        <button 
          v-for="reply in quickReplies" 
          :key="reply.id"
          class="quick-reply-btn"
          @click="sendQuickReply(reply.text)"
        >
          {{ reply.text }}
        </button>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <div class="input-container">
        <!-- 文本输入 -->
        <div class="text-input-wrapper">
          <textarea 
            v-model="inputText"
            placeholder="请输入您的问题..."
            class="text-input"
            rows="1"
            @keydown="handleKeydown"
            @input="adjustTextareaHeight"
            ref="textInput"
          ></textarea>
          
          <!-- 语音输入按钮 -->
          <button 
            v-if="voiceInputEnabled"
            :class="['voice-btn', { 'recording': isRecording }]"
            @click="toggleVoiceInput"
            @touchstart="startVoiceInput"
            @touchend="stopVoiceInput"
          >
            🎤
          </button>
        </div>
        
        <!-- 发送按钮 -->
        <button 
          :disabled="!canSend"
          class="send-btn"
          @click="sendMessage"
        >
          📤
        </button>
      </div>
      
      <!-- 输入工具栏 -->
      <div class="input-toolbar">
        <button class="toolbar-btn" @click="showTemplates = !showTemplates">
          📝 模板
        </button>
        <button class="toolbar-btn" @click="showHistory = !showHistory">
          📚 历史
        </button>
        <button class="toolbar-btn" @click="clearChat">
          🗑️ 清空
        </button>
      </div>
    </div>

    <!-- 模板选择器 -->
    <div v-if="showTemplates" class="templates-panel">
      <div class="panel-header">
        <h4>常用问题模板</h4>
        <button @click="showTemplates = false" class="close-btn">✕</button>
      </div>
      <div class="templates-list">
        <div 
          v-for="template in questionTemplates" 
          :key="template.id"
          class="template-item"
          @click="useTemplate(template)"
        >
          <div class="template-title">{{ template.title }}</div>
          <div class="template-preview">{{ template.content }}</div>
        </div>
      </div>
    </div>

    <!-- 历史记录面板 -->
    <div v-if="showHistory" class="history-panel">
      <div class="panel-header">
        <h4>聊天历史</h4>
        <button @click="showHistory = false" class="close-btn">✕</button>
      </div>
      <div class="history-list">
        <div 
          v-for="session in chatHistory" 
          :key="session.id"
          class="history-item"
          @click="loadHistorySession(session)"
        >
          <div class="history-title">{{ session.title }}</div>
          <div class="history-time">{{ formatDate(session.timestamp) }}</div>
        </div>
      </div>
    </div>

    <!-- 网络状态指示器 -->
    <div v-if="!isOnline" class="offline-indicator">
      📡 网络连接已断开
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-toast">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ error }}</span>
      <button @click="clearError" class="error-close">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { mobileAPIService } from '../services/mobile-api.service'
import { MOBILE_SMART_EXPERTS } from '../types/mobile-agents'
import type { AgentType } from '../types/mobile-agents'

// ==================== 响应式数据 ====================

// 聊天状态
const messages = ref<any[]>([])
const inputText = ref('')
const isTyping = ref(false)
const isRecording = ref(false)
const error = ref('')

// 专家选择
const selectedExpertId = ref<AgentType>('activity_planner')
const availableExperts = computed(() => Object.values(MOBILE_SMART_EXPERTS))

// 界面状态
const showTemplates = ref(false)
const showHistory = ref(false)
const voiceInputEnabled = ref(true)
const isOnline = ref(navigator.onLine)

// 快速回复
const quickReplies = ref<any[]>([])

// 聊天历史
const chatHistory = ref<any[]>([])

// 问题模板
const questionTemplates = ref([
  {
    id: 1,
    title: '活动策划咨询',
    content: '我想策划一个{人数}人参加的{活动类型}，预算{金额}元，请给我一些建议。',
    category: 'activity'
  },
  {
    id: 2,
    title: '招生方案咨询',
    content: '我们幼儿园想制定招生方案，目标招收{人数}名学生，请帮我分析市场策略。',
    category: 'marketing'
  },
  {
    id: 3,
    title: '课程设计咨询',
    content: '我是新老师，想为{年龄段}的孩子设计{课程类型}课程，请给我一些教学建议。',
    category: 'curriculum'
  },
  {
    id: 4,
    title: '成本分析咨询',
    content: '请帮我分析{项目名称}的成本构成，并提供优化建议。',
    category: 'cost'
  }
])

// DOM引用
const messagesContainer = ref<HTMLElement>()
const textInput = ref<HTMLTextAreaElement>()

// ==================== 计算属性 ====================

const currentExpert = computed(() => MOBILE_SMART_EXPERTS[selectedExpertId.value])
const currentExpertName = computed(() => currentExpert.value?.name || '专家')
const currentExpertDescription = computed(() => currentExpert.value?.description || '')
const currentExpertIcon = computed(() => getExpertIcon(selectedExpertId.value))

const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !isTyping.value && isOnline.value
})

// ==================== 方法 ====================

const getExpertIcon = (expertId: AgentType): string => {
  const icons = {
    'activity_planner': '🎯',
    'marketing_expert': '📈',
    'education_expert': '🎓',
    'cost_analyst': '💰',
    'risk_assessor': '🛡️',
    'creative_designer': '🎨',
    'curriculum_expert': '📚'
  }
  return icons[expertId] || '🤖'
}

const getExpertName = (expertId: AgentType): string => {
  return MOBILE_SMART_EXPERTS[expertId]?.name || '专家'
}

const switchExpert = () => {
  // 切换专家时更新快速回复
  updateQuickReplies()
  
  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

const sendMessage = async () => {
  if (!canSend.value) return
  
  const messageText = inputText.value.trim()
  inputText.value = ''
  
  // 添加用户消息
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: messageText,
    timestamp: Date.now()
  }
  messages.value.push(userMessage)
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 显示正在输入
  isTyping.value = true
  
  try {
    // 调用专家API
    const response = await mobileAPIService.callSmartExpert({
      expert_id: selectedExpertId.value,
      task: messageText,
      context: `移动端聊天 - ${new Date().toISOString()}`
    })
    
    // 添加专家回复
    const expertMessage = {
      id: Date.now() + 1,
      role: 'expert',
      content: response.advice,
      timestamp: Date.now(),
      expertId: selectedExpertId.value,
      confidence: 0.95
    }
    messages.value.push(expertMessage)
    
    // 更新快速回复建议
    generateQuickReplies(response.advice)
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
    
  } catch (err: any) {
    error.value = err.message || '发送消息失败'
    
    // 错误触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  } finally {
    isTyping.value = false
    await nextTick()
    scrollToBottom()
  }
}

const sendQuickReply = (text: string) => {
  inputText.value = text
  sendMessage()
}

const toggleVoiceInput = () => {
  if (isRecording.value) {
    stopVoiceInput()
  } else {
    startVoiceInput()
  }
}

const startVoiceInput = () => {
  isRecording.value = true
  console.log('🎤 开始语音输入')
  
  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100])
  }
  
  // 这里实现语音识别
  // 暂时模拟语音输入
  setTimeout(() => {
    if (isRecording.value) {
      inputText.value = '这是语音输入的示例文本'
      stopVoiceInput()
    }
  }, 2000)
}

const stopVoiceInput = () => {
  isRecording.value = false
  console.log('🎤 停止语音输入')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const adjustTextareaHeight = () => {
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    textInput.value.style.height = textInput.value.scrollHeight + 'px'
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatMessage = (content: string): string => {
  // 简单的Markdown格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN')
}

const useTemplate = (template: any) => {
  inputText.value = template.content
  showTemplates.value = false
  
  // 自动调整输入框高度
  nextTick(() => {
    adjustTextareaHeight()
  })
}

const updateQuickReplies = () => {
  // 根据当前专家更新快速回复
  const expertQuickReplies = {
    'activity_planner': [
      { id: 1, text: '请帮我策划一个春游活动' },
      { id: 2, text: '如何控制活动成本？' },
      { id: 3, text: '活动安全注意事项有哪些？' }
    ],
    'marketing_expert': [
      { id: 1, text: '如何提高招生转化率？' },
      { id: 2, text: '制定招生营销策略' },
      { id: 3, text: '分析竞争对手优势' }
    ],
    'curriculum_expert': [
      { id: 1, text: '新老师如何备课？' },
      { id: 2, text: '课堂管理技巧' },
      { id: 3, text: '如何设计互动环节？' }
    ]
  }
  
  quickReplies.value = expertQuickReplies[selectedExpertId.value] || []
}

const generateQuickReplies = (expertResponse: string) => {
  // 基于专家回复生成相关的快速回复建议
  const suggestions = [
    { id: Date.now() + 1, text: '请详细说明' },
    { id: Date.now() + 2, text: '有其他建议吗？' },
    { id: Date.now() + 3, text: '谢谢，很有帮助' }
  ]
  
  quickReplies.value = suggestions
}

const clearChat = () => {
  if (confirm('确定要清空聊天记录吗？')) {
    messages.value = []
    quickReplies.value = []
    updateQuickReplies()
  }
}

const loadHistorySession = (session: any) => {
  // 加载历史聊天记录
  messages.value = session.messages || []
  showHistory.value = false
  
  nextTick(() => {
    scrollToBottom()
  })
}

const clearError = () => {
  error.value = ''
}

// ==================== 生命周期 ====================

onMounted(() => {
  console.log('📱 移动端专家聊天组件已加载')
  updateQuickReplies()
  
  // 监听网络状态
  window.addEventListener('online', () => { isOnline.value = true })
  window.addEventListener('offline', () => { isOnline.value = false })
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('online', () => { isOnline.value = true })
  window.removeEventListener('offline', () => { isOnline.value = false })
})

// 监听专家切换
watch(selectedExpertId, () => {
  updateQuickReplies()
})
</script>

<style scoped>
.mobile-expert-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}

.chat-header {
  background: white;
  padding: var(--spacing-md);
  border-bottom: var(--border-width-base) solid #e9ecef;
  box-shadow: 0 2px var(--spacing-xs) rgba(0,0,0,0.1);
}

.expert-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.expert-avatar {
  width: 4var(--spacing-sm);
  height: 4var(--spacing-sm);
  border-radius: var(--radius-full);
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2var(--spacing-xs);
  margin-right: 12px;
}

.expert-details h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1var(--spacing-sm);
  color: #2c3e50;
}

.expert-details p {
  margin: 0;
  font-size: 1var(--spacing-xs);
  color: #6c757d;
  line-height: 1.4;
}

.expert-select {
  width: 100%;
  padding: var(--spacing-sm) 12px;
  border: var(--border-width-base) solid #dee2e6;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  background: white;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  scroll-behavior: smooth;
}

.message {
  margin-bottom: var(--spacing-md);
}

.user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-message .message-content {
  background: #007bff;
  color: white;
  padding: 12px var(--spacing-md);
  border-radius: 1var(--spacing-sm) 1var(--spacing-sm) var(--spacing-xs) 1var(--spacing-sm);
  max-width: 80%;
  word-wrap: break-word;
}

.expert-message {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.expert-avatar-small {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border-radius: var(--radius-full);
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--spacing-md);
  flex-shrink: 0;
}

.message-bubble {
  background: white;
  border-radius: var(--spacing-xs) 1var(--spacing-sm) 1var(--spacing-sm) 1var(--spacing-sm);
  padding: 12px var(--spacing-md);
  max-width: 80%;
  box-shadow: 0 var(--border-width-base) 2px rgba(0,0,0,0.1);
}

.expert-name {
  font-size: 12px;
  color: #007bff;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.message-content {
  line-height: 1.5;
  color: #2c3e50;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
  font-size: 1var(--border-width-base);
  color: #6c757d;
}

.message-time {
  font-size: 1var(--border-width-base);
  color: #6c757d;
  margin-top: var(--spacing-xs);
}

.confidence {
  font-size: 1var(--border-width-base);
  color: #28a745;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.typing-bubble {
  background: white;
  border-radius: 1var(--spacing-sm);
  padding: 12px var(--spacing-md);
  box-shadow: 0 var(--border-width-base) 2px rgba(0,0,0,0.1);
}

.typing-dots {
  display: flex;
  gap: var(--spacing-xs);
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: #6c757d;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.quick-replies {
  padding: 12px var(--spacing-md);
  background: white;
  border-top: var(--border-width-base) solid #e9ecef;
}

.quick-replies-title {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: var(--spacing-sm);
}

.quick-replies-list {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.quick-reply-btn {
  background: #f8f9fa;
  border: var(--border-width-base) solid #dee2e6;
  padding: 6px 12px;
  border-radius: var(--spacing-md);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-reply-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.chat-input {
  background: white;
  border-top: var(--border-width-base) solid #e9ecef;
  padding: var(--spacing-md);
}

.input-container {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-end;
}

.text-input-wrapper {
  flex: 1;
  position: relative;
}

.text-input {
  width: 100%;
  border: var(--border-width-base) solid #dee2e6;
  border-radius: 20px;
  padding: 12px var(--spacing-md);
  font-size: var(--spacing-md);
  line-height: 1.4;
  resize: none;
  max-height: 120px;
  overflow-y: auto;
}

.text-input:focus {
  outline: none;
  border-color: #007bff;
}

.voice-btn {
  position: absolute;
  right: var(--spacing-sm);
  bottom: var(--spacing-sm);
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border: none;
  border-radius: var(--radius-full);
  background: #007bff;
  color: white;
  font-size: 1var(--spacing-xs);
  cursor: pointer;
  transition: all 0.3s ease;
}

.voice-btn:hover {
  background: #0056b3;
}

.voice-btn.recording {
  background: #dc3545;
  animation: pulse 1s infinite;
}

.send-btn {
  width: 4var(--spacing-xs);
  height: 4var(--spacing-xs);
  border: none;
  border-radius: var(--radius-full);
  background: #007bff;
  color: white;
  font-size: 1var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.input-toolbar {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: 12px;
}

.toolbar-btn {
  background: #f8f9fa;
  border: var(--border-width-base) solid #dee2e6;
  padding: 6px 12px;
  border-radius: var(--spacing-md);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toolbar-btn:hover {
  background: #e9ecef;
}

.templates-panel, .history-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: var(--border-width-base) solid #dee2e6;
  max-height: 50vh;
  overflow-y: auto;
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: var(--border-width-base) solid #e9ecef;
}

.panel-header h4 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1var(--spacing-sm);
  cursor: pointer;
  color: #6c757d;
}

.templates-list, .history-list {
  padding: var(--spacing-md);
}

.template-item, .history-item {
  padding: 12px;
  border: var(--border-width-base) solid #e9ecef;
  border-radius: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-item:hover, .history-item:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.template-title, .history-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: var(--spacing-xs);
}

.template-preview {
  font-size: 1var(--spacing-xs);
  color: #6c757d;
}

.history-time {
  font-size: 12px;
  color: #6c757d;
}

.offline-indicator {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  background: #ffc107;
  color: #212529;
  padding: 12px;
  border-radius: var(--spacing-sm);
  text-align: center;
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  z-index: 1000;
}

.error-toast {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  z-index: 1000;
}

.error-icon {
  font-size: var(--spacing-md);
}

.error-text {
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #721c24;
  font-size: var(--spacing-md);
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 76var(--spacing-sm)) {
  .chat-header {
    padding: 12px;
  }
  
  .chat-messages {
    padding: 12px;
  }
  
  .chat-input {
    padding: 12px;
  }
}
</style>
