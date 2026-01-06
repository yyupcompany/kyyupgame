<template>
  <Teleport to="body">
    <EntranceAnimations
      :show="showAnimation"
      :type="animationType"
      @complete="onAnimationComplete"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EntranceAnimations from './animations/EntranceAnimations.vue'

interface Props {
  show?: boolean
  type?: 'random' | 'blocks' | 'gsap-cards' | 'particle-wave' | 'matrix-blocks' | 'helix-spiral' | 'cube-explosion' | 'liquid-flow' | 'neon-grid'
  onComplete?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  type: 'random'
})

const showAnimation = ref(false)

const onAnimationComplete = () => {
  setTimeout(() => {
    showAnimation.value = false
    if (props.onComplete) {
      props.onComplete()
    }
  }, 500)
}

watch(() => props.show, (newShow) => {
  showAnimation.value = newShow
}, { immediate: true })
</script>

<style scoped>
/* 组件不需要样式，全部委托给内部组件 */
</style>