<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <el-header class="dashboard-header">
      <div class="header-left">
        <h1 class="page-title">仪表板</h1>
        <p class="page-subtitle">欢迎使用幼儿园管理系统</p>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleUserMenu">
          <span class="user-info">
            <el-avatar :size="32" :src="user?.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="username">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主要内容 -->
    <el-main class="dashboard-main">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-icon users">
              <el-icon size="24"><User /></el-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats.users }}</h3>
              <p>用户总数</p>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-icon students">
              <el-icon size="24"><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats.students }}</h3>
              <p>学生总数</p>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-icon classes">
              <el-icon size="24"><School /></el-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats.classes }}</h3>
              <p>班级总数</p>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-icon activities">
              <el-icon size="24"><Trophy /></el-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats.activities }}</h3>
              <p>活动总数</p>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
      <el-row :gutter="20" class="actions-row">
        <el-col :span="24">
          <el-card class="actions-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">快捷操作</span>
                <el-button text type="primary" @click="showHelp">
                  <el-icon><QuestionFilled /></el-icon>
                  帮助
                </el-button>
              </div>
            </template>
            <div class="actions-grid">
              <div class="action-item" @click="navigateTo('/students')">
                <el-icon size="32" color="#409eff"><UserFilled /></el-icon>
                <span>学生管理</span>
              </div>
              <div class="action-item" @click="navigateTo('/classes')">
                <el-icon size="32" color="#67c23a"><School /></el-icon>
                <span>班级管理</span>
              </div>
              <div class="action-item" @click="navigateTo('/activities')">
                <el-icon size="32" color="#e6a23c"><Trophy /></el-icon>
                <span>活动管理</span>
              </div>
              <div class="action-item" @click="navigateTo('/attendance')">
                <el-icon size="32" color="#f56c6c"><Calendar /></el-icon>
                <span>考勤管理</span>
              </div>
              <div class="action-item" @click="navigateTo('/users')" v-if="isAdmin">
                <el-icon size="32" color="#909399"><User /></el-icon>
                <span>用户管理</span>
              </div>
              <div class="action-item" @click="showSystemInfo">
                <el-icon size="32" color="#606266"><Setting /></el-icon>
                <span>系统信息</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 系统状态 -->
      <el-row :gutter="20" class="status-row">
        <el-col :md="12">
          <el-card class="status-card">
            <template #header>
              <span class="card-title">系统状态</span>
            </template>
            <div class="status-list">
              <div class="status-item">
                <span class="status-label">数据库状态</span>
                <el-tag type="success" size="small">正常</el-tag>
              </div>
              <div class="status-item">
                <span class="status-label">API服务</span>
                <el-tag type="success" size="small">运行中</el-tag>
              </div>
              <div class="status-item">
                <span class="status-label">应用版本</span>
                <span class="status-value">{{ appVersion }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">运行环境</span>
                <span class="status-value">{{ platform === 'win32' ? 'Windows' : platform === 'darwin' ? 'macOS' : 'Linux' }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :md="12">
          <el-card class="status-card">
            <template #header>
              <span class="card-title">最近活动</span>
            </template>
            <div class="activity-list">
              <div class="activity-item">
                <el-icon size="16" color="#409eff"><InfoFilled /></el-icon>
                <span class="activity-text">系统启动成功</span>
                <span class="activity-time">刚刚</span>
              </div>
              <div class="activity-item">
                <el-icon size="16" color="#67c23a"><CircleCheckFilled /></el-icon>
                <span class="activity-text">数据库连接正常</span>
                <span class="activity-time">1分钟前</span>
              </div>
              <div class="activity-item">
                <el-icon size="16" color="#e6a23c"><WarningFilled /></el-icon>
                <span class="activity-text">欢迎使用桌面版</span>
                <span class="activity-time">2分钟前</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, UserFilled, School, Trophy, Calendar, Setting,
  ArrowDown, QuestionFilled, InfoFilled, CircleCheckFilled, WarningFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { request } from '@/utils/request'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const stats = ref({
  users: 0,
  students: 0,
  classes: 0,
  activities: 0
})

const appVersion = ref('1.0.0')
const platform = ref('')

// 计算属性
const user = computed(() => authStore.user)
const userName = computed(() => authStore.userName)
const isAdmin = computed(() => authStore.hasRole('admin'))

// 初始化
onMounted(async () => {
  // 获取系统信息
  if (window.electronAPI) {
    try {
      appVersion.value = await window.electronAPI.getAppVersion()
      platform.value = await window.electronAPI.getPlatform()
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }

  // 获取统计数据
  await fetchStats()
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await request.get('/database/stats')
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 设置默认值
    stats.value = { users: 1, students: 0, classes: 0, activities: 0 }
  }
}

// 导航到指定页面
const navigateTo = (path) => {
  router.push(path)
}

// 处理用户菜单
const handleUserMenu = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中...')
      break
    case 'settings':
      navigateTo('/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

// 显示帮助
const showHelp = () => {
  ElMessageBox.alert(
    '仪表板功能说明：\n\n' +
    '• 统计卡片：显示系统关键数据\n' +
    '• 快捷操作：快速访问常用功能\n' +
    '• 系统状态：监控系统运行状况\n' +
    '• 最近活动：查看系统操作记录\n\n' +
    '如需更多帮助，请查看用户手册。',
    '仪表板帮助',
    {
      type: 'info',
      confirmButtonText: '知道了'
    }
  )
}

// 显示系统信息
const showSystemInfo = async () => {
  try {
    const response = await request.get('/system/info')
    if (response.data.success) {
      const info = response.data.data
      const infoText = `应用信息:\n\n` +
        `版本: ${info.version}\n` +
        `环境: ${info.environment}\n` +
        `Node.js: ${info.nodeVersion}\n` +
        `平台: ${info.platform}\n` +
        `运行时间: ${Math.floor(info.uptime / 60)} 分钟`

      ElMessageBox.alert(infoText, '系统信息', {
        type: 'info',
        confirmButtonText: '确定'
      })
    }
  } catch (error) {
    ElMessage.error('获取系统信息失败')
  }
}
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.dashboard-header {
  background: white;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.dashboard-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.students {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.classes {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.activities {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.stat-content p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.actions-row {
  margin-bottom: 24px;
}

.actions-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.action-item span {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.status-row {
  margin-bottom: 24px;
}

.status-card .card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 14px;
  color: #495057;
}

.status-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-text {
  flex: 1;
  font-size: 14px;
  color: #495057;
}

.activity-time {
  font-size: 12px;
  color: #adb5bd;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .stats-row .el-col {
    margin-bottom: 16px;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-header {
    padding: 0 16px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .header-left .page-subtitle {
    display: none;
  }
}
</style>