<template>
  <MobileCenterLayout title="AI中心" back-path="/mobile/centers">
    <div class="ai-center-mobile">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="ai-avatar">🤖</div>
          <h2>AI智能助手</h2>
          <p>为您提供智能化的幼儿园管理服务</p>
        </div>
      </div>

      <!-- 功能模块 -->
      <div class="features-section">
        <div class="section-title">AI功能</div>
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item v-for="feature in features" :key="feature.key" class="feature-card" @click="navigateToFeature(feature.key)">
            <div class="feature-content">
              <div class="feature-icon">{{ feature.emoji }}</div>
              <div class="feature-info">
                <div class="feature-name">{{ feature.name }}</div>
                <div class="feature-desc">{{ feature.desc }}</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 使用统计 -->
      <div class="stats-section">
        <div class="section-title">使用统计</div>
        <van-cell-group inset>
          <van-cell title="本月对话次数" :value="stats.conversations" />
          <van-cell title="生成报告数量" :value="stats.reports" />
          <van-cell title="任务规划数量" :value="stats.tasks" />
          <van-cell title="数据查询次数" :value="stats.queries" />
        </van-cell-group>
      </div>

      <!-- 最近使用 -->
      <div class="recent-section">
        <div class="section-header">
          <span class="section-title">最近使用</span>
          <van-button size="medium" plain @click="viewHistory">查看全部</van-button>
        </div>
        <div class="recent-list">
          <div v-for="item in recentUsage" :key="item.id" class="recent-card" @click="continueConversation(item)">
            <div class="recent-icon">{{ item.icon }}</div>
            <div class="recent-content">
              <div class="recent-title">{{ item.title }}</div>
              <div class="recent-time">{{ item.time }}</div>
            </div>
            <van-icon name="arrow" color="#c0c4cc" />
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-entry">
        <van-button type="primary" block round size="large" @click="startChat">
          <van-icon name="chat-o" style="margin-right: 8px;" />
          开始对话
        </van-button>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 功能模块
const features = [
  { key: 'chat', name: '智能对话', desc: 'AI问答与建议', emoji: '💬' },
  { key: 'report', name: '报告生成', desc: '自动生成分析报告', emoji: '📊' },
  { key: 'plan', name: '活动规划', desc: 'AI辅助活动策划', emoji: '📋' },
  { key: 'query', name: '数据查询', desc: '自然语言查数据', emoji: '🔍' }
]

// 使用统计
const stats = reactive({
  conversations: '128次',
  reports: '25份',
  tasks: '42个',
  queries: '89次'
})

// 最近使用
const recentUsage = ref([
  { id: 1, icon: '💬', title: '关于本月招生情况的咨询', time: '10分钟前' },
  { id: 2, icon: '📊', title: '生成周教学报告', time: '2小时前' },
  { id: 3, icon: '📋', title: '春游活动方案策划', time: '昨天' }
])

// 操作
const navigateToFeature = (key: string) => {
  if (key === 'chat') {
    startChat()
  } else {
    showToast(`进入${key}功能`)
  }
}

const viewHistory = () => showToast('查看历史记录')
const continueConversation = (item: any) => showToast(`继续对话: ${item.title}`)
const startChat = () => {
  // 跳转到AI助手页面
  router.push('/mobile/parent-center/ai-assistant')
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
.ai-center-mobile {
  @include mobile-layout;
  @include pull-refresh-area;
  min-height: 100vh;
  background: var(--van-background-2);
}

.welcome-section {
  @include mobile-padding(30px, 20px);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  text-align: center;

  @include mobile-sm {
    padding: 36px 24px;
  }

  @include mobile-lg {
    padding: 42px 28px;
  }

  .welcome-content {
    .ai-avatar {
      @include responsive-font(32px, 56px);
      margin-bottom: 12px;

      @include mobile-sm {
        margin-bottom: 16px;
      }
    }

    h2 {
      @include mobile-title;
      color: #fff;
      margin-bottom: 8px;

      @include mobile-sm {
        margin-bottom: 12px;
      }
    }

    p {
      @include mobile-text;
      color: #fff;
      opacity: 0.9;
    }
  }
}

.features-section,
.stats-section,
.recent-section {
  @include mobile-padding(16px, 12px);

  @include mobile-sm {
    padding: 20px 16px;
  }

  @include mobile-lg {
    padding: 24px 20px;
  }

  .section-title {
    @include mobile-title;
    font-size: 16px;
    margin-bottom: 12px;

    @include mobile-sm {
      margin-bottom: 16px;
    }
  }
}

.section-header {
  @include mobile-flex(row, space-between, center, 12px);
  margin-bottom: 12px;

  @include mobile-sm {
    margin-bottom: 16px;
  }
}

.feature-card {
  :deep(.van-grid-item__content) {
    padding: 0;
    background: transparent;
  }

  .feature-content {
    @include mobile-flex(row, center, center, 12px);
    padding: 16px;
    background: var(--van-background);
    @include responsive-radius(12px, 14px, 16px);
    width: 100%;
    @include tap-feedback;

    @include mobile-sm {
      padding: 18px;
      gap: 14px;
    }

    @include mobile-lg {
      padding: 20px;
      gap: 16px;
    }

    .feature-icon {
      @include responsive-font(24px, 36px);
    }

    .feature-info {
      flex: 1;

      .feature-name {
        font-size: 15px;
        font-weight: 500;
        color: var(--van-text-color);

        @include mobile-sm {
          font-size: 16px;
        }

        @include mobile-md {
          font-size: 17px;
        }
      }

      .feature-desc {
        font-size: 12px;
        color: var(--van-text-color-3);
        margin-top: 2px;

        @include mobile-sm {
          font-size: 13px;
        }
      }
    }
  }
}

.recent-list {
  .recent-card {
    @include mobile-list-item;
    @include tap-feedback;

    .recent-icon {
      @include responsive-font(20px, 28px);
    }

    .recent-content {
      flex: 1;

      .recent-title {
        @include mobile-text;
        font-size: 14px;
        color: var(--van-text-color);
      }

      .recent-time {
        font-size: 12px;
        color: var(--van-text-color-3);
        margin-top: 2px;
      }
    }
  }
}

.quick-entry {
  @include fixed-bottom-bar;
  padding: 20px 16px;

  @include mobile-sm {
    padding: 24px 20px;
  }

  @include mobile-lg {
    padding: 28px 24px;
  }
}
</style>
