<!--
  答案显示组件
  从 AIAssistant.vue 第156-162行模板提取
-->

<template>
  <div class="answer-content">
    <!-- 文本答案 -->
    <div 
      class="answer-text" 
      :class="{ 'streaming': streaming }" 
      v-html="formattedContent"
    ></div>
    
    <!-- 流式输出光标 -->
    <span v-if="streaming" class="typing-cursor"></span>
    
    <!-- 组件渲染区域 -->
    <div v-if="hasComponent && componentData" class="component-container">
      <div class="component-header">
        <UnifiedIcon name="ai-center" />
        <span>智能组件</span>
      </div>
      <div class="component-content">
        <ComponentRenderer 
          :component-data="componentData"
          @change="handleComponentChange"
        />
      </div>
    </div>
    
    <!-- 答案操作栏 -->
    <div v-if="!streaming" class="answer-actions">
      <el-button size="small" text @click="copyAnswer" title="复制答案">
        <UnifiedIcon name="document" :size="16" />
      </el-button>
      <el-button size="small" text @click="regenerateAnswer" title="重新生成">
        <UnifiedIcon name="refresh" />
      </el-button>
      <el-button v-if="hasComponent" size="small" text @click="exportComponent" title="导出组件">
        <UnifiedIcon name="download" />
      </el-button>
      <el-button size="small" text @click="shareAnswer" title="分享答案">
        <UnifiedIcon name="ai-center" />
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import ComponentRenderer from '@/components/ai/ComponentRenderer.vue'

// ==================== Props ====================
interface Props {
  content: string
  streaming: boolean
  hasComponent: boolean
  componentData: any
}

const props = defineProps<Props>()

// ==================== Emits ====================
interface Emits {
  'component-change': [data: any]
  'regenerate': []
  'copy': [content: string]
  'share': [content: string]
  'export-component': [data: any]
}

const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================
const formattedContent = computed(() => {
  // 简单的Markdown格式化
  let formatted = props.content

  // 🔧 过滤掉AI工具调用的XML标签
  formatted = formatted.replace(/<\|FunctionCallBegin\|>[\s\S]*?<\|FunctionCallEnd\|>/g, '')
  formatted = formatted.replace(/<\|FunctionCallBegin\|>/g, '')
  formatted = formatted.replace(/<\|FunctionCallEnd\|>/g, '')

  // 处理代码块
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')

  // 处理行内代码
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 处理粗体
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 处理斜体
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // 处理换行
  formatted = formatted.replace(/\n/g, '<br>')

  return formatted
})

// ==================== 方法 ====================
// 复制答案
const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    ElMessage.success('答案已复制到剪贴板')
    emit('copy', props.content)
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

// 重新生成答案
const regenerateAnswer = () => {
  emit('regenerate')
}

// 导出组件
const exportComponent = () => {
  if (props.componentData) {
    emit('export-component', props.componentData)
  }
}

// 分享答案
const shareAnswer = () => {
  emit('share', props.content)
}

// 处理组件变更
const handleComponentChange = (data: any) => {
  emit('component-change', data)
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.answer-content {
  font-size: inherit; /* 继承父组件的字体大小 */
  background: var(--el-bg-color);
  border: var(--border-width) solid var(--el-border-color-lighter);
  border-radius: var(--text-sm);
  padding: var(--text-lg);
  position: relative;
}

.answer-text {
  font-size: var(--text-sm); /* 🔧 统一为var(--text-sm)，与智能查询标签一致 */
  line-height: 1.6;
  color: var(--el-text-color-primary);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.answer-text.streaming {
  position: relative;
}

.answer-text :deep(pre) {
  background: var(--el-fill-color-light);
  border-radius: var(--radius-md);
  padding: var(--text-sm);
  margin: var(--spacing-sm) 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--text-sm);
}

.answer-text :deep(code) {
  background: var(--el-fill-color-light);
  padding: var(--spacing-sm) 6px;
  border-radius: var(--spacing-xs);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--text-sm);
}

.answer-text :deep(strong) {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.answer-text :deep(em) {
  font-style: italic;
  color: var(--el-text-color-regular);
}

.typing-cursor {
  display: inline-block;
  width: auto;
  height: 1.2em;
  background: var(--el-color-primary);
  margin-left: var(--spacing-sm);
  animation: blink 1s infinite;
  vertical-align: text-bottom;
}

.component-container {
  margin-top: var(--text-lg);
  border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
  padding-top: var(--text-lg);
}

.component-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm); /* 🔧 统一为var(--text-sm)，与智能查询标签一致 */
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-sm);
}

.component-header .el-icon {
  color: var(--el-color-primary);
}

.component-content {
  background: var(--el-fill-color-extra-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  border: var(--border-width) solid var(--el-border-color-lighter);
}

.answer-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--text-sm);
  padding-top: var(--text-sm);
  border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
  justify-content: flex-end;
}

.answer-actions .el-button {
  color: var(--el-text-color-regular);
  transition: all var(--transition-fast);
}

.answer-actions .el-button:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

/* 动画效果 */
@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .answer-content {
  font-size: inherit; /* 继承父组件的字体大小 */
    padding: var(--text-base);
  }
  
  .answer-text {
    font-size: var(--text-sm);
  }
  
  .answer-text :deep(pre) {
    padding: var(--spacing-2xl);
    font-size: var(--text-sm);
  }
  
  .answer-text :deep(code) {
    font-size: var(--text-sm);
  }
  
  .component-content {
    padding: var(--text-base);
  }
  
  .answer-actions {
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .answer-content {
  font-size: inherit; /* 继承父组件的字体大小 */
    padding: var(--text-sm);
  }
  
  .answer-text {
    font-size: var(--text-sm);
  }
  
  .component-header {
    font-size: var(--text-sm);
  }
  
  .component-content {
    padding: var(--text-sm);
  }
  
  .answer-actions {
    justify-content: center;
  }
}

/* 暗色主题适配 */
.theme-dark .answer-content {
  font-size: inherit; /* 继承父组件的字体大小 */
  background: var(--el-bg-color-dark);
  border-color: var(--el-border-color-dark);
}

.theme-dark .answer-text :deep(pre) {
  background: var(--el-fill-color-dark);
}

.theme-dark .answer-text :deep(code) {
  background: var(--el-fill-color-dark);
}

.theme-dark .component-content {
  background: var(--el-fill-color-dark);
  border-color: var(--el-border-color-dark);
}
</style>
