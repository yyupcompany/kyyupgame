<template>
  <UnifiedCenterLayout
    title="考勤管理"
    description="管理教师打卡和学生考勤，查看统计分析"
    icon="Calendar"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="handleExport">
        <UnifiedIcon name="download" :size="16" />
        导出报表
      </el-button>
      <el-button @click="refreshData">
        <UnifiedIcon name="refresh" :size="16" />
        刷新
      </el-button>
    </template>

    <!-- 统计卡片 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <StatCard
        icon="user"
        title="今日到岗"
        :value="attendanceStats.todayPresent"
        subtitle="教师已打卡"
        type="success"
        :trend="attendanceStats.todayPresent > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="clock"
        title="待打卡"
        :value="attendanceStats.pendingCheckIn"
        subtitle="教师未打卡"
        type="warning"
        :trend="attendanceStats.pendingCheckIn > 0 ? 'down' : 'stable'"
        clickable
      />
      <StatCard
        icon="student-cap"
        title="学生出勤"
        :value="`${attendanceStats.studentAttendanceRate}%`"
        subtitle="今日出勤率"
        type="primary"
        :trend="attendanceStats.studentAttendanceRate >= 95 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="document"
        title="本月考勤"
        :value="attendanceStats.monthlyRecords"
        subtitle="考勤记录总数"
        type="info"
        :trend="attendanceStats.monthlyRecords > 0 ? 'up' : 'stable'"
        clickable
      />
    </template>

    <!-- Tab切换 -->
    <div class="tabs-section">
      <el-card class="tabs-card" shadow="never">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- 教师打卡 -->
          <el-tab-pane name="teacher-checkin">
            <template #label>
              <span class="tab-label">
                <UnifiedIcon name="user" :size="16" />
                教师打卡
              </span>
            </template>
            <TeacherCheckIn @refresh="refreshData" />
          </el-tab-pane>

          <!-- 学生考勤 -->
          <el-tab-pane name="student-attendance">
            <template #label>
              <span class="tab-label">
                <UnifiedIcon name="student-cap" :size="16" />
                学生考勤
              </span>
            </template>
            <StudentAttendance @refresh="refreshData" />
          </el-tab-pane>

          <!-- 统计分析 -->
          <el-tab-pane name="statistics">
            <template #label>
              <span class="tab-label">
                <UnifiedIcon name="trend" :size="16" />
                统计分析
              </span>
            </template>
            <AttendanceStatistics @refresh="refreshData" />
          </el-tab-pane>

          <!-- 历史记录 -->
          <el-tab-pane name="history">
            <template #label>
              <span class="tab-label">
                <UnifiedIcon name="document" :size="16" />
                历史记录
              </span>
            </template>
            <AttendanceHistory @refresh="refreshData" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue';
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue';
import StatCard from '@/components/centers/StatCard.vue';

// 导入Tab组件
import TeacherCheckIn from './components/TeacherCheckIn.vue';
import StudentAttendance from './components/StudentAttendance.vue';
import AttendanceStatistics from './components/AttendanceStatistics.vue';
import AttendanceHistory from './components/AttendanceHistory.vue';

// ==================== 数据定义 ====================

const activeTab = ref('teacher-checkin');

// 统计数据
const attendanceStats = reactive({
  todayPresent: 0,
  pendingCheckIn: 0,
  studentAttendanceRate: 0,
  monthlyRecords: 0,
});

// ==================== 方法 ====================

// Tab切换
const handleTabChange = (tabName: string) => {
  console.log('切换到Tab:', tabName);
};

// 导出报表
const handleExport = () => {
  ElMessage.info('导出功能开发中');
};

// 刷新数据
const refreshData = () => {
  // TODO: 调用API更新统计数据
  ElMessage.success('数据已刷新');
};
</script>

<style lang="scss" scoped>
@use "@/styles/design-tokens.scss" as *;

// ==================== 主内容区域 ====================
.tabs-section {
  width: 100%;
}

// ==================== 选项卡卡片 ====================
.tabs-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-card);

  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
    padding: var(--spacing-md) var(--spacing-lg) 0;
    background-color: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: 0 var(--spacing-lg);

    &:hover {
      color: var(--primary-color);
    }

    &.is-active {
      color: var(--primary-color);
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: var(--primary-color);
    height: var(--spacing-xs);
  }

  :deep(.el-tabs__content) {
    padding: var(--spacing-lg);
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-sm);
  }
}

// ==================== 响应式设计 ====================
@media (max-width: var(--breakpoint-md)) {
  .tabs-card {
    :deep(.el-tabs__header) {
      padding: var(--spacing-sm) var(--spacing-md) 0;
    }

    :deep(.el-tabs__item) {
      padding: 0 var(--spacing-md);
    }

    :deep(.el-tabs__content) {
      padding: var(--spacing-md);
    }

    .tab-label {
      gap: var(--spacing-2xs);
      font-size: var(--text-xs);
    }
  }
}
</style>
