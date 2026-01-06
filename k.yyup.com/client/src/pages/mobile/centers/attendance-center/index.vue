<template>
  <MobileMainLayout
    title="考勤中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <template #header-extra>
      <van-icon name="share-o" size="18" @click="handleExport" />
      <van-icon name="replay" size="18" @click="refreshData" style="margin-left: 12px" />
    </template>

    <div class="attendance-center-mobile">
      <!-- 全园概览卡片 -->
      <van-card class="overview-card">
        <template #title>
          <div class="overview-header">
            <span class="title">全园概览</span>
            <van-field
              v-model="overviewDateText"
              readonly
              placeholder="选择日期"
              @click="showDatePicker = true"
              class="date-picker-field"
            />
          </div>
        </template>

        <template #desc>
          <!-- 统计数据网格 -->
          <van-grid :column-num="2" :border="false" class="stats-grid">
            <van-grid-item>
              <div class="stat-item stat-total">
                <div class="stat-icon">
                  <van-icon name="friends" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ overview.totalRecords }}</div>
                  <div class="stat-label">总人数</div>
                </div>
              </div>
            </van-grid-item>

            <van-grid-item>
              <div class="stat-item stat-present">
                <div class="stat-icon">
                  <van-icon name="success" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ overview.presentCount }}</div>
                  <div class="stat-label">出勤人数</div>
                </div>
              </div>
            </van-grid-item>

            <van-grid-item>
              <div class="stat-item stat-absent">
                <div class="stat-icon">
                  <van-icon name="cross" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ overview.absentCount }}</div>
                  <div class="stat-label">缺勤人数</div>
                </div>
              </div>
            </van-grid-item>

            <van-grid-item>
              <div class="stat-item stat-rate">
                <div class="stat-icon">
                  <van-icon name="chart-trending-o" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ overview.attendanceRate }}%</div>
                  <div class="stat-label">出勤率</div>
                </div>
              </div>
            </van-grid-item>
          </van-grid>

          <!-- 详细统计 -->
          <div class="detail-stats">
            <van-row gutter="16">
              <van-col span="6">
                <div class="detail-stat">
                  <span class="label">迟到</span>
                  <span class="value late">{{ overview.lateCount }}</span>
                </div>
              </van-col>
              <van-col span="6">
                <div class="detail-stat">
                  <span class="label">早退</span>
                  <span class="value early-leave">{{ overview.earlyLeaveCount }}</span>
                </div>
              </van-col>
              <van-col span="6">
                <div class="detail-stat">
                  <span class="label">病假</span>
                  <span class="value sick">{{ overview.sickLeaveCount }}</span>
                </div>
              </van-col>
              <van-col span="6">
                <div class="detail-stat">
                  <span class="label">事假</span>
                  <span class="value personal">{{ overview.personalLeaveCount }}</span>
                </div>
              </van-col>
            </van-row>
          </div>
        </template>
      </van-card>

      <!-- Tab切换 -->
      <van-tabs v-model:active="activeTab" @change="handleTabChange" class="content-tabs">
        <!-- 统计分析 -->
        <van-tab title="统计分析" name="statistics">
          <MobileStatisticsTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </van-tab>

        <!-- 班级统计 -->
        <van-tab title="班级统计" name="class">
          <MobileClassStatisticsTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </van-tab>

        <!-- 异常分析 -->
        <van-tab title="异常分析" name="abnormal">
          <MobileAbnormalAnalysisTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </van-tab>

        <!-- 健康监测 -->
        <van-tab title="健康监测" name="health">
          <MobileHealthMonitoringTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </van-tab>

        <!-- 记录管理 -->
        <van-tab title="记录管理" name="records">
          <MobileRecordsManagementTab
            :kindergarten-id="kindergartenId"
            @refresh="loadOverview"
          />
        </van-tab>
      </van-tabs>

      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="overviewDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
          :max-date="new Date()"
          title="选择日期"
        />
      </van-popup>

      <!-- 导出对话框 -->
      <van-popup v-model:show="exportDialogVisible" position="bottom" :style="{ height: '60%' }">
        <div class="export-dialog">
          <div class="dialog-header">
            <van-button type="primary" plain @click="exportDialogVisible = false">
              取消
            </van-button>
            <span class="dialog-title">导出考勤报表</span>
            <van-button type="primary" @click="confirmExport" :loading="exporting">
              确定导出
            </van-button>
          </div>

          <div class="dialog-content">
            <van-cell-group inset>
              <van-field
                v-model="exportStartDateText"
                readonly
                label="开始日期"
                placeholder="选择开始日期"
                @click="showStartDatePicker = true"
              />
              <van-field
                v-model="exportEndDateText"
                readonly
                label="结束日期"
                placeholder="选择结束日期"
                @click="showEndDatePicker = true"
              />
            </van-cell-group>

            <van-cell-group inset title="导出格式">
              <van-radio-group v-model="exportForm.format">
                <van-cell title="Excel" clickable @click="exportForm.format = 'excel'">
                  <template #right-icon>
                    <van-radio name="excel" />
                  </template>
                </van-cell>
                <van-cell title="PDF" clickable @click="exportForm.format = 'pdf'">
                  <template #right-icon>
                    <van-radio name="pdf" />
                  </template>
                </van-cell>
              </van-radio-group>
            </van-cell-group>
          </div>
        </div>
      </van-popup>

      <!-- 开始日期选择器 -->
      <van-popup v-model:show="showStartDatePicker" position="bottom">
        <van-date-picker
          v-model="exportForm.startDate"
          @confirm="onStartDateConfirm"
          @cancel="showStartDatePicker = false"
          :max-date="new Date()"
          title="选择开始日期"
        />
      </van-popup>

      <!-- 结束日期选择器 -->
      <van-popup v-model:show="showEndDatePicker" position="bottom">
        <van-date-picker
          v-model="exportForm.endDate"
          @confirm="onEndDateConfirm"
          @cancel="showEndDatePicker = false"
          :max-date="new Date()"
          title="选择结束日期"
        />
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import {
  getOverview,
  exportAttendance,
  type OverviewData,
} from '@/api/modules/attendance-center'

// 导入移动端Tab组件
import MobileStatisticsTab from './components/MobileStatisticsTab.vue'
import MobileClassStatisticsTab from './components/MobileClassStatisticsTab.vue'
import MobileAbnormalAnalysisTab from './components/MobileAbnormalAnalysisTab.vue'
import MobileHealthMonitoringTab from './components/MobileHealthMonitoringTab.vue'
import MobileRecordsManagementTab from './components/MobileRecordsManagementTab.vue'

// ==================== 数据定义 ====================

const userStore = useUserStore()
const kindergartenId = ref(userStore.user?.kindergartenId || 1)

const activeTab = ref('statistics')
const overviewDate = ref(new Date())
const showDatePicker = ref(false)

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
})

// 导出对话框
const exportDialogVisible = ref(false)
const exporting = ref(false)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const exportForm = reactive({
  startDate: new Date(),
  endDate: new Date(),
  format: 'excel' as 'excel' | 'pdf',
})

// 计算属性
const overviewDateText = computed(() => {
  return overviewDate.value.toLocaleDateString('zh-CN')
})

const exportStartDateText = computed(() => {
  return exportForm.startDate.toLocaleDateString('zh-CN')
})

const exportEndDateText = computed(() => {
  return exportForm.endDate.toLocaleDateString('zh-CN')
})

// ==================== 方法 ====================

// 加载全园概览
const loadOverview = async () => {
  try {
    showLoadingToast({ message: '加载中...', forbidClick: true })
    const dateStr = overviewDate.value.toISOString().split('T')[0]
    const response = await getOverview({
      kindergartenId: kindergartenId.value,
      date: dateStr,
    })

    if (response.success && response.data) {
      overview.value = response.data
    }
  } catch (error) {
    console.error('加载全园概览失败:', error)
    showToast('加载全园概览失败')
  } finally {
    closeToast()
  }
}

// Tab切换
const handleTabChange = (tabName: string) => {
  console.log('切换到Tab:', tabName)
}

// 日期确认
const onDateConfirm = () => {
  showDatePicker.value = false
  loadOverview()
}

// 开始日期确认
const onStartDateConfirm = () => {
  showStartDatePicker.value = false
}

// 结束日期确认
const onEndDateConfirm = () => {
  showEndDatePicker.value = false
}

// 导出报表
const handleExport = () => {
  exportDialogVisible.value = true
}

// 确认导出
const confirmExport = async () => {
  exporting.value = true
  try {
    showLoadingToast({ message: '导出中...', forbidClick: true })
    const response = await exportAttendance({
      kindergartenId: kindergartenId.value,
      startDate: exportForm.startDate.toISOString().split('T')[0],
      endDate: exportForm.endDate.toISOString().split('T')[0],
      format: exportForm.format,
    })

    if (response.success && response.data) {
      showToast('导出成功')
      // 下载文件
      const link = document.createElement('a')
      link.href = response.data.url
      link.download = response.data.filename
      link.click()
      exportDialogVisible.value = false
    }
  } catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败')
  } finally {
    exporting.value = false
    closeToast()
  }
}

// 刷新数据
const refreshData = () => {
  loadOverview()
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadOverview()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.attendance-center-mobile {
  min-height: 100vh;
  background: var(--van-background-color-light);
  padding-bottom: var(--van-safe-area-bottom);

  .overview-card {
    margin: var(--spacing-md);
    border-radius: 12px;
    overflow: hidden;

    :deep(.van-card__header) {
      padding: var(--spacing-md) 16px 0;
    }

    :deep(.van-card__content) {
      padding: 0 16px 16px;
    }

    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .title {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--van-text-color);
      }

      .date-picker-field {
        flex: 1;
        margin-left: 16px;
        max-width: 120px;

        :deep(.van-field__control) {
          text-align: right;
          font-size: var(--text-sm);
          color: var(--van-primary-color);
        }
      }
    }

    .stats-grid {
      margin: var(--spacing-md) 0;

      .stat-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        border-radius: 12px;
        background: var(--van-background-color);

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          .van-icon {
            font-size: var(--text-xl);
            color: white;
          }
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: var(--text-2xl);
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--van-text-color);
          }

          .stat-label {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }

        &.stat-total {
          .stat-icon {
            background: linear-gradient(135deg, #409EFF 0%, #66B1FF 100%);
          }
        }

        &.stat-present {
          .stat-icon {
            background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
          }
        }

        &.stat-absent {
          .stat-icon {
            background: linear-gradient(135deg, #F56C6C 0%, #F78989 100%);
          }
        }

        &.stat-rate {
          .stat-icon {
            background: linear-gradient(135deg, #E6A23C 0%, #EEBE77 100%);
          }
        }
      }
    }

    .detail-stats {
      margin-top: 16px;

      .detail-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-md);
        background: var(--van-background-color);
        border-radius: 8px;

        .label {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: 4px;
        }

        .value {
          font-size: var(--text-lg);
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
  }

  .content-tabs {
    margin: 0 12px;

    :deep(.van-tabs__wrap) {
      border-radius: 8px;
      background: var(--card-bg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    :deep(.van-tabs__content) {
      padding-top: 16px;
    }

    :deep(.van-tab__panel) {
      min-height: 400px;
    }
  }

  .export-dialog {
    height: 100%;
    display: flex;
    flex-direction: column;

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .dialog-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md) 0;
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .attendance-center-mobile {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>