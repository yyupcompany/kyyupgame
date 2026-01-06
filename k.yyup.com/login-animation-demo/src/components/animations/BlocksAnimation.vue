<template>
  <div v-if="show" class="blocks-animation-container">
    <!-- 3D方块动画 -->
    <div class="blocks-container">
      <div
        v-for="(block, index) in blocks"
        :key="index"
        class="block-3d"
        :style="{
          transform: `rotateY(${block.rotation}deg) translateZ(${block.translateZ}px)`,
          opacity: block.opacity,
          animationDelay: `${index * 100}ms`,
          backgroundColor: block.color
        }"
      >
        <div class="block-content">
          <div class="block-icon">{{ block.icon }}</div>
          <div class="block-text">{{ block.text }}</div>
        </div>
      </div>
    </div>

    <!-- 中心进度条 -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="progress-text">{{ Math.round(progress) }}%</div>
    </div>

    <!-- 标题 -->
    <div class="animation-title">
      <h2>{{ title }}</h2>
      <p>{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Block {
  text: string
  icon: string
  color: string
  rotation: number
  translateZ: number
  opacity: number
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  blocks?: { text: string; icon: string; color: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '欢迎使用系统',
  subtitle: '正在为您准备最佳体验...',
  duration: 3000,
  blocks: () => [
    { text: '招生管理', icon: '🎓', color: '#4CAF50' },
    { text: '教学中心', icon: '📚', color: '#2196F3' },
    { text: '活动管理', icon: '🎪', color: '#FF9800' },
    { text: '财务中心', icon: '💰', color: '#9C27B0' },
    { text: 'AI助手', icon: '🤖', color: '#00BCD4' },
    { text: '系统设置', icon: '⚙️', color: '#607D8B' }
  ]
})

const emit = defineEmits<{
  complete: []
}>()

const progress = ref(0)
const blocks = ref<Block[]>([])

// 初始化方块
const initializeBlocks = () => {
  blocks.value = props.blocks.map((block, index) => ({
    ...block,
    rotation: 0,
    translateZ: -200,
    opacity: 0
  }))
}

// 开始动画
const startAnimation = () => {
  initializeBlocks()

  // 方块旋转入场动画
  setTimeout(() => {
    blocks.value = blocks.value.map((block, index) => ({
      ...block,
      rotation: 360,
      translateZ: 0,
      opacity: 1
    }))
  }, 100)

  // 进度条动画
  const startTime = Date.now()
  const animateProgress = () => {
    const elapsed = Date.now() - startTime
    const percentage = Math.min((elapsed / props.duration) * 100, 100)
    progress.value = percentage

    if (percentage < 100) {
      requestAnimationFrame(animateProgress)
    } else {
      // 动画完成
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  }
  animateProgress()
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    startAnimation()
  }
})

onMounted(() => {
  if (props.show) {
    startAnimation()
  }
})
</script>

<style scoped lang="scss">
.blocks-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  perspective: 1000px;
}

.blocks-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 4rem;
  transform-style: preserve-3d;
}

.block-3d {
  width: 120px;
  height: 120px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: rotateY(360deg) translateZ(20px) scale(1.1);
  }

  .block-content {
    text-align: center;
    color: white;

    .block-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .block-text {
      font-size: 0.9rem;
      font-weight: 600;
      opacity: 0.9;
    }
  }
}

.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;

  .progress-bar {
    width: 300px;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #fff, #f0f0f0);
      border-radius: 3px;
      transition: width 0.3s ease;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
  }

  .progress-text {
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
  }
}

.animation-title {
  text-align: center;
  color: white;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotateY(360deg) translateZ(0px);
  }
  50% {
    transform: translateY(-10px) rotateY(360deg) translateZ(10px);
  }
}

@media (max-width: 768px) {
  .blocks-container {
    flex-wrap: wrap;
    gap: 1rem;
    max-width: 90%;
  }

  .block-3d {
    width: 100px;
    height: 100px;

    .block-content {
      .block-icon {
        font-size: 2rem;
      }

      .block-text {
        font-size: 0.8rem;
      }
    }
  }

  .progress-container {
    .progress-bar {
      width: 200px;
    }
  }

  .animation-title {
    h2 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1rem;
    }
  }
}
</style>