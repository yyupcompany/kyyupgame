<template>
  <div class="mobile-login-container">
    <!-- 背景渐变和装饰 -->
    <div class="background-decoration">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo和标题区域 -->
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-wrapper">
            <img
              src="@/assets/logo.png"
              alt="智慧幼儿园AI助手"
              class="logo-image"
              @error="handleImageError"
            />
            <div class="logo-glow"></div>
          </div>
        </div>
        
        <div class="title-section">
          <h1 class="main-title">
            <span class="title-ai">AI智能助手</span>
            <span class="title-sub">幼儿园管理系统</span>
          </h1>
          <p class="welcome-subtitle">让教育更智能 · 让管理更轻松</p>
        </div>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-header">
          <h2 class="form-title">欢迎使用</h2>
          <p class="form-desc">请登录您的账户开始AI智能管理</p>
        </div>

        <!-- 用户名输入 -->
        <div class="input-group">
          <div class="input-wrapper">
            <div class="input-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
            />
          </div>
          <div v-if="errors.username" class="error-message">
            {{ errors.username }}
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="input-group">
          <div class="input-wrapper">
            <div class="input-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
            />
          </div>
          <div v-if="errors.password" class="error-message">
            {{ errors.password }}
          </div>
        </div>

        <!-- 全局错误信息 -->
        <div v-if="globalError" class="global-error">
          <div class="error-icon">⚠️</div>
          <span>{{ globalError }}</span>
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          class="login-button"
          :class="{ 'loading': loading }"
          :disabled="loading"
        >
          <div v-if="loading" class="loading-spinner"></div>
          <span class="button-text">{{ loading ? '登录中...' : '进入AI助手' }}</span>
          <div v-if="!loading" class="button-icon">🤖</div>
        </button>
      </form>

      <!-- 快速登录 -->
      <div class="quick-login-section">
        <div class="divider">
          <span class="divider-text">一键体验</span>
        </div>
        
        <div class="quick-buttons">
          <button
            v-for="role in quickRoles"
            :key="role.key"
            class="quick-btn"
            :class="`quick-btn-${role.key}`"
            @click="quickLogin(role.key)"
            :disabled="loading"
          >
            <div class="quick-icon">{{ role.icon }}</div>
            <div class="quick-text">
              <div class="quick-title">{{ role.title }}</div>
              <div class="quick-desc">{{ role.desc }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 功能特色提示 -->
      <div class="features-tip">
        <div class="tip-header">
          <span class="tip-icon">✨</span>
          <span class="tip-title">AI助手特色功能</span>
        </div>
        <div class="tip-content">
          <div class="feature-tag">🎯 智能招生管理</div>
          <div class="feature-tag">📊 实时数据分析</div>
          <div class="feature-tag">👨‍👩‍👧‍👦 家校互通</div>
          <div class="feature-tag">🤖 24小时AI服务</div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="login-footer">
        <p class="footer-text">首次使用将自动创建演示数据</p>
        <p class="copyright">&copy; 2024 智慧幼儿园AI管理系统</p>
      </div>
    </div>

    <!-- 角色选择弹窗（用于未注册用户） -->
    <RoleSelectionSheet
      v-model="showRoleSelection"
      :tenant-name="pendingRegistrationTenantName"
      :available-roles-codes="pendingRegistrationRoles"
      @success="onRegistrationSuccess"
      @cancel="onRegistrationCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/store/modules/auth'
import { login } from '@/api/modules/user'
import RoleSelectionSheet from '../components/RoleSelectionSheet.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const authStore = useAuthStore()

// 角色选择相关状态
const showRoleSelection = ref(false)
const pendingRegistrationTenantName = computed(() => authStore.pendingRegistration?.tenantName || '')
const pendingRegistrationRoles = computed(() => authStore.pendingRegistration?.availableRoles || ['principal', 'teacher', 'parent'])

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

// 快速登录角色配置
// 注意：teacher快捷登录使用test_parent账号（刘蕾，有完整数据）
const quickRoles = [
  {
    key: 'admin',
    title: '管理员',
    desc: '系统管理',
    icon: '👤',
    username: 'admin',
    password: 'admin123'
  },
  {
    key: 'principal',
    title: '园长',
    desc: '决策管理',
    icon: '🎯',
    username: 'principal',
    password: '123456'
  },
  {
    key: 'teacher',
    title: '教师',
    desc: '教学管理',
    icon: '📚',
    username: 'test_parent',
    password: '123456'
  },
  {
    key: 'parent',
    title: '家长',
    desc: '孩子成长',
    icon: '👨‍👩‍👧‍👦',
    username: 'test_parent',
    password: '123456'
  }
]

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
  console.log('🚀 移动端AI助手登录流程...')
  
  if (!validateForm()) {
    console.log('❌ 表单验证失败')
    return
  }

  loading.value = true
  globalError.value = ''

  try {
    console.log('📡 发送移动端登录请求:', {
      username: loginForm.value.username,
      password: '***'
    })
    
    const response = await login({
      username: loginForm.value.username,
      password: loginForm.value.password
    })
    
    console.log('✅ 移动端登录响应:', response)
    
    if (response.success && response.data) {
      await processLoginSuccess(response.data)
    } else {
      throw new Error(response.message || '登录失败')
    }
    
  } catch (error: any) {
    console.error('❌ 移动端登录失败:', error)
    handleLoginError(error)
  } finally {
    loading.value = false
  }
}

// 处理登录成功 - 移动端专用
const processLoginSuccess = async (loginData: any) => {
  console.log('🎉 移动端登录成功，处理用户数据:', loginData)
  
  try {
    // 保存token（兼容多种key，满足移动端路由守卫与API调用）
    const token = loginData.token
    localStorage.setItem('kindergarten_token', token)
    localStorage.setItem('token', token)
    localStorage.setItem('auth_token', token)
    localStorage.setItem('access_token', token) // 🔧 aimobile/main.ts 的 checkAuthentication 会读取这个key
    
    // 保存用户信息
    const normalizedRole = (loginData.user.role || 'user').toLowerCase()
    const normalizedRoles = (loginData.user.roles || [loginData.user.role]).map((r: string) => (r || 'user').toLowerCase())

    const userInfo = {
      token: token,
      username: loginData.user.username,
      displayName: loginData.user.realName || loginData.user.username,
      role: normalizedRole,
      roles: normalizedRoles,
      permissions: loginData.user.permissions || (loginData.user.isAdmin ? ['*'] : []),
      email: loginData.user.email,
      avatar: loginData.user.avatar,
      id: loginData.user.id,
      isAdmin: loginData.user.isAdmin || normalizedRole === 'admin',
      status: 'active'
    }
    
    console.log('💾 保存移动端用户信息:', userInfo)
    userStore.setUserInfo(userInfo)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    // 同步写入简化的角色信息，供移动端守卫读取
    localStorage.setItem('user_role', normalizedRole)
    localStorage.setItem('user_roles', JSON.stringify(normalizedRoles))
    if (loginData.user?.id) localStorage.setItem('user_id', String(loginData.user.id))

    ElMessage.success(`🤖 欢迎使用AI助手，${userInfo.displayName}！`)
    
    // 移动端登录成功后跳转到AI助手页面
    console.log('🔀 移动端登录成功，跳转到AI助手页面')
    
    // 处理重定向 - 移动端专用逻辑
    const redirectUrl = (route.query.redirect as string)
    // 修正：移动端默认跳转到已注册的 AI 聊天页
    let targetPath = '/mobile/ai-chat'

    if (redirectUrl && redirectUrl.startsWith('/mobile')) {
      // 如果redirect是移动端路径，直接使用
      targetPath = redirectUrl
    } else if (redirectUrl && !redirectUrl.startsWith('/mobile')) {
      // 如果redirect是PC路径，转换为移动端路径
      if (redirectUrl === '/' || redirectUrl === '/dashboard') {
        targetPath = '/mobile/ai-chat'
      } else {
        // 其他路径默认跳转到移动端AI聊天页
        targetPath = '/mobile/ai-chat'
      }
    }
    
    console.log(`🎯 移动端目标路径: ${targetPath}`)
    await router.replace(targetPath)
    console.log('✅ 移动端页面跳转完成')
    
  } catch (error) {
    console.error('❌ 处理移动端登录数据失败:', error)
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
  
  globalError.value = errorMessage
  ElMessage.error(errorMessage)
}

// 快速登录
const quickLogin = async (roleKey: string) => {
  console.log('⚡ 移动端快速登录:', roleKey)

  const role = quickRoles.find(r => r.key === roleKey)
  if (role) {
    loginForm.value.username = role.username
    loginForm.value.password = role.password
    await handleLogin()
  }
}

// 注册成功处理
const onRegistrationSuccess = async () => {
  console.log('✅ 移动端注册成功，继续登录流程')
  showRoleSelection.value = false

  // 注册成功后，authStore 已经更新了用户信息和 token
  // 构建用户信息并保存
  const currentUser = authStore.user
  if (currentUser) {
    const normalizedRole = (currentUser.role || 'user').toLowerCase()
    const userInfo = {
      token: authStore.token,
      username: currentUser.username || '',
      displayName: currentUser.realName || currentUser.username || '',
      role: normalizedRole,
      roles: currentUser.roles || [currentUser.role],
      permissions: currentUser.permissions || [],
      email: currentUser.email,
      avatar: currentUser.avatar,
      id: currentUser.id,
      isAdmin: normalizedRole === 'admin',
      status: 'active'
    }

    userStore.setUserInfo(userInfo)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('kindergarten_token', authStore.token || '')
    localStorage.setItem('access_token', authStore.token || '')
    localStorage.setItem('user_role', normalizedRole)

    ElMessage.success(`🤖 欢迎使用AI助手，${userInfo.displayName}！`)

    // 跳转到AI助手页面
    await router.replace('/mobile/ai-chat')
  }
}

// 注册取消处理
const onRegistrationCancel = () => {
  console.log('❌ 用户取消注册')
  showRoleSelection.value = false
  ElMessage.info('您已取消注册，请重新登录')
}

// 图片错误处理
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      parent.innerHTML = '<div class="logo-fallback">🤖</div>'
    }
  }
}

// 组件挂载
onMounted(() => {
  console.log('🔧 移动端AI助手登录页初始化')

  // 如果已经登录，直接跳转到AI助手
  if (userStore.isLoggedIn) {
    console.log('👤 用户已登录，跳转AI助手')
    router.replace('/mobile/ai-chat')
  }
})
</script>

<style lang="scss" scoped>
// 移动端AI助手登录页面样式

.mobile-login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
}

// 背景装饰
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  
  .floating-circle {
    position: absolute;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.08);
    animation: float 6s ease-in-out infinite;
    
    &.circle-1 {
      width: 120px;
      height: 120px;
      top: 10%;
      right: -20px;
      animation-delay: 0s;
    }
    
    &.circle-2 {
      width: 80px;
      height: 80px;
      top: 60%;
      left: -10px;
      animation-delay: 2s;
    }
    
    &.circle-3 {
      width: 60px;
      height: 60px;
      bottom: 20%;
      right: 20%;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-15px) scale(1.05); }
}

// 登录卡片
.login-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 0;
  position: relative;
  z-index: 1;
  
  @media (max-width: 480px) {
    max-width: 100%;
    border-radius: 0;
  }
  
  @media (min-width: 48var(--border-width-base)) {
    margin: 2rem auto;
    border-radius: 2var(--spacing-xs);
    box-shadow: 0 20px 40px var(--shadow-heavy);
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
  }
}

// Logo和标题区域
.login-header {
  padding: 3rem 2rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: inherit;
    border-radius: var(--radius-full);
  }
  
  .logo-section {
    margin-bottom: 1.5rem;
    
    .logo-wrapper {
      position: relative;
      display: inline-block;
      
      .logo-image {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        filter: drop-shadow(0 var(--spacing-sm) var(--spacing-md) rgba(0,0,0,0.2));
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
        }
      }
      
      .logo-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
        border-radius: var(--radius-full);
        animation: glow 3s ease-in-out infinite;
      }
      
      .logo-fallback {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.2);
        border-radius: 20px;
        font-size: 3rem;
      }
    }
  }
  
  .title-section {
    .main-title {
      margin: 0 0 1rem;
      
      .title-ai {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        background: linear-gradient(45deg, #fff, #e0e7ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.25rem;
        text-shadow: 0 2px var(--spacing-xs) rgba(0,0,0,0.1);
      }
      
      .title-sub {
        display: block;
        font-size: 1rem;
        font-weight: 400;
        opacity: 0.9;
      }
    }
    
    .welcome-subtitle {
      margin: 0;
      font-size: 0.875rem;
      opacity: 0.8;
      font-weight: 300;
    }
  }
}

@keyframes glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

// 登录表单
.login-form {
  padding: 2.5rem 2rem 2rem;
  flex: 1;
  
  .form-header {
    text-align: center;
    margin-bottom: 2rem;
    
    .form-title {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .form-desc {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }
  }
  
  .input-group {
    margin-bottom: 1.5rem;
    
    .input-wrapper {
      position: relative;
      
      .input-icon {
        position: absolute;
        left: var(--spacing-md);
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        z-index: 1;
        transition: color 0.3s ease;
      }
      
      .form-input {
        width: 100%;
        padding: 1var(--spacing-sm) var(--spacing-md) 1var(--spacing-sm) 52px;
        border: 2px solid #e5e7eb;
        border-radius: var(--spacing-md);
        font-size: 1rem;
        font-weight: 500;
        color: #1f2937;
        background: #f8fafc;
        transition: all 0.3s ease;
        box-sizing: border-box;
        min-height: 56px;
        
        // 移动端优化触摸体验
        -webkit-appearance: none;
        -webkit-tap-highlight-color: transparent;
        
        &::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
        
        &:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          
          + .input-icon {
            color: #667eea;
          }
        }
        
        &.error {
          border-color: #ef4444;
          background: #fef2f2;
          
          &:focus {
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
        }
      }
    }
    
    .error-message {
      color: #dc2626;
      font-size: 0.75rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      
      &::before {
        content: '⚠️';
        font-size: 0.625rem;
      }
    }
  }
  
  .global-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fef2f2;
    border: var(--border-width-base) solid #fecaca;
    border-radius: 12px;
    padding: 0.875rem;
    margin-bottom: 1.5rem;
    color: #dc2626;
    font-size: 0.875rem;
    
    .error-icon {
      font-size: 1rem;
    }
  }
  
  .login-button {
    width: 100%;
    padding: 1var(--spacing-sm) 2var(--spacing-xs);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: var(--spacing-md);
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    box-shadow: 0 var(--spacing-sm) 20px rgba(102, 126, 234, 0.3);
    min-height: 56px;
    
    // 移动端触摸优化
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    
    &:active {
      transform: scale(0.98);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--glass-bg-heavy);
      border-top: 2px solid white;
      border-radius: var(--radius-full);
      animation: spin 1s linear infinite;
    }
    
    .button-text {
      font-weight: 600;
    }
    
    .button-icon {
      font-size: 1.25rem;
      animation: bounce 2s ease-in-out infinite;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

// 快速登录区域
.quick-login-section {
  padding: 0 2rem 2rem;
  
  .divider {
    position: relative;
    text-align: center;
    margin-bottom: 1.5rem;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: var(--border-width-base);
      background: #e5e7eb;
    }
    
    .divider-text {
      background: rgba(255, 255, 255, 0.98);
      padding: 0 1rem;
      color: #9ca3af;
      font-size: 0.875rem;
      position: relative;
      z-index: 1;
    }
  }
  
  .quick-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.875rem;
    
    .quick-btn {
      padding: 1rem 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 1var(--spacing-xs);
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      min-height: 80px;
      
      // 移动端触摸优化
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      
      &:active {
        transform: scale(0.95);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      
      .quick-icon {
        font-size: 1.5rem;
        transition: transform 0.3s ease;
      }
      
      .quick-text {
        text-align: center;
        
        .quick-title {
          font-weight: 600;
          font-size: 0.875rem;
          color: #1f2937;
          margin-bottom: 0.125rem;
        }
        
        .quick-desc {
          font-size: 0.75rem;
          color: #6b7280;
        }
      }
      
      // 角色主题色
      &.quick-btn-admin {
        border-color: #8b5cf6;
        &:hover, &:active {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          .quick-text .quick-title,
          .quick-text .quick-desc {
            color: white;
          }
        }
      }
      
      &.quick-btn-principal {
        border-color: #667eea;
        &:hover, &:active {
          background: linear-gradient(135deg, #667eea, #2563eb);
          color: white;
          .quick-text .quick-title,
          .quick-text .quick-desc {
            color: white;
          }
        }
      }
      
      &.quick-btn-teacher {
        border-color: #10b981;
        &:hover, &:active {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          .quick-text .quick-title,
          .quick-text .quick-desc {
            color: white;
          }
        }
      }
      
      &.quick-btn-parent {
        border-color: #f59e0b;
        &:hover, &:active {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          .quick-text .quick-title,
          .quick-text .quick-desc {
            color: white;
          }
        }
      }
    }
  }
}

// 功能特色提示
.features-tip {
  padding: 0 2rem 1.5rem;
  
  .tip-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    .tip-icon {
      font-size: 1.125rem;
    }
    
    .tip-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }
  }
  
  .tip-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    
    .feature-tag {
      background: #f8fafc;
      border: var(--border-width-base) solid var(--border-light-dark);
      border-radius: 20px;
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      color: #475569;
      text-align: center;
      font-weight: 500;
    }
  }
}

// 底部信息
.login-footer {
  padding: 1rem 2rem 2rem;
  text-align: center;
  border-top: var(--border-width-base) solid #e5e7eb;
  
  .footer-text {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    color: #64748b;
    
    &::before {
      content: '💡';
      margin-right: 0.25rem;
    }
  }
  
  .copyright {
    margin: 0;
    font-size: 0.7rem;
    color: #9ca3af;
  }
}

// 小屏幕优化
@media (max-width: 360px) {
  .login-card {
    .login-header {
      padding: 2rem 1.5rem 1.5rem;
      
      .title-section .main-title .title-ai {
        font-size: 1.75rem;
      }
    }
    
    .login-form {
      padding: 2rem 1.5rem;
    }
    
    .quick-login-section,
    .features-tip {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
    
    .login-footer {
      padding: 1rem 1.5rem;
    }
  }
}
</style>