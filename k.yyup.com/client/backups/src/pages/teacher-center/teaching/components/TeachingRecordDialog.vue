<template>
  <el-dialog
    v-model="visible"
    :title="record ? '编辑教学记录' : '新建教学记录'"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="班级" prop="classId">
            <el-select v-model="form.classId" placeholder="选择班级" style="width: 100%">
              <el-option label="大班A" value="1" />
              <el-option label="中班B" value="2" />
              <el-option label="小班C" value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程" prop="courseId">
            <el-select v-model="form.courseId" placeholder="选择课程" style="width: 100%">
              <el-option label="数学启蒙" value="1" />
              <el-option label="语言表达" value="2" />
              <el-option label="艺术创作" value="3" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="上课日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择上课日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程时长" prop="duration">
            <el-input-number 
              v-model="form.duration" 
              :min="1" 
              :max="300"
              placeholder="分钟"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="出勤人数" prop="attendance">
            <el-input-number 
              v-model="form.attendance" 
              :min="0" 
              :max="50"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程类型" prop="courseType">
            <el-select v-model="form.courseType" placeholder="选择课程类型" style="width: 100%">
              <el-option label="常规课程" value="regular" />
              <el-option label="复习课程" value="review" />
              <el-option label="实践活动" value="practice" />
              <el-option label="测评课程" value="assessment" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="教学内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请详细描述本次课程的教学内容"
        />
      </el-form-item>
      
      <el-form-item label="教学目标">
        <el-input
          v-model="form.objectives"
          type="textarea"
          :rows="2"
          placeholder="请输入本次课程的教学目标"
        />
      </el-form-item>
      
      <el-form-item label="学生表现">
        <el-input
          v-model="form.studentPerformance"
          type="textarea"
          :rows="3"
          placeholder="请描述学生在本次课程中的整体表现"
        />
      </el-form-item>
      
      <el-form-item label="课堂互动">
        <el-rate v-model="form.interactionLevel" :max="5" show-text />
      </el-form-item>
      
      <el-form-item label="教学效果">
        <el-rate v-model="form.effectivenessLevel" :max="5" show-text />
      </el-form-item>
      
      <el-form-item label="作业布置">
        <el-input
          v-model="form.homework"
          type="textarea"
          :rows="2"
          placeholder="请输入布置的作业内容（如有）"
        />
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="2"
          placeholder="其他需要记录的信息"
        />
      </el-form-item>
      
      <!-- 媒体文件上传 -->
      <el-form-item label="教学媒体">
        <el-upload
          ref="uploadRef"
          :file-list="mediaFiles"
          :on-change="handleMediaChange"
          :on-remove="handleMediaRemove"
          :before-upload="beforeUpload"
          :auto-upload="false"
          multiple
          accept="image/*,video/*"
        >
          <el-button size="small">
            <el-icon><Plus /></el-icon>
            添加媒体文件
          </el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持上传图片和视频文件，用于记录教学过程
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface TeachingRecord {
  id?: number
  classId: string
  courseId: string
  date: Date | null
  duration: number
  attendance: number
  courseType: string
  content: string
  objectives?: string
  studentPerformance?: string
  interactionLevel: number
  effectivenessLevel: number
  homework?: string
  notes?: string
  mediaFiles?: any[]
}

interface Props {
  modelValue: boolean
  record?: TeachingRecord | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: TeachingRecord): void
}

const props = withDefaults(defineProps<Props>(), {
  record: null
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const uploadRef = ref()
const saving = ref(false)
const mediaFiles = ref<UploadFiles>([])

const form = reactive<TeachingRecord>({
  classId: '',
  courseId: '',
  date: null,
  duration: 90,
  attendance: 0,
  courseType: 'regular',
  content: '',
  objectives: '',
  studentPerformance: '',
  interactionLevel: 3,
  effectivenessLevel: 3,
  homework: '',
  notes: '',
  mediaFiles: []
})

const rules: FormRules = {
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择上课日期', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入课程时长', trigger: 'blur' }
  ],
  attendance: [
    { required: true, message: '请输入出勤人数', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入教学内容', trigger: 'blur' },
    { min: 10, message: '教学内容至少10个字符', trigger: 'blur' }
  ]
}

// 重置表单函数（需要在watch之前定义）
const resetForm = () => {
  Object.assign(form, {
    classId: '',
    courseId: '',
    date: null,
    duration: 90,
    attendance: 0,
    courseType: 'regular',
    content: '',
    objectives: '',
    studentPerformance: '',
    interactionLevel: 3,
    effectivenessLevel: 3,
    homework: '',
    notes: '',
    mediaFiles: []
  })
  mediaFiles.value = []

  if (formRef.value && typeof formRef.value.resetFields === 'function') {
    formRef.value.resetFields()
  }
}

// 监听记录数据变化
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(form, {
      ...newRecord,
      date: newRecord.date ? new Date(newRecord.date) : null
    })
    mediaFiles.value = newRecord.mediaFiles || []
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听弹窗显示状态
watch(visible, (newVisible) => {
  if (!newVisible) {
    resetForm()
  }
})

const handleMediaChange = (file: UploadFile, files: UploadFiles) => {
  mediaFiles.value = files
  form.mediaFiles = files.map(f => ({
    name: f.name,
    size: f.size,
    type: f.raw?.type,
    file: f.raw
  }))
}

const handleMediaRemove = (file: UploadFile, files: UploadFiles) => {
  mediaFiles.value = files
  form.mediaFiles = files.map(f => ({
    name: f.name,
    size: f.size,
    type: f.raw?.type,
    file: f.raw
  }))
}

const beforeUpload = (file: File) => {
  const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
  if (!isValidType) {
    ElMessage.error('只能上传图片或视频文件')
    return false
  }
  
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 100MB')
    return false
  }
  
  return false // 阻止自动上传
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    const recordData = {
      ...form,
      date: form.date ? form.date.toISOString() : null
    }
    
    emit('save', recordData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
:deep(.el-upload__tip) {
  margin-top: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

:deep(.el-rate__text) {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
  
  :deep(.el-col) {
    margin-bottom: var(--text-lg);
  }
}
</style>
