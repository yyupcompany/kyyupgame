<template>
  <UnifiedCenterLayout
    title="营销中心"
    description="清晰展示营销活动的完整流程，方便园长一目了然地掌握营销进展"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleCreateCampaign">
        创建营销活动
      </el-button>
    </template>

    <div class="center-container marketing-center-timeline">
    <!-- 子路由内容 -->
    <router-view v-if="$route.path !== '/centers/marketing'" />

    <!-- 中心内容 -->
    <div v-else>

      <!-- 主要内容 -->
      <div class="main-content">

      <!-- 营销统计数据 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <StatCard
              :value="stats.activeCampaigns.count"
              title="活跃营销活动"
              description="当前正在进行的营销活动数量"
              icon-name="megaphone"
              type="primary"
              :trend="parseTrendValue(stats.activeCampaigns.change)"
              :trend-text="stats.activeCampaigns.change"
              :loading="loading"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <StatCard
              :value="stats.newCustomers.count"
              title="本月新客户"
              description="本月新增的客户数量"
              icon-name="user-plus"
              type="success"
              :trend="parseTrendValue(stats.newCustomers.change)"
              :trend-text="stats.newCustomers.change"
              :loading="loading"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <StatCard
              :value="stats.conversionRate.rate"
              title="转化率"
              description="营销活动的转化效果"
              icon-name="trending-up"
              type="warning"
              unit="%"
              :precision="1"
              :trend="parseTrendValue(stats.conversionRate.change)"
              :trend-text="stats.conversionRate.change"
              :loading="loading"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <StatCard
              :value="stats.marketingROI.roi"
              title="营销ROI"
              description="营销投资回报率"
              icon-name="dollar-sign"
              type="info"
              unit="%"
              :precision="0"
              :trend="parseTrendValue(stats.marketingROI.change)"
              :trend-text="stats.marketingROI.change"
              :loading="loading"
            />
          </el-col>
        </el-row>
      </div>

        <!-- 营销功能模块 - 重构后的四大核心页面 -->
        <div class="marketing-modules">
            <h3>营销核心功能</h3>
            <div class="module-grid">
              <router-link class="module-item" to="/centers/marketing/channels">
                <div class="module-icon">🎯</div>
                <div class="module-content">
                  <h4>渠道管理</h4>
                  <p>管理营销渠道，包括线上线下渠道配置、联系人管理、效果监控</p>
                </div>
              </router-link>
              <router-link class="module-item" to="/centers/marketing/referrals">
                <div class="module-icon">👥</div>
                <div class="module-content">
                  <h4>老带新</h4>
                  <p>老带新推荐管理，关系网络分析、奖励设置、转化跟踪</p>
                </div>
              </router-link>
              <router-link class="module-item" to="/centers/marketing/conversions">
                <div class="module-icon">📊</div>
                <div class="module-content">
                  <h4>转换统计</h4>
                  <p>多维度转换数据分析，按渠道、活动、时间等维度统计转化效果</p>
                </div>
              </router-link>
              <router-link class="module-item" to="/centers/marketing/funnel">
                <div class="module-icon">🔄</div>
                <div class="module-content">
                  <h4>销售漏斗</h4>
                  <p>销售流程可视化分析，从采集单到尾款的完整转化漏斗</p>
                </div>
              </router-link>
            </div>
      </div>

        <!-- 创建营销活动对话框 -->
        <CreateCampaignDialog
          v-model="showCreateCampaignDialog"
          @success="handleCampaignCreated"
        />
      </div>
    </div>
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import StatCard from '@/components/centers/StatCard.vue'
import CreateCampaignDialog from '@/components/marketing/CreateCampaignDialog.vue'
import MarketingCenterService, {
  type MarketingStatistics,
  type MarketingCampaignSummary,
  type MarketingChannel
} from '@/services/marketing-center.service'

// 路由
const router = useRouter()

// 加载状态
const loading = ref(false)

// 创建营销活动对话框显示状态
const showCreateCampaignDialog = ref(false)

// 营销统计数据
const stats = ref<MarketingStatistics>({
  activeCampaigns: { count: 0, change: '0%' },
  newCustomers: { count: 0, change: '0%' },
  conversionRate: { rate: 0, change: '0%' },
  marketingROI: { roi: 0, change: '0%' }
})

// 导航到指定页面
const navigateTo = async (path: string) => {
  try {
    console.log('导航到:', path)
    console.log('当前路由:', router.currentRoute.value.path)

    // 先尝试导航
    await router.push(path)

    // 导航成功后的提示
    console.log('导航成功，新路由:', router.currentRoute.value.path)
    ElMessage.success(`正在跳转到 ${path}`)

  } catch (error) {
    console.error('导航失败:', error)
    ElMessage.error(`页面 ${path} 暂时无法访问，请检查权限或稍后再试`)
  }
}

// 创建营销活动
const handleCreateCampaign = () => {
  showCreateCampaignDialog.value = true
}

// 处理营销活动创建成功
const handleCampaignCreated = (campaign: any) => {
  console.log('营销活动创建成功:', campaign)
  ElMessage.success('营销活动创建成功')
}

// 解析趋势值
const parseTrendValue = (changeStr: string): number => {
  if (!changeStr) return 0

  // 移除 % 符号和 + 符号，然后转换为数字
  const numStr = changeStr.replace(/[%+]/g, '')
  const num = parseFloat(numStr)

  return isNaN(num) ? 0 : num
}

// 加载营销统计数据
const loadStatistics = async () => {
  try {
    const data = await MarketingCenterService.getStatistics()
    stats.value = data
  } catch (error) {
    console.error('加载营销统计数据失败:', error)
    // 使用模拟数据
    stats.value = {
      activeCampaigns: { count: 0, change: '0%' },
      newCustomers: { count: 0, change: '0%' },
      conversionRate: { rate: 0, change: '0%' },
      marketingROI: { roi: 0, change: '0%' }
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('营销中心已加载')
  loading.value = true
  loadStatistics().finally(() => {
    loading.value = false
  })
})
</script>

<style scoped lang="scss">
// 使用全局中心样式，确保与其他中心页面一致
.marketing-center-timeline {
  // 继承 center-container 的样式
  min-height: 100vh;
  background: var(--bg-primary, #f9fafb);  // 使用全局主背景色
  padding: var(--text-2xl);
  overflow-x: hidden;
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

// 主内容区域 - 使用白色背景，与全局样式一致
.main-content {
  background: var(--bg-color) !important;  // 纯白色背景，不透明
  border-radius: var(--text-lg);
  padding: var(--text-3xl);
  box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--black-alpha-8);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
  margin-bottom: var(--text-2xl);
  backdrop-filter: none !important;  // 移除模糊效果

  // 确保内容不超出
  overflow: visible;
  max-width: 100%;
}

// 统计数据区域
.stats-section {
  margin-bottom: var(--spacing-3xl);
}

/* .welcome-section 样式已移至全局 center-common.scss 中统一管理 */

/* 营销统计数据现在使用统一的 StatCard 组件和 stats-grid-unified 样式 */

.marketing-modules h3,
.recent-campaigns h3,
.channel-overview h3 {
  margin-bottom: var(--text-2xl);
  color: var(--text-primary, var(--text-primary));
  font-size: var(--text-xl);
  font-weight: 600;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--spacing-10xl);
  width: 100%;
  box-sizing: border-box;
}

.module-item {
  display: flex;
  align-items: center;
  padding: var(--text-2xl);
  background: var(--bg-color) !important;  // 纯白色背景，不透明
  border-radius: var(--text-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
  cursor: pointer;
  transition: all 0.3s ease;
  color: inherit;
  text-decoration: none;
  position: relative;
  z-index: var(--z-index-dropdown);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
  backdrop-filter: none !important;  // 移除模糊效果

  &:hover {
    background: var(--bg-color) !important;  // hover时也保持纯白
    transform: translateY(var(--transform-hover-lift));
    box-shadow: 0 var(--spacing-sm) var(--text-3xl) rgba(0, 0, 0, 0.12);
    border-color: var(--primary-color, var(--primary-color));
  }
}

.module-icon {
  font-size: var(--spacing-3xl);
  margin-right: var(--spacing-4xl);
}

.module-content h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary, var(--text-primary));
  font-size: var(--text-lg);
  font-weight: 600;
}

.module-content p {
  margin: 0;
  color: var(--text-secondary, var(--text-secondary));
  font-size: var(--text-base);
  line-height: 1.5;
}

.campaign-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-10xl);
}

.campaign-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--text-2xl);
  background: var(--bg-color) !important;  // 纯白色背景，不透明
  border-radius: var(--text-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
  transition: all 0.3s ease;
  backdrop-filter: none !important;  // 移除模糊效果

  &:hover {
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  }
}

.campaign-info h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary, var(--text-primary));
  font-weight: 600;
}

.campaign-info p {
  margin: 0 0 10px 0;
  color: var(--text-secondary, var(--text-secondary));
  font-size: var(--text-base);
}

.campaign-meta {
  display: flex;
  gap: var(--spacing-4xl);
  align-items: center;
}

.campaign-status {
  padding: var(--spacing-xs) var(--text-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;

  &.active {
    background: var(--info-50, #e7f5ff);
    color: var(--info-600, var(--primary-color));
  }

  &.completed {
    background: var(--success-50, #f6ffed);
    color: var(--success-600, var(--success-color));
  }
}

.campaign-date {
  color: var(--text-tertiary, var(--text-tertiary));
  font-size: var(--text-sm);
}

.campaign-stats {
  display: flex;
  gap: var(--text-2xl);
}

.stat {
  text-align: center;
}

.stat .label {
  display: block;
  color: var(--text-secondary, var(--text-secondary));
  font-size: var(--text-sm);
}

.stat .value {
  display: block;
  color: var(--text-primary, var(--text-primary));
  font-weight: 600;
  margin-top: var(--spacing-sm);
  font-size: var(--text-lg);
}

.campaign-actions {
  display: flex;
  gap: var(--spacing-2xl);
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-2xl);
}

.channel-item {
  padding: var(--text-2xl);
  background: var(--bg-color) !important;  // 纯白色背景，不透明
  border-radius: var(--text-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
  transition: all 0.3s ease;
  backdrop-filter: none !important;  // 移除模糊效果

  &:hover {
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  }
}

.channel-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.channel-icon {
  font-size: var(--text-3xl);
  margin-right: var(--spacing-2xl);
}

.channel-header h4 {
  margin: 0;
  color: var(--text-primary, var(--text-primary));
  font-weight: 600;
}

.channel-stats {
  margin-bottom: var(--spacing-4xl);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-base);
}

.stat-row span:first-child {
  color: var(--text-secondary, var(--text-secondary));
}

.stat-row .value {
  color: var(--text-primary, var(--text-primary));
  font-weight: 600;
}

.channel-status {
  text-align: center;
  padding: var(--spacing-lg) var(--text-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;

  &.active {
    background: var(--info-50, #e7f5ff);
    color: var(--info-600, var(--primary-color));
  }

  &.paused {
    background: var(--warning-50, var(--bg-white)beb);
    color: var(--warning-600, #d97706);
  }
}

// 响应式设计 - 完整的断点系统
@media (max-width: var(--breakpoint-xl)) {
  .center-content {
    padding: var(--text-2xl);
  }

  .welcome-section {
    padding: var(--text-2xl);
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
  }

  .module-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
  }

  .campaign-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
  }

  .channel-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
  }
}

@media (max-width: 992px) {
  .center-content {
    padding: var(--text-lg);
  }

  .welcome-section {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
    padding: var(--text-xl);
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-base);
  }

  .module-grid {
    grid-template-columns: 1fr;
    gap: var(--text-base);
  }

  .campaign-grid {
    grid-template-columns: 1fr;
    gap: var(--text-base);
  }

  .channel-grid {
    grid-template-columns: 1fr;
    gap: var(--text-base);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .center-content {
    padding: var(--text-sm);
  }

  .welcome-section {
    flex-direction: column;
    text-align: center;
    padding: var(--text-lg);
    margin-bottom: var(--text-2xl);

    .welcome-content {
      text-align: center;
      margin-bottom: var(--text-lg);

      h2 {
        font-size: var(--text-2xl);
      }

      p {
        font-size: var(--text-base);
      }
    }

    .header-actions {
      margin-left: 0;
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .stats-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--text-sm);
  }

  .module-grid {
    grid-template-columns: 1fr;
    gap: var(--text-sm);
  }

  .module-item {
    padding: var(--text-2xl);

    .module-content {
      h4 {
        font-size: var(--text-lg);
      }

      p {
        font-size: var(--text-base);
      }
    }
  }

  .campaign-grid {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .campaign-item {
    .campaign-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--text-sm);
    }

    .campaign-stats {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .campaign-actions {
      flex-direction: column;
      gap: var(--spacing-sm);

      .el-button {
        width: 100%;
      }
    }
  }

  .channel-grid {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .channel-item {
    padding: var(--text-lg);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .center-content {
    padding: var(--spacing-sm);
  }

  .welcome-section {
    padding: var(--text-sm);

    .welcome-content {
      h2 {
        font-size: var(--text-xl);
      }

      p {
        font-size: var(--text-sm);
      }
    }
  }

  .stats-grid-unified {
    gap: var(--spacing-2xl);
  }

  .module-grid {
    gap: var(--spacing-2xl);
    grid-template-columns: 1fr;
  }

  .module-item {
    padding: var(--text-base);

    .module-icon {
      font-size: var(--text-xl);
    }

    .module-content {
      h4 {
        font-size: var(--text-base);
      }

      p {
        font-size: var(--text-sm);
      }
    }
  }

  .campaign-grid {
    gap: var(--spacing-2xl);
  }

  .campaign-item {
    padding: var(--text-base);
  }

  .channel-grid {
    gap: var(--spacing-2xl);
  }

  .channel-item {
    padding: var(--spacing-2xl);
  }
}
</style>
