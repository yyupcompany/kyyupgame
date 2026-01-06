<!--
  AI助手页面入口

  功能：作为 /ai 路由的页面入口，直接引用重构后的 AIAssistant 组件

  路由路径：/ai
  权限要求：AI_ASSISTANT_USE

  说明：
  - 本文件是 /ai 路由的页面入口
  - 实际功能由 @/components/ai-assistant/AIAssistant.vue 实现
  - AIAssistant 是完整重构后的AI助手组件，包含155项功能
  - 当用户点击关闭按钮时，会自动跳转回 /dashboard

  相关文档：
  - docs/ai架构中心/ai助手前端页面重构架构.md
  - docs/ai架构中心/ai助手重构完成报告.md
  - client/src/components/ai-assistant/AIAssistant.vue
-->

<template>
  <div class="ai-assistant-page" data-testid="ai-assistant-page">
    <!-- 直接使用重构后的AI助手组件 -->
    <AIAssistant
      v-model:visible="visible"
      :is-fullscreen="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AIAssistant from '@/components/ai-assistant/AIAssistant.vue'

const router = useRouter()

// AI助手可见性状态（默认显示）
const visible = ref(true)

// 组件挂载时自动显示AI助手
onMounted(() => {
  visible.value = true
})

// 监听visible变化，当关闭时跳转回dashboard
watch(visible, (newValue) => {
  if (!newValue) {
    console.log('🔄 [AI助手] visible变为false，准备跳转回dashboard')
    // AI助手关闭，跳转回dashboard
    router.push('/dashboard')
  }
})
</script>

<style scoped lang="scss">
.ai-assistant-page {
  width: 100%;
  height: 100vh;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  
  // 确保AI助手组件占满整个页面
  :deep(.ai-assistant-wrapper) {
    width: 100%;
    height: 100%;
  }
}
</style>

