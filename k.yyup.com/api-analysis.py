#!/usr/bin/env python3
"""
API端点分析器
分析API扫描结果，按照类型分类端点
"""

import json
import re
from collections import defaultdict, Counter
from typing import Dict, List, Set

class APIAnalyzer:
    def __init__(self, results_file: str):
        self.results_file = results_file
        self.data = {}
        self.endpoints = []
        
        # 分类模式
        self.page_patterns = [
            r'dashboard', r'admin', r'principal', r'teacher', r'parent', r'student',
            r'overview', r'profile', r'settings', r'management', r'list', r'detail',
            r'class-', r'activity-', r'enrollment-', r'marketing-'
        ]
        
        self.component_patterns = [
            r'component', r'widget', r'chart', r'table', r'form', r'modal', r'dialog',
            r'calendar', r'picker', r'selector', r'editor', r'viewer', r'preview'
        ]
        
        self.query_patterns = [
            r'search', r'stats', r'statistics', r'analytics', r'metrics', r'report',
            r'export', r'download', r'history', r'logs', r'tracking', r'monitor'
        ]
        
        self.crud_patterns = {
            'create': [r'create', r'add', r'new', r'register', r'upload'],
            'read': [r'get', r'list', r'show', r'view', r'fetch', r'find'],
            'update': [r'update', r'edit', r'modify', r'patch', r'put'],
            'delete': [r'delete', r'remove', r'destroy', r'clear', r'cleanup']
        }
        
        self.business_domains = {
            'auth': [r'auth', r'login', r'logout', r'register', r'token', r'verify'],
            'user_management': [r'users', r'roles', r'permissions', r'profile'],
            'education': [r'students', r'teachers', r'classes', r'parents'],
            'enrollment': [r'enrollment', r'application', r'admission', r'quota'],
            'activities': [r'activities', r'events', r'registration', r'evaluation'],
            'marketing': [r'marketing', r'campaign', r'advertisement', r'customer'],
            'ai': [r'ai', r'memory', r'conversation', r'model', r'chat'],
            'system': [r'system', r'config', r'log', r'backup', r'monitor'],
            'dashboard': [r'dashboard', r'principal', r'overview', r'stats'],
            'files': [r'files', r'upload', r'download', r'storage', r'image']
        }
    
    def load_data(self):
        """加载扫描结果数据"""
        try:
            with open(self.results_file, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            self.endpoints = self.data.get('results', [])
            print(f"✅ 加载了 {len(self.endpoints)} 个端点数据")
        except Exception as e:
            print(f"❌ 加载数据失败: {e}")
    
    def categorize_by_pattern(self, path: str, patterns: List[str]) -> bool:
        """根据模式匹配分类"""
        path_lower = path.lower()
        return any(re.search(pattern, path_lower) for pattern in patterns)
    
    def get_business_domain(self, path: str) -> str:
        """获取业务域"""
        path_lower = path.lower()
        for domain, patterns in self.business_domains.items():
            if any(re.search(pattern, path_lower) for pattern in patterns):
                return domain
        return 'other'
    
    def get_crud_operation(self, method: str, path: str) -> str:
        """获取CRUD操作类型"""
        method_lower = method.lower()
        path_lower = path.lower()
        
        # 先根据HTTP方法判断
        if method_lower == 'post':
            if any(re.search(pattern, path_lower) for pattern in self.crud_patterns['create']):
                return 'create'
            return 'create_or_action'
        elif method_lower == 'get':
            return 'read'
        elif method_lower in ['put', 'patch']:
            return 'update'
        elif method_lower == 'delete':
            return 'delete'
        
        # 再根据路径模式判断
        for operation, patterns in self.crud_patterns.items():
            if any(re.search(pattern, path_lower) for pattern in patterns):
                return operation
        
        return 'unknown'
    
    def analyze_endpoint_types(self):
        """分析端点类型"""
        analysis = {
            'page_endpoints': [],      # 栏目页面
            'component_endpoints': [], # 组件端点
            'query_endpoints': [],     # 查询端点
            'crud_endpoints': defaultdict(list),  # CRUD操作
            'business_domains': defaultdict(list), # 业务域
            'by_method': defaultdict(list),        # 按HTTP方法
            'by_status': defaultdict(list),        # 按状态码
            'by_source_file': defaultdict(list),   # 按源文件
        }
        
        for endpoint in self.endpoints:
            route_info = endpoint.get('route_info', {})
            path = route_info.get('path', '')
            method = route_info.get('method', 'GET')
            status_code = endpoint.get('status_code', 0)
            source_file = route_info.get('file', 'unknown')
            
            # 端点类型分类
            if self.categorize_by_pattern(path, self.page_patterns):
                analysis['page_endpoints'].append(endpoint)
            elif self.categorize_by_pattern(path, self.component_patterns):
                analysis['component_endpoints'].append(endpoint)
            elif self.categorize_by_pattern(path, self.query_patterns):
                analysis['query_endpoints'].append(endpoint)
            
            # CRUD操作分类
            crud_op = self.get_crud_operation(method, path)
            analysis['crud_endpoints'][crud_op].append(endpoint)
            
            # 业务域分类
            domain = self.get_business_domain(path)
            analysis['business_domains'][domain].append(endpoint)
            
            # 其他分类
            analysis['by_method'][method].append(endpoint)
            analysis['by_status'][str(status_code)].append(endpoint)
            analysis['by_source_file'][source_file].append(endpoint)
        
        return analysis
    
    def analyze_success_failure(self):
        """分析成功和失败的端点"""
        success_endpoints = [ep for ep in self.endpoints if ep.get('success', False)]
        failure_endpoints = [ep for ep in self.endpoints if not ep.get('success', False)]
        
        # 失败原因分析
        failure_by_status = defaultdict(list)
        for ep in failure_endpoints:
            status = str(ep.get('status_code', 'unknown'))
            failure_by_status[status].append(ep)
        
        return {
            'success_count': len(success_endpoints),
            'failure_count': len(failure_endpoints),
            'success_endpoints': success_endpoints,
            'failure_by_status': dict(failure_by_status)
        }
    
    def generate_report(self):
        """生成分析报告"""
        print("🔍 开始分析API端点...")
        
        # 基本统计
        total_endpoints = len(self.endpoints)
        print(f"\n📊 基本统计:")
        print(f"总端点数: {total_endpoints}")
        
        # 端点类型分析
        type_analysis = self.analyze_endpoint_types()
        
        print(f"\n🏢 端点类型分析:")
        print(f"栏目页面端点: {len(type_analysis['page_endpoints'])} 个")
        print(f"组件相关端点: {len(type_analysis['component_endpoints'])} 个")
        print(f"查询分析端点: {len(type_analysis['query_endpoints'])} 个")
        print(f"其他端点: {total_endpoints - len(type_analysis['page_endpoints']) - len(type_analysis['component_endpoints']) - len(type_analysis['query_endpoints'])} 个")
        
        # CRUD操作分析
        print(f"\n⚡ CRUD操作分析:")
        for operation, endpoints in type_analysis['crud_endpoints'].items():
            print(f"{operation.upper()}: {len(endpoints)} 个")
        
        # 业务域分析
        print(f"\n🏗️ 业务域分析:")
        for domain, endpoints in sorted(type_analysis['business_domains'].items(), key=lambda x: len(x[1]), reverse=True):
            print(f"{domain}: {len(endpoints)} 个")
        
        # HTTP方法分析
        print(f"\n🌐 HTTP方法分析:")
        for method, endpoints in sorted(type_analysis['by_method'].items(), key=lambda x: len(x[1]), reverse=True):
            print(f"{method}: {len(endpoints)} 个")
        
        # 成功失败分析
        success_failure = self.analyze_success_failure()
        print(f"\n✅❌ 成功失败分析:")
        print(f"成功响应: {success_failure['success_count']} 个 ({success_failure['success_count']/total_endpoints*100:.1f}%)")
        print(f"失败响应: {success_failure['failure_count']} 个 ({success_failure['failure_count']/total_endpoints*100:.1f}%)")
        
        print(f"\n🚫 失败状态码分布:")
        for status, endpoints in sorted(success_failure['failure_by_status'].items(), key=lambda x: len(x[1]), reverse=True):
            print(f"HTTP {status}: {len(endpoints)} 个")
        
        # 源文件分析
        print(f"\n📁 源文件分析 (Top 10):")
        top_files = sorted(type_analysis['by_source_file'].items(), key=lambda x: len(x[1]), reverse=True)[:10]
        for file, endpoints in top_files:
            print(f"{file}: {len(endpoints)} 个端点")
        
        # 详细的栏目页面分析
        print(f"\n📋 栏目页面详细分析:")
        page_endpoints = type_analysis['page_endpoints']
        page_domains = defaultdict(list)
        for ep in page_endpoints:
            path = ep.get('route_info', {}).get('path', '')
            domain = self.get_business_domain(path)
            page_domains[domain].append(ep)
        
        for domain, endpoints in sorted(page_domains.items(), key=lambda x: len(x[1]), reverse=True):
            print(f"  {domain}: {len(endpoints)} 个页面端点")
        
        # 详细的查询端点分析
        print(f"\n🔍 查询端点详细分析:")
        query_endpoints = type_analysis['query_endpoints']
        query_types = defaultdict(list)
        for ep in query_endpoints:
            path = ep.get('route_info', {}).get('path', '').lower()
            if 'stats' in path or 'statistics' in path:
                query_types['statistics'].append(ep)
            elif 'search' in path:
                query_types['search'].append(ep)
            elif 'export' in path or 'download' in path:
                query_types['export'].append(ep)
            elif 'analytics' in path or 'metrics' in path:
                query_types['analytics'].append(ep)
            elif 'report' in path:
                query_types['report'].append(ep)
            else:
                query_types['other'].append(ep)
        
        for qtype, endpoints in sorted(query_types.items(), key=lambda x: len(x[1]), reverse=True):
            print(f"  {qtype}: {len(endpoints)} 个")
        
        # 成功端点详细分析
        print(f"\n🎯 成功端点详细列表:")
        for ep in success_failure['success_endpoints']:
            path = ep.get('route_info', {}).get('path', '')
            method = ep.get('route_info', {}).get('method', 'GET')
            status = ep.get('status_code', 0)
            response_time = ep.get('response_time', 0)
            print(f"  {method} {path} -> {status} ({response_time}ms)")
        
        return type_analysis

def main():
    # 找到最新的扫描结果文件
    import glob
    import os
    
    pattern = "/home/devbox/project/api_scan_results_*.json"
    files = glob.glob(pattern)
    if not files:
        print("❌ 找不到扫描结果文件")
        return
    
    latest_file = max(files, key=os.path.getctime)
    print(f"📁 分析文件: {latest_file}")
    
    analyzer = APIAnalyzer(latest_file)
    analyzer.load_data()
    analyzer.generate_report()

if __name__ == "__main__":
    main()