<template>
  <div class="parent-edit-page">
    <div class="page-header">
      <h1 class="page-title">编辑家长信息</h1>
      <p class="page-description">修改家长基本信息和联系方式</p>
    </div>

    <div class="content-section">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToParentList">
          <UnifiedIcon name="default" />
          家长管理
        </el-button>
        <el-button type="success" @click="navigateToParentChildren">
          <UnifiedIcon name="default" />
          孩子管理
        </el-button>
        <el-button type="info" @click="navigateToParentCommunication">
          <UnifiedIcon name="default" />
          沟通记录
        </el-button>
      </div>

      <div class="feature-grid">
        <div class="feature-item" @click="navigateToParentList">
          <UnifiedIcon name="default" />
          <h3>家长管理</h3>
          <p>查看和管理家长基本信息</p>
        </div>
        <div class="feature-item" @click="navigateToParentChildren">
          <UnifiedIcon name="default" />
          <h3>孩子管理</h3>
          <p>管理家长的孩子信息</p>
        </div>
        <div class="feature-item" @click="navigateToParentCommunication">
          <UnifiedIcon name="default" />
          <h3>沟通记录</h3>
          <p>家长沟通历史和记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, UserFilled, ChatDotRound } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToParentList = () => {
  router.push('/parent')
}

const navigateToParentChildren = () => {
  router.push('/parent/children')
}

const navigateToParentCommunication = () => {
  router.push('/parent/communication/smart-hub')
}
</script>

<style scoped lang="scss">
.parent-edit-page {
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