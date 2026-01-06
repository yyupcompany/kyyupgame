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
.kindergarten-rewards {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
  background: var(--bg-color);
}

.page-header {
  margin-bottom: var(--spacing-2xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
}

.title-section {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-color);
}

.page-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.rewards-stats {
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.stat-icon {
  font-size: var(--text-3xl);
  opacity: 0.9;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-color);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 4px;
}

.rewards-content {
  margin-bottom: var(--spacing-2xl);
}

.filter-bar {
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.reward-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  transition: all var(--transition-base);
}

.reward-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.reward-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.reward-type-icon {
  font-size: var(--text-2xl);
  color: var(--primary-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.reward-info {
  flex: 1;
  min-width: 0;
}

.reward-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
}

.reward-description {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.reward-status {
  flex-shrink: 0;
}

.reward-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--border-color-light);
  border-bottom: 1px solid var(--border-color-light);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}

.label {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.value {
  color: var(--text-color);
  font-weight: var(--font-weight-medium);
}

.value.highlight {
  color: var(--primary-color);
  font-weight: bold;
  font-size: var(--text-base);
}

.reward-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.reward-detail {
  padding: var(--spacing-lg) 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
}

.detail-icon {
  font-size: var(--text-3xl);
  color: var(--primary-color);
}

.detail-title-section h3 {
  margin: 0 0 8px 0;
  font-size: var(--text-lg);
  font-weight: bold;
}

.detail-item {
  display: flex;
  margin-bottom: var(--spacing-md);
  align-items: flex-start;
}

.item-label {
  width: 80px;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.item-value {
  flex: 1;
  color: var(--text-color);
  word-break: break-word;
}

.item-value.highlight {
  color: var(--primary-color);
  font-weight: bold;
  font-size: var(--text-lg);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

@media (max-width: var(--breakpoint-md)) {
  .kindergarten-rewards {
    padding: var(--spacing-lg);
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .rewards-stats .el-col {
    margin-bottom: var(--spacing-md);
  }

  .rewards-grid {
    grid-template-columns: 1fr;
  }

  .reward-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .filter-bar {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
