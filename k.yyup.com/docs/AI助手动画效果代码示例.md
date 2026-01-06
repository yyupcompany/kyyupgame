# AI助手动画效果代码示例

**创建时间**: 2025-10-06  
**用途**: 提供完整的动画效果实现代码

---

## 📋 目录

- [骨架屏动画](#骨架屏动画)
- [工具调用动画](#工具调用动画)
- [AI思考动画](#ai思考动画)
- [侧边栏动画](#侧边栏动画)
- [消息渐入动画](#消息渐入动画)
- [完整样式文件](#完整样式文件)

---

## 🎨 骨架屏动画

### 组件实现 (SkeletonLoader.vue)

```vue
<template>
  <div class="skeleton-loader" :class="[shape, size]">
    <div class="skeleton-shimmer"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  shape?: 'rect' | 'circle' | 'text'
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<style lang="scss" scoped>
.skeleton-loader {
  position: relative;
  overflow: hidden;
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  
  &.rect {
    width: 100%;
    height: 60px;
  }
  
  &.circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  
  &.text {
    width: 100%;
    height: 16px;
    border-radius: var(--radius-sm);
  }
  
  &.sm { height: 40px; }
  &.md { height: 60px; }
  &.lg { height: 80px; }
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  will-change: transform;
}

@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
```

### 使用示例

```vue
<template>
  <div class="conversation-list">
    <!-- 加载状态 -->
    <template v-if="loading">
      <SkeletonLoader v-for="i in 5" :key="i" shape="rect" size="md" />
    </template>
    
    <!-- 实际内容 -->
    <template v-else>
      <div v-for="conv in conversations" :key="conv.id" class="conversation-item">
        {{ conv.title }}
      </div>
    </template>
  </div>
</template>
```

---

## ⚙️ 工具调用动画

### 组件实现 (ToolCallingIndicator.vue)

```vue
<template>
  <div class="tool-calling-indicator">
    <div class="tool-icon-wrapper">
      <el-icon class="tool-icon" :size="24">
        <Setting />
      </el-icon>
      <div class="pulse-ring"></div>
    </div>
    <div class="tool-info">
      <div class="tool-name">{{ toolName }}</div>
      <div class="tool-status">{{ status }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'

defineProps<{
  toolName: string
  status: string
}>()
</script>

<style lang="scss" scoped>
.tool-calling-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--primary-light-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-color);
}

.tool-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.tool-icon {
  color: var(--primary-color);
  animation: gear-rotate 2s linear infinite;
  will-change: transform;
}

@keyframes gear-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  transform: translate(-50%, -50%);
  animation: pulse-ring 1.5s ease-out infinite;
  will-change: transform, opacity;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.tool-info {
  flex: 1;
  
  .tool-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  .tool-status {
    font-size: 12px;
    color: var(--text-secondary);
  }
}
</style>
```

---

## 🤔 AI思考动画

### 组件实现 (ThinkingIndicator.vue)

```vue
<template>
  <div class="thinking-indicator">
    <div class="thinking-icon">
      <el-icon :size="20">
        <Loading />
      </el-icon>
    </div>
    <div class="thinking-text">
      {{ text }}
      <span class="thinking-dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

withDefaults(defineProps<{
  text?: string
}>(), {
  text: 'AI正在思考'
})
</script>

<style lang="scss" scoped>
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  animation: thinking-pulse 1.5s ease-in-out infinite;
}

@keyframes thinking-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

.thinking-icon {
  color: var(--primary-color);
  animation: icon-spin 1s linear infinite;
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.thinking-text {
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 2px;
}

.thinking-dots {
  display: inline-flex;
  gap: 2px;
  
  span {
    display: inline-block;
    animation: dot-bounce 1.4s ease-in-out infinite;
    
    &:nth-child(1) {
      animation-delay: 0s;
    }
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes dot-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}
</style>
```

---

## 📱 侧边栏动画

### 样式实现

```scss
// 左侧栏
.left-sidebar {
  position: relative;
  height: 100vh;
  background: var(--bg-color);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  will-change: width;
  
  &.collapsed {
    width: 60px;
    
    .sidebar-content {
      opacity: 0;
      pointer-events: none;
    }
    
    .sidebar-icons {
      opacity: 1;
    }
  }
  
  &:not(.collapsed) {
    width: 280px;
    
    .sidebar-content {
      opacity: 1;
      animation: fade-in 0.3s ease 0.15s both;
    }
    
    .sidebar-icons {
      opacity: 0;
    }
  }
}

// 右侧栏
.right-sidebar {
  position: relative;
  width: 400px;
  height: 100vh;
  background: var(--bg-color);
  border-left: 1px solid var(--border-color);
  animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  
  &.closing {
    animation: slide-out-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## 💬 消息渐入动画

### 样式实现

```scss
.message-item {
  animation: message-fade-in 0.4s ease-out;
  will-change: transform, opacity;
  
  &.user {
    animation-delay: 0s;
  }
  
  &.assistant {
    animation-delay: 0.1s;
  }
}

@keyframes message-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 流式输出动画
.streaming-text {
  .char {
    display: inline-block;
    animation: char-appear 0.1s ease-out;
  }
}

@keyframes char-appear {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 📦 完整样式文件

### ai-assistant-animations.scss

```scss
/**
 * AI助手动画效果样式
 * 使用全局样式变量，确保主题一致性
 */

// ==================== 骨架屏动画 ====================
@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// ==================== 工具调用动画 ====================
@keyframes gear-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

// ==================== AI思考动画 ====================
@keyframes thinking-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes dot-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

// ==================== 侧边栏动画 ====================
@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// ==================== 消息动画 ====================
@keyframes message-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes char-appear {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ==================== 通用动画类 ====================
.animate-shimmer {
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  will-change: transform;
}

.animate-rotate {
  animation: gear-rotate 2s linear infinite;
  will-change: transform;
}

.animate-pulse {
  animation: thinking-pulse 1.5s ease-in-out infinite;
  will-change: transform, opacity;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
  will-change: opacity;
}

.animate-slide-in-left {
  animation: slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
```

---

**文档维护**: AI助手开发团队  
**最后更新**: 2025-10-06

