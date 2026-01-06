<template>
  <div class="marketing-center">
    <!-- 子路由内容 -->
    <router-view v-if="$route.path !== '/centers/marketing'" />

    <!-- 中心内容 -->
    <div v-else class="center-content" v-loading="loading">
      <div class="welcome-section">
        <div class="welcome-content">
          <h2>欢迎来到营销中心</h2>
          <p>这里是营销活动管理和推广的中心枢纽，您可以创建营销活动、管理推广渠道、分析营销效果。</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleCreateCampaign">
            创建营销活动
          </el-button>
        </div>
      </div>

      <!-- 营销统计数据 -->
      <div class="marketing-stats">
          <div class="stat-item">
            <h3>活跃营销活动</h3>
            <div class="stat-value">{{ stats.activeCampaigns.count }}</div>
            <div class="stat-trend" :class="{ positive: stats.activeCampaigns.change.startsWith('+') }">{{ stats.activeCampaigns.change }}</div>
          </div>
          <div class="stat-item">
            <h3>本月新客户</h3>
            <div class="stat-value">{{ stats.newCustomers.count }}</div>
            <div class="stat-trend" :class="{ positive: stats.newCustomers.change.startsWith('+') }">{{ stats.newCustomers.change }}</div>
          </div>
          <div class="stat-item">
            <h3>转化率</h3>
            <div class="stat-value">{{ stats.conversionRate.rate.toFixed(1) }}%</div>
            <div class="stat-trend" :class="{ positive: stats.conversionRate.change.startsWith('+') }">{{ stats.conversionRate.change }}</div>
          </div>
          <div class="stat-item">
            <h3>营销ROI</h3>
            <div class="stat-value">{{ stats.marketingROI.roi.toFixed(0) }}%</div>
            <div class="stat-trend" :class="{ positive: stats.marketingROI.change.startsWith('+') }">{{ stats.marketingROI.change }}</div>
          </div>
      </div>

      <!-- 营销功能模块 -->
      <div class="marketing-modules">
          <h3>营销功能模块</h3>
          <div class="module-grid">
            <div class="module-item" @click="navigateTo('/marketing')">
              <div class="module-icon">📢</div>
              <div class="module-content">
                <h4>营销活动</h4>
                <p>创建和管理各种营销活动，包括促销、优惠券、推广活动</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/advertisement')">
              <div class="module-icon">📱</div>
              <div class="module-content">
                <h4>推广渠道</h4>
                <p>管理多种推广渠道，包括社交媒体、广告投放、合作伙伴</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/principal/marketing-analysis')">
              <div class="module-icon">📊</div>
              <div class="module-content">
                <h4>营销分析</h4>
                <p>深入分析营销效果，包括转化率、ROI、客户获取成本</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/marketing/intelligent-engine/marketing-engine')">
              <div class="module-icon">🤖</div>
              <div class="module-content">
                <h4>营销自动化</h4>
                <p>设置自动化营销流程，包括邮件营销、客户跟进</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/centers/marketing/coupons')">
              <div class="module-icon">🎫</div>
              <div class="module-content">
                <h4>优惠券管理</h4>
                <p>创建和管理优惠券，设置使用规则和有效期</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/centers/marketing/consultations')">
              <div class="module-icon">📝</div>
              <div class="module-content">
                <h4>咨询管理</h4>
                <p>管理客户咨询，跟进咨询状态和处理结果</p>
              </div>
            </div>
          </div>
      </div>

      <!-- 最近营销活动 -->
      <div class="recent-campaigns">
          <h3>最近营销活动</h3>
          <div class="campaign-list">
            <div class="campaign-item" v-for="campaign in recentCampaigns" :key="campaign.id">
              <div class="campaign-info">
                <h4>{{ campaign.title }}</h4>
                <p>{{ campaign.description }}</p>
                <div class="campaign-meta">
                  <span class="campaign-status" :class="campaign.status">{{ campaign.status }}</span>
                  <span class="campaign-date">{{ campaign.startDate }}</span>
                </div>
              </div>
              <div class="campaign-stats">
                <div class="stat">
                  <span class="label">参与人数</span>
                  <span class="value">{{ campaign.participantCount }}</span>
                </div>
                <div class="stat">
                  <span class="label">转化率</span>
                  <span class="value">{{ campaign.conversionRate }}%</span>
                </div>
              </div>
              <div class="campaign-actions">
                <el-button size="small" @click="viewCampaign(campaign.id)">查看</el-button>
                <el-button size="small" type="primary" @click="editCampaign(campaign.id)">编辑</el-button>
              </div>
            </div>
          </div>
      </div>

      <!-- 营销渠道概览 -->
      <div class="channel-overview">
          <h3>营销渠道概览</h3>
          <div class="channel-grid">
            <div class="channel-item" v-for="channel in marketingChannels" :key="channel.name">
              <div class="channel-header">
                <div class="channel-icon">{{ channel.icon }}</div>
                <h4>{{ channel.name }}</h4>
              </div>
              <div class="channel-stats">
                <div class="stat-row">
                  <span>本月获客</span>
                  <span class="value">{{ channel.monthlyCustomers }}</span>
                </div>
                <div class="stat-row">
                  <span>转化率</span>
                  <span class="value">{{ channel.conversionRate }}%</span>
                </div>
                <div class="stat-row">
                  <span>获客成本</span>
                  <span class="value">¥{{ channel.acquisitionCost }}</span>
                </div>
              </div>
              <div class="channel-status" :class="channel.status">
                {{ channel.status }}
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import MarketingCenterService, {
  type MarketingStatistics,
  type MarketingCampaignSummary,
  type MarketingChannel
} from '@/services/marketing-center.service'

// 路由
const router = useRouter()

// 加载状态
const loading = ref(false)

// 营销统计数据
const stats = ref<MarketingStatistics>({
  activeCampaigns: { count: 0, change: '0%' },
  newCustomers: { count: 0, change: '0%' },
  conversionRate: { rate: 0, change: '0%' },
  marketingROI: { roi: 0, change: '0%' }
})

// 最近营销活动
const recentCampaigns = ref<MarketingCampaignSummary[]>([])

// 营销渠道
const marketingChannels = ref<MarketingChannel[]>([])

// 导航到指定页面
const navigateTo = async (path: string) => {
  try {
    await router.push(path)
  } catch (error) {
    console.error('导航失败:', error)
    ElMessage.warning(`页面 ${path} 暂时无法访问，请稍后再试`)
  }
}

// 创建营销活动
const handleCreateCampaign = () => {
  ElMessage.success('跳转到营销活动创建页面')
  // 这里可以添加实际的导航逻辑
}

// 查看营销活动
const viewCampaign = (id: number) => {
  ElMessage.info(`查看营销活动 ${id}`)
}

// 编辑营销活动
const editCampaign = (id: number) => {
  ElMessage.info(`编辑营销活动 ${id}`)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 加载营销统计数据
const loadStatistics = async () => {
  try {
    const data = await MarketingCenterService.getStatistics()
    stats.value = data
  } catch (error) {
    console.error('加载营销统计数据失败:', error)
    ElMessage.error('加载营销统计数据失败')
  }
}

// 加载最近营销活动
const loadRecentCampaigns = async () => {
  try {
    const data = await MarketingCenterService.getRecentCampaigns(3)
    recentCampaigns.value = data
  } catch (error) {
    console.error('加载最近营销活动失败:', error)
    ElMessage.error('加载营销活动数据失败')
  }
}

// 加载营销渠道数据
const loadChannels = async () => {
  try {
    const data = await MarketingCenterService.getChannels()
    marketingChannels.value = data
  } catch (error) {
    console.error('加载营销渠道数据失败:', error)
    ElMessage.error('加载营销渠道数据失败')
  }
}

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadStatistics(),
      loadRecentCampaigns(),
      loadChannels()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('营销中心已加载')
  loadAllData()
})
</script>

<style scoped lang="scss">
.marketing-center {
  padding: var(--text-2xl);
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  background: var(--bg-card);
  padding: var(--text-2xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--text-2xl);
  box-shadow: var(--shadow-md);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0 0 10px 0;
  color: var(--text-primary);
  font-size: var(--text-3xl);
  font-weight: 600;
}

.center-content {
  background: var(--bg-card);
  padding: var(--spacing-8xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.welcome-section h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xl);
}

.welcome-section p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-8xl);
}

.marketing-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--spacing-10xl);
}

.stat-item {
  text-align: center;
  padding: var(--text-2xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--border-color);
}

.stat-item h3 {
  margin: 0 0 10px 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
  font-weight: 500;
}

.stat-value {
  font-size: var(--spacing-3xl);
  font-weight: 700;
  color: var(--warning-color);
  margin-bottom: var(--spacing-base);
}

.stat-trend {
  font-size: var(--text-sm);
  font-weight: 500;
  
  &.positive {
    color: var(--success-color);
  }
}

.marketing-modules h3,
.recent-campaigns h3,
.channel-overview h3 {
  margin-bottom: var(--text-2xl);
  color: var(--text-primary);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--spacing-10xl);
}

.module-item {
  display: flex;
  align-items: center;
  padding: var(--text-2xl);
  background: var(--bg-color);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-color-hover);
    transform: translateY(var(--transform-hover-lift));
    box-shadow: var(--shadow-md);
  }
}

.module-icon {
  font-size: var(--spacing-3xl);
  margin-right: var(--spacing-4xl);
}

.module-content h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.module-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
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
  background: var(--bg-color);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-color);
}

.campaign-info h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.campaign-info p {
  margin: 0 0 10px 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.campaign-meta {
  display: flex;
  gap: var(--spacing-4xl);
  align-items: center;
}

.campaign-status {
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);
  
  &.active {
    background: #e7f5ff;
    color: var(--primary-color);
  }
  
  &.completed {
    background: #f6ffed;
    color: var(--success-color);
  }
}

.campaign-date {
  color: var(--text-tertiary);
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
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.stat .value {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  margin-top: var(--spacing-sm);
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
  background: var(--bg-color);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-color);
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
  color: var(--text-primary);
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
  color: var(--text-secondary);
}

.stat-row .value {
  color: var(--text-primary);
  font-weight: 600;
}

.channel-status {
  text-align: center;
  padding: var(--spacing-base) 10px;
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);

  &.active {
    background: var(--info-bg);
    color: var(--info-color);
  }

  &.paused {
    background: var(--warning-bg);
    color: var(--warning-color);
  }
}
</style>
