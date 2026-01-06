<template>
  <div class="mobile-quick-actions-panel">
    <van-cell-group inset title="快捷操作">
      <van-cell
        v-for="action in displayedActions"
        :key="action.key"
        :title="action.title"
        :label="action.description"
        :icon="action.icon"
        is-link
        @click="handleAction(action.key)"
        class="action-item"
      >
        <template #icon>
          <div class="action-icon" :class="action.iconClass">
            <van-icon :name="action.vanIcon" />
          </div>
        </template>

        <template #right-icon>
          <van-icon name="arrow" class="action-arrow" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 展开更多按钮 -->
    <div class="expand-section" v-if="actions.length > visibleCount">
      <van-button
        type="default"
        size="small"
        :icon="showMore ? 'arrow-up' : 'arrow-down'"
        @click="toggleMore"
        plain
      >
        {{ showMore ? '收起' : `更多操作 (${actions.length - visibleCount})` }}
      </van-button>
    </div>

    <!-- 常用操作悬浮按钮 -->
    <van-floating-bubble
      v-if="showFloatingButton"
      axis="xy"
      icon="apps-o"
      @click="showActionSheet = true"
    >
      <div class="floating-badge" v-if="quickActionCount > 0">
        {{ quickActionCount }}
      </div>
    </van-floating-bubble>

    <!-- 操作面板 -->
    <van-action-sheet
      v-model:show="showActionSheet"
      title="快捷操作"
      :actions="sheetActions"
      @select="onSheetSelect"
      cancel-text="取消"
      close-on-click-action
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'

interface QuickAction {
  key: string
  title: string
  description: string
  vanIcon: string
  iconClass: string
  priority?: number
  badge?: number
}

interface Props {
  compact?: boolean
  showFloatingButton?: boolean
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showFloatingButton: false,
  maxVisible: 6
})

const emit = defineEmits<{
  action: [key: string]
}>()

// 响应式数据
const showMore = ref(false)
const showActionSheet = ref(false)
const visibleCount = ref(props.maxVisible)
const quickActionCount = ref(0)

// 快捷操作配置
const actions = ref<QuickAction[]>([
  {
    key: 'upload-media',
    title: '上传教学媒体',
    description: '上传课堂照片和视频',
    vanIcon: 'photograph',
    iconClass: 'upload',
    priority: 1
  },
  {
    key: 'create-task',
    title: '创建新任务',
    description: '添加待办事项',
    vanIcon: 'add-square',
    iconClass: 'create',
    priority: 1,
    badge: 1
  },
  {
    key: 'view-schedule',
    title: '查看课程表',
    description: '今日课程安排',
    vanIcon: 'calendar-o',
    iconClass: 'schedule',
    priority: 2
  },
  {
    key: 'take-photo',
    title: '拍照记录',
    description: '快速拍照上传',
    vanIcon: 'camera-o',
    iconClass: 'photo',
    priority: 2
  },
  {
    key: 'write-report',
    title: '撰写报告',
    description: '教学总结报告',
    vanIcon: 'edit',
    iconClass: 'report',
    priority: 3
  },
  {
    key: 'clock-in',
    title: '考勤打卡',
    description: '上下班打卡',
    vanIcon: 'clock-o',
    iconClass: 'clock',
    priority: 1
  },
  {
    key: 'student-attendance',
    title: '学生考勤',
    description: '记录学生出勤情况',
    vanIcon: 'friends-o',
    iconClass: 'attendance',
    priority: 2
  },
  {
    key: 'parent-communication',
    title: '家长沟通',
    description: '发送通知给家长',
    vanIcon: 'chat-o',
    iconClass: 'communication',
    priority: 2,
    badge: 3
  },
  {
    key: 'activity-management',
    title: '活动管理',
    description: '创建和管理活动',
    vanIcon: 'flag-o',
    iconClass: 'activity',
    priority: 3
  },
  {
    key: 'grade-entry',
    title: '成绩录入',
    description: '学生成绩管理',
    vanIcon: 'chart-trending-o',
    iconClass: 'grade',
    priority: 3,
    badge: 2
  },
  {
    key: 'resource-center',
    title: '资源中心',
    description: '教学资源下载',
    vanIcon: 'folder-o',
    iconClass: 'resource',
    priority: 4
  },
  {
    key: 'system-settings',
    title: '系统设置',
    description: '个人设置和偏好',
    vanIcon: 'setting-o',
    iconClass: 'settings',
    priority: 4
  }
])

// 计算属性
const displayedActions = computed(() => {
  const sortedActions = [...actions.value].sort((a, b) => (a.priority || 999) - (b.priority || 999))
  const count = showMore.value ? actions.value.length : visibleCount.value
  return sortedActions.slice(0, count)
})

const sheetActions = computed(() => {
  return actions.value.map(action => ({
    name: action.title,
    subname: action.description,
    icon: action.vanIcon,
    badge: action.badge
  }))
})

// 计算快捷操作数量（有徽章的）
onMounted(() => {
  quickActionCount.value = actions.value.reduce((total, action) => {
    return total + (action.badge || 0)
  }, 0)
})

// 方法
const handleAction = (key: string) => {
  emit('action', key)
  showToast(`执行操作: ${getActionTitle(key)}`)
}

const onSheetSelect = (action: any, index: number) => {
  const actionKey = actions.value[index].key
  handleAction(actionKey)
}

const toggleMore = () => {
  showMore.value = !showMore.value
}

const getActionTitle = (key: string) => {
  const action = actions.value.find(a => a.key === key)
  return action?.title || key
}
</script>

<style lang="scss" scoped>
.mobile-quick-actions-panel {
  margin: var(--spacing-md) 0;

  .action-item {
    margin-bottom: 1px;
    border-radius: 0;
    transition: all 0.3s ease;

    &:active {
      background-color: var(--van-background-color-light);
      transform: scale(0.98);
    }

    .action-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: var(--text-lg);

      .van-icon {
        font-size: var(--text-lg);
      }

      &.upload {
        background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
        color: #0284c7;
      }

      &.create {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        color: #16a34a;
      }

      &.schedule {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #d97706;
      }

      &.photo {
        background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
        color: #be185d;
      }

      &.report {
        background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
        color: #7c3aed;
      }

      &.clock {
        background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
        color: #ea580c;
      }

      &.attendance {
        background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%);
        color: #0891b2;
      }

      &.communication {
        background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
        color: #6366f1;
      }

      &.activity {
        background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
        color: #ea580c;
      }

      &.grade {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        color: #059669;
      }

      &.resource {
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        color: #6b7280;
      }

      &.settings {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        color: #dc2626;
      }
    }

    .action-arrow {
      color: var(--van-text-color-3);
      font-size: var(--text-sm);
      transition: all 0.3s ease;
    }

    &:active .action-arrow {
      color: var(--van-primary-color);
      transform: translateX(2px);
    }
  }

  .expand-section {
    display: flex;
    justify-content: center;
    padding: var(--spacing-md);
    background: white;
    margin-top: 8px;

    .van-button {
      border-radius: 20px;
      font-weight: 500;
      border-color: var(--van-border-color);
    }
  }

  .floating-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    background: var(--van-danger-color);
    color: white;
    border-radius: 8px;
    font-size: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    line-height: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    animation: badgePulse 2s infinite;
  }

  @keyframes badgePulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  :deep(.van-floating-bubble) {
    background: linear-gradient(135deg, var(--van-primary-color), #337ecc);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
    position: relative;

    &:active {
      transform: scale(0.95);
    }
  }

  :deep(.van-action-sheet) {
    .van-action-sheet__item {
      padding: var(--spacing-md);

      .van-action-sheet__name {
        font-size: var(--text-base);
        font-weight: 500;
        margin-bottom: 4px;
      }

      .van-action-sheet__subname {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }
  }
}

// 紧凑模式样式
.mobile-quick-actions-panel.compact {
  .action-item {
    .van-cell__title {
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .van-cell__label {
      display: none;
    }

    .action-icon {
      width: 32px;
      height: 32px;
      font-size: var(--text-base);

      .van-icon {
        font-size: var(--text-base);
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .mobile-quick-actions-panel {
    :deep(.van-cell-group) {
      background: var(--van-background-color);
    }

    .expand-section {
      background: var(--van-background-color);
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-quick-actions-panel {
    .action-item {
      .action-icon {
        width: 32px;
        height: 32px;
        margin-right: 10px;
        font-size: var(--text-base);

        .van-icon {
          font-size: var(--text-base);
        }
      }

      :deep(.van-cell__title) {
        font-size: var(--text-sm);
      }

      :deep(.van-cell__label) {
        font-size: 11px;
      }
    }
  }
}
</style>