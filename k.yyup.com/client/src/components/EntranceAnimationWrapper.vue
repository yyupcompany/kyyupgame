<template>
  <Teleport to="body">
    <EntranceAnimations
      :show="showAnimation"
      :type="props.type"
      @complete="onAnimationComplete"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import EntranceAnimations from './animations/EntranceAnimations.vue'
import { setEntranceAnimationActive, setGlobalLoading } from '@/composables/useGlobalLoading'

interface Props {
  show?: boolean
  type?: 'random' | 'blocks' | 'gsap-cards' | 'particle-wave' | 'matrix-blocks' | 'helix-spiral' | 'cube-explosion' | 'liquid-flow' | 'neon-grid' | 'theme-adaptive'
  onComplete?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  type: 'random'
})

const showAnimation = ref(false)

const onAnimationComplete = () => {
  console.log('🎬 EntranceAnimationWrapper: 动画完成事件触发')

  // 立即执行，不延迟
  showAnimation.value = false
  // 通知全局状态管理入场动画结束
  setEntranceAnimationActive(false)

  if (props.onComplete) {
    console.log('🎬 EntranceAnimationWrapper: 调用父组件完成回调')
    props.onComplete()
  }
}

// 添加超时保护，防止动画卡住
watch(() => props.show, (newShow) => {
  if (newShow) {
    console.log('🎬 EntranceAnimationWrapper: 动画开始，设置超时保护')
    // 通知全局状态管理入场动画开始
    setEntranceAnimationActive(true)
    // 关闭可能存在的loading遮罩
    setGlobalLoading(false)

    // 如果动画在10秒内没有完成，强制完成
    setTimeout(() => {
      if (showAnimation.value) {
        console.log('🎬 EntranceAnimationWrapper: 超时强制完成动画')
        onAnimationComplete()
      }
    }, 10000)
  }
})

watch(() => props.show, (newShow) => {
  showAnimation.value = newShow
}, { immediate: true })
</script>

<style scoped>
/* 组件不需要样式，全部委托给内部组件 */
</style>