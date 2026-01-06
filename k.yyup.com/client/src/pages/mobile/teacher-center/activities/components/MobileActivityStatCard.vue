<template>
  <div class="mobile-activity-stat-card" :class="{ 'animate-number': animateNumber }">
    <van-row gutter="16">
      <van-col span="6" v-for="(stat, index) in statsData" :key="index">
        <div class="stat-item" :style="{ '--accent-color': stat.color }">
          <div class="stat-icon">
            <van-icon :name="stat.icon" size="20" />
          </div>
          <div class="stat-value">
            <AnimatedNumber :value="stat.value" :duration="1000" />
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </van-col>
    </van-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface StatItem {
  label: string
  value: number
  icon: string
  color: string
}

interface Props {
  stats: {
    upcoming?: number
    participating?: number
    thisWeek?: number
    responsible?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  stats: () => ({
    upcoming: 0,
    participating: 0,
    thisWeek: 0,
    responsible: 0
  })
})

const animateNumber = ref(false)

const statsData = computed<StatItem[]>(() => [
  {
    label: '已发布活动',
    value: props.stats.upcoming || 0,
    icon: 'clock-o',
    color: '#ff6b35'
  },
  {
    label: '总报名人数',
    value: props.stats.participating || 0,
    icon: 'friends-o',
    color: '#409EFF'
  },
  {
    label: '总签到人数',
    value: props.stats.thisWeek || 0,
    icon: 'calendar-o',
    color: '#67c23a'
  },
  {
    label: '负责活动数',
    value: props.stats.responsible || 0,
    icon: 'medal-o',
    color: '#f56c6c'
  }
])

// 动画数字组件
const AnimatedNumber = {
  props: {
    value: { type: Number, default: 0 },
    duration: { type: Number, default: 1000 }
  },
  setup(props: any) {
    const displayValue = ref(0)

    const animateValue = () => {
      const start = 0
      const end = props.value
      const duration = props.duration
      const startTime = Date.now()

      const animate = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        displayValue.value = Math.floor(start + (end - start) * progress)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    }

    onMounted(animateValue)

    return () => displayValue.value
  }
}

onMounted(() => {
  setTimeout(() => {
    animateNumber.value = true
  }, 100)
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-activity-stat-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .stat-item {
    text-align: center;
    padding: var(--spacing-md) 8px;
    border-radius: 8px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 8px;
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .stat-value {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
      font-variant-numeric: tabular-nums;
    }

    .stat-label {
      font-size: var(--text-xs);
      color: var(--text-primary);
      font-weight: 500;
      line-height: 1.2;
    }
  }

  &.animate-number {
    .stat-item {
      animation: slideInUp 0.5s ease forwards;

      @for $i from 1 through 4 {
        &:nth-child(#{$i}) {
          animation-delay: #{($i - 1) * 0.1}s;
        }
      }
    }
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>