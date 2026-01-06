<template>
  <div class="simple-test">
    <h2>简单快捷查询测试</h2>
    
    <div class="test-section">
      <h3>基础测试</h3>
      <el-button @click="testFetch" type="primary">测试Fetch API</el-button>
      <el-button @click="testRequestUtil" type="success">测试Request工具</el-button>
      <el-button @click="showDialog" type="warning">显示快捷查询对话框</el-button>
    </div>
    
    <div class="results">
      <h4>测试结果：</h4>
      <pre>{{ results }}</pre>
    </div>

    <!-- 简单的快捷查询对话框 -->
    <el-dialog v-model="dialogVisible" title="快捷查询测试" width="800px">
      <div class="dialog-content">
        <h4>对话框已打开</h4>
        <p>加载状态: {{ loading }}</p>
        <p>分组数量: {{ groups.length }}</p>
        
        <div v-if="loading">加载中...</div>
        
        <div v-else-if="groups.length === 0" class="empty">
          <p>没有分组数据</p>
          <el-button @click="loadGroupsInDialog">重新加载</el-button>
        </div>
        
        <div v-else class="groups-list">
          <div v-for="group in groups" :key="group.id" class="group-item">
            <h5>{{ group.name }}</h5>
            <p>{{ group.description }}</p>
            <span>{{ group.queryCount }} 个查询</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { quickQueryGroupsApi } from '@/api/quick-query-groups'

const results = ref('')
const dialogVisible = ref(false)
const loading = ref(false)
const groups = ref([])

const addResult = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  results.value += `[${timestamp}] ${message}\n`
}

// 测试原生fetch
const testFetch = async () => {
  try {
    addResult('开始测试原生fetch...')
    const response = await fetch('/api/quick-query-groups/overview')
    addResult(`Fetch状态: ${response.status}`)
    
    const data = await response.json()
    addResult(`Fetch成功: ${data.success}`)
    addResult(`Fetch数据: ${data.data?.length || 0} 个分组`)
    
    if (data.data && data.data.length > 0) {
      addResult(`第一个分组: ${data.data[0].name}`)
    }
    
    ElMessage.success('Fetch测试成功')
  } catch (error) {
    addResult(`Fetch失败: ${error.message}`)
    ElMessage.error('Fetch测试失败')
  }
}

// 测试request工具
const testRequestUtil = async () => {
  try {
    addResult('开始测试request工具...')
    const response = await quickQueryGroupsApi.getGroupsOverview()
    addResult(`Request成功: ${response.success}`)
    addResult(`Request数据: ${response.data?.length || 0} 个分组`)
    
    if (response.data && response.data.length > 0) {
      addResult(`第一个分组: ${response.data[0].name}`)
    }
    
    ElMessage.success('Request工具测试成功')
  } catch (error) {
    addResult(`Request工具失败: ${error.message}`)
    ElMessage.error('Request工具测试失败')
    console.error('Request工具错误:', error)
  }
}

// 显示对话框并加载数据
const showDialog = () => {
  dialogVisible.value = true
  loadGroupsInDialog()
}

// 在对话框中加载分组
const loadGroupsInDialog = async () => {
  try {
    loading.value = true
    groups.value = []
    
    addResult('对话框中开始加载分组...')
    
    const response = await quickQueryGroupsApi.getGroupsOverview()
    
    if (response.success) {
      groups.value = response.data
      addResult(`对话框加载成功: ${response.data.length} 个分组`)
      ElMessage.success('对话框加载成功')
    } else {
      addResult(`对话框加载失败: ${response.message || '未知错误'}`)
      ElMessage.error('对话框加载失败')
    }
  } catch (error) {
    addResult(`对话框加载异常: ${error.message}`)
    ElMessage.error('对话框加载异常')
    console.error('对话框加载错误:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.simple-test {
  padding: var(--spacing-5xl);
  max-width: 100%; max-width: 1000px;
  margin: 0 auto;
  
  .test-section {
    margin-bottom: var(--spacing-5xl);
    
    .el-button {
      margin-right: var(--spacing-2xl);
      margin-bottom: var(--spacing-2xl);
    }
  }
  
  .results {
    pre {
      background: var(--bg-secondary);
      padding: var(--spacing-4xl);
      border-radius: var(--radius-md);
      max-min-height: 60px; height: auto;
      overflow-y: auto;
      font-size: var(--text-sm);
      line-height: 1.4;
    }
  }
  
  .dialog-content {
    .empty {
      text-align: center;
      padding: var(--spacing-5xl);
      color: #666;
    }
    
    .groups-list {
      .group-item {
        border: var(--border-width-base) solid #e0e0e0;
        border-radius: var(--radius-md);
        padding: var(--spacing-3xl);
        margin-bottom: var(--spacing-2xl);
        
        h5 {
          margin: 0 0 var(--spacing-sm) 0;
          color: #333;
        }
        
        p {
          margin: 0 0 var(--spacing-sm) 0;
          color: #666;
          font-size: var(--text-base);
        }
        
        span {
          color: #999;
          font-size: var(--text-sm);
        }
      }
    }
  }
}
</style>
