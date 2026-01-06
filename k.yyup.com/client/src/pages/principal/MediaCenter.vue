<template>
  <div class="media-center-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span style="font-size: var(--text-lg); font-weight: bold;">新媒体中心</span>
          <span style="color: #999;">管理文案、图文、视频制作等内容</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="card">
    <!-- 概览标签页 -->
        <el-tab-pane label="📊 概览" name="overview">
        <div class="feature-cards">
            <div class="feature-card" @click="goToTab('copywriting')">
              <div class="card-icon">📝</div>
              <h3>文案创作</h3>
              <p>AI智能生成营销文案、活动宣传、节日祝福等内容</p>
              <span class="card-tag">支持7大平台</span>
          </div>

            <div class="feature-card" @click="goToTab('article')">
              <div class="card-icon">🖼️</div>
              <h3>图文创作</h3>
              <p>生成图文并茂的推广内容，包含配图建议和排版方案</p>
              <span class="card-tag">6大平台支持</span>
          </div>

            <div class="feature-card" @click="goToTab('video')">
              <div class="card-icon">🎬</div>
              <h3>视频创作</h3>
              <p>AI生成视频脚本，支持文生视频和首帧生视频</p>
              <span class="card-tag">7大平台支持</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- 文案创作标签页 -->
        <el-tab-pane label="✍️ 文案创作" name="copywriting">
          <CopywritingCreator />
        </el-tab-pane>

        <!-- 图文创作标签页 -->
        <el-tab-pane label="📸 图文创作" name="article">
          <ArticleCreator />
        </el-tab-pane>

    <!-- 视频创作标签页 -->
        <el-tab-pane label="🎥 视频创作" name="video">
          <VideoCreator />
        </el-tab-pane>

        <!-- 文字转语音标签页 -->
        <el-tab-pane label="🔊 文字转语音" name="tts">
          <div class="content-placeholder">
            <el-icon><Microphone /></el-icon>
            <p>文字转语音模块开发中...</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Microphone } from '@element-plus/icons-vue'

// 导入创作组件
import CopywritingCreator from './media-center/CopywritingCreator.vue'
import ArticleCreator from './media-center/ArticleCreator.vue'
import VideoCreator from './media-center/VideoCreator.vue'

const activeTab = ref('overview')

const goToTab = (tabName: string) => {
  activeTab.value = tabName
}
</script>

<style scoped lang="scss">
.media-center-page {
  padding: var(--spacing-lg);
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: 20px;
}

.feature-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
}

  .card-icon {
    font-size: var(--text-5xl);
    margin-bottom: 12px;
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    margin: var(--spacing-md) 0;
    color: var(--el-text-color-primary);
}

  p {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    margin-bottom: 12px;
    line-height: 1.5;
}

  .card-tag {
    display: inline-block;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    padding: var(--spacing-xs) 12px;
    border-radius: 12px;
    font-size: var(--text-xs);
  }
}

.content-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  :deep(.el-icon) {
    font-size: var(--text-5xl);
    color: var(--el-color-primary);
    margin-bottom: 20px;
  }

  p {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
  }
}
</style>
