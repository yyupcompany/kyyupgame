<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    class="simple-form-modal"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-row :gutter="20">
        <el-col
          v-for="field in fields"
          :key="field.prop"
          :span="field.span || 24"
        >
          <el-form-item
            :label="field.label"
            :prop="field.prop"
            :required="field.required"
          >
            <!-- 输入框 -->
            <el-input
              v-if="field.type === 'input'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              clearable
            />
            
            <!-- 选择器 -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              clearable
              class="full-width"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            
            <!-- 数字输入框 -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :min="field.min || 0"
              :max="field.max || 999"
              class="full-width"
            />
            
            <!-- 日期选择器 -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="formData[field.prop]"
              type="date"
              :placeholder="field.placeholder || `请选择${field.label}`"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="full-width"
            />
            
            <!-- 文本域 -->
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.prop]"
              type="textarea"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :rows="field.rows || 3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash-es'

interface Option {
  label: string
  value: any
}

interface Field {
  prop: string
  label: string
  type: 'input' | 'textarea' | 'select' | 'date' | 'number'
  span?: number
  placeholder?: string
  required?: boolean
  options?: Option[]
  rows?: number
  min?: number
  max?: number
}

interface Props {
  modelValue: boolean
  title: string
  data?: any
  fields?: Field[]
  rules?: any
  width?: string
  loading?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  fields: () => [],
  rules: () => ({}),
  width: '600px',
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: any]
  cancel: []
}>()

const formRef = ref()
const formData = ref<any>({})

// 对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单规则
const formRules = computed(() => {
  const rules: any = { ...props.rules }
  
  // 根据字段配置自动生成必填规则
  props.fields.forEach(field => {
    if (field.required && !rules[field.prop]) {
      rules[field.prop] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' }
      ]
    }
  })
  
  return rules
})

// 初始化表单数据
const initFormData = () => {
  if (props.data) {
    formData.value = cloneDeep(props.data)
  } else {
    formData.value = {}
    props.fields.forEach(field => {
      formData.value[field.prop] = ''
    })
  }
}

// 确认处理
const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('confirm', cloneDeep(formData.value))
    visible.value = false
  } catch (error) {
    ElMessage.error('请检查表单输入')
  }
}

// 取消处理
const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

// 监听数据变化
watch(() => props.data, () => {
  initFormData()
}, { deep: true, immediate: true })

// 监听对话框显示状态
watch(visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
})
</script>

<style scoped lang="scss">
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.simple-form-modal :deep(.el-form-item) {
  margin-bottom: var(--spacing-xl);
}

.full-width {
  width: 100%;
}
</style>