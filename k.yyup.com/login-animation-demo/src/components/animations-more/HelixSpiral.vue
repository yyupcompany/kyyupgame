<template>
  <div v-if="show" class="helix-spiral-container">
    <!-- 背景星空 -->
    <canvas ref="starCanvas" class="star-canvas"></canvas>

    <!-- 螺旋旋转容器 -->
    <div class="spiral-container" ref="spiralContainer">
      <div
        v-for="(item, index) in spiralItems"
        :key="index"
        class="spiral-item"
        :style="{
          transform: `rotateY(${item.rotation}deg) translateZ(${item.radius}px) rotateX(${item.tilt}deg)`,
          opacity: item.opacity,
          animationDelay: `${index * 0.1}s`,
          backgroundColor: item.color
        }"
      >
        <div class="item-content">
          <div class="item-icon">{{ item.icon }}</div>
          <div class="item-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 中心信息 -->
    <div class="center-info">
      <h1 ref="titleElement" class="main-title">{{ title }}</h1>
      <p ref="subtitleElement" class="subtitle">{{ subtitle }}</p>

      <!-- 螺旋进度条 -->
      <div class="spiral-progress">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <!-- 螺旋路径 -->
          <path
            ref="spiralPath"
            d="M 100 100 m -80 0 a 80 80 0 1 1 160 0 a 60 60 0 1 0 -120 0 a 40 40 0 1 1 80 0"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            stroke-width="8"
            stroke-linecap="round"
          />
          <!-- 动画路径 -->
          <path
            ref="animatedPath"
            d="M 100 100 m -80 0 a 80 80 0 1 1 160 0 a 60 60 0 1 0 -120 0 a 40 40 0 1 1 80 0"
            fill="none"
            stroke="url(#spiralGradient)"
            stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray="500"
            :stroke-dashoffset="500 - (progress * 5)"
          />
          <defs>
            <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ff006e" />
              <stop offset="50%" stop-color="#8338ec" />
              <stop offset="100%" stop-color="#3a86ff" />
            </linearGradient>
          </defs>
        </svg>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'

interface SpiralItem {
  label: string
  icon: string
  color: string
  rotation: number
  radius: number
  tilt: number
  opacity: number
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  items?: { label: string; icon: string; color: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '智能管理系统',
  subtitle: '正在为您构建数字化工作空间',
  duration: 5000,
  items: () => [
    { label: 'AI智能助手', icon: '🤖', color: '#FF006E' },
    { label: '招生管理系统', icon: '🎯', color: '#FB5607' },
    { label: '教学资源中心', icon: '📚', color: '#FFBE0B' },
    { label: '活动策划平台', icon: '🎪', color: '#8338EC' },
    { label: '财务管理工具', icon: '💎', color: '#3A86FF' },
    { label: '数据分析引擎', icon: '📊', color: '#06FFB4' },
    { label: '家长互动门户', icon: '👨‍👩‍👧‍👦', color: '#FF4365' },
    { label: '教师协作空间', icon: '👥', color: '#00D9FF' }
  ]
})

const emit = defineEmits<{
  complete: []
}>()

const starCanvas = ref<HTMLCanvasElement>()
const spiralContainer = ref<HTMLElement>()
const titleElement = ref<HTMLElement>()
const subtitleElement = ref<HTMLElement>()
const animatedPath = ref<SVGPathElement>()
const spiralPath = ref<SVGPathElement>()

const spiralItems = ref<SpiralItem[]>([])
const progress = ref(0)

// 星空背景
let stars: any[] = []
let animationId: number

// 初始化星空
const initStars = () => {
  const canvas = starCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  stars = []
  const starCount = 200

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      alpha: Math.random() * 0.8 + 0.2
    })
  }

  const animateStars = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    stars.forEach(star => {
      star.x += star.vx
      star.y += star.vy

      if (star.x < 0) star.x = canvas.width
      if (star.x > canvas.width) star.x = 0
      if (star.y < 0) star.y = canvas.height
      if (star.y > canvas.height) star.y = 0

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
      ctx.fill()
    })

    animationId = requestAnimationFrame(animateStars)
  }

  animateStars()
}

// 初始化螺旋项目
const initSpiralItems = () => {
  spiralItems.value = props.items.map((item, index) => ({
    ...item,
    rotation: index * 45,
    radius: 300,
    tilt: 15,
    opacity: 0
  }))
}

// 开始动画
const startAnimation = async () => {
  await nextTick()
  initSpiralItems()

  const tl = gsap.timeline({
    onUpdate: () => {
      const duration = props.duration / 1000
      const currentProgress = (tl.time() / duration) * 100
      progress.value = Math.min(currentProgress, 100)
    },
    onComplete: () => {
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  })

  // 标题动画
  tl.fromTo(titleElement.value,
    { opacity: 0, y: -100, rotationX: -90 },
    { opacity: 1, y: 0, rotationX: 0, duration: 1.5, ease: 'back.out(1.7)' }
  )
  .fromTo(subtitleElement.value,
    { opacity: 0, x: -150, rotationY: 45 },
    { opacity: 1, x: 0, rotationY: 0, duration: 1.2, ease: 'power2.out' },
    '-=1.2'
  )

  // 螺旋容器旋转
  tl.to(spiralContainer.value,
    {
      rotationY: 720,
      duration: props.duration / 1000,
      ease: 'power1.inOut'
    },
    0
  )

  // 螺旋项目动画
  spiralItems.value.forEach((item, index) => {
    const delay = index * 0.15

    // 入场动画
    tl.to(item,
      {
        opacity: 1,
        radius: 200,
        tilt: 0,
        duration: 1,
        ease: 'back.out(1.7)',
        delay
      },
      '-=1'
    )

    // 悬浮动画
    tl.to(item,
      {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: delay + 1
      },
      '-=0.5'
    )
  })

  // 螺旋进度动画
  tl.to(progress,
    {
      value: 100,
      duration: props.duration / 1000,
      ease: 'power2.out'
    },
    0
  )

  // 最终收缩
  tl.to(spiralItems.value,
    {
      radius: 50,
      opacity: 0.5,
      duration: 1,
      ease: 'power2.in'
    },
    `-=${1 / 2}`
  )
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    initStars()
    startAnimation()
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
})

onMounted(() => {
  if (props.show) {
    initStars()
    startAnimation()
  }

  window.addEventListener('resize', () => {
    if (starCanvas.value) {
      starCanvas.value.width = window.innerWidth
      starCanvas.value.height = window.innerHeight
    }
  })
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped lang="scss">
.helix-spiral-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #1a0033 0%, #000011 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  perspective: 1500px;
}

.star-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.spiral-container {
  position: relative;
  width: 600px;
  height: 600px;
  transform-style: preserve-3d;
}

.spiral-item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  margin: -60px 0 0 -60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  transition: all 0.5s ease;

  .item-content {
    text-align: center;
    color: white;
    transform: translateZ(20px);

    .item-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      filter: drop-shadow(0 0 10px currentColor);
    }

    .item-label {
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0.9;
    }
  }
}

.center-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;

  .main-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(255, 0, 110, 0.5);
  }

  .subtitle {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 3rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .spiral-progress {
    position: relative;
    width: 200px;
    height: 200px;
    margin: 0 auto;

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.8rem;
      font-weight: 700;
      color: white;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }
  }
}

@media (max-width: 768px) {
  .spiral-container {
    width: 400px;
    height: 400px;
  }

  .spiral-item {
    width: 100px;
    height: 100px;
    margin: -50px 0 0 -50px;

    .item-content {
      .item-icon {
        font-size: 1.5rem;
      }

      .item-label {
        font-size: 0.7rem;
      }
    }
  }

  .center-info {
    .main-title {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1.1rem;
    }

    .spiral-progress {
      width: 150px;
      height: 150px;

      .progress-text {
        font-size: 1.4rem;
      }
    }
  }
}
</style>