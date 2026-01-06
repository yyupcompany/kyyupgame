<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, watch } from 'vue'

// 图标系统类型定义
type IconSystemType = 'modern' | 'colorful' | 'handdrawn'

// 图标系统状态
const iconSystem = ref<IconSystemType>('modern')

// 从 localStorage 读取保存的图标系统设置
const loadIconSystem = () => {
  const saved = localStorage.getItem('app_icon_system') as IconSystemType
  if (saved && ['modern', 'colorful', 'handdrawn'].includes(saved)) {
    iconSystem.value = saved
  } else {
    // 默认使用 modern 系统
    iconSystem.value = 'modern'
    localStorage.setItem('app_icon_system', 'modern')
  }
}

// 提供图标系统给子组件
provide('iconSystem', iconSystem)

// 切换图标系统的方法
const setIconSystem = (system: IconSystemType) => {
  iconSystem.value = system
  localStorage.setItem('app_icon_system', system)
}

// 提供切换方法给全局使用
provide('setIconSystem', setIconSystem)

// 监听系统主题变化，自动调整图标系统
const handleThemeChange = () => {
  const theme = document.documentElement.getAttribute('data-theme')
  if (theme === 'dark') {
    // 暗色主题下可以使用 colorful 系统以获得更好的对比度
    if (iconSystem.value === 'modern') {
      iconSystem.value = 'colorful'
    }
  } else {
    // 亮色主题下使用 modern 系统
    iconSystem.value = 'modern'
  }
}

onMounted(() => {
  loadIconSystem()

  // 监听主题变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        handleThemeChange()
      }
    })
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

// 监听图标系统变化并保存
watch(iconSystem, (newSystem) => {
  localStorage.setItem('app_icon_system', newSystem)
}, { immediate: false })
</script>

<style lang="scss" scoped>
/* 图标系统提供者组件不需要样式 */
</style>