<template>
  <div 
    class="base-mobile-layout" 
    :class="layoutClasses"
    :style="{ backgroundColor: isDarkTheme ? '#0f172a' : 'var(--bg-color-page)' }"
  >
    <!-- 固定头部导航 -->
    <FixedHeader
      v-if="showHeader"
      :title="headerTitle"
      :subtitle="headerSubtitle"
      :show-back="showBack"
      :show-menu="showMenu"
      :show-search="showSearch"
      :background-color="headerBackgroundColor"
      :text-color="headerTextColor"
      :notification-count="notificationCount"
      :avatar-url="''"
      :user-name="userStore.user?.realName || userStore.user?.username || ''"
      @back="handleBack"
      @menu-click="handleMenuClick"
      @search="handleSearch"
    >
      <template #right v-if="$slots.headerRight">
        <slot name="headerRight"></slot>
      </template>
    </FixedHeader>

    <!-- 可滚动内容区 -->
    <ScrollableContent
      :with-header="showHeader"
      :with-footer="showFooter"
      :padding="contentPadding"
      :background-color="contentBackgroundColor"
      :enable-pull-refresh="enablePullRefresh"
      :enable-load-more="enableLoadMore"
      @refresh="handleRefresh"
      @load-more="handleLoadMore"
    >
      <slot></slot>
    </ScrollableContent>

    <!-- 固定底部导航 -->
    <FixedFooter
      v-if="showFooter"
      :tabs="footerTabs"
      :active-tab="activeTab"
      :badge="footerBadge"
      @tab-change="handleTabChange"
    />
  </div>
</template>

<script lang="ts">
// 导出类型供其他组件使用
export interface FooterTab {
  name: string
  title: string
  icon: string
  path?: string
  badge?: number
}
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import FixedHeader from './FixedHeader.vue'
import ScrollableContent from './ScrollableContent.vue'
import FixedFooter from './FixedFooter.vue'

// 主题状态
const isDarkTheme = ref(false)

// 检测当前主题
const detectTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  isDarkTheme.value = htmlTheme === 'dark'
}

// 类型已在上面导出，这里直接使用

interface Props {
  // 头部配置
  headerTitle?: string
  headerSubtitle?: string
  showHeader?: boolean
  showBack?: boolean
  showMenu?: boolean
  showSearch?: boolean
  headerBackgroundColor?: string
  headerTextColor?: string
  notificationCount?: number

  // 内容区配置
  showFooter?: boolean
  contentPadding?: string | boolean
  contentBackgroundColor?: string
  enablePullRefresh?: boolean
  enableLoadMore?: boolean

  // 底部导航配置
  footerTabs?: FooterTab[]
  footerBadge?: Record<string, number>
}

const props = withDefaults(defineProps<Props>(), {
  headerTitle: '',
  headerSubtitle: '',
  showHeader: true,
  showBack: true,
  showMenu: false,
  showSearch: false,
  headerBackgroundColor: '',
  headerTextColor: '',
  notificationCount: 0,
  showFooter: true,
  contentPadding: true,
  contentBackgroundColor: '',
  enablePullRefresh: false,
  enableLoadMore: false,
  footerTabs: () => [],
  footerBadge: () => ({})
})

const emit = defineEmits<{
  'back': []
  'menu-click': []
  'search': []
  'refresh': []
  'load-more': []
  'tab-change': [tab: string]
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('')

// 布局样式类
const layoutClasses = computed(() => ({
  'with-header': props.showHeader,
  'with-footer': props.showFooter,
  [`role-${userStore.user?.role || 'parent'}`]: true
}))

// 根据当前路由设置激活的标签
const updateActiveTab = () => {
  if (!props.footerTabs.length) return

  const currentPath = route.path
  const matchedTab = props.footerTabs.find(tab => tab.path && currentPath.includes(tab.path))
  if (matchedTab) {
    activeTab.value = matchedTab.name
  }
}

// 监听路由变化
watch(() => route.path, updateActiveTab, { immediate: true })

onMounted(() => {
  updateActiveTab()
  detectTheme()
  // 监听主题变化
  const observer = new MutationObserver(() => {
    detectTheme()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

// 事件处理
const handleBack = () => {
  emit('back')
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile/centers')
  }
}

const handleMenuClick = () => {
  emit('menu-click')
}

const handleSearch = () => {
  emit('search')
}

const handleRefresh = () => {
  emit('refresh')
}

const handleLoadMore = () => {
  emit('load-more')
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
  const selectedTab = props.footerTabs.find(t => t.name === tab)
  if (selectedTab?.path) {
    router.push(selectedTab.path)
  }
  emit('tab-change', tab)
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';
@import '@/styles/mobile-centers-theme.scss';

.base-mobile-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-page);
  position: relative;
  transition: all var(--transition-duration-base) var(--transition-timing-ease);

  // 角色主题色
  &.role-admin,
  &.role-principal {
    --theme-primary: var(--primary-color);
    --theme-light: var(--primary-light);
  }

  &.role-teacher {
    --theme-primary: var(--success-color);
    --theme-light: var(--success-light);
  }

  &.role-parent {
    --theme-primary: var(--warning-color);
    --theme-light: var(--warning-light);
  }

  // 确保布局容器占满整个视口
  &,
  & > * {
    box-sizing: border-box;
  }

  // 安全区域适配
  @supports (padding-top: env(safe-area-inset-top)) {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  // 中心点缀色主题（用于支持不同业务中心的主题色）
  &.theme-personnel {
    --layout-accent: var(--accent-personnel);
  }

  &.theme-enrollment {
    --layout-accent: var(--accent-enrollment);
  }

  &.theme-activity {
    --layout-accent: var(--accent-activity);
  }

  &.theme-marketing {
    --layout-accent: var(--accent-marketing);
  }

  &.theme-finance {
    --layout-accent: var(--success-color);
  }

  &.theme-system {
    --layout-accent: var(--accent-system);
  }

  &.theme-ai {
    --layout-accent: var(--accent-ai);
  }
}

// 响应式布局
@media (min-width: 768px) {
  .base-mobile-layout {
    max-width: var(--breakpoint-md);
    margin: 0 auto;
    box-shadow: var(--shadow-xl);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
  }
}

@media (min-width: 1024px) {
  .base-mobile-layout {
    max-width: var(--breakpoint-lg);
  }
}
</style>
