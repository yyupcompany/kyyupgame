<template>
  <div class="sidebar-item-container">
    <!-- 单个菜单项 -->
    <el-menu-item 
      v-if="isMenuItem && onlyOneChild" 
      :index="resolveFullPath(onlyOneChild.path)"
      :class="{ 'submenu-title-noDropdown': !isNest }"
    >
      <div class="menu-item-content">
        <!-- 图标部分 -->
        <UnifiedIcon
          v-if="onlyOneChild.meta && onlyOneChild.meta.icon"
          :name="onlyOneChild.meta.icon"
          :size="20"
        />
        <span v-if="onlyOneChild.meta">{{ onlyOneChild.meta.title }}</span>
      </div>
    </el-menu-item>

    <!-- 多级菜单 -->
    <el-sub-menu 
      v-else-if="!isMenuItem" 
      :index="resolveFullPath(item.path)"
    >
      <template #title>
        <div class="menu-item-content">
          <!-- 图标部分 -->
          <UnifiedIcon
            v-if="item.meta && item.meta.icon"
            :name="item.meta.icon"
            :size="20"
          />
          <span v-if="item.meta">{{ item.meta.title }}</span>
        </div>
      </template>
      
      <!-- 递归渲染子菜单 -->
      <sidebar-item
        v-for="child in showingChildRoutes"
        :key="child.path"
        :item="child"
        :base-path="resolveFullPath(item.path)"
        :is-nest="true"
      />
    </el-sub-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { RouteRecordRaw } from 'vue-router'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

export default defineComponent({
  name: 'SidebarItem',
  
  // 递归组件和图标组件
  components: {
    SidebarItem: () => import('./SidebarItem.vue'),
    ...ElementPlusIconsVue
  },
  
  props: {
    // 路由对象
    item: {
      type: Object as () => RouteRecordRaw,
      required: true
    },
    // 基础路径
    basePath: {
      type: String,
      default: ''
    },
    // 是否为嵌套菜单
    isNest: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props) {
    // 唯一子项，默认为当前路由项
    const onlyOneChild = computed(() => {
      return props.item;
    });
    
    // 显示的子路由
    const showingChildRoutes = computed(() => {
      const { children } = props.item;
      if (!children) return [];
      
      // 过滤掉隐藏的菜单项
      return children.filter(child => {
        return !(child.meta && child.meta.hideInMenu);
      });
    });
    
    // 是否为单个菜单项（没有子菜单或只有一个可见子菜单）
    const isMenuItem = computed(() => {
      const visibleChildren = showingChildRoutes.value;
      return visibleChildren.length === 0 || 
        (visibleChildren.length === 1 && !visibleChildren[0].children);
    });
    
    // 解析完整路径 - 修改为正确处理绝对路径和相对路径
    const resolveFullPath = (routePath: string): string => {
      // 如果路径为空，返回基础路径
      if (!routePath) {
        return props.basePath;
      }
      
      // 如果是绝对路径，直接返回
      if (routePath.startsWith('/')) {
        return routePath;
      }
      
      // 如果基础路径是根路径，直接拼接
      if (props.basePath === '/') {
        return `/${routePath}`;
      }
      
      // 对于嵌套路由，确保不会重复路径
      // 检查子路径是否已经包含在基础路径中
      if (props.basePath.endsWith(routePath) || props.basePath.endsWith(`/${routePath}`)) {
        return props.basePath;
      }
      
      // 标准化基础路径，确保不以 / 结尾
      let normalizedBasePath = props.basePath;
      if (normalizedBasePath.endsWith('/')) {
        normalizedBasePath = normalizedBasePath.slice(0, -1);
      }
      
      // 标准化路由路径，确保不以 / 开头
      let normalizedRoutePath = routePath;
      if (normalizedRoutePath.startsWith('/')) {
        normalizedRoutePath = normalizedRoutePath.slice(1);
      }
      
      // 拼接路径
      return `${normalizedBasePath}/${normalizedRoutePath}`;
    };
    
    return {
      onlyOneChild,
      showingChildRoutes,
      isMenuItem,
      resolveFullPath
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.sidebar-item-container {
  .menu-item-content {
    display: flex;
    align-items: center;
  }
  
  .el-menu-item, .el-sub-menu {
    &.is-active {
      background-color: var(--white-alpha-10) !important;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: var(--spacing-xs);
        background-color: var(--primary-color);
      }
    }
    
    &:hover {
      background-color: var(--white-alpha-5) !important;
    }
  }
  
  .el-icon {
    margin-right: var(--spacing-2xl);
    width: var(--text-lg);
    height: var(--text-lg);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.is-collapsed {
  .el-sub-menu__title span,
  .el-menu-item span {
    display: none;
  }
  
  .el-menu-item .el-icon,
  .el-sub-menu__title .el-icon {
    margin-right: 0;
  }
}

.submenu-title-noDropdown.is-active {
  color: var(--bg-color) !important;
}

/* 隐藏侧边栏展开按钮上的箭头 */
:deep(.el-sub-menu) {
  .el-sub-menu__icon-arrow {
    margin-right: var(--spacing-2xl);
    font-size: var(--text-xs);
    opacity: 0.8;
    transition: transform 0.3s;
  }
  
  &.is-active {
    > .el-sub-menu__title {
      color: var(--bg-color) !important;
    }
  }
}

/* 次级菜单样式 */
:deep(.el-menu--inline) {
  .el-menu-item {
    padding-left: var(--spacing-10xl) !important;
    
    &.is-active {
      background-color: rgba(64, 158, 255, 0.15) !important;
    }
  }
}
</style> 