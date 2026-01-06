<template>
  <div class="document-generation-result">
    <!-- 生成中状态 -->
    <DocumentGenerationProgress
      v-if="status === 'generating'"
      ref="progressRef"
      :document-type="documentType"
      :tool-name="toolName"
      :start-time="startTime"
    />

    <!-- 生成成功状态 -->
    <div v-else-if="status === 'success'" class="generation-success">
      <div class="success-header">
        <div class="success-icon">
          <UnifiedIcon name="Check" />
        </div>
        <div class="success-content">
          <h3>{{ documentType }}生成成功！</h3>
          <p>文档已准备就绪，您可以预览或下载</p>
        </div>
      </div>

      <div class="success-actions">
        <el-button
          type="primary"
          size="large"
          :icon="View"
          @click="showPreview = true"
        >
          预览文档
        </el-button>
        <el-button
          type="success"
          size="large"
          :icon="Download"
          @click="handleDownload"
        >
          下载文档
        </el-button>
      </div>

      <div class="document-details">
        <div class="detail-item">
          <span class="detail-label">文件名:</span>
          <span class="detail-value">{{ result.filename }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">文件大小:</span>
          <span class="detail-value">{{ formatFileSize(result.fileSize) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">生成时间:</span>
          <span class="detail-value">{{ formatDate(result.generatedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 生成失败状态 -->
    <div v-else-if="status === 'error'" class="generation-error">
      <div class="error-icon">
        <UnifiedIcon name="close" />
      </div>
      <h3>文档生成失败</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <el-button type="primary" @click="handleRetry">重试</el-button>
    </div>

    <!-- 文档预览对话框 -->
    <el-dialog
      v-model="showPreview"
      :title="`${documentType}预览`"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <DocumentPreview
        v-if="showPreview && result"
        :document-info="documentInfo"
        @close="showPreview = false"
        @download="handleDownload"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import DocumentGenerationProgress from './DocumentGenerationProgress.vue'
import DocumentPreview from './DocumentPreview.vue'

interface DocumentResult {
  filename: string
  fileSize: number
  downloadUrl: string
  generatedAt: string
  reportType?: string
  reportTitle?: string
  templateStyle?: string
  summary?: string
  previewData?: any
}

interface Props {
  status: 'generating' | 'success' | 'error'
  documentType: string
  toolName: string
  result?: DocumentResult
  errorMessage?: string
  startTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: 'generating',
  documentType: '文档',
  toolName: 'generate_document',
  errorMessage: '未知错误'
})

const emit = defineEmits<{
  retry: []
  download: [url: string]
}>()

// 组件引用
const progressRef = ref<InstanceType<typeof DocumentGenerationProgress> | null>(null)

// 预览对话框
const showPreview = ref(false)

// 文档信息
const documentInfo = computed(() => {
  if (!props.result) return null
  
  return {
    title: props.result.reportTitle || props.result.filename,
    filename: props.result.filename,
    fileSize: props.result.fileSize,
    generatedAt: props.result.generatedAt,
    type: getDocumentType(props.documentType),
    downloadUrl: props.result.downloadUrl,
    summary: props.result.summary,
    previewData: props.result.previewData
  }
})

// 获取文档类型
const getDocumentType = (type: string): 'word' | 'pdf' | 'excel' | 'ppt' => {
  const typeMap: Record<string, 'word' | 'pdf' | 'excel' | 'ppt'> = {
    'Word': 'word',
    'PDF': 'pdf',
    'Excel': 'excel',
    'PPT': 'ppt'
  }
  return typeMap[type] || 'word'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 处理下载
const handleDownload = () => {
  if (props.result?.downloadUrl) {
    emit('download', props.result.downloadUrl)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = props.result.downloadUrl
    link.download = props.result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('开始下载文档...')
  }
}

// 处理重试
const handleRetry = () => {
  emit('retry')
}

// 监听状态变化
watch(() => props.status, (newStatus) => {
  if (newStatus === 'success' && progressRef.value) {
    // 完成进度条
    progressRef.value.completeProgress()
  }
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.document-generation-result {
  width: 100%;
}

.generation-success {
  padding: 2rem;
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  
  .success-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    .success-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--avatar-size); height: var(--avatar-size);
      background: linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%);
      border-radius: var(--radius-full);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(103, 194, 58, 0.3);
    }
    
    .success-content {
      flex: 1;
      
      h3 {
        margin: 0 0 0.5rem;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      p {
        margin: 0;
        font-size: 1rem;
        color: var(--text-regular);
      }
    }
  }
  
  .success-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    
    .el-button {
      flex: 1;
    }
  }
  
  .document-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: var(--spacing-lg);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      
      .detail-label {
        font-size: 0.75rem;
        color: var(--info-color);
        font-weight: 500;
        text-transform: uppercase;
      }
      
      .detail-value {
        font-size: 0.875rem;
        color: var(--text-primary);
        font-weight: 600;
      }
    }
  }
}

.generation-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  text-align: center;
  
  .error-icon {
    margin-bottom: 1.5rem;
  }
  
  h3 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .error-message {
    margin: 0 0 2rem;
    font-size: 1rem;
    color: var(--danger-color);
    max-width: 100%; max-width: 500px;
  }
}
</style>

