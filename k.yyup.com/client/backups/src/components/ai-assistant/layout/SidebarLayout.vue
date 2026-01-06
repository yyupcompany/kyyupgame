<!--
  AI助手侧边栏布局组件
  
  功能：
  - 侧边栏模式的AI助手布局
  - 可调整宽度（300-800px）
  - 与MainLayout集成
  - 工具调用和对话都显示在聊天区域
  
  使用方式：
  <SidebarLayout
    :visible="visible"
    @close="handleClose"
    @show-statistics="handleShowStatistics"
  >
    <template #chat-container>
      <ChatContainer ... />
    </template>
  </SidebarLayout>
-->

<template>
  <Transition name="sidebar-slide">
    <div v-if="visible" class="ai-sidebar-layout" :style="{ width: sidebarWidth + 'px' }">
      <!-- 调整宽度的拖拽条 -->
      <div 
        class="resize-handle"
        @mousedown="startResize"
      ></div>
      
      <!-- 侧边栏头部 -->
      <div class="sidebar-header">
        <div class="header-left">
          <el-icon><ServiceIcon /></el-icon>
          <h2>YY-AI助手</h2>
        </div>
        <div class="header-actions">
          <!-- 🔧 第二阶段优化：Token用量圆圈 -->
          <TokenUsageCircle
            :size="32"
            :stroke-width="3"
            :fontSize="10"
            tooltip-position="left"
            :animate-on-change="true"
            :update-interval="30000"
            class="token-usage-indicator"
          />

          <!-- 查看统计 -->
          <el-button
            size="small"
            @click="emit('show-statistics')"
            title="查看统计"
          >
            <el-icon><TrendCharts /></el-icon>
          </el-button>

          <!-- 🎯 工具面板按钮已移除，工具调用信息直接在对话区域内显示 -->

          <!-- 🆕 主题切换 -->
          <el-button
            size="small"
            @click="emit('toggle-theme')"
            title="切换主题"
          >
            <el-icon><Sunny /></el-icon>
          </el-button>

          <!-- 🆕 清空对话 -->
          <el-button
            size="small"
            @click="emit('clear-chat')"
            title="清空对话"
          >
            <el-icon><Delete /></el-icon>
          </el-button>

          <!-- 切换到全屏模式 -->
          <el-button
            size="small"
            @click="emit('toggle-fullscreen')"
            title="切换到全屏模式"
          >
            <el-icon><FullScreen /></el-icon>
          </el-button>

          <!-- 关闭AI助手 -->
          <el-button
            size="small"
            @click="emit('close')"
            title="关闭AI助手"
          >
            <UnifiedIcon name="close" :size="16" />
          </el-button>
        </div>
      </div>
      
      <!-- 聊天容器（插槽） -->
      <div class="sidebar-content" @suggestion="handleSuggestion">
        <!-- 主对话区域 -->
        <div class="chat-area">
          <slot name="chat-container" />
        </div>

        <!-- 🎯 工具面板已移除，工具调用信息直接在对话区域内显示 -->
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, withDefaults, defineProps, defineEmits } from 'vue'
import {
  Service as ServiceIcon,
  TrendCharts,
  Close,
  FullScreen,
  Sunny,
  Delete
} from '@element-plus/icons-vue'

// 🔧 第二阶段优化：导入Token用量圆圈组件
import TokenUsageCircle from '../components/TokenUsageCircle.vue'

// Props
interface Props {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

// Emits
const emit = defineEmits<{
  close: []
  'show-statistics': []
  'toggle-fullscreen': []
  'toggle-theme': []  // 新增：主题切换
  'clear-chat': []  // 新增：清空对话
  suggestion: [text: string]
}>()

// 侧边栏宽度
const sidebarWidth = ref(500)
const minWidth = 300
const maxWidth = 1200  // 从800px增加到1200px，解决内容拥挤问题

// 🎯 工具面板状态已移除，工具调用信息直接在对话区域内显示

// 拖拽调整宽度
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = sidebarWidth.value

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)

  // 防止文本选择
  e.preventDefault()
}

// 🆕 加载保存的宽度
onMounted(() => {
  const savedWidth = localStorage.getItem('ai-sidebar-width')
  if (savedWidth) {
    const width = parseInt(savedWidth)
    if (width >= minWidth && width <= maxWidth) {
      sidebarWidth.value = width
    }
  }
})

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  
  const deltaX = startX.value - e.clientX // 注意：侧边栏在右侧，所以是减法
  const newWidth = startWidth.value + deltaX
  
  // 限制宽度范围
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    sidebarWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  // 🆕 保存宽度到localStorage
  localStorage.setItem('ai-sidebar-width', sidebarWidth.value.toString())
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 事件处理函数
const handleSuggestion = (text: string) => {
  console.log('🔍 [SidebarLayout] 收到suggestion事件:', text)
  console.log('🔍 [SidebarLayout] 转发事件给父组件')
  emit('suggestion', text)
}

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="scss">
.ai-sidebar-layout {
  width: 100%;
  height: 100%;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  position: relative;
  
  // 调整宽度的拖拽条
  .resize-handle {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--spacing-sm);  // 从var(--spacing-xs)增加到var(--spacing-sm)，更容易抓取
    height: 100%;
    cursor: ew-resize;
    background: transparent;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    // 🆕 添加视觉提示
    &::before {
      content: '';
      width: 3px;
      height: var(--button-height-lg);
      background: var(--el-border-color);
      border-radius: var(--radius-xs);
      opacity: 0.5;
      transition: all 0.2s;
    }

    &:hover {
      background: rgba(var(--el-color-primary-rgb), 0.1);

      &::before {
        opacity: 1;
        background: var(--el-color-primary);
        height: 60px;
      }
    }

    &:active {
      background: rgba(var(--el-color-primary-rgb), 0.2);

      &::before {
        background: var(--el-color-primary);
      }
    }
  }
  
  // 侧边栏头部
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--text-lg) var(--text-2xl);
    border-bottom: var(--border-width-base) solid var(--el-border-color);
    background: var(--el-bg-color);
    
    .header-left {
      display: flex;
      align-items: center;
      gap: var(--text-sm);

      .el-icon {
        font-size: var(--text-3xl);
        color: var(--el-color-primary);
      }

      h2 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        pointer-events: none; /* 禁止点击事件，避免拦截其他按钮 */
        user-select: none; /* 禁止文本选择 */
      }
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      // 🔧 第二阶段优化：Token用量圆圈样式
      .token-usage-indicator {
        margin-right: var(--spacing-xs);
        opacity: 0.9;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 1;
        }
      }

      .el-button {
        padding: var(--spacing-sm);

        .el-icon {
          font-size: var(--text-lg);
        }
      }
    }
  }
  
  // 聊天容器
  .sidebar-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;

    // 🆕 主对话区域
    .chat-area {
      flex: 1;
      overflow: hidden;
    }
  }
}

// 🎯 工具面板相关样式已移除

// 🆕 Thinking淡入动画
@keyframes thinkingFadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// 暗黑主题适配
:deep(.theme-dark) {
  .ai-sidebar-layout {
    background: var(--el-bg-color);
    border-left-color: var(--el-border-color);

    .sidebar-header {
      background: var(--el-bg-color);
      border-bottom-color: var(--el-border-color);
    }

    // 🆕 暗黑主题下的thinking样式
    .thinking-item {
      background: rgba(139, 92, 246, 0.15);
      border-color: rgba(139, 92, 246, 0.3);

      .thinking-text {
        color: #e2e8f0; // 🔧 暗黑主题使用浅灰色，提高可读性
        font-weight: 500; // 🔧 增加字重，更清晰
      }
    }
  }
}
</style>

