<template>
  <UnifiedCenterLayout
    title="任务中心"
    description="这里是任务管理的核心枢纽，您可以创建任务、分配工作、跟踪进度、管理待办事项。"
    :full-width="true"
  >
    <!-- 直接使用 overview-content，不需要额外的容器 -->
    <div class="overview-content">

          <!-- 统计卡片区域 - 使用统一网格系统 -->
          <div class="stats-section">
        <div class="stats-grid-unified">
          <StatCard
            v-for="stat in overviewStats"
            :key="stat.key"
            :title="stat.title"
            :value="stat.value"
            :unit="stat.unit"
            :trend="stat.trend"
            :trend-text="stat.trendText"
            :type="stat.type"
            :icon-name="stat.iconName"
            clickable
            @click="handleStatClick(stat)"
          />
        </div>
      </div>

      <!-- 任务列表区域 -->
      <div class="task-list-section">
        <div class="section-header">
          <h3>任务列表</h3>
          <div class="header-actions">
            <el-button @click="refreshTasks">
              <UnifiedIcon name="refresh" />
              刷新
            </el-button>
          </div>
        </div>
        <div class="task-table-container">
          <DataTable
            :data="taskList"
            :columns="taskColumns"
            :loading="tasksLoading"
            :total="pagination.total"
            :current-page="pagination.page"
            :page-size="pagination.pageSize"
            :selectable="true"
            :stripe="true"
            @selection-change="handleSelectionChange"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
          >
            <!-- Custom slots for priority, status, type columns -->
            <template #column-priority="{ row }">
              <span class="status-tag status-tag--priority" :class="`status-tag--${row.priority}`">
                {{ getPriorityText(row.priority) }}
              </span>
            </template>

            <template #column-status="{ row }">
              <span class="status-tag status-tag--status" :class="`status-tag--${row.status}`">
                {{ getStatusText(row.status) }}
              </span>
            </template>

            <template #column-type="{ row }">
              <span class="status-tag status-tag--type">
                {{ getTypeText(row.type) }}
              </span>
            </template>

            <template #column-assignee="{ row }">
              <span v-if="row.assignee">{{ row.assignee.username }}</span>
              <span v-else class="text-gray-400">未分配</span>
            </template>

            <template #column-progress="{ row }">
              <div class="progress-wrapper">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (row.progress || 0) + '%' }"></div>
                </div>
                <span class="progress-text">{{ row.progress || 0 }}%</span>
              </div>
            </template>

            <template #column-due_date="{ row }">
              <span v-if="row.due_date">{{ formatDate(row.due_date) }}</span>
              <span v-else class="text-gray-400">无</span>
            </template>

            <template #column-created_at="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </DataTable>
        </div>
      </div>

      <!-- 图表区域 - 使用统一网格系统 -->
      <div class="charts-section">
        <div class="charts-grid-unified">
          <ChartContainer
            title="任务完成趋势"
            subtitle="最近7天任务完成情况"
            :options="taskTrendChart"
            :loading="chartsLoading"
            height="300px"
            @refresh="refreshCharts"
          />
          <ChartContainer
            title="任务优先级分布"
            subtitle="当前任务优先级统计"
            :options="priorityDistributionChart"
            :loading="chartsLoading"
            height="300px"
            @refresh="refreshCharts"
          />
        </div>
      </div>

      <!-- 快速操作区域 - 使用统一网格系统 -->
      <div class="quick-actions-section">
        <div class="actions-grid-unified">
          <div class="primary-actions">
            <ActionToolbar
              :primary-actions="quickActions"
              size="default"
              align="left"
              @action-click="handleQuickAction"
            />
          </div>
          <div class="secondary-actions">
            <ActionToolbar
              :primary-actions="secondaryActions"
              size="default"
              align="right"
              @action-click="handleQuickAction"
            />
          </div>
        </div>
      </div>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted, computed, nextTick, watch, isRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Clock, User, Check, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import TaskFormDialog from '@/components/task/TaskFormDialog.vue'
import * as echarts from 'echarts'
import { getPrimaryColor } from '@/utils/color-tokens'
import { handleListResponse } from '@/utils/api-response-handler'
import {
  DataTable,
  StatCard,
  ChartContainer,
  DetailPanel,
  FormModal,
  ActionToolbar
} from '@/components/centers'
// 导入API服务
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatistics,
  type Task,
  type TaskStatistics
} from '@/api/task-center'

// 路由
const router = useRouter()
const route = useRoute()

// 当前活跃标签页
const activeTab = ref('overview')

// 页面加载状态
const isLoading = ref(true)

// 概览数据
const overviewStats = ref([
  {
    key: 'total_tasks',
    title: '总任务数',
    value: 156,
    unit: '个',
    trend: 12.5,
    trendText: '较上周',
    type: 'primary',
    iconName: 'list'
  },
  {
    key: 'completed_tasks',
    title: '已完成',
    value: 89,
    unit: '个',
    trend: 8.3,
    trendText: '较上周',
    type: 'success',
    iconName: 'check'
  },
  {
    key: 'pending_tasks',
    title: '进行中',
    value: 45,
    unit: '个',
    trend: -2.1,
    trendText: '较上周',
    type: 'warning',
    iconName: 'schedule'
  },
  {
    key: 'completion_rate',
    title: '完成率',
    value: 57.1,
    unit: '%',
    trend: 3.2,
    trendText: '较上周',
    type: 'info',
    iconName: 'analytics'
  }
])

// 图表数据
const chartsLoading = ref(false)
const taskTrendChart = ref({})
const priorityDistributionChart = ref({})

// 快速操作
const quickActions = [
  { key: 'create_task', label: '新建任务', type: 'primary', icon: 'Plus' },
  { key: 'view_my_tasks', label: '我的任务', type: 'success', icon: 'eye' }
]

const secondaryActions = [
  { key: 'export_report', label: '导出报表', icon: 'Download' },
  { key: 'task_templates', label: '任务模板', icon: 'Document' }
]

// 任务列表数据
const taskList = ref([])
const selectedTasks = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 任务管理数据
const tasksData = ref([])
const tasksLoading = ref(false)

// 任务列表列配置
const taskColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'title', label: '任务标题', minWidth: 200 },
  { prop: 'priority', label: '优先级', width: 100 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'type', label: '类型', width: 100 },
  { prop: 'assignee', label: '执行者', width: 120 },
  { prop: 'progress', label: '进度', width: 120 },
  { prop: 'due_date', label: '截止时间', width: 120 },
  { prop: 'created_at', label: '创建时间', width: 120 },
  {
    prop: 'actions',
    label: '操作',
    width: 180,
    fixed: 'right',
    align: 'center',
    type: 'actions' as const
  }
]

// 生命周期
onMounted(() => {
  initializeData()
})

// 初始化数据
const initializeData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      loadOverviewData(),
      loadTaskList()
    ])
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
}

// 加载概览数据
const loadOverviewData = async () => {
  try {
    chartsLoading.value = true

    // 调用真实的任务统计API
    const response = await getTaskStatistics()

    if (response.data) {
      const stats = response.data

      // 更新统计数据
      overviewStats.value = [
        {
          key: 'total_tasks',
          title: '总任务数',
          value: stats.totalTasks || 0,
          unit: '个',
          trend: 12.5,
          trendText: '较上周',
          type: 'primary',
          iconName: 'list'
        },
        {
          key: 'completed_tasks',
          title: '已完成',
          value: stats.completedTasks || 0,
          unit: '个',
          trend: 8.3,
          trendText: '较上周',
          type: 'success',
          iconName: 'check'
        },
        {
          key: 'pending_tasks',
          title: '进行中',
          value: stats.inProgressTasks || 0,
          unit: '个',
          trend: -2.1,
          trendText: '较上周',
          type: 'warning',
          iconName: 'schedule'
        },
        {
          key: 'completion_rate',
          title: '完成率',
          value: stats.completionRate || 0,
          unit: '%',
          trend: 3.2,
          trendText: '较上周',
          type: 'info',
          iconName: 'analytics'
        }
      ]
    }

    // 初始化图表
    initializeCharts()
  } catch (error) {
    console.error('加载概览数据失败:', error)
    ElMessage.error('加载概览数据失败')
  } finally {
    chartsLoading.value = false
  }
}

// 初始化图表
const initializeCharts = () => {
  // 任务完成趋势图
  taskTrendChart.value = {
    title: { text: '任务完成趋势' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [{
      name: '完成任务',
      type: 'line',
      data: [12, 15, 8, 20, 18, 10, 14],
      smooth: true,
      itemStyle: { color: getPrimaryColor() }
    }]
  }

  // 优先级分布图
  priorityDistributionChart.value = {
    title: { text: '任务优先级分布' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 35, name: '高优先级' },
        { value: 45, name: '中优先级' },
        { value: 20, name: '低优先级' }
      ]
    }]
  }
}

// 加载任务列表
const loadTaskList = async () => {
  try {
    tasksLoading.value = true
    const response = await getTasks({
      page: pagination.page,
      pageSize: pagination.pageSize
    })

    if (response.data) {
      taskList.value = response.data.data || response.data.tasks || []
      pagination.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
    ElMessage.error('加载任务列表失败')
  } finally {
    tasksLoading.value = false
  }
}

// 事件处理方法
const handleCreate = () => {
  handleCreateTask()
}

const handleCreateTask = () => {
  console.log('🚀 handleCreateTask 被调用')
  router.push('/centers/task/form')
  console.log('✅ 跳转到新建任务页面')
}

const handleEditTask = (task: Task) => {
  console.log('🚀 handleEditTask 被调用', task)
  router.push(`/centers/task/form?id=${task.id}`)
  console.log('✅ 跳转到编辑任务页面')
}

const handleDeleteTask = async (task: Task) => {
  try {
    await deleteTask(task.id)
    ElMessage.success('删除成功')
    await loadTaskList()
  } catch (error) {
    console.error('删除任务失败:', error)
    ElMessage.error('删除任务失败')
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedTasks.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadTaskList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadTaskList()
}

const refreshTasks = async () => {
  await loadTaskList()
}

const handleStatClick = (stat: any) => {
  // 根据统计卡片跳转到相应的标签页
  switch (stat.key) {
    case 'total_tasks':
      ElMessage.info('查看所有任务')
      break
    case 'completed_tasks':
      ElMessage.info('查看已完成任务')
      break
    case 'pending_tasks':
      ElMessage.info('查看进行中任务')
      break
    default:
      ElMessage.info('查看任务分析')
  }
}

const handleQuickAction = (action: any) => {
  switch (action.key) {
    case 'create_task':
      handleCreateTask()
      break
    case 'view_my_tasks':
      ElMessage.info('查看我的任务')
      break
    case 'export_report':
      handleExportReport()
      break
    case 'task_templates':
      handleTaskTemplates()
      break
  }
}

const refreshCharts = () => {
  loadOverviewData()
}

const handleExportReport = () => {
  ElMessage.info('导出报表功能开发中...')
}

const handleTaskTemplates = () => {
  ElMessage.info('任务模板功能开发中...')
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 优先级相关方法
const getPriorityType = (priority: string) => {
  const priorityMap = {
    'urgent': 'danger',
    'high': 'warning',
    'medium': 'primary',
    'low': 'info'
  }
  return priorityMap[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const priorityMap = {
    'urgent': '紧急',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return priorityMap[priority] || '未知'
}

// 状态相关方法
const getStatusType = (status: string) => {
  const statusMap = {
    'pending': 'warning',
    'in_progress': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 类型相关方法
const getTypeText = (type: string) => {
  const typeMap = {
    'enrollment': '招生',
    'activity': '活动',
    'daily': '日常',
    'management': '管理'
  }
  return typeMap[type] || '其他'
}
</script>

<style lang="scss" scoped>
/* 任务中心根容器 - 参考活动中心的标准样式 */
// 使用更强的CSS优先级来覆盖全局样式
.unified-center-layout .main-content.full-width .content-section.full-width,
:deep(.unified-center-layout .main-content.full-width .content-section.full-width) {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  padding: var(--spacing-lg) !important;
  margin: 0 !important;
  max-width: none !important;
  width: 100% !important;
}

.overview-content {
  flex: 1;  // ✅ 占据剩余空间
  display: flex;  // ✅ 使用flex布局
  flex-direction: column;  // ✅ 垂直排列
  overflow: hidden;  // ✅ 防止内容溢出
  min-height: 0;  // ✅ 允许flex子项收缩
  width: 100%;  // ✅ 确保100%宽度
  max-width: none;  // ✅ 移除最大宽度限制

  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);  // ✅ 使用设计令牌
    padding: var(--spacing-lg);  // ✅ 使用设计令牌
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);  // ✅ 使用统一变量
    border-radius: var(--radius-lg);  // ✅ 使用设计令牌
    color: var(--text-on-primary);
    box-shadow: var(--shadow-md);  // ✅ 使用设计令牌
    flex-shrink: 0;  // ✅ 防止被压缩
  }

  .welcome-content {
    h2 {
      margin: 0 0 var(--spacing-sm) 0;  // ✅ 使用设计令牌
      font-size: var(--text-xl);  // ✅ 使用设计令牌
      font-weight: var(--font-semibold);  // ✅ 使用设计令牌
    }

    p {
      margin: 0;
      font-size: var(--text-sm);  // ✅ 使用设计令牌
      opacity: 0.9;
      line-height: 1.5;
    }
  }

  .header-actions {
    .el-button {
      background: var(--white-alpha-20);
      border: var(--border-width-base) solid var(--glass-bg-heavy);
      color: white;

      &:hover {
        background: var(--white-alpha-30);
        border-color: var(--white-alpha-50);
      }
    }
  }

  .stats-section {
    margin-bottom: var(--spacing-xl);
    flex-shrink: 0;

    .stats-grid-unified {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);

      @media (max-width: 1400px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }
    }

    :deep(.stat-card) {
      border: none;
      box-shadow: var(--shadow-sm);
    }

    :deep(.stat-card::before) {
      height: 2px;
    }

    :deep(.stat-card--primary),
    :deep(.stat-card--success),
    :deep(.stat-card--warning),
    :deep(.stat-card--danger),
    :deep(.stat-card--info) {
      border-color: var(--border-color);
    }
  }

  /* 任务列表样式 */
  .task-list-section {
    flex: 1;  // ✅ 占据剩余空间
    display: flex;
    flex-direction: column;
    min-height: 0;  // ✅ 允许flex子项收缩
    overflow: hidden;  // ✅ 防止内容溢出

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-lg) var(--spacing-md);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: var(--border-width-thin) solid var(--border-color);
      flex-shrink: 0;

      h3 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        &::before {
          content: '';
          display: block;
          width: 4px;
          height: 20px;
          background: var(--primary-color);
          border-radius: var(--radius-xs);
        }
      }

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .task-table-container {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 0;
      box-shadow: var(--shadow-md);
      border: var(--border-width-thin) solid var(--border-color);
      flex: 1;
      overflow: hidden;
      min-height: 0;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
    }

    .table-wrapper {
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .task-table-container :deep(.el-table) {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      table-layout: auto !important;
      border-radius: var(--radius-lg);
      overflow: hidden;

      // 表格整体样式
      &.el-table--striped .el-table__body tr.el-table__row--striped td {
        background: var(--bg-page);
      }

      // 表格行的悬停效果
      .el-table__body-wrapper {
        tr {
          transition: background-color 0.2s ease;

          &:hover > td {
            background: var(--primary-light-bg) !important;
          }
        }

        tr.el-table__row--striped {
          &:hover > td {
            background: var(--primary-light-bg) !important;
          }
        }
      }

      // 选中行样式
      .el-table__body tr.current-row > td {
        background: var(--primary-light-bg) !important;
      }

      // 表头样式
      .el-table__header-wrapper {
        position: sticky;
        top: 0;
        z-index: 10;
        overflow: visible !important;
        width: 100% !important;

        .el-table__header {
          width: 100% !important;
        }

        th {
          background: var(--bg-page);
          border-bottom: var(--border-width-thin) solid var(--border-color);
          color: var(--text-primary);
          font-weight: var(--font-semibold);
          font-size: var(--text-sm);
          padding: var(--spacing-md) var(--spacing-sm);
        }
      }

      // 表体样式
      .el-table__body-wrapper {
        overflow-x: auto !important;
        overflow-y: auto !important;
        width: 100% !important;

        .el-table__body {
          width: 100% !important;
        }

        td {
          border-bottom: var(--border-width-thin) solid var(--border-color);
          color: var(--text-primary);
          font-size: var(--text-sm);
          padding: var(--spacing-md) var(--spacing-sm);
        }
      }

      // 自定义标签样式 - 更小的圆角和更好的配色
      .status-tag {
        display: inline-flex;
        align-items: center;
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--text-xs);
        font-weight: var(--font-medium);
        border-radius: var(--radius-sm);  // 更小的圆角
        line-height: 1.5;
        transition: all 0.2s ease;

        // 优先级标签
        &.status-tag--priority {
          &.status-tag--urgent {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }

          &.status-tag--high {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fde68a;
          }

          &.status-tag--medium {
            background: #dbeafe;
            color: #2563eb;
            border: 1px solid #bfdbfe;
          }

          &.status-tag--low {
            background: #f3f4f6;
            color: #6b7280;
            border: 1px solid #e5e7eb;
          }
        }

        // 状态标签
        &.status-tag--status {
          &.status-tag--pending {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fde68a;
          }

          &.status-tag--in_progress {
            background: #dbeafe;
            color: #2563eb;
            border: 1px solid #bfdbfe;
          }

          &.status-tag--completed {
            background: #d1fae5;
            color: #059669;
            border: 1px solid #a7f3d0;
          }

          &.status-tag--cancelled {
            background: #f3f4f6;
            color: #9ca3af;
            border: 1px solid #e5e7eb;
          }
        }

        // 类型标签
        &.status-tag--type {
          background: var(--bg-page);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }
      }

      // 自定义进度条样式
      .progress-wrapper {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .progress-bar {
          flex: 1;
          height: 6px;
          background: var(--bg-page);
          border-radius: var(--radius-sm);
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-hover) 100%);
            border-radius: var(--radius-sm);
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          min-width: 35px;
          text-align: right;
        }
      }

      // 空状态样式
      .el-table__empty-block {
        background: transparent;
      }

      // 操作按钮样式
      .table-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);

        .el-button {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: var(--text-sm);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;

          &.el-button--primary.is-link {
            color: var(--primary-color);

            &:hover {
              color: var(--primary-hover);
              background: var(--primary-light-bg);
            }
          }

          &.el-button--danger.is-link {
            color: var(--danger-color);

            &:hover {
              color: var(--danger-hover);
              background: var(--danger-light-bg);
            }
          }
        }

        .el-divider--vertical {
          height: 16px;
          margin: 0;
          border-color: var(--border-color);
        }
      }
    }
  }

  .charts-section {
    margin-bottom: var(--spacing-lg);

    .charts-grid-unified {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);

      @media (max-width: 1400px) {
        grid-template-columns: 1fr;
      }

      @media (max-width: var(--breakpoint-md)) {
        gap: var(--spacing-md);
      }
    }
  }

  .quick-actions-section {
    .actions-grid-unified {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--spacing-lg);

      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }
    }

    .primary-actions,
    .secondary-actions {
      display: flex;
      align-items: center;
      height: 100%;
    }
  }
}

// ✅ 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .overview-content .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }

  .task-list-section .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .task-table-container {
    padding: var(--spacing-md);
  }
}
</style>
