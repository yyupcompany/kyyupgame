<template>
  <div class="personal-contribution-tab">
    <!-- 贡献统计卡片 -->
    <div class="contribution-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(card, index) in contributionCards" :key="index">
          <el-card class="contribution-card" :class="card.type">
            <div class="card-content">
              <div class="card-icon">
                <el-icon>
                  <component :is="card.icon"></component>
                </el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ card.value }}</div>
                <div class="card-label">{{ card.label }}</div>
                <div class="card-trend" :class="card.trendType">
                  <el-icon>
                    <component :is="getTrendIcon(card.trendType)"></component>
                  </el-icon>
                  {{ card.trend }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 贡献详情图表 -->
    <div class="contribution-charts">
      <el-row :gutter="20">
        <!-- 转介绍趋势图 -->
        <el-col :xs="24" :md="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>转介绍趋势</span>
                <el-date-picker
                  v-model="chartDateRange"
                  type="daterange"
                  size="small"
                  :shortcuts="chartDateShortcuts"
                  value-format="YYYY-MM-DD"
                  @change="loadChartData"
                />
              </div>
            </template>
            <div class="chart-container" v-loading="chartLoading">
              <!-- 这里应该集成实际的图表组件 -->
              <div class="chart-placeholder">
                <el-icon size="48"><TrendCharts /></el-icon>
                <p>转介绍数量趋势图表</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 奖励分布图 -->
        <el-col :xs="24" :md="12">
          <el-card class="chart-card">
            <template #header>
              <span>奖励分布</span>
            </template>
            <div class="chart-container" v-loading="chartLoading">
              <!-- 这里应该集成实际的图表组件 -->
              <div class="chart-placeholder">
                <el-icon size="48"><PieChart /></el-icon>
                <p>奖励类型分布图表</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 个人转介绍记录 -->
    <div class="personal-records">
      <el-card>
        <template #header>
          <div class="records-header">
            <span>我的转介绍记录</span>
            <div class="header-actions">
              <el-button size="small" @click="exportPersonalRecords">
                <el-icon><Download /></el-icon>
                导出记录
              </el-button>
              <el-button type="primary" size="small" @click="showShareDialog = true">
                <el-icon><Share /></el-icon>
                分享推荐码
              </el-button>
            </div>
          </div>
        </template>

        <div class="referral-summary">
          <div class="summary-item">
            <div class="summary-label">我的推荐码</div>
            <div class="summary-value">
              <code>{{ personalReferralCode }}</code>
              <el-button type="text" size="small" @click="copyReferralCode">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">推荐链接</div>
            <div class="summary-value">
              <el-input
                :value="referralLink"
                readonly
                size="small"
              >
                <template #append>
                  <el-button @click="copyReferralLink">复制</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <!-- 转介绍记录表格 -->
        <el-table
          v-loading="tableLoading"
          :data="referralRecords"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="refereeName" label="被推荐人" width="120" />
          <el-table-column prop="referralDate" label="推荐时间" width="110">
            <template #default="{ row }">
              {{ formatDate(row.referralDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="currentStage" label="当前阶段" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ getStageLabel(row.currentStage) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="potentialReward" label="预计奖励" width="100">
            <template #default="{ row }">
              <span class="reward-amount">¥{{ row.potentialReward }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleSendReminder(row)"
                v-if="row.status === 'pending'"
              >
                发送提醒
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="viewReferralDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadReferralRecords"
            @current-change="loadReferralRecords"
          />
        </div>
      </el-card>
    </div>

    <!-- 分享推荐码对话框 -->
    <el-dialog
      v-model="showShareDialog"
      title="分享推荐码"
      width="500px"
    >
      <div class="share-content">
        <div class="qr-code">
          <!-- 这里应该集成二维码生成组件 -->
          <div class="qr-placeholder">
            <el-icon size="64"><Grid /></el-icon>
          </div>
        </div>
        <div class="share-info">
          <h4>分享您的推荐码</h4>
          <p>{{ personalReferralCode }}</p>
          <div class="share-actions">
            <el-button type="primary" @click="shareToWechat">
              <el-icon><ChatDotRound /></el-icon>
              分享到微信
            </el-button>
            <el-button @click="downloadQRCode">
              <el-icon><Download /></el-icon>
              下载二维码
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  TrendCharts,
  PieChart,
  Download,
  Share,
  CopyDocument,
  ArrowUp,
  ArrowDown,
  ChatDotRound,
  Grid
} from '@element-plus/icons-vue'

import MarketingPerformanceService from '@/services/marketing-performance.service'

// Props
interface Props {
  dateRange: [string, string]
  loading: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const contributionCards = ref([
  {
    label: '累计转介绍',
    value: 0,
    icon: 'UserPlus',
    type: 'primary',
    trend: '+0%',
    trendType: 'up'
  },
  {
    label: '累计奖励',
    value: '¥0',
    icon: 'Money',
    type: 'success',
    trend: '+0%',
    trendType: 'up'
  },
  {
    label: '转化率',
    value: '0%',
    icon: 'TrendCharts',
    type: 'warning',
    trend: '+0%',
    trendType: 'up'
  },
  {
    label: '活跃度',
    value: 0,
    icon: 'Star',
    type: 'info',
    trend: '+0%',
    trendType: 'stable'
  }
])

const chartLoading = ref(false)
const chartDateRange = ref<[string, string]>(props.dateRange)
const tableLoading = ref(false)
const referralRecords = ref([])
const showShareDialog = ref(false)

const personalReferralCode = computed(() => 'EDU2024' + Math.random().toString(36).substr(2, 6).toUpperCase())
const referralLink = computed(() => `${window.location.origin}/referral?code=${personalReferralCode.value}`)

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 图表日期快捷选项
const chartDateShortcuts = [
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 加载个人贡献数据
const loadPersonalContribution = async () => {
  try {
    const response = await MarketingPerformanceService.getPersonalContribution({
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    })

    // 更新贡献卡片数据
    contributionCards.value[0].value = response.totalReferrals || 0
    contributionCards.value[0].trend = response.referralsTrend || '+0%'

    contributionCards.value[1].value = `¥${response.totalRewards || 0}`
    contributionCards.value[1].trend = response.rewardsTrend || '+0%'

    contributionCards.value[2].value = `${response.conversionRate || 0}%`
    contributionCards.value[2].trend = response.conversionTrend || '+0%'

    contributionCards.value[3].value = response.activityScore || 0
    contributionCards.value[3].trend = response.activityTrend || '+0%'

  } catch (error) {
    console.error('加载个人贡献数据失败:', error)
  }
}

// 加载图表数据
const loadChartData = async () => {
  try {
    chartLoading.value = true
    // TODO: 加载实际的图表数据
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    chartLoading.value = false
  }
}

// 加载转介绍记录
const loadReferralRecords = async () => {
  try {
    tableLoading.value = true

    const params = {
      page: pagination.page,
      size: pagination.size,
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    }

    const response = await MarketingPerformanceService.getPersonalReferralRecords(params)
    referralRecords.value = response.data
    pagination.total = response.total
  } catch (error) {
    console.error('加载转介绍记录失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 复制推荐码
const copyReferralCode = async () => {
  try {
    await navigator.clipboard.writeText(personalReferralCode.value)
    ElMessage.success('推荐码已复制')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 复制推荐链接
const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    ElMessage.success('推荐链接已复制')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 发送提醒
const handleSendReminder = async (record: any) => {
  try {
    await MarketingPerformanceService.sendReminder(record.id)
    ElMessage.success('提醒已发送')
  } catch (error) {
    ElMessage.error('发送提醒失败')
  }
}

// 查看转介绍详情
const viewReferralDetail = (record: any) => {
  // TODO: 打开详情对话框
  ElMessage.info('查看转介绍详情功能开发中')
}

// 导出个人记录
const exportPersonalRecords = async () => {
  try {
    await MarketingPerformanceService.exportPersonalRecords({
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    })
    ElMessage.success('记录导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 分享到微信
const shareToWechat = () => {
  // TODO: 实现微信分享
  ElMessage.info('微信分享功能开发中')
}

// 下载二维码
const downloadQRCode = () => {
  // TODO: 实现二维码下载
  ElMessage.info('二维码下载功能开发中')
}

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getStageLabel = (stage: string) => {
  const labelMap = {
    'link_clicked': '已点击',
    'visited': '已到访',
    'trial_attended': '已体验',
    'enrolled': '已报名'
  }
  return labelMap[stage] || stage
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    pending: 'warning',
    converted: 'success',
    expired: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    pending: '进行中',
    converted: '已转化',
    expired: '已过期'
  }
  return labelMap[status] || status
}

const getTrendIcon = (trendType: string) => {
  return trendType === 'up' ? ArrowUp : trendType === 'down' ? ArrowDown : TrendCharts
}

// 组件挂载时加载数据
onMounted(() => {
  loadPersonalContribution()
  loadChartData()
  loadReferralRecords()
})
</script>

<style scoped lang="scss">
.personal-contribution-tab {
  .contribution-cards {
    margin-bottom: var(--text-2xl);

    .contribution-card {
      .card-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);

        .card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          font-size: var(--text-xl);
        }

        .card-info {
          flex: 1;

          .card-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .card-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .card-trend {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--text-xs);
            font-weight: 500;

            &.up {
              color: var(--success-color);
            }

            &.down {
              color: var(--danger-color);
            }

            &.stable {
              color: var(--text-secondary);
            }
          }
        }
      }

      &.primary .card-icon {
        background: var(--primary-color);
      }

      &.success .card-icon {
        background: var(--success-color);
      }

      &.warning .card-icon {
        background: var(--warning-color);
      }

      &.info .card-icon {
        background: var(--info-color);
      }
    }
  }

  .contribution-charts {
    margin-bottom: var(--text-2xl);

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .el-date-picker {
          width: 200px;
        }
      }

      .chart-container {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;

        .chart-placeholder {
          text-align: center;
          color: var(--text-secondary);

          .el-icon {
            margin-bottom: var(--spacing-lg);
            opacity: 0.5;
          }
        }
      }
    }
  }

  .personal-records {
    .records-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .referral-summary {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--text-xl);
      margin-bottom: var(--text-xl);
      padding: var(--text-xl);
      background: var(--bg-gray);
      border-radius: var(--text-sm);

      .summary-item {
        .summary-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .summary-value {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          code {
            padding: var(--spacing-xs) var(--spacing-sm);
            background: var(--bg-card);
            border-radius: var(--radius-sm);
            font-family: 'Courier New', monospace;
            font-weight: 600;
            color: var(--primary-color);
          }
        }
      }
    }

    :deep(.el-table) {
      .reward-amount {
        color: var(--success-color);
        font-weight: 600;
      }
    }

    .pagination-wrapper {
      margin-top: var(--text-xl);
      display: flex;
      justify-content: center;
    }
  }

  .share-content {
    display: flex;
    gap: var(--text-xl);
    align-items: center;

    .qr-code {
      .qr-placeholder {
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed var(--border-color);
        border-radius: var(--text-sm);
        color: var(--text-secondary);
      }
    }

    .share-info {
      flex: 1;

      h4 {
        margin-bottom: var(--spacing-lg);
        color: var(--text-primary);
      }

      p {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: var(--text-xl);
      }

      .share-actions {
        display: flex;
        gap: var(--spacing-lg);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .personal-contribution-tab {
    .contribution-cards {
      .el-row {
        .el-col {
          margin-bottom: var(--spacing-lg);
        }
      }
    }

    .referral-summary {
      grid-template-columns: 1fr !important;
    }

    .share-content {
      flex-direction: column;
      text-align: center;

      .qr-code {
        margin: 0 auto;
      }
    }
  }
}
</style>