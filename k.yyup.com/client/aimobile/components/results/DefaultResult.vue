<!--
  💬 默认结果展示组件
  用于展示通用的Function Tool结果
-->

<template>
  <div class="default-result">
    <div class="result-header">
      <div class="result-title">
        <span class="title-icon">{{ getResultIcon() }}</span>
        <h4>{{ metadata?.title || '执行结果' }}</h4>
      </div>
      <div v-if="metadata?.description" class="result-summary">
        {{ metadata.description }}
      </div>
    </div>

    <div class="result-content">
      <!-- 成功状态 -->
      <div v-if="isSuccess" class="success-content">
        <!-- 简单文本内容 -->
        <div v-if="typeof data === 'string'" class="text-content">
          {{ data }}
        </div>

        <!-- 对象数据 -->
        <div v-else-if="data && typeof data === 'object'" class="object-content">
          <!-- 有message字段的情况 -->
          <div v-if="data.message" class="message-content">
            {{ data.message }}
          </div>

          <!-- 键值对数据 -->
          <div v-if="hasDisplayableData" class="key-value-list">
            <div 
              v-for="[key, value] in getDisplayableEntries()" 
              :key="key"
              class="kv-item"
            >
              <span class="kv-key">{{ formatKey(key) }}:</span>
              <span class="kv-value">{{ formatValue(value) }}</span>
            </div>
          </div>

          <!-- 数组数据 -->
          <div v-if="data.items && Array.isArray(data.items)" class="list-content">
            <div 
              v-for="(item, index) in data.items.slice(0, 10)" 
              :key="index"
              class="list-item"
            >
              <span class="item-bullet">•</span>
              <span class="item-text">{{ formatListItem(item) }}</span>
            </div>
            <div v-if="data.items.length > 10" class="more-items">
              还有 {{ data.items.length - 10 }} 项...
            </div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-message">
          {{ data?.error || data?.message || '操作执行失败' }}
        </div>
      </div>

      <!-- 原始数据查看 (开发模式) -->
      <div v-if="showRawData" class="raw-data-section">
        <button @click="toggleRawData" class="raw-data-toggle">
          {{ showRawDataContent ? '隐藏' : '显示' }}原始数据
        </button>
        <pre v-if="showRawDataContent" class="raw-data-content">{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </div>

    <div v-if="metadata?.actions?.length > 0" class="result-actions">
      <button 
        v-for="action in metadata.actions"
        :key="action.action"
        @click="handleAction(action.action, action.params)"
        class="result-action-btn"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from 'vue'

interface Props {
  data: any
  metadata?: {
    title?: string
    description?: string
    type?: string
    actions?: Array<{
      label: string
      action: string
      params?: any
    }>
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  action: [action: string, params?: any]
}>()

const showRawDataContent = ref(false)

// 计算属性
const isSuccess = computed(() => {
  if (!props.data) return false
  if (typeof props.data === 'string') return true
  if (props.data.error) return false
  return true
})

const hasDisplayableData = computed(() => {
  if (!props.data || typeof props.data !== 'object') return false
  const entries = Object.entries(props.data).filter(([key, value]) => 
    key !== 'message' && key !== 'items' && key !== 'error' && value !== null && value !== undefined
  )
  return entries.length > 0
})

const showRawData = computed(() => {
  return process.env.NODE_ENV === 'development'
})

// 方法
const handleAction = (action: string, params?: any) => {
  emit('action', action, params)
}

const getResultIcon = () => {
  if (!isSuccess.value) return '⚠️'
  
  const typeIcons = {
    'success': '✅',
    'info': 'ℹ️',
    'warning': '⚠️',
    'data': '📊',
    'navigation': '🧭',
    'search': '🔍',
    'create': '➕',
    'update': '📝',
    'delete': '🗑️'
  }
  
  return typeIcons[props.metadata?.type as keyof typeof typeIcons] || '💬'
}

const getDisplayableEntries = () => {
  if (!props.data || typeof props.data !== 'object') return []
  
  return Object.entries(props.data).filter(([key, value]) => 
    key !== 'message' && key !== 'items' && key !== 'error' && 
    value !== null && value !== undefined &&
    typeof value !== 'function' && typeof value !== 'object'
  ).slice(0, 8)
}

const formatKey = (key: string) => {
  // 转换驼峰命名为中文显示
  const keyMap: Record<string, string> = {
    'id': 'ID',
    'name': '名称',
    'title': '标题', 
    'count': '数量',
    'total': '总计',
    'status': '状态',
    'type': '类型',
    'date': '日期',
    'time': '时间',
    'createdAt': '创建时间',
    'updatedAt': '更新时间',
    'userId': '用户ID',
    'userName': '用户名'
  }
  
  return keyMap[key] || key.replace(/([A-Z])/g, ' $1').trim()
}

const formatValue = (value: any) => {
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  } else if (typeof value === 'number') {
    return value.toLocaleString()
  } else if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...'
  } else if (value instanceof Date) {
    return value.toLocaleString('zh-CN')
  }
  
  return String(value)
}

const formatListItem = (item: any) => {
  if (typeof item === 'string') {
    return item
  } else if (typeof item === 'object') {
    return item.name || item.title || item.label || JSON.stringify(item)
  }
  return String(item)
}

const toggleRawData = () => {
  showRawDataContent.value = !showRawDataContent.value
}
</script>

<style lang="scss" scoped>
.default-result {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.result-header {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;

  .result-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);

    .title-icon {
      font-size: 1var(--spacing-sm);
    }

    h4 {
      margin: 0;
      font-size: var(--spacing-md);
      font-weight: 600;
    }
  }

  .result-summary {
    font-size: 12px;
    opacity: 0.9;
  }
}

.result-content {
  padding: var(--spacing-md);
}

.success-content {
  .text-content {
    font-size: 1var(--spacing-xs);
    color: #374151;
    line-height: 1.6;
    padding: 12px;
    background: #f0f9ff;
    border-radius: var(--spacing-sm);
    border-left: var(--spacing-xs) solid #3b82f6;
  }

  .object-content {
    .message-content {
      font-size: 1var(--spacing-xs);
      color: #374151;
      line-height: 1.6;
      margin-bottom: var(--spacing-md);
      padding: 12px;
      background: #f0f9ff;
      border-radius: var(--spacing-sm);
      border-left: var(--spacing-xs) solid #3b82f6;
    }

    .key-value-list {
      .kv-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) 0;
        border-bottom: var(--border-width-base) solid #f3f4f6;
        font-size: 13px;

        &:last-child {
          border-bottom: none;
        }

        .kv-key {
          color: #6b7280;
          font-weight: 500;
        }

        .kv-value {
          color: #374151;
          text-align: right;
          max-width: 60%;
          word-break: break-all;
        }
      }
    }

    .list-content {
      .list-item {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        margin-bottom: 6px;
        font-size: 13px;

        .item-bullet {
          color: #6366f1;
          font-weight: bold;
          margin-top: 2px;
        }

        .item-text {
          color: #374151;
          flex: 1;
          line-height: 1.4;
        }
      }

      .more-items {
        font-size: 12px;
        color: #9ca3af;
        font-style: italic;
        margin-top: var(--spacing-sm);
        text-align: center;
      }
    }
  }
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  text-align: center;

  .error-icon {
    font-size: var(--spacing-xl);
  }

  .error-message {
    font-size: 1var(--spacing-xs);
    color: #dc2626;
    line-height: 1.5;
  }
}

.raw-data-section {
  margin-top: var(--spacing-md);
  border-top: var(--border-width-base) solid #e5e7eb;
  padding-top: 12px;

  .raw-data-toggle {
    font-size: 1var(--border-width-base);
    color: #6b7280;
    background: none;
    border: var(--border-width-base) solid #d1d5db;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--spacing-xs);
    cursor: pointer;

    &:hover {
      background: #f3f4f6;
    }
  }

  .raw-data-content {
    background: #f9fafb;
    border: var(--border-width-base) solid #e5e7eb;
    border-radius: var(--spacing-xs);
    padding: var(--spacing-sm);
    font-size: 10px;
    color: #374151;
    margin-top: var(--spacing-sm);
    max-height: 200px;
    overflow-y: auto;
  }
}

.result-actions {
  padding: 12px var(--spacing-md);
  background: #f9fafb;
  border-top: var(--border-width-base) solid #e5e7eb;
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;

  .result-action-btn {
    padding: 6px 12px;
    background: white;
    border: var(--border-width-base) solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
  }
}
</style>