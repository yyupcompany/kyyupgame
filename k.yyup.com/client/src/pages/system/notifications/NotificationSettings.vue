<template>
  <div class="notification-settings">
    <el-card class="page-header">
      <h1>通知设置</h1>
      <p>正在开发中...</p>
    </el-card>
    
    <el-card class="content-card">
      <div class="development-placeholder">
        <UnifiedIcon name="default" />
        <h2>功能开发中</h2>
        <p>通知设置功能正在开发中，敬请期待。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Bell } from '@element-plus/icons-vue'

// 页面逻辑将在此处实现
</script>

<style scoped>
.notification-settings {
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