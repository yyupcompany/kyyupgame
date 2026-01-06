<template>
  <div class="auxiliary-functionality-container error-page">
    <div class="error-card">
      <div class="error-number">404</div>
      <h2 class="error-title">页面不存在</h2>
      <p class="error-description">
        您访问的页面路径不存在或已被移除，请检查URL是否正确。
        <br>
        <small class="error-note">💡 提示：如果您认为应该可以访问此页面，这可能是路由配置问题，而不是权限问题。</small>
      </p>
      
      <div class="error-actions">
        <button class="error-btn primary" @click="goHome">
          <UnifiedIcon name="default" />
          返回首页
        </button>
        <button class="error-btn secondary" @click="goBack">
          <UnifiedIcon name="ArrowLeft" />
          返回上页
        </button>
      </div>
      
      <div class="suggestion-links">
        <h3>您可能想要访问：</h3>
        <div class="debug-info">
          <p><strong>调试信息：</strong></p>
          <p>请求路径：<code>{{ $route.path }}</code></p>
          <p>如果这是一个应该存在的页面，请检查路由配置文件。</p>
        </div>
        <div class="links-grid">
          <a href="#" class="link-item" @click.prevent="goToDashboard">
            <div class="link-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="link-text">控制台</div>
          </a>
          <a href="#" class="link-item" @click.prevent="goToStudents">
            <div class="link-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="link-text">学生管理</div>
          </a>
          <a href="#" class="link-item" @click.prevent="goToClasses">
            <div class="link-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="link-text">班级管理</div>
          </a>
          <a href="#" class="link-item" @click.prevent="goToSystem">
            <div class="link-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="link-text">系统设置</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { 
  House, ArrowLeft, Monitor, User, School, Setting 
} from '@element-plus/icons-vue'

// 3. 第三方库导入

// 4. 工具和API导入

// 路由
const router = useRouter()

// 导航方法
const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToStudents = () => {
  router.push('/student')
}

const goToClasses = () => {
  router.push('/class')
}

const goToSystem = () => {
  router.push('/system')
}
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use './auxiliary-functionality-ux-styles.scss' as *;

/* 404页面特有样式 */
.error-note {
  color: #6c757d;
  font-size: 0.9em;
  margin-top: var(--spacing-sm);
  display: block;
}

.debug-info {
  background: var(--bg-gray-light);
  border: var(--border-width-base) solid #dee2e6;
  border-radius: var(--spacing-xs);
  padding: var(--text-xs);
  margin-bottom: var(--text-2xl);
  font-size: 0.9em;
  
  p {
    margin: var(--spacing-xs) 0;
    color: #495057;
  }
  
  code {
    background: #e9ecef;
    padding: var(--spacing-sm) var(--spacing-xs);
    border-radius: var(--radius-xs);
    font-family: 'Consolas', monospace;
    color: #d73a49;
  }
}

/* 辅助功能模块UX样式 - 所有样式已在 auxiliary-functionality-ux-styles.scss 中统一定义 */
</style>
