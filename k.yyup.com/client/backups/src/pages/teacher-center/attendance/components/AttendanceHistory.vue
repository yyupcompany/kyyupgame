<template>
  <div class="attendance-history-tab">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="记录类型">
          <el-radio-group v-model="filterForm.type" @change="loadHistory">
            <el-radio-button label="teacher">教师考勤</el-radio-button>
            <el-radio-button label="student">学生考勤</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="班级" v-if="filterForm.type === 'student'">
          <el-select
            v-model="filterForm.classId"
            placeholder="请选择班级"
            @change="loadHistory"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学生" v-if="filterForm.type === 'student' && filterForm.classId">
          <el-select
            v-model="filterForm.studentId"
            placeholder="全部学生"
            @change="loadHistory"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="student in studentList"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="loadHistory"
          />
        </el-form-item>

        <el-form-item label="考勤状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            @change="loadHistory"
            clearable
            style="width: 150px"
          >
            <el-option label="出勤" value="PRESENT" />
            <el-option label="缺勤" value="ABSENT" />
            <el-option label="迟到" value="LATE" />
            <el-option label="早退" value="EARLY_LEAVE" />
            <el-option label="病假" value="SICK_LEAVE" />
            <el-option label="事假" value="PERSONAL_LEAVE" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadHistory">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" :icon="Download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 教师考勤历史 -->
    <el-card v-if="filterForm.type === 'teacher'" class="history-card" shadow="never">
      <template #header>
        <span class="card-title">教师考勤历史</span>
      </template>
      
      <el-table :data="teacherHistory" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="attendanceDate" label="日期" width="120" />
        <el-table-column prop="checkInTime" label="签到时间" width="100" />
        <el-table-column prop="checkOutTime" label="签退时间" width="100" />
        <el-table-column prop="workDuration" label="工作时长" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="leaveType" label="请假类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.leaveType" type="info">
              {{ getLeaveTypeLabel(row.leaveType) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="200" />
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadHistory"
        @current-change="loadHistory"
        style="margin-top: var(--text-lg); justify-content: flex-end"
      />
    </el-card>

    <!-- 学生考勤历史 -->
    <el-card v-if="filterForm.type === 'student'" class="history-card" shadow="never">
      <template #header>
        <span class="card-title">学生考勤历史</span>
      </template>
      
      <el-table :data="studentHistory" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="attendanceDate" label="日期" width="120" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkInTime" label="签到时间" width="100" />
        <el-table-column prop="checkOutTime" label="签退时间" width="100" />
        <el-table-column prop="temperature" label="体温" width="80" align="center">
          <template #default="{ row }">
            <span :class="{ 'abnormal-temp': row.temperature && row.temperature > 37.3 }">
              {{ row.temperature || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="healthStatus" label="健康状态" width="100" align="center" />
        <el-table-column prop="notes" label="备注" min-width="150" />
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadHistory"
        @current-change="loadHistory"
        style="margin-top: var(--text-lg); justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import {
  getTeacherClasses,
  getClassStudents,
  getAttendanceRecords,
  exportAttendance,
  type ClassInfo,
  type StudentInfo,
} from '@/api/modules/attendance';

// ==================== 数据定义 ====================

const emit = defineEmits<{
  refresh: [];
}>();

const loading = ref(false);

const filterForm = reactive({
  type: 'teacher' as 'teacher' | 'student',
  classId: null as number | null,
  studentId: null as number | null,
  dateRange: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()] as Date[],
  status: '',
});

const classList = ref<ClassInfo[]>([]);
const studentList = ref<StudentInfo[]>([]);

const teacherHistory = ref<any[]>([]);
const studentHistory = ref<any[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// ==================== 方法 ====================

// 加载班级列表
const loadClasses = async () => {
  try {
    const response = await getTeacherClasses();
    if (response.success && response.data) {
      classList.value = response.data;
    }
  } catch (error) {
    console.error('加载班级列表失败:', error);
    ElMessage.error('加载班级列表失败');
  }
};

// 加载学生列表
const loadStudents = async () => {
  if (!filterForm.classId) {
    studentList.value = [];
    return;
  }

  try {
    const response = await getClassStudents(filterForm.classId);
    if (response.success && response.data) {
      studentList.value = response.data;
    }
  } catch (error) {
    console.error('加载学生列表失败:', error);
    ElMessage.error('加载学生列表失败');
  }
};

// 加载历史记录
const loadHistory = async () => {
  loading.value = true;
  try {
    if (filterForm.type === 'teacher') {
      await loadTeacherHistory();
    } else {
      await loadStudentHistory();
    }
  } finally {
    loading.value = false;
  }
};

// 加载教师考勤历史
const loadTeacherHistory = async () => {
  try {
    // TODO: 调用API加载教师考勤历史
    // Mock数据
    teacherHistory.value = [];
    pagination.total = 0;
  } catch (error) {
    console.error('加载教师考勤历史失败:', error);
    ElMessage.error('加载教师考勤历史失败');
  }
};

// 加载学生考勤历史
const loadStudentHistory = async () => {
  if (!filterForm.classId) {
    ElMessage.warning('请先选择班级');
    return;
  }

  try {
    const [startDate, endDate] = filterForm.dateRange;
    const response = await getAttendanceRecords({
      classId: filterForm.classId,
      studentId: filterForm.studentId || undefined,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: filterForm.status as any,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    if (response.success && response.data) {
      studentHistory.value = response.data.rows;
      pagination.total = response.data.count;
    }
  } catch (error) {
    console.error('加载学生考勤历史失败:', error);
    ElMessage.error('加载学生考勤历史失败');
  }
};

// 重置筛选
const resetFilter = () => {
  filterForm.classId = null;
  filterForm.studentId = null;
  filterForm.dateRange = [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()];
  filterForm.status = '';
  pagination.page = 1;
  loadHistory();
};

// 导出
const handleExport = async () => {
  try {
    const [startDate, endDate] = filterForm.dateRange;
    
    if (filterForm.type === 'student' && !filterForm.classId) {
      ElMessage.warning('请先选择班级');
      return;
    }

    const response = await exportAttendance({
      classId: filterForm.classId || undefined,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      format: 'excel',
    });

    if (response.success && response.data) {
      ElMessage.success('导出成功');
      window.open(response.data.url, '_blank');
    }
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    PRESENT: 'success',
    LATE: 'warning',
    EARLY_LEAVE: 'warning',
    ABSENT: 'danger',
    SICK_LEAVE: 'info',
    PERSONAL_LEAVE: 'info',
    LEAVE: 'info',
  };
  return typeMap[status] || '';
};

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
  };
  return labelMap[status] || status;
};

// 获取请假类型标签
const getLeaveTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    SICK: '病假',
    PERSONAL: '事假',
    ANNUAL: '年假',
    MATERNITY: '产假',
  };
  return labelMap[type] || type;
};

// ==================== 监听 ====================

watch(() => filterForm.classId, () => {
  filterForm.studentId = null;
  loadStudents();
});

// ==================== 生命周期 ====================

onMounted(() => {
  loadClasses();
  loadHistory();
});
</script>

<style scoped lang="scss">
.attendance-history-tab {
  .filter-card {
    margin-bottom: var(--text-2xl);
  }

  .card-title {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .history-card {
    .abnormal-temp {
      color: var(--danger-color);
      font-weight: 600;
    }
  }
}
</style>

