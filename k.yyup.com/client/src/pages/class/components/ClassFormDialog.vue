<template>
  <el-dialog
    :title="isEdit ? '编辑班级' : '新建班级'"
    :model-value="visible"
    @update:model-value="setVisible"
    :width="isDesktop ? '750px' : '95%'"
    :destroy-on-close="true"
    class="class-form-dialog"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="班级名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入班级名称" />
      </el-form-item>
      
      <el-form-item label="班级类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择班级类型" style="width: 100%">
          <el-option label="全日制" value="FULL_TIME" />
          <el-option label="半日制" value="HALF_TIME" />
          <el-option label="特色班" value="SPECIAL" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="班级容量" prop="capacity">
        <el-input-number v-model="form.capacity" :min="1" :max="100" style="width: 100%" />
      </el-form-item>
      
      <el-form-item label="年龄范围" prop="ageRange">
        <el-input v-model="form.ageRange" placeholder="例如: 3-4岁" />
      </el-form-item>
      
      <el-form-item label="班主任" prop="headTeacherId">
        <el-select
          v-model="form.headTeacherId"
          filterable
          remote
          reserve-keyword
          placeholder="请输入教师姓名搜索"
          :remote-method="remoteSearchTeachers"
          :loading="teachersLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in teacherOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="助理教师" prop="assistantTeacherIds">
        <el-select
          v-model="form.assistantTeacherIds"
          filterable
          remote
          multiple
          reserve-keyword
          placeholder="请输入教师姓名搜索"
          :remote-method="remoteSearchTeachers"
          :loading="teachersLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in teacherOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="教室" prop="classroom">
        <el-select
          v-model="form.classroom"
          filterable
          placeholder="请选择教室"
          style="width: 100%"
        >
          <el-option
            v-for="room in classroomOptions"
            :key="room"
            :label="room"
            :value="room"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="开班日期" prop="startDate">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      
      <el-form-item label="结业日期" prop="endDate">
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="选择日期（可选）"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      
      <el-form-item label="班级描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入班级描述"
        />
      </el-form-item>
      
      <el-form-item label="课程表" prop="schedule">
        <div class="schedule-container">
          <div v-for="(day, index) in weekDays" :key="index" class="schedule-day">
            <div class="day-header">{{ day }}</div>
            <div class="day-content">
              <div class="time-slot">
                <el-checkbox v-model="morningSchedule[index + 1]" @change="updateSchedule">上午</el-checkbox>
                <template v-if="morningSchedule[index + 1]">
                  <el-input
                    v-model="morningSubjects[index + 1]"
                    placeholder="课程名称"
                    size="small"
                    @change="updateSchedule"
                  />
                  <div class="time-inputs">
                    <el-time-select
                      v-model="morningStartTimes[index + 1]"
                      start="08:00"
                      step="00:30"
                      end="12:00"
                      placeholder="开始时间"
                      size="small"
                      @change="updateSchedule"
                    />
                    <el-time-select
                      v-model="morningEndTimes[index + 1]"
                      start="08:30"
                      step="00:30"
                      end="12:30"
                      placeholder="结束时间"
                      size="small"
                      @change="updateSchedule"
                    />
                  </div>
                </template>
              </div>
              <div class="time-slot">
                <el-checkbox v-model="afternoonSchedule[index + 1]" @change="updateSchedule">下午</el-checkbox>
                <template v-if="afternoonSchedule[index + 1]">
                  <el-input
                    v-model="afternoonSubjects[index + 1]"
                    placeholder="课程名称"
                    size="small"
                    @change="updateSchedule"
                  />
                  <div class="time-inputs">
                    <el-time-select
                      v-model="afternoonStartTimes[index + 1]"
                      start="13:00"
                      step="00:30"
                      end="17:00"
                      placeholder="开始时间"
                      size="small"
                      @change="updateSchedule"
                    />
                    <el-time-select
                      v-model="afternoonEndTimes[index + 1]"
                      start="13:30"
                      step="00:30"
                      end="17:30"
                      placeholder="结束时间"
                      size="small"
                      @change="updateSchedule"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  createClass, 
  updateClass, 
  getClassDetail, 
  getAvailableClassrooms 
} from '@/api/modules/class'
import { getTeacherList } from '@/api/modules/teacher'

// 类型定义
interface ScheduleItem {
  day: number;
  subject: string
  startTime: string
  endTime: string
}

interface ExtendedTeacherInfo {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE'
  age?: number
  contact?: string
  email?: string
  position?: string
  isHeadTeacher?: boolean
}

// Props和Emits
interface Props {
  modelValue: boolean
  classId?: string
}

const props = withDefaults(defineProps<Props>(), {
  classId: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const submitting = ref(false)
const teachersLoading = ref(false)

// 表单数据
const form = ref({
  name: '',
  type: 'FULL_TIME',
  capacity: 30,
  ageRange: '3-4岁',
  headTeacherId: '',
  assistantTeacherIds: [] as string[],
  classroom: '',
  startDate: '',
  endDate: '',
  description: '',
  schedule: [] as ScheduleItem[]
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择班级类型', trigger: 'change' }
  ],
  capacity: [
    { required: true, message: '请设置班级容量', trigger: 'blur' },
    { type: 'number', min: 1, message: '容量必须大于0', trigger: 'blur' }
  ],
  ageRange: [
    { required: true, message: '请输入年龄范围', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开班日期', trigger: 'change' }
  ],
  classroom: [
    { required: true, message: '请选择教室', trigger: 'change' }
  ]
}

// 教室选项
const classroomOptions = ref<string[]>([])

// 教师选项
const teacherOptions = ref<ExtendedTeacherInfo[]>([])

// 课程表相关数据
const weekDays = ['周一', '周二', '周三', '周四', '周五']
const morningSchedule = ref<Record<number, boolean>>({})
const afternoonSchedule = ref<Record<number, boolean>>({})
const morningSubjects = ref<Record<number, string>>({})
const afternoonSubjects = ref<Record<number, string>>({})
const morningStartTimes = ref<Record<number, string>>({})
const morningEndTimes = ref<Record<number, string>>({})
const afternoonStartTimes = ref<Record<number, string>>({})
const afternoonEndTimes = ref<Record<number, string>>({})

// 是否为编辑模式
const isEdit = computed(() => !!props.classId)

// 响应式设计
const isDesktop = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768
  }
  return true
})

// 对话框显示状态
const visible = computed(() => props.modelValue)
const setVisible = (val: boolean) => emit('update:modelValue', val)

// 监听班级ID变化
watch(() => props.classId, (newVal) => {
  if (newVal && visible.value) {
    fetchClassDetail(newVal)
  }
})

// 监听对话框状态
watch(() => visible.value, (newVal) => {
  if (newVal) {
    if (props.classId) {
      fetchClassDetail(props.classId)
    } else {
      resetForm()
    }
    fetchClassrooms()
  }
})

// 初始化
onMounted(() => {
  if (visible.value && props.classId) {
    fetchClassDetail(props.classId)
  }
  fetchClassrooms()
})

// 获取班级详情
const fetchClassDetail = async (id: string) => {
  loading.value = true
  try {
    const response = await getClassDetail(id)
    if (response.data) {
      const classInfo = response.data
      // 填充表单数据
      form.value.name = classInfo.name || ''
      form.value.type = classInfo.type || 'FULL_TIME'
      form.value.capacity = classInfo.capacity || 30
      form.value.ageRange = classInfo.ageRange || '3-4岁'
      form.value.classroom = classInfo.classroom || ''
      form.value.startDate = classInfo.startDate || ''
      form.value.endDate = classInfo.endDate || ''
      form.value.description = classInfo.description || ''
      
      // 处理教师数据
      if (classInfo.headTeacherId) {
        form.value.headTeacherId = classInfo.headTeacherId
        if (classInfo.headTeacherName) {
          const headTeacher: ExtendedTeacherInfo = {
            id: classInfo.headTeacherId,
            name: classInfo.headTeacherName,
            gender: 'MALE'
          }
          teacherOptions.value.push(headTeacher)
        }
      }
      
      if (classInfo.assistantTeacherIds && Array.isArray(classInfo.assistantTeacherIds)) {
        form.value.assistantTeacherIds = classInfo.assistantTeacherIds
        if (classInfo.assistantTeacherNames && Array.isArray(classInfo.assistantTeacherNames)) {
          const assistants: ExtendedTeacherInfo[] = classInfo.assistantTeacherIds.map((id: string, index: number) => ({
            id,
            name: classInfo.assistantTeacherNames![index] || '未知教师',
            gender: 'MALE'
          }))
          teacherOptions.value.push(...assistants)
        }
      }
      
      // 处理课程表
      resetScheduleData()
      if (classInfo.schedule && Array.isArray(classInfo.schedule)) {
        classInfo.schedule.forEach((item: any) => {
          const isMorning = item.startTime < '12:00'
          const day = item.day
          
          if (isMorning) {
            morningSchedule.value[day] = true
            morningSubjects.value[day] = item.subject
            morningStartTimes.value[day] = item.startTime
            morningEndTimes.value[day] = item.endTime
          } else {
            afternoonSchedule.value[day] = true
            afternoonSubjects.value[day] = item.subject
            afternoonStartTimes.value[day] = item.startTime
            afternoonEndTimes.value[day] = item.endTime
          }
        })
        
        updateSchedule()
      }
    }
  } catch (error) {
    console.error('获取班级详情失败', error)
    ElMessage.error('获取班级详情失败')
  } finally {
    loading.value = false
  }
}

// 获取可用教室
const fetchClassrooms = async () => {
  try {
    const response = await getAvailableClassrooms()
    if (response.data && Array.isArray(response.data)) {
      classroomOptions.value = response.data
    }
  } catch (error) {
    console.error('获取教室列表失败', error)
  }
}

// 远程搜索教师
const remoteSearchTeachers = async (query: string) => {
  if (query) {
    teachersLoading.value = true
    try {
      const response = await getTeacherList({ keyword: query, pageSize: 20 })
      if (response && response.items) {
        teacherOptions.value = response.items.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          gender: teacher.gender || 'MALE'
        }))
      }
    } catch (error) {
      console.error('搜索教师失败', error)
    } finally {
      teachersLoading.value = false
    }
  } else {
    teacherOptions.value = []
  }
}

// 更新课程表数据
const updateSchedule = () => {
  const schedule: ScheduleItem[] = []
  
  // 处理上午课程
  for (let day = 1; day <= 5; day++) {
    if (morningSchedule.value[day] && morningSubjects.value[day] && morningStartTimes.value[day] && morningEndTimes.value[day]) {
      schedule.push({
        day,
  subject: morningSubjects.value[day],
        startTime: morningStartTimes.value[day],
        endTime: morningEndTimes.value[day]
      })
    }
    
    if (afternoonSchedule.value[day] && afternoonSubjects.value[day] && afternoonStartTimes.value[day] && afternoonEndTimes.value[day]) {
      schedule.push({
        day,
  subject: afternoonSubjects.value[day],
        startTime: afternoonStartTimes.value[day],
        endTime: afternoonEndTimes.value[day]
      })
    }
  }
  
  form.value.schedule = schedule
}

// 重置课程表数据
const resetScheduleData = () => {
  for (let day = 1; day <= 5; day++) {
    morningSchedule.value[day] = false
    afternoonSchedule.value[day] = false
    morningSubjects.value[day] = ''
    afternoonSubjects.value[day] = ''
    morningStartTimes.value[day] = ''
    morningEndTimes.value[day] = ''
    afternoonStartTimes.value[day] = ''
    afternoonEndTimes.value[day] = ''
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value && typeof formRef.value.resetFields === 'function') {
    formRef.value.resetFields()
  }
  
  form.value = {
    name: '',
  type: 'FULL_TIME',
  capacity: 30,
    ageRange: '3-4岁',
    headTeacherId: '',
    assistantTeacherIds: [],
    startDate: '',
    endDate: '',
  classroom: '',
  description: '',
  schedule: []
  }
  
  resetScheduleData()
  teacherOptions.value = []
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (valid) {
      submitting.value = true
      try {
        let response
        if (isEdit.value) {
          response = await updateClass(props.classId || '', form.value)
          ElMessage.success('班级更新成功')
        } else {
          response = await createClass(form.value)
          ElMessage.success('班级创建成功')
        }
        setVisible(false)
        emit('success')
      } catch (error: any) {
        console.error('提交失败', error)
        ElMessage.error(error.message || '操作失败，请重试')
      } finally {
        submitting.value = false
      }
    }
  } catch (error) {
    console.error('表单验证失败', error)
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use './class-dialog-styles.scss' as *;

/* 课程表布局基础样式 */
.schedule-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--text-base);
  
  @media (max-width: var(--breakpoint-md)) {
    flex-direction: column;
    gap: var(--text-xs);
  }
}

.schedule-day {
  flex: 1;
  min-max-width: 200px; width: 100%;
  
  @media (max-width: var(--breakpoint-md)) {
    min-width: auto;
  }
}

.time-inputs {
  display: flex;
  gap: var(--text-xs);
  margin-top: var(--spacing-sm);
  
  @media (max-width: var(--breakpoint-sm)) {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style> 