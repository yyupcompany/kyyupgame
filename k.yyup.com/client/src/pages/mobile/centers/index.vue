<!--
  移动端中心目录页面
  Mobile Centers Page
  
  四个角色共享统一布局，底部导航根据角色动态配置
-->
<template>
  <UnifiedMobileLayout
    :title="pageTitle"
    :show-back="false"
    :tabs="roleTabs"
    :active-tab="activeTab"
    :notification-count="notificationCount"
    @tab-change="handleTabChange"
  >
    <!-- 主内容区 -->
    <div class="centers-content" :class="themeClass">
      <!-- 欢迎区域 -->
      <div class="welcome-section" :style="{ background: isDark ? '#1e293b' : '#ffffff' }">
        <div class="welcome-left">
          <div class="greeting" :style="{ color: isDark ? '#f1f5f9' : '#2c3e50' }">
            {{ greeting }}，{{ userName }}
          </div>
          <div class="role-badge" :style="{ background: roleColor + '20', color: roleColor }">
            {{ roleName }}
          </div>
        </div>
        <div class="welcome-right">
          <div class="date-info" :style="{ color: isDark ? '#94a3b8' : '#8492a6' }">
            {{ currentDate }}
          </div>
        </div>
      </div>

      <!-- 快捷统计 -->
      <div class="stats-row">
        <div
          v-for="stat in quickStats"
          :key="stat.key"
          class="stat-card"
          :style="{
            background: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e4e7ed'
          }"
        >
          <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
          <div class="stat-label" :style="{ color: isDark ? '#94a3b8' : '#8492a6' }">{{ stat.label }}</div>
        </div>
      </div>

      <!-- 功能入口 -->
      <div class="section">
        <div class="section-title" :style="{ color: isDark ? '#f1f5f9' : '#2c3e50' }">
          常用功能
        </div>
        <van-grid :column-num="4" :border="false" class="feature-grid">
          <van-grid-item
            v-for="feature in quickFeatures"
            :key="feature.key"
            :icon="feature.icon"
            :text="feature.text"
            :badge="feature.badge"
            @click="handleFeatureClick(feature)"
          />
        </van-grid>
      </div>

      <!-- 今日待办 -->
      <div class="section">
        <div class="section-header">
          <div class="section-title" :style="{ color: isDark ? '#f1f5f9' : '#2c3e50' }">
            今日待办
          </div>
          <span class="view-all" @click="viewAllTasks">查看全部</span>
        </div>
        <div class="todo-list">
          <div
            v-for="todo in todayTodos"
            :key="todo.id"
            class="todo-item"
            :style="{
              background: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e4e7ed'
            }"
          >
            <div class="todo-status" :style="{ background: todo.color }"></div>
            <div class="todo-content">
              <div class="todo-title" :style="{ color: isDark ? '#f1f5f9' : '#2c3e50' }">
                {{ todo.title }}
              </div>
              <div class="todo-time" :style="{ color: isDark ? '#64748b' : '#a8abb2' }">
                {{ todo.time }}
              </div>
            </div>
            <van-icon name="arrow" size="16" :color="isDark ? '#64748b' : '#c0c4cc'" />
          </div>
        </div>
      </div>

      <!-- 底部安全区 -->
      <div class="safe-area"></div>
    </div>
  </UnifiedMobileLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import { request } from '@/utils/request'
import UnifiedMobileLayout from '@/components/mobile/layouts/UnifiedMobileLayout.vue'

const router = useRouter()
const userStore = useUserStore()

console.log('📱 [Mobile Centers] 当前用户角色:', userStore.user?.role)

// 主题状态
const isDark = ref(false)
const themeClass = computed(() => isDark.value ? 'theme-dark' : 'theme-light')

const detectTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  isDark.value = htmlTheme === 'dark'
}

// 用户信息
const userName = computed(() => userStore.user?.realName || userStore.user?.username || '用户')
const userRole = computed(() => userStore.user?.role || 'parent')
const roleName = computed(() => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    principal: '园长',
    teacher: '教师',
    parent: '家长'
  }
  return roleMap[userRole.value] || '用户'
})
const roleColor = computed(() => {
  const colorMap: Record<string, string> = {
    admin: '#6366F1',
    principal: '#3B82F6',
    teacher: '#52c41a',
    parent: '#F59E0B'
  }
  return colorMap[userRole.value] || '#3B82F6'
})

// 页面标题
const pageTitle = computed(() => '智慧园所')

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`
})

// 通知数量
const notificationCount = ref(0)

// 统计数据（从API获取）
const statsData = ref({
  students: 0,
  attendance: 0,
  attendanceRate: '0%',
  tasks: 0,
  children: 0,
  notices: 0,
  teachers: 0
})

// 快捷统计（使用动态数据）
const quickStats = computed(() => {
  if (userRole.value === 'teacher') {
    return [
      { key: 'students', label: '我的学生', value: String(statsData.value.students), color: '#3B82F6' },
      { key: 'attendance', label: '今日出勤', value: String(statsData.value.attendance), color: '#52c41a' },
      { key: 'tasks', label: '待办任务', value: String(statsData.value.tasks), color: '#F59E0B' }
    ]
  }
  if (userRole.value === 'parent') {
    return [
      { key: 'child', label: '我的孩子', value: String(statsData.value.children), color: '#3B82F6' },
      { key: 'notices', label: '未读通知', value: String(statsData.value.notices), color: '#F59E0B' },
      { key: 'homework', label: '作业提交', value: '0', color: '#52c41a' }
    ]
  }
  // 管理员/园长
  return [
    { key: 'students', label: '学生总数', value: String(statsData.value.students), color: '#3B82F6' },
    { key: 'teachers', label: '教师人数', value: String(statsData.value.teachers), color: '#52c41a' },
    { key: 'attendance', label: '今日出勤', value: statsData.value.attendanceRate, color: '#F59E0B' },
    { key: 'tasks', label: '待办事项', value: String(statsData.value.tasks), color: 'var(--danger-color)' }
  ]
})

// 快捷功能
const quickFeatures = computed(() => {
  const baseFeatures = [
    { key: 'attendance', icon: 'clock-o', text: '考勤', route: '/mobile/centers/attendance-center' },
    { key: 'notice', icon: 'bullhorn-o', text: '通知', badge: '3', route: '/mobile/centers/notification-center' },
    { key: 'schedule', icon: 'calendar-o', text: '日程', route: '/mobile/centers/schedule-center' },
    { key: 'ai', icon: 'chat-o', text: 'AI助手', route: '/mobile/centers/ai-center' }
  ]
  
  if (userRole.value === 'parent') {
    return [
      ...baseFeatures,
      { key: 'homework', icon: 'todo-list-o', text: '作业', route: '/mobile/parent-center/children' },
      { key: 'growth', icon: 'chart-trending-o', text: '成长', route: '/mobile/parent-center/child-growth' },
      { key: 'payment', icon: 'balance-o', text: '缴费', route: '/mobile/centers/finance-center' },
      { key: 'more', icon: 'apps-o', text: '更多', route: '/mobile/more' }
    ]
  }
  
  return [
    ...baseFeatures,
    { key: 'students', icon: 'friends-o', text: '学生', route: '/mobile/centers/student-center' },
    { key: 'class', icon: 'home-o', text: '班级', route: '/mobile/centers/teaching-center' },
    { key: 'report', icon: 'bar-chart-o', text: '报表', route: '/mobile/centers/analytics-center' },
    { key: 'more', icon: 'apps-o', text: '更多', route: '/mobile/more' }
  ]
})

// 今日待办（从API获取）
const todayTodos = ref<Array<{ id: number; title: string; time: string; color: string }>>([])

// 加载统计数据
const loadStatsData = async () => {
  try {
    const role = userRole.value
    
    if (role === 'teacher') {
      // 教师统计
      const response = await request.get('/api/teacher-dashboard/dashboard')
      if (response.success && response.data) {
        const stats = response.data.stats || response.data
        statsData.value.students = stats.classes?.studentsCount || stats.students || 0
        statsData.value.attendance = stats.classes?.studentsCount || stats.todayAttendance || 0  // 今日出勤暂用学生数
        statsData.value.tasks = stats.tasks?.pending || stats.tasks?.total || 0
      }
    } else if (role === 'parent') {
      // 家长统计
      const parentId = userStore.userInfo?.id
      if (parentId) {
        const childrenResponse = await request.get('/api/students', { params: { parentId, pageSize: 100 } })
        if (childrenResponse.success && childrenResponse.data) {
          const data = childrenResponse.data
          statsData.value.children = Array.isArray(data) ? data.length : (data.rows?.length || data.items?.length || 0)
        }
      }
      // 未读通知
      const noticeResponse = await request.get('/api/notifications', { params: { unreadOnly: true, pageSize: 100 } })
      if (noticeResponse.success && noticeResponse.data) {
        const data = noticeResponse.data
        statsData.value.notices = Array.isArray(data) ? data.filter((n: any) => !n.isRead).length : (data.total || 0)
      }
    } else {
      // 管理员/园长统计
      const dashboardResponse = await request.get('/api/dashboard/stats')
      if (dashboardResponse.success && dashboardResponse.data) {
        const data = dashboardResponse.data
        statsData.value.students = data.studentCount || data.totalStudents || 0
        statsData.value.teachers = data.teacherCount || data.totalTeachers || 0
        // 计算出勤率：今日出勤人数 / 总人数
        const attendanceRate = data.attendanceRate || 0
        statsData.value.attendanceRate = `${Math.round(attendanceRate)}%`
        statsData.value.tasks = data.pendingTasks || 0
        console.log('📊 管理员仪表板统计:', { students: statsData.value.students, teachers: statsData.value.teachers, rate: statsData.value.attendanceRate })
      }
    }
    
    // 加载通知数量
    const notifyResponse = await request.get('/api/notifications', { params: { unreadOnly: true, pageSize: 1 } })
    if (notifyResponse.success && notifyResponse.data) {
      notificationCount.value = notifyResponse.data.total || notifyResponse.data.length || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载今日待办
const loadTodayTodos = async () => {
  try {
    const colors = ['#3B82F6', '#52c41a', '#F59E0B', '#EF4444']
    const response = await request.get('/api/todos', {
      params: {
        status: 'pending',
        pageSize: 5,
        dueDate: new Date().toISOString().split('T')[0]
      }
    })
    
    if (response.success && response.data) {
      const todos = Array.isArray(response.data) ? response.data : (response.data.rows || response.data.items || [])
      todayTodos.value = todos.slice(0, 5).map((todo: any, index: number) => ({
        id: todo.id,
        title: todo.title || todo.name,
        time: todo.dueTime || formatTime(todo.dueDate),
        color: colors[index % colors.length]
      }))
    }
  } catch (error) {
    console.error('加载今日待办失败:', error)
  }
}

// 格式化时间
const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return '待定'
  try {
    const date = new Date(dateStr)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch {
    return '待定'
  }
}

// 底部导航配置（根据角色）
const roleTabs = computed(() => {
  const baseTabs = [
    { name: 'home', label: '首页', icon: 'wap-home-o' }
  ]

  if (userRole.value === 'admin' || userRole.value === 'principal') {
    return [
      ...baseTabs,
      {
        name: 'management',
        label: '管理',
        icon: 'setting-o',
        badge: '',
        centers: [
          { name: '人员管理', desc: '教师、学生、家长管理', icon: 'friends-o', route: '/mobile/centers/user-center', color: '#3B82F6' },
          { name: '班级管理', desc: '班级信息、排课管理', icon: 'home-o', route: '/mobile/centers/teaching-center', color: '#52c41a' },
          { name: '系统设置', desc: '参数配置、权限管理', icon: 'setting-o', route: '/mobile/centers/system-center', color: '#6366F1' }
        ]
      },
      {
        name: 'business',
        label: '业务',
        icon: 'orders-o',
        badge: '12',
        centers: [
          { name: '招生中心', desc: '招生计划、咨询管理', icon: 'user-o', route: '/mobile/centers/enrollment-center', color: '#3B82F6' },
          { name: '活动中心', desc: '活动策划、报名管理', icon: 'calendar-o', route: '/mobile/centers/activity-center', color: '#F59E0B' },
          { name: '财务中心', desc: '收费、账单管理', icon: 'balance-o', route: '/mobile/centers/finance-center', color: '#52c41a' }
        ]
      },
      {
        name: 'teaching',
        label: '教学',
        icon: 'notes-o',
        centers: [
          { name: '教学中心', desc: '课程、教案管理', icon: 'records-o', route: '/mobile/centers/teaching-center', color: '#3B82F6' },
          { name: '考勤中心', desc: '学生、教师考勤', icon: 'clock-o', route: '/mobile/centers/attendance-center', color: '#52c41a' },
          { name: '评估中心', desc: '学生评估、成长记录', icon: 'chart-trending-o', route: '/mobile/centers/assessment-center', color: '#F59E0B' }
        ]
      },
      { name: 'profile', label: '我的', icon: 'user-o' }
    ]
  }

  if (userRole.value === 'teacher') {
    return [
      ...baseTabs,
      {
        name: 'class',
        label: '班级',
        icon: 'friends-o',
        centers: [
          { name: '我的班级', desc: '班级学生管理', icon: 'friends-o', route: '/mobile/centers/student-center', color: '#3B82F6' },
          { name: '考勤打卡', desc: '学生考勤记录', icon: 'clock-o', route: '/mobile/centers/attendance-center', color: '#52c41a' },
          { name: '通知发布', desc: '发布班级通知', icon: 'bullhorn-o', route: '/mobile/centers/notification-center', color: '#F59E0B' }
        ]
      },
      {
        name: 'teaching',
        label: '教学',
        icon: 'notes-o',
        centers: [
          { name: '教学计划', desc: '课程安排、教案', icon: 'records-o', route: '/mobile/centers/teaching-center', color: '#3B82F6' },
          { name: '学生评估', desc: '日常评价记录', icon: 'chart-trending-o', route: '/mobile/centers/assessment-center', color: '#52c41a' },
          { name: '成长档案', desc: '学生成长记录', icon: 'photo-o', route: '/mobile/centers/photo-album-center', color: '#F59E0B' }
        ]
      },
      { name: 'message', label: '消息', icon: 'chat-o', badge: '5' },
      { name: 'profile', label: '我的', icon: 'user-o' }
    ]
  }

  // 家长
  return [
    ...baseTabs,
    {
      name: 'child',
      label: '孩子',
      icon: 'smile-o',
      centers: [
        { name: '成长记录', desc: '查看孩子在园表现', icon: 'chart-trending-o', route: '/mobile/parent-center/child-growth', color: '#3B82F6' },
        { name: '考勤查询', desc: '出勤记录查询', icon: 'clock-o', route: '/mobile/parent-center/dashboard', color: '#52c41a' },
        { name: '作业查看', desc: '查看作业和评价', icon: 'records-o', route: '/mobile/parent-center/children', color: '#F59E0B' }
      ]
    },
    {
      name: 'service',
      label: '服务',
      icon: 'service-o',
      centers: [
        { name: '缴费中心', desc: '在线缴纳各项费用', icon: 'balance-o', route: '/mobile/centers/finance-center', color: '#3B82F6' },
        { name: '请假申请', desc: '在线提交请假', icon: 'edit', route: '/mobile/parent-center/communication', color: '#52c41a' },
        { name: '活动报名', desc: '查看和报名活动', icon: 'calendar-o', route: '/mobile/parent-center/activities', color: '#F59E0B' }
      ]
    },
    { name: 'message', label: '消息', icon: 'chat-o', badge: '3' },
    { name: 'profile', label: '我的', icon: 'user-o' }
  ]
})

// 当前激活的Tab
const activeTab = ref('home')

// 处理Tab切换
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  if (tab === 'profile') {
    router.push('/mobile/centers/user-center')
  } else if (tab === 'message') {
    router.push('/mobile/centers/notification-center')
  }
}

// 处理功能点击
const handleFeatureClick = (feature: { key: string; route?: string }) => {
  if (feature.route) {
    router.push(feature.route)
  } else {
    showToast('功能开发中...')
  }
}

// 查看全部任务
const viewAllTasks = () => {
  router.push('/mobile/centers/my-task-center')
}

onMounted(() => {
  detectTheme()
  console.log('📱 [Mobile Centers] 页面挂载', { role: userRole.value })
  
  // 加载真实数据
  loadStatsData()
  loadTodayTodos()
  
  // 监听主题变化
  const observer = new MutationObserver(detectTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';
@import '@/styles/design-tokens.scss';

.centers-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// 欢迎区域
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  
  .theme-dark & {
    border-color: #334155;
  }
}

.welcome-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.welcome-right {
  text-align: right;
}

.greeting {
  font-size: 22px;
  font-weight: 600;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.date-info {
  font-size: 13px;
}

// 统计卡片
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
}

.stat-card {
  padding: 16px 12px;
  border-radius: 12px;
  border: 1px solid;
  text-align: center;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Roboto Mono', monospace;
}

.stat-label {
  font-size: 12px;
  margin-top: 4px;
}

// 区块样式
.section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    padding-left: 8px;
    border-left: 3px solid var(--primary-color);
  }

  .view-all {
    font-size: 13px;
    color: var(--primary-color);
    cursor: pointer;
  }
}

// 功能网格
.feature-grid {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;

  .theme-dark & {
    background: #1e293b;
  }

  :deep(.van-grid-item__content) {
    padding: 16px 8px;
    background: transparent;
  }

  :deep(.van-grid-item__icon) {
    color: var(--primary-color);
    font-size: 26px;
  }

  :deep(.van-grid-item__text) {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;

    .theme-dark & {
      color: #94a3b8;
    }
  }
}

.theme-dark .feature-grid {
  background: #1e293b;
}

// 待办列表
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.todo-status {
  width: 4px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.todo-time {
  font-size: 12px;
}

// 安全区
.safe-area {
  height: env(safe-area-inset-bottom, 20px);
}
</style>
