<template>
  <UnifiedCenterLayout
    title="考勤中心"
    description="清晰展示考勤管理的完整流程，方便园长一目了然地掌握考勤状况"
  >
    <template #header-actions>
      <el-button type="primary" :icon="Download" @click="handleExport">
        导出报表
      </el-button>
      <el-button :icon="Refresh" @click="refreshData">刷新</el-button>
    </template>

    <div class="center-container attendance-center-timeline">

    <!-- 全园概览卡片 -->
    <el-card class="overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">全园概览</span>
          <el-date-picker
            v-model="overviewDate"
            type="date"
            placeholder="选择日期"
            @change="loadOverview"
            size="small"
            style="width: var(--form-width-sm)"
          />
        </div>
      </template>

      <el-row :gutter="32">
        <el-col :span="6">
          <div class="overview-stat">
            <div class="stat-icon stat-total">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.totalRecords }}</div>
              <div class="stat-label">总人数</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="overview-stat">
            <div class="stat-icon stat-present">
              <UnifiedIcon name="Check" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.presentCount }}</div>
              <div class="stat-label">出勤人数</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="overview-stat">
            <div class="stat-icon stat-absent">
              <UnifiedIcon name="Close" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.absentCount }}</div>
              <div class="stat-label">缺勤人数</div>
            </div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="overview-stat">
            <div class="stat-icon stat-rate">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.attendanceRate }}%</div>
              <div class="stat-label">出勤率</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="32">
        <el-col :span="6">
          <div class="detail-stat">
            <span class="label">迟到:</span>
            <span class="value late">{{ overview.lateCount }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="detail-stat">
            <span class="label">早退:</span>
            <span class="value early-leave">{{ overview.earlyLeaveCount }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="detail-stat">
            <span class="label">病假:</span>
            <span class="value sick">{{ overview.sickLeaveCount }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="detail-stat">
            <span class="label">事假:</span>
            <span class="value personal">{{ overview.personalLeaveCount }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tab切换 -->
    <el-card class="tabs-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 统计分析 -->
        <el-tab-pane label="统计分析" name="statistics">
          <StatisticsTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </el-tab-pane>

        <!-- 班级统计 -->
        <el-tab-pane label="班级统计" name="class">
          <ClassStatisticsTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </el-tab-pane>

        <!-- 异常分析 -->
        <el-tab-pane label="异常分析" name="abnormal">
          <AbnormalAnalysisTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </el-tab-pane>

        <!-- 健康监测 -->
        <el-tab-pane label="健康监测" name="health">
          <HealthMonitoringTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </el-tab-pane>

        <!-- 记录管理 -->
        <el-tab-pane label="记录管理" name="records">
          <RecordsManagementTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出考勤报表"
      width="var(--dialog-width-md)"
    >
      <el-form :model="exportForm" label-width="var(--form-label-width)">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="exportForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: var(--form-width-full)"
          />
        </el-form-item>

        <el-form-item label="结束日期">
          <el-date-picker
            v-model="exportForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: var(--form-width-full)"
          />
        </el-form-item>

        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="pdf">PDF</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport" :loading="exporting">
          确定导出
        </el-button>
      </template>
    </el-dialog>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Download,
  Refresh,
  User,
  CircleCheck,
  CircleClose,
  TrendCharts,
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import {
  getOverview,
  exportAttendance,
  type OverviewData,
} from '@/api/modules/attendance-center';

// 导入Tab组件
import StatisticsTab from './components/attendance/StatisticsTab.vue';
import ClassStatisticsTab from './components/attendance/ClassStatisticsTab.vue';
import AbnormalAnalysisTab from './components/attendance/AbnormalAnalysisTab.vue';
import HealthMonitoringTab from './components/attendance/HealthMonitoringTab.vue';
import RecordsManagementTab from './components/attendance/RecordsManagementTab.vue';

// ==================== 数据定义 ====================

const userStore = useUserStore();
const kindergartenId = ref(userStore.user?.kindergartenId || 1);

// 调试日志
console.log('[考勤中心] 用户信息:', {
  user: userStore.user,
  kindergartenId: kindergartenId.value,
  hasUser: !!userStore.user,
  hasKindergartenId: !!userStore.user?.kindergartenId
});

const activeTab = ref('statistics');
const overviewDate = ref(new Date());

// 全园概览数据
const overview = ref<OverviewData>({
  date: '',
  totalRecords: 0,
  presentCount: 0,
  absentCount: 0,
  lateCount: 0,
  earlyLeaveCount: 0,
  sickLeaveCount: 0,
  personalLeaveCount: 0,
  attendanceRate: 0,
  abnormalTemperature: 0,
});

// 导出对话框
const exportDialogVisible = ref(false);
const exporting = ref(false);
const exportForm = reactive({
  startDate: new Date(),
  endDate: new Date(),
  format: 'excel' as 'excel' | 'pdf',
});

// ==================== 方法 ====================

// 加载全园概览
const loadOverview = async () => {
  try {
    const dateStr = overviewDate.value.toISOString().split('T')[0];
    console.log('[考勤中心] 加载全园概览:', {
      kindergartenId: kindergartenId.value,
      date: dateStr
    });
    
    const response = await getOverview({
      kindergartenId: kindergartenId.value,
      date: dateStr,
    });

    console.log('[考勤中心] 概览响应:', response);

    if (response.success && response.data) {
      overview.value = response.data;
    } else {
      console.warn('[考勤中心] 响应无数据:', response);
      ElMessage.warning('暂无考勤数据');
    }
  } catch (error) {
    console.error('[考勤中心] 加载全园概览失败:', error);
    if (error.response) {
      console.error('[考勤中心] 错误响应:', error.response.data);
      ElMessage.error(`加载失败: ${error.response.data.message || '未知错误'}`);
    } else {
      ElMessage.error('加载全园概览失败');
    }
  }
};

// Tab切换
const handleTabChange = (tabName: string) => {
  console.log('切换到Tab:', tabName);
};

// 导出报表
const handleExport = () => {
  exportDialogVisible.value = true;
};

// 确认导出
const confirmExport = async () => {
  exporting.value = true;
  try {
    const response = await exportAttendance({
      kindergartenId: kindergartenId.value,
      startDate: exportForm.startDate.toISOString().split('T')[0],
      endDate: exportForm.endDate.toISOString().split('T')[0],
      format: exportForm.format,
    });

    if (response.success && response.data) {
      ElMessage.success('导出成功');
      window.open(response.data.url, '_blank');
      exportDialogVisible.value = false;
    }
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  loadOverview();
};

// ==================== 生命周期 ====================

onMounted(() => {
  loadOverview();
});
</script>

<style scoped lang="scss">
.attendance-center-timeline {
  background: var(--bg-secondary, var(--bg-container));  // ✅ 与活动中心一致
  padding: var(--text-2xl);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    .header-left {
      .page-title {
        font-size: var(--text-3xl);
        font-weight: 600;
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--text-primary);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .overview-card {
    margin-bottom: var(--text-2xl);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: var(--text-lg);
        font-weight: 600;
      }
    }

    .overview-stat {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      padding: var(--text-lg);
      border-radius: var(--spacing-sm);
      background: var(--el-bg-color-page);

      .stat-icon {
        width: var(--icon-size-xl);
        height: var(--icon-size-xl);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-on-primary);

        &.stat-total {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
        }

        &.stat-present {
          background: var(--gradient-pink);
        }

        &.stat-absent {
          background: var(--gradient-blue);
        }

        &.stat-rate {
          background: var(--gradient-success);
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--text-base);
          color: var(--info-color);
        }
      }
    }

    .detail-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) var(--text-lg);

      .label {
        font-size: var(--text-base);
        color: var(--text-regular);
      }

      .value {
        font-size: var(--text-xl);
        font-weight: 600;

        &.late {
          color: var(--warning-color);
        }

        &.early-leave {
          color: var(--danger-color);
        }

        &.sick {
          color: var(--info-color);
        }

        &.personal {
          color: var(--primary-color);
        }
      }
    }
  }

  .tabs-card {
    :deep(.el-tabs__header) {
      margin-bottom: var(--text-2xl);
    }
  }
}
</style>

