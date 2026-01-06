<template>
  <BaseMobileLayout
    v-bind="$attrs"
    :footer-tabs="adminFooterTabs"
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
  activeTab: 'admin-dashboard',
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

// 管理员端底部导航配置 - 对应PC端侧边栏的一级菜单
const adminFooterTabs: FooterTab[] = [
  {
    name: 'admin-dashboard',
    title: '仪表板',
    icon: 'dashboard-o',
    path: '/mobile/dashboard'
  },
  {
    name: 'admin-centers',
    title: '管理中心',
    icon: 'apps-o',
    path: '/mobile/centers'
  },
  {
    name: 'admin-teacher',
    title: '教师中心',
    icon: 'friends-o',
    path: '/mobile/teacher-center'
  },
  {
    name: 'admin-parent',
    title: '家长中心',
    icon: 'contact-o',
    path: '/mobile/parent-center'
  },
  {
    name: 'admin-profile',
    title: '我的',
    icon: 'user-o',
    path: '/mobile/centers/user-center'
  }
]

// 处理 Tab 切换
const handleTabChange = (tab: string) => {
  emit('tab-change', tab)
}
</script>
