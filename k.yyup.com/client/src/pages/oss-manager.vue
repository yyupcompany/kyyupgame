<template>
  <div class="oss-manager">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">📁 OSS 文件管理器</span>
          <el-button type="primary" @click="loadStats">刷新统计</el-button>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalFiles }}</div>
            <div class="stat-label">总文件数</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-value">{{ formatSize(stats.totalSize) }}</div>
            <div class="stat-label">总大小</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-value">{{ Object.keys(stats.byType).length }}</div>
            <div class="stat-label">文件类型</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-value">{{ Object.keys(stats.byDirectory).length }}</div>
            <div class="stat-label">目录数</div>
          </div>
        </el-col>
      </el-row>

      <!-- 文件类型统计 -->
      <el-divider>文件类型统计</el-divider>
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <div class="type-stats">
            <div v-for="(count, type) in stats.byType" :key="type" class="type-item">
              <span class="type-name">{{ type }}</span>
              <el-progress :percentage="(count / stats.totalFiles) * 100" :color="getTypeColor(type)" />
              <span class="type-count">{{ count }}</span>
            </div>
          </div>
        </el-col>

        <!-- 目录统计 -->
        <el-col :xs="24" :md="12">
          <div class="dir-stats">
            <div v-for="(count, dir) in stats.byDirectory" :key="dir" class="dir-item">
              <span class="dir-name">{{ dir }}</span>
              <el-progress :percentage="(count / stats.totalFiles) * 100" color="#409EFF" />
              <span class="dir-count">{{ count }}</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 文件列表 -->
      <el-divider>文件列表</el-divider>
      <el-input
        v-model="searchPrefix"
        placeholder="输入目录前缀搜索..."
        clearable
        @input="loadFiles"
      />

      <el-table :data="files" stripe style="margin-top: 20px" v-loading="loading">
        <el-table-column prop="name" label="文件名" width="300" show-overflow-tooltip />
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastModified" label="修改时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.lastModified) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openFile(row.url)">预览</el-button>
            <el-button type="danger" size="small" @click="deleteFile(row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listOSSFiles, getOSSStats, deleteOSSFile } from '@/api/oss-manager';

const loading = ref(false);
const searchPrefix = ref('');
const files = ref([]);
const stats = ref({
  totalFiles: 0,
  totalSize: 0,
  byType: {},
  byDirectory: {}
});

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('zh-CN');
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    jpg: '#F56C6C',
    png: '#E6A23C',
    gif: '#409EFF',
    mp4: '#67C23A',
    pdf: '#909399'
  };
  return colors[type] || '#409EFF';
};

const loadFiles = async () => {
  loading.value = true;
  try {
    const result = await listOSSFiles(searchPrefix.value);
    files.value = result.data.files || [];
  } catch (error) {
    ElMessage.error('加载文件失败');
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  loading.value = true;
  try {
    const result = await getOSSStats();
    stats.value = result.data;
  } catch (error) {
    ElMessage.error('加载统计信息失败');
  } finally {
    loading.value = false;
  }
};

const openFile = (url: string) => {
  window.open(url, '_blank');
};

const deleteFile = async (key: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 ${key} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteOSSFile(key);
    ElMessage.success('文件删除成功');
    loadFiles();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('文件删除失败');
    }
  }
};

onMounted(() => {
  loadStats();
  loadFiles();
});
</script>

<style scoped lang="scss">
.oss-manager {
  padding: var(--spacing-lg);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: var(--text-lg);
      font-weight: bold;
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: var(--spacing-lg);
      border-radius: 8px;
      text-align: center;

      .stat-value {
        font-size: var(--text-3xl);
        font-weight: bold;
        margin-bottom: 10px;
      }

      .stat-label {
        font-size: var(--text-sm);
        opacity: 0.9;
      }
    }
  }

  .type-stats,
  .dir-stats {
    .type-item,
    .dir-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      gap: 10px;

      .type-name,
      .dir-name {
        min-width: 60px;
        font-weight: 500;
      }

      :deep(.el-progress) {
        flex: 1;
      }

      .type-count,
      .dir-count {
        min-width: 40px;
        text-align: right;
        font-weight: 500;
      }
    }
  }
}
</style>

