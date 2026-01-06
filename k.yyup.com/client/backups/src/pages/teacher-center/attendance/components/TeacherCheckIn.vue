<template>
  <div class="teacher-checkin-tab">
    <!-- 今日打卡状态 -->
    <el-row :gutter="16" class="checkin-row">
      <el-col :span="12">
        <el-card class="status-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Clock /></el-icon>
              <span>今日打卡状态</span>
            </div>
          </template>
          
          <div class="status-content">
            <div class="status-item">
              <div class="status-label">签到时间</div>
              <div class="status-value" :class="{ 'has-value': todayRecord.checkInTime }">
                {{ todayRecord.checkInTime || '--:--' }}
              </div>
              <el-tag v-if="todayRecord.checkInTime && isLate" type="warning" size="small">
                迟到
              </el-tag>
            </div>
            
            <el-divider />
            
            <div class="status-item">
              <div class="status-label">签退时间</div>
              <div class="status-value" :class="{ 'has-value': todayRecord.checkOutTime }">
                {{ todayRecord.checkOutTime || '--:--' }}
              </div>
              <el-tag v-if="todayRecord.checkOutTime && isEarlyLeave" type="warning" size="small">
                早退
              </el-tag>
            </div>
            
            <el-divider />
            
            <div class="status-item">
              <div class="status-label">工作时长</div>
              <div class="status-value">
                {{ workDuration }}
              </div>
            </div>
            
            <el-divider />
            
            <div class="status-item">
              <div class="status-label">考勤状态</div>
              <el-tag :type="statusType" size="large">
                {{ statusText }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="action-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Operation /></el-icon>
              <span>快速打卡</span>
            </div>
          </template>
          
          <div class="action-content">
            <div class="current-time">
              <el-icon><Timer /></el-icon>
              <span>当前时间：{{ currentTime }}</span>
            </div>
            
            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :icon="Check"
                @click="handleCheckIn"
                :disabled="!!todayRecord.checkInTime"
                :loading="checking"
                class="checkin-btn"
              >
                {{ todayRecord.checkInTime ? '已签到' : '签到' }}
              </el-button>
              
              <el-button
                type="success"
                size="large"
                :icon="Check"
                @click="handleCheckOut"
                :disabled="!todayRecord.checkInTime || !!todayRecord.checkOutTime"
                :loading="checking"
                class="checkout-btn"
              >
                {{ todayRecord.checkOutTime ? '已签退' : '签退' }}
              </el-button>
            </div>
            
            <el-divider />
            
            <el-button
              type="warning"
              :icon="Edit"
              @click="showLeaveDialog = true"
              class="leave-btn"
            >
              请假申请
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 本月考勤日历 -->
    <el-card class="calendar-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">本月考勤日历</span>
          <div class="month-selector">
            <el-date-picker
              v-model="selectedMonth"
              type="month"
              placeholder="选择月份"
              @change="loadMonthRecords"
              size="small"
              style="width: 150px"
            />
          </div>
        </div>
      </template>
      
      <el-calendar v-model="selectedMonth">
        <template #date-cell="{ data }">
          <div class="calendar-day" :class="getCalendarDayClass(data.day)">
            <div class="day-number">{{ data.day.split('-').slice(-1)[0] }}</div>
            <div class="day-status" v-if="getRecordByDate(data.day)">
              <el-tag :type="getRecordStatusType(data.day)" size="small">
                {{ getRecordStatusText(data.day) }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>

    <!-- 请假申请对话框 -->
    <el-dialog
      v-model="showLeaveDialog"
      title="请假申请"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="leaveForm" :rules="leaveRules" ref="leaveFormRef" label-width="100px">
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="leaveForm.leaveType" placeholder="请选择请假类型">
            <el-option label="病假" value="SICK" />
            <el-option label="事假" value="PERSONAL" />
            <el-option label="年假" value="ANNUAL" />
            <el-option label="产假" value="MATERNITY" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="leaveForm.startDate"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
            v-model="leaveForm.endDate"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="leaveForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入请假原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showLeaveDialog = false">取消</el-button>
        <el-button type="primary" @click="submitLeaveRequest" :loading="submitting">
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Clock,
  Operation,
  Timer,
  Check,
  Edit,
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import {
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
  getTodayAttendance,
  getMonthAttendance,
  createLeaveRequest as apiCreateLeaveRequest,
  TeacherAttendanceStatus,
  LeaveType,
  type TeacherAttendanceRecord,
} from '@/api/modules/teacher-checkin';

// ==================== 类型定义 ====================

interface TeacherAttendanceRecord {
  id?: number;
  teacherId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'LEAVE';
  leaveType?: 'SICK' | 'PERSONAL' | 'ANNUAL' | 'MATERNITY';
  notes?: string;
}

// ==================== 数据定义 ====================

const emit = defineEmits<{
  refresh: [];
}>();

const userStore = useUserStore();
const checking = ref(false);
const submitting = ref(false);
const showLeaveDialog = ref(false);

// 当前时间
const currentTime = ref('');
let timeInterval: number | null = null;

// 今日考勤记录
const todayRecord = ref<TeacherAttendanceRecord>({
  teacherId: userStore.user?.id || 0,
  attendanceDate: new Date().toISOString().split('T')[0],
  status: 'ABSENT',
});

// 本月考勤记录
const selectedMonth = ref(new Date());
const monthRecords = ref<TeacherAttendanceRecord[]>([]);

// 请假表单
const leaveFormRef = ref();
const leaveForm = reactive({
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
});

const leaveRules = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }],
};

// ==================== 计算属性 ====================

// 是否迟到（假设9:00为上班时间）
const isLate = computed(() => {
  if (!todayRecord.value.checkInTime) return false;
  const checkInHour = parseInt(todayRecord.value.checkInTime.split(':')[0]);
  const checkInMinute = parseInt(todayRecord.value.checkInTime.split(':')[1]);
  return checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
});

// 是否早退（假设18:00为下班时间）
const isEarlyLeave = computed(() => {
  if (!todayRecord.value.checkOutTime) return false;
  const checkOutHour = parseInt(todayRecord.value.checkOutTime.split(':')[0]);
  return checkOutHour < 18;
});

// 工作时长
const workDuration = computed(() => {
  if (!todayRecord.value.checkInTime || !todayRecord.value.checkOutTime) {
    return '--';
  }
  
  const [inHour, inMinute] = todayRecord.value.checkInTime.split(':').map(Number);
  const [outHour, outMinute] = todayRecord.value.checkOutTime.split(':').map(Number);
  
  const totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}小时${minutes}分钟`;
});

// 状态类型
const statusType = computed(() => {
  if (todayRecord.value.status === 'PRESENT') return 'success';
  if (todayRecord.value.status === 'LATE') return 'warning';
  if (todayRecord.value.status === 'LEAVE') return 'info';
  return 'danger';
});

// 状态文本
const statusText = computed(() => {
  const statusMap = {
    PRESENT: '正常',
    ABSENT: '未打卡',
    LATE: '迟到',
    EARLY_LEAVE: '早退',
    LEAVE: '请假',
  };
  return statusMap[todayRecord.value.status] || '未知';
});

// ==================== 方法 ====================

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
};

// 签到
const handleCheckIn = async () => {
  checking.value = true;
  try {
    const response = await apiCheckIn({
      teacherId: userStore.user?.teacherId || 0,
      userId: userStore.user?.id || 0,
      kindergartenId: userStore.user?.kindergartenId || 0,
    });

    if (response.success && response.data) {
      todayRecord.value = response.data as any;
      ElMessage.success('签到成功');
      emit('refresh');
      // 重新加载今日考勤
      await loadTodayAttendance();
    }
  } catch (error: any) {
    console.error('签到失败:', error);
    ElMessage.error(error.message || '签到失败');
  } finally {
    checking.value = false;
  }
};

// 签退
const handleCheckOut = async () => {
  checking.value = true;
  try {
    const response = await apiCheckOut({
      teacherId: userStore.user?.teacherId || 0,
    });

    if (response.success && response.data) {
      todayRecord.value = response.data as any;
      ElMessage.success('签退成功');
      emit('refresh');
      // 重新加载今日考勤
      await loadTodayAttendance();
    }
  } catch (error: any) {
    console.error('签退失败:', error);
    ElMessage.error(error.message || '签退失败');
  } finally {
    checking.value = false;
  }
};

// 提交请假申请
const submitLeaveRequest = async () => {
  if (!leaveFormRef.value) return;

  await leaveFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    submitting.value = true;
    try {
      const response = await apiCreateLeaveRequest({
        teacherId: userStore.user?.teacherId || 0,
        userId: userStore.user?.id || 0,
        kindergartenId: userStore.user?.kindergartenId || 0,
        leaveType: leaveForm.leaveType as LeaveType,
        leaveReason: leaveForm.reason,
        leaveStartTime: leaveForm.startDate,
        leaveEndTime: leaveForm.endDate,
      });

      if (response.success) {
        ElMessage.success('请假申请已提交');
        showLeaveDialog.value = false;
        emit('refresh');
        // 重新加载本月考勤
        await loadMonthRecords();
      }
    } catch (error: any) {
      console.error('提交请假申请失败:', error);
      ElMessage.error(error.message || '提交请假申请失败');
    } finally {
      submitting.value = false;
    }
  });
};

// 加载今日考勤
const loadTodayAttendance = async () => {
  try {
    const teacherId = userStore.user?.teacherId || 0;
    if (!teacherId) return;

    const response = await getTodayAttendance(teacherId);
    if (response.success && response.data) {
      todayRecord.value = response.data as any;
    }
  } catch (error) {
    console.error('加载今日考勤失败:', error);
  }
};

// 加载本月考勤记录
const loadMonthRecords = async () => {
  try {
    const teacherId = userStore.user?.teacherId || 0;
    if (!teacherId) return;

    const date = new Date(selectedMonth.value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const response = await getMonthAttendance(teacherId, year, month);
    if (response.success && response.data) {
      monthRecords.value = response.data as any[];
    }
  } catch (error) {
    console.error('加载本月考勤记录失败:', error);
    ElMessage.error('加载本月考勤记录失败');
  }
};

// 根据日期获取考勤记录
const getRecordByDate = (date: string) => {
  return monthRecords.value.find(r => r.attendanceDate === date);
};

// 获取日历日期样式类
const getCalendarDayClass = (date: string) => {
  const record = getRecordByDate(date);
  if (!record) return '';
  
  if (record.status === 'PRESENT') return 'day-present';
  if (record.status === 'LATE') return 'day-late';
  if (record.status === 'LEAVE') return 'day-leave';
  return 'day-absent';
};

// 获取记录状态类型
const getRecordStatusType = (date: string) => {
  const record = getRecordByDate(date);
  if (!record) return '';
  
  if (record.status === 'PRESENT') return 'success';
  if (record.status === 'LATE') return 'warning';
  if (record.status === 'LEAVE') return 'info';
  return 'danger';
};

// 获取记录状态文本
const getRecordStatusText = (date: string) => {
  const record = getRecordByDate(date);
  if (!record) return '';
  
  const statusMap = {
    PRESENT: '正常',
    LATE: '迟到',
    LEAVE: '请假',
    ABSENT: '缺勤',
    EARLY_LEAVE: '早退',
  };
  return statusMap[record.status] || '';
};

// ==================== 生命周期 ====================

onMounted(() => {
  updateCurrentTime();
  timeInterval = window.setInterval(updateCurrentTime, 1000);
  loadTodayAttendance();
  loadMonthRecords();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped lang="scss">
.teacher-checkin-tab {
  .checkin-row {
    margin-bottom: var(--text-2xl);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .status-card {
    .status-content {
      .status-item {
        padding: var(--text-sm) 0;
        text-align: center;

        .status-label {
          font-size: var(--text-base);
          color: var(--info-color);
          margin-bottom: var(--spacing-sm);
        }

        .status-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--border-color);
          margin-bottom: var(--spacing-sm);

          &.has-value {
            color: var(--text-primary);
          }
        }
      }
    }
  }

  .action-card {
    .action-content {
      .current-time {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-color-primary);
        margin-bottom: var(--text-3xl);
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: var(--text-lg);

        .checkin-btn,
        .checkout-btn {
          width: 100%;
          height: 50px;
          font-size: var(--text-lg);
        }
      }

      .leave-btn {
        width: 100%;
        margin-top: var(--spacing-sm);
      }
    }
  }

  .calendar-card {
    .card-title {
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .month-selector {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .calendar-day {
      height: 100%;
      padding: var(--spacing-xs);

      .day-number {
        font-size: var(--text-base);
        margin-bottom: var(--spacing-xs);
      }

      .day-status {
        display: flex;
        justify-content: center;
      }

      &.day-present {
        background-color: #f0f9ff;
      }

      &.day-late {
        background-color: #fef0f0;
      }

      &.day-leave {
        background-color: #f4f4f5;
      }

      &.day-absent {
        background-color: #fef0f0;
      }
    }
  }
}
</style>

