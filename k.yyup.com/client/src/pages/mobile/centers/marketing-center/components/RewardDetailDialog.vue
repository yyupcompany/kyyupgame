<template>
  <van-dialog
    v-model:show="visible"
    title="奖励详情"
    :show-confirm-button="false"
    :close-on-click-overlay="true"
    class="reward-detail-dialog"
    @close="handleClose"
  >
    <div v-if="reward" class="reward-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4 class="section-title">
          <van-icon name="contact" />
          基本信息
        </h4>
        <van-cell-group>
          <van-cell title="推荐人" :value="reward.referrerName">
            <template #title>
              <div class="cell-title">
                <van-tag :type="getRoleTagType(reward.referrerRole)" size="small">
                  {{ getRoleLabel(reward.referrerRole) }}
                </van-tag>
                <span>推荐人</span>
              </div>
            </template>
          </van-cell>
          <van-cell title="被推荐人" :value="reward.refereeName" />
          <van-cell title="推荐日期" :value="formatDate(reward.referralDate)" />
          <van-cell title="推荐码" :value="reward.referralCode">
            <template #right-icon>
              <van-button size="mini" type="primary" @click="copyReferralCode">
                复制
              </van-button>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 奖励信息 -->
      <div class="detail-section">
        <h4 class="section-title">
          <van-icon name="gold-coin-o" />
          奖励信息
        </h4>
        <div class="reward-info-cards">
          <div class="info-card amount">
            <div class="info-icon">
              <van-icon name="gold-coin-o" />
            </div>
            <div class="info-content">
              <div class="info-value">¥{{ reward.rewardAmount }}</div>
              <div class="info-label">奖励金额</div>
            </div>
          </div>
          <div class="info-card type">
            <div class="info-icon">
              <van-icon name="label-o" />
            </div>
            <div class="info-content">
              <van-tag :type="getRewardTypeTagType(reward.rewardType)" size="small">
                {{ getRewardTypeLabel(reward.rewardType) }}
              </van-tag>
              <div class="info-label">奖励类型</div>
            </div>
          </div>
        </div>
        <van-cell-group>
          <van-cell title="当前状态">
            <template #value>
              <van-tag :type="getStatusTagType(reward.status)" size="small">
                {{ getStatusLabel(reward.status) }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="发放日期" :value="reward.paidDate ? formatDate(reward.paidDate) : '待发放'" />
        </van-cell-group>
      </div>

      <!-- 转化历程 -->
      <div class="detail-section">
        <h4 class="section-title">
          <van-icon name="chart-trending-o" />
          转化历程
        </h4>
        <van-steps direction="vertical" :active="currentStepIndex">
          <van-step
            v-for="(stage, index) in conversionStages"
            :key="index"
            :title="getConversionStageLabel(stage.stage)"
            :description="stage.description"
          >
            <template #inactive-icon>
              <van-icon :name="getStepIcon(stage.stage)" />
            </template>
            <template #active-icon>
              <van-icon :name="getStepIcon(stage.stage)" />
            </template>
            <div class="step-time">{{ formatDateTime(stage.timestamp) }}</div>
          </van-step>
        </van-steps>
      </div>

      <!-- 转化进度 -->
      <div class="detail-section">
        <h4 class="section-title">
          <van-icon name="medal-o" />
          转化进度
        </h4>
        <div class="conversion-progress">
          <div class="progress-bar">
            <van-progress
              :percentage="getConversionProgress(reward.conversionStage)"
              :show-pivot="false"
              stroke-width="8"
            />
            <div class="progress-stages">
              <div
                v-for="(stage, index) in progressStages"
                :key="index"
                class="progress-stage"
                :class="{ active: getStageProgress(stage.value) <= getConversionProgress(reward.conversionStage) }"
              >
                <div class="stage-dot"></div>
                <span class="stage-label">{{ stage.label }}</span>
              </div>
            </div>
          </div>
          <div class="current-stage">
            当前阶段: {{ getConversionStageLabel(reward.conversionStage) }}
          </div>
        </div>
      </div>

      <!-- 操作记录 -->
      <div class="detail-section" v-if="reward.operations && reward.operations.length > 0">
        <h4 class="section-title">
          <van-icon name="records" />
          操作记录
        </h4>
        <div class="operations-list">
          <div
            v-for="(operation, index) in reward.operations"
            :key="index"
            class="operation-item"
          >
            <div class="operation-header">
              <span class="operator">{{ operation.operator }}</span>
              <van-tag size="small" type="primary">{{ operation.action }}</van-tag>
            </div>
            <div class="operation-note" v-if="operation.note">{{ operation.note }}</div>
            <div class="operation-time">{{ formatDateTime(operation.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <van-button block @click="handleClose">关闭</van-button>
        <van-button
          v-if="reward && reward.status === 'pending'"
          block
          type="success"
          @click="handleApprove"
        >
          确认发放
        </van-button>
      </div>
    </template>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import MarketingPerformanceService from '@/services/marketing-performance.service'

// Props
interface Props {
  show: boolean
  reward: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:show': [value: boolean]
  approve: [reward: any]
  refresh: []
}>()

// 响应式数据
const visible = ref(false)

// 监听show属性变化
watch(() => props.show, (newValue) => {
  visible.value = newValue
}, { immediate: true })

watch(visible, (newValue) => {
  emit('update:show', newValue)
})

// 转化阶段
const conversionStages = computed(() => {
  if (!props.reward) return []

  return [
    {
      stage: 'link_clicked',
      timestamp: props.reward.linkClickTime || new Date().toISOString(),
      description: '被推荐人点击了推荐链接'
    },
    {
      stage: 'visited',
      timestamp: props.reward.visitTime,
      description: props.reward.visitTime ? '被推荐人到访了园区' : '尚未到访'
    },
    {
      stage: 'trial_attended',
      timestamp: props.reward.trialTime,
      description: props.reward.trialTime ? '被推荐人参加了体验课' : '尚未体验'
    },
    {
      stage: 'enrolled',
      timestamp: props.reward.enrollmentTime,
      description: props.reward.enrollmentTime ? '被推荐人已报名' : '尚未报名'
    }
  ].filter(stage => stage.timestamp)
})

// 当前步骤索引
const currentStepIndex = computed(() => {
  const stageOrder = ['link_clicked', 'visited', 'trial_attended', 'enrolled']
  const currentStage = props.reward?.conversionStage
  return stageOrder.indexOf(currentStage)
})

// 进度阶段
const progressStages = [
  { value: 20, label: '已点击' },
  { value: 40, label: '已到访' },
  { value: 60, label: '已体验' },
  { value: 100, label: '已报名' }
]

// 处理关闭
const handleClose = () => {
  visible.value = false
}

// 处理确认发放
const handleApprove = async () => {
  try {
    await MarketingPerformanceService.approveReward(props.reward.id)
    showToast('奖励发放成功')
    emit('approve', props.reward)
    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('发放奖励失败:', error)
    showToast('发放奖励失败')
  }
}

// 复制推荐码
const copyReferralCode = async () => {
  try {
    await navigator.clipboard.writeText(props.reward.referralCode)
    showToast('推荐码已复制')
  } catch (error) {
    showToast('复制失败，请手动复制')
  }
}

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
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
  return labelMap[role] || role
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
  return labelMap[status] || status
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

const getConversionProgress = (stage: string) => {
  const stageMap = {
    'link_clicked': 20,
    'visited': 40,
    'trial_attended': 60,
    'enrolled': 100
  }
  return stageMap[stage] || 0
}

const getStageProgress = (stage: number) => {
  return stage
}

const getStepIcon = (stage: string) => {
  const iconMap = {
    'link_clicked': 'eye-o',
    'visited': 'location-o',
    'trial_attended': 'smile-o',
    'enrolled': 'success'
  }
  return iconMap[stage] || 'clock-o'
}

const getTimelineType = (stage: string) => {
  const currentStage = props.reward?.conversionStage
  const stageOrder = ['link_clicked', 'visited', 'trial_attended', 'enrolled']
  const currentIndex = stageOrder.indexOf(currentStage)
  const stageIndex = stageOrder.indexOf(stage)

  if (stageIndex <= currentIndex) {
    return 'success'
  }
  return 'info'
}
</script>

<style scoped lang="scss">
@use '@/pages/mobile/styles/mobile-design-tokens.scss' as *;

.reward-detail-dialog {
  :deep(.van-dialog) {
    max-height: 80vh;
    overflow-y: auto;
  }

  .reward-detail {
    padding: var(--spacing-md) 0;

    .detail-section {
      margin-bottom: var(--spacing-lg);

      .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin: 0 0 var(--spacing-md) 0;
        padding: 0 var(--spacing-md);
        font-size: var(--text-base);
        font-weight: var(--font-medium);
        color: var(--text-primary);

        .van-icon {
          color: var(--primary-color);
        }
      }

      // 奖励信息卡片
      .reward-info-cards {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
        padding: 0 var(--spacing-md);

        .info-card {
          flex: 1;
          background: var(--bg-color-page);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .info-icon {
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

          .info-content {
            flex: 1;

            .info-value {
              font-size: var(--text-lg);
              font-weight: var(--font-bold);
              color: var(--text-primary);
              margin-bottom: var(--spacing-xs);
            }

            .info-label {
              font-size: var(--text-xs);
              color: var(--text-secondary);
            }
          }

          &.amount .info-icon {
            background: var(--success-color);
          }

          &.type .info-icon {
            background: var(--primary-color);
          }
        }
      }

      // 转化进度
      .conversion-progress {
        padding: 0 var(--spacing-md);

        .progress-bar {
          margin-bottom: var(--spacing-md);

          .progress-stages {
            display: flex;
            justify-content: space-between;
            margin-top: var(--spacing-sm);

            .progress-stage {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: var(--spacing-xs);

              .stage-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--border-color);
                transition: background 0.3s ease;

                &.active,
                .progress-stage.active & {
                  background: var(--primary-color);
                }
              }

              .stage-label {
                font-size: var(--text-xs);
                color: var(--text-secondary);
              }

              &.active {
                .stage-label {
                  color: var(--primary-color);
                  font-weight: var(--font-medium);
                }
              }
            }
          }
        }

        .current-stage {
          text-align: center;
          font-size: var(--text-sm);
          color: var(--text-primary);
          font-weight: var(--font-medium);
        }
      }

      // 操作记录
      .operations-list {
        padding: 0 var(--spacing-md);

        .operation-item {
          background: var(--bg-color-page);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-sm);

          &:last-child {
            margin-bottom: 0;
          }

          .operation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-xs);

            .operator {
              font-weight: var(--font-medium);
              color: var(--text-primary);
            }
          }

          .operation-note {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .operation-time {
            font-size: var(--text-xs);
            color: var(--text-tertiary);
          }
        }
      }
    }

    // 单元格标题样式
    .cell-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    // 步骤时间样式
    .step-time {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: var(--spacing-xs);
    }
  }

  // 底部按钮
  .dialog-footer {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    padding-top: 0;

    .van-button {
      flex: 1;
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xs)) {
  .reward-detail-dialog {
    :deep(.van-dialog) {
      margin: var(--spacing-md);
      max-height: 75vh;
    }

    .reward-detail {
      .detail-section {
        .reward-info-cards {
          .info-card {
            .info-icon {
              width: 32px;
              height: 32px;
            }

            .info-content {
              .info-value {
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