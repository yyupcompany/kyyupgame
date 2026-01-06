<template>
  <div 
    class="page-container" 
    :class="[
      containerClass,
      {
        'is-loading': loading,
        'has-sidebar': hasSidebar,
        'is-fluid': fluid,
        'is-centered': centered
      }
    ]"
  >
    <!-- 页面头部 -->
    <div v-if="$slots.header" class="page-header">
      <slot name="header" />
    </div>

    <!-- 主要内容区域 -->
    <div class="page-main" :class="{ 'with-padding': padding }">
      <!-- 侧边栏 -->
      <aside v-if="$slots.sidebar" class="page-sidebar">
        <slot name="sidebar" />
      </aside>

      <!-- 内容区域 -->
      <main class="page-content">
        <!-- 面包屑导航 -->
        <nav v-if="$slots.breadcrumb" class="page-breadcrumb">
          <slot name="breadcrumb" />
        </nav>

        <!-- 页面标题区域 -->
        <header v-if="$slots.title || title" class="page-title-section">
          <div class="page-title-wrapper">
            <h1 v-if="title" class="page-title">{{ title }}</h1>
            <slot v-else name="title" />
            
            <div v-if="$slots.actions" class="page-actions">
              <slot name="actions" />
            </div>
          </div>
          
          <div v-if="$slots.description || description" class="page-description">
            <p v-if="description">{{ description }}</p>
            <slot v-else name="description" />
          </div>
        </header>

        <!-- 工具栏 -->
        <div v-if="$slots.toolbar" class="page-toolbar">
          <slot name="toolbar" />
        </div>

        <!-- 主要内容 -->
        <div class="page-body">
          <!-- 加载状态 -->
          <div v-if="loading" class="page-loading">
            <el-skeleton :rows="skeletonRows" animated />
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="error" class="page-error">
            <el-empty :description="error" :image-size="var(--icon-size-3xl)">
              <template #image>
                <UnifiedIcon name="default" />
              </template>
              <el-button v-if="onRetry" type="primary" @click="onRetry">
                重试
              </el-button>
            </el-empty>
          </div>
          
          <!-- 正常内容 -->
          <div v-else class="page-content-wrapper">
            <slot />
          </div>
        </div>
      </main>
    </div>

    <!-- 页面底部 -->
    <footer v-if="$slots.footer" class="page-footer">
      <slot name="footer" />
    </footer>

    <!-- 浮动操作按钮 -->
    <div v-if="$slots.fab" class="page-fab">
      <slot name="fab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

interface Props {
  /** 页面标题 */
  title?: string
  /** 页面描述 */
  description?: string
  /** 是否显示加载状态 */
  loading?: boolean
  /** 错误信息 */
  error?: string
  /** 重试回调 */
  onRetry?: () => void
  /** 自定义容器类名 */
  containerClass?: string | string[]
  /** 是否有侧边栏 */
  hasSidebar?: boolean
  /** 是否流式布局（不限制最大宽度） */
  fluid?: boolean
  /** 是否居中布局 */
  centered?: boolean
  /** 是否显示内边距 */
  padding?: boolean
  /** 骨架屏行数 */
  skeletonRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasSidebar: false,
  fluid: false,
  centered: false,
  padding: true,
  skeletonRows: 10
})

// 计算属性
const containerClass = computed(() => {
  if (Array.isArray(props.containerClass)) {
    return props.containerClass.join(' ')
  }
  return props.containerClass || ''
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/mixins/responsive.scss' as *;

.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-page);
  
  /* 容器布局 - Container Layout */
  &.is-fluid {
    max-width: none;
  }
  
  &.is-centered {
    @include responsive-container;
  }
  
  &:not(.is-fluid):not(.is-centered) {
    @include container;
  }
  
  /* 加载状态 - Loading State */
  &.is-loading {
    pointer-events: none;
    user-select: none;
  }
}

/* 页面头部 - Page Header */
.page-header {
  background-color: var(--bg-card);
  border-bottom: var(--border-width) solid var(--border-color-light);
  padding: var(--spacing-md) var(--spacing-lg);
  
  @include mobile {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

/* 主要内容区域 - Main Content Area */
.page-main {
  flex: 1;
  display: flex;
  min-height: 0; /* 防止flex子项溢出 */
  
  &.with-padding {
    padding: var(--spacing-lg);
    
    @include mobile {
      padding: var(--spacing-md);
    }
  }
  
  /* 有侧边栏的布局 - Layout with Sidebar */
  .page-container.has-sidebar & {
    @include mobile {
      flex-direction: column;
    }
  }
}

/* 侧边栏 - Sidebar */
.page-sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-card);
  border-right: var(--border-width) solid var(--border-color-light);
  padding: var(--spacing-lg);
  
  @include mobile {
    width: 100%;
    border-right: none;
    border-bottom: var(--border-width) solid var(--border-color-light);
    padding: var(--spacing-md);
  }
}

/* 内容区域 - Content Area */
.page-content {
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
  display: flex;
  flex-direction: column;
}

/* 面包屑导航 - Breadcrumb */
.page-breadcrumb {
  margin-bottom: var(--spacing-md);
  
  @include mobile {
    margin-bottom: var(--spacing-sm);
  }
}

/* 页面标题区域 - Page Title Section */
.page-title-section {
  margin-bottom: var(--spacing-lg);
  
  @include mobile {
    margin-bottom: var(--spacing-md);
  }
}

.page-title-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  
  @include mobile {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
}

.page-title {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: var(--leading-tight);
  
  @include mobile {
    font-size: var(--spacing-xl);
  }
}

.page-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
  
  @include mobile {
    justify-content: flex-start;
  }
}

.page-description {
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  
  p {
    margin: 0;
  }
}

/* 工具栏 - Toolbar */
.page-toolbar {
  background-color: var(--bg-card);
  border: var(--border-width) solid var(--border-color-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  @include mobile {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }
}

/* 页面主体 - Page Body */
.page-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 内容包装器 - Content Wrapper */
.page-content-wrapper {
  flex: 1;
  
  /* 确保内容可以滚动 */
  overflow: auto;
  
  /* 添加滚动条样式 */
  &::-webkit-scrollbar {
    width: var(--spacing-xs);
    height: var(--spacing-xs);
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: var(--radius-sm);
    
    &:hover {
      background: var(--border-color-dark);
    }
  }
}

/* 加载状态 - Loading State */
.page-loading {
  padding: var(--spacing-xl);
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--border-color-light);
}

/* 错误状态 - Error State */
.page-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--size-20);
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--border-color-light);
  padding: var(--spacing-xl);
}

/* 页面底部 - Page Footer */
.page-footer {
  background-color: var(--bg-card);
  border-top: var(--z-index-dropdown) solid var(--border-color-light);
  padding: var(--spacing-md) var(--spacing-lg);
  margin-top: auto;
  
  @include mobile {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

/* 浮动操作按钮 - Floating Action Button */
.page-fab {
  position: fixed;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: var(--z-fixed);
  
  @include mobile {
    bottom: var(--spacing-lg);
    right: var(--spacing-lg);
  }
}

/* 响应式优化 - Responsive Optimizations */
@include mobile {
  .page-container {
    .page-title-wrapper {
      .page-actions {
        width: 100%;
        
        /* 按钮在移动端堆叠 */
        :deep(.el-button) {
          flex: 1;
          min-width: 0;
        }
      }
    }
  }
}

/* 无障碍支持 - Accessibility Support */
@media (prefers-reduced-motion: reduce) {
  .page-content-wrapper {
    scroll-behavior: auto;
  }
}

/* 打印样式 - Print Styles */
@media print {
  .page-container {
    background: var(--bg-primary);
    
    .page-header,
    .page-footer,
    .page-toolbar,
    .page-fab {
      display: none;
    }
    
    .page-title {
      color: var(--text-primary);
    }
  }
}

/* 暗色主题适配 - Dark Theme Adaptation */
[data-theme="dark"] {
  .page-container {
    background-color: var(--bg-color-page);
  }
  
  .page-header,
  .page-sidebar,
  .page-toolbar,
  .page-loading,
  .page-error {
    background-color: var(--bg-card);
    border-color: var(--border-color);
  }
  
  .page-title {
    color: var(--text-primary);
  }
  
  .page-description {
    color: var(--text-secondary);
  }
}</style>