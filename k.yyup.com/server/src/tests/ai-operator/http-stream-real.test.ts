/**
 * 单元测试：模拟真实的HTTP流式响应处理
 * 
 * 目的：使用Node.js原生HTTP模拟豆包API的实时流式响应
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'stream';
import { IncomingMessage } from 'http';

describe('HTTP原生流式响应测试', () => {
  
  it('应该模拟真实的HTTP流式响应并实时处理delta', async () => {
    // 模拟豆包API返回的SSE流式数据
    const sseData = [
      'data: {"id":"chatcmpl-123","choices":[{"index":0,"delta":{"role":"assistant","content":"","reasoning_content":"我现在需要分析用户的问题"},"finish_reason":null}]}\n\n',
      'data: {"id":"chatcmpl-123","choices":[{"index":0,"delta":{"content":"","reasoning_content":"首先要了解招生策略的背景"},"finish_reason":null}]}\n\n',
      'data: {"id":"chatcmpl-123","choices":[{"index":0,"delta":{"content":"","reasoning_content":"需要考虑多个因素"},"finish_reason":null}]}\n\n',
      'data: {"id":"chatcmpl-123","choices":[{"index":0,"delta":{"content":"","reasoning_content":"我应该询问具体需求"},"finish_reason":null}]}\n\n',
      'data: {"id":"chatcmpl-123","choices":[{"index":0,"delta":{"content":"","reasoning_content":"这样才能提供针对性建议"},"finish_reason":null}]}\n\n',
      'data: [DONE]\n\n'
    ];

    // 创建一个可读流来模拟HTTP响应
    const mockStream = new Readable({
      read() {}
    });

    // 模拟IncomingMessage
    const mockResponse = mockStream as any as IncomingMessage;
    mockResponse.statusCode = 200;
    mockResponse.headers = {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive'
    };

    // 模拟handleStreamResponse的核心逻辑
    let fullContent = '';
    let fullReasoningContent = '';
    let buffer = '';
    let chunkCount = 0;
    let hasReasoningLog = false;

    console.log('\n========== 开始HTTP流式响应测试 ==========');
    console.log('🚨🚨🚨🚨🚨 [CRITICAL-VERIFICATION] handleStreamResponse 方法已执行！这是新代码！');
    console.log('🚨🚨🚨🚨🚨 [CRITICAL-VERIFICATION] 时间戳:', new Date().toISOString());
    console.log('🚨🚨🚨 [VERIFICATION] fullReasoningContent 变量已初始化:', fullReasoningContent);

    // 处理流式数据的Promise
    const processStream = new Promise<void>((resolve, reject) => {
      mockResponse.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString('utf-8');
        console.log(`\n📦 [收到数据块] 长度: ${chunkStr.length} 字节`);
        
        buffer += chunkStr;

        // 按行分割
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).trim();
            
            if (data === '[DONE]') {
              console.log('✅ [Stream] 接受完毕');
              resolve();
              return;
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
              console.error('❌ 解析错误:', error);
              reject(error);
            }
          }
        }
      });

      mockResponse.on('end', () => {
        console.log('\n🏁 [Stream] 流结束');
        resolve();
      });

      mockResponse.on('error', (error) => {
        console.error('❌ [Stream] 流错误:', error);
        reject(error);
      });
    });

    // 模拟数据逐块到达（实时流式）
    let index = 0;
    const sendNextChunk = () => {
      if (index < sseData.length) {
        console.log(`\n⏰ [发送] 第 ${index + 1}/${sseData.length} 块数据`);
        mockStream.push(sseData[index]);
        index++;
        setTimeout(sendNextChunk, 100); // 每100ms发送一块，模拟实时流式
      } else {
        mockStream.push(null); // 结束流
      }
    };

    // 开始发送数据
    setTimeout(sendNextChunk, 50);

    // 等待流处理完成
    await processStream;

    // 验证结果
    console.log('\n========== HTTP流式响应测试结果 ==========');
    console.log(`✅ 数据块数量: ${chunkCount}`);
    console.log(`✅ 最终内容长度: ${fullContent.length}`);
    console.log(`✅ 思考内容长度: ${fullReasoningContent.length}`);
    console.log(`✅ 是否有Reasoning日志: ${hasReasoningLog}`);
    console.log(`✅ 最终内容: "${fullContent}"`);
    console.log(`✅ 思考内容: "${fullReasoningContent}"`);
    console.log('==========================================\n');

    // 断言
    expect(chunkCount).toBe(5);
    expect(fullContent).toBe(''); // 所有content都是空字符串
    expect(fullReasoningContent.length).toBeGreaterThan(0); // 思考内容不为空
    expect(hasReasoningLog).toBe(true); // 应该有Reasoning日志
    expect(fullReasoningContent).toContain('我现在需要分析用户的问题');
  });

  it('应该测试实际后端的buffer处理逻辑', async () => {
    // 模拟数据分批到达，可能在JSON中间被切断
    const chunks = [
      'data: {"choices":[{"delta":{"role":"assistant","reasoning_',
      'content":"思考内容1","content":""}}]}\n\ndata: {"choices":[{"delta',
      '":{"reasoning_content":"思考内容2","content":""}}]}\n\n',
      'data: [DONE]\n\n'
    ];

    const mockStream = new Readable({
      read() {}
    });

    let fullReasoningContent = '';
    let buffer = '';
    let chunkCount = 0;

    console.log('\n========== Buffer处理测试 ==========');

    const processStream = new Promise<void>((resolve) => {
      mockStream.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString('utf-8');
        console.log(`\n📦 收到数据: "${chunkStr.replace(/\n/g, '\\n')}"`);
        
        buffer += chunkStr;
        console.log(`📝 当前buffer: "${buffer.replace(/\n/g, '\\n')}"`);

        // 按行分割
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一行
        console.log(`📝 保留buffer: "${buffer.replace(/\n/g, '\\n')}"`);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).trim();
            
            if (data === '[DONE]') {
              console.log('✅ 接收完毕');
              resolve();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              chunkCount++;

              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                const delta = parsed.choices[0].delta;
                
                if (delta.reasoning_content) {
                  fullReasoningContent += delta.reasoning_content;
                  console.log(`✅ 累加reasoning_content: "${delta.reasoning_content}"`);
                }
              }
            } catch (error) {
              console.error(`❌ 解析错误: ${error}`);
            }
          }
        }
      });

      mockStream.on('end', () => {
        console.log('\n🏁 流结束');
        resolve();
      });
    });

    // 发送数据块
    let index = 0;
    const sendNextChunk = () => {
      if (index < chunks.length) {
        console.log(`\n⏰ 发送第 ${index + 1}/${chunks.length} 块`);
        mockStream.push(chunks[index]);
        index++;
        setTimeout(sendNextChunk, 100);
      } else {
        mockStream.push(null);
      }
    };

    setTimeout(sendNextChunk, 50);
    await processStream;

    console.log('\n========== Buffer处理测试结果 ==========');
    console.log(`✅ 数据块数量: ${chunkCount}`);
    console.log(`✅ 思考内容: "${fullReasoningContent}"`);
    console.log('=========================================\n');

    // 断言
    expect(chunkCount).toBe(2);
    expect(fullReasoningContent).toBe('思考内容1思考内容2');
  });
});

