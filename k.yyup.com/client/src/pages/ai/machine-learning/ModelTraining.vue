<template>
  <div class="ai-prediction-container">
    <!-- 页面头部 -->
    <div class="prediction-header">
      <div class="header-content">
        <div class="page-title">
          <h1>
            <UnifiedIcon name="default" />
            AI预测分析
          </h1>
          <p>基于大模型的智能数据分析与预测服务</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefreshData">
            <UnifiedIcon name="Refresh" />
            刷新数据
          </el-button>
          <el-button @click="handleExportResults">
            <UnifiedIcon name="Download" />
            导出结果
          </el-button>
          <el-button type="primary" @click="handleStartPrediction">
            <UnifiedIcon name="default" />
            开始预测
          </el-button>
        </div>
      </div>
    </div>

    <!-- 预测概览 -->
    <div class="prediction-overview">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon active">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ predictionStats.totalPredictions }}</div>
                <div class="overview-label">总预测次数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon completed">
                <UnifiedIcon name="Check" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ predictionStats.successRate }}%</div>
                <div class="overview-label">预测成功率</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon accuracy">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ predictionStats.avgResponseTime }}ms</div>
                <div class="overview-label">平均响应时间</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon resources">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ predictionStats.dataRecords }}</div>
                <div class="overview-label">历史数据量</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 预测任务 -->
      <el-tab-pane label="预测任务" name="predictions">
        <div class="prediction-tasks">
          <div class="tasks-toolbar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索预测任务..."
              style="width: 100%; max-width: 300px;"
              clearable
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>

            <el-select v-model="statusFilter" placeholder="状态筛选" style="max-width: 150px; width: 100%;">
              <el-option label="全部" value="" />
              <el-option label="分析中" value="analyzing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已失败" value="failed" />
            </el-select>
          </div>
          
          <div class="table-wrapper">
<el-table class="responsive-table" :data="filteredPredictionTasks" style="width: 100%">
            <el-table-column prop="name" label="预测任务" width="200" />
            <el-table-column prop="predictionType" label="预测类型" width="150" />
            <el-table-column prop="dataSource" label="数据来源" width="120" />
            <el-table-column prop="recordCount" label="数据量" width="100">
              <template #default="{ row }">
                <span>{{ row.recordCount }} 条</span>
              </template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="100">
              <template #default="{ row }">
                <span v-if="row.confidence">{{ row.confidence }}%</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="分析时长" width="120" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'completed'"
                  size="small"
                  type="primary"
                  @click="handleViewResult(row)"
                >
                  查看结果
                </el-button>
                <el-button
                  v-if="row.status === 'completed'"
                  size="small"
                  type="success"
                  @click="handleExportResult(row)"
                >
                  导出
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteTask(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
      </el-tab-pane>

      <!-- 新建预测 -->
      <el-tab-pane label="新建预测" name="create">
        <div class="create-prediction">
          <el-form :model="predictionForm" :rules="predictionRules" ref="predictionFormRef" label-width="120px">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="预测名称" prop="name">
                  <el-input v-model="predictionForm.name" placeholder="输入预测任务名称" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="预测类型" prop="predictionType">
                  <el-select v-model="predictionForm.predictionType" placeholder="选择预测类型">
                    <el-option label="招生趋势预测" value="enrollment_trend" />
                    <el-option label="学生表现预测" value="student_performance" />
                    <el-option label="收入预测" value="revenue_forecast" />
                    <el-option label="资源需求预测" value="resource_demand" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="数据来源" prop="dataSource">
                  <el-select v-model="predictionForm.dataSource" placeholder="选择数据来源">
                    <el-option label="学生管理数据" value="student_data" />
                    <el-option label="招生历史数据" value="enrollment_data" />
                    <el-option label="财务收入数据" value="financial_data" />
                    <el-option label="教师评估数据" value="teacher_data" />
                    <el-option label="课程反馈数据" value="course_data" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="时间范围" prop="timeRange">
                  <el-select v-model="predictionForm.timeRange" placeholder="选择时间范围">
                    <el-option label="最近3个月" value="3months" />
                    <el-option label="最近6个月" value="6months" />
                    <el-option label="最近1年" value="1year" />
                    <el-option label="最近2年" value="2years" />
                    <el-option label="全部历史数据" value="all" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="预测周期" prop="forecastPeriod">
                  <el-select v-model="predictionForm.forecastPeriod" placeholder="选择预测周期" style="width: 100%;">
                    <el-option label="未来1个月" value="1month" />
                    <el-option label="未来3个月" value="3months" />
                    <el-option label="未来6个月" value="6months" />
                    <el-option label="未来1年" value="1year" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="大模型选择" prop="aiModel">
                  <el-select v-model="predictionForm.aiModel" placeholder="选择AI模型" style="width: 100%;">
                    <el-option label="GPT-4" value="gpt-4" />
                    <el-option label="Claude-3" value="claude-3" />
                    <el-option label="文心一言" value="ernie-bot" />
                    <el-option label="通义千问" value="qwen" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="分析深度" prop="analysisDepth">
                  <el-select v-model="predictionForm.analysisDepth" placeholder="选择分析深度" style="width: 100%;">
                    <el-option label="基础分析" value="basic" />
                    <el-option label="深度分析" value="deep" />
                    <el-option label="专家级分析" value="expert" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="包含外部因素">
                  <el-checkbox-group v-model="predictionForm.externalFactors">
                    <el-checkbox label="seasonal" value="seasonal">季节性因素</el-checkbox>
                    <el-checkbox label="economic" value="economic">经济环境</el-checkbox>
                    <el-checkbox label="policy" value="policy">政策影响</el-checkbox>
                    <el-checkbox label="competition" value="competition">竞争态势</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="置信度要求" prop="confidenceThreshold">
                  <el-slider
                    v-model="predictionForm.confidenceThreshold"
                    :min="60"
                    :max="95"
                    :step="5"
                    :format-tooltip="(val) => `${val}%`"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="预测描述" prop="description">
              <el-input
                v-model="predictionForm.description"
                type="textarea"
                :rows="3"
                placeholder="输入预测任务描述和特殊要求..."
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleStartPrediction" :loading="predicting">
                <UnifiedIcon name="default" />
                开始预测分析
              </el-button>
              <el-button @click="handleResetForm">
                <UnifiedIcon name="Refresh" />
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 预测结果 -->
      <el-tab-pane label="预测结果" name="results">
        <div class="prediction-results">
          <el-table class="responsive-table" :data="predictionResults" style="width: 100%">
            <el-table-column prop="name" label="预测名称" width="200" />
            <el-table-column prop="type" label="预测类型" width="120" />
            <el-table-column prop="aiModel" label="使用模型" width="120" />
            <el-table-column prop="confidence" label="置信度" width="100">
              <template #default="{ row }">
                <span class="confidence-value">{{ row.confidence }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="dataCount" label="数据量" width="100">
              <template #default="{ row }">
                <span>{{ row.dataCount }} 条</span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="预测时间" width="180" />
            <el-table-column label="准确性" width="100">
              <template #default="{ row }">
                <el-tag :type="getAccuracyType(row.accuracy)">
                  {{ getAccuracyText(row.accuracy) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="primary"
                  @click="handleViewPrediction(row)"
                >
                  查看详情
                </el-button>
                <el-button
                  size="small"
                  type="success"
                  @click="handleExportPrediction(row)"
                >
                  导出
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeletePrediction(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- API监控 -->
      <el-tab-pane label="API监控" name="monitoring">
        <div class="api-monitoring">
          <el-card shadow="hover">
            <template #header>
              <div class="monitoring-header">
                <h3>AI API调用监控</h3>
                <el-switch
                  v-model="realTimeMonitoring"
                  active-text="实时监控"
                  @change="toggleMonitoring"
                />
              </div>
            </template>

            <div class="monitoring-content">
              <div v-if="currentPrediction" class="current-prediction">
                <h4>当前分析: {{ currentPrediction.name }}</h4>
                <div class="prediction-metrics">
                  <div class="metric-item">
                    <span class="metric-label">数据处理:</span>
                    <span class="metric-value">{{ currentPrediction.processedRecords }}/{{ currentPrediction.totalRecords }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">API调用:</span>
                    <span class="metric-value">{{ currentPrediction.apiCalls }} 次</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">响应时间:</span>
                    <span class="metric-value">{{ currentPrediction.avgResponseTime }}ms</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">剩余时间:</span>
                    <span class="metric-value">{{ currentPrediction.estimatedTime }}</span>
                  </div>
                </div>

                <div class="prediction-progress">
                  <el-progress
                    :percentage="(currentPrediction.processedRecords / currentPrediction.totalRecords) * 100"
                    :show-text="false"
                  />
                </div>
              </div>

              <div v-else class="no-prediction">
                <el-empty description="当前没有进行中的预测任务" />
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  TrendCharts, Refresh, Download, MagicStick, DataAnalysis, CircleCheck, Star, Monitor,
  Search, RefreshLeft
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('predictions')
const searchKeyword = ref('')
const statusFilter = ref('')
const predicting = ref(false)
const realTimeMonitoring = ref(false)
const monitoringInterval = ref(null)

// 预测统计
const predictionStats = reactive({
  totalPredictions: 128,
  successRate: 96.5,
  avgResponseTime: 1250,
  dataRecords: 15420
})

// 预测任务数据
const predictionTasks = ref([
  {
    id: 1,
    name: '春季招生趋势预测',
    predictionType: '招生趋势预测',
    dataSource: '招生历史数据',
    recordCount: 2580,
    confidence: 94.2,
    duration: '3分25秒',
    status: 'completed',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '学生表现分析',
    predictionType: '学生表现预测',
    dataSource: '学生管理数据',
    recordCount: 1850,
    confidence: 89.7,
    duration: '2分18秒',
    status: 'analyzing',
    createdAt: '2024-01-15 14:20:00'
  },
  {
    id: 3,
    name: '下半年收入预测',
    predictionType: '收入预测',
    dataSource: '财务收入数据',
    recordCount: 960,
    confidence: null,
    duration: '1分42秒',
    status: 'analyzing',
    createdAt: '2024-01-15 16:45:00'
  }
])

// 预测结果数据
const predictionResults = ref([
  {
    id: 1,
    name: '春季招生趋势预测',
    type: '招生趋势预测',
    aiModel: 'GPT-4',
    confidence: 94.2,
    dataCount: 2580,
    accuracy: 'high',
    createdAt: '2024-01-14 14:20:00'
  },
  {
    id: 2,
    name: '学生表现分析报告',
    type: '学生表现预测',
    aiModel: 'Claude-3',
    confidence: 89.7,
    dataCount: 1850,
    accuracy: 'medium',
    createdAt: '2024-01-13 09:15:00'
  }
])

// 当前预测监控
const currentPrediction = ref({
  name: '春季招生趋势预测',
  processedRecords: 2180,
  totalRecords: 2580,
  apiCalls: 15,
  avgResponseTime: 1250,
  estimatedTime: '2分钟'
})

// 预测表单
const predictionForm = reactive({
  name: '',
  predictionType: '',
  dataSource: '',
  timeRange: '',
  forecastPeriod: '',
  aiModel: 'gpt-4',
  analysisDepth: 'deep',
  externalFactors: [],
  confidenceThreshold: 80,
  description: ''
})

// 表单验证规则
const predictionRules = {
  name: [{ required: true, message: '请输入预测名称', trigger: 'blur' }],
  predictionType: [{ required: true, message: '请选择预测类型', trigger: 'change' }],
  dataSource: [{ required: true, message: '请选择数据来源', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择时间范围', trigger: 'change' }]
}

// 计算属性
const filteredPredictionTasks = computed(() => {
  let filtered = predictionTasks.value

  if (searchKeyword.value) {
    filtered = filtered.filter(task =>
      task.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }

  return filtered
})

// 方法
const handleRefreshData = () => {
  ElMessage.success('数据已刷新')
}

const handleExportResults = () => {
  ElMessage.info('结果导出功能开发中')
}

const handleCreatePrediction = () => {
  activeTab.value = 'create'
}

const handleStartPrediction = async () => {
  predicting.value = true

  try {
    // 模拟预测分析启动
    await new Promise(resolve => setTimeout(resolve, 3000))

    const newTask = {
      id: Date.now(),
      name: predictionForm.name,
      predictionType: predictionForm.predictionType,
      dataSource: predictionForm.dataSource,
      recordCount: Math.floor(Math.random() * 3000) + 500,
      confidence: null,
      duration: '0秒',
      status: 'analyzing',
      createdAt: new Date().toLocaleString()
    }

    predictionTasks.value.unshift(newTask)
    ElMessage.success('预测分析已启动')
    activeTab.value = 'predictions'
    handleResetForm()
  } catch (error) {
    ElMessage.error('启动预测失败')
  } finally {
    predicting.value = false
  }
}

const handleResetForm = () => {
  Object.assign(predictionForm, {
    name: '',
    predictionType: '',
    dataSource: '',
    timeRange: '',
    forecastPeriod: '',
    aiModel: 'gpt-4',
    analysisDepth: 'deep',
    externalFactors: [],
    confidenceThreshold: 80,
    description: ''
  })
}

const handleViewResult = (task) => {
  ElMessage.info('查看预测结果功能开发中')
}

const handleExportResult = (task) => {
  ElMessage.success('预测结果导出中...')
}

const handleDeleteTask = async (task) => {
  try {
    await ElMessageBox.confirm('确定要删除这个预测任务吗？', '确认删除', {
      type: 'warning'
    })

    const index = predictionTasks.value.findIndex(t => t.id === task.id)
    if (index > -1) {
      predictionTasks.value.splice(index, 1)
      ElMessage.success('预测任务已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const handleViewPrediction = (result) => {
  ElMessage.info('查看预测详情功能开发中')
}

const handleExportPrediction = (result) => {
  ElMessage.success('预测结果导出中...')
}

const handleDeletePrediction = async (result) => {
  try {
    await ElMessageBox.confirm('确定要删除这个预测结果吗？', '确认删除', {
      type: 'warning'
    })

    const index = predictionResults.value.findIndex(r => r.id === result.id)
    if (index > -1) {
      predictionResults.value.splice(index, 1)
      ElMessage.success('预测结果已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const toggleMonitoring = (enabled) => {
  if (enabled) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
}

const startMonitoring = () => {
  monitoringInterval.value = setInterval(() => {
    if (currentPrediction.value && currentPrediction.value.processedRecords < currentPrediction.value.totalRecords) {
      // 模拟预测进度更新
      const increment = Math.floor(Math.random() * 50) + 10
      currentPrediction.value.processedRecords = Math.min(
        currentPrediction.value.totalRecords,
        currentPrediction.value.processedRecords + increment
      )
      currentPrediction.value.apiCalls += 1
      currentPrediction.value.avgResponseTime = Math.floor(Math.random() * 200) + 1100

      const remaining = currentPrediction.value.totalRecords - currentPrediction.value.processedRecords
      const remainingTime = Math.ceil(remaining / 100)
      currentPrediction.value.estimatedTime = `${remainingTime}分钟`
    }
  }, 2000)
}

const stopMonitoring = () => {
  if (monitoringInterval.value) {
    clearInterval(monitoringInterval.value)
    monitoringInterval.value = null
  }
}

// 工具方法
const getStatusType = (status) => {
  const typeMap = {
    'analyzing': 'primary',
    'completed': 'success',
    'failed': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'analyzing': '分析中',
    'completed': '已完成',
    'failed': '已失败'
  }
  return textMap[status] || '未知'
}

const getAccuracyType = (accuracy) => {
  const typeMap = {
    'high': 'success',
    'medium': 'warning',
    'low': 'danger'
  }
  return typeMap[accuracy] || 'info'
}

const getAccuracyText = (accuracy) => {
  const textMap = {
    'high': '高准确性',
    'medium': '中等准确性',
    'low': '低准确性'
  }
  return textMap[accuracy] || '未评估'
}

// 生命周期
onMounted(() => {
  // 页面加载时的初始化
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style lang="scss">
.ai-prediction-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.prediction-header {
  margin-bottom: var(--text-3xl);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-3xl);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: var(--text-sm);

    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
        display: flex;
        align-items: center;
        gap: var(--text-sm);
      }

      p {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.prediction-overview {
  margin-bottom: var(--text-3xl);
  
  .overview-card {
    height: 100%;
    
    .overview-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .overview-icon {
        width: auto;
        min-height: 60px; height: auto;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.active {
          background: #dbeafe;
          color: var(--primary-color);
        }
        
        &.completed {
          background: #d1fae5;
          color: var(--success-color);
        }
        
        &.accuracy {
          background: #fef3c7;
          color: var(--warning-color);
        }
        
        &.resources {
          background: #fce7f3;
          color: #ec4899;
        }
      }
      
      .overview-info {
        flex: 1;
        
        .overview-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }
        
        .overview-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
      }
    }
  }
}

.prediction-tasks {
  .tasks-toolbar {
    display: flex;
    gap: var(--text-lg);
    margin-bottom: var(--text-lg);
  }
}

.create-prediction {
  max-width: 100%; max-width: 800px;
}

.prediction-results {
  .confidence-value {
    font-weight: 500;
    color: var(--success-color);
  }
}

.api-monitoring {
  .monitoring-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: var(--text-xl);
      font-weight: 500;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .current-prediction {
    h4 {
      font-size: var(--text-lg);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--text-lg);
    }

    .prediction-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--text-lg);
      margin-bottom: var(--text-lg);

      .metric-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--text-sm);
        background: #f9fafb;
        border-radius: var(--spacing-sm);

        .metric-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }

        .metric-value {
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--text-primary);
        }
      }
    }

    .prediction-progress {
      margin-top: var(--text-lg);
    }
  }

  .no-prediction {
    text-align: center;
    padding: var(--spacing-10xl);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .ai-prediction-container {
    padding: var(--text-lg);
  }

  .prediction-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    text-align: center;
  }

  .prediction-overview {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }

  .prediction-metrics {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
</style>
