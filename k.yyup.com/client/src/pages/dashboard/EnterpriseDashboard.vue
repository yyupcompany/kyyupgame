<template>
  <div class="enterprise-dashboard">
    <!-- 3D加载动画 -->
    <div v-if="loading && isInitialLoad" class="loading-overlay">
      <div class="loading-container">
        <div class="loading-cube">
          <div class="cube-face cube-front"></div>
          <div class="cube-face cube-back"></div>
          <div class="cube-face cube-right"></div>
          <div class="cube-face cube-left"></div>
          <div class="cube-face cube-top"></div>
          <div class="cube-face cube-bottom"></div>
        </div>
        <div class="loading-text">
          <h2>{{ kindergartenName || '企业' }}数据加载中...</h2>
          <p class="loading-progress">{{ loadingText }}</p>
          <div class="loading-centers">
            <div
              v-for="(center, index) in loadingCenters"
              :key="center.id"
              class="loading-center-item"
              :class="{ active: index <= currentLoadingIndex }"
            >
              <UnifiedIcon name="default" />
              <span>{{ center.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 顶部标题栏 -->
    <div class="dashboard-header" v-show="!loading || !isInitialLoad">
      <div class="header-left">
        <h1 class="dashboard-title">
          <UnifiedIcon name="default" />
          {{ kindergartenName }}企业综合仪表盘
        </h1>
        <p class="dashboard-subtitle">实时汇总17个业务中心的关键数据</p>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button :type="timeRange === 'today' ? 'primary' : ''" @click="changeTimeRange('today')">今日</el-button>
          <el-button :type="timeRange === 'week' ? 'primary' : ''" @click="changeTimeRange('week')">本周</el-button>
          <el-button :type="timeRange === 'month' ? 'primary' : ''" @click="changeTimeRange('month')">本月</el-button>
          <el-button :type="timeRange === 'year' ? 'primary' : ''" @click="changeTimeRange('year')">本年</el-button>
        </el-button-group>
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">刷新</el-button>
        <el-button :icon="FullScreen" @click="toggleFullscreen">全屏</el-button>
      </div>
    </div>

    <!-- 核心业务数据区域 -->
    <div class="core-business-section" v-loading="loading">
      <!-- 最重要的3个数据 - 左侧大卡片 -->
      <div class="primary-centers">
        <h2 class="section-title">
          <UnifiedIcon name="default" />
          核心业务指标
        </h2>
        <div class="primary-cards">
          <div
            class="primary-card"
            v-for="center in primaryCenters"
            :key="center.id"
            @click="navigateToCenter(center)"
          >
            <div class="primary-card-header">
              <div class="primary-icon" :style="{ background: center.color }">
                <UnifiedIcon name="default" />
              </div>
              <div class="primary-info">
                <h3>{{ center.name }}</h3>
                <span class="status-badge" :class="center.status">{{ getStatusText(center.status) }}</span>
              </div>
            </div>
            <div class="primary-metrics">
              <div class="metric-item large">
                <span class="metric-label">{{ center.metrics.primary.label }}</span>
                <span class="metric-value">
                  {{ formatNumber(center.metrics.primary.value) }}
                  <span class="metric-unit">{{ center.metrics.primary.unit }}</span>
                </span>
              </div>
              <div class="metric-item">
                <span class="metric-label">{{ center.metrics.secondary.label }}</span>
                <span class="metric-value">
                  {{ formatNumber(center.metrics.secondary.value) }}
                  <span class="metric-unit">{{ center.metrics.secondary.unit }}</span>
                </span>
              </div>
            </div>
            <div class="primary-trend" :class="{ positive: center.metrics.trend > 0, negative: center.metrics.trend < 0 }">
              <UnifiedIcon name="default" />
              <span>{{ center.metrics.trend > 0 ? '+' : '' }}{{ center.metrics.trend }}%</span>
              <span class="trend-label">较上期</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二重要的数据 - 右侧中等卡片 -->
      <div class="secondary-centers">
        <h2 class="section-title">
          <UnifiedIcon name="default" />
          重要业务指标
        </h2>
        <div class="secondary-cards">
          <div
            class="secondary-card"
            v-for="center in secondaryCenters"
            :key="center.id"
            @click="navigateToCenter(center)"
          >
            <div class="secondary-header">
              <div class="secondary-icon" :style="{ background: center.color }">
                <UnifiedIcon name="default" />
              </div>
              <div class="secondary-info">
                <h4>{{ center.name }}</h4>
                <span class="status-badge small" :class="center.status">{{ getStatusText(center.status) }}</span>
              </div>
            </div>
            <div class="secondary-metrics">
              <div class="metric-row">
                <span class="metric-label">{{ center.metrics.primary.label }}</span>
                <span class="metric-value">
                  {{ formatNumber(center.metrics.primary.value) }}{{ center.metrics.primary.unit }}
                </span>
              </div>
              <div class="metric-row">
                <span class="metric-label">{{ center.metrics.secondary.label }}</span>
                <span class="metric-value">
                  {{ formatNumber(center.metrics.secondary.value) }}{{ center.metrics.secondary.unit }}
                </span>
              </div>
            </div>
            <div class="secondary-trend" :class="{ positive: center.metrics.trend > 0, negative: center.metrics.trend < 0 }">
              <UnifiedIcon name="default" />
              {{ center.metrics.trend > 0 ? '+' : '' }}{{ center.metrics.trend }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 其他业务中心 -->
    <div class="other-centers-section">
      <div class="section-header">
        <h2 class="section-title">
          <UnifiedIcon name="default" />
          其他业务中心
        </h2>
        <div class="section-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索中心..."
            :prefix-icon="Search"
            clearable
            style="200: 665var(--border-width-base)"
          />
        </div>
      </div>

      <div class="other-centers-grid" v-loading="loading">
        <div
          class="other-card"
          v-for="center in filteredOtherCenters"
          :key="center.id"
          :class="{ 'status-warning': center.status === 'warning' }"
          @click="navigateToCenter(center)"
        >
          <div class="other-header">
            <div class="other-icon" :style="{ background: center.color }">
              <UnifiedIcon name="default" />
            </div>
            <div class="other-info">
              <h3 class="center-name">{{ center.name }}</h3>
              <el-tag :type="center.status === 'warning' ? 'warning' : 'success'" size="small">
                {{ center.status === 'warning' ? '需关注' : '正常' }}
              </el-tag>
            </div>
          </div>

          <div class="center-metrics">
            <div class="metric-item primary">
              <div class="metric-label">{{ center.metrics.primary.label }}</div>
              <div class="metric-value">
                {{ formatNumber(center.metrics.primary.value) }}
                <span class="metric-unit">{{ center.metrics.primary.unit }}</span>
              </div>
            </div>
            <div class="metric-item secondary">
              <div class="metric-label">{{ center.metrics.secondary.label }}</div>
              <div class="metric-value">
                {{ formatNumber(center.metrics.secondary.value) }}
                <span class="metric-unit">{{ center.metrics.secondary.unit }}</span>
              </div>
            </div>
          </div>

          <div class="center-footer">
            <div class="trend-indicator" :class="{ positive: center.metrics.trend > 0, negative: center.metrics.trend < 0 }">
              <UnifiedIcon name="default" />
              <span>{{ center.metrics.trend > 0 ? '+' : '' }}{{ center.metrics.trend }}%</span>
            </div>
            <el-button type="primary" link :icon="ArrowRight">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部元数据 -->
    <div class="dashboard-footer">
      <div class="footer-info">
        <UnifiedIcon name="default" />
        最后更新: {{ lastUpdated }}
      </div>
      <div class="footer-info">
        <UnifiedIcon name="default" />
        响应时间: {{ responseTime }}ms
      </div>
      <div class="footer-info">
        <UnifiedIcon name="default" />
        数据中心: {{ totalCenters }}个
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataAnalysis, Refresh, FullScreen, Grid, Search, TrendCharts,
  ArrowRight, Clock, Timer, DataBoard, User, Calendar, School,
  Money, Setting, Phone, DocumentChecked, List, Reading,
  ChatDotRound, Picture, Clock as ClockIcon, OfficeBuilding,
  DataAnalysis as DataIcon, Promotion, Briefcase, UserFilled, Star
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

// 状态
const loading = ref(false)
const isInitialLoad = ref(true)
const timeRange = ref('month')
const searchKeyword = ref('')
const lastUpdated = ref('')
const responseTime = ref(0)
const totalCenters = ref(0)
const kindergartenName = ref('')
const loadingText = ref('正在初始化数据...')
const currentLoadingIndex = ref(-1)

// 加载中心列表（用于动画）
const loadingCenters = ref([
  { id: 'personnel', name: '人员中心', icon: User },
  { id: 'activity', name: '活动中心', icon: Calendar },
  { id: 'marketing', name: '营销中心', icon: Promotion },
  { id: 'business', name: '业务中心', icon: Briefcase },
  { id: 'customer', name: '客户池中心', icon: UserFilled },
  { id: 'system', name: '系统中心', icon: Setting },
  { id: 'finance', name: '财务中心', icon: Money },
  { id: 'enrollment', name: '招生中心', icon: School },
  { id: 'inspection', name: '督查中心', icon: DocumentChecked },
  { id: 'task', name: '任务中心', icon: List },
  { id: 'teaching', name: '教学中心', icon: Reading },
  { id: 'script', name: '话术中心', icon: ChatDotRound },
  { id: 'media', name: '新媒体中心', icon: Picture },
  { id: 'attendance', name: '考勤中心', icon: ClockIcon },
  { id: 'group', name: '集团管理', icon: OfficeBuilding },
  { id: 'usage', name: '用量中心', icon: DataIcon },
  { id: 'call', name: '呼叫中心', icon: Phone }
])

// 全局KPI数据
const globalKPIs = ref([
  { key: 'students', label: '学生总数', value: 0, unit: '人', trend: 0, icon: User, color: 'linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%)' },
  { key: 'teachers', label: '教师总数', value: 0, unit: '人', trend: 0, icon: User, color: 'var(--gradient-pink)' },
  { key: 'activities', label: '活动总数', value: 0, unit: '场', trend: 0, icon: Calendar, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { key: 'revenue', label: '本月收入', value: 0, unit: '元', trend: 0, icon: Money, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { key: 'health', label: '系统健康', value: 0, unit: '%', trend: 0, icon: Setting, color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { key: 'growth', label: '综合增长', value: 0, unit: '%', trend: 0, icon: TrendCharts, color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
])

// 业务中心数据
const centers = ref<any[]>([])

// 最重要的3个中心（客户池、活动、招生转换）
const primaryCenters = computed(() => {
  const primaryIds = ['customer-pool', 'activity', 'enrollment']
  return centers.value.filter(center => primaryIds.includes(center.id))
})

// 第二重要的中心（教学达标率、考勤等）
const secondaryCenters = computed(() => {
  const secondaryIds = ['teaching', 'attendance', 'finance', 'task', 'inspection']
  return centers.value.filter(center => secondaryIds.includes(center.id))
})

// 其他中心
const otherCenters = computed(() => {
  const primaryIds = ['customer-pool', 'activity', 'enrollment']
  const secondaryIds = ['teaching', 'attendance', 'finance', 'task', 'inspection']
  const excludeIds = [...primaryIds, ...secondaryIds]
  return centers.value.filter(center => !excludeIds.includes(center.id))
})

// 过滤后的其他中心
const filteredOtherCenters = computed(() => {
  if (!searchKeyword.value) return otherCenters.value
  return otherCenters.value.filter(center =>
    center.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 获取幼儿园基本信息
const fetchKindergartenInfo = async () => {
  try {
    const response = await request.get('/kindergarten/basic-info')
    if (response.success && response.data) {
      kindergartenName.value = response.data.name || ''
    }
  } catch (error) {
    console.error('获取幼儿园信息失败:', error)
  }
}

// 模拟加载动画
const simulateLoading = async () => {
  loadingText.value = '正在连接数据中心...'
  await new Promise(resolve => setTimeout(resolve, 500))

  // 逐个加载中心
  for (let i = 0; i < loadingCenters.value.length; i++) {
    currentLoadingIndex.value = i
    loadingText.value = `正在加载 ${loadingCenters.value[i].name}...`
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  loadingText.value = '数据加载完成！'
  await new Promise(resolve => setTimeout(resolve, 300))
}

// 获取数据
const fetchData = async () => {
  loading.value = true

  // 首次加载时显示动画
  if (isInitialLoad.value) {
    await Promise.all([
      fetchKindergartenInfo(),
      simulateLoading()
    ])
  }

  try {
    const response = await request.get('/enterprise-dashboard/overview', {
      params: { timeRange: timeRange.value }
    })

    if (response.success && response.data) {
      // 更新全局KPI
      const kpis = response.data.globalKPIs
      globalKPIs.value[0].value = kpis.totalStudents
      globalKPIs.value[1].value = kpis.totalTeachers
      globalKPIs.value[2].value = kpis.totalActivities
      globalKPIs.value[3].value = kpis.totalRevenue
      globalKPIs.value[4].value = kpis.systemHealth
      globalKPIs.value[5].value = kpis.overallGrowth

      // 更新中心数据
      centers.value = response.data.centers

      // 更新元数据
      lastUpdated.value = new Date(response.data.meta.lastUpdated).toLocaleString('zh-CN')
      responseTime.value = response.data.meta.responseTime
      totalCenters.value = response.data.meta.totalCenters

      if (!isInitialLoad.value) {
        ElMessage.success('数据刷新成功')
      }
    }
  } catch (error: any) {
    console.error('获取企业仪表盘数据失败:', error)
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
    isInitialLoad.value = false
  }
}

// 切换时间范围
const changeTimeRange = (range: string) => {
  timeRange.value = range
  fetchData()
}

// 刷新数据
const refreshData = () => {
  fetchData()
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 导航到中心
const navigateToCenter = (center: any) => {
  router.push(center.path)
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString('zh-CN')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'normal': '正常',
    'warning': '需关注',
    'error': '异常'
  }
  return statusMap[status] || '正常'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
.enterprise-dashboard {
  width: calc(100% + 40px); /* 抵消父容器的padding */
  height: calc(100vh - 65px); /* 减去导航栏高度 */
  background: linear-gradient(180deg, #0a1929 0%, #1e3a5f 100%);
  padding: var(--text-2xl);
  margin: -var(--text-lg) -var(--text-2xl); /* 抵消page-content的默认padding */
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  position: relative;

  // 背景装饰效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: var(--position-none);
  }

  // 确保内容在背景之上
  > * {
    position: relative;
    z-index: var(--z-index-dropdown);
  }
}

// 3D加载动画
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.5s ease-in-out;
}

.loading-container {
  text-align: center;
  color: white;
}

.loading-cube {
  // malformed CSS removed
  // malformed CSS removed
  margin: 0 auto 40px;
  position: relative;
  transform-style: preserve-3d;
  animation: rotateCube 3s infinite linear;
}

.cube-face {
  position: absolute;
  // malformed CSS removed
  // malformed CSS removed
  background: var(--white-alpha-10);
  border: 2px solid var(--glass-bg-heavy);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 var(--text-2xl) var(--glass-bg-heavy);
}

.cube-front  { transform: rotateY(0deg) translateZ(50px); }
.cube-back   { transform: rotateY(180deg) translateZ(50px); }
.cube-right  { transform: rotateY(90deg) translateZ(50px); }
.cube-left   { transform: rotateY(-90deg) translateZ(50px); }
.cube-top    { transform: rotateX(90deg) translateZ(50px); }
.cube-bottom { transform: rotateX(-90deg) translateZ(50px); }

@keyframes rotateCube {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
  }
  100% {
    transform: rotateX(360deg) rotateY(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-text {
  h2 {
    font-size: var(--spacing-3xl);
    font-weight: 600;
    margin: 0 0 var(--text-lg) 0;
    text-shadow: 0 2px 10px var(--shadow-heavy);
  }

  .loading-progress {
    font-size: var(--text-xl);
    margin: 0 0 30px 0;
    opacity: 0.9;
  }
}

.loading-centers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--text-sm);
  // malformed CSS removed
  margin: 0 auto;
}

.loading-center-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm);
  background: var(--white-alpha-5);
  border-radius: var(--spacing-sm);
  opacity: 0.3;
  transform: scale(0.9);
  transition: all 0.3s ease;

  &.active {
    opacity: 1;
    transform: scale(1);
    background: var(--white-alpha-15);
    box-shadow: 0 var(--spacing-xs) 15px var(--glass-bg-heavy);
    animation: pulse 0.5s ease-in-out;
  }

  .el-icon {
    font-size: var(--text-3xl);
  }

  span {
    font-size: var(--text-sm);
    white-space: nowrap;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

// 顶部标题栏 - 数据大屏风格
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: center;
  // malformed CSS removed
  margin-bottom: var(--text-3xl);
  position: relative;
  width: 100%;

  // 左侧装饰线
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 35%;
  // malformed CSS removed
    background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 50%, rgba(59, 130, 246, 0.3) 100%);
  }

  // 右侧装饰线
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 35%;
  // malformed CSS removed
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%);
  }

  .header-left {
    position: absolute;
    left: var(--text-2xl);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: var(--text-sm);

    .dashboard-title {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      font-size: var(--text-4xl);
      font-weight: bold;
      color: var(--bg-white);
      text-shadow: 0 0 var(--text-2xl) rgba(59, 130, 246, 0.8);
      margin: 0;
      letter-spacing: var(--spacing-xs);

      .title-icon {
        font-size: var(--text-5xl);
        color: var(--status-info);
        filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.6));
      }
    }

    .dashboard-subtitle {
      display: none; // 大屏模式隐藏副标题
    }
  }

  .header-right {
    position: absolute;
    right: var(--text-2xl);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: var(--text-sm);
    font-size: var(--text-xl);
    color: var(--status-info);
    font-family: 'Courier New', monospace;
  }
}

// 核心业务数据区域 - 数据大屏风格
.core-business-section {
  display: grid;
  grid-template-columns: minmax(360px, 480px) 1fr; // 左侧自适应最大480px，右侧自适应
  gap: var(--text-2xl);
  margin-bottom: var(--text-2xl);
  width: 100%;

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--status-info);
    margin: 0 0 var(--text-2xl) 0;
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);

    .el-icon {
      filter: drop-shadow(0 0 var(--spacing-sm) rgba(96, 165, 250, 0.6));
    }
  }

  // 最重要的3个中心 - 左侧大卡片（数据大屏风格）
  .primary-centers {
    .primary-cards {
      display: flex;
      flex-direction: column;
      gap: var(--text-2xl);

      .primary-card {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(10px);
        border-radius: var(--text-sm);
        padding: var(--text-3xl);
        box-shadow:
          0 0 var(--text-2xl) var(--accent-enrollment-medium),
          inset 0 0 var(--text-2xl) rgba(59, 130, 246, 0.05);
        transition: all 0.3s;
        cursor: pointer;
        border: var(--border-width-base) solid var(--accent-enrollment-heavy);

        &:hover {
          transform: translateY(-var(--spacing-xs));
          box-shadow:
            0 0 30px var(--accent-enrollment-heavy),
            inset 0 0 30px var(--accent-enrollment-light);
          border-color: rgba(59, 130, 246, 0.6);
        }

        .primary-card-header {
          display: flex;
          gap: var(--text-lg);
          margin-bottom: var(--text-2xl);

          .primary-icon {
  // malformed CSS removed
  // malformed CSS removed
            border-radius: var(--text-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            box-shadow:
              0 0 var(--text-2xl) var(--accent-enrollment-heavy),
              inset 0 0 var(--text-2xl) var(--accent-enrollment-medium);
            border: var(--border-width-base) solid var(--accent-enrollment-heavy);

            .el-icon {
              font-size: var(--text-5xl);
              filter: drop-shadow(0 0 10px var(--white-alpha-50));
            }
          }

          .primary-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;

            h3 {
              font-size: var(--text-3xl);
              font-weight: 700;
              color: var(--bg-white);
              margin: 0 0 var(--spacing-sm) 0;
              text-shadow: 0 0 10px var(--white-alpha-30);
            }

            .status-badge {
              display: inline-block;
              padding: var(--spacing-xs) var(--text-sm);
              border-radius: var(--spacing-sm);
              font-size: var(--text-sm);
              font-weight: 600;
              width: fit-content;
              border: var(--border-width-base) solid;

              &.normal {
                background: rgba(34, 197, 94, 0.1);
                color: var(--success-color);
                border-color: rgba(34, 197, 94, 0.3);
                box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
              }

              &.warning {
                background: rgba(251, 146, 60, 0.1);
                color: #fb923c;
                border-color: rgba(251, 146, 60, 0.3);
                box-shadow: 0 0 10px rgba(251, 146, 60, 0.2);
              }
            }
          }
        }

        .primary-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--text-lg);
          margin-bottom: var(--text-lg);

          .metric-item {
            padding: var(--text-lg);
  // malformed CSS removed
            background: rgba(30, 58, 95, 0.4);
            border: var(--border-width-base) solid var(--accent-enrollment-medium);

            &.large {
              grid-column: 1 / -1;
              background: rgba(59, 130, 246, 0.1);
              border-color: rgba(59, 130, 246, 0.3);
            }

            .metric-label {
              font-size: var(--text-sm);
              color: var(--text-muted);
              margin-bottom: var(--spacing-sm);
              font-weight: 500;
            }

            .metric-value {
              font-size: var(--spacing-3xl);
              font-weight: 700;
              color: var(--status-info);
              text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
              font-family: 'Courier New', monospace;

              .metric-unit {
                font-size: var(--text-lg);
                font-weight: normal;
                color: var(--text-muted);
                margin-left: var(--spacing-xs);
              }
            }
          }
        }

        .primary-trend {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--text-sm) var(--text-lg);
          border-radius: var(--spacing-sm);
          background: rgba(30, 58, 95, 0.4);
          border: var(--border-width-base) solid var(--accent-enrollment-medium);
          font-size: var(--text-lg);
          font-weight: 600;

          &.positive {
            color: var(--success-color);
            background: rgba(34, 197, 94, 0.1);
            border-color: rgba(34, 197, 94, 0.3);
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
          }

          &.negative {
            color: var(--danger-color);
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
          }

          .trend-label {
            font-size: var(--text-sm);
            font-weight: normal;
            color: var(--text-muted);
            margin-left: auto;
          }
        }
      }
    }
  }

  // 第二重要的中心 - 右侧中等卡片（数据大屏风格）
  .secondary-centers {
    .secondary-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr); // 右侧2列布局
      gap: var(--text-lg);

      .secondary-card {
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(var(--spacing-sm));
  // malformed CSS removed
        padding: var(--text-xl);
        box-shadow:
          0 0 15px var(--accent-enrollment-light),
          inset 0 0 15px rgba(59, 130, 246, 0.03);
        transition: all 0.3s;
        cursor: pointer;
        border: var(--border-width-base) solid var(--accent-enrollment-medium);

        &:hover {
          transform: translateY(-3px);
          box-shadow:
            0 0 25px var(--accent-enrollment-heavy),
            inset 0 0 25px rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .secondary-header {
          display: flex;
          gap: var(--text-sm);
          margin-bottom: var(--text-base);

          .secondary-icon {
  // malformed CSS removed
  // malformed CSS removed
  // malformed CSS removed
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            box-shadow:
              0 0 15px var(--accent-enrollment-heavy),
              inset 0 0 15px var(--accent-enrollment-light);
            border: var(--border-width-base) solid var(--accent-enrollment-medium);
          }

          .secondary-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;

            h4 {
              font-size: var(--text-lg);
              font-weight: 600;
              color: #e2e8f0;
              margin: 0 0 6px 0;
            }

            .status-badge.small {
              display: inline-block;
  // malformed CSS removed
  // malformed CSS removed
              font-size: var(--text-xs);
              font-weight: 600;
              width: fit-content;
              border: var(--border-width-base) solid;

              &.normal {
                background: rgba(34, 197, 94, 0.08);
                color: var(--success-color);
                border-color: rgba(34, 197, 94, 0.25);
              }

              &.warning {
                background: rgba(251, 146, 60, 0.08);
                color: #fb923c;
                border-color: rgba(251, 146, 60, 0.25);
              }
            }
          }
        }

        .secondary-metrics {
          display: flex;
          flex-direction: column;
  // malformed CSS removed
          margin-bottom: var(--text-sm);

          .metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
  // malformed CSS removed
  // malformed CSS removed
            background: rgba(30, 58, 95, 0.3);
            border: var(--border-width-base) solid var(--accent-enrollment-light);

            .metric-label {
              font-size: var(--text-sm);
              color: var(--text-muted);
              font-weight: 500;
            }

            .metric-value {
              font-size: var(--text-xl);
              font-weight: 700;
              color: var(--status-info);
              font-family: 'Courier New', monospace;
            }
          }
        }

        .secondary-trend {
          display: flex;
          align-items: center;
  // malformed CSS removed
          padding: var(--spacing-sm) var(--text-sm);
  // malformed CSS removed
          background: rgba(30, 58, 95, 0.3);
          border: var(--border-width-base) solid var(--accent-enrollment-light);
          font-size: var(--text-sm);
          font-weight: 600;

          &.positive {
            color: var(--success-color);
            background: rgba(34, 197, 94, 0.08);
            border-color: rgba(34, 197, 94, 0.25);
          }

          &.negative {
            color: var(--danger-color);
            background: rgba(239, 68, 68, 0.08);
            border-color: rgba(239, 68, 68, 0.25);
          }
        }
      }
    }
  }
}

// 其他业务中心（数据大屏风格）
.other-centers-section {
  width: 100%;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--status-info);
      margin: 0;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);

      .el-icon {
        filter: drop-shadow(0 0 var(--spacing-sm) rgba(96, 165, 250, 0.6));
      }
    }
  }

  .other-centers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); // 自适应列数
    gap: var(--text-base);

    .other-card {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(6px);
      border-radius: var(--spacing-sm);
      padding: var(--text-base);
      box-shadow:
        0 0 var(--text-sm) rgba(59, 130, 246, 0.12),
        inset 0 0 var(--text-sm) rgba(59, 130, 246, 0.02);
      transition: all 0.3s;
      cursor: pointer;
      border: var(--border-width-base) solid var(--accent-enrollment-medium);

      &:hover {
        transform: translateY(var(--transform-hover-lift));
        box-shadow:
          0 0 var(--text-2xl) var(--accent-enrollment-medium),
          inset 0 0 var(--text-2xl) rgba(59, 130, 246, 0.05);
        border-color: rgba(59, 130, 246, 0.4);
      }

      &.status-warning {
        border-color: rgba(251, 146, 60, 0.3);
      }

      .other-header {
        display: flex;
  // malformed CSS removed
        margin-bottom: var(--text-sm);

        .other-icon {
  // malformed CSS removed
  // malformed CSS removed
          border-radius: var(--spacing-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow:
            0 0 var(--text-sm) var(--accent-enrollment-medium),
            inset 0 0 var(--text-sm) var(--accent-enrollment-light);
          border: var(--border-width-base) solid var(--accent-enrollment-medium);
        }

        .other-info {
          flex: 1;

          .center-name {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--text-secondary-dark);
            margin: 0 0 var(--spacing-xs) 0;
          }
        }
      }

      .center-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-sm);
  // malformed CSS removed

        .metric-item {
          padding: var(--spacing-sm);
  // malformed CSS removed
          background: rgba(30, 58, 95, 0.25);
          border: var(--border-width-base) solid rgba(59, 130, 246, 0.12);

          &.primary {
            background: rgba(59, 130, 246, 0.08);
            border-color: rgba(59, 130, 246, 0.2);
          }

          .metric-label {
            font-size: var(--text-xs);
            color: var(--text-muted);
  // malformed CSS removed
          }

          .metric-value {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--status-info);
            font-family: 'Courier New', monospace;

            .metric-unit {
              font-size: var(--text-xs);
              font-weight: normal;
              color: var(--text-muted);
  // malformed CSS removed
            }
          }
        }
      }

      .center-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--spacing-sm);
        border-1: 34183px solid rgba(59, 130, 246, 0.1);

        .trend-indicator {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          font-weight: 500;

          &.positive {
            color: var(--success-color);
          }

          &.negative {
            color: var(--danger-color);
          }
        }
      }
    }
  }
}

// 底部元数据（数据大屏风格）
.dashboard-footer {
  display: flex;
  justify-content: center;
  // malformed CSS removed
  margin-top: var(--text-2xl);
  padding: var(--text-lg);
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(var(--spacing-sm));
  border-radius: var(--spacing-sm);
  box-shadow:
    0 0 15px var(--accent-enrollment-light),
    inset 0 0 15px rgba(59, 130, 246, 0.03);
  border: var(--border-width-base) solid var(--accent-enrollment-medium);
  width: 100%;

  .footer-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-muted);
    font-size: var(--text-base);
    font-family: 'Courier New', monospace;

    .el-icon {
      color: var(--status-info);
      filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.4));
    }
  }
}
</style>

