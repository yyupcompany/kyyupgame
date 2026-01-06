<template>
  <div class="custom-layout-container">
    <!-- 自定义侧边栏 -->
    <div class="custom-sidebar" :class="{ 'sidebar-hidden': hideSidebar }">
      <h2 class="sidebar-title">自定义侧边栏</h2>
      <el-menu
        default-active="/dashboard"
        background-color="var(--sidebar-bg)"
        text-color="var(--sidebar-text)"
        active-text-color="var(--primary-color)"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>数据看板</template>
        </el-menu-item>
        <el-menu-item index="/system/dashboard">
          <el-icon><Setting /></el-icon>
          <template #title>系统概览</template>
        </el-menu-item>
        <el-menu-item index="/dashboard/CustomLayout">
          <el-icon><Grid /></el-icon>
          <template #title>自定义布局</template>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 主内容区域 -->
    <div class="custom-main-container" :class="{ 'main-expanded': hideSidebar }">
      <!-- 自定义顶部导航 -->
      <div class="custom-navbar">
        <div class="navbar-title">
          <el-button type="primary" @click="toggleSidebar">
            {{ hideSidebar ? '显示侧边栏' : '隐藏侧边栏' }}
          </el-button>
          自定义顶部导航
        </div>
        <div class="navbar-actions">
          <el-button type="primary" size="small">刷新</el-button>
          <el-button type="success" size="small">导出</el-button>
        </div>
      </div>
      
      <!-- 自定义内容区域 -->
      <div class="custom-main">
        <div class="page-header">
          <h1 class="page-title">自定义布局示例</h1>
          <p class="page-description">这是一个完全自定义的页面布局示例，独立于MainLayout</p>
        </div>
        
        <el-card class="demo-card">
          <div class="card-content">
            <el-result
              icon="success"
              title="自定义布局成功"
              sub-title="您已成功创建了一个独立的自定义布局页面"
            >
              <template #extra>
                <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
              </template>
            </el-result>
          </div>
        </el-card>
        
        <el-card class="demo-card">
          <template #header>
            <div class="card-header">
              <span>侧边栏控制</span>
            </div>
          </template>
          <div class="card-content">
            <p>当前侧边栏状态: <strong>{{ hideSidebar ? '隐藏' : '显示' }}</strong></p>
            <el-button type="primary" @click="toggleSidebar">
              {{ hideSidebar ? '显示侧边栏' : '隐藏侧边栏' }}
            </el-button>
            <p class="tip">提示: 这是一个独立的自定义布局，不依赖于MainLayout组件</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DataBoard, Setting, Grid } from '@element-plus/icons-vue'

// 状态变量
const hideSidebar = ref(false)

// 切换侧边栏显示/隐藏
const toggleSidebar = () => {
  hideSidebar.value = !hideSidebar.value
}
</script>

<style lang="scss">
/* 使用全局样式架构 - 不需要导入，直接使用系统类 */

/* 自定义布局容器 - 基于系统的 main-layout 类 */
.custom-layout-container {
  @extend .main-layout;
}

/* 自定义侧边栏 - 使用系统变量 */
.custom-sidebar {
  width: 250px;
  height: 100vh;
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  transition: all var(--transition-base);
  flex-shrink: 0;
  
  &.sidebar-hidden {
    width: 0;
    overflow: hidden;
  }
}

/* 主内容容器 - 基于系统的 main-container 类 */
.custom-main-container {
  @extend .main-container;
  
  &.main-expanded {
    margin-left: 0;
  }
}

.sidebar-title {
  height: 60px;
  line-height: 60px;
  text-align: center;
  border-bottom: var(--border-width-base) solid var(--sidebar-border);
  margin: 0;
  font-size: var(--text-base);
  color: var(--sidebar-text);
}

/* 自定义顶部导航 - 基于系统的 navbar 类 */
.custom-navbar {
  @extend .navbar;
}

.navbar-title {
  font-size: var(--text-lg);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-primary);
}

.navbar-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 自定义内容区域 - 基于系统的 page-content 类 */
.custom-main {
  @extend .page-content;
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--app-margin);
  
  .page-title {
    margin: 0 0 var(--app-gap-sm) 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .page-description {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--text-base);
  }
}

.demo-card {
  margin-bottom: var(--app-margin);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.card-content {
  padding: var(--app-padding);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }
}

.tip {
  margin-top: var(--app-gap);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .custom-navbar {
    padding: 0 var(--app-padding-sm);
    
    .navbar-title {
      font-size: var(--text-base);
      gap: var(--app-gap-sm);
    }
    
    .navbar-actions {
      gap: var(--app-gap-xs);
    }
  }
  
  .custom-main {
    padding: var(--app-padding-sm);
  }
  
  .card-content {
    padding: var(--app-padding-sm);
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .custom-sidebar {
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
  }
  
  .sidebar-title {
    border-color: var(--sidebar-border);
    color: var(--sidebar-text);
  }
  
  .custom-navbar {
    background-color: var(--bg-card);
    border-color: var(--border-color);
  }
  
  .demo-card {
    background: var(--bg-card);
    border-color: var(--border-color);
  }
}
</style>

