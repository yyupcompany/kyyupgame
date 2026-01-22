<template>
  <UnifiedCenterLayout
    title="AI模型用量中心"
    description="追踪和管理AI模型使用情况，包括文本生成、图片处理、视频分析的Token消耗和成本分析"
  >
    <div class="usage-center-container">
      <!-- 统计概览卡片 -->
      <div class="stats-overview">
        <div class="stat-card stat-card-primary" @click="navigateToDetail('text')">
          <div class="stat-header">
            <div class="stat-icon">
              <UnifiedIcon name="file-text" />
            </div>
            <div class="stat-trend" :class="{ positive: textStats.trend > 0 }">
              <UnifiedIcon :name="textStats.trend > 0 ? 'trending-up' : 'trending-down'" />
              {{ Math.abs(textStats.trend) }}%
            </div>
          </div>
          <div class="stat-content">
            <h3>文本生成</h3>
            <div class="stat-value">{{ formatTokens(textStats.tokens) }}</div>
            <div class="stat-label">今日Token消耗</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (textStats.usage / textStats.quota * 100) + '%' }"></div>
            </div>
            <div class="progress-text">{{ textStats.usage }}/{{ textStats.quota }}%</div>
          </div>
        </div>

        <div class="stat-card stat-card-purple" @click="navigateToDetail('image')">
          <div class="stat-header">
            <div class="stat-icon">
              <UnifiedIcon name="image" />
            </div>
            <div class="stat-trend" :class="{ positive: imageStats.trend > 0 }">
              <UnifiedIcon :name="imageStats.trend > 0 ? 'trending-up' : 'trending-down'" />
              {{ Math.abs(imageStats.trend) }}%
            </div>
          </div>
          <div class="stat-content">
            <h3>图片处理</h3>
            <div class="stat-value">{{ formatTokens(imageStats.tokens) }}</div>
            <div class="stat-label">今日Token消耗</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (imageStats.usage / imageStats.quota * 100) + '%' }"></div>
            </div>
            <div class="progress-text">{{ imageStats.usage }}/{{ imageStats.quota }}%</div>
          </div>
        </div>

        <div class="stat-card stat-card-orange" @click="navigateToDetail('video')">
          <div class="stat-header">
            <div class="stat-icon">
              <UnifiedIcon name="video" />
            </div>
            <div class="stat-trend" :class="{ positive: videoStats.trend > 0 }">
              <UnifiedIcon :name="videoStats.trend > 0 ? 'trending-up' : 'trending-down'" />
              {{ Math.abs(videoStats.trend) }}%
            </div>
          </div>
          <div class="stat-content">
            <h3>视频分析</h3>
            <div class="stat-value">{{ formatTokens(videoStats.tokens) }}</div>
            <div class="stat-label">今日Token消耗</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (videoStats.usage / videoStats.quota * 100) + '%' }"></div>
            </div>
            <div class="progress-text">{{ videoStats.usage }}/{{ videoStats.quota }}%</div>
          </div>
        </div>

        <div class="stat-card stat-card-green" @click="navigateToDetail('cost')">
          <div class="stat-header">
            <div class="stat-icon">
              <UnifiedIcon name="dollar-sign" />
            </div>
            <div class="stat-trend" :class="{ positive: costStats.trend > 0 }">
              <UnifiedIcon :name="costStats.trend > 0 ? 'trending-up' : 'trending-down'" />
              {{ Math.abs(costStats.trend) }}%
            </div>
          </div>
          <div class="stat-content">
            <h3>成本分析</h3>
            <div class="stat-value">¥{{ costStats.totalCost.toFixed(2) }}</div>
            <div class="stat-label">今日总成本</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (costStats.usage / costStats.quota * 100) + '%' }"></div>
            </div>
            <div class="progress-text">{{ costStats.usage }}/{{ costStats.quota }}%</div>
          </div>
        </div>
      </div>

      <!-- AI模型使用明细 -->
      <div class="section-card glass-card">
        <div class="section-header">
          <div class="section-title">
            <UnifiedIcon name="cpu" />
            <h3>AI模型使用明细</h3>
          </div>
          <el-select v-model="selectedTimeRange" size="large" @change="handleTimeRangeChange">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="全部" value="all" />
          </el-select>
        </div>
        <div class="model-grid">
          <div
            v-for="model in aiModels"
            :key="model.id"
            class="model-item"
            @click="showModelDetail(model)"
          >
            <div class="model-header">
              <div class="model-icon" :style="{ background: model.color }">
                <UnifiedIcon :name="model.icon" />
              </div>
              <div class="model-status" :class="model.status">
                <span class="status-dot"></span>
                {{ model.statusText }}
              </div>
            </div>
            <div class="model-info">
              <h4>{{ model.name }}</h4>
              <p>{{ model.description }}</p>
            </div>
            <div class="model-metrics">
              <div class="metric">
                <span class="metric-label">调用次数</span>
                <span class="metric-value">{{ formatNumber(model.calls) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Token消耗</span>
                <span class="metric-value">{{ formatTokens(model.tokens) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">平均响应</span>
                <span class="metric-value">{{ model.avgResponse }}ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">成本</span>
                <span class="metric-value">¥{{ model.cost.toFixed(4) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用趋势图表 -->
      <div class="charts-row">
        <div class="chart-card glass-card">
          <div class="chart-header">
            <h3>Token消耗趋势</h3>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-dot legend-blue"></span>
                文本生成
              </span>
              <span class="legend-item">
                <span class="legend-dot legend-purple"></span>
                图片处理
              </span>
              <span class="legend-item">
                <span class="legend-dot legend-orange"></span>
                视频分析
              </span>
            </div>
          </div>
          <div class="chart-container">
            <div class="mock-line-chart">
              <svg viewBox="0 0 600 200" class="chart-svg">
                <!-- Grid lines -->
                <line v-for="i in 5" :key="'grid-' + i"
                  :x1="0" :y1="i * 40"
                  :x2="600" :y2="i * 40"
                  stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4"
                />
                <!-- Text line -->
                <path class="chart-line chart-line-blue"
                  :d="generateLinePath(textTrendData)"
                  fill="none"
                />
                <path class="chart-area chart-area-blue"
                  :d="generateAreaPath(textTrendData)"
                  fill="url(#gradient-blue)"
                />
                <!-- Image line -->
                <path class="chart-line chart-line-purple"
                  :d="generateLinePath(imageTrendData)"
                  fill="none"
                />
                <path class="chart-area chart-area-purple"
                  :d="generateAreaPath(imageTrendData)"
                  fill="url(#gradient-purple)"
                />
                <!-- Video line -->
                <path class="chart-line chart-line-orange"
                  :d="generateLinePath(videoTrendData)"
                  fill="none"
                />
                <path class="chart-area chart-area-orange"
                  :d="generateAreaPath(videoTrendData)"
                  fill="url(#gradient-orange)"
                />
                <!-- Gradients -->
                <defs>
                  <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#F97316" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#F97316" stop-opacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <div class="chart-card glass-card">
          <div class="chart-header">
            <h3>成本分布</h3>
          </div>
          <div class="chart-container">
            <div class="cost-distribution">
              <div class="cost-item">
                <div class="cost-bar">
                  <div class="cost-fill cost-fill-blue"
                    :style="{ width: (textStats.cost / totalCost * 100) + '%' }">
                  </div>
                </div>
                <div class="cost-info">
                  <span class="cost-label">文本生成</span>
                  <span class="cost-value">¥{{ textStats.cost.toFixed(2) }}</span>
                </div>
              </div>
              <div class="cost-item">
                <div class="cost-bar">
                  <div class="cost-fill cost-fill-purple"
                    :style="{ width: (imageStats.cost / totalCost * 100) + '%' }">
                  </div>
                </div>
                <div class="cost-info">
                  <span class="cost-label">图片处理</span>
                  <span class="cost-value">¥{{ imageStats.cost.toFixed(2) }}</span>
                </div>
              </div>
              <div class="cost-item">
                <div class="cost-bar">
                  <div class="cost-fill cost-fill-orange"
                    :style="{ width: (videoStats.cost / totalCost * 100) + '%' }">
                  </div>
                </div>
                <div class="cost-info">
                  <span class="cost-label">视频分析</span>
                  <span class="cost-value">¥{{ videoStats.cost.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Token消耗排行 -->
      <div class="section-card glass-card">
        <div class="section-header">
          <div class="section-title">
            <UnifiedIcon name="bar-chart-2" />
            <h3>Token消耗排行</h3>
          </div>
          <el-radio-group v-model="rankingType" size="large">
            <el-radio-button label="users">用户排行</el-radio-button>
            <el-radio-button label="features">功能排行</el-radio-button>
          </el-radio-group>
        </div>
        <div class="ranking-list">
          <div
            v-for="(item, index) in currentRanking"
            :key="item.id"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="ranking-position">
              <span v-if="index < 3" class="medal" :class="'medal-' + (index + 1)">
                <UnifiedIcon :name="index === 0 ? 'award' : index === 1 ? 'trophy' : 'star'" />
              </span>
              <span v-else class="position-number">{{ index + 1 }}</span>
            </div>
            <div class="ranking-info">
              <div class="ranking-avatar">
                <img v-if="item.avatar" :src="item.avatar" :alt="item.name" />
                <div v-else class="avatar-placeholder">
                  <UnifiedIcon name="user" />
                </div>
              </div>
              <div class="ranking-details">
                <h4>{{ item.name }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </div>
            <div class="ranking-metrics">
              <div class="metric-item">
                <span class="metric-label">Token消耗</span>
                <span class="metric-value">{{ formatTokens(item.tokens) }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">占比</span>
                <span class="metric-value">{{ item.percentage }}%</span>
              </div>
            </div>
            <div class="ranking-trend">
              <span v-if="item.trend > 0" class="trend-up">
                <UnifiedIcon name="trending-up" />
                {{ item.trend }}%
              </span>
              <span v-else class="trend-down">
                <UnifiedIcon name="trending-down" />
                {{ Math.abs(item.trend) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="section-card glass-card">
        <div class="section-header">
          <div class="section-title">
            <UnifiedIcon name="zap" />
            <h3>快速操作</h3>
          </div>
        </div>
        <div class="quick-actions-grid">
          <div class="action-item" @click="handleRecharge">
            <div class="action-icon action-icon-blue">
              <UnifiedIcon name="plus-circle" />
            </div>
            <h4>充值Token</h4>
            <p>购买更多Token配额</p>
          </div>
          <div class="action-item" @click="handleOptimization">
            <div class="action-icon action-icon-green">
              <UnifiedIcon name="settings" />
            </div>
            <h4>使用优化</h4>
            <p>查看优化建议</p>
          </div>
          <div class="action-item" @click="handleAlerts">
            <div class="action-icon action-icon-orange">
              <UnifiedIcon name="bell" />
            </div>
            <h4>用量告警</h4>
            <p>设置使用阈值提醒</p>
          </div>
          <div class="action-item" @click="handleReports">
            <div class="action-icon action-icon-purple">
              <UnifiedIcon name="file-text" />
            </div>
            <h4>详细报告</h4>
            <p>生成详细使用报告</p>
          </div>
        </div>
      </div>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import {
  getUsageOverview,
  getAIModelStats,
  getTokenTrends,
  getUserRanking,
  getCostDistribution,
  refreshUsageData,
  exportUsageReport
} from '@/api/usage-center'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const selectedTimeRange = ref('today')
const rankingType = ref('users')

// 文本生成统计
const textStats = reactive({
  tokens: 0,
  trend: 0,
  usage: 0,
  quota: 100,
  cost: 0
})

// 图片处理统计
const imageStats = reactive({
  tokens: 0,
  trend: 0,
  usage: 0,
  quota: 100,
  cost: 0
})

// 视频分析统计
const videoStats = reactive({
  tokens: 0,
  trend: 0,
  usage: 0,
  quota: 100,
  cost: 0
})

// 成本统计
const costStats = reactive({
  totalCost: 0,
  trend: 0,
  usage: 0,
  quota: 100
})

// 总成本
const totalCost = computed(() => textStats.cost + imageStats.cost + videoStats.cost)

// AI模型列表
const aiModels = ref([])

// 趋势数据
const textTrendData = ref([])
const imageTrendData = ref([])
const videoTrendData = ref([])

// 用户排行数据
const userRanking = ref([])

// 功能排行数据
const featureRanking = ref([])

// 当前排行数据
const currentRanking = computed(() => {
  return rankingType.value === 'users' ? userRanking.value : featureRanking.value
})

// ==================== 数据加载函数 ====================

/**
 * 加载用量概览数据
 */
async function loadOverviewData() {
  try {
    const response = await getUsageOverview({
      timeRange: selectedTimeRange.value as any
    })

    if (response.success && response.data) {
      const data = response.data

      // 更新文本统计
      textStats.tokens = data.textTokens || 0
      textStats.trend = data.trendData?.text?.trend || 0
      textStats.cost = data.trendData?.text?.cost || 0
      textStats.usage = Math.min(100, Math.round((textStats.tokens / 5000000) * 100))

      // 更新图片统计
      imageStats.tokens = data.imageTokens || 0
      imageStats.trend = data.trendData?.image?.trend || 0
      imageStats.cost = data.trendData?.image?.cost || 0
      imageStats.usage = Math.min(100, Math.round((imageStats.tokens / 5000000) * 100))

      // 更新视频统计
      videoStats.tokens = data.videoTokens || 0
      videoStats.trend = data.trendData?.video?.trend || 0
      videoStats.cost = data.trendData?.video?.cost || 0
      videoStats.usage = Math.min(100, Math.round((videoStats.tokens / 5000000) * 100))

      // 更新成本统计
      costStats.totalCost = data.totalCost || 0
      costStats.trend = (data.totalCost || 0) > 0 ? 5.2 : 0
      costStats.usage = Math.min(100, Math.round((costStats.totalCost / 1000) * 100))
    }
  } catch (error: any) {
    console.error('加载用量概览失败:', error)
    ElMessage.error('加载用量概览失败')
  }
}

/**
 * 加载AI模型统计
 */
async function loadAIModelStats() {
  try {
    const response = await getAIModelStats({
      timeRange: selectedTimeRange.value as any,
      status: 'all'
    })

    if (response.success && response.data) {
      aiModels.value = response.data.models || []
    }
  } catch (error: any) {
    console.error('加载AI模型统计失败:', error)
    ElMessage.error('加载AI模型统计失败')
  }
}

/**
 * 加载趋势数据
 */
async function loadTrendData() {
  try {
    const response = await getTokenTrends({
      timeRange: selectedTimeRange.value as any
    })

    if (response.success && response.data) {
      const { trends } = response.data
      textTrendData.value = trends.text || []
      imageTrendData.value = trends.image || []
      videoTrendData.value = trends.video || []
    }
  } catch (error: any) {
    console.error('加载趋势数据失败:', error)
    // 使用默认数据
    textTrendData.value = [30, 45, 35, 50, 65, 55, 70, 80, 75, 85, 90, 95]
    imageTrendData.value = [20, 25, 30, 28, 35, 40, 38, 45, 50, 48, 55, 60]
    videoTrendData.value = [10, 15, 12, 18, 20, 25, 22, 28, 30, 35, 32, 40]
  }
}

/**
 * 加载排行数据
 */
async function loadRankingData() {
  try {
    const response = await getUserRanking({
      type: rankingType.value as 'users' | 'features',
      timeRange: selectedTimeRange.value as any,
      limit: 10
    })

    if (response.success && response.data) {
      if (rankingType.value === 'users') {
        userRanking.value = response.data.items || []
      } else {
        featureRanking.value = response.data.items || []
      }
    }
  } catch (error: any) {
    console.error('加载排行数据失败:', error)
    ElMessage.error('加载排行数据失败')
  }
}

/**
 * 加载成本分布
 */
async function loadCostDistribution() {
  try {
    const response = await getCostDistribution({
      timeRange: selectedTimeRange.value as any
    })

    if (response.success && response.data) {
      const data = response.data
      textStats.cost = data.textCost || 0
      imageStats.cost = data.imageCost || 0
      videoStats.cost = data.videoCost || 0
    }
  } catch (error: any) {
    console.error('加载成本分布失败:', error)
  }
}

/**
 * 加载所有数据
 */
async function loadAllData() {
  loading.value = true
  try {
    await Promise.all([
      loadOverviewData(),
      loadAIModelStats(),
      loadTrendData(),
      loadRankingData(),
      loadCostDistribution()
    ])
  } finally {
    loading.value = false
  }
}

// 格式化函数
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return (tokens / 1000000).toFixed(2) + 'M'
  } else if (tokens >= 1000) {
    return (tokens / 1000).toFixed(1) + 'K'
  }
  return tokens.toString()
}

// 生成SVG路径
function generateLinePath(data: number[]): string {
  const width = 600
  const height = 200
  const step = width / (data.length - 1)
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  let path = `M 0 ${height - ((data[0] - min) / range) * height}`
  for (let i = 1; i < data.length; i++) {
    const x = i * step
    const y = height - ((data[i] - min) / range) * height
    path += ` L ${x} ${y}`
  }
  return path
}

function generateAreaPath(data: number[]): string {
  const linePath = generateLinePath(data)
  return `${linePath} L 600 200 L 0 200 Z`
}

// 导航函数
function navigateToDetail(type: string) {
  ElMessage.info(`查看${type === 'text' ? '文本' : type === 'image' ? '图片' : type === 'video' ? '视频' : '成本'}详细数据`)
  // router.push(`/usage/${type}`)
}

function showModelDetail(model: any) {
  ElMessage.info(`查看 ${model.name} 详细信息`)
}

// 操作函数
async function handleRefresh() {
  loading.value = true
  try {
    const response = await refreshUsageData()
    if (response.success) {
      ElMessage.success('数据刷新成功')
      await loadAllData()
    } else {
      ElMessage.error(response.message || '数据刷新失败')
    }
  } catch (error: any) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

async function handleExport() {
  try {
    loading.value = true
    const response = await exportUsageReport({
      format: 'xlsx',
      timeRange: selectedTimeRange.value as any
    })

    if (response.success && response.data) {
      ElMessage.success('用量报告生成成功')
      // 可选：触发下载
      // window.open(response.data.downloadUrl, '_blank')
    } else {
      ElMessage.error(response.message || '报告生成失败')
    }
  } catch (error: any) {
    console.error('导出报告失败:', error)
    ElMessage.error('报告生成失败')
  } finally {
    loading.value = false
  }
}

async function handleTimeRangeChange() {
  await loadAllData()
}

// 监听排行类型变化
watch(rankingType, () => {
  loadRankingData()
})

function handleRecharge() {
  ElMessage.info('跳转到Token充值页面')
  // router.push('/usage/recharge')
}

function handleOptimization() {
  ElMessage.info('查看使用优化建议')
  // router.push('/usage/optimization')
}

function handleAlerts() {
  ElMessage.info('设置用量告警阈值')
  // router.push('/usage/alerts')
}

function handleReports() {
  ElMessage.info('生成详细使用报告')
  // router.push('/usage/reports')
}

// 生命周期
onMounted(() => {
  // 初始化数据
  loadAllData()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.usage-center-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6xl);
  padding: var(--spacing-2xl);
}

// 统计概览卡片
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-4xl);
}

.stat-card {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-4xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--stat-color);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);

    &::before {
      opacity: 1;
    }
  }

  &.stat-card-primary {
    --stat-color: var(--primary-color);
    .stat-icon {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    }
    .progress-fill {
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
    }
  }

  &.stat-card-purple {
    --stat-color: #8B5CF6;
    .stat-icon {
      background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
    }
    .progress-fill {
      background: linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%);
    }
  }

  &.stat-card-orange {
    --stat-color: #F97316;
    .stat-icon {
      background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
    }
    .progress-fill {
      background: linear-gradient(90deg, #F97316 0%, #FB923C 100%);
    }
  }

  &.stat-card-green {
    --stat-color: #10B981;
    .stat-icon {
      background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
    }
    .progress-fill {
      background: linear-gradient(90deg, #10B981 0%, #34D399 100%);
    }
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-3xl);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bg-white);
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-sm);
    font-weight: 600;
    padding: 4px 8px;
    border-radius: var(--radius-md);
    background: var(--bg-gray-50);

    &.positive {
      color: var(--success-color);
      background: rgba(16, 185, 129, 0.1);
    }

    &:not(.positive) {
      color: var(--danger-color);
      background: rgba(239, 68, 68, 0.1);
    }
  }

  .stat-content {
    margin-bottom: var(--spacing-3xl);

    h3 {
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
      line-height: 1;
    }

    .stat-label {
      font-size: var(--text-sm);
      color: var(--text-hint);
    }
  }

  .stat-progress {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .progress-bar {
      flex: 1;
      height: 8px;
      background: var(--bg-gray-100);
      border-radius: 4px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .progress-text {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-secondary);
      min-width: 60px;
      text-align: right;
    }
  }
}

// 毛玻璃卡片
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-xl);
  padding: var(--spacing-5xl);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

  @media (prefers-color-scheme: dark) {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.section-card {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-5xl);
    flex-wrap: wrap;
    gap: var(--spacing-lg);

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      h3 {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
    }
  }
}

// AI模型网格
.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-4xl);
}

.model-item {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4xl);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .model-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-3xl);

    .model-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bg-white);
      font-size: 20px;
    }

    .model-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-sm);
      font-weight: 500;
      padding: 4px 12px;
      border-radius: var(--radius-full);

      &.active {
        color: var(--success-color);
        background: rgba(16, 185, 129, 0.1);
      }

      &.busy {
        color: var(--warning-color);
        background: rgba(245, 158, 11, 0.1);
      }

      &.inactive {
        color: var(--text-hint);
        background: var(--bg-gray-100);
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }
    }
  }

  .model-info {
    margin-bottom: var(--spacing-4xl);

    h4 {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    p {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0;
    }
  }

  .model-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-3xl);

    .metric {
      .metric-label {
        display: block;
        font-size: var(--text-xs);
        color: var(--text-hint);
        margin-bottom: 4px;
      }

      .metric-value {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

// 图表行
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-5xl);
}

.chart-card {
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4xl);
    flex-wrap: wrap;
    gap: var(--spacing-lg);

    h3 {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .chart-legend {
      display: flex;
      gap: var(--spacing-lg);
      flex-wrap: wrap;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--text-sm);
        color: var(--text-secondary);

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;

          &.legend-blue {
            background: #3B82F6;
          }

          &.legend-purple {
            background: #8B5CF6;
          }

          &.legend-orange {
            background: #F97316;
          }
        }
      }
    }
  }

  .chart-container {
    height: 240px;
    position: relative;
  }
}

.mock-line-chart {
  width: 100%;
  height: 100%;

  .chart-svg {
    width: 100%;
    height: 100%;
  }

  .chart-line {
    stroke-width: 3;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;

    &.chart-line-blue {
      stroke: #3B82F6;
    }

    &.chart-line-purple {
      stroke: #8B5CF6;
    }

    &.chart-line-orange {
      stroke: #F97316;
    }
  }

  .chart-area {
    stroke: none;
  }
}

.cost-distribution {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
  padding: var(--spacing-2xl) 0;

  .cost-item {
    .cost-bar {
      height: 32px;
      background: var(--bg-gray-100);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: var(--spacing-sm);
      position: relative;

      .cost-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        &.cost-fill-blue {
          background: linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%);
        }

        &.cost-fill-purple {
          background: linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%);
        }

        &.cost-fill-orange {
          background: linear-gradient(90deg, #F97316 0%, #FB923C 100%);
        }
      }
    }

    .cost-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .cost-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        font-weight: 500;
      }

      .cost-value {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// 排行榜列表
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.ranking-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: var(--spacing-4xl);
  align-items: center;
  padding: var(--spacing-4xl);
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }

  &.top-three {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    border-color: rgba(59, 130, 246, 0.2);
  }

  .ranking-position {
    .medal {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: var(--bg-white);

      &.medal-1 {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
      }

      &.medal-2 {
        background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
        box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
      }

      &.medal-3 {
        background: linear-gradient(135deg, #CD7F32 0%, #A0522D 100%);
        box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);
      }
    }

    .position-number {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-gray-100);
    }
  }

  .ranking-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-3xl);

    .ranking-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--bg-gray-100);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-hint);
        font-size: 20px;
      }
    }

    .ranking-details {
      h4 {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 2px;
      }

      p {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }

  .ranking-metrics {
    display: flex;
    gap: var(--spacing-4xl);

    .metric-item {
      .metric-label {
        display: block;
        font-size: var(--text-xs);
        color: var(--text-hint);
        margin-bottom: 2px;
      }

      .metric-value {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  .ranking-trend {
    .trend-up,
    .trend-down {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--text-sm);
      font-weight: 600;
      padding: 6px 12px;
      border-radius: var(--radius-full);
    }

    .trend-up {
      color: var(--success-color);
      background: rgba(16, 185, 129, 0.1);
    }

    .trend-down {
      color: var(--danger-color);
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

// 快速操作
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4xl);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-4xl);
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .action-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bg-white);
    font-size: 28px;
    margin-bottom: var(--spacing-3xl);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &.action-icon-blue {
      background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
    }

    &.action-icon-green {
      background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
    }

    &.action-icon-orange {
      background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
    }

    &.action-icon-purple {
      background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
    }
  }

  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .charts-row {
    grid-template-columns: 1fr;
  }

  .ranking-item {
    grid-template-columns: auto 1fr;
    gap: var(--spacing-3xl);

    .ranking-metrics,
    .ranking-trend {
      grid-column: 2;
    }
  }
}

@media (max-width: 768px) {
  .usage-center-container {
    padding: var(--spacing-lg);
    gap: var(--spacing-4xl);
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .model-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .model-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
