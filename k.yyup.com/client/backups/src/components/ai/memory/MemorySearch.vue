<template>
  <div class="memory-search">
    <div class="search-header">
      <el-input
        v-model="searchQuery"
        placeholder="搜索记忆内容..."
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      
      <div class="search-filters">
        <el-select v-model="searchFilters.memoryType" placeholder="记忆类型" clearable>
          <el-option label="全部类型" value="" />
          <el-option label="即时记忆" value="immediate" />
          <el-option label="短期记忆" value="short_term" />
          <el-option label="长期记忆" value="long_term" />
        </el-select>
        
        <el-select v-model="searchFilters.sortBy" placeholder="排序方式">
          <el-option label="时间降序" value="date_desc" />
          <el-option label="时间升序" value="date_asc" />
          <el-option label="重要性降序" value="importance_desc" />
          <el-option label="重要性升序" value="importance_asc" />
        </el-select>
        
        <el-button @click="showAdvancedFilters = !showAdvancedFilters">
          {{ showAdvancedFilters ? '隐藏高级筛选' : '高级筛选' }}
          <el-icon>
            <component :is="showAdvancedFilters ? 'ArrowUp' : 'ArrowDown'" />
          </el-icon>
        </el-button>
      </div>
    </div>
    
    <div v-if="showAdvancedFilters" class="advanced-filters">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="最小重要性">
            <el-slider
              v-model="searchFilters.minImportance"
              :min="0"
              :max="1"
              :step="0.1"
              show-stops
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="8">
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="searchFilters.fromDate"
              type="date"
              placeholder="选择开始日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="8">
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="searchFilters.toDate"
              type="date"
              placeholder="选择结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row>
        <el-col :span="24" class="filter-actions">
          <el-button type="primary" @click="handleSearch">应用筛选</el-button>
          <el-button @click="resetFilters">重置筛选</el-button>
        </el-col>
      </el-row>
    </div>
    
    <div v-if="isSearching" class="search-loading">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="searchResults.length === 0 && hasSearched" class="no-results">
      <el-empty description="未找到匹配的记忆" />
    </div>
    
    <div v-else-if="searchResults.length > 0" class="search-results">
      <MemoryCard
        v-for="memory in searchResults"
        :key="memory.id"
        :memory="memory"
        @view="handleViewMemory"
        @delete="handleDeleteMemory"
      />
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <el-dialog v-model="memoryDetailVisible" title="记忆详情" width="600px">
      <div v-if="selectedMemory" class="memory-detail">
        <div class="memory-content">{{ selectedMemory.content }}</div>
        <div class="memory-meta">
          <div class="meta-item">
            <span class="meta-label">重要性:</span>
            <el-rate
              v-model="selectedMemory.importance"
              :max="1"
              :step="0.1"
              disabled
              show-score
              score-template="{value}"
            />
          </div>
          <div class="meta-item">
            <span class="meta-label">类型:</span>
            <el-tag>{{ getMemoryTypeLabel(selectedMemory.memoryType) }}</el-tag>
          </div>
          <div class="meta-item">
            <span class="meta-label">创建时间:</span>
            <span>{{ formatDate(selectedMemory.createdAt) }}</span>
          </div>
          <div v-if="selectedMemory.expiresAt" class="meta-item">
            <span class="meta-label">过期时间:</span>
            <span>{{ formatDate(selectedMemory.expiresAt) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import MemoryCard from './MemoryCard.vue';
import { AI_MEMORY_ENDPOINTS } from '@/api/endpoints'
import request from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

// 定义接口
interface Memory {
  id: number;
  userId: number;
  conversationId: string;
  content: string;
  importance: number;
  memoryType: string;
  createdAt: string;
  expiresAt?: string;
  embedding?: any;
}

interface SearchFilters {
  memoryType: string;
  minImportance: number;
  fromDate: string;
  toDate: string;
  sortBy: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

// 定义props
interface Props {
  userId: number;
}

const props = defineProps<Props>();

// 格式化日期函数
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

// 响应式数据
const searchQuery = ref('');
const searchResults = ref<Memory[]>([]);
const isSearching = ref(false);
const hasSearched = ref(false);
const showAdvancedFilters = ref(false);

// 使用ref代替reactive，避免类型问题
const searchFilters = ref<SearchFilters>({
  memoryType: '',
  minImportance: 0,
  fromDate: '',
  toDate: '',
  sortBy: 'date_desc'
});

// 使用ref代替reactive，避免类型问题
const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const selectedMemory = ref<Memory | null>(null);
const memoryDetailVisible = ref(false);

// 执行搜索
const handleSearch = async () => {
  isSearching.value = true;
  
  try {
    // 准备查询参数
    const params: any = {
      userId: props.userId,
      query: searchQuery.value,
      limit: pagination.value.pageSize,
      offset: (pagination.value.currentPage - 1) * pagination.value.pageSize
    };
    
    // 添加过滤条件
    if (searchFilters.value.memoryType) {
      params.memoryType = searchFilters.value.memoryType;
    }
    
    if (searchFilters.value.minImportance > 0) {
      params.minImportance = searchFilters.value.minImportance;
    }
    
    if (searchFilters.value.fromDate) {
      params.fromDate = searchFilters.value.fromDate;
    }
    
    if (searchFilters.value.toDate) {
      params.toDate = searchFilters.value.toDate;
    }
    
    // 添加排序
    const [sortField, sortDirection] = searchFilters.value.sortBy.split('_');
    params.sortField = sortField === 'date' ? 'createdAt' : sortField;
    params.sortDirection = sortDirection.toUpperCase();
    
    // 调用API
    const result: ApiResponse = await request.get(AI_MEMORY_ENDPOINTS.SEARCH(props.userId), { params });
    searchResults.value = result.items || [];
    pagination.value.total = result.total || 0;
    hasSearched.value = true;
  } catch (error) {
    console.error('搜索记忆失败:', error);
    ElMessage.error({
      message: '搜索记忆失败',
      type: 'error',
      duration: 3000
    });
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

// 重置筛选条件
const resetFilters = () => {
  searchFilters.value.memoryType = '';
  searchFilters.value.minImportance = 0;
  searchFilters.value.fromDate = '';
  searchFilters.value.toDate = '';
  searchFilters.value.sortBy = 'date_desc';
  pagination.value.currentPage = 1;
};

// 查看记忆详情
const handleViewMemory = (memory: Memory) => {
  selectedMemory.value = memory;
  memoryDetailVisible.value = true;
};

// 删除记忆
const handleDeleteMemory = async (memory: Memory) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条记忆吗？此操作不可撤销。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await request.del(AI_MEMORY_ENDPOINTS.DELETE(props.userId, memory.id));
    ElMessage.success({
      message: '记忆已删除',
      type: 'success',
      duration: 2000
    });
    
    // 从结果中移除
    searchResults.value = searchResults.value.filter(item => item.id !== memory.id);
    pagination.value.total -= 1;
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除记忆失败:', error);
      ElMessage.error({
        message: '删除记忆失败',
        type: 'error',
        duration: 3000
      });
    }
  }
};

// 分页相关
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  handleSearch();
};

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page;
  handleSearch();
};

// 获取记忆类型标签
const getMemoryTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    immediate: '即时记忆',
    short_term: '短期记忆',
    long_term: '长期记忆',
    shortterm: '短期记忆',
    longterm: '长期记忆'
  };
  return typeMap[type] || type;
};

// 组件挂载时执行初始搜索
onMounted(() => {
  handleSearch();
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.memory-search {
  width: 100%;
}

.search-header {
  margin-bottom: var(--spacing-lg);
}

.search-filters {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.advanced-filters {
  background-color: var(--bg-color-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-base);
  margin-bottom: var(--spacing-lg);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-sm);
}

.search-loading {
  padding: var(--spacing-lg) 0;
}

.no-results {
  padding: var(--spacing-2xl) 0;
  text-align: center;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.pagination {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
}

.memory-detail {
  padding: var(--spacing-lg);
}

.memory-content {
  font-size: var(--font-size-base);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
  white-space: pre-wrap;
}

.memory-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  font-weight: var(--font-weight-bold);
  margin-right: var(--spacing-sm);
  width: 80px;
}

/* 响应式调整 */
@media (max-width: 76var(--spacing-sm)) {
  .search-filters {
    flex-direction: column;
  }
  
  .advanced-filters .el-col {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
}
</style> 