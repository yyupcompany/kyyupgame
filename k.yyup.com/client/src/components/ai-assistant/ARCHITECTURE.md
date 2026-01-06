# AI助手架构说明

## 📋 架构概览

AI助手系统现在分为两个独立的入口组件,职责明确:

### 1. **AIAssistant.vue** - 侧边栏模式
- **路径**: `client/src/components/ai-assistant/AIAssistant.vue`
- **用途**: 在主应用布局(MainLayout)中作为侧边栏显示
- **调用方式**: 通过头部AI图标点击打开
- **布局组件**: 使用 `SidebarLayout.vue`
- **特点**: 
  - 浮动在主页面右侧
  - 可拖拽调整宽度
  - 点击全屏按钮跳转到 `/aiassistant`

### 2. **AIAssistantFullPage.vue** - 全屏页面模式
- **路径**: `client/src/components/ai-assistant/AIAssistantFullPage.vue`
- **路由**: `/aiassistant`
- **用途**: 独立的全屏AI助手页面
- **布局系统**: 使用插槽式布局组件
  - `FullPageLayout` - 主布局容器
  - `FullPageHeader` - 头部区域
  - `FullPageSidebar` - 左侧边栏
  - `FullPageDialog` - 对话内容区
  - `InputArea` - 输入区域
- **特点**:
  - 完整的页面布局
  - 固定定位,覆盖整个视口
  - 独立路由,不受主布局影响

## 🎯 设计原则

### 关注点分离
- **AIAssistant.vue**: 只负责侧边栏模式的业务逻辑
- **AIAssistantFullPage.vue**: 专注于全屏页面的完整体验
- **布局组件**: 各司其职,可复用的UI组件

### 插槽式架构
```vue
<FullPageLayout>
  <template #header>
    <FullPageHeader />
  </template>
  
  <template #sidebar>
    <FullPageSidebar />
  </template>
  
  <template #dialog>
    <FullPageDialog />
  </template>
  
  <template #input>
    <InputArea />
  </template>
</FullPageLayout>
```

### 样式隔离
- 每个布局组件都有自己的样式
- 所有样式使用全局设计令牌(`@use '@/styles/design-tokens.scss'`)
- 统一使用 `UnifiedIcon` 组件

## 📁 目录结构

```
client/src/components/ai-assistant/
├── AIAssistant.vue              # 侧边栏入口
├── AIAssistantFullPage.vue      # 全屏页面入口
├── layout/
│   ├── SidebarLayout.vue        # 侧边栏布局
│   ├── FullscreenLayout.vue     # 传统全屏布局(保留)
│   └── full-page/               # 新的插槽式全屏布局
│       ├── FullPageLayout.vue   # 主布局容器
│       ├── FullPageHeader.vue   # 头部组件
│       ├── FullPageSidebar.vue  # 侧边栏组件
│       ├── FullPageDialog.vue   # 对话区组件
│       └── index.ts             # 导出文件
├── input/
│   └── InputArea.vue            # 输入区域组件
├── chat/
│   ├── ChatContainer.vue        # 聊天容器
│   └── MessageList.vue          # 消息列表
├── core/
│   └── AIAssistantCore.vue      # 核心业务逻辑
└── dialogs/
    ├── AIStatistics.vue         # 统计对话框
    ├── QuickQueryGroups.vue     # 快捷查询
    └── MissingFieldsDialog.vue  # 缺失字段对话框
```

## 🔄 用户流程

1. **打开侧边栏**
   - 用户点击头部AI图标
   - `MainLayout` 中的 `AIAssistant.vue` 显示为侧边栏
   - 模式: `mode="sidebar"`

2. **切换到全屏**
   - 用户点击侧边栏中的全屏按钮
   - 触发 `handleToggleFullscreen()`
   - 关闭侧边栏,使用 Vue Router 导航到 `/aiassistant`
   - 加载 `AIAssistantFullPage.vue` 组件

3. **关闭全屏**
   - 用户点击返回或关闭按钮
   - 使用 `router.back()` 或 `router.push('/')` 返回

## ⚙️ 路由配置

```typescript
// client/src/router/optimized-routes.ts
{
  path: '/aiassistant',
  name: 'AIAssistant',
  component: () => import('@/components/ai-assistant/AIAssistantFullPage.vue'),
  meta: {
    title: 'AI助手',
    icon: 'ChatDotRound',
    requiresAuth: true,
    hideInMenu: false,
    priority: 'medium',
    preload: false
  }
}
```

**注意**: 这个路由是独立的,不使用 `Layout` 包裹。

## 🎨 样式系统

所有组件都使用全局设计令牌:

```scss
@use '@/styles/design-tokens.scss' as *;

.my-component {
  padding: var(--spacing-lg);
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: var(--radius-md);
}
```

## 🔧 开发指南

### 修改侧边栏样式
编辑 `client/src/components/ai-assistant/layout/SidebarLayout.vue`

### 修改全屏页面样式
编辑 `client/src/components/ai-assistant/layout/full-page/` 目录下的相应组件

### 修改输入区样式
编辑 `client/src/components/ai-assistant/input/InputArea.vue`

### 添加新功能
1. 确定功能属于侧边栏还是全屏页面
2. 在对应的入口组件中添加逻辑
3. 如需新的布局元素,创建独立组件并通过插槽引入

## ✅ 完成状态

- [x] 分离侧边栏和全屏页面入口
- [x] 创建插槽式全屏布局系统
- [x] 统一使用设计令牌
- [x] 修复路由配置
- [x] 修复组件导入和事件处理
- [x] 文档完善

## 📝 注意事项

1. **不要在 `AIAssistant.vue` 中添加全屏布局代码**
2. **不要在 `AIAssistantFullPage.vue` 中添加侧边栏逻辑**
3. **所有样式修改都应该在对应的布局组件中进行**
4. **保持插槽架构的完整性,不要硬编码布局结构**

