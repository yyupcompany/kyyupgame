<template>
  <div v-if="show" class="cube-explosion-container">
    <!-- 3D立方体爆炸效果 -->
    <div class="explosion-scene" ref="explosionScene">
      <!-- 爆炸粒子 -->
      <div
        v-for="(particle, index) in explosionParticles"
        :key="index"
        ref="particleElements"
        class="explosion-particle"
        :style="{
          backgroundColor: particle.color,
          transform: particle.transform,
          opacity: particle.opacity
        }"
      >
        <div class="particle-face front"></div>
        <div class="particle-face back"></div>
        <div class="particle-face left"></div>
        <div class="particle-face right"></div>
        <div class="particle-face top"></div>
        <div class="particle-face bottom"></div>
      </div>
    </div>

    <!-- 主要模块立方体 -->
    <div class="main-cubes-container" ref="mainCubesContainer">
      <div
        v-for="(cube, index) in mainCubes"
        :key="index"
        ref="cubeElements"
        class="main-cube"
        :class="{ assembled: cube.assembled }"
        :style="{ '--cube-color': cube.color }"
      >
        <div class="cube-face cube-front">
          <div class="cube-content">
            <div class="cube-icon">{{ cube.icon }}</div>
            <div class="cube-label">{{ cube.label }}</div>
          </div>
        </div>
        <div class="cube-face cube-back"></div>
        <div class="cube-face cube-left"></div>
        <div class="cube-face cube-right"></div>
        <div class="cube-face cube-top"></div>
        <div class="cube-face cube-bottom"></div>
      </div>
    </div>

    <!-- 信息显示区 -->
    <div class="info-panel">
      <h1 ref="titleElement" class="explosion-title">{{ getDynamicTitle() }}</h1>
      <p ref="subtitleElement" class="explosion-subtitle">{{ getDynamicSubtitle() }}</p>

      <!-- 组装进度 -->
      <div class="assembly-progress">
        <div class="progress-container">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: assemblyProgress + '%' }"
            ></div>
          </div>
          <div class="progress-text">{{ Math.round(assemblyProgress) }}%</div>
        </div>
        <div class="status-text">{{ statusText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { getRandomModulesForAnimation, getCoreModulesForAnimation, getRoleDisplayName } from '@/utils/animation-modules'

interface ExplosionParticle {
  color: string
  transform: string
  opacity: number
  velocity: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
}

interface MainCube {
  label: string
  icon: string
  color: string
  assembled: boolean
  position: { x: number; y: number; z: number }
  targetPosition: { x: number; y: number; z: number }
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  userRole?: string
  modules?: { label: string; icon: string; color: string }[]
  useRandomModules?: boolean
  moduleCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '',
  subtitle: '',
  duration: 6000,
  userRole: 'admin',
  modules: () => [],
  useRandomModules: true,
  moduleCount: 6
})

// 动态生成标题和副标题
const getDynamicTitle = () => {
  if (props.title) return props.title
  const roleDisplayName = getRoleDisplayName(props.userRole)
  return `${roleDisplayName}系统初始化中`
}

const getDynamicSubtitle = () => {
  if (props.subtitle) return props.subtitle
  return '正在为您构建个性化智能管理平台'
}

const emit = defineEmits<{
  complete: []
}>()

const explosionScene = ref<HTMLElement>()
const mainCubesContainer = ref<HTMLElement>()
const particleElements = ref<HTMLElement[]>([])
const cubeElements = ref<HTMLElement[]>([])
const titleElement = ref<HTMLElement>()
const subtitleElement = ref<HTMLElement>()

const explosionParticles = ref<ExplosionParticle[]>([])
const mainCubes = ref<MainCube[]>([])
const assemblyProgress = ref(0)
const statusText = ref('初始化组件...')

// 获取动态模块数据
const getModuleItems = () => {
  if (props.modules && props.modules.length > 0) {
    return props.modules
  }

  if (props.useRandomModules) {
    return getRandomModulesForAnimation(props.userRole, props.moduleCount)
  } else {
    return getCoreModulesForAnimation(props.userRole)
  }
}

// 图标映射：将系统图标名称转换为emoji
const getIconForModule = (iconName: string) => {
  const iconMap: Record<string, string> = {
    'dashboard': '🎯',
    'briefcase': '💼',
    'calendar': '📅',
    'school': '🎓',
    'user-check': '✅',
    'task': '📋',
    'chat-square': '💬',
    'document': '📄',
    'finance': '💰',
    'marketing': '📢',
    'phone': '📞',
    'video-camera': '🎬',
    'user-group': '👥',
    'book-open': '📚',
    'check': '✔️',
    'clock': '⏰',
    'analytics': '📊',
    'home': '🏠',
    'settings': '⚙️',
    'ai-brain': '🤖',
    'star': '⭐',
    'growth': '📈',
    'bell': '🔔',
    'share': '🔗',
    'message-circle': '💭',
    'activity': '🎯'
  }
  return iconMap[iconName] || '🧩'
}

// 初始化爆炸粒子
const initExplosionParticles = () => {
  const particles: ExplosionParticle[] = []
  const colors = ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFB4']

  for (let i = 0; i < 50; i++) {
    particles.push({
      color: colors[Math.floor(Math.random() * colors.length)],
      transform: 'translate(-50%, -50%) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',
      opacity: 1,
      velocity: {
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800
      },
      rotation: {
        x: Math.random() * 720 - 360,
        y: Math.random() * 720 - 360,
        z: Math.random() * 720 - 360
      }
    })
  }

  explosionParticles.value = particles
}

// 初始化主立方体
const initMainCubes = () => {
  const gridPositions = [
    { x: -150, y: -100, z: 0 },
    { x: 150, y: -100, z: 0 },
    { x: -150, y: 100, z: 0 },
    { x: 150, y: 100, z: 0 },
    { x: 0, y: 0, z: -100 },
    { x: 0, y: 0, z: 100 }
  ]

  const modules = getModuleItems()
  mainCubes.value = modules.map((module, index) => ({
    label: module.title,
    icon: getIconForModule(module.icon),
    color: module.color || '#FF006E',
    assembled: false,
    position: {
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 1000,
      z: (Math.random() - 0.5) * 1000
    },
    targetPosition: gridPositions[index] || { x: 0, y: 0, z: 0 }
  }))
}

// 开始爆炸和组装动画
const startExplosionAnimation = async () => {
  await nextTick()

  const tl = gsap.timeline({
    onUpdate: () => {
      const duration = props.duration / 1000
      const currentProgress = (tl.time() / duration) * 100
      assemblyProgress.value = Math.min(currentProgress, 100)

      // 更新状态文字
      if (assemblyProgress.value < 20) {
        statusText.value = '初始化组件...'
      } else if (assemblyProgress.value < 50) {
        statusText.value = '分解现有结构...'
      } else if (assemblyProgress.value < 80) {
        statusText.value = '重新组装模块...'
      } else {
        statusText.value = '系统准备就绪'
      }
    },
    onComplete: () => {
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  })

  // 标题动画
  tl.fromTo(titleElement.value,
    { opacity: 0, scale: 0.5, rotationZ: 180 },
    { opacity: 1, scale: 1, rotationZ: 0, duration: 1.5, ease: 'back.out(1.7)' }
  )
  .fromTo(subtitleElement.value,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
    '-=1.2'
  )

  // 爆炸粒子动画
  particleElements.value.forEach((particle, index) => {
    const particleData = explosionParticles.value[index]

    tl.fromTo(particle,
      {
        x: 0,
        y: 0,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        scale: 1,
        opacity: 1
      },
      {
        x: particleData.velocity.x,
        y: particleData.velocity.y,
        z: particleData.velocity.z,
        rotationX: particleData.rotation.x,
        rotationY: particleData.rotation.y,
        rotationZ: particleData.rotation.z,
        scale: 0.1,
        opacity: 0,
        duration: 2,
        ease: 'power2.out'
      },
      index * 0.02
    )
  })

  // 主立方体组装动画
  cubeElements.value.forEach((cube, index) => {
    const cubeData = mainCubes.value[index]
    const delay = 1.5 + index * 0.3

    // 从远处飞入
    tl.fromTo(cube,
      {
        x: cubeData.position.x,
        y: cubeData.position.y,
        z: cubeData.position.z,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        scale: 0.1,
        opacity: 0
      },
      {
        x: cubeData.targetPosition.x,
        y: cubeData.targetPosition.y,
        z: cubeData.targetPosition.z,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: 'back.out(1.7)',
        delay
      }
    )

    // 标记为已组装
    tl.call(() => {
      mainCubes.value[index].assembled = true
    }, [], delay + 1.5)

    // 最终旋转展示
    tl.to(cube,
      {
        rotationY: 360,
        duration: 2,
        ease: 'power1.inOut',
        delay: delay + 2
      }
    )
  })

  // 容器旋转
  tl.to(mainCubesContainer.value,
    {
      rotationY: 360,
      rotationX: 15,
      duration: 4,
      ease: 'power1.inOut'
    },
    2
  )
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    initExplosionParticles()
    initMainCubes()
    startExplosionAnimation()
  }
})

onMounted(() => {
  if (props.show) {
    initExplosionParticles()
    initMainCubes()
    startExplosionAnimation()
  }
})
</script>

<style scoped lang="scss">
.cube-explosion-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #1a0a2e 0%, #0f0320 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  perspective: 2000px;
}

.explosion-scene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.explosion-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  transform-style: preserve-3d;
  pointer-events: none;
}

.particle-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: inherit;
  opacity: 0.8;
}

.particle-face.front { transform: translateZ(10px); }
.particle-face.back { transform: rotateY(180deg) translateZ(10px); }
.particle-face.left { transform: rotateY(-90deg) translateZ(10px); }
.particle-face.right { transform: rotateY(90deg) translateZ(10px); }
.particle-face.top { transform: rotateX(90deg) translateZ(10px); }
.particle-face.bottom { transform: rotateX(-90deg) translateZ(10px); }

.main-cubes-container {
  position: relative;
  width: 400px;
  height: 300px;
  transform-style: preserve-3d;
  transform: rotateX(-15deg) rotateY(25deg);
}

.main-cube {
  position: absolute;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
  transition: all 0.3s ease;

  &.assembled {
    .cube-face {
      background: linear-gradient(135deg, var(--cube-color), rgba(255, 255, 255, 0.1));
      border: 2px solid var(--cube-color);
      box-shadow: 0 0 20px var(--cube-color);
    }
  }

  .cube-face {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
  }

  .cube-face.front { transform: translateZ(50px); }
  .cube-face.back { transform: rotateY(180deg) translateZ(50px); }
  .cube-face.left { transform: rotateY(-90deg) translateZ(50px); }
  .cube-face.right { transform: rotateY(90deg) translateZ(50px); }
  .cube-face.top { transform: rotateX(90deg) translateZ(50px); }
  .cube-face.bottom { transform: rotateX(-90deg) translateZ(50px); }

  .cube-content {
    text-align: center;
    color: white;
    transform: translateZ(10px);

    .cube-icon {
      font-size: 1.8rem;
      margin-bottom: 0.3rem;
      filter: drop-shadow(0 0 10px currentColor);
    }

    .cube-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
  }
}

.info-panel {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 100;

  .explosion-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(255, 0, 110, 0.5);
  }

  .explosion-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
  }

  .assembly-progress {
    max-width: 400px;

    .progress-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;

      .progress-track {
        flex: 1;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff006e, #8338ec, #3a86ff);
          border-radius: 4px;
          transition: width 0.3s ease;
          box-shadow: 0 0 20px rgba(255, 0, 110, 0.5);
        }
      }

      .progress-text {
        color: white;
        font-weight: 700;
        font-size: 1.1rem;
        min-width: 50px;
        text-align: right;
      }
    }

    .status-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .main-cubes-container {
    width: 300px;
    height: 250px;
  }

  .main-cube {
    width: 80px;
    height: 80px;

    .cube-content {
      .cube-icon {
        font-size: 1.4rem;
      }

      .cube-label {
        font-size: 0.6rem;
      }
    }
  }

  .cube-face.front { transform: translateZ(40px); }
  .cube-face.back { transform: rotateY(180deg) translateZ(40px); }
  .cube-face.left { transform: rotateY(-90deg) translateZ(40px); }
  .cube-face.right { transform: rotateY(90deg) translateZ(40px); }
  .cube-face.top { transform: rotateX(90deg) translateZ(40px); }
  .cube-face.bottom { transform: rotateX(-90deg) translateZ(40px); }

  .info-panel {
    .explosion-title {
      font-size: 2rem;
    }

    .explosion-subtitle {
      font-size: 1rem;
    }

    .assembly-progress {
      max-width: 300px;

      .progress-container {
        .progress-text {
          font-size: 1rem;
        }
      }

      .status-text {
        font-size: 0.9rem;
      }
    }
  }
}
</style>