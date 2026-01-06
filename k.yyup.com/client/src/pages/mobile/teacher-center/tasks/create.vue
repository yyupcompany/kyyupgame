<template>
  <MobileMainLayout
    title="新建任务"
    :show-nav-bar="true"
    :show-back="true"
    :show-tab-bar="false"
  >
    <div class="create-task-page">
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

          <!-- 优先级设置 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="fire" />
              优先级设置
            </h3>
            
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
            
            <van-field
              name="progress"
              label="初始进度"
              placeholder="设置初始进度"
              readonly
              is-link
              :value="form.progress + '%'"
              @click="showProgressPicker = true"
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

          <!-- 附件上传 -->
          <div class="form-section">
            <h3 class="section-title">
              <van-icon name="add-o" />
              附件上传
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
            {{ submitting ? '创建中...' : '创建任务' }}
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

    <!-- 进度选择器 -->
    <van-popup v-model:show="showProgressPicker" position="bottom">
      <van-picker
        :columns="progressColumns"
        @confirm="onProgressConfirm"
        @cancel="showProgressPicker = false"
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
import { teacherTasksApi, type CreateTaskData } from '@/api/modules/teacher-tasks'
import MobileMainLayout from "@/components/mobile/layouts/MobileMainLayout.vue"

const router = useRouter()
const route = useRoute()

// 响应式数据
const submitting = ref(false)
const showPriorityPicker = ref(false)
const showDatePicker = ref(false)
const showAssigneePicker = ref(false)
const showProgressPicker = ref(false)
const showReminderPicker = ref(false)
const showTagInput = ref(false)
const selectedDate = ref(new Date())
const newTag = ref('')

// 表单数据
const form = reactive({
  title: '',
  description: '',
  priority: '',
  dueDate: '',
  assignee: '',
  assigneeName: '',
  progress: 0,
  reminder: false,
  reminderTime: '1hour',
  attachments: [],
  tags: []
})

// 选择器配置
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

const progressColumns = Array.from({ length: 11 }, (_, i) => ({
  text: `${i * 10}%`,
  value: i * 10
}))

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

// 计算属性
const isEdit = computed(() => !!route.query.id)

// 方法
const getPriorityText = (priority: string) => {
  const textMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return textMap[priority as keyof typeof textMap] || ''
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
  return textMap[time as keyof typeof textMap] || ''
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

const onProgressConfirm = ({ selectedValues }: any) => {
  form.progress = selectedValues[0]
  showProgressPicker.value = false
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
  // 这里可以处理文件上传逻辑
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
  if (submitting.value) return
  
  submitting.value = true
  
  try {
    const taskData: CreateTaskData = {
      title: form.title,
      description: form.description,
      priority: form.priority as 'high' | 'medium' | 'low',
      dueDate: form.dueDate
    }
    
    await teacherTasksApi.createTask(taskData)
    
    showSuccessToast('任务创建成功')
    router.back()
  } catch (error) {
    console.error('创建任务失败:', error)
    showToast('创建任务失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleCancel = async () => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消创建任务吗？未保存的内容将丢失。',
    })
    router.back()
  } catch {
    // 用户取消
  }
}

// 生命周期
onMounted(() => {
  // 如果是编辑模式，加载任务数据
  if (isEdit.value) {
    // TODO: 加载任务数据
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.create-task-page {
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
</style>