<template>
  <BaseMobileLayout
    v-bind="$attrs"
    :footer-tabs="parentFooterTabs"
    :footer-badge="footerBadge"
    v-model:active-tab="internalActiveTab"
  >
    <template #default>
      <slot></slot>
    </template>

    <template #header-right v-if="$slots.headerRight">
      <slot name="headerRight"></slot>
    </template>
  </BaseMobileLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseMobileLayout, { type FooterTab } from './BaseMobileLayout.vue'

interface Props {
  activeTab?: string
  footerBadge?: Record<string, number>
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'parent-dashboard',
  footerBadge: () => ({})
})

const emit = defineEmits<{
  'update:activeTab': [value: string]
  'tab-change': [tab: string]
}>()

// 内部状态
const internalActiveTab = ref(props.activeTab)

// 监听外部变化
watch(() => props.activeTab, (newVal) => {
  if (newVal && newVal !== internalActiveTab.value) {
    internalActiveTab.value = newVal
  }
})

// 监听内部变化并同步到外部
watch(internalActiveTab, (newVal) => {
  emit('update:activeTab', newVal)
})

// 家长端底部导航配置 - 对应PC端侧边栏的一级菜单
const parentFooterTabs: FooterTab[] = [
  {
    name: 'parent-dashboard',
    title: '仪表板',
    icon: 'dashboard-o',
    path: '/mobile/dashboard'
  },
  {
    name: 'parent-center',
    title: '家长中心',
    icon: 'contact-o',
    path: '/mobile/parent-center'
  },
  {
    name: 'parent-children',
    title: '孩子',
    icon: 'friends-o',
    path: '/mobile/parent-center/children'
  },
  {
    name: 'parent-communication',
    title: '沟通',
    icon: 'comment-o',
    path: '/mobile/parent-center/communication',
    badge: props.footerBadge?.communication || 0
  },
  {
    name: 'parent-profile',
    title: '我的',
    icon: 'user-o',
    path: '/mobile/parent-center/profile'
  }
]

// 处理 Tab 切换
const handleTabChange = (tab: string) => {
  emit('tab-change', tab)
}
</script>
