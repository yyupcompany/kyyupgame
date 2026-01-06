<template>
  <div class="teacher-evaluation-page">
    <div class="page-header">
      <h1 class="page-title">教师评估</h1>
      <p class="page-description">教师工作表现评估和考核管理</p>
    </div>

    <div class="content-section">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToTeacherList">
          <el-icon><User /></el-icon>
          教师管理
        </el-button>
        <el-button type="success" @click="navigateToTeacherStatistics">
          <el-icon><DataAnalysis /></el-icon>
          教师统计
        </el-button>
        <el-button type="info" @click="navigateToTeacherPerformance">
          <el-icon><TrendCharts /></el-icon>
          绩效管理
        </el-button>
      </div>

      <div class="feature-grid">
        <div class="feature-item" @click="navigateToTeacherList">
          <el-icon size="32" color="var(--primary-color)"><User /></el-icon>
          <h3>教师管理</h3>
          <p>查看和管理教师基本信息</p>
        </div>
        <div class="feature-item" @click="navigateToTeacherStatistics">
          <el-icon size="32" color="var(--success-color)"><DataAnalysis /></el-icon>
          <h3>教师统计</h3>
          <p>教师数据统计和分析</p>
        </div>
        <div class="feature-item" @click="navigateToTeacherPerformance">
          <el-icon size="32" color="var(--info-color)"><TrendCharts /></el-icon>
          <h3>绩效管理</h3>
          <p>教师绩效评估和管理</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, DataAnalysis, TrendCharts } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToTeacherList = () => {
  router.push('/teacher')
}

const navigateToTeacherStatistics = () => {
  router.push('/teacher/statistics')
}

const navigateToTeacherPerformance = () => {
  router.push('/teacher/performance')
}
</script>

<style scoped lang="scss">
.teacher-evaluation-page {
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