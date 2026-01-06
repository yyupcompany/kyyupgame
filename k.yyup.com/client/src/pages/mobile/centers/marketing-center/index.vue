<template>
  <MobileMainLayout
    title="营销中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <template #header-extra>
      <van-button
        type="primary"
        size="small"
        icon="plus"
        @click="handleCreateCampaign"
      >
        创建活动
      </van-button>
    </template>

    <div class="mobile-marketing-center">

      <!-- 欢迎词 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <van-notice-bar
            left-icon="volume-o"
            :scrollable="true"
            text="清晰展示营销活动的完整流程，方便园长一目了然地掌握营销进展"
            background="#e6f7ff"
            color="#1890ff"
          />
        </div>
      </div>

      <!-- 营销统计数据 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div
            v-for="stat in marketingStats"
            :key="stat.key"
            class="stat-card-mobile"
            :class="`stat-card--${stat.type}`"
            @click="handleStatClick(stat)"
          >
            <div class="stat-icon">
              <van-icon :name="getMobileIcon(stat.iconName)" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatStatValue(stat.value, stat.unit) }}</div>
              <div class="stat-title">{{ stat.title }}</div>
              <div v-if="stat.trend !== 0" class="stat-trend">
                <van-icon
                  :name="stat.trend > 0 ? 'arrow-up' : 'arrow-down'"
                  :color="stat.trend > 0 ? '#07c160' : '#ee0a24'"
                  size="12"
                />
                <span :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
                  {{ Math.abs(stat.trend) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 营销功能模块 -->
      <div class="marketing-modules">
        <div class="section-header">
          <h3 class="section-title">营销核心功能</h3>
          <p class="section-subtitle">管理营销活动，分析营销效果，提升转化率</p>
        </div>

        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="module in marketingModules"
            :key="module.key"
            @click="navigateToModule(module.path)"
          >
            <div class="module-card-mobile" :class="`module-${module.type}`">
              <div class="module-icon">{{ module.icon }}</div>
              <h4 class="module-title">{{ module.title }}</h4>
              <van-tag :type="module.tagType" size="small">{{ module.tag }}</van-tag>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 最近营销活动 -->
      <div class="recent-campaigns">
        <div class="section-header">
          <h3 class="section-title">最近营销活动</h3>
          <p class="section-subtitle">查看和管理最近执行的营销活动</p>
        </div>

        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadCampaigns"
        >
          <div
            v-for="campaign in recentCampaigns"
            :key="campaign.id"
            class="campaign-card-mobile"
          >
            <div class="campaign-header">
              <div class="campaign-title-section">
                <h4 class="campaign-title">{{ campaign.title }}</h4>
                <van-tag
                  :type="getCampaignStatusTagType(campaign.status)"
                  size="small"
                >
                  {{ getCampaignStatusText(campaign.status) }}
                </van-tag>
              </div>
              <div class="campaign-date">{{ formatDate(campaign.startDate) }}</div>
            </div>

            <p class="campaign-description">{{ campaign.description }}</p>

            <div class="campaign-metrics">
              <div class="metric-item">
                <div class="metric-label">参与人数</div>
                <div class="metric-value primary">{{ campaign.participantCount }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">转化率</div>
                <div class="metric-value success">{{ campaign.conversionRate }}%</div>
              </div>
            </div>

            <div class="campaign-actions">
              <van-button size="small" icon="eye-o" @click="viewCampaign(campaign.id)">
                查看详情
              </van-button>
              <van-button size="small" type="primary" icon="chart-trending-o" @click="analyzeCampaign(campaign.id)">
                效果分析
              </van-button>
            </div>
          </div>
        </van-list>
      </div>

      <!-- 营销渠道概览 -->
      <div class="channel-overview">
        <div class="section-header">
          <h3 class="section-title">营销渠道概览</h3>
          <p class="section-subtitle">监控各营销渠道的表现和效果</p>
        </div>

        <div class="channels-grid">
          <div
            v-for="channel in marketingChannels"
            :key="channel.name"
            class="channel-card-mobile"
          >
            <div class="channel-card-header">
              <div class="channel-info">
                <div class="channel-icon-wrapper">
                  <span class="channel-icon">{{ channel.icon }}</span>
                </div>
                <div class="channel-details">
                  <h4 class="channel-name">{{ channel.name }}</h4>
                  <div class="channel-status" :class="channel.status">
                    {{ getChannelStatusText(channel.status) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="channel-metrics">
              <div class="metric-row">
                <div class="metric-item">
                  <div class="metric-icon">👥</div>
                  <div class="metric-content">
                    <div class="metric-label">月客户数</div>
                    <div class="metric-value">{{ channel.monthlyCustomers }}</div>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-icon">📈</div>
                  <div class="metric-content">
                    <div class="metric-label">转化率</div>
                    <div class="metric-value">{{ channel.conversionRate }}%</div>
                  </div>
                </div>
              </div>
              <div class="metric-row">
                <div class="metric-item">
                  <div class="metric-icon">💰</div>
                  <div class="metric-content">
                    <div class="metric-label">获客成本</div>
                    <div class="metric-value">¥{{ channel.acquisitionCost }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="channel-actions">
              <van-button size="small" icon="eye-o" @click="viewChannelDetails(channel.name)">
                查看详情
              </van-button>
              <van-button
                size="small"
                :type="channel.status === 'active' ? 'warning' : 'primary'"
                :icon="channel.status === 'active' ? 'pause' : 'play'"
                @click="toggleChannelStatus(channel.name)"
              >
                {{ channel.status === 'active' ? '暂停' : '启用' }}
              </van-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 营销分析工具 -->
      <div class="marketing-tools">
        <div class="section-header">
          <h3 class="section-title">营销分析工具</h3>
          <p class="section-subtitle">使用AI工具分析营销数据，优化营销策略</p>
        </div>

        <div class="tools-grid">
          <div
            v-for="tool in marketingTools"
            :key="tool.key"
            class="tool-card-mobile"
            @click="useMarketingTool(tool.path)"
          >
            <div class="tool-icon">{{ tool.icon }}</div>
            <h4 class="tool-title">{{ tool.title }}</h4>
            <p class="tool-description">{{ tool.description }}</p>
            <van-tag :type="tool.tagType" size="small">{{ tool.tag }}</van-tag>
          </div>
        </div>
      </div>

    </div>

    <!-- 创建营销活动弹窗 -->
    <van-popup
      v-model:show="showCreateCampaignDialog"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <div class="create-campaign-dialog">
        <div class="dialog-header">
          <h3>创建营销活动</h3>
          <van-button icon="cross" @click="showCreateCampaignDialog = false" />
        </div>
        <div class="dialog-content">
          <van-form @submit="submitCreateCampaign">
            <van-cell-group inset>
              <van-field
                v-model="campaignForm.title"
                name="title"
                label="活动名称"
                placeholder="请输入活动名称"
                :rules="[{ required: true, message: '请输入活动名称' }]"
              />
              <van-field
                v-model="campaignForm.description"
                name="description"
                label="活动描述"
                placeholder="请输入活动描述"
                type="textarea"
                :rules="[{ required: true, message: '请输入活动描述' }]"
              />
              <van-field
                v-model="campaignForm.channel"
                name="channel"
                label="营销渠道"
                placeholder="请选择营销渠道"
                readonly
                @click="showChannelPicker = true"
              />
              <van-field
                v-model="campaignForm.budget"
                name="budget"
                label="预算金额"
                placeholder="请输入预算金额"
                type="number"
              />
            </van-cell-group>
            <div class="dialog-actions">
              <van-button block type="primary" native-type="submit">
                创建活动
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 渠道选择器 -->
    <van-picker
      v-model:show="showChannelPicker"
      :columns="channelColumns"
      title="选择营销渠道"
      @confirm="onChannelConfirm"
      @cancel="showChannelPicker = false"
    />

    <!-- 悬浮操作按钮 -->
    <van-back-top right="20" bottom="80" />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import MarketingCenterService, {
  type MarketingStatistics,
  type MarketingCampaignSummary,
  type MarketingChannel
} from '@/services/marketing-center.service'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const finished = ref(false)
const showCreateCampaignDialog = ref(false)
const showChannelPicker = ref(false)

// 营销统计数据
const marketingStats = ref([
  {
    key: 'activeCampaigns',
    title: '活跃营销活动',
    value: 0,
    unit: '',
    trend: 0,
    trendText: '较上月',
    type: 'primary',
    iconName: 'megaphone'
  },
  {
    key: 'newCustomers',
    title: '本月新客户',
    value: 0,
    unit: '',
    trend: 0,
    trendText: '较上月',
    type: 'success',
    iconName: 'user-plus-o'
  },
  {
    key: 'conversionRate',
    title: '转化率',
    value: 0,
    unit: '%',
    trend: 0,
    trendText: '较上月',
    type: 'warning',
    iconName: 'chart-trending-o'
  },
  {
    key: 'marketingROI',
    title: '营销ROI',
    value: 0,
    unit: '%',
    trend: 0,
    trendText: '较上月',
    type: 'info',
    iconName: 'balance-o'
  }
])

// 营销功能模块
const marketingModules = ref([
  {
    key: 'channels',
    title: '渠道管理',
    icon: '🎯',
    tag: '营销渠道',
    tagType: 'primary',
    type: 'primary',
    path: '/mobile/centers/marketing/channels'
  },
  {
    key: 'referrals',
    title: '老带新',
    icon: '👥',
    tag: '推荐管理',
    tagType: 'success',
    type: 'success',
    path: '/mobile/centers/marketing/referrals'
  },
  {
    key: 'conversions',
    title: '转换统计',
    icon: '📊',
    tag: '数据分析',
    tagType: 'warning',
    type: 'warning',
    path: '/mobile/centers/marketing/conversions'
  },
  {
    key: 'funnel',
    title: '销售漏斗',
    icon: '🔄',
    tag: '流程分析',
    tagType: 'danger',
    type: 'danger',
    path: '/mobile/centers/marketing/funnel'
  }
])

// 最近营销活动
const recentCampaigns = ref<MarketingCampaignSummary[]>([])

// 营销渠道
const marketingChannels = ref<MarketingChannel[]>([])

// 营销工具
const marketingTools = ref([
  {
    key: 'roi-analyzer',
    title: 'ROI分析器',
    icon: '💰',
    description: '智能分析营销投资回报率',
    tag: 'AI分析',
    tagType: 'primary',
    path: '/mobile/centers/marketing/tools/roi-analyzer'
  },
  {
    key: 'conversion-predictor',
    title: '转化预测',
    icon: '🔮',
    description: 'AI预测营销活动转化效果',
    tag: 'AI预测',
    tagType: 'success',
    path: '/mobile/centers/marketing/tools/conversion-predictor'
  },
  {
    key: 'campaign-optimizer',
    title: '活动优化器',
    icon: '⚡',
    description: '智能优化营销活动策略',
    tag: 'AI优化',
    tagType: 'warning',
    path: '/mobile/centers/marketing/tools/campaign-optimizer'
  },
  {
    key: 'report-generator',
    title: '报告生成器',
    icon: '📋',
    description: '自动生成营销分析报告',
    tag: '自动生成',
    tagType: 'default',
    path: '/mobile/centers/marketing/tools/report-generator'
  }
])

// 创建活动表单
const campaignForm = ref({
  title: '',
  description: '',
  channel: '',
  budget: ''
})

// 渠道选择器选项
const channelColumns = ref([
  { text: '微信朋友圈', value: 'wechat-moments' },
  { text: '微信公众号', value: 'wechat-official' },
  { text: '线下活动', value: 'offline-event' },
  { text: '电话营销', value: 'telemarketing' },
  { text: '社区推广', value: 'community' },
  { text: '合作伙伴', value: 'partner' }
])

// 获取移动端图标
const getMobileIcon = (iconName: string) => {
  const iconMap: Record<string, string> = {
    'megaphone': 'volume-o',
    'user-plus': 'user-plus-o',
    'trending-up': 'chart-trending-o',
    'dollar-sign': 'balance-o'
  }
  return iconMap[iconName] || 'apps-o'
}

// 格式化统计值
const formatStatValue = (value: number, unit: string) => {
  if (unit === '%') {
    return `${value.toFixed(1)}${unit}`
  }
  return value.toLocaleString() + unit
}

// API调用函数
const fetchMarketingStatistics = async () => {
  try {
    const data = await MarketingCenterService.getStatistics()
    marketingStats.value = [
      {
        key: 'activeCampaigns',
        title: '活跃营销活动',
        value: data.activeCampaigns.count,
        unit: '',
        trend: parseTrendValue(data.activeCampaigns.change),
        trendText: '较上月',
        type: 'primary',
        iconName: 'megaphone'
      },
      {
        key: 'newCustomers',
        title: '本月新客户',
        value: data.newCustomers.count,
        unit: '',
        trend: parseTrendValue(data.newCustomers.change),
        trendText: '较上月',
        type: 'success',
        iconName: 'user-plus-o'
      },
      {
        key: 'conversionRate',
        title: '转化率',
        value: data.conversionRate.rate,
        unit: '%',
        trend: parseTrendValue(data.conversionRate.change),
        trendText: '较上月',
        type: 'warning',
        iconName: 'chart-trending-o'
      },
      {
        key: 'marketingROI',
        title: '营销ROI',
        value: data.marketingROI.roi,
        unit: '%',
        trend: parseTrendValue(data.marketingROI.change),
        trendText: '较上月',
        type: 'info',
        iconName: 'balance-o'
      }
    ]
  } catch (error) {
    console.error('获取营销统计数据失败:', error)
    showToast('获取统计数据失败')
  }
}

const fetchRecentCampaigns = async () => {
  try {
    const data = await MarketingCenterService.getRecentCampaigns(5)
    recentCampaigns.value = data
  } catch (error) {
    console.error('获取最近营销活动失败:', error)
  }
}

const fetchMarketingChannels = async () => {
  try {
    const data = await MarketingCenterService.getChannels()
    marketingChannels.value = data
  } catch (error) {
    console.error('获取营销渠道失败:', error)
  }
}

// 解析趋势值
const parseTrendValue = (changeStr: string): number => {
  if (!changeStr) return 0
  const numStr = changeStr.replace(/[%+]/g, '')
  const num = parseFloat(numStr)
  return isNaN(num) ? 0 : num
}

// 加载营销活动
const loadCampaigns = () => {
  setTimeout(() => {
    finished.value = true
  }, 1000)
}

// 初始化数据
const initData = async () => {
  const loadingToast = showLoadingToast('加载数据中...')
  try {
    await Promise.all([
      fetchMarketingStatistics(),
      fetchRecentCampaigns(),
      fetchMarketingChannels()
    ])
    loadingToast.close()
  } catch (error) {
    loadingToast.close()
    showToast('数据加载失败')
  }
}

// 导航到模块
const navigateToModule = (path: string) => {
  router.push(path)
}

// 使用营销工具
const useMarketingTool = (path: string) => {
  router.push(path)
}

// 创建营销活动
const handleCreateCampaign = () => {
  showCreateCampaignDialog.value = true
}

// 提交创建活动
const submitCreateCampaign = () => {
  showToast('营销活动创建功能开发中...')
  showCreateCampaignDialog.value = false
}

// 渠道选择确认
const onChannelConfirm = ({ selectedValues }: any) => {
  campaignForm.value.channel = selectedValues[0].text
  showChannelPicker.value = false
}

// 处理统计卡片点击
const handleStatClick = (stat: any) => {
  showToast(`点击了${stat.title}统计卡片`)
}

// 查看活动详情
const viewCampaign = (id: number) => {
  router.push(`/mobile/centers/marketing/campaign-detail?id=${id}`)
}

// 分析活动效果
const analyzeCampaign = (id: number) => {
  router.push(`/mobile/centers/marketing/campaign-analysis?id=${id}`)
}

// 获取活动状态文本
const getCampaignStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    planned: '计划中'
  }
  return statusMap[status] || status
}

// 获取活动状态标签类型
const getCampaignStatusTagType = (status: string) => {
  const statusTypeMap: Record<string, string> = {
    active: 'primary',
    completed: 'success',
    paused: 'warning',
    planned: 'default'
  }
  return statusTypeMap[status] || 'default'
}

// 查看渠道详情
const viewChannelDetails = (channelName: string) => {
  router.push(`/mobile/centers/marketing/channel-detail?name=${encodeURIComponent(channelName)}`)
}

// 切换渠道状态
const toggleChannelStatus = (channelName: string) => {
  showToast(`切换渠道状态: ${channelName}`)
}

// 获取渠道状态文本
const getChannelStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '运行中',
    paused: '已暂停',
    inactive: '未启用'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days < 1) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('移动端营销中心已加载')
  initData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-marketing-center {
  padding: var(--van-padding-md);
  background: var(--van-background-color-light);
  min-height: 100vh;
}

// 欢迎词样式
.welcome-section {
  margin-bottom: var(--van-padding-lg);

  .welcome-content {
    border-radius: var(--van-radius-lg);
    overflow: hidden;
  }
}

// 统计卡片样式
.stats-section {
  margin-bottom: var(--van-padding-lg);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--van-padding-md);

    .stat-card-mobile {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--van-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-background-color-light);
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: 2px;
        }

        .stat-title {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: 4px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;

          .trend-up {
            color: #07c160;
          }

          .trend-down {
            color: #ee0a24;
          }
        }
      }

      &.stat-card--primary .stat-icon {
        background: rgba(64, 158, 255, 0.1);
        color: var(--primary-color);
      }

      &.stat-card--success .stat-icon {
        background: rgba(103, 194, 58, 0.1);
        color: var(--success-color);
      }

      &.stat-card--warning .stat-icon {
        background: rgba(230, 162, 60, 0.1);
        color: var(--warning-color);
      }

      &.stat-card--info .stat-icon {
        background: rgba(144, 147, 153, 0.1);
        color: var(--info-color);
      }
    }
  }
}

// 区域标题样式
.section-header {
  margin-bottom: var(--van-padding-lg);
  text-align: left;

  .section-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--van-text-color);
    margin: 0 0 var(--van-padding-xs) 0;
    line-height: 1.3;
  }

  .section-subtitle {
    font-size: var(--text-sm);
    color: var(--van-text-color-2);
    margin: 0;
    line-height: 1.5;
  }
}

// 营销功能模块样式
.marketing-modules {
  margin-bottom: var(--van-padding-lg);

  .module-card-mobile {
    background: var(--card-bg);
    border-radius: var(--van-radius-lg);
    padding: var(--van-padding-md);
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &:active {
      transform: scale(0.98);
    }

    .module-icon {
      font-size: var(--text-4xl);
      margin-bottom: var(--van-padding-xs);
    }

    .module-title {
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-xs) 0;
      line-height: 1.2;
    }
  }
}

// 活动卡片样式
.recent-campaigns {
  margin-bottom: var(--van-padding-lg);

  .campaign-card-mobile {
    background: var(--card-bg);
    border-radius: var(--van-radius-lg);
    padding: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .campaign-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--van-padding-md);

      .campaign-title-section {
        flex: 1;

        .campaign-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-text-color);
          margin: 0 0 var(--van-padding-xs) 0;
          line-height: 1.3;
        }
      }

      .campaign-date {
        font-size: var(--text-xs);
        color: var(--van-text-color-3);
        white-space: nowrap;
        margin-left: var(--van-padding-sm);
      }
    }

    .campaign-description {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      line-height: 1.5;
      margin: 0 0 var(--van-padding-md) 0;
    }

    .campaign-metrics {
      display: flex;
      gap: var(--van-padding-lg);
      margin-bottom: var(--van-padding-md);

      .metric-item {
        text-align: center;
        flex: 1;

        .metric-label {
          font-size: var(--text-xs);
          color: var(--van-text-color-3);
          margin-bottom: var(--van-padding-xs);
        }

        .metric-value {
          font-size: var(--text-base);
          font-weight: 600;

          &.primary {
            color: var(--primary-color);
          }

          &.success {
            color: var(--success-color);
          }
        }
      }
    }

    .campaign-actions {
      display: flex;
      gap: var(--van-padding-sm);
      justify-content: flex-end;
    }
  }
}

// 渠道卡片样式
.channel-overview {
  margin-bottom: var(--van-padding-lg);

  .channels-grid {
    .channel-card-mobile {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      margin-bottom: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .channel-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--van-padding-md);

        .channel-info {
          display: flex;
          align-items: center;
          flex: 1;

          .channel-icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: var(--van-radius-md);
            background: rgba(64, 158, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: var(--van-padding-md);

            .channel-icon {
              font-size: var(--text-xl);
            }
          }

          .channel-details {
            .channel-name {
              font-size: var(--text-base);
              font-weight: 600;
              color: var(--van-text-color);
              margin: 0 0 var(--van-padding-xs) 0;
              line-height: 1.3;
            }

            .channel-status {
              font-size: var(--text-xs);
              padding: 2px 6px;
              border-radius: var(--van-radius-sm);
              font-weight: 500;

              &.active {
                background: rgba(103, 194, 58, 0.1);
                color: var(--success-color);
              }

              &.paused {
                background: rgba(230, 162, 60, 0.1);
                color: var(--warning-color);
              }

              &.inactive {
                background: rgba(144, 147, 153, 0.1);
                color: var(--info-color);
              }
            }
          }
        }
      }

      .channel-metrics {
        margin-bottom: var(--van-padding-md);

        .metric-row {
          display: flex;
          gap: var(--van-padding-md);
          margin-bottom: var(--van-padding-sm);

          &:last-child {
            margin-bottom: 0;
          }

          .metric-item {
            display: flex;
            align-items: center;
            gap: var(--van-padding-xs);
            flex: 1;
            padding: var(--van-padding-xs);
            background: var(--van-background-color-light);
            border-radius: var(--van-radius-sm);

            .metric-icon {
              font-size: var(--text-base);
            }

            .metric-content {
              .metric-label {
                font-size: 11px;
                color: var(--van-text-color-3);
                margin-bottom: 2px;
              }

              .metric-value {
                font-size: var(--text-sm);
                font-weight: 600;
                color: var(--van-text-color);
              }
            }
          }
        }
      }

      .channel-actions {
        display: flex;
        gap: var(--van-padding-sm);
        justify-content: flex-end;
      }
    }
  }
}

// 营销工具样式
.marketing-tools {
  margin-bottom: var(--van-padding-lg);

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--van-padding-md);

    .tool-card-mobile {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      cursor: pointer;

      &:active {
        transform: scale(0.98);
      }

      .tool-icon {
        font-size: var(--text-4xl);
        margin-bottom: var(--van-padding-xs);
      }

      .tool-title {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--van-text-color);
        margin: 0 0 var(--van-padding-xs) 0;
        line-height: 1.2;
      }

      .tool-description {
        font-size: var(--text-xs);
        color: var(--van-text-color-3);
        margin: 0 0 var(--van-padding-xs) 0;
        line-height: 1.3;
      }
    }
  }
}

// 创建活动弹窗样式
.create-campaign-dialog {
  padding: var(--van-padding-lg);

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--van-padding-lg);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .dialog-content {
    .dialog-actions {
      margin-top: var(--van-padding-lg);
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-marketing-center {
    padding: var(--van-padding-sm);
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }

  .tools-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
