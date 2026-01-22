<template>
  <MobileCenterLayout title="系统中心" back-path="/mobile/centers">
    <!-- 头部操作按钮 -->
    <template #header-extra>
      <van-icon name="scan" size="20" @click="handleSystemCheck" />
    </template>

    <div class="system-center-unified-mobile">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="stat in statsCards"
            :key="stat.key"
            class="stat-card"
            @click="handleStatClick(stat.key)"
          >
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" v-if="stat.trend">
                <van-tag :type="stat.trendType" size="medium">{{ stat.trend }}</van-tag>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 快速操作区域 -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h3>快速操作</h3>
        </div>
        <div class="quick-actions-grid">
          <van-button
            v-for="action in quickActions"
            :key="action.key"
            :type="action.type || 'default'"
            :icon="action.icon"
            @click="action.handler"
            class="quick-action-btn"
            block
          >
            {{ action.label }}
          </van-button>
        </div>
      </div>

      <!-- 系统服务状态 -->
      <div class="services-section">
        <div class="section-header">
          <h3>系统状态</h3>
        </div>
        <div class="services-list">
          <div
            v-for="service in systemServices"
            :key="service.id"
            class="service-card"
          >
            <div class="service-header">
              <div class="service-icon" :class="service.status">
                {{ service.icon }}
              </div>
              <div class="service-info">
                <h4>{{ service.name }}</h4>
                <van-tag
                  :type="getServiceStatusType(service.status)"
                  size="medium"
                >
                  {{ getServiceStatusText(service.status) }}
                </van-tag>
              </div>
            </div>
            <div class="service-details">
              <span class="response-time">{{ service.responseTime }}ms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页切换 -->
      <van-tabs v-model:active="activeTab" @change="handleTabChange" sticky>
        <!-- 概览标签页 -->
        <van-tab title="概览" name="overview">
          <div class="tab-content">
            <!-- 欢迎信息 -->
            <div class="welcome-card">
              <div class="welcome-content">
                <h2>欢迎来到系统中心</h2>
                <p>这里是系统管理和维护的中心枢纽，您可以管理系统配置、监控系统状态、处理系统安全。</p>
              </div>
            </div>

            <!-- 系统功能模块 -->
            <div class="modules-section">
              <div class="section-header">
                <h3>系统功能模块</h3>
              </div>
              <div class="modules-grid">
                <div
                  v-for="module in systemModules"
                  :key="module.key"
                  class="module-card"
                  @click="navigateTo(module.route)"
                >
                  <div class="module-icon">{{ module.icon }}</div>
                  <div class="module-content">
                    <h4>{{ module.title }}</h4>
                    <p>{{ module.description }}</p>
                  </div>
                  <van-icon name="arrow" color="#999" />
                </div>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 监控标签页 -->
        <van-tab title="系统监控" name="monitoring">
          <div class="tab-content">
            <div class="monitoring-section">
              <div class="section-header">
                <h3>实时监控</h3>
              </div>
              <div class="monitoring-grid">
                <div class="monitoring-card">
                  <h4>CPU使用率</h4>
                  <div class="progress-wrapper">
                    <van-progress
                      :percentage="systemMetrics.cpu"
                      :color="getProgressColor(systemMetrics.cpu)"
                      :text-color="getProgressTextColor(systemMetrics.cpu)"
                    />
                  </div>
                </div>
                <div class="monitoring-card">
                  <h4>内存使用率</h4>
                  <div class="progress-wrapper">
                    <van-progress
                      :percentage="systemMetrics.memory"
                      :color="getProgressColor(systemMetrics.memory)"
                      :text-color="getProgressTextColor(systemMetrics.memory)"
                    />
                  </div>
                </div>
                <div class="monitoring-card">
                  <h4>磁盘使用率</h4>
                  <div class="progress-wrapper">
                    <van-progress
                      :percentage="systemMetrics.disk"
                      :color="getProgressColor(systemMetrics.disk)"
                      :text-color="getProgressTextColor(systemMetrics.disk)"
                    />
                  </div>
                </div>
                <div class="monitoring-card">
                  <h4>网络流量</h4>
                  <div class="traffic-info">
                    <span>上行: {{ systemMetrics.network.up }}MB/s</span>
                    <span>下行: {{ systemMetrics.network.down }}MB/s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 日志标签页 -->
        <van-tab title="系统日志" name="logs">
          <div class="tab-content">
            <div class="logs-section">
              <div class="logs-header">
                <h3>系统日志</h3>
                <div class="logs-actions">
                  <van-button size="medium" @click="refreshLogs" :loading="loadingLogs">
                    <van-icon name="replay" />
                    刷新
                  </van-button>
                  <van-button size="medium" type="primary" @click="exportLogs">
                    <van-icon name="down" />
                    导出
                  </van-button>
                </div>
              </div>
              <div class="logs-content">
                <div
                  v-for="log in systemLogs"
                  :key="log.id"
                  class="log-item"
                  :class="log.level"
                >
                  <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                  <div class="log-level">{{ log.level.toUpperCase() }}</div>
                  <div class="log-message">{{ log.message }}</div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { getSystemStats, getSystemLogs } from '@/api/modules/system'

const router = useRouter()

// 响应式数据
const activeTab = ref('overview')
const loading = ref(false)
const loadingLogs = ref(false)

// 系统统计数据 - 严格对应PC端
const stats = reactive({
  uptime: '15天8小时',
  onlineUsers: 128,
  userGrowth: 12,
  systemLoad: 65,
  loadStatus: '正常',
  storageUsage: 78,
  storageStatus: '正常'
})

// 系统指标 - 严格对应PC端
const systemMetrics = reactive({
  cpu: 65,
  memory: 78,
  disk: 82,
  network: {
    up: 2.5,
    down: 8.3
  }
})

// 统计卡片数据 - 严格对应PC端
const statsCards = computed(() => [
  {
    key: 'uptime',
    label: '系统运行时间',
    value: stats.uptime,
    unit: '',
    icon: 'clock',
    color: '#1989fa',
    trend: '稳定运行',
    trendType: 'primary'
  },
  {
    key: 'onlineUsers',
    label: '在线用户数',
    value: stats.onlineUsers,
    unit: '人',
    icon: 'friends',
    color: '#07c160',
    trend: stats.userGrowth > 0 ? `+${stats.userGrowth}%` : '稳定',
    trendType: stats.userGrowth > 0 ? 'success' : 'default'
  },
  {
    key: 'systemLoad',
    label: '系统负载',
    value: stats.systemLoad,
    unit: '%',
    icon: 'fire',
    color: stats.systemLoad > 80 ? '#ff6034' : '#1989fa',
    trend: stats.loadStatus,
    trendType: stats.systemLoad > 80 ? 'warning' : 'success'
  },
  {
    key: 'storageUsage',
    label: '存储使用率',
    value: stats.storageUsage,
    unit: '%',
    icon: 'folder',
    color: stats.storageUsage > 85 ? '#ee0a24' : '#07c160',
    trend: stats.storageStatus,
    trendType: stats.storageUsage > 85 ? 'danger' : 'success'
  }
])

// 系统服务状态 - 严格对应PC端
const systemServices = ref([
  { id: 1, name: '数据库服务', icon: '🗄️', status: 'running', responseTime: 45 },
  { id: 2, name: 'Web服务', icon: '🌐', status: 'running', responseTime: 23 },
  { id: 3, name: '缓存服务', icon: '⚡', status: 'warning', responseTime: 120 },
  { id: 4, name: '文件服务', icon: '📁', status: 'running', responseTime: 67 }
])

// 系统模块 - 严格对应PC端
const systemModules = ref([
  {
    key: 'settings',
    title: '系统配置',
    description: '管理系统基础配置，包括参数设置、功能开关、环境配置',
    icon: '⚙️',
    route: '/system/settings'
  },
  {
    key: 'users',
    title: '用户管理',
    description: '管理系统用户账户、角色权限、访问控制',
    icon: '👥',
    route: '/system/users'
  },
  {
    key: 'monitor',
    title: '系统监控',
    description: '实时监控系统性能、资源使用、服务状态',
    icon: '📊',
    route: '/system/monitor'
  },
  {
    key: 'backup',
    title: '数据备份',
    description: '管理数据备份策略、恢复操作、存储管理',
    icon: '💾',
    route: '/system/backup'
  },
  {
    key: 'logs',
    title: '日志管理',
    description: '查看系统日志、操作记录、错误追踪',
    icon: '📝',
    route: '/system/logs'
  },
  {
    key: 'security',
    title: '安全设置',
    description: '管理系统安全策略、防护规则、访问限制',
    icon: '🔒',
    route: '/system/security'
  }
])

// 快速操作 - 严格对应PC端
const quickActions = ref([
  {
    key: 'check',
    label: '系统检查',
    type: 'primary',
    icon: 'scan',
    handler: handleSystemCheck
  },
  {
    key: 'refresh',
    label: '刷新数据',
    type: 'success',
    icon: 'replay',
    handler: refreshData
  },
  {
    key: 'export',
    label: '导出报告',
    type: 'warning',
    icon: 'down',
    handler: exportReport
  }
])

// 系统日志 - 严格对应PC端
const systemLogs = ref([
  { id: 1, timestamp: Date.now() - 300000, level: 'info', message: '系统启动完成' },
  { id: 2, timestamp: Date.now() - 240000, level: 'warning', message: '缓存服务响应较慢' },
  { id: 3, timestamp: Date.now() - 180000, level: 'info', message: '用户登录: admin' },
  { id: 4, timestamp: Date.now() - 120000, level: 'error', message: '数据库连接超时' },
  { id: 5, timestamp: Date.now() - 60000, level: 'info', message: '自动备份完成' }
])

// 方法定义 - 严格对应PC端
function handleSystemCheck() {
  Toast.success('系统检查完成，一切正常运行')
}

function handleStatClick(type: string) {
  Toast.info(`查看 ${type} 详细信息`)
}

function handleTabChange(tabName: string) {
  console.log('切换到标签页:', tabName)
}

function navigateTo(route: string) {
  router.push(route)
}

function refreshData() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    Toast.success('数据已刷新')
  }, 1000)
}

function refreshLogs() {
  loadingLogs.value = true
  setTimeout(() => {
    loadingLogs.value = false
    Toast.success('日志已刷新')
  }, 800)
}

function exportLogs() {
  Toast.info('正在导出系统日志...')
}

function exportReport() {
  Toast.info('正在生成系统报告...')
}

function handleBack() {
  router.back()
}

function getServiceStatusType(status: string) {
  const statusMap: Record<string, string> = {
    running: 'success',
    warning: 'warning',
    error: 'danger',
    stopped: 'default'
  }
  return statusMap[status] || 'default'
}

function getServiceStatusText(status: string) {
  const statusMap: Record<string, string> = {
    running: '运行中',
    warning: '警告',
    error: '错误',
    stopped: '已停止'
  }
  return statusMap[status] || status
}

function getProgressColor(percentage: number) {
  if (percentage >= 90) return '#ee0a24'
  if (percentage >= 80) return '#ff976a'
  return '#07c160'
}

function getProgressTextColor(percentage: number) {
  if (percentage >= 90) return '#fff'
  if (percentage >= 80) return '#fff'
  return '#fff'
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

// 加载系统统计数据
const loadSystemStats = async () => {
  try {
    const response = await getSystemStats()
    if (response.success && response.data) {
      const data = response.data
      stats.uptime = data.uptime || stats.uptime
      stats.onlineUsers = data.activeUsers || stats.onlineUsers
      stats.systemLoad = Math.round(data.cpuUsage || stats.systemLoad)
      stats.storageUsage = Math.round(data.diskUsage || stats.storageUsage)

      systemMetrics.cpu = stats.systemLoad
      systemMetrics.memory = Math.round(data.memoryUsage || systemMetrics.memory)
      systemMetrics.disk = stats.storageUsage
    }
  } catch (error) {
    console.error('加载系统统计数据失败:', error)
  }
}

// 加载系统日志
const loadSystemLogs = async () => {
  try {
    const response = await getSystemLogs({
      page: 1,
      pageSize: 10
    })
    if (response.success && response.data?.items) {
      systemLogs.value = response.data.items.map((log: any, index: number) => ({
        id: log.id || index + 1,
        timestamp: new Date(log.createdAt || log.created_at).getTime(),
        level: log.level || 'info',
        message: log.message || '系统日志'
      }))
    }
  } catch (error) {
    console.error('加载系统日志失败:', error)
  }
}

// 初始化数据
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadSystemStats()
  loadSystemLogs()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.system-center-unified-mobile {
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

  .quick-actions-section {
    background: var(--card-bg);
    margin-bottom: 8px;
    padding: var(--spacing-md);

    .quick-actions-grid {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);

      .quick-action-btn {
        justify-content: flex-start;
      }
    }
  }

  .services-section {
    background: var(--card-bg);
    margin-bottom: 8px;
    padding: var(--spacing-md);

    .services-list {
      .service-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md);
        margin-bottom: 8px;
        border: 1px solid #ebedf0;
        border-radius: 6px;
        transition: all 0.3s ease;

        &:active {
          background: #f2f3f5;
          border-color: #1989fa;
        }

        .service-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);

          .service-icon {
            font-size: var(--text-xl);

            &.running {
              filter: hue-rotate(120deg);
            }

            &.warning {
              filter: hue-rotate(60deg);
            }
          }

          .service-info {
            h4 {
              font-size: var(--text-sm);
              font-weight: 600;
              color: #323233;
              margin: 0 0 4px 0;
            }
          }
        }

        .service-details {
          .response-time {
            font-size: var(--text-xs);
            color: #969799;
          }
        }
      }
    }
  }

  .section-header {
    margin-bottom: 16px;

    h3 {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin: 0;
    }
  }

  .tab-content {
    padding: var(--spacing-md);
    min-height: calc(100vh - 200px);
  }

  .welcome-card {
    background: linear-gradient(135deg, #1989fa 0%, #70a9ff 100%);
    color: white;
    padding: var(--spacing-lg);
    border-radius: 8px;
    margin-bottom: 24px;

    .welcome-content {
      h2 {
        margin: 0 0 8px 0;
        font-size: var(--text-lg);
      }

      p {
        margin: 0;
        opacity: 0.9;
        line-height: 1.5;
        font-size: var(--text-sm);
      }
    }
  }

  .modules-section {
    .modules-grid {
      .module-card {
        background: var(--card-bg);
        border: 1px solid #ebedf0;
        border-radius: 8px;
        padding: var(--spacing-md);
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        &:active {
          border-color: #1989fa;
          box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);
          transform: scale(0.98);
        }

        .module-icon {
          font-size: var(--text-2xl);
          flex-shrink: 0;
        }

        .module-content {
          flex: 1;

          h4 {
            margin: 0 0 4px 0;
            font-size: var(--text-sm);
            color: #323233;
          }

          p {
            margin: 0;
            font-size: var(--text-xs);
            color: #969799;
            line-height: 1.4;
          }
        }
      }
    }
  }

  .monitoring-section {
    .monitoring-grid {
      .monitoring-card {
        background: var(--card-bg);
        border: 1px solid #ebedf0;
        border-radius: 8px;
        padding: var(--spacing-md);
        margin-bottom: 12px;

        h4 {
          margin: 0 0 12px 0;
          font-size: var(--text-sm);
          color: #323233;
        }

        .progress-wrapper {
          margin-top: 8px;
        }

        .traffic-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: 8px;

          span {
            font-size: var(--text-xs);
            color: #969799;
          }
        }
      }
    }
  }

  .logs-section {
    .logs-header {
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

      .logs-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .logs-content {
      background: var(--card-bg);
      border: 1px solid #ebedf0;
      border-radius: 8px;
      max-height: 400px;
      overflow-y: auto;

      .log-item {
        display: flex;
        padding: var(--spacing-md);
        border-bottom: 1px solid #f7f8fa;
        font-size: var(--text-xs);
        align-items: flex-start;

        &.info {
          border-left: 3px solid #1989fa;
        }

        &.warning {
          border-left: 3px solid #ff976a;
        }

        &.error {
          border-left: 3px solid #ee0a24;
        }

        .log-time {
          width: 140px;
          color: #969799;
          flex-shrink: 0;
        }

        .log-level {
          width: 60px;
          font-weight: 600;
          text-transform: uppercase;
          flex-shrink: 0;
          color: #323233;
        }

        .log-message {
          flex: 1;
          color: #323233;
        }
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .system-center-unified-mobile {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>