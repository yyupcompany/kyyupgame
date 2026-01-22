<template>
  <MobileSubPageLayout title="教学工作" back-path="/mobile/teacher-center">
    <div class="teaching-page">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card" style="--card-color: var(--primary-color)">
          <div class="stat-value">{{ courseStats.total }}</div>
          <div class="stat-label">总课程</div>
        </div>
        <div class="stat-card" style="--card-color: var(--success-color)">
          <div class="stat-value">{{ courseStats.inProgress }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-card" style="--card-color: var(--warning-color)">
          <div class="stat-value">{{ courseStats.weekRecords }}</div>
          <div class="stat-label">本周记录</div>
        </div>
        <div class="stat-card" style="--card-color: var(--danger-color)">
          <div class="stat-value">{{ courseStats.avgProgress }}%</div>
          <div class="stat-label">平均完成</div>
        </div>
      </div>

      <!-- 筛选 -->
      <van-dropdown-menu>
        <van-dropdown-item v-model="statusFilter" :options="statusOptions" @change="loadCourses" />
        <van-dropdown-item v-model="classFilter" :options="classOptions" @change="loadCourses" />
      </van-dropdown-menu>

      <!-- 课程列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadCourses"
        >
          <div v-if="coursesList.length === 0 && !loading" class="empty-state">
            <van-empty description="暂无课程数据" />
          </div>
          <div v-else class="course-list">
            <div
              v-for="course in coursesList"
              :key="course.id"
              class="course-card"
              @click="handleViewDetail(course)"
            >
              <div class="course-header">
                <div class="course-title">{{ course.name }}</div>
                <van-tag :type="getStatusType(course.status)">{{ getStatusText(course.status) }}</van-tag>
              </div>
              <div class="course-info">
                <div class="info-item">
                  <van-icon name="friends-o" />
                  <span>{{ course.className }}</span>
                </div>
                <div class="info-item">
                  <van-icon name="clock-o" />
                  <span>{{ course.totalHours }}课时</span>
                </div>
              </div>
              <div class="course-progress">
                <div class="progress-label">
                  <span>教学进度</span>
                  <span>{{ course.progress }}%</span>
                </div>
                <van-progress :percentage="course.progress" :show-pivot="false" stroke-width="6" />
              </div>
              <div class="course-footer">
                <span class="record-count">{{ course.recordCount }}条记录</span>
                <van-button size="small" type="primary" @click.stop="handleAddRecord(course)">
                  添加记录
                </van-button>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 课程详情弹窗 -->
      <van-popup v-model:show="detailVisible" position="bottom" round :style="{ height: '80%' }">
        <div class="detail-popup">
          <div class="popup-header">
            <span>课程详情</span>
            <van-icon name="cross" @click="detailVisible = false" />
          </div>
          <div v-if="currentCourse" class="popup-content">
            <van-cell-group inset>
              <van-cell title="课程名称" :value="currentCourse.name" />
              <van-cell title="所属班级" :value="currentCourse.className" />
              <van-cell title="总课时" :value="currentCourse.totalHours + '课时'" />
              <van-cell title="已完成" :value="currentCourse.completedHours + '课时'" />
              <van-cell title="进度" :value="currentCourse.progress + '%'" />
              <van-cell title="状态">
                <template #value>
                  <van-tag :type="getStatusType(currentCourse.status)">{{ getStatusText(currentCourse.status) }}</van-tag>
                </template>
              </van-cell>
            </van-cell-group>
            
            <div class="detail-section">
              <div class="section-title">教学记录</div>
              <div v-if="currentCourse.records?.length" class="record-list">
                <div v-for="record in currentCourse.records" :key="record.id" class="record-item">
                  <div class="record-date">{{ record.date }}</div>
                  <div class="record-content">{{ record.content }}</div>
                  <div v-if="record.note" class="record-note">备注：{{ record.note }}</div>
                </div>
              </div>
              <van-empty v-else description="暂无教学记录" image-size="80" />
            </div>

            <div class="detail-actions">
              <van-button type="primary" block @click="handleAddRecord(currentCourse)">添加教学记录</van-button>
              <van-button block @click="showStatusPicker = true">更新状态</van-button>
            </div>
          </div>
        </div>
      </van-popup>

      <!-- 添加记录弹窗 -->
      <van-popup v-model:show="recordVisible" position="bottom" round :style="{ height: '60%' }">
        <div class="record-popup">
          <div class="popup-header">
            <span>添加教学记录</span>
            <van-icon name="cross" @click="recordVisible = false" />
          </div>
          <div class="popup-content">
            <van-form @submit="onSubmitRecord">
              <van-cell-group inset>
                <van-field
                  v-model="recordForm.date"
                  is-link
                  readonly
                  label="上课日期"
                  placeholder="选择日期"
                  @click="showDatePicker = true"
                />
                <van-field
                  v-model="recordForm.content"
                  type="textarea"
                  label="教学内容"
                  placeholder="请输入本次教学内容"
                  rows="3"
                  required
                  :rules="[{ required: true, message: '请输入教学内容' }]"
                />
                <van-field
                  v-model="recordForm.hours"
                  type="digit"
                  label="课时数"
                  placeholder="请输入课时数"
                />
                <van-field
                  v-model="recordForm.note"
                  type="textarea"
                  label="备注"
                  placeholder="其他备注信息"
                  rows="2"
                />
              </van-cell-group>
              <div class="form-actions">
                <van-button block type="primary" native-type="submit">保存记录</van-button>
              </div>
            </van-form>
          </div>
        </div>
      </van-popup>

      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom" round>
        <van-date-picker
          v-model="selectedDate"
          title="选择日期"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <!-- 状态选择器 -->
      <van-popup v-model:show="showStatusPicker" position="bottom" round>
        <van-picker
          :columns="statusPickerOptions"
          @confirm="onStatusConfirm"
          @cancel="showStatusPicker = false"
        />
      </van-popup>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

// 课程统计
const courseStats = reactive({
  total: 8,
  inProgress: 5,
  weekRecords: 12,
  avgProgress: 68
})

// 筛选
const statusFilter = ref('')
const classFilter = ref('')
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '进行中', value: 'in_progress' },
  { text: '已分配', value: 'assigned' },
  { text: '已完成', value: 'completed' },
  { text: '已暂停', value: 'paused' }
]
const classOptions = [
  { text: '全部班级', value: '' },
  { text: '小班一班', value: '1' },
  { text: '中班二班', value: '2' },
  { text: '大班三班', value: '3' }
]

// 列表状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 课程列表
const coursesList = ref<any[]>([])

// 弹窗状态
const detailVisible = ref(false)
const recordVisible = ref(false)
const showDatePicker = ref(false)
const showStatusPicker = ref(false)
const currentCourse = ref<any>(null)

// 记录表单
const recordForm = reactive({
  date: '',
  content: '',
  hours: '',
  note: ''
})
const selectedDate = ref(['2025', '01', '07'])

const statusPickerOptions = [
  { text: '进行中', value: 'in_progress' },
  { text: '已分配', value: 'assigned' },
  { text: '已完成', value: 'completed' },
  { text: '已暂停', value: 'paused' }
]

// 模拟数据
const mockCourses = [
  {
    id: 1,
    name: '幼儿启蒙英语',
    className: '小班一班',
    status: 'in_progress',
    totalHours: 32,
    completedHours: 20,
    progress: 63,
    recordCount: 8,
    records: [
      { id: 1, date: '2025-01-06', content: '学习字母A-E的发音和书写', note: '学生积极性很高' },
      { id: 2, date: '2025-01-04', content: '复习数字1-10的英语表达', note: '' }
    ]
  },
  {
    id: 2,
    name: '趣味数学',
    className: '中班二班',
    status: 'in_progress',
    totalHours: 24,
    completedHours: 18,
    progress: 75,
    recordCount: 6,
    records: []
  },
  {
    id: 3,
    name: '艺术手工',
    className: '大班三班',
    status: 'assigned',
    totalHours: 16,
    completedHours: 0,
    progress: 0,
    recordCount: 0,
    records: []
  },
  {
    id: 4,
    name: '音乐启蒙',
    className: '小班一班',
    status: 'completed',
    totalHours: 20,
    completedHours: 20,
    progress: 100,
    recordCount: 10,
    records: []
  }
]

// 获取状态样式
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    in_progress: 'primary',
    assigned: 'warning',
    completed: 'success',
    paused: 'default'
  }
  return map[status] || 'default'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    in_progress: '进行中',
    assigned: '已分配',
    completed: '已完成',
    paused: '已暂停'
  }
  return map[status] || '未知'
}

// 加载课程
const loadCourses = () => {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockCourses]
    if (statusFilter.value) {
      filtered = filtered.filter(c => c.status === statusFilter.value)
    }
    if (classFilter.value) {
      const classMap: Record<string, string> = { '1': '小班一班', '2': '中班二班', '3': '大班三班' }
      filtered = filtered.filter(c => c.className === classMap[classFilter.value])
    }
    coursesList.value = filtered
    loading.value = false
    finished.value = true
  }, 500)
}

// 下拉刷新
const onRefresh = () => {
  finished.value = false
  loadCourses()
  refreshing.value = false
  showToast('刷新成功')
}

// 查看详情
const handleViewDetail = (course: any) => {
  currentCourse.value = course
  detailVisible.value = true
}

// 添加记录
const handleAddRecord = (course: any) => {
  currentCourse.value = course
  recordForm.date = new Date().toISOString().split('T')[0]
  recordForm.content = ''
  recordForm.hours = ''
  recordForm.note = ''
  recordVisible.value = true
}

// 日期确认
const onDateConfirm = ({ selectedValues }: any) => {
  recordForm.date = selectedValues.join('-')
  showDatePicker.value = false
}

// 提交记录
const onSubmitRecord = () => {
  if (!recordForm.content) {
    showToast('请输入教学内容')
    return
  }
  showToast('教学记录添加成功')
  recordVisible.value = false
  loadCourses()
}

// 状态确认
const onStatusConfirm = ({ selectedValues }: any) => {
  if (currentCourse.value) {
    showToast(`状态已更新为: ${getStatusText(selectedValues[0])}`)
  }
  showStatusPicker.value = false
  detailVisible.value = false
  loadCourses()
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
.teaching-page {
  padding-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--white);
}

.stat-card {
  text-align: center;
  padding: 12px 8px;
  background: linear-gradient(135deg, var(--card-color) 0%, color-mix(in srgb, var(--card-color) 70%, white) 100%);
  border-radius: var(--spacing-sm);
  color: var(--white);

  .stat-value {
    font-size: var(--spacing-xl);
    font-weight: bold;
  }

  .stat-label {
    font-size: var(--spacing-md);
    margin-top: var(--spacing-xs);
    opacity: 0.9;
  }
}

.empty-state {
  padding: 40px 0;
}

.course-list {
  padding: var(--spacing-md);
}

.course-card {
  background: var(--white);
  border-radius: var(--spacing-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .course-title {
      font-size: var(--spacing-lg);
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .course-info {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-md);

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--spacing-lg);
      color: var(--text-secondary);
    }
  }

  .course-progress {
    margin-bottom: var(--spacing-md);

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: var(--spacing-md);
      color: var(--text-tertiary);
      margin-bottom: var(--spacing-sm);
    }
  }

  .course-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-light);

    .record-count {
      font-size: var(--spacing-md);
      color: var(--text-tertiary);
    }
  }
}

.detail-popup, .record-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--spacing-lg);
  font-weight: 600;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: var(--spacing-xl);
}

.detail-section {
  padding: var(--spacing-lg);

  .section-title {
    font-size: var(--spacing-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-sm);
    border-left: 3px solid var(--primary-color);
  }
}

.record-list {
  .record-item {
    background: var(--bg-page);
    border-radius: var(--spacing-sm);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .record-date {
      font-size: var(--spacing-md);
      color: var(--text-tertiary);
      margin-bottom: var(--spacing-sm);
    }

    .record-content {
      font-size: var(--spacing-lg);
      color: var(--text-primary);
      line-height: 1.5;
    }

    .record-note {
      font-size: var(--spacing-md);
      color: var(--text-secondary);
      margin-top: var(--spacing-sm);
      padding-top: var(--spacing-sm);
      border-top: 1px dashed var(--border-light);
    }
  }
}

.detail-actions, .form-actions {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>
