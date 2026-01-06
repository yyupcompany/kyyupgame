<template>
  <div class="activity-share-preview">
    <!-- 活动海报 -->
    <div class="poster-section" v-if="posterUrl">
      <img :src="posterUrl" alt="活动海报" class="poster-image" />
    </div>

    <!-- 活动信息 -->
    <div class="activity-info">
      <h2 class="activity-title">{{ activity.title }}</h2>
      
      <div class="info-item">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDateTime(activity.startTime) }} - {{ formatDateTime(activity.endTime) }}</span>
      </div>

      <div class="info-item">
        <el-icon><Location /></el-icon>
        <span>{{ activity.location }}</span>
      </div>

      <div class="info-item">
        <el-icon><User /></el-icon>
        <span>名额：{{ activity.registeredCount || 0 }}/{{ activity.capacity }}</span>
      </div>

      <div class="info-item" v-if="activity.fee">
        <el-icon><Money /></el-icon>
        <span>费用：¥{{ activity.fee }}</span>
      </div>
    </div>

    <!-- 活动描述 -->
    <div class="activity-description" v-if="activity.description">
      <h3>活动详情</h3>
      <div class="description-content" v-html="formatDescription(activity.description)"></div>
    </div>

    <!-- 报名按钮 -->
    <div class="action-section">
      <el-button type="primary" size="large" class="register-btn" @click="handleRegister">
        <el-icon><Check /></el-icon>
        立即报名
      </el-button>
      
      <div class="share-tips">
        <el-icon><Share /></el-icon>
        <span>分享给好友，一起参加吧！</span>
      </div>
    </div>

    <!-- 二维码 -->
    <div class="qrcode-section" v-if="qrCodeUrl">
      <div class="qrcode-container">
        <img :src="qrCodeUrl" alt="活动二维码" class="qrcode-image" />
        <p class="qrcode-tip">扫码查看活动详情</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Location, User, Money, Check, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Activity {
  id: number
  title: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  registeredCount?: number
  fee?: number
  description?: string
}

interface Props {
  activity: Activity
  posterUrl?: string
  qrCodeUrl?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'register': []
}>()

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDescription = (description: string) => {
  // 简单的Markdown转HTML（支持换行）
  return description
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

const handleRegister = () => {
  emit('register')
}
</script>

<style lang="scss" scoped>
.activity-share-preview {
  width: 100%;
  background: var(--bg-white);
  
  .poster-section {
    width: 100%;
    
    .poster-image {
      width: 100%;
      height: auto;
      display: block;
    }
  }

  .activity-info {
    padding: var(--text-2xl);
    
    .activity-title {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--text-lg) 0;
      line-height: 1.4;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--text-sm);
      font-size: var(--text-base);
      color: var(--text-secondary);

      .el-icon {
        color: var(--primary-color);
        font-size: var(--text-lg);
      }
    }
  }

  .activity-description {
    padding: 0 var(--text-2xl) var(--text-2xl);
    
    h3 {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--text-sm) 0;
    }

    .description-content {
      font-size: var(--text-base);
      line-height: 1.8;
      color: var(--text-secondary);
      
      :deep(strong) {
        color: var(--text-primary);
        font-weight: 600;
      }

      :deep(em) {
        font-style: italic;
        color: var(--primary-color);
      }
    }
  }

  .action-section {
    padding: var(--text-2xl);
    border-top: var(--border-width-base) solid var(--bg-gray-light);
    
    .register-btn {
      width: 100%;
      height: var(--button-height-xl);
      font-size: var(--text-lg);
      font-weight: 600;
      border-radius: var(--text-3xl);
      margin-bottom: var(--text-sm);
    }

    .share-tips {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-lg);
      font-size: var(--text-sm);
      color: var(--text-tertiary);

      .el-icon {
        font-size: var(--text-base);
      }
    }
  }

  .qrcode-section {
    padding: var(--text-2xl);
    background: var(--bg-gray-light);
    border-top: var(--border-width-base) solid var(--bg-gray-light);
    
    .qrcode-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .qrcode-image {
        width: 150px;
        height: 150px;
        border: var(--spacing-xs) solid var(--bg-white);
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      }

      .qrcode-tip {
        margin-top: var(--text-sm);
        font-size: var(--text-sm);
        color: var(--text-tertiary);
      }
    }
  }
}
</style>

