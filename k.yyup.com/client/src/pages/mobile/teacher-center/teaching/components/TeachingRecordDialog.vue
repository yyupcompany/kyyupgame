<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90vh' }"
    round
    safe-area-inset-bottom
  >
    <div class="teaching-record-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-nav-bar
          :title="record ? '编辑教学记录' : '新建教学记录'"
          left-text="取消"
          right-text="保存"
          left-arrow
          @click-left="handleCancel"
          @click-right="handleSave"
          :loading="saving"
        />
      </div>

      <!-- 表单内容 -->
      <div class="dialog-content">
        <van-form ref="formRef" @submit="handleSave">
          <!-- 基本信息 -->
          <van-cell-group inset title="基本信息">
            <van-field
              v-model="form.className"
              name="className"
              label="班级"
              placeholder="请选择班级"
              readonly
              is-link
              @click="showClassPicker = true"
              :rules="[{ required: true, message: '请选择班级' }]"
            />

            <van-field
              v-model="form.courseName"
              name="courseName"
              label="课程"
              placeholder="请选择课程"
              readonly
              is-link
              @click="showCoursePicker = true"
              :rules="[{ required: true, message: '请选择课程' }]"
            />

            <van-field
              v-model="form.dateText"
              name="date"
              label="上课日期"
              placeholder="请选择上课日期"
              readonly
              is-link
              @click="showDatePicker = true"
              :rules="[{ required: true, message: '请选择上课日期' }]"
            />

            <van-field
              v-model.number="form.duration"
              name="duration"
              label="课程时长"
              type="number"
              placeholder="请输入课程时长"
              :rules="[{ required: true, message: '请输入课程时长' }]"
            >
              <template #right-icon>
                <span class="unit-text">分钟</span>
              </template>
            </van-field>

            <van-field
              v-model.number="form.attendance"
              name="attendance"
              label="出勤人数"
              type="number"
              placeholder="请输入出勤人数"
              :rules="[{ required: true, message: '请输入出勤人数' }]"
            >
              <template #right-icon>
                <span class="unit-text">人</span>
              </template>
            </van-field>

            <van-field
              v-model="form.courseTypeText"
              name="courseType"
              label="课程类型"
              placeholder="请选择课程类型"
              readonly
              is-link
              @click="showCourseTypePicker = true"
              :rules="[{ required: true, message: '请选择课程类型' }]"
            />
          </van-cell-group>

          <!-- 教学内容 -->
          <van-cell-group inset title="教学内容">
            <van-field
              v-model="form.content"
              name="content"
              label="教学内容"
              type="textarea"
              placeholder="请详细描述本次课程的教学内容"
              :rows="4"
              maxlength="500"
              show-word-limit
              :rules="[{ required: true, message: '请输入教学内容' }]"
            />

            <van-field
              v-model="form.objectives"
              name="objectives"
              label="教学目标"
              type="textarea"
              placeholder="请输入本次课程的教学目标"
              :rows="3"
              maxlength="300"
              show-word-limit
            />
          </van-cell-group>

          <!-- 课堂评价 -->
          <van-cell-group inset title="课堂评价">
            <van-cell>
              <template #title>
                <div class="rate-label">课堂互动</div>
              </template>
              <template #right-icon>
                <van-rate v-model="form.interactionLevel" :size="20" />
              </template>
            </van-cell>

            <van-cell>
              <template #title>
                <div class="rate-label">教学效果</div>
              </template>
              <template #right-icon>
                <van-rate v-model="form.effectivenessLevel" :size="20" />
              </template>
            </van-cell>

            <van-field
              v-model="form.studentPerformance"
              name="studentPerformance"
              label="学生表现"
              type="textarea"
              placeholder="请描述学生在本次课程中的整体表现"
              :rows="3"
              maxlength="300"
              show-word-limit
            />
          </van-cell-group>

          <!-- 作业和备注 -->
          <van-cell-group inset title="作业和备注">
            <van-field
              v-model="form.homework"
              name="homework"
              label="作业布置"
              type="textarea"
              placeholder="请输入布置的作业内容（如有）"
              :rows="2"
              maxlength="200"
              show-word-limit
            />

            <van-field
              v-model="form.notes"
              name="notes"
              label="备注"
              type="textarea"
              placeholder="其他需要记录的信息"
              :rows="2"
              maxlength="200"
              show-word-limit
            />
          </van-cell-group>

          <!-- 媒体文件 -->
          <van-cell-group inset title="教学媒体">
            <van-field name="uploader" label="媒体文件">
              <template #input>
                <van-uploader
                  v-model="mediaFiles"
                  :after-read="handleMediaChange"
                  :before-delete="handleMediaRemove"
                  multiple
                  :max-count="9"
                  accept="image/*,video/*"
                  upload-text="上传图片/视频"
                />
              </template>
            </van-field>
            <div class="upload-tip">支持上传图片和视频文件，用于记录教学过程</div>
          </van-cell-group>
        </van-form>
      </div>

      <!-- 底部保存按钮 -->
      <div class="dialog-footer">
        <van-button
          type="primary"
          block
          round
          :loading="saving"
          @click="handleSave"
        >
          保存教学记录
        </van-button>
      </div>
    </div>

    <!-- 选择器弹窗 -->
    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom" round>
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <!-- 课程选择器 -->
    <van-popup v-model:show="showCoursePicker" position="bottom" round>
      <van-picker
        :columns="courseColumns"
        @confirm="onCourseConfirm"
        @cancel="showCoursePicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="selectedDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </van-popup>

    <!-- 课程类型选择器 -->
    <van-popup v-model:show="showCourseTypePicker" position="bottom" round>
      <van-picker
        :columns="courseTypeColumns"
        @confirm="onCourseTypeConfirm"
        @cancel="showCourseTypePicker = false"
      />
    </van-popup>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'

interface TeachingRecord {
  id?: number
  classId: string
  className: string
  courseId: string
  courseName: string
  date: Date | null
  dateText: string
  duration: number
  attendance: number
  courseType: string
  courseTypeText: string
  content: string
  objectives?: string
  studentPerformance?: string
  interactionLevel: number
  effectivenessLevel: number
  homework?: string
  notes?: string
  mediaFiles?: any[]
}

interface Props {
  modelValue: boolean
  record?: TeachingRecord | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: TeachingRecord): void
}

const props = withDefaults(defineProps<Props>(), {
  record: null
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref()
const saving = ref(false)
const mediaFiles = ref<any[]>([])

// 选择器状态
const showClassPicker = ref(false)
const showCoursePicker = ref(false)
const showDatePicker = ref(false)
const showCourseTypePicker = ref(false)
const selectedDate = ref(new Date())

// 选择器选项
const classColumns = [
  { text: '大班A', value: '1' },
  { text: '中班B', value: '2' },
  { text: '小班C', value: '3' }
]

const courseColumns = [
  { text: '数学启蒙', value: '1' },
  { text: '语言表达', value: '2' },
  { text: '艺术创作', value: '3' },
  { text: '科学探索', value: '4' },
  { text: '体育活动', value: '5' }
]

const courseTypeColumns = [
  { text: '常规课程', value: 'regular' },
  { text: '复习课程', value: 'review' },
  { text: '实践活动', value: 'practice' },
  { text: '测评课程', value: 'assessment' }
]

// 日期范围限制
const minDate = new Date(2024, 0, 1)
const maxDate = new Date(2030, 11, 31)

const form = reactive<TeachingRecord>({
  classId: '',
  className: '',
  courseId: '',
  courseName: '',
  date: null,
  dateText: '',
  duration: 90,
  attendance: 0,
  courseType: 'regular',
  courseTypeText: '常规课程',
  content: '',
  objectives: '',
  studentPerformance: '',
  interactionLevel: 3,
  effectivenessLevel: 3,
  homework: '',
  notes: '',
  mediaFiles: []
})

// 重置表单函数
const resetForm = () => {
  Object.assign(form, {
    classId: '',
    className: '',
    courseId: '',
    courseName: '',
    date: null,
    dateText: '',
    duration: 90,
    attendance: 0,
    courseType: 'regular',
    courseTypeText: '常规课程',
    content: '',
    objectives: '',
    studentPerformance: '',
    interactionLevel: 3,
    effectivenessLevel: 3,
    homework: '',
    notes: '',
    mediaFiles: []
  })
  mediaFiles.value = []

  if (formRef.value && typeof formRef.value.resetValidation === 'function') {
    formRef.value.resetValidation()
  }
}

// 监听记录数据变化
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(form, {
      ...newRecord,
      date: newRecord.date ? new Date(newRecord.date) : null,
      dateText: newRecord.date ? formatDate(new Date(newRecord.date)) : ''
    })

    if (newRecord.mediaFiles && newRecord.mediaFiles.length > 0) {
      mediaFiles.value = newRecord.mediaFiles.map(file => ({
        url: file.url,
        name: file.name,
        status: 'done'
      }))
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听弹窗显示状态
watch(visible, (newVisible) => {
  if (!newVisible) {
    resetForm()
  }
})

// 选择器确认回调
const onClassConfirm = ({ selectedOptions }: any) => {
  form.className = selectedOptions[0].text
  form.classId = selectedOptions[0].value
  showClassPicker.value = false
}

const onCourseConfirm = ({ selectedOptions }: any) => {
  form.courseName = selectedOptions[0].text
  form.courseId = selectedOptions[0].value
  showCoursePicker.value = false
}

const onDateConfirm = (value: Date) => {
  form.date = value
  form.dateText = formatDate(value)
  showDatePicker.value = false
}

const onCourseTypeConfirm = ({ selectedOptions }: any) => {
  form.courseTypeText = selectedOptions[0].text
  form.courseType = selectedOptions[0].value
  showCourseTypePicker.value = false
}

// 媒体文件处理
const handleMediaChange = (file: any) => {
  if (file.file) {
    const isValidType = file.file.type.startsWith('image/') || file.file.type.startsWith('video/')
    if (!isValidType) {
      showToast('只能上传图片或视频文件')
      return
    }

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.file.size > maxSize) {
      showToast('文件大小不能超过 100MB')
      return
    }
  }

  form.mediaFiles = mediaFiles.value.map(f => ({
    name: f.name || f.url?.split('/').pop(),
    size: f.size || 0,
    type: f.file?.type || 'unknown',
    url: f.url,
    file: f.file
  }))
}

const handleMediaRemove = (file: any, detail: any) => {
  mediaFiles.value.splice(detail.index, 1)
  form.mediaFiles = mediaFiles.value.map(f => ({
    name: f.name || f.url?.split('/').pop(),
    size: f.size || 0,
    type: f.file?.type || 'unknown',
    url: f.url,
    file: f.file
  }))
  return true
}

const handleSave = async () => {
  try {
    if (!formRef.value) return

    const isValid = await formRef.value.validate()
    if (!isValid) return

    saving.value = true

    const recordData = {
      ...form,
      date: form.date ? form.date.toISOString() : null
    }

    emit('save', recordData)
    showToast('保存成功')
  } catch (error) {
    console.error('表单验证失败:', error)
    showToast('请完善必填信息')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  if (form.content || form.objectives || form.studentPerformance) {
    showConfirmDialog({
      title: '确认离开',
      message: '当前有未保存的内容，确定要离开吗？',
    }).then(() => {
      visible.value = false
    }).catch(() => {
      // 用户取消
    })
  } else {
    visible.value = false
  }
}

// 工具方法
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.teaching-record-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--van-background-color);

  .dialog-header {
    flex-shrink: 0;
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-md) 0;

    .rate-label {
      font-size: var(--van-font-size-md);
      color: var(--van-text-color);
    }

    .upload-tip {
      padding: var(--van-padding-sm) var(--van-padding-md);
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-3);
    }

    .unit-text {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-3);
    }
  }

  .dialog-footer {
    flex-shrink: 0;
    padding: var(--van-padding-md);
    border-top: 1px solid var(--van-border-color);
  }
}

:deep(.van-cell-group) {
  margin-bottom: var(--van-padding-sm);
}

:deep(.van-field__label) {
  width: 80px;
}

:deep(.van-rate) {
  .van-rate__item {
    margin-right: 4px;
  }
}

:deep(.van-uploader) {
  .van-uploader__upload {
    border: 2px dashed var(--van-border-color);
    border-radius: var(--van-border-radius-md);
  }
}

// 暗黑模式适配
:root[data-theme='dark'] .teaching-record-dialog {
  .dialog-footer {
    border-top-color: var(--van-border-color-dark);
  }

  :deep(.van-cell-group__inset) {
    background-color: var(--van-background-2);
  }
}
</style>