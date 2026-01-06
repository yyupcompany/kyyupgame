<template>
  <div class="website-operation-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>网站操作AI助手</h2>
        <p>通过AI识别和操作网站元素，实现智能化网站交互</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="startScreenshotMode" :loading="screenshotLoading">
          <UnifiedIcon name="default" />
          截图分析
        </el-button>
        <el-button @click="toggleElementSelector" :disabled="!isReady">
          <UnifiedIcon name="default" />
          元素选择
        </el-button>
        <el-button @click="openTaskManager" type="success">
          <UnifiedIcon name="default" />
          任务管理
        </el-button>
      </div>
    </div>

    <!-- 功能标签页 -->
    <el-tabs v-model="activeTab" class="operation-tabs">
      <!-- 快速操作 -->
      <el-tab-pane label="快速操作" name="quick-actions">
        <div class="quick-actions-panel">
          <div class="action-cards">
            <div 
              v-for="action in quickActions" 
              :key="action.id"
              class="action-card"
              @click="executeQuickAction(action)"
              :class="{ 'executing': executingAction === action.id }"
            >
              <div class="action-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="action-content">
                <h4>{{ action.title }}</h4>
                <p>{{ action.description }}</p>
              </div>
              <div class="action-status" v-if="executingAction === action.id">
                <UnifiedIcon name="default" />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 截图分析 -->
      <el-tab-pane label="截图分析" name="screenshot-analysis">
        <ScreenshotAnalysis 
          ref="screenshotAnalysisRef"
          @element-detected="handleElementDetected"
          @analysis-complete="handleAnalysisComplete"
        />
      </el-tab-pane>

      <!-- 元素识别 -->
      <el-tab-pane label="元素识别" name="element-recognition">
        <ElementRecognition 
          ref="elementRecognitionRef"
          @element-selected="handleElementSelected"
          @selector-generated="handleSelectorGenerated"
        />
      </el-tab-pane>

      <!-- 任务执行 -->
      <el-tab-pane label="任务执行" name="task-execution">
        <TaskExecution 
          ref="taskExecutionRef"
          :selected-elements="selectedElements"
          @task-complete="handleTaskComplete"
          @task-error="handleTaskError"
        />
      </el-tab-pane>

      <!-- 执行历史 -->
      <el-tab-pane label="执行历史" name="execution-history">
        <div class="execution-history">
          <div class="history-filters">
            <el-select v-model="historyFilter" placeholder="筛选类型">
              <el-option label="全部" value="all" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="error" />
              <el-option label="进行中" value="running" />
            </el-select>
            <el-date-picker
              v-model="historyDateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
            <el-button @click="loadExecutionHistory">刷新</el-button>
          </div>
          
          <div class="history-list">
            <div 
              v-for="record in filteredHistory" 
              :key="record.id"
              class="history-item"
              :class="`status-${record.status}`"
            >
              <div class="history-header">
                <span class="task-name">{{ record.taskName }}</span>
                <span class="task-time">{{ formatTime(record.createdAt) }}</span>
                <el-tag :type="getStatusType(record.status)">{{ getStatusText(record.status) }}</el-tag>
              </div>
              <div class="history-content">
                <p class="task-description">{{ record.description }}</p>
                <div class="task-details" v-if="record.details">
                  <el-collapse>
                    <el-collapse-item title="查看详情">
                      <pre>{{ JSON.stringify(record.details, null, 2) }}</pre>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>
              <div class="history-actions">
                <el-button size="small" @click="retryTask(record)" v-if="record.status === 'error'">
                  重试
                </el-button>
                <el-button size="small" @click="viewTaskDetail(record)">
                  详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 悬浮工具栏 -->
    <div class="floating-toolbar" v-if="isToolbarVisible">
      <div class="toolbar-content">
        <el-button-group>
          <el-button @click="captureElement" :disabled="!selectedElement">
            <UnifiedIcon name="default" />
          </el-button>
          <el-button @click="analyzeElement" :disabled="!selectedElement">
            <UnifiedIcon name="Search" />
          </el-button>
          <el-button @click="executeAction" :disabled="!selectedElement">
            <UnifiedIcon name="default" />
          </el-button>
        </el-button-group>
        <el-button @click="closeToolbar" type="info" size="small">
          <UnifiedIcon name="Close" />
        </el-button>
      </div>
    </div>

    <!-- 任务管理对话框 -->
    <el-dialog
      v-model="taskManagerVisible"
      title="任务管理"
      width="80%"
      :close-on-click-modal="false"
    >
      <TaskManager
        ref="taskManagerRef"
        @task-created="handleTaskCreated"
        @task-updated="handleTaskUpdated"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Camera,
  Aim,
  List,
  Loading,
  Search,
  Position,
  Close,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import ScreenshotAnalysis from './ScreenshotAnalysis.vue'
import ElementRecognition from './ElementRecognition.vue'
import TaskExecution from './TaskExecution.vue'
import TaskManager from '../../../components/ai/website/TaskManager.vue'
import { useWebsiteAutomation } from '@/composables/useWebsiteAutomation'

// 组合式API
const {
  isReady,
  selectedElement,
  selectedElements,
  executionHistory,
  captureScreenshot,
  analyzeElement,
  executeAction,
  loadHistory
} = useWebsiteAutomation()

// 响应式数据
const activeTab = ref('quick-actions')
const screenshotLoading = ref(false)
const executingAction = ref<string | null>(null)
const isToolbarVisible = ref(false)
const taskManagerVisible = ref(false)
const historyFilter = ref('all')
const historyDateRange = ref<[string, string] | null>(null)

// 组件引用
const screenshotAnalysisRef = ref()
const elementRecognitionRef = ref()
const taskExecutionRef = ref()
const taskManagerRef = ref()

// 快速操作配置
const quickActions = reactive([
  {
    id: 'click',
    title: '点击操作',
    description: '智能识别并点击页面元素',
    icon: 'Position',
    action: 'click'
  },
  {
    id: 'fill',
    title: '表单填写',
    description: '自动识别表单并填写内容',
    icon: 'Edit',
    action: 'fill'
  },
  {
    id: 'navigate',
    title: '页面导航',
    description: '智能导航到指定页面',
    icon: 'Guide',
    action: 'navigate'
  },
  {
    id: 'extract',
    title: '数据提取',
    description: '提取页面中的关键信息',
    icon: 'Download',
    action: 'extract'
  },
  {
    id: 'monitor',
    title: '页面监控',
    description: '监控页面变化和状态',
    icon: 'eye',
    action: 'monitor'
  },
  {
    id: 'batch',
    title: '批量操作',
    description: '执行批量操作任务',
    icon: 'copy',
    action: 'batch'
  }
])

// 计算属性
const filteredHistory = computed(() => {
  let filtered = executionHistory.value

  if (historyFilter.value !== 'all') {
    filtered = filtered.filter(item => item.status === historyFilter.value)
  }

  if (historyDateRange.value) {
    const [startDate, endDate] = historyDateRange.value
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createdAt)
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }

  return filtered
})

// 方法定义
const startScreenshotMode = async () => {
  try {
    screenshotLoading.value = true
    await captureScreenshot()
    activeTab.value = 'screenshot-analysis'
    ElMessage.success('截图已获取，开始分析...')
  } catch (error) {
    ElMessage.error('截图失败：' + error.message)
  } finally {
    screenshotLoading.value = false
  }
}

const toggleElementSelector = () => {
  if (!isReady.value) {
    ElMessage.warning('请先完成页面初始化')
    return
  }
  
  activeTab.value = 'element-recognition'
  elementRecognitionRef.value?.startSelection()
}

const openTaskManager = () => {
  taskManagerVisible.value = true
}

const executeQuickAction = async (action: any) => {
  try {
    executingAction.value = action.id
    
    // 根据动作类型执行不同的操作
    switch (action.action) {
      case 'click':
        await handleClickAction()
        break
      case 'fill':
        await handleFillAction()
        break
      case 'navigate':
        await handleNavigateAction()
        break
      case 'extract':
        await handleExtractAction()
        break
      case 'monitor':
        await handleMonitorAction()
        break
      case 'batch':
        await handleBatchAction()
        break
      default:
        throw new Error('未知的操作类型')
    }
    
    ElMessage.success(`${action.title}执行成功`)
  } catch (error) {
    ElMessage.error(`${action.title}执行失败：${error.message}`)
  } finally {
    executingAction.value = null
  }
}

// 事件处理器
const handleElementDetected = (elements: any[]) => {
  ElMessage.success(`检测到 ${elements.length} 个元素`)
}

const handleAnalysisComplete = (result: any) => {
  ElMessage.success('页面分析完成')
}

const handleElementSelected = (element: any) => {
  ElMessage.info('元素已选择')
}

const handleSelectorGenerated = (selector: string) => {
  ElMessage.success('选择器已生成')
}

const handleTaskComplete = (result: any) => {
  ElMessage.success('任务执行完成')
  loadExecutionHistory()
}

const handleTaskError = (error: any) => {
  ElMessage.error('任务执行失败：' + error.message)
  loadExecutionHistory()
}

const handleTaskCreated = (task: any) => {
  ElMessage.success('任务创建成功')
  taskManagerVisible.value = false
}

const handleTaskUpdated = (task: any) => {
  ElMessage.success('任务更新成功')
}

// 工具栏操作
const captureElement = async () => {
  if (!selectedElement.value) return
  
  try {
    await captureScreenshot()
    ElMessage.success('元素截图已保存')
  } catch (error) {
    ElMessage.error('截图失败：' + error.message)
  }
}

const closeToolbar = () => {
  isToolbarVisible.value = false
}

// 历史记录操作
const loadExecutionHistory = () => {
  loadHistory()
}

const retryTask = async (record: any) => {
  try {
    await executeAction(record.action, record.params)
    ElMessage.success('任务重试成功')
    loadExecutionHistory()
  } catch (error) {
    ElMessage.error('任务重试失败：' + error.message)
  }
}

const viewTaskDetail = (record: any) => {
  // 显示任务详情对话框
  ElMessageBox.alert(
    JSON.stringify(record, null, 2),
    '任务详情',
    {
      confirmButtonText: '确定',
      type: 'info'
    }
  )
}

// 快速操作处理器
const handleClickAction = async () => {
  // 启动点击模式
  toggleElementSelector()
}

const handleFillAction = async () => {
  // 启动表单填写模式
  activeTab.value = 'task-execution'
  taskExecutionRef.value?.startFillMode()
}

const handleNavigateAction = async () => {
  // 启动导航模式
  const { value: url } = await ElMessageBox.prompt('请输入要导航的URL', '页面导航', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'url',
    inputPlaceholder: 'https://example.com'
  })
  
  if (url) {
    window.location.href = url
  }
}

const handleExtractAction = async () => {
  // 启动数据提取模式
  activeTab.value = 'screenshot-analysis'
  screenshotAnalysisRef.value?.startExtractionMode()
}

const handleMonitorAction = async () => {
  // 启动页面监控
  ElMessage.info('页面监控功能开发中...')
}

const handleBatchAction = async () => {
  // 启动批量操作
  openTaskManager()
}

// 工具函数
const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString()
}

const getStatusType = (status: string) => {
  const statusMap = {
    success: 'success',
    error: 'danger',
    running: 'warning',
    pending: 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap = {
    success: '成功',
    error: '失败',
    running: '进行中',
    pending: '等待中'
  }
  return statusMap[status] || '未知'
}

// 生命周期
onMounted(() => {
  loadExecutionHistory()
})

onUnmounted(() => {
  // 清理资源
})
</script>

<style lang="scss" scoped>
.website-operation-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg) var(--text-3xl);
  background: white;
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
  margin-bottom: var(--text-lg);

  .header-content {
    h2 {
      margin: 0 0 var(--spacing-xs) 0;
      color: var(--text-primary);
      font-size: var(--text-2xl);
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--text-base);
    }
  }

  .header-actions {
    display: flex;
    gap: var(--text-sm);
  }
}

.operation-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__content) {
    flex: 1;
    padding: var(--text-lg) var(--text-3xl);
  }
}

.quick-actions-panel {
  .action-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--text-lg);
  }

  .action-card {
    display: flex;
    align-items: center;
    padding: var(--text-lg);
    background: white;
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--spacing-sm);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px var(--text-sm) var(--shadow-light);
    }

    &.executing {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }

    .action-icon {
      width: var(--icon-size); height: var(--icon-size);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: white;
      border-radius: var(--spacing-sm);
      margin-right: var(--text-lg);

      .el-icon {
        font-size: var(--text-3xl);
      }
    }

    .action-content {
      flex: 1;

      h4 {
        margin: 0 0 var(--spacing-xs) 0;
        color: var(--text-primary);
        font-size: var(--text-lg);
        font-weight: 600;
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }
    }

    .action-status {
      .loading {
        animation: spin 1s linear infinite;
        color: var(--primary-color);
      }
    }
  }
}

.execution-history {
  .history-filters {
    display: flex;
    gap: var(--text-sm);
    margin-bottom: var(--text-lg);
    align-items: center;
  }

  .history-list {
    .history-item {
      background: white;
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-sm);
      padding: var(--text-lg);
      margin-bottom: var(--text-sm);

      &.status-success {
        border-left: var(--spacing-xs) solid var(--success-color);
      }

      &.status-error {
        border-left: var(--spacing-xs) solid var(--danger-color);
      }

      &.status-running {
        border-left: var(--spacing-xs) solid var(--warning-color);
      }

      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);

        .task-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .task-time {
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
      }

      .history-content {
        .task-description {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-secondary);
        }

        .task-details {
          pre {
            background: var(--bg-light);
            padding: var(--spacing-sm);
            border-radius: var(--spacing-xs);
            font-size: var(--text-sm);
            overflow-x: auto;
          }
        }
      }

      .history-actions {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--text-sm);
      }
    }
  }
}

.floating-toolbar {
  position: fixed;
  top: 50%;
  right: var(--text-2xl);
  transform: translateY(-50%);
  z-index: 9999;
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--shadow-medium);
  padding: var(--spacing-sm);

  .toolbar-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: center;
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