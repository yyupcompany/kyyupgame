<template>
  <div class="test-page">
    <h2>移动端文档编辑器测试页面</h2>

    <div class="test-info">
      <h3>文件路径</h3>
      <p>主组件: /client/src/pages/mobile/centers/document-editor/index.vue</p>
      <p>文档: /client/src/pages/mobile/centers/document-editor/README.md</p>
      <p>测试: /client/src/pages/mobile/centers/document-editor/test.vue</p>

      <h3>功能特性</h3>
      <ul>
        <li>✅ 使用 MobileMainLayout 作为布局组件</li>
        <li>✅ 使用 Vant 4 组件库实现移动端UI</li>
        <li>✅ 严格按照PC端1:1复制原则</li>
        <li>✅ 支持Markdown文档编辑</li>
        <li>✅ 支持变量填充面板</li>
        <li>✅ 支持快捷操作工具</li>
        <li>✅ 支持文档预览功能</li>
        <li>✅ 集成自动保存机制</li>
        <li>✅ 响应式布局设计</li>
        <li>✅ 触摸优化交互</li>
        <li>✅ 暗黑模式支持</li>
      </ul>

      <h3>PC端 → 移动端组件映射</h3>
      <table>
        <thead>
          <tr>
            <th>PC端组件</th>
            <th>移动端组件</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>el-page-header</td><td>van-nav-bar</td></tr>
          <tr><td>el-progress</td><td>van-progress</td></tr>
          <tr><td>el-button</td><td>van-button</td></tr>
          <tr><td>el-card</td><td>van-cell-group</td></tr>
          <tr><td>el-form</td><td>van-form</td></tr>
          <tr><td>el-input</td><td>van-field</td></tr>
          <tr><td>el-dialog</td><td>van-popup</td></tr>
          <tr><td>el-collapse</td><td>van-collapse</td></tr>
          <tr><td>el-tag</td><td>van-tag</td></tr>
        </tbody>
      </table>

      <h3>路由配置</h3>
      <p>访问路径: /mobile/centers/document-editor/:templateId</p>

      <h3>API集成</h3>
      <ul>
        <li>getTemplateById - 获取文档模板</li>
        <li>自动填充API (模拟)</li>
        <li>保存草稿API (模拟)</li>
        <li>提交文档API (模拟)</li>
      </ul>
    </div>

    <div class="test-actions">
      <van-button type="primary" block @click="goToEditor">
        前往文档编辑器
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const goToEditor = () => {
  // 使用模拟的模板ID进行测试
  showToast('正在前往文档编辑器...')
  // TODO: 根据实际需求配置路由参数
  // router.push('/mobile/centers/document-editor/1')
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.test-page {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;

  h2 {
    text-align: center;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .test-info {
    background: var(--card-bg);
    padding: var(--spacing-lg);
    border-radius: 8px;
    margin-bottom: 20px;

    h3 {
      color: var(--text-primary);
      margin: var(--spacing-lg) 0 10px 0;

      &:first-child {
        margin-top: 0;
      }
    }

    p {
      color: var(--text-primary);
      line-height: 1.6;
      margin: 5px 0;
    }

    ul {
      color: var(--text-primary);
      line-height: 1.8;

      li {
        margin: 5px 0;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;

      th, td {
        border: 1px solid #ebedf0;
        padding: var(--spacing-sm) 12px;
        text-align: left;
      }

      th {
        background: var(--app-bg-color);
        font-weight: 600;
      }

      td {
        font-family: monospace;
        color: var(--text-primary);
      }
    }
  }

  .test-actions {
    padding: var(--spacing-lg) 0;
  }
}
</style>