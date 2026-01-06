<template>
  <div class="tab-container">
    <!-- 标签页导航 -->
    <div class="tab-nav">
      <div class="tab-nav-wrapper">
        <div 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="[
            'tab-item',
            { 'tab-item--active': activeTab === tab.key },
            { 'tab-item--disabled': tab.disabled }
          ]"
          @click="handleTabClick(tab)"
        >
          <el-icon v-if="tab.icon" class="tab-icon">
            <component :is="tab.icon" />
          </el-icon>
          <span class="tab-label">{{ tab.label }}</span>
          <el-badge 
            v-if="tab.badge" 
            :value="tab.badge" 
            :max="99"
            class="tab-badge"
          />
        </div>
      </div>
      
      <!-- 标签页操作按钮 -->
      <div class="tab-actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content">
      <transition 
        :name="transitionName" 
        mode="out-in"
        @before-enter="onBeforeEnter"
        @after-enter="onAfterEnter"
      >
        <div 
          :key="activeTab" 
          class="tab-pane"
          v-loading="loading"
          :element-loading-text="loadingText"
        >
          <slot 
            :name="`tab-${activeTab}`" 
            :tab="currentTab"
            :isActive="true"
          >
            <!-- 默认内容 -->
            <div class="tab-default-content">
              <el-empty 
                :description="`${currentTab?.label || '当前标签页'} 内容开发中...`"
                :image-size="120"
              />
            </div>
          </slot>
        </div>
      </transition>
    </div>

    <!-- 标签页底部 -->
    <div class="tab-footer" v-if="$slots.footer">
      <slot name="footer" :tab="currentTab"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Tab {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  badge?: number | string
  lazy?: boolean
}

interface Props {
  tabs: Tab[]
  activeTab?: string
  defaultTab?: string
  loading?: boolean
  loadingText?: string
  transition?: string
  keepAlive?: boolean
  syncUrl?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: '',
  defaultTab: '',
  loading: false,
  loadingText: '加载中...',
  transition: 'tab-slide',
  keepAlive: false,
  syncUrl: true
})

const emit = defineEmits<{
  'update:activeTab': [tabKey: string]
  change: [tabKey: string, tab: Tab]
  beforeChange: [tabKey: string, tab: Tab]
  afterChange: [tabKey: string, tab: Tab]
}>()

const route = useRoute()
const router = useRouter()

// 当前激活的标签页
const activeTab = ref<string>(props.activeTab || '')

// 过渡动画名称
const transitionName = ref(props.transition)

// 当前标签页对象
const currentTab = computed(() => {
  return props.tabs.find(tab => tab.key === activeTab.value)
})

// 初始化激活标签页
const initActiveTab = () => {
  let targetTab = ''
  
  // 如果启用URL同步，优先从URL参数获取
  if (props.syncUrl) {
    const tabFromQuery = route.query.tab as string
    if (tabFromQuery && props.tabs.some(tab => tab.key === tabFromQuery && !tab.disabled)) {
      targetTab = tabFromQuery
    }
  }
  
  // 其次使用默认标签页
  if (!targetTab && props.defaultTab && props.tabs.some(tab => tab.key === props.defaultTab && !tab.disabled)) {
    targetTab = props.defaultTab
  }
  
  // 最后使用第一个可用标签页
  if (!targetTab) {
    const firstAvailableTab = props.tabs.find(tab => !tab.disabled)
    if (firstAvailableTab) {
      targetTab = firstAvailableTab.key
    }
  }
  
  if (targetTab && targetTab !== activeTab.value) {
    activeTab.value = targetTab
  }
}

// 处理标签页点击
const handleTabClick = (tab: Tab) => {
  if (tab.disabled || tab.key === activeTab.value) {
    return
  }
  
  // 触发切换前事件
  emit('beforeChange', tab.key, tab)
  
  // 设置过渡动画方向
  const currentIndex = props.tabs.findIndex(t => t.key === activeTab.value)
  const targetIndex = props.tabs.findIndex(t => t.key === tab.key)
  transitionName.value = targetIndex > currentIndex ? 'tab-slide-left' : 'tab-slide-right'
  
  // 切换标签页
  activeTab.value = tab.key

  // 触发v-model更新
  emit('update:activeTab', tab.key)

  // 同步URL
  if (props.syncUrl) {
    router.push({
      ...route,
      query: {
        ...route.query,
        tab: tab.key
      }
    })
  }

  // 触发切换事件
  emit('change', tab.key, tab)
}

// 过渡动画钩子
const onBeforeEnter = () => {
  // 可以在这里添加进入前的逻辑
}

const onAfterEnter = () => {
  // 触发切换后事件
  if (currentTab.value) {
    emit('afterChange', activeTab.value, currentTab.value)
  }
}

// 监听路由变化
watch(() => route.query.tab, (newTab) => {
  if (props.syncUrl && newTab && typeof newTab === 'string') {
    const tab = props.tabs.find(t => t.key === newTab && !t.disabled)
    if (tab && tab.key !== activeTab.value) {
      activeTab.value = tab.key
    }
  }
})

// 监听props.activeTab变化
watch(() => props.activeTab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
}, { immediate: true })

// 监听tabs变化
watch(() => props.tabs, () => {
  initActiveTab()
}, { immediate: true, deep: true })

// 暴露方法
defineExpose({
  switchTab: (tabKey: string) => {
    const tab = props.tabs.find(t => t.key === tabKey)
    if (tab) {
      handleTabClick(tab)
    }
  },
  getCurrentTab: () => currentTab.value,
  getActiveTabKey: () => activeTab.value
})
</script>

<style scoped lang="scss">
.tab-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color, var(--bg-white));
}

.tab-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border-width-base) solid #e8e9ea;
  background: var(--bg-gray-light);

  .tab-nav-wrapper {
    display: flex;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tab-actions {
    padding: 0 var(--text-lg);
    flex-shrink: 0;
  }
}

.tab-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm) var(--text-2xl);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  position: relative;

  .tab-icon {
    font-size: var(--text-lg);
  }

  .tab-label {
    font-size: var(--text-base);
    font-weight: 500;
  }

  .tab-badge {
    margin-left: var(--spacing-xs);
  }

  &:hover:not(.tab-item--disabled) {
    background: var(--bg-gray-light);
    color: #1677ff;
  }

  &--active {
    color: #1677ff;
    border-bottom-color: #1677ff;
    background: var(--bg-color, var(--bg-white));

    .tab-label {
      font-weight: 600;
    }
  }

  &--disabled {
    color: #c9cdd4;
    cursor: not-allowed;

    .tab-icon,
    .tab-label {
      opacity: 0.5;
    }
  }
}

.tab-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.tab-pane {
  height: 100%;
  overflow: auto;
}

.tab-default-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.tab-footer {
  padding: var(--text-lg);
  border-top: var(--border-width-base) solid #e8e9ea;
  background: var(--bg-gray-light);
}

// 过渡动画
.tab-slide-enter-active,
.tab-slide-leave-active,
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  transition: all 0.3s ease;
}

.tab-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.tab-slide-left-enter-from {
  opacity: 0;
  transform: translateX(var(--text-2xl));
}

.tab-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-var(--text-2xl));
}

.tab-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-var(--text-2xl));
}

.tab-slide-right-leave-to {
  opacity: 0;
  transform: translateX(var(--text-2xl));
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .tab-nav {
    flex-direction: column;
    gap: var(--text-sm);
    padding: var(--text-sm) 0;

    .tab-nav-wrapper {
      padding: 0 var(--text-lg);
    }

    .tab-actions {
      padding: 0 var(--text-lg);
      width: 100%;
    }
  }

  .tab-item {
    padding: var(--spacing-sm) var(--text-lg);
    font-size: var(--text-sm);
  }
}
</style>
