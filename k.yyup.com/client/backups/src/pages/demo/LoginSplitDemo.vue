<template>
  <div class="demo-login">
    <div class="split left">
      <div class="brand">
        <div class="logo">🏫</div>
        <h1 class="title">智慧幼儿园</h1>
        <p class="subtitle">让教育更智能 · 让成长更美好</p>
        <ul class="features">
          <li><span>🎯</span> 智能招生管理</li>
          <li><span>📊</span> 数据驱动决策</li>
          <li><span>🤖</span> AI 专家助手</li>
        </ul>
      </div>
    </div>
    <div class="split right">
      <div class="card">
        <h2 class="card-title">欢迎登录</h2>
        <form @submit.prevent="handleLogin" class="form">
          <label class="field">
            <span>用户名</span>
            <input v-model.trim="form.username" type="text" placeholder="请输入用户名" required autocomplete="username" />
          </label>
          <label class="field">
            <span>密码</span>
            <input v-model="form.password" type="password" placeholder="请输入密码" required autocomplete="current-password" />
          </label>
          <button type="submit" class="btn" :disabled="loading">
            <span v-if="!loading">立即登录</span>
            <span v-else class="spinner" />
          </button>
        </form>
        <div class="tips">演示页面：提交后将跳转到仪表板</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const form = ref({ username: '', password: '' })

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) return
  loading.value = true
  try {
    await new Promise((r) => setTimeout(r, 600))
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.demo-login {
  display: flex; min-height: 100vh; background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
}
.split { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--spacing-12xl); }
.left { color: var(--bg-white); position: relative; }
.right { display: flex; align-items: center; justify-content: center; }
.brand { max-width: 520px; }
.logo { width: 72px; height: 72px; border-radius: var(--text-lg); display: grid; place-items: center; font-size: var(--text-4xl); background: var(--white-alpha-15); box-shadow: 0 10px 30px var(--black-alpha-20); backdrop-filter: blur(6px); }
.title { margin: var(--text-lg) 0 6px; font-size: var(--text-5xl); font-weight: 800; letter-spacing: var(--border-width-base); text-shadow: 0 6px var(--text-xl) var(--black-alpha-15); }
.subtitle { opacity: .92; margin-bottom: var(--spacing-6xl); }
.features { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--spacing-2xl); }
.features li { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-2xl) var(--text-base); border-radius: var(--text-sm); background: rgba(255,255,255,0.12); border: var(--border-width-base) solid rgba(255,255,255,0.25); }
.features li span { width: 22px; text-align: center; }

.card { width: 100%; max-width: 420px; padding: var(--spacing-7xl); border-radius: var(--text-lg); background: var(--bg-white); box-shadow: 0 var(--text-2xl) 60px rgba(0,0,0,0.12); }
.card-title { margin: 0 0 var(--text-xl); font-size: var(--text-2xl); font-weight: 700; color: var(--color-gray-900); }
.form { display: grid; gap: var(--text-lg); }
.field { display: grid; gap: var(--spacing-sm); }
.field span { font-size: var(--text-base); color: var(--text-secondary); }
.field input { padding: var(--text-base) var(--text-lg); border: var(--border-width-base) solid var(--border-color); border-radius: var(--text-sm); outline: none; transition: .2s; background: var(--bg-white); }
.field input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 var(--spacing-xs) rgba(102,126,234,.15); }
.btn { margin-top: var(--spacing-lg); padding: var(--text-base) var(--text-xl); width: 100%; border: none; border-radius: var(--text-sm); color: var(--bg-white); background: linear-gradient(135deg, var(--primary-color), #764ba2); box-shadow: 0 10px var(--text-3xl) rgba(102,126,234,.35); cursor: pointer; transition: .2s; display: grid; place-items: center; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 var(--text-lg) 2var(--spacing-sm) rgba(102,126,234,.45); }
.btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.spinner { width: var(--text-xl); height: var(--text-xl); border-radius: var(--radius-full); border: 2px solid rgba(255,255,255,.45); border-top-color: var(--bg-white); animation: spin 1s linear infinite; }
.tips { margin-top: var(--text-sm); font-size: var(--text-sm); color: var(--text-secondary); text-align: center; }

@media (max-width: 960px) {
  .demo-login { flex-direction: column; }
  .split { padding: var(--spacing-7xl) var(--text-2xl); }
  .left { padding-top: var(--spacing-3xl); }
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

