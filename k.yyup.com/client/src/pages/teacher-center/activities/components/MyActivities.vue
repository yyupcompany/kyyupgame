<template>
  <div class="my-activities">
    <!-- 我的活动统计 -->
    <div class="stats-section">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ myStats.total }}</div>
            <div class="stat-label">我负责的活动</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ myStats.upcoming }}</div>
            <div class="stat-label">即将开始</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ myStats.ongoing }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ myStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 我的活动列表 -->
    <div class="activities-section">
      <div class="section-header">
        <h3>我负责的活动</h3>
        <el-button type="primary" size="small" @click="$emit('create-activity')">
          <UnifiedIcon name="Plus" />
          新建活动
        </el-button>
      </div>

      <div class="activities-list">
        <div 
          v-for="activity in myActivities" 
          :key="activity.id"
          class="activity-item"
          @click="$emit('view-activity', activity)"
        >
          <div class="activity-info">
            <div class="activity-header">
              <div class="activity-title">{{ activity.title }}</div>
              <el-tag :type="getStatusTagType(activity.status)" size="small">
                {{ getStatusText(activity.status) }}
              </el-tag>
            </div>
            
            <div class="activity-description">{{ activity.description }}</div>
            
            <div class="activity-meta">
              <span class="meta-item">
                <UnifiedIcon name="default" />
                {{ formatDate(activity.date) }}
              </span>
              <span class="meta-item">
                <UnifiedIcon name="default" />
                {{ activity.startTime }} - {{ activity.endTime }}
              </span>
              <span class="meta-item">
                <UnifiedIcon name="default" />
                {{ activity.location }}
              </span>
              <span class="meta-item">
                <UnifiedIcon name="default" />
                {{ activity.participantCount || 0 }} 人
              </span>
            </div>
          </div>

          <div class="activity-actions">
            <el-button 
              size="small" 
              @click.stop="$emit('edit-activity', activity)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="success"
              @click.stop="$emit('manage-signin', activity)"
            >
              签到管理
            </el-button>
            <el-button 
              size="small" 
              type="warning"
              @click.stop="$emit('view-evaluation', activity)"
            >
              查看评估
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="myActivities.length === 0" class="empty-state">
        <el-empty description="您还没有负责任何活动">
          <el-button type="primary" @click="$emit('create-activity')">
            创建第一个活动
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 最近的活动评估 -->
    <div class="evaluations-section" v-if="recentEvaluations.length > 0">
      <div class="section-header">
        <h3>最近的活动评估</h3>
        <el-button type="text" size="small" @click="$emit('view-all-evaluations')">
          查看全部
        </el-button>
      </div>

      <div class="evaluations-list">
        <div 
          v-for="evaluation in recentEvaluations" 
          :key="evaluation.id"
          class="evaluation-item"
        >
          <div class="evaluation-info">
            <div class="evaluation-title">{{ evaluation.activityTitle }}</div>
            <div class="evaluation-rating">
              <el-rate 
                v-model="evaluation.rating" 
                disabled 
                show-score 
                text-color="#ff9900"
              />
            </div>
            <div class="evaluation-comment">{{ evaluation.comment }}</div>
          </div>
          <div class="evaluation-date">
            {{ formatDate(evaluation.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Calendar, Clock, Location, User } from '@element-plus/icons-vue'

// Props
interface Activity {
  id: number
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  participantCount?: number
  teacherId?: number
}

interface Evaluation {
  id: number
  activityTitle: string
  rating: number
  comment: string
  createdAt: string
}

interface Props {
  activities: Activity[]
  evaluations?: Evaluation[]
  currentTeacherId?: number
}

const props = withDefaults(defineProps<Props>(), {
  activities: () => [],
  evaluations: () => [],
  currentTeacherId: 1
})

// Emits
const emit = defineEmits<{
  'view-activity': [activity: Activity]
  'edit-activity': [activity: Activity]
  'create-activity': []
  'manage-signin': [activity: Activity]
  'view-evaluation': [activity: Activity]
  'view-all-evaluations': []
}>()

// 计算属性
const myActivities = computed(() => {
  return props.activities.filter(activity => 
    activity.teacherId === props.currentTeacherId
  )
})

const myStats = computed(() => {
  const activities = myActivities.value
  return {
    total: activities.length,
    upcoming: activities.filter(a => a.status === 'upcoming').length,
    ongoing: activities.filter(a => a.status === 'ongoing').length,
    completed: activities.filter(a => a.status === 'completed').length
  }
})

const recentEvaluations = computed(() => {
  return props.evaluations.slice(0, 3)
})

// 方法
const getStatusTagType = (status: string) => {
  const typeMap = {
    'upcoming': 'info',
    'ongoing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap = {
    'upcoming': '即将开始',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || '未知'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.my-activities {
  .stats-section {
    margin-bottom: var(--spacing-xl);

    .stat-card {
      background: var(--el-bg-color);
      border: var(--border-width-base) solid var(--el-border-color-light);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      text-align: center;

      .stat-number {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: var(--el-color-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }
  }

  .activities-section,
  .evaluations-section {
    margin-bottom: var(--spacing-xl);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);

      h3 {
        margin: 0;
        color: var(--el-text-color-primary);
      }
    }

    .activities-list {
      .activity-item {
        background: var(--el-bg-color);
        border: var(--border-width-base) solid var(--el-border-color-light);
        border-radius: var(--spacing-sm);
        padding: var(--text-lg);
        margin-bottom: var(--text-sm);
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
        }

        .activity-info {
          .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);

            .activity-title {
              font-size: var(--text-lg);
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
          }

          .activity-description {
            color: var(--el-text-color-regular);
            margin-bottom: var(--text-sm);
            line-height: 1.5;
          }

          .activity-meta {
            display: flex;
            gap: var(--text-lg);
            flex-wrap: wrap;

            .meta-item {
              display: flex;
              align-items: center;
              font-size: var(--text-sm);
              color: var(--el-text-color-secondary);

              .el-icon {
                margin-right: var(--spacing-xs);
              }
            }
          }
        }

        .activity-actions {
          margin-top: var(--text-sm);
          padding-top: var(--text-sm);
          border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }

    .evaluations-list {
      .evaluation-item {
        background: var(--el-fill-color-light);
        border-radius: var(--spacing-sm);
        padding: var(--text-lg);
        margin-bottom: var(--text-sm);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .evaluation-info {
          flex: 1;

          .evaluation-title {
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin-bottom: var(--spacing-sm);
          }

          .evaluation-rating {
            margin-bottom: var(--spacing-sm);
          }

          .evaluation-comment {
            color: var(--el-text-color-regular);
            font-size: var(--text-base);
          }
        }

        .evaluation-date {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
          margin-left: var(--text-lg);
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-10xl);
    }
  }
}
</style>
