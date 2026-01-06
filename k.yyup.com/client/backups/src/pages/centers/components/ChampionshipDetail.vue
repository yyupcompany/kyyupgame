<template>
  <div class="championship-detail">
    <div class="detail-stats">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ data.brainScienceRate }}%</div>
          <div class="stat-label">脑科学计划达标率</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ data.courseContentRate }}%</div>
          <div class="stat-label">课程内容达标率</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><List /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ data.outdoorTrainingRate }}%</div>
          <div class="stat-label">户外训练达标率</div>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon><Location /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ data.externalDisplayRate }}%</div>
          <div class="stat-label">外出活动达标率</div>
        </div>
      </div>
    </div>

    <div class="championship-list">
      <h4>锦标赛记录</h4>
      <div class="championship-grid">
        <div 
          v-for="championship in data.championshipList" 
          :key="championship.id"
          class="championship-card"
        >
          <div class="championship-header">
            <div class="championship-name">{{ championship.championship_name }}</div>
            <div class="championship-status" :class="`status-${championship.completion_status}`">
              {{ getStatusText(championship.completion_status) }}
            </div>
          </div>
          <div class="championship-info">
            <div class="info-item">
              <span class="info-label">日期:</span>
              <span class="info-value">{{ championship.championship_date }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">地点:</span>
              <span class="info-value">{{ championship.location }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">参与人数:</span>
              <span class="info-value">{{ championship.participant_count }}人</span>
            </div>
          </div>
          <div class="chachievement-rate">
            <div class="rate-label">综合达标率:</div>
            <div class="rate-value">{{ championship.overall_achievement_rate }}%</div>
            <el-progress 
              :percentage="championship.overall_achievement_rate" 
              :stroke-width="8"
              :show-text="false"
              :color="getProgressColor(championship.overall_achievement_rate)"
            />
          </div>
          <div class="championship-media">
            <el-tag 
              v-if="championship.has_media" 
              type="success" 
              size="small"
            >
              有媒体文件 ({{ championship.media_count || 0 }})
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
      <el-button type="primary" size="small" @click="createChampionship">
        创建锦标赛
      </el-button>
      <el-button type="success" size="small" @click="exportReport">
        导出报告
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Document, List, Location } from '@element-plus/icons-vue'

interface Props {
  data: {
    brainScienceRate: number
    courseContentRate: number
    outdoorTrainingRate: number
    externalDisplayRate: number
    championshipList: Array<{
      id: number
      championship_name: string
      championship_date: string
      location: string
      completion_status: string
      participant_count: number
      overall_achievement_rate: number
      has_media: boolean
      media_count?: number
    }>
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const getStatusText = (status: string) => {
  const statusMap = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getProgressColor = (rate: number) => {
  if (rate >= 80) return 'var(--success-color)'
  if (rate >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const createChampionship = () => {
  console.log('创建锦标赛')
  // 实现创建锦标赛逻辑
}

const exportReport = () => {
  console.log('导出报告')
  // 实现导出报告逻辑
}
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.championship-detail {
  .detail-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
    margin-bottom: var(--text-3xl);

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-lg);
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--border-color);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &.primary {
        border-color: var(--el-color-primary-light-5);
        background: var(--el-color-primary-light-9);

        .stat-icon {
          color: var(--el-color-primary);
        }
      }

      &.success {
        border-color: var(--el-color-success-light-5);
        background: var(--el-color-success-light-9);

        .stat-icon {
          color: var(--el-color-success);
        }
      }

      &.warning {
        border-color: var(--el-color-warning-light-5);
        background: var(--el-color-warning-light-9);

        .stat-icon {
          color: var(--el-color-warning);
        }
      }

      &.info {
        border-color: var(--el-color-info-light-5);
        background: var(--el-color-info-light-9);

        .stat-icon {
          color: var(--el-color-info);
        }
      }

      .stat-icon {
        font-size: var(--text-3xl);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-content {
        .stat-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.2;
        }
      }
    }
  }

  .championship-list {
    h4 {
      margin: 0 0 var(--text-lg) 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
    }

    .championship-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--text-lg);
      margin-bottom: var(--text-3xl);

      .championship-card {
        padding: var(--text-lg);
        background: var(--el-bg-color-page);
        border-radius: var(--radius-md);
        border: var(--border-width-base) solid var(--border-color);
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: var(--shadow-sm);
        }

        .championship-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--text-sm);

          .championship-name {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--text-primary);
            flex: 1;
            margin-right: var(--spacing-sm);
          }

          .championship-status {
            display: inline-block;
            padding: var(--spacing-sm) var(--spacing-sm);
            border-radius: var(--text-sm);
            font-size: var(--text-xs);
            font-weight: 500;
            white-space: nowrap;

            &.status-not_started {
              background: var(--el-color-info-light-8);
              color: var(--el-color-info);
            }

            &.status-in_progress {
              background: var(--el-color-warning-light-8);
              color: var(--el-color-warning);
            }

            &.status-completed {
              background: var(--el-color-success-light-8);
              color: var(--el-color-success);
            }

            &.status-cancelled {
              background: var(--el-color-danger-light-8);
              color: var(--el-color-danger);
            }
          }
        }

        .championship-info {
          margin-bottom: var(--text-sm);

          .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-xs);

            .info-label {
              font-size: var(--text-sm);
              color: var(--text-secondary);
            }

            .info-value {
              font-size: var(--text-sm);
              color: var(--text-primary);
              font-weight: 500;
            }
          }
        }

        .chachievement-rate {
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

        .championship-media {
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
  .championship-detail {
    .detail-stats {
      grid-template-columns: 1fr;
      gap: var(--text-sm);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .championship-detail {
    .championship-list {
      .championship-grid {
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