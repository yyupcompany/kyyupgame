<template>
  <div v-if="show" class="light-ripple-container">
    <!-- 光晕波纹背景 -->
    <div class="ripple-background">
      <div class="light-orb" ref="lightOrb"></div>
      <div class="ripple-waves">
        <div
          v-for="i in 5"
          :key="i"
          class="ripple-wave"
          :style="{ animationDelay: `${i * 0.3}s` }"
        ></div>
      </div>
    </div>

    <!-- 中心内容 -->
    <div class="content-center">
      <div class="title-container">
        <h2 class="main-title">{{ dynamicTitle }}</h2>
        <p class="subtitle">{{ dynamicSubtitle }}</p>
      </div>

      <!-- 进度环 -->
      <div class="progress-ring">
        <svg class="progress-svg" viewBox="0 0 100 100">
          <circle
            class="progress-bg"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(99, 102, 241, 0.1)"
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
            stroke="url(#gradient)"
            stroke-width="3"
            stroke-linecap="round"
            transform="rotate(-90 50 50)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b" />
              <stop offset="50%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>

      <!-- 系统模块 -->
      <div class="modules-grid">
        <div
          v-for="(module, index) in dynamicModules"
          :key="index"
          class="module-item"
          :style="{
            animationDelay: `${index * 0.15}s`,
            opacity: progress > (index + 1) * (100 / dynamicModules.length) ? 1 : 0.3,
            transform: progress > (index + 1) * (100 / dynamicModules.length)
              ? 'translateY(0) scale(1)'
              : 'translateY(20px) scale(0.9)'
          }"
        >
          <div class="module-icon">{{ module.icon }}</div>
          <div class="module-text">{{ module.label }}</div>
        </div>
      </div>
    </div>

    <!-- 粒子效果 -->
    <div class="particles">
      <div
        v-for="i in 20"
        :key="i"
        class="particle"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`
        }"
      ></div>
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
  subtitle: '正在为您准备明亮的工作环境',
  duration: 4000,
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
    color: module.color || '#6366f1'
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
  if (props.subtitle !== '正在为您准备明亮的工作环境') {
    return props.subtitle
  }
  const moduleCount = getRoleModuleList(props.userRole).length
  return `正在为您准备${moduleCount}个功能模块...`
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

const lightOrb = ref<HTMLElement>()
const progress = ref(0)
const progressDasharray = 2 * Math.PI * 45
const progressDashoffset = ref(progressDasharray)

// 动画控制
let animationTimer: NodeJS.Timeout | null = null
let progressTimer: NodeJS.Timeout | null = null

const startAnimation = () => {
  console.log('🌟 LightRipple: 开始明亮主题光晕波纹动画')

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
        console.log('✨ LightRipple: 动画完成')
        emit('complete')
      }, 500)
    }
  }, 50)

  // 光晕动画
  nextTick(() => {
    if (lightOrb.value) {
      lightOrb.value.style.animation = 'lightPulse 2s ease-in-out infinite'
    }
  })
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
.light-ripple-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #fef3c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.ripple-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.light-orb {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle,
    rgba(99, 102, 241, 0.3) 0%,
    rgba(6, 182, 212, 0.2) 40%,
    rgba(245, 158, 11, 0.1) 70%,
    transparent 100%);
  border-radius: 50%;
  filter: blur(20px);
  animation: lightPulse 3s ease-in-out infinite;
}

.ripple-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ripple-wave {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: rippleExpand 4s ease-out infinite;
}

.content-center {
  position: relative;
  z-index: 10;
  text-align: center;
  color: #1e293b;
  max-width: 600px;
  padding: 2rem;
}

.title-container {
  margin-bottom: 3rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.subtitle {
  font-size: 1.2rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 2rem auto 3rem;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  font-weight: 600;
  color: #6366f1;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.module-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 1rem;
  padding: 1rem;
  transition: all 0.5s ease;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
}

.module-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.module-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(99, 102, 241, 0.6);
  border-radius: 50%;
  animation: floatParticle linear infinite;
  filter: blur(1px);
}

@keyframes lightPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes rippleExpand {
  0% {
    width: 100px;
    height: 100px;
    opacity: 0.6;
  }
  100% {
    width: 600px;
    height: 600px;
    opacity: 0;
  }
}

@keyframes floatParticle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
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

  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }

  .module-item {
    padding: 0.8rem;
  }

  .light-orb {
    width: 150px;
    height: 150px;
  }
}
</style>