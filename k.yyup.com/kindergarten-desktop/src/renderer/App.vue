<template>
  <div id="app" class="kindergarten-app">
    <!-- 标题栏 -->
    <div v-if="isElectron" class="title-bar">
      <div class="title-bar-left">
        <span class="app-title">{{ appTitle }}</span>
      </div>
      <div class="title-bar-right">
        <button class="title-bar-button" @click="minimizeWindow">
          <el-icon><Minus /></el-icon>
        </button>
        <button class="title-bar-button" @click="maximizeWindow">
          <el-icon><CopyDocument /></el-icon>
        </button>
        <button class="title-bar-button close" @click="closeWindow">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <router-view />
    </div>

    <!-- 系统通知 -->
    <el-notification
      v-for="notification in notifications"
      :key="notification.id"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      :position="notification.position || 'top-right'"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Minus, CopyDocument, Close } from '@element-plus/icons-vue'

// 响应式数据
const appTitle = ref('幼儿园管理系统')
const isElectron = ref(false)
const notifications = ref([])

// 检查是否在Electron环境中
onMounted(() => {
  isElectron.value = typeof window !== 'undefined' && window.electronAPI

  if (isElectron.value) {
    // 监听服务器就绪事件
    window.electronAPI.onServerReady((event, data) => {
      console.log('服务器就绪:', data)
      // 设置API基础URL
      if (data.apiBase) {
        window.apiBaseURL = data.apiBase
      }
    })

    // 监听菜单事件
    window.electronAPI.onMenuDataImportExport(() => {
      showNotification('数据导入导出', '功能开发中...', 'info')
    })

    window.electronAPI.onMenuDatabaseManage(() => {
      showNotification('数据库管理', '功能开发中...', 'info')
    })

    window.electronAPI.onMenuSystemSettings(() => {
      showNotification('系统设置', '功能开发中...', 'info')
    })

    // 获取应用版本
    getAppVersion()
  }
})

onUnmounted(() => {
  if (isElectron.value) {
    // 移除所有监听器
    window.electronAPI.removeAllListeners('server-ready')
    window.electronAPI.removeAllListeners('menu-data-import-export')
    window.electronAPI.removeAllListeners('menu-database-manage')
    window.electronAPI.removeAllListeners('menu-system-settings')
  }
})

// 窗口控制方法
const minimizeWindow = async () => {
  if (isElectron.value) {
    await window.electronAPI.minimizeWindow()
  }
}

const maximizeWindow = async () => {
  if (isElectron.value) {
    await window.electronAPI.maximizeWindow()
  }
}

const closeWindow = async () => {
  if (isElectron.value) {
    await window.electronAPI.closeWindow()
  }
}

// 获取应用版本
const getAppVersion = async () => {
  if (isElectron.value) {
    try {
      const version = await window.electronAPI.getAppVersion()
      appTitle.value = `幼儿园管理系统 v${version}`
    } catch (error) {
      console.error('获取应用版本失败:', error)
    }
  }
}

// 显示通知
const showNotification = (title, message, type = 'info') => {
  const notification = {
    id: Date.now(),
    title,
    message,
    type
  }
  notifications.value.push(notification)

  // 3秒后自动移除
  setTimeout(() => {
    removeNotification(notification.id)
  }, 3000)
}

// 移除通知
const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  background-color: #f5f5f5;
}

.kindergarten-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 标题栏样式 */
.title-bar {
  height: 32px;
  background-color: #409eff;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  -webkit-app-region: drag;
  user-select: none;
}

.title-bar-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 14px;
  font-weight: 500;
}

.title-bar-right {
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
}

.title-bar-button {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.title-bar-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.title-bar-button.close:hover {
  background-color: #f56c6c;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow: hidden;
}

/* 全局样式 */
.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.el-menu--horizontal .el-menu-item.is-active {
  color: #409eff;
  border-bottom-color: #409eff;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 卡片样式 */
.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-card__header {
  padding: 18px 20px;
  border-bottom: 1px solid #ebeef5;
}

/* 表格样式 */
.el-table th {
  background-color: #fafafa;
  font-weight: 600;
}

/* 表单样式 */
.el-form-item__label {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title-bar {
    padding: 0 8px;
  }

  .app-title {
    font-size: 12px;
  }

  .title-bar-button {
    width: 28px;
    height: 28px;
  }
}
</style>