<template>
  <div class="basic-info-container">
    <div class="page-header">
      <h1>基本资料</h1>
      <p>管理幼儿园的基础信息，这些信息将用于海报制作和对外宣传</p>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="basic-info-form"
    >
      <!-- 1. 园区介绍 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>园区介绍</span>
          </div>
        </template>
        
        <el-form-item label="幼儿园名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入幼儿园名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="园区介绍" prop="description">
          <div class="description-input-wrapper">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="6"
              placeholder="请输入园区介绍，详细描述幼儿园的特色和优势"
              maxlength="500"
              show-word-limit
              class="description-textarea"
            />
            <el-tooltip
              content="使用AI智能润色，让您的介绍更专业、更吸引人"
              placement="top"
              :disabled="!formData.description || formData.description.trim().length < 10"
            >
              <el-button
                class="ai-polish-btn"
                type="primary"
                :icon="MagicStick"
                :loading="polishing"
                @click="handlePolishDescription"
                :disabled="!formData.description || formData.description.trim().length < 10"
                circle
              />
            </el-tooltip>
          </div>
          <div class="description-tips">
            <UnifiedIcon name="default" />
            <span>建议输入200-500字，突出幼儿园的教育理念、师资力量和特色课程</span>
          </div>
        </el-form-item>
      </el-card>

      <!-- 2. 幼儿园规模（人数） -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>幼儿园规模</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="学生人数" prop="studentCount">
              <el-input-number
                v-model="formData.studentCount"
                :min="0"
                :max="9999"
                placeholder="学生人数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="教师人数" prop="teacherCount">
              <el-input-number
                v-model="formData.teacherCount"
                :min="0"
                :max="999"
                placeholder="教师人数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="班级数量" prop="classCount">
              <el-input-number
                v-model="formData.classCount"
                :min="0"
                :max="99"
                placeholder="班级数量"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 3. 园区配图 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>园区配图</span>
          </div>
        </template>
        
        <!-- Logo上传 -->
        <el-form-item label="园区Logo">
          <div class="logo-upload">
            <el-upload
              class="logo-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleLogoSuccess"
              :before-upload="beforeLogoUpload"
              accept="image/*"
            >
              <img v-if="formData.logoUrl" :src="formData.logoUrl" class="logo-image" />
              <UnifiedIcon name="Plus" />
            </el-upload>
            <div class="upload-tip">建议尺寸：200x200px，支持JPG、PNG格式</div>
          </div>
        </el-form-item>
        
        <!-- 园区配图上传 -->
        <el-form-item label="园区配图">
          <div class="cover-images-upload">
            <el-upload
              class="cover-uploader"
              :action="uploadImagesUrl"
              :headers="uploadHeaders"
              :file-list="coverImagesList"
              :on-success="handleCoverSuccess"
              :on-remove="handleCoverRemove"
              :before-upload="beforeCoverUpload"
              accept="image/*"
              multiple
              list-type="picture-card"
            >
              <UnifiedIcon name="Plus" />
            </el-upload>
            <div class="upload-tip">最多上传10张图片，建议尺寸：800x600px</div>
          </div>
        </el-form-item>
      </el-card>

      <!-- 4. 联系人 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>联系人</span>
          </div>
        </template>
        
        <el-form-item label="联系人" prop="contactPerson">
          <el-input
            v-model="formData.contactPerson"
            placeholder="请输入联系人姓名"
            maxlength="50"
          />
        </el-form-item>
      </el-card>

      <!-- 5. 咨询电话 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>咨询电话</span>
          </div>
        </template>
        
        <el-form-item label="咨询电话" prop="consultationPhone">
          <el-input
            v-model="formData.consultationPhone"
            placeholder="请输入咨询电话"
            maxlength="20"
          />
        </el-form-item>
      </el-card>

      <!-- 6. 园区地址 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>园区地址</span>
          </div>
        </template>
        
        <el-form-item label="园区地址" prop="address">
          <el-input
            v-model="formData.address"
            placeholder="请输入详细地址"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button type="primary" size="large" @click="handleSave" :loading="saving">
          <UnifiedIcon name="Check" />
          保存基本资料
        </el-button>
        <el-button size="large" @click="handleReset">
          <UnifiedIcon name="Refresh" />
          重置
        </el-button>
      </div>
    </el-form>

    <!-- AI润色抽屉 -->
    <el-drawer
      v-model="polishDialogVisible"
      title="AI智能润色"
      size="500px"
      :close-on-click-modal="false"
      direction="rtl"
    >
      <div class="polish-drawer-content">
        <!-- 原文展示 -->
        <div class="polish-section">
          <div class="polish-label">
            <UnifiedIcon name="default" />
            <span>原文</span>
          </div>
          <div class="polish-text original-text">{{ polishData.originalText }}</div>
        </div>

        <el-divider>
          <UnifiedIcon name="ArrowDown" />
        </el-divider>

        <!-- 润色结果 -->
        <div class="polish-section">
          <div class="polish-label">
            <UnifiedIcon name="default" />
            <span>润色结果</span>
            <el-tag size="small" type="success" effect="plain" style="margin-left: var(--spacing-sm);">
              AI优化
            </el-tag>
          </div>
          <el-input
            v-model="polishData.polishedText"
            type="textarea"
            :rows="8"
            placeholder="AI润色结果"
            maxlength="500"
            show-word-limit
            class="polished-textarea"
          />
          <div class="polish-tip">
            <UnifiedIcon name="default" />
            <span>您可以继续编辑润色结果，满意后点击"应用到表单"</span>
          </div>
        </div>

        <!-- 对比统计 -->
        <div class="polish-stats">
          <div class="stat-item">
            <span class="stat-label">原文字数</span>
            <span class="stat-value">{{ polishData.originalText.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">润色后字数</span>
            <span class="stat-value">{{ polishData.polishedText.length }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="polishDialogVisible = false" size="large">
            <UnifiedIcon name="Close" />
            取消
          </el-button>
          <el-button type="primary" @click="applyPolishedText" size="large">
            <UnifiedIcon name="Check" />
            应用到表单
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  DataAnalysis,
  Picture,
  User,
  Phone,
  Location,
  Plus,
  Check,
  RefreshLeft,
  MagicStick,
  InfoFilled,
  ArrowDown,
  Close
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { request } from '@/utils/request'

const userStore = useUserStore()
const formRef = ref()
const saving = ref(false)
const polishing = ref(false)
const polishDialogVisible = ref(false)
const polishData = reactive({
  originalText: '',
  polishedText: ''
})

// 上传配置
const uploadUrl = ref('/api/kindergarten/upload-image')
const uploadImagesUrl = ref('/api/kindergarten/upload-images')
const uploadHeaders = reactive({
  'Authorization': `Bearer ${userStore.token || ''}`
})

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  studentCount: 0,
  teacherCount: 0,
  classCount: 0,
  logoUrl: '',
  coverImages: [],
  contactPerson: '',
  consultationPhone: '',
  address: ''
})

// 园区配图文件列表
const coverImagesList = ref([])

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入幼儿园名称', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  consultationPhone: [
    { required: true, message: '请输入咨询电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入园区地址', trigger: 'blur' }
  ]
}

// 获取基本资料
const fetchBasicInfo = async () => {
  try {
    const response = await request.get('/kindergarten/basic-info')
    if (response.data.success) {
      const data = response.data.data
      Object.assign(formData, data)
      
      // 处理园区配图
      if (data.coverImages && data.coverImages.length > 0) {
        coverImagesList.value = data.coverImages.map((url, index) => ({
          name: `cover-${index + 1}`,
          url: url
        }))
      }
    }
  } catch (error) {
    console.error('获取基本资料失败:', error)
    ElMessage.error('获取基本资料失败')
  }
}

// Logo上传成功
const handleLogoSuccess = (response) => {
  if (response.success) {
    formData.logoUrl = response.data.url
    ElMessage.success('Logo上传成功')
  } else {
    ElMessage.error('Logo上传失败')
  }
}

// Logo上传前检查
const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 园区配图上传成功
const handleCoverSuccess = (response, file, fileList) => {
  if (response.success) {
    formData.coverImages = fileList.map(item => item.response?.data?.url || item.url)
    ElMessage.success('配图上传成功')
  }
}

// 移除园区配图
const handleCoverRemove = (file, fileList) => {
  formData.coverImages = fileList.map(item => item.response?.data?.url || item.url)
}

// 园区配图上传前检查
const beforeCoverUpload = (file) => {
  return beforeLogoUpload(file)
}

// AI润色园区介绍
const handlePolishDescription = async () => {
  if (!formData.description || formData.description.trim().length < 10) {
    ElMessage.warning('请先输入至少10个字的园区介绍')
    return
  }

  try {
    polishing.value = true
    const response = await request.post('/text-polish/description', {
      text: formData.description
    })

    if (response.data.success) {
      polishData.originalText = response.data.data.originalText
      polishData.polishedText = response.data.data.polishedText
      polishDialogVisible.value = true
    } else {
      ElMessage.error(response.data.message || 'AI润色失败')
    }
  } catch (error) {
    console.error('AI润色失败:', error)
    ElMessage.error('AI润色失败，请稍后重试')
  } finally {
    polishing.value = false
  }
}

// 应用润色后的文本
const applyPolishedText = () => {
  if (polishData.polishedText && polishData.polishedText.trim()) {
    formData.description = polishData.polishedText.trim()
    polishDialogVisible.value = false
    ElMessage.success('已应用润色后的文本')
  } else {
    ElMessage.warning('润色文本不能为空')
  }
}

// 保存基本资料
const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    const response = await request.put('/kindergarten/basic-info', formData)
    
    if (response.data.success) {
      ElMessage.success('基本资料保存成功')
    } else {
      ElMessage.error(response.data.message || '保存失败')
    }
  } catch (error) {
    console.error('保存基本资料失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const handleReset = async () => {
  try {
    await ElMessageBox.confirm('确定要重置表单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (formRef.value && typeof formRef.value.resetFields === 'function') {
      formRef.value.resetFields()
    }
    await fetchBasicInfo()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  fetchBasicInfo()
})
</script>

<style scoped>
.basic-info-container {
  padding: var(--spacing-lg);
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-3xl);
  padding: var(--text-3xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  border-radius: var(--text-lg);
  color: white;
  box-shadow: 0 var(--spacing-sm) var(--text-3xl) rgba(102, 126, 234, 0.3);
}

.page-header h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: white;
  margin: 0 0 var(--spacing-sm) 0;
  text-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.page-header p {
  color: var(--white-alpha-90);
  margin: 0;
  font-size: var(--text-base);
}

.form-section {
  margin-bottom: var(--text-3xl);
  border-radius: var(--text-sm);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  transition: all 0.3s ease;
  border: var(--border-width-base) solid var(--bg-gray-light);
}

.form-section:hover {
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--black-alpha-8);
  transform: translateY(var(--transform-hover-lift));
}

.form-section :deep(.el-card__header) {
  background: linear-gradient(135deg, var(--bg-container) 0%, #e8eef5 100%);
  border-bottom: var(--transform-drop) solid var(--primary-color);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.section-header .el-icon {
  color: var(--primary-color);
  font-size: var(--text-2xl);
}

.logo-upload {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.logo-uploader {
  border: 2px dashed var(--border-base);
  border-radius: var(--text-sm);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  max-max-max-width: 140px; width: 100%; width: 100%; width: 100%;
  min-height: 60px; height: auto;
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-gray-light) 100%);
}

.logo-uploader:hover {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f0ff 100%);
  transform: scale(1.05);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.2);
}

.logo-uploader-icon {
  font-size: var(--spacing-3xl);
  color: #8c939d;
  width: 140px;
  min-height: 60px; height: auto;
  line-min-height: 60px; height: auto;
  text-align: center;
  transition: all 0.3s ease;
}

.logo-uploader:hover .logo-uploader-icon {
  color: var(--primary-color);
  transform: scale(1.1);
}

.logo-image {
  width: 140px;
  min-height: 60px; height: auto;
  display: block;
  object-fit: cover;
  transition: all 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.05);
}

.cover-images-upload {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.upload-tip {
  font-size: var(--text-xs);
  color: var(--info-color);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--text-lg);
  padding: var(--spacing-3xl) var(--text-3xl);
  background: linear-gradient(135deg, var(--bg-container) 0%, #e8eef5 100%);
  border-radius: var(--text-sm);
  margin-top: var(--spacing-3xl);
  box-shadow: 0 -2px var(--spacing-sm) var(--shadow-lighter);
}

.form-actions .el-button {
  min-max-width: 120px; width: 100%;
  height: var(--button-height-lg);
  font-size: var(--text-base);
  font-weight: 500;
  border-radius: var(--spacing-sm);
  transition: all 0.3s ease;
}

.form-actions .el-button--primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, #3a8ee6 100%);
  border: none;
  box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.3);
}

.form-actions .el-button--primary:hover {
  transform: translateY(var(--transform-hover-lift));
  box-shadow: 0 6px var(--text-lg) rgba(64, 158, 255, 0.4);
}

.form-actions .el-button--default:hover {
  transform: translateY(var(--transform-hover-lift));
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
}

/* 园区介绍输入框样式 */
.description-input-wrapper {
  position: relative;
}

.description-textarea {
  padding-right: 50px;
}

.ai-polish-btn {
  position: absolute;
  right: var(--text-sm);
  top: var(--text-sm);
  z-index: var(--z-index-sticky);
  box-shadow: 0 2px var(--spacing-sm) rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.ai-polish-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.5);
}

.ai-polish-btn:active {
  transform: scale(0.95);
}

.description-tips {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) var(--text-sm);
  background: linear-gradient(135deg, var(--bg-container) 0%, #e8eef5 100%);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--text-regular);
}

.description-tips .el-icon {
  color: var(--primary-color);
  font-size: var(--text-base);
}

/* 润色抽屉样式 */
.polish-drawer-content {
  padding: 0 var(--spacing-xs);
  height: calc(100% - 60px);
  overflow-y: auto;
}

.polish-section {
  margin-bottom: var(--text-3xl);
}

.polish-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--text-sm);
}

.polish-label .el-icon {
  color: var(--primary-color);
  font-size: var(--text-xl);
}

.polish-text {
  padding: var(--text-lg);
  background: linear-gradient(135deg, var(--bg-container) 0%, #e8eef5 100%);
  border-radius: var(--spacing-sm);
  line-height: 1.8;
  color: var(--text-regular);
  font-size: var(--text-base);
  box-shadow: inset 0 2px var(--spacing-xs) var(--shadow-lighter);
}

.original-text {
  border-left: var(--spacing-xs) solid var(--text-secondary);
}

.polished-textarea {
  border-radius: var(--spacing-sm);
}

.polished-textarea :deep(.el-textarea__inner) {
  border: 2px solid var(--primary-color);
  background: linear-gradient(135deg, var(--bg-white) 0%, #f0f9ff 100%);
  font-size: var(--text-base);
  line-height: 1.8;
}

.polish-tip {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--text-sm);
  padding: var(--spacing-2xl) var(--text-base);
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--primary-color);
  border: var(--border-width-base) solid #d9ecff;
}

.polish-tip .el-icon {
  font-size: var(--text-lg);
}

.divider-icon {
  color: var(--primary-color);
  font-size: var(--text-2xl);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

.polish-stats {
  display: flex;
  gap: var(--text-lg);
  padding: var(--text-lg);
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f0ff 100%);
  border-radius: var(--spacing-sm);
  margin-top: var(--text-lg);
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: var(--text-sm);
  background: white;
  border-radius: var(--radius-md);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-lighter);
}

.stat-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--info-color);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  display: block;
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--primary-color);
}

.drawer-footer {
  display: flex;
  gap: var(--text-sm);
  padding: var(--text-lg);
  border-top: var(--z-index-dropdown) solid #ebeef5;
  background: var(--bg-tertiary);
}

.drawer-footer .el-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
}
</style>
