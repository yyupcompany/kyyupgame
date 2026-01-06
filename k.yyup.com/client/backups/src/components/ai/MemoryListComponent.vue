<!--
  记忆列表组件
  显示特定类型的记忆列表
-->
<template>
  <div class="memory-list-container">
    <div class="list-header">
      <h3>{{ getMemoryTypeLabel(memoryType) }}</h3>
      <el-button size="small" @click="fetchMemories">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    
    <div v-if="loading" class="list-loading">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="memories.length > 0" class="memory-list">
      <el-card v-for="memory in memories" :key="memory.id" class="memory-card">
        <template #header>
          <div class="memory-header">
            <span class="memory-importance">
              重要性: {{ formatImportance(memory.importance) }}
            </span>
            <span v-if="memory.expiresAt" class="memory-expires">
              过期时间: {{ formatDate(memory.expiresAt) }}
            </span>
          </div>
        </template>
        
        <div class="memory-content">
          {{ memory.content }}
        </div>
        
        <div class="memory-footer">
          <span class="memory-date">
            创建时间: {{ formatDate(memory.createdAt) }}
          </span>
          
          <div class="memory-actions">
            <el-button 
              v-if="memoryType === 'short_term'" 
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
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <div v-else class="empty-list">
      <el-empty description="暂无记忆" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

// 模拟API函数，实际应从@/api/ai-memory导入
const searchMemories = async (userId: number, params: any) => {
  console.log('搜索记忆:', userId, params);
  // 返回模拟数据
  return {
    items: [],
    total: 0
  };
};

const deleteMemory = async (userId: number, memoryId: number) => {
  console.log('删除记忆:', userId, memoryId);
  // 返回成功
  return { success: true };
};

const archiveToLongTerm = async (memoryId: number) => {
  console.log('归档记忆:', memoryId);
  // 返回成功
  return { success: true };
};

// 记忆类型枚举
enum MemoryType {
  IMMEDIATE = 'immediate',
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term'
}

// 记忆接口
interface Memory {
  id: number;
  userId: number;
  conversationId: string;
  content: string;
  importance: number;
  memoryType: string;
  createdAt: string;
  expiresAt?: string;
}

type EmitType = {
  (e: 'refresh'): void;
};

export default defineComponent({
  name: 'MemoryListComponent',
  
  components: {
    Refresh
  },
  
  props: {
    userId: {
      type: Number,
      required: true
    },
    memoryType: {
      type: String,
      required: true,
      validator: (value: string) => {
        return ['immediate', 'short_term', 'long_term'].includes(value);
      }
    }
  },
  
  emits: ['refresh'],
  
  setup(props: { userId: number; memoryType: string }, { emit }: { emit: EmitType }) {
    // 分页参数
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    
    // 数据和状态
    const memories = ref<Memory[]>([]);
    const loading = ref(false);
    
    // 获取记忆列表
    const fetchMemories = async () => {
      loading.value = true;
      
      try {
        const response = await searchMemories(props.userId, {
          memoryType: props.memoryType,
          limit: pageSize.value,
          offset: (currentPage.value - 1) * pageSize.value,
          sortField: 'createdAt',
          sortDirection: 'DESC'
        });
        
        memories.value = response.items || [];
        total.value = response.total || 0;
      } catch (error) {
        console.error('获取记忆列表失败:', error);
        ElMessage.error('获取记忆列表失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 删除记忆
    const handleDeleteMemory = async (memoryId: number) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除此记忆吗？此操作不可恢复。',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        await deleteMemory(props.userId, memoryId);
        
        ElMessage.success('记忆删除成功');
        
        // 刷新列表
        fetchMemories();
        
        // 通知父组件刷新
        emit('refresh');
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('删除记忆失败:', error);
          ElMessage.error('删除记忆失败');
        }
      }
    };
    
    // 归档记忆
    const handleArchiveMemory = async (memoryId: number) => {
      try {
        await ElMessageBox.confirm(
          '确定要将此记忆归档为长期记忆吗？',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        // 调用归档API
        await archiveToLongTerm(memoryId);
        
        ElMessage.success('记忆归档成功');
        
        // 刷新列表
        fetchMemories();
        
        // 通知父组件刷新
        emit('refresh');
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('归档记忆失败:', error);
          ElMessage.error('归档记忆失败');
        }
      }
    };
    
    // 分页处理
    const handleSizeChange = (size: number) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchMemories();
    };
    
    const handleCurrentChange = (page: number) => {
      currentPage.value = page;
      fetchMemories();
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
    const getMemoryTypeLabel = (memoryType: string): string => {
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
    
    // 监听属性变化
    watch(() => props.memoryType, () => {
      currentPage.value = 1;
      fetchMemories();
    });
    
    // 组件挂载时获取数据
    onMounted(() => {
      fetchMemories();
    });
    
    return {
      currentPage,
      pageSize,
      total,
      memories,
      loading,
      fetchMemories,
      handleDeleteMemory,
      handleArchiveMemory,
      handleSizeChange,
      handleCurrentChange,
      formatImportance,
      formatDate,
      getMemoryTypeLabel
    };
  }
});
</script>

<style lang="scss" scoped>
.memory-list-container {
  padding: var(--text-base);
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);
    
    h3 {
      margin: 0;
    }
  }
  
  .memory-list {
    display: flex;
    flex-direction: column;
    gap: var(--text-base);
    
    .memory-card {
      .memory-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .memory-importance {
          font-weight: bold;
        }
        
        .memory-expires {
          color: var(--warning-color);
          font-size: var(--text-xs);
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
    
    .pagination {
      margin-top: var(--text-2xl);
      display: flex;
      justify-content: center;
    }
  }
  
  .empty-list {
    margin-top: var(--spacing-10xl);
  }
  
  .list-loading {
    margin-top: var(--text-2xl);
  }
}
</style>
