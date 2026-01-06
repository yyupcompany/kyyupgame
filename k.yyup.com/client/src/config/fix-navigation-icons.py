#!/usr/bin/env python3
"""
批量修复navigation.ts中的icon字段
将错误的SVG path替换为正确的图标名称
"""

import re
import os

def fix_navigation_icons():
    # 读取icon映射表
    icon_mapping = {}

    # 从icon-mapping.ts中提取SVG_PATH_TO_ICON映射
    mapping_file = 'icon-mapping.ts'
    if os.path.exists(mapping_file):
        with open(mapping_file, 'r', encoding='utf-8') as f:
            content = f.read()

            # 提取SVG path到图标名称的映射
            pattern = r"'([^']+)':\s*'([^']+)'"
            matches = re.findall(pattern, content)
            for svg_path, icon_name in matches:
                icon_mapping[svg_path] = icon_name

    print(f"加载了 {len(icon_mapping)} 个图标映射")

    # 读取navigation.ts文件
    nav_file = 'navigation.ts'
    if not os.path.exists(nav_file):
        print(f"错误: {nav_file} 文件不存在")
        return

    with open(nav_file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes_count = 0

    # 查找所有icon字段并修复
    # 匹配 icon: 'SVG path' 或 icon: "SVG path"
    icon_pattern = r"icon:\s*(['\"])([^'\"]+)(['\"])"

    def replace_icon(match):
        nonlocal changes_count
        quote = match.group(1)
        svg_path = match.group(2)

        # 检查是否为SVG path
        if svg_path.startswith('M') and len(svg_path) > 20:
            # 查找匹配的图标名称
            if svg_path in icon_mapping:
                new_icon_name = icon_mapping[svg_path]
                replacement = f"icon: {quote}{new_icon_name}{quote}"
                print(f"修复: {svg_path[:50]}... -> {new_icon_name}")
                changes_count += 1
                return replacement
            else:
                print(f"未找到匹配: {svg_path[:50]}...")
        else:
            # 已经是图标名称，无需修复
            pass

        return match.group(0)  # 返回原始匹配

    # 执行替换
    content = re.sub(icon_pattern, replace_icon, content)

    # 如果有修改，保存文件
    if content != original_content:
        with open(nav_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ 成功修复了 {changes_count} 个图标字段")
    else:
        print("ℹ️ 没有需要修复的图标字段")

if __name__ == "__main__":
    fix_navigation_icons()