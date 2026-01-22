<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">创建班级</h1>
      <div class="page-actions">
        <el-button @click="handleCancel">
          <UnifiedIcon name="Close" />
          取消
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="loading.submit">
          <UnifiedIcon name="Check" />
          保存
        </el-button>
      </div>
    </div>

    <!-- 步骤指示器 -->
    <el-card class="steps-section" shadow="never">
      <el-steps :active="currentStep" finish-status="success">
        <el-step title="基本信息" description="班级基础信息设置" />
        <el-step title="教师配置" description="分配班主任和任课教师" />
        <el-step title="学生管理" description="添加班级学生" />
        <el-step title="课程安排" description="设置课程表" />
        <el-step title="完成创建" description="确认信息并创建班级" />
      </el-steps>
    </el-card>

    <!-- 表单内容 -->
    <el-card class="form-section" shadow="never">
      <!-- 步骤1: 基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <h3 class="step-title">基本信息</h3>
        <el-form 
          ref="basicFormRef"
          :model="formData.basic" 
          :rules="basicRules" 
          label-width="120px"
          class="step-form"
        >
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <el-form-item label="班级名称" prop="name">
                <el-input v-model="formData.basic.name" placeholder="请输入班级名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="班级编号" prop="code">
                <el-input v-model="formData.basic.code" placeholder="请输入班级编号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <el-form-item label="年龄段" prop="ageGroup">
                <el-select v-model="formData.basic.ageGroup" placeholder="请选择年龄段">
                  <el-option 
                    v-for="item in ageGroupOptions" 
                    :key="item.value" 
                    :label="item.label" 
                    :value="item.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="班级容量" prop="capacity">
                <el-input-number 
                  v-model="formData.basic.capacity" 
                  :min="1" 
                  :max="50" 
                  placeholder="班级容量"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <el-form-item label="教室" prop="classroom">
                <el-select v-model="formData.basic.classroom" placeholder="请选择教室">
                  <el-option 
                    v-for="item in classroomOptions" 
                    :key="item.value" 
                    :label="item.label" 
                    :value="item.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="开班日期" prop="startDate">
                <el-date-picker
                  v-model="formData.basic.startDate"
                  type="date"
                  placeholder="选择开班日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="班级描述" prop="description">
            <el-input 
              v-model="formData.basic.description" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入班级描述"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 教师配置 -->
      <div v-show="currentStep === 1" class="step-content">
        <h3 class="step-title">教师配置</h3>
        <el-form 
          ref="teacherFormRef"
          :model="formData.teachers" 
          :rules="teacherRules" 
          label-width="120px"
          class="step-form"
        >
          <el-form-item label="班主任" prop="headTeacher">
            <el-select 
              v-model="formData.teachers.headTeacher" 
              placeholder="请选择班主任"
              filterable
              style="width: 100%"
            >
              <el-option 
                v-for="teacher in availableTeachers" 
                :key="teacher.id" 
                :label="`${teacher.name} - ${teacher.subject}`" 
                :value="teacher.id" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="任课教师">
            <div class="teacher-list">
              <div 
                v-for="(teacher, index) in formData.teachers.subjectTeachers" 
                :key="index"
                class="teacher-item"
              >
                <el-row :gutter="12">
                  <el-col :span="8">
                    <el-select v-model="teacher.subject" placeholder="选择科目">
                      <el-option 
                        v-for="subject in subjectOptions" 
                        :key="subject.value" 
                        :label="subject.label" 
                        :value="subject.value" 
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="12">
                    <el-select 
                      v-model="teacher.teacherId" 
                      placeholder="选择教师"
                      filterable
                    >
                      <el-option 
                        v-for="t in getAvailableTeachersBySubject(teacher.subject)" 
                        :key="t.id" 
                        :label="t.name" 
                        :value="t.id" 
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="4">
                    <el-button 
                      type="danger" 
                      @click="removeTeacher(index)"
                      :disabled="formData.teachers.subjectTeachers.length <= 1"
                    >
                      删除
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <el-button type="primary" @click="addTeacher" style="margin-top: var(--text-sm);">
                <UnifiedIcon name="Plus" />
                添加教师
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3: 学生管理 -->
      <div v-show="currentStep === 2" class="step-content">
        <h3 class="step-title">学生管理</h3>
        <div class="student-section">
          <div class="student-actions">
            <el-button type="primary" @click="handleAddStudent">
              <UnifiedIcon name="Plus" />
              添加学生
            </el-button>
            <el-button type="success" @click="handleBatchImport">
              <UnifiedIcon name="Upload" />
              批量导入
            </el-button>
          </div>
          
          <div class="table-wrapper">
<el-table class="responsive-table" :data="formData.students" style="width: 100%; margin-top: var(--text-lg);">
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="gender" label="性别" width="80">
              <template #default="scope">
                {{ scope.row.gender === 'male' ? '男' : '女' }}
              </template>
            </el-table-column>
            <el-table-column prop="age" label="年龄" width="80" />
            <el-table-column prop="parentName" label="家长姓名" width="120" />
            <el-table-column prop="parentPhone" label="联系电话" width="140" />
            <el-table-column prop="address" label="地址" min-width="200" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="warning" size="small" @click="handleEditStudent(scope.$index)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleRemoveStudent(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
      </div>

      <!-- 步骤4: 课程安排 -->
      <div v-show="currentStep === 3" class="step-content">
        <h3 class="step-title">课程安排</h3>
        <div class="schedule-section">
          <div class="schedule-grid">
            <div class="time-header">时间</div>
            <div 
              v-for="day in weekDays" 
              :key="day.value"
              class="day-header"
            >
              {{ day.label }}
            </div>
            
            <template v-for="time in timeSlots" :key="time">
              <div class="time-cell">{{ time }}</div>
              <div 
                v-for="day in weekDays" 
                :key="`${day.value}-${time}`"
                class="schedule-cell"
                @click="handleScheduleClick(day.value, time)"
              >
                <div 
                  v-if="getScheduleItem(day.value, time)"
                  class="schedule-item"
                  :class="getScheduleItem(day.value, time)?.type"
                >
                  {{ getScheduleItem(day.value, time)?.subject }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 步骤5: 完成创建 -->
      <div v-show="currentStep === 4" class="step-content">
        <h3 class="step-title">确认信息</h3>
        <div class="summary-section">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="班级名称">{{ formData.basic.name }}</el-descriptions-item>
            <el-descriptions-item label="班级编号">{{ formData.basic.code }}</el-descriptions-item>
            <el-descriptions-item label="年龄段">{{ getAgeGroupText(formData.basic.ageGroup) }}</el-descriptions-item>
            <el-descriptions-item label="班级容量">{{ formData.basic.capacity }}人</el-descriptions-item>
            <el-descriptions-item label="教室">{{ getClassroomText(formData.basic.classroom) }}</el-descriptions-item>
            <el-descriptions-item label="开班日期">{{ formatDate(formData.basic.startDate) }}</el-descriptions-item>
            <el-descriptions-item label="班主任" :span="2">{{ getTeacherName(formData.teachers.headTeacher) }}</el-descriptions-item>
            <el-descriptions-item label="学生人数" :span="2">{{ formData.students.length }}人</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 步骤导航 -->
      <div class="step-navigation">
        <el-button 
          @click="handlePrevStep" 
          :disabled="currentStep === 0"
        >
          上一步
        </el-button>
        <el-button 
          type="primary" 
          @click="handleNextStep"
          :disabled="currentStep === 4"
        >
          下一步
        </el-button>
      </div>
    </el-card>

    <!-- 学生编辑对话框 -->
    <el-dialog 
      v-model="studentDialogVisible" 
      :title="studentDialogTitle" 
      width="600px"
      @close="handleStudentDialogClose"
    >
      <el-form 
        ref="studentFormRef"
        :model="studentFormData" 
        :rules="studentRules" 
        label-width="120px"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="学生姓名" prop="name">
              <el-input v-model="studentFormData.name" placeholder="请输入学生姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="studentFormData.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number 
                v-model="studentFormData.age" 
                :min="1" 
                :max="10" 
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker
                v-model="studentFormData.birthDate"
                type="date"
                placeholder="选择出生日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="家长姓名" prop="parentName">
              <el-input v-model="studentFormData.parentName" placeholder="请输入家长姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="parentPhone">
              <el-input v-model="studentFormData.parentPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="家庭地址" prop="address">
          <el-input v-model="studentFormData.address" placeholder="请输入家庭地址" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="studentDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="loading.student"
            @click="handleStudentSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 课程安排对话框 -->
    <el-dialog 
      v-model="scheduleDialogVisible" 
      title="添加课程" 
      width="400px"
    >
      <el-form 
        ref="scheduleFormRef"
        :model="scheduleFormData" 
        label-width="80px"
      >
        <el-form-item label="科目">
          <el-select v-model="scheduleFormData.subject" placeholder="选择科目">
            <el-option 
              v-for="subject in subjectOptions" 
              :key="subject.value" 
              :label="subject.label" 
              :value="subject.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教师">
          <el-select v-model="scheduleFormData.teacherId" placeholder="选择教师">
            <el-option 
              v-for="teacher in getAvailableTeachersBySubject(scheduleFormData.subject)" 
              :key="teacher.id" 
              :label="teacher.name" 
              :value="teacher.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="scheduleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleScheduleSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import type { FormRules } from 'element-plus'
import { 
  Close, Check, Plus, Upload
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import request from '../../utils/request'
import { formatDateTime } from '../../utils/dateFormat'
import { SafeArray, safeFind } from '../../utils/element-plus-fixes'

// 解构request实例中的方法
const { get, post, put, del } = request

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 教师数据类型
interface Teacher {
  id: string;
  name: string;
  subject: string
}

// 学生数据类型
interface Student {
  name: string;
  gender: string;
  age: number
  birthDate: string
  parentName: string
  parentPhone: string;
  address: string
}

// 课程安排类型
interface ScheduleItem {
  day: string;
  time: string;
  subject: string
  teacherId: string;
  type: string
}

const router = useRouter()
const basicFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const teacherFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const studentFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const scheduleFormRef = ref<InstanceType<typeof ElForm> | null>(null)

// 响应式数据
const loading = ref({
  submit: false,
  student: false
})

const currentStep = ref(0)
const studentDialogVisible = ref(false)
const studentDialogTitle = ref('')
const studentEditIndex = ref(-1)
const scheduleDialogVisible = ref(false)
const selectedScheduleSlot = ref({ day: '', time: '' })

// 表单数据
const formData = ref({
  basic: {
    name: '',
  code: '',
    ageGroup: '',
  capacity: 20,
  classroom: '',
    startDate: '',
  description: ''
  },
  teachers: {
    headTeacher: '',
    subjectTeachers: [
      { subject: '', teacherId: '' }
    ]
  },
  students: [] as Student[],
  schedule: [] as ScheduleItem[]
})

// 学生表单数据
const studentFormData = ref<Student>({
  name: '',
  gender: 'male',
  age: 3,
  birthDate: '',
  parentName: '',
  parentPhone: '',
  address: ''
})

// 课程安排表单数据
const scheduleFormData = ref({
  subject: '',
  teacherId: ''
})

// 可用教师列表
const availableTeachers = ref<Teacher[]>([])

// 表单验证规则
const basicRules: FormRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入班级编号', trigger: 'blur' }
  ],
  ageGroup: [
    { required: true, message: '请选择年龄段', trigger: 'change' }
  ],
  capacity: [
    { required: true, message: '请输入班级容量', trigger: 'blur' }
  ],
  classroom: [
    { required: true, message: '请选择教室', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开班日期', trigger: 'change' }
  ]
}

const teacherRules: FormRules = {
  mainTeacher: [
    { required: true, message: '请选择主讲教师', trigger: 'change' }
  ]
}

const studentRules: FormRules = {
  // 学生相关验证规则可以在这里添加
}

// 选项数据
const ageGroupOptions = [
  { label: '小班 (3-4岁)', value: 'small' },
  { label: '中班 (4-5岁)', value: 'medium' },
  { label: '大班 (5-6岁)', value: 'large' },
  { label: '学前班 (6-7岁)', value: 'preschool' }
]

const classroomOptions = [
  { label: '教室A101', value: 'A101' },
  { label: '教室A102', value: 'A102' },
  { label: '教室B201', value: 'B201' },
  { label: '教室B202', value: 'B202' }
]

const subjectOptions = [
  { label: '语言', value: 'language' },
  { label: '数学', value: 'math' },
  { label: '科学', value: 'science' },
  { label: '艺术', value: 'art' },
  { label: '音乐', value: 'music' },
  { label: '体育', value: 'sports' }
]

const weekDays = [
  { label: '周一', value: 'monday' },
  { label: '周二', value: 'tuesday' },
  { label: '周三', value: 'wednesday' },
  { label: '周四', value: 'thursday' },
  { label: '周五', value: 'friday' }
]

const timeSlots = [
  '08:30-09:15',
  '09:25-10:10',
  '10:30-11:15',
  '11:25-12:10',
  '14:30-15:15',
  '15:25-16:10'
]

// 加载教师列表
const loadTeachers = async () => {
  try {
    const response: ApiResponse<Teacher[]> = await get('/api/teachers')
    if (response.success && response.data && Array.isArray(response.data)) {
      availableTeachers.value = response.data
    } else {
      console.warn('教师列表数据格式不正确:', response)
      availableTeachers.value = []
    }
  } catch (error) {
    console.error('加载教师列表失败:', error)
    availableTeachers.value = []
  }
}

// 根据科目获取可用教师
const getAvailableTeachersBySubject = (subject: string) => {
  const safeTeachers = new SafeArray(availableTeachers.value)
  return safeTeachers.filter(teacher => 
    teacher.subject === subject || teacher.subject === 'all'
  )
}

// 步骤导航
const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleNextStep = async () => {
  if (await validateCurrentStep()) {
    if (currentStep.value < 4) {
      currentStep.value++
    }
  }
}

// 验证当前步骤
const validateCurrentStep = async () => {
  switch (currentStep.value) {
    case 0:
      if (!basicFormRef.value) return false
      try {
        await basicFormRef.value.validate()
        return true
      } catch {
        return false
      }
    case 1:
      if (!teacherFormRef.value) return false
      try {
        await teacherFormRef.value.validate()
        return true
      } catch {
        return false
      }
    case 2:
      if (formData.value.students.length === 0) {
        ElMessage.warning('请至少添加一名学生')
        return false
      }
      return true
    case 3:
      return true;
  default:
      return true
  }
}

// 教师管理
const addTeacher = () => {
  formData.value.teachers.subjectTeachers.push({
    subject: '',
    teacherId: ''
  })
}

const removeTeacher = (index: number) => {
  formData.value.teachers.subjectTeachers.splice(index, 1)
}

// 学生管理
const handleAddStudent = () => {
  studentEditIndex.value = -1
  studentDialogTitle.value = '添加学生'
  studentFormData.value = {
    name: '',
  gender: 'male',
  age: 3,
    birthDate: '',
    parentName: '',
    parentPhone: '',
  address: ''
  }
  studentDialogVisible.value = true
}

const handleEditStudent = (index: number) => {
  studentEditIndex.value = index
  studentDialogTitle.value = '编辑学生'
  studentFormData.value = { ...formData.value.students[index] }
  studentDialogVisible.value = true
}

const handleRemoveStudent = (index: number) => {
  formData.value.students.splice(index, 1)
}

const handleStudentSubmit = async () => {
  if (!studentFormRef.value) return
  
  try {
    await studentFormRef.value.validate()
    loading.value.student = true
    
    if (studentEditIndex.value >= 0) {
      formData.value.students[studentEditIndex.value] = { ...studentFormData.value }
    } else {
      formData.value.students.push({ ...studentFormData.value })
    }
    
    studentDialogVisible.value = false
    ElMessage.success(studentEditIndex.value >= 0 ? '更新成功' : '添加成功')
  } catch (error) {
    console.error('学生信息提交失败:', error)
  } finally {
    loading.value.student = false
  }
}

const handleStudentDialogClose = () => {
  if (studentFormRef.value) {
    studentFormRef.value.resetFields()
  }
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中')
}

// 课程安排
const handleScheduleClick = (day: string, time: string) => {
  selectedScheduleSlot.value = { day, time }
  scheduleFormData.value = {
    subject: '',
    teacherId: ''
  }
  scheduleDialogVisible.value = true
}

const handleScheduleSubmit = () => {
  if (!scheduleFormData.value.subject || !scheduleFormData.value.teacherId) {
    ElMessage.warning('请选择科目和教师')
    return
  }
  
  const existingIndex = formData.value.schedule.findIndex(item => 
    item.day === selectedScheduleSlot.value.day && 
    item.time === selectedScheduleSlot.value.time
  )
  
  const scheduleItem: ScheduleItem = {
    day: selectedScheduleSlot.value.day,
  time: selectedScheduleSlot.value.time,
  subject: scheduleFormData.value.subject,
    teacherId: scheduleFormData.value.teacherId,
  type: 'class'
  }
  
  if (existingIndex >= 0) {
    formData.value.schedule[existingIndex] = scheduleItem
  } else {
    formData.value.schedule.push(scheduleItem)
  }
  
  scheduleDialogVisible.value = false
  ElMessage.success('课程安排已保存')
}

const getScheduleItem = (day: string, time: string) => {
  return formData.value.schedule.find(item => 
    item.day === day && item.time === time
  )
}

// 工具函数
const getAgeGroupText = (value: string) => {
  const option = ageGroupOptions.find(item => item.value === value)
  return option ? option.label : value
}

const getClassroomText = (value: string) => {
  const option = classroomOptions.find(item => item.value === value)
  return option ? option.label : value
}

const getTeacherName = (teacherId: string) => {
  const safeTeachers = new SafeArray(availableTeachers.value)
  const teacher = safeTeachers.find(t => t.id === teacherId)
  return teacher ? teacher.name : ''
}

const formatDate = (date: string) => {
  return date ? new Date(date).toLocaleDateString() : ''
}

// 保存和取消
const handleSave = async () => {
  if (currentStep.value !== 4) {
    ElMessage.warning('请完成所有步骤后再保存')
    return
  }
  
  try {
    loading.value.submit = true
    
    const classData = {
      ...formData.value.basic,
  teachers: formData.value.teachers,
  students: formData.value.students,
  schedule: formData.value.schedule
    }
    
    const response: ApiResponse = await post('/classes', classData)
    if (response.success) {
      ElMessage.success('班级创建成功')
      router.push('/classes')
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value.submit = false
  }
}

const handleCancel = () => {
  router.back()
}

// 页面初始化
onMounted(() => {
  loadTeachers()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-page); /* 白色区域修复：使用主题背景色 */
  min-height: calc(100vh - var(--header-height, 60px));
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  background: var(--gradient-green); /* 硬编码修复：使用绿色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* 按钮排版修复：页面头部操作按钮 */
.page-actions {
  display: flex;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  align-items: center;
}

.steps-section {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

.form-section {
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

.step-content {
  min-min-min-height: 60px; height: auto; height: auto;
  padding: var(--app-gap) 0; /* 硬编码修复：使用统一间距变量 */
}

.step-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  border-bottom: var(--transform-drop) solid var(--primary-color); /* 白色区域修复：使用主题主色 */
}

.step-form {
  max-width: 100%; max-width: 100%; max-width: 800px;
}

.teacher-list {
  background: var(--bg-tertiary); /* 白色区域修复：使用主题背景 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.teacher-item {
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  
  &:last-child {
    margin-bottom: 0;
  }
}

.student-section {
  max-width: 100%;
}

/* 按钮排版修复：学生操作按钮 */
.student-actions {
  display: flex;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  align-items: center;
  flex-wrap: wrap;
}

.schedule-section {
  max-width: 100%;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 120px repeat(5, 1fr);
  gap: var(--spacing-xs);
  background: var(--border-color); /* 白色区域修复：使用主题边框色 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.time-header,
.day-header {
  background: var(--primary-light-9); /* 白色区域修复：使用主题浅色背景 */
  padding: var(--app-gap-sm) var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  font-weight: 600;
  text-align: center;
  color: var(--primary-color); /* 白色区域修复：使用主题主色 */
}

.time-cell {
  background: var(--primary-light-9); /* 白色区域修复：使用主题浅色背景 */
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  font-size: var(--text-xs);
  text-align: center;
  color: var(--primary-color); /* 白色区域修复：使用主题主色 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.schedule-cell {
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  min-height: 60px;
  padding: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--bg-hover); /* 白色区域修复：使用主题悬停背景 */
  }
}

.schedule-item {
  width: 100%;
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  border-radius: var(--radius-sm); /* 硬编码修复：使用统一圆角变量 */
  text-align: center;
  font-size: var(--text-xs);
  font-weight: 500;
  
  &.class {
    background: var(--primary-light-8); /* 白色区域修复：使用主题浅色背景 */
  color: var(--primary-color); /* 白色区域修复：使用主题主色 */
  }
}

.summary-section {
  max-width: 800px;
}

/* 按钮排版修复：步骤导航按钮 */
.step-navigation {
  display: flex;
  justify-content: center;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  margin-top: var(--spacing-xl); /* 硬编码修复：使用统一间距变量 */
  padding-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  border-top: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  align-items: center;
}

/* 白色区域修复：Card组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-card__header {
    background: var(--bg-tertiary) !important;
    border-bottom-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }
  
  .el-card__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
}

/* 白色区域修复：Steps组件主题化 */
:deep(.el-steps) {
  .el-step__head {
    &.is-process {
      color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
    }
    
    &.is-finish {
      color: var(--success-color) !important;
      border-color: var(--success-color) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
      border-color: var(--border-color) !important;
    }
  }
  
  .el-step__title {
    &.is-process {
      color: var(--primary-color) !important;
    }
    
    &.is-finish {
      color: var(--success-color) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
    }
  }
  
  .el-step__description {
    &.is-process {
      color: var(--text-secondary) !important;
    }
    
    &.is-finish {
      color: var(--text-secondary) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
    }
  }
  
  .el-step__line {
    background: var(--border-color) !important;
    
    &.is-finish {
      background: var(--success-color) !important;
    }
  }
}

/* 白色区域修复：表单组件主题化 */
:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
}

:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &.is-focus {
      border-color: var(--primary-color) !important;
    }
  }
  
  .el-input__inner {
    background: transparent !important;
    color: var(--text-primary) !important;
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &:focus {
      border-color: var(--primary-color) !important;
    }
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-input-number) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-date-editor) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：按钮主题化 */
:deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    
    &:hover {
      background: var(--primary-light) !important;
      border-color: var(--primary-light) !important;
    }
  }
  
  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;
    
    &:hover {
      background: var(--success-light) !important;
      border-color: var(--success-light) !important;
    }
  }
  
  &.el-button--danger {
    background: var(--danger-color) !important;
    border-color: var(--danger-color) !important;
    
    &:hover {
      background: var(--danger-light) !important;
      border-color: var(--danger-light) !important;
    }
  }
  
  &.el-button--default {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
      border-color: var(--border-light) !important;
    }
  }
}

/* 白色区域修复：表格组件主题化 */
:deep(.el-table) {
  background: transparent !important;
  
  .el-table__header-wrapper {
    background: var(--bg-tertiary) !important;
  }
  
  tr {
    background: transparent !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.el-table__row--striped {
      background: var(--bg-tertiary) !important;
      
      &:hover {
        background: var(--bg-hover) !important;
      }
    }
  }
  
  th {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border-bottom: var(--z-index-dropdown) solid var(--border-color) !important;
    font-weight: 600;
  }
  
  td {
    background: transparent !important;
    color: var(--text-primary) !important;
    border-bottom: var(--z-index-dropdown) solid var(--border-color) !important;
  }
  
  .el-table__empty-block {
    background: var(--bg-card) !important;
    color: var(--text-muted) !important;
  }
}

/* 白色区域修复：对话框主题化 */
:deep(.el-dialog) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  
  .el-dialog__header {
    background: var(--bg-tertiary) !important;
    border-bottom: var(--z-index-dropdown) solid var(--border-color) !important;
    
    .el-dialog__title {
      color: var(--text-primary) !important;
    }
  }
  
  .el-dialog__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
  
  .el-dialog__footer {
    background: var(--bg-tertiary) !important;
    border-top: var(--z-index-dropdown) solid var(--border-color) !important;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .class-create-page {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
    
    .page-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .step-form {
    max-width: 100%;
  }
  
  .schedule-grid {
    grid-template-columns: 80px repeat(5, 1fr);
    font-size: var(--text-xs);
  }
  
  .time-header,
  .day-header {
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  font-size: var(--text-xs);
  }
  
  .time-cell {
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  font-size: var(--spacing-sm);
  }
  
  .schedule-cell {
    min-height: var(--button-height-lg);
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  .schedule-item {
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  font-size: var(--spacing-sm);
  }
  
  /* 按钮排版修复：移动端按钮优化 */
  .page-actions,
  .student-actions,
  .step-navigation {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
      justify-content: center;
      margin-bottom: var(--app-gap-xs);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .teacher-item {
    .el-row {
      .el-col {
        margin-bottom: var(--app-gap-xs);
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .step-content {
    min-min-height: 60px; height: auto;
  }
  
  .summary-section {
    max-width: 100%;
  }
}
</style>

