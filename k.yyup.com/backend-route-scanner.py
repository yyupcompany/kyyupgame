#!/usr/bin/env python3
"""
后端API端点扫描器
直接扫描后端代码，统计实际注册的API路由数量
"""

import os
import re
import json
from collections import defaultdict
from typing import Dict, List, Set, Tuple

class BackendRouteScanner:
    def __init__(self, routes_dir: str):
        self.routes_dir = routes_dir
        self.routes = []
        self.route_files = []
        self.main_router_mounts = {}
        
    def scan_route_files(self):
        """扫描所有路由文件"""
        print(f"🔍 扫描路由目录: {self.routes_dir}")
        
        for root, dirs, files in os.walk(self.routes_dir):
            for file in files:
                if file.endswith(('.ts', '.js')) and not file.endswith('.test.ts'):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, self.routes_dir)
                    self.route_files.append((file_path, relative_path))
        
        print(f"📁 找到 {len(self.route_files)} 个路由文件")
        return self.route_files
    
    def extract_routes_from_file(self, file_path: str, relative_path: str) -> List[Dict]:
        """从单个文件提取路由"""
        routes = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 路由定义模式
            route_patterns = [
                # router.get('/path', handler)
                r"router\.(get|post|put|patch|delete|use)\s*\(\s*['\"]([^'\"]+)['\"]",
                # app.get('/path', handler)  
                r"app\.(get|post|put|patch|delete|use)\s*\(\s*['\"]([^'\"]+)['\"]",
                # @Get('/path')
                r"@(Get|Post|Put|Patch|Delete)\s*\(\s*['\"]([^'\"]+)['\"]",
            ]
            
            for pattern in route_patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    method = match.group(1).upper()
                    path = match.group(2)
                    
                    # 跳过一些非路由的use语句
                    if method == 'USE' and any(skip in path for skip in ['middleware', 'cors', 'bodyParser', 'express']):
                        continue
                    
                    routes.append({
                        'method': method,
                        'path': path,
                        'file': relative_path,
                        'line_content': match.group(0)
                    })
            
        except Exception as e:
            print(f"⚠️ 读取文件失败 {relative_path}: {e}")
        
        return routes
    
    def extract_router_mounts(self, file_path: str) -> Dict[str, str]:
        """提取主路由文件中的router.use挂载信息"""
        mounts = {}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 查找 router.use('/prefix', someRouter) 模式
            mount_pattern = r"router\.use\s*\(\s*['\"]([^'\"]+)['\"](?:\s*,\s*([^)]+))?\)"
            matches = re.finditer(mount_pattern, content, re.MULTILINE)
            
            for match in matches:
                prefix = match.group(1)
                router_name = match.group(2) if match.group(2) else 'unknown'
                router_name = router_name.strip()
                mounts[router_name] = prefix
            
        except Exception as e:
            print(f"⚠️ 读取主路由文件失败: {e}")
        
        return mounts
    
    def scan_all_routes(self):
        """扫描所有路由"""
        print("🚀 开始扫描后端API端点...")
        
        # 扫描路由文件
        self.scan_route_files()
        
        # 首先读取主路由文件的挂载信息
        main_route_file = os.path.join(self.routes_dir, 'index.ts')
        if os.path.exists(main_route_file):
            print("📋 分析主路由文件挂载...")
            self.main_router_mounts = self.extract_router_mounts(main_route_file)
            print(f"🔗 找到 {len(self.main_router_mounts)} 个路由挂载")
        
        # 提取所有路由
        all_routes = []
        file_stats = {}
        
        for file_path, relative_path in self.route_files:
            routes = self.extract_routes_from_file(file_path, relative_path)
            all_routes.extend(routes)
            file_stats[relative_path] = len(routes)
            if routes:
                print(f"📄 {relative_path}: {len(routes)} 个路由")
        
        self.routes = all_routes
        
        print(f"\n📊 扫描完成:")
        print(f"总路由文件: {len(self.route_files)}")
        print(f"总路由定义: {len(all_routes)}")
        
        return all_routes, file_stats
    
    def analyze_routes(self):
        """分析路由统计"""
        if not self.routes:
            print("❌ 没有扫描到路由")
            return
        
        # 按HTTP方法统计
        by_method = defaultdict(int)
        by_file = defaultdict(int)
        by_path_pattern = defaultdict(int)
        
        # 路径模式分析
        path_patterns = {
            'root': r'^/$',
            'id_param': r'/:id(\b|/)',
            'nested_id': r'/:\w+Id/',
            'action': r'/(create|edit|update|delete|search|stats|export)(\b|/)',
            'api_prefix': r'^/api/',
        }
        
        for route in self.routes:
            method = route['method']
            path = route['path']
            file = route['file']
            
            by_method[method] += 1
            by_file[file] += 1
            
            # 路径模式统计
            for pattern_name, pattern in path_patterns.items():
                if re.search(pattern, path):
                    by_path_pattern[pattern_name] += 1
        
        print(f"\n📈 路由分析:")
        
        print(f"\n🌐 HTTP方法分布:")
        for method, count in sorted(by_method.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(self.routes)) * 100
            print(f"  {method}: {count} 个 ({percentage:.1f}%)")
        
        print(f"\n📁 文件分布 (Top 10):")
        top_files = sorted(by_file.items(), key=lambda x: x[1], reverse=True)[:10]
        for file, count in top_files:
            percentage = (count / len(self.routes)) * 100
            print(f"  {file}: {count} 个 ({percentage:.1f}%)")
        
        print(f"\n🎯 路径模式分析:")
        for pattern, count in sorted(by_path_pattern.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(self.routes)) * 100
            print(f"  {pattern}: {count} 个 ({percentage:.1f}%)")
        
        # 找出潜在的REST端点
        rest_endpoints = defaultdict(list)
        for route in self.routes:
            path = route['path']
            method = route['method']
            
            # 简化路径用于分组
            simplified_path = re.sub(r'/:\w+', '/:id', path)
            simplified_path = re.sub(r'/\d+', '/:id', simplified_path)
            rest_endpoints[simplified_path].append(method)
        
        print(f"\n🔄 REST端点组合 (Top 15):")
        rest_groups = sorted(rest_endpoints.items(), key=lambda x: len(x[1]), reverse=True)[:15]
        for path, methods in rest_groups:
            methods_str = ', '.join(sorted(set(methods)))
            print(f"  {path}: [{methods_str}] ({len(methods)} 个)")
    
    def find_missing_routes(self):
        """查找可能缺失的标准REST路由"""
        print(f"\n🔍 标准REST路由完整性检查:")
        
        # 提取资源路径
        resources = set()
        for route in self.routes:
            path = route['path']
            # 提取第一级路径作为资源名
            match = re.match(r'^/([^/]+)', path)
            if match and not match.group(1).startswith(':'):
                resources.add(match.group(1))
        
        print(f"📋 发现 {len(resources)} 个资源:")
        
        # 标准REST方法
        standard_methods = ['GET', 'POST', 'PUT', 'DELETE']
        standard_paths = ['', '/:id']
        
        for resource in sorted(resources):
            if resource in ['api', 'docs', 'health', 'version']:
                continue
                
            resource_routes = [r for r in self.routes if r['path'].startswith(f'/{resource}')]
            
            print(f"\n  📦 /{resource}:")
            print(f"    总路由: {len(resource_routes)} 个")
            
            # 检查标准REST路由
            existing_combinations = set()
            for route in resource_routes:
                path_suffix = route['path'][len(f'/{resource}'):]
                existing_combinations.add((route['method'], path_suffix))
            
            # 列出存在的路由
            for method, path_suffix in sorted(existing_combinations):
                print(f"    ✅ {method} /{resource}{path_suffix}")
    
    def export_results(self, output_file: str = None):
        """导出扫描结果"""
        if not output_file:
            output_file = '/home/devbox/project/backend_routes_scan.json'
        
        results = {
            'scan_time': __import__('time').time(),
            'total_routes': len(self.routes),
            'total_files': len(self.route_files),
            'main_router_mounts': self.main_router_mounts,
            'routes': self.routes,
            'file_list': [f[1] for f in self.route_files]
        }
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"\n💾 扫描结果已保存到: {output_file}")
        except Exception as e:
            print(f"❌ 保存结果失败: {e}")
        
        return results

def main():
    routes_dir = './server/src/routes'
    
    if not os.path.exists(routes_dir):
        print(f"❌ 路由目录不存在: {routes_dir}")
        return
    
    scanner = BackendRouteScanner(routes_dir)
    
    # 扫描路由
    routes, file_stats = scanner.scan_all_routes()
    
    # 分析路由
    scanner.analyze_routes()
    
    # 检查缺失路由
    scanner.find_missing_routes()
    
    # 导出结果
    scanner.export_results()
    
    print(f"\n🎯 扫描总结:")
    print(f"实际注册的API端点: {len(routes)} 个")
    print(f"路由文件数量: {len(scanner.route_files)} 个")

if __name__ == "__main__":
    main()