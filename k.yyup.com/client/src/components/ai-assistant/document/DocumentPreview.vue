<template>
  <div class="document-preview">
    <!-- 预览头部 -->
    <div class="preview-header">
      <div class="preview-title">
        <UnifiedIcon name="document" :size="16" />
        <h4>{{ documentInfo.title || '文档预览' }}</h4>
      </div>
      <div class="preview-actions">
        <el-button
          type="primary"
          size="small"
          :icon="Download"
          @click="handleDownload"
        >
          下载文档
        </el-button>
        <el-button
          size="small"
          :icon="Close"
          @click="handleClose"
        >
          关闭
        </el-button>
      </div>
    </div>

    <!-- 文档信息 -->
    <div class="document-info">
      <div class="info-item">
        <span class="info-label">文件名:</span>
        <span class="info-value">{{ documentInfo.filename }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">文件大小:</span>
        <span class="info-value">{{ formatFileSize(documentInfo.fileSize) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">生成时间:</span>
        <span class="info-value">{{ formatDate(documentInfo.generatedAt) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">文档类型:</span>
        <el-tag :type="getDocumentTypeTag(documentInfo.type)" size="small">
          {{ getDocumentTypeName(documentInfo.type) }}
        </el-tag>
      </div>
    </div>

    <!-- 预览内容 -->
    <div class="preview-content">
      <!-- Word/PDF 预览 -->
      <div v-if="isOfficeDocument" class="office-preview">
        <div class="preview-placeholder">
          <UnifiedIcon name="document" :size="16" />
          <p>{{ documentInfo.type.toUpperCase() }}文档预览</p>
          <p class="preview-hint">点击下载按钮查看完整文档</p>

          <!-- 内容摘要 -->
          <div v-if="documentInfo.summary" class="content-summary">
            <h5>内容摘要</h5>
            <div class="summary-text">{{ documentInfo.summary }}</div>
          </div>
        </div>
      </div>

      <!-- Excel 预览 -->
      <div v-else-if="documentInfo.type === 'excel'" class="excel-preview">
        <div class="preview-table">
          <div class="table-wrapper">
            <el-table class="responsive-table full-width"
              :data="previewData"
              border
              stripe
              max-height="400"
            >
              <el-table-column
                v-for="(column, index) in previewColumns"
                :key="index"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
              />
            </el-table>
          </div>
          <div v-if="hasMoreData" class="more-data-hint">
            <UnifiedIcon name="ai-center" />
            <span>还有更多数据，请下载完整文件查看</span>
          </div>
        </div>
      </div>

      <!-- PPT 预览 -->
      <div v-else-if="documentInfo.type === 'ppt'" class="ppt-preview">
        <div class="slides-preview">
          <div
            v-for="(slide, index) in previewSlides"
            :key="index"
            class="slide-item"
          >
            <div class="slide-number">幻灯片 {{ index + 1 }}</div>
            <div class="slide-content">
              <h5>{{ slide.title }}</h5>
              <p>{{ slide.content }}</p>
            </div>
          </div>
          <div v-if="hasMoreSlides" class="more-slides-hint">
            <UnifiedIcon name="ai-center" />
            <span>还有更多幻灯片，请下载完整文件查看</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface DocumentInfo {
  title?: string
  filename: string
  fileSize: number
  generatedAt: string
  type: 'word' | 'pdf' | 'excel' | 'ppt'
  downloadUrl: string
  summary?: string
  previewData?: any
}

interface Props {
  documentInfo: DocumentInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  download: [url: string]
}>()

// 预览数据
const previewData = computed(() => {
  if (props.documentInfo.type === 'excel' && props.documentInfo.previewData) {
    return props.documentInfo.previewData.slice(0, 10) // 只显示前10行
  }
  return []
})

const previewColumns = computed(() => {
  if (previewData.value.length > 0) {
    return Object.keys(previewData.value[0]).map(key => ({
      prop: key,
      label: key,
      width: 150
    }))
  }
  return []
})

const hasMoreData = computed(() => {
  return props.documentInfo.previewData && props.documentInfo.previewData.length > 10
})

// PPT预览数据
const previewSlides = computed(() => {
  if (props.documentInfo.type === 'ppt' && props.documentInfo.previewData) {
    return props.documentInfo.previewData.slice(0, 3) // 只显示前3张幻灯片
  }
  return []
})

const hasMoreSlides = computed(() => {
  return props.documentInfo.previewData && props.documentInfo.previewData.length > 3
})

// 是否是Office文档
const isOfficeDocument = computed(() => {
  return ['word', 'pdf'].includes(props.documentInfo.type)
})

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

// 获取文档类型标签
const getDocumentTypeTag = (type: string): string => {
  const tagMap: Record<string, string> = {
    word: 'primary',
    pdf: 'danger',
    excel: 'success',
    ppt: 'warning'
  }
  return tagMap[type] || 'info'
}

// 获取文档类型名称
const getDocumentTypeName = (type: string): string => {
  const nameMap: Record<string, string> = {
    word: 'Word文档',
    pdf: 'PDF报告',
    excel: 'Excel报表',
    ppt: 'PPT演示文稿'
  }
  return nameMap[type] || '文档'
}

// 处理下载
const handleDownload = () => {
  emit('download', props.documentInfo.downloadUrl)
  ElMessage.success('开始下载文档...')
}

// 处理关闭
const handleClose = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.document-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: var(--spacing-sm);
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: var(--text-on-primary);

  .preview-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  .preview-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.document-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--bg-hover);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .info-label {
      font-size: 0.875rem;
      color: var(--info-color);
      font-weight: 500;
    }

    .info-value {
      font-size: 0.875rem;
      color: var(--text-primary);
      font-weight: 600;
    }
  }
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
}

.office-preview {
  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    text-align: center;

    p {
      margin: 1rem 0 0.5rem;
      font-size: 1rem;
      color: var(--text-regular);
      font-weight: 500;
    }

    .preview-hint {
      font-size: 0.875rem;
      color: var(--info-color);
    }

    .content-summary {
      margin-top: 2rem;
      padding: var(--spacing-lg);
      background: var(--bg-hover);
      border-radius: var(--spacing-sm);
      max-width: 600px;
      text-align: left;

      h5 {
        margin: 0 0 1rem;
        font-size: 1rem;
        color: var(--text-primary);
      }

      .summary-text {
        font-size: 0.875rem;
        color: var(--text-regular);
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }
  }
}

.excel-preview {
  .preview-table {
    .more-data-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--bg-hover);
      border-radius: var(--spacing-xs);
      margin-top: 1rem;
      font-size: 0.875rem;
      color: var(--info-color);
    }
  }
}

.ppt-preview {
  .slides-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;

    .slide-item {
      background: white;
      border: var(--border-width) solid var(--border-color-light);
      border-radius: var(--spacing-sm);
      overflow: hidden;
      transition: all var(--transition-normal) ease;

      &:hover {
        box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
        transform: translateY(var(--transform-hover-lift));
      }

      .slide-number {
        padding: 0.5rem 1rem;
        background: var(--primary-color);
        color: var(--text-on-primary);
        font-size: 0.875rem;
        font-weight: 500;
      }

      .slide-content {
        padding: 1rem;

        h5 {
          margin: 0 0 0.75rem;
          font-size: 1rem;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-regular);
          line-height: 1.6;
        }
      }
    }

    .more-slides-hint {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--bg-hover);
      border-radius: var(--spacing-sm);
      font-size: 0.875rem;
      color: var(--info-color);
    }
  }
}
</style>