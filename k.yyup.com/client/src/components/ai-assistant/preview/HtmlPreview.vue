<!--
  HTML预览组件 - Claude Artifacts风格
  
  功能：
  - 实时预览HTML/CSS/JavaScript代码
  - 代码编辑和实时更新
  - 全屏沉浸式体验
  - 复制和下载功能
-->

<template>
  <div class="html-preview-container" v-if="visible">
    <!-- 预览头部 -->
    <div class="preview-header">
      <div class="header-left">
        <h3 class="preview-title">
          <UnifiedIcon name="document" :size="16" />
          {{ title }}
        </h3>
      </div>
      <div class="header-actions">
        <el-button 
          :type="activeTab === 'code' ? 'primary' : ''" 
          size="small"
          @click="activeTab = 'code'"
        >
          <UnifiedIcon name="Edit" />
          代码
        </el-button>
        <el-button 
          :type="activeTab === 'preview' ? 'primary' : ''" 
          size="small"
          @click="activeTab = 'preview'"
        >
          <UnifiedIcon name="eye" />
          预览
        </el-button>
        <el-button size="small" @click="copyCode">
          <UnifiedIcon name="ai-center" />
          复制
        </el-button>
        <el-button size="small" @click="downloadHtml">
          <UnifiedIcon name="download" />
          下载
        </el-button>
        <el-button size="small" @click="handleClose" type="danger">
          <UnifiedIcon name="close" :size="16" />
          关闭
        </el-button>
      </div>
    </div>

    <!-- 预览内容 -->
    <div class="preview-content">
      <!-- 代码编辑器 -->
      <div v-show="activeTab === 'code'" class="code-editor">
        <textarea 
          v-model="editableCode"
          class="code-textarea"
          spellcheck="false"
          @input="handleCodeChange"
        ></textarea>
      </div>

      <!-- 预览区域 -->
      <div v-show="activeTab === 'preview'" class="preview-area">
        <iframe 
          ref="previewIframe"
          :srcdoc="previewCode"
          sandbox="allow-scripts allow-forms allow-modals allow-popups"
          class="preview-iframe"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  EditPen,
  View,
  CopyDocument,
  Download,
  Close
} from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

// ==================== Props ====================
interface Props {
  visible: boolean
  code: string
  title: string
  contentType?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  code: '',
  title: 'HTML预览',
  contentType: 'course'
})

// 🧪 组件挂载时的调试日志
onMounted(() => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 [HtmlPreview] 组件已挂载')
  console.log('🧪 [HtmlPreview] props.visible:', props.visible)
  console.log('🧪 [HtmlPreview] props.code长度:', props.code?.length || 0)
  console.log('🧪 [HtmlPreview] props.title:', props.title)
  console.log('🧪 [HtmlPreview] props.contentType:', props.contentType)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})

// ==================== Emits ====================
const emit = defineEmits<{
  close: []
  'update:visible': [value: boolean]
}>()

// ==================== 状态管理 ====================
const activeTab = ref<'code' | 'preview'>('preview')
const editableCode = ref('')
const previewCode = ref('')
const previewIframe = ref<HTMLIFrameElement | null>(null)

// ==================== 监听器 ====================
// 监听props.code变化，更新编辑器和预览
watch(() => props.code, (newCode) => {
  console.log('🔍 [HtmlPreview] props.code变化:', {
    newCodeLength: newCode?.length || 0,
    newCodePreview: newCode?.substring(0, 100) || ''
  })
  if (newCode) {
    editableCode.value = newCode
    previewCode.value = newCode
    console.log('✅ [HtmlPreview] 已更新editableCode和previewCode')
  }
}, { immediate: true })

// 监听visible变化，重置状态
watch(() => props.visible, (newVisible) => {
  console.log('🔍 [HtmlPreview] props.visible变化:', newVisible)
  if (newVisible) {
    activeTab.value = 'preview'
    editableCode.value = props.code
    previewCode.value = props.code
    console.log('✅ [HtmlPreview] 已重置状态，code长度:', props.code?.length || 0)
  }
})

// ==================== 防抖更新预览 ====================
const debouncedUpdatePreview = debounce(() => {
  previewCode.value = editableCode.value
}, 500)

// ==================== 事件处理 ====================
/**
 * 处理代码变化
 */
const handleCodeChange = () => {
  debouncedUpdatePreview()
}

/**
 * 复制代码到剪贴板
 */
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(editableCode.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

/**
 * 下载HTML文件
 */
const downloadHtml = () => {
  try {
    const blob = new Blob([editableCode.value], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${props.title}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    ElMessage.success('HTML文件已下载')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

/**
 * 关闭预览
 */
const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.html-preview-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: var(--bg-white) !important;
  z-index: 500000 !important; // 🔧 修复：确保在最顶层，远高于Element Plus的3000和其他所有元素
  display: flex !important;
  flex-direction: column !important;
  animation: fadeIn 0.3s ease-in;
  isolation: isolate !important; // 🔧 创建新的层叠上下文
  transform: translateZ(0) !important; // 🔧 强制硬件加速，提升到独立层
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// ==================== 预览头部 ====================
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg) var(--text-3xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: var(--text-on-primary);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  z-index: var(--z-index-fixed)999 !important; // 🔧 修复：确保头部工具栏在最顶层，不被预览内容遮挡
  position: relative; // 🔧 确保z-index生效
}

.header-left {
  display: flex;
  align-items: center;
}

.preview-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-on-primary);
}

.title-icon {
  font-size: var(--spacing-xl);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

// ==================== 预览内容 ====================
.preview-content {
  flex: 1;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  position: relative;
}

// ==================== 代码编辑器 ====================
.code-editor {
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
  overflow: auto;
}

.code-textarea {
  width: 100%;
  height: 100%;
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: none;
  outline: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: var(--text-base);
  line-height: 1.6;
  resize: none;
  tab-size: 2;
}

.code-textarea::-webkit-scrollbar {
  width: var(--text-sm);
  height: var(--text-sm);
}

.code-textarea::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.code-textarea::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: var(--radius-md);
}

.code-textarea::-webkit-scrollbar-thumb:hover {
  background: #4e4e4e;
}

// ==================== 预览区域 ====================
.preview-area {
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
  overflow: auto; // 🔧 修复：允许滚动查看完整内容
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  display: block; // 🔧 确保iframe正确显示
}

// ==================== 响应式设计 ====================
@media (max-width: var(--breakpoint-md)) {
  .preview-header {
    flex-direction: column;
    gap: var(--text-sm);
    padding: var(--text-sm) var(--text-lg);
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .preview-title {
    font-size: var(--text-lg);
  }
}
</style>

