<template>
  <div class="referral-rewards">
    <!-- 奖励总览 -->
    <div class="rewards-overview">
      <div class="overview-card">
        <div class="total-amount">
          <span class="amount-value">¥{{ totalRewards }}</span>
          <span class="amount-label">累计奖励</span>
        </div>
        <div class="rewards-stats">
          <div class="stat-item">
            <span class="stat-value">{{ thisMonthRewards }}</span>
            <span class="stat-label">本月奖励</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ pendingRewards }}</span>
            <span class="stat-label">待发放</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 奖励列表 -->
    <div class="rewards-list">
      <h3 class="section-title">奖励明细</h3>
      <van-cell-group inset>
        <van-cell
          v-for="reward in rewardsList"
          :key="reward.id"
          :title="reward.customerName"
          :label="`推荐时间: ${formatDate(referralDate)}`"
          :value="`¥${reward.amount}`"
          :is-link="true"
          @click="$emit('reward-click', reward)"
        >
          <template #icon>
            <van-icon name="gold-coin-o" size="16" color="#F56C6C" />
          </template>

          <template #right-icon>
            <div class="reward-status">
              <van-tag :type="getStatusType(reward.status)" size="small">
                {{ getStatusText(reward.status) }}
              </van-tag>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 提现记录 -->
    <div class="withdrawal-history">
      <div class="section-header">
        <h3 class="section-title">提现记录</h3>
        <van-button
          type="primary"
          size="small"
          plain
          @click="$emit('withdraw')"
        >
          申请提现
        </van-button>
      </div>
      <van-cell-group inset>
        <van-cell
          v-for="withdrawal in withdrawalList"
          :key="withdrawal.id"
          :title="`¥${withdrawal.amount}`"
          :label="formatDate(withdrawal.createdAt)"
          :value="getStatusText(withdrawal.status)"
        />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Reward {
  id: string
  customerName: string
  amount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  referralDate: string
}

interface Withdrawal {
  id: string
  amount: number
  status: string
  createdAt: string
}

interface Props {
  rewardsList?: Reward[]
  withdrawalList?: Withdrawal[]
}

const props = withDefaults(defineProps<Props>(), {
  rewardsList: () => [],
  withdrawalList: () => []
})

const emit = defineEmits<{
  'reward-click': [reward: Reward]
  'withdraw': []
}>()

const totalRewards = computed(() => {
  return props.rewardsList.reduce((sum, reward) => sum + reward.amount, 0)
})

const thisMonthRewards = computed(() => {
  const currentMonth = new Date().getMonth()
  return props.rewardsList
    .filter(reward => new Date(reward.referralDate).getMonth() === currentMonth)
    .reduce((sum, reward) => sum + reward.amount, 0)
})

const pendingRewards = computed(() => {
  return props.rewardsList
    .filter(reward => reward.status === 'pending')
    .reduce((sum, reward) => sum + reward.amount, 0)
})

const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    'pending': 'warning',
    'approved': 'primary',
    'paid': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'paid': '已发放',
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.referral-rewards {
  padding: var(--van-padding-sm);

  .rewards-overview {
    margin-bottom: var(--van-padding-md);

    .overview-card {
      background: linear-gradient(135deg, #F56C6C, #ff8a8a);
      border-radius: var(--van-border-radius-lg);
      padding: var(--van-padding-lg);
      color: white;

      .total-amount {
        text-align: center;
        margin-bottom: var(--van-padding-md);

        .amount-value {
          display: block;
          font-size: var(--text-3xl);
          font-weight: var(--van-font-weight-bold);
          margin-bottom: 4px;
        }

        .amount-label {
          font-size: var(--van-font-size-sm);
          opacity: 0.9;
        }
      }

      .rewards-stats {
        display: flex;
        justify-content: space-around;

        .stat-item {
          text-align: center;

          .stat-value {
            display: block;
            font-size: var(--van-font-size-lg);
            font-weight: var(--van-font-weight-bold);
            margin-bottom: 2px;
          }

          .stat-label {
            font-size: var(--van-font-size-xs);
            opacity: 0.9;
          }
        }
      }
    }
  }

  .section-title {
    margin: 0 0 var(--van-padding-sm) 0;
    font-size: var(--van-font-size-md);
    font-weight: var(--van-font-weight-bold);
    color: var(--van-text-color);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--van-padding-sm);
  }

  .reward-status {
    margin-left: var(--van-padding-xs);
  }
}
</style>