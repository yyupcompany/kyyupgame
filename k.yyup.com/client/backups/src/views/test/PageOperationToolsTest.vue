<template>
  <div class="page-operation-tools-test">
    <div class="test-header">
      <h1>🔧 页面操作工具测试</h1>
      <p>测试新增的5个页面操作工具的功能</p>
    </div>

    <div class="test-sections">
      <!-- 文本输入工具测试 -->
      <div class="test-section">
        <h3>⌨️ 文本输入工具 (type_text)</h3>
        <div class="test-controls">
          <el-input 
            id="test-input" 
            v-model="testInput" 
            placeholder="测试输入框"
            style="width: 300px;"
          />
          <el-button @click="testTypeText" type="primary">测试文本输入</el-button>
        </div>
        <div class="test-result" v-if="typeTextResult">
          <pre>{{ JSON.stringify(typeTextResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- 下拉选择工具测试 -->
      <div class="test-section">
        <h3>📋 下拉选择工具 (select_option)</h3>
        <div class="test-controls">
          <el-select id="test-select" v-model="selectedValue" placeholder="请选择">
            <el-option label="选项1" value="option1" />
            <el-option label="选项2" value="option2" />
            <el-option label="选项3" value="option3" />
          </el-select>
          <el-button @click="testSelectOption" type="primary">测试下拉选择</el-button>
        </div>
        <div class="test-result" v-if="selectOptionResult">
          <pre>{{ JSON.stringify(selectOptionResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- 条件等待工具测试 -->
      <div class="test-section">
        <h3>⏳ 条件等待工具 (wait_for_condition)</h3>
        <div class="test-controls">
          <el-button @click="showTestElement" type="success">显示测试元素</el-button>
          <el-button @click="testWaitForCondition" type="primary">测试条件等待</el-button>
          <div 
            id="test-element" 
            v-show="showElement" 
            class="test-element"
          >
            🎯 测试元素已显示
          </div>
        </div>
        <div class="test-result" v-if="waitConditionResult">
          <pre>{{ JSON.stringify(waitConditionResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- 控制台监控工具测试 -->
      <div class="test-section">
        <h3>🖥️ 控制台监控工具 (console_monitor)</h3>
        <div class="test-controls">
          <el-button @click="generateConsoleMessages" type="warning">生成控制台消息</el-button>
          <el-button @click="testConsoleMonitor" type="primary">测试控制台监控</el-button>
        </div>
        <div class="test-result" v-if="consoleMonitorResult">
          <pre>{{ JSON.stringify(consoleMonitorResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- 页面返回工具测试 -->
      <div class="test-section">
        <h3>🔙 页面返回工具 (navigate_back)</h3>
        <div class="test-controls">
          <el-button @click="testNavigateBack" type="primary">测试页面返回</el-button>
        </div>
        <div class="test-result" v-if="navigateBackResult">
          <pre>{{ JSON.stringify(navigateBackResult, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- 综合测试 -->
    <div class="comprehensive-test">
      <h2>🎯 综合工作流测试</h2>
      <p>测试多个工具的组合使用</p>
      <el-button @click="runComprehensiveTest" type="danger" size="large">
        运行综合测试
      </el-button>
      <div class="test-result" v-if="comprehensiveResult">
        <h4>综合测试结果：</h4>
        <pre>{{ JSON.stringify(comprehensiveResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus'
import axios from 'axios'

// 响应式数据
const testInput = ref('')
const selectedValue = ref('')
const showElement = ref(false)

// 测试结果
const typeTextResult = ref(null)
const selectOptionResult = ref(null)
const waitConditionResult = ref(null)
const consoleMonitorResult = ref(null)
const navigateBackResult = ref(null)
const comprehensiveResult = ref(null)

// API基础配置
const API_BASE = '/api/ai/function-tools'
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzI2MzY5MjAwfQ.test'

// 工具调用函数
const callTool = async (toolName: string, args: any) => {
  try {
    const response = await axios.post(`${API_BASE}/execute-single`, {
      function_name: toolName,
      arguments: args
    }, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error(`调用工具 ${toolName} 失败:`, error)
    ElMessage.error(`调用工具失败: ${error.message}`)
    return null
  }
}

// 测试文本输入工具
const testTypeText = async () => {
  const result = await callTool('type_text', {
    selector: '#test-input',
    text: '这是通过工具输入的文本',
    options: {
      clear_first: true,
      typing_speed: 100
    }
  })
  typeTextResult.value = result
  if (result?.success) {
    testInput.value = '这是通过工具输入的文本'
    ElMessage.success('文本输入工具测试成功！')
  }
}

// 测试下拉选择工具
const testSelectOption = async () => {
  const result = await callTool('select_option', {
    selector: '#test-select',
    value: 'option2',
    selection_method: 'by_value'
  })
  selectOptionResult.value = result
  if (result?.success) {
    selectedValue.value = 'option2'
    ElMessage.success('下拉选择工具测试成功！')
  }
}

// 显示测试元素
const showTestElement = () => {
  showElement.value = true
  ElMessage.info('测试元素已显示')
}

// 测试条件等待工具
const testWaitForCondition = async () => {
  const result = await callTool('wait_for_condition', {
    condition_type: 'element_visible',
    target: '#test-element',
    options: {
      timeout: 5000,
      polling_interval: 500
    }
  })
  waitConditionResult.value = result
  if (result?.success) {
    ElMessage.success('条件等待工具测试成功！')
  }
}

// 生成控制台消息
const generateConsoleMessages = () => {
  console.log('🔍 测试日志消息')
  console.warn('⚠️ 测试警告消息')
  console.error('❌ 测试错误消息')
  ElMessage.info('已生成测试控制台消息')
}

// 测试控制台监控工具
const testConsoleMonitor = async () => {
  const result = await callTool('console_monitor', {
    action: 'get_messages',
    options: {
      message_types: ['log', 'warn', 'error'],
      max_messages: 10
    }
  })
  consoleMonitorResult.value = result
  if (result?.success) {
    ElMessage.success('控制台监控工具测试成功！')
  }
}

// 测试页面返回工具
const testNavigateBack = async () => {
  const result = await callTool('navigate_back', {
    steps: 1,
    options: {
      fallback_url: '/dashboard'
    }
  })
  navigateBackResult.value = result
  if (result?.success) {
    ElMessage.success('页面返回工具测试成功！')
  }
}

// 运行综合测试
const runComprehensiveTest = async () => {
  ElMessage.info('开始运行综合测试...')
  
  const results = []
  
  // 1. 文本输入测试
  results.push(await callTool('type_text', {
    selector: '#test-input',
    text: '综合测试文本',
    options: { clear_first: true }
  }))
  
  // 2. 等待条件测试
  showElement.value = true
  results.push(await callTool('wait_for_condition', {
    condition_type: 'element_visible',
    target: '#test-element',
    options: { timeout: 3000 }
  }))
  
  // 3. 控制台监控测试
  console.log('综合测试控制台消息')
  results.push(await callTool('console_monitor', {
    action: 'get_messages',
    options: { max_messages: 5 }
  }))
  
  comprehensiveResult.value = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    successCount: results.filter(r => r?.success).length,
    results
  }
  
  ElMessage.success('综合测试完成！')
}
</script>

<style scoped lang="scss">
.page-operation-tools-test {
  padding: var(--spacing-5xl);
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  text-align: center;
  margin-bottom: var(--spacing-8xl);
  
  h1 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-2xl);
  }
  
  p {
    color: #666;
    font-size: var(--text-md);
  }
}

.test-sections {
  display: grid;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-10xl);
}

.test-section {
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5xl);
  background: #fff;
  
  h3 {
    margin-bottom: var(--spacing-4xl);
    color: var(--text-primary);
  }
  
  .test-controls {
    display: flex;
    gap: var(--spacing-2xl);
    align-items: center;
    margin-bottom: var(--spacing-4xl);
    flex-wrap: wrap;
  }
  
  .test-result {
    background: var(--bg-hover);
    border-radius: var(--radius-sm);
    padding: var(--spacing-2xl);
    
    pre {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-regular);
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

.test-element {
  padding: var(--spacing-2xl);
  background: var(--success-color);
  color: white;
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-2xl);
}

.comprehensive-test {
  text-align: center;
  padding: var(--spacing-8xl);
  background: var(--gradient-purple);
  color: white;
  border-radius: var(--radius-xl);
  
  h2 {
    margin-bottom: var(--spacing-2xl);
  }
  
  p {
    margin-bottom: var(--spacing-5xl);
    opacity: 0.9;
  }
  
  .test-result {
    margin-top: var(--spacing-5xl);
    background: var(--white-alpha-10);
    border-radius: var(--radius-lg);
    padding: var(--spacing-4xl);
    text-align: left;
    
    h4 {
      margin-bottom: var(--spacing-2xl);
    }
    
    pre {
      color: #fff;
      font-size: var(--text-sm);
    }
  }
}
</style>
