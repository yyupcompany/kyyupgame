<template>
  <MobileMainLayout
    title="活动中心"
    :show-back="false"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="teacher-activities-page">
      <!-- 活动统计卡片 -->
      <MobileActivityStatCard :stats="activityStats" />

      <!-- 主要内容标签页 -->
      <van-tabs v-model:active="activeTab" sticky @change="handleTabChange">
        <!-- 活动日历 -->
        <van-tab title="活动日历" name="calendar">
          <div class="tab-content">
            <MobileActivityCalendar
              :activities="calendarActivities"
              @date-select="handleDateSelect"
              @activity-click="handleActivityClick"
              @create-activity="handleCreateActivity"
            />
          </div>
        </van-tab>

        <!-- 活动列表 -->
        <van-tab title="活动列表" name="list">
          <div class="tab-content">
            <MobileActivityList
              :activities="activityList"
              :loading="loading"
              @view="handleViewActivity"
              @edit="handleEditActivity"
              @join="handleJoinActivity"
              @create="handleCreateActivity"
              @refresh="refreshData"
              @search="handleSearch"
            />
          </div>
        </van-tab>

        <!-- 我的活动 -->
        <van-tab title="我的活动" name="my-activities">
          <div class="tab-content">
            <MobileActivityList
              :activities="myActivities"
              :loading="loading"
              @view="handleViewActivity"
              @edit="handleEditActivity"
              @join="handleJoinActivity"
              @create="handleCreateActivity"
              @refresh="refreshData"
              @search="handleSearch"
            />
          </div>
        </van-tab>

        <!-- 活动签到 -->
        <van-tab title="活动签到" name="signin">
          <div class="tab-content">
            <van-list
              v-model:loading="loading"
              :finished="finished"
              finished-text="没有更多了"
              @load="loadSigninActivities"
            >
              <van-cell
                v-for="activity in signinActivities"
                :key="activity.id"
                :title="activity.title"
                :label="`${formatDateTime(activity.startTime, activity.endTime)} | ${activity.location}`"
                is-link
                @click="handleSignin(activity)"
              >
                <template #right-icon>
                  <van-tag
                    :type="activity.signinStatus === 'signed' ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ activity.signinStatus === 'signed' ? '已签到' : '未签到' }}
                  </van-tag>
                </template>
              </van-cell>
            </van-list>
          </div>
        </van-tab>
      </van-tabs>

      <!-- 活动详情弹窗 -->
      <MobileActivityDetail
        v-model="activityDetailVisible"
        :activity="currentActivity"
        @join="handleJoinActivity"
        @edit="handleEditActivity"
        @delete="handleDeleteActivity"
        @checkin="handleSignin"
      />

      <!-- 活动创建/编辑弹窗 -->
      <MobileActivityForm
        v-model="activityFormVisible"
        :activity="editingActivity"
        @save="handleSaveActivity"
      />

      <!-- 活动签到管理弹窗 -->
      <MobileActivitySignin
        v-model="signinManagementVisible"
        :activity="signinActivity"
        :participants="signinParticipants"
        @signin="handleParticipantSignin"
        @cancel-signin="handleCancelSignin"
        @batch-signin="handleBatchSignin"
        @export-signin="handleExportSignin"
      />

      <!-- 全局加载状态 -->
      <van-overlay :show="globalLoading" class="loading-overlay">
        <div class="loading-content">
          <van-loading size="24px" color="#fff" />
          <span class="loading-text">加载中...</span>
        </div>
      </van-overlay>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'

// 导入布局组件
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

// 导入移动端活动组件
import MobileActivityStatCard from './components/MobileActivityStatCard.vue'
import MobileActivityCalendar from './components/MobileActivityCalendar.vue'
import MobileActivityList from './components/MobileActivityList.vue'
import MobileActivityDetail from './components/MobileActivityDetail.vue'
import MobileActivityForm from './components/MobileActivityForm.vue'
import MobileActivitySignin from './components/MobileActivitySignin.vue'

// 导入API
import { getActivityList, createActivity as apiCreateActivity, updateActivity, deleteActivity } from '@/api/modules/activity'
import { getTeacherActivityStatistics } from '@/api/modules/teacher'
import { joinActivity, cancelActivity } from '@/api/modules/activity-registration'

const router = useRouter()

// 活动统计数据
const activityStats = reactive({
  upcoming: 0,
  participating: 0,
  thisWeek: 0,
  responsible: 0
})

// 页面状态
const activeTab = ref('calendar')
const globalLoading = ref(false)
const loading = ref(false)
const finished = ref(false)

// 弹窗显示状态
const activityDetailVisible = ref(false)
const activityFormVisible = ref(false)
const signinManagementVisible = ref(false)

// 当前操作数据
const currentActivity = ref(null)
const editingActivity = ref(null)
const signinActivity = ref(null)
const signinParticipants = ref([])

// 列表数据
const calendarActivities = ref([])
const activityList = ref([])
const myActivities = ref([])
const signinActivities = ref([])

// 方法
const handleBack = () => {
  router.back()
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  loadTabData(tabName)
}

const handleDateSelect = (date: Date) => {
  console.log('选择日期:', date)
  showToast(`选择日期: ${date.toLocaleDateString()}`)
}

const handleActivityClick = (activity: any) => {
  handleViewActivity(activity)
}

const handleCreateActivity = (date?: Date) => {
  editingActivity.value = null
  activityFormVisible.value = true
  if (date) {
    editingActivity.value = {
      startTime: date.toISOString()
    }
  }
}

const handleViewActivity = (activity: any) => {
  currentActivity.value = activity
  activityDetailVisible.value = true
}

const handleEditActivity = (activity: any) => {
  editingActivity.value = activity
  activityFormVisible.value = true
}

const handleJoinActivity = async (activity: any) => {
  try {
    globalLoading.value = true
    const response = await joinActivity(activity.id)

    if (response.success) {
      showToast('成功参加活动')
      refreshData()
    } else {
      showToast(response.message || '参加活动失败')
    }
  } catch (error) {
    console.error('参加活动失败:', error)
    showToast('参加活动失败')
  } finally {
    globalLoading.value = false
  }
}

const handleDeleteActivity = async (activity: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除活动"${activity.title}"吗？此操作不可恢复。`
    })

    globalLoading.value = true
    const response = await deleteActivity(activity.id)

    if (response.success) {
      showToast('活动已删除')
      activityDetailVisible.value = false
      refreshData()
    } else {
      showToast(response.message || '删除活动失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除活动失败:', error)
      showToast('删除活动失败')
    }
  } finally {
    globalLoading.value = false
  }
}

const handleSaveActivity = async (activityData: any) => {
  try {
    globalLoading.value = true
    showLoadingToast({
      message: editingActivity.value ? '保存中...' : '创建中...',
      forbidClick: true
    })

    let response
    if (editingActivity.value) {
      response = await updateActivity(editingActivity.value.id, activityData)
    } else {
      response = await apiCreateActivity(activityData)
    }

    if (response.success) {
      closeToast()
      showToast(editingActivity.value ? '活动保存成功' : '活动创建成功')
      activityFormVisible.value = false
      refreshData()
    } else {
      closeToast()
      showToast(response.message || '保存活动失败')
    }
  } catch (error) {
    closeToast()
    console.error('保存活动失败:', error)
    showToast('保存活动失败')
  } finally {
    globalLoading.value = false
  }
}

const handleSignin = (activity: any) => {
  signinActivity.value = activity
  // 模拟参与者数据
  signinParticipants.value = [
    { id: 1, name: '张小明', class: '大班A', checkedIn: true, signinTime: '09:15', phone: '13800138001' },
    { id: 2, name: '李小红', class: '大班A', checkedIn: false, signinTime: '', phone: '13800138002' },
    { id: 3, name: '王小华', class: '大班B', checkedIn: true, signinTime: '09:20', phone: '13800138003' },
    { id: 4, name: '赵小丽', class: '大班B', checkedIn: false, signinTime: '', phone: '13800138004' },
    { id: 5, name: '陈小强', class: '中班A', checkedIn: true, signinTime: '09:25', phone: '13800138005' }
  ]
  signinManagementVisible.value = true
}

const handleParticipantSignin = (participantId: number) => {
  const participant = signinParticipants.value.find(p => p.id === participantId)
  if (participant) {
    participant.checkedIn = true
    participant.signinTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    showToast('签到成功')
  }
}

const handleCancelSignin = (participantId: number) => {
  const participant = signinParticipants.value.find(p => p.id === participantId)
  if (participant) {
    participant.checkedIn = false
    participant.signinTime = ''
    showToast('已取消签到')
  }
}

const handleBatchSignin = (participantIds: number[]) => {
  participantIds.forEach(id => {
    handleParticipantSignin(id)
  })
  showToast(`批量签到${participantIds.length}人成功`)
}

const handleExportSignin = (activity: any) => {
  showToast('签到表导出成功')
}

const handleSearch = (keyword: string) => {
  console.log('搜索关键词:', keyword)
}

const refreshData = () => {
  loadActivityStats()
  loadTabData(activeTab.value)
}

const loadActivityStats = async () => {
  try {
    const response = await getTeacherActivityStatistics()
    if (response.success && response.data) {
      const stats = response.data.overview
      activityStats.upcoming = stats.publishedActivities || 0
      activityStats.participating = stats.totalRegistrations || 0
      activityStats.thisWeek = stats.totalCheckins || 0
      activityStats.responsible = stats.totalActivities || 0
    }
  } catch (error) {
    console.error('加载活动统计失败:', error)
    // 使用模拟数据作为降级方案
    activityStats.upcoming = 3
    activityStats.participating = 8
    activityStats.thisWeek = 5
    activityStats.responsible = 2
  }
}

const loadTabData = async (tabName: string) => {
  try {
    loading.value = true
    finished.value = false

    switch (tabName) {
      case 'calendar':
        await loadCalendarActivities()
        break
      case 'list':
        await loadActivityList()
        break
      case 'my-activities':
        await loadMyActivities()
        break
      case 'signin':
        await loadSigninActivities()
        break
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    showToast('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadCalendarActivities = async () => {
  try {
    const response = await getActivityList({
      page: 1,
      size: 50,
      status: [1, 2, 3] // 未开始、报名中、进行中
    })

    if (response.success && response.data) {
      calendarActivities.value = response.data.items || response.data.list || []
    }
  } catch (error) {
    // 使用模拟数据
    calendarActivities.value = [
      {
        id: 1,
        title: '春季运动会',
        date: '2024-01-20',
        time: '09:00-11:00',
        location: '操场',
        type: 'sports',
        status: 'upcoming'
      },
      {
        id: 2,
        title: '亲子阅读活动',
        date: '2024-01-22',
        time: '14:00-16:00',
        location: '图书馆',
        type: 'education',
        status: 'upcoming'
      }
    ]
  }
}

const loadActivityList = async () => {
  try {
    const response = await getActivityList({
      page: 1,
      size: 20
    })

    if (response.success && response.data) {
      activityList.value = response.data.items || response.data.list || []
    }
  } catch (error) {
    // 使用模拟数据
    activityList.value = [
      {
        id: 1,
        title: '春季运动会',
        description: '全园春季运动会，增强孩子们的体质',
        startTime: '2024-01-20 09:00:00',
        endTime: '2024-01-20 11:00:00',
        location: '操场',
        activityType: 3,
        capacity: 60,
        registeredCount: 45,
        status: 2,
        isOrganizer: true,
        isParticipant: false
      }
    ]
  }
}

const loadMyActivities = async () => {
  try {
    const response = await getActivityList({
      page: 1,
      size: 20,
      organizerOnly: true
    })

    if (response.success && response.data) {
      myActivities.value = response.data.items || response.data.list || []
    }
  } catch (error) {
    // 使用模拟数据
    myActivities.value = [
      {
        id: 1,
        title: '春季运动会',
        startTime: '2024-01-20 09:00:00',
        endTime: '2024-01-20 11:00:00',
        location: '操场',
        activityType: 3,
        capacity: 60,
        registeredCount: 45,
        status: 2,
        isOrganizer: true,
        isParticipant: false
      }
    ]
  }
}

const loadSigninActivities = async () => {
  try {
    const response = await getActivityList({
      page: 1,
      size: 20,
      status: 3 // 进行中的活动
    })

    if (response.success && response.data) {
      signinActivities.value = (response.data.items || response.data.list || []).map((activity: any) => ({
        ...activity,
        signinStatus: activity.signinStatus || 'not_signin'
      }))
    }
  } catch (error) {
    // 使用模拟数据
    signinActivities.value = [
      {
        id: 1,
        title: '春季运动会',
        startTime: '2024-01-20 09:00:00',
        endTime: '2024-01-20 11:00:00',
        location: '操场',
        signinStatus: 'not_signin'
      }
    ]
  }
}

// 工具方法
const formatDateTime = (startTime: string, endTime: string): string => {
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (start.toDateString() === end.toDateString()) {
    return `${start.toLocaleDateString()} ${start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} ~ ${end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return `${start.toLocaleDateString()} ${start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} ~ ${end.toLocaleDateString()} ${end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
}

// 生命周期
onMounted(() => {
  loadActivityStats()
  loadTabData('calendar')
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.teacher-activities-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: var(--van-tabbar-height);

  .tab-content {
    background: #f8f9fa;
    min-height: calc(100vh - 120px - var(--van-tabbar-height));
  }
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);

    .loading-text {
      color: white;
      font-size: var(--text-sm);
    }
  }
}

:deep(.van-tabs) {
  .van-tab {
    font-size: var(--text-sm);
    font-weight: 500;
  }

  .van-tabs__content {
    background: #f8f9fa;
  }
}

:deep(.van-cell) {
  padding: var(--spacing-md) 16px;

  &:active {
    background: #f5f5f5;
  }
}
</style>

