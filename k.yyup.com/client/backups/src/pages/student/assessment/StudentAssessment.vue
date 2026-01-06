<template>
  <div class="page-container">
    <page-header title="学生综合评估">
      <template #actions>
        <el-button @click="startNewAssessment" type="primary">
          <el-icon><Plus /></el-icon>
          新建评估
        </el-button>
        <el-button @click="exportAssessments" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出评估
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </template>
    </page-header>

    <div class="assessment-content" v-loading="loading" element-loading-text="正在加载评估数据...">
      <!-- 评估概览 -->
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>评估概览</span>
            <el-select v-model="selectedPeriod" size="small" style="width: 120px" @change="handlePeriodChange">
              <el-option label="本学期" value="current" />
              <el-option label="上学期" value="last" />
              <el-option label="全年" value="year" />
            </el-select>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="overview-stat">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ assessmentOverview.totalStudents }}</div>
                <div class="stat-label">待评估学生</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-stat">
              <div class="stat-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ assessmentOverview.completedAssessments }}</div>
                <div class="stat-label">已完成评估</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-stat">
              <div class="stat-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ assessmentOverview.averageScore.toFixed(1) }}</div>
                <div class="stat-label">平均分</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-stat">
              <div class="stat-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ assessmentOverview.pendingAssessments }}</div>
                <div class="stat-label">待审核评估</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 评估列表 -->
      <el-card class="assessments-card">
        <template #header>
          <div class="card-header">
            <span>学生评估列表</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索学生姓名..."
                size="small"
                style="width: 200px; margin-right: var(--spacing-2xl)"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select v-model="statusFilter" size="small" style="width: 120px" @change="handleStatusFilter">
                <el-option label="全部状态" value="" />
                <el-option label="待评估" value="pending" />
                <el-option label="进行中" value="in-progress" />
                <el-option label="已完成" value="completed" />
                <el-option label="待审核" value="reviewing" />
              </el-select>
            </div>
          </div>
        </template>

        <el-table
          :data="filteredAssessments"
          style="width: 100%"
          stripe
          border
          :default-sort="{ prop: 'lastAssessmentDate', order: 'descending' }"
        >
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="className" label="班级" width="100" />
          <el-table-column prop="assessmentType" label="评估类型" width="120">
            <template #default="scope">
              <el-tag :type="getAssessmentTypeColor(scope.row.assessmentType)" size="small">
                {{ getAssessmentTypeLabel(scope.row.assessmentType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="overallScore" label="综合评分" width="100" sortable>
            <template #default="scope">
              <el-progress
                :percentage="scope.row.overallScore"
                :color="getScoreColor(scope.row.overallScore)"
                :text-inside="true"
                :stroke-width="18"
              />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="评估状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastAssessmentDate" label="最后评估时间" width="150" sortable>
            <template #default="scope">
              {{ formatDate(scope.row.lastAssessmentDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="assessor" label="评估人" width="100" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="viewAssessment(scope.row)"
                v-if="scope.row.status === 'completed'"
              >
                查看评估
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="continueAssessment(scope.row)"
                v-if="scope.row.status === 'in-progress'"
              >
                继续评估
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="startAssessment(scope.row)"
                v-if="scope.row.status === 'pending'"
              >
                开始评估
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="editAssessment(scope.row)"
              >
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="pagination.total > pagination.pageSize">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 评估统计 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span>评估分数分布</span>
            </template>
            <div ref="scoreDistributionChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span>评估进度趋势</span>
            </template>
            <div ref="progressTrendChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 评估详情对话框 -->
    <el-dialog
      v-model="assessmentDialogVisible"
      :title="currentAssessment?.studentName + ' - 评估详情'"
      width="800px"
      :before-close="handleDialogClose"
    >
      <div v-if="currentAssessment" class="assessment-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ currentAssessment.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentAssessment.studentId }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentAssessment.className }}</el-descriptions-item>
          <el-descriptions-item label="评估类型">{{ getAssessmentTypeLabel(currentAssessment.assessmentType) }}</el-descriptions-item>
          <el-descriptions-item label="综合评分">{{ currentAssessment.overallScore }}分</el-descriptions-item>
          <el-descriptions-item label="评估状态">{{ getStatusLabel(currentAssessment.status) }}</el-descriptions-item>
        </el-descriptions>

        <div class="assessment-dimensions" v-if="currentAssessment.dimensions">
          <h3>各项能力评估</h3>
          <div class="dimensions-grid">
            <div 
              v-for="dimension in currentAssessment.dimensions" 
              :key="dimension.name"
              class="dimension-item"
            >
              <div class="dimension-header">
                <span class="dimension-name">{{ dimension.name }}</span>
                <span class="dimension-score">{{ dimension.score }}分</span>
              </div>
              <el-progress 
                :percentage="dimension.score" 
                :color="getScoreColor(dimension.score)"
              />
              <p class="dimension-comment">{{ dimension.comment }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assessmentDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="printAssessment" v-if="currentAssessment?.status === 'completed'">
            <el-icon><Printer /></el-icon>
            打印评估
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Download,
  Refresh,
  User,
  CircleCheck,
  TrendCharts,
  Clock,
  Search,
  Printer
} from '@element-plus/icons-vue'
import { get, post } from '@/utils/request'
import { STUDENT_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'
import * as echarts from 'echarts'

// 接口定义
interface AssessmentDimension {
  name: string
  score: number
  comment: string
}

interface StudentAssessment {
  id: string
  studentId: string
  studentName: string
  className: string
  assessmentType: 'monthly' | 'semester' | 'annual' | 'special'
  overallScore: number
  status: 'pending' | 'in-progress' | 'completed' | 'reviewing'
  lastAssessmentDate: string
  assessor: string
  dimensions?: AssessmentDimension[]
}

interface AssessmentOverview {
  totalStudents: number
  completedAssessments: number
  averageScore: number
  pendingAssessments: number
}

// 响应式数据
const router = useRouter()
const loading = ref(false)
const exporting = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const selectedPeriod = ref('current')
const assessmentDialogVisible = ref(false)
const currentAssessment = ref<StudentAssessment | null>(null)

// 图表实例
const scoreDistributionChart = ref<HTMLElement>()
const progressTrendChart = ref<HTMLElement>()
let scoreDistributionChartInstance: echarts.ECharts | null = null
let progressTrendChartInstance: echarts.ECharts | null = null

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 数据状态
const assessmentOverview = ref<AssessmentOverview>({
  totalStudents: 0,
  completedAssessments: 0,
  averageScore: 0,
  pendingAssessments: 0
})

const assessmentsList = ref<StudentAssessment[]>([])

// 计算属性
const filteredAssessments = computed(() => {
  let filtered = assessmentsList.value

  // 关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(item =>
      item.studentName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.studentId.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value)
  }

  // 更新分页总数
  pagination.total = filtered.length

  // 分页处理
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filtered.slice(start, end)
})

// 方法
const loadAssessmentData = async () => {
  loading.value = true
  try {
    const response = await get(STUDENT_ENDPOINTS.ASSESSMENTS, {
      period: selectedPeriod.value,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })

    if (response.success && response.data) {
      assessmentsList.value = response.data.list || []
      assessmentOverview.value = response.data.overview || {}
      pagination.total = response.data.total || 0
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取评估数据失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    assessmentsList.value = []
  } finally {
    loading.value = false
  }
}

const initCharts = () => {
  // 初始化评估分数分布图
  if (scoreDistributionChart.value) {
    scoreDistributionChartInstance = echarts.init(scoreDistributionChart.value)
    scoreDistributionChartInstance.setOption({
      title: {
        text: '评估分数分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: 15, name: '90-100分' },
            { value: 35, name: '80-89分' },
            { value: 40, name: '70-79分' },
            { value: 8, name: '60-69分' },
            { value: 2, name: '60分以下' }
          ]
        }
      ]
    })
  }

  // 初始化评估进度趋势图
  if (progressTrendChart.value) {
    progressTrendChartInstance = echarts.init(progressTrendChart.value)
    progressTrendChartInstance.setOption({
      title: {
        text: '评估进度趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['第1周', '第2周', '第3周', '第4周', '第5周']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '已完成',
          type: 'line',
          data: [20, 45, 70, 85, 95],
          itemStyle: { color: 'var(--success-color)' }
        },
        {
          name: '进行中',
          type: 'line',
          data: [15, 25, 20, 15, 8],
          itemStyle: { color: 'var(--warning-color)' }
        }
      ]
    })
  }
}

const refreshData = async () => {
  await loadAssessmentData()
  await nextTick()
  initCharts()
  ElMessage.success('数据刷新成功')
}

const startNewAssessment = () => {
  ElMessage.info('跳转到新建评估页面')
  // TODO: 跳转到新建评估页面
}

const exportAssessments = async () => {
  exporting.value = true
  try {
    const response = await post(STUDENT_ENDPOINTS.EXPORT_ASSESSMENTS, {
      period: selectedPeriod.value,
      format: 'excel'
    })
    
    if (response.success) {
      ElMessage.success('评估数据导出成功')
      // TODO: 处理文件下载
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '导出失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    exporting.value = false
  }
}

const handlePeriodChange = () => {
  pagination.currentPage = 1
  loadAssessmentData()
}

const handleSearch = () => {
  pagination.currentPage = 1
}

const handleStatusFilter = () => {
  pagination.currentPage = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadAssessmentData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadAssessmentData()
}

const viewAssessment = (assessment: StudentAssessment) => {
  currentAssessment.value = assessment
  assessmentDialogVisible.value = true
}

const continueAssessment = (assessment: StudentAssessment) => {
  ElMessage.info(`继续评估学生 ${assessment.studentName}`)
  // TODO: 跳转到评估页面
}

const startAssessment = (assessment: StudentAssessment) => {
  ElMessage.info(`开始评估学生 ${assessment.studentName}`)
  // TODO: 跳转到评估页面
}

const editAssessment = (assessment: StudentAssessment) => {
  ElMessage.info(`编辑学生 ${assessment.studentName} 的评估`)
  // TODO: 跳转到编辑页面
}

const printAssessment = () => {
  ElMessage.success('正在准备打印评估报告')
  // TODO: 实现打印功能
}

const handleDialogClose = () => {
  currentAssessment.value = null
  assessmentDialogVisible.value = false
}

// 工具方法
const formatDate = (dateString: string) => {
  if (!dateString) return '--'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getAssessmentTypeColor = (type: string) => {
  const colorMap = {
    monthly: 'primary',
    semester: 'success',
    annual: 'warning',
    special: 'info'
  }
  return colorMap[type as keyof typeof colorMap] || 'info'
}

const getAssessmentTypeLabel = (type: string) => {
  const labelMap = {
    monthly: '月度评估',
    semester: '学期评估',
    annual: '年度评估',
    special: '专项评估'
  }
  return labelMap[type as keyof typeof labelMap] || type
}

const getStatusType = (status: string) => {
  const typeMap = {
    pending: 'info',
    'in-progress': 'warning',
    completed: 'success',
    reviewing: 'primary'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    pending: '待评估',
    'in-progress': '进行中',
    completed: '已完成',
    reviewing: '待审核'
  }
  return labelMap[status as keyof typeof labelMap] || status
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'var(--success-color)'
  if (score >= 80) return 'var(--warning-color)'
  if (score >= 70) return 'var(--danger-color)'
  return 'var(--info-color)'
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.assessment-content {
  padding: var(--spacing-lg);
}

.overview-card,
.assessments-card,
.chart-card {
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
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

.overview-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-hover);
    transform: translateY(-var(--border-width-base));
  }
}

.stat-icon {
  font-size: var(--text-2xl);
  color: var(--primary-color);
  background: var(--bg-card);
  padding: var(--spacing-md);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

.stat-content {
  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: 500;
  }
}

.chart-container {
  width: 100%;
  height: 300px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

.assessment-detail {
  .assessment-dimensions {
    margin-top: var(--spacing-xl);

    h3 {
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin-bottom: var(--spacing-lg);
      font-weight: 600;
      border-bottom: var(--border-width-base) solid var(--border-color);
      padding-bottom: var(--spacing-sm);
    }
  }

  .dimensions-grid {
    display: grid;
    gap: var(--spacing-lg);
  }

  .dimension-item {
    padding: var(--spacing-lg);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border-left: var(--spacing-xs) solid var(--primary-color);

    .dimension-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);

      .dimension-name {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
      }

      .dimension-score {
        font-size: var(--text-lg);
        font-weight: 700;
        color: var(--primary-color);
      }
    }

    .dimension-comment {
      margin-top: var(--spacing-sm);
      color: var(--text-secondary);
      font-size: var(--text-sm);
      line-height: 1.5;
    }
  }
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

:deep(.el-progress-bar__outer) {
  background-color: var(--bg-secondary);
}

:deep(.el-tag) {
  border-radius: var(--radius-sm);
}

:deep(.el-dialog__header) {
  background-color: var(--bg-secondary);
  border-bottom: var(--border-width-base) solid var(--border-color);
}

:deep(.el-descriptions__label) {
  color: var(--text-primary);
  font-weight: 500;
  background-color: var(--bg-secondary);
}

:deep(.el-descriptions__content) {
  color: var(--text-secondary);
  background-color: var(--bg-card);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .assessment-content {
    padding: var(--spacing-md);
  }

  .overview-stat {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
  }

  .chart-container {
    height: 250px;
  }

  .dimensions-grid {
    gap: var(--spacing-md);
  }

  .dimension-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
</style>