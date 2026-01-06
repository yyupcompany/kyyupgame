<template>
  <div class="marketing-activity-manager">
    <!-- 头部统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalActivities }}</div>
          <div class="stat-label">总活动数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalParticipants }}</div>
          <div class="stat-label">总参与人数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ stats.totalRevenue.toLocaleString() }}</div>
          <div class="stat-label">总营收</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
          <el-icon><Trophy /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.conversionRate }}%</div>
          <div class="stat-label">转化率</div>
        </div>
      </div>
    </div>

    <!-- 活动管理标签页 -->
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>营销活动管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              创建活动
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 团购活动 -->
        <el-tab-pane label="团购活动" name="groupBuy">
          <GroupBuyList
            ref="groupBuyRef"
            @activity-select="handleActivitySelect"
            @refresh="refreshStats"
          />
        </el-tab-pane>

        <!-- 积攒活动 -->
        <el-tab-pane label="积攒活动" name="collect">
          <CollectActivityList
            ref="collectRef"
            @activity-select="handleActivitySelect"
            @refresh="refreshStats"
          />
        </el-tab-pane>

        <!-- 推荐奖励 -->
        <el-tab-pane label="推荐奖励" name="referral">
          <ReferralList
            ref="referralRef"
            @refresh="refreshStats"
          />
        </el-tab-pane>

        <!-- 阶梯奖励 -->
        <el-tab-pane label="阶梯奖励" name="tiered">
          <TieredRewardList
            ref="tieredRef"
            @refresh="refreshStats"
          />
        </el-tab-pane>

        <!-- 优惠券管理 -->
        <el-tab-pane label="优惠券管理" name="coupon">
          <CouponList
            ref="couponRef"
            @refresh="refreshStats"
          />
        </el-tab-pane>

        <!-- 营销分析 -->
        <el-tab-pane label="营销分析" name="analytics">
          <MarketingAnalytics ref="analyticsRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建活动对话框 -->
    <CreateCampaignDialog
      v-model:visible="showCreateDialog"
      @success="handleCreateSuccess"
    />

    <!-- 活动详情对话框 -->
    <ActivityDetailDialog
      v-model:visible="showDetailDialog"
      :activity="selectedActivity"
      :type="detailType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  TrendCharts, User, Coin, Trophy, Plus, Refresh
} from '@element-plus/icons-vue'

// 导入组件
import GroupBuyList from './GroupBuyList.vue'
import CollectActivityList from './CollectActivityList.vue'
import ReferralList from './ReferralList.vue'
import TieredRewardList from './TieredRewardList.vue'
import CouponList from './CouponList.vue'
import MarketingAnalytics from './MarketingAnalytics.vue'
import CreateCampaignDialog from './CreateCampaignDialog.vue'
import ActivityDetailDialog from './ActivityDetailDialog.vue'

// 响应式数据
const activeTab = ref('groupBuy')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const selectedActivity = ref<any>(null)
const detailType = ref('')

// 组件引用
const groupBuyRef = ref()
const collectRef = ref()
const referralRef = ref()
const tieredRef = ref()
const couponRef = ref()
const analyticsRef = ref()

// 统计数据
const stats = reactive({
  totalActivities: 0,
  totalParticipants: 0,
  totalRevenue: 0,
  conversionRate: 0,
  activeGroupBuys: 0,
  activeCollects: 0,
  completedReferrals: 0,
  usedCoupons: 0
})

// 方法
const loadStats = async () => {
  try {
    // 这里应该调用实际的API获取统计数据
    const mockStats = {
      totalActivities: 45,
      totalParticipants: 1280,
      totalRevenue: 128500,
      conversionRate: 68.5,
      activeGroupBuys: 12,
      activeCollects: 8,
      completedReferrals: 156,
      usedCoupons: 89
    }

    Object.assign(stats, mockStats)
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const refreshData = () => {
  refreshStats()
  refreshCurrentTab()
}

const refreshStats = () => {
  loadStats()
}

const refreshCurrentTab = () => {
  switch (activeTab.value) {
    case 'groupBuy':
      groupBuyRef.value?.refreshList()
      break
    case 'collect':
      collectRef.value?.refreshList()
      break
    case 'referral':
      referralRef.value?.refreshList()
      break
    case 'tiered':
      tieredRef.value?.refreshList()
      break
    case 'coupon':
      couponRef.value?.refreshList()
      break
    case 'analytics':
      analyticsRef.value?.refreshData()
      break
  }
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  refreshCurrentTab()
}

const handleActivitySelect = (activity: any, type: string) => {
  selectedActivity.value = activity
  detailType.value = type
  showDetailDialog.value = true
}

const handleCreateSuccess = (data: any) => {
  ElMessage.success('活动创建成功！')
  refreshStats()
  refreshCurrentTab()
}

// 生命周期
onMounted(() => {
  loadStats()
})
</script>

<style scoped lang="scss">
.marketing-activity-manager {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: 24px;

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: var(--spacing-lg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: var(--text-2xl);
          color: white;
        }
      }

      .stat-content {
        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: #303133;
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }

  .main-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: var(--spacing-md);
      }
    }
  }
}

:deep(.el-tabs__content) {
  padding: 0;
}

:deep(.el-tab-pane) {
  min-height: 400px;
}
</style>