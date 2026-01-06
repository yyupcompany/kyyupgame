<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑通知' : '新建通知'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="通知标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入通知标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="通知类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择通知类型" class="full-width">
          <el-option label="活动提醒" value="activity_reminder" />
          <el-option label="报名通知" value="registration_notice" />
          <el-option label="活动取消" value="activity_cancel" />
          <el-option label="活动变更" value="activity_change" />
          <el-option label="系统通知" value="system_notice" />
        </el-select>
      </el-form-item>

      <el-form-item label="接收对象" prop="recipients">
        <el-select
          v-model="form.recipients"
          multiple
          placeholder="请选择接收对象"
          class="full-width"
        >
          <el-option label="所有家长" value="all_parents" />
          <el-option label="已报名家长" value="registered_parents" />
          <el-option label="待审核家长" value="pending_parents" />
          <el-option label="所有教师" value="all_teachers" />
          <el-option label="管理员" value="admins" />
        </el-select>
      </el-form-item>

      <el-form-item label="通知内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="请输入通知内容"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="发送方式" prop="sendMethod">
        <el-checkbox-group v-model="form.sendMethod">
          <el-checkbox label="system">站内消息</el-checkbox>
          <el-checkbox label="sms">短信通知</el-checkbox>
          <el-checkbox label="email">邮件通知</el-checkbox>
          <el-checkbox label="wechat">微信通知</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="发送时间" prop="sendTime">
        <el-radio-group v-model="form.sendTimeType">
          <el-radio label="now">立即发送</el-radio>
          <el-radio label="scheduled">定时发送</el-radio>
        </el-radio-group>
        <el-date-picker
          v-if="form.sendTimeType === 'scheduled'"
          v-model="form.sendTime"
          type="datetime"
          placeholder="选择发送时间"
          style="width: 100%; margin-top: var(--spacing-2xl)"
        />
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <el-select v-model="form.priority" placeholder="请选择优先级">
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
          <el-option label="紧急" value="urgent" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '发送' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

interface NotificationForm {
  id?: string
  title: string
  type: string
  recipients: string[]
  content: string
  sendMethod: string[]
  sendTimeType: string
  sendTime?: Date
  priority: string
}

const props = defineProps<{
  modelValue: boolean
  data?: NotificationForm
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: NotificationForm]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.data?.id)
const loading = ref(false)
const formRef = ref()

const form = reactive<NotificationForm>({
  title: '',
  type: '',
  recipients: [],
  content: '',
  sendMethod: ['system'],
  sendTimeType: 'now',
  priority: 'medium'
})

const rules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ],
  recipients: [
    { required: true, message: '请选择接收对象', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' }
  ],
  sendMethod: [
    { required: true, message: '请选择发送方式', trigger: 'change' }
  ]
}

watch(() => props.data, (newData) => {
  if (newData) {
    Object.assign(form, newData)
  } else {
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  Object.assign(form, {
    title: '',
    type: '',
    recipients: [],
    content: '',
    sendMethod: ['system'],
    sendTimeType: 'now',
    sendTime: undefined,
    priority: 'medium'
  })
  formRef.value?.clearValidate()
}

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    loading.value = true
    
    const submitData = { ...form }
    if (submitData.sendTimeType === 'now') {
      delete submitData.sendTime
    }
    
    emit('submit', submitData)
    ElMessage.success(isEdit.value ? '通知更新成功' : '通知发送成功')
    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
.full-width {
  width: 100%;
}
</style>
