<template>
  <MobileMainLayout
    title="推荐奖励"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-rewards-page">
      <!-- 奖励统计卡片 -->
      <div class="rewards-stats">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item>
            <div class="stat-card available">
              <div class="stat-icon">
                <van-icon name="passed" size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.availableRewards }}</div>
                <div class="stat-label">可用奖励</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card used">
              <div class="stat-icon">
                <van-icon name="certificate" size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.usedRewards }}</div>
                <div class="stat-label">已使用</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card expired">
              <div class="stat-icon">
                <van-icon name="warning-o" size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.expiredRewards }}</div>
                <div class="stat-label">已过期</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card total">
              <div class="stat-icon">
                <van-icon name="gift-o" size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalRewards }}</div>
                <div class="stat-label">累计奖励</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-section">
        <van-dropdown-menu>
          <van-dropdown-item
            v-model="filterStatus"
            :options="statusOptions"
            @change="filterRewards"
          />
        </van-dropdown-menu>
        <div class="refresh-btn">
          <van-button
            size="small"
            type="primary"
            plain
            icon="replay"
            @click="refreshRewards"
          >
            刷新
          </van-button>
        </div>
      </div>

      <!-- 奖励列表 -->
      <div class="rewards-content">
        <div v-if="loading" class="loading-container">
          <van-skeleton :row="5" animated />
          <van-skeleton :row="5" animated />
        </div>

        <div v-else-if="filteredRewards.length === 0" class="empty-container">
          <van-empty description="暂无奖励数据" />
        </div>

        <div v-else class="rewards-list">
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list
              v-model:loading="loading"
              :finished="finished"
              finished-text="没有更多了"
              @load="onLoad"
            >
              <div
                v-for="reward in filteredRewards"
                :key="reward.id"
                class="reward-item"
                :class="getRewardStatusClass(reward)"
              >
                <!-- 奖励类型图标 -->
                <div class="reward-icon">
                  <div class="icon-wrapper">
                    <van-icon
                      v-if="reward.type === 'voucher'"
                      name="coupon-o"
                      size="28"
                      :color="getIconColor(reward)"
                    />
                    <van-icon
                      v-else-if="reward.type === 'gift'"
                      name="gift-o"
                      size="28"
                      :color="getIconColor(reward)"
                    />
                    <van-icon
                      v-else
                      name="star"
                      size="28"
                      :color="getIconColor(reward)"
                    />
                  </div>
                  <van-tag
                    :type="getStatusTagType(reward.status)"
                    size="small"
                    class="status-tag"
                  >
                    {{ getStatusText(reward.status) }}
                  </van-tag>
                </div>

                <!-- 奖励信息 -->
                <div class="reward-info">
                  <div class="reward-header">
                    <h4 class="reward-title">{{ reward.title }}</h4>
                    <div class="reward-meta">
                      <span class="reward-type">{{ getRewardTypeText(reward.type) }}</span>
                      <span v-if="reward.type === 'voucher'" class="reward-value">
                        ￥{{ reward.voucherValue }}
                      </span>
                    </div>
                  </div>
                  <p class="reward-description">{{ reward.description }}</p>

                  <div class="reward-details">
                    <div class="detail-item">
                      <van-icon name="calendar-o" size="14" />
                      <span>有效期：{{ reward.expiryDate }}</span>
                    </div>
                  </div>

                  <!-- 倒计时提示 -->
                  <div v-if="reward.status === 'available' && reward.daysLeft" class="countdown">
                    <van-icon name="clock-o" size="14" color="#ff6b6b" />
                    <span class="countdown-text">剩余 {{ reward.daysLeft }} 天</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="reward-actions">
                  <van-button
                    size="small"
                    type="primary"
                    plain
                    @click="handleViewDetail(reward)"
                  >
                    查看详情
                  </van-button>
                  <van-button
                    v-if="reward.status === 'available'"
                    size="small"
                    type="success"
                    @click="handleUseReward(reward)"
                  >
                    使用
                  </van-button>
                </div>
              </div>
            </van-list>
          </van-pull-refresh>
        </div>
      </div>

      <!-- 奖励详情弹窗 -->
      <van-popup
        v-model:show="showDetailDialog"
        position="bottom"
        :style="{ height: '70%' }"
        round
      >
        <div v-if="selectedReward" class="reward-detail">
          <div class="detail-header">
            <h3>奖励详情</h3>
            <van-icon name="cross" @click="showDetailDialog = false" />
          </div>

          <div class="detail-content">
            <!-- 奖励图标和状态 -->
            <div class="detail-icon-section">
              <div class="detail-icon">
                <van-icon
                  v-if="selectedReward.type === 'voucher'"
                  name="coupon-o"
                  size="48"
                  :color="getIconColor(selectedReward)"
                />
                <van-icon
                  v-else-if="selectedReward.type === 'gift'"
                  name="gift-o"
                  size="48"
                  :color="getIconColor(selectedReward)"
                />
                <van-icon
                  v-else
                  name="star"
                  size="48"
                  :color="getIconColor(selectedReward)"
                />
              </div>
              <van-tag
                :type="getStatusTagType(selectedReward.status)"
                size="large"
              >
                {{ getStatusText(selectedReward.status) }}
              </van-tag>
            </div>

            <!-- 奖励基本信息 -->
            <div class="detail-info">
              <h4 class="detail-title">{{ selectedReward.title }}</h4>
              <p class="detail-description">{{ selectedReward.description }}</p>

              <div class="detail-items">
                <div class="detail-item">
                  <span class="item-label">类型：</span>
                  <span class="item-value">{{ getRewardTypeText(selectedReward.type) }}</span>
                </div>
                <div class="detail-item">
                  <span class="item-label">有效期：</span>
                  <span class="item-value">{{ selectedReward.expiryDate }}</span>
                </div>
                <div v-if="selectedReward.type === 'voucher'" class="detail-item">
                  <span class="item-label">面值：</span>
                  <span class="item-value highlight">￥{{ selectedReward.voucherValue }}</span>
                </div>
                <div v-if="selectedReward.createdAt" class="detail-item">
                  <span class="item-label">获得时间：</span>
                  <span class="item-value">{{ selectedReward.createdAt }}</span>
                </div>
              </div>

              <!-- 使用说明 -->
              <div v-if="selectedReward.usageInstructions" class="usage-instructions">
                <h5>使用说明</h5>
                <p>{{ selectedReward.usageInstructions }}</p>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="detail-actions">
            <van-button
              v-if="selectedReward.status === 'available'"
              type="success"
              block
              size="large"
              @click="handleUseReward(selectedReward)"
            >
              立即使用
            </van-button>
            <van-button
              v-else
              type="default"
              block
              size="large"
              @click="showDetailDialog = false"
            >
              关闭
            </van-button>
          </div>
        </div>
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

interface Reward {
  id: number
  title: string
  description: string
  type: 'voucher' | 'gift' | 'points'
  status: 'available' | 'used' | 'expired'
  expiryDate: string
  createdAt?: string
  voucherValue?: number
  daysLeft?: number
  usageInstructions?: string
}

// 响应式数据
const rewards = ref<Reward[]>([
  {
    id: 1,
    title: '邀请新家长一周期免费体验课',
    description: '邀请新家长参加一周期的免费体验课程',
    type: 'gift',
    status: 'available',
    expiryDate: '2025-12-31',
    createdAt: '2024-10-01',
    daysLeft: 30,
    usageInstructions: '此奖励可转赠给新家长，新家长可凭此奖励免费体验一周期课程。'
  },
  {
    id: 2,
    title: '价值200元的学费代金券',
    description: '可用于下次报名抵扣学费',
    type: 'voucher',
    status: 'available',
    expiryDate: '2025-12-31',
    voucherValue: 200,
    createdAt: '2024-10-15',
    daysLeft: 25,
    usageInstructions: '报名时出示此代金券，可抵扣200元学费，不可与其他优惠同时使用。'
  },
  {
    id: 3,
    title: '全年精美照片集一份',
    description: '孩子在幼儿园一年的成长照片精选集',
    type: 'gift',
    status: 'used',
    expiryDate: '2025-06-30',
    createdAt: '2024-01-01',
    usageInstructions: '已领取，请到前台领取您的孩子照片集。'
  },
  {
    id: 4,
    title: '推荐积分奖励',
    description: '成功推荐新家长入学获得的积分奖励',
    type: 'points',
    status: 'available',
    expiryDate: '2025-12-31',
    createdAt: '2024-10-20',
    daysLeft: 15,
    usageInstructions: '积分可用于兑换礼品或参与活动，请在有效期内使用。'
  },
  {
    id: 5,
    title: '家长活动优先参与券',
    description: '优先参与幼儿园组织的各类家长活动',
    type: 'gift',
    status: 'expired',
    expiryDate: '2024-10-01',
    createdAt: '2024-05-01'
  }
])

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const filterStatus = ref('')
const selectedReward = ref<Reward | null>(null)
const showDetailDialog = ref(false)

// 筛选选项
const statusOptions = [
  { text: '全部', value: '' },
  { text: '可用', value: 'available' },
  { text: '已使用', value: 'used' },
  { text: '已过期', value: 'expired' }
]

// 计算属性
const stats = computed(() => ({
  availableRewards: rewards.value.filter(r => r.status === 'available').length,
  usedRewards: rewards.value.filter(r => r.status === 'used').length,
  expiredRewards: rewards.value.filter(r => r.status === 'expired').length,
  totalRewards: rewards.value.length
}))

const filteredRewards = computed(() => {
  if (!filterStatus.value) return rewards.value
  return rewards.value.filter(r => r.status === filterStatus.value)
})

// 方法
const getRewardStatusClass = (reward: Reward): string => {
  return `status-${reward.status}`
}

const getStatusTagType = (status: string): string => {
  const typeMap: Record<string, string> = {
    'available': 'success',
    'used': 'default',
    'expired': 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    'available': '可用',
    'used': '已使用',
    'expired': '已过期'
  }
  return textMap[status] || status
}

const getRewardTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'voucher': '代金券',
    'gift': '礼品',
    'points': '积分'
  }
  return typeMap[type] || type
}

const getIconColor = (reward: Reward): string => {
  if (reward.status === 'expired') return '#c8c9cc'
  if (reward.status === 'used') return '#909399'

  const colorMap: Record<string, string> = {
    'voucher': '#ff6b6b',
    'gift': '#4ecdc4',
    'points': '#ffd93d'
  }
  return colorMap[reward.type] || '#409eff'
}

const handleViewDetail = (reward: Reward) => {
  selectedReward.value = reward
  showDetailDialog.value = true
}

const handleUseReward = async (reward: Reward) => {
  try {
    await showConfirmDialog({
      title: '确认使用',
      message: `确定要使用"${reward.title}"吗？`,
    })

    // 更新奖励状态
    const index = rewards.value.findIndex(r => r.id === reward.id)
    if (index !== -1) {
      rewards.value[index].status = 'used'
    }

    showSuccessToast('奖励使用成功')
    showDetailDialog.value = false
  } catch (error) {
    // 用户取消操作
  }
}

const refreshRewards = () => {
  refreshing.value = true
  // 模拟刷新
  setTimeout(() => {
    refreshing.value = false
    showSuccessToast('奖励已刷新')

    // 更新倒计时
    updateCountdown()
  }, 1000)
}

const updateCountdown = () => {
  rewards.value.forEach(reward => {
    if (reward.status === 'available' && reward.expiryDate) {
      const expiryDate = new Date(reward.expiryDate)
      const now = new Date()
      const timeDiff = expiryDate.getTime() - now.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

      if (daysDiff > 0) {
        reward.daysLeft = daysDiff
      } else {
        reward.status = 'expired'
        reward.daysLeft = 0
      }
    }
  })
}

const filterRewards = () => {
  // 筛选逻辑已在 computed 中处理
}

const onRefresh = () => {
  refreshRewards()
}

const onLoad = () => {
  // 模拟加载更多数据
  loading.value = true
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

// 生命周期
onMounted(() => {
  updateCountdown()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-rewards-page {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
}

.rewards-stats {
  padding: var(--spacing-md);

  .stat-card {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--card-bg);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 100%;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.98);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }

    &.available .stat-icon {
      background: linear-gradient(135deg, #07c160 0%, #38d9a9 100%);
      color: var(--text-white);
    }

    &.used .stat-icon {
      background: linear-gradient(135deg, #909399 0%, #c8c9cc 100%);
      color: var(--text-white);
    }

    &.expired .stat-icon {
      background: linear-gradient(135deg, #ee0a24 0%, #ff6b6b 100%);
      color: var(--text-white);
    }

    &.total .stat-icon {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      color: var(--text-white);
    }

    .stat-info {
      .stat-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: var(--van-text-color);
        line-height: 1.2;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }
  }
}

.filter-section {
  display: flex;
  align-items: center;
  padding: 0 16px 16px;
  gap: var(--spacing-md);

  .van-dropdown-menu {
    flex: 1;
  }

  .refresh-btn {
    flex-shrink: 0;
  }
}

.rewards-content {
  flex: 1;
  padding-bottom: 20px;
}

.loading-container {
  padding: var(--spacing-md);
}

.empty-container {
  padding: 60px 20px;
  text-align: center;
}

.rewards-list {
  padding: 0 16px;
}

.reward-item {
  background: var(--card-bg);
  border-radius: 16px;
  padding: var(--spacing-lg);
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: var(--spacing-md);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }

  &.status-available::before {
    background: linear-gradient(180deg, #07c160 0%, #38d9a9 100%);
  }

  &.status-used::before {
    background: linear-gradient(180deg, #909399 0%, #c8c9cc 100%);
  }

  &.status-expired::before {
    background: linear-gradient(180deg, #ee0a24 0%, #ff6b6b 100%);
  }

  .reward-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);

    .icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: var(--van-background-color-light);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-tag {
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }

  .reward-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    .reward-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .reward-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin: 0;
        flex: 1;
        line-height: 1.4;
      }

      .reward-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-xs);
        margin-left: 12px;

        .reward-type {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
        }

        .reward-value {
          font-size: var(--text-base);
          font-weight: bold;
          color: #ff6b6b;
        }
      }
    }

    .reward-description {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      margin: 0;
      line-height: 1.5;
    }

    .reward-details {
      .detail-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }

    .countdown {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 6px 12px;
      background: #fff5f5;
      border-radius: 12px;

      .countdown-text {
        font-size: var(--text-xs);
        color: #ff6b6b;
        font-weight: 500;
      }
    }
  }

  .reward-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    justify-content: center;
    align-items: flex-end;
  }
}

.reward-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .van-icon {
      font-size: var(--text-xl);
      color: var(--van-text-color-2);
      cursor: pointer;
    }
  }

  .detail-content {
    flex: 1;
    padding: var(--spacing-lg);
    overflow-y: auto;

    .detail-icon-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: 24px;

      .detail-icon {
        width: 80px;
        height: 80px;
        border-radius: 40px;
        background: var(--van-background-color-light);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .detail-info {
      .detail-title {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--van-text-color);
        text-align: center;
        margin: 0 0 16px 0;
      }

      .detail-description {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        text-align: center;
        margin: 0 0 24px 0;
        line-height: 1.6;
      }

      .detail-items {
        margin-bottom: 24px;

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md) 0;
          border-bottom: 1px solid var(--van-border-color-light);

          &:last-child {
            border-bottom: none;
          }

          .item-label {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
            width: 100px;
            flex-shrink: 0;
          }

          .item-value {
            font-size: var(--text-sm);
            color: var(--van-text-color);
            font-weight: 500;
            text-align: right;

            &.highlight {
              color: #ff6b6b;
              font-weight: bold;
              font-size: var(--text-base);
            }
          }
        }
      }

      .usage-instructions {
        background: #f8f9fa;
        border-radius: 8px;
        padding: var(--spacing-md);

        h5 {
          margin: 0 0 8px 0;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color);
        }

        p {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--van-text-color-2);
          line-height: 1.6;
        }
      }
    }
  }

  .detail-actions {
    padding: var(--spacing-md);
    border-top: 1px solid var(--van-border-color);
  }
}

:deep(.van-grid-item__content) {
  padding: 0;
}

:deep(.van-dropdown-menu__bar) {
  border-radius: 8px;
}
</style>