<template>
  <el-card class="notification-card" shadow="hover" @click="$emit('click')">
    <div class="card-content">
      <div class="card-icon">
        <UnifiedIcon name="default" />
        <el-badge 
          v-if="stats.unread > 0" 
          :value="stats.unread" 
          :max="99"
          class="notification-badge"
        />
      </div>
      <div class="card-info">
        <div class="card-title">通知</div>
        <div class="card-stats">
          <div class="main-stat">
            <span class="number">{{ stats.unread }}</span>
            <span class="label">未读消息</span>
          </div>
          <div class="sub-stats">
            <div class="stat-item">
              <span class="number total">{{ stats.total }}</span>
              <span class="label">总消息</span>
            </div>
            <div class="stat-item" v-if="stats.urgent > 0">
              <span class="number urgent">{{ stats.urgent }}</span>
              <span class="label">紧急消息</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div class="urgent-badge" v-if="stats.urgent > 0">
          <UnifiedIcon name="default" />
          <span>{{ stats.urgent }} 条紧急消息</span>
        </div>
        <div class="normal-status" v-else>
          <span>暂无紧急消息</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bell, Warning } from '@element-plus/icons-vue'

interface NotificationStats {
  unread: number
  total: number
  urgent: number
}

interface Props {
  stats: NotificationStats
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const iconClass = computed(() => {
  if (props.stats.urgent > 0) return 'danger'
  if (props.stats.unread > 0) return 'warning'
  return 'primary'
})
</script>

<style lang="scss" scoped>
.notification-card {
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
    position: relative;
    
    .icon {
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--text-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-3xl);
      
      &.primary {
        background-color: #e0f2fe;
        color: #0288d1;
      }
      
      &.warning {
        background-color: var(--bg-white)3cd;
        color: var(--warning-color);
      }
      
      &.danger {
        background-color: #ffebee;
        color: #f44336;
      }
    }
    
    .notification-badge {
      position: absolute;
      top: -var(--spacing-sm);
      right: calc(50% - var(--spacing-3xl));
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
            
            &.total {
              color: var(--text-secondary);
            }
            
            &.urgent {
              color: var(--danger-color);
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
    .urgent-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-sm) var(--text-sm);
      background-color: #fee2e2;
      border-radius: var(--spacing-sm);
      font-size: var(--text-sm);
      color: #dc2626;
      font-weight: 500;
    }
    
    .normal-status {
      text-align: center;
      padding: var(--spacing-sm) var(--text-sm);
      font-size: var(--text-sm);
      color: var(--text-tertiary);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .notification-card {
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
