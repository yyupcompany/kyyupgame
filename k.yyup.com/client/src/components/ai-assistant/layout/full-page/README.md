# AI助手独立全屏页面布局系统

## 📁 新增文件结构

```
client/src/components/ai-assistant/layout/full-page/
├── FullPageLayout.vue      # 主布局包装器(插槽模式)
├── FullPageHeader.vue       # 头部组件
├── FullPageSidebar.vue      # 左侧边栏组件
├── FullPageDialog.vue       # 对话区组件
└── index.ts                 # 统一导出
```

## 🎯 设计理念

### 1. 插槽模式
所有组件都使用插槽模式,可以灵活替换内容:
- `#header` - 头部插槽
- `#sidebar` - 侧边栏插槽
- `#dialog` - 对话区插槽
- `#input` - 输入区插槽

### 2. 完全独立
- 使用 `position: fixed` 覆盖整个视口
- 不受父容器影响
- 独立的全屏页面

### 3. 统一设计令牌
所有样式都使用全局设计令牌 `@use '@/styles/design-tokens.scss' as *`

## 📦 组件说明

### FullPageLayout.vue
**主布局包装器**
- 提供完整的页面布局结构
- 管理侧边栏折叠状态
- 响应式设计支持

Props:
- `sidebarCollapsed?: boolean` - 侧边栏是否折叠

Emits:
- `update:sidebarCollapsed` - 侧边栏状态变化

### FullPageHeader.vue
**头部组件**
- 显示AI助手标题和状态
- Token用量显示
- 侧边栏折叠按钮

Props:
- `subtitle?: string` - 副标题
- `mode?: string` - 模式说明
- `features?: string` - 功能说明
- `usageLabel?: string` - 用量标签
- `usagePercent?: number` - 用量百分比
- `sidebarCollapsed?: boolean` - 侧边栏状态

Emits:
- `toggle-sidebar` - 切换侧边栏

### FullPageSidebar.vue
**左侧边栏组件**
- 新对话按钮
- 快捷操作菜单
- 常用功能菜单

Props:
- `activeIndex?: string` - 当前激活的菜单项
- `quickActions?: MenuItem[]` - 快捷操作列表
- `commonFeatures?: MenuItem[]` - 常用功能列表

Emits:
- `new-conversation` - 新建对话
- `quick-action` - 快捷操作
- `common-feature` - 常用功能

### FullPageDialog.vue
**对话区组件**
- 欢迎界面(无消息时)
- 消息列表容器
- 支持自定义消息内容(通过 `#messages` 插槽)

Props:
- `hasMessages?: boolean` - 是否有消息
- `welcomeTitle?: string` - 欢迎标题
- `welcomeText?: string` - 欢迎文本
- `badges?: string[]` - 功能标签
- `quickActions?: QuickAction[]` - 快速操作
- `suggestions?: string[]` - 建议问题

Emits:
- `quick-action` - 快速操作点击
- `suggestion-click` - 建议问题点击

## 🚀 使用方式

### 基础用法

```vue
<template>
  <FullPageLayout :sidebar-collapsed="collapsed">
    <template #header>
      <FullPageHeader @toggle-sidebar="toggleSidebar" />
    </template>
    
    <template #sidebar>
      <FullPageSidebar @new-conversation="handleNew" />
    </template>
    
    <template #dialog>
      <FullPageDialog :has-messages="hasMessages" />
    </template>
    
    <template #input>
      <InputArea @send="handleSend" />
    </template>
  </FullPageLayout>
</template>
```

### 完整示例
参见 `AIAssistantFullPage.vue`,它展示了如何组合所有组件。

## 🎨 样式特点

1. **全局设计令牌**: 所有组件使用统一的设计令牌系统
2. **响应式设计**: 支持桌面和移动端
3. **平滑过渡**: 所有交互都有过渡动画
4. **统一图标**: 使用 `UnifiedIcon` 组件
5. **主题支持**: 支持亮色/暗色主题

## 📝 与原有系统的区别

### 原 AIAssistant.vue
- 混合了布局和业务逻辑
- 样式写在单个文件中
- 不够模块化

### 新布局系统
- **布局与逻辑分离**: 布局组件只负责UI
- **插槽模式**: 灵活可组合
- **独立文件**: 每个部分都是独立组件
- **易于维护**: 修改某一部分不影响其他

### 侧边栏布局(SidebarLayout.vue)
- **不受影响**: 之前的侧边栏布局保持不变
- **用途不同**: 侧边栏用于嵌入式显示,全屏用于独立页面

## 🔄 路由配置

```typescript
{
  path: '/aiassistant',
  name: 'AIAssistant',
  component: () => import('@/components/ai-assistant/AIAssistantFullPage.vue'),
  meta: {
    title: 'AI助手',
    requiresAuth: true,
    hideInMenu: false
  }
}
```

## ✅ 优势

1. **职责清晰**: 每个组件只负责自己的部分
2. **易于测试**: 组件独立,可单独测试
3. **灵活组合**: 通过插槽可以灵活替换内容
4. **样式隔离**: 每个组件的样式互不影响
5. **易于扩展**: 添加新功能只需修改对应组件

## 📌 注意事项

1. 原 `AIAssistant.vue` 保持不变,用于嵌入式显示
2. `AIAssistantFullPage.vue` 是新的独立页面版本
3. `SidebarLayout.vue` 用于右侧弹出的侧边栏模式
4. `FullscreenLayout.vue` 用于全屏对话模式
5. 新的 `full-page` 目录用于独立访问的全屏页面(`/aiassistant` 路由)

