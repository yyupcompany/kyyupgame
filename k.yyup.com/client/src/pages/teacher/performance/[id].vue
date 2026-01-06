<template>
  <div class="teacher-performance-analytics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <UnifiedIcon name="ArrowLeft" />
          返回
        </el-button>
        <h1 class="page-title">{{ teacherName }} - 智能效能分析</h1>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="generateReport">
          <UnifiedIcon name="default" />
          生成报告
        </el-button>
        <el-button @click="refreshAnalysis">
          <UnifiedIcon name="Refresh" />
          刷新分析
        </el-button>
      </div>
    </div>

    <!-- 教师效能总览 -->
    <div class="performance-overview">
      <div class="performance-score-card">
        <div class="score-ring">
          <svg viewBox="0 0 100 100" class="circular-progress">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#e6e6e6" 
              stroke-width="10"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="var(--primary-color)" 
              stroke-width="10"
              stroke-linecap="round"
              :stroke-dasharray="progressDashArray"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div class="score-content">
            <span class="score-value">{{ performanceScore }}</span>
            <span class="score-label">综合评分</span>
          </div>
        </div>
        <div class="performance-metrics">
          <div class="metric" v-for="metric in performanceMetrics" :key="metric.key">
            <span class="metric-label">{{ metric.label }}</span>
            <div class="metric-value">
              <span class="value">{{ metric.value }}</span>
              <UnifiedIcon name="default" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI教学分析 -->
    <div class="teaching-analysis">
      <div class="section-header">
        <h3>AI教学质量分析</h3>
        <el-tag type="info" size="small">基于多维度数据分析</el-tag>
      </div>
      
      <div class="analysis-grid">
        <div class="analysis-card">
          <h4>教学方法效果</h4>
          <div ref="teachingMethodChart" class="chart"></div>
          <div class="insights">
            <h5>AI洞察</h5>
            <div class="insight-list">
              <div class="insight-item" v-for="insight in teachingInsights" :key="insight.id">
                <div class="insight-header">
                  <span class="insight-title">{{ insight.title }}</span>
                  <el-tag :type="getImpactType(insight.impact)" size="small">
                    {{ getImpactText(insight.impact) }}
                  </el-tag>
                </div>
                <p class="insight-text">{{ insight.text }}</p>
                <div class="insight-actions" v-if="insight.actionRequired">
                  <el-button size="small" type="primary" @click="viewInsightDetails(insight)">
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analysis-card">
          <h4>学生参与度分析</h4>
          <div ref="engagementChart" class="chart"></div>
          <div class="engagement-tips">
            <h5>提升建议</h5>
            <ul class="tips-list">
              <li v-for="tip in engagementTips" :key="tip.id" class="tip-item">
                <div class="tip-header">
                  <span class="tip-title">{{ tip.suggestion }}</span>
                  <el-tag :type="getDifficultyType(tip.difficulty)" size="small">
                    {{ getDifficultyText(tip.difficulty) }}
                  </el-tag>
                </div>
                <p class="tip-implementation">{{ tip.implementation }}</p>
                <p class="tip-improvement">预期提升: {{ tip.expectedImprovement }}</p>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="analysis-card">
          <h4>课程设计优化</h4>
          <div class="course-optimization">
            <div v-for="optimization in courseOptimizations" :key="optimization.id" class="optimization-item">
              <div class="optimization-header">
                <h5 class="optimization-title">{{ optimization.title }}</h5>
                <el-tag type="warning" size="small">建议优化</el-tag>
              </div>
              <div class="optimization-content">
                <div class="current-method">
                  <span class="label">当前方法:</span>
                  <span class="content">{{ optimization.currentMethod }}</span>
                </div>
                <div class="suggested-method">
                  <span class="label">建议方法:</span>
                  <span class="content">{{ optimization.suggestedMethod }}</span>
                </div>
                <div class="optimization-reason">
                  <span class="label">优化原因:</span>
                  <span class="content">{{ optimization.reason }}</span>
                </div>
                <div class="optimization-impact">
                  <span class="label">预期提升:</span>
                  <span class="content highlight">{{ optimization.expectedImprovement }}</span>
                </div>
              </div>
              <div class="optimization-actions">
                <el-button size="small" type="primary" @click="applyCourseOptimization(optimization)">
                  应用建议
                </el-button>
                <el-button size="small" @click="viewOptimizationDetails(optimization)">
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 个性化专业发展计划 -->
    <div class="professional-development">
      <div class="section-header">
        <h3>个性化专业发展计划</h3>
        <el-button size="small" type="primary" @click="generateNewDevelopmentPlan">
          <UnifiedIcon name="Plus" />
          生成新计划
        </el-button>
      </div>
      
      <div class="development-timeline">
        <div v-for="(phase, index) in developmentPlan" :key="phase.id" class="phase-item">
          <div class="phase-number">{{ index + 1 }}</div>
          <div class="phase-content">
            <div class="phase-header">
              <h4>{{ phase.title }}</h4>
              <span class="phase-duration">{{ phase.duration }}</span>
            </div>
            <p class="phase-description">{{ phase.description }}</p>
            
            <div class="phase-details">
              <div class="objectives">
                <h5>学习目标</h5>
                <ul>
                  <li v-for="objective in phase.objectives" :key="objective">
                    {{ objective }}
                  </li>
                </ul>
              </div>
              
              <div class="resources">
                <h5>推荐资源</h5>
                <div class="resource-list">
                  <div v-for="resource in phase.resources" :key="resource.id" class="resource-item">
                    <div class="resource-info">
                      <span class="resource-type">{{ getResourceTypeName(resource.type) }}</span>
                      <span class="resource-title">{{ resource.title }}</span>
                      <span class="resource-provider">{{ resource.provider }}</span>
                    </div>
                    <div class="resource-meta">
                      <span v-if="resource.duration" class="resource-duration">{{ resource.duration }}</span>
                      <span v-if="resource.cost" class="resource-cost">{{ resource.cost }}</span>
                    </div>
                    <div class="resource-actions">
                      <el-button size="small" link @click="openResource(resource)">查看</el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="milestones">
                <h5>关键里程碑</h5>
                <div class="milestone-list">
                  <div v-for="milestone in phase.milestones" :key="milestone" class="milestone-item">
                    <UnifiedIcon name="default" />
                    <span>{{ milestone }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能排课建议 -->
    <div class="schedule-optimization">
      <div class="section-header">
        <h3>智能排课建议</h3>
        <el-button size="small" @click="optimizeSchedule">
          <UnifiedIcon name="default" />
          生成优化方案
        </el-button>
      </div>
      
      <div class="schedule-grid">
        <div class="current-schedule">
          <h4>当前课表</h4>
          <div class="schedule-table">
            <div class="schedule-header">
              <div class="time-column">时间</div>
              <div class="day-column" v-for="day in weekDays" :key="day">{{ day }}</div>
            </div>
            <div class="schedule-body">
              <div v-for="timeSlot in timeSlots" :key="timeSlot.time" class="schedule-row">
                <div class="time-cell">{{ timeSlot.time }}</div>
                <div v-for="day in weekDays" :key="day" class="schedule-cell">
                  <div v-if="getCurrentScheduleItem(day, timeSlot.time)" class="schedule-item">
                    {{ getCurrentScheduleItem(day, timeSlot.time) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="optimized-schedule">
          <h4>AI优化建议</h4>
          <div class="optimization-suggestions">
            <div v-for="suggestion in scheduleOptimizations" :key="suggestion.id" class="suggestion-item">
              <div class="suggestion-header">
                <h5 class="suggestion-title">{{ suggestion.title }}</h5>
                <el-tag type="primary" size="small">智能推荐</el-tag>
              </div>
              <div class="suggestion-content">
                <div class="suggestion-reason">
                  <span class="label">优化原因:</span>
                  <span class="content">{{ suggestion.reason }}</span>
                </div>
                <div class="suggestion-impact">
                  <span class="label">预期效果:</span>
                  <span class="content highlight">{{ suggestion.impact }}</span>
                </div>
                <div class="current-schedule-info">
                  <span class="label">当前安排:</span>
                  <span class="content">{{ suggestion.currentSchedule }}</span>
                </div>
                <div class="suggested-schedule-info">
                  <span class="label">建议调整:</span>
                  <span class="content">{{ suggestion.suggestedSchedule }}</span>
                </div>
              </div>
              <div class="suggestion-actions">
                <el-button size="small" type="primary" @click="applyScheduleOptimization(suggestion)">
                  应用建议
                </el-button>
                <el-button size="small" @click="previewScheduleChange(suggestion)">
                  预览效果
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成长记录和反馈 -->
    <div class="growth-feedback">
      <div class="section-header">
        <h3>专业成长记录</h3>
        <el-button size="small" @click="addGrowthRecord">
          <UnifiedIcon name="Edit" />
          添加记录
        </el-button>
      </div>
      
      <div class="feedback-content">
        <div class="strengths-areas">
          <div class="strengths">
            <h4>核心优势</h4>
            <div class="strengths-list">
              <div v-for="strength in teacherStrengths" :key="strength" class="strength-item">
                <UnifiedIcon name="Check" />
                <span>{{ strength }}</span>
              </div>
            </div>
          </div>
          
          <div class="improvement-areas">
            <h4>改进方向</h4>
            <div class="improvement-list">
              <div v-for="area in improvementAreas" :key="area" class="improvement-item">
                <UnifiedIcon name="default" />
                <span>{{ area }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="next-review">
          <h4>下次评估</h4>
          <div class="review-info">
            <div class="review-date">
              <UnifiedIcon name="default" />
              <span>{{ nextReviewDate }}</span>
            </div>
            <div class="review-focus">
              <span class="label">重点关注:</span>
              <span class="content">课堂互动技巧、学生参与度提升</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay" v-loading="loading">
      <p>AI正在分析教师数据...</p>
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
  Plus,
  Flag,
  Calendar,
  Edit,
  Check,
  Warning,
  ArrowUp, 
  ArrowDown, 
  Minus 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useTeacherPerformanceAnalytics } from '@/composables/useTeacherPerformanceAnalytics'
import type { 
  TeacherPerformanceAnalysis,
  TeachingInsight,
  EngagementTip,
  CourseOptimization,
  DevelopmentPhase,
  ScheduleOptimization
} from '@/types/ai-business-plus'

// 路由
const route = useRoute()
const router = useRouter()

// 教师ID
const teacherId = route.params.id as string
const teacherName = ref('李老师') // 这里应该从API获取

// 使用智能分析组合式函数
const {
  analysis,
  loading,
  analyzeTeacherPerformance,
  generateDevelopmentPlan,
  optimizeTeacherSchedule
} = useTeacherPerformanceAnalytics(teacherId)

// 页面状态
const teachingMethodChart = ref<HTMLDivElement>()
const engagementChart = ref<HTMLDivElement>()

// 教师效能数据
const performanceScore = ref(87)
const performanceMetrics = ref([
  { key: 'studentSatisfaction', label: '学生满意度', value: '92%', trend: 'up' },
  { key: 'lessonQuality', label: '课程质量', value: '89%', trend: 'up' },
  { key: 'classroomManagement', label: '课堂管理', value: '85%', trend: 'stable' },
  { key: 'parentCommunication', label: '家长沟通', value: '91%', trend: 'up' }
])

const teachingInsights = ref<TeachingInsight[]>([
  {
    id: '1',
    category: 'method',
    title: '互动教学效果显著',
    text: '采用问答式教学方法，学生参与度提升了15%。建议继续加强互动元素。',
    impact: 'high',
    actionRequired: false,
    suggestions: ['增加小组讨论', '使用互动游戏']
  },
  {
    id: '2',
    category: 'engagement',
    title: '注意力保持需要改善',
    text: '课程中后段学生注意力下降明显，建议调整教学节奏和增加活动环节。',
    impact: 'medium',
    actionRequired: true,
    suggestions: ['增加中段休息', '穿插互动活动']
  }
])

const engagementTips = ref<EngagementTip[]>([
  {
    id: '1',
    category: 'attention',
    suggestion: '使用视觉辅助工具',
    implementation: '在讲解概念时配合图片、动画等视觉元素',
    expectedImprovement: '注意力提升20%',
    difficulty: 'easy'
  },
  {
    id: '2',
    category: 'participation',
    suggestion: '实施积分奖励系统',
    implementation: '为积极参与的学生给予积分奖励，定期兑换小礼品',
    expectedImprovement: '参与度提升25%',
    difficulty: 'medium'
  }
])

const courseOptimizations = ref<CourseOptimization[]>([
  {
    id: '1',
    title: '数学课程结构优化',
    currentMethod: '传统讲授式教学',
    suggestedMethod: '游戏化学习结合实物操作',
    reason: '幼儿更适合通过具体操作和游戏来理解抽象概念',
    expectedImprovement: '理解率提升30%',
    implementationSteps: [
      '准备数学操作教具',
      '设计游戏化学习环节',
      '制定分组活动方案'
    ],
    requiredResources: ['计数玩具', '形状拼图', '数字卡片'],
    timeToImplement: '2周'
  }
])

const developmentPlan = ref<DevelopmentPhase[]>([
  {
    id: '1',
    title: '互动教学技能提升',
    description: '学习和掌握先进的互动教学方法，提高课堂参与度',
    duration: '4周',
    objectives: [
      '掌握5种新的互动教学技巧',
      '提高学生课堂参与度至85%以上',
      '学会使用数字化教学工具'
    ],
    resources: [
      {
        id: 'r1',
        type: 'course',
        title: '幼儿园互动教学法',
        provider: '教育学院',
        duration: '16小时',
        cost: '免费'
      },
      {
        id: 'r2',
        type: 'book',
        title: '游戏化教学设计',
        provider: '教育出版社',
        url: 'https://example.com/book',
        cost: '58元'
      }
    ],
    assessmentCriteria: [
      '完成互动教学技巧测试',
      '课堂观察评分达到优秀',
      '学生参与度数据显示改善'
    ],
    milestones: [
      '完成理论学习',
      '实践第一个互动技巧',
      '学生反馈收集',
      '技能评估通过'
    ]
  }
])

const scheduleOptimizations = ref<ScheduleOptimization[]>([
  {
    id: '1',
    title: '午休后安排调整',
    currentSchedule: '午休后立即进行数学课',
    suggestedSchedule: '午休后先进行音乐活动，再进行数学课',
    reason: '午休后学生需要缓冲时间，音乐活动有助于提神和集中注意力',
    impact: '学习效果提升20%，学生满意度提升15%',
    conflictResolution: ['与音乐老师协调时间', '调整教室安排'],
    resourceRequirements: ['音响设备', '活动空间']
  }
])

// 课表相关数据
const weekDays = ['周一', '周二', '周三', '周四', '周五']
const timeSlots = [
  { time: '09:00-09:30' },
  { time: '09:30-10:00' },
  { time: '10:30-11:00' },
  { time: '11:00-11:30' },
  { time: '14:30-15:00' },
  { time: '15:00-15:30' }
]

const teacherStrengths = ref([
  '课堂组织能力强',
  '与学生互动良好',
  '教学内容准备充分',
  '富有耐心和爱心'
])

const improvementAreas = ref([
  '数字化教学工具使用',
  '差异化教学方法',
  '课堂时间管理',
  '家长沟通技巧'
])

const nextReviewDate = ref('2025-08-15')

// 计算属性
const progressDashArray = computed(() => {
  const circumference = 2 * Math.PI * 45
  const progress = (performanceScore.value / 100) * circumference
  return `${progress} ${circumference - progress}`
})

// 页面方法
const goBack = () => {
  router.go(-1)
}

const refreshAnalysis = async () => {
  await analyzeTeacherPerformance()
  ElMessage.success('分析数据已刷新')
}

const generateReport = () => {
  ElMessage.info('正在生成分析报告...')
}

const generateNewDevelopmentPlan = async () => {
  try {
    const plan = await generateDevelopmentPlan()
    if (plan) {
      ElMessage.success('新的专业发展计划已生成')
    }
  } catch (error) {
    ElMessage.error('生成发展计划失败')
  }
}

const optimizeSchedule = async () => {
  try {
    const optimizations = await optimizeTeacherSchedule()
    if (optimizations) {
      scheduleOptimizations.value = optimizations
      ElMessage.success('智能排课优化建议已生成')
    }
  } catch (error) {
    ElMessage.error('生成排课建议失败')
  }
}

const applyCourseOptimization = async (optimization: CourseOptimization) => {
  try {
    await ElMessageBox.confirm(
      `确定要应用"${optimization.title}"的优化建议吗？`,
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    
    ElMessage.success('优化建议已应用，将在下节课生效')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('应用失败')
    }
  }
}

const applyScheduleOptimization = async (suggestion: ScheduleOptimization) => {
  try {
    await ElMessageBox.confirm(
      `确定要应用"${suggestion.title}"的排课建议吗？`,
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    
    ElMessage.success('排课已优化，新安排将在下周生效')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('优化失败')
    }
  }
}

const viewInsightDetails = (insight: TeachingInsight) => {
  ElMessage.info(`查看洞察详情: ${insight.title}`)
}

const viewOptimizationDetails = (optimization: CourseOptimization) => {
  ElMessage.info(`查看优化详情: ${optimization.title}`)
}

const previewScheduleChange = (suggestion: ScheduleOptimization) => {
  ElMessage.info(`预览排课变更: ${suggestion.title}`)
}

const openResource = (resource: any) => {
  if (resource.url) {
    window.open(resource.url, '_blank')
  } else {
    ElMessage.info(`查看资源: ${resource.title}`)
  }
}

const addGrowthRecord = () => {
  ElMessage.info('添加成长记录功能开发中')
}

const getCurrentScheduleItem = (day: string, time: string) => {
  // 这里应该返回实际的课程安排
  const mockSchedule: Record<string, Record<string, string>> = {
    '周一': {
      '09:00-09:30': '数学',
      '09:30-10:00': '语言',
      '14:30-15:00': '音乐'
    },
    '周二': {
      '09:00-09:30': '科学',
      '10:30-11:00': '美术'
    }
  }
  return mockSchedule[day]?.[time] || ''
}

// 初始化图表
const initTeachingMethodChart = () => {
  if (!teachingMethodChart.value) return
  
  const chart = echarts.init(teachingMethodChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['讲授法', '讨论法', '游戏法', '实践法', '多媒体']
    },
    yAxis: {
      type: 'value',
      name: '效果评分'
    },
    series: [
      {
        data: [75, 88, 92, 85, 78],
        type: 'bar',
        itemStyle: {
          color: 'var(--primary-color)'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

const initEngagementChart = () => {
  if (!engagementChart.value) return
  
  const chart = echarts.init(engagementChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: '积极参与' },
          { value: 40, name: '一般参与' },
          { value: 20, name: '被动参与' },
          { value: 5, name: '不参与' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'var(--shadow-heavy)'
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 工具函数
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return ArrowUp
    case 'down': return ArrowDown
    default: return Minus
  }
}

const getTrendClass = (trend: string) => {
  return {
    'trend-up': trend === 'up',
    'trend-down': trend === 'down',
    'trend-stable': trend === 'stable'
  }
}

const getImpactType = (impact: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[impact] || 'info'
}

const getImpactText = (impact: string) => {
  const textMap: Record<string, string> = {
    high: '高影响',
    medium: '中影响',
    low: '低影响'
  }
  return textMap[impact] || impact
}

const getDifficultyType = (difficulty: string) => {
  const typeMap: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return typeMap[difficulty] || 'info'
}

const getDifficultyText = (difficulty: string) => {
  const textMap: Record<string, string> = {
    easy: '容易实施',
    medium: '中等难度',
    hard: '实施困难'
  }
  return textMap[difficulty] || difficulty
}

const getResourceTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    course: '课程',
    book: '书籍',
    workshop: '工作坊',
    webinar: '网络研讨',
    certification: '认证'
  }
  return nameMap[type] || type
}

// 防抖函数
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 图表重绘函数
const resizeCharts = debounce(() => {
  if (teachingMethodChart.value) {
    echarts.getInstanceByDom(teachingMethodChart.value)?.resize()
  }
  if (engagementChart.value) {
    echarts.getInstanceByDom(engagementChart.value)?.resize()
  }
}, 100)

// 生命周期
onMounted(async () => {
  await analyzeTeacherPerformance()
  await nextTick()
  initTeachingMethodChart()
  initEngagementChart()
  
  // 响应式处理
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  // 清理resize事件监听器
  window.removeEventListener('resize', resizeCharts)
  
  // 清理ECharts实例
  if (teachingMethodChart.value) {
    echarts.getInstanceByDom(teachingMethodChart.value)?.dispose()
  }
  if (engagementChart.value) {
    echarts.getInstanceByDom(engagementChart.value)?.dispose()
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.teacher-performance-analytics {
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

.performance-overview {
  margin-bottom: var(--text-3xl);
}

.performance-score-card {
  background: var(--el-bg-color);
  padding: var(--text-4xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-5xl);
}

.score-ring {
  position: relative;
  max-width: 200px; width: 100%;
  min-height: 60px; height: auto;
  flex-shrink: 0;
}

.circular-progress {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value {
  display: block;
  font-size: var(--text-5xl);
  font-weight: 700;
  color: var(--el-color-primary);
  line-height: 1;
}

.score-label {
  font-size: var(--text-base);
  color: var(--el-text-color-secondary);
  margin-top: var(--spacing-sm);
}

.performance-metrics {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--text-2xl);
}

.metric {
  .metric-label {
    display: block;
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    margin-bottom: var(--spacing-sm);
  }
}

.metric-value {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .value {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .el-icon {
    font-size: var(--spacing-lg);
    
    &.trend-up {
      color: var(--el-color-success);
    }
    
    &.trend-down {
      color: var(--el-color-danger);
    }
    
    &.trend-stable {
      color: var(--el-color-info);
    }
  }
}

.teaching-analysis,
.professional-development,
.schedule-optimization,
.growth-feedback {
  background: var(--el-bg-color);
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  margin-bottom: var(--text-3xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  
  h3 {
    font-size: var(--spacing-lg);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--text-2xl);
}

.analysis-card {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.chart {
  min-height: 60px; height: auto;
  margin-bottom: var(--text-lg);
}

.insights {
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }
}

.insight-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.insight-item {
  background: var(--el-bg-color);
  padding: var(--text-xs);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  .insight-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.insight-text {
  font-size: var(--text-xs);
  color: var(--el-text-color-regular);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.insight-actions {
  display: flex;
  justify-content: flex-end;
}

.engagement-tips {
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }
}

.tips-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.tip-item {
  background: var(--el-bg-color);
  padding: var(--text-xs);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

.tip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  .tip-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.tip-implementation,
.tip-improvement {
  font-size: var(--text-xs);
  color: var(--el-text-color-regular);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.4;
}

.course-optimization {
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
}

.optimization-item {
  background: var(--el-bg-color);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

.optimization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
  
  .optimization-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.optimization-content {
  margin-bottom: var(--text-sm);
  
  > div {
    margin-bottom: var(--spacing-lg);
    font-size: var(--text-xs);
    
    .label {
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-right: var(--spacing-sm);
    }
    
    .content {
      color: var(--el-text-color-regular);
      
      &.highlight {
        color: var(--el-color-primary);
        font-weight: 600;
      }
    }
  }
}

.optimization-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.development-timeline {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: var(--text-3xl);
    top: 0;
    bottom: 0;
    width: auto;
    background: var(--el-border-color);
  }
}

.phase-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
  position: relative;
}

.phase-number {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: 600;
  flex-shrink: 0;
  z-index: var(--z-index-dropdown);
}

.phase-content {
  flex: 1;
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
  
  .phase-duration {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.phase-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin: 0 0 var(--text-lg) 0;
  line-height: 1.4;
}

.phase-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-base);
}

.objectives,
.resources,
.milestones {
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
  
  ul {
    margin: 0;
    padding-left: var(--text-lg);
    
    li {
      font-size: var(--text-sm);
      color: var(--el-text-color-regular);
      margin-bottom: var(--spacing-xs);
    }
  }
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.resource-item {
  background: var(--el-bg-color);
  padding: var(--spacing-sm);
  border-radius: var(--spacing-xs);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-sm);
  align-items: center;
}

.resource-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  
  .resource-type {
    font-size: var(--spacing-sm);
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
  }
  
  .resource-title {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .resource-provider {
    font-size: var(--text-xs);
    color: var(--el-text-color-regular);
  }
}

.resource-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  text-align: right;
  
  .resource-duration,
  .resource-cost {
    font-size: var(--spacing-sm);
    color: var(--el-text-color-secondary);
  }
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  
  .el-icon {
    color: var(--el-color-warning);
    font-size: var(--text-sm);
  }
}

.schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--text-2xl);
}

.current-schedule,
.optimized-schedule {
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.schedule-table {
  border: var(--border-width-base) solid var(--el-border-color);
  border-radius: var(--radius-md);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.schedule-header {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  background: var(--el-bg-color-page);
  border-bottom: var(--z-index-dropdown) solid var(--el-border-color);
}

.time-column,
.day-column {
  padding: var(--spacing-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-align: center;
  border-right: var(--z-index-dropdown) solid var(--el-border-color);
  
  &:last-child {
    border-right: none;
  }
}

.schedule-body {
  display: flex;
  flex-direction: column;
}

.schedule-row {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  border-bottom: var(--z-index-dropdown) solid var(--el-border-color-lighter);
  
  &:last-child {
    border-bottom: none;
  }
}

.time-cell,
.schedule-cell {
  padding: var(--spacing-sm);
  font-size: var(--text-xs);
  border-right: var(--z-index-dropdown) solid var(--el-border-color-lighter);
  min-height: var(--button-height-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:last-child {
    border-right: none;
  }
}

.time-cell {
  background: var(--el-bg-color-page);
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.schedule-item {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  padding: var(--spacing-sm) 6px;
  border-radius: var(--radius-xs);
  font-size: var(--spacing-sm);
  text-align: center;
}

.optimization-suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
}

.suggestion-item {
  background: var(--el-bg-color-page);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
  
  .suggestion-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.suggestion-content {
  margin-bottom: var(--text-sm);
  
  > div {
    margin-bottom: var(--spacing-lg);
    font-size: var(--text-xs);
    
    .label {
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-right: var(--spacing-sm);
    }
    
    .content {
      color: var(--el-text-color-regular);
      
      &.highlight {
        color: var(--el-color-primary);
        font-weight: 600;
      }
    }
  }
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.feedback-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--text-2xl);
}

.strengths-areas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.strengths,
.improvement-areas {
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }
}

.strengths-list,
.improvement-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.strength-item,
.improvement-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  
  .el-icon {
    font-size: var(--text-base);
  }
}

.strength-item .el-icon {
  color: var(--el-color-success);
}

.improvement-item .el-icon {
  color: var(--el-color-warning);
}

.next-review {
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }
}

.review-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.review-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--el-text-color-primary);
  
  .el-icon {
    color: var(--el-color-primary);
  }
}

.review-focus {
  font-size: var(--text-sm);
  
  .label {
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-right: var(--spacing-sm);
  }
  
  .content {
    color: var(--el-text-color-regular);
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
  z-index: 1000px;
  
  p {
    margin-top: var(--text-lg);
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-xl)) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .schedule-grid {
    grid-template-columns: 1fr;
  }
  
  .feedback-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .teacher-performance-analytics {
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
  
  .performance-score-card {
    flex-direction: column;
    text-align: center;
    gap: var(--text-2xl);
  }
  
  .performance-metrics {
    grid-template-columns: 1fr;
    width: 100%;
  }
  
  .phase-details {
    grid-template-columns: 1fr;
  }
  
  .strengths-areas {
    grid-template-columns: 1fr;
  }
  
  .schedule-header,
  .schedule-row {
    grid-template-columns: 80px repeat(3, 1fr);
  }
}
</style>