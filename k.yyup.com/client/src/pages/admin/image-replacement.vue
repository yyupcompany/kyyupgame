<template>
  <div class="image-replacement-page">
    <div class="page-header">
      <h1>AI自动配图</h1>
      <p>使用豆包文生图模型自动生成和替换项目中的展位图片</p>
    </div>
    
    <div class="content-section">
      <div class="feature-placeholder">
        <UnifiedIcon name="default" />
        <h3>AI自动配图功能</h3>
        <p>该功能正在开发中，敬请期待</p>
        <el-button type="primary" disabled>
          <UnifiedIcon name="default" />
          生成图片
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Picture, MagicStick } from '@element-plus/icons-vue'
</script>

<style scoped>
.image-replacement-page {
  padding: var(--text-2xl);
}

.page-header {
  margin-bottom: var(--spacing-8xl);
}

.page-header h1 {
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.page-header p {
  color: var(--text-regular);
  margin: 0;
}

.content-section {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--spacing-10xl);
  text-align: center;
}

.feature-placeholder h3 {
  margin: var(--text-2xl) 0 10px 0;
  color: var(--text-primary);
}

.feature-placeholder p {
  color: var(--info-color);
  margin-bottom: var(--text-2xl);
}
</style>