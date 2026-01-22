<template>
  <div class="principal-dashboard">
    <van-nav-bar title="管理控制台" />

    <!-- 快捷统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">156</div>
          <div class="stat-label">在园幼儿</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">24</div>
          <div class="stat-label">教职工</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">12</div>
          <div class="stat-label">待办任务</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">8</div>
          <div class="stat-label">新咨询</div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-section">
      <h3 class="section-title">快捷入口</h3>
      <div class="quick-grid">
        <div class="quick-item" @click="$router.push('/mobile/business-hub')">
          <van-icon name="apps-o" size="32" color="var(--primary-color)" />
          <span>业务中心</span>
        </div>
        <div class="quick-item" @click="$router.push('/mobile/analytics-hub')">
          <van-icon name="bar-chart-o" size="32" color="var(--success-color)" />
          <span>数据分析</span>
        </div>
        <div class="quick-item" @click="$router.push('/mobile/customer-pool')">
          <van-icon name="user-o" size="32" color="var(--warning-color)" />
          <span>客户池</span>
        </div>
        <div class="quick-item" @click="$router.push('/mobile/centers/task')">
          <van-icon name="todo-list-o" size="32" color="var(--danger-color)" />
          <span>任务中心</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.principal-dashboard {
  min-height: 100vh;
  background: var(--bg-color-page);
  padding-bottom: env(safe-area-inset-bottom);
}

.stats-section {
  padding: var(--app-gap);
  background: var(--bg-card);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--app-gap-sm);
  }

  .stat-card {
    padding: var(--app-gap);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-lg);
    text-align: center;

    .stat-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--primary-color);
      line-height: 1.2;
    }

    .stat-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-top: var(--app-gap-xs);
    }
  }
}

.quick-section {
  padding: var(--app-gap);
  background: var(--bg-card);
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
