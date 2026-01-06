<template>
  <div class="mobile-class-overview-card">
    <van-cell-group inset class="class-overview-card" @click="$emit('click')">
      <!-- 卡片头部 -->
      <van-cell class="card-header">
        <template #title>
          <div class="header-content">
            <div class="header-left">
              <van-icon name="friends-o" class="header-icon" />
              <span class="header-title">班级概览</span>
            </div>
            <van-icon name="arrow" class="arrow-icon" />
          </div>
        </template>
      </van-cell>

      <!-- 主要统计信息 -->
      <van-cell class="stats-section">
        <template #default>
          <div v-if="loading" class="loading-container">
            <van-skeleton title :row="3" animated />
          </div>

          <div v-else-if="classes.length === 0" class="empty-state">
            <van-empty description="暂无班级信息" />
          </div>

          <div v-else class="stats-grid">
            <div class="main-stat">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">负责班级</div>
            </div>
            <div class="divider"></div>
            <div class="sub-stats">
              <div class="sub-stat-item">
                <div class="stat-value today">{{ stats.todayClasses }}</div>
                <div class="stat-desc">今日课程</div>
              </div>
              <div class="sub-stat-item">
                <div class="stat-value students">{{ stats.studentsCount }}</div>
                <div class="stat-desc">学生总数</div>
              </div>
            </div>
          </div>
        </template>
      </van-cell>

      <!-- 班级列表 -->
      <van-cell class="classes-section" v-if="!loading && classes.length > 0">
        <template #default>
          <div class="classes-list">
            <div
              v-for="classItem in limitedClasses"
              :key="classItem.id"
              class="class-item"
              @click="handleClassClick(classItem)"
            >
              <div class="class-avatar">
                <van-image
                  :src="classItem.avatar"
                  width="40"
                  height="40"
                  round
                  fit="cover"
                  :fallback-src="getDefaultAvatar(classItem.name)"
                >
                  <template #error>
                    <div class="default-avatar">{{ classItem.name.charAt(0) }}</div>
                  </template>
                </van-image>
              </div>

              <div class="class-info">
                <div class="class-name">{{ classItem.name }}</div>
                <div class="class-meta">
                  <span class="student-count">
                    <van-icon name="friends-o" size="12" />
                    {{ classItem.studentCount }}人
                  </span>
                  <span class="class-type">{{ classItem.type }}</span>
                </div>
              </div>

              <div class="class-status">
                <van-tag
                  :type="getStatusType(classItem.status)"
                  size="medium"
                >
                  {{ getStatusText(classItem.status) }}
                </van-tag>
              </div>
            </div>

            <div v-if="classes.length > showLimit" class="show-more" @click="viewAllClasses">
              <span>查看全部班级 ({{ classes.length }})</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </template>
      </van-cell>

      <!-- 进度条展示 -->
      <van-cell class="progress-section" v-if="!loading && classes.length > 0">
        <template #default>
          <div class="progress-container">
            <div class="progress-header">
              <span class="progress-label">教学完成率</span>
              <span class="progress-percentage">{{ stats.completionRate }}%</span>
            </div>
            <van-progress
              :percentage="stats.completionRate"
              stroke-width="8"
              :color="progressColor"
              track-color="#f0f0f0"
            />
          </div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

interface ClassStats {
  total: number
  todayClasses: number
  studentsCount: number
  completionRate: number
}

interface ClassInfo {
  id: string
  name: string
  studentCount: number
  type: string
  status: 'active' | 'inactive' | 'pending' | 'archived'
  avatar?: string
  description?: string
  createTime: Date
  updateTime: Date
  lastActiveTime?: Date
}

interface Props {
  stats: ClassStats
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
  stats: () => ({
    total: 0,
    todayClasses: 0,
    studentsCount: 0,
    completionRate: 0
  })
})

const emit = defineEmits<{
  click: []
}>()

const router = useRouter()

// 响应式数据
const loading = ref(true)
const classes = ref<ClassInfo[]>([])
const showLimit = ref(3)

// 计算属性
const computedStats = computed(() => ({
  totalClasses: classes.value.length,
  totalStudents: classes.value.reduce((sum, c) => sum + c.studentCount, 0),
  activeClasses: classes.value.filter(c => c.status === 'active').length,
  todayClasses: getTodayClassesCount(),
  ...props.stats
}))

const limitedClasses = computed(() =>
  classes.value.slice(0, showLimit.value)
)

// 进度条颜色
const progressColor = computed(() => {
  const rate = props.stats.completionRate
  if (rate >= 90) return '#07c160'
  if (rate >= 70) return '#ff976a'
  return '#ee0a24'
})

// 方法
const getDefaultAvatar = (name: string) => {
  // 根据班级名称生成默认头像
  const colors = ['#409eff', '#07c160', '#ff976a', '#ee0a24', '#722ed1', '#13c2c2']
  const index = name.charCodeAt(0) % colors.length
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="${colors[index]}"/>
      <text x="20" y="28" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${name.charAt(0)}</text>
    </svg>
  `)}`
}

const getTodayClassesCount = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return classes.value.filter(c => {
    if (!c.lastActiveTime) return false
    const lastActive = new Date(c.lastActiveTime)
    return lastActive >= today && lastActive < tomorrow
  }).length
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'default'
    case 'pending':
      return 'warning'
    case 'archived':
      return 'danger'
    default:
      return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '活跃'
    case 'inactive':
      return '休眠'
    case 'pending':
      return '待审核'
    case 'archived':
      return '已归档'
    default:
      return '未知'
  }
}

const handleClassClick = (classItem: ClassInfo) => {
  router.push(`/mobile/teacher-center/teaching/class/${classItem.id}`)
}

const viewAllClasses = () => {
  router.push('/mobile/teacher-center/teaching')
}

const loadClasses = async () => {
  try {
    loading.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据
    const mockClasses: ClassInfo[] = [
      {
        id: '1',
        name: '大班A班',
        studentCount: 28,
        type: '常规班',
        status: 'active',
        createTime: new Date('2024-01-15'),
        updateTime: new Date(),
        lastActiveTime: new Date()
      },
      {
        id: '2',
        name: '中班B班',
        studentCount: 25,
        type: '艺术班',
        status: 'active',
        createTime: new Date('2024-02-20'),
        updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastActiveTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: '小班C班',
        studentCount: 22,
        type: '启蒙班',
        status: 'active',
        createTime: new Date('2024-03-10'),
        updateTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastActiveTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        name: '兴趣班D班',
        studentCount: 15,
        type: '特色班',
        status: 'pending',
        createTime: new Date('2024-04-05'),
        updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastActiveTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: '5',
        name: '实验班E班',
        studentCount: 30,
        type: '实验班',
        status: 'archived',
        createTime: new Date('2023-09-01'),
        updateTime: new Date('2024-01-01'),
        lastActiveTime: new Date('2024-01-01')
      }
    ]

    classes.value = mockClasses.sort((a, b) =>
      new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    )

  } catch (error) {
    console.error('加载班级信息失败:', error)
    showToast('加载班级信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClasses()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-class-overview-card {
  margin: var(--spacing-md) 16px;

  .class-overview-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    // 卡片头部样式
    .card-header {
      background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
      cursor: pointer;

      &:active {
        background: linear-gradient(135deg, #531dab 0%, #722ed1 100%);
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .header-icon {
            font-size: var(--text-xl);
            color: white;
          }

          .header-title {
            font-size: var(--text-base);
            font-weight: 600;
            color: white;
          }
        }

        .arrow-icon {
          color: white;
          font-size: var(--text-base);
          opacity: 0.8;
        }
      }
    }

    // 统计区域样式
    .stats-section {
      padding: var(--spacing-lg) 16px;

      .stats-grid {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .main-stat {
          flex: 0 0 auto;
          text-align: center;

          .stat-number {
            font-size: var(--text-4xl);
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            font-weight: 500;
          }
        }

        .divider {
          width: 1px;
          height: 40px;
          background: #ebedf0;
          margin: 0 20px;
        }

        .sub-stats {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);

          .sub-stat-item {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .stat-value {
              font-size: var(--text-lg);
              font-weight: 600;
              line-height: 1;

              &.today {
                color: #409eff;
              }

              &.students {
                color: #722ed1;
              }
            }

            .stat-desc {
              font-size: var(--text-xs);
              color: var(--text-secondary);
              font-weight: 500;
            }
          }
        }
      }
    }

    // 班级列表样式
    .classes-section {
      padding: var(--spacing-md);

      .classes-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);

        .class-item {
          display: flex;
          align-items: center;
          padding: var(--spacing-md);
          background: #f8f9fa;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;

          &:active {
            background: #e9ecef;
            transform: scale(0.98);
          }

          .class-avatar {
            margin-right: 12px;

            .default-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: var(--text-base);
              font-weight: 600;
              color: white;
            }
          }

          .class-info {
            flex: 1;
            min-width: 0;

            .class-name {
              font-size: var(--text-sm);
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .class-meta {
              display: flex;
              gap: var(--spacing-md);
              font-size: var(--text-xs);
              color: var(--text-secondary);

              .student-count {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);

                .van-icon {
                  font-size: var(--text-xs);
                }
              }

              .class-type {
                color: #969799;
              }
            }
          }

          .class-status {
            flex-shrink: 0;
            margin-left: 12px;
          }
        }

        .show-more {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-md);
          color: #722ed1;
          font-size: var(--text-sm);
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;

          &:active {
            background: rgba(114, 46, 209, 0.1);
          }

          span {
            margin-right: 6px;
          }
        }
      }
    }

    // 进度条区域样式
    .progress-section {
      padding: var(--spacing-md);
      background: #f8f9fa;

      .progress-container {
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .progress-label {
            font-size: var(--text-sm);
            font-weight: 500;
            color: var(--text-primary);
          }

          .progress-percentage {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--text-primary);
          }
        }
      }
    }
  }
}

// 加载和空状态
.loading-container,
.empty-state {
  padding: var(--spacing-xl) 16px;
  text-align: center;
}

// Vant组件样式覆盖
:deep(.van-cell-group) {
  background: white;
}

:deep(.van-cell) {
  padding: var(--spacing-md);

  &.card-header {
    padding: var(--spacing-md) 16px;
  }

  &.stats-section {
    padding: var(--spacing-lg) 16px;
  }

  &.classes-section,
  &.progress-section {
    padding: var(--spacing-md) 16px;
  }

  &:active {
    background-color: transparent;
  }
}

:deep(.van-image) {
  border-radius: 50%;
  overflow: hidden;
}

:deep(.van-tag) {
  border-radius: 4px;
}

:deep(.van-progress) {
  .van-progress__portion {
    border-radius: 4px;
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-class-overview-card {
    margin: var(--spacing-sm) 12px;

    .class-overview-card {
      .stats-section {
        padding: var(--spacing-md) 12px;

        .stats-grid {
          .main-stat {
            .stat-number {
              font-size: var(--text-3xl);
            }
          }

          .divider {
            margin: 0 16px;
            height: 36px;
          }

          .sub-stats {
            gap: 10px;

            .sub-stat-item {
              .stat-value {
                font-size: var(--text-base);
              }

              .stat-desc {
                font-size: 11px;
              }
            }
          }
        }
      }

      .classes-section {
        padding: var(--spacing-md);

        .classes-list {
          gap: 10px;

          .class-item {
            padding: 10px;

            .class-avatar {
              margin-right: 10px;
            }

            .class-info {
              .class-name {
                font-size: var(--text-sm);
              }

              .class-meta {
                gap: 10px;
                font-size: 11px;
              }
            }

            .class-status {
              margin-left: 10px;
            }
          }
        }
      }

      .progress-section {
        padding: var(--spacing-md);
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .mobile-class-overview-card {
    .class-overview-card {
      background: var(--dark-card-bg);

      .stats-section {
        .stats-grid {
          .divider {
            background: var(--dark-border-color);
          }
        }
      }

      .classes-section {
        .classes-list {
          .class-item {
            background: var(--dark-bg-secondary);
          }
        }
      }

      .progress-section {
        background: var(--dark-bg-secondary);
      }
    }
  }
}
</style>