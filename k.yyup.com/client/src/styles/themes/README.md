# 主题系统架构说明

## 概述 / Overview

主题样式已成功从 `index.scss` 中拆分到独立的主题文件中，每个主题都有自己的文件，便于维护和管理。**现在包含完整的侧边栏主题支持！**

The theme styles have been successfully separated from `index.scss` into independent theme files, with each theme having its own file for easier maintenance and management. **Now includes complete sidebar theme support!**

## 文件结构 / File Structure

```
client/src/styles/themes/
├── dark.scss      # 暗黑主题（默认主题）
├── light.scss     # 明亮主题
└── README.md      # 本说明文档
```

## 主题定义 / Theme Definitions

每个主题文件都包含完整的CSS变量定义：

Each theme file contains complete CSS variable definitions:

### 变量类别 / Variable Categories

- **颜色系统** / Color System: `--primary-color`, `--secondary-color`, `--accent-color`, etc.
- **背景色** / Background Colors: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, etc.
- **文字色** / Text Colors: `--text-primary`, `--text-secondary`, `--text-muted`, etc.
- **边框色** / Border Colors: `--border-color`, `--border-light`, `--border-focus`
- **阴影** / Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- **圆角** / Border Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
- **间距** / Spacing: `--spacing-xs` to `--spacing-2xl`
- **字体大小** / Font Sizes: `--text-xs` to `--text-3xl`
- **过渡动画** / Transitions: `--transition-fast`, `--transition-normal`, `--transition-slow`
- **🆕 侧边栏专用变量** / Sidebar Variables: `--sidebar-bg`, `--sidebar-border`, `--sidebar-text`, etc.

### 🆕 侧边栏主题变量 / Sidebar Theme Variables

每个主题现在都包含专门的侧边栏变量：

Each theme now includes dedicated sidebar variables:

```scss
// 侧边栏专用变量
--sidebar-bg: #主背景色;           // 侧边栏背景色
--sidebar-border: #边框色;         // 侧边栏边框色
--sidebar-text: #文字色;           // 侧边栏文字色
--sidebar-text-hover: #悬停文字色; // 悬停时文字色
--sidebar-item-hover: #悬停背景色; // 菜单项悬停背景色
--sidebar-item-active: #激活背景色; // 激活菜单项背景色
```

## 使用方法 / Usage

### 1. 导入主题 / Import Themes

在 `index.scss` 中通过 `@import` 导入所有主题文件：

All theme files are imported in `index.scss` via `@import`:

```scss
@import './themes/dark.scss';
@import './themes/light.scss';
```

### 2. 主题切换 / Theme Switching

在 `MainLayout.vue` 中通过切换CSS类来实现主题切换：

Theme switching is implemented by toggling CSS classes in `MainLayout.vue`:

```javascript
const changeTheme = (theme: string) => {
  // 移除所有主题类
  document.documentElement.classList.remove('theme-light', 'theme-dark')
  
  // 添加新主题类
  document.documentElement.classList.add(`theme-${theme}`)
  
  // 持久化主题设置
  localStorage.setItem('theme', theme)
}
```

### 3. 默认主题 / Default Theme

暗黑主题（dark）是默认主题，定义在 `:root` 和 `:root.theme-dark` 选择器中。

Dark theme is the default theme, defined in both `:root` and `:root.theme-dark` selectors.

## 主题特色 / Theme Features

### 🌙 暗黑主题 (Dark Theme)
- **侧边栏**: 深蓝色背景 (#0f172a)，浅色文字
- **主色调**: 紫色系 (#6366f1)
- 适合夜间使用，减少眼部疲劳

### ☀️ 明亮主题 (Light Theme)  
- **侧边栏**: 白色背景 (#ffffff)，深色文字
- **主色调**: 蓝色系 (#3b82f6)
- 适合日间使用，清晰明亮

## 🆕 侧边栏主题适配 / Sidebar Theme Adaptation

现在所有UI组件都完全支持主题切换：

All UI components now fully support theme switching:

- ✅ **侧边栏背景和边框** / Sidebar background and borders
- ✅ **菜单项文字颜色** / Menu item text colors  
- ✅ **悬停和激活状态** / Hover and active states
- ✅ **Logo区域样式** / Logo area styling
- ✅ **顶部导航栏** / Top navigation bar
- ✅ **主题切换按钮** / Theme toggle buttons
- ✅ **全屏和功能按钮** / Fullscreen and function buttons

## 扩展新主题 / Adding New Themes

1. 在 `themes/` 目录下创建新的 `.scss` 文件
2. 定义 `:root.theme-{name}` 选择器和所有必要的CSS变量（包括侧边栏变量）
3. 在 `index.scss` 中添加 `@import` 语句
4. 在 `MainLayout.vue` 的 `themes` 数组中添加新主题选项
5. 更新 `changeTheme` 函数中的类名移除列表

### 新主题模板 / New Theme Template

```scss
:root.theme-{name} {
  // 基础颜色变量
  --primary-color: #主色;
  --bg-primary: #主背景;
  --text-primary: #主文字;
  // ... 其他变量
  
  // 侧边栏专用变量（必须包含）
  --sidebar-bg: #侧边栏背景;
  --sidebar-border: #侧边栏边框;
  --sidebar-text: #侧边栏文字;
  --sidebar-text-hover: #悬停文字;
  --sidebar-item-hover: #悬停背景;
  --sidebar-item-active: #激活背景;
}
```

## 注意事项 / Notes

- 所有主题文件必须包含相同的CSS变量名称（包括侧边栏变量）
- 主题切换通过CSS类实现，无需重新加载页面
- 主题设置会自动保存到 localStorage 中
- 响应式设计在所有主题中都得到支持
- **🆕 侧边栏现在完全响应主题变化，包括Element Plus组件**