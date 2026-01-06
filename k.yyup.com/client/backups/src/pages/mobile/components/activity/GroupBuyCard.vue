<template>
  <div class="group-buy-card">
    <div class="group-buy-header">
      <h3 class="header-title">🎉 团购优惠</h3>
      <div class="group-buy-badge" :class="badgeClass">{{ badgeText }}</div>
    </div>
    
    <div class="group-buy-content">
      <!-- 价格对比 -->
      <div class="price-comparison">
        <div class="price-item">
          <span class="price-label">原价</span>
          <span class="original-price">¥{{ originalPrice }}</span>
        </div>
        <div class="price-item">
          <span class="price-label">团购价</span>
          <span class="group-price">¥{{ groupPrice }}</span>
        </div>
        <div class="save-amount">
          <span class="save-text">省 ¥{{ saveAmount }}</span>
        </div>
      </div>
      
      <!-- 团购进度 -->
      <div class="group-progress">
        <div class="progress-header">
          <span class="progress-text">团购进度</span>
          <span class="progress-count">{{ currentCount }}/{{ minCount }}人</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="progress-description">
          <span v-if="remainingCount > 0">
            还差 <strong>{{ remainingCount }}</strong> 人成团
          </span>
          <span v-else class="success-text">
            🎉 团购成功！
          </span>
        </div>
      </div>
      
      <!-- 倒计时 -->
      <div class="countdown-section" v-if="!isExpired">
        <div class="countdown-header">
          <svg class="clock-icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
          </svg>
          <span class="countdown-label">团购截止</span>
        </div>
        <div class="countdown-time">{{ countdown }}</div>
        <div class="deadline-text">{{ formatDeadline(deadline) }}</div>
      </div>
      
      <!-- 已过期提示 -->
      <div class="expired-section" v-else>
        <div class="expired-icon">⏰</div>
        <div class="expired-text">团购已结束</div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="group-buy-actions">
      <button 
        class="join-group-btn"
        :class="buttonClass"
        @click="handleJoinGroup"
        :disabled="isDisabled"
      >
        {{ buttonText }}
      </button>
      
      <button 
        v-if="showShareButton"
        class="share-group-btn"
        @click="handleShare"
      >
        <svg class="share-icon" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
        邀请好友
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  originalPrice: number
  groupPrice: number
  minCount: number
  currentCount: number
  deadline: string
  isJoined?: boolean
  showShareButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isJoined: false,
  showShareButton: true
})

const emit = defineEmits<{
  joinGroup: []
  share: []
}>()

// 响应式数据
const countdown = ref('')
const timer = ref<NodeJS.Timeout>()

// 计算属性
const saveAmount = computed(() => {
  return props.originalPrice - props.groupPrice
})

const progressPercentage = computed(() => {
  return Math.min((props.currentCount / props.minCount) * 100, 100)
})

const remainingCount = computed(() => {
  return Math.max(props.minCount - props.currentCount, 0)
})

const isExpired = computed(() => {
  return new Date(props.deadline) <= new Date()
})

const isSuccess = computed(() => {
  return props.currentCount >= props.minCount
})

const isDisabled = computed(() => {
  return isExpired.value || (props.isJoined && !isSuccess.value)
})

const badgeClass = computed(() => {
  if (isExpired.value) return 'badge-expired'
  if (isSuccess.value) return 'badge-success'
  return 'badge-active'
})

const badgeText = computed(() => {
  if (isExpired.value) return '已结束'
  if (isSuccess.value) return '团购成功'
  return '进行中'
})

const buttonClass = computed(() => {
  if (isExpired.value) return 'btn-expired'
  if (props.isJoined) return 'btn-joined'
  if (isSuccess.value) return 'btn-success'
  return 'btn-active'
})

const buttonText = computed(() => {
  if (isExpired.value) return '团购已结束'
  if (props.isJoined && isSuccess.value) return '团购成功'
  if (props.isJoined) return '已参团'
  return '立即参团'
})

// 方法
const formatDeadline = (deadline: string) => {
  const date = new Date(deadline)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateCountdown = () => {
  const now = Date.now()
  const deadlineTime = new Date(props.deadline).getTime()
  const diff = deadlineTime - now
  
  if (diff <= 0) {
    countdown.value = '已结束'
    return
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  if (days > 0) {
    countdown.value = `${days}天 ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    countdown.value = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

const handleJoinGroup = () => {
  if (!isDisabled.value) {
    emit('joinGroup')
  }
}

const handleShare = () => {
  emit('share')
}

// 生命周期
onMounted(() => {
  updateCountdown()
  timer.value = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style lang="scss" scoped>
.group-buy-card {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  border-radius: var(--text-sm);
  padding: var(--text-lg);
  margin: var(--text-lg) 0;
  border: var(--border-width-base) solid #FFB74D;
}

.group-buy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--text-lg);
}

.header-title {
  font-size: var(--text-xl);
  font-weight: 600;
  margin: 0;
  color: #E65100;
}

.group-buy-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--text-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  
  &.badge-active {
    background: #4CAF50;
    color: white;
  }
  
  &.badge-success {
    background: #2196F3;
    color: white;
  }
  
  &.badge-expired {
    background: #9E9E9E;
    color: white;
  }
}

.group-buy-content {
  margin-bottom: var(--text-lg);
}

.price-comparison {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
  margin-bottom: var(--text-lg);
  padding: var(--text-sm);
  background: var(--white-alpha-80);
  border-radius: var(--spacing-sm);
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.price-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.original-price {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  text-decoration: line-through;
}

.group-price {
  font-size: var(--text-xl);
  font-weight: 600;
  color: #FF5722;
}

.save-amount {
  margin-left: auto;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: #FF5722;
  border-radius: var(--text-sm);
}

.save-text {
  font-size: var(--text-sm);
  color: white;
  font-weight: 500;
}

.group-progress {
  margin-bottom: var(--text-lg);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.progress-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: 500;
}

.progress-count {
  font-size: var(--text-base);
  color: #FF5722;
  font-weight: 600;
}

.progress-bar {
  height: var(--spacing-sm);
  background: var(--white-alpha-80);
  border-radius: var(--spacing-xs);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF9800 0%, #FF5722 100%);
  border-radius: var(--spacing-xs);
  transition: width 0.3s ease;
}

.progress-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
}

.success-text {
  color: #4CAF50;
  font-weight: 500;
}

.countdown-section {
  padding: var(--text-sm);
  background: var(--white-alpha-80);
  border-radius: var(--spacing-sm);
  text-align: center;
}

.countdown-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.clock-icon {
  width: var(--text-lg);
  height: var(--text-lg);
  fill: #FF5722;
}

.countdown-label {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: 500;
}

.countdown-time {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: #FF5722;
  margin-bottom: var(--spacing-xs);
  font-family: 'Courier New', monospace;
}

.deadline-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.expired-section {
  text-align: center;
  padding: var(--text-lg);
}

.expired-icon {
  font-size: var(--text-3xl);
  margin-bottom: var(--spacing-sm);
}

.expired-text {
  font-size: var(--text-base);
  color: var(--text-tertiary);
}

.group-buy-actions {
  display: flex;
  gap: var(--text-sm);
}

.join-group-btn {
  flex: 1;
  padding: var(--text-sm);
  border: none;
  border-radius: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.btn-active {
    background: #FF5722;
    color: white;
    
    &:active {
      background: #E64A19;
      transform: scale(0.98);
    }
  }
  
  &.btn-joined {
    background: #4CAF50;
    color: white;
  }
  
  &.btn-success {
    background: #2196F3;
    color: white;
  }
  
  &.btn-expired {
    background: #9E9E9E;
    color: white;
    cursor: not-allowed;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.share-group-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--text-sm) var(--text-lg);
  background: white;
  color: #FF5722;
  border: var(--border-width-base) solid #FF5722;
  border-radius: var(--spacing-sm);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active {
    background: #FFF3E0;
    transform: scale(0.98);
  }
}

.share-icon {
  width: var(--text-lg);
  height: var(--text-lg);
  fill: currentColor;
}

// 响应式设计
@media (max-width: 375px) {
  .group-buy-card {
    padding: var(--text-sm);
    margin: var(--text-sm) 0;
  }
  
  .price-comparison {
    gap: var(--text-sm);
    padding: var(--spacing-sm);
  }
  
  .group-price {
    font-size: var(--text-lg);
  }
  
  .countdown-time {
    font-size: var(--text-xl);
  }
}
</style>
