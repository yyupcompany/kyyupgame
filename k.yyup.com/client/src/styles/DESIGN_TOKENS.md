# 设计令牌系统文档

本文档定义了整个项目的设计令牌系统，所有页面和组件应该使用这些令牌而不是硬编码值。

---

## 🎨 颜色令牌

### 主色调
```css
--primary-color: #6366f1;        /* 紫蓝色 - 暗黑主题 */
--primary-hover: #4f46e5;        /* 深紫蓝 - 悬停状态 */
--primary-light: #818cf8;        /* 浅紫蓝 - 浅色变体 */
```

### 功能色
```css
--success-color: #10b981;        /* 绿色 - 成功状态 */
--warning-color: #f97316;        /* 橙色 - 警告状态 */
--danger-color: #ef4444;         /* 红色 - 危险状态 */
--info-color: #06b6d4;           /* 青色 - 信息状态 */
```

### 背景色
```css
--bg-primary: #0f172a;           /* 主背景 */
--bg-secondary: #1e293b;         /* 次背景 */
--bg-tertiary: #334155;          /* 三级背景 */
--bg-card: #1e293b;              /* 卡片背景 */
--bg-hover: #334155;             /* 悬停背景 */
```

### 文字色
```css
--text-primary: #f8fafc;         /* 主文字 */
--text-secondary: #cbd5e1;       /* 次文字 */
--text-muted: #94a3b8;           /* 弱文字 */
--text-disabled: #64748b;        /* 禁用文字 */
--text-on-primary: #ffffff;      /* 主色上的文字 */
```

### 边框色
```css
--border-color: rgba(255, 255, 255, 0.08);
--border-light: rgba(255, 255, 255, 0.12);
--border-focus: rgba(139, 92, 246, 0.6);
```

---

## 📏 间距令牌

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 0.75rem;   /* 12px */
--spacing-lg: 1rem;      /* 16px */
--spacing-xl: 1.5rem;    /* 24px */
--spacing-2xl: 2rem;     /* 32px */
```

---

## 🔤 字体令牌

### 字体大小
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
```

### 字体权重
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### 行高
```css
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
--line-height-loose: 2;
```

---

## 🎭 圆角令牌

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
```

---

## 🌟 阴影令牌

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
```

---

## 🌈 渐变令牌

```css
--gradient-purple: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
--gradient-blue: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

---

## ✨ 发光效果令牌

```css
--glow-purple: rgba(99, 102, 241, 0.3);
--glow-blue: rgba(59, 130, 246, 0.3);
--glow-success: rgba(16, 185, 129, 0.3);
--glow-warning: rgba(245, 158, 11, 0.3);
--glow-danger: rgba(239, 68, 68, 0.3);
```

---

## ⏱️ 过渡动画令牌

```css
--transition-fast: 0.15s ease-in-out;
--transition-normal: 0.3s ease-in-out;
--transition-slow: 0.5s ease-in-out;
```

---

## 📦 组件样式令牌

### 容器
```css
--container-max-width: 1200px;
--page-padding: 24px;
--section-margin-bottom: 40px;
--section-padding: 24px;
```

### 卡片
```css
--card-hover-transform: translateY(-4px);
--card-transition: all 0.3s ease;
--card-header-padding: 20px 24px 16px;
--card-content-padding: 20px 24px;
--card-footer-padding: 16px 24px 24px;
```

### 统计卡片
```css
--stat-item-margin-bottom: 16px;
--stat-label-font-size: 1rem;
--stat-value-font-size: 1.25rem;
--stat-value-font-weight: 600;
```

### 按钮
```css
--btn-gradient-padding: 12px 20px;
--btn-gradient-border-radius: var(--radius-md);
--btn-gradient-font-size: var(--text-sm);
--btn-gradient-font-weight: 500;
--btn-gradient-transition: all 0.15s ease;
--btn-gradient-hover-transform: translateY(-2px);
--btn-gradient-hover-box-shadow: var(--shadow-md);
```

### 移动端
```css
--mobile-page-padding: 16px;
--mobile-section-padding: 16px;
--mobile-section-title-font-size: 1.5rem;
--mobile-card-grid-gap: 16px;
```

---

## 📝 使用示例

### ❌ 不推荐（硬编码）
```vue
<style scoped>
.my-component {
  color: #f8fafc;
  background: #1e293b;
  padding: 24px;
  font-size: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
}
</style>
```

### ✅ 推荐（使用令牌）
```vue
<style scoped>
.my-component {
  color: var(--text-primary);
  background: var(--bg-secondary);
  padding: var(--spacing-xl);
  font-size: var(--text-base);
  box-shadow: var(--shadow-md);
}
</style>
```

---

## 🔄 主题切换

所有令牌都支持主题切换。系统会自动根据 `html[data-theme]` 属性切换令牌值。

```javascript
// 切换到浅色主题
document.documentElement.setAttribute('data-theme', 'light');

// 切换到暗黑主题
document.documentElement.setAttribute('data-theme', 'dark');
```

---

**最后更新**: 2025-10-25  
**版本**: 2.0  
**维护者**: 开发团队

