# System 页面样式修复完整计划

**开始时间**: 2025-10-25  
**目标**: 彻底修复所有 system 页面中的硬编码样式值

---

## 📋 需要修复的文件

### 1. system-dialog-styles.scss (634行)
**状态**: 🔄 进行中

**已修复**:
- ✅ border-radius: 20px → var(--radius-xl)
- ✅ border-radius: 16px → var(--radius-lg)
- ✅ border-radius: 12px → var(--radius-md)
- ✅ padding: 24px 32px → var(--spacing-xl) var(--spacing-2xl)
- ✅ background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) → var(--gradient-purple)
- ✅ width: 40px, height: 40px → var(--size-icon-lg)
- ✅ font-size: 18px → var(--text-lg)
- ✅ padding: 32px → var(--spacing-2xl)
- ✅ background: #fafbfc → var(--bg-secondary)
- ✅ margin-bottom: 28px → var(--spacing-xl)
- ✅ font-weight: 600 → var(--font-semibold)
- ✅ color: #374151 → var(--text-primary)
- ✅ font-size: 1rem → var(--text-base)
- ✅ line-height: 1.5 → var(--line-height-normal)
- ✅ margin-bottom: 8px → var(--spacing-sm)
- ✅ background: #8b5cf6 → var(--primary-color)
- ✅ border-radius: 2px → var(--radius-xs)

**待修复**:
- ⏳ 其他硬编码颜色值
- ⏳ 其他硬编码像素值
- ⏳ 其他硬编码字体大小

### 2. user-management-ux-styles.scss (933行)
**状态**: ⏳ 待开始

**需要修复**:
- 135 个硬编码值

### 3. Dashboard.vue
**状态**: ⏳ 待开始

**需要修复**:
- 17 个硬编码值

### 4. Security.vue
**状态**: ⏳ 待开始

**需要修复**:
- 16 个硬编码值

### 5. User.vue
**状态**: ⏳ 待开始

**需要修复**:
- 9 个硬编码值

---

## 🎯 修复策略

### 第一阶段: 完成 system-dialog-styles.scss
1. 替换所有颜色值
2. 替换所有像素值
3. 替换所有字体大小
4. 验证文件

### 第二阶段: 完成 user-management-ux-styles.scss
1. 替换所有颜色值
2. 替换所有像素值
3. 替换所有字体大小
4. 验证文件

### 第三阶段: 修复 Vue 文件
1. Dashboard.vue
2. Security.vue
3. User.vue

---

## 📊 修复进度

| 文件 | 总行数 | 硬编码值 | 已修复 | 进度 |
|------|--------|---------|--------|------|
| system-dialog-styles.scss | 634 | 98 | 17 | 17% |
| user-management-ux-styles.scss | 933 | 135 | 0 | 0% |
| Dashboard.vue | 1540 | 17 | 0 | 0% |
| Security.vue | 1760 | 16 | 0 | 0% |
| User.vue | 1158 | 9 | 0 | 0% |
| **总计** | **6025** | **275** | **17** | **6%** |

---

## 🔧 修复映射表

### 颜色映射
```
#8b5cf6 → var(--primary-color)
#7c3aed → var(--primary-hover)
#3b82f6 → var(--primary-color)
#1d4ed8 → var(--primary-hover)
#f59e0b → var(--warning-color)
#d97706 → var(--warning-color)
#fafbfc → var(--bg-secondary)
#f8fafc → var(--bg-secondary)
#f1f5f9 → var(--bg-tertiary)
#374151 → var(--text-primary)
#1f2937 → var(--text-primary)
#6b7280 → var(--text-secondary)
#e5e7eb → var(--border-color)
#d1d5db → var(--border-light)
#111827 → var(--bg-primary)
#f9fafb → var(--text-primary)
#4b5563 → var(--bg-tertiary)
```

### 尺寸映射
```
2px → var(--radius-xs)
8px → var(--radius-sm)
12px → var(--radius-md)
16px → var(--radius-lg)
20px → var(--radius-xl)
32px → var(--size-avatar-sm)
40px → var(--size-icon-lg)
48px → var(--size-icon-xl)
80px → var(--size-avatar-lg)
100px → var(--size-avatar-xl)
120px → var(--size-avatar-2xl)
```

---

**最后更新**: 2025-10-25

