<template>
  <div v-if="show" class="dark-starfield-container">
    <!-- 星空背景 -->
    <div class="starfield-background" ref="starfieldCanvas"></div>

    <!-- 流星效果 -->
    <div class="shooting-stars">
      <div
        v-for="i in 8"
        :key="i"
        class="shooting-star"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 50}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${2 + Math.random() * 3}s`
        }"
      ></div>
    </div>

    <!-- 中心内容 -->
    <div class="content-center">
      <div class="neon-frame">
        <div class="title-container">
          <h2 class="main-title">{{ dynamicTitle }}</h2>
          <p class="subtitle">{{ dynamicSubtitle }}</p>
        </div>

        <!-- 霓虹进度环 -->
        <div class="neon-progress">
          <svg class="progress-svg" viewBox="0 0 100 100">
            <circle
              class="progress-bg"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(99, 102, 241, 0.2)"
              stroke-width="2"
            />
            <circle
              class="progress-fill"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              :stroke-dasharray="progressDasharray"
              :stroke-dashoffset="progressDashoffset"
              stroke="#6366f1"
              stroke-width="3"
              stroke-linecap="round"
              transform="rotate(-90 50 50)"
              filter="url(#neonGlow)"
            />
            <defs>
              <filter id="neonGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
          <div class="progress-text">{{ Math.round(progress) }}%</div>
        </div>

        <!-- 系统模块 -->
        <div class="modules-container">
          <div
            v-for="(module, index) in dynamicModules"
            :key="index"
            class="module-card"
            :style="{
              animationDelay: `${index * 0.1}s`,
              opacity: progress > (index + 1) * (100 / dynamicModules.length) ? 1 : 0.2,
              transform: progress > (index + 1) * (100 / dynamicModules.length)
                ? 'translateY(0) rotateX(0)'
                : 'translateY(30px) rotateX(15deg)'
            }"
          >
            <div class="module-icon" :style="{ color: module.color }">
              {{ module.icon }}
            </div>
            <div class="module-name">{{ module.label }}</div>
            <div class="module-status"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 漂浮粒子 -->
    <div class="floating-particles">
      <div
        v-for="i in 30"
        :key="i"
        class="floating-particle"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${10 + Math.random() * 10}s`
        }"
      ></div>
    </div>

    <!-- 边框装饰 -->
    <div class="corner-decoration">
      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { getRandomModulesForAnimation, getRoleDisplayName, getRoleModuleList } from '@/utils/animation-modules'

interface Module {
  label: string
  icon: string
  color: string
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  userRole?: string
  modules?: Module[]
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '系统启动中',
  subtitle: '正在为您准备暗黑科技环境',
  duration: 4500,
  userRole: 'admin'
})

// 基于角色动态生成模块数据
const dynamicModules = computed(() => {
  if (props.modules && props.modules.length > 0) {
    return props.modules
  }

  // 从模块数据生成模块列表，限制在6个以内以适应网格布局
  const roleModules = getRandomModulesForAnimation(props.userRole, 6)
  return roleModules.map(module => ({
    label: module.title,
    icon: getModuleIcon(module.icon),
    color: module.color || '#a855f7'
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
  if (props.subtitle !== '正在为您准备暗黑科技环境') {
    return props.subtitle
  }
  const moduleCount = getRoleModuleList(props.userRole).length
  return `正在为您准备${moduleCount}个专业模块...`
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

const starfieldCanvas = ref<HTMLElement>()
const progress = ref(0)
const progressDasharray = 2 * Math.PI * 45
const progressDashoffset = ref(progressDasharray)

// 动画控制
let animationTimer: NodeJS.Timeout | null = null
let progressTimer: NodeJS.Timeout | null = null
let stars: { x: number; y: number; size: number; speed: number }[] = []

const createStarfield = () => {
  if (!starfieldCanvas.value) return

  const starfield = document.createElement('div')
  starfield.className = 'stars'
  starfieldCanvas.value.appendChild(starfield)

  // 创建星星
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div')
    star.className = 'star'
    star.style.left = `${Math.random() * 100}%`
    star.style.top = `${Math.random() * 100}%`
    star.style.width = star.style.height = `${Math.random() * 3 + 1}px`
    star.style.animationDelay = `${Math.random() * 5}s`
    star.style.animationDuration = `${3 + Math.random() * 4}s`
    starfield.appendChild(star)
  }
}

const startAnimation = () => {
  console.log('🌌 DarkStarfield: 开始暗黑主题星空动画')

  // 创建星空背景
  createStarfield()

  // 进度条动画
  progress.value = 0
  const progressStep = 100 / (props.duration / 50)

  progressTimer = setInterval(() => {
    progress.value += progressStep
    progressDashoffset.value = progressDasharray - (progress.value / 100) * progressDasharray

    if (progress.value >= 100) {
      if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
      }

      // 动画完成
      setTimeout(() => {
        console.log('✨ DarkStarfield: 动画完成')
        emit('complete')
      }, 500)
    }
  }, 50)
}

const stopAnimation = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }

  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    startAnimation()
  } else {
    stopAnimation()
  }
})

onMounted(() => {
  if (props.show) {
    startAnimation()
  }
})
</script>

<style scoped lang="scss">
.dark-starfield-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0c0a1a 0%, #1a1625 50%, #2d2438 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.starfield-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle linear infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.shooting-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
}

.shooting-star {
  position: absolute;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: shootingStar linear infinite;
}

.content-center {
  position: relative;
  z-index: 10;
}

.neon-frame {
  background: rgba(12, 10, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 1.5rem;
  padding: 3rem;
  max-width: 700px;
  box-shadow:
    0 0 50px rgba(99, 102, 241, 0.2),
    inset 0 0 30px rgba(99, 102, 241, 0.1);
  position: relative;
}

.title-container {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #e2e8f0;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
  letter-spacing: 2px;
}

.subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 300;
}

.neon-progress {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 2rem auto 3rem;
}

.progress-svg {
  width: 100%;
  height: 100%;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.4rem;
  font-weight: 600;
  color: #6366f1;
  text-shadow: 0 0 10px currentColor;
}

.modules-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
}

.module-card {
  background: rgba(45, 36, 56, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
}

.module-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
  filter: drop-shadow(0 0 10px currentColor);
}

.module-name {
  font-size: 1rem;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.module-status {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  margin: 0 auto;
  box-shadow: 0 0 10px #10b981;
  animation: statusPulse 2s ease-in-out infinite;
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(99, 102, 241, 0.6);
  border-radius: 50%;
  animation: floatAround linear infinite;
  filter: blur(1px);
}

.corner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid #6366f1;
}

.top-left {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
}

.top-right {
  top: 10px;
  right: 10px;
  border-left: none;
  border-bottom: none;
}

.bottom-left {
  bottom: 10px;
  left: 10px;
  border-right: none;
  border-top: none;
}

.bottom-right {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

@keyframes shootingStar {
  0% {
    transform: translateX(-100px) translateY(0) rotate(-45deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 100px)) translateY(100px) rotate(-45deg);
    opacity: 0;
  }
}

@keyframes floatAround {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(50px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .modules-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .neon-frame {
    padding: 2rem;
    margin: 1rem;
  }

  .corner {
    width: 20px;
    height: 20px;
  }
}
</style>