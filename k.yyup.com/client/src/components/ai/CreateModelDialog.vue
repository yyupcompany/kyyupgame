<template>
  <el-dialog
    v-model="visible"
    title="创建AI模型"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="模型名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入模型名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="显示名称" prop="displayName">
        <el-input
          v-model="form.displayName"
          placeholder="请输入模型显示名称（可选）"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="模型类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择模型类型"
          class="full-width"
        >
          <el-option label="文本生成" value="text-generation" />
          <el-option label="图像识别" value="image-recognition" />
          <el-option label="语音识别" value="speech-recognition" />
          <el-option label="数据分析" value="data-analysis" />
          <el-option label="预测模型" value="prediction" />
        </el-select>
      </el-form-item>

      <el-form-item label="服务提供商" prop="provider">
        <el-select
          v-model="form.provider"
          placeholder="请选择服务提供商"
          class="full-width"
        >
          <el-option label="OpenAI" value="openai" />
          <el-option label="Azure" value="azure" />
          <el-option label="百度文心" value="baidu" />
          <el-option label="阿里通义" value="alibaba" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item label="模型版本" prop="version">
        <el-input
          v-model="form.version"
          placeholder="例如：v1.0.0"
        />
      </el-form-item>

      <el-form-item label="API端点" prop="endpoint">
        <el-input
          v-model="form.endpoint"
          placeholder="请输入API端点URL"
        />
      </el-form-item>

      <el-form-item label="API密钥" prop="apiKey">
        <el-input
          v-model="form.apiKey"
          type="password"
          placeholder="请输入API密钥"
          show-password
        />
      </el-form-item>

      <el-form-item label="模型描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入模型描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="启用状态" prop="enabled">
        <el-switch
          v-model="form.enabled"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>

      <el-form-item label="权重优先级" prop="priority">
        <el-slider
          v-model="form.priority"
          :min="1"
          :max="10"
          show-input
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { createModel } from '@/api/ai-model'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  name: '',
  displayName: '',
  type: '', // modelType
  provider: '',
  version: '', // apiVersion
  endpoint: '', // endpointUrl
  apiKey: '',
  description: '',
  enabled: true, // isActive
  priority: 5,
  modelParameters: {}
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择模型类型', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入模型版本', trigger: 'blur' },
    { pattern: /^v\d+\.\d+\.\d+$/, message: '版本格式应为 v1.0.0', trigger: 'blur' }
  ],
  endpoint: [
    { required: true, message: '请输入API端点', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' },
    { min: 10, message: 'API密钥长度至少10个字符', trigger: 'blur' }
  ]
}

// 监听props变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 重置表单
const resetForm = () => {
  form.name = ''
  form.displayName = ''
  form.type = ''
  form.provider = ''
  form.version = ''
  form.endpoint = ''
  form.apiKey = ''
  form.description = ''
  form.enabled = true
  form.priority = 5
  form.modelParameters = {}
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleClose = () => {
  resetForm()
}

// 取消
const handleCancel = () => {
  visible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 构建API请求数据
        const modelData = {
          name: form.name,
          displayName: form.displayName || form.name,
          provider: form.provider || 'custom',
          modelType: form.type,
          apiVersion: form.version,
          endpointUrl: form.endpoint,
          apiKey: form.apiKey,
          modelParameters: form.modelParameters || {},
          isActive: form.enabled,
          isDefault: false
        }
        
        // 调用真实的API创建模型
        const result = await createModel(modelData)
        
        ElMessage.success('AI模型创建成功')
        emit('success', result)
        visible.value = false
        resetForm()
      } catch (error: any) {
        console.error('创建模型失败:', error)
        ElMessage.error(error.message || '创建失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2xl);
}
.full-width {
  width: 100%;
}
</style>