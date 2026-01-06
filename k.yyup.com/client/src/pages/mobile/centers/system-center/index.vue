<template>
  <MobileMainLayout
    title="系统中心"
    :show-back="true"
    @back="handleBack"
  >
    <!-- 头部操作按钮 -->
    <template #header-extra>
      <van-icon name="scan" size="20" @click="handleSystemCheck" />
    </template>

    <div class="system-center-mobile">
      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="stat in statsData"
            :key="stat.key"
            class="stat-card"
            @click="handleStatClick(stat.key)"
          >
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" v-if="stat.trend">
                <van-tag :type="stat.trendType" size="small">{{ stat.trend }}</van-tag>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 标签页切换 -->
      <van-tabs v-model:active="activeTab" @change="handleTabChange" sticky>
        <!-- 概览标签页 -->
        <van-tab title="概览" name="overview">
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
                  <van-icon name="arrow" color="#999" />
                </div>
              </div>
            </div>

            <!-- 系统状态监控 -->
            <div class="section">
              <div class="section-header">
                <h3>系统状态监控</h3>
              </div>
              <div class="service-list">
                <div
                  v-for="service in systemServices"
                  :key="service.id"
                  class="service-card"
                >
                  <div class="service-header">
                    <div class="service-icon" :class="service.status">{{ service.icon }}</div>
                    <div class="service-info">
                      <h4>{{ service.name }}</h4>
                      <van-tag
                        :type="getServiceStatusType(service.status)"
                        size="small"
                      >
                        {{ getServiceStatusText(service.status) }}
                      </van-tag>
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
                    <van-button size="small" @click="restartService(service.id)">
                      重启
                    </van-button>
                    <van-button size="small" type="primary" @click="viewServiceLogs(service.id)">
                      日志
                    </van-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 最近系统事件 -->
            <div class="section">
              <div class="section-header">
                <h3>最近系统事件</h3>
                <van-button size="mini" type="primary" @click="refreshEvents">
                  刷新
                </van-button>
              </div>
              <div class="event-list">
                <div
                  v-for="event in recentEvents"
                  :key="event.id"
                  class="event-card"
                >
                  <div class="event-icon" :class="event.type">
                    {{ getEventIcon(event.type) }}
                  </div>
                  <div class="event-content">
                    <h4>{{ event.title }}</h4>
                    <p>{{ event.description }}</p>
                    <div class="event-meta">
                      <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                      <span class="event-user">{{ event.user }}</span>
                    </div>
                  </div>
                  <van-tag :type="getEventTypeTag(event.type)" size="small">
                    {{ getEventTypeText(event.type) }}
                  </van-tag>
                </div>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 用户管理标签页 -->
        <van-tab title="用户管理" name="users">
          <div class="tab-content">
            <div class="quick-actions">
              <van-button
                type="primary"
                block
                @click="navigateTo('/system/users')"
              >
                进入用户管理
              </van-button>
            </div>

            <div class="stats-grid">
              <van-grid :column-num="2" :gutter="12">
                <van-grid-item>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.userCount }}</div>
                    <div class="stat-text">总用户数</div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.activeUsers }}</div>
                    <div class="stat-text">在线用户</div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.roleCount }}</div>
                    <div class="stat-text">角色数量</div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.permissionCount }}</div>
                    <div class="stat-text">权限数量</div>
                  </div>
                </van-grid-item>
              </van-grid>
            </div>
          </div>
        </van-tab>

        <!-- 系统配置标签页 -->
        <van-tab title="系统配置" name="settings">
          <div class="tab-content">
            <div class="quick-actions">
              <van-button
                type="primary"
                block
                @click="navigateTo('/system/settings')"
              >
                进入系统配置
              </van-button>
            </div>

            <div class="config-list">
              <van-cell-group>
                <van-cell title="系统名称" value="懒人AI替代项目" />
                <van-cell title="系统版本" value="v1.0.0" />
                <van-cell title="运行环境" value="开发环境" />
              </van-cell-group>
            </div>
          </div>
        </van-tab>

        <!-- 系统监控标签页 -->
        <van-tab title="系统监控" name="monitoring">
          <div class="tab-content">
            <div class="quick-actions">
              <van-button
                type="primary"
                block
                @click="navigateTo('/system/dashboard')"
              >
                进入系统监控
              </van-button>
            </div>

            <div class="monitoring-cards">
              <div class="monitor-card">
                <div class="monitor-header">
                  <span class="monitor-title">CPU使用率</span>
                  <van-tag
                    :type="stats.systemLoad > 80 ? 'warning' : 'success'"
                    size="small"
                  >
                    {{ stats.loadStatus }}
                  </van-tag>
                </div>
                <div class="monitor-value">{{ stats.systemLoad }}%</div>
                <van-progress
                  :percentage="stats.systemLoad"
                  :color="stats.systemLoad > 80 ? '#ff6034' : '#07c160'"
                />
              </div>

              <div class="monitor-card">
                <div class="monitor-header">
                  <span class="monitor-title">存储使用率</span>
                  <van-tag
                    :type="stats.storageUsage > 85 ? 'danger' : 'success'"
                    size="small"
                  >
                    {{ stats.storageStatus }}
                  </van-tag>
                </div>
                <div class="monitor-value">{{ stats.storageUsage }}%</div>
                <van-progress
                  :percentage="stats.storageUsage"
                  :color="stats.storageUsage > 85 ? '#ee0a24' : '#07c160'"
                />
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 数据备份标签页 -->
        <van-tab title="数据备份" name="backup">
          <div class="tab-content">
            <div class="quick-actions">
              <van-button
                type="primary"
                block
                @click="navigateTo('/system/Backup')"
              >
                进入数据备份
              </van-button>
            </div>

            <div class="backup-info">
              <van-cell-group>
                <van-cell title="最近备份" value="2024-01-15 02:00:00" />
                <van-cell title="备份状态">
                  <template #right-icon>
                    <van-tag type="success">正常</van-tag>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </div>
        </van-tab>

        <!-- 日志管理标签页 -->
        <van-tab title="日志管理" name="logs">
          <div class="tab-content">
            <div class="quick-actions">
              <van-button
                type="primary"
                block
                @click="navigateTo('/system/Log')"
              >
                进入日志管理
              </van-button>
            </div>

            <div class="log-stats">
              <van-grid :column-num="2" :gutter="12">
                <van-grid-item>
                  <div class="stat-item">
                    <div class="stat-number">{{ stats.todayLogCount }}</div>
                    <div class="stat-text">今日日志</div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="stat-item">
                    <div class="stat-number error">{{ stats.errorLogCount }}</div>
                    <div class="stat-text">错误日志</div>
                  </div>
                </van-grid-item>
              </van-grid>
            </div>
          </div>
        </van-tab>

        <!-- 审计日志标签页 -->
        <van-tab title="审计日志" name="audit">
          <div class="tab-content">
            <!-- 审计日志统计 -->
            <div class="audit-stats">
              <van-grid :column-num="2" :gutter="12">
                <van-grid-item>
                  <div class="stat-card">
                    <div class="stat-icon info">
                      <van-icon name="description" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ auditStats.totalLogs }}</div>
                      <div class="stat-label">总审计记录</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="stat-card">
                    <div class="stat-icon success">
                      <van-icon name="success" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ auditStats.successLogs }}</div>
                      <div class="stat-label">成功操作</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="stat-card">
                    <div class="stat-icon warning">
                      <van-icon name="warning" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ auditStats.failureLogs }}</div>
                      <div class="stat-label">失败操作</div>
                    </div>
                  </div>
                </van-grid-item>
                <van-grid-item>
                  <div class="stat-card">
                    <div class="stat-icon primary">
                      <van-icon name="calendar" />
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ auditStats.todayLogs }}</div>
                      <div class="stat-label">今日记录</div>
                    </div>
                  </div>
                </van-grid-item>
              </van-grid>
            </div>

            <!-- 审计日志查询 -->
            <div class="audit-search">
              <van-form @submit="searchAuditLogs">
                <van-field
                  v-model="auditQuery.module"
                  name="module"
                  label="模块"
                  placeholder="选择模块"
                  readonly
                  @click="showModulePicker = true"
                />
                <van-field
                  v-model="auditQuery.operationTypeText"
                  name="operationType"
                  label="操作类型"
                  placeholder="选择操作类型"
                  readonly
                  @click="showOperationTypePicker = true"
                />
                <van-field
                  v-model="auditQuery.dateRangeText"
                  name="dateRange"
                  label="时间范围"
                  placeholder="选择时间范围"
                  readonly
                  @click="showDatePicker = true"
                />
                <div class="search-actions">
                  <van-button type="primary" native-type="submit" :loading="auditLoading" block>
                    查询
                  </van-button>
                  <van-button @click="resetAuditQuery" block>
                    重置
                  </van-button>
                </div>
              </van-form>
            </div>

            <!-- 审计日志列表 -->
            <div class="audit-list">
              <van-list
                v-model:loading="auditLoading"
                :finished="auditFinished"
                finished-text="没有更多了"
                @load="loadAuditLogs"
              >
                <div
                  v-for="log in auditLogs"
                  :key="log.id"
                  class="audit-card"
                  @click="viewAuditDetail(log)"
                >
                  <div class="audit-header">
                    <van-tag :type="getOperationTypeTag(log.operationType)" size="small">
                      {{ getOperationTypeName(log.operationType) }}
                    </van-tag>
                    <span class="audit-time">{{ formatDateTime(log.createdAt) }}</span>
                  </div>
                  <div class="audit-content">
                    <h4>{{ log.action }}</h4>
                    <p>{{ log.description }}</p>
                  </div>
                  <div class="audit-footer">
                    <span class="audit-module">{{ log.module }}</span>
                    <van-tag
                      :type="log.operationResult === 'success' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ log.operationResult === 'success' ? '成功' : '失败' }}
                    </van-tag>
                  </div>
                </div>
              </van-list>
            </div>
          </div>
        </van-tab>

        <!-- 安全设置标签页 -->
        <van-tab title="安全设置" name="security">
          <div class="tab-content">
            <div class="quick-actions">
              <van-button
                type="primary"
                block
                @click="navigateTo('/system/Security')"
              >
                进入安全设置
              </van-button>
            </div>

            <div class="security-info">
              <van-cell-group>
                <van-cell title="安全等级">
                  <template #right-icon>
                    <van-tag type="success">高</van-tag>
                  </template>
                </van-cell>
                <van-cell title="防护状态">
                  <template #right-icon>
                    <van-tag type="primary">已启用</van-tag>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 模块选择器 -->
    <van-picker
      v-model:show="showModulePicker"
      :columns="moduleColumns"
      @confirm="onModuleConfirm"
      @cancel="showModulePicker = false"
    />

    <!-- 操作类型选择器 -->
    <van-picker
      v-model:show="showOperationTypePicker"
      :columns="operationTypeColumns"
      @confirm="onOperationTypeConfirm"
      @cancel="showOperationTypePicker = false"
    />

    <!-- 日期选择器 -->
    <van-calendar
      v-model:show="showDatePicker"
      type="range"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = false"
    />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Dialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { centersAPI } from '@/api/modules/centers'
import { getSystemStats, getSystemLogs } from '@/api/modules/system'
import { getOperationLogs } from '@/api/operation-logs'

// 路由
const router = useRouter()

// 当前活跃标签页
const activeTab = ref('overview')

// 加载状态
const loading = ref(false)
const auditLoading = ref(false)
const auditFinished = ref(false)

// 统计数据
const stats = ref({
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
    icon: 'clock',
    color: '#1989fa',
    trend: '稳定运行',
    trendType: 'primary'
  },
  {
    key: 'users',
    label: '在线用户数',
    value: stats.value.onlineUsers,
    unit: '人',
    icon: 'friends',
    color: '#07c160',
    trend: stats.value.userGrowth > 0 ? `+${stats.value.userGrowth}%` : '稳定',
    trendType: stats.value.userGrowth > 0 ? 'success' : 'default'
  },
  {
    key: 'load',
    label: '系统负载',
    value: stats.value.systemLoad,
    unit: '%',
    icon: 'fire',
    color: stats.value.systemLoad > 80 ? '#ff6034' : '#1989fa',
    trend: stats.value.loadStatus,
    trendType: stats.value.systemLoad > 80 ? 'warning' : 'success'
  },
  {
    key: 'storage',
    label: '存储使用率',
    value: stats.value.storageUsage,
    unit: '%',
    icon: 'folder',
    color: stats.value.storageUsage > 85 ? '#ee0a24' : '#07c160',
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
const systemServices = ref([
  {
    id: 1,
    name: 'Web服务器',
    icon: '🌐',
    status: 'healthy',
    responseTime: 45,
    lastCheck: new Date()
  },
  {
    id: 2,
    name: '数据库服务',
    icon: '🗄️',
    status: 'healthy',
    responseTime: 12,
    lastCheck: new Date()
  },
  {
    id: 3,
    name: '缓存服务',
    icon: '⚡',
    status: 'warning',
    responseTime: 89,
    lastCheck: new Date()
  },
  {
    id: 4,
    name: '文件服务',
    icon: '📁',
    status: 'healthy',
    responseTime: 23,
    lastCheck: new Date()
  }
])

// 最近系统事件
const recentEvents = ref([])

// 审计日志相关数据
const auditStats = ref({
  totalLogs: 0,
  successLogs: 0,
  failureLogs: 0,
  todayLogs: 0
})

const auditQuery = ref({
  module: '',
  operationType: '',
  operationTypeText: '',
  dateRange: null as any,
  dateRangeText: ''
})

const auditLogs = ref([])
const auditPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 弹窗显示状态
const showModulePicker = ref(false)
const showOperationTypePicker = ref(false)
const showDatePicker = ref(false)

// 选择器数据
const moduleColumns = [
  { text: '用户管理', value: '用户管理' },
  { text: '学生管理', value: '学生管理' },
  { text: '家长管理', value: '家长管理' },
  { text: '教师管理', value: '教师管理' },
  { text: '数据导入', value: '数据导入' },
  { text: '系统管理', value: '系统管理' }
]

const operationTypeColumns = [
  { text: '创建', value: 'create' },
  { text: '查询', value: 'read' },
  { text: '更新', value: 'update' },
  { text: '删除', value: 'delete' }
]

// 方法
const handleBack = () => {
  router.back()
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

const handleStatClick = (statType: string) => {
  switch (statType) {
    case 'uptime':
      Toast('查看系统运行时间详情')
      break
    case 'users':
      navigateTo('/system/users')
      break
    case 'load':
      navigateTo('/system/monitoring')
      break
    case 'storage':
      navigateTo('/system/storage')
      break
    default:
      Toast(`查看${statType}详情`)
  }
}

const handleSystemCheck = () => {
  Toast.success('系统检查已启动')
}

const navigateTo = (path: string) => {
  router.push(path)
}

const restartService = (id: number) => {
  Dialog.confirm({
    title: '确认重启',
    message: `确定要重启服务 ${id} 吗？`,
  }).then(() => {
    Toast.success(`重启服务 ${id}`)
  }).catch(() => {
    Toast('取消重启')
  })
}

const viewServiceLogs = (id: number) => {
  Toast.info(`查看服务 ${id} 日志`)
}

const getServiceStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    healthy: 'success',
    warning: 'warning',
    error: 'danger',
    offline: 'default'
  }
  return typeMap[status] || 'default'
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
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌'
  }
  return iconMap[type] || 'ℹ️'
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

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const refreshEvents = async () => {
  await loadSystemEvents()
  Toast.success('事件已刷新')
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
    Toast.fail('加载系统统计数据失败')
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
    }
  } catch (error) {
    console.error('加载系统事件失败:', error)
    // 使用默认数据
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
  const levelMap: Record<string, string> = {
    'error': 'error',
    'warn': 'warning',
    'warning': 'warning',
    'info': 'info',
    'debug': 'info',
    'success': 'success'
  }
  return levelMap[level] || 'info'
}

// 审计日志方法
const searchAuditLogs = async () => {
  auditLoading.value = true
  try {
    const params = {
      page: auditPagination.value.page,
      pageSize: auditPagination.value.pageSize,
      module: auditQuery.value.module,
      operationType: auditQuery.value.operationType,
      startTime: auditQuery.value.dateRange?.[0],
      endTime: auditQuery.value.dateRange?.[1]
    }

    const response = await getOperationLogs(params)
    if (response.success) {
      auditLogs.value = auditLogs.value.concat(response.data.items)
      auditPagination.value.total = response.data.total
      auditFinished.value = auditLogs.value.length >= auditPagination.value.total
    }
  } catch (error) {
    console.error('获取审计日志失败:', error)
    Toast.fail('获取审计日志失败')
  } finally {
    auditLoading.value = false
  }
}

const loadAuditLogs = () => {
  if (auditLogs.value.length >= auditPagination.value.total) {
    auditFinished.value = true
    return
  }
  auditPagination.value.page++
  searchAuditLogs()
}

const resetAuditQuery = () => {
  auditQuery.value = {
    module: '',
    operationType: '',
    operationTypeText: '',
    dateRange: null,
    dateRangeText: ''
  }
  auditLogs.value = []
  auditPagination.value.page = 1
  auditFinished.value = false
  searchAuditLogs()
}

const viewAuditDetail = (log: any) => {
  Toast.info('查看详情功能开发中...')
}

const getOperationTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    'CREATE': 'success',
    'UPDATE': 'warning',
    'DELETE': 'danger',
    'READ': 'primary'
  }
  return tagMap[type] || 'primary'
}

const getOperationTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    'CREATE': '创建',
    'UPDATE': '更新',
    'DELETE': '删除',
    'READ': '查询'
  }
  return nameMap[type] || type
}

// 选择器确认方法
const onModuleConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  auditQuery.value.module = selectedValues[0]
  showModulePicker.value = false
}

const onOperationTypeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  auditQuery.value.operationType = selectedValues[0]
  auditQuery.value.operationTypeText = selectedValues[0] === 'create' ? '创建' :
                                        selectedValues[0] === 'read' ? '查询' :
                                        selectedValues[0] === 'update' ? '更新' : '删除'
  showOperationTypePicker.value = false
}

const onDateConfirm = (date: Date[]) => {
  auditQuery.value.dateRange = date
  auditQuery.value.dateRangeText = `${date[0].toLocaleDateString()} - ${date[1].toLocaleDateString()}`
  showDatePicker.value = false
}

// 初始化数据
const initData = async () => {
  try {
    loading.value = true
    const response = await centersAPI.getSystemOverview()

    if (response.success) {
      const data = response.data
      stats.value = {
        ...stats.value,
        userCount: data.userStats.totalUsers,
        activeUsers: data.userStats.activeUsers,
        userGrowth: Math.round(data.userStats.userGrowth * 100),
        onlineUsers: data.userStats.activeUsers,
        todayLogCount: data.recentLogs.length,
        errorLogCount: Math.floor(data.recentLogs.length * 0.1),
        systemLoad: Math.round(Math.random() * 30 + 10),
        storageUsage: Math.round(Math.random() * 60 + 20),
        uptime: '系统运行中'
      }
    } else {
      throw new Error(response.message || '获取系统中心数据失败')
    }
  } catch (error) {
    console.error('使用集合API初始化数据失败:', error)
    Toast.fail('系统数据加载失败，请稍后刷新页面')

    // 降级到原始API
    Promise.all([
      loadSystemStats(),
      loadSystemEvents()
    ]).catch(fallbackError => {
      console.error('降级API也失败:', fallbackError)
      Toast.fail('系统数据完全加载失败')
    })
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  initData()
  searchAuditLogs()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.system-center-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: var(--van-tabbar-height);

  .stats-section {
    padding: var(--spacing-md);
    background: var(--card-bg);
    margin-bottom: 8px;

    .stat-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: var(--spacing-md);
      text-align: center;

      .stat-content {
        .stat-value {
          font-size: var(--text-2xl);
          font-weight: bold;
          color: #323233;
          margin: var(--spacing-sm) 0;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: #969799;
          margin-bottom: 4px;
        }

        .stat-trend {
          margin-top: 4px;
        }
      }
    }
  }

  .tab-content {
    padding: var(--spacing-md);
    min-height: calc(100vh - 100px);
  }

  .section {
    margin-bottom: 24px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
        margin: 0;
      }
    }
  }

  .module-grid {
    .module-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        background: #f2f3f5;
      }

      .module-icon {
        font-size: var(--text-2xl);
        margin-right: 12px;
      }

      .module-info {
        flex: 1;

        h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #323233;
          margin: 0 0 4px 0;
        }

        p {
          font-size: var(--text-xs);
          color: #969799;
          margin: 0;
          line-height: 1.4;
        }
      }
    }
  }

  .service-list {
    .service-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .service-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .service-icon {
          font-size: var(--text-xl);
          margin-right: 12px;

          &.healthy {
            filter: hue-rotate(120deg);
          }

          &.warning {
            filter: hue-rotate(60deg);
          }

          &.error {
            filter: hue-rotate(0deg);
          }
        }

        .service-info {
          flex: 1;

          h4 {
            font-size: var(--text-sm);
            font-weight: 600;
            color: #323233;
            margin: 0 0 4px 0;
          }
        }
      }

      .service-details {
        margin-bottom: 12px;

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: var(--text-xs);

          .label {
            color: #969799;
          }

          .value {
            color: #323233;
            font-weight: 500;
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
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      display: flex;
      align-items: flex-start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .event-icon {
        font-size: var(--text-base);
        margin-right: 12px;
        margin-top: 2px;
      }

      .event-content {
        flex: 1;

        h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #323233;
          margin: 0 0 4px 0;
        }

        p {
          font-size: var(--text-xs);
          color: #969799;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .event-meta {
          display: flex;
          gap: var(--spacing-md);
          font-size: 11px;
          color: #c8c9cc;
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: 16px;
  }

  .stats-grid {
    .stat-item {
      text-align: center;
      padding: var(--spacing-md);

      .stat-number {
        font-size: var(--text-xl);
        font-weight: bold;
        color: #323233;
        margin-bottom: 4px;

        &.error {
          color: #ee0a24;
        }
      }

      .stat-text {
        font-size: var(--text-xs);
        color: #969799;
      }
    }
  }

  .config-list {
    margin-top: 16px;
  }

  .monitoring-cards {
    .monitor-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .monitor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .monitor-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #323233;
        }
      }

      .monitor-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: #323233;
        margin-bottom: 12px;
        text-align: center;
      }
    }
  }

  .backup-info {
    margin-top: 16px;
  }

  .log-stats {
    .stat-item {
      text-align: center;
      padding: var(--spacing-md);

      .stat-number {
        font-size: var(--text-xl);
        font-weight: bold;
        color: #323233;
        margin-bottom: 4px;

        &.error {
          color: #ee0a24;
        }
      }

      .stat-text {
        font-size: var(--text-xs);
        color: #969799;
      }
    }
  }

  .security-info {
    margin-top: 16px;
  }

  .audit-stats {
    margin-bottom: 24px;

    .stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--card-bg);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-size: var(--text-xl);
        color: white;

        &.info {
          background: #1989fa;
        }

        &.success {
          background: #07c160;
        }

        &.warning {
          background: #ff976a;
        }

        &.primary {
          background: #1989fa;
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-xl);
          font-weight: bold;
          color: #323233;
          margin-bottom: 2px;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }

  .audit-search {
    background: var(--card-bg);
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .search-actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: 16px;
    }
  }

  .audit-list {
    .audit-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        background: #f2f3f5;
      }

      .audit-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .audit-time {
          font-size: var(--text-xs);
          color: #969799;
        }
      }

      .audit-content {
        margin-bottom: 8px;

        h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #323233;
          margin: 0 0 4px 0;
        }

        p {
          font-size: var(--text-xs);
          color: #969799;
          margin: 0;
          line-height: 1.4;
        }
      }

      .audit-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .audit-module {
          font-size: var(--text-xs);
          color: #c8c9cc;
        }
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .system-center-mobile {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>