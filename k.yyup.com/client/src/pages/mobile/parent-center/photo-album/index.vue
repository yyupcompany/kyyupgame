<template>
  <MobileMainLayout
    title="相册中心"
    :show-back="false"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-photo-album">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <UnifiedIcon name="picture" :size="24" />
            相册中心
          </h1>
          <p class="page-subtitle">查看宝宝在幼儿园的精彩时刻</p>
        </div>
      </div>

      <!-- 相册统计信息 -->
      <div class="stats-section">
        <van-grid :column-num="3" :gutter="12">
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalPhotos }}</div>
              <div class="stat-label">总照片数</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalAlbums }}</div>
              <div class="stat-label">相册数</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-value">{{ stats.favoritePhotos }}</div>
              <div class="stat-label">收藏照片</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 视图切换和筛选 -->
      <div class="action-section">
        <van-tabs v-model:active="viewMode" @change="handleViewModeChange">
          <van-tab title="相册视图" name="album">
            <template #title>
              <div class="tab-title">
                <UnifiedIcon name="folder" :size="16" />
                <span>相册视图</span>
              </div>
            </template>
          </van-tab>
          <van-tab title="时间轴" name="timeline">
            <template #title>
              <div class="tab-title">
                <UnifiedIcon name="clock" :size="16" />
                <span>时间轴</span>
              </div>
            </template>
          </van-tab>
        </van-tabs>

        <!-- 相册筛选 -->
        <div v-if="viewMode === 'timeline'" class="filter-section">
          <van-dropdown-menu>
            <van-dropdown-item 
              v-model="selectedAlbumFilter" 
              :options="albumFilterOptions"
              @change="loadPhotos"
            />
          </van-dropdown-menu>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <van-button
            type="primary"
            size="small"
            block
            @click="showUploadDialog = true"
          >
            <template #icon>
              <UnifiedIcon name="upload" :size="16" />
            </template>
            上传照片
          </van-button>
        </div>
      </div>

      <!-- 相册视图 -->
      <div v-if="viewMode === 'album'" class="album-view">
        <van-loading v-if="loading" type="spinner" color="#1989fa">
          加载中...
        </van-loading>
        
        <div v-else-if="albums.length === 0" class="empty-state">
          <van-empty description="暂无相册数据" />
        </div>
        
        <div v-else class="album-list">
          <div 
            v-for="album in albums" 
            :key="album.id"
            class="album-card"
            @click="viewAlbumPhotos(album)"
          >
            <div class="album-cover">
              <van-image
                :src="album.coverImage || '/default-album.png'"
                :alt="album.title"
                width="100%"
                height="120"
                fit="cover"
                error="/default-album.png"
              />
              <div class="album-overlay">
                <van-button type="primary" size="small">
                  查看照片
                </van-button>
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-title">{{ album.title }}</h3>
              <p class="album-description">{{ album.description }}</p>
              <div class="album-meta">
                <span class="photo-count">
                  <UnifiedIcon name="picture" :size="12" />
                  {{ album.photoCount }}张照片
                </span>
                <span class="album-date">{{ formatDate(album.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间轴视图 -->
      <div v-else class="timeline-view">
        <van-loading v-if="loading" type="spinner" color="#1989fa">
          加载中...
        </van-loading>
        
        <div v-else-if="timelineData.length === 0" class="empty-state">
          <van-empty description="暂无照片数据" />
        </div>
        
        <div v-else class="timeline-list">
          <div 
            v-for="(group, index) in timelineData" 
            :key="index"
            class="timeline-group"
          >
            <div class="timeline-header" :style="{ borderColor: getTimelineColor(index) }">
              <div class="timeline-title">{{ group.title }}</div>
              <div class="timeline-count">{{ group.photos.length }}张照片</div>
            </div>
            
            <van-grid :column-num="3" :gutter="8" class="photo-grid">
              <van-grid-item 
                v-for="photo in group.photos" 
                :key="photo.id"
                class="photo-item"
                @click="previewPhoto(photo)"
              >
                <div class="photo-wrapper">
                  <van-image
                    :src="photo.url || '/default-photo.png'"
                    :alt="photo.caption"
                    width="100%"
                    height="100"
                    fit="cover"
                    error="/default-photo.png"
                  />
                  <div class="photo-overlay">
                    <UnifiedIcon name="eye" :size="20" color="#fff" />
                  </div>
                  <div v-if="photo.caption" class="photo-caption">
                    {{ photo.caption }}
                  </div>
                </div>
              </van-grid-item>
            </van-grid>
          </div>
        </div>
      </div>

      <!-- 照片预览 -->
      <van-image-preview
        v-model:show="showPhotoPreview"
        :images="previewImages"
        :start-position="currentPreviewIndex"
        @change="onPreviewChange"
      >
        <template #cover>
          <div v-if="selectedPhoto" class="preview-info">
            <div v-if="selectedPhoto.caption" class="preview-caption">
              {{ selectedPhoto.caption }}
            </div>
            <div class="preview-meta">
              <div class="meta-item">
                <span class="meta-label">拍摄时间：</span>
                {{ formatDateTime(selectedPhoto.shootDate || selectedPhoto.uploadTime) }}
              </div>
              <div class="meta-item">
                <span class="meta-label">所属相册：</span>
                {{ selectedPhoto.albumName || '未分类' }}
              </div>
            </div>
          </div>
        </template>
      </van-image-preview>

      <!-- 上传对话框 -->
      <van-popup
        v-model:show="showUploadDialog"
        position="bottom"
        :style="{ height: '80%' }"
        round
      >
        <div class="upload-dialog">
          <div class="dialog-header">
            <h3>上传照片到相册</h3>
            <van-button
              type="default"
              size="small"
              @click="showUploadDialog = false"
            >
              取消
            </van-button>
          </div>

          <div class="upload-form">
            <van-form @submit="handleUpload">
              <van-field
                v-model="uploadForm.albumId"
                name="albumId"
                label="选择相册"
                placeholder="请选择相册"
                :rules="[{ required: true, message: '请选择相册' }]"
              >
                <template #input>
                  <van-picker
                    v-if="showAlbumPicker"
                    :columns="albumPickerColumns"
                    @confirm="onAlbumConfirm"
                    @cancel="showAlbumPicker = false"
                  />
                  <van-cell
                    :title="selectedAlbumName || '请选择相册'"
                    is-link
                    @click="showAlbumPicker = true"
                  />
                </template>
              </van-field>

              <van-field
                v-model="uploadForm.caption"
                name="caption"
                label="照片描述"
                type="textarea"
                placeholder="为照片添加描述..."
                :rows="3"
              />

              <van-field
                v-model="uploadForm.shootDate"
                name="shootDate"
                label="拍摄时间"
                placeholder="选择拍摄时间"
                readonly
                @click="showDatePicker = true"
              />

              <van-field name="photos" label="选择照片">
                <template #input>
                  <van-uploader
                    v-model="uploadForm.fileList"
                    multiple
                    :max-count="9"
                    :after-read="handleFileRead"
                    preview-size="80px"
                    accept="image/*"
                  />
                </template>
              </van-field>

              <div class="upload-actions">
                <van-button
                  type="primary"
                  native-type="submit"
                  :loading="uploading"
                  :disabled="!uploadForm.albumId || uploadForm.fileList.length === 0"
                  block
                >
                  {{ uploading ? '上传中...' : '开始上传' }}
                </van-button>
              </div>
            </van-form>
          </div>
        </div>
      </van-popup>

      <!-- 日期选择器 -->
      <van-date-picker
        v-model="shootDateValue"
        :show="showDatePicker"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
        title="选择拍摄时间"
      />

      <!-- 相册选择器 -->
      <van-picker
        v-model="albumPickerValue"
        :show="showAlbumPicker"
        :columns="albumPickerColumns"
        @confirm="onAlbumConfirm"
        @cancel="showAlbumPicker = false"
        title="选择相册"
      />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { photoAlbumAPI } from '@/api/modules/photo-album'

// 视图模式
const viewMode = ref<'album' | 'timeline'>('album')

// 数据
const albums = ref<any[]>([])
const photos = ref<any[]>([])
const stats = ref({
  totalPhotos: 0,
  totalAlbums: 0,
  favoritePhotos: 0
})
const loading = ref(false)
const uploading = ref(false)

// 筛选
const selectedAlbumFilter = ref('')

// 对话框控制
const showUploadDialog = ref(false)
const showPhotoPreview = ref(false)
const showDatePicker = ref(false)
const showAlbumPicker = ref(false)
const selectedPhoto = ref<any>(null)
const currentPreviewIndex = ref(0)

// 上传表单
const uploadForm = ref({
  albumId: '',
  caption: '',
  shootDate: '',
  fileList: [] as any[]
})

// 日期选择器值
const shootDateValue = ref(new Date())
const albumPickerValue = ref('')

// 计算属性
const albumFilterOptions = computed(() => {
  const options = [{ text: '全部相册', value: '' }]
  albums.value.forEach(album => {
    options.push({ text: album.title, value: album.id })
  })
  return options
})

const albumPickerColumns = computed(() => {
  return albums.value.map(album => ({
    text: album.title,
    value: album.id
  }))
})

const selectedAlbumName = computed(() => {
  const album = albums.value.find(a => a.id === uploadForm.value.albumId)
  return album?.title || ''
})

const previewImages = computed(() => {
  return photos.value.map(photo => photo.url || '/default-photo.png')
})

const timelineData = computed(() => {
  if (photos.value.length === 0) return []

  // 按相册ID筛选
  let filteredPhotos = photos.value
  if (selectedAlbumFilter.value) {
    filteredPhotos = photos.value.filter(p => p.albumId === selectedAlbumFilter.value)
  }

  // 按拍摄时间分组
  const groupedByDate: Record<string, any[]> = {}
  filteredPhotos.forEach(photo => {
    const date = formatDate(photo.shootDate || photo.uploadTime)
    if (!groupedByDate[date]) {
      groupedByDate[date] = []
    }
    groupedByDate[date].push(photo)
  })

  // 转换为数组并排序
  return Object.keys(groupedByDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      title: getDateTitle(date),
      photos: groupedByDate[date]
    }))
})

// 加载相册列表
const loadAlbums = async () => {
  try {
    loading.value = true
    const response = await photoAlbumAPI.getAlbums({ page: 1, pageSize: 100 })
    if (response.success && response.data) {
      albums.value = response.data.items || []
    }
  } catch (error: any) {
    console.error('加载相册列表失败:', error)
    showFailToast(error.message || '加载相册列表失败')
  } finally {
    loading.value = false
  }
}

// 加载照片列表
const loadPhotos = async () => {
  try {
    loading.value = true
    console.log('📷 加载照片列表...')
    console.log('📷 相册筛选:', selectedAlbumFilter.value)
    
    // 调用真实API获取照片数据
    const response = await photoAlbumAPI.getPhotos({ 
      albumId: selectedAlbumFilter.value || undefined,
      page: 1, 
      pageSize: 100 
    })
    
    console.log('📷 API响应:', response)
    
    // 处理API返回的数据
    if (response.data && response.data.items) {
      photos.value = response.data.items.map((item: any) => ({
        id: item.id,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        caption: item.caption,
        description: item.description,
        shootDate: item.shootDate,
        uploadTime: item.uploadTime,
        albumId: item.albumId,
        albumName: item.albumName,
        activityName: item.activityName,
        activityType: item.activityType,
        category: item.category
      }))
      console.log(`✅ 加载了 ${photos.value.length} 张真实照片`)
    } else {
      console.warn('⚠️ API返回数据格式异常:', response)
      photos.value = []
    }
  } catch (error: any) {
    console.error('❌ 加载照片失败:', error)
    showFailToast('加载照片失败: ' + (error.message || '未知错误'))
    photos.value = []
  } finally {
    loading.value = false
  }
}

// 加载统计信息
const loadStats = async () => {
  try {
    const response = await photoAlbumAPI.getAlbumStats()
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (error: any) {
    console.error('加载统计信息失败:', error)
  }
}

// 查看相册照片
const viewAlbumPhotos = async (album: any) => {
  selectedAlbumFilter.value = album.id
  viewMode.value = 'timeline'
  await loadPhotos()
}

// 预览照片
const previewPhoto = (photo: any) => {
  selectedPhoto.value = photo
  const index = photos.value.findIndex(p => p.id === photo.id)
  currentPreviewIndex.value = index >= 0 ? index : 0
  showPhotoPreview.value = true
}

// 预览切换
const onPreviewChange = (index: number) => {
  selectedPhoto.value = photos.value[index] || null
}

// 文件读取处理
const handleFileRead = (file: any) => {
  console.log('文件读取:', file)
}

// 视图模式切换
const handleViewModeChange = async (name: string) => {
  if (name === 'timeline' && photos.value.length === 0) {
    await loadPhotos()
  }
}

// 日期确认
const onDateConfirm = ({ selectedValues }: any) => {
  uploadForm.value.shootDate = selectedValues.join('-')
  showDatePicker.value = false
}

// 相册确认
const onAlbumConfirm = ({ selectedValues }: any) => {
  uploadForm.value.albumId = selectedValues[0]
  showAlbumPicker.value = false
}

// 上传照片
const handleUpload = async () => {
  if (!uploadForm.value.albumId) {
    showToast('请选择相册')
    return
  }
  if (uploadForm.value.fileList.length === 0) {
    showToast('请选择要上传的照片')
    return
  }

  try {
    uploading.value = true
    // TODO: 调用后端API上传照片
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    showSuccessToast(`成功上传 ${uploadForm.value.fileList.length} 张照片`)
    showUploadDialog.value = false
    
    // 重置表单
    uploadForm.value = {
      albumId: '',
      caption: '',
      shootDate: '',
      fileList: []
    }
    
    // 刷新数据
    await loadAlbums()
    await loadStats()
    if (viewMode.value === 'timeline') {
      await loadPhotos()
    }
  } catch (error: any) {
    console.error('上传照片失败:', error)
    showFailToast(error.message || '上传照片失败')
  } finally {
    uploading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取日期标题
const getDateTitle = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (formatDate(dateStr) === formatDate(today.toISOString())) {
    return '今天'
  } else if (formatDate(dateStr) === formatDate(yesterday.toISOString())) {
    return '昨天'
  } else {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    return `${date.getFullYear()}年 ${monthNames[date.getMonth()]}`
  }
}

// 获取时间轴颜色
const getTimelineColor = (index: number) => {
  const colors = ['#1989fa', '#07c160', '#ff976a', '#ee0a24', '#7232dd']
  return colors[index % colors.length]
}

// 监听视图模式变化
watch(viewMode, async (newMode) => {
  if (newMode === 'timeline' && photos.value.length === 0) {
    await loadPhotos()
  }
})

// 初始化
onMounted(() => {
  loadAlbums()
  loadStats()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-photo-album {
  background: var(--app-bg-color);
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  padding-bottom: var(--app-gap);

  .page-header {
    background: var(--primary-gradient);
    color: var(--text-white);
    padding: var(--spacing-xl) var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    border-radius: var(--border-radius-lg);

    .header-content {
      text-align: center;

      .page-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-white);
      }

      .page-subtitle {
        margin: 0;
        font-size: var(--font-size-sm);
        opacity: 0.9;
        color: var(--text-white);
      }
    }
  }

  .stats-section {
    background: var(--card-bg);
    margin: 0 var(--spacing-lg) var(--spacing-lg);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--van-primary-color);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-gray-6);
      }
    }
  }

  .action-section {
    background: var(--card-bg);
    margin: 0 var(--spacing-lg) var(--spacing-lg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;

    :deep(.van-tabs) {
      .van-tabs__nav {
        background: white;
        padding: 0 var(--van-padding-md);
      }

      .van-tab {
        flex: 1;
        
        .tab-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-sm);
        }
      }

      .van-tab--active {
        color: var(--primary-color);
        font-weight: var(--font-weight-semibold);
      }

      .van-tabs__line {
        background: var(--primary-color);
        height: 3px;
      }
    }

    .filter-section {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--border-light);
    }

    .action-buttons {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--border-light);
    }
  }

  .album-view, .timeline-view {
    padding: 0 var(--van-padding-md) var(--van-padding-md);

    .empty-state {
      background: var(--card-bg);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-xl) 0;
      text-align: center;
    }
  }

  .album-list {
    .album-card {
      background: var(--card-bg);
      border-radius: var(--border-radius-lg);
      margin-bottom: var(--spacing-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .album-cover {
        position: relative;
        height: 120px;

        :deep(.van-image) {
          border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
        }

        .album-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:active .album-overlay {
          opacity: 1;
        }
      }

      .album-info {
        padding: var(--van-padding-md);

        .album-title {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          line-height: var(--line-height-tight);
        }

        .album-description {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: var(--line-height-relaxed);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .album-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--font-size-xs);
          color: var(--text-muted);

          .photo-count {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
          }

          .album-date {
            font-size: 11px;
          }
        }
      }
    }
  }

  .timeline-list {
    .timeline-group {
      background: var(--card-bg);
      border-radius: var(--border-radius-lg);
      margin-bottom: var(--spacing-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);

      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg);
        border-left: 4px solid;
        background: var(--bg-secondary);

        .timeline-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
        }

        .timeline-count {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
      }

      .photo-grid {
        padding: var(--spacing-lg);

        .photo-item {
          .photo-wrapper {
            position: relative;
            aspect-ratio: 1;
            border-radius: var(--border-radius-md);
            overflow: hidden;
            background: var(--bg-secondary);

            :deep(.van-image) {
              border-radius: var(--van-radius-md);
            }

            .photo-overlay {
              position: absolute;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s ease;
            }

            &:active .photo-overlay {
              opacity: 1;
            }

            .photo-caption {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: var(--spacing-xs);
              background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
              color: white;
              font-size: 10px;
              text-align: center;
              line-height: 1.2;
            }
          }
        }
      }
    }
  }

  .preview-info {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: var(--van-padding-md);
    border-radius: 0 0 var(--van-radius-lg) var(--van-radius-lg);
    margin: 0 var(--van-padding-md);

    .preview-caption {
      font-size: var(--text-base);
      font-weight: 600;
      margin-bottom: var(--van-padding-sm);
      text-align: center;
    }

    .preview-meta {
      .meta-item {
        display: flex;
        margin-bottom: 4px;
        font-size: var(--text-sm);
        line-height: 1.4;

        .meta-label {
          color: rgba(255, 255, 255, 0.8);
          min-width: 80px;
        }
      }
    }
  }

  .upload-dialog {
    height: 100%;
    display: flex;
    flex-direction: column;

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--van-padding-md);
      border-bottom: 1px solid var(--van-gray-1);

      h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
      }
    }

    .upload-form {
      flex: 1;
      padding: var(--van-padding-md);
      overflow-y: auto;

      .upload-actions {
        margin-top: var(--van-padding-xl);
        padding-top: var(--van-padding-md);
        border-top: 1px solid var(--van-gray-1);
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-photo-album {
    max-width: 768px;
    margin: 0 auto;
  }
}

// Vant组件样式覆盖
:deep(.van-dropdown-menu__bar) {
  box-shadow: none;
  border-bottom: 1px solid var(--van-gray-1);
}

:deep(.van-uploader__upload) {
  background: var(--van-gray-1);
  border: 2px dashed var(--van-gray-4);
  border-radius: var(--van-radius-md);
}

:deep(.van-picker) {
  border-radius: var(--van-radius-lg) var(--van-radius-lg) 0 0;
}

:deep(.van-image-preview__image) {
  max-height: 70vh;
  object-fit: contain;
}
</style>