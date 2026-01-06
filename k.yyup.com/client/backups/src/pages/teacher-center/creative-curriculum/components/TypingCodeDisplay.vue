<template>
  <div class="typing-code-display">
    <!-- 标签页 -->
    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab"
        :class="['tab', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab === 'html' ? 'HTML' : tab === 'css' ? 'CSS' : 'JavaScript' }}
      </div>
    </div>

    <!-- 代码显示区域 -->
    <div class="code-container">
      <div class="code-header">
        <span class="language" key="language">{{ activeTab.toUpperCase() }}</span>
        <div class="actions">
          <el-button
            type="primary"
            text
            size="small"
            @click="copyCode"
          >
            <el-icon><DocumentCopy /></el-icon>
            复制
          </el-button>
        </div>
      </div>

      <transition name="code-fade" mode="out-in">
        <pre class="code-content" :key="activeTab"><code v-html="highlightedCode"></code></pre>
      </transition>

      <!-- 打字光标 -->
      <div v-if="isTyping && isAnimating" class="typing-cursor">|</div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { DocumentCopy } from '@element-plus/icons-vue';
import { soundEffects } from '@/utils/soundEffects';

interface Props {
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  isTyping?: boolean;
  typingSpeed?: number; // 毫秒
  enableSound?: boolean; // 是否启用音效
}

const props = withDefaults(defineProps<Props>(), {
  htmlCode: '',
  cssCode: '',
  jsCode: '',
  isTyping: false,
  typingSpeed: 10,
  enableSound: true
});

const emit = defineEmits<{
  complete: [];
}>();

const activeTab = ref<'html' | 'css' | 'js'>('html');
const displayCode = ref('');
const currentIndex = ref(0);
const isAnimating = ref(false);

const tabs = ['html', 'css', 'js'] as const;

// 获取当前标签的代码
const currentCode = computed(() => {
  switch (activeTab.value) {
    case 'html':
      return props.htmlCode;
    case 'css':
      return props.cssCode;
    case 'js':
      return props.jsCode;
    default:
      return '';
  }
});

// 计算进度
const progress = computed(() => {
  if (!currentCode.value) return 0;
  return Math.round((currentIndex.value / currentCode.value.length) * 100);
});

// 简单的语法高亮
const highlightedCode = computed(() => {
  const code = displayCode.value;
  if (!code) return '';

  let highlighted = code;

  // HTML 标签高亮
  if (activeTab.value === 'html') {
    highlighted = highlighted
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)/g, '$1<span class="tag">$2</span>')
      .replace(/([a-zA-Z-]+)=/g, '<span class="attr">$1</span>=')
      .replace(/"([^"]*)"/g, '"<span class="string">$1</span>"');
  }

  // CSS 属性高亮
  else if (activeTab.value === 'css') {
    highlighted = highlighted
      .replace(/([a-zA-Z-]+):/g, '<span class="property">$1</span>:')
      .replace(/#([0-9a-fA-F]{3,6})/g, '<span class="color">#$1</span>')
      .replace(/(\d+)(px|em|rem|%|vh|vw)/g, '<span class="number">$1</span><span class="unit">$2</span>')
      .replace(/\{/g, '<span class="bracket">{</span>')
      .replace(/\}/g, '<span class="bracket">}</span>');
  }

  // JavaScript 关键字高亮
  else if (activeTab.value === 'js') {
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'new', 'this'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
    });
    highlighted = highlighted
      .replace(/"([^"]*)"/g, '"<span class="string">$1</span>"')
      .replace(/'([^']*)'/g, '\'<span class="string">$1</span>\'')
      .replace(/\/\/(.*)$/gm, '<span class="comment">//$1</span>');
  }

  return highlighted;
});

/**
 * 启动打字效果
 */
async function startTyping() {
  if (isAnimating.value) return;

  isAnimating.value = true;
  displayCode.value = '';
  currentIndex.value = 0;

  const code = currentCode.value;
  let soundCounter = 0;

  while (currentIndex.value < code.length) {
    displayCode.value += code[currentIndex.value];
    currentIndex.value++;

    // 每隔几个字符播放一次打字音效（避免太频繁）
    if (props.enableSound && soundCounter % 3 === 0) {
      soundEffects.playTypingSound();
    }
    soundCounter++;

    // 等待指定的时间
    await new Promise(resolve => setTimeout(resolve, props.typingSpeed));
  }

  isAnimating.value = false;

  // 播放完成音效
  if (props.enableSound) {
    soundEffects.playCompleteSound();
  }

  // 发出完成事件
  emit('complete');
}

/**
 * 复制代码
 */
function copyCode() {
  const code = currentCode.value;
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success('代码已复制到剪贴板');
  });
}

// 监听代码变化
watch(
  () => props.htmlCode + props.cssCode + props.jsCode,
  () => {
    if (props.isTyping) {
      startTyping();
    } else {
      displayCode.value = currentCode.value;
    }
  },
  { immediate: true }
);

// 监听标签切换
watch(activeTab, () => {
  if (props.isTyping && !isAnimating.value) {
    startTyping();
  } else {
    displayCode.value = currentCode.value;
  }
});

// 初始化
watch(
  () => props.isTyping,
  (newVal) => {
    if (newVal) {
      startTyping();
    } else {
      displayCode.value = currentCode.value;
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.typing-code-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-code-editor);
  border-radius: var(--spacing-sm);
  overflow: hidden;

  .tabs {
    display: flex;
    gap: 0;
    background: var(--bg-code-panel);
    border-bottom: var(--border-width-base) solid var(--border-code-editor);
    padding: 0;

    .tab {
      padding: var(--spacing-2xl) var(--text-lg);
      cursor: pointer;
      color: var(--text-code-muted);
      font-size: var(--text-sm);
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        color: var(--text-code-default);
        background: var(--bg-code-hover);
      }

      &.active {
        color: var(--code-keyword);
        border-bottom-color: var(--code-keyword);
        background: var(--bg-code-editor);
      }
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
      padding: var(--spacing-sm) var(--text-lg);
      background: var(--bg-code-panel);
      border-bottom: var(--border-width-base) solid var(--border-code-editor);

      .language {
        font-size: var(--text-sm);
        color: var(--text-code-muted);
        font-weight: 600;
      }

      .actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .code-content {
      flex: 1;
      overflow: auto;
      padding: var(--text-lg);
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: var(--text-sm);
      line-height: 1.6;
      color: var(--text-code-default);
      background: var(--bg-code-editor);
      white-space: pre-wrap;
      word-wrap: break-word;

      code {
        font-family: 'Courier New', monospace;
      }
    }

    .typing-cursor {
      position: absolute;
      bottom: var(--text-lg);
      right: var(--text-lg);
      color: var(--code-keyword);
      font-weight: bold;
      animation: blink 0.7s infinite;
    }
  }

  .progress-bar {
    height: 3px;
    background: var(--border-code-editor);
    overflow: hidden;

    .progress {
      height: 100%;
      background: linear-gradient(90deg, var(--code-keyword), var(--code-function));
      transition: width 0.1s linear;
    }
  }
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

// 代码高亮样式
:deep(code) {
  .tag {
    color: var(--code-tag);
  }

  .attr {
    color: var(--code-attribute);
  }

  .string {
    color: var(--code-string);
  }

  .property {
    color: var(--code-attribute);
  }

  .color {
    color: var(--code-string);
  }

  .number {
    color: var(--code-number);
  }

  .unit {
    color: var(--code-number);
  }

  .bracket {
    color: var(--code-bracket);
  }

  .keyword {
    color: var(--code-keyword);
  }

  .comment {
    color: var(--code-comment);
    font-style: italic;
  }
}

// 标签页切换动画
.code-fade-enter-active,
.code-fade-leave-active {
  transition: all 0.3s ease;
}

.code-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.code-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>

