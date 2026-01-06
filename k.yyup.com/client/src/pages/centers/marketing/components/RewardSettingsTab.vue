<template>
  <div class="reward-settings-tab">
    <el-row :gutter="20">
      <!-- 奖励规则设置 -->
      <el-col :xs="24" :md="12">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>奖励规则设置</span>
              <el-button type="primary" size="small" @click="handleSaveSettings">
                保存设置
              </el-button>
            </div>
          </template>

          <el-form :model="rewardSettings" label-width="120px">
            <!-- 到访奖励 -->
            <el-form-item label="到访奖励">
              <el-input-number
                v-model="rewardSettings.visitReward"
                :min="0"
                :max="10000"
                :step="50"
                controls-position="right"
              />
              <span class="unit">元</span>
              <el-tooltip content="被推荐人到访参观后发放的奖励" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 体验课奖励 -->
            <el-form-item label="体验课奖励">
              <el-input-number
                v-model="rewardSettings.trialReward"
                :min="0"
                :max="10000"
                :step="50"
                controls-position="right"
              />
              <span class="unit">元</span>
              <el-tooltip content="被推荐人参加体验课程后发放的奖励" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 报名奖励 -->
            <el-form-item label="报名奖励">
              <el-input-number
                v-model="rewardSettings.enrollmentReward"
                :min="0"
                :max="50000"
                :step="100"
                controls-position="right"
              />
              <span class="unit">元</span>
              <el-tooltip content="被推荐人成功报名缴费后发放的奖励" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 多层级奖励设置 -->
            <el-divider content-position="left">多层级奖励</el-divider>

            <!-- 二级推荐奖励 -->
            <el-form-item label="二级推荐奖励">
              <el-input-number
                v-model="rewardSettings.secondaryRewardRate"
                :min="0"
                :max="100"
                :step="5"
                controls-position="right"
              />
              <span class="unit">%</span>
              <el-tooltip content="二级推荐（推荐人的推荐人）获得奖励的比例" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 三级推荐奖励 -->
            <el-form-item label="三级推荐奖励">
              <el-input-number
                v-model="rewardSettings.tertiaryRewardRate"
                :min="0"
                :max="50"
                :step="5"
                controls-position="right"
              />
              <span class="unit">%</span>
              <el-tooltip content="三级推荐获得奖励的比例" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 角色差异化设置 -->
      <el-col :xs="24" :md="12">
        <el-card class="settings-card">
          <template #header>
            <span>角色差异化设置</span>
          </template>

          <el-form :model="roleSettings" label-width="120px">
            <!-- 教师奖励倍数 -->
            <el-form-item label="教师奖励倍数">
              <el-input-number
                v-model="roleSettings.teacherMultiplier"
                :min="0.5"
                :max="3"
                :step="0.1"
                controls-position="right"
              />
              <el-tooltip content="教师获得奖励的基础倍数" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 家长奖励倍数 -->
            <el-form-item label="家长奖励倍数">
              <el-input-number
                v-model="roleSettings.parentMultiplier"
                :min="0.5"
                :max="3"
                :step="0.1"
                controls-position="right"
              />
              <el-tooltip content="家长获得奖励的基础倍数" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 园长奖励倍数 -->
            <el-form-item label="园长奖励倍数">
              <el-input-number
                v-model="roleSettings.principalMultiplier"
                :min="0.5"
                :max="3"
                :step="0.1"
                controls-position="right"
              />
              <el-tooltip content="园长获得奖励的基础倍数" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <el-divider content-position="left">其他设置</el-divider>

            <!-- 自动发放奖励 -->
            <el-form-item label="自动发放">
              <el-switch
                v-model="rewardSettings.autoPay"
                active-text="开启"
                inactive-text="关闭"
              />
              <el-tooltip content="是否自动发放符合条件的奖励" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 最小发放金额 -->
            <el-form-item label="最小发放金额">
              <el-input-number
                v-model="rewardSettings.minPayAmount"
                :min="1"
                :max="1000"
                :step="10"
                controls-position="right"
              />
              <span class="unit">元</span>
              <el-tooltip content="达到此金额才发放奖励，避免频繁小额发放" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 奖励规则预览 -->
    <el-card class="preview-card">
      <template #header>
        <span>奖励规则预览</span>
      </template>

      <div class="reward-preview">
        <el-table :data="previewData" border>
          <el-table-column prop="role" label="角色" width="100" />
          <el-table-column prop="visit" label="到访奖励" width="120">
            <template #default="{ row }">
              <span class="reward-amount">¥{{ row.visit }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="trial" label="体验课奖励" width="120">
            <template #default="{ row }">
              <span class="reward-amount">¥{{ row.trial }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="enrollment" label="报名奖励" width="120">
            <template #default="{ row }">
              <span class="reward-amount">¥{{ row.enrollment }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="secondary" label="二级推荐" width="120">
            <template #default="{ row }">
              <span class="reward-amount">¥{{ row.secondary }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="tertiary" label="三级推荐" width="120">
            <template #default="{ row }">
              <span class="reward-amount">¥{{ row.tertiary }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="total" label="总计" width="120">
            <template #default="{ row }">
              <span class="total-amount">¥{{ row.total }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 历史设置记录 -->
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <span>设置变更历史</span>
          <el-button size="small" @click="loadHistory">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="historyData" stripe>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="changeType" label="变更类型" width="150">
          <template #default="{ row }">
            <el-tag size="small" :type="getChangeTypeTagType(row.changeType)">
              {{ row.changeType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="oldValue" label="原值" width="120" />
        <el-table-column prop="newValue" label="新值" width="120" />
        <el-table-column prop="reason" label="变更原因" />
        <el-table-column prop="createdAt" label="变更时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled, Refresh } from '@element-plus/icons-vue'

import MarketingPerformanceService from '@/services/marketing-performance.service'

// Emits
const emit = defineEmits<{
  'settings-changed': []
}>()

// 响应式数据
const rewardSettings = reactive({
  visitReward: 50,
  trialReward: 100,
  enrollmentReward: 500,
  secondaryRewardRate: 20,
  tertiaryRewardRate: 10,
  autoPay: false,
  minPayAmount: 50
})

const roleSettings = reactive({
  teacherMultiplier: 1.2,
  parentMultiplier: 1.0,
  principalMultiplier: 1.5
})

const historyData = ref([])

// 计算预览数据
const previewData = computed(() => {
  const roles = [
    { name: '教师', multiplier: roleSettings.teacherMultiplier },
    { name: '家长', multiplier: roleSettings.parentMultiplier },
    { name: '园长', multiplier: roleSettings.principalMultiplier }
  ]

  return roles.map(role => {
    const visit = Math.round(rewardSettings.visitReward * role.multiplier)
    const trial = Math.round(rewardSettings.trialReward * role.multiplier)
    const enrollment = Math.round(rewardSettings.enrollmentReward * role.multiplier)
    const secondary = Math.round(enrollment * rewardSettings.secondaryRewardRate / 100)
    const tertiary = Math.round(enrollment * rewardSettings.tertiaryRewardRate / 100)
    const total = visit + trial + enrollment + secondary + tertiary

    return {
      role: role.name,
      visit,
      trial,
      enrollment,
      secondary,
      tertiary,
      total
    }
  })
})

// 保存设置
const handleSaveSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '确认保存新的奖励设置？这将影响后续所有奖励计算。',
      '保存设置',
      {
        confirmButtonText: '确认保存',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const settings = {
      ...rewardSettings,
      roleMultipliers: roleSettings
    }

    await MarketingPerformanceService.updateRewardSettings(settings)
    ElMessage.success('奖励设置保存成功')
    emit('settings-changed')
    loadHistory()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存设置失败:', error)
      ElMessage.error('保存设置失败')
    }
  }
}

// 加载当前设置
const loadCurrentSettings = async () => {
  try {
    const settings = await MarketingPerformanceService.getRewardSettings()

    Object.assign(rewardSettings, settings.baseSettings)
    Object.assign(roleSettings, settings.roleMultipliers)
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 加载变更历史
const loadHistory = async () => {
  try {
    const response = await MarketingPerformanceService.getSettingsHistory()
    historyData.value = response.data
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 工具函数
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getChangeTypeTagType = (type: string) => {
  const typeMap = {
    '基础设置': 'primary',
    '角色设置': 'success',
    '多层级设置': 'warning',
    '自动发放': 'info'
  }
  return typeMap[type] || 'info'
}

// 组件挂载时加载数据
onMounted(() => {
  loadCurrentSettings()
  loadHistory()
})
</script>

<style scoped lang="scss">
.reward-settings-tab {
  .settings-card {
    margin-bottom: var(--text-2xl);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .el-form {
      .unit {
        margin-left: var(--spacing-sm);
        color: var(--text-secondary);
      }

      .help-icon {
        margin-left: var(--spacing-sm);
        color: var(--text-tertiary);
        cursor: help;
      }
    }
  }

  .preview-card {
    margin-bottom: var(--text-2xl);

    :deep(.el-table) {
      .reward-amount,
      .total-amount {
        font-weight: 600;

        &.total-amount {
          color: var(--primary-color);
          font-size: var(--text-lg);
        }

        &.reward-amount {
          color: var(--success-color);
        }
      }
    }
  }

  .history-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .reward-settings-tab {
    .el-row {
      .el-col {
        margin-bottom: var(--spacing-lg);
      }
    }

    .preview-card {
      :deep(.el-table) {
        font-size: var(--text-sm);

        .el-table__cell {
          padding: var(--spacing-sm);
        }
      }
    }
  }
}
</style>