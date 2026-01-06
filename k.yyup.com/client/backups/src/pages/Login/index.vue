<template>
  <div class="modern-login-page">
    <!-- 全屏Loading遮罩 -->
    <div v-if="loading" class="fullscreen-loading">
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
    <div class="login-container">
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

          <!-- 特色功能展示 -->
          <div class="features-showcase">
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <!-- 电话图标 -->
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3>电话呼叫</h3>
                <p>客情维护，新生邀约，不用工资的高级销售人员</p>
              </div>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <!-- AI助手图标 -->
                  <rect x="3" y="8" width="18" height="12" rx="2"/>
                  <circle cx="9" cy="14" r="1"/>
                  <circle cx="15" cy="14" r="1"/>
                  <path d="M9 8V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v2"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3>AI助手</h3>
                <p>全能AI助手，告别填表，策划，报表填写</p>
              </div>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <!-- 课程/书籍图标 -->
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3>创建课程</h3>
                <p>AI聊天即可生成多媒体互动课程（图片，视频，互动游戏），一句话就是生成，真正步入园本课程时代</p>
              </div>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <!-- 架构/网络图标 -->
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3>业务架构</h3>
                <p>以业务驱动，把幼儿园的招生和课程服务交付作为重点，全年计划了然于胸</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录区域 -->
      <div class="login-section">
        <div class="login-card">
          <!-- 登录表单头部 -->
          <div class="login-header">
            <h2 class="login-title">欢迎回来</h2>
            <p class="login-subtitle">请登录您的账户</p>
          </div>

          <!-- 登录表单 -->
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- 用户名输入 -->
            <div class="input-group">
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

          <!-- 快捷登录 -->
          <div class="quick-login">
            <div class="divider">
              <span class="divider-text">快捷登录</span>
            </div>

            <div class="quick-description">
              <span class="quick-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </span>
              <span class="quick-text">选择角色快速体验</span>
            </div>

            <div class="quick-buttons">
              <button
                class="quick-btn admin-btn"
                @click="quickLogin('admin')"
                :disabled="loading"
              >
                <div class="btn-content">
                  <div class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="btn-info">
                    <div class="btn-title">系统管理员</div>
                  </div>
                </div>
              </button>

              <button
                class="quick-btn principal-btn"
                @click="quickLogin('principal')"
                :disabled="loading"
              >
                <div class="btn-content">
                  <div class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="6"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                  </div>
                  <div class="btn-info">
                    <div class="btn-title">园长</div>
                  </div>
                </div>
              </button>

              <button
                class="quick-btn teacher-btn"
                @click="quickLogin('teacher')"
                :disabled="loading"
              >
                <div class="btn-content">
                  <div class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <div class="btn-info">
                    <div class="btn-title">教师</div>
                  </div>
                </div>
              </button>

              <button
                class="quick-btn parent-btn"
                @click="quickLogin('parent')"
                :disabled="loading"
              >
                <div class="btn-content">
                  <div class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M1 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    </svg>
                  </div>
                  <div class="btn-info">
                    <div class="btn-title">家长</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <div class="page-footer">
      <p>&copy; 2024 智慧幼儿园管理系统 · 让教育更智能</p>
      <p class="tech-support">
        <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" class="tech-link">
          婴婴向上（北京）教育科技公司提供技术支持
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/modules/user'
import DesignTokenManager from '@/config/design-tokens'
import AnimationConfigManager from '@/config/animation-config'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单数据
const loginForm = ref({
  username: '',
  password: ''
})

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

// 表单验证
const validateForm = () => {
  errors.value.username = ''
  errors.value.password = ''
  globalError.value = ''

  let isValid = true

  if (!loginForm.value.username.trim()) {
    errors.value.username = '请输入用户名'
    isValid = false
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

  loading.value = true
  globalError.value = ''

  try {
    console.log('📡 发送登录请求:', {
      username: loginForm.value.username,
      password: '***'
    })

    // 直接调用后端API进行验证
    console.log('🔧 连接后端进行用户验证')
    const response = await login({
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    console.log('✅ 登录响应:', response)

    if (response.success && response.data) {
      await processLoginSuccess(response.data)
    } else {
      throw new Error(response.message || '登录失败')
    }

  } catch (error: any) {
    console.error('❌ 登录失败:', error)
    handleLoginError(error)
  } finally {
    loading.value = false
  }
}


// 处理登录成功
const processLoginSuccess = async (loginData: any) => {
  console.log('🎉 登录成功，处理用户数据:', loginData)

  try {
    // 保存token到多个位置（兼容性）
    const token = loginData.token
    localStorage.setItem('kindergarten_token', token)
    localStorage.setItem('token', token)
    localStorage.setItem('auth_token', token)

    // 保存用户信息到store - 适配后端返回的数据格式
    const userInfo = {
      token: token,
      username: loginData.user.username,
      displayName: loginData.user.realName || loginData.user.username,
      role: loginData.user.role?.toLowerCase() || 'user',  // 统一使用小写
      roles: loginData.user.roles || [loginData.user.role],
      permissions: loginData.user.permissions || (loginData.user.isAdmin ? ['*'] : []),
      email: loginData.user.email,
      avatar: loginData.user.avatar,
      id: loginData.user.id,
      isAdmin: loginData.user.isAdmin || loginData.user.role === 'admin',
      kindergartenId: loginData.user.kindergartenId,  // ✅ 添加kindergartenId字段
      status: 'active'
    }

    console.log('💾 保存用户信息到store:', userInfo)
    userStore.setUserInfo(userInfo)

    // 保存用户信息到localStorage（持久化）- 保存到两个地方确保兼容性
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('kindergarten_user_info', JSON.stringify(userInfo))

    ElMessage.success(`欢迎回来，${userInfo.displayName}！`)

    // 处理重定向 - 根据用户角色决定跳转页面
    let redirectUrl = route.query.redirect as string

    if (!redirectUrl) {
      // 根据用户角色设置默认跳转页面
      const userRole = userInfo.role?.toLowerCase()
      console.log('🎯 检测到用户角色:', userRole)

      switch (userRole) {
        case 'teacher':
          // 教师跳转到教师中心仪表板
          redirectUrl = '/teacher-center/dashboard'
          console.log('👩‍🏫 教师角色，跳转到教师中心仪表板')
          break
        case 'parent':
          // 家长跳转到家长中心首页
          redirectUrl = '/parent-center/dashboard'
          console.log('👨‍👩‍👧‍👦 家长角色，跳转到家长中心首页')
          break
        case 'principal':
          // 园长跳转到dashboard（统一使用dashboard）
          redirectUrl = '/dashboard'
          console.log('🎯 园长角色，跳转到仪表板')
          break
        case 'admin':
        case 'super_admin':
        default:
          // 管理员跳转到dashboard
          redirectUrl = '/dashboard'
          console.log('👤 管理员角色，跳转到仪表板')
          break
      }
    }

    console.log('🔀 准备跳转到:', redirectUrl)

    // 使用replace避免返回到登录页
    await router.replace(redirectUrl)
    console.log('✅ 页面跳转完成')

  } catch (error) {
    console.error('❌ 处理登录数据失败:', error)
    throw new Error('登录数据处理失败')
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

// 快捷登录
const quickLogin = async (role: string) => {
  console.log('⚡ 快捷登录:', role)

  // 使用实际可以登录的测试账号
  const credentials = {
    admin: { username: 'admin', password: 'admin123' },
    principal: { username: 'principal', password: '123456' },     // 使用principal账号（园长权限）
    teacher: { username: 'test_teacher', password: 'admin123' },  // 使用test_teacher账号
    parent: { username: 'test_parent', password: 'admin123' }     // 使用test_parent账号
  }

  const credential = credentials[role as keyof typeof credentials]
  if (credential) {
    loginForm.value.username = credential.username
    loginForm.value.password = credential.password
    await handleLogin()
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

  // 如果已经登录，直接跳转
  if (userStore.isLoggedIn) {
    console.log('👤 用户已登录，自动跳转')
    let redirectUrl = route.query.redirect as string

    if (!redirectUrl) {
      // 根据用户角色设置默认跳转页面
      const userRole = userStore.userInfo?.role?.toLowerCase()
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
  }
})
</script>

<style lang="scss" scoped>
// 导入独立样式文件
@import './login-styles.scss';


</style>