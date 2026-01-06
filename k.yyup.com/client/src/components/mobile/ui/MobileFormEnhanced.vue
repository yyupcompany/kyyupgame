<template>
  <div class="mobile-form-enhanced" :class="[`form-${layout}`, { 'form-loading': loading }]">
    <!-- 表单头部 -->
    <div v-if="showHeader || title || description" class="form-header">
      <slot name="header">
        <h2 v-if="title" class="form-title">{{ title }}</h2>
        <p v-if="description" class="form-description">{{ description }}</p>
      </slot>
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="form-loading-overlay">
      <MobileLoading
        type="spinner"
        :text="loadingText"
        :show-overlay="false"
        size="medium"
      />
    </div>

    <!-- 表单内容 -->
    <van-form
      ref="formRef"
      :validate-first="validateFirst"
      :scroll-to-error="scrollToError"
      :show-error="showError"
      @submit="handleSubmit"
      @failed="handleFailed"
      @validate="handleValidate"
    >
      <div class="form-content" :style="contentStyle">
        <!-- 动态表单组 -->
        <template v-for="(group, groupIndex) in formGroups" :key="groupIndex">
          <div
            v-if="!group.hidden"
            class="form-group"
            :class="[
              `group-${group.type || 'default'}`,
              { 'group-full': group.fullWidth }
            ]"
          >
            <!-- 组标题 -->
            <div
              v-if="group.title"
              class="group-title"
              @click="handleGroupClick(group, groupIndex)"
            >
              <van-icon
                v-if="group.collapsible"
                :name="group.collapsed ? 'arrow' : 'arrow-down'"
                class="group-toggle"
              />
              <span>{{ group.title }}</span>
              <span v-if="group.required" class="required-mark">*</span>
            </div>

            <!-- 组描述 -->
            <p v-if="group.description && !group.collapsed" class="group-description">
              {{ group.description }}
            </p>

            <!-- 组内容 -->
            <div v-show="!group.collapsed" class="group-content">
              <!-- 字段组 -->
              <van-cell-group
                v-if="group.type === 'inset'"
                inset
                :class="group.className"
              >
                <FormField
                  v-for="field in group.fields"
                  :key="field.name"
                  :field="field"
                  :form-data="formData"
                  :disabled="disabled || field.disabled"
                  :readonly="readonly || field.readonly"
                  @update="handleFieldUpdate"
                />
              </van-cell-group>

              <van-cell-group
                v-else-if="group.type === 'card'"
                :class="['form-group-card', group.className]"
              >
                <FormField
                  v-for="field in group.fields"
                  :key="field.name"
                  :field="field"
                  :form-data="formData"
                  :disabled="disabled || field.disabled"
                  :readonly="readonly || field.readonly"
                  @update="handleFieldUpdate"
                />
              </van-cell-group>

              <!-- 默认字段组 -->
              <template v-else>
                <FormField
                  v-for="field in group.fields"
                  :key="field.name"
                  :field="field"
                  :form-data="formData"
                  :disabled="disabled || field.disabled"
                  :readonly="readonly || field.readonly"
                  @update="handleFieldUpdate"
                />
              </template>
            </div>
          </div>
        </template>

        <!-- 插槽内容 -->
        <slot></slot>
      </div>

      <!-- 表单底部 -->
      <div v-if="showFooter" class="form-footer">
        <slot name="footer">
          <div class="form-actions">
            <van-button
              v-if="showCancel"
              class="form-action action-secondary"
              :disabled="disabled || loading"
              @click="handleCancel"
            >
              {{ cancelText }}
            </van-button>

            <van-button
              class="form-action action-primary"
              type="primary"
              native-type="submit"
              :loading="submitting"
              :disabled="disabled || loading"
            >
              {{ submitText }}
            </van-button>
          </div>
        </slot>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { showToast, showNotify } from 'vant'
import MobileLoading from './MobileLoading.vue'
import FormField from './FormField.vue'

// 字段类型定义
export interface FormField {
  name: string
  label: string
  type: 'text' | 'password' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'switch' | 'date' | 'datetime' | 'time' | 'picker' | 'upload' | 'rate' | 'slider'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  rules?: Array<{
    required?: boolean
    pattern?: RegExp
    min?: number
    max?: number
    validator?: (value: any) => boolean | string
    message?: string
  }>
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  defaultValue?: any
  className?: string
  // 特定类型属性
  rows?: number // textarea
  maxlength?: number // text/textarea
  showWordLimit?: boolean // text/textarea
  format?: string // date
  minDate?: Date // date
  maxDate?: Date // date
  multiple?: boolean // select/upload
  maxCount?: number // upload
  accept?: string // upload
  min?: number // number/slider
  max?: number // number/slider
  step?: number // number
  precision?: number // number
}

// 表单组类型定义
export interface FormGroup {
  title?: string
  description?: string
  type?: 'default' | 'inset' | 'card'
  fields: FormField[]
  fullWidth?: boolean
  collapsible?: boolean
  collapsed?: boolean
  hidden?: boolean
  className?: string
}

interface Props {
  // 基础配置
  modelValue: Record<string, any>
  title?: string
  description?: string
  layout?: 'vertical' | 'horizontal' | 'inline'
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  loadingText?: string

  // 表单配置
  formGroups?: FormGroup[]
  validateFirst?: boolean
  scrollToError?: boolean
  showError?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showCancel?: boolean
  submitText?: string
  cancelText?: string

  // 样式配置
  contentStyle?: Record<string, any>
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  title: '',
  description: '',
  layout: 'vertical',
  disabled: false,
  readonly: false,
  loading: false,
  loadingText: '提交中...',
  formGroups: () => [],
  validateFirst: false,
  scrollToError: true,
  showError: true,
  showHeader: true,
  showFooter: true,
  showCancel: false,
  submitText: '提交',
  cancelText: '取消',
  contentStyle: () => ({}),
  className: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  submit: [value: Record<string, any>]
  cancel: []
  fieldChange: [fieldName: string, value: any, field: FormField]
  groupToggle: [groupIndex: number, group: FormGroup]
  validate: [valid: boolean, errors: Record<string, string>]
  failed: [errors: Record<string, string>]
}>()

// 响应式状态
const formRef = ref()
const formData = reactive({ ...props.modelValue })
const submitting = ref(false)

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  Object.assign(formData, newVal)
}, { deep: true })

// 监听内部数据变化
watch(formData, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })

// 初始化表单数据
const initializeFormData = () => {
  props.formGroups.forEach(group => {
    group.fields.forEach(field => {
      if (formData[field.name] === undefined && field.defaultValue !== undefined) {
        formData[field.name] = field.defaultValue
      }
    })
  })
}

// 初始化
initializeFormData()

// 字段更新处理
const handleFieldUpdate = (fieldName: string, value: any, field: FormField) => {
  formData[fieldName] = value
  emit('fieldChange', fieldName, value, field)
}

// 组点击处理
const handleGroupClick = (group: FormGroup, groupIndex: number) => {
  if (group.collapsible) {
    group.collapsed = !group.collapsed
    emit('groupToggle', groupIndex, group)
  }
}

// 表单提交
const handleSubmit = async (values: Record<string, any>) => {
  if (submitting.value) return

  try {
    submitting.value = true
    emit('submit', { ...values })
  } catch (error: any) {
    showNotify({
      type: 'danger',
      message: error.message || '提交失败'
    })
  } finally {
    // 延迟重置提交状态
    setTimeout(() => {
      submitting.value = false
    }, 500)
  }
}

// 表单验证失败
const handleFailed = (errorInfo: any) => {
  const errors: Record<string, string> = {}

  if (errorInfo.errors) {
    errorInfo.errors.forEach((error: any) => {
      errors[error.name] = error.message
    })
  }

  emit('failed', errors)

  if (props.showError) {
    showToast({
      type: 'fail',
      message: '请检查表单填写是否正确'
    })
  }
}

// 表单验证
const handleValidate = (valid: boolean, errors: Record<string, string>) => {
  emit('validate', valid, errors)
}

// 取消
const handleCancel = () => {
  emit('cancel')
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetValidation()
  initializeFormData()
}

// 验证表单
const validateForm = async (): Promise<boolean> => {
  try {
    await formRef.value?.validate()
    return true
  } catch (error) {
    return false
  }
}

// 获取字段值
const getFieldValue = (fieldName: string) => {
  return formData[fieldName]
}

// 设置字段值
const setFieldValue = (fieldName: string, value: any) => {
  formData[fieldName] = value
}

// 设置字段错误
const setFieldError = (fieldName: string, message: string) => {
  formRef.value?.setErrors([{ name: fieldName, message }])
}

// 清除字段错误
const clearFieldError = (fieldName: string) => {
  formRef.value?.resetValidation(fieldName)
}

// 暴露方法
defineExpose({
  formRef,
  formData,
  resetForm,
  validateForm,
  getFieldValue,
  setFieldValue,
  setFieldError,
  clearFieldError
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
@import '@/styles/mobile-form-enhancements.scss';

.mobile-form-enhanced {
  position: relative;

  &.form-loading {
    pointer-events: none;
    user-select: none;
  }

  .form-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    backdrop-filter: blur(2px);
  }

  // 布局样式
  &.form-horizontal {
    .form-content {
      display: flex;
      flex-direction: column;
      gap: var(--mobile-gap);

      .form-group {
        .group-content {
          display: flex;
          flex-wrap: wrap;
          gap: var(--mobile-gap);

          :deep(.van-field) {
            flex: 1;
            min-width: 200px;
          }
        }
      }
    }
  }

  &.form-inline {
    .form-content {
      .form-group {
        .group-content {
          display: flex;
          align-items: flex-end;
          gap: var(--mobile-gap-sm);
          flex-wrap: wrap;

          :deep(.van-field) {
            flex: 1;
            min-width: 120px;
          }

          :deep(.van-button) {
            flex-shrink: 0;
          }
        }
      }
    }
  }

  // 表单组样式
  .form-group {
    &.group-default {
      margin-bottom: var(--mobile-gap-lg);
    }

    &.group-inset {
      margin-bottom: var(--mobile-gap-lg);
    }

    &.group-card {
      margin-bottom: var(--mobile-gap-lg);
    }

    &.group-full {
      grid-column: 1 / -1;
    }

    .group-title {
      display: flex;
      align-items: center;
      gap: var(--mobile-gap-xs);
      cursor: default;
      user-select: none;

      .group-toggle {
        transition: transform var(--mobile-transition-fast) var(--transition-timing-ease);
      }

      &:hover {
        .group-toggle {
          color: var(--primary-color);
        }
      }
    }

    .group-content {
      margin-top: var(--mobile-gap);
    }
  }

  // 响应式适配
  @media (max-width: 479px) {
    .form-content {
      .form-group {
        margin-bottom: var(--mobile-gap);

        &.group-full {
          margin-bottom: var(--mobile-gap-lg);
        }
      }
    }

    .form-footer {
      .form-actions {
        flex-direction: column;

        .form-action {
          min-height: 48px;
        }
      }
    }
  }

  @media (min-width: 768px) {
    &.form-horizontal {
      .form-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--mobile-gap-xl);
        align-items: start;

        .form-group {
          margin-bottom: 0;
        }
      }
    }
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .mobile-form-enhanced {
    .form-loading-overlay {
      background: rgba(0, 0, 0, 0.8);
    }
  }
}
</style>