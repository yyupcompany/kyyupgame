<template>
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="confirm-dialog todo-confirm" @click.stop>
      <!-- 头部 -->
      <div class="dialog-header">
        <div class="header-icon">📝</div>
        <div class="header-content">
          <h3 class="dialog-title">确认创建任务</h3>
          <p class="dialog-subtitle">AI已智能填充任务信息，请确认后添加到数据库</p>
        </div>
        <button class="close-btn" @click="handleClose">
          <i class="el-icon-close"></i>
        </button>
      </div>

      <!-- AI置信度 -->
      <div class="confidence-section" v-if="data?.confidence">
        <div class="confidence-label">AI置信度</div>
        <div class="confidence-bar">
          <div 
            class="confidence-fill" 
            :style="{ width: `${(data.confidence * 100)}%` }"
            :class="getConfidenceClass(data.confidence)"
          ></div>
        </div>
        <div class="confidence-text">{{ Math.round(data.confidence * 100) }}%</div>
      </div>

      <!-- 任务信息预览 -->
      <div class="content-section">
        <h4 class="section-title">✅ 任务详情</h4>
        
        <!-- 基本信息 -->
        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">任务标题</label>
            <div class="info-value editable" @click="editField('title')">
              {{ editableData.title }}
              <i class="edit-icon">✏️</i>
            </div>
          </div>
          
          <div class="info-item">
            <label class="info-label">优先级</label>
            <div class="info-value">
              <span class="priority-badge" :class="getPriorityClass(editableData.priority)">
                {{ data?.priority_name || '中' }}
              </span>
              <button class="inline-edit-btn" @click="editPriority">
                <i class="edit-icon">⚙️</i>
              </button>
            </div>
          </div>

          <div class="info-item">
            <label class="info-label">任务状态</label>
            <div class="info-value">
              <span class="status-badge" :class="getStatusClass(editableData.status)">
                {{ data?.status_name || '待处理' }}
              </span>
              <button class="inline-edit-btn" @click="editStatus">
                <i class="edit-icon">⚙️</i>
              </button>
            </div>
          </div>

          <div class="info-item" v-if="editableData.dueDate">
            <label class="info-label">截止日期</label>
            <div class="info-value">
              <div class="due-date">
                <span class="date-value">{{ formatDateTime(editableData.dueDate) }}</span>
                <span class="date-indicator" :class="getDueDateClass(editableData.dueDate)">
                  {{ getDueDateIndicator(editableData.dueDate) }}
                </span>
              </div>
            </div>
          </div>

          <div class="info-item" v-if="editableData.assignedTo">
            <label class="info-label">分配给</label>
            <div class="info-value">
              <span class="assignee-badge">用户 #{{ editableData.assignedTo }}</span>
            </div>
          </div>

          <div class="info-item" v-if="editableData.tags && editableData.tags.length > 0">
            <label class="info-label">标签</label>
            <div class="info-value">
              <div class="tags-list">
                <span 
                  v-for="tag in editableData.tags" 
                  :key="tag" 
                  class="tag-item"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 描述信息 -->
        <div v-if="editableData.description" class="description-section">
          <label class="info-label">任务描述</label>
          <div class="description-content editable" @click="editField('description')">
            {{ editableData.description }}
            <i class="edit-icon">✏️</i>
          </div>
        </div>

        <!-- 关联信息 -->
        <div v-if="editableData.relatedType && editableData.relatedId" class="relation-section">
          <label class="info-label">关联对象</label>
          <div class="relation-content">
            <span class="relation-type">{{ getRelationTypeName(editableData.relatedType) }}</span>
            <span class="relation-id">#{{ editableData.relatedId }}</span>
          </div>
        </div>

        <!-- 原始输入 -->
        <div class="original-input-section">
          <details class="original-input-details">
            <summary class="original-input-summary">查看原始输入</summary>
            <div class="original-input-content">
              {{ data?.user_input }}
            </div>
          </details>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="dialog-actions">
        <button class="btn-secondary" @click="handleClose" :disabled="loading">
          取消
        </button>
        <button class="btn-primary" @click="handleConfirm" :disabled="loading">
          <span v-if="loading" class="loading-spinner">⏳</span>
          {{ loading ? '创建中...' : '确认创建' }}
        </button>
      </div>
    </div>

    <!-- 字段编辑弹窗 -->
    <div v-if="editingField" class="edit-overlay" @click="cancelEdit">
      <div class="edit-dialog" @click.stop>
        <h4 class="edit-title">编辑{{ getFieldLabel(editingField) }}</h4>
        <textarea 
          v-if="editingField === 'description'"
          v-model="editingValue" 
          class="edit-textarea"
          :placeholder="getFieldPlaceholder(editingField)"
          @keyup.escape="cancelEdit"
          ref="editInput"
          rows="4"
        ></textarea>
        <input 
          v-else
          v-model="editingValue" 
          class="edit-input"
          :placeholder="getFieldPlaceholder(editingField)"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
          ref="editInput"
        />
        <div class="edit-actions">
          <button class="btn-cancel" @click="cancelEdit">取消</button>
          <button class="btn-save" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- 优先级选择弹窗 -->
    <div v-if="editingPriority" class="edit-overlay" @click="editingPriority = false">
      <div class="edit-dialog" @click.stop>
        <h4 class="edit-title">选择优先级</h4>
        <div class="priority-options">
          <div 
            v-for="(priority, value) in priorityOptions" 
            :key="value"
            class="priority-option"
            :class="{ active: editableData.priority === Number(value) }"
            @click="setPriority(Number(value))"
          >
            <span class="priority-badge" :class="getPriorityClass(Number(value))">
              {{ priority }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态选择弹窗 -->
    <div v-if="editingStatus" class="edit-overlay" @click="editingStatus = false">
      <div class="edit-dialog" @click.stop>
        <h4 class="edit-title">选择状态</h4>
        <div class="status-options">
          <div 
            v-for="(statusName, statusValue) in statusOptions" 
            :key="statusValue"
            class="status-option"
            :class="{ active: editableData.status === statusValue }"
            @click="setStatus(statusValue)"
          >
            <span class="status-badge" :class="getStatusClass(statusValue)">
              {{ statusName }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'

interface Props {
  visible: boolean
  data: any
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const editingField = ref<string | null>(null)
const editingValue = ref('')
const editingPriority = ref(false)
const editingStatus = ref(false)
const editInput = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

// 选项数据
const priorityOptions = {
  1: '最高',
  2: '高',
  3: '中',
  4: '低',
  5: '最低'
}

const statusOptions = {
  'pending': '待处理',
  'in_progress': '进行中',
  'completed': '已完成',
  'cancelled': '已取消',
  'overdue': '已过期'
}

// 可编辑数据
const editableData = reactive({
  title: '',
  description: '',
  priority: 3,
  status: 'pending',
  dueDate: null,
  assignedTo: null,
  tags: [],
  relatedId: null,
  relatedType: '',
  notify: false,
  userId: 1,
  ...props.data?.extracted_data
})

// 监听props变化
watch(() => props.data, (newData) => {
  if (newData?.extracted_data) {
    Object.assign(editableData, newData.extracted_data)
  }
}, { immediate: true })

// 获取置信度样式类
const getConfidenceClass = (confidence: number) => {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

// 获取优先级样式类
const getPriorityClass = (priority: number) => {
  const classes = {
    1: 'highest',
    2: 'high',
    3: 'medium',
    4: 'low',
    5: 'lowest'
  }
  return classes[priority as keyof typeof classes] || 'medium'
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  const classes = {
    'pending': 'pending',
    'in_progress': 'in-progress',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'overdue': 'overdue'
  }
  return classes[status] || 'pending'
}

// 获取截止日期指示器
const getDueDateIndicator = (dueDateStr: string) => {
  if (!dueDateStr) return ''
  
  const dueDate = new Date(dueDateStr)
  const now = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '已过期'
  if (diffDays === 0) return '今天到期'
  if (diffDays === 1) return '明天到期'
  if (diffDays <= 3) return `${diffDays}天后到期`
  return '充足时间'
}

// 获取截止日期样式类
const getDueDateClass = (dueDateStr: string) => {
  if (!dueDateStr) return ''
  
  const dueDate = new Date(dueDateStr)
  const now = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 1) return 'urgent'
  if (diffDays <= 3) return 'warning'
  return 'normal'
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '未设置'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取关联类型名称
const getRelationTypeName = (type: string) => {
  const typeNames: { [key: string]: string } = {
    'activity': '活动',
    'enrollment': '招生',
    'student': '学生',
    'teacher': '教师',
    'class': '班级'
  }
  return typeNames[type] || type
}

// 编辑字段
const editField = async (field: string) => {
  editingField.value = field
  editingValue.value = String(editableData[field as keyof typeof editableData] || '')
  
  await nextTick()
  editInput.value?.focus()
  if (field !== 'description') {
    (editInput.value as HTMLInputElement)?.select()
  }
}

// 编辑优先级
const editPriority = () => {
  editingPriority.value = true
}

// 编辑状态
const editStatus = () => {
  editingStatus.value = true
}

// 设置优先级
const setPriority = (priority: number) => {
  editableData.priority = priority
  editingPriority.value = false
}

// 设置状态
const setStatus = (status: string) => {
  editableData.status = status
  editingStatus.value = false
}

// 获取字段标签
const getFieldLabel = (field: string) => {
  const labels: { [key: string]: string } = {
    title: '任务标题',
    description: '任务描述'
  }
  return labels[field] || field
}

// 获取字段占位符
const getFieldPlaceholder = (field: string) => {
  const placeholders: { [key: string]: string } = {
    title: '请输入任务标题',
    description: '请输入任务描述'
  }
  return placeholders[field] || ''
}

// 保存编辑
const saveEdit = () => {
  if (editingField.value) {
    editableData[editingField.value as keyof typeof editableData] = editingValue.value
  }
  cancelEdit()
}

// 取消编辑
const cancelEdit = () => {
  editingField.value = null
  editingValue.value = ''
}

// 处理遮罩点击
const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

// 关闭对话框
const handleClose = () => {
  if (loading.value) return
  emit('close')
}

// 确认创建
const handleConfirm = async () => {
  loading.value = true
  
  try {
    // 构建最终数据
    const finalData = {
      ...props.data,
      extracted_data: { ...editableData },
      user_confirmed: true,
      confirmed_at: new Date().toISOString()
    }
    
    emit('confirm', finalData)
  } catch (error) {
    console.error('确认创建任务失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(var(--spacing-sm));
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-dialog {
  background: white;
  border-radius: var(--spacing-md);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  padding: 2var(--spacing-xs) 2var(--spacing-xs) var(--spacing-md);
  border-bottom: var(--border-width-base) solid #f0f0f0;
}

.header-icon {
  font-size: var(--spacing-xl);
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 var(--spacing-xs) 0;
}

.dialog-subtitle {
  font-size: 1var(--spacing-xs);
  color: #666;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--spacing-xs);
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.confidence-section {
  padding: var(--spacing-md) 2var(--spacing-xs);
  background: #f8f9fa;
  border-bottom: var(--border-width-base) solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.confidence-label {
  font-size: 1var(--spacing-xs);
  color: #666;
  white-space: nowrap;
}

.confidence-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.confidence-fill.high {
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
}

.confidence-fill.medium {
  background: linear-gradient(90deg, #FF9800, #FFB74D);
}

.confidence-fill.low {
  background: linear-gradient(90deg, #F44336, #EF5350);
}

.confidence-text {
  font-size: 1var(--spacing-xs);
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.content-section {
  padding: 2var(--spacing-xs);
}

.section-title {
  font-size: var(--spacing-md);
  font-weight: 600;
  color: #333;
  margin: 0 0 var(--spacing-md) 0;
}

.info-grid {
  display: grid;
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  color: #333;
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.info-value.editable {
  cursor: pointer;
  padding: var(--spacing-sm) 12px;
  background: #f8f9fa;
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid transparent;
  transition: all 0.2s;
}

.info-value.editable:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.edit-icon {
  opacity: 0;
  font-size: 12px;
  transition: opacity 0.2s;
}

.info-value.editable:hover .edit-icon,
.inline-edit-btn:hover .edit-icon {
  opacity: 1;
}

.inline-edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--spacing-xs);
  transition: all 0.2s;
}

.inline-edit-btn:hover {
  background: #f0f0f0;
}

.priority-badge {
  display: inline-block;
  padding: var(--spacing-xs) 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: white;
}

.priority-badge.highest {
  background: linear-gradient(135deg, #F44336, #E53935);
}

.priority-badge.high {
  background: linear-gradient(135deg, #FF9800, #FB8C00);
}

.priority-badge.medium {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.priority-badge.low {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
}

.priority-badge.lowest {
  background: linear-gradient(135deg, #9E9E9E, #616161);
}

.status-badge {
  display: inline-block;
  padding: var(--spacing-xs) 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: white;
}

.status-badge.pending {
  background: linear-gradient(135deg, #607D8B, #455A64);
}

.status-badge.in-progress {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.status-badge.completed {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
}

.status-badge.cancelled {
  background: linear-gradient(135deg, #9E9E9E, #616161);
}

.status-badge.overdue {
  background: linear-gradient(135deg, #F44336, #D32F2F);
}

.due-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.date-value {
  font-family: monospace;
  font-size: 1var(--spacing-xs);
}

.date-indicator {
  padding: 2px var(--spacing-sm);
  border-radius: 12px;
  font-size: 1var(--border-width-base);
  font-weight: 500;
}

.date-indicator.normal {
  background: #e8f5e8;
  color: #2e7d32;
}

.date-indicator.warning {
  background: #fff3e0;
  color: #f57c00;
}

.date-indicator.urgent {
  background: #ffebee;
  color: #d32f2f;
}

.date-indicator.overdue {
  background: #f44336;
  color: white;
}

.assignee-badge {
  display: inline-block;
  padding: var(--spacing-xs) 10px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: var(--spacing-md);
  font-size: 13px;
  font-weight: 500;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  display: inline-block;
  padding: 3px var(--spacing-sm);
  background: #f0f0f0;
  color: #666;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.description-section,
.relation-section {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: var(--border-width-base) solid #f0f0f0;
}

.description-content {
  padding: 12px;
  background: #f8f9fa;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  line-height: 1.5;
  color: #333;
  margin-top: 6px;
  cursor: pointer;
  border: var(--border-width-base) solid transparent;
  transition: all 0.2s;
}

.description-content:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.relation-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: 6px;
}

.relation-type {
  padding: var(--spacing-xs) 10px;
  background: #e8f5e8;
  color: #2e7d32;
  border-radius: var(--spacing-md);
  font-size: 13px;
  font-weight: 500;
}

.relation-id {
  font-family: monospace;
  font-size: 13px;
  color: #666;
}

.original-input-section {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: var(--border-width-base) solid #f0f0f0;
}

.original-input-details {
  border: var(--border-width-base) solid #e0e0e0;
  border-radius: var(--spacing-sm);
  overflow: hidden;
}

.original-input-summary {
  padding: 10px 1var(--spacing-xs);
  background: #f5f5f5;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  user-select: none;
}

.original-input-summary:hover {
  background: #eeeeee;
}

.original-input-content {
  padding: 1var(--spacing-xs);
  font-size: 1var(--spacing-xs);
  line-height: 1.5;
  color: #333;
  border-top: var(--border-width-base) solid #e0e0e0;
  background: white;
}

.dialog-actions {
  padding: var(--spacing-md) 2var(--spacing-xs) 2var(--spacing-xs);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: var(--border-width-base) solid #f0f0f0;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
  color: #333;
}

.btn-primary {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-var(--border-width-base));
  box-shadow: 0 var(--spacing-xs) 12px rgba(33, 150, 243, 0.3);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 编辑弹窗 */
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.edit-dialog {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 30px var(--shadow-medium);
}

.edit-title {
  font-size: var(--spacing-md);
  font-weight: 600;
  color: #333;
  margin: 0 0 var(--spacing-md) 0;
}

.edit-input {
  width: 100%;
  padding: 12px var(--spacing-md);
  border: 2px solid #e0e0e0;
  border-radius: var(--spacing-sm);
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.edit-textarea {
  width: 100%;
  padding: 12px var(--spacing-md);
  border: 2px solid #e0e0e0;
  border-radius: var(--spacing-sm);
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.edit-input:focus,
.edit-textarea:focus {
  outline: none;
  border-color: #2196f3;
}

.edit-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-md);
}

.btn-cancel,
.btn-save {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 6px;
  font-size: 1var(--spacing-xs);
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  background: #2196f3;
  color: white;
}

.btn-save:hover {
  background: #1976d2;
}

/* 选择选项 */
.priority-options,
.status-options {
  display: grid;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.priority-option,
.status-option {
  padding: 12px var(--spacing-md);
  border: 2px solid #e0e0e0;
  border-radius: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.priority-option:hover,
.status-option:hover {
  border-color: #2196f3;
  background: #f8f9ff;
}

.priority-option.active,
.status-option.active {
  border-color: #2196f3;
  background: #e3f2fd;
}
</style>