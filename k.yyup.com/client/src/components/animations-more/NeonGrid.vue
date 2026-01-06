<template>
  <div v-if="show" class="neon-grid-container">
    <!-- 霓虹网格背景 -->
    <div class="neon-grid" ref="neonGrid">
      <div
        v-for="i in gridPoints"
        :key="`grid-${i}`"
        class="grid-point"
        :style="{ '--x': `${(i % 20) * 5}%`, '--y': `${Math.floor(i / 20) * 5}%` }"
      ></div>
    </div>

    <!-- 扫描线效果 -->
    <div class="scan-lines" ref="scanLines">
      <div class="scan-line horizontal" ref="horizontalScan"></div>
      <div class="scan-line vertical" ref="verticalScan"></div>
    </div>

    <!-- 主要模块网格 -->
    <div class="module-grid" ref="moduleGrid">
      <div
        v-for="(module, index) in modules"
        :key="index"
        ref="moduleElements"
        class="module-node"
        :class="{ active: module.active, glowing: module.glowing }"
        :style="{
          '--node-color': module.color,
          '--node-x': `${module.x}%`,
          '--node-y': `${module.y}%`
        }"
      >
        <div class="node-core">
          <div class="node-icon">{{ module.icon }}</div>
          <div class="node-label">{{ module.label }}</div>
        </div>
        <div class="node-ring"></div>
        <div class="node-connections">
          <div
            v-for="connection in module.connections"
            :key="connection"
            class="connection-line"
            :style="{
              '--angle': `${connection}deg`
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 中央信息 -->
    <div class="central-info">
      <h1 ref="titleElement" class="neon-title">{{ title }}</h1>
      <p ref="subtitleElement" class="neon-subtitle">{{ subtitle }}</p>

      <!-- 霓虹进度条 -->
      <div class="neon-progress">
        <div class="progress-container">
          <div class="progress-track"></div>
          <div
            class="progress-fill"
            :style="{ width: neonProgress + '%' }"
          ></div>
          <div class="progress-glow" :style="{ width: neonProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ Math.round(neonProgress) }}%</div>
      </div>

      <!-- 系统状态 -->
      <div class="system-status">
        <div class="status-item" v-for="status in systemStatus" :key="status.text">
          <div class="status-indicator" :class="status.type"></div>
          <span class="status-text">{{ status.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'

interface Module {
  label: string
  icon: string
  color: string
  x: number
  y: number
  active: boolean
  glowing: boolean
  connections: number[]
}

interface SystemStatus {
  text: string
  type: 'active' | 'pending' | 'complete'
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
  title: '神经网络激活',
  subtitle: '正在连接智能模块',
  duration: 5500,
  modules: () => [
    { label: 'AI核心', icon: '🧠', color: '#00ffff' },
    { label: '数据总线', icon: '🌐', color: '#ff00ff' },
    { label: '安全协议', icon: '🔐', color: '#ffff00' },
    { label: '通信接口', icon: '📡', color: '#00ff00' },
    { label: '分析引擎', icon: '⚡', color: '#ff6600' },
    { label: '存储单元', icon: '💾', color: '#ff0099' }
  ]
})

const emit = defineEmits<{
  complete: []
}>()

const neonGrid = ref<HTMLElement>()
const scanLines = ref<HTMLElement>()
const moduleGrid = ref<HTMLElement>()
const horizontalScan = ref<HTMLElement>()
const verticalScan = ref<HTMLElement>()
const moduleElements = ref<HTMLElement[]>([])
const titleElement = ref<HTMLElement>()
const subtitleElement = ref<HTMLElement>()

const gridPoints = ref(100)
const modules = ref<Module[]>([])
const neonProgress = ref(0)
const systemStatus = ref<SystemStatus[]>([
  { text: '初始化网格', type: 'complete' },
  { text: '激活节点', type: 'active' },
  { text: '建立连接', type: 'pending' },
  { text: '系统同步', type: 'pending' }
])

// 初始化模块
const initModules = () => {
  const positions = [
    { x: 25, y: 25, connections: [45, 135, 225] },
    { x: 75, y: 25, connections: [135, 225, 315] },
    { x: 50, y: 50, connections: [0, 90, 180, 270] },
    { x: 25, y: 75, connections: [45, 315, 225] },
    { x: 75, y: 75, connections: [135, 315, 45] },
    { x: 50, y: 10, connections: [90, 180, 270] }
  ]

  modules.value = props.modules.map((module, index) => ({
    ...module,
    ...positions[index],
    active: false,
    glowing: false
  }))
}

// 开始霓虹网格动画
const startNeonAnimation = async () => {
  await nextTick()
  initModules()

  const tl = gsap.timeline({
    onUpdate: () => {
      const duration = props.duration / 1000
      const currentProgress = (tl.time() / duration) * 100
      neonProgress.value = Math.min(currentProgress, 100)

      // 更新系统状态
      if (neonProgress.value < 25) {
        systemStatus.value = [
          { text: '初始化网格', type: 'active' },
          { text: '激活节点', type: 'pending' },
          { text: '建立连接', type: 'pending' },
          { text: '系统同步', type: 'pending' }
        ]
      } else if (neonProgress.value < 50) {
        systemStatus.value = [
          { text: '初始化网格', type: 'complete' },
          { text: '激活节点', type: 'active' },
          { text: '建立连接', type: 'pending' },
          { text: '系统同步', type: 'pending' }
        ]
      } else if (neonProgress.value < 75) {
        systemStatus.value = [
          { text: '初始化网格', type: 'complete' },
          { text: '激活节点', type: 'complete' },
          { text: '建立连接', type: 'active' },
          { text: '系统同步', type: 'pending' }
        ]
      } else {
        systemStatus.value = [
          { text: '初始化网格', type: 'complete' },
          { text: '激活节点', type: 'complete' },
          { text: '建立连接', type: 'complete' },
          { text: '系统同步', type: 'active' }
        ]
      }
    },
    onComplete: () => {
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  })

  // 标题霓虹效果
  tl.fromTo(titleElement.value,
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 1, duration: 1.5, ease: 'back.out(1.7)' }
  )
  .fromTo(subtitleElement.value,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
    '-=1.2'
  )

  // 网格点动画
  tl.to('.grid-point', {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    stagger: 0.01,
    ease: 'power2.out'
  }, 0)

  // 扫描线动画
  tl.to(horizontalScan.value,
    {
      y: '100vh',
      duration: 2,
      ease: 'none'
    },
    0.5
  )
  .to(verticalScan.value,
    {
      x: '100vw',
      duration: 2,
      ease: 'none'
    },
    0.5
  )

  // 模块节点动画
  moduleElements.value.forEach((module, index) => {
    const delay = index * 0.2

    // 节点激活
    tl.fromTo(module,
      {
        opacity: 0,
        scale: 0,
        rotation: -180
      },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: 'back.out(1.7)',
        delay
      }
    )

    // 激活状态
    tl.call(() => {
      modules.value[index].active = true
    }, [], delay + 1)

    // 发光效果
    tl.call(() => {
      modules.value[index].glowing = true
    }, [], delay + 1.5)

    // 脉冲动画
    tl.to(module,
      {
        scale: 1.2,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: delay + 2
      }
    )
  })

  // 霓虹进度条
  tl.to(neonProgress,
    {
      value: 100,
      duration: props.duration / 1000,
      ease: 'power2.out'
    },
    0.5
  )

  // 最终闪烁
  tl.to('.module-node.active',
    {
      opacity: 0.5,
      duration: 0.1,
      repeat: 5,
      yoyo: true
    },
    `-=${1}`
  )
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    startNeonAnimation()
  }
})

onMounted(() => {
  if (props.show) {
    startNeonAnimation()
  }
})
</script>

<style scoped lang="scss">
.neon-grid-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.neon-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .grid-point {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(0, 255, 255, 0.3);
    border-radius: 50%;
    left: var(--x);
    top: var(--y);
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: all 0.3s ease;
  }
}

.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;

  .scan-line {
    position: absolute;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    mix-blend-mode: screen;

    &.horizontal {
      width: 100%;
      height: 2px;
      top: 0;
      left: 0;
    }

    &.vertical {
      width: 2px;
      height: 100%;
      top: 0;
      left: 0;
    }
  }
}

.module-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.module-node {
  position: absolute;
  width: 120px;
  height: 120px;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  cursor: pointer;

  &.active {
    .node-core {
      background: var(--node-color);
      box-shadow: 0 0 30px var(--node-color);
    }

    .node-ring {
      border-color: var(--node-color);
      box-shadow: 0 0 20px var(--node-color), inset 0 0 20px var(--node-color);
    }
  }

  &.glowing {
    animation: neon-pulse 1s ease-in-out infinite;
  }

  .node-core {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    z-index: 2;

    .node-icon {
      font-size: 1.8rem;
      margin-bottom: 0.2rem;
      filter: drop-shadow(0 0 10px currentColor);
    }

    .node-label {
      font-size: 0.7rem;
      color: white;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
  }

  .node-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 110px;
    height: 110px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .node-connections {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;

    .connection-line {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1px;
      height: 100px;
      background: linear-gradient(transparent, var(--node-color), transparent);
      transform-origin: top center;
      transform: rotate(var(--angle));
      opacity: 0.5;
      animation: connection-pulse 2s ease-in-out infinite;
    }
  }
}

@keyframes neon-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes connection-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

.central-info {
  position: relative;
  z-index: 100;
  text-align: center;
  color: white;

  .neon-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
    background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .neon-subtitle {
    font-size: 1.3rem;
    margin-bottom: 3rem;
    opacity: 0.8;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .neon-progress {
    display: inline-block;
    margin-bottom: 2rem;

    .progress-container {
      position: relative;
      width: 300px;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;

      .progress-track {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
      }

      .progress-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00);
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      .progress-glow {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00);
        filter: blur(10px);
        transition: width 0.3s ease;
      }
    }

    .progress-text {
      margin-top: 1rem;
      font-size: 1.2rem;
      font-weight: 700;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
  }

  .system-status {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: status-blink 1s ease-in-out infinite;

        &.active {
          background: #00ffff;
          box-shadow: 0 0 10px #00ffff;
        }

        &.complete {
          background: #00ff00;
          box-shadow: 0 0 10px #00ff00;
          animation: none;
        }

        &.pending {
          background: rgba(255, 255, 255, 0.3);
          animation: status-blink 1s ease-in-out infinite;
        }
      }

      .status-text {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
  }
}

@keyframes status-blink {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .module-node {
    width: 100px;
    height: 100px;

    .node-core {
      width: 70px;
      height: 70px;

      .node-icon {
        font-size: 1.5rem;
      }

      .node-label {
        font-size: 0.6rem;
      }
    }

    .node-ring {
      width: 90px;
      height: 90px;
    }
  }

  .central-info {
    .neon-title {
      font-size: 2rem;
    }

    .neon-subtitle {
      font-size: 1.1rem;
    }

    .neon-progress {
      .progress-container {
        width: 200px;
      }

      .progress-text {
        font-size: 1rem;
      }
    }

    .system-status {
      gap: 1rem;

      .status-item {
        .status-text {
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>