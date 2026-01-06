<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container teacher-attendance-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <UnifiedIcon name="default" />
          考勤管理
        </h1>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/teacher-center' }">教师中心</el-breadcrumb-item>
          <el-breadcrumb-item>考勤管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Download" @click="handleExport">
          导出报表
        </el-button>
        <el-button :icon="Refresh" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <!-- Tab切换 -->
    <el-card class="tabs-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 教师打卡 -->
        <el-tab-pane name="teacher-checkin">
          <template #label>
            <span class="tab-label">
              <UnifiedIcon name="default" />
              教师打卡
            </span>
          </template>
          <TeacherCheckIn @refresh="refreshData" />
        </el-tab-pane>

        <!-- 学生考勤 -->
        <el-tab-pane name="student-attendance">
          <template #label>
            <span class="tab-label">
              <UnifiedIcon name="default" />
              学生考勤
            </span>
          </template>
          <StudentAttendance @refresh="refreshData" />
        </el-tab-pane>

        <!-- 统计分析 -->
        <el-tab-pane name="statistics">
          <template #label>
            <span class="tab-label">
              <UnifiedIcon name="default" />
              统计分析
            </span>
          </template>
          <AttendanceStatistics @refresh="refreshData" />
        </el-tab-pane>

        <!-- 历史记录 -->
        <el-tab-pane name="history">
          <template #label>
            <span class="tab-label">
              <UnifiedIcon name="default" />
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
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Clock,
  Download,
  Refresh,
  User,
  UserFilled,
  TrendCharts,
  Document,
} from '@element-plus/icons-vue';

// 导入Tab组件
import TeacherCheckIn from './components/TeacherCheckIn.vue';
import StudentAttendance from './components/StudentAttendance.vue';
import AttendanceStatistics from './components/AttendanceStatistics.vue';
import AttendanceHistory from './components/AttendanceHistory.vue';

// ==================== 数据定义 ====================

const activeTab = ref('teacher-checkin');

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
  ElMessage.success('数据已刷新');
};
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.teacher-attendance-center {
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    .header-left {
      .page-title {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 var(--spacing-xs) 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);

        .el-icon {
          font-size: var(--text-2xl);
          color: var(--el-color-primary);
        }
      }

      .el-breadcrumb {
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-md);
    }
  }

  .tabs-card {
    :deep(.el-card__body) {
      padding: 0;
    }

    :deep(.el-tabs__header) {
      margin: 0;
      padding: var(--spacing-md) var(--spacing-lg) 0;
      background-color: var(--bg-white);
    }

    :deep(.el-tabs__content) {
      padding: var(--spacing-lg);
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-2xs);
      font-size: var(--text-sm);

      .el-icon {
        font-size: var(--text-base);
      }
    }
  }
}
</style>

