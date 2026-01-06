<template>
  <div class="personal-contribution">
    <!-- 贡献统计卡片 -->
    <div class="contribution-cards">
      <van-row :gutter="12">
        <van-col span="12" v-for="(card, index) in contributionCards" :key="index">
          <div class="contribution-card" :class="card.type">
            <div class="card-icon">
              <van-icon :name="card.icon" size="24" />
            </div>
            <div class="card-info">
              <div class="card-value">{{ card.value }}</div>
              <div class="card-label">{{ card.label }}</div>
              <div class="card-trend" :class="card.trendType">
                <van-icon :name="getTrendIcon(card.trendType)" size="12" />
                {{ card.trend }}
              </div>
            </div>
          </div>
        </van-col>
      </van-row>
    </div>

    <!-- 贡献图表 -->
    <div class="contribution-charts">
      <!-- 转介绍趋势 -->
      <div class="chart-section">
        <div class="chart-header">
          <h3 class="chart-title">转介绍趋势</h3>
          <van-button
            size="small"
            type="primary"
            plain
            @click="showDatePicker = true"
          >
            {{ selectedPeriod }}
          </van-button>
        </div>
        <div class="chart-container">
          <div
            ref="trendChartRef"
            class="trend-chart"
            style="height: 200px"
          ></div>
        </div>
      </div>

      <!-- 贡献分布 -->
      <div class="chart-section">
        <div class="chart-header">
          <h3 class="chart-title">贡献分布</h3>
          <van-button
            size="small"
            type="primary"
            plain
            @click="$emit('view-details')"
          >
            查看详情
          </van-button>
        </div>
        <div class="chart-container">
          <div
            ref="distributionChartRef"
            class="distribution-chart"
            style="height: 200px"
          ></div>
        </div>
      </div>
    </div>

    <!-- 详细数据列表 -->
    <div class="contribution-details">
      <div class="section-header">
        <h3 class="section-title">贡献明细</h3>
        <van-button
          size="small"
          type="primary"
          plain
          @click="$emit('export-data')"
        >
          导出数据
        </van-button>
      </div>
      <div class="details-list">
        <van-cell-group inset>
          <van-cell
            v-for="item in contributionDetails"
            :key="item.id"
            :title="item.title"
            :label="item.description"
            :value="formatValue(item.value)"
            :is-link="true"
            @click="$emit('detail-click', item)"
          >
            <template #icon>
              <van-icon
                :name="item.icon"
                :color="item.color"
                size="16"
                style="margin-right: 12px"
              />
            </template>

            <template #right-icon>
              <div class="detail-meta">
                <span class="detail-value">{{ formatValue(item.value) }}</span>
                <van-icon name="arrow" size="14" color="#c8c9cc" />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <!-- 成就徽章 -->
    <div class="achievement-badges">
      <h3 class="section-title">获得成就</h3>
      <div class="badges-grid">
        <div
          v-for="badge in achievementBadges"
          :key="badge.id"
          class="badge-item"
          @click="$emit('badge-click', badge)"
        >
          <div class="badge-icon">
            <van-image
              :src="badge.icon"
              width="48"
              height="48"
              fit="cover"
              round
            />
            <van-badge
              v-if="badge.isNew"
              dot
              color="#ff6b6b"
            />
          </div>
          <div class="badge-info">
            <h4 class="badge-name">{{ badge.name }}</h4>
            <p class="badge-desc">{{ badge.description }}</p>
            <div class="badge-date">{{ formatDate(badge.earnedAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜 -->
    <div class="leaderboard">
      <div class="section-header">
        <h3 class="section-title">贡献排行榜</h3>
        <van-button
          size="small"
          type="primary"
          plain
          @click="$emit('view-leaderboard')"
        >
          查看完整排行
        </van-button>
      </div>
      <div class="leaderboard-list">
        <div
          v-for="(ranker, index) in leaderboardData"
          :key="ranker.id"
          class="leaderboard-item"
          :class="{ 'current-user': ranker.isCurrentUser }"
          @click="$emit('ranker-click', ranker)"
        >
          <div class="rank-number" :class="`rank-${index + 1}`">
            {{ index + 1 }}
          </div>
          <van-image
            :src="ranker.avatar"
            width="40"
            height="40"
            round
            fit="cover"
          />
          <div class="ranker-info">
            <div class="ranker-name">{{ ranker.name }}</div>
            <div class="ranker-contribution">贡献 {{ ranker.contribution }}</div>
          </div>
          <div class="ranker-rewards">
            <span class="rewards-amount">¥{{ ranker.rewards }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期选择器弹窗 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-picker
        :columns="periodOptions"
        @confirm="onPeriodConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { showToast } from 'vant'

interface ContributionCard {
  icon: string
  value: string | number
  label: string
  trend: string
  trendType: 'up' | 'down' | 'stable'
  type: string
}

interface ContributionDetail {
  id: string | number
  title: string
  description: string
  value: number
  icon: string
  color: string
}

interface AchievementBadge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string | Date
  isNew?: boolean
}

interface LeaderboardItem {
  id: string | number
  name: string
  avatar: string
  contribution: number
  rewards: number
  isCurrentUser?: boolean
}

interface Props {
  contributionCards?: ContributionCard[]
  contributionDetails?: ContributionDetail[]
  achievementBadges?: AchievementBadge[]
  leaderboardData?: LeaderboardItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  contributionCards: () => [
    {
      icon: 'friends-o',
      value: 23,
      label: '推荐客户',
      trend: '+15%',
      trendType: 'up',
      type: 'primary'
    },
    {
      icon: 'medal-o',
      value: 8,
      label: '成功转化',
      trend: '+25%',
      trendType: 'up',
      type: 'success'
    },
    {
      icon: 'gold-coin-o',
      value: '¥3,280',
      label: '获得奖励',
      trend: '+12%',
      trendType: 'up',
      type: 'warning'
    },
    {
      icon: 'star-o',
      value: 4.8,
      label: '贡献评分',
      trend: '+0.3',
      trendType: 'up',
      type: 'danger'
    }
  ],
  contributionDetails: () => [],
  achievementBadges: () => [],
  leaderboardData: () => [],
  loading: false
})

const emit = defineEmits<{
  'detail-click': [detail: ContributionDetail]
  'badge-click': [badge: AchievementBadge]
  'ranker-click': [ranker: LeaderboardItem]
  'view-details': []
  'export-data': []
  'view-leaderboard': []
}>()

// 响应式数据
const trendChartRef = ref<HTMLElement>()
const distributionChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null

const showDatePicker = ref(false)
const selectedPeriod = ref('本月')

const periodOptions = ['本周', '本月', '本季度', '本年度']

// 方法
const getTrendIcon = (trendType: string): string => {
  const iconMap = {
    'up': 'arrow-up',
    'down': 'arrow-down',
    'stable': 'minus'
  }
  return iconMap[trendType] || 'minus'
}

const formatValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toString()
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

const updateTrendChart = () => {
  if (!trendChart) return

  // 生成模拟数据
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  })

  const referrerData = dates.map(() => Math.floor(Math.random() * 5) + 1)
  const conversionData = dates.map(() => Math.floor(Math.random() * 3))

  const option = {
    tooltip: {
      trigger: 'axis',
      confine: true
    },
    legend: {
      data: ['推荐人数', '转化人数'],
      bottom: 0,
      itemGap: 20,
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '25%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 10,
        color: '#666',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#666'
      }
    },
    series: [
      {
        name: '推荐人数',
        type: 'line',
        data: referrerData,
        smooth: true,
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '转化人数',
        type: 'line',
        data: conversionData,
        smooth: true,
        lineStyle: {
          color: '#67C23A',
          width: 2
        },
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

const initDistributionChart = () => {
  if (!distributionChartRef.value) return

  distributionChart = echarts.init(distributionChartRef.value)
  updateDistributionChart()
}

const updateDistributionChart = () => {
  if (!distributionChart) return

  const option = {
    tooltip: {
      trigger: 'item',
      confine: true
    },
    series: [
      {
        name: '贡献分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '直接推荐', itemStyle: { color: '#5470c6' } },
          { value: 25, name: '间接推荐', itemStyle: { color: '#91cc75' } },
          { value: 20, name: '活动推广', itemStyle: { color: '#fac858' } },
          { value: 15, name: '内容分享', itemStyle: { color: '#ee6666' } },
          { value: 5, name: '其他贡献', itemStyle: { color: '#73c0de' } }
        ]
      }
    ]
  }

  distributionChart.setOption(option)
}

const resizeCharts = () => {
  if (trendChart) trendChart.resize()
  if (distributionChart) distributionChart.resize()
}

const destroyCharts = () => {
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  if (distributionChart) {
    distributionChart.dispose()
    distributionChart = null
  }
}

const onPeriodConfirm = (value: string) => {
  selectedPeriod.value = value
  showDatePicker.value = false
  showToast(`已切换到: ${value}`)
  // 重新加载图表数据
  nextTick(() => {
    updateTrendChart()
  })
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initTrendChart()
    initDistributionChart()
    window.addEventListener('resize', resizeCharts)
  })
})

onUnmounted(() => {
  destroyCharts()
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style lang="scss" scoped>
.personal-contribution {
  padding: var(--van-padding-sm);

  .contribution-cards {
    margin-bottom: var(--van-padding-md);

    .contribution-card {
      background: white;
      border-radius: var(--van-border-radius-lg);
      padding: var(--van-padding-md);
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: var(--van-padding-sm);

      &.primary {
        border-left: 4px solid #409EFF;
      }

      &.success {
        border-left: 4px solid #67C23A;
      }

      &.warning {
        border-left: 4px solid #E6A23C;
      }

      &.danger {
        border-left: 4px solid #F56C6C;
      }

      .card-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-background-color-light);
        border-radius: var(--van-border-radius-md);
      }

      .card-info {
        flex: 1;

        .card-value {
          font-size: var(--van-font-size-lg);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-text-color);
          margin-bottom: 2px;
        }

        .card-label {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          margin-bottom: 2px;
        }

        .card-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: var(--van-font-size-xs);

          &.up {
            color: #67C23A;
          }

          &.down {
            color: #F56C6C;
          }

          &.stable {
            color: #E6A23C;
          }
        }
      }
    }
  }

  .contribution-charts {
    margin-bottom: var(--van-padding-md);

    .chart-section {
      background: white;
      border-radius: var(--van-border-radius-lg);
      padding: var(--van-padding-md);
      margin-bottom: var(--van-padding-sm);

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--van-padding-md);

        .chart-title {
          margin: 0;
          font-size: var(--van-font-size-md);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-text-color);
        }
      }
    }
  }

  .contribution-details {
    margin-bottom: var(--van-padding-md);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-sm);

      .section-title {
        margin: 0;
        font-size: var(--van-font-size-md);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-text-color);
      }
    }

    .detail-meta {
      display: flex;
      align-items: center;
      gap: var(--van-padding-xs);

      .detail-value {
        font-size: var(--van-font-size-md);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-primary-color);
      }
    }
  }

  .achievement-badges {
    margin-bottom: var(--van-padding-md);

    .section-title {
      margin: 0 0 var(--van-padding-sm) 0;
      font-size: var(--van-font-size-md);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }

    .badges-grid {
      display: grid;
      gap: var(--van-padding-sm);

      .badge-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);
        padding: var(--van-padding-sm);
        background: white;
        border-radius: var(--van-border-radius-lg);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
          background: var(--van-cell-active-color);
        }

        .badge-icon {
          position: relative;
        }

        .badge-info {
          flex: 1;

          .badge-name {
            font-size: var(--van-font-size-sm);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-text-color);
            margin: 0 0 2px 0;
          }

          .badge-desc {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-2);
            margin: 0 0 2px 0;
            line-height: 1.3;
          }

          .badge-date {
            font-size: 10px;
            color: var(--van-text-color-3);
          }
        }
      }
    }
  }

  .leaderboard {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-sm);

      .section-title {
        margin: 0;
        font-size: var(--van-font-size-md);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-text-color);
      }
    }

    .leaderboard-list {
      .leaderboard-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);
        padding: var(--van-padding-sm);
        border-radius: var(--van-border-radius-md);
        margin-bottom: var(--van-padding-xs);
        transition: all 0.3s ease;

        &:last-child {
          margin-bottom: 0;
        }

        &.current-user {
          background: var(--van-primary-color-light);
          border: 1px solid var(--van-primary-color);
        }

        &:active {
          transform: scale(0.98);
        }

        .rank-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--van-font-size-xs);
          font-weight: var(--van-font-weight-bold);
          color: white;

          &.rank-1 {
            background: linear-gradient(135deg, #FFD700, #FFA500);
          }

          &.rank-2 {
            background: linear-gradient(135deg, #C0C0C0, #808080);
          }

          &.rank-3 {
            background: linear-gradient(135deg, #CD7F32, #8B4513);
          }

          &:not(.rank-1):not(.rank-2):not(.rank-3) {
            background: var(--van-gray-6);
          }
        }

        .ranker-info {
          flex: 1;

          .ranker-name {
            font-size: var(--van-font-size-sm);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-text-color);
            margin-bottom: 2px;
          }

          .ranker-contribution {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-2);
          }
        }

        .ranker-rewards {
          .rewards-amount {
            font-size: var(--van-font-size-sm);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-warning-color);
          }
        }
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .personal-contribution {
    .contribution-cards .contribution-card,
    .contribution-charts .chart-section,
    .achievement-badges .badge-item,
    .leaderboard {
      background: var(--van-background-color-dark);
    }
  }
}
</style>