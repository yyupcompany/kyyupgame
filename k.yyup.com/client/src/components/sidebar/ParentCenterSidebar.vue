<template>
  <aside
    class="sidebar"
    :class="sidebarClasses"
    id="parent-center-sidebar"
  >
    <nav class="sidebar-nav">
      <!-- 家长中心所有静态页面 -->
      <el-tooltip
        v-for="item in parentMenuItems"
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

// 家长中心静态菜单 - 写死所有页面
const parentMenuItems: MenuItem[] = [
  {
    id: 'parent-dashboard',
    title: '我的首页',
    route: '/parent-center/dashboard',
    icon: 'home'
  },
  {
    id: 'my-children',
    title: '我的孩子',
    route: '/parent-center/children',
    icon: 'school'
  },
  {
    id: 'child-growth',
    title: '成长报告',
    route: '/parent-center/child-growth',
    icon: 'growth'
  },
  {
    id: 'assessment',
    title: '能力测评',
    route: '/parent-center/assessment',
    icon: 'document'
  },
  {
    id: 'games',
    title: '游戏大厅',
    route: '/parent-center/games',
    icon: 'star'
  },
  {
    id: 'ai-assistant',
    title: 'AI育儿助手',
    route: '/parent-center/ai-assistant',
    icon: 'ai-brain'
  },
  {
    id: 'activities',
    title: '活动列表',
    route: '/parent-center/activities',
    icon: 'calendar'
  },
  {
    id: 'parent-communication',
    title: '家园沟通',
    route: '/parent-center/communication',
    icon: 'chat-square'
  },
  {
    id: 'photo-album',
    title: '相册中心',
    route: '/parent-center/photo-album',
    icon: 'picture'
  },
  {
    id: 'promotion-center',
    title: '园所奖励',
    route: '/parent-center/kindergarten-rewards',
    icon: 'gift'
  },
  {
    id: 'notifications',
    title: '最新通知',
    route: '/parent-center/notifications',
    icon: 'bell'
  }
]

// 性能优化：组件挂载时初始化菜单扁平化
onMounted(() => {
  menuStore.initParentMenus(parentMenuItems)
  console.log('📊 家长菜单性能统计:', menuStore.getStats())
})
</script>
