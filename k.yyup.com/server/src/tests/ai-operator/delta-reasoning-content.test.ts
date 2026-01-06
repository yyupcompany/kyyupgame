/**
 * 单元测试：验证豆包thinking模型的reasoning_content字段提取
 * 
 * 目的：测试流式响应中delta对象的reasoning_content字段是否被正确提取和累加
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Delta Reasoning Content 提取测试', () => {
  let fullReasoningContent: string;
  let fullContent: string;
  let lastReasoningUpdate: number;
  let progressUpdateInterval: number;
  let progressCallback: (status: string) => void;
  let progressMessages: string[];

  beforeEach(() => {
    // 初始化变量，模拟handleStreamResponse方法中的状态
    fullReasoningContent = '';
    fullContent = '';
    lastReasoningUpdate = 0;
    progressUpdateInterval = 500;
    progressMessages = [];
    
    // 模拟progressCallback
    progressCallback = vi.fn((status: string) => {
      progressMessages.push(status);
      console.log(`📢 [Progress] ${status}`);
    });
  });

  it('应该正确提取和累加reasoning_content字段', () => {
    // 模拟豆包thinking模型返回的流式数据块
    const mockDeltaChunks = [
      // 第1-5个数据块：只有reasoning_content，没有content
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '我现在需要处理用户关于招生策略的问题。',
            content: ''
          }
        }]
      },
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '首先，我需要了解用户的具体情况。',
            content: ''
          }
        }]
      },
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '招生策略需要考虑多个因素。',
            content: ''
          }
        }]
      },
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '我应该询问用户的具体需求。',
            content: ''
          }
        }]
      },
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '这样才能提供针对性的建议。',
            content: ''
          }
        }]
      },
      // 第6-8个数据块：开始有content
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '',
            content: '您好！'
          }
        }]
      },
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '',
            content: '关于招生策略，'
          }
        }]
      },
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '',
            content: '我需要了解一些信息：'
          }
        }]
      }
    ];

    // 模拟delta处理逻辑
    mockDeltaChunks.forEach((chunk, index) => {
      const choice = chunk.choices[0];
      
      if (choice.delta) {
        const delta = choice.delta;
        
        // 🚨🚨🚨 验证日志：打印delta对象的所有字段
        console.log(`🚨🚨🚨 [DELTA-DEBUG] 数据块 ${index + 1}/${mockDeltaChunks.length}`);
        console.log(`🚨🚨🚨 [DELTA-DEBUG] Delta对象字段:`, Object.keys(delta));
        console.log(`🚨🚨🚨 [DELTA-DEBUG] Delta完整内容:`, JSON.stringify(delta));

        // 🔧 处理思考内容 (reasoning_content) - 豆包thinking模型
        if (delta.reasoning_content) {
          console.log(`🚨🚨🚨 [REASONING-FOUND] 发现reasoning_content字段！`);
          // 累加思考内容
          fullReasoningContent += delta.reasoning_content;

          // 限制思考内容更新频率，避免无限重复输出
          const now = Date.now();
          if (now - lastReasoningUpdate > progressUpdateInterval) {
            const reasoningPreview = fullReasoningContent.length > 100 ?
              fullReasoningContent.substring(fullReasoningContent.length - 100) + '...' : fullReasoningContent;
            progressCallback(`🤔 AI正在思考: ${reasoningPreview}`);
            lastReasoningUpdate = now;
          }

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
    });

    // 验证结果
    console.log('\n========== 测试结果 ==========');
    console.log(`✅ 累加的思考内容长度: ${fullReasoningContent.length}`);
    console.log(`✅ 累加的最终内容长度: ${fullContent.length}`);
    console.log(`✅ 思考内容: ${fullReasoningContent}`);
    console.log(`✅ 最终内容: ${fullContent}`);
    console.log(`✅ Progress消息数量: ${progressMessages.length}`);
    console.log('================================\n');

    // 断言
    expect(fullReasoningContent).toBe(
      '我现在需要处理用户关于招生策略的问题。' +
      '首先，我需要了解用户的具体情况。' +
      '招生策略需要考虑多个因素。' +
      '我应该询问用户的具体需求。' +
      '这样才能提供针对性的建议。'
    );
    
    expect(fullContent).toBe('您好！关于招生策略，我需要了解一些信息：');
    
    expect(fullReasoningContent.length).toBeGreaterThan(0);
    expect(fullContent.length).toBeGreaterThan(0);
  });

  it('应该在content为空时使用reasoning_content作为最终回复', () => {
    // 模拟只有reasoning_content，没有content的情况
    const mockDeltaChunks = [
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '这是思考内容第一部分。',
            content: ''
          }
        }]
      },
      {
        choices: [{
          delta: {
            role: 'assistant',
            reasoning_content: '这是思考内容第二部分。',
            content: ''
          }
        }]
      }
    ];

    // 处理delta
    mockDeltaChunks.forEach((chunk) => {
      const choice = chunk.choices[0];
      if (choice.delta) {
        const delta = choice.delta;
        if (delta.reasoning_content) {
          fullReasoningContent += delta.reasoning_content;
        }
        if (delta.content) {
          fullContent += delta.content;
        }
      }
    });

    // 模拟最终响应逻辑
    let finalContent = fullContent;
    if (!finalContent && fullReasoningContent) {
      console.log(`🔧 [Fix] 豆包模型只返回思考内容，使用思考内容作为最终回复`);
      finalContent = fullReasoningContent;
    }

    console.log('\n========== 测试结果 ==========');
    console.log(`✅ 原始content: "${fullContent}"`);
    console.log(`✅ reasoning_content: "${fullReasoningContent}"`);
    console.log(`✅ 最终content: "${finalContent}"`);
    console.log('================================\n');

    // 断言
    expect(fullContent).toBe('');
    expect(fullReasoningContent).toBe('这是思考内容第一部分。这是思考内容第二部分。');
    expect(finalContent).toBe('这是思考内容第一部分。这是思考内容第二部分。');
  });

  it('应该正确识别delta对象中的字段', () => {
    // 测试delta对象字段识别
    const testDeltas = [
      {
        role: 'assistant',
        reasoning_content: '思考内容',
        content: ''
      },
      {
        role: 'assistant',
        reasoning_content: '',
        content: '回复内容'
      },
      {
        role: 'assistant',
        content: '只有回复'
      },
      {
        role: 'assistant',
        reasoning_content: '只有思考'
      }
    ];

    testDeltas.forEach((delta, index) => {
      console.log(`\n测试Delta ${index + 1}:`);
      console.log(`字段列表:`, Object.keys(delta));
      console.log(`有reasoning_content:`, 'reasoning_content' in delta);
      console.log(`有content:`, 'content' in delta);
      console.log(`reasoning_content值:`, delta.reasoning_content || '(无)');
      console.log(`content值:`, delta.content || '(无)');

      // 验证字段存在性
      if (index === 0 || index === 1) {
        expect(delta).toHaveProperty('reasoning_content');
        expect(delta).toHaveProperty('content');
      } else if (index === 2) {
        expect(delta).toHaveProperty('content');
        expect(delta).not.toHaveProperty('reasoning_content');
      } else if (index === 3) {
        expect(delta).toHaveProperty('reasoning_content');
        expect(delta).not.toHaveProperty('content');
      }
    });
  });
});

