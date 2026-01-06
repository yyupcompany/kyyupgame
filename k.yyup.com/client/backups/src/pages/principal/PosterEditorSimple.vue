<template>
  <div class="ai-poster-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <h1 class="project-name">AI海报编辑器</h1>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="generatePoster" :loading="isGenerating">
          <el-icon><MagicStick /></el-icon>
          {{ isGenerating ? '生成中...' : '生成海报' }}
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="editor-main">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="panel-section">
          <h3>活动信息</h3>
          <div class="activity-info">
            <div class="info-item">
              <span class="label">标题：</span>
              <span class="value">{{ activityInfo.title }}</span>
            </div>
            <div class="info-item">
              <span class="label">描述：</span>
              <span class="value">{{ activityInfo.description }}</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3>AI对话</h3>
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessagesRef">
              <div v-for="message in chatMessages" :key="message.id" class="message" :class="message.role">
                <div class="message-content">{{ message.content }}</div>
              </div>
            </div>
            <div class="chat-input">
              <el-input
                v-model="userMessage"
                placeholder="描述你想要的海报效果..."
                @keyup.enter="sendMessage"
                :disabled="isGenerating"
              />
              <el-button @click="sendMessage" :disabled="isGenerating || !userMessage.trim()">
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-container">
        <div class="canvas-wrapper">
          <div class="poster-preview">
            <!-- 加载状态 -->
            <div v-if="isGenerating" class="generating-overlay">
              <div class="generating-content">
                <el-icon class="rotating" size="48"><MagicStick /></el-icon>
                <p>AI正在创作中...</p>
                <div class="progress-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>

            <!-- 海报图片 -->
            <img v-else-if="currentPosterUrl" :src="currentPosterUrl" alt="生成的海报" class="poster-image" />

            <!-- 空状态 -->
            <div v-else class="empty-canvas">
              <el-icon size="64"><Picture /></el-icon>
              <p>点击"生成海报"开始创作</p>
              <p class="tip">或在左侧对话框描述您的需求</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="panel-section">
          <h3>海报信息</h3>
          <div class="poster-info">
            <div class="info-item">
              <span class="label">尺寸：</span>
              <span class="value">{{ posterSize }}</span>
            </div>
            <div class="info-item">
              <span class="label">风格：</span>
              <span class="value">{{ posterStyle }}</span>
            </div>
            <div class="info-item" v-if="lastGeneratedTime">
              <span class="label">生成时间：</span>
              <span class="value">{{ formatTime(lastGeneratedTime) }}</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3>操作</h3>
          <div class="actions">
            <el-button @click="downloadPoster" :disabled="!currentPosterUrl" block>
              <el-icon><Download /></el-icon>
              下载海报
            </el-button>
            <el-button @click="regeneratePoster" :disabled="!currentPosterUrl" :loading="regenerating" block>
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Picture, Download, Refresh } from '@element-plus/icons-vue'
import { autoImageApi, type ImageGenerationRequest } from '@/api/auto-image'

// 活动信息
const activityInfo = reactive({
  title: '活动标题',
  description: '活动描述',
  location: '活动地点',
  startTime: '',
  endTime: '',
  capacity: 0,
  fee: 0
})

// 海报相关
const currentPosterUrl = ref('')
const posterSize = ref('1024x1024')
const posterStyle = ref('卡通风格')
const lastGeneratedTime = ref<number>(0)
const isGenerating = ref(false)
const regenerating = ref(false)

// AI对话相关
const userMessage = ref('')
const chatMessages = ref<Array<{id: number, role: string, content: string}>>([])
const chatMessagesRef = ref<HTMLElement>()

// 初始化活动信息
const initializeFromActivity = () => {
  const params = new URLSearchParams(window.location.search)
  
  activityInfo.title = params.get('activityTitle') || '活动海报'
  activityInfo.description = params.get('activityDescription') || ''
  activityInfo.location = params.get('activityLocation') || ''
  activityInfo.startTime = params.get('activityStartTime') || ''
  activityInfo.endTime = params.get('activityEndTime') || ''
  activityInfo.capacity = parseInt(params.get('activityCapacity') || '0')
  activityInfo.fee = parseFloat(params.get('activityFee') || '0')
}

// 发送消息
const sendMessage = async () => {
  if (!userMessage.value.trim()) return
  
  const message = userMessage.value
  userMessage.value = ''
  
  // 添加用户消息
  chatMessages.value.push({
    id: Date.now(),
    role: 'user',
    content: message
  })
  
  // 生成海报
  await generatePoster(message)
}

// 生成海报
const generatePoster = async (prompt?: string) => {
  isGenerating.value = true

  try {
    // 构建提示词
    const fullPrompt = buildPosterPrompt(prompt)

    // 添加AI消息
    const messageId = Date.now()
    chatMessages.value.push({
      id: messageId,
      role: 'assistant',
      content: '正在为您生成海报...'
    })

    // 滚动到最新消息
    await nextTick()
    scrollToBottom()

    // 调用真实的文生图API
    const request: ImageGenerationRequest = {
      prompt: fullPrompt,
      category: 'poster',
      style: posterStyle.value === '卡通风格' ? 'cartoon' : 'natural',
      size: '1024x1024',
      quality: 'hd',
      watermark: false
    }

    const response = await autoImageApi.generatePosterImage({
      posterTitle: activityInfo.title,
      posterContent: fullPrompt
    })

    if (response.success && response.data?.imageUrl) {
      currentPosterUrl.value = response.data.imageUrl
      lastGeneratedTime.value = Date.now()

      // 更新AI消息
      const messageIndex = chatMessages.value.findIndex(msg => msg.id === messageId)
      if (messageIndex !== -1) {
        chatMessages.value[messageIndex].content = '海报生成完成！点击右侧下载按钮保存海报。'
      }

      ElMessage.success('海报生成成功！')
    } else {
      throw new Error(response.message || '生成失败')
    }
  } catch (error: any) {
    // 更新AI消息显示错误
    const messageIndex = chatMessages.value.findIndex(msg => msg.role === 'assistant' && msg.content.includes('正在为您生成'))
    if (messageIndex !== -1) {
      chatMessages.value[messageIndex].content = `生成失败：${error.message || '请重试'}`
    }

    ElMessage.error('海报生成失败，请重试')
    console.error('生成海报失败:', error)
  } finally {
    isGenerating.value = false
  }
}

// 构建海报提示词
const buildPosterPrompt = (userMessage?: string) => {
  const baseInfo = `幼儿园${activityInfo.title}活动海报`
  const descInfo = activityInfo.description ? `：${activityInfo.description}` : ''
  const locationInfo = activityInfo.location ? `，地点：${activityInfo.location}` : ''
  const timeInfo = activityInfo.startTime ? `，时间：${new Date(activityInfo.startTime).toLocaleDateString()}` : ''
  const feeInfo = activityInfo.fee > 0 ? `，费用：${activityInfo.fee}元` : '，免费参与'
  const capacityInfo = activityInfo.capacity > 0 ? `，限${activityInfo.capacity}人` : ''

  let prompt = `${baseInfo}${descInfo}${locationInfo}${timeInfo}${feeInfo}${capacityInfo}`

  if (userMessage) {
    prompt += `。用户要求：${userMessage}`
  }

  // 添加幼儿园海报的专业要求
  prompt += '。要求：3-6岁幼儿园宣传海报，色彩鲜艳温馨，卡通可爱风格，突出活动亮点，吸引家长和孩子，体现专业幼教品质'

  return prompt
}

// 重新生成海报
const regeneratePoster = async () => {
  regenerating.value = true

  // 随机选择不同的风格
  const styles = ['卡通风格', '自然风格', '艺术风格']
  const currentStyleIndex = styles.indexOf(posterStyle.value)
  const newStyleIndex = (currentStyleIndex + 1) % styles.length
  posterStyle.value = styles[newStyleIndex]

  await generatePoster(`重新生成海报，使用${posterStyle.value}，展现不同的视觉效果`)
  regenerating.value = false
}

// 下载海报
const downloadPoster = async () => {
  if (!currentPosterUrl.value) return

  try {
    // 如果是本地URL，直接下载
    if (currentPosterUrl.value.startsWith('/uploads/')) {
      const link = document.createElement('a')
      link.href = `http://localhost:3000${currentPosterUrl.value}`
      link.download = `${activityInfo.title}-海报-${Date.now()}.jpg`
      link.click()
    } else {
      // 如果是外部URL，先获取blob再下载
      const response = await fetch(currentPosterUrl.value)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${activityInfo.title}-海报-${Date.now()}.jpg`
      link.click()

      // 清理URL对象
      window.URL.revokeObjectURL(url)
    }

    ElMessage.success('海报下载成功！')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 滚动到聊天底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

// 页面初始化
onMounted(() => {
  initializeFromActivity()

  // 添加欢迎消息
  chatMessages.value.push({
    id: Date.now(),
    role: 'assistant',
    content: '您好！我是AI海报设计助手。请告诉我您想要什么样的海报效果，我会为您生成专业的幼儿园活动海报。'
  })
})
</script>

<style lang="scss" scoped>
.ai-poster-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-hover);
}

.editor-toolbar {
  height: 60px;
  background: white;
  border-bottom: var(--border-width-base) solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--text-2xl);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.project-name {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel, .right-panel {
  width: 300px;
  background: white;
  border-right: var(--border-width-base) solid var(--border-color);
  overflow-y: auto;
}

.right-panel {
  border-right: none;
  border-left: var(--border-width-base) solid var(--border-color);
}

.canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-hover);
  padding: var(--text-2xl);
}

.canvas-wrapper {
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  overflow: hidden;
}

.poster-preview {
  width: 512px;
  height: 512px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(45deg, var(--bg-gray) 25%, transparent 25%),
              linear-gradient(-45deg, var(--bg-gray) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, var(--bg-gray) 75%),
              linear-gradient(-45deg, transparent 75%, var(--bg-gray) 75%);
  background-size: var(--text-2xl) var(--text-2xl);
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.poster-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
  transition: transform 0.3s ease;
}

.poster-image:hover {
  transform: scale(1.02);
}

.generating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--white-alpha-95);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--spacing-sm);
  z-index: 10;
}

.generating-content {
  text-align: center;

  .rotating {
    color: var(--primary-color);
    animation: rotate 2s linear infinite;
    margin-bottom: var(--text-lg);
  }

  p {
    margin: 0 0 var(--text-lg) 0;
    font-size: var(--text-lg);
    color: var(--text-primary);
    font-weight: 500;
  }
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xs);

  span {
    width: var(--spacing-sm);
    height: var(--spacing-sm);
    border-radius: var(--radius-full);
    background: var(--primary-color);
    animation: pulse 1.4s ease-in-out infinite both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.empty-canvas {
  text-align: center;
  color: var(--info-color);

  .el-icon {
    margin-bottom: var(--text-lg);
    color: var(--text-placeholder);
  }

  p {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--text-base);

    &.tip {
      font-size: var(--text-sm);
      color: var(--text-placeholder);
    }
  }
}

.panel-section {
  padding: var(--text-2xl);
  border-bottom: var(--border-width-base) solid var(--bg-gray-light);
}

.panel-section h3 {
  margin: 0 0 15px 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.activity-info, .poster-info {
  .info-item {
    display: flex;
    margin-bottom: var(--spacing-sm);
    
    .label {
      font-weight: 500;
      color: var(--text-regular);
      min-width: 60px;
    }
    
    .value {
      color: var(--text-primary);
      flex: 1;
    }
  }
}

.chat-container {
  height: 300px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background: var(--bg-tertiary);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-color-light);
}

.message {
  margin-bottom: var(--text-sm);
  animation: fadeInUp 0.3s ease;

  &.user {
    text-align: right;

    .message-content {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      display: inline-block;
      padding: var(--spacing-2xl) var(--text-base);
      border-radius: var(--text-xl) var(--text-xl) var(--spacing-xs) var(--text-xl);
      max-width: 80%;
      box-shadow: 0 2px var(--spacing-sm) rgba(64, 158, 255, 0.3);
      font-size: var(--text-base);
      line-height: 1.4;
    }
  }

  &.assistant {
    text-align: left;

    .message-content {
      background: white;
      color: var(--text-primary);
      display: inline-block;
      padding: var(--spacing-2xl) var(--text-base);
      border-radius: var(--text-xl) var(--text-xl) var(--text-xl) var(--spacing-xs);
      max-width: 80%;
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      border: var(--border-width-base) solid var(--border-color-light);
      font-size: var(--text-base);
      line-height: 1.4;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input {
  display: flex;
  gap: var(--spacing-sm);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}
</style>
