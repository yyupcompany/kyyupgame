<template>
  <div class="role-based-mobile-layout">
    <!-- 导航栏 -->
    <van-nav-bar
      v-if="showNavBar"
      :title="title"
      :left-arrow="showBack"
      :left-text="backText"
      :border="false"
      :placeholder="true"
      :fixed="true"
      :safe-area-inset-top="true"
      @click-left="handleBack"
    >
      <template #left v-if="!showBack">
        <slot name="nav-left" />
      </template>
      <template #right>
        <slot name="nav-right" />
      </template>
    </van-nav-bar>

    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'with-nav-bar': showNavBar, 'with-tab-bar': showTabBar }">
      <slot />
    </div>

    <!-- 底部标签栏 -->
    <van-tabbar
      v-if="showTabBar"
      v-model="activeTab"
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-bottom="true"
      @change="handleTabChange"
    >
      <van-tabbar-item
        v-for="tab in tabBarItems"
        :key="tab.name"
        :icon="tab.icon"
        :name="tab.name"
        :to="tab.to"
        :badge="tab.badge"
      >
        {{ tab.text }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 组件属性
interface Props {
  title?: string
  showNavBar?: boolean
  showBack?: boolean
  showTabBar?: boolean
  backText?: string
  customTabBar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showNavBar: true,
  showBack: true,
  showTabBar: false,
  backText: '返回',
  customTabBar: false
})

// 组件事件
interface Emits {
  (e: 'back'): void
  (e: 'tab-change', name: string): void
}

const emit = defineEmits<Emits>()

// 组合式API
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const activeTab = ref('')

// 计算属性
const tabBarItems = computed(() => {
  const userRole = userStore.userInfo?.role || 'parent'

  // 根据用户角色返回不同的底部导航
  const baseItems = [
    {
      name: 'home',
      icon: 'home-o',
      text: '首页',
      to: '/mobile/centers'
    }
  ]

  const roleItems = {
    admin: [
      {
        name: 'enrollment',
        icon: 'friends-o',
        text: '招生',
        to: '/mobile/enrollment'
      },
      {
        name: 'activity',
        icon: 'calendar-o',
        text: '活动',
        to: '/mobile/activity/activity-index'
      },
      {
        name: 'finance',
        icon: 'balance-o',
        text: '财务',
        to: '/mobile/finance/finance-index'
      },
      {
        name: 'ai',
        icon: 'bulb-o',
        text: 'AI',
        to: '/mobile/ai/ai-index'
      }
    ],
    principal: [
      {
        name: 'enrollment',
        icon: 'friends-o',
        text: '招生',
        to: '/mobile/enrollment'
      },
      {
        name: 'activity',
        icon: 'calendar-o',
        text: '活动',
        to: '/mobile/activity/activity-index'
      },
      {
        name: 'finance',
        icon: 'balance-o',
        text: '财务',
        to: '/mobile/finance/finance-index'
      },
      {
        name: 'ai',
        icon: 'bulb-o',
        text: 'AI',
        to: '/mobile/ai/ai-index'
      }
    ],
    teacher: [
      {
        name: 'teacher',
        icon: 'user-o',
        text: '工作台',
        to: '/mobile/teacher-center/dashboard'
      },
      {
        name: 'enrollment',
        icon: 'friends-o',
        text: '招生',
        to: '/mobile/teacher-center/enrollment'
      },
      {
        name: 'activity',
        icon: 'calendar-o',
        text: '活动',
        to: '/mobile/teacher-center/activities'
      }
    ],
    parent: [
      {
        name: 'parent',
        icon: 'contact',
        text: '我的',
        to: '/mobile/parent-center/dashboard'
      },
      {
        name: 'activities',
        icon: 'calendar-o',
        text: '活动',
        to: '/mobile/parent-center/activities'
      },
      {
        name: 'ai-assistant',
        icon: 'bulb-o',
        text: 'AI助手',
        to: '/mobile/parent-center/ai-assistant'
      }
    ]
  }

  return [...baseItems, ...(roleItems[userRole as keyof typeof roleItems] || roleItems.parent)]
})

// 方法
const handleBack = () => {
  emit('back')
  if (route.meta?.backPath) {
    router.push(route.meta.backPath as string)
  } else {
    router.back()
  }
}

const handleTabChange = (name: string) => {
  emit('tab-change', name)
}

// 生命周期
onMounted(() => {
  // 根据当前路由设置活动标签
  const currentPath = route.path
  const matchedTab = tabBarItems.value.find(tab =>
    currentPath.includes(tab.to) || tab.to.includes(currentPath)
  )
  if (matchedTab) {
    activeTab.value = matchedTab.name
  }
})
</script>

<style scoped lang="scss">
.role-based-mobile-layout {
  min-height: 100vh;
  background: var(--van-background-color-light);
  position: relative;

  .main-content {
    padding: 0;

    &.with-nav-bar {
      padding-top: var(--van-nav-bar-height);
    }

    &.with-tab-bar {
      padding-bottom: var(--van-tabbar-height);
    }
  }

  :deep(.van-nav-bar) {
    background: var(--van-primary-color);
    color: white;

    .van-nav-bar__title {
      color: white;
      font-weight: 600;
    }

    .van-nav-bar__text {
      color: white;
    }

    .van-icon {
      color: white;
    }
  }

  :deep(.van-tabbar) {
    background: white;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }
}

// 响应式适配
@media (min-width: 768px) {
  .role-based-mobile-layout {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>