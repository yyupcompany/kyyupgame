<template>
  <div class="mobile-my-activities">
    <!-- 统计卡片 -->
    <div class="stats-section">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item>
          <div class="stat-card primary">
            <div class="stat-number">{{ myStats.total }}</div>
            <div class="stat-label">我负责的活动</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card warning">
            <div class="stat-number">{{ myStats.upcoming }}</div>
            <div class="stat-label">即将开始</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card success">
            <div class="stat-number">{{ myStats.ongoing }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card info">
            <div class="stat-number">{{ myStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索活动名称..."
        @search="onSearch"
        @clear="onClear"
      />
      <van-dropdown-menu>
        <van-dropdown-item
          v-model="filterStatus"
          :options="statusOptions"
          title="状态筛选"
        />
        <van-dropdown-item
          v-model="filterDate"
          :options="dateOptions"
          title="时间筛选"
        />
      </van-dropdown-menu>
    </div>

    <!-- 活动列表 -->
    <div class="activities-section">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="activity-item"
            @click="handleViewActivity(activity)"
          >
            <van-swipe-cell>
              <div class="activity-content">
                <!-- 活动头部 -->
                <div class="activity-header">
                  <div class="activity-title">{{ activity.title }}</div>
                  <van-tag :type="getStatusTagType(activity.status)" size="small">
                    {{ getStatusText(activity.status) }}
                  </van-tag>
                </div>

                <!-- 活动描述 -->
                <div class="activity-description">
                  {{ activity.description }}
                </div>

                <!-- 活动元信息 -->
                <div class="activity-meta">
                  <div class="meta-item">
                    <van-icon name="calendar-o" />
                    <span>{{ formatDate(activity.date) }}</span>
                  </div>
                  <div class="meta-item">
                    <van-icon name="clock-o" />
                    <span>{{ activity.startTime }} - {{ activity.endTime }}</span>
                  </div>
                  <div class="meta-item">
                    <van-icon name="location-o" />
                    <span>{{ activity.location }}</span>
                  </div>
                  <div class="meta-item">
                    <van-icon name="friends-o" />
                    <span>{{ activity.participantCount || 0 }} 人参与</span>
                  </div>
                </div>

                <!-- 活动操作按钮 -->
                <div class="activity-actions">
                  <van-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="handleEditActivity(activity)"
                  >
                    <van-icon name="edit" />
                    编辑
                  </van-button>
                  <van-button
                    size="small"
                    type="success"
                    plain
                    @click.stop="handleManageSignin(activity)"
                  >
                    <van-icon name="qr" />
                    签到
                  </van-button>
                  <van-button
                    size="small"
                    type="warning"
                    plain
                    @click.stop="handleViewEvaluation(activity)"
                  >
                    <van-icon name="star" />
                    评估
                  </van-button>
                </div>
              </div>

              <!-- 侧滑操作 -->
              <template #right>
                <van-button
                  square
                  type="warning"
                  text="编辑"
                  @click.stop="handleEditActivity(activity)"
                />
                <van-button
                  square
                  type="success"
                  text="签到"
                  @click.stop="handleManageSignin(activity)"
                />
                <van-button
                  square
                  type="danger"
                  text="删除"
                  @click.stop="handleDeleteActivity(activity)"
                />
              </template>
            </van-swipe-cell>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="filteredActivities.length === 0 && !loading"
        description="暂无活动数据"
        image="search"
      >
        <van-button type="primary" @click="$emit('create-activity')">
          创建第一个活动
        </van-button>
      </van-empty>
    </div>

    <!-- 最近评估 -->
    <div class="evaluations-section" v-if="recentEvaluations.length > 0">
      <van-cell-group inset title="最近的活动评估">
        <div
          v-for="evaluation in recentEvaluations"
          :key="evaluation.id"
          class="evaluation-item"
        >
          <div class="evaluation-header">
            <div class="evaluation-title">{{ evaluation.activityTitle }}</div>
            <van-rate
              :model-value="evaluation.rating"
              disabled
              :size="14"
              color="#ffd21e"
            />
          </div>
          <div class="evaluation-comment">{{ evaluation.comment }}</div>
          <div class="evaluation-footer">
            <span class="evaluation-date">{{ formatDate(evaluation.createdAt) }}</span>
            <van-button size="mini" type="primary" plain @click="$emit('view-all-evaluations')">
              查看全部
            </van-button>
          </div>
        </div>
      </van-cell-group>
    </div>

    <!-- 悬浮创建按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="plus"
      @click="$emit('create-activity')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'

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
  'delete-activity': [activity: Activity]
}>()

// 响应式数据
const searchKeyword = ref('')
const filterStatus = ref<string | undefined>()
const filterDate = ref<string | undefined>()
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const statusOptions = [
  { text: '全部状态', value: undefined },
  { text: '即将开始', value: 'upcoming' },
  { text: '进行中', value: 'ongoing' },
  { text: '已完成', value: 'completed' },
  { text: '已取消', value: 'cancelled' }
]

const dateOptions = [
  { text: '全部时间', value: undefined },
  { text: '今天', value: 'today' },
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' },
  { text: '下月', value: 'nextMonth' }
]

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

const filteredActivities = computed(() => {
  let result = myActivities.value

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(activity =>
      activity.title.toLowerCase().includes(keyword) ||
      activity.description.toLowerCase().includes(keyword) ||
      activity.location.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(activity => activity.status === filterStatus.value)
  }

  // 时间筛选
  if (filterDate.value) {
    const now = new Date()
    result = result.filter(activity => {
      const activityDate = new Date(activity.date)

      switch (filterDate.value) {
        case 'today':
          return isSameDay(activityDate, now)
        case 'week':
          return isSameWeek(activityDate, now)
        case 'month':
          return isSameMonth(activityDate, now)
        case 'nextMonth':
          return isSameMonth(activityDate, getNextMonth(now))
        default:
          return true
      }
    })
  }

  // 按日期排序
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const recentEvaluations = computed(() => {
  return props.evaluations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
})

// 工具方法
const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
}

const isSameWeek = (date1: Date, date2: Date) => {
  const startOfWeek = new Date(date2)
  startOfWeek.setDate(date2.getDate() - date2.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  return date1 >= startOfWeek && date1 <= endOfWeek
}

const isSameMonth = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
}

const getNextMonth = (date: Date) => {
  const nextMonth = new Date(date)
  nextMonth.setMonth(date.getMonth() + 1)
  return nextMonth
}

// 业务方法
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    'upcoming': 'primary',
    'ongoing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'default'
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
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '明天'
  } else if (days === -1) {
    return '昨天'
  } else if (days > 0 && days <= 7) {
    return `${days}天后`
  } else if (days < 0 && days >= -7) {
    return `${Math.abs(days)}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

const onSearch = () => {
  // 重新筛选
  finished.value = false
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const onClear = () => {
  searchKeyword.value = ''
  onSearch()
}

const onLoad = () => {
  // 模拟加载延迟
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const onRefresh = () => {
  finished.value = false
  setTimeout(() => {
    refreshing.value = false
    showToast('刷新成功')
  }, 1000)
}

const handleViewActivity = (activity: Activity) => {
  emit('view-activity', activity)
}

const handleEditActivity = (activity: Activity) => {
  emit('edit-activity', activity)
}

const handleManageSignin = (activity: Activity) => {
  emit('manage-signin', activity)
}

const handleViewEvaluation = (activity: Activity) => {
  emit('view-evaluation', activity)
}

const handleDeleteActivity = async (activity: Activity) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除活动"${activity.title}"吗？此操作不可恢复。`
    })
    emit('delete-activity', activity)
    showToast('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 生命周期
onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
})
</script>

<style lang="scss" scoped>
.mobile-my-activities {
  min-height: 100vh;
  background-color: var(--van-background-color);
  padding-bottom: 100px;

  .stats-section {
    margin: var(--spacing-md);

    .stat-card {
      text-align: center;
      padding: var(--spacing-md);
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .stat-number {
        font-size: var(--text-3xl);
        font-weight: bold;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }

      &.primary .stat-number {
        color: var(--van-primary-color);
      }

      &.success .stat-number {
        color: var(--van-success-color);
      }

      &.warning .stat-number {
        color: var(--van-warning-color);
      }

      &.info .stat-number {
        color: var(--van-info-color);
      }
    }
  }

  .search-filter-section {
    margin: var(--spacing-md);
    margin-bottom: 8px;
  }

  .activities-section {
    margin: 0 16px;

    .activity-item {
      margin-bottom: 12px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .activity-content {
        padding: var(--spacing-md);

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .activity-title {
            flex: 1;
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color-1);
            margin-right: 12px;
            line-height: 1.4;
          }
        }

        .activity-description {
          font-size: var(--text-sm);
          color: var(--van-text-color-2);
          line-height: 1.5;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        .activity-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm);
          margin-bottom: 16px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: var(--text-xs);
            color: var(--van-text-color-2);

            .van-icon {
              font-size: var(--text-sm);
              color: var(--van-text-color-3);
            }
          }
        }

        .activity-actions {
          display: flex;
          gap: var(--spacing-sm);
          justify-content: flex-start;

          .van-button {
            flex: 1;
            max-width: 80px;

            .van-icon {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }

  .evaluations-section {
    margin: var(--spacing-md);

    .evaluation-item {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      &:last-child {
        border-bottom: none;
      }

      .evaluation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .evaluation-title {
          flex: 1;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color-1);
          margin-right: 12px;
        }
      }

      .evaluation-comment {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.4;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .evaluation-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .evaluation-date {
          font-size: var(--text-xs);
          color: var(--van-text-color-3);
        }
      }
    }
  }

  :deep(.van-floating-bubble) {
    background: var(--van-primary-color);
    color: white;
  }
}
</style>