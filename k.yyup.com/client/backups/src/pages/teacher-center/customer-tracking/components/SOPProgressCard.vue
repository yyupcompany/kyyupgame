<template>
  <el-card class="sop-progress-card">
    <template #header>
      <div class="card-header">
        <h4>
          <el-icon><TrendCharts /></el-icon>
          SOP进度
        </h4>
      </div>
    </template>

    <div v-if="progress" class="progress-content">
      <div class="current-stage">
        <div class="stage-name">{{ currentStage?.name || '未开始' }}</div>
        <div class="stage-order">阶段 {{ currentStage?.orderNum || 0 }}/7</div>
      </div>
      
      <div class="progress-bar">
        <el-progress
          :percentage="stageProgress"
          :color="progressColor"
          :stroke-width="12"
        />
      </div>
      
      <div class="progress-stats">
        <div class="stat-item">
          <div class="stat-label">已完成任务</div>
          <div class="stat-value">{{ completedTasks }}/{{ totalTasks }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">预计完成</div>
          <div class="stat-value">{{ estimatedDate }}</div>
        </div>
      </div>
    </div>
    
    <el-empty v-else description="暂无进度数据" :image-size="60" />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CustomerSOPProgress, SOPStage } from '@/api/modules/teacher-sop';

interface Props {
  customerId: number;
  progress: CustomerSOPProgress | null;
  currentStage: SOPStage | null;
}

const props = defineProps<Props>();

const stageProgress = computed(() => props.progress?.stageProgress || 0);

const completedTasks = computed(() => props.progress?.completedTasks?.length || 0);

const totalTasks = computed(() => {
  // TODO: 从当前阶段获取总任务数
  return 8;
});

const estimatedDate = computed(() => {
  if (!props.progress?.estimatedCloseDate) return '-';
  return new Date(props.progress.estimatedCloseDate).toLocaleDateString('zh-CN');
});

const progressColor = computed(() => {
  const progress = stageProgress.value;
  if (progress >= 80) return 'var(--success-color)';
  if (progress >= 50) return 'var(--warning-color)';
  return 'var(--danger-color)';
});
</script>

<style scoped lang="scss">
.sop-progress-card {
  height: 100%;

  :deep(.el-card) {
    backdrop-filter: blur(10px);
    background: var(--el-bg-color, var(--white-alpha-90)) !important;
    border: var(--border-width-base) solid var(--el-border-color, var(--shadow-light)) !important;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) rgba(31, 38, 135, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--text-sm) 40px rgba(31, 38, 135, 0.15) !important;
    }
  }

  .card-header {
    h4 {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .progress-content {
    .current-stage {
      text-align: center;
      margin-bottom: var(--spacing-lg);

      .stage-name {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stage-order {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }

    .progress-bar {
      margin-bottom: var(--spacing-lg);
    }

    .progress-stats {
      display: flex;
      justify-content: space-around;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: var(--text-xs);
          color: var(--el-text-color-secondary);
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
        }

        .stat-value {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}
</style>
