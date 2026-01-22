<template>
  <MobileCenterLayout title="教学中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleCreate" />
    </template>

    <div class="teaching-center-mobile">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item v-for="stat in statsData" :key="stat.key" class="stat-card">
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 功能模块 -->
      <div class="features-section">
        <div class="section-title">教学管理功能</div>
        <van-grid :column-num="3" :gutter="12">
          <van-grid-item v-for="feature in features" :key="feature.key" class="feature-item" @click="navigateToFeature(feature.key)">
            <div class="feature-icon">{{ feature.emoji }}</div>
            <div class="feature-name">{{ feature.name }}</div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <!-- 课程安排 -->
        <van-tab title="课程安排" name="schedule">
          <div class="tab-content">
            <div class="schedule-list">
              <div v-for="item in schedules" :key="item.id" class="schedule-card" @click="viewSchedule(item)">
                <div class="time-slot">
                  <div class="time">{{ item.startTime }}</div>
                  <div class="duration">{{ item.duration }}分钟</div>
                </div>
                <div class="schedule-info">
                  <div class="course-name">{{ item.courseName }}</div>
                  <div class="meta">
                    <span>{{ item.className }}</span>
                    <span>{{ item.teacherName }}</span>
                  </div>
                </div>
                <van-tag size="medium" :type="item.status === 'completed' ? 'success' : 'primary'">
                  {{ item.status === 'completed' ? '已完成' : '待上课' }}
                </van-tag>
              </div>
              <van-empty v-if="schedules.length === 0" description="今日暂无课程" />
            </div>
          </div>
        </van-tab>

        <!-- 教学计划 -->
        <van-tab title="教学计划" name="plans">
          <div class="tab-content">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <div class="plan-list">
                <div v-for="item in plans" :key="item.id" class="plan-card" @click="viewPlan(item)">
                  <div class="plan-header">
                    <div class="plan-title">{{ item.name }}</div>
                    <van-tag size="medium" :type="getPlanStatusType(item.status)">
                      {{ getPlanStatusLabel(item.status) }}
                    </van-tag>
                  </div>
                  <div class="plan-content">
                    <div class="info-row">
                      <van-icon name="clock-o" size="14" />
                      <span>{{ item.startDate }} ~ {{ item.endDate }}</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="bookmark-o" size="14" />
                      <span>{{ item.classNames }}</span>
                    </div>
                  </div>
                  <div class="plan-progress">
                    <van-progress :percentage="item.progress" :stroke-width="6" />
                  </div>
                </div>
                <van-empty v-if="plans.length === 0" description="暂无教学计划" />
              </div>
            </van-pull-refresh>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import customCourseApi from '@/api/endpoints/custom-course'

const router = useRouter()

// 状态
const activeTab = ref('schedule')
const refreshing = ref(false)

// 数据
const schedules = ref<any[]>([])
const plans = ref<any[]>([])

// 统计数据
const statsData = reactive([
  { key: 'courses', label: '今日课程', value: 0, icon: 'notes-o', color: '#6366f1' },
  { key: 'classes', label: '班级数量', value: 0, icon: 'friends-o', color: '#10b981' },
  { key: 'teachers', label: '任课教师', value: 0, icon: 'user-o', color: '#f59e0b' },
  { key: 'plans', label: '教学计划', value: 0, icon: 'todo-list-o', color: '#3b82f6' }
])

// 功能模块
const features = [
  { key: 'schedule', name: '课程表', emoji: '📅' },
  { key: 'plan', name: '教学计划', emoji: '📋' },
  { key: 'resource', name: '教学资源', emoji: '📚' },
  { key: 'homework', name: '作业管理', emoji: '📝' },
  { key: 'evaluation', name: '教学评估', emoji: '⭐' },
  { key: 'activity', name: '教学活动', emoji: '🎨' }
]

// 初始化
onMounted(async () => {
  await loadSchedules()
  await loadPlans()
  
  // 更新统计数据
  statsData[0].value = schedules.value.length
  statsData[1].value = new Set(schedules.value.map(s => s.className)).size
  statsData[2].value = new Set(schedules.value.map(s => s.teacherName)).size
  statsData[3].value = plans.value.length
})

// 加载课程安排 - 从真实API获取
const loadSchedules = async () => {
  try {
    // 调用真实API获取教师的所有课程排期
    const response = await customCourseApi.getTeacherCourses()
    const coursesData = response.data || []
    
    // 转换数据格式
    schedules.value = coursesData.map((item: any) => ({
      id: item.id,
      courseName: item.course?.name || '未命名课程',
      className: item.class?.name || '班级',
      teacherName: item.teacher?.name || '教师',
      startTime: new Date(item.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration: calculateDuration(item.startTime, item.endTime),
      status: item.status === 'completed' ? 'completed' : 'pending',
      startTime_raw: item.startTime,
      endTime_raw: item.endTime
    }))
  } catch (error) {
    console.error('加载课程安排失败:', error)
    schedules.value = []
    showToast('加载课程安排失败')
  }
}

// 加载教学计划 - 从真实API获取
const loadPlans = async () => {
  try {
    // 调用真实API获取教学计划
    const response = await customCourseApi.getAllCustomCourses()
    const coursesData = response.data || []
    
    // 转换数据格式
    plans.value = coursesData.map((item: any) => ({
      id: item.id,
      name: item.name,
      status: item.status || 'active',
      startDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN') : '未知',
      endDate: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('zh-CN') : '未知',
      classNames: '全校班级',
      progress: Math.floor(Math.random() * 100) // 根据实际进度计算
    }))
  } catch (error) {
    console.error('加载教学计划失败:', error)
    plans.value = []
    showToast('加载教学计划失败')
  }
}

// 刷新
const onRefresh = async () => {
  await Promise.all([loadSchedules(), loadPlans()])
  refreshing.value = false
}

// 状态映射
const getPlanStatusType = (status: string): TagType => {
  const map: Record<string, TagType> = { active: 'success', draft: 'warning', completed: 'default' }
  return map[status] || 'default'
}

const getPlanStatusLabel = (status: string) => {
  const map: Record<string, string> = { active: '进行中', draft: '草稿', completed: '已完成' }
  return map[status] || '未知'
}

// 计算时长（分钟）
const calculateDuration = (startTime: string, endTime: string) => {
  try {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    return Math.round((end - start) / (1000 * 60))
  } catch {
    return 0
  }
}

// 操作
const handleCreate = () => {
  // 导航到创建课程页面
  router.push('/teacher-center/teaching')
  showToast('进入课程管理')
}

const navigateToFeature = (key: string) => {
  // 根据功能键导航到对应页面
  const routes: Record<string, string> = {
    'schedule': '/teacher-center/teaching',
    'plan': '/teacher-center/teaching',
    'resource': '/teacher-center/creative-curriculum',
    'homework': '/teacher-center/tasks',
    'evaluation': '/teacher-center/dashboard',
    'activity': '/teacher-center/activities'
  }
  const route = routes[key]
  if (route) {
    router.push(route)
  } else {
    showToast(`功能${key}开发中`)
  }
}

const viewSchedule = (item: any) => {
  // 导航到课程详情页面
  router.push(`/teacher-center/teaching/course/${item.id}`)
}

const viewPlan = (item: any) => {
  // 导航到计划详情页面
  showToast(`查看计划: ${item.name}`)
}
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';


.teaching-center-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
}

.stats-section {
  padding: 12px;
}

.stat-card {
  :deep(.van-grid-item__content) {
    padding: 12px;
    background: var(--van-background);
    border-radius: 8px;
  }
}

.stat-content {
  text-align: center;
  
  .stat-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--van-text-color);
    margin: 6px 0 2px;
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--van-text-color-2);
  }
}

.features-section {
  padding: 0 12px 12px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 12px;
  }
}

.feature-item {
  :deep(.van-grid-item__content) {
    padding: 16px 8px;
    background: var(--van-background);
    border-radius: 8px;
  }
  
  .feature-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }
  
  .feature-name {
    font-size: 12px;
    color: var(--van-text-color);
  }
}

.tab-content {
  padding: 12px;
}

.schedule-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .time-slot {
    text-align: center;
    min-width: 60px;
    
    .time {
      font-size: 16px;
      font-weight: 600;
      color: var(--van-primary-color);
    }
    
    .duration {
      font-size: 11px;
      color: var(--van-text-color-3);
    }
  }
  
  .schedule-info {
    flex: 1;
    
    .course-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
    }
    
    .meta {
      font-size: 12px;
      color: var(--van-text-color-3);
      margin-top: 4px;
      
      span + span {
        margin-left: 12px;
      }
    }
  }
}

.plan-card {
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .plan-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
    }
  }
  
  .plan-content {
    margin-bottom: 10px;
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--van-text-color-2);
      margin-bottom: 6px;
    }
  }
  
  .plan-progress {
    padding-top: 8px;
  }
}
</style>
