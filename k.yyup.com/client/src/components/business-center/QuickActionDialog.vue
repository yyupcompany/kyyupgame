<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="quick-action-form"
    >
      <!-- 动态表单字段 -->
      <el-form-item
        v-for="field in formFields"
        :key="field.prop"
        :label="field.label"
        :prop="field.prop"
      >
        <!-- 文本输入 -->
        <el-input
          v-if="field.type === 'text'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder"
          clearable
        />
        
        <!-- 文本域 -->
        <el-input
          v-else-if="field.type === 'textarea'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder"
          type="textarea"
          :rows="3"
        />
        
        <!-- 数字输入 -->
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.prop]"
          :min="field.min || 0"
          :max="field.max"
          :placeholder="field.placeholder"
          class="full-width"
        />
        
        <!-- 日期选择 -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.prop]"
          type="date"
          :placeholder="field.placeholder"
          class="full-width"
          value-format="YYYY-MM-DD"
        />
        
        <!-- 日期时间选择 -->
        <el-date-picker
          v-else-if="field.type === 'datetime'"
          v-model="formData[field.prop]"
          type="datetime"
          :placeholder="field.placeholder"
          class="full-width"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
        
        <!-- 下拉选择 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder"
          class="full-width"
          clearable
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

interface FormField {
  prop: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select'
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  options?: Array<{ label: string; value: any }>
}

interface Props {
  visible: boolean
  title: string
  fields: FormField[]
  onSubmit: (data: any) => Promise<void>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const dialogTitle = computed(() => props.title)
const formFields = computed(() => props.fields)

const formRef = ref<FormInstance>()
const formData = ref<Record<string, any>>({})
const submitting = ref(false)

// 动态生成表单验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  props.fields.forEach(field => {
    if (field.required) {
      rules[field.prop] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' }
      ]
    }
  })
  return rules
})

// 监听对话框打开，初始化表单数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 初始化表单数据
    const initialData: Record<string, any> = {}
    props.fields.forEach(field => {
      initialData[field.prop] = field.type === 'number' ? 0 : ''
    })
    formData.value = initialData
    
    // 重置表单验证
    formRef.value?.clearValidate()
  }
})

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
  formData.value = {}
  formRef.value?.resetFields()
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 验证表单
    await formRef.value.validate()
    
    submitting.value = true
    
    // 调用父组件传入的提交函数
    await props.onSubmit(formData.value)
    
    ElMessage.success('操作成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('表单提交失败:', error)
    if (error !== false) { // 验证失败时error为false
      ElMessage.error('操作失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";

.quick-action-form {
  padding: var(--spacing-xl) 0;

  :deep(.el-form-item) {
    margin-bottom: var(--spacing-xl);
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-picker) {
    width: 100%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.full-width {
  width: 100%;
}
</style>

