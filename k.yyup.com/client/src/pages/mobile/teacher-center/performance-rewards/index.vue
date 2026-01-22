<template>
  <MobileSubPageLayout title="绩效考核" back-path="/mobile/teacher-center">
    <div class="performance-rewards-page">
      <van-cell-group inset>
        <div class="performance-overview">
          <div class="overview-item"><div class="value">{{ stats.availableRewards }}</div><div class="label">可用奖励</div></div>
          <div class="overview-item"><div class="value">{{ stats.usedRewards }}</div><div class="label">已使用</div></div>
          <div class="overview-item"><div class="value">{{ stats.totalRewards }}</div><div class="label">累计奖励</div></div>
        </div>
      </van-cell-group>

      <van-cell-group inset title="奖励列表">
        <div v-if="loading" class="loading-state">
          <van-loading type="spinner" size="24px">加载中...</van-loading>
        </div>
        <div v-else-if="rewards.length === 0" class="empty-state">
          <van-empty description="暂无奖励记录" />
        </div>
        <van-cell v-for="reward in rewards" :key="reward.id" :title="reward.title" :value="formatRewardValue(reward)">
          <template #label>
            <div class="reward-label">
              <van-tag :type="getStatusType(reward.status)" size="small">{{ getStatusText(reward.status) }}</van-tag>
              <span class="source-text">来源：{{ reward.source }}</span>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { showLoadingToast, closeToast, showToast } from 'vant'
import TeacherRewardsService, { type TeacherReward, type TeacherRewardStats } from '@/api/modules/teacher-rewards'

const loading = ref(false)
const rewards = ref<TeacherReward[]>([])
const stats = reactive<TeacherRewardStats>({
  availableRewards: 0,
  usedRewards: 0,
  expiredRewards: 0,
  totalRewards: 0,
  totalValue: 0,
  availableValue: 0,
  usedValue: 0
})

const getStatusType = (status: string) => {
  switch (status) {
    case 'available': return 'success'
    case 'used': return 'info'
    case 'expired': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return '可用'
    case 'used': return '已使用'
    case 'expired': return '已过期'
    default: return '未知'
  }
}

const formatRewardValue = (reward: TeacherReward) => {
  if (reward.type === 'voucher' && reward.value) {
    return `¥${reward.value}`
  } else if (reward.type === 'points' && reward.value) {
    return `${reward.value} 积分`
  } else if (reward.type === 'cash' && reward.value) {
    return `¥${reward.value}`
  }
  return reward.type === 'gift' ? '礼品' : '-'
}

const loadRewards = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })

    const { rewards: rewardsData, stats: statsData } = await TeacherRewardsService.refreshRewardsData()

    rewards.value = rewardsData
    Object.assign(stats, statsData)
  } catch (error: any) {
    console.error('加载奖励数据失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

onMounted(() => {
  loadRewards()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/mobile-base.scss';

.performance-rewards-page {
  min-height: 100vh;
  background-color: var(--bg-color-page);
  padding-bottom: var(--spacing-xl);
}

.performance-overview {
  display: flex;
  padding: var(--spacing-lg) 0;
  .overview-item {
    flex: 1;
    text-align: center;
    .value { font-size: var(--text-2xl); font-weight: bold; margin-bottom: var(--spacing-sm); }
    .label { font-size: var(--text-sm); color: var(--text-secondary); }
  }
}

.loading-state {
  padding: var(--spacing-xl) 0;
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: var(--spacing-xl) 0;
}

.reward-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);

  .source-text {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
}
</style>

