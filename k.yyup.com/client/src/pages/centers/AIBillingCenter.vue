<template>
  <UnifiedCenterLayout
    title="AI用量与计费中心"
    description="监控AI服务使用情况，查看详细计费账单，支持月度、季度、年度统计分析"
  >
    <div class="center-container billing-center">
      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <div class="stats-grid-unified" v-loading="loading" element-loading-text="加载计费数据中...">
          <StatCard
            title="总费用"
            :value="formatCurrency(billingStats.totalCost)"
            icon-name="money"
            :trend="0"
            trend-text="本期费用"
            type="primary"
            clickable
            @click="navigateToDetail('cost')"
          />
          <StatCard
            title="总调用次数"
            :value="formatNumber(billingStats.totalRecords)"
            icon-name="api"
            :trend="0"
            trend-text="总请求数"
            type="success"
            clickable
            @click="navigateToDetail('calls')"
          />
          <StatCard
            title="Token使用量"
            :value="formatNumber(getTokenUsage())"
            icon-name="cpu"
            :trend="0"
            trend-text="文本模型Token"
            type="info"
            clickable
            @click="navigateToDetail('tokens')"
          />
          <StatCard
            title="视频总时长"
            :value="formatDuration(getVideoDuration())"
            icon-name="video"
            :trend="0"
            trend-text="视频生成时长"
            type="warning"
            clickable
            @click="navigateToDetail('video')"
          />
        </div>
      </div>

      <!-- 趋势图表 -->
      <el-card class="trend-chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <h3>费用趋势</h3>
            <el-radio-group v-model="trendPeriod" size="small" @change="loadTrendData">
              <el-radio-button label="monthly">月度</el-radio-button>
              <el-radio-button label="weekly">周度</el-radio-button>
              <el-radio-button label="daily">日度</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="trendChartRef" class="trend-chart" style="height: 300px;"></div>
      </el-card>

      <!-- 按类型分组统计 -->
      <el-card class="type-breakdown-card" shadow="never">
        <template #header>
          <h3>计费类型分布</h3>
        </template>
        <div class="type-breakdown-grid">
          <div
            v-for="(data, type) in billingStats.byType"
            :key="type"
            class="type-item"
            :class="getTypeClass(type as BillingType)"
          >
            <div class="type-icon">
              <UnifiedIcon :name="getTypeIcon(type as BillingType)" />
            </div>
            <div class="type-content">
              <h4>{{ formatBillingType(type as BillingType) }}</h4>
              <div class="type-stats">
                <div class="stat-item">
                  <span class="label">调用次数:</span>
                  <span class="value">{{ formatNumber(data.count) }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">计量数量:</span>
                  <span class="value">{{ formatNumber(data.quantity) }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">费用:</span>
                  <span class="value primary">{{ formatCurrency(data.cost) }}</span>
                </div>
              </div>
            </div>
            <div class="type-chart">
              <el-progress
                type="circle"
                :percentage="calculatePercentage(data.cost, billingStats.totalCost)"
                :width="80"
                :stroke-width="6"
              />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 账单明细表格 -->
      <el-card class="bill-details-card" shadow="never">
        <template #header>
          <div class="card-header">
            <h3>账单明细</h3>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索模型名称"
                clearable
                style="width: 200px"
                @input="handleSearch"
              >
                <template #prefix>
                  <UnifiedIcon name="Search" />
                </template>
              </el-input>
              <el-button type="primary" @click="handleExportCSV">导出CSV</el-button>
            </div>
          </div>
        </template>
        
        <el-table
          :data="filteredBillRecords"
          stripe
          v-loading="tableLoading"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="createdAt" label="时间" width="180" sortable>
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="modelConfig.name" label="模型" width="200">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.modelConfig?.name || '未知' }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="billingType" label="计费类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeTagColor(row.billingType)" size="small">
                {{ formatBillingType(row.billingType) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="quantity" label="计量" width="150">
            <template #default="{ row }">
              {{ formatNumber(row.quantity) }} {{ row.unit }}
            </template>
          </el-table-column>
          
          <el-table-column prop="totalCost" label="费用" width="120" sortable>
            <template #default="{ row }">
              <span class="cost-value">{{ formatCurrency(row.totalCost) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="billingStatus" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getBillingStatusColor(row.billingStatus)" size="small">
                {{ formatBillingStatus(row.billingStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="详情" width="200">
            <template #default="{ row }">
              <div class="detail-info">
                <template v-if="row.billingType === 'token'">
                  输入: {{ formatNumber(row.inputTokens) }}<br>
                  输出: {{ formatNumber(row.outputTokens) }}
                </template>
                <template v-else-if="row.billingType === 'second'">
                  时长: {{ row.durationSeconds }}秒
                </template>
                <template v-else-if="row.billingType === 'count'">
                  数量: {{ row.imageCount }}
                </template>
                <template v-else-if="row.billingType === 'character'">
                  字符: {{ formatNumber(row.characterCount) }}
                </template>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewDetail(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalRecords"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>

      <!-- 详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="计费详情"
        width="600px"
        center
      >
        <div v-if="selectedRecord" class="detail-dialog">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="记录ID">{{ selectedRecord.id }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ selectedRecord.userId }}</el-descriptions-item>
            <el-descriptions-item label="模型">{{ selectedRecord.modelConfig?.name }}</el-descriptions-item>
            <el-descriptions-item label="计费类型">
              <el-tag :type="getTypeTagColor(selectedRecord.billingType)">
                {{ formatBillingType(selectedRecord.billingType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="计量数量">
              {{ formatNumber(selectedRecord.quantity) }} {{ selectedRecord.unit }}
            </el-descriptions-item>
            <el-descriptions-item label="总费用">
              <span class="cost-value">{{ formatCurrency(selectedRecord.totalCost) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getBillingStatusColor(selectedRecord.billingStatus)">
                {{ formatBillingStatus(selectedRecord.billingStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="货币">{{ selectedRecord.currency }}</el-descriptions-item>
            <el-descriptions-item label="计费周期" :span="2">
              {{ selectedRecord.billingCycle }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">
              {{ formatDateTime(selectedRecord.createdAt) }}
            </el-descriptions-item>
            
            <!-- 根据类型显示详细信息 -->
            <template v-if="selectedRecord.billingType === 'token'">
              <el-descriptions-item label="输入Token">{{ formatNumber(selectedRecord.inputTokens) }}</el-descriptions-item>
              <el-descriptions-item label="输出Token">{{ formatNumber(selectedRecord.outputTokens) }}</el-descriptions-item>
              <el-descriptions-item label="输入单价">{{ selectedRecord.inputPrice }}</el-descriptions-item>
              <el-descriptions-item label="输出单价">{{ selectedRecord.outputPrice }}</el-descriptions-item>
            </template>
            
            <template v-else-if="selectedRecord.billingType === 'second'">
              <el-descriptions-item label="时长(秒)">{{ selectedRecord.durationSeconds }}</el-descriptions-item>
              <el-descriptions-item label="单价(每秒)">{{ selectedRecord.unitPrice }}</el-descriptions-item>
            </template>
            
            <template v-else-if="selectedRecord.billingType === 'count'">
              <el-descriptions-item label="图片数量">{{ selectedRecord.imageCount }}</el-descriptions-item>
              <el-descriptions-item label="单价(每张)">{{ selectedRecord.unitPrice }}</el-descriptions-item>
            </template>
            
            <template v-else-if="selectedRecord.billingType === 'character'">
              <el-descriptions-item label="字符数">{{ formatNumber(selectedRecord.characterCount) }}</el-descriptions-item>
              <el-descriptions-item label="单价(每字符)">{{ selectedRecord.unitPrice }}</el-descriptions-item>
            </template>
          </el-descriptions>
        </div>
        <template #footer>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { ECh

artsOption } from 'echarts'

import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/common/StatCard.vue'

import {
  getMyBill,
  getBillingStatistics,
  getMyBillingTrend,
  exportBillCSV,
  formatBillingType,
  formatBillingStatus,
  getBillingStatusColor,
  type BillingRecord,
  type BillingStatistics as IBillingStatistics,
  type BillingType,
  type BillingStatus,
  type UserBill,
} from '@/api/endpoints/ai-billing'

const router = useRouter()

// ==================== 响应式数据 ====================
const loading = ref(false)
const tableLoading = ref(false)
const detailDialogVisible = ref(false)
const selectedRecord = ref<BillingRecord | null>(null)

// 周期选择
const selectedPeriod = ref<'monthly' | 'quarterly' | 'yearly'>('monthly')
const periodOptions = [
  { label: '月度', value: 'monthly' },
  { label: '季度', value: 'quarterly' },
  { label: '年度', value: 'yearly' },
]

// 趋势图
const trendChartRef = ref<HTMLElement>()
const trendChart = ref<echarts.ECharts>()
const trendPeriod = ref<'daily' | 'weekly' | 'monthly'>('monthly')

// 计费统计
const billingStats = ref<IBillingStatistics>({
  totalRecords: 0,
  totalCost: 0,
  byType: {},
  byStatus: {},
})

// 账单数据
const currentBill = ref<UserBill | null>(null)
const billRecords = ref<BillingRecord[]>([])

// 表格搜索和分页
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalRecords = computed(() => billRecords.value.length)

// 过滤后的账单记录
const filteredBillRecords = computed(() => {
  let records = billRecords.value

  // 搜索过滤
  if (searchKeyword.value) {
    records = records.filter(record =>
      record.modelConfig?.name?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return records.slice(start, end)
})

// ==================== 格式化函数 ====================
function formatNumber(num: number | undefined): string {
  if (num === undefined) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return '$0.00'
  return `$${amount.toFixed(4)}`
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`
  } else {
    return `${(seconds / 3600).toFixed(1)}小时`
  }
}

function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ==================== 类型相关 ====================
function getTypeIcon(type: BillingType): string {
  const icons = {
    token: 'cpu',
    second: 'video',
    count: 'image',
    character: 'file-text',
  }
  return icons[type] || 'info'
}

function getTypeClass(type: BillingType): string {
  return `type-${type}`
}

function getTypeTagColor(type: BillingType): string {
  const colors = {
    token: 'primary',
    second: 'warning',
    count: 'success',
    character: 'info',
  }
  return colors[type] || 'info'
}

function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// ==================== 数据获取 ====================
function getTokenUsage(): number {
  const tokenData = billingStats.value.byType?.token
  return tokenData ? tokenData.quantity : 0
}

function getVideoDuration(): number {
  const videoData = billingStats.value.byType?.second
  return videoData ? videoData.quantity : 0
}

// 获取当前周期
function getCurrentCycle(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  if (selectedPeriod.value === 'monthly') {
    return `${year}-${String(month).padStart(2, '0')}`
  } else if (selectedPeriod.value === 'quarterly') {
    const quarter = Math.ceil(month / 3)
    return `${year}-Q${quarter}`
  } else {
    return `${year}`
  }
}

// 加载统计数据
async function loadStatistics() {
  try {
    loading.value = true
    
    const { data } = await getBillingStatistics({
      period: selectedPeriod.value,
    })
    
    if (data) {
      billingStats.value = data
    }
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    ElMessage.error(error.message || '加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 加载账单数据
async function loadBillData() {
  try {
    tableLoading.value = true
    
    const cycle = getCurrentCycle()
    const { data } = await getMyBill(cycle)
    
    if (data) {
      currentBill.value = data
      billRecords.value = data.records || []
    }
  } catch (error: any) {
    console.error('加载账单数据失败:', error)
    ElMessage.error(error.message || '加载账单数据失败')
  } finally {
    tableLoading.value = false
  }
}

// 加载趋势数据
async function loadTrendData() {
  try {
    const months = trendPeriod.value === 'monthly' ? 12 : trendPeriod.value === 'weekly' ? 12 : 30
    const { data } = await getMyBillingTrend(trendPeriod.value, months)
    
    if (data) {
      renderTrendChart(data.data)
    }
  } catch (error: any) {
    console.error('加载趋势数据失败:', error)
  }
}

// 渲染趋势图表
function renderTrendChart(trendData: Array<{ date: string; totalCost: number; totalCalls: number }>) {
  if (!trendChartRef.value) return
  
  if (!trendChart.value) {
    trendChart.value = echarts.init(trendChartRef.value)
  }
  
  const dates = trendData.map(d => d.date)
  const costs = trendData.map(d => d.totalCost)
  const calls = trendData.map(d => d.totalCalls)
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['费用', '调用次数'],
    },
    xAxis: {
      type: 'category',
      data: dates,
    },
    yAxis: [
      {
        type: 'value',
        name: '费用 ($)',
        position: 'left',
      },
      {
        type: 'value',
        name: '调用次数',
        position: 'right',
      },
    ],
    series: [
      {
        name: '费用',
        type: 'line',
        data: costs,
        smooth: true,
        yAxisIndex: 0,
        itemStyle: {
          color: '#409EFF',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ]),
        },
      },
      {
        name: '调用次数',
        type: 'bar',
        data: calls,
        yAxisIndex: 1,
        itemStyle: {
          color: '#67C23A',
        },
      },
    ],
  }
  
  trendChart.value.setOption(option)
}

// ==================== 事件处理 ====================
function handleRefresh() {
  loadStatistics()
  loadBillData()
  loadTrendData()
}

async function handleExportBill() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const userId = userInfo.id
    
    if (!userId) {
      ElMessage.error('用户未登录')
      return
    }
    
    const cycle = getCurrentCycle()
    const blob = await exportBillCSV(userId, cycle)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bill_${userId}_${cycle}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('账单导出成功')
  } catch (error: any) {
    console.error('导出账单失败:', error)
    ElMessage.error(error.message || '导出账单失败')
  }
}

async function handleExportCSV() {
  await handleExportBill()
}

function handleSearch() {
  currentPage.value = 1
}

function handleSortChange({ prop, order }: any) {
  if (!prop || !order) return
  
  billRecords.value.sort((a, b) => {
    const aValue = (a as any)[prop]
    const bValue = (b as any)[prop]
    
    if (order === 'ascending') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

function viewDetail(record: BillingRecord) {
  selectedRecord.value = record
  detailDialogVisible.value = true
}

function navigateToDetail(type: string) {
  ElMessage.info(`查看${type}详情`)
}

// ==================== 监听器 ====================
watch(selectedPeriod, () => {
  handleRefresh()
})

// ==================== 生命周期 ====================
onMounted(() => {
  handleRefresh()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    trendChart.value?.resize()
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.billing-center {
  padding: var(--spacing-2xl);
  
  .stats-section {
    margin-bottom: var(--spacing-6xl);
  }
  
  .trend-chart-card,
  .type-breakdown-card,
  .bill-details-card {
    margin-bottom: var(--spacing-4xl);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: 600;
      }
      
      .header-actions {
        display: flex;
        gap: var(--spacing-lg);
      }
    }
  }
  
  .type-breakdown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-4xl);
    
    .type-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-4xl);
      padding: var(--spacing-4xl);
      background: var(--bg-page);
      border-radius: var(--spacing-lg);
      border-left: 4px solid var(--color-primary);
      transition: all 0.3s;
      
      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
      
      &.type-token {
        border-left-color: var(--color-primary);
      }
      
      &.type-second {
        border-left-color: var(--color-warning);
      }
      
      &.type-count {
        border-left-color: var(--color-success);
      }
      
      &.type-character {
        border-left-color: var(--color-info);
      }
      
      .type-icon {
        font-size: var(--text-3xl);
        color: var(--text-secondary);
      }
      
      .type-content {
        flex: 1;
        
        h4 {
          margin: 0 0 var(--spacing-lg);
          font-size: var(--text-lg);
          font-weight: 600;
        }
        
        .type-stats {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          
          .stat-item {
            display: flex;
            justify-content: space-between;
            
            .label {
              color: var(--text-secondary);
              font-size: var(--text-sm);
            }
            
            .value {
              font-weight: 600;
              
              &.primary {
                color: var(--color-primary);
                font-size: var(--text-lg);
              }
            }
          }
        }
      }
      
      .type-chart {
        flex-shrink: 0;
      }
    }
  }
  
  .cost-value {
    color: var(--color-primary);
    font-weight: 600;
  }
  
  .detail-info {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
  }
  
  .pagination-container {
    margin-top: var(--spacing-4xl);
    display: flex;
    justify-content: flex-end;
  }
  
  .detail-dialog {
    .cost-value {
      font-size: var(--text-lg);
    }
  }
}
</style>

