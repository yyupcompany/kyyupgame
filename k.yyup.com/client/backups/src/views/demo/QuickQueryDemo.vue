<template>
  <div class="quick-query-demo">
    <div class="demo-header">
      <h2>🔍 快捷查询分组演示</h2>
      <p>输入 <code>/查询</code> 或点击按钮体验快捷查询分组功能</p>
    </div>

    <div class="demo-content">
      <!-- 输入区域 -->
      <div class="input-section">
        <el-input
          v-model="inputMessage"
          placeholder="输入 /查询 或 /query 触发快捷查询"
          @keydown.enter="handleInput"
          size="large"
          class="demo-input"
        >
          <template #append>
            <el-button @click="handleInput" type="primary">发送</el-button>
          </template>
        </el-input>
        
        <div class="demo-buttons">
          <el-button @click="triggerQuickQuery" type="primary" size="large">
            🔍 触发快捷查询
          </el-button>
          <el-button @click="showAllGroups" size="large">
            📋 查看所有分组
          </el-button>
        </div>
      </div>

      <!-- 结果显示区域 -->
      <div v-if="selectedQuery" class="result-section">
        <el-alert
          :title="`已选择查询: ${selectedQuery.keyword}`"
          :description="selectedQuery.description"
          type="success"
          show-icon
          :closable="false"
        />
        <div class="query-info">
          <el-tag type="info">预估消耗: {{ selectedQuery.tokens }}T</el-tag>
          <el-tag type="primary">类别: {{ getCategoryLabel(selectedQuery.category) }}</el-tag>
        </div>
      </div>
    </div>

    <!-- 快捷查询分组对话框 -->
    <el-dialog
      v-model="quickQueryVisible"
      title="🔍 快捷查询分组"
      width="700px"
      :modal="true"
      :append-to-body="true"
    >
      <QuickQueryGroups
        @close="quickQueryVisible = false"
        @select-query="handleQuerySelect"
      />
    </el-dialog>

    <!-- 所有分组展示对话框 -->
    <el-dialog
      v-model="allGroupsVisible"
      title="📋 所有快捷查询分组"
      width="800px"
      :modal="true"
    >
      <div v-if="loading" class="loading-container" v-loading="loading">
        <p>加载中...</p>
      </div>
      
      <div v-else class="groups-display">
        <div 
          v-for="group in allGroups" 
          :key="group.id"
          class="group-display-card"
        >
          <div class="group-header">
            <h4>{{ group.name }}</h4>
            <el-tag size="small">{{ group.queries?.length || group.queryCount || 0 }} 个查询</el-tag>
          </div>
          <p class="group-description">{{ group.description }}</p>
          
          <div v-if="group.queries" class="queries-preview">
            <div 
              v-for="query in group.queries.slice(0, 3)" 
              :key="query.keyword"
              class="query-preview-item"
              @click="handleQuerySelect(query)"
            >
              <span class="query-keyword">{{ query.keyword }}</span>
              <span class="query-desc">{{ query.description }}</span>
            </div>
            <div v-if="group.queries.length > 3" class="more-queries">
              还有 {{ group.queries.length - 3 }} 个查询...
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import QuickQueryGroups from '@/components/ai-assistant/dialogs/QuickQueryGroups.vue'
import { quickQueryGroupsApi, type QuickQueryGroup, type QuickQueryItem } from '@/api/quick-query-groups'

// 响应式数据
const inputMessage = ref('')
const quickQueryVisible = ref(false)
const allGroupsVisible = ref(false)
const loading = ref(false)
const selectedQuery = ref<QuickQueryItem | null>(null)
const allGroups = ref<QuickQueryGroup[]>([])

// 类别标签文本映射
const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    count: '统计',
    analysis: '分析',
    list: '列表',
    navigation: '导航',
    schedule: '日程',
    ranking: '排名',
    trend: '趋势',
    report: '报告',
    status: '状态',
    overview: '概览',
    summary: '汇总',
    info: '信息'
  }
  return labelMap[category] || category
}

// 处理输入
const handleInput = () => {
  const message = inputMessage.value.trim()
  
  if (message === '/查询' || message === '/query') {
    triggerQuickQuery()
    inputMessage.value = ''
  } else if (message) {
    ElMessage.info(`普通消息: ${message}`)
    inputMessage.value = ''
  }
}

// 触发快捷查询
const triggerQuickQuery = () => {
  quickQueryVisible.value = true
}

// 处理查询选择
const handleQuerySelect = (query: QuickQueryItem) => {
  selectedQuery.value = query
  quickQueryVisible.value = false
  allGroupsVisible.value = false
  
  ElMessage.success(`已选择查询: ${query.keyword}`)
  
  // 模拟发送查询
  setTimeout(() => {
    ElMessage.info(`正在执行查询: ${query.keyword}...`)
  }, 500)
}

// 显示所有分组
const showAllGroups = async () => {
  try {
    loading.value = true
    allGroupsVisible.value = true
    
    const response = await quickQueryGroupsApi.getAllGroups()
    
    if (response.success) {
      allGroups.value = response.data
    } else {
      ElMessage.error('加载分组失败')
    }
  } catch (error) {
    console.error('加载分组失败:', error)
    ElMessage.error('加载分组失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  ElMessage.info('快捷查询演示页面已加载，输入 /查询 体验功能')
})
</script>

<style scoped lang="scss">
.quick-query-demo {
  padding: var(--spacing-6xl);
  max-width: 1200px;
  margin: 0 auto;
  
  .demo-header {
    text-align: center;
    margin-bottom: var(--spacing-8xl);
    
    h2 {
      margin: 0 0 12px 0;
      color: var(--el-text-color-primary);
    }
    
    p {
      margin: 0;
      color: var(--el-text-color-regular);
      
      code {
        background: var(--el-fill-color-light);
        padding: var(--spacing-sm) 6px;
        border-radius: var(--radius-sm);
        font-family: 'Monaco', 'Consolas', monospace;
      }
    }
  }
  
  .demo-content {
    .input-section {
      margin-bottom: var(--spacing-6xl);
      
      .demo-input {
        margin-bottom: var(--spacing-4xl);
      }
      
      .demo-buttons {
        display: flex;
        justify-content: center;
        gap: var(--spacing-lg);
      }
    }
    
    .result-section {
      .query-info {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-3xl);
      }
    }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-10xl);
    
    p {
      margin-top: var(--spacing-4xl);
      color: var(--el-text-color-regular);
    }
  }
  
  .groups-display {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-xl);
    
    .group-display-card {
      border: var(--border-width-base) solid var(--el-border-color-light);
      border-radius: var(--radius-lg);
      padding: var(--spacing-4xl);
      
      .group-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-xl);
        
        h4 {
          margin: 0;
          font-size: var(--text-md);
          color: var(--el-text-color-primary);
        }
      }
      
      .group-description {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--el-text-color-regular);
        font-size: var(--text-base);
        line-height: 1.4;
      }
      
      .queries-preview {
        .query-preview-item {
          display: flex;
          flex-direction: column;
          padding: var(--spacing-xl) 12px;
          margin-bottom: var(--spacing-xl);
          border: var(--border-width-base) solid var(--el-border-color-lighter);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
          
          &:hover {
            border-color: var(--el-color-primary);
            background-color: var(--el-color-primary-light-9);
          }
          
          .query-keyword {
            font-weight: 600;
            color: var(--el-text-color-primary);
            font-size: var(--text-base);
            margin-bottom: var(--spacing-md);
          }
          
          .query-desc {
            color: var(--el-text-color-regular);
            font-size: var(--text-sm);
            line-height: 1.3;
          }
        }
        
        .more-queries {
          text-align: center;
          color: var(--el-text-color-secondary);
          font-size: var(--text-sm);
          padding: var(--spacing-xl);
        }
      }
    }
  }
}
</style>
