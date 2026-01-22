<template>
  <el-dialog
    v-model="dialogVisible"
    title="课程排期管理"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
    class="course-schedule-dialog"
  >
    <div class="schedule-content">
      <!-- 课程信息 -->
      <div class="course-info-card" v-if="course">
        <div class="course-icon">📚</div>
        <div class="course-details">
          <div class="course-name">{{ course.course_name }}</div>
          <div class="course-meta">
            <el-tag size="small">{{ getAgeGroupLabel(course.age_group) }}</el-tag>
            <span>{{ course.total_sessions || 16 }}课时</span>
            <span>{{ course.semester }} {{ course.academic_year }}</span>
          </div>
        </div>
        <el-button type="primary" @click="handleAddSchedule">
          <el-icon><Plus /></el-icon>
          添加排期
        </el-button>
      </div>

      <!-- 排期列表 -->
      <div class="schedule-list">
        <el-empty v-if="!schedules.length && !loading" description="暂无排期，点击添加排期">
        </el-empty>

        <el-table v-else :data="schedules" v-loading="loading" class="schedule-table">
          <el-table-column label="班级" width="120">
            <template #default="{ row }">
              {{ row.class?.class_name || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="教师" width="100">
            <template #default="{ row }">
              {{ row.teacher?.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="计划时间" min-width="180">
            <template #default="{ row }">
              <div class="date-range">
                <span>{{ formatDate(row.planned_start_date) }}</span>
                <span class="date-separator">至</span>
                <span>{{ formatDate(row.planned_end_date) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="150">
            <template #default="{ row }">
              <el-progress 
                :percentage="Math.round((row.completed_sessions / row.total_sessions) * 100)"
                :status="getProgressStatus(row)"
              />
              <div class="progress-text">
                {{ row.completed_sessions }}/{{ row.total_sessions }}课时
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.schedule_status)" size="small">
                {{ getStatusLabel(row.schedule_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="教师确认" width="90" align="center">
            <template #default="{ row }">
              <el-icon v-if="row.teacher_confirmed" color="var(--el-color-success)"><Check /></el-icon>
              <el-icon v-else color="var(--el-color-info)"><Clock /></el-icon>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditSchedule(row)">
                编辑
              </el-button>
              <el-popconfirm title="确定删除此排期吗？" @confirm="handleDeleteSchedule(row)">
                <template #reference>
                  <el-button type="danger" link size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 排期编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editingSchedule?.id ? '编辑排期' : '添加排期'"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="scheduleFormRef" :model="scheduleForm" :rules="scheduleRules" label-width="100px">
        <el-form-item label="班级" prop="class_id">
          <el-select v-model="scheduleForm.class_id" placeholder="选择班级" style="width: 100%">
            <el-option
              v-for="item in classList"
              :key="item.id"
              :label="item.class_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="教师" prop="teacher_id">
          <el-select v-model="scheduleForm.teacher_id" placeholder="选择教师" style="width: 100%">
            <el-option
              v-for="item in teacherList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="开始日期" prop="planned_start_date">
          <el-date-picker
            v-model="scheduleForm.planned_start_date"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="planned_end_date">
          <el-date-picker
            v-model="scheduleForm.planned_end_date"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="总课时">
          <el-input-number
            v-model="scheduleForm.total_sessions"
            :min="1"
            :max="100"
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="排课时间">
          <div class="weekday-selector">
            <el-checkbox-group v-model="scheduleForm.weekdays">
              <el-checkbox :value="1">周一</el-checkbox>
              <el-checkbox :value="2">周二</el-checkbox>
              <el-checkbox :value="3">周三</el-checkbox>
              <el-checkbox :value="4">周四</el-checkbox>
              <el-checkbox :value="5">周五</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="scheduleForm.notes"
            type="textarea"
            :rows="2"
            placeholder="排期备注（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveSchedule">
          保存
        </el-button>
      </template>
    </el-dialog>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Plus, Check, Clock } from '@element-plus/icons-vue';
import {
  getCourseSchedules,
  createCourseSchedule,
  updateCourseSchedule,
  deleteCourseSchedule,
  type CustomCourse,
  type CourseSchedule
} from '@/api/endpoints/custom-course';

// 班级列表和教师列表导入（暂时使用模拟数据）
// import { classApi } from '@/api/endpoints/class';
// import { teacherApi } from '@/api/endpoints/teacher';

// Props
interface Props {
  visible: boolean;
  course?: CustomCourse | null;
}

const props = withDefaults(defineProps<Props>(), {
  course: null
});

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'saved'): void;
}>();

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 数据
const loading = ref(false);
const schedules = ref<CourseSchedule[]>([]);
const classList = ref<Array<{ id: number; class_name: string }>>([]);
const teacherList = ref<Array<{ id: number; name: string }>>([]);

// 编辑对话框
const editDialogVisible = ref(false);
const editingSchedule = ref<CourseSchedule | null>(null);
const scheduleFormRef = ref<FormInstance>();
const saving = ref(false);

const scheduleForm = reactive({
  class_id: undefined as number | undefined,
  teacher_id: undefined as number | undefined,
  planned_start_date: '',
  planned_end_date: '',
  total_sessions: 16,
  weekdays: [1, 3, 5] as number[],
  notes: ''
});

const scheduleRules: FormRules = {
  class_id: [{ required: true, message: '请选择班级', trigger: 'change' }],
  teacher_id: [{ required: true, message: '请选择教师', trigger: 'change' }],
  planned_start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  planned_end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
};

// 监听course变化
watch(
  () => props.course,
  async (newCourse) => {
    if (newCourse?.id && props.visible) {
      await loadSchedules();
      await loadOptions();
    }
  },
  { immediate: true }
);

watch(
  () => props.visible,
  async (visible) => {
    if (visible && props.course?.id) {
      await loadSchedules();
      await loadOptions();
    }
  }
);

// 加载排期列表
const loadSchedules = async () => {
  if (!props.course?.id) return;

  try {
    loading.value = true;
    const res = await getCourseSchedules(props.course.id);
    if (res.success) {
      schedules.value = res.data;
    }
  } catch (error) {
    console.error('加载排期失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载班级和教师列表
const loadOptions = async () => {
  try {
    // 暂时使用模拟数据，等待实际API完成
    classList.value = [
      { id: 1, class_name: '小班1' },
      { id: 2, class_name: '小班2' },
      { id: 3, class_name: '中班1' },
      { id: 4, class_name: '中班2' },
      { id: 5, class_name: '大班1' },
      { id: 6, class_name: '大班2' }
    ];

    teacherList.value = [
      { id: 1, name: '王老师' },
      { id: 2, name: '李老师' },
      { id: 3, name: '张老师' },
      { id: 4, name: '刘老师' },
      { id: 5, name: '陈老师' }
    ];

    // TODO: 当班级和教师API完成后，使用以下代码：
    // const [classRes, teacherRes] = await Promise.all([
    //   classApi.getClassList({ page: 1, pageSize: 100 }),
    //   teacherApi.getTeacherList({ page: 1, pageSize: 100 })
    // ]);
    // if (classRes.success) {
    //   classList.value = classRes.data?.list || classRes.data || [];
    // }
    // if (teacherRes.success) {
    //   teacherList.value = teacherRes.data?.list || teacherRes.data || [];
    // }
  } catch (error) {
    console.error('加载选项失败:', error);
  }
};

// 获取年龄组标签
const getAgeGroupLabel = (ageGroup: string): string => {
  const labels: Record<string, string> = {
    '3-4': '小班',
    '4-5': '中班',
    '5-6': '大班',
    '3-6': '全年龄段'
  };
  return labels[ageGroup] || ageGroup;
};

// 格式化日期
const formatDate = (date: string): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

// 获取进度状态
const getProgressStatus = (row: CourseSchedule): 'success' | 'exception' | '' => {
  const percentage = row.completed_sessions / row.total_sessions;
  if (percentage >= 1) return 'success';
  if (row.schedule_status === 'delayed') return 'exception';
  return '';
};

// 获取状态类型
const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'pending': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'delayed': 'danger',
    'cancelled': 'info'
  };
  return typeMap[status] || 'info';
};

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'delayed': '已延期',
    'cancelled': '已取消'
  };
  return labelMap[status] || status;
};

// 添加排期
const handleAddSchedule = () => {
  editingSchedule.value = null;
  scheduleForm.class_id = undefined;
  scheduleForm.teacher_id = undefined;
  scheduleForm.planned_start_date = '';
  scheduleForm.planned_end_date = '';
  scheduleForm.total_sessions = props.course?.total_sessions || 16;
  scheduleForm.weekdays = [1, 3, 5];
  scheduleForm.notes = '';
  editDialogVisible.value = true;
};

// 编辑排期
const handleEditSchedule = (schedule: CourseSchedule) => {
  editingSchedule.value = schedule;
  scheduleForm.class_id = schedule.class_id;
  scheduleForm.teacher_id = schedule.teacher_id;
  scheduleForm.planned_start_date = schedule.planned_start_date;
  scheduleForm.planned_end_date = schedule.planned_end_date;
  scheduleForm.total_sessions = schedule.total_sessions;
  scheduleForm.weekdays = schedule.schedule_config?.weekdays || [1, 3, 5];
  scheduleForm.notes = schedule.notes || '';
  editDialogVisible.value = true;
};

// 保存排期
const handleSaveSchedule = async () => {
  if (!scheduleFormRef.value) return;

  try {
    await scheduleFormRef.value.validate();
    saving.value = true;

    const scheduleData = {
      class_id: scheduleForm.class_id,
      teacher_id: scheduleForm.teacher_id,
      planned_start_date: scheduleForm.planned_start_date,
      planned_end_date: scheduleForm.planned_end_date,
      total_sessions: scheduleForm.total_sessions,
      schedule_config: {
        weekdays: scheduleForm.weekdays,
        time_slots: []
      },
      notes: scheduleForm.notes
    };

    let res;
    if (editingSchedule.value?.id) {
      res = await updateCourseSchedule(editingSchedule.value.id, scheduleData);
    } else if (props.course?.id) {
      res = await createCourseSchedule(props.course.id, scheduleData);
    }

    if (res?.success) {
      ElMessage.success('保存成功');
      editDialogVisible.value = false;
      await loadSchedules();
      emit('saved');
    }
  } catch (error) {
    console.error('保存排期失败:', error);
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 删除排期
const handleDeleteSchedule = async (schedule: CourseSchedule) => {
  try {
    const res = await deleteCourseSchedule(schedule.id);
    if (res.success) {
      ElMessage.success('删除成功');
      await loadSchedules();
      emit('saved');
    }
  } catch (error) {
    console.error('删除排期失败:', error);
    ElMessage.error('删除失败');
  }
};
</script>

<style lang="scss" scoped>
.course-schedule-dialog {
  .schedule-content {
    min-height: 300px;
  }
}

.course-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  margin-bottom: 20px;

  .course-icon {
    font-size: 40px;
  }

  .course-details {
    flex: 1;

    .course-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .course-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
}

.schedule-table {
  .date-range {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;

    .date-separator {
      color: var(--el-text-color-placeholder);
    }
  }

  .progress-text {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    text-align: center;
  }
}

.weekday-selector {
  :deep(.el-checkbox-group) {
    display: flex;
    gap: 8px;
  }
}
</style>

