<template>
  <div v-if="show" class="gsap-cards-container">
    <!-- GSAP 3D卡片动画 -->
    <div class="cards-container">
      <div
        v-for="(card, index) in cards"
        :key="index"
        ref="cardElements"
        class="card-3d"
        :data-index="index"
      >
        <div class="card-face card-front">
          <div class="card-icon">{{ card.icon }}</div>
          <div class="card-title">{{ card.title }}</div>
        </div>
        <div class="card-face card-back">
          <div class="card-description">{{ card.description }}</div>
          <div class="card-progress">
            <div class="progress-ring" :style="{ strokeDasharray: `${cardProgress[index]} 251.2` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中心信息 -->
    <div class="center-info">
      <h1 ref="titleElement">{{ title }}</h1>
      <p ref="subtitleElement">{{ subtitle }}</p>
      <div class="loading-dots">
        <span v-for="i in 3" :key="i" class="dot" :style="{ animationDelay: `${i * 0.2}s` }"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'

interface Card {
  title: string
  icon: string
  color: string
  description: string
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  cards?: Card[]
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '欢迎回来',
  subtitle: '正在加载您的个性化设置',
  duration: 3500,
  cards: () => [
    { title: '招生中心', icon: '🎓', color: '#4CAF50', description: '智能招生管理' },
    { title: '教学平台', icon: '📚', color: '#2196F3', description: '现代化教学工具' },
    { title: '活动管理', icon: '🎪', color: '#FF9800', description: '丰富的活动策划' },
    { title: '财务系统', icon: '💰', color: '#9C27B0', description: '专业财务管理' },
    { title: 'AI助手', icon: '🤖', color: '#00BCD4', description: '智能服务支持' },
    { title: '数据分析', icon: '📊', color: '#F44336', description: '深度数据洞察' }
  ]
})

const emit = defineEmits<{
  complete: []
}>()

const cardElements = ref<HTMLElement[]>([])
const titleElement = ref<HTMLElement>()
const subtitleElement = ref<HTMLElement>()
const cardProgress = ref<number[]>([])

// 初始化进度
const initializeProgress = () => {
  cardProgress.value = new Array(props.cards.length).fill(0)
}

// 开始GSAP动画
const startGSAPAnimation = async () => {
  await nextTick()
  initializeProgress()

  const tl = gsap.timeline({
    onComplete: () => {
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  })

  // 标题动画
  tl.fromTo(titleElement.value,
    { opacity: 0, y: -50, scale: 0.8 },
    { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.7)' }
  )
  .fromTo(subtitleElement.value,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
    '-=0.5'
  )

  // 卡片动画
  cardElements.value.forEach((card, index) => {
    const cardData = props.cards[index]
    const delay = index * 0.1

    // 卡片入场动画
    tl.fromTo(card,
      {
        opacity: 0,
        rotationY: -90,
        scale: 0.5,
        z: -200
      },
      {
        opacity: 1,
        rotationY: 0,
        scale: 1,
        z: 0,
        duration: 1,
        ease: 'back.out(1.7)',
        delay
      },
      '-=0.8'
    )

    // 卡片悬停和翻转动画
    tl.to(card, {
      rotationY: 360,
      duration: 1.5,
      ease: 'power2.inOut',
      delay: delay + 0.5
    })

    // 进度环动画
    tl.to(cardProgress.value, {
      [index]: 251.2,
      duration: 1,
      ease: 'power2.out',
      delay: delay + 1,
      onUpdate: () => {
        const progress = (cardProgress.value[index] / 251.2) * 100
        cardProgress.value[index] = (progress / 100) * 251.2
      }
    })
  })

  // 最终收缩动画
  tl.to(cardElements.value, {
    scale: 0.8,
    opacity: 0.3,
    duration: 0.5,
    ease: 'power2.in'
  }, '+=0.5')
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    startGSAPAnimation()
  }
})

onMounted(() => {
  if (props.show) {
    startGSAPAnimation()
  }
})
</script>

<style scoped lang="scss">
.gsap-cards-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #1a2a6c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  perspective: 1500px;
  overflow: hidden;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
  max-width: 800px;
}

.card-3d {
  width: 180px;
  height: 200px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: rotateY(180deg) scale(1.05);
  }
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-front {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;

  .card-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
  }
}

.card-back {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: rotateY(180deg);
  color: white;
  text-align: center;

  .card-description {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    opacity: 0.9;
  }
}

.card-progress {
  position: relative;
  width: 60px;
  height: 60px;

  .progress-ring {
    width: 100%;
    height: 100%;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top: 3px solid white;
    border-radius: 50%;
    transform: rotate(-90deg);
    transition: stroke-dasharray 0.3s ease;
  }
}

.center-info {
  text-align: center;
  color: white;
  z-index: 10;

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 1.3rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  .loading-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;

    .dot {
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 90%;
  }

  .card-3d {
    width: 140px;
    height: 160px;
  }

  .card-face {
    padding: 1rem;

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .card-title {
      font-size: 1rem;
    }
  }

  .center-info {
    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1.1rem;
    }
  }
}
</style>