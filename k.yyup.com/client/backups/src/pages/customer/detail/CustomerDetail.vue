<template>
  <div class="customer-detail">
    <el-card class="page-header">
      <h1>客户详情</h1>
      <p>查看和管理客户详细信息</p>
    </el-card>

    <el-card class="content-card">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToCustomerList">
          <el-icon><User /></el-icon>
          客户管理
        </el-button>
        <el-button type="success" @click="navigateToCustomerStatistics">
          <el-icon><DataAnalysis /></el-icon>
          客户统计
        </el-button>
        <el-button type="info" @click="navigateToCustomerSearch">
          <el-icon><Search /></el-icon>
          客户搜索
        </el-button>
      </div>

      <div class="feature-grid">
        <div class="feature-item" @click="navigateToCustomerList">
          <el-icon size="32" color="var(--primary-color)"><User /></el-icon>
          <h3>客户管理</h3>
          <p>查看和管理所有客户信息</p>
        </div>
        <div class="feature-item" @click="navigateToCustomerStatistics">
          <el-icon size="32" color="var(--success-color)"><DataAnalysis /></el-icon>
          <h3>客户统计</h3>
          <p>客户数据统计和分析</p>
        </div>
        <div class="feature-item" @click="navigateToCustomerSearch">
          <el-icon size="32" color="var(--info-color)"><Search /></el-icon>
          <h3>客户搜索</h3>
          <p>快速搜索和筛选客户</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User, DataAnalysis, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToCustomerList = () => {
  router.push('/customer')
}

const navigateToCustomerStatistics = () => {
  router.push('/customer/statistics')
}

const navigateToCustomerSearch = () => {
  router.push('/customer/search')
}
</script>

<style scoped>
.customer-detail {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--text-2xl);
}

.content-card {
  min-height: 400px;
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