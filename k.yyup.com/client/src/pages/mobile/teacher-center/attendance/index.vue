<template>
  <MobileMainLayout
    title="考勤管理"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-teacher-attendance">
      <!-- Tab标签页 -->
      <van-tabs v-model:active="activeTab" @change="handleTabChange" sticky>
        <!-- 教师打卡 -->
        <van-tab name="teacher-checkin" title="教师打卡">
          <TeacherCheckInTab @refresh="handleRefresh" />
        </van-tab>

        <!-- 学生考勤 -->
        <van-tab name="student-attendance" title="学生考勤">
          <StudentAttendanceTab @refresh="handleRefresh" />
        </van-tab>

        <!-- 统计分析 -->
        <van-tab name="statistics" title="统计分析">
          <AttendanceStatisticsTab @refresh="handleRefresh" />
        </van-tab>

        <!-- 历史记录 -->
        <van-tab name="history" title="历史记录">
          <AttendanceHistoryTab @refresh="handleRefresh" />
        </van-tab>
      </van-tabs>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

// 导入Tab组件
import TeacherCheckInTab from './components/TeacherCheckInTab.vue'
import StudentAttendanceTab from './components/StudentAttendanceTab.vue'
import AttendanceStatisticsTab from './components/AttendanceStatisticsTab.vue'
import AttendanceHistoryTab from './components/AttendanceHistoryTab.vue'

// ==================== 数据定义 ====================

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('teacher-checkin')

// ==================== 方法 ====================

// 返回按钮处理
const handleBack = () => {
  router.push('/mobile/teacher-center/dashboard')
}

// Tab切换处理
const handleTabChange = (tabName: string) => {
  console.log('切换到Tab:', tabName)
}

// 刷新数据处理
const handleRefresh = () => {
  showToast('数据已刷新')
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-teacher-attendance {
  background: var(--van-background-color-light);
  min-height: calc(100vh - 46px - 50px);

  :deep(.van-tabs) {
    .van-tabs__nav {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .van-tabs__content {
      padding: 0;
    }

    .van-tab__pane {
      min-height: calc(100vh - 46px - 50px - 44px);
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-teacher-attendance {
    :deep(.van-tabs) {
      .van-tab__pane {
        min-height: calc(100vh - 46px - 50px - 44px);
        max-width: 768px;
        margin: 0 auto;
      }
    }
  }
}
</style>