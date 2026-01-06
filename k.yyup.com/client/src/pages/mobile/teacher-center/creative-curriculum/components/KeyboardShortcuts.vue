<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '80vh', borderRadius: '20px 20px 0 0' }"
    :close-on-click-overlay="true"
    @close="handleClose"
    class="keyboard-shortcuts-popup"
  >
    <!-- 弹窗头部 -->
    <div class="shortcuts-header">
      <div class="header-title">
        <van-icon name="keyboard-o" size="24" />
        <span>快捷键指南</span>
      </div>
      <van-button
        type="primary"
        size="small"
        plain
        @click="close"
        icon="cross"
      >
        关闭
      </van-button>
    </div>

    <!-- 平台切换 -->
    <div class="platform-selector">
      <van-tabs v-model:active="activePlatform" @change="handlePlatformChange">
        <van-tab title="Mac" name="mac">
          <template #title>
            <van-icon name="apple-o" />
            Mac
          </template>
        </van-tab>
        <van-tab title="Windows" name="windows">
          <template #title>
            <van-icon name="desktop-o" />
            Windows
          </template>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 快捷键列表 -->
    <div class="shortcuts-content">
      <van-cell-group inset v-for="group in filteredShortcuts" :key="group.title">
        <van-cell :title="group.title" class="group-title" />
        <van-cell
          v-for="shortcut in group.shortcuts"
          :key="shortcut.key"
          :title="shortcut.description"
          is-link
          @click="handleShortcutClick(shortcut)"
        >
          <template #right-icon>
            <div class="shortcut-keys">
              <span
                v-for="(key, index) in shortcut.keys"
                :key="index"
                class="key-chip"
              >
                {{ key }}
                <span v-if="index < shortcut.keys.length - 1" class="key-separator">+</span>
              </span>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 搜索结果提示 -->
      <div v-if="searchQuery && searchResults.length === 0" class="no-results">
        <van-empty
          image="search"
          description="未找到匹配的快捷键"
          image-size="80"
        />
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="shortcuts-footer">
      <van-notice-bar
        left-icon="info-o"
        background="#f0f9ff"
        color="#1989fa"
        :text="footerTip"
      />
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <van-search
        v-model="searchQuery"
        placeholder="搜索快捷键..."
        @search="handleSearch"
        @clear="handleSearchClear"
        show-action
        shape="round"
        background="transparent"
      >
        <template #action>
          <van-button size="small" type="primary" @click="resetShortcuts">
            重置
          </van-button>
        </template>
      </van-search>
    </div>

    <!-- 快捷键测试模式 -->
    <div v-if="testMode" class="test-mode-bar">
      <van-notice-bar
        left-icon="play"
        background="#f6ffed"
        color="#52c41a"
        text="测试模式：按下快捷键进行测试"
      />
    </div>
  </van-popup>

  <!-- 悬浮按钮 -->
  <van-floating-bubble
    v-if="showFloatingButton"
    axis="xy"
    icon="keyboard-o"
    @click="toggle"
    style="--initial-left: 20px; --initial-top: 200px;"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { showToast, showSuccessToast } from 'vant'

interface Shortcut {
  key: string
  keys: string[]
  description: string
  action: string
  platforms?: ('mac' | 'windows')[]
}

interface ShortcutGroup {
  title: string
  shortcuts: Shortcut[]
}

interface Props {
  showFloatingButton?: boolean
  testMode?: boolean
  customShortcuts?: ShortcutGroup[]
}

const props = withDefaults(defineProps<Props>(), {
  showFloatingButton: false,
  testMode: false,
  customShortcuts: () => []
})

const emit = defineEmits<{
  'shortcut-triggered': [shortcut: Shortcut]
  'open': []
  'close': []
  'test': [key: string]
}>()

// 响应式数据
const visible = ref(false)
const activePlatform = ref<'mac' | 'windows'>('mac')
const searchQuery = ref('')
const testMode = ref(props.testMode)
const lastPressedKey = ref('')

// 默认快捷键配置
const defaultShortcuts: ShortcutGroup[] = [
  {
    title: '📝 编辑操作',
    shortcuts: [
      {
        key: 'save',
        keys: ['Cmd', 'S'],
        description: '保存课程',
        action: 'save',
        platforms: ['mac']
      },
      {
        key: 'save-win',
        keys: ['Ctrl', 'S'],
        description: '保存课程',
        action: 'save',
        platforms: ['windows']
      },
      {
        key: 'undo',
        keys: ['Cmd', 'Z'],
        description: '撤销上一次操作',
        action: 'undo',
        platforms: ['mac']
      },
      {
        key: 'undo-win',
        keys: ['Ctrl', 'Z'],
        description: '撤销上一次操作',
        action: 'undo',
        platforms: ['windows']
      },
      {
        key: 'redo',
        keys: ['Cmd', 'Shift', 'Z'],
        description: '重做操作',
        action: 'redo',
        platforms: ['mac']
      },
      {
        key: 'redo-win',
        keys: ['Ctrl', 'Y'],
        description: '重做操作',
        action: 'redo',
        platforms: ['windows']
      }
    ]
  },
  {
    title: '🤖 AI 助手',
    shortcuts: [
      {
        key: 'ai-assistant',
        keys: ['Cmd', 'K'],
        description: '打开/关闭 AI 助手',
        action: 'toggle-ai',
        platforms: ['mac']
      },
      {
        key: 'ai-assistant-win',
        keys: ['Ctrl', 'K'],
        description: '打开/关闭 AI 助手',
        action: 'toggle-ai',
        platforms: ['windows']
      }
    ]
  },
  {
    title: '⚙️ 通用操作',
    shortcuts: [
      {
        key: 'escape',
        keys: ['Esc'],
        description: '关闭所有对话框',
        action: 'escape'
      },
      {
        key: 'help',
        keys: ['?'],
        description: '显示/隐藏快捷键帮助',
        action: 'help'
      },
      {
        key: 'search',
        keys: ['Cmd', 'F'],
        description: '搜索',
        action: 'search',
        platforms: ['mac']
      },
      {
        key: 'search-win',
        keys: ['Ctrl', 'F'],
        description: '搜索',
        action: 'search',
        platforms: ['windows']
      }
    ]
  },
  {
    title: '🎮 课程控制',
    shortcuts: [
      {
        key: 'play',
        keys: ['Space'],
        description: '播放/暂停课程',
        action: 'play-pause'
      },
      {
        key: 'next',
        keys: ['→'],
        description: '下一个步骤',
        action: 'next'
      },
      {
        key: 'prev',
        keys: ['←'],
        description: '上一个步骤',
        action: 'previous'
      },
      {
        key: 'fullscreen',
        keys: ['F'],
        description: '全屏模式',
        action: 'fullscreen'
      }
    ]
  }
]

// 合并自定义快捷键
const shortcuts = computed(() => {
  return [...defaultShortcuts, ...props.customShortcuts]
})

// 按平台过滤快捷键
const filteredShortcuts = computed(() => {
  if (!searchQuery.value) {
    return shortcuts.value.map(group => ({
      ...group,
      shortcuts: group.shortcuts.filter(shortcut =>
        !shortcut.platforms || shortcut.platforms.includes(activePlatform.value)
      )
    })).filter(group => group.shortcuts.length > 0)
  }

  return searchResults.value.length > 0 ?
    [{
      title: '🔍 搜索结果',
      shortcuts: searchResults.value
    }] : []
})

// 搜索结果
const searchResults = computed(() => {
  if (!searchQuery.value) return []

  const query = searchQuery.value.toLowerCase()
  const allShortcuts = shortcuts.value.flatMap(group => group.shortcuts)

  return allShortcuts.filter(shortcut =>
    (!shortcut.platforms || shortcut.platforms.includes(activePlatform.value)) &&
    (
      shortcut.description.toLowerCase().includes(query) ||
      shortcut.keys.some(key => key.toLowerCase().includes(query)) ||
      shortcut.key.toLowerCase().includes(query)
    )
  )
})

// 底部提示
const footerTip = computed(() => {
  return testMode.value
    ? '测试模式已开启，按下快捷键进行测试'
    : activePlatform.value === 'mac'
      ? 'Mac 用户：使用 Cmd 键'
      : 'Windows 用户：使用 Ctrl 键'
})

// 检测用户平台
function detectPlatform(): 'mac' | 'windows' {
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? 'mac' : 'windows'
}

// 显示快捷键面板
function show() {
  visible.value = true
  emit('open')
}

// 关闭快捷键面板
function close() {
  visible.value = false
  emit('close')
}

// 切换显示状态
function toggle() {
  if (visible.value) {
    close()
  } else {
    show()
  }
}

// 处理弹窗关闭
function handleClose() {
  emit('close')
}

// 处理平台切换
function handlePlatformChange(platformName: string) {
  activePlatform.value = platformName as 'mac' | 'windows'
  showToast(`已切换到${platformName === 'mac' ? 'Mac' : 'Windows'}快捷键`)
}

// 处理快捷键点击
function handleShortcutClick(shortcut: Shortcut) {
  if (testMode.value) {
    emit('test', shortcut.key)
    showSuccessToast(`测试触发: ${shortcut.description}`)
  } else {
    emit('shortcut-triggered', shortcut)
    showToast(`快捷键: ${shortcut.description}`)
  }
}

// 处理搜索
function handleSearch() {
  // 搜索逻辑已在计算属性中处理
}

// 清除搜索
function handleSearchClear() {
  searchQuery.value = ''
}

// 重置快捷键
function resetShortcuts() {
  searchQuery.value = ''
  activePlatform.value = detectPlatform()
  testMode.value = false
  showSuccessToast('快捷键已重置')
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent) {
  // 记录最后按下的键（用于测试模式）
  lastPressedKey.value = event.key

  // 按 ? 键显示/隐藏快捷键帮助
  if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    toggle()
    return
  }

  // 查找匹配的快捷键
  const currentPlatform = detectPlatform()
  const allShortcuts = shortcuts.value.flatMap(group => group.shortcuts)

  const matchingShortcut = allShortcuts.find(shortcut => {
    if (shortcut.platforms && !shortcut.platforms.includes(currentPlatform)) {
      return false
    }

    // 检查按键组合
    const keys = []
    if (event.metaKey && currentPlatform === 'mac') keys.push('Cmd')
    if (event.ctrlKey && currentPlatform === 'windows') keys.push('Ctrl')
    if (event.shiftKey) keys.push('Shift')
    if (event.altKey) keys.push('Alt')
    if (event.key && !['Control', 'Meta', 'Shift', 'Alt'].includes(event.key)) {
      keys.push(event.key.length === 1 ? event.key.toUpperCase() : event.key)
    }

    return JSON.stringify(keys.sort()) === JSON.stringify(shortcut.keys.slice().sort())
  })

  if (matchingShortcut) {
    event.preventDefault()
    emit('shortcut-triggered', matchingShortcut)

    if (testMode.value) {
      emit('test', matchingShortcut.key)
      showSuccessToast(`测试: ${matchingShortcut.description}`)
    }
  }
}

// 组件挂载时初始化
onMounted(() => {
  activePlatform.value = detectPlatform()
  window.addEventListener('keydown', handleKeyDown)
})

// 组件卸载时清理监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 暴露方法给父组件
defineExpose({
  show,
  close,
  toggle,
  detectPlatform,
  shortcuts: computed(() => shortcuts.value),
  currentPlatform: computed(() => activePlatform.value)
})
</script>

<style scoped lang="scss">
.keyboard-shortcuts-popup {
  display: flex;
  flex-direction: column;

  .shortcuts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-lg) var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);
    background: var(--van-background-2);

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      color: var(--van-text-color-1);

      .van-icon {
        color: var(--van-primary-color);
      }
    }
  }

  .platform-selector {
    background: var(--van-background-2);
    border-bottom: 1px solid var(--van-border-color);

    :deep(.van-tabs) {
      .van-tab {
        flex: 1;
      }

      .van-tab__text {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
      }
    }
  }

  .shortcuts-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-sm);

    .group-title {
      background: var(--van-primary-color-light);
      color: var(--van-primary-color);
      font-weight: 600;

      :deep(.van-cell__title) {
        font-size: var(--van-font-size-md);
      }
    }

    .shortcut-keys {
      display: flex;
      align-items: center;
      gap: var(--van-padding-xs);
      flex-wrap: wrap;
      max-width: 200px;
      justify-content: flex-end;

      .key-chip {
        display: inline-flex;
        align-items: center;
        background: var(--van-background-1);
        border: 1px solid var(--van-border-color);
        border-radius: var(--van-radius-sm);
        padding: 2px 6px;
        font-size: var(--van-font-size-xs);
        font-weight: 600;
        color: var(--van-text-color-1);
        font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

        .key-separator {
          margin: 0 2px;
          color: var(--van-text-color-3);
        }
      }
    }

    .no-results {
      padding: var(--van-padding-xl) 0;
      text-align: center;
    }
  }

  .shortcuts-footer {
    background: var(--van-background-2);
    border-top: 1px solid var(--van-border-color);
    padding: var(--van-padding-sm) var(--van-padding-md);
  }

  .search-bar {
    background: var(--van-background-2);
    padding: var(--van-padding-sm) var(--van-padding-md);
    border-top: 1px solid var(--van-border-color);

    :deep(.van-search) {
      padding: 0;
    }
  }

  .test-mode-bar {
    background: var(--van-background-2);
    border-top: 1px solid var(--van-border-color);
  }
}

// 悬浮按钮样式
:deep(.van-floating-bubble) {
  background: var(--van-primary-color);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(25, 137, 255, 0.3);

  &:active {
    transform: scale(0.95);
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .keyboard-shortcuts-popup {
    .shortcuts-header {
      padding: var(--van-padding-md);

      .header-title {
        font-size: var(--van-font-size-md);

        .van-icon {
          font-size: var(--text-xl);
        }
      }
    }

    .shortcuts-content {
      .shortcut-keys {
        max-width: 150px;

        .key-chip {
          font-size: 10px;
          padding: 1px 4px;
        }
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .keyboard-shortcuts-popup {
    background: var(--van-background-1);

    .shortcuts-header,
    .platform-selector,
    .shortcuts-footer,
    .search-bar {
      background: var(--van-background-2);
    }

    .shortcut-keys {
      .key-chip {
        background: var(--van-background-3);
        border-color: var(--van-border-color);
        color: var(--van-text-color-1);
      }
    }
  }
}
</style>