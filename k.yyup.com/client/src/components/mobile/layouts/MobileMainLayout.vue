<template>
  <div class="mobile-main-layout" :data-theme="currentTheme">
    <!-- 顶部导航栏 -->
    <MobileHeader
      v-if="showHeader"
      :title="title"
      :show-back="showBack"
      :show-menu="showMenu"
      :right-actions="headerActions"
      @back="handleBack"
      @menu-click="handleMenuClick"
    >
      <template #right v-if="$slots.headerRight">
        <slot name="headerRight"></slot>
      </template>
    </MobileHeader>

    <!-- 主内容区域 -->
    <MobileMainContent
      :with-header="showHeader"
      :with-footer="canShowFooter"
      :padding="contentPadding"
    >
      <slot></slot>
    </MobileMainContent>

    <!-- 新的底部导航栏（5个核心Tab） -->
    <MobileFooter
      v-if="canShowFooter"
      :tabs="sortedBottomTabs"
      :active-tab="activeTab"
      :use-safe-area="true"
      :enable-animation="true"
      @tab-change="handleTabChange"
      @tab-click="handleTabClick"
    />

    <!-- 抽屉菜单（点击"更多"Tab打开） -->
    <MobileDrawer
      v-model:visible="drawerVisible"
      :show-user-info="true"
      :show-logout-button="true"
      :use-safe-area="true"
      @item-click="handleDrawerItemClick"
      @logout="handleLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import MobileHeader from './MobileHeader.vue'
import MobileMainContent from './MobileMainContent.vue'
import MobileFooter from './MobileFooter.vue'
import MobileDrawer from '../navigation/MobileDrawer.vue'
import type { BottomTab } from '@/config/mobile-navigation.types'
import type { DrawerMenuItem } from '@/config/mobile-navigation.types'
import { getSortedBottomTabs, getActiveBottomTab, shouldShowBottomNav } from '@/config/mobile-navigation.config'

interface HeaderAction {
  icon: string
  text?: string
  action: string
  badge?: number
}

interface Props {
  title?: string
  showHeader?: boolean
  showBack?: boolean
  showMenu?: boolean
  showFooter?: boolean
  contentPadding?: string
  headerActions?: HeaderAction[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showHeader: true,
  showBack: true,
  showMenu: false,
  showFooter: true,
  contentPadding: 'var(--app-gap)',
  headerActions: () => []
})

const emit = defineEmits<{
  'back': []
  'menu-click': [action: string]
  'tab-change': [tab: BottomTab]
  'drawer-item-click': [item: DrawerMenuItem]
  'logout': []
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

const activeTab = ref('')
const drawerVisible = ref(false)

// 当前主题
const currentTheme = computed(() => themeStore.currentTheme)

// 当前用户角色
const userRole = computed(() => userStore.user?.role || 'parent')

// 获取排序后的底部导航（5个核心Tab）
const sortedBottomTabs = computed(() => getSortedBottomTabs(userRole.value))

// 当前是否应该显示底部导航
const canShowFooter = computed(() => {
  return props.showFooter && shouldShowBottomNav(route.path)
})

// 根据当前路由设置激活的标签
const updateActiveTab = () => {
  activeTab.value = getActiveBottomTab(route.path, userRole.value)
}

// 监听路由变化
watch(() => route.path, updateActiveTab, { immediate: true })

onMounted(() => {
  updateActiveTab()
})

// 事件处理
const handleBack = () => {
  emit('back')
}

const handleMenuClick = (action: string) => {
  emit('menu-click', action)
}

const handleTabChange = (tabId: string) => {
  // 找到对应的Tab对象
  const tab = sortedBottomTabs.value.find(t => t.id === tabId)
  if (tab) {
    emit('tab-change', tab)

    // 如果是"更多"Tab，打开抽屉菜单
    if (tab.id === 'more') {
      drawerVisible.value = true
    }
  }
}

const handleTabClick = (tab: BottomTab, event: Event) => {
  emit('tab-change', tab)
}

const handleDrawerItemClick = (item: DrawerMenuItem) => {
  emit('drawer-item-click', item)
  // 导航已经在组件内部处理
}

const handleLogout = () => {
  emit('logout')
}
</script>

<style lang="scss" scoped>
// 导入设计令牌和全局样式
@import '@/styles/design-tokens.scss';

.mobile-main-layout {
  min-height: 100vh;
  background-color: var(--bg-color-page);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-duration-base) var(--transition-timing-ease);

  // 明暗主题适配
  &[data-theme="dark"] {
    background-color: var(--bg-color-page-dark);
    color: var(--text-primary);
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
}

// 响应式布局
@media (min-width: 768px) {
  .mobile-main-layout {
    max-width: var(--breakpoint-md);
    margin: 0 auto;
    box-shadow: var(--shadow-xl);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
  }
}

@media (min-width: 1024px) {
  .mobile-main-layout {
    max-width: var(--breakpoint-lg);
  }
}
</style>
