# AI助手三栏布局快速参考

**用途**: 开发过程中的快速查阅手册

---

## 🎨 全局样式变量速查

### 颜色
```scss
// 主色调
--primary-color: #409eff
--success-color: #67c23a
--warning-color: #e6a23c
--danger-color: #f56c6c
--info-color: #909399

// 文字
--text-primary: #303133
--text-secondary: #909399
--text-tertiary: #a8abb2
--text-placeholder: #c0c4cc

// 背景
--bg-color: #ffffff
--bg-color-page: #f2f3f5
--bg-hover: #f5f7fa
--bg-active: #ecf5ff

// 边框
--border-color: #dcdfe6
--border-color-light: #e4e7ed
```

### 间距
```scss
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### 圆角
```scss
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-full: 9999px
```

### 阴影
```scss
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
```

---

## 🎬 动画速查

### 骨架屏
```scss
.skeleton-loader {
  background: var(--bg-hover);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### 工具调用
```scss
.tool-icon {
  animation: gear-rotate 2s linear infinite;
}

@keyframes gear-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### AI思考
```scss
.thinking-text {
  animation: text-pulse 1.5s ease-in-out infinite;
}

@keyframes text-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.98); }
}
```

### 侧边栏
```scss
.sidebar {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

---

## 📐 布局尺寸速查

### 三栏宽度
```scss
// 左侧栏
.left-sidebar {
  width: 60px;  // 折叠状态
  width: 280px; // 展开状态
}

// 中间主区域
.center-main {
  flex: 1;
  min-width: 600px;
}

// 右侧栏
.right-sidebar {
  width: 400px;
}
```

### 组件高度
```scss
// 头部
.ai-header {
  height: 60px;
}

// 上下文横幅
.context-banner {
  height: 40px;
}

// 输入区域
.input-area {
  min-height: 120px;
}
```

---

## 🔧 常用代码片段

### 使用全局变量
```scss
.my-component {
  padding: var(--spacing-md);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}
```

### 添加动画
```scss
.animated-element {
  animation: fade-in 0.3s ease-out;
  will-change: opacity;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 响应式状态
```typescript
// 左侧栏折叠状态
const leftSidebarCollapsed = ref(true)

// 计算宽度
const leftSidebarWidth = computed(() => 
  leftSidebarCollapsed.value ? 60 : 280
)

// 切换状态
const toggleLeftSidebar = () => {
  leftSidebarCollapsed.value = !leftSidebarCollapsed.value
}
```

### 条件显示
```typescript
// 右侧栏显示状态
const rightSidebarVisible = ref(false)

// 监听智能代理开关
watch(autoExecute, (enabled) => {
  rightSidebarVisible.value = enabled
})
```

---

## 📦 组件导入

### 基础组件
```typescript
import LeftSidebar from './LeftSidebar.vue'
import RightSidebar from './RightSidebar.vue'
import TokenUsageCard from './TokenUsageCard.vue'
```

### 动画组件
```typescript
import SkeletonLoader from './SkeletonLoader.vue'
import ThinkingIndicator from './ThinkingIndicator.vue'
import ToolCallingIndicator from './ToolCallingIndicator.vue'
```

### Element Plus图标
```typescript
import { 
  Setting, 
  Loading, 
  FullScreen, 
  Minus,
  Close 
} from '@element-plus/icons-vue'
```

---

## 🎯 性能优化清单

### CSS优化
- [ ] 使用 `will-change` 提示浏览器
- [ ] 只改变 `transform` 和 `opacity`
- [ ] 使用 `transform: translateZ(0)` 强制GPU加速
- [ ] 避免改变 `width`、`height`、`margin`、`padding`

### 组件优化
- [ ] 使用 `defineAsyncComponent` 懒加载
- [ ] 使用 `v-show` 而不是 `v-if`（频繁切换）
- [ ] 使用虚拟滚动（长列表）
- [ ] 使用防抖和节流

### 动画优化
```scss
// ✅ 好的做法
.good-animation {
  will-change: transform, opacity;
  animation: slide 0.3s ease;
}

@keyframes slide {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

// ❌ 不好的做法
.bad-animation {
  animation: expand 0.3s ease;
}

@keyframes expand {
  from { width: 0; }
  to { width: 280px; }
}
```

---

## 🐛 常见问题

### Q1: 动画不流畅？
**A**: 检查是否使用了 `transform` 和 `opacity`，添加 `will-change`

### Q2: 样式不生效？
**A**: 检查是否使用了全局样式变量，确认变量名正确

### Q3: 侧边栏宽度不对？
**A**: 检查 `flex-shrink: 0`，确保不被压缩

### Q4: 右侧栏不显示？
**A**: 检查 `rightSidebarVisible` 状态，确认智能工具已开启

### Q5: Token统计不更新？
**A**: 检查API调用，确认数据绑定正确

---

## 📝 开发检查清单

### 组件开发
- [ ] 使用全局样式变量
- [ ] 添加TypeScript类型
- [ ] 添加Props验证
- [ ] 添加Emits声明
- [ ] 添加注释说明

### 样式开发
- [ ] 使用scoped样式
- [ ] 使用全局变量
- [ ] 添加动画效果
- [ ] 响应式适配
- [ ] 主题适配

### 功能开发
- [ ] 状态管理正确
- [ ] 事件处理正确
- [ ] 数据绑定正确
- [ ] 错误处理完善
- [ ] 性能优化到位

### 测试验证
- [ ] 功能测试通过
- [ ] 动画效果正常
- [ ] 性能指标达标
- [ ] 兼容性测试通过
- [ ] 无控制台错误

---

## 🔗 快速链接

- [开发方案](./AI助手三栏布局开发方案.md)
- [任务清单](./待办/003-AI助手三栏布局全屏样式开发任务.md)
- [动画示例](./AI助手动画效果代码示例.md)
- [开发总结](./AI助手三栏布局开发总结.md)
- [全局样式](../client/src/styles/design-tokens.scss)

---

**最后更新**: 2025-10-06

