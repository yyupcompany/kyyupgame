<template>
  <div class="todo-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Calendar /></el-icon>
          待办事项管理
        </h1>
        <p class="page-description">管理您的日常任务和重要事项</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" round :icon="Plus" @click="showCreateDialog = true">
          新建待办
        </el-button>
        <el-button round :icon="Refresh" @click="refreshTodos">刷新</el-button>
      </div>
    </div>

    <!-- 筛选和统计区域 -->
    <div class="todo-stats">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon progress">
            <el-icon><Loading /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon overdue">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.overdue }}</div>
            <div class="stat-label">已逾期</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和排序 -->
    <div class="todo-filters">
      <div class="filter-left">
        <el-select v-model="filters.status" placeholder="状态筛选" clearable @change="loadTodos">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-select v-model="filters.priority" placeholder="优先级" clearable @change="loadTodos">
          <el-option label="全部" value="" />
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadTodos"
        />
      </div>
      <div class="filter-right">
        <el-select v-model="sortBy" @change="loadTodos">
          <el-option label="创建时间" value="createdAt" />
          <el-option label="截止时间" value="dueDate" />
          <el-option label="优先级" value="priority" />
          <el-option label="标题" value="title" />
        </el-select>
        <el-radio-group v-model="sortOrder" @change="loadTodos">
          <el-radio-button label="desc">降序</el-radio-button>
          <el-radio-button label="asc">升序</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 待办事项列表 -->
    <div class="todo-list" v-loading="loading">
      <div class="list-header">
        <div class="header-checkbox">
          <el-checkbox
            v-model="selectAll"
            @change="handleSelectAll"
            :indeterminate="isIndeterminate"
          />
        </div>
        <div class="header-info">
          <span>标题</span>
        </div>
        <div class="header-priority">优先级</div>
        <div class="header-status">状态</div>
        <div class="header-date">截止时间</div>
        <div class="header-actions">操作</div>
      </div>

      <div v-if="todoList.length === 0" class="empty-state">
        <el-empty description="暂无待办事项" :image-size="120">
          <el-button type="primary" @click="showCreateDialog = true">
            创建第一个待办事项
          </el-button>
        </el-empty>
      </div>

      <div
        v-for="todo in todoList"
        :key="todo.id"
        class="todo-item"
        :class="{
          'completed': todo.status === 'completed',
          'overdue': isOverdue(todo),
          'selected': selectedTodos.includes(todo.id)
        }"
      >
        <div class="item-checkbox">
          <el-checkbox
            :model-value="selectedTodos.includes(todo.id)"
            @change="(checked: boolean) => toggleSelection(todo.id, checked)"
          />
        </div>

        <div class="item-content">
          <div class="item-title" @click="toggleTodoStatus(todo)">
            <span>{{ todo.title }}</span>
            <el-tag
              v-if="todo.status === 'completed'"
              type="success"
              size="small"
              class="status-tag"
            >
              已完成
            </el-tag>
          </div>
          <div class="item-description" v-if="todo.content">
            {{ todo.content }}
          </div>
          <div class="item-meta">
            <el-tag
              :type="getPriorityType(todo.priority)"
              size="small"
              class="priority-tag"
            >
              {{ getPriorityText(todo.priority) }}
            </el-tag>
            <span class="create-time">
              创建于 {{ formatDate(todo.createdAt) }}
            </span>
          </div>
        </div>

        <div class="item-priority">
          <el-tag :type="getPriorityType(todo.priority)" size="small">
            {{ getPriorityText(todo.priority) }}
          </el-tag>
        </div>

        <div class="item-status">
          <el-tag :type="getStatusType(todo.status)" size="small">
            {{ getStatusText(todo.status) }}
          </el-tag>
        </div>

        <div class="item-date">
          <div v-if="todo.dueDate" class="due-date" :class="{ overdue: isOverdue(todo) }">
            <el-icon><Clock /></el-icon>
            {{ formatDate(todo.dueDate) }}
          </div>
          <span v-else class="no-due-date">无截止时间</span>
        </div>

        <div class="item-actions">
          <el-button-group>
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click="editTodo(todo)"
              title="编辑"
            />
            <el-button
              type="success"
              size="small"
              :icon="CircleCheck"
              @click="completeTodo(todo)"
              v-if="todo.status !== 'completed'"
              title="标记完成"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="deleteTodo(todo.id)"
              title="删除"
            />
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="todo-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadTodos"
        @size-change="loadTodos"
      />
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedTodos.length > 0" class="batch-actions">
      <div class="batch-info">
        已选择 {{ selectedTodos.length }} 项
      </div>
      <div class="batch-buttons">
        <el-button @click="batchComplete">标记完成</el-button>
        <el-button @click="batchDelete">批量删除</el-button>
        <el-button type="info" @click="selectedTodos = []">取消选择</el-button>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <TodoDialog
      v-model="showCreateDialog"
      :todo="editingTodo"
      @success="handleTodoSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar, Plus, Refresh, Clock, Loading, CircleCheck, Warning,
  Edit, Delete
} from '@element-plus/icons-vue'
import * as todoApi from '@/api/modules/dashboard'
import type { Todo } from '@/api/modules/dashboard'
import TodoDialog from './components/TodoDialog.vue'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const todoList = ref<Todo[]>([])
const selectedTodos = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const showCreateDialog = ref(false)
const editingTodo = ref<Todo | null>(null)

// 筛选和排序
const filters = ref({
  status: '',
  priority: '',
  dateRange: null as any
})

const sortBy = ref('createdAt')
const sortOrder = ref('desc')

// 统计数据
const stats = computed(() => {
  const pending = todoList.value.filter(t => t.status === 'pending').length
  const inProgress = todoList.value.filter(t => t.status === 'in_progress').length
  const completed = todoList.value.filter(t => t.status === 'completed').length
  const overdue = todoList.value.filter(t => isOverdue(t)).length

  return { pending, inProgress, completed, overdue }
})

// 全选功能
const selectAll = computed({
  get: () => selectedTodos.value.length === todoList.value.length && todoList.value.length > 0,
  set: (value: boolean) => {
    if (value) {
      selectedTodos.value = todoList.value.map(todo => todo.id)
    } else {
      selectedTodos.value = []
    }
  }
})

const isIndeterminate = computed(() => {
  return selectedTodos.value.length > 0 && selectedTodos.value.length < todoList.value.length
})

// 切换单个选择
const toggleSelection = (id: number, checked: boolean) => {
  if (checked) {
    if (!selectedTodos.value.includes(id)) {
      selectedTodos.value.push(id)
    }
  } else {
    const index = selectedTodos.value.indexOf(id)
    if (index > -1) {
      selectedTodos.value.splice(index, 1)
    }
  }
}

// 检查是否逾期
const isOverdue = (todo: Todo) => {
  if (!todo.dueDate || todo.status === 'completed') return false
  return new Date(todo.dueDate) < new Date()
}

// 格式化日期
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取优先级类型
const getPriorityType = (priority: number) => {
  const types = ['', 'danger', 'warning', 'info']
  return types[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority: number) => {
  const texts = ['', '高', '中', '低']
  return texts[priority] || '中'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    'pending': 'warning',
    'in_progress': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return texts[status] || '未知'
}

// 加载待办事项
const loadTodos = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      status: filters.value.status || undefined,
      priority: filters.value.priority || undefined,
      startDate: filters.value.dateRange?.[0],
      endDate: filters.value.dateRange?.[1],
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    }

    const response = await todoApi.getTodos(params as any)
    if (response.success) {
      // transformListResponse 返回的是 {items, total, success, page, pageSize, totalPages}
      // 而不是 {success: true, data: {items, ...}}
      todoList.value = (response as any).items || response.data?.items || []
      total.value = (response as any).total || response.data?.total || 0
    }
  } catch (error) {
    console.error('加载待办事项失败:', error)
    ElMessage.error('加载待办事项失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshTodos = () => {
  loadTodos()
}

// 切换待办状态 - 点击标题时打开编辑对话框
const toggleTodoStatus = (todo: Todo) => {
  // 点击标题时打开编辑对话框，而不是切换状态
  editTodo(todo)
}

// 编辑待办
const editTodo = (todo: Todo) => {
  editingTodo.value = { ...todo }
  showCreateDialog.value = true
}

// 完成待办
const completeTodo = async (todo: Todo) => {
  try {
    const response = await todoApi.updateTodoStatus(todo.id, 'completed' as any)
    if (response.success) {
      (todo as any).status = 'completed'
      ElMessage.success('标记完成成功')
    }
  } catch (error) {
    ElMessage.error('标记完成失败')
  }
}

// 删除待办
const deleteTodo = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个待办事项吗？', '确认删除', {
      type: 'warning'
    })

    const response = await todoApi.deleteTodo(id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadTodos()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 全选操作
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedTodos.value = todoList.value.map(todo => todo.id)
  } else {
    selectedTodos.value = []
  }
}

// 批量完成
const batchComplete = async () => {
  try {
    await ElMessageBox.confirm(`确定要标记 ${selectedTodos.value.length} 个待办事项为完成吗？`, '批量操作', {
      type: 'warning'
    })

    // 批量更新状态
    const promises = selectedTodos.value.map(id => 
      todoApi.updateTodoStatus(id, 'completed' as any)
    )

    await Promise.all(promises)
    selectedTodos.value = []
    loadTodos()
    ElMessage.success('批量操作成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${selectedTodos.value.length} 个待办事项吗？`, '批量删除', {
      type: 'warning'
    })

    const promises = selectedTodos.value.map(id => 
      todoApi.deleteTodo(id)
    )
    await Promise.all(promises)
    selectedTodos.value = []
    loadTodos()
    ElMessage.success('批量删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 处理待办成功回调
const handleTodoSuccess = () => {
  editingTodo.value = null
  showCreateDialog.value = false
  loadTodos()
}

// 监听路由查询参数，如果有id则打开编辑对话框
watch(() => route.query.id, (id) => {
  if (id && todoList.value.length > 0) {
    const todoId = parseInt(id as string)
    const todo = todoList.value.find(t => t.id === todoId)
    if (todo) {
      editTodo(todo)
      // 清除查询参数
      router.replace({ path: '/todo', query: {} })
    }
  }
}, { immediate: false })

// 组件挂载
onMounted(() => {
  loadTodos().then(() => {
    // 数据加载完成后检查路由参数
    if (route.query.id) {
      const todoId = parseInt(route.query.id as string)
      const todo = todoList.value.find(t => t.id === todoId)
      if (todo) {
        editTodo(todo)
        router.replace({ path: '/todo', query: {} })
      }
    }
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.todo-page {
  padding: var(--spacing-xl);
  background: var(--bg-page);
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom: none;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;

    .header-content {
      background: transparent !important;
      position: relative;
      z-index: 1;

      .page-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-semibold);
        color: #ffffff;
        margin: 0 0 var(--spacing-xs) 0;
        background: transparent !important;
        text-shadow: none;

        .el-icon {
          color: inherit;
          // 头部图标美化：玻璃拟态背景
          background: rgba(255, 255, 255, 0.2);
          padding: var(--spacing-sm);
          border-radius: 12px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .page-description {
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-size: var(--text-base);
        background: transparent !important;
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
      background: transparent !important;
      position: relative;
      z-index: 1;
      flex-shrink: 0;

      .el-button {
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        color: #ffffff !important;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
        white-space: nowrap;
        flex-shrink: 0;

        &:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          color: #ffffff !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &--primary {
          background: #ffffff !important;
          border-color: #ffffff !important;
          color: var(--primary-color) !important;
          font-weight: var(--font-weight-medium);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          &:hover {
            background: rgba(255, 255, 255, 0.95) !important;
            border-color: rgba(255, 255, 255, 0.95) !important;
            color: var(--primary-hover) !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
  }

  .todo-stats {
    margin-bottom: var(--spacing-xl);

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(calc(var(--spacing-4xl) * 2.5), 1fr));
      gap: var(--spacing-lg);

      .stat-card {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        border: 1px solid var(--border-color);
        transition: var(--transition);

        &:hover {
          box-shadow: var(--shadow-sm);
        }

        .stat-icon {
          width: var(--spacing-3xl); // 稍微加大图标区域
          height: var(--spacing-3xl);
          border-radius: var(--radius-xl); // 更大的圆角
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-3xl); // 加大图标
          transition: all 0.3s ease;

          // 现代清爽风格：浅色背景 + 深色图标
          &.pending {
            background: var(--warning-light-bg, rgba(230, 162, 60, 0.1));
            color: var(--warning-color);
          }

          &.progress {
            background: var(--primary-light-bg, rgba(64, 158, 255, 0.1));
            color: var(--primary-color);
          }

          &.completed {
            background: var(--success-light-bg, rgba(103, 194, 58, 0.1));
            color: var(--success-color);
          }

          &.overdue {
            background: var(--danger-light-bg, rgba(245, 108, 108, 0.1));
            color: var(--danger-color);
          }
        }

        .stat-content {
          flex: 1;
          min-width: 0; // 防止Flex子项溢出
          
          .stat-value {
            font-size: var(--text-2xl);
            font-weight: var(--font-weight-bold);
            color: var(--text-primary);
            line-height: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .stat-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-top: var(--spacing-xs);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

  .todo-filters {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-lg);
    border: 1px solid var(--border-color);
    flex-wrap: wrap;

    .filter-left {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-right {
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
      flex-wrap: nowrap;
    }
  }

  .todo-list {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    overflow: hidden;
    overflow-x: auto; // 允许横向滚动，防止撑破容器

    .list-header {
      display: grid;
      grid-template-columns: 40px 2fr 120px 120px 180px 200px;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--bg-header);
      border-bottom: 1px solid var(--border-color);
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
      font-size: var(--text-sm);
      gap: var(--spacing-md);
    }

    .empty-state {
      padding: var(--spacing-5xl);
      text-align: center;
    }

    .todo-item {
      display: grid;
      grid-template-columns: 40px 2fr 120px 120px 180px 200px;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
      transition: var(--transition);
      gap: var(--spacing-md);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--bg-hover);
      }

      &.completed {
        opacity: 0.7;
      }

      &.overdue {
        background: var(--danger-light-bg, var(--danger-extra-light));
      }

      &.selected {
        background: var(--primary-light-bg);
      }

      .item-content {
        min-width: 0; // 允许内容收缩
        overflow: hidden;
        
        .item-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-base);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          cursor: pointer;
          margin-bottom: var(--spacing-xs);
          line-height: 1.5;
          min-width: 0;

          span {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .status-tag {
            flex-shrink: 0;
          }
        }

        .item-description {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-xs);

          .priority-tag {
            flex-shrink: 0;
          }

          .create-time {
            color: var(--text-tertiary);
          }
        }
      }

      .item-priority {
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 0;

        .el-icon {
          font-size: var(--text-lg);
          flex-shrink: 0;

          &.priority-high {
            color: var(--danger-color);
          }

          &.priority-medium {
            color: var(--warning-color);
          }

          &.priority-low {
            color: var(--info-color);
          }
        }
      }

      .item-status {
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 0;

        .el-tag {
          flex-shrink: 0;
        }
      }

      .item-date {
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 0;
        
        .due-date {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          color: var(--text-primary);
          flex-shrink: 0;

          &.overdue {
            color: var(--danger-color);
            font-weight: var(--font-weight-medium);
          }

          .el-icon {
            font-size: var(--text-sm);
          }
        }

        .no-due-date {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          flex-shrink: 0;
        }
      }

      .item-actions {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: nowrap; /* 禁止换行 */
        justify-content: center;
        align-items: center;
        min-width: 0; /* 防止 flex item 溢出 */

        // 列表操作按钮美化 - 糖果色风格
        .action-btn {
          flex-shrink: 0; /* 防止按钮被压缩 */
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: var(--text-base);
          width: 36px;
          height: 36px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          
          &:hover {
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          // 编辑 - 蓝色系
          &.edit:hover {
            background: var(--primary-light-bg, rgba(64, 158, 255, 0.1));
            color: var(--primary-color);
          }

          // 完成 - 绿色系
          &.complete:hover {
            background: var(--success-light-bg, rgba(103, 194, 58, 0.1));
            color: var(--success-color);
          }

          // 删除 - 红色系
          &.delete:hover {
            background: var(--danger-light-bg, rgba(245, 108, 108, 0.1));
            color: var(--danger-color);
          }
        }
      }
    }
  }

  .todo-pagination {
    margin-top: var(--spacing-lg);
    display: flex;
    justify-content: center;
  }

  .batch-actions {
    position: fixed;
    bottom: var(--spacing-xl);
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md) var(--spacing-lg);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    z-index: 1000;

    .batch-info {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .batch-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .todo-page {
    padding: var(--spacing-md);

    .page-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .todo-stats .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .todo-filters {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: stretch;

      .filter-left,
      .filter-right {
        justify-content: space-between;
      }
    }

    .todo-list .list-header,
    .todo-list .todo-item {
      grid-template-columns: var(--spacing-xl) 1fr calc(var(--spacing-4xl) * 0.75) calc(var(--spacing-4xl) * 0.75) calc(var(--spacing-4xl) * 1.5) var(--spacing-4xl);
    }
  }
}
</style>