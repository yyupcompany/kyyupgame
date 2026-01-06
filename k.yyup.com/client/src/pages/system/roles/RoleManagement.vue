<template>
  <div class="role-management">
    <el-card class="page-header">
      <h1>角色管理</h1>
      <p>系统角色和权限管理</p>
    </el-card>

    <el-card class="content-card">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToUserManagement">
          <UnifiedIcon name="default" />
          用户管理
        </el-button>
        <el-button type="success" @click="navigateToPermissions">
          <UnifiedIcon name="default" />
          权限管理
        </el-button>
        <el-button type="info" @click="navigateToSystemSettings">
          <UnifiedIcon name="default" />
          系统设置
        </el-button>
      </div>

      <div class="feature-grid">
        <div class="feature-item" @click="navigateToUserManagement">
          <UnifiedIcon name="default" />
          <h3>用户管理</h3>
          <p>管理系统用户账户</p>
        </div>
        <div class="feature-item" @click="navigateToPermissions">
          <UnifiedIcon name="default" />
          <h3>权限管理</h3>
          <p>配置用户权限和访问控制</p>
        </div>
        <div class="feature-item" @click="navigateToSystemSettings">
          <UnifiedIcon name="default" />
          <h3>系统设置</h3>
          <p>系统参数和功能配置</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User, Lock, Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToUserManagement = () => {
  router.push('/system/user')
}

const navigateToPermissions = () => {
  router.push('/system/permissions')
}

const navigateToSystemSettings = () => {
  router.push('/system/settings')
}
</script>

<style scoped>
.role-management {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--text-2xl);
}

.content-card {
  min-min-height: 60px; height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.development-placeholder {
  text-align: center;
  color: var(--info-color);
}

.development-placeholder h2 {
  margin: var(--spacing-lg) 0 10px 0;
  font-size: var(--text-2xl);
}

.development-placeholder p {
  font-size: var(--text-base);
  margin: 0;
}
</style>