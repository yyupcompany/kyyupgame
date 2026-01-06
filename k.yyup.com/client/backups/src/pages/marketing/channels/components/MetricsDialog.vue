<template>
  <el-dialog
    v-model="visible"
    :title="`渠道指标详情 - ${channel?.channelName || ''}`"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="metrics-detail" v-loading="loading">
      <!-- 核心指标卡片 -->
      <div class="metrics-cards">
        <div class="metric-card">
          <div class="metric-icon visit">📊</div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.visitCount || 0 }}</div>
            <div class="metric-label">访问量</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon lead">🎯</div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.leadCount || 0 }}</div>
            <div class="metric-label">线索数</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon conversion">✅</div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.conversionCount || 0 }}</div>
            <div class="metric-label">转化数</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon rate">📈</div>
          <div class="metric-content">
            <div class="metric-value">{{ (metrics.conversionRate || 0).toFixed(1) }}%</div>
            <div class="metric-label">转化率</div>
          </div>
        </div>
      </div>

      <!-- 财务指标 -->
      <div class="financial-metrics">
        <h4>财务指标</h4>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="financial-item">
              <div class="label">总成本</div>
              <div class="value cost">¥{{ (metrics.cost || 0).toLocaleString() }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="financial-item">
              <div class="label">总收入</div>
              <div class="value revenue">¥{{ (metrics.revenue || 0).toLocaleString() }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="financial-item">
              <div class="label">ROI</div>
              <div class="value roi" :class="{ positive: (metrics.roi || 0) > 0 }">
                {{ (metrics.roi || 0).toFixed(1) }}%
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="financial-item">
              <div class="label">单个线索成本</div>
              <div class="value">¥{{ getCostPerLead() }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 趋势图表 -->
      <div class="trend-charts">
        <h4>趋势分析</h4>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="访问趋势" name="visits">
            <div ref="visitChartRef" class="chart-container"></div>
          </el-tab-pane>
          <el-tab-pane label="转化趋势" name="conversions">
            <div ref="conversionChartRef" class="chart-container"></div>
          </el-tab-pane>
          <el-tab-pane label="成本分析" name="costs">
            <div ref="costChartRef" class="chart-container"></div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 详细数据表格 -->
      <div class="detail-table">
        <h4>历史数据</h4>
        <el-table :data="historyData" size="small" style="width: 100%">
          <el-table-column prop="date" label="日期" width="100" />
          <el-table-column prop="visits" label="访问量" width="80" />
          <el-table-column prop="leads" label="线索数" width="80" />
          <el-table-column prop="conversions" label="转化数" width="80" />
          <el-table-column label="转化率" width="80">
            <template #default="{ row }">
              {{ row.leads > 0 ? ((row.conversions / row.leads) * 100).toFixed(1) : 0 }}%
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="成本" width="100">
            <template #default="{ row }">
              ¥{{ (row.cost || 0).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="revenue" label="收入" width="100">
            <template #default="{ row }">
              ¥{{ (row.revenue || 0).toLocaleString() }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="exportData">导出数据</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import request from '@/utils/request'

interface Props {
  modelValue: boolean
  channel?: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const activeTab = ref('visits')
const metrics = ref<any>({})
const historyData = ref<any[]>([])

const visitChartRef = ref<HTMLElement>()
const conversionChartRef = ref<HTMLElement>()
const costChartRef = ref<HTMLElement>()

let visitChart: echarts.ECharts | null = null
let conversionChart: echarts.ECharts | null = null
let costChart: echarts.ECharts | null = null

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loadMetrics = async () => {
  if (!props.channel?.id) return

  loading.value = true
  try {
    const res = await request.get(`/marketing/channels/${props.channel.id}/metrics`)
    metrics.value = res.data || {}
    historyData.value = res.data?.history || []
    
    await nextTick()
    initCharts()
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载指标数据失败')
  } finally {
    loading.value = false
  }
}

const getCostPerLead = () => {
  const leads = metrics.value.leadCount || 0
  const cost = metrics.value.cost || 0
  return leads > 0 ? (cost / leads).toFixed(0) : '0'
}

const initCharts = () => {
  if (!historyData.value.length) return

  const dates = historyData.value.map(item => item.date)
  
  // 访问趋势图
  if (visitChartRef.value) {
    visitChart = echarts.init(visitChartRef.value)
    visitChart.setOption({
      title: { text: '访问量趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [{
        name: '访问量',
        type: 'line',
        data: historyData.value.map(item => item.visits),
        smooth: true,
        itemStyle: { color: 'var(--primary-color)' }
      }]
    })
  }

  // 转化趋势图
  if (conversionChartRef.value) {
    conversionChart = echarts.init(conversionChartRef.value)
    conversionChart.setOption({
      title: { text: '转化趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: [
        { type: 'value', name: '数量' },
        { type: 'value', name: '转化率(%)', max: 100 }
      ],
      series: [
        {
          name: '线索数',
          type: 'bar',
          data: historyData.value.map(item => item.leads),
          itemStyle: { color: 'var(--success-color)' }
        },
        {
          name: '转化数',
          type: 'bar',
          data: historyData.value.map(item => item.conversions),
          itemStyle: { color: 'var(--warning-color)' }
        },
        {
          name: '转化率',
          type: 'line',
          yAxisIndex: 1,
          data: historyData.value.map(item => 
            item.leads > 0 ? ((item.conversions / item.leads) * 100).toFixed(1) : 0
          ),
          itemStyle: { color: 'var(--danger-color)' }
        }
      ]
    })
  }

  // 成本分析图
  if (costChartRef.value) {
    costChart = echarts.init(costChartRef.value)
    costChart.setOption({
      title: { text: '成本收入分析' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [
        {
          name: '成本',
          type: 'bar',
          data: historyData.value.map(item => item.cost),
          itemStyle: { color: 'var(--danger-color)' }
        },
        {
          name: '收入',
          type: 'bar',
          data: historyData.value.map(item => item.revenue),
          itemStyle: { color: 'var(--success-color)' }
        }
      ]
    })
  }
}

const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

const handleClose = () => {
  // 销毁图表实例
  if (visitChart) {
    visitChart.dispose()
    visitChart = null
  }
  if (conversionChart) {
    conversionChart.dispose()
    conversionChart = null
  }
  if (costChart) {
    costChart.dispose()
    costChart = null
  }
  
  visible.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.channel?.id) {
    loadMetrics()
  }
})

watch(activeTab, () => {
  nextTick(() => {
    // 重新调整图表大小
    if (activeTab.value === 'visits' && visitChart) {
      visitChart.resize()
    } else if (activeTab.value === 'conversions' && conversionChart) {
      conversionChart.resize()
    } else if (activeTab.value === 'costs' && costChart) {
      costChart.resize()
    }
  })
})
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.metrics-detail {
  .metrics-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);

    .metric-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-lg);
      background: var(--color-bg-container);
      border: var(--border-width-base) solid var(--color-border-light);
      border-radius: var(--border-radius-lg);

      .metric-icon {
        font-size: 2rem;
        margin-right: var(--spacing-md);
      }

      .metric-content {
        .metric-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-primary);
        }

        .metric-label {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }
      }
    }
  }

  .financial-metrics {
    margin-bottom: var(--spacing-xl);

    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--color-text-primary);
    }

    .financial-item {
      text-align: center;
      padding: var(--spacing-lg);
      background: var(--color-bg-soft);
      border-radius: var(--border-radius-md);

      .label {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        margin-bottom: var(--spacing-sm);
      }

      .value {
        font-size: 1.25rem;
        font-weight: 600;

        &.cost {
          color: var(--color-danger);
        }

        &.revenue {
          color: var(--color-success);
        }

        &.roi.positive {
          color: var(--color-success);
        }
      }
    }
  }

  .trend-charts {
    margin-bottom: var(--spacing-xl);

    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--color-text-primary);
    }

    .chart-container {
      height: 300px;
      width: 100%;
    }
  }

  .detail-table {
    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--color-text-primary);
    }
  }
}

.dialog-footer {
  text-align: right;
}

@media (max-width: var(--breakpoint-md)) {
  .metrics-detail {
    .metrics-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
