<template>
  <el-dialog
    v-model="visible"
    title="添加教学记录"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="课程名称">
        <el-input :value="course?.brainScienceCourse?.course_name || '-'" disabled />
      </el-form-item>

      <el-form-item label="班级名称">
        <el-input :value="course?.class?.class_name || '-'" disabled />
      </el-form-item>

      <el-form-item label="上课日期" prop="lesson_date">
        <el-date-picker
          v-model="form.lesson_date"
          type="date"
          placeholder="选择上课日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="课时(分钟)" prop="lesson_duration">
        <el-input-number
          v-model="form.lesson_duration"
          :min="1"
          :max="240"
          placeholder="请输入课时时长"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="出勤人数" prop="attendance_count">
        <el-input-number
          v-model="form.attendance_count"
          :min="0"
          :max="100"
          placeholder="请输入出勤人数"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="教学内容" prop="teaching_content">
        <el-input
          v-model="form.teaching_content"
          type="textarea"
          :rows="4"
          placeholder="请输入本次课程的教学内容"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="学生反馈">
        <el-input
          v-model="form.student_feedback"
          type="textarea"
          :rows="3"
          placeholder="请输入学生的反馈情况（选填）"
          maxlength="300"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="教学备注">
        <el-input
          v-model="form.teaching_notes"
          type="textarea"
          :rows="3"
          placeholder="请输入教学备注（选填）"
          maxlength="300"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="作业布置">
        <el-input
          v-model="form.homework_assigned"
          type="textarea"
          :rows="2"
          placeholder="请输入布置的作业（选填）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="附件上传">
        <el-upload
          v-model:file-list="fileList"
          action="#"
          :auto-upload="false"
          :limit="3"
        >
          <el-button size="small">
            <UnifiedIcon name="Upload" />
            点击上传
          </el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持上传图片、PDF等文件，最多3个
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { type TeacherCourse } from '@/api/modules/teacher-courses'
import { type FormInstance, type FormRules } from 'element-plus'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: boolean
  course: TeacherCourse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: any]
}>()

const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref<FormInstance>()
const fileList = ref<any[]>([])

const form = reactive({
  lesson_date: dayjs().format('YYYY-MM-DD'),
  lesson_duration: 45,
  attendance_count: 0,
  teaching_content: '',
  student_feedback: '',
  teaching_notes: '',
  homework_assigned: ''
})

const rules: FormRules = {
  lesson_date: [
    { required: true, message: '请选择上课日期', trigger: 'change' }
  ],
  lesson_duration: [
    { required: true, message: '请输入课时时长', trigger: 'blur' }
  ],
  attendance_count: [
    { required: true, message: '请输入出勤人数', trigger: 'blur' }
  ],
  teaching_content: [
    { required: true, message: '请输入教学内容', trigger: 'blur' },
    { min: 10, message: '教学内容至少10个字符', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const resetForm = () => {
  form.lesson_date = dayjs().format('YYYY-MM-DD')
  form.lesson_duration = 45
  form.attendance_count = 0
  form.teaching_content = ''
  form.student_feedback = ''
  form.teaching_notes = ''
  form.homework_assigned = ''
  fileList.value = []
  formRef.value?.clearValidate()
}

const handleClose = () => {
  visible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 准备提交数据
    const data = {
      ...form,
      attachments: fileList.value.map(file => file.name)
    }
    
    emit('save', data)
    loading.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
}

.el-upload__tip {
  font-size: var(--text-xs);
  color: #909399;
  margin-top: 4px;
}
</style>
