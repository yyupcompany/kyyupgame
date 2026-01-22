<template>
  <UnifiedCenterLayout
    title="系统中心"
    description="清晰展示系统管理的完整流程，方便园长一目了然地掌握系统状态"
    :icon="Monitor"
  >
    <!-- 统计卡片 -->
    <template #stats>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <StatCard
          title="系统运行时间"
          :value="stats.uptime"
          unit=""
          trend="stable"
          trend-text="稳定运行"
          type="info"
          icon-name="clock"
          clickable
          @click="handleStatClick('uptime')"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <StatCard
          title="在线用户数"
          :value="stats.onlineUsers"
          unit="人"
          :trend="stats.userGrowth > 0 ? 'up' : 'stable'"
          :trend-text="stats.userGrowth > 0 ? `+${stats.userGrowth}%` : '稳定'"
          type="success"
          icon-name="User"
          clickable
          @click="handleStatClick('users')"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <StatCard
          title="系统负载"
          :value="stats.systemLoad"
          unit="%"
          :trend="stats.systemLoad > 80 ? 'down' : 'up'"
          :trend-text="stats.loadStatus"
          :type="stats.systemLoad > 80 ? 'warning' : 'primary'"
          icon-name="Monitor"
          clickable
          @click="handleStatClick('load')"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <StatCard
          title="存储使用率"
          :value="stats.storageUsage"
          unit="%"
          :trend="stats.storageUsage > 85 ? 'down' : 'up'"
          :trend-text="stats.storageStatus"
          :type="stats.storageUsage > 85 ? 'danger' : 'success'"
          icon-name="FolderOpened"
          clickable
          @click="handleStatClick('storage')"
        />
      </el-col>
    </template>

    <!-- 右侧边栏 -->
    <template #sidebar>
      <div class="sidebar-section">
        <h3 class="sidebar-title">快速操作</h3>
        <div class="quick-actions">
          <el-button
            v-for="action in quickActions"
            :key="action.key"
            :type="action.type || 'default'"
            :icon="action.icon"
            @click="action.handler"
            class="quick-action-btn"
          >
            {{ action.label }}
          </el-button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">系统状态</h3>
        <div class="system-status-list">
          <div
            v-for="service in systemServices"
            :key="service.id"
            class="status-item"
          >
            <div class="service-header">
              <div class="service-icon" :class="service.status">
                {{ service.icon }}
              </div>
              <span class="service-name">{{ service.name }}</span>
            </div>
            <div class="service-info">
              <span class="status-badge" :class="service.status">
                {{ getStatusText(service.status) }}
              </span>
              <span class="response-time">{{ service.responseTime }}ms</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 主要内容区域 -->
    <el-tabs v-model="activeTab" class="content-tabs" @tab-change="handleTabChange">
      <!-- 概览标签页 -->
      <el-tab-pane label="概览" name="overview">
        <div class="tab-content">
          <!-- 系统功能模块 -->
          <div class="modules-section">
            <h3 class="section-title">系统功能模块</h3>
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
                <div class="module-arrow">
                  <UnifiedIcon name="ArrowRight" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 监控标签页 -->
      <el-tab-pane label="系统监控" name="monitoring">
        <div class="tab-content">
          <div class="monitoring-section">
            <h3 class="section-title">实时监控</h3>
            <div class="monitoring-grid">
              <div class="monitoring-card">
                <h4>CPU使用率</h4>
                <div class="progress-wrapper">
                  <el-progress :percentage="systemMetrics.cpu" :status="getProgressStatus(systemMetrics.cpu)" />
                </div>
              </div>
              <div class="monitoring-card">
                <h4>内存使用率</h4>
                <div class="progress-wrapper">
                  <el-progress :percentage="systemMetrics.memory" :status="getProgressStatus(systemMetrics.memory)" />
                </div>
              </div>
              <div class="monitoring-card">
                <h4>磁盘使用率</h4>
                <div class="progress-wrapper">
                  <el-progress :percentage="systemMetrics.disk" :status="getProgressStatus(systemMetrics.disk)" />
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
      </el-tab-pane>

      <!-- 日志标签页 -->
      <el-tab-pane label="系统日志" name="logs">
        <div class="tab-content">
          <div class="logs-section">
            <div class="logs-header">
              <h3 class="section-title">系统日志</h3>
              <div class="logs-actions">
                <el-button @click="refreshLogs" :loading="loadingLogs">
                  <UnifiedIcon name="Refresh" />
                  刷新
                </el-button>
                <el-button type="primary" @click="exportLogs">
                  <UnifiedIcon name="Download" />
                  导出
                </el-button>
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
      </el-tab-pane>
    </el-tabs>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Monitor, ArrowRight, Refresh, Download } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import StatCard from '@/components/common/StatCard.vue'

const router = useRouter()

// 响应式数据
const activeTab = ref('overview')
const loading = ref(false)
const loadingLogs = ref(false)

// 系统统计数据
const stats = reactive({
  uptime: '15天8小时',
  onlineUsers: 128,
  userGrowth: 12,
  systemLoad: 65,
  loadStatus: '正常',
  storageUsage: 78,
  storageStatus: '正常'
})

// 系统指标
const systemMetrics = reactive({
  cpu: 65,
  memory: 78,
  disk: 82,
  network: {
    up: 2.5,
    down: 8.3
  }
})

// 系统服务状态
const systemServices = ref([
  { id: 1, name: '数据库服务', icon: '🗄️', status: 'running', responseTime: 45 },
  { id: 2, name: 'Web服务', icon: '🌐', status: 'running', responseTime: 23 },
  { id: 3, name: '缓存服务', icon: '⚡', status: 'warning', responseTime: 120 },
  { id: 4, name: '文件服务', icon: '📁', status: 'running', responseTime: 67 }
])

// 系统模块
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

// 快速操作
const quickActions = ref([
  {
    key: 'check',
    label: '系统检查',
    type: 'primary',
    icon: Monitor,
    handler: handleSystemCheck
  },
  {
    key: 'refresh',
    label: '刷新数据',
    type: 'success',
    icon: Refresh,
    handler: refreshData
  },
  {
    key: 'export',
    label: '导出报告',
    type: 'warning',
    icon: Download,
    handler: exportReport
  }
])

// 系统日志
const systemLogs = ref([
  { id: 1, timestamp: Date.now() - 300000, level: 'info', message: '系统启动完成' },
  { id: 2, timestamp: Date.now() - 240000, level: 'warning', message: '缓存服务响应较慢' },
  { id: 3, timestamp: Date.now() - 180000, level: 'info', message: '用户登录: admin' },
  { id: 4, timestamp: Date.now() - 120000, level: 'error', message: '数据库连接超时' },
  { id: 5, timestamp: Date.now() - 60000, level: 'info', message: '自动备份完成' }
])

// 方法定义
function handleSystemCheck() {
  ElMessage.success('系统检查完成，一切正常运行')
}

function handleStatClick(type: string) {
  ElMessage.info(`查看 ${type} 详细信息`)
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
    ElMessage.success('数据已刷新')
  }, 1000)
}

function refreshLogs() {
  loadingLogs.value = true
  setTimeout(() => {
    loadingLogs.value = false
    ElMessage.success('日志已刷新')
  }, 800)
}

function exportLogs() {
  ElMessage.info('正在导出系统日志...')
}

function exportReport() {
  ElMessage.info('正在生成系统报告...')
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    running: '运行中',
    warning: '警告',
    error: '错误',
    stopped: '已停止'
  }
  return statusMap[status] || status
}

function getProgressStatus(percentage: number) {
  if (percentage >= 90) return 'exception'
  if (percentage >= 80) return 'warning'
  return 'success'
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  // 初始化数据
  refreshData()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/index.scss' as *;

// 侧边栏样式
.sidebar-section {
  margin-bottom: var(--spacing-xl);

  .sidebar-title {
    font-size: var(--text-lg);
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: var(--el-text-color-primary);
  }
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .quick-action-btn {
    width: 100%;
    justify-content: flex-start;
  }
}

.system-status-list {
  .status-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    border: var(--border-width-base) solid var(--el-border-color-light);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast) ease;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .service-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;

      .service-icon {
        font-size: var(--text-lg);
      }

      .service-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }

    .service-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--spacing-xs);

      .status-badge {
        font-size: var(--text-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-xs);

        &.running {
          background-color: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }

        &.warning {
          background-color: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }

        &.error {
          background-color: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }
      }

      .response-time {
        font-size: var(--text-xs);
        color: var(--el-text-color-regular);
      }
    }
  }
}

// 内容区域样式
.content-tabs {
  margin-top: var(--spacing-lg);

  :deep(.el-tabs__header) {
    margin-bottom: var(--spacing-lg);
  }
}

.tab-content {
  min-height: var(--tab-content-min-height, 400px);
}

.welcome-card {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  color: var(--text-on-primary);
  padding: var(--spacing-xl);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-xl);

  .welcome-content {
    h2 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-2xl);
    }

    p {
      margin: 0;
      opacity: 0.9;
      line-height: var(--line-height-base);
    }
  }
}

.modules-section {
  margin-bottom: var(--spacing-xl);

  .section-title {
    font-size: var(--text-xl);
    font-weight: 600;
    margin-bottom: var(--spacing-lg);
    color: var(--el-text-color-primary);
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--module-card-min-width, 300px), 1fr));
    gap: var(--spacing-lg);

    .module-card {
      background: var(--el-bg-color);
      border: var(--border-width-base) solid var(--el-border-color-light);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      cursor: pointer;
      transition: all var(--transition-base) ease;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: var(--shadow-md);
        transform: translateY(var(--spacing-xs));
      }

      .module-icon {
        font-size: var(--text-3xl);
        flex-shrink: 0;
      }

      .module-content {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-lg);
          color: var(--el-text-color-primary);
        }

        p {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--el-text-color-regular);
          line-height: 1.5;
        }
      }

      .module-arrow {
        color: var(--el-text-color-secondary);
        transition: color var(--transition-fast) ease;
      }

      &:hover .module-arrow {
        color: var(--el-color-primary);
      }
    }
  }
}

// 监控部分样式
.monitoring-section {
  .monitoring-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--monitoring-card-min-width, 250px), 1fr));
    gap: var(--spacing-lg);

    .monitoring-card {
      background: var(--el-bg-color);
      border: var(--border-width-base) solid var(--el-border-color-light);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);

      h4 {
        margin: 0 0 var(--spacing-md) 0;
        font-size: var(--text-base);
        color: var(--el-text-color-primary);
      }

      .progress-wrapper {
        margin-top: var(--spacing-md);
      }

      .traffic-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);

        span {
          font-size: var(--text-sm);
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}

// 日志部分样式
.logs-section {
  .logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    .logs-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .logs-content {
    background: var(--el-bg-color);
    border: var(--border-width-base) solid var(--el-border-color-light);
    border-radius: var(--radius-md);
    max-height: var(--logs-max-height, 400px);
    overflow-y: auto;

    .log-item {
      display: flex;
      padding: var(--spacing-sm);
      border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
      font-size: var(--text-sm);

      &.info {
        border-left: var(--border-width-thick) solid var(--el-color-info);
      }

      &.warning {
        border-left: var(--border-width-thick) solid var(--el-color-warning);
      }

      &.error {
        border-left: var(--border-width-thick) solid var(--el-color-danger);
      }

      .log-time {
        width: var(--log-time-width, 140px);
        color: var(--el-text-color-secondary);
        flex-shrink: 0;
      }

      .log-level {
        width: var(--log-level-width, 60px);
        font-weight: 600;
        text-transform: uppercase;
        flex-shrink: 0;
      }

      .log-message {
        flex: 1;
        color: var(--el-text-color-primary);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .modules-grid {
    grid-template-columns: 1fr;
  }

  .monitoring-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    .quick-action-btn {
      padding: var(--spacing-sm);
    }
  }
}
</style>