<template>
  <UnifiedCenterLayout
    title="绩效中心"
    description="员工绩效管理，转介绍奖励分配，团队业绩分析，个人贡献度统计"
  >
    <template #header-actions>
      <el-button type="success" @click="exportData">
        <el-icon><Download /></el-icon>
        导出报表
      </el-button>
    </template>

    <div class="performance-center">
      <!-- 时间筛选工具栏 -->
      <div class="toolbar">
        <div class="date-filter">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
          <el-button type="primary" @click="loadPerformanceData">刷新数据</el-button>
        </div>
      </div>

      <!-- 转介绍奖励统计概览 -->
      <div class="referral-overview">
        <h3>转介绍奖励概览</h3>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in referralStats" :key="index">
            <CentersStatCard
              :value="stat.value"
              :title="stat.title"
              :description="stat.description"
              :icon-name="stat.icon"
              :type="stat.type"
              :trend="stat.trend"
              :trend-text="stat.trendText"
              :loading="loading"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 绩效分析标签页 -->
      <el-card class="performance-tabs">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- 转介绍奖励明细 -->
          <el-tab-pane label="转介绍奖励" name="referral-rewards">
            <ReferralRewardsTab
              :date-range="dateRange"
              :loading="loading"
              @refresh="loadPerformanceData"
            />
          </el-tab-pane>

          <!-- 团队业绩排名 -->
          <el-tab-pane label="团队排名" name="team-ranking">
            <TeamRankingTab
              :date-range="dateRange"
              :loading="loading"
              @refresh="loadPerformanceData"
            />
          </el-tab-pane>

          <!-- 个人贡献度 -->
          <el-tab-pane label="个人贡献" name="personal-contribution">
            <PersonalContributionTab
              :date-range="dateRange"
              :loading="loading"
              @refresh="loadPerformanceData"
            />
          </el-tab-pane>

          <!-- 奖励分配设置 -->
          <el-tab-pane label="奖励设置" name="reward-settings">
            <RewardSettingsTab
              @settings-changed="handleSettingsChanged"
            />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import CentersStatCard from '@/components/centers/StatCard.vue'
import ReferralRewardsTab from './components/ReferralRewardsTab.vue'
import TeamRankingTab from './components/TeamRankingTab.vue'
import PersonalContributionTab from './components/PersonalContributionTab.vue'
import RewardSettingsTab from './components/RewardSettingsTab.vue'

import MarketingPerformanceService from '@/services/marketing-performance.service'

// 响应式数据
const loading = ref(false)
const activeTab = ref('referral-rewards')
const dateRange = ref<[string, string]>([
  new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
  new Date().toISOString().split('T')[0]
])

// 转介绍统计数据
const referralStats = ref([
  {
    title: '本月转介绍奖励',
    description: '本月发放的转介绍奖励总额',
    value: 0,
    icon: 'dollar-sign',
    type: 'success',
    trend: 0,
    trendText: '0%'
  },
  {
    title: '成功转介绍人数',
    description: '成功转介绍并报名的新生数量',
    value: 0,
    icon: 'user-plus',
    type: 'primary',
    trend: 0,
    trendText: '0%'
  },
  {
    title: '转介绍转化率',
    description: '转介绍访客转化为报名学生的比率',
    value: 0,
    icon: 'trending-up',
    type: 'warning',
    trend: 0,
    trendText: '0%',
    unit: '%'
  },
  {
    title: '活跃推荐人',
    description: '本月参与转介绍的员工和家长数量',
    value: 0,
    icon: 'users',
    type: 'info',
    trend: 0,
    trendText: '0%'
  }
])

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 加载绩效数据
const loadPerformanceData = async () => {
  try {
    loading.value = true

    if (!dateRange.value || dateRange.value.length !== 2) {
      ElMessage.warning('请选择时间范围')
      return
    }

    const [startDate, endDate] = dateRange.value

    // 加载转介绍统计数据
    const statsData = await MarketingPerformanceService.getReferralStats({
      startDate,
      endDate
    })

    // 更新统计数据
    referralStats.value[0].value = statsData.totalRewards || 0
    referralStats.value[0].trendText = statsData.rewardsTrend || '+0%'
    referralStats.value[0].trend = parseFloat((statsData.rewardsTrend || '+0%').replace(/[%+]/g, ''))

    referralStats.value[1].value = statsData.successfulReferrals || 0
    referralStats.value[1].trendText = statsData.referralsTrend || '+0%'
    referralStats.value[1].trend = parseFloat((statsData.referralsTrend || '+0%').replace(/[%+]/g, ''))

    referralStats.value[2].value = statsData.conversionRate || 0
    referralStats.value[2].trendText = statsData.conversionTrend || '+0%'
    referralStats.value[2].trend = parseFloat((statsData.conversionTrend || '+0%').replace(/[%+]/g, ''))

    referralStats.value[3].value = statsData.activeReferrers || 0
    referralStats.value[3].trendText = statsData.referrersTrend || '+0%'
    referralStats.value[3].trend = parseFloat((statsData.referrersTrend || '+0%').replace(/[%+]/g, ''))

  } catch (error) {
    console.error('加载绩效数据失败:', error)
    ElMessage.error('加载绩效数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理日期变化
const handleDateChange = (dates: [string, string]) => {
  if (dates && dates.length === 2) {
    dateRange.value = dates
    loadPerformanceData()
  }
}

// 处理标签页变化
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

// 处理设置变化
const handleSettingsChanged = () => {
  ElMessage.success('奖励设置已更新')
  loadPerformanceData()
}

// 导出数据
const exportData = async () => {
  try {
    loading.value = true

    if (!dateRange.value || dateRange.value.length !== 2) {
      ElMessage.warning('请选择时间范围')
      return
    }

    const [startDate, endDate] = dateRange.value

    await MarketingPerformanceService.exportPerformanceReport({
      startDate,
      endDate,
      tab: activeTab.value
    })

    ElMessage.success('报表导出成功')
  } catch (error) {
    console.error('导出报表失败:', error)
    ElMessage.error('导出报表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadPerformanceData()
})
</script>

<style scoped lang="scss">
.performance-center {
  // 继承全局中心样式
  min-height: 100vh;
  background: var(--bg-primary, #f9fafb);
  padding: var(--text-2xl);
}

// 工具栏样式
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3xl);
  padding: var(--text-xl);
  background: var(--bg-color);
  border-radius: var(--text-lg);
  box-shadow: var(--shadow-sm);
  border: var(--border-width-default) solid var(--border-primary, var(--border-color));

  .date-filter {
    display: flex;
    gap: var(--spacing-2xl);
    align-items: center;
  }
}

// 转介绍概览
.referral-overview {
  margin-bottom: var(--spacing-4xl);

  h3 {
    margin-bottom: var(--text-2xl);
    color: var(--text-primary, var(--text-primary));
    font-size: var(--text-xl);
    font-weight: 600;
  }
}

// 绩效标签页
.performance-tabs {
  background: var(--bg-color);
  border-radius: var(--text-lg);
  box-shadow: var(--shadow-md);
  border: var(--border-width-default) solid var(--border-primary, var(--border-color));

  :deep(.el-tabs__header) {
    margin-bottom: var(--text-2xl);
    border-bottom: 1px solid var(--border-light);
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 var(--text-xl);
  }

  :deep(.el-tabs__item) {
    padding: 0 var(--text-2xl);
    height: var(--spacing-5xl);
    line-height: var(--spacing-5xl);
    font-weight: 500;
    color: var(--text-secondary, var(--text-secondary));

    &.is-active {
      color: var(--primary-color, var(--primary-color));
      font-weight: 600;
    }
  }

  :deep(.el-tabs__content) {
    padding: 0 var(--text-xl) var(--text-xl);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-lg)) {
  .toolbar {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: stretch;

    .date-filter {
      justify-content: center;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .performance-center {
    padding: var(--text-lg);
  }

  .toolbar {
    padding: var(--text-lg);

    .date-filter {
      flex-direction: column;
      gap: var(--spacing-lg);
    }
  }

  .referral-overview {
    h3 {
      font-size: var(--text-lg);
    }
  }
}
</style>