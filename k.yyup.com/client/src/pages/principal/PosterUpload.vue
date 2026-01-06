<template>
  <div class="poster-upload-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/centers/activity-center' }">活动中心</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/principal/poster-mode-selection' }">海报制作方式</el-breadcrumb-item>
        <el-breadcrumb-item>手动上传海报</el-breadcrumb-item>
      </el-breadcrumb>
      <h1>手动上传海报</h1>
      <p>上传您已有的海报图片，可进行基础编辑和调整</p>
    </div>

    <!-- 上传区域 -->
    <el-card class="upload-card" shadow="never">
      <template #header>
        <div class="card-header">
          <UnifiedIcon name="Upload" />
          <span>选择海报文件</span>
        </div>
      </template>

      <div class="upload-area">
        <el-upload
          ref="uploadRef"
          class="poster-uploader"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :on-progress="handleUploadProgress"
          accept="image/*"
          drag
          :auto-upload="false"
        >
          <div class="upload-content">
            <UnifiedIcon name="Upload" />
            <div class="upload-text">
              <p>点击上传或拖拽文件到此处</p>
              <p class="upload-tip">支持 JPG、PNG、GIF 格式，文件大小不超过 10MB</p>
            </div>
          </div>
        </el-upload>

        <!-- 上传进度 -->
        <div v-if="uploading" class="upload-progress">
          <el-progress
            :percentage="uploadProgress"
            :stroke-width="8"
            :show-text="true"
            status="active"
          />
          <p>正在上传中... {{ uploadProgress }}%</p>
        </div>
      </div>
    </el-card>

    <!-- 图片预览和编辑区域 -->
    <el-card v-if="posterImage" class="editor-card" shadow="never">
      <template #header>
        <div class="card-header">
          <UnifiedIcon name="default" />
          <span>海报编辑</span>
          <div class="header-actions">
            <el-button size="small" @click="resetImage">
              <UnifiedIcon name="Refresh" />
              重新上传
            </el-button>
          </div>
        </div>
      </template>

      <div class="editor-content">
        <!-- 左侧预览区 -->
        <div class="preview-area">
          <div class="preview-container">
            <img
              ref="previewImage"
              :src="posterImage"
              :style="imageStyle"
              class="poster-preview"
              @load="onImageLoad"
            />
          </div>
        </div>

        <!-- 右侧编辑工具 -->
        <div class="tools-area">
          <el-tabs v-model="activeTab" type="card">
            <!-- 基础调整 -->
            <el-tab-pane label="基础调整" name="basic">
              <div class="tool-section">
                <h4>尺寸调整</h4>
                <div class="tool-item">
                  <label>宽度 (px)</label>
                  <el-input-number
                    v-model="imageSettings.width"
                    :min="100"
                    :max="2000"
                    @change="updateImageStyle"
                  />
                </div>
                <div class="tool-item">
                  <label>高度 (px)</label>
                  <el-input-number
                    v-model="imageSettings.height"
                    :min="100"
                    :max="2000"
                    @change="updateImageStyle"
                  />
                </div>
                <div class="tool-item">
                  <el-button @click="resetSize">重置尺寸</el-button>
                </div>
              </div>

              <div class="tool-section">
                <h4>旋转</h4>
                <div class="tool-item">
                  <el-slider
                    v-model="imageSettings.rotation"
                    :min="-180"
                    :max="180"
                    :step="1"
                    show-input
                    @change="updateImageStyle"
                  />
                </div>
                <div class="tool-item">
                  <el-button @click="rotate90">旋转90°</el-button>
                  <el-button @click="rotate180">旋转180°</el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- 滤镜效果 -->
            <el-tab-pane label="滤镜效果" name="filter">
              <div class="tool-section">
                <h4>亮度</h4>
                <div class="tool-item">
                  <el-slider
                    v-model="imageSettings.brightness"
                    :min="0"
                    :max="200"
                    :step="1"
                    @change="updateImageStyle"
                  />
                </div>
              </div>

              <div class="tool-section">
                <h4>对比度</h4>
                <div class="tool-item">
                  <el-slider
                    v-model="imageSettings.contrast"
                    :min="0"
                    :max="200"
                    :step="1"
                    @change="updateImageStyle"
                  />
                </div>
              </div>

              <div class="tool-section">
                <h4>饱和度</h4>
                <div class="tool-item">
                  <el-slider
                    v-model="imageSettings.saturate"
                    :min="0"
                    :max="200"
                    :step="1"
                    @change="updateImageStyle"
                  />
                </div>
              </div>

              <div class="tool-section">
                <h4>预设滤镜</h4>
                <div class="filter-presets">
                  <el-button
                    v-for="preset in filterPresets"
                    :key="preset.name"
                    size="small"
                    @click="applyFilterPreset(preset)"
                  >
                    {{ preset.name }}
                  </el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- 裁剪 -->
            <el-tab-pane label="裁剪" name="crop">
              <div class="tool-section">
                <h4>裁剪比例</h4>
                <div class="crop-presets">
                  <el-button
                    v-for="ratio in cropRatios"
                    :key="ratio.name"
                    size="small"
                    @click="applyCropRatio(ratio)"
                  >
                    {{ ratio.name }}
                  </el-button>
                </div>
              </div>
              <div class="tool-section">
                <el-button @click="showCropDialog = true">开始裁剪</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>

          <!-- 重置按钮 -->
          <div class="tool-actions">
            <el-button @click="resetAllSettings">
              <UnifiedIcon name="Refresh" />
              重置所有
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 底部操作按钮 -->
    <div class="page-footer">
      <el-button size="large" @click="goBack">
        <UnifiedIcon name="ArrowLeft" />
        返回
      </el-button>

      <div class="footer-actions">
        <el-button size="large" @click="saveAsDraft">
          <UnifiedIcon name="default" />
          保存草稿
        </el-button>

        <el-button type="primary" size="large" @click="savePoster" :loading="saving">
          <UnifiedIcon name="Check" />
          保存海报
        </el-button>
      </div>
    </div>

    <!-- 裁剪对话框 -->
    <el-dialog
      v-model="showCropDialog"
      title="裁剪图片"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="crop-dialog-content">
        <div class="crop-container">
          <img ref="cropImage" :src="posterImage" />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCropDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmCrop">确认裁剪</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- AI帮助按钮 -->
    <PageHelpButton :help-content="posterUploadHelp" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHelpButton from '@/components/common/PageHelpButton.vue'
import {
  UploadFilled,
  Picture,
  RefreshLeft,
  ArrowLeft,
  Document,
  Check
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { request } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

// AI帮助内容
const posterUploadHelp = {
  title: '海报上传使用指南',
  description: '上传已有的海报图片，支持基础编辑、裁剪、滤镜等功能。上传后可直接用于活动宣传。',
  features: [
    '支持拖拽上传或点击选择',
    '支持JPG、PNG、GIF格式',
    '图片裁剪和旋转',
    '亮度、对比度、饱和度调整',
    '多种滤镜效果',
    '实时预览'
  ],
  steps: [
    '拖拽或点击上传海报图片',
    '等待上传完成',
    '使用编辑工具调整图片（可选）',
    '预览效果',
    '点击"保存海报"完成'
  ],
  tips: [
    '建议上传高清图片，效果更好',
    '文件大小不超过10MB',
    '可以使用裁剪功能调整海报尺寸',
    '滤镜效果可以提升海报质感'
  ]
}

// 基础状态
const uploadRef = ref()
const previewImage = ref()
const cropImage = ref()
const uploading = ref(false)
const uploadProgress = ref(0)
const posterImage = ref('')
const saving = ref(false)
const activeTab = ref('basic')
const showCropDialog = ref(false)

// 上传配置
const uploadUrl = ref('/api/poster/upload')
const uploadHeaders = reactive({
  'Authorization': `Bearer ${userStore.token || ''}`
})

// 图片设置
const imageSettings = reactive({
  width: 800,
  height: 600,
  rotation: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100
})

const originalSettings = reactive({ ...imageSettings })

// 计算图片样式
const imageStyle = computed(() => {
  return {
    width: `${imageSettings.width}px`,
    height: `${imageSettings.height}px`,
    transform: `rotate(${imageSettings.rotation}deg)`,
    filter: `brightness(${imageSettings.brightness}%) contrast(${imageSettings.contrast}%) saturate(${imageSettings.saturate}%)`
  }
})

// 滤镜预设
const filterPresets = [
  { name: '原图', brightness: 100, contrast: 100, saturate: 100 },
  { name: '明亮', brightness: 120, contrast: 110, saturate: 110 },
  { name: '柔和', brightness: 110, contrast: 90, saturate: 90 },
  { name: '鲜艳', brightness: 105, contrast: 120, saturate: 130 },
  { name: '复古', brightness: 90, contrast: 85, saturate: 70 },
  { name: '黑白', brightness: 100, contrast: 120, saturate: 0 }
]

// 裁剪比例预设
const cropRatios = [
  { name: '自由', ratio: null },
  { name: '1:1', ratio: 1 },
  { name: '4:3', ratio: 4/3 },
  { name: '16:9', ratio: 16/9 },
  { name: '3:2', ratio: 3/2 }
]

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

// 上传进度
const handleUploadProgress = (event) => {
  uploadProgress.value = Math.round(event.percent)
}

// 上传成功
const handleUploadSuccess = (response) => {
  uploading.value = false
  uploadProgress.value = 0

  if (response.success) {
    posterImage.value = response.data.url
    ElMessage.success('上传成功')

    // 自动上传完成后触发文件选择
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传失败
const handleUploadError = (error) => {
  uploading.value = false
  uploadProgress.value = 0
  ElMessage.error('上传失败，请重试')
  console.error('Upload error:', error)
}

// 手动触发上传
const triggerUpload = () => {
  if (uploadRef.value) {
    const files = uploadRef.value.uploadFiles
    if (files.length > 0) {
      uploading.value = true
      uploadRef.value.submit()
    } else {
      ElMessage.warning('请先选择文件')
    }
  }
}

// 图片加载完成
const onImageLoad = (event) => {
  const img = event.target
  if (!imageSettings.width || !imageSettings.height) {
    imageSettings.width = img.naturalWidth
    imageSettings.height = img.naturalHeight
  }
}

// 更新图片样式
const updateImageStyle = () => {
  // 触发响应式更新
  nextTick()
}

// 重置尺寸
const resetSize = () => {
  if (previewImage.value) {
    imageSettings.width = previewImage.value.naturalWidth
    imageSettings.height = previewImage.value.naturalHeight
  }
}

// 旋转图片
const rotate90 = () => {
  imageSettings.rotation = (imageSettings.rotation + 90) % 360
}

const rotate180 = () => {
  imageSettings.rotation = (imageSettings.rotation + 180) % 360
}

// 应用滤镜预设
const applyFilterPreset = (preset) => {
  imageSettings.brightness = preset.brightness
  imageSettings.contrast = preset.contrast
  imageSettings.saturate = preset.saturate
}

// 应用裁剪比例
const applyCropRatio = (ratio) => {
  if (ratio.ratio && previewImage.value) {
    const img = previewImage.value
    const imgRatio = img.naturalWidth / img.naturalHeight

    if (imgRatio > ratio.ratio) {
      // 图片较宽，以高度为准
      imageSettings.height = 600
      imageSettings.width = Math.round(600 * ratio.ratio)
    } else {
      // 图片较高，以宽度为准
      imageSettings.width = 800
      imageSettings.height = Math.round(800 / ratio.ratio)
    }
  }
}

// 重置所有设置
const resetAllSettings = () => {
  Object.assign(imageSettings, originalSettings)
  ElMessage.success('已重置所有设置')
}

// 重新上传
const resetImage = () => {
  posterImage.value = ''
  resetAllSettings()
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 保存草稿
const saveAsDraft = async () => {
  if (!posterImage.value) {
    ElMessage.warning('请先上传海报')
    return
  }

  try {
    const draftData = {
      imageUrl: posterImage.value,
      settings: { ...imageSettings },
      type: 'upload',
      status: 'draft'
    }

    const response = await request.post('/api/poster/save-draft', draftData)

    if (response.data.success) {
      ElMessage.success('草稿保存成功')
    } else {
      ElMessage.error(response.data.message || '保存失败')
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 保存海报
const savePoster = async () => {
  if (!posterImage.value) {
    ElMessage.warning('请先上传海报')
    return
  }

  try {
    await ElMessageBox.confirm('确定要保存这个海报吗？', '确认保存', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    saving.value = true

    const posterData = {
      imageUrl: posterImage.value,
      settings: { ...imageSettings },
      type: 'upload',
      status: 'completed',
      metadata: {
        originalSize: {
          width: previewImage.value?.naturalWidth || 0,
          height: previewImage.value?.naturalHeight || 0
        },
        editedSize: {
          width: imageSettings.width,
          height: imageSettings.height
        }
      }
    }

    const response = await request.post('/api/poster/save', posterData)

    if (response.data.success) {
      ElMessage.success('海报保存成功')
      router.push('/centers/activity-center')
    } else {
      ElMessage.error(response.data.message || '保存失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存海报失败:', error)
      ElMessage.error('保存失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  // 监听拖拽上传
  const uploadElement = uploadRef.value?.$el
  if (uploadElement) {
    uploadElement.addEventListener('drop', (e) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (beforeUpload(file)) {
          uploadRef.value.uploadFiles.push(file)
          triggerUpload()
        }
      }
    })
  }
})
</script>

<style scoped>
.poster-upload-container {
  min-height: 100vh;
  background: var(--bg-hover);
  padding: var(--text-2xl);
}

.page-header {
  margin-bottom: var(--text-3xl);
}

.page-header h1 {
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin: var(--text-lg) 0 var(--spacing-sm) 0;
}

.page-header p {
  color: var(--text-regular);
  margin: 0;
}

.upload-card, .editor-card {
  margin-bottom: var(--text-3xl);
  border-radius: var(--text-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  font-size: var(--text-lg);
}

.header-actions {
  margin-left: auto;
}

.upload-area {
  padding: var(--text-2xl);
}

.poster-uploader {
  width: 100%;
}

.poster-uploader :deep(.el-upload-dragger) {
  width: 100%;
  min-height: 60px; height: auto;
  border: 2px dashed var(--border-base);
  border-radius: var(--text-sm);
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-gray-light) 100%);
  transition: all 0.3s ease;
}

.poster-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f0ff 100%);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--text-lg);
}

.upload-text p {
  margin: 0;
  color: var(--text-regular);
}

.upload-tip {
  font-size: var(--text-sm);
  color: var(--info-color);
}

.upload-progress {
  margin-top: var(--text-2xl);
  text-align: center;
}

.upload-progress p {
  margin-top: var(--spacing-sm);
  color: var(--text-regular);
}

.editor-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: var(--text-3xl);
}

.preview-area {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-min-height: 60px; height: auto;
}

.preview-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  border-radius: var(--spacing-xs);
  transition: all 0.3s ease;
}

.tools-area {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  border: var(--border-width-base) solid var(--border-color-lighter);
}

.tool-section {
  margin-bottom: var(--text-3xl);
}

.tool-section h4 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--text-sm);
  font-weight: 600;
}

.tool-item {
  margin-bottom: var(--text-sm);
}

.tool-item label {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-regular);
  margin-bottom: var(--spacing-xs);
}

.filter-presets, .crop-presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tool-actions {
  padding-top: var(--text-lg);
  border-top: var(--z-index-dropdown) solid #ebeef5;
}

.page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-2xl);
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
}

.footer-actions {
  display: flex;
  gap: var(--text-sm);
}

.crop-dialog-content {
  text-align: center;
}

.crop-container {
  max-height: 60vh;
  overflow: auto;
}

.crop-container img {
  max-width: 100%;
  height: auto;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-xl)) {
  .editor-content {
    grid-template-columns: 1fr;
    gap: var(--text-2xl);
  }

  .tools-area {
    order: -1;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .poster-upload-container {
    padding: var(--text-lg);
  }

  .page-footer {
    flex-direction: column;
    gap: var(--text-lg);
  }

  .footer-actions {
    width: 100%;
    justify-content: center;
  }

  .footer-actions .el-button {
    flex: 1;
  }
}
</style>