<template>
  <div class="ai-todo-list">
    <div class="todo-header">
      <h3>{{ title || '待办事项' }}</h3>
      <div v-if="editable" class="todo-actions">
        <button class="add-todo-btn" @click="addNewTodo">
          <i class="el-icon-plus"></i>
        </button>
      </div>
    </div>
    
    <div class="todos-container">
      <div 
        v-for="(todo, index) in todos" 
        :key="index" 
        class="todo-item"
        :class="{ 'completed': todo.completed }"
      >
        <div class="todo-checkbox" @click="toggleTodo(index)">
          <i v-if="todo.completed" class="el-icon-check"></i>
        </div>
        <div class="todo-content">
          <div v-if="editingIndex === index && editable" class="todo-edit">
            <input 
              type="text" 
              v-model="editingText" 
              @keyup.enter="saveTodoEdit(index)" 
              @blur="saveTodoEdit(index)"
              ref="editInput"
            />
          </div>
          <div 
            v-else 
            class="todo-text" 
            @dblclick="startEditing(index)"
          >
            {{ todo.text }}
          </div>
          
          <div class="todo-meta" v-if="todo.dueDate || todo.priority">
            <span v-if="todo.dueDate" class="due-date">
              <i class="el-icon-time"></i> {{ formatDate(todo.dueDate) }}
            </span>
            <span v-if="todo.priority" class="priority" :class="`priority-${todo.priority}`">
              {{ getPriorityLabel(todo.priority) }}
            </span>
          </div>
        </div>
        
        <div v-if="editable" class="todo-actions">
          <button class="todo-edit-btn" @click="startEditing(index)">
            <i class="el-icon-edit"></i>
          </button>
          <button class="todo-delete-btn" @click="deleteTodo(index)">
            <i class="el-icon-delete"></i>
          </button>
        </div>
      </div>
      
      <div v-if="todos.length === 0" class="empty-state">
        暂无待办事项
      </div>
    </div>
    
    <div v-if="showProgress && todos.length > 0" class="todo-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <div class="progress-text">
        {{ completedCount }}/{{ todos.length }} 已完成 ({{ progressPercentage }}%)
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue';

export default {
  name: 'AiTodoList',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '待办事项'
    },
    editable: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['update:value', 'change'],
  
  setup(props, { emit }) {
    const todos = ref(props.value || []);
    const editingIndex = ref(-1);
    const editingText = ref('');
    const editInput = ref(null);
    
    // 监听props.value的变化
    watch(() => props.value, (newValue) => {
      if (newValue) {
        todos.value = newValue;
      }
    });
    
    // 计算进度百分比
    const completedCount = computed(() => {
      return todos.value.filter(todo => todo.completed).length;
    });
    
    const progressPercentage = computed(() => {
      if (todos.value.length === 0) return 0;
      return Math.round((completedCount.value / todos.value.length) * 100);
    });
    
    // 切换任务状态
    const toggleTodo = (index) => {
      if (index >= 0 && index < todos.value.length) {
        todos.value[index].completed = !todos.value[index].completed;
        emitChange();
      }
    };
    
    // 开始编辑任务
    const startEditing = (index) => {
      if (!props.editable) return;
      
      editingIndex.value = index;
      editingText.value = todos.value[index].text;
      
      nextTick(() => {
        if (editInput.value && typeof editInput.value.focus === 'function') {
          editInput.value.focus();
        }
      });
    };
    
    // 保存编辑
    const saveTodoEdit = (index) => {
      if (editingIndex.value === index) {
        todos.value[index].text = editingText.value.trim();
        editingIndex.value = -1;
        emitChange();
      }
    };
    
    // 添加新任务
    const addNewTodo = () => {
      todos.value.push({
        text: '',
        completed: false,
        priority: 'normal'
      });
      
      // 编辑新添加的任务
      const newIndex = todos.value.length - 1;
      startEditing(newIndex);
      emitChange();
    };
    
    // 删除任务
    const deleteTodo = (index) => {
      todos.value.splice(index, 1);
      emitChange();
    };
    
    // 格式化日期
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取优先级标签
    const getPriorityLabel = (priority) => {
      const labels = {
        high: '高',
        normal: '中',
        low: '低'
      };
      return labels[priority] || '中';
    };
    
    // 发送变更事件
    const emitChange = () => {
      emit('update:value', todos.value);
      emit('change', todos.value);
    };
    
    return {
      todos,
      editingIndex,
      editingText,
      editInput,
      completedCount,
      progressPercentage,
      toggleTodo,
      startEditing,
      saveTodoEdit,
      addNewTodo,
      deleteTodo,
      formatDate,
      getPriorityLabel
    };
  }
};
</script>

<style scoped lang="scss">
.ai-todo-list {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  border: var(--border-width-base) solid var(--border-color-light);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  width: 100%;
  max-width: 600px;

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.todo-header h3 {
  margin: 0;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.todos-container {
  margin-bottom: var(--spacing-md);
}

.todo-item {
  display: flex;
  padding: var(--spacing-sm);
  border-bottom: var(--border-width-base) solid var(--border-color-light);
  align-items: center;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed .todo-text {
  color: var(--text-secondary);
  text-decoration: line-through;
}

.todo-checkbox {
  width: var(--text-2xl);
  height: var(--text-2xl);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-xs);
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

.todo-checkbox i {
  color: var(--success-color);
}

.todo-item.completed .todo-checkbox {
  background-color: var(--success-color);
  border-color: var(--success-color);
}

.todo-item.completed .todo-checkbox i {
  color: white;
}

.todo-content {
  flex: 1;
}

.todo-text {
  font-size: var(--font-size-base);
  color: var(--text-regular);
  line-height: 1.5;
  word-break: break-word;
}

.todo-edit input {
  width: 100%;
  font-size: var(--font-size-base);
  border: var(--border-width-base) solid var(--primary-color);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  outline: none;

.todo-meta {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
  color: var(--text-secondary);

.due-date {
  margin-right: var(--spacing-sm);
}

.priority {
  font-size: var(--font-size-xs);
  padding: var(--spacing-sm) 6px;
  border-radius: var(--border-radius-sm);
  background-color: var(--info-color);
  color: white;

.priority-high {
  background-color: var(--danger-color);
}

.priority-normal {
  background-color: var(--warning-color);
}

.priority-low {
  background-color: var(--info-color);
}

.todo-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.todo-actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  opacity: 0.5;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;

.todo-actions button:hover {
  opacity: 1;
  color: var(--primary-color);
}

.todo-delete-btn:hover {
  color: var(--danger-color) !important;
}

.add-todo-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;

.empty-state {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-style: italic;
}

.todo-progress {
  margin-top: var(--spacing-md);
}

.progress-bar {
  height: 6px;
  background-color: var(--border-color-light);
  border-radius: var(--radius-xs);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.progress-fill {
  height: 100%;
  background-color: var(--success-color);
  transition: width 0.3s;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: right;
}

/* 深色模式适配 */
:root[data-theme="dark"] .ai-todo-list {
  border-color: var(--border-color);
}

:root[data-theme="dark"] .todo-item {
  border-color: var(--border-color);
}
}
}
}
}
}
}
}
</style> 