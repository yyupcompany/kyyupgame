<template>
  <div class="fab-button-container">
    <!-- 单个悬浮按钮 -->
    <van-floating-bubble
      v-if="!multiple"
      :axis-lock="axisLock"
      :magnetic="magnetic"
      v-bind="$attrs"
      @click="handleClick"
    >
      <van-icon :name="icon" size="24" />
    </van-floating-bubble>

    <!-- 多个悬浮按钮（展开/收起） -->
    <div v-else class="fab-menu" :class="{ 'fab-menu--expanded': expanded }">
      <!-- 子按钮 -->
      <transition name="fab-expand">
        <div v-if="expanded" class="fab-menu__items">
          <div
            v-for="(action, index) in actions"
            :key="action.name"
            class="fab-menu__item"
            :style="{ transitionDelay: `${index * 50}ms` }"
            @click="handleActionClick(action)"
          >
            <van-floating-bubble
              :axis-lock="axisLock"
              :magnetic="magnetic"
            >
              <van-icon :name="action.icon" size="20" />
            </van-floating-bubble>
            <span class="fab-menu__label">{{ action.label }}</span>
          </div>
        </div>
      </transition>

      <!-- 主按钮 -->
      <van-floating-bubble
        :axis-lock="axisLock"
        :magnetic="magnetic"
        @click="toggleExpand"
        class="fab-menu__main"
      >
        <van-icon :name="expanded ? 'close' : icon" size="24" />
      </van-floating-bubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FabAction {
  name: string
  icon: string
  label: string
  color?: string
}

interface Props {
  icon?: string
  multiple?: boolean
  actions?: FabAction[]
  axisLock?: 'x' | 'y' | 'xy' | false
  magnetic?: 'x' | 'y' | undefined
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'plus',
  multiple: false,
  actions: () => [],
  axisLock: false,
  magnetic: undefined
})

interface Emits {
  (e: 'click'): void
  (e: 'action-click', action: FabAction): void
}

const emit = defineEmits<Emits>()

const expanded = ref(false)

const handleClick = () => {
  emit('click')
}

const handleActionClick = (action: FabAction) => {
  emit('action-click', action)
  expanded.value = false
}

const toggleExpand = () => {
  expanded.value = !expanded.value
}

defineExpose({
  toggleExpand,
  close: () => { expanded.value = false }
})
</script>

<style scoped>
.fab-button-container {
  position: fixed;
  right: 16px;
  bottom: calc(50px + 16px + env(safe-area-inset-bottom, 0px));
  z-index: 100;
}

.fab-menu {
  position: relative;
}

.fab-menu__items {
  position: absolute;
  right: 0;
  bottom: 60px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: flex-end;
}

.fab-menu__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0;
  transform: translateY(20px);
}

.fab-menu--expanded .fab-menu__item {
  opacity: 1;
  transform: translateY(0);
}

.fab-menu__label {
  font-size: var(--text-xs);
  color: var(--van-text-color);
  background: var(--van-gray-2);
  padding: var(--spacing-xs) 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.fab-menu__main {
  transition: transform 0.3s ease;
}

.fab-menu--expanded .fab-menu__main {
  transform: rotate(45deg);
}

/* 展开动画 */
.fab-expand-enter-active,
.fab-expand-leave-active {
  transition: all 0.3s ease;
}

.fab-expand-enter-from,
.fab-expand-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 主题色适配 */
.fab-button-container :deep(.van-floating-bubble) {
  --van-floating-bubble-size: 56px;
  --van-floating-bubble-background: var(--van-primary-color);
  --van-floating-bubble-color: #fff;
}

/* FAB 按钮样式 */
.fab-button-container :deep(.van-floating-bubble) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
