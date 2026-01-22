<template>
  <div class="growth-tab">
    <!-- 分类筛选 -->
    <van-tabs v-model:active="activeCategory" sticky @change="handleCategoryChange">
      <van-tab title="全部" name="all" />
      <van-tab title="学习" name="study" />
      <van-tab title="社交" name="social" />
      <van-tab title="情感" name="emotional" />
      <van-tab title="体能" name="physical" />
      <van-tab title="艺术" name="art" />
    </van-tabs>

    <!-- 成长记录列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="record in growthRecords"
          :key="record.id"
          class="growth-record"
        >
          <!-- 记录头部 -->
          <div class="record-header">
            <div class="record-meta">
              <div class="record-date">{{ formatDate(record.date) }}</div>
              <div class="record-age">{{ getAgeText(record.age) }}</div>
            </div>
            <div class="record-category">
              <van-tag :type="getCategoryTagType(record.category)" size="medium">
                {{ getCategoryText(record.category) }}
              </van-tag>
            </div>
          </div>

          <!-- 记录内容 -->
          <div class="record-content">
            <h3 class="record-title">{{ record.title }}</h3>
            <p class="record-description">{{ record.description }}</p>

            <!-- 图片展示 -->
            <div v-if="record.images && record.images.length > 0" class="record-images">
              <van-image
                v-for="(image, index) in record.images.slice(0, 3)"
                :key="index"
                :src="image.url"
                width="80"
                height="80"
                fit="cover"
                round
                @click="previewImage(record.images, index)"
              />
              <div
                v-if="record.images.length > 3"
                class="more-images"
                @click="previewImage(record.images, 0)"
              >
                +{{ record.images.length - 3 }}
              </div>
            </div>

            <!-- 视频展示 -->
            <div v-if="record.videos && record.videos.length > 0" class="record-videos">
              <div
                v-for="video in record.videos.slice(0, 1)"
                :key="video.id"
                class="video-item"
                @click="playVideo(video)"
              >
                <van-image
                  :src="video.thumbnail"
                  width="100%"
                  height="120"
                  fit="cover"
                />
                <div class="video-play-icon">
                  <van-icon name="play" size="24" color="white" />
                </div>
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="record.tags && record.tags.length > 0" class="record-tags">
              <van-tag
                v-for="tag in record.tags"
                :key="tag"
                type="primary"
                size="medium"
                plain
              >
                {{ tag }}
              </van-tag>
            </div>
          </div>

          <!-- 记录底部 -->
          <div class="record-footer">
            <div class="record-teacher">
              <van-icon name="contact" size="14" />
              <span>{{ record.teacher }}</span>
            </div>
            <div class="record-actions">
              <van-button
                size="medium"
                plain
                type="primary"
                @click="likeRecord(record)"
              >
                <van-icon name="good-job-o" size="14" />
                {{ record.likes || 0 }}
              </van-button>
              <van-button
                size="medium"
                plain
                type="info"
                @click="shareRecord(record)"
              >
                <van-icon name="share-o" size="14" />
                分享
              </van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 添加成长记录按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="plus"
      @click="addGrowthRecord"
    />

    <!-- 图片预览 -->
    <van-image-preview
      v-model:show="showImagePreview"
      :images="previewImages"
      :start-position="previewIndex"
    />

    <!-- 视频播放弹窗 -->
    <van-popup
      v-model:show="showVideoPlayer"
      position="center"
      :style="{ width: '90%', maxHeight: '80%' }"
      round
    >
      <div class="video-player">
        <video
          v-if="currentVideo"
          :src="currentVideo.url"
          controls
          autoplay
          style="width: 100%; max-height: 400px;"
        />
        <div class="video-close">
          <van-button size="medium" @click="showVideoPlayer = false">
            关闭
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 添加成长记录弹窗 -->
    <van-popup
      v-model:show="showAddDialog"
      position="bottom"
      :style="{ height: '80%' }"
      round
    >
      <div class="add-record-dialog">
        <div class="dialog-header">
          <h3>添加成长记录</h3>
          <van-button size="medium" @click="showAddDialog = false">
            取消
          </van-button>
        </div>
        <div class="dialog-content">
          <van-form @submit="submitRecord">
            <van-field
              v-model="newRecord.title"
              label="标题"
              placeholder="请输入记录标题"
              required
            />
            <van-field
              v-model="newRecord.description"
              label="描述"
              placeholder="请输入记录描述"
              type="textarea"
              rows="3"
            />
            <van-field
              name="category"
              label="分类"
              placeholder="请选择分类"
              readonly
              is-link
              @click="showCategoryPicker = true"
              :value="getCategoryText(newRecord.category)"
            />
            <van-field
              name="tags"
              label="标签"
              placeholder="请输入标签，多个用逗号分隔"
              v-model="newRecord.tagsInput"
            />
            <van-field name="images" label="图片">
              <template #input>
                <van-uploader
                  v-model="newRecord.images"
                  multiple
                  :max-count="9"
                  preview-size="60"
                />
              </template>
            </van-field>
            <van-field name="videos" label="视频">
              <template #input>
                <van-uploader
                  v-model="newRecord.videos"
                  accept="video/*"
                  :max-count="3"
                  preview-size="60"
                />
              </template>
            </van-field>
          </van-form>
        </div>
        <div class="dialog-footer">
          <van-button type="primary" block @click="submitRecord">
            保存记录
          </van-button>
        </div>
      </div>

      <!-- 分类选择器 -->
      <van-popup v-model:show="showCategoryPicker" position="bottom">
        <van-picker
          :columns="categoryOptions"
          @confirm="onCategoryConfirm"
          @cancel="showCategoryPicker = false"
        />
      </van-popup>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
import type { TagType } from 'vant'

interface Props {
  studentId: string
}

const props = defineProps<Props>()

// 响应式数据
const activeCategory = ref('all')
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showImagePreview = ref(false)
const showVideoPlayer = ref(false)
const showAddDialog = ref(false)
const showCategoryPicker = ref(false)

const previewImages = ref([])
const previewIndex = ref(0)
const currentVideo = ref(null)

// 成长记录数据
const growthRecords = ref([
  {
    id: 1,
    date: '2024-03-15',
    age: '4岁2个月',
    category: 'study',
    title: '认识数字1-10',
    description: '今天小明能够准确识别数字1-10，并且能够按照顺序排列。在游戏环节中表现出了很强的数学兴趣。',
    images: [
      { url: 'https://via.placeholder.com/200x200?text=学习照片1' },
      { url: 'https://via.placeholder.com/200x200?text=学习照片2' }
    ],
    videos: [],
    tags: ['数学', '认知发展', '数字'],
    teacher: '王老师',
    likes: 12
  },
  {
    id: 2,
    date: '2024-03-14',
    age: '4岁2个月',
    category: 'social',
    title: '主动帮助同学',
    description: '在自由活动时间，小明主动帮助不会拼图的小红完成拼图，表现出了很好的团队合作精神。',
    images: [
      { url: 'https://via.placeholder.com/200x200?text=社交照片' }
    ],
    videos: [
      {
        id: 1,
        url: 'video-url',
        thumbnail: 'https://via.placeholder.com/300x200?text=视频缩略图'
      }
    ],
    tags: ['社交能力', '帮助他人', '团队合作'],
    teacher: '李老师',
    likes: 8
  },
  {
    id: 3,
    date: '2024-03-13',
    age: '4岁2个月',
    category: 'art',
    title: '创意绘画作品',
    description: '小明今天创作了一幅关于春天的画作，色彩运用丰富，想象力很强。',
    images: [
      { url: 'https://via.placeholder.com/200x200?text=画作1' },
      { url: 'https://via.placeholder.com/200x200?text=画作2' },
      { url: 'https://via.placeholder.com/200x200?text=画作3' }
    ],
    videos: [],
    tags: ['艺术', '创造力', '绘画'],
    teacher: '张老师',
    likes: 15
  }
])

// 新增记录表单
const newRecord = reactive({
  title: '',
  description: '',
  category: '',
  tagsInput: '',
  images: [],
  videos: []
})

// 分类选项
const categoryOptions = [
  { text: '学习发展', value: 'study' },
  { text: '社交能力', value: 'social' },
  { text: '情感发展', value: 'emotional' },
  { text: '体能发展', value: 'physical' },
  { text: '艺术创作', value: 'art' }
]

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const getAgeText = (age: string) => {
  return age
}

const getCategoryText = (category: string) => {
  const option = categoryOptions.find(item => item.value === category)
  return option?.text || category
}

const getCategoryTagType = (category: string): TagType => {
  const typeMap: Record<string, TagType> = {
    study: 'primary',
    social: 'success',
    emotional: 'warning',
    physical: 'default',
    art: 'danger'
  }
  return typeMap[category] || 'default'
}

// 事件处理
const handleCategoryChange = (category: string) => {
  activeCategory.value = category
  loadGrowthRecords(true)
}

const onRefresh = () => {
  refreshing.value = true
  loadGrowthRecords(true)
}

const onLoad = () => {
  loadGrowthRecords(false)
}

const loadGrowthRecords = (reset = false) => {
  if (reset) {
    finished.value = false
  }

  loading.value = true
  setTimeout(() => {
    // 模拟加载数据
    if (reset) {
      // 重置数据
    }
    loading.value = false
    refreshing.value = false
    finished.value = true
  }, 1000)
}

const previewImage = (images: any[], index: number) => {
  previewImages.value = images.map(img => img.url)
  previewIndex.value = index
  showImagePreview.value = true
}

const playVideo = (video: any) => {
  currentVideo.value = video
  showVideoPlayer.value = true
}

const likeRecord = (record: any) => {
  record.likes = (record.likes || 0) + 1
  showToast('点赞成功')
}

const shareRecord = async (record: any) => {
  const shareUrl = `${window.location.origin}/growth/${record.id}`
  const shareText = `查看学生成长记录：${record.title}`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: record.title,
        text: shareText,
        url: shareUrl
      })
      showSuccessToast('分享成功')
    } catch (error) {
      await copyToClipboard(shareUrl)
    }
  } else {
    await copyToClipboard(shareUrl)
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccessToast('链接已复制')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showSuccessToast('链接已复制')
  }
}

const addGrowthRecord = () => {
  // 重置表单
  Object.assign(newRecord, {
    title: '',
    description: '',
    category: '',
    tagsInput: '',
    images: [],
    videos: []
  })
  showAddDialog.value = true
}

const onCategoryConfirm = ({ selectedOptions }: any) => {
  newRecord.category = selectedOptions[0]?.value || ''
  showCategoryPicker.value = false
}

const submitRecord = () => {
  if (!newRecord.title || !newRecord.category) {
    showToast('请填写标题和分类')
    return
  }

  // 处理标签
  const tags = newRecord.tagsInput
    ? newRecord.tagsInput.split(',').map(tag => tag.trim()).filter(Boolean)
    : []

  // 创建新记录
  const newRecordData = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    age: '4岁2个月',
    category: newRecord.category,
    title: newRecord.title,
    description: newRecord.description,
    images: newRecord.images,
    videos: newRecord.videos,
    tags,
    teacher: '当前老师',
    likes: 0
  }

  growthRecords.value.unshift(newRecordData)
  showAddDialog.value = false
  showToast('记录添加成功')
}

// 生命周期
onMounted(() => {
  loadGrowthRecords(true)
})
</script>

<style lang="scss" scoped>
.growth-tab {
  padding: 0 0 20px 0;
  min-height: 100vh;
  background: var(--van-background-color-light);

  .growth-record {
    background: white;
    margin: 0 0 12px 0;
    padding: var(--spacing-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .record-meta {
        .record-date {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: 2px;
        }

        .record-age {
          font-size: var(--text-xs);
          color: var(--van-text-color-3);
        }
      }
    }

    .record-content {
      margin-bottom: 12px;

      .record-title {
        margin: 0 0 8px 0;
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        line-height: 1.4;
      }

      .record-description {
        margin: 0 0 12px 0;
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.5;
      }

      .record-images {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: 12px;
        align-items: center;

        .van-image {
          border-radius: 8px;
          overflow: hidden;
        }

        .more-images {
          width: 60px;
          height: 60px;
          background: #f0f0f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          color: var(--van-text-color-3);
          cursor: pointer;
        }
      }

      .record-videos {
        margin-bottom: 12px;

        .video-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;

          .video-play-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 48px;
            height: 48px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .record-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
    }

    .record-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .record-teacher {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--van-text-color-3);
      }

      .record-actions {
        display: flex;
        gap: var(--spacing-sm);

        .van-button {
          height: 24px;
          padding: 0 8px;
          font-size: var(--text-xs);
        }
      }
    }
  }
}

.video-player {
  padding: var(--spacing-md);
  text-align: center;

  .video-close {
    margin-top: 12px;
  }
}

.add-record-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 20px;
    border-bottom: 1px solid #ebedf0;

    h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
    }
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;

    .van-form {
      padding: var(--spacing-md) 0;
    }
  }

  .dialog-footer {
    padding: var(--spacing-md) 20px;
    border-top: 1px solid #ebedf0;
  }
}

:deep(.van-tabs__wrap) {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>