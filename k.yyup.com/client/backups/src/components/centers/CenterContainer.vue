<template>
  <!-- 骨架屏（不再额外包一层容器） -->
  <div v-if="isSkeletonVisible" class="center-skeleton">
    <div class="skeleton-header" v-if="showHeader || showActions || (tabs && tabs.length > 0)">
      <div class="skeleton-title skeleton" v-if="showHeader"></div>
      <div class="skeleton-tabs" v-if="tabs && tabs.length > 0">
        <div v-for="i in Math.min(tabs.length, 4)" :key="i" class="skeleton-tab skeleton"></div>
      </div>
      <div class="skeleton-actions">
        <div class="skeleton-button skeleton"></div>
      </div>
    </div>
    <div class="skeleton-content">
      <slot name="skeleton">
        <!-- 默认骨架屏内容 -->
        <div class="skeleton-grid skeleton-grid-4">
          <div v-for="i in 4" :key="`card-${i}`" class="skeleton-card skeleton"></div>
        </div>
        <div class="skeleton-list">
          <div v-for="i in 3" :key="`list-${i}`" class="skeleton-list-item">
            <div class="skeleton-list-avatar skeleton-avatar skeleton"></div>
            <div class="skeleton-list-content">
              <div class="skeleton-title skeleton"></div>
              <div class="skeleton-text skeleton"></div>
              <div class="skeleton-text skeleton"></div>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>

  <!-- 实际内容（直接输出为与工作台同级的结构） -->
  <template v-else>
    <!-- 顶部导航栏 -->
    <div class="center-header" v-if="showHeader">
      <div class="center-header-left">
        <h1 class="center-title" v-if="showTitle">{{ title }}</h1>
        <el-breadcrumb separator="/" class="center-breadcrumb" v-if="showBreadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="center-header-right">
        <slot name="header-actions">
          <!-- 默认的头部操作按钮 -->
          <el-button type="primary" :icon="Plus" @click="$emit('create')">
            新建
          </el-button>
        </slot>
      </div>
    </div>

    <!-- 简化的头部操作栏（当不显示完整头部时） -->
    <div class="center-actions" v-else-if="showActions">
      <div class="center-actions-right">
        <slot name="header-actions">
          <!-- 默认的头部操作按钮 -->
          <el-button type="primary" :icon="Plus" @click="$emit('create')">
            新建
          </el-button>
        </slot>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="center-tabs" v-if="tabs && tabs.length > 0">
      <el-tabs
        v-model="activeTab"
        @tab-change="handleTabChange"
        class="center-tabs-container"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.key"
          :label="tab.label"
          :name="tab.key"
          :lazy="lazyTabs"
        >
          <!-- 标签页内容需要包装在 center-content 中以支持滚动 -->
          <div class="center-content">
            <!-- 标签页内容插槽 -->
            <slot :name="`tab-${tab.key}`" :tab="tab">
              <div class="tab-content-placeholder">
                {{ tab.label }} 内容区域
              </div>
            </slot>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 主要内容区域 -->
    <div class="center-content" v-else>
      <slot name="content">
        <div class="content-placeholder">
          内容区域
        </div>
      </slot>
    </div>

    <!-- 底部操作区域 -->
    <div class="center-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="center-loading">
      <el-loading
        :visible="loading"
        text="加载中..."
        background="var(--black-alpha-70)"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

interface Tab {
  key: string
  label: string
  icon?: string
  disabled?: boolean
}

interface Props {
  title: string
  tabs?: Tab[]
  defaultTab?: string
  activeTab?: string
  loading?: boolean
  showHeader?: boolean
  showTitle?: boolean
  showBreadcrumb?: boolean
  showActions?: boolean
  syncUrl?: boolean
  showSkeleton?: boolean
  skeletonDelay?: number
  lazyTabs?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [],
  defaultTab: '',
  activeTab: '',
  loading: false,
  showHeader: false,
  showTitle: false,
  showBreadcrumb: false,
  showActions: true,
  syncUrl: true,
  showSkeleton: false,
  skeletonDelay: 0,
  lazyTabs: true
})

const emit = defineEmits<{
  create: []
  tabChange: [tabKey: string]
  'update:activeTab': [tabKey: string]
}>()

const route = useRoute()
const router = useRouter()

// 当前激活的标签页
const activeTab = ref<string>('')

// 初始化激活标签页
const initActiveTab = () => {
  // 优先使用 props.activeTab
  if (props.activeTab && props.tabs.some(tab => tab.key === props.activeTab)) {
    activeTab.value = props.activeTab
    return
  }

  // 只在启用URL同步时才从URL参数获取
  if (props.syncUrl) {
    const tabFromQuery = route.query.tab as string
    if (tabFromQuery && props.tabs.some(tab => tab.key === tabFromQuery)) {
      activeTab.value = tabFromQuery
      return
    }
  }

  // 使用默认标签页
  if (props.defaultTab && props.tabs.some(tab => tab.key === props.defaultTab)) {
    activeTab.value = props.defaultTab
  }
  // 最后使用第一个标签页
  else if (props.tabs.length > 0) {
    activeTab.value = props.tabs[0].key
  }
}

// 处理标签页切换
const handleTabChange = (tabKey: string) => {
  activeTab.value = tabKey

  // 只在启用URL同步时才更新URL参数
  if (props.syncUrl) {
    router.push({
      ...route,
      query: {
        ...route.query,
        tab: tabKey
      }
    })
  }

  // 触发事件
  emit('update:activeTab', tabKey)
  emit('tabChange', tabKey)
}

// 监听 props.activeTab 变化
watch(() => props.activeTab, (newTab) => {
  if (newTab && props.tabs.some(tab => tab.key === newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
})

// 只在启用URL同步时才监听路由变化
watch(() => route.query.tab, (newTab) => {
  if (props.syncUrl && newTab && typeof newTab === 'string' && props.tabs.some(tab => tab.key === newTab)) {
    activeTab.value = newTab
  }
})

// 监听tabs变化
watch(() => props.tabs, () => {
  initActiveTab()
}, { immediate: true })

// 控制骨架屏显示的响应式变量
const isSkeletonVisible = ref(props.showSkeleton)

// 监听 showSkeleton prop 的变化
watch(() => props.showSkeleton, (newVal) => {
  if (newVal && props.skeletonDelay > 0) {
    // 如果设置了延迟，则延迟显示骨架屏
    setTimeout(() => {
      isSkeletonVisible.value = true
    }, props.skeletonDelay)
  } else {
    isSkeletonVisible.value = newVal
  }
}, { immediate: true })

onMounted(() => {
  initActiveTab()
})
</script>

<style scoped lang="scss">
// 导入全局样式变量
@import '@/styles/design-tokens.scss';

.center-container {
  // 应用与工作台一致的背景色
  min-height: 100vh;
  background: var(--bg-secondary, var(--bg-container));
  padding: var(--spacing-lg);
  position: relative;
  width: 100%;
  max-width: none;
  overflow-x: hidden;

  // 🎯 玻璃态效果 - 与工作台保持一致
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 10% 20%, var(--white-alpha-10) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, var(--white-alpha-10) 0%, transparent 20%);
    pointer-events: none;
    z-index: -1;
  }
}

.scaled-card {
  display: flex;
  flex-direction: column;
  min-height: 320px; /* 从400px减少到320px，提升信息密度 */
  max-height: calc(100vh - 100px); /* 从120px减少到100px，增加可视区域 */
  /* 统一所有中心的背景，使用Element Plus主题系统 */
  background: var(--center-bg, var(--el-bg-color));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden; /* 改为hidden，让内容区域处理滚动 */
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: none;

  // 移除zoom缩放，改为真正的响应式布局
  // 让容器能够随浏览器窗口完全扩展，就像dashboard页面一样
  @media (max-width: var(--breakpoint-sm)) {
    border-radius: var(--radius-md);
    min-height: 280px; /* 移动端进一步减少最小高度 */
    max-height: calc(100vh - 80px); /* 移动端调整最大高度 */
  }
}

.center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-sm) var(--text-lg); /* 从var(--text-lg) var(--text-3xl)减少到var(--text-sm) var(--text-lg)，更紧凑 */
  border-bottom: var(--border-width-base) solid var(--border-color);
  background: var(--bg-tertiary);

  .center-header-left {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .center-title {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  .center-breadcrumb {
    font-size: var(--text-base);
  }

  .center-header-right {
    display: flex;
    gap: var(--text-sm);
    align-items: center;
  }
}

// 简化的操作栏样式
.center-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: var(--text-sm) var(--text-lg); /* 从var(--text-lg) var(--text-3xl)减少到var(--text-sm) var(--text-lg)，更紧凑 */
  background: var(--bg-color);
  border-bottom: var(--border-width-base) solid var(--border-color);

  .center-actions-right {
    display: flex;
    gap: var(--text-sm);
    align-items: center;
  }
}

.center-tabs {
  /* 移除容器的底部边框，避免与tab项边框重复 */

  .center-tabs-container {
    padding: 0 var(--text-lg); /* 从var(--text-3xl)减少到var(--text-lg) */

    :deep(.el-tabs__header) {
      margin: 0;
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        display: none;
      }
    }

    :deep(.el-tabs__item) {
      padding: 0 var(--text-2xl);
      height: var(--button-height-xl);
      line-height: var(--button-height-xl);
      font-size: var(--text-base);
      color: var(--text-secondary);
      border-bottom: 2px solid var(--border-color);
      transition: all 0.2s ease;

      &.is-active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.center-content {
  /* 与工作台保持一致：不在组件内强制滚动高度与裁剪，由页面自然流动 */
  padding: var(--spacing-lg) !important; /* 工作台同款内边距 */
  overflow: visible; /* 让内容自然伸展 */
  width: 100%;
  height: auto;
  min-height: 0;
  max-width: none;
}


.tab-content-placeholder,
.content-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-size: var(--text-sm);
  background: var(--bg-tertiary);
  border: var(--border-width-base) dashed var(--border-color);
  border-radius: var(--radius-md);
}

.center-footer {
  padding: var(--text-sm) var(--text-lg); /* 从var(--text-lg) var(--text-3xl)减少到var(--text-sm) var(--text-lg)，更紧凑 */
  border-top: var(--border-width-base) solid var(--border-color);
  background: var(--bg-tertiary);
}

.center-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .center-header {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;

    .center-header-right {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .center-tabs-container {
    padding: 0 var(--text-sm); /* 移动端进一步减少内边距 */
  }

  .center-content {
    padding: var(--spacing-md) !important; /* 移动端适当减少，但保持合理的留边 */
  }
}
</style>
