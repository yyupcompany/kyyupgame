<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '85%' }"
    round
    closeable
    @closed="handleClosed"
  >
    <div class="task-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-icon name="todo-list-o" size="24" color="#409eff" />
        <h3>招生任务管理</h3>
      </div>

      <!-- 任务统计 -->
      <div class="task-stats">
        <div class="stat-item">
          <div class="stat-value">{{ tasks.length }}</div>
          <div class="stat-label">总任务</div>
        </div>
        <div class="stat-item">
          <div class="stat-value warning">{{ pendingTasks }}</div>
          <div class="stat-label">待处理</div>
        </div>
        <div class="stat-item">
          <div class="stat-value success">{{ completedTasks }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button type="primary" size="small" @click="showAddTask = true">
          <van-icon name="plus" />
          添加任务
        </van-button>
        <van-button size="small" @click="showFilter = true">
          <van-icon name="filter-o" />
          筛选
        </van-button>
      </div>

      <!-- 任务列表 -->
      <div class="task-list">
        <van-loading v-if="loading" size="24px" vertical>加载中...</van-loading>
        <van-empty v-else-if="filteredTasks.length === 0" description="暂无任务" />
        <div v-else class="task-items">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <div class="task-main">
              <van-checkbox
                v-model="task.completed"
                @change="handleToggleTask(task)"
              />
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-desc">{{ task.description }}</div>
                <div class="task-meta">
                  <van-tag :type="getPriorityType(task.priority)" size="small">
                    {{ getPriorityText(task.priority) }}
                  </van-tag>
                  <span class="task-date">{{ formatDate(task.dueDate) }}</span>
                </div>
              </div>
            </div>
            <div class="task-actions">
              <van-button size="small" @click="handleEditTask(task)">编辑</van-button>
              <van-button size="small" type="danger" @click="handleDeleteTask(task)">删除</van-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加/编辑任务弹窗 -->
      <van-popup v-model:show="showAddTask" position="bottom" round>
        <div class="add-task-form">
          <div class="form-header">
            <van-icon name="arrow-left" @click="showAddTask = false" />
            <span>{{ editingTask ? '编辑任务' : '添加任务' }}</span>
          </div>
          <van-form @submit="handleSaveTask">
            <van-cell-group inset>
              <van-field
                v-model="taskForm.title"
                name="title"
                label="任务标题"
                placeholder="输入任务标题"
                :rules="[{ required: true, message: '请输入任务标题' }]"
              />
              <van-field
                v-model="taskForm.description"
                name="description"
                label="任务描述"
                type="textarea"
                placeholder="输入任务描述"
                rows="3"
              />
              <van-field
                v-model="taskForm.dueDate"
                name="dueDate"
                label="截止日期"
                placeholder="选择日期"
                readonly
                is-link
                @click="showDatePicker = true"
              />
              <van-field
                name="priority"
                label="优先级"
                placeholder="选择优先级"
                readonly
                is-link
                :value="getPriorityText(taskForm.priority)"
                @click="showPriorityPicker = true"
              />
            </van-cell-group>
            <div class="form-actions">
              <van-button type="primary" block native-type="submit">保存</van-button>
            </div>
          </van-form>
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

      <!-- 优先级选择器 -->
      <van-popup v-model:show="showPriorityPicker" position="bottom">
        <van-picker
          :columns="priorityColumns"
          @confirm="onPriorityConfirm"
          @cancel="showPriorityPicker = false"
        />
      </van-popup>

      <!-- 筛选弹窗 -->
      <van-popup v-model:show="showFilter" position="bottom" round>
        <div class="filter-popup">
          <div class="filter-header">
            <span>筛选任务</span>
            <van-button size="small" @click="resetFilter">重置</van-button>
          </div>
          <van-cell-group inset>
            <van-field
              name="status"
              label="状态"
              placeholder="选择状态"
              readonly
              is-link
              :value="filterStatus === 'all' ? '全部' : filterStatus === 'completed' ? '已完成' : '待处理'"
              @click="showStatusPicker = true"
            />
            <van-field
              name="priority"
              label="优先级"
              placeholder="选择优先级"
              readonly
              is-link
              :value="filterPriority === 'all' ? '全部' : getPriorityText(filterPriority)"
              @click="showFilterPriorityPicker = true"
            />
          </van-cell-group>
          <div class="filter-actions">
            <van-button type="primary" block @click="applyFilter">应用筛选</van-button>
          </div>
        </div>
      </van-popup>

      <!-- 状态选择器 -->
      <van-popup v-model:show="showStatusPicker" position="bottom">
        <van-picker
          :columns="statusColumns"
          @confirm="onStatusConfirm"
          @cancel="showStatusPicker = false"
        />
      </van-popup>

      <!-- 优先级筛选选择器 -->
      <van-popup v-model:show="showFilterPriorityPicker" position="bottom">
        <van-picker
          :columns="filterPriorityColumns"
          @confirm="onFilterPriorityConfirm"
          @cancel="showFilterPriorityPicker = false"
        />
      </van-popup>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'

interface Task {
  id: number
  title: string
  description: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const showAddTask = ref(false)
const showDatePicker = ref(false)
const showPriorityPicker = ref(false)
const showFilter = ref(false)
const showStatusPicker = ref(false)
const showFilterPriorityPicker = ref(false)
const editingTask = ref<Task | null>(null)

const tasks = ref<Task[]>([
  {
    id: 1,
    title: '跟进潜在客户张先生',
    description: '介绍幼儿园特色课程，解答疑问',
    dueDate: '2026-01-10',
    priority: 'high',
    completed: false
  },
  {
    id: 2,
    title: '整理本月招生数据',
    description: '统计咨询量、转化率等关键指标',
    dueDate: '2026-01-15',
    priority: 'medium',
    completed: false
  },
  {
    id: 3,
    title: '准备开放日活动',
    description: '协调教师、准备宣传材料',
    dueDate: '2026-01-20',
    priority: 'high',
    completed: false
  }
])

const selectedDate = ref(new Date())
const filterStatus = ref<'all' | 'completed' | 'pending'>('all')
const filterPriority = ref<'all' | 'high' | 'medium' | 'low'>('all')

const taskForm = reactive({
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium' as 'high' | 'medium' | 'low'
})

const priorityColumns = [
  { text: '高', value: 'high' },
  { text: '中', value: 'medium' },
  { text: '低', value: 'low' }
]

const statusColumns = [
  { text: '全部', value: 'all' },
  { text: '已完成', value: 'completed' },
  { text: '待处理', value: 'pending' }
]

const filterPriorityColumns = [
  { text: '全部', value: 'all' },
  ...priorityColumns
]

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const pendingTasks = computed(() => tasks.value.filter(t => !t.completed).length)
const completedTasks = computed(() => tasks.value.filter(t => t.completed).length)

const filteredTasks = computed(() => {
  let result = [...tasks.value]
  if (filterStatus.value !== 'all') {
    result = result.filter(t => filterStatus.value === 'completed' ? t.completed : !t.completed)
  }
  if (filterPriority.value !== 'all') {
    result = result.filter(t => t.priority === filterPriority.value)
  }
  return result
})

const getPriorityType = (priority: string) => {
  const types: Record<string, any> = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'success'
  }
  return types[priority] || 'default'
}

const getPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return texts[priority] || priority
}

const formatDate = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const handleToggleTask = (task: Task) => {
  showToast(task.completed ? '任务已完成' : '任务已恢复')
}

const handleEditTask = (task: Task) => {
  editingTask.value = task
  Object.assign(taskForm, {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority
  })
  showAddTask.value = true
}

const handleDeleteTask = async (task: Task) => {
  tasks.value = tasks.value.filter(t => t.id !== task.id)
  showToast('任务已删除')
}

const handleSaveTask = () => {
  if (!taskForm.title) {
    showToast('请输入任务标题')
    return
  }

  if (editingTask.value) {
    // 编辑现有任务
    const index = tasks.value.findIndex(t => t.id === editingTask.value!.id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority
      }
    }
  } else {
    // 添加新任务
    tasks.value.push({
      id: Date.now(),
      title: taskForm.title,
      description: taskForm.description,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      completed: false
    })
  }

  showToast(editingTask.value ? '任务已更新' : '任务已添加')
  showAddTask.value = false
  editingTask.value = null
  resetTaskForm()
}

const onDateConfirm = ({ selectedValues }: any) => {
  const [year, month, day] = selectedValues
  taskForm.dueDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  showDatePicker.value = false
}

const onPriorityConfirm = ({ selectedOptions }: any) => {
  taskForm.priority = selectedOptions[0].value
  showPriorityPicker.value = false
}

const onStatusConfirm = ({ selectedOptions }: any) => {
  filterStatus.value = selectedOptions[0].value
  showStatusPicker.value = false
}

const onFilterPriorityConfirm = ({ selectedOptions }: any) => {
  filterPriority.value = selectedOptions[0].value
  showFilterPriorityPicker.value = false
}

const resetTaskForm = () => {
  Object.assign(taskForm, {
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  })
}

const resetFilter = () => {
  filterStatus.value = 'all'
  filterPriority.value = 'all'
}

const applyFilter = () => {
  showFilter.value = false
  showToast('筛选已应用')
}

const handleClosed = () => {
  // 清理状态
  resetTaskForm()
  resetFilter()
  editingTask.value = null
}
</script>

<style scoped lang="scss">
.task-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--van-background-color-light);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 16px 12px;
  border-bottom: 1px solid var(--van-border-color);

  h3 {
    flex: 1;
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--van-text-color);
  }
}

.task-stats {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-md);
  background: white;
  margin: var(--spacing-md);
  border-radius: 8px;

  .stat-item {
    text-align: center;

    .stat-value {
      font-size: var(--text-2xl);
      font-weight: bold;
      color: var(--van-primary-color);

      &.warning {
        color: var(--van-warning-color);
      }

      &.success {
        color: var(--van-success-color);
      }
    }

    .stat-label {
      font-size: var(--text-xs);
      color: var(--van-text-color-2);
      margin-top: 4px;
    }
  }
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  padding: 0 16px;
  margin-bottom: 16px;

  .van-button {
    flex: 1;
  }
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;

  .task-items {
    .task-item {
      background: white;
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;

      &.completed {
        opacity: 0.6;

        .task-title {
          text-decoration: line-through;
        }
      }

      .task-main {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: 8px;
      }

      .task-content {
        flex: 1;

        .task-title {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--van-text-color);
          margin-bottom: 4px;
        }

        .task-desc {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: 8px;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .task-date {
            font-size: 11px;
            color: var(--van-text-color-2);
          }
        }
      }

      .task-actions {
        display: flex;
        gap: var(--spacing-sm);
        padding-left: 36px;

        .van-button {
          flex: 1;
        }
      }
    }
  }
}

.add-task-form {
  padding: var(--spacing-md);

  .form-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: 16px;

    span {
      flex: 1;
      text-align: center;
      font-size: var(--text-base);
      font-weight: 500;
    }
  }

  .form-actions {
    padding: var(--spacing-md);
  }
}

.filter-popup {
  padding: var(--spacing-md);

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    span {
      font-size: var(--text-base);
      font-weight: 500;
    }
  }

  .filter-actions {
    padding: var(--spacing-md);
  }
}

// 暗黑模式适配
:root[data-theme="dark"] {
  .task-dialog {
    background: var(--van-background-color-dark);
  }

  .task-stats,
  .task-item {
    background: var(--van-gray-8);
  }
}
</style>
