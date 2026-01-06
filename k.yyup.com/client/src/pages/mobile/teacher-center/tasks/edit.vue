<template>
  <MobileMainLayout
    title="编辑任务"
    :show-nav-bar="true"
    :show-back="true"
    :show-tab-bar="false"
  >
    <div class="edit-task-page" v-if="!loading && taskDetail">
      <van-form @submit="handleSubmit">
        <van-card class="form-card">
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="edit" />
              基本信息
            </h3>
            
            <van-field
              v-model="form.title"
              name="title"
              label="任务标题"
              placeholder="请输入任务标题"
              :rules="[{ required: true, message: '请输入任务标题' }]"
              required
            />
            
            <van-field
              v-model="form.description"
              name="description"
              label="任务描述"
              type="textarea"
              placeholder="请输入任务描述"
              rows="4"
              autosize
              maxlength="500"
              show-word-limit
            />
          </div>

          <!-- 状态和优先级 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="flag-o" />
              状态设置
            </h3>
            
            <van-field
              name="status"
              label="任务状态"
              placeholder="选择状态"
              readonly
              is-link
              :value="getStatusText(form.status)"
              @click="showStatusPicker = true"
              :rules="[{ required: true, message: '请选择任务状态' }]"
              required
            />
            
            <van-field
              name="priority"
              label="优先级"
              placeholder="选择优先级"
              readonly
              is-link
              :value="getPriorityText(form.priority)"
              @click="showPriorityPicker = true"
              :rules="[{ required: true, message: '请选择优先级' }]"
              required
            />
          </div>

          <!-- 进度设置 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="chart-trending-o" />
              进度设置
            </h3>
            
            <van-field name="progress" label="完成进度">
              <template #input>
                <div class="progress-input">
                  <van-slider
                    v-model="form.progress"
                    :min="0"
                    :max="100"
                    :step="5"
                    bar-height="6"
                    button-size="20"
                    active-color="#409eff"
                  />
                  <span class="progress-text">{{ form.progress }}%</span>
                </div>
              </template>
            </van-field>
          </div>

          <!-- 时间设置 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="clock-o" />
              时间设置
            </h3>
            
            <van-field
              name="dueDate"
              label="截止时间"
              placeholder="选择截止时间"
              readonly
              is-link
              :value="formatDateDisplay(form.dueDate)"
              @click="showDatePicker = true"
              :rules="[{ required: true, message: '请选择截止时间' }]"
              required
            />
          </div>

          <!-- 分配设置 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="user-o" />
              分配设置
            </h3>
            
            <van-field
              name="assignee"
              label="分配给"
              placeholder="选择执行人"
              readonly
              is-link
              :value="form.assigneeName"
              @click="showAssigneePicker = true"
            />
          </div>

          <!-- 提醒设置 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="bell" />
              提醒设置
            </h3>
            
            <van-field name="reminder">
              <template #label>
                <div class="switch-label">
                  <span>截止提醒</span>
                  <van-switch
                    v-model="form.reminder"
                    size="small"
                  />
                </div>
              </template>
            </van-field>
            
            <van-field
              v-if="form.reminder"
              name="reminderTime"
              label="提醒时间"
              placeholder="选择提醒时间"
              readonly
              is-link
              :value="getReminderText(form.reminderTime)"
              @click="showReminderPicker = true"
            />
          </div>

          <!-- 附件管理 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="folder-o" />
              附件管理
            </h3>
            
            <van-uploader
              v-model="form.attachments"
              :after-read="handleAfterRead"
              :before-delete="handleBeforeDelete"
              preview-size="60"
              multiple
              :max-count="9"
            />
          </div>

          <!-- 标签设置 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="label-o" />
              标签设置
            </h3>
            
            <van-field
              name="tags"
              label="任务标签"
              placeholder="添加标签"
            >
              <template #input>
                <van-tag
                  v-for="tag in form.tags"
                  :key="tag"
                  closeable
                  size="medium"
                  type="primary"
                  class="tag-item"
                  @close="removeTag(tag)"
                >
                  {{ tag }}
                </van-tag>
                <van-button
                  v-if="form.tags.length < 5"
                  size="mini"
                  type="primary"
                  plain
                  @click="showTagInput = true"
                >
                  + 添加标签
                </van-button>
              </template>
            </van-field>
          </div>
        </van-card>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <van-button
            block
            type="primary"
            native-type="submit"
            :loading="submitting"
            size="large"
          >
            {{ submitting ? '保存中...' : '保存修改' }}
          </van-button>
          
          <van-button
            block
            @click="handleCancel"
            size="large"
          >
            取消
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <van-loading type="spinner" size="24" vertical>加载中...</van-loading>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <van-empty description="任务不存在或已删除" image="error">
        <van-button type="primary" @click="goBack">返回列表</van-button>
      </van-empty>
    </div>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>

    <!-- 优先级选择器 -->
    <van-popup v-model:show="showPriorityPicker" position="bottom">
      <van-picker
        :columns="priorityColumns"
        @confirm="onPriorityConfirm"
        @cancel="showPriorityPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 执行人选择器 -->
    <van-popup v-model:show="showAssigneePicker" position="bottom">
      <van-picker
        :columns="assigneeColumns"
        @confirm="onAssigneeConfirm"
        @cancel="showAssigneePicker = false"
      />
    </van-popup>

    <!-- 提醒时间选择器 -->
    <van-popup v-model:show="showReminderPicker" position="bottom">
      <van-picker
        :columns="reminderColumns"
        @confirm="onReminderConfirm"
        @cancel="showReminderPicker = false"
      />
    </van-popup>

    <!-- 标签输入弹窗 -->
    <van-dialog
      v-model:show="showTagInput"
      title="添加标签"
      @confirm="addTag"
      @cancel="newTag = ''"
    >
      <van-field
        v-model="newTag"
        placeholder="请输入标签名称"
        maxlength="10"
        show-word-limit
      />
    </van-dialog>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import { teacherTasksApi, type Task, type UpdateTaskData } from '@/api/modules/teacher-tasks'
import MobileMainLayout from "@/components/mobile/layouts/MobileMainLayout.vue"

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const submitting = ref(false)
const taskDetail = ref<Task | null>(null)
const showStatusPicker = ref(false)
const showPriorityPicker = ref(false)
const showDatePicker = ref(false)
const showAssigneePicker = ref(false)
const showReminderPicker = ref(false)
const showTagInput = ref(false)
const selectedDate = ref(new Date())
const newTag = ref('')

// 表单数据
const form = reactive({
  title: '',
  description: '',
  status: '',
  priority: '',
  progress: 0,
  dueDate: '',
  assignee: '',
  assigneeName: '',
  reminder: false,
  reminderTime: '1hour',
  attachments: [],
  tags: []
})

// 选择器配置
const statusColumns = [
  { text: '待处理', value: 'pending' },
  { text: '进行中', value: 'in_progress' },
  { text: '已完成', value: 'completed' },
  { text: '已逾期', value: 'overdue' }
]

const priorityColumns = [
  { text: '高优先级', value: 'high' },
  { text: '中优先级', value: 'medium' },
  { text: '低优先级', value: 'low' }
]

const assigneeColumns = [
  { text: '我自己', value: 'self', name: '我' },
  { text: '张老师', value: '1', name: '张老师' },
  { text: '李老师', value: '2', name: '李老师' },
  { text: '王老师', value: '3', name: '王老师' }
]

const reminderColumns = [
  { text: '提前1小时', value: '1hour' },
  { text: '提前2小时', value: '2hour' },
  { text: '提前6小时', value: '6hour' },
  { text: '提前1天', value: '1day' },
  { text: '提前2天', value: '2day' }
]

// 日期配置
const minDate = new Date()
const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))

// 方法
const getStatusText = (status: string) => {
  const textMap = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return textMap[status] || '待处理'
}

const getPriorityText = (priority: string) => {
  const textMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return textMap[priority] || ''
}

const formatDateDisplay = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getReminderText = (time: string) => {
  const textMap = {
    '1hour': '提前1小时',
    '2hour': '提前2小时',
    '6hour': '提前6小时',
    '1day': '提前1天',
    '2day': '提前2天'
  }
  return textMap[time] || ''
}

const onStatusConfirm = ({ selectedValues }: any) => {
  form.status = selectedValues[0]
  showStatusPicker.value = false
}

const onPriorityConfirm = ({ selectedValues }: any) => {
  form.priority = selectedValues[0]
  showPriorityPicker.value = false
}

const onDateConfirm = () => {
  form.dueDate = selectedDate.value.toISOString()
  showDatePicker.value = false
}

const onAssigneeConfirm = ({ selectedValues, selectedOptions }: any) => {
  form.assignee = selectedValues[0]
  form.assigneeName = selectedOptions[0]?.text || ''
  showAssigneePicker.value = false
}

const onReminderConfirm = ({ selectedValues }: any) => {
  form.reminderTime = selectedValues[0]
  showReminderPicker.value = false
}

const addTag = () => {
  if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
    form.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

const handleAfterRead = (file: any) => {
  // 文件上传逻辑
  console.log('文件上传:', file)
}

const handleBeforeDelete = (file: any, detail: any) => {
  return new Promise((resolve) => {
    showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个附件吗？',
    }).then(() => {
      resolve(true)
    }).catch(() => {
      resolve(false)
    })
  })
}

const handleSubmit = async () => {
  if (submitting.value || !taskDetail.value) return
  
  submitting.value = true
  
  try {
    const updateData: UpdateTaskData = {
      title: form.title,
      description: form.description,
      status: form.status as any,
      priority: form.priority as any,
      progress: form.progress,
      dueDate: form.dueDate
    }
    
    await teacherTasksApi.updateTask(taskDetail.value.id, updateData)
    
    showSuccessToast('任务更新成功')
    router.back()
  } catch (error) {
    console.error('更新任务失败:', error)
    showToast('更新任务失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleCancel = async () => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消编辑吗？未保存的修改将丢失。',
    })
    goBack()
  } catch {
    // 用户取消
  }
}

const goBack = () => {
  router.back()
}

const loadTaskDetail = async () => {
  const taskId = route.query.id as string
  if (!taskId) {
    loading.value = false
    return
  }
  
  loading.value = true
  
  try {
    const task = await teacherTasksApi.getTaskDetail(Number(taskId))
    taskDetail.value = task
    
    // 填充表单数据
    form.title = task.title
    form.description = task.description || ''
    form.status = task.status
    form.priority = task.priority
    form.progress = task.progress || 0
    form.dueDate = task.dueDate
    form.assignee = task.assignee || 'self'
    form.assigneeName = task.assigneeName || '我'
    form.reminder = task.reminder || false
    form.reminderTime = task.reminderTime || '1hour'
    form.attachments = task.attachments || []
    form.tags = task.tags || []
    
    // 设置日期选择器的默认值
    if (task.dueDate) {
      selectedDate.value = new Date(task.dueDate)
    }
  } catch (error) {
    console.error('加载任务详情失败:', error)
    taskDetail.value = null
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTaskDetail()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.edit-task-page {
  padding: 0 0 20px 0;
  background-color: #f7f8fa;
  min-height: calc(100vh - 46px);
}

.form-card {
  margin: var(--spacing-md);
  border-radius: 12px;
  overflow: hidden;
}

.form-section {
  padding: var(--spacing-md);
  
  &:not(:last-child) {
    border-bottom: 1px solid #ebedf0;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin: 0 0 16px 0;
    font-size: var(--text-base);
    font-weight: 600;
    color: #323233;
    
    .van-icon {
      color: var(--primary-color);
    }
  }
}

.progress-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  
  .van-slider {
    flex: 1;
  }
  
  .progress-text {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #323233;
    min-width: 45px;
    text-align: right;
  }
}

.switch-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.form-actions {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: var(--spacing-lg);
}

// Vant组件样式覆盖
:deep(.van-field) {
  .van-field__label {
    font-weight: 500;
    color: #646566;
  }
}

:deep(.van-uploader) {
  .van-uploader__preview {
    margin: 0 8px 8px 0;
  }
}

:deep(.van-cell-group) {
  background-color: transparent;
  
  .van-cell {
    background-color: transparent;
    padding: 10px 0;
    
    &:not(:last-child)::after {
      border-bottom: none;
    }
  }
}

:deep(.van-slider) {
  .van-slider__button {
    width: 20px;
    height: 20px;
  }
}

:deep(.van-picker) {
  .van-picker__confirm {
    color: var(--primary-color);
  }
}

:deep(.van-dialog) {
  .van-dialog__content {
    padding: var(--spacing-lg) 16px;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .edit-task-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>