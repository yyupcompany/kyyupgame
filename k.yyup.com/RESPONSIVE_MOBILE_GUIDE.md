# 移动端响应式样式使用指南

本文档说明如何使用响应式样式Mixin来为移动端页面添加响应式设计支持。

## 快速开始

### 1. 导入响应式Mixin

```scss
<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';

// 你的样式代码
</style>
```

### 2. 使用布局Mixin

```scss
// 页面容器
.page-container {
  @include mobile-layout;  // 基础移动端布局
  min-height: 100vh;
}

// 响应式容器
.content-wrapper {
  @include mobile-container;  // 自动调整内边距
}
```

### 3. 使用组件Mixin

```scss
// 卡片样式
.card {
  @include mobile-card;
}

// 列表项
.list-item {
  @include mobile-list-item;
}

// 按钮
.button {
  @include mobile-button;
}

// 标题
.title {
  @include mobile-title;
}

// 文本
.text {
  @include mobile-text;
}
```

### 4. 使用媒体查询Mixin

```scss
// 仅在小屏手机
.element {
  font-size: 14px;

  @include mobile-sm {
    font-size: 16px;  // 375px及以上
  }

  @include mobile-md {
    font-size: 18px;  // 414px及以上
  }

  @include mobile-lg {
    font-size: 20px;  // 768px及以上 (平板)
  }
}
```

### 5. 使用Flexbox布局

```scss
// 响应式Flex容器
.flex-container {
  @include mobile-flex(row, flex-start, center, 12px);
  // gap会自动响应式调整: 12px → 15px → 18px → 21px
}

// 响应式网格
.grid-container {
  @include mobile-grid(2, 12px);
  // 手机: 1列, 标准手机: 2列, 大屏手机: 3列, 平板: 4列
}
```

### 6. 使用间距Mixin

```scss
// 响应式内边距
.section {
  @include mobile-padding(16px);  // 所有方向
  // 自动调整: 16px → 20px → 24px → 28px
}

.header {
  @include mobile-padding(12px, 16px, 12px, 16px);
  // 分别指定: top right bottom left
}

// 响应式外边距
.spacer {
  @include mobile-margin(20px, 0);
  // 垂直间距自动响应式调整
}
```

## 完整示例

```vue
<template>
  <div class="mobile-page">
    <div class="page-header">
      <h1 class="page-title">页面标题</h1>
    </div>

    <div class="content-wrapper">
      <div class="card">
        <div class="card-content">
          <h2 class="section-title">区块标题</h2>
          <div class="list-item">列表项1</div>
          <div class="list-item">列表项2</div>
          <div class="list-item">列表项3</div>
        </div>
      </div>

      <button class="action-button">操作按钮</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 你的逻辑代码
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';

.mobile-page {
  @include mobile-layout;
  background: var(--van-background-2, #f5f5f5);
}

.page-header {
  @include mobile-padding(20px, 16px);
  background: var(--van-primary-gradient);
  color: #fff;
}

.page-title {
  @include mobile-title;
  color: #fff;
  margin-bottom: 0;
}

.content-wrapper {
  @include mobile-container;
  @include mobile-margin(20px, 0);
}

.card {
  @include mobile-card;
}

.card-content {
  @include mobile-flex(column, flex-start, stretch, 12px);
}

.section-title {
  @include mobile-title;
  font-size: 18px;
  margin-bottom: 8px;
}

.list-item {
  @include mobile-list-item;
  @include tap-feedback;  // 点击反馈动画
}

.action-button {
  @include mobile-button;
  @include fixed-bottom-bar;  // 固定在底部
  margin-top: 20px;
}
</style>
```

## 可用的Mixin列表

### 布局相关
- `@include mobile-layout` - 基础移动端布局
- `@include mobile-container` - 响应式容器
- `@include mobile-grid($columns, $gap)` - 响应式网格
- `@include mobile-flex($direction, $justify, $align, $gap)` - 响应式Flex

### 组件相关
- `@include mobile-card` - 移动端卡片
- `@include mobile-list-item` - 移动端列表项
- `@include mobile-button` - 移动端按钮
- `@include mobile-title` - 移动端标题
- `@include mobile-text` - 移动端文本
- `@include mobile-icon` - 移动端图标

### 间距相关
- `@include mobile-padding($top, $right, $bottom, $left)` - 响应式内边距
- `@include mobile-margin($top, $right, $bottom, $left)` - 响应式外边距

### 媒体查询
- `@include mobile-xs` - 小屏手机 (320px+)
- `@include mobile-sm` - 标准手机 (375px+)
- `@include mobile-md` - 大屏手机 (414px+)
- `@include mobile-lg` - 平板 (768px+)
- `@include mobile-xl` - 大平板 (1024px+)
- `@include mobile-only` - 仅移动设备
- `@include tablet-only` - 仅平板设备
- `@include landscape` - 横屏模式
- `@include portrait` - 竖屏模式

### 实用工具
- `@include hide-on-mobile` - 在移动设备上隐藏
- `@include show-on-mobile` - 仅在移动设备上显示
- `@include responsive-font($min, $max)` - 响应式字体
- `@include responsive-radius($mobile, $tablet, $desktop)` - 响应式圆角
- `@include responsive-shadow($opacity)` - 响应式阴影
- `@include tap-feedback` - 点击反馈动画
- `@include text-ellipsis` - 文本截断
- `@include text-ellipsis-multiline($lines)` - 多行文本截断

### 特殊场景
- `@include fixed-bottom-bar` - 固定底部按钮栏
- `@include fullscreen-modal` - 全屏模态框
- `@include pull-refresh-area` - 下拉刷新区域
- `@include loading-spinner` - 加载动画

## 断点参考

| 断点名称 | 屏幕宽度 | 设备类型 | 典型设备 |
|---------|---------|---------|---------|
| mobile-xs | 320px+ | 小屏手机 | iPhone SE, iPhone 5/5s |
| mobile-sm | 375px+ | 标准手机 | iPhone 6/7/8, iPhone X |
| mobile-md | 414px+ | 大屏手机 | iPhone 6/7/8 Plus, iPhone 14 Pro Max |
| mobile-lg | 768px+ | 平板 | iPad, iPad Mini |
| mobile-xl | 1024px+ | 大平板 | iPad Pro |

## 设计令牌参考

响应式Mixin使用项目中定义的设计令牌:

- 颜色: `var(--van-text-color)`, `var(--van-background-2)` 等
- 间距: 参考断点自动调整
- 字体: 根据屏幕尺寸自动缩放
- 圆角: 移动端较小,平板端较大
- 阴影: 移动端较轻,平板端较重

## 最佳实践

### 1. 移动优先
始终从小屏开始设计,然后逐步增强到大屏幕:

```scss
.element {
  // 默认(移动端)
  font-size: 14px;

  // 逐步增强
  @include mobile-sm { font-size: 16px; }
  @include mobile-md { font-size: 18px; }
  @include mobile-lg { font-size: 20px; }
}
```

### 2. 使用相对单位
配合rem/em使用,提供更好的缩放:

```scss
.text {
  font-size: 1rem;  // 16px基准

  @include mobile-lg {
    font-size: 1.125rem;  // 18px
  }
}
```

### 3. 保持一致性
在所有页面使用相同的Mixin和间距:

```scss
// ✅ 好的做法
.card {
  @include mobile-card;
}

.button {
  @include mobile-button;
}

// ❌ 不好的做法
.card {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
}
```

### 4. 测试多设备
确保在以下设备上测试:
- iPhone SE (320px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- iPad (768px)
- iPad Pro (1024px)

### 5. 性能优化
避免过度使用媒体查询:

```scss
// ✅ 好的做法 - 使用Mixin
.element {
  @include mobile-padding(16px);
}

// ❌ 不好的做法 - 手写媒体查询
.element {
  padding: 16px;
  @media (min-width: 375px) { padding: 20px; }
  @media (min-width: 414px) { padding: 24px; }
  // ...
}
```

## 常见问题

### Q: 如何在桌面设备上显示移动端页面?
A: 使用max-width限制容器宽度:

```scss
.mobile-wrapper {
  @include mobile-container;
  @include mobile-lg {
    max-width: 768px;  // 在桌面上限制为平板宽度
    margin: 0 auto;    // 居中显示
  }
}
```

### Q: 如何处理横屏模式?
A: 使用orientation媒体查询:

```scss
.container {
  @include portrait {
    padding: 16px;
  }

  @include landscape {
    padding: 12px;
  }
}
```

### Q: 如何适配安全区域(如iPhone刘海)?
A: 使用env()函数:

```scss
.fixed-header {
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
}

.fixed-footer {
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}
```

## 相关文档

- [设计令牌配置](../client/src/config/design-tokens.ts)
- [响应式Mixin源码](../client/src/styles/mixins/responsive-mobile.scss)
- [Vant组件库文档](https://vant-contrib.gitee.io/vant/#/zh-CN)

## 更新日志

- 2025-01-21: 初始版本,添加44个移动端页面的响应式样式支持
