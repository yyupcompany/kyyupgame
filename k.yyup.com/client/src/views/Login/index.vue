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
import { useRouter } from 'vue-router'

const router = useRouter()

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
      router.push('/dashboard')
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 10px var(--shadow-light);
  width: 100%;
  max-width: 100%; max-width: 400px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--radius-sm);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #4F46E5;
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
}
</style>
