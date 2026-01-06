<!--
  🤖 移动端AI聊天页面

  单页面AI交互界面 - 所有功能通过AI对话和Function Call实现
  支持各角色的个性化AI交互体验
-->

<template>
  <div class="mobile-ai-chat" :class="themeClasses">
    <!-- 顶部状态栏 -->
    <div class="top-status">
      <div class="status-left">
        <div class="status-dot"></div>
        <span>{{ aiOnline ? '智能助手在线' : '离线' }}</span>
      </div>
      <div class="status-right">
        <div class="signal-icon">📶</div>
        <div class="battery-icon">🔋</div>
        <span class="time">{{ timeNow }}</span>
      </div>
    </div>

    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <div class="breadcrumb-item">
        <div class="home-icon">🏠</div>
        <span>首页</span>
      </div>
      <div class="breadcrumb-separator">›</div>
      <div class="breadcrumb-item">AI工作台</div>
      <div class="breadcrumb-separator">›</div>
      <div class="breadcrumb-item active">智能对话</div>
    </div>

    <!-- 用户角色模式卡片 -->
    <div class="mode-card">
      <div class="mode-left">
        <div class="mode-avatar">
          <span>{{ roleEmoji }}</span>
        </div>
        <div class="mode-info">
          <div class="mode-title">{{ roleDisplayName }}模式</div>
          <div class="mode-subtitle">全权限访问</div>
        </div>
      </div>
      <div class="mode-action" @click="goProfile">
        <div class="dropdown-icon">⌄</div>
      </div>
    </div>

    <!-- AI功能模块 -->
    <div class="feature-grid">
      <button class="feature-btn blue" @click="sendQuickMessage('显示招生趋势并给出关键建议')">
        <div class="feature-icon">🧠</div>
        <div class="feature-text">智能体</div>
      </button>
      <button class="feature-btn purple" @click="sendQuickMessage('调用工具集，生成最近活动列表')">
        <div class="feature-icon">🛠️</div>
        <div class="feature-text">工具集</div>
      </button>
      <button class="feature-btn green" @click="sendQuickMessage('根据当前数据给一个自动化建议')">
        <div class="feature-icon">⚡</div>
        <div class="feature-text">工作流</div>
      </button>
    </div>

    <!-- 数据看板 -->
    <div class="stats-board">
      <div class="stats-header" @click="toggleStats">
        <div class="stats-title">
          <div class="stats-icon">📊</div>
          <span>数据看板</span>
        </div>
        <div class="expand-icon" :class="{ 'expanded': !statsCollapsed }">⌄</div>
      </div>
      <div v-show="!statsCollapsed" class="stats-content">
        <div class="stats-grid">
          <div class="stat-card primary" @click="openZoom('primary')">
            <div class="stat-title">今日对话</div>
            <div class="stat-value">248</div>
            <div class="stat-trend">
              <span class="trend-icon">📈</span>
              <span>+12%</span>
            </div>
          </div>
          <div class="stat-card green" @click="openZoom('green')">
            <div class="stat-title">活跃用户</div>
            <div class="stat-value">156</div>
            <div class="stat-trend">
              <span class="trend-icon">👥</span>
              <span>在线</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-area" ref="chatContainer">
      <!-- 欢迎消息/首屏引导 -->
      <div v-if="messages.length === 0" class="welcome-section">
        <!-- AI欢迎消息 -->
        <div class="message ai-msg">
          <div class="message-avatar ai-avatar">
            <span>✨</span>
          </div>
          <div class="message-content">
            <div class="message-bubble ai-bubble">
              <div class="ai-text">
                您好！我是幼儿园AI智能助手。我可以帮助您处理招生管理、教务安排、家长沟通等各种事务。请告诉我您需要什么帮助？
              </div>
            </div>
            <div class="message-time">AI助手 • 刚刚</div>
          </div>
        </div>

        <!-- 用户示例消息 -->
        <div class="message user-msg sample-msg" @click="sendQuickMessage('帮我分析一下本月的招生情况')">
          <div class="message-content">
            <div class="message-bubble user-bubble">
              帮我分析一下本月的招生情况
            </div>
            <div class="message-time">您 • 1分钟前</div>
          </div>
          <div class="message-avatar user-avatar">
            <span>{{ userEmoji }}</span>
          </div>
        </div>

        <!-- AI回复示例 -->
        <div class="message ai-msg">
          <div class="message-avatar ai-avatar">
            <span>✨</span>
          </div>
          <div class="message-content">
            <div class="message-bubble ai-bubble">
              <div class="ai-text">好的！我来为您分析本月招生情况：</div>
              <div class="data-grid">
                <div class="data-item">
                  <div class="data-label">新增报名</div>
                  <div class="data-value blue">45人</div>
                </div>
                <div class="data-item">
                  <div class="data-label">待审核</div>
                  <div class="data-value orange">12人</div>
                </div>
                <div class="data-item">
                  <div class="data-label">已确认</div>
                  <div class="data-value green">33人</div>
                </div>
                <div class="data-item">
                  <div class="data-label">完成率</div>
                  <div class="data-value purple">73.3%</div>
                </div>
              </div>
              <div class="ai-suggestion">
                建议重点跟进待审核的12名学生，预计本月可达成招生目标。
              </div>
            </div>
            <div class="message-time typing">
              <span>AI助手 • 正在输入</span>
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- 对话消息列表 -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-wrapper"
          :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
        >
          <!-- 用户消息 -->
          <div v-if="message.role === 'user'" class="message user-msg">
            <div class="message-avatar">
              <span>{{ userEmoji }}</span>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                {{ message.content }}
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- AI消息 -->
          <div v-else class="message ai-msg">
            <div class="message-avatar">
              <span>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div v-if="message.content" class="ai-text">
                  <MarkdownRenderer
                    :content="getMessageContent(message.content)"
                    :is-dark="isDarkMode"
                    :is-mobile="true"
                    :enable-code-highlight="true"
                    :enable-tables="true"
                    :enable-breaks="true"
                  />
                </div>

                <!-- AI正在思考动画 -->
                <div v-if="message.thinking" class="thinking-animation">
                  <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="thinking-text">AI正在思考...</span>
                </div>
              </div>

              <!-- Function Call结果展示区 -->
              <div v-if="message.toolResults && message.toolResults.length > 0" class="tool-results">
                <div
                  v-for="result in message.toolResults"
                  :key="result.id"
                  class="result-component"
                >
                  <!-- 动态加载结果展示组件 -->
                  <component
                    :is="getResultComponent(result.tool)"
                    :data="result.data"
                    :metadata="result.metadata"
                    @action="handleResultAction"
                  />
                </div>
              </div>

              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="isLoading" class="loading-message">
          <div class="message ai-msg">
            <div class="message-avatar">
              <span>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div class="thinking-animation">
                  <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="thinking-text">AI正在处理...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部输入区域 -->
    <div class="input-section">
      <!-- 多功能工具栏 -->
      <div class="input-toolbar">
        <button class="tool-btn voice">🎤</button>
        <button class="tool-btn camera">📷</button>
        <button class="tool-btn attachment">📎</button>
        <div class="spacer"></div>
        <button class="tool-btn settings" @click="goProfile">⚙️</button>
      </div>

      <!-- 输入框区域 -->
      <div class="input-wrapper">
        <div class="input-container">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="输入您的问题或指令..."
            class="message-input"
            @keyup.enter="sendMessage"
            ref="textareaRef"
          />
        </div>
        <button
          @click="sendMessage()"
          :disabled="!inputMessage.trim() || isLoading"
          class="send-btn"
          :class="{ 'active': inputMessage.trim() && !isLoading }"
        >
          <span v-if="!isLoading">➡️</span>
          <span v-else>⏳</span>
        </button>
      </div>

      <!-- 快捷指令 -->
      <div class="quick-actions">
        <template v-if="messages.length === 0">
          <button class="quick-btn" @click="sendQuickMessage('查看今日课程')">查看今日课程</button>
          <button class="quick-btn" @click="sendQuickMessage('学生考勤统计')">学生考勤统计</button>
          <button class="quick-btn" @click="sendQuickMessage('家长沟通记录')">家长沟通记录</button>
        </template>
        <template v-else>
          <button
            v-for="question in roleQuickQuestions.slice(0, 3)"
            :key="question"
            @click="sendQuickMessage(question)"
            class="quick-btn"
          >
            {{ question }}
          </button>
        </template>
      </div>
    </div>

    <!-- 全局提示 -->
    <div v-if="errorMessage" class="error-toast">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ errorMessage }}</span>
        <button @click="errorMessage = ''" class="error-close">✕</button>
      </div>
    </div>

    <!-- 智能入库确认对话框 -->
    <ActivityConfirmDialog
      :visible="showActivityDialog"
      :data="confirmDialogData"
      @close="handleDialogClose"
      @confirm="handleActivityConfirm"
    />

    <TodoConfirmDialog
      :visible="showTodoDialog"
      :data="confirmDialogData"
      @close="handleDialogClose"
      @confirm="handleTodoConfirm"
    />
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../src/stores/user'
import { useMobileAIStore } from '../stores/mobile-ai'
import MarkdownRenderer from '../components/common/MarkdownRenderer.vue'

// 导入结果展示组件
import StudentListResult from '../components/results/StudentListResult.vue'
import ActivityListResult from '../components/results/ActivityListResult.vue'
import StatisticsResult from '../components/results/StatisticsResult.vue'
import TodoListResult from '../components/results/TodoListResult.vue'
import DefaultResult from '../components/results/DefaultResult.vue'

// 导入确认对话框组件
import ActivityConfirmDialog from '../components/dialogs/ActivityConfirmDialog.vue'
import TodoConfirmDialog from '../components/dialogs/TodoConfirmDialog.vue'

// 注册组件
const components = {
  StudentListResult,
  ActivityListResult,
  StatisticsResult,
  TodoListResult,
  DefaultResult
}

// 接口定义
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  thinking?: boolean
  toolResults?: ToolResult[]
}

interface ToolResult {
  id: string
  tool: string
  data: any
  metadata?: any
}

// 数据和状态
const userStore = useUserStore()
const aiStore = useMobileAIStore()

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const aiOnline = ref(true)
const errorMessage = ref('')
const statsCollapsed = ref(false)
const timeNow = ref('')

// 确认对话框状态
const showActivityDialog = ref(false)
const showTodoDialog = ref(false)
const confirmDialogData = ref<any>(null)

// DOM引用
const messagesContainer = ref<HTMLElement>()
const chatContainer = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()

// 计算属性
const themeClasses = computed(() => ({
  'theme-admin': userStore.userInfo?.role === 'admin',
  'theme-principal': userStore.userInfo?.role === 'principal',
  'theme-teacher': userStore.userInfo?.role === 'teacher',
  'theme-parent': userStore.userInfo?.role === 'parent'
}))

// 暗色模式
const isDarkMode = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'dark'
})

// 获取消息内容（确保返回字符串）
const getMessageContent = (content: any): string => {
  console.log('🔍 调试消息内容:', content, typeof content)

  if (typeof content === 'string') {
    return content
  } else if (content && typeof content === 'object') {
    // 如果是对象，尝试提取文本内容
    if (content.text) return String(content.text)
    if (content.content) return String(content.content)
    if (content.message) return String(content.message)
    if (content.data && content.data.content) return String(content.data.content)
    if (content.data && content.data.text) return String(content.data.text)

    // 如果都没有，返回JSON字符串（格式化显示）
    try {
      return JSON.stringify(content, null, 2)
    } catch (error) {
      return String(content)
    }
  }
  return String(content || '')
}

const roleDisplayName = computed(() => {
  const roleMap = {
    'admin': '管理员',
    'principal': '园长',
    'teacher': '教师',
    'parent': '家长'
  }
  return roleMap[userStore.userInfo?.role as keyof typeof roleMap] || '用户'
})

const roleEmoji = computed(() => {
  const emojiMap = {
    'admin': '👨‍💼',
    'principal': '🎯',
    'teacher': '👨‍🏫',
    'parent': '👨‍👩‍👧‍👦'
  }
  return emojiMap[userStore.userInfo?.role as keyof typeof emojiMap] || '👤'
})

const userEmoji = computed(() => {
  return roleEmoji.value
})

const userName = computed(() => {
  return userStore.userInfo?.realName || userStore.userInfo?.username || '用户'
})

const roleQuickQuestions = computed(() => {
  const questionMap = {
    'admin': [
      '显示系统概况和用户统计',
      '查看最近的系统日志',
      '生成用户活跃度报告',
      '检查系统性能状态'
    ],
    'principal': [
      '显示招生数据和趋势',
      '查看本月财务报表',
      '班级情况总览分析',
      '教师绩效统计报告'
    ],
    'teacher': [
      '我的班级学生信息',
      '今日课程安排详情',
      '学生出勤情况统计',
      '生成班级周报告'
    ],
    'parent': [
      '孩子在校情况查询',
      '查看最新通知消息',
      '费用缴费记录查询',
      '孩子成长报告生成'
    ]
  }
  return questionMap[userStore.userInfo?.role as keyof typeof questionMap] || ['帮助我开始使用系统']
})

// 方法
const sendMessage = async (customMessage?: string) => {
  const content = customMessage || inputMessage.value.trim()
  if (!content || isLoading.value) return

  console.log('📤 移动端发送消息:', content)

  // 添加用户消息
  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date()
  }
  messages.value.push(userMessage)

  // 清空输入
  inputMessage.value = ''
  adjustTextareaHeight()

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  try {
    isLoading.value = true

    console.log('🤖 调用AI服务...')
    // 调用AI服务
    const response = await aiStore.sendMessage(content, userStore.userInfo?.role || 'parent')
    console.log('📥 AI响应:', response)

    // 检查响应是否成功
    if (!response || !response.success) {
      throw new Error(response?.error || '服务暂时不可用')
    }

    // 添加AI回复
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content || '抱歉，我暂时无法回复您的问题。',
      timestamp: new Date(),
      toolResults: response.toolResults || []
    }

    messages.value.push(aiMessage)

    // 检查是否有需要用户确认的智能入库请求
    if (response.toolResults) {
      for (const result of response.toolResults) {
        if (result.data) {
          // 检查活动入库请求
          if (result.data.type === 'activity-entry' && result.data.status === 'ready_for_confirmation') {
            confirmDialogData.value = result.data
            showActivityDialog.value = true
            break
          }
          // 检查任务入库请求
          else if (result.data.type === 'todo-entry' && result.data.status === 'ready_for_confirmation') {
            confirmDialogData.value = result.data
            showTodoDialog.value = true
            break
          }
        }
      }
    }

    // 滚动到底部
    await nextTick()
    scrollToBottom()

  } catch (error) {
    console.error('AI消息发送失败:', error)
    errorMessage.value = '发送消息失败，请重试'

    // 添加错误消息
    const errorMsg: Message = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: '抱歉，我暂时无法处理您的请求。请稍后重试。',
      timestamp: new Date()
    }
    messages.value.push(errorMsg)

  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const sendQuickMessage = (question: string) => {
  sendMessage(question)
}

// 数据看板折叠切换
const toggleStats = () => {
  statsCollapsed.value = !statsCollapsed.value
}

// 数据卡片放大查看
const openZoom = (type: string) => {
  console.log('打开数据详情:', type)
  // 这里可以添加数据详情查看逻辑
}

const handleInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const adjustTextareaHeight = () => {
  if (!textareaRef.value) return

  textareaRef.value.style.height = 'auto'
  const height = Math.min(textareaRef.value.scrollHeight, 120)
  textareaRef.value.style.height = height + 'px'
}

const scrollToBottom = () => {
  if (!messagesContainer.value) return
  setTimeout(() => {
    messagesContainer.value!.scrollTop = messagesContainer.value!.scrollHeight
  }, 100)
}

// 跳转个人中心
const router = useRouter()
const goProfile = () => {
  router.push('/mobile/profile')
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getResultComponent = (toolName: string) => {
  // 根据工具类型返回对应的结果展示组件
  const componentMap = {
    // 查询工具
    'query_students': 'StudentListResult',
    'query_activities': 'ActivityListResult',
    'get_statistics': 'StatisticsResult',
    'query_past_activities': 'ActivityListResult',
    'get_activity_statistics': 'StatisticsResult',
    'navigate_to_page': 'DefaultResult',
    // 📋 任务管理工具
    'create_todo_list': 'TodoListResult',
    'get_todo_list': 'TodoListResult',
    'update_todo_task': 'TodoListResult',
    'analyze_task_complexity': 'DefaultResult',
    'generate_todo_list': 'TodoListResult',
    'create_task_list': 'TodoListResult',
    'generate_staff_assignment': 'TodoListResult',
    // 入库请求
    'create_activity_entry': 'DefaultResult',
    'create_todo_entry': 'DefaultResult'
  }
  return componentMap[toolName as keyof typeof componentMap] || 'DefaultResult'
}

const handleResultAction = (action: any) => {
  console.log('处理结果操作:', action)

  // 检查是否需要显示确认对话框
  if (action.type === 'activity-entry' && action.status === 'ready_for_confirmation') {
    confirmDialogData.value = action.data
    showActivityDialog.value = true
  } else if (action.type === 'todo-entry' && action.status === 'ready_for_confirmation') {
    confirmDialogData.value = action.data
    showTodoDialog.value = true
  }
}

// 处理活动确认
const handleActivityConfirm = async (data: any) => {
  console.log('确认创建活动:', data)

  try {
    // 构建请求数据，包含图片信息
    const requestData = {
      ...data.extracted_data
    }

    // 如果有图片数据，处理图片上传或保存
    if (data.image_data) {
      // 如果是AI生成的图片，直接使用URL
      if (data.image_data.image_source === 'ai') {
        requestData.posterUrl = data.image_data.image_url
        requestData.posterSource = 'ai_generated'
        requestData.posterMetadata = data.image_data.image_metadata
      }
      // 如果是上传的图片，需要先上传文件
      else if (data.image_data.image_source === 'upload') {
        try {
          // 将base64转换为blob
          const base64Response = await fetch(data.image_data.image_url)
          const blob = await base64Response.blob()

          // 创建FormData上传文件
          const formData = new FormData()
          formData.append('file', blob, `activity-poster-${Date.now()}.jpg`)
          formData.append('folder', 'activities')

          // 上传图片文件
          const uploadResponse = await fetch('/api/files/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userStore.token}`
            },
            body: formData
          })

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            requestData.posterUrl = uploadResult.data.url
            requestData.posterSource = 'user_upload'
            requestData.posterMetadata = {
              originalName: data.image_data.image_metadata?.fileName,
              fileSize: data.image_data.image_metadata?.fileSize,
              uploadTime: new Date().toISOString()
            }
          } else {
            console.warn('图片上传失败，继续创建活动')
          }
        } catch (uploadError) {
          console.error('图片上传出错:', uploadError)
          // 上传失败不影响活动创建，只是没有海报
        }
      }
    }

    // 调用后端API创建活动
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(requestData)
    })

    if (response.ok) {
      const result = await response.json()

      // 添加成功消息
      let successContent = `✅ **活动创建成功！**\n\n活动"${data.extracted_data.title}"已成功添加到数据库中。\n\n📋 **活动详情**\n- 活动ID：${result.data?.id || result.id || '未知'}\n- 活动类型：${data.activity_type_name || '未知类型'}\n- 活动时间：${data.extracted_data.startTime ? new Date(data.extracted_data.startTime).toLocaleString('zh-CN') : '未设置'}\n- 活动地点：${data.extracted_data.location || '未设置'}`

      // 如果有图片信息，添加到成功消息中
      if (data.image_data) {
        successContent += `\n- 活动海报：${data.image_data.image_source === 'ai' ? 'AI智能生成' : '自定义上传'}✅`
      }

      successContent += `\n\n您可以在活动管理页面查看和管理此活动。`

      const successMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: successContent,
        timestamp: new Date()
      }
      messages.value.push(successMsg)

    } else {
      // 尝试解析错误响应
      let errorMessage = '创建活动失败'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (parseError) {
        console.warn('无法解析错误响应:', parseError)
      }

      throw new Error(`HTTP ${response.status}: ${errorMessage}`)
    }
  } catch (error) {
    console.error('创建活动失败:', error)

    // 根据错误类型提供更具体的错误信息
    let errorContent = `❌ **活动创建失败**\n\n`

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorContent += `网络连接失败，请检查您的网络连接后重试。`
    } else if (error.message.includes('401')) {
      errorContent += `身份验证失败，请重新登录后再试。`
    } else if (error.message.includes('403')) {
      errorContent += `您没有权限创建活动，请联系系统管理员。`
    } else if (error.message.includes('400')) {
      errorContent += `请求数据格式有误，请检查活动信息是否完整。`
    } else if (error.message.includes('500')) {
      errorContent += `服务器内部错误，请稍后重试或联系技术支持。`
    } else {
      errorContent += `发生未知错误：${error.message}。请稍后重试或联系系统管理员。`
    }

    errorContent += `\n\n🔄 **解决建议**\n- 检查网络连接\n- 验证活动信息是否完整\n- 稍后重新尝试\n- 如问题持续，请联系技术支持`

    const errorMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: errorContent,
      timestamp: new Date()
    }
    messages.value.push(errorMsg)
  } finally {
    showActivityDialog.value = false
    confirmDialogData.value = null
    await nextTick()
    scrollToBottom()
  }
}

// 处理任务确认
const handleTodoConfirm = async (data: any) => {
  console.log('确认创建任务:', data)

  try {
    // 调用后端API创建任务
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(data.extracted_data)
    })

    if (response.ok) {
      const result = await response.json()

      // 添加成功消息
      const successMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ **任务创建成功！**\n\n任务"${data.extracted_data.title}"已成功添加到数据库中。\n\n📝 **任务详情**\n- 任务ID：${result.data?.id || result.id || '未知'}\n- 优先级：${data.priority_name || '中'}\n- 任务状态：${data.status_name || '待处理'}\n- 截止时间：${data.extracted_data.dueDate ? new Date(data.extracted_data.dueDate).toLocaleString('zh-CN') : '未设置'}\n- 分配给：${data.extracted_data.assignedTo ? `用户 #${data.extracted_data.assignedTo}` : '未分配'}\n\n您可以在任务中心查看和管理此任务。`,
        timestamp: new Date()
      }
      messages.value.push(successMsg)

    } else {
      // 尝试解析错误响应
      let errorMessage = '创建任务失败'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (parseError) {
        console.warn('无法解析错误响应:', parseError)
      }

      throw new Error(`HTTP ${response.status}: ${errorMessage}`)
    }
  } catch (error) {
    console.error('创建任务失败:', error)

    // 根据错误类型提供更具体的错误信息
    let errorContent = `❌ **任务创建失败**\n\n`

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorContent += `网络连接失败，请检查您的网络连接后重试。`
    } else if (error.message.includes('401')) {
      errorContent += `身份验证失败，请重新登录后再试。`
    } else if (error.message.includes('403')) {
      errorContent += `您没有权限创建任务，请联系系统管理员。`
    } else if (error.message.includes('400')) {
      errorContent += `请求数据格式有误，请检查任务信息是否完整。`
    } else if (error.message.includes('500')) {
      errorContent += `服务器内部错误，请稍后重试或联系技术支持。`
    } else {
      errorContent += `发生未知错误：${error.message}。请稍后重试或联系系统管理员。`
    }

    errorContent += `\n\n🔄 **解决建议**\n- 检查网络连接\n- 验证任务信息是否完整\n- 确认您有任务创建权限\n- 稍后重新尝试\n- 如问题持续，请联系技术支持`

    const errorMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: errorContent,
      timestamp: new Date()
    }
    messages.value.push(errorMsg)
  } finally {
    showTodoDialog.value = false
    confirmDialogData.value = null
    await nextTick()
    scrollToBottom()
  }
}

// 关闭确认对话框
const handleDialogClose = () => {
  showActivityDialog.value = false
  showTodoDialog.value = false
  confirmDialogData.value = null
}

const clearChat = () => {
  if (messages.value.length === 0) return

  if (confirm('确定要清空所有对话记录吗？')) {
    messages.value = []
    aiStore.clearConversation()
  }
}

const exportChat = () => {
  if (messages.value.length === 0) {
    errorMessage.value = '没有对话内容可以导出'
    return
  }

  // 导出对话记录
  const chatContent = messages.value.map(msg =>
    `[${formatTime(msg.timestamp)}] ${msg.role === 'user' ? userName.value : 'AI'}: ${msg.content}`
  ).join('\n')

  const blob = new Blob([chatContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `AI对话记录_${new Date().toLocaleDateString()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const showHelp = () => {
  const helpMessage = `💡 AI助手使用帮助：

🗣️ 对话技巧：
• 用自然语言描述您的需求
• 可以询问数据、要求分析、请求操作
• 支持多轮对话，AI会记住上下文

🔧 功能示例：
• "查询本月的学生数量"
• "显示最近的活动列表"
• "生成班级出勤报告"
• "帮我分析招生趋势"

❓ 遇到问题时：
• 尝试重新描述您的需求
• 检查网络连接
• 联系技术支持`

  const helpMsg: Message = {
    id: Date.now().toString(),
    role: 'assistant',
    content: helpMessage,
    timestamp: new Date()
  }
  messages.value.push(helpMsg)

  nextTick(() => scrollToBottom())
}

// 更新时间显示
const updateTime = () => {
  timeNow.value = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  // 初始化AI Store
  aiStore.initializeConversation()

  // 初始化时间并设置定时更新
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)

  // 设置定时检查AI状态
  const statusCheck = setInterval(() => {
    // 模拟检查AI服务状态
    aiOnline.value = true
  }, 30000)

  onUnmounted(() => {
    clearInterval(statusCheck)
    clearInterval(timeInterval)
  })
})
</script>

<style lang="scss" scoped>
.mobile-ai-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
  position: relative;

  // 角色主题色
  &.theme-admin {
    --theme-color: #8b5cf6;
    --theme-light: #a78bfa;
  }

  &.theme-principal {
    --theme-color: #3b82f6;
    --theme-light: #60a5fa;
  }

  &.theme-teacher {
    --theme-color: #10b981;
    --theme-light: #34d399;
  }

  &.theme-parent {
    --theme-color: #f59e0b;
    --theme-light: #fbbf24;
  }
}

// 角色头部
.role-header {
  background: linear-gradient(135deg, var(--theme-color, #3b82f6), var(--theme-light, #60a5fa));
  color: white;
  padding: var(--spacing-md);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

  .role-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .role-avatar {
      width: 4var(--spacing-sm);
      height: 4var(--spacing-sm);
      background: rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;

      .role-emoji {
        font-size: 2var(--spacing-xs);
      }
    }

    .role-details {
      flex: 1;

      .role-badge {
        display: block;
        font-size: var(--spacing-md);
        font-weight: 600;
        margin-bottom: 2px;
      }

      .role-greeting {
        font-size: 1var(--spacing-xs);
        opacity: 0.9;
      }
    }

    .ai-status {
      display: flex;
      align-items: center;
      gap: 6px;

      .status-indicator {
        width: var(--spacing-sm);
        height: var(--spacing-sm);
        border-radius: var(--radius-full);
        background: #ef4444;

        &.online {
          background: #22c55e;
        }
      }

      .status-text {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }
}

// 聊天容器
.chat-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--spacing-md);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

// 欢迎区域
.welcome-section {
  padding: var(--spacing-xl) 0;
  text-align: center;

  .welcome-message {
    margin-bottom: var(--spacing-xl);

    .ai-avatar-large {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--theme-color, #3b82f6), var(--theme-light, #60a5fa));
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      margin: 0 auto var(--spacing-md);
      box-shadow: 0 var(--spacing-sm) var(--spacing-xl) var(--shadow-light);
    }

    .welcome-title {
      font-size: 2var(--spacing-xs);
      font-weight: 700;
      color: #1f2937;
      margin-bottom: var(--spacing-sm);
    }

    .welcome-subtitle {
      font-size: 1var(--spacing-xs);
      color: #6b7280;
      line-height: 1.6;
      max-width: 280px;
      margin: 0 auto;
    }
  }

  .quick-questions {
    .quick-title {
      font-size: var(--spacing-md);
      font-weight: 600;
      color: #374151;
      margin-bottom: var(--spacing-md);
    }

    .question-grid {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      max-width: 320px;
      margin: 0 auto;

      .quick-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: 12px var(--spacing-md);
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 1var(--spacing-xs);
        color: #374151;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;

        &:hover {
          border-color: var(--theme-color, #3b82f6);
          background: #f8fafc;
        }

        &:active {
          transform: scale(0.98);
        }

        .question-icon {
          font-size: var(--spacing-md);
        }

        .question-text {
          flex: 1;
          font-weight: 500;
        }
      }
    }
  }
}

// 消息样式
.message-wrapper {
  margin-bottom: var(--spacing-md);

  .message {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-start;

    .message-avatar {
      width: var(--spacing-xl);
      height: var(--spacing-xl);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1var(--spacing-sm);
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
      max-width: calc(100% - 4var(--spacing-sm));

      .message-bubble {
        padding: 12px var(--spacing-md);
        border-radius: var(--spacing-md);
        font-size: 1var(--spacing-xs);
        line-height: 1.5;
        word-wrap: break-word;
      }

      .message-time {
        font-size: 1var(--border-width-base);
        color: #9ca3af;
        margin-top: var(--spacing-xs);
        text-align: right;
      }
    }
  }

  // 用户消息样式
  &.user-message {
    .message {
      flex-direction: row-reverse;

      .message-avatar {
        background: var(--theme-color, #3b82f6);
        color: white;
      }

      .message-content {
        .message-bubble {
          background: var(--theme-color, #3b82f6);
          color: white;
          margin-left: 4var(--spacing-sm);
        }

        .message-time {
          text-align: left;
        }
      }
    }
  }

  // AI消息样式
  &.ai-message {
    .message-avatar {
      background: #f3f4f6;
    }

    .message-content {
      .message-bubble {
        background: white;
        border: var(--border-width-base) solid #e5e7eb;
        color: #374151;
      }
    }
  }
}

// 思考动画
.thinking-animation {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .thinking-dots {
    display: flex;
    gap: var(--spacing-xs);

    span {
      width: 6px;
      height: 6px;
      background: #9ca3af;
      border-radius: var(--radius-full);
      animation: thinking 1.4s ease-in-out infinite both;

      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
      &:nth-child(3) { animation-delay: 0s; }
    }
  }

  .thinking-text {
    font-size: 12px;
    color: #9ca3af;
  }
}

@keyframes thinking {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 工具结果区域
.tool-results {
  margin-top: 12px;

  .result-component {
    margin-bottom: var(--spacing-sm);
  }
}

// 输入区域
.chat-input-section {
  background: white;
  border-top: var(--border-width-base) solid #e5e7eb;
  padding: var(--spacing-md);

  .input-container {
    .input-wrapper {
      display: flex;
      gap: var(--spacing-sm);
      align-items: flex-end;
      background: #fff;
      border: var(--border-width-base) solid #e5e7eb;
      border-radius: 1var(--spacing-sm);
      padding: var(--spacing-sm) 10px;
      margin-bottom: var(--spacing-sm);
      box-shadow: 0 var(--spacing-sm) 2var(--spacing-xs) rgba(15,23,42,.06), 0 2px 6px rgba(15,23,42,.06);

      .message-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        resize: none;
        font-size: 1var(--spacing-xs);
        line-height: 1.5;
        padding: var(--spacing-sm) 12px;
        max-height: 120px;
        min-height: 20px;

        &::placeholder {
          color: #9ca3af;
        }
      }

      .send-button {
        width: 40px;
        height: 40px;
        border: none;
        background: #e5e7eb;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1var(--spacing-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;

        &.active {
          background: var(--theme-color, #3b82f6);
          color: white;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }
      }
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);

      .action-btn {
        width: 36px;
        height: 36px;
        border: none;
        background: #f3f4f6;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--spacing-md);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #e5e7eb;
        }
      }
    }
  }
}

// 错误提示
.error-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  .error-content {
    background: #fef2f2;
    border: var(--border-width-base) solid #fecaca;
    color: #dc2626;
    padding: 12px var(--spacing-md);
    border-radius: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    box-shadow: 0 var(--spacing-xs) 12px var(--shadow-light);

    .error-icon {
      font-size: var(--spacing-md);
    }

    .error-text {
      font-size: 1var(--spacing-xs);
      flex: 1;
    }

    .error-close {
      background: none;
      border: none;
      color: #dc2626;
      cursor: pointer;
      font-size: var(--spacing-md);
      padding: 0;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 设计稿样式轻量移植（局部） */
.top-status{display:flex;justify-content:space-between;align-items:center;padding:var(--spacing-sm) 12px;color:#fff}
.top-status .dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#fff;margin-right:6px;animation:pulse 2s infinite}
.gradient-bg{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);animation:gradientShift 8s ease-in-out infinite;background-size:200% 200%}

/* 现代样式补充：模式卡 + 数据看板 + 顶部“我的” */
.my-entry{margin-left:auto;color:var(--accent-enrollment-hover);background:#eff6ff;border:var(--border-width-base) solid #bfdbfe;padding:var(--spacing-xs) 10px;border-radius:999px;font-size:12px;cursor:pointer}
.my-entry:active{transform:scale(.98)}

.mode-card{display:flex;justify-content:space-between;align-items:center;margin:12px;background:#fff;border:var(--border-width-base) solid #eef2f7;border-radius:1var(--spacing-xs);padding:12px 1var(--spacing-xs);box-shadow:0 2px 6px rgba(0,0,0,.04)}
.mode-left{display:flex;gap:10px;align-items:center}
.mode-avatar{width:36px;height:36px;border-radius:12px;background:#eef2ff;display:flex;align-items:center;justify-content:center;font-size:1var(--spacing-sm)}
.mode-title{font-weight:700;color:var(--text-primary-dark)}
.mode-sub{color:var(--text-muted-dark);font-size:12px}
.mode-action{color:var(--text-disabled-dark)}

.stats-board{margin:12px}
.stats-title-wrap{display:flex;align-items:center;justify-content:space-between;margin:6px 0 var(--spacing-sm)}

/* 彻底移除数据看板按钮的所有边框和轮廓 */
.stats-title{
  display:inline-flex!important;
  gap:6px!important;
  align-items:center!important;
  color:var(--text-regular-dark)!important;
  font-weight:600!important;
  font-size:13px!important;
  background:transparent!important;
  border:0!important;
  border-width:0!important;
  border-style:none!important;
  border-color:transparent!important;
  padding:0!important;
  margin:0!important;
  border-radius:var(--spacing-sm)!important;
  outline:none!important;
  outline-width:0!important;
  outline-style:none!important;
  outline-color:transparent!important;
  -webkit-appearance:none!important;
  appearance:none!important;
  box-shadow:none!important;
  -webkit-tap-highlight-color:transparent!important;
  cursor:pointer!important;
  forced-color-adjust:none!important;
  -ms-high-contrast-adjust:none!important;
  border-image:none!important;
  -webkit-focus-ring-color:transparent!important;
}

button.stats-title,
div.stats-title,
[role="button"].stats-title{
  background:transparent!important;
  border:0!important;
  border-width:0!important;
  border-style:none!important;
  border-color:transparent!important;
  outline:none!important;
  outline-width:0!important;
  outline-style:none!important;
  outline-color:transparent!important;
  box-shadow:none!important;
}

.stats-title:hover,
.stats-title:focus,
.stats-title:active,
.stats-title:focus-visible,
.stats-title:focus-within{
  background:transparent!important;
  border:0!important;
  border-width:0!important;
  border-style:none!important;
  border-color:transparent!important;
  outline:none!important;
  outline-width:0!important;
  outline-style:none!important;
  outline-color:transparent!important;
  box-shadow:none!important;
}

.stats-title::-moz-focus-inner{
  border:0!important;
  border-width:0!important;
  border-style:none!important;
  outline:none!important;
}

/* 高对比度模式强制覆盖 */
@media (forced-colors: active){
  .stats-title{
    border:0!important;
    border-width:0!important;
    border-style:none!important;
    border-color:transparent!important;
    outline:0!important;
    outline-width:0!important;
    outline-style:none!important;
    outline-color:transparent!important;
    box-shadow:none!important;
    background:transparent!important;
    forced-color-adjust:none!important;
  }
}

/* Windows高对比度模式 */
@media (-ms-high-contrast: active){
  .stats-title{
    border:0!important;
    outline:0!important;
    box-shadow:none!important;
    -ms-high-contrast-adjust:none!important;
  }
}


.expand{color:var(--text-disabled-dark);font-size:1var(--spacing-xs)}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat-card{border:none!important;border-radius:1var(--spacing-xs);padding:12px;color:#fff;box-shadow:0 var(--spacing-xs) 10px rgba(0,0,0,.06)}
.stat-card.primary{background:linear-gradient(135deg,#3b82f6,var(--accent-enrollment))}

/* 细节补齐，严格对齐 demo 的原子样式命名 */
.ai-gradient{background:linear-gradient(135deg,#ff9a9e 0%,#fecfef 50%,#fecfef 100%);animation:aiPulse 3s ease-in-out infinite}
@keyframes aiPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,154,158,.4)}50%{transform:scale(1.05);box-shadow:0 0 0 var(--spacing-sm) rgba(255,154,158,0)}}
.ai-shadow{box-shadow:0 10px 1var(--spacing-sm) rgba(255,154,158,.32)}

.bounce-in{animation:bounceIn .6s ease-out}
@keyframes bounceIn{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.05)}70%{transform:scale(.9)}100%{transform:scale(1);opacity:1}}

.pulse-dot{width:6px;height:6px;background:#fff;border-radius:50%;animation:pulse 2s infinite}

.shadow-strong{box-shadow:0 var(--spacing-md) var(--spacing-xl) -12px rgba(15,23,42,.25),0 6px 12px -6px rgba(15,23,42,.1)}
.shadow-medium{box-shadow:0 10px 20px -10px rgba(15,23,42,.12),0 var(--spacing-xs) var(--spacing-sm) -6px rgba(15,23,42,.08)}
.shadow-soft{box-shadow:0 6px 12px -var(--spacing-sm) rgba(15,23,42,.08),0 2px 6px -6px rgba(15,23,42,.06)}

/* 面包屑 hover 与过渡 */
.breadcrumb .item{transition:all .3s ease}
.breadcrumb .item:hover{color:#3b82f6;transform:translateY(-var(--border-width-base))}

/* 功能按钮悬停动画与浮动 */
.feature-btn{transition:all .3s cubic-bezier(.4,0,.2,1)}
.feature-btn:hover{transform:translateY(-2px) scale(1.02);filter:brightness(1.05)}
.feature-btn .i{animation:floating 3s ease-in-out infinite}
@keyframes floating{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

/* 预览数据卡片 */
.data-card{background:#fff;border:var(--border-width-base) solid #e5e7eb;border-radius:12px;padding:10px;margin-top:6px;animation:dataCardPop .4s ease-out}
@keyframes dataCardPop{0%{transform:scale(.92) rotateY(60deg);opacity:0}100%{transform:scale(1) rotateY(0);opacity:1}}
.data-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.data-item .label{color:var(--text-muted-dark);font-size:12px}
.data-item .value{font-weight:800}
.data-item .value.green{color:#16a34a}
.data-item .value.orange{color:#f59e0b}
.data-item .value.blue{color:var(--accent-enrollment-hover)}
.data-item .value.purple{color:#7c3aed}

.stat-card.green{background:linear-gradient(135deg,#10b981,#34d399)}
.stat-title{font-size:12px;opacity:.9}
.stat-value{font-size:22px;font-weight:800;margin:2px 0}

/* Ripple effect */
.ripple-effect{position:relative;overflow:hidden}
.ripple-effect:active{transform:scale(.98)}
.ripple-effect::after{content:"";position:absolute;inset:auto;left:50%;top:50%;width:0;height:0;background:rgba(59,130,246,.25);border-radius:999px;transform:translate(-50%,-50%);opacity:0;pointer-events:none}
.ripple-effect:active::after{animation:ripple .6s ease-out}
@keyframes ripple{0%{width:0;height:0;opacity:.35}100%{width:240px;height:240px;opacity:0}}

/* glass-effect 统一 */
.glass-effect{backdrop-filter:blur(20px);background:rgba(255,255,255,.8);border:var(--border-width-base) solid rgba(255,255,255,.2)}

/* 彩色阴影 hover 阶梯 */
.shadow-hover{transition:box-shadow .25s ease,transform .2s ease}
.shadow-hover:hover{transform:translateY(-2px)}
.shadow-colored-blue:hover{box-shadow:0 10px 25px rgba(59,130,246,.25)}
.shadow-colored-purple:hover{box-shadow:0 10px 25px rgba(109,40,217,.25)}
.shadow-colored-green:hover{box-shadow:0 10px 25px rgba(16,185,129,.25)}

.stat-sub{font-size:12px;opacity:.9}

/* 欢迎区更贴近现代稿 */
.welcome-section{padding:2var(--spacing-xs) 0}
.welcome-section .ai-avatar-large{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#e0f2fe,#fef3c7);box-shadow:0 6px var(--spacing-md) rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:var(--spacing-xl)}
.welcome-title{font-size:20px;font-weight:800;color:var(--text-primary-dark);margin:var(--spacing-sm) 0}
.welcome-subtitle{color:var(--text-regular-dark);line-height:1.6}
.quick-title{font-size:1var(--spacing-xs);color:var(--bg-hover-dark);margin-bottom:var(--spacing-sm)}
.question-grid .quick-btn{border-radius:12px;border:var(--border-width-base) solid var(--border-light-dark)}

@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.breadcrumb{background:#fff;border-bottom:var(--border-width-base) solid #f1f5f9;padding:12px var(--spacing-md);color:var(--text-regular-dark);font-size:13px;display:flex;gap:var(--spacing-sm);align-items:center}
.breadcrumb .item{position:relative}
.breadcrumb .item:not(:last-child)::after{content:"›";margin:0 var(--spacing-sm);color:var(--text-disabled-dark)}
.breadcrumb .item.active{color:var(--accent-enrollment-hover);font-weight:600}
.slide-in-right{animation:slideInRight .4s ease-out}
@keyframes slideInRight{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px var(--spacing-md);background:#fff}
.feature-btn{padding:10px;border-radius:12px;border:var(--border-width-base) solid #e5e7eb;background:var(--bg-primary-light);display:flex;flex-direction:column;align-items:center;gap:var(--spacing-xs);transition:transform .2s ease}
.feature-btn:active{transform:scale(.98)}
.feature-btn .i{font-size:1var(--spacing-sm)}
.feature-btn .t{font-size:12px;font-weight:600}
.feature-btn.blue{background:#eff6ff;border-color:#dbeafe;color:#1e40af}
.feature-btn.purple{background:#f5f3ff;border-color:#e9d5ff;color:#6d28d9}
.feature-btn.green{background:#ecfdf5;border-color:#d1fae5;color:#065f46}
.page-load{animation:pageLoad .6s ease-out}
@keyframes pageLoad{0%{transform:translateY(var(--spacing-md));opacity:0}100%{transform:translateY(0);opacity:1}}

/* AI头像与消息气泡的设计风格增强 */
.message.ai-msg .message-avatar{background:linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%);color:#fff;box-shadow:0 var(--spacing-xs) 12px rgba(255,154,158,.3),0 2px 6px rgba(255,154,158,.2)}
.message.ai-msg .message-content .message-bubble{box-shadow:0 var(--spacing-xs) var(--spacing-sm) rgba(0,0,0,0.06)}

/* 自定义滚动条（仅本组件） */
.chat-messages::-webkit-scrollbar{width:6px}
.chat-messages::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:var(--spacing-xs)}
.chat-messages::-webkit-scrollbar-track{background:transparent}


// 响应式适配
@media (max-width: 480px) {
  .role-header {
    padding: 12px;

    .role-info .role-avatar {
      width: 40px;
      height: 40px;

      .role-emoji {
        font-size: 20px;
      }
    }
  }

  .chat-messages {
    padding: 0 12px;
  }

  .welcome-section {
    padding: 2var(--spacing-xs) 0;

    .welcome-message .ai-avatar-large {
      width: 60px;
      height: 60px;
      font-size: 30px;
    }
  }

  .chat-input-section {
    padding: 12px;
  }
}

/* 现代化移动端AI聊天页面样式 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* 顶部状态栏 */
.top-status {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.status-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: var(--spacing-xs);
  height: var(--spacing-xs);
  background: white;
  border-radius: var(--radius-full);
  animation: pulse 2s infinite;
}

.status-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.signal-icon, .battery-icon {
  font-size: 12px;
  opacity: 0.9;
}

.time {
  font-weight: 600;
}

/* 面包屑导航 */
.breadcrumb {
  background: white;
  padding: 12px var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  color: #6b7280;
  border-bottom: var(--border-width-base) solid #f3f4f6;
  box-shadow: 0 var(--border-width-base) 3px rgba(0, 0, 0, 0.05);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: color 0.2s;
}

.breadcrumb-item.active {
  color: #3b82f6;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #9ca3af;
  font-weight: 500;
}

.home-icon {
  font-size: 1var(--spacing-xs);
}

/* 用户角色模式卡片 */
.mode-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  margin: 12px var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 var(--spacing-xs) 12px rgba(0, 0, 0, 0.08);
  border: var(--border-width-base) solid var(--glass-bg-heavy);
}

.mode-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) 12px var(--accent-enrollment-heavy);
  animation: breathe 3s ease-in-out infinite;
}

.mode-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mode-title {
  font-size: var(--spacing-md);
  font-weight: 600;
  color: #1f2937;
}

.mode-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.mode-action {
  padding: var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--spacing-sm);
  transition: background 0.2s;
}

.mode-action:hover {
  background: rgba(255, 255, 255, 0.5);
}

.dropdown-icon {
  font-size: var(--spacing-md);
  color: #6b7280;
}

/* AI功能模块 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: var(--spacing-md);
  background: white;
}

.feature-btn {
  padding: var(--spacing-md) 12px;
  border-radius: var(--spacing-md);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px var(--spacing-sm) rgba(0, 0, 0, 0.06);
}

.feature-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 var(--spacing-sm) 2var(--spacing-xs) rgba(0, 0, 0, 0.12);
}

.feature-btn:active {
  transform: scale(0.95);
}

.feature-btn.blue {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: var(--border-width-base) solid #93c5fd;
}

.feature-btn.purple {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border: var(--border-width-base) solid #c4b5fd;
}

.feature-btn.green {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: var(--border-width-base) solid #a7f3d0;
}

.feature-icon {
  font-size: 2var(--spacing-xs);
  animation: float 3s ease-in-out infinite;
}

.feature-text {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

/* 数据看板 */
.stats-board {
  background: white;
  border-bottom: var(--border-width-base) solid #f3f4f6;
}

.stats-header {
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: #f9fafb;
  transition: background 0.2s;
}

.stats-header:hover {
  background: #f3f4f6;
}

.stats-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  font-weight: 600;
  color: #374151;
}

.stats-icon {
  font-size: var(--spacing-md);
}

.expand-icon {
  font-size: var(--spacing-md);
  color: #6b7280;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.stats-content {
  padding: var(--spacing-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  padding: var(--spacing-md);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 var(--spacing-xs) 12px rgba(0, 0, 0, 0.15);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 var(--spacing-sm) 2var(--spacing-xs) var(--shadow-medium);
}

.stat-card.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-title {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 2var(--spacing-xs);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  opacity: 0.8;
}

.trend-icon {
  font-size: 12px;
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  background: white;
}

.welcome-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: var(--spacing-md);
  animation: slideIn 0.5s ease-out;
}

.message.user-msg {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--spacing-md);
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
  box-shadow: 0 var(--spacing-xs) 12px rgba(255, 154, 158, 0.3);
  animation: breathe 3s ease-in-out infinite;
}

.user-avatar {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 var(--spacing-xs) 12px var(--accent-enrollment-heavy);
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.message-bubble {
  padding: 12px var(--spacing-md);
  border-radius: 1var(--spacing-sm);
  max-width: 280px;
  word-wrap: break-word;
  box-shadow: 0 2px var(--spacing-sm) rgba(0, 0, 0, 0.08);
}

.ai-bubble {
  background: #f3f4f6;
  color: #374151;
  border-bottom-left-radius: 6px;
}

.user-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-bottom-right-radius: 6px;
  margin-left: auto;
}

.sample-msg {
  cursor: pointer;
  transition: opacity 0.2s;
}

.sample-msg:hover {
  opacity: 0.8;
}

.message-time {
  font-size: 1var(--border-width-base);
  color: #9ca3af;
  margin-left: var(--spacing-xs);
}

.message-time.typing {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.ai-text {
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
}

.ai-suggestion {
  font-size: 13px;
  color: #6b7280;
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: var(--border-width-base) solid #e5e7eb;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin: 12px 0;
}

.data-item {
  background: white;
  padding: var(--spacing-sm) 12px;
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid #e5e7eb;
}

.data-label {
  font-size: 1var(--border-width-base);
  color: #6b7280;
  margin-bottom: 2px;
}

.data-value {
  font-size: 1var(--spacing-xs);
  font-weight: 600;
}

.data-value.blue { color: #3b82f6; }
.data-value.orange { color: #f59e0b; }
.data-value.green { color: #10b981; }
.data-value.purple { color: #8b5cf6; }

.typing-dots {
  display: flex;
  gap: 2px;
}

.typing-dots span {
  width: var(--spacing-xs);
  height: var(--spacing-xs);
  background: #9ca3af;
  border-radius: var(--radius-full);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

/* 底部输入区域 */
.input-section {
  background: white;
  border-top: var(--border-width-base) solid #f3f4f6;
  padding: var(--spacing-md);
  box-shadow: 0 -2px var(--spacing-sm) rgba(0, 0, 0, 0.05);
}

.input-toolbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 12px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn.voice {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.tool-btn.camera {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
}

.tool-btn.attachment {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.tool-btn.settings {
  background: #f3f4f6;
}

.tool-btn:hover {
  transform: scale(1.05);
}

.tool-btn:active {
  transform: scale(0.95);
}

.spacer {
  flex: 1;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 12px;
}

.input-container {
  flex: 1;
  position: relative;
}

.message-input {
  width: 100%;
  padding: 12px var(--spacing-md);
  border: 2px solid #e5e7eb;
  border-radius: 2var(--spacing-xs);
  font-size: 1var(--spacing-xs);
  outline: none;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.message-input:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px var(--accent-enrollment-light);
}

.send-btn {
  width: 4var(--spacing-xs);
  height: 4var(--spacing-xs);
  border: none;
  border-radius: var(--radius-full);
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 var(--spacing-xs) 12px var(--accent-enrollment-heavy);
}

.send-btn:hover.active {
  transform: scale(1.05);
}

.quick-actions {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.quick-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: var(--border-width-base) solid #e5e7eb;
  border-radius: var(--spacing-md);
  font-size: 12px;
  color: #374151;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  background: #e5e7eb;
  transform: translateY(-var(--border-width-base));
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 滚动条样式 */
.chat-area::-webkit-scrollbar {
  width: var(--spacing-xs);
}

.chat-area::-webkit-scrollbar-track {
  background: transparent;
}

.chat-area::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.quick-actions::-webkit-scrollbar {
  height: 2px;
}

.quick-actions::-webkit-scrollbar-track {
  background: transparent;
}

.quick-actions::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: var(--border-width-base);
}

/* 阴影效果 */
.shadow-soft {
  box-shadow: 0 2px var(--spacing-sm) rgba(0, 0, 0, 0.06);
}

.shadow-medium {
  box-shadow: 0 var(--spacing-xs) 12px var(--shadow-light);
}

.shadow-strong {
  box-shadow: 0 var(--spacing-sm) 2var(--spacing-xs) rgba(0, 0, 0, 0.15);
}

.shadow-hover {
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shadow-hover:hover {
  box-shadow: 0 12px var(--spacing-xl) rgba(0, 0, 0, 0.15), 0 6px var(--spacing-md) var(--shadow-medium);
  transform: translateY(-2px);
}

.shadow-colored-blue {
  box-shadow: 0 var(--spacing-xs) 1var(--spacing-xs) var(--accent-enrollment-light), 0 2px 6px var(--accent-enrollment-medium);
}

.shadow-colored-purple {
  box-shadow: 0 var(--spacing-xs) 1var(--spacing-xs) var(--accent-marketing-light), 0 2px 6px var(--accent-marketing-medium);
}

.shadow-colored-emerald {
  box-shadow: 0 var(--spacing-xs) 1var(--spacing-xs) rgba(16, 185, 129, 0.15), 0 2px 6px rgba(16, 185, 129, 0.25);
}

.shadow-inset {
  box-shadow: inset 0 2px var(--spacing-xs) rgba(0, 0, 0, 0.06);
}

.shadow-layered {
  box-shadow:
    0 var(--border-width-base) 3px rgba(0, 0, 0, 0.12),
    0 var(--border-width-base) 2px rgba(0, 0, 0, 0.24),
    0 var(--spacing-xs) var(--spacing-sm) rgba(59, 130, 246, 0.08);
}

.data-shadow {
  box-shadow:
    0 var(--spacing-xs) 12px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.12),
    inset 0 var(--border-width-base) 0 var(--glass-bg-light);
}

.ai-shadow {
  box-shadow:
    0 var(--spacing-xs) 12px rgba(255, 154, 158, 0.3),
    0 2px 6px rgba(255, 154, 158, 0.2),
    0 0 0 var(--border-width-base) rgba(255, 154, 158, 0.1);
  animation: aiShadowPulse 3s ease-in-out infinite;
}

@keyframes aiShadowPulse {
  0%, 100% {
    box-shadow:
      0 var(--spacing-xs) 12px rgba(255, 154, 158, 0.3),
      0 2px 6px rgba(255, 154, 158, 0.2),
      0 0 0 var(--border-width-base) rgba(255, 154, 158, 0.1);
  }
  50% {
    box-shadow:
      0 6px 20px rgba(255, 154, 158, 0.4),
      0 var(--spacing-xs) 12px rgba(255, 154, 158, 0.3),
      0 0 0 2px rgba(255, 154, 158, 0.2);
  }
}

/* 面包屑样式 */
.breadcrumb-item {
  position: relative;
  transition: all 0.3s ease;
}

.breadcrumb-item:hover {
  color: #3b82f6;
  transform: translateY(-var(--border-width-base));
}

.breadcrumb-item:not(:last-child)::after {
  content: '›';
  margin: 0 var(--spacing-sm);
  color: #94a3b8;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 悬停效果 */
.hover-scale {
  transition: all 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-var(--spacing-xs));
  box-shadow: 0 20px 25px -5px var(--shadow-light), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 输入焦点效果 */
.input-focus:focus {
  transform: translateY(-var(--border-width-base));
  box-shadow: 0 var(--spacing-sm) 2var(--spacing-xs) var(--accent-enrollment-light);
}

/* 快捷按钮 */
.quick-btn {
  transition: all 0.2s ease;
}

.quick-btn:hover {
  transform: translateY(-var(--border-width-base));
  box-shadow: 0 var(--spacing-xs) 12px var(--shadow-light);
}

.quick-btn:active {
  transform: translateY(0);
}
</style>