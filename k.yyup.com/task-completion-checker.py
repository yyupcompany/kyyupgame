#!/usr/bin/env python3
"""
任务完成度检测脚本
通过调用Claude Code来分析任务是否真正完成
使用完整的上下文信息进行智能判断
"""

import sys
import subprocess
import json
import os

def read_context_from_stdin():
    """
    从stdin读取hook的上下文信息
    """
    try:
        context_data = sys.stdin.read()
        if context_data:
            return json.loads(context_data)
        return {}
    except json.JSONDecodeError:
        return {}
    except Exception:
        return {}

def check_task_completion(context):
    """
    使用完整上下文检查任务是否完成
    """
    
    # 提取上下文信息
    session_id = context.get('session_id', '')
    transcript_path = context.get('transcript_path', '')
    tool_name = context.get('tool_name', '')
    tool_input = context.get('tool_input', {})
    cwd = context.get('cwd', '')
    
    # 读取对话历史（如果有）
    conversation_context = ""
    if transcript_path and os.path.exists(transcript_path):
        try:
            with open(transcript_path, 'r', encoding='utf-8') as f:
                # 读取最后几行对话
                lines = f.readlines()
                conversation_context = ''.join(lines[-10:])  # 最后10行
        except Exception:
            conversation_context = "无法读取对话历史"
    
    # 构建给Claude的详细prompt
    prompt = f"""
请基于以下完整上下文分析Claude刚才的回答是否完整解决了用户的问题：

## 会话信息
- Session ID: {session_id}
- 工作目录: {cwd}

## 最近对话历史
{conversation_context}

## 分析要求
请判断Claude的回答是否已经完全满足了用户的需求：

1. 用户的原始问题/任务是什么？
2. Claude是否完全解决了这个问题？
3. 是否还有遗漏或需要继续的工作？
4. 用户是否可能需要更多信息或后续操作？

请严格按照以下格式回答（只回答一个）：
- "COMPLETED" - 任务完全完成，用户需求已满足
- "CONTINUE" - 需要继续完成任务，发送消息"继续完成任务"

判断依据：
- 用户问题的复杂程度和范围
- Claude回答的完整性和准确性
- 是否有明显的遗漏步骤
- 用户是否可能需要进一步的帮助或说明
"""

    try:
        # 调用Claude进行分析，传入上下文
        cmd = [
            "claude", 
            "-p", prompt
        ]
        
        result = subprocess.run(
            cmd, 
            input=conversation_context,
            capture_output=True, 
            text=True, 
            timeout=30
        )
        
        if result.returncode == 0:
            output = result.stdout.strip()
            
            # 解析Claude的回复
            if "COMPLETED" in output.upper():
                return "approve", "✅ 任务已完成"
            elif "CONTINUE" in output.upper():
                # 当需要继续时，发送消息给Claude
                return "message", "继续完成任务"
            else:
                return "approve", "🤷 无法确定状态，默认通过"
        else:
            return "approve", f"🔧 检测失败: {result.stderr[:100]}"
            
    except subprocess.TimeoutExpired:
        return "approve", "⏰ 检测超时，默认通过"
    except Exception as e:
        return "approve", f"❌ 检测异常: {str(e)[:100]}"

def main():
    """
    主函数 - 使用完整的hook上下文
    """
    
    # 从stdin读取hook上下文
    context = read_context_from_stdin()
    
    # 如果没有上下文，从命令行参数获取基本信息（向后兼容）
    if not context and len(sys.argv) > 1:
        context = {
            'transcript_path': sys.argv[1] if len(sys.argv) > 1 else "",
            'tool_name': sys.argv[2] if len(sys.argv) > 2 else "",
            'tool_input': sys.argv[3] if len(sys.argv) > 3 else ""
        }
    
    decision, reason = check_task_completion(context)
    
    if decision == "message":
        result = {
            "decision": "message",
            "message": reason
        }
    else:
        result = {
            "decision": decision,
            "reason": reason
        }
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()