<!--
  MobileCenterLayout.vue - 移动端中心子页面布局（含底部导航）
  Mobile Center Sub-Page Layout with Footer Navigation
  
  用于中心详情页面，统一样式、主题切换，同时保持底部导航
-->
<template>
  <div class="mobile-center-layout" :class="themeClass">
    <!-- 头部导航 -->
    <van-nav-bar
      :title="title"
      :border="false"
      fixed
      placeholder
      left-arrow
      @click-left="handleBack"
      :class="['layout-header', isDark ? 'dark-header' : '']"
    >
      <template #right>
        <div class="header-actions">
          <!-- 主题切换 -->
          <div class="action-btn" @click="handleToggleTheme" title="切换主题">
            <van-icon
              :name="isDark ? 'sun-o' : 'star-o'"
              size="20"
              :style="{ color: isDark ? '#fbbf24' : 'var(--text-secondary)' }"
            />
          </div>
          <!-- 自定义右侧按钮 -->
          <slot name="right"></slot>
        </div>
      </template>
    </van-nav-bar>

    <!-- 主内容区 -->
    <div class="layout-content" :class="{ 'with-footer': showFooter }">
      <slot></slot>
    </div>

    <!-- 底部导航 -->
    <van-tabbar
      v-if="showFooter"
      v-model="activeFooterTab"
      fixed
      :class="['layout-tabbar', isDark ? 'dark-tabbar' : '']"
      @change="handleFooterTabChange"
    >
      <van-tabbar-item
        v-for="tab in footerTabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
        :badge="tab.badge"
      >
        {{ tab.label }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { toggleTheme } from '@/utils/theme'

// 类型定义
interface FooterTab {
  name: string
  label: string
  icon: string
  badge?: string | number
  route?: string
}

// Props
interface Props {
  title?: string
  backPath?: string
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '详情',
  backPath: '',
  showFooter: true
})

const emit = defineEmits<{
  'back': []
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 主题状态
const isDark = ref(false)
const themeClass = computed(() => isDark.value ? 'theme-dark' : 'theme-light')

// 当前用户角色
const userRole = computed(() => userStore.user?.role || 'admin')

// 底部导航Tab
const footerTabs = computed<FooterTab[]>(() => {
  const baseTabs: FooterTab[] = [
    { name: 'home', label: '首页', icon: 'wap-home-o', route: '/mobile/centers' },
    { name: 'management', label: '管理', icon: 'setting-o', route: '/mobile/centers/system-center' },
    { name: 'business', label: '业务', icon: 'orders-o', route: '/mobile/centers/enrollment-center' },
    { name: 'teaching', label: '教学', icon: 'notes-o', route: '/mobile/centers/teaching-center' },
    { name: 'profile', label: '我的', icon: 'user-o', route: '/mobile/centers/user-center' }
  ]
  return baseTabs
})

// 当前激活的Tab
const activeFooterTab = ref('home')

// 根据当前路由确定激活的Tab
const detectActiveTab = () => {
  const path = route.path
  if (path.includes('system') || path.includes('user-center')) {
    activeFooterTab.value = 'management'
  } else if (path.includes('enrollment') || path.includes('marketing') || path.includes('activity')) {
    activeFooterTab.value = 'business'
  } else if (path.includes('teaching') || path.includes('assessment') || path.includes('attendance')) {
    activeFooterTab.value = 'teaching'
  } else if (path.includes('profile')) {
    activeFooterTab.value = 'profile'
  } else {
    activeFooterTab.value = 'home'
  }
}

// 检测主题
const detectTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  isDark.value = htmlTheme === 'dark'
}

// 切换主题
const handleToggleTheme = () => {
  toggleTheme()
  setTimeout(detectTheme, 100)
}

// 返回
const handleBack = () => {
  emit('back')
  if (props.backPath) {
    router.push(props.backPath)
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile/centers')
  }
}

// 底部导航切换
const handleFooterTabChange = (tabName: string | number) => {
  const tab = footerTabs.value.find(t => t.name === tabName)
  if (tab?.route) {
    router.push(tab.route)
  }
}

// 监听主题变化
let observer: MutationObserver | null = null

onMounted(() => {
  detectTheme()
  detectActiveTab()
  observer = new MutationObserver(detectTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style lang="scss" scoped>
.mobile-center-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--van-background-2, #f7f8fa);
  transition: all 0.3s ease;

  &.theme-dark {
    // 深色主题：统一页面底色，避免出现“更深藏蓝底”导致明暗不一致
    background-color: #1e293b;
    color: #f1f5f9;
  }
}

// 头部导航
.layout-header {
  background: #ffffff !important;
  border-bottom: 1px solid #e4e7ed !important;

  :deep(.van-nav-bar__content) {
    background: #ffffff !important;
  }

  :deep(.van-nav-bar__title) {
    color: #2c3e50 !important;
    font-weight: 600;
  }

  :deep(.van-nav-bar__left .van-icon) {
    color: #2c3e50 !important;
  }

  &.dark-header {
    background: #1e293b !important;
    border-bottom: 1px solid #334155 !important;

    :deep(.van-nav-bar__content) {
      background: #1e293b !important;
    }

    :deep(.van-nav-bar__title) {
      color: #f1f5f9 !important;
    }

    :deep(.van-nav-bar__left .van-icon) {
      color: #94a3b8 !important;
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.05);
  }
}

// 内容区
.layout-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  // 防止内容区透明导致露出 body 的背景（看起来像“深蓝叠色/透明”）
  background-color: var(--van-background-2, #f7f8fa);
  
  &.with-footer {
    padding-bottom: 60px; // 为底部导航留空间
  }
}

// 底部导航
.layout-tabbar {
  // 注意：class 会直接挂在 van-tabbar 根节点上（同一个元素就是 .van-tabbar）
  // 所以这里必须直接设置 .layout-tabbar 自身，而不是写成 :deep(.van-tabbar)
  background: #ffffff !important;
  border-top: 1px solid #e4e7ed !important;

  :deep(.van-tabbar-item) {
    background: transparent !important;
    
    &.van-tabbar-item--active {
      background: transparent !important;
    }
  }

  &.dark-tabbar {
    background: #1e293b !important;
    border-top: 1px solid #334155 !important;

    :deep(.van-tabbar-item) {
      color: #94a3b8 !important;
      background: transparent !important;

      &.van-tabbar-item--active {
        color: var(--van-primary-color) !important;
        background: transparent !important;
      }
    }
  }
}

// 暗黑主题全局样式
.theme-dark {
  // 页面背景统一
  background-color: #1e293b !important;
  
  // 子页面容器背景
  :deep(.mobile-center-layout-content) {
    background: #1e293b !important;
  }
  
  // 统一 Vant 背景变量
  --van-background: #1e293b;
  --van-background-2: #1e293b;
  --van-text-color: #f1f5f9;
  --van-text-color-2: #cbd5e1;
  --van-text-color-3: #94a3b8;
  --van-border-color: #334155;
  
  :deep(.van-cell-group) {
    background: #1e293b !important;
    
    .van-cell {
      background: #1e293b !important;
      
      &::after {
        border-color: #334155 !important;
      }
    }
    
    .van-cell__title, .van-cell__value {
      color: #f1f5f9 !important;
    }
    
    .van-cell__label {
      color: #94a3b8 !important;
    }
  }

  :deep(.van-grid-item__content) {
    background: #1e293b !important;
    border-color: #334155 !important;
  }
  
  :deep(.van-tabs__nav) {
    background: #1e293b !important;
  }
  
  :deep(.van-tab) {
    color: #94a3b8 !important;
    
    &.van-tab--active {
      color: var(--van-primary-color) !important;
    }
  }

  :deep(.van-search) {
    background: #1e293b !important;
    
    .van-search__content {
      background: #1e293b !important;
    }
    
    .van-field__control {
      color: #f1f5f9 !important;
      
      &::placeholder {
        color: #64748b !important;
      }
    }
  }

  :deep(.van-dropdown-menu) {
    .van-dropdown-menu__bar {
      background: #1e293b !important;
    }
    
    .van-dropdown-menu__title {
      color: #f1f5f9 !important;
    }
  }

  :deep(.van-list) {
    background: #1e293b !important;
  }

  :deep(.van-empty) {
    .van-empty__description {
      color: #94a3b8 !important;
    }
  }

  :deep(.van-tag) {
    opacity: 0.9;
  }

  :deep(.van-button--plain) {
    background: transparent !important;
  }

  :deep(.van-progress) {
    .van-progress__portion {
      background: var(--van-primary-color) !important;
    }
  }

  // 强制覆盖底部导航栏选中项背景
  :deep(.layout-tabbar.dark-tabbar .van-tabbar-item),
  :deep(.layout-tabbar.dark-tabbar .van-tabbar-item--active) {
    background: transparent !important;
    background-color: transparent !important;
  }
  
  :deep(.layout-tabbar.dark-tabbar .van-tabbar-item__wrapper) {
    background: transparent !important;
    background-color: transparent !important;
  }
}

// 明亮主题全局样式
.theme-light {
  // 页面背景统一
  background-color: #f7f8fa !important;
  
  // 子页面容器背景
  :deep(.mobile-center-layout-content) {
    background: #f7f8fa !important;
  }
  
  // 统一 Vant 背景变量
  --van-background: #ffffff;
  --van-background-2: #f7f8fa;
  --van-text-color: #323233;
  --van-text-color-2: #646566;
  --van-text-color-3: #969799;
  --van-border-color: #ebedf0;
  
  :deep(.van-cell-group) {
    background: #ffffff !important;
  }
  
  :deep(.van-grid-item__content) {
    background: #ffffff !important;
  }
  
  :deep(.van-tabs__nav) {
    background: #ffffff !important;
  }
}
</style>

