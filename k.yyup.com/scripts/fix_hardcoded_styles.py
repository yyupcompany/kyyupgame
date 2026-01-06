#!/usr/bin/env python3

import os
import re

# 硬编码值到设计令牌的映射
replacements = [
    # 颜色映射
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

files_to_fix = [
    'client/src/pages/system/system-dialog-styles.scss',
    'client/src/pages/system/user-management-ux-styles.scss',
]

base_path = '/home/devbox/project/k.yyup.com'

for file_path in files_to_fix:
    full_path = os.path.join(base_path, file_path)
    
    if not os.path.exists(full_path):
        print(f"❌ 文件不存在: {full_path}")
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    change_count = 0
    
    for old_val, new_val in replacements:
        if old_val in content:
            count = content.count(old_val)
            content = content.replace(old_val, new_val)
            change_count += count
    
    if change_count > 0:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ {file_path}: 修复了 {change_count} 个硬编码值")
    else:
        print(f"⏭️  {file_path}: 没有找到需要修复的值")

print("\n✨ 完成！")

