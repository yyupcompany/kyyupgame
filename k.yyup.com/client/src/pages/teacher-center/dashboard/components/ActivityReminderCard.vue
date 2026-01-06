<template>
  <el-card class="activity-reminder-card" shadow="hover" @click="$emit('click')">
    <div class="card-content">
      <div class="card-icon">
        <UnifiedIcon name="default" />
      </div>
      <div class="card-info">
        <div class="card-title">活动</div>
        <div class="card-stats">
          <div class="main-stat">
            <span class="number">{{ stats.upcoming }}</span>
            <span class="label">即将开始</span>
          </div>
          <div class="sub-stats">
            <div class="stat-item">
              <span class="number participating">{{ stats.participating }}</span>
              <span class="label">参与活动</span>
            </div>
            <div class="stat-item">
              <span class="number this-week">{{ stats.thisWeek }}</span>
              <span class="label">本周活动</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div class="reminder-badge" v-if="stats.upcoming > 0">
          <UnifiedIcon name="default" />
          <span>有 {{ stats.upcoming }} 个活动即将开始</span>
        </div>
        <div class="no-reminder" v-else>
          <span>暂无即将开始的活动</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Trophy, Clock } from '@element-plus/icons-vue'

interface ActivityStats {
  upcoming: number
  participating: number
  thisWeek: number
}

interface Props {
  stats: ActivityStats
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const iconClass = computed(() => {
  if (props.stats.upcoming > 0) return 'warning'
  return 'primary'
})
</script>

<style lang="scss" scoped>
.activity-reminder-card {
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
        background-color: #fef3c7;
        color: var(--warning-color);
      }
      
      &.warning {
        background-color: #fed7aa;
        color: #ea580c;
      }
    }
  }
  
  .card-info {
    text-align: center;
    
    .card-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--text-sm);
    }
    
    .card-stats {
      .main-stat {
        margin-bottom: var(--text-sm);
        
        .number {
          display: block;
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
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
            font-weight: 600;
            line-height: 1;
            
            &.participating {
              color: var(--success-color);
            }
            
            &.this-week {
              color: var(--warning-color);
            }
          }
          
          .label {
            font-size: var(--text-2xs);
            color: var(--text-tertiary);
          }
        }
      }
    }
  }
  
  .card-footer {
    .reminder-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-sm) var(--text-sm);
      background-color: #fef3c7;
      border-radius: var(--spacing-sm);
      font-size: var(--text-sm);
      color: #92400e;
      font-weight: 500;
    }
    
    .no-reminder {
      text-align: center;
      padding: var(--spacing-sm) var(--text-sm);
      font-size: var(--text-sm);
      color: var(--text-tertiary);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .activity-reminder-card {
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
