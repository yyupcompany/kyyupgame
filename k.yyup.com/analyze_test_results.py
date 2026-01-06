#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
园长视角工具测试结果分析器
分析测试结果，生成详细的工具状态报告
"""

import json
import re
from datetime import datetime

def analyze_test_results():
    """分析测试结果并生成报告"""
    
    # 读取测试结果
    try:
        with open('tool_test_results.json', 'r', encoding='utf-8') as f:
            success_results = json.load(f)
    except FileNotFoundError:
        success_results = []
    
    try:
        with open('tool_test_errors.json', 'r', encoding='utf-8') as f:
            error_results = json.load(f)
    except FileNotFoundError:
        error_results = []
    
    # 分析成功的工具
    successful_tools = {}
    for result in success_results:
        test_name = result['test']
        message = result['message']
        response = result['response']
        
        # 提取工具调用信息
        tool_calls = extract_tool_calls(response)
        successful_tools[test_name] = {
            'message': message,
            'tools_used': tool_calls,
            'status': 'success'
        }
    
    # 分析失败的工具
    failed_tools = {}
    for result in error_results:
        test_name = result['test']
        message = result['message']
        response = result['response']
        
        # 提取失败原因
        failure_reason = extract_failure_reason(response)
        failed_tools[test_name] = {
            'message': message,
            'failure_reason': failure_reason,
            'status': 'failed'
        }
    
    # 生成报告
    generate_report(successful_tools, failed_tools)

def extract_tool_calls(response):
    """从响应中提取工具调用信息"""
    tool_calls = []

    # 查找tool_call_start事件 - 修复正则表达式
    tool_start_pattern = r'event: tool_call_start\ndata: ({.*?})'
    matches = re.findall(tool_start_pattern, response, re.DOTALL)

    for match in matches:
        try:
            tool_data = json.loads(match)
            tool_calls.append({
                'name': tool_data.get('name', 'unknown'),
                'arguments': tool_data.get('arguments', {}),
                'description': tool_data.get('description', '')
            })
        except json.JSONDecodeError:
            continue

    # 如果没有找到tool_call_start，尝试查找其他工具调用模式
    if not tool_calls:
        # 查找any_query调用
        any_query_pattern = r'"name":"any_query"'
        if re.search(any_query_pattern, response):
            tool_calls.append({
                'name': 'any_query',
                'arguments': {},
                'description': '智能查询工具'
            })

        # 查找其他常见工具
        common_tools = ['read_data_record', 'create_data_record', 'update_data_record',
                       'delete_data_record', 'render_component', 'navigate_to_page']
        for tool in common_tools:
            if f'"name":"{tool}"' in response or f'"{tool}"' in response:
                tool_calls.append({
                    'name': tool,
                    'arguments': {},
                    'description': f'{tool}工具'
                })
                break

    return tool_calls

def extract_failure_reason(response):
    """从响应中提取失败原因"""
    # 检查是否有工具调用开始但没有完成
    if 'tool_call_start' in response and 'tool_call_complete' not in response:
        return "工具调用超时或中断"
    
    # 检查是否有错误信息
    if 'error' in response.lower():
        return "执行过程中出现错误"
    
    # 检查是否只有thinking但没有实际执行
    if 'thinking' in response and 'tool_call_start' not in response:
        return "AI思考过程中未找到合适的工具或参数"
    
    return "未知原因"

def generate_report(successful_tools, failed_tools):
    """生成详细的测试报告"""
    
    total_tests = len(successful_tools) + len(failed_tools)
    success_count = len(successful_tools)
    failure_count = len(failed_tools)
    success_rate = (success_count / total_tests * 100) if total_tests > 0 else 0
    
    report = f"""
# 🎯 园长视角工具测试报告

**测试时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**测试角色**: 园长 (admin)

## 📊 测试概览

- **总测试数**: {total_tests}
- **成功数**: {success_count} ✅
- **失败数**: {failure_count} ❌
- **成功率**: {success_rate:.1f}%

## ✅ 成功的工具测试 ({success_count}个)

"""
    
    # 按类别分组成功的工具
    categories = {
        '上下文注入工具': [],
        '数据库CRUD工具': [],
        '页面操作工具': [],
        '任务管理工具': [],
        'UI展示工具': [],
        '专家咨询工具': [],
        '智能查询工具': [],
        '网络搜索工具': [],
        '工作流工具': [],
        '文档生成工具': [],
        '其他工具': []
    }
    
    for test_name, details in successful_tools.items():
        category = categorize_test(test_name)
        categories[category].append((test_name, details))
    
    for category, tests in categories.items():
        if tests:
            report += f"\n### {category}\n\n"
            for test_name, details in tests:
                tools_used = ', '.join([tool['name'] for tool in details['tools_used']])
                report += f"- **{test_name}**: {tools_used or '无工具调用'}\n"
                report += f"  - 测试消息: {details['message']}\n"
    
    # 失败的工具分析
    if failed_tools:
        report += f"\n## ❌ 失败的工具测试 ({failure_count}个)\n\n"
        
        for test_name, details in failed_tools.items():
            report += f"### {test_name}\n\n"
            report += f"- **测试消息**: {details['message']}\n"
            report += f"- **失败原因**: {details['failure_reason']}\n"
            report += f"- **建议**: {get_failure_suggestion(test_name, details['failure_reason'])}\n\n"
    
    # 工具使用统计
    tool_usage = {}
    for details in successful_tools.values():
        for tool in details['tools_used']:
            tool_name = tool['name']
            tool_usage[tool_name] = tool_usage.get(tool_name, 0) + 1
    
    if tool_usage:
        report += "\n## 📈 工具使用统计\n\n"
        sorted_tools = sorted(tool_usage.items(), key=lambda x: x[1], reverse=True)
        for tool_name, count in sorted_tools:
            report += f"- **{tool_name}**: {count}次使用\n"
    
    # 保存报告
    with open('tool_test_report.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("📄 测试报告已生成: tool_test_report.md")
    print(f"📊 测试概览: {success_count}/{total_tests} 成功 ({success_rate:.1f}%)")

def categorize_test(test_name):
    """根据测试名称分类"""
    if any(keyword in test_name for keyword in ['机构现状', '工具发现']):
        return '上下文注入工具'
    elif any(keyword in test_name for keyword in ['查看', '创建', '更新', '删除', '学生', '教师', '班级']):
        return '数据库CRUD工具'
    elif any(keyword in test_name for keyword in ['导航', '页面']):
        return '页面操作工具'
    elif any(keyword in test_name for keyword in ['任务', '待办', '复杂度']):
        return '任务管理工具'
    elif any(keyword in test_name for keyword in ['渲染', '表格', '图表', '卡片']):
        return 'UI展示工具'
    elif any(keyword in test_name for keyword in ['专家', '咨询']):
        return '专家咨询工具'
    elif any(keyword in test_name for keyword in ['查询', '统计', '分析']):
        return '智能查询工具'
    elif any(keyword in test_name for keyword in ['搜索']):
        return '网络搜索工具'
    elif any(keyword in test_name for keyword in ['活动', '方案', '流程']):
        return '工作流工具'
    elif any(keyword in test_name for keyword in ['PDF', 'Excel', 'Word', 'PPT']):
        return '文档生成工具'
    else:
        return '其他工具'

def get_failure_suggestion(test_name, failure_reason):
    """根据失败原因提供建议"""
    if 'PDF' in test_name or 'Excel' in test_name:
        return "可能缺少文档生成工具，建议检查工具注册或实现相应的文档生成功能"
    elif '验证' in test_name:
        return "数据验证功能可能需要更复杂的逻辑，建议优化验证算法或工具实现"
    elif '超时' in failure_reason:
        return "工具执行超时，建议优化工具性能或增加超时时间"
    else:
        return "建议检查工具实现和参数配置"

if __name__ == '__main__':
    analyze_test_results()
