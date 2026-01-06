<template>
  <div class="parent-dashboard">
    <van-nav-bar title="我的首页" />

    <!-- 孩子信息卡片 -->
    <div class="child-section">
      <h3 class="section-title">我的孩子</h3>
      <div class="child-card">
        <div class="child-avatar">
          <van-image
            round
            width="60"
            height="60"
            fit="cover"
          >
            <template #error>
              <van-icon name="user-o" size="30" />
            </template>
          </van-image>
        </div>
        <div class="child-info">
          <div class="child-name">小明</div>
          <div class="child-class">太阳班 · 4岁</div>
        </div>
        <van-button size="small" type="primary" @click="$router.push('/mobile/parent-center/children')">
          详情
        </van-button>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-section">
      <h3 class="section-title">常用功能</h3>
      <div class="quick-grid">
        <div class="quick-item" @click="$router.push('/mobile/parent-center/growth')">
          <van-icon name="chart-trending-o" size="32" color="var(--primary-color)" />
          <span>成长报告</span>
        </div>
        <div class="quick-item" @click="$router.push('/mobile/parent-center/activities')">
          <van-icon name="calendar-o" size="32" color="var(--success-color)" />
          <span>活动</span>
        </div>
        <div class="quick-item" @click="$router.push('/mobile/parent-center/ai-assistant')">
          <van-icon name="chat-o" size="32" color="var(--warning-color)" />
          <span>AI助手</span>
        </div>
        <div class="quick-item" @click="$router.push('/mobile/parent-center/photo-album')">
          <van-icon name="photo-o" size="32" color="var(--danger-color)" />
          <span>相册</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.parent-dashboard {
  min-height: 100vh;
  background: var(--bg-color-page);
  padding-bottom: env(safe-area-inset-bottom);
}

.child-section {
  padding: var(--app-gap);
  background: var(--bg-color);

  .section-title {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--app-gap) 0;
  }

  .child-card {
    display: flex;
    align-items: center;
    gap: var(--app-gap);
    padding: var(--app-gap);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-lg);
  }

  .child-avatar {
    flex-shrink: 0;

    :deep(.van-icon) {
      color: var(--text-tertiary);
      background: var(--bg-color-light);
      padding: 15px;
      border-radius: 50%;
    }
  }

  .child-info {
    flex: 1;
    min-width: 0;
  }

  .child-name {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .child-class {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-top: 2px;
  }
}

.quick-section {
  padding: var(--app-gap);
  background: var(--bg-color);
  margin-top: var(--app-gap);

  .section-title {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--app-gap) 0;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--app-gap);
  }

  .quick-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--app-gap-xs);
    padding: var(--app-gap);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-lg);
    cursor: pointer;

    &:active {
      transform: scale(0.95);
    }

    span {
      font-size: var(--text-xs);
      color: var(--text-primary);
      text-align: center;
    }
  }
}
</style>
