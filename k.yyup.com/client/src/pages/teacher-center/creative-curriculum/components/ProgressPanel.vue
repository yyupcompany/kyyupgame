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
        <UnifiedIcon name="default" />
        <span class="stage-text">{{ stage }}</span>
      </div>
    </div>

    <!-- 详细阶段列表 -->
    <div class="stages-container">
      <div
        v-for="(stageItem, index) in stages"
        :key="index"
        :class="['stage-item', { active: stageItem.active, completed: stageItem.completed }]"
      >
        <div class="stage-icon">
          <span v-if="stageItem.completed" class="icon-completed">✅</span>
          <span v-else-if="stageItem.active" class="icon-active">⏳</span>
          <span v-else class="icon-pending">⭕</span>
        </div>
        <div class="stage-content">
          <div class="stage-name">{{ stageItem.name }}</div>
          <div class="stage-description">{{ stageItem.description }}</div>
          <div class="stage-progress-bar" v-if="stageItem.active">
            <div class="progress-fill" :style="{ width: stageItem.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时日志 -->
    <div class="logs-container" v-if="logs.length > 0">
      <div class="logs-header">📋 实时日志</div>
      <div class="logs-list">
        <div v-for="log in logs" :key="log.id" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
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
import { computed, ref, watch } from 'vue';
import { Loading, SuccessFilled } from '@element-plus/icons-vue';

interface Props {
  progress: number;
  stage: string;
  logs?: Array<{ id: string | number; time: string; message: string }>;
}

interface StageItem {
  name: string;
  description: string;
  active: boolean;
  completed: boolean;
  progress: number;
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  stage: '初始化中...',
  logs: () => []
});

const stages = ref<StageItem[]>([
  { name: '分析需求', description: '深度分析课程需求...', active: false, completed: false, progress: 0 },
  { name: '规划课程', description: '规划课程结构...', active: false, completed: false, progress: 0 },
  { name: '生成代码', description: '生成HTML/CSS/JS代码...', active: false, completed: false, progress: 0 },
  { name: '生成图片', description: '生成配套图片...', active: false, completed: false, progress: 0 },
  { name: '整合资源', description: '整合所有资源...', active: false, completed: false, progress: 0 },
]);

const logs = ref<Array<{ id: string | number; time: string; message: string }>>(props.logs || []);

// 监听进度变化，更新阶段状态
watch(() => props.progress, (newProgress) => {
  const stageIndex = Math.floor((newProgress / 100) * stages.value.length);

  stages.value.forEach((stage, index) => {
    if (index < stageIndex) {
      stage.completed = true;
      stage.active = false;
      stage.progress = 100;
    } else if (index === stageIndex) {
      stage.active = true;
      stage.completed = false;
      stage.progress = (newProgress % (100 / stages.value.length)) * (stages.value.length / 100) * 100;
    } else {
      stage.active = false;
      stage.completed = false;
      stage.progress = 0;
    }
  });
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
      background: var(--bg-page);
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

  .stages-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .stage-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--bg-page);
      border-radius: var(--spacing-xs);
      border-left: 4px solid var(--border-color);
      transition: all 0.3s ease;

      &.active {
        border-left-color: var(--primary-color);
        background: rgba(64, 158, 255, 0.05);
      }

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

