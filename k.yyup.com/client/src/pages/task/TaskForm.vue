<template>
  <div class="task-form">
    <!-- 头部导航 -->
    <div class="page-header">
      <van-nav-bar
        :title="pageTitle"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
        placeholder
      />
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <van-form @submit="onSubmit">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>

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
            rows="3"
          />

          <van-field
            name="type"
            label="任务类型"
            placeholder="请选择任务类型"
            readonly
            @click="showTypePicker = true"
            :value="getTypeLabel(form.type)"
            :rules="[{ required: true, message: '请选择任务类型' }]"
            required
          />

          <van-field
            name="priority"
            label="优先级"
            placeholder="请选择优先级"
            readonly
            @click="showPriorityPicker = true"
            :value="getPriorityLabel(form.priority)"
            :rules="[{ required: true, message: '请选择优先级' }]"
            required
          />

          <van-field
            name="status"
            label="任务状态"
            placeholder="请选择任务状态"
            readonly
            @click="showStatusPicker = true"
            :value="getStatusLabel(form.status)"
            :rules="[{ required: true, message: '请选择任务状态' }]"
            required
          />
        </div>

        <!-- 时间设置 -->
        <div class="form-section">
          <h3>时间设置</h3>

          <van-field
            name="startDate"
            label="开始时间"
            placeholder="请选择开始时间"
            readonly
            @click="showStartDatePicker = true"
            :value="formatDate(form.startDate)"
            :rules="[{ required: true, message: '请选择开始时间' }]"
            required
          />

          <van-field
            name="dueDate"
            label="截止时间"
            placeholder="请选择截止时间"
            readonly
            @click="showDueDatePicker = true"
            :value="formatDate(form.dueDate)"
            :rules="[{ required: true, message: '请选择截止时间' }]"
            required
          />

          <van-field
            name="estimatedHours"
            label="预计工时"
            type="number"
            placeholder="请输入预计工时（小时）"
            v-model="form.estimatedHours"
          />
        </div>

        <!-- 分配信息 -->
        <div class="form-section">
          <h3>分配信息</h3>

          <van-field
            v-model="selectedAssigneeName"
            name="assignee"
            label="指派给"
            placeholder="请选择执行人"
            readonly
            @click="showAssigneePicker = true"
            :rules="[{ required: true, message: '请选择执行人' }]"
            required
          />

          <van-field
            v-model="selectedCreatorName"
            name="creator"
            label="创建人"
            placeholder="请选择创建人"
            readonly
            @click="showCreatorPicker = true"
            :rules="[{ required: true, message: '请选择创建人' }]"
            required
          />
        </div>

        <!-- 标签和附件 -->
        <div class="form-section">
          <h3>标签和附件</h3>

          <van-field name="tags" label="标签">
            <template #input>
              <div class="tags-container">
                <van-tag
                  v-for="tag in form.tags"
                  :key="tag"
                  closeable
                  @close="removeTag(tag)"
                  type="primary"
                  size="medium"
                  class="tag-item"
                >
                  {{ tag }}
                </van-tag>
                <van-button
                  size="small"
                  type="default"
                  @click="showTagInput = true"
                  class="add-tag-btn"
                >
                  添加标签
                </van-button>
              </div>
            </template>
          </van-field>

          <van-field name="attachments" label="附件">
            <template #input>
              <div class="attachments-container">
                <div
                  v-for="(attachment, index) in form.attachments"
                  :key="index"
                  class="attachment-item"
                >
                  <van-icon name="description" />
                  <span class="attachment-name">{{ attachment.name }}</span>
                  <van-icon
                    name="cross"
                    @click="removeAttachment(index)"
                    class="remove-attachment"
                  />
                </div>
                <van-uploader
                  :after-read="onAttachmentUpload"
                  accept="*/*"
                  multiple
                  class="attachment-uploader"
                >
                  <van-button size="small" type="default">
                    上传附件
                  </van-button>
                </van-uploader>
              </div>
            </template>
          </van-field>
        </div>

        <!-- 子任务 -->
        <div class="form-section">
          <h3>子任务</h3>

          <div class="subtasks-container">
            <div
              v-for="(subtask, index) in form.subtasks"
              :key="index"
              class="subtask-item"
            >
              <van-field
                v-model="subtask.title"
                placeholder="子任务标题"
                :rules="[{ required: true, message: '请输入子任务标题' }]"
              />
              <div class="subtask-actions">
                <van-checkbox
                  v-model="subtask.completed"
                  class="subtask-checkbox"
                >
                  已完成
                </van-checkbox>
                <van-icon
                  name="delete"
                  @click="removeSubtask(index)"
                  class="remove-subtask"
                />
              </div>
            </div>

            <van-button
              size="small"
              type="default"
              @click="addSubtask"
              class="add-subtask-btn"
            >
              添加子任务
            </van-button>
          </div>
        </div>
      </van-form>
    </div>

    <!-- 底部操作 -->
    <div class="action-buttons">
      <van-button
        type="primary"
        block
        size="large"
        @click="onSubmit"
        :loading="submitting"
        :disabled="!isFormValid"
      >
        {{ isEdit ? '更新任务' : '创建任务' }}
      </van-button>
    </div>

    <!-- 选择器弹窗 -->
    <!-- 任务类型选择 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
        title="选择任务类型"
      />
    </van-popup>

    <!-- 优先级选择 -->
    <van-popup v-model:show="showPriorityPicker" position="bottom">
      <van-picker
        :columns="priorityColumns"
        @confirm="onPriorityConfirm"
        @cancel="showPriorityPicker = false"
        title="选择优先级"
      />
    </van-popup>

    <!-- 状态选择 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
        title="选择任务状态"
      />
    </van-popup>

    <!-- 开始时间选择 -->
    <van-popup v-model:show="showStartDatePicker" position="bottom">
            <van-date-picker
        v-model="startDateValue"
        type="datetime"
        title="选择开始时间"
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
    </van-popup>

    <!-- 截止时间选择 -->
    <van-popup v-model:show="showDueDatePicker" position="bottom">
            <van-date-picker
        v-model="dueDateValue"
        type="datetime"
        title="选择截止时间"
        @confirm="onDueDateConfirm"
        @cancel="showDueDatePicker = false"
      />
    </van-popup>

    <!-- 执行人选择 -->
    <van-popup v-model:show="showAssigneePicker" position="bottom">
      <van-picker
        :columns="userColumns"
        @confirm="onAssigneeConfirm"
        @cancel="showAssigneePicker = false"
        title="选择执行人"
      />
    </van-popup>

    <!-- 创建人选择 -->
    <van-popup v-model:show="showCreatorPicker" position="bottom">
      <van-picker
        :columns="userColumns"
        @confirm="onCreatorConfirm"
        @cancel="showCreatorPicker = false"
        title="选择创建人"
      />
    </van-popup>

    <!-- 标签输入弹窗 -->
    <van-popup v-model:show="showTagInput" position="bottom">
      <div class="tag-input-dialog">
        <div class="dialog-header">
          <h3>添加标签</h3>
          <van-icon name="cross" @click="showTagInput = false" />
        </div>
        <div class="dialog-content">
          <van-field
            v-model="newTag"
            placeholder="请输入标签名称"
            @keyup.enter="addTag"
          />
          <div class="common-tags">
            <span class="common-tags-label">常用标签：</span>
            <van-tag
              v-for="tag in commonTags"
              :key="tag"
              @click="addCommonTag(tag)"
              type="default"
              size="small"
              class="common-tag"
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>
        <div class="dialog-actions">
          <van-button @click="showTagInput = false">取消</van-button>
          <van-button type="primary" @click="addTag">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, showSuccessToast, showFailToast } from 'vant'

const route = useRoute()
const router = useRouter()

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 页面标题
const pageTitle = computed(() => isEdit.value ? '编辑任务' : '创建任务')

// 表单数据
const form = ref({
  title: '',
  description: '',
  type: '',
  priority: '',
  status: 'pending',
  startDate: '',
  dueDate: '',
  estimatedHours: '',
  assigneeId: '',
  creatorId: '',
  tags: [] as string[],
  attachments: [] as any[],
  subtasks: [] as any[]
})

// 原始数据（用于比较变化）
const originalForm = ref<any>({})

// 状态
const submitting = ref(false)
const showTypePicker = ref(false)
const showPriorityPicker = ref(false)
const showStatusPicker = ref(false)
const showStartDatePicker = ref(false)
const showDueDatePicker = ref(false)
const showAssigneePicker = ref(false)
const showCreatorPicker = ref(false)
const showTagInput = ref(false)
const newTag = ref('')
const selectedAssigneeName = ref('')
const selectedCreatorName = ref('')
const startDateValue = ref(new Date())
const dueDateValue = ref(new Date())

// 选项数据
const typeColumns = [
  { text: '教学任务', value: 'teaching' },
  { text: '行政任务', value: 'administrative' },
  { text: '活动任务', value: 'activity' },
  { text: '维护任务', value: 'maintenance' },
  { text: '其他任务', value: 'other' }
]

const priorityColumns = [
  { text: '高', value: 'high' },
  { text: '中', value: 'medium' },
  { text: '低', value: 'low' }
]

const statusColumns = [
  { text: '待开始', value: 'pending' },
  { text: '进行中', value: 'in_progress' },
  { text: '已完成', value: 'completed' },
  { text: '已取消', value: 'cancelled' }
]

const userColumns = [
  { text: '张老师', value: 1 },
  { text: '李老师', value: 2 },
  { text: '王老师', value: 3 },
  { text: '刘老师', value: 4 },
  { text: '陈老师', value: 5 }
]

const commonTags = [
  '紧急', '重要', '会议', '报告', '备课', '家长沟通', '学生管理', '活动策划'
]

// 计算属性
const isFormValid = computed(() => {
  return form.value.title &&
         form.value.type &&
         form.value.priority &&
         form.value.status &&
         form.value.startDate &&
         form.value.dueDate &&
         form.value.assigneeId &&
         form.value.creatorId
})

// 方法
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    teaching: '教学任务',
    administrative: '行政任务',
    activity: '活动任务',
    maintenance: '维护任务',
    other: '其他任务'
  }
  return typeMap[type] || type
}

const getPriorityLabel = (priority: string) => {
  const priorityMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return priorityMap[priority] || priority
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const onTypeConfirm = ({ selectedValues }: any) => {
  form.value.type = selectedValues[0].value
  showTypePicker.value = false
}

const onPriorityConfirm = ({ selectedValues }: any) => {
  form.value.priority = selectedValues[0].value
  showPriorityPicker.value = false
}

const onStatusConfirm = ({ selectedValues }: any) => {
  form.value.status = selectedValues[0].value
  showStatusPicker.value = false
}

const onStartDateConfirm = (value: Date) => {
  form.value.startDate = value.toISOString()
  showStartDatePicker.value = false
}

const onDueDateConfirm = (value: Date) => {
  form.value.dueDate = value.toISOString()
  showDueDatePicker.value = false
}

const onAssigneeConfirm = ({ selectedValues }: any) => {
  form.value.assigneeId = selectedValues[0].value
  selectedAssigneeName.value = selectedValues[0].text
  showAssigneePicker.value = false
}

const onCreatorConfirm = ({ selectedValues }: any) => {
  form.value.creatorId = selectedValues[0].value
  selectedCreatorName.value = selectedValues[0].text
  showCreatorPicker.value = false
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
    showTagInput.value = false
  }
}

const addCommonTag = (tag: string) => {
  if (!form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
}

const removeTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  }
}

const onAttachmentUpload = (file: any) => {
  const attachment = {
    name: file.file.name,
    size: file.file.size,
    type: file.file.type,
    url: URL.createObjectURL(file.file)
  }
  form.value.attachments.push(attachment)
}

const removeAttachment = (index: number) => {
  form.value.attachments.splice(index, 1)
}

const addSubtask = () => {
  form.value.subtasks.push({
    title: '',
    completed: false
  })
}

const removeSubtask = (index: number) => {
  form.value.subtasks.splice(index, 1)
}

const loadTaskDetail = async () => {
  if (!isEdit.value) return

  try {
    showLoadingToast('加载中...')
    const taskId = route.params.id

    // 这里应该调用实际的API
    // const response = await taskApi.getTaskDetail(taskId)

    // 模拟数据
    const mockTaskData = {
      id: taskId,
      title: '准备下周教学计划',
      description: '需要为下周的数学和语言课程准备详细的教学计划和教具',
      type: 'teaching',
      priority: 'high',
      status: 'in_progress',
      startDate: '2025-12-12T09:00:00Z',
      dueDate: '2025-12-15T18:00:00Z',
      estimatedHours: 8,
      assigneeId: 1,
      creatorId: 2,
      tags: ['重要', '教学', '下周'],
      attachments: [
        { name: '教学大纲.pdf', size: 1024000, type: 'application/pdf' }
      ],
      subtasks: [
        { title: '准备数学教具', completed: true },
        { title: '编写语言教案', completed: false }
      ]
    }

    // 填充表单
    form.value = { ...mockTaskData }
    selectedAssigneeName.value = '张老师'
    selectedCreatorName.value = '李老师'
    startDateValue.value = new Date(mockTaskData.startDate)
    dueDateValue.value = new Date(mockTaskData.dueDate)
    originalForm.value = JSON.parse(JSON.stringify(mockTaskData))

  } catch (error) {
    console.error('加载任务详情失败:', error)
    showFailToast('加载失败')
  }
}

const onSubmit = async () => {
  try {
    submitting.value = true
    showLoadingToast(isEdit.value ? '更新中...' : '创建中...')

    // 这里应该调用实际的API
    if (isEdit.value) {
      // await taskApi.updateTask(route.params.id, form.value)
    } else {
      // await taskApi.createTask(form.value)
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    showSuccessToast(isEdit.value ? '更新成功' : '创建成功')
    router.go(-1)

  } catch (error) {
    console.error('保存失败:', error)
    showFailToast('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTaskDetail()
})
</script>

<style scoped lang="scss">
.task-form {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.page-header {
  :deep(.van-nav-bar) {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.form-content {
  padding: var(--spacing-md);

  .form-section {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-lg);
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    h3 {
      color: #333;
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 20px 0;
    }

    :deep(.van-field) {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    align-items: center;

    .tag-item {
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .add-tag-btn {
      margin-bottom: 8px;
    }
  }

  .attachments-container {
    .attachment-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) 12px;
      background: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 8px;

      .attachment-name {
        flex: 1;
        font-size: var(--text-sm);
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .remove-attachment {
        color: #999;
        cursor: pointer;

        &:hover {
          color: #ff4d4f;
        }
      }
    }

    .attachment-uploader {
      margin-top: 8px;
    }
  }

  .subtasks-container {
    .subtask-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: 12px;

      .van-field {
        flex: 1;
        margin-bottom: 0;
      }

      .subtask-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .subtask-checkbox {
          flex-shrink: 0;
        }

        .remove-subtask {
          color: #999;
          cursor: pointer;
          flex-shrink: 0;

          &:hover {
            color: #ff4d4f;
          }
        }
      }
    }

    .add-subtask-btn {
      width: 100%;
    }
  }
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.tag-input-dialog {
  padding: var(--spacing-lg);

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .van-icon {
      font-size: var(--text-xl);
      color: #999;
      cursor: pointer;
    }
  }

  .dialog-content {
    margin-bottom: 20px;

    .common-tags {
      margin-top: 12px;

      .common-tags-label {
        font-size: var(--text-sm);
        color: #666;
        margin-right: 8px;
      }

      .common-tag {
        margin-right: 8px;
        margin-bottom: 8px;
        cursor: pointer;
      }
    }
  }

  .dialog-actions {
    display: flex;
    gap: var(--spacing-md);

    .van-button {
      flex: 1;
    }
  }
}
</style>