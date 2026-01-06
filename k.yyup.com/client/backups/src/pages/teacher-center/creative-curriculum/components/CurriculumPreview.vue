<template>
  <div class="curriculum-preview" ref="previewContainer">
    <div class="preview-header" v-show="!isFullscreen">
      <h3>📱 实时预览</h3>
      <div class="header-actions">
        <el-button
          type="primary"
          size="small"
          @click="refreshPreview"
          :loading="isRefreshing"
        >
          <el-icon><RefreshRight /></el-icon>
          刷新预览
        </el-button>
        <el-button
          type="success"
          size="small"
          @click="enterFullscreen"
          :disabled="!hasContent"
        >
          <el-icon><FullScreen /></el-icon>
          全屏上课
        </el-button>
      </div>
    </div>

    <div class="preview-container" :class="{ 'fullscreen-mode': isFullscreen }">
      <iframe
        ref="previewFrame"
        class="preview-frame"
        sandbox="allow-scripts allow-same-origin"
        title="课程预览"
      ></iframe>

      <!-- 全屏模式退出按钮 -->
      <div v-if="isFullscreen" class="fullscreen-controls">
        <el-button
          type="danger"
          size="large"
          @click="exitFullscreen"
          class="exit-fullscreen-btn"
        >
          <el-icon><CloseBold /></el-icon>
          退出全屏 (ESC)
        </el-button>
      </div>
    </div>

    <div v-if="error && !isFullscreen" class="error-message">
      <el-icon><Warning /></el-icon>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight, Warning, FullScreen, CloseBold } from '@element-plus/icons-vue'

interface Props {
  htmlCode: string
  cssCode: string
  jsCode: string
}

const props = withDefaults(defineProps<Props>(), {
  htmlCode: '',
  cssCode: '',
  jsCode: ''
})

const previewFrame = ref<HTMLIFrameElement>()
const previewContainer = ref<HTMLDivElement>()
const isRefreshing = ref(false)
const isFullscreen = ref(false)
const error = ref('')

// 检查是否有内容
const hasContent = computed(() => {
  return !!(props.htmlCode || props.cssCode || props.jsCode)
})

// 生成预览内容
function generatePreviewContent(): string {
  const htmlContent = props.htmlCode || ''
  const cssContent = props.cssCode || ''
  const jsContent = props.jsCode || ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>课程预览</title>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Arial', sans-serif;
  background: var(--bg-secondary);
  padding: var(--spacing-2xl);
}
${cssContent}
</style>
</head>
<body>
${htmlContent}
<script>
${jsContent}
<\/script>
</body>
</html>`
}

// 刷新预览
function refreshPreview() {
  try {
    isRefreshing.value = true
    error.value = ''
    
    if (!previewFrame.value) {
      error.value = '预览框架加载失败'
      return
    }

    const content = generatePreviewContent()
    const doc = previewFrame.value.contentDocument
    
    if (!doc) {
      error.value = '无法访问预览文档'
      return
    }

    doc.open()
    doc.write(content)
    doc.close()
    
    ElMessage.success('预览已刷新')
  } catch (err) {
    error.value = `预览错误: ${err instanceof Error ? err.message : '未知错误'}`
    console.error('Preview error:', err)
  } finally {
    isRefreshing.value = false
  }
}

// 进入全屏模式
function enterFullscreen() {
  if (!hasContent.value) {
    ElMessage.warning('请先生成或编辑课程内容')
    return
  }

  const element = previewContainer.value
  if (!element) {
    ElMessage.error('无法进入全屏模式')
    return
  }

  try {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      // Safari
      (element as any).webkitRequestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
      // Firefox
      (element as any).mozRequestFullScreen()
    } else if ((element as any).msRequestFullscreen) {
      // IE/Edge
      (element as any).msRequestFullscreen()
    }
    isFullscreen.value = true
    ElMessage.success('已进入全屏上课模式，按 ESC 键退出')
  } catch (err) {
    ElMessage.error('进入全屏失败')
    console.error('Fullscreen error:', err)
  }
}

// 退出全屏模式
function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
    }
    isFullscreen.value = false
    ElMessage.success('已退出全屏模式')
  } catch (err) {
    console.error('Exit fullscreen error:', err)
  }
}

// 监听全屏状态变化
function handleFullscreenChange() {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )

  if (!isCurrentlyFullscreen && isFullscreen.value) {
    isFullscreen.value = false
    ElMessage.info('已退出全屏模式')
  }
}

// 监听 ESC 键退出全屏
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isFullscreen.value) {
    exitFullscreen()
  }
}

// 监听代码变化
watch(
  () => [props.htmlCode, props.cssCode, props.jsCode],
  () => {
    refreshPreview()
  },
  { deep: true }
)

// 初始化预览
onMounted(() => {
  refreshPreview()

  // 添加全屏状态监听
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)

  // 添加键盘监听
  document.addEventListener('keydown', handleKeydown)
})

// 清理监听器
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法给父组件
defineExpose({
  enterFullscreen,
  exitFullscreen,
  refreshPreview
})
</script>

<style scoped lang="scss">
.curriculum-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
  position: relative;

  // 全屏模式样式
  &:fullscreen,
  &:-webkit-full-screen,
  &:-moz-full-screen,
  &:-ms-fullscreen {
    background: #1a1a1a;
    border-radius: 0;

    .preview-container {
      background: #1a1a1a;
    }
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-4xl);
    border-bottom: var(--border-width-base) solid #eee;
    background: var(--bg-tertiary);

    h3 {
      margin: 0;
      font-size: 1em;
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-2xl);
    }
  }

  .preview-container {
    flex: 1;
    overflow: auto;
    background: var(--bg-secondary);
    position: relative;

    // 全屏模式样式
    &.fullscreen-mode {
      background: #1a1a1a;

      .preview-frame {
        background: white;
      }
    }
  }

  .preview-frame {
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  }

  // 全屏控制按钮
  .fullscreen-controls {
    position: fixed;
    top: var(--text-2xl);
    right: var(--text-2xl);
    z-index: 9999;

    .exit-fullscreen-btn {
      font-size: 1.1em;
      padding: var(--spacing-4xl) 25px;
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-heavy);
      animation: pulse 2s infinite;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px var(--text-lg) var(--shadow-heavy);
      }
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xl);
    padding: var(--spacing-4xl);
    background: #fef0f0;
    color: var(--danger-color);
    border-top: var(--border-width-base) solid #fde2e2;

    :deep(.el-icon) {
      font-size: 1.2em;
    }
  }
}

// 全屏模式动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>

