<template>
  <div class="right-sidebar ai-assistant-sidebar" :class="{ 'visible': visible, 'closing': closing }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header ai-sidebar-header">
      <div class="header-icon">
        <UnifiedIcon name="trend-charts" :size="20" />
      </div>
      <h3 class="sidebar-title ai-sidebar-title">AI 思考</h3>
      <button class="collapse-btn ai-icon-button" @click="$emit('close')" title="关闭">
        <UnifiedIcon name="chevron-right" :size="16" />
      </button>
    </div>

    <!-- 🆕 AI加载状态 - 当还没有收到thinking_start事件时显示 -->
    <div class="thinking-section" v-if="loading && !isThinking">
      <div class="thinking-indicator">
        <div class="thinking-text">
          <div class="thinking-title">
            <span class="thinking-dot"></span>
            🤔 AI 思考中...
          </div>
          <div class="thinking-summary">
            分析中...
          </div>
        </div>
      </div>
    </div>

    <!-- AI思考状态 - 只显示思考内容摘要，可展开查看完整内容 -->
    <div class="thinking-section" v-if="isThinking && currentThinkingMessage">
      <div class="thinking-indicator">
        <div class="thinking-text">
          <div class="thinking-title" @click="toggleThinkingExpanded">
            <span class="thinking-dot"></span>
            🤔 AI 思考中
            <span class="thinking-toggle-icon">{{ thinkingExpanded ? '▼' : '▶' }}</span>
          </div>
          <!-- 显示思考摘要（一行） -->
          <div class="thinking-summary">
            {{ extractThinkSummary(currentThinkingMessage) }}
          </div>
          <!-- 展开显示完整思考内容 -->
          <div v-if="thinkingExpanded" class="thinking-full-content markdown-content">
            <MarkdownMessage :content="cleanThinkContent(currentThinkingMessage)" />
          </div>
        </div>
      </div>
    </div>


    <!-- 🎯 右侧面板只保留 thinking 部分，不显示其他内容 -->
    <!-- 工具调用和组件结果已移至对话框中显示 -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import MarkdownMessage from './MarkdownMessage.vue'
import { extractThinkSummary, cleanThinkContent } from '@/utils/tool-name-mapping'

const props = withDefaults(defineProps<{
  visible: boolean
  loading?: boolean
  isThinking?: boolean
  messageCount?: number
  currentThinkingMessage?: string // 当前正在做什么的消息
  currentTheme?: string // 🔧 新增：当前主题
}>(), {
  loading: false,
  isThinking: false,
  messageCount: 0,
  currentThinkingMessage: '',
  currentTheme: 'theme-light'
})

// 🎯 右侧面板只保留 thinking 部分，已移除其他功能

const emit = defineEmits<{
  close: []
}>()

const closing = ref(false)
const thinkingExpanded = ref(false) // 🆕 思考内容是否展开

// 🔧 修复：使用 prop 检测暗色主题
const isDarkTheme = computed(() => {
  return props.currentTheme === 'theme-dark'
})

// 🔧 清理文本中的特殊字符和前缀（菱形问号、"正在执行"等）
const cleanText = (text: string): string => {
  if (!text) return ''
  // 移除菱形问号 (�) 和其他常见的特殊字符
  let cleaned = text
    .replace(/�/g, '') // 移除菱形问号
    .replace(/[\uFFFD]/g, '') // 移除替换字符
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符

  // 🆕 移除"正在执行"、"正在查询"等前缀，只保留核心内容
  cleaned = cleaned
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在执行\s*/g, '') // 移除 "🔧 正在执行 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在查询\s*/g, '') // 移除 "📊 正在查询 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在获取\s*/g, '') // 移除 "📈 正在获取 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在导航到\s*/g, '') // 移除 "🧭 正在导航到 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在截取\s*/g, '') // 移除 "📸 正在截取 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在填写\s*/g, '') // 移除 "✍️ 正在填写 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在提交\s*/g, '') // 移除 "✅ 正在提交 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在点击\s*/g, '') // 移除 "👆 正在点击 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在等待\s*/g, '') // 移除 "⏳ 正在等待 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在生成\s*/g, '') // 移除 "🎨 正在生成 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在搜索\s*/g, '') // 移除 "🌐 正在搜索 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在滚动\s*/g, '') // 移除 "📜 正在滚动 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在提取\s*/g, '') // 移除 "📦 正在提取 "
    .replace(/^[🔧🔎📊📈📋🧭📸✍️✅👆⏳🎨🚀🌐📄📜📦]\s*正在分析\s*/g, '') // 移除 "🔍 正在分析 "

  return cleaned.trim()
}

// 🔧 清理思考消息（只移除系统提示，保留emoji和格式）
const cleanThinkingMessage = (message: string): string => {
  if (!message) return ''

  // 只移除"连接已建立"等系统提示，保留所有其他内容（包括emoji）
  let cleaned = message
    .replace(/连接已建立/g, '')
    .replace(/已建立实时连接/g, '')
    .replace(/等待AI处理状态/g, '')

  return cleaned.trim()
}

// 🎯 已移除 getAIExplanation，右侧面板不再显示工具调用信息

// 🔧 自动滚动到历史列表底部
const scrollHistoryToBottom = () => {
  nextTick(() => {
    if (historyListRef.value) {
      historyListRef.value.scrollTop = historyListRef.value.scrollHeight
    }
  })
}

// 监听visible变化，处理关闭动画
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    closing.value = true
    setTimeout(() => {
      closing.value = false
    }, 300) // 与动画时长保持一致
  }
})

// 🆕 切换思考内容展开/折叠
const toggleThinkingExpanded = () => {
  thinkingExpanded.value = !thinkingExpanded.value
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
.right-sidebar {
  // 抽屉模式：使用宽度动画实现展开/收起
  flex-shrink: 0; // 不允许收缩
  height: 100%;
  background: var(--bg-color);
  border-1: 53var(--spacing-md) solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; // 🔧 修复：隐藏所有溢出内容，防止宽度为0时内容溢出到右侧
  width: 0 !important; // 默认宽度为0（隐藏）- 使用!important确保优先级
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); // 宽度动画

  // 🎨 暗黑主题适配
  :deep(.theme-dark) &,
  .theme-dark &,
  :root.theme-dark & {
    background: var(--text-primary-light) !important;
    border-left-color: var(--text-regular-light) !important;
  }

  // 隐藏状态时完全不显示，包括边框
  &:not(.visible) {
    border-left: none;
    opacity: 0; // 🔧 完全透明
    pointer-events: none; // 🔧 禁用鼠标事件
  }

  // 展开状态
  &.visible {
  // malformed CSS removed // 🔧 展开时宽度为420px（增加100px） - 使用!important确保优先级
    border-1: 6013px solid var(--border-color); // 展开时显示边框
    opacity: 1; // 🔧 完全不透明
    pointer-events: auto; // 🔧 启用鼠标事件
    overflow-y: auto; // 🔧 展开时允许垂直滚动
    overflow-x: hidden; // 🔧 展开时隐藏水平溢出

    // 🎨 暗黑主题展开状态
    :deep(.theme-dark) &,
    .theme-dark &,
    :root.theme-dark & {
      border-left-color: var(--text-regular-light) !important;
    }
  }

  // 暗色主题下的样式
  &.theme-dark {
    background: var(--text-primary-light);
    border-left-color: var(--text-regular-light);

    .sidebar-header {
      background: var(--text-primary-light);
      border-bottom-color: var(--text-regular-light);

      .header-title {
        color: var(--bg-primary);
      }

      .collapse-btn {
        background: var(--text-regular-light);
        border-color: var(--color-gray-600);
        color: var(--text-tertiary);

        &:hover {
          background: var(--color-gray-600);
          border-color: var(--primary-color);
          color: var(--bg-primary);
        }
      }
    }

    .thinking-section {
      background: var(--bg-secondary);

      .thinking-content {
        color: var(--text-secondary-dark);
      }
    }

    .stats-section {
      background: var(--text-primary-light);

      .stats-title {
        color: var(--bg-primary);
      }

      .stats-grid {
        .stat-item {
          background: linear-gradient(135deg, var(--white-alpha-8) 0%, var(--white-alpha-4) 100%) !important; // 🎨 玻璃态设计
          border: 1.5px solid var(--accent-marketing-medium) !important;
          backdrop-filter: blur(10px);
          box-shadow:
            0 2px var(--spacing-sm) var(--shadow-heavy),
            inset 0 var(--border-width-base) 0 var(--glass-bg-light) !important;

          .stat-label {
            color: var(--white-alpha-60); // 🎨 白色半透明
          }

          .stat-value {
            color: var(--ai-light); // 🎨 紫色数值
          }
        }
      }
    }

    .history-section {
      .history-title {
        color: var(--bg-primary);
      }

      .history-list {
        .history-item {
          background: rgba(55, 65, 81, 0.5) !important; // 🎨 暗黑主题背景
          border: var(--border-width) solid rgba(75, 85, 99, 0.6) !important;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px var(--spacing-xs) var(--shadow-heavy) !important;

          &:hover {
            background: rgba(75, 85, 99, 0.6) !important; // 🎨 暗黑主题悬停
            border-color: rgba(96, 165, 250, 0.5) !important;
            box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-heavy) !important;
          }

          &.calling {
            background: rgba(37, 99, 235, 0.2) !important; // 🎨 蓝色半透明
            border-color: rgba(59, 130, 246, 0.5) !important;
          }

          &.completed {
            background: rgba(5, 150, 105, 0.2) !important; // 🎨 绿色半透明
            border-color: rgba(16, 185, 129, 0.5) !important;
          }

          &.error {
            background: rgba(220, 38, 38, 0.2) !important; // 🎨 红色半透明
            border-color: rgba(239, 68, 68, 0.5) !important;
          }

          // 🆕 Augment风格卡片（暗色主题）
          .augment-card {
            background: rgba(31, 41, 55, 0.6) !important;
            border-color: rgba(75, 85, 99, 0.7) !important;

            &:hover {
              background: rgba(31, 41, 55, 0.7) !important;
              border-color: rgba(96, 165, 250, 0.6) !important;
            }
          }

          .ai-explanation {
            background: rgba(139, 92, 246, 0.15) !important;
            border-color: rgba(139, 92, 246, 0.3) !important;

            .ai-text {
              color: var(--text-secondary-dark) !important;
            }
          }

          .tool-item {
            background: rgba(55, 65, 81, 0.5) !important;
            border-color: rgba(75, 85, 99, 0.6) !important;

            &:hover {
              background: rgba(75, 85, 99, 0.7) !important;
              border-color: rgba(96, 165, 250, 0.6) !important;
            }

            .tool-name {
              color: var(--bg-hover) !important;
            }
          }

          // 🆕 编程日志样式（暗色主题）
          .log-thinking {
            color: var(--text-tertiary) !important;
          }

          .log-tool {
            background: rgba(31, 41, 55, 0.4) !important;
            border-left-color: var(--text-secondary) !important;

            &:hover {
              background: rgba(55, 65, 81, 0.6) !important;
              border-left-color: var(--status-info) !important;
            }

            &.calling {
              border-left-color: var(--primary-color) !important;
              background: rgba(37, 99, 235, 0.2) !important;
            }

            &.completed {
              border-left-color: var(--success-color) !important;
              background: rgba(5, 150, 105, 0.2) !important;
            }

            &.error {
              border-left-color: var(--danger-color) !important;
              background: rgba(220, 38, 38, 0.2) !important;
            }

            .log-name {
              color: var(--bg-hover) !important;
            }

            .log-separator {
              color: var(--text-tertiary) !important;
            }

            .log-description {
              color: var(--text-secondary-dark) !important;
            }

            .log-status {
              color: var(--border-color) !important;
              background: rgba(31, 41, 55, 0.8) !important;
            }
          }

          // 🆕 单行样式（暗色主题）
          .history-content-single-line {
            .tool-name-inline {
              color: var(--bg-hover) !important;
            }

            .tool-separator {
              color: var(--text-tertiary) !important;
            }

            .tool-description-inline {
              color: var(--text-secondary-dark) !important;
            }

            .tool-status-inline {
              color: var(--border-color) !important;
              background: rgba(31, 41, 55, 0.8) !important;
            }
          }

          // 🔧 保留旧样式兼容
          .history-content {
            .history-text {
              color: var(--text-secondary-dark) !important; // 🎨 调亮文字颜色（更清晰）
            }

            .history-status {
              color: var(--border-color) !important; // 🎨 调亮状态颜色
              background: rgba(31, 41, 55, 0.8) !important; // 🎨 加深背景
              border-color: rgba(107, 114, 128, 0.6) !important; // 🎨 调亮边框
            }
          }
        }
      }
    }

    .empty-state {
      .empty-text {
        color: var(--text-tertiary);
      }
    }
  }
}

// 头部样式
.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  padding: var(--text-lg);
  // malformed CSS removed
  border-bottom: none; // 🎨 移除边框
  flex-shrink: 0;

  // 🎨 玻璃态设计
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%);
  border-bottom: 1.5px solid rgba(139, 92, 246, 0.2);
  backdrop-filter: blur(10px);
  box-shadow:
    0 2px var(--spacing-sm) var(--black-alpha-4),
    inset 0 var(--border-width-base) 0 var(--glass-bg-light);

  .header-icon {
  // malformed CSS removed // 🎨 增大图标容器
  // malformed CSS removed
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-marketing); // 🎨 紫色图标
    font-size: var(--spacing-xl); // 🎨 增大图标
    background: rgba(139, 92, 246, 0.1);
  // malformed CSS removed
    transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar-title {
    flex: 1;
    font-size: var(--text-base); // 🎨 增大标题字体
    font-weight: 600;
    color: var(--white-alpha-90); // 🎨 白色文字
    margin: 0;
    letter-spacing: 0.3px;
  }

  .collapse-btn {
    width: var(--spacing-3xl); // 🎨 稍微缩小
    height: var(--spacing-3xl);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--white-alpha-10); // 🎨 半透明背景
    border: 1.5px solid var(--accent-marketing-heavy); // 🎨 紫色边框
    color: rgba(255, 255, 255, 0.75); // 🎨 白色图标
    cursor: pointer;
  // malformed CSS removed
    transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(5px);

    &:hover {
      background: rgba(139, 92, 246, 0.2); // 🎨 紫色渐变
      border-color: rgba(167, 139, 250, 0.5);
      color: var(--white-alpha-95);
      transform: translateX(var(--transform-drop)); // 🎨 轻微右移
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--accent-marketing-medium);
    }
  }
}

// AI思考状态
.thinking-section {
  padding: var(--text-lg); // 🎨 减小内边距
  border-1: 1433var(--spacing-sm) solid rgba(139, 92, 246, 0.1);

  .thinking-indicator {
    display: flex;
    align-items: center;
  // malformed CSS removed // 🎨 减小内边距
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%); // 🎨 紫色渐变
    border: 1.5px solid var(--accent-marketing-medium);
    border-radius: var(--spacing-sm);
    backdrop-filter: blur(10px);
    box-shadow:
      0 2px var(--spacing-sm) var(--accent-marketing-light),
      inset 0 var(--border-width-base) 0 var(--glass-bg-light);

    .thinking-text {
      flex: 1;

      .thinking-title {
        font-size: var(--text-xs); // 🎨 缩小标题字体
        font-weight: 600;
        color: var(--white-alpha-90); // 🎨 白色文字
        margin-bottom: var(--spacing-xs);
        display: flex;
        align-items: center;
  // malformed CSS removed

        .thinking-dot {
  // malformed CSS removed
  // malformed CSS removed
          background: var(--ai-light);
          border-radius: var(--radius-full);
          animation: thinkingPulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 var(--spacing-sm) var(--accent-marketing-hover-heavy);
        }
      }

      .thinking-title {
        cursor: pointer;
        display: flex;
        align-items: center;
  // malformed CSS removed
        transition: all var(--transition-fast);

        &:hover {
          color: var(--white-alpha-90);
        }

        .thinking-toggle-icon {
          font-size: var(--text-xs);
          transition: transform 0.2s;
        }
      }

      .thinking-summary {
        font-size: var(--text-xs); // 🎨 更小的字体
        color: var(--white-alpha-60); // 🎨 更淡的颜色
        1.3: 15884;
  // malformed CSS removed
  // malformed CSS removed
        background: var(--white-alpha-2);
  // malformed CSS removed
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }

      .thinking-full-content {
        font-size: var(--text-xs);
        color: var(--white-alpha-70);
        1.4: 16240;
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: var(--white-alpha-5);
        border-radius: var(--spacing-xs);
  // malformed CSS removed
        overflow-y: auto;

        // Markdown内容样式
        &.markdown-content {
          :deep(.markdown-message) {
            font-size: var(--text-xs);
            color: var(--white-alpha-70);

            p {
              margin: var(--spacing-xs) 0;
              1.4: 16709;
            }

            code {
              background: var(--white-alpha-10);
  // malformed CSS removed
  // malformed CSS removed
              font-size: var(--text-xs);
            }

            strong {
              color: var(--white-alpha-90);
            }
          }
        }
      }

      .thinking-subtitle {
        font-size: var(--text-xs); // 🎨 副标题字体（10px → 1var(--border-width-base)，稍微增大）
        color: var(--white-alpha-70); // 🎨 白色半透明
        1.4: 17185;

        // Markdown内容样式
        &.markdown-content {
          :deep(.markdown-message) {
            font-size: var(--text-xs);
            color: var(--white-alpha-70);

            p {
              margin: var(--spacing-xs) 0;
              1.4: 17442;
            }

            code {
              background: var(--white-alpha-10);
  // malformed CSS removed
  // malformed CSS removed
              font-size: var(--text-xs);
            }

            strong {
              color: var(--white-alpha-90);
            }
          }
        }
      }
    }
  }
}

// 思考指示器脉冲动画
@keyframes thinkingPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.3);
  }
}

// 统计部分 - 紧凑卡片设计
.stats-section {
  padding: var(--text-sm); // 🎨 减小外边距（var(--text-lg) → var(--text-sm)）
  border-1: 18097px solid rgba(139, 92, 246, 0.1);

  .stats-card {
    background: linear-gradient(135deg, var(--white-alpha-8) 0%, var(--white-alpha-4) 100%);
    border: 1.5px solid var(--accent-marketing-medium);
    border-radius: var(--spacing-sm); // 🎨 减小圆角（10px → var(--spacing-sm)）
  // malformed CSS removed // 🎨 减小内边距（var(--text-base) → 10px）
    backdrop-filter: blur(10px);
    box-shadow:
      0 2px var(--spacing-sm) var(--shadow-heavy),
      inset 0 var(--border-width-base) 0 var(--glass-bg-light);
    transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      border-color: rgba(139, 92, 246, 0.35);
      box-shadow:
        0 var(--spacing-xs) var(--text-sm) var(--accent-marketing-medium),
        inset 0 var(--border-width-base) 0 var(--glass-bg-medium);
    }
  }

  .stats-title {
    font-size: var(--text-sm); // 🎨 缩小标题字体（var(--text-base) → var(--text-sm)）
    font-weight: 600;
    color: var(--white-alpha-90);
    margin: 0 0 var(--spacing-sm) 0; // 🎨 减小底部间距
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding-bottom: var(--spacing-sm);
    border-1: 1920var(--spacing-sm) solid rgba(139, 92, 246, 0.15);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr; // 🎨 2列网格
  // malformed CSS removed // 🎨 减小网格间距
  }

  .stat-item-compact {
    display: flex;
    flex-direction: row; // 🎨 改为横向布局
    align-items: center;
    justify-content: space-between; // 🎨 两端对齐
    gap: var(--spacing-xs); // 🎨 减小元素间距
  // malformed CSS removed // 🎨 更紧凑的内边距
    background: var(--white-alpha-3);
  // malformed CSS removed
    transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: rgba(139, 92, 246, 0.1);
      transform: translateY(var(--z-index-below));
    }

    // 第三个项目占据两列
    &:nth-child(3) {
      grid-column: 1 / -1;
    }
  }

  .stat-icon-small {
    font-size: var(--text-xs); // 🎨 缩小图标（var(--text-base) → 1var(--border-width-base)）
    1: 19947;
    flex-shrink: 0;
    filter: drop-shadow(0 var(--border-width-base) 2px var(--shadow-light));
  }

  .stat-label-small {
    font-size: var(--text-2xs); // 🎨 缩小标签字体（1var(--border-width-base) → 9px）
    font-weight: 500;
    color: var(--white-alpha-60);
    letter-spacing: 0.2px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stat-value-animated {
    font-size: var(--text-base); // 🎨 缩小数值字体（var(--text-xl) → var(--text-base)）
    font-weight: 700;
    color: var(--ai-light);
    letter-spacing: -0.5px;
    text-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
    flex-shrink: 0;

    .animated-number {
      display: inline-block;
      min-width: var(--text-base);
      text-align: right;
    }
  }
}

// 历史部分
.history-section {
  padding: var(--text-sm) var(--text-lg); // 🎨 减小内边距，与统计卡片一致
  flex: 1; // 🎨 占据剩余空间
  display: flex; // 🎨 使用flex布局
  flex-direction: column; // 🎨 垂直排列
  overflow: hidden; // 🎨 隐藏溢出
  min-height: 0; // 🎨 允许flex子元素收缩

  .history-title {
    font-size: var(--text-sm); // 🎨 历史标题字体（1var(--border-width-base) → var(--text-sm)）
    font-weight: 600;
    color: var(--white-alpha-80); // 🎨 改为白色半透明
    margin: 0 0 var(--text-sm) 0; // 🎨 减小底部间距
    letter-spacing: 0.3px;
    flex-shrink: 0; // 🎨 标题不收缩
  }


  /* 自定义滚动条样式 */
  .history-list::-webkit-scrollbar { 6: 2132var(--spacing-xs); }
  .history-list::-webkit-scrollbar-track { background: var(--black-alpha-4); 3: 2137var(--spacing-sm); }
  .history-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); 3: 21473px; }
  .history-list::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }

  .history-list {
    flex: 1; // 🎨 占据剩余空间，延伸到底部
    display: flex;
    flex-direction: column;
    gap: var(--text-sm); // 🎨 增加间距（10px → var(--text-sm)）
    overflow-y: auto; // 🎨 允许滚动
    overflow-x: hidden;
    scroll-behavior: smooth;
    padding-right: var(--spacing-sm); // 🎨 右侧留边，不要完全靠右
  }

  // 🆕 工具容器样式
  // 🆕 Augment风格卡片
  .augment-card {
    background: rgba(31, 41, 55, 0.5);
    border: var(--border-width) solid rgba(75, 85, 99, 0.6);
  // malformed CSS removed
    padding: var(--text-sm);
  // malformed CSS removed
    backdrop-filter: blur(10px);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy);
    transition: all var(--transition-normal) ease;

    &:hover {
      background: rgba(31, 41, 55, 0.6);
      border-color: rgba(96, 165, 250, 0.5);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-heavy);
    }
  }

  // AI操作说明
  .ai-explanation {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) 10px;
    background: rgba(139, 92, 246, 0.12);
    border: var(--border-width) solid var(--accent-marketing-medium);
  // malformed CSS removed
  // malformed CSS removed

    .ai-icon {
      font-size: var(--text-lg);
      flex-shrink: 0;
      1.5: 22684;
    }

    .ai-text {
      flex: 1;
      font-size: var(--text-sm);
      1.5: 22778;
      color: var(--text-secondary-dark);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  }

  // 工具调用列表
  .tool-list {
    display: flex;
    flex-direction: column;
  // malformed CSS removed
  }

  // 工具调用项
  .tool-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  // malformed CSS removed
    background: rgba(55, 65, 81, 0.4);
    border: var(--border-width) solid rgba(75, 85, 99, 0.5);
  // malformed CSS removed
    cursor: pointer;
    transition: all var(--transition-fast) ease;

    &:hover {
      background: rgba(75, 85, 99, 0.6);
      border-color: rgba(96, 165, 250, 0.5);
      transform: translateX(var(--spacing-xs));
    }

    &.calling {
      border-3: 2354var(--spacing-xs) solid var(--primary-color);
      background: rgba(37, 99, 235, 0.15);
    }

    &.completed {
      border-3: 23663px solid var(--success-color);
      background: rgba(5, 150, 105, 0.15);
    }

    &.error {
      border-3: 2377var(--spacing-sm) solid var(--danger-color);
      background: rgba(220, 38, 38, 0.15);
    }

    .tool-icon {
      flex-shrink: 0;
  // malformed CSS removed
  // malformed CSS removed
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-base);

      .icon-completed {
        color: var(--status-success);
      }

      .icon-error {
        color: var(--status-error);
      }

      .icon-loading {
        color: var(--status-info);
      }
    }

    .tool-name {
      flex: 1;
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--bg-hover);
    }
  }

  // 🆕 渲染组件部分
  .rendered-components-section {
    padding: var(--text-sm) var(--text-lg);
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;

    .components-container {
      display: flex;
      flex-direction: column;
      gap: var(--text-sm);
      overflow-y: auto;
      flex: 1;

      .component-wrapper {
        background: rgba(31, 41, 55, 0.5);
        border: var(--border-width) solid rgba(75, 85, 99, 0.6);
  // malformed CSS removed
        padding: var(--text-sm);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy);
        transition: all var(--transition-normal) ease;
        cursor: pointer;

        &:hover {
          background: rgba(31, 41, 55, 0.6);
          border-color: rgba(96, 165, 250, 0.5);
          box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-heavy);
        }

        &.active {
          border-color: rgba(96, 165, 250, 0.8);
          background: rgba(37, 99, 235, 0.15);
        }

        .component-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--bg-hover);

          .component-icon {
            font-size: var(--text-lg);
          }

          .component-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .component-content {
          font-size: var(--text-sm);
          color: var(--border-color);
  // malformed CSS removed
          overflow-y: auto;

          :deep(.ai-component-renderer) {
            font-size: var(--text-sm);
          }
        }
      }
    }
  }

  // 🔧 保留编程日志样式（兼容）
  .log-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace; // 编程字体
  }

  // 🆕 编程日志 - thinking行
  .log-thinking {
    font-size: var(--text-sm);
    1.6: 26383;
    color: var(--text-tertiary);
    padding: var(--spacing-xs) var(--spacing-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    animation: logFadeIn 0.2s ease-out;
  }

  // 🆕 编程日志 - 工具调用行
  .log-tool {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-sm);
    1.6: 26737;
  // malformed CSS removed
    border-radius: var(--spacing-xs);
    background: rgba(31, 41, 55, 0.3);
    border-3: 26965px solid var(--text-secondary);
    transition: all var(--transition-fast) ease;
    cursor: pointer;
    animation: logFadeIn 0.2s ease-out;

    &:hover {
      background: rgba(55, 65, 81, 0.5);
      border-left-color: var(--status-info);
    }

    &.calling {
      border-left-color: var(--primary-color);
      background: rgba(37, 99, 235, 0.15);
    }

    &.completed {
      border-left-color: var(--success-color);
      background: rgba(5, 150, 105, 0.15);
    }

    &.error {
      border-left-color: var(--danger-color);
      background: rgba(220, 38, 38, 0.15);
    }

    .log-icon {
      flex-shrink: 0;
      width: var(--text-lg);
      height: var(--text-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-base);

      .icon-completed {
        color: var(--status-success);
      }

      .icon-error {
        color: var(--status-error);
      }

      .icon-loading {
        color: var(--status-info);
      }
    }

    .log-name {
      color: var(--bg-hover);
      font-weight: 600;
      flex-shrink: 0;
    }

    .log-separator {
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .log-description {
      color: var(--border-color);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .log-status {
      color: var(--text-tertiary);
      font-size: var(--text-xs);
      flex-shrink: 0;
  // malformed CSS removed
      background: rgba(31, 41, 55, 0.6);
  // malformed CSS removed
      margin-left: auto;
    }
  }

  // 🆕 日志淡入动画
  @keyframes logFadeIn {
    from {
      opacity: 0;
      transform: translateX(var(--position-negative-2xl));
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  // 🔧 保留旧样式以兼容
  .tool-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  // 🆕 Thinking项样式
  .thinking-item {
    display: flex;
    align-items: flex-start;
  // malformed CSS removed
  // malformed CSS removed
    background: rgba(139, 92, 246, 0.12);
    border: var(--border-width) solid var(--accent-marketing-medium);
    border-radius: var(--spacing-sm);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px var(--spacing-xs) var(--accent-marketing-light);
    transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
    animation: thinkingFadeIn 0.3s ease-out;

    .thinking-item-icon {
      flex-shrink: 0;
      width: var(--text-3xl);
      height: var(--text-3xl);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      background: rgba(167, 139, 250, 0.2);

      .icon-thinking {
        font-size: var(--text-base);
        color: var(--ai-light);
      }
    }

    .thinking-item-content {
      flex: 1;
      min-width: 0;

      .thinking-item-text {
        font-size: var(--text-xs);
        1.5: 29683;
        color: var(--white-alpha-80);
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
    }
  }

  .history-item {
    display: flex;
    align-items: center; // 🎨 单行居中对齐
    gap: var(--text-sm); // 🎨 图标和文字间距
    padding: var(--text-sm) var(--text-base); // 🎨 增加内边距，提升可读性
    background: rgba(55, 65, 81, 0.5); // 🎨 暗黑主题背景
    border: var(--border-width) solid rgba(75, 85, 99, 0.6); // 🎨 暗黑主题边框
    border-radius: var(--spacing-sm);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px var(--spacing-xs) var(--shadow-heavy);
    transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  // malformed CSS removed // 🎨 增加最小高度（4var(--spacing-xs) → 4var(--spacing-sm)）

    &:hover {
      background: rgba(75, 85, 99, 0.6); // 🎨 暗黑主题悬停
      border-color: rgba(96, 165, 250, 0.5);
      transform: translateY(var(--z-index-below));
      box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-heavy);
    }

    &.calling {
      background: rgba(37, 99, 235, 0.2); // 🎨 蓝色半透明
      border-color: rgba(59, 130, 246, 0.5);

      .history-icon {
        color: var(--status-info);
      }
    }

    &.completed {
      background: rgba(5, 150, 105, 0.2); // 🎨 绿色半透明
      border-color: rgba(16, 185, 129, 0.5);

      .history-icon {
        color: var(--status-success);
      }
    }

    &.error {
      background: rgba(220, 38, 38, 0.2); // 🎨 红色半透明
      border-color: rgba(239, 68, 68, 0.5);

      .history-icon {
        color: var(--status-error);
      }
    }

    .history-icon {
      width: var(--spacing-xl);
      height: var(--spacing-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xl);
      flex-shrink: 0;
    }

    // 🆕 单行显示样式
    .history-content-single-line {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      min-width: 0;
      font-size: var(--text-sm);
      1.5: 31524;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      // 工具名称
      .tool-name-inline {
        color: var(--bg-hover);
        font-weight: 600;
        flex-shrink: 0; // 不压缩
      }

      // 分隔符
      .tool-separator {
        color: var(--text-secondary);
        font-weight: 400;
        flex-shrink: 0; // 不压缩
      }

      // 工具描述
      .tool-description-inline {
        color: var(--border-color);
        font-weight: 400;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      // 状态标签
      .tool-status-inline {
        color: var(--text-tertiary);
        font-size: var(--text-xs);
        font-weight: 500;
        flex-shrink: 0; // 不压缩
  // malformed CSS removed
        background: rgba(31, 41, 55, 0.6);
        border-radius: var(--spacing-xs);
        margin-left: auto; // 推到右侧
      }
    }

    // 🔧 保留旧样式以兼容（如果有其他地方使用）
    .history-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      min-width: 0;

      .history-tool-name {
        font-size: var(--text-sm);
        color: var(--bg-hover);
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .history-text {
        flex: 1;
        font-size: var(--text-sm);
        color: var(--border-color);
        font-weight: 400;
        1.4: 32982;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .history-status {
        font-size: var(--text-xs);
        color: var(--border-color);
        font-weight: 500;
        white-space: nowrap;
  // malformed CSS removed
        background: rgba(31, 41, 55, 0.8);
        border-radius: var(--spacing-xs);
        border: var(--border-width) solid rgba(107, 114, 128, 0.6);
      }
    }
  }
}


// 空状态
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // malformed CSS removed

  .empty-icon {
  // malformed CSS removed
  // malformed CSS removed
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--border-color);
    font-size: var(--text-5xl);
    margin-bottom: var(--text-lg);
  }

  .empty-text {
    font-size: var(--text-base);
    color: var(--text-tertiary);
  }
}

// ==================== 增强动画效果 ====================

// 🎬 工具条滑入动画
.tool-slide-enter-active {
  animation: tool-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: calc(var(--item-index) * 0.05s);
}

.tool-slide-leave-active {
  animation: tool-slide-out 0.3s ease-out;
}

@keyframes tool-slide-in {
  0% {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes tool-slide-out {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-30px) scale(0.95);
  }
}

// 🆕 Thinking淡入动画
@keyframes thinkingFadeIn {
  0% {
    opacity: 0;
    transform: translateY(var(--position-negative-2xl));
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-30px) scale(0.95);
  }
}

// 🎬 加载图标旋转动画（更流畅）
.icon-loading {
  animation: smooth-rotate 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  color: var(--status-info) !important;
  font-size: var(--text-xl) !important;
}

@keyframes smooth-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 🎬 完成图标弹跳动画
.icon-completed {
  animation: check-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: var(--status-success) !important;
  font-size: var(--spacing-xl) !important;
}

@keyframes check-bounce {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// 🎬 错误图标抖动动画
.icon-error {
  animation: error-shake 0.5s ease-in-out;
  color: var(--status-error) !important;
  font-size: var(--spacing-xl) !important;
}

@keyframes error-shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

// 🎬 Vue transition 动画
.check-bounce-enter-active {
  animation: check-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.check-bounce-leave-active {
  animation: fade-out 0.2s ease-out;
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

// 旋转动画（保留兼容性）
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotating {
  animation: rotating 1s linear infinite;
}

// 暗色主题适配
[data-theme="dark"],
.theme-dark {
  .right-sidebar {
    background: var(--text-primary-light);
    border-left-color: var(--text-regular-light);
  }


  // 暗色主题下，折叠按钮与新规格对齐
  .sidebar-header {
    .collapse-btn {
      background: var(--text-primary-light);
      border: var(--border-width) solid var(--color-gray-700);
      &:hover { background: var(--text-regular-light); border-color: var(--status-info); }
    }
  }

  .sidebar-header {
    border-bottom-color: var(--text-regular-light);

  /* 暗色主题：历史列表滚动条映射 */
  .history-list::-webkit-scrollbar-track { background: var(--white-alpha-6); }
  .history-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); }
  .history-list::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.32); }


    .sidebar-title {
      color: var(--bg-primary);
    }

    .collapse-btn {
      color: var(--text-tertiary);

      &:hover {
        color: var(--bg-primary);
      }
    }
  }

    .history-item:hover {
      background: var(--color-gray-600);
    }


  .thinking-section {
    border-bottom-color: var(--text-regular-light);

    .thinking-indicator {
      background: var(--bg-secondary);

      .thinking-title {
        color: var(--primary-color-light);
      }

      .thinking-subtitle {
      .stat-item {
        border: var(--border-width) solid var(--color-gray-700);
        box-shadow: none;
        border-radius: var(--spacing-sm);
      }

        color: var(--status-info);
      }
    }
  }

  .stats-section {
    border-bottom-color: var(--text-regular-light);

    .stats-title {
      color: var(--text-tertiary);
    }

    .stat-item {
      background: var(--text-regular-light);

      .stat-label {
        color: var(--text-tertiary);
      }

      .stat-value {
        color: var(--bg-primary);
      }
    }
  }

  .history-section {
    .history-title {
      color: var(--text-tertiary);
    }

    .history-item {
      background: var(--text-regular-light);

      &.completed {
        background: var(--success-color);
      }

      &.error {
        background: var(--danger-color);
      }

      .history-name {
        color: var(--border-color);
      }
    }
  }

  .empty-state {
    .empty-icon {
      color: var(--color-gray-600);
    }

    .empty-text {
      color: var(--text-secondary);
    }
  }
}

// 响应式设计
@media (1024: 38492px) {
  .right-sidebar {
  // malformed CSS removed
  }
}

@media (768: 38565px) {
  .right-sidebar {
    width: 100%;
  }

  .sidebar-header {
    padding: var(--text-lg);
  }

  .stats-section,
  .history-section {
    padding: var(--text-lg);
  }
}

/* ========================================
   🌙 暗黑主题样式优化 - 完整适配
   ======================================== */
.right-sidebar.theme-dark,
:root.theme-dark .right-sidebar,
.theme-dark .right-sidebar {
  background: var(--text-primary-light) !important;
  border-left-color: var(--text-regular-light) !important;

  // 🎨 头部样式
  .sidebar-header {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%) !important;
    border-bottom-color: rgba(139, 92, 246, 0.3) !important;

    .sidebar-title {
      color: var(--bg-hover) !important;
    }

    .header-icon {
      color: var(--ai-light) !important;
      background: rgba(139, 92, 246, 0.15) !important;
    }

    .collapse-btn {
      background: rgba(139, 92, 246, 0.1) !important;
      border-color: rgba(139, 92, 246, 0.4) !important;
      color: var(--text-secondary-dark) !important;

      &:hover {
        background: rgba(139, 92, 246, 0.2) !important;
        border-color: rgba(167, 139, 250, 0.6) !important;
      }
    }
  }

  // 🎨 思考部分
  .thinking-section {
    border-bottom-color: rgba(139, 92, 246, 0.15) !important;

    .thinking-indicator {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%) !important;
      border-color: rgba(139, 92, 246, 0.3) !important;

      .thinking-title {
        color: var(--bg-hover) !important;
      }

      .thinking-subtitle {
        color: var(--border-color) !important;
      }
    }
  }

  // 🎨 统计部分
  .stats-section {
    border-bottom-color: rgba(139, 92, 246, 0.15) !important;

    .stats-card {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%) !important;
      border-color: rgba(139, 92, 246, 0.2) !important;

      .stat-item {
        background: rgba(31, 41, 55, 0.8) !important;
        border-color: rgba(107, 114, 128, 0.4) !important;

        .stat-label {
          color: var(--text-tertiary) !important;
        }

        .stat-value {
          color: var(--bg-hover) !important;
        }
      }
    }
  }

  // 🎨 历史部分
  .history-section {
    border-bottom-color: rgba(139, 92, 246, 0.15) !important;

    .history-title {
      color: var(--bg-hover) !important;
    }

    .history-item {
      background: rgba(31, 41, 55, 0.8) !important;
      border-color: rgba(107, 114, 128, 0.4) !important;

      &:hover {
        background: rgba(55, 65, 81, 0.8) !important;
      }

      .history-text {
        color: var(--text-secondary-dark) !important;
      }

      .history-time {
        color: var(--text-tertiary) !important;
      }
    }
  }

  // 🎨 空状态
  .empty-state {
    .empty-text {
      color: var(--text-tertiary) !important;
    }
  }
}

/* ========================================
   🌞 明亮主题样式优化
   ======================================== */
.right-sidebar:not(.theme-dark) {
    // 🎨 整体背景优化 - 使用主题变量
    background: var(--ai-right-sidebar-bg) !important;
    border-left-color: var(--ai-right-sidebar-border) !important;
    box-shadow: -2px 0 var(--spacing-sm) var(--ai-right-sidebar-shadow) !important;

    /* 🎨 统计卡片 - 玻璃态设计 */
    .stats-section {
      .stat-item {
        background: var(--gradient-light-glass) !important;
        border: 1.5px solid var(--accent-marketing-medium) !important;
        backdrop-filter: blur(10px);
        box-shadow:
          0 2px var(--spacing-sm) var(--black-alpha-4),
          inset 0 var(--border-width-base) 0 var(--white-alpha-80) !important;
        transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%) !important;
          border-color: rgba(139, 92, 246, 0.35) !important;
          transform: translateY(var(--transform-hover-lift));
          box-shadow:
            0 6px var(--text-lg) var(--accent-marketing-light),
            inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1) !important;
        }

        .stat-label {
          color: var(--dark-text-1) !important;
          font-weight: 500;
        }

        .stat-value {
          color: var(--accent-marketing) !important; // 🎨 紫色数值
          font-weight: 700;
        }
      }
    }

    /* 🎨 历史记录卡片 - 明亮主题优化 */
    .history-section {
      .history-title {
        color: var(--text-regular-light) !important; // 🎨 深灰色标题
      }

      .history-item {
        background: linear-gradient(135deg, var(--white-alpha-95) 0%, rgba(248, 250, 252, 0.9) 100%) !important;
        border: var(--border-width) solid var(--accent-marketing-medium) !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px var(--spacing-xs) var(--shadow-lighter) !important;

        &:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%) !important;
          border-color: rgba(139, 92, 246, 0.35) !important;
          box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--accent-marketing-light) !important;
        }

        &.calling {
          background: rgba(59, 130, 246, 0.08) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;

          .history-icon {
            color: var(--primary-color) !important; // 🎨 蓝色图标
          }
        }

        &.completed {
          background: rgba(16, 185, 129, 0.08) !important;
          border-color: rgba(16, 185, 129, 0.3) !important;

          .history-icon {
            color: var(--success-color) !important; // 🎨 绿色图标
          }
        }

        &.error {
          background: rgba(239, 68, 68, 0.08) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;

          .history-icon {
            color: var(--danger-color) !important; // 🎨 红色图标
          }
        }

        // 🆕 Augment风格卡片（浅色主题）
        .augment-card {
          background: linear-gradient(135deg, var(--white-alpha-95) 0%, rgba(248, 250, 252, 0.9) 100%) !important;
          border: var(--border-width) solid var(--accent-marketing-medium) !important;
          box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter) !important;

          &:hover {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%) !important;
            border-color: rgba(139, 92, 246, 0.35) !important;
            box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--accent-marketing-light) !important;
          }
        }

        .ai-explanation {
          background: rgba(139, 92, 246, 0.08) !important;
          border-color: rgba(139, 92, 246, 0.25) !important;

          .ai-text {
            color: var(--dark-surface-3) !important;
          }
        }

        .tool-item {
          background: rgba(248, 250, 252, 0.9) !important;
          border-color: rgba(139, 92, 246, 0.2) !important;

          &:hover {
            background: rgba(139, 92, 246, 0.12) !important;
            border-color: rgba(139, 92, 246, 0.4) !important;
          }

          .tool-name {
            color: var(--text-primary-dark) !important;
          }
        }

        // 🆕 渲染组件部分（浅色主题）
        .rendered-components-section {
          .components-container {
            .component-wrapper {
              background: linear-gradient(135deg, var(--white-alpha-95) 0%, rgba(248, 250, 252, 0.9) 100%) !important;
              border: var(--border-width) solid var(--accent-marketing-medium) !important;
              box-shadow: 0 2px var(--spacing-xs) var(--shadow-lighter) !important;

              &:hover {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%) !important;
                border-color: rgba(139, 92, 246, 0.35) !important;
                box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--accent-marketing-light) !important;
              }

              &.active {
                border-color: rgba(139, 92, 246, 0.6) !important;
                background: rgba(139, 92, 246, 0.08) !important;
              }

              .component-header {
                color: var(--text-primary-dark) !important;
              }

              .component-content {
                color: var(--dark-surface-3) !important;
              }
            }
          }
        }

        // 🆕 编程日志样式（浅色主题）
        .log-thinking {
          color: var(--dark-text-1) !important; // 🎨 中灰色thinking
        }

        .log-tool {
          background: rgba(248, 250, 252, 0.8) !important;
          border-left-color: var(--text-secondary-dark) !important;

          &:hover {
            background: rgba(139, 92, 246, 0.08) !important;
            border-left-color: var(--accent-marketing) !important;
          }

          &.calling {
            border-left-color: var(--primary-color) !important;
            background: rgba(59, 130, 246, 0.1) !important;
          }

          &.completed {
            border-left-color: var(--success-color) !important;
            background: rgba(16, 185, 129, 0.1) !important;
          }

          &.error {
            border-left-color: var(--danger-color) !important;
            background: rgba(239, 68, 68, 0.1) !important;
          }

          .log-name {
            color: var(--text-primary-dark) !important;
          }

          .log-separator {
            color: var(--text-muted) !important;
          }

          .log-description {
            color: var(--dark-surface-3) !important;
          }

          .log-status {
            color: var(--dark-text-1) !important;
            background: rgba(248, 250, 252, 0.9) !important;
            border: var(--border-width) solid var(--accent-marketing-medium);
          }
        }

        // 🆕 单行样式（浅色主题）
        .history-content-single-line {
          .tool-name-inline {
            color: var(--text-primary-dark) !important; // 🎨 深灰色工具名
            font-weight: 600;
          }

          .tool-separator {
            color: var(--text-muted) !important; // 🎨 中灰色分隔符
          }

          .tool-description-inline {
            color: var(--dark-surface-3) !important; // 🎨 深灰色描述
            font-weight: 500;
          }

          .tool-status-inline {
            color: var(--dark-text-1) !important; // 🎨 中灰色状态
            background: rgba(248, 250, 252, 0.9) !important;
            border: var(--border-width) solid var(--accent-marketing-medium);
          }
        }

        // 🔧 保留旧样式兼容
        .history-text {
          color: var(--text-primary-dark) !important; // 🎨 深灰色文字，清晰可见
          font-weight: 500;
        }

        .history-status {
          color: var(--dark-text-1) !important; // 🎨 中灰色状态文字
          background: rgba(248, 250, 252, 0.8) !important;
          border-color: rgba(139, 92, 246, 0.2) !important;
        }
      }

      // 🎨 Thinking项在明亮主题下的样式
      .thinking-item {
        background: rgba(139, 92, 246, 0.06) !important;
        border-color: rgba(139, 92, 246, 0.2) !important;

        .thinking-item-icon {
          background: rgba(139, 92, 246, 0.15) !important;

          .icon-thinking {
            color: var(--accent-marketing) !important;
          }
        }

        .thinking-item-text {
          color: var(--dark-surface-3) !important; // 🎨 深灰色文字
        }
      }
    }

    /* 🎨 空状态 */
    .empty-state {
      .empty-text {
        color: var(--text-muted) !important;
      }
    }

    /* 🎨 思考指示器 - 明亮主题优化 */
    .thinking-section {
      .thinking-indicator {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%) !important;
        border: 1.5px solid var(--accent-marketing-medium);
        backdrop-filter: blur(10px);
        box-shadow:
          0 2px var(--spacing-sm) var(--black-alpha-4),
          inset 0 var(--border-width-base) 0 var(--white-alpha-80);

        .thinking-text {
          .thinking-title {
            color: var(--text-regular-light) !important; // 🎨 深灰色文字，明亮主题下清晰可见

            .thinking-dot {
              background: var(--accent-marketing) !important;
              box-shadow: 0 0 var(--spacing-sm) var(--accent-marketing-heavy) !important;
            }
          }

          // 🎨 修复：thinking-summary在明亮模式下的颜色
          .thinking-summary {
            color: var(--dark-surface-3) !important; // 🎨 深灰色，替代白色半透明
            background: rgba(139, 92, 246, 0.05) !important; // 🎨 淡紫色背景
          }

          // 🎨 修复：thinking-full-content在明亮模式下的颜色
          .thinking-full-content {
            color: var(--dark-surface-3) !important; // 🎨 深灰色，替代白色半透明
            background: rgba(139, 92, 246, 0.05) !important; // 🎨 淡紫色背景

            // 🎨 Markdown内容在明亮主题下的样式
            &.markdown-content {
              :deep(.markdown-message) {
                color: var(--dark-surface-3) !important; // 🎨 深灰色文字

                p {
                  margin: var(--spacing-xs) 0;
                  1.4: 51196;
                  color: var(--dark-surface-3) !important;
                }

                code {
                  background: rgba(139, 92, 246, 0.1) !important;
                  color: var(--ai-dark) !important;
                  border: var(--border-width) solid var(--accent-marketing-medium);
  // malformed CSS removed
  // malformed CSS removed
                  font-size: var(--text-xs);
                }

                strong {
                  color: var(--text-primary-dark) !important;
                }
              }
            }
          }

          .thinking-subtitle {
            color: var(--dark-text-1) !important; // 🎨 中灰色副标题

            // 🎨 Markdown内容在明亮主题下的样式
            &.markdown-content {
              :deep(.markdown-message) {
                color: var(--dark-surface-3) !important; // 🎨 深灰色文字

                p {
                  color: var(--dark-surface-3) !important;
                }

                code {
                  background: rgba(139, 92, 246, 0.1) !important;
                  color: var(--ai-dark) !important;
                  border: var(--border-width) solid var(--accent-marketing-medium);
                }

                strong {
                  color: var(--text-primary-dark) !important;
                }
              }
            }
          }
        }
      }
    }

    /* 🎨 折叠按钮 */
    .sidebar-header {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%) !important;
      border-bottom-color: rgba(139, 92, 246, 0.15) !important;

      .header-icon {
        color: var(--accent-marketing) !important;
        background: rgba(139, 92, 246, 0.08) !important;
      }

      .sidebar-title {
        color: var(--text-regular-light) !important;
      }

      .collapse-btn {
        background: var(--gradient-light-glass) !important;
        border: 1.5px solid var(--accent-marketing-medium) !important;
        backdrop-filter: blur(10px);
        color: var(--dark-text-1) !important;
        box-shadow:
          0 2px var(--spacing-sm) var(--black-alpha-4),
          inset 0 var(--border-width-base) 0 var(--white-alpha-80);
        transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.08) 100%) !important;
          border-color: rgba(139, 92, 246, 0.4) !important;
          color: var(--accent-marketing) !important;
          transform: translateY(var(--transform-hover-lift));
          box-shadow:
            0 6px var(--text-lg) var(--accent-marketing-light),
            inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1);
        }
      }
    }

    .stats-section {
      background: transparent !important;

      .stats-card {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 100%) !important;
        border: 1.5px solid rgba(139, 92, 246, 0.18) !important;
        box-shadow:
          0 2px 6px rgba(139, 92, 246, 0.08),
          inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1) !important;
        transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          border-color: rgba(139, 92, 246, 0.3) !important;
          box-shadow:
            0 var(--spacing-xs) var(--text-sm) rgba(139, 92, 246, 0.12),
            inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1) !important;
          transform: translateY(var(--z-index-below));
        }
      }

      .stats-title {
        color: var(--text-primary-dark) !important;
        font-weight: 600;
        border-bottom-color: rgba(139, 92, 246, 0.12) !important;
      }

      .stat-item-compact {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(124, 58, 237, 0.02) 100%) !important;
  // malformed CSS removed
        transition: all var(--transition-fast) ease;

        &:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.06) 100%) !important;
          transform: translateY(var(--z-index-below));
        }
      }

      .stat-label-small {
        color: var(--dark-text-1) !important;
        font-weight: 500;
      }

      .stat-value-animated {
        color: var(--accent-marketing) !important;
        font-weight: 700;
        text-shadow: 0 var(--border-width-base) 2px rgba(139, 92, 246, 0.1);
      }
    }
}
</style>