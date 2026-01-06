#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Claude SDK使用示例
需要设置环境变量 ANTHROPIC_API_KEY
"""

import os
from anthropic import Anthropic

def test_claude_sdk():
    """测试Claude SDK基本功能"""
    
    # 检查API密钥
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ 请设置环境变量 ANTHROPIC_API_KEY")
        print("   export ANTHROPIC_API_KEY=your_api_key_here")
        return False
    
    try:
        # 初始化客户端
        client = Anthropic(api_key=api_key)
        
        # 发送测试消息
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=100,
            messages=[
                {"role": "user", "content": "Hello, Claude! 请用中文回复。"}
            ]
        )
        
        print("✅ Claude SDK测试成功！")
        print(f"回复: {message.content[0].text}")
        return True
        
    except Exception as e:
        print(f"❌ Claude SDK测试失败: {e}")
        return False

def show_available_models():
    """显示可用的模型"""
    print("\n📋 可用的Claude模型:")
    models = [
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229", 
        "claude-3-haiku-20240307",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022"
    ]
    
    for model in models:
        print(f"  • {model}")

if __name__ == "__main__":
    print("🚀 Claude SDK 使用示例")
    print("=" * 50)
    
    show_available_models()
    
    print("\n🔧 测试SDK连接...")
    test_claude_sdk()
    
    print("\n💡 使用提示:")
    print("1. 设置API密钥: export ANTHROPIC_API_KEY=your_key")
    print("2. 激活虚拟环境: source claude-env/bin/activate")
    print("3. 运行此脚本: python3 claude_examples.py") 