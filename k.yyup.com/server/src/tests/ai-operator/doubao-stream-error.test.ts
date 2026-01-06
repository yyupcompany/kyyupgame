/**
 * 单元测试：还原豆包thinking模型的实际错误
 * 
 * 目的：模拟真实的豆包API流式响应，还原"返回150+数据块但最终内容为0"的错误
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'stream';

describe('豆包Stream响应错误还原测试', () => {
  
  it('应该还原"150+数据块但最终内容为0"的错误', async () => {
    // 模拟真实的豆包thinking模型SSE响应
    // 根据curl测试结果，豆包返回的格式可能是这样的
    const mockSSEResponse = `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"doubao-seed-1-6-thinking-250615","choices":[{"index":0,"delta":{"role":"assistant","content":"","reasoning_content":"我现在需要分析用户的问题"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"doubao-seed-1-6-thinking-250615","choices":[{"index":0,"delta":{"content":"","reasoning_content":"首先要了解招生策略的背景"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"doubao-seed-1-6-thinking-250615","choices":[{"index":0,"delta":{"content":"","reasoning_content":"需要考虑多个因素"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"doubao-seed-1-6-thinking-250615","choices":[{"index":0,"delta":{"content":"","reasoning_content":"我应该询问具体需求"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"doubao-seed-1-6-thinking-250615","choices":[{"index":0,"delta":{"content":"","reasoning_content":"这样才能提供针对性建议"},"finish_reason":null}]}

data: [DONE]
`;

    // 模拟后端的流式数据处理逻辑
    let fullContent = '';
    let fullReasoningContent = '';
    let chunkCount = 0;
    let hasReasoningLog = false;

    // 解析SSE数据
    const lines = mockSSEResponse.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6).trim();
        
        if (data === '[DONE]') {
          console.log(`✅ [Stream] 接受完毕：输出≈${fullContent.length} tokens，数据块=${chunkCount}，长度=${fullContent.length}`);
          break;
        }

        try {
          const parsed = JSON.parse(data);
          chunkCount++;

          if (parsed.choices && parsed.choices[0]) {
            const choice = parsed.choices[0];

            // 🔍 处理delta格式（流式增量）
            if (choice.delta) {
              const delta = choice.delta;

              // 🚨🚨🚨 验证日志：打印delta对象的所有字段
              console.log(`🚨🚨🚨 [DELTA-DEBUG] 数据块 ${chunkCount}`);
              console.log(`🚨🚨🚨 [DELTA-DEBUG] Delta对象字段:`, Object.keys(delta));
              console.log(`🚨🚨🚨 [DELTA-DEBUG] Delta完整内容:`, JSON.stringify(delta));

              // 🔧 处理思考内容 (reasoning_content) - 豆包thinking模型
              if (delta.reasoning_content) {
                hasReasoningLog = true;
                console.log(`🚨🚨🚨 [REASONING-FOUND] 发现reasoning_content字段！`);
                // 累加思考内容
                fullReasoningContent += delta.reasoning_content;

                // 打印日志
                const reasoningPreview = delta.reasoning_content.length > 50 ?
                  delta.reasoning_content.substring(0, 50) + '...' : delta.reasoning_content;
                console.log(`🤔 [Reasoning] ${reasoningPreview}`);
              } else {
                console.log(`🚨🚨🚨 [REASONING-NOT-FOUND] 未发现reasoning_content字段`);
              }

              // 累加文本内容
              if (delta.content) {
                fullContent += delta.content;
                console.log(`📝 [Content] ${delta.content}`);
              }
            }
          }
        } catch (error) {
          console.error('解析错误:', error);
        }
      }
    }

    // 验证结果
    console.log('\n========== 错误还原结果 ==========');
    console.log(`❌ 数据块数量: ${chunkCount}`);
    console.log(`❌ 最终内容长度: ${fullContent.length}`);
    console.log(`❌ 思考内容长度: ${fullReasoningContent.length}`);
    console.log(`❌ 是否有Reasoning日志: ${hasReasoningLog}`);
    console.log(`❌ 最终内容: "${fullContent}"`);
    console.log(`❌ 思考内容: "${fullReasoningContent}"`);
    console.log('====================================\n');

    // 断言：还原错误场景
    expect(chunkCount).toBeGreaterThan(0); // 有数据块
    expect(fullContent).toBe(''); // 但最终内容为空
    expect(fullReasoningContent.length).toBeGreaterThan(0); // 思考内容不为空
    expect(hasReasoningLog).toBe(true); // 应该有Reasoning日志
  });

  it('应该测试实际后端可能遇到的字段名问题', () => {
    // 测试可能的字段名变体
    const possibleFieldNames = [
      'reasoning_content',
      'reasoningContent',
      'reasoning',
      'thought',
      'thinking',
      'internal_thought',
      'chain_of_thought'
    ];

    const testDelta = {
      role: 'assistant',
      reasoning_content: '这是思考内容',
      content: ''
    };

    console.log('\n========== 字段名测试 ==========');
    console.log('Delta对象:', JSON.stringify(testDelta));
    console.log('实际字段:', Object.keys(testDelta));
    
    possibleFieldNames.forEach(fieldName => {
      const hasField = fieldName in testDelta;
      const value = (testDelta as any)[fieldName];
      console.log(`检查字段 "${fieldName}": ${hasField ? '✅ 存在' : '❌ 不存在'} ${value ? `值="${value}"` : ''}`);
    });
    console.log('====================================\n');

    // 验证
    expect(testDelta).toHaveProperty('reasoning_content');
    expect(testDelta.reasoning_content).toBe('这是思考内容');
  });

  it('应该测试空字符串vs undefined的判断差异', () => {
    const testCases = [
      { reasoning_content: '有内容', expected: true },
      { reasoning_content: '', expected: false },
      { reasoning_content: undefined, expected: false },
      { content: '只有content' }, // 没有reasoning_content字段
    ];

    console.log('\n========== 空值判断测试 ==========');
    testCases.forEach((testCase, index) => {
      const hasReasoningContent = !!(testCase as any).reasoning_content;
      const hasField = 'reasoning_content' in testCase;
      
      console.log(`\n测试用例 ${index + 1}:`, JSON.stringify(testCase));
      console.log(`  有reasoning_content字段: ${hasField}`);
      console.log(`  reasoning_content值: ${(testCase as any).reasoning_content}`);
      console.log(`  if (delta.reasoning_content) 判断结果: ${hasReasoningContent}`);
      
      if ('expected' in testCase) {
        expect(hasReasoningContent).toBe(testCase.expected);
      }
    });
    console.log('====================================\n');
  });

  it('应该模拟后端实际的buffer解析逻辑', () => {
    // 模拟后端实际的buffer解析
    // 这是unified-intelligence.service.ts中的实际逻辑
    
    let buffer = '';
    let fullContent = '';
    let fullReasoningContent = '';
    let chunkCount = 0;

    // 模拟流式数据分批到达
    const streamChunks = [
      'data: {"choices":[{"delta":{"role":"assistant","reasoning_content":"思考1","content":""}}]}\n\n',
      'data: {"choices":[{"delta":{"reasoning_content":"思考2","content":""}}]}\n\n',
      'data: {"choices":[{"delta":{"reasoning_content":"","content":"回复1"}}]}\n\n',
      'data: [DONE]\n\n'
    ];

    console.log('\n========== Buffer解析测试 ==========');
    
    streamChunks.forEach((chunk, index) => {
      console.log(`\n接收数据块 ${index + 1}:`, chunk.replace(/\n/g, '\\n'));
      buffer += chunk;

      // 按行分割
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6).trim();
          
          if (data === '[DONE]') {
            console.log('✅ 接收完毕');
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            chunkCount++;

            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
              const delta = parsed.choices[0].delta;
              
              console.log(`  Delta ${chunkCount}:`, JSON.stringify(delta));

              // 处理reasoning_content
              if (delta.reasoning_content) {
                fullReasoningContent += delta.reasoning_content;
                console.log(`  ✅ 累加reasoning_content: "${delta.reasoning_content}"`);
              }

              // 处理content
              if (delta.content) {
                fullContent += delta.content;
                console.log(`  ✅ 累加content: "${delta.content}"`);
              }
            }
          } catch (error) {
            console.error('  ❌ 解析错误:', error);
          }
        }
      }
    });

    console.log('\n最终结果:');
    console.log(`  数据块数量: ${chunkCount}`);
    console.log(`  思考内容: "${fullReasoningContent}"`);
    console.log(`  最终内容: "${fullContent}"`);
    console.log('====================================\n');

    // 验证
    expect(chunkCount).toBe(3);
    expect(fullReasoningContent).toBe('思考1思考2');
    expect(fullContent).toBe('回复1');
  });
});

