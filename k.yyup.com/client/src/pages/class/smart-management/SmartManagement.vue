<template>
  <div class="page-container">
    <page-header title="AI智能班级管理">
      <template #actions>
        <el-button @click="refreshData" :loading="loading">
          <UnifiedIcon name="Refresh" />
          刷新数据
        </el-button>
        <el-button @click="toggleRealTimeMode" :type="realTimeMode ? 'danger' : 'primary'">
          <el-icon><VideoCamera v-if="!realTimeMode" /><VideoPause v-else /></el-icon>
          {{ realTimeMode ? '停止监控' : '开启实时监控' }}
        </el-button>
        <el-button @click="exportAIReport" type="success" :loading="exporting">
          <UnifiedIcon name="default" />
          导出AI报告
        </el-button>
      </template>
    </page-header>

    <div class="smart-management-content" v-loading="loading" element-loading-text="正在加载AI分析数据...">
      <!-- AI分析概览 -->
      <el-row :gutter="20" class="ai-overview">
        <el-col :span="6">
          <el-card class="ai-metric-card learning">
            <div class="metric-content">
              <div class="metric-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ aiMetrics.learningIndex }}</div>
                <div class="metric-label">学习指数</div>
                <div class="metric-trend" :class="getTrendClass(aiMetrics.learningTrend)">
                  <el-icon><ArrowUp v-if="aiMetrics.learningTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(aiMetrics.learningTrend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="ai-metric-card attention">
            <div class="metric-content">
              <div class="metric-icon">
                <UnifiedIcon name="eye" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ aiMetrics.attentionLevel }}%</div>
                <div class="metric-label">专注度</div>
                <div class="metric-trend" :class="getTrendClass(aiMetrics.attentionTrend)">
                  <el-icon><ArrowUp v-if="aiMetrics.attentionTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(aiMetrics.attentionTrend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="ai-metric-card emotion">
            <div class="metric-content">
              <div class="metric-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ aiMetrics.emotionScore }}</div>
                <div class="metric-label">情绪状态</div>
                <div class="metric-trend" :class="getTrendClass(aiMetrics.emotionTrend)">
                  <el-icon><ArrowUp v-if="aiMetrics.emotionTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(aiMetrics.emotionTrend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="ai-metric-card interaction">
            <div class="metric-content">
              <div class="metric-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ aiMetrics.interactionRate }}%</div>
                <div class="metric-label">互动率</div>
                <div class="metric-trend" :class="getTrendClass(aiMetrics.interactionTrend)">
                  <el-icon><ArrowUp v-if="aiMetrics.interactionTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(aiMetrics.interactionTrend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- AI智能建议 -->
      <el-card class="ai-suggestions-card">
        <template #header>
          <div class="card-header">
            <span>AI智能建议</span>
            <div class="header-actions">
              <el-select v-model="selectedSuggestionType" size="small" style="max-width: 150px; width: 100%">
                <el-option label="全部建议" value="all" />
                <el-option label="学习优化" value="learning" />
                <el-option label="行为引导" value="behavior" />
                <el-option label="环境调整" value="environment" />
                <el-option label="课程安排" value="curriculum" />
              </el-select>
              <el-button size="small" @click="applyAllSuggestions" type="primary" :disabled="filteredSuggestions.length === 0">
                <UnifiedIcon name="Check" />
                应用全部
              </el-button>
            </div>
          </div>
        </template>

        <div class="suggestions-grid">
          <div 
            v-for="suggestion in filteredSuggestions" 
            :key="suggestion.id"
            class="suggestion-card"
            :class="`priority-${suggestion.priority}`"
          >
            <div class="suggestion-header">
              <div class="suggestion-badges">
                <el-tag :type="getSuggestionTypeColor(suggestion.type)" size="small">
                  {{ getSuggestionTypeLabel(suggestion.type) }}
                </el-tag>
                <el-tag :type="getPriorityColor(suggestion.priority)" size="small">
                  {{ getPriorityLabel(suggestion.priority) }}
                </el-tag>
              </div>
              <div class="ai-confidence">
                AI信心度: {{ suggestion.confidence }}%
              </div>
            </div>
            <div class="suggestion-content">
              <h4>{{ suggestion.title }}</h4>
              <p>{{ suggestion.description }}</p>
              <div class="suggestion-details">
                <div class="expected-impact">
                  <span>预期效果: </span>
                  <span class="impact-value">+{{ suggestion.expectedImprovement }}%</span>
                </div>
                <div class="affected-students" v-if="suggestion.affectedStudents.length > 0">
                  <span>涉及学生: </span>
                  <el-tag 
                    v-for="studentId in suggestion.affectedStudents.slice(0, 3)" 
                    :key="studentId"
                    size="small"
                    style="margin-right: var(--spacing-base)"
                  >
                    {{ getStudentName(studentId) }}
                  </el-tag>
                  <span v-if="suggestion.affectedStudents.length > 3" class="more-students">
                    等{{ suggestion.affectedStudents.length }}人
                  </span>
                </div>
              </div>
            </div>
            <div class="suggestion-actions">
              <el-button size="small" @click="previewSuggestion(suggestion)">
                <UnifiedIcon name="eye" />
                预览
              </el-button>
              <el-button size="small" type="primary" @click="applySuggestion(suggestion)">
                <UnifiedIcon name="Check" />
                应用
              </el-button>
              <el-button size="small" type="info" @click="postponeSuggestion(suggestion)">
                <UnifiedIcon name="default" />
                稍后
              </el-button>
              <el-button size="small" type="danger" @click="dismissSuggestion(suggestion)">
                <UnifiedIcon name="Close" />
                忽略
              </el-button>
            </div>
          </div>
        </div>

        <el-empty v-if="filteredSuggestions.length === 0" description="暂无AI建议" />
      </el-card>

      <!-- 实时监控面板 -->
      <el-card class="real-time-monitoring-card">
        <template #header>
          <div class="card-header">
            <span>实时AI监控</span>
            <div class="monitoring-status">
              <el-tag :type="realTimeMode ? 'success' : 'info'" size="small">
                {{ realTimeMode ? '监控中' : '已停止' }}
              </el-tag>
              <span class="last-update">最后更新: {{ lastUpdateTime }}</span>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="monitoring-section">
              <h4>学生状态分析</h4>
              <div class="student-monitoring">
                <div 
                  v-for="student in monitoringData.students" 
                  :key="student.id"
                  class="student-monitor-item"
                >
                  <div class="student-avatar">
                    <el-avatar :size="40" :src="student.avatar">{{ student.name.charAt(0) }}</el-avatar>
                  </div>
                  <div class="student-status">
                    <div class="student-name">{{ student.name }}</div>
                    <div class="status-indicators">
                      <div class="status-item">
                        <span class="status-label">专注:</span>
                        <el-progress 
                          :percentage="student.attention" 
                          :color="getAttentionColor(student.attention)"
                          :show-text="false"
                          :stroke-width="6"
                        />
                      </div>
                      <div class="status-item">
                        <span class="status-label">参与:</span>
                        <el-progress 
                          :percentage="student.participation" 
                          :color="getParticipationColor(student.participation)"
                          :show-text="false"
                          :stroke-width="6"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="student-alerts">
                    <el-tag 
                      v-if="student.needsAttention" 
                      type="warning" 
                      size="small"
                      effect="dark"
                    >
                      需关注
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="monitoring-section">
              <h4>课堂环境监测</h4>
              <div class="environment-monitoring">
                <div class="env-metric">
                  <div class="env-label">噪音水平</div>
                  <div class="env-gauge">
                    <el-progress 
                      type="circle" 
                      :percentage="monitoringData.environment.noiseLevel"
                      :color="getNoiseColor(monitoringData.environment.noiseLevel)"
                      :width="80"
                    />
                  </div>
                  <div class="env-status">{{ getNoiseStatus(monitoringData.environment.noiseLevel) }}</div>
                </div>
                <div class="env-metric">
                  <div class="env-label">光照强度</div>
                  <div class="env-gauge">
                    <el-progress 
                      type="circle" 
                      :percentage="monitoringData.environment.lightLevel"
                      :color="getLightColor(monitoringData.environment.lightLevel)"
                      :width="80"
                    />
                  </div>
                  <div class="env-status">{{ getLightStatus(monitoringData.environment.lightLevel) }}</div>
                </div>
                <div class="env-metric">
                  <div class="env-label">空气质量</div>
                  <div class="env-gauge">
                    <el-progress 
                      type="circle" 
                      :percentage="monitoringData.environment.airQuality"
                      :color="getAirColor(monitoringData.environment.airQuality)"
                      :width="80"
                    />
                  </div>
                  <div class="env-status">{{ getAirStatus(monitoringData.environment.airQuality) }}</div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="monitoring-section">
              <h4>AI预警系统</h4>
              <div class="alert-system">
                <div 
                  v-for="alert in monitoringData.alerts" 
                  :key="alert.id"
                  class="alert-item"
                  :class="`alert-${alert.level}`"
                >
                  <div class="alert-icon">
                    <el-icon><Warning v-if="alert.level === 'warning'" /><InfoFilled v-else /></el-icon>
                  </div>
                  <div class="alert-content">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-message">{{ alert.message }}</div>
                    <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
                  </div>
                  <div class="alert-actions">
                    <el-button size="small" @click="handleAlert(alert)">处理</el-button>
                  </div>
                </div>
                <el-empty v-if="monitoringData.alerts.length === 0" description="暂无预警" :image-size="60" />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- AI分析图表 -->
      <el-card class="ai-analytics-card">
        <template #header>
          <div class="card-header">
            <span>AI深度分析</span>
            <div class="header-actions">
              <el-select v-model="selectedAnalysisType" size="small" style="max-width: 120px; width: 100%" @change="updateAnalysisChart">
                <el-option label="学习趋势" value="learning" />
                <el-option label="行为模式" value="behavior" />
                <el-option label="情绪变化" value="emotion" />
                <el-option label="互动频率" value="interaction" />
              </el-select>
              <el-date-picker
                v-model="analysisDateRange"
                type="daterange"
                size="small"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="MM-DD"
                value-format="YYYY-MM-DD"
                @change="updateAnalysisChart"
              />
            </div>
          </div>
        </template>

        <div ref="analysisChart" class="chart-container"></div>
      </el-card>

      <!-- AI自动化任务 -->
      <el-card class="automation-card">
        <template #header>
          <div class="card-header">
            <span>AI自动化任务</span>
            <el-button size="small" @click="configureAutomation">
              <UnifiedIcon name="default" />
              配置
            </el-button>
          </div>
        </template>

        <div class="automation-grid">
          <div 
            v-for="task in automationTasks" 
            :key="task.id"
            class="automation-task"
          >
            <div class="task-header">
              <div class="task-info">
                <h4>{{ task.name }}</h4>
                <p>{{ task.description }}</p>
              </div>
              <div class="task-status">
                <el-switch 
                  v-model="task.enabled" 
                  @change="toggleTask(task)"
                  :loading="task.loading"
                />
              </div>
            </div>
            <div class="task-metrics">
              <div class="metric">
                <span class="metric-label">执行次数:</span>
                <span class="metric-value">{{ task.executionCount }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">成功率:</span>
                <span class="metric-value">{{ task.successRate }}%</span>
              </div>
              <div class="metric">
                <span class="metric-label">最后执行:</span>
                <span class="metric-value">{{ formatTime(task.lastExecution) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- AI建议预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="AI建议详细预览"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-if="previewSuggestionData" class="suggestion-preview">
        <div class="preview-header">
          <h3>{{ previewSuggestionData.title }}</h3>
          <el-tag :type="getPriorityColor(previewSuggestionData.priority)">
            {{ getPriorityLabel(previewSuggestionData.priority) }}
          </el-tag>
        </div>
        
        <el-tabs v-model="activePreviewTab">
          <el-tab-pane label="实施方案" name="plan">
            <div class="implementation-plan">
              <h4>具体实施步骤:</h4>
              <ol>
                <li v-for="step in previewSuggestionData.implementationSteps" :key="step">
                  {{ step }}
                </li>
              </ol>
            </div>
          </el-tab-pane>
          <el-tab-pane label="预期效果" name="effect">
            <div class="expected-effects">
              <h4>预期改善效果:</h4>
              <div class="effects-grid">
                <div v-for="effect in previewSuggestionData.expectedEffects" :key="effect.metric" class="effect-item">
                  <span class="effect-metric">{{ effect.metric }}</span>
                  <span class="effect-improvement">+{{ effect.improvement }}%</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="风险评估" name="risk">
            <div class="risk-assessment">
              <h4>潜在风险:</h4>
              <div class="risks-list">
                <div v-for="risk in previewSuggestionData.risks" :key="risk.type" class="risk-item">
                  <el-tag :type="getRiskLevelColor(risk.level)" size="small">{{ risk.level }}</el-tag>
                  <span class="risk-description">{{ risk.description }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmApplySuggestion">确认应用</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  VideoCamera,
  VideoPause,
  Document,
  TrendCharts,
  ArrowUp,
  ArrowDown,
  View,
  StarFilled,
  ChatDotRound,
  Check,
  Clock,
  Close,
  Warning,
  InfoFilled,
  Setting
} from '@element-plus/icons-vue'
import { get, post, put } from '@/utils/request'
import { CLASS_ENDPOINTS, AI_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'
import * as echarts from 'echarts'

// 路由
const route = useRoute()

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const realTimeMode = ref(false)
const selectedSuggestionType = ref('all')
const selectedAnalysisType = ref('learning')
const analysisDateRange = ref<string[]>([])
const previewDialogVisible = ref(false)
const activePreviewTab = ref('plan')
const lastUpdateTime = ref('')

// 图表实例
const analysisChart = ref<HTMLElement>()
let analysisChartInstance: echarts.ECharts | null = null
let realTimeInterval: NodeJS.Timeout | null = null

// 数据接口定义
interface AIMetrics {
  learningIndex: number
  learningTrend: number
  attentionLevel: number
  attentionTrend: number
  emotionScore: number
  emotionTrend: number
  interactionRate: number
  interactionTrend: number
}

interface AISuggestion {
  id: string
  type: 'learning' | 'behavior' | 'environment' | 'curriculum'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  confidence: number
  expectedImprovement: number
  affectedStudents: string[]
  implementationSteps: string[]
  expectedEffects: Array<{ metric: string; improvement: number }>
  risks: Array<{ type: string; level: string; description: string }>
}

interface MonitoringData {
  students: Array<{
    id: string
    name: string
    avatar: string
    attention: number
    participation: number
    needsAttention: boolean
  }>
  environment: {
    noiseLevel: number
    lightLevel: number
    airQuality: number
  }
  alerts: Array<{
    id: string
    level: 'info' | 'warning' | 'danger'
    title: string
    message: string
    timestamp: string
  }>
}

interface AutomationTask {
  id: string
  name: string
  description: string
  enabled: boolean
  loading: boolean
  executionCount: number
  successRate: number
  lastExecution: string
}

// 数据状态
const aiMetrics = ref<AIMetrics>({
  learningIndex: 0,
  learningTrend: 0,
  attentionLevel: 0,
  attentionTrend: 0,
  emotionScore: 0,
  emotionTrend: 0,
  interactionRate: 0,
  interactionTrend: 0
})

const aiSuggestions = ref<AISuggestion[]>([])
const monitoringData = ref<MonitoringData>({
  students: [],
  environment: { noiseLevel: 0, lightLevel: 0, airQuality: 0 },
  alerts: []
})
const automationTasks = ref<AutomationTask[]>([])
const studentsList = ref<any[]>([])
const previewSuggestionData = ref<AISuggestion | null>(null)

// 计算属性
const filteredSuggestions = computed(() => {
  if (selectedSuggestionType.value === 'all') {
    return aiSuggestions.value
  }
  return aiSuggestions.value.filter(s => s.type === selectedSuggestionType.value)
})

// 方法
const loadAIMetrics = async () => {
  const classId = route.params.id as string
  try {
    const response = await get(AI_ENDPOINTS.CLASS_METRICS(classId))
    
    if (response.success && response.data) {
      aiMetrics.value = response.data
    } else {
      // 使用模拟数据
      aiMetrics.value = {
        learningIndex: 88,
        learningTrend: 5.2,
        attentionLevel: 92,
        attentionTrend: 3.1,
        emotionScore: 85,
        emotionTrend: 2.8,
        interactionRate: 78,
        interactionTrend: -1.5
      }
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    // 降级使用模拟数据
    aiMetrics.value = {
      learningIndex: 88,
      learningTrend: 5.2,
      attentionLevel: 92,
      attentionTrend: 3.1,
      emotionScore: 85,
      emotionTrend: 2.8,
      interactionRate: 78,
      interactionTrend: -1.5
    }
  }
}

const loadAISuggestions = async () => {
  const classId = route.params.id as string
  try {
    const response = await get(AI_ENDPOINTS.CLASS_SUGGESTIONS(classId))
    
    if (response.success && response.data) {
      aiSuggestions.value = response.data
    } else {
      // 使用模拟数据
      aiSuggestions.value = [
        {
          id: '1',
          type: 'learning',
          priority: 'high',
          title: '个性化学习路径优化',
          description: 'AI检测到小明在数学逻辑方面表现优异，建议为其制定进阶学习计划。',
          confidence: 92,
          expectedImprovement: 15,
          affectedStudents: ['student-1'],
          implementationSteps: [
            '评估当前数学能力水平',
            '设计个性化练习题目',
            '安排一对一辅导时间',
            '定期跟踪学习进度'
          ],
          expectedEffects: [
            { metric: '数学成绩', improvement: 20 },
            { metric: '学习兴趣', improvement: 15 },
            { metric: '自信心', improvement: 18 }
          ],
          risks: [
            { type: '学习压力', level: '低', description: '可能增加学习负担' },
            { type: '同学关系', level: '中', description: '可能影响与其他同学的关系' }
          ]
        },
        {
          id: '2',
          type: 'behavior',
          priority: 'medium',
          title: '注意力分散问题干预',
          description: 'AI发现小红在下午时段容易分心，建议调整座位安排和增加互动环节。',
          confidence: 85,
          expectedImprovement: 12,
          affectedStudents: ['student-2'],
          implementationSteps: [
            '分析分心时间规律',
            '调整座位到前排中央',
            '增加提问频率',
            '实施积极反馈机制'
          ],
          expectedEffects: [
            { metric: '注意力持续时间', improvement: 25 },
            { metric: '课堂参与度', improvement: 18 },
            { metric: '学习效率', improvement: 15 }
          ],
          risks: [
            { type: '适应性', level: '低', description: '需要时间适应新环境' }
          ]
        }
      ]
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    aiSuggestions.value = []
  }
}

const loadMonitoringData = async () => {
  const classId = route.params.id as string
  try {
    const response = await get(AI_ENDPOINTS.REAL_TIME_MONITORING(classId))
    
    if (response.success && response.data) {
      monitoringData.value = response.data
    } else {
      // 使用模拟数据
      monitoringData.value = {
        students: [
          {
            id: 'student-1',
            name: '张小明',
            avatar: '',
            attention: 95,
            participation: 88,
            needsAttention: false
          },
          {
            id: 'student-2',
            name: '李小红',
            avatar: '',
            attention: 72,
            participation: 65,
            needsAttention: true
          },
          {
            id: 'student-3',
            name: '王小刚',
            avatar: '',
            attention: 85,
            participation: 92,
            needsAttention: false
          }
        ],
        environment: {
          noiseLevel: 65,
          lightLevel: 85,
          airQuality: 78
        },
        alerts: [
          {
            id: 'alert-1',
            level: 'warning',
            title: '学生注意力下降',
            message: '检测到小红的注意力水平低于正常值',
            timestamp: new Date().toISOString()
          }
        ]
      }
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    // 使用模拟数据
    monitoringData.value = {
      students: [],
      environment: { noiseLevel: 0, lightLevel: 0, airQuality: 0 },
      alerts: []
    }
  }
}

const loadAutomationTasks = async () => {
  const classId = route.params.id as string
  try {
    const response = await get(AI_ENDPOINTS.AUTOMATION_TASKS(classId))
    
    if (response.success && response.data) {
      automationTasks.value = response.data
    } else {
      // 使用模拟数据
      automationTasks.value = [
        {
          id: 'task-1',
          name: '智能考勤分析',
          description: '自动分析学生出勤模式并生成报告',
          enabled: true,
          loading: false,
          executionCount: 45,
          successRate: 98,
          lastExecution: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'task-2',
          name: '学习行为预测',
          description: '基于历史数据预测学生学习表现',
          enabled: true,
          loading: false,
          executionCount: 32,
          successRate: 94,
          lastExecution: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'task-3',
          name: '情绪状态监测',
          description: '实时监测并分析学生情绪变化',
          enabled: false,
          loading: false,
          executionCount: 18,
          successRate: 89,
          lastExecution: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    automationTasks.value = []
  }
}

const loadStudentsList = async () => {
  const classId = route.params.id as string
  try {
    const response = await get(CLASS_ENDPOINTS.STUDENTS(classId))
    
    if (response.success && response.data) {
      studentsList.value = response.data
    } else {
      // 使用模拟数据
      studentsList.value = [
        { id: 'student-1', name: '张小明' },
        { id: 'student-2', name: '李小红' },
        { id: 'student-3', name: '王小刚' }
      ]
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    studentsList.value = []
  }
}

const initAnalysisChart = () => {
  if (analysisChart.value) {
    analysisChartInstance = echarts.init(analysisChart.value)
    updateAnalysisChart()
  }
}

const updateAnalysisChart = () => {
  if (!analysisChartInstance) return

  const mockData = {
    learning: {
      labels: ['周一', '周二', '周三', '周四', '周五'],
      data: [85, 88, 92, 89, 94]
    },
    behavior: {
      labels: ['专注', '参与', '合作', '自律', '积极'],
      data: [88, 92, 85, 90, 87]
    },
    emotion: {
      labels: ['快乐', '兴奋', '平静', '满足', '自信'],
      data: [90, 85, 88, 92, 89]
    },
    interaction: {
      labels: ['提问', '回答', '讨论', '协作', '分享'],
      data: [78, 85, 92, 88, 80]
    }
  }

  const selectedData = mockData[selectedAnalysisType.value as keyof typeof mockData]

  analysisChartInstance.setOption({
    title: {
      text: `AI ${getAnalysisTypeLabel(selectedAnalysisType.value)}分析`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: selectedData.labels
    },
    yAxis: {
      type: 'value',
      max: 100
    },
    series: [
      {
        type: 'line',
        data: selectedData.data,
        smooth: true,
        itemStyle: {
          color: 'var(--primary-color)'
        },
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  })
}

const startRealTimeMonitoring = () => {
  if (realTimeInterval) {
    clearInterval(realTimeInterval)
  }

  realTimeInterval = setInterval(() => {
    updateLastUpdateTime()
    simulateRealTimeData()
  }, 5000)
}

const stopRealTimeMonitoring = () => {
  if (realTimeInterval) {
    clearInterval(realTimeInterval)
    realTimeInterval = null
  }
}

const simulateRealTimeData = () => {
  // 模拟实时数据更新
  monitoringData.value.students.forEach(student => {
    student.attention = Math.max(60, Math.min(100, student.attention + (Math.random() - 0.5) * 10))
    student.participation = Math.max(50, Math.min(100, student.participation + (Math.random() - 0.5) * 8))
    student.needsAttention = student.attention < 75 || student.participation < 70
  })

  // 更新环境数据
  monitoringData.value.environment.noiseLevel = Math.max(30, Math.min(90, 
    monitoringData.value.environment.noiseLevel + (Math.random() - 0.5) * 5))
}

const updateLastUpdateTime = () => {
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
}

// 工具方法
const getTrendClass = (trend: number) => {
  return trend > 0 ? 'trend-up' : 'trend-down'
}

const getSuggestionTypeColor = (type: string) => {
  const typeMap = {
    learning: 'primary',
    behavior: 'success',
    environment: 'warning',
    curriculum: 'info'
  }
  return typeMap[type as keyof typeof typeMap] || 'info'
}

const getSuggestionTypeLabel = (type: string) => {
  const labelMap = {
    learning: '学习优化',
    behavior: '行为引导',
    environment: '环境调整',
    curriculum: '课程安排'
  }
  return labelMap[type as keyof typeof labelMap] || type
}

const getPriorityColor = (priority: string) => {
  const colorMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return colorMap[priority as keyof typeof colorMap] || 'info'
}

const getPriorityLabel = (priority: string) => {
  const labelMap = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return labelMap[priority as keyof typeof labelMap] || priority
}

const getRiskLevelColor = (level: string) => {
  const colorMap = {
    低: 'success',
    中: 'warning',
    高: 'danger'
  }
  return colorMap[level as keyof typeof colorMap] || 'info'
}

const getAnalysisTypeLabel = (type: string) => {
  const labelMap = {
    learning: '学习趋势',
    behavior: '行为模式',
    emotion: '情绪变化',
    interaction: '互动频率'
  }
  return labelMap[type as keyof typeof labelMap] || type
}

const getStudentName = (studentId: string) => {
  const student = studentsList.value.find(s => s.id === studentId)
  return student ? student.name : studentId
}

const getAttentionColor = (attention: number) => {
  if (attention >= 85) return 'var(--success-color)'
  if (attention >= 70) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getParticipationColor = (participation: number) => {
  if (participation >= 80) return 'var(--success-color)'
  if (participation >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getNoiseColor = (level: number) => {
  if (level <= 50) return 'var(--success-color)'
  if (level <= 70) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getLightColor = (level: number) => {
  if (level >= 70) return 'var(--success-color)'
  if (level >= 50) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getAirColor = (level: number) => {
  if (level >= 80) return 'var(--success-color)'
  if (level >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getNoiseStatus = (level: number) => {
  if (level <= 50) return '安静'
  if (level <= 70) return '适中'
  return '嘈杂'
}

const getLightStatus = (level: number) => {
  if (level >= 70) return '充足'
  if (level >= 50) return '适中'
  return '不足'
}

const getAirStatus = (level: number) => {
  if (level >= 80) return '优秀'
  if (level >= 60) return '良好'
  return '需改善'
}

const formatTime = (timeString: string) => {
  return new Date(timeString).toLocaleString('zh-CN')
}

// 事件处理
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadAIMetrics(),
      loadAISuggestions(),
      loadMonitoringData(),
      loadAutomationTasks(),
      loadStudentsList()
    ])
    await nextTick()
    initAnalysisChart()
    updateLastUpdateTime()
    ElMessage.success('AI数据刷新成功')
  } finally {
    loading.value = false
  }
}

const toggleRealTimeMode = () => {
  realTimeMode.value = !realTimeMode.value
  if (realTimeMode.value) {
    startRealTimeMonitoring()
    ElMessage.success('实时监控已开启')
  } else {
    stopRealTimeMonitoring()
    ElMessage.info('实时监控已停止')
  }
}

const exportAIReport = async () => {
  exporting.value = true
  try {
    const classId = route.params.id as string
    const response = await post(AI_ENDPOINTS.EXPORT_REPORT(classId), {
      includeMetrics: true,
      includeSuggestions: true,
      includeMonitoring: true
    })
    
    if (response.success) {
      ElMessage.success('AI报告导出成功')
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '导出报告失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    exporting.value = false
  }
}

const previewSuggestion = (suggestion: AISuggestion) => {
  previewSuggestionData.value = suggestion
  previewDialogVisible.value = true
}

const applySuggestion = async (suggestion: AISuggestion) => {
  try {
    await ElMessageBox.confirm(
      `确定要应用"${suggestion.title}"这个AI建议吗？`,
      '确认应用AI建议',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await post(AI_ENDPOINTS.APPLY_SUGGESTION, {
      suggestionId: suggestion.id,
      classId: route.params.id
    })
    
    if (response.success) {
      ElMessage.success('AI建议应用成功')
      loadAISuggestions()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '应用建议失败'), true)
    }
  } catch (error) {
    if (error !== 'cancel') {
      const errorInfo = ErrorHandler.handle(error, true)
    }
  }
}

const applyAllSuggestions = async () => {
  const suggestions = filteredSuggestions.value
  if (suggestions.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要应用所有${suggestions.length}个AI建议吗？`,
      '批量应用AI建议',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await post(AI_ENDPOINTS.APPLY_ALL_SUGGESTIONS, {
      suggestionIds: suggestions.map(s => s.id),
      classId: route.params.id,
      type: selectedSuggestionType.value
    })
    
    if (response.success) {
      ElMessage.success('所有AI建议应用成功')
      loadAISuggestions()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '批量应用建议失败'), true)
    }
  } catch (error) {
    if (error !== 'cancel') {
      const errorInfo = ErrorHandler.handle(error, true)
    }
  }
}

const postponeSuggestion = async (suggestion: AISuggestion) => {
  try {
    const response = await post(AI_ENDPOINTS.POSTPONE_SUGGESTION, {
      suggestionId: suggestion.id
    })
    
    if (response.success) {
      ElMessage.success('建议已推迟处理')
      loadAISuggestions()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '推迟建议失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

const dismissSuggestion = async (suggestion: AISuggestion) => {
  try {
    const response = await post(AI_ENDPOINTS.DISMISS_SUGGESTION, {
      suggestionId: suggestion.id
    })
    
    if (response.success) {
      ElMessage.success('建议已忽略')
      loadAISuggestions()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '忽略建议失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

const confirmApplySuggestion = () => {
  if (previewSuggestionData.value) {
    applySuggestion(previewSuggestionData.value)
  }
  previewDialogVisible.value = false
}

const handleAlert = async (alert: any) => {
  try {
    const response = await post(AI_ENDPOINTS.HANDLE_ALERT, {
      alertId: alert.id,
      action: 'resolve'
    })
    
    if (response.success) {
      ElMessage.success('预警已处理')
      loadMonitoringData()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '处理预警失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

const toggleTask = async (task: AutomationTask) => {
  task.loading = true
  try {
    const response = await put(AI_ENDPOINTS.TOGGLE_TASK(task.id), {
      enabled: task.enabled
    })
    
    if (response.success) {
      ElMessage.success(`任务已${task.enabled ? '启用' : '禁用'}`)
    } else {
      task.enabled = !task.enabled // 回滚状态
      const errorInfo = ErrorHandler.handle(new Error(response.message || '切换任务状态失败'), true)
    }
  } catch (error) {
    task.enabled = !task.enabled // 回滚状态
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    task.loading = false
  }
}

const configureAutomation = () => {
  ElMessage.info('自动化配置功能开发中...')
}

// 生命周期
onMounted(() => {
  refreshData()
})

onUnmounted(() => {
  stopRealTimeMonitoring()
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.smart-management-content {
  padding: var(--spacing-lg);
}

.ai-overview {
  margin-bottom: var(--spacing-xl);
}

.ai-metric-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(var(--transform-hover-lift));
  }

  &.learning {
    border-left: var(--spacing-xs) solid var(--primary-color);
  }

  &.attention {
    border-left: var(--spacing-xs) solid var(--success-color);
  }

  &.emotion {
    border-left: var(--spacing-xs) solid var(--warning-color);
  }

  &.interaction {
    border-left: var(--spacing-xs) solid var(--info-color);
  }
}

.metric-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.metric-icon {
  font-size: var(--text-3xl);
  color: var(--primary-color);
  opacity: 0.8;
}

.metric-info {
  flex: 1;

  .metric-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .metric-label {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
  }

  .metric-trend {
    font-size: var(--text-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);

    &.trend-up {
      color: var(--success-color);
    }

    &.trend-down {
      color: var(--danger-color);
    }
  }
}

.ai-suggestions-card,
.real-time-monitoring-card,
.ai-analytics-card,
.automation-card {
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.monitoring-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.suggestions-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.suggestion-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--border-color);
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }

  &.priority-high {
    border-left: var(--spacing-xs) solid var(--danger-color);
  }

  &.priority-medium {
    border-left: var(--spacing-xs) solid var(--warning-color);
  }

  &.priority-low {
    border-left: var(--spacing-xs) solid var(--info-color);
  }
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.suggestion-badges {
  display: flex;
  gap: var(--spacing-sm);
}

.ai-confidence {
  font-size: var(--text-sm);
  color: var(--primary-color);
  font-weight: 600;
}

.suggestion-content {
  margin-bottom: var(--spacing-md);

  h4 {
    font-size: var(--text-lg);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    font-weight: 600;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: var(--spacing-sm);
  }
}

.suggestion-details {
  display: grid;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--text-muted);

  .impact-value {
    color: var(--success-color);
    font-weight: 600;
  }

  .more-students {
    color: var(--text-muted);
    font-size: var(--text-xs);
  }
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.monitoring-section {
  h4 {
    font-size: var(--text-lg);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    font-weight: 600;
  }
}

.student-monitoring {
  display: grid;
  gap: var(--spacing-md);
  max-min-height: 60px; height: auto;
  overflow-y: auto;
}

.student-monitor-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-page);
  border-radius: var(--radius-md);
}

.student-status {
  flex: 1;

  .student-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }

  .status-indicators {
    display: grid;
    gap: var(--spacing-xs);
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .status-label {
      font-size: var(--text-xs);
      color: var(--text-muted);
      min-width: auto;
    }
  }
}

.environment-monitoring {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-lg);
}

.env-metric {
  text-align: center;

  .env-label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
  }

  .env-gauge {
    margin-bottom: var(--spacing-sm);
  }

  .env-status {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
}

.alert-system {
  max-min-height: 60px; height: auto;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);

  &.alert-warning {
    background-color: var(--warning-light-bg);
  }

  &.alert-info {
    background-color: var(--info-light-bg);
  }
}

.alert-icon {
  font-size: var(--text-lg);
  margin-top: var(--spacing-xs);
}

.alert-content {
  flex: 1;

  .alert-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .alert-message {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin-bottom: var(--spacing-xs);
  }

  .alert-time {
    color: var(--text-muted);
    font-size: var(--text-xs);
  }
}

.chart-container {
  width: 100%;
  min-height: 60px; height: auto;
}

.automation-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.automation-task {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--border-color);
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.task-info {
  flex: 1;

  h4 {
    font-size: var(--text-lg);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    font-weight: 600;
  }

  p {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }
}

.task-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);

  .metric {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .metric-label {
      color: var(--text-muted);
      font-size: var(--text-sm);
    }

    .metric-value {
      color: var(--text-primary);
      font-weight: 600;
    }
  }
}

.suggestion-preview {
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    h3 {
      font-size: var(--text-xl);
      color: var(--text-primary);
      margin: 0;
    }
  }

  .implementation-plan {
    ol {
      padding-left: var(--spacing-lg);

      li {
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
        line-height: 1.6;
      }
    }
  }

  .expected-effects {
    .effects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-top: var(--spacing-md);
    }

    .effect-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background-color: var(--bg-page);
      border-radius: var(--radius-md);

      .effect-metric {
        color: var(--text-secondary);
      }

      .effect-improvement {
        color: var(--success-color);
        font-weight: 600;
      }
    }
  }

  .risk-assessment {
    .risks-list {
      margin-top: var(--spacing-md);
    }

    .risk-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background-color: var(--bg-page);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-sm);

      .risk-description {
        color: var(--text-secondary);
      }
    }
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-card__header) {
  background-color: var(--bg-page);
  border-bottom-color: var(--border-color);
}

:deep(.el-progress-bar__outer) {
  background-color: var(--bg-page);
}

:deep(.el-tag) {
  border-radius: var(--radius-sm);
}

:deep(.el-empty) {
  padding: var(--spacing-lg);
}

:deep(.el-avatar) {
  background-color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .ai-overview {
    .el-col {
      margin-bottom: var(--spacing-md);
    }
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
  }

  .suggestion-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .suggestion-actions {
    flex-direction: column;
  }

  .task-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .student-monitor-item {
    flex-direction: column;
    text-align: center;
  }

  .environment-monitoring {
    grid-template-columns: 1fr;
  }
}
</style>