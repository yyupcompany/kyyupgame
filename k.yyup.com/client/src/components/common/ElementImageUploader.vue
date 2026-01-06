<template>
  <div class="element-image-uploader">
    <!-- 标题 -->
    <div v-if="title" class="uploader-title">{{ title }}</div>
    
    <!-- Element Plus 上传组件 -->
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :data="uploadData"
      :multiple="multiple"
      :limit="maxCount"
      :file-list="fileList"
      :accept="accept"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-progress="onProgress"
      :on-remove="onRemove"
      :on-exceed="onExceed"
      :disabled="disabled"
      :show-file-list="showFileList"
      :list-type="listType"
      :auto-upload="autoUpload"
      class="image-uploader"
      :class="{ 'is-disabled': disabled }"
    >
      <!-- 上传触发区域 -->
      <template #trigger>
        <div class="upload-trigger">
          <UnifiedIcon name="Plus" />
          <div class="upload-text">{{ buttonText || '点击上传图片' }}</div>
        </div>
      </template>
      
      <!-- 提示信息 -->
      <template #tip>
        <div v-if="showTips && tips" class="upload-tips">
          {{ tips }}
        </div>
      </template>
    </el-upload>
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="50%"
      :before-close="closePreview"
    >
      <img
        v-if="previewImageUrl"
        :src="previewImageUrl"
        style="width: 100%; height: auto; max-width: 100%; max-width: 600px; max-min-height: 60px; height: auto; object-fit: contain;"
        alt="预览图片"
        loading="lazy"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadFile, UploadRawFile } from 'element-plus'
import { FILE_UPLOAD_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

// 定义 Props
interface Props {
  // 绑定值
  modelValue?: UploadUserFile[]
  // 上传地址
  action?: string
  // 最大上传数量
  maxCount?: number
  // 是否禁用
  disabled?: boolean
  // 标题
  title?: string
  // 按钮文字
  buttonText?: string
  // 提示文字
  tips?: string
  // 是否显示提示
  showTips?: boolean
  // 文件大小限制(MB)
  maxSize?: number
  // 接受的文件类型
  accept?: string
  // 是否允许多选
  multiple?: boolean
  // 是否显示文件列表
  showFileList?: boolean
  // 列表类型
  listType?: 'text' | 'picture' | 'picture-card'
  // 是否自动上传
  autoUpload?: boolean
  // 上传分类
  category?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxCount: 1,
  disabled: false,
  title: '',
  buttonText: '点击上传图片',
  tips: '支持 JPG, PNG, GIF 格式，大小不超过 2MB',
  showTips: true,
  maxSize: 2,
  accept: 'image/*',
  multiple: false,
  showFileList: true,
  listType: 'picture-card',
  autoUpload: true,
  category: 'default'
})

// 定义 Emits
const emit = defineEmits<{
  'update:modelValue': [files: UploadUserFile[]]
  'upload-success': [response: any, file: UploadFile]
  'upload-error': [error: Error, file: UploadFile]
  'upload-progress': [progress: number, file: UploadFile]
  'file-remove': [file: UploadFile]
}>()

// 响应式数据
const uploadRef = ref()
const fileList = ref<UploadUserFile[]>([])
const previewVisible = ref(false)
const previewImageUrl = ref('')

// 计算属性
const uploadUrl = computed(() => props.action || '/api/upload')
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${localStorage.getItem('kindergarten_token') || ''}`
}))
const uploadData = computed(() => ({
  category: props.category
}))

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  fileList.value = newVal || []
}, { immediate: true })

// 监听 fileList 变化
watch(fileList, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// 上传前的检查
const beforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  // 检查文件类型
  if (props.accept && !rawFile.type.match(props.accept.replace(/\*/g, '.*'))) {
    ElMessage.error('文件格式不正确')
    return false
  }
  
  // 检查文件大小
  const isLtMaxSize = rawFile.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }
  
  return true
}

// 上传成功
const onSuccess: UploadProps['onSuccess'] = (response, file) => {
  ElMessage.success('上传成功')
  emit('upload-success', response, file)
}

// 上传失败
const onError: UploadProps['onError'] = (error, file) => {
  ElMessage.error('上传失败')
  emit('upload-error', new Error('上传失败'), file)
}

// 上传进度
const onProgress: UploadProps['onProgress'] = (evt, file) => {
  const progress = Math.round(evt.percent || 0)
  emit('upload-progress', progress, file)
}

// 移除文件
const onRemove: UploadProps['onRemove'] = (file) => {
  emit('file-remove', file)
}

// 超出限制
const onExceed: UploadProps['onExceed'] = (files) => {
  ElMessage.warning(`最多只能上传 ${props.maxCount} 个文件`)
}

// 预览图片
const handlePreview = (file: UploadFile) => {
  previewImageUrl.value = file.url || ''
  previewVisible.value = true
}

// 关闭预览
const closePreview = () => {
  previewVisible.value = false
  previewImageUrl.value = ''
}

// 清空文件列表
const clearFiles = () => {
  uploadRef.value?.clearFiles()
}

// 手动上传
const submit = () => {
  uploadRef.value?.submit()
}

// 暴露方法
defineExpose({
  clearFiles,
  submit,
  handlePreview
})
</script>

<style scoped>
.element-image-uploader {
  width: 100%;
}

.uploader-title {
  margin-bottom: var(--text-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.image-uploader {
  width: 100%;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 14var(--spacing-sm);
  height: 14var(--spacing-sm);
  border: var(--border-width-base) dashed var(--border-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);

.upload-trigger:hover {
  border-color: var(--primary-color);
}

.upload-icon {
  font-size: var(--text-3xl);
  color: #8c939d;
  margin-bottom: var(--spacing-sm);
}

.upload-text {
  font-size: var(--text-sm);
  color: #8c939d;
}

.upload-tips {
  margin-top: var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--info-color);
  line-height: 1.4;
}

.is-disabled .upload-trigger {
  cursor: not-allowed;
  background-color: var(--bg-hover);
}

.is-disabled .upload-trigger:hover {
  border-color: var(--border-base);
}
}
</style>
