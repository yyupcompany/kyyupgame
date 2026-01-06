<template>
  <el-dialog
    v-model="dialogVisible"
    title="检查任务管理"
    width="900px"
    @close="handleClose"
  >
    <div class="task-header">
      <div class="plan-info">
        <h3>{{ planData?.inspectionType?.name || '检查计划' }}</h3>
        <p>计划日期：{{ planData?.planDate }}</p>
      </div>
      <el-button type="primary" @click="showCreateTask = true">
        <el-icon><Plus /></el-icon>
        创建任务
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tasks"
      style="margin-top: var(--text-lg)"
    >
      <el-table-column prop="title" label="任务名称" min-width="200" />
      <el-table-column label="负责人" width="120">
        <template #default="{ row }">
          {{ row.assignee?.realName || row.assignee?.username || '未分配' }}
        </template>
      </el-table-column>
      <el-table-column prop="dueDate" label="截止日期" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="进度" width="120">
        <template #default="{ row }">
          <el-progress :percentage="row.progress || 0" :stroke-width="8" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEditTask(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDeleteTask(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑任务对话框 -->
    <el-dialog
      v-model="showCreateTask"
      :title="editingTask ? '编辑任务' : '创建任务'"
      width="600px"
      append-to-body
    >
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.title" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="taskForm.assignedTo" placeholder="请选择负责人" style="width: 100%" clearable>
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.realName || user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="taskForm.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="低优先级" value="low" />
            <el-option label="中优先级" value="medium" />
            <el-option label="高优先级" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="taskForm.dueDate"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="taskForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="完成进度">
          <el-slider v-model="taskForm.progress" :max="100" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateTask = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTask" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { inspectionTaskApi, InspectionTask, InspectionTaskStatus, InspectionTaskPriority } from '@/api/endpoints/inspection'
import { request } from '@/utils/request'

interface Props {
  visible: boolean
  planData?: any
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  planData: null
})

const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const loading = ref(false)
const saving = ref(false)
const tasks = ref<InspectionTask[]>([])
const showCreateTask = ref(false)
const editingTask = ref<InspectionTask | null>(null)
const userList = ref<any[]>([])

const taskForm = ref({
  title: '',
  assignedTo: undefined as number | undefined,
  priority: 'medium' as InspectionTaskPriority,
  dueDate: '',
  status: 'pending' as InspectionTaskStatus,
  progress: 0,
  description: ''
})

// 加载用户列表
const loadUserList = async () => {
  try {
    const response = await request.get('/users', { params: { pageSize: 100 } })
    if (response.success) {
      userList.value = response.data.items || []
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 加载任务列表
const loadTasks = async () => {
  if (!props.planData?.id) return

  try {
    loading.value = true
    const response = await inspectionTaskApi.getList(props.planData.id)
    if (response.success) {
      tasks.value = response.data.items || []
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
    ElMessage.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

// 编辑任务
const handleEditTask = (task: InspectionTask) => {
  editingTask.value = task
  taskForm.value = {
    title: task.title,
    assignedTo: task.assignedTo,
    priority: task.priority,
    dueDate: task.dueDate || '',
    status: task.status,
    progress: task.progress || 0,
    description: task.description || ''
  }
  showCreateTask.value = true
}

// 保存任务
const handleSaveTask = async () => {
  try {
    saving.value = true

    if (editingTask.value) {
      // 更新
      const response = await inspectionTaskApi.update(props.planData.id, editingTask.value.id, taskForm.value)
      if (response.success) {
        ElMessage.success('保存成功')
        showCreateTask.value = false
        resetForm()
        loadTasks()
      }
    } else {
      // 创建
      const response = await inspectionTaskApi.create(props.planData.id, taskForm.value)
      if (response.success) {
        ElMessage.success('创建成功')
        showCreateTask.value = false
        resetForm()
        loadTasks()
      }
    }
  } catch (error) {
    console.error('保存任务失败:', error)
    ElMessage.error('保存任务失败')
  } finally {
    saving.value = false
  }
}

// 删除任务
const handleDeleteTask = async (task: InspectionTask) => {
  try {
    await ElMessageBox.confirm('确定删除该任务吗？', '确认', {
      type: 'warning'
    })

    const response = await inspectionTaskApi.delete(props.planData.id, task.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadTasks()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  taskForm.value = {
    title: '',
    assignedTo: undefined,
    priority: 'medium' as InspectionTaskPriority,
    dueDate: '',
    status: 'pending' as InspectionTaskStatus,
    progress: 0,
    description: ''
  }
  editingTask.value = null
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'pending': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}

// 监听对话框打开
watch(() => props.visible, (val) => {
  if (val) {
    loadTasks()
    loadUserList()
  } else {
    tasks.value = []
    showCreateTask.value = false
    editingTask.value = null
  }
})

// 监听创建任务对话框关闭
watch(showCreateTask, (val) => {
  if (!val) {
    resetForm()
  }
})

// 组件挂载时加载用户列表
onMounted(() => {
  loadUserList()
})
</script>

<style scoped lang="scss">
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: var(--text-lg);
  border-bottom: var(--border-width-base) solid #ebeef5;

  .plan-info {
    h3 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }
}
</style>

