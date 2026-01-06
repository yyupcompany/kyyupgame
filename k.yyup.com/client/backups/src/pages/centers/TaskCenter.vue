<template>
  <UnifiedCenterLayout
    title="任务中心"
    description="这里是任务管理的核心枢纽，您可以创建任务、分配工作、跟踪进度、管理待办事项。"
    :full-width="true"
  >
    <template #header-actions>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建任务
      </el-button>
    </template>

    <!-- 直接使用 overview-content，不需要额外的容器 -->
    <div class="overview-content">

          <!-- 统计卡片区域 -->
          <div class="stats-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" :lg="6" v-for="stat in overviewStats" :key="stat.key">
            <StatCard
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
          </el-col>
        </el-row>
      </div>

      <!-- 任务列表区域 -->
      <div class="task-list-section">
        <div class="section-header">
          <h3>任务列表</h3>
          <div class="header-actions">
            <el-button @click="refreshTasks">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
        <div class="task-table-container">
          <el-table
            :data="taskList"
            :loading="tasksLoading"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="任务标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="getPriorityType(row.priority)"
                  size="small"
                >
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="getStatusType(row.status)"
                  size="small"
                >
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">
                  {{ getTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assignee" label="执行者" width="120">
              <template #default="{ row }">
                <span v-if="row.assignee">{{ row.assignee.username }}</span>
                <span v-else class="text-gray-400">未分配</span>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="100">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.progress || 0"
                  :stroke-width="6"
                  :show-text="false"
                />
                <span class="ml-2 text-sm">{{ row.progress || 0 }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="due_date" label="截止时间" width="120">
              <template #default="{ row }">
                <span v-if="row.due_date">
                  {{ formatDate(row.due_date) }}
                </span>
                <span v-else class="text-gray-400">无</span>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right" align="center">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button-group>
                    <el-button
                      type="primary"
                      size="small"
                      @click="handleEditTask(row)"
                    >
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="handleDeleteTask(row)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </el-button-group>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <ChartContainer
              title="任务完成趋势"
              subtitle="最近7天任务完成情况"
              :options="taskTrendChart"
              :loading="chartsLoading"
              height="300px"
              @refresh="refreshCharts"
            />
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <ChartContainer
              title="任务优先级分布"
              subtitle="当前任务优先级统计"
              :options="priorityDistributionChart"
              :loading="chartsLoading"
              height="300px"
              @refresh="refreshCharts"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 快速操作区域 -->
      <div class="quick-actions-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <div class="primary-actions">
              <ActionToolbar
                :primary-actions="quickActions"
                size="default"
                align="left"
                @action-click="handleQuickAction"
              />
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <div class="secondary-actions">
              <ActionToolbar
                :primary-actions="secondaryActions"
                size="default"
                align="right"
                @action-click="handleQuickAction"
              />
            </div>
          </el-col>
        </el-row>
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
    iconName: 'tasks'
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
  { key: 'view_my_tasks', label: '我的任务', type: 'success', icon: 'View' }
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
          iconName: 'tasks'
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
      itemStyle: { color: 'var(--primary-color)' }
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
  height: 100% !important;  // ✅ 充满父容器
  display: flex !important;  // ✅ 使用flex布局
  flex-direction: column !important;  // ✅ 垂直排列
  overflow: hidden !important;  // ✅ 防止内容溢出
  padding: var(--spacing-lg) !important;  // ✅ 添加内容边距
  margin: 0 !important;  // ✅ 移除margin
  max-width: none !important;  // ✅ 移除最大宽度限制
  width: 100% !important;  // ✅ 确保100%宽度
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
    color: white;
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
    margin-bottom: var(--spacing-lg);  // ✅ 使用设计令牌
    flex-shrink: 0;  // ✅ 防止被压缩
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
      margin-bottom: var(--spacing-md);  // ✅ 使用设计令牌
      flex-shrink: 0;  // ✅ 防止被压缩

      h3 {
        margin: 0;
        font-size: var(--text-lg);  // ✅ 使用设计令牌
        font-weight: var(--font-semibold);  // ✅ 使用设计令牌
        color: var(--text-primary);  // ✅ 使用设计令牌
      }

      .header-actions {
        display: flex;
        gap: var(--text-sm);
      }
    }

    .task-table-container {
      background: var(--bg-card);  // ✅ 使用设计令牌
      border-radius: var(--radius-lg);  // ✅ 使用设计令牌
      padding: 0;  // ✅ 移除padding，让表格自己处理
      box-shadow: var(--shadow-sm);  // ✅ 使用设计令牌
      border: var(--border-width-base) solid var(--border-color-light);  // ✅ 使用设计令牌
      flex: 1;  // ✅ 占据剩余空间
      overflow: hidden;  // ✅ 防止溢出
      min-height: 0;  // ✅ 允许flex子项收缩
      width: 100% !important;  // ✅ 确保容器宽度100%
      max-width: none !important;  // ✅ 移除最大宽度限制
      margin: 0 !important;  // ✅ 移除margin
    }

    .task-table-container :deep(.el-table) {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      table-layout: auto !important;

      // 表头样式
      .el-table__header-wrapper {
        position: sticky;
        top: 0;
        z-index: var(--z-index-sticky);
        overflow: visible !important;
        width: 100% !important;

        .el-table__header {
          width: 100% !important;
        }

        th {
          background: var(--bg-secondary);  // ✅ 使用设计令牌
          border-bottom: var(--transform-drop) solid var(--border-color-light);  // ✅ 使用设计令牌
          color: var(--text-primary);  // ✅ 使用设计令牌
          font-weight: var(--font-semibold);  // ✅ 使用设计令牌
          font-size: var(--text-sm);  // ✅ 使用设计令牌
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

        tr {
          &:hover > td {
            background: var(--bg-tertiary);  // ✅ 使用设计令牌
          }
        }

        td {
          border-bottom: var(--z-index-dropdown) solid var(--border-color-lighter);  // ✅ 使用设计令牌
          color: var(--text-primary);  // ✅ 使用设计令牌
          font-size: var(--text-sm);  // ✅ 使用设计令牌
        }
      }

      // 空状态样式
      .el-table__empty-block {
        background: transparent;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: var(--spacing-md);  // ✅ 使用设计令牌
    }
  }

  .charts-section {
    margin-bottom: var(--spacing-lg);  // ✅ 使用设计令牌
  }

  .quick-actions-section {
    .primary-actions,
    .secondary-actions {
      display: flex;
      align-items: center;
      height: 100%;
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .overview-content .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);  // ✅ 使用设计令牌
  }

  .task-center-timeline {
    padding: var(--spacing-md);  // ✅ 使用设计令牌
  }
}

// ✅ 暗黑主题样式 - 与业务中心保持一致
.dark {
  .task-center-timeline {
    background: var(--bg-secondary);  // ✅ 使用设计令牌
  }

  .task-table-container {
    background: var(--bg-card);  // ✅ 使用设计令牌
    backdrop-filter: blur(var(--text-2xl));
    border-color: var(--border-color-light);  // ✅ 使用设计令牌
    box-shadow: var(--shadow-md);  // ✅ 使用设计令牌
  }

  .section-header {
    h3 {
      color: var(--white-alpha-90);
    }
  }
}

// ✅ html.dark 兼容性
html.dark {
  .task-center-timeline {
    background: var(--bg-secondary, #0f172a);
  }

  .task-table-container {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(var(--text-2xl));
    border-color: rgba(71, 85, 105, 0.3);
    box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--shadow-heavy);
  }

  .section-header {
    h3 {
      color: var(--white-alpha-90);
    }
  }
}
</style>
