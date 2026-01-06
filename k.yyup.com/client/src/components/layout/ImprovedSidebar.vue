<template>
  <aside 
    class="sidebar glass-effect" 
    :class="sidebarClasses"
    id="improved-sidebar"
  >
    <!-- 侧边栏头部 - Logo已移至顶部导航栏 -->
    <div class="sidebar-header" v-show="!collapsed">
      <div class="sidebar-header-content">
        <span class="sidebar-title">导航菜单</span>
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
              <UnifiedIcon
                :name="item.icon || getItemIcon(item.title)"
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
                <UnifiedIcon
                  :name="item.icon || getItemIcon(item.title)"
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
                  <UnifiedIcon
                    :name="child.icon || getItemIcon(child.title)"
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
import { fixIconName } from '@/config/icon-mapping'

// 💡 静态菜单配置 - 基于动态数据提取的真实菜单结构
interface StaticMenuItem {
  id: string
  title: string
  route: string
  icon: string
  children?: StaticMenuItem[]
}

interface StaticMenuSection {
  id: string
  title: string
  description?: string
  items: StaticMenuItem[]
}

// 💡 静态菜单配置 - Admin/园长角色专用
// 基于业务逻辑的8分组设计：园所管理、业务管理、财务管理、系统管理、数据与分析、媒体管理、治理与集团、AI智能
const STATIC_MENU: StaticMenuSection[] = [
  {
    id: 'kindergarten-management',
    title: '园所管理',
    description: '人员、班级、考勤、教学等基础管理',
    items: [
      {
        id: 'personnel-center',
        title: '人员中心',
        route: '/centers/personnel',
        icon: 'user'
      },
      {
        id: 'attendance-center',
        title: '考勤中心',
        route: '/centers/attendance',
        icon: 'clock'
      },
      {
        id: 'teaching-center',
        title: '教学中心',
        route: '/centers/teaching',
        icon: 'school'
      },
      {
        id: 'assessment-center',
        title: '评估中心',
        route: '/centers/assessment',
        icon: 'statistics'
      }
    ]
  },
  {
    id: 'business-management',
    title: '业务管理',
    description: '招生、营销、活动等核心业务功能',
    items: [
      {
        id: 'enrollment-center',
        title: '招生中心',
        route: '/centers/enrollment',
        icon: 'user-plus'
      },
      {
        id: 'marketing-center',
        title: '营销中心',
        route: '/centers/marketing',
        icon: 'marketing'
      },
      {
        id: 'activity-center',
        title: '活动中心',
        route: '/centers/activity',
        icon: 'calendar'
      },
      {
        id: 'customer-pool',
        title: '客户池中心',
        route: '/centers/customer-pool',
        icon: 'user-group'
      },
      {
        id: 'call-center',
        title: '呼叫中心',
        route: '/centers/call-center',
        icon: 'phone'
      },
      {
        id: 'business-center',
        title: '业务中心',
        route: '/centers/business',
        icon: 'service'
      }
    ]
  },
  {
    id: 'finance-management',
    title: '财务管理',
    description: '收费、收支、报表等财务功能',
    items: [
      {
        id: 'finance-center',
        title: '财务中心',
        route: '/centers/finance',
        icon: 'money'
      }
    ]
  },
  {
    id: 'system-management',
    title: '系统管理',
    description: '系统配置、权限、日志等后台功能',
    items: [
      {
        id: 'system-center',
        title: '系统中心',
        route: '/centers/system',
        icon: 'settings'
      },
      {
        id: 'task-center',
        title: '任务中心',
        route: '/centers/task',
        icon: 'task'
      },
      {
        id: 'inspection-center',
        title: '检查中心',
        route: '/centers/inspection',
        icon: 'search'
      }
    ]
  },
  {
    id: 'data-analytics-management',
    title: '数据与分析管理',
    description: '数据分析、用量监控等功能',
    items: [
      {
        id: 'analytics-center',
        title: '分析中心',
        route: '/centers/analytics',
        icon: 'analytics'
      },
      {
        id: 'usage-center',
        title: '用量中心',
        route: '/centers/usage',
        icon: 'analytics'
      }
    ]
  },
  {
    id: 'media-management',
    title: '媒体管理',
    description: '相册、媒体资源管理',
    items: [
      {
        id: 'media-center',
        title: '相册中心',
        route: '/centers/media',
        icon: 'image'
      }
    ]
  },
  {
    id: 'governance-group-management',
    title: '治理与集团管理',
    description: '集团管理、督查等功能',
    items: [
      {
        id: 'group-center',
        title: '集团中心',
        route: '/group',
        icon: 'home'
      }
    ]
  },
  {
    id: 'ai-intelligence',
    title: 'AI智能',
    description: 'AI功能和智能工具',
    items: [
      {
        id: 'ai-center',
        title: '智能中心',
        route: '/centers/ai',
        icon: 'ai-center'
      },
      {
        id: 'document-templates',
        title: '文档模板中心',
        route: '/centers/document-template',
        icon: 'document'
      },
      {
        id: 'document-collab',
        title: '文档中心',
        route: '/centers/document-center',
        icon: 'edit'
      }
    ]
  }
]

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
  // 💡 使用静态菜单配置（基于动态数据的正确分类）
  // 静态菜单的优势：
  // 1. 无需每次从数据库读取，提升性能
  // 2. 基于真实动态数据，保证分类正确
  // 3. 不依赖网络请求，避免加载失败
  console.log('✅ [ImprovedSidebar] 使用静态菜单配置，共', STATIC_MENU.length, '个分组')
  return STATIC_MENU
})

// 根据菜单标题映射图标 - 为二级菜单提供合适的图标
const getIconByTitle = (title: string): string => {
  const iconMap: Record<string, string> = {
    // 工作台和概览
    '工作台': 'dashboard',
    '数据概览': 'dashboard',
    '总览': 'dashboard',
    '数据统计': 'statistics',

    // 招生管理
    '招生管理': 'enrollment',
    '招生计划': 'enrollment',
    '招生申请': 'document',
    '招生咨询': 'messages',

    // 教学管理
    '教学管理': 'user',
    '教师管理': 'teachers',
    '学生管理': 'students',
    '班级管理': 'classes',
    '家长管理': 'user-group',

    // 活动管理
    '活动管理': 'activities',
    '活动列表': 'activities',

    // AI功能
    'AI功能': 'ai-center',
    'AI助手': 'ai-center',
    'AI聊天': 'messages',
    'AI智能查询': 'search',
    'AI对话': 'ai-center',
    'AI模型管理': 'ai-robot',

    // 营销管理
    '营销管理': 'marketing',
    '营销活动': 'marketing',

    // 分析报告
    '分析报告': 'analytics',
    '统计分析': 'statistics',
    '绩效评估': 'performance',

    // 园长工作台
    '园长工作台': 'principal',

    // 系统管理
    '系统管理': 'system',
    '其他功能': 'menu',

    // 客户池
    '客户池': 'customers',

    // 管理中心相关
    '管理中心': 'settings',
    '业务中心': 'service',
    '招生中心': 'enrollment',
    '活动中心': 'activities',
    '教学中心': 'user',
    '测评中心': 'statistics',
    '检查中心': 'search',
    '考勤中心': 'calendar',
    '相册中心': 'media',
    '营销中心': 'marketing',
    '呼叫中心': 'messages',
    '客户池中心': 'customers',
    '话术中心': 'script',
    '财务中心': 'finance',
    '绩效中心': 'performance',
    '分析中心': 'analytics',
    '人员中心': 'personnel',
    '任务中心': 'task',
    '反馈中心': 'messages',
    '系统中心': 'system',
    '文档模板中心': 'design',
    '用量中心': 'monitor'
  }

  return iconMap[title] || 'dashboard'
}

// 方法
const getItemIcon = (title: string): string => {
  const iconName = getIconByTitle(title)
  return fixIconName(iconName)
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
  // 💡 静态菜单模式：无需从数据库获取菜单
  // 仅初始化用户权限（用于按钮级权限控制）
  // 目录级权限通过路由守卫控制
  console.log('✅ [ImprovedSidebar] 静态菜单模式启动')
  console.log('✅ [ImprovedSidebar] 目录权限：路由守卫 | 按钮权限：角色控制')

  // 默认展开所有section
  if (STATIC_MENU.length > 0) {
    expandedSections.value = STATIC_MENU.map(section => section.id)
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
  border-right: var(--border-width) solid var(--sidebar-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  z-index: var(--z-index-sidebar);
  transition: all var(--transition-normal, 0.3s) ease;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;

  &.collapsed {
    width: var(--sidebar-collapsed-width, var(--spacing-3xl));

    .sidebar-header .logo-text {
      opacity: 0;
      transform: translateX(var(--position-negative-2xl));
    }

    .nav-section-title {
      opacity: 0;
      height: 0;
      overflow: hidden;
    }

    .nav-text {
      opacity: 0;
      transform: translateX(var(--position-negative-2xl));
    }
  }
}

.sidebar-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: var(--border-width) solid var(--sidebar-border);
  background: var(--sidebar-bg);
  min-min-height: 60px; height: auto;
  display: flex;
  align-items: center;

  .sidebar-header-content {
    .sidebar-title {
      font-size: var(--sidebar-font-base, 18px);
      font-weight: 600;
      color: var(--sidebar-text);
      text-align: center;
      width: 100%;
      display: block;
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
          color: var(--text-on-primary);
        }
      }
    }

    &:hover .section-toggle {
      background: var(--primary-color);

      .toggle-icon {
        color: var(--text-on-primary);
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
          font-size: var(--sidebar-font-xs, 14px);
          font-weight: 600;
          color: var(--sidebar-text);
          text-transform: uppercase;
          letter-spacing: var(--letter-spacing-tight);
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
      color: #1976d2; /* 蓝色hover状态 */
    }
  }

  &.active {
    background: var(--sidebar-item-active);
    color: var(--text-on-primary);
    box-shadow: var(--shadow-sm);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: var(--spacing-xs);
      height: var(--spacing-xl);
      background: var(--primary-light);
      border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
    }

    .nav-icon {
      color: var(--text-on-primary);
    }
  }

  .nav-icon {
    width: var(--icon-size);
    height: var(--icon-size);
    margin-right: var(--spacing-md);
    transition: all var(--transition-fast);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333; /* 黑色图标 */
  }

  .nav-text {
    font-size: var(--sidebar-font-sm, 16px);
    font-weight: 500;
    transition: all var(--transition-fast);
    white-space: nowrap;
    flex: 1;
    text-align: left;
  }
}

.nav-submenu {
  margin-left: var(--spacing-lg);
  border-left: var(--transform-drop) solid var(--sidebar-border);
  padding-left: var(--spacing-md);

  .nav-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    margin: var(--spacing-xs) 0;
    font-size: var(--sidebar-font-sm, 16px);

    .nav-text {
      font-size: var(--sidebar-font-sm, 16px);
    }

    &:hover {
      transform: translateX(var(--transform-drop));
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
