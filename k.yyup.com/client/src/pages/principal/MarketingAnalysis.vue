<template>
  <div class="page-container">
    <page-header title="营销分析">
      <template #actions>
        <el-button @click="refreshData" :loading="loading">
          <UnifiedIcon name="Refresh" />
          刷新数据
        </el-button>
        <el-button @click="exportReport" type="primary">
          <UnifiedIcon name="Download" />
          导出报告
        </el-button>
      </template>
    </page-header>

    <div class="analysis-content" v-loading="loading">
      <!-- 营销概览 -->
      <el-row :gutter="20" class="overview-section">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">{{ overviewData.totalCampaigns }}</div>
                <div class="card-label">营销活动总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">{{ overviewData.totalReach }}</div>
                <div class="card-label">总触达人数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon">
                <UnifiedIcon name="Check" />
              </div>
              <div class="card-info">
                <div class="card-value">{{ overviewData.totalConversions }}</div>
                <div class="card-label">总转化数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">{{ formatCurrency(overviewData.totalRevenue) }}</div>
                <div class="card-label">总营收</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 趋势图表 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>营销趋势分析</span>
            <el-radio-group v-model="chartTimeRange" size="small">
              <el-radio-button value="7d">最近7天</el-radio-button>
              <el-radio-button value="30d">最近30天</el-radio-button>
              <el-radio-button value="90d">最近90天</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </el-card>

      <!-- 渠道分析 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="channel-card">
            <template #header>
              <span>渠道效果分析</span>
            </template>
            <div ref="channelChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="conversion-card">
            <template #header>
              <span>转化漏斗分析</span>
            </template>
            <div ref="funnelChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Download, 
  TrendCharts, 
  User, 
  Check, 
  Money 
} from '@element-plus/icons-vue'
import { get, post } from '@/utils/request'
import { PRINCIPAL_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const chartTimeRange = ref('30d')

// 图表实例
const trendChartRef = ref<HTMLElement>()
const channelChartRef = ref<HTMLElement>()
const funnelChartRef = ref<HTMLElement>()
let trendChartInstance: echarts.ECharts | null = null
let channelChartInstance: echarts.ECharts | null = null
let funnelChartInstance: echarts.ECharts | null = null

// 营销概览数据
const overviewData = ref({
  totalCampaigns: 0,
  totalReach: 0,
  totalConversions: 0,
  totalRevenue: 0
})

// 加载营销分析数据
const loadAnalysisData = async () => {
  loading.value = true
  try {
    const response = await get(PRINCIPAL_ENDPOINTS.MARKETING_ANALYSIS, {
      timeRange: chartTimeRange.value
    })
    
    if (response.success && response.data) {
      overviewData.value = response.data.overview || {
        totalCampaigns: 12,
        totalReach: 8500,
        totalConversions: 320,
        totalRevenue: 256000
      }
      
      // 渲染图表
      await nextTick()
      renderCharts(response.data)
    } else {
      // 使用模拟数据
      overviewData.value = {
        totalCampaigns: 12,
        totalReach: 8500,
        totalConversions: 320,
        totalRevenue: 256000
      }
      
      await nextTick()
      renderMockCharts()
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    
    // 使用模拟数据
    overviewData.value = {
      totalCampaigns: 12,
      totalReach: 8500,
      totalConversions: 320,
      totalRevenue: 256000
    }
    
    await nextTick()
    renderMockCharts()
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderCharts = (data: any) => {
  renderTrendChart(data.trendData)
  renderChannelChart(data.channelData)
  renderFunnelChart(data.funnelData)
}

// 渲染模拟图表
const renderMockCharts = () => {
  const mockTrendData = generateMockTrendData()
  const mockChannelData = generateMockChannelData()
  const mockFunnelData = generateMockFunnelData()
  
  renderTrendChart(mockTrendData)
  renderChannelChart(mockChannelData)
  renderFunnelChart(mockFunnelData)
}

// 渲染趋势图表
const renderTrendChart = (data: any) => {
  if (!trendChartRef.value) return
  
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  
  trendChartInstance = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['触达人数', '转化人数'] },
    xAxis: {
      type: 'category',
      data: data?.dates || ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '触达人数',
        type: 'line',
        data: data?.reach || [1200, 1350, 1100, 1400, 1600, 1800],
        smooth: true
      },
      {
        name: '转化人数',
        type: 'line',
        data: data?.conversions || [45, 52, 41, 58, 67, 75],
        smooth: true
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

// 渲染渠道图表
const renderChannelChart = (data: any) => {
  if (!channelChartRef.value) return
  
  if (channelChartInstance) {
    channelChartInstance.dispose()
  }
  
  channelChartInstance = echarts.init(channelChartRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '渠道效果',
        type: 'pie',
        radius: '50%',
        data: data?.channels || [
          { value: 35, name: '线上推广' },
          { value: 28, name: '微信营销' },
          { value: 20, name: '朋友圈广告' },
          { value: 17, name: '其他渠道' }
        ]
      }
    ]
  }
  
  channelChartInstance.setOption(option)
}

// 渲染漏斗图表
const renderFunnelChart = (data: any) => {
  if (!funnelChartRef.value) return
  
  if (funnelChartInstance) {
    funnelChartInstance.dispose()
  }
  
  funnelChartInstance = echarts.init(funnelChartRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '转化漏斗',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        data: data?.funnel || [
          { value: 1000, name: '曝光' },
          { value: 800, name: '点击' },
          { value: 400, name: '访问' },
          { value: 200, name: '咨询' },
          { value: 80, name: '转化' }
        ]
      }
    ]
  }
  
  funnelChartInstance.setOption(option)
}

// 生成模拟数据的函数
const generateMockTrendData = () => ({
  dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
  reach: [1200, 1350, 1100, 1400, 1600, 1800],
  conversions: [45, 52, 41, 58, 67, 75]
})

const generateMockChannelData = () => ({
  channels: [
    { value: 35, name: '线上推广' },
    { value: 28, name: '微信营销' },
    { value: 20, name: '朋友圈广告' },
    { value: 17, name: '其他渠道' }
  ]
})

const generateMockFunnelData = () => ({
  funnel: [
    { value: 1000, name: '曝光' },
    { value: 800, name: '点击' },
    { value: 400, name: '访问' },
    { value: 200, name: '咨询' },
    { value: 80, name: '转化' }
  ]
})

// 工具方法
const formatCurrency = (value: number) => {
  return `¥${value.toLocaleString()}`
}

// 事件处理
const refreshData = () => {
  loadAnalysisData()
}

const exportReport = () => {
  ElMessage.info('导出功能开发中...')
}

// 监听时间范围变化
watch(chartTimeRange, () => {
  loadAnalysisData()
})

// 生命周期
onMounted(() => {
  loadAnalysisData()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    trendChartInstance?.resize()
    channelChartInstance?.resize()
    funnelChartInstance?.resize()
  })
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.analysis-content {
  padding: var(--spacing-lg);
}

.overview-section {
  margin-bottom: var(--spacing-xl);
}

.overview-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(var(--transform-hover-lift));
  }
}

.card-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.card-icon {
  font-size: var(--text-3xl);
  color: var(--primary-color);
  opacity: 0.8;
}

.card-info {
  flex: 1;

  .card-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .card-label {
    font-size: var(--text-base);
    color: var(--text-secondary);
  }
}

.chart-card,
.channel-card,
.conversion-card {
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  width: 100%;
  min-height: 60px; height: auto;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .overview-section {
    .el-col {
      margin-bottom: var(--spacing-md);
    }
  }

  .chart-container {
    min-height: 60px; height: auto;
  }
}
</style>
