#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证本地开发配置是否正确
检查所有相关文件的配置
"""

import os
import re

def check_file_config(file_path, expected_configs, file_description):
    """检查文件配置"""
    print(f"\n🔍 检查 {file_description} ({file_path})")
    
    if not os.path.exists(file_path):
        print(f"❌ 文件不存在: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    all_correct = True
    for config_name, expected_value in expected_configs.items():
        if isinstance(expected_value, str):
            # 简单字符串匹配
            if expected_value in content:
                print(f"✅ {config_name}: 配置正确")
            else:
                print(f"❌ {config_name}: 配置错误或缺失")
                all_correct = False
        elif isinstance(expected_value, dict):
            # 正则表达式匹配
            pattern = expected_value['pattern']
            match = re.search(pattern, content)
            if match:
                print(f"✅ {config_name}: {match.group(0)}")
            else:
                print(f"❌ {config_name}: 未找到匹配的配置")
                all_correct = False
    
    return all_correct

def main():
    print("🔍 验证本地开发配置")
    print("=" * 50)
    
    all_files_correct = True
    
    # 检查 .env 文件
    env_configs = {
        "VITE_API_BASE_URL": "VITE_API_BASE_URL=/api",
        "VITE_APP_URL": "VITE_APP_URL=http://localhost:5173",
    }
    if not check_file_config(".env", env_configs, ".env 主环境配置"):
        all_files_correct = False
    
    # 检查 .env.development 文件
    env_dev_configs = {
        "VITE_API_PROXY_TARGET": "VITE_API_PROXY_TARGET=http://localhost:3000",
        "VITE_API_BASE_URL": "VITE_API_BASE_URL=/api",
    }
    if not check_file_config(".env.development", env_dev_configs, ".env.development 开发环境配置"):
        all_files_correct = False
    
    # 检查 allpagetask2.0.py
    task_configs = {
        "BASE_URL": 'BASE_URL = "http://localhost:5173"',
        "帮助文档URL": "设置基础URL (默认: http://localhost:5173)",
    }
    if not check_file_config("全站评测目录/allpagetask2.0.py", task_configs, "AllPageTask 2.0 测试脚本"):
        all_files_correct = False
    
    # 检查 autofixclaude.cjs
    autofix_configs = {
        "URL转换注释": {
            'pattern': r'//.*注释掉URL转换逻辑.*\n.*\/\*'
        }
    }
    if not check_file_config("/home/devbox/自编脚本/autofixclaude.cjs", autofix_configs, "AutoFixClaude 修复脚本"):
        all_files_correct = False
    
    # 检查 vite.config.ts
    vite_configs = {
        "代理配置": "target: 'http://localhost:3000'",
    }
    if not check_file_config("vite.config.ts", vite_configs, "Vite 构建配置"):
        all_files_correct = False
    
    print("\n" + "=" * 50)
    
    if all_files_correct:
        print("🎉 所有配置检查通过！本地开发环境配置正确")
        print("\n📝 当前配置摘要:")
        print("  - 前端开发服务器: http://localhost:5173")
        print("  - 后端API服务器: http://localhost:3000")
        print("  - API请求路径: /api (通过Vite代理到后端)")
        print("  - 测试脚本: allpagetask2.0.py")
        print("  - 修复脚本: autofixclaude.cjs")
        
        print("\n🚀 使用方法:")
        print("1. 启动后端: cd server && npm run dev")
        print("2. 启动前端: cd client && npm run dev")
        print("3. 运行测试: cd client/全站评测目录 && python3 allpagetask2.0.py")
        
    else:
        print("❌ 配置检查失败！请检查上述错误并修复")
    
    return all_files_correct

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)