<template>
  <div class="center-container unified-center-layout">
    <!-- 统计卡片区域（可选） -->
    <div v-if="$slots.stats" class="stats-cards">
      <el-row :gutter="20">
        <slot name="stats" />
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'full-width': fullWidth }">
      <el-row :gutter="fullWidth ? 0 : 20">
        <!-- 左侧主要内容 -->
        <el-col
          :xs="24"
          :sm="24"
          :md="mainColMd"
          :lg="mainColLg"
          :xl="mainColXl"
        >
          <div class="content-section" :class="{ 'full-width': fullWidth }">
            <slot />
          </div>
        </el-col>

        <!-- 右侧边栏（可选） -->
        <el-col
          v-if="$slots.sidebar"
          :xs="24"
          :sm="24"
          :md="sidebarColMd"
          :lg="sidebarColLg"
          :xl="sidebarColXl"
        >
          <div class="sidebar-content">
            <slot name="sidebar" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description?: string
  /** 页面图标 */
  icon?: any
  /** 主要内容列的响应式配置 */
  mainColMd?: number
  mainColLg?: number
  mainColXl?: number
  /** 侧边栏列的响应式配置 */
  sidebarColMd?: number
  sidebarColLg?: number
  sidebarColXl?: number
  /** 是否使用全宽度布局（移除边距） */
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mainColMd: 24,
  mainColLg: 18,
  mainColXl: 16,
  sidebarColMd: 24,
  sidebarColLg: 6,
  sidebarColXl: 8,
  fullWidth: false
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.unified-center-layout {
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: none;
  overflow-x: hidden;
  position: relative;

  // 🎯 响应式容器优化
  @media (min-width: var(--breakpoint-2xl)) {
    padding: var(--spacing-xl);
    max-width: 1400px;
    margin: 0 auto;
  }

  @media (min-width: 1920px) {
    max-width: 1600px;
    padding: var(--spacing-2xl);
  }

  // 🎯 玻璃态效果 - 与工作台保持一致
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 10% 20%, var(--white-alpha-10) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, var(--white-alpha-10) 0%, transparent 20%);
    pointer-events: none;
    z-index: -1;
  }
}


.stats-cards {
  margin-bottom: var(--spacing-xl);
}

.main-content {
  .content-section,
  .sidebar-content {
    background: var(--el-bg-color);
    border-radius: var(--radius-md);
    box-shadow: 0 2px var(--text-sm) var(--shadow-light);
    overflow: hidden;
  }

  .content-section {
    padding: var(--spacing-lg);

    &.full-width {
      padding: 0;
      width: 100%;
      max-width: none;
    }
  }

  .sidebar-content {
    padding: var(--spacing-md);
  }

  &.full-width {
    width: 100%;
    max-width: none;
    padding: 0;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .unified-center-layout {
    padding: var(--spacing-md);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .unified-center-layout {
    padding: var(--spacing-sm);
  }

  .main-content {
    .content-section {
      padding: var(--spacing-md);
    }

    .sidebar-content {
      padding: var(--spacing-sm);
    }
  }
}
</style>