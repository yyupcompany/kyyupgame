<template>
  <MobileMainLayout
    title="新媒体中心"
    :show-back="true"
    :show-footer="true"
    content-padding="0"
  >
    <div class="mobile-new-media-center">
      <!-- 标签页导航 -->
      <van-tabs
        v-model:active="activeTab"
        :line-width="20"
        :animated="true"
        :swipeable="true"
        color="var(--primary-color)"
        title-active-color="var(--primary-color)"
        title-inactive-color="var(--text-secondary)"
        background="var(--bg-card)"
      >
        <!-- 概览标签页 -->
        <van-tab title="概览" name="overview">
          <div class="tab-content overview-tab">
            <!-- 欢迎区域 -->
            <div class="welcome-section">
              <div class="welcome-content">
                <h2>AI内容创作中心</h2>
                <p>智能生成营销文案、图文、视频等内容</p>
              </div>
            </div>

            <!-- 功能卡片 -->
            <div class="feature-cards">
              <div
                class="feature-card"
                @click="switchToTab('copywriting')"
              >
                <div class="card-icon">📝</div>
                <h3>文案创作</h3>
                <p>AI智能生成营销文案</p>
                <van-tag type="primary" size="small">7大平台</van-tag>
              </div>

              <div
                class="feature-card"
                @click="switchToTab('article')"
              >
                <div class="card-icon">🖼️</div>
                <h3>图文创作</h3>
                <p>生成图文并茂的推广内容</p>
                <van-tag type="success" size="small">6大平台</van-tag>
              </div>

              <div
                class="feature-card"
                @click="switchToTab('video')"
              >
                <div class="card-icon">🎬</div>
                <h3>视频创作</h3>
                <p>AI生成视频脚本和内容</p>
                <van-tag type="warning" size="small">7大平台</van-tag>
              </div>

              <div
                class="feature-card"
                @click="switchToTab('tts')"
              >
                <div class="card-icon">🔊</div>
                <h3>文字转语音</h3>
                <p>多种音色AI语音合成</p>
                <van-tag type="default" size="small">TTS</van-tag>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 文案创作标签页 -->
        <van-tab title="文案创作" name="copywriting">
          <div class="tab-content">
            <MobileCopywritingCreator />
          </div>
        </van-tab>

        <!-- 图文创作标签页 -->
        <van-tab title="图文创作" name="article">
          <div class="tab-content">
            <MobileArticleCreator />
          </div>
        </van-tab>

        <!-- 视频创作标签页 -->
        <van-tab title="视频创作" name="video">
          <div class="tab-content">
            <MobileVideoCreator />
          </div>
        </van-tab>

        <!-- 文字转语音标签页 -->
        <van-tab title="文字转语音" name="tts">
          <div class="tab-content">
            <MobileTextToSpeech />
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import MobileCopywritingCreator from './components/MobileCopywritingCreator.vue'
import MobileArticleCreator from './components/MobileArticleCreator.vue'
import MobileVideoCreator from './components/MobileVideoCreator.vue'
import MobileTextToSpeech from './components/MobileTextToSpeech.vue'

const activeTab = ref('overview')

const switchToTab = (tabName: string) => {
  activeTab.value = tabName
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-new-media-center {
  min-height: 100vh;
  background: var(--bg-color-page);

  :deep(.van-tabs__nav) {
    padding: 0 var(--app-gap);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  :deep(.van-tabs__content) {
    background: var(--bg-color-page);
  }

  .tab-content {
    min-height: calc(100vh - 44px);
    padding: var(--app-gap);
  }

  .overview-tab {
    .welcome-section {
      margin-bottom: var(--app-gap-lg);
      padding: var(--app-gap-lg) var(--app-gap);
      background: var(--gradient-primary);
      border-radius: var(--radius-xl);
      color: var(--text-on-primary);
      text-align: center;

      .welcome-content {
        h2 {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          margin-bottom: var(--app-gap-sm);
        }

        p {
          font-size: var(--text-sm);
          opacity: 0.9;
          margin: 0;
        }
      }
    }

    .feature-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--app-gap);

      .feature-card {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--app-gap);
        text-align: center;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-base);
        cursor: pointer;

        &:active {
          transform: scale(0.95);
        }

        .card-icon {
          font-size: var(--text-5xl);
          margin-bottom: var(--app-gap-sm);
        }

        h3 {
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--app-gap-xs);
        }

        p {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-bottom: var(--app-gap-sm);
          line-height: var(--leading-normal);
        }

        :deep(.van-tag) {
          font-size: var(--text-xs);
        }
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-new-media-center {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: var(--shadow-xl);

    .overview-tab .feature-cards {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>
