<template>
  <MobileCenterLayout title="编辑活动" :back-path="backPath">
    <div class="activity-edit-mobile" v-loading="loading">
      <!-- 基本信息 -->
      <van-cell-group inset title="基本信息" class="form-section">
        <van-field
          v-model="form.title"
          label="活动标题"
          placeholder="请输入活动标题"
          required
          :rules="[{ required: true, message: '请输入活动标题' }]"
        />
        <van-field
          v-model="form.typeName"
          is-link
          readonly
          label="活动类型"
          placeholder="请选择活动类型"
          required
          @click="showTypePicker = true"
        />
        <van-field
          v-model="form.location"
          label="活动地点"
          placeholder="请输入活动地点"
          required
        />
        <van-field
          v-model="form.capacity"
          label="活动容量"
          type="digit"
          placeholder="请输入人数上限"
        >
          <template #extra>人</template>
        </van-field>
        <van-field
          v-model="form.fee"
          label="活动费用"
          type="number"
          placeholder="请输入费用"
        >
          <template #extra>元</template>
        </van-field>
        <van-field
          v-model="form.statusName"
          is-link
          readonly
          label="活动状态"
          placeholder="请选择活动状态"
          @click="showStatusPicker = true"
        />
      </van-cell-group>

      <!-- 时间设置 -->
      <van-cell-group inset title="时间设置" class="form-section">
        <van-field
          v-model="form.startTimeText"
          is-link
          readonly
          label="开始时间"
          placeholder="请选择开始时间"
          required
          @click="openDatePicker('startTime')"
        />
        <van-field
          v-model="form.endTimeText"
          is-link
          readonly
          label="结束时间"
          placeholder="请选择结束时间"
          required
          @click="openDatePicker('endTime')"
        />
        <van-field
          v-model="form.regStartTimeText"
          is-link
          readonly
          label="报名开始"
          placeholder="请选择报名开始时间"
          @click="openDatePicker('registrationStartTime')"
        />
        <van-field
          v-model="form.regEndTimeText"
          is-link
          readonly
          label="报名结束"
          placeholder="请选择报名结束时间"
          @click="openDatePicker('registrationEndTime')"
        />
      </van-cell-group>

      <!-- 详细信息 -->
      <van-cell-group inset title="详细信息" class="form-section">
        <van-field
          v-model="form.description"
          label="活动描述"
          type="textarea"
          rows="3"
          placeholder="请输入活动描述"
          maxlength="500"
          show-word-limit
        />
        <van-field
          v-model="form.agenda"
          label="活动议程"
          type="textarea"
          rows="3"
          placeholder="请输入活动议程"
          maxlength="1000"
          show-word-limit
        />
        <van-field
          v-model="form.remark"
          label="备注信息"
          type="textarea"
          rows="2"
          placeholder="请输入备注"
          maxlength="200"
          show-word-limit
        />
      </van-cell-group>

      <!-- 媒体内容 -->
      <van-cell-group inset title="媒体内容" class="form-section">
        <van-cell title="封面图片">
          <template #value>
            <van-uploader
              v-model="coverFileList"
              :max-count="1"
              :after-read="afterCoverRead"
            />
          </template>
        </van-cell>
        <van-cell title="活动海报" v-if="posterPreviewUrl">
          <template #value>
            <div class="poster-preview">
              <van-image :src="posterPreviewUrl" width="80" height="120" fit="cover" />
              <div class="poster-actions">
                <van-button size="mini" type="primary" @click="generatePoster">
                  {{ generating ? '生成中...' : '重新生成' }}
                </van-button>
              </div>
            </div>
          </template>
        </van-cell>
        <van-cell title="活动海报" v-else>
          <template #value>
            <van-button size="small" type="primary" @click="generatePoster" :loading="generating">
              生成海报
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <van-button type="primary" block round :loading="submitting" @click="handleSubmit">
          保存修改
        </van-button>
        <van-button plain block round @click="handleReset" class="reset-btn">
          重置
        </van-button>
      </div>
    </div>

    <!-- 活动类型选择 -->
    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <van-picker
        title="选择活动类型"
        :columns="activityTypeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 活动状态选择 -->
    <van-popup v-model:show="showStatusPicker" position="bottom" round>
      <van-picker
        title="选择活动状态"
        :columns="activityStatusOptions"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>

    <!-- 日期时间选择 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="currentDate"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showTimePicker" position="bottom" round>
      <van-time-picker
        v-model="currentTime"
        title="选择时间"
        @confirm="onTimeConfirm"
        @cancel="showTimePicker = false"
      />
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const route = useRoute()
const router = useRouter()

// 返回路径
const backPath = computed(() => {
  const from = route.query.from as string
  return from || '/mobile/activity/activity-index'
})

// 加载状态
const loading = ref(false)
const submitting = ref(false)
const generating = ref(false)

// 海报
const posterPreviewUrl = ref('')
const coverFileList = ref<any[]>([])

// 选择器显示状态
const showTypePicker = ref(false)
const showStatusPicker = ref(false)
const showDatePicker = ref(false)
const showTimePicker = ref(false)
const currentDateField = ref('')
const currentDate = ref(['2025', '01', '01'])
const currentTime = ref(['12', '00'])
const minDate = new Date(2020, 0, 1)
const maxDate = new Date(2030, 11, 31)

// 活动类型选项
const activityTypeOptions = [
  { text: '开放日', value: 1 },
  { text: '家长会', value: 2 },
  { text: '亲子活动', value: 3 },
  { text: '招生宣讲', value: 4 },
  { text: '园区参观', value: 5 },
  { text: '其他', value: 6 }
]

// 活动状态选项
const activityStatusOptions = [
  { text: '计划中', value: 0 },
  { text: '报名中', value: 1 },
  { text: '已满员', value: 2 },
  { text: '进行中', value: 3 },
  { text: '已结束', value: 4 },
  { text: '已取消', value: 5 }
]

// 表单数据
const form = reactive({
  title: '',
  activityType: undefined as number | undefined,
  typeName: '',
  location: '',
  capacity: '',
  fee: '',
  status: 0,
  statusName: '计划中',
  startTime: '',
  startTimeText: '',
  endTime: '',
  endTimeText: '',
  registrationStartTime: '',
  regStartTimeText: '',
  registrationEndTime: '',
  regEndTimeText: '',
  description: '',
  agenda: '',
  remark: '',
  coverImage: ''
})

// 原始数据（用于重置）
let originalForm: typeof form | null = null

// 格式化日期显示
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 打开日期选择器
const openDatePicker = (field: string) => {
  currentDateField.value = field
  const fieldValue = (form as any)[field]
  if (fieldValue) {
    const date = new Date(fieldValue)
    currentDate.value = [
      String(date.getFullYear()),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ]
  } else {
    const now = new Date()
    currentDate.value = [
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ]
  }
  showDatePicker.value = true
}

// 日期确认
const onDateConfirm = ({ selectedValues }: any) => {
  showDatePicker.value = false
  showTimePicker.value = true
}

// 时间确认
const onTimeConfirm = ({ selectedValues }: any) => {
  showTimePicker.value = false
  const dateStr = `${currentDate.value.join('-')} ${selectedValues.join(':')}:00`
  const field = currentDateField.value
  ;(form as any)[field] = dateStr

  // 更新显示文本
  if (field === 'startTime') {
    form.startTimeText = formatDateTime(dateStr)
  } else if (field === 'endTime') {
    form.endTimeText = formatDateTime(dateStr)
  } else if (field === 'registrationStartTime') {
    form.regStartTimeText = formatDateTime(dateStr)
  } else if (field === 'registrationEndTime') {
    form.regEndTimeText = formatDateTime(dateStr)
  }
}

// 类型选择确认
const onTypeConfirm = ({ selectedOptions }: any) => {
  showTypePicker.value = false
  if (selectedOptions[0]) {
    form.activityType = selectedOptions[0].value
    form.typeName = selectedOptions[0].text
  }
}

// 状态选择确认
const onStatusConfirm = ({ selectedOptions }: any) => {
  showStatusPicker.value = false
  if (selectedOptions[0]) {
    form.status = selectedOptions[0].value
    form.statusName = selectedOptions[0].text
  }
}

// 封面图片上传
const afterCoverRead = (file: any) => {
  form.coverImage = file.content
}

// 生成海报
const generatePoster = async () => {
  generating.value = true
  try {
    // 模拟海报生成
    await new Promise(resolve => setTimeout(resolve, 1500))
    posterPreviewUrl.value = form.coverImage || 'https://via.placeholder.com/300x450'
    showSuccessToast('海报生成成功')
  } catch {
    showFailToast('海报生成失败')
  } finally {
    generating.value = false
  }
}

// 加载活动详情
const loadActivityDetail = async () => {
  const activityId = route.params.id as string
  if (!activityId) {
    showFailToast('活动ID不能为空')
    router.back()
    return
  }

  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockData = {
      title: '亲子开放日活动',
      activityType: 1,
      location: '幼儿园大厅',
      capacity: 50,
      fee: 0,
      status: 1,
      startTime: '2025-02-01 09:00:00',
      endTime: '2025-02-01 12:00:00',
      registrationStartTime: '2025-01-15 00:00:00',
      registrationEndTime: '2025-01-31 23:59:59',
      description: '欢迎家长和小朋友参加我们的开放日活动',
      agenda: '09:00-09:30 签到\n09:30-10:30 园区参观\n10:30-11:30 亲子互动\n11:30-12:00 答疑环节',
      remark: '',
      coverImage: '',
      posterUrl: ''
    }

    // 填充表单
    form.title = mockData.title
    form.activityType = mockData.activityType
    form.typeName = activityTypeOptions.find(t => t.value === mockData.activityType)?.text || ''
    form.location = mockData.location
    form.capacity = String(mockData.capacity)
    form.fee = String(mockData.fee)
    form.status = mockData.status
    form.statusName = activityStatusOptions.find(s => s.value === mockData.status)?.text || ''
    form.startTime = mockData.startTime
    form.startTimeText = formatDateTime(mockData.startTime)
    form.endTime = mockData.endTime
    form.endTimeText = formatDateTime(mockData.endTime)
    form.registrationStartTime = mockData.registrationStartTime
    form.regStartTimeText = formatDateTime(mockData.registrationStartTime)
    form.registrationEndTime = mockData.registrationEndTime
    form.regEndTimeText = formatDateTime(mockData.registrationEndTime)
    form.description = mockData.description
    form.agenda = mockData.agenda
    form.remark = mockData.remark
    form.coverImage = mockData.coverImage
    posterPreviewUrl.value = mockData.posterUrl

    // 保存原始数据
    originalForm = JSON.parse(JSON.stringify(form))
  } catch {
    showFailToast('加载活动详情失败')
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.title) {
    showToast('请输入活动标题')
    return
  }
  if (!form.activityType) {
    showToast('请选择活动类型')
    return
  }
  if (!form.startTime) {
    showToast('请选择开始时间')
    return
  }
  if (!form.endTime) {
    showToast('请选择结束时间')
    return
  }

  submitting.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    showSuccessToast('保存成功')
    setTimeout(() => router.back(), 500)
  } catch {
    showFailToast('保存失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (originalForm) {
    Object.assign(form, JSON.parse(JSON.stringify(originalForm)))
    showToast('已重置')
  }
}

onMounted(() => {
  loadActivityDetail()
})
</script>

<style scoped lang="scss">
.activity-edit-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 120px;
}

.form-section {
  margin: 12px 0;
}

.poster-preview {
  display: flex;
  align-items: center;
  gap: 8px;

  .poster-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;

  .reset-btn {
    margin-top: 8px;
  }
}
</style>
