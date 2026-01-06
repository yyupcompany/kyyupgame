<template>
  <div class="student-attendance-tab">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="班级">
          <el-select
            v-model="filterForm.classId"
            placeholder="请选择班级"
            @change="handleClassChange"
            style="max-max-width: 200px; width: 100%; width: 100%"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="日期">
          <el-date-picker
            v-model="filterForm.date"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            @change="handleDateChange"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadAttendanceData">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card stat-total" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalRecords }}</div>
              <div class="stat-label">总人数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card stat-present" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <UnifiedIcon name="Check" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.presentCount }}</div>
              <div class="stat-label">出勤</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card stat-absent" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <UnifiedIcon name="Close" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.absentCount }}</div>
              <div class="stat-label">缺勤</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card stat-rate" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.attendanceRate }}%</div>
              <div class="stat-label">出勤率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 考勤录入区域 -->
    <el-card class="attendance-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">考勤录入</span>
          <div class="card-actions">
            <el-button
              type="success"
              size="small"
              :icon="Select"
              @click="handleBatchCheckIn"
              :disabled="!filterForm.classId || !isToday"
            >
              批量签到
            </el-button>
            <el-button
              type="primary"
              size="small"
              :icon="Check"
              @click="handleSave"
              :disabled="!filterForm.classId || !isToday"
              :loading="saving"
            >
              保存考勤
            </el-button>
          </div>
        </div>
      </template>

      <!-- 提示信息 -->
      <el-alert
        v-if="!isToday"
        title="只能修改当天的考勤记录"
        type="warning"
        :closable="false"
        show-icon
        class="date-alert"
      />

      <!-- 学生列表 -->
      <div class="table-wrapper">
<el-table class="responsive-table"
        :data="studentList"
        border
        stripe
        v-loading="loading"
        class="attendance-table"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        
        <el-table-column prop="studentNumber" label="学号" width="120" align="center" />
        
        <el-table-column label="姓名" width="120">
          <template #default="{ row }">
            <div class="student-info">
              <el-avatar :size="32" :src="row.avatar" class="student-avatar">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="gender" label="性别" width="80" align="center" />

        <el-table-column label="考勤状态" width="180">
          <template #default="{ row }">
            <el-select
              v-model="row.attendanceStatus"
              placeholder="请选择"
              :disabled="!isToday"
              @change="handleStatusChange(row)"
              size="small"
            >
              <el-option label="出勤" value="PRESENT" />
              <el-option label="缺勤" value="ABSENT" />
              <el-option label="迟到" value="LATE" />
              <el-option label="早退" value="EARLY_LEAVE" />
              <el-option label="病假" value="SICK_LEAVE" />
              <el-option label="事假" value="PERSONAL_LEAVE" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="签到时间" width="150">
          <template #default="{ row }">
            <el-time-picker
              v-model="row.checkInTime"
              placeholder="签到时间"
              :disabled="!isToday || !row.attendanceStatus"
              format="HH:mm"
              value-format="HH:mm:ss"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="签退时间" width="150">
          <template #default="{ row }">
            <el-time-picker
              v-model="row.checkOutTime"
              placeholder="签退时间"
              :disabled="!isToday || !row.attendanceStatus"
              format="HH:mm"
              value-format="HH:mm:ss"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="体温(°C)" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.temperature"
              :min="35"
              :max="42"
              :precision="1"
              :step="0.1"
              :disabled="!isToday || !row.attendanceStatus"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="健康状态" width="150">
          <template #default="{ row }">
            <el-select
              v-model="row.healthStatus"
              placeholder="健康状态"
              :disabled="!isToday || !row.attendanceStatus"
              size="small"
            >
              <el-option label="正常" value="NORMAL" />
              <el-option label="发烧" value="FEVER" />
              <el-option label="咳嗽" value="COUGH" />
              <el-option label="感冒" value="COLD" />
              <el-option label="其他" value="OTHER" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="备注" min-width="200">
          <template #default="{ row }">
            <el-input
              v-model="row.notes"
              placeholder="请输入备注"
              :disabled="!isToday || !row.attendanceStatus"
              size="small"
            />
          </template>
        </el-table-column>
      </el-table>
</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Select,
  Check,
  User,
  CircleCheck,
  CircleClose,
  TrendCharts,
} from '@element-plus/icons-vue';
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
} from '@/api/modules/attendance';

// ==================== 数据定义 ====================

const emit = defineEmits<{
  refresh: [];
}>();

const loading = ref(false);
const saving = ref(false);

// 筛选表单
const filterForm = reactive({
  classId: null as number | null,
  date: new Date(),
});

// 班级列表
const classList = ref<ClassInfo[]>([]);

// 学生列表
const studentList = ref<any[]>([]);

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
});

// ==================== 计算属性 ====================

// 是否是今天
const isToday = computed(() => {
  const today = new Date();
  const selected = new Date(filterForm.date);
  return (
    today.getFullYear() === selected.getFullYear() &&
    today.getMonth() === selected.getMonth() &&
    today.getDate() === selected.getDate()
  );
});

// ==================== 方法 ====================

// 禁用日期（只能选择今天）
const disabledDate = (time: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return time.getTime() !== today.getTime();
};

// 加载教师班级列表
const loadTeacherClasses = async () => {
  try {
    const response = await getTeacherClasses();
    if (response.success && response.data) {
      classList.value = response.data;
      // 默认选择第一个班级
      if (classList.value.length > 0) {
        filterForm.classId = classList.value[0].id;
        await loadClassStudents();
      }
    }
  } catch (error) {
    console.error('加载班级列表失败:', error);
    ElMessage.error('加载班级列表失败');
  }
};

// 加载班级学生列表
const loadClassStudents = async () => {
  if (!filterForm.classId) {
    studentList.value = [];
    return;
  }

  loading.value = true;
  try {
    const response = await getClassStudents(filterForm.classId);
    if (response.success && response.data) {
      // 初始化学生考勤数据
      studentList.value = response.data.map((student: StudentInfo) => ({
        ...student,
        attendanceStatus: null,
        checkInTime: null,
        checkOutTime: null,
        temperature: null,
        healthStatus: 'NORMAL',
        notes: '',
        leaveReason: '',
      }));

      // 加载已有的考勤记录
      await loadAttendanceData();
    }
  } catch (error) {
    console.error('加载学生列表失败:', error);
    ElMessage.error('加载学生列表失败');
  } finally {
    loading.value = false;
  }
};

// 加载考勤数据
const loadAttendanceData = async () => {
  if (!filterForm.classId) return;

  loading.value = true;
  try {
    const dateStr = filterForm.date.toISOString().split('T')[0];

    // 加载考勤记录
    const recordsResponse = await getAttendanceRecords({
      classId: filterForm.classId,
      startDate: dateStr,
      endDate: dateStr,
      page: 1,
      pageSize: 1000,
    });

    if (recordsResponse.success && recordsResponse.data) {
      const records = recordsResponse.data.rows;

      // 将考勤记录填充到学生列表
      studentList.value.forEach((student) => {
        const record = records.find((r) => r.studentId === student.id);
        if (record) {
          student.attendanceStatus = record.status;
          student.checkInTime = record.checkInTime;
          student.checkOutTime = record.checkOutTime;
          student.temperature = record.temperature;
          student.healthStatus = record.healthStatus || 'NORMAL';
          student.notes = record.notes || '';
          student.leaveReason = record.leaveReason || '';
          student.recordId = record.id;
        }
      });
    }

    // 加载统计数据
    const statsResponse = await getAttendanceStatistics({
      classId: filterForm.classId,
      startDate: dateStr,
      endDate: dateStr,
    });

    if (statsResponse.success && statsResponse.data) {
      statistics.value = statsResponse.data;
    }
  } catch (error) {
    console.error('加载考勤数据失败:', error);
    ElMessage.error('加载考勤数据失败');
  } finally {
    loading.value = false;
  }
};

// 班级变更
const handleClassChange = () => {
  loadClassStudents();
};

// 日期变更
const handleDateChange = () => {
  loadAttendanceData();
};

// 状态变更
const handleStatusChange = (row: any) => {
  // 如果选择了出勤，自动设置签到时间
  if (row.attendanceStatus === AttendanceStatus.PRESENT && !row.checkInTime) {
    const now = new Date();
    row.checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
  }
};

// 批量签到
const handleBatchCheckIn = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将所有未签到的学生标记为出勤吗？',
      '批量签到',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    studentList.value.forEach((student) => {
      if (!student.attendanceStatus) {
        student.attendanceStatus = AttendanceStatus.PRESENT;
        student.checkInTime = checkInTime;
        student.healthStatus = HealthStatus.NORMAL;
      }
    });

    ElMessage.success('批量签到成功');
  } catch (error) {
    // 用户取消
  }
};

// 保存考勤
const handleSave = async () => {
  if (!filterForm.classId) {
    ElMessage.warning('请先选择班级');
    return;
  }

  // 验证数据
  const invalidStudents = studentList.value.filter(
    (s) => s.attendanceStatus && !s.checkInTime
  );
  if (invalidStudents.length > 0) {
    ElMessage.warning('请为所有已选择状态的学生填写签到时间');
    return;
  }

  saving.value = true;
  try {
    const dateStr = filterForm.date.toISOString().split('T')[0];

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
      }));

    if (records.length === 0) {
      ElMessage.warning('请至少为一个学生设置考勤状态');
      return;
    }

    // 调用API保存
    const response = await createAttendanceRecords({
      classId: filterForm.classId,
      kindergartenId: classList.value.find((c) => c.id === filterForm.classId)?.kindergartenId || 0,
      attendanceDate: dateStr,
      records,
    });

    if (response.success) {
      ElMessage.success(`成功保存 ${response.data.successCount} 条考勤记录`);
      await loadAttendanceData();
      emit('refresh');
    }
  } catch (error) {
    console.error('保存考勤失败:', error);
    ElMessage.error('保存考勤失败');
  } finally {
    saving.value = false;
  }
};

// 重置筛选
const resetFilter = () => {
  filterForm.date = new Date();
  if (classList.value.length > 0) {
    filterForm.classId = classList.value[0].id;
  }
  loadAttendanceData();
};

// ==================== 生命周期 ====================

onMounted(() => {
  loadTeacherClasses();
});
</script>

<style scoped lang="scss">
.student-attendance-tab {
  .filter-card {
    margin-bottom: var(--text-2xl);

    .filter-form {
      margin-bottom: 0;
    }
  }

  .stats-row {
    margin-bottom: var(--text-2xl);

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--text-lg);

        .stat-icon {
          width: auto;
          min-height: 60px; height: auto;
          border-radius: var(--text-sm);
          display: flex;
          align-items: center;
          justify-content: center;
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

      &.stat-total .stat-icon {
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        color: white;
      }

      &.stat-present .stat-icon {
        background: var(--gradient-pink);
        color: white;
      }

      &.stat-absent .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.stat-rate .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }
    }
  }

  .attendance-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: var(--text-lg);
        font-weight: 600;
      }

      .card-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .date-alert {
      margin-bottom: var(--text-lg);
    }

    .attendance-table {
      .student-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .student-avatar {
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>


