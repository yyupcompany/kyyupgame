<template>
  <!-- Dialog 模式 -->
  <van-dialog
    v-if="type === 'dialog'"
    v-model:show="dialogVisible"
    :title="title"
    :width="width"
    :show-confirm-button="showConfirmButton"
    :show-cancel-button="showCancelButton"
    :confirm-button-text="confirmButtonText"
    :cancel-button-text="cancelButtonText"
    :confirm-button-disabled="confirmButtonDisabled"
    :close-on-click-overlay="closeOnClickOverlay"
    :before-close="handleBeforeClose"
    :class="dialogClass"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <template v-if="$slots.title" #title>
      <slot name="title"></slot>
    </template>

    <div class="base-dialog-content" :class="contentClass">
      <!-- 头部额外内容 -->
      <div v-if="$slots.header" class="dialog-header">
        <slot name="header"></slot>
      </div>

      <!-- 主要内容 -->
      <div class="dialog-body" :style="bodyStyle">
        <slot></slot>
      </div>

      <!-- 底部额外内容 -->
      <div v-if="$slots.footer" class="dialog-footer">
        <slot name="footer"></slot>
      </div>
    </div>

    <template v-if="$slots.confirmButton" #confirmButton>
      <slot name="confirmButton"></slot>
    </template>

    <template v-if="$slots.cancelButton" #cancelButton>
      <slot name="cancelButton"></slot>
    </template>
  </van-dialog>

  <!-- Popup 模式 -->
  <van-popup
    v-else-if="type === 'popup'"
    v-model:show="dialogVisible"
    :position="position"
    :style="popupStyle"
    :round="round"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    :close-on-click-overlay="closeOnClickOverlay"
    :before-close="handleBeforeClose"
    :class="popupClass"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <div class="base-popup-content" :class="contentClass">
      <!-- 头部 -->
      <div v-if="showHeader || $slots.header || title" class="popup-header">
        <slot name="header">
          <van-nav-bar
            :title="title"
            :left-text="cancelButtonText"
            :right-text="confirmButtonText"
            :left-arrow="showBackArrow"
            :loading="loading"
            @click-left="handleCancel"
            @click-right="handleConfirm"
          >
            <template v-if="$slots.navLeft" #left>
              <slot name="navLeft"></slot>
            </template>
            <template v-if="$slots.navRight" #right>
              <slot name="navRight"></slot>
            </template>
          </van-nav-bar>
        </slot>
      </div>

      <!-- 主要内容 -->
      <div class="popup-body" :style="bodyStyle">
        <slot></slot>
      </div>

      <!-- 底部操作栏 -->
      <div v-if="showActions || $slots.footer" class="popup-footer">
        <slot name="footer">
          <div class="default-actions">
            <van-button
              v-if="showCancelButton"
              size="large"
              @click="handleCancel"
              :disabled="loading"
            >
              {{ cancelButtonText }}
            </van-button>
            <van-button
              v-if="showConfirmButton"
              type="primary"
              size="large"
              :loading="loading"
              :disabled="confirmButtonDisabled"
              @click="handleConfirm"
            >
              {{ confirmButtonText }}
            </van-button>
          </div>
        </slot>
      </div>
    </div>
  </van-popup>

  <!-- ActionSheet 模式 -->
  <van-action-sheet
    v-else-if="type === 'actionsheet'"
    v-model:show="dialogVisible"
    :title="title"
    :actions="actions"
    :cancel-text="cancelButtonText"
    :close-on-click-action="closeOnClickAction"
    :close-on-click-overlay="closeOnClickOverlay"
    :description="description"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    @select="handleActionSelect"
    @cancel="handleCancel"
  >
    <template v-if="$slots.content" #default>
      <slot name="content"></slot>
    </template>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

// Dialog 类型
type DialogType = 'dialog' | 'popup' | 'actionsheet'
type PopupPosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

// ActionSheet Action 类型
interface ActionItem {
  name: string
  value?: any
  subname?: string
  loading?: boolean
  disabled?: boolean
  color?: string
  className?: string
}

interface Props {
  // 基础配置
  modelValue: boolean
  type?: DialogType
  title?: string

  // Dialog 专用
  width?: string | number
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonDisabled?: boolean

  // Popup 专用
  position?: PopupPosition
  height?: string | number
  maxHeight?: string | number
  round?: boolean
  safeAreaInsetBottom?: boolean
  showHeader?: boolean
  showBackArrow?: boolean
  showActions?: boolean

  // ActionSheet 专用
  actions?: ActionItem[]
  description?: string
  closeOnClickAction?: boolean

  // 通用配置
  loading?: boolean
  closeOnClickOverlay?: boolean
  closeable?: boolean
  destroyOnClose?: boolean
  bodyStyle?: Record<string, any>

  // 样式类
  dialogClass?: string
  popupClass?: string
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: 'dialog',
  title: '',
  width: '85%',
  showConfirmButton: true,
  showCancelButton: true,
  confirmButtonText: '确认',
  cancelButtonText: '取消',
  confirmButtonDisabled: false,
  position: 'bottom',
  height: 'auto',
  maxHeight: '80vh',
  round: true,
  safeAreaInsetBottom: true,
  showHeader: true,
  showBackArrow: false,
  showActions: false,
  actions: () => [],
  description: '',
  closeOnClickAction: true,
  closeOnClickOverlay: true,
  closeable: true,
  destroyOnClose: false,
  loading: false,
  dialogClass: '',
  popupClass: '',
  contentClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  close: []
  opened: []
  closed: []
  'before-close': [action: string, done: () => void]
  'action-select': [action: ActionItem, index: number]
}>()

// 内部状态
const dialogVisible = ref(props.modelValue)

// 监听外部变化
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
})

// 监听内部变化
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 计算样式
const popupStyle = computed(() => {
  const style: Record<string, any> = {}

  if (props.height && props.height !== 'auto') {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }

  return style
})

// 事件处理
const handleConfirm = () => {
  if (props.loading) return
  emit('confirm')
}

const handleCancel = () => {
  if (props.loading) return
  emit('cancel')
  dialogVisible.value = false
}

const handleClose = () => {
  emit('close')
}

const handleOpened = () => {
  emit('opened')
}

const handleClosed = () => {
  emit('closed')
}

const handleBeforeClose = (action: string, done: () => void) => {
  emit('before-close', action, done)
}

const handleActionSelect = (action: ActionItem, index: number) => {
  emit('action-select', action, index)
  if (props.closeOnClickAction) {
    dialogVisible.value = false
  }
}

// 暴露方法
const open = () => {
  dialogVisible.value = true
}

const close = () => {
  dialogVisible.value = false
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

// Dialog 样式
.base-dialog-content {
  padding: 0;

  .dialog-header {
    padding: var(--mobile-gap);
    border-bottom: 1px solid var(--border-color-light);
    background: var(--bg-color-light);
  }

  .dialog-body {
    padding: var(--mobile-gap);
    max-height: 60vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dialog-footer {
    padding: var(--mobile-gap);
    border-top: 1px solid var(--border-color-light);
    background: var(--bg-color-light);
  }
}

// Popup 样式
.base-popup-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color);

  .popup-header {
    flex-shrink: 0;
  }

  .popup-body {
    flex: 1;
    padding: var(--mobile-gap);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .popup-footer {
    flex-shrink: 0;
    padding: var(--mobile-gap);
    border-top: 1px solid var(--border-color-light);
    background: var(--bg-color);

    .default-actions {
      display: flex;
      gap: var(--mobile-gap);

      .van-button {
        flex: 1;
        min-height: 44px;
      }
    }
  }
}

// 响应式适配
@media (max-width: 479px) {
  .base-dialog-content {
    .dialog-body {
      padding: var(--mobile-gap-sm);
      max-height: 50vh;
    }

    .dialog-header,
    .dialog-footer {
      padding: var(--mobile-gap-sm);
    }
  }

  .base-popup-content {
    .popup-body {
      padding: var(--mobile-gap-sm);
    }

    .popup-footer {
      padding: var(--mobile-gap-sm);
    }
  }
}

// 横屏适配
@media (orientation: landscape) and (max-height: 600px) {
  .base-popup-content {
    .popup-body {
      padding: var(--mobile-gap-sm);
    }
  }
}

// 自定义 Dialog 类
:deep(.base-dialog) {
  .van-dialog__header {
    padding: var(--mobile-gap-lg) var(--mobile-gap) var(--mobile-gap);
    font-size: var(--mobile-text-lg);
    font-weight: var(--font-semibold);
  }

  .van-dialog__content {
    padding: 0;
  }

  .van-dialog__footer {
    padding: var(--mobile-gap-sm) var(--mobile-gap) var(--mobile-gap-lg);
  }
}

// 全屏样式
:deep(.base-popup-fullscreen) {
  .van-popup {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
}

// 带圆角的底部弹出
:deep(.base-popup-bottom) {
  .van-popup {
    border-radius: var(--mobile-radius-xl) var(--mobile-radius-xl) 0 0;
  }
}
</style>