<template>
  <el-card class="quick-actions-panel">
    <template #header>
      <div class="panel-header">
        <span class="panel-title">
          <el-icon><Lightning /></el-icon>
          快捷操作
        </span>
      </div>
    </template>
    
    <div class="actions-grid">
      <div 
        v-for="action in actions" 
        :key="action.key"
        class="action-item"
        @click="handleAction(action.key)"
      >
        <div class="action-icon" :class="action.iconClass">
          <el-icon>
            <component :is="action.icon" />
          </el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">{{ action.title }}</div>
          <div class="action-description">{{ action.description }}</div>
        </div>
        <div class="action-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Lightning,
  ArrowRight,
  Upload,
  Plus,
  Calendar,
  Camera,
  Document,
  Clock
} from '@element-plus/icons-vue'

interface QuickAction {
  key: string
  title: string
  description: string
  icon: any
  iconClass: string
}

const emit = defineEmits<{
  action: [key: string]
}>()

const actions = ref<QuickAction[]>([
  {
    key: 'upload-media',
    title: '上传教学媒体',
    description: '上传课堂照片和视频',
    icon: Upload,
    iconClass: 'upload'
  },
  {
    key: 'create-task',
    title: '创建新任务',
    description: '添加待办事项',
    icon: Plus,
    iconClass: 'create'
  },
  {
    key: 'view-schedule',
    title: '查看课程表',
    description: '今日课程安排',
    icon: Calendar,
    iconClass: 'schedule'
  },
  {
    key: 'take-photo',
    title: '拍照记录',
    description: '快速拍照上传',
    icon: Camera,
    iconClass: 'photo'
  },
  {
    key: 'write-report',
    title: '撰写报告',
    description: '教学总结报告',
    icon: Document,
    iconClass: 'report'
  },
  {
    key: 'clock-in',
    title: '考勤打卡',
    description: '上下班打卡',
    icon: Clock,
    iconClass: 'clock'
  }
])

const handleAction = (key: string) => {
  emit('action', key)
}
</script>

<style lang="scss" scoped>
.quick-actions-panel {
  .panel-header {
    .panel-title {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--text-primary);
    }
  }
  
  .actions-grid {
    display: flex;
    flex-direction: column;
    gap: var(--text-sm);
  }
  
  .action-item {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    padding: var(--text-sm);
    border-radius: var(--spacing-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    border: var(--border-width-base) solid var(--bg-secondary-light);
    
    &:hover {
      background-color: #f9fafb;
      border-color: var(--border-color);
      transform: translateX(2px);
    }
    
    .action-icon {
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--spacing-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xl);
      flex-shrink: 0;
      
      &.upload {
        background-color: #dbeafe;
        color: #2563eb;
      }
      
      &.create {
        background-color: #dcfce7;
        color: #16a34a;
      }
      
      &.schedule {
        background-color: #fef3c7;
        color: #d97706;
      }
      
      &.photo {
        background-color: #fce7f3;
        color: #be185d;
      }
      
      &.report {
        background-color: #f3e8ff;
        color: var(--ai-dark);
      }
      
      &.clock {
        background-color: #fed7aa;
        color: #ea580c;
      }
    }
    
    .action-content {
      flex: 1;
      
      .action-title {
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }
      
      .action-description {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
    
    .action-arrow {
      color: var(--text-tertiary);
      font-size: var(--text-base);
      transition: all 0.2s ease;
    }
    
    &:hover .action-arrow {
      color: var(--text-secondary);
      transform: translateX(2px);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .quick-actions-panel {
    .actions-grid {
      gap: var(--spacing-sm);
    }
    
    .action-item {
      padding: var(--spacing-2xl);
      gap: var(--spacing-2xl);
      
      .action-icon {
        width: var(--icon-size); height: var(--icon-size);
        font-size: var(--text-lg);
      }
      
      .action-content {
        .action-title {
          font-size: var(--text-sm);
        }
        
        .action-description {
          font-size: var(--text-xs);
        }
      }
    }
  }
}
</style>
