<!--
  记忆搜索组件
  实现基于相似度的记忆搜索功能
-->
<template>
  <div class="memory-search-container">
    <div class="search-header">
      <h3>记忆搜索</h3>
      <el-tooltip content="基于相似度搜索相关记忆">
        <el-icon><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>
    
    <div class="search-form">
      <el-input
        v-model="searchQuery"
        placeholder="请输入搜索内容"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </template>
      </el-input>
      
      <div class="search-options">
        <el-select 
          v-model="provider" 
          placeholder="选择提供商"
          size="small"
        >
          <el-option label="OpenAI" value="openai" />
          <el-option label="DeepSeek" value="deepseek" />
        </el-select>
        
        <el-slider
          v-model="similarityThreshold"
          :min="0.5"
          :max="0.95"
          :step="0.05"
          :format-tooltip="value => `${Math.round(value * 100)}%`"
          :marks="{
            0.5: '50%',
            0.7: '70%',
            0.9: '90%'
          }"
        >
          <template #prepend>
            相似度阈值
          </template>
        </el-slider>
        
        <el-input-number
          v-model="limit"
          :min="1"
          :max="20"
          size="small"
        >
          <template #prepend>
            结果数量
          </template>
        </el-input-number>
      </div>
    </div>
    
    <div v-if="loading" class="search-loading">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="searchResults.length > 0" class="search-results">
      <el-card v-for="memory in searchResults" :key="memory.id" class="memory-card">
        <template #header>
          <div class="memory-header">
            <span class="memory-type" :class="memory.memoryType">
              {{ getMemoryTypeLabel(memory.memoryType) }}
            </span>
            <div class="memory-meta">
              <el-tag size="small" type="info">
                相似度: {{ formatSimilarity(memory.similarity) }}
              </el-tag>
              <el-tag size="small" type="warning">
                重要性: {{ formatImportance(memory.importance) }}
              </el-tag>
            </div>
          </div>
        </template>
        
        <div class="memory-content">
          {{ memory.content }}
        </div>
        
        <div class="memory-footer">
          <span class="memory-date">
            {{ formatDate(memory.createdAt) }}
          </span>
          
          <div class="memory-actions">
            <el-button 
              size="small" 
              type="primary" 
              @click="handleUseMemory(memory)"
            >
              使用记忆
            </el-button>
            
            <el-button 
              v-if="memory.memoryType === 'short_term'" 
              size="small" 
              @click="handleArchiveMemory(memory.id)"
            >
              归档
            </el-button>
            
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDeleteMemory(memory.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <div v-else-if="searched" class="search-empty">
      <el-empty description="未找到匹配的记忆" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { QuestionFilled, Search } from '@element-plus/icons-vue';

// 定义接口
interface SimilarMemory {
  id: number;
  userId: number;
  conversationId: string;
  content: string;
  importance: number;
  memoryType: string;
  createdAt: string;
  expiresAt?: string;
  similarity: number;
}

// 定义props
interface Props {
  userId: number;
}

const props = defineProps<Props>();

// 定义emits
const emit = defineEmits<{
  'use-memory': [memory: SimilarMemory]
}>();

// 模拟API函数，实际应从@/api/ai-memory导入
const findSimilarMemories = async (
  query: string,
  userId: number,
  limit: number,
  threshold: number,
  provider: string
) => {
  console.log('查找相似记忆:', { query, userId, limit, threshold, provider });
  // 返回模拟数据
  return {
    data: []
  };
};

const deleteMemory = async (memoryId: number) => {
  console.log('删除记忆:', memoryId);
  return { success: true };
};

const archiveToLongTerm = async (memoryId: number) => {
  console.log('归档记忆:', memoryId);
  return {
    data: {
      id: memoryId,
      memoryType: 'long_term'
    }
  };
};

// 搜索参数
const searchQuery = ref('');
const provider = ref<'openai' | 'deepseek'>('openai');
const similarityThreshold = ref(0.7);
const limit = ref(5);

// 搜索状态
const loading = ref(false);
const searched = ref(false);
const searchResults = ref<SimilarMemory[]>([]);

// 搜索记忆
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容');
    return;
  }
  
  loading.value = true;
  
  try {
    const response = await findSimilarMemories(
      searchQuery.value,
      props.userId,
      limit.value,
      similarityThreshold.value,
      provider.value
    );
    
    searchResults.value = response.data;
    searched.value = true;
  } catch (error) {
    console.error('搜索记忆失败:', error);
    ElMessage.error('搜索记忆失败');
  } finally {
    loading.value = false;
  }
};

// 使用记忆
const handleUseMemory = (memory: SimilarMemory) => {
  emit('use-memory', memory);
};

// 归档记忆
const handleArchiveMemory = async (memoryId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要将此记忆归档为长期记忆吗？',
      '归档确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await archiveToLongTerm(memoryId);
    
    ElMessage.success('记忆归档成功');
    
    // 更新记忆列表
    const index = searchResults.value.findIndex(m => m.id === memoryId);
    if (index !== -1) {
      searchResults.value[index] = {
        ...searchResults.value[index],
        ...response.data,
        memoryType: 'long_term'
      };
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('归档记忆失败:', error);
      ElMessage.error('归档记忆失败');
    }
  }
};

// 删除记忆
const handleDeleteMemory = async (memoryId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此记忆吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteMemory(memoryId);
    
    ElMessage.success('记忆删除成功');
    
    // 从列表中移除
    searchResults.value = searchResults.value.filter(m => m.id !== memoryId);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除记忆失败:', error);
      ElMessage.error('删除记忆失败');
    }
  }
};

// 格式化相似度
const formatSimilarity = (similarity: number) => {
  return `${Math.round(similarity * 100)}%`;
};

// 格式化重要性
const formatImportance = (importance: number) => {
  return `${Math.round(importance * 100)}%`;
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

// 获取记忆类型标签
const getMemoryTypeLabel = (memoryType: string) => {
  switch (memoryType) {
    case 'immediate':
      return '即时记忆';
    case 'short_term':
    case 'shortterm':
      return '短期记忆';
    case 'long_term':
    case 'longterm':
      return '长期记忆';
    default:
      return '未知类型';
  }
};
</script>

<style lang="scss" scoped>
.memory-search-container {
  padding: var(--text-base);
  
  .search-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--text-lg);
    
    h3 {
      margin: 0;
      margin-right: var(--spacing-sm);
    }
  }
  
  .search-form {
    margin-bottom: var(--text-2xl);
    
    .search-options {
      display: flex;
      align-items: center;
      margin-top: var(--text-sm);
      gap: var(--text-base);
      
      .el-slider {
        flex: 1;
        margin-right: var(--text-lg);
      }
    }
  }
  
  .search-results {
    display: flex;
    flex-direction: column;
    gap: var(--text-base);
    
    .memory-card {
      .memory-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .memory-type {
          padding: var(--spacing-sm) var(--spacing-sm);
          border-radius: var(--spacing-xs);
          font-size: var(--text-xs);
          font-weight: bold;
          
          &.immediate {
            background-color: #e6f7ff;
            color: var(--primary-color);
          }
          
          &.short_term {
            background-color: #f6ffed;
            color: var(--success-color);
          }
          
          &.long_term {
            background-color: var(--bg-white)7e6;
            color: #fa8c16;
          }
        }
        
        .memory-meta {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
      
      .memory-content {
        margin: var(--text-xs) 0;
        white-space: pre-wrap;
        line-height: 1.5;
      }
      
      .memory-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--text-sm);
        
        .memory-date {
          color: var(--info-color);
          font-size: var(--text-xs);
        }
        
        .memory-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }
  }
  
  .search-empty {
    margin-top: var(--spacing-10xl);
  }
  
  .search-loading {
    margin-top: var(--text-2xl);
  }
}
</style> 