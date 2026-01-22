<template>
  <div class="kindergarten-rewards">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <UnifiedIcon name="star" size="var(--icon-md)" />
            推荐奖励
          </h1>
          <p class="page-subtitle">查看和管理您的推荐奖励，邀请好友一起加入我们的大家庭</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="refreshRewards">
            <UnifiedIcon name="refresh" :size="40" />
            刷新奖励
          </el-button>
        </div>
      </div>
    </div>

    <!-- 奖励统计卡片 -->
    <div class="rewards-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card available">
            <div class="stat-content">
              <div class="stat-icon">
                <UnifiedIcon name="checkcircle" :size="40" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.availableRewards }}</div>
                <div class="stat-label">可用奖励</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card used">
            <div class="stat-content">
              <div class="stat-icon">
                <UnifiedIcon name="download" :size="40" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.usedRewards }}</div>
                <div class="stat-label">已使用</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card expired">
            <div class="stat-content">
              <div class="stat-icon">
                <UnifiedIcon name="warning" :size="40" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.expiredRewards }}</div>
                <div class="stat-label">已过期</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card total">
            <div class="stat-content">
              <div class="stat-icon">
                <UnifiedIcon name="star" :size="40" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalRewards }}</div>
                <div class="stat-label">累计奖励</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 奖励列表 -->
    <div class="rewards-content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select
          v-model="filterStatus"
          placeholder="筛选状态"
          style="width: 120px; margin-right: var(--spacing-3);"
          @change="filterRewards"
        >
          <el-option label="全部" value="" />
          <el-option label="可用" value="available" />
          <el-option label="已使用" value="used" />
          <el-option label="已过期" value="expired" />
        </el-select>
      </div>

      <!-- 奖励列表 / 空状态 -->
      <div v-if="filteredRewards.length === 0" class="empty-state">
        <el-empty description="暂无奖励数据" />
      </div>
      <div v-else class="rewards-grid">
        <div
          v-for="reward in filteredRewards"
          :key="reward.id"
          class="reward-item"
          :class="getRewardStatusClass(reward)"
        >
          <div class="reward-header">
            <div class="reward-type-icon">
              <UnifiedIcon v-if="reward.type === 'voucher'" name="download" :size="40" />
              <UnifiedIcon v-else-if="reward.type === 'gift'" name="star" :size="40" />
              <UnifiedIcon v-else-if="reward.type === 'points'" name="star" :size="40" />
              <UnifiedIcon v-else name="star" :size="40" />
            </div>
            <div class="reward-info">
              <h3 class="reward-title">{{ reward.title }}</h3>
              <p class="reward-description">{{ reward.description }}</p>
            </div>
            <div class="reward-status">
              <el-tag
                :type="getStatusTagType(reward.status)"
                size="small"
              >
                {{ getStatusText(reward.status) }}
              </el-tag>
            </div>
          </div>

          <div class="reward-details">
            <div class="detail-row">
              <span class="label">获得时间：</span>
              <span class="value">{{ reward.obtainDate }}</span>
            </div>
            <div class="detail-row">
              <span class="label">有效期：</span>
              <span class="value">{{ reward.expiryDate }}</span>
            </div>
            <div v-if="reward.type === 'voucher'" class="detail-row">
              <span class="label">面值：</span>
              <span class="value highlight">￥{{ reward.voucherValue }}</span>
            </div>
            <div v-if="reward.type === 'points'" class="detail-row">
              <span class="label">积分：</span>
              <span class="value highlight">{{ reward.points }}分</span>
            </div>
            <div v-if="reward.status === 'used' && reward.usedDate" class="detail-row">
              <span class="label">使用时间：</span>
              <span class="value">{{ reward.usedDate }}</span>
            </div>
          </div>

          <div class="reward-actions">
            <el-button text type="primary" size="small" @click="handleViewDetail(reward)">
              查看详情
            </el-button>
            <el-button
              v-if="reward.status === 'available'"
              text
              type="success"
              size="small"
            >
              使用
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 奖励详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="奖励详情"
      width="500px"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedReward" class="reward-detail">
        <div class="detail-header">
          <div class="detail-icon">
            <UnifiedIcon v-if="selectedReward.type === 'voucher'" name="download" :size="40" />
            <UnifiedIcon v-else-if="selectedReward.type === 'gift'" name="star" :size="40" />
            <UnifiedIcon v-else-if="selectedReward.type === 'points'" name="star" :size="40" />
            <UnifiedIcon v-else name="star" :size="40" />
          </div>
          <div class="detail-title-section">
            <h3>{{ selectedReward.title }}</h3>
            <el-tag :type="getStatusTagType(selectedReward.status)">
              {{ getStatusText(selectedReward.status) }}
            </el-tag>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-item">
            <span class="item-label">描述：</span>
            <span class="item-value">{{ selectedReward.description }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">类型：</span>
            <span class="item-value">{{ selectedReward.type === 'voucher' ? '代金券' : selectedReward.type === 'gift' ? '礼品' : selectedReward.type === 'points' ? '积分' : '其他' }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">获得时间：</span>
            <span class="item-value">{{ selectedReward.obtainDate }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">有效期：</span>
            <span class="item-value">{{ selectedReward.expiryDate }}</span>
          </div>
          <div v-if="selectedReward.type === 'voucher'" class="detail-item">
            <span class="item-label">面值：</span>
            <span class="item-value highlight">￥{{ selectedReward.voucherValue }}</span>
          </div>
          <div v-if="selectedReward.type === 'points'" class="detail-item">
            <span class="item-label">积分：</span>
            <span class="item-value highlight">{{ selectedReward.points }}分</span>
          </div>
          <div v-if="selectedReward.status === 'used' && selectedReward.usedDate" class="detail-item">
            <span class="item-label">使用时间：</span>
            <span class="item-value">{{ selectedReward.usedDate }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { getParentRewards } from '@/api/modules/parent-rewards'

// 真实数据 - 园所奖励列表
const rewards = ref([])
const stats = ref({
  availableRewards: 0,
  usedRewards: 0,
  expiredRewards: 0,
  totalRewards: 0
})
const loading = ref(false)

// 加载奖励数据
const loadRewards = async () => {
  try {
    loading.value = true
    const response = await getParentRewards()

    if (response.success) {
      rewards.value = response.data.rewards
      stats.value = response.data.stats
    } else {
      ElMessage.error(response.message || '获取奖励数据失败')
    }
  } catch (error) {
    console.error('加载奖励数据失败:', error)
    ElMessage.error('加载奖励数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadRewards()
})

const filterStatus = ref('')
const selectedReward = ref<any>(null)
const showDetailDialog = ref(false)

const filteredRewards = computed(() => {
  if (!filterStatus.value) return rewards.value
  return rewards.value.filter(r => r.status === filterStatus.value)
})

const handleViewDetail = (reward: any) => {
  selectedReward.value = reward
  showDetailDialog.value = true
}

const handleDetailClose = () => {
  showDetailDialog.value = false
  selectedReward.value = null
}

const refreshRewards = async () => {
  await loadRewards()
  ElMessage.success('奖励已刷新')
}

const getRewardStatusClass = (reward: any) => {
  return `status-${reward.status}`
}

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, any> = {
    'available': 'success',
    'used': 'info',
    'expired': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'available': '可用',
    'used': '已使用',
    'expired': '已过期'
  }
  return statusMap[status] || status
}

const filterRewards = () => {
  // 过滤逻辑已在 computed 中处理
}
</script>

<style lang="scss" scoped>
/* 使用设计令牌 */

/* ==================== 园所奖励页面 ==================== */
.kindergarten-rewards {
  padding: var(--spacing-xl);
  max-width: var(--breakpoint-2xl);
  margin: 0 auto;

  .page-header {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-color-lighter);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-lg);
    }

    .title-section {
      flex: 1;

      .page-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-text-color-primary);

        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 20px;
          background: linear-gradient(180deg, var(--el-color-warning) 0%, var(--el-color-warning-light-3) 100%);
          border-radius: 2px;
        }
      }

      .page-subtitle {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: var(--text-sm);
        padding-left: var(--spacing-lg);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

.rewards-stats {
  margin-bottom: var(--spacing-xl);

  .stat-card {
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border-color-lighter);
    transition: all var(--transition-base);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    &.available {
      border-left: 4px solid var(--el-color-success);
    }

    &.used {
      border-left: 4px solid var(--el-color-info);
    }

    &.expired {
      border-left: 4px solid var(--el-color-danger);
    }

    &.total {
      border-left: 4px solid var(--el-color-warning);
    }

    :deep(.el-card__body) {
      padding: var(--spacing-md);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .stat-icon {
        font-size: var(--text-2xl);
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full);
        background: var(--el-fill-color-light);
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        line-height: 1;
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.rewards-content {
  margin-bottom: var(--spacing-xl);

  .filter-bar {
    margin-bottom: var(--spacing-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    :deep(.el-select) {
      width: 120px;
    }
  }
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--spacing-lg);
}

.reward-item {
  border: 1px solid var(--border-color-lighter);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--el-color-primary-light-3);
  }

  &.status-available {
    border-top: 3px solid var(--el-color-success);
  }

  &.status-used {
    border-top: 3px solid var(--el-color-info);
    opacity: 0.8;
  }

  &.status-expired {
    border-top: 3px solid var(--el-color-danger);
    opacity: 0.7;
  }

  .reward-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .reward-type-icon {
      font-size: var(--text-xl);
      color: var(--el-color-warning);
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--el-color-warning-light-9) 0%, var(--el-color-warning-light-8) 100%);
      border-radius: var(--radius-md);
    }

    .reward-info {
      flex: 1;
      min-width: 0;

      .reward-title {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--el-text-color-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .reward-description {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
        line-height: var(--leading-normal);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
    }

    .reward-status {
      flex-shrink: 0;
    }
  }

  .reward-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm) 0;
    border-top: 1px solid var(--border-color-lighter);
    border-bottom: 1px solid var(--border-color-lighter);

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--text-sm);

      .label {
        color: var(--el-text-color-secondary);
      }

      .value {
        color: var(--el-text-color-primary);
        font-weight: 500;

        &.highlight {
          color: var(--el-color-success);
          font-weight: 600;
          font-size: var(--text-base);
        }
      }
    }
  }

  .reward-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
}

.reward-detail {
  padding: var(--spacing-md) 0;

  .detail-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-color-lighter);

    .detail-icon {
      font-size: var(--text-2xl);
      color: var(--el-color-warning);
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--el-color-warning-light-9) 0%, var(--el-color-warning-light-8) 100%);
      border-radius: var(--radius-full);
    }

    .detail-title-section {
      flex: 1;

      h3 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }

  .detail-content {
    .detail-item {
      display: flex;
      margin-bottom: var(--spacing-md);
      align-items: flex-start;

      .item-label {
        width: 80px;
        font-weight: 500;
        color: var(--el-text-color-secondary);
        flex-shrink: 0;
      }

      .item-value {
        flex: 1;
        color: var(--el-text-color-primary);
        word-break: break-word;
        line-height: var(--leading-relaxed);

        &.highlight {
          color: var(--el-color-success);
          font-weight: 600;
          font-size: var(--text-lg);
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-lighter);
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-md)) {
  .kindergarten-rewards {
    padding: var(--spacing-md);

    .page-header {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }

      .title-section {
        .page-title {
          font-size: var(--text-lg);
        }
      }

      .header-actions {
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }
  }

  .rewards-stats {
    .el-col {
      margin-bottom: var(--spacing-sm);
    }
  }

  .rewards-grid {
    grid-template-columns: 1fr;
  }

  .reward-item {
    .reward-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    .reward-actions {
      justify-content: center;
    }
  }

  .filter-bar {
    width: 100%;
    flex-wrap: wrap;

    :deep(.el-select) {
      width: 100% !important;
    }
  }
}
</style>
