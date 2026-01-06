<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="operation-confirm-dialog"
    @close="handleCancel"
  >
    <div class="dialog-content">
      <!-- 警告提示 -->
      <el-alert
        :title="operationTypeText"
        :type="alertType"
        :closable="false"
        show-icon
        class="alert-box"
      />

      <!-- 操作详情 -->
      <div class="operation-details">
        <div class="detail-item">
          <span class="label">操作类型：</span>
          <el-tag :type="tagType" size="large">{{ operationTypeText }}</el-tag>
        </div>

        <div v-if="props.data?.endpoint" class="detail-item">
          <span class="label">接口地址：</span>
          <span class="value">{{ props.data.endpoint }}</span>
        </div>

        <div v-if="props.data?.method" class="detail-item">
          <span class="label">请求方法：</span>
          <el-tag :type="methodTagType" size="small">{{ props.data.method }}</el-tag>
        </div>

        <div v-if="hasParameters" class="detail-item">
          <span class="label">操作参数：</span>
          <div class="parameters">
            <pre>{{ JSON.stringify(operationParams, null, 2) }}</pre>
          </div>
        </div>

        <!-- 特殊提醒 -->
        <div v-if="isDeleteOperation" class="warning-box">
          <el-icon class="warning-icon"><WarningFilled /></el-icon>
          <span>删除操作不可恢复，请谨慎确认！</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          :type="isDeleteOperation ? 'danger' : 'primary'"
          @click="handleConfirm"
          :loading="confirming"
        >
          {{ isDeleteOperation ? '确认删除' : '确认执行' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

interface OperationConfirmData {
  operation_type: 'delete' | 'update' | 'modify' | 'create'
  endpoint?: string
  method?: string
  body?: Record<string, any>
  query?: Record<string, any>
  ui_instruction?: {
    title?: string
    message?: string
  }
}

interface Props {
  modelValue: boolean
  data: OperationConfirmData | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: any): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const confirming = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 判断是否是删除操作
const isDeleteOperation = computed(() => {
  return props.data?.operation_type === 'delete' || 
         props.data?.method === 'DELETE'
})

// 操作类型文本
const operationTypeText = computed(() => {
  const type = props.data?.operation_type || 'unknown'
  const typeMap: Record<string, string> = {
    delete: '删除数据',
    update: '更新数据',
    modify: '修改数据',
    create: '创建数据'
  }
  return typeMap[type] || '未知操作'
})

// 对话框标题
const dialogTitle = computed(() => {
  return props.data?.ui_instruction?.title || `确认${operationTypeText.value}`
})

// 提示类型
const alertType = computed(() => {
  if (isDeleteOperation.value) return 'error'
  if (props.data?.operation_type === 'update' || props.data?.operation_type === 'modify') return 'warning'
  return 'info'
})

// 标签类型
const tagType = computed(() => {
  if (isDeleteOperation.value) return 'danger'
  if (props.data?.operation_type === 'update' || props.data?.operation_type === 'modify') return 'warning'
  return 'success'
})

// 方法标签类型
const methodTagType = computed(() => {
  const method = props.data?.method
  if (method === 'DELETE') return 'danger'
  if (method === 'PUT' || method === 'PATCH') return 'warning'
  if (method === 'POST') return 'success'
  return 'info'
})

// 是否有参数
const hasParameters = computed(() => {
  return props.data?.body || props.data?.query
})

// 操作参数
const operationParams = computed(() => {
  const params: Record<string, any> = {}
  if (props.data?.body) {
    params.body = props.data.body
  }
  if (props.data?.query) {
    params.query = props.data.query
  }
  return params
})

// 确认操作
const handleConfirm = () => {
  confirming.value = true
  emit('confirm', props.data)
  
  // 模拟延迟，给用户反馈
  setTimeout(() => {
    confirming.value = false
    visible.value = false
  }, 300)
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
  visible.value = false
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.operation-confirm-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid var(--border-color);
    padding: var(--spacing-lg);
  }

  :deep(.el-dialog__body) {
    padding: var(--spacing-lg);
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid var(--border-color);
    padding: var(--spacing-lg);
  }
}

.dialog-content {
  .alert-box {
    margin-bottom: var(--spacing-lg);
    
    :deep(.el-alert__title) {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
    }
  }

  .operation-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);

      .label {
        flex-shrink: 0;
        font-weight: var(--font-medium);
        color: var(--text-secondary);
        min-width: 80px;
      }

      .value {
        flex: 1;
        color: var(--text-primary);
        word-break: break-all;
      }

      .parameters {
        flex: 1;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-sm);
        max-height: 200px;
        overflow-y: auto;

        pre {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--text-primary);
          font-family: 'Courier New', monospace;
        }
      }
    }

    .warning-box {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      background: var(--danger-color-light);
      border: 1px solid var(--danger-color);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      color: var(--danger-color-dark);
      font-weight: var(--font-medium);

      .warning-icon {
        font-size: var(--text-xl);
        color: var(--danger-color);
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
