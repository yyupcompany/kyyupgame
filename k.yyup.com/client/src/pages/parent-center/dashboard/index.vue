<template>
  <div class="parent-dashboard">
    <!-- 欢迎区块 -->
    <div class="welcome-section">
      <div class="welcome-bg-decoration"></div>
      <div class="welcome-content">
        <div class="welcome-icon">
          <UnifiedIcon name="check" :size="40" color="#fff" />
        </div>
        <div class="welcome-text">
          <h2>家长仪表板</h2>
          <p>欢迎回来，这里是您的个性化控制台</p>
        </div>
        <div class="welcome-stats">
          <div class="stat-item">
            <span class="stat-value">3</span>
            <span class="stat-label">待办事项</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">5</span>
            <span class="stat-label">新通知</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 快捷功能区域 -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h3 class="section-title">快捷功能</h3>
          <p class="section-subtitle">常用操作，快速访问</p>
        </div>
        <div class="quick-actions">
          <div class="action-card" v-for="(action, index) in actionCards" :key="index" @click="handleAction(action.route)">
            <div class="card-icon" :class="action.type">
              <span class="icon-emoji">{{ action.icon }}</span>
            </div>
            <div class="card-body">
              <h3>{{ action.title }}</h3>
              <p>{{ action.description }}</p>
            </div>
            <div class="card-footer">
              <el-button :type="action.btnType" size="small" round>
                {{ action.btnText }}
                <UnifiedIcon name="chevron-right" :size="14" class="btn-arrow" />
              </el-button>
            </div>
            <div class="card-decoration"></div>
          </div>
        </div>
      </div>

      <!-- 通知区域 -->
      <div class="notifications-section">
        <div class="section-header">
          <h3 class="section-title">最新通知</h3>
          <p class="section-subtitle">查看学校最新动态</p>
        </div>
        <div class="notification-list">
          <div class="notification-item" v-for="(notification, index) in notifications" :key="index">
            <div class="notification-icon" :class="notification.type">
              <UnifiedIcon name="bell" :size="20" />
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <h4>{{ notification.title }}</h4>
                <el-tag :type="notification.tagType" size="small" effect="light" round>{{ notification.category }}</el-tag>
              </div>
              <p class="notification-text">{{ notification.content }}</p>
              <div class="notification-meta">
                <span class="notification-time">
                  <UnifiedIcon name="clock" :size="14" />
                  {{ notification.time }}
                </span>
              </div>
            </div>
            <div class="notification-arrow">
              <UnifiedIcon name="chevron-right" :size="20" />
            </div>
          </div>
        </div>
        <div class="view-all-section">
          <el-button text type="primary">
            查看全部通知
            <UnifiedIcon name="arrow-right" :size="14" class="arrow-icon" />
          </el-button>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-links-section">
        <div class="section-header">
          <h3 class="section-title">更多服务</h3>
          <p class="section-subtitle">探索更多功能</p>
        </div>
        <div class="quick-links-grid">
          <div class="quick-link-item" v-for="(link, index) in quickLinks" :key="index" @click="handleAction(link.route)">
            <div class="link-icon">
              <span>{{ link.icon }}</span>
            </div>
            <span class="link-text">{{ link.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

const router = useRouter()

// 快捷功能卡片数据
const actionCards = ref([
  {
    title: '我的孩子',
    description: '查看和管理孩子的信息',
    icon: '👶',
    type: 'primary',
    btnText: '管理',
    btnType: 'primary',
    route: '/parent-center/children'
  },
  {
    title: '学习进度',
    description: '追踪孩子的学习情况',
    icon: '📚',
    type: 'success',
    btnText: '查看',
    btnType: 'success',
    route: '/parent-center/children/growth'
  },
  {
    title: '通讯记录',
    description: '与老师的互动记录',
    icon: '💬',
    type: 'info',
    btnText: '查看',
    btnType: 'info',
    route: '/parent-center/communication'
  },
  {
    title: '活动报名',
    description: '参与学校活动',
    icon: '🎪',
    type: 'warning',
    btnText: '查看',
    btnType: 'warning',
    route: '/parent-center/activities'
  }
])

// 通知数据
const notifications = ref([
  {
    title: '关于下周活动的通知',
    content: '下周将举办春季运动会，请各位家长确认孩子是否参加并填写报名表。',
    time: '2小时前',
    type: 'info',
    tagType: 'primary',
    category: '学校通知'
  },
  {
    title: '作业完成情况',
    content: '您的孩子已完成今日数学作业，请及时查看并签字确认。',
    time: '5小时前',
    type: 'success',
    tagType: 'success',
    category: '作业通知'
  },
  {
    title: '家长会通知',
    content: '本周五下午3点召开家长会，请各位家长准时参加。',
    time: '1天前',
    type: 'warning',
    tagType: 'warning',
    category: '重要通知'
  }
])

// 快捷链接
const quickLinks = ref([
  { title: '成长报告', icon: '📊', route: '/parent-center/children/growth' },
  { title: '能力测评', icon: '🧠', route: '/parent-center/assessment' },
  { title: '游戏大厅', icon: '🎮', route: '/parent-center/games' },
  { title: 'AI育儿助手', icon: '🤖', route: '/parent-center/ai-assistant' },
  { title: '活动列表', icon: '📅', route: '/parent-center/activities' },
  { title: '家园沟通', icon: '🏠', route: '/parent-center/communication' },
  { title: '相册中心', icon: '📸', route: '/parent-center/albums' },
  { title: '园所奖励', icon: '🏆', route: '/parent-center/rewards' }
])

// 处理点击
const handleAction = (route: string) => {
  router.push(route)
}
</script>

<style scoped lang="scss">
.parent-dashboard {
  padding: 0;
  min-height: 100%;
}

/* ==================== 欢迎区块 ==================== */
.welcome-section {
  background: var(--gradient-primary);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
  position: relative;
  overflow: hidden;
  margin-left: calc(-1 * var(--spacing-xl));
  margin-right: calc(-1 * var(--spacing-xl));
  margin-top: calc(-1 * var(--spacing-xl));

  .welcome-bg-decoration {
    position: absolute;
    top: -100px;
    right: -50px;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;

    &::before {
      content: '';
      position: absolute;
      bottom: -150px;
      left: -100px;
      width: 250px;
      height: 250px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }
  }

  .welcome-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
  }

  .welcome-icon {
    width: 64px;
    height: 64px;
    background: var(--button-glass-bg);
    border: 1px solid var(--button-glass-border);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .welcome-text {
    flex: 1;

    h2 {
      margin: 0 0 var(--spacing-xs) 0;
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text-on-primary);
      line-height: 1.3;
    }

    p {
      margin: 0;
      font-size: var(--text-base);
      color: var(--text-on-primary-secondary);
    }
  }

  .welcome-stats {
    display: flex;
    gap: var(--spacing-xl);

    .stat-item {
      text-align: center;
      padding: var(--spacing-md) var(--spacing-xl);
      background: var(--button-glass-bg);
      border: 1px solid var(--button-glass-border);
      border-radius: var(--radius-lg);
      backdrop-filter: var(--backdrop-blur);

      .stat-value {
        display: block;
        font-size: var(--text-2xl);
        font-weight: 700;
        color: var(--text-on-primary);
        line-height: 1;
      }

      .stat-label {
        display: block;
        font-size: var(--text-xs);
        color: var(--text-on-primary-secondary);
        margin-top: var(--spacing-xs);
      }
    }
  }
}

/* ==================== 通用区块头部 ==================== */
.section-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color-lighter);

  .section-title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-xs) 0;
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--primary-color);
      border-radius: 2px;
    }
  }

  .section-subtitle {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    padding-left: var(--spacing-md);
    line-height: 1.5;
  }
}

/* ==================== 快捷功能区域 ==================== */
.quick-actions-section {
  margin-bottom: var(--spacing-2xl);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color-lighter);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-base) var(--ease-in-out);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity var(--transition-base) var(--ease-in-out);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);

    &::before {
      opacity: 1;
    }

    .card-icon {
      transform: scale(1.1);
    }

    .btn-arrow {
      transform: translateX(4px);
    }
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-md);
    transition: transform 0.3s ease;

    .icon-emoji {
      font-size: 24px;
    }

    &.primary {
      background: var(--primary-light-bg);
    }
    &.success {
      background: var(--success-light-bg);
    }
    &.warning {
      background: var(--warning-light-bg);
    }
    &.info {
      background: var(--info-light-bg);
    }
  }

  .card-body {
    margin-bottom: var(--spacing-md);

    h3 {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
      line-height: 1.3;
    }

    p {
      font-size: var(--text-sm);
      color: var(--text-regular);
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-footer {
    .btn-arrow {
      margin-left: var(--spacing-xs);
      transition: transform var(--transition-base) var(--ease-in-out);
    }
  }
}

/* ==================== 通知区域 ==================== */
.notifications-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color-lighter);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);

  .notification-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    background: var(--bg-page);
    transition: all var(--transition-base) var(--ease-in-out);
    cursor: pointer;

    &:hover {
      background: var(--bg-hover);

      .notification-arrow {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.primary {
        background: var(--primary-light-bg);
        color: var(--primary-color);
      }
      &.success {
        background: var(--success-light-bg);
        color: var(--success-color);
      }
      &.warning {
        background: var(--warning-light-bg);
        color: var(--warning-color);
      }
      &.info {
        background: var(--info-light-bg);
        color: var(--info-color);
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;

      .notification-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xs);

        h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
        }
      }

      .notification-text {
        font-size: var(--text-sm);
        color: var(--text-regular);
        margin: 0 0 var(--spacing-sm) 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .notification-meta {
        .notification-time {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
      }
    }

    .notification-arrow {
      opacity: 0;
      transform: translateX(-8px);
      transition: all var(--transition-base) var(--ease-in-out);
      color: var(--text-secondary);
    }
  }

  .view-all-section {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px dashed var(--border-color-lighter);

    .arrow-icon {
      margin-left: var(--spacing-xs);
    }
  }
}

/* ==================== 快捷链接区域 ==================== */
.quick-links-section {
  margin-bottom: var(--spacing-xl);
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-md);
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color-lighter);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base) var(--ease-in-out);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-light);

    .link-icon {
      transform: scale(1.1);
      background: var(--primary-light-bg);
    }
  }

  .link-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: var(--bg-page);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: all var(--transition-base) var(--ease-in-out);
  }

  .link-text {
    font-size: var(--text-xs);
    color: var(--text-regular);
    text-align: center;
    line-height: 1.3;
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1400px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-links-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .welcome-content {
    flex-wrap: wrap;
  }

  .welcome-stats {
    width: 100%;
    justify-content: center;
    margin-top: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .quick-links-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-sm);

    .quick-link-item {
      padding: var(--spacing-md);

      .link-icon {
        width: 40px;
        height: 40px;
        font-size: 20px;
      }

      .link-text {
        font-size: 10px;
      }
    }
  }

  .welcome-section {
    padding: var(--spacing-lg);
  }

  .welcome-stats .stat-item {
    padding: var(--spacing-sm) var(--spacing-lg);
  }
}
</style>