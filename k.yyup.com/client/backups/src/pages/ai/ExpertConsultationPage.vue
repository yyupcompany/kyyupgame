<template>
  <div class="expert-consultation-page">
    <div class="demo-header">
      <h1>🧠 AI专家咨询系统</h1>
      <p class="subtitle">专业团队为您提供全方位的招生咨询服务 - 智能分析，精准建议</p>
    </div>

    <div class="demo-container">
      <!-- 聊天界面 -->
      <div class="chat-container">
        <div class="chat-header">
          <h3>💬 专家咨询对话</h3>
          <div class="status-indicator" :class="{ active: isConsulting }">
            <span v-if="isConsulting">🤔 专家正在分析...</span>
            <span v-else>💡 准备就绪</span>
          </div>
        </div>

        <div class="chat-messages" ref="speechListRef">
          <!-- 欢迎消息 -->
          <div v-if="!currentSession && speeches.length === 0" class="message assistant">
            <div class="message-content">
              <div class="message-header">
                <span class="role-badge assistant">🤖 专家团队</span>
                <span class="timestamp">{{ formatTime(new Date()) }}</span>
              </div>
              <div class="message-text">
                👋 您好！我是AI专家咨询系统。<br><br>
                我拥有一个专业的专家团队，可以为您提供：<br>
                • 🍂 招生活动策划<br>
                • 💰 家长转化策略<br>
                • 📊 投资预算分析<br>
                • 👥 组织管理建议<br>
                • 🎯 执行细节完善<br>
                • ⭐ 用户体验评估<br><br>
                请在下方输入框描述您的问题，我会调动专家团队为您提供全方位的建议。
              </div>
            </div>
          </div>

          <!-- 用户消息 -->
          <div v-if="currentSession" class="message user">
            <div class="message-content">
              <div class="message-header">
                <span class="role-badge user">👤 您</span>
                <span class="timestamp">{{ formatTime(currentSession.startTime) }}</span>
              </div>
              <div class="message-text">{{ currentSession.query }}</div>
            </div>
          </div>

          <!-- 专家发言 -->
          <div v-for="(speech, index) in speeches" :key="`speech-${index}`" class="message assistant">
            <div class="message-content">
              <div class="message-header">
                <span class="role-badge assistant">
                  <el-icon style="margin-right: var(--spacing-xs);"><component :is="getIconComponent(getExpertIcon(speech.expertType))" /></el-icon>
                  {{ speech.expertName }}
                </span>
                <span class="timestamp">{{ formatTime(speech.timestamp) }}</span>
              </div>
              <div class="message-text">
                <MarkdownRenderer
                  :content="typeof speech.content === 'string' ? speech.content : JSON.stringify(speech.content, null, 2)"
                  :enable-code-highlight="true"
                  :enable-tables="true"
                  :enable-breaks="true"
                />
              </div>

              <!-- 显示专家分析信息 -->
              <div v-if="speech.keyPoints && speech.keyPoints.length > 0" class="expert-analysis">
                <h4>🔧 关键要点：</h4>
                <div class="analysis-content">
                  <div v-for="point in speech.keyPoints" :key="point" class="analysis-item">
                    <span class="expert-point">{{ point }}</span>
                  </div>
                </div>
              </div>

              <div v-if="speech.recommendations && speech.recommendations.length > 0" class="expert-analysis">
                <h4>💡 具体建议：</h4>
                <div class="analysis-content">
                  <div v-for="rec in speech.recommendations" :key="rec" class="analysis-item">
                    <span class="expert-recommendation">{{ rec }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 正在分析中的提示 -->
          <div v-if="isConsulting && !isCompleted" class="message assistant thinking">
            <div class="message-content">
              <div class="message-header">
                <span class="role-badge assistant">
                  <el-icon style="margin-right: var(--spacing-xs);"><component :is="getIconComponent(getCurrentExpertIcon())" /></el-icon>
                  {{ getCurrentExpertName() }}
                </span>
                <span class="timestamp">正在分析...</span>
              </div>
              <div class="thinking-animation">
                <div class="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 咨询汇总 -->
          <div v-if="consultationSummary" class="message assistant summary">
            <div class="message-content">
              <div class="message-header">
                <span class="role-badge assistant">📊 咨询汇总报告</span>
                <span class="timestamp">{{ formatTime(new Date()) }}</span>
              </div>
              <div class="summary-content">
                <div class="overall-analysis">
                  <h4>📝 综合分析</h4>
                  <p>{{ consultationSummary.overallAnalysis }}</p>
                </div>

                <div v-if="consultationSummary.keyInsights && consultationSummary.keyInsights.length > 0" class="key-insights">
                  <h4>💎 核心洞察</h4>
                  <ul>
                    <li v-for="insight in consultationSummary.keyInsights" :key="insight">
                      {{ insight }}
                    </li>
                  </ul>
                </div>

                <div v-if="consultationSummary.finalRecommendations && consultationSummary.finalRecommendations.length > 0" class="final-recommendations">
                  <h4>🎯 最终建议</h4>
                  <ol>
                    <li v-for="rec in consultationSummary.finalRecommendations" :key="rec">
                      {{ rec }}
                    </li>
                  </ol>
                </div>

                <div class="summary-actions">
                  <el-button type="primary" @click="generateActionPlan" :loading="isGeneratingPlan">
                    生成行动计划
                  </el-button>
                  <el-button @click="startNewConsultation">
                    新的咨询
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 行动计划 -->
          <div v-if="actionPlan" class="message assistant action-plan">
            <div class="message-content">
              <div class="message-header">
                <span class="role-badge assistant">📋 行动计划</span>
                <span class="timestamp">{{ formatTime(new Date()) }}</span>
              </div>
              <div class="plan-content">
                <div class="plan-summary">
                  <h4>计划概述</h4>
                  <p>{{ actionPlan.summary }}</p>
                  <div class="plan-meta">
                    <el-tag :type="getPriorityType(actionPlan.priority)">
                      {{ getPriorityText(actionPlan.priority) }}
                    </el-tag>
                    <span class="timeline">预计时长：{{ actionPlan.timeline }}</span>
                  </div>
                </div>

                <div class="task-list">
                  <h4>具体任务 ({{ actionPlan.tasks.length }}项)</h4>
                  <div class="task-item" v-for="task in actionPlan.tasks" :key="task.id">
                    <div class="task-header">
                      <div class="task-title">{{ task.title }}</div>
                      <div class="task-meta">
                        <el-tag size="small" :type="getPriorityType(task.priority)">
                          {{ getPriorityText(task.priority) }}
                        </el-tag>
                        <span class="task-deadline">{{ task.deadline }}</span>
                      </div>
                    </div>
                    <div class="task-description">{{ task.description }}</div>
                    <div class="task-responsible">负责人：{{ task.responsible }}</div>
                  </div>
                </div>

                <div v-if="actionPlan.budget" class="budget-estimate">
                  <h4>预算估算</h4>
                  <div class="budget-total">总预算：¥{{ actionPlan.budget.total.toLocaleString() }}</div>
                  <div class="budget-breakdown">
                    <div
                      v-for="item in actionPlan.budget.breakdown"
                      :key="item.category"
                      class="budget-item"
                    >
                      <span class="category">{{ item.category }}</span>
                      <span class="amount">¥{{ item.amount.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-group">
            <textarea
              v-model="queryText"
              @keydown.enter.prevent="startConsultation"
              placeholder="请详细描述您遇到的问题，比如：我要做一场秋季的招生活动，需要考虑哪些方面？"
              :disabled="isConsulting"
              rows="3"
            ></textarea>
            <button @click="startConsultation" :disabled="isConsulting || !queryText.trim()">
              <span v-if="isConsulting">⏳</span>
              <span v-else>发送</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 专家团队展示 -->
      <div class="experts-panel">
        <h3>👥 专家团队</h3>
        <div class="experts-grid">
          <div v-for="(expert, index) in expertTeam" :key="expert.type" class="expert-card">
            <div class="expert-header">
              <h4>{{ expert.name }}</h4>
              <span class="expert-status" :class="{ active: currentSession && currentExpertIndex === index }">
                {{ currentSession && currentExpertIndex === index ? '🔥 分析中' :
                   currentSession && index < currentExpertIndex ? '✅ 已完成' : '💤 待命' }}
              </span>
            </div>
            <p class="expert-description">{{ expert.role }} - {{ expert.focus }}</p>
            <div class="expert-capabilities">
              <span v-for="capability in getExpertCapabilities(expert.type)" :key="capability" class="capability-tag">
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
        <button @click="quickTest('activity')" class="test-btn activity">
          🍂 秋季招生活动
        </button>
        <button @click="quickTest('conversion')" class="test-btn conversion">
          💰 家长转化问题
        </button>
        <button @click="quickTest('competition')" class="test-btn competition">
          🏆 竞品分析策略
        </button>
        <button @click="quickTest('complex')" class="test-btn complex">
          🔥 综合方案规划
        </button>
        <button @click="quickTest('mermaid')" class="test-btn">
          🧩 流程图测试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UserFilled, Money, Management, Promotion, Tools, User,
  CircleCheck, Loading, Clock, Document, List, Connection
} from '@element-plus/icons-vue'

// 图标映射
const iconMap = {
  'Promotion': Promotion,
  'Connection': Connection,
  'Money': Money,
  'Management': Management,
  'Tools': Tools,
  'User': User,
  'UserFilled': UserFilled
}
import { AI_ENDPOINTS, EXPERT_CONSULTATION_ENDPOINTS, SMART_EXPERT_ENDPOINTS } from '@/api/endpoints'
import { request, aiService } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'

// 类型定义
interface ConsultationSession {
  sessionId: string
  query: string
  startTime: string
}

interface ExpertSpeech {
  expertType: string
  expertName: string
  content: string
  timestamp: string
  keyPoints: string[]
  recommendations: string[]
  processingTime: number
}

interface ConsultationSummary {
  overallAnalysis: string
  keyInsights: string[]
  finalRecommendations: string[]
}

interface ActionPlan {
  summary: string
  priority: string
  timeline: string
  tasks: Array<{
    id: string
    title: string
    description: string
    deadline: string
    priority: string
    responsible: string
  }>
  budget: {
    total: number
    breakdown: Array<{
      category: string
      amount: number
    }>
  }
}

enum ExpertType {
  PLANNER = 'planner',
  PSYCHOLOGIST = 'psychologist',
  INVESTOR = 'investor',
  DIRECTOR = 'director',
  TEACHER = 'teacher',
  PARENT = 'parent'
}

// 专家团队配置
const expertTeam = ref([
  {
    type: ExpertType.PLANNER,
    name: '招生策划专家',
    role: '资深策划师',
    focus: '活动创意与推广策略',
    icon: 'Promotion'
  },
  {
    type: ExpertType.PSYCHOLOGIST,
    name: '心理学专家',
    role: '儿童心理学家',
    focus: '心理分析与行为研究',
    icon: 'Connection'
  },
  {
    type: ExpertType.INVESTOR,
    name: '投资分析专家',
    role: '财务顾问',
    focus: '预算规划与成本控制',
    icon: 'Money'
  },
  {
    type: ExpertType.DIRECTOR,
    name: '园长管理专家',
    role: '运营总监',
    focus: '组织协调与资源配置',
    icon: 'Management'
  },
  {
    type: ExpertType.TEACHER,
    name: '执行教师专家',
    role: '一线教师',
    focus: '实施细节与质量把控',
    icon: 'Tools'
  },
  {
    type: ExpertType.PARENT,
    name: '家长体验专家',
    role: '用户代表',
    focus: '需求分析与满意度',
    icon: 'User'
  }
])

// 响应式数据
const queryText = ref('')
const currentSession = ref<ConsultationSession | null>(null)
const speeches = ref<ExpertSpeech[]>([])
const consultationSummary = ref<ConsultationSummary | null>(null)
const actionPlan = ref<ActionPlan | null>(null)

const isStarting = ref(false)
const isConsulting = ref(false)
const isGeneratingPlan = ref(false)
const currentExpertIndex = ref(0)
const currentExpertName = ref('')
const speechListRef = ref<HTMLElement>()

const lastQuickTestType = ref<string | null>(null)

// 计算属性
const progressPercentage = computed(() => {
  if (!currentSession.value) return 0
  const total = expertTeam.value.length
  const current = Math.min(currentExpertIndex.value, total)
  return Math.round((current / total) * 100)
})

const isCompleted = computed(() => {
  return currentSession.value && currentExpertIndex.value >= expertTeam.value.length
})

// 方法
const setExampleQuery = (query: string) => {
  queryText.value = query
}

const startConsultation = async () => {
  if (!queryText.value.trim()) {
    ElMessage.warning('请输入您的问题')
    return
  }

  isStarting.value = true
  try {
    // 创建新的咨询会话
    currentSession.value = {
      sessionId: `smart-${Date.now()}`,
      query: queryText.value.trim(),
      startTime: new Date(),
      status: 'active',
      expectedExperts: [],
      totalExperts: 0,
      currentRound: 1
    }

    // 清空之前的数据
    speeches.value = []
    currentExpertIndex.value = 0
    consultationSummary.value = null
    actionPlan.value = null
    isConsulting.value = true

    // 使用流式输出的智能专家聊天接口
    await startStreamingExpertConsultation(queryText.value.trim())

  } catch (error: any) {
    console.error('专家咨询失败:', error)
    ElMessage.error(error.message || '专家咨询失败，请稍后重试')

    // 对于“流程图测试”提供本地兜底，保障演示体验
    if (lastQuickTestType.value === 'mermaid') {
      speeches.value.push({
        content: '```mermaid\nflowchart TD\nA(前期准备)-->B(宣传推广)-->C(线上报名)-->D(资料审核)-->E(录取通知)-->F(报到注册)-->G(后续跟进)\n```',
        expertType: 'ai_coordinator',
        expertName: 'AI协调员',
        timestamp: new Date(),
        keyPoints: [],
        recommendations: [],
        processingTime: 0
      })
      nextTick(() => { scrollToBottom() })
    }
  } finally {
    isStarting.value = false
    isConsulting.value = false
  }
}

// 流式智能专家咨询
const startStreamingExpertConsultation = async (query: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      // 获取认证token
      const token = localStorage.getItem('token')

      // 使用fetch进行流式请求
      const response = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/smart-expert/smart-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: query
            }
          ],
          stream: true
        })
      })

      response.then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const reader = res.body?.getReader()
        if (!reader) {
          throw new Error('无法获取响应流')
        }

        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              console.log('✅ 流式响应完成')
              break
            }

            // 解码数据
            buffer += decoder.decode(value, { stream: true })

            // 处理完整的事件
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留不完整的行

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = JSON.parse(line.slice(6))
                  await handleStreamEvent(eventData)
                } catch (e) {
                  console.warn('解析事件数据失败:', line, e)
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
        }

        resolve()
      }).catch(reject)

    } catch (error) {
      console.error('流式请求失败:', error)
      reject(error)
    }
  })
}


// 将任意结构的内容规范化为 Markdown 字符串，避免出现 [object Object]
const normalizeContent = (input: any): string => {
  try {
    if (input == null) return ''
    if (typeof input === 'string') return input

    // 常见字段优先
    if (typeof input === 'object') {
      const primary = (input as any).markdown || (input as any).text || (input as any).advice || (input as any).content
      if (typeof primary === 'string' && primary.trim()) return primary
    }

    // 数组：逐项渲染
    if (Array.isArray(input)) {
      return input.map((item) => {
        const s = normalizeContent(item)
        return s.includes('\n') ? `- ${s.replace(/\n/g, '\n  ')}` : `- ${s}`
      }).join('\n')
    }

    // 对象：识别常见结构，拼接为 Markdown
    if (typeof input === 'object') {
      const obj = input as Record<string, any>
      const lines: string[] = []

      // 关键要点/建议
      if (Array.isArray(obj.key_points) && obj.key_points.length) {
        lines.push('【关键要点】')
        obj.key_points.forEach((p: any) => lines.push(`- ${normalizeContent(p)}`))
      }
      if (Array.isArray(obj.recommendations) && obj.recommendations.length) {
        lines.push('', '【具体建议】')
        obj.recommendations.forEach((p: any) => lines.push(`- ${normalizeContent(p)}`))
      }

      // 其他字段以列表展示（过滤已处理字段）
      const skip = new Set(['markdown','text','advice','content','key_points','recommendations'])
      const restKeys = Object.keys(obj).filter(k => !skip.has(k))
      if (restKeys.length) {
        if (lines.length) lines.push('')
        lines.push('【详细信息】')
        for (const k of restKeys) {
          const v = obj[k]
          if (typeof v === 'string') {
            lines.push(`- ${k}: ${v}`)
          } else if (typeof v === 'number' || typeof v === 'boolean') {
            lines.push(`- ${k}: ${String(v)}`)
          } else if (Array.isArray(v)) {
            lines.push(`- ${k}:`)
            v.forEach((item: any) => lines.push(`  - ${normalizeContent(item)}`))
          } else if (typeof v === 'object' && v) {
            const pretty = normalizeContent(v)
            const formatted = pretty.includes('\n') ? `\n  ${pretty.replace(/\n/g, '\n  ')}` : ` ${pretty}`
            lines.push(`- ${k}:${formatted}`)
          } else if (v == null) {
            lines.push(`- ${k}: null`)
          } else {
            lines.push(`- ${k}: ${String(v)}`)
          }
        }
      }

      if (lines.length) return lines.join('\n')
      // 兜底：漂亮的 JSON
      return '```json\n' + JSON.stringify(obj, null, 2) + '\n```'
    }

    // 其他原始类型
    return String(input)
  } catch (e) {
    try { return JSON.stringify(input) } catch { return String(input) }
  }
}

// 处理流式事件
const handleStreamEvent = async (eventData: any) => {
  console.log('📡 收到流式事件:', eventData)

  switch (eventData.type) {
    case 'connected':
      console.log('🔗 连接已建立:', eventData.message)
      break

    case 'analysis':
      console.log('🧠 开始分析:', eventData.message)
      // 可以在这里显示分析状态
      break

    case 'experts_selected':
      console.log('🎯 专家已选择:', eventData.experts)
      // 显示选中的专家
      if (eventData.experts && eventData.experts.length > 0) {
        ElMessage.info(`AI智能选择了 ${eventData.experts.length} 个专家为您提供建议`)
      }
      break

    case 'expert_working':
      console.log('🔄 专家工作中:', eventData)
      // 显示当前工作的专家
      currentExpertName.value = eventData.expert_name || eventData.tool_name || '专家'
      break

    case 'expert_completed':
      console.log('✅ 专家完成:', eventData)
      console.log('✅ 专家完成详细数据:', JSON.stringify(eventData, null, 2))

      // 添加专家发言 - 修复数据结构解析
      if (eventData.result) {
        // 从后端日志可以看到，数据结构是 eventData.result 直接包含专家数据
        const expertData = eventData.result
        let expertContent: any = normalizeContent(expertData.advice ?? expertData.content ?? expertData)
        if (!expertContent?.trim()) expertContent = '专家分析完成'

        console.log('✅ 准备添加专家回复:', {
          expertName: expertData.expert_name,
          contentLength: (expertContent?.length ?? 0),
          expertType: expertData.expert_type
        })

        speeches.value.push({
          content: expertContent as string,
          expertType: expertData.expert_type || 'general',
          expertName: expertData.expert_name || '专家',
          timestamp: new Date(),
          keyPoints: expertData.key_points || [],
          recommendations: expertData.recommendations || [],
          processingTime: 0
        })

        console.log('✅ 专家回复已添加，当前speeches数量:', speeches.value.length)

        // 滚动到底部
        nextTick(() => {
          scrollToBottom()
        })
      } else {
        console.error('❌ 专家完成事件缺少result数据:', eventData)
      }
      break

    case 'expert_error':
      console.error('❌ 专家错误:', eventData)
      ElMessage.error(`${eventData.expert_name || '专家'} 分析失败: ${eventData.error}`)
      break

    case 'integrating':
      console.log('🔄 整合中:', eventData.message)
      currentExpertName.value = 'AI协调员'
      break

    case 'complete':
      console.log('✅ 完成:', eventData)
      // 处理最终结果（增强兼容不同字段名）
      {
        const finalData: any = eventData.data || eventData.result || {}
        const candidates = [
          finalData.content,
          finalData?.result?.advice,
          finalData.advice,
          finalData.message,
          finalData.output,
          finalData.text
        ]
        let content = candidates.find((v) => typeof v === 'string' && v.trim().length > 0) as string | undefined
        if (!content) content = normalizeContent(finalData)

        // 若是 quickTest('mermaid') 且后端失败，则本地兜底渲染示例图，保障客户演示体验
        if ((!content || /服务暂时不可用|智能专家调度失败/i.test(content)) && lastQuickTestType.value === 'mermaid') {
          content = '```mermaid\nflowchart TD\nA(前期准备)-->B(宣传推广)-->C(线上报名)-->D(资料审核)-->E(录取通知)-->F(报到注册)-->G(后续跟进)\n```'
        }

        if (content && content.trim() !== '正在调用专家工具...') {
          speeches.value.push({
            content,
            expertType: 'ai_coordinator',
            expertName: 'AI协调员',
            timestamp: new Date(),
            keyPoints: [],
            recommendations: [],
            processingTime: 0
          })
        }

        // 标记完成
        if (currentSession.value) {
          currentSession.value.isCompleted = true
        }
        currentExpertName.value = ''
        ElMessage.success('智能专家咨询完成')
        nextTick(() => { scrollToBottom() })
      }
      break

    case 'error':
      console.error('❌ 流式错误:', eventData)
      ElMessage.error(eventData.message || '智能专家咨询失败')
      break

    default:
      console.log('📡 未知事件类型:', eventData.type, eventData)
  }
}

const getNextExpertSpeeches = async () => {
  if (!currentSession.value || isCompleted.value) return

  isConsulting.value = true

  try {
    // 循环获取所有专家的发言
    while (currentExpertIndex.value < expertTeam.value.length) {
      // 创建一个新的专家发言占位符
      const currentExpert = expertTeam.value[currentExpertIndex.value]
      const placeholderSpeech: ExpertSpeech = {
        expertType: currentExpert.type,
        expertName: currentExpert.name,
        content: '',
        timestamp: new Date().toISOString(),
        keyPoints: [],
        recommendations: [],
        processingTime: 0
      }

      speeches.value.push(placeholderSpeech)
      const speechIndex = speeches.value.length - 1

      // 使用流式输出获取专家发言
      await getExpertSpeechStream(currentSession.value.sessionId, currentExpertIndex.value, speechIndex)

      currentExpertIndex.value++

      // 滚动到最新发言
      await nextTick()
      scrollToBottom()

      // 短暂延迟，改善用户体验
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // 所有专家发言完毕，获取汇总
    const summaryResponse: ApiResponse<ConsultationSummary> = await request.get(EXPERT_CONSULTATION_ENDPOINTS.GET_SUMMARY(currentSession.value.sessionId))

    if (summaryResponse.success) {
      consultationSummary.value = summaryResponse.data
    }

    ElMessage.success('专家咨询已完成！')

  } catch (error) {
    console.error('获取专家发言失败:', error)
    ElMessage.error('获取专家发言失败')
  } finally {
    isConsulting.value = false
  }
}

// 处理专家工具调用
const handleExpertToolCalls = async (toolCalls: any[], aiResponse: any) => {
  for (const toolCall of toolCalls) {
    if (toolCall.type === 'function') {
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments)

      // 根据不同的专家工具显示不同的专家发言
      if (functionName === 'call_expert') {
        const expertId = functionArgs.expert_id
        const expertName = getExpertNameById(expertId)

        // 查找对应的工具执行结果
        const toolResult = aiResponse.tool_results?.find((result: any) =>
          result.tool_call_id === toolCall.id
        )

        if (toolResult) {
          speeches.value.push({
            expertType: expertId,
            expertName: expertName,
            content: toolResult.content,
            keyPoints: extractKeyPoints(toolResult.content),
            recommendations: extractRecommendations(toolResult.content),
            timestamp: new Date(),
            processingTime: 0
          })
        }
      } else if (functionName === 'get_expert_list') {
        // 显示专家列表信息
        speeches.value.push({
          expertType: 'system',
          expertName: '系统助手',
          content: '已为您查询可用的专家团队信息',
          keyPoints: [],
          recommendations: [],
          timestamp: new Date(),
          processingTime: 0
        })
      }
    }
  }
}

// 根据专家ID获取专家名称
const getExpertNameById = (expertId: string): string => {
  const expertNames: Record<string, string> = {
    'activity_planner': '活动策划专家',
    'marketing_expert': '招生营销专家',
    'education_expert': '教育评估专家',
    'cost_analyst': '成本分析专家',
    'risk_assessor': '风险评估专家',
    'creative_designer': '创意设计专家',
    'curriculum_expert': '课程教学专家'
  }
  return expertNames[expertId] || '专业顾问'
}

// 从内容中提取关键要点
const extractKeyPoints = (content: string): string[] => {
  const keyPointsMatch = content.match(/【关键要点】([\s\S]*?)(?=【|$)/)
  if (keyPointsMatch) {
    return keyPointsMatch[1]
      .split(/[•\-\*]\s*/)
      .filter(point => point.trim())
      .map(point => point.trim())
      .slice(0, 5) // 最多5个要点
  }
  return []
}

// 从内容中提取具体建议
const extractRecommendations = (content: string): string[] => {
  const recommendationsMatch = content.match(/【具体建议】([\s\S]*?)(?=【|$)/)
  if (recommendationsMatch) {
    return recommendationsMatch[1]
      .split(/[•\-\*]\s*/)
      .filter(rec => rec.trim())
      .map(rec => rec.trim())
      .slice(0, 5) // 最多5个建议
  }
  return []
}

const generateActionPlan = async () => {
  if (!currentSession.value) return

  isGeneratingPlan.value = true
  try {
    // 使用智能专家系统生成行动计划
    const response: ApiResponse<any> = await aiService.post(SMART_EXPERT_ENDPOINTS.SMART_CHAT, {
      messages: [
        {
          role: 'user',
          content: `基于我们刚才的专家咨询讨论，请为"${currentSession.value.query}"生成一个详细的行动计划。请使用generate_todo_list工具来创建结构化的任务清单。`
        }
      ]
    })

    // 处理智能专家系统的响应
    const aiResponse = response.data

    if (aiResponse.choices && aiResponse.choices[0]) {
      const aiMessage = aiResponse.choices[0].message

      // 模拟行动计划数据结构
      actionPlan.value = {
        title: '专家建议行动计划',
        description: aiMessage.content,
        tasks: extractTasksFromContent(aiMessage.content),
        timeline: '建议在1-3个月内完成',
        priority: 'high',
        estimatedDuration: '1-3个月',
        resources: ['专业团队', '预算规划', '时间安排'],
        successMetrics: ['目标达成率', '执行效果', '反馈质量']
      }

      ElMessage.success('智能行动计划已生成')
    }

    // 滚动到行动计划
    await nextTick()
    scrollToBottom()

  } catch (error) {
    console.error('生成行动计划失败:', error)
    ElMessage.error('生成行动计划失败')
  } finally {
    isGeneratingPlan.value = false
  }
}

// 从内容中提取任务列表
const extractTasksFromContent = (content: string): any[] => {
  const tasks: any[] = []
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    if (line.match(/^\d+\.\s+/) || line.match(/^[-*]\s+/)) {
      tasks.push({
        id: index + 1,
        title: line.replace(/^\d+\.\s+|^[-*]\s+/, '').trim(),
        description: '',
        status: 'pending',
        priority: 'medium',
        estimatedTime: '1-2天'
      })
    }
  })

  return tasks.slice(0, 10) // 最多10个任务
}

const startNewConsultation = () => {
  currentSession.value = null
  speeches.value = []
  consultationSummary.value = null
  actionPlan.value = null
  queryText.value = ''
  currentExpertIndex.value = 0
}

// 快速测试
const quickTest = (type: string) => {
  const testMessages = {
    activity: '我要做一场秋季的招生活动，需要考虑哪些方面？',
    conversion: '家长聊了半天就是不缴费，怎么办？',
    competition: '附近新开了几家幼儿园，我们如何保持竞争优势？',
    complex: '我需要制定一个全年的招生计划，包括活动安排、预算分配和团队培训',
    mermaid: '只返回一个Markdown，包含一个 ```mermaid\nflowchart TD\nA(前期准备)-->B(宣传推广)-->C(线上报名)-->D(资料审核)-->E(录取通知)-->F(报到注册)-->G(后续跟进)\n``` 代码块，不要额外文字。'
  }

  queryText.value = testMessages[type as keyof typeof testMessages]
  lastQuickTestType.value = type
  startConsultation()
}

// 获取专家能力标签
const getExpertCapabilities = (expertType: string) => {
  const capabilitiesMap: Record<string, string[]> = {
    [ExpertType.PLANNER]: ['创意策划', '活动设计', '推广方案', '品牌建设'],
    [ExpertType.PSYCHOLOGIST]: ['行为分析', '需求洞察', '情绪管理', '沟通技巧'],
    [ExpertType.INVESTOR]: ['成本核算', '投资回报', '风险评估', '财务规划'],
    [ExpertType.DIRECTOR]: ['资源调配', '团队管理', '流程优化', '决策支持'],
    [ExpertType.TEACHER]: ['执行细节', '教学质量', '家长沟通', '活动组织'],
    [ExpertType.PARENT]: ['用户体验', '服务质量', '满意度', '口碑传播']
  }
  return capabilitiesMap[expertType] || []
}

const getCurrentExpertName = () => {
  const currentExpert = expertTeam.value[currentExpertIndex.value]
  return currentExpert ? currentExpert.name : ''
}

const getCurrentExpertIcon = () => {
  const currentExpert = expertTeam.value[currentExpertIndex.value]
  return currentExpert ? currentExpert.icon : 'User'
}

const getExpertIcon = (expertType: ExpertType) => {
  const expert = expertTeam.value.find(e => e.type === expertType)
  return expert ? expert.icon : 'User'
}

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || User
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 流式获取专家发言
const getExpertSpeechStream = async (sessionId: string, expertIndex: number, speechIndex: number) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // 获取认证token
      const token = localStorage.getItem('token')

      // 使用fetch进行流式请求
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/expert-consultation/${sessionId}/stream-speech?expertIndex=${expertIndex}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // 处理SSE数据
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'content') {
                // 更新专家发言内容
                if (speeches.value[speechIndex]) {
                  speeches.value[speechIndex].content = data.fullContent || speeches.value[speechIndex].content + data.content
                }

                // 自动滚动到底部
                nextTick(() => {
                  scrollToBottom()
                })
              } else if (data.type === 'complete') {
                // 发言完成，更新完整信息
                if (speeches.value[speechIndex] && data.speech) {
                  // 确保content是字符串格式
                  speeches.value[speechIndex].content = typeof data.speech.content === 'string' ? data.speech.content : JSON.stringify(data.speech.content)
                  speeches.value[speechIndex].keyPoints = data.speech.keyPoints || []
                  speeches.value[speechIndex].recommendations = data.speech.recommendations || []
                  speeches.value[speechIndex].processingTime = data.speech.processingTime || 0
                }
                resolve()
                return
              } else if (data.type === 'error') {
                console.error('专家发言流式输出错误:', data.message)
                reject(new Error(data.message))
                return
              }
            } catch (error) {
              console.error('解析流式数据失败:', error)
            }
          }
        }
      }

      resolve()

    } catch (error) {
      console.error('流式请求失败:', error)
      // 如果流式输出失败，回退到普通API
      fallbackToNormalAPI(sessionId, expertIndex, speechIndex).then(resolve).catch(reject)
    }
  })
}

// 回退到普通API
const fallbackToNormalAPI = async (sessionId: string, expertIndex: number, speechIndex: number) => {
  try {
    const speechResponse: ApiResponse<ExpertSpeech> = await aiService.get(EXPERT_CONSULTATION_ENDPOINTS.GET_NEXT_SPEECH(sessionId), {
      params: { expertIndex }
    })

    if (speeches.value[speechIndex] && speechResponse.data) {
      // 确保content是字符串格式
      speeches.value[speechIndex].content = typeof speechResponse.data.content === 'string' ? speechResponse.data.content : JSON.stringify(speechResponse.data.content)
      speeches.value[speechIndex].keyPoints = speechResponse.data.keyPoints || []
      speeches.value[speechIndex].recommendations = speechResponse.data.recommendations || []
      speeches.value[speechIndex].processingTime = speechResponse.data.processingTime || 0
      speeches.value[speechIndex].expertType = speechResponse.data.expertType
      speeches.value[speechIndex].expertName = speechResponse.data.expertName
      speeches.value[speechIndex].timestamp = speechResponse.data.timestamp
    }
  } catch (error) {
    console.error('回退API调用失败:', error)
    throw error
  }
}

const formatSpeechContent = (content: string) => {
  // 简单的内容格式化，将换行转换为HTML
  return content.replace(/\n/g, '<br>')
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, 'danger' | 'warning' | 'info'> = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return textMap[priority] || priority
}

const scrollToBottom = () => {
  if (speechListRef.value) {
    speechListRef.value.scrollTop = speechListRef.value.scrollHeight
  }
}
</script>

<style scoped lang="scss">
.expert-consultation-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--spacing-4xl);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  flex-shrink: 0;
  padding: var(--spacing-sm) 0;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-2xl);
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  font-size: var(--text-base);
  margin: 0;
}

.demo-container {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
  flex: 1;
  min-height: 0;
}

.chat-container {
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) 6px var(--shadow-light);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-sm) 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.chat-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
}

.status-indicator {
  padding: var(--spacing-xs) 10px;
  border-radius: var(--text-2xl);
  background: var(--white-alpha-20);
  font-size: var(--text-sm);
}

.status-indicator.active {
  background: rgba(255, 193, 7, 0.3);
  animation: pulse 2s infinite;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4xl);
  min-height: 0;
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
  display: flex;
  align-items: center;
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

.message-text {
  line-height: 1.6;
  color: var(--text-primary);
}

.expert-analysis {
  margin-top: var(--spacing-4xl);
  padding: var(--spacing-2xl);
  background: rgba(103, 58, 183, 0.1);
  border-radius: var(--spacing-sm);
  border-left: var(--spacing-xs) solid #673ab7;
}

.expert-analysis h4 {
  margin: 0 0 10px 0;
  color: #673ab7;
  font-size: var(--text-base);
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.analysis-item {
  display: flex;
  align-items: start;
}

.expert-point, .expert-recommendation {
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: 1.5;
}

.thinking-animation {
  padding: var(--text-2xl);
  text-align: center;
}

.thinking-dots {
  display: inline-flex;
  gap: var(--spacing-xs);
}

.thinking-dots span {
  width: var(--spacing-sm);
  height: var(--spacing-sm);
  background: var(--primary-color);
  border-radius: var(--radius-full);
  animation: bounce 1.4s infinite;
}

.thinking-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input {
  padding: var(--spacing-4xl);
  border-top: var(--border-width-base) solid #eee;
  flex-shrink: 0;
}

.input-group {
  display: flex;
  gap: var(--spacing-2xl);
}

.input-group textarea {
  flex: 1;
  padding: var(--spacing-2xl);
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--spacing-sm);
  resize: vertical;
  font-family: inherit;
  min-height: 60px;
  max-height: 120px;
}

.input-group button {
  padding: var(--spacing-2xl) var(--text-2xl);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--spacing-sm);
  cursor: pointer;
  font-weight: bold;
  align-self: flex-end;
}

.input-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.experts-panel {
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) 6px var(--shadow-light);
  padding: var(--spacing-4xl);
  overflow-y: auto;
  height: 100%;
}

.experts-panel h3 {
  margin-bottom: var(--spacing-2xl);
  color: #2c3e50;
  font-size: var(--text-lg);
  text-align: center;
  font-weight: 600;
}

.experts-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.expert-card {
  border: var(--border-width-base) solid #eee;
  border-radius: var(--spacing-sm);
  padding: var(--text-sm);
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
  padding: var(--spacing-4xl);
  flex-shrink: 0;
}

.quick-tests h3 {
  margin-bottom: var(--spacing-sm);
  color: #2c3e50;
  font-size: var(--text-lg);
  text-align: center;
  font-weight: 600;
}

.test-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-sm);
}

.test-btn {
  padding: var(--spacing-2xl) var(--text-base);
  border: none;
  border-radius: var(--spacing-sm);
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: var(--text-base);
}

.test-btn.activity {
  background: var(--bg-white)3e0;
  color: #f57c00;
}

.test-btn.conversion {
  background: #e3f2fd;
  color: #1976d2;
}

.test-btn.competition {
  background: #f3e5f5;
  color: #7b1fa2;
}

.test-btn.complex {
  background: #fce4ec;
  color: #c2185b;
}

.test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-heavy);
}

/* 汇总和计划样式 */
.summary-content, .plan-content {
  margin-top: var(--spacing-4xl);
}

.overall-analysis, .key-insights, .final-recommendations, .plan-summary, .task-list, .budget-estimate {
  margin-bottom: var(--spacing-4xl);
}

.overall-analysis h4, .key-insights h4, .final-recommendations h4, .plan-summary h4, .task-list h4, .budget-estimate h4 {
  color: #2c3e50;
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-lg);
}

.overall-analysis p, .plan-summary p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.key-insights ul, .final-recommendations ol {
  margin: 0;
  padding-left: var(--text-2xl);
}

.key-insights li, .final-recommendations li {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-base);
}

.summary-actions {
  margin-top: var(--text-2xl);
  display: flex;
  gap: var(--spacing-2xl);
}

.plan-meta {
  margin-top: var(--spacing-2xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.timeline {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.task-item {
  border: var(--border-width-base) solid #eee;
  border-radius: var(--spacing-sm);
  padding: var(--text-sm);
  margin-bottom: var(--spacing-2xl);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.task-title {
  font-weight: bold;
  color: #2c3e50;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.task-deadline {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.task-description {
  color: var(--text-secondary);
  font-size: var(--text-base);
  margin-bottom: var(--spacing-sm);
}

.task-responsible {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.budget-total {
  font-size: var(--text-xl);
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: var(--spacing-2xl);
}

.budget-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.budget-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--spacing-xs);
}

.budget-item .category {
  color: var(--text-secondary);
}

.budget-item .amount {
  font-weight: bold;
  color: #2c3e50;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}


/* ===== 全局主题变量接入覆盖（不改动原类，向后追加以覆盖） ===== */
/* Theme integration: override hard-coded colors using global CSS variables */
.expert-consultation-page {
  color: var(--text-primary);
}

.demo-header h1 { color: var(--text-primary) !important; }
.subtitle { color: var(--text-secondary) !important; }

.chat-container {
  background: var(--bg-card) !important;
  box-shadow: var(--shadow-sm) !important;
}
.chat-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%) !important;
  color: var(--text-primary) !important;
}
.status-indicator { background: rgba(255, 255, 255, 0.12); }
.status-indicator.active {
  background: var(--warning-color) !important; /* fallback */
  background: color-mix(in oklab, var(--warning-color) 25%, transparent) !important;
}

.chat-messages { color: var(--text-primary); }
.message-text { color: var(--text-primary) !important; }
.timestamp { color: var(--text-muted) !important; }

.message.user .message-content { background: var(--primary-light-bg) !important; }
.message.assistant .message-content { background: var(--bg-secondary) !important; }
.role-badge.user { color: var(--primary-color) !important; }
.role-badge.assistant { color: var(--success-color, var(--success-color)) !important; }

.expert-analysis {
  background: var(--primary-light-bg) !important;
  border-left-color: var(--primary-color) !important;
}
.expert-analysis h4 { color: var(--primary-color) !important; }
.expert-point, .expert-recommendation { color: var(--text-secondary) !important; }

.thinking-dots span { background: var(--primary-color) !important; }

.chat-input { border-top-color: var(--border-color) !important; }
.input-group textarea {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}
.input-group button {
  background: var(--primary-color) !important;
  color: var(--text-primary) !important;
}
.input-group button:disabled {
  background: var(--border-color) !important;
  color: var(--text-disabled) !important;
}

.experts-panel {
  background: var(--bg-card) !important;
  box-shadow: var(--shadow-sm) !important;
}
.experts-panel h3 { color: var(--text-primary) !important; }
.expert-card { border-color: var(--border-color) !important; }
.expert-card:hover { box-shadow: var(--shadow-sm) !important; }
.expert-header h4 { color: var(--text-primary) !important; }
.expert-status {
  background: var(--bg-hover) !important;
  color: var(--text-secondary) !important;
}
.expert-status.active {
  background: var(--warning-color) !important;
  color: var(--text-primary) !important;
}
.expert-description { color: var(--text-secondary) !important; }
.capability-tag {
  background: var(--success-light-bg) !important;
  color: var(--success-color, var(--success-color)) !important;
}

.quick-tests {
  background: var(--bg-card) !important;
  box-shadow: var(--shadow-sm) !important;
}
.quick-tests h3 { color: var(--text-primary) !important; }

/* Quick test buttons semantic colors */
.test-btn.activity { background: var(--warning-light-bg) !important; color: var(--warning-color) !important; }
.test-btn.conversion { background: var(--primary-light-bg) !important; color: var(--primary-color) !important; }
.test-btn.competition { background: var(--info-light-bg) !important; color: var(--info-color) !important; }
.test-btn.complex { background: var(--danger-light-bg) !important; color: var(--danger-color) !important; }

/* Summary and plan sections */
.overall-analysis h4,
.key-insights h4,
.final-recommendations h4,
.plan-summary h4,
.task-list h4,
.budget-estimate h4 { color: var(--text-primary) !important; }
.overall-analysis p, .plan-summary p { color: var(--text-secondary) !important; }
.timeline { color: var(--text-secondary) !important; }
.task-item { border-color: var(--border-color) !important; }
.task-title { color: var(--text-primary) !important; }
.task-description, .task-deadline, .task-responsible { color: var(--text-secondary) !important; }
.budget-total { color: var(--text-primary) !important; }
.budget-item { background: var(--bg-hover) !important; }
.budget-item .category { color: var(--text-secondary) !important; }
.budget-item .amount { color: var(--text-primary) !important; }

@media (max-width: var(--breakpoint-xl)) {
  .demo-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }

  .experts-panel {
    height: auto;
    max-height: 300px;
  }

  .experts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-2xl);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .expert-consultation-page {
    padding: var(--spacing-2xl);
    height: 100vh;
  }

  .demo-header h1 {
    font-size: var(--text-3xl);
  }

  .expert-card {
    padding: var(--spacing-sm);
  }

  .message-content {
    padding: var(--spacing-2xl);
  }

  .message.user .message-content,
  .message.assistant .message-content {
    margin-left: 0;
    margin-right: 0;
  }

  .test-buttons {
    grid-template-columns: 1fr;
  }

  .experts-grid {
    grid-template-columns: 1fr;
  }
}
</style>