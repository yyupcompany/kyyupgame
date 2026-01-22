<!--
  AI助手快捷导航面板
  根据用户角色和显示模式动态显示快捷导航按钮
-->

<template>
  <div class="quick-actions-panel">
    <!-- 快捷导航标题 -->
    <div v-if="showTitle" class="panel-title">
      <UnifiedIcon name="magic-stick" :size="16" />
      <span>{{ title }}</span>
    </div>

    <!-- 快捷导航按钮列表 -->
    <div class="actions-container" :class="`mode-${displayMode}`">
      <button
        v-for="action in actions"
        :key="action.code"
        class="action-button"
        :class="{ 'has-icon': action.icon }"
        @click="handleActionClick(action)"
      >
        <UnifiedIcon v-if="action.icon" :name="action.icon" :size="iconSize" />
        <span class="action-text">{{ action.text }}</span>
      </button>
    </div>

    <!-- 无快捷导航提示 -->
    <div v-if="actions.length === 0" class="empty-state">
      <UnifiedIcon name="warning" :size="32" />
      <p>暂无可用的快捷操作</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getQuickActions, type QuickAction, type RoleCode, type DisplayMode } from '@/config/ai-quick-actions'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

// Props定义
interface Props {
  /** 显示模式：fullpage(PC全屏), sidebar(PC侧边栏), mobile(移动端) */
  displayMode?: DisplayMode
  /** 是否显示标题 */
  showTitle?: boolean
  /** 自定义标题 */
  title?: string
  /** 图标大小 */
  iconSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  displayMode: 'fullpage',
  showTitle: true,
  title: '快捷导航',
  iconSize: 18
})

// Emits定义
interface Emits {
  /** 点击快捷操作时触发，传递操作文本 */
  'action-click': [text: string, action: QuickAction]
}

const emit = defineEmits<Emits>()

// 获取用户信息
const userStore = useUserStore()

// 获取当前用户角色代码
const roleCode = computed<RoleCode>(() => {
  const role = userStore.userRole
  
  // 将后端角色映射到前端角色代码
  const roleMapping: Record<string, RoleCode> = {
    'principal': 'principal',
    'teacher': 'teacher',
    'parent': 'parent',
    'PRINCIPAL': 'principal',
    'TEACHER': 'teacher',
    'PARENT': 'parent'
  }
  
  // admin角色不显示快捷按钮，返回空数组
  if (role === 'admin' || role === 'ADMIN') {
    return 'parent' // 临时返回，但会在actions中过滤掉
  }
  
  return roleMapping[role] || 'parent' // 默认家长角色
})

// 获取当前角色的快捷导航
const actions = computed<QuickAction[]>(() => {
  try {
    // admin角色不显示快捷按钮
    const role = userStore.userRole
    if (role === 'admin' || role === 'ADMIN') {
      console.log('🎯 [QuickActionsPanel] admin角色，不显示快捷导航')
      return []
    }
    
    const quickActions = getQuickActions(roleCode.value, props.displayMode)
    console.log('🎯 [QuickActionsPanel] 加载快捷导航:', {
      roleCode: roleCode.value,
      displayMode: props.displayMode,
      actionsCount: quickActions.length,
      actions: quickActions
    })
    return quickActions
  } catch (error) {
    console.error('❌ [QuickActionsPanel] 加载快捷导航失败:', error)
    return []
  }
})

// 处理快捷操作点击
const handleActionClick = (action: QuickAction) => {
  console.log('🔵 [QuickActionsPanel] 快捷操作点击:', {
    code: action.code,
    text: action.text,
    roleCode: roleCode.value,
    displayMode: props.displayMode
  })
  
  // 触发事件，将操作文本和完整操作对象传递给父组件
  emit('action-click', action.text, action)
}

// 生命周期钩子
onMounted(() => {
  console.log('✅ [QuickActionsPanel] 组件已挂载:', {
    roleCode: roleCode.value,
    displayMode: props.displayMode,
    actionsCount: actions.value.length
  })
})
</script>

<style lang="scss" scoped>
.quick-actions-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
  width: 100%;
}

// 暗色模式适配
:global([data-theme="dark"]) .quick-actions-panel,
:global(.theme-dark) .quick-actions-panel {
  .panel-title {
    color: var(--text-primary);
  }

  .action-button {
    background: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);

    &:hover {
      background: var(--primary-light-bg);
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px var(--ai-primary-glow);
    }
  }

  .empty-state {
    color: var(--text-secondary);

    .unified-icon {
      color: var(--text-tertiary);
    }
  }
}

// 标题样式
.panel-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  font-size: var(--text-sm, 14px);
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  padding: 0 var(--spacing-xs, 8px);

  .unified-icon {
    color: var(--primary-color, #6366f1);
  }
}

// 快捷操作容器
.actions-container {
  display: grid;
  gap: var(--spacing-sm, 12px);
  
  // 全屏模式：2列网格布局，宽敞易读
  &.mode-fullpage {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md, 16px);
    
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
  
  // 侧边栏模式：单列布局
  &.mode-sidebar {
    grid-template-columns: 1fr;
  }
  
  // 移动端模式：2列网格布局（紧凑）
  &.mode-mobile {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xxs, 6px);
  }
}

// 快捷操作按钮
.action-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;  /* 左对齐 */
  flex-direction: row;  /* 水平排列图标和文字 */
  gap: var(--spacing-sm, 12px);
  padding: var(--spacing-md, 14px) var(--spacing-lg, 18px);
  background: var(--bg-card);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: var(--radius-lg, 12px);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: var(--text-sm, 14px);  /* 正常字号 */
  font-weight: 500;
  color: var(--text-primary, #1e293b);
  text-align: left;
  min-height: 52px;  /* 适中高度 */
  
  // 有图标时的布局
  &.has-icon {
    .unified-icon {
      flex-shrink: 0;
      color: var(--primary-color, #6366f1);
      transition: transform 0.2s ease;
    }
  }
  
  .action-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;  /* 单行显示 */
    line-height: 1.4;
  }
  
  // 悬停效果
  &:hover {
    background: var(--bg-hover, #f8fafc);
    border-color: var(--primary-color, #6366f1);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
    
    .unified-icon {
      transform: scale(1.1);
    }
  }
  
  // 激活效果
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(99, 102, 241, 0.1);
  }
  
  // 焦点效果
  &:focus {
    outline: none;
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}

// 移动端模式下的按钮调整
.mode-mobile {
  .action-button {
    padding: var(--spacing-xs, 8px) var(--spacing-sm, 12px);
    font-size: var(--text-xs, 12px);
    min-height: 60px;
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-xxs, 4px);
    
    .unified-icon {
      margin-bottom: var(--spacing-xxs, 4px);
    }
    
    .action-text {
      white-space: normal;
      line-height: 1.3;
      font-size: 11px;
    }
  }
}

// 侧边栏模式下的按钮调整
.mode-sidebar {
  .action-button {
    padding: var(--spacing-xs, 8px) var(--spacing-sm, 12px);
    font-size: var(--text-xs, 13px);
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 32px);
  color: var(--text-secondary, #64748b);
  text-align: center;
  
  .unified-icon {
    color: var(--text-tertiary, #94a3b8);
    margin-bottom: var(--spacing-sm, 12px);
  }
  
  p {
    margin: 0;
    font-size: var(--text-sm, 14px);
  }
}
</style>
