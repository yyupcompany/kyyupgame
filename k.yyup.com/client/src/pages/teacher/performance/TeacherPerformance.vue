<template>
  <div class="teacher-performance-page">
    <div class="page-header">
      <h1 class="page-title">教师绩效</h1>
      <p class="page-description">教师工作绩效评估和管理</p>
    </div>

    <div class="content-section">
      <el-empty description="教师绩效功能正在开发中" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 教师绩效页面 - 占位符
</script>

<style scoped lang="scss">
.teacher-performance-page {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--text-3xl);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.page-description {
  color: var(--text-secondary);
  margin: 0;
}

.content-section {
  background: var(--bg-card);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-10xl);
  text-align: center;
}
</style>