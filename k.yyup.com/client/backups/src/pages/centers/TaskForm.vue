<template>
  <UnifiedCenterLayout>
    <div class="center-container task-form-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <button @click="handleGoBack" class="back-button">
          <i class="icon-arrow-left"></i>
          返回任务中心
        </button>
        <h1 class="page-title">{{ mode === 'create' ? '新建任务' : '编辑任务' }}</h1>
      </div>
      <div class="header-right">
        <button @click="handleSave" :disabled="loading" class="save-button">
          {{ loading ? '保存中...' : '保存任务' }}
        </button>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <div class="form-card">
        <form @submit.prevent="handleSave">
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label required">任务标题</label>
                <input 
                  v-model="formData.title"
                  type="text" 
                  placeholder="请输入任务标题"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">任务描述</label>
                <textarea 
                  v-model="formData.description"
                  placeholder="请输入任务描述"
                  rows="4"
                  class="form-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- 任务设置 -->
          <div class="form-section">
            <h3 class="section-title">任务设置</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">优先级</label>
                <select v-model="formData.priority" class="form-select" required>
                  <option value="">请选择优先级</option>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="highest">紧急</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label required">状态</label>
                <select v-model="formData.status" class="form-select" required>
                  <option value="">请选择状态</option>
                  <option value="pending">待处理</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">分配给</label>
                <select v-model="formData.assignedTo" class="form-select">
                  <option :value="null">未分配</option>
                  <option :value="1">张老师</option>
                  <option :value="2">李老师</option>
                  <option :value="3">王老师</option>
                  <option :value="4">刘老师</option>
                  <option :value="5">陈老师</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">截止时间</label>
                <input 
                  v-model="formData.dueDate"
                  type="datetime-local"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- 其他信息 -->
          <div class="form-section">
            <h3 class="section-title">其他信息</h3>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">标签</label>
                <input 
                  v-model="formData.tags"
                  type="text" 
                  placeholder="请输入标签，多个标签用逗号分隔"
                  class="form-input"
                />
                <div class="form-help">例如：重要,紧急,教学</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="form-footer">
      <div class="footer-actions">
        <button @click="handleGoBack" class="cancel-button">
          取消
        </button>
        <button @click="handleSave" :disabled="loading" class="submit-button">
          {{ loading ? '保存中...' : '保存任务' }}
        </button>
      </div>
    </div>
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createTask, updateTask, getTaskById } from '@/services/task'

// 路由
const router = useRouter()
const route = useRoute()

// 页面状态
const loading = ref(false)
const mode = ref<'create' | 'edit'>('create')

// 表单数据
const formData = ref({
  id: null,
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  assignedTo: null,
  dueDate: null,
  tags: ''
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
  } catch (error) {
    console.error('加载任务数据失败:', error)
    alert('加载任务数据失败')
  } finally {
    loading.value = false
  }
}

// 保存任务
const handleSave = async () => {
  try {
    // 表单验证
    if (!formData.value.title.trim()) {
      alert('请输入任务标题')
      return
    }
    if (!formData.value.priority) {
      alert('请选择优先级')
      return
    }
    if (!formData.value.status) {
      alert('请选择状态')
      return
    }

    loading.value = true
    console.log('📝 保存任务数据:', formData.value)

    // 处理数据格式
    const submitData = {
      ...formData.value,
      assignedTo: formData.value.assignedTo || null,
      tags: formData.value.tags ? formData.value.tags.split(',').map((tag: string) => tag.trim()) : []
    }

    if (mode.value === 'edit' && submitData.id) {
      await updateTask(submitData.id, submitData)
      alert('任务更新成功')
    } else {
      delete submitData.id // 新建时移除id字段
      await createTask(submitData)
      alert('任务创建成功')
    }

    // 返回任务中心
    handleGoBack()
  } catch (error) {
    console.error('保存任务失败:', error)
    alert('保存任务失败')
  } finally {
    loading.value = false
  }
}

// 返回任务中心
const handleGoBack = () => {
  router.push('/centers/task')
}
</script>

<style scoped>
.task-form-page {
  min-height: 100vh;
  background: var(--bg-hover);
  padding: var(--text-2xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding: 0 var(--spacing-xs);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--text-lg);
  background: white;
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: var(--bg-gray-light);
  border-color: #ccc;
}

.page-title {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
}

.save-button {
  padding: var(--spacing-2xl) var(--text-2xl);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  background: var(--primary-hover);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--spacing-3xl);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-10);
}

.form-section {
  margin-bottom: var(--spacing-3xl);
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 var(--text-2xl) 0;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: var(--transform-drop) solid var(--primary-color);
  padding-bottom: var(--spacing-sm);
}

.form-row {
  display: flex;
  gap: var(--text-2xl);
  margin-bottom: var(--text-2xl);
}

.form-group {
  flex: 1;
}

.form-group.full-width {
  flex: none;
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-lg);
  font-weight: 500;
  color: var(--text-primary);
}

.form-label.required::after {
  content: ' *';
  color: var(--danger-color);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--spacing-2xl) var(--text-sm);
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-help {
  margin-top: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.form-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: var(--z-index-dropdown) solid #eee;
  padding: var(--text-lg) var(--text-2xl);
  z-index: var(--z-index-fixed);
}

.footer-actions {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

.cancel-button {
  padding: var(--spacing-2xl) var(--text-2xl);
  background: white;
  color: var(--text-secondary);
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: var(--bg-gray-light);
  border-color: #ccc;
}

.submit-button {
  padding: var(--spacing-2xl) var(--text-2xl);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: var(--primary-hover);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .task-form-page {
    padding: var(--text-lg);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--text-lg);
  }
  
  .form-card {
    padding: var(--text-2xl);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .footer-actions {
    flex-direction: column;
  }
}
</style>
