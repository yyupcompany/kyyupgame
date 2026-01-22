<template>
  <div class="mobile-class-statistics-tab">
    <!-- 筛选条件 -->
    <van-card class="filter-card">
      <van-cell-group inset>
        <van-field
          v-model="dateRangeText"
          readonly
          label="时间范围"
          placeholder="选择时间范围"
          @click="showDateRangePicker = true"
        />
        <van-field
          v-model="sortTypeText"
          readonly
          label="排序方式"
          placeholder="选择排序方式"
          @click="showSortPicker = true"
        />
      </van-cell-group>
    </van-card>

    <!-- 总体统计概览 -->
    <van-card class="overview-card">
      <template #title>
        <span class="card-title">班级统计概览</span>
      </template>

      <div v-if="classStatistics.length > 0" class="overview-stats">
        <van-row gutter="16">
          <van-col span="6">
            <div class="overview-item">
              <div class="overview-value">{{ totalClasses }}</div>
              <div class="overview-label">班级数</div>
            </div>
          </van-col>
          <van-col span="6">
            <div class="overview-item">
              <div class="overview-value">{{ totalStudents }}</div>
              <div class="overview-label">总人数</div>
            </div>
          </van-col>
          <van-col span="6">
            <div class="overview-item">
              <div class="overview-value">{{ averageAttendanceRate }}%</div>
              <div class="overview-label">平均出勤率</div>
            </div>
          </van-col>
          <van-col span="6">
            <div class="overview-item">
              <div class="overview-value">{{ bestClassRate }}%</div>
              <div class="overview-label">最高出勤率</div>
            </div>
          </van-col>
        </van-row>
      </div>

      <van-empty v-else description="暂无统计数据" />
    </van-card>

    <!-- 班级列表 -->
    <div class="class-list">
      <van-card
        v-for="classStats in sortedClassStatistics"
        :key="classStats.classId"
        class="class-stat-card"
      >
        <template #title>
          <div class="class-header">
            <span class="class-name">{{ classStats.className }}</span>
            <van-tag
              :type="getAttendanceRateType(classStats.attendanceRate)"
              size="medium"
            >
              {{ classStats.attendanceRate }}%
            </van-tag>
          </div>
        </template>

        <template #desc>
          <div class="class-details">
            <!-- 基本统计信息 -->
            <van-row gutter="16" class="basic-stats">
              <van-col span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ classStats.totalRecords }}</div>
                  <div class="stat-label">总人数</div>
                </div>
              </van-col>
              <van-col span="6">
                <div class="stat-item present">
                  <div class="stat-value">{{ classStats.presentCount }}</div>
                  <div class="stat-label">出勤</div>
                </div>
              </van-col>
              <van-col span="6">
                <div class="stat-item absent">
                  <div class="stat-value">{{ classStats.absentCount }}</div>
                  <div class="stat-label">缺勤</div>
                </div>
              </van-col>
              <van-col span="6">
                <div class="stat-item rate">
                  <div class="stat-value">{{ classStats.attendanceRate }}%</div>
                  <div class="stat-label">出勤率</div>
                </div>
              </van-col>
            </van-row>

            <!-- 详细统计 -->
            <van-collapse v-model="activeCollapse" class="detail-collapse">
              <van-collapse-item :name="classStats.classId">
                <template #title>
                  <span class="collapse-title">详细信息</span>
                </template>

                <div class="detail-stats">
                  <van-row gutter="12">
                    <van-col span="8">
                      <div class="detail-stat">
                        <span class="label">迟到:</span>
                        <span class="value late">{{ classStats.lateCount }}</span>
                      </div>
                    </van-col>
                    <van-col span="8">
                      <div class="detail-stat">
                        <span class="label">早退:</span>
                        <span class="value early-leave">{{ classStats.earlyLeaveCount }}</span>
                      </div>
                    </van-col>
                    <van-col span="8">
                      <div class="detail-stat">
                        <span class="label">病假:</span>
                        <span class="value sick">{{ classStats.sickLeaveCount }}</span>
                      </div>
                    </van-col>
                  </van-row>
                  <van-row gutter="12" style="margin-top: 8px">
                    <van-col span="24">
                      <div class="detail-stat">
                        <span class="label">事假:</span>
                        <span class="value personal">{{ classStats.personalLeaveCount }}</span>
                      </div>
                    </van-col>
                  </van-row>
                </div>

                <!-- 操作按钮 -->
                <div class="class-actions">
                  <van-button
                    size="medium"
                    type="primary"
                    plain
                    @click="viewClassDetail(classStats)"
                  >
                    查看详情
                  </van-button>
                  <van-button
                    size="medium"
                    type="success"
                    plain
                    @click="exportClassReport(classStats)"
                  >
                    导出报表
                  </van-button>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading>加载中...</van-loading>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && classStatistics.length === 0" class="empty-container">
      <van-empty description="暂无班级统计数据" />
    </div>

    <!-- 日期范围选择器 -->
    <van-popup v-model:show="showDateRangePicker" position="bottom">
      <div class="date-range-picker">
        <div class="picker-header">
          <van-button plain @click="showDateRangePicker = false">取消</van-button>
          <span class="picker-title">选择时间范围</span>
          <van-button type="primary" @click="onDateRangeConfirm">确定</van-button>
        </div>
        <div class="picker-content">
          <div class="date-item">
            <div class="date-label">开始日期</div>
            <van-date-picker
              v-model="startDate"
              :max-date="endDate || new Date()"
              title="开始日期"
            />
          </div>
          <div class="date-item">
            <div class="date-label">结束日期</div>
            <van-date-picker
              v-model="endDate"
              :min-date="startDate"
              :max-date="new Date()"
              title="结束日期"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 排序方式选择器 -->
    <van-popup v-model:show="showSortPicker" position="bottom">
      <van-picker
        :columns="sortColumns"
        @confirm="onSortConfirm"
        @cancel="showSortPicker = false"
        title="选择排序方式"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRouter } from 'vue-router'
import {
  getStatisticsByClass,
  type ClassStatistics,
} from '@/api/modules/attendance-center'

interface Props {
  kindergartenId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

const router = useRouter()

// 响应式数据
const loading = ref(false)
const classStatistics = ref<ClassStatistics[]>([])
const activeCollapse = ref<number[]>([])

// 筛选条件
const startDate = ref(new Date())
const endDate = ref(new Date())
const sortType = ref('rate-desc')
const showDateRangePicker = ref(false)
const showSortPicker = ref(false)

// 配置选项
const sortColumns = [
  { text: '出勤率从高到低', value: 'rate-desc' },
  { text: '出勤率从低到高', value: 'rate-asc' },
  { text: '班级名称', value: 'name' },
  { text: '总人数从多到少', value: 'total-desc' },
  { text: '总人数从少到多', value: 'total-asc' },
]

// 计算属性
const dateRangeText = computed(() => {
  return `${startDate.value.toLocaleDateString()} - ${endDate.value.toLocaleDateString()}`
})

const sortTypeText = computed(() => {
  const sort = sortColumns.find(s => s.value === sortType.value)
  return sort?.text || '选择排序方式'
})

const totalClasses = computed(() => classStatistics.value.length)

const totalStudents = computed(() =>
  classStatistics.value.reduce((sum, item) => sum + item.totalRecords, 0)
)

const averageAttendanceRate = computed(() => {
  if (classStatistics.value.length === 0) return 0
  const totalRate = classStatistics.value.reduce((sum, item) => sum + item.attendanceRate, 0)
  return (totalRate / classStatistics.value.length).toFixed(1)
})

const bestClassRate = computed(() => {
  if (classStatistics.value.length === 0) return 0
  return Math.max(...classStatistics.value.map(item => item.attendanceRate))
})

const sortedClassStatistics = computed(() => {
  const sorted = [...classStatistics.value]
  switch (sortType.value) {
    case 'rate-desc':
      return sorted.sort((a, b) => b.attendanceRate - a.attendanceRate)
    case 'rate-asc':
      return sorted.sort((a, b) => a.attendanceRate - b.attendanceRate)
    case 'name':
      return sorted.sort((a, b) => a.className.localeCompare(b.className))
    case 'total-desc':
      return sorted.sort((a, b) => b.totalRecords - a.totalRecords)
    case 'total-asc':
      return sorted.sort((a, b) => a.totalRecords - b.totalRecords)
    default:
      return sorted
  }
})

// 方法
const loadClassStatistics = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })

    const response = await getStatisticsByClass({
      kindergartenId: props.kindergartenId,
      startDate: startDate.value.toISOString().split('T')[0],
      endDate: endDate.value.toISOString().split('T')[0],
    })

    if (response.success && response.data) {
      classStatistics.value = response.data
    }
  } catch (error) {
    console.error('加载班级统计失败:', error)
    showToast('加载班级统计失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

const getAttendanceRateType = (rate: number) => {
  if (rate >= 95) return 'success'
  if (rate >= 90) return 'primary'
  if (rate >= 85) return 'warning'
  return 'danger'
}

const viewClassDetail = (classStats: ClassStatistics) => {
  // 跳转到班级详情页面
  router.push({
    path: '/mobile/attendance/class-detail',
    query: {
      classId: classStats.classId,
      className: classStats.className,
      startDate: startDate.value.toISOString().split('T')[0],
      endDate: endDate.value.toISOString().split('T')[0],
    }
  })
}

const exportClassReport = (classStats: ClassStatistics) => {
  showToast(`导出${classStats.className}的考勤报表`)
  // TODO: 实现导出功能
}

const onDateRangeConfirm = () => {
  showDateRangePicker.value = false
  loadClassStatistics()
}

const onSortConfirm = ({ selectedValues }) => {
  sortType.value = selectedValues[0]
  showSortPicker.value = false
}

// 生命周期
onMounted(() => {
  // 设置默认日期范围为最近7天
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  startDate.value = weekAgo
  endDate.value = now

  loadClassStatistics()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-class-statistics-tab {
  .filter-card {
    margin: 0 0 12px 0;
  }

  .overview-card {
    margin: 0 0 12px 0;

    :deep(.van-card__header) {
      padding: var(--spacing-md) 16px 0;
    }

    :deep(.van-card__content) {
      padding: 0 16px 16px;
    }

    .card-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }

    .overview-stats {
      .overview-item {
        text-align: center;
        padding: var(--spacing-md);
        background: var(--van-background-color);
        border-radius: 8px;

        .overview-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--van-primary-color);
          margin-bottom: 4px;
        }

        .overview-label {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
        }
      }
    }
  }

  .class-list {
    .class-stat-card {
      margin: 0 0 12px 0;

      .class-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .class-name {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-text-color);
        }
      }

      .class-details {
        .basic-stats {
          margin-bottom: 12px;

          .stat-item {
            text-align: center;
            padding: var(--spacing-sm);
            border-radius: 6px;
            background: var(--van-background-color);

            .stat-value {
              font-size: var(--text-base);
              font-weight: 600;
              margin-bottom: 4px;
            }

            .stat-label {
              font-size: 11px;
              color: var(--van-text-color-2);
            }

            &.present .stat-value {
              color: var(--text-primary);
            }

            &.absent .stat-value {
              color: var(--text-primary);
            }

            &.rate .stat-value {
              color: var(--van-primary-color);
            }
          }
        }

        .detail-collapse {
          .collapse-title {
            font-size: var(--text-sm);
            color: var(--van-text-color);
          }

          .detail-stats {
            padding: var(--spacing-md) 0;

            .detail-stat {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: var(--spacing-sm) 12px;
              background: var(--van-background-color);
              border-radius: 6px;

              .label {
                font-size: var(--text-xs);
                color: var(--van-text-color-2);
              }

              .value {
                font-size: var(--text-sm);
                font-weight: 600;

                &.late {
                  color: var(--text-primary);
                }

                &.early-leave {
                  color: var(--text-primary);
                }

                &.sick {
                  color: var(--text-primary);
                }

                &.personal {
                  color: var(--text-primary);
                }
              }
            }
          }

          .class-actions {
            display: flex;
            gap: var(--spacing-sm);
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--van-border-color);

            .van-button {
              flex: 1;
            }
          }
        }
      }
    }
  }

  .loading-container,
  .empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
  }

  .date-range-picker {
    height: 70vh;
    display: flex;
    flex-direction: column;

    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .picker-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .picker-content {
      flex: 1;
      overflow-y: auto;

      .date-item {
        margin-bottom: 16px;

        .date-label {
          padding: var(--spacing-md);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color);
        }
      }
    }
  }
}
</style>