<template>
  <MobileCenterLayout title="创建活动" back-path="/mobile/activity/activity-index">
    <div class="activity-create-mobile">
      <van-form @submit="onSubmit" @failed="onFailed">
        <!-- 基本信息 -->
        <van-cell-group inset title="基本信息">
          <van-field
            v-model="form.name"
            name="name"
            label="活动名称"
            placeholder="请输入活动名称"
            :rules="[{ required: true, message: '请输入活动名称' }]"
          />

          <van-field
            v-model="form.type"
            is-link
            readonly
            name="type"
            label="活动类型"
            placeholder="请选择活动类型"
            @click="showTypePicker = true"
          />

          <van-field
            v-model="form.description"
            name="description"
            label="活动描述"
            type="textarea"
            rows="3"
            autosize
            placeholder="请输入活动描述"
          />
        </van-cell-group>

        <!-- 时间地点 -->
        <van-cell-group inset title="时间地点">
          <van-field
            v-model="form.startDateDisplay"
            is-link
            readonly
            name="startDate"
            label="开始时间"
            placeholder="请选择开始时间"
            :rules="[{ required: true, message: '请选择开始时间' }]"
            @click="showStartDatePicker = true"
          />

          <van-field
            v-model="form.endDateDisplay"
            is-link
            readonly
            name="endDate"
            label="结束时间"
            placeholder="请选择结束时间"
            @click="showEndDatePicker = true"
          />

          <van-field
            v-model="form.location"
            name="location"
            label="活动地点"
            placeholder="请输入活动地点"
          />
        </van-cell-group>

        <!-- 报名设置 -->
        <van-cell-group inset title="报名设置">
          <van-field
            v-model="form.maxParticipants"
            name="maxParticipants"
            label="人数限制"
            type="digit"
            placeholder="不填则不限制"
          />

          <van-field
            v-model="form.fee"
            name="fee"
            label="活动费用"
            type="number"
            placeholder="0表示免费"
          >
            <template #button>
              <span>元</span>
            </template>
          </van-field>

          <van-cell center title="需要审批报名">
            <template #right-icon>
              <van-switch v-model="form.needApproval" size="20" />
            </template>
          </van-cell>

          <van-field
            v-model="form.registrationDeadlineDisplay"
            is-link
            readonly
            name="registrationDeadline"
            label="报名截止"
            placeholder="默认为活动开始前"
            @click="showDeadlinePicker = true"
          />
        </van-cell-group>

        <!-- 活动封面 -->
        <van-cell-group inset title="活动封面">
          <van-field name="coverImage" label="封面图片">
            <template #input>
              <van-uploader
                v-model="form.coverImages"
                :max-count="1"
                :after-read="afterCoverRead"
              />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 注意事项 -->
        <van-cell-group inset title="注意事项">
          <van-field
            v-model="form.notes"
            name="notes"
            type="textarea"
            rows="4"
            autosize
            placeholder="请输入活动注意事项"
          />
        </van-cell-group>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button round block type="default" @click="saveDraft">
            存为草稿
          </van-button>
          <van-button round block type="primary" native-type="submit">
            创建活动
          </van-button>
        </div>
      </van-form>

      <!-- 活动类型选择器 -->
      <van-popup v-model:show="showTypePicker" position="bottom" round>
        <van-picker
          :columns="typeOptions"
          @confirm="onTypeConfirm"
          @cancel="showTypePicker = false"
        />
      </van-popup>

      <!-- 开始时间选择器 -->
      <van-popup v-model:show="showStartDatePicker" position="bottom" round>
        <van-date-picker
          v-model="form.startDateParts"
          title="选择开始时间"
          :min-date="minDate"
          @confirm="onStartDateConfirm"
          @cancel="showStartDatePicker = false"
        />
      </van-popup>

      <!-- 结束时间选择器 -->
      <van-popup v-model:show="showEndDatePicker" position="bottom" round>
        <van-date-picker
          v-model="form.endDateParts"
          title="选择结束时间"
          :min-date="minDate"
          @confirm="onEndDateConfirm"
          @cancel="showEndDatePicker = false"
        />
      </van-popup>

      <!-- 报名截止时间选择器 -->
      <van-popup v-model:show="showDeadlinePicker" position="bottom" round>
        <van-date-picker
          v-model="form.deadlineParts"
          title="选择报名截止时间"
          :min-date="minDate"
          @confirm="onDeadlineConfirm"
          @cancel="showDeadlinePicker = false"
        />
      </van-popup>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showSuccessToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 表单数据
const form = reactive({
  name: '',
  type: '',
  description: '',
  startDate: '',
  startDateDisplay: '',
  startDateParts: [] as string[],
  endDate: '',
  endDateDisplay: '',
  endDateParts: [] as string[],
  location: '',
  maxParticipants: '',
  fee: '0',
  needApproval: false,
  registrationDeadline: '',
  registrationDeadlineDisplay: '',
  deadlineParts: [] as string[],
  coverImages: [] as any[],
  notes: ''
})

// 弹窗状态
const showTypePicker = ref(false)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const showDeadlinePicker = ref(false)

// 活动类型选项
const typeOptions = [
  { text: '户外活动', value: 'outdoor' },
  { text: '室内活动', value: 'indoor' },
  { text: '亲子活动', value: 'parent-child' },
  { text: '教学活动', value: 'teaching' },
  { text: '节日活动', value: 'festival' },
  { text: '其他', value: 'other' }
]

// 日期限制
const minDate = new Date()

// 类型选择确认
const onTypeConfirm = ({ selectedOptions }: any) => {
  form.type = selectedOptions[0]?.text || ''
  showTypePicker.value = false
}

// 日期格式化
const formatDate = (parts: string[]) => {
  if (parts.length !== 3) return ''
  return `${parts[0]}-${parts[1]}-${parts[2]}`
}

// 开始时间确认
const onStartDateConfirm = ({ selectedValues }: any) => {
  form.startDateParts = selectedValues
  form.startDate = formatDate(selectedValues)
  form.startDateDisplay = form.startDate
  showStartDatePicker.value = false
}

// 结束时间确认
const onEndDateConfirm = ({ selectedValues }: any) => {
  form.endDateParts = selectedValues
  form.endDate = formatDate(selectedValues)
  form.endDateDisplay = form.endDate
  showEndDatePicker.value = false
}

// 报名截止时间确认
const onDeadlineConfirm = ({ selectedValues }: any) => {
  form.deadlineParts = selectedValues
  form.registrationDeadline = formatDate(selectedValues)
  form.registrationDeadlineDisplay = form.registrationDeadline
  showDeadlinePicker.value = false
}

// 封面图片上传
const afterCoverRead = (file: any) => {
  // TODO: 上传到服务器
  console.log('上传封面:', file)
}

// 保存草稿
const saveDraft = async () => {
  try {
    showLoadingToast({ message: '保存中...', forbidClick: true })
    // TODO: 调用API保存草稿
    await new Promise(resolve => setTimeout(resolve, 1000))
    closeToast()
    showSuccessToast('已保存草稿')
  } catch (error) {
    closeToast()
    showToast('保存失败')
  }
}

// 提交表单
const onSubmit = async () => {
  try {
    showLoadingToast({ message: '创建中...', forbidClick: true })
    // TODO: 调用API创建活动
    const activityData = {
      name: form.name,
      type: form.type,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      location: form.location,
      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
      fee: parseFloat(form.fee) || 0,
      needApproval: form.needApproval,
      registrationDeadline: form.registrationDeadline,
      notes: form.notes
    }
    console.log('创建活动:', activityData)
    await new Promise(resolve => setTimeout(resolve, 1000))
    closeToast()
    showSuccessToast('创建成功')
    setTimeout(() => {
      router.push('/mobile/activity/activity-index')
    }, 1000)
  } catch (error) {
    closeToast()
    showToast('创建失败')
  }
}

// 表单验证失败
const onFailed = (errorInfo: any) => {
  console.log('验证失败:', errorInfo)
  showToast('请填写必填项')
}
</script>

<style scoped lang="scss">
.activity-create-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 12px 0 100px 0;

  .van-cell-group {
    margin-bottom: 12px;
  }

  .submit-section {
    position: fixed;
    bottom: 60px;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 12px;

    .van-button {
      flex: 1;
    }
  }
}
</style>
