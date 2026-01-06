<template>
  <div class="dashboard-performance">
    <div class="performance-header">
      <h1>仪表板绩效</h1>
      <p>系统性能监控和优化建议</p>
    </div>

    <div class="performance-grid">
      <!-- 性能概览 -->
      <div class="performance-overview">
        <h2>性能概览</h2>
        <div class="overview-cards">
          <div class="performance-card">
            <div class="card-header">
              <h3>响应时间</h3>
              <div class="status-indicator good"></div>
            </div>
            <div class="card-content">
              <div class="metric-value">245ms</div>
              <div class="metric-label">平均响应时间</div>
            </div>
          </div>

          <div class="performance-card">
            <div class="card-header">
              <h3>系统负载</h3>
              <div class="status-indicator warning"></div>
            </div>
            <div class="card-content">
              <div class="metric-value">68%</div>
              <div class="metric-label">CPU使用率</div>
            </div>
          </div>

          <div class="performance-card">
            <div class="card-header">
              <h3>内存使用</h3>
              <div class="status-indicator good"></div>
            </div>
            <div class="card-content">
              <div class="metric-value">4.2GB</div>
              <div class="metric-label">已使用内存</div>
            </div>
          </div>

          <div class="performance-card">
            <div class="card-header">
              <h3>数据库</h3>
              <div class="status-indicator good"></div>
            </div>
            <div class="card-content">
              <div class="metric-value">156ms</div>
              <div class="metric-label">查询时间</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能趋势 -->
      <div class="performance-trends">
        <h2>性能趋势</h2>
        <div class="trends-chart">
          <div class="chart-placeholder">
            <p>📊 性能趋势图表</p>
            <p>显示过去24小时的性能数据</p>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="optimization-suggestions">
        <h2>优化建议</h2>
        <div class="suggestions-list">
          <div class="suggestion-item">
            <div class="suggestion-icon">⚡</div>
            <div class="suggestion-content">
              <h3>缓存优化</h3>
              <p>建议启用Redis缓存以提高数据访问速度</p>
              <div class="suggestion-priority high">高优先级</div>
            </div>
          </div>

          <div class="suggestion-item">
            <div class="suggestion-icon">🗄️</div>
            <div class="suggestion-content">
              <h3>数据库索引</h3>
              <p>为常用查询字段添加索引以优化查询性能</p>
              <div class="suggestion-priority medium">中优先级</div>
            </div>
          </div>

          <div class="suggestion-item">
            <div class="suggestion-icon">🔧</div>
            <div class="suggestion-content">
              <h3>代码优化</h3>
              <p>优化循环和算法以减少CPU使用率</p>
              <div class="suggestion-priority low">低优先级</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时监控 -->
      <div class="real-time-monitoring">
        <h2>实时监控</h2>
        <div class="monitoring-grid">
          <div class="monitor-item">
            <h3>活跃用户</h3>
            <div class="monitor-value">{{ activeUsers }}</div>
          </div>
          
          <div class="monitor-item">
            <h3>请求/秒</h3>
            <div class="monitor-value">{{ requestsPerSecond }}</div>
          </div>
          
          <div class="monitor-item">
            <h3>错误率</h3>
            <div class="monitor-value">{{ errorRate }}%</div>
          </div>
          
          <div class="monitor-item">
            <h3>可用性</h3>
            <div class="monitor-value">{{ uptime }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 响应式数据
const activeUsers = ref(0)
const requestsPerSecond = ref(0)
const errorRate = ref(0)
const uptime = ref(99.9)

let monitoringInterval: NodeJS.Timeout | null = null

// 生命周期
onMounted(() => {
  startRealTimeMonitoring()
})

onUnmounted(() => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }
})

// 方法
const startRealTimeMonitoring = () => {
  // 模拟实时数据更新
  monitoringInterval = setInterval(() => {
    activeUsers.value = Math.floor(Math.random() * 100) + 50
    requestsPerSecond.value = Math.floor(Math.random() * 50) + 20
    errorRate.value = Math.random() * 2
    uptime.value = 99.5 + Math.random() * 0.5
  }, 2000)
}

const optimizePerformance = (type: string) => {
  console.log('执行性能优化:', type)
  // 这里可以添加实际的优化逻辑
}
</script>

<style scoped>
.dashboard-performance {
  padding: var(--text-2xl);
  background: var(--bg-secondary);
  min-height: 100vh;
}

.performance-header {
  margin-bottom: var(--spacing-3xl);
  text-align: center;
}

.performance-header h1 {
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.performance-header p {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.performance-grid {
  display: grid;
  gap: var(--text-2xl);
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
}

.performance-overview,
.performance-trends,
.optimization-suggestions,
.real-time-monitoring {
  background: white;
  padding: var(--text-2xl);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.performance-overview h2,
.performance-trends h2,
.optimization-suggestions h2,
.real-time-monitoring h2 {
  font-size: var(--spacing-lg);
  color: var(--text-primary);
  margin-bottom: var(--text-lg);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-base);
}

.performance-card {
  background: var(--bg-tertiary);
  padding: var(--text-base);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid #e8e8e8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.card-header h3 {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.status-indicator {
  width: var(--spacing-sm);
  height: var(--spacing-sm);
  border-radius: var(--radius-full);
}

.status-indicator.good {
  background: var(--success-color);
}

.status-indicator.warning {
  background: var(--brand-warning);
}

.status-indicator.error {
  background: var(--brand-danger);
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.metric-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.trends-chart {
  min-height: 60px; height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--spacing-xs);
  border: 2px dashed var(--border-base);
}

.chart-placeholder {
  text-align: center;
  color: var(--text-tertiary);
}

.suggestions-list {
  display: grid;
  gap: var(--text-base);
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: var(--text-base);
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.suggestion-icon {
  font-size: var(--text-2xl);
  width: var(--icon-size); height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--radius-full);
}

.suggestion-content {
  flex: 1;
}

.suggestion-content h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.suggestion-content p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.suggestion-priority {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--text-xs);
  font-size: var(--text-xs);
  font-weight: 500;
}

.suggestion-priority.high {
  background: var(--bg-white)2e8;
  color: #fa8c16;
}

.suggestion-priority.medium {
  background: #f6ffed;
  color: var(--success-color);
}

.suggestion-priority.low {
  background: var(--bg-gray-light);
  color: var(--text-secondary);
}

.monitoring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--text-base);
}

.monitor-item {
  text-align: center;
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.monitor-item h3 {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.monitor-value {
  font-size: var(--spacing-lg);
  font-weight: bold;
  color: var(--primary-color);
}
</style>
