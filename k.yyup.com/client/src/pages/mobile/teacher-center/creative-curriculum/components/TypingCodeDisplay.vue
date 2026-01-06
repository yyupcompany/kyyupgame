<template>
  <div class="mobile-typing-code-display">
    <!-- 标签页导航 -->
    <div class="code-tabs">
      <van-tabs v-model:active="activeTab" @change="handleTabChange" sticky>
        <van-tab title="HTML" name="html">
          <template #title>
            <van-icon name="description" />
            HTML
          </template>
        </van-tab>
        <van-tab title="CSS" name="css">
          <template #title>
            <van-icon name="brush-o" />
            CSS
          </template>
        </van-tab>
        <van-tab title="JavaScript" name="js">
          <template #title>
            <van-icon name="cpu" />
            JavaScript
          </template>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <van-tag :type="getTabType(activeTab)" size="medium">
          {{ activeTab.toUpperCase() }}
        </van-tag>
        <span class="char-count">{{ displayCode.length }} / {{ currentCode.length }} 字符</span>
      </div>
      <div class="toolbar-right">
        <van-button
          size="mini"
          type="default"
          @click="toggleTyping"
          :icon="isTyping ? 'pause' : 'play'"
        >
          {{ isTyping ? '暂停' : '播放' }}
        </van-button>
        <van-button
          size="mini"
          type="default"
          @click="copyCode"
          icon="description"
        >
          复制
        </van-button>
        <van-button
          size="mini"
          type="default"
          @click="toggleFullscreen"
          icon="expand"
        >
          全屏
        </van-button>
      </div>
    </div>

    <!-- 代码显示区域 -->
    <div class="code-container" ref="codeContainer">
      <div class="code-header">
        <div class="language-indicator">
          <van-icon :name="getTabIcon(activeTab)" size="16" />
          <span>{{ getTabTitle(activeTab) }}</span>
        </div>
        <div class="typing-status">
          <van-loading v-if="isTyping && isAnimating" size="16px" />
          <van-icon v-else-if="isTyping" name="success" color="#52c41a" size="16" />
          <span v-if="isTyping" class="status-text">打字中...</span>
        </div>
      </div>

      <!-- 代码内容 -->
      <div class="code-content" ref="codeContent">
        <transition name="code-fade" mode="out-in">
          <pre
            :key="activeTab"
            class="code-text"
            v-html="highlightedCode"
          ></pre>
        </transition>

        <!-- 打字光标 -->
        <div
          v-if="isTyping && isAnimating"
          class="typing-cursor"
          :style="{ left: cursorPosition.left + 'px', top: cursorPosition.top + 'px' }"
        >|</div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-info">
        <span class="progress-text">{{ progress }}%</span>
        <span class="speed-control">
          <van-slider
            v-model="typingSpeed"
            :min="1"
            :max="50"
            :step="1"
            @change="updateSpeed"
            class="speed-slider"
          />
          <span class="speed-value">{{ typingSpeed }}ms</span>
        </span>
      </div>
      <van-progress
        :percentage="progress"
        :color="progressColor"
        :stroke-width="6"
        track-color="#f0f0f0"
        :show-pivot="false"
      />
    </div>

    <!-- 音效控制 -->
    <div class="sound-control">
      <van-switch
        v-model="soundEnabled"
        size="small"
        @change="toggleSound"
      />
      <span class="sound-label">音效</span>
    </div>

    <!-- 全屏模式 -->
    <van-popup
      v-model:show="isFullscreen"
      position="bottom"
      :style="{ height: '100vh', borderRadius: '0' }"
      closeable
      close-icon="cross"
    >
      <div class="fullscreen-code">
        <!-- 复制工具栏内容到全屏模式 -->
        <div class="code-tabs">
          <van-tabs v-model:active="activeTab" @change="handleTabChange">
            <van-tab title="HTML" name="html" />
            <van-tab title="CSS" name="css" />
            <van-tab title="JavaScript" name="js" />
          </van-tabs>
        </div>

        <div class="fullscreen-toolbar">
          <van-button-group>
            <van-button
              size="small"
              @click="toggleTyping"
              :icon="isTyping ? 'pause' : 'play'"
            >
              {{ isTyping ? '暂停' : '播放' }}
            </van-button>
            <van-button
              size="small"
              @click="copyCode"
              icon="description"
            >
              复制
            </van-button>
            <van-button
              size="small"
              @click="isFullscreen = false"
              icon="cross"
            >
              退出全屏
            </van-button>
          </van-button-group>
        </div>

        <div class="fullscreen-code-content">
          <pre
            class="fullscreen-code-text"
            v-html="highlightedCode"
          ></pre>
          <div
            v-if="isTyping && isAnimating"
            class="fullscreen-cursor"
          >|</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'

interface Props {
  htmlCode?: string
  cssCode?: string
  jsCode?: string
  isTyping?: boolean
  typingSpeed?: number
  enableSound?: boolean
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  htmlCode: '',
  cssCode: '',
  jsCode: '',
  isTyping: false,
  typingSpeed: 10,
  enableSound: true,
  autoStart: false
})

const emit = defineEmits<{
  'complete': []
  'tab-change': [tab: 'html' | 'css' | 'js']
  'typing-start': []
  'typing-pause': []
}>()

// 响应式数据
const activeTab = ref<'html' | 'css' | 'js'>('html')
const displayCode = ref('')
const currentIndex = ref(0)
const isAnimating = ref(false)
const typingSpeed = ref(props.typingSpeed)
const soundEnabled = ref(props.enableSound)
const isFullscreen = ref(false)
const cursorPosition = ref({ left: 0, top: 0 })

// DOM引用
const codeContainer = ref<HTMLElement>()
const codeContent = ref<HTMLElement>()

// 获取当前标签的代码
const currentCode = computed(() => {
  switch (activeTab.value) {
    case 'html':
      return props.htmlCode || ''
    case 'css':
      return props.cssCode || ''
    case 'js':
      return props.jsCode || ''
    default:
      return ''
  }
})

// 计算进度
const progress = computed(() => {
  if (!currentCode.value) return 0
  return Math.round((currentIndex.value / currentCode.value.length) * 100)
})

// 进度颜色
const progressColor = computed(() => {
  if (progress.value < 30) return '#ff4d4f'
  if (progress.value < 70) return '#faad14'
  return '#52c41a'
})

// 语法高亮
const highlightedCode = computed(() => {
  const code = displayCode.value
  if (!code) return ''

  let highlighted = code

  // HTML 高亮
  if (activeTab.value === 'html') {
    highlighted = highlighted
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)/g, '$1<span class="tag">$2</span>')
      .replace(/([a-zA-Z-]+)=/g, '<span class="attr">$1</span>=')
      .replace(/"([^"]*)"/g, '"<span class="string">$1</span>"')
  }
  // CSS 高亮
  else if (activeTab.value === 'css') {
    highlighted = highlighted
      .replace(/([a-zA-Z-]+):/g, '<span class="property">$1</span>:')
      .replace(/#([0-9a-fA-F]{3,6})/g, '<span class="color">#$1</span>')
      .replace(/(\d+)(px|em|rem|%|vh|vw)/g, '<span class="number">$1</span><span class="unit">$2</span>')
      .replace(/\{/g, '<span class="bracket">{</span>')
      .replace(/\}/g, '<span class="bracket">}</span>')
  }
  // JavaScript 高亮
  else if (activeTab.value === 'js') {
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'new', 'this']
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g')
      highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>')
    })
    highlighted = highlighted
      .replace(/"([^"]*)"/g, '"<span class="string">$1</span>"')
      .replace(/'([^']*)'/g, '\'<span class="string">$1</span>\'')
      .replace(/\/\/(.*)$/gm, '<span class="comment">//$1</span>')
  }

  return highlighted
})

// 工具函数
function getTabIcon(tab: string): string {
  const icons = {
    html: 'description',
    css: 'brush-o',
    js: 'cpu'
  }
  return icons[tab as keyof typeof icons] || 'description'
}

function getTabTitle(tab: string): string {
  const titles = {
    html: 'HTML',
    css: 'CSS',
    js: 'JavaScript'
  }
  return titles[tab as keyof typeof titles] || 'Code'
}

function getTabType(tab: string): string {
  const types = {
    html: 'primary',
    css: 'success',
    js: 'warning'
  }
  return types[tab as keyof typeof types] || 'default'
}

// 打字效果核心函数
async function startTyping() {
  if (isAnimating.value) return

  isAnimating.value = true
  displayCode.value = ''
  currentIndex.value = 0

  const code = currentCode.value
  let soundCounter = 0

  while (currentIndex.value < code.length) {
    displayCode.value += code[currentIndex.value]
    currentIndex.value++

    // 播放打字音效
    if (soundEnabled.value && soundCounter % 3 === 0) {
      playTypingSound()
    }
    soundCounter++

    // 更新光标位置
    await updateCursorPosition()

    // 等待指定时间
    await new Promise(resolve => setTimeout(resolve, typingSpeed.value))
  }

  isAnimating.value = false

  // 播放完成音效
  if (soundEnabled.value) {
    playCompleteSound()
  }

  emit('complete')
  showSuccessToast('打字完成')
}

// 暂停打字
function pauseTyping() {
  isAnimating.value = false
  showToast('打字已暂停')
}

// 切换打字状态
function toggleTyping() {
  if (isAnimating.value) {
    pauseTyping()
    emit('typing-pause')
  } else {
    if (progress.value >= 100) {
      // 重新开始
      displayCode.value = ''
      currentIndex.value = 0
    }
    startTyping()
    emit('typing-start')
  }
}

// 更新速度
function updateSpeed(newSpeed: number) {
  typingSpeed.value = newSpeed
  showToast(`打字速度: ${newSpeed}ms`)
}

// 切换音效
function toggleSound(enabled: boolean) {
  soundEnabled.value = enabled
  showToast(enabled ? '音效已开启' : '音效已关闭')
}

// 切换全屏
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

// 复制代码
async function copyCode() {
  try {
    const code = currentCode.value
    await navigator.clipboard.writeText(code)
    showSuccessToast('代码已复制到剪贴板')
  } catch (error) {
    showFailToast('复制失败')
  }
}

// 处理标签切换
function handleTabChange(tabName: string) {
  activeTab.value = tabName as 'html' | 'css' | 'js'
  emit('tab-change', activeTab.value)

  if (props.isTyping && !isAnimating.value) {
    startTyping()
  } else {
    displayCode.value = currentCode.value
  }
}

// 更新光标位置
async function updateCursorPosition() {
  await nextTick()
  if (codeContent.value) {
    const codeText = codeContent.value.querySelector('.code-text')
    if (codeText) {
      // 简单的光标位置计算
      const rect = codeText.getBoundingClientRect()
      cursorPosition.value = {
        left: Math.min(rect.width - 20, rect.width - 50), // 距离右边50px
        top: rect.height - 30 // 底部
      }
    }
  }
}

// 音效函数（模拟）
function playTypingSound() {
  // 这里可以集成实际的音效库
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+0fPTgjMGHm7A7+OZURE')
    audio.volume = 0.1
    audio.play().catch(() => {
      // 忽略音频播放错误
    })
  } catch (error) {
    // 忽略音效错误
  }
}

function playCompleteSound() {
  // 完成音效
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+0fPTgjMGHm7A7+OZURE')
    audio.volume = 0.2
    audio.play().catch(() => {
      // 忽略音频播放错误
    })
  } catch (error) {
    // 忽略音效错误
  }
}

// 监听代码变化
watch(
  () => [props.htmlCode, props.cssCode, props.jsCode],
  () => {
    if (props.isTyping && !isAnimating.value) {
      startTyping()
    } else if (!props.isTyping) {
      displayCode.value = currentCode.value
    }
  },
  { immediate: true, deep: true }
)

// 监听打字状态变化
watch(
  () => props.isTyping,
  (newVal) => {
    if (newVal && !isAnimating.value) {
      startTyping()
    } else if (!newVal) {
      displayCode.value = currentCode.value
    }
  },
  { immediate: true }
)

// 组件挂载
onMounted(() => {
  if (props.autoStart && props.isTyping) {
    startTyping()
  }
})

// 暴露方法给父组件
defineExpose({
  startTyping,
  pauseTyping,
  toggleTyping,
  copyCode,
  isTyping: computed(() => isAnimating.value),
  progress
})
</script>

<style scoped lang="scss">
.mobile-typing-code-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--van-background-2);
  border-radius: var(--van-radius-lg);
  overflow: hidden;

  .code-tabs {
    background: var(--van-background-2);
    border-bottom: 1px solid var(--van-border-color);

    :deep(.van-tabs) {
      .van-tab__text {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
      }
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-sm) var(--van-padding-md);
    background: var(--van-background-3);
    border-bottom: 1px solid var(--van-border-color);

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);

      .char-count {
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-3);
      }
    }

    .toolbar-right {
      display: flex;
      gap: var(--van-padding-xs);
    }
  }

  .code-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--van-padding-sm) var(--van-padding-md);
      background: #1e1e1e;
      border-bottom: 1px solid #3e3e42;

      .language-indicator {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        color: #858585;
        font-size: var(--van-font-size-sm);
      }

      .typing-status {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);

        .status-text {
          font-size: var(--van-font-size-xs);
          color: #52c41a;
        }
      }
    }

    .code-content {
      flex: 1;
      position: relative;
      background: #1e1e1e;
      overflow: auto;
      padding: var(--van-padding-md);

      .code-text {
        margin: 0;
        font-family: 'Monaco', 'Courier New', 'Menlo', monospace;
        font-size: var(--van-font-size-sm);
        line-height: 1.6;
        color: #d4d4d4;
        white-space: pre-wrap;
        word-break: break-all;
        min-height: 100px;
      }

      .typing-cursor {
        position: absolute;
        color: var(--van-primary-color);
        font-weight: bold;
        animation: blink 0.7s infinite;
        font-size: var(--text-base);
        z-index: 10;
      }
    }
  }

  .progress-section {
    padding: var(--van-padding-md);
    background: var(--van-background-3);
    border-top: 1px solid var(--van-border-color);

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-sm);

      .progress-text {
        font-size: var(--van-font-size-sm);
        font-weight: 600;
        color: var(--van-text-color-1);
        min-width: 40px;
      }

      .speed-control {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        flex: 1;
        margin-left: var(--van-padding-md);

        .speed-slider {
          flex: 1;
        }

        .speed-value {
          font-size: var(--van-font-size-xs);
          color: var(--van-text-color-3);
          min-width: 40px;
          text-align: right;
        }
      }
    }
  }

  .sound-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--van-padding-xs);
    padding: var(--van-padding-sm);
    background: var(--van-background-3);
    border-top: 1px solid var(--van-border-color);

    .sound-label {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
    }
  }
}

// 全屏模式
.fullscreen-code {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;

  .fullscreen-toolbar {
    padding: var(--van-padding-md);
    background: #252526;
    border-bottom: 1px solid #3e3e42;
    display: flex;
    justify-content: center;

    :deep(.van-button-group) {
      .van-button {
        background: #3c3c3c;
        border-color: #3c3c3c;
        color: #cccccc;
      }
    }
  }

  .fullscreen-code-content {
    flex: 1;
    position: relative;
    overflow: auto;
    padding: var(--van-padding-lg);

    .fullscreen-code-text {
      margin: 0;
      font-family: 'Monaco', 'Courier New', 'Menlo', monospace;
      font-size: var(--van-font-size-md);
      line-height: 1.6;
      color: #d4d4d4;
      white-space: pre-wrap;
    }

    .fullscreen-cursor {
      position: fixed;
      color: var(--van-primary-color);
      font-weight: bold;
      animation: blink 0.7s infinite;
      font-size: var(--text-lg);
      bottom: 20px;
      right: 20px;
    }
  }
}

// 代码高亮样式
:deep(.tag) { color: #569cd6; }
:deep(.attr) { color: #9cdcfe; }
:deep(.string) { color: #ce9178; }
:deep(.property) { color: #9cdcfe; }
:deep(.color) { color: #ce9178; }
:deep(.number) { color: #b5cea8; }
:deep(.unit) { color: #b5cea8; }
:deep(.bracket) { color: #ffd700; }
:deep(.keyword) { color: #c586c0; }
:deep(.comment) { color: #6a9955; font-style: italic; }

// 动画
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.code-fade-enter-active,
.code-fade-leave-active {
  transition: all 0.3s ease;
}

.code-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.code-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .mobile-typing-code-display {
    .toolbar {
      padding: var(--van-padding-xs) var(--van-padding-sm);

      .toolbar-right {
        .van-button {
          padding: var(--van-padding-xs);
          font-size: var(--van-font-size-xs);
        }
      }
    }

    .code-content {
      .code-text {
        font-size: var(--van-font-size-xs);
      }
    }

    .progress-section {
      padding: var(--van-padding-sm);

      .progress-info {
        .speed-control {
          .speed-label {
            display: none; // 小屏幕隐藏速度标签
          }
        }
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-typing-code-display {
    background: var(--van-background-1);
  }
}
</style>