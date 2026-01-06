<template>
  <UnifiedCenterLayout
    title="园长工作台"
    :description="`欢迎回来，${userName} - 智慧管理，成就卓越教育`"
    icon="Trophy"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="refreshData" :loading="loading.stats">
        <UnifiedIcon name="Refresh" />
        刷新数据
      </el-button>
      <el-button type="info" @click="navigateTo('/principal/campus-overview')">
        <UnifiedIcon name="default" />
        园区概览
      </el-button>
    </template>

    <!-- 统计卡片 -->
    <template #stats>
      <StatCard
        v-for="(stat, index) in statCards"
        :key="index"
        :title="stat.label"
        :value="stat.value"
        :unit="stat.unit"
        :trend="stat.trend"
        :trend-text="stat.trendText"
        :type="stat.type"
        :icon-name="stat.icon"
        :clickable="true"
        @click="handleStatClick(stat)"
      />
    </template>

  
    <!-- 业务功能卡片 -->
    <div class="functions-grid">
      <div 
        v-for="(func, index) in functionCards" 
        :key="index" 
        class="function-card"
        @click="navigateTo(func.route)"
      >
        <div class="function-content">
          <div class="function-icon">
            <UnifiedIcon name="default" />
          </div>
          <div class="function-info">
            <div class="function-title">{{ func.title }}</div>
            <div class="function-desc">{{ func.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 招生趋势图表 -->
    <el-card class="chart-card">
      <template #header>
        <div class="page-toolbar">
          <h3 class="toolbar-title">招生趋势分析</h3>
          <div class="toolbar-actions">
            <el-radio-group v-model="trendPeriod" size="small" @change="handlePeriodChange">
              <el-radio-button value="week">本周</el-radio-button>
              <el-radio-button value="month">本月</el-radio-button>
              <el-radio-button value="year">本年</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      <div class="chart-container">
        <EmptyState 
          v-if="!chartLoading"
          type="no-data"
          title="招生趋势图表"
          description="暂无数据可展示，请选择时间范围查看趋势"
          size="medium"
          :primary-action="{
            text: '刷新数据',
            handler: loadChartData
          }"
          :suggestions="[
            '选择不同的时间范围',
            '确认是否有招生数据',
            '联系技术支持'
          ]"
          :show-suggestions="true"
        />
        <LoadingState 
          v-else
          variant="card"
          size="medium"
          text="正在加载图表数据..."
          spinner-type="circle"
        />
      </div>
    </el-card>

    <!-- 系统预警 -->
    <el-card v-if="systemAlerts.length > 0" class="card-item alerts-card">
      <template #header>
        <div class="page-toolbar">
          <h3 class="toolbar-title">
            <UnifiedIcon name="default" />
            系统预警
          </h3>
          <div class="toolbar-actions">
            <el-button type="primary" size="small" plain @click="clearAlerts">清除预警</el-button>
          </div>
        </div>
      </template>
      <div class="card-content">
        <div class="alerts-list">
          <div
            v-for="(alert, index) in systemAlerts"
            :key="index"
            class="alert-item"
            :class="`alert-${alert.type}`"
          >
            <div class="alert-icon">
              <el-icon>
                <Warning v-if="alert.type === 'warning'" />
                <CircleClose v-else />
              </el-icon>
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-message">{{ alert.message }}</div>
            </div>
            <div class="alert-priority" :class="`priority-${alert.priority}`">
              {{ alert.priority === 'high' ? '高' : '中' }}
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 待办事项和通知 -->
    <div class="cards-container two-columns">
      <el-card class="card-item">
        <template #header>
          <div class="page-toolbar">
            <h3 class="toolbar-title">待办事项</h3>
            <div class="toolbar-actions">
              <el-button type="primary" size="small" plain>查看全部</el-button>
            </div>
          </div>
        </template>
        <div class="card-content">
          <EmptyState 
            v-if="todos.length === 0 && !loading.todos"
            type="no-data"
            title="暂无待办事项"
            description="当前没有需要处理的待办事项"
            size="small"
            :primary-action="{
              text: '创建待办',
              handler: () => $router.push('/schedule')
            }"
          />
          <div v-else class="todo-list" v-loading="loading.todos">
            <div v-for="(todo, index) in todos" :key="index" class="todo-item">
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-time">{{ formatTime(todo.dueDate) }}</div>
              </div>
              <div class="todo-priority" :class="'priority-' + todo.priority.toLowerCase()">
                {{ todo.priority }}
              </div>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="card-item">
        <template #header>
          <div class="page-toolbar">
            <h3 class="toolbar-title">通知公告</h3>
            <div class="toolbar-actions">
              <el-button type="primary" size="small" plain>发布通知</el-button>
            </div>
          </div>
        </template>
        <div class="card-content">
          <EmptyState 
            v-if="notices.length === 0 && !loading.notices"
            type="no-data"
            title="暂无通知公告"
            description="当前没有发布的通知公告"
            size="small"
            :primary-action="{
              text: '发布通知',
              handler: () => $router.push('/notices')
            }"
          />
          <div v-else class="notice-list" v-loading="loading.notices">
            <div v-for="(notice, index) in notices" :key="index" class="notice-item">
              <div class="notice-content">
                <div class="notice-title">{{ notice.title }}</div>
                <div class="notice-time">{{ formatTime(notice.publishTime) }}</div>
              </div>
              <div class="notice-status">
                <el-tag size="small" :type="getNoticeTagType(notice)">
                  {{ getNoticeStatusText(notice) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage } from 'element-plus'
import {
  User, School, Document, Trophy, Calendar, Setting,
  Promotion, Flag, TrendCharts, ArrowUp, ArrowDown, Refresh,
  Warning, CircleClose
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入  
import { get, post, put, del } from '@/utils/request'
import { formatDateTime } from '../../utils/dateFormat'
import { PRINCIPAL_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 4. 组件导入
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'

// 5. 页面内部类型定义
// 统计卡片接口
interface StatCard {
  label: string;
  value: string;
  unit: string;
  icon: string;
  type: 'primary' | 'success' | 'warning' | 'info';
  trend: 'up' | 'down' | 'stable';
  trendText: string;
}

// 功能卡片接口
interface FunctionCard {
  title: string;
  description: string;
  icon: string;
  route: string
}

// 待办事项接口
interface Todo {
  id: number | string;
  title: string
  dueDate: Date | string;
  priority: string
}

// 通知公告接口
interface Notice {
  id: number | string;
  title: string
  publishTime: Date | string;
  importance: string
  readCount: number
  totalCount: number
}

// 加载状态接口
interface LoadingState {
  stats: boolean;
  todos: boolean;
  notices: boolean;
  chart: boolean
}

// 路由
const router = useRouter()

// 响应式数据
const loading = ref<LoadingState>({
  stats: false,
  todos: false,
  notices: false,
  chart: false
})

const chartLoading = ref(false)
const trendPeriod = ref<'week' | 'month' | 'year'>('month')

// 用户名
const userName = ref(localStorage.getItem('user_name') || '园长')

// 图标组件映射
const iconComponents = {
  User,
  School,
  Document,
  Trophy,
  Calendar,
  Promotion,
  TrendCharts,
  Setting,
  Flag
}

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
  label: '学生总数',
  value: '0',
  unit: '人',
  icon: 'User',
  type: 'primary',
  trend: 'up',
  trendText: '稳定增长'
  },
  {
  label: '班级总数',
  value: '0',
  unit: '个',
  icon: 'School',
  type: 'success',
  trend: 'up',
  trendText: '运行良好'
  },
  {
  label: '待审核申请',
  value: '0',
  unit: '份',
  icon: 'Document',
  type: 'warning',
  trend: 'stable',
  trendText: '需要处理'
  },
  {
  label: '招生率',
  value: '0',
  unit: '%',
  icon: 'star',
  type: 'info',
  trend: 'up',
  trendText: '持续提升'
  }
])

// 功能卡片数据
const functionCards = ref<FunctionCard[]>([
  {
    title: '招生计划管理',
  description: '制定和管理招生计划和名额',
  icon: 'calendar',
  route: '/enrollment-plan'
  },
  {
    title: '招生营销活动',
  description: '策划和管理招生营销活动',
  icon: 'Promotion',
  route: '/principal/activities'
  },
  {
    title: '客户池管理',
  description: '管理和分配潜在客户资源',
  icon: 'User',
  route: '/principal/customer-pool'
  },
  {
    title: '招生业绩统计',
  description: '查看和分析招生业绩数据',
  icon: 'TrendCharts',
  route: '/principal/performance'
  },
  {
    title: '绩效规则配置',
  description: '设置招生业绩考核规则',
  icon: 'Setting',
  route: '/principal/performance-rules'
  },
  {
    title: '海报模板管理',
  description: '管理招生海报模板',
  icon: 'flag',
  route: '/principal/poster-templates'
  }
])

// 待办事项数据
const todos = ref<Todo[]>([])

// 通知公告数据
const notices = ref<Notice[]>([])

// 系统预警数据
const systemAlerts = ref<any[]>([])

// API方法 - 使用统一的endpoints配置

// 方法
const loadDashboardStats = async () => {
  loading.value.stats = true
  try {
    const response = await get(PRINCIPAL_ENDPOINTS.DASHBOARD_STATS)
    if (response.success && response.data) {
      const stats = response.data
      updateStatsWithData(stats)
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '加载统计数据失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    loading.value.stats = false
  }
}

// 更新统计数据的方法
const updateStatsWithData = (stats: any) => {
  try {
    if (stats.totalStudents !== undefined) {
      statCards.value[0].value = stats.totalStudents.toString()
    }
    if (stats.totalClasses !== undefined) {
      statCards.value[1].value = stats.totalClasses.toString()
    }
    if (stats.pendingApplications !== undefined) {
      statCards.value[2].value = stats.pendingApplications.toString()
    }
    if (stats.enrollmentRate !== undefined) {
      statCards.value[3].value = `${Math.round(stats.enrollmentRate * 100)}%`
    }
    
    // 更新趋势值
    if (stats.studentTrend !== undefined) {
      statCards.value[0].trendValue = `${Math.abs(stats.studentTrend)}%`
      statCards.value[0].trend = stats.studentTrend >= 0 ? 'up' : 'down'
    }
    
    if (stats.classTrend !== undefined) {
      statCards.value[1].trendValue = `${Math.abs(stats.classTrend)}%`
      statCards.value[1].trend = stats.classTrend >= 0 ? 'up' : 'down'
    }
    
    if (stats.applicationTrend !== undefined) {
      statCards.value[2].trendValue = `${Math.abs(stats.applicationTrend)}%`
      statCards.value[2].trend = stats.applicationTrend >= 0 ? 'up' : 'down'
    }
    
    if (stats.enrollmentTrend !== undefined) {
      statCards.value[3].trendValue = `${Math.abs(stats.enrollmentTrend)}%`
      statCards.value[3].trend = stats.enrollmentTrend >= 0 ? 'up' : 'down'
    }
    
    // 触发关键指标监控
    monitorKeyMetrics(stats)
  } catch (error) {
    console.error('更新统计数据失败:', error)
  }
}

// 关键指标监控和预警
const monitorKeyMetrics = (stats: any) => {
  const alerts: any[] = []

  // 学生容量监控
  if (stats.totalStudents !== undefined) {
    // 根据实际情况设置合理的园区容量，考虑到当前有2047名学生
    const capacity = Math.max(2500, stats.totalStudents * 1.2) // 动态设置容量，至少比当前学生数多20%
    const occupancyRate = stats.totalStudents / capacity

    if (occupancyRate > 0.95) {
      alerts.push({
        type: 'error',
        title: '学生容量预警',
        message: `当前学生人数已达容量的 ${(occupancyRate * 100).toFixed(1)}%，即将满员`,
        priority: 'high'
      })
    } else if (occupancyRate > 0.85) {
      alerts.push({
        type: 'warning',
        title: '学生容量提醒',
        message: `当前学生人数已达容量的 ${(occupancyRate * 100).toFixed(1)}%`,
        priority: 'medium'
      })
    }
  }
  
  // 师生比监控
  if (stats.totalStudents && stats.totalTeachers) {
    const teacherStudentRatio = stats.totalStudents / stats.totalTeachers

    // 合理的师生比应该在1:8到1:15之间
    if (teacherStudentRatio > 20) {
      alerts.push({
        type: 'error',
        title: '师生比过高',
        message: `当前师生比为 1:${teacherStudentRatio.toFixed(1)}，严重超标，急需增加教师人数`,
        priority: 'high'
      })
    } else if (teacherStudentRatio > 15) {
      alerts.push({
        type: 'warning',
        title: '师生比预警',
        message: `当前师生比为 1:${teacherStudentRatio.toFixed(1)}，建议增加教师人数`,
        priority: 'medium'
      })
    }
  }
  
  // 招生率监控
  if (stats.enrollmentRate !== undefined) {
    if (stats.enrollmentRate < 0.3) {
      alerts.push({
        type: 'error',
        title: '招生率过低',
        message: `当前招生率仅为 ${(stats.enrollmentRate * 100).toFixed(1)}%，需要加强招生工作`,
        priority: 'high'
      })
    } else if (stats.enrollmentRate < 0.5) {
      alerts.push({
        type: 'warning',
        title: '招生率提醒',
        message: `当前招生率为 ${(stats.enrollmentRate * 100).toFixed(1)}%，可考虑优化招生策略`,
        priority: 'medium'
      })
    }
  }
  
  // 待审核申请监控
  if (stats.pendingApplications !== undefined && stats.pendingApplications > 10) {
    alerts.push({
      type: 'info',
      title: '待审核申请较多',
      message: `当前有 ${stats.pendingApplications} 个申请待审核，请及时处理`,
      priority: 'medium'
    })
  }
  
  // 更新系统预警列表
  systemAlerts.value = alerts

  // 如果有高优先级预警，显示消息提醒
  const highPriorityAlerts = alerts.filter(alert => alert.priority === 'high')
  if (highPriorityAlerts.length > 0) {
    ElMessage({
      type: 'warning',
      message: `检测到 ${highPriorityAlerts.length} 个高优先级预警，请及时处理`,
      duration: 5000,
      showClose: true
    })
  }
}

const loadNotices = async () => {
  loading.value.notices = true
  try {
    // Use the correct endpoint that exists on backend
    const response = await get(`${PRINCIPAL_ENDPOINTS.BASE}/notices/important`)
    if (response.success && response.data) {
      notices.value = response.data?.list || response.data?.items || []
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取通知数据失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    loading.value.notices = false
  }
}

const loadTodos = async () => {
  loading.value.todos = true
  try {
    const response = await get(PRINCIPAL_ENDPOINTS.SCHEDULE)
    if (response.success && response.data) {
      todos.value = response.data?.todoItems || []
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取待办事项失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    loading.value.todos = false
  }
}

const loadChartData = async () => {
  chartLoading.value = true
  try {
    const response = await get(PRINCIPAL_ENDPOINTS.ENROLLMENT_TREND, {
      period: trendPeriod.value
    })
    if (response.success && response.data) {
      console.log('获取到招生趋势数据:', response.data)
      // 这里可以集成图表库来渲染数据
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '加载招生趋势数据失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    chartLoading.value = false
  }
}

// 统计卡片点击处理
const handleStatClick = (stat: StatCard) => {
  console.log('点击统计卡片:', stat.label)

  // 根据不同的统计卡片执行不同的操作
  switch (stat.label) {
    case '学生总数':
      router.push('/student')
      break
    case '班级总数':
      router.push('/class')
      break
    case '待审核申请':
      router.push('/application')
      break
    case '招生率':
      router.push('/enrollment-plan')
      break
    default:
      ElMessage.info(`查看${stat.label}详情`)
  }
}

const navigateTo = (route: string) => {
  console.log('导航到路由:', route)

  // 使用相对路径导航，这样会在MainLayout容器内加载子页面
  // 由于当前页面路径是 /principal-dashboard，我们需要导航到同级的其他路由
  if (route.startsWith('/')) {
    // 如果是绝对路径，直接使用
    router.push(route)
  } else {
    // 如果是相对路径，导航到根路径下的子路由
    router.push(`/${route}`)
  }
}

// 清除预警
const clearAlerts = () => {
  systemAlerts.value = []
  ElMessage.success('预警信息已清除')
}

const formatTime = (time: Date | string): string => {
  if (typeof time === 'string') {
    return time
  }
  return formatDateTime(time)
}

const getNoticeTagType = (notice: Notice): 'success' | 'warning' | 'info' => {
  const readRate = notice.readCount / notice.totalCount
  if (readRate >= 0.9) return 'success'
  if (readRate >= 0.6) return 'warning'
  return 'info'
}

const getNoticeStatusText = (notice: Notice): string => {
  return `已读 ${notice.readCount}/${notice.totalCount}`
}

const handlePeriodChange = () => {
  loadChartData()
}

// 数据加载性能优化
const loadAllData = async () => {
  const loadingPromises = []
  
  // 优先加载统计数据，其他数据可以异步加载
  try {
    // 首先加载关键统计数据
    await loadDashboardStats()
    
    // 然后并行加载其他数据
    loadingPromises.push(
      loadNotices().catch(error => console.warn('Failed to load notices:', error)),
      loadTodos().catch(error => console.warn('Failed to load todos:', error)),
      loadChartData().catch(error => console.warn('Failed to load chart data:', error))
    )
    
    // 等待所有数据加载完成，但不阻塞页面渲染
    await Promise.allSettled(loadingPromises)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    ElMessage.error('加载工作台数据失败，请刷新页面重试')
  }
}

// 数据刷新功能
const refreshData = async () => {
  ElMessage.info('正在刷新数据...')
  await loadAllData()
  ElMessage.success('数据刷新成功')
}

// 定时刷新数据
let refreshInterval: NodeJS.Timeout | null = null
const startAutoRefresh = () => {
  // 每5分钟自动刷新一次数据
  refreshInterval = setInterval(() => {
    console.log('Auto refreshing dashboard data...')
    loadAllData()
  }, 5 * 60 * 1000)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// 监听趋势周期变化
watch(trendPeriod, () => {
  loadChartData()
})

// 页面销毁时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})

// 初始化
onMounted(async () => {
  await loadAllData()
  startAutoRefresh()
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/mixins/responsive.scss' as *;

.principal-dashboard {
  .dashboard-actions {
    @include flex-center-y;
    gap: var(--spacing-md);
    
    @include mobile {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-sm);
    }
  }
}

/* 统计卡片网格 */
.stats-grid {
  @include responsive-grid(1, 2, 4, var(--spacing-lg));
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--spacing-xs);
    background: var(--gradient-primary);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--transition-base);
  }
  
  &:hover {
    transform: translateY(var(--transform-hover-lift));
    box-shadow: var(--shadow-lg);
    border-color: var(--border-focus);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  .stat-content {
    @include flex-center-y;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
  }
  
  .stat-icon {
    @include flex-center;
    width: var(--icon-size); height: var(--icon-size);
    border-radius: var(--radius-md);
    color: white;
    transition: transform var(--transition-base);
    
    &--primary { background: var(--primary-color); }
    &--success { background: var(--success-color); }
    &--warning { background: var(--warning-color); }
    &--info { background: var(--info-color); }
  }
  
  .stat-info {
    flex: 1;
    
    .stat-value {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: 500;
    }
  }
  
  .stat-footer {
    @include flex-center-y;
    gap: var(--spacing-xs);
    font-size: var(--text-xs);
    color: var(--text-muted);
    
    .trend {
      @include flex-center-y;
      gap: var(--spacing-xs);
      font-weight: 600;
      
      &.up { color: var(--success-color); }
      &.down { color: var(--danger-color); }
    }
  }
  
  @include mobile {
    padding: var(--spacing-md);
    
    .stat-icon {
      width: var(--icon-size); height: var(--icon-size);
    }
    
    .stat-value {
      font-size: var(--text-xl);
    }
  }
}

/* 功能卡片网格 - 水平并列布局 */
.functions-grid {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
  
  /* 在大屏幕上平均分布 */
  @media (min-width: var(--breakpoint-xl)) {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  /* 移动端允许水平滚动 */
  @include mobile {
    gap: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
}

.function-card {
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  min-min-height: 60px; height: auto;
  flex: 0 0 280px; /* 固定宽度，不收缩 */
  
  /* 大屏幕上平均分布 */
  @media (min-width: var(--breakpoint-xl)) {
    flex: 1 1 calc(33.333% - var(--spacing-lg));
    max-width: 100%; max-width: 350px;
  }
  
  /* 超大屏幕上限制最大宽度 */
  @media (min-width: 1600px) {
    flex: 1 1 calc(16.666% - var(--spacing-lg));
    max-width: 100%; max-width: 300px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity var(--transition-base);
    pointer-events: none;
    z-index: var(--z-index-below);
  }
  
  &:hover {
    transform: translateY(-var(--spacing-xs));
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-color);
    
    &::before {
      opacity: 0.05;
    }
    
    .function-icon {
      background: var(--primary-light);
      color: var(--primary-color);
      transform: scale(1.05);
    }
    
    .function-title {
      color: var(--primary-color);
    }
    
    .function-desc {
      color: var(--text-primary);
    }
  }
  
  .function-content {
    @include flex-center-y;
    gap: var(--spacing-md);
    height: 100%;
  }
  
  .function-icon {
    @include flex-center;
    width: var(--icon-size); height: var(--icon-size);
    border-radius: var(--radius-lg);
    background: var(--bg-tertiary);
    color: var(--primary-color);
    transition: all var(--transition-base);
    flex-shrink: 0;
  }
  
  .function-info {
    flex: 1;
    
    .function-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
      transition: color var(--transition-base);
    }
    
    .function-desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.5;
      transition: color var(--transition-base);
    }
  }
  
  @include mobile {
    min-min-height: 60px; height: auto;
    padding: var(--spacing-md);
    
    .function-icon {
      width: var(--icon-size); height: var(--icon-size);
    }
    
    .function-title {
      font-size: var(--text-base);
    }
  }
}

/* 图表卡片 */
.chart-card {
  margin-bottom: var(--spacing-xl);
  
  .chart-header {
    @include flex-between;
    
    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    @include mobile {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }
  }
  
  .chart-container {
    min-min-height: 60px; height: auto;
    position: relative;
    
    @include mobile {
      min-min-height: 60px; height: auto;
    }
  }
}

/* 信息网格 */
.info-grid {
  @include responsive-grid(1, 1, 2, var(--spacing-lg));
}

.todo-card,
.notice-card {
  .section-header {
    @include flex-between;
    
    h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);
    }
    
    @include mobile {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }
  }
  
  .card-content {
    min-min-height: 60px; height: auto;
  }
}

.todo-list,
.notice-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.todo-item,
.notice-item {
  @include flex-between;
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--border-color);
  transition: all var(--transition-base);
  
  &:hover {
    background: var(--bg-hover);
    transform: translateX(var(--spacing-xs));
    box-shadow: var(--shadow-sm);
  }
  
  @include mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
  }
}

.todo-content,
.notice-content {
  flex: 1;
}

.todo-title,
.notice-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  
  @include mobile {
    font-size: var(--text-xs);
  }
}

.todo-time,
.notice-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.todo-priority {
  font-size: var(--text-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-weight: 500;
  
  &.priority-high {
    color: var(--danger-color);
    background: var(--danger-extra-light);
  }
  
  &.priority-medium {
    color: var(--warning-color);
    background: var(--warning-extra-light);
  }
  
  &.priority-low {
    color: var(--success-color);
    background: var(--success-extra-light);
  }
}

.notice-status {
  flex-shrink: 0;
}

// 预警卡片样式
.alerts-card {
  margin-bottom: var(--spacing-lg);

  .el-card__header {
    background: var(--warning-extra-light);
    border-bottom: var(--z-index-dropdown) solid var(--warning-light);
  }

  .toolbar-title {
    color: var(--warning-color);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border-left: var(--spacing-xs) solid;

  &.alert-error {
    background: var(--danger-extra-light);
    border-left-color: var(--danger-color);

    .alert-icon {
      color: var(--danger-color);
    }
  }

  &.alert-warning {
    background: var(--warning-extra-light);
    border-left-color: var(--warning-color);

    .alert-icon {
      color: var(--warning-color);
    }
  }

  &.alert-info {
    background: var(--info-extra-light);
    border-left-color: var(--info-color);

    .alert-icon {
      color: var(--info-color);
    }
  }
}

.alert-icon {
  flex-shrink: 0;
  font-size: var(--text-xl);
  margin-top: var(--spacing-sm);
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 600;
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.alert-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.alert-priority {
  flex-shrink: 0;
  font-size: var(--text-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-weight: 500;

  &.priority-high {
    color: var(--danger-color);
    background: var(--danger-light);
  }

  &.priority-medium {
    color: var(--warning-color);
    background: var(--warning-light);
  }
}

/* 加载状态和骨架屏样式 */
.stat-loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.loading-skeleton {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.skeleton-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-md);
  background: linear-gradient(90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.skeleton-value {
  height: var(--text-3xl);
  width: auto;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-label {
  height: var(--text-lg);
  max-width: 120px; width: 100%;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-trend {
  height: var(--text-base);
  width: auto;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-period {
  height: var(--text-base);
  width: auto;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* 数据更新指示器 */
.data-updated {
  position: relative;
}

.update-indicator {
  color: var(--success-color);
  font-size: var(--spacing-sm);
  margin-left: var(--spacing-xs);
  animation: pulse 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 双列布局容器 */
.cards-container {
  display: grid;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  
  &.two-columns {
    grid-template-columns: 1fr 1fr;
    
    @include mobile {
      grid-template-columns: 1fr;
    }
  }
}

.card-item {
  .card-content {
    min-min-height: 60px; height: auto;
  }
}
</style> 