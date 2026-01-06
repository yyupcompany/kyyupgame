# 卡片设计规范 (Card Design Specification)

## 概述 (Overview)

本文档定义了幼儿园招生管理系统中统一的卡片设计规范，确保所有中心页面的卡片组件具有一致的视觉效果和用户体验。

## 设计原则 (Design Principles)

### 1. 一致性 (Consistency)
- 所有卡片使用相同的视觉语言
- 统一的动画效果和交互反馈
- 一致的间距、圆角、阴影等视觉元素

### 2. 可访问性 (Accessibility)
- 支持键盘导航
- 适当的颜色对比度
- 移动端友好的触摸目标

### 3. 性能优化 (Performance)
- GPU加速的动画效果
- 移动端优化的交互体验
- 减少重绘和回流

## 卡片类型 (Card Types)

### 1. 统计卡片 (StatCard)
用于显示关键数据指标的卡片组件。

**特征：**
- 图标 + 数值 + 标题的布局
- 支持趋势指示器
- 可点击交互
- 类型化的颜色主题

**使用场景：**
- 仪表板数据展示
- 各中心页面的关键指标
- 实时数据监控

### 2. 操作卡片 (ActionCard)
用于快速操作入口的卡片组件。

**特征：**
- 图标 + 标题 + 描述的布局
- 明确的操作导向
- 悬浮动画效果

**使用场景：**
- 快速操作面板
- 功能入口导航
- 工作流程引导

## 视觉规范 (Visual Specifications)

### 尺寸规范 (Dimensions)
```scss
// 基础尺寸
--card-min-height: 140px;
--card-padding: 20px;
--card-radius: 20px;

// 响应式尺寸
// 移动端 (≤768px)
--card-padding-mobile: 16px;
--card-radius-mobile: 16px;

// 小屏幕 (≤480px)
--card-padding-small: 12px;
--card-radius-small: 12px;
```

### 颜色规范 (Colors)
```scss
// 卡片背景
--card-bg: var(--bg-card);
--card-border: var(--border-color);

// 类型化颜色
--card-gradient-primary: linear-gradient(90deg, #667eea, #764ba2);
--card-gradient-success: linear-gradient(90deg, #10b981, #059669);
--card-gradient-warning: linear-gradient(90deg, #f59e0b, #d97706);
--card-gradient-danger: linear-gradient(90deg, #ef4444, #dc2626);
--card-gradient-info: linear-gradient(90deg, #3b82f6, #2563eb);
```

### 阴影规范 (Shadows)
```scss
// 基础阴影
--card-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

// 悬浮阴影
--card-shadow-hover: 0 16px 32px rgba(0, 0, 0, 0.12);

// 类型化悬浮阴影
--card-shadow-primary-hover: 0 20px 40px rgba(102, 126, 234, 0.4);
--card-shadow-success-hover: 0 20px 40px rgba(16, 185, 129, 0.4);
--card-shadow-warning-hover: 0 20px 40px rgba(245, 158, 11, 0.4);
--card-shadow-danger-hover: 0 20px 40px rgba(239, 68, 68, 0.4);
--card-shadow-info-hover: 0 20px 40px rgba(59, 130, 246, 0.4);
```

## 动画规范 (Animation Specifications)

### 基础动画 (Basic Animations)
```scss
// 过渡时间
--card-transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
--card-transition-fast: transform 0.2s ease-out, opacity 0.2s ease-out;

// 变换效果
--card-transform-hover: translateY(-6px) scale(1.015);
```

### 高级动画效果 (Advanced Animations)

#### 1. 渐变边框动画
- 从左到右的渐变边框展开
- 使用 `scaleX` 变换实现
- GPU加速优化

#### 2. 背景光效
- 径向渐变的光效动画
- 从右侧滑入的动画效果
- 移动端自动禁用

#### 3. 内容动画
- 图标：缩放 + 旋转效果
- 数值：轻微缩放效果
- 趋势指示器：水平位移效果

### 性能优化 (Performance Optimizations)
```scss
// GPU加速
will-change: transform, box-shadow, border-color;
backface-visibility: hidden;

// 移动端优化
@media (hover: none) {
  will-change: auto;
  // 禁用hover动画
}
```

## 响应式设计 (Responsive Design)

### 断点规范 (Breakpoints)
- **桌面端**: > 1024px - 完整动画效果
- **平板端**: 769px - 1024px - 简化动画效果
- **移动端**: ≤ 768px - 禁用hover动画
- **小屏幕**: ≤ 480px - 最小化间距

### 网格布局 (Grid Layout)
```scss
// 统一网格系统
.stats-grid-unified {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

// 移动端适配
@media (max-width: 768px) {
  .stats-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
```

## 可访问性规范 (Accessibility Guidelines)

### 1. 键盘导航
- 所有可交互卡片支持Tab键导航
- 明确的焦点指示器
- 支持Enter键激活

### 2. 屏幕阅读器
- 适当的ARIA标签
- 语义化的HTML结构
- 有意义的alt文本

### 3. 颜色对比度
- 文本与背景对比度 ≥ 4.5:1
- 图标与背景对比度 ≥ 3:1
- 状态指示器具有足够对比度

## 使用指南 (Usage Guidelines)

### 何时使用统计卡片
- ✅ 展示关键数据指标
- ✅ 需要快速概览的数据
- ✅ 支持点击查看详情的场景
- ❌ 复杂的数据表格
- ❌ 长文本内容展示

### 何时使用操作卡片
- ✅ 功能入口导航
- ✅ 快速操作面板
- ✅ 工作流程引导
- ❌ 纯信息展示
- ❌ 复杂的表单操作

## 实现规范 (Implementation Guidelines)

### 1. 组件使用
```vue
<!-- 统计卡片 -->
<StatCard
  title="总活动数"
  :value="77"
  unit=""
  trend="up"
  trend-text="12.5%"
  type="primary"
  icon-name="Calendar"
  clickable
  @click="handleClick"
/>

<!-- 操作卡片 -->
<ActionCard
  title="新建活动"
  description="创建新的活动计划"
  icon-name="Plus"
  @click="handleAction"
/>
```

### 2. 样式应用
```scss
// 使用统一的网格系统
.stats-container {
  @include stats-grid-unified;
}

// 应用卡片样式
.custom-card {
  @include enhanced-card;
}
```

### 3. 性能最佳实践
- 使用CSS变换而非改变布局属性
- 合理使用 `will-change` 属性
- 移动端禁用复杂动画
- 避免同时触发多个动画

## 维护指南 (Maintenance Guidelines)

### 1. 版本控制
- 所有样式变更需要版本记录
- 重大变更需要向后兼容性考虑
- 定期审查和优化性能

### 2. 测试要求
- 跨浏览器兼容性测试
- 移动端响应式测试
- 可访问性测试
- 性能基准测试

### 3. 文档更新
- 新增功能需要更新文档
- 示例代码保持最新
- 定期审查设计规范的适用性

---

**版本**: 1.0.0  
**最后更新**: 2025-09-08  
**维护者**: 开发团队
