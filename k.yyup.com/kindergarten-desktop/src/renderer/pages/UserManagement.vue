<template>
  <div class="page-container">
    <div class="page-header">
      <h1>用户管理</h1>
      <p>系统用户管理功能开发中...</p>
    </div>
    <div class="page-content">
      <el-card>
        <template #header>
          <span>用户列表</span>
          <el-button type="primary">添加用户</el-button>
        </template>
        <el-empty description="功能开发中..." />
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 用户管理页面 - 开发中
</script>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #7f8c8d;
  margin: 0;
}
</style>