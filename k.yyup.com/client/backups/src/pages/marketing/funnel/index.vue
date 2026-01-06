<template>
  <div class="marketing-funnel page-container">
    <PageHeader title="销售漏斗">
      <template #actions>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="margin-right: var(--text-sm)"
          @change="loadData"
        />
        <el-select v-model="dimension" style="width: 140px; margin-right: var(--text-sm)" @change="loadData">
          <el-option label="全部" value="all"/>
          <el-option label="按渠道" value="channel"/>
          <el-option label="按活动" value="campaign"/>
          <el-option label="按来源" value="source"/>
        </el-select>
        <el-button type="primary" @click="loadData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>
    </PageHeader>

    <!-- 漏斗总览 -->
    <div class="funnel-overview">
      <el-row :gutter="20">
        <el-col :span="16">
          <div class="app-card">
            <div class="card-header">
              <h3>销售漏斗图</h3>
              <div class="funnel-controls">
                <el-button-group>
                  <el-button :type="chartType === 'funnel' ? 'primary' : ''" @click="chartType = 'funnel'">
                    漏斗图
                  </el-button>
                  <el-button :type="chartType === 'bar' ? 'primary' : ''" @click="chartType = 'bar'">
                    柱状图
                  </el-button>
                  <el-button :type="chartType === 'line' ? 'primary' : ''" @click="chartType = 'line'">
                    折线图
                  </el-button>
                </el-button-group>
              </div>
            </div>
            <div ref="chartRef" class="funnel-chart" v-loading="chartLoading"></div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="app-card">
            <div class="card-header">
              <h3>转化率统计</h3>
            </div>
            <div class="conversion-stats">
              <div class="overall-rate">
                <div class="rate-value">{{ funnel.rates?.overall || 0 }}%</div>
                <div class="rate-label">总转化率</div>
                <div class="rate-desc">{{ getTotalCount() }}人 → {{ getFinalCount() }}人</div>
              </div>

              <div class="stage-rates">
                <div
                  v-for="(rate, key) in getStageRates()"
                  :key="key"
                  class="rate-item"
                >
                  <div class="rate-info">
                    <span class="rate-name">{{ getRateName(key) }}</span>
                    <span class="rate-value">{{ rate }}%</span>
                  </div>
                  <div class="rate-bar">
                    <div class="rate-fill" :style="{ width: rate + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 阶段详情 -->
    <div class="app-card">
      <div class="card-header">
        <h3>阶段详情</h3>
        <div class="stage-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索..."
            style="width: 200px; margin-right: var(--text-sm)"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button @click="refreshStages">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div class="stages-container">
        <div class="stages-flow">
          <div
            v-for="(stage, index) in funnel.stages || []"
            :key="stage.code"
            class="stage-item"
            @click="viewStageDetail(stage)"
          >
            <div class="stage-header">
              <div class="stage-number">{{ index + 1 }}</div>
              <div class="stage-name">{{ stage.name }}</div>
            </div>

            <div class="stage-content">
              <div class="stage-count">
                <div class="count-value">{{ formatNumber(stage.count || 0) }}</div>
                <div class="count-label">人数</div>
              </div>

              <div class="stage-rate">
                <div class="rate-value" :class="{ high: getStageRate(index) >= 80, medium: getStageRate(index) >= 60 }">
                  {{ getStageRate(index) }}%
                </div>
                <div class="rate-label">转化率</div>
              </div>
            </div>

            <div class="stage-trend">
              <div class="trend-value" :class="{ positive: getStageTrend(stage.code) > 0 }">
                {{ getStageTrend(stage.code) > 0 ? '+' : '' }}{{ getStageTrend(stage.code) }}%
              </div>
              <div class="trend-label">环比</div>
            </div>

            <!-- 流向箭头 -->
            <div v-if="index < (funnel.stages?.length || 0) - 1" class="stage-arrow">
              <el-icon><ArrowRight /></el-icon>
              <div class="arrow-rate">{{ getStageRate(index + 1) }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 维度分析 -->
    <div v-if="dimension !== 'all'" class="app-card">
      <div class="card-header">
        <h3>{{ getDimensionTitle() }}分析</h3>
      </div>

      <el-table
        :data="dimensionData"
        v-loading="loading"
        style="width: 100%"
        @sort-change="handleSort"
      >
        <el-table-column :prop="dimension" :label="getDimensionLabel()" width="200" show-overflow-tooltip fixed="left">
          <template #default="{ row }">
            <div class="dimension-cell">
              <div class="name">{{ row.name }}</div>
              <div v-if="row.description" class="description">{{ row.description }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="stage in funnel.stages || []"
          :key="stage.code"
          :prop="stage.code"
          :label="stage.name"
          width="100"
          sortable="custom"
          align="center"
        >
          <template #default="{ row }">
            <div class="stage-cell">
              <div class="value">{{ formatNumber(row[stage.code] || 0) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总转化率" width="120" sortable="custom" align="center">
          <template #default="{ row }">
            <div class="conversion-rate">
              <div class="rate-value" :class="{ high: getDimensionRate(row) >= 20, medium: getDimensionRate(row) >= 10 }">
                {{ getDimensionRate(row) }}%
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDimensionDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 阶段详情对话框 -->
    <StageDetailDialog
      v-model="stageDialogVisible"
      :stage="currentStage"
      :date-range="dateRange"
      :dimension="dimension"
    />

    <!-- 维度详情对话框 -->
    <DimensionDetailDialog
      v-model="dimensionDialogVisible"
      :dimension="dimension"
      :item="currentDimensionItem"
      :date-range="dateRange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Search, ArrowRight, View } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StageDetailDialog from './components/StageDetailDialog.vue'
import DimensionDetailDialog from './components/DimensionDetailDialog.vue'
import * as echarts from 'echarts'
import { request } from '@/utils/request'

// 数据状态
const loading = ref(false)
const chartLoading = ref(false)
const dimension = ref<'all'|'channel'|'campaign'|'source'>('all')
const chartType = ref<'funnel'|'bar'|'line'>('funnel')
const dateRange = ref<string[]>([])
const searchKeyword = ref('')

// 数据
const funnel = reactive<any>({ stages: [], rates: {}, trends: {} })
const dimensionData = ref<any[]>([])

// 对话框状态
const stageDialogVisible = ref(false)
const dimensionDialogVisible = ref(false)
const currentStage = ref<any>(null)
const currentDimensionItem = ref<any>(null)

// 图表
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 计算属性
const getTotalCount = () => {
  return funnel.stages?.[0]?.count || 0
}

const getFinalCount = () => {
  const stages = funnel.stages || []
  return stages[stages.length - 1]?.count || 0
}

const getStageRates = () => {
  return {
    lead_to_visit: funnel.rates?.lead_to_visit || 0,
    visit_to_aware: funnel.rates?.visit_to_aware || 0,
    aware_to_pre_enroll: funnel.rates?.aware_to_pre_enroll || 0,
    pre_enroll_to_paid: funnel.rates?.pre_enroll_to_paid || 0
  }
}

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      dimension: dimension.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }

    const res = await request.get('/marketing/stats/funnel', params)
    Object.assign(funnel, res.data || {})

    // 如果有维度分析，加载维度数据
    if (dimension.value !== 'all') {
      await loadDimensionData()
    }

    await nextTick()
    initChart()
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载销售漏斗数据失败')
  } finally {
    loading.value = false
  }
}

const loadDimensionData = async () => {
  try {
    const params = {
      dimension: dimension.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }

    const res = await request.get('/marketing/stats/funnel/dimension', params)
    dimensionData.value = res.data?.items || []
  } catch (e: any) {
    console.error('加载维度数据失败:', e)
  }
}

const initChart = async () => {
  if (!chartRef.value || !funnel.stages?.length) return

  chartLoading.value = true
  try {
    if (chart) {
      chart.dispose()
    }

    chart = echarts.init(chartRef.value)

    let option: any = {}

    switch (chartType.value) {
      case 'funnel':
        option = getFunnelOption()
        break
      case 'bar':
        option = getBarOption()
        break
      case 'line':
        option = getLineOption()
        break
    }

    chart.setOption(option)
  } catch (e: any) {
    console.error('初始化图表失败:', e)
  } finally {
    chartLoading.value = false
  }
}

const getFunnelOption = () => {
  const data = funnel.stages.map((stage: any) => ({
    value: stage.count || 0,
    name: stage.name
  }))

  return {
    title: {
      text: '销售漏斗',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const rate = params.dataIndex === 0 ? 100 :
          ((params.value / data[0].value) * 100).toFixed(1)
        return `${params.name}<br/>人数: ${params.value}<br/>占比: ${rate}%`
      }
    },
    series: [{
      name: '销售漏斗',
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
      data: data
    }]
  }
}

const getBarOption = () => {
  const stages = funnel.stages || []

  return {
    title: {
      text: '销售漏斗 - 柱状图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: stages.map((s: any) => s.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '人数',
      type: 'bar',
      data: stages.map((s: any) => s.count || 0),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2378f7' },
            { offset: 0.7, color: '#2378f7' },
            { offset: 1, color: '#83bff6' }
          ])
        }
      }
    }]
  }
}

const getLineOption = () => {
  const stages = funnel.stages || []

  return {
    title: {
      text: '销售漏斗 - 趋势图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: stages.map((s: any) => s.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '人数',
      type: 'line',
      data: stages.map((s: any) => s.count || 0),
      smooth: true,
      itemStyle: { color: 'var(--primary-color)' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
        ])
      }
    }]
  }
}

const handleSort = ({ prop, order }: any) => {
  if (!prop) return

  const isAsc = order === 'ascending'
  dimensionData.value.sort((a, b) => {
    const aVal = a[prop] || 0
    const bVal = b[prop] || 0
    return isAsc ? aVal - bVal : bVal - aVal
  })
}

const refreshStages = () => {
  loadData()
}

const viewStageDetail = (stage: any) => {
  currentStage.value = { ...stage }
  stageDialogVisible.value = true
}

const viewDimensionDetail = (row: any) => {
  currentDimensionItem.value = { ...row }
  dimensionDialogVisible.value = true
}

const exportData = async () => {
  try {
    const params = {
      dimension: dimension.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      export: true
    }

    const res = await request.get('/marketing/stats/funnel/export', params, { responseType: 'blob' })

    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `销售漏斗_${dimension.value}_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (e: any) {
    ElMessage.error(e.message || '导出失败')
  }
}

// 辅助方法
const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const getStageRate = (index: number) => {
  const stages = funnel.stages || []
  if (index === 0) return 100

  const current = stages[index]?.count || 0
  const previous = stages[index - 1]?.count || 0

  return previous > 0 ? ((current / previous) * 100).toFixed(1) : 0
}

const getStageTrend = (code: string) => {
  return funnel.trends?.[code] || 0
}

const getRateName = (key: string) => {
  const nameMap: Record<string, string> = {
    lead_to_visit: '采集→进店',
    visit_to_aware: '进店→了解',
    aware_to_pre_enroll: '了解→预报名',
    pre_enroll_to_paid: '预报名→报名'
  }
  return nameMap[key] || key
}

const getDimensionTitle = () => {
  const titleMap: Record<string, string> = {
    channel: '渠道',
    campaign: '活动',
    source: '来源'
  }
  return titleMap[dimension.value] || '维度'
}

const getDimensionLabel = () => {
  const labelMap: Record<string, string> = {
    channel: '渠道名称',
    campaign: '活动名称',
    source: '来源名称'
  }
  return labelMap[dimension.value] || '名称'
}

const getDimensionRate = (row: any) => {
  const stages = funnel.stages || []
  if (stages.length === 0) return 0

  const first = row[stages[0].code] || 0
  const last = row[stages[stages.length - 1].code] || 0

  return first > 0 ? ((last / first) * 100).toFixed(1) : 0
}

// 监听器
watch(chartType, () => {
  initChart()
})

watch(dimension, () => {
  loadData()
})

// 生命周期
onMounted(() => {
  // 设置默认日期范围为本月
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  dateRange.value = [
    firstDay.toISOString().slice(0, 10),
    lastDay.toISOString().slice(0, 10)
  ]

  loadData()
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.marketing-funnel {
  .funnel-overview {
    margin-bottom: var(--spacing-xl);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: var(--border-width-base) solid var(--color-border-light);

    h3 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1.125rem;
    }

    .funnel-controls,
    .stage-actions {
      display: flex;
      align-items: center;
    }
  }

  .funnel-chart {
    height: 400px;
    width: 100%;
  }

  .conversion-stats {
    .overall-rate {
      text-align: center;
      padding: var(--spacing-xl) var(--spacing-lg);
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      border-radius: var(--border-radius-lg);
      color: white;
      margin-bottom: var(--spacing-lg);

      .rate-value {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: var(--spacing-sm);
      }

      .rate-label {
        font-size: 1rem;
        margin-bottom: var(--spacing-xs);
      }

      .rate-desc {
        font-size: 0.875rem;
        opacity: 0.9;
      }
    }

    .stage-rates {
      .rate-item {
        margin-bottom: var(--spacing-md);

        .rate-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xs);

          .rate-name {
            color: var(--color-text-primary);
            font-size: 0.875rem;
          }

          .rate-value {
            color: var(--color-primary);
            font-weight: 600;
          }
        }

        .rate-bar {
          height: 6px;
          background: var(--color-border-light);
          border-radius: var(--radius-xs);
          overflow: hidden;

          .rate-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
            transition: width 0.3s ease;
          }
        }
      }
    }
  }

  .stages-container {
    .stages-flow {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      overflow-x: auto;

      .stage-item {
        position: relative;
        min-width: 180px;
        background: var(--color-bg-container);
        border: 2px solid var(--color-border-light);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-lg);
        margin: 0 var(--spacing-lg);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--color-primary);
          box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--shadow-light);
          transform: translateY(-var(--spacing-xs));
        }

        .stage-header {
          display: flex;
          align-items: center;
          margin-bottom: var(--spacing-md);

          .stage-number {
            width: var(--spacing-3xl);
            height: var(--spacing-3xl);
            background: var(--color-primary);
            color: white;
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-right: var(--spacing-md);
          }

          .stage-name {
            font-weight: 600;
            color: var(--color-text-primary);
          }
        }

        .stage-content {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-md);

          .stage-count,
          .stage-rate {
            text-align: center;

            .count-value,
            .rate-value {
              font-size: 1.5rem;
              font-weight: 600;
              color: var(--color-primary);
              margin-bottom: var(--spacing-xs);

              &.high {
                color: var(--color-success);
              }

              &.medium {
                color: var(--color-warning);
              }
            }

            .count-label,
            .rate-label {
              font-size: 0.75rem;
              color: var(--color-text-secondary);
            }
          }
        }

        .stage-trend {
          text-align: center;

          .trend-value {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-text-secondary);

            &.positive {
              color: var(--color-success);
            }
          }

          .trend-label {
            font-size: 0.75rem;
            color: var(--color-text-secondary);
          }
        }

        .stage-arrow {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--color-primary);

          .el-icon {
            font-size: 1.5rem;
            margin-bottom: var(--spacing-xs);
          }

          .arrow-rate {
            font-size: 0.75rem;
            font-weight: 600;
            background: var(--color-primary);
            color: white;
            padding: var(--spacing-sm) 6px;
            border-radius: var(--radius-xl);
          }
        }
      }
    }
  }

  .dimension-cell {
    .name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .description {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-top: var(--spacing-sm);
    }
  }

  .stage-cell {
    text-align: center;

    .value {
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  .conversion-rate {
    text-align: center;

    .rate-value {
      font-weight: 600;
      color: var(--color-text-primary);

      &.high {
        color: var(--color-success);
      }

      &.medium {
        color: var(--color-warning);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .marketing-funnel {
    .funnel-overview {
      .el-row {
        .el-col {
          margin-bottom: var(--spacing-md);
        }
      }
    }

    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);

      .stage-actions {
        width: 100%;
        justify-content: space-between;

        .el-input {
          width: 150px !important;
        }
      }
    }

    .funnel-chart {
      height: 300px;
    }

    .conversion-stats {
      .overall-rate {
        padding: var(--spacing-lg);

        .rate-value {
          font-size: 2rem;
        }
      }
    }

    .stages-container {
      .stages-flow {
        flex-direction: column;
        padding: var(--spacing-lg);

        .stage-item {
          margin: var(--spacing-md) 0;
          min-width: auto;
          width: 100%;

          .stage-arrow {
            position: static;
            transform: none;
            margin: var(--spacing-md) 0;

            .el-icon {
              transform: rotate(90deg);
            }
          }
        }
      }
    }

    .el-table {
      .dimension-cell,
      .stage-cell,
      .conversion-rate {
        font-size: 0.75rem;
      }
    }
  }
}
</style>

