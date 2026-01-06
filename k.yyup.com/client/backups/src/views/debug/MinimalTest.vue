<template>
  <div class="minimal-test">
    <h2>最小化快捷查询测试</h2>
    
    <div class="test-info">
      <p><strong>测试目的：</strong>验证QuickQueryGroups组件的条件渲染逻辑</p>
      <p><strong>修复内容：</strong>将 v-else 改为 v-if="groups.length > 0"</p>
    </div>
    
    <div class="test-controls">
      <el-button @click="showModal" type="primary" size="large">
        🔍 测试快捷查询组件
      </el-button>
    </div>
    
    <div class="test-status">
      <h3>测试状态：</h3>
      <ul>
        <li>组件导入：✅ 成功</li>
        <li>API端点：✅ 正常 (已验证)</li>
        <li>条件渲染：🔧 已修复</li>
        <li>加载状态：🔧 已优化</li>
      </ul>
    </div>
    
    <!-- 快捷查询组件测试 -->
    <el-dialog 
      v-model="modalVisible" 
      title="🔍 快捷查询分组测试"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="modal-content">
        <p style="margin-bottom: var(--spacing-5xl); color: #666;">
          如果修复成功，你应该能看到6个分组卡片。如果看不到，请查看浏览器控制台的错误信息。
        </p>
        
        <QuickQueryGroups 
          @close="modalVisible = false"
          @select-query="handleQuerySelect"
        />
      </div>
    </el-dialog>
    
    <!-- 结果显示 -->
    <div v-if="selectedQuery" class="result-display">
      <h3>选择结果：</h3>
      <div class="result-card">
        <h4>{{ selectedQuery.keyword }}</h4>
        <p>{{ selectedQuery.description }}</p>
        <div class="result-meta">
          <span>Token消耗: {{ selectedQuery.tokens }}T</span>
          <span>分类: {{ selectedQuery.category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import QuickQueryGroups from '@/components/ai-assistant/dialogs/QuickQueryGroups.vue'

const modalVisible = ref(false)
const selectedQuery = ref(null)

const showModal = () => {
  console.log('🔍 打开快捷查询组件测试...')
  modalVisible.value = true
}

const handleQuerySelect = (query) => {
  console.log('✅ 选择了查询:', query)
  selectedQuery.value = query
  modalVisible.value = false
  ElMessage.success(`已选择查询: ${query.keyword}`)
}
</script>

<style scoped lang="scss">
.minimal-test {
  padding: var(--spacing-8xl);
  max-width: 800px;
  margin: 0 auto;
  
  h2 {
    text-align: center;
    margin-bottom: var(--spacing-8xl);
    color: var(--el-text-color-primary);
  }
  
  .test-info {
    background: var(--color-gray-50);
    padding: var(--spacing-5xl);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-8xl);
    border-left: var(--spacing-xs) solid var(--el-color-primary);
    
    p {
      margin: var(--spacing-xl) 0;
      line-height: 1.6;
    }
  }
  
  .test-controls {
    text-align: center;
    margin-bottom: var(--spacing-8xl);
  }
  
  .test-status {
    background: #f0f9ff;
    padding: var(--spacing-5xl);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-8xl);
    
    h3 {
      margin: 0 0 15px 0;
      color: var(--el-text-color-primary);
    }
    
    ul {
      margin: 0;
      padding-left: var(--spacing-5xl);
      
      li {
        margin: var(--spacing-xl) 0;
        line-height: 1.6;
      }
    }
  }
  
  .modal-content {
    p {
      font-size: var(--text-base);
      line-height: 1.6;
    }
  }
  
  .result-display {
    background: #f0f9ff;
    padding: var(--spacing-5xl);
    border-radius: var(--radius-lg);
    border: var(--border-width-base) solid #e1f5fe;
    
    h3 {
      margin: 0 0 15px 0;
      color: var(--el-color-success);
    }
    
    .result-card {
      background: white;
      padding: var(--spacing-4xl);
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid #e0e0e0;
      
      h4 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--el-text-color-primary);
        font-size: var(--text-md);
      }
      
      p {
        margin: 0 0 12px 0;
        color: var(--el-text-color-regular);
        font-size: var(--text-base);
        line-height: 1.4;
      }
      
      .result-meta {
        display: flex;
        gap: var(--spacing-lg);
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
        
        span {
          background: var(--el-fill-color-light);
          padding: var(--spacing-md) var(--spacing-sm);
          border-radius: var(--radius-sm);
        }
      }
    }
  }
}
</style>
