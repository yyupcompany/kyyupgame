<template>
  <CenterContainer
    title="系统中心"
    :tabs="tabs"
    default-tab="overview"
    v-model:activeTab="activeTab"
    :show-header="false"
    :show-actions="false"
    :sync-url="false"
    :show-skeleton="stats.loading"
    @create="handleSystemCheck"
    @tab-change="handleTabChange"
  >
    <!-- 概览标签页 -->
    <template #tab-overview>
      <div class="overview-content">
        <!-- 欢迎词和操作按钮 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h2>欢迎来到系统中心</h2>
            <p>这里是系统管理和维护的中心枢纽，您可以管理系统配置、监控系统状态、处理系统安全。</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="handleSystemCheck">
              <el-icon><Monitor /></el-icon>
              系统检查
            </el-button>
          </div>
        </div>

        <!-- 错误状态提示 -->
        <el-alert
          v-if="stats.error"
          :title="stats.error"
          type="error"
          :closable="false"
          style="margin-bottom: var(--text-2xl)"
        />

        <!-- 系统统计数据 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ stats.uptime || '0天' }}</span>
              </div>
              <div class="stat-label">系统运行时间</div>
              <div class="stat-trend">
                <el-icon><SuccessFilled /></el-icon>
                <span>稳定运行</span>
              </div>
            </div>
          </div>

          <div class="stat-card" @click="switchToTab('users')">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ stats.onlineUsers || 0 }}</span>
              </div>
              <div class="stat-label">在线用户数</div>
              <div class="stat-trend" v-if="!stats.loading && !stats.error && stats.userGrowth">
                <el-icon><TrendCharts /></el-icon>
                <span>+{{ stats.userGrowth }}%</span>
              </div>
            </div>
          </div>

          <div class="stat-card" @click="switchToTab('monitor')">
            <div class="stat-icon">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ stats.systemLoad || 0 }}%</span>
              </div>
              <div class="stat-label">系统负载</div>
              <div class="stat-trend" :class="getLoadStatus(stats.systemLoad)">
                <el-icon><TrendCharts /></el-icon>
                <span>{{ getLoadStatusText(stats.systemLoad) }}</span>
              </div>
            </div>
          </div>

          <div class="stat-card" @click="switchToTab('backup')">
            <div class="stat-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ stats.storageUsage || 0 }}%</span>
              </div>
              <div class="stat-label">存储使用率</div>
              <div class="stat-trend" :class="getStorageStatus(stats.storageUsage)">
                <el-icon><TrendCharts /></el-icon>
                <span>{{ getStorageStatusText(stats.storageUsage) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <div class="actions-header">
            <h3>快速操作</h3>
          </div>
          <div class="actions-grid">
            <ActionCard
              v-for="action in quickActions"
              :key="action.key"
              :title="action.title"
              :description="action.description"
              :icon="action.icon"
              :color="action.color"
              @click="handleQuickAction(action.key)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 用户管理标签页 -->
    <template #tab-users>
      <div class="users-content">
        <div class="users-header">
          <h3>用户管理</h3>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreateUser">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
          </div>
        </div>

        <!-- 用户统计 -->
        <div class="user-stats">
          <div class="stat-item">
            <h4>总用户数</h4>
            <div class="value">{{ userStats.totalUsers || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>活跃用户</h4>
            <div class="value">{{ userStats.activeUsers || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>管理员</h4>
            <div class="value">{{ userStats.adminUsers || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>今日新增</h4>
            <div class="value">{{ userStats.newUsersToday || 0 }}</div>
          </div>
        </div>

        <!-- 用户列表 -->
        <div class="users-list">
          <el-table :data="users" stripe>
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="role" label="角色">
              <template #default="{ row }">
                <el-tag :type="getUserRoleType(row.role)">
                  {{ getUserRoleText(row.role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getUserStatusType(row.status)">
                  {{ getUserStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastLogin" label="最后登录" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="viewUser(row)">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button size="small" type="primary" @click="editUser(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" :type="row.status === 'active' ? 'warning' : 'success'" 
                           @click="toggleUserStatus(row)">
                  {{ row.status === 'active' ? '停用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- 系统配置标签页 -->
    <template #tab-settings>
      <div class="settings-content">
        <div class="settings-header">
          <h3>系统配置</h3>
          <div class="header-actions">
            <el-button @click="refreshSettings">
              <el-icon><Refresh /></el-icon>
              刷新配置
            </el-button>
            <el-button type="primary" @click="saveSettings">
              <el-icon><Check /></el-icon>
              保存配置
            </el-button>
          </div>
        </div>

        <!-- 配置分组 -->
        <div class="settings-tabs">
          <el-tabs v-model="activeSettingsTab" type="card">
            <el-tab-pane label="基础配置" name="basic">
              <div class="settings-form">
                <el-form :model="systemSettings.basic" label-width="150px">
                  <el-form-item label="系统名称">
                    <el-input v-model="systemSettings.basic.systemName" />
                  </el-form-item>
                  <el-form-item label="系统描述">
                    <el-input type="textarea" v-model="systemSettings.basic.systemDescription" />
                  </el-form-item>
                  <el-form-item label="系统版本">
                    <el-input v-model="systemSettings.basic.systemVersion" readonly />
                  </el-form-item>
                  <el-form-item label="维护模式">
                    <el-switch v-model="systemSettings.basic.maintenanceMode" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="安全配置" name="security">
              <div class="settings-form">
                <el-form :model="systemSettings.security" label-width="150px">
                  <el-form-item label="密码最小长度">
                    <el-input-number v-model="systemSettings.security.minPasswordLength" :min="6" :max="20" />
                  </el-form-item>
                  <el-form-item label="登录失败限制">
                    <el-input-number v-model="systemSettings.security.maxLoginAttempts" :min="3" :max="10" />
                  </el-form-item>
                  <el-form-item label="会话超时(分钟)">
                    <el-input-number v-model="systemSettings.security.sessionTimeout" :min="30" :max="480" />
                  </el-form-item>
                  <el-form-item label="启用两步验证">
                    <el-switch v-model="systemSettings.security.enableTwoFactor" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="通知配置" name="notification">
              <div class="settings-form">
                <el-form :model="systemSettings.notification" label-width="150px">
                  <el-form-item label="邮件通知">
                    <el-switch v-model="systemSettings.notification.enableEmail" />
                  </el-form-item>
                  <el-form-item label="短信通知">
                    <el-switch v-model="systemSettings.notification.enableSms" />
                  </el-form-item>
                  <el-form-item label="系统通知">
                    <el-switch v-model="systemSettings.notification.enableSystem" />
                  </el-form-item>
                  <el-form-item label="SMTP服务器">
                    <el-input v-model="systemSettings.notification.smtpServer" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </template>

    <!-- 系统监控标签页 -->
    <template #tab-monitor>
      <div class="monitor-content">
        <div class="monitor-header">
          <h3>系统监控</h3>
          <div class="header-actions">
            <el-button @click="refreshMonitorData">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </div>

        <!-- 系统性能图表 -->
        <div class="performance-charts">
          <div class="chart-row">
            <div class="chart-container">
              <h4>CPU使用率</h4>
              <div ref="cpuChart" class="chart"></div>
            </div>
            <div class="chart-container">
              <h4>内存使用率</h4>
              <div ref="memoryChart" class="chart"></div>
            </div>
          </div>
          <div class="chart-row">
            <div class="chart-container full-width">
              <h4>网络流量</h4>
              <div ref="networkChart" class="chart"></div>
            </div>
          </div>
        </div>

        <!-- 服务状态 -->
        <div class="services-status">
          <h4>服务状态监控</h4>
          <div class="services-grid">
            <div class="service-card" v-for="service in systemServices" :key="service.id">
              <div class="service-header">
                <div class="service-icon" :class="service.status">{{ service.icon }}</div>
                <h5>{{ service.name }}</h5>
                <div class="service-status" :class="service.status">
                  {{ getServiceStatusText(service.status) }}
                </div>
              </div>
              <div class="service-details">
                <div class="detail-row">
                  <span>版本:</span>
                  <span>{{ service.version }}</span>
                </div>
                <div class="detail-row">
                  <span>运行时间:</span>
                  <span>{{ service.uptime }}</span>
                </div>
                <div class="detail-row">
                  <span>最后检查:</span>
                  <span>{{ service.lastCheck }}</span>
                </div>
              </div>
              <div class="service-actions">
                <el-button size="small" @click="restartService(service)">
                  重启
                </el-button>
                <el-button size="small" type="primary" @click="viewServiceLogs(service)">
                  查看日志
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 数据备份标签页 -->
    <template #tab-backup>
      <div class="backup-content">
        <div class="backup-header">
          <h3>数据备份管理</h3>
          <div class="header-actions">
            <el-button type="primary" @click="createBackup">
              <el-icon><Upload /></el-icon>
              立即备份
            </el-button>
          </div>
        </div>

        <!-- 备份统计 -->
        <div class="backup-stats">
          <div class="stat-item">
            <h4>总备份数</h4>
            <div class="value">{{ backupStats.totalBackups || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>本月备份</h4>
            <div class="value">{{ backupStats.monthlyBackups || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>备份大小</h4>
            <div class="value">{{ backupStats.totalSize || '0MB' }}</div>
          </div>
          <div class="stat-item">
            <h4>最后备份</h4>
            <div class="value">{{ backupStats.lastBackup || '未备份' }}</div>
          </div>
        </div>

        <!-- 备份列表 -->
        <div class="backup-list">
          <el-table :data="backups" stripe>
            <el-table-column prop="name" label="备份名称" />
            <el-table-column prop="type" label="备份类型">
              <template #default="{ row }">
                <el-tag>{{ getBackupTypeText(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="文件大小" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getBackupStatusType(row.status)">
                  {{ getBackupStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="downloadBackup(row)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" type="warning" @click="restoreBackup(row)">
                  <el-icon><RefreshRight /></el-icon>
                  恢复
                </el-button>
                <el-button size="small" type="danger" @click="deleteBackup(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- 系统日志标签页 -->
    <template #tab-logs>
      <div class="logs-content">
        <div class="logs-header">
          <h3>系统日志管理</h3>
          <div class="header-actions">
            <el-select v-model="logFilter.level" placeholder="选择日志级别">
              <el-option label="全部" value="" />
              <el-option label="信息" value="info" />
              <el-option label="警告" value="warning" />
              <el-option label="错误" value="error" />
              <el-option label="调试" value="debug" />
            </el-select>
            <el-button @click="refreshLogs">
              <el-icon><Refresh /></el-icon>
              刷新日志
            </el-button>
            <el-button @click="exportLogs">
              <el-icon><Download /></el-icon>
              导出日志
            </el-button>
          </div>
        </div>

        <!-- 日志列表 -->
        <div class="logs-list">
          <el-table :data="systemLogs" stripe max-height="600">
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="getLogLevelType(row.level)">
                  {{ row.level.toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="module" label="模块" width="120" />
            <el-table-column prop="message" label="消息" />
            <el-table-column prop="user" label="用户" width="100" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="viewLogDetails(row)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
  </CenterContainer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Monitor, Timer, User, Cpu, FolderOpened, TrendCharts, SuccessFilled,
  View, Edit, Refresh, Check, Upload, Download, RefreshRight, Delete
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import ActionCard from '@/components/centers/ActionCard.vue'
import request from '@/utils/request'

// 路由
const router = useRouter()
const route = useRoute()

// 标签页配置
const tabs = [
  { key: 'overview', label: '概览' },
  { key: 'users', label: '用户管理' },
  { key: 'settings', label: '系统配置' },
  { key: 'monitor', label: '系统监控' },
  { key: 'backup', label: '数据备份' },
  { key: 'logs', label: '系统日志' }
]

// 当前激活的标签页
const activeTab = ref('overview')

// 系统配置子标签页
const activeSettingsTab = ref('basic')

// 组件引用
const cpuChart = ref()
const memoryChart = ref()
const networkChart = ref()

// 统计数据
const stats = ref({
  uptime: null,
  onlineUsers: null,
  systemLoad: null,
  storageUsage: null,
  userGrowth: null,
  loading: true,
  error: null
})

// 快速操作配置
const quickActions = ref([
  { key: 'system-monitor', title: '系统监控', description: '查看系统运行状态', icon: 'Monitor', color: 'primary' },
  { key: 'user-management', title: '用户管理', description: '管理系统用户和权限', icon: 'User', color: 'success' },
  { key: 'system-settings', title: '系统配置', description: '配置系统参数和设置', icon: 'Setting', color: 'warning' },
  { key: 'backup-data', title: '数据备份', description: '创建系统数据备份', icon: 'FolderOpened', color: 'info' },
  { key: 'view-logs', title: '查看日志', description: '查看系统运行日志', icon: 'Document', color: 'danger' }
])

// 用户管理数据
const users = ref([])
const userStats = ref({
  totalUsers: 0,
  activeUsers: 0,
  adminUsers: 0,
  newUsersToday: 0
})

// 系统配置数据
const systemSettings = ref({
  basic: {
    systemName: '幼儿园管理系统',
    systemDescription: '专业的幼儿园综合管理平台',
    systemVersion: '1.0.0',
    maintenanceMode: false
  },
  security: {
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    sessionTimeout: 120,
    enableTwoFactor: false
  },
  notification: {
    enableEmail: true,
    enableSms: false,
    enableSystem: true,
    smtpServer: ''
  }
})

// 系统服务数据
const systemServices = ref([])

// 备份数据
const backups = ref([])
const backupStats = ref({
  totalBackups: 0,
  monthlyBackups: 0,
  totalSize: '0MB',
  lastBackup: '未备份'
})

// 系统日志数据
const systemLogs = ref([])
const logFilter = ref({
  level: '',
  startDate: '',
  endDate: ''
})

// 切换标签页
const handleTabChange = async (tabKey: string) => {
  activeTab.value = tabKey
  console.log('切换到标签页:', tabKey)

  // 根据标签页按需加载数据
  switch (tabKey) {
    case 'users':
      if (users.value.length === 0) {
        await fetchUsers()
      }
      break
    case 'settings':
      await fetchSystemSettings()
      break
    case 'monitor':
      await fetchSystemServices()
      nextTick(() => {
        setTimeout(initMonitorCharts, 300)
      })
      break
    case 'backup':
      if (backups.value.length === 0) {
        await fetchBackups()
      }
      break
    case 'logs':
      if (systemLogs.value.length === 0) {
        await fetchSystemLogs()
      }
      break
  }
}

const switchToTab = (tabName: string) => {
  activeTab.value = tabName
}

// 获取系统统计数据
const fetchSystemStats = async () => {
  try {
    console.log('🔄 开始获取系统中心统计数据...')
    stats.value.loading = true
    stats.value.error = null

    const response = await request.get('/statistics', {
      params: {
        module: 'system',
        type: 'overview'
      }
    })

    console.log('📊 系统统计API响应:', response)

    if (response.success && response.data) {
      const systemData = response.data

      stats.value.uptime = systemData.uptime || '0天'
      stats.value.onlineUsers = systemData.onlineUsers || 0
      stats.value.systemLoad = systemData.systemLoad || 0
      stats.value.storageUsage = systemData.storageUsage || 0
      stats.value.userGrowth = systemData.userGrowth || 0

      stats.value.loading = false
      console.log('✅ 系统中心统计数据更新成功:', stats.value)
    } else {
      console.warn('⚠️ API响应格式异常:', response)
      stats.value.loading = false
      stats.value.error = 'API响应格式异常'
    }
  } catch (error) {
    console.error('❌ 获取系统中心统计数据失败:', error)
    stats.value.loading = false
    stats.value.error = '数据加载失败'
  }
}

// 获取用户数据
const fetchUsers = async () => {
  try {
    const response = await request.get('/system/users')
    if (response.success && response.data) {
      users.value = response.data.data || response.data || []
      userStats.value = response.data.stats || userStats.value
    }
  } catch (error) {
    console.error('获取用户数据失败:', error)
    ElMessage.error('获取用户数据失败')
  }
}

// 获取系统配置
const fetchSystemSettings = async () => {
  try {
    const response = await request.get('/system/settings')
    if (response.success && response.data) {
      systemSettings.value = { ...systemSettings.value, ...response.data }
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
    ElMessage.error('获取系统配置失败')
  }
}

// 获取系统服务状态
const fetchSystemServices = async () => {
  try {
    const response = await request.get('/system/services')
    if (response.success && response.data) {
      systemServices.value = response.data.data || response.data || []
    }
  } catch (error) {
    console.error('获取系统服务状态失败:', error)
    ElMessage.error('获取系统服务状态失败')
  }
}

// 获取备份数据
const fetchBackups = async () => {
  try {
    const response = await request.get('/system/backups')
    if (response.success && response.data) {
      backups.value = response.data.data || response.data || []
      backupStats.value = response.data.stats || backupStats.value
    }
  } catch (error) {
    console.error('获取备份数据失败:', error)
    ElMessage.error('获取备份数据失败')
  }
}

// 获取系统日志
const fetchSystemLogs = async () => {
  try {
    const response = await request.get('/system/logs', {
      params: logFilter.value
    })
    if (response.success && response.data) {
      systemLogs.value = response.data.data || response.data || []
    }
  } catch (error) {
    console.error('获取系统日志失败:', error)
    ElMessage.error('获取系统日志失败')
  }
}

// 处理快速操作
const handleQuickAction = (actionKey: string) => {
  switch (actionKey) {
    case 'system-check':
      handleSystemCheck()
      break
    case 'user-management':
      switchToTab('users')
      break
    case 'system-settings':
      switchToTab('settings')
      break
    case 'backup-data':
      switchToTab('backup')
      break
    case 'view-logs':
      switchToTab('logs')
      break
    default:
      console.warn('未知的快速操作:', actionKey)
  }
}

// 系统检查
const handleSystemCheck = () => {
  ElMessage.success('正在执行系统检查...')
}

// 用户管理操作
const handleCreateUser = () => {
  ElMessage.success('跳转到用户创建页面')
}

const viewUser = (user: any) => {
  ElMessage.info(`查看用户: ${user.username}`)
}

const editUser = (user: any) => {
  ElMessage.info(`编辑用户: ${user.username}`)
}

const toggleUserStatus = (user: any) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`用户 ${user.username} 已${newStatus === 'active' ? '启用' : '停用'}`)
}

// 系统配置操作
const refreshSettings = async () => {
  await fetchSystemSettings()
  ElMessage.success('配置已刷新')
}

const saveSettings = async () => {
  try {
    const response = await request.put('/system/settings', systemSettings.value)
    if (response.success) {
      ElMessage.success('配置保存成功')
    } else {
      ElMessage.error('配置保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('配置保存失败')
  }
}

// 监控操作
const refreshMonitorData = async () => {
  await fetchSystemServices()
  await fetchSystemStats()
  ElMessage.success('监控数据已刷新')
}

const restartService = (service: any) => {
  ElMessageBox.confirm(
    `确定要重启服务 "${service.name}" 吗？`,
    '确认重启',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`服务 ${service.name} 重启成功`)
  }).catch(() => {
    // 用户取消
  })
}

const viewServiceLogs = (service: any) => {
  ElMessage.info(`查看服务 ${service.name} 的日志`)
}

// 备份操作
const createBackup = () => {
  ElMessageBox.confirm(
    '确定要创建系统备份吗？这可能需要几分钟时间。',
    '确认备份',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('备份任务已开始，请稍候...')
  }).catch(() => {
    // 用户取消
  })
}

const downloadBackup = (backup: any) => {
  ElMessage.info(`下载备份: ${backup.name}`)
}

const restoreBackup = (backup: any) => {
  ElMessageBox.confirm(
    `确定要恢复备份 "${backup.name}" 吗？这将覆盖当前数据！`,
    '确认恢复',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`正在恢复备份: ${backup.name}`)
  }).catch(() => {
    // 用户取消
  })
}

const deleteBackup = (backup: any) => {
  ElMessageBox.confirm(
    `确定要删除备份 "${backup.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    ElMessage.success(`备份 ${backup.name} 已删除`)
  }).catch(() => {
    // 用户取消
  })
}

// 日志操作
const refreshLogs = async () => {
  await fetchSystemLogs()
  ElMessage.success('日志已刷新')
}

const exportLogs = () => {
  ElMessage.info('正在导出日志文件...')
}

const viewLogDetails = (log: any) => {
  ElMessage.info(`查看日志详情: ${log.message}`)
}

// 状态转换函数
const getLoadStatus = (load: number) => {
  if (load > 80) return 'negative'
  if (load > 60) return 'warning'
  return 'positive'
}

const getLoadStatusText = (load: number) => {
  if (load > 80) return '负载过高'
  if (load > 60) return '负载较高'
  return '负载正常'
}

const getStorageStatus = (usage: number) => {
  if (usage > 85) return 'negative'
  if (usage > 70) return 'warning'
  return 'positive'
}

const getStorageStatusText = (usage: number) => {
  if (usage > 85) return '空间不足'
  if (usage > 70) return '空间偏少'
  return '空间充足'
}

const getUserRoleType = (role: string) => {
  const roleMap: Record<string, string> = {
    'admin': 'danger',
    'manager': 'warning',
    'teacher': 'primary',
    'parent': 'info'
  }
  return roleMap[role] || 'info'
}

const getUserRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    'admin': '管理员',
    'manager': '园长',
    'teacher': '教师',
    'parent': '家长'
  }
  return roleMap[role] || '未知'
}

const getUserStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'warning',
    'blocked': 'danger'
  }
  return statusMap[status] || 'info'
}

const getUserStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '正常',
    'inactive': '停用',
    'blocked': '锁定'
  }
  return statusMap[status] || '未知'
}

const getServiceStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'running': '运行中',
    'stopped': '已停止',
    'error': '异常'
  }
  return statusMap[status] || '未知'
}

const getBackupTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'full': '完整备份',
    'incremental': '增量备份',
    'differential': '差异备份'
  }
  return typeMap[type] || '未知'
}

const getBackupStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'completed': 'success',
    'running': 'warning',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

const getBackupStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'completed': '完成',
    'running': '进行中',
    'failed': '失败'
  }
  return statusMap[status] || '未知'
}

const getLogLevelType = (level: string) => {
  const levelMap: Record<string, string> = {
    'info': 'primary',
    'warning': 'warning',
    'error': 'danger',
    'debug': 'info'
  }
  return levelMap[level] || 'info'
}

// 初始化监控图表
const initMonitorCharts = () => {
  setTimeout(() => {
    console.log('🔄 开始初始化系统监控图表...')

    // CPU使用率图表
    if (cpuChart.value) {
      const cpuChartInstance = echarts.init(cpuChart.value)
      const cpuOption = {
        title: { text: '' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
        },
        yAxis: { type: 'value', max: 100 },
        series: [{
          name: 'CPU使用率',
          type: 'line',
          data: [45, 38, 65, 72, 55, 48],
          smooth: true,
          itemStyle: { color: 'var(--primary-color)' }
        }]
      }
      cpuChartInstance.setOption(cpuOption)
    }

    // 内存使用率图表
    if (memoryChart.value) {
      const memoryChartInstance = echarts.init(memoryChart.value)
      const memoryOption = {
        title: { text: '' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
        },
        yAxis: { type: 'value', max: 100 },
        series: [{
          name: '内存使用率',
          type: 'line',
          data: [60, 55, 70, 68, 75, 65],
          smooth: true,
          itemStyle: { color: 'var(--success-color)' }
        }]
      }
      memoryChartInstance.setOption(memoryOption)
    }

    // 网络流量图表
    if (networkChart.value) {
      const networkChartInstance = echarts.init(networkChart.value)
      const networkOption = {
        title: { text: '' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['上行', '下行'] },
        xAxis: {
          type: 'category',
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '上行',
            type: 'line',
            data: [120, 132, 101, 134, 90, 230],
            smooth: true
          },
          {
            name: '下行',
            type: 'line',
            data: [220, 182, 191, 234, 290, 330],
            smooth: true
          }
        ]
      }
      networkChartInstance.setOption(networkOption)
    }
  }, 500)
}

// 组件挂载时加载数据
onMounted(async () => {
  console.log(`🔄 系统中心组件挂载，默认标签页: ${activeTab.value}`)
  
  // 加载基础统计数据
  await fetchSystemStats()
  
  // 根据当前标签页加载对应数据
  if (activeTab.value === 'overview') {
    // 概览页面需要一些基础数据
    await Promise.all([
      fetchUsers(),
      fetchSystemServices()
    ])
  }
})
</script>

<style scoped lang="scss">
// 概览页面样式
.overview-content {
  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xl, 2rem) var(--spacing-lg, 1.5rem);
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.1) 100%);
    border-radius: var(--border-radius-lg, var(--text-sm));
    border: var(--border-width-base) solid rgba(64, 158, 255, 0.2);
    margin-bottom: var(--spacing-lg, 1.5rem);

    .welcome-content {
      flex: 1;
      text-align: left;

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-md, 1rem) 0;
        background: linear-gradient(135deg, var(--primary-color), var(--success-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        font-size: 1rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
        max-width: 600px;
      }
    }

    .header-actions {
      flex-shrink: 0;
      margin-left: 2rem;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: var(--text-2xl);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
    border-radius: var(--text-sm);
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    &:nth-child(2) {
      background: linear-gradient(135deg, var(--warning-color) 0%, var(--danger-color) 100%);
    }

    &:nth-child(3) {
      background: linear-gradient(135deg, var(--text-secondary) 0%, var(--text-regular) 100%);
    }

    &:nth-child(4) {
      background: linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%);
    }

    .stat-icon {
      font-size: var(--text-5xl);
      margin-right: var(--spacing-4xl);
      opacity: 0.8;
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: var(--spacing-3xl);
        font-weight: 700;
        margin-bottom: var(--spacing-base);
      }

      .stat-label {
        font-size: var(--text-base);
        opacity: 0.9;
        margin-bottom: var(--spacing-base);
      }

      .stat-trend {
        display: flex;
        align-items: center;
        font-size: var(--text-sm);
        opacity: 0.8;

        &.positive { color: var(--success-color); }
        &.negative { color: var(--danger-color); }
        &.warning { color: var(--warning-color); }

        .el-icon {
          margin-right: var(--spacing-xs);
        }
      }
    }
  }

  .quick-actions {
    .actions-header {
      margin-bottom: var(--text-lg);

      h3 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-lg);
    }
  }
}

// 用户管理页面样式
.users-content {
  .users-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }
  }

  .user-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);

    .stat-item {
      text-align: center;
      padding: var(--text-2xl);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);

      h4 {
        margin: 0 0 10px 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }

      .value {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

// 系统配置页面样式
.settings-content {
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .settings-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: var(--text-2xl);
    }

    .settings-form {
      background: white;
      padding: var(--text-3xl);
      border-radius: var(--spacing-sm);
      border: var(--border-width-base) solid #eee;
    }
  }
}

// 系统监控页面样式
.monitor-content {
  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }
  }

  .performance-charts {
    margin-bottom: var(--spacing-8xl);

    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--text-2xl);
      margin-bottom: var(--text-2xl);

      &:last-child {
        margin-bottom: 0;
      }

      .chart-container {
        background: var(--bg-gray-light);
        padding: var(--text-2xl);
        border-radius: var(--spacing-sm);

        &.full-width {
          grid-column: 1 / -1;
        }

        h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          font-size: var(--text-lg);
        }

        .chart {
          width: 100%;
          height: 300px;
          min-height: 300px;
        }
      }
    }
  }

  .services-status {
    h4 {
      margin: 0 0 var(--text-2xl) 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--text-2xl);
    }

    .service-card {
      background: white;
      border-radius: var(--spacing-sm);
      padding: var(--text-2xl);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      border: var(--border-width-base) solid #eee;

      .service-header {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-4xl);

        .service-icon {
          font-size: var(--text-3xl);
          margin-right: var(--text-sm);

          &.running { color: var(--success-color); }
          &.stopped { color: var(--info-color); }
          &.error { color: var(--danger-color); }
        }

        h5 {
          flex: 1;
          margin: 0;
          color: var(--text-primary);
        }

        .service-status {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--spacing-xs);
          font-size: var(--text-sm);

          &.running {
            background: #f0f9ff;
            color: var(--success-color);
          }

          &.stopped {
            background: var(--bg-secondary);
            color: var(--info-color);
          }

          &.error {
            background: #fef0f0;
            color: var(--danger-color);
          }
        }
      }

      .service-details {
        margin-bottom: var(--spacing-4xl);

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-base);
          font-size: var(--text-base);

          span:first-child {
            color: var(--text-secondary);
          }

          span:last-child {
            color: var(--text-primary);
          }
        }
      }

      .service-actions {
        display: flex;
        gap: var(--spacing-2xl);
      }
    }
  }
}

// 备份管理页面样式
.backup-content {
  .backup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }
  }

  .backup-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);

    .stat-item {
      text-align: center;
      padding: var(--text-2xl);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);

      h4 {
        margin: 0 0 10px 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }

      .value {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

// 日志管理页面样式
.logs-content {
  .logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
      align-items: center;
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .overview-content .stats-grid {
    grid-template-columns: 1fr;
  }

  .user-stats,
  .backup-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .performance-charts .chart-row {
    grid-template-columns: 1fr;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>