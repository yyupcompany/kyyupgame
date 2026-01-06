<template>
  <div class="streaming-chat">
    <div class="chat-header">
      <h3>🤖 AI专家团队工作台</h3>
      <div class="scenario-info">
        <span class="scenario-badge">{{ currentScenario }}</span>
      </div>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message"
        :class="message.type"
      >
        <div class="message-header">
          <span class="expert-avatar">{{ message.avatar }}</span>
          <span class="expert-name">{{ message.expertName }}</span>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>
        
        <div class="message-content">
          <div class="message-text" v-html="message.content"></div>
          
          <!-- 评分显示 -->
          <div v-if="message.score" class="score-display">
            <span class="score-label">评分:</span>
            <div class="stars">
              <span v-for="i in 10" :key="i" class="star" :class="{ active: i <= message.score }">⭐</span>
            </div>
            <span class="score-text">{{ message.score }}/10</span>
          </div>
          
          <!-- 建议列表 -->
          <div v-if="message.suggestions && message.suggestions.length" class="suggestions">
            <div class="suggestions-title">💡 建议:</div>
            <ul>
              <li v-for="suggestion in message.suggestions" :key="suggestion">{{ suggestion }}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 正在输入指示器 -->
      <div v-if="isTyping" class="typing-indicator">
        <span class="expert-avatar">{{ typingExpert.avatar }}</span>
        <span class="expert-name">{{ typingExpert.name }}</span>
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <div class="input-group">
        <input 
          v-model="userInput" 
          @keyup.enter="sendMessage"
          placeholder="请描述您的需求..."
          :disabled="isProcessing"
        />
        <button @click="sendMessage" :disabled="isProcessing || !userInput.trim()">
          {{ isProcessing ? '处理中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import type { Expert, ExpertResponse } from '@/services/expert-team.service'

interface ChatMessage {
  id: string
  type: 'user' | 'expert' | 'system'
  expertName: string
  avatar: string
  content: string
  score?: number
  suggestions?: string[]
  timestamp: number
}

const props = defineProps<{
  currentScenario: string
  experts: Expert[]
  onUserRequest?: (message: string) => Promise<void>
}>()

const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isProcessing = ref(false)
const isTyping = ref(false)
const typingExpert = ref<Expert | null>(null)
const messagesContainer = ref<HTMLElement>()

// 添加系统消息
const addSystemMessage = (content: string) => {
  messages.value.push({
    id: Date.now().toString(),
    type: 'system',
    expertName: '系统',
    avatar: '🤖',
    content,
    timestamp: Date.now()
  })
  scrollToBottom()
}

// 添加专家消息
const addExpertMessage = (expert: Expert, response: ExpertResponse) => {
  messages.value.push({
    id: Date.now().toString(),
    type: 'expert',
    expertName: expert.name,
    avatar: expert.avatar,
    content: response.message,
    score: response.score,
    suggestions: response.suggestions,
    timestamp: response.timestamp
  })
  scrollToBottom()
}

// 流式显示文本
const streamText = async (expert: Expert, text: string, delay = 50) => {
  const messageId = Date.now().toString()
  
  // 添加空消息
  messages.value.push({
    id: messageId,
    type: 'expert',
    expertName: expert.name,
    avatar: expert.avatar,
    content: '',
    timestamp: Date.now()
  })
  
  // 逐字显示
  for (let i = 0; i <= text.length; i++) {
    const currentMessage = messages.value.find(m => m.id === messageId)
    if (currentMessage) {
      currentMessage.content = text.substring(0, i)
    }
    await new Promise(resolve => setTimeout(resolve, delay))
    scrollToBottom()
  }
}

// 显示正在输入
const showTyping = (expert: Expert) => {
  typingExpert.value = expert
  isTyping.value = true
}

// 隐藏正在输入
const hideTyping = () => {
  isTyping.value = false
  typingExpert.value = null
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isProcessing.value) return
  
  const message = userInput.value.trim()
  userInput.value = ''
  
  // 添加用户消息
  messages.value.push({
    id: Date.now().toString(),
    type: 'user',
    expertName: '用户',
    avatar: '👤',
    content: message,
    timestamp: Date.now()
  })
  
  isProcessing.value = true
  
  try {
    if (props.onUserRequest) {
      await props.onUserRequest(message)
    }
  } catch (error) {
    console.error('处理用户请求失败:', error)
    addSystemMessage('❌ 处理请求时发生错误，请重试')
  } finally {
    isProcessing.value = false
  }
  
  scrollToBottom()
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 暴露方法给父组件
defineExpose({
  addSystemMessage,
  addExpertMessage,
  streamText,
  showTyping,
  hideTyping
})

onMounted(() => {
  addSystemMessage(`🎯 ${props.currentScenario}专家团队已就位，请描述您的需求`)
})
</script>

<style scoped lang="scss">
.streaming-chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  background: var(--bg-card);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg);
  border-bottom: var(--border-width-base) solid var(--border-color);
  background: var(--bg-primary);
  
  h3 {
    margin: 0;
    color: var(--text-primary);
  }
  
  .scenario-badge {
    background: var(--primary-color);
    color: white;
    padding: var(--spacing-xs) var(--text-sm);
    border-radius: var(--text-sm);
    font-size: var(--text-sm);
    font-weight: 500;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--text-lg);
  
  .message {
    margin-bottom: var(--text-lg);
    
    &.user {
      .message-content {
        background: var(--primary-color);
        color: white;
        margin-left: auto;
        margin-right: 0;
        max-width: 70%;
      }
    }
    
    &.expert {
      .message-content {
        background: var(--bg-secondary);
        max-width: 85%;
      }
    }
    
    &.system {
      text-align: center;
      
      .message-content {
        background: var(--warning-color-light);
        color: var(--warning-color);
        display: inline-block;
        max-width: none;
      }
    }
  }
  
  .message-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    
    .expert-avatar {
      font-size: var(--text-lg);
    }
    
    .expert-name {
      font-weight: 500;
    }
    
    .timestamp {
      margin-left: auto;
    }
  }
  
  .message-content {
    padding: var(--text-sm) var(--text-lg);
    border-radius: var(--text-sm);
    
    .message-text {
      line-height: 1.5;
    }
    
    .score-display {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
      padding-top: var(--spacing-sm);
      border-top: var(--border-width-base) solid var(--border-color);
      
      .stars {
        display: flex;
        gap: var(--spacing-sm);
        
        .star {
          font-size: var(--text-sm);
          opacity: 0.3;
          
          &.active {
            opacity: 1;
          }
        }
      }
      
      .score-text {
        font-weight: 500;
        color: var(--primary-color);
      }
    }
    
    .suggestions {
      margin-top: var(--spacing-sm);
      padding-top: var(--spacing-sm);
      border-top: var(--border-width-base) solid var(--border-color);
      
      .suggestions-title {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
      }
      
      ul {
        margin: 0;
        padding-left: var(--text-lg);
        
        li {
          margin-bottom: var(--spacing-sm);
        }
      }
    }
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  color: var(--text-secondary);
  
  .typing-dots {
    display: flex;
    gap: var(--spacing-xs);
    
    span {
      width: 6px;
      height: 6px;
      background: var(--text-secondary);
      border-radius: var(--radius-full);
      animation: typing 1.4s infinite ease-in-out;
      
      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
    }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input {
  padding: var(--text-lg);
  border-top: var(--border-width-base) solid var(--border-color);
  
  .input-group {
    display: flex;
    gap: var(--spacing-sm);
    
    input {
      flex: 1;
      padding: var(--spacing-sm) var(--text-sm);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      outline: none;
      
      &:focus {
        border-color: var(--primary-color);
      }
      
      &:disabled {
        background: var(--bg-disabled);
        cursor: not-allowed;
      }
    }
    
    button {
      padding: var(--spacing-sm) var(--text-lg);
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      
      &:hover:not(:disabled) {
        background: var(--primary-color-hover);
      }
      
      &:disabled {
        background: var(--bg-disabled);
        cursor: not-allowed;
      }
    }
  }
}
</style>
