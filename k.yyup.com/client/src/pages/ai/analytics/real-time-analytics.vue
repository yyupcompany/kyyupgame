<template>
  <div class="real-time-analytics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="icon-chart-line"></i>
          AI实时分析
        </h1>
        <p class="page-description">
          基于AI技术的实时数据分析与智能洞察，为决策提供数据支持
        </p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <i class="icon-refresh"></i>
          刷新数据
        </el-button>
        <el-button @click="exportReport">
          <i class="icon-download"></i>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 实时指标卡片 -->
    <div class="metrics-grid">
      <div class="metric-card" v-for="metric in realTimeMetrics" :key="metric.id">
        <div class="metric-header">
          <span class="metric-title">{{ metric.title }}</span>
          <span class="metric-trend" :class="metric.trend">
            <i :class="metric.trendIcon"></i>
            {{ metric.trendValue }}
          </span>
        </div>
        <div class="metric-value">{{ metric.value }}</div>
        <div class="metric-subtitle">{{ metric.subtitle }}</div>
      </div>
    </div>

    <!-- 实时图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>实时数据趋势</h3>
              <el-select v-model="selectedTimeRange" size="small">
                <el-option label="最近1小时" value="1h"></el-option>
                <el-option label="最近6小时" value="6h"></el-option>
                <el-option label="最近24小时" value="24h"></el-option>
              </el-select>
            </div>
            <div class="chart-content" ref="trendChart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>AI分析结果</h3>
              <el-button size="small" @click="runAIAnalysis">
                <i class="icon-brain"></i>
                重新分析
              </el-button>
            </div>
            <div class="chart-content" ref="aiAnalysisChart"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- AI洞察面板 -->
    <div class="insights-panel">
      <div class="panel-header">
        <h3>
          <i class="icon-lightbulb"></i>
          AI智能洞察
        </h3>
        <span class="last-updated">最后更新: {{ lastUpdated }}</span>
      </div>
      <div class="insights-content">
        <div class="insight-item" v-for="insight in aiInsights" :key="insight.id">
          <div class="insight-icon" :class="insight.type">
            <i :class="insight.icon"></i>
          </div>
          <div class="insight-content">
            <h4>{{ insight.title }}</h4>
            <p>{{ insight.description }}</p>
            <div class="insight-actions">
              <el-button size="small" type="text" @click="viewInsightDetail(insight)">
                查看详情
              </el-button>
              <el-button size="small" type="text" @click="applyRecommendation(insight)">
                应用建议
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时数据表格 -->
    <div class="data-table-section">
      <div class="table-header">
        <h3>实时数据监控</h3>
        <div class="table-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索数据..."
            size="small"
            style="max-width: 200px; width: 100%;"
          >
            <template #prefix>
              <i class="icon-search"></i>
            </template>
          </el-input>
          <el-button size="small" @click="toggleAutoRefresh">
            <i :class="autoRefresh ? 'icon-pause' : 'icon-play'"></i>
            {{ autoRefresh ? '暂停' : '开始' }}自动刷新
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
<el-table class="responsive-table"
        :data="filteredTableData"
        v-loading="tableLoading"
        stripe
        height="400"
      >
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="metric" label="指标" width="150"></el-table-column>
        <el-table-column prop="value" label="数值" width="120">
          <template #default="{ row }">
            <span :class="getValueClass(row.change)">{{ row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="change" label="变化" width="100">
          <template #default="{ row }">
            <span :class="getChangeClass(row.change)">
              <i :class="getChangeIcon(row.change)"></i>
              {{ row.change }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="aiPrediction" label="AI预测" width="150">
          <template #default="{ row }">
            <el-tag :type="getPredictionType(row.aiPrediction)" size="small">
              {{ row.aiPrediction }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="text" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button size="small" type="text" @click="analyzeData(row)">
              分析
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const selectedTimeRange = ref('1h')
const searchKeyword = ref('')
const autoRefresh = ref(true)
const tableLoading = ref(false)
const lastUpdated = ref('')

// 实时指标数据
const realTimeMetrics = reactive([
  {
    id: 1,
    title: '在线用户',
    value: '1,234',
    subtitle: '当前活跃用户数',
    trend: 'up',
    trendIcon: 'icon-arrow-up',
    trendValue: '+12%'
  },
  {
    id: 2,
    title: '系统负载',
    value: '68%',
    subtitle: 'CPU使用率',
    trend: 'down',
    trendIcon: 'icon-arrow-down',
    trendValue: '-5%'
  },
  {
    id: 3,
    title: '响应时间',
    value: '245ms',
    subtitle: '平均响应时间',
    trend: 'stable',
    trendIcon: 'icon-minus',
    trendValue: '0%'
  },
  {
    id: 4,
    title: '错误率',
    value: '0.02%',
    subtitle: '系统错误率',
    trend: 'down',
    trendIcon: 'icon-arrow-down',
    trendValue: '-0.01%'
  }
])

// AI洞察数据
const aiInsights = reactive([
  {
    id: 1,
    type: 'warning',
    icon: 'icon-warning',
    title: '用户活跃度异常',
    description: 'AI检测到用户活跃度在过去2小时内下降了15%，建议检查系统性能。'
  },
  {
    id: 2,
    type: 'success',
    icon: 'icon-check',
    title: '性能优化建议',
    description: '基于历史数据分析，建议在晚上8-10点进行系统维护，影响最小。'
  },
  {
    id: 3,
    type: 'info',
    icon: 'icon-info',
    title: '趋势预测',
    description: 'AI预测明天上午10点将迎来用户访问高峰，建议提前扩容。'
  }
])

// 表格数据
const tableData = reactive([
  {
    timestamp: new Date(),
    metric: '用户登录',
    value: 156,
    change: '+12%',
    aiPrediction: '持续增长',
    status: '正常'
  },
  {
    timestamp: new Date(Date.now() - 60000),
    metric: '页面访问',
    value: 2341,
    change: '+8%',
    aiPrediction: '稳定',
    status: '正常'
  },
  {
    timestamp: new Date(Date.now() - 120000),
    metric: '系统错误',
    value: 3,
    change: '-2%',
    aiPrediction: '下降趋势',
    status: '警告'
  }
])

// 计算属性
const filteredTableData = computed(() => {
  if (!searchKeyword.value) return tableData
  return tableData.filter(item => 
    item.metric.includes(searchKeyword.value) ||
    item.status.includes(searchKeyword.value)
  )
})

// 方法
const refreshData = () => {
  tableLoading.value = true
  setTimeout(() => {
    lastUpdated.value = new Date().toLocaleString()
    tableLoading.value = false
    ElMessage.success('数据刷新成功')
  }, 1000)
}

const exportReport = () => {
  ElMessage.info('报告导出功能开发中...')
}

const runAIAnalysis = () => {
  ElMessage.info('AI分析正在运行...')
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  ElMessage.success(`自动刷新已${autoRefresh.value ? '开启' : '关闭'}`)
}

const viewInsightDetail = (insight) => {
  ElMessageBox.alert(insight.description, insight.title, {
    confirmButtonText: '确定'
  })
}

const applyRecommendation = (insight) => {
  ElMessage.success('建议已应用')
}

const viewDetail = (row) => {
  ElMessage.info(`查看 ${row.metric} 详情`)
}

const analyzeData = (row) => {
  ElMessage.info(`分析 ${row.metric} 数据`)
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const getValueClass = (change) => {
  if (change.startsWith('+')) return 'value-up'
  if (change.startsWith('-')) return 'value-down'
  return 'value-stable'
}

const getChangeClass = (change) => {
  if (change.startsWith('+')) return 'change-up'
  if (change.startsWith('-')) return 'change-down'
  return 'change-stable'
}

const getChangeIcon = (change) => {
  if (change.startsWith('+')) return 'icon-arrow-up'
  if (change.startsWith('-')) return 'icon-arrow-down'
  return 'icon-minus'
}

const getPredictionType = (prediction) => {
  const types = {
    '持续增长': 'success',
    '稳定': 'info',
    '下降趋势': 'warning'
  }
  return types[prediction] || 'info'
}

const getStatusType = (status) => {
  const types = {
    '正常': 'success',
    '警告': 'warning',
    '错误': 'danger'
  }
  return types[status] || 'info'
}

// 生命周期
onMounted(() => {
  lastUpdated.value = new Date().toLocaleString()
  
  // 自动刷新定时器
  const refreshInterval = setInterval(() => {
    if (autoRefresh.value) {
      refreshData()
    }
  }, 30000) // 30秒刷新一次
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(refreshInterval)
  })
})
</script>

<style scoped>
.real-time-analytics {
  padding: var(--text-2xl);
  background: var(--bg-hover);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding: var(--text-2xl);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.header-content .page-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
}

.header-content .page-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--text-3xl);
}

.metric-card {
  padding: var(--text-2xl);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.metric-title {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.metric-trend {
  font-size: var(--text-sm);
  padding: var(--spacing-sm) 6px;
  border-radius: var(--spacing-xs);
}

.metric-trend.up {
  color: #059669;
  background: #d1fae5;
}

.metric-trend.down {
  color: #dc2626;
  background: #fee2e2;
}

.metric-trend.stable {
  color: var(--text-secondary);
  background: #f3f4f6;
}

.metric-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.metric-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.charts-section {
  margin-bottom: var(--text-3xl);
}

.chart-container {
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg) var(--text-2xl);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
}

.chart-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.chart-content {
  min-height: 60px; height: auto;
  padding: var(--text-2xl);
}

.insights-panel {
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  margin-bottom: var(--text-3xl);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg) var(--text-2xl);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
}

.panel-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.last-updated {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.insights-content {
  padding: var(--text-2xl);
}

.insight-item {
  display: flex;
  gap: var(--text-lg);
  padding: var(--text-lg);
  border-radius: var(--spacing-sm);
  margin-bottom: var(--text-lg);
  background: #f9fafb;
}

.insight-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-icon.warning {
  background: #fef3c7;
  color: #d97706;
}

.insight-icon.success {
  background: #d1fae5;
  color: #059669;
}

.insight-icon.info {
  background: #dbeafe;
  color: #2563eb;
}

.insight-content h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.insight-content p {
  margin: 0 0 var(--text-sm) 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.insight-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.data-table-section {
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg) var(--text-2xl);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
}

.table-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.table-actions {
  display: flex;
  gap: var(--text-sm);
  align-items: center;
}

.value-up {
  color: #059669;
}

.value-down {
  color: #dc2626;
}

.value-stable {
  color: var(--text-secondary);
}

.change-up {
  color: #059669;
}

.change-down {
  color: #dc2626;
}

.change-stable {
  color: var(--text-secondary);
}
</style>
