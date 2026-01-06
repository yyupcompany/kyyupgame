<template>
  <div class="smart-expert-demo">
    <div class="demo-header">
      <h1>🧠 智能专家调度系统</h1>
      <p class="subtitle">AI驱动的专家团队协作 - 让大模型自主决定何时调用专家</p>
    </div>

    <div class="demo-container">
      <!-- 聊天界面 -->
      <div class="chat-container">
        <div class="chat-header">
          <h3>💬 智能助手对话</h3>
          <div class="status-indicator" :class="{ active: isThinking }">
            <span v-if="isThinking">🤔 AI正在思考...</span>
            <span v-else>💡 准备就绪</span>
          </div>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
            <div class="message-content">
              <div class="message-header">
                <span class="role-badge" :class="message.role">
                  {{ message.role === 'user' ? '👤 您' : '🤖 智能助手' }}
                </span>
                <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              
              <!-- 显示专家调用信息 -->
              <div v-if="message.expert_calls && message.expert_calls.length > 0" class="expert-calls">
                <h4>🔧 调用的专家：</h4>
                <div v-for="call in message.expert_calls" :key="call.tool_call_id" class="expert-call">
                  <div class="expert-info">
                    <span class="expert-name">{{ call.result.expert_name }}</span>
                    <span class="expert-task">{{ call.result.task }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-group">
            <textarea 
              v-model="currentMessage" 
              @keydown.enter.prevent="sendMessage"
              placeholder="请描述您的需求，我会智能决定是否需要专家协助..."
              :disabled="isThinking"
              rows="3"
            ></textarea>
            <button @click="sendMessage" :disabled="isThinking || !currentMessage.trim()">
              <span v-if="isThinking">⏳</span>
              <span v-else>发送</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 专家团队展示 -->
      <div class="experts-panel">
        <h3>👥 可用专家团队</h3>
        <div class="experts-grid">
          <div v-for="expert in availableExperts" :key="expert.id" class="expert-card">
            <div class="expert-header">
              <h4>{{ expert.name }}</h4>
              <span class="expert-status" :class="{ active: activeExperts.includes(expert.id) }">
                {{ activeExperts.includes(expert.id) ? '🔥 工作中' : '💤 待命' }}
              </span>
            </div>
            <p class="expert-description">{{ expert.description }}</p>
            <div class="expert-capabilities">
              <span v-for="capability in expert.capabilities" :key="capability" class="capability-tag">
                {{ capability }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速测试按钮 -->
    <div class="quick-tests">
      <h3>🚀 快速测试</h3>
      <div class="test-buttons">
        <button @click="quickTest('simple')" class="test-btn simple">
          💬 简单问题（AI直接回答）
        </button>
        <button @click="quickTest('activity')" class="test-btn activity">
          🎪 活动策划（调用专家）
        </button>
        <button @click="quickTest('marketing')" class="test-btn marketing">
          📈 招生营销（调用专家）
        </button>
        <button @click="quickTest('complex')" class="test-btn complex">
          🔥 复杂需求（多专家协作）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { request } from '@/utils/request'

// 响应式数据
const messages = ref<any[]>([])
const currentMessage = ref('')
const isThinking = ref(false)
const messagesContainer = ref<HTMLElement>()
const activeExperts = ref<string[]>([])

// 可用专家列表
const availableExperts = ref([
  {
    id: 'activity_planner',
    name: '活动策划专家',
    description: '专业的幼儿园活动策划专家，擅长设计教育性、趣味性和安全性并重的活动方案',
    capabilities: ['活动方案设计', '教育价值评估', '安全风险控制', '资源配置优化']
  },
  {
    id: 'marketing_expert',
    name: '招生营销专家',
    description: '专业的教育行业营销专家，擅长招生策略制定和品牌推广',
    capabilities: ['招生策略', '品牌推广', '市场分析', '转化优化']
  },
  {
    id: 'education_expert',
    name: '教育评估专家',
    description: '专业的幼儿教育专家，擅长教育方案评估和课程设计',
    capabilities: ['教育方案评估', '课程设计', '发展评估', '教学质量']
  },
  {
    id: 'cost_analyst',
    name: '成本分析专家',
    description: '专业的成本控制和预算管理专家',
    capabilities: ['成本核算', '预算制定', '资源优化', '投入产出分析']
  },
  {
    id: 'risk_assessor',
    name: '风险评估专家',
    description: '专业的风险管理和安全评估专家',
    capabilities: ['风险识别', '安全评估', '应急预案', '合规检查']
  },
  {
    id: 'creative_designer',
    name: '创意设计专家',
    description: '专业的创意设计和视觉传达专家',
    capabilities: ['创意设计', '视觉传达', '用户体验', '品牌形象']
  }
])

// 发送消息
async function sendMessage() {
  if (!currentMessage.value.trim() || isThinking.value) return

  const userMessage = {
    role: 'user',
    content: currentMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const messageToSend = currentMessage.value
  currentMessage.value = ''
  isThinking.value = true

  try {
    const response = await request.post('/ai/expert/smart-chat', {
      messages: [
        { role: 'user', content: messageToSend }
      ]
    })

    // 更新活跃专家状态
    if (response.expert_calls && response.expert_calls.length > 0) {
      const calledExperts = response.expert_calls.map((call: any) => call.result.expert_id)
      activeExperts.value = calledExperts
      
      // 3秒后清除活跃状态
      setTimeout(() => {
        activeExperts.value = []
      }, 3000)
    }

    const assistantMessage = {
      role: 'assistant',
      content: response.message,
      expert_calls: response.expert_calls,
      timestamp: new Date()
    }

    messages.value.push(assistantMessage)
    
  } catch (error) {
    console.error('发送消息失败:', error)
    const errorMessage = {
      role: 'assistant',
      content: '抱歉，我暂时无法处理您的请求。请稍后重试。',
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
  } finally {
    isThinking.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 快速测试
function quickTest(type: string) {
  const testMessages = {
    simple: '你好，请介绍一下你的功能',
    activity: '我想为幼儿园组织一个春季运动会，需要详细的策划方案',
    marketing: '我们幼儿园想提高招生效果，请制定一个营销策略',
    complex: '我需要策划一个大型的幼儿园开放日活动，包括活动方案、营销推广、成本预算和风险评估'
  }
  
  currentMessage.value = testMessages[type as keyof typeof testMessages]
  sendMessage()
}

// 格式化消息
function formatMessage(content: string) {
  return content.replace(/\n/g, '<br>')
}

// 格式化时间
function formatTime(timestamp: Date) {
  return new Date(timestamp).toLocaleTimeString()
}

// 滚动到底部
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 初始化
onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    role: 'assistant',
    content: `👋 您好！我是智能专家调度助手。

我拥有一个专业的专家团队，可以为您提供：
• 🎪 活动策划和组织
• 📈 招生营销策略  
• 🎓 教育方案评估
• 💰 成本分析优化
• ⚠️ 风险评估管控
• 🎨 创意设计服务

我会根据您的需求智能决定是否需要调用专家。对于简单问题，我会直接回答；对于复杂专业问题，我会自动调用相关专家为您提供专业建议。

请告诉我您需要什么帮助？`,
    timestamp: new Date()
  })
})
</script>

<style scoped>
.smart-expert-demo {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--text-2xl);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-8xl);
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: var(--spacing-2xl);
}

.subtitle {
  color: #7f8c8d;
  font-size: var(--text-lg);
}

.demo-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--text-2xl);
  margin-bottom: var(--spacing-8xl);
}

.chat-container {
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) 6px var(--shadow-light);
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-4xl) var(--text-2xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  padding: var(--spacing-base) var(--text-sm);
  border-radius: var(--text-2xl);
  background: var(--white-alpha-20);
  font-size: var(--text-base);
}

.status-indicator.active {
  background: rgba(255, 193, 7, 0.3);
  animation: pulse 2s infinite;
}

.chat-messages {
  height: 500px;
  overflow-y: auto;
  padding: var(--text-2xl);
}

.message {
  margin-bottom: var(--text-2xl);
}

.message.user .message-content {
  background: #e3f2fd;
  margin-left: 50px;
}

.message.assistant .message-content {
  background: var(--bg-secondary);
  margin-right: 50px;
}

.message-content {
  padding: var(--spacing-4xl);
  border-radius: var(--text-sm);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.role-badge {
  font-weight: bold;
  font-size: var(--text-base);
}

.role-badge.user {
  color: #1976d2;
}

.role-badge.assistant {
  color: #388e3c;
}

.timestamp {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.expert-calls {
  margin-top: var(--spacing-4xl);
  padding: var(--spacing-2xl);
  background: rgba(103, 58, 183, 0.1);
  border-radius: var(--spacing-sm);
  border-left: var(--spacing-xs) solid #673ab7;
}

.expert-calls h4 {
  margin: 0 0 var(--spacing-2xl) 0;
  color: #673ab7;
  font-size: var(--text-base);
}

.expert-call {
  margin-bottom: var(--spacing-sm);
}

.expert-info {
  display: flex;
  gap: var(--spacing-2xl);
}

.expert-name {
  font-weight: bold;
  color: #673ab7;
}

.expert-task {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.chat-input {
  padding: var(--text-2xl);
  border-top: var(--border-width-base) solid #eee;
}

.input-group {
  display: flex;
  gap: var(--spacing-2xl);
}

.input-group textarea {
  flex: 1;
  padding: var(--text-sm);
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--spacing-sm);
  resize: vertical;
  font-family: inherit;
}

.input-group button {
  padding: var(--text-sm) var(--text-3xl);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--spacing-sm);
  cursor: pointer;
  font-weight: bold;
}

.input-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.experts-panel {
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) 6px var(--shadow-light);
  padding: var(--text-2xl);
}

.experts-panel h3 {
  margin-bottom: var(--text-2xl);
  color: #2c3e50;
}

.experts-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
}

.expert-card {
  border: var(--border-width-base) solid #eee;
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  transition: all 0.3s ease;
}

.expert-card:hover {
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.expert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.expert-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: var(--text-lg);
}

.expert-status {
  font-size: var(--text-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--text-sm);
  background: var(--bg-gray-light);
  color: var(--text-secondary);
}

.expert-status.active {
  background: #ff9800;
  color: white;
  animation: pulse 2s infinite;
}

.expert-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: 1.4;
}

.expert-capabilities {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-base);
}

.capability-tag {
  font-size: var(--text-sm);
  padding: var(--spacing-2xs) var(--spacing-sm);
  background: #e8f5e8;
  color: #2e7d32;
  border-radius: var(--text-sm);
}

.quick-tests {
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) 6px var(--shadow-light);
  padding: var(--text-2xl);
}

.quick-tests h3 {
  margin-bottom: var(--spacing-4xl);
  color: #2c3e50;
}

.test-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-2xl);
}

.test-btn {
  padding: var(--text-sm) var(--text-lg);
  border: none;
  border-radius: var(--spacing-sm);
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.test-btn.simple {
  background: #e8f5e8;
  color: #2e7d32;
}

.test-btn.activity {
  background: var(--bg-white)3e0;
  color: #f57c00;
}

.test-btn.marketing {
  background: #e3f2fd;
  color: #1976d2;
}

.test-btn.complex {
  background: #fce4ec;
  color: #c2185b;
}

.test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-heavy);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

@media (max-width: var(--breakpoint-md)) {
  .demo-container {
    grid-template-columns: 1fr;
  }
  
  .test-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
