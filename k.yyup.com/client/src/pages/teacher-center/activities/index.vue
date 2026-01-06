<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container teacher-activities">
    <!-- 页面头部 -->
    <div class="activities-header">
      <div class="header-content">
        <div class="page-title">
          <h1>
            <UnifiedIcon name="default" />
            活动中心
          </h1>
          <p>管理和参与园区各类活动</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleCreateActivity">
            <UnifiedIcon name="Plus" />
            创建活动
          </el-button>
          <el-button @click="refreshData">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 活动统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="6">
          <ActivityStatCard
            title="已发布活动"
            :value="activityStats.upcoming"
            icon="Clock"
            color="var(--warning-color)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <ActivityStatCard
            title="总报名人数"
            :value="activityStats.participating"
            icon="User"
            color="var(--primary-color)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <ActivityStatCard
            title="总签到人数"
            :value="activityStats.thisWeek"
            icon="Calendar"
            color="var(--success-color)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <ActivityStatCard
            title="负责活动数"
            :value="activityStats.responsible"
            icon="Trophy"
            color="var(--danger-color)"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-card>
        <template #header>
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="活动日历" name="calendar">
              <template #label>
                <span class="tab-label">
                  <UnifiedIcon name="default" />
                  活动日历
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="活动列表" name="list">
              <template #label>
                <span class="tab-label">
                  <UnifiedIcon name="default" />
                  活动列表
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="我的活动" name="my-activities">
              <template #label>
                <span class="tab-label">
                  <UnifiedIcon name="default" />
                  我的活动
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="活动签到" name="signin">
              <template #label>
                <span class="tab-label">
                  <UnifiedIcon name="Check" />
                  活动签到
                </span>
              </template>
            </el-tab-pane>
          </el-tabs>
        </template>

        <!-- 活动日历 -->
        <div v-if="activeTab === 'calendar'" class="tab-content">
          <ActivityCalendar 
            :activities="calendarActivities"
            @date-select="handleDateSelect"
            @activity-click="handleActivityClick"
          />
        </div>

        <!-- 活动列表 -->
        <div v-if="activeTab === 'list'" class="tab-content">
          <ActivityList 
            :activities="activityList"
            @view-activity="handleViewActivity"
            @join-activity="handleJoinActivity"
            @edit-activity="handleEditActivity"
          />
        </div>

        <!-- 我的活动 -->
        <div v-if="activeTab === 'my-activities'" class="tab-content">
          <MyActivities 
            :activities="myActivities"
            @view-activity="handleViewActivity"
            @manage-activity="handleManageActivity"
            @cancel-activity="handleCancelActivity"
          />
        </div>

        <!-- 活动签到 -->
        <div v-if="activeTab === 'signin'" class="tab-content">
          <ActivitySignin 
            :activities="signinActivities"
            @signin="handleSignin"
            @view-participants="handleViewParticipants"
          />
        </div>
      </el-card>
    </div>

    <!-- 活动详情弹窗 -->
    <ActivityDetail 
      v-model="activityDetailVisible"
      :activity="currentActivity"
      @join="handleJoinActivity"
      @edit="handleEditActivity"
      @delete="handleDeleteActivity"
    />

    <!-- 活动创建/编辑弹窗 -->
    <ActivityForm 
      v-model="activityFormVisible"
      :activity="editingActivity"
      @save="handleSaveActivity"
    />

    <!-- 签到管理弹窗 -->
    <ActivitySignin
      :visible="signinManagementVisible"
      :activity="signinActivity"
      :participants="signinParticipants"
      @close="signinManagementVisible = false"
      @signin="handleParticipantSignin"
      @cancel-signin="handleCancelSignin"
      @batch-signin="handleBatchSignin"
      @export="handleExportSignin"
    />
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getActivityList } from '@/api/modules/activity'
import { getTeacherActivityStatistics } from '@/api/modules/teacher'
import { getCheckinStats } from '@/api/modules/activity-checkin'
import {
  Trophy,
  Plus,
  Refresh,
  Calendar,
  List,
  User,
  Check,
  Clock
} from '@element-plus/icons-vue'

// 导入组件
import ActivityStatCard from './components/ActivityStatCard.vue'
import ActivityCalendar from './components/ActivityCalendar.vue'
import ActivityList from './components/ActivityList.vue'
import MyActivities from './components/MyActivities.vue'
import ActivitySignin from './components/ActivitySignin.vue'
import ActivityDetail from './components/ActivityDetail.vue'
import ActivityForm from './components/ActivityForm.vue'
// SigninManagement 组件已合并到 ActivitySignin 中

// 响应式数据
const activeTab = ref('calendar')
const activityDetailVisible = ref(false)
const activityFormVisible = ref(false)
const signinManagementVisible = ref(false)
const currentActivity = ref(null)
const editingActivity = ref(null)
const signinActivity = ref(null)
const signinParticipants = ref([])

// 活动统计
const activityStats = reactive({
  upcoming: 0,
  participating: 0,
  thisWeek: 0,
  responsible: 0
})

// 数据列表
const calendarActivities = ref([])
const activityList = ref([])
const myActivities = ref([])
const signinActivities = ref([])

// 方法
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  loadTabData(tabName)
}

const handleCreateActivity = () => {
  editingActivity.value = null
  activityFormVisible.value = true
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
    // TODO: 调用API参加活动
    ElMessage.success('成功参加活动')
    loadTabData(activeTab.value)
  } catch (error) {
    ElMessage.error('参加活动失败')
  }
}

const handleDeleteActivity = async (activity: any) => {
  try {
    // TODO: 调用API删除活动
    ElMessage.success('活动已删除')
    activityDetailVisible.value = false
    loadTabData(activeTab.value)
  } catch (error) {
    ElMessage.error('删除活动失败')
  }
}

const handleSaveActivity = async (activityData: any) => {
  try {
    // TODO: 调用API保存活动
    ElMessage.success('活动保存成功')
    activityFormVisible.value = false
    loadTabData(activeTab.value)
  } catch (error) {
    ElMessage.error('保存活动失败')
  }
}

const handleManageActivity = (activity: any) => {
  ElMessage.info('管理活动功能开发中...')
}

const handleCancelActivity = async (activity: any) => {
  try {
    // TODO: 调用API取消参加活动
    ElMessage.success('已取消参加活动')
    loadTabData(activeTab.value)
  } catch (error) {
    ElMessage.error('取消参加活动失败')
  }
}

const handleSignin = (activity: any) => {
  signinActivity.value = activity
  // 加载参与者数据（模拟数据）
  signinParticipants.value = [
    { id: 1, name: '张小明', class: '大班A', signed: true, signinTime: '2024-01-20 09:15:00' },
    { id: 2, name: '李小红', class: '大班A', signed: false, signinTime: '' },
    { id: 3, name: '王小华', class: '大班B', signed: true, signinTime: '2024-01-20 09:20:00' },
    { id: 4, name: '赵小丽', class: '大班B', signed: false, signinTime: '' },
    { id: 5, name: '陈小强', class: '中班A', signed: true, signinTime: '2024-01-20 09:25:00' }
  ]
  signinManagementVisible.value = true
}

const handleSigninSuccess = () => {
  ElMessage.success('签到成功')
  signinManagementVisible.value = false
  loadTabData('signin')
}

// 签到相关方法
const handleParticipantSignin = (participant: any) => {
  // 更新参与者签到状态
  participant.signed = true
  participant.signinTime = new Date().toLocaleString('zh-CN')
  ElMessage.success(`${participant.name} 签到成功`)
}

const handleCancelSignin = (participant: any) => {
  // 取消参与者签到状态
  participant.signed = false
  participant.signinTime = ''
  ElMessage.info(`已取消 ${participant.name} 的签到`)
}

const handleBatchSignin = (participants: any[]) => {
  // 批量签到
  participants.forEach(participant => {
    participant.signed = true
    participant.signinTime = new Date().toLocaleString('zh-CN')
  })
  ElMessage.success(`批量签到 ${participants.length} 人成功`)
}

const handleExportSignin = (activity: any) => {
  // 导出签到表
  ElMessage.success('签到表导出成功')
}

const handleViewParticipants = (activity: any) => {
  ElMessage.info('查看参与者功能开发中...')
}

const handleDateSelect = (date: Date) => {
  ElMessage.info(`选择日期: ${date.toLocaleDateString()}`)
}

const handleActivityClick = (activity: any) => {
  handleViewActivity(activity)
}

const refreshData = () => {
  loadActivityStats()
  loadTabData(activeTab.value)
}

const loadActivityStats = async () => {
  try {
    // 调用教师专用活动统计API
    const response = await getTeacherActivityStatistics()
    if (response.success && response.data) {
      const stats = response.data.overview
      // 映射API返回的数据到本地统计对象
      activityStats.upcoming = stats.publishedActivities || 0  // 已发布的活动
      activityStats.participating = stats.totalRegistrations || 0  // 总报名人数
      activityStats.thisWeek = stats.totalCheckins || 0  // 总签到人数
      activityStats.responsible = stats.totalActivities || 0  // 负责的活动总数
    }
  } catch (error) {
    console.error('加载活动统计失败:', error)
    // 降级到模拟数据
    activityStats.upcoming = 3
    activityStats.participating = 8
    activityStats.thisWeek = 5
    activityStats.responsible = 2
    ElMessage.error('加载统计数据失败，显示模拟数据')
  }
}

const loadTabData = async (tabName: string) => {
  try {
    switch (tabName) {
      case 'calendar':
        // TODO: 加载日历活动数据
        calendarActivities.value = [
          {
            id: 1,
            title: '春季运动会',
            date: '2024-01-20',
            type: 'sports',
            status: 'upcoming'
          },
          {
            id: 2,
            title: '亲子阅读活动',
            date: '2024-01-22',
            type: 'education',
            status: 'upcoming'
          }
        ]
        break
      case 'list':
        // TODO: 加载活动列表数据
        activityList.value = [
          {
            id: 1,
            title: '春季运动会',
            description: '全园春季运动会，增强孩子们的体质',
            date: '2024-01-20',
            time: '09:00-11:00',
            location: '操场',
            type: 'sports',
            status: 'upcoming',
            participants: 45,
            maxParticipants: 60
          }
        ]
        break
      case 'my-activities':
        // TODO: 加载我的活动数据
        myActivities.value = [
          {
            id: 1,
            title: '春季运动会',
            role: 'organizer',
            status: 'upcoming',
            date: '2024-01-20'
          }
        ]
        break
      case 'signin':
        // TODO: 加载签到活动数据
        signinActivities.value = [
          {
            id: 1,
            title: '春季运动会',
            date: '2024-01-20',
            time: '09:00-11:00',
            location: '操场',
            signinStatus: 'not_signin'
          }
        ]
        break
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 生命周期
onMounted(() => {
  loadActivityStats()
  loadTabData('calendar')
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.teacher-activities {
  padding: var(--spacing-lg);
  background-color: var(--bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.activities-header {
  margin-bottom: var(--spacing-xl);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .page-title {
      h1 {
        font-size: var(--text-2xl);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      p {
        color: var(--text-secondary);
        margin: 0;
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-md);
    }
  }
}

.stats-cards {
  margin-bottom: var(--spacing-xl);
}

.main-content {
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;

  .tab-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .tab-content {
    padding-top: var(--spacing-lg);
    width: 100%;
    max-width: 100%;
    flex: 1 1 auto;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .teacher-activities {
    padding: var(--spacing-md);
  }

  .activities-header .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--spacing-md);
    }
  }
}
</style>
