<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :top="top"
    :modal="modal"
    :lock-scroll="lockScroll"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    class="form-modal"
  >
    <!-- 对话框内容 -->
    <div class="modal-content">
      <!-- 表单区域 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-width="labelWidth"
        :label-position="labelPosition"
        :size="size"
        :disabled="loading || readonly"
        @submit.prevent
      >
        <el-scrollbar :height="scrollHeight" v-if="scrollable">
          <div class="form-content">
            <slot 
              name="form" 
              :data="formData" 
              :rules="formRules"
              :loading="loading"
              :readonly="readonly"
            >
              <!-- 默认表单字段 -->
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
                      :placeholder="field.placeholder"
                      :disabled="field.disabled"
                      :readonly="readonly"
                      :maxlength="field.maxlength"
                      :show-word-limit="field.showWordLimit"
                      clearable
                    />
                    
                    <!-- 文本域 -->
                    <el-input
                      v-else-if="field.type === 'textarea'"
                      v-model="formData[field.prop]"
                      type="textarea"
                      :placeholder="field.placeholder"
                      :disabled="field.disabled"
                      :readonly="readonly"
                      :rows="field.rows || 3"
                      :maxlength="field.maxlength"
                      :show-word-limit="field.showWordLimit"
                    />
                    
                    <!-- 选择器 -->
                    <el-select
                      v-else-if="field.type === 'select'"
                      v-model="formData[field.prop]"
                      :placeholder="field.placeholder"
                      :disabled="field.disabled"
                      :multiple="field.multiple"
                      :clearable="field.clearable !== false"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in field.options"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                        :disabled="option.disabled"
                      />
                    </el-select>
                    
                    <!-- 日期选择器 -->
                    <el-date-picker
                      v-else-if="field.type === 'date'"
                      v-model="formData[field.prop]"
                      :type="field.dateType || 'date'"
                      :placeholder="field.placeholder"
                      :disabled="field.disabled"
                      :readonly="readonly"
                      :format="field.format"
                      :value-format="field.valueFormat"
                      style="width: 100%"
                    />
                    
                    <!-- 数字输入框 -->
                    <el-input-number
                      v-else-if="field.type === 'number'"
                      v-model="formData[field.prop]"
                      :placeholder="field.placeholder"
                      :disabled="field.disabled"
                      :readonly="readonly"
                      :min="field.min"
                      :max="field.max"
                      :step="field.step"
                      :precision="field.precision"
                      style="width: 100%"
                    />
                    
                    <!-- 开关 -->
                    <el-switch
                      v-else-if="field.type === 'switch'"
                      v-model="formData[field.prop]"
                      :disabled="field.disabled"
                      :active-text="field.activeText"
                      :inactive-text="field.inactiveText"
                    />
                    
                    <!-- 单选框组 -->
                    <el-radio-group
                      v-else-if="field.type === 'radio'"
                      v-model="formData[field.prop]"
                      :disabled="field.disabled"
                    >
                      <el-radio
                        v-for="option in field.options"
                        :key="option.value"
                        :value="option.value"
                        :disabled="option.disabled"
                      >
                        {{ option.label }}
                      </el-radio>
                    </el-radio-group>
                    
                    <!-- 复选框组 -->
                    <el-checkbox-group
                      v-else-if="field.type === 'checkbox'"
                      v-model="formData[field.prop]"
                      :disabled="field.disabled"
                    >
                      <el-checkbox
                        v-for="option in field.options"
                        :key="option.value"
                        :value="option.value"
                        :disabled="option.disabled"
                      >
                        {{ option.label }}
                      </el-checkbox>
                    </el-checkbox-group>
                    
                    <!-- 自定义字段 -->
                    <slot 
                      v-else
                      :name="`field-${field.prop}`"
                      :field="field"
                      :value="formData[field.prop]"
                      :data="formData"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </slot>
          </div>
        </el-scrollbar>
        
        <div v-else class="form-content">
          <slot 
            name="form" 
            :data="formData" 
            :rules="formRules"
            :loading="loading"
            :readonly="readonly"
          />
        </div>
      </el-form>
    </div>

    <!-- 对话框底部 -->
    <template #footer>
      <slot name="footer" :data="formData" :loading="loading">
        <div class="modal-footer">
          <el-button @click="handleCancel" :disabled="loading">
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="handleConfirm"
            :loading="loading"
            :disabled="readonly"
          >
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
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
  disabled?: boolean
}

interface Field {
  prop: string
  label: string
  type: 'input' | 'textarea' | 'select' | 'date' | 'number' | 'switch' | 'radio' | 'checkbox' | 'custom'
  span?: number
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Option[]
  rows?: number
  maxlength?: number
  showWordLimit?: boolean
  multiple?: boolean
  clearable?: boolean
  dateType?: string
  format?: string
  valueFormat?: string
  min?: number
  max?: number
  step?: number
  precision?: number
  activeText?: string
  inactiveText?: string
}

interface Props {
  modelValue: boolean
  title: string
  data?: any
  fields?: Field[]
  rules?: any
  width?: string | number
  fullscreen?: boolean
  top?: string
  modal?: boolean
  lockScroll?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  destroyOnClose?: boolean
  appendToBody?: boolean
  loading?: boolean
  readonly?: boolean
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  size?: 'large' | 'default' | 'small'
  scrollable?: boolean
  scrollHeight?: string
  confirmText?: string
  validateOnClose?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  fields: () => [],
  rules: () => ({}),
  width: '600px',
  fullscreen: false,
  top: '15vh',
  modal: true,
  lockScroll: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  showClose: true,
  destroyOnClose: false,
  appendToBody: false,
  loading: false,
  readonly: false,
  labelWidth: '100px',
  labelPosition: 'right',
  size: 'default',
  scrollable: true,
  scrollHeight: '400px',
  confirmText: '确定',
  validateOnClose: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: any]
  cancel: []
  close: []
  'before-close': [done: () => void]
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
      if (field.type === 'checkbox') {
        formData.value[field.prop] = []
      } else if (field.type === 'switch') {
        formData.value[field.prop] = false
      } else {
        formData.value[field.prop] = ''
      }
    })
  }
}

// 确认处理
const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('confirm', cloneDeep(formData.value))
  } catch (error) {
    ElMessage.error('请检查表单输入')
  }
}

// 取消处理
const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

// 关闭前处理
const handleBeforeClose = (done: () => void) => {
  if (props.validateOnClose && formRef.value) {
    formRef.value.validate((valid: boolean) => {
      if (valid) {
        emit('before-close', done)
      } else {
        ElMessage.error('请完善表单信息后再关闭')
      }
    })
  } else {
    emit('before-close', done)
  }
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
  } else {
    emit('close')
  }
})

// 暴露方法
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
  getFormData: () => cloneDeep(formData.value),
  setFormData: (data: any) => {
    formData.value = cloneDeep(data)
  }
})
</script>

<style scoped lang="scss">
.form-modal {
  .modal-content {
    .form-content {
      padding: var(--spacing-sm) var(--text-sm);

      // 表单项间距优化
      :deep(.el-form-item) {
        margin-bottom: var(--text-3xl);

        .el-form-item__label {
          padding-right: var(--text-lg);
          font-weight: 500;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .el-form-item__content {
          line-height: 1.6;

          // 输入框样式优化
          .el-input,
          .el-select,
          .el-date-picker {
            .el-input__inner,
            .el-input__wrapper {
              padding: var(--text-sm) var(--text-lg);
              font-size: var(--text-base);
              line-height: 1.5;
            }
          }

          // 文本域样式优化
          .el-textarea {
            .el-textarea__inner {
              padding: var(--text-sm) var(--text-lg);
              font-size: var(--text-base);
              line-height: 1.6;
            }
          }

          // 选择器下拉项间距
          .el-select-dropdown {
            .el-select-dropdown__item {
              padding: var(--spacing-2xl) var(--text-lg);
              line-height: 1.5;
            }
          }
        }
      }

      // 行间距优化
      .el-row {
        margin-bottom: 0;

        .el-col {
          padding-bottom: var(--spacing-sm);
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--text-lg);
    padding-top: var(--text-2xl);
    border-top: var(--border-width-base) solid var(--border-color);
    margin-top: var(--text-2xl);

    .el-button {
      padding: var(--spacing-2xl) var(--text-3xl);
      font-size: var(--text-base);
      border-radius: var(--radius-md);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }
  
  :deep(.el-dialog__body) {
    padding: var(--spacing-4xl);
  }
}
</style>
