<template>
  <aside
    class="sidebar"
    :class="sidebarClasses"
    id="teacher-center-sidebar"
  >
    <nav class="sidebar-nav">
      <!-- 教师中心所有静态页面 -->
      <el-tooltip
        v-for="item in teacherMenuItems"
        :key="item.id"
        :content="item.title"
        placement="right"
        :show-after="200"
        :hide-after="0"
        :disabled="!collapsed"
      >
        <a
          href="javascript:void(0)"
          class="nav-item center-item"
          :class="{ 'active': route.path === item.route }"
          @click.prevent="navigateToRoute(item.route)"
        >
          <UnifiedIcon
            :name="item.icon"
            :size="collapsed ? 28 : 20"
            class="nav-icon"
          />
          <div class="nav-content" v-if="!collapsed">
            <span class="nav-text">{{ item.title }}</span>
          </div>
        </a>
      </el-tooltip>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { useMenuStore, type MenuItem } from '@/stores/menu-flat'

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

// 计算属性
const sidebarClasses = computed(() => {
  return {
    'sidebar-open': !props.collapsed,
    'collapsed': props.collapsed,
    'show': !props.collapsed && props.isMobile
  }
})

// 教师中心静态菜单 - 写死所有页面
const teacherMenuItems: MenuItem[] = [
  {
    id: 'teacher-dashboard',
    title: '教师工作台',
    route: '/teacher-center/dashboard',
    icon: 'dashboard'
  },
  {
    id: 'teacher-notifications',
    title: '通知中心',
    route: '/teacher-center/notifications',
    icon: 'bell'
  },
  {
    id: 'teacher-tasks',
    title: '任务中心',
    route: '/teacher-center/tasks',
    icon: 'task'
  },
  {
    id: 'teacher-activities',
    title: '活动中心',
    route: '/teacher-center/activities',
    icon: 'calendar'
  },
  {
    id: 'teacher-enrollment',
    title: '招生中心',
    route: '/teacher-center/enrollment',
    icon: 'school'
  },
  {
    id: 'teacher-teaching',
    title: '教学中心',
    route: '/teacher-center/teaching',
    icon: 'book-open'
  },
  {
    id: 'teacher-customer-tracking',
    title: '客户跟踪',
    route: '/teacher-center/customer-tracking',
    icon: 'user-check'
  },
  {
    id: 'teacher-creative-curriculum',
    title: 'AI互动课堂',
    route: '/teacher-center/creative-curriculum',
    icon: 'star'
  },
  {
    id: 'teacher-performance',
    title: '绩效中心',
    route: '/teacher-center/performance-rewards',
    icon: 'star'
  }
]

// 性能优化：组件挂载时初始化菜单扁平化
onMounted(() => {
  menuStore.initTeacherMenus(teacherMenuItems)
  console.log('📊 教师菜单性能统计:', menuStore.getStats())
})
</script>
