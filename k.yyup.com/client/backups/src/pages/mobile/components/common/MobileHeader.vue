<template>
  <div class="mobile-header" :class="headerClass">
    <!-- 左侧区域 -->
    <div class="mobile-header-left">
      <button 
        v-if="showBack" 
        class="mobile-header-btn mobile-back-btn"
        @click="handleBack"
      >
        <svg class="mobile-icon" viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      
      <slot name="left" />
    </div>
    
    <!-- 中间标题区域 -->
    <div class="mobile-header-center">
      <h1 class="mobile-header-title">{{ title }}</h1>
      <p v-if="subtitle" class="mobile-header-subtitle">{{ subtitle }}</p>
    </div>
    
    <!-- 右侧区域 -->
    <div class="mobile-header-right">
      <button 
        v-if="showShare" 
        class="mobile-header-btn mobile-share-btn"
        @click="handleShare"
      >
        <svg class="mobile-icon" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
      </button>
      
      <button 
        v-if="showMenu" 
        class="mobile-header-btn mobile-menu-btn"
        @click="handleMenu"
      >
        <svg class="mobile-icon" viewBox="0 0 24 24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 标题
  title: string
  // 副标题
  subtitle?: string
  // 是否显示返回按钮
  showBack?: boolean
  // 是否显示分享按钮
  showShare?: boolean
  // 是否显示菜单按钮
  showMenu?: boolean
  // 头部样式
  variant?: 'default' | 'transparent' | 'gradient'
  // 是否固定
  fixed?: boolean
  // 是否显示阴影
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  showShare: false,
  showMenu: false,
  variant: 'default',
  fixed: true,
  shadow: true
})

const emit = defineEmits<{
  back: []
  share: []
  menu: []
}>()

// 计算头部样式类
const headerClass = computed(() => {
  const classes = []
  
  if (props.variant !== 'default') {
    classes.push(`mobile-header-${props.variant}`)
  }
  
  if (props.fixed) {
    classes.push('mobile-header-fixed')
  }
  
  if (props.shadow) {
    classes.push('mobile-header-shadow')
  }
  
  return classes
})

// 事件处理
const handleBack = () => {
  emit('back')
}

const handleShare = () => {
  emit('share')
}

const handleMenu = () => {
  emit('menu')
}
</script>

<style lang="scss" scoped>
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--button-height-xl);
  padding: 0 var(--text-lg);
  background-color: var(--mobile-header-bg, var(--el-bg-color));
  color: var(--mobile-header-color, var(--el-text-color-primary));
  border-bottom: var(--border-width-base) solid var(--mobile-border-color, var(--el-border-color));
  z-index: 1000;
  
  &.mobile-header-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
  
  &.mobile-header-shadow {
    box-shadow: var(--shadow-sm);
  }

  &.mobile-header-transparent {
    background-color: transparent;
    border-bottom: none;
    color: var(--text-on-primary);
  }

  &.mobile-header-gradient {
    background: var(--bg-gradient, linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%));
    color: var(--text-on-primary);
    border-bottom: none;
  }
}

.mobile-header-left,
.mobile-header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 60px;
}

.mobile-header-left {
  justify-content: flex-start;
}

.mobile-header-right {
  justify-content: flex-end;
}

.mobile-header-center {
  flex: 1;
  text-align: center;
  padding: 0 var(--text-lg);
  overflow: hidden;
}

.mobile-header-title {
  font-size: var(--text-xl);
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-header-subtitle {
  font-size: var(--text-sm);
  opacity: 0.7;
  margin: var(--spacing-sm) 0 0 0;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4var(--spacing-xs);
  height: var(--button-height-lg);
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--bg-hover);
  }

  &:active {
    background-color: var(--bg-active);
    transform: scale(0.95);
  }
}

.mobile-icon {
  width: var(--text-3xl);
  height: var(--text-3xl);
  fill: currentColor;
}

// 安全区域适配
@supports (padding: max(0px)) {
  .mobile-header.mobile-header-fixed {
    padding-top: max(0px, env(safe-area-inset-top));
    height: calc(56px + max(0px, env(safe-area-inset-top)));
  }
}

// 暗色主题
@media (prefers-color-scheme: dark) {
  .mobile-header {
    --mobile-header-bg: #1a1a1a;
    --mobile-header-color: var(--bg-color);
    --mobile-border-color: var(--text-primary);
  }
}

// 小屏幕适配
@media (max-width: 375px) {
  .mobile-header {
    padding: 0 var(--text-sm);
  }
  
  .mobile-header-center {
    padding: 0 var(--text-sm);
  }
  
  .mobile-header-title {
    font-size: var(--text-lg);
  }
  
  .mobile-header-btn {
    width: var(--icon-size); height: var(--icon-size);
  }
  
  .mobile-icon {
    width: var(--text-2xl);
    height: var(--text-2xl);
  }
}
</style>
