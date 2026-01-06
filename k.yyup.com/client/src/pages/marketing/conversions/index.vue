<template>
  <div class="marketing-conversions page-container">
    <PageHeader title="转换统计">
      <template #actions>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="margin-right: var(--text-sm)"
        />
        <el-select v-model="dimension" style="max-width: 140px; width: 100%; margin-right: var(--text-sm)" @change="loadData">
          <el-option label="按渠道" value="channel"/>
          <el-option label="按老带新" value="referral"/>
          <el-option label="按活动" value="campaign"/>
          <el-option label="按月份" value="month"/>
        </el-select>
        <el-select v-model="period" style="max-width: 120px; width: 100%; margin-right: var(--text-sm)" @change="loadData">
          <el-option label="月" value="month"/>
          <el-option label="季" value="quarter"/>
          <el-option label="年" value="year"/>
        </el-select>
        <el-button type="primary" @click="loadData" :loading="loading">
          <UnifiedIcon name="Search" />
          查询
        </el-button>
        <el-button @click="exportData">
          <UnifiedIcon name="Download" />
          导出
        </el-button>
      </template>
    </PageHeader>

    <!-- 总览统计卡片 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="4" v-for="(value, key) in summary" :key="key">
          <div class="stat-card" :class="key">
            <div class="stat-icon">{{ getStatIcon(key) }}</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(value) }}</div>
              <div class="stat-label">{{ labels[key] }}</div>
              <div class="stat-trend" :class="{ positive: getTrend(key) > 0 }">
                {{ getTrend(key) > 0 ? '+' : '' }}{{ getTrend(key).toFixed(1) }}%
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card overall-rate">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-value">{{ overallConversionRate }}%</div>
              <div class="stat-label">总转化率</div>
              <div class="stat-extra">{{ summary.lead || 0 }} → {{ summary.enroll || 0 }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 转化漏斗图 -->
    <div class="app-card">
      <div class="card-header">
        <h3>转化漏斗</h3>
        <el-button-group>
          <el-button :type="chartType === 'funnel' ? 'primary' : ''" @click="chartType = 'funnel'">
            漏斗图
          </el-button>
          <el-button :type="chartType === 'trend' ? 'primary' : ''" @click="chartType = 'trend'">
            趋势图
          </el-button>
          <el-button :type="chartType === 'comparison' ? 'primary' : ''" @click="chartType = 'comparison'">
            对比图
          </el-button>
        </el-button-group>
      </div>
      <div ref="chartRef" class="chart-container" v-loading="chartLoading"></div>
    </div>

    <!-- 维度分析表格 -->
    <div class="app-card">
      <div class="card-header">
        <h3>{{ getDimensionTitle() }}分析</h3>
        <div class="table-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索..."
            style="max-width: 200px; width: 100%; margin-right: var(--text-sm)"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <UnifiedIcon name="Search" />
            </template>
          </el-input>
          <el-button @click="refreshTable">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </div>
      </div>

      <div class="table-wrapper">
<el-table class="responsive-table"
        :data="filteredSeries"
        v-loading="loading"
        style="width: 100%"
        @sort-change="handleSort"
        :default-sort="{ prop: 'lead', order: 'descending' }"
      >
        <el-table-column :prop="dimension === 'month' ? 'label' : 'label'" :label="getDimensionLabel()" width="200" show-overflow-tooltip fixed="left">
          <template #default="{ row }">
            <div class="dimension-cell">
              <div class="name">{{ row.label }}</div>
              <div v-if="row.description" class="description">{{ row.description }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="lead" label="线索数" width="100" sortable="custom" align="center">
          <template #default="{ row }">
            <div class="metric-cell">
              <div class="value">{{ formatNumber(row.lead || 0) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="visit" label="到访数" width="100" sortable="custom" align="center">
          <template #default="{ row }">
            <div class="metric-cell">
              <div class="value">{{ formatNumber(row.visit || 0) }}</div>
              <div class="rate">{{ getConversionRate(row.visit, row.lead) }}%</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="aware" label="了解园区" width="100" sortable="custom" align="center">
          <template #default="{ row }">
            <div class="metric-cell">
              <div class="value">{{ formatNumber(row.aware || 0) }}</div>
              <div class="rate">{{ getConversionRate(row.aware, row.visit) }}%</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="preEnroll" label="预报名" width="100" sortable="custom" align="center">
          <template #default="{ row }">
            <div class="metric-cell">
              <div class="value">{{ formatNumber(row.preEnroll || 0) }}</div>
              <div class="rate">{{ getConversionRate(row.preEnroll, row.aware) }}%</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="enroll" label="最终报名" width="100" sortable="custom" align="center">
          <template #default="{ row }">
            <div class="metric-cell">
              <div class="value">{{ formatNumber(row.enroll || 0) }}</div>
              <div class="rate">{{ getConversionRate(row.enroll, row.preEnroll) }}%</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总转化率" width="120" sortable="custom" align="center">
          <template #default="{ row }">
            <div class="conversion-rate">
              <div class="rate-value" :class="{ high: getOverallRate(row) >= 20, medium: getOverallRate(row) >= 10 }">
                {{ getOverallRate(row) }}%
              </div>
              <div class="rate-bar">
                <div class="rate-fill" :style="{ width: Math.min(getOverallRate(row), 100) + '%' }"></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">
              <UnifiedIcon name="eye" />
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 排行榜 -->
    <div class="app-card">
      <div class="card-header">
        <h3>转化排行榜</h3>
      </div>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="ranking-section">
            <h4>线索数TOP10</h4>
            <div class="ranking-list">
              <div
                v-for="(item, index) in ranking.leads?.slice(0, 10) || []"
                :key="item.label"
                class="ranking-item"
              >
                <div class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="info">
                  <div class="name">{{ item.label }}</div>
                  <div class="value">{{ formatNumber(item.lead || 0) }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="ranking-section">
            <h4>转化数TOP10</h4>
            <div class="ranking-list">
              <div
                v-for="(item, index) in ranking.conversions?.slice(0, 10) || []"
                :key="item.label"
                class="ranking-item"
              >
                <div class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="info">
                  <div class="name">{{ item.label }}</div>
                  <div class="value">{{ formatNumber(item.enroll || 0) }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="ranking-section">
            <h4>转化率TOP10</h4>
            <div class="ranking-list">
              <div
                v-for="(item, index) in ranking.rates?.slice(0, 10) || []"
                :key="item.label"
                class="ranking-item"
              >
                <div class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="info">
                  <div class="name">{{ item.label }}</div>
                  <div class="value">{{ getOverallRate(item) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详情对话框 -->
    <ConversionDetailDialog
      v-model="detailDialogVisible"
      :dimension="dimension"
      :item="currentItem"
      :date-range="dateRange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download, Refresh, View } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import ConversionDetailDialog from './components/ConversionDetailDialog.vue'
import * as echarts from 'echarts'
import { request } from '@/utils/request'

// 数据状态
const loading = ref(false)
const chartLoading = ref(false)
const dimension = ref<'channel'|'referral'|'campaign'|'month'>('channel')
const period = ref<'month'|'quarter'|'year'>('month')
const chartType = ref<'funnel'|'trend'|'comparison'>('funnel')
const dateRange = ref<string[]>([])
const searchKeyword = ref('')

// 数据
const summary = reactive<any>({ lead: 0, visit: 0, aware: 0, preEnroll: 0, enroll: 0 })
const series = ref<any[]>([])
const ranking = reactive<any>({ leads: [], conversions: [], rates: [] })
const trends = reactive<any>({ lead: 0, visit: 0, aware: 0, preEnroll: 0, enroll: 0 })

// 分页
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

// 对话框状态
const detailDialogVisible = ref(false)
const currentItem = ref<any>(null)

// 图表
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 标签映射
const labels: Record<string, string> = {
  lead: '采集单',
  visit: '进店',
  aware: '了解园区',
  preEnroll: '预报名',
  enroll: '最终报名'
}

// 计算属性
const overallConversionRate = computed(() => {
  const lead = summary.lead || 0
  const enroll = summary.enroll || 0
  return lead > 0 ? ((enroll / lead) * 100).toFixed(1) : '0.0'
})

const filteredSeries = computed(() => {
  if (!searchKeyword.value) return series.value

  return series.value.filter(item =>
    item.label?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      dimension: dimension.value,
      period: period.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    const res = await request.get('/api/marketing/stats/conversions', params)
    Object.assign(summary, res.data?.summary || {})
    Object.assign(trends, res.data?.trends || {})
    series.value = res.data?.series || []
    Object.assign(ranking, res.data?.ranking || {})
    pagination.total = res.data?.total || 0

    await nextTick()
    initChart()
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载转换统计数据失败')
  } finally {
    loading.value = false
  }
}

const initChart = async () => {
  if (!chartRef.value) return

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
      case 'trend':
        option = getTrendOption()
        break
      case 'comparison':
        option = getComparisonOption()
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
  const data = [
    { value: summary.lead || 0, name: '采集单' },
    { value: summary.visit || 0, name: '进店' },
    { value: summary.aware || 0, name: '了解园区' },
    { value: summary.preEnroll || 0, name: '预报名' },
    { value: summary.enroll || 0, name: '最终报名' }
  ]

  return {
    title: {
      text: '转化漏斗',
      left: 'center'
    },
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

const getTrendOption = () => {
  // 这里需要从后端获取时间序列数据
  const periods = ['1月', '2月', '3月', '4月', '5月', '6月']

  return {
    title: {
      text: '转化趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['采集单', '进店', '了解园区', '预报名', '最终报名'],
      top: 30
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
        data: [120, 132, 101, 134, 90, 230],
        smooth: true
      },
      {
        name: '进店',
        type: 'line',
        data: [80, 88, 67, 89, 60, 153],
        smooth: true
      },
      {
        name: '了解园区',
        type: 'line',
        data: [60, 66, 50, 67, 45, 115],
        smooth: true
      },
      {
        name: '预报名',
        type: 'line',
        data: [40, 44, 33, 45, 30, 77],
        smooth: true
      },
      {
        name: '最终报名',
        type: 'line',
        data: [24, 26, 20, 27, 18, 46],
        smooth: true
      }
    ]
  }
}

const getComparisonOption = () => {
  const data = series.value.slice(0, 10).map(item => ({
    name: item.label,
    lead: item.lead || 0,
    visit: item.visit || 0,
    aware: item.aware || 0,
    preEnroll: item.preEnroll || 0,
    enroll: item.enroll || 0
  }))

  return {
    title: {
      text: `${getDimensionTitle()}转化对比`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['采集单', '进店', '了解园区', '预报名', '最终报名'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '采集单',
        type: 'bar',
        data: data.map(d => d.lead),
        itemStyle: { color: '#5470c6' }
      },
      {
        name: '进店',
        type: 'bar',
        data: data.map(d => d.visit),
        itemStyle: { color: '#91cc75' }
      },
      {
        name: '了解园区',
        type: 'bar',
        data: data.map(d => d.aware),
        itemStyle: { color: '#fac858' }
      },
      {
        name: '预报名',
        type: 'bar',
        data: data.map(d => d.preEnroll),
        itemStyle: { color: '#ee6666' }
      },
      {
        name: '最终报名',
        type: 'bar',
        data: data.map(d => d.enroll),
        itemStyle: { color: '#73c0de' }
      }
    ]
  }
}

const handleSort = ({ prop, order }: any) => {
  if (!prop) return

  const isAsc = order === 'ascending'
  series.value.sort((a, b) => {
    const aVal = a[prop] || 0
    const bVal = b[prop] || 0
    return isAsc ? aVal - bVal : bVal - aVal
  })
}

const handleSearch = () => {
  // 搜索功能已通过计算属性实现
}

const refreshTable = () => {
  loadData()
}

const viewDetail = (row: any) => {
  currentItem.value = { ...row }
  detailDialogVisible.value = true
}

const exportData = async () => {
  try {
    const params = {
      dimension: dimension.value,
      period: period.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      export: true
    }

    const res = await request.get('/api/marketing/stats/conversions/export', params, { responseType: 'blob' })

    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `转换统计_${dimension.value}_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (e: any) {
    ElMessage.error(e.message || '导出失败')
  }
}

// 辅助方法
const getStatIcon = (key: string) => {
  const iconMap: Record<string, string> = {
    lead: '📋',
    visit: '🚪',
    aware: '👁️',
    preEnroll: '📝',
    enroll: '✅'
  }
  return iconMap[key] || '📊'
}

const getTrend = (key: string) => {
  return trends[key] || 0
}

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const getDimensionTitle = () => {
  const titleMap: Record<string, string> = {
    channel: '渠道',
    referral: '老带新',
    campaign: '活动',
    month: '月份'
  }
  return titleMap[dimension.value] || '维度'
}

const getDimensionLabel = () => {
  const labelMap: Record<string, string> = {
    channel: '渠道名称',
    referral: '推荐类型',
    campaign: '活动名称',
    month: '时间'
  }
  return labelMap[dimension.value] || '名称'
}

const getConversionRate = (current: number, previous: number) => {
  if (!previous || previous === 0) return '0.0'
  return ((current / previous) * 100).toFixed(1)
}

const getOverallRate = (row: any) => {
  const lead = row.lead || 0
  const enroll = row.enroll || 0
  return lead > 0 ? ((enroll / lead) * 100).toFixed(1) : 0
}

// 监听器
watch(chartType, () => {
  initChart()
})

watch(dimension, () => {
  pagination.page = 1
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
@use '@/styles/design-tokens.scss' as *;

.marketing-conversions {
  .stats-overview {
    margin-bottom: var(--spacing-xl);

    .stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-lg);
      background: var(--color-bg-container);
      border: var(--border-width-base) solid var(--color-border-light);
      border-radius: var(--border-radius-lg);
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
      }

      .stat-icon {
        font-size: 2.5rem;
        margin-right: var(--spacing-lg);
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--color-primary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-xs);
        }

        .stat-trend {
          font-size: 0.75rem;
          color: var(--color-text-secondary);

          &.positive {
            color: var(--color-success);
          }
        }

        .stat-extra {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }
      }

      &.lead .stat-icon { color: #5470c6; }
      &.visit .stat-icon { color: #91cc75; }
      &.aware .stat-icon { color: #fac858; }
      &.preEnroll .stat-icon { color: #ee6666; }
      &.enroll .stat-icon { color: #73c0de; }
      &.overall-rate .stat-icon { color: var(--color-primary); }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: var(--z-index-dropdown) solid var(--color-border-light);

    h3 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1.125rem;
    }

    .table-actions {
      display: flex;
      align-items: center;
    }
  }

  .chart-container {
    min-height: 60px; height: auto;
    width: 100%;
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

  .metric-cell {
    text-align: center;

    .value {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .rate {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-top: var(--spacing-sm);
    }
  }

  .conversion-rate {
    text-align: center;

    .rate-value {
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-xs);

      &.high {
        color: var(--color-success);
      }

      &.medium {
        color: var(--color-warning);
      }
    }

    .rate-bar {
      width: auto;
      height: var(--spacing-xs);
      background: var(--color-border-light);
      border-radius: var(--radius-xs);
      margin: 0 auto;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;

      .rate-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-danger), var(--color-warning), var(--color-success));
        transition: width 0.3s ease;
      }
    }
  }

  .pagination-section {
    margin-top: var(--spacing-lg);
    display: flex;
    justify-content: center;
  }

  .ranking-section {
    h4 {
      margin-bottom: var(--spacing-md);
      color: var(--color-text-primary);
      font-size: 1rem;
      text-align: center;
    }

    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        background: var(--color-bg-soft);
        border-radius: var(--border-radius-md);
        margin-bottom: var(--spacing-sm);
        transition: all 0.3s ease;

        &:hover {
          background: var(--color-bg-container);
          box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
        }

        .rank {
          width: var(--text-3xl);
          height: var(--text-3xl);
          background: var(--color-text-secondary);
          color: white;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          margin-right: var(--spacing-md);

          &.top {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: var(--color-text-primary);
          }
        }

        .info {
          flex: 1;

          .name {
            font-weight: 500;
            color: var(--color-text-primary);
            margin-bottom: var(--spacing-sm);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .value {
            font-size: 0.875rem;
            color: var(--color-primary);
            font-weight: 600;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .marketing-conversions {
    .stats-overview {
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

      .table-actions {
        width: 100%;
        justify-content: space-between;

        .el-input {
          max-width: 150px; width: 100% !important;
        }
      }
    }

    .chart-container {
      min-height: 60px; height: auto;
    }

    .el-table {
      .dimension-cell,
      .metric-cell,
      .conversion-rate {
        font-size: 0.75rem;
      }
    }

    .ranking-section {
      margin-bottom: var(--spacing-lg);

      .ranking-item {
        .info {
          .name {
            font-size: 0.75rem;
          }

          .value {
            font-size: 0.75rem;
          }
        }
      }
    }
  }
}
</style>

