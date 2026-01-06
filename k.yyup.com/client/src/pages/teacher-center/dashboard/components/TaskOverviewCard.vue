<template>
  <el-card class="task-overview-card" shadow="hover" @click="$emit('click')">
    <div class="card-content">
      <div class="card-icon">
        <UnifiedIcon name="default" />
      </div>
      <div class="card-info">
        <div class="card-title">任务</div>
        <div class="card-stats">
          <div class="main-stat">
            <span class="number">{{ stats.total }}</span>
            <span class="label">总任务</span>
          </div>
          <div class="sub-stats">
            <div class="stat-item">
              <span class="number completed">{{ stats.completed }}</span>
              <span class="label">已完成</span>
            </div>
            <div class="stat-item">
              <span class="number pending">{{ stats.pending }}</span>
              <span class="label">进行中</span>
            </div>
            <div class="stat-item" v-if="stats.overdue > 0">
              <span class="number overdue">{{ stats.overdue }}</span>
              <span class="label">已逾期</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-progress">
        <el-progress 
          :percentage="completionPercentage" 
          :stroke-width="6"
          :show-text="false"
          :color="progressColor"
        />
        <div class="progress-text">完成率 {{ completionPercentage }}%</div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { List } from '@element-plus/icons-vue'

interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
}

interface Props {
  stats: TaskStats
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const completionPercentage = computed(() => {
  if (props.stats.total === 0) return 0
  return Math.round((props.stats.completed / props.stats.total) * 100)
})

const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return 'var(--success-color)'
  if (percentage >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
})

const iconClass = computed(() => {
  if (props.stats.overdue > 0) return 'danger'
  if (completionPercentage.value >= 80) return 'success'
  return 'primary'
})
</script>

<style lang="scss" scoped>
.task-overview-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-xl);
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .card-icon {
    display: flex;
    justify-content: center;

    .icon {
      width: 6var(--spacing-xs); height: 6var(--spacing-xs);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-3xl);

      &.primary {
        background-color: var(--primary-extra-light);
        color: var(--primary-color);
      }

      &.success {
        background-color: var(--success-extra-light);
        color: var(--success-color);
      }

      &.danger {
        background-color: var(--danger-extra-light);
        color: var(--danger-color);
      }
    }
  }
  
  .card-info {
    text-align: center;

    .card-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .card-stats {
      .main-stat {
        margin-bottom: var(--spacing-sm);
        
        .number {
          display: block;
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          line-height: var(--leading-tight);
        }

        .label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
      
      .sub-stats {
        display: flex;
        justify-content: space-around;
        gap: var(--spacing-sm);

        .stat-item {
          flex: 1;

          .number {
            display: block;
            font-size: var(--text-lg);
            font-weight: var(--font-semibold);
            line-height: var(--leading-tight);
            
            &.completed {
              color: var(--success-color);
            }
            
            &.pending {
              color: var(--warning-color);
            }
            
            &.overdue {
              color: var(--danger-color);
            }
          }
          
          .label {
            font-size: var(--text-xs);
            color: var(--text-tertiary);
          }
        }
      }
    }
  }
  
  .card-progress {
    .progress-text {
      text-align: center;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-top: var(--spacing-sm);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .task-overview-card {
    .card-content {
      gap: var(--spacing-md);
    }
    
    .card-info {
      .card-stats {
        .main-stat {
          .number {
            font-size: var(--text-3xl);
          }
        }
        
        .sub-stats {
          .stat-item {
            .number {
              font-size: var(--text-base);
            }
          }
        }
      }
    }
  }
}
</style>
