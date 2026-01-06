<template>
  <MobileMainLayout
    title="任务中心"
    :show-back="false"
  >
    <div class="mobile-task-center">
      <!-- 任务统计概览 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="stat in overviewStats"
            :key="stat.key"
            class="stat-card"
            @click="handleStatClick(stat)"
          >
            <div class="stat-content">
              <div class="stat-icon" :class="stat.type">
                <van-icon :name="getStatIcon(stat.iconName)" size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}{{ stat.unit }}</div>
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
                  <van-icon :name="stat.trend > 0 ? 'arrow-up' : 'arrow-down'" size="12" />
                  {{ Math.abs(stat.trend) }}%
                </div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 任务筛选器 -->
      <div class="filter-section">
        <van-cell-group inset>
          <van-field
            v-model="searchKeyword"
            placeholder="搜索任务..."
            clearable
            @clear="handleSearchClear"
            @input="handleSearch"
          >
            <template #left-icon>
              <van-icon name="search" />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 状态筛选 -->
        <div class="filter-tabs">
          <van-tabs v-model:active="activeStatusFilter" @change="handleStatusFilterChange">
            <van-tab title="全部" name="" />
            <van-tab title="待处理" name="pending" />
            <van-tab title="进行中" name="in_progress" />
            <van-tab title="已完成" name="completed" />
          </van-tabs>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="task-list-section">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="listLoading"
            :finished="finished"
            finished-text="没有更多了"
            @load="loadTasks"
          >
            <div
              v-for="task in taskList"
              :key="task.id"
              class="task-item"
              @click="handleTaskClick(task)"
            >
              <div class="task-header">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-actions">
                  <van-dropdown-menu>
                    <van-dropdown-item>
                      <div class="task-dropdown">
                        <van-button size="small" type="primary" @click.stop="handleEditTask(task)">
                          <van-icon name="edit" />
                          编辑
                        </van-button>
                        <van-button size="small" type="danger" @click.stop="handleDeleteTask(task)">
                          <van-icon name="delete" />
                          删除
                        </van-button>
                      </div>
                    </van-dropdown-item>
                  </van-dropdown-menu>
                </div>
              </div>

              <div class="task-meta">
                <div class="task-tags">
                  <van-tag
                    :type="getPriorityType(task.priority)"
                    size="small"
                  >
                    {{ getPriorityText(task.priority) }}
                  </van-tag>
                  <van-tag
                    :type="getStatusType(task.status)"
                    size="small"
                  >
                    {{ getStatusText(task.status) }}
                  </van-tag>
                  <van-tag size="small" plain>
                    {{ getTypeText(task.type) }}
                  </van-tag>
                </div>
                <div class="task-assignee" v-if="task.assignee">
                  <div class="assignee-avatar">
                    {{ task.assignee.username.charAt(0) }}
                  </div>
                  <span>{{ task.assignee.username }}</span>
                </div>
                <div class="task-assignee" v-else>
                  <van-icon name="user-circle-o" size="16" />
                  <span>未分配</span>
                </div>
              </div>

              <div class="task-progress" v-if="task.progress !== undefined">
                <div class="progress-label">进度：{{ task.progress }}%</div>
                <van-progress
                  :percentage="task.progress"
                  :show-pivot="false"
                  stroke-width="4"
                />
              </div>

              <div class="task-footer">
                <div class="task-dates">
                  <div class="task-date">
                    <van-icon name="clock" size="14" />
                    创建：{{ formatDate(task.created_at) }}
                  </div>
                  <div class="task-date" v-if="task.due_date">
                    <van-icon name="calendar" size="14" />
                    截止：{{ formatDate(task.due_date) }}
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="!loading && taskList.length === 0">
        <van-empty description="暂无任务" />
        <van-button
          type="primary"
          block
          icon="plus"
          @click="handleCreateTask"
          class="mt-4"
        >
          创建第一个任务
        </van-button>
      </div>

      <!-- 任务创建/编辑弹窗 -->
      <van-popup
        v-model:show="showTaskForm"
        position="bottom"
        :style="{ height: '90%' }"
        round
        closeable
        close-icon="cross"
      >
        <div class="task-form-popup">
          <div class="form-header">
            <h3>{{ editingTask ? '编辑任务' : '新建任务' }}</h3>
          </div>

          <div class="form-content">
            <van-form @submit="handleTaskSubmit">
              <van-cell-group inset>
                <van-field
                  v-model="taskForm.title"
                  label="任务标题"
                  placeholder="请输入任务标题"
                  :rules="[{ required: true, message: '请输入任务标题' }]"
                />

                <van-field
                  v-model="taskForm.description"
                  label="任务描述"
                  type="textarea"
                  placeholder="请输入任务描述"
                  rows="3"
                />

                <van-field name="priority" label="优先级">
                  <template #input>
                    <van-radio-group v-model="taskForm.priority" direction="horizontal">
                      <van-radio name="low">低</van-radio>
                      <van-radio name="medium">中</van-radio>
                      <van-radio name="high">高</van-radio>
                      <van-radio name="urgent">紧急</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>

                <van-field name="status" label="状态">
                  <template #input>
                    <van-radio-group v-model="taskForm.status" direction="horizontal">
                      <van-radio name="pending">待处理</van-radio>
                      <van-radio name="in_progress">进行中</van-radio>
                      <van-radio name="completed">已完成</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>

                <van-field
                  v-model="taskForm.type"
                  label="任务类型"
                  placeholder="请选择任务类型"
                >
                  <template #right-icon>
                    <van-icon name="arrow" />
                  </template>
                </van-field>

                <van-field
                  v-model="taskForm.dueDate"
                  label="截止时间"
                  placeholder="请选择截止时间"
                  readonly
                  @click="showDatePicker = true"
                />

                <van-field
                  v-model="taskForm.progress"
                  label="进度"
                  type="number"
                  placeholder="请输入进度百分比"
                  :max="100"
                  :min="0"
                />
              </van-cell-group>

              <div class="form-actions">
                <van-button
                  type="primary"
                  native-type="submit"
                  block
                  :loading="submitting"
                >
                  {{ editingTask ? '更新任务' : '创建任务' }}
                </van-button>
              </div>
            </van-form>
          </div>
        </div>
      </van-popup>

      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="selectedDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>
    </div>

    <!-- 悬浮操作按钮 -->
    <FabButton
      icon="plus"
      @click="handleCreateTask"
    />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import FabButton from '@/components/mobile/FabButton.vue'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatistics,
  type Task,
  type TaskStatistics,
  type CreateTaskData
} from '@/api/task-center'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const submitting = ref(false)

// 任务列表
const taskList = ref<Task[]>([])
const searchKeyword = ref('')
const activeStatusFilter = ref('')

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 统计数据
const overviewStats = ref([
  {
    key: 'total_tasks',
    title: '总任务数',
    value: 0,
    unit: '个',
    trend: 12.5,
    trendText: '较上周',
    type: 'primary',
    iconName: 'tasks'
  },
  {
    key: 'completed_tasks',
    title: '已完成',
    value: 0,
    unit: '个',
    trend: 8.3,
    trendText: '较上周',
    type: 'success',
    iconName: 'check'
  },
  {
    key: 'pending_tasks',
    title: '进行中',
    value: 0,
    unit: '个',
    trend: -2.1,
    trendText: '较上周',
    type: 'warning',
    iconName: 'schedule'
  },
  {
    key: 'completion_rate',
    title: '完成率',
    value: 0,
    unit: '%',
    trend: 3.2,
    trendText: '较上周',
    type: 'info',
    iconName: 'analytics'
  }
])

// 任务表单
const showTaskForm = ref(false)
const editingTask = ref<Task | null>(null)
const showDatePicker = ref(false)
const selectedDate = ref(new Date())

const taskForm = reactive<CreateTaskData>({
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  type: '',
  dueDate: ''
})

// 生命周期
onMounted(() => {
  initializeData()
})

// 初始化数据
const initializeData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadTaskStatistics(),
      loadTasks()
    ])
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadTaskStatistics = async () => {
  try {
    const response = await getTaskStatistics()
    if (response.data) {
      const stats = response.data

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
          value: Math.round(stats.completionRate || 0),
          unit: '%',
          trend: 3.2,
          trendText: '较上周',
          type: 'info',
          iconName: 'analytics'
        }
      ]
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载任务列表
const loadTasks = async (reset = false) => {
  if (reset) {
    pagination.page = 1
    finished.value = false
    taskList.value = []
  }

  try {
    listLoading.value = true
    const response = await getTasks({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchKeyword.value,
      status: activeStatusFilter.value
    })

    if (response.data) {
      const newTasks = response.data.data || response.data.tasks || []

      if (reset) {
        taskList.value = newTasks
      } else {
        taskList.value.push(...newTasks)
      }

      pagination.total = response.data.total || 0

      // 判断是否加载完成
      if (taskList.value.length >= pagination.total || newTasks.length < pagination.pageSize) {
        finished.value = true
      } else {
        pagination.page++
      }
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
    showToast('加载任务列表失败')
  } finally {
    listLoading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await loadTasks(true)
  showToast('刷新成功')
}

// 搜索处理
const handleSearch = () => {
  loadTasks(true)
}

const handleSearchClear = () => {
  searchKeyword.value = ''
  loadTasks(true)
}

// 状态筛选处理
const handleStatusFilterChange = () => {
  loadTasks(true)
}

// 创建任务
const handleCreateTask = () => {
  router.push('/mobile/centers/task-form')
}

// 编辑任务
const handleEditTask = (task: Task) => {
  router.push({
    path: '/mobile/centers/task-form',
    query: { id: task.id }
  })
}

// 删除任务
const handleDeleteTask = async (task: Task) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除任务"${task.title}"吗？`
    })

    await deleteTask(task.id)
    showToast('删除成功')
    await loadTasks(true)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error)
      showToast('删除任务失败')
    }
  }
}

// 任务点击
const handleTaskClick = (task: Task) => {
  // 可以跳转到任务详情页或展开详情面板
  console.log('点击任务:', task.title)
}

// 统计卡片点击
const handleStatClick = (stat: any) => {
  switch (stat.key) {
    case 'total_tasks':
      activeStatusFilter.value = ''
      loadTasks(true)
      break
    case 'completed_tasks':
      activeStatusFilter.value = 'completed'
      loadTasks(true)
      break
    case 'pending_tasks':
      activeStatusFilter.value = 'in_progress'
      loadTasks(true)
      break
    default:
      showToast('查看任务分析')
  }
}

// 任务表单提交
const handleTaskSubmit = async () => {
  try {
    submitting.value = true

    if (editingTask.value) {
      // 更新任务
      await updateTask(editingTask.value.id, taskForm)
      showToast('任务更新成功')
    } else {
      // 创建任务
      await createTask(taskForm)
      showToast('任务创建成功')
    }

    showTaskForm.value = false
    await Promise.all([
      loadTasks(true),
      loadTaskStatistics()
    ])
  } catch (error) {
    console.error('保存任务失败:', error)
    showToast(editingTask.value ? '任务更新失败' : '任务创建失败')
  } finally {
    submitting.value = false
  }
}

// 日期选择确认
const onDateConfirm = () => {
  taskForm.dueDate = selectedDate.value.toISOString().split('T')[0]
  showDatePicker.value = false
}

// 重置表单
const resetTaskForm = () => {
  taskForm.title = ''
  taskForm.description = ''
  taskForm.priority = 'medium'
  taskForm.status = 'pending'
  taskForm.type = ''
  taskForm.dueDate = ''
}

// 获取统计图标
const getStatIcon = (iconName: string) => {
  const iconMap: Record<string, string> = {
    'tasks': 'orders-o',
    'check': 'checked',
    'schedule': 'clock-o',
    'analytics': 'chart-trending-o'
  }
  return iconMap[iconName] || 'info-o'
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

// 日期格式化
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-task-center {
  padding: var(--spacing-md);
  background: var(--van-background-color-light);
  min-height: 100vh;
}

// 统计卡片区域
.stats-section {
  margin-bottom: 16px;

  .stat-card {
    background: var(--card-bg);
    border-radius: 12px;
    overflow: hidden;

    .stat-content {
      padding: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;

        &.primary { background: linear-gradient(135deg, #409EFF, #66b1ff); }
        &.success { background: linear-gradient(135deg, #67C23A, #85ce61); }
        &.warning { background: linear-gradient(135deg, #E6A23C, #ebb563); }
        &.info { background: linear-gradient(135deg, #909399, #a6a9ad); }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: 4px;
        }

        .stat-title {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: 4px;
        }

        .stat-trend {
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 2px;

          &.positive { color: var(--success-color); }
          &.negative { color: var(--danger-color); }
        }
      }
    }
  }
}

// 筛选区域
.filter-section {
  margin-bottom: 16px;

  .filter-tabs {
    margin-top: 12px;

    :deep(.van-tabs__nav) {
      padding: 0;
      background: var(--card-bg);
      border-radius: 8px;
    }
  }
}

// 任务列表区域
.task-list-section {
  margin-bottom: 16px;
}

.task-item {
  background: var(--card-bg);
  border-radius: 12px;
  padding: var(--spacing-md);
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .task-title {
      flex: 1;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin-right: 8px;
      line-height: 1.4;
    }

    .task-actions {
      :deep(.van-dropdown-menu__title) {
        padding: 0;
        height: auto;
      }
    }
  }

  .task-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .task-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .task-assignee {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-xs);
      color: var(--van-text-color-2);

      .assignee-avatar {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--van-primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xs);
        font-weight: var(--van-font-bold);
        flex-shrink: 0;
      }

      span {
        white-space: nowrap;
      }
    }
  }

  .task-progress {
    margin-bottom: 12px;

    .progress-label {
      font-size: var(--text-xs);
      color: var(--van-text-color-2);
      margin-bottom: 6px;
    }
  }

  .task-footer {
    border-top: 1px solid var(--van-border-color);
    padding-top: 12px;

    .task-dates {
      display: flex;
      justify-content: space-between;
      gap: var(--spacing-md);

      .task-date {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
        white-space: nowrap;
        flex: 1;
      }
    }
  }
}

// 任务表单弹窗
.task-form-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .form-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .form-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
  }

  .form-actions {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--van-border-color);
  }
}

// 任务下拉菜单
.task-dropdown {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;

  .mt-4 {
    margin-top: 16px;
  }
}

// 响应式设计
@media (min-width: 768px) {
  .mobile-task-center {
    max-width: 768px;
    margin: 0 auto;
  }
}

// 深色模式适配
:root[data-theme="dark"] {
  .mobile-task-center {
    background: var(--van-background-color-dark);
  }

  .stat-card,
  .task-item {
    background: var(--van-background-color-dark);
    border-color: var(--van-border-color-dark);
  }

  .task-header .task-title {
    color: var(--van-text-color-dark);
  }

  .task-footer {
    border-top-color: var(--van-border-color-dark);
  }

  .task-form-popup {
    .form-header,
    .form-actions {
      border-color: var(--van-border-color-dark);
    }
  }
}
</style>