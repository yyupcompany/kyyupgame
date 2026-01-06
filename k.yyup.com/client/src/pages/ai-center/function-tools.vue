<template>
  <div class="function-tools-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>Function Tools</h1>
        <p>智能工具调用系统，支持数据查询、页面导航等多种功能</p>
      </div>
    </div>

    <!-- 聊天界面 -->
    <div class="chat-container">
      <!-- 消息列表 -->
      <div class="message-list" ref="messageList">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-item"
          :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
        >
          <div class="message-avatar">
            <UnifiedIcon name="default" />
            <UnifiedIcon name="default" />
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            
            <!-- 思考进度显示 -->
            <div v-if="message.thinking" class="thinking-progress">
              <div class="thinking-header">
                <UnifiedIcon name="Refresh" />
                <span>AI正在思考...</span>
              </div>
              <div class="thinking-steps">
                <div
                  v-for="(step, stepIndex) in message.thinkingSteps"
                  :key="stepIndex"
                  class="thinking-step"
                  :class="{ 'completed': step.completed, 'current': step.current }"
                >
                  <div class="step-indicator">
                    <UnifiedIcon v-if="step.completed" name="Check" />
                    <UnifiedIcon v-else-if="step.current" name="Refresh" />
                    <span v-else>{{ stepIndex + 1 }}</span>
                  </div>
                  <span class="step-text">{{ step.text }}</span>
                </div>
              </div>
              <el-progress
                v-if="message.progress !== undefined"
                :percentage="message.progress"
                :show-text="false"
                class="thinking-progress-bar"
              />
            </div>

            <!-- 工具调用结果 -->
            <div v-if="message.toolResults" class="tool-results">
              <div class="tool-results-header">
                <UnifiedIcon name="default" />
                <span>工具调用结果</span>
              </div>
              <div
                v-for="(result, resultIndex) in message.toolResults"
                :key="resultIndex"
                class="tool-result-item"
              >
                <div class="tool-name">{{ result.name }}</div>
                <div class="tool-result" v-if="result.result">
                  <pre>{{ JSON.stringify(result.result, null, 2) }}</pre>
                </div>
                <div v-if="result.error" class="tool-error">
                  错误: {{ result.error }}
                </div>
              </div>
            </div>

            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="message-item ai-message loading">
          <div class="message-avatar">
            <UnifiedIcon name="default" />
          </div>
          <div class="message-content">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-container">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题，例如：'查询最近一个月的活动统计数据' 或 '查询招生数据统计'"
            @keydown.ctrl.enter="sendMessage"
            class="message-input"
          />
          <div class="input-actions">
            <el-button @click="clearMessages" :disabled="isLoading">清空对话</el-button>
            <el-button type="primary" @click="sendMessage" :loading="isLoading">
              发送 (Ctrl+Enter)
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 示例问题 -->
    <div class="example-questions" v-if="messages.length === 0">
      <h3>示例问题</h3>
      <div class="question-grid">
        <div
          v-for="example in exampleQuestions"
          :key="example.id"
          class="question-card"
          @click="useExample(example.text)"
        >
          <div class="question-icon">{{ example.icon }}</div>
          <div class="question-text">{{ example.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
// 使用已注册的全局图标组件，无需导入
// 导入统一智能系统API
import { callUnifiedIntelligence } from '@/api/endpoints/function-tools'

// 响应式数据
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const messageList = ref(null)

// 示例问题
const exampleQuestions = ref([
  {
    id: 1,
    icon: '📊',
    text: '查询最近一个月的活动统计数据'
  },
  {
    id: 2,
    icon: '🎓',
    text: '查询招生数据统计'
  },
  {
    id: 3,
    icon: '📈',
    text: '分析业务趋势数据'
  },
  {
    id: 4,
    icon: '🔍',
    text: '查询历史活动数据'
  }
])

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return

  const userMessage = {
    role: 'user',
    content: inputText.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const currentInput = inputText.value
  inputText.value = ''

  // 添加AI思考消息
  const aiMessage = {
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    thinking: true,
    thinkingSteps: [
      { text: '理解问题', completed: false, current: true },
      { text: '检索数据', completed: false, current: false },
      { text: '生成回复', completed: false, current: false }
    ],
    progress: 0
  }

  messages.value.push(aiMessage)
  isLoading.value = true

  try {
    // 模拟思考进度
    await simulateThinking(aiMessage)

    // 调用统一智能系统API
    const response = await callUnifiedIntelligence({
      message: currentInput,
      userId: localStorage.getItem('userId') || '121',
      conversationId: `function_tools_${Date.now()}`
    })

    // 更新消息
    aiMessage.thinking = false
    
    if (response.success && response.data) {
      aiMessage.content = response.data.message || '处理完成'
      
      // 处理工具执行结果
      if (response.data.tool_executions && response.data.tool_executions.length > 0) {
        aiMessage.toolResults = response.data.tool_executions.map(execution => ({
          name: execution.toolName,
          result: execution.result,
          error: execution.error
        }))
      }
      
      // 添加元数据信息到回复中
      if (response.metadata) {
        let metadataInfo = ''
        if (response.metadata.complexity) {
          metadataInfo += `\n\n**系统分析:**\n复杂度: ${response.metadata.complexity}`
        }
        if (response.metadata.tools_used && response.metadata.tools_used.length > 0) {
          metadataInfo += `\n使用工具: ${response.metadata.tools_used.join(', ')}`
        }
        if (response.metadata.execution_time) {
          metadataInfo += `\n执行时间: ${response.metadata.execution_time}ms`
        }
        aiMessage.content += metadataInfo
      }
    } else {
      aiMessage.content = response.error || '处理请求时出现问题'
    }

  } catch (error) {
    console.error('统一智能系统调用失败:', error)
    aiMessage.thinking = false
    aiMessage.content = '抱歉，处理您的请求时遇到了问题，请稍后重试。'
    ElMessage.error('请求失败，请稍后重试')
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 模拟思考进度
const simulateThinking = async (message) => {
  const steps = message.thinkingSteps
  
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (i > 0) {
      steps[i - 1].completed = true
      steps[i - 1].current = false
    }
    
    steps[i].current = true
    message.progress = ((i + 1) / steps.length) * 100
  }
  
  await new Promise(resolve => setTimeout(resolve, 500))
  steps[steps.length - 1].completed = true
  steps[steps.length - 1].current = false
}

// 使用示例问题
const useExample = (text) => {
  inputText.value = text
  sendMessage()
}

// 清空对话
const clearMessages = () => {
  messages.value = []
}

// 格式化消息
const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}

onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '您好！我是统一智能助手。我可以帮您查询数据、分析趋势、导航页面、创建TodoList等。请告诉我您需要什么帮助？',
    timestamp: new Date()
  })
})
</script>

<style scoped>
.function-tools-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-hover);
}

.page-header {
  background: white;
  padding: var(--text-2xl) var(--text-3xl);
  border-bottom: var(--border-width-base) solid var(--border-color);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-lighter);
}

.header-content h1 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
}

.header-content p {
  margin: 0;
  color: var(--text-regular);
  font-size: var(--text-base);
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--text-3xl);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--text-2xl) 0;
  scroll-behavior: smooth;
}

.message-item {
  display: flex;
  margin-bottom: var(--text-2xl);
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 var(--text-sm);
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: var(--primary-color);
  color: white;
}

.ai-message .message-avatar {
  background: var(--success-color);
  color: white;
}

.message-content {
  max-width: 70%;
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-lg);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  position: relative;
}

.user-message .message-content {
  background: var(--primary-color);
  color: white;
}

.message-text {
  line-height: 1.6;
  word-wrap: break-word;
}

.thinking-progress {
  margin-top: var(--text-sm);
  padding: var(--text-sm);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid #e9ecef;
}

.thinking-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--text-sm);
  font-weight: 500;
  color: #495057;
}

.thinking-icon {
  margin-right: var(--spacing-sm);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.thinking-steps {
  margin-bottom: var(--text-sm);
}

.thinking-step {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.step-indicator {
  width: var(--text-3xl);
  height: var(--text-3xl);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--text-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  border: 2px solid #dee2e6;
  background: white;
  color: #6c757d;
}

.thinking-step.completed .step-indicator {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.thinking-step.current .step-indicator {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.thinking-progress-bar {
  margin-top: var(--spacing-sm);
}

.tool-results {
  margin-top: var(--text-sm);
  padding: var(--text-sm);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid #e9ecef;
}

.tool-results-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--text-sm);
  font-weight: 500;
  color: #495057;
}

.tool-results-header .el-icon {
  margin-right: var(--spacing-sm);
}

.tool-result-item {
  margin-bottom: var(--text-sm);
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid #dee2e6;
}

.tool-name {
  font-weight: 500;
  color: #495057;
  margin-bottom: var(--spacing-sm);
}

.tool-result pre {
  background: var(--bg-gray-light);
  padding: var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);
  overflow-x: auto;
  margin: 0;
}

.tool-error {
  color: var(--danger-color);
  font-size: var(--text-base);
}

.message-time {
  font-size: var(--text-sm);
  color: var(--info-color);
  margin-top: var(--spacing-sm);
  text-align: right;
}

.user-message .message-time {
  color: var(--white-alpha-80);
}

.loading {
  opacity: 0.8;
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.loading-dots span {
  width: var(--spacing-sm);
  height: var(--spacing-sm);
  border-radius: var(--radius-full);
  background: var(--primary-color);
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  } 40% {
    transform: scale(1);
  }
}

.input-area {
  background: white;
  padding: var(--text-2xl);
  border-top: var(--border-width-base) solid var(--border-color);
  border-radius: var(--text-sm) var(--text-sm) 0 0;
  box-shadow: 0 -2px var(--spacing-sm) var(--shadow-lighter);
}

.input-container {
  max-width: 100%; max-width: 100%; max-width: 800px;
  margin: 0 auto;
}

.message-input {
  margin-bottom: var(--text-sm);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

.example-questions {
  padding: var(--text-2xl) 0;
  max-width: 800px;
  margin: 0 auto;
}

.example-questions h3 {
  margin-bottom: var(--text-lg);
  color: var(--text-primary);
  font-size: var(--text-xl);
  font-weight: 500;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-sm);
}

.question-card {
  background: white;
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--text-sm);
}

.question-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px var(--spacing-sm) rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.question-icon {
  font-size: var(--text-3xl);
  flex-shrink: 0;
}

.question-text {
  color: var(--text-primary);
  font-size: var(--text-base);
  line-height: 1.4;
}
</style>
