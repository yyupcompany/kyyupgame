<template>
  <div class="mobile-page-header">
    <!-- 导航栏 -->
    <van-nav-bar
      v-if="showNavBar"
      :title="title"
      :left-arrow="showBack"
      :border="false"
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      class="page-nav-bar"
      @click-left="handleBack"
    >
      <template #right>
        <slot name="right">
          <van-icon
            v-if="rightActions.length > 0"
            :name="rightActions[0].icon"
            size="18"
            @click="handleActionClick(rightActions[0].name)"
          />
        </slot>
      </template>
    </van-nav-bar>

    <!-- 页面顶部横向滚动菜单 -->
    <van-tabs
      v-if="tabs.length > 1"
      v-model:active="activeTab"
      :swipeable="true"
      :animated="true"
      :ellipsis="false"
      :line-width="20"
      :lazy-render="true"
      class="page-tabs"
      @change="handleTabChange"
    >
      <van-tab
        v-for="tab in tabs"
        :key="tab.name"
        :title="tab.title"
        :name="tab.name"
        :disabled="tab.disabled"
      />
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { MobilePageTab } from '@/config/mobile-navigation.config'

// ==================== Props ====================

interface Props {
  title?: string
  showBack?: boolean
  tabs?: MobilePageTab[]
  activeTab?: string
  rightActions?: Array<{
    name: string
    icon: string
    text?: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  tabs: () => [],
  activeTab: '',
  rightActions: () => []
})

// ==================== Emits ====================

interface Emits {
  (e: 'back'): void
  (e: 'tab-change', tab: string): void
  (e: 'action-click', action: string): void
}

const emit = defineEmits<Emits>()

// ==================== 状态 ====================

const localActiveTab = ref<string>(props.activeTab || props.tabs[0]?.name || '')

// ==================== 计算属性 ====================

const showNavBar = computed(() => {
  return props.title !== '' || props.showBack || props.rightActions.length > 0
})

// ==================== 监听器 ====================

watch(() => props.activeTab, (newVal) => {
  if (newVal) {
    localActiveTab.value = newVal
  }
})

// ==================== 事件处理 ====================

const handleBack = () => {
  emit('back')
}

const handleTabChange = (tabName: string) => {
  localActiveTab.value = tabName
  emit('tab-change', tabName)
}

const handleActionClick = (actionName: string) => {
  emit('action-click', actionName)
}
</script>

<style scoped>
.mobile-page-header {
  position: relative;
  z-index: 100;
  background: #fff;
}

.page-nav-bar {
  --van-nav-bar-height: 46px;
  --van-nav-bar-background: #fff;
  --van-nav-bar-title-text-color: var(--van-text-color);
  --van-nav-bar-title-font-size: var(--text-base);
  --van-nav-bar-icon-color: var(--van-text-color);
  --van-nav-bar-text-color: var(--van-primary-color);
}

.page-tabs {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  z-index: 99;
  background: #fff;
  --van-tabs-nav-background: #fff;
  --van-tab-font-size: var(--text-sm);
  --van-tab-text-color: var(--van-text-color-2);
  --van-tab-active-text-color: var(--van-primary-color);
  --van-tabs-bottom-bar-color: var(--van-primary-color);
}

.page-tabs :deep(.van-tabs__wrap) {
  padding: 0 12px;
}

.page-tabs :deep(.van-tabs__nav) {
  padding-bottom: 0;
}

.page-tabs :deep(.van-tab) {
  flex: 0 0 auto;
  padding: 0 16px;
}

.page-tabs :deep(.van-tab--disabled) {
  color: var(--van-text-color-3);
}
</style>
