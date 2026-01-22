<template>
  <div class="assessment-reports">
    <el-card shadow="hover">
      <div class="reports-header">
        <h3>测评报告管理</h3>
        <el-button type="primary" @click="handleBatchDownload">
          <el-icon><Download /></el-icon>
          批量下载
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="reportsList"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="reportType" label="报告类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getReportTypeName(row.reportType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="生成时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="300">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewReport(row)">
              预览
            </el-button>
            <el-button type="success" link @click="downloadReport(row, 'pdf')">
              下载PDF
            </el-button>
            <el-button type="warning" link @click="shareReport(row)">
              分享家长
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-section">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="loadReports"
          @size-change="loadReports"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { getAssessmentReports } from '@/api/modules/assessment-analytics';

const loading = ref(false);
const reportsList = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const selectedReports = ref<any[]>([]);

const loadReports = async () => {
  loading.value = true;
  try {
    const response = await getAssessmentReports({ page: page.value, pageSize: pageSize.value });
    if (response.success) {
      reportsList.value = response.data.reports || [];
      total.value = response.data.total || 0;
    }
  } catch (error: any) {
    console.error('加载报告失败:', error);
    ElMessage.error('加载报告失败');
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selection: any[]) => {
  selectedReports.value = selection;
};

const viewReport = (report: any) => {
  ElMessage.info('功能开发中...');
};

const downloadReport = (report: any, format: string) => {
  ElMessage.info('功能开发中...');
};

const shareReport = (report: any) => {
  ElMessage.info('功能开发中...');
};

const handleBatchDownload = () => {
  if (selectedReports.value.length === 0) {
    ElMessage.warning('请先选择要下载的报告');
    return;
  }
  ElMessage.info('功能开发中...');
};

const getReportTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'assessment': '测评报告',
    'growth': '成长报告',
    'development': '发展报告',
  };
  return typeMap[type] || type;
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

onMounted(() => {
  loadReports();
});
</script>

<style scoped lang="scss">
.assessment-reports {
  padding: var(--spacing-lg);

  .reports-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
    }
  }

  .pagination-section {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
















