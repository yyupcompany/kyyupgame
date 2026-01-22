<template>
  <div class="dashboard-analytics">
    <div class="analytics-header">
      <h1>仪表板分析</h1>
      <p>深度数据分析和洞察</p>
    </div>

    <div class="analytics-grid">
      <!-- 关键指标卡片 -->
      <div class="metrics-section">
        <h2>关键指标</h2>
        <div class="metrics-cards">
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <h3>总体表现</h3>
              <div class="metric-value">85%</div>
              <div class="metric-trend positive">+5.2%</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">👥</div>
            <div class="metric-content">
              <h3>用户活跃度</h3>
              <div class="metric-value">1,234</div>
              <div class="metric-trend positive">+12.3%</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-content">
              <h3>增长率</h3>
              <div class="metric-value">23.5%</div>
              <div class="metric-trend negative">-2.1%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 趋势分析 -->
      <div class="trends-section">
        <h2>趋势分析</h2>
        <div class="chart-container">
          <div class="chart-placeholder">
            <p>📈 趋势图表将在此显示</p>
            <p>数据加载中...</p>
          </div>
        </div>
      </div>

      <!-- 详细分析 -->
      <div class="detailed-analysis">
        <h2>详细分析</h2>
        <div class="analysis-tabs">
          <button class="tab-button active">用户行为</button>
          <button class="tab-button">性能指标</button>
          <button class="tab-button">业务洞察</button>
        </div>
        
        <div class="analysis-content">
          <div class="analysis-item">
            <h3>用户行为分析</h3>
            <p>用户在系统中的行为模式和偏好分析</p>
            <div class="progress-bar">
              <div class="progress" style="width: 75%"></div>
            </div>
          </div>
          
          <div class="analysis-item">
            <h3>页面访问统计</h3>
            <p>各页面的访问频率和停留时间</p>
            <div class="progress-bar">
              <div class="progress" style="width: 60%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 响应式数据
const loading = ref(true)
const analyticsData = ref({
  totalPerformance: 85,
  userActivity: 1234,
  growthRate: 23.5
})

// 生命周期
onMounted(() => {
  loadAnalyticsData()
})

// 方法
const loadAnalyticsData = async () => {
  try {
    // 模拟数据加载
    setTimeout(() => {
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('加载分析数据失败:', error)
    loading.value = false
  }
}

const switchTab = (tabName: string) => {
  console.log('切换到标签页:', tabName)
}
</script>

<style scoped>
.dashboard-analytics {
  padding: var(--text-2xl);
  background: var(--bg-page);
  min-height: 100vh;
}

.analytics-header {
  margin-bottom: var(--spacing-3xl);
  text-align: center;
}

.analytics-header h1 {
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.analytics-header p {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.analytics-grid {
  display: grid;
  gap: var(--text-2xl);
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
}

.metrics-section h2,
.trends-section h2,
.detailed-analysis h2 {
  font-size: var(--spacing-lg);
  color: var(--text-primary);
  margin-bottom: var(--text-lg);
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-base);
}

.metric-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  display: flex;
  align-items: center;
  gap: var(--text-base);
}

.metric-icon {
  font-size: var(--text-4xl);
  width: auto;
  min-height: 60px; height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-gray-light);
  border-radius: var(--radius-full);
}

.metric-content h3 {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.metric-trend {
  font-size: var(--text-xs);
  font-weight: 500;
}

.metric-trend.positive {
  color: var(--success-color);
}

.metric-trend.negative {
  color: var(--brand-danger);
}

.trends-section,
.detailed-analysis {
  background: white;
  padding: var(--text-2xl);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.chart-container {
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

.analysis-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--text-2xl);
  border-bottom: var(--z-index-dropdown) solid #e8e8e8;
}

.tab-button {
  padding: var(--spacing-sm) var(--text-lg);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
  border-bottom: var(--transform-drop) solid transparent;
  transition: all 0.3s;
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-button:hover {
  color: var(--primary-color);
}

.analysis-content {
  display: grid;
  gap: var(--text-base);
}

.analysis-item h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.analysis-item p {
  color: var(--text-secondary);
  margin-bottom: var(--text-sm);
}

.progress-bar {
  width: 100%;
  height: var(--spacing-sm);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-xs);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.3s ease;
}
</style>
