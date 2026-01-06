<template>
  <div class="business-hub-page">
    <!-- 页面标题 -->
    <van-nav-bar
      title="业务中心"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 快捷数据统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.id" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.color }">
            <van-icon :name="stat.icon" size="24" color="#fff" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-access-section">
      <div class="section-header">
        <h3 class="section-title">快捷入口</h3>
      </div>
      <div class="quick-access-grid">
        <div
          v-for="item in quickAccessItems"
          :key="item.id"
          class="quick-access-item"
          @click="navigateTo(item.path)"
        >
          <div class="access-icon" :style="{ background: item.bgColor }">
            <van-icon :name="item.icon" size="28" :color="item.iconColor" />
          </div>
          <div class="access-label">{{ item.title }}</div>
          <van-badge
            v-if="item.badge"
            :content="item.badge"
            :offset="[0, 0]"
          />
        </div>
      </div>
    </div>

    <!-- 待办事项 -->
    <div class="todo-section">
      <div class="section-header">
        <h3 class="section-title">待办事项</h3>
        <van-button size="small" type="primary" @click="navigateTo('/mobile/centers/task')">
          全部
        </van-button>
      </div>
      <div class="todo-list">
        <van-empty v-if="!todoItems.length" description="暂无待办事项" />
        <div
          v-for="todo in todoItems"
          :key="todo.id"
          class="todo-item"
          @click="handleTodoClick(todo)"
        >
          <div class="todo-icon">
            <van-icon :name="todo.icon" :color="todo.color" size="20" />
          </div>
          <div class="todo-content">
            <div class="todo-title">{{ todo.title }}</div>
            <div class="todo-desc">{{ todo.description }}</div>
          </div>
          <van-badge :content="todo.priority" :color="todo.priorityColor" />
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-section">
      <div class="section-header">
        <h3 class="section-title">最近活动</h3>
        <van-button size="small" type="primary" @click="navigateTo('/mobile/centers/activity')">
          更多
        </van-button>
      </div>
      <div class="recent-list">
        <van-empty v-if="!recentActivities.length" description="暂无最近活动" />
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="recent-item"
          @click="navigateTo(activity.path)"
        >
          <div class="recent-icon">
            <van-icon name="calendar-o" size="20" color="var(--primary-color)" />
          </div>
          <div class="recent-content">
            <div class="recent-title">{{ activity.title }}</div>
            <div class="recent-time">{{ activity.time }}</div>
          </div>
          <van-icon name="arrow" size="16" color="var(--text-tertiary)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 统计数据
const stats = ref([
  { id: 1, label: '今日任务', value: '12', icon: 'todo-list-o', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, label: '待处理活动', value: '5', icon: 'calendar-o', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 3, label: '待跟进客户', value: '8', icon: 'user-o', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 4, label: '本月招生', value: '23', icon: 'guide-o', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

// 快捷入口
const quickAccessItems = ref([
  {
    id: 1,
    title: '活动中心',
    icon: 'calendar-o',
    path: '/mobile/centers/activity',
    bgColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    iconColor: '#ff6b6b'
  },
  {
    id: 2,
    title: '招生中心',
    icon: 'guide-o',
    path: '/mobile/centers/enrollment',
    bgColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    iconColor: '#4ecdc4'
  },
  {
    id: 3,
    title: '任务中心',
    icon: 'todo-list-o',
    path: '/mobile/centers/task',
    badge: 12,
    bgColor: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    iconColor: '#9b59b6'
  },
  {
    id: 4,
    title: '客户池',
    icon: 'user-o',
    path: '/mobile/customer-pool',
    badge: 8,
    bgColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    iconColor: '#f39c12'
  },
  {
    id: 5,
    title: '文档中心',
    icon: 'description',
    path: '/mobile/centers/document',
    bgColor: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    iconColor: '#3498db'
  },
  {
    id: 6,
    title: '财务中心',
    icon: 'gold-coin-o',
    path: '/mobile/centers/finance',
    bgColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    iconColor: '#e67e22'
  }
])

// 待办事项
const todoItems = ref([
  {
    id: 1,
    title: '审核活动方案',
    description: '春季亲子活动方案需要审核',
    icon: 'todo-list-o',
    color: '#ff6b6b',
    priority: '高',
    priorityColor: '#ff6b6b'
  },
  {
    id: 2,
    title: '跟进意向客户',
    description: '张三妈妈表示有入学意向',
    icon: 'phone-o',
    color: '#4ecdc4',
    priority: '中',
    priorityColor: '#f39c12'
  },
  {
    id: 3,
    title: '提交周报',
    description: '本周工作总结需要提交',
    icon: 'edit',
    color: '#3498db',
    priority: '低',
    priorityColor: '#95a5a6'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '春季亲子运动会',
    time: '2024-01-15',
    path: '/mobile/centers/activity/detail/1'
  },
  {
    id: 2,
    title: '家长开放日活动',
    time: '2024-01-20',
    path: '/mobile/centers/activity/detail/2'
  }
])

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}

// 处理待办点击
const handleTodoClick = (todo: any) => {
  // 这里可以根据待办类型导航到不同页面
  console.log('点击待办:', todo)
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.business-hub-page {
  min-height: 100vh;
  background: var(--bg-color-page);
  padding-bottom: env(safe-area-inset-bottom);
}

// 统计卡片区域
.stats-section {
  padding: var(--app-gap);
  background: var(--bg-color);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--app-gap-sm);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--app-gap-sm);
    padding: var(--app-gap-sm);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);

    .stat-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-md);
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;
      min-width: 0;
    }

    .stat-value {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      line-height: 1.2;
    }

    .stat-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.3;
      margin-top: 2px;
    }
  }
}

// 通用区块样式
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--app-gap);
  margin-bottom: var(--app-gap-sm);

  .section-title {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

// 快捷入口
.quick-access-section {
  margin-top: var(--app-gap);
  background: var(--bg-color);
  padding: var(--app-gap) 0;

  .quick-access-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--app-gap);
    padding: 0 var(--app-gap);
  }

  .quick-access-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--app-gap-xs);
    padding: var(--app-gap);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-lg);
    cursor: pointer;
    transition: all var(--transition-duration-fast) var(--transition-timing-ease);

    &:active {
      transform: scale(0.95);
    }

    .access-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
    }

    .access-label {
      font-size: var(--text-sm);
      color: var(--text-primary);
      text-align: center;
      line-height: 1.3;
    }
  }
}

// 待办事项
.todo-section {
  margin-top: var(--app-gap);
  background: var(--bg-color);
  padding: var(--app-gap) 0;

  .todo-list {
    padding: 0 var(--app-gap);
  }

  .todo-item {
    display: flex;
    align-items: center;
    gap: var(--app-gap-sm);
    padding: var(--app-gap-sm);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--app-gap-xs);
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    &:active {
      transform: scale(0.98);
    }

    .todo-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-color);
      border-radius: var(--border-radius-sm);
      flex-shrink: 0;
    }

    .todo-content {
      flex: 1;
      min-width: 0;
    }

    .todo-title {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .todo-desc {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.3;
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 最近活动
.recent-section {
  margin-top: var(--app-gap);
  background: var(--bg-color);
  padding: var(--app-gap) 0;

  .recent-list {
    padding: 0 var(--app-gap);
  }

  .recent-item {
    display: flex;
    align-items: center;
    gap: var(--app-gap-sm);
    padding: var(--app-gap-sm);
    background: var(--bg-color-page);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--app-gap-xs);
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    &:active {
      transform: scale(0.98);
    }

    .recent-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-color);
      border-radius: var(--border-radius-sm);
      flex-shrink: 0;
    }

    .recent-content {
      flex: 1;
      min-width: 0;
    }

    .recent-title {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      line-height: 1.3;
    }

    .recent-time {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.3;
      margin-top: 2px;
    }
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .business-hub-page {
    background: var(--bg-color-page-dark);
  }

  .stat-card,
  .quick-access-item,
  .todo-item,
  .recent-item {
    background: var(--bg-color-light-dark);
  }

  .todo-icon,
  .recent-icon {
    background: var(--bg-color-dark);
  }
}
</style>
