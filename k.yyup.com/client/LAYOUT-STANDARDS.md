# 前端布局标准 / Frontend Layout Standards

## 全局水平布局要求 / Global Horizontal Layout Requirements

根据项目要求，前端组件布局**默认采用水平排列**，而非垂直堆叠。

### 核心原则 / Core Principles

1. **卡片布局** - 优先使用水平并列布局，不使用上下垂直堆叠
2. **按钮组** - 优先使用水平内联排列，尽量在一行内并排显示
3. **响应式适配** - 小屏幕时允许自动换行或切换为垂直布局
4. **统一样式定义** - 布局样式在 `index.scss` 中统一定义，不创建新的样式文件

### 标准布局类 / Standard Layout Classes

#### 卡片容器类 / Card Container Classes

```scss
// 基础卡片容器
.cards-container, .cards-grid, .function-cards-container, .dashboard-cards, .statistics-cards, .feature-cards

// 2列布局
.cards-container.two-columns

// 4列布局  
.statistics-cards.four-columns

// 网格布局
.function-cards-grid, .stats-grid
```

#### 按钮容器类 / Button Container Classes

```scss
// 基础按钮容器
.buttons-container, .action-buttons, .button-group, .toolbar-buttons, .form-actions, .page-actions, .card-actions, .dialog-actions

// 对齐方式变体
.buttons-container.actions-right    // 右对齐
.buttons-container.actions-center   // 居中对齐
.buttons-container.actions-between  // 两端对齐
.buttons-container.actions-around   // 均匀分布

// 内联按钮
.inline-buttons
```

#### 工具栏类 / Toolbar Classes

```scss
.page-toolbar, .content-toolbar
```

### 使用示例 / Usage Examples

#### 功能卡片 / Function Cards

```vue
<!-- 使用全局标准类 -->
<div class="function-cards-container">
  <div class="function-card">...</div>
  <div class="function-card">...</div>
  <div class="function-card">...</div>
</div>
```

#### 统计卡片 / Statistics Cards

```vue
<!-- 4列统计卡片 -->
<div class="statistics-cards four-columns">
  <div class="statistics-card">...</div>
  <div class="statistics-card">...</div>
  <div class="statistics-card">...</div>
  <div class="statistics-card">...</div>
</div>
```

#### 按钮组 / Button Groups

```vue
<!-- 页面操作按钮 -->
<div class="buttons-container actions-right">
  <el-button type="primary">主要操作</el-button>
  <el-button type="default">次要操作</el-button>
</div>

<!-- 工具栏 -->
<div class="page-toolbar">
  <h3 class="toolbar-title">页面标题</h3>
  <div class="toolbar-actions">
    <el-button>操作1</el-button>
    <el-button>操作2</el-button>
  </div>
</div>
```

### 响应式特性 / Responsive Features

- **桌面端（≥1200px）**: 完全水平布局
- **平板端（768px-1199px）**: 自适应水平布局，可能2列
- **移动端（<768px）**: 自动切换为垂直布局或单列

### 实施状态 / Implementation Status

✅ **已完成 / Completed:**
- 全局水平布局样式定义（index.scss）
- 园长工作台页面布局标准化
- 响应式适配机制

📋 **后续页面适配 / Future Page Adaptations:**
- 系统管理页面
- 学生管理页面  
- 教师管理页面
- 其他业务页面

### 注意事项 / Important Notes

1. 新页面开发时**必须**使用这些标准布局类
2. 禁止创建新的布局样式文件，统一在 `index.scss` 中扩展
3. 旧页面逐步重构时要替换为标准布局类
4. 保持设计一致性，提升用户体验

---

*最后更新: 2025-07-10*  
*更新人: Claude Code*