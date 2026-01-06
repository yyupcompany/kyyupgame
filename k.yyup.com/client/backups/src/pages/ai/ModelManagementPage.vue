<template>
  <div class="page-container model-management-page">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <h1>AI模型管理系统</h1>
        </div>
      </div>
      <div class="card-body">
        <p class="page-description">
          管理AI模型配置、查看使用统计和计费信息，支持添加、编辑和删除模型。
        </p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-body">
        <ModelManagement />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ModelManagement from '../../components/ai/model/ModelManagement.vue';
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

/* AI模型管理页面样式 - 对齐全局设计系统 */

.model-management-page {
  .card-title h1 {
    margin-bottom: var(--spacing-md);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-description {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: 1.6;
    margin: 0;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .model-management-page {
    .card-title h1 {
      font-size: var(--text-xl);
    }
    
    .page-description {
      font-size: var(--text-xs);
    }
  }
}
</style> 