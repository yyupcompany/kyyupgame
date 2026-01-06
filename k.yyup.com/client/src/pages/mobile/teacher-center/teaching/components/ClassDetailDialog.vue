<template>
  <van-popup
    v-model:show="dialogVisible"
    position="right"
    :style="{ width: '100%', height: '100%' }"
    round
  >
    <div class="mobile-class-detail" v-loading="loading">
      <!-- 头部 -->
      <div class="detail-header">
        <van-nav-bar
          :title="dialogTitle"
          left-text="返回"
          left-arrow
          @click-left="handleClose"
        >
          <template #right>
            <van-icon name="replay" @click="refreshDetail" />
          </template>
        </van-nav-bar>
      </div>

      <!-- 班级基本信息 -->
      <div class="class-info-section">
        <van-cell-group inset>
          <van-cell title="班级名称" :value="classData?.class_name || '--'" />
          <van-cell title="学生人数" :value="`${classData?.current_student_count || 0}人`" />
        </van-cell-group>
      </div>

      <!-- Tab切换 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <!-- 学生达标情况 -->
        <van-tab title="学生达标" name="students">
          <div class="tab-content">
            <div
              v-for="student in studentsList"
              :key="student.student_id"
              class="student-item"
            >
              <div class="student-info">
                <div class="student-avatar">
                  <img
                    v-if="student.photo_url"
                    :src="student.photo_url"
                    :alt="student.student_name"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ student.student_name?.charAt(0) || '?' }}
                  </div>
                </div>
                <div class="student-details">
                  <div class="student-name">{{ student.student_name }}</div>
                  <div class="student-no">学号：{{ student.student_no }}</div>
                </div>
              </div>
              <div class="student-progress">
                <div class="achievement-rate">{{ student.achievement_rate || 0 }}%</div>
                <van-progress
                  :percentage="student.achievement_rate || 0"
                  :show-pivot="false"
                  stroke-width="4"
                  :color="getProgressColor(student.achievement_rate || 0)"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <van-empty
              v-if="studentsList.length === 0 && !loading"
              description="暂无学生数据"
            />
          </div>
        </van-tab>

        <!-- 户外训练记录 -->
        <van-tab title="户外训练" name="outdoor">
          <div class="tab-content">
            <div
              v-for="record in trainingRecords"
              :key="record.id"
              class="record-item"
            >
              <div class="record-info">
                <div class="record-title">
                  第{{ record.week_number }}周 - {{ record.training_type === 'outdoor_training' ? '户外训练' : '离园展示' }}
                </div>
                <div class="record-date">{{ record.training_date }}</div>
                <div class="record-location" v-if="record.location">地点：{{ record.location }}</div>
              </div>
              <div class="record-stats">
                <div class="attendance">参与：{{ record.attendance_count }}人</div>
                <div class="achievement">达标：{{ record.target_achieved_count }}人</div>
                <div class="rate">{{ record.achievement_rate }}%</div>
              </div>
            </div>

            <!-- 空状态 -->
            <van-empty
              v-if="trainingRecords.length === 0 && !loading"
              description="暂无训练记录"
            />
          </div>
        </van-tab>

        <!-- 校外展示记录 -->
        <van-tab title="校外展示" name="external">
          <div class="tab-content">
            <div
              v-for="record in displayRecords"
              :key="record.id"
              class="record-item"
            >
              <div class="record-info">
                <div class="record-title">{{ record.activity_name }}</div>
                <div class="record-date">{{ record.activity_date }}</div>
                <div class="record-location">{{ record.location }}</div>
                <div class="record-type">{{ record.activity_type }}</div>
              </div>
              <div class="record-stats">
                <div class="participants">{{ record.participant_count }}人参与</div>
                <div class="achievement-level">{{ record.achievement_level }}</div>
                <div class="rate">{{ record.achievement_rate }}%</div>
              </div>
            </div>

            <!-- 空状态 -->
            <van-empty
              v-if="displayRecords.length === 0 && !loading"
              description="暂无展示记录"
            />
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'

interface Props {
  modelValue: boolean
  classData: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

// 响应式数据
const loading = ref(false)
const activeTab = ref('students')
const studentsList = ref([])
const trainingRecords = ref([])
const displayRecords = ref([])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  return props.classData?.class_name || '班级详情'
})

// 监听弹窗显示状态
watch(() => props.modelValue, (visible) => {
  if (visible && props.classData) {
    activeTab.value = 'students'
    loadDetailData()
  }
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const refreshDetail = () => {
  loadDetailData()
}

const getProgressColor = (rate: number) => {
  if (rate >= 80) return '#07c160'
  if (rate >= 60) return '#ff976a'
  return '#ee0a24'
}

const loadDetailData = async () => {
  if (!props.classData?.class_id) return

  try {
    loading.value = true

    // 先加载学生数据（默认tab）
    await loadStudentsData()
  } catch (error) {
    console.error('加载详情数据失败:', error)
    showToast('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadStudentsData = async () => {
  const response = await teachingCenterApi.getClassDetailedProgress(props.classData.class_id)
  if (response.success) {
    studentsList.value = response.data.students || []
  }
}

const loadTrainingRecords = async () => {
  const response = await teachingCenterApi.getClassOutdoorTrainingDetails(props.classData.class_id)
  if (response.success) {
    trainingRecords.value = response.data.training_records || []
  }
}

const loadDisplayRecords = async () => {
  const response = await teachingCenterApi.getClassExternalDisplayDetails(props.classData.class_id)
  if (response.success) {
    displayRecords.value = response.data.display_records || []
  }
}

// 监听tab切换，加载对应数据
watch(activeTab, (newTab) => {
  if (!props.classData?.class_id) return

  switch (newTab) {
    case 'students':
      // 学生数据已在初始加载时获取
      break
    case 'outdoor':
      loadTrainingRecords()
      break
    case 'external':
      loadDisplayRecords()
      break
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-class-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;

  .detail-header {
    flex-shrink: 0;
    background: white;
    border-bottom: 1px solid #eee;
  }

  .class-info-section {
    flex-shrink: 0;
    padding: var(--spacing-md) 0;
    background: white;
  }

  :deep(.van-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .van-tabs__wrap {
      flex-shrink: 0;
    }

    .van-tabs__content {
      flex: 1;
      overflow-y: auto;
    }
  }

  .tab-content {
    padding: var(--spacing-md);
  }

  .student-item,
  .record-item {
    background: white;
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .student-item {
    .student-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;

      .student-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: var(--text-base);
        }
      }

      .student-details {
        .student-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .student-no {
          font-size: var(--text-xs);
          color: #666;
        }
      }
    }

    .student-progress {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--spacing-xs);
      min-width: 60px;

      .achievement-rate {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--primary-color);
      }

      .van-progress {
        width: 60px;
      }
    }
  }

  .record-item {
    flex-direction: column;
    align-items: flex-start;

    .record-info {
      width: 100%;
      margin-bottom: 8px;

      .record-title {
        font-size: var(--text-sm);
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .record-date {
        font-size: var(--text-xs);
        color: #666;
        margin-bottom: 2px;
      }

      .record-location,
      .record-type {
        font-size: var(--text-xs);
        color: #999;
      }
    }

    .record-stats {
      width: 100%;
      display: flex;
      gap: var(--spacing-md);
      padding-top: 8px;
      border-top: 1px solid #eee;

      > div {
        font-size: var(--text-xs);
        color: #666;
      }

      .rate {
        margin-left: auto;
        font-size: var(--text-sm);
        font-weight: 600;
        color: #07c160;
      }

      .achievement-level {
        color: #ff976a;
      }
    }
  }
}
</style>
