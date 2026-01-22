<template>
  <div class="modern-login-page">
    <!-- 全屏Loading遮罩 - 当入场动画播放时不显示 -->
    <div v-if="shouldShowLoading" class="fullscreen-loading">
      <div class="loading-spinner-large"></div>
    </div>

    <!-- 动态背景 -->
    <div class="animated-background">
      <div class="gradient-mesh"></div>
      <div class="floating-particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
      </div>
    </div>

    <!-- 主容器 -->
    <div class="login-container" :style="{ opacity: showEntranceAnimation ? 0 : 1, pointerEvents: showEntranceAnimation ? 'none' : 'auto', transition: 'opacity 0.3s ease' }">
      <div class="auth-panel">

      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <!-- Logo和品牌 -->
          <div class="brand-header">
            <div class="logo-container">
              <div class="logo-icon">
                <img src="@/assets/logo.png" alt="婴婴向上智能招生系统" class="logo-image" />
              </div>
            </div>
            <h1 class="brand-title">
              <span class="title-main">智慧幼儿园</span>
              <span class="title-sub">管理系统</span>
            </h1>
            <p class="brand-slogan">让教育更智能 · 让成长更美好</p>
          </div>

          <!-- 核心价值展示 -->
          <div class="core-values">
            <div class="value-item">
              <div class="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                  <path d="M2 17L12 22L22 17"/>
                  <path d="M2 12L12 17L22 12"/>
                </svg>
              </div>
              <div class="value-content">
                <h3>智慧管理</h3>
                <p>一站式数字化解决方案，提升园区运营效率</p>
              </div>
            </div>

            <div class="value-item">
              <div class="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6V12L16 14"/>
                </svg>
              </div>
              <div class="value-content">
                <h3>实时同步</h3>
                <p>家园互通，让家长随时了解孩子的成长动态</p>
              </div>
            </div>

            <div class="value-item">
              <div class="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div class="value-content">
                <h3>创新教学</h3>
                <p>AI赋能教育，开启个性化学习新体验</p>
              </div>
            </div>
          </div>

          <!-- 数据展示 -->
          <div class="stats-showcase">
            <div class="stat-item">
              <div class="stat-number">5000+</div>
              <div class="stat-label">合作园所</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50万+</div>
              <div class="stat-label">服务家庭</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">系统稳定性</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录区域 -->
      <div class="login-section">
        <div class="login-card">
          <!-- 登录表单头部 -->
          <div class="login-header">
            <div class="welcome-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <h2 class="login-title">欢迎登录</h2>
            <p class="login-subtitle">开启智慧教育新体验</p>
          </div>

          <!-- 登录方式切换 -->
          <div class="login-mode-toggle">
            <div class="toggle-tabs">
              <button
                class="tab-btn"
                :class="{ active: loginMode === 0 }"
                @click="toggleLoginMode(0)"
              >
                <div class="tab-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span>用户名登录</span>
              </button>
              <button
                class="tab-btn"
                :class="{ active: loginMode === 1 }"
                @click="toggleLoginMode(1)"
              >
                <div class="tab-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <span>手机号登录</span>
              </button>
            </div>
            <div class="toggle-indicator" :style="{ transform: `translateX(${loginMode * 100}%)` }"></div>
          </div>

          <!-- 登录表单 -->
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- 用户名/手机号输入 -->
            <div class="input-group" v-if="loginMode === 0">
              <div class="input-container">
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <input
                  v-model="loginForm.username"
                  type="text"
                  placeholder="请输入用户名"
                  :disabled="loading"
                  required
                  class="form-input"
                  :class="{ 'error': errors.username }"
                  autocomplete="username"
                  data-testid="username-input"
                />
              </div>
              <div v-if="errors.username" class="error-message">
                {{ errors.username }}
              </div>
            </div>

            <!-- 手机号输入 -->
            <div class="input-group" v-if="loginMode === 1">
              <div class="input-container">
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <input
                  v-model="loginForm.phone"
                  type="tel"
                  placeholder="请输入手机号"
                  :disabled="loading"
                  required
                  class="form-input"
                  :class="{ 'error': errors.phone }"
                  autocomplete="tel"
                  data-testid="phone-input"
                  maxlength="11"
                />
              </div>
              <div v-if="errors.phone" class="error-message">
                {{ errors.phone }}
              </div>
            </div>

            <!-- 租户代码输入（可选） -->
            <div class="input-group" v-if="loginMode === 1">
              <div class="input-container">
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <input
                  v-model="loginForm.tenantCode"
                  type="text"
                  placeholder="租户代码（可选）"
                  :disabled="loading"
                  class="form-input"
                  :class="{ 'error': errors.tenantCode }"
                  autocomplete="organization"
                  data-testid="tenant-code-input"
                />
              </div>
              <div v-if="errors.tenantCode" class="error-message">
                {{ errors.tenantCode }}
              </div>
              <div class="input-hint">
                可选填，如不填写将显示所有可用租户供选择
              </div>
            </div>

            <!-- 密码输入 -->
            <div class="input-group">
              <div class="input-container">
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"/>
                  </svg>
                </div>
                <input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :disabled="loading"
                  required
                  class="form-input"
                  :class="{ 'error': errors.password }"
                  autocomplete="current-password"
                  data-testid="password-input"
                />
              </div>
              <div v-if="errors.password" class="error-message">
                {{ errors.password }}
              </div>
            </div>

            <!-- 全局错误信息 -->
            <div v-if="globalError" class="global-error" data-testid="error-message">
              <div class="error-icon">⚠️</div>
              <span>{{ globalError }}</span>
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              class="login-btn"
              :disabled="loading"
              data-testid="login-button"
            >
              <span class="btn-text">立即登录</span>
              <div class="btn-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                </svg>
              </div>
            </button>
          </form>

          <!-- 租户选择弹窗 -->
          <div v-if="showTenantSelection" class="tenant-selection-overlay" @click.self="showTenantSelection = false">
            <div class="tenant-selection-modal">
              <div class="modal-header">
                <div class="modal-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h3 class="modal-title">选择租户</h3>
                <p class="modal-subtitle">您的手机号关联了多个租户，请选择要登录的租户</p>
              </div>

              <div class="tenant-list">
                <div
                  v-for="tenant in availableTenants"
                  :key="tenant.tenantCode"
                  class="tenant-item"
                  @click="selectTenant(tenant)"
                  :class="{ disabled: tenant.status !== 'active' }"
                >
                  <div class="tenant-info">
                    <div class="tenant-name">{{ tenant.tenantName }}</div>
                    <div class="tenant-code">{{ tenant.tenantCode }}</div>
                    <div class="tenant-meta">
                      <span class="tenant-domain">{{ tenant.domain }}</span>
                      <span class="tenant-status" :class="tenant.status">
                        {{ tenant.status === 'active' ? '正常' : '已停用' }}
                      </span>
                    </div>
                  </div>
                  <div class="tenant-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button class="cancel-btn" @click="showTenantSelection = false">
                  取消
                </button>
              </div>
            </div>
          </div>

          <!-- 快捷登录 -->
          <div class="quick-login">
            <div class="divider">
              <span class="divider-text">快速体验</span>
            </div>

            <div class="quick-description">
              <span class="quick-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </span>
              <span class="quick-text">选择角色，一键体验系统功能</span>
            </div>

            <div class="quick-buttons">
              <button
                class="quick-btn admin-btn"
                @click="quickLogin('admin')"
                :disabled="loading"
                title="体验完整系统管理功能"
              >
                <div class="btn-content">
                  <div class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="btn-info">
                    <div class="btn-title">系统管理员</div>
                    <div class="btn-desc">全局管理</div>
                  </div>
                </div>
              </button>

              <button
                class="quick-btn principal-btn"
                @click="quickLogin('principal')"
                :disabled="loading"
                title="体验园长管理功能"
              >
                <div class="btn-content">
                  <div class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="6"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                  </div>
                  <div class="btn-info">
                    <div class="btn-title">园长</div>
                    <div class="btn-desc">园区管理</div>
                  </div>
                </div>
              </button>

              <button
                class="quick-btn teacher-btn"
                @click="quickLogin('teacher')"
                :disabled="loading"
                title="体验教师工作功能"
              >
                <div class="btn-content">
                  <div class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <div class="btn-info">
                    <div class="btn-title">教师</div>
                    <div class="btn-desc">教学管理</div>
                  </div>
                </div>
              </button>

              <button
                class="quick-btn parent-btn"
                @click="quickLogin('parent')"
                :disabled="loading"
                title="体验家长服务功能"
              >
                <div class="btn-content">
                  <div class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M1 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    </svg>
                  </div>
                  <div class="btn-info">
                    <div class="btn-title">家长</div>
                    <div class="btn-desc">家园互动</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题适配入场动画 -->
    <EntranceAnimationWrapper
      :show="showEntranceAnimation"
      type="theme-adaptive"
      @complete="onEntranceAnimationComplete"
    />

    <!-- 角色选择弹窗（用于未注册用户） -->
    <RoleSelectionModal
      v-model="showRoleSelection"
      :tenant-name="pendingRegistrationTenantName"
      :available-roles-codes="pendingRegistrationRoles"
      @success="onRegistrationSuccess"
      @cancel="onRegistrationCancel"
    />
    </div>

    <div class="page-footer">
      <p>&copy; 2024 智慧幼儿园管理系统 · 让教育更智能</p>
      <p class="tech-support">
        <a :href="currentOrigin" target="_blank" rel="noopener noreferrer" class="tech-link">
          婴婴向上（北京）教育科技公司提供技术支持
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionsStore } from '@/stores/permissions-simple'
import { useAuthStore } from '@/store/modules/auth'
import { login } from '@/api/modules/user'
import DesignTokenManager from '@/config/design-tokens'
import AnimationConfigManager from '@/config/animation-config'
import EntranceAnimationWrapper from '@/components/EntranceAnimationWrapper.vue'
import RoleSelectionModal from '@/components/auth/RoleSelectionModal.vue'
import { useGlobalLoading, setGlobalLoading, setEntranceAnimationActive } from '@/composables/useGlobalLoading'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionsStore = usePermissionsStore()
const authStore = useAuthStore()

// 初始化全局loading管理
const { shouldShowLoading } = useGlobalLoading()

// 统一认证配置
const UNIFIED_AUTH_URL = import.meta.env.VITE_UNIFIED_AUTH_CENTER_URL || 'http://rent.yyup.cc'
const UNIFIED_AUTH_PORT = '5174' // 统一认证前端端口
const CURRENT_TENANT_URL = typeof window !== 'undefined' ? window.location.origin : '' // 当前租户系统URL

// 当前域名（用于模板）
const currentOrigin = computed(() => typeof window !== 'undefined' ? window.location.origin : '')

// 登录方式：0=用户名登录，1=手机号登录
const loginMode = ref(0)

// 表单数据
const loginForm = ref({
  username: '',
  phone: '',
  password: '',
  tenantCode: ''
})

// 租户选择相关状态
const showTenantSelection = ref(false)
const availableTenants = ref([])

// 角色选择相关状态（用于未注册用户）
const showRoleSelection = ref(false)
const pendingRegistrationTenantName = computed(() => authStore.pendingRegistration?.tenantName || '')
const pendingRegistrationRoles = computed(() => authStore.pendingRegistration?.availableRoles || ['principal', 'teacher', 'parent'])

// 登录模式切换
const toggleLoginMode = (mode: number) => {
  loginMode.value = mode
  globalError.value = ''
  clearErrors()
}

// 状态管理
const loading = ref(false)
const globalError = ref('')
const errors = ref({
  username: '',
  password: ''
})

// 添加一个用于防止重复显示错误消息的引用
const lastErrorMessage = ref('')
const lastErrorMessageTime = ref(0)

// 入场动画状态
const showEntranceAnimation = ref(false)

// 统一认证回调处理
const handleUnifiedAuthCallback = () => {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const tenantCode = urlParams.get('tenantCode')

  if (token) {
    console.log('✅ 检测到统一认证回调，token:', token.substring(0, 20) + '...')
    console.log('✅ 租户代码:', tenantCode)

    // 保存 token 到本地存储
    localStorage.setItem('kindergarten_token', token)
    if (tenantCode) {
      localStorage.setItem('tenant_code', tenantCode)
    }
    localStorage.setItem('unified_auth_mode', 'true')

    // 清除 URL 中的参数
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }

    // 跳转到首页
    ElMessage.success('登录成功，欢迎回来！')
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)

    return true
  }

  return false
}

// 重定向到统一认证中心
const redirectToUnifiedAuth = () => {
  console.log('🔄 重定向到统一认证中心...')
  console.log('统一认证URL:', `${UNIFIED_AUTH_URL}:${UNIFIED_AUTH_PORT}`)
  console.log('回调URL:', CURRENT_TENANT_URL)

  const redirectUrl = `${UNIFIED_AUTH_URL}:${UNIFIED_AUTH_PORT}/login?redirect=${encodeURIComponent(CURRENT_TENANT_URL)}`
  console.log('完整重定向URL:', redirectUrl)

  // 延迟重定向，确保用户能看到提示
  ElMessage.info('正在跳转到统一认证中心...')
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl
    }
  }, 500)
}

// 清除错误信息
const clearErrors = () => {
  errors.value.username = ''
  errors.value.phone = ''
  errors.value.password = ''
  errors.value.tenantCode = ''
}

// 表单验证
const validateForm = () => {
  clearErrors()
  globalError.value = ''

  let isValid = true

  if (loginMode.value === 0) {
    // 用户名登录验证
    if (!loginForm.value.username.trim()) {
      errors.value.username = '请输入用户名'
      isValid = false
    }
  } else {
    // 手机号登录验证
    if (!loginForm.value.phone.trim()) {
      errors.value.phone = '请输入手机号'
      isValid = false
    } else if (!/^1[3-9]\d{9}$/.test(loginForm.value.phone.trim())) {
      errors.value.phone = '请输入正确的手机号格式'
      isValid = false
    }

    // 租户代码验证（可选）
    if (loginForm.value.tenantCode.trim() && !/^[a-zA-Z0-9]{3,10}$/.test(loginForm.value.tenantCode.trim())) {
      errors.value.tenantCode = '租户代码格式不正确'
      isValid = false
    }
  }

  if (!loginForm.value.password.trim()) {
    errors.value.password = '请输入密码'
    isValid = false
  }

  return isValid
}

// 主登录处理函数
const handleLogin = async () => {
  console.log('🚀 开始登录流程...')

  if (!validateForm()) {
    console.log('❌ 表单验证失败')
    return
  }

  setGlobalLoading(true)
  globalError.value = ''

  try {
    let response

    if (loginMode.value === 0) {
      // 用户名登录 - 使用传统认证
      console.log('📡 用户名登录:', {
        username: loginForm.value.username,
        password: '***'
      })

      response = await login({
        username: loginForm.value.username,
        password: loginForm.value.password
      })

      if (response.success && response.data) {
        await processTraditionalLoginSuccess(response.data)
      } else {
        throw new Error(response.message || '登录失败')
      }
    } else {
      // 手机号登录 - 使用统一认证
      console.log('📡 手机号登录:', {
        phone: loginForm.value.phone,
        password: '***',
        tenantCode: loginForm.value.tenantCode || '不指定'
      })

      response = await authStore.flexibleLogin(
        loginForm.value.phone,
        loginForm.value.password,
        loginForm.value.tenantCode || undefined
      )

      await processUnifiedLoginSuccess(response)
    }

    console.log('✅ 登录响应:', response)

  } catch (error: any) {
    console.error('❌ 登录失败:', error)
    handleLoginError(error)
  } finally {
    setGlobalLoading(false)
  }
}


// 处理传统登录成功
const processTraditionalLoginSuccess = async (loginData: any) => {
  console.log('🎉 登录成功，处理用户数据:', loginData)
  console.log('🔍 loginData结构:', {
    hasToken: !!loginData.token,
    hasUser: !!loginData.user,
    userStructure: loginData.user ? Object.keys(loginData.user) : 'no user'
  })

  try {
    // 保存token到多个位置（兼容性）
    const token = loginData.token
    if (!token) {
      console.error('❌ Token缺失，loginData:', loginData)
      throw new Error('登录响应中缺少token')
    }

    localStorage.setItem('kindergarten_token', token)
    localStorage.setItem('token', token)
    localStorage.setItem('auth_token', token)

    console.log('✅ Token已保存到localStorage:', {
      kindergarten_token: !!localStorage.getItem('kindergarten_token'),
      token: !!localStorage.getItem('token'),
      auth_token: !!localStorage.getItem('auth_token')
    })

    // 保存用户信息到store - 适配后端返回的数据格式
    const userInfo = {
      token: token,
      username: loginData.user.username,
      displayName: loginData.user.realName || loginData.user.real_name || loginData.user.username,
      role: (loginData.user.role || loginData.user.user_role)?.toLowerCase() || 'user',  // 统一使用小写
      roles: loginData.user.roles || [loginData.user.role || loginData.user.user_role],
      permissions: loginData.user.permissions || (loginData.user.isAdmin ? ['*'] : []),
      email: loginData.user.email,
      avatar: loginData.user.avatar,
      id: loginData.user.id,
      isAdmin: loginData.user.isAdmin || loginData.user.role === 'admin' || loginData.user.user_role === 'admin',
      kindergartenId: loginData.user.kindergartenId || loginData.user.kindergarten_id,  // 支持两种命名格式
      status: 'active'
    }

    console.log('💾 保存用户信息到store:', userInfo)

    // 清除旧的权限数据，确保角色切换时权限正确更新
    permissionsStore.clearPermissions()
    userStore.setUserInfo(userInfo)

    // 保存用户信息到localStorage（持久化）- 保存到两个地方确保兼容性
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('kindergarten_user_info', JSON.stringify(userInfo))

    console.log('✅ 用户信息已保存到localStorage:', {
      userInfo: !!localStorage.getItem('userInfo'),
      kindergarten_user_info: !!localStorage.getItem('kindergarten_user_info'),
      userInfoContent: localStorage.getItem('userInfo') ? '有效' : '空'
    })

    ElMessage.success(`欢迎回来，${userInfo.displayName}！`)

    // 处理重定向 - 使用智能路由系统
    let redirectUrl = route.query.redirect as string

    if (!redirectUrl) {
      // 使用智能路由系统：根据设备类型和用户角色自动选择路由
      const { getLoginRedirectPath } = await import('@/router/smart-redirect')
      const { getActualDeviceType } = await import('@/utils/device-detect')
      
      const userRole = userInfo.role?.toLowerCase() as any
      const deviceType = getActualDeviceType()
      
      redirectUrl = getLoginRedirectPath(userRole)
      
      console.log('🎯 智能路由重定向:')
      console.log('  - 用户角色:', userRole)
      console.log('  - 设备类型:', deviceType)
      console.log('  - 跳转路径:', redirectUrl)
    }

    console.log('🔀 准备跳转到:', redirectUrl)

    // 🔧 修复：确保 Pinia 状态完全同步后再进行路由跳转
    await nextTick()
    
    // 验证登录状态是否正确设置
    console.log('🔍 验证登录状态:', {
      isLoggedIn: userStore.isLoggedIn,
      hasToken: !!userStore.token,
      hasUserInfo: !!userStore.user,
      username: userStore.user?.username
    })
    
    if (!userStore.isLoggedIn) {
      console.error('❌ 登录状态设置失败，尝试重新设置...')
      // 如果状态仍然不正确，等待一下再检查
      await new Promise(resolve => setTimeout(resolve, 50))
      
      if (!userStore.isLoggedIn) {
        console.error('❌ 登录状态仍然无效，可能是数据问题')
        throw new Error('登录状态设置失败')
      }
    }

    // 显示系统入场动画，然后跳转
    console.log('🎬 登录成功，开始显示系统入场动画')
    showEntranceAnimation.value = true
    setEntranceAnimationActive(true)

    // 🎯 改进的流程：动画 -> 跳转 -> 显示新页面
    // 给动画一个短暂的延迟以确保完全显示
    await new Promise(resolve => setTimeout(resolve, 100))

    // 立即执行路由跳转（使用 await 确保跳转完成）
    console.log('🎬 动画开始，执行路由跳转')
    try {
      await router.replace(redirectUrl)
      console.log('✅ 页面跳转完成')
      // 跳转后隐藏登录容器和动画
      showEntranceAnimation.value = false
      setEntranceAnimationActive(false)
    } catch (error) {
      console.error('❌ 路由跳转失败:', error)
      // 跳转失败时恢复显示登录页
      showEntranceAnimation.value = false
      setEntranceAnimationActive(false)
      throw error
    }

  } catch (error) {
    console.error('❌ 处理登录数据失败:', error)
    throw new Error('登录数据处理失败')
  }
}

// 处理统一认证登录成功
const processUnifiedLoginSuccess = async (loginResponse: any) => {
  console.log('🎉 统一认证登录成功:', loginResponse)

  try {
    // 检查是否需要注册（用户在统一认证存在但未绑定当前租户）
    if (authStore.needsRegistration) {
      console.log('🔄 用户需要注册到当前租户')
      console.log('📋 待注册信息:', authStore.pendingRegistration)
      showRoleSelection.value = true
      return
    }

    // 检查是否需要租户选择
    if (authStore.requiresTenantSelection && authStore.availableTenants.length > 0) {
      console.log('🔄 需要选择租户')
      availableTenants.value = authStore.availableTenants
      showTenantSelection.value = true
      return
    }

    // 检查是否需要租户绑定
    if (authStore.requiresTenantBinding) {
      console.log('🔄 需要绑定租户')
      ElMessage.info('您的账号需要绑定租户，请联系管理员')
      return
    }

    // 直接登录成功，处理后续流程
    await processLoginSuccessRedirect()
  } catch (error) {
    console.error('❌ 处理统一认证登录数据失败:', error)
    throw new Error('统一认证登录数据处理失败')
  }
}

// 选择租户处理
const selectTenant = async (tenant: any) => {
  console.log('🏢 选择租户:', tenant)

  try {
    authStore.selectTenant(tenant)
    showTenantSelection.value = false

    // 重新尝试登录
    await authStore.unifiedLogin(
      loginForm.value.phone,
      loginForm.value.password,
      tenant.tenantCode
    )

    await processLoginSuccessRedirect()
  } catch (error: any) {
    console.error('❌ 租户选择失败:', error)
    ElMessage.error(error.message || '租户选择失败')
  }
}

// 注册成功处理
const onRegistrationSuccess = async () => {
  console.log('✅ 注册成功，继续登录流程')
  showRoleSelection.value = false

  // 注册成功后，authStore 已经更新了用户信息和 token
  // 直接执行登录成功后的重定向
  await processLoginSuccessRedirect()
}

// 注册取消处理
const onRegistrationCancel = () => {
  console.log('❌ 用户取消注册')
  showRoleSelection.value = false
  ElMessage.info('您已取消注册，请重新登录')
}

// 登录成功后的重定向处理
const processLoginSuccessRedirect = async () => {
  // 构建用户信息（兼容现有系统）
  const currentUser = authStore.user
  const userInfo = {
    token: authStore.token,
    username: currentUser?.username || '',
    displayName: currentUser?.realName || currentUser?.username || '',
    role: currentUser?.role?.toLowerCase() || 'user',
    roles: currentUser?.roles || [currentUser?.role],
    permissions: currentUser?.permissions || [],
    email: currentUser?.email,
    avatar: currentUser?.avatar,
    id: currentUser?.id,
    isAdmin: currentUser?.role === 'admin',
    kindergartenId: currentUser?.kindergartenId,
    status: 'active',
    // 统一认证扩展信息
    isUnifiedAuth: authStore.isUnifiedAuth,
    globalUserId: authStore.globalUserId,
    currentTenant: authStore.currentTenant
  }

  console.log('💾 保存统一认证用户信息到store:', userInfo)
  // 清除旧的权限数据，确保角色切换时权限正确更新
  permissionsStore.clearPermissions()
  userStore.setUserInfo(userInfo)

  // 保存用户信息到localStorage
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
  localStorage.setItem('kindergarten_user_info', JSON.stringify(userInfo))

  ElMessage.success(`欢迎回来，${userInfo.displayName}！`)

  // 处理重定向
  let redirectUrl = route.query.redirect as string

  if (!redirectUrl) {
    const { getLoginRedirectPath } = await import('@/router/smart-redirect')
    const { getActualDeviceType } = await import('@/utils/device-detect')

    const userRole = userInfo.role?.toLowerCase() as any
    const deviceType = getActualDeviceType()

    redirectUrl = getLoginRedirectPath(userRole)

    console.log('🎯 智能路由重定向:')
    console.log('  - 用户角色:', userRole)
    console.log('  - 设备类型:', deviceType)
    console.log('  - 跳转路径:', redirectUrl)
  }

  console.log('🔀 准备跳转到:', redirectUrl)

  // 🔧 修复：确保 Pinia 状态完全同步后再进行路由跳转
  await nextTick()
  
  // 验证登录状态是否正确设置
  console.log('🔍 验证统一认证登录状态:', {
    isLoggedIn: userStore.isLoggedIn,
    hasToken: !!userStore.token,
    hasUserInfo: !!userStore.user,
    username: userStore.user?.username
  })
  
  if (!userStore.isLoggedIn) {
    console.error('❌ 统一认证登录状态设置失败，尝试重新设置...')
    await new Promise(resolve => setTimeout(resolve, 50))
    
    if (!userStore.isLoggedIn) {
      console.error('❌ 统一认证登录状态仍然无效')
      ElMessage.error('登录状态设置失败，请重试')
      return
    }
  }

  // 显示系统入场动画，然后跳转
  console.log('🎬 登录成功，开始显示系统入场动画')
  showEntranceAnimation.value = true
  setEntranceAnimationActive(true)

  await new Promise(resolve => setTimeout(resolve, 100))

  console.log('🎬 动画开始，执行路由跳转')
  try {
    await router.replace(redirectUrl)
    console.log('✅ 页面跳转完成')
    showEntranceAnimation.value = false
    setEntranceAnimationActive(false)
  } catch (error) {
    console.error('❌ 路由跳转失败:', error)
    showEntranceAnimation.value = false
    setEntranceAnimationActive(false)
  }
}

// 处理登录错误
const handleLoginError = (error: any) => {
  let errorMessage = '登录失败，请重试'

  if (error.response?.data?.message) {
    errorMessage = error.response.data.message
  } else if (error.message) {
    errorMessage = error.message
  }

  // 防止重复显示相同的错误消息（5秒内不重复显示相同消息）
  const now = Date.now()
  if (lastErrorMessage.value === errorMessage && now - lastErrorMessageTime.value < 5000) {
    // 如果是相同错误消息且在5秒内，则只更新全局错误状态，不显示ElMessage
    globalError.value = errorMessage
    return
  }

  // 更新最后错误消息和时间
  lastErrorMessage.value = errorMessage
  lastErrorMessageTime.value = now

  globalError.value = errorMessage
  ElMessage.error(errorMessage)

  console.error('Error details:', error)
}

// 快捷登录（使用真实后端API）
const quickLogin = async (role: string) => {
  console.log('⚡ 快捷登录:', role)
  loading.value = true
  setGlobalLoading(true)

  try {
    // 根据角色确定用户名
    const usernameMap: Record<string, string> = {
      admin: 'test_admin',
      principal: 'principal',
      teacher: 'teacher',
      parent: 'test_parent' // 使用test_parent，因为这个用户在数据库中有对应的照片数据
    }

    const username = usernameMap[role] || role
    const password = '123456' // 默认密码

    console.log(`🔐 调用真实登录API: ${username}`)

    // 🔧 修复：确保使用用户名登录模式
    loginMode.value = 0
    loginForm.value.username = username
    loginForm.value.password = password

    // 调用登录处理函数
    await handleLogin()
  } catch (error: any) {
    console.error('❌ 快捷登录失败:', error)
    ElMessage.error(error.message || '登录失败')
    loading.value = false
    setGlobalLoading(false)
  }
}

// 图片错误处理
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      parent.innerHTML = '<div class="logo-fallback">🏫</div>'
    }
  }
}

// 入场动画完成处理
let resolveAnimationComplete: (() => void) | null = null

const onEntranceAnimationComplete = () => {
  console.log('🎬 登录入场动画完成')
  showEntranceAnimation.value = false
  setEntranceAnimationActive(false)

  if (resolveAnimationComplete) {
    resolveAnimationComplete()
    resolveAnimationComplete = null
  }
}

// 组件挂载时的初始化
onMounted(() => {
  console.log('🔧 登录页面初始化')
  console.log('环境信息:', {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    redirectUrl: route.query.redirect
  })

  // 初始化设计令牌和动画配置CSS变量
  DesignTokenManager.applyCSSVariables()
  AnimationConfigManager.applyCSSVariables()

  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    console.log('🎨 应用保存的主题:', savedTheme)

    // 移除所有主题类
    const allThemes = ['theme-light', 'theme-dark', 'glass-light', 'glass-dark', 'glass-neon', 'glass-gradient']
    document.documentElement.classList.remove(...allThemes)
    document.body.classList.remove(...allThemes)
    document.documentElement.removeAttribute('data-theme')
    document.body.removeAttribute('data-theme')

    // 应用主题
    if (savedTheme.startsWith('glass-')) {
      document.documentElement.setAttribute('data-theme', savedTheme)
      document.body.setAttribute('data-theme', savedTheme)
      document.documentElement.classList.add(savedTheme)
      document.body.classList.add(savedTheme)
    } else {
      document.documentElement.classList.add(savedTheme)
      document.body.classList.add(savedTheme)
    }
  } else {
    // 默认应用明亮主题
    document.documentElement.classList.add('theme-light')
    document.body.classList.add('theme-light')
  }

  // 🔑 核心逻辑：检查是否来自统一认证的回调
  console.log('🔍 检查统一认证回调...')
  const hasToken = handleUnifiedAuthCallback()
  if (hasToken) {
    console.log('✅ 已处理统一认证回调，停止后续初始化')
    return
  }

  // 检查是否已经登录（支持传统认证和统一认证）
  const isLoggedIn = userStore.isLoggedIn || authStore.isAuthenticated
  if (isLoggedIn) {
    console.log('👤 用户已登录，自动跳转')
    console.log('  - 传统认证状态:', userStore.isLoggedIn)
    console.log('  - 统一认证状态:', authStore.isAuthenticated)
    console.log('  - 统一认证模式:', authStore.isUnifiedAuth)

    let redirectUrl = route.query.redirect as string

    if (!redirectUrl) {
      // 优先使用统一认证的用户角色，否则使用传统认证的角色
      const userRole = (authStore.user?.role || userStore.userInfo?.role)?.toLowerCase()
      console.log('🎯 检测到已登录用户角色:', userRole)

      switch (userRole) {
        case 'teacher':
          redirectUrl = '/teacher-center/dashboard'
          break
        case 'parent':
          redirectUrl = '/parent-center/dashboard'
          break
        case 'admin':
        case 'super_admin':
        case 'principal':
        default:
          redirectUrl = '/'
          break
      }
    }

    router.replace(redirectUrl)
    return
  }

  // 🚀 核心逻辑：判断是否需要重定向到统一认证中心
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const isDemoSystem = ['localhost', '127.0.0.1', 'k.yyup.cc', 'k.yyup.com'].includes(currentHostname)

  if (isDemoSystem) {
    console.log('🏠 Demo系统环境，使用本地认证，不重定向到统一认证中心')
    // Demo模式：显示本地登录表单，不重定向
  } else {
    console.log('⚠️ 非Demo环境且未登录，需要重定向到统一认证中心')
    redirectToUnifiedAuth()
  }
})
</script>

<style lang="scss" scoped>
// 导入独立样式文件
@use './login-styles.scss' as *;


</style>