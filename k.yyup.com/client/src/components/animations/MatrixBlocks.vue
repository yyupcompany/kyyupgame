<template>
  <div v-if="show" class="matrix-blocks-container">
    <!-- 背景网格 -->
    <div class="grid-background">
      <div
        v-for="i in gridLines"
        :key="`h-${i}`"
        class="grid-line horizontal"
        :style="{ top: `${i * 10}%` }"
      ></div>
      <div
        v-for="i in gridLines"
        :key="`v-${i}`"
        class="grid-line vertical"
        :style="{ left: `${i * 10}%` }"
      ></div>
    </div>

    <!-- 矩阵方块 -->
    <div class="matrix-grid">
      <div
        v-for="(block, index) in matrixBlocks"
        :key="index"
        ref="blockElements"
        class="matrix-block"
        :class="{ active: block.active, glowing: block.glowing }"
        :style="{
          gridRow: block.row,
          gridColumn: block.col,
          backgroundColor: block.color,
          boxShadow: block.glowing ? `0 0 20px ${block.color}` : 'none'
        }"
      >
        <div class="block-content" v-if="block.content">
          <div class="block-icon">{{ block.content.icon }}</div>
          <div class="block-label">{{ block.content.label }}</div>
        </div>
      </div>
    </div>

    <!-- 中央加载区域 -->
    <div class="loading-center">
      <div class="loading-ring">
        <svg width="120" height="120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            stroke-width="2"
          />
          <circle
            ref="progressCircle"
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#gradient)"
            stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="`${progressValue} ${314.16 - progressValue}`"
            stroke-dashoffset="0"
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00ffff" />
              <stop offset="50%" stop-color="#ff00ff" />
              <stop offset="100%" stop-color="#ffff00" />
            </linearGradient>
          </defs>
        </svg>
        <div class="loading-percentage">{{ Math.round(progressPercentage) }}%</div>
      </div>

      <div class="loading-text">
        <h2 ref="titleElement">{{ dynamicTitle }}</h2>
        <p ref="subtitleElement">{{ dynamicSubtitle }}</p>
        <div class="status-dots">
          <span v-for="i in 3" :key="i" class="status-dot" :style="{ animationDelay: `${i * 0.3}s` }"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { gsap } from 'gsap'
import { getRandomModulesForAnimation, getRoleDisplayName, getRoleModuleList } from '@/utils/animation-modules'

interface MatrixBlock {
  row: number
  col: number
  color: string
  active: boolean
  glowing: boolean
  content?: {
    icon: string
    label: string
  }
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  gridSize?: number
  userRole?: string
  modules?: { name: string; icon: string; color: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '系统启动中',
  subtitle: '正在初始化智能管理平台',
  duration: 4500,
  gridSize: 10,
  userRole: 'admin'
})

// 基于角色动态生成模块数据
const dynamicModules = computed(() => {
  if (props.modules && props.modules.length > 0) {
    return props.modules
  }

  // 从模块数据生成模块列表，限制在6个以内以适应矩阵布局
  const roleModules = getRandomModulesForAnimation(props.userRole, 6)
  return roleModules.map(module => ({
    name: module.title,
    icon: getModuleIcon(module.icon),
    color: module.color || '#FF006E'
  }))
})

// 根据角色生成个性化标题和副标题
const dynamicTitle = computed(() => {
  if (props.title !== '系统启动中') {
    return props.title
  }
  const roleName = getRoleDisplayName(props.userRole)
  return `${roleName}系统启动中`
})

const dynamicSubtitle = computed(() => {
  if (props.subtitle !== '正在初始化智能管理平台') {
    return props.subtitle
  }
  const moduleCount = getRoleModuleList(props.userRole).length
  return `正在初始化${moduleCount}个专业功能模块...`
})

// 工具函数：获取模块图标
const getModuleIcon = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    'dashboard': '📊',
    'briefcase': '💼',
    'calendar': '📅',
    'school': '🏫',
    'user-check': '✅',
    'task': '📋',
    'chat-square': '💬',
    'document': '📄',
    'finance': '💰',
    'marketing': '📢',
    'phone': '📞',
    'video-camera': '🎥',
    'user-group': '👥',
    'book-open': '📖',
    'check': '✔️',
    'clock': '⏰',
    'analytics': '📈',
    'home': '🏠',
    'settings': '⚙️',
    'ai-brain': '🧠',
    'bell': '🔔',
    'star': '⭐',
    'growth': '🌱',
    'message-circle': '💭',
    'share': '🔗'
  }
  return iconMap[iconName] || '📋'
}

const emit = defineEmits<{
  complete: []
}>()

const blockElements = ref<HTMLElement[]>([])
const progressCircle = ref<SVGCircleElement>()
const titleElement = ref<HTMLElement>()
const subtitleElement = ref<HTMLElement>()
const matrixBlocks = ref<MatrixBlock[]>([])
const progressValue = ref(0)
const progressPercentage = ref(0)
const gridLines = ref(10)

// 初始化矩阵方块
const initializeMatrix = () => {
  const blocks: MatrixBlock[] = []
  const modulePositions = [
    { row: 3, col: 2 },
    { row: 3, col: 5 },
    { row: 3, col: 8 },
    { row: 7, col: 2 },
    { row: 7, col: 5 },
    { row: 7, col: 8 }
  ]

  // 创建背景方块
  for (let row = 1; row <= props.gridSize; row++) {
    for (let col = 1; col <= props.gridSize; col++) {
      blocks.push({
        row,
        col,
        color: 'rgba(255, 255, 255, 0.05)',
        active: false,
        glowing: false
      })
    }
  }

  // 添加模块方块
  dynamicModules.value.forEach((module, index) => {
    if (modulePositions[index]) {
      const pos = modulePositions[index]
      const blockIndex = blocks.findIndex(b => b.row === pos.row && b.col === pos.col)
      if (blockIndex !== -1) {
        blocks[blockIndex] = {
          ...blocks[blockIndex],
          color: module.color,
          content: {
            icon: module.icon,
            label: module.name
          },
          active: true
        }
      }
    }
  })

  matrixBlocks.value = blocks
}

// 开始矩阵动画
const startMatrixAnimation = async () => {
  await nextTick()

  const tl = gsap.timeline({
    onUpdate: () => {
      progressPercentage.value = (progressValue.value / 314.16) * 100
    },
    onComplete: () => {
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  })

  // 初始化所有方块为暗淡状态
  tl.set(matrixBlocks.value, { active: false, glowing: false })

  // 标题动画
  tl.fromTo(titleElement.value,
    { opacity: 0, y: -50, scale: 0.8 },
    { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'back.out(1.7)' }
  )
  .fromTo(subtitleElement.value,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
    '-=0.8'
  )

  // 波浪式激活方块
  const activeBlocks = matrixBlocks.value.filter(block => block.active)
  activeBlocks.forEach((block, index) => {
    const blockIndex = matrixBlocks.value.indexOf(block)
    const delay = index * 0.2

    // 激活动画
    tl.call(() => {
      matrixBlocks.value[blockIndex].glowing = true
    }, [], delay)

    // 霓虹闪烁效果
    tl.to({}, {
      duration: 0.3,
      repeat: 3,
      onRepeat: () => {
        matrixBlocks.value[blockIndex].glowing = !matrixBlocks.value[blockIndex].glowing
      },
      delay
    })

    // 持续发光
    tl.call(() => {
      matrixBlocks.value[blockIndex].glowing = true
    }, [], delay + 1.2)
  })

  // 背景方块涟漪效果
  matrixBlocks.value.forEach((block, index) => {
    if (!block.active) {
      const delay = (index / matrixBlocks.value.length) * 2
      tl.call(() => {
        matrixBlocks.value[index].active = true
        matrixBlocks.value[index].color = 'rgba(255, 255, 255, 0.1)'
      }, [], delay)

      tl.call(() => {
        setTimeout(() => {
          matrixBlocks.value[index].active = false
          matrixBlocks.value[index].color = 'rgba(255, 255, 255, 0.05)'
        }, 1000)
      }, [], delay + 0.5)
    }
  })

  // 进度环动画
  tl.to(progressValue, {
    value: 314.16,
    duration: 2,
    ease: 'power2.out'
  }, 1)
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    initializeMatrix()
    startMatrixAnimation()
  }
})

onMounted(() => {
  if (props.show) {
    initializeMatrix()
    startMatrixAnimation()
  }
})
</script>

<style scoped lang="scss">
.matrix-blocks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #0a0e27 0%, #000000 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .grid-line {
    position: absolute;
    background: rgba(0, 255, 255, 0.1);

    &.horizontal {
      width: 100%;
      height: 1px;
    }

    &.vertical {
      width: 1px;
      height: 100%;
    }
  }
}

.matrix-grid {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vmin;
  height: 80vmin;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 2px;
  z-index: 1;
}

.matrix-block {
  border-radius: 4px;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;

  &.active {
    transform: translateZ(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  &.glowing {
    animation: pulse 1s ease-in-out infinite;
  }

  .block-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0.5rem;
    transform: translateZ(20px);

    .block-icon {
      font-size: 1.5rem;
      margin-bottom: 0.2rem;
      filter: drop-shadow(0 0 10px currentColor);
    }

    .block-label {
      font-size: 0.6rem;
      color: rgba(255, 255, 255, 0.8);
      text-align: center;
      font-weight: 600;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 5px currentColor;
    transform: translateZ(10px) scale(1);
  }
  50% {
    box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
    transform: translateZ(15px) scale(1.05);
  }
}

.loading-center {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;

  .loading-ring {
    position: relative;
    margin-bottom: 2rem;

    svg {
      transform: rotate(-90deg);
    }

    .loading-percentage {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .loading-text {
    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }

    p {
      font-size: 1.2rem;
      opacity: 0.8;
      margin-bottom: 1.5rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .status-dots {
      display: flex;
      justify-content: center;
      gap: 0.8rem;

      .status-dot {
        width: 12px;
        height: 12px;
        background: linear-gradient(45deg, #00ffff, #ff00ff);
        border-radius: 50%;
        animation: status-pulse 1.4s ease-in-out infinite both;

        &:nth-child(2) {
          animation-delay: 0.2s;
        }

        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }
}

@keyframes status-pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .matrix-grid {
    width: 90vmin;
    height: 90vmin;
    gap: 1px;
  }

  .matrix-block {
    .block-content {
      .block-icon {
        font-size: 1.2rem;
      }

      .block-label {
        font-size: 0.5rem;
      }
    }
  }

  .loading-center {
    .loading-ring {
      svg {
        width: 100px;
        height: 100px;
      }

      .loading-percentage {
        font-size: 1.2rem;
      }
    }

    .loading-text {
      h2 {
        font-size: 2rem;
      }

      p {
        font-size: 1rem;
      }
    }
  }
}
</style>