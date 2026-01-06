<template>
  <el-dialog
    v-model="visible"
    title="奖励详情"
    width="600px"
    @close="handleClose"
  >
    <div v-if="reward" class="reward-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4>基本信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="推荐人">
            <div class="person-info">
              <el-tag :type="getRoleTagType(reward.referrerRole)" size="small">
                {{ getRoleLabel(reward.referrerRole) }}
              </el-tag>
              <span>{{ reward.referrerName }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="被推荐人">{{ reward.refereeName }}</el-descriptions-item>
          <el-descriptions-item label="推荐日期">{{ formatDate(reward.referralDate) }}</el-descriptions-item>
          <el-descriptions-item label="推荐码">{{ reward.referralCode }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 奖励信息 -->
      <div class="detail-section">
        <h4>奖励信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="奖励金额">
            <span class="reward-amount">¥{{ reward.rewardAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="奖励类型">
            <el-tag :type="getRewardTypeTagType(reward.rewardType)" size="small">
              {{ getRewardTypeLabel(reward.rewardType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(reward.status)" size="small">
              {{ getStatusLabel(reward.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发放日期">
            {{ reward.paidDate ? formatDate(reward.paidDate) : '待发放' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 转化历程 -->
      <div class="detail-section">
        <h4>转化历程</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(stage, index) in conversionStages"
            :key="index"
            :timestamp="formatDateTime(stage.timestamp)"
            :type="getTimelineType(stage.stage)"
            :icon="getTimelineIcon(stage.stage)"
          >
            <div class="timeline-content">
              <div class="stage-title">{{ getConversionStageLabel(stage.stage) }}</div>
              <div class="stage-description">{{ stage.description }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 操作记录 -->
      <div class="detail-section" v-if="reward.operations && reward.operations.length > 0">
        <h4>操作记录</h4>
        <el-table :data="reward.operations" size="small">
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="action" label="操作" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.action }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="note" label="备注" />
          <el-table-column prop="createdAt" label="操作时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button
        v-if="reward && reward.status === 'pending'"
        type="success"
        @click="handleApprove"
      >
        确认发放
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

import MarketingPerformanceService from '@/services/marketing-performance.service'

// Props
interface Props {
  modelValue: boolean
  reward: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'approved': []
}>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const conversionStages = computed(() => {
  if (!props.reward) return []

  // 根据当前转化阶段生成历程
  const stages = [
    {
      stage: 'link_clicked',
      timestamp: props.reward.referralDate,
      description: `${props.reward.refereeName} 点击了推荐链接`
    }
  ]

  if (props.reward.visitDate) {
    stages.push({
      stage: 'visited',
      timestamp: props.reward.visitDate,
      description: `${props.reward.refereeName} 完成到访参观`
    })
  }

  if (props.reward.trialDate) {
    stages.push({
      stage: 'trial_attended',
      timestamp: props.reward.trialDate,
      description: `${props.reward.refereeName} 参加体验课程`
    })
  }

  if (props.reward.enrollmentDate) {
    stages.push({
      stage: 'enrolled',
      timestamp: props.reward.enrollmentDate,
      description: `${props.reward.refereeName} 完成报名缴费`
    })
  }

  return stages
})

// 处理关闭
const handleClose = () => {
  visible.value = false
}

// 处理审批
const handleApprove = async () => {
  if (!props.reward) return

  try {
    await MarketingPerformanceService.approveReward(props.reward.id)
    ElMessage.success('奖励发放成功')
    emit('approved')
    handleClose()
  } catch (error) {
    console.error('发放奖励失败:', error)
    ElMessage.error('发放奖励失败')
  }
}

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getRoleTagType = (role: string) => {
  const typeMap = {
    teacher: 'primary',
    parent: 'success',
    principal: 'warning'
  }
  return typeMap[role] || 'info'
}

const getRoleLabel = (role: string) => {
  const labelMap = {
    teacher: '教师',
    parent: '家长',
    principal: '园长'
  }
  return labelMap[role] || role
}

const getRewardTypeTagType = (type: string) => {
  const typeMap = {
    visit: 'info',
    enrollment: 'success',
    trial: 'warning'
  }
  return typeMap[type] || 'info'
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
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    pending: '待发放',
    paid: '已发放',
    cancelled: '已取消'
  }
  return labelMap[status] || status
}

const getConversionStageLabel = (stage: string) => {
  const labelMap = {
    'link_clicked': '链接点击',
    'visited': '完成到访',
    'trial_attended': '体验课程',
    'enrolled': '完成报名'
  }
  return labelMap[stage] || stage
}

const getTimelineType = (stage: string) => {
  const typeMap = {
    'link_clicked': 'info',
    'visited': 'primary',
    'trial_attended': 'warning',
    'enrolled': 'success'
  }
  return typeMap[stage] || 'info'
}

const getTimelineIcon = (stage: string) => {
  const iconMap = {
    'link_clicked': 'Link',
    'visited': 'Location',
    'trial_attended': 'Star',
    'enrolled': 'SuccessFilled'
  }
  return iconMap[stage] || 'CircleCheck'
}
</script>

<style scoped lang="scss">
.reward-detail {
  .detail-section {
    margin-bottom: var(--text-2xl);

    h4 {
      margin-bottom: var(--text-lg);
      color: var(--text-primary);
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .person-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .reward-amount {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--success-color);
    }
  }

  .timeline-content {
    .stage-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .stage-description {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
  }
}

:deep(.el-descriptions) {
  .el-descriptions__label {
    font-weight: 500;
    color: var(--text-secondary);
  }

  .el-descriptions__content {
    color: var(--text-primary);
  }
}

:deep(.el-timeline) {
  padding-left: 0;
}

:deep(.el-timeline-item__timestamp) {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>