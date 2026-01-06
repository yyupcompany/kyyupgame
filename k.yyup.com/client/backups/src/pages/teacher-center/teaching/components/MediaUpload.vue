<template>
  <el-dialog
    v-model="visible"
    title="上传教学媒体"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="班级" prop="classId">
        <el-select v-model="form.classId" placeholder="选择班级" style="width: 100%">
          <el-option label="大班A" value="1" />
          <el-option label="中班B" value="2" />
          <el-option label="小班C" value="3" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="课程" prop="courseId">
        <el-select v-model="form.courseId" placeholder="选择课程" style="width: 100%">
          <el-option label="数学启蒙" value="1" />
          <el-option label="语言表达" value="2" />
          <el-option label="艺术创作" value="3" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="媒体类型" prop="mediaType">
        <el-radio-group v-model="form.mediaType">
          <el-radio label="image">图片</el-radio>
          <el-radio label="video">视频</el-radio>
          <el-radio label="audio">音频</el-radio>
          <el-radio label="document">文档</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="文件上传" prop="files">
        <el-upload
          ref="uploadRef"
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :before-upload="beforeUpload"
          :auto-upload="false"
          multiple
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持多种格式，单个文件不超过 {{ FileUploadConfigManager.formatFileSize(FileUploadConfigManager.getMaxFileSize('media')) }}
            </div>
          </template>
        </el-upload>
      </el-form-item>
      
      <el-form-item label="媒体描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入媒体描述"
        />
      </el-form-item>
      
      <el-form-item label="标签">
        <el-input
          v-model="form.tags"
          placeholder="请输入标签，用逗号分隔"
        />
      </el-form-item>
    </el-form>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" :stroke-width="8" />
      <div class="progress-text">正在上传... {{ uploadProgress }}%</div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleUpload" :loading="uploading">
        {{ uploading ? '上传中...' : '开始上传' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import FileUploadConfigManager from '@/config/upload-config'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'upload-success', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const uploadRef = ref()
const uploading = ref(false)
const uploadProgress = ref(0)
const fileList = ref<UploadFiles>([])

const form = reactive({
  classId: '',
  courseId: '',
  mediaType: 'image',
  description: '',
  tags: '',
  files: []
})

const rules: FormRules = {
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  mediaType: [
    { required: true, message: '请选择媒体类型', trigger: 'change' }
  ]
}

// 重置表单函数（需要在watch之前定义）
const resetForm = () => {
  Object.assign(form, {
    classId: '',
    courseId: '',
    mediaType: 'image',
    description: '',
    tags: '',
    files: []
  })
  fileList.value = []
  uploadProgress.value = 0
  uploading.value = false

  if (formRef.value && typeof formRef.value.resetFields === 'function') {
    formRef.value.resetFields()
  }
}

// 监听弹窗显示状态
watch(visible, (newVisible) => {
  if (!newVisible) {
    resetForm()
  }
})

const handleFileChange = (file: UploadFile, files: UploadFiles) => {
  fileList.value = files
  form.files = files.map(f => f.raw).filter(Boolean)
}

const handleFileRemove = (file: UploadFile, files: UploadFiles) => {
  fileList.value = files
  form.files = files.map(f => f.raw).filter(Boolean)
}

const beforeUpload = (file: File) => {
  // 使用配置管理器进行文件验证
  const validation = FileUploadConfigManager.validateFile(file, form.mediaType)

  if (!validation.isValid) {
    validation.errors.forEach(error => {
      ElMessage.error(error)
    })
    return false
  }

  return false // 阻止自动上传
}

const handleUpload = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (fileList.value.length === 0) {
      ElMessage.error('请选择要上传的文件')
      return
    }
    
    uploading.value = true
    uploadProgress.value = 0
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 20
      }
    }, 200)
    
    // 模拟上传请求
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // TODO: 实际的文件上传逻辑
    const uploadData = {
      classId: form.classId,
      courseId: form.courseId,
      mediaType: form.mediaType,
      description: form.description,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      files: fileList.value.map(file => ({
        name: file.name,
        size: file.size,
        type: file.raw?.type
      }))
    }
    
    emit('upload-success', uploadData)
    ElMessage.success('媒体上传成功')
    visible.value = false
    
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

const handleCancel = () => {
  if (uploading.value) {
    ElMessage.warning('正在上传中，请稍后再试')
    return
  }
  visible.value = false
}
</script>

<style lang="scss" scoped>
.upload-progress {
  margin: var(--text-2xl) 0;
  
  .progress-text {
    text-align: center;
    margin-top: var(--spacing-sm);
    font-size: var(--text-base);
    color: var(--text-secondary);
  }
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
}

:deep(.el-upload__tip) {
  margin-top: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
}
</style>
