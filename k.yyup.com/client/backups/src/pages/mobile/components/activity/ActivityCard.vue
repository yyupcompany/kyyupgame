<template>
  <div class="activity-card" @click="handleClick">
    <!-- 活动图片 -->
    <div class="activity-image">
      <img 
        :src="activity.posterUrl || '/default-poster.jpg'" 
        :alt="activity.title"
        @error="handleImageError"
      />
      <div class="activity-status" :class="statusClass">
        {{ statusText }}
      </div>
    </div>
    
    <!-- 活动信息 -->
    <div class="activity-content">
      <h3 class="activity-title">{{ activity.title }}</h3>
      <p class="activity-description">{{ activity.description }}</p>
      
      <div class="activity-meta">
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>{{ formatDate(activity.startTime) }}</span>
        </div>
        
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{{ activity.location }}</span>
        </div>
        
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
          </svg>
          <span v-if="activity.isFree" class="free-tag">免费</span>
          <span v-else class="price">¥{{ activity.price }}</span>
        </div>
      </div>
      
      <!-- 团购信息 -->
      <div v-if="activity.groupBuyEnabled" class="group-buy-info">
        <span class="group-buy-tag">团购</span>
        <span class="group-buy-text">{{ activity.groupBuyMinCount }}人团购 ¥{{ activity.groupBuyPrice }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Activity {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  posterUrl?: string
  isFree: boolean
  price: number
  status: string
  groupBuyEnabled: boolean
  groupBuyMinCount: number
  groupBuyPrice: number
}

interface Props {
  activity: Activity
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [activity: Activity]
}>()

// 计算属性
const statusClass = computed(() => {
  switch (props.activity.status) {
    case 'published': return 'status-published'
    case 'draft': return 'status-draft'
    case 'ended': return 'status-ended'
    default: return 'status-unknown'
  }
})

const statusText = computed(() => {
  switch (props.activity.status) {
    case 'published': return '报名中'
    case 'draft': return '未发布'
    case 'ended': return '已结束'
    default: return '未知'
  }
})

// 方法
const formatDate = (dateTime: string) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleClick = () => {
  emit('click', props.activity)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/default-poster.jpg'
}
</script>

<style lang="scss" scoped>
.activity-card {
  background: white;
  border-radius: var(--text-sm);
  overflow: hidden;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 var(--border-width-base) var(--spacing-xs) var(--shadow-light);
  }
}

.activity-image {
  position: relative;
  height: 160px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.activity-status {
  position: absolute;
  top: var(--text-sm);
  right: var(--text-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--text-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  
  &.status-published {
    background: rgba(76, 175, 80, 0.9);
    color: white;
  }
  
  &.status-draft {
    background: rgba(255, 152, 0, 0.9);
    color: white;
  }
  
  &.status-ended {
    background: rgba(158, 158, 158, 0.9);
    color: white;
  }
}

.activity-content {
  padding: var(--text-lg);
}

.activity-title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0 0 var(--text-sm) 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--text-sm);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.meta-icon {
  width: var(--text-base);
  height: var(--text-base);
  fill: currentColor;
  flex-shrink: 0;
}

.free-tag {
  background: #4CAF50;
  color: white;
  padding: var(--spacing-sm) 6px;
  border-radius: var(--spacing-xs);
  font-size: var(--text-2xs);
  font-weight: 500;
}

.price {
  color: #FF5722;
  font-weight: 600;
}

.group-buy-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--text-sm);
  background: #FFF3E0;
  border-radius: var(--radius-md);
}

.group-buy-tag {
  background: #FF9800;
  color: white;
  padding: var(--spacing-sm) 6px;
  border-radius: var(--spacing-xs);
  font-size: var(--text-2xs);
  font-weight: 500;
}

.group-buy-text {
  font-size: var(--text-sm);
  color: #E65100;
  font-weight: 500;
}

// 响应式设计
@media (max-width: 375px) {
  .activity-content {
    padding: var(--text-sm);
  }
  
  .activity-title {
    font-size: var(--text-base);
  }
  
  .activity-description {
    font-size: var(--text-sm);
  }
}
</style>
