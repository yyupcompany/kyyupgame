<template>
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="confirm-dialog activity-confirm" @click.stop>
      <!-- 头部 -->
      <div class="dialog-header">
        <div class="header-icon">🎯</div>
        <div class="header-content">
          <h3 class="dialog-title">确认创建活动</h3>
          <p class="dialog-subtitle">AI已智能填充活动信息，请确认后添加到数据库</p>
        </div>
        <button class="close-btn" @click="handleClose">
          <i class="el-icon-close"></i>
        </button>
      </div>

      <!-- AI置信度 -->
      <div class="confidence-section" v-if="data?.confidence">
        <div class="confidence-label">AI置信度</div>
        <div class="confidence-bar">
          <div 
            class="confidence-fill" 
            :style="{ width: `${(data.confidence * 100)}%` }"
            :class="getConfidenceClass(data.confidence)"
          ></div>
        </div>
        <div class="confidence-text">{{ Math.round(data.confidence * 100) }}%</div>
      </div>

      <!-- 活动信息预览 -->
      <div class="content-section">
        <h4 class="section-title">📋 活动详情</h4>
        
        <!-- 基本信息 -->
        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">活动标题</label>
            <div class="info-value editable" @click="editField('title')">
              {{ editableData.title }}
              <i class="edit-icon">✏️</i>
            </div>
          </div>
          
          <div class="info-item">
            <label class="info-label">活动类型</label>
            <div class="info-value">
              <span class="activity-type-badge" :class="getTypeClass(editableData.activityType)">
                {{ data?.activity_type_name || '未知类型' }}
              </span>
            </div>
          </div>

          <div class="info-item">
            <label class="info-label">活动时间</label>
            <div class="info-value">
              <div class="time-range">
                <span class="time-start">{{ formatDateTime(editableData.startTime) }}</span>
                <i class="time-separator">→</i>
                <span class="time-end">{{ formatDateTime(editableData.endTime) }}</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <label class="info-label">活动地点</label>
            <div class="info-value editable" @click="editField('location')">
              {{ editableData.location }}
              <i class="edit-icon">✏️</i>
            </div>
          </div>

          <div class="info-item">
            <label class="info-label">容量人数</label>
            <div class="info-value">
              <span class="capacity-badge">{{ editableData.capacity }}人</span>
            </div>
          </div>

          <div class="info-item">
            <label class="info-label">活动费用</label>
            <div class="info-value">
              <span class="fee-badge" :class="editableData.fee > 0 ? 'paid' : 'free'">
                {{ editableData.fee > 0 ? `¥${editableData.fee}` : '免费' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 描述信息 -->
        <div v-if="editableData.description" class="description-section">
          <label class="info-label">活动描述</label>
          <div class="description-content">
            {{ editableData.description }}
          </div>
        </div>

        <!-- 原始输入 -->
        <div class="original-input-section">
          <details class="original-input-details">
            <summary class="original-input-summary">查看原始输入</summary>
            <div class="original-input-content">
              {{ data?.user_input }}
            </div>
          </details>
        </div>
      </div>

      <!-- 图片选择区域 -->
      <div v-if="showImageSection" class="image-section">
        <h4 class="section-title">🎨 活动海报</h4>
        
        <!-- 图片选择状态 -->
        <div v-if="!imageSelected" class="image-options">
          <div class="image-option-card" @click="selectAIGeneration">
            <div class="option-icon">🤖</div>
            <div class="option-content">
              <h5 class="option-title">AI智能生成</h5>
              <p class="option-desc">根据活动信息自动生成专属海报</p>
            </div>
            <div class="option-arrow">→</div>
          </div>
          
          <div class="image-option-card" @click="selectImageUpload">
            <div class="option-icon">📁</div>
            <div class="option-content">
              <h5 class="option-title">上传自定义图片</h5>
              <p class="option-desc">选择已有图片或拍摄照片</p>
            </div>
            <div class="option-arrow">→</div>
          </div>
          
          <div class="skip-option" @click="skipImage">
            暂不添加图片
          </div>
        </div>

        <!-- 已选择图片预览 -->
        <div v-else class="image-preview">
          <div class="selected-image-container">
            <img :src="selectedImageUrl" alt="选择的海报" class="selected-image" />
            <div class="image-overlay">
              <div class="image-actions">
                <button class="image-action-btn" @click="resetImageChoice">
                  <span class="btn-icon">🔄</span>
                  重新选择
                </button>
              </div>
            </div>
          </div>
          
          <!-- 图片信息 -->
          <div class="image-info">
            <div class="info-row">
              <span class="info-key">来源:</span>
              <span class="info-value">{{ imageSource === 'ai' ? 'AI生成' : '自定义上传' }}</span>
            </div>
            <div v-if="imageMetadata" class="info-row">
              <span class="info-key">生成时间:</span>
              <span class="info-value">{{ formatDuration(imageMetadata.duration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="dialog-actions">
        <button class="btn-secondary" @click="handleClose" :disabled="loading">
          取消
        </button>
        <button class="btn-primary" @click="handleConfirm" :disabled="loading">
          <span v-if="loading" class="loading-spinner">⏳</span>
          {{ loading ? '创建中...' : '确认创建' }}
        </button>
      </div>
    </div>

    <!-- 字段编辑弹窗 -->
    <div v-if="editingField" class="edit-overlay" @click="cancelEdit">
      <div class="edit-dialog" @click.stop>
        <h4 class="edit-title">编辑{{ getFieldLabel(editingField) }}</h4>
        <input 
          v-model="editingValue" 
          class="edit-input"
          :placeholder="getFieldPlaceholder(editingField)"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
          ref="editInput"
        />
        <div class="edit-actions">
          <button class="btn-cancel" @click="cancelEdit">取消</button>
          <button class="btn-save" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- 图片生成对话框 -->
    <ImageGenerationDialog
      :visible="showImageGenerationDialog"
      :prompt="imageGenerationPrompt"
      :style="imageGenerationStyle"
      :activity-data="editableData"
      @close="closeImageGenerationDialog"
      @confirm="handleImageGenerated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import ImageGenerationDialog from './ImageGenerationDialog.vue'

interface Props {
  visible: boolean
  data: any
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const editingField = ref<string | null>(null)
const editingValue = ref('')
const editInput = ref<HTMLInputElement | null>(null)

// 图片相关状态
const showImageSection = ref(true) // 是否显示图片选择区域
const imageSelected = ref(false) // 是否已选择图片
const selectedImageUrl = ref('') // 选择的图片URL
const imageSource = ref<'ai' | 'upload' | null>(null) // 图片来源
const imageMetadata = ref<any>(null) // 图片元数据
const showImageGenerationDialog = ref(false) // 是否显示图片生成对话框
const imageGenerationPrompt = ref('') // 图片生成提示词
const imageGenerationStyle = ref('cartoon') // 图片生成风格

// 可编辑数据
const editableData = reactive({
  title: '',
  description: '',
  activityType: 1,
  startTime: '',
  endTime: '',
  location: '',
  capacity: 20,
  fee: 0,
  ...props.data?.extracted_data
})

// 监听props变化
watch(() => props.data, (newData) => {
  if (newData?.extracted_data) {
    Object.assign(editableData, newData.extracted_data)
  }
}, { immediate: true })

// 获取置信度样式类
const getConfidenceClass = (confidence: number) => {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

// 获取活动类型样式类
const getTypeClass = (type: number) => {
  const typeClasses: { [key: number]: string } = {
    1: 'open-day',
    2: 'parent-meeting', 
    3: 'family-activity',
    4: 'recruitment',
    5: 'campus-tour',
    6: 'other'
  }
  return typeClasses[type] || 'other'
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '未设置'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 编辑字段
const editField = async (field: string) => {
  editingField.value = field
  editingValue.value = String(editableData[field as keyof typeof editableData])
  
  await nextTick()
  editInput.value?.focus()
  editInput.value?.select()
}

// 获取字段标签
const getFieldLabel = (field: string) => {
  const labels: { [key: string]: string } = {
    title: '活动标题',
    location: '活动地点',
    description: '活动描述'
  }
  return labels[field] || field
}

// 获取字段占位符
const getFieldPlaceholder = (field: string) => {
  const placeholders: { [key: string]: string } = {
    title: '请输入活动标题',
    location: '请输入活动地点',
    description: '请输入活动描述'
  }
  return placeholders[field] || ''
}

// 保存编辑
const saveEdit = () => {
  if (editingField.value) {
    editableData[editingField.value as keyof typeof editableData] = editingValue.value
  }
  cancelEdit()
}

// 取消编辑
const cancelEdit = () => {
  editingField.value = null
  editingValue.value = ''
}

// 处理遮罩点击
const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

// 关闭对话框
const handleClose = () => {
  if (loading.value) return
  emit('close')
}

// 图片选择方法
const selectAIGeneration = () => {
  // 生成智能提示词
  generateImagePrompt()
  // 显示图片生成对话框
  showImageGenerationDialog.value = true
}

const selectImageUpload = () => {
  // 创建文件输入元素
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.capture = 'environment' // 启用相机拍照
  
  fileInput.onchange = (event: any) => {
    const file = event.target?.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }
  
  fileInput.click()
}

const skipImage = () => {
  showImageSection.value = false
}

const resetImageChoice = () => {
  imageSelected.value = false
  selectedImageUrl.value = ''
  imageSource.value = null
  imageMetadata.value = null
}

const generateImagePrompt = () => {
  const { title, description, location } = editableData
  
  let prompt = `3-6岁幼儿园${title}活动场景`
  
  if (description) {
    prompt += `，${description}`
  }
  
  if (location && location !== '幼儿园') {
    prompt += `，地点在${location}`
  }
  
  prompt += '，孩子们天真可爱的笑容，温馨安全的幼儿园环境，色彩鲜艳温馨，卡通可爱风格，充满童趣'
  
  imageGenerationPrompt.value = prompt
  
  // 根据活动类型选择风格
  const styleMap: { [key: number]: string } = {
    1: 'natural',  // 开放日
    2: 'natural',  // 家长会
    3: 'cartoon',  // 亲子活动
    4: 'natural',  // 招生宣讲
    5: 'natural',  // 园区参观
    6: 'cartoon'   // 其他
  }
  
  imageGenerationStyle.value = styleMap[editableData.activityType] || 'cartoon'
}

const handleImageUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImageUrl.value = e.target?.result as string
    imageSource.value = 'upload'
    imageSelected.value = true
    imageMetadata.value = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }
  }
  reader.readAsDataURL(file)
}

const closeImageGenerationDialog = () => {
  showImageGenerationDialog.value = false
}

const handleImageGenerated = (result: { imageUrl: string; metadata: any }) => {
  selectedImageUrl.value = result.imageUrl
  imageSource.value = 'ai'
  imageSelected.value = true
  imageMetadata.value = result.metadata
  showImageGenerationDialog.value = false
}

const formatDuration = (duration: number) => {
  return `${(duration / 1000).toFixed(1)}秒`
}

// 确认创建
const handleConfirm = async () => {
  loading.value = true
  
  try {
    // 构建最终数据
    const finalData = {
      ...props.data,
      extracted_data: { ...editableData },
      user_confirmed: true,
      confirmed_at: new Date().toISOString(),
      // 添加图片信息
      image_data: imageSelected.value ? {
        image_url: selectedImageUrl.value,
        image_source: imageSource.value,
        image_metadata: imageMetadata.value
      } : null
    }
    
    emit('confirm', finalData)
  } catch (error) {
    console.error('确认创建活动失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(var(--spacing-sm));
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-dialog {
  background: white;
  border-radius: var(--spacing-md);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  padding: 2var(--spacing-xs) 2var(--spacing-xs) var(--spacing-md);
  border-bottom: var(--border-width-base) solid #f0f0f0;
}

.header-icon {
  font-size: var(--spacing-xl);
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 var(--spacing-xs) 0;
}

.dialog-subtitle {
  font-size: 1var(--spacing-xs);
  color: #666;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--spacing-xs);
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.confidence-section {
  padding: var(--spacing-md) 2var(--spacing-xs);
  background: #f8f9fa;
  border-bottom: var(--border-width-base) solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.confidence-label {
  font-size: 1var(--spacing-xs);
  color: #666;
  white-space: nowrap;
}

.confidence-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.confidence-fill.high {
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
}

.confidence-fill.medium {
  background: linear-gradient(90deg, #FF9800, #FFB74D);
}

.confidence-fill.low {
  background: linear-gradient(90deg, #F44336, #EF5350);
}

.confidence-text {
  font-size: 1var(--spacing-xs);
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.content-section {
  padding: 2var(--spacing-xs);
}

.section-title {
  font-size: var(--spacing-md);
  font-weight: 600;
  color: #333;
  margin: 0 0 var(--spacing-md) 0;
}

.info-grid {
  display: grid;
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  color: #333;
  position: relative;
}

.info-value.editable {
  cursor: pointer;
  padding: var(--spacing-sm) 12px;
  background: #f8f9fa;
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid transparent;
  transition: all 0.2s;
}

.info-value.editable:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.edit-icon {
  opacity: 0;
  margin-left: var(--spacing-sm);
  transition: opacity 0.2s;
}

.info-value.editable:hover .edit-icon {
  opacity: 1;
}

.activity-type-badge {
  display: inline-block;
  padding: var(--spacing-xs) 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: white;
}

.activity-type-badge.open-day {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
}

.activity-type-badge.parent-meeting {
  background: linear-gradient(135deg, #2196F3, #42A5F5);
}

.activity-type-badge.family-activity {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
}

.activity-type-badge.recruitment {
  background: linear-gradient(135deg, #9C27B0, #BA68C8);
}

.activity-type-badge.campus-tour {
  background: linear-gradient(135deg, #00BCD4, #4DD0E1);
}

.activity-type-badge.other {
  background: linear-gradient(135deg, #607D8B, #78909C);
}

.time-range {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: monospace;
}

.time-separator {
  color: #666;
  font-style: normal;
}

.capacity-badge {
  display: inline-block;
  padding: var(--spacing-xs) 10px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: var(--spacing-md);
  font-size: 13px;
  font-weight: 500;
}

.fee-badge {
  display: inline-block;
  padding: var(--spacing-xs) 10px;
  border-radius: var(--spacing-md);
  font-size: 13px;
  font-weight: 500;
}

.fee-badge.free {
  background: #e8f5e8;
  color: #2e7d32;
}

.fee-badge.paid {
  background: #fff3e0;
  color: #f57c00;
}

.description-section {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: var(--border-width-base) solid #f0f0f0;
}

.description-content {
  padding: 12px;
  background: #f8f9fa;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  line-height: 1.5;
  color: #333;
  margin-top: 6px;
}

.original-input-section {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: var(--border-width-base) solid #f0f0f0;
}

.original-input-details {
  border: var(--border-width-base) solid #e0e0e0;
  border-radius: var(--spacing-sm);
  overflow: hidden;
}

.original-input-summary {
  padding: 10px 1var(--spacing-xs);
  background: #f5f5f5;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  user-select: none;
}

.original-input-summary:hover {
  background: #eeeeee;
}

.original-input-content {
  padding: 1var(--spacing-xs);
  font-size: 1var(--spacing-xs);
  line-height: 1.5;
  color: #333;
  border-top: var(--border-width-base) solid #e0e0e0;
  background: white;
}

.dialog-actions {
  padding: var(--spacing-md) 2var(--spacing-xs) 2var(--spacing-xs);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: var(--border-width-base) solid #f0f0f0;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
  color: #333;
}

.btn-primary {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-var(--border-width-base));
  box-shadow: 0 var(--spacing-xs) 12px rgba(33, 150, 243, 0.3);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 编辑弹窗 */
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.edit-dialog {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 30px var(--shadow-medium);
}

.edit-title {
  font-size: var(--spacing-md);
  font-weight: 600;
  color: #333;
  margin: 0 0 var(--spacing-md) 0;
}

.edit-input {
  width: 100%;
  padding: 12px var(--spacing-md);
  border: 2px solid #e0e0e0;
  border-radius: var(--spacing-sm);
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.edit-input:focus {
  outline: none;
  border-color: #2196f3;
}

.edit-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-md);
}

.btn-cancel,
.btn-save {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 6px;
  font-size: 1var(--spacing-xs);
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  background: #2196f3;
  color: white;
}

.btn-save:hover {
  background: #1976d2;
}

/* 图片选择区域样式 */
.image-section {
  padding: var(--spacing-md) 2var(--spacing-xs);
  border-top: var(--border-width-base) solid #f0f0f0;
}

.image-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.image-option-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-option-card:hover {
  background: #f0f9ff;
  border-color: #1890ff;
  transform: translateY(-var(--border-width-base));
}

.option-icon {
  font-size: var(--spacing-xl);
  margin-right: var(--spacing-md);
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: var(--spacing-md);
  font-weight: 600;
  color: #333;
  margin: 0 0 var(--spacing-xs) 0;
}

.option-desc {
  font-size: 1var(--spacing-xs);
  color: #666;
  margin: 0;
}

.option-arrow {
  font-size: 1var(--spacing-sm);
  color: #999;
  transition: color 0.2s ease;
}

.image-option-card:hover .option-arrow {
  color: #1890ff;
}

.skip-option {
  text-align: center;
  padding: 12px;
  color: #666;
  font-size: 1var(--spacing-xs);
  cursor: pointer;
  border-radius: var(--spacing-sm);
  transition: all 0.2s ease;
}

.skip-option:hover {
  background: #f5f5f5;
  color: #333;
}

.image-preview {
  margin-top: 12px;
}

.selected-image-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.selected-image {
  width: 100%;
  height: auto;
  display: block;
  max-height: 200px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.selected-image-container:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.image-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-action-btn:hover {
  background: white;
  transform: translateY(-var(--border-width-base));
}

.btn-icon {
  font-size: 1var(--spacing-xs);
}

.image-info {
  background: #f9f9f9;
  border-radius: var(--spacing-sm);
  padding: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-key {
  font-size: 12px;
  color: #666;
}

.info-value {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}
</style>