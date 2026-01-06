<template>
  <CenterContainer
    title="编辑活动"
    :show-header="true"
    :show-actions="true"
  >
    <template #header-actions>
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </template>

    <template #content>

    <div class="app-card" v-loading="loading" element-loading-text="加载中...">
      <div class="app-card-content">
        <el-form
          ref="formRef"
          :model="activityForm"
          :rules="formRules"
          label-width="120px"
          class="activity-form"
        >
          <!-- 基本信息区域 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><InfoFilled /></el-icon>
              基本信息
            </div>
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="活动标题" prop="title">
                  <el-input
                    v-model="activityForm.title"
                    placeholder="请输入活动标题"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="活动类型" prop="activityType">
                  <el-select v-model="activityForm.activityType" placeholder="请选择活动类型" style="width: 100%">
                    <el-option
                      v-for="type in activityTypeOptions"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="活动地点" prop="location">
                  <el-input v-model="activityForm.location" placeholder="请输入活动地点" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="活动容量" prop="capacity">
                  <el-input-number
                    v-model="activityForm.capacity"
                    :min="1"
                    :max="1000"
                    placeholder="活动容量"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="活动费用" prop="fee">
                  <el-input-number
                    v-model="activityForm.fee"
                    :min="0"
                    :precision="2"
                    placeholder="活动费用"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="活动状态" prop="status">
                  <el-select v-model="activityForm.status" placeholder="请选择活动状态" style="width: 100%">
                    <el-option
                      v-for="status in activityStatusOptions"
                      :key="status.value"
                      :label="status.label"
                      :value="status.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 时间设置区域 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Clock /></el-icon>
              时间设置
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="开始时间" prop="startTime">
                  <el-date-picker
                    v-model="activityForm.startTime"
                    type="datetime"
                    placeholder="选择开始时间"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结束时间" prop="endTime">
                  <el-date-picker
                    v-model="activityForm.endTime"
                    type="datetime"
                    placeholder="选择结束时间"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="报名开始时间" prop="registrationStartTime">
                  <el-date-picker
                    v-model="activityForm.registrationStartTime"
                    type="datetime"
                    placeholder="选择报名开始时间"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="报名结束时间" prop="registrationEndTime">
                  <el-date-picker
                    v-model="activityForm.registrationEndTime"
                    type="datetime"
                    placeholder="选择报名结束时间"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 详细信息区域 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Document /></el-icon>
              详细信息
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="活动描述" prop="description">
                  <el-input
                    v-model="activityForm.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入活动描述"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="活动议程" prop="agenda">
                  <el-input
                    v-model="activityForm.agenda"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入活动议程"
                    maxlength="1000"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input
                    v-model="activityForm.remark"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入备注信息"
                    maxlength="200"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 媒体内容区域 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Picture /></el-icon>
              媒体内容
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="封面图片">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :http-request="uploadImage"
                    :show-file-list="false"
                    :before-upload="beforeImageUpload"
                  >
                    <img v-if="activityForm.coverImage" :src="activityForm.coverImage" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div class="upload-tip">建议上传尺寸 750x400 像素的图片，支持 JPG/PNG/GIF 格式，最大 2MB</div>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <!-- 海报编辑部分 -->
                <el-form-item label="活动海报">
                  <div class="poster-section">
                    <div class="poster-preview">
                      <div v-if="posterPreviewUrl" class="poster-image-container">
                        <img :src="posterPreviewUrl" alt="活动海报" class="poster-image" />
                        <div class="poster-overlay">
                          <el-button-group>
                            <el-button size="small" @click="editPoster" type="primary">
                              <el-icon><Edit /></el-icon>
                              编辑海报
                            </el-button>
                            <el-button size="small" @click="editPosterInDialog">
                              <el-icon><Edit /></el-icon>
                              快速编辑
                            </el-button>
                            <el-button size="small" @click="downloadPoster">
                              <el-icon><Download /></el-icon>
                              下载
                            </el-button>
                          </el-button-group>
                        </div>
                      </div>
                      <div v-else class="poster-placeholder">
                        <el-icon><Picture /></el-icon>
                        <p>暂无海报</p>
                      </div>
                    </div>
                    <div class="poster-actions">
                      <el-button @click="generatePoster" :loading="generatingPoster" type="primary">
                        <el-icon><Refresh /></el-icon>
                        {{ posterPreviewUrl ? '重新生成海报' : '生成海报' }}
                      </el-button>
                      <el-button @click="editPoster" :disabled="!posterPreviewUrl">
                        <el-icon><Edit /></el-icon>
                        编辑海报
                      </el-button>
                      <el-button @click="editPosterInDialog" :disabled="!posterPreviewUrl">
                        <el-icon><Edit /></el-icon>
                        快速编辑
                      </el-button>
                      <el-button @click="downloadPoster" :disabled="!posterPreviewUrl">
                        <el-icon><Download /></el-icon>
                        下载海报
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 操作按钮区域 -->
          <div class="form-actions">
            <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
              <el-icon><Check /></el-icon>
              保存修改
            </el-button>
            <el-button @click="handleReset" size="large">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
            <el-button @click="goBack" size="large">
              <el-icon><Close /></el-icon>
              取消
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
    </template>

    <!-- 海报编辑弹窗 -->
    <el-dialog
      v-model="posterEditDialog.visible"
      title="海报编辑器"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="poster-edit-dialog"
    >
      <div class="poster-editor-container">
        <iframe
          v-if="posterEditDialog.editorUrl"
          :src="posterEditDialog.editorUrl"
          class="poster-editor-iframe"
          frameborder="0"
        ></iframe>
        <div v-else class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>正在加载海报编辑器...</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closePosterEditDialog">关闭</el-button>
          <el-button type="primary" @click="savePosterEdit">保存并应用</el-button>
        </div>
      </template>
    </el-dialog>
  </CenterContainer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, Plus, Edit, Refresh, Download, Picture, Loading, InfoFilled, Clock, Document, Check, RefreshLeft, Close } from '@element-plus/icons-vue'
import { getActivityDetail, updateActivity } from '@/api/modules/activity'
import { autoImageApi } from '@/api/auto-image'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import { ErrorHandler } from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()

// 表单引用
const formRef = ref<FormInstance>()
const submitting = ref(false)
const loading = ref(false)

// 海报相关
const posterPreviewUrl = ref('')
const generatingPoster = ref(false)
const posterEditDialog = reactive({
  visible: false,
  editorUrl: ''
})

// 活动类型选项
const activityTypeOptions = [
  { label: '开放日', value: 1 },
  { label: '家长会', value: 2 },
  { label: '亲子活动', value: 3 },
  { label: '招生宣讲', value: 4 },
  { label: '园区参观', value: 5 },
  { label: '其他', value: 6 }
]

// 活动状态选项
const activityStatusOptions = [
  { label: '计划中', value: 0 },
  { label: '报名中', value: 1 },
  { label: '已满员', value: 2 },
  { label: '进行中', value: 3 },
  { label: '已结束', value: 4 },
  { label: '已取消', value: 5 }
]

// 表单数据
const activityForm = reactive({
  title: '',
  activityType: undefined,
  startTime: '',
  endTime: '',
  location: '',
  capacity: 50,
  registrationStartTime: '',
  registrationEndTime: '',
  fee: 0,
  status: 0,
  description: '',
  agenda: '',
  coverImage: '',
  remark: ''
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { min: 2, max: 100, message: '活动标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  activityType: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入活动容量', trigger: 'blur' }
  ],
  registrationStartTime: [
    { required: true, message: '请选择报名开始时间', trigger: 'change' }
  ],
  registrationEndTime: [
    { required: true, message: '请选择报名结束时间', trigger: 'change' }
  ]
}

// 获取活动详情
const loadActivityDetail = async () => {
  try {
    const activityId = route.params.id as string
    if (!activityId) {
      ElMessage.error('活动ID不能为空')
      goBack()
      return
    }

    loading.value = true
    const response = await getActivityDetail(activityId)
    if (response.success && response.data) {
      const activity = response.data
      Object.assign(activityForm, {
        title: activity.title,
        activityType: activity.activityType,
        startTime: activity.startTime,
        endTime: activity.endTime,
        location: activity.location,
        capacity: activity.capacity,
        registrationStartTime: activity.registrationStartTime,
        registrationEndTime: activity.registrationEndTime,
        fee: activity.fee,
        status: activity.status,
        description: activity.description || '',
        agenda: activity.agenda || '',
        coverImage: activity.coverImage || '',
        remark: activity.remark || ''
      })

      // 加载海报URL
      if (activity.posterUrl) {
        posterPreviewUrl.value = activity.posterUrl
      }
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取活动详情失败'), true)
      goBack()
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    goBack()
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const activityId = route.params.id as string
    const response = await updateActivity(activityId, activityForm)
    
    if (response.success) {
      ElMessage.success('活动更新成功')
      goBack()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '活动更新失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  loadActivityDetail()
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 上传图片
const uploadImage = async (options: any) => {
  const { file } = options
  
  try {
    // 创建FileReader用于预览
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      if (e.target) {
        activityForm.coverImage = e.target.result as string
        ElMessage.success('图片上传成功')
      }
    }
    
    // 实际项目中，这里应该调用真实的上传API
    // const formData = new FormData()
    // formData.append('file', file)
    // const response = await uploadFile(formData)
    // if (response.success) {
    //   activityForm.coverImage = response.data.url
    //   ElMessage.success('图片上传成功')
    // }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

// 上传前验证
const beforeImageUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isValidType) {
    ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 海报相关方法
const generatePoster = async () => {
  try {
    generatingPoster.value = true

    const posterTitle = activityForm.title || '活动海报'
    const posterContent = `${activityForm.description || ''} 地点：${activityForm.location || ''} 时间：${activityForm.startTime || ''}`

    console.log('🎨 开始生成海报...', { posterTitle, posterContent })

    // 调用AI文生图接口生成海报
    const response = await autoImageApi.generatePosterImage({
      posterTitle,
      posterContent
    })

    console.log('🎨 海报生成响应:', response)

    if (response.success && response.data && response.data.imageUrl) {
      posterPreviewUrl.value = response.data.imageUrl
      console.log('✅ 海报生成成功，URL:', posterPreviewUrl.value)
      ElMessage.success('海报生成成功！AI已为您创建了精美的活动海报')
    } else {
      console.error('❌ 海报生成失败:', response)
      ElMessage.error(response.message || '海报生成失败，请重试')
    }
  } catch (error) {
    console.error('❌ 生成海报失败:', error)
    ElMessage.error('海报生成失败，请检查网络连接后重试')
  } finally {
    generatingPoster.value = false
  }
}

const editPoster = () => {
  if (!posterPreviewUrl.value) {
    ElMessage.warning('请先生成海报')
    return
  }

  // 构建海报编辑器的参数
  const editorParams = {
    activityTitle: activityForm.title || '活动海报',
    activityDescription: activityForm.description || '',
    activityLocation: activityForm.location || '',
    activityStartTime: activityForm.startTime || '',
    activityEndTime: activityForm.endTime || '',
    activityCapacity: activityForm.capacity || 0,
    activityFee: activityForm.fee || 0,
    posterUrl: posterPreviewUrl.value,
    mode: 'edit'
  }

  // 打开海报编辑器页面
  const editorUrl = `/principal/poster-editor?${new URLSearchParams(editorParams).toString()}`

  // 在新窗口中打开海报编辑器
  const editorWindow = window.open(editorUrl, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes')

  if (editorWindow) {
    ElMessage.success('正在打开海报编辑器...')

    // 监听编辑器窗口关闭事件，可以在这里处理编辑完成后的逻辑
    const checkClosed = setInterval(() => {
      if (editorWindow.closed) {
        clearInterval(checkClosed)
        console.log('海报编辑器已关闭')
        // 这里可以添加刷新海报预览的逻辑
      }
    }, 1000)
  } else {
    ElMessage.error('无法打开海报编辑器，请检查浏览器弹窗设置')
  }
}

// 在弹窗中编辑海报
const editPosterInDialog = () => {
  if (!posterPreviewUrl.value) {
    ElMessage.warning('请先生成海报')
    return
  }

  // 构建海报编辑器的参数
  const editorParams = {
    activityTitle: activityForm.title || '活动海报',
    activityDescription: activityForm.description || '',
    activityLocation: activityForm.location || '',
    activityStartTime: activityForm.startTime || '',
    activityEndTime: activityForm.endTime || '',
    activityCapacity: activityForm.capacity || 0,
    activityFee: activityForm.fee || 0,
    posterUrl: posterPreviewUrl.value,
    mode: 'edit',
    embedded: 'true'
  }

  // 构建编辑器URL
  posterEditDialog.editorUrl = `/principal/poster-editor?${new URLSearchParams(editorParams).toString()}`
  posterEditDialog.visible = true

  ElMessage.success('正在加载海报编辑器...')
}

const closePosterEditDialog = () => {
  posterEditDialog.visible = false
  posterEditDialog.editorUrl = ''
}

const savePosterEdit = () => {
  // 这里可以添加保存海报编辑结果的逻辑
  ElMessage.success('海报编辑已保存')
  closePosterEditDialog()
}

const downloadPoster = () => {
  if (!posterPreviewUrl.value) {
    ElMessage.warning('暂无海报可下载')
    return
  }

  // 创建下载链接
  const link = document.createElement('a')
  link.href = posterPreviewUrl.value
  link.download = `${activityForm.title || '活动海报'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('海报下载成功')
}

onMounted(() => {
  loadActivityDetail()
})
</script>

<style scoped>
.activity-form {
  max-width: 800px;
}

.avatar-uploader {
  border: var(--border-width-base) dashed var(--border-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 17var(--spacing-sm);
  height: 17var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: var(--primary-color);
}

.avatar {
  width: 17var(--spacing-sm);
  height: 17var(--spacing-sm);
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: var(--text-3xl);
  color: #8c939d;
}

.upload-tip {
  margin-top: var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* 海报相关样式 */
.poster-section {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.poster-preview {
  width: 100%;
  max-width: 400px;
}

.poster-image-container {
  position: relative;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.poster-image {
  width: 100%;
  height: auto;
  display: block;
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.poster-image-container:hover .poster-overlay {
  opacity: 1;
}

.poster-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed var(--border-base);
  border-radius: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  font-size: var(--text-base);
}

.poster-placeholder .el-icon {
  font-size: var(--text-5xl);
  margin-bottom: var(--spacing-sm);
}

/* 新增的表单分组样式 */
.form-section {
  margin-bottom: var(--spacing-3xl);
  background: var(--bg-tertiary);
  border-radius: var(--spacing-sm);
  padding: var(--text-3xl);
  border: var(--border-width-base) solid #e8e8e8;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--text-2xl);
  padding-bottom: var(--text-sm);
  border-bottom: 2px solid var(--primary-color);
}

.section-title .el-icon {
  color: var(--primary-color);
  font-size: var(--text-xl);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--text-lg);
  padding: var(--text-3xl) 0;
  margin-top: var(--spacing-3xl);
  border-top: var(--border-width-base) solid #e8e8e8;
}

.form-actions .el-button {
  min-width: 120px;
}

/* 优化表单布局 */
.activity-form {
  max-width: none;
}

.activity-form .el-form-item {
  margin-bottom: var(--text-2xl);
}

.activity-form .el-form-item__label {
  font-weight: 500;
  color: var(--text-regular);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-xl)) {
  .form-section .el-col-8 {
    width: 50%;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .form-section .el-col-8,
  .form-section .el-col-12 {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
    align-items: center;
  }

  .form-actions .el-button {
    width: 200px;
  }
}

.poster-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 海报编辑弹窗样式 */
.poster-edit-dialog {
  .el-dialog__body {
    padding: 0;
  }
}

.poster-editor-container {
  width: 100%;
  height: 70vh;
  position: relative;
}

.poster-editor-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c939d;
}

.loading-container .el-icon {
  font-size: var(--text-5xl);
  margin-bottom: var(--text-lg);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
