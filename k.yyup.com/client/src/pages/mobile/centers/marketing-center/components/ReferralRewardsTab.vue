<template>
  <div class="mobile-referral-rewards-tab">
    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <van-search
        v-model="filters.search"
        placeholder="搜索推荐人或被推荐人"
        @search="handleSearch"
        @clear="handleFilterChange"
      />

      <div class="filter-tags">
        <van-tag
          :type="filters.role ? 'primary' : 'default'"
          closeable
          @click="showRoleFilter = true"
          @close="filters.role = ''; handleFilterChange()"
        >
          角色: {{ getRoleLabel(filters.role) || '全部' }}
        </van-tag>
        <van-tag
          :type="filters.status ? 'primary' : 'default'"
          closeable
          @click="showStatusFilter = true"
          @close="filters.status = ''; handleFilterChange()"
        >
          状态: {{ getStatusLabel(filters.status) || '全部' }}
        </van-tag>
      </div>
    </div>

    <!-- 奖励统计卡片 -->
    <div class="reward-summary">
      <div class="summary-card total">
        <div class="summary-icon">
          <van-icon name="gold-coin-o" />
        </div>
        <div class="summary-content">
          <div class="summary-value">¥{{ rewardStats.totalAmount || 0 }}</div>
          <div class="summary-label">累计奖励</div>
        </div>
      </div>
      <div class="summary-card pending">
        <div class="summary-icon">
          <van-icon name="clock-o" />
        </div>
        <div class="summary-content">
          <div class="summary-value">¥{{ rewardStats.pendingAmount || 0 }}</div>
          <div class="summary-label">待发放</div>
        </div>
      </div>
      <div class="summary-card count">
        <div class="summary-icon">
          <van-icon name="friends-o" />
        </div>
        <div class="summary-content">
          <div class="summary-value">{{ rewardStats totalCount || 0 }}</div>
          <div class="summary-label">奖励次数</div>
        </div>
      </div>
    </div>

    <!-- 奖励记录列表 -->
    <div class="rewards-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadMore"
        >
          <div
            v-for="reward in rewardList"
            :key="reward.id"
            class="reward-card"
            @click="handleViewDetail(reward)"
          >
            <!-- 卡片头部 -->
            <div class="reward-header">
              <div class="referrer-info">
                <van-image
                  :src="reward.referrerAvatar || '/default-avatar.png'"
                  class="avatar"
                  round
                  width="40"
                  height="40"
                />
                <div class="info">
                  <div class="name">
                    {{ reward.referrerName }}
                    <van-tag :type="getRoleTagType(reward.referrerRole)" size="small">
                      {{ getRoleLabel(reward.referrerRole) }}
                    </van-tag>
                  </div>
                  <div class="date">{{ formatDate(reward.referralDate) }}</div>
                </div>
              </div>
              <div class="reward-amount">
                <div class="amount">¥{{ reward.rewardAmount }}</div>
                <van-tag :type="getStatusTagType(reward.status)" size="small">
                  {{ getStatusLabel(reward.status) }}
                </van-tag>
              </div>
            </div>

            <!-- 被推荐人信息 -->
            <div class="referee-section">
              <div class="referee-info">
                <van-icon name="arrow-down" class="arrow-icon" />
                <span class="label">被推荐人:</span>
                <span class="name">{{ reward.refereeName }}</span>
              </div>
            </div>

            <!-- 奖励信息 -->
            <div class="reward-info">
              <div class="info-row">
                <span class="label">奖励类型:</span>
                <van-tag :type="getRewardTypeTagType(reward.rewardType)" size="small">
                  {{ getRewardTypeLabel(reward.rewardType) }}
                </van-tag>
              </div>
              <div class="info-row">
                <span class="label">转化阶段:</span>
                <div class="conversion-progress">
                  <van-progress
                    :percentage="getConversionProgress(reward.conversionStage)"
                    :show-pivot="false"
                    stroke-width="4"
                  />
                  <span class="stage-text">{{ getConversionStageLabel(reward.conversionStage) }}</span>
                </div>
              </div>
              <div class="info-row" v-if="reward.paidDate">
                <span class="label">发放日期:</span>
                <span class="date">{{ formatDate(reward.paidDate) }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="reward-actions" v-if="reward.status === 'pending'">
              <van-button
                type="success"
                size="small"
                @click.stop="handleApproveReward(reward)"
              >
                <van-icon name="check" />
                发放奖励
              </van-button>
              <van-button
                type="danger"
                size="small"
                plain
                @click.stop="handleCancelReward(reward)"
              >
                <van-icon name="cross" />
                取消
              </van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && rewardList.length === 0"
      description="暂无奖励记录"
      image="search"
    />

    <!-- 角色筛选弹窗 -->
    <van-action-sheet
      v-model:show="showRoleFilter"
      :actions="roleActions"
      @select="handleRoleSelect"
      cancel-text="取消"
    />

    <!-- 状态筛选弹窗 -->
    <van-action-sheet
      v-model:show="showStatusFilter"
      :actions="statusActions"
      @select="handleStatusSelect"
      cancel-text="取消"
    />

    <!-- 奖励详情对话框 -->
    <RewardDetailDialog
      v-model:show="showDetailDialog"
      :reward="selectedReward"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import RewardDetailDialog from './RewardDetailDialog.vue'
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
const rewardList = ref([])
const showDetailDialog = ref(false)
const selectedReward = ref(null)
const showRoleFilter = ref(false)
const showStatusFilter = ref(false)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)

// 筛选条件
const filters = reactive({
  role: '',
  status: '',
  search: ''
})

// 奖励统计
const rewardStats = ref({
  totalAmount: 0,
  pendingAmount: 0,
  totalCount: 0
})

// 筛选选项
const roleActions = [
  { name: '全部角色', value: '' },
  { name: '教师', value: 'teacher' },
  { name: '家长', value: 'parent' },
  { name: '园长', value: 'principal' }
]

const statusActions = [
  { name: '全部状态', value: '' },
  { name: '待发放', value: 'pending' },
  { name: '已发放', value: 'paid' },
  { name: '已取消', value: 'cancelled' }
]

// 加载奖励记录
const loadRewardList = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      currentPage.value = 1
      finished.value = false
    }

    const params = {
      page: currentPage.value,
      size: 10, // 移动端每页10条
      startDate: props.dateRange[0],
      endDate: props.dateRange[1],
      referrerRole: filters.role || undefined,
      status: filters.status || undefined,
      search: filters.search || undefined
    }

    const response = await MarketingPerformanceService.getReferralRewards(params)

    if (isRefresh || currentPage.value === 1) {
      rewardList.value = response.data
    } else {
      rewardList.value = [...rewardList.value, ...response.data]
    }

    finished.value = response.data.length < 10

    // 更新统计数据
    if (currentPage.value === 1) {
      updateRewardStats(response.data)
    }
  } catch (error) {
    console.error('加载奖励记录失败:', error)
    showToast('加载奖励记录失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 更新奖励统计
const updateRewardStats = (data: any[]) => {
  rewardStats.value = {
    totalAmount: data.reduce((sum, item) => sum + (item.rewardAmount || 0), 0),
    pendingAmount: data
      .filter(item => item.status === 'pending')
      .reduce((sum, item) => sum + (item.rewardAmount || 0), 0),
    totalCount: data.length
  }
}

// 加载更多
const loadMore = async () => {
  if (finished.value) return

  currentPage.value++
  await loadRewardList()
}

// 刷新
const onRefresh = async () => {
  refreshing.value = true
  await loadRewardList(true)
}

// 处理搜索
const handleSearch = () => {
  loadRewardList(true)
}

// 处理筛选变化
const handleFilterChange = () => {
  loadRewardList(true)
}

// 处理角色选择
const handleRoleSelect = (action: any) => {
  filters.role = action.value
  handleFilterChange()
}

// 处理状态选择
const handleStatusSelect = (action: any) => {
  filters.status = action.value
  handleFilterChange()
}

// 查看详情
const handleViewDetail = (reward: any) => {
  selectedReward.value = reward
  showDetailDialog.value = true
}

// 审批发放奖励
const handleApproveReward = async (reward: any) => {
  try {
    await showConfirmDialog({
      title: '发放奖励',
      message: `确认发放 ¥${reward.rewardAmount} 的奖励给 ${reward.referrerName}？`,
      confirmButtonText: '确认发放',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await MarketingPerformanceService.approveReward(reward.id)
    showToast('奖励发放成功')
    loadRewardList(true)
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发放奖励失败:', error)
      showToast('发放奖励失败')
    }
  }
}

// 取消奖励
const handleCancelReward = async (reward: any) => {
  try {
    await showConfirmDialog({
      title: '取消奖励',
      message: `确认取消 ${reward.referrerName} 的奖励？`,
      confirmButtonText: '确认取消',
      cancelButtonText: '返回',
      type: 'warning'
    })

    await MarketingPerformanceService.cancelReward(reward.id)
    showToast('奖励已取消')
    loadRewardList(true)
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消奖励失败:', error)
      showToast('取消奖励失败')
    }
  }
}

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getRoleTagType = (role: string) => {
  const typeMap = {
    teacher: 'primary',
    parent: 'success',
    principal: 'warning'
  }
  return typeMap[role] || 'default'
}

const getRoleLabel = (role: string) => {
  const labelMap = {
    teacher: '教师',
    parent: '家长',
    principal: '园长'
  }
  return labelMap[role] || '全部'
}

const getRewardTypeTagType = (type: string) => {
  const typeMap = {
    visit: 'primary',
    enrollment: 'success',
    trial: 'warning'
  }
  return typeMap[type] || 'default'
}

const getRewardTypeLabel = (type: string) => {
  const labelMap = {
    visit: '到访奖励',
    enrollment: '报名奖励',
    trial: '体验课奖励'
  }
  return labelMap[type] || type
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    pending: '待发放',
    paid: '已发放',
    cancelled: '已取消'
  }
  return labelMap[status] || '全部'
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

const getConversionStageLabel = (stage: string) => {
  const labelMap = {
    'link_clicked': '已点击链接',
    'visited': '已到访',
    'trial_attended': '已体验',
    'enrolled': '已报名'
  }
  return labelMap[stage] || stage
}

// 监听日期范围变化
watch(() => props.dateRange, () => {
  loadRewardList(true)
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  loadRewardList(true)
})
</script>

<style scoped lang="scss">
@use '@/pages/mobile/styles/mobile-design-tokens.scss' as *;

.mobile-referral-rewards-tab {
  padding: var(--spacing-md);

  // 筛选区域
  .filter-section {
    margin-bottom: var(--spacing-lg);

    .van-search {
      padding: 0;
      margin-bottom: var(--spacing-md);
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);

      .van-tag {
        cursor: pointer;
      }
    }
  }

  // 奖励统计卡片
  .reward-summary {
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
        background: var(--success-color);
      }

      &.pending .summary-icon {
        background: var(--warning-color);
      }

      &.count .summary-icon {
        background: var(--primary-color);
      }
    }
  }

  // 奖励记录列表
  .rewards-list {
    .reward-card {
      background: var(--bg-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s ease;

      &:active {
        transform: scale(0.98);
      }

      .reward-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-md);

        .referrer-info {
          display: flex;
          gap: var(--spacing-sm);
          flex: 1;

          .avatar {
            flex-shrink: 0;
          }

          .info {
            .name {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
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

        .reward-amount {
          text-align: right;

          .amount {
            font-size: var(--text-lg);
            font-weight: var(--font-bold);
            color: var(--success-color);
            margin-bottom: var(--spacing-xs);
          }
        }
      }

      .referee-section {
        margin-bottom: var(--spacing-md);

        .referee-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-sm);

          .arrow-icon {
            color: var(--text-secondary);
            font-size: var(--text-sm);
          }

          .label {
            color: var(--text-secondary);
          }

          .name {
            color: var(--text-primary);
            font-weight: var(--font-medium);
          }
        }
      }

      .reward-info {
        margin-bottom: var(--spacing-md);

        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-sm);
          font-size: var(--text-sm);

          .label {
            color: var(--text-secondary);
          }

          .date {
            color: var(--text-primary);
          }

          .conversion-progress {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: var(--spacing-xs);

            .van-progress {
              width: 100px;
            }

            .stage-text {
              font-size: var(--text-xs);
              color: var(--text-secondary);
            }
          }
        }
      }

      .reward-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: flex-end;

        .van-button {
          min-width: 80px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xs)) {
  .mobile-referral-rewards-tab {
    padding: var(--spacing-sm);

    .reward-summary {
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

    .rewards-list {
      .reward-card {
        padding: var(--spacing-md);

        .reward-header {
          .referrer-info {
            .info {
              .name {
                font-size: var(--text-sm);
              }
            }
          }

          .reward-amount {
            .amount {
              font-size: var(--text-base);
            }
          }
        }
      }
    }
  }
}
</style>