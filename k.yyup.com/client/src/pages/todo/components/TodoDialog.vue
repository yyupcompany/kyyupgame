<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑待办事项' : '新建待办事项'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入待办事项标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入详细描述（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <el-radio-group v-model="form.priority">
          <el-radio :label="3">低</el-radio>
          <el-radio :label="2">中</el-radio>
          <el-radio :label="1">高</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="待处理" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>

      <el-form-item label="截止时间" prop="dueDate">
        <el-date-picker
          v-model="form.dueDate"
          type="datetime"
          placeholder="请选择截止时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="提醒设置">
        <div class="reminder-settings">
          <el-switch
            v-model="enableReminder"
            active-text="开启提醒"
            inactive-text="关闭提醒"
          />
          <div v-if="enableReminder" class="reminder-options">
            <el-select
              v-model="form.reminderTime"
              placeholder="提醒时间"
              style="width: 100%; margin-top: var(--spacing-sm)"
            >
              <el-option label="截止前15分钟" value="15" />
              <el-option label="截止前30分钟" value="30" />
              <el-option label="截止前1小时" value="60" />
              <el-option label="截止前2小时" value="120" />
              <el-option label="截止前1天" value="1440" />
            </el-select>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          placeholder="请选择或输入标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in presetTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="关联项目" prop="relatedProject">
        <el-select
          v-model="form.relatedProject"
          placeholder="请选择关联项目（可选）"
          filterable
          style="width: 100%"
        >
          <el-option label="招生项目" value="enrollment" />
          <el-option label="活动项目" value="activity" />
          <el-option label="教学项目" value="teaching" />
          <el-option label="财务项目" value="finance" />
          <el-option label="其他项目" value="other" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import * as todoApi from '@/api/modules/dashboard'
import type { Todo } from '@/api/modules/dashboard'

interface Props {
  modelValue: boolean
  todo?: Todo | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 响应式数据
const submitting = ref(false)
const enableReminder = ref(false)

// 表单数据
const form = reactive({
  title: '',
  description: '',
  priority: 2, // 默认中优先级
  status: 'pending',
  dueDate: '',
  reminderTime: '60', // 默认1小时前提醒
  tags: [] as string[],
  relatedProject: ''
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入待办事项标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2-100个字符之间', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 预设标签
const presetTags = [
  '工作',
  '学习',
  '紧急',
  '重要',
  '个人',
  '会议',
  '报告',
  '审核',
  '开发',
  '其他'
]

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.todo)

// 监听todo变化，填充表单
watch(() => props.todo, (newTodo) => {
  if (newTodo) {
    form.title = newTodo.title || ''
    form.description = newTodo.content || newTodo.description || ''
    form.priority = newTodo.priority || 2
    form.status = newTodo.status || 'pending'
    form.dueDate = newTodo.dueDate ? new Date(newTodo.dueDate).toISOString().slice(0, 19).replace('T', ' ') : ''
    form.tags = newTodo.tags || []
    form.relatedProject = newTodo.relatedProject || ''
    enableReminder.value = !!newTodo.reminderTime
    form.reminderTime = newTodo.reminderTime || '60'
  }
}, { immediate: true })

// 监听对话框打开，重置表单
watch(dialogVisible, (visible) => {
  if (visible && !props.todo) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  form.title = ''
  form.description = ''
  form.priority = 2
  form.status = 'pending'
  form.dueDate = ''
  form.tags = []
  form.relatedProject = ''
  enableReminder.value = false
  form.reminderTime = '60'
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    const submitData = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
      tags: form.tags,
      relatedProject: form.relatedProject,
      reminderTime: enableReminder.value ? parseInt(form.reminderTime) : undefined
    }

    if (isEdit.value && props.todo) {
      // 编辑模式
      const response = await todoApi.updateTodo(props.todo.id, submitData)
      if (response.success) {
        ElMessage.success('更新成功')
      }
    } else {
      // 新建模式
      const response = await todoApi.createTodo(submitData)
      if (response.success) {
        ElMessage.success('创建成功')
      }
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}

.reminder-settings {
  .reminder-options {
    margin-top: var(--spacing-sm);
  }
}

:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

:deep(.el-dialog__header) {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-dialog__body) {
  padding: var(--spacing-xl);
}

:deep(.el-dialog__footer) {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}
</style>