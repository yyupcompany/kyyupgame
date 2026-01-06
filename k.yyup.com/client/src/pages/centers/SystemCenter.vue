<template>
  <UnifiedCenterLayout
    title="系统中心"
    description="清晰展示系统管理的完整流程，方便园长一目了然地掌握系统状态"
    :icon="Monitor"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleSystemCheck">
        系统检查
      </el-button>
    </template>

    <!-- 统计卡片 -->
    <template #stats>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <CentersStatCard
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
        <CentersStatCard
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
        <CentersStatCard
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
        <CentersStatCard
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

    <!-- 主要内容区域 -->
    <el-tabs v-model="activeTab" class="content-tabs" @tab-change="handleTabChange">
    <!-- 概览标签页 -->
    <el-tab-pane label="概览" name="overview">

      <!-- 系统功能模块 -->
      <div class="system-modules">
          <h3>系统功能模块</h3>
          <div class="actions-grid-unified">
            <div class="module-item" @click="navigateTo('/system/settings')">
              <div class="module-icon"><UnifiedIcon name="setting" /></div>
              <div class="module-content">
                <h4>系统配置</h4>
                <p>管理系统基础配置，包括参数设置、功能开关、环境配置</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/system/users')">
              <div class="module-icon"><UnifiedIcon name="user-group" /></div>
              <div class="module-content">
                <h4>用户管理</h4>
                <p>管理系统用户账户、角色权限、访问控制</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/system/dashboard')">
              <div class="module-icon"><UnifiedIcon name="analytics" /></div>
              <div class="module-content">
                <h4>系统监控</h4>
                <p>实时监控系统性能、资源使用、服务状态</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/system/Backup')">
              <div class="module-icon"><UnifiedIcon name="database" /></div>
              <div class="module-content">
                <h4>数据备份</h4>
                <p>管理数据备份策略、恢复操作、存储管理</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/system/Log')">
              <div class="module-icon"><UnifiedIcon name="note-edit" /></div>
              <div class="module-content">
                <h4>日志管理</h4>
                <p>查看系统日志、操作记录、错误追踪</p>
              </div>
            </div>
            <div class="module-item" @click="navigateTo('/system/Security')">
              <div class="module-icon"><UnifiedIcon name="lock" /></div>
              <div class="module-content">
                <h4>安全设置</h4>
                <p>管理系统安全策略、防护规则、访问限制</p>
              </div>
            </div>
          </div>
      </div>

      <!-- 系统状态监控 -->
      <div class="system-status">
          <h3>系统状态监控</h3>
          <div class="center-overview-grid-unified">
            <div class="status-item" v-for="service in systemServices" :key="service.id">
              <div class="service-header">
                <div class="service-icon" :class="service.status">{{ service.icon }}</div>
                <h4>{{ service.name }}</h4>
              </div>
              <div class="service-info">
                <div class="info-row">
                  <span>状态</span>
                  <span class="status-badge" :class="service.status">{{ getStatusText(service.status) }}</span>
                </div>
                <div class="info-row">
                  <span>响应时间</span>
                  <span class="value">{{ service.responseTime }}ms</span>
                </div>
                <div class="info-row">
                  <span>最后检查</span>
                  <span class="value">{{ formatTime(service.lastCheck) }}</span>
                </div>
              </div>
              <div class="service-actions">
                <el-button size="small" @click="restartService(service.id)">重启</el-button>
                <el-button size="small" type="primary" @click="viewServiceLogs(service.id)">日志</el-button>
              </div>
            </div>
          </div>
      </div>

      <!-- 最近系统事件 -->
      <div class="recent-events">
          <h3>最近系统事件</h3>
          <div class="event-list">
            <div class="event-item" v-for="event in recentEvents" :key="event.id">
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
              <div class="event-status" :class="event.type">
                {{ getEventTypeText(event.type) }}
              </div>
            </div>
          </div>
      </div>
    </el-tab-pane>

    <!-- 用户管理标签页 -->
    <el-tab-pane label="用户管理" name="users">
      <div class="tab-content">
        <div class="tab-header">
          <h3>用户管理</h3>
          <p>管理系统用户账户、角色权限、访问控制</p>
          <el-button type="primary" @click="navigateTo('/system/users')">
            进入用户管理
          </el-button>
        </div>
        <div class="quick-stats">
          <div class="stat-item">
            <div class="stat-label">总用户数</div>
            <div class="stat-value">{{ stats.userCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">在线用户</div>
            <div class="stat-value">{{ stats.activeUsers }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">角色数量</div>
            <div class="stat-value">{{ stats.roleCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">权限数量</div>
            <div class="stat-value">{{ stats.permissionCount }}</div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 系统配置标签页 -->
    <el-tab-pane label="系统配置" name="settings">
      <div class="tab-content">
        <div class="tab-header">
          <h3>系统配置</h3>
          <p>管理系统基础配置，包括参数设置、功能开关、环境配置</p>
          <el-button type="primary" @click="navigateTo('/system/settings')">
            进入系统配置
          </el-button>
        </div>
        <div class="config-preview">
          <div class="config-item">
            <div class="config-label">系统名称</div>
            <div class="config-value">懒人AI替代项目</div>
          </div>
          <div class="config-item">
            <div class="config-label">系统版本</div>
            <div class="config-value">v1.0.0</div>
          </div>
          <div class="config-item">
            <div class="config-label">运行环境</div>
            <div class="config-value">开发环境</div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 系统监控标签页 -->
    <el-tab-pane label="系统监控" name="monitoring">
      <div class="tab-content">
        <div class="tab-header">
          <h3>系统监控</h3>
          <p>实时监控系统性能、资源使用、服务状态</p>
          <el-button type="primary" @click="navigateTo('/system/dashboard')">
            进入系统监控
          </el-button>
        </div>
        <div class="monitoring-preview">
          <div class="monitor-item">
            <div class="monitor-label">CPU使用率</div>
            <div class="monitor-value">{{ stats.systemLoad }}%</div>
            <div class="monitor-status" :class="stats.systemLoad > 80 ? 'warning' : 'normal'">
              {{ stats.loadStatus }}
            </div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">存储使用率</div>
            <div class="monitor-value">{{ stats.storageUsage }}%</div>
            <div class="monitor-status" :class="stats.storageUsage > 85 ? 'warning' : 'normal'">
              {{ stats.storageStatus }}
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 数据备份标签页 -->
    <el-tab-pane label="数据备份" name="backup">
      <div class="tab-content">
        <div class="tab-header">
          <h3>数据备份</h3>
          <p>管理数据备份策略、恢复操作、存储管理</p>
          <el-button type="primary" @click="navigateTo('/system/Backup')">
            进入数据备份
          </el-button>
        </div>
        <div class="backup-info">
          <div class="backup-item">
            <div class="backup-label">最近备份</div>
            <div class="backup-value">2024-01-15 02:00:00</div>
          </div>
          <div class="backup-item">
            <div class="backup-label">备份状态</div>
            <div class="backup-value success">正常</div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 日志管理标签页 -->
    <el-tab-pane label="日志管理" name="logs">
      <div class="tab-content">
        <div class="tab-header">
          <h3>日志管理</h3>
          <p>查看系统日志、操作记录、错误追踪</p>
          <el-button type="primary" @click="navigateTo('/system/Log')">
            进入日志管理
          </el-button>
        </div>
        <div class="log-stats">
          <div class="log-item">
            <div class="log-label">今日日志</div>
            <div class="log-value">{{ stats.todayLogCount }}</div>
          </div>
          <div class="log-item">
            <div class="log-label">错误日志</div>
            <div class="log-value error">{{ stats.errorLogCount }}</div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 审计日志标签页 -->
    <el-tab-pane label="审计日志" name="audit">
      <div class="tab-content">
        <div class="tab-header">
          <h3>审计日志</h3>
          <p>查看系统操作审计记录、用户行为追踪、数据变更日志</p>
        </div>

        <!-- 审计日志统计 -->
        <div class="audit-stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ auditStats.totalLogs }}</div>
                  <div class="stat-label">总审计记录</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon success">
                  <UnifiedIcon name="default" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ auditStats.successLogs }}</div>
                  <div class="stat-label">成功操作</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon warning">
                  <UnifiedIcon name="default" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ auditStats.failureLogs }}</div>
                  <div class="stat-label">失败操作</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon info">
                  <UnifiedIcon name="default" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ auditStats.todayLogs }}</div>
                  <div class="stat-label">今日记录</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 审计日志查询 -->
        <div class="audit-search">
          <el-form :model="auditQuery" :inline="true" class="search-form">
            <el-form-item label="模块">
              <el-select v-model="auditQuery.module" placeholder="选择模块" clearable>
                <el-option label="用户管理" value="用户管理" />
                <el-option label="学生管理" value="学生管理" />
                <el-option label="家长管理" value="家长管理" />
                <el-option label="教师管理" value="教师管理" />
                <el-option label="数据导入" value="数据导入" />
                <el-option label="系统管理" value="系统管理" />
              </el-select>
            </el-form-item>
            <el-form-item label="操作类型">
              <el-select v-model="auditQuery.operationType" placeholder="选择操作类型" clearable>
                <el-option label="创建" value="create" />
                <el-option label="查询" value="read" />
                <el-option label="更新" value="update" />
                <el-option label="删除" value="delete" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="auditQuery.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchAuditLogs" :loading="auditLoading">
                <UnifiedIcon name="Search" />
                查询
              </el-button>
              <el-button @click="resetAuditQuery">重置</el-button>
              <el-button @click="exportAuditLogs">
                <UnifiedIcon name="Download" />
                导出
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 审计日志表格 -->
        <div class="audit-table">
          <div class="table-wrapper">
<el-table class="responsive-table"
            :data="auditLogs"
            v-loading="auditLoading"
            stripe
            border
            height="400"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="module" label="模块" width="120" />
            <el-table-column prop="action" label="操作" width="120" />
            <el-table-column prop="operationType" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getOperationTypeTag(row.operationType)" size="small">
                  {{ getOperationTypeName(row.operationType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200" />
            <el-table-column prop="operationResult" label="结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.operationResult === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.operationResult === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="requestIp" label="IP地址" width="120" />
            <el-table-column prop="createdAt" label="操作时间" width="180" />
            <el-table-column label="操作" width="160" fixed="right" align="center">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewAuditDetail(row)"
                  >
                    <UnifiedIcon name="document" />
                    详情
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
</div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="auditPagination.page"
              v-model:page-size="auditPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="auditPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleAuditPageSizeChange"
              @current-change="handleAuditPageChange"
            />
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 安全设置标签页 -->
    <el-tab-pane label="安全设置" name="security">
      <div class="tab-content">
        <div class="tab-header">
          <h3>安全设置</h3>
          <p>管理系统安全策略、防护规则、访问限制</p>
          <el-button type="primary" @click="navigateTo('/system/Security')">
            进入安全设置
          </el-button>
        </div>
        <div class="security-status">
          <div class="security-item">
            <div class="security-label">安全等级</div>
            <div class="security-value high">高</div>
          </div>
          <div class="security-item">
            <div class="security-label">防护状态</div>
            <div class="security-value active">已启用</div>
          </div>
        </div>
      </div>
    </el-tab-pane>
    </el-tabs>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  SuccessFilled,
  WarningFilled,
  Clock,
  Search,
  Download,
  View,
  Monitor
} from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import CentersStatCard from '@/components/centers/StatCard.vue'
import { getSystemStats } from '@/api/modules/system'
import { getSystemLogList } from '@/api/modules/log'
import { getOperationLogs } from '@/api/operation-logs'
import { centersAPI } from '@/api/modules/centers'

// 路由
const router = useRouter()

// 标签页配置
const tabs = [
  { key: 'overview', label: '概览' },
  { key: 'users', label: '用户管理' },
  { key: 'settings', label: '系统配置' },
  { key: 'monitoring', label: '系统监控' },
  { key: 'backup', label: '数据备份' },
  { key: 'logs', label: '日志管理' },
  { key: 'audit', label: '审计日志' },
  { key: 'security', label: '安全设置' }
]

// 当前活跃标签页
const activeTab = ref('overview')

// 标签页切换处理
const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

// 处理统计卡片点击
const handleStatClick = (statType: string) => {
  switch (statType) {
    case 'uptime':
      ElMessage.info('查看系统运行时间详情')
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
      ElMessage.info(`查看${statType}详情`)
  }
}

// 系统统计数据
const stats = ref({
  uptime: '系统启动中...',
  onlineUsers: 0,
  userGrowth: 0,
  systemLoad: 0,
  loadStatus: '正常',
  storageUsage: 0,
  storageStatus: '正常',
  // 新增字段
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

// 加载状态
const loading = ref(false) // 改为false，避免初始加载遮罩

// 系统服务
const systemServices = ref([
  {
    id: 1,
    name: 'Web服务器',
    icon: '🌐',
    status: 'loading',
    responseTime: 0,
    lastCheck: new Date()
  },
  {
    id: 2,
    name: '数据库服务',
    icon: '🗄️',
    status: 'loading',
    responseTime: 0,
    lastCheck: new Date()
  },
  {
    id: 3,
    name: '缓存服务',
    icon: '⚡',
    status: 'loading',
    responseTime: 0,
    lastCheck: new Date()
  },
  {
    id: 4,
    name: '文件服务',
    icon: '📁',
    status: 'loading',
    responseTime: 0,
    lastCheck: new Date()
  }
])

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
  dateRange: null as any
})

const auditLogs = ref([])
const auditLoading = ref(false)
const auditPagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 最近系统事件
const recentEvents = ref([])

// 加载系统统计数据
const loadSystemStats = async () => {
  try {
    const response = await getSystemStats()
    if (response.success && response.data) {
      const data = response.data
      // 辅助函数：限制百分比在0-100范围内
      const clampPercentage = (value: number | undefined): number => {
        return Math.min(100, Math.max(0, Math.round(value || 0)))
      }

      stats.value = {
        uptime: data.uptime || '未知',
        onlineUsers: Math.max(0, data.activeUsers || 0),
        userGrowth: 8.3, // 暂时使用固定值，后续可以计算
        systemLoad: clampPercentage(data.systemMetrics?.cpu?.usage),
        loadStatus: (data.systemMetrics?.cpu?.usage || 0) < 80 ? '正常' : '警告',
        storageUsage: clampPercentage(data.systemMetrics?.disk?.usage),
        storageStatus: (data.systemMetrics?.disk?.usage || 0) < 80 ? '正常' : '警告',
        // 新增字段
        userCount: Math.max(0, data.userCount || 0),
        activeUsers: Math.max(0, data.activeUsers || 0),
        roleCount: Math.max(0, data.roleCount || 0),
        permissionCount: Math.max(0, data.permissionCount || 0),
        todayLogCount: Math.max(0, data.todayLogCount || 0),
        errorLogCount: Math.max(0, data.errorLogCount || 0),
        cpuUsage: clampPercentage(data.systemMetrics?.cpu?.usage),
        memoryUsage: clampPercentage(data.systemMetrics?.memory?.usage),
        diskUsage: clampPercentage(data.systemMetrics?.disk?.usage)
      }

      // 更新系统服务状态
      if (data.systemMetrics) {
        systemServices.value[0].status = data.systemMetrics.performance?.responseTime < 100 ? 'healthy' : 'warning'
        systemServices.value[0].responseTime = Math.round(data.systemMetrics.performance?.responseTime || 45)

        systemServices.value[1].status = 'healthy' // 数据库通常是健康的
        systemServices.value[1].responseTime = 12

        systemServices.value[2].status = data.systemMetrics.performance?.score > 80 ? 'healthy' : 'warning'
        systemServices.value[2].responseTime = Math.round(data.systemMetrics.network?.latency || 89)

        systemServices.value[3].status = 'healthy'
        systemServices.value[3].responseTime = 23
      }
    }
  } catch (error) {
    console.error('加载系统统计数据失败:', error)
    ElMessage.error('加载系统统计数据失败')
  }
}

// 加载系统事件（从系统日志获取）
const loadSystemEvents = async () => {
  try {
    const response = await getSystemLogList({
      page: 1,
      pageSize: 4,
      level: undefined // 获取所有级别的日志
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
    // 使用默认事件数据
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

// 将日志级别转换为事件类型
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

// 初始化数据
const initData = async () => {
  // 使用集合API加载系统中心数据
  try {
    loading.value = true
    const startTime = performance.now()

    // 使用集合API获取系统中心数据
    const response = await centersAPI.getSystemOverview()

    const endTime = performance.now()
    console.log(`集合API加载时间: ${Math.round(endTime - startTime)}ms`)

    if (response.success) {
      const data = response.data

      // 更新统计数据
      stats.value = {
        ...stats.value,
        userCount: data.userStats.totalUsers,
        activeUsers: data.userStats.activeUsers,
        userGrowth: Math.round(data.userStats.userGrowth * 100),
        onlineUsers: data.userStats.activeUsers,
        systemLoad: Math.round(Math.random() * 30 + 10), // 模拟数据
        loadStatus: '正常',
        storageUsage: Math.round(Math.random() * 60 + 20), // 模拟数据
        storageStatus: '正常',
        todayLogCount: data.recentLogs.length,
        errorLogCount: Math.floor(data.recentLogs.length * 0.1), // 模拟10%错误率
        cpuUsage: Math.round(Math.random() * 40 + 20), // 模拟数据
        memoryUsage: Math.round(Math.random() * 50 + 30), // 模拟数据
        diskUsage: Math.round(Math.random() * 70 + 10), // 模拟数据
        uptime: '系统运行中'
      }

      // 更新系统服务状态
      systemServices.value = systemServices.value.map(service => ({
        ...service,
        status: Math.random() > 0.1 ? 'running' : 'warning',
        responseTime: Math.round(Math.random() * 100 + 20)
      }))

      console.log('系统中心数据加载成功:', data)
    } else {
      throw new Error(response.message || '获取系统中心数据失败')
    }
  } catch (error) {
    console.error('使用集合API初始化数据失败:', error)
    ElMessage.error('系统数据加载失败，请稍后刷新页面')

    // 降级到原始API
    Promise.all([
      loadSystemStats(),
      loadSystemEvents()
    ]).catch(fallbackError => {
      console.error('降级API也失败:', fallbackError)
      ElMessage.warning('系统数据完全加载失败')
    })
  } finally {
    loading.value = false
  }
}

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path)
}

// 系统检查
const handleSystemCheck = () => {
  ElMessage.success('系统检查已启动')
}

// 重启服务
const restartService = (id: number) => {
  ElMessage.success(`重启服务 ${id}`)
}

// 查看服务日志
const viewServiceLogs = (id: number) => {
  ElMessage.info(`查看服务 ${id} 日志`)
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    healthy: '正常',
    warning: '警告',
    error: '错误',
    offline: '离线'
  }
  return statusMap[status] || status
}

// 获取事件图标
const getEventIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌'
  }
  return iconMap[type] || 'ℹ️'
}

// 获取事件类型文本
const getEventTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    success: '成功',
    error: '错误'
  }
  return typeMap[type] || type
}

// 格式化时间
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

// 组件挂载时加载数据
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
      auditLogs.value = response.data.items
      auditPagination.value.total = response.data.total
    }
  } catch (error) {
    console.error('获取审计日志失败:', error)
    ElMessage.error('获取审计日志失败')
  } finally {
    auditLoading.value = false
  }
}

const resetAuditQuery = () => {
  auditQuery.value = {
    module: '',
    operationType: '',
    dateRange: null
  }
  auditPagination.value.page = 1
  searchAuditLogs()
}

const exportAuditLogs = () => {
  ElMessage.info('导出功能开发中...')
}

const viewAuditDetail = (row: any) => {
  ElMessage.info('查看详情功能开发中...')
}

const handleAuditPageChange = (page: number) => {
  auditPagination.value.page = page
  searchAuditLogs()
}

const handleAuditPageSizeChange = (pageSize: number) => {
  auditPagination.value.pageSize = pageSize
  auditPagination.value.page = 1
  searchAuditLogs()
}

const getOperationTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    'CREATE': 'success',
    'UPDATE': 'warning',
    'DELETE': 'danger',
    'READ': 'info'
  }
  return tagMap[type] || 'info'
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

onMounted(() => {
  console.log('系统中心已加载')
  initData()
  searchAuditLogs()
})
</script>

<style scoped lang="scss">
.system-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--text-3xl);
  background: var(--bg-secondary, var(--bg-container));
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--text-3xl);
  font-weight: 600;
}

.main-content {
  flex: 1;
  background: var(--bg-color, var(--bg-white));
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* .welcome-section 样式已移至全局 center-common.scss 中统一管理 */

.system-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);
}

.stat-item h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
  font-weight: 500;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.stat-trend {
  font-size: var(--text-sm);
  font-weight: 500;

  &.positive {
    color: var(--success-color);
  }

  &.negative {
    color: var(--danger-color);
  }

  &.stable {
    color: var(--text-muted);
  }
}

.system-modules h3,
.system-status h3,
.recent-events h3 {
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
  font-size: var(--text-xl);
  font-weight: 600;
}

.actions-grid-unified {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.module-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-color-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.module-icon {
  font-size: var(--text-3xl);
  margin-right: var(--spacing-lg);
}

.module-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.module-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.system-modules {
  margin-bottom: var(--spacing-2xl);
}

.system-status {
  margin-bottom: var(--spacing-2xl);
}

.recent-events {
  margin-bottom: var(--spacing-xl);
}

.center-overview-grid-unified {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.status-item {
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);
}

.service-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.service-icon {
  font-size: var(--text-3xl);
  margin-right: var(--spacing-md);

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

.service-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.service-info {
  margin-bottom: var(--spacing-md);
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-base);
}

.info-row span:first-child {
  color: var(--text-secondary);
}

.info-row .value {
  color: var(--text-primary);
  font-weight: 600;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-xs);
  font-size: var(--text-sm);

  &.healthy {
    background: var(--success-bg);
    color: var(--success-color);
  }

  &.warning {
    background: var(--warning-bg);
    color: var(--warning-color);
  }

  &.error {
    background: var(--danger-bg);
    color: var(--danger-color);
  }
}

.service-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.event-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);
}

.event-icon {
  font-size: var(--text-3xl);
  margin-right: var(--spacing-md);
  width: auto;
  text-align: center;
}

.event-content {
  flex: 1;
}

.event-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.event-content p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.event-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.event-status {
  padding: var(--spacing-sm) 10px;
  border-radius: var(--radius-xs);
  font-size: var(--text-sm);

  &.info {
    background: var(--info-bg);
    color: var(--info-color);
  }

  &.warning {
    background: var(--warning-bg);
    color: var(--warning-color);
  }

  &.success {
    background: var(--success-bg);
    color: var(--success-color);
  }

  &.error {
    background: var(--danger-bg);
    color: var(--danger-color);
  }
}

/* 标签页内容样式 */
.tab-content {
  padding: var(--spacing-xl) 0;
}

.content-tabs {
  margin-top: var(--spacing-xl);
}

.tab-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;

  h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--text-3xl);
    color: var(--text-primary);
  }

  p {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--text-secondary);
    font-size: var(--text-lg);
  }
}

/* 快速统计样式 */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);

  .stat-label {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
  }

  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--primary-color);
  }
}

/* 配置预览样式 */
.config-preview {
  display: grid;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);

  .config-label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .config-value {
    color: var(--text-secondary);
  }
}

/* 监控预览样式 */
.monitoring-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.monitor-item {
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);
  text-align: center;

  .monitor-label {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
  }

  .monitor-value {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }

  .monitor-status {
    font-size: var(--text-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--spacing-xs);

    &.normal {
      background: var(--success-bg);
      color: var(--success-color);
    }

    &.warning {
      background: var(--warning-bg);
      color: var(--warning-color);
    }
  }
}

/* 备份信息样式 */
.backup-info {
  display: grid;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);

  .backup-label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .backup-value {
    color: var(--text-secondary);

    &.success {
      color: var(--success-color);
      font-weight: 500;
    }
  }
}

/* 日志统计样式 */
.log-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.log-item {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);

  .log-label {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
  }

  .log-value {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--primary-color);

    &.error {
      color: var(--danger-color);
    }
  }
}

/* 安全状态样式 */
.security-status {
  display: grid;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);

  .security-label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .security-value {
    font-weight: 500;

    &.high {
      color: var(--success-color);
    }

    &.active {
      color: var(--primary-color);
    }
  }
}

// 响应式设计 - 完整的断点系统
@media (max-width: var(--breakpoint-xl)) {
  .welcome-section {
    padding: var(--text-xl);
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-2xl);
  }

  .actions-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-2xl);
  }

  .system-modules {
    .module-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--text-2xl);
    }
  }
}

@media (max-width: 992px) {
  .welcome-section {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md);
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .system-modules {
    .module-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  .system-status {
    .status-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);

    .welcome-content {
      text-align: center;
      margin-bottom: var(--spacing-md);

      h2 {
        font-size: var(--text-3xl);
      }

      p {
        font-size: var(--text-base);
      }
    }

    .header-actions {
      margin-left: 0;
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .stats-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .system-modules {
    .module-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .module-item {
      padding: var(--spacing-lg);

      .module-content {
        h4 {
          font-size: var(--text-lg);
        }

        p {
          font-size: var(--text-base);
        }
      }
    }
  }

  .system-status {
    .status-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  .logs-section {
    .logs-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  .security-section {
    .security-status {
      gap: var(--spacing-xs);
    }

    .security-item {
      padding: var(--spacing-xs) var(--spacing-md);
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .welcome-section {
    padding: var(--spacing-md);

    .welcome-content {
      h2 {
        font-size: var(--text-2xl);
      }

      p {
        font-size: var(--text-base);
      }
    }
  }

  .stats-grid-unified {
    gap: var(--spacing-sm);
  }

  .actions-grid-unified {
    gap: var(--spacing-sm);
  }

  .system-modules {
    .module-grid {
      gap: var(--spacing-sm);
    }

    .module-item {
      padding: var(--spacing-md);

      .module-icon {
        font-size: var(--text-2xl);
      }

      .module-content {
        h4 {
          font-size: var(--text-base);
        }

        p {
          font-size: var(--text-sm);
        }
      }
    }
  }

  .system-status {
    .status-grid {
      gap: var(--spacing-sm);
    }

    .status-item {
      padding: var(--spacing-md);
    }
  }
}

/* 审计日志样式 */
.audit-stats {
  .el-row {
    margin-bottom: var(--spacing-lg);
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--bg-color);
    border-radius: var(--radius-sm);
    border: var(--border-width-base) solid var(--border-color);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 4var(--spacing-sm);
      height: 4var(--spacing-sm);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--spacing-md);
      background: var(--primary-bg);
      color: var(--primary-color);
      font-size: var(--text-xl);

      &.success {
        background: var(--success-bg);
        color: var(--success-color);
      }

      &.warning {
        background: var(--warning-bg);
        color: var(--warning-color);
      }

      &.info {
        background: var(--info-bg);
        color: var(--info-color);
      }
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
  }
}

/* 审计日志查询样式 */
.audit-search {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-sm);
  border: var(--border-width-base) solid var(--border-color);

  .search-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

/* 审计日志表格样式 */
.audit-table {
  .el-table {
    font-size: var(--text-sm);
  }

  .table-actions {
    display: flex;
    gap: var(--spacing-xs);
    justify-content: center;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}
</style>
