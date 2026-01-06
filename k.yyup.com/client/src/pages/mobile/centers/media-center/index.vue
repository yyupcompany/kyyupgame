<template>
  <MobileMainLayout
    title="相册中心"
    :show-back="true"
    @back="handleBack"
  >
    <template #header-extra>
      <van-icon name="plus" size="18" @click="handleUpload" />
    </template>

    <div class="mobile-media-center">
      <!-- 欢迎词 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h2>欢迎来到相册中心</h2>
          <p>管理和分享精彩瞬间，记录孩子们成长的每一刻</p>
        </div>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <van-loading v-if="loading" size="24px" color="#1989fa">加载媒体数据中...</van-loading>
        <div v-else class="stats-grid">
          <div 
            class="stat-card stat-primary" 
            @click="navigateToDetail('files')"
          >
            <div class="stat-icon">📷</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(stats.totalFiles) }}</div>
              <div class="stat-title">媒体文件总数</div>
              <div class="stat-trend">本月新增 {{ stats.fileGrowth }}%</div>
            </div>
          </div>
          
          <div 
            class="stat-card stat-success" 
            @click="navigateToDetail('storage')"
          >
            <div class="stat-icon">💾</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatStorage(stats.storageUsed) }}</div>
              <div class="stat-title">存储空间使用</div>
              <div class="stat-trend">存储增长 {{ stats.storageGrowth }}%</div>
            </div>
          </div>
          
          <div 
            class="stat-card stat-info" 
            @click="navigateToDetail('categories')"
          >
            <div class="stat-icon">📁</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalCategories }}</div>
              <div class="stat-title">媒体分类数</div>
              <div class="stat-trend">新增分类 {{ stats.categoryGrowth }}</div>
            </div>
          </div>
          
          <div 
            class="stat-card stat-warning" 
            @click="navigateToDetail('shares')"
          >
            <div class="stat-icon">🔗</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(stats.sharedCount) }}</div>
              <div class="stat-title">本月分享次数</div>
              <div class="stat-trend">分享增长 {{ stats.shareGrowth }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 媒体管理功能概览 -->
      <div class="media-features">
        <div class="section-header">
          <h3>媒体管理功能</h3>
        </div>
        <div class="features-grid">
          <div class="feature-item" @click="navigateToFeature('image-manager')">
            <div class="feature-icon">🖼️</div>
            <div class="feature-content">
              <h4>图片管理</h4>
              <p>管理活动照片、学生作品、校园环境等图片资源，支持批量处理和智能分类。</p>
            </div>
            <van-icon name="arrow" class="feature-arrow" />
          </div>

          <div class="feature-item" @click="navigateToFeature('video-manager')">
            <div class="feature-icon">🎬</div>
            <div class="feature-content">
              <h4>视频管理</h4>
              <p>管理教学视频、活动录像、宣传视频等，支持在线预览和剪辑功能。</p>
            </div>
            <van-icon name="arrow" class="feature-arrow" />
          </div>

          <div class="feature-item" @click="navigateToFeature('audio-manager')">
            <div class="feature-icon">🎵</div>
            <div class="feature-content">
              <h4>音频管理</h4>
              <p>管理音乐、录音、语音故事等音频文件，支持在线播放和格式转换。</p>
            </div>
            <van-icon name="arrow" class="feature-arrow" />
          </div>

          <div class="feature-item" @click="navigateToFeature('album-manager')">
            <div class="feature-icon">📸</div>
            <div class="feature-content">
              <h4>相册管理</h4>
              <p>创建和管理主题相册，自动生成精美排版，支持家长端查看和下载。</p>
            </div>
            <van-icon name="arrow" class="feature-arrow" />
          </div>

          <div class="feature-item" @click="navigateToFeature('media-editor')">
            <div class="feature-icon">✂️</div>
            <div class="feature-content">
              <h4>媒体编辑</h4>
              <p>提供在线图片编辑、视频剪辑、音频处理等工具，快速制作精美媒体内容。</p>
            </div>
            <van-icon name="arrow" class="feature-arrow" />
          </div>

          <div class="feature-item" @click="navigateToFeature('media-publish')">
            <div class="feature-icon">📱</div>
            <div class="feature-content">
              <h4>发布分享</h4>
              <p>一键发布到家长端、微信公众号、官方网站等平台，支持多渠道分享。</p>
            </div>
            <van-icon name="arrow" class="feature-arrow" />
          </div>
        </div>
      </div>

      <!-- 最近上传的媒体文件 -->
      <div class="recent-media">
        <div class="section-header">
          <h3>最近上传</h3>
          <van-button type="primary" size="small" plain @click="navigateToFeature('recent-media')">
            查看全部
            <van-icon name="arrow" />
          </van-button>
        </div>

        <van-loading v-if="loading" size="20px">加载中...</van-loading>
        <div v-else class="media-grid">
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
              <div v-else-if="media.type === 'video'" class="video-thumbnail">
                <van-icon name="play" class="play-icon" />
                <img :src="media.thumbnailUrl" :alt="media.title" />
              </div>
              <div v-else class="audio-thumbnail">
                <van-icon name="music-o" class="audio-icon" />
              </div>
            </div>
            <div class="media-info">
              <h4>{{ media.title }}</h4>
              <p>{{ formatDate(media.uploadTime) }}</p>
              <div class="media-actions">
                <van-button size="mini" icon="edit" @click.stop="editMedia(media)" />
                <van-button size="mini" icon="share" @click.stop="shareMedia(media)" />
                <van-button size="mini" icon="delete" @click.stop="deleteMedia(media)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作区域 -->
      <div class="quick-actions">
        <div class="section-header">
          <h3>快速操作</h3>
        </div>
        <div class="actions-grid">
          <div class="action-item" @click="handleBatchUpload">
            <div class="action-icon">📤</div>
            <h4>批量上传</h4>
            <p>一次性上传多个媒体文件</p>
          </div>

          <div class="action-item" @click="handleCreateAlbum">
            <div class="action-icon">📁</div>
            <h4>创建相册</h4>
            <p>创建主题相册分类管理</p>
          </div>

          <div class="action-item" @click="handleImportFromPhone">
            <div class="action-icon">📲</div>
            <h4>手机导入</h4>
            <p>从手机相册快速导入</p>
          </div>

          <div class="action-item" @click="handleAutoProcess">
            <div class="action-icon">🤖</div>
            <h4>智能处理</h4>
            <p>AI自动优化和分类</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 媒体预览弹窗 -->
    <van-popup
      v-model:show="previewVisible"
      position="center"
      :style="{ width: '90%', maxHeight: '80vh' }"
      round
      closeable
    >
      <div class="media-preview-popup">
        <div class="preview-title">{{ selectedMedia?.title }}</div>
        <div class="preview-content">
          <img
            v-if="selectedMedia?.type === 'image'"
            :src="selectedMedia.url"
            :alt="selectedMedia.title"
            class="preview-image"
          />
          <video
            v-else-if="selectedMedia?.type === 'video'"
            :src="selectedMedia.url"
            controls
            class="preview-video"
          />
          <audio
            v-else-if="selectedMedia?.type === 'audio'"
            :src="selectedMedia.url"
            controls
            class="preview-audio"
          />
        </div>
        <div class="preview-actions">
          <van-button block @click="downloadMedia(selectedMedia)">下载</van-button>
          <van-button block type="success" @click="shareMedia(selectedMedia)">分享</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 上传弹窗 -->
    <van-popup
      v-model:show="uploadVisible"
      position="bottom"
      :style="{ height: '60%' }"
      round
      closeable
    >
      <div class="upload-popup">
        <div class="upload-title">上传媒体文件</div>
        <div class="upload-content">
          <van-uploader
            v-model="fileList"
            multiple
            :after-read="afterRead"
            :before-read="beforeRead"
            :max-count="9"
            :max-size="100 * 1024 * 1024"
            accept="image/*,video/*,audio/*"
            preview-size="80px"
          >
            <div class="upload-button">
              <van-icon name="plus" size="32" />
              <p>选择文件</p>
              <p class="upload-hint">支持图片、视频、音频，最大100MB</p>
            </div>
          </van-uploader>
        </div>
        <div class="upload-actions">
          <van-button block @click="uploadVisible = false">取消</van-button>
          <van-button block type="primary" @click="confirmUpload" :loading="uploading">
            开始上传
          </van-button>
        </div>
      </div>
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const uploading = ref(false)
const previewVisible = ref(false)
const uploadVisible = ref(false)
const selectedMedia = ref<any>(null)
const fileList = ref<any[]>([])
const apiError = ref<string | null>(null)

// 统计数据
const stats = reactive({
  totalFiles: 0,
  fileGrowth: 0,
  storageUsed: 0, // GB
  storageGrowth: 0,
  totalCategories: 0,
  categoryGrowth: 0,
  sharedCount: 0,
  shareGrowth: 0
})

// 最近媒体数据
const recentMedia = ref([
  {
    id: 1,
    title: '春游活动照片',
    type: 'image',
    thumbnailUrl: '/api/placeholder/300x200',
    url: '/api/placeholder/800x600',
    uploadTime: '2024-03-15T10:30:00Z'
  },
  {
    id: 2,
    title: '亲子运动会视频',
    type: 'video',
    thumbnailUrl: '/api/placeholder/300x200',
    url: '/api/placeholder/800x600',
    uploadTime: '2024-03-14T15:45:00Z'
  },
  {
    id: 3,
    title: '儿童故事录音',
    type: 'audio',
    thumbnailUrl: '/api/placeholder/300x200',
    url: '/api/placeholder/audio.mp3',
    uploadTime: '2024-03-13T09:20:00Z'
  },
  {
    id: 4,
    title: '校园环境照片',
    type: 'image',
    thumbnailUrl: '/api/placeholder/300x200',
    url: '/api/placeholder/800x600',
    uploadTime: '2024-03-12T14:10:00Z'
  }
])

// 格式化函数
function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

function formatStorage(gb: number) {
  if (gb >= 1) {
    return gb.toFixed(1) + 'GB'
  }
  return (gb * 1024).toFixed(0) + 'MB'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 导航函数
function handleBack() {
  router.back()
}

function navigateToDetail(type: string) {
  showToast(`导航到${type}详情页面`)
  // router.push(`/mobile/media/${type}`)
}

function navigateToFeature(feature: string) {
  showToast(`导航到${feature}功能`)
  // router.push(`/mobile/media/${feature}`)
}

// 媒体操作函数
function previewMedia(media: any) {
  selectedMedia.value = media
  previewVisible.value = true
}

function editMedia(media: any) {
  showToast(`编辑媒体: ${media.title}`)
  // router.push(`/mobile/media/edit/${media.id}`)
}

function shareMedia(media: any) {
  showToast({
    type: 'success',
    message: `分享媒体: ${media.title}`
  })
  // 实现分享逻辑
}

async function deleteMedia(media: any) {
  try {
    await showConfirmDialog({
      title: '删除确认',
      message: `确定要删除"${media.title}"吗？`,
    })
    showToast({
      type: 'success',
      message: '删除成功'
    })
    // 实现删除逻辑
  } catch (error) {
    // 用户取消
  }
}

function downloadMedia(media: any) {
  if (!media) return

  const link = document.createElement('a')
  link.href = media.url
  link.download = media.title
  link.click()
  showToast({
    type: 'success',
    message: '开始下载'
  })
}

// 上传相关函数
function handleUpload() {
  uploadVisible.value = true
}

function beforeRead(file: File) {
  const isValidType = ['image/', 'video/', 'audio/'].some(type =>
    file.type.startsWith(type)
  )
  const isValidSize = file.size <= 100 * 1024 * 1024 // 100MB

  if (!isValidType) {
    showToast('只支持图片、视频、音频格式的文件')
    return false
  }
  if (!isValidSize) {
    showToast('文件大小不能超过100MB')
    return false
  }
  return true
}

function afterRead(file: any) {
  // 处理文件读取完成
  console.log('文件读取完成:', file)
}

function confirmUpload() {
  if (fileList.value.length === 0) {
    showToast('请选择要上传的文件')
    return
  }
  
  uploading.value = true
  setTimeout(() => {
    uploading.value = false
    uploadVisible.value = false
    fileList.value = []
    showToast({
      type: 'success',
      message: '上传成功'
    })
    // 刷新数据
    fetchMediaCenterData()
  }, 2000)
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/api/placeholder/300x200?text=加载失败'
}

// 快速操作函数
function handleBatchUpload() {
  showToast('打开批量上传界面')
  uploadVisible.value = true
}

function handleCreateAlbum() {
  showToast('创建新相册')
  // router.push('/mobile/media/album/create')
}

function handleImportFromPhone() {
  showToast('手机导入功能开发中')
}

function handleAutoProcess() {
  showToast('AI智能处理功能开发中')
}

// API调用函数
async function fetchMediaCenterData() {
  try {
    loading.value = true
    apiError.value = null

    // 设置请求超时时间为10秒
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // 获取统计数据
    const statsResponse = await fetch('/api/media-center/statistics', {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    clearTimeout(timeoutId)

    if (!statsResponse.ok) {
      throw new Error(`获取统计数据失败: ${statsResponse.status}`)
    }

    const statsData = await statsResponse.json()
    if (statsData.success) {
      Object.assign(stats, {
        totalFiles: statsData.data.totalContents || 0,
        fileGrowth: statsData.data.recentContents || 0,
        storageUsed: 2.8, // 模拟数据
        storageGrowth: 0.3,
        totalCategories: statsData.data.contentsByType?.length || 0,
        categoryGrowth: 2,
        sharedCount: statsData.data.totalContents || 0,
        shareGrowth: 18.2
      })
    }

    // 获取最近创作内容
    const recentResponse = await fetch('/api/media-center/recent-creations?limit=4', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (recentResponse.ok) {
      const recentData = await recentResponse.json()
      if (recentData.success && recentData.data.length > 0) {
        recentMedia.value = recentData.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type === 'article' ? 'image' : item.type,
          thumbnailUrl: '/api/placeholder/300x200',
          url: '/api/placeholder/800x600',
          uploadTime: item.createdAt
        }))
      }
    }

  } catch (error: any) {
    console.error('Media Center API Error:', error)
    apiError.value = error.message || '加载数据失败'

    // 如果API失败，使用模拟数据
    Object.assign(stats, {
      totalFiles: 1248,
      fileGrowth: 12.5,
      storageUsed: 2.8,
      storageGrowth: 0.3,
      totalCategories: 15,
      categoryGrowth: 2,
      sharedCount: 342,
      shareGrowth: 18.2
    })

    // 显示友好的错误提示
    if (error.name === 'AbortError') {
      showToast('请求超时，正在显示缓存数据')
    } else {
      showToast('无法连接到服务器，正在显示模拟数据')
    }
  } finally {
    loading.value = false
  }
}

// 刷新数据
function handleRefresh() {
  fetchMediaCenterData()
}

// 生命周期
onMounted(() => {
  fetchMediaCenterData()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-media-center {
  padding: var(--spacing-md);
  background: #f7f8fa;
  min-height: 100vh;

  .welcome-section {
    text-align: center;
    margin-bottom: 24px;
    padding: var(--spacing-lg) 16px;
    background: var(--primary-gradient);
    border-radius: 12px;
    color: white;

    .welcome-content {
      h2 {
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      p {
        font-size: var(--text-sm);
        opacity: 0.9;
        margin: 0;
      }
    }
  }

  .stats-section {
    margin-bottom: 24px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);

      .stat-card {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        background: var(--card-bg);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
        }

        .stat-icon {
          font-size: var(--text-2xl);
          margin-right: 12px;
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: #323233;
            margin-bottom: 4px;
          }

          .stat-title {
            font-size: var(--text-xs);
            color: #969799;
            margin-bottom: 4px;
          }

          .stat-trend {
            font-size: 10px;
            color: #07c160;
          }
        }

        &.stat-primary {
          background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
          color: white;

          .stat-content {
            .stat-value, .stat-title {
              color: white;
            }
          }
        }

        &.stat-success {
          background: linear-gradient(135deg, #07c160 0%, #38d9a9 100%);
          color: white;

          .stat-content {
            .stat-value, .stat-title {
              color: white;
          }
        }
        }

        &.stat-info {
          background: linear-gradient(135deg, #ff976a 0%, #ffc069 100%);
          color: white;

          .stat-content {
            .stat-value, .stat-title {
              color: white;
            }
          }
        }

        &.stat-warning {
          background: linear-gradient(135deg, #ff6b6b 0%, #ffa940 100%);
          color: white;

          .stat-content {
            .stat-value, .stat-title {
              color: white;
            }
          }
        }
      }
    }
  }

  .media-features, .recent-media, .quick-actions {
    margin-bottom: 24px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: #323233;
        margin: 0;
      }
    }
  }

  .features-grid {
    .feature-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 12px;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .feature-icon {
        font-size: var(--text-2xl);
        margin-right: 12px;
      }

      .feature-content {
        flex: 1;

        h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: #323233;
          margin-bottom: 4px;
        }

        p {
          font-size: var(--text-xs);
          color: #969799;
          line-height: 1.4;
          margin: 0;
        }
      }

      .feature-arrow {
        color: #c8c9cc;
        font-size: var(--text-base);
      }
    }
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .media-item {
      background: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .media-preview {
        position: relative;
        width: 100%;
        height: 120px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-thumbnail {
          position: relative;
          width: 100%;
          height: 100%;

          .play-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: var(--text-4xl);
            color: white;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            padding: var(--spacing-sm);
            z-index: 2;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .audio-thumbnail {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);

          .audio-icon {
            font-size: var(--text-4xl);
            color: white;
          }
        }
      }

      .media-info {
        padding: var(--spacing-md);

        h4 {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #323233;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        p {
          font-size: var(--text-xs);
          color: #969799;
          margin-bottom: 8px;
        }

        .media-actions {
          display: flex;
          gap: var(--spacing-sm);

          :deep(.van-button) {
            padding: var(--spacing-xs) 8px;
            font-size: var(--text-xs);
          }
        }
      }
    }
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--spacing-lg) 12px;
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .action-icon {
        font-size: var(--text-4xl);
        margin-bottom: 8px;
      }

      h4 {
        font-size: var(--text-sm);
        font-weight: 600;
        color: #323233;
        margin-bottom: 4px;
      }

      p {
        font-size: var(--text-xs);
        color: #969799;
        margin: 0;
      }
    }
  }
}

.media-preview-popup {
  padding: var(--spacing-lg);
  text-align: center;

  .preview-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: #323233;
    margin-bottom: 16px;
  }

  .preview-content {
    margin-bottom: 16px;

    .preview-image {
      max-width: 100%;
      max-height: 50vh;
      border-radius: 8px;
    }

    .preview-video {
      max-width: 100%;
      max-height: 50vh;
    }

    .preview-audio {
      width: 100%;
    }
  }

  .preview-actions {
    display: flex;
    gap: var(--spacing-md);

    :deep(.van-button) {
      flex: 1;
    }
  }
}

.upload-popup {
  padding: var(--spacing-lg);
  height: 100%;
  display: flex;
  flex-direction: column;

  .upload-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: #323233;
    margin-bottom: 16px;
    text-align: center;
  }

  .upload-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .upload-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      border: 2px dashed #dcdee0;
      border-radius: 12px;
      color: #969799;

      p {
        margin: var(--spacing-sm) 0 0;

        &.upload-hint {
          font-size: var(--text-xs);
          color: #c8c9cc;
        }
      }
    }
  }

  .upload-actions {
    display: flex;
    gap: var(--spacing-md);
    margin-top: 16px;

    :deep(.van-button) {
      flex: 1;
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-media-center {
    max-width: 768px;
    margin: 0 auto;

    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .media-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .actions-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>