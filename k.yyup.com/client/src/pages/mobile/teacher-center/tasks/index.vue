<template>
  <MobileMainLayout
    title="任务中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-teacher-tasks">
      <!-- 页面头部操作区 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">任务中心</h1>
          <p class="page-description">管理您的日常任务，提高工作效率</p>
        </div>
        <div class="header-actions">
          <van-button 
            type="primary" 
            size="small" 
            icon="plus" 
            @click="handleCreateTask"
          >
            新建任务
          </van-button>
          <van-button 
            size="small" 
            icon="replay" 
            @click="refreshTasks"
          >
            刷新
          </van-button>
        </div>
      </div>

      <!-- 团队协作概览 -->
      <div class="team-overview-section">
        <van-card class="team-overview-card">
          <template #title>
            <div class="card-title">
              <van-icon name="friends-o" />
              团队协作概览
              <van-tag type="primary" size="small">{{ teamOverview.totalMembers }}位成员</van-tag>
            </div>
          </template>
          
          <div class="team-grid">
            <div class="team-item">
              <div class="team-value">{{ teamOverview.sharedTasks }}</div>
              <div class="team-label">共享任务</div>
              <div class="team-trend info">需要协作完成</div>
            </div>
            <div class="team-item">
              <div class="team-value">{{ teamOverview.pendingApprovals }}</div>
              <div class="team-label">待我审批</div>
              <div class="team-trend warning">需要处理</div>
            </div>
            <div class="team-item">
              <div class="team-value">{{ teamOverview.urgentDeadlines }}</div>
              <div class="team-label">紧急截止</div>
              <div class="team-trend danger">需要关注</div>
            </div>
            <div class="team-item">
              <div class="team-value">#{{ teamOverview.myRanking }}</div>
              <div class="team-label">我的排名</div>
              <div class="team-trend success">本月完成度</div>
            </div>
          </div>
        </van-card>
      </div>

      <!-- 任务统计区域 -->
      <div class="task-stats-section">
        <van-card class="stats-card">
          <template #title>
            <div class="card-title">
              <van-icon name="chart-trending-o" />
              任务统计
            </div>
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon total">
                <van-icon name="apps-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ taskStats.total }}</div>
                <div class="stat-label">全部任务</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon completed">
                <van-icon name="success" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ taskStats.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon pending">
                <van-icon name="clock-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ taskStats.pending }}</div>
                <div class="stat-label">进行中</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon overdue">
                <van-icon name="warning-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ taskStats.overdue }}</div>
                <div class="stat-label">已逾期</div>
              </div>
            </div>
          </div>
        </van-card>
      </div>

      <!-- 完成进度区域 -->
      <div class="progress-section">
        <van-card class="progress-card">
          <template #title>
            <div class="card-title">
              <van-icon name="bar-chart-o" />
              完成进度
              <span class="progress-percentage" :style="{ color: progressColor }">
                {{ completionPercentage }}%
              </span>
            </div>
          </template>
          
          <div class="progress-content">
            <div class="progress-main">
              <van-progress
                :percentage="completionPercentage"
                stroke-width="8"
                :color="progressColor"
                track-color="#f0f0f0"
              />
            </div>
            
            <div class="progress-stats">
              <div class="progress-item">
                <div class="progress-icon">
                  <van-icon name="calendar-o" />
                </div>
                <div class="progress-info">
                  <span class="progress-label">本周完成</span>
                  <span class="progress-number">{{ weeklyCompleted }}</span>
                </div>
              </div>
              
              <div class="progress-item">
                <div class="progress-icon">
                  <van-icon name="label-o" />
                </div>
                <div class="progress-info">
                  <span class="progress-label">本月完成</span>
                  <span class="progress-number">{{ monthlyCompleted }}</span>
                </div>
              </div>
            </div>
          </div>
        </van-card>
      </div>

      <!-- 筛选和搜索区域 -->
      <div class="filter-section">
        <van-card class="filter-card">
          <div class="filter-form">
            <van-field
              v-model="filterForm.keyword"
              placeholder="搜索任务标题或内容"
              clearable
              left-icon="search"
            />
            
            <div class="filter-row">
              <van-field
                v-model="filterForm.status"
                placeholder="状态筛选"
                readonly
                is-link
                @click="showStatusPicker = true"
                left-icon="filter-o"
              />
              
              <van-field
                v-model="filterForm.priority"
                placeholder="优先级"
                readonly
                is-link
                @click="showPriorityPicker = true"
                left-icon="fire-o"
              />
            </div>
            
            <div class="filter-actions">
              <van-button type="primary" size="small" @click="handleSearch">
                <van-icon name="search" />
                搜索
              </van-button>
              <van-button size="small" @click="handleResetFilter">重置</van-button>
            </div>
          </div>
        </van-card>
      </div>

      <!-- 任务列表 -->
      <div class="task-list-section">
        <van-card class="task-list-card">
          <template #title>
            <div class="list-header">
              <div class="list-title">
                <van-icon name="list-switch" />
                任务列表
                <span class="task-count">({{ pagination.total }})</span>
              </div>
              <div class="list-actions">
                <van-button 
                  size="mini" 
                  :disabled="selectedTasks.length === 0" 
                  @click="handleBatchComplete"
                >
                  批量完成
                </van-button>
                <van-button 
                  size="mini" 
                  type="danger"
                  :disabled="selectedTasks.length === 0" 
                  @click="handleBatchDelete"
                >
                  批量删除
                </van-button>
              </div>
            </div>
          </template>

          <!-- 任务列表内容 -->
          <div class="task-list-content">
            <van-checkbox-group v-model="selectedTaskIds" @change="handleSelectionChange">
              <van-swipe-cell
                v-for="task in taskList"
                :key="task.id"
                class="task-swipe-cell"
              >
                <van-cell-group inset class="task-cell-group">
                  <van-cell>
                    <template #title>
                      <div class="task-header">
                        <van-checkbox
                          :name="task.id"
                          class="task-checkbox"
                          @click.stop
                        />
                        <div class="task-info">
                          <div class="task-title" :class="{ 'completed': task.status === 'completed' }">
                            {{ task.title }}
                          </div>
                          <div class="task-description">{{ task.description }}</div>
                        </div>
                        <van-tag
                          :type="getPriorityType(task.priority)"
                          size="small"
                        >
                          {{ getPriorityText(task.priority) }}
                        </van-tag>
                      </div>
                    </template>
                  </van-cell>
                  
                  <van-cell>
                    <template #title>
                      <div class="task-meta">
                        <div class="meta-item">
                          <span class="meta-label">状态:</span>
                          <van-tag
                            :type="getStatusType(task.status)"
                            size="small"
                          >
                            {{ getStatusText(task.status) }}
                          </van-tag>
                        </div>
                        
                        <div class="meta-item">
                          <span class="meta-label">截止:</span>
                          <span class="meta-value" :class="{ 'overdue': isOverdue(task.dueDate) }">
                            {{ formatDate(task.dueDate) }}
                          </span>
                        </div>
                      </div>
                    </template>
                  </van-cell>
                  
                  <van-cell v-if="task.progress !== undefined">
                    <template #title>
                      <div class="task-progress">
                        <span class="progress-label">进度:</span>
                        <div class="progress-bar">
                          <van-progress
                            :percentage="task.progress"
                            stroke-width="4"
                            :show-text="false"
                          />
                        </div>
                        <span class="progress-text">{{ task.progress }}%</span>
                      </div>
                    </template>
                  </van-cell>
                  
                  <van-cell>
                    <template #title>
                      <div class="task-actions">
                        <van-button
                          size="mini"
                          @click="handleViewTask(task)"
                        >
                          查看
                        </van-button>
                        <van-button
                          size="mini"
                          @click="handleEditTask(task)"
                        >
                          编辑
                        </van-button>
                        <van-button
                          size="mini"
                          :type="task.status === 'completed' ? 'warning' : 'success'"
                          @click="handleToggleComplete(task)"
                        >
                          {{ task.status === 'completed' ? '重新打开' : '完成' }}
                        </van-button>
                        <van-button
                          size="mini"
                          type="danger"
                          @click="handleDeleteTask(task)"
                        >
                          删除
                        </van-button>
                      </div>
                    </template>
                  </van-cell>
                </van-cell-group>

                <!-- 右侧滑动操作 -->
                <template #right>
                  <van-button
                    square
                    type="primary"
                    text="完成"
                    @click="handleToggleComplete(task)"
                  />
                  <van-button
                    square
                    type="danger"
                    text="删除"
                    @click="handleDeleteTask(task)"
                  />
                </template>
              </van-swipe-cell>
            </van-checkbox-group>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <van-pagination
              v-model="pagination.page"
              :total-items="pagination.total"
              :items-per-page="pagination.pageSize"
              :show-page-size="3"
              force-ellipses
              @change="handleCurrentChange"
            />
          </div>
        </van-card>
      </div>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && taskList.length === 0"
        description="暂无任务数据"
        image="search"
      >
        <van-button type="primary" @click="handleCreateTask">创建第一个任务</van-button>
      </van-empty>

      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>
    </div>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>

    <!-- 优先级选择器 -->
    <van-popup v-model:show="showPriorityPicker" position="bottom">
      <van-picker
        :columns="priorityColumns"
        @confirm="onPriorityConfirm"
        @cancel="showPriorityPicker = false"
      />
    </van-popup>

    <!-- 悬浮新建按钮 -->
    <van-button
      type="primary"
      size="large"
      round
      icon="plus"
      class="fab-button"
      @click="handleCreateTask"
    />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
import { teacherTasksApi, type Task, type TaskStats } from '@/api/modules/teacher-tasks'

// 导入布局组件
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

// 响应式数据
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const showStatusPicker = ref(false)
const showPriorityPicker = ref(false)
const selectedTasks = ref([])
const selectedTaskIds = ref([])

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
  overdue: 0,
  inProgress: 0
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
  pageSize: 10,
  total: 0
})

// 选择器配置
const statusColumns = [
  { text: '全部', value: '' },
  { text: '待处理', value: 'pending' },
  { text: '进行中', value: 'in_progress' },
  { text: '已完成', value: 'completed' },
  { text: '已逾期', value: 'overdue' }
]

const priorityColumns = [
  { text: '全部', value: '' },
  { text: '高', value: 'high' },
  { text: '中', value: 'medium' },
  { text: '低', value: 'low' }
]

// 计算属性
const completionPercentage = computed(() => {
  if (taskStats.total === 0) return 0
  return Math.round((taskStats.completed / taskStats.total) * 100)
})

const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return '#07c160'
  if (percentage >= 60) return '#409eff'
  return '#ee0a24'
})

// 方法
const handleCreateTask = () => {
  router.push('/mobile/teacher-center/tasks/create')
}

const handleViewTask = (task: Task) => {
  router.push(`/mobile/teacher-center/tasks/detail?id=${task.id}`)
}

const handleEditTask = (task: Task) => {
  router.push(`/mobile/teacher-center/tasks/edit?id=${task.id}`)
}

const handleToggleComplete = async (task: Task) => {
  try {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await teacherTasksApi.updateTaskStatus(task.id, newStatus)
    
    showSuccessToast(newStatus === 'completed' ? '任务已完成' : '任务已重新打开')
    await loadTasks()
  } catch (error) {
    console.error('更新任务状态失败:', error)
    showToast('操作失败')
  }
}

const handleDeleteTask = async (task: Task) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个任务吗？',
    })
    
    await teacherTasksApi.deleteTask(task.id)
    showSuccessToast('任务已删除')
    await loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error)
      showToast('删除失败')
    }
  }
}

const handleSelectionChange = (selectedIds: string[]) => {
  selectedTasks.value = taskList.value.filter(task => selectedIds.includes(String(task.id)))
}

const handleBatchComplete = async () => {
  try {
    await showConfirmDialog({
      title: '批量操作',
      message: `确定要批量完成 ${selectedTasks.value.length} 个任务吗？`,
    })
    
    const taskIds = selectedTasks.value.map((task: Task) => task.id)
    await teacherTasksApi.batchCompleteTask(taskIds)
    showSuccessToast('批量操作成功')
    selectedTaskIds.value = []
    await loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量完成任务失败:', error)
      showToast('批量操作失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await showConfirmDialog({
      title: '批量删除',
      message: `确定要批量删除 ${selectedTasks.value.length} 个任务吗？`,
    })
    
    const taskIds = selectedTasks.value.map((task: Task) => task.id)
    await teacherTasksApi.batchDeleteTask(taskIds)
    showSuccessToast('批量删除成功')
    selectedTaskIds.value = []
    await loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除任务失败:', error)
      showToast('批量删除失败')
    }
  }
}

const handleSearch = () => {
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

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadTasks()
}

const refreshTasks = () => {
  loadTasks()
}

const onStatusConfirm = ({ selectedValues }: any) => {
  filterForm.status = selectedValues[0]
  showStatusPicker.value = false
  if (selectedValues[0]) {
    filterForm.status = statusColumns.find(col => col.value === selectedValues[0])?.text || ''
  }
}

const onPriorityConfirm = ({ selectedValues }: any) => {
  filterForm.priority = selectedValues[0]
  showPriorityPicker.value = false
  if (selectedValues[0]) {
    filterForm.priority = priorityColumns.find(col => col.value === selectedValues[0])?.text || ''
  }
}

// 工具方法
const getPriorityType = (priority: string) => {
  const typeMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'default'
  }
  return typeMap[priority] || 'default'
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
    'pending': 'default',
    'in_progress': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'default'
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
    // 模拟团队协作数据，实际应该调用API
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
    // 并发加载数据
    const [teamResult, statsResult, tasksResult] = await Promise.all([
      loadTeamOverview().catch(error => {
        console.error('团队协作数据加载失败:', error)
        return null
      }),
      teacherTasksApi.getTaskStats().catch(error => {
        console.error('获取任务统计失败:', error)
        return null
      }),
      teacherTasksApi.getTaskList({
        page: pagination.page,
        limit: pagination.pageSize,
        status: filterForm.status || undefined,
        priority: filterForm.priority || undefined,
        keyword: filterForm.keyword || undefined
      }).catch(error => {
        console.error('获取任务列表失败:', error)
        return null
      })
    ])

    // 更新统计数据
    if (statsResult) {
      Object.assign(taskStats, statsResult)
      
      if ((statsResult as any).weeklyCompleted !== undefined) {
        weeklyCompleted.value = (statsResult as any).weeklyCompleted
      }
      if ((statsResult as any).monthlyCompleted !== undefined) {
        monthlyCompleted.value = (statsResult as any).monthlyCompleted
      }
    }

    // 更新任务列表
    if (tasksResult) {
      taskList.value = tasksResult.tasks || []
      pagination.total = tasksResult.total || 0
    } else {
      taskList.value = []
      pagination.total = 0
      showToast('加载任务列表失败，请刷新重试')
    }
  } catch (error) {
    console.error('加载任务失败:', error)
    showToast('加载任务失败，请刷新重试')
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
@import '@/styles/mobile-base.scss';
.mobile-teacher-tasks {
  padding: 0 0 20px 0;
  background-color: #f7f8fa;
  min-height: calc(100vh - 46px - 50px); // 减去导航栏和底部标签栏高度
}

.page-header {
  background: var(--primary-gradient);
  color: white;
  padding: var(--spacing-lg) 16px 16px;
  
  .header-content {
    margin-bottom: 16px;
    
    .page-title {
      font-size: var(--text-2xl);
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    
    .page-description {
      font-size: var(--text-sm);
      opacity: 0.9;
      margin: 0;
    }
  }
  
  .header-actions {
    display: flex;
    gap: var(--spacing-md);
  }
}

.team-overview-section,
.task-stats-section,
.progress-section,
.filter-section,
.task-list-section {
  margin: var(--spacing-md) 16px;
  
  .card-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 600;
    font-size: var(--text-base);
    
    .van-tag {
      margin-left: auto;
    }
  }
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  
  .team-item {
    text-align: center;
    padding: var(--spacing-md);
    background: #f8f9fa;
    border-radius: 8px;
    
    .team-value {
      font-size: var(--text-2xl);
      font-weight: bold;
      color: #667eea;
      margin-bottom: 4px;
    }
    
    .team-label {
      font-size: var(--text-sm);
      color: #323233;
      margin-bottom: 4px;
    }
    
    .team-trend {
      font-size: var(--text-xs);
      padding: 2px 6px;
      border-radius: 4px;
      
      &.success {
        color: #07c160;
        background-color: #f0f9ff;
      }
      
      &.warning {
        color: #ff976a;
        background-color: #fff7e8;
      }
      
      &.danger {
        color: #ee0a24;
        background-color: #fff0f0;
      }
      
      &.info {
        color: var(--primary-color);
        background-color: #ecf5ff;
      }
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  
  .stat-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    background: #f8f9fa;
    border-radius: 8px;
    
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: var(--text-lg);
      
      &.total {
        background: #ecf5ff;
        color: var(--primary-color);
      }
      
      &.completed {
        background: #f0f9ff;
        color: #07c160;
      }
      
      &.pending {
        background: #fff7e8;
        color: #ff976a;
      }
      
      &.overdue {
        background: #fff0f0;
        color: #ee0a24;
      }
    }
    
    .stat-content {
      flex: 1;
      
      .stat-value {
        font-size: var(--text-xl);
        font-weight: 600;
        color: #323233;
        line-height: 1;
        margin-bottom: 2px;
      }
      
      .stat-label {
        font-size: var(--text-xs);
        color: #969799;
      }
    }
  }
}

.progress-content {
  .progress-main {
    margin-bottom: 20px;
  }
  
  .progress-stats {
    display: flex;
    gap: var(--spacing-md);
    
    .progress-item {
      flex: 1;
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: #f8f9fa;
      border-radius: 8px;
      
      .progress-icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: #ecf5ff;
        color: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
      }
      
      .progress-info {
        flex: 1;
        
        .progress-label {
          display: block;
          font-size: var(--text-xs);
          color: #969799;
          margin-bottom: 2px;
        }
        
        .progress-number {
          font-size: var(--text-base);
          font-weight: 600;
          color: #323233;
        }
      }
    }
  }
  
  .progress-percentage {
    font-size: var(--text-lg);
    font-weight: 700;
    margin-left: auto;
  }
}

.filter-form {
  .filter-row {
    display: flex;
    gap: var(--spacing-md);
    margin: var(--spacing-md) 0;
  }
  
  .filter-actions {
    display: flex;
    gap: var(--spacing-md);
    margin-top: 16px;
  }
}

.task-list-content {
  .task-swipe-cell {
    margin-bottom: 12px;
  }
  
  .task-cell-group {
    .task-header {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      
      .task-checkbox {
        flex-shrink: 0;
        margin-top: 4px;
      }
      
      .task-info {
        flex: 1;
        
        .task-title {
          font-size: var(--text-base);
          font-weight: 500;
          color: #323233;
          margin-bottom: 4px;
          
          &.completed {
            text-decoration: line-through;
            opacity: 0.6;
          }
        }
        
        .task-description {
          font-size: var(--text-sm);
          color: #969799;
          line-height: 1.4;
        }
      }
    }
    
    .task-meta {
      .meta-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .meta-label {
          font-size: var(--text-sm);
          color: #969799;
          margin-right: 8px;
          min-width: 40px;
        }
        
        .meta-value {
          font-size: var(--text-sm);
          color: #323233;
          
          &.overdue {
            color: #ee0a24;
            font-weight: 500;
          }
        }
      }
    }
    
    .task-progress {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      
      .progress-label {
        font-size: var(--text-sm);
        color: #969799;
        min-width: 40px;
      }
      
      .progress-bar {
        flex: 1;
      }
      
      .progress-text {
        font-size: var(--text-xs);
        color: #969799;
        min-width: 35px;
        text-align: right;
      }
    }
    
    .task-actions {
      display: flex;
      gap: var(--spacing-sm);
      
      .van-button {
        flex: 1;
      }
    }
  }
}

.list-header {
  .list-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 600;
    
    .task-count {
      font-size: var(--text-sm);
      color: #969799;
      font-weight: normal;
    }
  }
  
  .list-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: 8px;
  }
}

.pagination {
  margin-top: 16px;
  text-align: center;
}

.fab-button {
  position: fixed;
  right: 16px;
  bottom: 80px; // 为底部导航栏留空间
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-teacher-tasks {
    max-width: 768px;
    margin: 0 auto;
  }
  
  .team-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

// Vant组件样式覆盖
:deep(.van-card) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-cell-group--inset) {
  margin: 0;
  border-radius: 8px;
}

:deep(.van-progress) {
  border-radius: 4px;
}

:deep(.van-swipe-cell__right) {
  display: flex;
}
</style>