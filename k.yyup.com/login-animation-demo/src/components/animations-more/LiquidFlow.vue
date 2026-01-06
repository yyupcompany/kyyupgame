<template>
  <div v-if="show" class="liquid-flow-container">
    <!-- 液体流动背景 -->
    <canvas ref="liquidCanvas" class="liquid-canvas"></canvas>

    <!-- 液体形状 -->
    <div class="liquid-shapes" ref="liquidShapesContainer">
      <div
        v-for="(shape, index) in liquidShapes"
        :key="index"
        ref="shapeElements"
        class="liquid-shape"
        :class="shape.type"
        :style="{
          backgroundColor: shape.color,
          width: shape.size + 'px',
          height: shape.size + 'px',
          borderRadius: shape.borderRadius,
          left: shape.x + 'px',
          top: shape.y + 'px',
          transform: `scale(${shape.scale}) rotate(${shape.rotation}deg)`,
          opacity: shape.opacity
        }"
      ></div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 模块气泡 -->
      <div class="bubbles-container" ref="bubblesContainer">
        <div
          v-for="(bubble, index) in bubbles"
          :key="index"
          ref="bubbleElements"
          class="module-bubble"
          :style="{
            backgroundColor: bubble.color,
            transform: `translate(${bubble.x}px, ${bubble.y}px) scale(${bubble.scale})`,
            opacity: bubble.opacity
          }"
        >
          <div class="bubble-content">
            <div class="bubble-icon">{{ bubble.icon }}</div>
            <div class="bubble-label">{{ bubble.label }}</div>
          </div>
          <div class="bubble-wave" :style="{ animationDelay: `${index * 0.2}s` }"></div>
        </div>
      </div>

      <!-- 文字信息 -->
      <div class="text-content">
        <h1 ref="titleElement" class="flow-title">{{ title }}</h1>
        <p ref="subtitleElement" class="flow-subtitle">{{ subtitle }}</p>

        <!-- 液体进度条 -->
        <div class="liquid-progress">
          <div class="progress-container">
            <div class="progress-liquid" :style="{ height: liquidProgress + '%' }">
              <div class="liquid-surface">
                <div class="wave wave-1"></div>
                <div class="wave wave-2"></div>
              </div>
            </div>
            <div class="progress-text">{{ Math.round(liquidProgress) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'

interface LiquidShape {
  type: string
  color: string
  size: number
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
}

interface Bubble {
  label: string
  icon: string
  color: string
  x: number
  y: number
  scale: number
  opacity: number
  targetX: number
  targetY: number
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  modules?: { label: string; icon: string; color: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '智能流体系统',
  subtitle: '正在为您构建无缝体验',
  duration: 4500,
  modules: () => [
    { label: 'AI智能核心', icon: '🧠', color: '#FF006E' },
    { label: '数据流引擎', icon: '💫', color: '#FB5607' },
    { label: '用户界面', icon: '🎨', color: '#FFBE0B' },
    { label: '安全防护', icon: '🛡️', color: '#8338EC' },
    { label: '通信协议', icon: '📡', color: '#3A86FF' },
    { label: '分析算法', icon: '⚡', color: '#06FFB4' }
  ]
})

const emit = defineEmits<{
  complete: []
}>()

const liquidCanvas = ref<HTMLCanvasElement>()
const liquidShapesContainer = ref<HTMLElement>()
const bubblesContainer = ref<HTMLElement>()
const shapeElements = ref<HTMLElement[]>([])
const bubbleElements = ref<HTMLElement[]>([])
const titleElement = ref<HTMLElement>()
const subtitleElement = ref<HTMLElement>()

const liquidShapes = ref<LiquidShape[]>([])
const bubbles = ref<Bubble[]>([])
const liquidProgress = ref(0)

// Canvas液体动画
let liquidAnimationId: number
const liquidPoints: { x: number; y: number; vx: number; vy: number }[] = []

// 初始化液体Canvas
const initLiquidCanvas = () => {
  const canvas = liquidCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 创建液体粒子
  for (let i = 0; i < 100; i++) {
    liquidPoints.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    })
  }

  const animateLiquid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制液体效果
    liquidPoints.forEach((point, index) => {
      point.x += point.vx
      point.y += point.vy

      if (point.x < 0 || point.x > canvas.width) point.vx *= -1
      if (point.y < 0 || point.y > canvas.height) point.vy *= -1

      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 20)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(point.x, point.y, 20, 0, Math.PI * 2)
      ctx.fill()

      // 连接临近的点
      liquidPoints.forEach((otherPoint, otherIndex) => {
        if (index !== otherIndex) {
          const distance = Math.sqrt(
            Math.pow(point.x - otherPoint.x, 2) + Math.pow(point.y - otherPoint.y, 2)
          )
          if (distance < 100) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(otherPoint.x, otherPoint.y)
            ctx.stroke()
          }
        }
      })
    })

    liquidAnimationId = requestAnimationFrame(animateLiquid)
  }

  animateLiquid()
}

// 初始化液体形状
const initLiquidShapes = () => {
  const shapes: LiquidShape[] = []
  const colors = ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFB4']

  for (let i = 0; i < 15; i++) {
    const types = ['circle', 'blob', 'drop']
    shapes.push({
      type: types[Math.floor(Math.random() * types.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 100 + 50,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      scale: 0,
      rotation: Math.random() * 360,
      opacity: 0.3
    })
  }

  liquidShapes.value = shapes
}

// 初始化气泡
const initBubbles = () => {
  const bubbleData: Bubble[] = []
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  const radius = 250

  props.modules.forEach((module, index) => {
    const angle = (index / props.modules.length) * Math.PI * 2
    bubbleData.push({
      ...module,
      x: centerX + Math.cos(angle) * radius * 2,
      y: centerY + Math.sin(angle) * radius * 2,
      scale: 0,
      opacity: 0,
      targetX: Math.cos(angle) * radius,
      targetY: Math.sin(angle) * radius
    })
  })

  bubbles.value = bubbleData
}

// 开始液体流动动画
const startLiquidAnimation = async () => {
  await nextTick()

  const tl = gsap.timeline({
    onUpdate: () => {
      const duration = props.duration / 1000
      const currentProgress = (tl.time() / duration) * 100
      liquidProgress.value = Math.min(currentProgress, 100)
    },
    onComplete: () => {
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  })

  // 标题动画
  tl.fromTo(titleElement.value,
    { opacity: 0, y: -50, scale: 0.8 },
    { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'back.out(1.7)' }
  )
  .fromTo(subtitleElement.value,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
    '-=1.2'
  )

  // 液体形状动画
  shapeElements.value.forEach((shape, index) => {
    const shapeData = liquidShapes.value[index]

    tl.fromTo(shape,
      {
        scale: 0,
        rotation: shapeData.rotation,
        opacity: 0
      },
      {
        scale: 1,
        rotation: shapeData.rotation + 360,
        opacity: shapeData.opacity,
        duration: 2,
        ease: 'power2.out',
        delay: index * 0.1
      }
    )

    // 液体流动动画
    tl.to(shape,
      {
        x: shapeData.x + (Math.random() - 0.5) * 200,
        y: shapeData.y + (Math.random() - 0.5) * 200,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.2
      })
  })

  // 气泡动画
  bubbleElements.value.forEach((bubble, index) => {
    const bubbleData = bubbles.value[index]

    // 流入动画
    tl.fromTo(bubble,
      {
        x: bubbleData.x,
        y: bubbleData.y,
        scale: 0,
        opacity: 0
      },
      {
        x: bubbleData.targetX,
        y: bubbleData.targetY,
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: 'back.out(1.7)',
        delay: 0.5 + index * 0.2
      }
    )

    // 悬浮动画
    tl.to(bubble,
      {
        y: bubbleData.targetY - 20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2 + index * 0.3
      }
    )
  })

  // 气泡容器旋转
  tl.to(bubblesContainer.value,
    {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: 'none'
    },
    1
  )
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    initLiquidCanvas()
    initLiquidShapes()
    initBubbles()
    startLiquidAnimation()
  } else {
    if (liquidAnimationId) {
      cancelAnimationFrame(liquidAnimationId)
    }
  }
})

onMounted(() => {
  if (props.show) {
    initLiquidCanvas()
    initLiquidShapes()
    initBubbles()
    startLiquidAnimation()
  }

  window.addEventListener('resize', () => {
    if (liquidCanvas.value) {
      liquidCanvas.value.width = window.innerWidth
      liquidCanvas.value.height = window.innerHeight
    }
  })
})

onUnmounted(() => {
  if (liquidAnimationId) {
    cancelAnimationFrame(liquidAnimationId)
  }
})
</script>

<style scoped lang="scss">
.liquid-flow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.liquid-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.liquid-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .liquid-shape {
    position: absolute;
    filter: blur(40px);
    mix-blend-mode: screen;
    animation: float 6s ease-in-out infinite;

    &.circle {
      border-radius: 50%;
    }

    &.blob {
      border-radius: 50% 40% 60% 30%;
    }

    &.drop {
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
  }
}

.main-content {
  position: relative;
  z-index: 10;
  text-align: center;
}

.bubbles-container {
  position: relative;
  width: 500px;
  height: 500px;
  margin: 0 auto 3rem;
  transform-style: preserve-3d;
}

.module-bubble {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translate(var(--x), var(--y)) scale(1.1) rotateZ(10deg);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .bubble-content {
    text-align: center;
    color: white;
    z-index: 2;

    .bubble-icon {
      font-size: 2rem;
      margin-bottom: 0.3rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .bubble-label {
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0.9;
    }
  }

  .bubble-wave {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: inherit;
    opacity: 0.3;
    animation: bubble-wave 3s linear infinite;
  }
}

@keyframes bubble-wave {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.text-content {
  .flow-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: white;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .flow-subtitle {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 3rem;
  }

  .liquid-progress {
    display: inline-block;

    .progress-container {
      position: relative;
      width: 200px;
      height: 150px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 100px 100px 0 0;
      border: 3px solid rgba(255, 255, 255, 0.3);
      overflow: hidden;

      .progress-liquid {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(180deg, #06FFB4, #3A86FF, #8338EC);
        border-radius: 100px 100px 0 0;
        transition: height 0.3s ease;

        .liquid-surface {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 20px;

          .wave {
            position: absolute;
            width: 200%;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;

            &.wave-1 {
              animation: wave 3s linear infinite;
            }

            &.wave-2 {
              animation: wave 3s linear infinite;
              animation-delay: -1.5s;
              opacity: 0.5;
            }
          }
        }
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        z-index: 10;
      }
    }
  }
}

@keyframes wave {
  0% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-25%) translateY(-5px);
  }
  100% {
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .bubbles-container {
    width: 350px;
    height: 350px;
  }

  .module-bubble {
    width: 90px;
    height: 90px;

    .bubble-content {
      .bubble-icon {
        font-size: 1.5rem;
      }

      .bubble-label {
        font-size: 0.7rem;
      }
    }
  }

  .text-content {
    .flow-title {
      font-size: 2rem;
    }

    .flow-subtitle {
      font-size: 1.1rem;
    }

    .liquid-progress {
      .progress-container {
        width: 150px;
        height: 120px;

        .progress-text {
          font-size: 1.2rem;
        }
      }
    }
  }
}
</style>