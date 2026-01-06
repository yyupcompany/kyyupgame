<template>
  <div class="mobile-footer-draggable" :class="footerClasses">
    <!-- 拖拽模式开关 -->
    <div v-if="showEditMode" class="edit-mode-toggle">
      <van-button
        :type="isEditMode ? 'danger' : 'default'"
        size="small"
        @click="toggleEditMode"
      >
        <template #icon>
          <van-icon :name="isEditMode ? 'cross' : 'setting-o'" />
        </template>
        {{ isEditMode ? '完成' : '编辑' }}
      </van-button>
    </div>

    <!-- 底部导航栏 -->
    <div class="bottom-nav-wrapper" :class="{ 'edit-mode': isEditMode }">
      <!-- 使用横向滚动的容器 -->
      <div class="nav-scroll-container" ref="scrollContainer">
        <!-- 拖拽列表 -->
        <draggable
          v-model="localTabs"
          :disabled="!isEditMode"
          :animation="300"
          :delay="100"
          item-key="id"
          ghost-class="ghost-tab"
          drag-class="dragging-tab"
          @end="onDragEnd"
          class="nav-draggable-list"
          :class="{ 'is-dragging': isEditMode }"
        >
          <template #item="{ element: tab, index }">
            <div
              class="nav-tab-item"
              :class="{
                'active': tab.id === activeTab,
                'fixed': tab.fixed,
                'can-drag': isEditMode && !tab.fixed
              }"
              @click="handleTabClick(tab, index)"
            >
              <!-- 拖拽把手 -->
              <div v-if="isEditMode && !tab.fixed" class="drag-handle">
                <van-icon name="bars" size="12" />
              </div>

              <!-- 图标 -->
              <div class="tab-icon">
                <van-icon :name="tab.icon" :size="isEditMode ? 18 : 20" />
                <van-badge
                  v-if="tab.badge"
                  :content="tab.badge"
                  :offset="[0, -5]"
                />
              </div>

              <!-- 标题 -->
              <span class="tab-title" :class="{ 'edit-mode': isEditMode }">
                {{ tab.title }}
              </span>

              <!-- 固定标记 -->
              <van-icon
                v-if="tab.fixed && isEditMode"
                name="lock"
                size="10"
                class="fixed-icon"
              />
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- 底部安全区域 -->
    <div v-if="useSafeArea" class="bottom-safe-area"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import { useUserStore } from '@/stores/user'
import type { MobileTab } from '@/config/mobile-navigation.config'
import {
  getMobileNavigationConfig,
  getActiveBottomTab,
  getUserNavOrder,
  saveUserNavOrder,
  resetNavOrder,
  getSortedBottomTabs,
  shouldShowBottomNav
} from '@/config/mobile-navigation.config'

interface Props {
  showEditMode?: boolean
  useSafeArea?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showEditMode: true,
  useSafeArea: true
})

const emit = defineEmits<{
  'tab-change': [tab: MobileTab]
  'edit-mode-change': [isEdit: boolean]
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式状态
const isEditMode = ref(false)
const localTabs = ref<MobileTab[]>([])
const scrollContainer = ref<HTMLElement>()

// 当前用户角色
const userRole = computed(() => userStore.user?.role || 'parent')

// 当前激活的标签
const activeTab = computed(() => getActiveBottomTab(route.path, userRole.value))

// 计算属性
const footerClasses = computed(() => ({
  'edit-active': isEditMode.value,
  'with-safe-area': props.useSafeArea
}))

// 初始化导航标签
const initTabs = () => {
  localTabs.value = getSortedBottomTabs(userRole.value)
}

// 切换编辑模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  emit('edit-mode-change', isEditMode.value)

  // 退出编辑模式时，自动滚动到激活标签
  if (!isEditMode.value) {
    nextTick(() => {
      scrollToActiveTab()
    })
  }
}

// 处理标签点击
const handleTabClick = (tab: MobileTab, index: number) => {
  // 编辑模式下不进行导航
  if (isEditMode.value) {
    return
  }

  // 导航到对应页面
  if (tab.path && route.path !== tab.path) {
    router.push(tab.path)
  }

  emit('tab-change', tab)
}

// 拖拽结束
const onDragEnd = () => {
  // 保存新的排序
  const newOrder = localTabs.value.map(tab => tab.id)
  saveUserNavOrder(userRole.value, newOrder)

  // 触发震动反馈（如果支持）
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
}

// 滚动到激活的标签
const scrollToActiveTab = () => {
  if (!scrollContainer.value) return

  const activeElement = scrollContainer.value.querySelector('.nav-tab-item.active') as HTMLElement
  if (activeElement) {
    const containerWidth = scrollContainer.value.offsetWidth
    const elementLeft = activeElement.offsetLeft
    const elementWidth = activeElement.offsetWidth
    const scrollLeft = elementLeft - (containerWidth - elementWidth) / 2

    scrollContainer.value.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }
}

// 监听路由变化，更新激活状态
watch(() => route.path, () => {
  nextTick(() => {
    scrollToActiveTab()
  })
})

// 监听角色变化
watch(userRole, () => {
  initTabs()
})

// 初始化
onMounted(() => {
  initTabs()
  nextTick(() => {
    scrollToActiveTab()
  })
})

// 暴露方法
defineExpose({
  toggleEditMode,
  resetOrder: () => {
    resetNavOrder(userRole.value)
    initTabs()
  },
  scrollToActiveTab
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-footer-draggable {
  position: relative;
  z-index: var(--z-index-footer);
  background: var(--bg-color);
  border-top: 1px solid var(--border-color-light);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all var(--transition-duration-base) var(--transition-timing-ease);

  // 明暗主题适配
  :global([data-theme="dark"]) & {
    background: rgba(0, 0, 0, 0.8);
    border-top-color: var(--border-color-dark);
  }

  &.edit-active {
    border-top-color: var(--primary-color);
    box-shadow: 0 -2px 20px rgba(var(--primary-rgb), 0.2);
  }
}

// 编辑模式开关
.edit-mode-toggle {
  position: absolute;
  top: -40px;
  right: 16px;
  z-index: 10;

  :deep(.van-button) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

// 底部导航包装器
.bottom-nav-wrapper {
  position: relative;
  padding: 0;

  &.edit-mode {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

// 横向滚动容器
.nav-scroll-container {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; // Firefox

  &::-webkit-scrollbar {
    display: none; // Chrome, Safari, Opera
  }

  // 编辑模式下显示滚动提示
  .edit-mode + & {
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 40px;
      background: linear-gradient(to right, transparent, var(--bg-color));
      pointer-events: none;
    }
  }
}

// 拖拽列表
.nav-draggable-list {
  display: flex;
  flex-direction: row;
  gap: 0;
  min-width: min-content;
  padding: 0 8px;

  &.is-dragging {
    cursor: move;
  }
}

// 导航标签项
.nav-tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  max-width: 90px;
  height: 50px;
  padding: var(--spacing-xs) 8px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all var(--transition-duration-fast) var(--transition-timing-ease);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  // 激活状态
  &.active {
    color: var(--primary-color);

    .tab-icon {
      transform: scale(1.1);
    }

    .tab-title {
      font-weight: var(--font-semibold);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: var(--primary-color);
      border-radius: 1px;
    }
  }

  // 固定项
  &.fixed {
    opacity: 0.8;
  }

  // 可拖拽状态
  &.can-drag {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  // 编辑模式样式
  &.can-drag {
    border-radius: 8px;
    background: var(--bg-color-light);

    &:hover {
      background: var(--bg-color-hover);
    }
  }
}

// 拖拽把手
.drag-handle {
  position: absolute;
  top: 2px;
  right: 2px;
  padding: 2px;
  opacity: 0.5;
  pointer-events: none;
}

// 图标容器
.tab-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  transition: transform var(--transition-duration-fast) var(--transition-timing-ease);
}

// 标题
.tab-title {
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition: font-size var(--transition-duration-fast) var(--transition-timing-ease);

  &.edit-mode {
    font-size: 9px;
  }
}

// 固定图标
.fixed-icon {
  position: absolute;
  top: 2px;
  left: 2px;
  color: var(--text-tertiary);
  opacity: 0.5;
}

// 拖拽中的样式
.ghost-tab {
  opacity: 0.4;
  background: var(--bg-color-light);
  border-radius: 8px;
}

.dragging-tab {
  opacity: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
  z-index: 100;
}

// 底部安全区域
.bottom-safe-area {
  height: env(safe-area-inset-bottom);
  background: inherit;
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .mobile-footer-draggable {
    background: rgba(0, 0, 0, 0.9);
  }

  .nav-tab-item {
    &.active {
      color: var(--primary-color);
    }

    &.can-drag {
      background: rgba(255, 255, 255, 0.05);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// 动画效果
@keyframes tabSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-footer-draggable {
  .nav-tab-item {
    animation: tabSlideIn var(--transition-duration-slow) var(--transition-timing-ease) backwards;

    @for $i from 1 through 22 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.05}s;
      }
    }
  }
}

// 触摸反馈
.nav-tab-item {
  &:active:not(.active) {
    transform: scale(0.95);
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-footer-draggable {
    max-width: var(--breakpoint-md);
    margin: 0 auto;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    overflow: hidden;
  }

  .nav-tab-item {
    min-width: 80px;
    max-width: 100px;
  }
}
</style>
