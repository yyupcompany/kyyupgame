<template>
  <div class="mobile-activity-list">
    <!-- 搜索和筛选 -->
    <div class="list-header">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索活动名称"
        @search="handleSearch"
        @clear="handleClearSearch"
        show-action
      >
        <template #action>
          <van-button
            size="small"
            @click="showFilter = true"
          >
            筛选
          </van-button>
        </template>
      </van-search>
    </div>

    <!-- 活动列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-item"
          :to="`/mobile/teacher-center/activities/${activity.id}`"
        >
          <template #title>
            <div class="activity-header">
              <span class="activity-title">{{ activity.title }}</span>
              <van-tag
                :type="getActivityStatusType(activity.status)"
                size="small"
              >
                {{ getActivityStatusText(activity.status) }}
              </van-tag>
            </div>
          </template>

          <template #label>
            <div class="activity-info">
              <div class="info-row">
                <van-icon name="clock-o" size="14" />
                <span>{{ formatDateTime(activity.startTime, activity.endTime) }}</span>
              </div>
              <div class="info-row">
                <van-icon name="location-o" size="14" />
                <span>{{ activity.location }}</span>
              </div>
              <div class="info-row">
                <van-icon name="friends-o" size="14" />
                <span>{{ activity.registeredCount || 0 }}/{{ activity.capacity }}人</span>
                <van-progress
                  :percentage="getProgressPercentage(activity)"
                  :show-pivot="false"
                  stroke-width="4"
                  color="#409EFF"
                />
              </div>
            </div>
          </template>

          <template #right-icon>
            <div class="activity-actions">
              <van-button
                v-if="canEdit(activity)"
                size="mini"
                type="primary"
                plain
                @click.stop="handleEdit(activity)"
              >
                编辑
              </van-button>
              <van-button
                v-if="canJoin(activity)"
                size="mini"
                type="success"
                plain
                @click.stop="handleJoin(activity)"
              >
                参加
              </van-button>
              <van-button
                size="mini"
                plain
                @click.stop="handleView(activity)"
              >
                详情
              </van-button>
            </div>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>

    <!-- 筛选弹窗 -->
    <van-popup v-model:show="showFilter" position="bottom" :style="{ height: '60%' }">
      <div class="filter-popup">
        <div class="filter-header">
          <van-button
            type="default"
            size="small"
            @click="resetFilters"
          >
            重置
          </van-button>
          <span class="filter-title">筛选条件</span>
          <van-button
            type="primary"
            size="small"
            @click="applyFilters"
          >
            确定
          </van-button>
        </div>

        <div class="filter-content">
          <van-field name="activityType" label="活动类型">
            <template #input>
              <van-radio-group v-model="filters.activityType" direction="horizontal">
                <van-radio name="">全部</van-radio>
                <van-radio name="1">开放日</van-radio>
                <van-radio name="2">体验课</van-radio>
                <van-radio name="3">亲子活动</van-radio>
                <van-radio name="4">说明会</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field name="status" label="活动状态">
            <template #input>
              <van-radio-group v-model="filters.status" direction="horizontal">
                <van-radio name="">全部</van-radio>
                <van-radio name="1">未开始</van-radio>
                <van-radio name="2">报名中</van-radio>
                <van-radio name="3">进行中</van-radio>
                <van-radio name="4">已结束</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field name="dateRange" label="时间范围">
            <template #input>
              <van-button
                size="small"
                @click="showDatePicker = true"
              >
                {{ dateRangeText }}
              </van-button>
            </template>
          </van-field>
        </div>
      </div>
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="dateRange"
        type="range"
        title="选择日期范围"
        @confirm="onDateRangeConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 快速创建按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="plus"
      @click="handleCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

interface Activity {
  id: number
  title: string
  description?: string
  activityType: number
  startTime: string
  endTime: string
  location: string
  capacity: number
  fee?: number
  status: number
  registeredCount?: number
  isOrganizer?: boolean
  isParticipant?: boolean
}

interface Props {
  activities: Activity[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activities: () => [],
  loading: false
})

const emit = defineEmits<{
  view: [activity: Activity]
  edit: [activity: Activity]
  join: [activity: Activity]
  create: []
  refresh: []
  search: [keyword: string]
}>()

const searchKeyword = ref('')
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showFilter = ref(false)
const showDatePicker = ref(false)
const dateRange = ref<[Date, Date] | null>(null)

const filters = ref({
  activityType: '',
  status: '',
  dateRange: null as [Date, Date] | null
})

const filteredActivities = computed(() => {
  let result = props.activities

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(activity =>
      activity.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 活动类型筛选
  if (filters.value.activityType) {
    result = result.filter(activity =>
      activity.activityType.toString() === filters.value.activityType
    )
  }

  // 状态筛选
  if (filters.value.status) {
    result = result.filter(activity =>
      activity.status.toString() === filters.value.status
    )
  }

  // 日期范围筛选
  if (filters.value.dateRange) {
    const [start, end] = filters.value.dateRange
    result = result.filter(activity => {
      const activityDate = dayjs(activity.startTime)
      return activityDate.isAfter(start) && activityDate.isBefore(end)
    })
  }

  return result
})

const dateRangeText = computed(() => {
  if (!filters.value.dateRange) return '选择日期'
  const [start, end] = filters.value.dateRange
  return `${dayjs(start).format('MM-DD')} ~ ${dayjs(end).format('MM-DD')}`
})

const onLoad = () => {
  // 模拟加载更多
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const onRefresh = () => {
  refreshing.value = true
  emit('refresh')
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  emit('search', keyword)
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  emit('search', '')
}

const applyFilters = () => {
  showFilter.value = false
  // 筛选逻辑已通过 computed 实现
}

const resetFilters = () => {
  filters.value = {
    activityType: '',
    status: '',
    dateRange: null
  }
  dateRange.value = null
}

const onDateRangeConfirm = (value: [Date, Date]) => {
  filters.value.dateRange = value
  dateRange.value = value
  showDatePicker.value = false
}

const handleView = (activity: Activity) => {
  emit('view', activity)
}

const handleEdit = (activity: Activity) => {
  emit('edit', activity)
}

const handleJoin = async (activity: Activity) => {
  try {
    await showConfirmDialog({
      title: '确认参加',
      message: `确定要参加"${activity.title}"吗？`
    })
    emit('join', activity)
  } catch {
    // 用户取消
  }
}

const handleCreate = () => {
  emit('create')
}

const getActivityStatusType = (status: number): string => {
  const typeMap: Record<number, string> = {
    0: 'default', // 草稿
    1: 'warning', // 未开始
    2: 'primary', // 报名中
    3: 'success', // 进行中
    4: 'default', // 已结束
    5: 'danger'   // 已取消
  }
  return typeMap[status] || 'default'
}

const getActivityStatusText = (status: number): string => {
  const textMap: Record<number, string> = {
    0: '草稿',
    1: '未开始',
    2: '报名中',
    3: '进行中',
    4: '已结束',
    5: '已取消'
  }
  return textMap[status] || '未知'
}

const formatDateTime = (startTime: string, endTime: string): string => {
  const start = dayjs(startTime)
  const end = dayjs(endTime)

  if (start.isSame(end, 'day')) {
    return `${start.format('MM-DD HH:mm')} ~ ${end.format('HH:mm')}`
  } else {
    return `${start.format('MM-DD HH:mm')} ~ ${end.format('MM-DD HH:mm')}`
  }
}

const getProgressPercentage = (activity: Activity): number => {
  if (!activity.capacity || activity.capacity === 0) return 0
  const registered = activity.registeredCount || 0
  return Math.round((registered / activity.capacity) * 100)
}

const canEdit = (activity: Activity): boolean => {
  return activity.isOrganizer && activity.status !== 4 // 已结束的活动不能编辑
}

const canJoin = (activity: Activity): boolean => {
  return !activity.isParticipant && activity.status === 2 // 报名中的活动可以参加
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-activity-list {
  background: var(--card-bg);
  min-height: 100vh;

  .list-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--card-bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .activity-item {
    margin-bottom: 8px;
    padding: var(--spacing-md) 16px;
    background: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:active {
      background: var(--primary-color);
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .activity-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
        flex: 1;
        margin-right: 8px;
      }
    }

    .activity-info {
      .info-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        font-size: var(--text-xs);
        color: #666;

        &:last-child {
          margin-bottom: 0;
        }

        .van-progress {
          flex: 1;
          margin-left: 8px;
        }
      }
    }

    .activity-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
    }
  }
}

.filter-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid #eee;

    .filter-title {
      font-size: var(--text-base);
      font-weight: 600;
    }
  }

  .filter-content {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;

    .van-field {
      margin-bottom: 16px;
    }
  }
}
</style>