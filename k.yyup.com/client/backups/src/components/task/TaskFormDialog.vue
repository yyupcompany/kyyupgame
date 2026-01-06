<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :before-close="handleClose"
    destroy-on-close
    class="task-form-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="left"
      class="task-form"
    >
      <el-form-item label="任务标题" prop="title" required>
        <el-input
          v-model="formData.title"
          placeholder="请输入任务标题"
          clearable
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="任务描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入任务描述"
          clearable
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority" required>
            <el-select
              v-model="formData.priority"
              placeholder="请选择优先级"
              style="width: 100%"
            >
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
              <el-option label="紧急" value="highest" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="状态" prop="status" required>
            <el-select
              v-model="formData.status"
              placeholder="请选择状态"
              style="width: 100%"
            >
              <el-option label="待处理" value="pending" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分配给" prop="assignedTo">
            <el-select
              v-model="formData.assignedTo"
              placeholder="请选择分配人员"
              clearable
              style="width: 100%"
            >
              <el-option label="张老师" :value="1" />
              <el-option label="李老师" :value="2" />
              <el-option label="王老师" :value="3" />
              <el-option label="刘老师" :value="4" />
              <el-option label="陈老师" :value="5" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="截止时间" prop="dueDate">
            <el-date-picker
              v-model="formData.dueDate"
              type="datetime"
              placeholder="请选择截止时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="标签" prop="tags">
        <el-input
          v-model="formData.tags"
          placeholder="请输入标签，多个标签用逗号分隔"
          clearable
        />
      </el-form-item>

      <!-- 附件上传区域 -->
      <el-form-item label="附件" prop="attachments">
        <div class="attachment-upload-area">
          <el-upload
            ref="uploadRef"
            v-model:file-list="fileList"
            :action="uploadAction"
            :headers="uploadHeaders"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :limit="10"
            :on-exceed="handleExceed"
            multiple
            drag
            class="upload-demo"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                <div>支持上传图片、文档、视频等文件</div>
                <div class="file-type-tips">
                  <el-tag size="small" type="success">图片: jpg, png, gif (最大10MB)</el-tag>
                  <el-tag size="small" type="info">文档: pdf, doc, docx, xls, xlsx (最大20MB)</el-tag>
                  <el-tag size="small" type="warning">视频: mp4, avi, mov (最大100MB)</el-tag>
                </div>
                <div class="upload-limit-tip">最多上传10个文件</div>
              </div>
            </template>
          </el-upload>

          <!-- 已上传文件列表 -->
          <div v-if="uploadedFiles.length > 0" class="uploaded-files-list">
            <div class="list-header">
              <span class="title">已上传文件 ({{ uploadedFiles.length }})</span>
              <el-button
                type="danger"
                size="small"
                text
                @click="clearAllFiles"
              >
                清空全部
              </el-button>
            </div>
            <div class="file-items">
              <div
                v-for="file in uploadedFiles"
                :key="file.id"
                class="file-item"
              >
                <div class="file-icon">
                  <el-icon v-if="isImage(file.name)"><picture /></el-icon>
                  <el-icon v-else-if="isVideo(file.name)"><video-play /></el-icon>
                  <el-icon v-else><document /></el-icon>
                </div>
                <div class="file-info">
                  <div class="file-name" :title="file.name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
                <div class="file-actions">
                  <el-button
                    type="primary"
                    size="small"
                    text
                    @click="handlePreviewFile(file)"
                  >
                    预览
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click="handleRemoveFile(file)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="task-dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ loading ? '提交中...' : '确定' }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 文件预览对话框 -->
  <el-dialog
    v-model="previewDialogVisible"
    title="文件预览"
    width="800px"
    destroy-on-close
  >
    <div class="file-preview-container">
      <img
        v-if="previewFile && isImage(previewFile.name)"
        :src="previewFile.url"
        alt="预览图片"
        class="preview-image"
      />
      <video
        v-else-if="previewFile && isVideo(previewFile.name)"
        :src="previewFile.url"
        controls
        class="preview-video"
      >
        您的浏览器不支持视频播放
      </video>
      <div v-else class="preview-document">
        <el-icon class="document-icon"><document /></el-icon>
        <div class="document-info">
          <div class="document-name">{{ previewFile?.name }}</div>
          <div class="document-tip">此文件类型不支持预览，请下载后查看</div>
          <el-button
            type="primary"
            @click="downloadFile(previewFile)"
          >
            下载文件
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Picture, VideoPlay, Document } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadInstance, UploadProps, UploadUserFile, UploadFile } from 'element-plus'
import { uploadTaskAttachment } from '@/api/task-center'

// 接口定义
interface TaskFormData {
  id?: number | null
  title: string
  description: string
  priority: string
  status: string
  assignedTo: number | null
  dueDate: string | null
  tags: string
  attachments?: UploadedFile[]
}

interface UploadedFile {
  id: string
  name: string
  size: number
  url: string
  type: string
}

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  taskData?: Partial<TaskFormData>
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: TaskFormData): void
  (e: 'cancel'): void
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'create',
  taskData: () => ({})
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const loading = ref(false)

// 附件相关
const fileList = ref<UploadUserFile[]>([])
const uploadedFiles = ref<UploadedFile[]>([])
const previewDialogVisible = ref(false)
const previewFile = ref<UploadedFile | null>(null)

// 上传配置
const uploadAction = computed(() => {
  // 如果是编辑模式且有任务ID，使用任务ID上传
  if (props.mode === 'edit' && formData.value.id) {
    return `/api/tasks/${formData.value.id}/attachments`
  }
  // 新建模式，先临时存储文件，创建任务后再上传
  return '/api/files/upload'
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('kindergarten_token')
  return {
    Authorization: `Bearer ${token}`
  }
})

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 对话框标题
const dialogTitle = computed(() => {
  return props.mode === 'create' ? '新建任务' : '编辑任务'
})

// 表单数据
const formData = ref<TaskFormData>({
  id: null,
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  assignedTo: null,
  dueDate: null,
  tags: ''
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 监听任务数据变化
watch(() => props.taskData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    formData.value = {
      id: newData.id || null,
      title: newData.title || '',
      description: newData.description || '',
      priority: newData.priority || 'medium',
      status: newData.status || 'pending',
      assignedTo: newData.assignedTo || null,
      dueDate: newData.dueDate || null,
      tags: Array.isArray(newData.tags) 
        ? newData.tags.join(', ') 
        : (newData.tags || '')
    }
  } else {
    // 重置表单数据
    formData.value = {
      id: null,
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: null,
      dueDate: null,
      tags: ''
    }
  }
}, { immediate: true, deep: true })

// 附件处理函数
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const fileSize = rawFile.size / 1024 / 1024 // MB
  const fileType = rawFile.type
  const fileName = rawFile.name
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()

  // 图片类型验证
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

  // 文档类型验证
  const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  const documentExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']

  // 视频类型验证
  const videoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo']
  const videoExts = ['.mp4', '.avi', '.mov', '.wmv']

  // 判断文件类型
  const isImage = imageTypes.includes(fileType) || imageExts.includes(fileExt)
  const isDocument = documentTypes.includes(fileType) || documentExts.includes(fileExt)
  const isVideo = videoTypes.includes(fileType) || videoExts.includes(fileExt)

  if (!isImage && !isDocument && !isVideo) {
    ElMessage.error('只能上传图片、文档或视频文件！')
    return false
  }

  // 文件大小验证
  if (isImage && fileSize > 10) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  if (isDocument && fileSize > 20) {
    ElMessage.error('文档大小不能超过 20MB!')
    return false
  }
  if (isVideo && fileSize > 100) {
    ElMessage.error('视频大小不能超过 100MB!')
    return false
  }

  return true
}

const handleUploadSuccess = (response: any, file: UploadFile) => {
  if (response.success) {
    const uploadedFile: UploadedFile = {
      id: response.data.id || Date.now().toString(),
      name: file.name,
      size: file.size || 0,
      url: response.data.url || response.data.accessUrl,
      type: file.raw?.type || ''
    }
    uploadedFiles.value.push(uploadedFile)
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error(response.message || '文件上传失败')
  }
}

const handleUploadError = (error: Error) => {
  console.error('文件上传失败:', error)
  ElMessage.error('文件上传失败，请重试')
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传10个文件')
}

const handlePreview = (file: UploadFile) => {
  const uploadedFile = uploadedFiles.value.find(f => f.name === file.name)
  if (uploadedFile) {
    previewFile.value = uploadedFile
    previewDialogVisible.value = true
  }
}

const handleRemove = (file: UploadFile) => {
  const index = uploadedFiles.value.findIndex(f => f.name === file.name)
  if (index > -1) {
    uploadedFiles.value.splice(index, 1)
  }
}

const handlePreviewFile = (file: UploadedFile) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

const handleRemoveFile = async (file: UploadedFile) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = uploadedFiles.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      uploadedFiles.value.splice(index, 1)
      // 同时从fileList中移除
      const fileListIndex = fileList.value.findIndex(f => f.name === file.name)
      if (fileListIndex > -1) {
        fileList.value.splice(fileListIndex, 1)
      }
      ElMessage.success('文件已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const clearAllFiles = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有文件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    uploadedFiles.value = []
    fileList.value = []
    ElMessage.success('已清空所有文件')
  } catch {
    // 用户取消
  }
}

const downloadFile = (file: UploadedFile | null) => {
  if (!file) return
  window.open(file.url, '_blank')
}

// 文件类型判断
const isImage = (filename: string) => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
}

const isVideo = (filename: string) => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  return ['.mp4', '.avi', '.mov', '.wmv'].includes(ext)
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true

    // 处理数据格式
    const submitData: TaskFormData = {
      ...formData.value,
      tags: formData.value.tags ? formData.value.tags.split(',').map(tag => tag.trim()).join(', ') : '',
      attachments: uploadedFiles.value
    }

    // 如果是新建模式，移除id字段
    if (props.mode === 'create') {
      delete submitData.id
    }

    emit('submit', submitData)

  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.warning('请检查表单填写是否正确')
  } finally {
    loading.value = false
  }
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
}

// 处理关闭
const handleClose = () => {
  emit('update:visible', false)
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 监听附件数据变化
watch(() => props.taskData?.attachments, (newAttachments) => {
  if (newAttachments && Array.isArray(newAttachments)) {
    uploadedFiles.value = [...newAttachments]
  }
}, { immediate: true })

// 暴露方法
defineExpose({
  resetForm
})
</script>

<style scoped lang="scss">
.task-form-dialog {
  .task-form {
    padding: var(--text-2xl) 0;
  }

  .task-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--text-sm);
  }

  // 附件上传区域样式
  .attachment-upload-area {
    width: 100%;

    .upload-demo {
      width: 100%;

      :deep(.el-upload) {
        width: 100%;
      }

      :deep(.el-upload-dragger) {
        width: 100%;
        padding: var(--spacing-10xl) var(--text-2xl);
      }
    }

    .el-upload__tip {
      margin-top: var(--text-sm);
      line-height: 1.6;
      color: var(--text-regular);

      .file-type-tips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
      }

      .upload-limit-tip {
        margin-top: var(--spacing-sm);
        font-size: var(--text-sm);
        color: var(--info-color);
      }
    }

    // 已上传文件列表
    .uploaded-files-list {
      margin-top: var(--text-2xl);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-xs);
      overflow: hidden;

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--text-sm) var(--text-lg);
        background-color: var(--bg-hover);
        border-bottom: var(--border-width-base) solid var(--border-color);

        .title {
          font-weight: 500;
          color: var(--text-primary);
        }
      }

      .file-items {
        max-height: 300px;
        overflow-y: auto;

        .file-item {
          display: flex;
          align-items: center;
          padding: var(--text-sm) var(--text-lg);
          border-bottom: var(--border-width-base) solid #ebeef5;
          transition: background-color 0.3s;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: var(--bg-hover);
          }

          .file-icon {
            flex-shrink: 0;
            width: var(--icon-size); height: var(--icon-size);
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ecf5ff;
            border-radius: var(--spacing-xs);
            margin-right: var(--text-sm);

            .el-icon {
              font-size: var(--text-3xl);
              color: var(--primary-color);
            }
          }

          .file-info {
            flex: 1;
            min-width: 0;

            .file-name {
              font-size: var(--text-base);
              color: var(--text-primary);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-bottom: var(--spacing-xs);
            }

            .file-size {
              font-size: var(--text-sm);
              color: var(--info-color);
            }
          }

          .file-actions {
            flex-shrink: 0;
            display: flex;
            gap: var(--spacing-sm);
          }
        }
      }
    }
  }
}

// 文件预览对话框样式
.file-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .preview-image {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
  }

  .preview-video {
    max-width: 100%;
    max-height: 600px;
  }

  .preview-document {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--text-2xl);
    padding: var(--spacing-10xl);

    .document-icon {
      font-size: 80px;
      color: var(--info-color);
    }

    .document-info {
      text-align: center;

      .document-name {
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: var(--text-sm);
      }

      .document-tip {
        font-size: var(--text-base);
        color: var(--text-regular);
        margin-bottom: var(--text-2xl);
      }
    }
  }
}
</style>
