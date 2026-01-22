<template>
  <MobileCenterLayout title="pageTitle" back-path="/mobile/centers">
    <div class="mobile-task-form">
      <!-- 表单内容 -->
      <div class="form-container">
        <van-form @submit="handleSave" ref="formRef">
          <!-- 基本信息 -->
          <van-cell-group inset title="基本信息" class="form-section">
            <van-field
              v-model="formData.title"
              name="title"
              label="任务标题"
              placeholder="请输入任务标题"
              :rules="[{ required: true, message: '请输入任务标题' }]"
              required
              clearable
            />

            <van-field
              v-model="formData.description"
              name="description"
              label="任务描述"
              type="textarea"
              placeholder="请输入任务描述"
              :rows="4"
              autosize
              maxlength="500"
              show-word-limit
            />
          </van-cell-group>

          <!-- 任务设置 -->
          <van-cell-group inset title="任务设置" class="form-section">
            <van-field
              v-model="formData.priority"
              name="priority"
              label="优先级"
              placeholder="请选择优先级"
              :rules="[{ required: true, message: '请选择优先级' }]"
              required
              readonly
              is-link
              @click="showPriorityPicker = true"
            >
              <template #right-icon>
                <van-icon name="arrow-down" />
              </template>
            </van-field>

            <van-field
              v-model="statusText"
              name="status"
              label="状态"
              placeholder="请选择状态"
              :rules="[{ required: true, message: '请选择状态' }]"
              required
              readonly
              is-link
              @click="showStatusPicker = true"
            >
              <template #right-icon>
                <van-icon name="arrow-down" />
              </template>
            </van-field>

            <van-field
              v-model="assigneeText"
              name="assignedTo"
              label="分配给"
              placeholder="请选择分配人员"
              readonly
              is-link
              @click="showAssigneePicker = true"
            >
              <template #right-icon>
                <van-icon name="arrow-down" />
              </template>
            </van-field>

            <van-field
              v-model="formData.dueDate"
              name="dueDate"
              label="截止时间"
              placeholder="请选择截止时间"
              readonly
              is-link
              @click="showDatePicker = true"
            >
              <template #right-icon>
                <van-icon name="calendar-o" />
              </template>
            </van-field>
          </van-cell-group>

          <!-- 其他信息 -->
          <van-cell-group inset title="其他信息" class="form-section">
            <van-field
              v-model="formData.tags"
              name="tags"
              label="标签"
              placeholder="请输入标签，多个标签用逗号分隔"
              clearable
            >
              <template #label>
                <div class="label-with-help">
                  <span>标签</span>
                  <van-tag type="primary" size="medium">可选</van-tag>
                </div>
              </template>
            </van-field>

            <!-- 标签预览 -->
            <div class="tags-preview" v-if="tagArray.length > 0">
              <van-tag
                v-for="tag in tagArray"
                :key="tag"
                type="primary"
                size="medium"
                class="tag-item"
              >
                {{ tag }}
              </van-tag>
            </div>
          </van-cell-group>
        </van-form>
      </div>

      <!-- 底部操作栏 -->
      <div class="form-footer">
        <div class="footer-actions">
          <van-button
            plain
            type="default"
            size="large"
            @click="handleGoBack"
            class="cancel-btn"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            size="large"
            :loading="loading"
            loading-text="保存中..."
            @click="handleSave"
            class="submit-btn"
          >
            {{ mode === 'create' ? '创建任务' : '更新任务' }}
          </van-button>
        </div>
      </div>
    </div>

    <!-- 优先级选择器 -->
    <van-popup v-model:show="showPriorityPicker" position="bottom" round>
      <van-picker
        :columns="priorityColumns"
        @confirm="onPriorityConfirm"
        @cancel="showPriorityPicker = false"
        title="选择优先级"
      />
    </van-popup>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom" round>
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
        title="选择状态"
      />
    </van-popup>

    <!-- 分配人员选择器 -->
    <van-popup v-model:show="showAssigneePicker" position="bottom" round>
      <van-picker
        :columns="assigneeColumns"
        @confirm="onAssigneeConfirm"
        @cancel="showAssigneePicker = false"
        title="选择分配人员"
      />
    </van-popup>

    <!-- 日期时间选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="currentDate"
        type="datetime"
        title="选择截止时间"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { createTask, updateTask, getTaskById } from '@/services/task'
import type { Task } from '@/services/task'

// 路由
const router = useRouter()
const route = useRoute()

// 页面状态
const loading = ref(false)
const mode = ref<'create' | 'edit'>('create')
const formRef = ref()

// 弹窗控制
const showPriorityPicker = ref(false)
const showStatusPicker = ref(false)
const showAssigneePicker = ref(false)
const showDatePicker = ref(false)

// 表单数据
const formData = ref({
  id: null as number | null,
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  assignedTo: null as number | null,
  dueDate: null as string | null,
  tags: ''
})

// 日期选择器数据
const currentDate = ref(new Date())
const minDate = new Date()
const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))

// 选择器数据
const priorityColumns = [
  { text: '低', value: 'low' },
  { text: '中', value: 'medium' },
  { text: '高', value: 'high' },
  { text: '紧急', value: 'highest' }
]

const statusColumns = [
  { text: '待处理', value: 'pending' },
  { text: '进行中', value: 'in_progress' },
  { text: '已完成', value: 'completed' },
  { text: '已取消', value: 'cancelled' }
]

const assigneeColumns = [
  { text: '未分配', value: null },
  { text: '张老师', value: 1 },
  { text: '李老师', value: 2 },
  { text: '王老师', value: 3 },
  { text: '刘老师', value: 4 },
  { text: '陈老师', value: 5 }
]

// 计算属性
const pageTitle = computed(() => {
  return mode.value === 'create' ? '新建任务' : '编辑任务'
})

const statusText = computed(() => {
  const status = statusColumns.find(item => item.value === formData.value.status)
  return status?.text || ''
})

const assigneeText = computed(() => {
  const assignee = assigneeColumns.find(item => item.value === formData.value.assignedTo)
  return assignee?.text || ''
})

const tagArray = computed(() => {
  if (!formData.value.tags) return []
  return formData.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
})

// 初始化页面
onMounted(async () => {
  const taskId = route.query.id
  if (taskId) {
    mode.value = 'edit'
    await loadTaskData(taskId as string)
  } else {
    mode.value = 'create'
  }
})

// 加载任务数据
const loadTaskData = async (taskId: string) => {
  try {
    loading.value = true
    showLoadingToast({
      message: '加载任务数据...',
      forbidClick: true,
      duration: 0
    })

    const task = await getTaskById(taskId)

    formData.value = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo || null,
      dueDate: task.dueDate || null,
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || '')
    }

    // 设置截止时间
    if (task.dueDate) {
      currentDate.value = new Date(task.dueDate)
    }

    closeToast()
    showToast({
      type: 'success',
      message: '任务数据加载成功'
    })
  } catch (error) {
    console.error('加载任务数据失败:', error)
    closeToast()
    showToast({
      type: 'fail',
      message: '加载任务数据失败'
    })
  } finally {
    loading.value = false
  }
}

// 选择器确认事件
const onPriorityConfirm = ({ selectedValues }: any) => {
  formData.value.priority = selectedValues[0]
  showPriorityPicker.value = false
}

const onStatusConfirm = ({ selectedValues }: any) => {
  formData.value.status = selectedValues[0]
  showStatusPicker.value = false
}

const onAssigneeConfirm = ({ selectedValues }: any) => {
  formData.value.assignedTo = selectedValues[0]
  showAssigneePicker.value = false
}

const onDateConfirm = (value: Date) => {
  formData.value.dueDate = value.toISOString().slice(0, 16)
  showDatePicker.value = false
}

// 保存任务
const handleSave = async () => {
  try {
    // 表单验证
    if (!formData.value.title.trim()) {
      showToast({
        type: 'fail',
        message: '请输入任务标题'
      })
      return
    }
    if (!formData.value.priority) {
      showToast({
        type: 'fail',
        message: '请选择优先级'
      })
      return
    }
    if (!formData.value.status) {
      showToast({
        type: 'fail',
        message: '请选择状态'
      })
      return
    }

    loading.value = true
    showLoadingToast({
      message: mode.value === 'create' ? '创建任务中...' : '更新任务中...',
      forbidClick: true,
      duration: 0
    })

    console.log('📝 保存任务数据:', formData.value)

    // 处理数据格式
    const submitData = {
      ...formData.value,
      assignedTo: formData.value.assignedTo || null,
      tags: formData.value.tags ? formData.value.tags.split(',').map((tag: string) => tag.trim()) : []
    }

    if (mode.value === 'edit' && submitData.id) {
      await updateTask(submitData.id, submitData)
      showToast({
        type: 'success',
        message: '任务更新成功'
      })
    } else {
      delete submitData.id // 新建时移除id字段
      await createTask(submitData)
      showToast({
        type: 'success',
        message: '任务创建成功'
      })
    }

    closeToast()

    // 延迟返回，让用户看到成功提示
    setTimeout(() => {
      handleGoBack()
    }, 1000)
  } catch (error) {
    console.error('保存任务失败:', error)
    closeToast()
    showToast({
      type: 'fail',
      message: '保存任务失败'
    })
  } finally {
    loading.value = false
  }
}

// 返回任务中心
const handleGoBack = () => {
  router.push('/mobile/centers/task-center')
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-task-form {
  min-height: 100vh;
  background: var(--van-background-color-light);
  padding-bottom: 80px; // 为底部操作栏预留空间

  .form-container {
    padding: var(--spacing-md) 0;

    .form-section {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .label-with-help {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .tags-preview {
      padding: var(--spacing-md) 16px;
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);

      .tag-item {
        margin: 0;
      }
    }
  }

  .form-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--van-background-color-light);
    border-top: 1px solid var(--van-border-color);
    padding: var(--spacing-md) 16px;
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom);

    .footer-actions {
      display: flex;
      gap: var(--spacing-md);
      max-width: 768px;
      margin: 0 auto;

      .cancel-btn,
      .submit-btn {
        flex: 1;
        height: 44px;
        font-weight: 500;
      }

      .cancel-btn {
        border-color: var(--van-border-color);
        color: var(--van-text-color-2);
      }
    }
  }
}

// 表单分组样式调整
:deep(.van-cell-group) {
  .van-cell-group__title {
    padding: var(--spacing-md) 16px 8px;
    font-weight: 600;
    color: var(--van-text-color-1);
    font-size: var(--text-base);
  }

  .van-cell {
    padding: var(--spacing-md);

    &:not(:last-child)::after {
      left: 16px;
      right: 16px;
    }
  }

  .van-field__label {
    width: 80px;
    font-weight: 500;
  }

  .van-field__control {
    font-size: var(--text-sm);
  }
}

// 弹窗样式
:deep(.van-popup) {
  border-radius: 16px 16px 0 0;
}

:deep(.van-picker) {
  .van-picker__toolbar {
    padding: var(--spacing-md) 16px;
    border-bottom: 1px solid var(--van-border-color);
  }

  .van-picker__confirm {
    color: var(--van-primary-color);
    font-weight: 500;
  }
}

:deep(.van-date-picker) {
  .van-picker__toolbar {
    padding: var(--spacing-md) 16px;
    border-bottom: 1px solid var(--van-border-color);
  }

  .van-picker__confirm {
    color: var(--van-primary-color);
    font-weight: 500;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-task-form {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);

    .form-container {
      padding: var(--spacing-lg) 0;
    }

    .form-footer {
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 768px;
    }
  }
}
</style>