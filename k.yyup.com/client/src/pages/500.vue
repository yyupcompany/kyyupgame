<template>
  <div class="auxiliary-functionality-container error-page">
    <div class="error-card">
      <div class="error-number">500</div>
      <h2 class="error-title">服务器错误</h2>
      <p class="error-description">
        服务器内部发生错误，无法完成您的请求。
        <br>
        <small class="error-note">💡 提示：这表示服务器端出现问题，请稍后重试或联系管理员。</small>
      </p>

      <div class="error-debug">
        <p><strong>错误调试信息：</strong></p>
        <p>请求路径：<code>{{ $route.path }}</code></p>
        <p>当前时间：<code>{{ currentTime }}</code></p>
        <p>如果您持续遇到此错误，请联系系统管理员。</p>
      </div>

      <div class="error-actions">
        <button class="error-btn primary" @click="refreshPage">
          <UnifiedIcon name="Refresh" />
          刷新页面
        </button>
        <button class="error-btn secondary" @click="goBack">
          <UnifiedIcon name="ArrowLeft" />
          返回上页
        </button>
        <button class="error-btn" @click="goToDashboard">
          <UnifiedIcon name="HomeFilled" />
          返回首页
        </button>
      </div>

      <div class="error-help">
        <div class="help-card">
          <h3>常见解决方法</h3>
          <ul>
            <li>刷新页面尝试重新加载</li>
            <li>清除浏览器缓存后重新访问</li>
            <li>检查网络连接是否正常</li>
            <li>等待几分钟后再次尝试</li>
          </ul>
        </div>

        <div class="contact-admin">
          <h4>联系管理员</h4>
          <p>如果问题持续存在，请联系系统管理员报告此错误。</p>
          <button class="error-btn contact" @click="contactAdmin">
            <UnifiedIcon name="Message" />
            联系管理员
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 路由
const router = useRouter()

// 当前时间
const currentTime = ref('')

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 导航方法
const refreshPage = () => {
  window.location.reload()
}

const goBack = () => {
  router.go(-1)
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const contactAdmin = () => {
  ElMessage.info('请通过系统内消息或电话联系管理员报告此错误')
}
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use './auxiliary-functionality-ux-styles.scss' as *;

/* 500页面特有样式 */
.error-note {
  color: #6c757d;
  font-size: 0.9em;
  margin-top: var(--spacing-sm);
  display: block;
}

.error-debug {
  background: var(--bg-white);
  border: var(--border-width-base) solid #f5c6cb;
  border-radius: var(--spacing-xs);
  padding: var(--text-xs);
  margin: var(--spacing-lg) 0;
  font-size: 0.9em;

  p {
    margin: var(--spacing-xs) 0;
    color: #721c24;
  }

  code {
    background: #f8d7da;
    padding: var(--spacing-sm) var(--spacing-xs);
    border-radius: var(--radius-xs);
    font-family: 'Consolas', monospace;
    color: #c82333;
  }
}

.error-help {
  margin-top: 2rem;

  .help-card {
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
          content: '✓';
          position: absolute;
          left: 0;
          color: #28a745;
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
      background: linear-gradient(135deg, #dc3545, #c82333);
      border: none;

      &:hover {
        background: linear-gradient(135deg, #c82333, #bd2130);
        transform: translateY(var(--transform-hover-lift));
      }
    }
  }
}

/* 辅助功能模块UX样式 - 所有样式已在 auxiliary-functionality-ux-styles.scss 中统一定义 */
</style>
