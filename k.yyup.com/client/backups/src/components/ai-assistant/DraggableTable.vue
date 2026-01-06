<template>
  <div class="draggable-table-container">
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
      row-key="id"
      stripe
      border
      class="draggable-table"
    >
      <el-table-column type="selection" width="55" />
      
      <!-- 拖拽手柄列 -->
      <el-table-column label="排序" width="60" align="center">
        <template #default="{ row }">
          <div class="drag-handle" :title="`拖拽调整 ${row.shortcut_name} 的排序`">
            <el-icon><Rank /></el-icon>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="sort_order" 
        label="序号" 
        width="80"
        align="center"
      >
        <template #default="{ row, $index }">
          <el-tag size="small" type="info">{{ $index + 1 }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="shortcut_name" label="快捷名称" width="150" />
      
      <el-table-column prop="prompt_name" label="提示词名称" width="150" />
      
      <el-table-column prop="category" label="功能类别" width="120">
        <template #default="{ row }">
          <el-tag :type="getCategoryTagType(row.category)">
            {{ getCategoryLabel(row.category) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="role" label="适用角色" width="100">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="api_endpoint" label="API类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.api_endpoint === 'ai_chat' ? 'primary' : 'success'">
            {{ row.api_endpoint === 'ai_chat' ? 'AI聊天' : 'AI查询' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="is_active" label="状态" width="80">
        <template #default="{ row }">
          <el-switch
            v-model="row.is_active"
            @change="handleStatusChange(row)"
            :disabled="!hasUpdatePermission"
          />
        </template>
      </el-table-column>

      <el-table-column prop="created_at" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small" 
            @click="handlePreview(row)"
          >
            预览
          </el-button>
          <el-button 
            type="warning" 
            size="small" 
            @click="handleEdit(row)"
            :disabled="!hasUpdatePermission"
          >
            编辑
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(row)"
            :disabled="!hasDeletePermission"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 拖拽提示 -->
    <div class="drag-tips" v-if="isDragging">
      <el-icon><Rank /></el-icon>
      <span>拖拽到目标位置后松开鼠标</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import Sortable from 'sortablejs'
import { updateSortOrder } from '@/api/ai-shortcuts'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/utils/date'
import { handleDragDropError } from '@/utils/enhancedErrorHandler'

// Props
interface Props {
  tableData: any[]
  loading: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'selection-change': [selection: any[]]
  'status-change': [row: any]
  'preview': [row: any]
  'edit': [row: any]
  'delete': [row: any]
  'sort-change': [newData: any[]]
}>()

// 权限检查
const { hasPermission } = usePermission()
const hasUpdatePermission = computed(() => hasPermission('AI_SHORTCUTS_UPDATE'))
const hasDeletePermission = computed(() => hasPermission('AI_SHORTCUTS_DELETE'))

// 响应式数据
const tableRef = ref()
const isDragging = ref(false)
let sortableInstance: Sortable | null = null

// 类别标签映射
const categoryLabels = {
  enrollment_planning: '招生规划',
  activity_planning: '活动策划',
  progress_analysis: '进展分析',
  follow_up_reminder: '跟进提醒',
  conversion_monitoring: '转化监控',
  age_reminder: '年龄提醒',
  task_management: '任务管理',
  comprehensive_analysis: '综合分析'
}

// 角色标签映射
const roleLabels = {
  principal: '园长',
  admin: '管理员',
  teacher: '教师',
  all: '通用'
}

// 获取类别标签
const getCategoryLabel = (category: string) => {
  return categoryLabels[category] || category
}

// 获取角色标签
const getRoleLabel = (role: string) => {
  return roleLabels[role] || role
}

// 获取类别标签类型
const getCategoryTagType = (category: string) => {
  const typeMap = {
    enrollment_planning: 'primary',
    activity_planning: 'success',
    progress_analysis: 'info',
    follow_up_reminder: 'warning',
    conversion_monitoring: 'danger',
    age_reminder: '',
    task_management: 'primary',
    comprehensive_analysis: 'success'
  }
  return typeMap[category] || ''
}

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  const typeMap = {
    principal: 'danger',
    admin: 'warning',
    teacher: 'success',
    all: 'info'
  }
  return typeMap[role] || ''
}

// 事件处理
const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleStatusChange = (row: any) => {
  emit('status-change', row)
}

const handlePreview = (row: any) => {
  emit('preview', row)
}

const handleEdit = (row: any) => {
  emit('edit', row)
}

const handleDelete = (row: any) => {
  emit('delete', row)
}

// 初始化拖拽排序
const initSortable = () => {
  const tbody = tableRef.value?.$el.querySelector('.el-table__body-wrapper tbody')
  if (!tbody) return

  sortableInstance = Sortable.create(tbody, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    
    onStart: () => {
      isDragging.value = true
    },
    
    onEnd: async (evt) => {
      isDragging.value = false
      
      const { oldIndex, newIndex } = evt
      if (oldIndex === newIndex) return

      try {
        // 创建新的数据数组
        const newData = [...props.tableData]
        const movedItem = newData.splice(oldIndex!, 1)[0]
        newData.splice(newIndex!, 0, movedItem)

        // 更新排序值
        const sortData = newData.map((item, index) => ({
          id: item.id,
          sort_order: index + 1
        }))

        // 调用API更新排序
        await updateSortOrder(sortData)
        
        // 通知父组件数据变化
        emit('sort-change', newData)
        
        ElMessage.success('排序更新成功')
      } catch (error) {
        console.error('排序更新失败:', error)
        handleDragDropError(error, 'DraggableTable')

        // 恢复原始顺序
        const tbody = tableRef.value?.$el.querySelector('.el-table__body-wrapper tbody')
        if (tbody && evt.item) {
          if (oldIndex! < newIndex!) {
            tbody.insertBefore(evt.item, tbody.children[oldIndex!])
          } else {
            tbody.insertBefore(evt.item, tbody.children[oldIndex! + 1])
          }
        }
      }
    }
  })
}

// 销毁拖拽实例
const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

// 生命周期
onMounted(() => {
  // 延迟初始化，确保表格已渲染
  setTimeout(() => {
    initSortable()
  }, 100)
})

onUnmounted(() => {
  destroySortable()
})
</script>

<style scoped lang="scss">
.draggable-table-container {
  position: relative;

  .draggable-table {
    .drag-handle {
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--text-3xl);
      height: var(--text-3xl);
      border-radius: var(--spacing-xs);
      color: var(--info-color);
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-hover);
        color: var(--primary-color);
        transform: scale(1.1);
      }

      &:active {
        cursor: grabbing;
      }
    }
  }

  .drag-tips {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--black-alpha-80);
    color: white;
    padding: var(--text-sm) var(--text-2xl);
    border-radius: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-base);
    z-index: 9999;
    pointer-events: none;
    animation: fadeIn 0.3s ease;

    .el-icon {
      font-size: var(--text-lg);
    }
  }
}

// Sortable样式
:deep(.sortable-ghost) {
  opacity: 0.4;
  background: var(--bg-hover);
}

:deep(.sortable-chosen) {
  background: #ecf5ff;
  
  .drag-handle {
    color: var(--primary-color);
    background: #ecf5ff;
  }
}

:deep(.sortable-drag) {
  background: white;
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
  transform: rotate(2deg);
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

// 表格行悬停效果增强
:deep(.el-table__row) {
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
    transform: translateY(-var(--border-width-base));
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .draggable-table-container {
    .drag-tips {
      font-size: var(--text-sm);
      padding: var(--spacing-sm) var(--text-lg);
    }
  }
}
</style>
