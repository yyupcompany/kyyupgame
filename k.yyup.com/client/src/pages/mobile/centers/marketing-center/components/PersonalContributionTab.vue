<template>
  <div class="mobile-personal-contribution-tab">
    <!-- 贡献统计卡片 -->
    <div class="contribution-cards">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item
          v-for="(card, index) in contributionCards"
          :key="index"
          class="contribution-card"
          :class="card.type"
          @click="handleCardClick(card)"
        >
          <div class="card-content">
            <div class="card-icon">
              <van-icon :name="getMobileIcon(card.icon)" />
            </div>
            <div class="card-info">
              <div class="card-value">{{ card.value }}</div>
              <div class="card-label">{{ card.label }}</div>
              <div class="card-trend" :class="card.trendType">
                <van-icon :name="getTrendIcon(card.trendType)" />
                <span>{{ card.trend }}</span>
              </div>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <van-collapse v-model="activeCharts" accordion>
        <!-- 转介绍趋势图 -->
        <van-collapse-item name="trend" title="转介绍趋势">
          <template #title>
            <div class="chart-title">
              <van-icon name="chart-trending-o" />
              <span>转介绍趋势</span>
            </div>
          </template>
          <div class="chart-content">
            <div class="date-filter">
              <van-button
                size="small"
                :type="chartPeriod === '7d' ? 'primary' : 'default'"
                @click="setChartPeriod('7d')"
              >
                最近7天
              </van-button>
              <van-button
                size="small"
                :type="chartPeriod === '30d' ? 'primary' : 'default'"
                @click="setChartPeriod('30d')"
              >
                最近30天
              </van-button>
            </div>
            <div class="chart-placeholder" v-loading="chartLoading">
              <van-icon name="chart-trending-o" size="48" />
              <p>转介绍数量趋势图表</p>
            </div>
          </div>
        </van-collapse-item>

        <!-- 奖励分布图 -->
        <van-collapse-item name="distribution" title="奖励分布">
          <template #title>
            <div class="chart-title">
              <van-icon name="gold-coin-o" />
              <span>奖励分布</span>
            </div>
          </template>
          <div class="chart-content">
            <div class="chart-placeholder" v-loading="chartLoading">
              <van-icon name="pie-chart-o" size="48" />
              <p>奖励类型分布图表</p>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- 推荐信息 -->
    <div class="referral-info-section">
      <van-cell-group title="我的推荐信息">
        <van-cell title="我的推荐码" :value="personalReferralCode" is-link>
          <template #right-icon>
            <van-button size="mini" type="primary" @click.stop="copyReferralCode">
              复制
            </van-button>
          </template>
        </van-cell>
        <van-cell title="推荐链接" :value="referralLinkShort" is-link @click="copyReferralLink">
          <template #right-icon>
            <van-icon name="copy" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 个人转介绍记录 -->
    <div class="records-section">
      <div class="section-header">
        <h3>我的转介绍记录</h3>
        <div class="header-actions">
          <van-button size="small" plain @click="showShareAction = true">
            <van-icon name="share-o" />
            分享
          </van-button>
          <van-button size="small" plain @click="exportRecords">
            <van-icon name="down" />
            导出
          </van-button>
        </div>
      </div>

      <!-- 记录列表 -->
      <div class="records-list" v-if="referralRecords.length > 0">
        <van-swipe-cell v-for="record in referralRecords" :key="record.id">
          <div class="record-card" @click="viewReferralDetail(record)">
            <div class="record-header">
              <div class="referee-info">
                <van-image
                  :src="record.refereeAvatar || '/default-avatar.png'"
                  class="avatar"
                  round
                  width="40"
                  height="40"
                />
                <div class="info">
                  <div class="name">{{ record.refereeName }}</div>
                  <div class="date">{{ formatDate(record.referralDate) }}</div>
                </div>
              </div>
              <div class="reward-info">
                <div class="amount">¥{{ record.potentialReward }}</div>
                <van-tag :type="getStatusTagType(record.status)" size="small">
                  {{ getStatusLabel(record.status) }}
                </van-tag>
              </div>
            </div>
            <div class="record-footer">
              <div class="stage-info">
                <van-progress
                  :percentage="getConversionProgress(record.currentStage)"
                  :show-pivot="false"
                  stroke-width="4"
                />
                <span class="stage-text">{{ getStageLabel(record.currentStage) }}</span>
              </div>
              <van-button
                v-if="record.status === 'pending'"
                size="mini"
                type="primary"
                @click.stop="handleSendReminder(record)"
              >
                发送提醒
              </van-button>
            </div>
          </div>
          <template #right>
            <van-button
              square
              type="danger"
              text="删除"
              @click="handleDeleteRecord(record)"
            />
          </template>
        </van-swipe-cell>
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="暂无转介绍记录" image="search" />

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <van-button
          type="primary"
          plain
          :loading="loadingMore"
          @click="loadMoreRecords"
        >
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </van-button>
      </div>
    </div>

    <!-- 分享操作面板 -->
    <van-action-sheet
      v-model:show="showShareAction"
      :actions="shareActions"
      @select="handleShareSelect"
      cancel-text="取消"
    />

    <!-- 推荐码分享对话框 -->
    <van-dialog
      v-model:show="showShareDialog"
      title="分享推荐码"
      :show-confirm-button="false"
    >
      <div class="share-content">
        <div class="qr-code">
          <div class="qr-placeholder">
            <van-icon name="qr" size="64" />
            <p>扫码分享</p>
          </div>
        </div>
        <div class="share-info">
          <h4>{{ personalReferralCode }}</h4>
          <p>分享您的专属推荐码</p>
          <div class="share-actions">
            <van-button type="primary" @click="shareToWechat">
              <van-icon name="wechat" />
              微信分享
            </van-button>
            <van-button @click="downloadQRCode">
              <van-icon name="down" />
              下载二维码
            </van-button>
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
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

const activeCharts = ref(['trend'])
const chartPeriod = ref('7d')
const chartLoading = ref(false)
const referralRecords = ref([])
const showShareAction = ref(false)
const showShareDialog = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)

const personalReferralCode = computed(() => 'EDU2024' + Math.random().toString(36).substr(2, 6).toUpperCase())
const referralLink = computed(() => `${window.location.origin}/referral?code=${personalReferralCode.value}`)
const referralLinkShort = computed(() => `${window.location.host}/referral`)

// 分享操作
const shareActions = [
  { name: '分享到微信', icon: 'wechat' },
  { name: '复制推荐码', icon: 'description' },
  { name: '复制推荐链接', icon: 'link' },
  { name: '下载二维码', icon: 'qr' }
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

// 加载转介绍记录
const loadReferralRecords = async (page = 1, isLoadMore = false) => {
  try {
    if (!isLoadMore) {
      currentPage.value = 1
      hasMore.value = true
    }

    const params = {
      page: currentPage.value,
      size: 10, // 移动端每页10条
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    }

    const response = await MarketingPerformanceService.getPersonalReferralRecords(params)

    if (isLoadMore) {
      referralRecords.value = [...referralRecords.value, ...response.data]
    } else {
      referralRecords.value = response.data
    }

    hasMore.value = response.data.length === 10
  } catch (error) {
    console.error('加载转介绍记录失败:', error)
    showToast('加载记录失败')
  }
}

// 加载更多记录
const loadMoreRecords = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  currentPage.value++
  await loadReferralRecords(currentPage.value, true)
  loadingMore.value = false
}

// 设置图表周期
const setChartPeriod = (period: string) => {
  chartPeriod.value = period
  loadChartData()
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

// 复制推荐码
const copyReferralCode = async () => {
  try {
    await navigator.clipboard.writeText(personalReferralCode.value)
    showToast('推荐码已复制')
  } catch (error) {
    showToast('复制失败，请手动复制')
  }
}

// 复制推荐链接
const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    showToast('推荐链接已复制')
  } catch (error) {
    showToast('复制失败，请手动复制')
  }
}

// 发送提醒
const handleSendReminder = async (record: any) => {
  try {
    await MarketingPerformanceService.sendReminder(record.id)
    showToast('提醒已发送')
  } catch (error) {
    showToast('发送提醒失败')
  }
}

// 查看转介绍详情
const viewReferralDetail = (record: any) => {
  showToast('查看转介绍详情功能开发中')
}

// 删除记录
const handleDeleteRecord = async (record: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除 ${record.refereeName} 的转介绍记录吗？`
    })

    // TODO: 调用删除API
    showToast('删除成功')
    loadReferralRecords()
  } catch (error) {
    // 用户取消
  }
}

// 导出记录
const exportRecords = async () => {
  try {
    await MarketingPerformanceService.exportPersonalRecords({
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    })
    showToast('记录导出成功')
  } catch (error) {
    showToast('导出失败')
  }
}

// 处理分享选择
const handleShareSelect = (action: any) => {
  switch (action.name) {
    case '分享到微信':
      shareToWechat()
      break
    case '复制推荐码':
      copyReferralCode()
      break
    case '复制推荐链接':
      copyReferralLink()
      break
    case '下载二维码':
      showShareDialog.value = true
      break
  }
}

// 分享到微信
const shareToWechat = () => {
  showToast('微信分享功能开发中')
}

// 下载二维码
const downloadQRCode = () => {
  showToast('二维码下载功能开发中')
}

// 处理卡片点击
const handleCardClick = (card: any) => {
  showToast(`查看${card.label}详情`)
}

// 工具函数
const getMobileIcon = (iconName: string) => {
  const iconMap: Record<string, string> = {
    'UserPlus': 'friends-o',
    'Money': 'gold-coin-o',
    'TrendCharts': 'chart-trending-o',
    'Star': 'star-o',
    'ArrowUp': 'arrow-up',
    'ArrowDown': 'arrow-down'
  }
  return iconMap[iconName] || 'info-o'
}

const getTrendIcon = (trendType: string) => {
  if (trendType === 'up') return 'arrow-up'
  if (trendType === 'down') return 'arrow-down'
  return 'minus'
}

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
    expired: 'default'
  }
  return typeMap[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    pending: '进行中',
    converted: '已转化',
    expired: '已过期'
  }
  return labelMap[status] || status
}

const getConversionProgress = (stage: string) => {
  const stageMap = {
    'link_clicked': 20,
    'visited': 40,
    'trial_attended': 60,
    'enrolled': 100
  }
  return stageMap[stage] || 0
}

// 组件挂载时加载数据
onMounted(() => {
  loadPersonalContribution()
  loadChartData()
  loadReferralRecords()
})
</script>

<style scoped lang="scss">
@use '@/pages/mobile/styles/mobile-design-tokens.scss' as *;

.mobile-personal-contribution-tab {
  padding: var(--spacing-md);

  // 贡献统计卡片
  .contribution-cards {
    margin-bottom: var(--text-2xl);

    .contribution-card {
      background: var(--bg-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-bottom: var(--spacing-sm);
          font-size: var(--text-xl);
          color: white;

          .van-icon {
            font-size: var(--text-xl);
          }
        }

        .card-info {
          flex: 1;

          .card-value {
            font-size: var(--text-xl);
            font-weight: var(--font-bold);
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
            justify-content: center;
            gap: var(--spacing-xs);
            font-size: var(--text-xs);
            font-weight: var(--font-medium);

            &.up {
              color: var(--success-color);
            }

            &.down {
              color: var(--danger-color);
            }

            &.stable {
              color: var(--text-secondary);
            }

            .van-icon {
              font-size: var(--text-xs);
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

  // 图表区域
  .charts-section {
    margin-bottom: var(--text-2xl);

    .chart-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: var(--font-medium);

      .van-icon {
        color: var(--primary-color);
      }
    }

    .chart-content {
      padding: var(--spacing-lg) 0;

      .date-filter {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
        justify-content: center;
      }

      .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--text-secondary);

        .van-icon {
          margin-bottom: var(--spacing-lg);
          opacity: 0.5;
        }

        p {
          font-size: var(--text-sm);
          margin: 0;
        }
      }
    }
  }

  // 推荐信息
  .referral-info-section {
    margin-bottom: var(--text-2xl);

    :deep(.van-cell-group__title) {
      color: var(--text-primary);
      font-weight: var(--font-medium);
    }
  }

  // 记录区域
  .records-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);

      h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: var(--font-medium);
        color: var(--text-primary);
      }

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .records-list {
      .record-card {
        background: var(--bg-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-md);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);

          .referee-info {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            .avatar {
              flex-shrink: 0;
            }

            .info {
              .name {
                font-size: var(--text-base);
                font-weight: var(--font-medium);
                color: var(--text-primary);
                margin-bottom: var(--spacing-xs);
              }

              .date {
                font-size: var(--text-xs);
                color: var(--text-secondary);
              }
            }
          }

          .reward-info {
            text-align: right;

            .amount {
              font-size: var(--text-lg);
            font-weight: var(--font-bold);
            color: var(--success-color);
            margin-bottom: var(--spacing-xs);
          }
        }
      }

      .record-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stage-info {
          flex: 1;
          margin-right: var(--spacing-md);

          .stage-text {
            font-size: var(--text-xs);
            color: var(--text-secondary);
            margin-top: var(--spacing-xs);
          }
        }
      }
    }

    .load-more {
      text-align: center;
      margin-top: var(--spacing-lg);

      .van-button {
        width: 100%;
        max-width: 200px;
      }
    }
  }

  // 分享内容
  .share-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-lg);

    .qr-code {
      .qr-placeholder {
        width: 120px;
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px dashed var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-lg);

        .van-icon {
          margin-bottom: var(--spacing-sm);
        }

        p {
          font-size: var(--text-sm);
          margin: 0;
        }
      }
    }

    .share-info {
      text-align: center;

      h4 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-xl);
        font-weight: var(--font-bold);
        color: var(--primary-color);
      }

      p {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-lg);
      }

      .share-actions {
        display: flex;
        gap: var(--spacing-md);

        .van-button {
          flex: 1;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xs)) {
  .mobile-personal-contribution-tab {
    padding: var(--spacing-sm);

    .contribution-cards {
      .contribution-card {
        padding: var(--spacing-md);

        .card-content {
          .card-icon {
            width: 40px;
            height: 40px;
          }

          .card-info {
            .card-value {
              font-size: var(--text-lg);
            }
          }
        }
      }
    }

    .records-section {
      .records-list {
        .record-card {
          padding: var(--spacing-md);

          .record-header {
            .referee-info {
              .info {
                .name {
                  font-size: var(--text-sm);
                }
              }
            }

            .reward-info {
              .amount {
                font-size: var(--text-base);
              }
            }
          }
        }
      }
    }
  }
}
</style>