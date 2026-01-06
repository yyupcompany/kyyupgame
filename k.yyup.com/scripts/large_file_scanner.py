#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目大文件扫描器
扫描项目中超过指定大小的文件，生成详细报告
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime
import json


class LargeFileScanner:
    """大文件扫描器"""

    def __init__(self, scan_path: str = ".", min_size_mb: int = 100):
        """
        初始化扫描器

        Args:
            scan_path: 扫描路径，默认为当前目录
            min_size_mb: 最小文件大小（MB），默认100MB
        """
        self.scan_path = Path(scan_path).resolve()
        self.min_size_bytes = min_size_mb * 1024 * 1024
        self.large_files = []
        self.scan_stats = {
            'total_files': 0,
            'total_size': 0,
            'large_files_count': 0,
            'large_files_size': 0,
            'scanned_dirs': 0
        }

    def format_size(self, size_bytes: int) -> str:
        """格式化文件大小显示"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f}{unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f}PB"

    def should_scan_file(self, file_path: Path) -> bool:
        """判断文件是否应该被扫描"""
        # 排除的目录
        exclude_dirs = {
            '.git', 'node_modules', '.npm', '.cache', 'dist', 'build',
            '__pycache__', '.pytest_cache', 'coverage', '.nyc_output',
            '.vscode', '.idea', 'vendor', '.venv', 'venv', 'env'
        }

        # 排除的文件扩展名
        exclude_extensions = {
            '.log', '.tmp', '.temp', '.swp', '.swo', '.lock',
            '.pid', '.DS_Store', 'Thumbs.db'
        }

        # 检查路径中是否包含排除的目录
        for exclude_dir in exclude_dirs:
            if exclude_dir in file_path.parts:
                return False

        # 检查文件扩展名
        if file_path.suffix.lower() in exclude_extensions:
            return False

        # 检查是否为符号链接
        if file_path.is_symlink():
            return False

        return True

    def scan_directory(self, directory: Path) -> None:
        """递归扫描目录"""
        try:
            for item in directory.rglob('*'):
                if item.is_file() and self.should_scan_file(item):
                    self.scan_stats['total_files'] += 1

                    try:
                        file_size = item.stat().st_size
                        self.scan_stats['total_size'] += file_size

                        if file_size >= self.min_size_bytes:
                            file_info = {
                                'path': str(item.relative_to(self.scan_path)),
                                'absolute_path': str(item),
                                'size_bytes': file_size,
                                'size_mb': file_size / (1024 * 1024),
                                'size_formatted': self.format_size(file_size),
                                'modified_time': datetime.fromtimestamp(item.stat().st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                                'file_type': item.suffix.lower() or '无扩展名'
                            }
                            self.large_files.append(file_info)
                            self.scan_stats['large_files_count'] += 1
                            self.scan_stats['large_files_size'] += file_size

                    except (OSError, PermissionError) as e:
                        print(f"警告：无法访问文件 {item}：{e}")
                        continue

                elif item.is_dir() and not any(exclude in str(item) for exclude in ['.git', 'node_modules']):
                    self.scan_stats['scanned_dirs'] += 1

        except (OSError, PermissionError) as e:
            print(f"警告：无法扫描目录 {directory}：{e}")

    def generate_report(self, output_format: str = 'text') -> str:
        """生成扫描报告"""
        if not self.large_files:
            return f"🎉 恭喜！未发现超过 {self.min_size_bytes / (1024*1024):.0f}MB 的大文件"

        # 按文件大小排序
        sorted_files = sorted(self.large_files, key=lambda x: x['size_bytes'], reverse=True)

        if output_format == 'json':
            return self._generate_json_report(sorted_files)
        else:
            return self._generate_text_report(sorted_files)

    def _generate_text_report(self, sorted_files: List[Dict]) -> str:
        """生成文本格式报告"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("🔍 项目大文件扫描报告")
        report_lines.append("=" * 80)
        report_lines.append(f"📁 扫描路径: {self.scan_path}")
        report_lines.append(f"📏 大文件阈值: {self.min_size_bytes / (1024*1024):.0f}MB")
        report_lines.append(f"📅 扫描时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append("")

        # 统计信息
        report_lines.append("📊 扫描统计:")
        report_lines.append(f"  • 总文件数: {self.scan_stats['total_files']:,}")
        report_lines.append(f"  • 总大小: {self.format_size(self.scan_stats['total_size'])}")
        report_lines.append(f"  • 大文件数量: {self.scan_stats['large_files_count']}")
        report_lines.append(f"  • 大文件总大小: {self.format_size(self.scan_stats['large_files_size'])}")
        report_lines.append(f"  • 大文件占比: {self.scan_stats['large_files_size'] / self.scan_stats['total_size'] * 100:.1f}%")
        report_lines.append("")

        # 大文件列表
        report_lines.append("🚨 大文件详情:")
        report_lines.append("-" * 80)
        report_lines.append(f"{'序号':<4} {'大小':<10} {'修改时间':<20} {'类型':<8} {'路径'}")
        report_lines.append("-" * 80)

        for i, file_info in enumerate(sorted_files, 1):
            report_lines.append(
                f"{i:<4} {file_info['size_formatted']:<10} {file_info['modified_time']:<20} "
                f"{file_info['file_type']:<8} {file_info['path']}"
            )

        report_lines.append("")

        # 文件类型分析
        type_stats = {}
        for file_info in sorted_files:
            file_type = file_info['file_type']
            if file_type not in type_stats:
                type_stats[file_type] = {'count': 0, 'size': 0}
            type_stats[file_type]['count'] += 1
            type_stats[file_type]['size'] += file_info['size_bytes']

        if type_stats:
            report_lines.append("📈 文件类型分析:")
            report_lines.append("-" * 40)
            for file_type, stats in sorted(type_stats.items(),
                                         key=lambda x: x[1]['size'], reverse=True):
                report_lines.append(
                    f"  {file_type or '无扩展名'}: {stats['count']}个, "
                    f"{self.format_size(stats['size'])}"
                )

        report_lines.append("")
        report_lines.append("💡 建议:")
        report_lines.append("  • 检查是否包含在版本控制中的大文件")
        report_lines.append("  • 考虑使用 .gitignore 排除不必要的大文件")
        report_lines.append("  • 检查是否有重复的大文件")
        report_lines.append("  • 考虑压缩或归档不常用的文件")

        return "\n".join(report_lines)

    def _generate_json_report(self, sorted_files: List[Dict]) -> str:
        """生成JSON格式报告"""
        report_data = {
            'scan_info': {
                'scan_path': str(self.scan_path),
                'min_size_mb': self.min_size_bytes / (1024*1024),
                'scan_time': datetime.now().isoformat(),
                'statistics': self.scan_stats
            },
            'large_files': sorted_files
        }
        return json.dumps(report_data, ensure_ascii=False, indent=2)

    def save_report(self, report: str, filename: str = None) -> str:
        """保存报告到文件"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"large_files_report_{timestamp}.txt"

        report_path = Path(filename)
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report)
            return str(report_path.absolute())
        except Exception as e:
            print(f"❌ 保存报告失败：{e}")
            return None

    def run_scan(self) -> str:
        """执行完整扫描"""
        print(f"🔍 开始扫描 {self.scan_path}...")
        print(f"📏 查找超过 {self.min_size_bytes / (1024*1024):.0f}MB 的文件...")

        self.scan_directory(self.scan_path)

        print(f"✅ 扫描完成！发现 {self.scan_stats['large_files_count']} 个大文件")

        return self.generate_report()


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description='项目大文件扫描器')
    parser.add_argument('path', nargs='?', default='.',
                       help='要扫描的路径 (默认: 当前目录)')
    parser.add_argument('-s', '--size', type=int, default=100,
                       help='最小文件大小(MB) (默认: 100)')
    parser.add_argument('-f', '--format', choices=['text', 'json'],
                       default='text', help='输出格式 (默认: text)')
    parser.add_argument('-o', '--output', help='输出文件路径')
    parser.add_argument('--no-save', action='store_true',
                       help='不保存报告到文件')

    args = parser.parse_args()

    # 创建扫描器实例
    scanner = LargeFileScanner(args.path, args.size)

    # 执行扫描
    report = scanner.run_scan()

    # 输出报告
    print("\n" + report)

    # 保存报告
    if not args.no_save:
        saved_path = scanner.save_report(report, args.output)
        if saved_path:
            print(f"\n💾 报告已保存到: {saved_path}")


if __name__ == "__main__":
    main()