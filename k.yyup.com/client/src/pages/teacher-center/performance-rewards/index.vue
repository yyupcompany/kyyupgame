<template>
  <UnifiedCenterLayout
    title="绩效奖励"
    description="查看和管理我的绩效奖励记录"
    icon="Star"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-select
        v-model="filterStatus"
        placeholder="筛选状态"
        style="width: 120px; margin-right: var(--spacing-md);"
        @change="filterRewards"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="可用" value="available"></el-option>
        <el-option label="已使用" value="used"></el-option>
        <el-option label="已过期" value="expired"></el-option>
      </el-select>
      <el-select
        v-model="filterType"
        placeholder="筛选类型"
        style="width: 140px;"
        @change="filterRewards"
      >
        <el-option label="全部类型" value=""></el-option>
        <el-option label="现金" value="cash"></el-option>
        <el-option label="代金券" value="voucher"></el-option>
        <el-option label="礼品" value="gift"></el-option>
        <el-option label="积分" value="points"></el-option>
      </el-select>
      <el-button type="primary" @click="refreshRewards">
        <UnifiedIcon name="refresh" :size="16" />
        刷新
      </el-button>
    </template>

    <!-- 统计卡片 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <StatCard
        icon="success"
        title="可用奖励"
        :value="stats.availableRewards"
        subtitle="未使用的奖励"
        type="success"
        :trend="stats.availableRewards > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="check"
        title="已使用"
        :value="stats.usedRewards"
        subtitle="已使用奖励"
        type="primary"
        :trend="stats.usedRewards > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="alert"
        title="已过期"
        :value="stats.expiredRewards"
        subtitle="过期奖励"
        type="danger"
        :trend="stats.expiredRewards > 0 ? 'down' : 'stable'"
        clickable
      />
      <StatCard
        icon="star"
        title="累计奖励"
        :value="stats.totalRewards"
        subtitle="累计获得奖励"
        type="warning"
        :trend="stats.totalRewards > 0 ? 'up' : 'stable'"
        clickable
      />
    </template>

    <!-- 奖励列表 -->
    <div class="rewards-content">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>我的奖励</span>
          </div>
        </template>

        <div v-loading="loading" class="rewards-list">
          <div v-if="filteredRewards.length === 0" class="empty-state">
            <el-empty description="暂无奖励记录">
              <el-button type="primary" @click="refreshRewards">刷新数据</el-button>
            </el-empty>
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
                  <UnifiedIcon v-if="reward.type === 'voucher'" name="ticket" :size="24" />
                  <UnifiedIcon v-else-if="reward.type === 'gift'" name="gift" :size="24" />
                  <UnifiedIcon v-else name="star" :size="24" />
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
                  <span class="label">奖励类型：</span>
                  <span class="value">{{ getTypeText(reward.type) }}</span>
                </div>
                <div class="detail-row" v-if="reward.value">
                  <span class="label">奖励价值：</span>
                  <span class="value highlight">{{ formatRewardValue(reward) }}</span>
                </div>
                <div class="detail-row" v-if="reward.expiryDate">
                  <span class="label">有效期至：</span>
                  <span class="value" :class="{ 'text-danger': isExpired(reward.expiryDate) }">
                    {{ formatDate(reward.expiryDate) }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">获得时间：</span>
                  <span class="value">{{ formatDate(reward.createdAt) }}</span>
                </div>
                <div class="detail-row" v-if="reward.source">
                  <span class="label">来源：</span>
                  <span class="value">{{ reward.source }}</span>
                </div>

                <!-- 分享带来的线索跟单进度 -->
                <div v-if="reward.shareInfo && reward.shareInfo.leads && reward.shareInfo.leads.length > 0" class="detail-row sop-progress-section">
                  <div class="sop-progress-container">
                    <div class="sop-header">
                      <UnifiedIcon name="share" :size="16" />
                      <span class="sop-title">分享带来的客户（{{ reward.shareInfo.leads.length }}个）</span>
                    </div>
                    <div class="sop-leads-list">
                      <div v-for="lead in reward.shareInfo.leads" :key="lead.id" class="lead-item">
                        <div class="lead-info">
                          <div class="lead-name">
                            <el-tag size="small" type="info">{{ lead.childName || lead.visitorName }}</el-tag>
                            <span class="lead-phone">{{ lead.visitorPhone }}</span>
                          </div>
                          <div class="lead-teacher">跟进教师：{{ lead.assignedTeacher }}</div>
                        </div>
                        <div class="lead-sop" v-if="lead.sopProgress">
                          <div class="sop-stage">
                            <UnifiedIcon name="trend" :size="14" />
                            <span class="stage-name">{{ lead.sopProgress.currentStage }}</span>
                            <el-progress
                              :percentage="lead.sopProgress.progress"
                              :stroke-width="6"
                              :show-text="false"
                              class="stage-progress"
                            />
                          </div>
                          <div class="sop-probability">
                            成功率：{{ lead.sopProgress.successProbability }}%
                          </div>
                        </div>
                        <div class="lead-status" v-else>
                          <el-tag :type="getLeadStatusType(lead.status)">
                            {{ lead.statusText }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="reward-actions">
                <el-button
                  v-if="reward.status === 'available' && reward.type === 'voucher'"
                  type="primary"
                  size="small"
                  @click="useReward(reward)"
                >
                  使用代金券
                </el-button>
                <el-button
                  v-if="reward.status === 'available'"
                  type="info"
                  size="small"
                  @click="viewRewardDetail(reward)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 奖励详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="奖励详情"
      width="500px"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedReward" class="reward-detail">
        <div class="detail-header">
          <div class="detail-icon">
            <UnifiedIcon v-if="selectedReward.type === 'voucher'" name="ticket" :size="32" />
            <UnifiedIcon v-else-if="selectedReward.type === 'gift'" name="gift" :size="32" />
            <UnifiedIcon v-else name="star" :size="32" />
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
            <span class="item-value">{{ getTypeText(selectedReward.type) }}</span>
          </div>
          <div class="detail-item" v-if="selectedReward.value">
            <span class="item-label">价值：</span>
            <span class="item-value highlight">{{ formatRewardValue(selectedReward) }}</span>
          </div>
          <div class="detail-item" v-if="selectedReward.expiryDate">
            <span class="item-label">有效期：</span>
            <span class="item-value">{{ formatDate(selectedReward.expiryDate) }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">获得时间：</span>
            <span class="item-value">{{ formatDate(selectedReward.createdAt) }}</span>
          </div>
          <div class="detail-item" v-if="selectedReward.source">
            <span class="item-label">来源：</span>
            <span class="item-value">{{ selectedReward.source }}</span>
          </div>
          <div v-if="selectedReward.usageInstructions" class="detail-item">
            <span class="item-label">使用说明：</span>
            <div class="item-value instruction-text">{{ selectedReward.usageInstructions }}</div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="selectedReward && selectedReward.status === 'available' && selectedReward.type === 'voucher'"
            type="primary"
            @click="useReward(selectedReward)"
          >
            使用代金券
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 使用代金券对话框 -->
    <el-dialog
      v-model="useVoucherDialogVisible"
      title="使用代金券"
      width="400px"
    >
      <div v-if="selectedVoucher" class="voucher-use">
        <div class="voucher-info">
          <h4>{{ selectedVoucher.title }}</h4>
          <p class="voucher-value">价值：{{ formatRewardValue(selectedVoucher) }}</p>
          <p class="voucher-expiry">有效期至：{{ formatDate(selectedVoucher.expiryDate) }}</p>
        </div>

        <div class="use-confirmation">
          <el-alert
            title="确认使用"
            type="warning"
            :closable="false"
          >
            确认要使用这个代金券吗？使用后将从可用奖励中移除。
          </el-alert>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="useVoucherDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="useVoucherLoading"
            @click="confirmUseVoucher"
          >
            确认使用
          </el-button>
        </span>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/centers/StatCard.vue'
import TeacherRewardsService, {
  type TeacherReward,
  type TeacherRewardStats
} from '@/api/modules/teacher-rewards'

// 响应式数据
const loading = ref(false)
const rewards = ref<TeacherReward[]>([])
const filterStatus = ref('')
const filterType = ref('')
const detailDialogVisible = ref(false)
const selectedReward = ref<TeacherReward | null>(null)
const useVoucherDialogVisible = ref(false)
const selectedVoucher = ref<TeacherReward | null>(null)
const useVoucherLoading = ref(false)

// 统计数据
const stats = reactive<TeacherRewardStats>({
  availableRewards: 0,
  usedRewards: 0,
  expiredRewards: 0,
  totalRewards: 0,
  totalValue: 0,
  availableValue: 0,
  usedValue: 0
})

// 计算属性
const filteredRewards = computed(() => {
  let filtered = rewards.value

  if (filterStatus.value) {
    filtered = filtered.filter(reward => reward.status === filterStatus.value)
  }

  if (filterType.value) {
    filtered = filtered.filter(reward => reward.type === filterType.value)
  }

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// 方法
const refreshRewards = async () => {
  loading.value = true
  try {
    const { rewards: rewardsData, stats: statsData } = await TeacherRewardsService.refreshRewardsData({
      status: filterStatus.value || undefined,
      type: filterType.value || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })

    rewards.value = rewardsData
    Object.assign(stats, statsData)

    ElMessage.success('奖励数据刷新成功')
  } catch (error: any) {
    console.error('刷新奖励失败:', error)

    // 如果API调用失败，使用模拟数据作为备用
    const mockRewards = [
      {
        id: 1,
        title: '亲子活动代金券',
        description: '可用于下次亲子活动报名',
        type: 'voucher',
        value: 50,
        currency: 'CNY',
        status: 'available',
        expiryDate: '2025-12-31',
        createdAt: '2025-11-01',
        source: '宝宝表现优秀奖励',
        usageInstructions: '在活动报名时选择使用代金券支付即可享受优惠'
      },
      {
        id: 2,
        title: '图书礼券',
        description: '精选绘本一本',
        type: 'gift',
        status: 'available',
        expiryDate: '2025-11-30',
        createdAt: '2025-10-28',
        source: '阅读活动积极参与'
      },
      {
        id: 3,
        title: '小星星积分',
        description: '表现优秀获得的小星星',
        type: 'points',
        value: 10,
        status: 'available',
        createdAt: '2025-10-25',
        source: '课堂表现奖励'
      },
      {
        id: 4,
        title: '体验课代金券',
        description: '免费体验课程一次',
        type: 'voucher',
        value: 100,
        currency: 'CNY',
        status: 'used',
        usedAt: '2025-10-20',
        createdAt: '2025-10-01',
        source: '新生入学礼包'
      },
      {
        id: 5,
        title: '过期代金券',
        description: '已过期的代金券',
        type: 'voucher',
        value: 30,
        currency: 'CNY',
        status: 'expired',
        expiryDate: '2025-10-31',
        createdAt: '2025-09-15',
        source: '活动参与奖励'
      }
    ]

    rewards.value = mockRewards
    updateStats()

    ElMessage.warning('API服务暂不可用，显示模拟数据')
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.availableRewards = rewards.value.filter(r => r.status === 'available').length
  stats.usedRewards = rewards.value.filter(r => r.status === 'used').length
  stats.expiredRewards = rewards.value.filter(r => r.status === 'expired').length
  stats.totalRewards = rewards.value.length
}

const filterRewards = () => {
  // 筛选逻辑在计算属性中处理
}

const getRewardStatusClass = (reward: any) => {
  return {
    'status-available': reward.status === 'available',
    'status-used': reward.status === 'used',
    'status-expired': reward.status === 'expired'
  }
}

const getStatusTagType = (status: string) => {
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

const getTypeText = (type: string) => {
  switch (type) {
    case 'cash': return '现金'
    case 'voucher': return '代金券'
    case 'gift': return '礼品'
    case 'points': return '积分'
    default: return '未知'
  }
}

const formatRewardValue = (reward: any) => {
  if (reward.type === 'voucher' && reward.currency) {
    return `¥${reward.value}`
  } else if (reward.type === 'points') {
    return `${reward.value} 积分`
  }
  return reward.value || ''
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const isExpired = (expiryDate: string) => {
  return new Date(expiryDate) < new Date()
}

const getLeadStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'pending': 'info',
    'assigned': 'warning',
    'following': 'primary',
    'converted': 'success',
    'abandoned': 'danger'
  }
  return typeMap[status] || 'info'
}

const viewRewardDetail = (reward: TeacherReward) => {
  selectedReward.value = reward
  detailDialogVisible.value = true
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedReward.value = null
}

const useReward = (reward: TeacherReward) => {
  selectedVoucher.value = reward
  useVoucherDialogVisible.value = true
}

const confirmUseVoucher = async () => {
  if (!selectedVoucher.value) return

  useVoucherLoading.value = true
  try {
    const result = await TeacherRewardsService.useVoucher(selectedVoucher.value.id, {
      useLocation: '家长端园所奖励页面',
      notes: '用户主动使用代金券'
    })

    if (result.success) {
      const rewardIndex = rewards.value.findIndex(r => r.id === selectedVoucher.value!.id)
      if (rewardIndex !== -1) {
        rewards.value[rewardIndex].status = 'used'
        rewards.value[rewardIndex].usedAt = new Date().toISOString().split('T')[0]
      }

      updateStats()
      useVoucherDialogVisible.value = false
      selectedVoucher.value = null

      ElMessage.success('代金券使用成功！')
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    console.error('使用代金券失败:', error)

    // 如果API调用失败，模拟使用成功的状态
    const rewardIndex = rewards.value.findIndex(r => r.id === selectedVoucher.value!.id)
    if (rewardIndex !== -1) {
      rewards.value[rewardIndex].status = 'used'
      rewards.value[rewardIndex].usedAt = new Date().toISOString().split('T')[0]
    }

    updateStats()
    useVoucherDialogVisible.value = false
    selectedVoucher.value = null

    ElMessage.warning('API服务暂不可用，模拟使用成功')
  } finally {
    useVoucherLoading.value = false
  }
}

onMounted(() => {
  refreshRewards()
})
</script>

<style lang="scss" scoped>
@use "@/styles/design-tokens.scss" as *;

// ==================== 奖励内容区域 ====================
.rewards-content {
  :deep(.el-card) {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: var(--text-lg);
  }
}

.rewards-list {
  min-height: 400px;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.reward-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &.status-available {
    border-left: 4px solid var(--success-color);
  }

  &.status-used {
    border-left: 4px solid var(--primary-color);
    opacity: 0.8;
  }

  &.status-expired {
    border-left: 4px solid var(--danger-color);
    opacity: 0.7;
  }

  .reward-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .reward-type-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    background: var(--primary-light);
    color: var(--primary-color);
  }

  .reward-info {
    flex: 1;
  }

  .reward-title {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--text-base);
    font-weight: bold;
    color: var(--text-primary);
  }

  .reward-description {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .reward-status {
    flex-shrink: 0;
  }

  .reward-details {
    margin-bottom: var(--spacing-md);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
    font-size: var(--text-sm);

    .label {
      color: var(--text-secondary);
      font-weight: 500;
    }

    .value {
      color: var(--text-primary);

      &.highlight {
        color: var(--primary-color);
        font-weight: bold;
        font-size: var(--text-base);
      }
    }
  }

  .text-danger {
    color: var(--danger-color) !important;
  }

  .reward-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
}

// ==================== 奖励详情对话框 ====================
.reward-detail {
  padding: var(--spacing-lg) 0;

  .detail-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .detail-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: var(--primary-light);
    color: var(--primary-color);
  }

  .detail-title-section h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--text-lg);
    font-weight: bold;
  }

  .detail-content {
    .detail-item {
      display: flex;
      margin-bottom: var(--spacing-md);
      align-items: flex-start;

      .item-label {
        width: 80px;
        font-weight: 500;
        color: var(--text-secondary);
        flex-shrink: 0;
      }

      .item-value {
        flex: 1;
        color: var(--text-primary);
        word-break: break-word;

        &.highlight {
          color: var(--primary-color);
          font-weight: bold;
          font-size: var(--text-base);
        }
      }

      .instruction-text {
        background: var(--success-light);
        border: 1px solid var(--success-color);
        border-radius: var(--radius-sm);
        padding: var(--spacing-sm);
        color: var(--success-color);
        line-height: 1.5;
      }
    }
  }
}

// ==================== 使用代金券对话框 ====================
.voucher-use {
  text-align: center;

  .voucher-info h4 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  .voucher-value {
    margin: var(--spacing-sm) 0;
    font-size: var(--text-lg);
    font-weight: bold;
    color: var(--primary-color);
  }

  .voucher-expiry {
    margin: var(--spacing-sm) 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .use-confirmation {
    margin-top: var(--spacing-xl);
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

// ==================== SOP跟单进度样式 ====================
.sop-progress-section {
  display: block;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--border-color);
}

.sop-progress-container {
  width: 100%;
}

.sop-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  color: var(--primary-color);
}

.sop-title {
  font-size: var(--text-sm);
}

.sop-leads-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.lead-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-xs);
  }

  .lead-info {
    margin-bottom: var(--spacing-sm);
  }

  .lead-name {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
  }

  .lead-phone {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .lead-teacher {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .lead-sop {
    margin-top: var(--spacing-sm);
  }

  .sop-stage {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
  }

  .stage-name {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--primary-color);
    min-width: 80px;
  }

  .stage-progress {
    flex: 1;
  }

  .sop-probability {
    font-size: var(--text-xs);
    color: var(--success-color);
    font-weight: 600;
  }

  .lead-status {
    margin-top: var(--spacing-sm);
    text-align: right;
  }
}

// ==================== 响应式设计 ====================
@media (max-width: var(--breakpoint-md)) {
  .rewards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
