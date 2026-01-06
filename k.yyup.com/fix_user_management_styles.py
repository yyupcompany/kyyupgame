#!/usr/bin/env python3

import os

file_path = '/home/devbox/project/k.yyup.com/client/src/pages/system/user-management-ux-styles.scss'

# 读取文件
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 颜色替换
color_replacements = [
    ('#8b5cf6', 'var(--primary-color)'),
    ('#7c3aed', 'var(--primary-hover)'),
    ('#3b82f6', 'var(--primary-color)'),
    ('#1d4ed8', 'var(--primary-hover)'),
    ('#f59e0b', 'var(--warning-color)'),
    ('#d97706', 'var(--warning-color)'),
    ('#fafbfc', 'var(--bg-secondary)'),
    ('#f8fafc', 'var(--bg-secondary)'),
    ('#f1f5f9', 'var(--bg-tertiary)'),
    ('#374151', 'var(--text-primary)'),
    ('#1f2937', 'var(--text-primary)'),
    ('#6b7280', 'var(--text-secondary)'),
    ('#e5e7eb', 'var(--border-color)'),
    ('#d1d5db', 'var(--border-light)'),
    ('#111827', 'var(--bg-primary)'),
    ('#f9fafb', 'var(--text-primary)'),
    ('#4b5563', 'var(--bg-tertiary)'),
    ('#9ca3af', 'var(--text-secondary)'),
    ('#c7d2fe', 'var(--primary-light)'),
]

# 尺寸替换
size_replacements = [
    ('border-radius: 20px', 'border-radius: var(--radius-xl)'),
    ('border-radius: 16px', 'border-radius: var(--radius-lg)'),
    ('border-radius: 12px', 'border-radius: var(--radius-md)'),
    ('border-radius: 8px', 'border-radius: var(--radius-sm)'),
    ('border-radius: 2px', 'border-radius: var(--radius-xs)'),
    ('padding: 32px', 'padding: var(--spacing-2xl)'),
    ('padding: 28px', 'padding: var(--spacing-xl)'),
    ('padding: 24px', 'padding: var(--spacing-xl)'),
    ('padding: 20px', 'padding: var(--spacing-lg)'),
    ('padding: 16px', 'padding: var(--spacing-lg)'),
    ('padding: 12px', 'padding: var(--spacing-md)'),
    ('padding: 8px', 'padding: var(--spacing-sm)'),
    ('gap: 24px', 'gap: var(--spacing-xl)'),
    ('gap: 16px', 'gap: var(--spacing-lg)'),
    ('gap: 12px', 'gap: var(--spacing-md)'),
    ('gap: 8px', 'gap: var(--spacing-sm)'),
    ('margin-bottom: 32px', 'margin-bottom: var(--spacing-2xl)'),
    ('margin-bottom: 28px', 'margin-bottom: var(--spacing-xl)'),
    ('margin-bottom: 24px', 'margin-bottom: var(--spacing-xl)'),
    ('margin-bottom: 16px', 'margin-bottom: var(--spacing-lg)'),
    ('margin-bottom: 12px', 'margin-bottom: var(--spacing-md)'),
    ('margin-bottom: 8px', 'margin-bottom: var(--spacing-sm)'),
    ('margin-top: 8px', 'margin-top: var(--spacing-sm)'),
    ('font-size: 1rem', 'font-size: var(--text-base)'),
    ('font-size: 0.875rem', 'font-size: var(--text-sm)'),
    ('font-size: 0.75rem', 'font-size: var(--text-xs)'),
    ('font-weight: 600', 'font-weight: var(--font-semibold)'),
    ('font-weight: 700', 'font-weight: var(--font-bold)'),
]

count = 0

# 替换颜色
for old, new in color_replacements:
    matches = content.count(old)
    if matches > 0:
        content = content.replace(old, new)
        count += matches

# 替换尺寸
for old, new in size_replacements:
    matches = content.count(old)
    if matches > 0:
        content = content.replace(old, new)
        count += matches

# 写入文件
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✨ 修复完成！总共修复了 {count} 个值")

