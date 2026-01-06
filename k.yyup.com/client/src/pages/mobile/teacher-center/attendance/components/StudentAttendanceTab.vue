<template>
  <div class="student-attendance-tab">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <van-card>
        <template #title>
          <div class="filter-title">
            <van-icon name="filter-o" />
            筛选条件
          </div>
        </template>
        
        <div class="filter-content">
          <van-field
            v-model="filterForm.classId"
            name="classId"
            label="班级"
            placeholder="请选择班级"
            readonly
            is-link
            @click="showClassPicker = true"
          />
          
          <van-field
            v-model="filterForm.dateText"
            name="date"
            label="日期"
            placeholder="选择日期"
            readonly
            is-link
            @click="showDatePicker = true"
          />
          
          <div class="filter-actions">
            <van-button type="primary" size="small" @click="loadAttendanceData" :loading="loading">
              查询
            </van-button>
            <van-button size="small" @click="resetFilter">
              重置
            </van-button>
          </div>
        </div>
      </van-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <van-row gutter="16">
        <van-col span="6">
          <van-card class="stat-card stat-total">
            <div class="stat-content">
              <div class="stat-icon">
                <van-icon name="friends-o" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalRecords }}</div>
                <div class="stat-label">总人数</div>
              </div>
            </div>
          </van-card>
        </van-col>

        <van-col span="6">
          <van-card class="stat-card stat-present">
            <div class="stat-content">
              <div class="stat-icon">
                <van-icon name="checked" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.presentCount }}</div>
                <div class="stat-label">出勤</div>
              </div>
            </div>
          </van-card>
        </van-col>

        <van-col span="6">
          <van-card class="stat-card stat-absent">
            <div class="stat-content">
              <div class="stat-icon">
                <van-icon name="close" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.absentCount }}</div>
                <div class="stat-label">缺勤</div>
              </div>
            </div>
          </van-card>
        </van-col>

        <van-col span="6">
          <van-card class="stat-card stat-rate">
            <div class="stat-content">
              <div class="stat-icon">
                <van-icon name="chart-trending-o" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.attendanceRate }}%</div>
                <div class="stat-label">出勤率</div>
              </div>
            </div>
          </van-card>
        </van-col>
      </van-row>
    </div>

    <!-- 操作区域 -->
    <div class="actions-section" v-if="filterForm.classId && isToday">
      <van-card>
        <div class="action-buttons">
          <van-button
            type="success"
            icon="passed"
            @click="handleBatchCheckIn"
            :loading="batchChecking"
            size="small"
          >
            批量签到
          </van-button>
          <van-button
            type="primary"
            icon="success"
            @click="handleSave"
            :loading="saving"
            size="small"
          >
            保存考勤
          </van-button>
        </div>
      </van-card>
    </div>

    <!-- 提示信息 -->
    <div v-if="!isToday && filterForm.classId" class="alert-section">
      <van-notice-bar
        left-icon="warning-o"
        type="warning"
        text="只能修改当天的考勤记录"
      />
    </div>

    <!-- 学生列表 -->
    <div class="students-section">
      <van-card>
        <template #title>
          <div class="students-title">
            <van-icon name="friends" />
            学生考勤列表
            <van-tag type="primary" size="small">{{ studentList.length }}人</van-tag>
          </div>
        </template>
        
        <div class="students-content">
          <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>
          
          <div v-else-if="studentList.length === 0" class="empty-state">
            <van-empty description="暂无学生数据" />
          </div>
          
          <div v-else class="student-list">
            <van-cell-group>
              <van-swipe-cell v-for="student in studentList" :key="student.id">
                <van-cell
                  :title="student.name"
                  :label="`学号: ${student.studentNumber} | ${student.gender}`"
                  is-link
                  @click="showStudentDetail(student)"
                >
                  <template #icon>
                    <van-image
                      :src="student.avatar"
                      class="student-avatar"
                      round
                      width="40"
                      height="40"
                    >
                      <template #error>
                        <div class="avatar-placeholder">
                          {{ student.name.charAt(0) }}
                        </div>
                      </template>
                    </van-image>
                  </template>
                  
                  <template #value>
                    <van-tag
                      :type="getAttendanceStatusType(student.attendanceStatus)"
                      size="medium"
                    >
                      {{ getAttendanceStatusText(student.attendanceStatus) }}
                    </van-tag>
                  </template>
                </van-cell>
                
                <template #right>
                  <van-button
                    square
                    type="primary"
                    text="编辑"
                    @click="editStudentAttendance(student)"
                    :disabled="!isToday"
                  />
                </template>
              </van-swipe-cell>
            </van-cell-group>
          </div>
        </div>
      </van-card>
    </div>

    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="filterForm.date"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 学生考勤编辑对话框 -->
    <van-popup v-model:show="showStudentDialog" position="bottom" round>
      <div class="student-dialog">
        <div class="dialog-header">
          <van-button type="default" size="small" @click="showStudentDialog = false">
            取消
          </van-button>
          <span class="dialog-title">{{ currentStudent.name }} - 考勤编辑</span>
          <van-button type="primary" size="small" @click="saveStudentAttendance">
            保存
          </van-button>
        </div>
        
        <div class="dialog-content">
          <van-form ref="studentFormRef">
            <van-field
              v-model="studentForm.attendanceStatusText"
              name="attendanceStatus"
              label="考勤状态"
              placeholder="请选择考勤状态"
              readonly
              is-link
              @click="showStatusPicker = true"
            />
            
            <van-field
              v-model="studentForm.checkInTime"
              name="checkInTime"
              label="签到时间"
              placeholder="选择签到时间"
              readonly
              is-link
              @click="showCheckInTimePicker = true"
              :disabled="!studentForm.attendanceStatus"
            />
            
            <van-field
              v-model="studentForm.checkOutTime"
              name="checkOutTime"
              label="签退时间"
              placeholder="选择签退时间"
              readonly
              is-link
              @click="showCheckOutTimePicker = true"
              :disabled="!studentForm.attendanceStatus"
            />
            
            <van-field
              v-model="studentForm.temperature"
              name="temperature"
              label="体温(°C)"
              type="number"
              placeholder="请输入体温"
              :disabled="!studentForm.attendanceStatus"
            />
            
            <van-field
              v-model="studentForm.healthStatusText"
              name="healthStatus"
              label="健康状态"
              placeholder="请选择健康状态"
              readonly
              is-link
              @click="showHealthStatusPicker = true"
              :disabled="!studentForm.attendanceStatus"
            />
            
            <van-field
              v-model="studentForm.notes"
              name="notes"
              label="备注"
              type="textarea"
              placeholder="请输入备注"
              :rows="3"
              :disabled="!studentForm.attendanceStatus"
            />
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 考勤状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>

    <!-- 健康状态选择器 -->
    <van-popup v-model:show="showHealthStatusPicker" position="bottom">
      <van-picker
        :columns="healthStatusColumns"
        @confirm="onHealthStatusConfirm"
        @cancel="showHealthStatusPicker = false"
      />
    </van-popup>

    <!-- 时间选择器 -->
    <van-popup v-model:show="showCheckInTimePicker" position="bottom">
      <van-time-picker
        v-model="studentForm.checkInTime"
        title="选择签到时间"
        @confirm="onCheckInTimeConfirm"
        @cancel="showCheckInTimePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showCheckOutTimePicker" position="bottom">
      <van-time-picker
        v-model="studentForm.checkOutTime"
        title="选择签退时间"
        @confirm="onCheckOutTimeConfirm"
        @cancel="showCheckOutTimePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import {
  getTeacherClasses,
  getClassStudents,
  getAttendanceRecords,
  createAttendanceRecords,
  getAttendanceStatistics,
  type ClassInfo,
  type StudentInfo,
  type AttendanceStatistics,
  AttendanceStatus,
  HealthStatus,
} from '@/api/modules/attendance'

// ==================== 类型定义 ====================

interface StudentWithAttendance extends StudentInfo {
  attendanceStatus?: string
  checkInTime?: string
  checkOutTime?: string
  temperature?: number
  healthStatus?: string
  notes?: string
  leaveReason?: string
  recordId?: number
}

// ==================== 数据定义 ====================

const emit = defineEmits<{
  refresh: []
}>()

const loading = ref(false)
const saving = ref(false)
const batchChecking = ref(false)
const showClassPicker = ref(false)
const showDatePicker = ref(false)
const showStudentDialog = ref(false)
const showStatusPicker = ref(false)
const showHealthStatusPicker = ref(false)
const showCheckInTimePicker = ref(false)
const showCheckOutTimePicker = ref(false)

// 最大日期（今天）
const maxDate = ref(new Date())

// 筛选表单
const filterForm = reactive({
  classId: '',
  classIdText: '',
  date: new Date(),
  dateText: '',
})

// 班级列表
const classList = ref<ClassInfo[]>([])
const classColumns = computed(() => 
  classList.value.map(cls => ({ text: cls.name, value: cls.id }))
)

// 学生列表
const studentList = ref<StudentWithAttendance[]>([])

// 统计数据
const statistics = ref<AttendanceStatistics>({
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

// 考勤状态选项
const statusColumns = [
  { text: '出勤', value: AttendanceStatus.PRESENT },
  { text: '缺勤', value: AttendanceStatus.ABSENT },
  { text: '迟到', value: AttendanceStatus.LATE },
  { text: '早退', value: AttendanceStatus.EARLY_LEAVE },
  { text: '病假', value: AttendanceStatus.SICK_LEAVE },
  { text: '事假', value: AttendanceStatus.PERSONAL_LEAVE },
]

// 健康状态选项
const healthStatusColumns = [
  { text: '正常', value: HealthStatus.NORMAL },
  { text: '发烧', value: HealthStatus.FEVER },
  { text: '咳嗽', value: HealthStatus.COUGH },
  { text: '感冒', value: HealthStatus.COLD },
  { text: '其他', value: HealthStatus.OTHER },
]

// 当前编辑的学生
const currentStudent = ref<StudentWithAttendance>({
  id: 0,
  name: '',
  studentNumber: '',
  gender: '',
  classId: 0,
})

// 学生表单
const studentFormRef = ref()
const studentForm = reactive({
  attendanceStatus: '',
  attendanceStatusText: '',
  checkInTime: '',
  checkOutTime: '',
  temperature: '',
  healthStatus: '',
  healthStatusText: '',
  notes: '',
})

// ==================== 计算属性 ====================

// 是否是今天
const isToday = computed(() => {
  const today = new Date()
  const selected = new Date(filterForm.date)
  return (
    today.getFullYear() === selected.getFullYear() &&
    today.getMonth() === selected.getMonth() &&
    today.getDate() === selected.getDate()
  )
})

// ==================== 方法 ====================

// 获取考勤状态类型
const getAttendanceStatusType = (status?: string) => {
  const typeMap: Record<string, any> = {
    [AttendanceStatus.PRESENT]: 'success',
    [AttendanceStatus.LATE]: 'warning',
    [AttendanceStatus.EARLY_LEAVE]: 'warning',
    [AttendanceStatus.ABSENT]: 'danger',
    [AttendanceStatus.SICK_LEAVE]: 'default',
    [AttendanceStatus.PERSONAL_LEAVE]: 'default',
  }
  return typeMap[status || ''] || ''
}

// 获取考勤状态文本
const getAttendanceStatusText = (status?: string) => {
  const labelMap: Record<string, string> = {
    [AttendanceStatus.PRESENT]: '出勤',
    [AttendanceStatus.ABSENT]: '缺勤',
    [AttendanceStatus.LATE]: '迟到',
    [AttendanceStatus.EARLY_LEAVE]: '早退',
    [AttendanceStatus.SICK_LEAVE]: '病假',
    [AttendanceStatus.PERSONAL_LEAVE]: '事假',
  }
  return labelMap[status || ''] || '未设置'
}

// 加载教师班级列表
const loadTeacherClasses = async () => {
  try {
    const response = await getTeacherClasses()
    if (response.success && response.data) {
      classList.value = response.data
      // 默认选择第一个班级
      if (classList.value.length > 0) {
        filterForm.classId = classList.value[0].id.toString()
        filterForm.classIdText = classList.value[0].name
        await loadClassStudents()
      }
    }
  } catch (error) {
    console.error('加载班级列表失败:', error)
    showToast('加载班级列表失败')
  }
}

// 加载班级学生列表
const loadClassStudents = async () => {
  if (!filterForm.classId) {
    studentList.value = []
    return
  }

  loading.value = true
  try {
    const response = await getClassStudents(filterForm.classId)
    if (response.success && response.data) {
      // 初始化学生考勤数据
      studentList.value = response.data.map((student: StudentInfo) => ({
        ...student,
        attendanceStatus: undefined,
        checkInTime: undefined,
        checkOutTime: undefined,
        temperature: undefined,
        healthStatus: HealthStatus.NORMAL,
        notes: '',
        leaveReason: '',
      }))

      // 加载已有的考勤记录
      await loadAttendanceData()
    }
  } catch (error) {
    console.error('加载学生列表失败:', error)
    showToast('加载学生列表失败')
  } finally {
    loading.value = false
  }
}

// 加载考勤数据
const loadAttendanceData = async () => {
  if (!filterForm.classId) return

  try {
    const dateStr = filterForm.date.toISOString().split('T')[0]

    // 加载考勤记录
    const recordsResponse = await getAttendanceRecords({
      classId: parseInt(filterForm.classId),
      startDate: dateStr,
      endDate: dateStr,
      page: 1,
      pageSize: 1000,
    })

    if (recordsResponse.success && recordsResponse.data) {
      const records = recordsResponse.data.rows

      // 将考勤记录填充到学生列表
      studentList.value.forEach((student) => {
        const record = records.find((r) => r.studentId === student.id)
        if (record) {
          student.attendanceStatus = record.status
          student.checkInTime = record.checkInTime
          student.checkOutTime = record.checkOutTime
          student.temperature = record.temperature
          student.healthStatus = record.healthStatus || HealthStatus.NORMAL
          student.notes = record.notes || ''
          student.leaveReason = record.leaveReason || ''
          student.recordId = record.id
        }
      })
    }

    // 加载统计数据
    const statsResponse = await getAttendanceStatistics({
      classId: parseInt(filterForm.classId),
      startDate: dateStr,
      endDate: dateStr,
    })

    if (statsResponse.success && statsResponse.data) {
      statistics.value = statsResponse.data
    }
  } catch (error) {
    console.error('加载考勤数据失败:', error)
    showToast('加载考勤数据失败')
  }
}

// 班级确认
const onClassConfirm = ({ selectedValues }: any) => {
  filterForm.classId = selectedValues[0]
  const column = classColumns.value.find(c => c.value === selectedValues[0])
  filterForm.classIdText = column?.text || ''
  showClassPicker.value = false
  loadClassStudents()
}

// 日期确认
const onDateConfirm = () => {
  filterForm.dateText = filterForm.date.toLocaleDateString('zh-CN')
  showDatePicker.value = false
  loadAttendanceData()
}

// 重置筛选
const resetFilter = () => {
  filterForm.date = new Date()
  filterForm.dateText = ''
  if (classList.value.length > 0) {
    filterForm.classId = classList.value[0].id.toString()
    filterForm.classIdText = classList.value[0].name
  }
  loadAttendanceData()
}

// 批量签到
const handleBatchCheckIn = async () => {
  try {
    await showConfirmDialog({
      title: '批量签到',
      message: '确定要将所有未签到的学生标记为出勤吗？',
    })

    batchChecking.value = true
    const now = new Date()
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`

    studentList.value.forEach((student) => {
      if (!student.attendanceStatus) {
        student.attendanceStatus = AttendanceStatus.PRESENT
        student.checkInTime = checkInTime
        student.healthStatus = HealthStatus.NORMAL
      }
    })

    showToast('批量签到成功')
  } catch (error) {
    // 用户取消
  } finally {
    batchChecking.value = false
  }
}

// 保存考勤
const handleSave = async () => {
  if (!filterForm.classId) {
    showToast('请先选择班级')
    return
  }

  // 验证数据
  const invalidStudents = studentList.value.filter(
    (s) => s.attendanceStatus && !s.checkInTime
  )
  if (invalidStudents.length > 0) {
    showToast('请为所有已选择状态的学生填写签到时间')
    return
  }

  saving.value = true
  try {
    const dateStr = filterForm.date.toISOString().split('T')[0]

    // 准备考勤记录
    const records = studentList.value
      .filter((s) => s.attendanceStatus)
      .map((s) => ({
        studentId: s.id,
        status: s.attendanceStatus,
        checkInTime: s.checkInTime,
        checkOutTime: s.checkOutTime,
        temperature: s.temperature,
        healthStatus: s.healthStatus,
        notes: s.notes,
        leaveReason: s.leaveReason,
      }))

    if (records.length === 0) {
      showToast('请至少为一个学生设置考勤状态')
      return
    }

    // 调用API保存
    const response = await createAttendanceRecords({
      classId: parseInt(filterForm.classId),
      kindergartenId: classList.value.find((c) => c.id.toString() === filterForm.classId)?.kindergartenId || 0,
      attendanceDate: dateStr,
      records,
    })

    if (response.success) {
      showToast(`成功保存 ${response.data.successCount} 条考勤记录`)
      await loadAttendanceData()
      emit('refresh')
    }
  } catch (error) {
    console.error('保存考勤失败:', error)
    showToast('保存考勤失败')
  } finally {
    saving.value = false
  }
}

// 显示学生详情
const showStudentDetail = (student: StudentWithAttendance) => {
  const statusText = getAttendanceStatusText(student.attendanceStatus)
  const healthText = student.healthStatus ? 
    healthStatusColumns.find(c => c.value === student.healthStatus)?.text || student.healthStatus : 
    '未设置'
  
  showToast(`${student.name} - ${statusText} - ${healthText}`)
}

// 编辑学生考勤
const editStudentAttendance = (student: StudentWithAttendance) => {
  currentStudent.value = { ...student }
  
  // 填充表单
  studentForm.attendanceStatus = student.attendanceStatus || ''
  studentForm.attendanceStatusText = getAttendanceStatusText(student.attendanceStatus)
  studentForm.checkInTime = student.checkInTime || ''
  studentForm.checkOutTime = student.checkOutTime || ''
  studentForm.temperature = student.temperature?.toString() || ''
  studentForm.healthStatus = student.healthStatus || HealthStatus.NORMAL
  studentForm.healthStatusText = healthStatusColumns.find(c => c.value === student.healthStatus)?.text || '正常'
  studentForm.notes = student.notes || ''
  
  showStudentDialog.value = true
}

// 保存学生考勤
const saveStudentAttendance = () => {
  // 更新学生列表中的数据
  const studentIndex = studentList.value.findIndex(s => s.id === currentStudent.value.id)
  if (studentIndex !== -1) {
    studentList.value[studentIndex] = {
      ...studentList.value[studentIndex],
      attendanceStatus: studentForm.attendanceStatus,
      checkInTime: studentForm.checkInTime,
      checkOutTime: studentForm.checkOutTime,
      temperature: studentForm.temperature ? parseFloat(studentForm.temperature) : undefined,
      healthStatus: studentForm.healthStatus,
      notes: studentForm.notes,
    }
  }
  
  showStudentDialog.value = false
  showToast('考勤信息已更新')
}

// 考勤状态确认
const onStatusConfirm = ({ selectedValues }: any) => {
  studentForm.attendanceStatus = selectedValues[0]
  const column = statusColumns.find(c => c.value === selectedValues[0])
  studentForm.attendanceStatusText = column?.text || ''
  
  // 如果选择了出勤，自动设置签到时间
  if (studentForm.attendanceStatus === AttendanceStatus.PRESENT && !studentForm.checkInTime) {
    const now = new Date()
    studentForm.checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
  }
  
  showStatusPicker.value = false
}

// 健康状态确认
const onHealthStatusConfirm = ({ selectedValues }: any) => {
  studentForm.healthStatus = selectedValues[0]
  const column = healthStatusColumns.find(c => c.value === selectedValues[0])
  studentForm.healthStatusText = column?.text || ''
  showHealthStatusPicker.value = false
}

// 签到时间确认
const onCheckInTimeConfirm = () => {
  showCheckInTimePicker.value = false
}

// 签退时间确认
const onCheckOutTimeConfirm = () => {
  showCheckOutTimePicker.value = false
}

// ==================== 生命周期 ====================

onMounted(() => {
  // 设置默认日期文本
  filterForm.dateText = new Date().toLocaleDateString('zh-CN')
  
  loadTeacherClasses()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.student-attendance-tab {
  padding: var(--van-padding-md);

  .filter-section,
  .stats-section,
  .actions-section,
  .alert-section,
  .students-section {
    margin-bottom: var(--van-padding-md);
  }

  .filter-title,
  .students-title {
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

  .stats-section {
    .stat-card {
      .stat-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-radius-sm);

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--van-padding-xs);
          font-size: var(--van-font-size-xl);
          
          .van-icon {
            color: white;
          }
        }

        .stat-info {
          text-align: center;

          .stat-value {
            font-size: var(--van-font-size-xl);
            font-weight: var(--van-font-weight-bold);
            margin-bottom: var(--van-padding-xs);
            color: var(--van-text-color);
          }

          .stat-label {
            font-size: var(--van-font-size-sm);
            color: var(--van-gray-6);
          }
        }
      }

      &.stat-total .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.stat-present .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.stat-absent .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.stat-rate .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
  }

  .actions-section {
    .action-buttons {
      display: flex;
      gap: var(--van-padding-sm);
    }
  }

  .students-content {
    .empty-state {
      padding: var(--van-padding-xl) 0;
      text-align: center;
    }

    .student-list {
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
    }
  }

  .student-dialog {
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .dialog-content {
      padding: var(--van-padding-md);
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .student-attendance-tab {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>