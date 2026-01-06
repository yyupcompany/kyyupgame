<template>
  <div class="application-review">
    <el-card class="page-header">
      <h1>申请审核</h1>
      <p>审核和管理招生申请</p>
    </el-card>

    <el-card class="content-card">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToEnrollment">
          <UnifiedIcon name="Check" />
          招生申请管理
        </el-button>
        <el-button type="success" @click="navigateToStudents">
          <UnifiedIcon name="default" />
          学生信息管理
        </el-button>
        <el-button type="warning" @click="navigateToTasks">
          <UnifiedIcon name="default" />
          待办任务
        </el-button>
      </div>

      <div class="feature-grid">
        <div class="feature-item" @click="navigateToEnrollment">
          <UnifiedIcon name="Check" />
          <h3>招生申请</h3>
          <p>查看和审核所有招生申请</p>
        </div>
        <div class="feature-item" @click="navigateToStudents">
          <UnifiedIcon name="default" />
          <h3>学生管理</h3>
          <p>管理已录取学生信息</p>
        </div>
        <div class="feature-item" @click="navigateToTasks">
          <UnifiedIcon name="default" />
          <h3>任务中心</h3>
          <p>查看待处理的审核任务</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { DocumentChecked, UserFilled, List } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToEnrollment = () => {
  router.push('/enrollment')
}

const navigateToStudents = () => {
  router.push('/student')
}

const navigateToTasks = () => {
  router.push('/centers/task')
}
</script>

<style scoped>
.application-review {
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