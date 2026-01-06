<template>
  <div class="progress-panel">
    <!-- 总进度条 -->
    <div class="progress-container">
      <div class="progress-header">
        <span class="progress-label">总体进度</span>
        <span class="progress-percentage">{{ progress }}%</span>
      </div>
      <el-progress :percentage="progress" :color="progressColor" />
    </div>

    <!-- 当前阶段 -->
    <div class="stage-container">
      <div class="stage-header">
        <el-icon class="stage-icon is-loading"><Loading /></el-icon>
        <span class="stage-text">{{ stage }}</span>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-container">
      <div class="task-item" :class="{ completed: progress >= 50 }">
        <div class="task-icon">
          <el-icon v-if="progress >= 50"><SuccessFilled /></el-icon>
          <el-icon v-else class="is-loading"><Loading /></el-icon>
        </div>
        <div class="task-info">
          <div class="task-name">💻 代码生成</div>
          <div class="task-progress">{{ Math.min(progress, 50) }}%</div>
        </div>
      </div>

      <div class="task-item" :class="{ completed: progress >= 100 }">
        <div class="task-icon">
          <el-icon v-if="progress >= 100"><SuccessFilled /></el-icon>
          <el-icon v-else class="is-loading"><Loading /></el-icon>
        </div>
        <div class="task-info">
          <div class="task-name">🖼️ 图片生成</div>
          <div class="task-progress">{{ Math.max(0, Math.min(progress - 50, 50)) }}%</div>
        </div>
      </div>

      <!-- 视频生成暂时移除 -->
      <!-- <div class="task-item" :class="{ completed: progress >= 100 }">
        <div class="task-icon">
          <el-icon v-if="progress >= 100"><SuccessFilled /></el-icon>
          <el-icon v-else class="is-loading"><Loading /></el-icon>
        </div>
        <div class="task-info">
          <div class="task-name">🎬 视频生成</div>
          <div class="task-progress">{{ Math.max(0, Math.min(progress - 60, 40)) }}%</div>
        </div>
      </div> -->
    </div>

    <!-- 提示信息 -->
    <div class="tips-container">
      <el-alert
        title="💡 提示"
        type="info"
        :closable="false"
        description="课程生成可能需要2-5分钟，请耐心等待。生成过程中请勿关闭页面。"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Loading, SuccessFilled } from '@element-plus/icons-vue';

interface Props {
  progress: number;
  stage: string;
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  stage: '初始化中...'
});

// 根据进度计算颜色
const progressColor = computed(() => {
  if (props.progress < 50) return 'var(--primary-color)';
  if (props.progress < 80) return 'var(--warning-color)';
  return 'var(--success-color)';
});
</script>

<style scoped lang="scss">
.progress-panel {
  display: flex;
  flex-direction: column;
  gap: var(--text-2xl);

  .progress-container {
    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
      font-size: var(--text-base);

      .progress-label {
        color: var(--text-secondary);
      }

      .progress-percentage {
        color: var(--primary-color);
        font-weight: bold;
      }
    }
  }

  .stage-container {
    .stage-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2xl);
      padding: var(--text-sm);
      background: var(--bg-primary);
      border-radius: var(--spacing-xs);

      .stage-icon {
        font-size: var(--text-xl);
        color: var(--primary-color);
      }

      .stage-text {
        color: var(--text-primary);
        font-size: var(--text-base);
      }
    }
  }

  .tasks-container {
    display: flex;
    flex-direction: column;
    gap: var(--text-sm);

    .task-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-sm);
      background: var(--bg-primary);
      border-radius: var(--spacing-xs);
      border-left: 3px solid var(--border-color);
      transition: all 0.3s ease;

      &.completed {
        border-left-color: var(--success-color);
        background: rgba(103, 194, 58, 0.1);
      }

      .task-icon {
        font-size: var(--text-2xl);
        color: var(--primary-color);
        min-width: var(--text-3xl);
        text-align: center;
      }

      .task-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .task-name {
          font-size: var(--text-base);
          color: var(--text-primary);
        }

        .task-progress {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }
  }

  .tips-container {
    margin-top: var(--spacing-2xl);
  }
}


</style>

