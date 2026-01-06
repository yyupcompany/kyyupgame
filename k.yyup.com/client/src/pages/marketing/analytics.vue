<template>
  <PageWrapper title="营销数据统计分析" :auto-empty-state="false">
    <div class="marketing-analytics">
      <!-- 时间范围选择 -->
      <el-card class="time-selector" shadow="never">
        <template #header>
          <div class="card-header">
            <span>📊 数据时间范围</span>
          </div>
        </template>
        <el-radio-group v-model="timeRange" @change="loadAnalyticsData">
          <el-radio-button label="7d">近7天</el-radio-button>
          <el-radio-button label="30d">近30天</el-radio-button>
          <el-radio-button label="90d">近3个月</el-radio-button>
          <el-radio-button label="custom">自定义</el-radio-button>
        </el-radio-group>

        <div v-if="timeRange === 'custom'" class="custom-range">
          <el-date-picker
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadAnalyticsData"
          />
        </div>
      </el-card>

      <!-- 总览卡片 -->
      <el-row :gutter="20" class="overview-cards">
        <el-col :span="6">
          <el-card class="stat-card total-registrations">
            <div class="card-content">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ analyticsData.totalRegistrations || 0 }}</div>
                <div class="stat-label">总报名人数</div>
                <div class="stat-change" :class="getChangeClass(analyticsData.registrationChange)">
                  {{ analyticsData.registrationChange || 0 }}%
                  <el-icon><TrendCharts /></el-icon>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card active-groups">
            <div class="card-content">
              <div class="stat-icon">
                <el-icon><Users /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ analyticsData.activeGroupBuys || 0 }}</div>
                <div class="stat-label">活跃团购</div>
                <div class="stat-change" :class="getChangeClass(analyticsData.groupBuyChange)">
                  {{ analyticsData.groupBuyChange || 0 }}%
                  <el-icon><TrendCharts /></el-icon>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card collect-activities">
            <div class="card-content">
              <div class="stat-icon">
                <el-icon><Present /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ analyticsData.collectActivities || 0 }}</div>
                <div class="stat-label">积攒活动</div>
                <div class="stat-change" :class="getChangeClass(analyticsData.collectChange)">
                  {{ analyticsData.collectChange || 0 }}%
                  <el-icon><TrendCharts /></el-icon>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card conversion-rate">
            <div class="card-content">
              <div class="stat-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ analyticsData.conversionRate || 0 }}%</div>
                <div class="stat-label">转化率</div>
                <div class="stat-change" :class="getChangeClass(analyticsData.conversionChange)">
                  {{ analyticsData.conversionChange || 0 }}%
                  <el-icon><TrendCharts /></el-icon>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表分析 -->
      <el-row :gutter="20" class="chart-section">
        <el-col :span="12">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>📈 营销活动趋势</span>
                <el-radio-group v-model="trendType" size="small">
                  <el-radio-button label="participation">参与度</el-radio-button>
                  <el-radio-button label="conversion">转化率</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <div ref="trendChartRef" style="width: 100%; height: 300px;"></div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>🎯 营销效果对比</span>
                <el-select v-model="chartPeriod" size="small">
                  <el-option label="本周" value="week" />
                  <el-option label="本月" value="month" />
                  <el-option label="本季度" value="quarter" />
                </el-select>
              </div>
            </template>
            <div class="chart-container">
              <div ref="effectChartRef" style="width: 100%; height: 300px;"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 功能分析 -->
      <el-row :gutter="20" class="feature-analysis">
        <el-col :span="8">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>🛒 团购分析</span>
              </div>
            </template>
            <div class="feature-stats">
              <div class="stat-row">
                <span class="label">平均成团人数:</span>
                <span class="value">{{ analyticsData.groupBuyStats?.avgParticipants || 0 }}人</span>
              </div>
              <div class="stat-row">
                <span class="label">团购成功率:</span>
                <span class="value">{{ analyticsData.groupBuyStats?.successRate || 0 }}%</span>
              </div>
              <div class="stat-row">
                <span class="label">平均节省金额:</span>
                <span class="value">¥{{ analyticsData.groupBuyStats?.avgSavings || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="label">参与用户:</span>
                <span class="value">{{ analyticsData.groupBuyStats?.totalParticipants || 0 }}人</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>💰 积攒分析</span>
              </div>
            </template>
            <div class="feature-stats">
              <div class="stat-row">
                <span class="label">平均完成率:</span>
                <span class="value">{{ analyticsData.collectStats?.avgCompletionRate || 0 }}%</span>
              </div>
              <div class="stat-row">
                <span class="label">平均助力人数:</span>
                <span class="value">{{ analyticsData.collectStats?.avgHelpers || 0 }}人</span>
              </div>
              <div class="stat-row">
                <span class="label">活跃活动:</span>
                <span class="value">{{ analyticsData.collectStats?.activeActivities || 0 }}个</span>
              </div>
              <div class="stat-row">
                <span class="label">总助力次数:</span>
                <span class="value">{{ analyticsData.collectStats?.totalHelps || 0 }}次</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>🏆 阶梯奖励分析</span>
              </div>
            </template>
            <div class="feature-stats">
              <div class="stat-row">
                <span class="label">参与活动:</span>
                <span class="value">{{ analyticsData.tieredRewardStats?.activeActivities || 0 }}个</span>
              </div>
              <div class="stat-row">
                <span class="label">总获奖人数:</span>
                <span class="value">{{ analyticsData.tieredRewardStats?.totalWinners || 0 }}人</span>
              </div>
              <div class="stat-row">
                <span class="label">一级触发率:</span>
                <span class="value">{{ analyticsData.tieredRewardStats?.tier1TriggerRate || 0 }}%</span>
              </div>
              <div class="stat-row">
                <span class="label">二级触发率:</span>
                <span class="value">{{ analyticsData.tieredRewardStats?.tier2TriggerRate || 0 }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 详细数据表格 -->
      <el-card class="detail-table" shadow="never">
        <template #header>
          <div class="card-header">
            <span>📋 营销活动详细数据</span>
            <div class="header-actions">
              <el-button type="primary" @click="exportData" :loading="exporting">
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
              <el-button @click="refreshData" :loading="loading">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <el-table :data="marketingActivities" v-loading="loading">
          <el-table-column prop="title" label="活动名称" width="200" />
          <el-table-column prop="marketingType" label="营销类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getMarketingTypeColor(row.marketingType)">
                {{ getMarketingTypeText(row.marketingType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="participants" label="参与人数" width="100" />
          <el-table-column prop="registrations" label="报名人数" width="100" />
          <el-table-column prop="conversionRate" label="转化率" width="100">
            <template #default="{ row }">
              {{ row.conversionRate }}%
            </template>
          </el-table-column>
          <el-table-column prop="revenue" label="营销收入" width="120">
            <template #default="{ row }">
              ¥{{ row.revenue || 0 }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusColor(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="viewDetail(row)">详情</el-button>
              <el-button size="small" type="primary" @click="editMarketing(row)">
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import PageWrapper from '@/components/common/PageWrapper.vue'
import * as echarts from 'echarts'
import { User, Users, Present, DataLine, TrendCharts, Download, Refresh } from '@element-plus/icons-vue'
import { request } from '@/utils/request'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const timeRange = ref('30d')
const customDateRange = ref([])
const trendType = ref('participation')
const chartPeriod = ref('month')

const analyticsData = reactive({
  totalRegistrations: 0,
  activeGroupBuys: 0,
  collectActivities: 0,
  conversionRate: 0,
  registrationChange: 0,
  groupBuyChange: 0,
  collectChange: 0,
  conversionChange: 0,
  groupBuyStats: {
    avgParticipants: 0,
    successRate: 0,
    avgSavings: 0,
    totalParticipants: 0
  },
  collectStats: {
    avgCompletionRate: 0,
    avgHelpers: 0,
    activeActivities: 0,
    totalHelps: 0
  },
  tieredRewardStats: {
    activeActivities: 0,
    totalWinners: 0,
    tier1TriggerRate: 0,
    tier2TriggerRate: 0
  }
})

const marketingActivities = ref([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 图表引用
const trendChartRef = ref()
const effectChartRef = ref()

// 方法
const getChangeClass = (change: number) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

const getMarketingTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'group_buy': 'success',
    'collect': 'warning',
    'tiered': 'danger',
    'referral': 'info'
  }
  return colorMap[type] || 'default'
}

const getMarketingTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'group_buy': '团购',
    'collect': '积攒',
    'tiered': '阶梯奖励',
    'referral': '推荐奖励'
  }
  return textMap[type] || '其他'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'active': 'success',
    'completed': 'primary',
    'expired': 'warning',
    'cancelled': 'danger'
  }
  return colorMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '进行中',
    'completed': '已完成',
    'expired': '已过期',
    'cancelled': '已取消'
  }
  return textMap[status] || '未知'
}

const loadAnalyticsData = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    const mockData = {
      totalRegistrations: 1567,
      activeGroupBuys: 23,
      collectActivities: 18,
      conversionRate: 12.5,
      registrationChange: 8.2,
      groupBuyChange: 15.3,
      collectChange: -2.1,
      conversionChange: 3.7,
      groupBuyStats: {
        avgParticipants: 15.6,
        successRate: 78.4,
        avgSavings: 128.5,
        totalParticipants: 286
      },
      collectStats: {
        avgCompletionRate: 67.2,
        avgHelpers: 23.8,
        activeActivities: 12,
        totalHelps: 428
      },
      tieredRewardStats: {
        activeActivities: 8,
        totalWinners: 124,
        tier1TriggerRate: 45.2,
        tier2TriggerRate: 12.6
      }
    }

    Object.assign(analyticsData, mockData)

    // 加载营销活动列表
    await loadMarketingActivities()

    // 初始化图表
    await nextTick()
    initCharts()
  } catch (error) {
    console.error('Failed to load analytics data:', error)
    ElMessage.error('加载分析数据失败')
  } finally {
    loading.value = false
  }
}

const loadMarketingActivities = async () => {
  try {
    // 模拟营销活动数据
    const mockActivities = [
      {
        id: '1',
        title: '春季亲子运动会',
        marketingType: 'group_buy',
        participants: 45,
        registrations: 38,
        conversionRate: 84.4,
        revenue: 5700,
        status: 'active'
      },
      {
        id: '2',
        title: '儿童节庆祝活动',
        marketingType: 'collect',
        participants: 89,
        registrations: 67,
        conversionRate: 75.3,
        revenue: 0,
        status: 'active'
      },
      {
        id: '3',
        title: '暑期夏令营',
        marketingType: 'tiered',
        participants: 123,
        registrations: 98,
        conversionRate: 79.7,
        revenue: 15200,
        status: 'completed'
      }
    ]

    marketingActivities.value = mockActivities
    pagination.total = mockActivities.length
  } catch (error) {
    console.error('Failed to load marketing activities:', error)
  }
}

const initCharts = () => {
  // 初始化趋势图
  if (trendChartRef.value) {
    const trendChart = echarts.init(trendChartRef.value)
    updateTrendChart(trendChart)
  }

  // 初始化效果对比图
  if (effectChartRef.value) {
    const effectChart = echarts.init(effectChartRef.value)
    updateEffectChart(effectChart)
  }
}

const updateTrendChart = (chart: echarts.ECharts) => {
  const dates = []
  const participationData = []
  const conversionData = []

  // 生成模拟数据
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString())
    participationData.push(Math.floor(Math.random() * 100) + 50)
    conversionData.push(Math.floor(Math.random() * 20) + 5)
  }

  const option = {
    title: {
      text: '',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['参与度', '转化率'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '参与人数',
        position: 'left'
      },
      {
        type: 'value',
        name: '转化率(%)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '参与度',
        type: 'bar',
        data: participationData,
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '转化率',
        type: 'line',
        yAxisIndex: 1,
        data: conversionData,
        itemStyle: {
          color: '#67c23a'
        },
        smooth: true
      }
    ]
  }

  chart.setOption(option)
}

const updateEffectChart = (chart: echarts.ECharts) => {
  const marketingTypes = ['团购', '积攒', '阶梯奖励', '推荐奖励']
  const currentData = [85, 72, 63, 45]
  const previousData = [78, 68, 55, 38]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['本期', '上期'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: marketingTypes
    },
    yAxis: {
      type: 'value',
      name: '效果值'
    },
    series: [
      {
        name: '本期',
        type: 'bar',
        data: currentData,
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '上期',
        type: 'bar',
        data: previousData,
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  }

  chart.setOption(option)
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadMarketingActivities()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadMarketingActivities()
}

const viewDetail = (row: any) => {
  ElMessage.info(`查看活动详情: ${row.title}`)
}

const editMarketing = (row: any) => {
  ElMessage.info(`编辑营销配置: ${row.title}`)
}

const refreshData = () => {
  loadAnalyticsData()
  ElMessage.success('数据已刷新')
}

const exportData = async () => {
  exporting.value = true
  try {
    // 这里应该调用实际的导出API
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('Failed to export data:', error)
    ElMessage.error('数据导出失败')
  } finally {
    exporting.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAnalyticsData()
})
</script>

<style lang="scss" scoped>
.marketing-analytics {
  padding: var(--text-2xl);
}

.time-selector {
  margin-bottom: var(--text-2xl);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .custom-range {
    margin-top: 12px;
    display: flex;
    justify-content: center;
  }
}

.overview-cards {
  margin-bottom: var(--text-2xl);

  .stat-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .card-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        color: white;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: #303133;
          line-height: 1;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: #606266;
          margin-top: 4px;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          font-weight: 500;
          margin-top: 8px;

          &.positive {
            color: #67c23a;
          }

          &.negative {
            color: #f56c6c;
          }

          &.neutral {
            color: #909399;
          }
        }
      }
    }

    &.total-registrations {
      .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }

    &.active-groups {
      .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }

    &.collect-activities {
      .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
    }

    &.conversion-rate {
      .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
  }
}

.chart-section,
.feature-analysis {
  margin-bottom: var(--text-2xl);

  .chart-card {
    height: 420px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.feature-stats {
  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #606266;
      font-size: var(--text-sm);
    }

    .value {
      font-weight: 600;
      color: #303133;
      font-size: var(--text-base);
    }
  }
}

.detail-table {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-md);
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .marketing-analytics {
    padding: var(--text-lg);
  }

  .overview-cards {
    .el-col {
      margin-bottom: 16px;
    }
  }

  .chart-section,
  .feature-analysis {
    .el-col {
      margin-bottom: 16px;
    }
  }

  .stat-card .card-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
}
</style>