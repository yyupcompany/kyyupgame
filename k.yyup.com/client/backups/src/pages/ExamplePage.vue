<template>
  <!-- 🎯 简化测试页面，确保内容可见 -->
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">🎉 新Layout测试成功！</h1>
      <p class="page-description">布局结构正确：侧边栏 + 顶部栏 + 内容区</p>
    </div>
    
    <!-- 测试各种内容 -->
    <div class="test-section">
      <h2>🎯 测试内容区域</h2>
      <p>如果您能看到这段文字，说明新Layout工作正常！</p>
      
      <div class="test-boxes">
        <div class="test-box red">红色框</div>
        <div class="test-box green">绿色框</div>
        <div class="test-box blue">蓝色框</div>
      </div>
    </div>
    
    <!-- Element Plus组件测试 -->
    <div class="content-section">
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>🧪 Element Plus组件测试</span>
            <el-button type="primary" size="small">测试按钮</el-button>
          </div>
        </template>
          
          <div class="card-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="demo-item">
                  <h3>搜索框演示</h3>
                  <el-input 
                    v-model="searchText" 
                    placeholder="请输入搜索内容"
                    class="demo-input"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-col>
              
              <el-col :span="12">
                <div class="demo-item">
                  <h3>表单演示</h3>
                  <el-form :model="formData" label-width="80px">
                    <el-form-item label="姓名">
                      <el-input v-model="formData.name" />
                    </el-form-item>
                    <el-form-item label="状态">
                      <el-select v-model="formData.status" placeholder="请选择">
                        <el-option label="启用" value="active" />
                        <el-option label="禁用" value="inactive" />
                      </el-select>
                    </el-form-item>
                  </el-form>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
        
        <!-- 表格演示 -->
        <el-card class="demo-card" shadow="hover">
          <template #header>
            <span>数据表格</span>
          </template>
          
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                  {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default>
                <el-button type="primary" size="small">编辑</el-button>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
// 🎯 移除Layout导入，页面内容直接显示在NewSimpleLayout的router-view中

// 响应式数据
const searchText = ref('')
const formData = ref({
  name: '',
  status: ''
})

const tableData = ref([
  {
    id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  status: 'active'
  },
  {
    id: 2,
  name: '李四',
  email: 'lisi@example.com',
  status: 'inactive'
  },
  {
    id: 3,
  name: '王五',
  email: 'wangwu@example.com',
  status: 'active'
  }
])
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.page-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient-blue); /* 硬编码修复：使用蓝色渐变 */;
  opacity: 0;
    transition: opacity 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  }
  
  &:hover::before {
    opacity: 0.03;
  }
  
  .page-title {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  margin: 0 0 var(--app-gap-xs) 0; /* 硬编码修复：使用统一间距变量 */;
  background: var(--gradient-purple); /* 硬编码修复：使用紫色渐变 */;
  -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    z-index: 1;
  }
  
  .page-description {
    font-size: var(--text-sm);
    color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */;
    margin: 0;
    position: relative;
    z-index: 1;
  }
}

.test-section {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  }
  
  h2 {
    font-size: var(--spacing-lg);
    color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  margin: 0 0 var(--app-gap) 0; /* 硬编码修复：使用统一间距变量 */;
    background: var(--gradient-green); /* 硬编码修复：使用绿色渐变 */;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    font-size: var(--text-base);
    color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */;
    margin: 0 0 var(--app-gap) 0; /* 硬编码修复：使用统一间距变量 */;
  }
}
}

.test-boxes {
  display: flex;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  flex-wrap: wrap;
}

.test-box {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */;
  color: var(--bg-card); /* 白色区域修复：使用主题卡片背景色作为文字色 */;
  font-weight: 600;
  text-align: center;
  min-width: 120px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
  }
  
  &.red {
    background-color: var(--danger-color); /* 硬编码修复：使用主题危险色 */
  }
  
  &.green {
    background-color: var(--success-color); /* 硬编码修复：使用主题成功色 */
  }
  
  &.blue {
    background-color: var(--primary-color); /* 硬编码修复：使用主题主色 */
  }
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.demo-card {
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  }
  
  .card-content {
    .demo-item {
      margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h3 {
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  margin: 0 0 var(--app-gap-sm) 0; /* 硬编码修复：使用统一间距变量 */;
        background: var(--gradient-orange); /* 硬编码修复：使用橙色渐变 */;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    
      .demo-input {
        width: 100%;
      }
    }
  }
}

/* 白色区域修复：Element Plus组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-card__header) {
  background: var(--bg-tertiary) !important;
  border-bottom-color: var(--border-color) !important;
  color: var(--text-primary) !important;
  padding: var(--app-gap) !important;
}

:deep(.el-card__body) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  padding: var(--app-gap) !important;
}

:deep(.el-button.el-button--primary) {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: var(--bg-card) !important;
}

:deep(.el-button.el-button--primary:hover) {
  background: var(--primary-light) !important;
  border-color: var(--primary-light) !important;
}

:deep(.el-button.el-button--danger) {
  background: var(--danger-color) !important;
  border-color: var(--danger-color) !important;
  color: var(--bg-card) !important;
}

:deep(.el-button.el-button--danger:hover) {
  background: var(--danger-light) !important;
  border-color: var(--danger-light) !important;
}

:deep(.el-button.el-button--small) {
  height: var(--button-height-sm);
  padding: var(--app-gap-xs) var(--app-gap-sm) !important;
  font-size: var(--text-xs);
}

:deep(.el-input) {
  background: var(--bg-tertiary) !important;
}

:deep(.el-input__wrapper) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 var(--border-width-base) var(--primary-color) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-muted) !important;
}

:deep(.el-select) {
  background: var(--bg-tertiary) !important;
}

:deep(.el-select .el-input__wrapper) {
  background: var(--bg-tertiary) !important;
}

:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
}

:deep(.el-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table th) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border-bottom-color: var(--border-color) !important;
}

:deep(.el-table td) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-bottom-color: var(--border-color) !important;
}

:deep(.el-table tr:hover td) {
  background: var(--bg-hover) !important;
}

:deep(.el-table__border-left-patch) {
  background: var(--bg-tertiary) !important;
}

:deep(.el-table__border-bottom-patch) {
  background: var(--bg-tertiary) !important;
}

:deep(.el-tag) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-tag.el-tag--success) {
  background: var(--success-bg) !important;
  border-color: var(--success-color) !important;
  color: var(--success-color) !important;
}

:deep(.el-tag.el-tag--danger) {
  background: var(--danger-bg) !important;
  border-color: var(--danger-color) !important;
  color: var(--danger-color) !important;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .example-page {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-header {
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */;
  padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-title {
    font-size: var(--spacing-lg);
  }
  
  .page-description {
    font-size: var(--text-sm);
  }
  
  .test-section {
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */;
  padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .test-section h2 {
    font-size: var(--text-lg);
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .test-section p {
    font-size: var(--text-sm);
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .test-boxes {
    gap: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .test-box {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */;
  min-width: 100px;
    font-size: var(--text-sm);
  }
  
  .content-section {
    gap: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .demo-card .card-content .demo-item {
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .demo-card .card-content .demo-item h3 {
    font-size: var(--text-sm);
    margin-bottom: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  :deep(.el-card__header) {
    padding: var(--app-gap-sm) !important;
  }
  
  :deep(.el-card__body) {
    padding: var(--app-gap-sm) !important;
  }
  
  :deep(.el-col) {
    margin-bottom: var(--app-gap-sm);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .example-page {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .page-header {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .page-title {
    font-size: var(--text-lg);
  }
  
  .page-description {
    font-size: var(--text-xs);
  }
  
  .test-section {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .test-section h2 {
    font-size: var(--text-base);
  }
  
  .test-section p {
    font-size: var(--text-sm);
  }
  
  .test-boxes {
    gap: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */;
  flex-direction: column;
  }
  
  .test-box {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */;
  min-width: auto;
    width: 100%;
    font-size: var(--text-sm);
  }
  
  .content-section {
    gap: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .demo-card .card-content .demo-item h3 {
    font-size: var(--text-sm);
  }
  
  :deep(.el-card__header) {
    padding: var(--app-gap-xs) !important;
    flex-direction: column;
    gap: var(--app-gap-xs);
  }
  
  :deep(.el-card__body) {
    padding: var(--app-gap-xs) !important;
  }
  
  :deep(.el-button.el-button--small) {
    height: var(--text-3xl);
    padding: var(--app-gap-xs) var(--app-gap-xs) !important;
    font-size: var(--text-xs);
  }
  
  :deep(.el-table) {
    font-size: var(--text-xs);
  }
  
  :deep(.el-form-item__label) {
    font-size: var(--text-xs);
  }
}
</style> 