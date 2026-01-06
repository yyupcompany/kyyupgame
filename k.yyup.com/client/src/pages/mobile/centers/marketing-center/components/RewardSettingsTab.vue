<template>
  <div class="mobile-reward-settings-tab">
    <!-- 奖励规则设置 -->
    <div class="settings-section">
      <van-cell-group title="奖励规则设置">
        <van-field label="到访奖励" :border="false">
          <template #input>
            <div class="input-with-unit">
              <van-stepper
                v-model="rewardSettings.visitReward"
                :min="0"
                :max="10000"
                :step="50"
                input-width="80px"
                button-size="28px"
              />
              <span class="unit">元</span>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('到访奖励', '被推荐人到访参观后发放的奖励')" />
          </template>
        </van-field>

        <van-field label="体验课奖励" :border="false">
          <template #input>
            <div class="input-with-unit">
              <van-stepper
                v-model="rewardSettings.trialReward"
                :min="0"
                :max="10000"
                :step="50"
                input-width="80px"
                button-size="28px"
              />
              <span class="unit">元</span>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('体验课奖励', '被推荐人参加体验课程后发放的奖励')" />
          </template>
        </van-field>

        <van-field label="报名奖励" :border="false">
          <template #input>
            <div class="input-with-unit">
              <van-stepper
                v-model="rewardSettings.enrollmentReward"
                :min="0"
                :max="50000"
                :step="100"
                input-width="80px"
                button-size="28px"
              />
              <span class="unit">元</span>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('报名奖励', '被推荐人成功报名缴费后发放的奖励')" />
          </template>
        </van-field>
      </van-cell-group>
    </div>

    <!-- 多层级奖励设置 -->
    <div class="settings-section">
      <van-cell-group title="多层级奖励设置">
        <van-field label="二级推荐奖励" :border="false">
          <template #input>
            <div class="input-with-unit">
              <van-stepper
                v-model="rewardSettings.secondaryRewardRate"
                :min="0"
                :max="100"
                :step="5"
                input-width="80px"
                button-size="28px"
              />
              <span class="unit">%</span>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('二级推荐奖励', '二级推荐（推荐人的推荐人）获得奖励的比例')" />
          </template>
        </van-field>

        <van-field label="三级推荐奖励" :border="false">
          <template #input>
            <div class="input-with-unit">
              <van-stepper
                v-model="rewardSettings.tertiaryRewardRate"
                :min="0"
                :max="50"
                :step="5"
                input-width="80px"
                button-size="28px"
              />
              <span class="unit">%</span>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('三级推荐奖励', '三级推荐获得奖励的比例')" />
          </template>
        </van-field>
      </van-cell-group>
    </div>

    <!-- 角色差异化设置 -->
    <div class="settings-section">
      <van-cell-group title="角色差异化设置">
        <van-field label="教师奖励倍数" :border="false">
          <template #input>
            <van-stepper
              v-model="roleSettings.teacherMultiplier"
              :min="0.5"
              :max="3"
              :step="0.1"
              input-width="80px"
              button-size="28px"
              decimal-length="1"
            />
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('教师奖励倍数', '教师获得奖励的基础倍数')" />
          </template>
        </van-field>

        <van-field label="家长奖励倍数" :border="false">
          <template #input>
            <van-stepper
              v-model="roleSettings.parentMultiplier"
              :min="0.5"
              :max="3"
              :step="0.1"
              input-width="80px"
              button-size="28px"
              decimal-length="1"
            />
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('家长奖励倍数', '家长获得奖励的基础倍数')" />
          </template>
        </van-field>

        <van-field label="园长奖励倍数" :border="false">
          <template #input>
            <van-stepper
              v-model="roleSettings.principalMultiplier"
              :min="0.5"
              :max="3"
              :step="0.1"
              input-width="80px"
              button-size="28px"
              decimal-length="1"
            />
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('园长奖励倍数', '园长获得奖励的基础倍数')" />
          </template>
        </van-field>
      </van-cell-group>
    </div>

    <!-- 其他设置 -->
    <div class="settings-section">
      <van-cell-group title="其他设置">
        <van-field label="自动发放奖励">
          <template #right-icon>
            <van-switch
              v-model="otherSettings.autoRewardEnabled"
              size="20px"
            />
          </template>
        </van-field>

        <van-field label="推荐码有效期">
          <template #input>
            <van-stepper
              v-model="otherSettings.referralCodeValidity"
              :min="7"
              :max="365"
              :step="1"
              input-width="80px"
              button-size="28px"
            />
            <span class="unit">天</span>
          </template>
        </van-field>

        <van-field label="奖励通知">
          <template #right-icon>
            <van-switch
              v-model="otherSettings.notificationEnabled"
              size="20px"
            />
          </template>
        </van-field>

        <van-field label="奖励冷却期">
          <template #input>
            <van-stepper
              v-model="otherSettings.cooldownPeriod"
              :min="0"
              :max="30"
              :step="1"
              input-width="80px"
              button-size="28px"
            />
            <span class="unit">小时</span>
          </template>
          <template #right-icon>
            <van-icon name="question-o" @click="showHelp('奖励冷却期', '同一推荐人可再次获得奖励的最小时间间隔')" />
          </template>
        </van-field>
      </van-cell-group>
    </div>

    <!-- 预览卡片 -->
    <div class="preview-section">
      <van-cell-group title="奖励预览">
        <div class="preview-cards">
          <div class="preview-card" v-for="preview in rewardPreviews" :key="preview.role">
            <div class="preview-header">
              <van-icon :name="getRoleIcon(preview.role)" />
              <span>{{ preview.roleName }}</span>
            </div>
            <div class="preview-amounts">
              <div class="amount-item">
                <span class="label">到访</span>
                <span class="amount">¥{{ preview.visitReward }}</span>
              </div>
              <div class="amount-item">
                <span class="label">体验</span>
                <span class="amount">¥{{ preview.trialReward }}</span>
              </div>
              <div class="amount-item">
                <span class="label">报名</span>
                <span class="amount">¥{{ preview.enrollmentReward }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-cell-group>
    </div>

    <!-- 保存按钮 -->
    <div class="save-section">
      <van-button
        type="primary"
        block
        size="large"
        :loading="saving"
        @click="handleSaveSettings"
      >
        保存设置
      </van-button>
    </div>

    <!-- 帮助弹窗 -->
    <van-dialog
      v-model:show="showHelpDialog"
      :title="helpTitle"
      :show-confirm-button="true"
      confirm-button-text="知道了"
    >
      <div class="help-content">
        {{ helpContent }}
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
  loading: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const saving = ref(false)
const showHelpDialog = ref(false)
const helpTitle = ref('')
const helpContent = ref('')

// 奖励设置
const rewardSettings = reactive({
  visitReward: 50,
  trialReward: 100,
  enrollmentReward: 500,
  secondaryRewardRate: 20,
  tertiaryRewardRate: 10
})

// 角色设置
const roleSettings = reactive({
  teacherMultiplier: 1.0,
  parentMultiplier: 1.2,
  principalMultiplier: 1.5
})

// 其他设置
const otherSettings = reactive({
  autoRewardEnabled: true,
  referralCodeValidity: 30,
  notificationEnabled: true,
  cooldownPeriod: 24
})

// 奖励预览
const rewardPreviews = computed(() => [
  {
    role: 'teacher',
    roleName: '教师',
    visitReward: (rewardSettings.visitReward * roleSettings.teacherMultiplier).toFixed(2),
    trialReward: (rewardSettings.trialReward * roleSettings.teacherMultiplier).toFixed(2),
    enrollmentReward: (rewardSettings.enrollmentReward * roleSettings.teacherMultiplier).toFixed(2)
  },
  {
    role: 'parent',
    roleName: '家长',
    visitReward: (rewardSettings.visitReward * roleSettings.parentMultiplier).toFixed(2),
    trialReward: (rewardSettings.trialReward * roleSettings.parentMultiplier).toFixed(2),
    enrollmentReward: (rewardSettings.enrollmentReward * roleSettings.parentMultiplier).toFixed(2)
  },
  {
    role: 'principal',
    roleName: '园长',
    visitReward: (rewardSettings.visitReward * roleSettings.principalMultiplier).toFixed(2),
    trialReward: (rewardSettings.trialReward * roleSettings.principalMultiplier).toFixed(2),
    enrollmentReward: (rewardSettings.enrollmentReward * roleSettings.principalMultiplier).toFixed(2)
  }
])

// 显示帮助信息
const showHelp = (title: string, content: string) => {
  helpTitle.value = title
  helpContent.value = content
  showHelpDialog.value = true
}

// 获取角色图标
const getRoleIcon = (role: string) => {
  const iconMap = {
    teacher: 'manager-o',
    parent: 'friends-o',
    principal: 'medal-o'
  }
  return iconMap[role] || 'user-o'
}

// 加载设置
const loadSettings = async () => {
  try {
    const response = await MarketingPerformanceService.getRewardSettings()

    // 更新奖励设置
    Object.assign(rewardSettings, response.rewardSettings)

    // 更新角色设置
    Object.assign(roleSettings, response.roleSettings)

    // 更新其他设置
    Object.assign(otherSettings, response.otherSettings)

  } catch (error) {
    console.error('加载设置失败:', error)
    showToast('加载设置失败')
  }
}

// 保存设置
const handleSaveSettings = async () => {
  try {
    await showConfirmDialog({
      title: '确认保存',
      message: '确定要保存当前的奖励设置吗？这将影响后续的奖励计算。',
      confirmButtonText: '确认保存',
      cancelButtonText: '取消'
    })

    saving.value = true

    const settingsData = {
      rewardSettings: { ...rewardSettings },
      roleSettings: { ...roleSettings },
      otherSettings: { ...otherSettings }
    }

    await MarketingPerformanceService.updateRewardSettings(settingsData)

    showToast('设置保存成功')
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存设置失败:', error)
      showToast('保存设置失败')
    }
  } finally {
    saving.value = false
  }
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
@use '@/pages/mobile/styles/mobile-design-tokens.scss' as *;

.mobile-reward-settings-tab {
  padding: var(--spacing-md);

  .settings-section {
    margin-bottom: var(--spacing-lg);

    :deep(.van-cell-group__title) {
      color: var(--text-primary);
      font-weight: var(--font-medium);
      padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm) var(--spacing-md);
    }

    :deep(.van-field__label) {
      color: var(--text-primary);
      font-weight: var(--font-medium);
    }

    .input-with-unit {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .unit {
        color: var(--text-secondary);
        font-size: var(--text-sm);
      }
    }

    :deep(.van-icon) {
      color: var(--text-secondary);
      cursor: pointer;

      &:active {
        color: var(--primary-color);
      }
    }
  }

  // 预览卡片
  .preview-section {
    margin-bottom: var(--spacing-lg);

    .preview-cards {
      padding: var(--spacing-md);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .preview-card {
        background: var(--bg-color-page);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        border: 1px solid var(--border-light);

        .preview-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          font-weight: var(--font-medium);
          color: var(--text-primary);

          .van-icon {
            color: var(--primary-color);
            font-size: var(--text-lg);
          }
        }

        .preview-amounts {
          display: flex;
          justify-content: space-between;

          .amount-item {
            text-align: center;
            flex: 1;

            .label {
              display: block;
              font-size: var(--text-xs);
              color: var(--text-secondary);
              margin-bottom: var(--spacing-xs);
            }

            .amount {
              display: block;
              font-size: var(--text-base);
              font-weight: var(--font-bold);
              color: var(--success-color);
            }
          }
        }
      }
    }
  }

  // 保存按钮
  .save-section {
    padding: var(--spacing-md);
    padding-top: var(--spacing-lg);

    .van-button {
      height: 48px;
      font-size: var(--text-base);
      font-weight: var(--font-medium);
    }
  }

  // 帮助弹窗
  .help-content {
    padding: var(--spacing-lg);
    font-size: var(--text-sm);
    color: var(--text-primary);
    line-height: 1.6;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xs)) {
  .mobile-reward-settings-tab {
    padding: var(--spacing-sm);

    .settings-section {
      margin-bottom: var(--spacing-md);
    }

    .preview-section {
      .preview-cards {
        .preview-card {
          .preview-amounts {
            .amount-item {
              .amount {
                font-size: var(--text-sm);
              }
            }
          }
        }
      }
    }

    .save-section {
      padding: var(--spacing-sm);
      padding-top: var(--spacing-md);
    }
  }
}
</style>