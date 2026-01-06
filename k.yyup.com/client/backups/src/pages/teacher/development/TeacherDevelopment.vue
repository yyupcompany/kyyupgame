<template>
  <div class="teacher-development-page">
    <div class="page-header">
      <h1 class="page-title">教师发展</h1>
      <p class="page-description">教师职业发展和培训管理</p>
    </div>

    <div class="content-section">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToTeacherList">
          <el-icon><User /></el-icon>
          教师管理
        </el-button>
        <el-button type="success" @click="navigateToTeacherPerformance">
          <el-icon><TrendCharts /></el-icon>
          绩效管理
        </el-button>
        <el-button type="info" @click="navigateToTeacherEvaluation">
          <el-icon><Document /></el-icon>
          教师评估
        </el-button>
      </div>

      <div class="feature-grid">
        <div class="feature-item" @click="navigateToTeacherList">
          <el-icon size="32" color="var(--primary-color)"><User /></el-icon>
          <h3>教师管理</h3>
          <p>查看和管理教师基本信息</p>
        </div>
        <div class="feature-item" @click="navigateToTeacherPerformance">
          <el-icon size="32" color="var(--success-color)"><TrendCharts /></el-icon>
          <h3>绩效管理</h3>
          <p>教师绩效评估和统计</p>
        </div>
        <div class="feature-item" @click="navigateToTeacherEvaluation">
          <el-icon size="32" color="var(--info-color)"><Document /></el-icon>
          <h3>教师评估</h3>
          <p>教师能力评估和发展规划</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, TrendCharts, Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToTeacherList = () => {
  router.push('/teacher')
}

const navigateToTeacherPerformance = () => {
  router.push('/teacher/performance')
}

const navigateToTeacherEvaluation = () => {
  router.push('/teacher/evaluation')
}
</script>

<style scoped lang="scss">
.teacher-development-page {
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
  padding: var(--text-3xl);
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
  transform: translateY(-2px);
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
</style>