<template>
  <MobileMainLayout
    :title="taskDetail?.title || '任务详情'"
    :show-nav-bar="true"
    :show-back="true"
    :show-tab-bar="false"
  >
    <div class="task-detail-page" v-if="!loading && taskDetail">
      <!-- 任务状态卡片 -->
      <van-card class="status-card">
        <div class="task-header">
          <div class="task-main">
            <h1 class="task-title" :class="{ 'completed': taskDetail.status === 'completed' }">
              {{ taskDetail.title }}
            </h1>
            <div class="task-meta">
              <van-tag :type="getStatusType(taskDetail.status)" size="medium">
                {{ getStatusText(taskDetail.status) }}
              </van-tag>
              <van-tag :type="getPriorityType(taskDetail.priority)" size="medium">
                {{ getPriorityText(taskDetail.priority) }}
              </van-tag>
            </div>
          </div>
          <div class="task-progress-circle">
            <van-circle
              :rate="taskDetail.progress"
              :speed="100"
              :color="progressColor"
              :size="60"
              :stroke-width="6"
            >
              <span class="progress-text">{{ taskDetail.progress }}%</span>
            </van-circle>
          </div>
        </div>
      </van-card>

      <!-- 任务信息 -->
      <van-card class="info-card">
        <template #title>
          <div class="card-title">
            <van-icon name="description" />
            任务信息
          </div>
        </template>
        
        <van-cell-group>
          <van-cell title="任务描述">
            <template #default>
              <div class="task-description">
                {{ taskDetail.description || '暂无描述' }}
              </div>
            </template>
          </van-cell>
          
          <van-cell title="创建时间" :value="formatDateTime(taskDetail.createdAt)" />
          <van-cell title="截止时间" :value="formatDate(taskDetail.dueDate)">
            <template #value>
              <span :class="{ 'overdue': isOverdue(taskDetail.dueDate) }">
                {{ formatDate(taskDetail.dueDate) }}
              </span>
            </template>
          </van-cell>
          
          <van-cell title="分配给" :value="taskDetail.assigneeName || '我'" />
          <van-cell title="创建者" :value="taskDetail.assignedBy || '系统'" />
        </van-cell-group>
      </van-card>

      <!-- 进度跟踪 -->
      <van-card class="progress-card">
        <template #title>
          <div class="card-title">
            <van-icon name="chart-trending-o" />
            进度跟踪
          </div>
        </template>
        
        <div class="progress-section">
          <div class="progress-bar-container">
            <van-progress
              :percentage="taskDetail.progress"
              stroke-width="8"
              :color="progressColor"
              track-color="#f0f0f0"
            />
            <span class="progress-percentage">{{ taskDetail.progress }}%</span>
          </div>
          
          <div class="progress-actions">
            <van-stepper
              v-model="newProgress"
              :min="0"
              :max="100"
              :step="5"
              button-size="32"
            />
            <van-button
              type="primary"
              size="small"
              @click="updateProgress"
              :disabled="newProgress === taskDetail.progress"
            >
              更新进度
            </van-button>
          </div>
        </div>
      </van-card>

      <!-- 操作历史 -->
      <van-card class="history-card">
        <template #title>
          <div class="card-title">
            <van-icon name="records" />
            操作历史
          </div>
        </template>
        
        <van-steps direction="vertical" :active="historySteps.length - 1">
          <van-step
            v-for="(step, index) in historySteps"
            :key="index"
            :title="step.title"
            :description="step.description"
          >
            <template #active-icon>
              <van-icon :name="step.icon" :color="step.color" />
            </template>
          </van-step>
        </van-steps>
      </van-card>

      <!-- 附件列表 -->
      <van-card class="attachments-card" v-if="taskDetail.attachments?.length">
        <template #title>
          <div class="card-title">
            <van-icon name="folder-o" />
            相关附件
          </div>
        </template>
        
        <div class="attachment-list">
          <van-cell
            v-for="(attachment, index) in taskDetail.attachments"
            :key="index"
            :title="attachment.name"
            :label="formatFileSize(attachment.size)"
            is-link
            @click="previewAttachment(attachment)"
          >
            <template #icon>
              <van-icon :name="getAttachmentIcon(attachment.type)" />
            </template>
          </van-cell>
        </div>
      </van-card>

      <!-- 标签 -->
      <van-card class="tags-card" v-if="taskDetail.tags?.length">
        <template #title>
          <div class="card-title">
            <van-icon name="label-o" />
            任务标签
          </div>
        </template>
        
        <div class="tags-container">
          <van-tag
            v-for="tag in taskDetail.tags"
            :key="tag"
            type="primary"
            size="medium"
            class="tag-item"
          >
            {{ tag }}
          </van-tag>
        </div>
      </van-card>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <van-button
          v-if="taskDetail.status !== 'completed'"
          type="primary"
          size="large"
          block
          @click="completeTask"
        >
          <van-icon name="success" />
          完成任务
        </van-button>
        
        <van-button
          v-else
          type="warning"
          size="large"
          block
          @click="reopenTask"
        >
          <van-icon name="replay" />
          重新打开
        </van-button>
        
        <div class="action-row">
          <van-button
            type="default"
            size="large"
            block
            @click="editTask"
          >
            <van-icon name="edit" />
            编辑任务
          </van-button>
          
          <van-button
            type="danger"
            size="large"
            block
            @click="deleteTask"
          >
            <van-icon name="delete" />
            删除任务
          </van-button>
        </div>
      </div>
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
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showConfirmDialog } from 'vant'
import { teacherTasksApi, type Task } from '@/api/modules/teacher-tasks'
import MobileMainLayout from "@/components/mobile/layouts/MobileMainLayout.vue"

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const taskDetail = ref<Task | null>(null)
const newProgress = ref(0)

// 历史步骤数据
const historySteps = ref([
  {
    title: '任务创建',
    description: '任务已创建',
    icon: 'add-o',
    color: '#409eff'
  }
])

// 计算属性
const progressColor = computed(() => {
  const progress = taskDetail.value?.progress || 0
  if (progress >= 80) return '#07c160'
  if (progress >= 50) return '#409eff'
  if (progress >= 20) return '#ff976a'
  return '#ee0a24'
})

// 方法
const getStatusType = (status: string) => {
  const typeMap = {
    'pending': 'default',
    'in_progress': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return textMap[status] || '待处理'
}

const getPriorityType = (priority: string) => {
  const typeMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'default'
  }
  return typeMap[priority] || 'default'
}

const getPriorityText = (priority: string) => {
  const textMap = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || '中'
}

const isOverdue = (dueDate: string) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date() && taskDetail.value?.status !== 'completed'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const formatFileSize = (size: number) => {
  if (!size) return '未知大小'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  
  return `${fileSize.toFixed(1)} ${units[index]}`
}

const getAttachmentIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'image': 'photo-o',
    'pdf': 'description',
    'word': 'description',
    'excel': 'chart-trending-o',
    'zip': 'folder-o',
    'default': 'description'
  }
  
  if (type.includes('image/')) return iconMap.image
  if (type.includes('pdf')) return iconMap.pdf
  if (type.includes('word') || type.includes('document')) return iconMap.word
  if (type.includes('excel') || type.includes('spreadsheet')) return iconMap.excel
  if (type.includes('zip') || type.includes('compressed')) return iconMap.zip
  
  return iconMap.default
}

const previewAttachment = (attachment: any) => {
  // 预览附件逻辑
  console.log('预览附件:', attachment)
}

const updateProgress = async () => {
  if (!taskDetail.value) return
  
  try {
    await teacherTasksApi.updateTask(taskDetail.value.id, {
      progress: newProgress.value
    })
    
    taskDetail.value.progress = newProgress.value
    showSuccessToast('进度更新成功')
    
    // 添加历史记录
    historySteps.value.push({
      title: '进度更新',
      description: `进度更新为 ${newProgress.value}%`,
      icon: 'chart-trending-o',
      color: '#409eff'
    })
  } catch (error) {
    console.error('更新进度失败:', error)
  }
}

const completeTask = async () => {
  if (!taskDetail.value) return
  
  try {
    await showConfirmDialog({
      title: '确认完成',
      message: '确定要将此任务标记为已完成吗？',
    })
    
    await teacherTasksApi.updateTaskStatus(taskDetail.value.id, 'completed')
    taskDetail.value.status = 'completed'
    taskDetail.value.progress = 100
    
    showSuccessToast('任务已完成')
    
    // 添加历史记录
    historySteps.value.push({
      title: '任务完成',
      description: '任务已标记为完成',
      icon: 'success',
      color: '#07c160'
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成任务失败:', error)
    }
  }
}

const reopenTask = async () => {
  if (!taskDetail.value) return
  
  try {
    await teacherTasksApi.updateTaskStatus(taskDetail.value.id, 'in_progress')
    taskDetail.value.status = 'in_progress'
    
    showSuccessToast('任务已重新打开')
    
    // 添加历史记录
    historySteps.value.push({
      title: '重新打开',
      description: '任务已重新打开',
      icon: 'replay',
      color: '#ff976a'
    })
  } catch (error) {
    console.error('重新打开任务失败:', error)
  }
}

const editTask = () => {
  router.push(`/mobile/teacher-center/tasks/edit?id=${taskDetail.value?.id}`)
}

const deleteTask = async () => {
  if (!taskDetail.value) return
  
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个任务吗？删除后无法恢复。',
    })
    
    await teacherTasksApi.deleteTask(taskDetail.value.id)
    showSuccessToast('任务已删除')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error)
    }
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
    newProgress.value = task.progress || 0
    
    // 模拟历史记录数据
    historySteps.value = [
      {
        title: '任务创建',
        description: `任务创建于 ${formatDateTime(task.createdAt)}`,
        icon: 'add-o',
        color: '#409eff'
      },
      ...(task.status === 'completed' ? [{
        title: '任务完成',
        description: '任务已成功完成',
        icon: 'success',
        color: '#07c160'
      }] : [])
    ]
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
.task-detail-page {
  padding: 0 0 20px 0;
  background-color: #f7f8fa;
  min-height: calc(100vh - 46px);
}

.status-card {
  margin: var(--spacing-md);
  background: var(--primary-gradient);
  color: white;
  
  :deep(.van-card__content) {
    padding: var(--spacing-lg);
  }
  
  .task-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-lg);
    
    .task-main {
      flex: 1;
      
      .task-title {
        font-size: var(--text-xl);
        font-weight: 600;
        margin: 0 0 12px 0;
        line-height: 1.4;
        
        &.completed {
          text-decoration: line-through;
          opacity: 0.8;
        }
      }
      
      .task-meta {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
        
        :deep(.van-tag) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
        }
      }
    }
    
    .task-progress-circle {
      .progress-text {
        font-size: var(--text-xs);
        font-weight: 600;
        color: white;
      }
    }
  }
}

.info-card,
.progress-card,
.history-card,
.attachments-card,
.tags-card {
  margin: var(--spacing-md);
  
  .card-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 600;
    font-size: var(--text-base);
    
    .van-icon {
      color: var(--primary-color);
    }
  }
}

.task-description {
  line-height: 1.6;
  color: #646566;
  word-break: break-word;
}

.overdue {
  color: #ee0a24 !important;
  font-weight: 500;
}

.progress-section {
  .progress-bar-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: 16px;
    
    .van-progress {
      flex: 1;
    }
    
    .progress-percentage {
      font-size: var(--text-sm);
      font-weight: 600;
      color: #323233;
      min-width: 40px;
    }
  }
  
  .progress-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    
    .van-stepper {
      flex: 1;
    }
  }
}

.attachment-list {
  .van-cell {
    padding: var(--spacing-md) 0;
    
    .van-icon {
      color: var(--primary-color);
      margin-right: 8px;
    }
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  
  .tag-item {
    margin: 0;
  }
}

.quick-actions {
  margin: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  
  .action-row {
    display: flex;
    gap: var(--spacing-md);
    
    .van-button {
      flex: 1;
    }
  }
  
  .van-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: 500;
  }
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
:deep(.van-card) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-cell-group) {
  background-color: transparent;
  
  .van-cell {
    background-color: transparent;
    
    &:not(:last-child)::after {
      border-bottom: none;
    }
  }
}

:deep(.van-steps) {
  .van-step__title {
    font-weight: 500;
  }
  
  .van-step__description {
    color: #969799;
    font-size: var(--text-xs);
  }
}

:deep(.van-circle) {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 响应式适配
@media (min-width: 768px) {
  .task-detail-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>