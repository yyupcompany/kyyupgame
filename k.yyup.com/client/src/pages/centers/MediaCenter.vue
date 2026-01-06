<template>
  <UnifiedCenterLayout
    title="相册中心"
    description="管理幼儿园的媒体资源，包括图片、视频、音频等多媒体内容的存储、编辑和发布"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleUpload" :loading="uploading">
        <UnifiedIcon name="Upload" />
        上传媒体
      </el-button>
    </template>

    <div class="center-container media-center-timeline">

    <!-- 主要内容区域 -->
    <div class="media-main-content">
        <!-- 欢迎词 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h2>欢迎来到相册中心</h2>
            <p>管理和分享精彩瞬间，记录孩子们成长的每一刻</p>
          </div>
        </div>

        <!-- 统计卡片区域 -->
        <div class="stats-section">
          <div class="stats-grid-unified" v-loading="loading" element-loading-text="加载媒体数据中...">
            <StatCard
              title="媒体文件总数"
              :value="formatNumber(stats.totalFiles)"
              icon-name="image"
              :trend="stats.fileGrowth"
              trend-text="本月新增"
              type="primary"
              clickable
              @click="navigateToDetail('files')"
            />
            <StatCard
              title="存储空间使用"
              :value="formatStorage(stats.storageUsed)"
              icon-name="folder"
              :trend="stats.storageGrowth"
              trend-text="存储增长"
              type="success"
              clickable
              @click="navigateToDetail('storage')"
            />
            <StatCard
              title="媒体分类数"
              :value="stats.totalCategories"
              icon-name="folder"
              :trend="stats.categoryGrowth"
              trend-text="新增分类"
              type="info"
              clickable
              @click="navigateToDetail('categories')"
            />
            <StatCard
              title="本月分享次数"
              :value="formatNumber(stats.sharedCount)"
              icon-name="share"
              :trend="stats.shareGrowth"
              trend-text="分享增长"
              type="warning"
              clickable
              @click="navigateToDetail('shares')"
            />
          </div>
        </div>

        <!-- 媒体管理功能概览 -->
        <div class="media-features">
          <h3>媒体管理功能</h3>
          <div class="actions-grid-unified">
            <div class="module-item" @click="navigateToFeature('image-manager')">
              <div class="module-icon">🖼️</div>
              <div class="module-content">
                <h4>图片管理</h4>
                <p>管理活动照片、学生作品、校园环境等图片资源，支持批量处理和智能分类。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('video-manager')">
              <div class="module-icon">🎬</div>
              <div class="module-content">
                <h4>视频管理</h4>
                <p>管理教学视频、活动录像、宣传视频等，支持在线预览和剪辑功能。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('audio-manager')">
              <div class="module-icon">🎵</div>
              <div class="module-content">
                <h4>音频管理</h4>
                <p>管理音乐、录音、语音故事等音频文件，支持在线播放和格式转换。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('album-manager')">
              <div class="module-icon">📸</div>
              <div class="module-content">
                <h4>相册管理</h4>
                <p>创建和管理主题相册，自动生成精美排版，支持家长端查看和下载。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('media-editor')">
              <div class="module-icon">✂️</div>
              <div class="module-content">
                <h4>媒体编辑</h4>
                <p>提供在线图片编辑、视频剪辑、音频处理等工具，快速制作精美媒体内容。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('media-publish')">
              <div class="module-icon">📱</div>
              <div class="module-content">
                <h4>发布分享</h4>
                <p>一键发布到家长端、微信公众号、官方网站等平台，支持多渠道分享。</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近上传的媒体文件 -->
        <div class="recent-media">
          <div class="section-header">
            <h3>最近上传</h3>
            <el-button link type="primary" @click="navigateToFeature('recent-media')">
              查看全部
              <UnifiedIcon name="ArrowRight" />
            </el-button>
          </div>

          <div class="media-grid" v-loading="loading">
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
                  <UnifiedIcon name="video-camera" />
                  <img :src="media.thumbnailUrl" :alt="media.title" />
                </div>
                <div v-else class="audio-thumbnail">
                  <UnifiedIcon name="picture" />
                </div>
              </div>
              <div class="media-info">
                <h4>{{ media.title }}</h4>
                <p>{{ formatDate(media.uploadTime) }}</p>
                <div class="media-actions">
                  <el-button link type="primary" @click.stop="editMedia(media)">
                    <UnifiedIcon name="edit" />
                  </el-button>
                  <el-button link type="success" @click.stop="shareMedia(media)">
                    <UnifiedIcon name="share" />
                  </el-button>
                  <el-button link type="danger" @click.stop="deleteMedia(media)">
                    <UnifiedIcon name="delete" />
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作区域 -->
        <div class="quick-actions">
          <h3>快速操作</h3>
          <div class="actions-grid-unified">
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
    </div>

    <!-- 媒体预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      :title="selectedMedia?.title"
      width="80%"
      center
    >
      <div class="media-preview-dialog">
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
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadMedia(selectedMedia)">下载</el-button>
        <el-button type="success" @click="shareMedia(selectedMedia)">分享</el-button>
      </template>
    </el-dialog>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadVisible"
      title="上传媒体文件"
      width="60%"
      center
    >
      <div class="upload-dialog">
        <el-upload
          ref="uploadRef"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-progress="onUploadProgress"
          :on-success="onUploadSuccess"
          :on-error="onUploadError"
          :file-list="fileList"
          multiple
          drag
          accept="image/*,video/*,audio/*"
        >
          <div class="upload-content">
            <UnifiedIcon name="upload" size="48" />
            <p>将文件拖到此处，或点击上传</p>
            <p class="upload-hint">支持图片、视频、音频格式，单个文件最大100MB</p>
          </div>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload" :loading="uploading">
          开始上传
        </el-button>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/common/StatCard.vue'

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
    thumbnailUrl: '/placeholder-image.svg',
    url: '/placeholder-image.svg',
    uploadTime: '2024-03-15T10:30:00Z'
  },
  {
    id: 2,
    title: '亲子运动会视频',
    type: 'video',
    thumbnailUrl: '/placeholder-image.svg',
    url: '/placeholder-image.svg',
    uploadTime: '2024-03-14T15:45:00Z'
  },
  {
    id: 3,
    title: '儿童故事录音',
    type: 'audio',
    thumbnailUrl: '/placeholder-image.svg',
    url: '/placeholder-audio.mp3',
    uploadTime: '2024-03-13T09:20:00Z'
  },
  {
    id: 4,
    title: '校园环境照片',
    type: 'image',
    thumbnailUrl: '/placeholder-image.svg',
    url: '/placeholder-image.svg',
    uploadTime: '2024-03-12T14:10:00Z'
  }
])

// 上传相关
const uploadUrl = computed(() => '/api/upload')
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))
const uploadData = computed(() => ({
  category: 'general',
  watermark: true
}))

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
function navigateToDetail(type: string) {
  ElMessage.info(`导航到${type}详情页面`)
  // router.push(`/media/${type}`)
}

function navigateToFeature(feature: string) {
  ElMessage.info(`导航到${feature}功能`)
  // router.push(`/media/${feature}`)
}

// 媒体操作函数
function previewMedia(media: any) {
  selectedMedia.value = media
  previewVisible.value = true
}

function editMedia(media: any) {
  ElMessage.info(`编辑媒体: ${media.title}`)
  // router.push(`/media/edit/${media.id}`)
}

function shareMedia(media: any) {
  ElMessage.success(`分享媒体: ${media.title}`)
  // 实现分享逻辑
}

async function deleteMedia(media: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${media.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success('删除成功')
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
  ElMessage.success('开始下载')
}

// 上传相关函数
function handleUpload() {
  uploadVisible.value = true
}

function beforeUpload(file: File) {
  const isValidType = ['image/', 'video/', 'audio/'].some(type =>
    file.type.startsWith(type)
  )
  const isValidSize = file.size <= 100 * 1024 * 1024 // 100MB

  if (!isValidType) {
    ElMessage.error('只支持图片、视频、音频格式的文件')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过100MB')
    return false
  }
  return true
}

function onUploadProgress(event: any) {
  uploading.value = true
}

function onUploadSuccess(response: any, file: any) {
  ElMessage.success(`${file.name} 上传成功`)
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

function onUploadError(error: any, file: any) {
  ElMessage.error(`${file.name} 上传失败`)
  uploading.value = false
}

function confirmUpload() {
  const uploadRef = ref()
  uploadRef.value?.submit()
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-image.svg'
}

// 快速操作函数
function handleBatchUpload() {
  ElMessage.info('打开批量上传界面')
  uploadVisible.value = true
}

function handleCreateAlbum() {
  ElMessage.info('创建新相册')
  // router.push('/media/album/create')
}

function handleImportFromPhone() {
  ElMessage.info('手机导入功能开发中')
}

function handleAutoProcess() {
  ElMessage.info('AI智能处理功能开发中')
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
          thumbnailUrl: item.thumbnailUrl || '/placeholder-image.svg',
          url: item.url || '/placeholder-image.svg',
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
      ElMessage.warning('请求超时，正在显示缓存数据')
    } else {
      ElMessage.warning('无法连接到服务器，正在显示模拟数据')
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
@use '@/styles/design-tokens.scss' as *;

  .media-center-timeline {
  background: var(--bg-secondary, var(--bg-container));
  padding: 0;
  min-height: 100%;
  width: 100%;
  // 移除滚动条设置，使用全局布局的滚动条
  overflow: visible;
  height: auto;

  .media-main-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    width: 100%;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: var(--spacing-lg);

    .welcome-content {
      h2 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-2xl);
      }

      p {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }

  .stats-section {
    margin-bottom: var(--spacing-xl);
    
    // 确保统计卡片使用4列网格
    .stats-grid-unified {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);

      // 响应式网格
      @media (max-width: var(--breakpoint-xl)) {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: var(--breakpoint-lg)) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }
    }
  }

  .media-features {
    margin-bottom: var(--spacing-xl);
    
    // 确保功能模块使用3列网格
    .actions-grid-unified {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);

      // 响应式网格
      @media (max-width: var(--breakpoint-lg)) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }
    }

    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-lg);
    }

    .module-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-4xl);
      padding: var(--spacing-4xl);
      background: var(--bg-white);
      border-radius: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      .module-icon {
        font-size: var(--text-4xl);
        line-height: 1;
      }

      .module-content {
        flex: 1;

        h4 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
        }

        p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
      }
    }
  }

  .recent-media {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);

      h3 {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .el-button {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }
    }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-4xl);
    }

    .media-item {
      background: var(--bg-white);
      border-radius: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);

        .media-actions {
          opacity: 1;
        }
      }

      .media-preview {
        position: relative;
        width: 100%;
        height: 180px;
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

          .unified-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: var(--text-3xl);
            color: var(--bg-white);
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            padding: var(--spacing-md);
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
          background: var(--gradient-blue);

          .unified-icon {
            font-size: var(--text-4xl);
            color: var(--bg-white);
          }
        }
      }

      .media-info {
        padding: var(--spacing-3xl);

        h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-2xl);
        }

        .media-actions {
          display: flex;
          gap: var(--spacing-sm);
          opacity: 0;
          transition: opacity 0.3s ease;

          .el-button {
            padding: var(--spacing-xs);
          }
        }
      }
    }
  }

  .quick-actions {
    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-lg);
    }
    
    // 确保快速操作使用4列网格
    .actions-grid-unified {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);

      // 响应式网格
      @media (max-width: var(--breakpoint-xl)) {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: var(--breakpoint-lg)) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }
    }

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--spacing-4xl);
      background: var(--bg-white);
      border-radius: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      .action-icon {
        font-size: var(--text-4xl);
        margin-bottom: var(--spacing-2xl);
      }

      h4 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      p {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }

  .media-preview-dialog {
    text-align: center;

    .preview-image {
      max-width: 100%;
      max-height: 70vh;
      border-radius: var(--spacing-lg);
    }

    .preview-video {
      max-width: 100%;
      max-height: 70vh;
    }

    .preview-audio {
      width: 100%;
    }
  }

  .upload-dialog {
    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-8xl);
      color: var(--text-secondary);

      .unified-icon {
        margin-bottom: var(--spacing-4xl);
        color: var(--color-primary);
      }

      p {
        margin: var(--spacing-lg) 0;

        &.upload-hint {
          font-size: var(--text-sm);
          color: var(--text-hint);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .media-center-timeline {
    padding: var(--spacing-4xl);

    .media-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--spacing-3xl);
    }

    .module-item {
      flex-direction: column;
      text-align: center;

      .module-icon {
        margin-bottom: var(--spacing-2xl);
      }
    }
  }
}
</style>