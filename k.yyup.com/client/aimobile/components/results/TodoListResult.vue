<template>
  <div class="todo-list-result mobile-result">
    <div class="result-header">
      <div class="result-icon">✅</div>
      <div class="result-title">{{ data.title || '任务清单' }}</div>
      <div class="result-subtitle">{{ data.description || '为您生成的任务执行清单' }}</div>
    </div>

    <div class="todo-container">
      <div 
        v-for="(category, categoryIndex) in organizedTodos" 
        :key="categoryIndex"
        class="todo-category"
      >
        <div class="category-header">
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-title">{{ category.title }}</span>
          <span class="category-count">({{ category.items.length }}项)</span>
        </div>

        <div class="todo-items">
          <div 
            v-for="(todo, todoIndex) in category.items" 
            :key="todoIndex"
            class="todo-item"
            :class="{ 'completed': todo.completed }"
            @click="toggleTodo(categoryIndex, todoIndex)"
          >
            <div class="todo-checkbox">
              <span v-if="todo.completed" class="check-icon">✓</span>
            </div>
            <div class="todo-content">
              <div class="todo-text">{{ todo.text || todo.task || todo.title }}</div>
              <div v-if="todo.assignee || todo.deadline || todo.priority" class="todo-meta">
                <span v-if="todo.assignee" class="meta-item assignee">
                  👤 {{ todo.assignee }}
                </span>
                <span v-if="todo.deadline" class="meta-item deadline">
                  ⏰ {{ formatDeadline(todo.deadline) }}
                </span>
                <span v-if="todo.priority" class="meta-item priority" :class="`priority-${todo.priority}`">
                  {{ getPriorityText(todo.priority) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${completionPercentage}%` }"></div>
      </div>
      <div class="progress-text">
        完成进度: {{ completedCount }}/{{ totalCount }} ({{ completionPercentage }}%)
      </div>
    </div>

    <div class="result-actions">
      <button class="action-btn primary" @click="exportTodos">
        <span>📋</span> 导出清单
      </button>
      <button class="action-btn secondary" @click="refreshTodos">
        <span>🔄</span> 刷新
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface TodoItem {
  text?: string
  task?: string
  title?: string
  completed?: boolean
  assignee?: string
  deadline?: string
  priority?: 'high' | 'medium' | 'low'
}

interface TodoCategory {
  title: string
  icon: string
  items: TodoItem[]
}

interface Props {
  data: {
    title?: string
    description?: string
    todos?: TodoItem[]
    categories?: TodoCategory[]
    [key: string]: any
  }
  metadata?: any
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({ todos: [] }),
  metadata: () => ({})
})

// Emits
const emit = defineEmits<{
  action: [action: string, data: any]
}>()

// 响应式数据
const todoData = ref(props.data.todos || [])

// 组织化的待办事项
const organizedTodos = computed(() => {
  // 如果数据中有categories，直接使用
  if (props.data.categories && props.data.categories.length > 0) {
    return props.data.categories
  }

  // 否则，根据内容自动分类
  const categories: TodoCategory[] = [
    { title: '即时任务', icon: '🔥', items: [] },
    { title: '短期任务', icon: '📅', items: [] },
    { title: '长期任务', icon: '🎯', items: [] }
  ]

  todoData.value.forEach(todo => {
    if (todo.priority === 'high' || (todo.deadline && isUrgent(todo.deadline))) {
      categories[0].items.push(todo)
    } else if (todo.deadline && isNearTerm(todo.deadline)) {
      categories[1].items.push(todo)
    } else {
      categories[2].items.push(todo)
    }
  })

  return categories.filter(cat => cat.items.length > 0)
})

// 完成统计
const completedCount = computed(() => {
  return organizedTodos.value.reduce((count, category) => {
    return count + category.items.filter(item => item.completed).length
  }, 0)
})

const totalCount = computed(() => {
  return organizedTodos.value.reduce((count, category) => {
    return count + category.items.length
  }, 0)
})

const completionPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// 方法
const toggleTodo = (categoryIndex: number, todoIndex: number) => {
  const todo = organizedTodos.value[categoryIndex].items[todoIndex]
  todo.completed = !todo.completed
  
  emit('action', 'todo-toggled', {
    categoryIndex,
    todoIndex,
    completed: todo.completed
  })
}

const formatDeadline = (deadline: string) => {
  try {
    const date = new Date(deadline)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return deadline
  }
}

const getPriorityText = (priority: string) => {
  const map = {
    'high': '🔴 高',
    'medium': '🟡 中', 
    'low': '🟢 低'
  }
  return map[priority as keyof typeof map] || priority
}

const isUrgent = (deadline: string): boolean => {
  try {
    const date = new Date(deadline)
    const now = new Date()
    const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 3
  } catch {
    return false
  }
}

const isNearTerm = (deadline: string): boolean => {
  try {
    const date = new Date(deadline)
    const now = new Date()
    const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 14
  } catch {
    return false
  }
}

const exportTodos = () => {
  emit('action', 'export-todos', { todos: todoData.value })
}

const refreshTodos = () => {
  emit('action', 'refresh-todos', {})
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData.todos) {
    todoData.value = newData.todos
  }
}, { deep: true })
</script>

<style scoped>
.todo-list-result {
  background: #fff;
  border-radius: var(--spacing-md);
  padding: var(--spacing-md);
  margin: var(--spacing-sm) 0;
  box-shadow: 0 var(--spacing-xs) 12px rgba(0, 0, 0, 0.08);
  border: var(--border-width-base) solid #f0f2f5;
}

.result-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  padding-bottom: 12px;
  border-bottom: var(--border-width-base) solid #f5f5f5;
}

.result-icon {
  font-size: 2var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.result-title {
  font-size: 1var(--spacing-sm);
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.result-subtitle {
  font-size: 13px;
  color: #666;
}

.todo-container {
  margin-bottom: var(--spacing-md);
}

.todo-category {
  margin-bottom: var(--spacing-md);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--spacing-sm);
  padding: 6px var(--spacing-sm);
  background: #f8f9fa;
  border-radius: var(--spacing-sm);
}

.category-icon {
  font-size: var(--spacing-md);
}

.category-title {
  font-weight: 600;
  font-size: 1var(--spacing-xs);
  color: #333;
  flex: 1;
}

.category-count {
  font-size: 12px;
  color: #666;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 10px;
}

.todo-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px;
  border-radius: var(--spacing-sm);
  transition: all 0.2s;
  cursor: pointer;
}

.todo-item:hover {
  background: #f8f9fa;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: var(--border-width-base);
  transition: all 0.2s;
}

.todo-item.completed .todo-checkbox {
  background: #52c41a;
  border-color: #52c41a;
}

.check-icon {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-text {
  font-size: 1var(--spacing-xs);
  line-height: 1.4;
  color: #333;
  margin-bottom: var(--spacing-xs);
  word-wrap: break-word;
}

.todo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: 6px;
}

.meta-item {
  font-size: 1var(--border-width-base);
  padding: 2px 6px;
  border-radius: 10px;
  background: #f0f2f5;
  color: #666;
}

.meta-item.assignee {
  background: #e6f4ff;
  color: #1890ff;
}

.meta-item.deadline {
  background: #fff7e6;
  color: #fa8c16;
}

.meta-item.priority-high {
  background: #fff1f0;
  color: #f5222d;
}

.meta-item.priority-medium {
  background: #fffbe6;
  color: #faad14;
}

.meta-item.priority-low {
  background: #f6ffed;
  color: #52c41a;
}

.progress-section {
  margin-bottom: var(--spacing-md);
  padding: 12px;
  background: #fafafa;
  border-radius: var(--spacing-sm);
}

.progress-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.result-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 6px;
  border: var(--border-width-base) solid #d9d9d9;
  background: white;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.action-btn.primary {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.action-btn.primary:hover {
  background: #40a9ff;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .todo-list-result {
    background: #1a1a1a;
    border-color: #333;
  }
  
  .result-title {
    color: #fff;
  }
  
  .category-header {
    background: #2a2a2a;
  }
  
  .todo-item:hover {
    background: #2a2a2a;
  }
  
  .progress-section {
    background: #2a2a2a;
  }
}
</style>