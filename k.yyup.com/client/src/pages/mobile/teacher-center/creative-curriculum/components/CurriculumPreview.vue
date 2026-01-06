<template>
  <div class="mobile-curriculum-preview" ref="previewContainer">
    <!-- 预览头部工具栏 -->
    <div class="preview-header" v-show="!isFullscreen">
      <div class="header-title">
        <van-icon name="eye-o" />
        <span>实时预览</span>
      </div>
      <div class="header-actions">
        <van-button
          type="primary"
          size="small"
          @click="refreshPreview"
          :loading="isRefreshing"
          icon="replay"
        >
          刷新
        </van-button>
        <van-button
          type="success"
          size="small"
          @click="enterFullscreen"
          :disabled="!hasContent"
          icon="expand"
        >
          全屏
        </van-button>
      </div>
    </div>

    <!-- 设备模拟器选择器 -->
    <div class="device-selector" v-show="!isFullscreen">
      <van-tabs v-model:active="activeDevice" @change="handleDeviceChange" shrink>
        <van-tab title="手机" name="mobile">
          <template #title>
            <van-icon name="phone-o" />
            手机
          </template>
        </van-tab>
        <van-tab title="平板" name="tablet">
          <template #title>
            <van-icon name="tablet" />
            平板
          </template>
        </van-tab>
        <van-tab title="桌面" name="desktop">
          <template #title>
            <van-icon name="desktop-o" />
            桌面
          </template>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 预览容器 -->
    <div class="preview-container" :class="{ 'fullscreen-mode': isFullscreen }">
      <div class="device-frame" :class="`device-${activeDevice}`">
        <iframe
          ref="previewFrame"
          class="preview-frame"
          sandbox="allow-scripts allow-same-origin allow-forms"
          :style="{ transform: `scale(${deviceScale})` }"
          title="课程预览"
        ></iframe>
      </div>

      <!-- 全屏模式控制 -->
      <div v-if="isFullscreen" class="fullscreen-controls">
        <div class="control-info">
          <van-notice-bar
            left-icon="info-o"
            background="#1989fa"
            color="#fff"
            text="全屏上课模式 - 按 ESC 键退出"
          />
        </div>
        <div class="control-buttons">
          <van-button
            type="danger"
            size="large"
            @click="exitFullscreen"
            icon="cross"
            round
          >
            退出全屏
          </van-button>
        </div>
      </div>
    </div>

    <!-- 预览状态信息 -->
    <div v-if="!isFullscreen" class="preview-status">
      <div class="status-item">
        <van-icon name="description" />
        <span>HTML: {{ htmlCode.length }} 字符</span>
      </div>
      <div class="status-item">
        <van-icon name="brush-o" />
        <span>CSS: {{ cssCode.length }} 字符</span>
      </div>
      <div class="status-item">
        <van-icon name="cpu" />
        <span>JS: {{ jsCode.length }} 字符</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error && !isFullscreen" class="error-message">
      <van-empty
        image="error"
        :description="error"
        image-size="80"
      >
        <van-button type="primary" @click="refreshPreview" size="small">
          重试刷新
        </van-button>
      </van-empty>
    </div>

    <!-- 加载状态 -->
    <div v-if="isRefreshing && !error" class="loading-overlay">
      <van-loading type="spinner" color="#1989fa" vertical>
        正在加载预览...
      </van-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { useMobileLayout } from '@/composables/useMobileLayout'

interface Props {
  htmlCode: string
  cssCode: string
  jsCode: string
  autoRefresh?: boolean
  refreshDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  htmlCode: '',
  cssCode: '',
  jsCode: '',
  autoRefresh: true,
  refreshDelay: 1000
})

const emit = defineEmits<{
  'refresh': []
  'fullscreen-enter': []
  'fullscreen-exit': []
  'error': [error: string]
}>()

const { toggleFullscreen } = useMobileLayout()

// 响应式数据
const previewFrame = ref<HTMLIFrameElement>()
const previewContainer = ref<HTMLDivElement>()
const isRefreshing = ref(false)
const isFullscreen = ref(false)
const error = ref('')
const activeDevice = ref<'mobile' | 'tablet' | 'desktop'>('mobile')
const refreshTimer = ref<NodeJS.Timeout>()

// 设备缩放比例
const deviceScale = computed(() => {
  switch (activeDevice.value) {
    case 'mobile':
      return 0.8
    case 'tablet':
      return 0.6
    case 'desktop':
      return 0.4
    default:
      return 1
  }
})

// 检查是否有内容
const hasContent = computed(() => {
  return !!(props.htmlCode || props.cssCode || props.jsCode)
})

// 生成预览内容
function generatePreviewContent(): string {
  const htmlContent = props.htmlCode || '<div class="placeholder">请添加HTML内容</div>'
  const cssContent = props.cssCode || '/* 请添加CSS样式 */'
  const jsContent = props.jsCode || '// 请添加JavaScript代码'

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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #f5f5f5;
  padding: var(--spacing-md);
  line-height: 1.6;
}
.placeholder {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 40px 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
}
${cssContent}
</style>
</head>
<body>
${htmlContent}
<script>
try {
${jsContent}
} catch(err) {
  console.error('JavaScript执行错误:', err);
}
<\/script>
</body>
</html>`
}

// 刷新预览
async function refreshPreview() {
  try {
    isRefreshing.value = true
    error.value = ''

    if (!previewFrame.value) {
      throw new Error('预览框架加载失败')
    }

    const content = generatePreviewContent()
    const doc = previewFrame.value.contentDocument

    if (!doc) {
      throw new Error('无法访问预览文档')
    }

    // 等待一帧确保iframe准备就绪
    await new Promise(resolve => requestAnimationFrame(resolve))

    doc.open()
    doc.write(content)
    doc.close()

    emit('refresh')
    showToast('预览已刷新')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误'
    error.value = `预览错误: ${errorMessage}`
    emit('error', errorMessage)
    showFailToast('预览刷新失败')
    console.error('Preview error:', err)
  } finally {
    isRefreshing.value = false
  }
}

// 延迟刷新预览
function delayedRefresh() {
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
  }

  refreshTimer.value = setTimeout(() => {
    refreshPreview()
  }, props.refreshDelay)
}

// 进入全屏模式
function enterFullscreen() {
  if (!hasContent.value) {
    showToast('请先生成或编辑课程内容')
    return
  }

  const element = previewContainer.value
  if (!element) {
    showToast('无法进入全屏模式')
    return
  }

  try {
    // 使用Vant的全屏API或者原生API
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen()
    } else {
      // 回退到模拟全屏
      isFullscreen.value = true
      document.body.style.overflow = 'hidden'
      showToast('已进入全屏上课模式')
    }

    emit('fullscreen-enter')
  } catch (err) {
    showFailToast('进入全屏失败')
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
    } else {
      // 回退退出全屏
      isFullscreen.value = false
      document.body.style.overflow = ''
    }

    emit('fullscreen-exit')
    showToast('已退出全屏模式')
  } catch (err) {
    console.error('Exit fullscreen error:', err)
  }
}

// 监听全屏状态变化
function handleFullscreenChange() {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement
  )

  if (!isCurrentlyFullscreen && isFullscreen.value) {
    isFullscreen.value = false
    document.body.style.overflow = ''
    emit('fullscreen-exit')
    showToast('已退出全屏模式')
  }
}

// 监听 ESC 键退出全屏
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isFullscreen.value) {
    exitFullscreen()
  }
}

// 处理设备切换
function handleDeviceChange(deviceName: string) {
  activeDevice.value = deviceName as 'mobile' | 'tablet' | 'desktop'
  showToast(`切换到${deviceName === 'mobile' ? '手机' : deviceName === 'tablet' ? '平板' : '桌面'}视图`)
}

// 监听代码变化
watch(
  () => [props.htmlCode, props.cssCode, props.jsCode],
  () => {
    if (props.autoRefresh) {
      delayedRefresh()
    }
  },
  { deep: true }
)

// 组件挂载时初始化
onMounted(() => {
  refreshPreview()

  // 添加全屏状态监听
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)

  // 添加键盘监听
  document.addEventListener('keydown', handleKeydown)

  // 检测移动设备并自动选择
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    activeDevice.value = 'mobile'
  } else if (/iPad|Android/i.test(navigator.userAgent)) {
    activeDevice.value = 'tablet'
  }
})

// 组件卸载时清理监听器
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('keydown', handleKeydown)

  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
  }

  // 恢复body滚动
  document.body.style.overflow = ''
})

// 暴露方法给父组件
defineExpose({
  refreshPreview,
  enterFullscreen,
  exitFullscreen,
  toggleDevice: handleDeviceChange
})
</script>

<style scoped lang="scss">
.mobile-curriculum-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--van-background-2);
  border-radius: var(--van-radius-md);
  overflow: hidden;
  position: relative;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-md);
    background: var(--van-background-3);
    border-bottom: 1px solid var(--van-border-color);

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--van-padding-xs);
      font-weight: 600;
      color: var(--van-text-color-1);
    }

    .header-actions {
      display: flex;
      gap: var(--van-padding-xs);

      .van-button {
        min-width: 60px;
      }
    }
  }

  .device-selector {
    background: var(--van-background-3);
    border-bottom: 1px solid var(--van-border-color);

    :deep(.van-tabs) {
      .van-tabs__nav {
        padding-bottom: 0;
      }

      .van-tab {
        flex: 1;

        .van-tab__text {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
        }
      }
    }
  }

  .preview-container {
    flex: 1;
    overflow: hidden;
    position: relative;
    background: var(--van-background-color);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--van-padding-md);

    &.fullscreen-mode {
      padding: 0;
      background: #1a1a1a;

      .device-frame {
        max-width: none;
        max-height: none;
        border: none;
        border-radius: 0;
      }
    }

    .device-frame {
      position: relative;
      background: white;
      border-radius: var(--van-radius-lg);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      transition: all 0.3s ease;

      &.device-mobile {
        width: 375px;
        height: 667px;
        max-width: 90vw;
        max-height: 80vh;
      }

      &.device-tablet {
        width: 768px;
        height: 1024px;
        max-width: 95vw;
        max-height: 85vh;
      }

      &.device-desktop {
        width: 1200px;
        height: 800px;
        max-width: 98vw;
        max-height: 90vh;
      }

      .preview-frame {
        width: 100%;
        height: 100%;
        border: none;
        background: white;
        transform-origin: center center;
        transition: transform 0.3s ease;
      }
    }

    // 全屏控制
    .fullscreen-controls {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.8);

      .control-info {
        flex-shrink: 0;
      }

      .control-buttons {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        padding: var(--van-padding-lg);

        .van-button {
          font-size: var(--van-font-size-lg);
          padding: var(--van-padding-md) var(--van-padding-xl);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: pulse 2s infinite;
        }
      }
    }
  }

  .preview-status {
    display: flex;
    justify-content: space-around;
    padding: var(--van-padding-md);
    background: var(--van-background-3);
    border-top: 1px solid var(--van-border-color);

    .status-item {
      display: flex;
      align-items: center;
      gap: var(--van-padding-xs);
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);

      .van-icon {
        font-size: var(--van-font-size-md);
      }
    }
  }

  .error-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    padding: var(--van-padding-lg);
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 100;
  }
}

// 全屏模式动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-md)) {
  .mobile-curriculum-preview {
    .preview-container {
      .device-frame {
        &.device-mobile {
          width: 100%;
          height: 70vh;
          max-width: none;
          border-radius: var(--van-radius-md);
        }

        &.device-tablet,
        &.device-desktop {
          width: 100%;
          height: 70vh;
          max-width: none;
        }
      }
    }

    .preview-status {
      .status-item {
        flex-direction: column;
        gap: 2px;
        font-size: var(--van-font-size-xs);
      }
    }
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .mobile-curriculum-preview {
    .preview-header {
      .header-title span {
        display: none; // 小屏幕隐藏标题文字，只显示图标
      }

      .header-actions {
        .van-button {
          min-width: 50px;
          padding: var(--van-padding-xs);
        }
      }
    }

    .device-selector {
      :deep(.van-tabs) {
        .van-tab__text {
          span {
            display: none; // 小屏幕只显示图标
          }
        }
      }
    }
  }
}
</style>