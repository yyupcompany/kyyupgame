<template>
  <el-dialog
    v-model="visible"
    :title="task ? '编辑任务' : '新建任务'"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="任务标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入任务标题" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="选择优先级" style="width: 100%">
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
              <el-option label="待处理" value="pending" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="截止时间" prop="due_date">
            <el-date-picker
              v-model="form.due_date"
              type="datetime"
              placeholder="选择截止时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="完成进度" prop="progress">
            <el-slider v-model="form.progress" :max="100" show-input />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="任务描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入任务描述"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="form.notes"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 任务详情展示（仅查看模式） -->
      <div v-if="task && !isEditing" class="task-details">
        <el-divider content-position="left">任务信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(task.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(task.updated_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建者">
            {{ task.creator_name || '系统' }}
          </el-descriptions-item>
          <el-descriptions-item label="分配给">
            {{ task.assignee_name || '自己' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button v-if="task && !isEditing" @click="isEditing = true">编辑</el-button>
        <el-button v-if="task && !isEditing" type="danger" @click="handleDelete">删除</el-button>
        <el-button v-if="!task || isEditing" type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Task {
  id?: number
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  due_date: Date | null
  progress: number
  notes?: string
  created_at?: string
  updated_at?: string
  creator_name?: string
  assignee_name?: string
}

interface Props {
  modelValue: boolean
  task?: Task | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: Task): void
  (e: 'delete', task: Task): void
}

const props = withDefaults(defineProps<Props>(), {
  task: null
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const saving = ref(false)
const isEditing = ref(false)

const form = reactive<Task>({
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  due_date: null,
  progress: 0,
  notes: ''
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  due_date: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ]
}

// 重置表单 - 定义在 watch 之前以避免 TDZ 问题
const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: null,
    progress: 0,
    notes: ''
  })
}

// 监听任务数据变化
watch(() => props.task, (newTask) => {
  if (newTask) {
    Object.assign(form, {
      ...newTask,
      due_date: newTask.due_date ? new Date(newTask.due_date) : null
    })
    isEditing.value = false
  } else {
    resetForm()
    isEditing.value = true
  }
}, { immediate: true })

// 监听弹窗显示状态
watch(visible, (newVisible) => {
  if (!newVisible) {
    isEditing.value = false
  }
})

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    const taskData = {
      ...form,
      due_date: form.due_date ? form.due_date.toISOString() : null
    }
    
    emit('save', taskData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  visible.value = false
  resetForm()
}

const handleDelete = () => {
  if (props.task) {
    emit('delete', props.task)
  }
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.task-details {
  margin-top: var(--text-2xl);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
}
</style>
