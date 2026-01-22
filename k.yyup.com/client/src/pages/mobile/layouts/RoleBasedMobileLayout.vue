<template>
  <div class="role-based-mobile-layout">
    <!-- 顶部导航栏（可选） -->
    <van-nav-bar
      v-if="showNavBar"
      :title="title"
      :left-arrow="showBack"
      @click-left="handleBack"
      :border="false"
      :safe-area-inset-top="true"
      fixed
      placeholder
    >
      <template #right v-if="$slots.right">
        <slot name="right"></slot>
      </template>
    </van-nav-bar>

    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'with-navbar': showNavBar, 'with-tabbar': showTabBar }">
      <slot></slot>
    </div>

    <!-- 统一底部导航栏（根据角色显示不同菜单） -->
    <van-tabbar
      v-if="showTabBar"
      v-model="activeTab"
      @change="handleTabChange"
      :safe-area-inset-bottom="true"
      :border="true"
      fixed
      placeholder
    >
      <van-tabbar-item
        v-for="tab in roleBasedTabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
        :to="tab.path"
      >
        {{ tab.title }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface Tab {
  name: string
  title: string
  icon: string
  path: string
  roles: string[]
}

interface Props {
  title?: string
  showNavBar?: boolean
  showBack?: boolean
  showTabBar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showNavBar: true,
  showBack: true,
  showTabBar: true  // 默认显示底部导航
})

const emit = defineEmits<{
  'back': []
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('')

// 所有角色的底部导航配置
const allTabs: Tab[] = [
  // 家长端导航
  { name: 'parent-dashboard', title: '首页', icon: 'wap-home-o', path: '/mobile/parent-center/dashboard', roles: ['parent'] },
  { name: 'parent-children', title: '孩子', icon: 'friends-o', path: '/mobile/parent-center/children', roles: ['parent'] },
  { name: 'parent-ai', title: 'AI助手', icon: 'chat-o', path: '/mobile/parent-center/ai-assistant', roles: ['parent'] },
  { name: 'parent-communication', title: '沟通', icon: 'comment-o', path: '/mobile/parent-center/communication', roles: ['parent'] },
  { name: 'parent-profile', title: '我的', icon: 'user-o', path: '/mobile/parent-center/profile', roles: ['parent'] },
  
  // 教师端导航
  { name: 'teacher-dashboard', title: '首页', icon: 'wap-home-o', path: '/mobile/teacher-center/dashboard', roles: ['teacher'] },
  { name: 'teacher-tasks', title: '任务', icon: 'todo-list-o', path: '/mobile/teacher-center/tasks', roles: ['teacher'] },
  { name: 'teacher-students', title: '学生', icon: 'friends-o', path: '/mobile/teacher-center/students', roles: ['teacher'] },
  { name: 'teacher-customers', title: '客户', icon: 'manager-o', path: '/mobile/teacher-center/customer-pool', roles: ['teacher'] },
  { name: 'teacher-profile', title: '我的', icon: 'user-o', path: '/mobile/teacher-center/dashboard', roles: ['teacher'] },
  
  // 园长/Admin端导航
  { name: 'admin-dashboard', title: '首页', icon: 'wap-home-o', path: '/mobile/centers', roles: ['admin', 'principal'] },
  { name: 'admin-business', title: '业务', icon: 'shop-o', path: '/mobile/centers/customer-pool-center', roles: ['admin', 'principal'] },
  { name: 'admin-data', title: '数据', icon: 'chart-trending-o', path: '/mobile/centers/ai-billing-center', roles: ['admin', 'principal'] },
  { name: 'admin-system', title: '系统', icon: 'setting-o', path: '/mobile/centers/settings-center', roles: ['admin', 'principal'] },
  { name: 'admin-profile', title: '我的', icon: 'user-o', path: '/mobile/centers/principal-center', roles: ['admin', 'principal'] }
]

// 根据当前用户角色筛选底部导航
const roleBasedTabs = computed(() => {
  const userRole = userStore.role || 'admin'
  return allTabs.filter(tab => tab.roles.includes(userRole))
})

// 监听路由变化，自动更新活跃标签
watch(
  () => route.path,
  (newPath) => {
    const matchedTab = roleBasedTabs.value.find(tab => newPath.startsWith(tab.path) || newPath === tab.path)
    if (matchedTab) {
      activeTab.value = matchedTab.name
    }
  },
  { immediate: true }
)

const handleBack = () => {
  emit('back')
  router.back()
}

const handleTabChange = (name: string) => {
  const tab = roleBasedTabs.value.find(t => t.name === name)
  if (tab) {
    router.push(tab.path)
  }
}
</script>

<style lang="scss" scoped>
// @use必须在最前面
@use '@/styles/design-tokens.scss' as *;

.role-based-mobile-layout {
  min-height: 100vh;
  background-color: var(--bg-color-page);
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  
  &.with-navbar {
    padding-top: 0; // van-nav-bar已经有placeholder
  }
  
  &.with-tabbar {
    padding-bottom: 0; // van-tabbar已经有placeholder
  }
}

// 顶部导航栏样式
:deep(.van-nav-bar) {
  background: var(--gradient-purple);  // 使用设计令牌渐变
  
  .van-nav-bar__title {
    color: var(--text-inverse);  // 使用设计令牌
    font-weight: var(--font-semibold);
    font-size: 17px;
  }
  
  .van-icon {
    color: var(--text-inverse);
  }
}

// 底部导航栏样式
:deep(.van-tabbar) {
  background-color: var(--bg-card);  // 使用设计令牌
  box-shadow: var(--shadow-lg);       // 使用设计令牌
  border-top: 1px solid var(--border-color);
  
  .van-tabbar-item {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    
    &--active {
      color: var(--primary-color);  // 使用设计令牌
      
      .van-icon {
        color: var(--primary-color);
      }
    }
  }
}

// 暗黑模式适配（不能在scoped中使用&，需要全局选择器）
:global([data-theme="dark"]) {
  .role-based-mobile-layout {
    background-color: var(--bg-page);
    
    .main-content {
      background-color: var(--bg-page);
    }
  }
}
</style>
