<template>
  <div class="activity-reminder-card">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动提醒</span>
        </div>
      </template>
      <el-empty description="活动提醒功能正在开发中..." />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 占位符组件
</script>

<style scoped>
.activity-reminder-card {
  padding: var(--spacing-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
