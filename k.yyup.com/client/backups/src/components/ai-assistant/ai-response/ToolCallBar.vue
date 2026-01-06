<!--
  工具调用横条组件 - 简化版
  显示为一个横条，包含：调用开始 → 执行中（转圈）→ 完成（绿灯）
-->

<template>
  <div class="tool-call-bar">
    <div class="tool-call-header">
      <!-- 左侧：工具图标和名称 -->
      <div class="tool-title">
        <!-- SVG 图标 -->
        <svg class="tool-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path v-if="toolIconPath" :d="toolIconPath" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="tool-text">{{ toolName }}</span>
        <span v-if="intent" class="tool-intent-text">{{ intent }}</span>
      </div>

      <!-- 右侧：状态指示器 -->
      <div class="tool-status">
        <!-- 执行中：转圈动画 -->
        <el-icon v-if="status === 'running'" class="status-icon status-running">
          <Loading />
        </el-icon>
        <!-- 完成：绿色小灯 -->
        <span v-else-if="status === 'completed'" class="status-dot status-completed"></span>
        <!-- 失败：红色小灯 -->
        <span v-else-if="status === 'failed'" class="status-dot status-failed"></span>
        <!-- 等待：灰色小灯 -->
        <span v-else class="status-dot status-pending"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ==================== Props ====================
interface Props {
  toolName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  intent?: string
  description?: string
}

const props = defineProps<Props>()

// ==================== 工具图标映射 ====================
const toolIconMap: Record<string, string> = {
  // 数据库查询工具
  'any_query': 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',

  // 渲染组件工具
  'render_component': 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z',

  // 页面导航工具
  'navigate': 'M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z',

  // 工作流执行工具
  'execute_workflow': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',

  // 文档生成工具
  'generate_document': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 13h8v2H8v-2zm0-4h8v2H8V9z',

  // 默认工具图标（扳手）
  'default': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'
}

// ==================== 计算属性 ====================
const toolIconPath = computed(() => {
  // 根据工具名称返回对应的 SVG 路径
  return toolIconMap[props.toolName] || toolIconMap['default']
})
</script>

<style scoped lang="scss">
.tool-call-bar {
  background: transparent;
  border: none;
  border-left: 2px solid var(--primary-color); // 左侧蓝色边框，类似侧边栏
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.05);
  }
}

.tool-call-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--text-sm); // 更小的内边距
  transition: all 0.2s ease;
}

.tool-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 400; // 正常字重
  color: var(--el-text-color-regular);
  flex: 1;
  min-width: 0;
}

.tool-icon {
  width: var(--text-lg); // 更小的图标
  height: var(--text-lg);
  flex-shrink: 0;
  color: var(--primary-color); // 蓝色图标

  path {
    stroke: currentColor;
  }
}

.tool-text {
  font-size: var(--text-sm); // 与侧边栏nav-desc一致
  flex-shrink: 0;
  color: var(--el-text-color-regular);
  font-weight: 400;
}

.tool-intent-text {
  font-size: var(--text-sm); // 与tool-text一致
  color: var(--el-text-color-secondary);
  font-weight: 400;
  margin-left: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-status {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: var(--text-sm);
}

// 状态图标
.status-icon {
  font-size: var(--text-base); // 更小的图标

  &.status-running {
    color: var(--primary-color); // 蓝色
    animation: spin 1s linear infinite;
  }
}

// 状态小灯
.status-dot {
  width: 6px; // 更小的状态点
  height: 6px;
  border-radius: var(--radius-full);
  display: inline-block;

  &.status-pending {
    background-color: var(--text-tertiary);
  }

  &.status-completed {
    background-color: var(--success-color);
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
  }

  &.status-failed {
    background-color: var(--danger-color);
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
  }
}

// 动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .tool-call-header {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .tool-icon {
    width: var(--text-base);
    height: var(--text-base);
  }

  .tool-text {
    font-size: var(--text-xs);
  }

  .tool-intent-text {
    font-size: var(--text-xs);
  }

  .status-icon {
    font-size: var(--text-sm);
  }

  .status-dot {
    width: 5px;
    height: 5px;
  }
}
</style>

