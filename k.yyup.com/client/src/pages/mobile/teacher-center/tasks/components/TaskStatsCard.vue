<template>
  <div class="task-stats-card">
    <van-card class="stats-overview-card">
      <template #title>
        <div class="card-header">
          <div class="title-left">
            <van-icon name="chart-trending-o" />
            <span class="title-text">{{ title }}</span>
          </div>
          <div class="title-right" v-if="showPercentage">
            <span class="percentage" :style="{ color: progressColor }">
              {{ completionPercentage }}%
            </span>
          </div>
        </div>
      </template>
      
      <!-- 紧凑型统计网格 -->
      <div class="stats-grid-compact" v-if="compact">
        <div class="stat-item-horizontal" v-for="stat in stats" :key="stat.key">
          <div class="stat-icon" :class="stat.type">
            <van-icon :name="stat.icon" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
      
      <!-- 标准型统计网格 -->
      <div class="stats-grid" v-else>
        <div class="stat-item" v-for="stat in stats" :key="stat.key">
          <div class="stat-icon" :class="stat.type">
            <van-icon :name="stat.icon" />
          </div>
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
      
      <!-- 进度条展示 -->
      <div class="progress-section" v-if="showProgress">
        <div class="progress-header">
          <span class="progress-label">完成进度</span>
          <span class="progress-percentage">{{ completionPercentage }}%</span>
        </div>
        <van-progress
          :percentage="completionPercentage"
          stroke-width="8"
          :color="progressColor"
          track-color="#f0f0f0"
        />
      </div>
    </van-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StatItem {
  key: string
  label: string
  value: number
  icon: string
  type: 'total' | 'completed' | 'pending' | 'overdue'
}

interface Props {
  title?: string
  stats: StatItem[]
  showProgress?: boolean
  showPercentage?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '任务统计',
  showProgress: false,
  showPercentage: false,
  compact: false
})

// 计算完成率
const completionPercentage = computed(() => {
  const total = props.stats.find(stat => stat.key === 'total')?.value || 0
  const completed = props.stats.find(stat => stat.key === 'completed')?.value || 0
  
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
})

// 进度条颜色
const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return '#07c160'
  if (percentage >= 60) return '#409eff'
  return '#ee0a24'
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.task-stats-card {
  .stats-overview-card {
    border-radius: 12px;
    overflow: hidden;
    margin: var(--spacing-md) 16px;
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .title-left {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        
        .van-icon {
          color: var(--text-primary);
          font-size: var(--text-lg);
        }
        
        .title-text {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }
      }
      
      .title-right {
        .percentage {
          font-size: var(--text-lg);
          font-weight: 700;
        }
      }
    }
  }
}

// 紧凑型布局
.stats-grid-compact {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  
  .stat-item-horizontal {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--primary-color);
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: var(--text-lg);
      
      &.total {
        background: var(--primary-color);
        color: var(--text-primary);
      }
      
      &.completed {
        background: var(--primary-color);
        color: var(--text-primary);
      }
      
      &.pending {
        background: var(--primary-color);
        color: var(--text-primary);
      }
      
      &.overdue {
        background: var(--primary-color);
        color: var(--text-primary);
      }
    }
    
    .stat-content {
      flex: 1;
      
      .stat-value {
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1;
        margin-bottom: 2px;
      }
      
      .stat-label {
        font-size: var(--text-xs);
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  }
}

// 标准型布局
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .stat-item {
    text-align: center;
    padding: var(--spacing-md);
    background: var(--primary-color);
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      font-size: var(--text-2xl);
      
      &.total {
        background: linear-gradient(135deg, #409eff, #66b3ff);
        color: white;
      }
      
      &.completed {
        background: linear-gradient(135deg, #07c160, #4caf50);
        color: white;
      }
      
      &.pending {
        background: linear-gradient(135deg, #ff976a, #ffc107);
        color: white;
      }
      
      &.overdue {
        background: linear-gradient(135deg, #ee0a24, #f44336);
        color: white;
      }
    }
    
    .stat-number {
      font-size: var(--text-3xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
      line-height: 1;
    }
    
    .stat-label {
      font-size: var(--text-sm);
      color: var(--text-primary);
      font-weight: 500;
    }
  }
}

// 进度条部分
.progress-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .progress-label {
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .progress-percentage {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}

// Vant组件样式覆盖
:deep(.van-card) {
  background: var(--card-bg);
  
  .van-card__header {
    padding: var(--spacing-md) 16px 12px;
  }
  
  .van-card__content {
    padding: 0 16px 16px;
  }
}

:deep(.van-progress) {
  .van-progress__portion {
    border-radius: 4px;
  }
}

// 响应式设计
@media (max-width: 767px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    
    .stat-item {
      padding: var(--spacing-md);
      
      .stat-icon {
        width: 40px;
        height: 40px;
        font-size: var(--text-xl);
        margin-bottom: 8px;
      }
      
      .stat-number {
        font-size: var(--text-2xl);
      }
      
      .stat-label {
        font-size: var(--text-xs);
      }
    }
  }
}
</style>