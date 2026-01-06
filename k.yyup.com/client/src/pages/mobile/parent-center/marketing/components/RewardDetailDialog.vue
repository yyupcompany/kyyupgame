<template>
  <van-dialog
    v-model:show="visible"
    :title="dialogTitle"
    :show-confirm-button="false"
    :show-cancel-button="false"
    class="reward-detail-dialog"
  >
    <div class="reward-detail">
      <!-- 基本信息 -->
      <div class="basic-info">
        <van-cell-group inset>
          <van-cell title="奖励金额" :value="`¥${rewardData.amount}`" />
          <van-cell title="推荐客户" :value="rewardData.customerName" />
          <van-cell title="推荐时间" :value="formatDate(rewardData.referralDate)"" />
          <van-cell title="奖励状态">
            <template #value>
              <van-tag :type="getStatusType(rewardData.status)" size="small">
                {{ getStatusText(rewardData.status) }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 计算明细 -->
      <div class="calculation-details" v-if="rewardData.calculation">
        <h4 class="section-title">奖励计算</h4>
        <van-cell-group inset>
          <van-cell
            v-for="item in rewardData.calculation"
            :key="item.name"
            :title="item.name"
            :value="`¥${item.value}`"
          />
        </van-cell-group>
      </div>

      <!-- 操作按钮 -->
      <div class="dialog-actions">
        <van-button
          v-if="rewardData.status === 'pending'"
          type="primary"
          size="small"
          @click="$emit('approve', rewardData)"
        >
          审核通过
        </van-button>
        <van-button
          v-if="rewardData.status === 'pending'"
          type="danger"
          size="small"
          @click="$emit('reject', rewardData)"
        >
          拒绝
        </van-button>
        <van-button
          size="small"
          @click="handleClose"
        >
          关闭
        </van-button>
      </div>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CalculationItem {
  name: string
  value: number
}

interface RewardData {
  id: string
  amount: number
  customerName: string
  referralDate: string
  status: string
  calculation?: CalculationItem[]
}

interface Props {
  modelValue: boolean
  rewardData: RewardData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'approve': [reward: RewardData]
  'reject': [reward: RewardData]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => `奖励详情 - ${props.rewardData.customerName}`)

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

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.reward-detail-dialog {
  :deep(.van-dialog__content) {
    max-height: 70vh;
    overflow-y: auto;
  }
}

.reward-detail {
  .section-title {
    margin: var(--spacing-md) 0 12px 16px;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--van-text-color);
  }

  .dialog-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) 16px;
    border-top: 1px solid var(--van-border-color);
  }
}
</style>