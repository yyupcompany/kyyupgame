#!/usr/bin/env python3
"""
批量为Routes文件添加Swagger注释
"""

import os
import re
from pathlib import Path

# 需要处理的文件列表（剩余的中优先级和低优先级文件）
REMAINING_FILES = [
    # 中优先级
    'ai-assistant-optimized.routes.ts',
    'statistics-adapter.routes.ts',
    'activity-poster.routes.ts',
    # 低优先级
    'permissions.routes.ts',
    'ai-stats.routes.ts',
    'page-guide-section.routes.ts',
    'auth-permissions.routes.ts',
    'ai-knowledge.routes.ts',
    'ai-smart-assign.routes.ts',
    'add-permission.ts',
]

def generate_swagger_comment(method, path, summary, description, tag, has_auth=True, params=None, body=None):
    """生成Swagger注释"""
    comment = f"""/**
 * @swagger
 * /api{path}:
 *   {method.lower()}:
 *     summary: {summary}
 *     description: {description}
 *     tags:
 *       - {tag}"""
    
    if has_auth:
        comment += """
 *     security:
 *       - bearerAuth: []"""
    
    if params:
        comment += """
 *     parameters:"""
        for param in params:
            comment += f"""
 *       - in: {param['in']}
 *         name: {param['name']}
 *         required: {str(param.get('required', False)).lower()}
 *         schema:
 *           type: {param.get('type', 'string')}"""
    
    if body and method.upper() in ['POST', 'PUT', 'PATCH']:
        comment += """
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object"""
    
    comment += """
 *     responses:
 *       200:
 *         description: 操作成功"""
    
    if has_auth:
        comment += """
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'"""
    
    comment += """
 */"""
    
    return comment

def extract_routes_from_file(file_path):
    """从文件中提取路由定义"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配路由定义
    route_pattern = r"router\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]"
    routes = re.findall(route_pattern, content)
    
    return routes

def process_file(file_path):
    """处理单个文件"""
    print(f"Processing: {file_path}")
    
    routes = extract_routes_from_file(file_path)
    print(f"  Found {len(routes)} routes")
    
    # 这里可以添加实际的处理逻辑
    # 由于复杂性，建议手动处理或使用更复杂的AST解析
    
    return len(routes)

def main():
    """主函数"""
    routes_dir = Path('server/src/routes')
    total_routes = 0
    
    for filename in REMAINING_FILES:
        file_path = routes_dir / filename
        if file_path.exists():
            count = process_file(file_path)
            total_routes += count
        else:
            print(f"File not found: {filename}")
    
    print(f"\nTotal routes to process: {total_routes}")

if __name__ == '__main__':
    main()

