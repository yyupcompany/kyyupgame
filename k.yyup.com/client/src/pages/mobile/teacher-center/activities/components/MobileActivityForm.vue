<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    closeable
    @close="handleClose"
  >
    <div class="mobile-activity-form">
      <div class="form-header">
        <h3>{{ isEdit ? '编辑活动' : '创建活动' }}</h3>
        <van-button
          type="primary"
          size="small"
          :loading="saving"
          @click="handleSave"
        >
          {{ isEdit ? '保存' : '创建' }}
        </van-button>
      </div>

      <div class="form-content">
        <van-form @submit="handleSave" ref="formRef">
          <!-- 基本信息 -->
          <van-cell-group inset title="基本信息">
            <van-field
              v-model="formData.title"
              name="title"
              label="活动标题"
              placeholder="请输入活动标题"
              :rules="[{ required: true, message: '请输入活动标题' }]"
            />

            <van-field
              v-model="formData.description"
              name="description"
              label="活动描述"
              type="textarea"
              placeholder="请输入活动描述"
              rows="3"
              maxlength="500"
              show-word-limit
            />

            <van-field
              name="activityType"
              label="活动类型"
              placeholder="请选择活动类型"
              :rules="[{ required: true, message: '请选择活动类型' }]"
              readonly
              is-link
              @click="showActivityTypePicker = true"
            >
              <template #input>
                <span>{{ getActivityTypeText(formData.activityType) || '请选择活动类型' }}</span>
              </template>
            </van-field>

            <van-field
              v-model="formData.location"
              name="location"
              label="活动地点"
              placeholder="请输入活动地点"
              :rules="[{ required: true, message: '请输入活动地点' }]"
            />
          </van-cell-group>

          <!-- 时间设置 -->
          <van-cell-group inset title="时间设置">
            <van-field
              name="startTime"
              label="开始时间"
              placeholder="请选择开始时间"
              :rules="[{ required: true, message: '请选择开始时间' }]"
              readonly
              is-link
              @click="showStartTimePicker = true"
            >
              <template #input>
                <span>{{ formatDateTime(formData.startTime) || '请选择开始时间' }}</span>
              </template>
            </van-field>

            <van-field
              name="endTime"
              label="结束时间"
              placeholder="请选择结束时间"
              :rules="[{ required: true, message: '请选择结束时间' }]"
              readonly
              is-link
              @click="showEndTimePicker = true"
            >
              <template #input>
                <span>{{ formatDateTime(formData.endTime) || '请选择结束时间' }}</span>
              </template>
            </van-field>

            <van-field
              name="registrationStartTime"
              label="报名开始"
              placeholder="请选择报名开始时间"
              readonly
              is-link
              @click="showRegistrationStartTimePicker = true"
            >
              <template #input>
                <span>{{ formatDateTime(formData.registrationStartTime) || '请选择报名开始时间' }}</span>
              </template>
            </van-field>

            <van-field
              name="registrationEndTime"
              label="报名结束"
              placeholder="请选择报名结束时间"
              readonly
              is-link
              @click="showRegistrationEndTimePicker = true"
            >
              <template #input>
                <span>{{ formatDateTime(formData.registrationEndTime) || '请选择报名结束时间' }}</span>
              </template>
            </van-field>
          </van-cell-group>

          <!-- 参与设置 -->
          <van-cell-group inset title="参与设置">
            <van-field
              v-model.number="formData.capacity"
              name="capacity"
              label="参与人数"
              type="number"
              placeholder="请输入参与人数上限"
              :rules="[{ required: true, message: '请输入参与人数上限' }]"
            />

            <van-field
              v-model.number="formData.fee"
              name="fee"
              label="活动费用"
              type="number"
              placeholder="请输入活动费用（0为免费）"
            />

            <van-cell title="需要审核">
              <template #right-icon>
                <van-switch v-model="formData.needsApproval" />
              </template>
            </van-cell>
          </van-cell-group>

          <!-- 活动详情 -->
          <van-cell-group inset title="活动详情">
            <van-field name="coverImage" label="封面图片">
              <template #input>
                <van-uploader
                  v-model="coverImages"
                  :max-count="1"
                  :after-read="handleCoverImageUpload"
                  preview-size="100px"
                />
              </template>
            </van-field>

            <van-field
              v-model="formData.agenda"
              name="agenda"
              label="活动议程"
              type="textarea"
              placeholder="请输入活动议程"
              rows="4"
              maxlength="1000"
              show-word-limit
            />
          </van-cell-group>

          <!-- 其他信息 -->
          <van-cell-group inset title="其他信息">
            <van-field
              v-model="formData.remark"
              name="remark"
              label="备注"
              type="textarea"
              placeholder="请输入备注信息"
              rows="2"
              maxlength="200"
              show-word-limit
            />
          </van-cell-group>
        </van-form>
      </div>
    </div>

    <!-- 活动类型选择器 -->
    <van-picker
      v-model:show="showActivityTypePicker"
      :columns="activityTypeColumns"
      @confirm="onActivityTypeConfirm"
      @cancel="showActivityTypePicker = false"
    />

    <!-- 时间选择器 -->
    <van-popup v-model:show="showStartTimePicker" position="bottom">
      <van-date-picker
        v-model="tempStartTime"
        type="datetime"
        title="选择开始时间"
        @confirm="onStartTimeConfirm"
        @cancel="showStartTimePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndTimePicker" position="bottom">
      <van-date-picker
        v-model="tempEndTime"
        type="datetime"
        title="选择结束时间"
        @confirm="onEndTimeConfirm"
        @cancel="showEndTimePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showRegistrationStartTimePicker" position="bottom">
      <van-date-picker
        v-model="tempRegistrationStartTime"
        type="datetime"
        title="选择报名开始时间"
        @confirm="onRegistrationStartTimeConfirm"
        @cancel="showRegistrationStartTimePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showRegistrationEndTimePicker" position="bottom">
      <van-date-picker
        v-model="tempRegistrationEndTime"
        type="datetime"
        title="选择报名结束时间"
        @confirm="onRegistrationEndTimeConfirm"
        @cancel="showRegistrationEndTimePicker = false"
      />
    </van-popup>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import dayjs from 'dayjs'

interface ActivityParams {
  title?: string
  description?: string
  activityType?: number
  location?: string
  startTime?: string
  endTime?: string
  registrationStartTime?: string
  registrationEndTime?: string
  capacity?: number
  fee?: number
  needsApproval?: boolean
  agenda?: string
  coverImage?: string
  remark?: string
  status?: number
}

interface Props {
  modelValue: boolean
  activity?: ActivityParams | null
}

const props = withDefaults(defineProps<Props>(), {
  activity: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: ActivityParams]
}>()

const formRef = ref()
const saving = ref(false)
const coverImages = ref([])

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.activity)

// 表单数据
const formData = ref<ActivityParams>({
  title: '',
  description: '',
  activityType: undefined,
  location: '',
  startTime: '',
  endTime: '',
  registrationStartTime: '',
  registrationEndTime: '',
  capacity: undefined,
  fee: 0,
  needsApproval: false,
  agenda: '',
  coverImage: '',
  remark: '',
  status: 0
})

// 选择器显示状态
const showActivityTypePicker = ref(false)
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)
const showRegistrationStartTimePicker = ref(false)
const showRegistrationEndTimePicker = ref(false)

// 临时时间值
const tempStartTime = ref(new Date())
const tempEndTime = ref(new Date())
const tempRegistrationStartTime = ref(new Date())
const tempRegistrationEndTime = ref(new Date())

// 活动类型选项
const activityTypeColumns = [
  { text: '开放日', value: 1 },
  { text: '体验课', value: 2 },
  { text: '亲子活动', value: 3 },
  { text: '招生说明会', value: 4 },
  { text: '家长会', value: 5 },
  { text: '节日活动', value: 6 },
  { text: '其他', value: 7 }
]

// 重置表单（必须在watch之前定义）
const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    activityType: undefined,
    location: '',
    startTime: '',
    endTime: '',
    registrationStartTime: '',
    registrationEndTime: '',
    capacity: undefined,
    fee: 0,
    needsApproval: false,
    agenda: '',
    coverImage: '',
    remark: '',
    status: 0
  }
  coverImages.value = []
}

// 监听活动数据变化
watch(() => props.activity, (activity) => {
  if (activity) {
    formData.value = { ...activity }
    if (activity.coverImage) {
      coverImages.value = [{
        url: activity.coverImage,
        name: '封面图片'
      }]
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSave = async () => {
  try {
    // 验证表单
    await formRef.value.validate()

    // 时间验证
    if (!validateTime()) {
      return
    }

    saving.value = true
    showLoadingToast({
      message: isEdit.value ? '保存中...' : '创建中...',
      forbidClick: true
    })

    // 发送保存事件
    emit('save', { ...formData.value })

    closeToast()
    showToast(isEdit.value ? '保存成功' : '创建成功')
    visible.value = false
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败，请检查输入')
  } finally {
    saving.value = false
  }
}

const validateTime = (): boolean => {
  const start = dayjs(formData.value.startTime)
  const end = dayjs(formData.value.endTime)
  const regStart = dayjs(formData.value.registrationStartTime)
  const regEnd = dayjs(formData.value.registrationEndTime)

  if (start.isAfter(end)) {
    showToast('开始时间不能晚于结束时间')
    return false
  }

  if (regStart.isAfter(regEnd)) {
    showToast('报名开始时间不能晚于报名结束时间')
    return false
  }

  if (regEnd.isAfter(start)) {
    showToast('报名结束时间不能晚于活动开始时间')
    return false
  }

  return true
}

const handleCoverImageUpload = (file: any) => {
  // 这里应该上传到服务器，现在先本地存储
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.coverImage = e.target?.result as string
  }
  reader.readAsDataURL(file.file)
}

const onActivityTypeConfirm = ({ selectedValues }: { selectedValues: number[] }) => {
  formData.value.activityType = selectedValues[0]
  showActivityTypePicker.value = false
}

const onStartTimeConfirm = (value: Date) => {
  formData.value.startTime = dayjs(value).format('YYYY-MM-DD HH:mm:ss')
  tempStartTime.value = value
  showStartTimePicker.value = false
}

const onEndTimeConfirm = (value: Date) => {
  formData.value.endTime = dayjs(value).format('YYYY-MM-DD HH:mm:ss')
  tempEndTime.value = value
  showEndTimePicker.value = false
}

const onRegistrationStartTimeConfirm = (value: Date) => {
  formData.value.registrationStartTime = dayjs(value).format('YYYY-MM-DD HH:mm:ss')
  tempRegistrationStartTime.value = value
  showRegistrationStartTimePicker.value = false
}

const onRegistrationEndTimeConfirm = (value: Date) => {
  formData.value.registrationEndTime = dayjs(value).format('YYYY-MM-DD HH:mm:ss')
  tempRegistrationEndTime.value = value
  showRegistrationEndTimePicker.value = false
}

const getActivityTypeText = (type?: number): string => {
  if (!type) return ''
  const activityType = activityTypeColumns.find(item => item.value === type)
  return activityType?.text || ''
}

const formatDateTime = (dateTime?: string): string => {
  if (!dateTime) return ''
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-activity-form {
  height: 100%;
  display: flex;
  flex-direction: column;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid #eee;
    background: var(--card-bg);
    position: sticky;
    top: 0;
    z-index: 1;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }
  }

  .form-content {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;
    background: var(--primary-color);

    .van-cell-group {
      margin-bottom: 16px;
      border-radius: 8px;
      overflow: hidden;
    }
  }
}

:deep(.van-uploader) {
  .van-uploader__upload {
    border: 2px dashed #ddd;
    border-radius: 8px;
  }
}
</style>