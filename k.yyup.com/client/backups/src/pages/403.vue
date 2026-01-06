<template>
  <div class="auxiliary-functionality-container error-page">
    <div class="error-card">
      <div class="error-number">403</div>
      <h2 class="error-title">权限不足</h2>
      <p class="error-description">
        您没有权限访问此页面。页面存在，但您当前的角色权限不足以访问。
        <br>
        <small class="error-note">💡 提示：这表示页面路径正确，但您需��更高的权限才能访问。</small>
      </p>
      
      <div class="permission-debug">
        <p><strong>权限调试信息：</strong></p>
        <p>请求路径：<code>{{ $route.path }}</code></p>
        <p>当前角色：<code>{{ currentUserRole }}</code></p>
        <p>如果您认为应该有权限访问此页面，请联系管理员。</p>
      </div>

  <div class="auto-redirect-banner">
    <div class="redirect-text">将于 <span class="countdown-number">{{ remainingSeconds }}</span> 秒后自动跳转到登录页</div>
    <div class="redirect-progress"></div>
  </div>

  <div class="error-actions">
        <button class="error-btn primary" @click="goToLogin">
          <el-icon><User /></el-icon>
          返回登录
        </button>
        <button class="error-btn secondary" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </button>
      </div>
      
      <div class="permission-info">
        <div class="info-card">
          <h3>权限说明</h3>
          <ul>
            <li>不同角色用户具有不同的页面访问权限</li>
            <li>请确认您当前登录的角色是否有权限访问此页面</li>
            <li>如需申请权限，请联系系统管理员</li>
          </ul>
        </div>
        
        <div class="contact-admin">
          <h4>联系管理员</h4>
          <p>如果您认为这是错误的，请联系系统管理员开通页面访问权限。</p>
          <button class="error-btn contact" @click="contactAdmin">
            <el-icon><Message /></el-icon>
            联系管理员
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 2. Element Plus 导入
import { 
  User, ArrowLeft, Message
} from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 获取当前用户角色
const currentUserRole = computed(() => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('kindergarten_user_info') || '{}')
    return userInfo.role || userInfo.roles?.[0]?.code || '未知'
  } catch {
    return '未知'
  }
})

// 倒计时逻辑
const remainingSeconds = ref(3)
let countdownTimer: number | null = null
let redirectTimer: number | null = null

onMounted(() => {
  countdownTimer = window.setInterval(() => {
    if (remainingSeconds.value > 0) remainingSeconds.value -= 1
  }, 1000)

  redirectTimer = window.setTimeout(() => {
    goToLogin()
  }, 3000)
})

onBeforeUnmount(() => {
  if (countdownTimer) window.clearInterval(countdownTimer)
  if (redirectTimer) window.clearTimeout(redirectTimer)
})

// 导航方法
const goToLogin = () => {
  // 清除当前认证信息
  localStorage.clear()
  router.push('/login')
}

const goBack = () => {
  router.go(-1)
}

const contactAdmin = () => {
  ElMessage.info('请通过系统内消息或电话联系管理员申请权限')
}
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
@import './auxiliary-functionality-ux-styles.scss';

/* 403页面特有样式 */
.error-note {
  color: #6c757d;
  font-size: 0.9em;
  margin-top: var(--spacing-sm);
  display: block;
}

.permission-debug {
  background: var(--bg-white)3cd;
  border: var(--border-width-base) solid #ffeaa7;
  border-radius: var(--spacing-xs);
  padding: var(--text-xs);
  margin: var(--spacing-lg) 0;
  font-size: 0.9em;
  
  p {
    margin: var(--spacing-xs) 0;
    color: #856404;
  }
  
  code {
    background: #ffeaa7;
    padding: var(--spacing-sm) var(--spacing-xs);
    border-radius: var(--radius-xs);
    font-family: 'Consolas', monospace;
    color: #d73a49;
  }
}

.permission-info {
  margin-top: 2rem;
  
  .info-card {
    background: var(--bg-gray-light);
    border-radius: var(--spacing-sm);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    
    h3 {
      color: #495057;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        position: relative;
        padding-left: 1.5rem;
        margin-bottom: 0.5rem;
        color: #6c757d;
        line-height: 1.5;
        
        &::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #007bff;
          font-weight: bold;
        }
      }
    }
  }
  
  .contact-admin {
    text-align: center;
    
    h4 {
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: #6c757d;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    .contact {
      background: linear-gradient(135deg, #28a745, #20c997);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #218838, #1ea688);
        transform: translateY(-2px);
      }
    }
  }
}

/* 403 自动跳转样式 */
.auto-redirect-banner {
  margin-top: 1rem;
}
.redirect-text {
  color: #495057;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}
.countdown-number {
  display: inline-block;
  min-width: 1.5rem;
  text-align: center;
  font-weight: 700;
  color: #e03131;
  animation: pulse-count 1s ease-in-out infinite;
}
.redirect-progress {
  height: var(--spacing-xs);
  background: linear-gradient(90deg, #ff6b6b, #ffa94d);
  border-radius: var(--spacing-xs);
  animation: countdown-bar 3s linear forwards;
}
@keyframes countdown-bar {
  from { width: 100%; }
  to { width: 0%; }
}
@keyframes pulse-count {
  0% { transform: scale(1); }
  20% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 辅助功能模块UX样式 - 所有样式已在 auxiliary-functionality-ux-styles.scss 中统一定义 */
</style>
