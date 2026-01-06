<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">仪表板</h1>
      <p class="page-subtitle">欢迎回来！这里是您的数据概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card card">
        <div class="stat-icon" :class="`stat-${stat.type}`">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path :d="stat.iconPath" />
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stat.value }}</h3>
          <p class="stat-title">{{ stat.title }}</p>
          <div class="stat-change" :class="stat.changeType">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path :d="stat.changeType === 'positive' ? 'M7 14l5-5 5 5z' : 'M7 10l5 5 5-5z'" />
            </svg>
            <span>{{ stat.change }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-card card">
        <div class="chart-header">
          <h3 class="chart-title">用户增长趋势</h3>
          <div class="chart-actions">
            <button class="btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="chart-content">
          <div class="mock-chart">
            <div class="chart-bars">
              <div v-for="(height, index) in chartData" :key="index" 
                   class="chart-bar" 
                   :style="{ height: height + '%' }">
              </div>
            </div>
            <div class="chart-labels">
              <span v-for="label in chartLabels" :key="label">{{ label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="activity-card card">
        <div class="chart-header">
          <h3 class="chart-title">最近活动</h3>
        </div>
        <div class="activity-list">
          <div v-for="activity in activities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="`activity-${activity.type}`">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path :d="activity.iconPath" />
              </svg>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3 class="section-title">快速操作</h3>
      <div class="actions-grid">
        <button v-for="action in quickActions" :key="action.title" 
                class="action-btn card"
                @click="handleQuickAction(action.action)">
          <div class="action-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path :d="action.iconPath" />
            </svg>
          </div>
          <span class="action-title">{{ action.title }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 统计数据
const stats = ref([
  {
    title: '总用户数',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive',
    type: 'users',
    iconPath: 'M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z'
  },
  {
    title: '今日访问',
    value: '1,234',
    change: '+8.2%',
    changeType: 'positive',
    type: 'visits',
    iconPath: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'
  },
  {
    title: '销售额',
    value: '¥45,678',
    change: '-2.1%',
    changeType: 'negative',
    type: 'sales',
    iconPath: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'
  },
  {
    title: '转化率',
    value: '3.24%',
    change: '+0.5%',
    changeType: 'positive',
    type: 'conversion',
    iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'
  }
])

// 图表数据
const chartData = ref([65, 78, 45, 88, 92, 67, 73, 85, 91, 76, 82, 95])
const chartLabels = ref(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'])

// 活动数据
const activities = ref([
  {
    id: 1,
    text: '新用户 张三 注册了账户',
    time: '2分钟前',
    type: 'user',
    iconPath: 'M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z'
  },
  {
    id: 2,
    text: '订单 #12345 已完成支付',
    time: '5分钟前',
    type: 'order',
    iconPath: 'M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1z'
  },
  {
    id: 3,
    text: '系统备份已完成',
    time: '10分钟前',
    type: 'system',
    iconPath: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'
  },
  {
    id: 4,
    text: '数据报告已生成',
    time: '15分钟前',
    type: 'report',
    iconPath: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
  }
])

// 快速操作
const quickActions = ref([
  {
    title: '添加用户',
    action: 'add-user',
    iconPath: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
  },
  {
    title: '生成报告',
    action: 'generate-report',
    iconPath: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
  },
  {
    title: '系统设置',
    action: 'settings',
    iconPath: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z'
  },
  {
    title: '数据备份',
    action: 'backup',
    iconPath: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'
  }
])

// 快速操作处理
const handleQuickAction = (action: string) => {
  console.log('执行快速操作:', action)
  // 这里可以实现具体的操作逻辑
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-2xl);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.page-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: transform var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
  }
}

.stat-icon {
  width: 4var(--spacing-sm);
  height: 4var(--spacing-sm);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 2var(--spacing-xs);
    height: 2var(--spacing-xs);
    color: white;
  }
  
  &.stat-users {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  }
  
  &.stat-visits {
    background: linear-gradient(135deg, var(--secondary-color), #34d399);
  }
  
  &.stat-sales {
    background: linear-gradient(135deg, var(--accent-color), #fbbf24);
  }
  
  &.stat-conversion {
    background: linear-gradient(135deg, var(--info-color), #38bdf8);
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  font-weight: 500;
  
  svg {
    width: var(--spacing-md);
    height: var(--spacing-md);
  }
  
  &.positive {
    color: var(--secondary-color);
  }
  
  &.negative {
    color: var(--danger-color);
  }
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  
  @media (max-width: 76var(--spacing-sm)) {
    grid-template-columns: 1fr;
  }
}

.chart-card,
.activity-card {
  padding: var(--spacing-lg);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.chart-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.chart-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.mock-chart {
  height: 300px;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) 0;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, var(--primary-color), var(--primary-light));
  border-radius: var(--spacing-xs) var(--spacing-xs) 0 0;
  min-height: 20px;
  transition: all var(--transition-fast);
  
  &:hover {
    opacity: 0.8;
  }
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding-top: var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
  
  &:hover {
    background: var(--bg-hover);
  }
}

.activity-icon {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: var(--spacing-md);
    height: var(--spacing-md);
    color: white;
  }
  
  &.activity-user {
    background: var(--primary-color);
  }
  
  &.activity-order {
    background: var(--secondary-color);
  }
  
  &.activity-system {
    background: var(--info-color);
  }
  
  &.activity-report {
    background: var(--accent-color);
  }
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.action-btn {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
  }
}

.action-icon {
  width: 4var(--spacing-sm);
  height: 4var(--spacing-sm);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 2var(--spacing-xs);
    height: 2var(--spacing-xs);
    color: white;
  }
}

.action-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}
</style> 