<template>
  <CenterContainer
    title="营销中心"
    :tabs="tabs"
    default-tab="overview"
    v-model:activeTab="activeTab"
    :show-header="false"
    :show-actions="false"
    :sync-url="false"
    :show-skeleton="stats.loading"
    @create="handleCreateCampaign"
    @tab-change="handleTabChange"
    class="marketing-center"
  >
    <!-- 概览标签页 -->
    <template #tab-overview>
      <div class="overview-content">
        <!-- 欢迎词和操作按钮 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h2>欢迎来到营销中心</h2>
            <p>这里是营销活动管理和推广的中心枢纽，您可以创建营销活动、管理推广渠道、分析营销效果。</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreateCampaign">
              <el-icon><Plus /></el-icon>
              创建营销活动
            </el-button>
          </div>
        </div>

        <!-- 错误状态提示 -->
        <el-alert
          v-if="stats.error"
          :title="stats.error"
          type="error"
          :closable="false"
          style="margin-bottom: var(--text-2xl)"
        />

        <!-- 营销统计数据 -->
        <div class="stats-grid">
          <div class="stat-card" @click="switchToTab('campaigns')">
            <div class="stat-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ stats.activeCampaigns || 0 }}</span>
              </div>
              <div class="stat-label">活跃营销活动</div>
              <div class="stat-trend" v-if="!stats.loading && !stats.error && stats.campaignTrend">
                <el-icon><TrendCharts /></el-icon>
                <span>{{ stats.campaignTrend }}</span>
              </div>
            </div>
          </div>

          <div class="stat-card" @click="switchToTab('channels')">
            <div class="stat-icon">
              <el-icon><Share /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ stats.activeChannels || 0 }}</span>
              </div>
              <div class="stat-label">推广渠道</div>
              <div class="stat-trend" v-if="!stats.loading && !stats.error && stats.channelTrend">
                <el-icon><TrendCharts /></el-icon>
                <span>{{ stats.channelTrend }}</span>
              </div>
            </div>
          </div>

          <div class="stat-card" @click="switchToTab('coupons')">
            <div class="stat-icon">
              <el-icon><Tickets /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ stats.totalCoupons || 0 }}</span>
              </div>
              <div class="stat-label">优惠券数量</div>
              <div class="stat-trend" v-if="!stats.loading && !stats.error && stats.couponTrend">
                <el-icon><TrendCharts /></el-icon>
                <span>{{ stats.couponTrend }}</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ stats.conversionRate || 0 }}%</span>
              </div>
              <div class="stat-label">转化率</div>
              <div class="stat-trend" v-if="!stats.loading && !stats.error && stats.conversionTrend">
                <el-icon><TrendCharts /></el-icon>
                <span>{{ stats.conversionTrend }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <div class="actions-header">
            <h3>快速操作</h3>
          </div>
          <div class="actions-grid">
            <ActionCard
              v-for="action in quickActions"
              :key="action.key"
              :title="action.title"
              :description="action.description"
              :icon="action.icon"
              :color="action.color"
              @click="handleQuickAction(action.key)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 营销活动标签页 -->
    <template #tab-campaigns>
      <div class="campaigns-content">
        <div class="campaigns-header">
          <h3>营销活动管理</h3>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreateCampaign">
              <el-icon><Plus /></el-icon>
              创建活动
            </el-button>
          </div>
        </div>
        
        <!-- 营销活动列表 -->
        <div class="campaigns-list">
          <el-table :data="marketingCampaigns" stripe>
            <el-table-column prop="title" label="活动名称" />
            <el-table-column prop="type" label="活动类型" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getCampaignStatusType(row.status)">
                  {{ getCampaignStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startDate" label="开始时间" />
            <el-table-column prop="endDate" label="结束时间" />
            <el-table-column prop="participantCount" label="参与人数" />
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" @click="viewCampaign(row)">
                  <el-icon><Document /></el-icon>
                  查看
                </el-button>
                <el-button size="small" type="primary" @click="editCampaign(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- 推广渠道标签页 -->
    <template #tab-channels>
      <div class="channels-content">
        <div class="channels-header">
          <h3>推广渠道管理</h3>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreateChannel">
              <el-icon><Plus /></el-icon>
              添加渠道
            </el-button>
          </div>
        </div>

        <!-- 渠道概览 -->
        <div class="channel-grid">
          <div class="channel-card" v-for="channel in marketingChannels" :key="channel.id">
            <div class="channel-header">
              <div class="channel-icon">{{ channel.icon }}</div>
              <div class="channel-info">
                <h4>{{ channel.name }}</h4>
                <p>{{ channel.description }}</p>
              </div>
              <div class="channel-status" :class="channel.status">
                {{ getChannelStatusText(channel.status) }}
              </div>
            </div>
            
            <div class="channel-stats">
              <div class="stat-row">
                <span>本月获客</span>
                <span class="value">{{ channel.monthlyCustomers || 0 }}</span>
              </div>
              <div class="stat-row">
                <span>转化率</span>
                <span class="value">{{ channel.conversionRate || 0 }}%</span>
              </div>
              <div class="stat-row">
                <span>获客成本</span>
                <span class="value">¥{{ channel.acquisitionCost || 0 }}</span>
              </div>
            </div>

            <div class="channel-actions">
              <el-button size="small" @click="viewChannelDetails(channel)">
                详情
              </el-button>
              <el-button size="small" type="primary" @click="configChannel(channel)">
                配置
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 优惠券管理标签页 -->
    <template #tab-coupons>
      <div class="coupons-content">
        <div class="coupons-header">
          <h3>优惠券管理</h3>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreateCoupon">
              <el-icon><Plus /></el-icon>
              创建优惠券
            </el-button>
          </div>
        </div>

        <!-- 优惠券列表 -->
        <div class="coupons-grid">
          <div class="coupon-card" v-for="coupon in marketingCoupons" :key="coupon.id">
            <div class="coupon-header">
              <h4>{{ coupon.name }}</h4>
              <el-tag :type="getCouponStatusType(coupon.status)">
                {{ getCouponStatusText(coupon.status) }}
              </el-tag>
            </div>
            
            <div class="coupon-content">
              <div class="coupon-discount">
                <span class="discount-type">{{ coupon.discountType }}</span>
                <span class="discount-value">{{ formatDiscount(coupon) }}</span>
              </div>
              
              <div class="coupon-details">
                <p><strong>适用范围：</strong>{{ coupon.applicableScope }}</p>
                <p><strong>有效期：</strong>{{ coupon.validFrom }} - {{ coupon.validTo }}</p>
                <p><strong>使用数量：</strong>{{ coupon.usedCount }} / {{ coupon.totalLimit }}</p>
              </div>
            </div>

            <div class="coupon-actions">
              <el-button size="small" @click="viewCouponDetails(coupon)">
                查看
              </el-button>
              <el-button size="small" type="primary" @click="editCoupon(coupon)">
                编辑
              </el-button>
              <el-button size="small" :type="coupon.status === 'active' ? 'warning' : 'success'" 
                         @click="toggleCouponStatus(coupon)">
                {{ coupon.status === 'active' ? '暂停' : '启用' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 客户咨询标签页 -->
    <template #tab-consultations">
      <div class="consultations-content">
        <div class="consultations-header">
          <h3>客户咨询管理</h3>
          <div class="header-actions">
            <el-button @click="refreshConsultations">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <!-- 咨询统计 -->
        <div class="consultation-stats">
          <div class="stat-item">
            <h4>今日新咨询</h4>
            <div class="value">{{ consultationStats.todayNew || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>待处理</h4>
            <div class="value">{{ consultationStats.pending || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>处理中</h4>
            <div class="value">{{ consultationStats.processing || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>已完成</h4>
            <div class="value">{{ consultationStats.completed || 0 }}</div>
          </div>
        </div>

        <!-- 咨询列表 -->
        <div class="consultations-list">
          <el-table :data="consultations" stripe>
            <el-table-column prop="customerName" label="客户姓名" />
            <el-table-column prop="contactPhone" label="联系电话" />
            <el-table-column prop="consultationType" label="咨询类型" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getConsultationStatusType(row.status)">
                  {{ getConsultationStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="咨询时间" />
            <el-table-column prop="assignedTo" label="负责人" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="viewConsultation(row)">
                  <el-icon><Document /></el-icon>
                  查看
                </el-button>
                <el-button size="small" type="primary" @click="processConsultation(row)">
                  <el-icon><ChatDotSquare /></el-icon>
                  处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- 营销分析标签页 -->
    <template #tab-analytics>
      <div class="analytics-content">
        <div class="analytics-header">
          <h3>营销数据分析</h3>
          <div class="date-range-picker">
            <el-date-picker
              v-model="analyticsDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateRangeChange"
            />
          </div>
        </div>

        <!-- 分析图表 -->
        <div class="analytics-charts">
          <div class="chart-row">
            <div class="chart-container">
              <h4>营销活动效果分析</h4>
              <div ref="campaignEffectChart" class="chart"></div>
            </div>
            <div class="chart-container">
              <h4>渠道转化对比</h4>
              <div ref="channelComparisonChart" class="chart"></div>
            </div>
          </div>
          <div class="chart-row">
            <div class="chart-container full-width">
              <h4>营销ROI趋势</h4>
              <div ref="roiTrendChart" class="chart"></div>
            </div>
          </div>
        </div>

        <!-- 营销洞察 -->
        <div class="marketing-insights">
          <h4>营销洞察</h4>
          <div class="insights-grid">
            <div class="insight-card">
              <el-icon><TrendCharts /></el-icon>
              <div class="insight-content">
                <h5>趋势分析</h5>
                <p v-if="!marketingInsights.loading">{{ marketingInsights.trendAnalysis }}</p>
                <el-skeleton v-else :rows="1" animated />
              </div>
            </div>
            <div class="insight-card">
              <el-icon><Star /></el-icon>
              <div class="insight-content">
                <h5>优化建议</h5>
                <p v-if="!marketingInsights.loading">{{ marketingInsights.optimizationSuggestion }}</p>
                <el-skeleton v-else :rows="1" animated />
              </div>
            </div>
            <div class="insight-card">
              <el-icon><Warning /></el-icon>
              <div class="insight-content">
                <h5>风险提醒</h5>
                <p v-if="!marketingInsights.loading">{{ marketingInsights.riskWarning }}</p>
                <el-skeleton v-else :rows="1" animated />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </CenterContainer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Trophy, Share, Tickets, DataLine, TrendCharts,
  Document, Edit, Refresh, ChatDotSquare, Star, Warning
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import ActionCard from '@/components/centers/ActionCard.vue'
import request from '@/utils/request'

// 路由
const router = useRouter()
const route = useRoute()

// 标签页配置
const tabs = [
  { key: 'overview', label: '概览' },
  { key: 'campaigns', label: '营销活动' },
  { key: 'channels', label: '推广渠道' },
  { key: 'coupons', label: '优惠券管理' },
  { key: 'consultations', label: '客户咨询' },
  { key: 'analytics', label: '营销分析' }
]

// 当前激活的标签页
const activeTab = ref('overview')

// 组件引用
const campaignEffectChart = ref()
const channelComparisonChart = ref()
const roiTrendChart = ref()

// 统计数据
const stats = ref({
  activeCampaigns: null,
  activeChannels: null,
  totalCoupons: null,
  conversionRate: null,
  // 趋势数据
  campaignTrend: null,
  channelTrend: null,
  couponTrend: null,
  conversionTrend: null,
  loading: true,
  error: null
})

// 快速操作配置
const quickActions = ref([
  { key: 'create-campaign', title: '创建营销活动', description: '创建新的营销推广活动', icon: 'Trophy', color: 'primary' },
  { key: 'manage-channels', title: '推广渠道', description: '管理多种推广渠道', icon: 'Share', color: 'success' },
  { key: 'coupon-management', title: '优惠券管理', description: '创建和管理优惠券', icon: 'Tickets', color: 'warning' },
  { key: 'customer-consultations', title: '客户咨询', description: '处理客户咨询问题', icon: 'ChatDotSquare', color: 'info' },
  { key: 'marketing-analytics', title: '营销分析', description: '查看营销效果分析', icon: 'DataLine', color: 'danger' }
])

// 营销活动数据
const marketingCampaigns = ref([])

// 推广渠道数据
const marketingChannels = ref([])

// 优惠券数据
const marketingCoupons = ref([])

// 客户咨询数据
const consultations = ref([])
const consultationStats = ref({
  todayNew: 0,
  pending: 0,
  processing: 0,
  completed: 0
})

// 营销洞察数据
const marketingInsights = ref({
  trendAnalysis: '',
  optimizationSuggestion: '',
  riskWarning: '',
  loading: false
})

// 分析日期范围
const analyticsDateRange = ref([
  new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
  new Date()
])

// 切换标签页
const handleTabChange = async (tabKey: string) => {
  activeTab.value = tabKey
  console.log('切换到标签页:', tabKey)

  // 根据标签页按需加载数据
  switch (tabKey) {
    case 'campaigns':
      if (marketingCampaigns.value.length === 0) {
        await fetchMarketingCampaigns()
      }
      break
    case 'channels':
      if (marketingChannels.value.length === 0) {
        await fetchMarketingChannels()
      }
      break
    case 'coupons':
      if (marketingCoupons.value.length === 0) {
        await fetchMarketingCoupons()
      }
      break
    case 'consultations':
      if (consultations.value.length === 0) {
        await fetchConsultations()
      }
      break
    case 'analytics':
      await loadAnalyticsData()
      nextTick(() => {
        setTimeout(initCharts, 300)
      })
      break
  }
}

const switchToTab = (tabName: string) => {
  activeTab.value = tabName
}

// 获取营销统计数据
const fetchMarketingStats = async () => {
  try {
    console.log('🔄 开始获取营销中心统计数据...')
    stats.value.loading = true
    stats.value.error = null

    const response = await request.get('/statistics', {
      params: {
        module: 'marketing',
        type: 'overview'
      }
    })

    console.log('📊 营销统计API响应:', response)

    if (response.success && response.data) {
      const marketingData = response.data

      stats.value.activeCampaigns = marketingData.activeCampaigns || 0
      stats.value.activeChannels = marketingData.activeChannels || 0
      stats.value.totalCoupons = marketingData.totalCoupons || 0
      stats.value.conversionRate = marketingData.conversionRate || 0

      // 更新趋势数据
      stats.value.campaignTrend = marketingData.campaignTrend
      stats.value.channelTrend = marketingData.channelTrend
      stats.value.couponTrend = marketingData.couponTrend
      stats.value.conversionTrend = marketingData.conversionTrend

      stats.value.loading = false
      console.log('✅ 营销中心统计数据更新成功:', stats.value)
    } else {
      console.warn('⚠️ API响应格式异常:', response)
      stats.value.loading = false
      stats.value.error = 'API响应格式异常'
    }
  } catch (error) {
    console.error('❌ 获取营销中心统计数据失败:', error)
    stats.value.loading = false
    stats.value.error = '数据加载失败'
  }
}

// 获取营销活动数据
const fetchMarketingCampaigns = async () => {
  try {
    const response = await request.get('/marketing/campaigns')
    if (response.success && response.data) {
      marketingCampaigns.value = response.data.data || response.data || []
    }
  } catch (error) {
    console.error('获取营销活动失败:', error)
    ElMessage.error('获取营销活动失败')
  }
}

// 获取推广渠道数据
const fetchMarketingChannels = async () => {
  try {
    const response = await request.get('/marketing/channels')
    if (response.success && response.data) {
      marketingChannels.value = response.data.data || response.data || []
    }
  } catch (error) {
    console.error('获取推广渠道失败:', error)
    ElMessage.error('获取推广渠道失败')
  }
}

// 获取优惠券数据
const fetchMarketingCoupons = async () => {
  try {
    const response = await request.get('/marketing/coupons')
    if (response.success && response.data) {
      marketingCoupons.value = response.data.data || response.data || []
    }
  } catch (error) {
    console.error('获取优惠券数据失败:', error)
    ElMessage.error('获取优惠券数据失败')
  }
}

// 获取客户咨询数据
const fetchConsultations = async () => {
  try {
    const response = await request.get('/marketing/consultations')
    if (response.success && response.data) {
      consultations.value = response.data.data || response.data || []
      
      // 计算咨询统计
      consultationStats.value = response.data.stats || {
        todayNew: 0,
        pending: 0,
        processing: 0,
        completed: 0
      }
    }
  } catch (error) {
    console.error('获取客户咨询失败:', error)
    ElMessage.error('获取客户咨询失败')
  }
}

// 处理快速操作
const handleQuickAction = (actionKey: string) => {
  switch (actionKey) {
    case 'create-campaign':
      handleCreateCampaign()
      break
    case 'manage-channels':
      switchToTab('channels')
      break
    case 'coupon-management':
      switchToTab('coupons')
      break
    case 'customer-consultations':
      switchToTab('consultations')
      break
    case 'marketing-analytics':
      switchToTab('analytics')
      break
    default:
      console.warn('未知的快速操作:', actionKey)
  }
}

// 创建营销活动
const handleCreateCampaign = () => {
  ElMessage.success('跳转到营销活动创建页面')
}

// 创建推广渠道
const handleCreateChannel = () => {
  ElMessage.success('跳转到推广渠道创建页面')
}

// 创建优惠券
const handleCreateCoupon = () => {
  ElMessage.success('跳转到优惠券创建页面')
}

// 查看营销活动
const viewCampaign = (campaign: any) => {
  ElMessage.info(`查看营销活动: ${campaign.title}`)
}

// 编辑营销活动
const editCampaign = (campaign: any) => {
  ElMessage.info(`编辑营销活动: ${campaign.title}`)
}

// 查看渠道详情
const viewChannelDetails = (channel: any) => {
  ElMessage.info(`查看渠道详情: ${channel.name}`)
}

// 配置渠道
const configChannel = (channel: any) => {
  ElMessage.info(`配置渠道: ${channel.name}`)
}

// 查看优惠券详情
const viewCouponDetails = (coupon: any) => {
  ElMessage.info(`查看优惠券: ${coupon.name}`)
}

// 编辑优惠券
const editCoupon = (coupon: any) => {
  ElMessage.info(`编辑优惠券: ${coupon.name}`)
}

// 切换优惠券状态
const toggleCouponStatus = (coupon: any) => {
  const newStatus = coupon.status === 'active' ? 'paused' : 'active'
  ElMessage.success(`优惠券 ${coupon.name} 已${newStatus === 'active' ? '启用' : '暂停'}`)
}

// 查看咨询详情
const viewConsultation = (consultation: any) => {
  ElMessage.info(`查看咨询: ${consultation.customerName}`)
}

// 处理咨询
const processConsultation = (consultation: any) => {
  ElMessage.info(`处理咨询: ${consultation.customerName}`)
}

// 刷新咨询数据
const refreshConsultations = async () => {
  await fetchConsultations()
  ElMessage.success('咨询数据已刷新')
}

// 状态转换函数
const getCampaignStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'paused': 'warning',
    'completed': 'info',
    'cancelled': 'danger'
  }
  return statusMap[status] || 'info'
}

const getCampaignStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '进行中',
    'paused': '已暂停',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

const getChannelStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '运行中',
    'paused': '已暂停',
    'inactive': '未激活'
  }
  return statusMap[status] || '未知'
}

const getCouponStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'paused': 'warning',
    'expired': 'danger',
    'draft': 'info'
  }
  return statusMap[status] || 'info'
}

const getCouponStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '生效中',
    'paused': '已暂停',
    'expired': '已过期',
    'draft': '草稿'
  }
  return statusMap[status] || '未知'
}

const getConsultationStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'processing': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return statusMap[status] || 'info'
}

const getConsultationStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 格式化优惠券折扣
const formatDiscount = (coupon: any) => {
  if (coupon.discountType === 'percentage') {
    return `${coupon.discountValue}折`
  } else if (coupon.discountType === 'amount') {
    return `减¥${coupon.discountValue}`
  }
  return '暂无'
}

// 处理日期范围变化
const handleDateRangeChange = (dateRange: [Date, Date] | null) => {
  console.log('日期范围变化:', dateRange)
  loadAnalyticsData()
}

// 加载分析数据
const loadAnalyticsData = async () => {
  try {
    console.log('🔄 开始加载营销分析数据...')
    // 这里可以添加具体的分析数据加载逻辑
    marketingInsights.value = {
      trendAnalysis: '营销活动整体呈上升趋势，转化率稳步提升',
      optimizationSuggestion: '建议增加社交媒体投放，优化着陆页设计',
      riskWarning: '部分渠道获客成本上升，需要及时调整预算分配',
      loading: false
    }
  } catch (error) {
    console.error('❌ 营销分析数据加载失败:', error)
    ElMessage.error('分析数据加载失败')
  }
}

// 初始化图表
const initCharts = () => {
  setTimeout(() => {
    console.log('🔄 开始初始化营销图表...')

    // 营销活动效果图表
    if (campaignEffectChart.value) {
      const effectChart = echarts.init(campaignEffectChart.value)
      const effectOption = {
        title: { text: '' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['促销活动', '优惠券', '社交媒体', '合作推广', '线下活动']
        },
        yAxis: { type: 'value' },
        series: [{
          name: '转化率',
          type: 'bar',
          data: [85, 92, 78, 88, 95],
          itemStyle: { color: 'var(--primary-color)' }
        }]
      }
      effectChart.setOption(effectOption)
    }

    // 渠道转化对比图表
    if (channelComparisonChart.value) {
      const comparisonChart = echarts.init(channelComparisonChart.value)
      const comparisonOption = {
        title: { text: '' },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '50%',
          data: [
            { value: 35, name: '微信推广' },
            { value: 25, name: '线上广告' },
            { value: 20, name: '合作渠道' },
            { value: 15, name: '口碑推荐' },
            { value: 5, name: '其他' }
          ]
        }]
      }
      comparisonChart.setOption(comparisonOption)
    }

    // ROI趋势图表
    if (roiTrendChart.value) {
      const roiChart = echarts.init(roiTrendChart.value)
      const roiOption = {
        title: { text: '' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value' },
        series: [{
          name: 'ROI',
          type: 'line',
          data: [120, 200, 150, 80, 70, 110],
          smooth: true,
          itemStyle: { color: 'var(--success-color)' }
        }]
      }
      roiChart.setOption(roiOption)
    }
  }, 500)
}

// 组件挂载时加载数据
onMounted(async () => {
  console.log(`🔄 营销中心组件挂载，默认标签页: ${activeTab.value}`)
  
  // 加载基础统计数据
  await fetchMarketingStats()
  
  // 根据当前标签页加载对应数据
  if (activeTab.value === 'overview') {
    // 概览页面需要一些基础数据
    await Promise.all([
      fetchMarketingCampaigns(),
      fetchMarketingChannels()
    ])
  }
})
</script>

<style scoped lang="scss">
// 概览页面样式
.overview-content {
  .marketing-center .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-3xl);
    background: var(--primary-gradient, linear-gradient(135deg, var(--primary-color), var(--ai-primary))) !important;
    border-radius: var(--text-lg);
    border: var(--border-width-base) solid rgba(99, 102, 241, 0.3);
    margin-bottom: var(--spacing-lg, 1.5rem);
    color: white;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) rgba(99, 102, 241, 0.25);

    .welcome-content {
      flex: 1;
      text-align: left;

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: white;
        margin: 0 0 var(--spacing-md, 1rem) 0;
      }

      p {
        font-size: 1rem;
        color: var(--white-alpha-90);
        margin: 0;
        line-height: 1.6;
        max-width: 600px;
      }
    }

    .header-actions {
      flex-shrink: 0;
      margin-left: 2rem;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: var(--text-2xl);
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
    border-radius: var(--text-sm);
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    &:nth-child(2) {
      background: linear-gradient(135deg, #42a5f5 0%, #26c6da 100%);
    }

    &:nth-child(3) {
      background: linear-gradient(135deg, #ab47bc 0%, #ec407a 100%);
    }

    &:nth-child(4) {
      background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
    }

    .stat-icon {
      font-size: var(--text-5xl);
      margin-right: var(--spacing-4xl);
      opacity: 0.8;
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: var(--spacing-3xl);
        font-weight: 700;
        margin-bottom: var(--spacing-base);
      }

      .stat-label {
        font-size: var(--text-base);
        opacity: 0.9;
        margin-bottom: var(--spacing-base);
      }

      .stat-trend {
        display: flex;
        align-items: center;
        font-size: var(--text-sm);
        opacity: 0.8;

        .el-icon {
          margin-right: var(--spacing-xs);
        }
      }
    }
  }

  .quick-actions {
    .actions-header {
      margin-bottom: var(--text-lg);

      h3 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-lg);
    }
  }
}

// 营销活动页面样式
.campaigns-content {
  .campaigns-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }
  }
}

// 推广渠道页面样式
.channels-content {
  .channels-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }
  }

  .channel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--text-2xl);
  }

  .channel-card {
    background: white;
    border-radius: var(--spacing-sm);
    padding: var(--text-2xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
    border: var(--border-width-base) solid #eee;

    .channel-header {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-4xl);

      .channel-icon {
        font-size: var(--text-3xl);
        margin-right: var(--text-sm);
      }

      .channel-info {
        flex: 1;

        h4 {
          margin: 0 0 5px 0;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }

      .channel-status {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--spacing-xs);
        font-size: var(--text-sm);

        &.active {
          background: #e7f5ff;
          color: var(--primary-color);
        }

        &.paused {
          background: var(--bg-white)7e6;
          color: #fa8c16;
        }
      }
    }

    .channel-stats {
      margin-bottom: var(--spacing-4xl);

      .stat-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
        font-size: var(--text-base);

        span:first-child {
          color: var(--text-secondary);
        }

        .value {
          color: var(--text-primary);
          font-weight: 600;
        }
      }
    }

    .channel-actions {
      display: flex;
      gap: var(--spacing-2xl);
    }
  }
}

// 优惠券页面样式
.coupons-content {
  .coupons-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }
  }

  .coupons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--text-2xl);
  }

  .coupon-card {
    background: white;
    border-radius: var(--spacing-sm);
    padding: var(--text-2xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
    border: var(--border-width-base) solid #eee;

    .coupon-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4xl);

      h4 {
        margin: 0;
        color: var(--text-primary);
      }
    }

    .coupon-content {
      margin-bottom: var(--spacing-4xl);

      .coupon-discount {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-2xl);

        .discount-type {
          background: var(--bg-gray-light);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--spacing-xs);
          font-size: var(--text-sm);
          margin-right: var(--spacing-2xl);
        }

        .discount-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--brand-danger);
        }
      }

      .coupon-details p {
        margin: var(--spacing-base) 0;
        font-size: var(--text-base);
        color: var(--text-secondary);
      }
    }

    .coupon-actions {
      display: flex;
      gap: var(--spacing-2xl);
    }
  }
}

// 咨询管理页面样式
.consultations-content {
  .consultations-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }
  }

  .consultation-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);

    .stat-item {
      text-align: center;
      padding: var(--text-2xl);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);

      h4 {
        margin: 0 0 10px 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }

      .value {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

// 营销分析页面样式
.analytics-content {
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }
  }

  .analytics-charts {
    margin-bottom: var(--spacing-8xl);

    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--text-2xl);
      margin-bottom: var(--text-2xl);

      &:last-child {
        margin-bottom: 0;
      }

      .chart-container {
        background: var(--bg-gray-light);
        padding: var(--text-2xl);
        border-radius: var(--spacing-sm);

        &.full-width {
          grid-column: 1 / -1;
        }

        h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          font-size: var(--text-lg);
        }

        .chart {
          width: 100%;
          height: 300px;
          min-height: 300px;
        }
      }
    }
  }

  .marketing-insights {
    h4 {
      margin: 0 0 var(--text-2xl) 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--text-2xl);
    }

    .insight-card {
      display: flex;
      align-items: flex-start;
      padding: var(--text-2xl);
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
      border-radius: var(--spacing-sm);
      color: white;

      &:nth-child(2) {
        background: var(--gradient-pink);
      }

      &:nth-child(3) {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        color: var(--text-primary);
      }

      .el-icon {
        font-size: var(--text-3xl);
        margin-right: var(--spacing-4xl);
        margin-top: var(--spacing-sm);
        opacity: 0.8;
      }

      .insight-content {
        flex: 1;

        h5 {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--text-lg);
          font-weight: 600;
        }

        p {
          margin: 0;
          font-size: var(--text-base);
          line-height: 1.4;
          opacity: 0.9;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .overview-content .stats-grid {
    grid-template-columns: 1fr;
  }

  .channel-grid,
  .coupons-grid {
    grid-template-columns: 1fr;
  }

  .consultation-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .analytics-charts .chart-row {
    grid-template-columns: 1fr;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }
}
</style>