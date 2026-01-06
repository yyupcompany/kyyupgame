#!/usr/bin/env python3
"""
API 链接扫描器
从数据库读取所有路由并快速测试API端点状态
"""

import pymysql
import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin
import sys
from typing import List, Dict, Tuple

# 数据库配置
DB_CONFIG = {
    'host': 'dbconn.sealoshzh.site',
    'port': 43906,
    'user': 'root',
    'password': 'pwk5ls7j',
    'database': 'kargerdensales',
    'charset': 'utf8mb4'
}

# API 基础配置
API_BASE_URL = 'http://localhost:3000'
TIMEOUT = 1.0  # 100ms超时改为1秒，确保连接稳定
MAX_WORKERS = 10  # 并发数

class APIScanner:
    def __init__(self):
        self.connection = None
        self.routes = []
        self.results = []
        
    def connect_db(self):
        """连接数据库"""
        try:
            self.connection = pymysql.connect(**DB_CONFIG)
            print(f"✅ 数据库连接成功: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
            return True
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            return False
    
    def extract_routes_from_code(self):
        """从代码文件中提取所有API路由"""
        import os
        import re
        
        routes = []
        routes_dir = '/home/devbox/project/server/src/routes'
        
        if not os.path.exists(routes_dir):
            print(f"❌ 路由目录不存在: {routes_dir}")
            return routes
            
        print("🔍 从代码文件扫描路由...")
        
        # 路由模式匹配
        route_patterns = [
            r"router\.(get|post|put|patch|delete)\s*\(\s*['\"]([^'\"]+)['\"]",  # Express路由
            r"@(Get|Post|Put|Patch|Delete)\s*\(\s*['\"]([^'\"]+)['\"]",  # 装饰器路由
            r"app\.(get|post|put|patch|delete)\s*\(\s*['\"]([^'\"]+)['\"]",  # App路由
        ]
        
        route_count = 0
        
        # 遍历所有路由文件
        for root, dirs, files in os.walk(routes_dir):
            for file in files:
                if file.endswith(('.ts', '.js')) and not file.endswith('.test.ts'):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, routes_dir)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                        # 提取路由前缀
                        prefix_match = re.search(r"router\.use\s*\(\s*['\"]([^'\"]+)['\"]", content)
                        file_prefix = prefix_match.group(1) if prefix_match else ''
                        
                        # 从文件名推断前缀
                        if not file_prefix and file != 'index.ts':
                            name_parts = file.replace('.routes.ts', '').replace('.ts', '').split('-')
                            if len(name_parts) > 1:
                                file_prefix = '/' + '-'.join(name_parts)
                            elif name_parts[0] != 'index':
                                file_prefix = '/' + name_parts[0]
                        
                        # 扫描路由定义
                        for pattern in route_patterns:
                            matches = re.finditer(pattern, content, re.IGNORECASE)
                            for match in matches:
                                method = match.group(1).upper()
                                path = match.group(2)
                                
                                # 构建完整路径
                                if path.startswith('/'):
                                    full_path = path
                                else:
                                    full_path = file_prefix + ('/' + path if path else '')
                                
                                # 添加/api前缀（如果还没有）
                                if not full_path.startswith('/api'):
                                    full_path = '/api' + full_path
                                
                                routes.append({
                                    'type': 'code_extracted',
                                    'path': full_path,
                                    'method': method,
                                    'file': relative_path,
                                    'source': 'code_analysis'
                                })
                                route_count += 1
                                
                    except Exception as e:
                        print(f"⚠️ 读取文件失败 {relative_path}: {e}")
        
        print(f"📈 从代码中提取了 {route_count} 个路由")
        return routes

    def get_routes_from_db(self):
        """从数据库获取所有路由信息"""
        routes = []
        
        # 首先从代码中提取路由
        code_routes = self.extract_routes_from_code()
        routes.extend(code_routes)
        
        # 从导航配置表获取路由
        navigation_query = """
        SELECT route, name, component, meta 
        FROM navigation_config 
        WHERE route IS NOT NULL AND route != ''
        """
        
        # 从系统配置中获取API端点
        api_query = """
        SELECT config_key, config_value, description 
        FROM system_configs 
        WHERE config_key LIKE '%api%' OR config_key LIKE '%endpoint%' OR config_key LIKE '%url%'
        """
        
        # 从日志表获取访问过的路由
        log_query = """
        SELECT DISTINCT endpoint, method, COUNT(*) as access_count
        FROM operation_logs 
        WHERE endpoint IS NOT NULL 
        GROUP BY endpoint, method 
        ORDER BY access_count DESC
        LIMIT 200
        """
        
        try:
            cursor = self.connection.cursor()
            
            # 查询导航路由
            print("🔍 扫描导航路由...")
            cursor.execute(navigation_query)
            nav_routes = cursor.fetchall()
            for route_data in nav_routes:
                routes.append({
                    'type': 'navigation',
                    'path': route_data[0],
                    'name': route_data[1],
                    'source': 'navigation_config'
                })
            
            # 查询API端点配置
            print("🔍 扫描API配置...")
            cursor.execute(api_query)
            api_configs = cursor.fetchall()
            for config in api_configs:
                routes.append({
                    'type': 'config',
                    'path': config[1],
                    'name': config[0],
                    'source': 'system_configs'
                })
            
            # 查询访问日志中的端点
            print("🔍 扫描访问日志...")
            cursor.execute(log_query)
            log_routes = cursor.fetchall()
            for log_data in log_routes:
                routes.append({
                    'type': 'logged',
                    'path': log_data[0],
                    'method': log_data[1],
                    'access_count': log_data[2],
                    'source': 'operation_logs'
                })
            
        except Exception as e:
            print(f"⚠️ 从数据库查询路由时出错: {e}")
        
        # 添加常见的RESTful端点变体
        base_resources = [
            'auth', 'users', 'teachers', 'students', 'parents', 'classes', 
            'activities', 'enrollment-plans', 'enrollment-applications', 
            'enrollment-consultations', 'marketing-campaigns', 'advertisements',
            'customer-pool', 'dashboard', 'principal', 'ai', 'ai-query', 
            'statistics', 'performance-evaluations', 'notifications', 'system'
        ]
        
        rest_endpoints = []
        for resource in base_resources:
            rest_endpoints.extend([
                f'/api/{resource}',           # GET, POST
                f'/api/{resource}/{{id}}',    # GET, PUT, DELETE
                f'/api/{resource}/search',    # GET, POST
                f'/api/{resource}/stats',     # GET
                f'/api/{resource}/export',    # GET
                f'/api/{resource}/batch',     # POST
            ])
        
        for endpoint in rest_endpoints:
            routes.append({
                'type': 'restful',
                'path': endpoint,
                'name': endpoint.split('/')[-1],
                'source': 'restful_pattern'
            })
        
        return routes
    
    def test_endpoint(self, route_info: Dict) -> Dict:
        """测试单个API端点"""
        path = route_info['path']
        
        # 确保路径以/开头
        if not path.startswith('/'):
            path = '/' + path
        
        # 如果不是API路径，添加/api前缀
        if not path.startswith('/api') and route_info['type'] != 'navigation':
            path = '/api' + path
        
        url = urljoin(API_BASE_URL, path)
        method = route_info.get('method', 'GET').upper()
        
        start_time = time.time()
        
        try:
            if method == 'GET':
                response = requests.get(url, timeout=TIMEOUT)
            elif method == 'POST':
                response = requests.post(url, timeout=TIMEOUT, json={})
            elif method == 'PUT':
                response = requests.put(url, timeout=TIMEOUT, json={})
            elif method == 'DELETE':
                response = requests.delete(url, timeout=TIMEOUT)
            else:
                response = requests.get(url, timeout=TIMEOUT)
            
            duration = (time.time() - start_time) * 1000  # ms
            
            result = {
                'url': url,
                'method': method,
                'status_code': response.status_code,
                'response_time': round(duration, 2),
                'success': 200 <= response.status_code < 400,
                'route_info': route_info
            }
            
            # 尝试解析JSON响应
            try:
                result['response_data'] = response.json()
            except:
                result['response_data'] = response.text[:200] if response.text else ''
            
            return result
            
        except requests.exceptions.Timeout:
            return {
                'url': url,
                'method': method,
                'status_code': 'TIMEOUT',
                'response_time': TIMEOUT * 1000,
                'success': False,
                'error': 'Request timeout',
                'route_info': route_info
            }
        except requests.exceptions.ConnectionError:
            return {
                'url': url,
                'method': method,
                'status_code': 'CONNECTION_ERROR',
                'response_time': 0,
                'success': False,
                'error': 'Connection failed',
                'route_info': route_info
            }
        except Exception as e:
            return {
                'url': url,
                'method': method,
                'status_code': 'ERROR',
                'response_time': 0,
                'success': False,
                'error': str(e),
                'route_info': route_info
            }
    
    def scan_all_endpoints(self):
        """并发扫描所有端点"""
        if not self.routes:
            print("❌ 没有找到路由信息")
            return
        
        print(f"🚀 开始扫描 {len(self.routes)} 个端点...")
        print(f"⚙️ 配置: 超时{TIMEOUT}s, 并发数{MAX_WORKERS}")
        
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            # 提交所有任务
            future_to_route = {
                executor.submit(self.test_endpoint, route): route 
                for route in self.routes
            }
            
            # 收集结果
            completed = 0
            for future in as_completed(future_to_route):
                result = future.result()
                self.results.append(result)
                completed += 1
                
                # 显示进度
                status_emoji = "✅" if result['success'] else "❌"
                print(f"{status_emoji} [{completed}/{len(self.routes)}] {result['method']} {result['url']} -> {result['status_code']} ({result['response_time']}ms)")
        
        duration = time.time() - start_time
        print(f"\n🏁 扫描完成! 耗时: {duration:.2f}s")
    
    def generate_report(self):
        """生成扫描报告"""
        if not self.results:
            print("❌ 没有扫描结果")
            return
        
        # 统计数据
        total = len(self.results)
        successful = sum(1 for r in self.results if r['success'])
        failed = total - successful
        success_rate = (successful / total) * 100
        
        # 按状态码分组
        status_groups = {}
        for result in self.results:
            status = result['status_code']
            if status not in status_groups:
                status_groups[status] = []
            status_groups[status].append(result)
        
        # 响应时间统计
        response_times = [r['response_time'] for r in self.results if isinstance(r['response_time'], (int, float))]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        print("\n" + "="*60)
        print("📊 API扫描报告")
        print("="*60)
        print(f"总计端点: {total}")
        print(f"成功: {successful} ({success_rate:.1f}%)")
        print(f"失败: {failed}")
        print(f"平均响应时间: {avg_response_time:.2f}ms")
        
        print("\n📈 状态码分布:")
        for status, results in sorted(status_groups.items()):
            count = len(results)
            percentage = (count / total) * 100
            print(f"  {status}: {count} ({percentage:.1f}%)")
        
        print("\n❌ 失败的端点:")
        failed_results = [r for r in self.results if not r['success']]
        for result in failed_results[:10]:  # 只显示前10个
            error_info = result.get('error', result['status_code'])
            print(f"  {result['method']} {result['url']} -> {error_info}")
        
        if len(failed_results) > 10:
            print(f"  ... 还有 {len(failed_results) - 10} 个失败端点")
        
        print("\n✅ 成功的端点 (前10个最快):")
        successful_results = [r for r in self.results if r['success']]
        successful_results.sort(key=lambda x: x['response_time'])
        for result in successful_results[:10]:
            print(f"  {result['method']} {result['url']} -> {result['status_code']} ({result['response_time']}ms)")
    
    def save_results(self, filename: str = None):
        """保存结果到文件"""
        if not filename:
            filename = f"api_scan_results_{int(time.time())}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({
                    'scan_time': time.time(),
                    'total_endpoints': len(self.results),
                    'successful': sum(1 for r in self.results if r['success']),
                    'results': self.results
                }, f, indent=2, ensure_ascii=False)
            
            print(f"\n💾 结果已保存到: {filename}")
        except Exception as e:
            print(f"❌ 保存文件失败: {e}")
    
    def run(self):
        """运行完整扫描流程"""
        print("🔍 API链接扫描器启动")
        print(f"🎯 目标服务器: {API_BASE_URL}")
        
        # 连接数据库
        if not self.connect_db():
            print("❌ 无法连接数据库，使用预定义端点")
            self.routes = self.get_routes_from_db()
        else:
            # 从数据库获取路由
            self.routes = self.get_routes_from_db()
            self.connection.close()
        
        print(f"📋 找到 {len(self.routes)} 个端点")
        
        # 去重
        unique_routes = []
        seen = set()
        for route in self.routes:
            key = (route['path'], route.get('method', 'GET'))
            if key not in seen:
                seen.add(key)
                unique_routes.append(route)
        
        self.routes = unique_routes
        print(f"📋 去重后: {len(self.routes)} 个唯一端点")
        
        # 扫描端点
        self.scan_all_endpoints()
        
        # 生成报告
        self.generate_report()
        
        # 保存结果
        self.save_results()

def main():
    scanner = APIScanner()
    scanner.run()

if __name__ == "__main__":
    main()