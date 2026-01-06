<template>
  <div class="page-container">
    <app-card>
      <template #header>
        <app-card-header>
          <div class="app-card-title">
            <el-icon><Calendar /></el-icon>
            招生计划详情
          </div>
          <div class="card-actions">
            <el-button @click="$router.back()">
              <el-icon><Back /></el-icon>
              返回
            </el-button>
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="primary" @click="handleManageQuota">
              <el-icon><Histogram /></el-icon>
              名额管理
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </app-card-header>
      </template>
      
      <app-card-content>
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 基本信息 -->
            <div class="info-section">
              <div class="section-header">
                <h3 class="section-title">基本信息</h3>
              </div>
              <div class="section-content">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="计划名称">{{ planData.title }}</el-descriptions-item>
                  <el-descriptions-item label="计划描述">{{ planData.description }}</el-descriptions-item>
                  <el-descriptions-item label="招生年份">{{ planData.startDate ? planData.startDate.split('-')[0] : '' }}</el-descriptions-item>
                  <el-descriptions-item label="学期">{{ getSemester(planData.startDate) }}</el-descriptions-item>
                  <el-descriptions-item label="招生时间">{{ planData.startDate }} 至 {{ planData.endDate }}</el-descriptions-item>
                  <el-descriptions-item label="年龄要求">{{ getAgeRange() }}</el-descriptions-item>
                  <el-descriptions-item label="计划人数">{{ planData.targetCount }}</el-descriptions-item>
                  <el-descriptions-item label="已招人数">{{ planData.currentCount }}</el-descriptions-item>
                  <el-descriptions-item label="状态">
                    <el-tag :type="getStatusType(planData.status)">
                      {{ getStatusText(planData.status) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间">{{ formatDateTime(planData.createdAt) }}</el-descriptions-item>
                  <el-descriptions-item label="负责人" :span="2">{{ planData.createdBy || '未设置' }}</el-descriptions-item>
                  <el-descriptions-item label="备注" :span="2">{{ planData.description || '无' }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
            
            <!-- 招生统计 -->
            <div class="statistics-section">
              <div class="section-header">
                <h3 class="section-title">招生统计</h3>
              </div>
              <div class="section-content">
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-icon applications">
                      <el-icon><Document /></el-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ statistics.totalApplications }}</div>
                      <div class="stat-label">总申请数</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon approved">
                      <el-icon><Check /></el-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ statistics.approvedApplications }}</div>
                      <div class="stat-label">已通过</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon pending">
                      <el-icon><Clock /></el-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ statistics.pendingApplications }}</div>
                      <div class="stat-label">待审核</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon rejected">
                      <el-icon><Close /></el-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ statistics.rejectedApplications }}</div>
                      <div class="stat-label">已拒绝</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 跟踪记录 -->
            <div class="tracking-section">
              <div class="section-header">
                <h3 class="section-title">跟踪记录</h3>
                <el-button type="primary" size="small" @click="handleAddTracking">
                  <el-icon><Plus /></el-icon>
                  添加记录
                </el-button>
              </div>
              <div class="section-content">
                <el-timeline>
                  <el-timeline-item
                    v-for="(record, index) in trackingRecords"
                    :key="index"
                    :timestamp="formatDateTime(record.createdAt)"
                    placement="top"
                  >
                    <div class="tracking-item">
                      <div class="tracking-title">{{ record.title }}</div>
                      <div class="tracking-content">{{ record.content }}</div>
                      <div class="tracking-meta">
                        <span class="tracking-author">{{ record.createdBy }}</span>
                      </div>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <!-- 执行进度 -->
            <div class="progress-section">
              <div class="section-header">
                <h3 class="section-title">招生进度</h3>
              </div>
              <div class="section-content">
                <div class="progress-chart">
                  <div class="chart-title">总体进度</div>
                  <el-progress type="dashboard" :percentage="progressPercentage" :color="progressColor" />
                  <div class="progress-info">
                    <div class="info-item">
                      <div class="label">计划招生</div>
                      <div class="value">{{ planData.targetCount }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">已招生</div>
                      <div class="value">{{ planData.currentCount }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">剩余名额</div>
                      <div class="value">{{ planData.targetCount - planData.currentCount }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="time-progress">
                  <div class="chart-title">时间进度</div>
                  <el-progress :percentage="timeProgressPercentage" :status="timeProgressStatus" />
                  <div class="time-info">
                    <div>开始: {{ formatDate(planData.startDate) }}</div>
                    <div>结束: {{ formatDate(planData.endDate) }}</div>
                    <div>剩余: {{ remainingDays }}天</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 快捷操作 -->
            <div class="actions-section">
              <div class="section-header">
                <h3 class="section-title">快捷操作</h3>
              </div>
              <div class="section-content">
                <div class="action-buttons">
                  <el-button type="primary" @click="handleViewApplications" block>
                    <el-icon><Document /></el-icon>
                    查看申请
                  </el-button>
                  <el-button type="success" @click="handleViewStatistics" block>
                    <el-icon><TrendCharts /></el-icon>
                    查看统计
                  </el-button>
                  <el-button type="warning" @click="handleManageClasses" block>
                    <el-icon><School /></el-icon>
                    班级管理
                  </el-button>
                  <el-button type="info" @click="handleExportReport" block>
                    <el-icon><Download /></el-icon>
                    导出报告
                  </el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </app-card-content>
    </app-card>
    
    <!-- 添加跟踪记录对话框 -->
    <el-dialog v-model="trackingDialogVisible" title="添加跟踪记录" width="600px">
      <el-form :model="trackingForm" :rules="trackingRules" ref="trackingFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="trackingForm.title" placeholder="请输入记录标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="trackingForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入记录内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="trackingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveTracking" :loading="saving">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { 
  Calendar,
  Back, 
  Edit, 
  Histogram, 
  Download,
  Document,
  Check,
  Clock,
  Close,
  Plus,
  TrendCharts,
  School
} from '@element-plus/icons-vue'
import { formatDateTime, formatDate } from '@/utils/dateFormat'
import { ENROLLMENT_PLAN_ENDPOINTS } from '@/api/endpoints'
import { get, post, put, del } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

// 接口定义
interface EnrollmentPlan {
  id: number;
  title: string;
  description: string;
  status: string
  startDate: string
  endDate: string
  targetCount: number
  currentCount: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

interface Statistics {
  totalApplications: number
  approvedApplications: number
  rejectedApplications: number
  pendingApplications: number
  completionRate: number
}

interface TrackingRecord {
  id: number;
  title: string;
  content: string
  createdBy: string
  createdAt: string
}

interface TrackingForm {
  title: string;
  content: string
}

// 响应式数据
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const trackingDialogVisible = ref(false)

// 计划数据
const planData = ref<EnrollmentPlan>({
  id: 0,
  title: '',
  description: '',
  status: '',
  startDate: '',
  endDate: '',
  targetCount: 0,
  currentCount: 0,
  createdAt: '',
  updatedAt: ''
})

// 统计数据
const statistics = ref<Statistics>({
  totalApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0,
  pendingApplications: 0,
  completionRate: 0
})

// 跟踪记录
const trackingRecords = ref<TrackingRecord[]>([])

// 跟踪记录表单
const trackingForm = reactive<TrackingForm>({
  title: '',
  content: ''
})

// 表单验证规则
const trackingRules = {
  title: [
    { required: true, message: '请输入记录标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入记录内容', trigger: 'blur' }
  ]
}

// API方法
const fetchPlanDetail = async () => {
  try {
    loading.value = true
    const planId = route.params.id
    
    const response = await get(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(planId))
    
    if (response.success) {
      planData.value = response.data
    } else {
      ElMessage.error(response.message || '获取招生计划详情失败')
    }
  } catch (error) {
    console.error('获取招生计划详情失败:', error)
    ElMessage.error('获取招生计划详情失败')
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const planId = route.params.id
    
    const response = await get(ENROLLMENT_PLAN_ENDPOINTS.GET_STATISTICS(planId))
    
    if (response.success) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchTrackingRecords = async () => {
  try {
    const planId = route.params.id
    
    const response = await get(`/enrollment-plans/${planId}/trackings`)
    
    if (response.success) {
      trackingRecords.value = response.data || []
    }
  } catch (error) {
    console.error('获取跟踪记录失败:', error)
  }
}

const saveTracking = async () => {
  try {
    saving.value = true
    const planId = route.params.id
    
    const response = await post(`/enrollment-plans/${planId}/trackings`, trackingForm)
    
    if (response.success) {
      ElMessage.success('添加跟踪记录成功')
      trackingDialogVisible.value = false
      trackingForm.title = ''
      trackingForm.content = ''
      await fetchTrackingRecords()
    } else {
      ElMessage.error(response.message || '添加跟踪记录失败')
    }
  } catch (error) {
    console.error('添加跟踪记录失败:', error)
    ElMessage.error('添加跟踪记录失败')
  } finally {
    saving.value = false
  }
}

// 工具方法
const getSemester = (date: string): string => {
  if (!date || date.split('-').length <= 1) return ''
  const month = date.split('-')[1]
  return month === '01' ? '春季' : '秋季'
}

const getAgeRange = (): string => {
  return '3-6岁' // 默认年龄范围
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, "info" | "success" | "warning" | "primary" | "danger"> = {
    draft: 'info',
  active: 'success',
  completed: 'warning',
  cancelled: 'danger',
  paused: 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
  active: '招生中',
  completed: '已完成',
  cancelled: '已取消',
  paused: '已暂停'
  }
  return statusMap[status] || '未知'
}

// 计算属性
const progressPercentage = computed((): number => {
  const targetCount = planData.value.targetCount || 0
  const currentCount = planData.value.currentCount || 0

  if (targetCount <= 0) return 0

  const percentage = Math.round((currentCount / targetCount) * 100)
  return Math.min(Math.max(percentage, 0), 100)
})

const progressColor = computed((): string => {
  const percentage = progressPercentage.value
  if (percentage < 30) return 'var(--el-color-info)'
  if (percentage < 70) return 'var(--el-color-warning)'
  return 'var(--el-color-success)'
})

const timeProgressPercentage = computed((): number => {
  if (!planData.value.startDate || !planData.value.endDate) return 0

  try {
    const start = new Date(planData.value.startDate).getTime()
    const end = new Date(planData.value.endDate).getTime()
    const now = Date.now()

    // 验证日期有效性
    if (isNaN(start) || isNaN(end) || start >= end) return 0

    if (now <= start) return 0
    if (now >= end) return 100

    const total = end - start
    const elapsed = now - start
    const percentage = Math.round((elapsed / total) * 100)

    return Math.min(Math.max(percentage, 0), 100)
  } catch (error) {
    console.warn('计算时间进度失败:', error)
    return 0
  }
})

const timeProgressStatus = computed((): '' | 'success' => {
  if (!planData.value.endDate) return ''
  
  const now = Date.now()
  const end = new Date(planData.value.endDate).getTime()
  
  if (now >= end) return 'success'
  return ''
})

const remainingDays = computed((): number => {
  if (!planData.value.endDate) return 0
  
  const now = new Date()
  const end = new Date(planData.value.endDate)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// 事件处理方法
const handleEdit = () => {
  router.push(`/enrollment-plan/edit/${planData.value.id}`)
}

const handleManageQuota = () => {
  router.push(`/enrollment-plan/quota/${planData.value.id}`)
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleViewApplications = () => {
  router.push(`/enrollment-application?planId=${planData.value.id}`)
}

const handleViewStatistics = () => {
  router.push(`/enrollment-statistics?planId=${planData.value.id}`)
}

const handleManageClasses = () => {
  router.push(`/class?planId=${planData.value.id}`)
}

const handleExportReport = () => {
  ElMessage.info('导出报告功能开发中...')
}

const handleAddTracking = () => {
  trackingDialogVisible.value = true
}

const handleSaveTracking = () => {
  saveTracking()
}

// 组件挂载时加载数据
onMounted(async () => {
  await fetchPlanDetail()
  await fetchStatistics()
  await fetchTrackingRecords()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
.page-container {
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--app-margin);
    
    .section-title {
      font-size: var(--el-font-size-large);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }
  }
  
  .section-content {
    background: var(--el-bg-color-page);
    border-radius: var(--el-border-radius-base);
    padding: var(--app-padding);
    border: var(--border-width-base) solid var(--el-border-color-lighter);
  }
  
  .info-section,
  .statistics-section,
  .tracking-section {
    margin-bottom: var(--app-margin-lg);
  }
  
  .progress-section,
  .actions-section {
    margin-bottom: var(--app-margin);
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--app-gap);
    
    .stat-card {
      display: flex;
      align-items: center;
      padding: var(--app-padding);
      background: var(--el-bg-color);
      border-radius: var(--el-border-radius-base);
      border: var(--border-width-base) solid var(--el-border-color-lighter);
      
      .stat-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--app-margin);
        
        .el-icon {
          font-size: var(--text-2xl);
          color: white;
        }
        
        &.applications {
          background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
        }
        
        &.approved {
          background: linear-gradient(135deg, var(--el-color-success), var(--el-color-success-light-3));
        }
        
        &.pending {
          background: linear-gradient(135deg, var(--el-color-warning), var(--el-color-warning-light-3));
        }
        
        &.rejected {
          background: linear-gradient(135deg, var(--el-color-danger), var(--el-color-danger-light-3));
        }
      }
      
      .stat-content {
        flex: 1;
        
        .stat-value {
          font-size: var(--el-font-size-extra-large);
          font-weight: 600;
          color: var(--el-text-color-primary);
          line-height: 1;
        }
        
        .stat-label {
          font-size: var(--el-font-size-small);
          color: var(--el-text-color-regular);
          margin-top: var(--spacing-xs);
        }
      }
    }
  }
  
  .tracking-item {
    .tracking-title {
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .tracking-content {
      color: var(--el-text-color-regular);
      margin-bottom: var(--spacing-sm);
      line-height: 1.5;
    }
    
    .tracking-meta {
      .tracking-author {
        font-size: var(--el-font-size-small);
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  .progress-chart {
    text-align: center;
    margin-bottom: var(--app-margin-lg);
    
    .chart-title {
      font-size: var(--el-font-size-medium);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: var(--app-margin);
    }
    
    .progress-info {
      display: flex;
      justify-content: space-around;
      margin-top: var(--app-margin);
      
      .info-item {
        text-align: center;
        
        .label {
          font-size: var(--el-font-size-small);
          color: var(--el-text-color-regular);
          margin-bottom: var(--spacing-xs);
        }
        
        .value {
          font-size: var(--el-font-size-large);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
  
  .time-progress {
    .chart-title {
      font-size: var(--el-font-size-medium);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: var(--app-margin);
    }
    
    .time-info {
      margin-top: var(--app-margin);
      font-size: var(--el-font-size-small);
      color: var(--el-text-color-regular);
      
      div {
        margin-bottom: var(--spacing-xs);
      }
    }
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--app-gap);
  }
}

/* 深度选择器确保Element Plus组件主题一致 */
:deep(.el-descriptions) {
  .el-descriptions__header {
    background-color: var(--el-bg-color-page);
  }
  
  .el-descriptions__body {
    background-color: var(--el-bg-color);
  }
  
  .el-descriptions__cell {
    border-color: var(--el-border-color-lighter);
  }
}

:deep(.el-timeline) {
  .el-timeline-item__timestamp {
    color: var(--el-text-color-secondary);
  }
  
  .el-timeline-item__node {
    background-color: var(--el-color-primary);
  }
}

:deep(.el-progress) {
  .el-progress__text {
    color: var(--el-text-color-primary);
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] {
    .section-content {
      background: var(--el-bg-color-page);
      border-color: var(--el-border-color-darker);
    }
    
    .stats-grid {
      .stat-card {
        background: var(--el-bg-color);
        border-color: var(--el-border-color-darker);
      }
    }
  }

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--app-padding-sm);
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .progress-info {
      flex-direction: column;
      gap: var(--app-gap);
    }
    
    .action-buttons {
      .el-button {
        font-size: var(--el-font-size-small);
      }
    }
  }
}
</style> 