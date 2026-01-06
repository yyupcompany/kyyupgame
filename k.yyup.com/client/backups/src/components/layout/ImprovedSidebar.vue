<template>
  <aside 
    class="sidebar glass-effect" 
    :class="sidebarClasses"
    id="improved-sidebar"
  >
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="logo-icon floating-animation">
          <img src="@/assets/logo.png" alt="幼儿园管理系统" class="logo-image" />
        </div>
        <span class="logo-text" v-show="!collapsed">幼儿园管理</span>
      </div>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <!-- 动态导航菜单 -->
      <div 
        v-for="section in filteredNavigation" 
        :key="section.id"
        class="nav-section"
      >
        <div
          class="nav-section-title"
          v-if="!collapsed"
          @click="toggleSection(section.id)"
          :class="{ 'expanded': expandedSections.includes(section.id) }"
        >
          <div class="section-header">
            <div class="section-info">
              <span class="section-name">{{ section.title }}</span>
              <span class="section-desc" v-if="section.description">{{ section.description }}</span>
            </div>
            <div class="section-toggle">
              <span class="toggle-icon">{{ expandedSections.includes(section.id) ? '−' : '+' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 只有展开状态才显示菜单项 -->
        <template v-if="!collapsed && expandedSections.includes(section.id)">
          <template v-for="item in section.items" :key="item.id">
            <!-- 普通菜单项 -->
            <a
              v-if="!item.children || item.children.length === 0"
              :href="item.route"
              class="nav-item"
              :class="{ 'active': isActiveItem(item) }"
              @click.prevent="handleItemClick(item)"
              :title="collapsed ? item.title : ''"
            >
              <MultiStyleIcon
                :name="getItemIcon(item.title)"
                :size="20"
                class="nav-icon"
              />
              <span class="nav-text">{{ item.title }}</span>
            </a>

            <!-- 有子菜单的菜单项 -->
            <div v-else class="nav-item-group">
              <a
                :href="item.route"
                class="nav-item nav-item-parent"
                :class="{
                  'active': isActiveItem(item),
                  'expanded': expandedItems.includes(item.id)
                }"
                @click.prevent="handleParentItemClick(item)"
                :title="collapsed ? item.title : ''"
              >
                <MultiStyleIcon
                  :name="getItemIcon(item.title)"
                  :size="20"
                  class="nav-icon"
                />
                <span class="nav-text">{{ item.title }}</span>
                <UnifiedIcon
                  name="chevron-down"
                  :size="16"
                  class="nav-arrow"
                  :class="{ 'rotated': expandedItems.includes(item.id) }"
                />
              </a>

              <!-- 子菜单 -->
              <div
                v-show="expandedItems.includes(item.id)"
                class="nav-submenu"
              >
                <a
                  v-for="child in item.children"
                  :key="child.id"
                  :href="child.route"
                  class="nav-item nav-item-child"
                  :class="{ 'active': isActiveItem(child) }"
                  @click.prevent="handleItemClick(child)"
                >
                  <MultiStyleIcon
                    :name="getItemIcon(child.title)"
                    :size="16"
                    class="nav-icon"
                  />
                  <span class="nav-text">{{ child.title }}</span>
                </a>
              </div>
            </div>
          </template>
        </template>
      </div>
    </nav>
    </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionsStore } from '@/stores/permissions'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import MultiStyleIcon from '@/components/icons/MultiStyleIcon.vue'
import { useIconSystemStore } from '@/stores/icon-system'
import { inject } from 'vue'

interface Props {
  collapsed?: boolean
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  isMobile: false
})

const emit = defineEmits<{
  toggle: []
  menuClick: []
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionsStore = usePermissionsStore()

// 图标系统
const iconSystem = inject('iconSystem', 'modern')
const iconSystemStore = useIconSystemStore()

// 状态
const activeItemId = ref<string>('')
const expandedItems = ref<string[]>([])
const expandedSections = ref<string[]>([])

// 计算属性
const sidebarClasses = computed(() => ({
  'sidebar-open': !props.collapsed,
  'collapsed': props.collapsed,
  'show': !props.collapsed && props.isMobile
}))

const filteredNavigation = computed(() => {
  return permissionsStore.menuGroups || []
})

// 根据菜单标题映射图标 - 为二级菜单提供合适的图标
const getIconByTitle = (title: string): string => {
  const iconMap: Record<string, string> = {
    // 管理中心相关
    '管理中心': 'settings',

    // 业务管理相关
    '业务中心': 'service',
    '招生中心': 'enrollment',
    '活动中心': 'activities',

    // 教学管理相关
    '教学中心': 'user',
    '测评中心': 'statistics',
    '检查中心': 'search',
    '考勤中心': 'calendar',
    '相册中心': 'media',

    // 营销管理相关
    '营销中心': 'marketing',
    '呼叫中心': 'messages',
    '客户池中心': 'customers',
    '话术中心': 'script',

    // 财务管理相关
    '财务中心': 'finance',
    '绩效中心': 'performance',
    '分析中心': 'analytics',

    // 人员管理相关
    '人员中心': 'personnel',
    '任务中心': 'task',
    '反馈中心': 'messages',

    // 系统管理相关
    '系统中心': 'system',
    '文档模板中心': 'design',
    '用量中心': 'monitor'
  }

  return iconMap[title] || 'menu'
}

// 方法
const getItemIcon = (title: string): string => {
  return getIconByTitle(title)
}

const isActiveItem = (item: any): boolean => {
  return route.path === item.route || activeItemId.value === item.id
}

const handleItemClick = (item: any) => {
  activeItemId.value = item.id
  
  if (props.isMobile) {
    emit('menuClick')
  }
  
  router.push(item.route)
  emit('menuClick')
}

const handleParentItemClick = (item: any) => {
  const index = expandedItems.value.indexOf(item.id)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(item.id)
  }
}

const toggleSection = (sectionId: string) => {
  const index = expandedSections.value.indexOf(sectionId)
  if (index > -1) {
    expandedSections.value.splice(index, 1)
  } else {
    expandedSections.value.push(sectionId)
  }
}

// 初始化
onMounted(async () => {
  await permissionsStore.initializePermissions()

  // 默认展开所有section
  if (permissionsStore.menuGroups.length > 0) {
    expandedSections.value = permissionsStore.menuGroups.map(section => section.id)
  }
})
</script>

<style lang="scss" scoped>
/* 侧边栏样式 - 使用全局变量 */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width, 280px);
  height: 100vh;
  background: var(--sidebar-bg);
  border-right: var(--border-width-base) solid var(--sidebar-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  transition: all var(--transition-normal, 0.3s) ease;
  overflow: hidden;

  &.collapsed {
    width: var(--sidebar-collapsed-width, 6var(--spacing-xs));

    .sidebar-header .logo-text {
      opacity: 0;
      transform: translateX(-10px);
    }

    .nav-section-title {
      opacity: 0;
      height: 0;
      overflow: hidden;
    }

    .nav-text {
      opacity: 0;
      transform: translateX(-10px);
    }
  }
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: var(--border-width-base) solid var(--sidebar-border);
  background: var(--sidebar-bg);

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .logo-icon {
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-fast);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .logo-image {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-md);
        object-fit: cover;
      }
    }

    .logo-text {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--sidebar-text-hover);
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
  }
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: var(--spacing-xs);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--bg-tertiary);
    border-radius: var(--radius-xs);

    &:hover {
      background: var(--border-light);
    }
  }
}

.nav-section {
  margin-bottom: var(--spacing-sm);

  .nav-section-title {
    padding: var(--spacing-sm) var(--spacing-md);
    transition: all var(--transition-fast);
    cursor: pointer;
    border-radius: var(--radius-md);
    margin: 0 var(--spacing-sm);

    &:hover {
      background: var(--sidebar-item-hover);
    }

    &.expanded {
      background: var(--sidebar-item-hover);

      .section-toggle {
        background: var(--primary-color);

        .toggle-icon {
          color: white;
        }
      }
    }

    &:hover .section-toggle {
      background: var(--primary-color);

      .toggle-icon {
        color: white;
      }
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);

      .section-info {
        flex: 1;

        .section-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--sidebar-text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .section-desc {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: var(--spacing-sm);
        }
      }

      .section-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--text-3xl);
        height: var(--text-3xl);
        border-radius: var(--radius-sm);
        background: var(--sidebar-item-hover);
        transition: all var(--transition-fast);

        .toggle-icon {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--sidebar-text);
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: var(--spacing-sm) var(--spacing-md);
  margin: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--radius-lg);
  color: var(--sidebar-text);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--sidebar-item-hover);
    color: var(--sidebar-text-hover);
    transform: translateX(var(--spacing-xs));

    .nav-icon {
      transform: scale(1.1);
      color: var(--primary-color);
    }
  }

  &.active {
    background: var(--sidebar-item-active);
    color: white;
    box-shadow: var(--shadow-sm);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: var(--spacing-xs);
      height: var(--text-2xl);
      background: var(--primary-light);
      border-radius: 0 2px 2px 0;
    }

    .nav-icon {
      color: white;
    }
  }

  .nav-icon {
    width: 22px;
    height: 22px;
    margin-right: var(--spacing-md);
    transition: all var(--transition-fast);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-text {
    font-size: var(--text-sm);
    font-weight: 500;
    transition: all var(--transition-fast);
    white-space: nowrap;
    flex: 1;
    text-align: left;
  }
}

.nav-submenu {
  margin-left: var(--spacing-lg);
  border-left: 2px solid var(--sidebar-border);
  padding-left: var(--spacing-md);

  .nav-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    margin: var(--spacing-xs) 0;
    font-size: var(--text-sm);

    .nav-text {
      font-size: var(--text-sm);
    }

    &:hover {
      transform: translateX(2px);
    }
  }
}


@media (max-width: var(--breakpoint-md)) {
  .sidebar {
    transform: translateX(-100%);

    &.show {
      transform: translateX(0);
    }
  }
}
</style>
