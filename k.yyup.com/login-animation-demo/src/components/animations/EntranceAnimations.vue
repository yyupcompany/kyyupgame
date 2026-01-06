<template>
  <div v-if="showAnimation" class="entrance-animations">
    <!-- 动态组件渲染 -->
    <component
      :is="currentAnimationComponent"
      :show="showAnimation"
      :title="animationConfig.title"
      :subtitle="animationConfig.subtitle"
      :duration="animationConfig.duration"
      :modules="animationConfig.modules"
      @complete="onAnimationComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BlocksAnimation from './BlocksAnimation.vue'
import GsapCards from './GsapCards.vue'
import ParticleWave from './ParticleWave.vue'
import MatrixBlocks from './MatrixBlocks.vue'
import HelixSpiral from '../animations-more/HelixSpiral.vue'
import CubeExplosion from '../animations-more/CubeExplosion.vue'
import LiquidFlow from '../animations-more/LiquidFlow.vue'
import NeonGrid from '../animations-more/NeonGrid.vue'

interface AnimationConfig {
  title: string
  subtitle: string
  duration: number
  modules: { label: string; icon: string; color: string }[]
}

interface Props {
  show?: boolean
  type?: 'random' | 'blocks' | 'gsap-cards' | 'particle-wave' | 'matrix-blocks' | 'helix-spiral' | 'cube-explosion' | 'liquid-flow' | 'neon-grid'
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  type: 'random'
})

const emit = defineEmits<{
  complete: []
}>()

// 所有动画配置
const animationConfigs = {
  'blocks': {
    component: BlocksAnimation,
    title: '欢迎使用系统',
    subtitle: '正在为您准备最佳体验...',
    duration: 3000,
    modules: [
      { label: '招生管理', icon: '🎓', color: '#4CAF50' },
      { label: '教学中心', icon: '📚', color: '#2196F3' },
      { label: '活动管理', icon: '🎪', color: '#FF9800' },
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
      { label: '招生中心', icon: '🎓', color: '#4CAF50', description: '智能招生管理' },
      { label: '教学平台', icon: '📚', color: '#2196F3', description: '现代化教学工具' },
      { label: '活动管理', icon: '🎪', color: '#FF9800', description: '丰富的活动策划' },
      { label: '财务系统', icon: '💰', color: '#9C27B0', description: '专业财务管理' },
      { label: 'AI助手', icon: '🤖', color: '#00BCD4', description: '智能服务支持' },
      { label: '数据分析', icon: '📊', color: '#F44336', description: '深度数据洞察' }
    ]
  },
  'particle-wave': {
    component: ParticleWave,
    title: '智能管理系统',
    subtitle: '正在为您打造最佳的工作环境',
    duration: 4000,
    modules: [
      { label: '招生管理', icon: '🎯', color: '#FF6B6B' },
      { label: '教学平台', icon: '📖', color: '#4ECDC4' },
      { label: '活动中心', icon: '🎉', color: '#45B7D1' },
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
      { label: '招生管理', icon: '🎯', color: '#FF006E' },
      { label: '教学平台', icon: '📚', color: '#FB5607' },
      { label: '活动中心', icon: '🎪', color: '#FFBE0B' },
      { label: '财务系统', icon: '💰', color: '#8338EC' },
      { label: 'AI助手', icon: '🤖', color: '#3A86FF' },
      { label: '数据分析', icon: '📊', color: '#06FFB4' }
    ]
  },
  'helix-spiral': {
    component: HelixSpiral,
    title: '智能管理系统',
    subtitle: '正在为您构建数字化工作空间',
    duration: 5000,
    modules: [
      { label: 'AI智能助手', icon: '🤖', color: '#FF006E' },
      { label: '招生管理系统', icon: '🎯', color: '#FB5607' },
      { label: '教学资源中心', icon: '📚', color: '#FFBE0B' },
      { label: '活动策划平台', icon: '🎪', color: '#8338EC' },
      { label: '财务管理工具', icon: '💎', color: '#3A86FF' },
      { label: '数据分析引擎', icon: '📊', color: '#06FFB4' },
      { label: '家长互动门户', icon: '👨‍👩‍👧‍👦', color: '#FF4365' },
      { label: '教师协作空间', icon: '👥', color: '#00D9FF' }
    ]
  },
  'cube-explosion': {
    component: CubeExplosion,
    title: '系统重构中',
    subtitle: '正在组装您的智能管理平台',
    duration: 6000,
    modules: [
      { label: 'AI核心', icon: '🧠', color: '#FF006E' },
      { label: '数据中心', icon: '💾', color: '#FB5607' },
      { label: '用户界面', icon: '🖥️', color: '#FFBE0B' },
      { label: '安全系统', icon: '🔒', color: '#8338EC' },
      { label: '通信模块', icon: '📡', color: '#3A86FF' },
      { label: '分析引擎', icon: '⚙️', color: '#06FFB4' }
    ]
  },
  'liquid-flow': {
    component: LiquidFlow,
    title: '智能流体系统',
    subtitle: '正在为您构建无缝体验',
    duration: 4500,
    modules: [
      { label: 'AI智能核心', icon: '🧠', color: '#FF006E' },
      { label: '数据流引擎', icon: '💫', color: '#FB5607' },
      { label: '用户界面', icon: '🎨', color: '#FFBE0B' },
      { label: '安全防护', icon: '🛡️', color: '#8338EC' },
      { label: '通信协议', icon: '📡', color: '#3A86FF' },
      { label: '分析算法', icon: '⚡', color: '#06FFB4' }
    ]
  },
  'neon-grid': {
    component: NeonGrid,
    title: '神经网络激活',
    subtitle: '正在连接智能模块',
    duration: 5500,
    modules: [
      { label: 'AI核心', icon: '🧠', color: '#00ffff' },
      { label: '数据总线', icon: '🌐', color: '#ff00ff' },
      { label: '安全协议', icon: '🔐', color: '#ffff00' },
      { label: '通信接口', icon: '📡', color: '#00ff00' },
      { label: '分析引擎', icon: '⚡', color: '#ff6600' },
      { label: '存储单元', icon: '💾', color: '#ff0099' }
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
  const type = props.type === 'random' ? selectedAnimationType.value : props.type
  return animationConfigs[type as keyof typeof animationConfigs] || animationConfigs.blocks
})

// 当前动画组件
const currentAnimationComponent = computed(() => {
  const type = props.type === 'random' ? selectedAnimationType.value : props.type
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

// 监听show变化
watch(() => props.show, (newShow) => {
  if (newShow) {
    startAnimation()
  }
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
  z-index: 9999;
}
</style>