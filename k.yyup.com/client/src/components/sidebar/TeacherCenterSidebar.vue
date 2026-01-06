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
          @click.prevent="router.push(item.route)"
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

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

// 计算属性
const sidebarClasses = computed(() => {
  return {
    'sidebar-open': !props.collapsed,
    'collapsed': props.collapsed,
    'show': !props.collapsed && props.isMobile
  }
})

// 教师中心静态菜单 - 写死所有页面
const teacherMenuItems = [
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
    icon: 'trophy'
  }
]
</script>
