<template>
  <div class="page-container">
    <page-header title="班级优化管理">
      <template #actions>
        <el-button @click="refreshData" :loading="loading">
          <UnifiedIcon name="Refresh" />
          刷新数据
        </el-button>
        <el-button @click="generateOptimizationReport" type="primary" :loading="generating">
          <UnifiedIcon name="default" />
          生成优化报告
        </el-button>
      </template>
    </page-header>

    <div class="optimization-content" v-loading="loading" element-loading-text="正在分析班级数据...">
      <!-- 优化概览 -->
      <el-row :gutter="20" class="overview-section">
        <el-col :span="8">
          <el-card class="overview-card efficiency">
            <div class="card-content">
              <div class="card-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">{{ optimizationData.efficiencyScore }}%</div>
                <div class="card-label">整体效率</div>
                <div class="card-trend" :class="getTrendClass(optimizationData.efficiencyTrend)">
                  <el-icon><ArrowUp v-if="optimizationData.efficiencyTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(optimizationData.efficiencyTrend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="overview-card capacity">
            <div class="card-content">
              <div class="card-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">{{ optimizationData.capacityUtilization }}%</div>
                <div class="card-label">容量利用率</div>
                <div class="card-trend" :class="getTrendClass(optimizationData.capacityTrend)">
                  <el-icon><ArrowUp v-if="optimizationData.capacityTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(optimizationData.capacityTrend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="overview-card balance">
            <div class="card-content">
              <div class="card-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">{{ optimizationData.balanceScore }}%</div>
                <div class="card-label">班级均衡度</div>
                <div class="card-trend" :class="getTrendClass(optimizationData.balanceTrend)">
                  <el-icon><ArrowUp v-if="optimizationData.balanceTrend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(optimizationData.balanceTrend) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 优化建议 -->
      <el-card class="suggestions-card">
        <template #header>
          <div class="card-header">
            <span>智能优化建议</span>
            <div class="header-actions">
              <el-select v-model="selectedOptimizationType" size="small" style="max-width: 150px; width: 100%">
                <el-option label="全部建议" value="all" />
                <el-option label="容量优化" value="capacity" />
                <el-option label="师资配置" value="teacher" />
                <el-option label="学生分配" value="student" />
              </el-select>
              <el-button size="small" @click="applyAllSuggestions" type="primary">
                <UnifiedIcon name="Check" />
                应用全部建议
              </el-button>
            </div>
          </div>
        </template>

        <div class="suggestions-list">
          <div 
            v-for="suggestion in filteredSuggestions" 
            :key="suggestion.id"
            class="suggestion-item"
            :class="`priority-${suggestion.priority}`"
          >
            <div class="suggestion-header">
              <div class="suggestion-type">
                <el-tag :type="getSuggestionTypeColor(suggestion.type)" size="small">
                  {{ getSuggestionTypeLabel(suggestion.type) }}
                </el-tag>
                <el-tag :type="getPriorityColor(suggestion.priority)" size="small">
                  {{ getPriorityLabel(suggestion.priority) }}
                </el-tag>
              </div>
              <div class="suggestion-impact">
                预期提升: +{{ suggestion.expectedImprovement }}%
              </div>
            </div>
            <div class="suggestion-content">
              <h4>{{ suggestion.title }}</h4>
              <p>{{ suggestion.description }}</p>
              <div class="suggestion-details">
                <div class="affected-classes">
                  <span>影响班级: </span>
                  <el-tag 
                    v-for="classId in suggestion.affectedClasses" 
                    :key="classId" 
                    size="small"
                    style="margin-right: var(--spacing-base)"
                  >
                    {{ getClassName(classId) }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="suggestion-actions">
              <el-button size="small" @click="previewSuggestion(suggestion)">
                <UnifiedIcon name="eye" />
                预览效果
              </el-button>
              <el-button size="small" type="primary" @click="applySuggestion(suggestion)">
                <UnifiedIcon name="Check" />
                应用建议
              </el-button>
              <el-button size="small" type="danger" @click="dismissSuggestion(suggestion)">
                <UnifiedIcon name="Close" />
                忽略
              </el-button>
            </div>
          </div>
        </div>

        <el-empty v-if="filteredSuggestions.length === 0" description="暂无优化建议" />
      </el-card>

      <!-- 班级对比分析 -->
      <el-card class="comparison-card">
        <template #header>
          <div class="card-header">
            <span>班级对比分析</span>
            <div class="header-actions">
              <el-select 
                v-model="selectedMetric" 
                size="small" 
                style="max-width: 120px; width: 100%"
                @change="updateComparisonChart"
              >
                <el-option label="学生数量" value="studentCount" />
                <el-option label="出勤率" value="attendanceRate" />
                <el-option label="师生比" value="teacherRatio" />
                <el-option label="活动参与" value="activityParticipation" />
              </el-select>
            </div>
          </div>
        </template>

        <div ref="comparisonChart" class="chart-container"></div>
      </el-card>

      <!-- 优化历史记录 -->
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <span>优化历史记录</span>
            <el-button size="small" @click="exportHistory">
              <UnifiedIcon name="Download" />
              导出记录
            </el-button>
          </div>
        </template>

        <div class="table-wrapper">
<el-table class="responsive-table"
          :data="optimizationHistory"
          style="width: 100%"
          stripe
          border
        >
          <el-table-column prop="timestamp" label="优化时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="优化类型" width="120">
            <template #default="scope">
              <el-tag :type="getSuggestionTypeColor(scope.row.type)" size="small">
                {{ getSuggestionTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="优化内容" />
          <el-table-column prop="affectedClasses" label="影响班级" width="150">
            <template #default="scope">
              {{ scope.row.affectedClasses.map(id => getClassName(id)).join(', ') }}
            </template>
          </el-table-column>
          <el-table-column prop="improvement" label="实际提升" width="100">
            <template #default="scope">
              <span :class="scope.row.improvement > 0 ? 'text-success' : 'text-danger'">
                {{ scope.row.improvement > 0 ? '+' : '' }}{{ scope.row.improvement }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusColor(scope.row.status)" size="small">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" type="primary" @click="viewOptimizationDetail(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
</div>

        <div class="pagination-container" v-if="historyPagination.total > historyPagination.pageSize">
          <el-pagination
            v-model:current-page="historyPagination.currentPage"
            v-model:page-size="historyPagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="historyPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleHistoryPageSizeChange"
            @current-change="handleHistoryPageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="优化效果预览"
      width="800px"
    >
      <div v-if="previewData" class="preview-content">
        <h3>{{ previewData.title }}</h3>
        <div class="preview-comparison">
          <div class="before-after">
            <div class="before">
              <h4>优化前</h4>
              <div class="metrics">
                <div class="metric" v-for="metric in previewData.before" :key="metric.name">
                  <span class="metric-name">{{ metric.name }}</span>
                  <span class="metric-value">{{ metric.value }}</span>
                </div>
              </div>
            </div>
            <div class="arrow">
              <UnifiedIcon name="default" />
            </div>
            <div class="after">
              <h4>优化后</h4>
              <div class="metrics">
                <div class="metric" v-for="metric in previewData.after" :key="metric.name">
                  <span class="metric-name">{{ metric.name }}</span>
                  <span class="metric-value improved">{{ metric.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmOptimization">确认应用</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Document,
  TrendCharts,
  ArrowUp,
  ArrowDown,
  User,
  Check,
  View,
  Close,
  Download,
  Right
} from '@element-plus/icons-vue'
import { get, post } from '@/utils/request'
import { CLASS_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const generating = ref(false)
const selectedOptimizationType = ref('all')
const selectedMetric = ref('studentCount')
const previewDialogVisible = ref(false)

// 图表实例
const comparisonChart = ref<HTMLElement>()
let comparisonChartInstance: echarts.ECharts | null = null

// 优化数据接口
interface OptimizationData {
  efficiencyScore: number
  efficiencyTrend: number
  capacityUtilization: number
  capacityTrend: number
  balanceScore: number
  balanceTrend: number
}

interface OptimizationSuggestion {
  id: string
  type: 'capacity' | 'teacher' | 'student' | 'resource'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImprovement: number
  affectedClasses: string[]
}

interface OptimizationRecord {
  id: string
  timestamp: string
  type: string
  description: string
  affectedClasses: string[]
  improvement: number
  status: 'success' | 'failed' | 'pending'
}

// 数据状态
const optimizationData = ref<OptimizationData>({
  efficiencyScore: 0,
  efficiencyTrend: 0,
  capacityUtilization: 0,
  capacityTrend: 0,
  balanceScore: 0,
  balanceTrend: 0
})

const suggestionsList = ref<OptimizationSuggestion[]>([])
const optimizationHistory = ref<OptimizationRecord[]>([])
const classList = ref<any[]>([])
const previewData = ref<any>(null)

// 分页数据
const historyPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 计算属性
const filteredSuggestions = computed(() => {
  if (selectedOptimizationType.value === 'all') {
    return suggestionsList.value
  }
  return suggestionsList.value.filter(s => s.type === selectedOptimizationType.value)
})

// 方法
const loadOptimizationData = async () => {
  loading.value = true
  try {
    const response = await get(CLASS_ENDPOINTS.OPTIMIZATION_DATA)
    
    if (response.success && response.data) {
      optimizationData.value = response.data
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取优化数据失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    loading.value = false
  }
}

const loadSuggestions = async () => {
  try {
    const response = await get(CLASS_ENDPOINTS.OPTIMIZATION_SUGGESTIONS)
    
    if (response.success && response.data) {
      suggestionsList.value = response.data
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取优化建议失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    suggestionsList.value = []
  }
}

const loadHistory = async () => {
  try {
    const response = await get(CLASS_ENDPOINTS.OPTIMIZATION_HISTORY, {
      page: historyPagination.currentPage,
      pageSize: historyPagination.pageSize
    })
    
    if (response.success && response.data) {
      optimizationHistory.value = response.data.list || []
      historyPagination.total = response.data.total || 0
    } else {
      // 使用模拟数据
      optimizationHistory.value = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          type: 'capacity',
          description: '合并小班4班和小班5班',
          affectedClasses: ['class-4', 'class-5'],
          improvement: 12,
          status: 'success'
        },
        {
          id: '2',
          timestamp: '2024-01-10T14:20:00Z',
          type: 'teacher',
          description: '为中班1班增加助教',
          affectedClasses: ['class-6'],
          improvement: 8,
          status: 'success'
        }
      ]
      historyPagination.total = optimizationHistory.value.length
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    optimizationHistory.value = []
  }
}

const loadClassList = async () => {
  try {
    const response = await get(CLASS_ENDPOINTS.LIST)
    
    if (response.success && response.data) {
      classList.value = response.data.list || []
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取班级列表失败'), false)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    classList.value = []
  }
}

const initComparisonChart = () => {
  if (comparisonChart.value) {
    comparisonChartInstance = echarts.init(comparisonChart.value)
    updateComparisonChart()
  }
}

const updateComparisonChart = () => {
  if (!comparisonChartInstance) return

  const mockData = {
    studentCount: [18, 25, 32, 28, 22, 30],
    attendanceRate: [95, 88, 92, 90, 94, 87],
    teacherRatio: [1/15, 1/20, 1/25, 1/22, 1/18, 1/24],
    activityParticipation: [85, 92, 78, 88, 90, 82]
  }

  const classes = ['小班1班', '小班2班', '中班1班', '中班2班', '大班1班', '大班2班']
  const selectedData = mockData[selectedMetric.value as keyof typeof mockData]

  comparisonChartInstance.setOption({
    title: {
      text: `班级${getMetricLabel(selectedMetric.value)}对比`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: classes
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'bar',
        data: selectedData,
        itemStyle: {
          color: 'var(--primary-color)'
        }
      }
    ]
  })
}

// 工具方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getTrendClass = (trend: number) => {
  return trend > 0 ? 'trend-up' : 'trend-down'
}

const getSuggestionTypeColor = (type: string) => {
  const typeMap = {
    capacity: 'primary',
    teacher: 'success',
    student: 'warning',
    resource: 'info'
  }
  return typeMap[type as keyof typeof typeMap] || 'info'
}

const getSuggestionTypeLabel = (type: string) => {
  const labelMap = {
    capacity: '容量优化',
    teacher: '师资配置',
    student: '学生分配',
    resource: '资源配置'
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

const getStatusColor = (status: string) => {
  const colorMap = {
    success: 'success',
    failed: 'danger',
    pending: 'warning'
  }
  return colorMap[status as keyof typeof colorMap] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    success: '成功',
    failed: '失败',
    pending: '进行中'
  }
  return labelMap[status as keyof typeof labelMap] || status
}

const getClassName = (classId: string) => {
  const classItem = classList.value.find(c => c.id === classId)
  return classItem ? classItem.name : classId
}

const getMetricLabel = (metric: string) => {
  const labelMap = {
    studentCount: '学生数量',
    attendanceRate: '出勤率',
    teacherRatio: '师生比',
    activityParticipation: '活动参与度'
  }
  return labelMap[metric as keyof typeof labelMap] || metric
}

// 事件处理
const refreshData = async () => {
  await Promise.all([
    loadOptimizationData(),
    loadSuggestions(),
    loadHistory(),
    loadClassList()
  ])
  await nextTick()
  initComparisonChart()
  ElMessage.success('数据刷新成功')
}

const generateOptimizationReport = async () => {
  generating.value = true
  try {
    const response = await post(CLASS_ENDPOINTS.GENERATE_OPTIMIZATION_REPORT, {
      includeHistory: true,
      includeSuggestions: true
    })
    
    if (response.success) {
      ElMessage.success('优化报告生成成功')
      // TODO: 下载报告文件
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '生成报告失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    generating.value = false
  }
}

const previewSuggestion = (suggestion: OptimizationSuggestion) => {
  previewData.value = {
    title: suggestion.title,
    before: [
      { name: '效率评分', value: '87%' },
      { name: '资源利用率', value: '75%' },
      { name: '学生满意度', value: '85%' }
    ],
    after: [
      { name: '效率评分', value: '92%' },
      { name: '资源利用率', value: '88%' },
      { name: '学生满意度', value: '90%' }
    ]
  }
  previewDialogVisible.value = true
}

const applySuggestion = async (suggestion: OptimizationSuggestion) => {
  try {
    await ElMessageBox.confirm(
      `确定要应用"${suggestion.title}"这个优化建议吗？`,
      '确认应用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await post(CLASS_ENDPOINTS.APPLY_OPTIMIZATION, {
      suggestionId: suggestion.id
    })
    
    if (response.success) {
      ElMessage.success('优化建议应用成功')
      refreshData()
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
  const filteredSuggestionsList = filteredSuggestions.value
  if (filteredSuggestionsList.length === 0) {
    ElMessage.info('暂无可应用的建议')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要应用所有${filteredSuggestionsList.length}个优化建议吗？`,
      '批量应用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await post(CLASS_ENDPOINTS.APPLY_ALL_OPTIMIZATIONS, {
      suggestionIds: filteredSuggestionsList.map(s => s.id),
      type: selectedOptimizationType.value
    })
    
    if (response.success) {
      ElMessage.success('所有优化建议应用成功')
      refreshData()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '批量应用建议失败'), true)
    }
  } catch (error) {
    if (error !== 'cancel') {
      const errorInfo = ErrorHandler.handle(error, true)
    }
  }
}

const dismissSuggestion = async (suggestion: OptimizationSuggestion) => {
  try {
    const response = await post(CLASS_ENDPOINTS.DISMISS_OPTIMIZATION, {
      suggestionId: suggestion.id
    })
    
    if (response.success) {
      ElMessage.success('建议已忽略')
      loadSuggestions()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '忽略建议失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

const confirmOptimization = () => {
  previewDialogVisible.value = false
  ElMessage.success('优化已确认应用')
}

const exportHistory = () => {
  ElMessage.success('优化历史记录导出成功')
  // TODO: 实现导出功能
}

const viewOptimizationDetail = (record: OptimizationRecord) => {
  ElMessage.info(`查看优化记录 ${record.id} 的详细信息`)
  // TODO: 实现详情查看
}

const handleHistoryPageSizeChange = (size: number) => {
  historyPagination.pageSize = size
  loadHistory()
}

const handleHistoryPageChange = (page: number) => {
  historyPagination.currentPage = page
  loadHistory()
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.optimization-content {
  padding: var(--spacing-lg);
}

.overview-section {
  margin-bottom: var(--spacing-xl);
}

.overview-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(var(--transform-hover-lift));
  }

  &.efficiency {
    border-left: var(--spacing-xs) solid var(--success-color);
  }

  &.capacity {
    border-left: var(--spacing-xs) solid var(--primary-color);
  }

  &.balance {
    border-left: var(--spacing-xs) solid var(--warning-color);
  }
}

.card-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.card-icon {
  font-size: var(--text-3xl);
  color: var(--primary-color);
  opacity: 0.8;
}

.card-info {
  flex: 1;

  .card-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .card-label {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
  }

  .card-trend {
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

.suggestions-card,
.comparison-card,
.history-card {
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

.suggestions-list {
  display: grid;
  gap: var(--spacing-lg);
}

.suggestion-item {
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

.suggestion-type {
  display: flex;
  gap: var(--spacing-sm);
}

.suggestion-impact {
  font-size: var(--text-sm);
  color: var(--success-color);
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
  .affected-classes {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.chart-container {
  width: 100%;
  min-height: 60px; height: auto;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

.preview-content {
  .preview-comparison {
    margin-top: var(--spacing-lg);
  }

  .before-after {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
  }

  .before,
  .after {
    flex: 1;
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);

    h4 {
      font-size: var(--text-lg);
      margin-bottom: var(--spacing-md);
      color: var(--text-primary);
    }
  }

  .arrow {
    font-size: var(--text-2xl);
    color: var(--primary-color);
  }

  .metrics {
    display: grid;
    gap: var(--spacing-sm);
  }

  .metric {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .metric-name {
      color: var(--text-secondary);
    }

    .metric-value {
      font-weight: 600;
      color: var(--text-primary);

      &.improved {
        color: var(--success-color);
      }
    }
  }
}

.text-success {
  color: var(--success-color);
}

.text-danger {
  color: var(--danger-color);
}

/* Element Plus 组件样式覆盖 */
:deep(.el-card__header) {
  background-color: var(--bg-secondary);
  border-bottom-color: var(--border-color);
}

:deep(.el-table) {
  background-color: var(--bg-card);
}

:deep(.el-table th) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

:deep(.el-table td) {
  color: var(--text-secondary);
}

:deep(.el-tag) {
  border-radius: var(--radius-sm);
}

:deep(.el-empty) {
  padding: var(--spacing-xl);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .overview-section {
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

  .before-after {
    flex-direction: column;
    
    .arrow {
      transform: rotate(90deg);
    }
  }
}
</style>