<template>
  <div class="mobile-error-page">
    <div class="error-container">
      <!-- 错误图标 -->
      <div class="error-icon">
        <van-icon name="warning-o" size="80" color="#ff6b6b" />
      </div>

      <!-- 错误信息 -->
      <div class="error-info">
        <h1 class="error-title">{{ errorTitle }}</h1>
        <p class="error-message">{{ errorMessage }}</p>
        <p v-if="errorDetail" class="error-detail">{{ errorDetail }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <van-button
          type="primary"
          block
          round
          @click="goBack"
        >
          返回上一页
        </van-button>
        <van-button
          plain
          block
          round
          @click="goHome"
        >
          返回首页
        </van-button>
      </div>

      <!-- 帮助信息 -->
      <div class="error-help">
        <p class="help-text">如果问题持续存在，请联系系统管理员</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

// 从路由参数获取错误信息
const errorType = ref(route.query.type as string || '404')
const errorDetail = ref(route.query.message as string || '')

// 根据错误类型显示不同的标题和消息
const errorTitle = computed(() => {
  switch (errorType.value) {
    case '403':
      return '访问被拒绝'
    case '404':
      return '页面未找到'
    case '500':
      return '服务器错误'
    case 'network':
      return '网络连接失败'
    default:
      return '出错了'
  }
})

const errorMessage = computed(() => {
  switch (errorType.value) {
    case '403':
      return '您没有权限访问此页面'
    case '404':
      return '抱歉，您访问的页面不存在'
    case '500':
      return '服务器遇到了一些问题，请稍后再试'
    case 'network':
      return '无法连接到服务器，请检查网络连接'
    default:
      return '发生了未知错误，请稍后再试'
  }
})

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    goHome()
  }
}

// 返回首页
const goHome = () => {
  const userRole = localStorage.getItem('user_role')
  if (userRole === 'parent') {
    router.push('/mobile/parent-center')
  } else if (userRole === 'teacher') {
    router.push('/mobile/teacher-center')
  } else {
    router.push('/mobile/centers')
  }
}

onMounted(() => {
  // 如果有错误详情，显示提示
  if (errorDetail.value) {
    console.error('Error:', errorDetail.value)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
@import '@/styles/design-tokens.scss';

.mobile-error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--mobile-bg-primary);
}

.error-container {
  width: 100%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.error-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.error-info {
  .error-title {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--mobile-text-primary);
    margin: 0 0 var(--spacing-md) 0;
  }

  .error-message {
    font-size: var(--text-base);
    color: var(--mobile-text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
    line-height: 1.5;
  }

  .error-detail {
    font-size: var(--text-sm);
    color: var(--mobile-text-tertiary);
    margin: 0;
    font-style: italic;
  }
}

.error-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.error-help {
  margin-top: var(--spacing-md);

  .help-text {
    font-size: var(--text-sm);
    color: var(--mobile-text-tertiary);
    margin: 0;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-error-page {
    padding: var(--spacing-2xl);
  }

  .error-container {
    max-width: 500px;
  }
}
</style>
