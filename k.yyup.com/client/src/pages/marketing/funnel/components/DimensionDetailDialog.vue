<template>
  <el-dialog
    v-model="visible"
    :title="`${getDimensionTitle()}详情 - ${item?.name || ''}`"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="dimension-detail" v-loading="loading">
      <div v-if="item">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="3" border>
            <el-descriptions-item :label="getDimensionLabel()">
              {{ item.name }}
            </el-descriptions-item>
            <el-descriptions-item label="总转化率">
              <span class="conversion-rate" :class="{ high: getOverallRate() >= 20, medium: getOverallRate() >= 10 }">
                {{ getOverallRate() }}%
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="数据时间">
              {{ formatDateRange() }}
            </el-descriptions-item>
            <el-descriptions-item v-if="item.description" label="描述" span="3">
              {{ item.description }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 漏斗对比 -->
        <div class="detail-section">
          <h4>漏斗对比</h4>
          <div class="funnel-comparison">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="funnel-chart">
                  <h5>当前{{ getDimensionTitle() }}</h5>
                  <div ref="currentFunnelRef" class="chart-container"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="funnel-chart">
                  <h5>平均水平</h5>
                  <div ref="avgFunnelRef" class="chart-container"></div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 阶段明细 -->
        <div class="detail-section">
          <h4>阶段明细</h4>
          <div class="stages-detail">
            <div class="table-wrapper">
<el-table class="responsive-table" :data="stageDetails" style="width: 100%">
              <el-table-column prop="stageName" label="阶段" width="120" />
              <el-table-column prop="count" label="人数" width="100" align="center">
                <template #default="{ row }">
                  {{ formatNumber(row.count || 0) }}
                </template>
              </el-table-column>
              <el-table-column label="转化率" width="100" align="center">
                <template #default="{ row, $index }">
                  {{ getStageRate($index) }}%
                </template>
              </el-table-column>
              <el-table-column prop="avgStayDays" label="平均停留(天)" width="120" align="center" />
              <el-table-column label="与平均对比" width="120" align="center">
                <template #default="{ row }">
                  <div class="comparison" :class="{ better: row.vsAvg > 0, worse: row.vsAvg < 0 }">
                    {{ row.vsAvg > 0 ? '+' : '' }}{{ row.vsAvg || 0 }}%
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="trend" label="趋势" width="100" align="center">
                <template #default="{ row }">
                  <div class="trend" :class="{ positive: row.trend > 0 }">
                    {{ row.trend > 0 ? '+' : '' }}{{ row.trend || 0 }}%
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="viewStageUsers(row)">
                    查看用户
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
</div>
          </div>
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

        <!-- 用户列表 -->
        <div class="detail-section">
          <h4>用户列表</h4>
          <div class="user-controls">
            <el-input
              v-model="userSearch"
              placeholder="搜索用户..."
              style="max-width: 200px; width: 100%; margin-right: var(--text-sm)"
              clearable
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
            <el-select v-model="stageFilter" placeholder="阶段筛选" style="max-width: 120px; width: 100%; margin-right: var(--text-sm)">
              <el-option label="全部" value="" />
              <el-option 
                v-for="stage in stageDetails" 
                :key="stage.stageCode" 
                :label="stage.stageName" 
                :value="stage.stageCode" 
              />
            </el-select>
            <el-button @click="refreshUsers">
              <UnifiedIcon name="Refresh" />
              刷新
            </el-button>
          </div>

          <el-table class="responsive-table" :data="filteredUsers" size="small" style="width: 100%" max-height="300">
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
            <el-table-column prop="currentStage" label="当前阶段" width="100" />
            <el-table-column prop="enterTime" label="进入时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.enterTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalDays" label="总天数" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewUserJourney(row)">
                  用户旅程
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              v-model:current-page="userPagination.page"
              v-model:page-size="userPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="userPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadUsers"
              @current-change="loadUsers"
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
        <el-button @click="exportDetail">导出详情</el-button>
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
const userSearch = ref('')
const stageFilter = ref('')

const detailData = ref<any>({})
const stageDetails = ref<any[]>([])
const users = ref<any[]>([])
const userPagination = reactive({ page: 1, pageSize: 20, total: 0 })

const currentFunnelRef = ref<HTMLElement>()
const avgFunnelRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

let currentFunnelChart: echarts.ECharts | null = null
let avgFunnelChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredUsers = computed(() => {
  let data = users.value
  
  if (userSearch.value) {
    data = data.filter(item => 
      item.user?.name?.includes(userSearch.value) ||
      item.user?.phone?.includes(userSearch.value)
    )
  }
  
  if (stageFilter.value) {
    data = data.filter(item => item.currentStage === stageFilter.value)
  }
  
  return data
})

const loadDetailData = async () => {
  if (!props.item?.name) return

  loading.value = true
  try {
    const params = {
      dimension: props.dimension,
      name: props.item.name,
      startDate: props.dateRange?.[0],
      endDate: props.dateRange?.[1]
    }

    const res = await request.get('/api/marketing/stats/funnel/dimension/detail', params)
    detailData.value = res.data || {}
    stageDetails.value = res.data?.stageDetails || []
    
    await nextTick()
    initCharts()
    loadUsers()
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载详情数据失败')
  } finally {
    loading.value = false
  }
}

const loadTrendData = async () => {
  try {
    const params = {
      dimension: props.dimension,
      name: props.item?.name,
      period: trendPeriod.value,
      startDate: props.dateRange?.[0],
      endDate: props.dateRange?.[1]
    }

    const res = await request.get('/api/marketing/stats/funnel/dimension/trend', params)
    const trendData = res.data || {}
    
    await nextTick()
    initTrendChart(trendData)
  } catch (e: any) {
    console.error('加载趋势数据失败:', e)
  }
}

const loadUsers = async () => {
  try {
    const params = {
      dimension: props.dimension,
      name: props.item?.name,
      page: userPagination.page,
      pageSize: userPagination.pageSize,
      startDate: props.dateRange?.[0],
      endDate: props.dateRange?.[1]
    }

    const res = await request.get('/api/marketing/stats/funnel/dimension/users', params)
    users.value = res.data?.items || []
    userPagination.total = res.data?.total || 0
  } catch (e: any) {
    console.error('加载用户数据失败:', e)
  }
}

const initCharts = () => {
  initFunnelCharts()
  loadTrendData()
}

const initFunnelCharts = () => {
  // 当前维度漏斗图
  if (currentFunnelRef.value && stageDetails.value.length) {
    currentFunnelChart = echarts.init(currentFunnelRef.value)
    
    const currentData = stageDetails.value.map(stage => ({
      value: stage.count || 0,
      name: stage.stageName
    }))

    currentFunnelChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'funnel',
        data: currentData,
        left: '10%',
        width: '80%',
        label: { show: true, position: 'inside' }
      }]
    })
  }

  // 平均水平漏斗图
  if (avgFunnelRef.value && detailData.value.avgData) {
    avgFunnelChart = echarts.init(avgFunnelRef.value)
    
    const avgData = detailData.value.avgData.map((item: any) => ({
      value: item.count || 0,
      name: item.stageName
    }))

    avgFunnelChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'funnel',
        data: avgData,
        left: '10%',
        width: '80%',
        label: { show: true, position: 'inside' }
      }]
    })
  }
}

const initTrendChart = (data: any) => {
  if (!trendChartRef.value) return

  if (trendChart) {
    trendChart.dispose()
  }
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: stageDetails.value.map(s => s.stageName) },
    xAxis: {
      type: 'category',
      data: data.periods || []
    },
    yAxis: { type: 'value' },
    series: stageDetails.value.map((stage, index) => ({
      name: stage.stageName,
      type: 'line',
      data: data.series?.[index] || [],
      smooth: true
    }))
  }

  trendChart.setOption(option)
}

const getSuggestions = () => {
  const suggestions = []
  const overallRate = getOverallRate()
  
  if (overallRate < 15) {
    suggestions.push({
      type: 'warning',
      icon: '⚠️',
      title: '转化率偏低',
      description: `该${getDimensionTitle()}的总转化率为${overallRate}%，低于平均水平，建议重点优化`
    })
  }
  
  // 找出转化率最低的阶段
  const worstStage = stageDetails.value.find(stage => stage.vsAvg < -10)
  if (worstStage) {
    suggestions.push({
      type: 'info',
      icon: '🎯',
      title: '重点优化阶段',
      description: `${worstStage.stageName}阶段表现较差，建议重点关注和改进`
    })
  }
  
  return suggestions
}

const viewStageUsers = (stage: any) => {
  stageFilter.value = stage.stageCode
}

const viewUserJourney = (user: any) => {
  ElMessage.info(`查看用户旅程: ${user.user?.name}`)
}

const refreshUsers = () => {
  loadUsers()
}

const exportDetail = () => {
  ElMessage.info('导出功能开发中...')
}

// 辅助方法
const getDimensionTitle = () => {
  const titleMap: Record<string, string> = {
    channel: '渠道',
    campaign: '活动',
    source: '来源'
  }
  return titleMap[props.dimension] || '维度'
}

const getDimensionLabel = () => {
  const labelMap: Record<string, string> = {
    channel: '渠道名称',
    campaign: '活动名称',
    source: '来源名称'
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

const getOverallRate = () => {
  if (!stageDetails.value.length) return 0
  const first = stageDetails.value[0]?.count || 0
  const last = stageDetails.value[stageDetails.value.length - 1]?.count || 0
  return first > 0 ? ((last / first) * 100).toFixed(1) : 0
}

const getStageRate = (index: number) => {
  if (index === 0) return 100
  const current = stageDetails.value[index]?.count || 0
  const previous = stageDetails.value[index - 1]?.count || 0
  return previous > 0 ? ((current / previous) * 100).toFixed(1) : 0
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
  if (currentFunnelChart) {
    currentFunnelChart.dispose()
    currentFunnelChart = null
  }
  if (avgFunnelChart) {
    avgFunnelChart.dispose()
    avgFunnelChart = null
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

.dimension-detail {
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
  }

  .chart-container {
    min-height: 60px; height: auto;
    width: 100%;
  }

  .funnel-comparison {
    .funnel-chart {
      background: var(--color-bg-soft);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
    }
  }

  .comparison {
    font-weight: 600;

    &.better {
      color: var(--color-success);
    }

    &.worse {
      color: var(--color-danger);
    }
  }

  .trend {
    font-weight: 600;
    color: var(--color-text-secondary);

    &.positive {
      color: var(--color-success);
    }
  }

  .trend-controls,
  .user-controls {
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
