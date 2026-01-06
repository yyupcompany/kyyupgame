<template>
  <!-- 有子菜单的菜单项 - 递归渲染支持多级 -->
  <div v-if="hasChildren" class="menu-item-with-children">
    <!-- 父菜单项 -->
    <div
      class="menu-item-parent"
      :class="{ 'active': isActiveItem, 'expanded': expanded }"
      @click="toggleExpand"
    >
      <div class="menu-item-content">
        <div class="menu-item-icon" v-if="item.icon">
          <UnifiedIcon :name="item.icon" size="20" />
        </div>
        <span class="menu-item-text">{{ item.title }}</span>
      </div>
      <div class="menu-item-arrow" :class="{ 'rotated': expanded }">
        <UnifiedIcon name="chevron-down" size="20" />
      </div>
    </div>

    <!-- 子菜单 - 递归渲染支持多级 -->
    <div v-if="expanded" class="menu-item-children">
      <MenuItemComponent
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :level="level + 1"
        @item-click="$emit('item-click', $event)"
      />
    </div>
  </div>

  <!-- 没有子菜单的普通菜单项 -->
  <div v-else class="menu-item-simple" :class="{ 'active': isActiveItem }" @click="handleItemClick">
    <div class="menu-item-content">
      <div class="menu-item-icon" v-if="item.icon">
        <UnifiedIcon :name="item.icon" size="20" />
      </div>
      <span class="menu-item-text">{{ item.title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface MenuItem {
  id: string
  title: string
  route?: string
  icon?: string
  children?: MenuItem[]
  [key: string]: any
}

interface Props {
  item: MenuItem
  level?: number
  expandedItems?: string[]
}

interface Emits {
  (event: 'item-click', item: MenuItem): void
  (event: 'parent-item-click', item: MenuItem): void
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  expandedItems: () => []
})

const emit = defineEmits<Emits>()
const route = useRoute()

// 状态
const expanded = ref(false)

// 计算属性
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const isActiveItem = computed(() => {
  return route.path === props.item.route
})


// 方法
const toggleExpand = () => {
  if (hasChildren.value) {
    expanded.value = !expanded.value
    emit('parent-item-click', props.item)
  }
}

const handleItemClick = () => {
  emit('item-click', props.item)
}

</script>

<style lang="scss" scoped>
.menu-item {
  .menu-item-with-children {
    .menu-item-parent {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm) var(--spacing-md);
      margin: var(--spacing-sm) var(--spacing-sm);
      border-radius: var(--radius-lg);
      color: var(--sidebar-text);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--sidebar-item-hover);
        color: var(--sidebar-text-hover);
      }

      &.active {
        background: var(--sidebar-item-active);
        color: var(--text-on-primary);
      }

      .menu-item-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        flex: 1;

        .menu-item-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-item-text {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          white-space: nowrap;
        }
      }

      .menu-item-arrow {
        transition: transform var(--transition-fast);
        opacity: 0.6;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .menu-item-children {
      margin-left: var(--spacing-lg);
      border-left: var(--border-width-base) solid var(--border-color-light);
      padding-left: var(--spacing-md);

      // 递归样式，每级缩进更多
      .menu-item {
        margin-left: calc(var(--spacing-sm) * (v-bind(level) - 1));
      }
    }
  }

  .menu-item-simple {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    margin: var(--spacing-sm) var(--spacing-sm);
    border-radius: var(--radius-lg);
    color: var(--sidebar-text);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background: var(--sidebar-item-hover);
      color: var(--sidebar-text-hover);
    }

    &.active {
      background: var(--sidebar-item-active);
      color: var(--text-on-primary);
    }

    .menu-item-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;

      .menu-item-icon {
        width: var(--icon-md);
        height: var(--icon-md);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .menu-item-text {
        font-size: var(--text-sm);
        font-weight: var(--font-medium);
        white-space: nowrap;
      }
    }
  }
}
</style>