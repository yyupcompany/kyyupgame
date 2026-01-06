#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
磁盘空间分析器
分析指定目录的磁盘使用情况，找出占用空间较大的文件和目录
"""

import os
import sys
import shutil
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime
import json
import subprocess


class DiskUsageAnalyzer:
    """磁盘空间分析器"""

    def __init__(self, target_path: str = None):
        """
        初始化分析器

        Args:
            target_path: 要分析的目标路径
        """
        self.target_path = Path(target_path) if target_path else Path.home()
        self.total_size = 0
        self.directory_stats = []
        self.large_files = []
        self.file_type_stats = {}
        self.scan_start_time = None
        self.scan_end_time = None

    def format_size(self, size_bytes: int) -> str:
        """格式化文件大小显示"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f}{unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f}PB"

    def get_directory_size(self, directory: Path) -> int:
        """获取目录大小（使用du命令以提高性能）"""
        try:
            result = subprocess.run(
                ['du', '-sb', str(directory)],
                capture_output=True,
                text=True,
                check=True
            )
            return int(result.stdout.split()[0])
        except (subprocess.CalledProcessError, FileNotFoundError):
            # 备用方案：使用os.walk
            total_size = 0
            for dirpath, dirnames, filenames in os.walk(directory):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    try:
                        total_size += os.path.getsize(filepath)
                    except (OSError, PermissionError):
                        continue
            return total_size

    def should_ignore_path(self, path: Path) -> bool:
        """判断是否应该忽略该路径"""
        ignore_patterns = {
            '.git', 'node_modules', '.npm', '.cache', '__pycache__',
            'coverage', '.pytest_cache', '.nyc_output', '.vscode',
            '.idea', 'vendor', '.venv', 'venv', 'env', 'dist', 'build'
        }

        return any(pattern in path.name for pattern in ignore_patterns)

    def analyze_directory_structure(self, max_depth: int = 3) -> None:
        """分析目录结构"""
        print(f"🔍 分析目录结构: {self.target_path}")

        def scan_directory(directory: Path, current_depth: int = 0):
            if current_depth >= max_depth:
                return

            try:
                items = list(directory.iterdir())
            except (OSError, PermissionError):
                return

            for item in items:
                if self.should_ignore_path(item):
                    continue

                if item.is_dir():
                    try:
                        size = self.get_directory_size(item)
                        self.directory_stats.append({
                            'path': str(item.relative_to(self.target_path)),
                            'absolute_path': str(item),
                            'size_bytes': size,
                            'size_formatted': self.format_size(size),
                            'depth': current_depth + 1,
                            'type': 'directory'
                        })
                        self.total_size += size

                        # 递归扫描子目录
                        scan_directory(item, current_depth + 1)
                    except (OSError, PermissionError):
                        continue

        scan_directory(self.target_path)

    def find_large_files(self, min_size_mb: int = 100) -> None:
        """查找大文件"""
        print(f"🔍 查找大于 {min_size_mb}MB 的文件...")

        min_size_bytes = min_size_mb * 1024 * 1024

        for root, dirs, files in os.walk(self.target_path):
            # 跳过忽略的目录
            dirs[:] = [d for d in dirs if not self.should_ignore_path(Path(d))]

            for filename in files:
                filepath = Path(root) / filename
                try:
                    if filepath.is_file() and not filepath.is_symlink():
                        size = filepath.stat().st_size
                        if size >= min_size_bytes:
                            self.large_files.append({
                                'path': str(filepath.relative_to(self.target_path)),
                                'absolute_path': str(filepath),
                                'size_bytes': size,
                                'size_mb': size / (1024 * 1024),
                                'size_formatted': self.format_size(size),
                                'modified_time': datetime.fromtimestamp(filepath.stat().st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                                'file_type': filepath.suffix.lower() or '无扩展名'
                            })

                            # 统计文件类型
                            file_type = filepath.suffix.lower() or '无扩展名'
                            if file_type not in self.file_type_stats:
                                self.file_type_stats[file_type] = {'count': 0, 'size': 0}
                            self.file_type_stats[file_type]['count'] += 1
                            self.file_type_stats[file_type]['size'] += size

                except (OSError, PermissionError):
                    continue

    def analyze_file_types(self) -> None:
        """分析文件类型分布"""
        print("🔍 分析文件类型分布...")

        type_counts = {}
        type_sizes = {}

        for root, dirs, files in os.walk(self.target_path):
            # 跳过忽略的目录
            dirs[:] = [d for d in dirs if not self.should_ignore_path(Path(d))]

            for filename in files:
                filepath = Path(root) / filename
                try:
                    if filepath.is_file() and not filepath.is_symlink():
                        size = filepath.stat().st_size
                        file_type = filepath.suffix.lower() or '无扩展名'

                        if file_type not in type_counts:
                            type_counts[file_type] = 0
                            type_sizes[file_type] = 0

                        type_counts[file_type] += 1
                        type_sizes[file_type] += size
                except (OSError, PermissionError):
                    continue

        self.file_type_stats = {
            file_type: {
                'count': type_counts[file_type],
                'size_bytes': type_sizes[file_type],
                'size_formatted': self.format_size(type_sizes[file_type])
            }
            for file_type in type_counts
        }

    def run_full_analysis(self, min_file_size_mb: int = 100, max_depth: int = 3) -> None:
        """运行完整分析"""
        self.scan_start_time = datetime.now()

        print("🚀 开始磁盘空间分析...")
        print(f"📍 目标路径: {self.target_path}")
        print(f"📏 最小文件大小: {min_file_size_mb}MB")
        print(f"📁 最大扫描深度: {max_depth}")
        print("=" * 60)

        # 分析目录结构
        self.analyze_directory_structure(max_depth)

        # 查找大文件
        self.find_large_files(min_file_size_mb)

        # 分析文件类型
        self.analyze_file_types()

        self.scan_end_time = datetime.now()

        print(f"\n✅ 分析完成！耗时: {self.scan_end_time - self.scan_start_time}")

    def generate_report(self, output_format: str = 'text') -> str:
        """生成分析报告"""
        if output_format == 'json':
            return self._generate_json_report()
        else:
            return self._generate_text_report()

    def _generate_text_report(self) -> str:
        """生成文本格式报告"""
        report_lines = []

        # 报告标题
        report_lines.append("=" * 80)
        report_lines.append("💾 磁盘空间分析报告")
        report_lines.append("=" * 80)
        report_lines.append(f"📍 分析路径: {self.target_path}")
        report_lines.append(f"📅 分析时间: {self.scan_start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append(f"⏱️  分析耗时: {self.scan_end_time - self.scan_start_time}")
        report_lines.append("")

        # 总体统计
        report_lines.append("📊 总体统计:")
        report_lines.append(f"  • 总大小: {self.format_size(self.total_size)}")
        report_lines.append(f"  • 目录数量: {len(self.directory_stats)}")
        report_lines.append(f"  • 大文件数量: {len(self.large_files)}")
        report_lines.append(f"  • 文件类型数量: {len(self.file_type_stats)}")
        report_lines.append("")

        # 大文件列表
        if self.large_files:
            report_lines.append("🚨 大文件列表:")
            report_lines.append("-" * 80)
            sorted_files = sorted(self.large_files, key=lambda x: x['size_bytes'], reverse=True)
            report_lines.append(f"{'序号':<4} {'大小':<12} {'类型':<8} {'修改时间':<20} {'路径'}")
            report_lines.append("-" * 80)

            for i, file_info in enumerate(sorted_files[:20], 1):  # 只显示前20个
                report_lines.append(
                    f"{i:<4} {file_info['size_formatted']:<12} {file_info['file_type']:<8} "
                    f"{file_info['modified_time']:<20} {file_info['path']}"
                )
            report_lines.append("")

        # 目录大小排名
        if self.directory_stats:
            report_lines.append("📁 目录大小排名:")
            report_lines.append("-" * 60)
            sorted_dirs = sorted(self.directory_stats, key=lambda x: x['size_bytes'], reverse=True)
            report_lines.append(f"{'排名':<4} {'大小':<12} {'路径'}")
            report_lines.append("-" * 60)

            for i, dir_info in enumerate(sorted_dirs[:15], 1):  # 只显示前15个
                report_lines.append(
                    f"{i:<4} {dir_info['size_formatted']:<12} {dir_info['path']}"
                )
            report_lines.append("")

        # 文件类型分析
        if self.file_type_stats:
            report_lines.append("📈 文件类型分析:")
            report_lines.append("-" * 60)
            sorted_types = sorted(self.file_type_stats.items(),
                                key=lambda x: x[1]['size_bytes'], reverse=True)
            report_lines.append(f"{'类型':<12} {'文件数量':<10} {'总大小':<15} {'平均大小':<12}")
            report_lines.append("-" * 60)

            for file_type, stats in sorted_types[:20]:  # 只显示前20个
                avg_size = stats['size_bytes'] / stats['count'] if stats['count'] > 0 else 0
                avg_size_str = self.format_size(avg_size)
                report_lines.append(
                    f"{file_type or '无扩展名':<12} {stats['count']:<10} "
                    f"{stats['size_formatted']:<15} {avg_size_str:<12}"
                )
            report_lines.append("")

        # 磁盘空间建议
        disk_usage = shutil.disk_usage(str(self.target_path))
        free_space_gb = disk_usage.free / (1024**3)
        usage_percent = (disk_usage.used / disk_usage.total) * 100

        report_lines.append("💾 磁盘空间状况:")
        report_lines.append(f"  • 总容量: {self.format_size(disk_usage.total)}")
        report_lines.append(f"  • 已使用: {self.format_size(disk_usage.used)} ({usage_percent:.1f}%)")
        report_lines.append(f"  • 可用空间: {self.format_size(disk_usage.free)}")
        report_lines.append("")

        report_lines.append("💡 优化建议:")
        if free_space_gb < 10:
            report_lines.append("  ⚠️  磁盘空间不足！建议立即清理：")
        elif free_space_gb < 20:
            report_lines.append("  ⚠️  磁盘空间较少，建议清理：")
        else:
            report_lines.append("  ✅ 磁盘空间充足，但可以考虑优化：")

        report_lines.append("  • 清理日志文件和临时文件")
        report_lines.append("  • 删除不需要的备份文件")
        report_lines.append("  • 压缩或归档不常用的文件")
        report_lines.append("  • 检查重复文件")

        return "\n".join(report_lines)

    def _generate_json_report(self) -> str:
        """生成JSON格式报告"""
        report_data = {
            'analysis_info': {
                'target_path': str(self.target_path),
                'scan_start_time': self.scan_start_time.isoformat(),
                'scan_end_time': self.scan_end_time.isoformat(),
                'total_size_bytes': self.total_size,
                'total_size_formatted': self.format_size(self.total_size)
            },
            'directory_stats': sorted(self.directory_stats,
                                    key=lambda x: x['size_bytes'], reverse=True),
            'large_files': sorted(self.large_files,
                                key=lambda x: x['size_bytes'], reverse=True),
            'file_type_stats': self.file_type_stats
        }
        return json.dumps(report_data, ensure_ascii=False, indent=2)

    def save_report(self, report: str, filename: str = None) -> str:
        """保存报告到文件"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"disk_usage_report_{timestamp}.txt"

        report_path = Path(filename)
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report)
            return str(report_path.absolute())
        except Exception as e:
            print(f"❌ 保存报告失败：{e}")
            return None


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description='磁盘空间分析器')
    parser.add_argument('path', nargs='?',
                       default='/persistent/home/zhgue',
                       help='要分析的路径 (默认: /persistent/home/zhgue)')
    parser.add_argument('-s', '--min-size', type=int, default=100,
                       help='最小文件大小(MB) (默认: 100)')
    parser.add_argument('-d', '--max-depth', type=int, default=3,
                       help='最大目录深度 (默认: 3)')
    parser.add_argument('-f', '--format', choices=['text', 'json'],
                       default='text', help='输出格式 (默认: text)')
    parser.add_argument('-o', '--output', help='输出文件路径')
    parser.add_argument('--no-save', action='store_true',
                       help='不保存报告到文件')

    args = parser.parse_args()

    # 创建分析器实例
    analyzer = DiskUsageAnalyzer(args.path)

    # 运行分析
    analyzer.run_full_analysis(args.min_size, args.max_depth)

    # 生成报告
    report = analyzer.generate_report(args.format)

    # 输出报告
    print("\n" + report)

    # 保存报告
    if not args.no_save:
        saved_path = analyzer.save_report(report, args.output)
        if saved_path:
            print(f"\n💾 报告已保存到: {saved_path}")


if __name__ == "__main__":
    main()