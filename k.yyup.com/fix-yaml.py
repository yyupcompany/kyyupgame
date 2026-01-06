#!/usr/bin/env python3
import sys
import re

def fix_field_template_routes():
    """修复field-template.routes.ts中的重复type键"""
    file_path = "/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/field-template.routes.ts"
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 修复第355行的重复type问题
    # 将 "*                     type:" 后面跟着 "*                       type: string" 的情况替换
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if i == 354 and 'type:' in line:  # 第355行（0-based）
            if 'fieldType:' not in line:  # 确保还没被修复
                lines[i] = line.replace('type:', 'fieldType:')
                break

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print("✅ field-template.routes.ts 修复完成")

def fix_function_tools_routes():
    """修复function-tools.routes.ts中的重复event和data键"""
    file_path = "/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/ai/function-tools.routes.ts"
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 将多行字符串格式改为JSON格式字符串
    old_example = """*               example: |
*                 event: thinking-start
*                 data: {"status": "thinking"}
*
*                 event: response-content
*                 data: {"content": "基于我的分析，提高幼儿园招生效果可以从以下几个方面入手："}
*
*                 event: complete
*                 data: {"status": "complete"}"""

    new_example = """*               example: "event: thinking-start\\ndata: {\\"status\\": \\"thinking\\"}\\n\\n                event: response-content\\ndata: {\\"content\\": \\"基于我的分析，提高幼儿园招生效果可以从以下几个方面入手：\\"}\\n\\n                event: complete\\ndata: {\\"status\\": \\"complete\\"}"""""

    content = content.replace(old_example, new_example)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ function-tools.routes.ts 修复完成")

def fix_unified_stream_routes():
    """修复unified-stream.routes.ts中的YAML语法错误"""
    file_path = "/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/ai/unified-stream.routes.ts"
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 修复复杂的YAML格式问题
    # 将复杂的多行内容简化
    lines = content.split('\n')
    in_problem_section = False
    fixed_lines = []

    for i, line in enumerate(lines):
        # 检测问题开始的行
        if 'summary: SSE流式AI聊天接口' in line and i < 20:
            in_problem_section = True

        if in_problem_section:
            # 跳过有问题的多行内容，用简化的内容替代
            if line.strip().startswith('-') or line.strip().startswith('智能路由特性：'):
                continue
            elif line.strip() == '':
                if in_problem_section:
                    # 结束问题段落，添加简化内容
                    fixed_lines.append(' *     description: "智能路由SSE聊天接口，支持复杂度评估和自动路由决策"')
                    in_problem_section = False
                    continue
            elif 'null' in line and i < 20:
                # 跳过null重复
                continue

        fixed_lines.append(line)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))
    print("✅ unified-stream.routes.ts 修复完成")

def fix_other_routes():
    """修复其他路由文件中的YAML注释问题"""
    # 这些文件的问题主要是将代码注释误认为YAML
    files_to_fix = [
        "/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/ai/analytics.routes.ts",
        "/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/ai/model-management.routes.ts",
        "/home/zhgue/kyyupgame/k.yyup.com/server/src/routes/ai/quota.routes.ts"
    ]

    for file_path in files_to_fix:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 在文件开头添加明确的YAML文档分隔符
        if content.startswith('/**'):
            lines = content.split('\n')
            # 在第一个注释块后添加YAML标记
            for i, line in enumerate(lines):
                if line.strip() == '*/' and i < 10:
                    lines.insert(i + 1, '')
                    lines.insert(i + 2, '---')
                    break

            content = '\n'.join(lines)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {file_path.split('/')[-1]} 修复完成")

if __name__ == "__main__":
    print("🔧 开始修复YAML文档格式错误...")
    try:
        fix_field_template_routes()
        fix_function_tools_routes()
        fix_unified_stream_routes()
        fix_other_routes()
        print("🎉 所有YAML文档格式错误修复完成！")
    except Exception as e:
        print(f"❌ 修复过程中出现错误: {e}")
        sys.exit(1)