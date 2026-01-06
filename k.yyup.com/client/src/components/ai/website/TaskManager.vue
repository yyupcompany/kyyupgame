<template>
  <div class="task-manager">
    <!-- 管理器头部 -->
    <div class="manager-header">
      <div class="header-info">
        <h3>任务管理器</h3>
        <p>创建、编辑和管理自动化任务模板</p>
      </div>
      <div class="header-actions">
        <el-button @click="createNewTask" type="primary">
          <UnifiedIcon name="Plus" />
          新建任务
        </el-button>
        <el-button @click="importTasks">
          <UnifiedIcon name="Upload" />
          导入
        </el-button>
        <el-button @click="exportSelectedTasks" :disabled="selectedTasks.length === 0">
          <UnifiedIcon name="Download" />
          导出选中
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filters">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索任务名称或描述..."
            clearable
          >
            <template #prefix>
              <UnifiedIcon name="Search" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterCategory" placeholder="分类" clearable>
            <el-option label="全部" value="" />
            <el-option label="网页操作" value="web" />
            <el-option label="表单处理" value="form" />
            <el-option label="数据提取" value="data" />
            <el-option label="自动化测试" value="test" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterComplexity" placeholder="复杂度" clearable>
            <el-option label="全部" value="" />
            <el-option label="简单" value="simple" />
            <el-option label="中等" value="medium" />
            <el-option label="复杂" value="complex" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="sortBy" placeholder="排序方式">
            <el-option label="创建时间" value="createdAt" />
            <el-option label="更新时间" value="updatedAt" />
            <el-option label="名称" value="name" />
            <el-option label="使用次数" value="usageCount" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="sortOrder" placeholder="排序顺序">
            <el-option label="降序" value="desc" />
            <el-option label="升序" value="asc" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 任务模板网格 -->
    <div class="tasks-grid">
      <div class="grid-header">
        <div class="grid-controls">
          <el-checkbox 
            v-model="selectAll" 
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
          >
            全选
          </el-checkbox>
          <span class="selected-count" v-if="selectedTasks.length > 0">
            已选中 {{ selectedTasks.length }} 个任务
          </span>
        </div>
        <div class="view-controls">
          <el-button-group>
            <el-button 
              @click="viewMode = 'grid'" 
              :type="viewMode === 'grid' ? 'primary' : ''"
              size="small"
            >
              <UnifiedIcon name="default" />
              网格
            </el-button>
            <el-button 
              @click="viewMode = 'list'" 
              :type="viewMode === 'list' ? 'primary' : ''"
              size="small"
            >
              <UnifiedIcon name="default" />
              列表
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 网格视图 -->
      <div class="grid-view" v-if="viewMode === 'grid'">
        <div class="task-cards">
          <div 
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-card"
            :class="{ 'selected': selectedTasks.includes(task.id) }"
            @click="selectTask(task)"
          >
            <div class="card-header">
              <el-checkbox 
                v-model="selectedTasks" 
                :label="task.id"
                @click.stop
              />
              <div class="card-actions">
                <el-dropdown @command="handleCardAction">
                  <el-button size="small" text>
                    <UnifiedIcon name="default" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{action: 'edit', task}">编辑</el-dropdown-item>
                      <el-dropdown-item :command="{action: 'duplicate', task}">复制</el-dropdown-item>
                      <el-dropdown-item :command="{action: 'export', task}">导出</el-dropdown-item>
                      <el-dropdown-item :command="{action: 'delete', task}" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <div class="card-content">
              <div class="task-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="task-info">
                <h4 class="task-name">{{ task.name }}</h4>
                <p class="task-description">{{ truncateText(task.description, 60) }}</p>
                <div class="task-meta">
                  <el-tag :type="getCategoryType(task.category)" size="small">
                    {{ getCategoryText(task.category) }}
                  </el-tag>
                  <el-tag :type="getComplexityType(task.complexity)" size="small">
                    {{ getComplexityText(task.complexity) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="task-stats">
                <span class="stat-item">
                  <UnifiedIcon name="default" />
                  {{ task.usageCount || 0 }} 次使用
                </span>
                <span class="stat-item">
                  <UnifiedIcon name="default" />
                  {{ formatTime(task.updatedAt) }}
                </span>
              </div>
              <div class="task-actions">
                <el-button @click.stop="executeTask(task)" size="small">
                  <UnifiedIcon name="default" />
                  执行
                </el-button>
                <el-button @click.stop="editTask(task)" size="small">
                  <UnifiedIcon name="Edit" />
                  编辑
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div class="list-view" v-else>
        <div class="table-wrapper">
<el-table class="responsive-table" 
          :data="filteredTasks" 
          @selection-change="handleSelectionChange"
          @row-click="selectTask"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="任务名称" min-width="200">
            <template #default="{ row }">
              <div class="task-name-cell">
                <UnifiedIcon name="default" />
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="300">
            <template #default="{ row }">
              {{ truncateText(row.description, 100) }}
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120">
            <template #default="{ row }">
              <el-tag :type="getCategoryType(row.category)" size="small">
                {{ getCategoryText(row.category) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="complexity" label="复杂度" width="100">
            <template #default="{ row }">
              <el-tag :type="getComplexityType(row.complexity)" size="small">
                {{ getComplexityText(row.complexity) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="usageCount" label="使用次数" width="100" />
          <el-table-column prop="updatedAt" label="更新时间" width="150">
            <template #default="{ row }">
              {{ formatTime(row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button @click.stop="executeTask(row)" size="small">执行</el-button>
              <el-button @click.stop="editTask(row)" size="small">编辑</el-button>
              <el-button @click.stop="duplicateTask(row)" size="small">复制</el-button>
              <el-button @click.stop="deleteTask(row)" size="small" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
</div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="filteredTasks.length === 0">
      <el-empty description="暂无任务模板">
        <el-button @click="createNewTask" type="primary">创建第一个任务</el-button>
      </el-empty>
    </div>

    <!-- 任务编辑对话框 -->
    <el-dialog
      v-model="taskEditorVisible"
      :title="isEditMode ? '编辑任务模板' : '新建任务模板'"
      width="80%"
      :close-on-click-modal="false"
    >
      <TaskTemplateEditor
        ref="taskTemplateEditorRef"
        :task="currentTask"
        @task-saved="handleTaskSaved"
        @task-cancelled="handleTaskCancelled"
      />
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="batchActionVisible"
      title="批量操作"
      width="50%"
    >
      <div class="batch-actions">
        <p>已选中 {{ selectedTasks.length }} 个任务</p>
        <el-button @click="batchExecute" type="primary">批量执行</el-button>
        <el-button @click="batchExport">批量导出</el-button>
        <el-button @click="batchDelete" type="danger">批量删除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineEmits, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  Search,
  Grid,
  List,
  MoreFilled,
  VideoPlay,
  Edit,
  Clock,
  Web,
  Document,
  DataAnalysis,
  Tools,
  Setting
} from '@element-plus/icons-vue'
import TaskTemplateEditor from './TaskTemplateEditor.vue'
import { useTaskTemplates } from '@/composables/useTaskTemplates'

// Emits
const emit = defineEmits(['task-created', 'task-updated', 'task-executed'])

// 组合式API
const {
  taskTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  executeTemplate,
  importTemplates,
  exportTemplates
} = useTaskTemplates()

// 响应式数据
const searchKeyword = ref('')
const filterCategory = ref('')
const filterComplexity = ref('')
const sortBy = ref('updatedAt')
const sortOrder = ref('desc')
const viewMode = ref('grid')
const selectedTasks = ref<string[]>([])
const selectAll = ref(false)
const taskEditorVisible = ref(false)
const batchActionVisible = ref(false)
const isEditMode = ref(false)
const currentTask = ref<any>(null)

// 组件引用
const taskTemplateEditorRef = ref()

// 计算属性
const filteredTasks = computed(() => {
  let filtered = taskTemplates.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.name.toLowerCase().includes(keyword) ||
      task.description.toLowerCase().includes(keyword)
    )
  }

  // 分类过滤
  if (filterCategory.value) {
    filtered = filtered.filter(task => task.category === filterCategory.value)
  }

  // 复杂度过滤
  if (filterComplexity.value) {
    filtered = filtered.filter(task => task.complexity === filterComplexity.value)
  }

  // 排序
  filtered.sort((a, b) => {
    const field = sortBy.value
    const order = sortOrder.value === 'asc' ? 1 : -1
    
    if (field === 'name') {
      return a.name.localeCompare(b.name) * order
    } else if (field === 'usageCount') {
      return ((a.usageCount || 0) - (b.usageCount || 0)) * order
    } else {
      return (new Date(a[field]).getTime() - new Date(b[field]).getTime()) * order
    }
  })

  return filtered
})

const isIndeterminate = computed(() => {
  return selectedTasks.value.length > 0 && selectedTasks.value.length < filteredTasks.value.length
})

// 方法定义
const createNewTask = () => {
  isEditMode.value = false
  currentTask.value = {
    name: '',
    description: '',
    category: 'web',
    complexity: 'simple',
    steps: []
  }
  taskEditorVisible.value = true
}

const editTask = (task: any) => {
  isEditMode.value = true
  currentTask.value = { ...task }
  taskEditorVisible.value = true
}

const duplicateTask = async (task: any) => {
  try {
    await duplicateTemplate(task.id)
    ElMessage.success('任务已复制')
  } catch (error) {
    ElMessage.error('复制任务失败：' + error.message)
  }
}

const deleteTask = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务模板吗？', '确认删除', {
      type: 'warning'
    })
    
    await deleteTemplate(task.id)
    ElMessage.success('任务已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除任务失败：' + error.message)
    }
  }
}

const executeTask = async (task: any) => {
  try {
    await executeTemplate(task.id)
    emit('task-executed', task)
    ElMessage.success('任务开始执行')
  } catch (error) {
    ElMessage.error('执行任务失败：' + error.message)
  }
}

const selectTask = (task: any) => {
  // 单选逻辑
  const index = selectedTasks.value.indexOf(task.id)
  if (index >= 0) {
    selectedTasks.value.splice(index, 1)
  } else {
    selectedTasks.value.push(task.id)
  }
}

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedTasks.value = filteredTasks.value.map(task => task.id)
  } else {
    selectedTasks.value = []
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedTasks.value = selection.map(task => task.id)
}

const handleCardAction = async ({ action, task }: { action: string, task: any }) => {
  switch (action) {
    case 'edit':
      editTask(task)
      break
    case 'duplicate':
      await duplicateTask(task)
      break
    case 'export':
      await exportTask(task)
      break
    case 'delete':
      await deleteTask(task)
      break
  }
}

const exportTask = async (task: any) => {
  try {
    const data = await exportTemplates([task.id])
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `task-${task.name}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('任务已导出')
  } catch (error) {
    ElMessage.error('导出任务失败：' + error.message)
  }
}

const importTasks = async () => {
  try {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        const importedTasks = JSON.parse(text)
        await importTemplates(importedTasks)
        ElMessage.success(`已导入 ${importedTasks.length} 个任务模板`)
      }
    }
    input.click()
  } catch (error) {
    ElMessage.error('导入任务失败：' + error.message)
  }
}

const exportSelectedTasks = async () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择要导出的任务')
    return
  }

  try {
    const data = await exportTemplates(selectedTasks.value)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('任务已导出')
  } catch (error) {
    ElMessage.error('导出任务失败：' + error.message)
  }
}

const batchExecute = async () => {
  try {
    for (const taskId of selectedTasks.value) {
      await executeTemplate(taskId)
    }
    batchActionVisible.value = false
    ElMessage.success('批量执行已启动')
  } catch (error) {
    ElMessage.error('批量执行失败：' + error.message)
  }
}

const batchExport = async () => {
  await exportSelectedTasks()
  batchActionVisible.value = false
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedTasks.value.length} 个任务吗？`, '确认删除', {
      type: 'warning'
    })
    
    for (const taskId of selectedTasks.value) {
      await deleteTemplate(taskId)
    }
    
    selectedTasks.value = []
    batchActionVisible.value = false
    ElMessage.success('批量删除完成')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败：' + error.message)
    }
  }
}

// 事件处理
const handleTaskSaved = (task: any) => {
  taskEditorVisible.value = false
  
  if (isEditMode.value) {
    updateTemplate(task)
    emit('task-updated', task)
    ElMessage.success('任务模板已更新')
  } else {
    createTemplate(task)
    emit('task-created', task)
    ElMessage.success('任务模板已创建')
  }
}

const handleTaskCancelled = () => {
  taskEditorVisible.value = false
}

// 工具函数
const getTaskIcon = (category: string) => {
  const iconMap = {
    web: Web,
    form: Document,
    data: DataAnalysis,
    test: Tools,
    custom: Setting
  }
  return iconMap[category] || Web
}

const getCategoryType = (category: string) => {
  const typeMap = {
    web: 'primary',
    form: 'success',
    data: 'warning',
    test: 'info',
    custom: 'danger'
  }
  return typeMap[category] || 'primary'
}

const getCategoryText = (category: string) => {
  const textMap = {
    web: '网页操作',
    form: '表单处理',
    data: '数据提取',
    test: '自动化测试',
    custom: '自定义'
  }
  return textMap[category] || category
}

const getComplexityType = (complexity: string) => {
  const typeMap = {
    simple: 'success',
    medium: 'warning',
    complex: 'danger'
  }
  return typeMap[complexity] || 'success'
}

const getComplexityText = (complexity: string) => {
  const textMap = {
    simple: '简单',
    medium: '中等',
    complex: '复杂'
  }
  return textMap[complexity] || complexity
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleDateString()
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.task-manager {
  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);

    .header-info {
      h3 {
        margin: 0 0 var(--spacing-xs) 0;
        color: var(--text-primary);
        font-size: var(--spacing-xl);
        font-weight: 600;
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .search-filters {
    margin-bottom: var(--spacing-xl);
  }

  .tasks-grid {
    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-lg);

      .grid-controls {
        display: flex;
        align-items: center;
        gap: var(--text-sm);

        .selected-count {
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }

      .view-controls {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .grid-view {
      .task-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--text-lg);

        .task-card {
          border: var(--border-width) solid var(--border-color);
          border-radius: var(--spacing-sm);
          padding: var(--text-lg);
          cursor: pointer;
          transition: all var(--transition-normal) ease;

          &:hover {
            border-color: var(--primary-color);
            box-shadow: 0 2px var(--text-sm) var(--shadow-light);
          }

          &.selected {
            border-color: var(--primary-color);
            background: var(--primary-light);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--text-sm);
          }

          .card-content {
            display: flex;
            align-items: flex-start;
            gap: var(--text-sm);
            margin-bottom: var(--text-lg);

            .task-icon {
              width: var(--icon-size); height: var(--icon-size);
              background: var(--primary-light);
              border-radius: var(--radius-md);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--primary-color);
              flex-shrink: 0;

              .el-icon {
                font-size: var(--spacing-xl);
              }
            }

            .task-info {
              flex: 1;
              min-width: 0;

              .task-name {
                margin: 0 0 6px 0;
                color: var(--text-primary);
                font-size: var(--text-lg);
                font-weight: 600;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .task-description {
                margin: 0 0 var(--spacing-sm) 0;
                color: var(--text-secondary);
                font-size: var(--text-base);
                line-height: 1.4;
              }

              .task-meta {
                display: flex;
                gap: var(--spacing-lg);
              }
            }
          }

          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .task-stats {
              display: flex;
              flex-direction: column;
              gap: var(--spacing-xs);

              .stat-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: var(--text-sm);
                color: var(--text-secondary);

                .el-icon {
                  font-size: var(--text-sm);
                }
              }
            }

            .task-actions {
              display: flex;
              gap: var(--spacing-lg);
            }
          }
        }
      }
    }

    .list-view {
      .task-name-cell {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .el-icon {
          color: var(--primary-color);
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-15xl) var(--spacing-xl);
  }

  .batch-actions {
    text-align: center;

    p {
      margin-bottom: var(--spacing-xl);
      color: var(--text-primary);
      font-size: var(--text-lg);
    }

    .el-button {
      margin: 0 var(--spacing-sm);
    }
  }
}
</style>