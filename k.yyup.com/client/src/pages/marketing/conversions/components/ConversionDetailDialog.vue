<template>
  <el-dialog
    v-model="visible"
    :title="`${getDimensionTitle()}转化详情 - ${item?.label || ''}`"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="conversion-detail" v-loading="loading">
      <div v-if="item">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="3" border>
            <el-descriptions-item :label="getDimensionLabel()">
              {{ item.label }}
            </el-descriptions-item>
            <el-descriptions-item label="总转化率">
              <span class="conversion-rate" :class="{ high: getOverallRate() >= 20, medium: getOverallRate() >= 10 }">
                {{ getOverallRate() }}%
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="数据时间">
              {{ formatDateRange() }}
            </el-descriptions-item>
            <el-descriptions-item label="采集单数">
              {{ formatNumber(item.lead || 0) }}
            </el-descriptions-item>
            <el-descriptions-item label="进店数">
              {{ formatNumber(item.visit || 0) }}
              <span class="rate-text">({{ getConversionRate(item.visit, item.lead) }}%)</span>
            </el-descriptions-item>
            <el-descriptions-item label="了解园区">
              {{ formatNumber(item.aware || 0) }}
              <span class="rate-text">({{ getConversionRate(item.aware, item.visit) }}%)</span>
            </el-descriptions-item>
            <el-descriptions-item label="预报名数">
              {{ formatNumber(item.preEnroll || 0) }}
              <span class="rate-text">({{ getConversionRate(item.preEnroll, item.aware) }}%)</span>
            </el-descriptions-item>
            <el-descriptions-item label="最终报名">
              {{ formatNumber(item.enroll || 0) }}
              <span class="rate-text">({{ getConversionRate(item.enroll, item.preEnroll) }}%)</span>
            </el-descriptions-item>
            <el-descriptions-item label="平均转化周期">
              {{ detailData.avgCycle || 0 }}天
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 转化漏斗图 -->
        <div class="detail-section">
          <h4>转化漏斗</h4>
          <div ref="funnelChartRef" class="chart-container"></div>
        </div>

        <!-- 时间趋势 -->
        <div class="detail-section">
          <h4>时间趋势</h4>
          <div class="trend-controls">
            <el-radio-group v-model="trendPeriod" @change="loadTrendData">
              <el-radio-button label="day">按日</el-radio-button>
              <el-radio-button label="week">按周</el-radio-button>
              <el-radio-button label="month">按月</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>

        <!-- 详细数据表格 -->
        <div class="detail-section">
          <h4>详细数据</h4>
          <div class="table-wrapper">
<el-table class="responsive-table" :data="detailTableData" size="small" style="width: 100%">
            <el-table-column prop="period" label="时间" width="120" />
            <el-table-column prop="lead" label="采集单" width="80" />
            <el-table-column prop="visit" label="进店" width="80" />
            <el-table-column prop="aware" label="了解园区" width="100" />
            <el-table-column prop="preEnroll" label="预报名" width="80" />
            <el-table-column prop="enroll" label="最终报名" width="100" />
            <el-table-column label="转化率" width="80">
              <template #default="{ row }">
                {{ getRowConversionRate(row) }}%
              </template>
            </el-table-column>
            <el-table-column prop="avgCycle" label="平均周期(天)" width="120" />
            <el-table-column prop="cost" label="成本" width="100">
              <template #default="{ row }">
                ¥{{ (row.cost || 0).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>

        <!-- 关联数据 -->
        <div v-if="dimension === 'channel'" class="detail-section">
          <h4>渠道关联数据</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="related-data">
                <h5>关联活动</h5>
                <div class="data-list">
                  <div 
                    v-for="activity in detailData.relatedActivities || []" 
                    :key="activity.id"
                    class="data-item"
                  >
                    <div class="name">{{ activity.name }}</div>
                    <div class="value">{{ activity.conversionCount }}人转化</div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="related-data">
                <h5>推荐人分布</h5>
                <div class="data-list">
                  <div 
                    v-for="referrer in detailData.topReferrers || []" 
                    :key="referrer.id"
                    class="data-item"
                  >
                    <div class="name">{{ referrer.name }}</div>
                    <div class="value">{{ referrer.count }}人</div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 优化建议 -->
        <div class="detail-section">
          <h4>优化建议</h4>
          <div class="suggestions">
            <div v-for="suggestion in getSuggestions()" :key="suggestion.type" class="suggestion-item">
              <div class="suggestion-icon" :class="suggestion.type">{{ suggestion.icon }}</div>
              <div class="suggestion-content">
                <div class="title">{{ suggestion.title }}</div>
                <div class="description">{{ suggestion.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="exportDetail">导出详情</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import request from '@/utils/request'

interface Props {
  modelValue: boolean
  dimension: string
  item?: any
  dateRange?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const trendPeriod = ref('day')
const detailData = ref<any>({})
const detailTableData = ref<any[]>([])

const funnelChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

let funnelChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loadDetailData = async () => {
  if (!props.item?.label) return

  loading.value = true
  try {
    const params = {
      dimension: props.dimension,
      label: props.item.label,
      startDate: props.dateRange?.[0],
      endDate: props.dateRange?.[1]
    }

    const res = await request.get('/api/marketing/stats/conversions/detail', params)
    detailData.value = res.data || {}
    
    await nextTick()
    initCharts()
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载详情数据失败')
  } finally {
    loading.value = false
  }
}

const loadTrendData = async () => {
  if (!props.item?.label) return

  try {
    const params = {
      dimension: props.dimension,
      label: props.item.label,
      period: trendPeriod.value,
      startDate: props.dateRange?.[0],
      endDate: props.dateRange?.[1]
    }

    const res = await request.get('/api/marketing/stats/conversions/trend', params)
    detailTableData.value = res.data?.tableData || []
    
    await nextTick()
    initTrendChart()
  } catch (e: any) {
    console.error('加载趋势数据失败:', e)
  }
}

const initCharts = () => {
  initFunnelChart()
  loadTrendData()
}

const initFunnelChart = () => {
  if (!funnelChartRef.value || !props.item) return

  funnelChart = echarts.init(funnelChartRef.value)
  
  const data = [
    { value: props.item.lead || 0, name: '采集单' },
    { value: props.item.visit || 0, name: '进店' },
    { value: props.item.aware || 0, name: '了解园区' },
    { value: props.item.preEnroll || 0, name: '预报名' },
    { value: props.item.enroll || 0, name: '最终报名' }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    series: [{
      name: '转化漏斗',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: Math.max(...data.map(d => d.value)),
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside'
      },
      itemStyle: {
        borderColor: 'var(--bg-white)',
        borderWidth: 1
      },
      data: data
    }]
  }

  funnelChart.setOption(option)
}

const initTrendChart = () => {
  if (!trendChartRef.value || !detailTableData.value.length) return

  if (trendChart) {
    trendChart.dispose()
  }
  
  trendChart = echarts.init(trendChartRef.value)
  
  const periods = detailTableData.value.map(item => item.period)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['采集单', '进店', '了解园区', '预报名', '最终报名']
    },
    xAxis: {
      type: 'category',
      data: periods
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '采集单',
        type: 'line',
        data: detailTableData.value.map(item => item.lead || 0),
        smooth: true,
        itemStyle: { color: '#5470c6' }
      },
      {
        name: '进店',
        type: 'line',
        data: detailTableData.value.map(item => item.visit || 0),
        smooth: true,
        itemStyle: { color: '#91cc75' }
      },
      {
        name: '了解园区',
        type: 'line',
        data: detailTableData.value.map(item => item.aware || 0),
        smooth: true,
        itemStyle: { color: '#fac858' }
      },
      {
        name: '预报名',
        type: 'line',
        data: detailTableData.value.map(item => item.preEnroll || 0),
        smooth: true,
        itemStyle: { color: '#ee6666' }
      },
      {
        name: '最终报名',
        type: 'line',
        data: detailTableData.value.map(item => item.enroll || 0),
        smooth: true,
        itemStyle: { color: '#73c0de' }
      }
    ]
  }

  trendChart.setOption(option)
}

const getSuggestions = () => {
  const suggestions = []
  const overallRate = getOverallRate()
  
  if (overallRate < 10) {
    suggestions.push({
      type: 'warning',
      icon: '⚠️',
      title: '转化率偏低',
      description: '建议优化渠道质量，提升线索精准度，加强跟进流程'
    })
  }
  
  const visitRate = getConversionRate(props.item?.visit, props.item?.lead)
  if (visitRate < 60) {
    suggestions.push({
      type: 'info',
      icon: '💡',
      title: '到访率有待提升',
      description: '建议优化邀约话术，提供更有吸引力的到访理由'
    })
  }
  
  const enrollRate = getConversionRate(props.item?.enroll, props.item?.preEnroll)
  if (enrollRate < 80) {
    suggestions.push({
      type: 'success',
      icon: '🎯',
      title: '加强成交转化',
      description: '建议完善成交流程，提供更优惠的报名政策'
    })
  }
  
  return suggestions
}

const exportDetail = () => {
  ElMessage.info('导出功能开发中...')
}

// 辅助方法
const getDimensionTitle = () => {
  const titleMap: Record<string, string> = {
    channel: '渠道',
    referral: '老带新',
    campaign: '活动',
    month: '月份'
  }
  return titleMap[props.dimension] || '维度'
}

const getDimensionLabel = () => {
  const labelMap: Record<string, string> = {
    channel: '渠道名称',
    referral: '推荐类型',
    campaign: '活动名称',
    month: '时间'
  }
  return labelMap[props.dimension] || '名称'
}

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatDateRange = () => {
  if (!props.dateRange || props.dateRange.length !== 2) return '全部时间'
  return `${props.dateRange[0]} 至 ${props.dateRange[1]}`
}

const getConversionRate = (current: number, previous: number) => {
  if (!previous || previous === 0) return '0.0'
  return ((current / previous) * 100).toFixed(1)
}

const getOverallRate = () => {
  const lead = props.item?.lead || 0
  const enroll = props.item?.enroll || 0
  return lead > 0 ? ((enroll / lead) * 100).toFixed(1) : 0
}

const getRowConversionRate = (row: any) => {
  const lead = row.lead || 0
  const enroll = row.enroll || 0
  return lead > 0 ? ((enroll / lead) * 100).toFixed(1) : 0
}

const handleClose = () => {
  if (funnelChart) {
    funnelChart.dispose()
    funnelChart = null
  }
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  
  visible.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.item) {
    loadDetailData()
  }
})

onUnmounted(() => {
  handleClose()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.conversion-detail {
  .detail-section {
    margin-bottom: var(--spacing-xl);

    h4, h5 {
      margin-bottom: var(--spacing-md);
      color: var(--color-text-primary);
      border-bottom: var(--z-index-dropdown) solid var(--color-border-light);
      padding-bottom: var(--spacing-sm);
    }

    h5 {
      font-size: 0.875rem;
      border-bottom: none;
      margin-bottom: var(--spacing-sm);
    }

    .conversion-rate {
      font-weight: 600;

      &.high {
        color: var(--color-success);
      }

      &.medium {
        color: var(--color-warning);
      }
    }

    .rate-text {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-left: var(--spacing-xs);
    }
  }

  .chart-container {
    min-height: 60px; height: auto;
    width: 100%;
  }

  .trend-controls {
    margin-bottom: var(--spacing-md);
  }

  .related-data {
    .data-list {
      .data-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm);
        background: var(--color-bg-soft);
        border-radius: var(--border-radius-md);
        margin-bottom: var(--spacing-sm);

        .name {
          color: var(--color-text-primary);
        }

        .value {
          color: var(--color-primary);
          font-weight: 600;
        }
      }
    }
  }

  .suggestions {
    .suggestion-item {
      display: flex;
      align-items: flex-start;
      padding: var(--spacing-md);
      background: var(--color-bg-soft);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);

      .suggestion-icon {
        font-size: 1.5rem;
        margin-right: var(--spacing-md);
      }

      .suggestion-content {
        flex: 1;

        .title {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .description {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
