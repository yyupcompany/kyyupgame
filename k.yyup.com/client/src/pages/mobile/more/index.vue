<template>
  <div class="more-page">
    <!-- 页面标题 -->
    <van-nav-bar
      title="更多功能"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 搜索框 -->
    <div class="search-section">
      <van-search
        v-model="searchText"
        placeholder="搜索功能"
        shape="round"
        background="var(--bg-color)"
      />
    </div>

    <!-- 功能分类Tab -->
    <van-tabs v-model:active="activeCategoryTab" class="category-tabs">
      <van-tab
        v-for="category in filteredCategories"
        :key="category.id"
        :title="category.title"
        :name="category.id"
      >
        <div class="category-content">
          <!-- 功能网格 -->
          <div class="function-grid">
            <div
              v-for="item in getFilteredItems(category.items)"
              :key="item.id"
              class="function-item"
              @click="navigateTo(item.path)"
            >
              <div class="function-icon" :style="{ background: item.bgColor }">
                <van-icon :name="item.icon" size="28" :color="item.iconColor" />
                <van-badge
                  v-if="item.badge"
                  :content="item.badge"
                  :offset="[-4, 8]"
                />
              </div>
              <div class="function-label">{{ item.title }}</div>
            </div>
          </div>

          <!-- 空状态 -->
          <van-empty
            v-if="!getFilteredItems(category.items).length"
            description="没有找到相关功能"
          />
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DrawerMenuItem } from '@/config/mobile-navigation.types'
import { getMobileNavigationConfig } from '@/config/mobile-navigation.config'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 搜索文本
const searchText = ref('')

// 当前激活的分类Tab
const activeCategoryTab = ref('business-management')

// 当前用户角色
const userRole = computed(() => {
  return (userStore.user?.role as any) || 'parent'
})

// 获取导航配置
const navigationConfig = computed(() => {
  return getMobileNavigationConfig(userRole.value)
})

// 所有功能分类（从导航配置获取）
const allCategories = computed(() => {
  return navigationConfig.value.drawerMenu?.categories || []
})

// 增强功能项（添加颜色等样式）
const enhancedCategories = computed(() => {
  const colorSets = [
    { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', icon: '#ff6b6b' },
    { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', icon: '#4ecdc4' },
    { bg: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', icon: '#9b59b6' },
    { bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', icon: '#f39c12' },
    { bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', icon: '#3498db' },
    { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', icon: '#e67e22' },
    { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', icon: '#e74c3c' },
    { bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', icon: '#1abc9c' }
  ]

  return allCategories.value.map((category, catIndex) => ({
    ...category,
    items: category.items.map((item, itemIndex) => {
      const colorIndex = (catIndex * 10 + itemIndex) % colorSets.length
      const colorSet = colorSets[colorIndex] || colorSets[0]
      return {
        ...item,
        bgColor: colorSet.bg,
        iconColor: colorSet.icon
      }
    })
  }))
})

// 根据搜索文本过滤分类
const filteredCategories = computed(() => {
  if (!searchText.value.trim()) {
    return enhancedCategories.value
  }

  const searchLower = searchText.value.toLowerCase()

  return enhancedCategories.value.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    )
  })).filter(category => category.items.length > 0)
})

// 获取过滤后的功能项
const getFilteredItems = (items: DrawerMenuItem[]) => {
  if (!searchText.value.trim()) {
    return items
  }

  const searchLower = searchText.value.toLowerCase()
  return items.filter(item =>
    item.title.toLowerCase().includes(searchLower) ||
    (item.description && item.description.toLowerCase().includes(searchLower))
  )
}

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.more-page {
  min-height: 100vh;
  background: var(--bg-color-page);
  padding-bottom: env(safe-area-inset-bottom);
}

// 搜索区域
.search-section {
  background: var(--bg-color);
  padding: var(--app-gap-sm) var(--app-gap);
  position: sticky;
  top: 0;
  z-index: 10;
}

// 分类Tab
.category-tabs {
  background: var(--bg-color);

  :deep(.van-tabs__nav) {
    padding: 0 var(--app-gap);
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0 var(--app-gap);
  }

  :deep(.van-tabs__content) {
    background: var(--bg-color-page);
  }
}

// 分类内容
.category-content {
  padding: var(--app-gap);
  min-height: calc(100vh - 200px);
}

// 功能网格
.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--app-gap);
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--app-gap-xs);
  padding: var(--app-gap);
  background: var(--bg-color);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-duration-fast) var(--transition-timing-ease);

  &:active {
    transform: scale(0.95);
  }

  .function-icon {
    position: relative;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
  }

  .function-label {
    font-size: var(--text-xs);
    color: var(--text-primary);
    text-align: center;
    line-height: 1.3;
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .more-page {
    background: var(--bg-color-page-dark);
  }

  .function-item {
    background: var(--bg-color-light-dark);
  }

  .category-tabs {
    :deep(.van-tabs__content) {
      background: var(--bg-color-page-dark);
    }
  }
}
</style>
