<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">校园概览</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="24" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statCards" :key="index">
        <el-card class="stat-card" :class="stat.type" shadow="hover" v-loading="loading.stats">
          <div class="stat-card-content">
            <div class="stat-icon">
              <el-icon :size="32">
                <component :is="iconComponents[stat.icon]" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" v-if="stat.trend !== undefined">
                <el-icon :class="stat.trend >= 0 ? 'trend-up' : 'trend-down'">
                  <ArrowUp v-if="stat.trend >= 0" />
                  <ArrowDown v-else />
                </el-icon>
                <span>{{ Math.abs(stat.trend) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统状态区域 -->
    <el-row :gutter="24" class="system-status-section">
      <el-col :span="12">
        <el-card class="system-status-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
              <el-tag :type="systemStatus.status === 'healthy' ? 'success' : 'danger'">
                {{ systemStatus.status === 'healthy' ? '正常' : '异常' }}
              </el-tag>
            </div>
          </template>
          <div v-loading="loading.system">
            <div class="status-item">
              <span class="status-label">运行时间:</span>
              <span class="status-value">{{ systemStatus.uptime }}</span>
            </div>
                         <div class="status-item">
               <span class="status-label">CPU使用率:</span>
               <el-progress :percentage="Number(systemStatus.cpu.usage)" :color="getProgressColor(systemStatus.cpu.usage)" />
             </div>
             <div class="status-item">
               <span class="status-label">内存使用率:</span>
               <el-progress :percentage="Number(systemStatus.memory.usage)" :color="getProgressColor(systemStatus.memory.usage)" />
             </div>
            <div class="status-item">
              <span class="status-label">数据库状态:</span>
              <el-tag :type="systemStatus.database.status === 'connected' ? 'success' : 'danger'">
                {{ systemStatus.database.status === 'connected' ? '已连接' : '断开' }}
              </el-tag>
              <span class="response-time">({{ systemStatus.database.responseTime }}ms)</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="services-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>服务状态</span>
            </div>
          </template>
          <div v-loading="loading.system">
            <div class="service-item" v-for="(status, service) in systemStatus.services" :key="service">
              <span class="service-name">{{ getServiceName(service) }}:</span>
              <el-tag :type="status === 'running' ? 'success' : 'danger'">
                {{ status === 'running' ? '运行中' : '已停止' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动区域 -->
    <el-card class="recent-activities-section" shadow="never">
      <template #header>
        <div class="card-header">
          <span>最近活动</span>
          <el-button link @click="handleViewAllActivities">查看全部</el-button>
        </div>
      </template>
      <div v-loading="loading.activities">
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="formatTime(activity.time)"
            :type="getActivityType(activity.type)"
          >
            <div class="activity-content">
              <div class="activity-title">{{ activity.description }}</div>
              <div class="activity-meta">
                <el-tag size="small" :type="getActivityTagType(activity.type)">
                  {{ getActivityTypeName(activity.type) }}
                </el-tag>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
        <div v-if="recentActivities.length === 0" class="empty-state">
          <el-empty description="暂无最近活动" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh, Download, ArrowUp, ArrowDown,
  User, School, Trophy, TrendCharts
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import requestInstance from '../../utils/request'
import { formatDateTime } from '../../utils/dateFormat'
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints'

// 解构出需要的方法
const { get } = requestInstance

// 4. 页面内部类型定义

// API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 统计卡片数据接口
interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  trend?: number
}

// 系统状态接口
interface SystemStatus {
  status: string;
  uptime: string;
  cpu: {
    usage: number;
  cores: number
  }
  memory: {
    used: number;
  total: number;
  usage: number
  }
  database: {
    status: string
    responseTime: number
  }
  services: {
    [key: string]: string
  }
  lastCheck: string
}

// 最近活动接口
interface RecentActivity {
  id: number;
  type: string;
  description: string;
  time: string
}

// 加载状态接口
interface LoadingState {
  stats: boolean;
  system: boolean;
  activities: boolean
}

// 5. 组件逻辑
const router = useRouter()

// 图标组件映射
const iconComponents = {
  User,
  School,
  Trophy,
  TrendCharts
}

// 响应式数据
const loading = ref<LoadingState>({
  stats: false,
  system: false,
  activities: false
})

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
    label: '总用户数',
  value: '0',
  icon: 'User',
  type: 'primary',
  trend: 0
  },
  {
    label: '幼儿园数量',
  value: '0',
  icon: 'School',
  type: 'success',
  trend: 0
  },
  {
    label: '学生总数',
  value: '0',
  icon: 'Trophy',
  type: 'warning',
  trend: 0
  },
  {
    label: '申请数量',
  value: '0',
  icon: 'TrendCharts',
  type: 'info',
  trend: 0
  }
])

// 系统状态数据
const systemStatus = ref<SystemStatus>({
  status: 'healthy',
  uptime: '0 days 0 hours',
  cpu: {
    usage: 0,
  cores: 4
  },
  memory: {
    used: 0,
  total: 8.0,
  usage: 0
  },
  database: {
    status: 'connected',
    responseTime: 0
  },
  services: {
    api: 'running',
  auth: 'running',
  notification: 'running'
  },
  lastCheck: new Date().toISOString()
})

// 最近活动数据
const recentActivities = ref<RecentActivity[]>([])

// 6. 方法定义

// 加载统计数据
const loadStats = async () => {
  loading.value.stats = true
  try {
    const response: ApiResponse = await get(DASHBOARD_ENDPOINTS.OVERVIEW)
    if (response.success && response.data) {
      const data = response.data
      statCards.value[0].value = data.totalUsers || '0'
      statCards.value[1].value = data.totalKindergartens || '0'
      statCards.value[2].value = data.totalStudents || '0'
      statCards.value[3].value = data.totalApplications || '0'
      
      // 设置趋势数据（如果有的话）
      if (data.trends) {
        statCards.value[0].trend = data.trends.users || 0
        statCards.value[1].trend = data.trends.kindergartens || 0
        statCards.value[2].trend = data.trends.students || 0
        statCards.value[3].trend = data.trends.applications || 0
      }
      
      // 设置最近活动
      if (data.recentActivities) {
        recentActivities.value = data.recentActivities
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value.stats = false
  }
}

// 加载系统状态
const loadSystemStatus = async () => {
  loading.value.system = true
  try {
    const response: ApiResponse = await get(DASHBOARD_ENDPOINTS.SYSTEM_STATUS)
    if (response.success && response.data) {
      systemStatus.value = response.data
    }
  } catch (error) {
    console.error('加载系统状态失败:', error)
    ElMessage.error('加载系统状态失败')
  } finally {
    loading.value.system = false
  }
}

// 刷新数据
const handleRefresh = () => {
  loadStats()
  loadSystemStatus()
}

// 导出报告
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 查看全部活动
const handleViewAllActivities = () => {
  router.push('/centers/activity')
}

// 工具方法
const formatTime = (time: string): string => {
  if (!time) return ''
  return formatDateTime(new Date(time))
}

const getProgressColor = (percentage: string | number): string => {
  const num = typeof percentage === 'string' ? parseFloat(percentage) : percentage
  if (num < 50) return 'var(--success-color)'
  if (num < 80) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getServiceName = (service: string): string => {
  const serviceMap: Record<string, string> = {
    api: 'API服务',
  auth: '认证服务',
  notification: '通知服务'
  }
  return serviceMap[service] || service
}

const getActivityType = (type: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    enrollment: 'primary',
  activity: 'success',
  system: 'warning',
  error: 'danger'
  }
  return typeMap[type] || 'info'
}

const getActivityTagType = (type: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  return getActivityType(type)
}

const getActivityTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    enrollment: '招生',
  activity: '活动',
  system: '系统',
  error: '错误'
  }
  return typeMap[type] || '其他'
}

// 7. 生命周期
onMounted(() => {
  loadStats()
  loadSystemStatus()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

/* 使用全局CSS变量，确保主题切换兼容性 */
.page-container {
  padding: var(--app-gap);
  background: var(--bg-secondary);
  min-height: calc(100vh - var(--header-height, 60px));
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap);
  
  .page-title {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    background: var(--gradient-green);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .page-actions {
    display: flex;
    gap: var(--app-gap-sm);
  }
}

.stats-section {
  margin-bottom: var(--app-gap);
  
  .stat-card {
    border: var(--border-width-base) solid var(--border-color);
    transition: all 0.3s ease;
    background: var(--bg-card);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    &.primary {
      border-left: var(--spacing-xs) solid var(--primary-color);
    }
    
    &.success {
      border-left: var(--spacing-xs) solid var(--success-color);
    }
    
    &.warning {
      border-left: var(--spacing-xs) solid var(--warning-color);
    }
    
    &.info {
      border-left: var(--spacing-xs) solid var(--info-color);
    }
    
    .stat-card-content {
      display: flex;
      align-items: center;
      gap: var(--app-gap);
      
      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        background: var(--primary-light-9);
        color: var(--primary-color);
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
        }
        
        .stat-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-top: var(--app-gap-xs);
        }
        
        .stat-trend {
          display: flex;
          align-items: center;
          gap: var(--app-gap-xs);
          margin-top: var(--app-gap-xs);
          font-size: var(--text-sm);
          
          .trend-up {
            color: var(--success-color);
          }
          
          .trend-down {
            color: var(--danger-color);
          }
        }
      }
    }
  }
}

.system-status-section {
  margin-bottom: var(--app-gap);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--app-gap);
    
    .status-label {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .status-value {
      color: var(--text-secondary);
    }
    
    .response-time {
      margin-left: var(--app-gap-xs);
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  }
  
  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--app-gap-sm);
    
    .service-name {
      font-weight: 500;
      color: var(--text-primary);
    }
  }
}

.recent-activities-section {
  .activity-content {
    .activity-title {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--app-gap-xs);
    }
    
    .activity-meta {
      display: flex;
      gap: var(--app-gap-xs);
    }
  }
  
  .empty-state {
    text-align: center;
    padding: var(--app-gap-xl) 0;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap);
    
    .page-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .stats-section {
    .el-col {
      margin-bottom: var(--app-gap);
    }
  }
  
  .system-status-section {
    .el-col {
      margin-bottom: var(--app-gap);
    }
  }
}

/* 增加Element Plus组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-card__header {
    background: var(--bg-tertiary) !important;
    border-bottom-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }
  
  .el-card__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
}

:deep(.el-progress) {
  .el-progress-bar__outer {
    background: var(--bg-tertiary) !important;
  }
}
</style>

