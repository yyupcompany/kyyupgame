<template>
  <el-dialog
    v-model="visible"
    :title="`${stage?.name || ''}阶段详情`"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="stage-detail" v-loading="loading">
      <div v-if="stage">
        <!-- 阶段概览 -->
        <div class="detail-section">
          <h4>阶段概览</h4>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="overview-card">
                <div class="card-value">{{ formatNumber(stageData.count || 0) }}</div>
                <div class="card-label">当前人数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card">
                <div class="card-value">{{ stageData.conversionRate || 0 }}%</div>
                <div class="card-label">转化率</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card">
                <div class="card-value">{{ stageData.avgStayDays || 0 }}天</div>
                <div class="card-label">平均停留</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card">
                <div class="card-value trend" :class="{ positive: stageData.trend > 0 }">
                  {{ stageData.trend > 0 ? '+' : '' }}{{ stageData.trend || 0 }}%
                </div>
                <div class="card-label">环比变化</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 趋势图表 -->
        <div class="detail-section">
          <h4>趋势分析</h4>
          <div class="trend-controls">
            <el-radio-group v-model="trendPeriod" @change="loadTrendData">
              <el-radio-button label="day">按日</el-radio-button>
              <el-radio-button label="week">按周</el-radio-button>
              <el-radio-button label="month">按月</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>

        <!-- 来源分析 -->
        <div class="detail-section">
          <h4>来源分析</h4>
          <div class="source-analysis">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="source-chart">
                  <h5>渠道分布</h5>
                  <div ref="channelChartRef" class="mini-chart"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="source-chart">
                  <h5>活动分布</h5>
                  <div ref="campaignChartRef" class="mini-chart"></div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 详细数据表格 -->
        <div class="detail-section">
          <h4>详细数据</h4>
          <div class="table-controls">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户..."
              style="max-width: 200px; width: 100%; margin-right: var(--text-sm)"
              clearable
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
            <el-select v-model="statusFilter" placeholder="状态筛选" style="max-width: 120px; width: 100%; margin-right: var(--text-sm)">
              <el-option label="全部" value="" />
              <el-option label="进行中" value="active" />
              <el-option label="已转化" value="converted" />
              <el-option label="已流失" value="lost" />
            </el-select>
            <el-button @click="refreshTable">
              <UnifiedIcon name="Refresh" />
              刷新
            </el-button>
          </div>

          <div class="table-wrapper">
<el-table class="responsive-table" :data="filteredTableData" size="small" style="width: 100%" max-height="400">
            <el-table-column prop="user.name" label="用户" width="120">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :size="24" :src="row.user?.avatar">
                    {{ row.user?.name?.charAt(0) }}
                  </el-avatar>
                  <span class="name">{{ row.user?.name || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="user.phone" label="电话" width="120" />
            <el-table-column prop="channel" label="渠道" width="100" />
            <el-table-column prop="campaign" label="活动" width="120" />
            <el-table-column prop="enterTime" label="进入时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.enterTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="stayDays" label="停留天数" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewUserDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
</div>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadTableData"
              @current-change="loadTableData"
            />
          </div>
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
        <el-button @click="exportStageData">导出数据</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { primaryRgba, getSuccessColor, getDangerColor } from '@/utils/color-tokens'

interface Props {
  modelValue: boolean
  stage?: any
  dateRange?: string[]
  dimension?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const trendPeriod = ref('day')
const searchKeyword = ref('')
const statusFilter = ref('')

const stageData = ref<any>({})
const tableData = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const trendChartRef = ref<HTMLElement>()
const channelChartRef = ref<HTMLElement>()
const campaignChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let channelChart: echarts.ECharts | null = null
let campaignChart: echarts.ECharts | null = null

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredTableData = computed(() => {
  let data = tableData.value
  
  if (searchKeyword.value) {
    data = data.filter(item => 
      item.user?.name?.includes(searchKeyword.value) ||
      item.user?.phone?.includes(searchKeyword.value)
    )
  }
  
  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }
  
  return data
})

const loadStageData = async () => {
  if (!props.stage?.code) return

  loading.value = true
  try {
    const params = {
      stage: props.stage.code,
      startDate: props.dateRange?.[0],
      endDate: props.dateRange?.[1],
      dimension: props.dimension
    }

    const res = await request.get('/api/marketing/stats/funnel/stage', params)
    stageData.value = res.data || {}
    
    await nextTick()
    initCharts()
    loadTableData()
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载阶段详情失败')
  } finally {
    loading.value = false
  }
}

const loadTrendData = async () => {
  try {
    const params = {
      stage: props.stage?.code,
      period: trendPeriod.value,
      startDate: props.dateRange?.[0],
      endDate: props.dateRange?.[1]
    }

    const res = await request.get('/api/marketing/stats/funnel/stage/trend', params)
    const trendData = res.data || {}
    
    await nextTick()
    initTrendChart(trendData)
  } catch (e: any) {
    console.error('加载趋势数据失败:', e)
  }
}

const loadTableData = async () => {
  try {
    const params = {
      stage: props.stage?.code,
      page: pagination.page,
      pageSize: pagination.pageSize,
      startDate: props.dateRange?.[0],
      endDate: props.dateRange?.[1]
    }

    const res = await request.get('/api/marketing/stats/funnel/stage/users', params)
    tableData.value = res.data?.items || []
    pagination.total = res.data?.total || 0
  } catch (e: any) {
    console.error('加载用户数据失败:', e)
  }
}

const initCharts = () => {
  initChannelChart()
  initCampaignChart()
  loadTrendData()
}

const initTrendChart = (data: any) => {
  if (!trendChartRef.value) return

  if (trendChart) {
    trendChart.dispose()
  }
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.periods || []
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '人数',
      type: 'line',
      data: data.counts || [],
      smooth: true,
      itemStyle: { color: primaryRgba(1) },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: primaryRgba(0.3) },
          { offset: 1, color: primaryRgba(0.1) }
        ])
      }
    }]
  }

  trendChart.setOption(option)
}

const initChannelChart = () => {
  if (!channelChartRef.value || !stageData.value.channelDistribution) return

  channelChart = echarts.init(channelChartRef.value)
  
  const data = stageData.value.channelDistribution.map((item: any) => ({
    value: item.count,
    name: item.name
  }))

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'var(--shadow-heavy)'
        }
      }
    }]
  }

  channelChart.setOption(option)
}

const initCampaignChart = () => {
  if (!campaignChartRef.value || !stageData.value.campaignDistribution) return

  campaignChart = echarts.init(campaignChartRef.value)
  
  const data = stageData.value.campaignDistribution.map((item: any) => ({
    value: item.count,
    name: item.name
  }))

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'var(--shadow-heavy)'
        }
      }
    }]
  }

  campaignChart.setOption(option)
}

const getSuggestions = () => {
  const suggestions = []
  const conversionRate = stageData.value.conversionRate || 0
  const avgStayDays = stageData.value.avgStayDays || 0
  
  if (conversionRate < 60) {
    suggestions.push({
      type: 'warning',
      icon: '⚠️',
      title: '转化率偏低',
      description: '建议加强该阶段的跟进力度，优化转化流程'
    })
  }
  
  if (avgStayDays > 7) {
    suggestions.push({
      type: 'info',
      icon: '⏰',
      title: '停留时间过长',
      description: '建议优化流程效率，减少用户在该阶段的停留时间'
    })
  }
  
  if (stageData.value.trend < 0) {
    suggestions.push({
      type: 'danger',
      icon: '📉',
      title: '趋势下降',
      description: '该阶段人数呈下降趋势，需要重点关注和改进'
    })
  }
  
  return suggestions
}

const refreshTable = () => {
  loadTableData()
}

const viewUserDetail = (row: any) => {
  ElMessage.info(`查看用户详情: ${row.user?.name}`)
}

const exportStageData = () => {
  ElMessage.info('导出功能开发中...')
}

// 辅助方法
const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'primary',
    converted: 'success',
    lost: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '进行中',
    converted: '已转化',
    lost: '已流失'
  }
  return textMap[status] || status
}

const handleClose = () => {
  // 销毁图表实例
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  if (channelChart) {
    channelChart.dispose()
    channelChart = null
  }
  if (campaignChart) {
    campaignChart.dispose()
    campaignChart = null
  }
  
  visible.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.stage) {
    loadStageData()
  }
})

onUnmounted(() => {
  handleClose()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.stage-detail {
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
  }

  .overview-card {
    text-align: center;
    padding: var(--spacing-lg);
    background: var(--color-bg-soft);
    border-radius: var(--border-radius-md);

    .card-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: var(--spacing-xs);

      &.trend.positive {
        color: var(--color-success);
      }
    }

    .card-label {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  }

  .chart-container {
    min-height: 60px; height: auto;
    width: 100%;
  }

  .mini-chart {
    min-height: 60px; height: auto;
    width: 100%;
  }

  .trend-controls {
    margin-bottom: var(--spacing-md);
  }

  .source-analysis {
    .source-chart {
      background: var(--color-bg-soft);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
    }
  }

  .table-controls {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .name {
      font-size: 0.875rem;
    }
  }

  .pagination-section {
    margin-top: var(--spacing-md);
    display: flex;
    justify-content: center;
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
