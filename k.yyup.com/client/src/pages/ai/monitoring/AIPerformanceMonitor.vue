<template>
  <div class="ai-performance-monitor">
    <!-- 页面头部 -->
    <div class="monitor-header">
      <div class="header-content">
        <div class="page-title">
          <h1>
            <UnifiedIcon name="default" />
            AI性能监控中心
          </h1>
          <p>实时监控AI服务性能和资源使用情况</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh" :loading="refreshing">
            <UnifiedIcon name="Refresh" />
            刷新数据
          </el-button>
          <el-button type="primary" @click="handleExportReport">
            <UnifiedIcon name="Download" />
            导出报告
          </el-button>
        </div>
      </div>
    </div>

    <!-- 系统状态概览 -->
    <div class="system-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="status-card healthy">
            <div class="status-content">
              <div class="status-icon">
                <UnifiedIcon name="Check" />
              </div>
              <div class="status-info">
                <div class="status-value">正常</div>
                <div class="status-label">系统状态</div>
                <div class="status-detail">所有服务运行正常</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="status-card">
            <div class="status-content">
              <div class="status-icon cpu">
                <UnifiedIcon name="default" />
              </div>
              <div class="status-info">
                <div class="status-value">{{ systemMetrics.cpuUsage }}%</div>
                <div class="status-label">CPU使用率</div>
                <div class="status-detail">8核心处理器</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="status-card">
            <div class="status-content">
              <div class="status-icon memory">
                <UnifiedIcon name="default" />
              </div>
              <div class="status-info">
                <div class="status-value">{{ systemMetrics.memoryUsage }}%</div>
                <div class="status-label">内存使用率</div>
                <div class="status-detail">{{ systemMetrics.memoryTotal }}GB总内存</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="status-card">
            <div class="status-content">
              <div class="status-icon gpu">
                <UnifiedIcon name="default" />
              </div>
              <div class="status-info">
                <div class="status-value">{{ systemMetrics.gpuUsage }}%</div>
                <div class="status-label">GPU使用率</div>
                <div class="status-detail">NVIDIA RTX 4090</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- AI模型性能监控 -->
    <div class="model-performance">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>第三方AI服务监控</span>
            <el-select v-model="selectedTimeRange" placeholder="选择时间范围" style="max-width: 150px; width: 100%">
              <el-option label="最近1小时" value="1h" />
              <el-option label="最近6小时" value="6h" />
              <el-option label="最近24小时" value="24h" />
              <el-option label="最近7天" value="7d" />
            </el-select>
          </div>
        </template>
        
        <div class="models-grid">
          <div v-for="service in aiServices" :key="service.id" class="model-card">
            <div class="model-header">
              <div class="model-info">
                <h3>{{ service.name }}</h3>
                <span class="model-version">{{ service.provider }} - {{ service.version }}</span>
                <el-tag :type="getStatusType(service.status)" size="small">
                  {{ service.status === 'running' ? '运行中' :
                      service.status === 'error' ? '错误' :
                      service.status === 'maintenance' ? '维护中' : '未知' }}
                </el-tag>
              </div>
              <div class="model-actions">
                <el-button size="small" @click="viewServiceDetails(service)">
                  <UnifiedIcon name="eye" />
                  详情
                </el-button>
              </div>
            </div>

            <div class="model-metrics">
              <div class="metric-item">
                <span class="metric-label">响应时间</span>
                <span class="metric-value">{{ service.metrics.responseTime }}ms</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">成功率</span>
                <span class="metric-value">{{ service.metrics.successRate.toFixed(1) }}%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">请求数/分钟</span>
                <span class="metric-value">{{ service.metrics.requestsPerMinute }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">错误率</span>
                <span class="metric-value error">{{ service.metrics.errorRate.toFixed(1) }}%</span>
              </div>
              <div class="metric-item" v-if="service.metrics.costPerRequest">
                <span class="metric-label">单次成本</span>
                <span class="metric-value">${{ service.metrics.costPerRequest.toFixed(3) }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">日成本</span>
                <span class="metric-value">${{ service.usage.dailyCost.toFixed(0) }}</span>
              </div>
            </div>
            
            <div class="model-chart">
              <div class="chart-placeholder">
                <UnifiedIcon name="default" />
                <span>性能趋势图</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 实时日志监控 -->
    <div class="log-monitoring">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>实时日志监控</span>
            <div class="log-controls">
              <el-select v-model="selectedLogLevel" placeholder="日志级别" style="max-max-width: 120px; width: 100%; width: 100%">
                <el-option label="全部" value="all" />
                <el-option label="错误" value="error" />
                <el-option label="警告" value="warning" />
                <el-option label="信息" value="info" />
              </el-select>
              <el-button size="small" @click="clearLogs">
                <UnifiedIcon name="Delete" />
                清空
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="log-container">
          <div v-for="log in filteredLogs" :key="log.id" class="log-entry" :class="log.level.toLowerCase()">
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-level">{{ log.level }}</span>
            <span class="log-service">{{ log.service }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 性能警报 -->
    <div class="performance-alerts">
      <el-card shadow="never">
        <template #header>
          <span>性能警报</span>
        </template>
        
        <div class="alerts-list">
          <div v-for="alert in performanceAlerts" :key="alert.id" class="alert-item" :class="alert.severity">
            <div class="alert-icon">
              <UnifiedIcon name="Close" />
              <UnifiedIcon name="default" />
              <UnifiedIcon name="default" />
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-description">{{ alert.description }}</div>
              <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
            </div>
            <div class="alert-actions">
              <el-button size="small" @click="resolveAlert(alert.id)">
                处理
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import {
  Monitor,
  Refresh,
  Download,
  CircleCheck,
  Cpu,
  Coin,
  VideoCamera,
  View,
  TrendCharts,
  Delete,
  CircleClose,
  Warning,
  InfoFilled
} from '@element-plus/icons-vue'

// 接口类型定义
interface SystemMetrics {
  status: string
  message: string
  metrics: {
    cpu: { usage: number; cores: number; temperature?: number }
    memory: { usage: number; total: number; used: number; free: number }
    gpu: { usage: number; model: string; memory?: any }
    network?: any
    uptime?: number
  }
  lastUpdated: string
}

interface AIService {
  id: string
  name: string
  provider: string
  version: string
  status: 'running' | 'error' | 'maintenance'
  metrics: {
    responseTime: number
    successRate: number
    requestsPerMinute: number
    errorRate: number
    lastUpdated: string
    costPerRequest?: number
  }
  usage: {
    totalRequests: number
    totalTokens?: number
    dailyCost: number
  }
}

interface PerformanceLog {
  id: string
  timestamp: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'
  service: string
  message: string
  details?: any
}

interface PerformanceAlert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  source: string
}

// 响应式数据
const refreshing = ref(false)
const selectedTimeRange = ref('24h')
const selectedLogLevel = ref('all')
const loading = ref(false)

// API基础URL
const API_BASE = '/ai/performance'

// 系统指标
const systemMetrics = ref({
  cpuUsage: 0,
  memoryUsage: 0,
  memoryTotal: 32,
  gpuUsage: 0
})

// 系统状态数据
const systemStatus = ref<SystemMetrics>({
  status: 'normal',
  message: '正在加载系统状态...',
  metrics: {
    cpu: { usage: 0, cores: 8 },
    memory: { usage: 0, total: 32, used: 0, free: 32 },
    gpu: { usage: 0, model: 'NVIDIA RTX 4090' }
  },
  lastUpdated: new Date().toISOString()
})

// 第三方AI服务数据
const aiServices = ref<AIService[]>([])

// 日志数据
const logs = ref<PerformanceLog[]>([])

// 性能警报
const performanceAlerts = ref<PerformanceAlert[]>([])

// API方法
// 获取系统状态
const fetchSystemStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE}/system-status`)
    if (response.data.success) {
      systemStatus.value = response.data.data
      // 更新系统指标显示
      systemMetrics.value = {
        cpuUsage: response.data.data.metrics.cpu.usage,
        memoryUsage: response.data.data.metrics.memory.usage,
        memoryTotal: response.data.data.metrics.memory.total,
        gpuUsage: response.data.data.metrics.gpu.usage
      }
    }
  } catch (error) {
    console.error('获取系统状态失败:', error)
    ElMessage.error('获取系统状态失败')
  }
}

// 获取第三方AI服务性能数据
const fetchAIServices = async () => {
  try {
    const response = await axios.get(`${API_BASE}/models`, {
      params: { timeRange: selectedTimeRange.value }
    })
    if (response.data.success) {
      aiServices.value = response.data.data.services || []
    }
  } catch (error) {
    console.error('获取AI服务数据失败:', error)
    ElMessage.error('获取AI服务数据失败')
  }
}

// 获取性能日志
const fetchLogs = async () => {
  try {
    const response = await axios.get(`${API_BASE}/logs`, {
      params: {
        level: selectedLogLevel.value === 'all' ? undefined : selectedLogLevel.value.toUpperCase(),
        limit: 50
      }
    })
    if (response.data.success) {
      logs.value = response.data.data.logs
    }
  } catch (error) {
    console.error('获取性能日志失败:', error)
    ElMessage.error('获取性能日志失败')
  }
}

// 获取性能警报
const fetchAlerts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/alerts`, {
      params: { resolved: 'false' }
    })
    if (response.data.success) {
      performanceAlerts.value = response.data.data.alerts
    }
  } catch (error) {
    console.error('获取性能警报失败:', error)
    ElMessage.error('获取性能警报失败')
  }
}

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchSystemStatus(),
      fetchAIServices(),
      fetchLogs(),
      fetchAlerts()
    ])
  } finally {
    loading.value = false
  }
}

// 计算属性
const filteredLogs = computed(() => {
  if (selectedLogLevel.value === 'all') {
    return logs.value
  }
  return logs.value.filter(log => log.level.toLowerCase() === selectedLogLevel.value.toLowerCase())
})

// 方法
const handleRefresh = async () => {
  refreshing.value = true
  try {
    const response = await axios.post(`${API_BASE}/refresh`)
    if (response.data.success) {
      await fetchAllData()
      ElMessage.success('数据刷新成功')
    }
  } catch (error) {
    console.error('数据刷新失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    refreshing.value = false
  }
}

const handleExportReport = async () => {
  try {
    const response = await axios.get(`${API_BASE}/export`, {
      params: {
        format: 'json',
        timeRange: selectedTimeRange.value
      }
    })
    if (response.data.success) {
      // 创建下载链接
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-performance-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      ElMessage.success('性能报告导出成功')
    }
  } catch (error) {
    console.error('导出报告失败:', error)
    ElMessage.error('导出报告失败')
  }
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'running': 'success',
    'training': 'warning',
    'stopped': 'danger',
    'error': 'danger',
    '运行中': 'success',
    '训练中': 'warning',
    '已停止': 'danger'
  }
  return statusMap[status] || 'info'
}

const viewServiceDetails = (service: AIService) => {
  ElMessage.info(`查看服务详情: ${service.name} (${service.provider})`)
}

const clearLogs = () => {
  logs.value = []
  ElMessage.success('日志已清空')
}

const resolveAlert = (alertId: string) => {
  const index = performanceAlerts.value.findIndex(alert => alert.id === alertId)
  if (index > -1) {
    performanceAlerts.value.splice(index, 1)
    ElMessage.success('警报已处理')
  }
}

const formatTime = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 监听时间范围变化
watch(selectedTimeRange, () => {
  fetchAIServices()
})

// 监听日志级别变化
watch(selectedLogLevel, () => {
  fetchLogs()
})

// 生命周期
let updateInterval: NodeJS.Timeout

onMounted(async () => {
  // 初始加载数据
  await fetchAllData()

  // 设置定时刷新
  updateInterval = setInterval(async () => {
    try {
      await fetchSystemStatus()
      await fetchLogs()
    } catch (error) {
      console.error('定时刷新失败:', error)
    }
  }, 30000) // 每30秒刷新一次
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.ai-performance-monitor {
  padding: var(--spacing-lg);
  background: var(--bg-color);
  min-height: 100vh;

  .monitor-header {
    margin-bottom: var(--spacing-lg);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .page-title {
        h1 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);

          .el-icon {
            color: var(--primary-color);
          }
        }

        p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
      }

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  .system-overview {
    margin-bottom: var(--spacing-lg);

    .status-card {
      min-height: 60px; height: auto;
      border: var(--border-width-base) solid var(--border-color);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(var(--transform-hover-lift));
      }

      &.healthy {
        border-color: var(--success-color);
        background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
      }

      .status-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        height: 100%;

        .status-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-3xl);

          &:not(.cpu):not(.memory):not(.gpu) {
            background: var(--success-color);
            color: white;
          }

          &.cpu {
            background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
            color: white;
          }

          &.memory {
            background: linear-gradient(135deg, var(--ai-primary), var(--ai-dark));
            color: white;
          }

          &.gpu {
            background: linear-gradient(135deg, var(--success-color), #059669);
            color: white;
          }
        }

        .status-info {
          flex: 1;

          .status-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .status-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
          }

          .status-detail {
            font-size: var(--text-xs);
            color: var(--text-tertiary);
          }
        }
      }
    }
  }

  .model-performance {
    margin-bottom: var(--spacing-lg);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .models-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-md);

      .model-card {
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--border-radius);
        padding: var(--spacing-md);
        background: var(--bg-color-secondary);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: var(--shadow-sm);
          border-color: var(--primary-color);
        }

        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);

          .model-info {
            h3 {
              margin: 0 0 var(--spacing-xs) 0;
              font-size: var(--text-lg);
              color: var(--text-primary);
            }

            .model-version {
              font-size: var(--text-xs);
              color: var(--text-tertiary);
              margin-right: var(--spacing-sm);
            }
          }
        }

        .model-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);

          .metric-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-xs);
            background: var(--bg-color);
            border-radius: var(--border-radius-sm);

            .metric-label {
              font-size: var(--text-xs);
              color: var(--text-secondary);
            }

            .metric-value {
              font-weight: 600;
              color: var(--text-primary);

              &.error {
                color: var(--danger-color);
              }
            }
          }
        }

        .model-chart {
          min-height: 60px; height: auto;
          background: var(--bg-color);
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);

          .chart-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xs);

            .el-icon {
              font-size: var(--text-3xl);
            }

            span {
              font-size: var(--text-xs);
            }
          }
        }
      }
    }
  }

  .log-monitoring {
    margin-bottom: var(--spacing-lg);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .log-controls {
        display: flex;
        gap: var(--spacing-sm);
        align-items: center;
      }
    }

    .log-container {
      max-min-height: 60px; height: auto;
      overflow-y: auto;
      background: var(--bg-color-secondary);
      border-radius: var(--border-radius-sm);
      padding: var(--spacing-sm);

      .log-entry {
        display: flex;
        gap: var(--spacing-sm);
        padding: var(--spacing-xs);
        margin-bottom: var(--spacing-xs);
        border-radius: var(--border-radius-sm);
        font-family: 'Courier New', monospace;
        font-size: var(--text-xs);

        &.error {
          background: rgba(245, 101, 101, 0.1);
          border-left: 3px solid var(--danger-color);
        }

        &.warning {
          background: rgba(245, 166, 35, 0.1);
          border-left: 3px solid var(--warning-color);
        }

        &.info {
          background: rgba(59, 130, 246, 0.1);
          border-left: 3px solid var(--info-color);
        }

        .log-time {
          color: var(--text-tertiary);
          min-width: auto;
        }

        .log-level {
          font-weight: 600;
          min-width: auto;

          &:contains("ERROR") {
            color: var(--danger-color);
          }

          &:contains("WARNING") {
            color: var(--warning-color);
          }

          &:contains("INFO") {
            color: var(--info-color);
          }
        }

        .log-service {
          color: var(--primary-color);
          min-width: 120px;
        }

        .log-message {
          color: var(--text-primary);
          flex: 1;
        }
      }
    }
  }

  .performance-alerts {
    .alerts-list {
      .alert-item {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        border-radius: var(--border-radius);
        border-left: var(--spacing-xs) solid;

        &.critical {
          background: rgba(245, 101, 101, 0.1);
          border-left-color: var(--danger-color);
        }

        &.warning {
          background: rgba(245, 166, 35, 0.1);
          border-left-color: var(--warning-color);
        }

        &.info {
          background: rgba(59, 130, 246, 0.1);
          border-left-color: var(--info-color);
        }

        .alert-icon {
          width: var(--text-3xl);
          height: var(--text-3xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: var(--spacing-sm);

          .el-icon {
            font-size: var(--text-2xl);
          }
        }

        .alert-content {
          flex: 1;

          .alert-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .alert-description {
            color: var(--text-secondary);
            font-size: var(--text-sm);
            margin-bottom: var(--spacing-xs);
          }

          .alert-time {
            color: var(--text-tertiary);
            font-size: var(--text-xs);
          }
        }

        .alert-actions {
          margin-top: var(--spacing-sm);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .ai-performance-monitor {
    padding: var(--spacing-md);

    .monitor-header .header-content {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: stretch;
    }

    .system-overview .el-col {
      margin-bottom: var(--spacing-sm);
    }

    .models-grid {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>
