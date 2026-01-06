<template>
  <transition name="shortcuts-fade">
    <div v-if="visible" class="keyboard-shortcuts-overlay" @click="close">
      <div class="shortcuts-panel" @click.stop>
        <div class="panel-header">
          <h3>⌨️ 键盘快捷键</h3>
          <el-button text @click="close">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div class="shortcuts-list">
          <div class="shortcut-group">
            <h4>编辑操作</h4>
            <div class="shortcut-item">
              <div class="keys">
                <kbd>{{ isMac ? 'Cmd' : 'Ctrl' }}</kbd>
                <span>+</span>
                <kbd>Z</kbd>
              </div>
              <span class="description">撤销上一次操作</span>
            </div>
            <div class="shortcut-item">
              <div class="keys">
                <kbd>{{ isMac ? 'Cmd' : 'Ctrl' }}</kbd>
                <span>+</span>
                <kbd>S</kbd>
              </div>
              <span class="description">保存课程</span>
            </div>
          </div>

          <div class="shortcut-group">
            <h4>AI 助手</h4>
            <div class="shortcut-item">
              <div class="keys">
                <kbd>{{ isMac ? 'Cmd' : 'Ctrl' }}</kbd>
                <span>+</span>
                <kbd>K</kbd>
              </div>
              <span class="description">打开/关闭 AI 助手</span>
            </div>
          </div>

          <div class="shortcut-group">
            <h4>通用操作</h4>
            <div class="shortcut-item">
              <div class="keys">
                <kbd>Esc</kbd>
              </div>
              <span class="description">关闭所有对话框</span>
            </div>
            <div class="shortcut-item">
              <div class="keys">
                <kbd>?</kbd>
              </div>
              <span class="description">显示/隐藏快捷键帮助</span>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <p>提示：按 <kbd>?</kbd> 可随时查看快捷键</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Close } from '@element-plus/icons-vue';

const visible = ref(false);

const isMac = computed(() => {
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
});

function show() {
  visible.value = true;
}

function close() {
  visible.value = false;
}

function toggle() {
  visible.value = !visible.value;
}

function handleKeyDown(event: KeyboardEvent) {
  // 按 ? 键显示/隐藏快捷键帮助
  if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    toggle();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

defineExpose({
  show,
  close,
  toggle
});
</script>

<style scoped lang="scss">
.keyboard-shortcuts-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(var(--spacing-xs));
}

.shortcuts-panel {
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--shadow-heavy);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-2xl) var(--text-3xl);
    border-bottom: var(--border-width-base) solid var(--border-color);

    h3 {
      margin: 0;
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .shortcuts-list {
    padding: var(--text-3xl);

    .shortcut-group {
      margin-bottom: var(--text-3xl);

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 var(--text-sm) 0;
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--text-sm) var(--text-lg);
        background: #f9fafb;
        border-radius: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);

        &:last-child {
          margin-bottom: 0;
        }

        .keys {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);

          kbd {
            display: inline-block;
            padding: var(--spacing-xs) var(--spacing-sm);
            background: white;
            border: var(--border-width-base) solid var(--border-color);
            border-radius: var(--spacing-xs);
            font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--color-gray-700);
            box-shadow: 0 var(--border-width-base) 2px var(--shadow-lighter);
            min-width: var(--spacing-3xl);
            text-align: center;
          }

          span {
            color: var(--text-tertiary);
            font-size: var(--text-sm);
          }
        }

        .description {
          color: var(--color-gray-600);
          font-size: var(--text-base);
        }
      }
    }
  }

  .panel-footer {
    padding: var(--text-lg) var(--text-3xl);
    background: #f9fafb;
    border-top: var(--border-width-base) solid var(--border-color);
    border-radius: 0 0 var(--text-sm) var(--text-sm);

    p {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      text-align: center;

      kbd {
        display: inline-block;
        padding: var(--spacing-sm) 6px;
        background: white;
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-xs);
        font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-gray-700);
      }
    }
  }
}

// 动画
.shortcuts-fade-enter-active,
.shortcuts-fade-leave-active {
  transition: all 0.3s ease;
}

.shortcuts-fade-enter-from,
.shortcuts-fade-leave-to {
  opacity: 0;

  .shortcuts-panel {
    transform: scale(0.95) translateY(-var(--text-2xl));
  }
}

.shortcuts-fade-enter-to,
.shortcuts-fade-leave-from {
  opacity: 1;

  .shortcuts-panel {
    transform: scale(1) translateY(0);
  }
}
</style>

