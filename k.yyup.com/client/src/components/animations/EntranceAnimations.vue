<template>
  <div v-if="props.show" class="entrance-animations">
    <!-- 动态组件渲染 -->
    <component
      :is="currentAnimationComponent"
      :show="props.show"
      :title="animationConfig.title"
      :subtitle="animationConfig.subtitle"
      :duration="animationConfig.duration"
      :modules="animationConfig.modules"
      @complete="onAnimationComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import BlocksAnimation from './BlocksAnimation.vue'
import GsapCards from './GsapCards.vue'
import ParticleWave from './ParticleWave.vue'
import MatrixBlocks from './MatrixBlocks.vue'
import HelixSpiral from '../animations-more/HelixSpiral.vue'
import CubeExplosion from '../animations-more/CubeExplosion.vue'
import LiquidFlow from '../animations-more/LiquidFlow.vue'
import NeonGrid from '../animations-more/NeonGrid.vue'
import LightRipple from './LightRipple.vue'
import DarkStarfield from './DarkStarfield.vue'

interface AnimationConfig {
  component: any
  title: string
  subtitle: string
  duration: number
  modules: { label: string; icon: string; color: string }[]
}

interface Props {
  show?: boolean
  type?: 'random' | 'blocks' | 'gsap-cards' | 'particle-wave' | 'matrix-blocks' | 'helix-spiral' | 'cube-explosion' | 'liquid-flow' | 'neon-grid' | 'theme-adaptive' | 'light-ripple' | 'dark-starfield'
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  type: 'random'
})

const emit = defineEmits<{
  complete: []
}>()

// 主题检测
const currentTheme = ref<'light' | 'dark'>('light')

const detectTheme = () => {
  const htmlElement = document.documentElement
  const bodyElement = document.body

  // 检查主题类名
  const hasDarkTheme = htmlElement.classList.contains('theme-dark') ||
                     bodyElement.classList.contains('theme-dark') ||
                     htmlElement.classList.contains('glass-dark') ||
                     bodyElement.classList.contains('glass-dark')

  currentTheme.value = hasDarkTheme ? 'dark' : 'light'
  console.log(`🎨 检测到当前主题: ${currentTheme.value}`)
}

// 完整的动画配置
const animationConfigs = {
  'blocks': {
    component: BlocksAnimation,
    title: '欢迎使用系统',
    subtitle: '正在为您准备最佳体验...',
    duration: 3000,
    modules: [
      { label: '招生管理', icon: '🎓', color: 'var(--animation-blocks-primary)' },
      { label: '教学中心', icon: '📚', color: 'var(--animation-blocks-secondary)' },
      { label: '活动管理', icon: '🎪', color: 'var(--animation-blocks-accent)' },
      { label: '财务中心', icon: '💰', color: '#9C27B0' },
      { label: 'AI助手', icon: '🤖', color: '#00BCD4' },
      { label: '系统设置', icon: '⚙️', color: '#607D8B' }
    ]
  },
  'gsap-cards': {
    component: GsapCards,
    title: '欢迎回来',
    subtitle: '正在加载您的个性化设置',
    duration: 3500,
    modules: [
      { label: '招生中心', icon: '🎓', color: 'var(--animation-gsap-primary)' },
      { label: '教学平台', icon: '📚', color: 'var(--animation-gsap-secondary)' },
      { label: '活动管理', icon: '🎪', color: 'var(--animation-gsap-accent)' },
      { label: '财务系统', icon: '💰', color: '#9C27B0' },
      { label: 'AI助手', icon: '🤖', color: '#00BCD4' },
      { label: '数据分析', icon: '📊', color: '#F44336' }
    ]
  },
  'particle-wave': {
    component: ParticleWave,
    title: '智能管理系统',
    subtitle: '正在为您打造最佳的工作环境',
    duration: 4000,
    modules: [
      { label: '招生管理', icon: '🎯', color: 'var(--animation-particle-primary)' },
      { label: '教学平台', icon: '📖', color: 'var(--animation-particle-secondary)' },
      { label: '活动中心', icon: '🎉', color: 'var(--animation-particle-accent)' },
      { label: '财务系统', icon: '💎', color: '#96CEB4' },
      { label: 'AI助手', icon: '🤖', color: '#FFEAA7' },
      { label: '数据分析', icon: '📊', color: '#DDA0DD' }
    ]
  },
  'matrix-blocks': {
    component: MatrixBlocks,
    title: '系统启动中',
    subtitle: '正在初始化智能管理平台',
    duration: 4500,
    modules: [
      { label: '招生管理', icon: '🎯', color: 'var(--animation-matrix-primary)' },
      { label: '教学平台', icon: '📚', color: 'var(--animation-matrix-secondary)' },
      { label: '活动中心', icon: '🎪', color: 'var(--animation-matrix-accent)' },
      { label: '财务系统', icon: '💰', color: 'var(--animation-cube-primary)' },
      { label: 'AI助手', icon: '🤖', color: 'var(--animation-helix-accent)' },
      { label: '数据分析', icon: '📊', color: 'var(--animation-liquid-accent)' }
    ]
  },
  'helix-spiral': {
    component: HelixSpiral,
    title: '智能管理系统',
    subtitle: '正在为您构建数字化工作空间',
    duration: 5000,
    modules: [
      { label: 'AI智能助手', icon: '🤖', color: 'var(--animation-helix-primary)' },
      { label: '招生管理系统', icon: '🎯', color: 'var(--animation-helix-secondary)' },
      { label: '教学资源中心', icon: '📚', color: 'var(--animation-helix-accent)' },
      { label: '活动策划平台', icon: '🎪', color: 'var(--animation-cube-primary)' },
      { label: '财务管理工具', icon: '💎', color: 'var(--animation-cube-accent)' },
      { label: '数据分析引擎', icon: '📊', color: 'var(--animation-liquid-accent)' },
      { label: '家长互动门户', icon: '👨‍👩‍👧‍👦', color: 'var(--animation-neon-primary)' },
      { label: '教师协作空间', icon: '👥', color: 'var(--animation-neon-secondary)' }
    ]
  },
  'cube-explosion': {
    component: CubeExplosion,
    title: '系统重构中',
    subtitle: '正在组装您的智能管理平台',
    duration: 6000,
    modules: [
      { label: 'AI核心', icon: '🧠', color: 'var(--animation-cube-primary)' },
      { label: '数据中心', icon: '💾', color: 'var(--animation-cube-secondary)' },
      { label: '用户界面', icon: '🖥️', color: 'var(--animation-cube-accent)' },
      { label: '安全系统', icon: '🔒', color: 'var(--animation-helix-primary)' },
      { label: '通信模块', icon: '📡', color: 'var(--animation-cube-accent)' },
      { label: '分析引擎', icon: '⚙️', color: 'var(--animation-liquid-accent)' }
    ]
  },
  'liquid-flow': {
    component: LiquidFlow,
    title: '智能流体系统',
    subtitle: '正在为您构建无缝体验',
    duration: 4500,
    modules: [
      { label: 'AI智能核心', icon: '🧠', color: 'var(--animation-liquid-primary)' },
      { label: '数据流引擎', icon: '💫', color: 'var(--animation-liquid-secondary)' },
      { label: '用户界面', icon: '🎨', color: 'var(--animation-liquid-accent)' },
      { label: '安全防护', icon: '🛡️', color: 'var(--animation-helix-primary)' },
      { label: '通信协议', icon: '📡', color: 'var(--animation-cube-accent)' },
      { label: '分析算法', icon: '⚡', color: 'var(--animation-cube-primary)' }
    ]
  },
  'neon-grid': {
    component: NeonGrid,
    title: '神经网络激活',
    subtitle: '正在连接智能模块',
    duration: 5500,
    modules: [
      { label: 'AI核心', icon: '🧠', color: 'var(--animation-neon-primary)' },
      { label: '数据总线', icon: '🌐', color: 'var(--animation-neon-secondary)' },
      { label: '安全协议', icon: '🔐', color: 'var(--animation-neon-accent)' },
      { label: '通信接口', icon: '📡', color: 'var(--animation-particle-accent)' },
      { label: '分析引擎', icon: '⚡', color: 'var(--matrix-primary)' },
      { label: '存储单元', icon: '💾', color: 'var(--helix-accent)' }
    ]
  },
  'light-ripple': {
    component: LightRipple,
    title: '系统启动中',
    subtitle: '正在为您准备明亮的工作环境',
    duration: 4000,
    modules: [
      { label: '招生管理', icon: '🎓', color: 'var(--animation-light-ripple-primary)' },
      { label: '教学平台', icon: '📚', color: 'var(--animation-light-ripple-secondary)' },
      { label: '活动中心', icon: '🎪', color: 'var(--animation-light-ripple-accent)' },
      { label: '财务系统', icon: '💰', color: '#34d399' },
      { label: '数据分析', icon: '📊', color: '#f87171' },
      { label: 'AI助手', icon: '🤖', color: 'var(--animation-light-ripple-primary)' }
    ]
  },
  'dark-starfield': {
    component: DarkStarfield,
    title: '系统启动中',
    subtitle: '正在为您准备暗黑科技环境',
    duration: 4000,
    modules: [
      { label: 'AI核心', icon: '🧠', color: 'var(--animation-dark-starfield-primary)' },
      { label: '数据总线', icon: '🌐', color: 'var(--animation-dark-starfield-secondary)' },
      { label: '安全协议', icon: '🔐', color: 'var(--animation-dark-starfield-accent)' },
      { label: '通信接口', icon: '📡', color: '#10b981' },
      { label: '分析引擎', icon: '⚡', color: '#ef4444' },
      { label: '存储单元', icon: '💾', color: '#f87171' }
    ]
  }
}

// 随机选择动画类型
const selectedAnimationType = ref('')

const selectRandomAnimation = () => {
  const animationTypes = Object.keys(animationConfigs)
  const randomIndex = Math.floor(Math.random() * animationTypes.length)
  selectedAnimationType.value = animationTypes[randomIndex]
}

// 当前动画配置
const animationConfig = computed(() => {
  let type = props.type === 'random' ? selectedAnimationType.value : props.type

  // 如果是主题适配类型，根据当前主题返回相应配置
  if (type === 'theme-adaptive') {
    return {
      title: currentTheme.value === 'dark' ? '系统启动中' : '系统启动中',
      subtitle: currentTheme.value === 'dark' ? '正在为您准备暗黑科技环境' : '正在为您准备明亮的工作环境',
      duration: 4000,
      modules: currentTheme.value === 'dark' ? [
        { label: 'AI核心', icon: '🧠', color: 'var(--animation-dark-starfield-primary)' },
        { label: '数据总线', icon: '🌐', color: 'var(--animation-dark-starfield-secondary)' },
        { label: '安全协议', icon: '🔐', color: 'var(--animation-dark-starfield-accent)' },
        { label: '通信接口', icon: '📡', color: '#10b981' },
        { label: '分析引擎', icon: '⚡', color: '#ef4444' },
        { label: '存储单元', icon: '💾', color: '#f87171' }
      ] : [
        { label: '招生管理', icon: '🎓', color: 'var(--animation-light-ripple-primary)' },
        { label: '教学平台', icon: '📚', color: 'var(--animation-light-ripple-secondary)' },
        { label: '活动中心', icon: '🎪', color: 'var(--animation-light-ripple-accent)' },
        { label: '财务系统', icon: '💰', color: '#34d399' },
        { label: '数据分析', icon: '📊', color: '#f87171' },
        { label: 'AI助手', icon: '🤖', color: 'var(--animation-light-ripple-primary)' }
      ]
    }
  }

  return animationConfigs[type as keyof typeof animationConfigs] || animationConfigs.blocks
})

// 当前动画组件
const currentAnimationComponent = computed(() => {
  let type = props.type === 'random' ? selectedAnimationType.value : props.type

  // 如果是主题适配类型，根据当前主题返回相应组件
  if (type === 'theme-adaptive') {
    return currentTheme.value === 'dark' ? DarkStarfield : LightRipple
  }

  return animationConfigs[type as keyof typeof animationConfigs]?.component || BlocksAnimation
})

// 开始动画
const startAnimation = () => {
  if (props.type === 'random') {
    selectRandomAnimation()
  }
}

const onAnimationComplete = () => {
  emit('complete')
}

// 初始化动画类型
if (props.show && props.type === 'random' && !selectedAnimationType.value) {
  selectRandomAnimation()
}

// 监听show变化
watch(() => props.show, (newShow) => {
  if (newShow) {
    detectTheme() // 动画开始时检测主题
    startAnimation()
  }
})

// 组件挂载时检测主题
onMounted(() => {
  detectTheme()
})

// 暴露方法
defineExpose({
  selectRandomAnimation,
  startAnimation
})
</script>

<style scoped lang="scss">
.entrance-animations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--animation-z-index, 9999);

  /* 应用主题变量到容器 */
  background: var(--animation-bg-gradient, var(--bg-card));
  box-shadow: 0 0 var(--animation-shadow-blur, 40px) var(--animation-blocks-shadow, rgba(76, 175, 80, 0.3));
  transition: all var(--animation-enter-duration, 0.8s) var(--animation-easing-enter, cubic-bezier(0.23, 1, 0.32, 1));
}

/* 主题切换动画 */
.theme-transition-enter {
  opacity: 0;
  transform: scale(0.9);
}

.theme-transition-leave {
  opacity: 1;
  transform: scale(1);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .entrance-animations {
    --animation-shadow-blur: 20px;
  }
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  .entrance-actions {
    transition: none !important;
  }
}
</style>