<template>
  <div class="parent-dashboard">
    <div class="dashboard-header">
      <h2>家长仪表板</h2>
      <p>欢迎回来，这里是您的个性化控制台</p>
    </div>

    <div class="dashboard-content">
      <!-- 快捷功能区域 -->
      <div class="quick-actions">
        <div class="action-card">
          <h3>我的孩子</h3>
          <p>查看和管理孩子的信息</p>
          <el-button type="primary">管理</el-button>
        </div>

        <div class="action-card">
          <h3>学习进度</h3>
          <p>追踪孩子的学习情况</p>
          <el-button type="success">查看</el-button>
        </div>

        <div class="action-card">
          <h3>通讯记录</h3>
          <p>与老师的互动记录</p>
          <el-button type="info">查看</el-button>
        </div>

        <div class="action-card">
          <h3>活动报名</h3>
          <p>参与学校活动</p>
          <el-button type="warning">查看</el-button>
        </div>
      </div>

      <!-- 通知区域 -->
      <div class="notifications-section">
        <h3>最新通知</h3>
        <div class="notification-list">
          <div class="notification-item">
            <div class="notification-content">
              <h4>学校通知</h4>
              <p>关于下周活动的通知</p>
              <span class="notification-time">2小时前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 组件逻辑
</script>

<style scoped lang="scss">
.parent-dashboard {
  padding: var(--spacing-xl);

  .dashboard-header {
    margin-bottom: var(--spacing-2xl);

    h2 {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--text-primary);
      font-size: var(--text-2xl);
      font-weight: var(--font-semibold);
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--text-base);
    }
  }

  .dashboard-content {
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-2xl);

      .action-card {
        background: var(--bg-card);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        transition: var(--card-transition);

        &:hover {
          transform: var(--card-transform-hover);
          box-shadow: var(--shadow-lg);
        }

        h3 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--text-primary);
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
        }

        p {
          margin: 0 0 var(--spacing-lg) 0;
          color: var(--text-secondary);
          font-size: var(--text-base);
          line-height: var(--leading-normal);
        }
      }
    }

    .notifications-section {
      background: var(--bg-card);
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);

      h3 {
        margin: 0 0 var(--spacing-lg) 0;
        color: var(--text-primary);
        font-size: var(--text-xl);
        font-weight: var(--font-semibold);
      }

      .notification-list {
        .notification-item {
          padding: var(--spacing-lg) 0;
          border-bottom: var(--border-width-base) solid var(--border-color-lighter);

          &:last-child {
            border-bottom: none;
          }

          .notification-content {
            h4 {
              margin: 0 0 var(--spacing-sm) 0;
              color: var(--text-primary);
              font-size: var(--text-sm);
              font-weight: var(--font-medium);
            }

            p {
              margin: 0 0 var(--spacing-sm) 0;
              color: var(--text-secondary);
              font-size: var(--text-xs);
              line-height: var(--leading-normal);
            }

            .notification-time {
              color: var(--text-tertiary);
              font-size: var(--text-xs);
            }
          }
        }
      }
    }
  }
}
</style>