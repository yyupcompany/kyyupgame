<template>
  <div class="task-execution">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-header">
        <h3>任务执行</h3>
        <div class="panel-actions">
          <el-button @click="createNewTask" type="primary">
            <el-icon><Plus /></el-icon>
            新建任务
          </el-button>
          <el-button @click="importTask">
            <el-icon><Upload /></el-icon>
            导入任务
          </el-button>
          <el-button @click="exportTasks" :disabled="tasks.length === 0">
            <el-icon><Download /></el-icon>
            导出任务
          </el-button>
        </div>
      </div>

      <!-- 任务统计 -->
      <div class="task-stats">
        <div class="stat-item">
          <div class="stat-value">{{ tasks.length }}</div>
          <div class="stat-label">总任务数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ runningTasks.length }}</div>
          <div class="stat-label">执行中</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ completedTasks.length }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ failedTasks.length }}</div>
          <div class="stat-label">失败</div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-container">
      <div class="tasks-header">
        <div class="tasks-filters">
          <el-select v-model="filterStatus" placeholder="筛选状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="等待中" value="pending" />
            <el-option label="执行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
          <el-select v-model="filterType" placeholder="筛选类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="点击操作" value="click" />
            <el-option label="输入文本" value="input" />
            <el-option label="表单填写" value="form" />
            <el-option label="页面导航" value="navigate" />
            <el-option label="数据提取" value="extract" />
            <el-option label="等待条件" value="wait" />
            <el-option label="自定义脚本" value="script" />
          </el-select>
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索任务名称..." 
            clearable
            style="width: 200px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="tasks-actions">
          <el-button @click="executeAllTasks" :disabled="filteredTasks.length === 0" type="success">
            <el-icon><VideoPlay /></el-icon>
            批量执行
          </el-button>
          <el-button @click="pauseAllTasks" :disabled="runningTasks.length === 0">
            <el-icon><VideoPause /></el-icon>
            暂停全部
          </el-button>
          <el-button @click="clearCompletedTasks" :disabled="completedTasks.length === 0">
            <el-icon><Delete /></el-icon>
            清理完成
          </el-button>
        </div>
      </div>

      <div class="tasks-list">
        <div 
          v-for="(task, index) in filteredTasks"
          :key="task.id"
          class="task-item"
          :class="[`status-${task.status}`, { 'selected': selectedTaskId === task.id }]"
          @click="selectTask(task)"
        >
          <div class="task-header">
            <div class="task-info">
              <div class="task-title">
                <span class="task-name">{{ task.name }}</span>
                <el-tag :type="getStatusType(task.status)" size="small">
                  {{ getStatusText(task.status) }}
                </el-tag>
              </div>
              <div class="task-meta">
                <span class="task-type">{{ getTypeText(task.type) }}</span>
                <span class="task-time">{{ formatTime(task.createdAt) }}</span>
              </div>
            </div>
            <div class="task-progress" v-if="task.status === 'running'">
              <el-progress :percentage="task.progress" :stroke-width="6" />
            </div>
          </div>

          <div class="task-content">
            <p class="task-description">{{ task.description }}</p>
            <div class="task-steps" v-if="task.steps && task.steps.length > 0">
              <div class="steps-summary">
                <span>共 {{ task.steps.length }} 个步骤</span>
                <span v-if="task.currentStep">当前: 第 {{ task.currentStep + 1 }} 步</span>
              </div>
              <div class="steps-list" v-if="showSteps[task.id]">
                <div 
                  v-for="(step, stepIndex) in task.steps"
                  :key="stepIndex"
                  class="step-item"
                  :class="{
                    'completed': stepIndex < (task.currentStep || 0),
                    'current': stepIndex === (task.currentStep || 0),
                    'pending': stepIndex > (task.currentStep || 0)
                  }"
                >
                  <div class="step-number">{{ stepIndex + 1 }}</div>
                  <div class="step-content">
                    <div class="step-action">{{ getStepActionText(step.action) }}</div>
                    <div class="step-target">{{ step.selector || step.url || step.text }}</div>
                  </div>
                  <div class="step-status">
                    <el-icon v-if="stepIndex < (task.currentStep || 0)"><CircleCheck /></el-icon>
                    <el-icon v-else-if="stepIndex === (task.currentStep || 0)" class="current"><Loading /></el-icon>
                    <el-icon v-else class="pending"><Clock /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="task-actions">
            <el-button-group size="small">
              <el-button @click.stop="executeTask(task)" :disabled="task.status === 'running'">
                <el-icon><VideoPlay /></el-icon>
                {{ task.status === 'paused' ? '继续' : '执行' }}
              </el-button>
              <el-button @click.stop="pauseTask(task)" :disabled="task.status !== 'running'">
                <el-icon><VideoPause /></el-icon>
                暂停
              </el-button>
              <el-button @click.stop="stopTask(task)" :disabled="!['running', 'paused'].includes(task.status)">
                <el-icon><VideoStop /></el-icon>
                停止
              </el-button>
              <el-button @click.stop="editTask(task)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button @click.stop="duplicateTask(task)">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
              <el-button @click.stop="deleteTask(task)" type="danger">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </el-button-group>
            <el-button 
              @click.stop="toggleSteps(task.id)" 
              v-if="task.steps && task.steps.length > 0"
              text
            >
              {{ showSteps[task.id] ? '收起步骤' : '展开步骤' }}
            </el-button>
          </div>

          <!-- 执行日志 -->
          <div class="task-logs" v-if="task.logs && task.logs.length > 0 && showLogs[task.id]">
            <div class="logs-header">
              <span>执行日志</span>
              <el-button @click.stop="toggleLogs(task.id)" size="small" text>收起</el-button>
            </div>
            <div class="logs-content">
              <div 
                v-for="(log, logIndex) in task.logs.slice(-5)"
                :key="logIndex"
                class="log-item"
                :class="log.level"
              >
                <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务编辑对话框 -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="isEditMode ? '编辑任务' : '新建任务'"
      width="70%"
      :close-on-click-modal="false"
    >
      <TaskEditor
        ref="taskEditorRef"
        :task="currentTask"
        :selected-elements="selectedElements"
        @task-saved="handleTaskSaved"
        @task-cancelled="handleTaskCancelled"
      />
    </el-dialog>

    <!-- 批量执行确认对话框 -->
    <el-dialog
      v-model="batchExecuteDialogVisible"
      title="批量执行确认"
      width="40%"
    >
      <p>确定要执行 {{ filteredTasks.length }} 个任务吗？</p>
      <div class="batch-options">
        <el-checkbox v-model="batchOptions.parallel">并行执行</el-checkbox>
        <el-checkbox v-model="batchOptions.stopOnError">遇到错误时停止</el-checkbox>
        <el-input-number 
          v-model="batchOptions.delay" 
          :min="0" 
          :max="10000"
          :step="100"
          controls-position="right"
        />
        <span>毫秒延迟</span>
      </div>
      <template #footer>
        <el-button @click="batchExecuteDialogVisible = false">取消</el-button>
        <el-button @click="confirmBatchExecute" type="primary">确定执行</el-button>
      </template>
    </el-dialog>

    <!-- 执行监控浮窗 -->
    <div class="execution-monitor" v-if="isMonitorVisible && runningTasks.length > 0">
      <div class="monitor-header">
        <span>执行监控 ({{ runningTasks.length }})</span>
        <el-button @click="toggleMonitor" size="small" text>
          <el-icon><{{ isMonitorExpanded ? 'ArrowDown' : 'ArrowUp' }} /></el-icon>
        </el-button>
      </div>
      <div class="monitor-content" v-if="isMonitorExpanded">
        <div 
          v-for="task in runningTasks.slice(0, 3)"
          :key="task.id"
          class="monitor-task"
        >
          <div class="monitor-task-name">{{ task.name }}</div>
          <div class="monitor-task-progress">
            <el-progress :percentage="task.progress" :stroke-width="4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  Search,
  VideoPlay,
  VideoPause,
  VideoStop,
  Edit,
  Delete,
  CopyDocument,
  CircleCheck,
  Loading,
  Clock,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'
import TaskEditor from '../../../components/ai/website/TaskEditor.vue'
import { useTaskExecution } from '@/composables/useTaskExecution'

// Props
const props = defineProps<{
  selectedElements?: any[]
}>()

// Emits
const emit = defineEmits(['task-complete', 'task-error', 'task-created'])

// 组合式API
const {
  tasks,
  executeTask: executeTaskAPI,
  pauseTask: pauseTaskAPI,
  stopTask: stopTaskAPI,
  createTask,
  updateTask,
  deleteTask: deleteTaskAPI,
  getTaskStatus,
  exportTasks: exportTasksAPI,
  importTasks: importTasksAPI
} = useTaskExecution()

// 响应式数据
const selectedTaskId = ref<string | null>(null)
const filterStatus = ref('')
const filterType = ref('')
const searchKeyword = ref('')
const taskDialogVisible = ref(false)
const batchExecuteDialogVisible = ref(false)
const isEditMode = ref(false)
const currentTask = ref<any>(null)
const showSteps = reactive({})
const showLogs = reactive({})
const isMonitorVisible = ref(true)
const isMonitorExpanded = ref(true)

// 组件引用
const taskEditorRef = ref()

// 批量执行选项
const batchOptions = reactive({
  parallel: false,
  stopOnError: true,
  delay: 1000
})

// 计算属性
const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (filterStatus.value) {
    filtered = filtered.filter(task => task.status === filterStatus.value)
  }

  if (filterType.value) {
    filtered = filtered.filter(task => task.type === filterType.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.name.toLowerCase().includes(keyword) ||
      task.description.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

const runningTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'running')
})

const completedTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'completed')
})

const failedTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'failed')
})

// 方法定义
const selectTask = (task: any) => {
  selectedTaskId.value = task.id
}

const createNewTask = () => {
  isEditMode.value = false
  currentTask.value = {
    name: '',
    description: '',
    type: 'click',
    steps: [],
    status: 'pending'
  }
  taskDialogVisible.value = true
}

const editTask = (task: any) => {
  isEditMode.value = true
  currentTask.value = { ...task }
  taskDialogVisible.value = true
}

const duplicateTask = (task: any) => {
  const duplicatedTask = {
    ...task,
    id: Date.now().toString(),
    name: `${task.name} (副本)`,
    status: 'pending',
    progress: 0,
    currentStep: 0,
    logs: [],
    createdAt: new Date().toISOString()
  }
  
  tasks.value.push(duplicatedTask)
  ElMessage.success('任务已复制')
}

const deleteTask = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '确认删除', {
      type: 'warning'
    })
    
    await deleteTaskAPI(task.id)
    ElMessage.success('任务已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除任务失败：' + error.message)
    }
  }
}

const executeTask = async (task: any) => {
  try {
    await executeTaskAPI(task.id)
    ElMessage.success('任务开始执行')
  } catch (error) {
    ElMessage.error('执行任务失败：' + error.message)
    emit('task-error', error)
  }
}

const pauseTask = async (task: any) => {
  try {
    await pauseTaskAPI(task.id)
    ElMessage.info('任务已暂停')
  } catch (error) {
    ElMessage.error('暂停任务失败：' + error.message)
  }
}

const stopTask = async (task: any) => {
  try {
    await stopTaskAPI(task.id)
    ElMessage.info('任务已停止')
  } catch (error) {
    ElMessage.error('停止任务失败：' + error.message)
  }
}

const executeAllTasks = () => {
  if (filteredTasks.value.length === 0) {
    ElMessage.warning('没有可执行的任务')
    return
  }
  
  batchExecuteDialogVisible.value = true
}

const confirmBatchExecute = async () => {
  batchExecuteDialogVisible.value = false
  
  try {
    if (batchOptions.parallel) {
      // 并行执行
      const promises = filteredTasks.value.map(task => executeTaskAPI(task.id))
      await Promise.all(promises)
    } else {
      // 串行执行
      for (const task of filteredTasks.value) {
        try {
          await executeTaskAPI(task.id)
          if (batchOptions.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, batchOptions.delay))
          }
        } catch (error) {
          if (batchOptions.stopOnError) {
            throw error
          }
          console.error('Task execution failed:', error)
        }
      }
    }
    
    ElMessage.success('批量执行完成')
  } catch (error) {
    ElMessage.error('批量执行失败：' + error.message)
  }
}

const pauseAllTasks = async () => {
  try {
    const promises = runningTasks.value.map(task => pauseTaskAPI(task.id))
    await Promise.all(promises)
    ElMessage.success('所有任务已暂停')
  } catch (error) {
    ElMessage.error('暂停任务失败：' + error.message)
  }
}

const clearCompletedTasks = () => {
  const completedTaskIds = completedTasks.value.map(task => task.id)
  completedTaskIds.forEach(id => {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index >= 0) {
      tasks.value.splice(index, 1)
    }
  })
  ElMessage.success(`已清理 ${completedTaskIds.length} 个完成的任务`)
}

const importTask = async () => {
  try {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        const importedTasks = JSON.parse(text)
        await importTasksAPI(importedTasks)
        ElMessage.success(`已导入 ${importedTasks.length} 个任务`)
      }
    }
    input.click()
  } catch (error) {
    ElMessage.error('导入任务失败：' + error.message)
  }
}

const exportTasks = async () => {
  try {
    const data = await exportTasksAPI(filteredTasks.value)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('任务已导出')
  } catch (error) {
    ElMessage.error('导出任务失败：' + error.message)
  }
}

const toggleSteps = (taskId: string) => {
  showSteps[taskId] = !showSteps[taskId]
}

const toggleLogs = (taskId: string) => {
  showLogs[taskId] = !showLogs[taskId]
}

const toggleMonitor = () => {
  isMonitorExpanded.value = !isMonitorExpanded.value
}

// 事件处理
const handleTaskSaved = (task: any) => {
  taskDialogVisible.value = false
  
  if (isEditMode.value) {
    updateTask(task)
    ElMessage.success('任务已更新')
  } else {
    createTask(task)
    ElMessage.success('任务已创建')
    emit('task-created', task)
  }
}

const handleTaskCancelled = () => {
  taskDialogVisible.value = false
}

// 工具函数
const getStatusType = (status: string) => {
  const statusMap = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger',
    paused: 'primary'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap = {
    pending: '等待中',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    paused: '已暂停'
  }
  return statusMap[status] || '未知'
}

const getTypeText = (type: string) => {
  const typeMap = {
    click: '点击操作',
    input: '输入文本',
    form: '表单填写',
    navigate: '页面导航',
    extract: '数据提取',
    wait: '等待条件',
    script: '自定义脚本'
  }
  return typeMap[type] || type
}

const getStepActionText = (action: string) => {
  const actionMap = {
    click: '点击',
    input: '输入',
    navigate: '导航',
    wait: '等待',
    extract: '提取',
    scroll: '滚动',
    hover: '悬停'
  }
  return actionMap[action] || action
}

const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString()
}

// 生命周期
onMounted(() => {
  // 监听任务状态变化
  const interval = setInterval(() => {
    runningTasks.value.forEach(task => {
      getTaskStatus(task.id).then(status => {
        Object.assign(task, status)
        if (task.status === 'completed') {
          emit('task-complete', task)
        } else if (task.status === 'failed') {
          emit('task-error', task)
        }
      })
    })
  }, 1000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})

// 暴露方法
const startFillMode = () => {
  // 启动表单填写模式
  createNewTask()
  if (currentTask.value) {
    currentTask.value.type = 'form'
    currentTask.value.name = '表单填写任务'
    currentTask.value.description = '自动填写页面表单'
  }
}

defineExpose({
  startFillMode
})
</script>

<style lang="scss" scoped>
.task-execution {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.control-panel {
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);

    h3 {
      margin: 0;
      color: var(--text-primary);
    }

    .panel-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .task-stats {
    display: flex;
    gap: var(--text-3xl);

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
  }
}

.tasks-container {
  flex: 1;
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);

    .tasks-filters {
      display: flex;
      gap: var(--text-sm);
      align-items: center;
    }

    .tasks-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .tasks-list {
    flex: 1;
    overflow-y: auto;

    .task-item {
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-sm);
      padding: var(--text-lg);
      margin-bottom: var(--text-sm);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      }

      &.selected {
        border-color: var(--primary-color);
        background: var(--primary-light);
      }

      &.status-running {
        border-left: var(--spacing-xs) solid var(--warning-color);
      }

      &.status-completed {
        border-left: var(--spacing-xs) solid var(--success-color);
      }

      &.status-failed {
        border-left: var(--spacing-xs) solid var(--danger-color);
      }

      &.status-paused {
        border-left: var(--spacing-xs) solid var(--primary-color);
      }

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--text-sm);

        .task-info {
          flex: 1;

          .task-title {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-xs);

            .task-name {
              font-weight: 600;
              color: var(--text-primary);
            }
          }

          .task-meta {
            display: flex;
            gap: var(--text-sm);
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }

        .task-progress {
          min-width: 200px;
          margin-left: var(--text-lg);
        }
      }

      .task-content {
        margin-bottom: var(--text-sm);

        .task-description {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-secondary);
          font-size: var(--text-base);
        }

        .task-steps {
          .steps-summary {
            display: flex;
            gap: var(--text-sm);
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
          }

          .steps-list {
            .step-item {
              display: flex;
              align-items: center;
              gap: var(--text-sm);
              padding: var(--spacing-lg) 0;
              border-bottom: var(--border-width-base) solid var(--bg-gray);

              &:last-child {
                border-bottom: none;
              }

              &.completed {
                .step-number {
                  background: var(--success-color);
                  color: white;
                }
              }

              &.current {
                .step-number {
                  background: var(--warning-color);
                  color: white;
                }
              }

              &.pending {
                .step-number {
                  background: var(--border-color);
                  color: var(--text-secondary);
                }
              }

              .step-number {
                width: var(--text-3xl);
                height: var(--text-3xl);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--text-sm);
                font-weight: 600;
                flex-shrink: 0;
              }

              .step-content {
                flex: 1;
                min-width: 0;

                .step-action {
                  font-weight: 600;
                  color: var(--text-primary);
                  font-size: var(--text-sm);
                }

                .step-target {
                  color: var(--text-secondary);
                  font-size: var(--text-xs);
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }

              .step-status {
                .current {
                  animation: spin 1s linear infinite;
                  color: var(--warning-color);
                }

                .pending {
                  color: var(--text-muted);
                }
              }
            }
          }
        }
      }

      .task-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .task-logs {
        margin-top: var(--text-sm);
        border-top: var(--border-width-base) solid var(--border-color);
        padding-top: var(--text-sm);

        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .logs-content {
          .log-item {
            display: flex;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) 0;
            font-size: var(--text-xs);

            &.error {
              color: var(--danger-color);
            }

            &.warning {
              color: var(--warning-color);
            }

            &.info {
              color: var(--text-secondary);
            }

            .log-time {
              color: var(--text-muted);
              min-width: 80px;
            }

            .log-message {
              flex: 1;
            }
          }
        }
      }
    }
  }
}

.batch-options {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
  margin: var(--text-lg) 0;
}

.execution-monitor {
  position: fixed;
  bottom: var(--text-2xl);
  right: var(--text-2xl);
  width: 300px;
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--shadow-medium);
  z-index: 9999;

  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--text-sm);
    background: var(--bg-light);
    border-bottom: var(--border-width-base) solid var(--border-color);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .monitor-content {
    padding: var(--spacing-sm) var(--text-sm);

    .monitor-task {
      margin-bottom: var(--spacing-sm);

      &:last-child {
        margin-bottom: 0;
      }

      .monitor-task-name {
        font-size: var(--text-sm);
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>