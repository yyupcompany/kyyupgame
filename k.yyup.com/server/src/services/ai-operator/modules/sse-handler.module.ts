/**
 * SSE流处理器模块
 * 
 * 职责：
 * - 处理豆包API的流式响应
 * - 解析SSE数据块
 * - 累积思考内容和回复内容
 * - 处理工具调用数据
 * - 进度回调管理
 * 
 * 从unified-intelligence.service.ts中提取
 */

export interface StreamHandlerOptions {
  iterationCount: number;
  allowTools: boolean;
  allowWeb?: boolean;
  progressCallback: (status: string) => void;
}

/**
 * SSE流处理器模块
 */
export class SSEHandlerModule {
  /**
   * 处理流式响应
   */
  async handleStreamResponse(
    response: any,
    options: StreamHandlerOptions
  ): Promise<any> {
    const { progressCallback, iterationCount, allowTools, allowWeb } = options;

    // 🚨 验证日志
    console.log('🚨🚨🚨🚨🚨 [SSEHandler] handleStreamResponse 方法已执行！');
    console.log('🚨🚨🚨🚨🚨 [SSEHandler] 时间戳:', new Date().toISOString());

    return new Promise((resolve, reject) => {
      let fullContent = '';
      let fullReasoningContent = ''; // 累加思考内容
      let fullResponse = null;
      let buffer = '';
      let lastProgressUpdate = 0;
      let lastReasoningUpdate = 0; // 思考内容更新时间戳
      let progressUpdateInterval = 500; // 500ms更新一次进度
      let streamTimeout: NodeJS.Timeout;
      // 精简流日志：默认仅在开始/结束各打一条；设置 AI_STREAM_VERBOSE=1 可开启逐行调试
      const STREAM_VERBOSE = process.env.AI_STREAM_VERBOSE === '1';
      let sseChunkCount = 0;

      console.log('🚨🚨🚨 [SSEHandler] fullReasoningContent 变量已初始化:', fullReasoningContent);

      const estimateTokens = (text: string) => {
        if (!text) return 0;
        const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
        const nonCjk = text.length - cjk;
        // 约定：中文≈1 token/字，其他≈4 字符/1 token
        return cjk + Math.ceil(nonCjk / 4);
      };

      console.log(`📥 [SSEHandler] 开始接受流式回复 (第${iterationCount}轮)...`);
      progressCallback(`🔄 开始处理AI流式响应...`);

      // 检查响应对象是否有效
      if (!response) {
        console.error(`❌ [SSEHandler] 响应对象为空 (第${iterationCount}轮)`);
        reject(new Error('响应对象为空'));
        return;
      }

      // 设置流式响应超时（120秒）- 复杂任务需要更多思考时间
      // 🔧 优化：从60秒增加到120秒，避免AI深度思考时超时
      const STREAM_TIMEOUT = parseInt(process.env.AI_STREAM_TIMEOUT || '120000'); // 默认120秒
      streamTimeout = setTimeout(() => {
        console.warn(`⚠️ [SSEHandler] 流式响应超时 (第${iterationCount}轮，${STREAM_TIMEOUT/1000}秒)，强制结束`);
        progressCallback(`⚠️ AI响应超时（${STREAM_TIMEOUT/1000}秒），使用当前内容`);

        // 如果有思考内容但没有最终回复，使用思考内容作为回复
        let timeoutContent = fullContent || fullReasoningContent || '响应超时，请重试';

        const timeoutResponse = {
          choices: [{
            message: {
              role: 'assistant',
              content: timeoutContent,
              reasoning_content: fullReasoningContent || undefined,
              tool_calls: fullResponse?.tool_calls || null
            }
          }]
        };

        resolve(timeoutResponse);
      }, STREAM_TIMEOUT); // 可配置的超时时间

      // AIBridgeService 返回的是直接的 Readable 流对象，不是包含 data 属性的响应对象
      const stream = response.data || response;

      if (!stream || typeof stream.on !== 'function') {
        console.error(`❌ [SSEHandler] 流对象无效 (第${iterationCount}轮):`, typeof stream);
        reject(new Error('流对象无效'));
        return;
      }

      stream.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        if (STREAM_VERBOSE) console.log(`🔍 [SSEHandler-Raw] 收到原始chunk (长度=${chunkStr.length}):`, chunkStr.substring(0, 200));
        sseChunkCount++;

        buffer += chunkStr;

        // 处理多个SSE数据块
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一行（可能是不完整的）

        if (STREAM_VERBOSE) console.log(`🔍 [SSEHandler-Lines] 分割后行数: ${lines.length}`);

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (STREAM_VERBOSE) console.log(`🔍 [SSEHandler-Line] 处理行:`, line.substring(0, 100));

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (STREAM_VERBOSE) console.log(`🔍 [SSEHandler-Data] 提取data:`, data.substring(0, 100));

            if (data === '[DONE]') {
              if (STREAM_VERBOSE) console.log(`✅ [SSEHandler] 单轮响应完成 (第${iterationCount}轮)`);
              progressCallback(`✅ AI流式响应完成`);

              // 清理超时定时器
              if (streamTimeout) {
                clearTimeout(streamTimeout);
              }

              // 如果有思考内容但没有最终回复，使用思考内容作为回复
              let finalContent = fullContent;
              if (!finalContent && fullReasoningContent) {
                console.log(`🔧 [SSEHandler] 豆包模型只返回思考内容，使用思考内容作为最终回复`);
                finalContent = fullReasoningContent;
              }

              // 构建最终响应格式
              const finalResponse = {
                choices: [{
                  message: {
                    role: 'assistant',
                    content: finalContent,
                    reasoning_content: fullReasoningContent || undefined,
                    tool_calls: fullResponse?.tool_calls || null
                  }
                }]
              };

              resolve(finalResponse);
              return;
            }

            try {
              const jsonData = JSON.parse(data);

              // 调试：打印每个流式数据块
              if (STREAM_VERBOSE) console.log(`🔍 [SSEHandler-Debug] 收到数据块:`, JSON.stringify(jsonData).substring(0, 200));

              if (jsonData.choices && jsonData.choices[0]) {
                const choice = jsonData.choices[0];

                // 处理delta格式（流式增量）
                if (choice.delta) {
                  const delta = choice.delta;

                  // 验证日志：打印delta对象的所有字段
                  console.log(`🚨🚨🚨 [SSEHandler-DELTA-DEBUG] Delta对象字段:`, Object.keys(delta));
                  console.log(`🚨🚨🚨 [SSEHandler-DELTA-DEBUG] Delta完整内容:`, JSON.stringify(delta));

                  // 处理思考内容 (reasoning_content) - 豆包thinking模型
                  if (delta.reasoning_content) {
                    console.log(`🚨🚨🚨 [SSEHandler-REASONING-FOUND] 发现reasoning_content字段！`);
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
                    console.log(`🤔 [SSEHandler-Reasoning] ${reasoningPreview}`);
                  } else {
                    console.log(`🚨🚨🚨 [SSEHandler-REASONING-NOT-FOUND] 未发现reasoning_content字段`);
                  }

                  // 累加文本内容
                  if (delta.content) {
                    fullContent += delta.content;

                    // 限制进度更新频率，避免无限重复输出
                    const now = Date.now();
                    if (now - lastProgressUpdate > progressUpdateInterval) {
                      const preview = fullContent.length > 100 ?
                        fullContent.substring(0, 100) + '...' : fullContent;
                      progressCallback(`💬 AI正在回复: ${preview}`);
                      lastProgressUpdate = now;
                    }
                  }

                  // 处理工具调用（当允许工具或启用网页搜索时）
                  if ((allowTools || allowWeb) && delta.tool_calls) {
                    if (STREAM_VERBOSE) console.log(`🔧 [SSEHandler-Debug] 检测到delta.tool_calls:`, JSON.stringify(delta.tool_calls));
                    fullResponse = fullResponse || { tool_calls: [] };
                    fullResponse.tool_calls = fullResponse.tool_calls || [];

                    // 合并工具调用数据
                    delta.tool_calls.forEach((toolCall: any, index: number) => {
                      if (!fullResponse.tool_calls[index]) {
                        fullResponse.tool_calls[index] = {
                          id: toolCall.id,
                          type: toolCall.type,
                          function: { name: toolCall.function?.name || '', arguments: '' }
                        };

                        // 只在新工具调用时更新进度，避免重复输出
                        const now = Date.now();
                        if (now - lastProgressUpdate > progressUpdateInterval) {
                          progressCallback(`🔧 检测到工具调用: ${toolCall.function?.name || '未知工具'}`);
                          lastProgressUpdate = now;
                        }
                      }

                      if (toolCall.function?.arguments) {
                        fullResponse.tool_calls[index].function.arguments += toolCall.function.arguments;
                      }
                    });
                  }
                }

                // 处理message格式（完整消息）
                if (choice.message) {
                  const message = choice.message;
                  if (STREAM_VERBOSE) console.log(`🔧 [SSEHandler-Debug] 检测到message:`, JSON.stringify(message).substring(0, 200));

                  if (message.content) {
                    fullContent = message.content;
                  }

                  if ((allowTools || allowWeb) && message.tool_calls) {
                    if (STREAM_VERBOSE) console.log(`🔧 [SSEHandler-Debug] 检测到message.tool_calls:`, JSON.stringify(message.tool_calls));
                    fullResponse = fullResponse || { tool_calls: [] };
                    fullResponse.tool_calls = message.tool_calls;

                    progressCallback(`🔧 检测到工具调用: ${message.tool_calls[0]?.function?.name || '未知工具'}`);
                  }
                }
              }
            } catch (parseError) {
              console.warn('[SSEHandler] 解析流式数据失败:', parseError);
            }
          }
        }
      });

      stream.on('end', () => {
        const approxTokens = estimateTokens(fullContent || '');
        console.log(`✅ [SSEHandler] 接受完毕：输出≈${approxTokens} tokens，数据块=${sseChunkCount}，长度=${fullContent.length} (第${iterationCount}轮)`);

        // 清理超时定时器
        if (streamTimeout) {
          clearTimeout(streamTimeout);
        }

        // 如果没有通过[DONE]结束，手动结束
        const finalResponse = {
          choices: [{
            message: {
              role: 'assistant',
              content: fullContent,
              tool_calls: fullResponse?.tool_calls || null
            }
          }]
        };

        resolve(finalResponse);
      });

      stream.on('error', (error: any) => {
        console.error(`❌ [SSEHandler] 流式响应错误 (第${iterationCount}轮):`, error);
        progressCallback(`❌ AI流式响应错误`);

        // 清理超时定时器
        if (streamTimeout) {
          clearTimeout(streamTimeout);
        }

        reject(error);
      });
    });
  }
}

// 导出单例
export const sseHandlerModule = new SSEHandlerModule();

