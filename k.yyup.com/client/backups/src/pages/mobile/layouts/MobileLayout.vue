<template>
  <div class="mobile-layout">
    <!-- 移动端头部 -->
    <MobileHeader 
      v-if="showHeader"
      :title="pageTitle"
      :show-back="showBack"
      :show-share="showShare"
      @back="handleBack"
      @share="handleShare"
    />
    
    <!-- 页面内容 -->
    <div class="mobile-content" :class="contentClass">
      <slot />
    </div>
    
    <!-- 底部导航 -->
    <MobileTabBar 
      v-if="showTabBar"
      :current-tab="currentTab"
      @tab-change="handleTabChange"
    />
    
    <!-- 全局加载 -->
    <MobileLoading v-if="loading" />
    
    <!-- 全局提示 -->
    <MobileToast 
      v-if="toast.show"
      :type="toast.type"
      :message="toast.message"
      @close="closeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMobileStore } from '../stores/mobile'
import MobileHeader from '../components/common/MobileHeader.vue'
import MobileTabBar from '../components/common/MobileTabBar.vue'
import MobileLoading from '../components/common/MobileLoading.vue'
import MobileToast from '../components/common/MobileToast.vue'

interface Props {
  // 页面标题
  title?: string
  // 是否显示头部
  showHeader?: boolean
  // 是否显示返回按钮
  showBack?: boolean
  // 是否显示分享按钮
  showShare?: boolean
  // 是否显示底部导航
  showTabBar?: boolean
  // 当前标签页
  currentTab?: string
  // 内容区域样式类
  contentClass?: string
  // 是否全屏
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showBack: true,
  showShare: false,
  showTabBar: false,
  fullscreen: false
})

const emit = defineEmits<{
  back: []
  share: []
  tabChange: [tab: string]
}>()

const router = useRouter()
const route = useRoute()
const mobileStore = useMobileStore()

// 响应式数据
const loading = computed(() => mobileStore.loading)
const toast = computed(() => mobileStore.toast)

// 页面标题
const pageTitle = computed(() => {
  return props.title || route.meta?.title || '页面'
})

// 内容区域样式
const contentClass = computed(() => {
  const classes = ['mobile-content-inner']
  
  if (props.fullscreen) {
    classes.push('mobile-content-fullscreen')
  }
  
  if (props.showHeader) {
    classes.push('mobile-content-with-header')
  }
  
  if (props.showTabBar) {
    classes.push('mobile-content-with-tabbar')
  }
  
  if (props.contentClass) {
    classes.push(props.contentClass)
  }
  
  return classes
})

// 事件处理
const handleBack = () => {
  emit('back')
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile')
  }
}

const handleShare = () => {
  emit('share')
}

const handleTabChange = (tab: string) => {
  emit('tabChange', tab)
}

const closeToast = () => {
  mobileStore.hideToast()
}

// 生命周期
onMounted(() => {
  // 设置移动端视口
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  }
  
  // 禁用双击缩放
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
  document.addEventListener('gesturestart', handleGestureStart, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('gesturestart', handleGestureStart)
})

// 触摸事件处理
let lastTouchEnd = 0
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault()
  }
  
  const now = Date.now()
  if (now - lastTouchEnd <= 300) {
    e.preventDefault()
  }
  lastTouchEnd = now
}

const handleGestureStart = (e: Event) => {
  e.preventDefault()
}
</script>

<style lang="scss" scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--mobile-bg-color, var(--bg-gray));
  overflow: hidden;
  position: relative;
}

.mobile-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.mobile-content-inner {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  &.mobile-content-fullscreen {
    padding: 0;
  }
  
  &.mobile-content-with-header {
    padding-top: 0;
  }
  
  &.mobile-content-with-tabbar {
    padding-bottom: 0;
  }
}

// 移动端优化
@media (max-width: var(--breakpoint-md)) {
  .mobile-layout {
    font-size: var(--text-base);
  }
  
  .mobile-content-inner {
    padding: var(--text-lg);
    
    &.mobile-content-fullscreen {
      padding: 0;
    }
  }
}

// 安全区域适配
@supports (padding: max(0px)) {
  .mobile-layout {
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }
}

// 横屏适配
@media (orientation: landscape) and (max-height: 500px) {
  .mobile-content-inner {
    padding: var(--spacing-sm) var(--text-lg);
  }
}
</style>
