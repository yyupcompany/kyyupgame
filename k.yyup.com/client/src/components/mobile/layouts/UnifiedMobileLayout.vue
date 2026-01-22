<!--
  UnifiedMobileLayout.vue - 统一移动端布局组件
  Unified Mobile Layout Component
  
  功能特性:
  1. 统一的头部导航（AI助手、主题切换、通知）
  2. 可滚动的内容区域
  3. 底部导航栏（根据角色动态配置）
  4. 抽屉式中心列表
  5. 完整的明亮/暗黑主题支持
-->
<template>
  <div class="unified-mobile-layout" :class="themeClass">
    <!-- 头部导航 -->
    <van-nav-bar
      :title="title"
      :border="false"
      fixed
      placeholder
      :class="['layout-header', isDark ? 'dark-header' : '']"
    >
      <template #left>
        <van-icon
          v-if="showBack"
          name="arrow-left"
          size="20"
          @click="handleBack"
          :style="{ color: isDark ? '#94a3b8' : 'inherit' }"
        />
        <div v-else class="header-logo" :style="{ color: isDark ? '#f1f5f9' : 'var(--primary-color)' }">
          {{ title || '智慧园所' }}
        </div>
      </template>
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
          <!-- AI助手 -->
          <div class="action-btn ai-btn" @click="handleAIClick">
            <van-icon name="chat-o" size="20" />
          </div>
          <!-- 通知 -->
          <div class="action-btn" @click="handleNotificationClick">
            <van-badge :content="notificationCount > 0 ? notificationCount : ''" :max="99">
              <van-icon
                name="bell-o"
                size="20"
                :style="{ color: isDark ? '#94a3b8' : 'var(--text-secondary)' }"
              />
            </van-badge>
          </div>
        </div>
      </template>
    </van-nav-bar>

    <!-- 主内容区 -->
    <div class="layout-content" :style="{ background: isDark ? '#0f172a' : 'var(--bg-color-page)' }">
      <slot></slot>
    </div>

    <!-- 底部导航 -->
    <van-tabbar
      v-model="internalActiveTab"
      fixed
      :class="['layout-tabbar', isDark ? 'dark-tabbar' : '']"
      :style="{
        '--van-tabbar-background': isDark ? '#1e293b' : '#ffffff',
        background: isDark ? '#1e293b !important' : '#ffffff'
      }"
      @change="handleTabChange"
    >
      <van-tabbar-item
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
        :badge="tab.badge"
      >
        {{ tab.label }}
      </van-tabbar-item>
    </van-tabbar>

    <!-- 中心列表抽屉 -->
    <van-popup
      v-model:show="showDrawer"
      position="bottom"
      round
      :style="{ 
        maxHeight: '70%',
        background: isDark ? '#1e293b' : '#ffffff'
      }"
    >
      <div class="drawer-content">
        <div class="drawer-header">
          <span class="drawer-title" :style="{ color: isDark ? '#f1f5f9' : 'var(--text-primary)' }">
            {{ currentCategoryTitle }}
          </span>
          <van-icon name="cross" size="20" @click="closeDrawer" />
        </div>
        <div class="drawer-body">
          <div
            v-for="center in currentCenters"
            :key="center.route"
            class="center-item"
            :style="{
              background: isDark ? '#334155' : '#f8fafc',
              borderColor: isDark ? '#475569' : '#e4e7ed'
            }"
            @click="navigateToCenter(center)"
          >
            <div class="center-icon" :style="{ background: `${center.color}20` }">
              <van-icon :name="center.icon" size="24" :color="center.color" />
            </div>
            <div class="center-info">
              <div class="center-name" :style="{ color: isDark ? '#f1f5f9' : '#2c3e50' }">
                {{ center.name }}
              </div>
              <div class="center-desc" :style="{ color: isDark ? '#94a3b8' : '#8492a6' }">
                {{ center.desc }}
              </div>
            </div>
            <van-icon name="arrow" size="16" :color="isDark ? '#64748b' : '#c0c4cc'" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { toggleTheme } from '@/utils/theme'

// 类型定义
interface TabItem {
  name: string
  label: string
  icon: string
  badge?: string | number
  centers?: CenterItem[]
}

interface CenterItem {
  name: string
  desc: string
  icon: string
  route: string
  color: string
}

// Props
interface Props {
  title?: string
  showBack?: boolean
  activeTab?: string
  tabs?: TabItem[]
  notificationCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '智慧园所',
  showBack: false,
  activeTab: 'home',
  tabs: () => [],
  notificationCount: 0
})

const emit = defineEmits<{
  'back': []
  'tab-change': [tab: string]
  'ai-click': []
  'notification-click': []
}>()

const router = useRouter()
const route = useRoute()

// 主题状态
const isDark = ref(false)
const themeClass = computed(() => isDark.value ? 'theme-dark' : 'theme-light')

// 检测主题
const detectTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  isDark.value = htmlTheme === 'dark'
}

// 切换主题
const handleToggleTheme = () => {
  toggleTheme()
  setTimeout(() => {
    detectTheme()
    showToast(`已切换到${isDark.value ? '暗黑' : '明亮'}模式`)
  }, 100)
}

// Tab 状态
const internalActiveTab = ref(props.activeTab)
const showDrawer = ref(false)
const currentCategoryTitle = ref('')
const currentCenters = ref<CenterItem[]>([])

// 监听外部 activeTab 变化
watch(() => props.activeTab, (newTab) => {
  if (newTab && newTab !== internalActiveTab.value) {
    internalActiveTab.value = newTab
  }
})

// 处理 Tab 切换
const handleTabChange = (tabName: string | number) => {
  const tab = props.tabs.find(t => t.name === tabName)
  if (tab && tab.centers && tab.centers.length > 0) {
    // 有中心列表，显示抽屉
    currentCategoryTitle.value = tab.label
    currentCenters.value = tab.centers
    showDrawer.value = true
  } else if (tab) {
    emit('tab-change', String(tabName))
  }
}

// 关闭抽屉
const closeDrawer = () => {
  showDrawer.value = false
}

// 导航到中心
const navigateToCenter = (center: CenterItem) => {
  showDrawer.value = false
  router.push(center.route)
}

// 返回
const handleBack = () => {
  emit('back')
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile/centers')
  }
}

// AI 助手
const handleAIClick = () => {
  emit('ai-click')
  router.push('/mobile/centers/ai-center')
}

// 通知
const handleNotificationClick = () => {
  emit('notification-click')
  router.push('/mobile/centers/notification-center')
}

onMounted(() => {
  detectTheme()
  // 监听主题变化
  const observer = new MutationObserver(detectTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.unified-mobile-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color-page);
  transition: all 0.3s ease;

  &.theme-dark {
    // 深色主题：统一页面底色，避免出现“更深藏蓝底”导致明暗不一致
    background: #1e293b;
    color: #f1f5f9;
    
    // 统一 Vant 背景变量
    --van-background: #1e293b;
    --van-background-2: #1e293b;
    --van-text-color: #f1f5f9;
    --van-text-color-2: #cbd5e1;
    --van-text-color-3: #94a3b8;
    --van-border-color: #334155;
    
    // 内容区域背景
    .layout-content {
      background: #1e293b !important;
    }
    
    // Vant 组件样式统一
    :deep(.van-grid-item__content) {
      background: #1e293b !important;
    }
    
    :deep(.van-cell-group) {
      background: #1e293b !important;
    }
    
    :deep(.van-card) {
      background: #1e293b !important;
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
}

// 头部样式
.header-logo {
  font-size: 18px;
  font-weight: 600;
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
    transform: scale(0.9);
    background: rgba(0, 0, 0, 0.05);
  }

  &.ai-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .van-icon {
      color: white !important;
    }
  }
}

// 内容区
.layout-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 70px; // 为底部导航留空间
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  // 防止内容区透明导致露出 body 的背景（看起来像“深蓝叠色/透明”）
  background-color: var(--van-background-2, var(--bg-color-page, #f7f8fa));
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

    :deep(.van-nav-bar__left),
    :deep(.van-nav-bar__right) {
      .van-icon {
        color: #94a3b8 !important;
      }
    }
  }
}

// 底部导航
.layout-tabbar {
  transition: all 0.3s ease;

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
        color: var(--primary-color) !important;
        background: transparent !important;
      }
    }
  }
}

// 抽屉样式
.drawer-content {
  padding: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-light);

  .drawer-title {
    font-size: 16px;
    font-weight: 600;
  }

  .van-icon {
    cursor: pointer;
    color: var(--text-secondary);
  }
}

.drawer-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 50vh;
  overflow-y: auto;
}

.center-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.center-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.center-info {
  flex: 1;
  min-width: 0;
}

.center-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.center-desc {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
