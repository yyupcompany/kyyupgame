<template>
  <div class="fixed-footer">
    <!-- 底部安全区域占位 -->
    <div class="bottom-safe-area-spacer"></div>

    <!-- Tab 导航栏 -->
    <van-tabbar
      v-model="internalActiveTab"
      :safe-area-inset-bottom="false"
      :fixed="false"
      class="custom-tabbar"
      @change="handleTabChange"
    >
      <van-tabbar-item
        v-for="tab in displayTabs"
        :key="tab.name"
        :name="tab.name"
        :badge="tab.badge || (badge[tab.name] || 0)"
        :dot="tab.dot"
      >
        <template #icon="props">
          <van-icon
            :name="props.active ? tab.activeIcon || tab.icon : tab.icon"
            :size="tab.iconSize || 20"
          />
        </template>
        {{ tab.title }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface FooterTab {
  name: string
  title: string
  icon: string
  activeIcon?: string
  iconSize?: number
  path?: string
  badge?: number
  dot?: boolean
  roles?: string[]
}

interface Props {
  tabs: FooterTab[]
  activeTab?: string
  badge?: Record<string, number>
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [],
  activeTab: '',
  badge: () => ({})
})

const emit = defineEmits<{
  'tab-change': [tab: string]
}>()

// 内部激活状态
const internalActiveTab = ref(props.activeTab)

// 监听外部 activeTab 变化
watch(() => props.activeTab, (newTab) => {
  if (newTab && newTab !== internalActiveTab.value) {
    internalActiveTab.value = newTab
  }
})

// 监听内部状态变化，同步到外部
watch(internalActiveTab, (newTab) => {
  if (newTab !== props.activeTab) {
    emit('tab-change', newTab)
  }
})

// 显示的标签（默认全部显示，可以通过 roles 属性过滤）
const displayTabs = computed(() => {
  return props.tabs
})

// Tab 切换处理
const handleTabChange = (tabName: string) => {
  internalActiveTab.value = tabName
  emit('tab-change', tabName)
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-index-footer);
  background: var(--bg-color);
  border-top: 1px solid var(--border-color-light);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: all var(--transition-duration-base) var(--transition-timing-ease);

  .bottom-safe-area-spacer {
    height: env(safe-area-inset-bottom);
    background-color: inherit;
  }

  .custom-tabbar {
    height: var(--tabbar-height);
    background: var(--bg-color);
    backdrop-filter: blur(10px);

    :deep(.van-tabbar-item) {
      color: var(--text-secondary);
      font-size: var(--text-xs);
      transition: all var(--transition-duration-fast) var(--transition-timing-ease);

      .van-tabbar-item__icon {
        margin-bottom: 4px;
        transition: transform var(--transition-duration-fast) var(--transition-timing-ease);

        .van-icon {
          display: block;
        }
      }

      &:active .van-tabbar-item__icon {
        transform: scale(0.9);
      }

      .van-tabbar-item__text {
        font-size: 10px;
        line-height: 1.2;
      }

      .van-info {
        background-color: var(--danger-color);
        color: var(--text-white);
        font-size: 10px;
        padding: 0 4px;
        height: 16px;
        line-height: 16px;
        border-radius: 8px;
        min-width: 16px;
      }

      .van-dot {
        background-color: var(--danger-color);
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }

    :deep(.van-tabbar-item--active) {
      color: var(--theme-primary, var(--primary-color));
      font-weight: var(--font-semibold);
    }
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .fixed-footer {
    background: rgba(0, 0, 0, 0.9);
    border-top-color: var(--border-color-dark);

    .custom-tabbar {
      background: rgba(0, 0, 0, 0.9);

      :deep(.van-tabbar-item) {
        color: var(--text-secondary-dark);
      }

      :deep(.van-tabbar-item--active) {
        color: var(--theme-primary, var(--primary-color));
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .fixed-footer {
    .custom-tabbar {
      max-width: var(--breakpoint-md);
      margin: 0 auto;
    }
  }
}

@media (min-width: 1024px) {
  .fixed-footer {
    .custom-tabbar {
      max-width: var(--breakpoint-lg);
    }
  }
}

// 安全区域处理
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .fixed-footer .bottom-safe-area-spacer {
    height: env(safe-area-inset-bottom);
  }
}

// 角色主题色
.fixed-footer {
  &.role-admin,
  &.role-principal {
    --theme-primary: var(--primary-color);
  }

  &.role-teacher {
    --theme-primary: var(--success-color);
  }

  &.role-parent {
    --theme-primary: var(--warning-color);
  }
}
</style>
