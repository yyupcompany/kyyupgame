<template>
  <div class="page-container ai-assistant-container">
    <app-card>
      <template #header>
        <app-card-header>
          <div class="app-card-title">
            <UnifiedIcon name="robot" class="title-icon" />
            AI智能助手
          </div>
          <div class="card-actions">
            <el-button type="primary" size="small" @click="clearChatHistory">
              <UnifiedIcon name="Delete" />
              清空对话
            </el-button>
            <el-button type="success" size="small" @click="showSettings = true">
              <UnifiedIcon name="Setting" />
              设置
            </el-button>
          </div>
        </app-card-header>
      </template>

      <app-card-content>
        <!-- AI助手特性介绍 -->
        <div class="ai-features">
          <div class="feature-grid">
            <div class="feature-card" @click="startFeatureChat('智能问答')">
              <div class="feature-icon">
                <UnifiedIcon name="ChatLineRound" />
              </div>
              <div class="feature-content">
                <h4>智能问答</h4>
                <p>教育咨询、育儿建议、心理辅导</p>
              </div>
            </div>
            <div class="feature-card" @click="startFeatureChat('成长分析')">
              <div class="feature-icon">
                <UnifiedIcon name="TrendCharts" />
              </div>
              <div class="feature-content">
                <h4>成长分析</h4>
                <p>智能分析孩子的成长数据</p>
              </div>
            </div>
            <div class="feature-card" @click="startFeatureChat('学习建议')">
              <div class="feature-icon">
                <UnifiedIcon name="Reading" />
              </div>
              <div class="feature-content">
                <h4>学习建议</h4>
                <p>个性化学习方案推荐</p>
              </div>
            </div>
            <div class="feature-card" @click="startFeatureChat('活动推荐')">
              <div class="feature-icon">
                <UnifiedIcon name="Calendar" />
              </div>
              <div class="feature-content">
                <h4>活动推荐</h4>
                <p>亲子活动、教育游戏推荐</p>
              </div>
            </div>
            <div class="feature-card" @click="startFeatureChat('健康管理')">
              <div class="feature-icon">
                <UnifiedIcon name="Heart" />
              </div>
              <div class="feature-content">
                <h4>健康管理</h4>
                <p>营养建议、健康提醒</p>
              </div>
            </div>
            <div class="feature-card" @click="startFeatureChat('情感支持')">
              <div class="feature-icon">
                <UnifiedIcon name="Smile" />
              </div>
              <div class="feature-content">
                <h4>情感支持</h4>
                <p>家庭关系、亲子沟通建议</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 对话区域 -->
        <div class="chat-container">
          <div class="chat-messages" ref="chatMessagesRef">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-item"
              :class="{ 'message-user': message.type === 'user', 'message-ai': message.type === 'ai' }"
            >
              <div class="message-avatar">
                <el-avatar v-if="message.type === 'user'" :size="40" :src="userAvatar">
                  <UnifiedIcon name="User" />
                </el-avatar>
                <div v-else class="ai-avatar">
                  <UnifiedIcon name="robot" class="ai-icon" />
                </div>
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <div v-if="message.type === 'text'" class="text-content">
                    {{ message.content }}
                  </div>
                  <div v-else-if="message.type === 'rich'" class="rich-content">
                    <div v-html="message.content"></div>
                  </div>
                  <div v-else-if="message.type === 'suggestions'" class="suggestions-content">
                    <div class="suggestions-list">
                      <div
                        v-for="suggestion in message.suggestions"
                        :key="suggestion.id"
                        class="suggestion-item"
                        @click="applySuggestion(suggestion)"
                      >
                        <div class="suggestion-icon">
                          <UnifiedIcon :name="suggestion.icon" />
                        </div>
                        <div class="suggestion-text">
                          <h5>{{ suggestion.title }}</h5>
                          <p>{{ suggestion.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>

            <!-- AI思考状态 -->
            <div v-if="isThinking" class="thinking-indicator">
              <div class="thinking-avatar">
                <div class="ai-avatar">
                  <UnifiedIcon name="robot" class="ai-icon" />
                </div>
              </div>
              <div class="thinking-content">
                <div class="thinking-bubble">
                  <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div class="thinking-text">{{ thinkingText }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速回复建议 -->
          <div v-if="quickReplies.length > 0" class="quick-replies">
            <div
              v-for="reply in quickReplies"
              :key="reply.id"
              class="quick-reply-item"
              @click="sendQuickReply(reply)"
            >
              {{ reply.text }}
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="chat-input">
            <div class="input-container">
              <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="3"
                placeholder="输入您的问题或需求..."
                @keydown.ctrl.enter="sendMessage"
                :disabled="isThinking"
              />
              <div class="input-actions">
                <el-upload
                  :before-upload="handleFileUpload"
                  :show-file-list="false"
                  accept="image/*,.pdf,.doc,.docx"
                >
                  <el-button size="small" type="text" :disabled="isThinking">
                    <UnifiedIcon name="Paperclip" />
                  </el-button>
                </el-upload>
                <el-button
                  type="primary"
                  size="small"
                  @click="sendMessage"
                  :loading="isThinking"
                  :disabled="!inputMessage.trim()"
                >
                  <UnifiedIcon name="Position" />
                  发送
                </el-button>
              </div>
            </div>
            <div class="input-tips">
              <span>按 Ctrl + Enter 快速发送</span>
            </div>
          </div>
        </div>
      </app-card-content>
    </app-card>

    <!-- AI设置弹窗 -->
    <el-dialog
      v-model="showSettings"
      title="AI助手设置"
      width="600px"
      :before-close="handleSettingsClose"
    >
      <div class="settings-content">
        <div class="setting-section">
          <h4>对话偏好</h4>
          <el-form :model="aiSettings" label-width="120px">
            <el-form-item label="响应风格">
              <el-radio-group v-model="aiSettings.responseStyle">
                <el-radio label="friendly">友好亲切</el-radio>
                <el-radio label="professional">专业严谨</el-radio>
                <el-radio label="concise">简洁明了</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="语言偏好">
              <el-select v-model="aiSettings.language" placeholder="选择语言">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="繁体中文" value="zh-TW" />
                <el-option label="English" value="en" />
              </el-select>
            </el-form-item>
            <el-form-item label="专业领域">
              <el-checkbox-group v-model="aiSettings.expertise">
                <el-checkbox label="education">教育咨询</el-checkbox>
                <el-checkbox label="psychology">心理辅导</el-checkbox>
                <el-checkbox label="health">健康管理</el-checkbox>
                <el-checkbox label="nutrition">营养指导</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>

        <div class="setting-section">
          <h4>智能功能</h4>
          <el-form :model="aiSettings" label-width="120px">
            <el-form-item label="记忆功能">
              <el-switch
                v-model="aiSettings.memoryEnabled"
                active-text="启用"
                inactive-text="禁用"
              />
              <div class="setting-tip">让AI记住之前的对话内容</div>
            </el-form-item>
            <el-form-item label=" proactive建议">
              <el-switch
                v-model="aiSettings.proactiveSuggestions"
                active-text="启用"
                inactive-text="禁用"
              />
              <div class="setting-tip">主动提供相关建议</div>
            </el-form-item>
            <el-form-item label="情感分析">
              <el-switch
                v-model="aiSettings.emotionAnalysis"
                active-text="启用"
                inactive-text="禁用"
              />
              <div class="setting-tip">分析对话中的情感倾向</div>
            </el-form-item>
          </el-form>
        </div>

        <div class="setting-section">
          <h4>隐私设置</h4>
          <el-form :model="aiSettings" label-width="120px">
            <el-form-item label="数据保存">
              <el-radio-group v-model="aiSettings.dataRetention">
                <el-radio label="permanent">永久保存</el-radio>
                <el-radio label="30days">30天</el-radio>
                <el-radio label="7days">7天</el-radio>
                <el-radio label="session">仅本次会话</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="匿名模式">
              <el-switch
                v-model="aiSettings.anonymousMode"
                active-text="启用"
                inactive-text="禁用"
              />
              <div class="setting-tip">不包含个人身份信息</div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Position, ChatLineRound, TrendCharts, Reading, Calendar, Heart, Smile, Paperclip, Delete, Setting, User } from '@element-plus/icons-vue'
import UnifiedIcon from '@/components/common/UnifiedIcon.vue'
import { useUserStore } from '@/stores/user'
import { CallingLogger, type LogContext } from '@/utils/CallingLogger'

interface Message {
  id: string
  type: 'user' | 'ai' | 'text' | 'rich' | 'suggestions'
  content: string
  timestamp: Date
  suggestions?: Array<{
    id: string
    title: string
    description: string
    icon: string
    action: string
  }>
}

interface QuickReply {
  id: string
  text: string
  category: string
}

interface AISettings {
  responseStyle: 'friendly' | 'professional' | 'concise'
  language: string
  expertise: string[]
  memoryEnabled: boolean
  proactiveSuggestions: boolean
  emotionAnalysis: boolean
  dataRetention: string
  anonymousMode: boolean
}

const userStore = useUserStore()

// 创建日志上下文
const createLogContext = (operation?: string, additionalContext?: any): LogContext => {
  return CallingLogger.createComponentContext('AIAssistant', {
    operation,
    userId: userStore.userInfo?.id,
    tenantId: userStore.userInfo?.tenantId,
    ...additionalContext
  })
}

// 响应式数据
const chatMessagesRef = ref<HTMLElement>()
const messages = ref<Message[]>([])
const inputMessage = ref('')
const isThinking = ref(false)
const thinkingText = ref('')
const quickReplies = ref<QuickReply[]>([])
const showSettings = ref(false)

// AI设置
const aiSettings = ref<AISettings>({
  responseStyle: 'friendly',
  language: 'zh-CN',
  expertise: ['education', 'psychology'],
  memoryEnabled: true,
  proactiveSuggestions: true,
  emotionAnalysis: true,
  dataRetention: '30days',
  anonymousMode: false
})

// 用户信息
const userAvatar = computed(() => userStore.userInfo?.avatar || '')

// 快速回复选项
const quickReplyOptions: QuickReply[] = [
  { id: '1', text: '我的孩子最近情绪不太好，该怎么办？', category: 'emotion' },
  { id: '2', text: '推荐一些适合5岁孩子的益智游戏', category: 'education' },
  { id: '3', text: '如何培养孩子的阅读习惯？', category: 'reading' },
  { id: '4', text: '孩子挑食怎么办？', category: 'health' },
  { id: '5', text: '怎样处理孩子的分离焦虑？', category: 'psychology' },
  { id: '6', text: '推荐一些亲子互动活动', category: 'activity' }
]

// AI特性功能
const aiFeatures = [
  { key: '智能问答', icon: 'ChatLineRound', description: '教育咨询、育儿建议、心理辅导' },
  { key: '成长分析', icon: 'TrendCharts', description: '智能分析孩子的成长数据' },
  { key: '学习建议', icon: 'Reading', description: '个性化学习方案推荐' },
  { key: '活动推荐', icon: 'Calendar', description: '亲子活动、教育游戏推荐' },
  { key: '健康管理', icon: 'Heart', description: '营养建议、健康提醒' },
  { key: '情感支持', icon: 'Smile', description: '家庭关系、亲子沟通建议' }
]

// 方法
const startFeatureChat = (feature: string) => {
  const context = createLogContext('startFeatureChat', { feature })
  const featurePrompts: Record<string, string> = {
    '智能问答': '我想咨询一些育儿方面的问题',
    '成长分析': '请帮我分析一下孩子的成长情况',
    '学习建议': '请推荐一些适合孩子的学习方法',
    '活动推荐': '请推荐一些亲子活动',
    '健康管理': '请提供一些健康管理建议',
    '情感支持': '我想了解如何更好地与孩子沟通'
  }

  inputMessage.value = featurePrompts[feature] || ''

  CallingLogger.logInfo(context, '启动AI功能对话', { feature, prompt: inputMessage.value })

  sendMessage()
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isThinking.value) return

  const context = createLogContext('sendMessage', { messageLength: inputMessage.value.trim().length })

  const userMessage: Message = {
    id: Date.now().toString(),
    type: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const question = inputMessage.value.trim()
  inputMessage.value = ''

  CallingLogger.logInfo(context, '用户发送消息', { question })

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 模拟AI思考
  isThinking.value = true
  thinkingText.value = '正在分析您的问题...'

  try {
    CallingLogger.logInfo(context, '开始AI响应处理', { question })
    // 模拟AI响应
    await simulateAIResponse(question)
    CallingLogger.logSuccess(context, 'AI响应处理成功', { question })
  } catch (error) {
    CallingLogger.logError(context, 'AI响应失败', error as Error, { question })
    ElMessage.error('AI助手暂时无法响应，请稍后重试')
  } finally {
    isThinking.value = false
    thinkingText.value = ''
  }
}

const simulateAIResponse = async (question: string) => {
  const context = createLogContext('simulateAIResponse', { question })

  try {
    CallingLogger.logInfo(context, '开始模拟AI响应', { question })

    // 模拟思考过程
    const thinkingSteps = [
      '正在分析您的问题...',
      '查找相关知识...',
      '生成个性化建议...',
      '优化回答内容...'
    ]

    for (let i = 0; i < thinkingSteps.length; i++) {
      thinkingText.value = thinkingSteps[i]
      CallingLogger.logDebug(context, `AI思考步骤 ${i + 1}`, { step: thinkingSteps[i] })
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // 生成AI响应
    let aiResponse = generateAIResponse(question)

    const aiMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: aiResponse.content,
      timestamp: new Date(),
      suggestions: aiResponse.suggestions
    }

    messages.value.push(aiMessage)

    CallingLogger.logSuccess(context, 'AI响应生成完成', {
      responseLength: aiResponse.content.length,
      hasSuggestions: !!aiResponse.suggestions
    })

    // 更新快速回复建议
    updateQuickReplies(question)

    // 滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error) {
    CallingLogger.logError(context, '模拟AI响应失败', error as Error, { question })
    throw error
  }
}

const generateAIResponse = (question: string) => {
  const responses: Record<string, any> = {
    '情绪': {
      content: '我理解您对孩子情绪的关心。孩子情绪波动是很正常的，这可能是他们在表达自己的感受和需求。建议您：\n\n1. **耐心倾听**：给孩子足够的时间和空间表达情绪\n2. **共情理解**：帮助孩子识别和命名情绪\n3. **积极引导**：通过游戏、故事等方式帮助孩子理解情绪\n4. **建立安全感**：让孩子知道无论什么情绪都是可以被接受的\n\n您能具体描述一下孩子最近表现出的情绪状况吗？这样我可以给您更有针对性的建议。',
      suggestions: [
        { id: '1', title: '情绪识别游戏', description: '帮助孩子认识不同情绪', icon: 'Smile', action: 'emotion-game' },
        { id: '2', title: '情绪管理技巧', description: '学习情绪调节方法', icon: 'Heart', action: 'emotion-skills' },
        { id: '3', title: '亲子沟通指南', description: '改善与孩子的沟通', icon: 'ChatLineRound', action: 'communication-guide' }
      ]
    },
    '游戏': {
      content: '对于5岁的孩子，推荐以下益智游戏：\n\n**认知发展类：**\n• 拼图游戏（100-200片）\n• 记忆卡片游戏\n• 数字和字母配对游戏\n\n**创意思维类：**\n• 乐高积木搭建\n• 绘画和手工制作\n• 角色扮演游戏\n\n**社交情感类：**\n• 合作类桌面游戏\n• 故事创编游戏\n• 情景模拟游戏\n\n建议每天安排20-30分钟的益智游戏时间，既要有独自思考的安静游戏，也要有互动合作的社交游戏。',
      suggestions: [
        { id: '4', title: '益智游戏清单', description: '按年龄分类的游戏推荐', icon: 'Reading', action: 'game-list' },
        { id: '5', title: '游戏时间规划', description: '合理安排游戏时间', icon: 'Calendar', action: 'game-schedule' }
      ]
    },
    '阅读': {
      content: '培养孩子阅读习惯的有效方法：\n\n**1. 建立阅读环境**\n• 在家中设置舒适的阅读角\n• 准备适合孩子年龄的图书\n• 让孩子自己选择喜欢的书籍\n\n**2. 亲子阅读时光**\n• 每天固定15-30分钟阅读时间\n• 用生动的语调和表情朗读\n• 鼓励孩子参与讲述故事\n\n**3. 多样化阅读体验**\n• 图画书、故事书、科普书等\n• 听故事、看绘本、演故事\n• 参观图书馆、书店等\n\n**4. 正面激励**\n• 表扬孩子的阅读努力\n• 记录阅读成果\n• 分享阅读心得\n\n记住，阅读习惯的培养需要耐心和坚持，关键是让孩子感受到阅读的乐趣。',
      suggestions: [
        { id: '6', title: '推荐书单', description: '5岁儿童必读好书', icon: 'Reading', action: 'book-list' },
        { id: '7', title: '阅读技巧指南', description: '亲子阅读实用技巧', icon: 'ChatLineRound', action: 'reading-tips' }
      ]
    }
  }

  // 查找匹配的响应
  for (const [key, response] of Object.entries(responses)) {
    if (question.includes(key)) {
      return response
    }
  }

  // 默认响应
  return {
    content: '我理解您的需求。作为AI育儿助手，我可以为您提供以下方面的专业建议：\n\n• **教育咨询**：学习发展、兴趣培养\n• **心理辅导**：情绪管理、行为引导\n• **健康管理**：营养搭配、运动锻炼\n• **亲子关系**：沟通技巧、相处之道\n• **成长规划**：阶段性发展目标\n\n请告诉我您的具体需求，我会为您提供个性化的专业建议。',
    suggestions: [
      { id: '8', title: '教育咨询', description: '学习和发展相关建议', icon: 'Reading', action: 'education-consult' },
      { id: '9', title: '心理辅导', description: '情绪和行为问题指导', icon: 'Heart', action: 'psychology-guide' },
      { id: '10', title: '健康管理', description: '营养和健康建议', icon: 'TrendCharts', action: 'health-advice' }
    ]
  }
}

const updateQuickReplies = (question: string) => {
  // 根据问题内容更新快速回复建议
  const filteredReplies = quickReplyOptions.filter(reply =>
    reply.category !== getQuestionCategory(question)
  )

  quickReplies.value = filteredReplies.slice(0, 4)
}

const getQuestionCategory = (question: string): string => {
  if (question.includes('情绪') || question.includes('心情')) return 'emotion'
  if (question.includes('游戏') || question.includes('玩')) return 'education'
  if (question.includes('阅读') || question.includes('书')) return 'reading'
  if (question.includes('吃') || question.includes('食物')) return 'health'
  if (question.includes('焦虑') || question.includes('分离')) return 'psychology'
  if (question.includes('活动') || question.includes('亲子')) return 'activity'
  return 'other'
}

const sendQuickReply = (reply: QuickReply) => {
  inputMessage.value = reply.text
  sendMessage()
}

const applySuggestion = async (suggestion: any) => {
  const context = createLogContext('applySuggestion', { suggestionId: suggestion.id, title: suggestion.title })

  try {
    CallingLogger.logInfo(context, '开始应用AI建议', { suggestion })
    ElMessage.loading('正在处理建议...')

    // 模拟处理建议
    await new Promise(resolve => setTimeout(resolve, 1000))

    const responseMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `正在为您准备"${suggestion.title}"相关内容，请稍候...`,
      timestamp: new Date()
    }

    messages.value.push(responseMessage)

    await nextTick()
    scrollToBottom()

    CallingLogger.logSuccess(context, 'AI建议应用成功', { suggestion })
    ElMessage.success('建议已采纳')
  } catch (error) {
    CallingLogger.logError(context, '应用AI建议失败', error as Error, { suggestion })
    ElMessage.error('处理建议失败')
  }
}

const clearChatHistory = async () => {
  const context = createLogContext('clearChatHistory', { messageCount: messages.value.length })

  try {
    CallingLogger.logInfo(context, '用户请求清空对话记录')

    await ElMessageBox.confirm(
      '确定要清空所有对话记录吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    messages.value = []
    quickReplies.value = quickReplyOptions.slice(0, 4)

    CallingLogger.logSuccess(context, '对话记录清空成功')
    ElMessage.success('对话记录已清空')
  } catch (error) {
    CallingLogger.logInfo(context, '用户取消清空对话记录操作')
    // 用户取消操作
  }
}

const handleFileUpload = (file: File) => {
  const context = createLogContext('handleFileUpload', { fileName: file.name, fileSize: file.size })

  CallingLogger.logInfo(context, '用户上传文件', { fileName: file.name, fileSize: file.size })
  // 处理文件上传
  ElMessage.info(`正在处理文件: ${file.name}`)
  return false // 阻止默认上传行为
}

const handleSettingsClose = () => {
  showSettings.value = false
}

const saveSettings = async () => {
  const context = createLogContext('saveSettings', { settings: aiSettings.value })

  try {
    CallingLogger.logInfo(context, '保存AI设置', { settings: aiSettings.value })

    // 保存设置到本地存储
    localStorage.setItem('ai-settings', JSON.stringify(aiSettings.value))

    showSettings.value = false

    CallingLogger.logSuccess(context, 'AI设置保存成功')
    ElMessage.success('设置已保存')
  } catch (error) {
    CallingLogger.logError(context, '保存AI设置失败', error as Error)
    ElMessage.error('保存设置失败')
  }
}

const loadSettings = () => {
  const context = createLogContext('loadSettings')

  try {
    CallingLogger.logInfo(context, '加载AI设置')

    const saved = localStorage.getItem('ai-settings')
    if (saved) {
      Object.assign(aiSettings.value, JSON.parse(saved))
      CallingLogger.logSuccess(context, 'AI设置加载成功', { hasSavedSettings: true })
    } else {
      CallingLogger.logInfo(context, '未找到保存的AI设置，使用默认设置')
    }
  } catch (error) {
    CallingLogger.logError(context, '加载AI设置失败', error as Error)
  }
}

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化
onMounted(() => {
  const context = createLogContext('onMounted')

  CallingLogger.logInfo(context, 'AI助手页面挂载完成')

  loadSettings()
  quickReplies.value = quickReplyOptions.slice(0, 4)

  // 添加欢迎消息
  const welcomeMessage: Message = {
    id: 'welcome',
    type: 'ai',
    content: '您好！我是您的AI育儿助手。我可以为您提供教育咨询、成长分析、学习建议、活动推荐、健康管理和情感支持等专业服务。请告诉我您需要什么帮助？',
    timestamp: new Date()
  }

  messages.value.push(welcomeMessage)

  CallingLogger.logSuccess(context, 'AI助手初始化完成', { quickRepliesCount: quickReplies.value.length })
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.page-container {

  .ai-features {
    margin-bottom: var(--spacing-xl);

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width-feature), 1fr));
      gap: var(--spacing-lg);

      .feature-card {
        background: var(--bg-card);
        border: var(--border-width-thin) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        cursor: pointer;
        transition: var(--transition-slow);
        box-shadow: var(--shadow-sm);

        &:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-md);
          transform: translateY(var(--transform-hover-lift));
        }

        .feature-icon {
          width: var(--size-icon-xl);
          height: var(--size-icon-xl);
          background: var(--primary-light-bg);
          color: var(--primary-color);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          flex-shrink: 0;
        }

        .feature-content {
          flex: 1;

          h4 {
            font-size: var(--text-lg);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin: 0 0 var(--spacing-xs) 0;
          }

          p {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin: 0;
            line-height: 1.4;
          }
        }
      }
    }
  }

  .chat-container {
    background: var(--bg-card);
    border: var(--border-width-thin) solid var(--border-color);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    height: var(--ai-chat-container-height);

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);

      .message-item {
        display: flex;
        gap: var(--spacing-md);
        max-width: var(--message-max-width);

        &.message-user {
          align-self: flex-end;
          flex-direction: row-reverse;

          .message-bubble {
            background: var(--primary-color);
            color: var(--text-on-primary);
          }
        }

        &.message-ai {
          align-self: flex-start;

          .message-bubble {
            background: var(--bg-tertiary);
            border: var(--border-width-thin) solid var(--border-color);
          }
        }

        .message-avatar {
          flex-shrink: 0;

          .ai-avatar {
            width: var(--ai-avatar-size);
            height: var(--ai-avatar-size);
            background: var(--ai-gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;

            .ai-icon {
              font-size: var(--text-xl);
            }
          }
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);

          .message-bubble {
            border-radius: var(--radius-lg);
            padding: var(--spacing-md);
            word-wrap: break-word;

            .text-content {
              line-height: 1.5;
            }

            .rich-content {
              line-height: 1.5;
            }

            .suggestions-content {
              .suggestions-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);

                .suggestion-item {
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-sm);
                  padding: var(--spacing-sm);
                  background: var(--glass-bg-light);
                  border-radius: var(--radius-md);
                  cursor: pointer;
                  transition: var(--transition-slow);

                  &:hover {
                    background: var(--glass-bg-medium);
                  }

                  .suggestion-icon {
                    width: var(--ai-icon-size);
                    height: var(--ai-icon-size);
                    background: var(--glass-bg-medium);
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-on-primary);
                    flex-shrink: 0;
                  }

                  .suggestion-text {
                    flex: 1;

                    h5 {
                      font-size: var(--text-sm);
                      font-weight: var(--font-medium);
                      color: var(--text-on-primary);
                      margin: 0 0 var(--spacing-xs) 0;
                    }

                    p {
                      font-size: var(--text-xs);
                      color: var(--text-on-primary-secondary);
                      margin: 0;
                      line-height: 1.3;
                    }
                  }
                }
              }
            }
          }

          .message-time {
            font-size: var(--text-xs);
            color: var(--text-tertiary);
            align-self: flex-end;
          }
        }
      }

      .thinking-indicator {
        display: flex;
        gap: var(--spacing-md);
        align-self: flex-start;
        max-width: var(--message-max-width);

        .thinking-content {
          .thinking-bubble {
            background: var(--bg-tertiary);
            border: var(--border-width-thin) solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: var(--spacing-md);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            .thinking-dots {
              display: flex;
              gap: var(--spacing-xs);

              span {
                width: var(--thinking-dot-size);
                height: var(--thinking-dot-size);
                background: var(--primary-color);
                border-radius: 50%;
                animation: thinking-pulse var(--ai-thinking-duration) infinite ease-in-out;

                &:nth-child(1) { animation-delay: -0.32s; }
                &:nth-child(2) { animation-delay: -0.16s; }
                &:nth-child(3) { animation-delay: 0; }
              }
            }

            .thinking-text {
              font-size: var(--text-sm);
              color: var(--text-secondary);
            }
          }
        }
      }
    }

    .quick-replies {
      padding: 0 var(--spacing-lg) var(--spacing-md);
      display: flex;
      gap: var(--spacing-sm);
      overflow-x: auto;
      flex-wrap: wrap;

      .quick-reply-item {
        background: var(--bg-tertiary);
        border: var(--border-width-thin) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--text-sm);
        color: var(--text-primary);
        cursor: pointer;
        transition: var(--transition-slow);
        white-space: nowrap;

        &:hover {
          border-color: var(--primary-color);
          background: var(--primary-light-bg);
          color: var(--primary-color);
        }
      }
    }

    .chat-input {
      padding: var(--spacing-lg);
      border-top: var(--border-width-thin) solid var(--border-color);

      .input-container {
        display: flex;
        gap: var(--spacing-sm);
        align-items: flex-end;

        .el-textarea {
          flex: 1;
        }

        .input-actions {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
        }
      }

      .input-tips {
        margin-top: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--text-tertiary);
        text-align: center;
      }
    }
  }

  .settings-content {
    .setting-section {
      margin-bottom: var(--spacing-xl);

      h4 {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-lg) 0;
        padding-bottom: var(--spacing-sm);
        border-bottom: var(--border-width-thin) solid var(--border-color);
      }

      .setting-tip {
        font-size: var(--text-xs);
        color: var(--text-tertiary);
        margin-top: var(--spacing-xs);
        line-height: 1.3;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
    }
  }
}

/* 动画 */
@keyframes thinking-pulse {
  0%, 80%, 100% {
    transform: scale(var(--scale-small));
    opacity: 0.5;
  }
  40% {
    transform: scale(var(--scale-full));
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-md);

    .ai-features {
      .feature-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }
    }

    .chat-container {
      height: var(--ai-chat-container-height-mobile);

      .message-item {
        max-width: var(--message-max-width-mobile);
      }

      .quick-replies {
        padding: 0 var(--spacing-md) var(--spacing-md);
      }

      .chat-input {
        padding: var(--spacing-md);

        .input-container {
          flex-direction: column;
          align-items: stretch;

          .input-actions {
            justify-content: flex-end;
            margin-top: var(--spacing-sm);
          }
        }
      }
    }
  }
}
</style>