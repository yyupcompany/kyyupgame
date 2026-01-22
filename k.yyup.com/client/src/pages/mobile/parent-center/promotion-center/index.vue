<template>
  <MobileSubPageLayout title="推荐奖励" back-path="/mobile/parent-center">
    <!-- 页面内容 -->
    <div class="promotion-center-mobile">
      <!-- 刷新按钮 -->
      <div class="refresh-section">
        <van-button
          type="primary"
          size="small"
          icon="replay"
          @click="refreshRewards"
          :loading="loading"
          block
        >
          刷新奖励
        </van-button>
      </div>

      <!-- 奖励统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item>
            <div class="stat-card available">
              <div class="stat-icon">
                <van-icon name="gold-coin" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.availableRewards }}</div>
                <div class="stat-label">可用奖励</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card used">
              <div class="stat-icon">
                <van-icon name="completed" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.usedRewards }}</div>
                <div class="stat-label">已使用</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card expired">
              <div class="stat-icon">
                <van-icon name="clock" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.expiredRewards }}</div>
                <div class="stat-label">已过期</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card total">
              <div class="stat-icon">
                <van-icon name="trophy" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalRewards }}</div>
                <div class="stat-label">累计奖励</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索奖励..."
          @search="handleSearch"
          @clear="handleClearSearch"
        />
        <div class="filter-controls">
          <van-dropdown-menu>
            <van-dropdown-item
              v-model="filterStatus"
              :options="statusOptions"
              @change="filterRewards"
              title="状态"
            />
            <van-dropdown-item
              v-model="filterType"
              :options="typeOptions"
              @change="filterRewards"
              title="类型"
            />
          </van-dropdown-menu>
        </div>
      </div>

      <!-- 奖励列表 -->
      <div class="rewards-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="listLoading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div v-if="filteredRewards.length === 0 && !loading" class="empty-state">
              <van-empty description="暂无奖励记录">
                <van-button type="primary" size="small" @click="refreshRewards">
                  刷新数据
                </van-button>
              </van-empty>
            </div>

            <div
              v-for="reward in filteredRewards"
              :key="reward.id"
              class="reward-item"
              :class="getRewardStatusClass(reward)"
            >
              <div class="reward-header">
                <div class="reward-type-icon">
                  <van-icon
                    :name="getRewardIcon(reward.type)"
                    :color="getRewardIconColor(reward.type)"
                  />
                </div>
                <div class="reward-info">
                  <h3 class="reward-title">{{ reward.title }}</h3>
                  <p class="reward-description">{{ reward.description }}</p>
                </div>
                <div class="reward-status">
                  <van-tag
                    :type="getStatusTagType(reward.status)"
                    size="medium"
                  >
                    {{ getStatusText(reward.status) }}
                  </van-tag>
                </div>
              </div>

              <div class="reward-details">
                <van-cell-group inset>
                  <van-cell title="奖励类型" :value="getTypeText(reward.type)" />
                  <van-cell
                    v-if="reward.value"
                    title="奖励价值"
                    :value="formatRewardValue(reward)"
                    :value-class="['highlight-value']"
                  />
                  <van-cell
                    v-if="reward.expiryDate"
                    title="有效期至"
                    :value="formatDate(reward.expiryDate)"
                    :value-class="{ 'text-danger': isExpired(reward.expiryDate) }"
                  />
                  <van-cell title="获得时间" :value="formatDate(reward.createdAt)" />
                  <van-cell v-if="reward.source" title="来源" :value="reward.source" />
                </van-cell-group>

                <!-- 分享带来的线索跟单进度 -->
                <div
                  v-if="reward.shareInfo && reward.shareInfo.leads && reward.shareInfo.leads.length > 0"
                  class="sop-progress-section"
                >
                  <div class="sop-header">
                    <van-icon name="friends-o" />
                    <span class="sop-title">分享带来的客户（{{ reward.shareInfo.leads.length }}个）</span>
                  </div>
                  <div class="sop-leads-list">
                    <van-collapse v-model="activeLeads">
                      <van-collapse-item
                        v-for="lead in reward.shareInfo.leads"
                        :key="lead.id"
                        :name="lead.id"
                        :title="`${lead.childName || lead.visitorName} - ${lead.visitorPhone}`"
                      >
                        <div class="lead-content">
                          <div class="lead-teacher">跟进教师：{{ lead.assignedTeacher }}</div>
                          <div v-if="lead.sopProgress" class="lead-sop">
                            <div class="sop-stage">
                              <span class="stage-name">{{ lead.sopProgress.currentStage }}</span>
                              <van-progress
                                :percentage="lead.sopProgress.progress"
                                stroke-width="6"
                                show-pivot
                                pivot-text=""
                                color="var(--primary-color)"
                              />
                            </div>
                            <div class="sop-probability">
                              成功率：{{ lead.sopProgress.successProbability }}%
                            </div>
                          </div>
                          <div v-else class="lead-status">
                            <van-tag :type="getLeadStatusType(lead.status)">
                              {{ lead.statusText }}
                            </van-tag>
                          </div>
                        </div>
                      </van-collapse-item>
                    </van-collapse>
                  </div>
                </div>
              </div>

              <div class="reward-actions">
                <van-button
                  v-if="reward.status === 'available' && reward.type === 'voucher'"
                  type="primary"
                  size="small"
                  @click="useReward(reward)"
                >
                  使用代金券
                </van-button>
                <van-button
                  v-if="reward.status === 'available'"
                  type="default"
                  size="small"
                  @click="viewRewardDetail(reward)"
                >
                  查看详情
                </van-button>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 奖励详情弹窗 -->
      <van-popup
        v-model:show="detailDialogVisible"
        position="bottom"
        :style="{ height: '80%' }"
        round
      >
        <div class="reward-detail-popup">
          <div class="popup-header">
            <div class="popup-title">奖励详情</div>
            <van-icon name="cross" @click="detailDialogVisible = false" />
          </div>

          <div v-if="selectedReward" class="reward-detail">
            <div class="detail-header">
              <div class="detail-icon">
                <van-icon
                  :name="getRewardIcon(selectedReward.type)"
                  :color="getRewardIconColor(selectedReward.type)"
                  size="48"
                />
              </div>
              <div class="detail-title-section">
                <h3>{{ selectedReward.title }}</h3>
                <van-tag :type="getStatusTagType(selectedReward.status)">
                  {{ getStatusText(selectedReward.status) }}
                </van-tag>
              </div>
            </div>

            <van-cell-group inset>
              <van-cell title="描述" :value="selectedReward.description" />
              <van-cell title="类型" :value="getTypeText(selectedReward.type)" />
              <van-cell
                v-if="selectedReward.value"
                title="价值"
                :value="formatRewardValue(selectedReward)"
                :value-class="['highlight-value']"
              />
              <van-cell
                v-if="selectedReward.expiryDate"
                title="有效期"
                :value="formatDate(selectedReward.expiryDate)"
              />
              <van-cell title="获得时间" :value="formatDate(selectedReward.createdAt)" />
              <van-cell v-if="selectedReward.source" title="来源" :value="selectedReward.source" />
            </van-cell-group>

            <div v-if="selectedReward.usageInstructions" class="usage-instructions">
              <div class="instruction-title">使用说明</div>
              <div class="instruction-content">{{ selectedReward.usageInstructions }}</div>
            </div>
          </div>

          <div class="popup-footer">
            <van-button @click="detailDialogVisible = false">关闭</van-button>
            <van-button
              v-if="selectedReward && selectedReward.status === 'available' && selectedReward.type === 'voucher'"
              type="primary"
              @click="useReward(selectedReward)"
            >
              使用代金券
            </van-button>
          </div>
        </div>
      </van-popup>

      <!-- 使用代金券确认弹窗 -->
      <van-dialog
        v-model:show="useVoucherDialogVisible"
        title="使用代金券"
        :show-confirm-button="false"
        :show-cancel-button="false"
      >
        <div v-if="selectedVoucher" class="voucher-use">
          <div class="voucher-info">
            <h4>{{ selectedVoucher.title }}</h4>
            <p class="voucher-value">价值：{{ formatRewardValue(selectedVoucher) }}</p>
            <p class="voucher-expiry">有效期至：{{ formatDate(selectedVoucher.expiryDate) }}</p>
          </div>

          <van-notice-bar
            type="warning"
            background="#fff7e6"
            color="#ff976a"
            text="确认要使用这个代金券吗？使用后将从可用奖励中移除。"
          />
        </div>

        <template #footer>
          <van-button @click="useVoucherDialogVisible = false">取消</van-button>
          <van-button
            type="primary"
            :loading="useVoucherLoading"
            @click="confirmUseVoucher"
          >
            确认使用
          </van-button>
        </template>
      </van-dialog>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { smartPromotionApi } from '@/api/modules/smart-promotion'
import type { ApiResponse } from '@/types/api'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const activeLeads = ref<string[]>([])

const detailDialogVisible = ref(false)
const selectedReward = ref<any>(null)
const useVoucherDialogVisible = ref(false)
const selectedVoucher = ref<any>(null)
const useVoucherLoading = ref(false)

// 奖励数据
const rewards = ref<any[]>([])

// 统计数据
const stats = reactive({
  availableRewards: 0,
  usedRewards: 0,
  expiredRewards: 0,
  totalRewards: 0,
  totalValue: 0,
  availableValue: 0,
  usedValue: 0
})

// 筛选选项
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '可用', value: 'available' },
  { text: '已使用', value: 'used' },
  { text: '已过期', value: 'expired' }
]

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '代金券', value: 'voucher' },
  { text: '礼品', value: 'gift' },
  { text: '积分', value: 'points' }
]

// 计算属性
const filteredRewards = computed(() => {
  let filtered = rewards.value

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(reward =>
      reward.title.toLowerCase().includes(keyword) ||
      reward.description.toLowerCase().includes(keyword) ||
      (reward.source && reward.source.toLowerCase().includes(keyword))
    )
  }

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(reward => reward.status === filterStatus.value)
  }

  // 类型筛选
  if (filterType.value) {
    filtered = filtered.filter(reward => reward.type === filterType.value)
  }

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// 方法
const handleBack = () => {
  router.back()
}

const handleSearch = () => {
  // 搜索逻辑在计算属性中处理
}

const handleClearSearch = () => {
  searchKeyword.value = ''
}

const filterRewards = () => {
  // 筛选逻辑在计算属性中处理
}

const refreshRewards = async () => {
  loading.value = true
  try {
    // 调用推广统计API
    const statsResponse = await smartPromotionApi.getPromotionStats('30d')
    if (statsResponse.success && statsResponse.data) {
      const statsData = statsResponse.data
      stats.totalEarnings = statsData.totalEarnings
      stats.totalReferrals = statsData.totalReferrals
      stats.availableRewards = statsData.newCodesThisPeriod
    }

    // 模拟奖励数据
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
        usageInstructions: '在活动报名时选择使用代金券支付即可享受优惠',
        shareInfo: {
          leads: [
            {
              id: 'lead1',
              childName: '小明',
              visitorPhone: '138****1234',
              assignedTeacher: '张老师',
              status: 'following',
              statusText: '跟进中',
              sopProgress: {
                currentStage: '初步接触',
                progress: 30,
                successProbability: 75
              }
            },
            {
              id: 'lead2',
              childName: '小红',
              visitorPhone: '139****5678',
              assignedTeacher: '李老师',
              status: 'assigned',
              statusText: '已分配'
            }
          ]
        }
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
    showSuccessToast('奖励数据刷新成功')
  } catch (error: any) {
    console.error('刷新奖励失败:', error)
    showFailToast('刷新失败，请稍后重试')
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

const onRefresh = async () => {
  refreshing.value = true
  await refreshRewards()
  refreshing.value = false
}

const onLoad = () => {
  // 模拟加载更多数据
  setTimeout(() => {
    listLoading.value = false
    finished.value = true
  }, 1000)
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
    case 'used': return 'primary'
    case 'expired': return 'danger'
    default: return 'default'
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
    case 'voucher': return '代金券'
    case 'gift': return '礼品'
    case 'points': return '积分'
    default: return '未知'
  }
}

const getRewardIcon = (type: string) => {
  switch (type) {
    case 'voucher': return 'coupon'
    case 'gift': return 'gift'
    case 'points': return 'star'
    default: return 'gold-coin'
  }
}

const getRewardIconColor = (type: string) => {
  switch (type) {
    case 'voucher': return 'var(--primary-color)'
    case 'gift': return '#ff976a'
    case 'points': return '#ffd21e'
    default: return '#07c160'
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
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const isExpired = (expiryDate: string) => {
  return new Date(expiryDate) < new Date()
}

const getLeadStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'pending': 'default',
    'assigned': 'warning',
    'following': 'primary',
    'converted': 'success',
    'abandoned': 'danger'
  }
  return typeMap[status] || 'default'
}

const viewRewardDetail = (reward: any) => {
  selectedReward.value = reward
  detailDialogVisible.value = true
}

const useReward = (reward: any) => {
  selectedVoucher.value = reward
  useVoucherDialogVisible.value = true
}

const confirmUseVoucher = async () => {
  if (!selectedVoucher.value) return

  useVoucherLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新奖励状态
    const rewardIndex = rewards.value.findIndex(r => r.id === selectedVoucher.value!.id)
    if (rewardIndex !== -1) {
      rewards.value[rewardIndex].status = 'used'
      rewards.value[rewardIndex].usedAt = new Date().toISOString().split('T')[0]
    }

    updateStats()
    useVoucherDialogVisible.value = false
    selectedVoucher.value = null
    showSuccessToast('代金券使用成功！')
  } catch (error: any) {
    console.error('使用代金券失败:', error)
    showFailToast('使用失败，请稍后重试')
  } finally {
    useVoucherLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  refreshRewards()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.promotion-center-mobile {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
  padding-bottom: var(--van-tabbar-height);

  .refresh-section {
    padding: var(--spacing-md);
  }

  .stats-section {
    padding: 0 16px 16px;

    .stat-card {
      background: var(--card-bg);
      border-radius: var(--spacing-md);
      padding: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .stat-icon {
        font-size: var(--text-2xl);
        color: var(--van-primary-color);
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: bold;
          color: var(--van-text-color);
          line-height: 1;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-top: var(--spacing-xs);
        }
      }

      &.available {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-left: 4px solid var(--van-success-color);
      }

      &.used {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-left: 4px solid var(--van-primary-color);
      }

      &.expired {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        border-left: 4px solid var(--van-danger-color);
      }

      &.total {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-left: 4px solid var(--van-warning-color);
      }
    }
  }

  .filter-section {
    padding: 0 16px 16px;

    .filter-controls {
      margin-top: var(--spacing-md);
    }
  }

  .rewards-list {
    padding: 0 16px 16px;

    .empty-state {
      padding: 40px 0;
      text-align: center;
    }

    .reward-item {
      background: var(--card-bg);
      border-radius: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      &.status-available {
        border-left: 4px solid var(--van-success-color);
      }

      &.status-used {
        border-left: 4px solid var(--van-primary-color);
        opacity: 0.8;
      }

      &.status-expired {
        border-left: 4px solid var(--van-danger-color);
        opacity: 0.7;
      }

      .reward-header {
        padding: var(--spacing-md);
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-md);

        .reward-type-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--spacing-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--van-background-color-light);
          flex-shrink: 0;

          .van-icon {
            font-size: var(--text-xl);
          }
        }

        .reward-info {
          flex: 1;

          .reward-title {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color);
            margin: 0 0 4px 0;
            line-height: 1.4;
          }

          .reward-description {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
            margin: 0;
            line-height: 1.5;
          }
        }

        .reward-status {
          flex-shrink: 0;
        }
      }

      .reward-details {
        .sop-progress-section {
          margin: var(--spacing-md);
          padding-top: var(--spacing-lg);
          border-top: 1px dashed var(--van-border-color);

          .sop-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-md);
            font-weight: 600;
            color: var(--van-primary-color);

            .sop-title {
              font-size: var(--text-sm);
            }
          }

          .sop-leads-list {
            .lead-content {
              padding: var(--spacing-sm) 0;

              .lead-teacher {
                font-size: var(--text-xs);
                color: var(--van-text-color-2);
                margin-bottom: var(--spacing-sm);
              }

              .lead-sop {
                .sop-stage {
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-sm);
                  margin-bottom: var(--spacing-sm);

                  .stage-name {
                    font-size: var(--text-xs);
                    color: var(--van-primary-color);
                    min-width: 60px;
                  }
                }

                .sop-probability {
                  font-size: var(--text-xs);
                  color: var(--van-success-color);
                  font-weight: 600;
                }
              }

              .lead-status {
                text-align: right;
              }
            }
          }
        }
      }

      .reward-actions {
        padding: var(--spacing-md);
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
        border-top: 1px solid var(--van-border-color);

        .van-button {
          flex-shrink: 0;
        }
      }
    }
  }
}

.reward-detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--van-border-color);

    .popup-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }

    .van-icon {
      font-size: var(--text-xl);
      color: var(--van-text-color-2);
      cursor: pointer;
    }
  }

  .reward-detail {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;

    .detail-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--van-border-color);

      .detail-icon {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-background-color-light);
      }

      .detail-title-section {
        flex: 1;

        h3 {
          margin: 0 0 8px 0;
          font-size: var(--text-lg);
          font-weight: bold;
          color: var(--van-text-color);
        }
      }
    }

    .usage-instructions {
      margin: var(--spacing-md) 0;
      padding: var(--spacing-md);
      background: var(--van-background-color-light);
      border-radius: var(--spacing-sm);

      .instruction-title {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--van-text-color);
        margin-bottom: var(--spacing-sm);
      }

      .instruction-content {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.6;
      }
    }
  }

  .popup-footer {
    padding: var(--spacing-md);
    display: flex;
    gap: var(--spacing-md);
    border-top: 1px solid var(--van-border-color);

    .van-button {
      flex: 1;
    }
  }
}

.voucher-use {
  padding: var(--spacing-lg) 0;

  .voucher-info {
    text-align: center;
    margin-bottom: var(--spacing-xl);

    h4 {
      margin: 0 0 12px 0;
      font-size: var(--text-base);
      color: var(--van-text-color);
    }

    .voucher-value {
      margin: var(--spacing-sm) 0;
      font-size: var(--text-lg);
      font-weight: bold;
      color: var(--van-primary-color);
    }

    .voucher-expiry {
      margin: var(--spacing-sm) 0;
      color: var(--van-text-color-2);
      font-size: var(--text-sm);
    }
  }
}

:deep(.highlight-value) {
  color: var(--van-primary-color) !important;
  font-weight: 600 !important;
}

:deep(.text-danger) {
  color: var(--van-danger-color) !important;
}

// 响应式适配
@media (min-width: 768px) {
  .promotion-center-mobile {
    max-width: 768px;
    margin: 0 auto;
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>

