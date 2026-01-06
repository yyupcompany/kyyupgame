<template>
  <div class="mobile-header" :class="{ 'with-safe-area': useSafeArea }">
    <!-- 状态栏占位（iOS刘海屏） -->
    <div v-if="useSafeArea" class="status-bar-spacer"></div>

    <van-nav-bar
      :title="title"
      :left-arrow="showBack"
      :border="false"
      :fixed="fixed"
      :placeholder="placeholder"
      :safe-area-inset-top="false"
      class="custom-nav-bar"
      @click-left="handleBack"
    >
      <!-- 左侧插槽 -->
      <template #left>
        <van-icon
          v-if="showBack"
          name="arrow-left"
          size="20"
          class="back-icon"
          @click="handleBack"
        />
      </template>

      <!-- 标题插槽 -->
      <template #title>
        <div class="nav-title">
          {{ title }}
          <span v-if="subtitle" class="nav-subtitle">{{ subtitle }}</span>
        </div>
      </template>

      <!-- 右侧操作按钮 -->
      <template #right>
        <div class="header-actions">
          <!-- AI助手按钮 -->
          <button
            v-if="showAIAssistant"
            class="ai-assistant-btn"
            @click="handleAIAccess"
            title="AI助手"
          >
            <UnifiedIcon name="ai-center" :size="18" />
          </button>

          <!-- 菜单按钮 -->
          <van-icon
            v-if="showMenu"
            name="wap-nav"
            size="20"
            class="menu-icon"
            @click="handleMenuClick"
          />

          <!-- 搜索按钮 -->
          <van-icon
            v-if="showSearch"
            name="search"
            size="20"
            class="action-icon"
            @click="handleSearch"
          />

          <!-- 右侧插槽 -->
          <slot name="right"></slot>
        </div>
      </template>
    </van-nav-bar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface Props {
  title?: string
  subtitle?: string
  showBack?: boolean
  showMenu?: boolean
  showSearch?: boolean
  showAIAssistant?: boolean  // 显示AI助手按钮
  fixed?: boolean
  placeholder?: boolean
  useSafeArea?: boolean
  backgroundColor?: string
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  showBack: true,
  showMenu: false,
  showSearch: false,
  showAIAssistant: true,  // 默认显示AI助手按钮
  fixed: true,
  placeholder: true,
  useSafeArea: true,
  backgroundColor: '',
  textColor: ''
})

const emit = defineEmits<{
  'back': []
  'menu-click': []
  'search': []
  'ai-access': []
}>()

const router = useRouter()

// 打开AI助手
const handleAIAccess = () => {
  emit('ai-access')
  // 默认行为：跳转到AI助手页面
  router.push('/mobile/parent-center/ai-assistant')
}

// 动态样式
const headerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
  }
  if (props.textColor) {
    style.color = props.textColor
  }
  return style
})

// 事件处理
const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
  emit('back')
}

const handleMenuClick = () => {
  emit('menu-click')
}

const handleSearch = () => {
  emit('search')
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-header {
  position: relative;
  z-index: var(--z-index-header);
  background-color: var(--bg-color);
  transition: all var(--transition-duration-base) var(--transition-timing-ease);

  .status-bar-spacer {
    height: env(safe-area-inset-top);
    background-color: inherit;
  }

  &.with-safe-area {
    padding-top: env(safe-area-inset-top);
  }

  // 明暗主题适配
  :global([data-theme="dark"]) & {
    background-color: var(--bg-color-dark);
  }
}

.custom-nav-bar {
  height: var(--header-height);
  background: var(--bg-color);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-sm);

  :deep(.van-nav-bar__content) {
    height: 100%;
    padding: 0 var(--app-gap);
  }

  :deep(.van-nav-bar__title) {
    font-weight: var(--font-semibold);
    font-size: var(--text-lg);
    color: var(--text-primary);
    max-width: 60%;
  }

  :deep(.van-nav-bar__left),
  :deep(.van-nav-bar__right) {
    display: flex;
    align-items: center;
    gap: var(--app-gap);
  }
}

.nav-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  .nav-subtitle {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--font-normal);
    margin-top: 2px;
    opacity: 0.8;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--app-gap-sm);

  .back-icon,
  .menu-icon,
  .action-icon {
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-duration-fast) var(--transition-timing-ease);
    padding: var(--app-gap-xs);
    border-radius: var(--border-radius-md);

    &:hover {
      background-color: var(--bg-color-light);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  // AI助手按钮样式
  .ai-assistant-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--gradient-primary);
    color: var(--text-on-primary);
    cursor: pointer;
    transition: all var(--transition-duration-fast) var(--transition-timing-ease);
    box-shadow: var(--shadow-sm);

    &:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-md);
    }

    &:active {
      transform: scale(0.95);
      box-shadow: var(--shadow-sm);
    }

    :deep(.el-icon),
    :deep(svg) {
      font-size: 18px;
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .custom-nav-bar {
    :deep(.van-nav-bar__content) {
      padding: 0 var(--app-gap-lg);
    }
  }
}

// 暗黑模式下的特殊处理
:global([data-theme="dark"]) {
  .custom-nav-bar {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(15px);
    border-bottom-color: var(--border-color-dark);

    :deep(.van-nav-bar__title) {
      color: var(--text-primary-dark);
    }

    .header-actions {
      .back-icon,
      .menu-icon,
      .action-icon {
        color: var(--text-primary-dark);

        &:hover {
          background-color: var(--bg-color-dark);
        }
      }

      .ai-assistant-btn {
        opacity: 0.9;
      }
    }
  }
}

// 渐变背景选项
.mobile-header.gradient-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);

  .custom-nav-bar {
    background: transparent;
    border-bottom: none;

    :deep(.van-nav-bar__title),
    .header-actions .icon {
      color: var(--text-inverse);
    }
  }
}

// 透明背景选项
.mobile-header.transparent-header {
  background: transparent;

  .custom-nav-bar {
    background: transparent;
    border-bottom: none;
    backdrop-filter: none;
  }
}

// 安全区域处理
@supports (padding-top: env(safe-area-inset-top)) {
  .mobile-header {
    padding-top: env(safe-area-inset-top);
  }
}
</style>