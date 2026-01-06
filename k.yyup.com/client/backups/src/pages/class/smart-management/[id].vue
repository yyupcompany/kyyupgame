<template>
  <div class="smart-class-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">{{ className }} - 智能班级管理</h1>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="generateReport">
          <el-icon><Document /></el-icon>
          生成报告
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 实时监控面板 -->
    <div class="monitoring-panel">
      <div class="panel-header">
        <h2>实时班级氛围监控</h2>
        <div class="monitoring-status">
          <el-tag :type="getConnectionStatus()" size="small">
            {{ isConnected ? '实时连接' : '连接断开' }}
          </el-tag>
          <span class="last-update">最后更新: {{ formatTime(lastUpdateTime) }}</span>
        </div>
      </div>
      
      <div class="atmosphere-overview">
        <div class="atmosphere-card">
          <div class="atmosphere-indicator">
            <div class="mood-display">
              <div :class="['mood-icon', getMoodClass(atmosphere.overallMood)]">
                <el-icon><component :is="getMoodIcon(atmosphere.overallMood)" /></el-icon>
              </div>
              <span class="mood-text">{{ getMoodText(atmosphere.overallMood) }}</span>
            </div>
            <div class="atmosphere-metrics">
              <div class="metric-item">
                <span class="metric-label">活跃度</span>
                <el-progress 
                  :percentage="atmosphere.energyLevel * 10" 
                  :color="getEnergyColor(atmosphere.energyLevel)"
                  :show-text="false"
                />
                <span class="metric-value">{{ atmosphere.energyLevel }}/10</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">参与率</span>
                <el-progress 
                  :percentage="atmosphere.participationRate" 
                  color="var(--success-color)"
                  :show-text="false"
                />
                <span class="metric-value">{{ atmosphere.participationRate }}%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">合作指数</span>
                <el-progress 
                  :percentage="atmosphere.collaborationIndex" 
                  color="var(--primary-color)"
                  :show-text="false"
                />
                <span class="metric-value">{{ atmosphere.collaborationIndex }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="environmental-factors">
          <h3>环境因素</h3>
          <div class="factors-grid">
            <div class="factor-item">
              <el-icon><Sunny /></el-icon>
              <span class="factor-label">温度</span>
              <span class="factor-value">{{ atmosphere.environmentalFactors?.temperature || 22 }}°C</span>
            </div>
            <div class="factor-item">
              <el-icon><Bell /></el-icon>
              <span class="factor-label">噪音</span>
              <span class="factor-value">{{ atmosphere.environmentalFactors?.noise || 45 }}dB</span>
            </div>
            <div class="factor-item">
              <el-icon><LightIcon /></el-icon>
              <span class="factor-label">光照</span>
              <span class="factor-value">{{ atmosphere.environmentalFactors?.lighting || '适宜' }}</span>
            </div>
            <div class="factor-item">
              <el-icon><User /></el-icon>
              <span class="factor-label">密度</span>
              <span class="factor-value">{{ atmosphere.environmentalFactors?.crowding || 80 }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学生动态分析 -->
    <div class="student-dynamics">
      <div class="section-header">
        <h2>学生动态分析</h2>
        <el-button size="small" @click="analyzeStudentInteractions">
          <el-icon><TrendCharts /></el-icon>
          深度分析
        </el-button>
      </div>
      
      <div class="dynamics-grid">
        <div class="dynamics-chart">
          <h3>社交网络图</h3>
          <div ref="socialNetworkChart" class="chart-container"></div>
        </div>
        
        <div class="student-roles">
          <h3>学生角色分布</h3>
          <div class="roles-list">
            <div v-for="student in studentDynamics" :key="student.studentId" class="student-role-item">
              <div class="student-info">
                <span class="student-name">{{ student.studentName }}</span>
                <el-tag :type="getRoleType(student.role)" size="small">
                  {{ getRoleText(student.role) }}
                </el-tag>
              </div>
              <div class="behavior-indicators">
                <div class="behavior-item">
                  <span class="behavior-label">合作性</span>
                  <el-rate 
                    v-model="student.behaviorPatterns.cooperation" 
                    :max="5" 
                    disabled 
                    show-score 
                    score-template="{value}"
                  />
                </div>
                <div class="behavior-item">
                  <span class="behavior-label">注意力</span>
                  <el-rate 
                    v-model="student.behaviorPatterns.attention" 
                    :max="5" 
                    disabled 
                    show-score 
                    score-template="{value}"
                  />
                </div>
              </div>
              <div class="risk-factors" v-if="student.riskFactors.length > 0">
                <span class="risk-label">风险因素:</span>
                <el-tag 
                  v-for="risk in student.riskFactors" 
                  :key="risk" 
                  type="warning" 
                  size="small"
                  class="risk-tag"
                >
                  {{ risk }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 冲突预警和管理 -->
    <div class="conflict-management">
      <div class="section-header">
        <h2>冲突预警系统</h2>
        <div class="alert-status">
          <el-badge :value="highRiskConflicts.length" :type="getBadgeType(highRiskConflicts.length)">
            <el-button size="small" @click="showConflictDetails">
              <el-icon><Warning /></el-icon>
              预警详情
            </el-button>
          </el-badge>
        </div>
      </div>
      
      <div class="conflict-overview">
        <div class="current-conflicts" v-if="atmosphere.conflicts && atmosphere.conflicts.length > 0">
          <h3>当前冲突事件</h3>
          <div class="conflicts-list">
            <div v-for="conflict in atmosphere.conflicts" :key="conflict.id" class="conflict-item">
              <div class="conflict-header">
                <div class="conflict-info">
                  <span class="conflict-type">{{ getConflictTypeText(conflict.type) }}</span>
                  <el-tag :type="getSeverityType(conflict.severity)" size="small">
                    {{ getSeverityText(conflict.severity) }}
                  </el-tag>
                </div>
                <span class="conflict-time">{{ formatTime(conflict.timestamp) }}</span>
              </div>
              <p class="conflict-description">{{ conflict.description }}</p>
              <div class="conflict-participants">
                <span class="participants-label">涉及学生:</span>
                <span v-for="name in conflict.participantNames" :key="name" class="participant-name">
                  {{ name }}
                </span>
              </div>
              <div class="conflict-resolution">
                <span class="resolution-label">建议处理:</span>
                <p class="resolution-text">{{ conflict.suggestedResolution }}</p>
              </div>
              <div class="conflict-actions">
                <el-button size="small" type="primary" @click="handleConflict(conflict)">
                  处理冲突
                </el-button>
                <el-button size="small" @click="escalateConflict(conflict)">
                  上报
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="predicted-conflicts">
          <h3>冲突预测</h3>
          <div class="predictions-list">
            <div v-for="prediction in predictedConflicts" :key="prediction.id" class="prediction-item">
              <div class="prediction-header">
                <div class="prediction-info">
                  <span class="prediction-type">{{ prediction.type }}</span>
                  <div class="probability-indicator">
                    <span class="probability-label">发生概率:</span>
                    <el-progress 
                      :percentage="prediction.probability" 
                      :color="getProbabilityColor(prediction.probability)"
                      size="small"
                    />
                  </div>
                </div>
              </div>
              <div class="prediction-participants">
                <span class="participants-label">可能涉及:</span>
                <span v-for="name in prediction.participants" :key="name" class="participant-name">
                  {{ name }}
                </span>
              </div>
              <div class="prevention-strategies">
                <span class="strategies-label">预防策略:</span>
                <ul class="strategies-list">
                  <li v-for="strategy in prediction.preventionStrategies" :key="strategy">
                    {{ strategy }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI干预建议 -->
    <div class="intervention-suggestions">
      <div class="section-header">
        <h2>AI智能干预建议</h2>
        <el-button size="small" type="primary" @click="generateInterventions">
          <el-icon><MagicStick /></el-icon>
          生成新建议
        </el-button>
      </div>
      
      <div class="interventions-grid">
        <div v-for="intervention in interventionSuggestions" :key="intervention.id" class="intervention-card">
          <div class="intervention-header">
            <div class="intervention-info">
              <h4>{{ intervention.title }}</h4>
              <el-tag :type="getPriorityType(intervention.priority)" size="small">
                {{ getPriorityText(intervention.priority) }}
              </el-tag>
            </div>
            <div class="intervention-type">
              <el-tag :type="getInterventionTypeStyle(intervention.type)" size="small">
                {{ getInterventionTypeText(intervention.type) }}
              </el-tag>
            </div>
          </div>
          
          <p class="intervention-description">{{ intervention.description }}</p>
          
          <div class="intervention-details">
            <div class="target-students">
              <span class="label">目标学生:</span>
              <div class="students-tags">
                <el-tag 
                  v-for="studentId in intervention.targetStudents" 
                  :key="studentId" 
                  size="small"
                  class="student-tag"
                >
                  {{ getStudentName(studentId) }}
                </el-tag>
              </div>
            </div>
            
            <div class="implementation-steps">
              <span class="label">实施步骤:</span>
              <ol class="steps-list">
                <li v-for="step in intervention.implementationSteps" :key="step">
                  {{ step }}
                </li>
              </ol>
            </div>
            
            <div class="intervention-meta">
              <div class="meta-item">
                <span class="meta-label">预期时间:</span>
                <span class="meta-value">{{ intervention.timeframe }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">预期效果:</span>
                <span class="meta-value">{{ intervention.expectedOutcome }}</span>
              </div>
            </div>
          </div>
          
          <div class="intervention-actions">
            <el-button size="small" type="primary" @click="implementIntervention(intervention)">
              立即实施
            </el-button>
            <el-button size="small" @click="scheduleIntervention(intervention)">
              安排计划
            </el-button>
            <el-button size="small" link @click="viewInterventionDetails(intervention)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 班级优化建议 -->
    <div class="class-optimization">
      <div class="section-header">
        <h2>班级构成优化建议</h2>
        <el-button size="small" @click="generateOptimization">
          <el-icon><Operation /></el-icon>
          重新分析
        </el-button>
      </div>
      
      <div class="optimization-content" v-if="optimizedComposition">
        <div class="current-vs-optimized">
          <div class="current-composition">
            <h3>当前班级构成</h3>
            <div class="composition-analysis">
              <div class="balance-score">
                <span class="score-label">平衡度评分:</span>
                <el-rate 
                  :model-value="currentBalanceScore" 
                  :max="5" 
                  disabled 
                  show-score 
                  score-template="{value}/5"
                />
              </div>
              <div class="current-issues">
                <span class="issues-label">主要问题:</span>
                <ul class="issues-list">
                  <li v-for="issue in currentIssues" :key="issue">{{ issue }}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="optimized-composition">
            <h3>AI优化建议</h3>
            <div class="optimization-analysis">
              <div class="balance-score">
                <span class="score-label">优化后评分:</span>
                <el-rate 
                  :model-value="optimizedComposition.balanceScore" 
                  :max="5" 
                  disabled 
                  show-score 
                  score-template="{value}/5"
                />
              </div>
              <div class="optimization-benefits">
                <span class="benefits-label">预期改善:</span>
                <ul class="benefits-list">
                  <li v-for="strength in optimizedComposition.strengths" :key="strength">
                    {{ strength }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="optimization-recommendations">
          <h3>具体调整建议</h3>
          <div class="recommendations-list">
            <div v-for="recommendation in optimizedComposition.recommendations" :key="recommendation" class="recommendation-item">
              <el-icon><Right /></el-icon>
              <span>{{ recommendation }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-icon class="loading-spinner"><Loading /></el-icon>
      <p>AI正在分析班级数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Document,
  Refresh,
  Sunny,
  Bell,
  Sunny as LightIcon,
  User,
  TrendCharts,
  Warning,
  MagicStick,
  Operation,
  Right,
  Loading
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { get, post } from '@/utils/request'
import { CLASS_ENDPOINTS, AI_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 接口定义
interface ClassAtmosphere {
  classId: string
  timestamp: string
  overallMood: 'positive' | 'neutral' | 'negative'
  energyLevel: number
  participationRate: number
  collaborationIndex: number
  attentionLevel: number
  disruptionLevel: number
  conflicts: ConflictEvent[]
  recommendations: string[]
  environmentalFactors?: {
    temperature: number
    noise: number
    lighting: string
    crowding: number
  }
}

interface ConflictEvent {
  id: string
  type: 'behavioral' | 'academic' | 'social' | 'emotional'
  severity: 'low' | 'medium' | 'high' | 'critical'
  participants: string[]
  participantNames: string[]
  description: string
  location: string
  timestamp: string
  suggestedResolution: string
  status: 'pending' | 'resolved' | 'escalated'
  followUpRequired: boolean
}

interface StudentDynamic {
  studentId: string
  studentName: string
  role: 'leader' | 'follower' | 'independent' | 'withdrawn'
  socialConnections: {
    studentId: string
    studentName: string
    relationshipType: 'friend' | 'peer' | 'conflict'
    strength: number
  }[]
  behaviorPatterns: {
    aggression: number
    cooperation: number
    helpfulness: number
    attention: number
  }
  riskFactors: string[]
  interventionNeeds: string[]
}

interface Intervention {
  id: string
  type: 'immediate' | 'short_term' | 'long_term'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  targetStudents: string[]
  implementationSteps: string[]
  expectedOutcome: string
  timeframe: string
  resourcesNeeded: string[]
  successMetrics: string[]
}

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const classId = route.params.id as string
const className = ref('')
const loading = ref(false)
const isConnected = ref(false)

// 页面状态
const socialNetworkChart = ref<HTMLDivElement>()
const lastUpdateTime = ref(new Date())
const wsConnection = ref<WebSocket | null>(null)
let socialNetworkChartInstance: echarts.ECharts | null = null

// 模拟数据（实际开发中会从API获取）
const atmosphere = ref<ClassAtmosphere>({
  classId,
  timestamp: new Date().toISOString(),
  overallMood: 'positive',
  energyLevel: 7,
  participationRate: 85,
  collaborationIndex: 78,
  attentionLevel: 82,
  disruptionLevel: 15,
  conflicts: [
    {
      id: 'c1',
      type: 'social',
      severity: 'medium',
      participants: ['s1', 's2'],
      participantNames: ['小明', '小红'],
      description: '小明和小红在游戏中发生争执，争夺同一个玩具',
      location: '游戏区',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      suggestedResolution: '引导两人轮流使用玩具，教授分享和等待的概念',
      status: 'pending',
      followUpRequired: true
    }
  ],
  recommendations: ['增加合作性游戏', '关注个别学生情绪变化', '调整活动节奏'],
  environmentalFactors: {
    temperature: 23,
    noise: 42,
    lighting: '适宜',
    crowding: 75
  }
})

const studentDynamics = ref<StudentDynamic[]>([
  {
    studentId: 's1',
    studentName: '小明',
    role: 'leader',
    socialConnections: [
      { studentId: 's2', studentName: '小红', relationshipType: 'friend', strength: 8 },
      { studentId: 's3', studentName: '小华', relationshipType: 'peer', strength: 6 }
    ],
    behaviorPatterns: {
      aggression: 2,
      cooperation: 4,
      helpfulness: 4,
      attention: 3
    },
    riskFactors: ['注意力容易分散'],
    interventionNeeds: ['提高专注力训练']
  },
  {
    studentId: 's2',
    studentName: '小红',
    role: 'follower',
    socialConnections: [
      { studentId: 's1', studentName: '小明', relationshipType: 'friend', strength: 8 }
    ],
    behaviorPatterns: {
      aggression: 1,
      cooperation: 5,
      helpfulness: 5,
      attention: 4
    },
    riskFactors: [],
    interventionNeeds: []
  }
])

const interventionSuggestions = ref<Intervention[]>([
  {
    id: 'i1',
    type: 'immediate',
    priority: 'high',
    title: '增强团队合作活动',
    description: '通过设计更多需要合作完成的任务，提升班级整体合作氛围，减少个体竞争带来的冲突',
    targetStudents: ['s1', 's2'],
    implementationSteps: [
      '设计2-3人小组合作任务',
      '建立合作奖励机制',
      '引导学生互相帮助',
      '及时给予正面反馈'
    ],
    expectedOutcome: '班级合作指数提升15%，冲突事件减少30%',
    timeframe: '1-2周',
    resourcesNeeded: ['合作游戏道具', '奖励贴纸'],
    successMetrics: ['合作行为观察记录', '冲突事件统计', '学生反馈调查']
  },
  {
    id: 'i2',
    type: 'short_term',
    priority: 'medium',
    title: '注意力集中训练',
    description: '针对注意力容易分散的学生，设计专门的注意力训练活动',
    targetStudents: ['s1'],
    implementationSteps: [
      '进行注意力评估',
      '设计个性化训练方案',
      '每日10分钟专注练习',
      '记录进步情况'
    ],
    expectedOutcome: '目标学生注意力持续时间延长25%',
    timeframe: '3-4周',
    resourcesNeeded: ['专注力训练教具', '计时器'],
    successMetrics: ['注意力持续时间测量', '课堂表现观察']
  }
])

const predictedConflicts = ref([
  {
    id: 'p1',
    probability: 72,
    type: '资源争夺',
    participants: ['小明', '小华'],
    preventionStrategies: [
      '增加同类玩具数量',
      '建立轮流使用规则',
      '教授等待和分享技巧'
    ]
  }
])

const optimizedComposition = ref({
  id: 'opt1',
  name: '优化方案A',
  students: [],
  teacherId: 't1',
  teacherName: '李老师',
  classroomId: 'room1',
  balanceScore: 4.2,
  strengths: [
    '性格互补性提升20%',
    '学习能力分布更均衡',
    '社交冲突风险降低35%'
  ],
  potentialChallenges: [],
  recommendations: [
    '将性格内向的学生与外向学生搭配',
    '确保每组都有不同能力水平的学生',
    '定期调整座位安排促进新的友谊'
  ]
})

const currentBalanceScore = ref(3.2)
const currentIssues = ref([
  '个别学生过于活跃，影响其他同学',
  '内向学生参与度不够',
  '学习能力差异较大'
])

// 计算属性
const highRiskConflicts = computed(() => {
  return predictedConflicts.value.filter(p => p.probability >= 70)
})

// API 方法
const loadClassInfo = async () => {
  try {
    const response = await get(CLASS_ENDPOINTS.GET_BY_ID(classId))
    if (response.success && response.data) {
      className.value = response.data.className || '智能班级管理'
    } else {
      // 使用模拟数据
      className.value = '大班A'
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    className.value = '大班A'
  }
}

const loadAtmosphereData = async () => {
  loading.value = true
  try {
    const response = await get(AI_ENDPOINTS.CLASS_ATMOSPHERE(classId))
    if (response.success && response.data) {
      atmosphere.value = response.data
      lastUpdateTime.value = new Date()
    } else {
      // 保持模拟数据
      lastUpdateTime.value = new Date()
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    // 降级使用模拟数据
    lastUpdateTime.value = new Date()
  } finally {
    loading.value = false
  }
}

const loadStudentDynamics = async () => {
  try {
    const response = await get(AI_ENDPOINTS.STUDENT_DYNAMICS(classId))
    if (response.success && response.data) {
      studentDynamics.value = response.data
    }
    // 如果没有数据，保持模拟数据
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    // 保持模拟数据
  }
}

const loadInterventions = async () => {
  try {
    const response = await get(AI_ENDPOINTS.INTERVENTION_SUGGESTIONS(classId))
    if (response.success && response.data) {
      interventionSuggestions.value = response.data
    }
    // 如果没有数据，保持模拟数据
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    // 保持模拟数据
  }
}

// 页面方法
const goBack = () => {
  router.go(-1)
}

const refreshData = async () => {
  await Promise.all([
    loadClassInfo(),
    loadAtmosphereData(),
    loadStudentDynamics(),
    loadInterventions()
  ])
  await nextTick()
  initSocialNetworkChart()
  ElMessage.success('数据已刷新')
}

const generateReport = async () => {
  try {
    const response = await post(AI_ENDPOINTS.GENERATE_CLASS_REPORT(classId), {
      includeAtmosphere: true,
      includeConflicts: true,
      includeInterventions: true
    })
    
    if (response.success) {
      ElMessage.success('班级管理报告生成成功')
      // TODO: 处理报告下载
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '生成报告失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

const analyzeStudentInteractions = () => {
  ElMessage.info('开始深度分析学生互动模式...')
}

const showConflictDetails = () => {
  ElMessage.info('查看冲突预警详情')
}

const handleConflict = async (conflict: ConflictEvent) => {
  try {
    await ElMessageBox.confirm(
      `确定要处理冲突"${conflict.description}"吗？`,
      '确认处理',
      { confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    
    ElMessage.success('冲突处理记录已保存')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('处理失败')
    }
  }
}

const escalateConflict = (conflict: ConflictEvent) => {
  ElMessage.info(`冲突已上报给管理层: ${conflict.description}`)
}

const generateInterventions = async () => {
  try {
    const response = await post(AI_ENDPOINTS.GENERATE_INTERVENTIONS(classId), {
      atmosphereData: atmosphere.value,
      studentDynamics: studentDynamics.value
    })
    
    if (response.success && response.data) {
      interventionSuggestions.value = response.data
      ElMessage.success('新的干预建议已生成')
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '生成建议失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

const implementIntervention = async (intervention: Intervention) => {
  try {
    await ElMessageBox.confirm(
      `确定要立即实施"${intervention.title}"吗？`,
      '确认实施',
      { confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    
    const response = await post(AI_ENDPOINTS.IMPLEMENT_INTERVENTION(intervention.id), {
      classId,
      interventionId: intervention.id,
      implementationType: 'immediate'
    })
    
    if (response.success) {
      ElMessage.success('干预措施已开始实施')
      refreshData()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '实施失败'), true)
    }
  } catch (error) {
    if (error !== 'cancel') {
      const errorInfo = ErrorHandler.handle(error, true)
    }
  }
}

const scheduleIntervention = (intervention: Intervention) => {
  ElMessage.info(`已安排干预计划: ${intervention.title}`)
}

const viewInterventionDetails = (intervention: Intervention) => {
  ElMessage.info(`查看干预详情: ${intervention.title}`)
}

const generateOptimization = async () => {
  try {
    const response = await post(AI_ENDPOINTS.GENERATE_CLASS_OPTIMIZATION(classId), {
      currentStudents: studentDynamics.value,
      atmosphereData: atmosphere.value
    })
    
    if (response.success && response.data) {
      optimizedComposition.value = response.data
      ElMessage.success('班级构成优化建议已生成')
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '生成优化建议失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

// 初始化社交网络图
const initSocialNetworkChart = () => {
  if (!socialNetworkChart.value) return
  
  socialNetworkChartInstance = echarts.init(socialNetworkChart.value)
  
  // 构建节点和连接数据
  const nodes = studentDynamics.value.map(student => ({
    id: student.studentId,
    name: student.studentName,
    symbolSize: getRoleSize(student.role),
    itemStyle: {
      color: getRoleColor(student.role)
    },
    label: {
      show: true,
      fontSize: 12
    }
  }))
  
  const links: any[] = []
  studentDynamics.value.forEach(student => {
    student.socialConnections.forEach(connection => {
      links.push({
        source: student.studentId,
        target: connection.studentId,
        lineStyle: {
          width: connection.strength / 2,
          color: getRelationshipColor(connection.relationshipType)
        }
      })
    })
  })
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const student = studentDynamics.value.find(s => s.studentId === params.data.id)
          return `${params.data.name}<br/>角色: ${getRoleText(student?.role || 'independent')}`
        }
        return ''
      }
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        roam: true,
        force: {
          repulsion: 100,
          gravity: 0.1,
          edgeLength: 80
        },
        emphasis: {
          focus: 'adjacency'
        }
      }
    ]
  }
  
  socialNetworkChartInstance.setOption(option)
}

// 初始化WebSocket连接
const initWebSocketConnection = () => {
  try {
    // 模拟WebSocket连接
    const wsUrl = `${AI_ENDPOINTS.WEBSOCKET_BASE}/class/${classId}/atmosphere`
    
    // 在实际环境中会创建真实的WebSocket连接
    // wsConnection.value = new WebSocket(wsUrl)
    
    // 模拟连接状态
    isConnected.value = true
    
    // 定期更新数据
    const updateInterval = setInterval(() => {
      if (isConnected.value) {
        lastUpdateTime.value = new Date()
        // 可以在这里触发数据更新
      }
    }, 30000) // 每30秒更新一次
    
    // 保存interval引用以便清理
    wsConnection.value = { close: () => clearInterval(updateInterval) } as any
    
    console.log('班级氛围监控已启动')
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    isConnected.value = false
  }
}

// 工具函数
const getConnectionStatus = () => {
  return isConnected.value ? 'success' : 'danger'
}

const formatTime = (timestamp: string | Date) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getMoodClass = (mood: string) => {
  return `mood-${mood}`
}

const getMoodIcon = (mood: string) => {
  // 这里需要根据心情返回对应的图标组件
  return 'Sunny' // 简化处理
}

const getMoodText = (mood: string) => {
  const moodMap: Record<string, string> = {
    positive: '积极愉快',
    neutral: '平静正常',
    negative: '需要关注'
  }
  return moodMap[mood] || mood
}

const getEnergyColor = (level: number) => {
  if (level >= 8) return 'var(--success-color)'
  if (level >= 6) return 'var(--warning-color)'
  if (level >= 4) return 'var(--danger-color)'
  return 'var(--info-color)'
}

const getRoleType = (role: string) => {
  const typeMap: Record<string, string> = {
    leader: 'danger',
    follower: 'success',
    independent: 'info',
    withdrawn: 'warning'
  }
  return typeMap[role] || 'info'
}

const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    leader: '领导者',
    follower: '跟随者',
    independent: '独立型',
    withdrawn: '内向型'
  }
  return textMap[role] || role
}

const getRoleSize = (role: string) => {
  const sizeMap: Record<string, number> = {
    leader: 50,
    follower: 35,
    independent: 40,
    withdrawn: 30
  }
  return sizeMap[role] || 35
}

const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    leader: 'var(--danger-color)',
    follower: 'var(--success-color)',
    independent: 'var(--primary-color)',
    withdrawn: 'var(--warning-color)'
  }
  return colorMap[role] || 'var(--info-color)'
}

const getRelationshipColor = (type: string) => {
  const colorMap: Record<string, string> = {
    friend: 'var(--success-color)',
    peer: 'var(--primary-color)',
    conflict: 'var(--danger-color)'
  }
  return colorMap[type] || 'var(--info-color)'
}

const getConflictTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    behavioral: '行为冲突',
    academic: '学习冲突',
    social: '社交冲突',
    emotional: '情感冲突'
  }
  return textMap[type] || type
}

const getSeverityType = (severity: string) => {
  const typeMap: Record<string, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return typeMap[severity] || 'info'
}

const getSeverityText = (severity: string) => {
  const textMap: Record<string, string> = {
    low: '轻微',
    medium: '中等',
    high: '严重',
    critical: '紧急'
  }
  return textMap[severity] || severity
}

const getBadgeType = (count: number) => {
  if (count >= 3) return 'danger'
  if (count >= 1) return 'warning'
  return 'info'
}

const getProbabilityColor = (probability: number) => {
  if (probability >= 80) return 'var(--danger-color)'
  if (probability >= 60) return 'var(--warning-color)'
  return 'var(--success-color)'
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return textMap[priority] || priority
}

const getInterventionTypeStyle = (type: string) => {
  const styleMap: Record<string, string> = {
    immediate: 'danger',
    short_term: 'warning',
    long_term: 'info'
  }
  return styleMap[type] || 'info'
}

const getInterventionTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    immediate: '立即干预',
    short_term: '短期干预',
    long_term: '长期干预'
  }
  return textMap[type] || type
}

const getStudentName = (studentId: string) => {
  const student = studentDynamics.value.find(s => s.studentId === studentId)
  return student?.studentName || studentId
}

// 生命周期
onMounted(async () => {
  await refreshData()
  initWebSocketConnection()
  
  // 响应式处理
  window.addEventListener('resize', () => {
    if (socialNetworkChartInstance) {
      socialNetworkChartInstance.resize()
    }
  })
})

onUnmounted(() => {
  if (wsConnection.value) {
    wsConnection.value.close()
  }
  if (socialNetworkChartInstance) {
    socialNetworkChartInstance.dispose()
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.smart-class-management {
  padding: var(--spacing-lg);
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  background: var(--el-bg-color);
  padding: var(--spacing-lg) var(--text-3xl);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--text-base);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--text-xs);
}

.monitoring-panel,
.student-dynamics,
.conflict-management,
.intervention-suggestions,
.class-optimization {
  background: var(--el-bg-color);
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  margin-bottom: var(--text-3xl);
}

.panel-header,
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  
  h2 {
    font-size: var(--spacing-lg);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.monitoring-status {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  
  .last-update {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
}

.atmosphere-overview {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--text-2xl);
}

.atmosphere-card {
  background: var(--el-bg-color-page);
  padding: var(--text-2xl);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.atmosphere-indicator {
  display: flex;
  align-items: center;
  gap: var(--text-4xl);
}

.mood-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.mood-icon {
  width: var(--avatar-size); height: var(--avatar-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-4xl);
  
  &.mood-positive {
    background: linear-gradient(135deg, var(--success-color), var(--success-light));
    color: white;
  }
  
  &.mood-neutral {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
  }
  
  &.mood-negative {
    background: linear-gradient(135deg, var(--danger-color), var(--danger-light));
    color: white;
  }
}

.mood-text {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.atmosphere-metrics {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
}

.metric-item {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  
  .metric-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    min-width: 60px;
  }
  
  .metric-value {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
    min-width: 40px;
  }
}

.environmental-factors {
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.factors-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--text-base);
}

.factor-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-xs);
  background: var(--el-bg-color);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
  
  .el-icon {
    color: var(--el-color-primary);
    font-size: var(--text-base);
  }
  
  .factor-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
    flex: 1;
  }
  
  .factor-value {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.dynamics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--text-2xl);
}

.dynamics-chart {
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.chart-container {
  height: 300px;
  border: var(--border-width-base) solid var(--el-border-color-lighter);
  border-radius: var(--radius-md);
}

.student-roles {
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
  max-height: 300px;
  overflow-y: auto;
}

.student-role-item {
  background: var(--el-bg-color-page);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.student-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
  
  .student-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.behavior-indicators {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--text-sm);
}

.behavior-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .behavior-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
    min-width: 60px;
  }
}

.risk-factors {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  
  .risk-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
  
  .risk-tag {
    font-size: var(--text-xs);
  }
}

.alert-status {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
}

.conflict-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--text-2xl);
}

.current-conflicts,
.predicted-conflicts {
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.conflicts-list,
.predictions-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
}

.conflict-item,
.prediction-item {
  background: var(--el-bg-color-page);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.conflict-info,
.prediction-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .conflict-type,
  .prediction-type {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.conflict-time {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
}

.conflict-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.conflict-participants,
.prediction-participants {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
  
  .participants-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
  
  .participant-name {
    font-size: var(--text-xs);
    background: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    padding: var(--spacing-sm) 6px;
    border-radius: var(--radius-xs);
  }
}

.conflict-resolution {
  margin-bottom: var(--text-sm);
  
  .resolution-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: block;
    margin-bottom: var(--spacing-xs);
  }
  
  .resolution-text {
    font-size: var(--text-xs);
    color: var(--el-text-color-regular);
    margin: 0;
    line-height: 1.4;
  }
}

.conflict-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.probability-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .probability-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}

.prevention-strategies {
  .strategies-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: block;
    margin-bottom: var(--spacing-xs);
  }
  
  .strategies-list {
    margin: 0;
    padding-left: var(--text-lg);
    
    li {
      font-size: var(--text-xs);
      color: var(--el-text-color-regular);
      margin-bottom: var(--spacing-sm);
    }
  }
}

.interventions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.intervention-card {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.intervention-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--text-sm);
}

.intervention-info {
  flex: 1;
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
}

.intervention-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin: 0 0 var(--text-lg) 0;
  line-height: 1.4;
}

.intervention-details {
  margin-bottom: var(--text-lg);
}

.target-students,
.implementation-steps,
.intervention-meta {
  margin-bottom: var(--text-sm);
  
  .label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: block;
    margin-bottom: var(--spacing-xs);
  }
}

.students-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  
  .student-tag {
    font-size: var(--text-xs);
  }
}

.steps-list {
  margin: 0;
  padding-left: var(--text-lg);
  
  li {
    font-size: var(--text-xs);
    color: var(--el-text-color-regular);
    margin-bottom: var(--spacing-xs);
  }
}

.intervention-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.meta-item {
  .meta-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
  
  .meta-value {
    font-size: var(--text-xs);
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
}

.intervention-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.optimization-content {
  .current-vs-optimized {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--text-2xl);
    margin-bottom: var(--text-3xl);
  }
}

.current-composition,
.optimized-composition {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
  
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.composition-analysis,
.optimization-analysis {
  .balance-score {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--text-lg);
    
    .score-label {
      font-size: var(--text-sm);
      color: var(--el-text-color-primary);
    }
  }
}

.current-issues,
.optimization-benefits {
  .issues-label,
  .benefits-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: block;
    margin-bottom: var(--spacing-sm);
  }
  
  .issues-list,
  .benefits-list {
    margin: 0;
    padding-left: var(--text-lg);
    
    li {
      font-size: var(--text-xs);
      color: var(--el-text-color-regular);
      margin-bottom: var(--spacing-xs);
    }
  }
}

.optimization-recommendations {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
  
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  
  .el-icon {
    color: var(--el-color-primary);
    font-size: var(--text-sm);
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--white-alpha-80);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  p {
    margin-top: var(--text-lg);
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-xl)) {
  .atmosphere-overview {
    grid-template-columns: 1fr;
  }
  
  .dynamics-grid {
    grid-template-columns: 1fr;
  }
  
  .conflict-overview {
    grid-template-columns: 1fr;
  }
  
  .current-vs-optimized {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .smart-class-management {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--text-base);
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .interventions-grid {
    grid-template-columns: 1fr;
  }
  
  .factors-grid {
    grid-template-columns: 1fr;
  }
  
  .intervention-meta {
    grid-template-columns: 1fr;
  }
}
</style>