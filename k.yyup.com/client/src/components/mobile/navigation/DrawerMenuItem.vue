<template>
  <div
    class="drawer-menu-item"
    :class="{
      'active': isActive,
      'disabled': item.disabled
    }"
    @click="handleClick"
  >
    <!-- 图标 -->
    <van-icon
      :name="item.icon"
      size="20"
      class="menu-icon"
    />

    <!-- 内容区域 -->
    <div class="menu-content">
      <div class="menu-title">{{ item.title }}</div>
      <div v-if="item.description" class="menu-description">
        {{ item.description }}
      </div>
    </div>

    <!-- 徽章 -->
    <van-badge
      v-if="item.badge && !isActive"
      :content="item.badge"
      :offset="[0, 0]"
    />

    <!-- 激活指示器 -->
    <van-icon
      v-if="isActive"
      name="checked"
      size="18"
      class="active-icon"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { DrawerMenuItem as DrawerMenuItemType } from '@/config/mobile-navigation.types'

interface Props {
  item: DrawerMenuItemType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [item: DrawerMenuItemType]
}>()

const router = useRouter()
const route = useRoute()

// 是否激活
const isActive = computed(() => {
  const currentPath = route.path
  return currentPath === props.item.path || currentPath.startsWith(props.item.path + '/')
})

// 处理点击
const handleClick = () => {
  if (props.item.disabled) return

  emit('click', props.item)

  // 导航到对应页面
  if (props.item.path && route.path !== props.item.path) {
    router.push(props.item.path)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.drawer-menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--app-gap);
  padding: var(--app-gap-sm) var(--app-gap);
  cursor: pointer;
  transition: all var(--transition-duration-fast) var(--transition-timing-ease);
  border-radius: var(--border-radius-md);
  user-select: none;

  &:hover:not(.disabled) {
    background: var(--bg-color-hover);
  }

  &:active:not(.disabled) {
    transform: scale(0.98);
  }

  &.active {
    background: rgba(var(--primary-rgb), 0.1);
    color: var(--primary-color);
    font-weight: var(--font-semibold);

    .menu-icon {
      color: var(--primary-color);
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.menu-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: color var(--transition-duration-fast) var(--transition-timing-ease);
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: var(--text-sm);
  line-height: 1.4;
  color: var(--text-primary);
  transition: color var(--transition-duration-fast) var(--transition-timing-ease);
}

.menu-description {
  font-size: var(--text-xs);
  line-height: 1.3;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.active-icon {
  flex-shrink: 0;
  color: var(--primary-color);
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .drawer-menu-item {
    &.active {
      background: rgba(var(--primary-rgb), 0.2);
    }

    &:hover:not(.disabled) {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .menu-title {
    color: var(--text-primary-dark);
  }

  .menu-description {
    color: var(--text-tertiary-dark);
  }
}
</style>
