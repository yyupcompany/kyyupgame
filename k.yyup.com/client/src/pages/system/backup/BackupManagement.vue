<template>
  <div class="backup-management">
    <el-card class="page-header">
      <h1>备份管理</h1>
      <p>系统数据备份和恢复管理</p>
    </el-card>

    <el-card class="content-card">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToSystemLogs">
          <UnifiedIcon name="default" />
          系统日志
        </el-button>
        <el-button type="success" @click="navigateToSystemSettings">
          <UnifiedIcon name="default" />
          系统设置
        </el-button>
        <el-button type="warning" @click="navigateToUserManagement">
          <UnifiedIcon name="default" />
          用户管理
        </el-button>
      </div>

      <div class="feature-grid">
        <div class="feature-item" @click="navigateToSystemLogs">
          <UnifiedIcon name="default" />
          <h3>系统日志</h3>
          <p>查看系统运行日志和操作记录</p>
        </div>
        <div class="feature-item" @click="navigateToSystemSettings">
          <UnifiedIcon name="default" />
          <h3>系统设置</h3>
          <p>配置系统参数和功能设置</p>
        </div>
        <div class="feature-item" @click="navigateToUserManagement">
          <UnifiedIcon name="default" />
          <h3>用户管理</h3>
          <p>管理系统用户和权限</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Document, Setting, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToSystemLogs = () => {
  router.push('/system/logs')
}

const navigateToSystemSettings = () => {
  router.push('/system/settings')
}

const navigateToUserManagement = () => {
  router.push('/system/user')
}
</script>

<style scoped>
.backup-management {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.content-card {
  min-min-height: 60px; height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.development-placeholder {
  text-align: center;
  color: var(--text-secondary);
}

.development-placeholder h2 {
  margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
  font-size: var(--text-2xl);
}

.development-placeholder p {
  font-size: var(--text-base);
  margin: 0;
}
</style>