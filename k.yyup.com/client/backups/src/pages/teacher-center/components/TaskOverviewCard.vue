<template>
  <div class="task-overview-card">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务概览</span>
        </div>
      </template>
      <el-empty description="任务概览功能正在开发中..." />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 占位符组件
</script>

<style scoped>
.task-overview-card {
  padding: var(--spacing-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
