<template>
  <div class="center-container unified-center-layout">
    <!-- 骨架屏（整合自CenterContainer） -->
    <div v-if="isSkeletonVisible" class="center-skeleton">
      <div class="skeleton-header" v-if="showHeader || showActions || (tabs && tabs.length > 0)">
        <div class="skeleton-title skeleton" v-if="showHeader"></div>
        <div class="skeleton-tabs" v-if="tabs && tabs.length > 0">
          <div v-for="i in Math.min(tabs.length, 4)" :key="i" class="skeleton-tab skeleton"></div>
        </div>
        <div class="skeleton-actions">
          <div class="skeleton-button skeleton"></div>
        </div>
      </div>
      <div class="skeleton-content">
        <slot name="skeleton">
          <!-- 默认骨架屏内容 -->
          <div class="skeleton-grid skeleton-grid-4">
            <div v-for="i in 4" :key="`card-${i}`" class="skeleton-card skeleton"></div>
          </div>
          <div class="skeleton-list">
            <div v-for="i in 3" :key="`list-${i}`" class="skeleton-list-item">
              <div class="skeleton-list-avatar skeleton-avatar skeleton"></div>
              <div class="skeleton-list-content">
                <div class="skeleton-title skeleton"></div>
                <div class="skeleton-text skeleton"></div>
                <div class="skeleton-text skeleton"></div>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 实际内容 -->
    <template v-else>
      <!-- 头部操作区域 -->
      <div v-if="showHeader || showActions || $slots['header-actions'] || $slots['header-subtitle']" class="center-header">
        <div class="center-header-left">
          <h1 v-if="showHeader || showTitle" class="center-title">{{ title }}</h1>
          <div v-if="$slots['header-subtitle']" class="center-subtitle">
            <slot name="header-subtitle" />
          </div>
        </div>
        <div v-if="showActions || $slots['header-actions']" class="center-header-right">
          <slot name="header-actions" />
        </div>
      </div>

      <!-- 统计卡片区域（采用现代网格布局） -->
      <div v-if="$slots.stats" class="stats-cards">
        <div class="stats-grid">
          <slot name="stats" />
        </div>
      </div>

      <!-- 标签页导航（整合自CenterContainer） -->
      <div class="center-tabs" v-if="tabs && tabs.length > 0">
        <el-tabs
          v-model="activeTab"
          @tab-change="handleTabChange"
          class="center-tabs-container"
        >
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.key"
            :label="tab.label"
            :name="tab.key"
            :lazy="lazyTabs"
          >
            <!-- 标签页内容需要包装在 center-content 中以支持滚动 -->
            <div class="center-content">
              <!-- 标签页内容插槽 -->
              <slot :name="`tab-${tab.key}`" :tab="tab">
                <div class="tab-content-placeholder">
                  {{ tab.label }} 内容区域
                </div>
              </slot>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 主要内容区域（现代布局设计） -->
      <div class="main-content" :class="{ 'full-width': fullWidth }">
        <!-- 🎯 如果没有侧边栏，使用全宽现代布局 -->
        <template v-if="!$slots.sidebar">
          <div class="content-section full-width">
            <!-- 如果有标签页，内容在标签页内；否则直接显示 -->
            <div v-if="!tabs || tabs.length === 0" class="center-content">
              <slot name="content">
                <slot />
              </slot>
            </div>
            <slot v-else />
          </div>
        </template>

        <!-- 🎯 如果有侧边栏，使用传统栅格布局 -->
        <template v-else>
          <el-row :gutter="gutter">
            <!-- 左侧主要内容 -->
            <el-col
              :xs="24"
              :sm="24"
              :md="mainColMd"
              :lg="mainColLg"
              :xl="mainColXl"
            >
              <div class="content-section">
                <!-- 如果有标签页，内容在标签页内；否则直接显示 -->
                <div v-if="!tabs || tabs.length === 0" class="center-content">
                  <slot name="content">
                    <slot />
                  </slot>
                </div>
                <slot v-else />
              </div>
            </el-col>

            <!-- 右侧边栏 -->
            <el-col
              :xs="24"
              :sm="24"
              :md="sidebarColMd"
              :lg="sidebarColLg"
              :xl="sidebarColXl"
            >
              <div class="sidebar-content">
                <slot name="sidebar" />
              </div>
            </el-col>
          </el-row>
        </template>
      </div>

      <!-- 底部操作区域（整合自CenterContainer） -->
      <div class="center-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>

      <!-- 加载状态（整合自CenterContainer） -->
      <div v-if="loading" class="center-loading">
        <el-loading
          :visible="loading"
          text="加载中..."
          background="var(--black-alpha-70)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

// 标签页接口（整合自CenterContainer）
interface Tab {
  key: string
  label: string
  icon?: string
  disabled?: boolean
}

interface Props {
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description?: string
  /** 页面图标 */
  icon?: any
  /** 主要内容列的响应式配置 */
  mainColMd?: number
  mainColLg?: number
  mainColXl?: number
  /** 侧边栏列的响应式配置 */
  sidebarColMd?: number
  sidebarColLg?: number
  sidebarColXl?: number
  /** 是否使用全宽度布局（移除边距） */
  fullWidth?: boolean
  /** 标签页配置（整合自CenterContainer） */
  tabs?: Tab[]
  /** 默认标签页 */
  defaultTab?: string
  /** 当前激活标签页 */
  activeTab?: string
  /** 加载状态 */
  loading?: boolean
  /** 显示完整头部 */
  showHeader?: boolean
  /** 显示标题 */
  showTitle?: boolean
  /** 显示面包屑 */
  showBreadcrumb?: boolean
  /** 显示操作栏 */
  showActions?: boolean
  /** 同步URL参数 */
  syncUrl?: boolean
  /** 显示骨架屏 */
  showSkeleton?: boolean
  /** 骨架屏延迟 */
  skeletonDelay?: number
  /** 标签页懒加载 */
  lazyTabs?: boolean
  /** 栅格间距 */
  gutter?: number
  /** 自定义内边距 */
  contentPadding?: string
  /** 自定义类名 */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  mainColMd: 24,
  mainColLg: 18,
  mainColXl: 16,
  sidebarColMd: 24,
  sidebarColLg: 6,
  sidebarColXl: 8,
  fullWidth: false,
  tabs: () => [],
  defaultTab: '',
  activeTab: '',
  loading: false,
  showHeader: false,
  showTitle: false,
  showBreadcrumb: false,
  showActions: true,
  syncUrl: true,
  showSkeleton: false,
  skeletonDelay: 0,
  lazyTabs: true,
  gutter: 20,
  contentPadding: 'var(--spacing-md)'
})

const emit = defineEmits<{
  create: []
  tabChange: [tabKey: string]
  'update:activeTab': [tabKey: string]
}>()

const route = useRoute()
const router = useRouter()

// 当前激活的标签页（整合自CenterContainer）
const activeTab = ref<string>('')

// 控制骨架屏显示的响应式变量
const isSkeletonVisible = ref(props.showSkeleton)

// 响应式缩放监听
const viewportWidth = ref(window.innerWidth)
const viewportHeight = ref(window.innerHeight)
const zoomLevel = ref(1)

// 检测浏览器缩放级别
const detectZoomLevel = () => {
  const windowWidth = window.innerWidth
  const screenWidth = screen.width
  const detectedZoom = windowWidth / screenWidth
  zoomLevel.value = detectedZoom
}

// 响应式调整内边距
const responsivePadding = computed(() => {
  const width = viewportWidth.value
  const zoom = zoomLevel.value

  // 根据视口宽度和缩放级别动态计算内边距
  if (width < 768) {
    return `${Math.max(8, width * 0.04)}px` // 移动端：4%视口宽度，最小8px
  } else if (width < 1200) {
    return `${Math.max(12, width * 0.03)}px` // 平板：3%视口宽度，最小12px
  } else if (width < 1600) {
    return `${Math.max(16, width * 0.025)}px` // 桌面：2.5%视口宽度，最小16px
  } else {
    return `${Math.max(20, width * 0.02)}px` // 大屏：2%视口宽度，最小20px
  }
})

// 初始化激活标签页
const initActiveTab = () => {
  // 优先使用 props.activeTab
  if (props.activeTab && props.tabs.some(tab => tab.key === props.activeTab)) {
    activeTab.value = props.activeTab
    return
  }

  // 只在启用URL同步时才从URL参数获取
  if (props.syncUrl) {
    const tabFromQuery = route.query.tab as string
    if (tabFromQuery && props.tabs.some(tab => tab.key === tabFromQuery)) {
      activeTab.value = tabFromQuery
      return
    }
  }

  // 使用默认标签页
  if (props.defaultTab && props.tabs.some(tab => tab.key === props.defaultTab)) {
    activeTab.value = props.defaultTab
  }
  // 最后使用第一个标签页
  else if (props.tabs.length > 0) {
    activeTab.value = props.tabs[0].key
  }
}

// 处理标签页切换
const handleTabChange = (tabKey: string) => {
  activeTab.value = tabKey

  // 只在启用URL同步时才更新URL参数
  if (props.syncUrl) {
    router.push({
      ...route,
      query: {
        ...route.query,
        tab: tabKey
      }
    })
  }

  // 触发事件
  emit('update:activeTab', tabKey)
  emit('tabChange', tabKey)
}

// 监听 props.activeTab 变化
watch(() => props.activeTab, (newTab) => {
  if (newTab && props.tabs.some(tab => tab.key === newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
})

// 只在启用URL同步时才监听路由变化
watch(() => route.query.tab, (newTab) => {
  if (props.syncUrl && newTab && typeof newTab === 'string' && props.tabs.some(tab => tab.key === newTab)) {
    activeTab.value = newTab
  }
})

// 监听tabs变化
watch(() => props.tabs, () => {
  initActiveTab()
}, { immediate: true })

// 监听 showSkeleton prop 的变化
watch(() => props.showSkeleton, (newVal) => {
  if (newVal && props.skeletonDelay > 0) {
    // 如果设置了延迟，则延迟显示骨架屏
    setTimeout(() => {
      isSkeletonVisible.value = true
    }, props.skeletonDelay)
  } else {
    isSkeletonVisible.value = newVal
  }
}, { immediate: true })

// 响应窗口大小变化
const handleResize = () => {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
  detectZoomLevel()
}

// 处理浏览器缩放变化
const handleZoomChange = () => {
  const newZoom = window.devicePixelRatio || 1
  if (Math.abs(newZoom - zoomLevel.value) > 0.01) {
    detectZoomLevel()
  }
}

onMounted(() => {
  initActiveTab()

  // 初始化视口和缩放检测
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
  detectZoomLevel()

  // 添加事件监听
  window.addEventListener('resize', handleResize)
  window.addEventListener('zoom', handleZoomChange)

  // 使用防抖监听缩放变化
  let resizeTimer: NodeJS.Timeout
  const debouncedResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      handleResize()
      handleZoomChange()
    }, 100)
  }

  window.addEventListener('resize', debouncedResize)

  // 定期检查缩放变化（作为备用方案）
  const zoomCheckInterval = setInterval(() => {
    const currentDevicePixelRatio = window.devicePixelRatio || 1
    if (Math.abs(currentDevicePixelRatio - zoomLevel.value) > 0.01) {
      detectZoomLevel()
    }
  }, 1000)

  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('zoom', handleZoomChange)
    window.removeEventListener('resize', debouncedResize)
    clearInterval(zoomCheckInterval)
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

// 统一的容器布局 - 参考现代设计系统
.unified-center-layout {
  // 🎯 采用现代全屏布局设计
  height: 100%;
  min-height: 0; // 允许flex子元素缩小
  background: var(--bg-secondary, var(--bg-container));
  padding: 0;
  position: relative;
  width: 100%;
  max-width: none;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;

  // 🎯 主内容区域布局优化 - 统一使用design-tokens变量和断点
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    transition: padding var(--transition-base) ease;
    min-height: 0; // 允许flex子元素缩小，这是关键！
    height: 100%;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: var(--bg-tertiary);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
      transition: background 0.3s ease;

      &:hover {
        background: var(--text-disabled);
      }
    }

    // ✅ 统一内边距：使用design-tokens变量，不再使用clamp()
    padding: var(--spacing-lg) !important;

    // 🎯 统计卡片网格布局 - 统一使用design-tokens断点
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);

      // ✅ 响应式网格 - 统一使用design-tokens断点
      @media (max-width: var(--breakpoint-xl)) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (max-width: var(--breakpoint-lg)) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }
    }

    // 🎯 内容区域全宽布局
    .content-section {
      width: 100%;
      max-width: none;
      background: var(--el-bg-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: visible;  // ✅ 允许内容显示，由center-content控制滚动

      &.full-width {
        padding: 0;
        width: 100%;
        max-width: none;
      }
    }
  }

  // ✅ 响应式设计 - 统一使用design-tokens断点
  @media (max-width: var(--breakpoint-2xl)) {
    // 大屏幕（1536px及以下）
    .main-content {
      padding: var(--spacing-lg) !important;
    }
  }

  @media (max-width: var(--breakpoint-xl)) {
    // 中等屏幕（1280px及以下）
    .main-content {
      padding: var(--spacing-md) !important;
    }

    .stats-grid {
      gap: var(--spacing-md);
    }
  }

  @media (max-width: var(--breakpoint-lg)) {
    // 小屏幕（1024px及以下）
    .main-content {
      padding: var(--spacing-md) !important;
    }

    .stats-grid {
      gap: var(--spacing-sm);
    }
  }

  @media (max-width: var(--breakpoint-md)) {
    // 平板（768px及以下）
    .main-content {
      padding: var(--spacing-sm) !important;
    }

    .stats-grid {
      gap: var(--spacing-sm);
    }
  }

  @media (max-width: var(--breakpoint-sm)) {
    // 手机（640px及以下）
    .main-content {
      padding: var(--spacing-sm) !important;
    }

    .stats-grid {
      gap: var(--spacing-xs);
    }
  }

  @media (max-width: var(--breakpoint-xs)) {
    // 小屏手机（480px及以下）
    .main-content {
      padding: var(--spacing-xs) !important;
    }

    .stats-grid {
      gap: var(--spacing-xs);
    }
  }
}

// 统计卡片区域 - 现代设计风格
.stats-cards {
  margin-bottom: var(--spacing-xl);

  // ✅ 统计卡片网格样式 - 统一使用design-tokens断点
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);

    // ✅ 响应式网格 - 统一使用design-tokens断点
    @media (max-width: var(--breakpoint-xl)) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: var(--breakpoint-lg)) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: var(--breakpoint-md)) {
      grid-template-columns: 1fr;
    }
  }
}

// ✅ 统一 stats-grid-unified 样式，使用design-tokens断点
.stats-grid-unified {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);

  // ✅ 响应式网格 - 统一使用design-tokens断点
  @media (max-width: var(--breakpoint-xl)) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: var(--breakpoint-lg)) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: var(--breakpoint-md)) {
    grid-template-columns: 1fr;
  }
}

// 骨架屏样式（整合自CenterContainer）
.center-skeleton {
  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: var(--border-width-base) solid var(--border-color);
    background: var(--bg-tertiary);

    .skeleton-title {
      max-width: 200px;
      width: 100%;
      min-height: 32px;
      border-radius: var(--radius-sm);
    }

    .skeleton-tabs {
      display: flex;
      gap: var(--spacing-sm);

      .skeleton-tab {
        width: auto;
        height: 32px;
        border-radius: var(--radius-sm);
      }
    }

    .skeleton-actions {
      .skeleton-button {
        width: auto;
        height: 32px;
        border-radius: var(--radius-sm);
      }
    }
  }

  .skeleton-content {
    padding: var(--spacing-lg);

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);

      .skeleton-card {
        min-height: 60px;
        border-radius: var(--radius-md);
      }
    }

    .skeleton-list {
      .skeleton-list-item {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        border-bottom: var(--border-width-base) solid var(--border-color);

        .skeleton-list-avatar {
          width: auto;
          min-height: 32px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .skeleton-list-content {
          flex: 1;

          .skeleton-title {
            width: 60%;
            min-height: 32px;
            border-radius: var(--radius-xs);
            margin-bottom: var(--spacing-sm);
          }

          .skeleton-text {
            width: 100%;
            min-height: 32px;
            border-radius: var(--radius-xs);
            margin-bottom: var(--spacing-xs);

            &:last-child {
              width: 80%;
            }
          }
        }
      }
    }
  }

  .skeleton {
    background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
}

// 头部样式（整合自CenterContainer）
.center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: var(--border-width-base) solid var(--border-color);
  background: var(--bg-tertiary);

  .center-header-left {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .center-title {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  .center-breadcrumb {
    font-size: var(--text-sm);
  }

  .center-header-right {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
  }
}

// 简化的操作栏样式
.center-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-color);
  border-bottom: var(--border-width-base) solid var(--border-color);

  .center-actions-right {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
  }
}

// 标签页样式（整合自CenterContainer）
.center-tabs {
  .center-tabs-container {
    padding: 0 var(--spacing-lg);

    :deep(.el-tabs__header) {
      margin: 0;
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        display: none;
      }
    }

    :deep(.el-tabs__item) {
      padding: 0 var(--spacing-xl);
      height: var(--button-height-xl);
      line-height: var(--button-height-xl);
      font-size: var(--text-base);
      color: var(--text-secondary);
      border-bottom: var(--border-width-base) solid var(--border-color);
      transition: all var(--transition-fast) ease;

      &.is-active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

// 内容区域样式
.center-content {
  padding: v-bind('props.contentPadding') !important;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  min-height: 0; // 允许flex子元素缩小
  max-width: none;
  flex: 1; // 占据剩余空间
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
    transition: background 0.3s ease;

    &:hover {
      background: var(--text-disabled);
    }
  }
}

// 主要内容区域样式
.main-content {
  .content-section,
  .sidebar-content {
    background: var(--el-bg-color);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    overflow: visible;  // ✅ 允许内容显示，由子元素控制滚动
  }

  .content-section {
    padding: 0; // 移除padding，让center-content处理内边距

    &.full-width {
      padding: 0;
      width: 100%;
      max-width: none;
    }
  }

  .sidebar-content {
    padding: var(--spacing-md);
  }

  &.full-width {
    width: 100%;
    max-width: none;
    padding: 0;
  }
}

// 占位符样式
.tab-content-placeholder,
.content-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  color: var(--text-muted);
  font-size: var(--text-sm);
  background: var(--bg-tertiary);
  border: var(--border-width-base) dashed var(--border-color);
  border-radius: var(--radius-md);
}

// 底部操作区域
.center-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: var(--border-width-base) solid var(--border-color);
  background: var(--bg-tertiary);
}

// 加载状态
.center-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-dropdown);
}
</style>