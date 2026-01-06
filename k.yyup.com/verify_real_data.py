#!/usr/bin/env python3
import json
import os
import sys

def analyze_test_results():
    """分析测试结果，验证是否使用真实数据"""
    results_dir = "/home/zhgue/kyyupgame/k.yyup.com/tool_test_results"
    files = [f for f in os.listdir(results_dir) if f.endswith('.json')]

    print("="*80)
    print("🏫 真实数据验证报告")
    print("="*80)
    print(f"\n📊 测试文件总数: {len(files)}")
    print(f"\n{'工具名称':<30} {'状态':<10} {'数据特征':<50}")
    print("-"*80)

    real_data_count = 0
    mock_data_count = 0

    for file in sorted(files):
        filepath = os.path.join(results_dir, file)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # 提取所有event行
            events = [line for line in content.split('\n') if line.startswith('event:')]

            # 提取data行
            data_lines = [line for line in content.split('\n') if line.startswith('data:')]

            # 查找final_answer事件中的内容
            final_answer_data = ""
            for i, line in enumerate(data_lines):
                if '"final_answer"' in line:
                    # 尝试获取下一行的data
                    if i + 1 < len(data_lines):
                        final_answer_data = data_lines[i + 1]
                    break

            # 分析是否为真实数据
            is_real_data = False
            features = []

            # 检查真实数据特征
            real_data_indicators = [
                "学生总数", "教职工", "班级设置", "大班A", "中班", "小班",
                "285人", "42人", "25人", "10个", "8个",
                "dbconn.sealoshzh.site", "kargerdensales",
                "Sequelize", "SELECT", "FROM",
                "园长", "老师", "家长",
            ]

            mock_data_indicators = [
                "模拟数据", "mock", "测试数据", "示例", "example",
                "这是真实数据测试", "模拟测试",
            ]

            # 检查content字段
            if '"content":' in content:
                # 提取content内容
                import re
                content_match = re.search(r'"content":"([^"]*(?:\\.[^"]*)*)"', content)
                if content_match:
                    content_text = content_match.group(1)
                    # 解码转义字符
                    content_text = content_text.encode().decode('unicode_escape')

                    # 检查真实数据指标
                    for indicator in real_data_indicators:
                        if indicator in content_text:
                            is_real_data = True
                            features.append(f"包含'{indicator}'")

            # 如果没有找到真实数据指标，检查是否包含模拟数据指标
            if not is_real_data:
                for indicator in mock_data_indicators:
                    if indicator.lower() in content.lower():
                        features.append(f"模拟数据特征: '{indicator}'")
                        mock_data_count += 1
                        break
            else:
                real_data_count += 1

            # 获取工具名称
            tool_name = file.replace('tool_', '').replace('.json', '').split('_', 1)[1] if '_' in file else file

            # 显示状态
            status = "✅ 真实数据" if is_real_data else "⚠️ 需检查"
            features_str = " | ".join(features[:3]) if features else "未检测到特征"

            print(f"{tool_name:<30} {status:<10} {features_str:<50}")

        except Exception as e:
            print(f"{file:<30} {'❌ 错误':<10} {str(e)[:50]}")

    print("-"*80)
    print(f"\n✅ 真实数据工具数量: {real_data_count}")
    print(f"⚠️ 需检查工具数量: {mock_data_count}")
    print(f"\n{'='*80}")

    # 验证环境变量
    print("\n🔧 环境变量验证:")
    try:
        with open('/home/zhgue/kyyupgame/k.yyup.com/server/.env', 'r') as f:
            env_content = f.read()
            if 'AI_USE_MOCK=false' in env_content:
                print("✅ AI_USE_MOCK=false - 已启用真实数据")
            elif 'AI_USE_MOCK=true' in env_content:
                print("❌ AI_USE_MOCK=true - 仍在使用模拟数据")
            else:
                print("⚠️ AI_USE_MOCK 未设置")
    except:
        print("❌ 无法读取 .env 文件")

    print("\n" + "="*80)

if __name__ == '__main__':
    analyze_test_results()
