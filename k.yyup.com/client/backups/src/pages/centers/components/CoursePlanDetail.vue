<template>
  <div class="course-plan-detail">
    <div class="detail-stats">
      <div class="stat-row">
        <div class="stat-item">
          <span class="stat-label">普及进度:</span>
          <span class="stat-value">{{ data.overallProgress }}%</span>
          <el-progress 
            :percentage="data.overallProgress" 
            :stroke-width="8"
            :show-text="false"
          />
        </div>
        <div class="stat-item">
          <span class="stat-label">达标率:</span>
          <span class="stat-value">{{ data.achievementRate }}%</span>
          <el-progress 
            :percentage="data.achievementRate" 
            :stroke-width="8"
            :show-text="false"
            color="var(--success-color)": var(--success-color): var(--success-color)
          />
        </div>
      </div>
    </div>

    <div class="class-list">
      <h4>班级进度详情</h4>
      <div class="class-grid">
        <div 
          v-for="classItem in data.classList" 
          :key="classItem.class_id"
          class="class-card"
        >
          <div class="class-header">
            <div class="class-name">{{ classItem.class?.name }}</div>
            <div class="class-students">{{ classItem.class?.current_student_count || 0 }}人</div>
          </div>
          <div class="class-progress">
            <div class="progress-item">
              <span class="progress-label">普及率:</span>
              <span class="progress-value">{{ classItem.avg_achievement_rate || 0 }}%</span>
            </div>
            <div class="progress-item">
              <span class="progress-label">达标率:</span>
              <span class="progress-value">{{ classItem.actual_achievement_rate || 0 }}%</span>
            </div>
          </div>
          <div class="class-media">
            <el-tag 
              v-if="classItem.has_media" 
              type="success" 
              size="small"
            >
              有媒体文件
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
      <el-button type="primary" size="small" @click="viewFullDetails">
        查看完整详情
      </el-button>
      <el-button type="success" size="small" @click="exportReport">
        导出报告
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  data: {
    overallProgress: number
    achievementRate: number
    classList: Array<{
      class_id: number
      class?: {
        name: string
        current_student_count: number
      }
      avg_achievement_rate: number
      actual_achievement_rate: number
      has_media: boolean
    }>
  }
}

defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const viewFullDetails = () => {
  console.log('查看完整详情')
  // 实现查看完整详情逻辑
}

const exportReport = () => {
  console.log('导出报告')
  // 实现导出报告逻辑
}
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.course-plan-detail {
  .detail-stats {
    margin-bottom: var(--text-3xl);

    .stat-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--text-2xl);

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);

        .stat-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
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
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  .course-plan-detail {
    .detail-stats {
      .stat-row {
        grid-template-columns: 1fr;
        gap: var(--text-lg);
      }
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