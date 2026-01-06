<template>
  <div class="ai-chat-container">
    <!-- AI聊天按钮 -->
    <Transition name="fab">
      <button 
        v-if="!showChat"
        class="ai-chat-fab"
        @click="openChat"
        :class="{ 'ai-chat-fab-pulse': hasNewMessage }"
      >
        <svg class="ai-icon" viewBox="0 0 24 24">
          <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H16A1,1 0 0,0 17,7V5.73C16.4,5.39 16,4.74 16,4A2,2 0 0,1 18,2A2,2 0 0,1 20,4C20,4.74 19.6,5.39 19,5.73V7A3,3 0 0,1 16,10V10.5C16,12.43 14.43,14 12.5,14H11.5C9.57,14 8,12.43 8,10.5V10A3,3 0 0,1 5,7V5.73C4.4,5.39 4,4.74 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4C8,4.74 7.6,5.39 7,5.73V7A1,1 0 0,0 8,8H10A1,1 0 0,0 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
        </svg>
        <span class="ai-label">AI</span>
      </button>
    </Transition>

    <!-- AI聊天面板 -->
    <Transition name="chat-panel">
      <div v-if="showChat" class="ai-chat-panel">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="ai-avatar">
              <svg viewBox="0 0 24 24">
                <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H16A1,1 0 0,0 17,7V5.73C16.4,5.39 16,4.74 16,4A2,2 0 0,1 18,2A2,2 0 0,1 20,4C20,4.74 19.6,5.39 19,5.73V7A3,3 0 0,1 16,10V10.5C16,12.43 14.43,14 12.5,14H11.5C9.57,14 8,12.43 8,10.5V10A3,3 0 0,1 5,7V5.73C4.4,5.39 4,4.74 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4C8,4.74 7.6,5.39 7,5.73V7A1,1 0 0,0 8,8H10A1,1 0 0,0 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
              </svg>
            </div>
            <div class="chat-header-text">
              <h3 class="ai-name">AI助手</h3>
              <p class="ai-status">{{ aiStatus }}</p>
            </div>
          </div>
          <button class="chat-close-btn" @click="closeChat">
            <svg viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>

        <!-- 聊天内容区域 -->
        <div class="chat-content" ref="chatContent">
          <div class="chat-messages">
            <!-- 欢迎消息 -->
            <div v-if="messages.length === 0" class="welcome-message">
              <div class="ai-avatar-small">
                <svg viewBox="0 0 24 24">
                  <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H16A1,1 0 0,0 17,7V5.73C16.4,5.39 16,4.74 16,4A2,2 0 0,1 18,2A2,2 0 0,1 20,4C20,4.74 19.6,5.39 19,5.73V7A3,3 0 0,1 16,10V10.5C16,12.43 14.43,14 12.5,14H11.5C9.57,14 8,12.43 8,10.5V10A3,3 0 0,1 5,7V5.73C4.4,5.39 4,4.74 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4C8,4.74 7.6,5.39 7,5.73V7A1,1 0 0,0 8,8H10A1,1 0 0,0 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                </svg>
              </div>
              <div class="welcome-text">
                <h4>👋 你好！我是AI助手</h4>
                <p>我可以帮助你解答关于活动的问题，或者协助你完成报名流程。有什么我可以帮助你的吗？</p>
              </div>
            </div>

            <!-- 聊天消息 -->
            <div 
              v-for="message in messages" 
              :key="message.id"
              class="message"
              :class="{ 'message-user': message.isUser, 'message-ai': !message.isUser }"
            >
              <div v-if="!message.isUser" class="ai-avatar-small">
                <svg viewBox="0 0 24 24">
                  <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H16A1,1 0 0,0 17,7V5.73C16.4,5.39 16,4.74 16,4A2,2 0 0,1 18,2A2,2 0 0,1 20,4C20,4.74 19.6,5.39 19,5.73V7A3,3 0 0,1 16,10V10.5C16,12.43 14.43,14 12.5,14H11.5C9.57,14 8,12.43 8,10.5V10A3,3 0 0,1 5,7V5.73C4.4,5.39 4,4.74 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4C8,4.74 7.6,5.39 7,5.73V7A1,1 0 0,0 8,8H10A1,1 0 0,0 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                </svg>
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <p>{{ message.text }}</p>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>

            <!-- AI正在输入 -->
            <div v-if="isTyping" class="message message-ai">
              <div class="ai-avatar-small">
                <svg viewBox="0 0 24 24">
                  <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H16A1,1 0 0,0 17,7V5.73C16.4,5.39 16,4.74 16,4A2,2 0 0,1 18,2A2,2 0 0,1 20,4C20,4.74 19.6,5.39 19,5.73V7A3,3 0 0,1 16,10V10.5C16,12.43 14.43,14 12.5,14H11.5C9.57,14 8,12.43 8,10.5V10A3,3 0 0,1 5,7V5.73C4.4,5.39 4,4.74 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4C8,4.74 7.6,5.39 7,5.73V7A1,1 0 0,0 8,8H10A1,1 0 0,0 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                </svg>
              </div>
              <div class="message-content">
                <div class="message-bubble typing-indicator">
                  <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="chat-input-container">
            <input 
              v-model="inputMessage"
              type="text"
              placeholder="输入你的问题..."
              class="chat-input"
              @keypress.enter="sendMessage"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
            <button 
              class="send-btn"
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isTyping"
            >
              <svg viewBox="0 0 24 24">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 遮罩层 -->
    <Transition name="overlay">
      <div 
        v-if="showChat" 
        class="chat-overlay"
        @click="closeChat"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

// 响应式数据
const showChat = ref(false)
const inputMessage = ref('')
const messages = ref<Message[]>([])
const isTyping = ref(false)
const hasNewMessage = ref(false)
const chatContent = ref<HTMLElement>()

// 计算属性
const aiStatus = computed(() => {
  if (isTyping.value) return '正在输入...'
  return '在线'
})

// 方法
const openChat = () => {
  showChat.value = true
  hasNewMessage.value = false
  nextTick(() => {
    scrollToBottom()
  })
}

const closeChat = () => {
  showChat.value = false
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return

  const userMessage: Message = {
    id: Date.now().toString(),
    text: inputMessage.value.trim(),
    isUser: true,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  inputMessage.value = ''
  
  nextTick(() => {
    scrollToBottom()
  })

  // 模拟AI回复
  isTyping.value = true
  
  setTimeout(() => {
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: generateAIResponse(userMessage.text),
      isUser: false,
      timestamp: new Date()
    }
    
    messages.value.push(aiMessage)
    isTyping.value = false
    
    nextTick(() => {
      scrollToBottom()
    })
    
    if (!showChat.value) {
      hasNewMessage.value = true
    }
  }, 1000 + Math.random() * 2000)
}

const generateAIResponse = (userInput: string): string => {
  const responses = [
    '我理解你的问题。关于这个活动，我可以为你提供详细信息。',
    '这是一个很好的问题！让我为你查找相关信息。',
    '根据活动详情，我建议你可以考虑以下几点...',
    '感谢你的询问。这个活动确实很有趣，你可以...',
    '我很乐意帮助你！关于报名流程，你需要...'
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  if (chatContent.value) {
    chatContent.value.scrollTop = chatContent.value.scrollHeight
  }
}

const handleInputFocus = () => {
  // 移动端键盘弹起时的处理
  setTimeout(() => {
    scrollToBottom()
  }, 300)
}

const handleInputBlur = () => {
  // 移动端键盘收起时的处理
}

// 生命周期
onMounted(() => {
  // 可以在这里初始化AI服务连接
})

onUnmounted(() => {
  // 清理资源
})
</script>

<style lang="scss" scoped>
.ai-chat-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

// AI聊天按钮
.ai-chat-fab {
  position: fixed;
  bottom: 120px; // 调整位置，避免与底部按钮冲突
  right: var(--text-3xl);
  width: var(--icon-size); height: var(--icon-size);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: 0 var(--spacing-xs) var(--text-2xl) rgba(102, 126, 234, 0.4);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
  pointer-events: auto;
  z-index: 1001; // 确保在最上层

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }

  &.ai-chat-fab-pulse {
    animation: pulse 2s infinite;
  }
}

.ai-icon {
  width: var(--text-3xl);
  height: var(--text-3xl);
  fill: white;
}

.ai-label {
  color: white;
  font-size: var(--text-2xs);
  font-weight: 600;
  letter-spacing: 0.5px;
}

// 聊天面板
.ai-chat-panel {
  position: fixed;
  bottom: 120px; // 与FAB按钮对齐
  right: var(--text-3xl);
  width: 360px;
  height: 500px;
  background: white;
  border-radius: var(--text-lg);
  box-shadow: 0 var(--spacing-sm) 40px var(--shadow-medium);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  z-index: 1002; // 确保在FAB按钮之上
}

// 聊天头部
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--text-lg) var(--text-2xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: white;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
}

.ai-avatar {
  width: var(--icon-size); height: var(--icon-size);
  background: var(--white-alpha-20);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: var(--text-2xl);
    height: var(--text-2xl);
    fill: white;
  }
}

.chat-header-text {
  h3 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: var(--text-sm);
    opacity: 0.8;
  }
}

.chat-close-btn {
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  background: var(--white-alpha-20);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: var(--white-alpha-30);
  }
  
  svg {
    width: var(--text-lg);
    height: var(--text-lg);
    fill: white;
  }
}

// 聊天内容
.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--text-lg);
}

.welcome-message {
  display: flex;
  gap: var(--text-sm);
  margin-bottom: var(--text-2xl);
}

.ai-avatar-small {
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: var(--text-lg);
    height: var(--text-lg);
    fill: white;
  }
}

.welcome-text {
  h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--text-base);
    color: var(--text-primary);
  }
  
  p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }
}

.message {
  display: flex;
  gap: var(--text-sm);
  margin-bottom: var(--text-lg);
  
  &.message-user {
    flex-direction: row-reverse;
    
    .message-bubble {
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
      color: white;
    }
  }
  
  &.message-ai {
    .message-bubble {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
  }
}

.message-content {
  flex: 1;
  max-width: 80%;
}

.message-bubble {
  padding: var(--text-sm) var(--text-lg);
  border-radius: var(--text-xl);
  position: relative;
  
  p {
    margin: 0;
    font-size: var(--text-base);
    line-height: 1.4;
  }
}

.message-time {
  font-size: var(--text-xs);
  opacity: 0.7;
  margin-top: var(--spacing-xs);
  display: block;
}

.typing-indicator {
  padding: var(--text-lg) !important;
}

.typing-dots {
  display: flex;
  gap: var(--spacing-xs);
  
  span {
    width: 6px;
    height: 6px;
    background: var(--text-tertiary);
    border-radius: var(--radius-full);
    animation: typing 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

// 输入区域
.chat-input-area {
  padding: var(--text-lg) var(--text-2xl);
  border-top: var(--border-width-base) solid var(--bg-gray-light);
  background: white;
}

.chat-input-container {
  display: flex;
  gap: var(--text-sm);
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: var(--text-sm) var(--text-lg);
  border: var(--border-width-base) solid #e0e0e0;
  border-radius: var(--text-3xl);
  font-size: var(--text-base);
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: var(--primary-color);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
}

.send-btn {
  width: var(--icon-size); height: var(--icon-size);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: var(--text-xl);
    height: var(--text-xl);
    fill: white;
  }
}

// 遮罩层
.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-30);
  pointer-events: auto;
}

// 动画
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s ease;
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: all 0.3s ease;
}

.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(var(--text-2xl)) scale(0.95);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

// 响应式设计
@media (max-width: var(--breakpoint-sm)) {
  .ai-chat-panel {
    width: calc(100vw - var(--spacing-3xl));
    height: calc(100vh - 200px); // 为底部按钮留出空间
    bottom: 100px; // 调整位置
    right: var(--text-lg);
  }

  .ai-chat-fab {
    bottom: 100px; // 调整位置
    right: var(--text-lg);
    width: var(--icon-size); height: var(--icon-size);
  }
}

@media (max-width: 375px) {
  .ai-chat-panel {
    width: calc(100vw - var(--text-3xl));
    height: calc(100vh - 180px);
    bottom: 90px;
    right: var(--text-sm);
  }

  .ai-chat-fab {
    bottom: 90px;
    right: var(--text-sm);
    width: 52px;
    height: 52px;
  }
}
</style>
