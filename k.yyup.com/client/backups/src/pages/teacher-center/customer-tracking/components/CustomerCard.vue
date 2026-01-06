<template>
  <el-card class="customer-card" :body-style="{ padding: 'var(--text-lg)' }">
    <div class="card-content">
      <div class="customer-header">
        <el-avatar :size="48">{{ customer.name.charAt(0) }}</el-avatar>
        <div class="customer-basic">
          <div class="customer-name">{{ customer.name }}</div>
          <div class="customer-phone">{{ customer.phone }}</div>
        </div>
      </div>
      
      <div class="customer-info">
        <div class="info-row">
          <span class="label">孩子：</span>
          <span class="value">{{ customer.childName }} ({{ customer.childAge }}岁)</span>
        </div>
        <div class="info-row">
          <span class="label">来源：</span>
          <el-tag size="small">{{ customer.source }}</el-tag>
        </div>
      </div>
      
      <div class="sop-progress">
        <div class="progress-header">
          <span class="stage-name">{{ customer.currentStageName }}</span>
          <span class="progress-value">{{ customer.stageProgress }}%</span>
        </div>
        <el-progress
          :percentage="customer.stageProgress"
          :color="getProgressColor(customer.stageProgress)"
          :show-text="false"
        />
      </div>
      
      <div class="customer-footer">
        <div class="probability">
          <span class="label">成功概率：</span>
          <span :class="['value', getProbabilityClass(customer.successProbability)]">
            {{ customer.successProbability }}%
          </span>
        </div>
        <el-button type="primary" size="small">查看详情</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
interface Props {
  customer: any;
}

const props = defineProps<Props>();

function getProgressColor(progress: number): string {
  if (progress >= 80) return 'var(--success-color)';
  if (progress >= 50) return 'var(--warning-color)';
  return 'var(--danger-color)';
}

function getProbabilityClass(probability: number): string {
  if (probability >= 70) return 'high';
  if (probability >= 40) return 'medium';
  return 'low';
}
</script>

<style scoped lang="scss">
.customer-card {
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-var(--spacing-xs));
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
  }
  
  .card-content {
    .customer-header {
      display: flex;
      gap: var(--text-sm);
      margin-bottom: var(--text-lg);
      
      .customer-basic {
        flex: 1;
        
        .customer-name {
          font-size: var(--text-lg);
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }
        
        .customer-phone {
          font-size: var(--text-sm);
          color: var(--info-color);
        }
      }
    }
    
    .customer-info {
      margin-bottom: var(--text-lg);
      
      .info-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
        font-size: var(--text-sm);
        
        .label {
          color: var(--info-color);
        }
        
        .value {
          color: var(--text-regular);
        }
      }
    }
    
    .sop-progress {
      margin-bottom: var(--text-lg);
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
        font-size: var(--text-sm);
        
        .stage-name {
          font-weight: 600;
        }
        
        .progress-value {
          color: var(--info-color);
        }
      }
    }
    
    .customer-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .probability {
        font-size: var(--text-sm);
        
        .label {
          color: var(--info-color);
        }
        
        .value {
          font-weight: 600;
          
          &.high {
            color: var(--success-color);
          }
          
          &.medium {
            color: var(--warning-color);
          }
          
          &.low {
            color: var(--danger-color);
          }
        }
      }
    }
  }
}
</style>
