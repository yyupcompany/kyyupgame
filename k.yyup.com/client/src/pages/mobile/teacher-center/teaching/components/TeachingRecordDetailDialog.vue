<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    closeable
    @closed="handleClosed"
  >
    <div class="record-detail-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-icon name="description" size="24" color="#409eff" />
        <h3>教学记录详情</h3>
      </div>

      <!-- 内容区域 -->
      <div class="dialog-content" v-if="record">
        <!-- 基本信息 -->
        <van-cell-group inset title="基本信息">
          <van-cell title="班级" :value="record.className" />
          <van-cell title="课程" :value="record.courseName" />
          <van-cell title="日期" :value="formatFullDate(record.date)" />
          <van-cell title="时长" :value="`${record.duration}分钟`" />
          <van-cell title="出勤" :value="`${record.attendance}人`" />
          <van-cell title="课程类型">
            <template #value>
              <van-tag :type="getCourseTypeColor(record.courseType)">
                {{ getCourseTypeText(record.courseType) }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 课程内容 -->
        <van-cell-group inset title="课程内容">
          <div class="content-section">
            <p class="content-text">{{ record.content }}</p>
          </div>
        </van-cell-group>

        <!-- 媒体文件 -->
        <van-cell-group inset title="教学媒体" v-if="record.mediaFiles && record.mediaFiles.length > 0">
          <div class="media-section">
            <div class="media-grid">
              <div
                v-for="media in record.mediaFiles"
                :key="media.id"
                class="media-item"
                @click="handleViewMedia(media)"
              >
                <img
                  v-if="media.type === 'image'"
                  :src="media.url"
                  :alt="media.name"
                  class="media-image"
                />
                <div v-else class="media-video">
                  <van-icon name="video-o" size="32" />
                  <span class="video-name">{{ media.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </van-cell-group>

        <!-- 学生表现 -->
        <van-cell-group inset title="学生表现" v-if="record.studentPerformance">
          <div class="performance-section">
            <p class="performance-text">{{ record.studentPerformance }}</p>
          </div>
        </van-cell-group>

        <!-- 评分信息 -->
        <van-cell-group inset title="课堂评价">
          <div class="rating-section">
            <div class="rating-item">
              <span class="rating-label">课堂互动:</span>
              <div class="rating-stars">
                <van-rate
                  :model-value="record.interactionLevel"
                  :size="20"
                  readonly
                  allow-half
                  color="#ffd21e"
                  void-color="#c8c9cc"
                />
                <span class="rating-value">{{ record.interactionLevel }}/5</span>
              </div>
            </div>
            <van-divider />
            <div class="rating-item">
              <span class="rating-label">教学效果:</span>
              <div class="rating-stars">
                <van-rate
                  :model-value="record.effectivenessLevel"
                  :size="20"
                  readonly
                  allow-half
                  color="#ffd21e"
                  void-color="#c8c9cc"
                />
                <span class="rating-value">{{ record.effectivenessLevel }}/5</span>
              </div>
            </div>
          </div>
        </van-cell-group>

        <!-- 操作时间 -->
        <van-cell-group inset title="记录信息" v-if="record.createdAt || record.updatedAt">
          <van-cell
            v-if="record.createdAt"
            title="创建时间"
            :value="formatDateTime(record.createdAt)"
          />
          <van-cell
            v-if="record.updatedAt"
            title="更新时间"
            :value="formatDateTime(record.updatedAt)"
          />
        </van-cell-group>

        <!-- 操作按钮 -->
        <div class="dialog-actions">
          <van-button
            type="primary"
            size="large"
            block
            @click="handleEdit"
          >
            <van-icon name="edit" />
            编辑记录
          </van-button>
          <van-button
            size="large"
            block
            @click="handleShare"
          >
            <van-icon name="share-o" />
            分享记录
          </van-button>
        </div>
      </div>

      <!-- 图片预览 -->
      <van-image-preview
        v-model:show="showImagePreview"
        :images="previewImages"
        :start-position="previewIndex"
      />
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'

interface TeachingRecord {
  id: number
  className: string
  courseName: string
  date: string
  duration: number
  attendance: number
  courseType: string
  content: string
  mediaFiles?: Array<{
    id: number
    name: string
    type: 'image' | 'video'
    url: string
  }>
  studentPerformance?: string
  interactionLevel: number
  effectivenessLevel: number
  createdAt?: string
  updatedAt?: string
}

interface Props {
  modelValue: boolean
  record: TeachingRecord | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', record: TeachingRecord): void
  (e: 'share', record: TeachingRecord): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showImagePreview = ref(false)
const previewImages = ref<string[]>([])
const previewIndex = ref(0)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatFullDate = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const formatDateTime = (date: string) => {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCourseTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'regular': 'primary',
    'review': 'success',
    'practice': 'warning',
    'assessment': 'danger'
  }
  return colorMap[type] || 'default'
}

const getCourseTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'regular': '常规课程',
    'review': '复习课程',
    'practice': '实践活动',
    'assessment': '测评课程'
  }
  return textMap[type] || type
}

const handleViewMedia = (media: any) => {
  if (media.type === 'image') {
    const images = props.record?.mediaFiles?.filter(m => m.type === 'image').map(m => m.url) || []
    if (images.length > 0) {
      previewImages.value = images
      previewIndex.value = images.indexOf(media.url)
      showImagePreview.value = true
    }
  } else {
    showToast(`播放视频: ${media.name}`)
  }
}

const handleEdit = () => {
  if (props.record) {
    emit('edit', props.record)
    dialogVisible.value = false
  }
}

const handleShare = () => {
  if (props.record) {
    emit('share', props.record)
  }
}

const handleClosed = () => {
  // 重置状态
  showImagePreview.value = false
  previewImages.value = []
  previewIndex.value = 0
}
</script>

<style scoped lang="scss">
.record-detail-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--van-background-color-light);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 16px 12px;
  border-bottom: 1px solid var(--van-border-color);

  h3 {
    flex: 1;
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--van-text-color);
  }
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);

  .content-section {
    padding: var(--spacing-md);
    background: white;
    border-radius: 8px;

    .content-text {
      font-size: var(--text-sm);
      line-height: 1.8;
      color: var(--van-text-color);
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  .media-section {
    padding: var(--spacing-md);
    background: white;
    border-radius: 8px;

    .media-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);

      .media-item {
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        position: relative;

        .media-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-video {
          width: 100%;
          height: 100%;
          background: var(--van-gray-1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm);
          text-align: center;

          .video-name {
            font-size: 11px;
            color: var(--van-text-color-2);
            line-height: 1.2;
          }
        }

        &:active {
          opacity: 0.8;
        }
      }
    }
  }

  .performance-section {
    padding: var(--spacing-md);
    background: white;
    border-radius: 8px;

    .performance-text {
      font-size: var(--text-sm);
      line-height: 1.6;
      color: var(--van-text-color);
      white-space: pre-wrap;
    }
  }

  .rating-section {
    padding: var(--spacing-md);
    background: white;
    border-radius: 8px;

    .rating-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);

      .rating-label {
        font-size: var(--text-sm);
        color: var(--van-text-color);
        font-weight: 500;
      }

      .rating-stars {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .rating-value {
          font-size: var(--text-sm);
          font-weight: bold;
          color: var(--van-primary-color);
        }
      }
    }
  }

  .dialog-actions {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
}

// 暗黑模式适配
:root[data-theme="dark"] {
  .record-detail-dialog {
    background: var(--van-background-color-dark);

    .content-section,
    .media-section,
    .performance-section,
    .rating-section {
      background: var(--van-gray-8);
    }
  }
}
</style>
