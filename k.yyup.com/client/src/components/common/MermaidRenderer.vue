<!--
  🎨 Mermaid流程图渲染组件

  支持渲染Mermaid格式的流程图、时序图、甘特图等
  自动检测并渲染Markdown中的Mermaid代码块
-->

<template>
  <div class="mermaid-renderer">
    <div
      v-if="error"
      class="mermaid-error"
      :class="{ 'dark-theme': isDark }"
    >
      <div class="error-header">
        <UnifiedIcon name="alert-triangle" :size="16" />
        <span>流程图渲染失败</span>
      </div>
      <div class="error-message">{{ error }}</div>
      <details class="error-details">
        <summary>查看原始代码</summary>
        <pre><code>{{ mermaidCode }}</code></pre>
      </details>
    </div>

    <div v-else class="mermaid-wrapper" :class="{ 'fullscreen': isFullscreen, 'expanded': isExpanded }" ref="wrapperRef" tabindex="0" @keydown.esc.prevent="isFullscreen = false">
      <div v-if="allowFullscreen" class="mermaid-toolbar">
        <button class="fullscreen-btn" :class="{ active: !isCodeView }" @click="isCodeView = false">图表</button>
        <button class="fullscreen-btn" :class="{ active: isCodeView }" @click="isCodeView = true">文本</button>
        <span class="sep"></span>
        <button class="fullscreen-btn" @click="zoomOut">-</button>
        <button class="fullscreen-btn" @click="fitToWidth">适配</button>
        <button class="fullscreen-btn" @click="zoomIn">+</button>
        <span class="zoom-indicator">{{ Math.round(zoom * 100) }}%</span>
        <span class="sep"></span>
        <button class="fullscreen-btn" @click="toggleExpanded">{{ isExpanded ? '收起' : '放大' }}</button>
        <button class="fullscreen-btn" @click="toggleFullscreen">{{ isFullscreen ? '退出全屏' : '全屏' }}</button>
      </div>

      <div v-if="isCodeView" class="code-view">
        <pre><code>{{ mermaidCode }}</code></pre>
      </div>
      <div v-else ref="scrollArea" class="mermaid-scroll" :style="{ maxHeight: isFullscreen ? '100vh' : maxHeightCss, height: isFullscreen || isExpanded ? '100vh' : undefined }">
        <div class="mermaid-viewport" :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }">
          <div
            ref="mermaidContainer"
            class="mermaid-container"
            :class="{ 'dark-theme': isDark, 'mobile-optimized': isMobile }"
          >
            <!-- Mermaid图表将在这里渲染 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'

// 按需从 CDN 加载 mermaid，避免打包时必须有本地依赖
let mermaid: any
const ensureMermaidLoaded = async (): Promise<void> => {
  if (mermaid) return
  const g = window as any
  if (g.mermaid) { mermaid = g.mermaid; return }
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.async = true
    script.onload = () => { mermaid = (window as any).mermaid; resolve() }
    script.onerror = () => reject(new Error('无法加载 mermaid 库'))
    document.head.appendChild(script)
  })
}

interface Props {
  mermaidCode: string
  isDark?: boolean
  isMobile?: boolean
  theme?: 'default' | 'dark' | 'forest' | 'neutral'
  width?: string | number
  height?: string | number
  maxHeight?: string | number
  maxWidth?: string | number
  allowFullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDark: false,
  isMobile: false,
  theme: 'default',
  width: '100%',
  height: 'auto',
  maxHeight: '100px',
  allowFullscreen: true
})

const wrapperRef = ref<HTMLElement>()
const isCodeView = ref(false)
const isExpanded = ref(false)
const toggleExpanded = () => { isExpanded.value = !isExpanded.value; nextTick(() => renderMermaid()) }
const scrollArea = ref<HTMLElement>()
const panX = ref(0)
const panY = ref(0)
let isPanning = false
let lastX = 0
let lastY = 0

// 鼠标拖拽平移
const onMouseDown = (e: MouseEvent) => { isPanning = true; lastX = e.clientX; lastY = e.clientY }
const onMouseMove = (e: MouseEvent) => {
  if (!isPanning) return
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  panX.value += dx
  panY.value += dy
  lastX = e.clientX
  lastY = e.clientY
}
const onMouseUp = () => { isPanning = false }

// 滚轮缩放（以鼠标位置为中心）
const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const prevZoom = zoom.value
  const nextZoom = Math.min(2.5, Math.max(0.2, +(prevZoom + delta).toFixed(2)))
  if (!scrollArea.value) { zoom.value = nextZoom; return }
  const rect = scrollArea.value.getBoundingClientRect()
  const offsetX = e.clientX - rect.left - panX.value
  const offsetY = e.clientY - rect.top - panY.value
  const scale = nextZoom / prevZoom
  panX.value = e.clientX - rect.left - offsetX * scale
  panY.value = e.clientY - rect.top - offsetY * scale
  zoom.value = nextZoom
}

onMounted(() => {
  const area = scrollArea.value
  if (!area) return
  area.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  area.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
  const area = scrollArea.value
  if (!area) return
  area.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  area.removeEventListener('wheel', onWheel as any)
})

const zoom = ref(0.4)

const fitToWidth = () => {
  const container = mermaidContainer.value?.parentElement
  const svg = mermaidContainer.value?.querySelector('svg') as SVGSVGElement | null
  if (!container || !svg) return
  const containerWidth = container.clientWidth
  const svgWidth = svg.getBBox ? svg.getBBox().width : svg.clientWidth
  if (svgWidth > 0) {
    zoom.value = Math.min(1, Math.max(0.3, containerWidth / svgWidth))
  }
}
const zoomIn = () => { zoom.value = Math.min(2, +(zoom.value + 0.1).toFixed(2)) }
const zoomOut = () => { zoom.value = Math.max(0.3, +(zoom.value - 0.1).toFixed(2)) }


const mermaidContainer = ref<HTMLElement>()
const error = ref<string>('')
const isInitialized = ref(false)
const isFullscreen = ref(false)

const maxHeightCss = computed(() => typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight)

const toggleFullscreen = () => {
  const root = document.documentElement as any
  if (!isFullscreen.value) {
    // 进入浏览器原生全屏
    const el = document.documentElement as any
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
    req && req.call(el)
    isFullscreen.value = true
  } else {
    const ex = document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen
    ex && ex.call(document)
    isFullscreen.value = false
  }
  nextTick(() => renderMermaid())
}


// 初始化Mermaid配置
const initializeMermaid = async () => {
  if (isInitialized.value) return

  try {
    await ensureMermaidLoaded()
    const theme = props.isDark ? 'dark' : props.theme

    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      fontSize: props.isMobile ? 12 : 14,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: props.isMobile ? 10 : 20
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        width: props.isMobile ? 200 : 300
      },
      gantt: {
        useMaxWidth: true,
        fontSize: props.isMobile ? 10 : 12
      },
      pie: {
        useMaxWidth: true
      },
      journey: {
        useMaxWidth: true
      },
      timeline: {
        useMaxWidth: true
      }
    })

    isInitialized.value = true
    console.log('🎨 Mermaid初始化完成，主题:', theme)
  } catch (err: any) {
    console.error('❌ Mermaid初始化失败:', err)
    error.value = `初始化失败: ${err.message}`
  }
}

// 渲染Mermaid图表
const renderMermaid = async () => {
  if (!mermaidContainer.value || !props.mermaidCode.trim()) {
    return
  }

  try {
    error.value = ''

    // 确保Mermaid已初始化
    if (!isInitialized.value) {
      await initializeMermaid()
    }

    // 清空容器
    mermaidContainer.value.innerHTML = ''

    // 生成唯一ID
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 验证Mermaid代码
    const cleanCode = props.mermaidCode.trim()
    if (!cleanCode) {
      throw new Error('Mermaid代码为空')
    }

    console.log('🎨 开始渲染Mermaid图表:', cleanCode.substring(0, 100) + '...')

    // 渲染图表
    const { svg } = await mermaid.render(id, cleanCode)

    // 插入SVG到容器
    mermaidContainer.value.innerHTML = svg

    // 应用样式
  const svgEl = mermaidContainer.value.querySelector('svg') as SVGSVGElement | null
  if (svgEl) {
    // 初始定位与样式
    panX.value = 20
    panY.value = 20
    svgEl.style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
    svgEl.style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
    svgEl.style.maxWidth = '100%'
    if (props.isMobile) {
      svgEl.style.fontSize = 'var(--text-sm)'
    }
  }

    console.log('✅ Mermaid图表渲染成功')
    // 普通模式下自动适配宽度，避免默认过大
    nextTick(() => {
      if (!isFullscreen.value) {
        fitToWidth()
      }
    })

  } catch (err: any) {
    console.error('❌ Mermaid渲染失败:', err)
    error.value = err.message || '渲染失败'

    // 如果是语法错误，提供更友好的错误信息
    if (err.message?.includes('Parse error')) {
      error.value = '流程图语法错误，请检查代码格式'
    } else if (err.message?.includes('Lexical error')) {
      error.value = '流程图词法错误，请检查关键字拼写'
    }
  }
}

// 监听代码变化
watch(() => props.mermaidCode, () => {
  nextTick(() => {
    renderMermaid()
  })
}, { immediate: false })

// 监听主题变化
watch(() => props.isDark, () => {
  isInitialized.value = false
  nextTick(() => {
    renderMermaid()
  })
})

// 组件挂载后渲染
onMounted(() => {
  nextTick(() => {
    renderMermaid()
  })
})
</script>

<style scoped>
.mermaid-renderer {
  width: 100%;
  margin: var(--text-lg) 0;
}

.mermaid-wrapper { position: relative; }
.mermaid-toolbar {
  position: absolute;
  top: var(--position-lg);
  right: var(--position-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.75);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: 0 var(--spacing-xs) var(--text-lg) rgba(0,0,0,.12);
  backdrop-filter: saturate(180%) blur(var(--spacing-sm));
  z-index: var(--transform-drop);
}
.dark-theme .mermaid-toolbar { background: rgba(17, 24, 39, 0.6); border-color: var(--color-gray-700); color: var(--border-color); }
.fullscreen .mermaid-toolbar { top: var(--text-sm); right: var(--text-sm); }

.mermaid-toolbar .fullscreen-btn {
  appearance: none;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  padding: var(--spacing-lg) 10px;
  height: var(--button-height-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1;
  font-weight: 500;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease, transform .05s ease;
}
.dark-theme .mermaid-toolbar .fullscreen-btn { color: var(--border-color); }
.mermaid-toolbar .fullscreen-btn:hover { background: rgba(59,130,246,.12); color: #1d4ed8; }
.dark-theme .mermaid-toolbar .fullscreen-btn:hover { background: rgba(59,130,246,.2); color: #93c5fd; }
.mermaid-toolbar .fullscreen-btn:active { transform: translateY(var(--z-index-dropdown)); }
.mermaid-toolbar .fullscreen-btn.active { background: var(--primary-color); color: var(--bg-white); }

.mermaid-toolbar .zoom-indicator {
  font-variant: tabular-nums;
  font-weight: 600;
  color: var(--color-gray-700);
  background: rgba(0,0,0,.04);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) 6px;
  min-width: 4var(--spacing-xs);
  text-align: right;
}
.dark-theme .mermaid-toolbar .zoom-indicator { color: var(--border-color); background: rgba(255,255,255,.08); }

.mermaid-toolbar .sep { width: var(--border-width-base); height: var(--text-xl); background: var(--border-color); margin: 0 2px; }
.dark-theme .mermaid-toolbar .sep { background: var(--color-gray-700); }

.code-view { background: #0b1020; color: #e4e7ef; border-radius: var(--spacing-sm); padding: var(--text-sm); margin-top: var(--spacing-sm); box-shadow: inset 0 var(--border-width-base) 3px rgba(0,0,0,.1); }
.code-view pre { margin: 0; white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; font-size: var(--text-sm); line-height: 1.6; }

.mermaid-container {
  width: 100%;
  text-align: center;
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  overflow-x: auto;
  transition: all var(--transition-normal) ease;
}

.mermaid-viewport { will-change: transform }
.mermaid-scroll { cursor: grab; transform-origin: 0 0 }
.mermaid-scroll:active { cursor: grabbing }

.mermaid-container.dark-theme {
  background: var(--text-primary);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy);
}

.mermaid-container.mobile-optimized {
  padding: var(--text-sm);
  margin: var(--text-sm) 0;
  border-radius: var(--radius-md);
}

.mermaid-error {
  background: #fef2f2;
  border: var(--border-width) solid #fecaca;
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  margin: var(--text-lg) 0;
}

.mermaid-scroll { transform-origin: top left }

.mermaid-error.dark-theme {
  background: #7f1d1d;
  border-color: #dc2626;
  color: #fecaca;
}

.error-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  color: #dc2626;
  margin-bottom: var(--spacing-sm);
}

.dark-theme .error-header {
  color: #fecaca;
}

.error-message {
  color: #7f1d1d;
  margin-bottom: var(--text-sm);
  font-size: var(--text-base);
}

.dark-theme .error-message {
  color: #fecaca;
}

.error-details {
  margin-top: var(--text-sm);
}

.error-details summary {
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-sm);
}

.error-details pre {
  background: #f9fafb;
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--spacing-xs);
  padding: var(--text-sm);
  font-size: var(--text-sm);
  overflow-x: auto;
  white-space: pre-wrap;
}

.dark-theme .error-details pre {
  background: var(--color-gray-700);
  border-color: var(--color-gray-600);
  color: var(--border-color);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .mermaid-container {
    padding: var(--spacing-sm);
    margin: var(--spacing-sm) 0;
  }

  .mermaid-renderer :deep(svg) {
    font-size: var(--text-2xs) !important;
  }
}

/* Mermaid图表样式优化 */
.mermaid-container :deep(svg) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.mermaid-container :deep(.node rect),
.mermaid-container :deep(.node circle),
.mermaid-container :deep(.node ellipse),
.mermaid-container :deep(.node polygon) {
  stroke-width: auto;
}

.mermaid-container :deep(.edgePath path) {
  stroke-width: auto;
}

.mermaid-container :deep(.edgeLabel) {
  background-color: var(--white-alpha-90);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-xs);
}

.dark-theme .mermaid-container :deep(.edgeLabel) {
  background-color: rgba(31, 41, 55, 0.9);
  color: var(--border-color);
}
</style>
