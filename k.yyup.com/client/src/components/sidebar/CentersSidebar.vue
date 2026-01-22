<template>
  <aside
    class="sidebar"
    :class="sidebarClasses"
    id="centers-sidebar"
  >
    <!-- ✨ 移除重复的logo，logo已在顶部导航栏 -->
    <nav class="sidebar-nav">
      <!-- 管理控制台 -->
      <el-tooltip
        :content="managementConsole.title"
        placement="right"
        :show-after="200"
        :hide-after="0"
        :disabled="!collapsed"
      >
        <a
          href="javascript:void(0)"
          class="nav-item center-item"
          :class="{ 'active': route.path === managementConsole.route }"
          @click.prevent="navigateToRoute(managementConsole.route)"
        >
          <UnifiedIcon
            :name="managementConsole.icon"
            :size="collapsed ? 28 : 20"
            class="nav-icon"
          />
          <div class="nav-content" v-if="!collapsed">
            <span class="nav-text">{{ managementConsole.title }}</span>
          </div>
        </a>
      </el-tooltip>

      <!-- 一级分类菜单 -->
      <div
        v-for="category in sidebarCategories"
        :key="category.id"
        class="sidebar-category"
      >
        <!-- 分类标题 -->
        <div
          class="category-title"
          @click="toggleCategory(category.id)"
          v-if="!collapsed"
        >
          <UnifiedIcon
            :name="category.icon"
            :size="20"
            class="category-icon"
          />
          <span class="category-text">{{ category.title }}</span>
          <span class="category-toggle">
            <UnifiedIcon
              :name="expandedCategories.includes(category.id) ? 'chevron-down' : 'chevron-right'"
              :size="12"
              class="category-arrow-icon"
            />
          </span>
        </div>

        <!-- 分类下的二级页面 -->
        <div
          v-show="!collapsed && expandedCategories.includes(category.id)"
          class="category-items"
        >
          <el-tooltip
            v-for="item in category.items"
            :key="item.id"
            :content="item.title"
            placement="right"
            :show-after="200"
            :hide-after="0"
            :disabled="!collapsed"
          >
            <a
              href="javascript:void(0)"
              class="nav-item center-item sub-item"
              :class="{ 'active': route.path === item.route }"
              @click.prevent="navigateToRoute(item.route)"
            >
              <UnifiedIcon
                :name="item.icon"
                :size="18"
                class="nav-icon"
              />
              <div class="nav-content">
                <span class="nav-text">{{ item.title }}</span>
              </div>
            </a>
          </el-tooltip>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { useMenuStore, type MenuCategory } from '@/stores/menu-flat'

// Props
interface Props {
  collapsed?: boolean
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  isMobile: false
})

// 路由
const router = useRouter()
const route = useRoute()

// 性能优化：使用菜单扁平化Store
const menuStore = useMenuStore()

// 性能优化：路由跳转防抖状态
const navigationLock = ref(false)
const lastClickTime = ref(0)
const DEBOUNCE_TIME = 300 // 300ms防抖

// 防抖路由跳转函数
const navigateToRoute = (targetRoute: string) => {
  const now = Date.now()
  
  // 防抖检查：如果在300ms内重复点击同一路由，忽略
  if (navigationLock.value || (now - lastClickTime.value) < DEBOUNCE_TIME) {
    console.log('🚫 防抖：跳过重复导航', targetRoute)
    return
  }
  
  // 如果已经在目标路由，不重复跳转
  if (route.path === targetRoute) {
    console.log('✅ 已在当前路由', targetRoute)
    return
  }
  
  // 设置导航锁
  navigationLock.value = true
  lastClickTime.value = now
  
  // 执行路由跳转
  router.push(targetRoute).finally(() => {
    // 300ms后释放锁
    setTimeout(() => {
      navigationLock.value = false
    }, DEBOUNCE_TIME)
  })
}

// 分类展开状态
const expandedCategories = ref<string[]>(['business-management', 'marketing-management'])

// 计算属性
const sidebarClasses = computed(() => {
  return {
    'sidebar-open': !props.collapsed,
    'collapsed': props.collapsed,
    'show': !props.collapsed && props.isMobile
  }
})

// 分类折叠/展开
const toggleCategory = (categoryId: string) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index === -1) {
    expandedCategories.value.push(categoryId)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

// 管理控制台
const managementConsole = {
  id: 'centers-dashboard',
  title: '管理控制台',
  route: '/dashboard',
  icon: 'dashboard'
}

// 侧边栏一级分类与二级页面配置
const sidebarCategories: MenuCategory[] = [
  // 业务管理
  {
    id: 'business-management',
    title: '业务管理',
    icon: 'briefcase',
    items: [
      {
        id: 'centers-business',
        title: '业务中心',
        route: '/centers/business',
        icon: 'briefcase'
      },
      {
        id: 'centers-activity',
        title: '活动中心',
        route: '/centers/activity',
        icon: 'calendar'
      },
      {
        id: 'centers-enrollment',
        title: '招生中心',
        route: '/centers/enrollment',
        icon: 'school'
      },
      {
        id: 'centers-customer',
        title: '客户池中心',
        route: '/centers/customer-pool',
        icon: 'user-check'
      },
      {
        id: 'centers-task',
        title: '任务中心',
        route: '/centers/task',
        icon: 'task'
      },
      {
        id: 'centers-document',
        title: '文档中心',
        route: '/centers/document-center',
        icon: 'document'
      },
      {
        id: 'centers-finance',
        title: '财务中心',
        route: '/centers/finance',
        icon: 'finance'
      }
    ]
  },
  // 营销管理
  {
    id: 'marketing-management',
    title: '营销管理',
    icon: 'marketing',
    items: [
      {
        id: 'centers-marketing',
        title: '营销中心',
        route: '/centers/marketing',
        icon: 'marketing'
      },
      {
        id: 'centers-call',
        title: '呼叫中心',
        route: '/centers/call',
        icon: 'phone'
      },
      {
        id: 'centers-photo-album',
        title: '相册中心',
        route: '/centers/media',
        icon: 'image'
      },
      {
        id: 'centers-new-media',
        title: '新媒体中心',
        route: '/principal/media-center',
        icon: 'video-camera'
      },
      {
        id: 'principal-poster-generator',
        title: '海报生成器',
        route: '/principal/poster-generator',
        icon: 'image'
      }
    ]
  },
  // 人事与教学管理
  {
    id: 'personnel-teaching-management',
    title: '人事与教学管理',
    icon: 'user-group',
    items: [
      {
        id: 'centers-personnel',
        title: '人员中心',
        route: '/centers/personnel',
        icon: 'user-group'
      },
      {
        id: 'centers-teaching',
        title: '教学中心',
        route: '/centers/teaching',
        icon: 'book-open'
      },
      {
        id: 'centers-assessment',
        title: '测评中心',
        route: '/centers/assessment',
        icon: 'check'
      },
      {
        id: 'centers-attendance',
        title: '考勤中心',
        route: '/centers/attendance',
        icon: 'clock'
      },
      {
        id: 'principal-parent-permission',
        title: '家长权限管理',
        route: '/principal/parent-permission-management',
        icon: 'lock'
      }
    ]
  },
  // 数据与分析管理
  {
    id: 'data-analytics-management',
    title: '数据与分析管理',
    icon: 'analytics',
    items: [
      {
        id: 'centers-analytics',
        title: '数据分析中心',
        route: '/centers/analytics',
        icon: 'analytics'
      },
      {
        id: 'centers-usage',
        title: '用量中心',
        route: '/centers/usage',
        icon: 'analytics'
      }
    ]
  },
  // 治理与集团管理
  {
    id: 'governance-group-management',
    title: '治理与集团管理',
    icon: 'home',
    items: [
      {
        id: 'centers-group',
        title: '集团中心',
        route: '/group',
        icon: 'home'
      },
      {
        id: 'centers-inspection',
        title: '督查中心',
        route: '/centers/inspection',
        icon: 'check'
      }
    ]
  },
  // 系统与AI管理
  {
    id: 'system-ai-management',
    title: '系统与AI管理',
    icon: 'settings',
    items: [
      {
        id: 'centers-system',
        title: '系统中心',
        route: '/centers/system',
        icon: 'settings'
      },
      {
        id: 'centers-ai',
        title: 'AI中心',
        route: '/centers/ai',
        icon: 'ai-brain'
      }
    ]
  }
]

// 性能优化：组件挂载时初始化菜单扁平化
onMounted(() => {
  menuStore.initAdminMenus(sidebarCategories)
  console.log('📊 菜单性能统计:', menuStore.getStats())
})
</script>
<style scoped>
.sidebar-category {
  margin: var(--spacing-sm) 0;
}

.category-title {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: 600;
  color: #303133;
  transition: all 0.3s ease;
  /* 性能优化：使用will-change提前通知浏览器 */
  will-change: transform;
}

.category-title:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
  /* 性能优化：使用transform替代padding，避免重排 */
  transform: translateX(2px);
}

.category-icon {
  margin-right: 8px;
}

.category-toggle {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-arrow-icon {
  color: #909399;
  transition: transform 0.3s ease;
}

.category-items {
  margin-left: 20px;
  /* 性能优化：使用opacity + transform实现展开动画 */
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.sub-item {
  padding-left: 36px;
}
</style>