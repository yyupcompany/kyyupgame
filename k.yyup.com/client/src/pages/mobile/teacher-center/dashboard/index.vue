<template>
  <MobileMainLayout
    title="教师工作台"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <!-- 工作概览 -->
    <div class="overview-section">
      <div class="overview-card">
        <div class="overview-item">
          <div class="overview-value">{{ dashboardStats.classes }}</div>
          <div class="overview-label">管理班级</div>
        </div>
        <div class="overview-item">
          <div class="overview-value">{{ dashboardStats.students }}</div>
          <div class="overview-label">管理学生</div>
        </div>
        <div class="overview-item">
          <div class="overview-value">{{ dashboardStats.activities }}</div>
          <div class="overview-label">组织活动</div>
        </div>
      </div>
    </div>

    <!-- 本周课程 -->
    <div class="section">
      <div class="section-title">
        <span>本周课程</span>
        <van-button type="primary" size="mini" @click="viewFullSchedule">
          查看全部
        </van-button>
      </div>

      <div class="schedule-timeline">
        <div
          v-for="(item, index) in weeklySchedule"
          :key="index"
          class="schedule-item"
          @click="viewScheduleDetail(item)"
        >
          <div class="schedule-time">{{ item.time }}</div>
          <div class="schedule-content">
            <div class="schedule-class">{{ item.class }}</div>
            <div class="schedule-subject">{{ item.subject }}</div>
          </div>
          <van-icon name="arrow" />
        </div>
      </div>
    </div>

    <!-- 待办事项 -->
    <div class="section">
      <div class="section-title">
        <span>待办事项</span>
        <van-button type="primary" size="mini" @click="viewAllTasks">
          查看全部
        </van-button>
      </div>

      <MobileList
        :items="todoItems"
        :loading="loading"
        clickable
        @item-click="handleTodoClick"
        @refresh="handleRefresh"
      >
        <template #item="{ item }">
          <van-cell-group inset>
            <van-cell :title="item.title" :label="item.dueDate">
              <template #icon>
                <van-icon
                  :name="getPriorityIcon(item.priority)"
                  size="20"
                  :color="getPriorityColor(item.priority)"
                />
              </template>
              <template #value>
                <van-tag :type="getStatusType(item.status)">
                  {{ item.status }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </template>
      </MobileList>
    </div>

    <!-- 快速操作 -->
    <div class="section">
      <div class="section-title">
        <span>快速操作</span>
      </div>

      <div class="quick-action-grid">
        <div
          v-for="action in quickActions"
          :key="action.key"
          class="quick-action-item"
          @click="handleQuickAction(action)"
        >
          <van-icon :name="action.icon" size="32" :color="action.color" />
          <span class="action-title">{{ action.title }}</span>
        </div>
      </div>
    </div>

    <!-- 悬浮操作按钮 -->
    <van-back-top right="20" bottom="80" />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MobilePage from '../../components/common/MobilePage.vue'
import MobileList from '../../components/common/MobileList.vue'
import { showToast } from 'vant'

interface TodoItem {
  id: string
  title: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: string
}

interface ScheduleItem {
  time: string
  class: string
  subject: string
}

const router = useRouter()

const loading = ref(false)

const dashboardStats = ref({
  classes: 3,
  students: 45,
  activities: 8
})

const weeklySchedule = ref<ScheduleItem[]>([
  { time: '09:00-09:45', class: '大班A', subject: '数学' },
  { time: '10:00-10:45', class: '中班B', subject: '美术' },
  { time: '14:00-14:45', class: '小班C', subject: '音乐' }
])

const todoItems = ref<TodoItem[]>([
  {
    id: '1',
    title: '准备明天数学课教案',
    dueDate: '2025-01-23',
    priority: 'high',
    status: '进行中'
  },
  {
    id: '2',
    title: '学生考勤记录',
    dueDate: '2025-01-22',
    priority: 'medium',
    status: '待完成'
  }
])

const quickActions = ref([
  { key: 'attendance', title: '考勤打卡', icon: 'clock-o', color: '#409eff', path: '/mobile/teacher-center/attendance' },
  { key: 'grade', title: '成绩录入', icon: 'edit', color: '#07c160', path: '/mobile/teacher-center/grade' },
  { key: 'notice', title: '发布通知', icon: 'bell-o', color: '#ff976a', path: '/mobile/teacher-center/notice' },
  { key: 'material', title: '教学资料', icon: 'folder-o', color: '#6c5ce7', path: '/mobile/teacher-center/material' }
])

const getPriorityIcon = (priority: string) => {
  const icons: Record<string, string> = {
    'high': 'warning-o',
    'medium': 'info-o',
    'low': 'circle'
  }
  return icons[priority] || 'circle'
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    'high': '#ee0a24',
    'medium': '#ff976a',
    'low': '#969799'
  }
  return colors[priority] || '#969799'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    '进行中': 'primary',
    '待完成': 'warning',
    '已完成': 'success'
  }
  return types[status] || 'default'
}

const viewFullSchedule = () => {
  router.push('/mobile/teacher-center/schedule')
}

const viewScheduleDetail = (item: ScheduleItem) => {
  showToast(`查看课程: ${item.class} - ${item.subject}`)
}

const viewAllTasks = () => {
  router.push('/mobile/teacher-center/tasks')
}

const handleTodoClick = (todo: TodoItem) => {
  router.push(`/mobile/teacher-center/todo-detail?id=${todo.id}`)
}

const handleQuickAction = (action: any) => {
  if (action.path) {
    router.push(action.path)
  } else {
    showToast(`功能: ${action.title}`)
  }
}

const handleRefresh = () => {
  loadDashboardData()
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 加载仪表板数据
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.overview-section {
  background: var(--primary-gradient);
  color: #fff;
  padding: var(--spacing-lg) 12px;

  .overview-card {
    display: flex;
    justify-content: space-around;

    .overview-item {
      text-align: center;

      .overview-value {
        font-size: var(--text-3xl);
        font-weight: bold;
        margin-bottom: 8px;
      }

      .overview-label {
        font-size: var(--text-sm);
        opacity: 0.9;
      }
    }
  }
}

.section {
  background-color: var(--bg-color);
  margin-bottom: 12px;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    font-size: var(--text-base);
    font-weight: bold;
    color: var(--text-primary);
    border-bottom: 1px solid #ebedf0;
  }
}

.schedule-timeline {
  padding: var(--spacing-md);

  .schedule-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    background-color: var(--app-bg-color);
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.3s;

    &:active {
      background-color: #ebedf0;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .schedule-time {
      width: 100px;
      font-size: var(--text-sm);
      color: var(--primary-color);
      font-weight: bold;
    }

    .schedule-content {
      flex: 1;
      margin-left: 12px;

      .schedule-class {
        font-size: var(--text-base);
        color: var(--text-primary);
        font-weight: bold;
        margin-bottom: 4px;
      }

      .schedule-subject {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
  }
}

.quick-action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-md);

  .quick-action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-lg) 12px;
    background-color: var(--app-bg-color);
    border-radius: 8px;
    transition: all 0.3s;

    &:active {
      background-color: #ebedf0;
      transform: scale(0.95);
    }

    .action-title {
      font-size: var(--text-sm);
      color: var(--text-primary);
      margin-top: 8px;
    }
  }
}
</style>
