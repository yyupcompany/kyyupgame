<template>
  <div class="external-display-detail">
    <!-- 预览模式 -->
    <div v-if="preview" class="preview-mode">
      <div class="stats-overview">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">本学期外出</span>
            <span class="stat-value primary">{{ data.data?.semesterOutings }}次</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均达标率</span>
            <span class="stat-value success">{{ data.data?.averageRate }}%</span>
          </div>
        </div>
      </div>

      <div class="recent-activities-preview">
        <h4 class="preview-title">近期展示活动</h4>
        <div class="activity-list">
          <div
            v-for="activity in previewActivities"
            :key="activity.id"
            class="activity-item-mini"
          >
            <div class="activity-info">
              <span class="activity-name">{{ activity.name }}</span>
              <span class="activity-date">{{ activity.date }}</span>
            </div>
            <van-tag
              :type="getAchievementTagType(activity.rate)"
              size="small"
            >
              {{ activity.rate }}%
            </van-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 完整模式 -->
    <div v-else class="full-mode">
      <!-- 总体统计 -->
      <div class="overview-section">
        <h3 class="section-title">校外展示总览</h3>
        <div class="overview-cards">
          <div class="overview-card primary">
            <van-icon name="friends-o" size="24" />
            <div class="card-content">
              <div class="card-value">{{ displayData.semesterOutings }}次</div>
              <div class="card-label">本学期外出</div>
            </div>
          </div>
          <div class="overview-card success">
            <van-icon name="medal-o" size="24" />
            <div class="card-content">
              <div class="card-value">{{ displayData.averageRate }}%</div>
              <div class="card-label">平均达标率</div>
            </div>
          </div>
          <div class="overview-card warning">
            <van-icon name="calendar-o" size="24" />
            <div class="card-content">
              <div class="card-value">{{ displayData.totalOutings }}次</div>
              <div class="card-label">累计外出</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 展示活动列表 -->
      <div class="activities-section">
        <div class="section-header">
          <h3 class="section-title">展示活动记录</h3>
          <van-button
            size="small"
            icon="plus"
            type="primary"
            @click="showCreateDialog = true"
          >
            添加展示
          </van-button>
        </div>

        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadActivityList"
        >
          <div
            v-for="activity in activityList"
            :key="activity.id"
            class="activity-card"
            @click="selectActivity(activity)"
          >
            <div class="activity-header">
              <div class="activity-info">
                <h4 class="activity-name">{{ activity.name }}</h4>
                <div class="activity-meta">
                  <span class="activity-date">{{ activity.date }}</span>
                  <van-tag
                    :type="getTypeTagType(activity.type)"
                    size="small"
                  >
                    {{ activity.type }}
                  </van-tag>
                </div>
              </div>
              <div class="achievement-rate">
                <span class="rate-value">{{ activity.achievementRate }}%</span>
                <van-progress
                  :percentage="activity.achievementRate"
                  stroke-width="4"
                  :color="getAchievementColor(activity.achievementRate)"
                  :show-pivot="false"
                />
              </div>
            </div>

            <div class="activity-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">地点</span>
                  <span class="detail-value">{{ activity.location }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">参与人数</span>
                  <span class="detail-value">{{ activity.participantCount }}人</span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">表现等级</span>
                  <span class="detail-value">{{ activity.achievementLevel }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">达标人数</span>
                  <span class="detail-value">{{ Math.floor(activity.participantCount * activity.achievementRate / 100) }}人</span>
                </div>
              </div>
            </div>

            <div class="activity-actions" v-if="selectedActivity?.id === activity.id">
              <van-button
                size="small"
                icon="photo-o"
                @click.stop="viewPhotos(activity)"
              >
                查看照片
              </van-button>
              <van-button
                size="small"
                icon="edit"
                type="primary"
                @click.stop="editActivity(activity)"
              >
                编辑
              </van-button>
              <van-button
                size="small"
                icon="share-o"
                type="success"
                @click.stop="shareActivity(activity)"
              >
                分享
              </van-button>
            </div>
          </div>
        </van-list>
      </div>

      <!-- 统计图表 -->
      <div class="chart-section">
        <h3 class="section-title">达标率趋势</h3>
        <div class="chart-container">
          <div class="trend-chart">
            <div
              v-for="(point, index) in trendData"
              :key="index"
              class="chart-point"
              :style="{ left: `${(index / (trendData.length - 1)) * 100}%`, bottom: `${point.rate}%` }"
            >
              <div class="point-dot"></div>
              <div class="point-label">{{ point.rate }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建展示活动弹窗 -->
    <van-popup
      v-model:show="showCreateDialog"
      position="bottom"
      round
      :style="{ height: '85%' }"
      safe-area-inset-bottom
    >
      <div class="create-dialog">
        <div class="dialog-header">
          <h3>添加校外展示</h3>
          <van-button icon="cross" @click="showCreateDialog = false" />
        </div>

        <div class="dialog-content">
          <van-form @submit="createDisplayRecord">
            <van-cell-group inset>
              <van-field
                v-model="createForm.classId"
                name="classId"
                label="班级"
                placeholder="请选择班级"
                is-link
                readonly
                @click="showClassPicker = true"
                :rules="[{ required: true, message: '请选择班级' }]"
              />
              <van-field
                v-model="createForm.activityName"
                name="activityName"
                label="活动名称"
                placeholder="请输入活动名称"
                :rules="[{ required: true, message: '请输入活动名称' }]"
              />
              <van-field
                v-model="createForm.activityDate"
                name="activityDate"
                label="活动日期"
                placeholder="请选择活动日期"
                is-link
                readonly
                @click="showDatePicker = true"
                :rules="[{ required: true, message: '请选择活动日期' }]"
              />
              <van-field
                v-model="createForm.location"
                name="location"
                label="活动地点"
                placeholder="请输入活动地点"
                :rules="[{ required: true, message: '请输入活动地点' }]"
              />
              <van-field
                v-model="createForm.activityType"
                name="activityType"
                label="活动类型"
                placeholder="请选择活动类型"
                is-link
                readonly
                @click="showTypePicker = true"
                :rules="[{ required: true, message: '请选择活动类型' }]"
              />
              <van-field
                v-model="createForm.participantCount"
                name="participantCount"
                label="参与人数"
                placeholder="请输入参与人数"
                type="number"
                :rules="[{ required: true, message: '请输入参与人数' }]"
              />
              <van-field
                v-model="createForm.achievementLevel"
                name="achievementLevel"
                label="表现等级"
                placeholder="请选择表现等级"
                is-link
                readonly
                @click="showLevelPicker = true"
                :rules="[{ required: true, message: '请选择表现等级' }]"
              />
              <van-field
                v-model="createForm.achievementRate"
                name="achievementRate"
                label="达标率"
                placeholder="请输入达标率"
                type="number"
                :rules="[{ required: true, message: '请输入达标率' }]"
              />
              <van-field
                v-model="createForm.notes"
                name="notes"
                label="活动描述"
                placeholder="请输入活动描述"
                type="textarea"
                rows="3"
              />
            </van-cell-group>

            <div class="dialog-actions">
              <van-button block type="primary" native-type="submit">
                添加展示
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showLevelPicker" position="bottom">
      <van-picker
        :columns="levelColumns"
        @confirm="onLevelConfirm"
        @cancel="showLevelPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'

// Props
interface Props {
  data: any
  preview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  preview: false
})

// Emits
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const loading = ref(false)
const finished = ref(false)
const showCreateDialog = ref(false)
const selectedActivity = ref<any>(null)

// 选择器状态
const showClassPicker = ref(false)
const showTypePicker = ref(false)
const showLevelPicker = ref(false)
const showDatePicker = ref(false)

// 展示数据
const displayData = reactive({
  semesterOutings: 0,
  averageRate: 0,
  totalOutings: 0
})

// 活动列表
const activityList = ref<any[]>([])
const trendData = ref<any[]>([])

// 创建表单
const createForm = reactive({
  classId: '',
  activityName: '',
  activityDate: '',
  location: '',
  activityType: '',
  participantCount: '',
  achievementLevel: '',
  achievementRate: '',
  notes: ''
})

// 选择器数据
const classColumns = [
  { text: '小班A班', value: 1 },
  { text: '小班B班', value: 2 },
  { text: '中班A班', value: 3 },
  { text: '中班B班', value: 4 },
  { text: '大班A班', value: 5 },
  { text: '大班B班', value: 6 }
]

const typeColumns = [
  { text: '文艺表演', value: '文艺表演' },
  { text: '体育竞技', value: '体育竞技' },
  { text: '科技展示', value: '科技展示' },
  { text: '社会实践', value: '社会实践' },
  { text: '公益服务', value: '公益服务' }
]

const levelColumns = [
  { text: '优秀', value: '优秀' },
  { text: '良好', value: '良好' },
  { text: '一般', value: '一般' },
  { text: '待改进', value: '待改进' }
]

// 计算属性
const previewActivities = computed(() => {
  return activityList.value.slice(0, 3)
})

// 方法
const getAchievementTagType = (rate: number) => {
  if (rate >= 90) return 'success'
  if (rate >= 80) return 'primary'
  if (rate >= 70) return 'warning'
  return 'danger'
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    '文艺表演': 'primary',
    '体育竞技': 'success',
    '科技展示': 'warning',
    '社会实践': 'info',
    '公益服务': 'default'
  }
  return typeMap[type] || 'default'
}

const getAchievementColor = (rate: number) => {
  if (rate >= 90) return '#67C23A'
  if (rate >= 80) return '#409EFF'
  if (rate >= 70) return '#E6A23C'
  return '#F56C6C'
}

const selectActivity = (activity: any) => {
  selectedActivity.value = selectedActivity.value?.id === activity.id ? null : activity
}

const generateActivityList = () => {
  const activities = [
    {
      id: 1,
      name: '春季文艺汇演',
      date: '2024-03-15',
      type: '文艺表演',
      location: '市文化中心',
      participantCount: 45,
      achievementLevel: '优秀',
      achievementRate: 95
    },
    {
      id: 2,
      name: '社区运动会',
      date: '2024-04-20',
      type: '体育竞技',
      location: '社区体育广场',
      participantCount: 38,
      achievementLevel: '良好',
      achievementRate: 85
    },
    {
      id: 3,
      name: '科技作品展',
      date: '2024-05-10',
      type: '科技展示',
      location: '科技馆',
      participantCount: 32,
      achievementLevel: '优秀',
      achievementRate: 92
    },
    {
      id: 4,
      name: '环保公益活动',
      date: '2024-05-25',
      type: '公益服务',
      location: '城市公园',
      participantCount: 28,
      achievementLevel: '良好',
      achievementRate: 88
    }
  ]

  activityList.value = activities
}

const generateTrendData = () => {
  const trend = [
    { month: '1月', rate: 75 },
    { month: '2月', rate: 82 },
    { month: '3月', rate: 90 },
    { month: '4月', rate: 85 },
    { month: '5月', rate: 88 },
    { month: '6月', rate: 92 }
  ]

  trendData.value = trend
}

const loadActivityList = async () => {
  try {
    loading.value = true

    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 这里应该调用API加载活动列表
    generateActivityList()
    finished.value = true

  } catch (error) {
    console.error('加载活动列表失败:', error)
    showToast('加载活动列表失败')
    finished.value = true
  } finally {
    loading.value = false
  }
}

const viewPhotos = (activity: any) => {
  showToast(`查看${activity.name}照片`)
}

const editActivity = (activity: any) => {
  showToast(`编辑${activity.name}`)
}

const shareActivity = (activity: any) => {
  showToast(`分享${activity.name}`)
}

const createDisplayRecord = async () => {
  try {
    const loadingToast = showLoadingToast('添加校外展示中...')

    await teachingCenterApi.createExternalDisplayRecord({
      class_id: parseInt(createForm.classId),
      activity_name: createForm.activityName,
      activity_date: createForm.activityDate,
      location: createForm.location,
      activity_type: createForm.activityType,
      participant_count: parseInt(createForm.participantCount),
      achievement_level: createForm.achievementLevel,
      achievement_rate: parseInt(createForm.achievementRate),
      notes: createForm.notes
    })

    closeToast()
    showToast('校外展示添加成功')
    showCreateDialog.value = false

    // 重置表单
    Object.keys(createForm).forEach(key => {
      createForm[key as keyof typeof createForm] = ''
    })

    // 刷新数据
    emit('refresh')
  } catch (error) {
    closeToast()
    console.error('添加校外展示失败:', error)
    showToast('添加校外展示失败')
  }
}

// 选择器确认方法
const onClassConfirm = ({ selectedOptions }: any) => {
  createForm.classId = selectedOptions[0].value.toString()
  showClassPicker.value = false
}

const onTypeConfirm = ({ selectedOptions }: any) => {
  createForm.activityType = selectedOptions[0].value
  showTypePicker.value = false
}

const onLevelConfirm = ({ selectedOptions }: any) => {
  createForm.achievementLevel = selectedOptions[0].value
  showLevelPicker.value = false
}

const onDateConfirm = ({ selectedValues }: any) => {
  createForm.activityDate = selectedValues.join('-')
  showDatePicker.value = false
}

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (newData?.data) {
      displayData.semesterOutings = newData.data.semesterOutings || 0
      displayData.averageRate = newData.data.averageRate || 0
      displayData.totalOutings = newData.data.totalOutings || 0

      generateActivityList()
      generateTrendData()
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  if (props.data?.data) {
    displayData.semesterOutings = props.data.data.semesterOutings || 0
    displayData.averageRate = props.data.data.averageRate || 0
    displayData.totalOutings = props.data.data.totalOutings || 0

    generateActivityList()
    generateTrendData()
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.external-display-detail {
  width: 100%;
}

// 预览模式样式
.preview-mode {
  .stats-overview {
    margin-bottom: var(--van-padding-md);

    .stat-row {
      display: flex;
      gap: var(--van-padding-md);

      .stat-item {
        flex: 1;
        text-align: center;
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-radius-md);

        .stat-label {
          display: block;
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: var(--van-padding-xs);
        }

        .stat-value {
          font-size: var(--text-lg);
          font-weight: 600;

          &.primary {
            color: var(--van-primary-color);
          }

          &.success {
            color: var(--van-success-color);
          }
        }
      }
    }
  }

  .recent-activities-preview {
    .preview-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-sm) 0;
    }

    .activity-list {
      .activity-item-mini {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--van-padding-sm) 0;

        .activity-info {
          flex: 1;

          .activity-name {
            display: block;
            font-size: var(--text-sm);
            color: var(--van-text-color);
            margin-bottom: 2px;
          }

          .activity-date {
            font-size: 11px;
            color: var(--van-text-color-3);
          }
        }
      }
    }
  }
}

// 完整模式样式
.full-mode {
  .overview-section {
    margin-bottom: var(--van-padding-lg);

    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-md) 0;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--van-padding-md);

      .overview-card {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);
        padding: var(--van-padding-md);
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        &.primary {
          background: rgba(64, 158, 255, 0.1);
          color: var(--text-primary);
        }

        &.success {
          background: rgba(103, 194, 58, 0.1);
          color: var(--text-primary);
        }

        &.warning {
          background: rgba(230, 162, 60, 0.1);
          color: var(--text-primary);
        }

        .card-content {
          .card-value {
            font-size: var(--text-lg);
            font-weight: 600;
            line-height: 1.2;
          }

          .card-label {
            font-size: 11px;
            opacity: 0.8;
          }
        }
      }
    }
  }

  .activities-section {
    margin-bottom: var(--van-padding-lg);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-md);

      .section-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin: 0;
      }
    }

    .activity-card {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      margin-bottom: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .activity-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--van-padding-md);

        .activity-info {
          flex: 1;

          .activity-name {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color);
            margin: 0 0 var(--van-padding-xs) 0;
          }

          .activity-meta {
            display: flex;
            align-items: center;
            gap: var(--van-padding-sm);

            .activity-date {
              font-size: var(--text-xs);
              color: var(--van-text-color-3);
            }
          }
        }

        .achievement-rate {
          text-align: center;
          min-width: 60px;

          .rate-value {
            display: block;
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-primary-color);
            margin-bottom: var(--van-padding-xs);
          }
        }
      }

      .activity-details {
        margin-bottom: var(--van-padding-md);

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--van-padding-xs);

          .detail-item {
            .detail-label {
              font-size: var(--text-xs);
              color: var(--van-text-color-3);
              margin-right: var(--van-padding-xs);
            }

            .detail-value {
              font-size: var(--text-xs);
              color: var(--van-text-color);
              font-weight: 500;
            }
          }
        }
      }

      .activity-actions {
        display: flex;
        gap: var(--van-padding-sm);
        justify-content: flex-end;
        padding-top: var(--van-padding-sm);
        border-top: 1px solid var(--van-border-color);
      }
    }
  }

  .chart-section {
    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-md) 0;
    }

    .chart-container {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-lg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      height: 200px;
      position: relative;

      .trend-chart {
        width: 100%;
        height: 100%;
        position: relative;
        background: linear-gradient(to top, rgba(64, 158, 255, 0.05) 0%, transparent 100%);
        border-radius: var(--van-radius-md);

        .chart-point {
          position: absolute;
          transform: translateX(-50%);

          .point-dot {
            width: 8px;
            height: 8px;
            background: var(--van-primary-color);
            border-radius: 50%;
            margin: 0 auto 2px;
          }

          .point-label {
            font-size: 10px;
            color: var(--van-text-color-2);
            text-align: center;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

// 创建弹窗样式
.create-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-lg) var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-md);

    .dialog-actions {
      margin-top: var(--van-padding-lg);
      padding: var(--van-padding-md);
    }
  }
}
</style>