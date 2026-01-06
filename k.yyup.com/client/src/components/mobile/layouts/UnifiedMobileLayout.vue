<template>
  <div class="unified-mobile-layout" :class="layoutClasses">
    <!-- 顶部导航栏 -->
    <MobilePageHeader
      v-if="showHeader"
      :title="pageTitle"
      :show-back="showBack"
      :tabs="pageTabs"
      :active-tab="activeTab"
      :right-actions="headerActions"
      @back="handleBack"
      @tab-change="handleTabChange"
      @action-click="handleActionClick"
    >
      <template #right>
        <slot name="header-right"></slot>
      </template>
    </MobilePageHeader>

    <!-- 主内容区域 -->
    <div
      class="layout-content"
      :class="contentClasses"
      :style="contentStyles"
    >
      <slot></slot>
    </div>

    <!-- 底部导航栏 -->
    <MobileTabBar
      v-if="showFooter"
      :tabs="footerTabs"
      :active-tab="activeFooterTab"
      @change="handleFooterChange"
    />

    <!-- 全局弹窗 -->
    <slot name="modals"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getMobileNavigationConfig,
  getPageMenus,
  getActiveBottomTab,
  getActivePageTab,
  shouldShowBottomNav,
  shouldShowPageTabs,
  type MobileTab,
  type MobilePageTab
} from '@/config/mobile-navigation.config'
import MobilePageHeader from './MobilePageHeader.vue'
import MobileTabBar from './MobileTabBar.vue'

// ==================== Props ====================

interface Props {
  pageTitle?: string
  showBack?: boolean
  showHeader?: boolean
  showFooter?: boolean
  contentPadding?: boolean
  role?: string
  headerActions?: Array<{
    name: string
    icon: string
    text?: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  showHeader: true,
  showFooter: true,
  contentPadding: true,
  role: 'parent',
  headerActions: () => []
})

// ==================== Emits ====================

interface Emits {
  (e: 'back'): void
  (e: 'tab-change', tab: string): void
  (e: 'footer-change', tab: string): void
  (e: 'action-click', action: string): void
}

const emit = defineEmits<Emits>()

// ==================== 路由 ====================

const route = useRoute()
const router = useRouter()

// ==================== 状态 ====================

const activeTab = ref<string>('')
const activeFooterTab = ref<string>('')

// ==================== 计算属性 ====================

// 获取导航配置
const navigationConfig = computed(() => {
  return getMobileNavigationConfig(props.role)
})

// 底部导航项
const footerTabs = computed<MobileTab[]>(() => {
  return navigationConfig.value.bottomTabs
})

// 页面顶部菜单项
const pageTabs = computed<MobilePageTab[]>(() => {
  if (!props.showHeader) return []
  return getPageMenus(route.path, props.role)
})

// 布局样式类
const layoutClasses = computed(() => {
  return {
    'with-header': props.showHeader,
    'with-footer': props.showFooter,
    'no-padding': !props.contentPadding,
    [`role-${props.role}`]: true
  }
})

// 内容区域样式类
const contentClasses = computed(() => {
  return {
    'no-header': !props.showHeader,
    'no-footer': !props.showFooter,
    'no-padding': !props.contentPadding
  }
})

// 内容区域样式
const contentStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.showHeader) {
    const headerHeight = '46px' // van-nav-bar 默认高度
    const tabsHeight = pageTabs.value.length > 1 ? '44px' : '0px'
    styles.paddingTop = `calc(${headerHeight} + ${tabsHeight} + 12px)`
  }

  if (props.showFooter) {
    const footerHeight = '50px' // van-tabbar 默认高度
    styles.paddingBottom = `calc(${footerHeight} + 12px)`
  }

  return styles
})

// ==================== 监听器 ====================

// 监听路由变化，更新激活状态
watch(() => route.path, (newPath) => {
  // 更新顶部菜单激活状态
  activeTab.value = getActivePageTab(newPath, props.role)

  // 更新底部导航激活状态
  activeFooterTab.value = getActiveBottomTab(newPath, props.role)
}, { immediate: true })

// ==================== 事件处理 ====================

// 处理返回
const handleBack = () => {
  emit('back')
  router.back()
}

// 处理顶部菜单切换
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  emit('tab-change', tabName)

  // 查找对应的路径并跳转
  const targetTab = pageTabs.value.find(tab => tab.name === tabName)
  if (targetTab && targetTab.path !== route.path) {
    router.push(targetTab.path)
  }
}

// 处理底部导航切换
const handleFooterChange = (tabName: string) => {
  activeFooterTab.value = tabName
  emit('footer-change', tabName)

  // 查找对应的路径并跳转
  const targetTab = footerTabs.value.find(tab => tab.name === tabName)
  if (targetTab && targetTab.path !== route.path) {
    router.push(targetTab.path)
  }
}

// 处理右上角操作点击
const handleActionClick = (actionName: string) => {
  emit('action-click', actionName)
}

// ==================== 暴露给父组件的方法 ====================

defineExpose({
  handleBack,
  handleTabChange,
  handleFooterChange
})
</script>

<style scoped>
.unified-mobile-layout {
  min-height: 100vh;
  background: var(--van-gray-1);
  position: relative;
}

.layout-content {
  min-height: calc(100vh - 46px);
  transition: padding 0.3s ease;
}

.layout-content.no-header {
  padding-top: 12px !important;
}

.layout-content.no-footer {
  padding-bottom: 12px !important;
}

.layout-content.no-padding {
  padding: 0 !important;
}

/* 角色特定样式 */
.unified-mobile-layout.role-parent {
  --local-primary: #1989FA;
}

.unified-mobile-layout.role-teacher {
  --local-primary: #07C160;
}

.unified-mobile-layout.role-principal,
.unified-mobile-layout.role-admin {
  --local-primary: #FF976A;
}

/* 优化滚动性能 */
.layout-content {
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}

/* 安全区域适配 */
@supports (bottom: env(safe-area-inset-bottom)) {
  .unified-mobile-layout.with-footer .layout-content {
    padding-bottom: calc(50px + env(safe-area-inset-bottom) + 12px);
  }
}

@supports (top: env(safe-area-inset-top)) {
  .unified-mobile-layout.with-header .layout-content {
    padding-top: calc(46px + env(safe-area-inset-top) + 12px);
  }
}
</style>
