<template>
  <div class="outdoor-training-detail">
    <div class="detail-header">
      <div class="view-toggle">
        <el-radio-group v-model="viewType" @change="handleViewChange">
          <el-radio-button label="outdoor_training">户外训练</el-radio-button>
          <el-radio-button label="departure_display">离园展示</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="detail-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><List /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ currentViewStats.averageRate }}%</div>
          <div class="stat-label">{{ viewLabels[viewType] }}完成率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ currentViewStats.completedWeeks }}/16</div>
          <div class="stat-label">完成周数</div>
        </div>
      </div>
    </div>

    <div class="class-list">
      <h4>班级执行情况</h4>
      <div class="class-grid">
        <div 
          v-for="classItem in data.classList" 
          :key="classItem.class_id"
          class="class-card"
        >
          <div class="class-header">
            <div class="class-name">{{ classItem.class_name }}</div>
            <div class="class-students">{{ classItem.student_count || 0 }}人</div>
          </div>
          <div class="class-progress">
            <div class="progress-item">
              <span class="progress-label">完成周数:</span>
              <span class="progress-value">{{ getClassCompletedWeeks(classItem) }}/16</span>
            </div>
            <div class="progress-item">
              <span class="progress-label">完成率:</span>
              <span class="progress-value">{{ getClassCompletionRate(classItem) }}%</span>
            </div>
          </div>
          <div class="progress-bar">
            <el-progress 
              :percentage="getClassCompletionRate(classItem)" 
              :stroke-width="8"
              :show-text="false"
              :color="getProgressColor(getClassCompletionRate(classItem))"
            />
          </div>
          <div class="class-media">
            <el-tag 
              v-if="classItem.has_media" 
              type="success" 
              size="small"
            >
              有媒体文件 ({{ classItem.media_count || 0 }})
            </el-tag>
            <el-tag 
              v-else 
              type="info" 
              size="small"
            >
              无媒体文件
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <el-button type="primary" size="small" @click="addRecord">
        添加记录
      </el-button>
      <el-button type="success" size="small" @click="exportReport">
        导出报告
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { List, Calendar } from '@element-plus/icons-vue'

interface Props {
  data: {
    averageRate: number
    completedWeeks: number
    classList: Array<{
      class_id: number
      class_name: string
      student_count?: number
      outdoor_training_completed?: number
      outdoor_training_rate?: number
      departure_display_completed?: number
      departure_display_rate?: number
      has_media: boolean
      media_count?: number
    }>
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const viewType = ref('outdoor_training')

const viewLabels = {
  outdoor_training: '户外训练',
  departure_display: '离园展示'
}

const currentViewStats = computed(() => {
  return {
    averageRate: props.data.averageRate,
    completedWeeks: props.data.completedWeeks
  }
})

const handleViewChange = () => {
  console.log('视图切换:', viewType.value)
  // 实现视图切换逻辑
}

const getClassCompletedWeeks = (classItem: any) => {
  return viewType.value === 'outdoor_training'
    ? (classItem.outdoor_training_completed || 0)
    : (classItem.departure_display_completed || 0)
}

const getClassCompletionRate = (classItem: any) => {
  return viewType.value === 'outdoor_training'
    ? (classItem.outdoor_training_rate || 0)
    : (classItem.departure_display_rate || 0)
}

const getProgressColor = (rate: number) => {
  if (rate >= 80) return 'var(--success-color)': var(--success-color): var(--success-color)
  if (rate >= 60) return 'var(--warning-color)': var(--warning-color): var(--warning-color)
  return 'var(--danger-color)': var(--danger-color): var(--danger-color)
}

const addRecord = () => {
  console.log('添加记录:', viewType.value)
  // 实现添加记录逻辑
}

const exportReport = () => {
  console.log('导出报告')
  // 实现导出报告逻辑
}
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.outdoor-training-detail {
  .detail-header {
    margin-bottom: var(--text-3xl);

    .view-toggle {
      display: flex;
      justify-content: center;
    }
  }

  .detail-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--text-2xl);
    margin-bottom: var(--text-3xl);

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-lg);
      background: var(--el-bg-color-page);
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--border-color);

      .stat-icon {
        font-size: var(--text-3xl);
        color: var(--el-color-primary);
      }

      .stat-content {
        .stat-value {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.2;
        }
      }
    }
  }

  .class-list {
    h4 {
      margin: 0 0 var(--text-lg) 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
    }

    .class-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--text-lg);
      margin-bottom: var(--text-3xl);

      .class-card {
        padding: var(--text-lg);
        background: var(--el-bg-color-page);
        border-radius: var(--radius-md);
        border: var(--border-width-base) solid var(--border-color);
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: var(--shadow-sm);
        }

        .class-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--text-sm);

          .class-name {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--text-primary);
          }

          .class-students {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            background: var(--el-color-info-light-9);
            padding: var(--spacing-sm) var(--spacing-sm);
            border-radius: var(--radius-sm);
          }
        }

        .class-progress {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--text-sm);

          .progress-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-xs);

            .progress-label {
              font-size: var(--text-xs);
              color: var(--text-secondary);
            }

            .progress-value {
              font-size: var(--text-base);
              font-weight: 600;
              color: var(--el-color-primary);
            }
          }
        }

        .progress-bar {
          margin-bottom: var(--text-sm);
        }

        .class-media {
          display: flex;
          justify-content: center;
        }
      }
    }
  }

  .detail-actions {
    display: flex;
    gap: var(--text-sm);
    justify-content: center;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .outdoor-training-detail {
    .detail-stats {
      grid-template-columns: 1fr;
      gap: var(--text-lg);
    }

    .class-list {
      .class-grid {
        grid-template-columns: 1fr;
      }
    }

    .detail-actions {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>