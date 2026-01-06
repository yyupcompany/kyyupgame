# 核心设计令牌系统

## 📊 令牌统计

**总计**: 35 个核心令牌（精简版）

### 分类统计
- 颜色系统: 8 个基础颜色 + 4 个背景色 + 4 个文字色 + 4 个边框色 = 20 个
- 间距系统: 6 个 (xs, sm, md, lg, xl, 2xl)
- 字体系统: 7 个 (大小) + 6 个 (权重) + 4 个 (行高) = 17 个
- 阴影系统: 4 个 (sm, md, lg, xl)
- 圆角系统: 4 个 (sm, md, lg, xl)
- 过渡系统: 3 个 (fast, normal, slow)
- 渐变系统: 5 个 (purple, blue, success, warning, danger)
- 发光系统: 5 个 (purple, blue, success, warning, danger)

---

## 🎨 核心令牌详解

### 1. 颜色系统 (20个)

#### 基础颜色 (8个)
```css
--primary-color: #6366f1;        /* 主色 */
--primary-hover: #4f46e5;        /* 主色悬停 */
--primary-light: #818cf8;        /* 主色浅色 */
--secondary-color: #8b5cf6;      /* 次色 */
--accent-color: #f59e0b;         /* 强调色 */
--danger-color: #ef4444;         /* 危险色 */
--warning-color: #f97316;        /* 警告色 */
--info-color: #06b6d4;           /* 信息色 */
```

#### 背景色 (4个)
```css
--bg-primary: #0f172a;           /* 主背景 */
--bg-secondary: #1e293b;         /* 次背景 */
--bg-tertiary: #334155;          /* 三级背景 */
--bg-card: #1e293b;              /* 卡片背景 */
--bg-hover: #334155;             /* 悬停背景 */
```

#### 文字色 (4个)
```css
--text-primary: #f8fafc;         /* 主文字 */
--text-secondary: #cbd5e1;       /* 次文字 */
--text-muted: #94a3b8;           /* 静音文字 */
--text-disabled: #64748b;        /* 禁用文字 */
```

#### 边框色 (4个)
```css
--border-color: rgba(255, 255, 255, 0.08);
--border-light: rgba(255, 255, 255, 0.12);
--border-focus: rgba(139, 92, 246, 0.6);
--bg-sidebar: #0f172a;
```

### 2. 间距系统 (6个)

基于 8px 网格系统：
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 0.75rem;   /* 12px */
--spacing-lg: 1rem;      /* 16px */
--spacing-xl: 1.5rem;    /* 24px */
--spacing-2xl: 2rem;     /* 32px */
```

### 3. 字体系统 (17个)

#### 字体大小 (7个)
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
```

#### 字体权重 (6个)
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

#### 行高 (4个)
```css
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
--line-height-loose: 2;
```

### 4. 阴影系统 (4个)

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
```

### 5. 圆角系统 (4个)

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
```

### 6. 过渡系统 (3个)

```css
--transition-fast: 0.15s ease-in-out;
--transition-normal: 0.3s ease-in-out;
--transition-slow: 0.5s ease-in-out;
```

### 7. 渐变系统 (5个)

```css
--gradient-purple: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
--gradient-blue: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

### 8. 发光系统 (5个)

```css
--glow-purple: rgba(99, 102, 241, 0.3);
--glow-blue: rgba(59, 130, 246, 0.3);
--glow-success: rgba(16, 185, 129, 0.3);
--glow-warning: rgba(245, 158, 11, 0.3);
--glow-danger: rgba(239, 68, 68, 0.3);
```

---

## 💡 使用示例

### 示例 1: 创建卡片样式

```scss
.card {
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
}
```

### 示例 2: 创建按钮样式

```scss
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  background: var(--primary-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--primary-hover);
    box-shadow: 0 0 20px var(--glow-purple);
  }
}
```

### 示例 3: 创建标题样式

```scss
.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-lg);
}
```

---

## ✅ 优势

1. **最小化**: 只有 35 个核心令牌，易于理解和维护
2. **高度复用**: 通过组合令牌创建任何样式
3. **灵活性**: 支持暗黑和浅色主题
4. **一致性**: 所有页面使用相同的令牌
5. **可扩展**: 新增令牌时不会破坏现有样式

---

## 🎯 最佳实践

1. **始终使用令牌**: 不要硬编码颜色、间距等值
2. **组合令牌**: 使用多个令牌组合创建复杂样式
3. **保持简洁**: 避免创建特定组件的令牌
4. **响应式设计**: 使用间距令牌实现响应式布局
5. **主题切换**: 令牌自动支持主题切换

---

**最后更新**: 2025-10-25  
**版本**: 1.0 (精简版)

