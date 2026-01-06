<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被移动。
      </p>
      <div class="action-buttons">
        <el-button type="primary" @click="goHome">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  padding: var(--text-2xl);
}

.not-found-content {
  text-align: center;
  background: white;
  padding: var(--spacing-15xl) 40px;
  border-radius: var(--text-2xl);
  box-shadow: 0 var(--text-2xl) 40px var(--shadow-light);
  max-width: 500px;
  width: 100%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: var(--text-2xl);
  text-shadow: 2px 2px var(--spacing-xs) var(--shadow-light);
}

.error-title {
  font-size: var(--spacing-3xl);
  color: var(--text-primary);
  margin-bottom: var(--text-lg);
  font-weight: 600;
}

.error-description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-10xl);
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: var(--text-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  padding: var(--text-sm) var(--text-3xl);
  font-size: var(--text-lg);
}

@media (max-width: var(--breakpoint-md)) {
  .not-found-content {
    padding: var(--spacing-10xl) var(--text-2xl);
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: var(--text-3xl);
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 200px;
  }
}
</style>
