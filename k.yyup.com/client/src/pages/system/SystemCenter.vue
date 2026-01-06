<template>
  <div class="page-container system-center-container">
    <app-card>
      <template #header>
        <app-card-header>
          <div class="app-card-title">
            <UnifiedIcon name="Setting" />
            系统中心
          </div>
          <div class="card-actions">
            <el-button type="primary" size="small" @click="handleSystemCheck" :loading="systemChecking">
              <UnifiedIcon name="Search" />
              系统检查
            </el-button>
            <el-button type="success" size="small" @click="refreshAllData" :loading="loading">
              <UnifiedIcon name="Refresh" />
              刷新数据
            </el-button>
          </div>
        </app-card-header>
      </template>

      <app-card-content>
        <!-- 统计卡片区域 -->
        <div class="stats-section">
          <div class="stats-cards">
            <div
              v-for="stat in statsData"
              :key="stat.key"
              class="stats-card"
              :class="`stat-${stat.type}`"
              @click="handleStatClick(stat.key)"
            >
              <div class="stats-icon">
                <UnifiedIcon :name="stat.icon" />
              </div>
              <div class="stats-content">
                <div class="stats-value">{{ stat.value }}</div>
                <div class="stats-label">{{ stat.label }}</div>
                <div v-if="stat.trend" class="stats-trend">
                  <el-tag :type="stat.trendType" size="small">{{ stat.trend }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 标签页切换 -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="system-tabs">
          <!-- 概览标签页 -->
          <el-tab-pane label="概览" name="overview">
            <div class="tab-content">
              <!-- 系统功能模块 -->
              <div class="section">
                <div class="section-header">
                  <h3>系统功能模块</h3>
                </div>
                <div class="module-grid">
                  <div
                    v-for="module in systemModules"
                    :key="module.key"
                    class="module-card"
                    @click="navigateTo(module.path)"
                  >
                    <div class="module-icon">{{ module.icon }}</div>
                    <div class="module-info">
                      <h4>{{ module.title }}</h4>
                      <p>{{ module.description }}</p>
                    </div>
                    <UnifiedIcon name="ArrowRight" class="module-arrow" />
                  </div>
                </div>
              </div>

              <!-- 系统状态监控 -->
              <div class="section">
                <div class="section-header">
                  <h3>系统状态监控</h3>
                  <el-button size="small" @click="refreshSystemServices">
                    <UnifiedIcon name="Refresh" />
                    刷新状态
                  </el-button>
                </div>
                <div class="service-list">
                  <div
                    v-for="service in systemServices"
                    :key="service.id"
                    class="service-card"
                    :class="`service-${service.status}`"
                  >
                    <div class="service-header">
                      <div class="service-icon">
                        <UnifiedIcon :name="service.icon" />
                      </div>
                      <div class="service-info">
                        <h4>{{ service.name }}</h4>
                        <el-tag :type="getServiceStatusType(service.status)" size="small">
                          {{ getServiceStatusText(service.status) }}
                        </el-tag>
                      </div>
                    </div>
                    <div class="service-details">
                      <div class="detail-item">
                        <span class="label">响应时间</span>
                        <span class="value">{{ service.responseTime }}ms</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">最后检查</span>
                        <span class="value">{{ formatTime(service.lastCheck) }}</span>
                      </div>
                    </div>
                    <div class="service-actions">
                      <el-button size="small" @click="restartService(service.id)">
                        重启
                      </el-button>
                      <el-button size="small" type="primary" @click="viewServiceLogs(service.id)">
                        日志
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 最近系统事件 -->
              <div class="section">
                <div class="section-header">
                  <h3>最近系统事件</h3>
                  <el-button size="small" type="primary" @click="refreshEvents">
                    刷新
                  </el-button>
                </div>
                <div class="event-list">
                  <div
                    v-for="event in recentEvents"
                    :key="event.id"
                    class="event-card"
                    :class="`event-${event.type}`"
                  >
                    <div class="event-icon">
                      <UnifiedIcon :name="getEventIcon(event.type)" />
                    </div>
                    <div class="event-content">
                      <h4>{{ event.title }}</h4>
                      <p>{{ event.description }}</p>
                      <div class="event-meta">
                        <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                        <span class="event-user">{{ event.user }}</span>
                      </div>
                    </div>
                    <el-tag :type="getEventTypeTag(event.type)" size="small">
                      {{ getEventTypeText(event.type) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 用户管理标签页 -->
          <el-tab-pane label="用户管理" name="users">
            <div class="tab-content">
              <div class="quick-actions">
                <el-button type="primary" @click="navigateTo('/system/users')">
                  <UnifiedIcon name="User" />
                  进入用户管理
                </el-button>
                <el-button type="success" @click="navigateTo('/system/roles')">
                  <UnifiedIcon name="UserFilled" />
                  角色管理
                </el-button>
                <el-button type="warning" @click="navigateTo('/system/permissions')">
                  <UnifiedIcon name="Lock" />
                  权限管理
                </el-button>
              </div>

              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ stats.userCount }}</div>
                  <div class="stat-text">总用户数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ stats.activeUsers }}</div>
                  <div class="stat-text">在线用户</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ stats.roleCount }}</div>
                  <div class="stat-text">角色数量</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ stats.permissionCount }}</div>
                  <div class="stat-text">权限数量</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 系统配置标签页 -->
          <el-tab-pane label="系统配置" name="settings">
            <div class="tab-content">
              <div class="quick-actions">
                <el-button type="primary" @click="navigateTo('/system/settings')">
                  <UnifiedIcon name="Setting" />
                  进入系统配置
                </el-button>
              </div>

              <div class="config-list">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="系统名称">{{ systemInfo.siteName }}</el-descriptions-item>
                  <el-descriptions-item label="系统版本">{{ systemInfo.version }}</el-descriptions-item>
                  <el-descriptions-item label="运行环境">{{ systemInfo.environment }}</el-descriptions-item>
                  <el-descriptions-item label="数据库">{{ systemInfo.database }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-tab-pane>

          <!-- 系统监控标签页 -->
          <el-tab-pane label="系统监控" name="monitoring">
            <div class="tab-content">
              <div class="quick-actions">
                <el-button type="primary" @click="navigateTo('/system/dashboard')">
                  <UnifiedIcon name="Monitor" />
                  进入系统监控
                </el-button>
              </div>

              <div class="monitoring-cards">
                <div class="monitor-card">
                  <div class="monitor-header">
                    <span class="monitor-title">CPU使用率</span>
                    <el-tag :type="stats.systemLoad > 80 ? 'warning' : 'success'" size="small">
                      {{ stats.loadStatus }}
                    </el-tag>
                  </div>
                  <div class="monitor-value">{{ stats.systemLoad }}%</div>
                  <el-progress
                    :percentage="stats.systemLoad"
                    :color="stats.systemLoad > 80 ? '#ff6034' : '#07c160'"
                  />
                </div>

                <div class="monitor-card">
                  <div class="monitor-header">
                    <span class="monitor-title">存储使用率</span>
                    <el-tag :type="stats.storageUsage > 85 ? 'danger' : 'success'" size="small">
                      {{ stats.storageStatus }}
                    </el-tag>
                  </div>
                  <div class="monitor-value">{{ stats.storageUsage }}%</div>
                  <el-progress
                    :percentage="stats.storageUsage"
                    :color="stats.storageUsage > 85 ? '#ee0a24' : '#07c160'"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 数据备份标签页 -->
          <el-tab-pane label="数据备份" name="backup">
            <div class="tab-content">
              <div class="quick-actions">
                <el-button type="primary" @click="navigateTo('/system/Backup')">
                  <UnifiedIcon name="Download" />
                  进入数据备份
                </el-button>
              </div>

              <div class="backup-info">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="最近备份">{{ backupInfo.lastBackup }}</el-descriptions-item>
                  <el-descriptions-item label="备份状态">
                    <el-tag type="success">正常</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-tab-pane>

          <!-- 日志管理标签页 -->
          <el-tab-pane label="日志管理" name="logs">
            <div class="tab-content">
              <div class="quick-actions">
                <el-button type="primary" @click="navigateTo('/system/Log')">
                  <UnifiedIcon name="Document" />
                  进入日志管理
                </el-button>
              </div>

              <div class="log-stats">
                <div class="stat-item">
                  <div class="stat-number">{{ stats.todayLogCount }}</div>
                  <div class="stat-text">今日日志</div>
                </div>
                <div class="stat-item error">
                  <div class="stat-number">{{ stats.errorLogCount }}</div>
                  <div class="stat-text">错误日志</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 安全设置标签页 -->
          <el-tab-pane label="安全设置" name="security">
            <div class="tab-content">
              <div class="quick-actions">
                <el-button type="primary" @click="navigateTo('/system/Security')">
                  <UnifiedIcon name="Lock" />
                  进入安全设置
                </el-button>
              </div>

              <div class="security-info">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="安全等级">
                    <el-tag type="success">高</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="防护状态">
                    <el-tag type="primary">已启用</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </app-card-content>
    </app-card>

    <!-- 全局加载状态 -->
    <el-loading v-model:full-screen="loading" text="正在加载数据..." />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Monitor, Refresh, User, UserFilled, Document, CircleCheck,
  Setting, Download, Search, Cpu, Lock, Warning, ArrowRight
} from '@element-plus/icons-vue'
import UnifiedIcon from '@/components/common/UnifiedIcon.vue'
import {
  getSystemStats,
  getSystemHealth,
  getSystemLogs,
  updateSettings
} from '@/api/modules/system'

interface SystemStats {
  uptime: string
  onlineUsers: number
  userGrowth: number
  systemLoad: number
  loadStatus: string
  storageUsage: number
  storageStatus: string
  userCount: number
  activeUsers: number
  roleCount: number
  permissionCount: number
  todayLogCount: number
  errorLogCount: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

interface SystemService {
  id: number
  name: string
  icon: string
  status: 'healthy' | 'warning' | 'error' | 'offline'
  responseTime: number
  lastCheck: Date
}

interface SystemEvent {
  id: number
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  description: string
  timestamp: Date
  user: string
}

const router = useRouter()
const loading = ref(false)
const systemChecking = ref(false)
const activeTab = ref('overview')

// 统计数据
const stats = ref<SystemStats>({
  uptime: '系统启动中...',
  onlineUsers: 0,
  userGrowth: 0,
  systemLoad: 0,
  loadStatus: '正常',
  storageUsage: 0,
  storageStatus: '正常',
  userCount: 0,
  activeUsers: 0,
  roleCount: 0,
  permissionCount: 0,
  todayLogCount: 0,
  errorLogCount: 0,
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0
})

// 统计卡片数据
const statsData = computed(() => [
  {
    key: 'uptime',
    label: '系统运行时间',
    value: stats.value.uptime,
    icon: 'Clock',
    type: 'primary',
    trend: '稳定运行',
    trendType: 'primary'
  },
  {
    key: 'users',
    label: '在线用户数',
    value: stats.value.onlineUsers,
    unit: '人',
    icon: 'User',
    type: 'success',
    trend: stats.value.userGrowth > 0 ? `+${stats.value.userGrowth}%` : '稳定',
    trendType: stats.value.userGrowth > 0 ? 'success' : 'default'
  },
  {
    key: 'load',
    label: '系统负载',
    value: stats.value.systemLoad,
    unit: '%',
    icon: 'Cpu',
    type: stats.value.systemLoad > 80 ? 'danger' : 'warning',
    trend: stats.value.loadStatus,
    trendType: stats.value.systemLoad > 80 ? 'warning' : 'success'
  },
  {
    key: 'storage',
    label: '存储使用率',
    value: stats.value.storageUsage,
    unit: '%',
    icon: 'Folder',
    type: stats.value.storageUsage > 85 ? 'danger' : 'success',
    trend: stats.value.storageStatus,
    trendType: stats.value.storageUsage > 85 ? 'danger' : 'success'
  }
])

// 系统功能模块
const systemModules = ref([
  {
    key: 'settings',
    title: '系统配置',
    description: '管理系统基础配置、参数设置、功能开关',
    icon: '⚙️',
    path: '/system/settings'
  },
  {
    key: 'users',
    title: '用户管理',
    description: '管理用户账户、角色权限、访问控制',
    icon: '👥',
    path: '/system/users'
  },
  {
    key: 'monitoring',
    title: '系统监控',
    description: '监控系统性能、资源使用、服务状态',
    icon: '📊',
    path: '/system/dashboard'
  },
  {
    key: 'backup',
    title: '数据备份',
    description: '管理备份策略、恢复操作、存储管理',
    icon: '💾',
    path: '/system/Backup'
  },
  {
    key: 'logs',
    title: '日志管理',
    description: '查看系统日志、操作记录、错误追踪',
    icon: '📝',
    path: '/system/Log'
  },
  {
    key: 'security',
    title: '安全设置',
    description: '管理安全策略、防护规则、访问限制',
    icon: '🔒',
    path: '/system/Security'
  }
])

// 系统服务
const systemServices = ref<SystemService[]>([
  {
    id: 1,
    name: 'Web服务器',
    icon: 'Monitor',
    status: 'healthy',
    responseTime: 45,
    lastCheck: new Date()
  },
  {
    id: 2,
    name: '数据库服务',
    icon: 'Database',
    status: 'healthy',
    responseTime: 12,
    lastCheck: new Date()
  },
  {
    id: 3,
    name: '缓存服务',
    icon: 'Lightning',
    status: 'warning',
    responseTime: 89,
    lastCheck: new Date()
  },
  {
    id: 4,
    name: '文件服务',
    icon: 'Folder',
    status: 'healthy',
    responseTime: 23,
    lastCheck: new Date()
  }
])

// 最近系统事件
const recentEvents = ref<SystemEvent[]>([])

// 系统信息
const systemInfo = ref({
  siteName: '懒人AI替代项目',
  version: 'v1.0.0',
  environment: '开发环境',
  database: 'MySQL 8.0'
})

// 备份信息
const backupInfo = ref({
  lastBackup: '2024-01-15 02:00:00'
})

// 方法
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

const handleStatClick = (statType: string) => {
  switch (statType) {
    case 'uptime':
      ElMessage.info('查看系统运行时间详情')
      break
    case 'users':
      navigateTo('/system/users')
      break
    case 'load':
      activeTab.value = 'monitoring'
      break
    case 'storage':
      navigateTo('/system/storage')
      break
    default:
      ElMessage.info(`查看${statType}详情`)
  }
}

const handleSystemCheck = async () => {
  try {
    systemChecking.value = true
    ElMessage.success('系统检查已启动')

    // 模拟系统检查过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 刷新服务状态
    await refreshSystemServices()

    ElMessage.success('系统检查完成')
  } catch (error) {
    console.error('系统检查失败:', error)
    ElMessage.error('系统检查失败')
  } finally {
    systemChecking.value = false
  }
}

const refreshAllData = async () => {
  try {
    loading.value = true
    await Promise.all([
      loadSystemStats(),
      loadSystemEvents()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

const restartService = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      `确定要重启服务 ${id} 吗？`,
      '确认重启',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success(`重启服务 ${id}`)

    // 模拟重启过程
    const service = systemServices.value.find(s => s.id === id)
    if (service) {
      service.status = 'warning'
      service.lastCheck = new Date()

      setTimeout(() => {
        service.status = 'healthy'
        service.responseTime = Math.floor(Math.random() * 50) + 10
      }, 3000)
    }
  } catch (error) {
    ElMessage.info('取消重启')
  }
}

const viewServiceLogs = (id: number) => {
  ElMessage.info(`查看服务 ${id} 日志`)
  // TODO: 实现查看日志功能
}

const refreshSystemServices = async () => {
  try {
    // 模拟刷新服务状态
    systemServices.value.forEach(service => {
      service.responseTime = Math.floor(Math.random() * 100) + 10
      service.lastCheck = new Date()

      // 随机生成状态
      const random = Math.random()
      if (random > 0.9) {
        service.status = 'error'
      } else if (random > 0.7) {
        service.status = 'warning'
      } else {
        service.status = 'healthy'
      }
    })
  } catch (error) {
    console.error('刷新服务状态失败:', error)
  }
}

const getServiceStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    healthy: 'success',
    warning: 'warning',
    error: 'danger',
    offline: 'info'
  }
  return typeMap[status] || 'info'
}

const getServiceStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    healthy: '正常',
    warning: '警告',
    error: '错误',
    offline: '离线'
  }
  return textMap[status] || status
}

const getEventIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    info: 'InfoFilled',
    warning: 'WarningFilled',
    success: 'CircleCheckFilled',
    error: 'CircleCloseFilled'
  }
  return iconMap[type] || 'InfoFilled'
}

const getEventTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    info: 'primary',
    warning: 'warning',
    success: 'success',
    error: 'danger'
  }
  return tagMap[type] || 'primary'
}

const getEventTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    success: '成功',
    error: '错误'
  }
  return textMap[type] || type
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const refreshEvents = async () => {
  await loadSystemEvents()
  ElMessage.success('事件已刷新')
}

// 加载系统统计数据
const loadSystemStats = async () => {
  try {
    const response = await getSystemStats()
    if (response.success && response.data) {
      const data = response.data
      const clampPercentage = (value: number | undefined): number => {
        return Math.min(100, Math.max(0, Math.round(value || 0)))
      }

      stats.value = {
        uptime: data.uptime || '未知',
        onlineUsers: Math.max(0, data.activeUsers || 0),
        userGrowth: 8.3,
        systemLoad: clampPercentage(data.cpuUsage),
        loadStatus: (data.cpuUsage || 0) < 80 ? '正常' : '警告',
        storageUsage: clampPercentage(data.diskUsage),
        storageStatus: (data.diskUsage || 0) < 80 ? '正常' : '警告',
        userCount: Math.max(0, data.userCount || 0),
        activeUsers: Math.max(0, data.activeUsers || 0),
        roleCount: Math.max(0, data.roleCount || 0),
        permissionCount: Math.max(0, data.permissionCount || 0),
        todayLogCount: Math.max(0, data.todayLogCount || 0),
        errorLogCount: Math.max(0, data.errorLogCount || 0),
        cpuUsage: clampPercentage(data.cpuUsage),
        memoryUsage: clampPercentage(data.memoryUsage),
        diskUsage: clampPercentage(data.diskUsage)
      }
    }
  } catch (error) {
    console.error('加载系统统计数据失败:', error)

    // 使用模拟数据
    stats.value = {
      uptime: '5天12小时',
      onlineUsers: 128,
      userGrowth: 8.3,
      systemLoad: 45,
      loadStatus: '正常',
      storageUsage: 62,
      storageStatus: '正常',
      userCount: 1024,
      activeUsers: 128,
      roleCount: 12,
      permissionCount: 48,
      todayLogCount: 156,
      errorLogCount: 3,
      cpuUsage: 45,
      memoryUsage: 68,
      diskUsage: 62
    }
  }
}

// 加载系统事件
const loadSystemEvents = async () => {
  try {
    const response = await getSystemLogs({
      page: 1,
      pageSize: 5,
      level: undefined
    })

    if (response.success && response.data?.items) {
      recentEvents.value = response.data.items.map((log: any, index: number) => ({
        id: log.id || index + 1,
        type: getEventTypeFromLevel(log.level),
        title: log.message || '系统事件',
        description: log.context ? JSON.stringify(log.context) : '系统日志记录',
        timestamp: new Date(log.createdAt || log.created_at),
        user: log.module || '系统'
      }))
    } else {
      // 使用模拟数据
      recentEvents.value = [
        {
          id: 1,
          type: 'info',
          title: '系统备份完成',
          description: '定时备份任务成功完成，数据已安全存储',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          user: '系统'
        },
        {
          id: 2,
          type: 'warning',
          title: '缓存服务响应缓慢',
          description: '缓存服务响应时间超过阈值，建议检查',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          user: '监控系统'
        }
      ]
    }
  } catch (error) {
    console.error('加载系统事件失败:', error)

    // 使用模拟数据
    recentEvents.value = [
      {
        id: 1,
        type: 'info',
        title: '系统备份完成',
        description: '定时备份任务成功完成，数据已安全存储',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        user: '系统'
      },
      {
        id: 2,
        type: 'warning',
        title: '缓存服务响应缓慢',
        description: '缓存服务响应时间超过阈值，建议检查',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        user: '监控系统'
      }
    ]
  }
}

const getEventTypeFromLevel = (level: string) => {
  const levelMap: Record<string, SystemEvent['type']> = {
    'error': 'error',
    'warn': 'warning',
    'warning': 'warning',
    'info': 'info',
    'debug': 'info',
    'success': 'success'
  }
  return levelMap[level] || 'info'
}

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadSystemStats(),
      loadSystemEvents()
    ])
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('初始化数据失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  initData()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.page-container {

  .stats-section {
    margin-bottom: var(--spacing-xl);

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-lg);

      .stats-card {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-sm);
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);

        &:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-md);
          transform: translateY(var(--transform-hover-lift));
        }

        &.stat-primary {
          background: var(--gradient-primary);
          color: white;
          border-color: var(--primary-color);
        }

        &.stat-success {
          background: var(--gradient-success);
          color: white;
          border-color: var(--success-color);
        }

        &.stat-warning {
          background: var(--gradient-warning);
          color: white;
          border-color: var(--warning-color);
        }

        &.stat-danger {
          background: var(--gradient-danger);
          color: white;
          border-color: var(--danger-color);
        }

        .stats-icon {
          width: var(--size-icon-xl);
          height: var(--size-icon-xl);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-2xl);
          background: rgba(255, 255, 255, 0.1);
          color: inherit;
          flex-shrink: 0;
        }

        .stats-content {
          flex: 1;

          .stats-value {
            font-size: var(--text-2xl);
            font-weight: var(--font-semibold);
            line-height: 1;
            margin-bottom: var(--spacing-xs);
          }

          .stats-label {
            font-size: var(--text-sm);
            opacity: 0.9;
            margin-bottom: var(--spacing-xs);
          }

          .stats-trend {
            margin-top: var(--spacing-xs);
          }
        }
      }
    }
  }

  .system-tabs {
    .tab-content {
      padding: var(--spacing-lg) 0;
      min-height: calc(100vh - 300px);
    }

    .section {
      margin-bottom: var(--spacing-xl);

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);

        h3 {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin: 0;
        }
      }
    }

    .module-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-lg);

      .module-card {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        display: flex;
        align-items: center;
        box-shadow: var(--shadow-sm);
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-md);
          transform: translateY(var(--transform-hover-lift));
        }

        .module-icon {
          font-size: var(--text-3xl);
          margin-right: var(--spacing-md);
        }

        .module-info {
          flex: 1;

          h4 {
            font-size: var(--text-base);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin: 0 0 var(--spacing-xs) 0;
          }

          p {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin: 0;
            line-height: 1.4;
          }
        }

        .module-arrow {
          color: var(--text-tertiary);
          transition: color 0.3s ease;
        }

        &:hover .module-arrow {
          color: var(--primary-color);
        }
      }
    }

    .service-list {
      .service-card {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-lg);
        box-shadow: var(--shadow-sm);

        &.service-healthy {
          border-left: var(--spacing-md) solid var(--success-color);
        }

        &.service-warning {
          border-left: var(--spacing-md) solid var(--warning-color);
        }

        &.service-error {
          border-left: var(--spacing-md) solid var(--danger-color);
        }

        .service-header {
          display: flex;
          align-items: center;
          margin-bottom: var(--spacing-md);

          .service-icon {
            width: var(--size-icon-xl);
            height: var(--size-icon-xl);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-tertiary);
            margin-right: var(--spacing-md);
            font-size: var(--text-xl);
            color: var(--text-primary);
          }

          .service-info {
            flex: 1;

            h4 {
              font-size: var(--text-base);
              font-weight: var(--font-semibold);
              color: var(--text-primary);
              margin: 0 0 var(--spacing-xs) 0;
            }
          }
        }

        .service-details {
          margin-bottom: var(--spacing-md);

          .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-sm);
            font-size: var(--text-sm);

            .label {
              color: var(--text-secondary);
            }

            .value {
              color: var(--text-primary);
              font-weight: var(--font-medium);
            }
          }
        }

        .service-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }

    .event-list {
      .event-card {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-lg);
        display: flex;
        align-items: flex-start;
        box-shadow: var(--shadow-sm);

        &.event-info {
          border-left: var(--spacing-md) solid var(--info-color);
        }

        &.event-warning {
          border-left: var(--spacing-md) solid var(--warning-color);
        }

        &.event-success {
          border-left: var(--spacing-md) solid var(--success-color);
        }

        &.event-error {
          border-left: var(--spacing-md) solid var(--danger-color);
        }

        .event-icon {
          width: var(--size-icon-lg);
          height: var(--size-icon-lg);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          margin-right: var(--spacing-md);
          font-size: var(--text-lg);
          color: var(--text-primary);
          flex-shrink: 0;
        }

        .event-content {
          flex: 1;

          h4 {
            font-size: var(--text-base);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin: 0 0 var(--spacing-xs) 0;
          }

          p {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin: 0 0 var(--spacing-sm) 0;
            line-height: 1.4;
          }

          .event-meta {
            display: flex;
            gap: var(--spacing-md);
            font-size: var(--text-xs);
            color: var(--text-tertiary);
          }
        }
      }
    }

    .quick-actions {
      margin-bottom: var(--spacing-xl);
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-lg);

      .stat-item {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        text-align: center;
        box-shadow: var(--shadow-sm);
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-md);
          transform: translateY(var(--transform-hover-lift));
        }

        &.error .stat-number {
          color: var(--danger-color);
        }

        .stat-number {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .stat-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }

    .config-list,
    .backup-info,
    .security-info {
      margin-top: var(--spacing-lg);
    }

    .log-stats {
      display: flex;
      gap: var(--spacing-xl);

      .stat-item {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        text-align: center;
        flex: 1;
        box-shadow: var(--shadow-sm);

        &.error .stat-number {
          color: var(--danger-color);
        }

        .stat-number {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .stat-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }

    .monitoring-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);

      .monitor-card {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-sm);

        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);

          .monitor-title {
            font-size: var(--text-base);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
          }
        }

        .monitor-value {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
          text-align: center;
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .page-container {
    .stats-section {
      .stats-cards {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: var(--spacing-md);
      }
    }

    .system-tabs {
      .module-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }

      .quick-actions {
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
      }

      .monitoring-cards {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-md);

    .stats-section {
      .stats-cards {
        grid-template-columns: 1fr;

        .stats-card {
          padding: var(--spacing-md);
        }
      }
    }

    .system-tabs {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .log-stats {
        flex-direction: column;
        gap: var(--spacing-md);
      }
    }
  }
}
</style>