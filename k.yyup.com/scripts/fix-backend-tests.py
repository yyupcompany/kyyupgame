#!/usr/bin/env python3
"""
批量修复后端测试文件
只修复测试用例，不修改源代码
"""

import os
import re
import sys
from pathlib import Path

# 需要修复的问题类型
FIXES = {
    'jest_mock_middleware': {
        'pattern': r'const mock(\w+)Middleware = jest\.fn\(\(req, res, next\) => next\(\)\);',
        'replacement': r'const mock\1Middleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());',
        'description': '修复中间件mock的类型定义'
    },
    'unstable_mock_incomplete': {
        'pattern': r"jest\.unstable_mockModule\('([^']+)', \(\) => \(\{\n(?!  \w+:)",
        'replacement': None,  # 需要手动处理
        'description': '修复不完整的unstable_mockModule'
    },
    'as_const_array_access': {
        'pattern': r'(\w+)\[i % \d+\] as const',
        'replacement': None,  # 需要根据上下文确定类型
        'description': '修复as const类型断言'
    },
    'this_implicit_any': {
        'pattern': r'mockImplementation\(function\(\) \{',
        'replacement': r'mockImplementation(function(this: any) {',
        'description': '修复this隐式any类型'
    },
    'mock_resolved_value_boolean': {
        'pattern': r'\.mockResolvedValue\((true|false)\)',
        'replacement': r'.mockResolvedValue(undefined)',
        'description': '修复mockResolvedValue的返回值类型'
    }
}

def fix_file(file_path):
    """修复单个文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixes_applied = []
        
        # 应用各种修复
        for fix_name, fix_config in FIXES.items():
            if fix_config['replacement'] is None:
                continue
                
            pattern = fix_config['pattern']
            replacement = fix_config['replacement']
            
            new_content, count = re.subn(pattern, replacement, content)
            if count > 0:
                content = new_content
                fixes_applied.append(f"{fix_name} ({count}次)")
        
        # 如果有修改，写回文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, fixes_applied
        
        return False, []
        
    except Exception as e:
        print(f"❌ 处理文件失败 {file_path}: {e}")
        return False, []

def main():
    """主函数"""
    print("🔧 开始批量修复后端测试文件...")
    print()
    
    # 测试文件目录
    test_dirs = [
        'server/tests/unit/controllers',
        'server/tests/unit/models',
        'server/tests/unit/routes',
        'server/tests/unit/services',
        'server/tests/unit/middlewares',
        'server/tests/unit/utils'
    ]
    
    total_files = 0
    fixed_files = 0
    skipped_files = 0
    
    for test_dir in test_dirs:
        if not os.path.exists(test_dir):
            print(f"⏭️  目录不存在: {test_dir}")
            continue
        
        print(f"📁 处理目录: {test_dir}")
        
        for root, dirs, files in os.walk(test_dir):
            for file in files:
                if not file.endswith('.test.ts'):
                    continue
                
                total_files += 1
                file_path = os.path.join(root, file)
                
                # 修复文件
                fixed, fixes = fix_file(file_path)
                
                if fixed:
                    fixed_files += 1
                    print(f"  ✅ {file}: {', '.join(fixes)}")
                else:
                    skipped_files += 1
                    # print(f"  ⏭️  {file}: 无需修复")
    
    print()
    print("📊 修复统计:")
    print(f"  总文件数: {total_files}")
    print(f"  已修复: {fixed_files}")
    print(f"  跳过: {skipped_files}")
    print()
    print("✅ 批量修复完成！")
    print()
    print("⚠️  注意: 以下问题需要手动修复:")
    print("  1. 不完整的jest.unstable_mockModule调用")
    print("  2. 模块导出成员不存在的问题")
    print("  3. as const类型断言问题")
    print("  4. 数据库模型类型问题")

if __name__ == '__main__':
    main()

