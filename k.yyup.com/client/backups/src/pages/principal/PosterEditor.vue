<template>
  <div class="ai-poster-editor">
    <!-- 头部工具栏 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button @click="goBack" class="back-btn" text>
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="project-info">
          <h3 class="project-title">{{ projectName }}</h3>
          <span class="project-subtitle">AI智能海报编辑器</span>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="switchMode" class="action-btn">
          <el-icon><Refresh /></el-icon>
          切换模式
        </el-button>
        <el-button @click="saveProject" class="action-btn">
          <el-icon><Document /></el-icon>
          保存
        </el-button>
        <el-button @click="exportPoster" class="action-btn primary" :disabled="!currentPosterUrl">
          <el-icon><Download /></el-icon>
          导出海报
        </el-button>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="editor-main">
      <!-- 海报预览面板 -->
      <div class="poster-preview-panel">
        <div class="preview-header">
          <h4>海报预览</h4>
          <div class="preview-actions">
            <el-button @click="regeneratePoster" size="small" :loading="regenerating" :disabled="!currentPosterUrl">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
            <el-button @click="resetPoster" size="small" type="danger" plain>
              <el-icon><Delete /></el-icon>
              重置
            </el-button>
          </div>
        </div>

        <div class="preview-container">
          <div class="poster-canvas" :class="{ 'loading': isGenerating }">
            <div v-if="isGenerating" class="loading-overlay">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <p>AI正在为您生成海报...</p>
            </div>
            <div v-else-if="currentPosterUrl" class="image-viewer">
              <!-- 缩放控制按钮 -->
              <div class="zoom-controls">
                <el-button-group size="small">
                  <el-button @click="zoomOut" :disabled="zoomLevel <= 0.2">
                    <el-icon><ZoomOut /></el-icon>
                  </el-button>
                  <el-button @click="resetZoom">
                    {{ Math.round(zoomLevel * 100) }}%
                  </el-button>
                  <el-button @click="zoomIn" :disabled="zoomLevel >= 3">
                    <el-icon><ZoomIn /></el-icon>
                  </el-button>
                </el-button-group>
                <el-button @click="fitToContainer" size="small" type="primary" plain>
                  适应窗口
                </el-button>
              </div>

              <!-- 可滚动的图片容器 -->
              <div
                class="scrollable-container"
                ref="scrollContainer"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseUp"
              >
                <div class="image-wrapper">
                  <img
                    :src="currentPosterUrl"
                    alt="生成的海报"
                    class="poster-image"
                    :style="{
                      transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                    }"
                    @load="onImageLoad"
                    @error="onImageError"
                    @wheel="handleWheel"
                    @mousedown="handleMouseDown"
                    @dragstart.prevent
                  />
                </div>
              </div>
            </div>
            <div v-else class="empty-poster">
              <el-icon><Picture /></el-icon>
              <p>暂无海报，请在右侧对话框中描述您想要的海报</p>
            </div>
          </div>
        </div>

        <div v-if="currentPosterUrl" class="poster-info">
          <div class="info-item">
            <span class="label">尺寸：</span>
            <span class="value">{{ posterSize }}</span>
          </div>
          <div class="info-item">
            <span class="label">风格：</span>
            <span class="value">{{ posterStyle }}</span>
          </div>
          <div class="info-item">
            <span class="label">生成时间：</span>
            <span class="value">{{ formatTime(lastGeneratedTime) }}</span>
          </div>
        </div>
      </div>

      <!-- AI对话面板 -->
      <div class="ai-chat-panel">
        <div class="chat-header">
          <div class="ai-avatar">
            <el-icon><Promotion /></el-icon>
          </div>
          <div class="ai-info">
            <h4>AI设计助手</h4>
            <p>告诉我您想要什么样的海报，我来为您设计</p>
          </div>
          <div class="header-controls">
            <el-button
              @click="toggleControlPanel"
              size="small"
              :icon="controlPanelVisible ? 'ArrowUp' : 'ArrowDown'"
              circle
              class="toggle-btn"
              title="折叠/展开控制面板"
            />
          </div>
        </div>

        <!-- 扩展的对话区域 -->
        <div class="chat-messages-container" :class="{ 'expanded': !controlPanelVisible }">
          <div class="chat-messages" ref="chatMessagesRef">
            <div
              v-for="message in chatMessages"
              :key="message.id"
              class="message-item"
              :class="{ 'user': message.type === 'user', 'ai': message.type === 'ai' }"
            >
              <div class="message-avatar">
                <el-icon v-if="message.type === 'user'"><User /></el-icon>
                <el-icon v-else><Promotion /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div v-if="message.posterUrl" class="message-poster">
                  <img :src="message.posterUrl" alt="生成的海报" class="mini-poster" />
                </div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>

            <!-- AI思考中状态 -->
            <div v-if="aiThinking" class="message-item thinking">
              <div class="message-avatar">
                <el-icon class="thinking-icon"><Promotion /></el-icon>
              </div>
              <div class="message-content">
                <div class="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="message-text">AI正在思考中...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 可折叠的控制面板 -->
        <div v-show="controlPanelVisible" class="control-panel">
          <el-tabs v-model="activeTab" class="control-tabs" size="small">
            <el-tab-pane label="快速操作" name="quick">
              <div class="quick-actions-content">
                <div class="action-buttons">
                  <div class="button-row">
                    <el-button @click="generateQuickPrompt('温馨可爱')" size="small" class="action-btn">温馨可爱</el-button>
                    <el-button @click="generateQuickPrompt('色彩鲜艳')" size="small" class="action-btn">色彩鲜艳</el-button>
                    <el-button @click="generateQuickPrompt('简约清新')" size="small" class="action-btn">简约清新</el-button>
                  </div>
                  <div class="button-row">
                    <el-button @click="generateQuickPrompt('添加装饰')" size="small" class="action-btn">添加装饰</el-button>
                    <el-button @click="generateQuickPrompt('调整颜色')" size="small" class="action-btn">调整颜色</el-button>
                    <el-button @click="generateQuickPrompt('修改排版')" size="small" class="action-btn">修改排版</el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="风格设置" name="style">
              <div class="style-controls-content">
                <div class="control-row">
                  <div class="control-item">
                    <label>风格：</label>
                    <el-select v-model="styleSelect" placeholder="不指定" size="small">
                      <el-option v-for="o in styleOptions" :key="o" :label="o" :value="o" />
                    </el-select>
                  </div>
                  <div class="control-item">
                    <label>镜头：</label>
                    <el-select v-model="lensSelect" placeholder="不指定" size="small">
                      <el-option v-for="o in lensOptions" :key="o" :label="o" :value="o" />
                    </el-select>
                  </div>
                </div>
                <div class="control-row">
                  <div class="control-item">
                    <label>色调：</label>
                    <el-select v-model="toneSelect" placeholder="不指定" size="small">
                      <el-option v-for="o in toneOptions" :key="o" :label="o" :value="o" />
                    </el-select>
                  </div>
                  <div class="control-item">
                    <label>构图：</label>
                    <el-select v-model="compositionSelect" placeholder="不指定" size="small">
                      <el-option v-for="o in compositionOptions" :key="o" :label="o" :value="o" />
                    </el-select>
                  </div>
                </div>
                <div class="control-row full-width">
                  <div class="control-item full">
                    <label>负面提示：</label>
                    <el-input
                      v-model="negativePrompt"
                      placeholder="例如：避免卡通人物、避免彩虹色"
                      size="small"
                      clearable
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>


        <div class="chat-input-area">
          <div class="input-container">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="3"
              placeholder="描述您想要的海报样式，比如：生成一张温馨可爱的春季运动会海报..."
              class="chat-input"
              @keydown.enter.ctrl="sendMessage"
            />
            <div class="input-actions">
              <span class="input-tips">Ctrl + Enter 发送</span>
              <el-button
                @click="sendMessage"
                type="primary"
                class="send-btn"
                :disabled="!userInput.trim() || isGenerating"
                :loading="isGenerating"
              >
                <el-icon><Brush /></el-icon>
                生成
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue 相关导入
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Brush,
  Document,
  Download,
  Refresh,
  Delete,
  Loading,
  Picture,
  Promotion,
  User,
  ZoomIn,
  ZoomOut
} from '@element-plus/icons-vue'

// API 导入
import { AutoImageApi, type ImageGenerationRequest } from '@/api/auto-image'

// 类型定义
interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: number
  posterUrl?: string
}

// 路由和API实例
const router = useRouter()
const route = useRoute()
const autoImageApi = new AutoImageApi()

// 响应式数据
const projectName = ref('活动海报设计')
const currentPosterUrl = ref('')
const isGenerating = ref(false)
const regenerating = ref(false)
const aiThinking = ref(false)
const userInput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const chatMessagesRef = ref<HTMLElement>()
const posterSize = ref('1024x1024')
const posterStyle = computed(() => {
  return styleSelect.value ? `${styleSelect.value}风格` : '自然风格'
})
const lastGeneratedTime = ref(0)

// 图片缩放相关
const zoomLevel = ref(1)
const scrollContainer = ref<HTMLElement>()

// 图片拖拽相关
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const imagePosition = ref({ x: 0, y: 0 })
const lastImagePosition = ref({ x: 0, y: 0 })

// 控制面板状态
const controlPanelVisible = ref(true)
const activeTab = ref('quick')


// 个性化提示控制项的数据
const styleOptions = ['卡通', '写实', '插画', '极简', '复古', '赛博']
const lensOptions = ['远景', '全景', '中景', '近景', '特写']
const toneOptions = ['暖色调', '冷色调', '明亮', '柔和', '高对比']
const compositionOptions = ['居中', '三分法', '留白多', '对称', '对角线']
const styleSelect = ref<string>('')
const lensSelect = ref<string>('')
const toneSelect = ref<string>('')
const compositionSelect = ref<string>('')
const negativePrompt = ref('')

// 预设提示词数据
const promptPresets = ref([
  { id: 1, name: '温馨可爱', prompt: '生成一张温馨可爱的幼儿园活动海报，色彩柔和，充满童趣' },
  { id: 2, name: '色彩鲜艳', prompt: '生成一张色彩鲜艳的幼儿园活动海报，活泼生动，吸引眼球' },
  { id: 3, name: '简约清新', prompt: '生成一张简约清新的海报，设计简洁，重点突出' },
  { id: 4, name: '科学探索', prompt: '生成一张科学探索主题的海报，包含实验器材和探索元素' },
  { id: 5, name: '春季主题', prompt: '生成一张春季主题的海报，包含花朵、绿叶等春天元素' },
  { id: 6, name: '运动活力', prompt: '生成一张运动主题的海报，充满活力和动感' }
])

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 活动信息（从URL参数获取）
const activityInfo = reactive({
  title: '',
  description: '',
  location: '',
  startTime: '',
  capacity: 0,
  fee: 0,
  posterUrl: ''
})

// 工具函数
const formatTime = (timestamp: number) => {
  if (!timestamp) return '--'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载模板图片
const loadTemplateImage = (templateId: string) => {
  // 构建模板图片URL - 注意这里需要去掉 /api 前缀
  const templateImageUrl = `http://localhost:3000/uploads/posters/poster-template-${templateId}.svg`

  console.log('🖼️ 加载模板图片:', templateImageUrl)

  // 设置当前海报URL
  currentPosterUrl.value = templateImageUrl
  lastGeneratedTime.value = Date.now()

  // 添加加载成功消息
  addChatMessage('ai', `已为您加载模板图片，您可以基于此模板进行修改。请告诉我您想要调整的地方。`)
}

// 初始化活动信息
const initializeFromActivity = () => {
  const params = new URLSearchParams(window.location.search)

  // 检查是否是模板编辑模式
  const mode = params.get('mode')
  const templateId = params.get('templateId')
  const templateName = params.get('templateName')

  if (mode === 'edit' && templateId && templateName) {
    // 模板编辑模式
    activityInfo.title = decodeURIComponent(templateName)
    activityInfo.description = '模板编辑模式'
    projectName.value = `编辑模板: ${activityInfo.title}`

    // 添加模板编辑欢迎消息
    addChatMessage('ai', `欢迎使用AI海报编辑器！您正在编辑模板"${activityInfo.title}"。您可以告诉我想要修改的地方，比如调整颜色、添加元素、修改文字等。`)

    // 加载模板的现有图片
    loadTemplateImage(templateId)
    console.log('模板编辑模式:', { templateId, templateName })
  } else if (route.params.templateId) {
    // 通过路由参数传递的模板ID
    const routeTemplateId = route.params.templateId as string
    console.log('🎯 检测到路由模板ID:', routeTemplateId)

    // 设置默认的活动信息，避免posterTitle为空
    activityInfo.title = '幼儿园活动海报'
    activityInfo.description = '基于模板创建的活动海报'
    projectName.value = '海报编辑器'

    loadTemplateImage(routeTemplateId)
  } else {
    // 活动海报设计模式
    activityInfo.title = params.get('activityTitle') || '幼儿园活动'
    activityInfo.description = params.get('activityDescription') || ''
    activityInfo.location = params.get('activityLocation') || ''
    activityInfo.startTime = params.get('activityStartTime') || ''
    activityInfo.capacity = parseInt(params.get('activityCapacity') || '0')
    activityInfo.fee = parseFloat(params.get('activityFee') || '0')
    activityInfo.posterUrl = params.get('posterUrl') || ''

    // 设置项目名称
    projectName.value = `${activityInfo.title} - 海报设计`

    // 如果有海报URL，设置为当前海报
    if (activityInfo.posterUrl) {
      currentPosterUrl.value = activityInfo.posterUrl
      lastGeneratedTime.value = Date.now()

      // 添加初始消息
      addChatMessage('ai', `欢迎使用AI海报编辑器！我已经为您加载了"${activityInfo.title}"的海报。您可以告诉我想要修改的地方，比如调整颜色、添加元素、修改文字等。`)
    } else {
      // 添加欢迎消息
      addChatMessage('ai', `欢迎使用AI海报编辑器！我将为您的活动"${activityInfo.title}"设计海报。请告诉我您想要什么样的海报风格和内容。`)
    }
  }
}

// 添加聊天消息
const addChatMessage = (type: 'user' | 'ai', content: string, posterUrl?: string) => {
  const message: ChatMessage = {
    id: generateId(),
    type,
    content,
    timestamp: Date.now(),
    posterUrl
  }

  chatMessages.value.push(message)

  // 滚动到底部
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isGenerating.value) return

  // 添加用户消息
  addChatMessage('user', message)
  userInput.value = ''

  // 显示AI思考状态
  aiThinking.value = true
  isGenerating.value = true

  try {
    // 调用AI处理消息
    await processAIMessage(message)
  } catch (error) {
    console.error('AI处理失败:', error)
    addChatMessage('ai', '抱歉，我遇到了一些问题。请稍后再试。')
  } finally {
    aiThinking.value = false
  }
}

// 快捷消息
const sendQuickMessage = (message: string) => {
  userInput.value = message
  sendMessage()
}

// 生成快捷提示词
const generateQuickPrompt = (style: string) => {
  let prompt = `生成一张${style}的幼儿园活动海报`

  // 结合风格设置
  const selectedStyles = []
  if (styleSelect.value) selectedStyles.push(`${styleSelect.value}风格`)
  if (lensSelect.value) selectedStyles.push(`${lensSelect.value}构图`)
  if (toneSelect.value) selectedStyles.push(`${toneSelect.value}色调`)
  if (compositionSelect.value) selectedStyles.push(`${compositionSelect.value}布局`)

  if (selectedStyles.length > 0) {
    prompt += `，采用${selectedStyles.join('、')}`
  }

  // 添加基础要求
  prompt += '，色彩丰富，适合儿童，包含活动相关元素'

  userInput.value = prompt
}

// 使用预设提示词
const usePreset = (preset: any) => {
  userInput.value = preset.prompt
}

// 切换控制面板显示/隐藏
const toggleControlPanel = () => {
  controlPanelVisible.value = !controlPanelVisible.value
}

// 获取选择的风格
const getSelectedStyle = () => {
  // 根据用户选择的风格返回对应的AI风格参数
  const styleMap: Record<string, string> = {
    '卡通': 'cartoon',
    '写实': 'photographic',
    '插画': 'illustration',
    '极简': 'minimalist',
    '复古': 'vintage',
    '赛博': 'cyberpunk'
  }

  return styleMap[styleSelect.value] || 'natural'
}

// 增强提示词多样性
const enhancePromptDiversity = (basePrompt: string) => {
  // 添加随机的视觉元素来增加多样性
  const visualElements = [
    '色彩丰富',
    '温馨明亮',
    '活泼生动',
    '清新自然',
    '充满童趣',
    '专业设计感'
  ]

  const compositions = [
    '居中对称布局',
    '左右分栏设计',
    '上下层次分明',
    '圆形构图',
    '对角线构图'
  ]

  const atmospheres = [
    '温馨友好的氛围',
    '充满活力的感觉',
    '安全可靠的环境',
    '快乐成长的主题',
    '专业教育的品质'
  ]

  // 随机选择一些元素来增强提示词
  const randomVisual = visualElements[Math.floor(Math.random() * visualElements.length)]
  const randomComposition = compositions[Math.floor(Math.random() * compositions.length)]
  const randomAtmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)]

  return `${basePrompt}，${randomVisual}，${randomComposition}，${randomAtmosphere}`
}

// AI处理消息的核心方法
const processAIMessage = async (userMessage: string) => {
  try {
    // 构建海报生成/修改的提示词
    let prompt: string

    if (!currentPosterUrl.value) {
      // 首次生成海报
      prompt = buildInitialPosterPrompt(userMessage)
    } else {
      // 修改现有海报
      prompt = buildModificationPrompt(userMessage)
    }

    console.log('🎨 AI海报生成提示词:', prompt)

    // 根据用户选择的风格确定样式
    const selectedStyleValue = getSelectedStyle()

    // 调用AI生成海报
    const response = await autoImageApi.generatePosterImage({
      posterTitle: activityInfo.title,
      posterContent: prompt,
      style: selectedStyleValue,
      size: '1024x1024',
      quality: 'hd'
    })

    if (response.success && response.data && response.data.imageUrl) {
      // 更新海报
      currentPosterUrl.value = response.data.imageUrl
      lastGeneratedTime.value = Date.now()

      // 生成AI回复并添加海报
      const aiReply = generateAIReply(userMessage)
      addChatMessage('ai', aiReply, response.data.imageUrl)

      ElMessage.success('海报已更新！')
    } else {
      throw new Error(response.message || '海报生成失败')
    }
  } catch (error) {
    console.error('AI处理消息失败:', error)
    addChatMessage('ai', '抱歉，海报生成失败了。请稍后再试或者换个描述方式。')
    ElMessage.error('海报生成失败')
  } finally {
    isGenerating.value = false
  }
}

// 构建初始海报生成提示词
const buildInitialPosterPrompt = (userMessage: string) => {
  const baseInfo = `活动名称：${activityInfo.title}，活动描述：${activityInfo.description}`
  const locationInfo = activityInfo.location ? `，地点：${activityInfo.location}` : ''
  const timeInfo = activityInfo.startTime ? `，时间：${new Date(activityInfo.startTime).toLocaleDateString()}` : ''
  const capacityInfo = activityInfo.capacity ? `，限${activityInfo.capacity}人` : ''
  const feeInfo = activityInfo.fee !== undefined ? `，费用：${activityInfo.fee === 0 ? '免费' : `${activityInfo.fee}元`}` : ''

  const extras = [styleSelect.value, lensSelect.value, toneSelect.value, compositionSelect.value].filter(Boolean).join('，')
  const negative = negativePrompt.value ? `。避免：${negativePrompt.value}` : ''
  const withExtras = extras ? `。风格/镜头/色调/构图：${extras}` : ''

  const basePrompt = `${baseInfo}${locationInfo}${timeInfo}${capacityInfo}${feeInfo}。用户要求：${userMessage}${withExtras}${negative}`

  // 使用增强的多样性
  return enhancePromptDiversity(basePrompt)
}

// 构建修改海报提示词
const buildModificationPrompt = (userMessage: string) => {
  const baseInfo = `当前海报是关于"${activityInfo.title}"的活动海报`
  const extras = [styleSelect.value, lensSelect.value, toneSelect.value, compositionSelect.value].filter(Boolean).join('，')
  const negative = negativePrompt.value ? `。避免：${negativePrompt.value}` : ''
  const withExtras = extras ? `。风格/镜头/色调/构图：${extras}` : ''

  const basePrompt = `${baseInfo}。用户希望修改：${userMessage}${withExtras}${negative}`

  // 使用增强的多样性
  return enhancePromptDiversity(basePrompt)
}

// 生成AI回复
const generateAIReply = (userMessage: string) => {
  const replies = [
    `好的，我已经根据您的要求"${userMessage}"重新设计了海报。`,
    `海报已更新！我按照您的要求"${userMessage}"进行了调整。`,
    `完成了！我根据"${userMessage}"这个要求优化了海报设计。`,
    `海报修改完成！按照您的想法"${userMessage}"进行了改进。`
  ]

  return replies[Math.floor(Math.random() * replies.length)]
}

// 海报操作方法
const generateInitialPoster = async () => {
  if (!activityInfo.title) {
    ElMessage.warning('请先设置活动信息')
    return
  }

  // 取消默认提示词：不再自动填充或发送任何描述
  ElMessage.info('请在右侧输入您想要的海报描述后再生成')
}

const regeneratePoster = async () => {
  if (!currentPosterUrl.value) {
    await generateInitialPoster()
    return
  }

  regenerating.value = true
  try {
    const message = '请重新生成一张不同风格的海报'
    await processAIMessage(message)
    addChatMessage('ai', '我为您重新生成了一张海报，希望您喜欢！')
  } catch (error) {
    ElMessage.error('重新生成失败')
  } finally {
    regenerating.value = false
  }
}

const resetPoster = () => {
  ElMessageBox.confirm('确定要重置海报吗？这将清除当前的海报和对话历史。', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    currentPosterUrl.value = ''
    chatMessages.value = []
    lastGeneratedTime.value = 0

    // 添加欢迎消息
    addChatMessage('ai', `欢迎重新开始！我将为您的活动"${activityInfo.title}"设计全新的海报。请告诉我您想要什么样的海报风格和内容。`)

    ElMessage.success('海报已重置')
  }).catch(() => {
    // 用户取消
  })
}

// 图片加载事件
const onImageLoad = () => {
  console.log('海报图片加载成功')
  // 图片加载完成后，自动适应容器大小
  nextTick(() => {
    fitToContainer()
  })
}

const onImageError = () => {
  console.error('海报图片加载失败')
  ElMessage.error('海报图片加载失败')
}

// 图片缩放相关方法
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value = Math.min(3, zoomLevel.value + 0.2)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.2) {
    zoomLevel.value = Math.max(0.2, zoomLevel.value - 0.2)
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
  resetImagePosition()
}

const fitToContainer = () => {
  if (scrollContainer.value) {
    const container = scrollContainer.value
    const img = container.querySelector('img')
    if (img) {
      const containerWidth = container.clientWidth - 40 // 减去padding
      const containerHeight = container.clientHeight - 40 // 减去padding
      const imgWidth = img.naturalWidth
      const imgHeight = img.naturalHeight

      const scaleX = containerWidth / imgWidth
      const scaleY = containerHeight / imgHeight
      const scale = Math.min(scaleX, scaleY, 1) // 不超过原始大小

      zoomLevel.value = scale
      resetImagePosition()
    }
  }
}

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.2, Math.min(3, zoomLevel.value + delta))
    zoomLevel.value = newZoom
  }
}

// 图片拖拽相关方法
const handleMouseDown = (event: MouseEvent) => {
  if (zoomLevel.value > 1) { // 只有在放大状态下才允许拖拽
    isDragging.value = true
    dragStart.value = { x: event.clientX, y: event.clientY }
    lastImagePosition.value = { ...imagePosition.value }
    event.preventDefault()
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value && zoomLevel.value > 1) {
    const deltaX = event.clientX - dragStart.value.x
    const deltaY = event.clientY - dragStart.value.y

    imagePosition.value = {
      x: lastImagePosition.value.x + deltaX,
      y: lastImagePosition.value.y + deltaY
    }
    event.preventDefault()
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 重置图片位置
const resetImagePosition = () => {
  imagePosition.value = { x: 0, y: 0 }
}

// 基本操作方法
const goBack = () => {
  router.go(-1)
}

// 切换到模式选择页面
const switchMode = () => {
  router.push('/principal/poster-mode-selection')
}

const saveProject = async () => {
  try {
    if (!currentPosterUrl.value) {
      ElMessage.warning('请先生成海报')
      return
    }

    // 检查是否是编辑模式
    const params = new URLSearchParams(window.location.search)
    const mode = params.get('mode')
    const templateId = params.get('templateId')
    const templateName = params.get('templateName')
    const isEditMode = mode === 'edit' && templateId

    // 弹出保存对话框，让用户输入模板信息
    const defaultValue = isEditMode ? decodeURIComponent(templateName || '') : ''
    const { value: templateInfo } = await ElMessageBox.prompt(
      '请输入模板名称和分类（用逗号分隔，如：春季运动会,sports）',
      isEditMode ? '更新模板' : '保存为模板',
      {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputPlaceholder: '模板名称,分类',
        inputValue: defaultValue
      }
    )

    if (!templateInfo) {
      return
    }

    const [name, category] = templateInfo.split(',').map(s => s.trim())
    if (!name) {
      ElMessage.error('请输入模板名称')
      return
    }

    // 准备模板数据
    const templateData = {
      name: name,
      description: `AI生成的${name}海报模板`,
      category: category || 'general',
      width: 1024,
      height: 1024,
      background: currentPosterUrl.value,
      thumbnail: currentPosterUrl.value,
      status: 1,
      usageCount: 0,
      kindergartenId: null, // 设置为null避免外键约束问题
      remark: `通过AI海报编辑器${isEditMode ? '更新' : '创建'}于${new Date().toLocaleString()}`
    }

    console.log('📤 发送模板保存请求:', JSON.stringify(templateData, null, 2));
    console.log('🔧 编辑模式:', isEditMode, '模板ID:', templateId);

    // 根据模式选择API调用方式
    const url = isEditMode ? `/api/poster-templates/${templateId}` : '/api/poster-templates'
    const method = isEditMode ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(templateData)
    })

    console.log('📥 服务器响应状态:', response.status);

    const result = await response.json()
    console.log('📥 服务器响应数据:', result);

    if (result.success) {
      ElMessage.success(isEditMode ? '模板更新成功' : '模板保存成功')
    } else {
      console.error('❌ 模板保存失败:', result);
      ElMessage.error(result.message || '保存失败')
    }
  } catch (error) {
    console.error('保存项目失败:', error)
    if (error.action !== 'cancel') {
      ElMessage.error('保存失败')
    }
  }
}

const exportPoster = async () => {
  if (!currentPosterUrl.value) {
    ElMessage.warning('请先生成海报')
    return
  }

  try {
    const link = document.createElement('a')
    link.href = currentPosterUrl.value
    link.download = `${activityInfo.title || '活动'}_海报.jpg`
    link.click()
    ElMessage.success('海报下载成功')
  } catch (error) {
    console.error('导出海报失败:', error)
    ElMessage.error('导出失败')
  }
}

// 页面初始化
onMounted(() => {
  initializeFromActivity()

  // 监听窗口大小变化，重新适应图片大小
  const handleResize = () => {
    if (currentPosterUrl.value && zoomLevel.value === 1) {
      nextTick(() => {
        fitToContainer()
      })
    }
  }

  window.addEventListener('resize', handleResize)

  // 组件卸载时移除监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<style lang="scss" scoped>
.ai-poster-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-gray-light);

  .editor-header {
    height: 60px;
    background: white;
    border-bottom: var(--border-width-base) solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--text-3xl);
    box-shadow: 0 2px var(--spacing-xs) var(--shadow-lighter);

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--text-lg);

      .back-btn {
        color: var(--text-regular);
        font-size: var(--text-base);

        &:hover {
          color: var(--primary-color);
        }
      }

      .project-info {
        .project-title {
          margin: 0;
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .project-subtitle {
          font-size: var(--text-sm);
          color: var(--info-color);
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--text-sm);

      .action-btn {
        height: var(--button-height-md);
        padding: 0 var(--text-lg);
        border-radius: var(--radius-md);
        font-size: var(--text-base);

        &.primary {
          background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          border: none;

          &:hover {
            transform: translateY(-var(--border-width-base));
            box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(102, 126, 234, 0.4);
          }
        }
      }
    }
  }

  .editor-main {
    flex: 1;
    display: flex;
    gap: var(--spacing-xs);
    background: #e9ecef;
    overflow: hidden;

    .poster-preview-panel {
      flex: 1;
      background: white;
      display: flex;
      flex-direction: column;
      padding: var(--text-3xl);
      overflow: hidden;

      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--text-2xl);

        h4 {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .preview-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }

      .preview-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-gray-light);
        border-radius: var(--spacing-sm);
        position: relative;

        .poster-canvas {
          position: relative;
          max-width: 100%;
          max-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.loading {
            background: var(--bg-hover);
            border: 2px dashed #d0d7de;
            border-radius: var(--spacing-sm);
            min-height: 400px;
            min-width: 300px;
          }

          .loading-overlay {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--text-lg);

            .loading-icon {
              font-size: var(--text-5xl);
              animation: spin 2s linear infinite;
            }

            p {
              margin: 0;
              font-size: var(--text-base);
            }
          }

          .image-viewer {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;

            .zoom-controls {
              position: absolute;
              top: 10px;
              right: 10px;
              z-index: 10;
              display: flex;
              gap: var(--spacing-sm);
              background: var(--white-alpha-90);
              padding: var(--spacing-sm);
              border-radius: var(--radius-md);
              box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
            }

            .scrollable-container {
              flex: 1;
              overflow: hidden; // 隐藏滚动条，使用拖拽代替
              background: var(--bg-gray-light);
              border-radius: var(--spacing-sm);
              position: relative;
              user-select: none; // 防止拖拽时选中文本

              .image-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                width: fit-content;
                height: fit-content;
                min-width: 100%;
                min-height: 100%;
                padding: var(--text-2xl);
                box-sizing: border-box;

                .poster-image {
                  display: block;
                  transition: none; // 移除过渡效果，避免拖拽时的延迟
                  transform-origin: center;
                  max-width: none;
                  max-height: none;
                  pointer-events: auto;
                }
              }
            }
          }

          .empty-poster {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--text-lg);
            color: var(--info-color);

            .el-icon {
              font-size: var(--text-6xl);
            }

            p {
              margin: 0;
              font-size: var(--text-lg);
            }
          }
        }
      }

      .poster-info {
        margin-top: var(--text-2xl);
        padding: var(--text-lg);
        background: var(--bg-gray-light);
        border-radius: var(--spacing-sm);

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-sm);

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: var(--text-regular);
            font-size: var(--text-base);
          }

          .value {
            color: var(--text-primary);
            font-size: var(--text-base);
            font-weight: 500;
          }
        }
      }
    }

    .ai-chat-panel {
      width: 400px;
      background: white;
      display: flex;
      flex-direction: column;
      border-left: var(--border-width-base) solid #e9ecef;
      overflow: hidden;

      .chat-header {
        padding: var(--text-2xl) var(--text-3xl);
        border-bottom: var(--border-width-base) solid #e9ecef;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--text-sm);

        .ai-avatar {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: var(--text-2xl);
        }

        .ai-info {
          flex: 1;

          h4 {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--text-primary);
          }

          p {
            margin: 0;
            font-size: var(--text-sm);
            color: var(--info-color);
          }
        }

        .header-controls {
          .toggle-btn {
            width: var(--spacing-3xl);
            height: var(--spacing-3xl);
            background: var(--bg-hover);
            border: var(--border-width-base) solid var(--border-color-light);
            color: var(--text-regular);
            transition: all 0.3s ease;

            &:hover {
              background: #ecf5ff;
              border-color: #b3d8ff;
              color: var(--primary-color);
              transform: scale(1.1);
            }
          }
        }
      }

      // 对话消息容器
      .chat-messages-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 200px;
        transition: all 0.3s ease;

        &.expanded {
          flex: 2;
          min-height: 400px;
        }

        .chat-messages {
          flex: 1;
          padding: var(--text-2xl) var(--text-3xl);
          overflow-y: auto;

        .message-item {
          display: flex;
          gap: var(--text-sm);
          margin-bottom: var(--text-lg);

          &:last-child {
            margin-bottom: 0;
          }

          .message-avatar {
            width: var(--spacing-3xl);
            height: var(--spacing-3xl);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--text-lg);
            flex-shrink: 0;
          }

          &.user {
            flex-direction: row-reverse;

            .message-avatar {
              background: #e7f3ff;
              color: var(--primary-color);
            }

            .message-content {
              text-align: right;

              .message-text {
                background: var(--primary-color);
                color: white;
              }
            }
          }

          &.ai {
            .message-avatar {
              background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
              color: white;
            }

            .message-content {
              .message-text {
                background: var(--bg-hover);
                color: var(--text-primary);
              }
            }
          }

          &.thinking {
            .message-avatar {
              .thinking-icon {
                animation: pulse 1.5s ease-in-out infinite;
              }
            }

            .thinking-dots {
              display: flex;
              gap: var(--spacing-xs);
              align-items: center;

              span {
                width: 6px;
                height: 6px;
                border-radius: var(--radius-full);
                background: var(--primary-color);
                animation: bounce 1.4s ease-in-out infinite both;

                &:nth-child(1) { animation-delay: -0.32s; }
                &:nth-child(2) { animation-delay: -0.16s; }
                &:nth-child(3) { animation-delay: 0s; }
              }
            }
          }

          .message-content {
            flex: 1;

            .message-text {
              padding: var(--text-sm) var(--text-lg);
              border-radius: var(--text-sm);
              font-size: var(--text-base);
              line-height: 1.5;
              margin-bottom: var(--spacing-sm);
              word-wrap: break-word;
            }

            .message-poster {
              margin-bottom: var(--spacing-sm);

              .mini-poster {
                max-width: 120px;
                max-height: 120px;
                border-radius: var(--radius-md);
                box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
              }
            }

            .message-time {
              font-size: var(--text-sm);
              color: var(--text-placeholder);
            }
          }
        }
        }
      }

      // 控制面板样式
      .control-panel {
        border-top: var(--border-width-base) solid #e9ecef;
        background: var(--bg-gray-light);
        transition: all 0.3s ease;

        .control-tabs {
          .el-tabs__header {
            margin: 0;
            padding: 0 var(--text-3xl);
            background: var(--bg-hover);
            border-bottom: var(--border-width-base) solid var(--border-color);

            .el-tabs__nav-scroll {
              display: flex;
              justify-content: center;
            }

            .el-tabs__nav-wrap {
              &::after {
                display: none;
              }
            }

            .el-tabs__item {
              font-size: var(--text-sm);
              font-weight: 500;
              color: var(--text-regular);
              border: none;
              padding: var(--text-sm) var(--text-lg);

              &.is-active {
                color: var(--primary-color);
                background: white;
                border-bottom: 2px solid var(--primary-color);
              }

              &:hover {
                color: var(--primary-color);
              }
            }
          }

          .el-tabs__content {
            padding: var(--text-lg) var(--text-3xl);
          }
        }

        .quick-actions-content {
          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: var(--text-sm);

            .button-row {
              display: flex;
              justify-content: space-between;
              gap: var(--spacing-sm);

              .action-btn {
                flex: 1;
                font-size: var(--text-sm);
                height: var(--button-height-sm);
                padding: 0 var(--text-sm);
                border-radius: var(--text-base);
                background: var(--bg-gray-light);
                border: var(--border-width-base) solid #e9ecef;
                color: var(--text-regular);
                transition: all 0.2s;

                &:hover {
                  background: #e9ecef;
                  border-color: #dee2e6;
                  transform: translateY(-var(--border-width-base));
                  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
                }

                &:active {
                  transform: translateY(0);
                  box-shadow: 0 var(--border-width-base) var(--spacing-xs) var(--shadow-light);
                }
              }
            }
          }
        }

        .style-controls-content {
          .control-row {
            display: flex;
            gap: var(--text-lg);
            margin-bottom: var(--text-sm);

            &.full-width {
              .control-item.full {
                flex: 1;
              }
            }

            .control-item {
              display: flex;
              align-items: center;
              gap: var(--spacing-sm);
              flex: 1;

              label {
                font-size: var(--text-sm);
                color: var(--text-regular);
                font-weight: 500;
                white-space: nowrap;
                min-width: 60px;
              }

              .el-select,
              .el-input {
                flex: 1;
                min-width: 120px;

                .el-input__wrapper {
                  border-radius: var(--radius-md);
                  border: var(--border-width-base) solid var(--border-color-light);
                  font-size: var(--text-sm);
                  height: var(--spacing-3xl);

                  &:focus-within {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
                  }
                }
              }
            }
          }
        }
      }

      .quick-actions {
        padding: var(--text-lg) var(--text-3xl);
        border-top: var(--border-width-base) solid var(--bg-gray-light);
        border-bottom: var(--border-width-base) solid var(--bg-gray-light);

        h5 {
          margin: 0 0 var(--text-sm) 0;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-left: var(--text-2xl);

          .el-button {
            font-size: var(--text-sm);
            height: var(--button-height-sm);
            padding: 0 var(--text-sm);
            border-radius: var(--text-base);
            background: var(--bg-gray-light);
            border: var(--border-width-base) solid #e9ecef;
            color: var(--text-regular);
            transition: all 0.2s;

            &:hover {
              background: #e9ecef;
              border-color: #dee2e6;
              transform: translateY(-var(--border-width-base));
              box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
            }

            &:active {
              transform: translateY(0);
              box-shadow: 0 var(--border-width-base) var(--spacing-xs) var(--shadow-light);
            }
          }
        }
      }

      .prompt-controls {
        padding: var(--text-lg) var(--text-3xl);
        background: var(--bg-gray-light);
        border-bottom: var(--border-width-base) solid var(--bg-gray-light);

        .el-form {
          margin: 0;

          .el-form-item {
            margin-bottom: var(--text-sm);
            margin-right: var(--text-lg);

            &:last-child {
              margin-right: 0;
            }

            .el-form-item__label {
              font-size: var(--text-sm);
              color: var(--text-regular);
              font-weight: 500;
              padding-right: var(--spacing-sm);
            }

            .el-select,
            .el-input {
              .el-input__inner {
                border-radius: var(--radius-md);
                border: var(--border-width-base) solid var(--border-color-light);
                font-size: var(--text-sm);
                height: var(--spacing-3xl);
                line-height: var(--spacing-3xl);

                &:focus {
                  border-color: var(--primary-color);
                  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
                }
              }
            }
          }
        }
      }

      .chat-input-area {
        padding: var(--text-2xl) var(--text-3xl);

        .input-container {
          .chat-input {
            margin-bottom: var(--text-sm);

            :deep(.el-textarea__inner) {
              border-radius: var(--spacing-sm);
              border: var(--border-width-base) solid #e9ecef;
              font-size: var(--text-base);
              line-height: 1.5;
              resize: none;

              &:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
              }
            }
          }

          .input-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .input-tips {
              font-size: var(--text-sm);
              color: var(--info-color);
            }

            .send-btn {
              background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
              border: none;
              color: white;
              padding: var(--spacing-sm) var(--text-2xl);
              border-radius: var(--radius-md);
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;

              &:hover:not(:disabled) {
                transform: translateY(-var(--border-width-base));
                box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(102, 126, 234, 0.4);
              }

              &:active:not(:disabled) {
                transform: translateY(0);
                box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
              }

              &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }

              // 加载动画
              &.is-loading {
                .el-icon {
                  animation: spin 1s linear infinite;
                }
              }

              // 点击波纹效果
              &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: var(--radius-full);
                background: var(--white-alpha-30);
                transform: translate(-50%, -50%);
                transition: width 0.3s, height 0.3s;
              }

              &:active::after {
                width: 100px;
                height: 100px;
              }
            }
          }
        }
      }
    }
  }
}

/* 动画样式 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-xl)) {
  .ai-poster-editor {
    .editor-main {
      flex-direction: column;

      .ai-chat-panel {
        width: 100%;
        height: 300px;
      }
    }
  }
}
</style>
