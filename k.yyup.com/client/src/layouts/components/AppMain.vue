<template>
  <div class="app-main">
    <!-- 内容区域标题 -->
    <div class="content-header">
      <h2 class="content-title">仪表盘</h2>
      <p class="content-description"></p>
    </div>
    
    <!-- 路由视图 -->
    <div class="router-view-container">
      <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
          <keep-alive :include="cachedViews">
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'AppMain',
  setup() {
    // 需要缓存的页面组件名称列表
    const cachedViews = ref([
      'DashboardInLayout',
      'SystemDashboard',
      'UserManagement',
      'RoleManagement'
    ])
    
    return {
      cachedViews
    }
  }
})
</script>

<style scoped>
@use '@/styles/index.scss' as *;

/* 主内容区域样式 */
.app-main {
  flex: 1;
  overflow: auto;
  height: calc(100vh - 60px);
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  background-color: var(--bg-secondary);
}

/* 内容区域标题样式 */
.content-header {
  margin: 0;
  padding: var(--app-gap-sm) var(--text-2xl);
  background-color: var(--bg-primary);
  width: 100%;
  box-sizing: border-box;
  border-bottom: var(--border-width-base) solid var(--border-color);
}

.content-title {
  margin: 0 0 10px 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
  font-weight: 600;
}

.content-description {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* 路由视图容器 */
.router-view-container {
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all var(--transition-duration);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 响应式调整 */
@media (max-width: var(--breakpoint-md)) {
  .content-header {
    padding: var(--app-gap-sm);
  }
  
  .router-view-container {
    padding: 0;
  }
}

// 使用全局滚动条样式

// 增强过渡效果
.fade-transform-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fade-transform-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

// 路由视图内容样式
.router-view-container {
  > * {
    animation: slideInUp 0.3s ease-out;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(var(--text-2xl));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 