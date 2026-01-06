<template>
  <div class="mobile-footer" :class="footerClasses">
    <!-- 底部安全区域占位 -->
    <div v-if="useSafeArea" class="bottom-safe-area-spacer"></div>

    <!-- 底部导航栏 -->
    <van-tabbar
      v-model="internalActiveTab"
      :fixed="fixed"
      :placeholder="placeholder"
      :safe-area-inset-bottom="false"
      :border="showBorder"
      class="custom-tabbar"
      @change="handleTabChange"
    >
      <van-tabbar-item
        v-for="tab in filteredTabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
        :badge="tab.badge"
        :dot="tab.dot"
      >
        <template #icon>
          <div class="tab-icon">
            <van-icon :name="tab.icon" size="20" />
            <span v-if="tab.customIcon" class="custom-icon">{{ tab.customIcon }}</span>
          </div>
        </template>

        <span class="tab-title">{{ tab.title }}</span>
      </van-tabbar-item>
    </van-tabbar>

    <!-- 自定义底部操作栏（可选） -->
    <div v-if="$slots.actions" class="footer-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface FooterTab {
  name: string
  title: string
  icon: string
  path: string
  badge?: number | string
  dot?: boolean
  customIcon?: string
  disabled?: boolean
  roles?: string[]
  hide?: boolean
}

interface Props {
  tabs?: FooterTab[]
  activeTab?: string
  fixed?: boolean
  placeholder?: boolean
  showBorder?: boolean
  useSafeArea?: boolean
  backgroundColor?: string
  height?: string
  enableAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [],
  activeTab: '',
  fixed: true,
  placeholder: true,
  showBorder: true,
  useSafeArea: true,
  backgroundColor: '',
  height: '',
  enableAnimation: true
})

const emit = defineEmits<{
  'tab-change': [tab: string]
  'tab-click': [tab: FooterTab, event: Event]
}>()

const router = useRouter()
const route = useRoute()

// 响应式数据
const internalActiveTab = ref(props.activeTab)

// 计算属性
const filteredTabs = computed(() => {
  return props.tabs.filter(tab => !tab.hide && !tab.disabled)
})

const footerClasses = computed(() => ({
  'with-safe-area': props.useSafeArea,
  'with-animation': props.enableAnimation,
  'without-border': !props.showBorder
}))

const footerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
  }
  if (props.height) {
    style.height = props.height
  }
  return style
})

// 监听外部 activeTab 变化
watch(() => props.activeTab, (newTab) => {
  internalActiveTab.value = newTab
})

// 监听路由变化更新激活标签
const updateActiveTabByRoute = () => {
  const currentPath = route.path
  const matchedTab = filteredTabs.value.find(tab =>
    currentPath === tab.path || currentPath.startsWith(tab.path)
  )
  if (matchedTab && matchedTab.name !== internalActiveTab.value) {
    internalActiveTab.value = matchedTab.name
  }
}

// 监听路由变化
watch(() => route.path, updateActiveTabByRoute, { immediate: true })

// 事件处理
const handleTabChange = (tabName: string) => {
  internalActiveTab.value = tabName

  const selectedTab = filteredTabs.value.find(tab => tab.name === tabName)
  if (selectedTab) {
    emit('tab-change', tabName)
    emit('tab-click', selectedTab, new Event('tab-change'))

    // 如果有路径，进行导航
    if (selectedTab.path && route.path !== selectedTab.path) {
      router.push(selectedTab.path)
    }
  }
}

// 暴露方法
defineExpose({
  setActiveTab: (tab: string) => {
    internalActiveTab.value = tab
  },
  getActiveTab: () => internalActiveTab.value
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-footer {
  position: relative;
  z-index: var(--z-index-footer);
  background: var(--bg-color);
  transition: all var(--transition-duration-base) var(--transition-timing-ease);

  .bottom-safe-area-spacer {
    height: env(safe-area-inset-bottom);
    background: inherit;
  }

  // 明暗主题适配
  :global([data-theme="dark"]) & {
    background: var(--bg-color-dark);
  }

  &.with-safe-area {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.custom-tabbar {
  background: var(--bg-color);
  border-top: 1px solid var(--border-color-light);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  height: var(--tabbar-height);

  :deep(.van-tabbar) {
    background: transparent;
    border: none;
  }

  :deep(.van-tabbar-item) {
    color: var(--text-tertiary);
    background: transparent;
    transition: all var(--transition-duration-fast) var(--transition-timing-ease);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: var(--primary-color);
      border-radius: 1px;
      transform: translateX(-50%);
      transition: width var(--transition-duration-fast) var(--transition-timing-ease);
    }
  }

  // 修复 :deep() 选择器语法
  :deep(.van-tabbar-item--active) {
    color: var(--primary-color);
    background: transparent;

    &::after {
      width: 20px;
    }
  }

  :deep(.van-tabbar-item__icon) {
    margin-bottom: var(--app-gap-xs);
    transition: transform var(--transition-duration-fast) var(--transition-timing-ease);
  }

  :deep(.van-tabbar-item__text) {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    line-height: 1.2;
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  position: relative;

  .custom-icon {
    position: absolute;
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    color: var(--primary-color);
  }
}

.tab-title {
  font-size: var(--text-xs);
  line-height: 1;
  text-align: center;
  display: block;
  margin-top: 2px;
}

// 底部操作栏
.footer-actions {
  background: var(--bg-color);
  border-top: 1px solid var(--border-color-light);
  padding: var(--app-gap);
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: var(--app-gap);

  :global([data-theme="dark"]) & {
    background: var(--bg-color-dark);
    border-top-color: var(--border-color-dark);
  }
}

// 动画效果
.mobile-footer.with-animation {
  .custom-tabbar {
    :deep(.van-tabbar-item) {
      &:not(.van-tabbar-item--active):hover {
        transform: translateY(-2px);
      }
    }

    :deep(.van-tabbar-item--active) {
      .tab-icon {
        transform: scale(1.1);
      }
    }
  }
}

// 徽章动画
.mobile-footer {
  :deep(.van-tabbar-item) {
    animation: tabFadeIn var(--transition-duration-slow) var(--transition-timing-ease) forwards;
    opacity: 0;

    @for $i from 1 through 5 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
      }
    }
  }
}

@keyframes tabFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 角标和徽章样式
.mobile-footer {
  :deep(.van-tabbar-item__badge) {
    background: var(--danger-color);
    color: var(--text-inverse);
    border: 1px solid var(--bg-color);
    font-size: var(--text-xs);
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    border-radius: 8px;
    padding: 0 4px;
  }

  :deep(.van-tabbar-item__dot) {
    background: var(--danger-color);
    width: 6px;
    height: 6px;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-footer {
    .custom-tabbar {
      :deep(.van-tabbar-item__text) {
        font-size: var(--text-sm);
      }
    }
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .custom-tabbar {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(15px);
    border-top-color: var(--border-color-dark);

    :deep(.van-tabbar-item) {
      color: var(--text-secondary-dark);
    }

    :deep(.van-tabbar-item--active) {
      color: var(--primary-color);

      &::after {
        background: var(--primary-color);
      }
    }
  }
}

// 大屏设备适配
@media (min-width: 1024px) {
  .mobile-footer {
    max-width: var(--breakpoint-lg);
    margin: 0 auto;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    overflow: hidden;
  }
}

// 触摸优化
.mobile-footer {
  :deep(.van-tabbar-item) {
    min-height: 50px; // 确保触摸目标足够大
    touch-action: manipulation; // 提升触摸性能

    &:active {
      transform: scale(0.95);
    }
  }
}

// 无障碍支持
.mobile-footer {
  :deep(.van-tabbar-item) {
    &:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  }
}

// 安全区域处理
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .mobile-footer {
    &.with-safe-area {
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
}

// 特殊状态样式
.mobile-footer {
  .custom-tabbar {
    &.hidden {
      transform: translateY(100%);
      opacity: 0;
      pointer-events: none;
    }

    &.transparent {
      background: transparent;
      backdrop-filter: none;
      border-top: none;

      :deep(.van-tabbar-item) {
        color: var(--text-inverse);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>