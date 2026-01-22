<!--
  MobileSubPageLayout.vue - 移动端子页面统一布局
  Mobile Sub-Page Unified Layout
  
  用于中心详情页面，统一样式和主题切换
  Features:
  1. 统一头部导航（返回按钮、标题、主题切换）
  2. 内容区域自适应主题
  3. 不显示底部导航
-->
<template>
  <div class="mobile-sub-page" :class="themeClass">
    <!-- 头部导航 -->
    <van-nav-bar
      :title="title"
      :border="false"
      fixed
      placeholder
      left-arrow
      @click-left="handleBack"
      :class="['sub-page-header', isDark ? 'dark-header' : '']"
    >
      <template #right>
        <div class="header-actions">
          <!-- 主题切换 -->
          <div class="action-btn" @click="handleToggleTheme" title="切换主题">
            <van-icon
              :name="isDark ? 'sun-o' : 'star-o'"
              size="20"
              :style="{ color: isDark ? '#fbbf24' : 'var(--text-secondary)' }"
            />
          </div>
          <!-- 自定义右侧按钮 -->
          <slot name="right"></slot>
        </div>
      </template>
    </van-nav-bar>

    <!-- 主内容区 -->
    <div class="sub-page-content" :style="contentStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { toggleTheme } from '@/utils/theme'

// Props
interface Props {
  title?: string
  backPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '详情',
  backPath: ''
})

const emit = defineEmits<{
  'back': []
}>()

const router = useRouter()

// 主题状态
const isDark = ref(false)
const themeClass = computed(() => isDark.value ? 'theme-dark' : 'theme-light')

// 检测主题
const detectTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  isDark.value = htmlTheme === 'dark'
}

// 切换主题
const handleToggleTheme = () => {
  toggleTheme()
  setTimeout(detectTheme, 100)
}

// 返回
const handleBack = () => {
  emit('back')
  if (props.backPath) {
    router.push(props.backPath)
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile/centers')
  }
}

// 内容样式
const contentStyle = computed(() => ({
  background: isDark.value ? '#0f172a' : 'var(--bg-color-page)',
  minHeight: 'calc(100vh - 46px)'
}))

// 监听主题变化
let observer: MutationObserver | null = null

onMounted(() => {
  detectTheme()
  observer = new MutationObserver(detectTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style lang="scss" scoped>
.mobile-sub-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-page);
  transition: all 0.3s ease;

  &.theme-dark {
    background-color: #0f172a;
  }
}

// 头部导航
.sub-page-header {
  background: #ffffff !important;
  border-bottom: 1px solid #e4e7ed !important;

  :deep(.van-nav-bar__content) {
    background: #ffffff !important;
  }

  :deep(.van-nav-bar__title) {
    color: #2c3e50 !important;
    font-weight: 600;
  }

  :deep(.van-nav-bar__left .van-icon) {
    color: #2c3e50 !important;
  }

  &.dark-header {
    background: #1e293b !important;
    border-bottom: 1px solid #334155 !important;

    :deep(.van-nav-bar__content) {
      background: #1e293b !important;
    }

    :deep(.van-nav-bar__title) {
      color: #f1f5f9 !important;
    }

    :deep(.van-nav-bar__left .van-icon) {
      color: #94a3b8 !important;
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.05);
  }
}

// 内容区
.sub-page-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

// 暗黑主题全局样式
.theme-dark {
  .sub-page-content {
    background: #0f172a;
  }

  :deep(.van-cell-group) {
    background: #1e293b !important;
    
    .van-cell {
      background: #1e293b !important;
      
      &::after {
        border-color: #334155 !important;
      }
    }
    
    .van-cell__title, .van-cell__value {
      color: #f1f5f9 !important;
    }
    
    .van-cell__label {
      color: #94a3b8 !important;
    }
  }

  :deep(.van-list) {
    background: #0f172a !important;
    
    .van-cell {
      background: #1e293b !important;
      
      &::after {
        border-color: #334155 !important;
      }
      
      .van-cell__title, .van-cell__value {
        color: #f1f5f9 !important;
      }
    }
  }

  :deep(.van-empty) {
    .van-empty__description {
      color: #94a3b8 !important;
    }
  }
  
  :deep(.van-search) {
    background: #1e293b !important;
    
    .van-search__content {
      background: #334155 !important;
    }
    
    .van-field__control {
      color: #f1f5f9 !important;
      
      &::placeholder {
        color: #64748b !important;
      }
    }
  }
  
  :deep(.van-dropdown-menu) {
    background: #1e293b !important;
    
    .van-dropdown-menu__bar {
      background: #1e293b !important;
    }
    
    .van-dropdown-menu__title {
      color: #f1f5f9 !important;
    }
  }
  
  :deep(.van-dropdown-item__content) {
    background: #1e293b !important;
  }
  
  :deep(.van-cell-group--inset) {
    margin: 12px !important;
  }
  
  :deep(.mobile-list) {
    background: #0f172a !important;
    
    .list-items {
      background: #0f172a !important;
    }
  }
  
  :deep(.stats-container) {
    background: #0f172a !important;
    
    .stat-card {
      background: #1e293b !important;
      
      .stat-value {
        color: #f1f5f9 !important;
      }
      
      .stat-label {
        color: #94a3b8 !important;
      }
    }
  }
}

// 明亮主题样式
.theme-light {
  :deep(.van-cell-group) {
    background: #ffffff !important;
    
    .van-cell {
      background: #ffffff !important;
    }
  }
  
  :deep(.van-list) {
    background: var(--bg-color-page, #f7f8fa) !important;
  }
  
  :deep(.mobile-list) {
    background: var(--bg-color-page, #f7f8fa) !important;
    
    .list-items {
      background: var(--bg-color-page, #f7f8fa) !important;
    }
  }
  
  :deep(.stats-container) {
    background: #ffffff !important;
    
    .stat-card {
      background: #f7f8fa !important;
    }
  }
}
</style>

