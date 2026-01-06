<template>
  <div class="memory-card" :class="{ 'is-expanded': expanded }">
    <div class="memory-header" @click="toggleExpand">
      <div class="memory-type">
        <el-tag :type="getMemoryTypeTagType(memory.memoryType)" size="small">
          {{ getMemoryTypeLabel(memory.memoryType) }}
        </el-tag>
      </div>
      <div class="memory-importance">
        <el-rate
          v-model="memory.importance"
          :max="1"
          :step="0.1"
          disabled
          show-score
          score-template="{value}"
        />
      </div>
      <div class="memory-date">{{ formatDate(memory.createdAt) }}</div>
      <div class="memory-expand-icon">
        <el-icon>
          <component :is="expanded ? 'ArrowUp' : 'ArrowDown'" />
        </el-icon>
      </div>
    </div>
    
    <div class="memory-content" :class="{ 'is-expanded': expanded }">
      <div class="memory-text">{{ memory.content }}</div>
      
      <div v-if="expanded" class="memory-actions">
        <el-button type="primary" size="small" @click="handleView">
          <el-icon><View /></el-icon> 查看详情
        </el-button>
        <el-button type="danger" size="small" @click="handleDelete">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowDown, ArrowUp, View, Delete } from '@element-plus/icons-vue';

// 内联定义接口，避免外部依赖
interface Memory {
  id: number;
  userId: number;
  conversationId: string;
  content: string;
  importance: number;
  memoryType: string;
  createdAt: string;
  expiresAt?: string;
}

// 定义props
interface Props {
  memory: Memory;
}

const props = defineProps<Props>();

// 定义emits
const emit = defineEmits<{
  view: [memory: Memory];
  delete: [memory: Memory];
}>();

// 格式化日期函数
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const expanded = ref(false);

const toggleExpand = () => {
  expanded.value = !expanded.value;
};

const handleView = (event: Event) => {
  event.stopPropagation();
  emit('view', props.memory);
};

const handleDelete = (event: Event) => {
  event.stopPropagation();
  emit('delete', props.memory);
};

const getMemoryTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    immediate: '即时记忆',
    short_term: '短期记忆',
    long_term: '长期记忆',
    shortterm: '短期记忆',
    longterm: '长期记忆'
  };
  return typeMap[type] || type;
};

// 获取标签类型，确保返回值符合Element Plus的类型要求
const getMemoryTypeTagType = (type: string): 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    immediate: 'info',
    short_term: 'warning',
    long_term: 'success',
    shortterm: 'warning',
    longterm: 'success'
  };
  return typeMap[type] || 'info';
};
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.memory-card {
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--border-radius-base);
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: var(--bg-color);
}

.memory-card:hover {
  box-shadow: var(--box-shadow-light);
}

.memory-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  background-color: var(--bg-color-secondary);
  border-bottom: var(--border-width-base) solid var(--border-color-light);
}

.memory-type {
  flex: 0 0 auto;
  margin-right: var(--spacing-lg);
}

.memory-importance {
  flex: 1;
}

.memory-date {
  flex: 0 0 auto;
  margin-right: var(--spacing-lg);
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}

.memory-expand-icon {
  flex: 0 0 auto;
}

.memory-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.memory-content.is-expanded {
  max-height: 500px;
  padding: var(--spacing-lg);
}

.memory-text {
  font-size: var(--font-size-sm);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.memory-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

/* 响应式调整 */
@media (max-width: 76var(--spacing-sm)) {
  .memory-header {
    flex-wrap: wrap;
  }
  
  .memory-importance {
    flex: 0 0 100%;
    order: 3;
    margin-top: var(--spacing-sm);
  }
  
  .memory-date {
    margin-left: auto;
  }
}
</style> 