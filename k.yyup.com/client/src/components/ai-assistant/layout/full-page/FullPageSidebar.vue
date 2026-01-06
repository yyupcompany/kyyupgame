<!--
  AI助手独立页面 - 左侧边栏组件
  快捷操作菜单和功能入口
-->

<template>
  <!-- ✅ 修复：移除 el-card，改用 div，避免白色背景覆盖 -->
  <div class="full-page-sidebar">
    <!-- 侧边栏头部 -->
    <div class="ai-sidebar-header">
      <UnifiedIcon name="magic-stick" :size="20" />
      <span>智能助手</span>
    </div>

    <!-- 菜单列表 + 一体化功能布局 -->
    <el-menu class="sidebar-menu" :default-active="activeIndex">
      <!-- 顶部：新对话主操作区域 -->
      <div class="primary-section">
        <div class="primary-section-text">
          <div class="primary-title">开始新的对话</div>
          <div class="primary-subtitle">让 AI 帮你处理园务、报表和家校沟通</div>
        </div>
        <el-button
          type="primary"
          class="new-conversation-btn"
          @click="emit('new-conversation')"
        >
          <UnifiedIcon name="chat-dot-round" :size="18" />
          <span>新对话</span>
        </el-button>
      </div>

      <el-divider />

      <!-- 统一的常用入口区域：整合快捷操作 + 常用功能 -->
      <div class="menu-section-header">
        <div class="menu-section-title">常用入口</div>
        <div class="menu-section-subtitle">把高频操作集中在一起，一步直达常用功能</div>
      </div>

      <!-- 园务快捷操作 -->
      <div class="menu-group">
        <div class="menu-group-label">园务快捷操作</div>
        <el-menu-item
          v-for="item in quickActions"
          :key="item.index"
          :index="item.index"
          @click="emit('quick-action', item.action)"
          class="menu-entry-item"
        >
          <UnifiedIcon :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
          <template #suffix>
            <UnifiedIcon name="arrow-right" :size="16" />
          </template>
        </el-menu-item>
      </div>

      <!-- AI 助手工具 -->
      <div class="menu-group">
        <div class="menu-group-label">AI 助手工具</div>
        <el-menu-item
          v-for="item in commonFeatures"
          :key="item.index"
          :index="item.index"
          @click="emit('common-feature', item.action)"
          class="menu-entry-item"
        >
          <UnifiedIcon :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
          <template v-if="item.suffixIcon" #suffix>
            <UnifiedIcon :name="item.suffixIcon" :size="16" />
          </template>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface MenuItem {
  index: string
  label: string
  icon: string
  action: string
  suffixIcon?: string
}

interface Props {
  activeIndex?: string
  quickActions?: MenuItem[]
  commonFeatures?: MenuItem[]
}

const props = withDefaults(defineProps<Props>(), {
  activeIndex: '1',
  quickActions: () => [
    { index: '2', label: '创建活动', icon: 'calendar', action: 'create-activity' },
    { index: '3', label: '检查考勤', icon: 'timer', action: 'check-attendance' },
    { index: '4', label: '生成报告', icon: 'data-analysis', action: 'generate-report' }
  ],
  commonFeatures: () => [
    { index: '5', label: '使用统计', icon: 'trend-charts', action: 'statistics', suffixIcon: 'info' },
    { index: '6', label: '设置偏好', icon: 'setting', action: 'settings', suffixIcon: 'setting' }
  ]
})

interface Emits {
  'new-conversation': []
  'quick-action': [action: string]
  'common-feature': [action: string]
}

const emit = defineEmits<Emits>()
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.full-page-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  /* 使用浅灰色背景 */
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

/* ✨ 使用独特的类名避免与全局 .sidebar-header 冲突 */
.ai-sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  /* 使用深紫色渐变背景 */
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: var(--text-sm);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .unified-icon {
    color: #ffffff;
  }

  span {
    flex: 1;
    color: #ffffff;
    font-weight: 600;
  }
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--spacing-xs);
  overflow-y: auto;

  /* 顶部新对话区域 - 紧凑设计 */
  .primary-section {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    border-radius: var(--radius-md);
    /* ✨ 修复：确保背景色可见 */
    background: #ffffff;
    box-shadow: var(--shadow-xs);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    border: 1px solid var(--border-color);
  }

  .primary-section-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .primary-title {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    /* ✨ 修复：使用深色文字确保可读性 */
    color: #1e293b;
  }

  .primary-subtitle {
    font-size: 11px;
    /* ✨ 修复：使用深灰色确保可读性 */
    color: #64748b;
    line-height: 1.3;
  }

  .new-conversation-btn {
    width: 100%;
    justify-content: center;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    box-shadow: var(--shadow-sm);
    height: 32px;
    font-size: var(--text-xs);

    .unified-icon {
      /* ✨ 修复：按钮图标使用白色 */
      color: #ffffff;
    }

    /* ✨ 修复：按钮文字使用白色 */
    :deep(span) {
      color: #ffffff;
    }
  }

  /* 常用入口区域标题 - 紧凑 */
  .menu-section-header {
    padding: 0 var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .menu-section-title {
    font-size: 11px;
    font-weight: var(--font-semibold);
    /* ✨ 修复：使用深色文字 */
    color: #1e293b;
  }

  .menu-section-subtitle {
    margin-top: 2px;
    font-size: 10px;
    /* ✨ 修复：使用灰色文字 */
    color: #64748b;
    line-height: 1.3;
  }

  /* 分组标签 */
  .menu-group {
    margin-bottom: var(--spacing-xs);
    padding-bottom: var(--spacing-xs);

    &:not(:last-child) {
      border-bottom: 1px dashed var(--border-color-light, var(--border-color));
    }
  }

  .menu-group-label {
    padding: 2px var(--spacing-sm);
    font-size: 10px;
    /* ✨ 修复：使用深灰色文字 */
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .el-divider {
    margin: var(--spacing-xs) var(--spacing-sm);
    border-color: var(--border-color);
  }

  .el-menu-item {
    height: 40px; /* ✨ 优化：增加高度到 40px，更易点击 */
    line-height: 40px;
    padding: 0 var(--spacing-sm);
    margin-bottom: 4px;
    border-radius: var(--radius-md);
    /* ✨ 优化：使用 GPU 加速的过渡动画 */
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    position: relative;
    overflow: hidden;
    cursor: pointer;

    /* ✨ 新增：涟漪效果容器 */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.3s ease-out;
      pointer-events: none;
    }

    &:hover::before {
      opacity: 1;
      transform: scale(1);
    }

    &:hover {
      background: var(--bg-hover);
      /* ✨ 优化：轻微缩放代替平移，更自然 */
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &.is-active {
      background: var(--primary-light-bg);
      color: var(--primary-color);
      font-weight: var(--font-medium);
      border-left: 3px solid var(--primary-color);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
    }

    &:active {
      transform: scale(0.98);
    }

    .unified-icon {
      color: var(--primary-color);
      flex-shrink: 0;
      transition: transform 0.2s ease-out;
    }

    &:hover .unified-icon {
      transform: scale(1.1);
    }

    :deep(span) {
      flex: 1;
      font-size: var(--text-sm);
      /* ✨ 修复：使用深色文字确保可读性 */
      color: #1e293b;
      font-weight: 500;
    }

    .el-tag {
      font-size: 10px;
    }

    .el-icon {
      font-size: var(--text-xs);
      /* ✨ 修复：使用灰色文字 */
      color: #64748b;
      transition: transform 0.2s ease-out;
    }

    &:hover .el-icon {
      transform: translateX(2px);
    }
  }
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: var(--radius-full);

  &:hover {
    background: #94a3b8;
  }
}

/* ✨ 新增：暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .full-page-sidebar {
    /* 暗色主题使用深色背景 */
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .primary-section {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .primary-title {
    color: #f1f5f9;
  }

  .primary-subtitle {
    color: #cbd5e1;
  }

  .menu-section-title {
    color: #f1f5f9;
  }

  .menu-section-subtitle {
    color: #cbd5e1;
  }

  .menu-group-label {
    color: #94a3b8;
  }

  .el-menu-item {
    &:hover {
      background: rgba(99, 102, 241, 0.15);
    }

    &.is-active {
      background: rgba(99, 102, 241, 0.2);
    }

    :deep(span) {
      color: #f1f5f9;
    }

    .el-icon {
      color: #94a3b8;
    }
  }

  .sidebar-menu::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>

