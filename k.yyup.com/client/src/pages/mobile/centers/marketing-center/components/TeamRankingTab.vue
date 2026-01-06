<template>
  <div class="mobile-team-ranking-tab">
    <!-- 排名类型选择 -->
    <div class="ranking-controls">
      <van-tabs v-model:active="rankingType" @change="handleRankingTypeChange" sticky>
        <van-tab title="转介绍" name="referrals">
          <template #title>
            <van-icon name="friends-o" />
            <span>转介绍</span>
          </template>
        </van-tab>
        <van-tab title="奖励金额" name="rewards">
          <template #title>
            <van-icon name="gold-coin-o" />
            <span>奖励</span>
          </template>
        </van-tab>
        <van-tab title="转化率" name="conversion">
          <template #title>
            <van-icon name="chart-trending-o" />
            <span>转化率</span>
          </template>
        </van-tab>
        <van-tab title="综合得分" name="comprehensive">
          <template #title>
            <van-icon name="medal-o" />
            <span>综合</span>
          </template>
        </van-tab>
      </van-tabs>

      <!-- 时间筛选 -->
      <div class="time-filter">
        <van-dropdown-menu>
          <van-dropdown-item
            v-model="timeFilter"
            :options="timeOptions"
            @change="handleTimeFilterChange"
          />
        </van-dropdown-menu>
      </div>
    </div>

    <!-- 排名统计卡片 -->
    <div class="ranking-summary">
      <div class="summary-card total">
        <div class="summary-icon">
          <van-icon name="friends-o" />
        </div>
        <div class="summary-content">
          <div class="summary-value">{{ rankingStats.totalMembers }}</div>
          <div class="summary-label">参与人数</div>
        </div>
      </div>
      <div class="summary-card average">
        <div class="summary-icon">
          <van-icon name="chart-trending-o" />
        </div>
        <div class="summary-content">
          <div class="summary-value">{{ getAverageValue() }}</div>
          <div class="summary-label">平均水平</div>
        </div>
      </div>
      <div class="summary-card growth">
        <div class="summary-icon">
          <van-icon name="arrow-up" />
        </div>
        <div class="summary-content">
          <div class="summary-value">+{{ rankingStats.growthRate }}%</div>
          <div class="summary-label">环比增长</div>
        </div>
      </div>
    </div>

    <!-- 排名列表 -->
    <div class="ranking-content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadMore"
        >
          <div
            v-for="(member, index) in rankingList"
            :key="member.id"
            class="ranking-item"
            :class="{ 'top-three': index < 3, 'self': member.isCurrentUser }"
            @click="handleMemberClick(member)"
          >
            <!-- 排名标识 -->
            <div class="ranking-badge">
              <div v-if="index < 3" class="medal" :class="getMedalClass(index)">
                <van-icon :name="getMedalIcon(index)" />
              </div>
              <div v-else class="ranking-number">{{ index + 1 }}</div>
            </div>

            <!-- 用户信息 -->
            <div class="member-info">
              <div class="member-avatar">
                <van-image
                  :src="member.avatar || '/default-avatar.png'"
                  class="avatar"
                  round
                  width="48"
                  height="48"
                />
                <div v-if="member.isCurrentUser" class="current-user-badge">
                  <van-tag type="primary" size="small">我</van-tag>
                </div>
              </div>
              <div class="member-details">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-role">
                  <van-tag :type="getRoleTagType(member.role)" size="small">
                    {{ getRoleLabel(member.role) }}
                  </van-tag>
                </div>
              </div>
            </div>

            <!-- 排名数据 -->
            <div class="ranking-data">
              <div class="main-value">
                {{ getRankingValue(member) }}
                <span class="unit">{{ getRankingUnit() }}</span>
              </div>
              <div class="sub-stats">
                <span class="stat">转介绍: {{ member.successfulReferrals }}</span>
                <span class="stat">转化率: {{ member.conversionRate }}%</span>
              </div>
            </div>

            <!-- 趋势指示器 -->
            <div class="trend-indicator" :class="member.trend">
              <van-icon :name="getTrendIcon(member.trend)" />
              <span class="trend-value">{{ member.trendValue || '0%' }}</span>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && rankingList.length === 0"
      description="暂无排名数据"
      image="search"
    >
      <van-button type="primary" size="small" @click="loadRankingData">
        刷新数据
      </van-button>
    </van-empty>

    <!-- 成员详情弹窗 -->
    <van-action-sheet
      v-model:show="showMemberDetail"
      :title="selectedMember?.name"
      :actions="memberActions"
      cancel-text="关闭"
    />

    <!-- 排名对比弹窗 -->
    <van-dialog
      v-model:show="showCompareDialog"
      title="排名对比"
      :show-confirm-button="false"
      class="compare-dialog"
    >
      <div class="compare-content">
        <div class="compare-item">
          <div class="compare-label">我的排名</div>
          <div class="compare-value">
            #{{ currentUserRanking || '-' }}
          </div>
        </div>
        <div class="compare-item">
          <div class="compare-label">平均排名</div>
          <div class="compare-value">
            #{{ Math.ceil(rankingList.length / 2) }}
          </div>
        </div>
        <div class="compare-item">
          <div class="compare-label">距离上一名</div>
          <div class="compare-value">
            {{ getDistanceToPrevious() }}
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { showToast } from 'vant'
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
const rankingType = ref('referrals')
const timeFilter = ref('current_month')
const rankingList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const showMemberDetail = ref(false)
const selectedMember = ref(null)
const showCompareDialog = ref(false)

// 排名统计
const rankingStats = ref({
  totalMembers: 0,
  averageValue: 0,
  growthRate: 0
})

// 当前用户排名
const currentUserRanking = ref(0)

// 时间筛选选项
const timeOptions = [
  { text: '本月', value: 'current_month' },
  { text: '上月', value: 'last_month' },
  { text: '本季度', value: 'current_quarter' },
  { text: '本年', value: 'current_year' },
  { text: '全部时间', value: 'all_time' }
]

// 成员操作
const memberActions = computed(() => [
  {
    name: '查看详情',
    icon: 'eye-o',
    callback: () => viewMemberDetail()
  },
  {
    name: '发送消息',
    icon: 'chat-o',
    callback: () => sendMessage()
  },
  {
    name: '查看贡献',
    icon: 'chart-trending-o',
    callback: () => viewContribution()
  }
])

// 加载排名数据
const loadRankingData = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      currentPage.value = 1
      finished.value = false
    }

    const params = {
      type: rankingType.value,
      timeFilter: timeFilter.value,
      page: currentPage.value,
      size: 10,
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    }

    const response = await MarketingPerformanceService.getTeamRanking(params)

    if (isRefresh || currentPage.value === 1) {
      rankingList.value = response.data
      rankingStats.value = response.stats
      currentUserRanking.value = response.currentUserRanking
    } else {
      rankingList.value = [...rankingList.value, ...response.data]
    }

    finished.value = response.data.length < 10
  } catch (error) {
    console.error('加载排名数据失败:', error)
    showToast('加载排名数据失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载更多
const loadMore = async () => {
  if (finished.value) return

  currentPage.value++
  await loadRankingData()
}

// 刷新
const onRefresh = async () => {
  refreshing.value = true
  await loadRankingData(true)
}

// 处理排名类型变化
const handleRankingTypeChange = () => {
  loadRankingData(true)
}

// 处理时间筛选变化
const handleTimeFilterChange = () => {
  loadRankingData(true)
}

// 处理成员点击
const handleMemberClick = (member: any) => {
  selectedMember.value = member
  if (member.isCurrentUser) {
    showCompareDialog.value = true
  } else {
    showMemberDetail.value = true
  }
}

// 获取排名值
const getRankingValue = (member: any) => {
  switch (rankingType.value) {
    case 'referrals':
      return member.successfulReferrals
    case 'rewards':
      return `¥${member.totalRewards}`
    case 'conversion':
      return `${member.conversionRate}%`
    case 'comprehensive':
      return member.comprehensiveScore
    default:
      return 0
  }
}

// 获取排名单位
const getRankingUnit = () => {
  switch (rankingType.value) {
    case 'referrals':
      return '人'
    case 'rewards':
      return ''
    case 'conversion':
      return ''
    case 'comprehensive':
      return '分'
    default:
      return ''
  }
}

// 获取排名标签
const getRankingLabel = () => {
  const labelMap = {
    referrals: '转介绍数',
    rewards: '奖励金额',
    conversion: '转化率',
    comprehensive: '综合得分'
  }
  return labelMap[rankingType.value] || ''
}

// 获取平均值
const getAverageValue = () => {
  switch (rankingType.value) {
    case 'referrals':
      return Math.round(rankingStats.value.averageValue)
    case 'rewards':
      return `¥${Math.round(rankingStats.value.averageValue)}`
    case 'conversion':
      return `${Math.round(rankingStats.value.averageValue)}%`
    case 'comprehensive':
      return Math.round(rankingStats.value.averageValue)
    default:
      return 0
  }
}

// 获取奖牌样式
const getMedalClass = (index: number) => {
  const classMap = ['gold', 'silver', 'bronze']
  return classMap[index] || ''
}

// 获取奖牌图标
const getMedalIcon = (index: number) => {
  const iconMap = ['medal', 'medal-o', 'friends-o']
  return iconMap[index] || 'medal'
}

// 获取趋势图标
const getTrendIcon = (trend: string) => {
  const iconMap = {
    up: 'arrow-up',
    down: 'arrow-down',
    stable: 'minus'
  }
  return iconMap[trend] || 'minus'
}

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  const typeMap = {
    teacher: 'primary',
    parent: 'success',
    principal: 'warning'
  }
  return typeMap[role] || 'default'
}

// 获取角色标签
const getRoleLabel = (role: string) => {
  const labelMap = {
    teacher: '教师',
    parent: '家长',
    principal: '园长'
  }
  return labelMap[role] || role
}

// 获取距离上一名的差距
const getDistanceToPrevious = () => {
  if (!currentUserRanking.value || currentUserRanking.value <= 1) {
    return '已领先'
  }

  const currentIndex = rankingList.value.findIndex(member => member.isCurrentUser)
  if (currentIndex > 0) {
    const previousMember = rankingList.value[currentIndex - 1]
    const currentUser = rankingList.value[currentIndex]

    switch (rankingType.value) {
      case 'referrals':
        return `${previousMember.successfulReferrals - currentUser.successfulReferrals}人`
      case 'rewards':
        return `¥${previousMember.totalRewards - currentUser.totalRewards}`
      case 'conversion':
        return `${(previousMember.conversionRate - currentUser.conversionRate).toFixed(1)}%`
      case 'comprehensive':
        return `${previousMember.comprehensiveScore - currentUser.comprehensiveScore}分`
      default:
        return '-'
    }
  }

  return '-'
}

// 成员操作
const viewMemberDetail = () => {
  showToast(`查看 ${selectedMember.value.name} 的详情`)
}

const sendMessage = () => {
  showToast(`发送消息给 ${selectedMember.value.name}`)
}

const viewContribution = () => {
  showToast(`查看 ${selectedMember.value.name} 的贡献详情`)
}

// 监听日期范围变化
watch(() => props.dateRange, () => {
  loadRankingData(true)
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  loadRankingData(true)
})
</script>

<style scoped lang="scss">
@use '@/pages/mobile/styles/mobile-design-tokens.scss' as *;

.mobile-team-ranking-tab {
  padding: var(--spacing-md);

  // 排名控制
  .ranking-controls {
    margin-bottom: var(--spacing-lg);

    :deep(.van-tabs__wrap) {
      margin-bottom: var(--spacing-md);
    }

    .time-filter {
      :deep(.van-dropdown-menu) {
        height: 40px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: var(--radius-md);
      }
    }
  }

  // 排名统计卡片
  .ranking-summary {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);

    .summary-card {
      flex: 1;
      background: var(--bg-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .summary-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: var(--text-lg);
        color: white;

        .van-icon {
          font-size: var(--text-lg);
        }
      }

      .summary-content {
        flex: 1;

        .summary-value {
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .summary-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
      }

      &.total .summary-icon {
        background: var(--primary-color);
      }

      &.average .summary-icon {
        background: var(--warning-color);
      }

      &.growth .summary-icon {
        background: var(--success-color);
      }
    }
  }

  // 排名列表
  .ranking-content {
    .ranking-item {
      background: var(--bg-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;

      &.top-three {
        border: 2px solid var(--warning-color);
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, var(--bg-color) 100%);
      }

      &.self {
        border: 2px solid var(--primary-color);
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, var(--bg-color) 100%);
      }

      .ranking-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;

        .medal {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-lg);
          color: white;
          font-weight: var(--font-bold);

          &.gold {
            background: linear-gradient(135deg, #FFD700, #FFA500);
          }

          &.silver {
            background: linear-gradient(135deg, #C0C0C0, #808080);
          }

          &.bronze {
            background: linear-gradient(135deg, #CD7F32, #8B4513);
          }

          .van-icon {
            font-size: var(--text-lg);
          }
        }

        .ranking-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-color-page);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-bold);
          color: var(--text-primary);
          font-size: var(--text-sm);
        }
      }

      .member-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .member-avatar {
          position: relative;

          .avatar {
            border: 2px solid var(--border-light);
          }

          .current-user-badge {
            position: absolute;
            top: -4px;
            right: -4px;
          }
        }

        .member-details {
          .member-name {
            font-size: var(--text-base);
            font-weight: var(--font-medium);
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .member-role {
            :deep(.van-tag) {
              font-size: var(--text-xs);
            }
          }
        }
      }

      .ranking-data {
        text-align: right;

        .main-value {
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);

          .unit {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            font-weight: var(--font-normal);
          }
        }

        .sub-stats {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);

          .stat {
            font-size: var(--text-xs);
            color: var(--text-secondary);
          }
        }
      }

      .trend-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);

        .van-icon {
          font-size: var(--text-sm);
        }

        .trend-value {
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
        }

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

  // 对比弹窗
  .compare-dialog {
    :deep(.van-dialog) {
      border-radius: var(--radius-lg);
    }

    .compare-content {
      padding: var(--spacing-lg);

      .compare-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md) 0;
        border-bottom: 1px solid var(--border-light);

        &:last-child {
          border-bottom: none;
        }

        .compare-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .compare-value {
          font-size: var(--text-base);
          font-weight: var(--font-bold);
          color: var(--primary-color);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xs)) {
  .mobile-team-ranking-tab {
    padding: var(--spacing-sm);

    .ranking-summary {
      flex-direction: column;

      .summary-card {
        .summary-icon {
          width: 32px;
          height: 32px;
        }

        .summary-content {
          .summary-value {
            font-size: var(--text-base);
          }
        }
      }
    }

    .ranking-content {
      .ranking-item {
        padding: var(--spacing-sm);
        gap: var(--spacing-sm);

        .ranking-badge {
          width: 32px;
          height: 32px;

          .medal {
            width: 28px;
            height: 28px;

            .van-icon {
              font-size: var(--text-base);
            }
          }

          .ranking-number {
            width: 28px;
            height: 28px;
            font-size: var(--text-xs);
          }
        }

        .member-info {
          .member-avatar {
            .avatar {
              width: 40px;
              height: 40px;
            }
          }

          .member-details {
            .member-name {
              font-size: var(--text-sm);
            }
          }
        }

        .ranking-data {
          .main-value {
            font-size: var(--text-base);
          }

          .sub-stats {
            .stat {
              font-size: 10px;
            }
          }
        }
      }
    }
  }
}
</style>