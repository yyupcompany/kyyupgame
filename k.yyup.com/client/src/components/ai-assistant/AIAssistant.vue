<!--
  AI 助手入口/路由组件
  根据 mode 参数选择显示侧边栏或全屏版本
  
  使用方式：
  1. 侧边栏模式：<AIAssistant mode="sidebar" v-model:visible="visible" />
  2. 全屏模式：<AIAssistant mode="fullpage" v-model:visible="visible" />
  3. 路由配置：
     {
       path: '/aiassistant',
       component: () => import('@/components/ai-assistant/AIAssistant.vue'),
       props: { mode: 'fullpage' }
     }
-->

<template>
  <component
    :is="currentComponent"
    v-bind="$attrs"
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AIAssistantSidebar from './AIAssistantSidebar.vue'
import AIAssistantFullPage from './AIAssistantFullPage.vue'

export type AIAssistantMode = 'sidebar' | 'fullpage'

interface Props {
  visible?: boolean
  mode?: AIAssistantMode
}

interface Emits {
  'update:visible': [value: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  mode: 'sidebar'
})

const emit = defineEmits<Emits>()

// 根据 mode 参数选择要显示的组件
const currentComponent = computed(() => {
  return props.mode === 'sidebar' ? AIAssistantSidebar : AIAssistantFullPage
})
</script>

<style scoped>
/* 入口组件不需要样式 */
</style>

