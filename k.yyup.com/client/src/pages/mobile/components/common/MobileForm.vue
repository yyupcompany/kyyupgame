<template>
  <div class="mobile-form">
    <van-form @submit="handleSubmit">
      <div class="form-header" v-if="$slots.header">
        <slot name="header"></slot>
      </div>

      <div class="form-content">
        <slot></slot>
      </div>

      <div class="form-footer" v-if="showFooter">
        <van-button
          v-if="showCancel"
          type="default"
          size="large"
          @click="handleCancel"
          class="btn-cancel"
        >
          {{ cancelText }}
        </van-button>

        <van-button
          type="primary"
          size="large"
          native-type="submit"
          :loading="submitting"
          :disabled="disabled"
          class="btn-submit"
        >
          {{ submitText }}
        </van-button>
      </div>
    </van-form>

    <!-- 表单验证错误提示 -->
    <van-notify v-model:show="showError" type="danger">
      {{ errorMessage }}
    </van-notify>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showNotify } from 'vant'

interface Props {
  showFooter?: boolean
  showCancel?: boolean
  submitText?: string
  cancelText?: string
  disabled?: boolean
  validateOnSubmit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFooter: true,
  showCancel: false,
  submitText: '提交',
  cancelText: '取消',
  disabled: false,
  validateOnSubmit: true
})

const emit = defineEmits<{
  submit: [values: Record<string, any>]
  cancel: []
}>()

const submitting = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const handleSubmit = async (values: Record<string, any>) => {
  if (submitting.value) return

  try {
    submitting.value = true

    // 表单验证
    if (props.validateOnSubmit) {
      const isValid = await validateForm(values)
      if (!isValid) {
        submitting.value = false
        return
      }
    }

    emit('submit', values)
  } catch (error: any) {
    errorMessage.value = error.message || '提交失败'
    showError.value = true
  } finally {
    // 延迟取消 loading，避免按钮闪烁
    setTimeout(() => {
      submitting.value = false
    }, 500)
  }
}

const handleCancel = () => {
  emit('cancel')
}

const validateForm = async (values: Record<string, any>): Promise<boolean> => {
  // 这里可以添加表单验证逻辑
  // 例如：检查必填字段、验证格式等
  return true
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-form {
  .form-header {
    padding: var(--spacing-md);
    background-color: var(--bg-card);
    border-bottom: 1px solid #ebedf0;
  }

  .form-content {
    padding: var(--spacing-md);
  }

  .form-footer {
    position: sticky;
    bottom: 0;
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-card);
    border-top: 1px solid #ebedf0;

    .btn-cancel,
    .btn-submit {
      flex: 1;
    }
  }
}
</style>
