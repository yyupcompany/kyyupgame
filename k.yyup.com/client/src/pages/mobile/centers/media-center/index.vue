<template>
  <MobileCenterLayout title="相册中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="photograph" size="20" @click="handleUpload" />
    </template>

    <div class="media-center-mobile">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h2>📸 相册中心</h2>
          <p>管理和分享精彩瞬间，记录孩子们成长的每一刻</p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item v-for="stat in statsData" :key="stat.key" class="stat-card" @click="navigateToDetail(stat.key)">
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" v-if="stat.trend">
                <van-tag size="medium" :type="stat.trend > 0 ? 'success' : 'default'">
                  {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
                </van-tag>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 功能模块 -->
      <div class="features-section">
        <div class="section-title">媒体管理功能</div>
        <van-grid :column-num="3" :gutter="12">
          <van-grid-item
            v-for="feature in features"
            :key="feature.key"
            class="feature-item"
            @click="navigateToFeature(feature.key)"
          >
            <div class="feature-icon">{{ feature.emoji }}</div>
            <div class="feature-name">{{ feature.name }}</div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 最近上传 -->
      <div class="recent-section">
        <div class="section-header">
          <span class="section-title">最近上传</span>
          <van-button size="medium" plain @click="viewAllMedia">查看全部</van-button>
        </div>

        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="media-grid" v-if="recentMedia.length > 0">
            <div
              v-for="media in recentMedia"
              :key="media.id"
              class="media-item"
              @click="previewMedia(media)"
            >
              <div class="media-preview">
                <img
                  v-if="media.type === 'image'"
                  :src="media.thumbnailUrl"
                  :alt="media.title"
                  @error="handleImageError"
                />
                <div v-else-if="media.type === 'video'" class="video-placeholder">
                  <van-icon name="play-circle-o" size="32" color="#fff" />
                </div>
                <div v-else class="audio-placeholder">
                  <van-icon name="music-o" size="32" color="#fff" />
                </div>
              </div>
              <div class="media-info">
                <div class="media-title">{{ media.title }}</div>
                <div class="media-meta">{{ formatDate(media.createdAt) }}</div>
              </div>
            </div>
          </div>
          <van-empty v-else description="暂无媒体文件" />
        </van-pull-refresh>
      </div>

      <!-- 相册列表 -->
      <div class="albums-section">
        <div class="section-header">
          <span class="section-title">我的相册</span>
          <van-button size="medium" type="primary" plain @click="createAlbum">新建相册</van-button>
        </div>

        <div class="albums-list" v-if="albums.length > 0">
          <div
            v-for="album in albums"
            :key="album.id"
            class="album-card"
            @click="viewAlbum(album)"
          >
            <div class="album-cover">
              <img v-if="album.coverUrl" :src="album.coverUrl" :alt="album.name" />
              <div v-else class="album-placeholder">
                <van-icon name="photo-o" size="32" />
              </div>
            </div>
            <div class="album-info">
              <div class="album-name">{{ album.name }}</div>
              <div class="album-meta">{{ album.photoCount || 0 }} 张照片</div>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无相册" />
      </div>
    </div>

    <!-- 图片预览 -->
    <van-image-preview
      v-model:show="showPreview"
      :images="previewImages"
      :start-position="previewIndex"
    />

    <!-- 上传弹窗 -->
    <van-action-sheet
      v-model:show="showUploadSheet"
      :actions="uploadActions"
      cancel-text="取消"
      @select="handleUploadSelect"
    />
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 状态
const refreshing = ref(false)
const showPreview = ref(false)
const previewImages = ref<string[]>([])
const previewIndex = ref(0)
const showUploadSheet = ref(false)

// 统计数据
const statsData = reactive([
  { key: 'files', label: '媒体文件', value: '1,256', icon: 'photo-o', color: '#6366f1', trend: 12 },
  { key: 'storage', label: '存储使用', value: '2.5GB', icon: 'cluster-o', color: '#10b981', trend: 8 },
  { key: 'categories', label: '分类数', value: '15', icon: 'label-o', color: '#f59e0b', trend: 2 },
  { key: 'shares', label: '本月分享', value: '89', icon: 'share-o', color: '#3b82f6', trend: 25 }
])

// 功能模块
const features = [
  { key: 'image-manager', name: '图片管理', emoji: '🖼️' },
  { key: 'video-manager', name: '视频管理', emoji: '🎬' },
  { key: 'audio-manager', name: '音频管理', emoji: '🎵' },
  { key: 'album-manager', name: '相册管理', emoji: '📸' },
  { key: 'media-editor', name: '媒体编辑', emoji: '✂️' },
  { key: 'media-publish', name: '发布分享', emoji: '📱' }
]

// 上传选项
const uploadActions = [
  { name: '拍照', icon: 'photograph' },
  { name: '从相册选择', icon: 'photo-o' },
  { name: '拍摄视频', icon: 'video-o' },
  { name: '录制音频', icon: 'music-o' }
]

// 最近媒体
const recentMedia = ref<any[]>([])

// 相册列表
const albums = ref<any[]>([])

// 初始化
onMounted(() => {
  loadRecentMedia()
  loadAlbums()
})

// 加载最近媒体
const loadRecentMedia = async () => {
  try {
    // TODO: 调用API获取最近上传的媒体
    recentMedia.value = [
      { id: 1, type: 'image', title: '户外活动照片', thumbnailUrl: '/placeholder-1.jpg', createdAt: '2026-01-07' },
      { id: 2, type: 'image', title: '美术课作品', thumbnailUrl: '/placeholder-2.jpg', createdAt: '2026-01-06' },
      { id: 3, type: 'video', title: '运动会精彩瞬间', thumbnailUrl: '', createdAt: '2026-01-05' },
      { id: 4, type: 'image', title: '班级合影', thumbnailUrl: '/placeholder-3.jpg', createdAt: '2026-01-04' }
    ]
  } catch (error) {
    console.error('加载媒体失败:', error)
  }
}

// 加载相册
const loadAlbums = async () => {
  try {
    // TODO: 调用API获取相册列表
    albums.value = [
      { id: 1, name: '2026新年活动', coverUrl: '', photoCount: 45 },
      { id: 2, name: '户外春游', coverUrl: '', photoCount: 32 },
      { id: 3, name: '美术作品集', coverUrl: '', photoCount: 28 }
    ]
  } catch (error) {
    console.error('加载相册失败:', error)
  }
}

// 下拉刷新
const onRefresh = async () => {
  await Promise.all([loadRecentMedia(), loadAlbums()])
  refreshing.value = false
}

// 日期格式化
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0]
}

// 图片加载错误处理
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNWU3ZWIiLz48cGF0aCBkPSJNMzUgNDBMMjUgNTVINzVMNTUgMzBMNDUgNDVMMzUgNDBaIiBmaWxsPSIjOWNhM2FmIi8+PGNpcmNsZSBjeD0iMzUiIGN5PSIzMCIgcj0iNSIgZmlsbD0iIzljYTNhZiIvPjwvc3ZnPg=='
}

// 导航
const navigateToDetail = (key: string) => {
  showToast(`查看${key}详情`)
}

const navigateToFeature = (key: string) => {
  showToast(`进入${key}功能`)
}

const viewAllMedia = () => {
  router.push('/mobile/centers/photo-album-center')
}

const viewAlbum = (album: any) => {
  showToast(`查看相册: ${album.name}`)
}

const createAlbum = async () => {
  try {
    await showConfirmDialog({
      title: '新建相册',
      message: '是否创建新的相册？'
    })
    showToast('相册创建成功')
    loadAlbums()
  } catch {
    // 用户取消
  }
}

// 媒体预览
const previewMedia = (media: any) => {
  if (media.type === 'image') {
    previewImages.value = [media.thumbnailUrl || media.url]
    previewIndex.value = 0
    showPreview.value = true
  } else if (media.type === 'video') {
    showToast('播放视频')
  } else {
    showToast('播放音频')
  }
}

// 上传
const handleUpload = () => {
  showUploadSheet.value = true
}

const handleUploadSelect = (action: { name: string }) => {
  showToast(`选择了: ${action.name}`)
  showUploadSheet.value = false
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
.media-center-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
  padding-bottom: 20px;
}

.welcome-section {
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  
  .welcome-content {
    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

.stats-section {
  padding: 12px;
  margin-top: -20px;
}

.stat-card {
  :deep(.van-grid-item__content) {
    padding: 12px;
    background: var(--van-background);
    border-radius: 8px;
  }
}

.stat-content {
  text-align: center;
  
  .stat-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--van-text-color);
    margin: 6px 0 2px;
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--van-text-color-2);
  }
  
  .stat-trend {
    margin-top: 4px;
  }
}

.features-section {
  padding: 12px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 12px;
  }
}

.feature-item {
  :deep(.van-grid-item__content) {
    padding: 16px 8px;
    background: var(--van-background);
    border-radius: 8px;
  }
  
  .feature-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }
  
  .feature-name {
    font-size: 12px;
    color: var(--van-text-color);
  }
}

.recent-section,
.albums-section {
  padding: 12px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--van-text-color);
    }
  }
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .media-item {
    background: var(--van-background);
    border-radius: 8px;
    overflow: hidden;
    
    .media-preview {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .video-placeholder,
      .audio-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .audio-placeholder {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }
    
    .media-info {
      padding: 8px;
      
      .media-title {
        font-size: 13px;
        color: var(--van-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .media-meta {
        font-size: 11px;
        color: var(--van-text-color-3);
        margin-top: 2px;
      }
    }
  }
}

.albums-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  
  .album-card {
    flex-shrink: 0;
    width: 120px;
    background: var(--van-background);
    border-radius: 8px;
    overflow: hidden;
    
    .album-cover {
      width: 100%;
      height: 80px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .album-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-gray-3);
        color: var(--van-gray-6);
      }
    }
    
    .album-info {
      padding: 8px;
      
      .album-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--van-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .album-meta {
        font-size: 11px;
        color: var(--van-text-color-3);
        margin-top: 2px;
      }
    }
  }
}
</style>
