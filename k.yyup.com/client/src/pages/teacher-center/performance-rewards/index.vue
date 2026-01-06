<template>
  <div class="kindergarten-rewards">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
            <h1 class="page-title">
            <UnifiedIcon name="el-icon class="title-icon"" size="var(--icon-md)" />
            绩效奖励
          </h1>
          <p class="page-subtitle">查看和管理我的绩效奖励</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="refreshRewards">
            <UnifiedIcon name="el-icon" size="var(--icon-md)" />
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
                <UnifiedIcon name="el-icon" size="var(--icon-md)" />
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
                <UnifiedIcon name="el-icon" size="var(--icon-md)" />
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
                <UnifiedIcon name="el-icon" size="var(--icon-md)" />
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
                <UnifiedIcon name="el-icon" size="var(--icon-md)" />
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
      <el-card>
        <template #header>
          <div class="card-header">
            <span>我的奖励</span>
            <div class="header-controls">
              <el-select
                v-model="filterStatus"
                placeholder="筛选状态"
                style="width: 120px; margin-right: 10px;"
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
            </div>
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
                  <UnifiedIcon name="el-icon v-if="reward.type === 'voucher'"" size="var(--icon-md)" />
                  <UnifiedIcon name="el-icon v-else-if="reward.type === 'gift'"" size="var(--icon-md)" />
                  <UnifiedIcon name="el-icon v-else" size="var(--icon-md)" />
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
                
                <!-- 🆕 分享带来的线索跟单进度 -->
                <div v-if="reward.shareInfo && reward.shareInfo.leads && reward.shareInfo.leads.length > 0" class="detail-row sop-progress-section">
                  <div class="sop-progress-container">
                    <div class="sop-header">
                      <UnifiedIcon name="el-icon" size="var(--icon-md)" />
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
                            <UnifiedIcon name="el-icon" size="var(--icon-md)" />
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
            <UnifiedIcon name="el-icon v-if="selected-reward.type === 'voucher'"" size="var(--icon-md)" />
            <UnifiedIcon name="el-icon v-else-if="selected-reward.type === 'gift'"" size="var(--icon-md)" />
            <UnifiedIcon name="el-icon v-else" size="var(--icon-md)" />
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
            style="margin-bottom: 20px;"
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
  </div>
</template>

<scriptscription: '可用于下次亲子活动报名',
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

const updateStats = () =>>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Gift,
  Refresh,
  Money,
  Check,
  Clock,
  Trophy,
  Document,
  Star,
  UserFilled,
  CircleCheck
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import TeacherRewardsService, {
  type TeacherReward,
  type TeacherRewardStats
} from '@/api/modules/teacher-rewards'

const router = useRouter()

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

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// 方法
const refreshRewards = async () => {
  loading.value = true
  try {
    // 调用真实API获取奖励数据和统计信息
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
    const mockRewards: KindergartenReward[] = [
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

const getRewardStatusClass = (reward) => {
  return {
    'status-available': reward.status === 'available',
    'status-used': reward.status === 'used',
    'status-expired': reward.status === 'expired'
  }
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'used': return 'info'
    case 'expired': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'available': return '可用'
    case 'used': return '已使用'
    case 'expired': return '已过期'
    default: return '未知'
  }
}

const getTypeText = (type) => {
  switch (type) {
    case 'cash': return '现金'
    case 'voucher': return '代金券'
    case 'gift': return '礼品'
    case 'points': return '积分'
    default: return '未知'
  }
}

const formatRewardValue = (reward) => {
  if (reward.type === 'voucher' && reward.currency) {
    return `¥${reward.value}`
  } else if (reward.type === 'points') {
    return `${reward.value} 积分`
  }
  return reward.value || ''
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const isExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date()
}

// 🆕 获取线索状态类型（用于标签颜色）
const getLeadStatusType = (status) => {
  const typeMap = {
    'pending': 'info',
    'assigned': 'warning',
    'following': 'primary',
    'converted': 'success',
    'abandoned': 'danger'
  }
  return typeMap[status] || 'info'
}

const viewRewardDetail = (reward) => {
  selectedReward.value = reward
  detailDialogVisible.value = true
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedReward.value = null
}

const useReward = (reward) => {
  selectedVoucher.value = reward
  useVoucherDialogVisible.value = true
}

const confirmUseVoucher = async () => {
  if (!selectedVoucher.value) return

  useVoucherLoading.value = true
  try {
    // 调用真实API使用代金券
    const result = await KindergartenRewardsService.useVoucher(selectedVoucher.value.id, {
      useLocation: '家长端园所奖励页面',
      notes: '用户主动使用代金券'
    })

    if (result.success) {
      // 更新奖励状态
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

// 生命周期
onMounted(() => {
  refreshRewards()
})
</script>

<style>
.kindergarten-rewards {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: var(--spacing-2xl);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section .page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--icon-2xl);
  font-weight: bold;
  margin: 0 0 8px 0;
}

.title-icon {
  font-size: var(--icon-3xl);
}

.page-subtitle {
  margin: 0;
  font-size: var(--icon-md);
  opacity: 0.9;
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
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.stat-card.available {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
}

.stat-card.used {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
}

.stat-card.expired {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: white;
}

.stat-card.total {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
  color: white;
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

.stat-value {
  font-size: var(--icon-3xl);
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: var(--icon-sm);
  opacity: 0.9;
  margin-top: 4px;
}

.rewards-content {
  margin-bottom: var(--spacing-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: var(--text-lg);
}

.header-controls {
  display: flex;
  align-items: center;
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
  border: 1px solid #e8e8e8;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  background: white;
  transition: all 0.3s ease;
}

.reward-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.reward-item.status-available {
  border-left: 4px solid #52c41a;
}

.reward-item.status-used {
  border-left: 4px solid #1890ff;
  opacity: 0.8;
}

.reward-item.status-expired {
  border-left: 4px solid #ff4d4f;
  opacity: 0.7;
}

.reward-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.reward-type-icon {
  font-size: var(--icon-xl);
  color: #1890ff;
  background: #e6f7ff;
  padding: var(--spacing-sm);
  border-radius: 8px;
  flex-shrink: 0;
}

.reward-info {
  flex: 1;
}

.reward-title {
  margin: 0 0 5px 0;
  font-size: var(--icon-md);
  font-weight: bold;
  color: #262626;
}

.reward-description {
  margin: 0;
  font-size: var(--icon-sm);
  color: #666;
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
  margin-bottom: 8px;
  font-size: var(--icon-sm);
}

.detail-row .label {
  color: #666;
  font-weight: 500;
}

.detail-row .value {
  color: #262626;
}

.detail-row .value.highlight {
  color: #1890ff;
  font-weight: bold;
  font-size: var(--icon-md);
}

.text-danger {
  color: #ff4d4f !important;
}

.reward-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.reward-detail {
  padding: var(--spacing-lg) 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-icon {
  font-size: var(--text-3xl);
  color: #1890ff;
  background: #e6f7ff;
  padding: 10px;
  border-radius: 10px;
}

.detail-title-section h3 {
  margin: 0 0 8px 0;
  font-size: var(--text-lg);
  font-weight: bold;
}

.detail-content {
  space-y: 15px;
}

.detail-item {
  display: flex;
  margin-bottom: var(--spacing-md);
  align-items: flex-start;
}

.item-label {
  width: 80px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.item-value {
  flex: 1;
  color: #262626;
  word-break: break-word;
}

.item-value.highlight {
  color: #1890ff;
  font-weight: bold;
  font-size: var(--icon-md);
}

.instruction-text {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: var(--spacing-sm);
  margin-top: 5px;
  color: #389e0d;
  line-height: 1.5;
}

.voucher-use {
  text-align: center;
}

.voucher-info h4 {
  margin: 0 0 10px 0;
  font-size: var(--icon-md);
  color: #262626;
}

.voucher-value {
  margin: 5px 0;
  font-size: var(--text-lg);
  font-weight: bold;
  color: #1890ff;
}

.voucher-expiry {
  margin: 5px 0;
  color: #666;
  font-size: var(--icon-sm);
}

.use-confirmation {
  margin-top: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 🆕 SOP跟单进度样式 */
.sop-progress-section {
  display: block;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #e8e8e8;
}

.sop-progress-container {
  width: 100%;
}

.sop-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 12px;
  font-weight: 600;
  color: #409eff;
}

.sop-title {
  font-size: var(--icon-sm);
}

.sop-leads-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lead-item {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: var(--spacing-sm);
  transition: all 0.3s ease;
}

.lead-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.lead-info {
  margin-bottom: 8px;
}

.lead-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 4px;
  font-weight: 500;
}

.lead-phone {
  color: #666;
  font-size: var(--text-sm);
}

.lead-teacher {
  font-size: var(--icon-xs);
  color: #909399;
}

.lead-sop {
  margin-top: 8px;
}

.sop-stage {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 6px;
}

.stage-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: #409eff;
  min-width: 80px;
}

.stage-progress {
  flex: 1;
}

.sop-probability {
  font-size: var(--icon-xs);
  color: #67c23a;
  font-weight: 600;
}

.lead-status {
  margin-top: 8px;
  text-align: right;
}

@media (max-width: var(--breakpoint-md)) {
  .kindergarten-rewards {
    padding: 15px;
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

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>