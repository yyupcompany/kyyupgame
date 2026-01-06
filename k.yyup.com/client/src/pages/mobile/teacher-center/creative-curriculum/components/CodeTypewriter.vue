<template>
  <div class="mobile-code-typewriter">
    <!-- 代码语言标签和工具栏 -->
    <div class="code-header">
      <div class="header-left">
        <van-tag type="primary" size="small">{{ language }}</van-tag>
        <span class="char-count">{{ displayedCode.length }} / {{ fullCode.length }} 字符</span>
      </div>
      <div class="header-actions">
        <van-button
          size="mini"
          type="default"
          @click="togglePlay"
          :icon="isTyping ? 'pause' : 'play'"
        >
          {{ isTyping ? '暂停' : '播放' }}
        </van-button>
        <van-button
          size="mini"
          type="default"
          @click="resetTyping"
          icon="replay"
        >
          重置
        </van-button>
      </div>
    </div>

    <!-- 代码显示区域 -->
    <div class="code-container" ref="codeContainer">
      <pre class="code-content"><code>{{ displayedCode }}<span v-if="isTyping" class="cursor">|</span></code></pre>
    </div>

    <!-- 进度条和控制 -->
    <div class="code-progress">
      <div class="progress-info">
        <span class="progress-text">{{ Math.round((displayedCode.length / fullCode.length) * 100) }}%</span>
        <span class="speed-control">
          <span class="speed-label">速度:</span>
          <van-slider
            v-model="currentSpeed"
            :min="1"
            :max="50"
            :step="1"
            @change="updateSpeed"
            class="speed-slider"
          />
          <span class="speed-value">{{ currentSpeed }}ms</span>
        </span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="code-actions">
      <van-button-group>
        <van-button size="small" @click="copyCode" icon="description">复制</van-button>
        <van-button size="small" @click="fullscreen" icon="expand">全屏</van-button>
        <van-button size="small" @click="$emit('complete')" icon="success">完成</van-button>
      </van-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { useMobileLayout } from '@/composables/useMobileLayout'

interface Props {
  code: string
  language?: string
  speed?: number // 打字速度 (ms)
  autoStart?: boolean
  showControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'code',
  speed: 10,
  autoStart: true,
  showControls: true
})

const emit = defineEmits<{
  'start': []
  'pause': []
  'complete': []
  'reset': []
  'progress': [percentage: number]
}>()

const { toggleFullscreen } = useMobileLayout()

// 响应式数据
const displayedCode = ref('')
const fullCode = ref('')
const isTyping = ref(false)
const isPaused = ref(false)
const currentSpeed = ref(props.speed)
const currentIndex = ref(0)
let typingTimer: NodeJS.Timeout | null = null

// 计算属性
const progressPercentage = computed(() => {
  if (!fullCode.value.length) return 0
  return Math.round((displayedCode.value.length / fullCode.value.length) * 100)
})

// DOM引用
const codeContainer = ref<HTMLElement>()

// 打字机效果核心函数
async function typeNextChar() {
  if (currentIndex.value >= fullCode.value.length) {
    // 打字完成
    isTyping.value = false
    currentIndex.value = 0
    emit('complete')
    showToast('打字完成')
    return
  }

  if (!isPaused.value) {
    displayedCode.value += fullCode.value[currentIndex.value]
    currentIndex.value++

    // 滚动到底部
    await nextTick()
    scrollToBottom()

    // 发送进度事件
    emit('progress', progressPercentage.value)
  }

  // 继续下一个字符
  typingTimer = setTimeout(typeNextChar, currentSpeed.value)
}

// 开始打字
function startTyping() {
  if (isTyping.value && !isPaused.value) return

  if (!fullCode.value) {
    showToast('没有代码内容')
    return
  }

  if (isPaused.value) {
    // 从暂停恢复
    isPaused.value = false
  } else {
    // 重新开始
    resetTyping()
  }

  isTyping.value = true
  emit('start')
  showToast('开始打字效果')

  typingTimer = setTimeout(typeNextChar, currentSpeed.value)
}

// 暂停打字
function pauseTyping() {
  isPaused.value = true
  emit('pause')
  showToast('已暂停')
}

// 切换播放/暂停
function togglePlay() {
  if (isTyping.value && !isPaused.value) {
    pauseTyping()
  } else {
    startTyping()
  }
}

// 重置打字
function resetTyping() {
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }

  displayedCode.value = ''
  currentIndex.value = 0
  isTyping.value = false
  isPaused.value = false

  emit('reset')
  showToast('已重置')
}

// 更新速度
function updateSpeed(newSpeed: number) {
  currentSpeed.value = newSpeed
  showToast(`速度调整为 ${newSpeed}ms`)
}

// 滚动到底部
function scrollToBottom() {
  if (codeContainer.value) {
    codeContainer.value.scrollTop = codeContainer.value.scrollHeight
  }
}

// 复制代码
async function copyCode() {
  try {
    await navigator.clipboard.writeText(displayedCode.value)
    showSuccessToast('代码已复制到剪贴板')
  } catch (error) {
    showFailToast('复制失败')
  }
}

// 全屏显示
function fullscreen() {
  if (codeContainer.value) {
    toggleFullscreen(codeContainer.value)
  }
}

// 监听代码变化
watch(() => props.code, (newCode) => {
  if (newCode && newCode !== fullCode.value) {
    fullCode.value = newCode
    if (props.autoStart && !isTyping.value) {
      startTyping()
    }
  }
}, { immediate: true })

// 监听速度变化
watch(() => props.speed, (newSpeed) => {
  currentSpeed.value = newSpeed
})

// 组件挂载时的初始化
onMounted(() => {
  fullCode.value = props.code
  if (props.autoStart && props.code) {
    startTyping()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
})

// 暴露方法给父组件
defineExpose({
  startTyping,
  pauseTyping,
  resetTyping,
  togglePlay,
  isTyping: computed(() => isTyping.value),
  progress: progressPercentage
})
</script>

<style scoped lang="scss">
.mobile-code-typewriter {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--van-background-2);
  border-radius: var(--van-radius-md);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-md);
    background: var(--van-background-3);
    border-bottom: 1px solid var(--van-border-color);

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);

      .char-count {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-3);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--van-padding-xs);
    }
  }

  .code-container {
    flex: 1;
    overflow: auto;
    padding: var(--van-padding-md);
    background: #1e1e1e;
    border-radius: var(--van-border-radius);

    .code-content {
      margin: 0;
      font-family: 'Monaco', 'Courier New', 'Menlo', monospace;
      font-size: var(--van-font-size-md);
      line-height: 1.6;
      color: #d4d4d4;
      white-space: pre-wrap;
      word-break: break-all;
      min-height: 200px;

      .cursor {
        animation: blink 1s infinite;
        background: var(--van-primary-color);
        color: white;
        padding: 0 2px;
        border-radius: 2px;
      }
    }
  }

  .code-progress {
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
        color: var(--van-text-color-2);
        font-weight: 600;
        min-width: 40px;
      }

      .speed-control {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        flex: 1;
        margin-left: var(--van-padding-md);

        .speed-label {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          white-space: nowrap;
        }

        .speed-slider {
          flex: 1;
          margin: 0 var(--van-padding-sm);
        }

        .speed-value {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          min-width: 40px;
          text-align: right;
        }
      }
    }

    .progress-bar {
      height: 4px;
      background: var(--van-border-color);
      border-radius: 2px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--van-primary-color), var(--van-primary-color-light));
        transition: width 0.1s ease;
        border-radius: 2px;
      }
    }
  }

  .code-actions {
    padding: var(--van-padding-md);
    background: var(--van-background-3);
    border-top: 1px solid var(--van-border-color);
    display: flex;
    justify-content: center;

    :deep(.van-button-group) {
      width: 100%;

      .van-button {
        flex: 1;
      }
    }
  }
}

// 全屏模式样式
:deep(.fullscreen-mode) {
  .mobile-code-typewriter {
    height: 100vh;
    border-radius: 0;
  }
}

// 光标闪烁动画
@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .mobile-code-typewriter {
    .code-header {
      .header-left {
        .char-count {
          display: none; // 小屏幕隐藏字符计数
        }
      }

      .header-actions {
        .van-button {
          padding: var(--van-padding-xs) var(--van-padding-sm);
        }
      }
    }

    .code-container {
      .code-content {
        font-size: var(--van-font-size-sm);
      }
    }

    .code-progress {
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
</style>