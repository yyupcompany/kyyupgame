<template>
  <div class="training-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">训练中心</h1>
      <p class="page-description">孩子的成长训练伙伴</p>
    </div>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" animated>
      <template #template>
        <div class="skeleton-grid">
          <el-skeleton-item variant="card" style="height: 180px" v-for="i in 4" :key="i" />
        </div>
      </template>
    </el-skeleton>

    <!-- 主要内容 -->
    <div v-else class="training-content">
      <!-- 今日任务概览 -->
      <div class="overview-cards">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="stat-card today-tasks">
              <div class="stat-icon">
                <el-icon size="28"><Calendar /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ overview.todayTasks.completedTasks }}/{{ overview.todayTasks.totalTasks }}</div>
                <div class="stat-label">今日任务</div>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <div class="stat-card progress-card">
              <div class="stat-icon">
                <el-icon size="28"><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ overview.weeklyProgress.percentage }}%</div>
                <div class="stat-label">本周进度</div>
              </div>
              <el-progress
                :percentage="overview.weeklyProgress.percentage"
                :show-text="false"
                :stroke-width="6"
                class="progress-bar"
              />
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <div class="stat-card streak-card">
              <div class="stat-icon">
                <el-icon size="28"><Crown /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ overview.monthlyStats.streakDays }}</div>
                <div class="stat-label">连续天数</div>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <div class="stat-card average-card">
              <div class="stat-icon">
                <el-icon size="28"><Star /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ overview.monthlyStats.averageScore.toFixed(1) }}</div>
                <div class="stat-label">平均分数</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 快速开始和下一步 -->
      <div class="quick-actions">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <div class="action-card start-training">
              <div class="action-header">
                <h3>快速开始</h3>
                <el-tag v-if="overview.nextActivity" size="small" :type="getActivityTypeColor(overview.nextActivity.type)">
                  {{ getActivityTypeLabel(overview.nextActivity.type) }}
                </el-tag>
              </div>
              <p v-if="overview.nextActivity" class="next-activity">
                下一个活动：{{ overview.nextActivity.name }}
              </p>
              <p v-else class="no-activity">
                今日所有任务已完成！
              </p>
              <el-button
                type="primary"
                size="large"
                @click="startNextActivity"
                :disabled="!overview.nextActivity"
                class="start-btn"
              >
                <el-icon><CaretRight /></el-icon>
                开始训练
              </el-button>
            </div>
          </el-col>

          <el-col :xs="24" :md="12">
            <div class="action-card view-recommendations">
              <div class="action-header">
                <h3>推荐活动</h3>
                <el-icon class="recommend-icon"><Magic /></el-icon>
              </div>
              <p>根据孩子的学习情况智能推荐</p>
              <el-button
                type="default"
                size="large"
                @click="viewRecommendations"
                class="recommend-btn"
              >
                <el-icon><View /></el-icon>
                查看推荐
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 最近成就 -->
      <div v-if="overview.recentAchievements.length > 0" class="recent-achievements">
        <div class="section-header">
          <h3>最近成就</h3>
          <router-link to="/training-center/achievements" class="view-all">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>

        <div class="achievements-grid">
          <div
            v-for="achievement in overview.recentAchievements"
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.isUnlocked }"
          >
            <div class="achievement-icon">
              <img :src="achievement.icon" :alt="achievement.name" />
            </div>
            <div class="achievement-info">
              <h4>{{ achievement.name }}</h4>
              <p>{{ achievement.description }}</p>
              <div class="achievement-points">+{{ achievement.points }} 积分</div>
            </div>
            <div v-if="achievement.isUnlocked" class="achievement-badge">
              <el-icon><Select /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速导航 -->
      <div class="quick-nav">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <router-link to="/training-center/activities" class="nav-item">
              <div class="nav-icon">
                <el-icon><Grid /></el-icon>
              </div>
              <div class="nav-label">训练活动</div>
            </router-link>
          </el-col>

          <el-col :xs="12" :sm="6">
            <router-link to="/training-center/plans" class="nav-item">
              <div class="nav-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="nav-label">训练计划</div>
            </router-link>
          </el-col>

          <el-col :xs="12" :sm="6">
            <router-link to="/training-center/records" class="nav-item">
              <div class="nav-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="nav-label">训练记录</div>
            </router-link>
          </el-col>

          <el-col :xs="12" :sm="6">
            <router-link to="/training-center/achievements" class="nav-item">
              <div class="nav-icon">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="nav-label">成就系统</div>
            </router-link>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  TrendCharts,
  Crown,
  Star,
  CaretRight,
  Magic,
  View,
  ArrowRight,
  Select,
  Grid,
  Document,
  DataLine,
  Trophy
} from '@element-plus/icons-vue'
import { trainingApi, type TrainingOverview, ActivityType } from '@/api/modules/training'

const router = useRouter()
const loading = ref(true)
const overview = ref<TrainingOverview>({
  todayTasks: {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalDuration: 0,
    estimatedTime: 0
  },
  weeklyProgress: {
    completed: 0,
    total: 0,
    percentage: 0
  },
  monthlyStats: {
    totalSessions: 0,
    totalMinutes: 0,
    averageScore: 0,
    streakDays: 0
  },
  recentAchievements: []
})

// 获取训练概览数据
const fetchOverview = async () => {
  try {
    loading.value = true
    const response = await trainingApi.getOverview()
    overview.value = response.data
  } catch (error) {
    console.error('获取训练概览失败:', error)
    ElMessage.error('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 获取活动类型颜色
const getActivityTypeColor = (type: ActivityType) => {
  const colors = {
    [ActivityType.COGNITIVE]: 'primary',
    [ActivityType.MOTOR]: 'success',
    [ActivityType.LANGUAGE]: 'warning',
    [ActivityType.SOCIAL]: 'danger'
  }
  return colors[type] || 'default'
}

// 获取活动类型标签
const getActivityTypeLabel = (type: ActivityType) => {
  const labels = {
    [ActivityType.COGNITIVE]: '认知',
    [ActivityType.MOTOR]: '运动',
    [ActivityType.LANGUAGE]: '语言',
    [ActivityType.SOCIAL]: '社交'
  }
  return labels[type] || '未知'
}

// 开始下一个活动
const startNextActivity = () => {
  if (overview.value.nextActivity) {
    router.push(`/training-center/activities/${overview.value.nextActivity.id}`)
  }
}

// 查看推荐活动
const viewRecommendations = () => {
  router.push('/training-center/activities?recommended=true')
}

// 页面挂载时获取数据
onMounted(() => {
  fetchOverview()
})
</script>

<style lang="scss" scoped>
.training-center {
  padding: var(--spacing-lg);
  background-color: var(--bg-color);
  min-height: 100vh;

  .page-header {
    margin-bottom: var(--spacing-xl);

    .page-title {
      font-size: var(--font-size-extra-large);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
      font-weight: 600;
    }

    .page-description {
      font-size: var(--font-size-base);
      color: var(--text-regular);
      margin: 0;
    }
  }

  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
  }

  .overview-cards {
    margin-bottom: var(--spacing-xl);

    .stat-card {
      background: var(--card-bg);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--box-shadow-light);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-base);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-color-white);
      }

      .today-tasks .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .progress-card .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .streak-card .stat-icon {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      .average-card .stat-icon {
        background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--font-size-extra-large);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--font-size-small);
          color: var(--text-secondary);
          margin-top: 4px;
        }
      }

      .progress-bar {
        margin-top: var(--spacing-sm);
      }
    }
  }

  .quick-actions {
    margin-bottom: var(--spacing-xl);

    .action-card {
      background: var(--card-bg);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--box-shadow-light);
      height: 100%;

      .action-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-md);

        h3 {
          margin: 0;
          font-size: var(--font-size-large);
          color: var(--text-primary);
        }

        .recommend-icon {
          font-size: var(--text-2xl);
          color: var(--el-color-warning);
        }
      }

      p {
        margin: 0 0 var(--spacing-lg) 0;
        color: var(--text-regular);
        font-size: var(--font-size-base);
      }

      .next-activity {
        color: var(--el-color-primary);
        font-weight: 500;
      }

      .start-btn,
      .recommend-btn {
        width: 100%;
        height: 48px;
        font-size: var(--font-size-base);
        font-weight: 500;

        .el-icon {
          margin-right: var(--spacing-xs);
        }
      }
    }
  }

  .recent-achievements {
    margin-bottom: var(--spacing-xl);

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);

      h3 {
        margin: 0;
        font-size: var(--font-size-large);
        color: var(--text-primary);
      }

      .view-all {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        color: var(--el-color-primary);
        text-decoration: none;
        font-size: var(--font-size-base);
        transition: all 0.3s ease;

        &:hover {
          color: var(--el-color-primary-dark-2);
        }
      }
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-md);

      .achievement-card {
        background: var(--card-bg);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-md);
        box-shadow: var(--box-shadow-light);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        position: relative;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--box-shadow-base);
        }

        &.unlocked {
          background: linear-gradient(135deg, var(--el-color-success-light-9), var(--el-color-success-light-8));
        }

        .achievement-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--el-fill-color-lighter);
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .achievement-info {
          flex: 1;

          h4 {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: var(--font-size-base);
            color: var(--text-primary);
          }

          p {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: var(--font-size-small);
            color: var(--text-secondary);
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .achievement-points {
            font-size: var(--font-size-small);
            color: var(--el-color-success);
            font-weight: 500;
          }
        }

        .achievement-badge {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          width: 24px;
          height: 24px;
          background: var(--el-color-success);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--el-color-white);
        }
      }
    }
  }

  .quick-nav {
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      background: var(--card-bg);
      border-radius: var(--border-radius-lg);
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: var(--box-shadow-light);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--box-shadow-base);

        .nav-icon {
          background: var(--el-color-primary);
          color: var(--el-color-white);
        }
      }

      .nav-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--el-fill-color-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        color: var(--text-secondary);
        transition: all 0.3s ease;
      }

      .nav-label {
        font-size: var(--font-size-base);
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .training-center {
    padding: var(--spacing-md);

    .overview-cards {
      .stat-card {
        padding: var(--spacing-md);

        .stat-icon {
          width: 50px;
          height: 50px;
        }

        .stat-content .stat-value {
          font-size: var(--font-size-large);
        }
      }
    }

    .quick-actions {
      .action-card {
        padding: var(--spacing-lg);
      }
    }

    .achievements-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>