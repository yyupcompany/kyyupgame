<template>
  <UnifiedCenterLayout
    title="任务中心"
    description="管理您的日常任务，提高工作效率"
    icon="Document"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="handleCreateTask">
        <UnifiedIcon name="plus" :size="16" />
        新建任务
      </el-button>
      <el-button @click="refreshTasks">
        <UnifiedIcon name="refresh" :size="16" />
        刷新
      </el-button>
    </template>

    <!-- 统计卡片 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <StatCard
        icon="document"
        title="全部任务"
        :value="taskStats.total"
        subtitle="总任务数"
        type="primary"
        :trend="taskStats.total > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="check"
        title="已完成"
        :value="taskStats.completed"
        subtitle="完成数量"
        type="success"
        :trend="taskStats.completed > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="clock"
        title="进行中"
        :value="taskStats.pending"
        subtitle="待处理任务"
        type="warning"
        :trend="taskStats.pending > 0 ? 'down' : 'stable'"
        clickable
      />
      <StatCard
        icon="warning"
        title="已逾期"
        :value="taskStats.overdue"
        subtitle="逾期任务"
        type="danger"
        :trend="taskStats.overdue > 0 ? 'down' : 'stable'"
        clickable
      />
    </template>

    <div class="center-container teacher-tasks">

    <!-- 统计与进度综合区域 -->
    <div class="stats-progress-section">
      <el-row :gutter="32">
        <!-- 左侧：任务统计 -->
        <el-col :xs="24" :sm="24" :md="10" :lg="8">
          <el-card class="stats-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <UnifiedIcon name="default" />
                  任务统计
                </span>
              </div>
            </template>

            <div class="stats-grid-compact">
              <div class="stat-item-horizontal">
                <div class="stat-icon total">
                  <UnifiedIcon name="default" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ taskStats.total }}</div>
                  <div class="stat-label">全部任务</div>
                </div>
              </div>

              <div class="stat-item-horizontal">
                <div class="stat-icon completed">
                  <UnifiedIcon name="Check" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ taskStats.completed }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </div>

              <div class="stat-item-horizontal">
                <div class="stat-icon pending">
                  <UnifiedIcon name="default" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ taskStats.pending }}</div>
                  <div class="stat-label">进行中</div>
                </div>
              </div>

              <div class="stat-item-horizontal">
                <div class="stat-icon overdue">
                  <UnifiedIcon name="default" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ taskStats.overdue }}</div>
                  <div class="stat-label">已逾期</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：完成率进度 -->
        <el-col :xs="24" :sm="24" :md="14" :lg="16">
          <el-card class="progress-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <UnifiedIcon name="default" />
                  完成进度
                </span>
                <span class="progress-percentage" :style="{ color: progressColor }">
                  {{ completionPercentage }}%
                </span>
              </div>
            </template>

            <div class="progress-content-enhanced">
              <div class="progress-main">
                <el-progress
                  :percentage="completionPercentage"
                  :stroke-width="16"
                  :show-text="false"
                  :color="progressColor"
                  class="main-progress-bar"
                />
              </div>

              <div class="progress-stats-enhanced">
                <div class="progress-item-enhanced">
                  <div class="progress-icon">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="progress-info">
                    <span class="progress-label">本周完成</span>
                    <span class="progress-number">{{ weeklyCompleted }}</span>
                  </div>
                </div>
                <div class="progress-item-enhanced">
                  <div class="progress-icon">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="progress-info">
                    <span class="progress-label">本月完成</span>
                    <span class="progress-number">{{ monthlyCompleted }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="filter-section">
        <el-card>
          <div class="filter-form">
            <el-row :gutter="16">
              <el-col :xs="24" :sm="8" :md="6">
                <el-form-item label="状态筛选">
                  <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="待处理" value="pending" />
                    <el-option label="进行中" value="in_progress" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已逾期" value="overdue" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8" :md="6">
                <el-form-item label="优先级">
                  <el-select v-model="filterForm.priority" placeholder="选择优先级" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="高" value="high" />
                    <el-option label="中" value="medium" />
                    <el-option label="低" value="low" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8" :md="6">
                <el-form-item label="搜索">
                  <el-input
                    v-model="filterForm.keyword"
                    placeholder="搜索任务标题或内容"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="6">
                <div class="filter-actions">
                  <el-button @click="handleSearch">
                    <UnifiedIcon name="Search" />
                    搜索
                  </el-button>
                  <el-button @click="handleResetFilter">重置</el-button>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>

      <!-- 任务列表 -->
      <div class="table-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <UnifiedIcon name="default" />
                任务列表
              </span>
              <div class="card-actions">
                <el-button :disabled="selectedTasks.length === 0" @click="handleBatchComplete">
                  批量完成
                </el-button>
                <el-button :disabled="selectedTasks.length === 0" @click="handleBatchDelete">
                  批量删除
                </el-button>
              </div>
            </div>
          </template>

          <div class="table-container">
            <div class="table-wrapper">
<el-table class="responsive-table"
              :data="taskList"
              @selection-change="handleSelectionChange"
              style="width: 100%"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="title" label="任务" min-width="200">
                <template #default="{ row }">
                  <div class="task-info">
                    <div class="task-title">{{ row.title }}</div>
                    <div class="task-description">{{ row.description }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100">
                <template #default="{ row }">
                  <el-tag
                    :type="row.priority === 'high' ? 'danger' : row.priority === 'medium' ? 'warning' : 'info'"
                    size="small"
                  >
                    {{ row.priority === 'high' ? '高' : row.priority === 'medium' ? '中' : '低' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag
                    :type="row.status === 'completed' ? 'success' : row.status === 'in_progress' ? 'warning' : row.status === 'overdue' ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ row.status === 'completed' ? '已完成' : row.status === 'in_progress' ? '进行中' : row.status === 'overdue' ? '已逾期' : '待处理' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="dueDate" label="截止时间" width="120">
                <template #default="{ row }">
                  <span>{{ row.dueDate }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="progress" label="进度" width="120">
                <template #default="{ row }">
                  <div class="progress-cell">
                    <el-progress :percentage="row.progress" :show-text="false" :stroke-width="6" />
                    <span class="progress-text">{{ row.progress }}%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-button size="small" @click="handleViewTask(row)">查看</el-button>
                    <el-button size="small" @click="handleEditTask(row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="row.status === 'completed' ? 'warning' : 'success'"
                      @click="handleToggleComplete(row)"
                    >
                      {{ row.status === 'completed' ? '重新打开' : '完成' }}
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDeleteTask(row)">删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
</div>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <div class="pagination-info">
              共 {{ pagination.total }} 条
            </div>
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="pagination.total"
              layout="sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>
    </div>

    <!-- 完成率环形图 -->
    <div class="completion-chart">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="card-title">任务完成率</span>
            <span class="completion-rate">{{ completionPercentage }}%</span>
          </div>
        </template>
        <div class="chart-container">
          <el-progress 
            type="circle" 
            :percentage="completionPercentage"
            :width="120"
            :stroke-width="8"
            :color="progressColor"
          />
          <div class="chart-details">
            <div class="detail-item">
              <span class="label">本周完成：</span>
              <span class="value">{{ weeklyCompleted }}</span>
            </div>
            <div class="detail-item">
              <span class="label">本月完成：</span>
              <span class="value">{{ monthlyCompleted }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card>
        <el-form :model="filterForm" inline>
          <el-form-item label="状态筛选">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="待处理" value="pending" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
              <el-option label="已逾期" value="overdue" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="filterForm.priority" placeholder="选择优先级" clearable>
              <el-option label="全部" value="" />
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </el-form-item>
          <el-form-item label="搜索">
            <el-input 
              v-model="filterForm.keyword" 
              placeholder="搜索任务标题或内容"
              clearable
              style="max-width: 200px; width: 100%"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">
              <UnifiedIcon name="Search" />
              搜索
            </el-button>
            <el-button @click="handleResetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-list">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="card-title">任务列表</span>
            <div class="list-actions">
              <el-button size="small" @click="handleBatchComplete" :disabled="selectedTasks.length === 0">
                批量完成
              </el-button>
              <el-button size="small" @click="handleBatchDelete" :disabled="selectedTasks.length === 0">
                批量删除
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table class="responsive-table" 
          :data="taskList" 
          v-loading="loading"
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="任务" min-width="200">
            <template #default="{ row }">
              <div class="task-info">
                <div class="task-title" :class="{ 'completed': row.status === 'completed' }">
                  {{ row.title }}
                </div>
                <div class="task-description">{{ row.description }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="截止时间" width="150">
            <template #default="{ row }">
              <div class="due-date" :class="{ 'overdue': isOverdue(row.dueDate) }">
                {{ formatDate(row.dueDate) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="120">
            <template #default="{ row }">
              <el-progress 
                :percentage="row.progress || 0" 
                :stroke-width="6"
                :show-text="false"
              />
              <span class="progress-text">{{ row.progress || 0 }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleViewTask(row)">
                查看
              </el-button>
              <el-button size="small" @click="handleEditTask(row)">
                编辑
              </el-button>
              <el-button 
                size="small" 
                :type="row.status === 'completed' ? 'warning' : 'success'"
                @click="handleToggleComplete(row)"
              >
                {{ row.status === 'completed' ? '重新打开' : '完成' }}
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteTask(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
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
      </el-card>
    </div>

    <!-- 任务详情弹窗 -->
    <TaskDetail
      v-model="taskDetailVisible"
      :task="currentTask"
      @save="handleSaveTask"
      @delete="handleDeleteTask"
    />
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/centers/StatCard.vue'

import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { teacherTasksApi, type Task, type TaskStats } from '@/api/modules/teacher-tasks'

// 导入组件
import TaskDetail from './components/TaskDetail.vue'

// 响应式数据
const loading = ref(false)
const taskDetailVisible = ref(false)
const currentTask = ref(null)
const selectedTasks = ref([])

// 团队协作概览数据
const teamOverview = reactive({
  totalMembers: 0,
  sharedTasks: 0,
  pendingApprovals: 0,
  urgentDeadlines: 0,
  myRanking: 0
})

// 任务统计
const taskStats = reactive({
  total: 0,
  completed: 0,
  pending: 0,
  overdue: 0
})

// 完成率数据
const weeklyCompleted = ref(0)
const monthlyCompleted = ref(0)

// 筛选表单
const filterForm = reactive({
  status: '',
  priority: '',
  keyword: ''
})

// 任务列表
const taskList = ref([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 计算属性
const completionPercentage = computed(() => {
  if (taskStats.total === 0) return 0
  return Math.round((taskStats.completed / taskStats.total) * 100)
})

const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return 'var(--el-color-success)'
  if (percentage >= 60) return 'var(--el-color-warning)'
  return 'var(--el-color-danger)'
})

// 方法
const handleCreateTask = () => {
  currentTask.value = null
  taskDetailVisible.value = true
}

const handleViewTask = (task: any) => {
  currentTask.value = task
  taskDetailVisible.value = true
}

const handleEditTask = (task: any) => {
  currentTask.value = { ...task }
  taskDetailVisible.value = true
}

const handleToggleComplete = async (task: any) => {
  try {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    // 调用API更新任务状态
    await teacherTasksApi.updateTaskStatus(task.id, newStatus)
    task.status = newStatus
    task.progress = newStatus === 'completed' ? 100 : task.progress
    ElMessage.success(newStatus === 'completed' ? '任务已完成' : '任务已重新打开')
    await loadTasks()
  } catch (error) {
    console.error('更新任务状态失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleDeleteTask = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '确认删除', {
      type: 'warning'
    })
    // 调用API删除任务
    await teacherTasksApi.deleteTask(task.id)
    ElMessage.success('任务已删除')
    await loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSaveTask = async (taskData: any) => {
  try {
    // 调用API保存任务
    if (taskData.id) {
      await teacherTasksApi.updateTask(taskData.id, taskData)
    } else {
      await teacherTasksApi.createTask(taskData)
    }
    ElMessage.success('任务保存成功')
    taskDetailVisible.value = false
    await loadTasks()
  } catch (error) {
    console.error('保存任务失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedTasks.value = selection
}

const handleBatchComplete = async () => {
  try {
    await ElMessageBox.confirm(`确定要批量完成 ${selectedTasks.value.length} 个任务吗？`, '批量操作', {
      type: 'warning'
    })
    // 调用API批量完成任务
    const taskIds = selectedTasks.value.map((task: any) => task.id)
    await teacherTasksApi.batchCompleteTask(taskIds)
    ElMessage.success('批量操作成功')
    selectedTasks.value = []
    await loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量完成任务失败:', error)
      ElMessage.error('批量操作失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要批量删除 ${selectedTasks.value.length} 个任务吗？`, '批量删除', {
      type: 'warning'
    })
    // 调用API批量删除任务
    const taskIds = selectedTasks.value.map((task: any) => task.id)
    await teacherTasksApi.batchDeleteTask(taskIds)
    ElMessage.success('批量删除成功')
    selectedTasks.value = []
    await loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除任务失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

const handleFilter = () => {
  pagination.page = 1
  loadTasks()
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    status: '',
    priority: '',
    keyword: ''
  })
  pagination.page = 1
  loadTasks()
}

const handleSearch = () => {
  pagination.page = 1
  loadTasks()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadTasks()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadTasks()
}

const refreshTasks = () => {
  loadTasks()
}

// 工具方法
const getPriorityType = (priority: string) => {
  const typeMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const textMap = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || '中'
}

const getStatusType = (status: string) => {
  const typeMap = {
    'pending': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return textMap[status] || '待处理'
}

const isOverdue = (dueDate: string) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadTeamOverview = async () => {
  try {
    // 模拟团队协作数据
    teamOverview.totalMembers = 12
    teamOverview.sharedTasks = 8
    teamOverview.pendingApprovals = 3
    teamOverview.urgentDeadlines = 2
    teamOverview.myRanking = 4
  } catch (error) {
    console.error('加载团队协作数据失败:', error)
  }
}

const loadTasks = async () => {
  loading.value = true
  try {
    // 并发加载团队协作、任务统计和任务列表
    const [teamResult, statsResult, tasksResult] = await Promise.all([
      loadTeamOverview().catch(error => {
        console.error('团队协作数据加载失败:', error)
        return null
      }),
      teacherTasksApi.getTaskStats().catch(error => {
        console.error('获取任务统计失败:', error)
        // 返回null而不是模拟数据，让前端显示加载失败
        return null
      }),
      teacherTasksApi.getTaskList({
        page: pagination.page,
        limit: pagination.pageSize,
        status: filterForm.status || undefined,
        priority: filterForm.priority || undefined
      }).catch(error => {
        console.error('获取任务列表失败:', error)
        // 返回null而不是模拟数据，让前端显示加载失败
        return null
      })
    ])

    // 更新统计数据
    console.log('🔍 处理统计数据:', statsResult)
    if (statsResult) {
      Object.assign(taskStats, statsResult)

      // 更新周/月完成数（使用后端提供的数据）
      if ((statsResult as any).weeklyCompleted !== undefined) {
        weeklyCompleted.value = (statsResult as any).weeklyCompleted
        console.log('✅ 周完成数更新:', weeklyCompleted.value)
      }
      if ((statsResult as any).monthlyCompleted !== undefined) {
        monthlyCompleted.value = (statsResult as any).monthlyCompleted
        console.log('✅ 月完成数更新:', monthlyCompleted.value)
      }
      console.log('✅ 任务统计更新成功:', taskStats)
    } else {
      // 如果统计数据加载失败，显示错误提示
      console.warn('⚠️ 任务统计加载失败')
      ElMessage.warning('任务统计加载失败，请刷新重试')
    }

    // 更新任务列表 - 修复数据处理逻辑
    console.log('🔍 处理任务列表数据:', tasksResult)

    // 适配实际的API返回结构
    let taskData = []
    let totalCount = 0

    if (tasksResult) {
      // 检查是否是转换后的结构 {tasks: [...], total: ...}
      if (Array.isArray(tasksResult.tasks)) {
        taskData = tasksResult.tasks
        totalCount = tasksResult.total || 0
        console.log('✅ 使用转换后的数据结构')
      }
      // 检查是否是原始的API结构 {list: [...], total: ...}
      else if (Array.isArray(tasksResult.list)) {
        taskData = tasksResult.list
        totalCount = tasksResult.total || 0
        console.log('✅ 使用原始API数据结构')
      }

      taskList.value = taskData
      pagination.total = totalCount

      console.log('✅ 任务列表更新成功:', {
        taskCount: taskData.length,
        total: totalCount,
        tasks: taskData
      })
    } else {
      // 只有在API完全失败时才使用空数据
      taskList.value = []
      pagination.total = 0
      console.log('⚠️ 任务列表为空或API失败，tasksResult:', tasksResult)
      ElMessage.error('加载任务列表失败，请刷新重试')
    }
  } catch (error) {
    console.error('加载任务失败:', error)
    ElMessage.error('加载任务失败，请刷新重试')
    taskList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTasks()
})
</script>

<style lang="scss" scoped>
@use "@/styles/design-tokens.scss" as *;

/* ==================== 老师任务中心页面 ==================== */

/* ==================== 页面容器 ==================== */
.teacher-tasks {
  padding: var(--spacing-xl);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

/* ==================== 统计与进度综合区域 ==================== */
.stats-progress-section {
  margin-bottom: var(--spacing-xl);

  .el-row {
    margin: 0;
  }

  .el-col {
    padding: var(--spacing-md);
  }

  .stats-card,
  .progress-card {
    height: 100%;

    :deep(.el-card) {
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color-lighter);
      background: var(--bg-card);
      height: 100%;
      transition: all var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-md);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        font-size: var(--text-base);
        color: var(--el-text-color-primary);
      }

      .progress-percentage {
        font-size: var(--text-2xl);
        font-weight: 700;
        color: var(--el-color-success);
      }
    }
  }

  .stats-grid-compact {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .stat-item-horizontal {
      display: flex;
      align-items: center;
      padding: var(--spacing-lg);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color-lighter);
      transition: all var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-sm);
        border-color: var(--el-color-primary-light-3);
      }

      .stat-icon {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xl);
        margin-right: var(--spacing-md);

        &.total {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }

        &.completed {
          background: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }

        &.pending {
          background: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }

        &.overdue {
          background: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--el-text-color-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
          font-weight: 500;
        }
      }
    }
  }

  .progress-content-enhanced {
    .progress-main {
      margin-bottom: var(--spacing-lg);

      .main-progress-bar {
        :deep(.el-progress-bar__outer) {
          border-radius: var(--radius-md);
          background-color: var(--el-fill-color-light);
        }

        :deep(.el-progress-bar__inner) {
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }
      }
    }

    .progress-stats-enhanced {
      display: flex;
      gap: var(--spacing-lg);

      .progress-item-enhanced {
        display: flex;
        align-items: center;
        flex: 1;
        padding: var(--spacing-md);
        background: var(--bg-card);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color-lighter);

        .progress-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--spacing-md);
          font-size: var(--text-lg);
        }

        .progress-info {
          flex: 1;

          .progress-label {
            display: block;
            font-size: var(--text-sm);
            color: var(--el-text-color-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .progress-number {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }
}

/* ==================== 筛选区域 ==================== */
.filter-section {
  margin-bottom: var(--spacing-xl);

  :deep(.el-card) {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color-lighter);
    background: var(--bg-card);
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

/* ==================== 任务列表区域 ==================== */
.main-content {
  margin-bottom: var(--spacing-xl);

  .table-section {
    :deep(.el-card) {
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color-lighter);
      background: var(--bg-card);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        font-size: var(--text-base);
        color: var(--el-text-color-primary);
      }

      .card-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }
}

.table-container {
  .table-wrapper {
    :deep(.el-table) {
      border-radius: var(--radius-md);
      overflow: hidden;

      &::before {
        display: none;
      }

      th.el-table__cell {
        background: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
        font-weight: 600;
      }

      tr:hover > td.el-table__cell {
        background: var(--el-fill-color-light);
      }
    }
  }
}

.task-info {
  .task-title {
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
    color: var(--el-text-color-primary);

    &.completed {
      text-decoration: line-through;
      opacity: 0.6;
    }
  }

  .task-description {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 300px;
  }
}

.due-date {
  font-size: var(--text-sm);
  color: var(--el-text-color-primary);

  &.overdue {
    color: var(--el-color-danger);
    font-weight: 500;
  }
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .progress-text {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-lighter);

  .pagination-info {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}

/* ==================== 完成率环形图 ==================== */
.completion-chart {
  margin-bottom: var(--spacing-xl);

  :deep(.el-card) {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color-lighter);
    background: var(--bg-card);
    transition: all var(--transition-base);

    &:hover {
      box-shadow: var(--shadow-md);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-weight: 600;
      font-size: var(--text-base);
      color: var(--el-text-color-primary);
    }

    .completion-rate {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-color-success);
    }
  }

  .chart-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);

    .chart-details {
      flex: 1;

      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-sm) 0;
        border-bottom: 1px solid var(--border-color-lighter);

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: var(--el-text-color-secondary);
          font-size: var(--text-sm);
        }

        .value {
          font-weight: 600;
          color: var(--el-text-color-primary);
          font-size: var(--text-base);
        }
      }
    }
  }
}

/* ==================== 任务列表样式 ==================== */
.tasks-list {
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;

  :deep(.el-card) {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color-lighter);
    background: var(--bg-card);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-weight: 600;
      font-size: var(--text-base);
      color: var(--el-text-color-primary);
    }

    .list-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .pagination {
    margin-top: var(--spacing-xl);
    display: flex;
    justify-content: center;
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-color-lighter);
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-md)) {
  .teacher-tasks {
    padding: var(--spacing-md);
  }

  .page-header {
    .header-content {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;

      .header-left {
        h1 {
          font-size: var(--text-lg);

          &::before {
            width: var(--spacing-xs);
            height: var(--spacing-lg);
          }
        }

        p {
          padding-left: var(--spacing-md);
        }
      }

      .header-actions {
        width: 100%;
        flex-wrap: wrap;

        .el-button {
          flex: 1;
          min-width: 80px;
        }
      }
    }
  }

  .filter-section {
    :deep(.el-form) {
      flex-direction: column;

      .el-form-item {
        margin-bottom: var(--spacing-sm);
      }
    }
  }

  .stats-progress-section {
    .progress-content-enhanced {
      .progress-stats-enhanced {
        flex-direction: column;
        gap: var(--spacing-md);
      }
    }
  }

  .completion-chart {
    .chart-container {
      flex-direction: column;
      gap: var(--spacing-lg);
    }
  }

  .pagination-container {
    flex-direction: column;
    gap: var(--spacing-md);

    .pagination-info {
      align-self: flex-start;
    }

    :deep(.el-pagination) {
      justify-content: center;
    }
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>
