<template>
  <div class="application-interview">
    <el-card class="page-header">
      <h1>申请面试</h1>
      <p>管理和安排学生面试申请</p>
    </el-card>

    <el-card class="content-card">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToEnrollment">
          <UnifiedIcon name="default" />
          查看招生申请
        </el-button>
        <el-button type="success" @click="navigateToSchedule">
          <UnifiedIcon name="default" />
          面试日程安排
        </el-button>
        <el-button type="info" @click="navigateToStudents">
          <UnifiedIcon name="default" />
          学生管理
        </el-button>
      </div>

      <div class="feature-grid">
        <div class="feature-item" @click="navigateToEnrollment">
          <UnifiedIcon name="default" />
          <h3>招生申请</h3>
          <p>查看和管理所有招生申请</p>
        </div>
        <div class="feature-item" @click="navigateToSchedule">
          <UnifiedIcon name="default" />
          <h3>面试安排</h3>
          <p>安排和管理面试日程</p>
        </div>
        <div class="feature-item" @click="navigateToStudents">
          <UnifiedIcon name="default" />
          <h3>学生信息</h3>
          <p>管理学生基本信息</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User, Calendar, UserFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToEnrollment = () => {
  router.push('/enrollment')
}

const navigateToSchedule = () => {
  router.push('/dashboard/schedule')
}

const navigateToStudents = () => {
  router.push('/student')
}
</script>

<style scoped>
.application-interview {
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

.quick-actions {
  margin-bottom: var(--text-3xl);
  display: flex;
  gap: var(--text-sm);
  flex-wrap: wrap;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-2xl);
  margin-top: var(--text-3xl);
}

.feature-item {
  padding: var(--text-3xl);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
  transform: translateY(var(--transform-hover-lift));
}

.feature-item h3 {
  margin: var(--text-sm) 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
  font-weight: 600;
}

.feature-item p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
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