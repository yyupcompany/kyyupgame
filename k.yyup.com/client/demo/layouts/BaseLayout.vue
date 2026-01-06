<template>
  <div class="base-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <SideLayout 
        :collapsed="sidebarCollapsed"
        @toggle="toggleSidebar"
      />
    </aside>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <header class="top-nav">
        <TabbarLayout 
          :sidebar-collapsed="sidebarCollapsed"
          @toggle-sidebar="toggleSidebar"
        />
      </header>
      
      <!-- 页面内容 -->
      <main class="page-content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SideLayout from './SideLayout.vue'
import TabbarLayout from './TabbarLayout.vue'

// 侧边栏状态
const sidebarCollapsed = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed.value))
}

// 响应式处理
const handleResize = () => {
  if (window.innerWidth < 768) {
    sidebarCollapsed.value = true
  }
}

onMounted(() => {
  // 恢复侧边栏状态
  const saved = localStorage.getItem('sidebar-collapsed')
  if (saved !== null) {
    sidebarCollapsed.value = saved === 'true'
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  handleResize()
  
  // 清理函数将在组件卸载时自动调用
  return () => {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style lang="scss" scoped>
.base-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}

.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: var(--border-width-base) solid var(--border-color);
  transition: all var(--transition-normal);
  flex-shrink: 0;
  z-index: 100;
  
  &.sidebar-collapsed {
    width: 80px;
  }
  
  @media (max-width: 76var(--spacing-sm)) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    
    &:not(.sidebar-collapsed) {
      transform: translateX(0);
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  
  @media (max-width: 76var(--spacing-sm)) {
    width: 100%;
  }
}

.top-nav {
  height: 6var(--spacing-xs);
  background: var(--bg-secondary);
  border-bottom: var(--border-width-base) solid var(--border-color);
  flex-shrink: 0;
  z-index: 50;
}

.page-content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
}

.content-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-lg);
  
  @media (max-width: 76var(--spacing-sm)) {
    padding: var(--spacing-md);
  }
}

// 页面切换动画
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-in-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 移动端遮罩
@media (max-width: 76var(--spacing-sm)) {
  .base-layout::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-fast);
  }
  
  .sidebar:not(.sidebar-collapsed) + .main-content::before {
    opacity: 1;
    visibility: visible;
  }
}
</style> 