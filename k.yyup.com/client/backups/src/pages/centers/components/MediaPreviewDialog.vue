<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="handleClose"
  >
    <div class="media-preview-content" v-loading="loading">
      <!-- 媒体文件列表 -->
      <div v-if="mediaList.length > 0" class="media-list">
        <div class="media-grid">
          <div 
            v-for="(media, index) in mediaList" 
            :key="media.id"
            class="media-item"
            @click="openPreview(index)"
          >
            <!-- 图片预览 -->
            <div v-if="isImage(media)" class="media-thumbnail image-thumbnail">
              <img 
                :src="media.file_url" 
                :alt="media.original_name"
                @error="handleImageError"
              />
              <div class="media-overlay">
                <el-icon class="preview-icon"><ZoomIn /></el-icon>
              </div>
            </div>

            <!-- 视频预览 -->
            <div v-else-if="isVideo(media)" class="media-thumbnail video-thumbnail">
              <video 
                :src="media.file_url" 
                :poster="media.thumbnail_url"
                preload="metadata"
              />
              <div class="media-overlay">
                <el-icon class="preview-icon"><VideoPlay /></el-icon>
              </div>
              <div class="video-duration" v-if="media.duration">
                {{ formatDuration(media.duration) }}
              </div>
            </div>

            <!-- 其他文件类型 -->
            <div v-else class="media-thumbnail file-thumbnail">
              <div class="file-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="file-name">{{ media.original_name }}</div>
            </div>

            <!-- 媒体信息 -->
            <div class="media-info">
              <div class="media-name" :title="media.original_name">
                {{ media.original_name }}
              </div>
              <div class="media-meta">
                <span class="upload-date">{{ formatDate(media.created_at) }}</span>
                <span class="file-size">{{ formatFileSize(media.file_size) }}</span>
              </div>
              <div class="media-actions">
                <el-button size="small" text @click.stop="downloadMedia(media)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" text type="danger" @click.stop="deleteMedia(media)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty description="暂无媒体文件">
          <el-button type="primary" @click="uploadMedia">
            <el-icon><Plus /></el-icon>
            上传文件
          </el-button>
        </el-empty>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="uploadMedia">
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 图片预览器 -->
  <el-image-viewer
    v-if="showImageViewer"
    :url-list="imageUrls"
    :initial-index="currentImageIndex"
    @close="closeImageViewer"
  />

  <!-- 视频播放器 -->
  <el-dialog
    v-model="showVideoPlayer"
    title="视频播放"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="video-player-container">
      <video
        v-if="currentVideo"
        :src="currentVideo.file_url"
        controls
        autoplay
        style="width: 100%; height: auto;"
      />
    </div>
  </el-dialog>

  <!-- 文件上传组件 -->
  <input
    ref="fileInputRef"
    type="file"
    multiple
    accept="image/*,video/*"
    style="display: none"
    @change="handleFileSelect"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  ZoomIn, 
  VideoPlay, 
  Document, 
  Download, 
  Delete, 
  Plus, 
  Upload 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'

interface Props {
  modelValue: boolean
  mediaList: any[]
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  mediaList: () => [],
  title: '媒体文件预览'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

// 响应式数据
const loading = ref(false)
const showImageViewer = ref(false)
const showVideoPlayer = ref(false)
const currentImageIndex = ref(0)
const currentVideo = ref(null)
const fileInputRef = ref<HTMLInputElement>()

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const imageUrls = computed(() => {
  return props.mediaList
    .filter(media => isImage(media))
    .map(media => media.file_url)
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const isImage = (media: any) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
  const extension = media.original_name?.split('.').pop()?.toLowerCase()
  return imageTypes.includes(extension || '')
}

const isVideo = (media: any) => {
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
  const extension = media.original_name?.split('.').pop()?.toLowerCase()
  return videoTypes.includes(extension || '')
}

const openPreview = (index: number) => {
  const media = props.mediaList[index]
  
  if (isImage(media)) {
    // 找到图片在图片列表中的索引
    const imageIndex = props.mediaList
      .slice(0, index + 1)
      .filter(m => isImage(m)).length - 1
    currentImageIndex.value = imageIndex
    showImageViewer.value = true
  } else if (isVideo(media)) {
    currentVideo.value = media
    showVideoPlayer.value = true
  } else {
    // 其他文件类型直接下载
    downloadMedia(media)
  }
}

const closeImageViewer = () => {
  showImageViewer.value = false
}

const formatDate = (dateString: string) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '--'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '--'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/placeholder-image.png' // 占位图片
}

const downloadMedia = (media: any) => {
  const link = document.createElement('a')
  link.href = media.file_url
  link.download = media.original_name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const deleteMedia = async (media: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${media.original_name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await teachingCenterApi.deleteMediaFile(media.id)
    if (response.success) {
      ElMessage.success('文件删除成功')
      emit('refresh')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const uploadMedia = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files || files.length === 0) return

  try {
    loading.value = true
    
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('module', 'teaching-center')
      formData.append('referenceType', 'media')
      
      const response = await teachingCenterApi.uploadMediaFile(formData)
      if (!response.success) {
        throw new Error(`上传 ${file.name} 失败`)
      }
    }

    ElMessage.success(`成功上传 ${files.length} 个文件`)
    emit('refresh')
    
    // 清空文件选择
    target.value = ''
  } catch (error) {
    console.error('上传文件失败:', error)
    ElMessage.error('上传失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.media-preview-content {
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--text-lg);
    padding: var(--spacing-sm);
  }

  .media-item {
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
    }

    .media-thumbnail {
      position: relative;
      width: 100%;
      height: 150px;
      overflow: hidden;
      background: var(--el-bg-color-page);

      &.image-thumbnail,
      &.video-thumbnail {
        img, video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      &.file-thumbnail {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);

        .file-icon {
          font-size: var(--spacing-3xl);
          color: var(--el-color-info);
        }

        .file-name {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          text-align: center;
          padding: 0 var(--spacing-sm);
          word-break: break-all;
        }
      }

      .media-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--black-alpha-50);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;

        .preview-icon {
          font-size: var(--text-3xl);
          color: white;
        }
      }

      .video-duration {
        position: absolute;
        bottom: var(--spacing-xs);
        right: var(--spacing-xs);
        background: var(--black-alpha-70);
        color: white;
        padding: var(--spacing-sm) 6px;
        border-radius: var(--spacing-xs);
        font-size: var(--text-xs);
      }

      &:hover .media-overlay {
        opacity: 1;
      }
    }

    .media-info {
      padding: var(--text-sm);

      .media-name {
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .media-meta {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-sm);
      }

      .media-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  .empty-state {
    padding: var(--spacing-15xl) var(--text-2xl);
    text-align: center;
  }
}

.video-player-container {
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 移动端适配
@media (max-width: var(--breakpoint-md)) {
  .media-preview-content {
    .media-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--text-sm);
    }

    .media-item {
      .media-thumbnail {
        height: 120px;
      }

      .media-info {
        padding: var(--spacing-sm);

        .media-actions {
          flex-direction: column;
          gap: var(--spacing-xs);

          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
