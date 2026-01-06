<template>
  <div
    class="scrollable-content"
    :class="contentClasses"
    :style="contentStyle"
  >
    <!-- 下拉刷新包裹层 -->
    <van-pull-refresh
      v-if="enablePullRefresh"
      v-model="isRefreshing"
      @refresh="handleRefresh"
      class="pull-refresh-wrapper"
    >
      <div class="scroll-container" ref="scrollContainer">
        <div class="scroll-inner" :class="{ 'with-padding': padding }">
          <slot></slot>
        </div>
      </div>
    </van-pull-refresh>

    <!-- 普通滚动容器 -->
    <div v-else class="scroll-container" ref="scrollContainer">
      <div class="scroll-inner" :class="{ 'with-padding': padding }">
        <slot></slot>
      </div>

      <!-- 上拉加载 -->
      <van-list
        v-if="enableLoadMore"
        v-model:loading="isLoadingMore"
        :finished="finished"
        finished-text="没有更多了"
        loading-text="加载中..."
        @load="handleLoadMore"
        class="load-more-wrapper"
      >
        <slot name="load-more-trigger"></slot>
      </van-list>
    </div>

    <!-- 底部安全区域占位 -->
    <div v-if="withFooter" class="bottom-safe-area-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  withHeader?: boolean
  withFooter?: boolean
  padding?: string | boolean
  backgroundColor?: string
  enableScroll?: boolean
  enablePullRefresh?: boolean
  enableLoadMore?: boolean
  scrollThreshold?: number
  maxHeight?: string
  minHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  withHeader: true,
  withFooter: true,
  padding: true,
  backgroundColor: '',
  enableScroll: true,
  enablePullRefresh: false,
  enableLoadMore: false,
  scrollThreshold: 50,
  maxHeight: '',
  minHeight: ''
})

const emit = defineEmits<{
  'refresh': []
  'load-more': []
  'scroll': [scrollTop: number]
  'scroll-to-bottom': []
}>()

// 响应式数据
const scrollContainer = ref<HTMLElement>()
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const finished = ref(false)
const scrollTop = ref(0)
const isScrolling = ref(false)
const scrollTimeout = ref<NodeJS.Timeout>()

// 计算属性
const contentClasses = computed(() => ({
  'with-header': props.withHeader,
  'with-footer': props.withFooter,
  'scrollable': props.enableScroll
}))

const contentStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
  }

  if (props.maxHeight) {
    style.maxHeight = props.maxHeight
  }

  if (props.minHeight) {
    style.minHeight = props.minHeight
  }

  return style
})

// 滚动处理
const handleScroll = () => {
  if (!scrollContainer.value || !props.enableScroll) return

  const container = scrollContainer.value
  const currentScrollTop = container.scrollTop

  // 防抖处理
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }

  scrollTimeout.value = setTimeout(() => {
    isScrolling.value = false
  }, 150)

  isScrolling.value = true
  scrollTop.value = currentScrollTop

  // 发出滚动事件
  emit('scroll', currentScrollTop)

  // 检查是否滚动到底部
  if (props.enableLoadMore) {
    const { scrollHeight, clientHeight } = container
    if (scrollHeight - currentScrollTop - clientHeight < props.scrollThreshold) {
      emit('scroll-to-bottom')
    }
  }
}

// 下拉刷新处理
const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    await emit('refresh')
  } finally {
    isRefreshing.value = false
  }
}

// 上拉加载处理
const handleLoadMore = async () => {
  if (finished.value) return

  isLoadingMore.value = true
  try {
    await emit('load-more')
  } finally {
    isLoadingMore.value = false
  }
}

// 生命周期
onMounted(() => {
  if (props.enableScroll && scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (props.enableScroll && scrollContainer.value) {
    scrollContainer.value?.removeEventListener('scroll', handleScroll)
  }
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
})

// 暴露的方法给父组件使用
defineExpose({
  scrollToTop: () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 0
    }
  },
  scrollTo: (top: number) => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTo({
        top,
        behavior: 'smooth'
      })
    }
  },
  getScrollTop: () => scrollTop.value,
  getScrollHeight: () => scrollContainer.value?.scrollHeight || 0
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.scrollable-content {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-page);
  transition: all var(--transition-duration-base) var(--transition-timing-ease);
  overflow: hidden;

  // 为头部留出空间
  &.with-header {
    padding-top: var(--header-height);
  }

  // 为底部留出空间
  &.with-footer {
    padding-bottom: var(--tabbar-height);
  }

  // 可滚动
  &.scrollable {
    overflow: hidden;
  }
}

.pull-refresh-wrapper {
  flex: 1;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; // iOS 平滑滚动
  scroll-behavior: smooth;
  position: relative;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-color-light);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-placeholder);
  }
}

.scroll-inner {
  min-height: 100%;
  position: relative;

  &.with-padding {
    padding: var(--app-gap);
  }

  @media (min-width: 768px) {
    &.with-padding {
      padding: var(--app-gap-lg);
    }
  }
}

.bottom-safe-area-spacer {
  height: env(safe-area-inset-bottom);
}

.load-more-wrapper {
  padding: var(--app-gap) 0;
  text-align: center;
  background: var(--bg-color-page);

  :deep(.van-list__loading),
  :deep(.van-list__finished-text),
  :deep(.van-list__error-text) {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }
}

// 下拉刷新样式
.pull-refresh-wrapper {
  :deep(.van-pull-refresh__track) {
    background: transparent;
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .scrollable-content {
    background-color: var(--bg-color-page-dark);
  }

  .scroll-container {
    &::-webkit-scrollbar-track {
      background: var(--bg-color-dark);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color-dark);
    }
  }

  .load-more-wrapper {
    background: var(--bg-color-page-dark);

    :deep(.van-list__loading),
    :deep(.van-list__finished-text),
    :deep(.van-list__error-text) {
      color: var(--text-secondary-dark);
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .scrollable-content {
    &.with-header {
      padding-top: calc(var(--header-height) + var(--app-gap));
    }

    &.with-footer {
      padding-bottom: calc(var(--tabbar-height) + var(--app-gap));
    }
  }
}

// 安全区域处理
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-safe-area-spacer {
    height: env(safe-area-inset-bottom);
  }
}

// 性能优化
.scrollable-content.scrollable .scroll-container {
  will-change: scroll-position;
}
</style>
