<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">绩效规则配置</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleCreateRule" v-if="!showForm">
          <el-icon><Plus /></el-icon>
          新增规则
        </el-button>
        <el-button v-if="showForm" @click="showForm = false">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>
    </div>
    
    <!-- 规则列表 -->
    <performance-rules-list
      v-if="!showForm"
      @create="handleCreateRule"
      @edit="handleEditRule"
    />
    
    <!-- 规则表单 -->
    <el-card v-if="showForm" class="form-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑绩效规则' : '新增绩效规则' }}</span>
        </div>
      </template>
      
      <performance-rule-form
        :rule="currentRule"
        :is-edit="isEdit"
        @success="handleFormSuccess"
        @cancel="showForm = false"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref } from 'vue'

// 2. Element Plus 导入
import { Plus, ArrowLeft } from '@element-plus/icons-vue'

// 3. 公共工具函数导入
// 无需导入公共工具函数

// 4. 页面内部类型定义和组件导入
import PerformanceRulesList from '../../components/performance/PerformanceRulesList.vue'
import PerformanceRuleForm from '../../components/performance/PerformanceRuleForm.vue'
import type { PerformanceRule } from '../../api/modules/principal'

// 响应式状态
const showForm = ref(false)
const isEdit = ref(false)
const currentRule = ref<PerformanceRule | undefined>(undefined)

// 处理创建规则
const handleCreateRule = () => {
  isEdit.value = false
  currentRule.value = undefined
  showForm.value = true
}

// 处理编辑规则
const handleEditRule = (rule: PerformanceRule) => {
  isEdit.value = true
  currentRule.value = rule
  showForm.value = true
}

// 处理表单提交成功
const handleFormSuccess = () => {
  showForm.value = false
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

/* 使用全局CSS变量，确保主题切换兼容性 */
.page-container {
  padding: var(--app-padding);
  background: var(--el-bg-color-page);
  min-height: calc(100vh - var(--header-height, 60px));
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-margin);
  
  .page-title {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .page-actions {
    display: flex;
    gap: var(--app-gap-sm);
  }
}

.form-card {
  margin-bottom: var(--app-margin);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap);
    
    .page-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .form-card {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
}
</style> 