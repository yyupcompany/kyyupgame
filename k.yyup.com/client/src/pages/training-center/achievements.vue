<template>
  <div class="training-achievements">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">成就系统</h1>
        <p class="page-description">记录孩子的成长里程碑</p>
      </div>
      <div class="header-actions">
        <el-select v-model="selectedChild" placeholder="选择孩子" @change="handleChildChange">
          <el-option
            v-for="child in children"
            :key="child.id"
            :label="child.name"
            :value="child.id"
          />
        </el-select>
      </div>
    </div>

    <!-- 成就统计 -->
    <div class="achievements-stats">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card total-points">
            <div class="stat-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ achievementsData.totalPoints }}</div>
              <div class="stat-label">总积分</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card unlocked">
            <div class="stat-icon">
              <el-icon><Select /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ achievementsData.unlockedCount }}/{{ achievementsData.totalCount }}</div>
              <div class="stat-label">已解锁成就</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card progress-rate">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ progressRate }}%</div>
              <div class="stat-label">完成率</div>
            </div>
            <el-progress
              :percentage="progressRate"
              :show-text="false"
              :stroke-width="6"
              class="progress-bar"
            />
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card level">
            <div class="stat-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ currentLevel }}</div>
              <div class="stat-label">当前等级</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选器 -->
    <div class="filters-section">
      <el-card class="filters-card">
        <div class="filter-content">
          <div class="filter-group">
            <span class="filter-label">分类：</span>
            <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button
                v-for="category in achievementsData.categories"
                :key="category"
                :label="category"
              >
                {{ getCategoryLabel(category) }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <div class="filter-group">
            <span class="filter-label">状态：</span>
            <el-radio-group v-model="selectedStatus" @change="handleStatusChange">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="unlocked">已解锁</el-radio-button>
              <el-radio-button label="locked">未解锁</el-radio-button>
              <el-radio-button label="progress">进行中</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 成就列表 -->
    <div class="achievements-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else class="achievements-grid">
        <div
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{
            'unlocked': achievement.isUnlocked,
            'in-progress': achievement.progress > 0 && !achievement.isUnlocked
          }"
          @click="viewAchievementDetail(achievement)"
        >
          <div class="achievement-header">
            <div class="achievement-icon-container">
              <img
                :src="achievement.icon"
                :alt="achievement.name"
                class="achievement-icon"
                :class="{ 'icon-unlocked': achievement.isUnlocked }"
              />
              <div v-if="achievement.isUnlocked" class="achievement-badge">
                <el-icon><Select /></el-icon>
              </div>
              <div v-else-if="achievement.progress > 0" class="progress-badge">
                {{ achievement.progress }}%
              </div>
            </div>
          </div>

          <div class="achievement-body">
            <h3 class="achievement-name">{{ achievement.name }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>

            <div class="achievement-info">
              <div class="info-item">
                <span class="label">分类：</span>
                <span class="value">{{ getCategoryLabel(achievement.category) }}</span>
              </div>
              <div class="info-item">
                <span class="label">积分：</span>
                <span class="value points">+{{ achievement.points }}</span>
              </div>
            </div>

            <div class="achievement-requirement">
              <div class="requirement-label">解锁条件</div>
              <div class="requirement-text">{{ achievement.requirement.description }}</div>
            </div>

            <div v-if="!achievement.isUnlocked" class="achievement-progress">
              <div class="progress-header">
                <span>进度</span>
                <span class="progress-text">{{ achievement.progress }}%</span>
              </div>
              <el-progress
                :percentage="achievement.progress"
                :stroke-width="8"
                :show-text="false"
                :color="getProgressColor(achievement.progress)"
              />
            </div>

            <div v-if="achievement.isUnlocked && achievement.unlockedAt" class="unlock-time">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDate(achievement.unlockedAt) }} 解锁</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成就详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="selectedAchievement?.name"
      width="600px"
      destroy-on-close
    >
      <div v-if="selectedAchievement" class="achievement-detail">
        <div class="detail-header">
          <div class="detail-icon-container">
            <img
              :src="selectedAchievement.icon"
              :alt="selectedAchievement.name"
              class="detail-icon"
              :class="{ 'icon-unlocked': selectedAchievement.isUnlocked }"
            />
            <div v-if="selectedAchievement.isUnlocked" class="detail-badge">
              <el-icon><Select /></el-icon>
              <span>已解锁</span>
            </div>
          </div>

          <div class="detail-info">
            <div class="detail-title">{{ selectedAchievement.name }}</div>
            <div class="detail-meta">
              <el-tag :type="getCategoryColor(selectedAchievement.category)" size="large">
                {{ getCategoryLabel(selectedAchievement.category) }}
              </el-tag>
              <div class="detail-points">+{{ selectedAchievement.points }} 积分</div>
            </div>
          </div>
        </div>

        <div class="detail-description">
          <h4>成就描述</h4>
          <p>{{ selectedAchievement.description }}</p>
        </div>

        <div class="detail-requirement">
          <h4>解锁条件</h4>
          <div class="requirement-card">
            <div class="requirement-type">{{ getRequirementTypeLabel(selectedAchievement.requirement.type) }}</div>
            <div class="requirement-description">{{ selectedAchievement.requirement.description }}</div>
          </div>
        </div>

        <div v-if="!selectedAchievement.isUnlocked" class="detail-progress">
          <h4>当前进度</h4>
          <div class="progress-detail">
            <el-progress
              :percentage="selectedAchievement.progress"
              :stroke-width="12"
              :color="getProgressColor(selectedAchievement.progress)"
            >
              <template #default="{ percentage }">
                <span class="progress-percentage">{{ percentage }}%</span>
              </template>
            </el-progress>
            <p class="progress-hint">{{ getProgressHint(selectedAchievement) }}</p>
          </div>
        </div>

        <div v-if="selectedAchievement.isUnlocked && selectedAchievement.unlockedAt" class="detail-unlock">
          <h4>解锁时间</h4>
          <div class="unlock-info">
            <el-icon><Clock /></el-icon>
            <span>{{ formatDateTime(selectedAchievement.unlockedAt) }}</span>
          </div>
        </div>

        <div class="detail-rewards">
          <h4>奖励内容</h4>
          <div class="rewards-list">
            <div class="reward-item">
              <el-icon class="reward-icon"><Coin /></el-icon>
              <span>{{ selectedAchievement.points }} 积分</span>
            </div>
            <div class="reward-item">
              <el-icon class="reward-icon"><Medal /></el-icon>
              <span>专属徽章</span>
            </div>
            <div class="reward-item">
              <el-icon class="reward-icon"><Trophy /></el-icon>
              <span>经验值 +{{ selectedAchievement.points * 10 }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
          <el-button
            v-if="!selectedAchievement?.isUnlocked"
            type="primary"
            @click="shareAchievement"
          >
            <el-icon><Share /></el-icon>
            分享目标
          </el-button>
          <el-button
            v-else
            type="success"
            @click="shareAchievement"
          >
            <el-icon><Share /></el-icon>
            分享成就
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Trophy,
  Select,
  TrendCharts,
  Star,
  Clock,
  Share,
  Coin,
  Medal
} from '@element-plus/icons-vue'
import { trainingApi, type Achievement } from '@/api/modules/training'

// 响应式数据
const loading = ref(false)
const selectedChild = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const children = ref<Array<{ id: string; name: string }>>([]) // 应该从用户数据获取

// 成就数据
const achievementsData = ref({
  achievements: [] as Achievement[],
  categories: [] as string[],
  totalPoints: 0,
  unlockedCount: 0,
  totalCount: 0
})

// 对话框状态
const showDetailDialog = ref(false)
const selectedAchievement = ref<Achievement | null>(null)

// 计算属性
const progressRate = computed(() => {
  if (achievementsData.value.totalCount === 0) return 0
  return Math.round((achievementsData.value.unlockedCount / achievementsData.value.totalCount) * 100)
})

const currentLevel = computed(() => {
  const points = achievementsData.value.totalPoints
  if (points < 100) return 1
  if (points < 300) return 2
  if (points < 600) return 3
  if (points < 1000) return 4
  if (points < 1500) return 5
  if (points < 2500) return 6
  if (points < 4000) return 7
  if (points < 6000) return 8
  if (points < 8500) return 9
  return 10
})

const filteredAchievements = computed(() => {
  let achievements = [...achievementsData.value.achievements]

  // 按分类筛选
  if (selectedCategory.value !== 'all') {
    achievements = achievements.filter(a => a.category === selectedCategory.value)
  }

  // 按状态筛选
  if (selectedStatus.value !== 'all') {
    if (selectedStatus.value === 'unlocked') {
      achievements = achievements.filter(a => a.isUnlocked)
    } else if (selectedStatus.value === 'locked') {
      achievements = achievements.filter(a => !a.isUnlocked && a.progress === 0)
    } else if (selectedStatus.value === 'progress') {
      achievements = achievements.filter(a => !a.isUnlocked && a.progress > 0)
    }
  }

  return achievements.sort((a, b) => {
    // 未解锁的排在前面，已解锁的按解锁时间排序
    if (a.isUnlocked !== b.isUnlocked) {
      return a.isUnlocked ? 1 : -1
    }
    if (a.isUnlocked && b.isUnlocked) {
      return new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
    }
    return b.progress - a.progress
  })
})

// 获取成就数据
const fetchAchievements = async () => {
  try {
    loading.value = true
    const response = await trainingApi.getAchievements(selectedChild.value || undefined)
    achievementsData.value = response.data
  } catch (error) {
    console.error('获取成就数据失败:', error)
    ElMessage.error('加载成就数据失败')
  } finally {
    loading.value = false
  }
}

// 处理孩子选择变化
const handleChildChange = () => {
  fetchAchievements()
}

// 处理分类筛选
const handleCategoryChange = () => {
  // 筛选逻辑已在计算属性中处理
}

// 处理状态筛选
const handleStatusChange = () => {
  // 筛选逻辑已在计算属性中处理
}

// 查看成就详情
const viewAchievementDetail = (achievement: Achievement) => {
  selectedAchievement.value = achievement
  showDetailDialog.value = true
}

// 分享成就
const shareAchievement = () => {
  if (!selectedAchievement.value) return

  const achievement = selectedAchievement.value
  const text = achievement.isUnlocked
    ? `我解锁了「${achievement.name}」成就！获得了${achievement.points}积分！`
    : `我的目标是解锁「${achievement.name}」成就，目前进度${achievement.progress}%！`

  if (navigator.share) {
    navigator.share({
      title: '训练成就分享',
      text: text
    })
  } else {
    navigator.clipboard.writeText(text)
    ElMessage.success('分享内容已复制到剪贴板')
  }
}

// 工具函数
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'cognitive': '认知能力',
    'motor': '运动技能',
    'language': '语言发展',
    'social': '社交能力',
    'creativity': '创造力',
    'persistence': '坚持力',
    'milestone': '里程碑',
    'special': '特别成就'
  }
  return labels[category] || category
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'cognitive': 'primary',
    'motor': 'success',
    'language': 'warning',
    'social': 'danger',
    'creativity': 'info',
    'persistence': '',
    'milestone': 'success',
    'special': 'warning'
  }
  return colors[category] || 'default'
}

const getRequirementTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'completion_count': '完成次数',
    'score_average': '平均分数',
    'streak_days': '连续天数',
    'total_time': '总训练时长'
  }
  return labels[type] || type
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67c23a'
  if (progress >= 50) return '#e6a23c'
  if (progress >= 20) return '#f56c6c'
  return '#909399'
}

const getProgressHint = (achievement: Achievement) => {
  const progress = achievement.progress
  if (progress >= 80) return '即将解锁！加油！'
  if (progress >= 50) return '已完成一半，继续努力！'
  if (progress >= 20) return '好的开始，保持下去！'
  return '刚开始，需要更多努力！'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 页面挂载时获取数据
onMounted(() => {
  fetchAchievements()
})
</script>

<style lang="scss" scoped>
.training-achievements {
  padding: var(--spacing-lg);
  background-color: var(--bg-card);
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xl);

    .header-left {
      .page-title {
        font-size: var(--font-size-extra-large);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        font-weight: 600;
      }

      .page-description {
        font-size: var(--font-size-base);
        color: var(--text-regular);
        margin: 0;
      }
    }

    .header-actions {
      .el-select {
        width: 200px;
      }
    }
  }

  .achievements-stats {
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
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-success));
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-base);
      }

      &.total-points::before {
        background: linear-gradient(90deg, #ffd700, #ffed4e);
      }

      &.unlocked::before {
        background: linear-gradient(90deg, var(--el-color-success), #95de64);
      }

      &.progress-rate::before {
        background: linear-gradient(90deg, var(--el-color-primary), #69c0ff);
      }

      &.level::before {
        background: linear-gradient(90deg, var(--el-color-warning), #ffd666);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        color: var(--el-color-white);
        background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
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

  .filters-section {
    margin-bottom: var(--spacing-xl);

    .filters-card {
      :deep(.el-card__body) {
        padding: var(--spacing-lg);
      }

      .filter-content {
        display: flex;
        gap: var(--spacing-xl);
        align-items: center;
        flex-wrap: wrap;

        .filter-group {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);

          .filter-label {
            font-size: var(--font-size-base);
            color: var(--text-primary);
            font-weight: 500;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .achievements-content {
    .loading-container {
      padding: var(--spacing-xl);
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-lg);

      .achievement-card {
        background: var(--card-bg);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-lg);
        box-shadow: var(--box-shadow-light);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--box-shadow-base);
        }

        &.unlocked {
          background: linear-gradient(135deg, var(--el-color-success-light-9), var(--el-color-success-light-8));
          border: 2px solid var(--el-color-success-light-5);
        }

        &.in-progress {
          background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
          border: 2px solid var(--el-color-primary-light-5);
        }

        .achievement-header {
          text-align: center;
          margin-bottom: var(--spacing-md);

          .achievement-icon-container {
            position: relative;
            display: inline-block;

            .achievement-icon {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              object-fit: cover;
              filter: grayscale(100%);
              transition: all 0.3s ease;

              &.icon-unlocked {
                filter: grayscale(0%);
              }
            }

            .achievement-badge {
              position: absolute;
              bottom: -5px;
              right: -5px;
              width: 28px;
              height: 28px;
              background: var(--el-color-success);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--el-color-white);
              box-shadow: var(--box-shadow-base);
            }

            .progress-badge {
              position: absolute;
              bottom: -5px;
              right: -5px;
              min-width: 28px;
              height: 28px;
              background: var(--el-color-primary);
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--el-color-white);
              font-size: var(--font-size-small);
              padding: 0 6px;
              box-shadow: var(--box-shadow-base);
            }
          }
        }

        .achievement-body {
          .achievement-name {
            font-size: var(--font-size-large);
            color: var(--text-primary);
            margin: 0 0 var(--spacing-sm) 0;
            font-weight: 600;
            text-align: center;
          }

          .achievement-description {
            font-size: var(--font-size-base);
            color: var(--text-regular);
            margin: 0 0 var(--spacing-md) 0;
            text-align: center;
            line-height: 1.6;
          }

          .achievement-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-md);
            font-size: var(--font-size-small);

            .info-item {
              .label {
                color: var(--text-secondary);
              }

              .value {
                color: var(--text-primary);
                font-weight: 500;

                &.points {
                  color: var(--el-color-success);
                }
              }
            }
          }

          .achievement-requirement {
            background: var(--el-fill-color-light);
            border-radius: var(--border-radius-base);
            padding: var(--spacing-sm) var(--spacing-md);
            margin-bottom: var(--spacing-md);

            .requirement-label {
              font-size: var(--font-size-small);
              color: var(--text-secondary);
              margin-bottom: 4px;
            }

            .requirement-text {
              font-size: var(--font-size-small);
              color: var(--text-primary);
              font-weight: 500;
            }
          }

          .achievement-progress {
            margin-bottom: var(--spacing-md);

            .progress-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: var(--spacing-xs);
              font-size: var(--font-size-small);

              .progress-text {
                color: var(--el-color-primary);
                font-weight: 600;
              }
            }
          }

          .unlock-time {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
            font-size: var(--font-size-small);
            color: var(--el-color-success);
            margin-top: var(--spacing-sm);
          }
        }
      }
    }
  }

  .achievement-detail {
    .detail-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--el-border-color-lighter);

      .detail-icon-container {
        position: relative;

        .detail-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          filter: grayscale(100%);
          transition: all 0.3s ease;

          &.icon-unlocked {
            filter: grayscale(0%);
          }
        }

        .detail-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: var(--el-color-success);
          color: var(--el-color-white);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-base);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-small);
          font-weight: 500;
          box-shadow: var(--box-shadow-base);
        }
      }

      .detail-info {
        flex: 1;

        .detail-title {
          font-size: var(--font-size-extra-large);
          color: var(--text-primary);
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
        }

        .detail-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);

          .detail-points {
            font-size: var(--font-size-large);
            color: var(--el-color-success);
            font-weight: 600;
          }
        }
      }
    }

    .detail-description,
    .detail-requirement,
    .detail-progress,
    .detail-unlock,
    .detail-rewards {
      margin-bottom: var(--spacing-lg);

      h4 {
        font-size: var(--font-size-large);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-md) 0;
      }

      p {
        margin: 0;
        color: var(--text-regular);
        line-height: 1.6;
      }
    }

    .detail-requirement {
      .requirement-card {
        background: var(--el-fill-color-light);
        border-radius: var(--border-radius-base);
        padding: var(--spacing-md);

        .requirement-type {
          font-size: var(--font-size-small);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .requirement-description {
          font-size: var(--font-size-base);
          color: var(--text-primary);
          font-weight: 500;
        }
      }
    }

    .detail-progress {
      .progress-detail {
        .progress-percentage {
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-hint {
          margin-top: var(--spacing-md);
          color: var(--text-secondary);
          font-size: var(--font-size-small);
          text-align: center;
        }
      }
    }

    .detail-unlock {
      .unlock-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--el-color-success);
        font-weight: 500;
      }
    }

    .detail-rewards {
      .rewards-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-md);

        .reward-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--el-fill-color-light);
          border-radius: var(--border-radius-base);
          font-size: var(--font-size-base);

          .reward-icon {
            color: var(--el-color-warning);
            font-size: var(--text-xl);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .training-achievements {
    padding: var(--spacing-md);

    .page-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;

      .header-actions {
        width: 100%;

        .el-select {
          width: 100%;
        }
      }
    }

    .achievements-stats {
      .stat-card {
        padding: var(--spacing-md);

        .stat-icon {
          width: 50px;
          height: 50px;
          font-size: var(--text-xl);
        }

        .stat-content .stat-value {
          font-size: var(--font-size-large);
        }
      }
    }

    .filters-section {
      .filters-card {
        .filter-content {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-md);
        }
      }
    }

    .achievements-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .achievement-detail {
      .detail-header {
        flex-direction: column;
        text-align: center;

        .detail-icon-container {
          .detail-icon {
            width: 80px;
            height: 80px;
          }
        }
      }
    }
  }
}
</style>