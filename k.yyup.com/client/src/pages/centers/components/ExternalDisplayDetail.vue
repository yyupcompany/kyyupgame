<template>
  <div class="external-display-detail">
    <div class="detail-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <UnifiedIcon name="default" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ data.averageRate }}%</div>
          <div class="stat-label">平均达标率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <UnifiedIcon name="default" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ data.semesterOutings }}</div>
          <div class="stat-label">本学期外出</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <UnifiedIcon name="default" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ data.totalOutings }}</div>
          <div class="stat-label">累计外出</div>
        </div>
      </div>
    </div>

    <div class="class-list">
      <h4>班级外出日志</h4>
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
          <div class="outing-info">
            <div class="outing-item">
              <span class="outing-label">最近外出:</span>
              <span class="outing-value">{{ classItem.last_outing_date || '暂无' }}</span>
            </div>
            <div class="outing-item">
              <span class="outing-label">本学期:</span>
              <span class="outing-value">{{ classItem.semester_outings || 0 }}次</span>
            </div>
            <div class="outing-item">
              <span class="outing-label">累计:</span>
              <span class="outing-value">{{ classItem.total_outings || 0 }}次</span>
            </div>
          </div>
          <div class="achievement-rate">
            <div class="rate-label">达标率:</div>
            <div class="rate-value">{{ classItem.achievement_rate || 0 }}%</div>
            <el-progress 
              :percentage="classItem.achievement_rate || 0" 
              :stroke-width="8"
              :show-text="false"
              :color="getProgressColor(classItem.achievement_rate || 0)"
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
      <el-button type="primary" size="small" @click="addDisplay">
        添加校外展示
      </el-button>
      <el-button type="success" size="small" @click="exportReport">
        导出报告
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Location, Calendar, DataLine } from '@element-plus/icons-vue'

interface Props {
  data: {
    averageRate: number
    semesterOutings: number
    totalOutings: number
    classList: Array<{
      class_id: number
      class_name: string
      student_count?: number
      last_outing_date?: string
      semester_outings?: number
      total_outings?: number
      achievement_rate?: number
      has_media: boolean
      media_count?: number
    }>
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const getProgressColor = (rate: number) => {
  if (rate >= 80) return 'var(--success-color)'
  if (rate >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const addDisplay = () => {
  console.log('添加校外展示')
  // 实现添加校外展示逻辑
}

const exportReport = () => {
  console.log('导出报告')
  // 实现导出报告逻辑
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.external-display-detail {
  .detail-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--text-lg);
    margin-bottom: var(--text-3xl);

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-lg);
      background: var(--el-bg-color-page);
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--border-color);
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: var(--shadow-sm);
      }

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
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

        .outing-info {
          margin-bottom: var(--text-sm);

          .outing-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-xs);

            .outing-label {
              font-size: var(--text-sm);
              color: var(--text-secondary);
            }

            .outing-value {
              font-size: var(--text-sm);
              color: var(--text-primary);
              font-weight: 500;
            }
          }
        }

        .achievement-rate {
          margin-bottom: var(--text-sm);

          .rate-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .rate-value {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--el-color-primary);
            margin-bottom: var(--spacing-lg);
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

@media (max-width: var(--breakpoint-lg)) {
  .external-display-detail {
    .detail-stats {
      grid-template-columns: 1fr;
      gap: var(--text-sm);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .external-display-detail {
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