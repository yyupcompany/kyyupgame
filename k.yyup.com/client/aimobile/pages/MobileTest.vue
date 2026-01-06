<!--
  移动端功能测试页面
  用于验证认证和仪表盘功能
-->

<template>
  <div class="mobile-test-page">
    <div class="test-header">
      <h1>🧪 移动端功能测试</h1>
      <p>测试统一认证和仪表盘功能</p>
    </div>

    <!-- 认证状态测试 -->
    <div class="test-section">
      <h2>🔐 认证状态测试</h2>
      <div class="test-item">
        <span class="test-label">登录状态：</span>
        <span :class="['test-value', unifiedAuth.isAuthenticated ? 'success' : 'error']">
          {{ unifiedAuth.isAuthenticated ? '已登录' : '未登录' }}
        </span>
      </div>
      <div class="test-item">
        <span class="test-label">用户角色：</span>
        <span class="test-value">{{ unifiedAuth.role || '未知' }}</span>
      </div>
      <div class="test-item">
        <span class="test-label">用户名称：</span>
        <span class="test-value">{{ unifiedAuth.user?.realName || unifiedAuth.user?.phone || '未知用户' }}</span>
      </div>
      <div class="test-item">
        <span class="test-label">租户信息：</span>
        <span class="test-value">{{ unifiedAuth.tenant?.tenantName || '无租户' }}</span>
      </div>
      <div class="test-item">
        <span class="test-label">权限数量：</span>
        <span class="test-value">{{ unifiedAuth.permissions?.length || 0 }} 个</span>
      </div>
    </div>

    <!-- 仪表盘API测试 -->
    <div class="test-section">
      <h2>📊 仪表盘API测试</h2>
      <div class="test-buttons">
        <button @click="testDashboardAPI" :disabled="loading" class="test-btn">
          测试仪表盘API
        </button>
        <button @click="testTasksAPI" :disabled="loading" class="test-btn">
          测试任务API
        </button>
        <button @click="testNotificationsAPI" :disabled="loading" class="test-btn">
          测试通知API
        </button>
      </div>

      <div v-if="apiResults.length > 0" class="api-results">
        <h3>API测试结果：</h3>
        <div v-for="(result, index) in apiResults" :key="index" class="api-result">
          <div :class="['result-header', result.success ? 'success' : 'error']">
            {{ result.name }} - {{ result.success ? '✅ 成功' : '❌ 失败' }}
          </div>
          <div class="result-content">
            <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作测试 -->
    <div class="test-section">
      <h2>⚡ 快速操作测试</h2>
      <div class="test-buttons">
        <button @click="goToLogin" class="test-btn">
          跳转登录页
        </button>
        <button @click="goToDashboard" class="test-btn" :disabled="!unifiedAuth.isAuthenticated">
          跳转仪表盘
        </button>
        <button @click="testLogout" class="test-btn danger" :disabled="!unifiedAuth.isAuthenticated">
          退出登录
        </button>
      </div>
    </div>

    <!-- 本地存储状态 -->
    <div class="test-section">
      <h2>💾 本地存储状态</h2>
      <div class="storage-info">
        <div class="test-item">
          <span class="test-label">Token存在：</span>
          <span :class="['test-value', hasToken ? 'success' : 'error']">
            {{ hasToken ? '✓' : '✗' }}
          </span>
        </div>
        <div class="test-item">
          <span class="test-label">用户信息：</span>
          <span :class="['test-value', hasUserInfo ? 'success' : 'error']">
            {{ hasUserInfo ? '✓' : '✗' }}
          </span>
        </div>
        <div class="test-item">
          <span class="test-label">租户信息：</span>
          <span :class="['test-value', hasTenantInfo ? 'success' : 'error']">
            {{ hasTenantInfo ? '✓' : '✗' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUnifiedAuth } from '../stores/unified-auth'
import { useUserStore } from '../../stores/user'
import { getDashboardData, getTodayTasks, getRecentNotifications } from '../api/mobile-dashboard'

const router = useRouter()
const unifiedAuth = useUnifiedAuth()
const userStore = useUserStore()

const loading = ref(false)
const apiResults = ref<any[]>([])

// 计算属性
const hasToken = computed(() => !!localStorage.getItem('access_token'))
const hasUserInfo = computed(() => !!localStorage.getItem('userInfo'))
const hasTenantInfo = computed(() => !!localStorage.getItem('current_tenant'))

// API测试方法
const testDashboardAPI = async () => {
  try {
    loading.value = true
    const response = await getDashboardData()
    addResult('仪表盘数据', response.success, response.data)
  } catch (error: any) {
    addResult('仪表盘数据', false, error.message)
  } finally {
    loading.value = false
  }
}

const testTasksAPI = async () => {
  try {
    loading.value = true
    const response = await getTodayTasks(5)
    addResult('今日任务', response.success, response.data)
  } catch (error: any) {
    addResult('今日任务', false, error.message)
  } finally {
    loading.value = false
  }
}

const testNotificationsAPI = async () => {
  try {
    loading.value = true
    const response = await getRecentNotifications(3)
    addResult('最新通知', response.success, response.data)
  } catch (error: any) {
    addResult('最新通知', false, error.message)
  } finally {
    loading.value = false
  }
}

// 辅助方法
const addResult = (name: string, success: boolean, data: any) => {
  apiResults.value.unshift({
    name,
    success,
    data: success ? data : { error: data },
    timestamp: new Date().toLocaleTimeString()
  })

  // 限制结果数量
  if (apiResults.value.length > 10) {
    apiResults.value = apiResults.value.slice(0, 10)
  }
}

// 导航方法
const goToLogin = () => {
  router.push('/mobile/login')
}

const goToDashboard = () => {
  router.push('/mobile/dashboard')
}

const testLogout = async () => {
  try {
    await unifiedAuth.logout()
    addResult('退出登录', true, '退出成功')
  } catch (error: any) {
    addResult('退出登录', false, error.message)
  }
}

// 生命周期
onMounted(async () => {
  console.log('🧪 移动端测试页面初始化')

  // 初始化认证状态
  await unifiedAuth.initializeAuth()

  console.log('📊 认证状态:', {
    isAuthenticated: unifiedAuth.isAuthenticated,
    user: unifiedAuth.user,
    role: unifiedAuth.role,
    tenant: unifiedAuth.tenant
  })
})
</script>

<style lang="scss" scoped>
.mobile-test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    color: #333;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 16px;
  }
}

.test-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #007bff;

  h2 {
    color: #333;
    margin-bottom: 20px;
    font-size: 18px;
  }
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
}

.test-label {
  font-weight: 500;
  color: #555;
}

.test-value {
  font-family: monospace;

  &.success {
    color: #28a745;
    font-weight: bold;
  }

  &.error {
    color: #dc3545;
    font-weight: bold;
  }
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.test-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &.danger {
    background: #dc3545;

    &:hover:not(:disabled) {
      background: #c82333;
    }
  }
}

.api-results {
  margin-top: 20px;
}

.api-result {
  background: white;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-header {
  padding: 12px 16px;
  font-weight: 500;

  &.success {
    background: #d4edda;
    color: #155724;
  }

  &.error {
    background: #f8d7da;
    color: #721c24;
  }
}

.result-content {
  padding: 16px;
  background: #f8f9fa;

  pre {
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 12px;
    margin: 0;
    color: #495057;
  }
}

.storage-info {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

// 响应式设计
@media (max-width: 768px) {
  .mobile-test-page {
    padding: 15px;
  }

  .test-section {
    padding: 15px;
  }

  .test-buttons {
    flex-direction: column;

    .test-btn {
      width: 100%;
    }
  }

  .test-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>