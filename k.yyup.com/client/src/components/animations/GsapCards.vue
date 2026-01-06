<template>
  <div v-if="show" class="gsap-cards-container">
    <!-- GSAP 3D卡片动画 -->
    <div class="cards-container">
      <div
        v-for="(card, index) in dynamicCards"
        :key="index"
        ref="cardElements"
        class="card-3d"
        :data-index="index"
        :style="{ '--card-color': card.color }"
      >
        <div class="card-face card-front">
          <div class="card-icon">{{ card.icon }}</div>
          <div class="card-title">{{ card.title }}</div>
        </div>
        <div class="card-face card-back">
          <div class="card-description">{{ card.description }}</div>
          <div class="card-progress">
            <div class="progress-ring" :style="{ strokeDasharray: `${cardProgress[index]} 251.2`, borderColor: card.color }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中心信息 -->
    <div class="center-info">
      <h1 ref="titleElement">{{ dynamicTitle }}</h1>
      <p ref="subtitleElement">{{ dynamicSubtitle }}</p>
      <div class="loading-dots">
        <span v-for="i in 3" :key="i" class="dot" :style="{ animationDelay: `${i * 0.2}s` }"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { gsap } from 'gsap'
import { getRandomModulesForAnimation, getRoleDisplayName, getRoleModuleList } from '@/utils/animation-modules'
import { useUserStore } from '@/stores/user'

interface Card {
  title: string
  icon: string
  color: string
  description: string
}

interface Props {
  show?: boolean
  title?: string
  subtitle?: string
  duration?: number
  userRole?: string
  cards?: Card[]
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  title: '欢迎回来',
  subtitle: '正在加载您的个性化设置',
  duration: 3500,
  userRole: 'admin'
})

const userStore = useUserStore()

// 基于角色动态生成卡片数据
const dynamicCards = computed(() => {
  if (props.cards && props.cards.length > 0) {
    return props.cards
  }

  // 从模块数据生成卡片
  const roleModules = getRandomModulesForAnimation(props.userRole, 9)
  return roleModules.map(module => ({
    title: module.title,
    icon: getModuleIcon(module.icon),
    color: module.color || '#4CAF50',
    description: getModuleDescription(module.title)
  }))
})

// 根据角色生成个性化标题和副标题
const dynamicTitle = computed(() => {
  if (props.title !== '欢迎回来') {
    return props.title
  }
  const roleName = getRoleDisplayName(props.userRole)
  return `欢迎${roleName}回来`
})

const dynamicSubtitle = computed(() => {
  if (props.subtitle !== '正在加载您的个性化设置') {
    return props.subtitle
  }
  const moduleCount = getRoleModuleList(props.userRole).length
  return `正在为您加载${moduleCount}个功能模块...`
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

// 工具函数：获取模块描述
const getModuleDescription = (title: string): string => {
  const descriptionMap: { [key: string]: string } = {
    '管理控制台': '系统总览与控制',
    '业务中心': '核心业务流程管理',
    '活动中心': '活动策划与执行',
    '招生中心': '智能招生解决方案',
    '客户池中心': '客户关系管理',
    '任务中心': '任务分配与跟踪',
    '话术中心': '销售话术库管理',
    '文档中心': '统一的文档模板和实例管理',
    '财务中心': '财务数据分析',
    '营销中心': '营销策略与执行',
    '呼叫中心': '客户沟通服务',
    '媒体中心': '多媒体内容管理',
    '人员中心': '人力资源配置',
    '教学中心': '教学质量管理',
    '测评中心': '能力评估系统',
    '考勤中心': '考勤数据管理',
    '数据分析中心': '深度数据洞察',
    '用量中心': '资源使用监控',
    '集团中心': '集团化管理',
    '督查中心': '质量监督检查',
    '系统中心': '系统配置管理',
    'AI中心': '智能服务支持',
    '教师工作台': '教师工作平台',
    '通知中心': '消息通知管理',
    '教师教学中心': '教学任务管理',
    '客户跟踪': '客户跟进服务',
    '创意课程': '课程创新设计',
    '考勤管理': '学生考勤记录',
    '我的首页': '个人工作台',
    '我的孩子': '孩子信息管理',
    '成长报告': '成长轨迹记录',
    '能力测评': '综合能力评估',
    '游戏大厅': '益智游戏学习',
    'AI育儿助手': '智能育儿指导',
    '活动列表': '活动报名管理',
    '家园沟通': '家校互动平台',
    '反馈建议': '意见反馈渠道',
    '分享统计': '分享数据分析'
  }
  return descriptionMap[title] || '功能服务支持'
}

const emit = defineEmits<{
  complete: []
}>()

const cardElements = ref<HTMLElement[]>([])
const titleElement = ref<HTMLElement>()
const subtitleElement = ref<HTMLElement>()
const cardProgress = ref<number[]>([])

// 初始化进度
const initializeProgress = () => {
  cardProgress.value = new Array(dynamicCards.value.length).fill(0)
}

// 开始GSAP动画
const startGSAPAnimation = async () => {
  await nextTick()
  initializeProgress()

  const tl = gsap.timeline({
    onComplete: () => {
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  })

  // 标题动画
  tl.fromTo(titleElement.value,
    { opacity: 0, y: -50, scale: 0.8 },
    { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.7)' }
  )
  .fromTo(subtitleElement.value,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
    '-=0.5'
  )

  // 卡片动画
  cardElements.value.forEach((card, index) => {
    const cardData = dynamicCards.value[index]
    const delay = index * 0.1

    // 卡片入场动画
    tl.fromTo(card,
      {
        opacity: 0,
        rotationY: -90,
        scale: 0.5,
        z: -200
      },
      {
        opacity: 1,
        rotationY: 0,
        scale: 1,
        z: 0,
        duration: 1,
        ease: 'back.out(1.7)',
        delay
      },
      '-=0.8'
    )

    // 卡片悬停和翻转动画
    tl.to(card, {
      rotationY: 360,
      duration: 1.5,
      ease: 'power2.inOut',
      delay: delay + 0.5
    })

    // 进度环动画
    tl.to(cardProgress.value, {
      [index]: 251.2,
      duration: 1,
      ease: 'power2.out',
      delay: delay + 1,
      onUpdate: () => {
        const progress = (cardProgress.value[index] / 251.2) * 100
        cardProgress.value[index] = (progress / 100) * 251.2
      }
    })
  })

  // 最终收缩动画
  tl.to(cardElements.value, {
    scale: 0.8,
    opacity: 0.3,
    duration: 0.5,
    ease: 'power2.in'
  }, '+=0.5')
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    startGSAPAnimation()
  }
})

onMounted(() => {
  if (props.show) {
    startGSAPAnimation()
  }
})
</script>

<style scoped lang="scss">
.gsap-cards-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #1a2a6c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  perspective: 1500px;
  overflow: hidden;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
  max-width: 800px;
}

.card-3d {
  width: 180px;
  height: 200px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: rotateY(180deg) scale(1.05);
  }
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-front {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--card-color, #4CAF50);
    box-shadow: 0 0 10px var(--card-color, #4CAF50);
  }

  .card-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}

.card-back {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: rotateY(180deg);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--card-color, #4CAF50);
    box-shadow: 0 0 10px var(--card-color, #4CAF50);
  }

  .card-description {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    opacity: 0.9;
    font-weight: 500;
  }
}

.card-progress {
  position: relative;
  width: 60px;
  height: 60px;

  .progress-ring {
    width: 100%;
    height: 100%;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top: 3px solid var(--card-color, #4CAF50);
    border-radius: 50%;
    transform: rotate(-90deg);
    transition: stroke-dasharray 0.3s ease, border-color 0.3s ease;
    box-shadow: 0 0 8px var(--card-color, #4CAF50);
  }
}

.center-info {
  text-align: center;
  color: white;
  z-index: 10;

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 1.3rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  .loading-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;

    .dot {
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 90%;
  }

  .card-3d {
    width: 140px;
    height: 160px;
  }

  .card-face {
    padding: 1rem;

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .card-title {
      font-size: 1rem;
    }
  }

  .center-info {
    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1.1rem;
    }
  }
}
</style>