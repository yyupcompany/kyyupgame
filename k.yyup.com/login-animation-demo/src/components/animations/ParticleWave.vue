<template>
  <div v-if="show" class="particle-wave-container">
    <!-- 粒子背景 -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 波浪动画 -->
    <div class="wave-container">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="content-container">
      <!-- 模块卡片 -->
      <div class="modules-grid">
        <div
          v-for="(module, index) in modules"
          :key="index"
          ref="moduleElements"
          class="module-card"
          :style="{ '--card-color': module.color }"
        >
          <div class="module-icon">{{ module.icon }}</div>
          <div class="module-name">{{ module.name }}</div>
          <div class="module-progress">
            <div class="progress-bar" :style="{ width: moduleProgress[index] + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 欢迎信息 -->
      <div class="welcome-section">
        <h1 ref="titleElement">{{ title }}</h1>
        <p ref="subtitleElement">{{ subtitle }}</p>
        <div class="loading-indicator">
          <span class="loading-text">系统准备中</span>
          <span class="loading-percentage">{{ Math.round(overallProgress) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'

interface Module {
  name: string
  icon: string
  color: string
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  modules?: Module[]
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '智能管理系统',
  subtitle: '正在为您打造最佳的工作环境',
  duration: 4000,
  modules: () => [
    { name: '招生管理', icon: '🎯', color: '#FF6B6B' },
    { name: '教学平台', icon: '📖', color: '#4ECDC4' },
    { name: '活动中心', icon: '🎉', color: '#45B7D1' },
    { name: '财务系统', icon: '💎', color: '#96CEB4' },
    { name: 'AI助手', icon: '🤖', color: '#FFEAA7' },
    { name: '数据分析', icon: '📊', color: '#DDA0DD' }
  ]
})

const emit = defineEmits<{
  complete: []
}>()

const particleCanvas = ref<HTMLCanvasElement>()
const moduleElements = ref<HTMLElement[]>([])
const titleElement = ref<HTMLElement>()
const subtitleElement = ref<HTMLElement>()
const moduleProgress = ref<number[]>([])
const overallProgress = ref(0)

// 粒子系统
let particles: any[] = []
let animationId: number

// 初始化粒子
const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  particles = []
  const particleCount = 100

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2
    })
  }

  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(particle => {
      particle.x += particle.vx
      particle.y += particle.vy

      // 边界检测
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

      // 绘制粒子
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
      ctx.fill()
    })

    animationId = requestAnimationFrame(animateParticles)
  }

  animateParticles()
}

// 开始动画
const startAnimation = async () => {
  await nextTick()

  // 初始化进度
  moduleProgress.value = new Array(props.modules.length).fill(0)

  const tl = gsap.timeline({
    onUpdate: () => {
      // 更新总体进度
      const totalProgress = moduleProgress.value.reduce((sum, progress) => sum + progress, 0)
      overallProgress.value = totalProgress / moduleProgress.value.length
    },
    onComplete: () => {
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  })

  // 标题动画
  tl.fromTo(titleElement.value,
    { opacity: 0, y: -50, rotationX: -90 },
    { opacity: 1, y: 0, rotationX: 0, duration: 1.2, ease: 'back.out(1.7)' }
  )
  .fromTo(subtitleElement.value,
    { opacity: 0, x: -100 },
    { opacity: 1, x: 0, duration: 1, ease: 'power2.out' },
    '-=0.8'
  )

  // 模块卡片动画
  moduleElements.value.forEach((module, index) => {
    const delay = index * 0.15

    // 卡片入场
    tl.fromTo(module,
      {
        opacity: 0,
        scale: 0,
        rotationY: -180,
        y: 100
      },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        y: 0,
        duration: 1,
        ease: 'back.out(1.7)',
        delay
      },
      '-=0.6'
    )

    // 进度条动画
    tl.to(moduleProgress.value, {
      [index]: 100,
      duration: 1.5,
      ease: 'power2.out',
      delay: delay + 0.5
    })

    // 悬浮动画
    tl.to(module, {
      y: -10,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      delay: delay + 2
    })
  })
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    initParticles()
    startAnimation()
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
})

onMounted(() => {
  if (props.show) {
    initParticles()
    startAnimation()
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (particleCanvas.value) {
      particleCanvas.value.width = window.innerWidth
      particleCanvas.value.height = window.innerHeight
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
.particle-wave-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  overflow: hidden;

  .wave {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200%;
    height: 100%;
    border-radius: 50%;
    opacity: 0.3;

    &.wave-1 {
      background: rgba(255, 255, 255, 0.1);
      animation: wave 8s infinite linear;
    }

    &.wave-2 {
      background: rgba(255, 255, 255, 0.08);
      animation: wave 12s infinite linear reverse;
      animation-delay: -2s;
    }

    &.wave-3 {
      background: rgba(255, 255, 255, 0.05);
      animation: wave 16s infinite linear;
      animation-delay: -4s;
    }
  }
}

@keyframes wave {
  0% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  50% {
    transform: translateX(-25%) translateY(-20px) rotate(180deg);
  }
  100% {
    transform: translateX(-50%) translateY(0) rotate(360deg);
  }
}

.content-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;

  .module-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1.5rem;
    padding: 2rem 1.5rem;
    text-align: center;
    transform-style: preserve-3d;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px) scale(1.05);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .module-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .module-name {
      color: white;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .module-progress {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      overflow: hidden;

      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--card-color), rgba(255, 255, 255, 0.8));
        border-radius: 3px;
        transition: width 0.3s ease;
        box-shadow: 0 0 10px var(--card-color);
      }
    }
  }
}

.welcome-section {
  text-align: center;
  color: white;

  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 1.4rem;
    opacity: 0.9;
    margin-bottom: 2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    font-size: 1.2rem;

    .loading-text {
      opacity: 0.8;
    }

    .loading-percentage {
      font-weight: 700;
      font-size: 1.4rem;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    .module-card {
      padding: 1.5rem 1rem;

      .module-icon {
        font-size: 2.5rem;
      }

      .module-name {
        font-size: 1rem;
      }
    }
  }

  .welcome-section {
    h1 {
      font-size: 2.5rem;
    }

    p {
      font-size: 1.2rem;
    }

    .loading-indicator {
      font-size: 1rem;

      .loading-percentage {
        font-size: 1.2rem;
      }
    }
  }
}
</style>