<template>
  <div class="expert-card" :class="{ active: isActive, working: isWorking }">
    <div class="expert-header">
      <div class="expert-avatar">{{ expert.avatar }}</div>
      <div class="expert-info">
        <h4 class="expert-name">{{ expert.name }}</h4>
        <p class="expert-role">{{ expert.role }}</p>
      </div>
      <div class="expert-status">
        <div v-if="isWorking" class="status-indicator working">
          <div class="pulse"></div>
          工作中
        </div>
        <div v-else-if="isActive" class="status-indicator active">
          就绪
        </div>
        <div v-else class="status-indicator idle">
          待命
        </div>
      </div>
    </div>
    
    <div class="expert-specialties">
      <div class="specialties-title">专业领域:</div>
      <div class="specialty-tags">
        <span 
          v-for="specialty in expert.specialties" 
          :key="specialty"
          class="specialty-tag"
        >
          {{ specialty }}
        </span>
      </div>
    </div>
    
    <!-- 工作进度 -->
    <div v-if="workProgress" class="work-progress">
      <div class="progress-title">{{ workProgress.title }}</div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${workProgress.percentage}%` }"
        ></div>
      </div>
      <div class="progress-text">{{ workProgress.text }}</div>
    </div>
    
    <!-- 最近输出 -->
    <div v-if="lastOutput" class="last-output">
      <div class="output-title">最新输出:</div>
      <div class="output-content">{{ lastOutput }}</div>
      <div v-if="lastScore" class="output-score">
        评分: {{ lastScore }}/10
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Expert } from '@/services/expert-team.service'

interface WorkProgress {
  title: string
  percentage: number
  text: string
}

defineProps<{
  expert: Expert
  isActive?: boolean
  isWorking?: boolean
  workProgress?: WorkProgress
  lastOutput?: string
  lastScore?: number
}>()
</script>

<style scoped lang="scss">
.expert-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--text-sm);
  padding: var(--text-lg);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color-light);
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  }
  
  &.active {
    border-color: var(--success-color);
    background: var(--success-color-light);
  }
  
  &.working {
    border-color: var(--primary-color);
    background: var(--primary-color-light);
    animation: workingPulse 2s infinite ease-in-out;
  }
}

@keyframes workingPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.4);
  }
  50% {
    box-shadow: 0 0 0 var(--spacing-sm) rgba(var(--primary-color-rgb), 0);
  }
}

.expert-header {
  display: flex;
  align-items: flex-start;
  gap: var(--text-sm);
  margin-bottom: var(--text-lg);
  
  .expert-avatar {
    font-size: var(--spacing-3xl);
    width: var(--icon-size); height: var(--icon-size);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }
  
  .expert-info {
    flex: 1;
    min-width: 0;
    
    .expert-name {
      margin: 0 0 var(--spacing-xs) 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .expert-role {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.4;
    }
  }
  
  .expert-status {
    flex-shrink: 0;
    
    .status-indicator {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--text-sm);
      font-size: var(--text-xs);
      font-weight: 500;
      
      &.working {
        background: var(--primary-color);
        color: white;
        
        .pulse {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: var(--radius-full);
          animation: pulse 1s infinite ease-in-out;
        }
      }
      
      &.active {
        background: var(--success-color);
        color: white;
      }
      
      &.idle {
        background: var(--bg-secondary);
        color: var(--text-secondary);
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.expert-specialties {
  margin-bottom: var(--text-lg);
  
  .specialties-title {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
  }
  
  .specialty-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
    
    .specialty-tag {
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: var(--spacing-sm) var(--spacing-sm);
      border-radius: var(--spacing-sm);
      font-size: var(--text-xs);
      font-weight: 500;
    }
  }
}

.work-progress {
  margin-bottom: var(--text-lg);
  padding: var(--text-sm);
  background: var(--bg-secondary);
  border-radius: var(--spacing-sm);
  
  .progress-title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--bg-primary);
    border-radius: var(--radius-xs);
    overflow: hidden;
    margin-bottom: var(--spacing-lg);
    
    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: var(--radius-xs);
      transition: width 0.3s ease;
    }
  }
  
  .progress-text {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
}

.last-output {
  padding: var(--text-sm);
  background: var(--bg-secondary);
  border-radius: var(--spacing-sm);
  border-left: 3px solid var(--primary-color);
  
  .output-title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: var(--spacing-lg);
  }
  
  .output-content {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
    margin-bottom: var(--spacing-lg);
  }
  
  .output-score {
    font-size: var(--text-xs);
    color: var(--primary-color);
    font-weight: 500;
  }
}
</style>
