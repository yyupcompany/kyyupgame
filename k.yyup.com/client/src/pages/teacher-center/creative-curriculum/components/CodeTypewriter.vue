<template>
  <div class="code-typewriter">
    <!-- 代码语言标签 -->
    <div class="code-header">
      <span class="language-badge">{{ language }}</span>
      <span class="char-count">{{ displayedCode.length }} / {{ fullCode.length }} 字符</span>
    </div>

    <!-- 代码显示区域 -->
    <div class="code-container">
      <pre><code class="language-code">{{ displayedCode }}<span v-if="isTyping" class="cursor">|</span></code></pre>
    </div>

    <!-- 进度条 -->
    <div class="code-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (displayedCode.length / fullCode.length) * 100 + '%' }"></div>
      </div>
      <span class="progress-text">{{ Math.round((displayedCode.length / fullCode.length) * 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  code: string;
  language?: string;
  speed?: number; // 打字速度 (ms)
}

const props = withDefaults(defineProps<Props>(), {
  language: 'code',
  speed: 5
});

const displayedCode = ref('');
const fullCode = ref('');
const isTyping = ref(false);

// 打字机效果
async function typeCode(code: string) {
  isTyping.value = true;
  fullCode.value = code;
  displayedCode.value = '';

  for (let i = 0; i < code.length; i++) {
    displayedCode.value += code[i];
    await new Promise(resolve => setTimeout(resolve, props.speed));
  }

  isTyping.value = false;
}

// 监听代码变化
watch(() => props.code, (newCode) => {
  if (newCode && newCode !== fullCode.value) {
    typeCode(newCode);
  }
}, { immediate: true });
</script>

<style scoped lang="scss">
.code-typewriter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background: #1e1e1e;
  border-radius: var(--spacing-xs);
  overflow: hidden;

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: #252526;
    border-bottom: 1px solid #3e3e42;

    .language-badge {
      background: var(--primary-color);
      color: white;
      padding: var(--spacing-xs) 12px;
      border-radius: 4px;
      font-size: var(--text-xs);
      font-weight: 500;
    }

    .char-count {
      color: #858585;
      font-size: var(--text-xs);
    }
  }

  .code-container {
    flex: 1;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 400px;
    padding: var(--spacing-md);

    pre {
      margin: 0;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: var(--text-sm);
      line-height: 1.6;
      color: #d4d4d4;

      code {
        display: block;
        white-space: pre-wrap;
        word-break: break-all;

        .cursor {
          animation: blink 1s infinite;
          background: var(--primary-color);
          color: white;
          padding: 0 2px;
        }
      }
    }
  }

  .code-progress {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: #252526;
    border-top: 1px solid #3e3e42;

    .progress-bar {
      flex: 1;
      height: 4px;
      background: #3e3e42;
      border-radius: 2px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-color), #66b1ff);
        transition: width 0.1s ease;
      }
    }

    .progress-text {
      color: #858585;
      font-size: var(--text-xs);
      min-width: 40px;
      text-align: right;
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
</style>

