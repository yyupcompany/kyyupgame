<template>
  <MobileMainLayout
    title="添加跟进记录"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
    @back="handleBack"
  >
    <div class="mobile-follow-up-page">
      <!-- 家长信息卡片 -->
      <van-cell-group inset class="parent-info-card">
        <van-cell center>
          <template #title>
            <div class="parent-info">
              <span class="parent-name">{{ parentInfo.name }}</span>
              <van-tag :type="getParentStatusType(parentInfo.status)" size="medium">
                {{ parentInfo.status }}
              </van-tag>
            </div>
          </template>
          <template #value>
            <span class="parent-phone">{{ parentInfo.phone }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <van-skeleton :row="5" animated />
        <van-skeleton :row="3" animated />
        <van-skeleton :row="4" animated />
      </div>

      <!-- 表单内容 -->
      <div v-else class="follow-up-form">
        <van-form @submit="handleSubmit" ref="formRef">
          <!-- 跟进标题 -->
          <van-cell-group inset>
            <van-field
              v-model="form.title"
              name="title"
              label="跟进标题"
              placeholder="请输入跟进记录标题"
              :rules="[{ required: true, message: '请输入跟进记录标题' }]"
            />
          </van-cell-group>

          <!-- 跟进类型和时间 -->
          <van-cell-group inset>
            <van-field
              v-model="form.type"
              name="type"
              label="跟进类型"
              placeholder="请选择跟进类型"
              is-link
              readonly
              @click="showTypePicker = true"
              :rules="[{ required: true, message: '请选择跟进类型' }]"
            />
            <van-field
              v-model="form.time"
              name="time"
              label="跟进时间"
              placeholder="请选择跟进时间"
              is-link
              readonly
              @click="showTimePicker = true"
              :rules="[{ required: true, message: '请选择跟进时间' }]"
            />
          </van-cell-group>

          <!-- 跟进内容 -->
          <van-cell-group inset>
            <van-field
              v-model="form.content"
              name="content"
              label="跟进内容"
              type="textarea"
              placeholder="请输入跟进内容详情"
              rows="4"
              maxlength="500"
              show-word-limit
              :rules="[{ required: true, message: '请输入跟进内容' }]"
            />
          </van-cell-group>

          <!-- 下次跟进 -->
          <van-cell-group inset>
            <van-field
              v-model="form.nextFollowUpTime"
              name="nextFollowUpTime"
              label="下次跟进"
              placeholder="请选择下次跟进时间"
              is-link
              readonly
              @click="showNextTimePicker = true"
            />
            <van-field
              v-model="form.nextFollowUpType"
              name="nextFollowUpType"
              label="跟进类型"
              placeholder="请选择下次跟进类型"
              is-link
              readonly
              @click="showNextTypePicker = true"
            />
          </van-cell-group>

          <!-- 跟进结果 -->
          <van-cell-group inset>
            <van-field
              v-model="form.result"
              name="result"
              label="跟进结果"
              placeholder="请选择跟进结果"
              is-link
              readonly
              @click="showResultPicker = true"
              :rules="[{ required: true, message: '请选择跟进结果' }]"
            />
          </van-cell-group>

          <!-- 提醒设置 -->
          <van-cell-group inset>
            <van-cell center title="提醒设置">
              <template #right-icon>
                <van-switch v-model="form.enableReminder" size="24" />
              </template>
            </van-cell>
            <van-field
              v-if="form.enableReminder"
              v-model="form.reminderTime"
              name="reminderTime"
              label="提醒时间"
              placeholder="请选择提醒时间"
              is-link
              readonly
              @click="showReminderPicker = true"
              :rules="[{ required: true, message: '请选择提醒时间' }]"
            />
          </van-cell-group>

          <!-- 提交按钮 -->
          <div class="submit-section">
            <van-button
              type="primary"
              block
              round
              native-type="submit"
              :loading="submitting"
              loading-text="保存中..."
            >
              保存
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 选择器弹窗 -->
      <!-- 跟进类型选择器 -->
      <van-popup v-model:show="showTypePicker" position="bottom">
        <van-picker
          :columns="followUpTypes"
          @confirm="onTypeConfirm"
          @cancel="showTypePicker = false"
        />
      </van-popup>

      <!-- 时间选择器 -->
      <van-popup v-model:show="showTimePicker" position="bottom">
        <van-date-picker
          v-model="currentTime"
          type="datetime"
          title="选择跟进时间"
          @confirm="onTimeConfirm"
          @cancel="showTimePicker = false"
        />
      </van-popup>

      <!-- 下次跟进时间 -->
      <van-popup v-model:show="showNextTimePicker" position="bottom">
        <van-date-picker
          v-model="nextTime"
          type="datetime"
          title="选择下次跟进时间"
          @confirm="onNextTimeConfirm"
          @cancel="showNextTimePicker = false"
        />
      </van-popup>

      <!-- 下次跟进类型 -->
      <van-popup v-model:show="showNextTypePicker" position="bottom">
        <van-picker
          :columns="followUpTypes"
          @confirm="onNextTypeConfirm"
          @cancel="showNextTypePicker = false"
        />
      </van-popup>

      <!-- 跟进结果选择器 -->
      <van-popup v-model:show="showResultPicker" position="bottom">
        <van-picker
          :columns="resultTypes"
          @confirm="onResultConfirm"
          @cancel="showResultPicker = false"
        />
      </van-popup>

      <!-- 提醒时间选择器 -->
      <van-popup v-model:show="showReminderPicker" position="bottom">
        <van-date-picker
          v-model="reminderTime"
          type="datetime"
          title="选择提醒时间"
          @confirm="onReminderConfirm"
          @cancel="showReminderPicker = false"
        />
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { request } from '@/utils/request'
import { PARENT_ENDPOINTS } from '@/api/endpoints'
import type { ApiResponse } from '@/api/endpoints'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

interface ParentInfo {
  id: number
  name: string
  phone: string
  status: string
}

interface FollowUpForm {
  parentId: number
  title: string
  type: string
  time: string
  content: string
  nextFollowUpTime?: string
  nextFollowUpType?: string
  result: string
  enableReminder: boolean
  reminderTime?: string
}

// 组合式API
const route = useRoute()
const router = useRouter()

// 响应式数据
const formRef = ref()
const loading = ref(false)
const submitting = ref(false)
const parentId = Number(route.query.parentId || route.params.parentId)

// 家长基本信息
const parentInfo = ref<ParentInfo>({
  id: parentId,
  name: '',
  phone: '',
  status: ''
})

// 表单数据
const form = reactive<FollowUpForm>({
  parentId: parentId,
  title: '',
  type: '',
  time: '',
  content: '',
  result: '待定',
  enableReminder: false
})

// 选择器状态
const showTypePicker = ref(false)
const showTimePicker = ref(false)
const showNextTimePicker = ref(false)
const showNextTypePicker = ref(false)
const showResultPicker = ref(false)
const showReminderPicker = ref(false)

const currentTime = ref(new Date())
const nextTime = ref(new Date())
const reminderTime = ref(new Date())

// 选择器选项
const followUpTypes = [
  { text: '电话咨询', value: '电话咨询' },
  { text: '实地参观', value: '实地参观' },
  { text: '家长会谈', value: '家长会谈' },
  { text: '电话回访', value: '电话回访' },
  { text: '其他', value: '其他' }
]

const resultTypes = [
  { text: '有意向', value: '有意向' },
  { text: '考虑中', value: '考虑中' },
  { text: '无意向', value: '无意向' },
  { text: '待定', value: '待定' }
]

// 方法
const fetchParentInfo = async () => {
  loading.value = true

  try {
    const response: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_BY_ID(parentId))

    if (response.success && response.data) {
      parentInfo.value = {
        id: response.data.id,
        name: response.data.name,
        phone: response.data.phone,
        status: response.data.status
      }
    } else {
      showFailToast(response.message || '获取家长信息失败')
    }
  } catch (error) {
    console.error('获取家长信息失败:', error)
    showFailToast('获取家长信息失败')
  } finally {
    loading.value = false
  }
}

const getParentStatusType = (status: string): string => {
  switch (status) {
    case '潜在家长':
      return 'primary'
    case '在读家长':
      return 'success'
    case '毕业家长':
      return 'default'
    default:
      return 'default'
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const response: ApiResponse = await request.post(
      PARENT_ENDPOINTS.COMMUNICATION_HISTORY(parentId),
      form
    )

    if (response.success) {
      showSuccessToast('跟进记录添加成功')
      router.push({
        path: '/mobile/parent-center/dashboard',
        query: { refresh: 'true' }
      })
    } else {
      showFailToast(response.message || '添加跟进记录失败')
    }
  } catch (error) {
    console.error('添加跟进记录失败:', error)
    showFailToast('添加跟进记录失败')
  } finally {
    submitting.value = false
  }
}

const handleBack = () => {
  router.back()
}

// 选择器确认事件
const onTypeConfirm = ({ selectedValues }: any) => {
  form.type = selectedValues[0]
  showTypePicker.value = false
}

const onTimeConfirm = (value: Date) => {
  form.time = value.toISOString().slice(0, 16).replace('T', ' ')
  showTimePicker.value = false
}

const onNextTimeConfirm = (value: Date) => {
  form.nextFollowUpTime = value.toISOString().slice(0, 16).replace('T', ' ')
  showNextTimePicker.value = false
}

const onNextTypeConfirm = ({ selectedValues }: any) => {
  form.nextFollowUpType = selectedValues[0]
  showNextTypePicker.value = false
}

const onResultConfirm = ({ selectedValues }: any) => {
  form.result = selectedValues[0]
  showResultPicker.value = false
}

const onReminderConfirm = (value: Date) => {
  form.reminderTime = value.toISOString().slice(0, 16).replace('T', ' ')
  showReminderPicker.value = false
}

// 生命周期
onMounted(() => {
  if (!parentId) {
    showToast('缺少家长ID参数')
    router.push('/mobile/parent-center/children')
    return
  }

  fetchParentInfo()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-follow-up-page {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
  padding-bottom: 20px;
}

.parent-info-card {
  margin: var(--spacing-md);
  margin-bottom: 12px;
}

.parent-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.parent-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--van-text-color);
}

.parent-phone {
  font-size: var(--text-sm);
  color: var(--van-text-color-2);
}

.loading-container {
  padding: var(--spacing-md);
}

.follow-up-form {
  .van-cell-group {
    margin: var(--spacing-md) 16px;
  }
}

.submit-section {
  margin: var(--spacing-lg) 16px 16px;
}

:deep(.van-field__label) {
  width: 90px;
}

:deep(.van-cell) {
  padding: var(--spacing-md) 16px;
}

:deep(.van-picker) {
  --van-picker-background-color: var(--van-background-color-light);
}

:deep(.van-date-picker) {
  --van-date-picker-background-color: var(--van-background-color-light);
}
</style>