<template>
  <div class="direct-test">
    <h2>直接API测试</h2>
    
    <div class="controls">
      <el-button @click="loadData" type="primary" :loading="loading">
        {{ loading ? '加载中...' : '加载分组数据' }}
      </el-button>
      <el-button @click="clearData" type="danger">清空数据</el-button>
    </div>
    
    <div class="status">
      <p><strong>加载状态:</strong> {{ loading ? '加载中' : '已完成' }}</p>
      <p><strong>数据状态:</strong> {{ dataLoaded ? '已加载' : '未加载' }}</p>
      <p><strong>分组数量:</strong> {{ groups.length }}</p>
      <p><strong>错误信息:</strong> {{ errorMessage || '无' }}</p>
    </div>
    
    <div v-if="rawResponse" class="raw-response">
      <h3>原始API响应:</h3>
      <pre>{{ rawResponse }}</pre>
    </div>
    
    <div v-if="groups.length > 0" class="groups-display">
      <h3>分组数据展示:</h3>
      <div class="groups-grid">
        <div 
          v-for="(group, index) in groups" 
          :key="group.id || index"
          class="group-card"
        >
          <div class="group-header">
            <h4>{{ group.name || '未知分组' }}</h4>
            <span class="group-id">ID: {{ group.id || 'N/A' }}</span>
          </div>
          <p class="group-desc">{{ group.description || '无描述' }}</p>
          <div class="group-meta">
            <span>图标: {{ group.icon || 'N/A' }}</span>
            <span>查询数: {{ group.queryCount || group.queries?.length || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="!loading && dataLoaded" class="no-data">
      <p>没有分组数据</p>
    </div>
    
    <!-- 测试快捷查询组件 -->
    <div class="component-test">
      <h3>组件测试:</h3>
      <el-button @click="showComponent" type="success">显示QuickQueryGroups组件</el-button>
    </div>
    
    <el-dialog v-model="componentVisible" title="QuickQueryGroups组件测试" width="800px">
      <QuickQueryGroups 
        @close="componentVisible = false"
        @select-query="handleQuerySelect"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import QuickQueryGroups from '@/components/ai-assistant/dialogs/QuickQueryGroups.vue'

const loading = ref(false)
const dataLoaded = ref(false)
const groups = ref([])
const rawResponse = ref('')
const errorMessage = ref('')
const componentVisible = ref(false)

const loadData = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    rawResponse.value = ''
    groups.value = []
    
    console.log('🔍 开始加载分组数据...')
    
    // 使用fetch直接调用API
    const response = await fetch('/api/quick-query-groups/overview')
    console.log('📡 响应状态:', response.status)
    console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('📦 响应数据:', data)
    
    rawResponse.value = JSON.stringify(data, null, 2)
    
    if (data.success && Array.isArray(data.data)) {
      groups.value = data.data
      dataLoaded.value = true
      ElMessage.success(`成功加载 ${data.data.length} 个分组`)
    } else {
      throw new Error(data.message || '数据格式不正确')
    }
    
  } catch (error) {
    console.error('❌ 加载失败:', error)
    errorMessage.value = error.message
    ElMessage.error('加载失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const clearData = () => {
  groups.value = []
  rawResponse.value = ''
  errorMessage.value = ''
  dataLoaded.value = false
}

const showComponent = () => {
  componentVisible.value = true
}

const handleQuerySelect = (query) => {
  console.log('选择了查询:', query)
  ElMessage.success(`选择了查询: ${query.keyword}`)
  componentVisible.value = false
}

// 页面加载时自动测试
loadData()
</script>

<style scoped lang="scss">
.direct-test {
  padding: var(--spacing-5xl);
  max-width: 1200px;
  margin: 0 auto;
  
  .controls {
    margin-bottom: var(--spacing-5xl);
    
    .el-button {
      margin-right: var(--spacing-2xl);
    }
  }
  
  .status {
    background: var(--bg-secondary);
    padding: var(--spacing-4xl);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-5xl);
    
    p {
      margin: var(--spacing-base) 0;
      font-size: var(--text-base);
    }
  }
  
  .raw-response {
    margin-bottom: var(--spacing-5xl);
    
    pre {
      background: #f8f8f8;
      padding: var(--spacing-4xl);
      border-radius: var(--radius-md);
      max-height: 300px;
      overflow-y: auto;
      font-size: var(--text-sm);
      line-height: 1.4;
    }
  }
  
  .groups-display {
    margin-bottom: var(--spacing-8xl);
    
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
      
      .group-card {
        border: var(--border-width-base) solid #e0e0e0;
        border-radius: var(--radius-lg);
        padding: var(--spacing-4xl);
        background: white;
        
        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          
          h4 {
            margin: 0;
            color: #333;
            font-size: var(--text-md);
          }
          
          .group-id {
            font-size: var(--text-sm);
            color: #999;
          }
        }
        
        .group-desc {
          margin: 0 0 12px 0;
          color: #666;
          font-size: var(--text-base);
          line-height: 1.4;
        }
        
        .group-meta {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-sm);
          color: #999;
        }
      }
    }
  }
  
  .no-data {
    text-align: center;
    padding: var(--spacing-10xl);
    color: #999;
    font-size: var(--text-md);
  }
  
  .component-test {
    border-top: var(--border-width-base) solid #e0e0e0;
    padding-top: var(--spacing-5xl);
    margin-top: var(--spacing-5xl);
  }
}
</style>
