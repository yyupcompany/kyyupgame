<template>
  <div class="attendance-history-tab">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <van-card>
        <template #title>
          <div class="filter-title">
            <van-icon name="orders-o" />
            历史记录查询
          </div>
        </template>
        
        <div class="filter-content">
          <van-field
            v-model="filterForm.typeText"
            name="type"
            label="记录类型"
            placeholder="请选择记录类型"
            readonly
            is-link
            @click="showTypePicker = true"
          />
          
          <van-field
            v-if="filterForm.type === 'student'"
            v-model="filterForm.classIdText"
            name="classId"
            label="班级"
            placeholder="请选择班级"
            readonly
            is-link
            @click="showClassPicker = true"
          />
          
          <van-field
            v-if="filterForm.type === 'student' && filterForm.classId"
            v-model="filterForm.studentIdText"
            name="studentId"
            label="学生"
            placeholder="全部学生"
            readonly
            is-link
            @click="showStudentPicker = true"
          />
          
          <van-field
            v-model="filterForm.dateRangeText"
            name="dateRange"
            label="时间范围"
            placeholder="选择时间范围"
            readonly
            is-link
            @click="showDatePicker = true"
          />
          
          <van-field
            v-model="filterForm.statusText"
            name="status"
            label="考勤状态"
            placeholder="全部状态"
            readonly
            is-link
            @click="showStatusPicker = true"
          />
          
          <div class="filter-actions">
            <van-button type="primary" size="small" @click="loadHistory" :loading="loading">
              查询
            </van-button>
            <van-button size="small" @click="resetFilter">
              重置
            </van-button>
            <van-button type="success" size="small" @click="handleExport" :loading="exporting">
              导出
            </van-button>
          </div>
        </div>
      </van-card>
    </div>

    <!-- 教师考勤历史 -->
    <div v-if="filterForm.type === 'teacher'" class="teacher-history">
      <van-card>
        <template #title>
          <div class="history-title">
            <van-icon name="user-o" />
            教师考勤历史
            <van-tag type="primary" size="small">{{ pagination.total }}条</van-tag>
          </div>
        </template>
        
        <div class="history-content">
          <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>
          
          <div v-else-if="teacherHistory.length === 0" class="empty-state">
            <van-empty description="暂无考勤记录" />
          </div>
          
          <div v-else class="history-list">
            <van-cell-group>
              <van-swipe-cell v-for="record in teacherHistory" :key="record.id">
                <van-cell
                  :title="record.attendanceDate"
                  is-link
                  @click="showRecordDetail(record)"
                >
                  <template #label>
                    <div class="record-info">
                      <span>签到: {{ record.checkInTime || '--:--' }}</span>
                      <span class="divider">|</span>
                      <span>签退: {{ record.checkOutTime || '--:--' }}</span>
                      <span class="divider">|</span>
                      <span>工作时长: {{ record.workDuration || '--' }}</span>
                    </div>
                  </template>
                  
                  <template #value>
                    <van-tag :type="getStatusType(record.status)" size="medium">
                      {{ getStatusLabel(record.status) }}
                    </van-tag>
                  </template>
                </van-cell>
                
                <template #right>
                  <van-button
                    square
                    type="primary"
                    text="详情"
                    @click="showRecordDetail(record)"
                  />
                </template>
              </van-swipe-cell>
            </van-cell-group>
          </div>
          
          <!-- 分页 -->
          <van-pagination
            v-model:current-page="pagination.page"
            :total-items="pagination.total"
            :items-per-page="pagination.pageSize"
            @change="loadHistory"
            force-ellipses
            v-if="pagination.total > 0"
          />
        </div>
      </van-card>
    </div>

    <!-- 学生考勤历史 -->
    <div v-if="filterForm.type === 'student'" class="student-history">
      <van-card>
        <template #title>
          <div class="history-title">
            <van-icon name="friends-o" />
            学生考勤历史
            <van-tag type="primary" size="small">{{ pagination.total }}条</van-tag>
          </div>
        </template>
        
        <div class="history-content">
          <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>
          
          <div v-else-if="studentHistory.length === 0" class="empty-state">
            <van-empty description="暂无考勤记录" />
          </div>
          
          <div v-else class="history-list">
            <van-cell-group>
              <van-swipe-cell v-for="record in studentHistory" :key="record.id">
                <van-cell
                  :title="record.studentName"
                  :label="`${record.className} | ${record.attendanceDate}`"
                  is-link
                  @click="showRecordDetail(record)"
                >
                  <template #icon>
                    <van-image
                      :src="record.avatar"
                      class="student-avatar"
                      round
                      width="40"
                      height="40"
                    >
                      <template #error>
                        <div class="avatar-placeholder">
                          {{ record.studentName?.charAt(0) }}
                        </div>
                      </template>
                    </van-image>
                  </template>
                  
                  <template #value>
                    <div class="record-status">
                      <van-tag :type="getStatusType(record.status)" size="small">
                        {{ getStatusLabel(record.status) }}
                      </van-tag>
                      <div v-if="record.temperature && record.temperature > 37.3" class="temp-warning">
                        <van-icon name="warning-o" color="#ee0a24" />
                        <span>{{ record.temperature }}°C</span>
                      </div>
                    </div>
                  </template>
                </van-cell>
                
                <template #right>
                  <van-button
                    square
                    type="primary"
                    text="详情"
                    @click="showRecordDetail(record)"
                  />
                </template>
              </van-swipe-cell>
            </van-cell-group>
          </div>
          
          <!-- 分页 -->
          <van-pagination
            v-model:current-page="pagination.page"
            :total-items="pagination.total"
            :items-per-page="pagination.pageSize"
            @change="loadHistory"
            force-ellipses
            v-if="pagination.total > 0"
          />
        </div>
      </van-card>
    </div>

    <!-- 选择器弹窗 -->
    <!-- 记录类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <!-- 学生选择器 -->
    <van-popup v-model:show="showStudentPicker" position="bottom">
      <van-picker
        :columns="studentColumns"
        @confirm="onStudentConfirm"
        @cancel="showStudentPicker = false"
      />
    </van-popup>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>

    <!-- 日期范围选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-calendar
        v-model="filterForm.dateRange"
        type="range"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 记录详情弹窗 -->
    <van-popup v-model:show="showDetailDialog" position="bottom" round>
      <div class="detail-dialog">
        <div class="dialog-header">
          <van-button type="default" size="small" @click="showDetailDialog = false">
            关闭
          </van-button>
          <span class="dialog-title">考勤记录详情</span>
          <van-button type="primary" size="small" @click="shareRecord">
            分享
          </van-button>
        </div>
        
        <div class="dialog-content">
          <van-cell-group>
            <van-cell title="日期" :value="currentRecord.attendanceDate" />
            <van-cell 
              v-if="filterForm.type === 'student'"
              title="学生姓名" 
              :value="currentRecord.studentName" 
            />
            <van-cell 
              v-if="filterForm.type === 'student'"
              title="班级" 
              :value="currentRecord.className" 
            />
            <van-cell title="考勤状态">
              <template #value>
                <van-tag :type="getStatusType(currentRecord.status)">
                  {{ getStatusLabel(currentRecord.status) }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="签到时间" :value="currentRecord.checkInTime || '--:--'" />
            <van-cell title="签退时间" :value="currentRecord.checkOutTime || '--:--'" />
            <van-cell 
              v-if="filterForm.type === 'teacher'"
              title="工作时长" 
              :value="currentRecord.workDuration || '--'" 
            />
            <van-cell 
              v-if="filterForm.type === 'student'"
              title="体温" 
              :value="currentRecord.temperature ? `${currentRecord.temperature}°C` : '--'"
            />
            <van-cell 
              v-if="filterForm.type === 'student'"
              title="健康状态" 
              :value="getHealthStatusText(currentRecord.healthStatus)" 
            />
            <van-cell 
              v-if="filterForm.type === 'teacher'"
              title="请假类型" 
              :value="getLeaveTypeLabel(currentRecord.leaveType)" 
            />
            <van-cell title="备注" :value="currentRecord.notes || '无'" />
            <van-cell title="记录时间" :value="formatDateTime(currentRecord.createdAt)" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import {
  getTeacherClasses,
  getClassStudents,
  getAttendanceRecords,
  exportAttendance,
  type ClassInfo,
  type StudentInfo,
} from '@/api/modules/attendance'
import { getTeacherHistory } from '@/api/modules/teacher-checkin'

// ==================== 数据定义 ====================

const emit = defineEmits<{
  refresh: []
}>()

const loading = ref(false)
const exporting = ref(false)
const showTypePicker = ref(false)
const showClassPicker = ref(false)
const showStudentPicker = ref(false)
const showStatusPicker = ref(false)
const showDatePicker = ref(false)
const showDetailDialog = ref(false)

// 最大日期（今天）
const maxDate = ref(new Date())

// 筛选表单
const filterForm = reactive({
  type: 'teacher' as 'teacher' | 'student',
  typeText: '教师考勤',
  classId: null as number | null,
  classIdText: '',
  studentId: null as number | null,
  studentIdText: '',
  dateRange: [] as Date[],
  dateRangeText: '',
  status: '',
  statusText: '',
})

// 选项数据
const typeColumns = [
  { text: '教师考勤', value: 'teacher' },
  { text: '学生考勤', value: 'student' },
]

const statusColumns = [
  { text: '全部状态', value: '' },
  { text: '出勤', value: 'PRESENT' },
  { text: '缺勤', value: 'ABSENT' },
  { text: '迟到', value: 'LATE' },
  { text: '早退', value: 'EARLY_LEAVE' },
  { text: '病假', value: 'SICK_LEAVE' },
  { text: '事假', value: 'PERSONAL_LEAVE' },
]

// 班级和学生列表
const classList = ref<ClassInfo[]>([])
const studentList = ref<StudentInfo[]>([])

const classColumns = computed(() => 
  classList.value.map(cls => ({ text: cls.name, value: cls.id }))
)

const studentColumns = computed(() => [
  { text: '全部学生', value: null },
  ...studentList.value.map(student => ({ 
    text: student.name, 
    value: student.id 
  }))
])

// 历史记录
const teacherHistory = ref<any[]>([])
const studentHistory = ref<any[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 当前查看的记录
const currentRecord = ref<any>({})

// ==================== 方法 ====================

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    PRESENT: 'success',
    LATE: 'warning',
    EARLY_LEAVE: 'warning',
    ABSENT: 'danger',
    SICK_LEAVE: 'default',
    PERSONAL_LEAVE: 'default',
    LEAVE: 'default',
  }
  return typeMap[status] || ''
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    PRESENT: '出勤',
    LATE: '迟到',
    EARLY_LEAVE: '早退',
    ABSENT: '缺勤',
    SICK_LEAVE: '病假',
    PERSONAL_LEAVE: '事假',
    LEAVE: '请假',
  }
  return labelMap[status] || status
}

// 获取健康状态文本
const getHealthStatusText = (status?: string) => {
  const labelMap: Record<string, string> = {
    NORMAL: '正常',
    FEVER: '发烧',
    COUGH: '咳嗽',
    COLD: '感冒',
    OTHER: '其他',
  }
  return labelMap[status || ''] || '--'
}

// 获取请假类型标签
const getLeaveTypeLabel = (type?: string) => {
  const labelMap: Record<string, string> = {
    SICK: '病假',
    PERSONAL: '事假',
    ANNUAL: '年假',
    MATERNITY: '产假',
  }
  return labelMap[type || ''] || '--'
}

// 格式化日期时间
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 加载班级列表
const loadClasses = async () => {
  try {
    const response = await getTeacherClasses()
    if (response.success && response.data) {
      classList.value = response.data
    }
  } catch (error) {
    console.error('加载班级列表失败:', error)
    showToast('加载班级列表失败')
  }
}

// 加载学生列表
const loadStudents = async () => {
  if (!filterForm.classId) {
    studentList.value = []
    return
  }

  try {
    const response = await getClassStudents(filterForm.classId)
    if (response.success && response.data) {
      studentList.value = response.data
    }
  } catch (error) {
    console.error('加载学生列表失败:', error)
    showToast('加载学生列表失败')
  }
}

// 加载历史记录
const loadHistory = async () => {
  loading.value = true
  try {
    if (filterForm.type === 'teacher') {
      await loadTeacherHistory()
    } else {
      await loadStudentHistory()
    }
  } finally {
    loading.value = false
  }
}

// 加载教师考勤历史
const loadTeacherHistory = async () => {
  try {
    // TODO: 调用API加载教师考勤历史
    // const teacherId = userStore.user?.teacherId || 0
    // const response = await getTeacherHistory({
    //   teacherId,
    //   startDate: filterForm.dateRange[0]?.toISOString().split('T')[0],
    //   endDate: filterForm.dateRange[1]?.toISOString().split('T')[0],
    //   status: filterForm.status,
    //   page: pagination.page,
    //   pageSize: pagination.pageSize,
    // })
    
    // Mock数据
    teacherHistory.value = [
      {
        id: 1,
        attendanceDate: '2024-01-15',
        checkInTime: '08:45:00',
        checkOutTime: '18:30:00',
        workDuration: '9小时45分钟',
        status: 'PRESENT',
        notes: '',
        createdAt: '2024-01-15T08:45:00Z',
      },
      {
        id: 2,
        attendanceDate: '2024-01-14',
        checkInTime: '09:15:00',
        checkOutTime: '18:00:00',
        workDuration: '8小时45分钟',
        status: 'LATE',
        notes: '交通拥堵',
        createdAt: '2024-01-14T09:15:00Z',
      },
    ]
    
    pagination.total = teacherHistory.value.length
  } catch (error) {
    console.error('加载教师考勤历史失败:', error)
    showToast('加载教师考勤历史失败')
  }
}

// 加载学生考勤历史
const loadStudentHistory = async () => {
  if (!filterForm.classId) {
    showToast('请先选择班级')
    return
  }

  try {
    const [startDate, endDate] = filterForm.dateRange
    const response = await getAttendanceRecords({
      classId: filterForm.classId,
      studentId: filterForm.studentId || undefined,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: filterForm.status as any,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })

    if (response.success && response.data) {
      studentHistory.value = response.data.rows
      pagination.total = response.data.count
    }
  } catch (error) {
    console.error('加载学生考勤历史失败:', error)
    showToast('加载学生考勤历史失败')
  }
}

// 记录类型确认
const onTypeConfirm = ({ selectedValues }: any) => {
  filterForm.type = selectedValues[0]
  const column = typeColumns.find(c => c.value === selectedValues[0])
  filterForm.typeText = column?.text || ''
  showTypePicker.value = false
  
  // 切换类型时重置学生选择
  filterForm.studentId = null
  filterForm.studentIdText = ''
}

// 班级确认
const onClassConfirm = ({ selectedValues }: any) => {
  filterForm.classId = selectedValues[0]
  const column = classColumns.value.find(c => c.value === selectedValues[0])
  filterForm.classIdText = column?.text || ''
  showClassPicker.value = false
  
  // 重置学生选择
  filterForm.studentId = null
  filterForm.studentIdText = ''
}

// 学生确认
const onStudentConfirm = ({ selectedValues }: any) => {
  filterForm.studentId = selectedValues[0]
  const column = studentColumns.value.find(c => c.value === selectedValues[0])
  filterForm.studentIdText = column?.text || ''
  showStudentPicker.value = false
}

// 状态确认
const onStatusConfirm = ({ selectedValues }: any) => {
  filterForm.status = selectedValues[0]
  const column = statusColumns.find(c => c.value === selectedValues[0])
  filterForm.statusText = column?.text || ''
  showStatusPicker.value = false
}

// 日期确认
const onDateConfirm = (dates: Date[]) => {
  filterForm.dateRange = dates
  if (dates.length === 2) {
    const startText = dates[0].toLocaleDateString('zh-CN')
    const endText = dates[1].toLocaleDateString('zh-CN')
    filterForm.dateRangeText = `${startText} - ${endText}`
  }
  showDatePicker.value = false
}

// 重置筛选
const resetFilter = () => {
  filterForm.classId = null
  filterForm.classIdText = ''
  filterForm.studentId = null
  filterForm.studentIdText = ''
  filterForm.dateRange = []
  filterForm.dateRangeText = ''
  filterForm.status = ''
  filterForm.statusText = ''
  pagination.page = 1
  
  // 重置默认时间范围
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)
  filterForm.dateRange = [startDate, endDate]
  filterForm.dateRangeText = `${startDate.toLocaleDateString('zh-CN')} - ${endDate.toLocaleDateString('zh-CN')}`
  
  loadHistory()
}

// 导出
const handleExport = async () => {
  if (filterForm.type === 'student' && !filterForm.classId) {
    showToast('请先选择班级')
    return
  }

  try {
    exporting.value = true
    const [startDate, endDate] = filterForm.dateRange

    const response = await exportAttendance({
      classId: filterForm.classId || 0,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      format: 'excel',
    })

    if (response.success && response.data) {
      showToast('导出成功')
      // 模拟下载
      window.open(response.data.url, '_blank')
    }
  } catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败')
  } finally {
    exporting.value = false
  }
}

// 显示记录详情
const showRecordDetail = (record: any) => {
  currentRecord.value = { ...record }
  showDetailDialog.value = true
}

// 分享记录
const shareRecord = async () => {
  try {
    // 模拟分享功能
    await navigator.share({
      title: '考勤记录',
      text: `${currentRecord.value.studentName || '教师'} - ${currentRecord.value.attendanceDate} - ${getStatusLabel(currentRecord.value.status)}`,
    })
    showToast('分享成功')
  } catch (error) {
    // 复制到剪贴板
    const text = `${currentRecord.value.studentName || '教师'} - ${currentRecord.value.attendanceDate} - ${getStatusLabel(currentRecord.value.status)}`
    navigator.clipboard.writeText(text)
    showToast('已复制到剪贴板')
  }
}

// ==================== 监听 ====================

watch(() => filterForm.classId, () => {
  filterForm.studentId = null
  filterForm.studentIdText = ''
  loadStudents()
})

// ==================== 生命周期 ====================

onMounted(() => {
  // 设置默认时间范围（最近30天）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)
  filterForm.dateRange = [startDate, endDate]
  filterForm.dateRangeText = `${startDate.toLocaleDateString('zh-CN')} - ${endDate.toLocaleDateString('zh-CN')}`
  
  loadClasses()
  loadHistory()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.attendance-history-tab {
  padding: var(--van-padding-md);

  .filter-section,
  .teacher-history,
  .student-history {
    margin-bottom: var(--van-padding-md);
  }

  .filter-title,
  .history-title {
    display: flex;
    align-items: center;
    font-size: var(--van-font-size-lg);
    font-weight: var(--van-font-weight-bold);
    
    .van-icon {
      margin-right: var(--van-padding-xs);
      color: var(--van-primary-color);
    }
    
    .van-tag {
      margin-left: var(--van-padding-sm);
    }
  }

  .filter-content {
    .filter-actions {
      display: flex;
      gap: var(--van-padding-sm);
      margin-top: var(--van-padding-md);
    }
  }

  .history-content {
    .empty-state {
      padding: var(--van-padding-xl) 0;
      text-align: center;
    }

    .history-list {
      .record-info {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        font-size: var(--van-font-size-sm);
        color: var(--van-gray-6);

        .divider {
          color: var(--van-gray-4);
        }
      }

      .student-avatar {
        margin-right: var(--van-padding-sm);

        .avatar-placeholder {
          width: 40px;
          height: 40px;
          background: var(--van-primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: var(--van-font-weight-bold);
        }
      }

      .record-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--van-padding-xs);

        .temp-warning {
          display: flex;
          align-items: center;
          gap: 2px;
          color: var(--text-primary);
          font-size: var(--van-font-size-xs);
        }
      }
    }
  }

  .detail-dialog {
    max-height: 80vh;
    overflow-y: auto;

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--van-padding-md);
      border-bottom: 1px solid var(--van-border-color);

      .dialog-title {
        font-size: var(--van-font-size-md);
        font-weight: var(--van-font-weight-bold);
        flex: 1;
        text-align: center;
      }
    }

    .dialog-content {
      padding: var(--van-padding-md);
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .attendance-history-tab {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>