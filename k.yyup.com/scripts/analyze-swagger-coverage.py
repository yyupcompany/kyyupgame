#!/usr/bin/env python3
"""
分析Swagger文档覆盖率
检查所有路由文件和控制器文件的Swagger注释覆盖情况
"""

import os
import re
from pathlib import Path
from collections import defaultdict

def has_swagger_comments(file_path):
    """检查文件是否包含Swagger注释"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否有Swagger注释
        swagger_patterns = [
            r'@swagger',
            r'@openapi',
            r'/\*\*\s*\n\s*\*\s*@swagger',
            r'/\*\*\s*\n\s*\*\s*@openapi',
        ]
        
        for pattern in swagger_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False

def count_routes_in_file(file_path):
    """统计文件中的路由数量"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 统计路由定义
        route_patterns = [
            r'router\.(get|post|put|patch|delete|all)\s*\(',
            r'app\.(get|post|put|patch|delete|all)\s*\(',
        ]
        
        total_routes = 0
        for pattern in route_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            total_routes += len(matches)
        
        return total_routes
    except Exception as e:
        print(f"Error counting routes in {file_path}: {e}")
        return 0

def count_swagger_routes_in_file(file_path):
    """统计文件中有Swagger注释的路由数量"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 查找所有Swagger注释块
        swagger_blocks = re.findall(
            r'/\*\*[\s\S]*?@(swagger|openapi)[\s\S]*?\*/',
            content,
            re.IGNORECASE
        )
        
        return len(swagger_blocks)
    except Exception as e:
        print(f"Error counting swagger routes in {file_path}: {e}")
        return 0

def count_controller_methods(file_path):
    """统计控制器文件中的方法数量"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 统计导出的函数和类方法
        patterns = [
            r'export\s+(async\s+)?function\s+\w+',
            r'(public|private|protected)?\s*(async\s+)?\w+\s*\([^)]*\)\s*:\s*\w+',
            r'export\s+const\s+\w+\s*=\s*(async\s+)?\([^)]*\)\s*=>',
        ]
        
        total_methods = 0
        for pattern in patterns:
            matches = re.findall(pattern, content)
            total_methods += len(matches)
        
        return total_methods
    except Exception as e:
        print(f"Error counting methods in {file_path}: {e}")
        return 0

def analyze_directory(directory, file_pattern='*.ts'):
    """分析目录中的文件"""
    stats = {
        'total_files': 0,
        'files_with_swagger': 0,
        'files_without_swagger': 0,
        'total_routes': 0,
        'routes_with_swagger': 0,
        'files': []
    }
    
    for file_path in Path(directory).rglob(file_pattern):
        if file_path.is_file():
            stats['total_files'] += 1
            
            has_swagger = has_swagger_comments(str(file_path))
            routes_count = count_routes_in_file(str(file_path))
            swagger_routes_count = count_swagger_routes_in_file(str(file_path))
            
            if has_swagger:
                stats['files_with_swagger'] += 1
            else:
                stats['files_without_swagger'] += 1
            
            stats['total_routes'] += routes_count
            stats['routes_with_swagger'] += swagger_routes_count
            
            stats['files'].append({
                'path': str(file_path),
                'name': file_path.name,
                'has_swagger': has_swagger,
                'routes_count': routes_count,
                'swagger_routes_count': swagger_routes_count
            })
    
    return stats

def print_swagger_coverage_report(routes_stats, controllers_stats):
    """打印Swagger覆盖率报告"""
    
    print("=" * 100)
    print("Swagger文档覆盖率详细报告")
    print("=" * 100)
    print()
    
    # 总体统计
    print("📊 总体覆盖率")
    print("-" * 100)
    
    total_files = routes_stats['total_files'] + controllers_stats['total_files']
    files_with_swagger = routes_stats['files_with_swagger'] + controllers_stats['files_with_swagger']
    files_without_swagger = routes_stats['files_without_swagger'] + controllers_stats['files_without_swagger']
    
    file_coverage = (files_with_swagger / total_files * 100) if total_files > 0 else 0
    
    print(f"总文件数: {total_files}")
    print(f"有Swagger注释的文件: {files_with_swagger} ({file_coverage:.2f}%)")
    print(f"无Swagger注释的文件: {files_without_swagger} ({100-file_coverage:.2f}%)")
    print()
    
    # Routes统计
    print("📁 Routes文件覆盖率")
    print("-" * 100)
    print(f"总文件数: {routes_stats['total_files']}")
    print(f"有Swagger注释的文件: {routes_stats['files_with_swagger']}")
    print(f"无Swagger注释的文件: {routes_stats['files_without_swagger']}")
    
    routes_file_coverage = (routes_stats['files_with_swagger'] / routes_stats['total_files'] * 100) if routes_stats['total_files'] > 0 else 0
    print(f"文件覆盖率: {routes_file_coverage:.2f}%")
    print()
    
    print(f"总路由数: {routes_stats['total_routes']}")
    print(f"有Swagger注释的路由: {routes_stats['routes_with_swagger']}")
    
    routes_coverage = (routes_stats['routes_with_swagger'] / routes_stats['total_routes'] * 100) if routes_stats['total_routes'] > 0 else 0
    print(f"路由覆盖率: {routes_coverage:.2f}%")
    print()
    
    # Controllers统计
    print("📁 Controllers文件覆盖率")
    print("-" * 100)
    print(f"总文件数: {controllers_stats['total_files']}")
    print(f"有Swagger注释的文件: {controllers_stats['files_with_swagger']}")
    print(f"无Swagger注释的文件: {controllers_stats['files_without_swagger']}")
    
    controllers_file_coverage = (controllers_stats['files_with_swagger'] / controllers_stats['total_files'] * 100) if controllers_stats['total_files'] > 0 else 0
    print(f"文件覆盖率: {controllers_file_coverage:.2f}%")
    print()
    
    # 无Swagger注释的文件列表
    print("❌ 无Swagger注释的Routes文件 (前20个)")
    print("-" * 100)
    
    files_without_swagger = [f for f in routes_stats['files'] if not f['has_swagger']]
    for i, file_info in enumerate(files_without_swagger[:20], 1):
        print(f"{i:3}. {file_info['name']:<50} (路由数: {file_info['routes_count']})")
    
    if len(files_without_swagger) > 20:
        print(f"... 还有 {len(files_without_swagger) - 20} 个文件")
    print()
    
    print("❌ 无Swagger注释的Controllers文件 (前20个)")
    print("-" * 100)
    
    files_without_swagger = [f for f in controllers_stats['files'] if not f['has_swagger']]
    for i, file_info in enumerate(files_without_swagger[:20], 1):
        print(f"{i:3}. {file_info['name']}")
    
    if len(files_without_swagger) > 20:
        print(f"... 还有 {len(files_without_swagger) - 20} 个文件")
    print()
    
    # 覆盖率等级
    print("📈 覆盖率等级")
    print("-" * 100)
    
    if file_coverage >= 90:
        grade = "优秀 ✅"
    elif file_coverage >= 80:
        grade = "良好 ✅"
    elif file_coverage >= 70:
        grade = "中等 ⚠️"
    elif file_coverage >= 60:
        grade = "及格 ⚠️"
    else:
        grade = "不及格 ❌"
    
    print(f"文件覆盖率: {file_coverage:.2f}% - {grade}")
    print(f"路由覆盖率: {routes_coverage:.2f}% - {grade}")
    print()
    
    # 目标对比
    print("🎯 目标对比")
    print("-" * 100)
    print(f"{'指标':<30} {'当前值':>15} {'目标值':>15} {'差距':>15} {'状态':>15}")
    print("-" * 100)
    
    target = 90.0
    gap = target - file_coverage
    status = "✅ 达标" if file_coverage >= target else f"❌ 差 {gap:.2f}%"
    print(f"{'文件覆盖率':<30} {file_coverage:>14.2f}% {target:>14.2f}% {gap:>14.2f}% {status:>15}")
    
    gap = target - routes_coverage
    status = "✅ 达标" if routes_coverage >= target else f"❌ 差 {gap:.2f}%"
    print(f"{'路由覆盖率':<30} {routes_coverage:>14.2f}% {target:>14.2f}% {gap:>14.2f}% {status:>15}")
    
    print("-" * 100)

def main():
    """主函数"""
    print("🔍 开始分析Swagger文档覆盖率...")
    print()
    
    # 分析routes目录
    routes_dir = 'server/src/routes'
    routes_stats = analyze_directory(routes_dir, '*.ts')
    
    # 分析controllers目录
    controllers_dir = 'server/src/controllers'
    controllers_stats = analyze_directory(controllers_dir, '*.ts')
    
    # 打印报告
    print_swagger_coverage_report(routes_stats, controllers_stats)

if __name__ == '__main__':
    main()

