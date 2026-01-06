<template>
  <div class="drawer-category">
    <!-- 分类标题（可折叠） -->
    <div
      v-if="category.collapsible !== false"
      class="category-header"
      @click="toggleCollapse"
    >
      <div class="category-title-wrapper">
        <van-icon
          v-if="category.icon"
          :name="category.icon"
          size="18"
          class="category-icon"
        />
        <span class="category-title">{{ category.title }}</span>
        <van-badge
          v-if="getTotalBadge() > 0"
          :content="getTotalBadge()"
          :offset="[4, 0]"
        />
      </div>
      <van-icon
        :name="isCollapsed ? 'arrow-down' : 'arrow-up'"
        size="16"
        class="collapse-icon"
        :class="{ 'rotated': isCollapsed }"
      />
    </div>

    <!-- 静态分类标题 -->
    <div v-else class="category-header static">
      <div class="category-title-wrapper">
        <van-icon
          v-if="category.icon"
          :name="category.icon"
          size="18"
          class="category-icon"
        />
        <span class="category-title">{{ category.title }}</span>
      </div>
    </div>

    <!-- 菜单项列表 -->
    <Transition name="collapse">
      <div v-show="!isCollapsed" class="category-items">
        <DrawerMenuItem
          v-for="item in visibleItems"
          :key="item.id"
          :item="item"
          @click="handleItemClick"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DrawerMenuItem from './DrawerMenuItem.vue'
import type { DrawerMenuItem as DrawerMenuItemType } from '@/config/mobile-navigation.types'
import type { DrawerCategory as DrawerCategoryType } from '@/config/mobile-navigation.types'

interface Props {
  category: DrawerCategoryType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [item: DrawerMenuItemType]
}>()

// 折叠状态（默认根据配置决定）
const isCollapsed = ref(
  props.category.defaultCollapsed ?? false
)

// 切换折叠状态
const toggleCollapse = () => {
  if (props.category.collapsible === false) return
  isCollapsed.value = !isCollapsed.value
}

// 获取可见的菜单项（过滤掉禁用的）
const visibleItems = computed(() => {
  return props.category.items.filter(item => !item.disabled)
})

// 获取分类总徽章数
const getTotalBadge = (): number => {
  let total = 0
  for (const item of props.category.items) {
    if (typeof item.badge === 'number') {
      total += item.badge
    }
  }
  return total
}

// 处理菜单项点击
const handleItemClick = (item: DrawerMenuItemType) => {
  emit('item-click', item)
}

// 暴露方法
defineExpose({
  expand: () => {
    isCollapsed.value = false
  },
  collapse: () => {
    isCollapsed.value = true
  },
  toggle: () => {
    toggleCollapse()
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.drawer-category {
  margin-bottom: var(--app-gap-sm);

  &:last-child {
    margin-bottom: 0;
  }
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--app-gap-sm) var(--app-gap);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-duration-fast) var(--transition-timing-ease);

  &:not(.static):hover {
    background: var(--bg-color-hover);
  }

  &:not(.static):active {
    transform: scale(0.99);
  }

  &.static {
    cursor: default;
  }
}

.category-title-wrapper {
  display: flex;
  align-items: center;
  gap: var(--app-gap-xs);
  flex: 1;
}

.category-icon {
  color: var(--text-secondary);
}

.category-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  transition: color var(--transition-duration-fast) var(--transition-timing-ease);
}

.collapse-icon {
  color: var(--text-tertiary);
  transition: transform var(--transition-duration-base) var(--transition-timing-ease);

  &.rotated {
    transform: rotate(180deg);
  }
}

.category-items {
  padding: 0 var(--app-gap-xs);
  display: flex;
  flex-direction: column;
  gap: var(--app-gap-xs);
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .category-header {
    &:not(.static):hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .category-icon {
    color: var(--text-secondary-dark);
  }

  .category-title {
    color: var(--text-primary-dark);
  }

  .collapse-icon {
    color: var(--text-tertiary-dark);
  }
}

// Vue Transition collapse animation
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
