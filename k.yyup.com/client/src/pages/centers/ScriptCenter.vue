<template>
  <div class="script-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>话术管理中心</h1>
      <p class="page-description">统一的话术管理平台，包含招生话术、电话话术、接待话术等功能</p>
    </div>

    <!-- 开发中提示 -->
    <el-empty description="话术管理功能开发中">
      <template #image>
        <el-icon :size="100" color="#909399">
          <Edit />
        </el-icon>
      </template>
      <el-button type="primary" @click="goToDocumentTemplates">查看文档模板</el-button>
    </el-empty>

    <!-- 功能说明 -->
    <el-card class="feature-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>功能说明</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="招生话术">包含招生咨询常用话术模板</el-descriptions-item>
        <el-descriptions-item label="电话话术">电话沟通话术和应对技巧</el-descriptions-item>
        <el-descriptions-item label="接待话术">到访接待流程话术</el-descriptions-item>
        <el-descriptions-item label="跟进话术">客户跟进话术模板</el-descriptions-item>
        <el-descriptions-item label="咨询话术">专业咨询对话模板</el-descriptions-item>
        <el-descriptions-item label="异议处理">常见异议应对话术</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- API说明 -->
    <el-alert
      title="API端点"
      type="info"
      :closable="false"
      class="api-info"
    >
      <div class="api-endpoints">
        <p><strong>GET</strong> /api/scripts - 获取话术列表</p>
        <p><strong>POST</strong> /api/scripts - 创建话术</p>
        <p><strong>PUT</strong> /api/scripts/:id - 更新话术</p>
        <p><strong>DELETE</strong> /api/scripts/:id - 删除话术</p>
        <p><strong>GET</strong> /api/scripts/stats - 话术统计</p>
      </div>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'

const router = useRouter()

const goToDocumentTemplates = () => {
  router.push('/centers/document-template')
}
</script>

<style scoped lang="scss">
.script-center {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .page-description {
    font-size: var(--text-base);
    color: var(--text-secondary);
  }
}

.feature-card {
  margin-top: var(--spacing-lg);

  .card-header {
    font-weight: 600;
    color: var(--text-primary);
  }
}

.api-info {
  margin-top: var(--spacing-lg);

  .api-endpoints {
    p {
      margin: var(--spacing-xs) 0;
      font-family: monospace;
      font-size: var(--text-sm);

      strong {
        color: var(--primary-color);
        margin-right: var(--spacing-2xs);
      }
    }
  }
}

:deep(.el-empty) {
  padding: var(--spacing-3xl) 0;
}
</style>
