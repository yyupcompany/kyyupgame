<template>
  <div class="page-loading-guard">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
        <div class="loading-progress">
          <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="loading-tips">
          <p v-if="showTips">{{ currentTip }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="hasError" class="error-container">
      <div class="error-content">
        <h3>页面加载超时</h3>
        <p>抱歉，页面加载时间过长，请尝试以下解决方案：</p>
        <ul class="error-solutions">
          <li>刷新页面重试</li>
          <li>检查网络连接</li>
          <li>返回首页</li>
        </ul>
        <div class="error-actions">
          <button @click="handleRetry" class="retry-btn">重试</button>
          <button @click="handleGoHome" class="home-btn">返回首页</button>
        </div>
      </div>
    </div>
    
    <slot v-if="!isLoading && !hasError" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { navigationTimeoutFix } from '../utils/navigation-timeout-fix';

export default defineComponent({
  name: 'PageLoadingGuard',
  props: {
    timeout: {
      type: Number,
      default: 1500  // 减少默认超时时间到1.5秒
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const router = useRouter();
    const isLoading = ref(true);
    const hasError = ref(false);
    const loadingText = ref('正在加载...');
    const progress = ref(0);
    const showTips = ref(false);
    const currentTip = ref('');
    
    let timeoutId: NodeJS.Timeout | null = null;
    let progressInterval: NodeJS.Timeout | null = null;
    let tipInterval: NodeJS.Timeout | null = null;
    
    const loadingTips = [
      '正在连接服务器...',
      '正在验证用户权限...',
      '正在加载页面数据...',
      '正在优化显示效果...'
    ];
    
    const startLoading = () => {
      isLoading.value = true;
      hasError.value = false;
      progress.value = 0;
      
      // 启动进度条
      if (props.showProgress) {
        progressInterval = setInterval(() => {
          if (progress.value < 90) {
            progress.value += Math.random() * 10;
          }
        }, 200);
      }
      
      // 启动提示轮换
      setTimeout(() => {
        showTips.value = true;
        let tipIndex = 0;
        currentTip.value = loadingTips[tipIndex];
        
        tipInterval = setInterval(() => {
          tipIndex = (tipIndex + 1) % loadingTips.length;
          currentTip.value = loadingTips[tipIndex];
        }, 800);
      }, 1000);
      
      // 设置超时 - localhost环境使用更短的超时时间
      const actualTimeout = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? Math.min(props.timeout, 800)  // localhost环境最大800ms
        : props.timeout;
      
      timeoutId = setTimeout(() => {
        handleTimeout();
      }, actualTimeout);
    };
    
    const finishLoading = () => {
      isLoading.value = false;
      progress.value = 100;
      clearAllTimers();
      emit('loaded');
    };
    
    const handleTimeout = () => {
      console.warn('⚠️ PageLoadingGuard: 页面加载超时');
      isLoading.value = false;
      hasError.value = true;
      clearAllTimers();
      emit('timeout');
    };
    
    const clearAllTimers = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      if (tipInterval) {
        clearInterval(tipInterval);
        tipInterval = null;
      }
    };
    
    const handleRetry = () => {
      hasError.value = false;
      startLoading();
      emit('retry');
      
      // 重新加载当前页面
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };
    
    const handleGoHome = () => {
      router.push('/');
    };
    
    // 检查localhost环境并快速完成加载
    const checkFastLoad = () => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // localhost环境下超快速加载，避免导航超时
        setTimeout(() => {
          finishLoading();
        }, 100);  // 减少到100ms，立即完成
      } else {
        // 其他环境也要快速加载
        setTimeout(() => {
          finishLoading();
        }, 500);  // 减少到500ms
      }
    };
    
    onMounted(() => {
      startLoading();
      checkFastLoad();
    });
    
    onUnmounted(() => {
      clearAllTimers();
    });
    
    return {
      isLoading,
      hasError,
      loadingText,
      progress,
      showTips,
      currentTip,
      handleRetry,
      handleGoHome,
      finishLoading
    };
  }
});
</script>

<style scoped>
.page-loading-guard {
  min-height: 100vh;
  position: relative;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--white-alpha-90);
  z-index: var(--z-index-fixed)9;
}

.loading-spinner {
  text-align: center;
  padding: var(--spacing-lg);
}

.spinner {
  width: var(--icon-size); height: var(--icon-size);
  border: var(--spacing-xs) solid #f3f3f3;
  border-top: var(--spacing-xs) solid var(--primary-color);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-xl);
}

.loading-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.loading-progress {
  max-width: 200px; width: 100%;
  height: var(--spacing-xs);
  background-color: var(--bg-gray-light);
  border-radius: var(--radius-xs);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  margin: 0 auto var(--spacing-xl);
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: var(--radius-xs);
  transition: width 0.3s ease;
}

.loading-tips {
  min-height: var(--spacing-xl);
}

.loading-tips p {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.error-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--white-alpha-95);
  z-index: var(--z-index-fixed)9;
}

.error-content {
  text-align: center;
  padding: var(--spacing-10xl);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  max-width: 100%; max-width: 400px;
}

.error-content h3 {
  color: var(--danger-color);
  margin-bottom: var(--spacing-xl);
}

.error-solutions {
  text-align: left;
  margin: var(--spacing-lg) 0;
  padding-left: var(--spacing-xl);
}

.error-solutions li {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.error-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.retry-btn,
.home-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--spacing-xs);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: background-color 0.3s;
}

.retry-btn {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
}

.retry-btn:hover {
  background-color: var(--primary-hover);
}

.home-btn {
  background-color: var(--info-color);
  color: var(--text-on-primary);
}

.home-btn:hover {
  background-color: var(--info-dark);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>