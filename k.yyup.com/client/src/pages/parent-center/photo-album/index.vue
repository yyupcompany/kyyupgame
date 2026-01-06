<template>
  <div class="photo-album-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <UnifiedIcon name="picture" :size="32" />
        相册中心
      </h1>
      <p class="page-subtitle">查看宝宝在幼儿园的精彩时刻</p>
    </div>

    <!-- 相册统计信息 -->
    <div class="album-stats">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalPhotos }}</div>
              <div class="stat-label">总照片数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalAlbums }}</div>
              <div class="stat-label">相册数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.favoritePhotos }}</div>
              <div class="stat-label">收藏照片</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 视图切换和操作栏 -->
    <div class="action-bar">
      <div class="view-switcher">
        <el-button-group>
          <el-button 
            :type="viewMode === 'album' ? 'primary' : 'default'"
            @click="viewMode = 'album'"
          >
            <UnifiedIcon name="folder" :size="16" />
            相册视图
          </el-button>
          <el-button 
            :type="viewMode === 'timeline' ? 'primary' : 'default'"
            @click="viewMode = 'timeline'"
          >
            <UnifiedIcon name="clock" :size="16" />
            时间轴
          </el-button>
        </el-button-group>
      </div>

      <div class="action-buttons">
        <el-select
          v-model="selectedAlbumFilter"
          placeholder="选择相册"
          clearable
          style="width: 200px; margin-right: 12px;"
          @change="loadPhotos"
        >
          <el-option label="全部相册" value="" />
          <el-option 
            v-for="album in albums" 
            :key="album.id" 
            :label="album.title" 
            :value="album.id" 
          />
        </el-select>
        <el-button 
          type="primary" 
          @click="showUploadDialog = true"
        >
          <UnifiedIcon name="upload" :size="16" />
          上传照片
        </el-button>
      </div>
    </div>

    <!-- 相册视图 -->
    <div v-if="viewMode === 'album'" class="album-content">
      <div v-loading="loading" element-loading-text="加载中...">
        <div v-if="!loading && albums.length === 0" class="empty-state">
          <el-empty description="暂无相册数据" />
        </div>
        <div v-else class="album-grid">
          <div 
            v-for="album in albums" 
            :key="album.id"
            class="album-card"
            @click="viewAlbumPhotos(album)"
          >
            <div class="album-cover">
              <img 
                :src="album.coverImage || '/default-album.png'"
                :alt="album.title"
                class="cover-image"
                @error="(e: any) => { e.target.src = '/default-album.png' }"
              />
              <div class="album-overlay">
                <el-button text type="primary">
                  查看照片
                </el-button>
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-title">{{ album.title }}</h3>
              <p class="album-description">{{ album.description }}</p>
              <div class="album-meta">
                <span class="photo-count">
                  <UnifiedIcon name="picture" :size="14" />
                  {{ album.photoCount }}张照片
                </span>
                <span class="album-date">{{ formatDate(album.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 时间轴视图 -->
    <div v-else class="timeline-content">
      <div v-loading="loading" element-loading-text="加载中...">
        <div v-if="!loading && timelineData.length === 0" class="empty-state">
          <el-empty description="暂无照片数据" />
        </div>
        <div v-else class="timeline-container">
          <el-timeline>
            <el-timeline-item
              v-for="(group, index) in timelineData"
              :key="index"
              :timestamp="group.date"
              placement="top"
              :color="getTimelineColor(index)"
              size="large"
            >
              <el-card class="timeline-card">
                <template #header>
                  <div class="timeline-header">
                    <span class="timeline-title">{{ group.title }}</span>
                    <span class="timeline-count">{{ group.photos.length }}张照片</span>
                  </div>
                </template>
                <div class="photo-grid">
                  <div 
                    v-for="photo in group.photos" 
                    :key="photo.id"
                    class="photo-item"
                    @click="previewPhoto(photo)"
                  >
                    <img 
                      :src="photo.url || '/default-photo.png'" 
                      :alt="photo.caption"
                      class="photo-image"
                      @error="(e: any) => { e.target.src = '/default-photo.png' }"
                    />
                    <div class="photo-overlay">
                      <UnifiedIcon name="eye" :size="24" color="#fff" />
                    </div>
                    <div v-if="photo.caption" class="photo-caption">
                      {{ photo.caption }}
                    </div>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>

    <!-- 照片预览对话框 -->
    <el-dialog
      v-model="showPhotoPreview"
      title="照片详情"
      width="800px"
      :fullscreen="isFullscreen"
    >
      <div v-if="selectedPhoto" class="photo-preview">
        <img 
          :src="selectedPhoto.url" 
          :alt="selectedPhoto.caption"
          class="preview-image"
        />
        <div class="preview-info">
          <p v-if="selectedPhoto.caption"><strong>描述：</strong>{{ selectedPhoto.caption }}</p>
          <p><strong>拍摄时间：</strong>{{ formatDateTime(selectedPhoto.shootDate || selectedPhoto.uploadTime) }}</p>
          <p><strong>所属相册：</strong>{{ selectedPhoto.albumName || '未分类' }}</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isFullscreen = !isFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏查看' }}
          </el-button>
          <el-button type="primary" @click="showPhotoPreview = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传照片到相册"
      width="600px"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="选择相册" required>
          <el-select 
            v-model="uploadForm.albumId" 
            placeholder="请选择相册"
            style="width: 100%"
          >
            <el-option 
              v-for="album in albums" 
              :key="album.id" 
              :label="album.title" 
              :value="album.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="照片描述">
          <el-input 
            v-model="uploadForm.caption" 
            type="textarea"
            :rows="3"
            placeholder="为照片添加描述..."
          />
        </el-form-item>
        <el-form-item label="拍摄时间">
          <el-date-picker
            v-model="uploadForm.shootDate"
            type="datetime"
            placeholder="选择拍摄时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="选择照片" required>
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :file-list="uploadForm.fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            accept="image/*"
            multiple
            class="upload-area"
          >
            <UnifiedIcon name="upload" :size="48" />
            <div class="el-upload__text">
              将照片拖到此处，或<em>点击选择</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png/gif 格式，单个文件不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleUpload"
            :loading="uploading"
            :disabled="!uploadForm.albumId || uploadForm.fileList.length === 0"
          >
            {{ uploading ? '上传中...' : '开始上传' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, UploadFilled } from '@element-plus/icons-vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
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
const isFullscreen = ref(false)
const selectedPhoto = ref<any>(null)

// 上传表单
const uploadForm = ref({
  albumId: '',
  caption: '',
  shootDate: null,
  fileList: [] as any[]
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
    ElMessage.error(error.message || '加载相册列表失败')
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
    ElMessage.error('加载照片失败: ' + (error.message || '未知错误'))
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

// 计算时间轴数据
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

// 查看相册照片
const viewAlbumPhotos = async (album: any) => {
  selectedAlbumFilter.value = album.id
  viewMode.value = 'timeline'
  await loadPhotos()
}

// 预览照片
const previewPhoto = (photo: any) => {
  selectedPhoto.value = photo
  showPhotoPreview.value = true
}

// 文件变更处理
const handleFileChange = (file: any, fileList: any[]) => {
  uploadForm.value.fileList = fileList
}

// 文件移除处理
const handleFileRemove = (file: any, fileList: any[]) => {
  uploadForm.value.fileList = fileList
}

// 上传照片
const handleUpload = async () => {
  if (!uploadForm.value.albumId) {
    ElMessage.warning('请选择相册')
    return
  }
  if (uploadForm.value.fileList.length === 0) {
    ElMessage.warning('请选择要上传的照片')
    return
  }

  try {
    uploading.value = true
    // TODO: 调用后端API上传照片
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success(`成功上传 ${uploadForm.value.fileList.length} 张照片`)
    showUploadDialog.value = false
    
    // 重置表单
    uploadForm.value = {
      albumId: '',
      caption: '',
      shootDate: null,
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
    ElMessage.error(error.message || '上传照片失败')
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
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
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
.photo-album-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
  background: var(--bg-color);
}

.page-header {
  margin-bottom: var(--spacing-2xl);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-color);
}

.page-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.album-stats {
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.stat-content {
  padding: var(--spacing-lg);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.view-switcher {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* 相册视图 */
.album-content {
  margin-bottom: var(--spacing-2xl);
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.album-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-card);
  transition: all var(--transition-base);
  cursor: pointer;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--primary-color);
  }
}

.album-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--bg-disabled);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .cover-image {
  transform: scale(1.05);
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

.album-card:hover .album-overlay {
  opacity: 1;
}

.album-info {
  padding: var(--spacing-lg);
}

.album-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
}

.album-description {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.album-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color-light);
}

.photo-count {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.album-date {
  font-size: var(--text-xs);
}

/* 时间轴视图 */
.timeline-content {
  margin-bottom: var(--spacing-2xl);
}

.timeline-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.timeline-card {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
}

.timeline-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:hover .photo-overlay {
    opacity: 1;
  }
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.photo-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-sm);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  font-size: var(--text-xs);
  text-align: center;
}

/* 照片预览 */
.photo-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.preview-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.preview-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  p {
    margin: 0;
    line-height: 1.6;
    color: var(--text-color);
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

/* Element Plus 时间轴样式覆盖 */
:deep(.el-timeline) {
  padding-left: 0;
}

:deep(.el-timeline-item__timestamp) {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
}

:deep(.el-timeline-item__wrapper) {
  padding-left: var(--spacing-xl);
}

:deep(.el-timeline-item__node) {
  width: 16px;
  height: 16px;
}

/* 响应式 */
@media (max-width: var(--breakpoint-md)) {
  .photo-album-page {
    padding: var(--spacing-lg);
  }

  .action-bar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;

    .el-select {
      width: 100% !important;
      margin-right: 0 !important;
      margin-bottom: var(--spacing-sm);
    }

    .el-button {
      width: 100%;
    }
  }

  .album-grid {
    grid-template-columns: 1fr;
  }

  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .album-stats .el-col {
    margin-bottom: var(--spacing-md);
  }

  .timeline-container {
    padding: var(--spacing-sm);
  }
}
</style>
