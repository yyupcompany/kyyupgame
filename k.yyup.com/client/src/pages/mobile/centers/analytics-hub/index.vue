<template>
  <MobileSubPageLayout title="数据分析" back-path="/mobile/centers">
    <div class="wrapper">
    <!-- 页面标题 -->
    <van-nav-bar
      title="数据分析"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 时间筛选器 -->
    <div class="filter-section">
      <van-dropdown-menu>
        <van-dropdown-item v-model="timeFilter" :options="timeOptions" @change="handleTimeFilterChange" />
      </van-dropdown-menu>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-section">
      <div class="metrics-grid">
        <div v-for="metric in coreMetrics" :key="metric.id" class="metric-card">
          <div class="metric-header">
            <span class="metric-title">{{ metric.title }}</span>
            <van-icon :name="getTrendIcon(metric.trend)" :color="getTrendColor(metric.trend)" size="16" />
          </div>
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-footer">
            <span class="metric-trend" :style="{ color: getTrendColor(metric.trend) }">
              {{ metric.trendText }}
            </span>
            <span class="metric-period">{{ metric.period }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表展示 -->
    <div class="chart-section">
      <div class="section-header">
        <h3 class="section-title">数据趋势</h3>
      </div>
      <van-tabs v-model:active="activeChartTab" class="chart-tabs">
        <van-tab title="招生" name="enrollment">
          <div class="chart-container">
            <div class="chart-placeholder">
              <van-icon name="bar-chart-o" size="48" color="var(--primary-color)" />
              <p class="placeholder-text">招生数据图表</p>
              <p class="placeholder-desc">展示最近30天招生趋势</p>
            </div>
          </div>
        </van-tab>
        <van-tab title="活动" name="activity">
          <div class="chart-container">
            <div class="chart-placeholder">
              <van-icon name="line-chart-o" size="48" color="var(--success-color)" />
              <p class="placeholder-text">活动数据图表</p>
              <p class="placeholder-desc">展示活动参与趋势</p>
            </div>
          </div>
        </van-tab>
        <van-tab title="财务" name="finance">
          <div class="chart-container">
            <div class="chart-placeholder">
              <van-icon name="data-bar-chart-o" size="48" color="var(--warning-color)" />
              <p class="placeholder-text">财务数据图表</p>
              <p class="placeholder-desc">展示收支趋势</p>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 详细数据列表 -->
    <div class="detail-section">
      <div class="section-header">
        <h3 class="section-title">详细数据</h3>
        <van-button size="medium" type="primary" @click="navigateTo('/mobile/centers/analytics')">
          查看全部
        </van-button>
      </div>
      <div class="detail-list">
        <div
          v-for="item in detailItems"
          :key="item.id"
          class="detail-item"
          @click="navigateTo(item.path)"
        >
          <div class="detail-icon" :style="{ background: item.bgColor }">
            <van-icon :name="item.icon" size="20" :color="item.iconColor" />
          </div>
          <div class="detail-content">
            <div class="detail-title">{{ item.title }}</div>
            <div class="detail-desc">{{ item.description }}</div>
          </div>
          <div class="detail-value" :style="{ color: item.valueColor }">
            {{ item.value }}
          </div>
          <van-icon name="arrow" size="16" color="var(--text-tertiary)" />
        </div>
      </div>
        </div>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 时间筛选器
const timeFilter = ref('week')
const timeOptions = [
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' },
  { text: '本季度', value: 'quarter' },
  { text: '本年度', value: 'year' }
]

// 核心指标数据
const coreMetrics = ref([
  {
    id: 1,
    title: '新增咨询',
    value: '156',
    trend: 'up',
    trendText: '+12%',
    period: '较上周'
  },
  {
    id: 2,
    title: '到园参观',
    value: '89',
    trend: 'up',
    trendText: '+8%',
    period: '较上周'
  },
  {
    id: 3,
    title: '报名人数',
    value: '42',
    trend: 'down',
    trendText: '-3%',
    period: '较上周'
  },
  {
    id: 4,
    title: '转化率',
    value: '47.2%',
    trend: 'up',
    trendText: '+5%',
    period: '较上周'
  }
])

// 图表Tab
const activeChartTab = ref('enrollment')

// 详细数据列表
const detailItems = ref([
  {
    id: 1,
    title: '招生漏斗',
    description: '从咨询到报名的转化流程',
    icon: 'guide-o',
    path: '/mobile/centers/analytics/enrollment-funnel',
    value: '47.2%',
    valueColor: 'var(--primary-color)',
    bgColor: 'rgba(var(--primary-rgb), 0.1)',
    iconColor: 'var(--primary-color)'
  },
  {
    id: 2,
    title: '活动参与度',
    description: '家长参与活动情况分析',
    icon: 'calendar-o',
    path: '/mobile/centers/analytics/activity-engagement',
    value: '78.5%',
    valueColor: 'var(--success-color)',
    bgColor: 'rgba(var(--success-rgb), 0.1)',
    iconColor: 'var(--success-color)'
  },
  {
    id: 3,
    title: '客户来源',
    description: '各渠道获客情况',
    icon: 'shop-o',
    path: '/mobile/centers/analytics/customer-sources',
    value: '5种',
    valueColor: 'var(--warning-color)',
    bgColor: 'rgba(var(--warning-rgb), 0.1)',
    iconColor: 'var(--warning-color)'
  },
  {
    id: 4,
    title: '财务概况',
    description: '收入支出统计',
    icon: 'gold-coin-o',
    path: '/mobile/centers/analytics/finance-overview',
    value: '+¥12.5w',
    valueColor: 'var(--danger-color)',
    bgColor: 'rgba(var(--danger-rgb), 0.1)',
    iconColor: 'var(--danger-color)'
  }
])

// 获取趋势图标
const getTrendIcon = (trend: string) => {
  return trend === 'up' ? 'arrow-up' : 'arrow-down'
}

// 获取趋势颜色
const getTrendColor = (trend: string) => {
  return trend === 'up' ? 'var(--success-color)' : 'var(--danger-color)'
}

// 处理时间筛选变化
const handleTimeFilterChange = (value: string) => {
  console.log('时间筛选变化:', value)
  // 这里可以根据筛选器值重新加载数据
}

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/design-tokens.scss';

.analytics-hub-page {
  min-height: 100vh;
  background: var(--bg-color-page);
  padding-bottom: env(safe-area-inset-bottom);
}

// 筛选器区域
.filter-section {
  background: var(--bg-card);
  position: sticky;
  top: 46px;
  z-index: 10;
}

// 核心指标区域
.metrics-section {
  padding: var(--app-gap);
  background: var(--bg-card);

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--app-gap-sm);
  }

  .metric-card {
    padding: var(--app-gap);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--app-gap-xs);
    }

    .metric-title {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: var(--font-medium);
    }

    .metric-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      line-height: 1.2;
      margin-bottom: var(--app-gap-xs);
    }

    .metric-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .metric-trend {
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
    }

    .metric-period {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
    }
  }
}

// 图表区域
.chart-section {
  margin-top: var(--app-gap);
  background: var(--bg-card);
  padding: var(--app-gap) 0;

  .chart-container {
    padding: var(--app-gap-lg) var(--app-gap);
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--app-gap);

    .placeholder-text {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0;
    }

    .placeholder-desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
    }
  }
}

// 通用区块样式
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--app-gap);
  margin-bottom: var(--app-gap-sm);

  .section-title {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

// 详细数据列表
.detail-section {
  margin-top: var(--app-gap);
  background: var(--bg-card);
  padding: var(--app-gap) 0;

  .detail-list {
    padding: 0 var(--app-gap);
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: var(--app-gap-sm);
    padding: var(--app-gap-sm);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--app-gap-xs);
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    &:active {
      transform: scale(0.98);
    }

    .detail-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-md);
      flex-shrink: 0;
    }

    .detail-content {
      flex: 1;
      min-width: 0;
    }

    .detail-title {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      line-height: 1.3;
    }

    .detail-desc {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.3;
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .detail-value {
      font-size: var(--text-base);
      font-weight: var(--font-bold);
      flex-shrink: 0;
    }
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .analytics-hub-page {
    background: var(--bg-color-page-dark);
  }

  .metric-card,
  .detail-item {
    background: var(--bg-color-light-dark);
  }
}
</style>
