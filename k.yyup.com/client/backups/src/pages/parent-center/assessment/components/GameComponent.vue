<template>
  <div class="game-component">
    <div v-if="gameType === 'attention'" class="attention-game">
      <AttentionGame :config="parsedConfig" @answer="handleAnswer" />
    </div>
    <div v-else-if="gameType === 'memory'" class="memory-game">
      <MemoryGame :config="parsedConfig" @answer="handleAnswer" />
    </div>
    <div v-else-if="gameType === 'logic'" class="logic-game">
      <LogicGame :config="parsedConfig" @answer="handleAnswer" />
    </div>
    <div v-else class="default-game">
      <el-empty description="游戏类型暂未实现" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AttentionGame from './games/AttentionGame.vue'
import MemoryGame from './games/MemoryGame.vue'
import LogicGame from './games/LogicGame.vue'

const props = defineProps<{
  question: any
  gameConfig?: any
}>()

const emit = defineEmits<{
  answer: [value: any]
}>()

const gameType = computed(() => {
  const dimension = props.question?.dimension
  if (dimension === 'attention') return 'attention'
  if (dimension === 'memory') return 'memory'
  if (dimension === 'logic') return 'logic'
  return 'default'
})

// 解析配置（可能是JSON字符串或对象）
const parsedConfig = computed(() => {
  if (!props.gameConfig) return null
  
  // 如果是字符串，尝试解析JSON
  if (typeof props.gameConfig === 'string') {
    try {
      return JSON.parse(props.gameConfig)
    } catch (e) {
      console.warn('解析游戏配置失败:', e)
      return null
    }
  }
  
  // 如果已经是对象，直接返回
  return props.gameConfig
})

const handleAnswer = (answer: any) => {
  emit('answer', answer)
}
</script>

<style scoped lang="scss">
.game-component {
  min-height: 400px;
  width: 100%;
}
</style>

