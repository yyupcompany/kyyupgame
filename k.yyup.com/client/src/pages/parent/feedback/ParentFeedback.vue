<template>
  <div class="parent-feedback-page">
    <div class="page-header">
      <h1 class="page-title">家长反馈</h1>
      <p class="page-description">收集和管理家长反馈意见</p>
    </div>

    <div class="content-section">
      <div class="quick-actions">
        <el-button type="primary" @click="navigateToParentList">
          <UnifiedIcon name="default" />
          家长管理
        </el-button>
        <el-button type="success" @click="navigateToMessages">
          <UnifiedIcon name="default" />
          消息中心
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
          <p>查看和管理家长信息</p>
        </div>
        <div class="feature-item" @click="navigateToMessages">
          <UnifiedIcon name="default" />
          <h3>消息中心</h3>
          <p>查看家长反馈和消息</p>
        </div>
        <div class="feature-item" @click="navigateToParentCommunication">
          <UnifiedIcon name="default" />
          <h3>沟通记录</h3>
          <p>家长沟通历史记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Message, ChatDotRound } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToParentList = () => {
  router.push('/parent')
}

const navigateToMessages = () => {
  router.push('/messages')
}

const navigateToParentCommunication = () => {
  router.push('/parent/communication/smart-hub')
}
</script>

<style scoped lang="scss">
.parent-feedback-page {
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