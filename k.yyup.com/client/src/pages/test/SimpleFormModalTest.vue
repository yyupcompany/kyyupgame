<template>
  <div class="simple-form-modal-test">
    <h2>SimpleFormModal 独立测试页面</h2>
    
    <div class="debug-info">
      <h3>调试信息:</h3>
      <p>当前模态框状态: <strong>{{ testModalVisible }}</strong></p>
      <p>组件注册检查: <strong>{{ componentRegistered }}</strong></p>
      <p>Element Plus 版本: <strong>{{ elementPlusVersion }}</strong></p>
    </div>
    
    <div class="test-buttons">
      <el-button type="primary" @click="openModal">打开 SimpleFormModal</el-button>
      <el-button type="success" @click="checkDOMElements">检查 DOM 元素</el-button>
      <el-button type="warning" @click="toggleWithDelay">延迟打开测试</el-button>
    </div>
    
    <div class="dom-info">
      <h3>DOM 检查结果:</h3>
      <pre>{{ domCheckResult }}</pre>
    </div>
    
    <!-- 测试 SimpleFormModal -->
    <SimpleFormModal
      v-model="testModalVisible"
      title="测试简单表单模态框"
      :fields="testFields"
      :data="testData"
      width="500px"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import SimpleFormModal from '@/components/centers/SimpleFormModal.vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const testModalVisible = ref(false)
const testData = ref({})
const componentRegistered = ref('检查中...')
const elementPlusVersion = ref('未知')
const domCheckResult = ref('尚未检查')

// 测试表单字段
const testFields = ref([
  { 
    prop: 'name', 
    label: '姓名', 
    type: 'input', 
    required: true, 
    span: 12,
    placeholder: '请输入姓名'
  },
  { 
    prop: 'email', 
    label: '邮箱', 
    type: 'input', 
    required: true, 
    span: 12,
    placeholder: '请输入邮箱'
  },
  {
    prop: 'role',
    label: '角色',
    type: 'select',
    required: true,
    span: 24,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '教师', value: 'teacher' },
      { label: '家长', value: 'parent' }
    ]
  }
])

// 打开模态框
const openModal = () => {
  console.log('=== 开始打开模态框测试 ===')
  console.log('点击前状态:', testModalVisible.value)
  
  testModalVisible.value = true
  
  console.log('设置后状态:', testModalVisible.value)
  console.log('testFields:', testFields.value)
  console.log('testData:', testData.value)
  
  // 使用 nextTick 检查 DOM 变化
  nextTick(() => {
    console.log('nextTick - DOM应该已更新')
    checkDOMElements()
  })
}

// 检查DOM元素
const checkDOMElements = () => {
  const result = {
    timestamp: new Date().toLocaleTimeString(),
    elDialog: document.querySelectorAll('.el-dialog').length,
    elOverlay: document.querySelectorAll('.el-overlay').length,
    simpleFormModal: document.querySelectorAll('.simple-form-modal').length,
    elForm: document.querySelectorAll('.el-form').length,
    visibleOverlays: document.querySelectorAll('.el-overlay:not([style*="display: none"])').length,
    allOverlays: []
  }
  
  // 检查所有 overlay 的状态
  document.querySelectorAll('.el-overlay').forEach((overlay, index) => {
    const style = window.getComputedStyle(overlay)
    result.allOverlays.push({
      index,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      zIndex: style.zIndex,
      hasDialog: overlay.querySelector('.el-dialog') !== null
    })
  })
  
  domCheckResult.value = JSON.stringify(result, null, 2)
  console.log('DOM检查结果:', result)
  
  ElMessage.info(`找到 ${result.elDialog} 个对话框，${result.elOverlay} 个遮罩层`)
}

// 延迟打开测试
const toggleWithDelay = () => {
  console.log('=== 延迟打开测试 ===')
  ElMessage.info('3秒后打开模态框...')
  
  setTimeout(() => {
    openModal()
  }, 3000)
}

// 确认处理
const handleConfirm = (data: any) => {
  console.log('=== 确认提交数据 ===', data)
  ElMessage.success('数据提交成功')
  testModalVisible.value = false
}

// 取消处理
const handleCancel = () => {
  console.log('=== 取消操作 ===')
  ElMessage.info('操作已取消')
  testModalVisible.value = false
}

// 组件挂载时的检查
onMounted(() => {
  console.log('=== SimpleFormModalTest 组件已挂载 ===')
  
  // 检查组件是否正确注册
  try {
    componentRegistered.value = 'SimpleFormModal 组件已成功导入'
  } catch (error) {
    componentRegistered.value = '组件导入失败: ' + error.message
  }
  
  // 检查 Element Plus
  try {
    if (window.ElementPlus) {
      elementPlusVersion.value = 'Element Plus 已加载'
    } else {
      elementPlusVersion.value = 'Element Plus 未检测到'
    }
  } catch (error) {
    elementPlusVersion.value = 'Element Plus 检查失败'
  }
  
  // 初始 DOM 检查
  nextTick(() => {
    checkDOMElements()
  })
})
</script>

<style scoped>
.simple-form-modal-test {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 800px;
  margin: 0 auto;
}

.debug-info {
  background: var(--bg-page);
  padding: var(--spacing-4xl);
  border-radius: var(--spacing-sm);
  margin-bottom: var(--text-2xl);
}

.debug-info h3 {
  margin-top: 0;
  color: var(--primary-color);
}

.debug-info p {
  margin: var(--spacing-sm) 0;
}

.test-buttons {
  margin: var(--text-2xl) 0;
  display: flex;
  gap: var(--text-sm);
  flex-wrap: wrap;
}

.dom-info {
  background: var(--bg-tertiary);
  padding: var(--spacing-4xl);
  border-radius: var(--spacing-sm);
  margin-top: var(--text-2xl);
}

.dom-info h3 {
  margin-top: 0;
  color: var(--success-color);
}

.dom-info pre {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);
  overflow-x: auto;
  border: var(--border-width-base) solid #ddd;
}
</style>