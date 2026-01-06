<template>
  <div class="conversion-funnel">
    <div class="funnel-header">
      <h3>转化漏斗分析</h3>
      <div class="time-selector">
        <el-select v-model="timeRange" @change="handleTimeRangeChange" style="max-width: 120px; width: 100%">
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
          <el-option label="本季度" value="quarter" />
          <el-option label="本年" value="year" />
        </el-select>
      </div>
    </div>

    <!-- 漏斗图表 -->
    <div class="funnel-chart" ref="chartRef" v-loading="loading"></div>

    <!-- 转化数据表格 -->
    <div class="conversion-table">
      <h4>转化详情</h4>
      <div class="table-wrapper">
<el-table class="responsive-table" :data="conversionData" stripe>
        <el-table-column prop="stage" label="阶段" width="120" />
        <el-table-column prop="count" label="数量" width="80" align="center" />
        <el-table-column prop="rate" label="转化率" width="100" align="center">
          <template #default="{ row }">
            <span :class="getRateClass(row.rate)">{{ row.rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
      </el-table>
</div>
    </div>

    <!-- 转化趋势 -->
    <div class="conversion-trend">
      <h4>转化趋势</h4>
      <div class="trend-chart" ref="trendChartRef" v-loading="loading"></div>
    </div>

    <!-- 改进建议 -->
    <div class="improvement-suggestions" v-if="suggestions.length > 0">
      <h4>改进建议</h4>
      <el-alert
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        :title="suggestion.title"
        :description="suggestion.description"
        :type="suggestion.type"
        show-icon
        :closable="false"
        style="margin-bottom: var(--spacing-2xl)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

// Props
interface ConversionStage {
  stage: string
  count: number
  rate: number
  description: string
}

interface Suggestion {
  id: string
  title: string
  description: string
  type: 'success' | 'warning' | 'info' | 'error'
}

interface Props {
  loading?: boolean
  funnelData?: {
    stages: Array<{
      stage: string
      count: number
      percentage: number
      color: string
    }>
    conversionRate: number
    totalLeads: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  funnelData: undefined
})

// Emits
const emit = defineEmits<{
  'time-range-change': [timeRange: string]
}>()

// 响应式数据
const timeRange = ref('month')
const chartRef = ref()
const trendChartRef = ref()
let funnelChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

// 转化数据
const conversionData = computed<ConversionStage[]>(() => {
  if (props.funnelData && props.funnelData.stages.length > 0) {
    // 使用真实API数据
    return props.funnelData.stages.map((stage, index, array) => ({
      stage: stage.stage,
      count: stage.count,
      rate: stage.percentage,
      description: getStageDescription(stage.stage)
    }))
  }

  // 默认模拟数据
  return [
    { stage: '潜在客户', count: 150, rate: 100, description: '通过各种渠道获得的潜在客户' },
    { stage: '初次接触', count: 120, rate: 80, description: '成功建立初次联系的客户' },
    { stage: '深度沟通', count: 90, rate: 75, description: '进行深度需求沟通的客户' },
    { stage: '意向确认', count: 60, rate: 67, description: '明确表达入园意向的客户' },
    { stage: '试听体验', count: 45, rate: 75, description: '参与试听或体验活动的客户' },
    { stage: '签约成交', count: 30, rate: 67, description: '最终签约入园的客户' }
  ]
})

// 改进建议
const suggestions = ref<Suggestion[]>([
  {
    id: '1',
    title: '提高初次接触转化率',
    description: '当前初次接触转化率为80%，建议优化首次沟通话术，提高客户响应率',
    type: 'warning'
  },
  {
    id: '2',
    title: '加强试听体验环节',
    description: '试听体验转化率较高(75%)，建议增加试听活动频次，提供更多体验机会',
    type: 'success'
  },
  {
    id: '3',
    title: '优化签约流程',
    description: '意向确认到签约的转化率偏低(67%)，建议简化签约流程，提供更多优惠政策',
    type: 'info'
  }
])

// 方法
const getRateClass = (rate: number) => {
  if (rate >= 80) return 'rate-high'
  if (rate >= 60) return 'rate-medium'
  return 'rate-low'
}

const getStageDescription = (stage: string) => {
  const descriptions = {
    '潜在客户': '通过各种渠道获得的潜在客户',
    '已联系': '成功建立初次联系的客户',
    '有意向': '进行深度需求沟通的客户',
    '跟进中': '明确表达入园意向的客户',
    '已转化': '最终签约入园的客户'
  }
  return descriptions[stage] || '客户转化阶段'
}

const handleTimeRangeChange = () => {
  emit('time-range-change', timeRange.value)
  loadChartData()
}

const initFunnelChart = () => {
  if (!chartRef.value) return
  
  funnelChart = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: '客户转化漏斗',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: 'var(--text-primary)'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '转化漏斗',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 150,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: 'var(--bg-white)',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: conversionData.value.map(item => ({
          value: item.count,
          name: item.stage
        }))
      }
    ]
  }
  
  funnelChart.setOption(option)
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    title: {
      text: '转化率趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: 'var(--text-primary)'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['整体转化率', '签约转化率'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 60,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['第1周', '第2周', '第3周', '第4周']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '整体转化率',
        type: 'line',
        data: [18, 22, 25, 20],
        smooth: true,
        itemStyle: {
          color: 'var(--primary-color)'
        }
      },
      {
        name: '签约转化率',
        type: 'line',
        data: [65, 70, 68, 67],
        smooth: true,
        itemStyle: {
          color: 'var(--success-color)'
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

const loadChartData = () => {
  // TODO: 根据时间范围加载数据
  nextTick(() => {
    if (funnelChart) {
      funnelChart.resize()
    }
    if (trendChart) {
      trendChart.resize()
    }
  })
}

const resizeCharts = () => {
  if (funnelChart) {
    funnelChart.resize()
  }
  if (trendChart) {
    trendChart.resize()
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initFunnelChart()
    initTrendChart()
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', resizeCharts)
})

// 清理
onBeforeUnmount(() => {
  if (funnelChart) {
    funnelChart.dispose()
  }
  if (trendChart) {
    trendChart.dispose()
  }
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped>
.conversion-funnel {
  padding: var(--text-2xl);
}

.funnel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.funnel-header h3 {
  margin: 0;
  font-size: var(--text-xl);
  color: var(--text-primary);
}

.funnel-chart {
  min-height: 60px; height: auto;
  margin-bottom: var(--spacing-8xl);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.conversion-table {
  margin-bottom: var(--spacing-8xl);
}

.conversion-table h4 {
  margin: 0 0 15px 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.conversion-trend {
  margin-bottom: var(--spacing-8xl);
}

.conversion-trend h4 {
  margin: 0 0 15px 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.trend-chart {
  min-height: 60px; height: auto;
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.improvement-suggestions h4 {
  margin: 0 0 15px 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.rate-high {
  color: var(--success-color);
  font-weight: bold;
}

.rate-medium {
  color: var(--warning-color);
  font-weight: bold;
}

.rate-low {
  color: var(--danger-color);
  font-weight: bold;
}
</style>
