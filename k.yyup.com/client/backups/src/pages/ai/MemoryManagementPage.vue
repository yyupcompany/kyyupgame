<!--
  记忆管理页面
  集成记忆搜索组件和记忆列表管理功能
-->
<template>
  <div class="page-container memory-management-page">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <h1>AI记忆管理</h1>
        </div>
      </div>
      <div class="card-body">
        <p class="page-description">
          管理AI助手的记忆库，包括短期记忆和长期记忆。您可以搜索、查看、编辑和删除记忆。
        </p>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="记忆搜索" name="search">
            <MemorySearch :userId="currentUserId" />
          </el-tab-pane>
          
          <el-tab-pane label="记忆可视化" name="visualization">
            <MemoryVisualization :userId="currentUserId" />
          </el-tab-pane>
          
          <el-tab-pane label="短期记忆" name="short_term">
            <MemoryListComponent :userId="currentUserId" memoryType="short_term" />
          </el-tab-pane>
          
          <el-tab-pane label="长期记忆" name="long_term">
            <MemoryListComponent :userId="currentUserId" memoryType="long_term" />
          </el-tab-pane>

          <el-tab-pane label="统计分析" name="statistics">
            <MemoryStatistics
              :userId="currentUserId"
              :stats="memoryStats"
              :loading="statsLoading"
              @refresh="fetchMemoryStats"
            />
          </el-tab-pane>

          <el-tab-pane label="设置管理" name="settings">
            <MemorySettings
              :userId="currentUserId"
              @archive="handleArchive"
              @cleanup="handleCleanup"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { getMemoryStats, archiveToLongTerm, cleanupExpiredMemories } from '@/api/ai-memory';
import MemorySearch from '../../components/ai/memory/MemorySearch.vue';
import MemoryVisualization from '../../components/ai/memory/MemoryVisualization.vue';
import MemoryListComponent from '../../components/ai/MemoryListComponent.vue';
import MemoryStatistics from '../../components/ai/memory/MemoryStatistics.vue';
import MemorySettings from '../../components/ai/memory/MemorySettings.vue';

// 响应式数据
const activeTab = ref('search');
const userStore = useUserStore();
const currentUserId = computed(() => userStore.user?.id || 1);

// 统计数据状态
const statsLoading = ref(false);
const memoryStats = reactive({
  totalMemories: 0,
  shortTermCount: 0,
  longTermCount: 0,
  workingCount: 0,
  averageImportance: 0,
  latestMemory: null as string | null
});

// 获取记忆统计信息
const fetchMemoryStats = async () => {
  try {
    statsLoading.value = true;
    const response = await getMemoryStats(currentUserId.value);

    if (response) {
      Object.assign(memoryStats, response);
    } else {
      ElMessage.error('获取统计信息失败');
    }
  } catch (error) {
    console.error('获取记忆统计失败:', error);
    ElMessage.error('获取统计信息失败');
  } finally {
    statsLoading.value = false;
  }
};

// 处理记忆归档
const handleArchive = async (memoryId: string, options: any) => {
  try {
    const response = await archiveToLongTerm(parseInt(memoryId), options);

    if (response) {
      ElMessage.success('记忆归档成功');
      await fetchMemoryStats(); // 刷新统计数据
    } else {
      ElMessage.error('记忆归档失败');
    }
  } catch (error) {
    console.error('记忆归档失败:', error);
    ElMessage.error('记忆归档失败');
  }
};

// 处理过期记忆清理
const handleCleanup = async (options: any) => {
  try {
    const response = await cleanupExpiredMemories(options);

    if (response && response.count !== undefined) {
      ElMessage.success(`成功清理了 ${response.count} 条过期记忆`);
      await fetchMemoryStats(); // 刷新统计数据
    } else {
      ElMessage.error('清理过期记忆失败');
    }
  } catch (error) {
    console.error('清理过期记忆失败:', error);
    ElMessage.error('清理过期记忆失败');
  }
};

// 组件挂载时获取统计数据
onMounted(() => {
  fetchMemoryStats();
});
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

/* AI记忆管理页面样式 - 对齐全局设计系统 */

.memory-management-page {
  .card-title h1 {
    margin-bottom: var(--spacing-md);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-description {
    margin-bottom: var(--spacing-lg);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .el-tabs {
    background-color: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: var(--border-width-base) solid var(--border-color);
    transition: all var(--transition-normal);

    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
  }

  /* Element Plus Tabs Theme */
  :deep(.el-tabs__header) {
    background-color: var(--bg-tertiary);
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 var(--spacing-lg);
  }

  :deep(.el-tabs__item) {
    color: var(--text-secondary);
    font-weight: 500;
    transition: all var(--transition-fast);

    &:hover {
      color: var(--primary-color);
    }

    &.is-active {
      color: var(--primary-color);
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: var(--primary-color);
  }

  :deep(.el-tabs__content) {
    padding: var(--spacing-lg);
    background-color: var(--bg-card);
  }

  /* Responsive design */
  @media (max-width: 76var(--spacing-sm)) {
    padding: var(--spacing-md);
    
    .card-title h1 {
      font-size: var(--text-xl);
      margin-bottom: var(--spacing-sm);
    }
    
    .page-description {
      font-size: var(--text-xs);
      margin-bottom: var(--spacing-md);
    }
    
    .el-tabs {
      margin-top: var(--spacing-md);
    }
    
    :deep(.el-tabs__content) {
      padding: var(--spacing-md);
    }
  }
}
</style> 