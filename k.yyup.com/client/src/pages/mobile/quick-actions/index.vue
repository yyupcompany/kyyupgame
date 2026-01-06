<template>
  <MobileMainLayout
    title="快捷操作"
    :show-back="true"
    :show-footer="false"
    @back="handleGoBack"
  >
    <div class="mobile-quick-actions">
      <!-- 搜索快捷操作 -->
      <div class="search-section">
        <van-search
          v-model="searchQuery"
          placeholder="搜索快捷操作"
          show-action
          shape="round"
          background="transparent"
          @search="filterActions"
          @input="filterActions"
        >
          <template #action>
            <van-button
              size="small"
              type="primary"
              @click="filterActions"
              :disabled="!searchQuery.trim()"
            >
              搜索
            </van-button>
          </template>
        </van-search>
      </div>

      <!-- 最近使用 -->
      <div v-if="recentActions.length > 0 && !searchQuery" class="recent-section">
        <div class="section-header">
          <span class="section-title">最近使用</span>
          <van-button
            type="primary"
            size="mini"
            plain
            @click="clearRecent"
          >
            清空
          </van-button>
        </div>
        <div class="recent-grid">
          <div
            v-for="action in recentActions"
            :key="action.id"
            class="action-item recent"
            @click="executeAction(action)"
          >
            <van-icon :name="action.icon" size="24" />
            <span class="action-name">{{ action.name }}</span>
          </div>
        </div>
      </div>

      <!-- 快捷操作分类 -->
      <div v-for="category in filteredCategories" :key="category.id" class="category-section">
        <div class="section-header">
          <van-icon :name="category.icon" class="category-icon" />
          <span class="section-title">{{ category.name }}</span>
        </div>
        <div class="actions-grid">
          <div
            v-for="action in category.actions"
            :key="action.id"
            class="action-item"
            :class="{ 'pinned': action.pinned }"
            @click="executeAction(action)"
          >
            <div class="action-icon-wrapper">
              <van-icon :name="action.icon" size="20" />
              <van-icon
                v-if="action.pinned"
                name="star-fill"
                class="pin-icon"
                size="12"
              />
            </div>
            <span class="action-name">{{ action.name }}</span>
            <span v-if="action.description" class="action-desc">{{ action.description }}</span>
          </div>
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div v-if="searchQuery && filteredCategories.length === 0" class="no-results">
        <van-empty
          image="search"
          description="未找到相关快捷操作"
        />
      </div>

      <!-- 长按提示 -->
      <div class="tips-section">
        <van-notice-bar
          left-icon="info-o"
          background="var(--info-light-bg)"
          color="var(--info-color)"
        >
          💡 长按操作可以固定到首页，再次长按取消固定
        </van-notice-bar>
      </div>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

// 路由
const router = useRouter()
const route = useRoute()

// 状态
const searchQuery = ref('')
const recentActions = ref<any[]>([])
const longPressTimer = ref<NodeJS.Timeout | null>(null)

// 快捷操作数据
const quickActions = ref([
  // 工作管理类
  {
    id: 'work-1',
    name: '打卡签到',
    icon: 'clock-o',
    description: '上下班打卡',
    route: '/mobile/attendance/check-in',
    categoryId: 'work',
    pinned: false
  },
  {
    id: 'work-2',
    name: '今日任务',
    icon: 'todo-list-o',
    description: '查看今日待办',
    route: '/mobile/centers/task-center?filter=today',
    categoryId: 'work',
    pinned: true
  },
  {
    id: 'work-3',
    name: '发布通知',
    icon: 'bullhorn-o',
    description: '发送通知消息',
    route: '/mobile/centers/notification-center/create',
    categoryId: 'work',
    pinned: false
  },
  {
    id: 'work-4',
    name: '审批中心',
    icon: 'success',
    description: '待审批事项',
    route: '/mobile/centers/approval-center',
    categoryId: 'work',
    pinned: true
  },

  // AI智能类
  {
    id: 'ai-1',
    name: 'AI助手',
    icon: 'bulb-o',
    description: '智能问答',
    route: '/mobile/ai-chat',
    categoryId: 'ai',
    pinned: true
  },
  {
    id: 'ai-2',
    name: '智能备课',
    icon: 'edit',
    description: 'AI辅助备课',
    route: '/mobile/centers/ai-center/prep',
    categoryId: 'ai',
    pinned: false
  },
  {
    id: 'ai-3',
    name: '生成教案',
    icon: 'description',
    description: '自动生成教案',
    route: '/mobile/centers/ai-center/lesson-plan',
    categoryId: 'ai',
    pinned: false
  },

  // 教学管理类
  {
    id: 'edu-1',
    name: '班级考勤',
    icon: 'friends-o',
    description: '学生考勤管理',
    route: '/mobile/centers/class-center/attendance',
    categoryId: 'education',
    pinned: true
  },
  {
    id: 'edu-2',
    name: '成绩录入',
    icon: 'chart-trending-o',
    description: '录入学生成绩',
    route: '/mobile/centers/student-center/grades',
    categoryId: 'education',
    pinned: false
  },
  {
    id: 'edu-3',
    name: '作业布置',
    icon: 'records',
    description: '发布家庭作业',
    route: '/mobile/centers/class-center/homework',
    categoryId: 'education',
    pinned: false
  },

  // 沟通联系类
  {
    id: 'comm-1',
    name: '家长沟通',
    icon: 'chat-o',
    description: '与家长交流',
    route: '/mobile/centers/communication-center/parent',
    categoryId: 'communication',
    pinned: true
  },
  {
    id: 'comm-2',
    name: '联系紧急',
    icon: 'phone-o',
    description: '紧急联系家长',
    route: '/mobile/centers/emergency-contacts',
    categoryId: 'communication',
    pinned: false
  },
  {
    id: 'comm-3',
    name: '发送短信',
    icon: 'comment-o',
    description: '群发短信通知',
    route: '/mobile/centers/sms-center',
    categoryId: 'communication',
    pinned: false
  },

  // 数据报表类
  {
    id: 'data-1',
    name: '数据报表',
    icon: 'bar-chart-o',
    description: '查看统计数据',
    route: '/mobile/centers/analytics-center',
    categoryId: 'data',
    pinned: true
  },
  {
    id: 'data-2',
    name: '导出报表',
    icon: 'down',
    description: '导出数据报表',
    route: '/mobile/centers/data-center/export',
    categoryId: 'data',
    pinned: false
  },

  // 系统工具类
  {
    id: 'sys-1',
    name: '系统设置',
    icon: 'setting-o',
    description: '系统配置',
    route: '/mobile/centers/system-center',
    categoryId: 'system',
    pinned: false
  },
  {
    id: 'sys-2',
    name: '帮助中心',
    icon: 'question-o',
    description: '使用帮助',
    route: '/mobile/help-center',
    categoryId: 'system',
    pinned: false
  }
])

// 操作分类
const categories = [
  {
    id: 'work',
    name: '工作管理',
    icon: 'bookmark-o',
    color: '#409EFF'
  },
  {
    id: 'ai',
    name: 'AI智能',
    icon: 'bulb-o',
    color: '#67C23A'
  },
  {
    id: 'education',
    name: '教学管理',
    icon: 'manager-o',
    color: '#E6A23C'
  },
  {
    id: 'communication',
    name: '沟通联系',
    icon: 'chat-o',
    color: '#F56C6C'
  },
  {
    id: 'data',
    name: '数据报表',
    icon: 'chart-trending-o',
    color: '#909399'
  },
  {
    id: 'system',
    name: '系统工具',
    icon: 'setting-o',
    color: '#606266'
  }
]

// 过滤后的分类
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categories.map(category => ({
      ...category,
      actions: quickActions.value.filter(action =>
        action.categoryId === category.id && !action.hidden
      )
    })).filter(category => category.actions.length > 0)
  }

  const query = searchQuery.value.toLowerCase()
  return categories.map(category => ({
    ...category,
    actions: quickActions.value.filter(action =>
      action.categoryId === category.id &&
      !action.hidden &&
      (action.name.toLowerCase().includes(query) ||
       action.description.toLowerCase().includes(query))
    )
  })).filter(category => category.actions.length > 0)
})

// 初始化
onMounted(() => {
  loadRecentActions()
  loadPinnedActions()
})

// 加载最近使用
const loadRecentActions = () => {
  const recent = localStorage.getItem('mobile-recent-actions')
  if (recent) {
    const recentIds = JSON.parse(recent)
    recentActions.value = quickActions.value.filter(action =>
      recentIds.includes(action.id)
    ).slice(0, 8)
  }
}

// 加载固定操作
const loadPinnedActions = () => {
  const pinned = localStorage.getItem('mobile-pinned-actions')
  if (pinned) {
    const pinnedIds = JSON.parse(pinned)
    quickActions.value.forEach(action => {
      action.pinned = pinnedIds.includes(action.id)
    })
  }
}

// 保存最近使用
const saveRecentActions = (actionId: string) => {
  const recent = localStorage.getItem('mobile-recent-actions')
  let recentIds: string[] = recent ? JSON.parse(recent) : []

  const index = recentIds.indexOf(actionId)
  if (index > -1) {
    recentIds.splice(index, 1)
  }
  recentIds.unshift(actionId)
  recentIds = recentIds.slice(0, 10)

  localStorage.setItem('mobile-recent-actions', JSON.stringify(recentIds))
  loadRecentActions()
}

// 保存固定操作
const savePinnedActions = () => {
  const pinnedIds = quickActions.value
    .filter(action => action.pinned)
    .map(action => action.id)
  localStorage.setItem('mobile-pinned-actions', JSON.stringify(pinnedIds))
}

// 清空最近使用
const clearRecent = async () => {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '是否清空最近使用的快捷操作？'
    })
    recentActions.value = []
    localStorage.removeItem('mobile-recent-actions')
    showToast('最近使用已清空')
  } catch {
    // 用户取消
  }
}

// 过滤操作
const filterActions = () => {
  // 搜索功能已通过计算属性实现
}

// 执行操作
const executeAction = (action: any) => {
  // 保存到最近使用
  saveRecentActions(action.id)

  // 执行导航或操作
  if (action.route) {
    router.push(action.route)
  } else if (action.action) {
    // 执行自定义操作
    handleCustomAction(action)
  }
}

// 处理自定义操作
const handleCustomAction = (action: any) => {
  switch (action.id) {
    case 'work-1':
      // 打卡签到
      showToast('打卡成功！')
      break
    case 'comm-2':
      // 紧急联系
      showToast('正在拨打紧急联系人电话...')
      break
    default:
      showToast(`执行操作：${action.name}`)
  }
}

// 处理长按（固定/取消固定）
const handleLongPress = (action: any) => {
  longPressTimer.value = setTimeout(() => {
    showConfirmDialog({
      title: action.pinned ? '取消固定' : '固定操作',
      message: action.pinned ? '是否取消固定此操作？' : '是否将此操作固定到首页？'
    }).then(() => {
      action.pinned = !action.pinned
      savePinnedActions()
      showToast(action.pinned ? '已固定到首页' : '已取消固定')
    }).catch(() => {
      // 用户取消
    })
  }, 500)
}

// 取消长按
const cancelLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 返回
const handleGoBack = () => {
  const from = route.query.from as string
  if (from && from !== '/') {
    router.push(from)
  } else {
    router.back()
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
@import '@/styles/design-tokens.scss';

.mobile-quick-actions {
  min-height: 100vh;
  background: var(--mobile-bg-primary);
  padding: var(--spacing-lg);

  // 使用统一滚动容器
  .mobile-scroll-container {
    padding-bottom: var(--spacing-3xl);
  }

  // 搜索区域
  .search-section {
    margin-bottom: var(--spacing-xl);
  }

  // 区域头部
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);

    .category-icon {
      color: var(--primary-color);
    }

    .section-title {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--mobile-text-primary);
    }
  }

  // 最近使用
  .recent-section {
    margin-bottom: var(--spacing-xl);

    .recent-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-md);

      .action-item.recent {
        background: var(--primary-light-bg);
        border: 1px solid var(--primary-color);

        .action-name {
          color: var(--primary-color);
        }
      }
    }
  }

  // 分类操作
  .category-section {
    margin-bottom: var(--spacing-xl);

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);

      .action-item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        background: var(--card-bg);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-color-light);
        cursor: pointer;
        transition: var(--transition-base);
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;

        &:active {
          transform: scale(0.95);
        }

        // 固定操作样式
        &.pinned {
          background: var(--warning-light-bg);
          border-color: var(--warning-color);

          .action-name {
            color: var(--warning-color);
            font-weight: var(--font-medium);
          }
        }

        .action-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          color: var(--mobile-text-primary);

          .pin-icon {
            position: absolute;
            top: -4px;
            right: -4px;
            color: var(--warning-color);
            background: var(--bg-color);
            border-radius: var(--radius-full);
            padding: 2px;
          }
        }

        .action-name {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--mobile-text-primary);
          text-align: center;
          line-height: var(--leading-tight);
        }

        .action-desc {
          font-size: var(--text-xs);
          color: var(--mobile-text-tertiary);
          text-align: center;
          line-height: var(--leading-tight);
        }
      }
    }
  }

  // 无结果
  .no-results {
    text-align: center;
    padding: var(--spacing-5xl) var(--spacing-lg);
  }

  // 提示区域
  .tips-section {
    margin-top: var(--spacing-3xl);
    position: fixed;
    bottom: var(--spacing-lg);
    left: var(--spacing-lg);
    right: var(--spacing-lg);
    z-index: 10;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-quick-actions {
    max-width: var(--container-md);
    margin: 0 auto;
    padding: var(--spacing-xl);

    .recent-section .recent-grid,
    .category-section .actions-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: var(--spacing-lg);
    }
  }
}
</style>