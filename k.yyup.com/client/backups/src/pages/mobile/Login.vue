<template>
  <div class="mobile-login">
    <div class="login-container">
      <!-- 头部Logo -->
      <div class="header">
        <div class="logo">
          <img src="@/assets/logo.png" alt="幼儿园管理系统" />
        </div>
        <h1 class="title">幼儿园管理系统</h1>
        <p class="subtitle">移动端登录</p>
      </div>

      <!-- 登录表单 -->
      <div class="form-container">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="loginForm.username"
                type="text"
                placeholder="请输入用户名"
                class="form-input"
                required
              />
              <i class="icon-user"></i>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input"
                required
              />
              <i class="icon-lock"></i>
              <button
                type="button"
                @click="togglePassword"
                class="password-toggle"
              >
                <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="login-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 快速登录选项 -->
        <div class="quick-login">
          <p class="quick-title">快速登录</p>
          <div class="quick-buttons">
            <button @click="quickLogin('principal')" class="quick-btn principal">
              园长登录
            </button>
            <button @click="quickLogin('teacher')" class="quick-btn teacher">
              教师登录
            </button>
            <button @click="quickLogin('parent')" class="quick-btn parent">
              家长登录
            </button>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="footer">
        <p class="version">版本 v1.0.0</p>
        <p class="copyright">© 2024 幼儿园管理系统</p>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 状态管理
const isLoading = ref(false)
const showPassword = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 显示消息
const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 登录处理
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    showMessage('请输入用户名和密码', 'error')
    return
  }

  isLoading.value = true

  try {
    // 模拟登录API调用
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginForm)
    })

    const data = await response.json()

    if (data.success) {
      // 保存token和用户信息
      localStorage.setItem('kindergarten_token', data.data.token)
      localStorage.setItem('kindergarten_user_info', JSON.stringify(data.data.user))
      
      showMessage('登录成功！', 'success')
      
      // 根据用户角色跳转
      const userRole = data.data.user.role
      if (userRole === 'parent') {
        router.push('/mobile/parent-dashboard')
      } else {
        router.push('/mobile/dashboard')
      }
    } else {
      showMessage(data.message || '登录失败', 'error')
    }
  } catch (error) {
    console.error('登录错误:', error)
    showMessage('网络错误，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 快速登录
const quickLogin = async (role: string) => {
  const credentials = {
    principal: { username: 'principal', password: '123456' },
    teacher: { username: 'teacher', password: '123456' },
    parent: { username: 'parent', password: '123456' }
  }

  const cred = credentials[role as keyof typeof credentials]
  if (cred) {
    loginForm.username = cred.username
    loginForm.password = cred.password
    await handleLogin()
  }
}
</script>

<style lang="scss" scoped>
.mobile-login {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--text-2xl);
  position: relative;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: var(--text-2xl);
  padding: var(--spacing-10xl) 30px;
  box-shadow: 0 var(--text-2xl) 40px var(--shadow-light);
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-10xl);

  .logo {
    margin-bottom: var(--text-2xl);
    
    img {
      width: var(--avatar-size); height: var(--avatar-size);
    }
  }

  .title {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .subtitle {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
  }
}

.form-container {
  margin-bottom: var(--spacing-8xl);
}

.form-group {
  margin-bottom: var(--text-2xl);
}

.input-wrapper {
  position: relative;
  
  .form-input {
    width: 100%;
    height: 50px;
    padding: 0 50px 0 50px;
    border: 2px solid #e1e5e9;
    border-radius: var(--text-sm);
    font-size: var(--text-lg);
    transition: all 0.3s ease;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  .icon-user,
  .icon-lock {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: var(--text-2xl);
    height: var(--text-2xl);
    background-size: contain;
    opacity: 0.5;
  }

  .icon-user {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
  }

  .icon-lock {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 24 24'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E");
  }

  .password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-base);

    .icon-eye,
    .icon-eye-off {
      width: var(--text-2xl);
      height: var(--text-2xl);
      background-size: contain;
      opacity: 0.5;
    }

    .icon-eye {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 24 24'%3E%3Cpath d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'/%3E%3C/svg%3E");
    }

    .icon-eye-off {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 24 24'%3E%3Cpath d='M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z'/%3E%3C/svg%3E");
    }
  }
}

.login-button {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: var(--text-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 var(--spacing-sm) var(--text-2xl) rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .loading-spinner {
    width: var(--text-2xl);
    height: var(--text-2xl);
    border: 2px solid var(--glass-bg-heavy);
    border-top: 2px solid white;
    border-radius: var(--radius-full);
    animation: spin 1s linear infinite;
  }
}

.quick-login {
  margin-top: var(--spacing-8xl);
  text-align: center;

  .quick-title {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-4xl);
  }

  .quick-buttons {
    display: flex;
    gap: var(--spacing-2xl);
    justify-content: center;
    flex-wrap: wrap;
  }

  .quick-btn {
    padding: var(--spacing-sm) var(--text-lg);
    border: var(--border-width-base) solid #ddd;
    border-radius: var(--text-2xl);
    background: white;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: var(--bg-secondary);
    }

    &.principal {
      border-color: #ff6b6b;
      color: #ff6b6b;
      &:hover { background: var(--bg-white)5f5; }
    }

    &.teacher {
      border-color: #4ecdc4;
      color: #4ecdc4;
      &:hover { background: #f0fffe; }
    }

    &.parent {
      border-color: #45b7d1;
      color: #45b7d1;
      &:hover { background: #f0f9ff; }
    }
  }
}

.footer {
  text-align: center;
  margin-top: var(--spacing-8xl);

  p {
    margin: var(--spacing-base) 0;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }
}

.message {
  position: fixed;
  top: var(--text-2xl);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--text-sm) var(--text-3xl);
  border-radius: var(--spacing-sm);
  font-size: var(--text-base);
  font-weight: 500;
  z-index: 1000;
  animation: slideDown 0.3s ease;

  &.success {
    background: #d4edda;
    color: #155724;
    border: var(--border-width-base) solid #c3e6cb;
  }

  &.error {
    background: #f8d7da;
    color: #721c24;
    border: var(--border-width-base) solid #f5c6cb;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-var(--text-2xl));
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-sm)) {
  .login-container {
    padding: var(--spacing-8xl) var(--text-2xl);
    margin: var(--spacing-2xl);
  }

  .header .title {
    font-size: var(--text-2xl);
  }

  .quick-buttons {
    flex-direction: column;
    align-items: center;
  }

  .quick-btn {
    width: 120px;
  }
}
</style>
