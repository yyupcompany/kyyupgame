#!/usr/bin/env python3
"""
分析后端测试覆盖率
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

def analyze_coverage(coverage_file):
    """分析覆盖率数据"""
    
    with open(coverage_file, 'r') as f:
        data = json.load(f)
    
    # 按目录分类统计
    stats_by_dir = defaultdict(lambda: {
        'files': 0,
        'statements': {'total': 0, 'covered': 0},
        'branches': {'total': 0, 'covered': 0},
        'functions': {'total': 0, 'covered': 0},
        'lines': {'total': 0, 'covered': 0}
    })
    
    total_stats = {
        'files': 0,
        'statements': {'total': 0, 'covered': 0},
        'branches': {'total': 0, 'covered': 0},
        'functions': {'total': 0, 'covered': 0},
        'lines': {'total': 0, 'covered': 0}
    }
    
    for file_path, file_data in data.items():
        # 提取目录
        if '/src/' in file_path:
            parts = file_path.split('/src/')[1].split('/')
            if len(parts) > 1:
                directory = parts[0]
            else:
                directory = 'root'
        else:
            directory = 'other'
        
        # 统计语句覆盖率
        statements = file_data.get('s', {})
        stmt_total = len(statements)
        stmt_covered = sum(1 for count in statements.values() if count > 0)
        
        # 统计分支覆盖率
        branches = file_data.get('b', {})
        branch_total = sum(len(b) for b in branches.values())
        branch_covered = sum(sum(1 for c in b if c > 0) for b in branches.values())
        
        # 统计函数覆盖率
        functions = file_data.get('f', {})
        func_total = len(functions)
        func_covered = sum(1 for count in functions.values() if count > 0)
        
        # 统计行覆盖率
        lines = file_data.get('statementMap', {})
        line_total = len(lines)
        line_covered = sum(1 for key in lines.keys() if statements.get(key, 0) > 0)
        
        # 更新目录统计
        stats_by_dir[directory]['files'] += 1
        stats_by_dir[directory]['statements']['total'] += stmt_total
        stats_by_dir[directory]['statements']['covered'] += stmt_covered
        stats_by_dir[directory]['branches']['total'] += branch_total
        stats_by_dir[directory]['branches']['covered'] += branch_covered
        stats_by_dir[directory]['functions']['total'] += func_total
        stats_by_dir[directory]['functions']['covered'] += func_covered
        stats_by_dir[directory]['lines']['total'] += line_total
        stats_by_dir[directory]['lines']['covered'] += line_covered
        
        # 更新总统计
        total_stats['files'] += 1
        total_stats['statements']['total'] += stmt_total
        total_stats['statements']['covered'] += stmt_covered
        total_stats['branches']['total'] += branch_total
        total_stats['branches']['covered'] += branch_covered
        total_stats['functions']['total'] += func_total
        total_stats['functions']['covered'] += func_covered
        total_stats['lines']['total'] += line_total
        total_stats['lines']['covered'] += line_covered
    
    return stats_by_dir, total_stats

def print_coverage_report(stats_by_dir, total_stats):
    """打印覆盖率报告"""
    
    print("=" * 100)
    print("后端测试覆盖率详细报告")
    print("=" * 100)
    print()
    
    # 总体覆盖率
    print("📊 总体覆盖率")
    print("-" * 100)
    print(f"{'指标':<20} {'总数':>15} {'覆盖数':>15} {'覆盖率':>15}")
    print("-" * 100)
    
    for metric in ['statements', 'branches', 'functions', 'lines']:
        total = total_stats[metric]['total']
        covered = total_stats[metric]['covered']
        percentage = (covered / total * 100) if total > 0 else 0
        print(f"{metric.capitalize():<20} {total:>15,} {covered:>15,} {percentage:>14.2f}%")
    
    print(f"{'Files':<20} {total_stats['files']:>15,} {'-':>15} {'-':>15}")
    print("-" * 100)
    print()
    
    # 按目录分类
    print("📁 按目录分类覆盖率")
    print("-" * 100)
    print(f"{'目录':<25} {'文件数':>10} {'语句覆盖率':>15} {'分支覆盖率':>15} {'函数覆盖率':>15} {'行覆盖率':>15}")
    print("-" * 100)
    
    # 排序目录
    sorted_dirs = sorted(stats_by_dir.items(), key=lambda x: x[0])
    
    for directory, stats in sorted_dirs:
        files = stats['files']
        
        stmt_pct = (stats['statements']['covered'] / stats['statements']['total'] * 100) if stats['statements']['total'] > 0 else 0
        branch_pct = (stats['branches']['covered'] / stats['branches']['total'] * 100) if stats['branches']['total'] > 0 else 0
        func_pct = (stats['functions']['covered'] / stats['functions']['total'] * 100) if stats['functions']['total'] > 0 else 0
        line_pct = (stats['lines']['covered'] / stats['lines']['total'] * 100) if stats['lines']['total'] > 0 else 0
        
        print(f"{directory:<25} {files:>10} {stmt_pct:>14.2f}% {branch_pct:>14.2f}% {func_pct:>14.2f}% {line_pct:>14.2f}%")
    
    print("-" * 100)
    print()
    
    # 覆盖率等级
    print("📈 覆盖率等级分析")
    print("-" * 100)
    
    stmt_pct = (total_stats['statements']['covered'] / total_stats['statements']['total'] * 100) if total_stats['statements']['total'] > 0 else 0
    
    if stmt_pct >= 90:
        grade = "优秀 ✅"
    elif stmt_pct >= 80:
        grade = "良好 ✅"
    elif stmt_pct >= 70:
        grade = "中等 ⚠️"
    elif stmt_pct >= 60:
        grade = "及格 ⚠️"
    else:
        grade = "不及格 ❌"
    
    print(f"语句覆盖率: {stmt_pct:.2f}% - {grade}")
    print()
    
    # 目标对比
    print("🎯 目标对比")
    print("-" * 100)
    print(f"{'指标':<20} {'当前值':>15} {'目标值':>15} {'差距':>15} {'状态':>15}")
    print("-" * 100)
    
    targets = {
        'statements': 95.0,
        'branches': 90.0,
        'functions': 95.0,
        'lines': 95.0
    }
    
    for metric, target in targets.items():
        total = total_stats[metric]['total']
        covered = total_stats[metric]['covered']
        current = (covered / total * 100) if total > 0 else 0
        gap = target - current
        status = "✅ 达标" if current >= target else f"❌ 差 {gap:.2f}%"
        
        print(f"{metric.capitalize():<20} {current:>14.2f}% {target:>14.2f}% {gap:>14.2f}% {status:>15}")
    
    print("-" * 100)

def main():
    coverage_file = Path('server/coverage/coverage-final.json')
    
    if not coverage_file.exists():
        print("❌ 覆盖率文件不存在，请先运行测试: cd server && npm run test:coverage")
        sys.exit(1)
    
    stats_by_dir, total_stats = analyze_coverage(coverage_file)
    print_coverage_report(stats_by_dir, total_stats)

if __name__ == '__main__':
    main()

