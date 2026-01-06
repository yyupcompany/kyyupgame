<template>
  <div class="registration-form-overlay" @click="handleOverlayClick">
    <div class="registration-form" @click.stop>
      <!-- 表单头部 -->
      <div class="form-header">
        <h3 class="form-title">{{ title }}</h3>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <!-- 活动信息摘要 -->
      <div class="activity-summary" v-if="activity">
        <div class="summary-item">
          <span class="summary-label">活动：</span>
          <span class="summary-value">{{ activity.title }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">时间：</span>
          <span class="summary-value">{{ formatDateTime(activity.startTime) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">地点：</span>
          <span class="summary-value">{{ activity.location }}</span>
        </div>
        <div class="summary-item" v-if="activity.groupBuyEnabled">
          <span class="summary-label">费用：</span>
          <span class="summary-value group-price">团购价 ¥{{ activity.groupBuyPrice }}</span>
        </div>
      </div>
      
      <!-- 表单内容 -->
      <form @submit.prevent="handleSubmit" class="form-content">
        <!-- 基本信息 -->
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">姓名</span>
              <span class="required">*</span>
            </label>
            <input 
              v-model="formData.name"
              type="text" 
              class="form-input"
              placeholder="请输入您的姓名"
              required
              maxlength="20"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">手机号</span>
              <span class="required">*</span>
            </label>
            <input 
              v-model="formData.phone"
              type="tel" 
              class="form-input"
              placeholder="请输入手机号"
              required
              pattern="^1[3-9]\d{9}$"
              maxlength="11"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">邮箱</span>
            </label>
            <input 
              v-model="formData.email"
              type="email" 
              class="form-input"
              placeholder="请输入邮箱（可选）"
            />
          </div>
        </div>
        
        <!-- 其他信息 -->
        <div class="form-section">
          <h4 class="section-title">其他信息</h4>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">年龄</span>
            </label>
            <select v-model="formData.age" class="form-select">
              <option value="">请选择年龄段</option>
              <option value="18-25">18-25岁</option>
              <option value="26-35">26-35岁</option>
              <option value="36-45">36-45岁</option>
              <option value="46-55">46-55岁</option>
              <option value="55+">55岁以上</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">特殊需求</span>
            </label>
            <textarea 
              v-model="formData.notes"
              class="form-textarea"
              placeholder="如有特殊需求或备注信息，请在此填写（可选）"
              rows="3"
              maxlength="200"
            ></textarea>
            <div class="char-count">{{ formData.notes.length }}/200</div>
          </div>
        </div>
        
        <!-- 协议确认 -->
        <div class="form-section">
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="formData.agreeTerms"
                type="checkbox" 
                class="checkbox-input"
                required
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                我已阅读并同意 
                <a href="#" @click.prevent="showTerms" class="terms-link">《活动参与协议》</a>
              </span>
            </label>
          </div>
        </div>
        
        <!-- 提交按钮 -->
        <div class="form-actions">
          <button 
            type="button" 
            class="cancel-btn"
            @click="handleClose"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="submitting || !isFormValid"
            :class="{ 'submitting': submitting }"
          >
            <span v-if="submitting" class="loading-spinner"></span>
            {{ submitting ? '提交中...' : '确认报名' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface Activity {
  title: string
  startTime: string
  location: string
  groupBuyEnabled: boolean
  groupBuyPrice: number
}

interface Props {
  title?: string
  activity?: Activity
}

const props = withDefaults(defineProps<Props>(), {
  title: '报名参加活动'
})

const emit = defineEmits<{
  close: []
  submit: [data: any]
  showTerms: []
}>()

// 表单数据
const formData = reactive({
  name: '',
  phone: '',
  email: '',
  age: '',
  notes: '',
  agreeTerms: false
})

const submitting = ref(false)

// 计算属性
const isFormValid = computed(() => {
  return formData.name.trim() && 
         formData.phone.trim() && 
         /^1[3-9]\d{9}$/.test(formData.phone) &&
         formData.agreeTerms
})

// 方法
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleOverlayClick = () => {
  handleClose()
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!isFormValid.value || submitting.value) return
  
  submitting.value = true
  
  try {
    // 提交表单数据
    emit('submit', { ...formData })
  } finally {
    submitting.value = false
  }
}

const showTerms = () => {
  emit('showTerms')
}
</script>

<style lang="scss" scoped>
.registration-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--text-2xl);
  backdrop-filter: blur(var(--spacing-xs));
}

.registration-form {
  background: white;
  border-radius: var(--text-lg);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--shadow-heavy);
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--text-2xl) var(--text-2xl) var(--text-lg);
  border-bottom: var(--border-width-base) solid var(--bg-gray-light);
}

.form-title {
  font-size: var(--text-xl);
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  border: none;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  svg {
    width: var(--text-xl);
    height: var(--text-xl);
    fill: var(--text-secondary);
  }
  
  &:hover {
    background: #e0e0e0;
  }
}

.activity-summary {
  padding: var(--text-lg) var(--text-2xl);
  background: var(--bg-gray-light);
  border-bottom: var(--border-width-base) solid var(--bg-gray-light);
}

.summary-item {
  display: flex;
  margin-bottom: var(--spacing-xs);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.summary-label {
  font-size: var(--text-base);
  color: var(--text-secondary);
  min-width: 50px;
}

.summary-value {
  font-size: var(--text-base);
  color: var(--text-primary);
  flex: 1;
  
  &.group-price {
    color: #FF5722;
    font-weight: 500;
  }
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--text-2xl);
}

.form-section {
  margin-bottom: var(--text-3xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0 0 var(--text-lg) 0;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: var(--text-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-base);
  color: var(--text-primary);
}

.label-text {
  font-weight: 500;
}

.required {
  color: #ff4444;
  margin-left: var(--spacing-sm);
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: var(--text-sm);
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--spacing-sm);
  font-size: var(--text-lg);
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  text-align: right;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: var(--text-xl);
  height: var(--text-xl);
  border: 2px solid #ddd;
  border-radius: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: var(--spacing-xs);
  
  &::after {
    content: '';
    width: 10px;
    height: 6px;
    border: 2px solid white;
    border-top: none;
    border-right: none;
    transform: rotate(-45deg);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

.checkbox-input:checked + .checkbox-custom {
  background: #1976d2;
  border-color: #1976d2;
  
  &::after {
    opacity: 1;
  }
}

.checkbox-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.4;
}

.terms-link {
  color: #1976d2;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

.form-actions {
  display: flex;
  gap: var(--text-sm);
  margin-top: var(--text-3xl);
  padding-top: var(--text-2xl);
  border-top: var(--border-width-base) solid var(--bg-gray-light);
}

.cancel-btn, .submit-btn {
  flex: 1;
  padding: var(--text-sm);
  border: none;
  border-radius: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  
  &:hover {
    background: #e0e0e0;
  }
}

.submit-btn {
  background: #1976d2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  
  &:hover:not(:disabled) {
    background: #1565c0;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  &.submitting {
    background: #1976d2;
  }
}

.loading-spinner {
  width: var(--text-lg);
  height: var(--text-lg);
  border: 2px solid var(--glass-bg-heavy);
  border-top: 2px solid white;
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: var(--breakpoint-sm)) {
  .registration-form-overlay {
    padding: var(--spacing-2xl);
  }
  
  .form-header {
    padding: var(--text-lg) var(--text-lg) var(--text-sm);
  }
  
  .form-content {
    padding: var(--text-lg);
  }
  
  .activity-summary {
    padding: var(--text-sm) var(--text-lg);
  }
}
</style>
