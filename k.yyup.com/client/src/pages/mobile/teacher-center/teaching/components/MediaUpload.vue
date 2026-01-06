<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    :close-on-click-overlay="false"
  >
    <div class="mobile-media-upload">
      <!-- 弹窗头部 -->
      <div class="upload-header">
        <van-button
          icon="cross"
          size="small"
          @click="handleCancel"
        />
        <div class="header-title">上传教学媒体</div>
        <van-button
          type="primary"
          size="small"
          :loading="uploading"
          :disabled="!canUpload"
          @click="handleUpload"
        >
          {{ uploading ? '上传中...' : '开始上传' }}
        </van-button>
      </div>

      <!-- 表单内容 -->
      <div class="upload-content">
        <van-form @submit="handleUpload" ref="formRef">
          <!-- 班级选择 -->
          <van-cell-group inset title="基本信息">
            <van-field
              v-model="form.classId"
              name="classId"
              label="班级"
              placeholder="选择班级"
              :rules="[{ required: true, message: '请选择班级' }]"
              is-link
              readonly
              @click="showClassPicker = true"
            >
              <template #right-icon>
                <van-icon name="arrow" />
              </template>
            </van-field>

            <van-field
              v-model="form.courseId"
              name="courseId"
              label="课程"
              placeholder="选择课程"
              :rules="[{ required: true, message: '请选择课程' }]"
              is-link
              readonly
              @click="showCoursePicker = true"
            >
              <template #right-icon>
                <van-icon name="arrow" />
              </template>
            </van-field>

            <van-field name="mediaType" label="媒体类型">
              <template #input>
                <van-radio-group
                  v-model="form.mediaType"
                  direction="horizontal"
                >
                  <van-radio name="image">图片</van-radio>
                  <van-radio name="video">视频</van-radio>
                  <van-radio name="audio">音频</van-radio>
                  <van-radio name="document">文档</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>

          <!-- 文件上传 -->
          <van-cell-group inset title="文件选择">
            <div class="upload-section">
              <div class="upload-tips">
                <van-notice-bar
                  left-icon="info-o"
                  text="支持多种格式，单个文件不超过10MB"
                  color="#1989fa"
                  background="#ecf9ff"
                />
              </div>

              <!-- 图片上传 -->
              <div v-if="form.mediaType === 'image'" class="image-upload">
                <van-uploader
                  v-model="fileList"
                  :after-read="handleFileChange"
                  :before-delete="handleFileRemove"
                  :max-count="9"
                  multiple
                  preview-size="80"
                />
              </div>

              <!-- 视频/音频/文档上传 -->
              <div v-else class="file-upload">
                <div
                  v-if="fileList.length === 0"
                  class="upload-placeholder"
                  @click="triggerFileInput"
                >
                  <van-icon name="plus" size="32" color="#969799" />
                  <div class="placeholder-text">点击选择文件</div>
                  <div class="placeholder-tip">或拖拽文件到此处</div>
                </div>

                <div v-else class="file-list">
                  <div
                    v-for="(file, index) in fileList"
                    :key="index"
                    class="file-item"
                  >
                    <div class="file-info">
                      <van-icon
                        :name="getFileIcon(file)"
                        size="24"
                        :color="getFileIconColor(file)"
                      />
                      <div class="file-details">
                        <div class="file-name">{{ file.name || file.file?.name }}</div>
                        <div class="file-size">{{ formatFileSize(file.size || file.file?.size) }}</div>
                      </div>
                    </div>
                    <van-button
                      icon="delete"
                      size="small"
                      type="danger"
                      plain
                      @click="removeFile(index)"
                    />
                  </div>
                </div>

                <input
                  ref="fileInput"
                  type="file"
                  :accept="getFileAccept()"
                  multiple
                  style="display: none"
                  @change="handleFileInputChange"
                />
              </div>
            </div>
          </van-cell-group>

          <!-- 媒体描述 -->
          <van-cell-group inset title="详细信息">
            <van-field
              v-model="form.description"
              name="description"
              label="媒体描述"
              type="textarea"
              placeholder="请输入媒体描述"
              :rows="3"
              maxlength="200"
              show-word-limit
            />

            <van-field
              v-model="form.tags"
              name="tags"
              label="标签"
              placeholder="请输入标签，用逗号分隔"
              maxlength="50"
            />
          </van-cell-group>
        </van-form>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploading" class="upload-progress">
        <div class="progress-header">
          <span>正在上传...</span>
          <span class="progress-text">{{ uploadProgress }}%</span>
        </div>
        <van-progress
          :percentage="uploadProgress"
          stroke-width="6"
          color="#409EFF"
        />
        <div class="progress-details">
          <span>{{ currentFileName }}</span>
        </div>
      </div>
    </div>

    <!-- 班级选择器 -->
    <van-picker
      v-model:show="showClassPicker"
      :columns="classColumns"
      title="选择班级"
      @confirm="onClassConfirm"
      @cancel="showClassPicker = false"
    />

    <!-- 课程选择器 -->
    <van-picker
      v-model:show="showCoursePicker"
      :columns="courseColumns"
      title="选择课程"
      @confirm="onCourseConfirm"
      @cancel="showCoursePicker = false"
    />
  </van-popup>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { showToast, showSuccessToast, showFailToast, showLoadingToast, closeToast } from 'vant'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'upload-success', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref()
const fileInput = ref()
const uploading = ref(false)
const uploadProgress = ref(0)
const currentFileName = ref('')
const showClassPicker = ref(false)
const showCoursePicker = ref(false)

const fileList = ref<any[]>([])

const form = reactive({
  classId: '',
  courseId: '',
  className: '',
  courseName: '',
  mediaType: 'image',
  description: '',
  tags: '',
  files: []
})

// 选择器数据
const classColumns = [
  { text: '大班A班', value: '1' },
  { text: '中班B班', value: '2' },
  { text: '小班C班', value: '3' }
]

const courseColumns = [
  { text: '数学启蒙', value: '1' },
  { text: '语言表达', value: '2' },
  { text: '艺术创作', value: '3' },
  { text: '音乐律动', value: '4' },
  { text: '体育游戏', value: '5' }
]

// 计算属性
const canUpload = computed(() => {
  return form.classId && form.courseId && fileList.value.length > 0 && !uploading.value
})

// 监听弹窗显示状态
watch(visible, (newVisible) => {
  if (!newVisible) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    classId: '',
    courseId: '',
    className: '',
    courseName: '',
    mediaType: 'image',
    description: '',
    tags: '',
    files: []
  })
  fileList.value = []
  uploadProgress.value = 0
  uploading.value = false
  currentFileName.value = ''
}

// 班级选择确认
const onClassConfirm = ({ selectedOptions }: any) => {
  form.classId = selectedOptions[0].value
  form.className = selectedOptions[0].text
  showClassPicker.value = false
}

// 课程选择确认
const onCourseConfirm = ({ selectedOptions }: any) => {
  form.courseId = selectedOptions[0].value
  form.courseName = selectedOptions[0].text
  showCoursePicker.value = false
}

// 文件处理
const handleFileChange = (file: any, detail: any) => {
  console.log('文件选择:', file)
  // Vant的图片上传已经处理了fileList，这里不需要额外处理
}

const handleFileRemove = (file: any, detail: any) => {
  console.log('文件删除:', file)
  return true
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (validateFile(file)) {
        fileList.value.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type
        })
      }
    }
  }
  // 清空input以允许重复选择相同文件
  target.value = ''
}

const removeFile = (index: number) => {
  fileList.value.splice(index, 1)
}

const validateFile = (file: File) => {
  // 检查文件大小 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    showFailToast(`文件 ${file.name} 超过10MB限制`)
    return false
  }

  // 检查文件类型
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    audio: ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }

  const currentAllowedTypes = allowedTypes[form.mediaType] || []
  if (!currentAllowedTypes.includes(file.type)) {
    showFailToast(`文件 ${file.name} 格式不支持`)
    return false
  }

  return true
}

const getFileAccept = () => {
  const acceptMap = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*',
    document: '.pdf,.doc,.docx'
  }
  return acceptMap[form.mediaType] || '*'
}

const getFileIcon = (file: any) => {
  const type = file.type || file.file?.type
  if (type?.startsWith('image/')) return 'photo-o'
  if (type?.startsWith('video/')) return 'video-o'
  if (type?.startsWith('audio/')) return 'music-o'
  return 'description'
}

const getFileIconColor = (file: any) => {
  const type = file.type || file.file?.type
  if (type?.startsWith('image/')) return '#07c160'
  if (type?.startsWith('video/')) return '#ff6034'
  if (type?.startsWith('audio/')) return '#1989fa'
  return '#646566'
}

const formatFileSize = (size?: number) => {
  if (!size) return '未知大小'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

// 上传处理
const handleUpload = async () => {
  if (!canUpload.value) {
    showFailToast('请完善上传信息')
    return
  }

  try {
    uploading.value = true
    uploadProgress.value = 0

    showLoadingToast({
      message: '正在上传...',
      forbidClick: true,
      duration: 0
    })

    // 模拟上传进度
    const totalFiles = fileList.value.length
    for (let i = 0; i < totalFiles; i++) {
      const file = fileList.value[i]
      currentFileName.value = file.name || file.file?.name

      // 模拟单个文件上传
      for (let progress = 0; progress <= 100; progress += 10) {
        uploadProgress.value = Math.floor((i * 100 + progress) / totalFiles)
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    // 构造上传数据
    const uploadData = {
      classId: form.classId,
      className: form.className,
      courseId: form.courseId,
      courseName: form.courseName,
      mediaType: form.mediaType,
      description: form.description,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      files: fileList.value.map(file => ({
        name: file.name || file.file?.name,
        size: file.size || file.file?.size,
        type: file.type || file.file?.type
      }))
    }

    // 模拟完成延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    closeToast()
    showSuccessToast('媒体上传成功')

    emit('upload-success', uploadData)
    visible.value = false

  } catch (error) {
    console.error('上传失败:', error)
    closeToast()
    showFailToast('上传失败，请重试')
  } finally {
    uploading.value = false
    currentFileName.value = ''
  }
}

const handleCancel = () => {
  if (uploading.value) {
    showToast('正在上传中，请稍后再试')
    return
  }
  visible.value = false
}
</script>

<style lang="scss" scoped>
.mobile-media-upload {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--van-background-color);

  .upload-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--van-border-color);
    background: white;

    .header-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--van-text-color);
    }
  }

  .upload-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);

    .upload-section {
      padding: var(--spacing-md);

      .upload-tips {
        margin-bottom: var(--spacing-md);
      }

      .image-upload {
        :deep(.van-uploader) {
          width: 100%;
        }
      }

      .file-upload {
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          border: 2px dashed var(--van-border-color);
          border-radius: var(--radius-md);
          background: var(--van-background-color-light);
          cursor: pointer;
          transition: all 0.3s ease;

          &:active {
            background: var(--van-background-color);
            border-color: var(--van-primary-color);
          }

          .placeholder-text {
            margin-top: var(--spacing-sm);
            font-size: var(--font-size-base);
            color: var(--van-text-color);
          }

          .placeholder-tip {
            margin-top: var(--spacing-xs);
            font-size: var(--font-size-sm);
            color: var(--van-text-color-2);
          }
        }

        .file-list {
          .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-sm);
            background: white;
            border-radius: var(--radius-md);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

            .file-info {
              display: flex;
              align-items: center;
              flex: 1;

              .file-details {
                margin-left: var(--spacing-sm);

                .file-name {
                  font-size: var(--font-size-base);
                  color: var(--van-text-color);
                  margin-bottom: var(--spacing-xs);
                  word-break: break-all;
                }

                .file-size {
                  font-size: var(--font-size-sm);
                  color: var(--van-text-color-2);
                }
              }
            }
          }
        }
      }
    }
  }

  .upload-progress {
    padding: var(--spacing-md);
    background: white;
    border-top: 1px solid var(--van-border-color);

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);

      .progress-text {
        font-weight: var(--font-weight-bold);
        color: var(--van-primary-color);
      }
    }

    .progress-details {
      margin-top: var(--spacing-sm);
      font-size: var(--font-size-sm);
      color: var(--van-text-color-2);
      text-align: center;
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-media-upload {
    .upload-content {
      padding: var(--spacing-sm);

      .upload-section {
        padding: var(--spacing-sm);
      }
    }
  }
}
</style>