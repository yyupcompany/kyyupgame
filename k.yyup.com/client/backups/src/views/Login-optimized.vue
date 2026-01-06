<template>
  <div class="login-container">
    <div class="login-form">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// 延迟导入路由，避免阻塞页面渲染
const router = (() => {
  let lazyRouter: any = null
  return {
    push: async (path: string) => {
      if (!lazyRouter) {
        const { useRouter } = await import('vue-router')
        lazyRouter = useRouter()
      }
      lazyRouter.push(path)
    }
  }
})()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 调用真实的登录API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: loginForm.value.username,
        password: loginForm.value.password
      })
    })

    const data = await response.json()

    if (data.success) {
      // 保存token和用户信息
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('kindergarten_token', data.data.token)
        localStorage.setItem('kindergarten_user_info', JSON.stringify(data.data.user))
      }

      // 跳转到dashboard
      await router.push('/dashboard')
    } else {
      error.value = data.message || '登录失败'
    }
  } catch (err) {
    console.error('登录失败:', err)
    error.value = '网络错误，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 使用内联CSS避免外部文件加载延迟 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-secondary);
  margin: 0;
  padding: var(--spacing-5xl);
  box-sizing: border-box;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 10px var(--shadow-light);
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4F46E5;
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  box-sizing: border-box;
}

button:hover:not(:disabled) {
  background-color: #3730A3;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-size: 0.875rem;
  border: var(--border-width-base) solid #feb2b2;
  box-sizing: border-box;
}

/* 移动端优化 */
@media (max-width: var(--breakpoint-sm)) {
  .login-container {
    padding: var(--spacing-2xl);
  }

  .login-form {
    padding: 1.5rem;
  }

  .login-form h2 {
    font-size: 1.25rem;
  }
}

/* 减少重排重绘 */
.login-form,
.form-group,
input,
button {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>