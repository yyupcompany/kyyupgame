<template>
  <el-card class="class-overview-card" shadow="hover" @click="$emit('click')">
    <div class="card-content">
      <div class="card-icon">
        <UnifiedIcon name="default" />
      </div>
      <div class="card-info">
        <div class="card-title">课程</div>
        <div class="card-stats">
          <div class="main-stat">
            <span class="number">{{ stats.total }}</span>
            <span class="label">负责班级</span>
          </div>
          <div class="sub-stats">
            <div class="stat-item">
              <span class="number today">{{ stats.todayClasses }}</span>
              <span class="label">今日课程</span>
            </div>
            <div class="stat-item">
              <span class="number students">{{ stats.studentsCount }}</span>
              <span class="label">学生总数</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-progress">
        <el-progress 
          :percentage="stats.completionRate" 
          :stroke-width="6"
          :show-text="false"
          :color="progressColor"
        />
        <div class="progress-text">教学完成率 {{ stats.completionRate }}%</div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { School } from '@element-plus/icons-vue'

interface ClassStats {
  total: number
  todayClasses: number
  studentsCount: number
  completionRate: number
}

interface Props {
  stats: ClassStats
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const progressColor = computed(() => {
  const rate = props.stats.completionRate
  if (rate >= 90) return 'var(--success-color)'
  if (rate >= 70) return 'var(--warning-color)'
  return 'var(--danger-color)'
})

const iconClass = computed(() => {
  const rate = props.stats.completionRate
  if (rate >= 90) return 'success'
  if (rate >= 70) return 'warning'
  return 'primary'
})
</script>

<style lang="scss" scoped>
.class-overview-card {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(var(--transform-hover-lift));
    box-shadow: 0 var(--spacing-sm) 25px var(--shadow-light);
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);
  }
  
  .card-icon {
    display: flex;
    justify-content: center;
    
    .icon {
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--text-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-3xl);
      
      &.primary {
        background-color: #f3e8ff;
        color: var(--ai-primary);
      }
      
      &.success {
        background-color: #e8f5e8;
        color: #4caf50;
      }
      
      &.warning {
        background-color: var(--bg-white)3cd;
        color: var(--warning-color);
      }
    }
  }
  
  .card-info {
    text-align: center;

    .card-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
    }

    .card-stats {
      .main-stat {
        margin-bottom: var(--spacing-md);

        .number {
          display: block;
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
      }

      .sub-stats {
        display: flex;
        justify-content: space-around;
        gap: var(--spacing-xs);

        .stat-item {
          flex: 1;

          .number {
            display: block;
            font-size: var(--text-base);
            font-weight: 600;
            line-height: 1;

            &.today {
              color: var(--primary-color);
            }

            &.students {
              color: var(--secondary-color);
            }
          }

          .label {
            font-size: var(--text-2xs);
            color: var(--text-muted);
          }
        }
      }
    }
  }

  .card-progress {
    .progress-text {
      text-align: center;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: var(--spacing-xs);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .class-overview-card {
    .card-content {
      gap: var(--text-sm);
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
