<template>
  <MobileMainLayout
    title="编辑文档"
    :show-nav-bar="true"
    :show-back="true"
    :show-tab-bar="false"
  >
    <div class="mobile-document-instance-edit">
      <van-loading v-if="loading" type="spinner" color="#1989fa" vertical>
        加载中...
      </van-loading>

      <div v-else-if="document" class="edit-form">
        <van-form @submit="handleSubmit" ref="formRef">
          <!-- 基本信息 -->
          <van-cell-group class="basic-info">
            <van-field
              v-model="form.title"
              name="title"
              label="文档标题"
              placeholder="请输入文档标题"
              required
              :rules="[{ required: true, message: '请输入文档标题' }]"
            />

            <van-field
              :value="document.template?.name"
              label="文档模板"
              readonly
              disabled
            />

            <van-field
              v-model="form.deadline"
              name="deadline"
              label="截止时间"
              placeholder="选择截止时间"
              readonly
              is-link
              @click="showDeadlinePicker = true"
            />
          </van-cell-group>

          <!-- 文档内容编辑 -->
          <van-cell-group class="content-editor">
            <van-cell title="文档内容" />
            <div class="content-field">
              <van-field
                v-model="form.content"
                type="textarea"
                placeholder="请输入文档内容..."
                rows="8"
                autosize
                maxlength="10000"
                show-word-limit
              />
            </div>
          </van-cell-group>

          <!-- 变量填写 -->
          <van-cell-group v-if="templateVariables.length > 0" class="variables-section">
            <van-cell title="变量填写" />
            <van-field
              v-for="variable in templateVariables"
              :key="variable.key"
              v-model="form.filledVariables[variable.key]"
              :name="`variable_${variable.key}`"
              :label="variable.label"
              :placeholder="variable.placeholder"
              :required="variable.required"
              :rules="variable.required ? [{ required: true, message: `请填写${variable.label}` }] : []"
            />
          </van-cell-group>

          <!-- 进度更新 -->
          <van-cell-group class="progress-section">
            <van-cell title="填写进度">
              <template #right-icon>
                <span class="progress-text">{{ form.progress }}%</span>
              </template>
            </van-cell>
            <van-cell>
              <van-slider
                v-model="form.progress"
                :min="0"
                :max="100"
                :step="5"
                bar-height="6px"
                button-size="20px"
                active-color="#1989fa"
              />
            </van-cell>
          </van-cell-group>

          <!-- 操作按钮 -->
          <div class="action-section">
            <van-button
              type="primary"
              native-type="submit"
              block
              round
              :loading="submitting"
              icon="success"
            >
              保存文档
            </van-button>

            <van-button
              v-if="document.status === 'filling'"
              type="success"
              block
              round
              @click="handleSubmitForReview"
              :loading="submitting"
              icon="completed"
              class="action-btn"
            >
              提交审核
            </van-button>

            <van-button
              type="default"
              block
              round
              @click="handlePreview"
              icon="eye-o"
              class="action-btn"
            >
              预览文档
            </van-button>
          </div>
        </van-form>
      </div>

      <van-empty
        v-else
        description="文档不存在或已被删除"
        image="error"
      >
        <van-button type="primary" round @click="goBack">
          返回列表
        </van-button>
      </van-empty>

      <!-- 截止时间选择器 -->
      <van-popup v-model:show="showDeadlinePicker" position="bottom" round>
        <van-date-picker
          v-model="deadlineDate"
          title="选择截止时间"
          @confirm="onDeadlineConfirm"
          @cancel="showDeadlinePicker = false"
          :min-date="new Date()"
        />
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import {
  getInstanceById,
  updateInstance,
  submitForReview,
  type DocumentInstance,
  type UpdateInstanceData
} from '@/api/endpoints/document-instances'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const document = ref<DocumentInstance | null>(null)
const showDeadlinePicker = ref(false)
const deadlineDate = ref<Date>(new Date())
const formRef = ref()

// 表单数据
const form = ref({
  title: '',
  content: '',
  deadline: '',
  progress: 0,
  filledVariables: {} as Record<string, any>
})

// 模板变量 (模拟数据，实际应该从模板API获取)
const templateVariables = ref([
  { key: 'studentName', label: '学生姓名', placeholder: '请输入学生姓名', required: true },
  { key: 'className', label: '班级名称', placeholder: '请输入班级名称', required: true },
  { key: 'teacherName', label: '教师姓名', placeholder: '请输入教师姓名', required: false },
  { key: 'evaluationDate', label: '评估日期', placeholder: '请选择评估日期', required: false }
])

// 方法
const formatDateForPicker = (dateStr: string) => {
  if (!dateStr) return new Date()
  return new Date(dateStr)
}

const formatDateForForm = (date: Date) => {
  return date.toISOString().split('T')[0]
}

// 事件处理
const onDeadlineConfirm = () => {
  form.value.deadline = formatDateForForm(deadlineDate.value)
  showDeadlinePicker.value = false
}

const handleSubmit = async () => {
  if (!document.value || !formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    const updateData: UpdateInstanceData = {
      title: form.value.title,
      content: form.value.content,
      progress: form.value.progress,
      filledVariables: form.value.filledVariables
    }

    if (form.value.deadline) {
      // @ts-ignore - deadline might be part of the update data
      updateData.deadline = form.value.deadline
    }

    const response = await updateInstance(document.value.id, updateData)
    if (response.success) {
      showToast.success('保存成功')
      // 更新本地数据
      document.value = { ...document.value, ...response.data }
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToast.fail('保存失败')
  } finally {
    submitting.value = false
  }
}

const handleSubmitForReview = async () => {
  if (!document.value || !formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    await showConfirmDialog({
      title: '提交审核确认',
      message: '确定要提交此文档进行审核吗？提交后将无法编辑。',
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      confirmButtonColor: '#07c160'
    })

    submitting.value = true

    // 先保存当前修改
    const updateData: UpdateInstanceData = {
      title: form.value.title,
      content: form.value.content,
      progress: form.value.progress,
      filledVariables: form.value.filledVariables
    }

    await updateInstance(document.value.id, updateData)

    // 然后提交审核
    const response = await submitForReview(document.value.id, {
      reviewers: [], // TODO: 根据业务逻辑设置审核人员
      message: '请审核此文档'
    })

    if (response.success) {
      showToast.success('提交审核成功')
      router.push('/mobile/centers/document-instance-list')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('提交审核失败:', error)
      showToast.fail('提交审核失败')
    }
  } finally {
    submitting.value = false
  }
}

const handlePreview = () => {
  if (!document.value) return

  // 在新窗口中预览
  const previewData = {
    title: form.value.title,
    content: form.value.content,
    variables: form.value.filledVariables,
    progress: form.value.progress
  }

  // TODO: 实现预览功能，可以跳转到预览页面或显示弹窗
  showToast.success('预览功能开发中...')
}

const goBack = () => {
  router.push(`/mobile/document-instance/${document.value?.id}`)
}

// 加载数据
const loadDocument = async () => {
  const id = route.params.id as string
  if (!id) return

  loading.value = true

  try {
    const response = await getInstanceById(id)
    if (response.success) {
      document.value = response.data

      // 初始化表单数据
      form.value = {
        title: document.value.title || '',
        content: document.value.content || '',
        deadline: document.value.deadline || '',
        progress: document.value.progress || 0,
        filledVariables: document.value.filledVariables || {}
      }

      if (document.value.deadline) {
        deadlineDate.value = formatDateForPicker(document.value.deadline)
      }
    } else {
      showToast.fail('文档不存在')
    }
  } catch (error) {
    console.error('加载文档详情失败:', error)
    showToast.fail('加载文档详情失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadDocument()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-document-instance-edit {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--app-bg-color);
  padding-bottom: 20px;

  .van-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .edit-form {
    .basic-info,
    .content-editor,
    .variables-section,
    .progress-section {
      margin-bottom: 12px;
    }

    .content-field {
      padding: 0 16px;
      background: var(--card-bg);

      :deep(.van-field__control) {
        min-height: 120px;
        line-height: 1.6;
      }
    }

    .progress-section {
      .progress-text {
        font-weight: 600;
        color: #1989fa;
      }
    }

    .action-section {
      padding: 0 16px;
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .action-btn {
        background: var(--card-bg);
        color: #323233;
        border: 1px solid #ebedf0;
      }
    }
  }

  .van-empty {
    padding: 40px 16px;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-document-instance-edit {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>