<template>
  <UnifiedCenterLayout
    title="营销中心"
    description="清晰展示营销活动的完整流程，方便园长一目了然地掌握营销进展"
  >
    <div class="center-container marketing-center-timeline">
    <!-- 子路由内容 -->
    <router-view v-if="$route.path !== '/centers/marketing'" />

    <!-- 中心内容 -->
    <div v-else>

      <!-- 主要内容 -->
      <div class="main-content">

      <!-- 营销统计数据 - 使用统一网格系统 -->
      <div class="stats-section">
        <div class="stats-grid-unified">
          <CentersStatCard
            :value="stats.activeCampaigns.count"
            title="活跃营销活动"
            description="当前正在进行的营销活动数量"
            icon-name="megaphone"
            type="primary"
            :trend="parseTrendValue(stats.activeCampaigns.change)"
            :trend-text="stats.activeCampaigns.change"
            :loading="loading"
          />
          <CentersStatCard
            :value="stats.newCustomers.count"
            title="本月新客户"
            description="本月新增的客户数量"
            icon-name="user-plus"
            type="success"
            :trend="parseTrendValue(stats.newCustomers.change)"
            :trend-text="stats.newCustomers.change"
            :loading="loading"
          />
          <CentersStatCard
            :value="stats.conversionRate.rate"
            title="转化率"
            description="营销活动的转化效果"
            icon-name="trend-charts"
            type="warning"
            unit="%"
            :precision="1"
            :trend="parseTrendValue(stats.conversionRate.change)"
            :trend-text="stats.conversionRate.change"
            :loading="loading"
          />
          <CentersStatCard
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
        </div>
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

import CentersStatCard from '@/components/centers/StatCard.vue'
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
@use '@/styles/design-tokens.scss' as *;
// 使用全局中心样式，确保与其他中心页面一致
.marketing-center-timeline {
  // 继承 center-container 的样式
  min-height: 100vh;
  background: var(--bg-page);
  padding: var(--spacing-xl);
  overflow-x: hidden;
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

// 主内容区域 - 使用白色背景，与全局样式一致
.main-content {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  margin-bottom: var(--spacing-xl);
  backdrop-filter: none !important;  // 移除模糊效果

  // 确保内容不超出
  overflow: visible;
  max-width: 100%;
}

// 统计数据区域
.stats-section {
  margin-bottom: var(--spacing-2xl);
}

/* .welcome-section 样式已移至全局 center-common.scss 中统一管理 */

/* 营销统计数据现在使用统一的 StatCard 组件和 stats-grid-unified 样式 */

.marketing-modules h3,
.recent-campaigns h3,
.channel-overview h3 {
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
  font-size: var(--text-xl);
  font-weight: 600;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  width: 100%;
}

.module-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color-light);
  cursor: pointer;
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  color: inherit;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--primary-color);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-color-light);

    &::before {
      transform: scaleY(1);
    }

    .module-icon {
      transform: scale(1.2) rotate(10deg);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    }

    h4 {
      color: var(--primary-color);
    }
  }
}

.module-icon {
  font-size: 32px;
  margin-right: var(--spacing-xl);
  width: 64px;
  height: 64px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  flex-shrink: 0;
}

.module-content {
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--text-primary);
    font-size: var(--text-lg);
    font-weight: 700;
    transition: color 0.3s ease;
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.campaign-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.campaign-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base) ease;
  backdrop-filter: none !important;  // 移除模糊效果

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.campaign-info h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
  font-weight: 600;
}

.campaign-info p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.campaign-meta {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.campaign-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;

  &.active {
    background: var(--info-light);
    color: var(--info-dark);
  }

  &.completed {
    background: var(--success-light);
    color: var(--success-dark);
  }
}

.campaign-date {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.campaign-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat {
  text-align: center;
}

.stat .label {
  display: block;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.stat .value {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  margin-top: var(--spacing-sm);
  font-size: var(--text-lg);
}

.campaign-actions {
  display: flex;
  gap: var(--spacing-md);
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.channel-item {
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base) ease;
  backdrop-filter: none !important;  // 移除模糊效果

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.channel-info h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--text-lg);
}

.channel-info p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.channel-stats {
  display: flex;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-md);
}

.channel-stats .stat-item {
  text-align: center;
}

.channel-stats .stat-label {
  display: block;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.channel-stats .stat-value {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  margin-top: var(--spacing-xs);
  font-size: var(--text-base);
}

.channel-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;

  &.active {
    background: var(--success-light);
    color: var(--success-dark);
  }

  &.inactive {
    background: var(--warning-light);
    color: var(--warning-dark);
  }

  &.paused {
    background: var(--info-light);
    color: var(--info-dark);
  }
}

.channel-actions {
  display: flex;
  gap: var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: var(--spacing-3xl);
  margin-bottom: var(--spacing-md);
}

.empty-text {
  font-size: var(--text-base);
  margin-bottom: var(--spacing-md);
}

// 响应式设计 - 完整的断点系统
@media (max-width: 1200px) {
  .marketing-center-timeline {
    padding: var(--spacing-lg);
  }

  .main-content {
    padding: var(--spacing-xl);
  }

  .module-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }

  .channel-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .marketing-center-timeline {
    padding: var(--spacing-md);
  }

  .main-content {
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
  }

  .module-item {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-md);
  }

  .module-icon {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
  }

  .campaign-item {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--spacing-md);
  }

  .campaign-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .campaign-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .campaign-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .module-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .channel-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .channel-item {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .marketing-center-timeline {
    padding: var(--spacing-sm);
  }

  .main-content {
    padding: var(--spacing-md);
  }

  .module-item,
  .campaign-item,
  .channel-item {
    padding: var(--spacing-sm);
  }
}
</style>
