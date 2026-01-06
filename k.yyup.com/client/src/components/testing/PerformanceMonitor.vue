<template>
  <div class="performance-monitor" v-if="isDevelopment && visible">
    <el-card class="monitor-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <UnifiedIcon name="default" />
          <span>性能监控</span>
          <div class="header-actions">
            <el-switch 
              v-model="autoRefresh" 
              size="small"
              active-text="自动刷新"
              inactive-text=""
            />
            <el-button 
              size="small" 
              @click="toggleMinimized"
              :icon="minimized ? 'ArrowUp' : 'ArrowDown'"
              text
            />
            <el-button 
              size="small" 
              @click="visible = false"
              icon="Close"
              text
            />
          </div>
        </div>
      </template>
      
      <div v-show="!minimized" class="monitor-content">
        <!-- 实时性能指标 -->
        <div class="performance-metrics">
          <div class="metric-item">
            <div class="metric-label">内存使用</div>
            <div class="metric-value" :class="getMemoryStatus()">
              {{ formatBytes(memoryUsage.usedJSHeapSize) }} / 
              {{ formatBytes(memoryUsage.totalJSHeapSize) }}
            </div>
            <div class="metric-bar">
              <div 
                class="bar-fill"
                :class="getMemoryStatus()"
                :style="{ width: `${memoryUsagePercent}%` }"
              ></div>
            </div>
          </div>
          
          <div class="metric-item">
            <div class="metric-label">FPS</div>
            <div class="metric-value" :class="getFPSStatus()">
              {{ currentFPS }}
            </div>
            <div class="metric-bar">
              <div 
                class="bar-fill"
                :class="getFPSStatus()"
                :style="{ width: `${Math.min(currentFPS / 60 * 100, 100)}%` }"
              ></div>
            </div>
          </div>
          
          <div class="metric-item">
            <div class="metric-label">API响应时间</div>
            <div class="metric-value" :class="getAPIStatus()">
              {{ averageAPITime }}ms
            </div>
            <div class="metric-bar">
              <div 
                class="bar-fill"
                :class="getAPIStatus()"
                :style="{ width: `${Math.min(100 - averageAPITime / 10, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 组件性能 -->
        <div class="component-performance">
          <h4>组件性能</h4>
          <div class="component-list">
            <div 
              v-for="component in componentMetrics" 
              :key="component.name"
              class="component-item"
            >
              <div class="component-info">
                <span class="component-name">{{ component.name }}</span>
                <span class="component-time">{{ component.renderTime }}ms</span>
              </div>
              <div class="component-status" :class="component.status">
                {{ component.status }}
              </div>
            </div>
          </div>
        </div>

        <!-- 网络请求监控 -->
        <div class="network-monitor">
          <h4>网络请求</h4>
          <div class="network-stats">
            <div class="stat-item">
              <span class="label">总请求数：</span>
              <span class="value">{{ networkStats.totalRequests }}</span>
            </div>
            <div class="stat-item">
              <span class="label">成功率：</span>
              <span class="value" :class="getSuccessRateStatus()">
                {{ networkStats.successRate }}%
              </span>
            </div>
            <div class="stat-item">
              <span class="label">平均响应时间：</span>
              <span class="value">{{ networkStats.averageTime }}ms</span>
            </div>
          </div>
          
          <div class="recent-requests" v-if="recentRequests.length > 0">
            <div class="requests-header">
              <span>最近请求</span>
              <el-button size="small" @click="clearRequests" text>清空</el-button>
            </div>
            <div class="requests-list">
              <div 
                v-for="request in recentRequests.slice(0, 5)" 
                :key="request.id"
                class="request-item"
                :class="request.status"
              >
                <div class="request-info">
                  <span class="request-method">{{ request.method }}</span>
                  <span class="request-url">{{ request.url }}</span>
                  <span class="request-time">{{ request.duration }}ms</span>
                </div>
                <div class="request-status">{{ request.statusCode }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="monitor-actions">
          <el-button size="small" @click="refreshMetrics">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
          <el-button size="small" @click="exportMetrics">
            <UnifiedIcon name="Download" />
            导出
          </el-button>
          <el-button size="small" @click="clearMetrics">
            <UnifiedIcon name="Delete" />
            清空
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Monitor, 
  ArrowUp, 
  ArrowDown, 
  Close,
  Refresh,
  Download,
  Delete
} from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const minimized = ref(false)
const autoRefresh = ref(true)

// 性能指标
const memoryUsage = ref({
  usedJSHeapSize: 0,
  totalJSHeapSize: 0,
  jsHeapSizeLimit: 0
})

const currentFPS = ref(60)
const averageAPITime = ref(0)

// 组件性能指标
const componentMetrics = ref([
  { name: 'AIAssistant', renderTime: 12, status: 'good' },
  { name: 'DraggableTable', renderTime: 8, status: 'good' },
  { name: 'PromptPreview', renderTime: 15, status: 'warning' },
  { name: 'AIStatistics', renderTime: 20, status: 'warning' }
])

// 网络请求统计
const networkStats = ref({
  totalRequests: 0,
  successRate: 100,
  averageTime: 0
})

const recentRequests = ref<Array<{
  id: string
  method: string
  url: string
  duration: number
  statusCode: number
  status: string
  timestamp: string
}>>([])

// 开发环境检查
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.search.includes('debug=true')
})

// 计算属性
const memoryUsagePercent = computed(() => {
  if (memoryUsage.value.totalJSHeapSize === 0) return 0
  return (memoryUsage.value.usedJSHeapSize / memoryUsage.value.totalJSHeapSize) * 100
})

// 状态判断函数
const getMemoryStatus = () => {
  const percent = memoryUsagePercent.value
  if (percent > 80) return 'critical'
  if (percent > 60) return 'warning'
  return 'good'
}

const getFPSStatus = () => {
  if (currentFPS.value < 30) return 'critical'
  if (currentFPS.value < 50) return 'warning'
  return 'good'
}

const getAPIStatus = () => {
  if (averageAPITime.value > 1000) return 'critical'
  if (averageAPITime.value > 500) return 'warning'
  return 'good'
}

const getSuccessRateStatus = () => {
  if (networkStats.value.successRate < 90) return 'critical'
  if (networkStats.value.successRate < 95) return 'warning'
  return 'good'
}

// 工具函数
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// FPS监控
let fpsCounter = 0
let lastTime = performance.now()
let frameId: number

const measureFPS = () => {
  const now = performance.now()
  fpsCounter++
  
  if (now - lastTime >= 1000) {
    currentFPS.value = Math.round(fpsCounter * 1000 / (now - lastTime))
    fpsCounter = 0
    lastTime = now
  }
  
  frameId = requestAnimationFrame(measureFPS)
}

// 内存监控
const updateMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryUsage.value = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    }
  }
}

// 网络请求监控
const monitorNetworkRequests = () => {
  // 拦截fetch请求
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const startTime = performance.now()
    const url = args[0].toString()
    const method = (args[1]?.method || 'GET').toUpperCase()
    
    try {
      const response = await originalFetch(...args)
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      // 记录请求
      recordRequest({
        method,
        url: url.replace(window.location.origin, ''),
        duration,
        statusCode: response.status,
        status: response.ok ? 'success' : 'error'
      })
      
      return response
    } catch (error) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      // 记录失败请求
      recordRequest({
        method,
        url: url.replace(window.location.origin, ''),
        duration,
        statusCode: 0,
        status: 'error'
      })
      
      throw error
    }
  }
}

// 记录请求
const recordRequest = (request: Omit<typeof recentRequests.value[0], 'id' | 'timestamp'>) => {
  const newRequest = {
    ...request,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  }
  
  recentRequests.value.unshift(newRequest)
  
  // 限制记录数量
  if (recentRequests.value.length > 50) {
    recentRequests.value = recentRequests.value.slice(0, 50)
  }
  
  // 更新统计
  updateNetworkStats()
}

// 更新网络统计
const updateNetworkStats = () => {
  const requests = recentRequests.value
  if (requests.length === 0) return
  
  networkStats.value.totalRequests = requests.length
  
  const successCount = requests.filter(r => r.status === 'success').length
  networkStats.value.successRate = Math.round((successCount / requests.length) * 100)
  
  const totalTime = requests.reduce((sum, r) => sum + r.duration, 0)
  networkStats.value.averageTime = Math.round(totalTime / requests.length)
  
  // 更新平均API时间
  averageAPITime.value = networkStats.value.averageTime
}

// 控制函数
const toggleMinimized = () => {
  minimized.value = !minimized.value
}

const refreshMetrics = () => {
  updateMemoryUsage()
  updateNetworkStats()
  ElMessage.success('性能指标已刷新')
}

const exportMetrics = () => {
  const data = {
    timestamp: new Date().toISOString(),
    memory: memoryUsage.value,
    fps: currentFPS.value,
    apiTime: averageAPITime.value,
    components: componentMetrics.value,
    network: networkStats.value,
    recentRequests: recentRequests.value.slice(0, 10)
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-metrics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('性能指标已导出')
}

const clearMetrics = () => {
  recentRequests.value = []
  networkStats.value = {
    totalRequests: 0,
    successRate: 100,
    averageTime: 0
  }
  ElMessage.success('性能指标已清空')
}

const clearRequests = () => {
  recentRequests.value = []
  updateNetworkStats()
}

// 定时器
let refreshInterval: NodeJS.Timeout

// 生命周期
onMounted(() => {
  if (isDevelopment.value) {
    measureFPS()
    monitorNetworkRequests()
    updateMemoryUsage()
    
    // 自动刷新
    refreshInterval = setInterval(() => {
      if (autoRefresh.value && visible.value && !minimized.value) {
        updateMemoryUsage()
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (frameId) {
    cancelAnimationFrame(frameId)
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped lang="scss">
.performance-monitor {
  position: fixed;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  width: 100%; max-width: 350px;
  z-index: var(--z-index-always-on-top);
  
  .monitor-card {
    border: 2px solid var(--success-color);
    
    .card-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 600;
      color: var(--success-color);
      
      .el-icon {
        font-size: var(--text-lg);
      }
      
      span {
        flex: 1;
      }
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }
    }
    
    .monitor-content {
      .performance-metrics {
        margin-bottom: var(--text-lg);
        
        .metric-item {
          margin-bottom: var(--text-sm);
          
          .metric-label {
            font-size: var(--text-sm);
            color: var(--text-regular);
            margin-bottom: var(--spacing-xs);
          }
          
          .metric-value {
            font-size: var(--text-base);
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
            
            &.good { color: var(--success-color); }
            &.warning { color: var(--warning-color); }
            &.critical { color: var(--danger-color); }
          }
          
          .metric-bar {
            height: var(--spacing-xs);
            background: var(--bg-hover);
            border-radius: var(--radius-xs);
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
            
            .bar-fill {
              height: 100%;
              border-radius: var(--radius-xs);
              transition: width 0.3s ease;
              
              &.good { background: var(--success-color); }
              &.warning { background: var(--warning-color); }
              &.critical { background: var(--danger-color); }
            }
          }
        }
      }
      
      .component-performance,
      .network-monitor {
        margin-bottom: var(--text-lg);
        
        h4 {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--text-base);
          color: var(--text-primary);
        }
        
        .component-list {
          .component-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-lg) 0;
            border-bottom: var(--z-index-dropdown) solid var(--bg-container);
            
            &:last-child {
              border-bottom: none;
            }
            
            .component-info {
              display: flex;
              flex-direction: column;
              
              .component-name {
                font-size: var(--text-sm);
                color: var(--text-primary);
              }
              
              .component-time {
                font-size: var(--text-2xs);
                color: var(--info-color);
              }
            }
            
            .component-status {
              font-size: var(--text-2xs);
              padding: var(--spacing-sm) 6px;
              border-radius: var(--radius-xl);
              
              &.good {
                background: #f0f9ff;
                color: var(--success-color);
              }
              
              &.warning {
                background: #fdf6ec;
                color: var(--warning-color);
              }
              
              &.critical {
                background: #fef0f0;
                color: var(--danger-color);
              }
            }
          }
        }
        
        .network-stats {
          margin-bottom: var(--text-sm);
          
          .stat-item {
            display: flex;
            justify-content: space-between;
            font-size: var(--text-sm);
            margin-bottom: var(--spacing-xs);
            
            .label {
              color: var(--text-regular);
            }
            
            .value {
              font-weight: 500;
              
              &.good { color: var(--success-color); }
              &.warning { color: var(--warning-color); }
              &.critical { color: var(--danger-color); }
            }
          }
        }
        
        .recent-requests {
          .requests-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);
            font-size: var(--text-sm);
            color: var(--text-regular);
          }
          
          .requests-list {
            max-min-height: 60px; height: auto;
            overflow-y: auto;
            
            .request-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: var(--spacing-xs) 0;
              border-bottom: var(--z-index-dropdown) solid var(--bg-container);
              
              &:last-child {
                border-bottom: none;
              }
              
              .request-info {
                display: flex;
                flex-direction: column;
                flex: 1;
                
                .request-method {
                  font-size: var(--text-2xs);
                  font-weight: 600;
                  color: var(--primary-color);
                }
                
                .request-url {
                  font-size: var(--text-2xs);
                  color: var(--text-primary);
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  max-max-width: 200px; width: 100%;
                }
                
                .request-time {
                  font-size: 9px;
                  color: var(--info-color);
                }
              }
              
              .request-status {
                font-size: var(--text-2xs);
                font-weight: 500;
              }
              
              &.success .request-status {
                color: var(--success-color);
              }
              
              &.error .request-status {
                color: var(--danger-color);
              }
            }
          }
        }
      }
      
      .monitor-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
        padding-top: var(--text-sm);
        border-top: var(--z-index-dropdown) solid var(--border-color);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .performance-monitor {
    position: relative;
    bottom: auto;
    right: auto;
    width: 100%;
    margin: var(--text-lg) 0;
  }
}
</style>
