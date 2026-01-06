import { createApp } from 'vue'
import LoginOptimized from './views/Login-optimized.vue'

// 最小化Vue应用，只包含登录功能
const app = createApp(LoginOptimized)

console.log('🚀 登录页面快速启动...')

// 挂载应用
app.mount('#app')

console.log('✅ 登录页面加载完成')

// 全局暴露，便于调试
if (typeof window !== 'undefined') {
  ;(window as any).__VUE_LOGIN_APP__ = app
}