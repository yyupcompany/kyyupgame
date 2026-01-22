#!/usr/bin/env python3
import sys

with open('a2ui-curriculum-stream.service.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 修改第559行，添加 isReasoning 变量
if 'const isReasoning' not in lines[558]:
    lines[558] = lines[558].rstrip() + "\n              const isReasoning = delta?.reasoning_content !== undefined;\n"

# 修改第562行的 fullContent += content; 逻辑
if 'fullContent += content;' in lines[561]:
    lines[561] = lines[561].replace('fullContent += content;', '// 检测思考过程')
    
    # 在 isCollectingThinking = true; 之后添加条件判断
    if 'isCollectingThinking = true;' in lines[563]:
        indent = '                '
        new_code = '''}
                
                // 如果是思考内容，只添加到thinkingContent
                if (isCollectingThinking || isReasoning) {
                  thinkingContent += content;
                  sendComponent({
                    type: 'thinking',
                    content: content
                  });
                } else {
                  fullContent += content;
                }
'''
        # 插入新代码
        lines.insert(564, new_code)
        
        # 移除后面的重复逻辑 (原来的 fullContent += content 和 thinkingContent += content)
        # 跳过第564-579行
        del lines[564:580]
        
        # 修改 isCollectingThinking = false; 的位置和注释
        for i in range(len(lines)):
            if "isCollectingThinking = false;" in lines[i]:
                lines[i] = lines[i].rstrip() + "\n\n                // 检测思考过程结束\n"
                break

with open('a2ui-curriculum-stream.service.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed!")
