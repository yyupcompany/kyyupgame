<template>
  <div class="api-test">
    <h2>API测试页面</h2>
    
    <div class="test-section">
      <h3>快捷查询分组API测试</h3>
      
      <div class="test-buttons">
        <el-button @click="testOverviewAPI" type="primary">测试概览API</el-button>
        <el-button @click="testAllGroupsAPI" type="success">测试所有分组API</el-button>
        <el-button @click="testPersonnelAPI" type="info">测试人员分组API</el-button>
      </div>
      
      <div class="test-results">
        <h4>测试结果：</h4>
        <pre>{{ testResults }}</pre>
      </div>
      
      <div class="manual-test">
        <h4>手动测试快捷查询组件：</h4>
        <el-button @click="showQuickQuery" type="warning">显示快捷查询</el-button>
      </div>
    </div>

    <!-- 快捷查询组件测试 -->
    <el-dialog
      v-model="quickQueryVisible"
      title="快捷查询测试"
      width="700px"
    >
      <QuickQueryGroups
        @close="quickQueryVisible = false"
        @select-query="handleQuerySelect"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { quickQueryGroupsApi } from '@/api/quick-query-groups'
import QuickQueryGroups from '@/components/ai-assistant/dialogs/QuickQueryGroups.vue'

const testResults = ref('')
const quickQueryVisible = ref(false)

const addResult = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  testResults.value += `[${timestamp}] ${message}\n`
}

const testOverviewAPI = async () => {
  try {
    addResult('开始测试概览API...')
    const response = await quickQueryGroupsApi.getGroupsOverview()
    addResult(`概览API成功: ${JSON.stringify(response, null, 2)}`)
    ElMessage.success('概览API测试成功')
  } catch (error) {
    addResult(`概览API失败: ${error}`)
    ElMessage.error('概览API测试失败')
    console.error('概览API错误:', error)
  }
}

const testAllGroupsAPI = async () => {
  try {
    addResult('开始测试所有分组API...')
    const response = await quickQueryGroupsApi.getAllGroups()
    addResult(`所有分组API成功: 返回${response.data?.length || 0}个分组`)
    addResult(`详细数据: ${JSON.stringify(response.data?.[0], null, 2)}`)
    ElMessage.success('所有分组API测试成功')
  } catch (error) {
    addResult(`所有分组API失败: ${error}`)
    ElMessage.error('所有分组API测试失败')
    console.error('所有分组API错误:', error)
  }
}

const testPersonnelAPI = async () => {
  try {
    addResult('开始测试人员分组API...')
    const response = await quickQueryGroupsApi.getGroupById('personnel')
    addResult(`人员分组API成功: ${response.data?.queries?.length || 0}个查询`)
    addResult(`详细数据: ${JSON.stringify(response.data, null, 2)}`)
    ElMessage.success('人员分组API测试成功')
  } catch (error) {
    addResult(`人员分组API失败: ${error}`)
    ElMessage.error('人员分组API测试失败')
    console.error('人员分组API错误:', error)
  }
}

const showQuickQuery = () => {
  quickQueryVisible.value = true
}

const handleQuerySelect = (query: any) => {
  addResult(`选择了查询: ${query.keyword} - ${query.description}`)
  ElMessage.success(`选择了查询: ${query.keyword}`)
  quickQueryVisible.value = false
}
</script>

<style scoped lang="scss">
.api-test {
  padding: var(--spacing-5xl);
  max-width: 1000px;
  margin: 0 auto;
  
  .test-section {
    margin-bottom: var(--spacing-8xl);
    
    h3 {
      margin-bottom: var(--spacing-4xl);
      color: var(--el-text-color-primary);
    }
    
    .test-buttons {
      margin-bottom: var(--spacing-5xl);
      
      .el-button {
        margin-right: var(--spacing-2xl);
        margin-bottom: var(--spacing-2xl);
      }
    }
    
    .test-results {
      margin-bottom: var(--spacing-5xl);
      
      h4 {
        margin-bottom: var(--spacing-2xl);
        color: var(--el-text-color-regular);
      }
      
      pre {
        background: var(--el-fill-color-light);
        padding: var(--spacing-4xl);
        border-radius: var(--radius-md);
        max-height: 400px;
        overflow-y: auto;
        font-size: var(--text-sm);
        line-height: 1.4;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
    
    .manual-test {
      h4 {
        margin-bottom: var(--spacing-2xl);
        color: var(--el-text-color-regular);
      }
    }
  }
}
</style>
