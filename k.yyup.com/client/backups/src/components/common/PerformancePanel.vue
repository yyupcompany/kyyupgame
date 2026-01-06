<template>
  <div class="performance-panel" v-if="visible">
    <div class="panel-header">
      <h3>🚀 性能监控面板</h3>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
    
    <div class="panel-content">
      <!-- 总体评分 -->
      <div class="score-section">
        <div class="score-circle" :class="scoreLevel">
          <span class="score-number">{{ currentScore }}</span>
          <span class="score-label">分</span>
        </div>
        <div class="score-info">
          <p class="score-title">性能评分</p>
          <p class="score-desc">{{ scoreDescription }}</p>
        </div>
      </div>
      
      <!-- 关键指标 -->
      <div class="metrics-section">
        <h4>关键指标</h4>
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-label">页面加载</span>
            <span class="metric-value" :class="getMetricClass(averageLoadTime, 2000)">
              {{ averageLoadTime.toFixed(0) }}ms
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">内存使用</span>
            <span class="metric-value" :class="getMetricClass(memoryUsage, 50)">
              {{ memoryUsage.toFixed(1) }}MB
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">缓存命中</span>
            <span class="metric-value" :class="getMetricClass(cacheHitRate, 80, true)">
              {{ cacheHitRate.toFixed(1) }}%
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">API响应</span>
            <span class="metric-value" :class="getMetricClass(avgApiTime, 500)">
              {{ avgApiTime.toFixed(0) }}ms
            </span>
          </div>
        </div>
      </div>
      
      <!-- 最近告警 -->
      <div class="alerts-section" v-if="recentAlerts.length > 0">
        <h4>最近告警</h4>
        <div class="alerts-list">
          <div 
            v-for="alert in recentAlerts.slice(0, 3)" 
            :key="alert.timestamp"
            class="alert-item"
            :class="`alert-${alert.severity}`"
          >
            <span class="alert-icon">⚠️</span>
            <span class="alert-message">{{ alert.message }}</span>
            <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 优化建议 */
      <div class="recommendations-section" v-if="recommendations.length > 0">
        <h4>优化建议</h4>
        <ul class="recommendations-list">
          <li v-for="(rec, index) in recommendations.slice(0, 3)" :key="index">
            {{ rec }}
          </li>
        </ul>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions-section">
        <button @click="runOptimization" class="action-btn primary" :disabled="isOptimizing">
          {{ isOptimizing ? '优化中...' : '🔧 运行优化' }}
        </button>
        <button @click="clearCache" class="action-btn secondary">
          🗑️ 清理缓存
        </button>
        <button @click="exportReport" class="action-btn secondary">
          📊 导出报告
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { performanceMonitor } from '../../utils/performance-monitor'
import { routePreloader } from '../../utils/route-preloader'

interface Emits {
  (event: 'close'): void
}

defineEmits<Emits>()

// 响应式状态
const visible = ref(true)
const isOptimizing = ref(false)
const currentScore = ref(100)
const averageLoadTime = ref(0)
const memoryUsage = ref(0)
const cacheHitRate = ref(90)
const avgApiTime = ref(200)
const recentAlerts = ref<any[]>([])
const recommendations = ref<string[]>([])

// 计算属性
const scoreLevel = computed(() => {
  if (currentScore.value >= 90) return 'excellent'
  if (currentScore.value >= 70) return 'good'
  if (currentScore.value >= 50) return 'fair'
  return 'poor'
})

const scoreDescription = computed(() => {
  if (currentScore.value >= 90) return '优秀 - 性能表现出色'
  if (currentScore.value >= 70) return '良好 - 性能表现不错'
  if (currentScore.value >= 50) return '一般 - 有优化空间'
  return '较差 - 需要立即优化'
})

/**
 * 获取指标状态类
 */
function getMetricClass(value: number, threshold: number, higherIsBetter = false): string {
  const isGood = higherIsBetter ? value >= threshold : value <= threshold
  return isGood ? 'good' : 'poor'
}

/**
 * 格式化时间
 */
function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  return `${Math.floor(diff / 3600000)}小时前`
}

/**
 * 更新性能数据
 */
function updatePerformanceData(): void {
  const report = performanceMonitor.getPerformanceReport()
  
  currentScore.value = report.currentScore
  averageLoadTime.value = report.averageLoadTime
  cacheHitRate.value = report.cachePerformance?.hitRate || 90
  
  // 计算内存使用 (MB)
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
    memoryUsage.value = (window.performance as any).memory.usedJSHeapSize / 1024 / 1024
  }
  
  // 获取最近告警
  recentAlerts.value = report.alerts || []
  
  // 获取优化建议
  recommendations.value = report.recommendations || []
}

/**
 * 运行性能优化
 */
async function runOptimization(): Promise<void> {
  isOptimizing.value = true
  
  try {
    console.log('🔧 开始性能优化...')
    
    // 运行性能优化
    const result = await performanceMonitor.performOptimization()
    
    console.log('✅ 性能优化完成:', result)
    
    // 更新数据
    updatePerformanceData()
    
  } catch (error) {
    console.error('❌ 性能优化失败:', error)
  } finally {
    isOptimizing.value = false
  }
}

/**
 * 清理缓存
 */
function clearCache(): void {
  routePreloader.clearCache()
  localStorage.removeItem('route_metrics')
  localStorage.removeItem('route_history')
  
  console.log('🗑️ 缓存已清理')
  updatePerformanceData()
}

/**
 * 导出性能报告
 */
function exportReport(): void {
  const report = performanceMonitor.getPerformanceReport()
  const routeStats = routePreloader.getStats()
  
  const exportData = {
    timestamp: new Date().toISOString(),
    performance: report,
    routes: routeStats,
    userAgent: navigator.userAgent
  }
  
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `performance-report-${Date.now()}.json`
  link.click()
  
  URL.revokeObjectURL(link.href)
  
  console.log('📊 性能报告已导出')
}

// 定时器引用
let updateTimer: number | null = null

// 生命周期
onMounted(() => {
  updatePerformanceData()
  
  // 每5秒更新一次数据
  updateTimer = window.setInterval(updatePerformanceData, 5000)
  
  console.log('📊 性能监控面板已启动')
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style lang="scss" scoped>
.performance-panel {
  position: fixed;
  top: var(--text-2xl);
  right: var(--text-2xl);
  width: 320px;
  max-height: 80vh;
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 9999;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--primary-color);
  color: white;
  
  h3 {
    margin: 0;
    font-size: var(--text-base);
  }
  
  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: var(--text-xl);
    cursor: pointer;
    padding: 0;
    width: var(--text-3xl);
    height: var(--text-3xl);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    
    &:hover {
      background: var(--white-alpha-20);
    }
  }
}

.panel-content {
  padding: var(--spacing-md);
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.score-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  
  &.excellent { background: var(--success-color); }
  &.good { background: var(--warning-color); }
  &.fair { background: var(--info-color); }
  &.poor { background: var(--danger-color); }
}

.score-number {
  font-size: var(--text-lg);
}

.score-label {
  font-size: var(--text-xs);
}

.score-info {
  flex: 1;
  
  .score-title {
    margin: 0 0 var(--spacing-xs) 0;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .score-desc {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

.metrics-section,
.alerts-section,
.recommendations-section {
  margin-bottom: var(--spacing-lg);
  
  h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: 600;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  
  .metric-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
  
  .metric-value {
    font-size: var(--text-sm);
    font-weight: 600;
    
    &.good { color: var(--success-color); }
    &.poor { color: var(--danger-color); }
  }
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.alert-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  
  &.alert-critical { background: rgba(244, 67, 54, 0.1); }
  &.alert-high { background: rgba(255, 152, 0, 0.1); }
  &.alert-medium { background: rgba(33, 150, 243, 0.1); }
  &.alert-low { background: rgba(76, 175, 80, 0.1); }
  
  .alert-icon {
    font-size: var(--text-xs);
  }
  
  .alert-message {
    flex: 1;
    color: var(--text-primary);
  }
  
  .alert-time {
    color: var(--text-secondary);
  }
}

.recommendations-list {
  margin: 0;
  padding-left: var(--spacing-md);
  
  li {
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &.primary {
    background: var(--primary-color);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--primary-dark);
    }
    
    &:disabled {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    
    &:hover {
      background: var(--bg-hover);
    }
  }
}
</style>