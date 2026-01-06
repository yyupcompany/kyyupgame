<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加跟进记录"
    width="var(--dialog-width-md)"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="var(--input-width-xs)"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="沟通方式" prop="type">
        <el-select v-model="form.type" placeholder="请选择沟通方式" style="width: 100%">
          <el-option label="电话沟通" value="phone" />
          <el-option label="到访面谈" value="visit" />
          <el-option label="短信联系" value="message" />
          <el-option label="微信沟通" value="wechat" />
          <el-option label="邮件联系" value="email" />
        </el-select>
      </el-form-item>

      <el-form-item label="沟通结果" prop="result">
        <el-select v-model="form.result" placeholder="请选择沟通结果" style="width: 100%">
          <el-option label="意向强烈" value="interested" />
          <el-option label="考虑中" value="considering" />
          <el-option label="暂无意向" value="not_interested" />
          <el-option label="已预约" value="scheduled" />
          <el-option label="已到访" value="visited" />
          <el-option label="已转化" value="converted" />
          <el-option label="联系不上" value="unreachable" />
        </el-select>
      </el-form-item>

      <el-form-item label="沟通内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请详细描述沟通内容，包括客户反馈、关注点、需求变化等"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="下一步计划" prop="nextAction">
        <el-input
          v-model="form.nextAction"
          type="textarea"
          :rows="2"
          placeholder="请描述下一步的行动计划，如下次联系时间、准备材料等"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="下次联系时间">
        <el-date-picker
          v-model="form.nextContactTime"
          type="datetime"
          placeholder="请选择下次联系时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="重要程度">
        <el-radio-group v-model="form.importance">
          <el-radio label="high">重要</el-radio>
          <el-radio label="medium">一般</el-radio>
          <el-radio label="low">较低</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="相关文件">
        <el-upload
          v-model:file-list="form.files"
          action="#"
          :auto-upload="false"
          multiple
          :limit="5"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        >
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持上传pdf、word、图片等文件，单个文件不超过10MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        保存记录
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadUserFile } from 'element-plus'

interface Props {
  modelValue: boolean
  appointment: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  type: '',
  result: '',
  content: '',
  nextAction: '',
  nextContactTime: '',
  importance: 'medium',
  files: [] as UploadUserFile[]
})

const rules: FormRules = {
  type: [
    { required: true, message: '请选择沟通方式', trigger: 'change' }
  ],
  result: [
    { required: true, message: '请选择沟通结果', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入沟通内容', trigger: 'blur' },
    { min: 10, message: '沟通内容至少10个字符', trigger: 'blur' }
  ]
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  Object.assign(form, {
    type: '',
    result: '',
    content: '',
    nextAction: '',
    nextContactTime: '',
    importance: 'medium',
    files: []
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 构建提交数据
    const followUpData = {
      appointmentId: props.appointment?.id,
      type: form.type,
      result: form.result,
      content: form.content,
      nextAction: form.nextAction,
      nextContactTime: form.nextContactTime,
      importance: form.importance,
      files: form.files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.raw?.type
      }))
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('保存跟进记录:', followUpData)

    ElMessage.success('跟进记录保存成功')
    dialogVisible.value = false
    emit('refresh')

    // 重置表单
    resetForm()
  } catch (error) {
    console.error('保存跟进记录失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

:deep(.el-upload__tip) {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}
</style>
