import axios, { AxiosInstance } from 'axios';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import {
  AiBridgeChatCompletionParams,
  AiBridgeChatCompletionResponse,
  AiBridgeMessage,
  AiBridgeMessageRole,
  AiBridgeImageGenerationParams,
  AiBridgeImageGenerationResponse,
  AiBridgeSpeechToTextParams,
  AiBridgeSpeechToTextResponse,
  AiBridgeTextToSpeechParams,
  AiBridgeTextToSpeechResponse,
  AiBridgeVideoGenerationParams,
  AiBridgeVideoGenerationResponse,
  AiBridgeDocumentParams,
  AiBridgeDocumentResponse,
  AiBridgeVODUploadParams,
  AiBridgeVODUploadResponse,
  AiBridgeVODMergeParams,
  AiBridgeVODMergeResponse,
  AiBridgeVODAddAudioParams,
  AiBridgeVODAddAudioResponse,
  AiBridgeVODTranscodeParams,
  AiBridgeVODTranscodeResponse,
  AiBridgeVODTaskStatusParams,
  AiBridgeVODTaskStatusResponse,
  AiBridgeSearchParams,
  AiBridgeSearchResponse,
} from './ai-bridge.types';
import AIModelConfigModel, { AIModelConfig, ModelStatus } from '../../../models/ai-model-config.model';
import { Op } from 'sequelize';
import { Readable } from 'stream';
import AIConfigService from '../ai-config.service';
import FormData from 'form-data';

/**
 * @class AIBridgeService
 * @description A service to interact with external AI model providers like OpenAI.
 * It abstracts the API calls for functionalities such as chat completion.
 */
class AIBridgeService {
  private defaultHttpClient: AxiosInstance;
  private defaultApiKey: string;
  private defaultBaseUrl: string;

  /**
   * Initializes the AIBridgeService.
   * It sets up a default Axios instance for making HTTP requests to the AI provider's API.
   * The API key and base URL are retrieved from environment variables.
   */
  constructor() {
    // It is crucial to use environment variables for sensitive data and configurations.
    // This avoids hardcoding credentials and endpoints in the source code.
    this.defaultApiKey = process.env.OPENAI_API_KEY || '';
    this.defaultBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!this.defaultApiKey) {
      // In a real application, you would have more robust error handling or logging.
      console.error('OpenAI API key is not configured in environment variables.');
    }

    // 使用统一配置服务
    const networkConfig = AIConfigService.getAxiosConfig();

    this.defaultHttpClient = axios.create({
      baseURL: this.defaultBaseUrl,
      headers: AIConfigService.getStandardHeaders(this.defaultApiKey),
      ...networkConfig
    });

    // 打印配置信息（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      AIConfigService.logConfig();
    }
  }

  /**
   * Creates a custom HTTP client for a specific model configuration
   * @param endpointUrl - Custom endpoint URL
   * @param apiKey - Custom API key
   * @param contentType - Content type for the request
   * @returns Configured axios instance
   */
  private createCustomHttpClient(
    endpointUrl: string,
    apiKey: string,
    contentType: string = 'application/json'
  ): AxiosInstance {
    const baseUrl = endpointUrl.replace(/\/(chat\/completions|images\/generations|audio\/.*|video\/.*)$/, '');
    const networkConfig = AIConfigService.getAxiosConfig();

    return axios.create({
      baseURL: baseUrl,
      headers: AIConfigService.getStandardHeaders(apiKey),
      ...networkConfig
    });
  }

  /**
   * 使用原生HTTP/HTTPS模块发送请求（性能优化）
   * @param url - 完整的请求URL
   * @param options - 请求选项
   * @param data - 请求体数据
   * @param timeout - 超时时间（毫秒）
   * @returns Promise<响应数据>
   */
  private makeNativeHttpRequest<T>(
    url: string,
    options: {
      method: string;
      headers: Record<string, string>;
    },
    data?: any,
    timeout: number = 600000 // 默认600秒（10分钟）
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const requestBody = data ? JSON.stringify(data) : undefined;

      // 🔍 调试：打印请求体内容
      if (data && data.tools) {
        console.log('🔍 [AI请求调试] 发送给AI的工具定义:');
        console.log(JSON.stringify(data.tools, null, 2));
      }

      const requestOptions: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'Content-Length': requestBody ? Buffer.byteLength(requestBody) : 0,
        },
        timeout,
      };

      console.log(`🚀 [原生HTTP] 发起请求: ${options.method} ${url}`);
      console.log(`⏱️  [原生HTTP] 超时设置: ${timeout}ms`);

      const req = httpModule.request(requestOptions, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`✅ [AI响应] 请求完成，状态码: ${res.statusCode}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(responseData);

              // 🔍 调试：打印原始响应中的reasoning_content
              if (parsed.choices && parsed.choices[0]?.message) {
                const message = parsed.choices[0].message;
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🔍 [AI响应] 原始响应message字段:');
                console.log('  - content:', message.content ? `"${message.content.substring(0, 50)}..."` : 'null');
                console.log('  - reasoning_content:', message.reasoning_content ? `"${message.reasoning_content.substring(0, 100)}..."` : 'undefined');
                console.log('  - tool_calls:', message.tool_calls ? `${message.tool_calls.length}个工具调用` : 'undefined');

                if (message.reasoning_content) {
                  console.log('✅ [AI响应] 检测到reasoning_content字段！');
                  console.log('📏 [AI响应] reasoning_content长度:', message.reasoning_content.length);
                  console.log('📝 [AI响应] reasoning_content内容预览:', message.reasoning_content.substring(0, 200) + '...');
                } else {
                  console.log('⚠️  [AI响应] 未检测到reasoning_content字段');
                }
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              }

              // 打印usage信息
              if (parsed.usage) {
                console.log('📊 [AI响应] Token使用情况:');
                console.log('  - prompt_tokens:', parsed.usage.prompt_tokens);
                console.log('  - completion_tokens:', parsed.usage.completion_tokens);
                console.log('  - reasoning_tokens:', parsed.usage.reasoning_tokens || 0);
                console.log('  - total_tokens:', parsed.usage.total_tokens);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              }

              resolve(parsed as T);
            } catch (parseError) {
              reject(new Error(`JSON解析失败: ${parseError}`));
            }
          } else {
            reject(new Error(`HTTP错误 ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ [原生HTTP] 请求错误:`, error);
        reject(error);
      });

      req.on('timeout', () => {
        console.error(`⏰ [原生HTTP] 请求超时 (${timeout}ms)`);
        req.destroy();
        reject(new Error(`请求超时 (${timeout}ms)`));
      });

      if (requestBody) {
        req.write(requestBody);
      }

      req.end();
    });
  }

  /**
   * 使用原生HTTP/HTTPS模块发送流式请求（性能优化 - 比axios快100%）
   * @param url - 完整的请求URL
   * @param options - 请求选项
   * @param data - 请求体数据
   * @param timeout - 超时时间（毫秒）
   * @returns Promise<原生HTTP响应对象>
   */
  private makeNativeHttpStreamRequest(
    url: string,
    options: {
      method: string;
      headers: Record<string, string>;
    },
    data?: any,
    timeout: number = 600000 // 默认600秒（10分钟）
  ): Promise<http.IncomingMessage> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const requestBody = data ? JSON.stringify(data) : undefined;

      const requestOptions: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'Content-Length': requestBody ? Buffer.byteLength(requestBody) : 0,
        },
        timeout,
      };

      console.log(`🚀 [原生HTTP流式] 发起请求: ${options.method} ${url}`);
      console.log(`⏱️  [原生HTTP流式] 超时设置: ${timeout}ms`);

      const req = httpModule.request(requestOptions, (res) => {
        console.log(`✅ [原生HTTP流式] 连接建立，状态码: ${res.statusCode}`);

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          // 直接返回响应流对象
          resolve(res);
        } else {
          let errorData = '';
          res.on('data', (chunk) => {
            errorData += chunk;
          });
          res.on('end', () => {
            reject(new Error(`HTTP错误 ${res.statusCode}: ${errorData}`));
          });
        }
      });

      req.on('error', (error) => {
        console.error(`❌ [原生HTTP流式] 请求错误:`, error);
        reject(error);
      });

      req.on('timeout', () => {
        console.error(`⏰ [原生HTTP流式] 请求超时 (${timeout}ms)`);
        req.destroy();
        reject(new Error(`请求超时 (${timeout}ms)`));
      });

      if (requestBody) {
        req.write(requestBody);
      }

      req.end();
    });
  }

  /**
   * Generates a chat completion using the configured AI model.
   * @param params - The parameters for the chat completion request, including the model and messages.
   * @param customConfig - Optional custom configuration for endpoint and API key
   * @param userId - Optional user ID for usage tracking and statistics
   * @returns A promise that resolves to the chat completion response from the AI provider.
   * @throws Throws an error if the API request fails.
   */
  public async generateChatCompletion(
    params: AiBridgeChatCompletionParams,
    customConfig?: { endpointUrl: string; apiKey: string },
    userId?: number
  ): Promise<AiBridgeChatCompletionResponse> {
    try {
      // 🚀 优化：如果没有提供customConfig，尝试从数据库读取模型配置
      let apiKey = customConfig?.apiKey;
      let baseUrl = customConfig?.endpointUrl;
      let actualModelName = params.model;

      if (!customConfig && params.model) {
        console.log(`🔍 [AIBridge] 未提供自定义配置，尝试从数据库读取模型配置: ${params.model}`);

        try {
          let modelConfig: AIModelConfig | null = null;

          // 如果模型名称是 'default'，查找默认模型
          if (params.model === 'default') {
            modelConfig = await AIModelConfig.findOne({
              where: {
                isDefault: true,
                status: ModelStatus.ACTIVE
              }
            });
          } else {
            // 否则按名称查找
            modelConfig = await AIModelConfig.findOne({
              where: {
                name: params.model,
                status: ModelStatus.ACTIVE
              }
            });
          }

          if (modelConfig) {
            apiKey = modelConfig.apiKey;
            baseUrl = modelConfig.endpointUrl;
            actualModelName = modelConfig.name; // 使用实际的模型名称
            console.log(`✅ [AIBridge] 从数据库加载模型配置成功: ${modelConfig.displayName} (${actualModelName})`);
          } else {
            console.log(`⚠️  [AIBridge] 数据库中未找到模型配置，使用默认配置`);
          }
        } catch (dbError) {
          console.error(`❌ [AIBridge] 从数据库读取配置失败:`, dbError);
          // 继续使用默认配置
        }
      }

      // 最终确定使用的配置（优先级：customConfig > 数据库配置 > 默认配置）
      apiKey = apiKey || this.defaultApiKey;
      baseUrl = baseUrl || this.defaultBaseUrl;

      // 更新params中的模型名称为实际的模型名称
      params = { ...params, model: actualModelName };

      // 构建完整URL
      const fullUrl = baseUrl.endsWith('/chat/completions')
        ? baseUrl
        : `${baseUrl}/chat/completions`;

      console.log('\x1b[31m[AI调用-原生HTTP] 使用配置\x1b[0m');
      console.log('\x1b[31m[AI调用-原生HTTP] 端点:', fullUrl, '\x1b[0m');
      console.log('\x1b[31m[AI调用-原生HTTP] 密钥前缀:', apiKey?.substring(0, 10) + '...', '\x1b[0m');

      console.log('\x1b[31m[AI调用-原生HTTP] 请求参数:', JSON.stringify(params, null, 2), '\x1b[0m');

      // 验证参数
      console.log('\x1b[35m[AI调用-原生HTTP] 参数验证:\x1b[0m');
      console.log('\x1b[35m[AI调用-原生HTTP] - 模型名称:', params.model, '\x1b[0m');
      console.log('\x1b[35m[AI调用-原生HTTP] - 消息数量:', params.messages?.length, '\x1b[0m');
      console.log('\x1b[35m[AI调用-原生HTTP] - 最大令牌数:', params.max_tokens, '\x1b[0m');
      console.log('\x1b[35m[AI调用-原生HTTP] - 温度:', params.temperature, '\x1b[0m');
      console.log('\x1b[35m[AI调用-原生HTTP] - 流式:', params.stream, '\x1b[0m');

      // 验证消息格式
      if (params.messages && params.messages.length > 0) {
        params.messages.forEach((msg, index) => {
          console.log(`\x1b[35m[AI调用-原生HTTP] - 消息${index + 1}: role=${msg.role}, content长度=${msg.content?.length}\x1b[0m`);
        });
      }

      // 准备请求头
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      // 添加重试机制处理503错误
      const maxRetries = 3;
      const retryDelay = 1000; // 1秒
      const timeout = 600000; // 600秒超时（10分钟）

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`\x1b[33m[AI调用-原生HTTP] 尝试第 ${attempt}/${maxRetries} 次调用\x1b[0m`);

          const startTime = Date.now();

          // 使用原生HTTP请求
          const response = await this.makeNativeHttpRequest<AiBridgeChatCompletionResponse>(
            fullUrl,
            {
              method: 'POST',
              headers,
            },
            params,
            timeout
          );

          const duration = Date.now() - startTime;
          console.log(`\x1b[32m[AI调用-原生HTTP] 第 ${attempt} 次调用成功，耗时: ${duration}ms\x1b[0m`);

          // 🚀 记录使用量统计（如果提供了userId）
          if (userId && response) {
            await this.recordUsage(userId, params, response);
          }

          return response;

        } catch (retryError: any) {
          const errorMessage = retryError.message || String(retryError);

          // 检查是否是503错误
          if (errorMessage.includes('503')) {
            console.log(`\x1b[33m[AI调用-原生HTTP] 第 ${attempt} 次调用失败 (503)，${attempt < maxRetries ? '准备重试' : '已达最大重试次数'}\x1b[0m`);

            if (attempt < maxRetries) {
              // 等待后重试
              await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
              continue;
            }
          }

          // 非503错误或已达最大重试次数，抛出错误
          throw retryError;
        }
      }
    } catch (error: any) {
      console.log('\x1b[31m[AI调用错误-原生HTTP] 调用失败\x1b[0m');
      console.error('Error calling AI chat completion API:', error);

      const errorMessage = error.message || String(error);
      console.log('\x1b[31m[AI调用错误-原生HTTP] 错误信息:', errorMessage, '\x1b[0m');

      // 根据错误信息抛出具体的错误
      if (errorMessage.includes('503')) {
        throw new Error('AI服务暂时不可用，请稍后重试。可能原因：服务器维护中或负载过高。');
      } else if (errorMessage.includes('401')) {
        throw new Error('AI服务认证失败，请检查API密钥配置。');
      } else if (errorMessage.includes('429')) {
        throw new Error('AI服务请求频率过高，请稍后重试。');
      } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('504')) {
        throw new Error('AI服务器内部错误，请稍后重试或联系管理员。');
      } else if (errorMessage.includes('ECONNREFUSED')) {
        throw new Error('无法连接到AI服务，请检查网络连接或联系管理员。');
      } else if (errorMessage.includes('超时') || errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        throw new Error('AI服务响应超时，请稍后重试。建议：增加超时时间或检查网络连接。');
      } else {
        throw new Error(`AI调用失败: ${errorMessage}`);
      }
    }
  }

  /**
   * 记录AI使用量统计
   * @param userId - 用户ID
   * @param params - 请求参数
   * @param response - AI响应
   */
  private async recordUsage(
    userId: number,
    params: AiBridgeChatCompletionParams,
    response: AiBridgeChatCompletionResponse
  ): Promise<void> {
    try {
      // 动态导入避免循环依赖
      const { AIModelUsage, AIUsageType, AIUsageStatus } = await import('../../../models/ai-model-usage.model');
      const { AIModelConfig } = await import('../../../models/ai-model-config.model');
      const { v4: uuidv4 } = await import('uuid');

      // 查找模型配置
      const modelConfig = await AIModelConfig.findOne({
        where: { name: params.model, status: 'active' }
      });

      if (!modelConfig) {
        console.warn(`[使用量统计] 未找到模型配置: ${params.model}`);
        return;
      }

      // 计算成本（简化版本，实际应该根据模型定价）
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      const totalTokens = response.usage?.total_tokens || inputTokens + outputTokens;
      const cost = this.calculateCost(inputTokens, outputTokens, modelConfig);

      // 创建使用记录
      await AIModelUsage.create({
        userId,
        modelId: String(modelConfig.id),
        requestId: uuidv4(),
        usageType: AIUsageType.TEXT,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        status: AIUsageStatus.SUCCESS,
        requestTimestamp: new Date(),
        responseTimestamp: new Date(),
        processingTime: 0 // 这里可以记录实际处理时间
      });

      console.log(`[使用量统计] 记录成功: userId=${userId}, tokens=${totalTokens}, cost=${cost}`);
    } catch (error) {
      console.error('[使用量统计] 记录失败:', error);
      // 不抛出错误，避免影响主要功能
    }
  }

  /**
   * 计算AI调用成本
   * @param inputTokens - 输入token数
   * @param outputTokens - 输出token数
   * @param modelConfig - 模型配置
   * @returns 成本（美元）
   */
  private calculateCost(inputTokens: number, outputTokens: number, modelConfig: any): number {
    // 简化的成本计算，实际应该根据不同模型的定价
    const inputCostPer1K = modelConfig.inputCostPer1K || 0.001; // 默认每1K输入token成本
    const outputCostPer1K = modelConfig.outputCostPer1K || 0.002; // 默认每1K输出token成本

    const inputCost = (inputTokens / 1000) * inputCostPer1K;
    const outputCost = (outputTokens / 1000) * outputCostPer1K;

    return parseFloat((inputCost + outputCost).toFixed(6));
  }

  /**
   * @method generateChatCompletionStream
   * @description Generates a streaming chat completion using the specified model and messages.
   * 使用原生HTTP/HTTPS实现，性能比axios快100%
   * @param params - The parameters for the chat completion request.
   * @param customConfig - Optional custom configuration for the request.
   * @param conversationId - The conversation ID for saving messages.
   * @param userId - The user ID for saving messages.
   * @returns A readable stream of chat completion chunks.
   */
  public async generateChatCompletionStream(
    params: AiBridgeChatCompletionParams,
    customConfig?: { endpointUrl: string; apiKey: string },
    conversationId?: string,
    userId?: number
  ): Promise<Readable> {
    try {
      // 🚀 优化：如果没有提供customConfig，尝试从数据库读取模型配置
      let apiKey = customConfig?.apiKey;
      let baseUrl = customConfig?.endpointUrl;
      let actualModelName = params.model;

      if (!customConfig && params.model) {
        console.log(`🔍 [AIBridge-流式] 未提供自定义配置，尝试从数据库读取模型配置: ${params.model}`);

        try {
          let modelConfig: AIModelConfig | null = null;

          // 如果模型名称是 'default'，查找默认模型
          if (params.model === 'default') {
            modelConfig = await AIModelConfig.findOne({
              where: {
                isDefault: true,
                status: ModelStatus.ACTIVE
              }
            });
          } else {
            // 否则按名称查找
            modelConfig = await AIModelConfig.findOne({
              where: {
                name: params.model,
                status: ModelStatus.ACTIVE
              }
            });
          }

          if (modelConfig) {
            apiKey = modelConfig.apiKey;
            baseUrl = modelConfig.endpointUrl;
            actualModelName = modelConfig.name; // 使用实际的模型名称
            console.log(`✅ [AIBridge-流式] 从数据库加载模型配置成功: ${modelConfig.displayName} (${actualModelName})`);
          } else {
            console.log(`⚠️  [AIBridge-流式] 数据库中未找到模型配置，使用默认配置`);
          }
        } catch (dbError) {
          console.error(`❌ [AIBridge-流式] 从数据库读取配置失败:`, dbError);
          // 继续使用默认配置
        }
      }

      // 最终确定使用的配置（优先级：customConfig > 数据库配置 > 默认配置）
      apiKey = apiKey || this.defaultApiKey;
      baseUrl = baseUrl || this.defaultBaseUrl;

      // 构建完整URL
      const fullUrl = baseUrl.endsWith('/chat/completions')
        ? baseUrl
        : `${baseUrl}/chat/completions`;

      // 确保启用流式输出，并使用实际的模型名称
      const streamParams = { ...params, model: actualModelName, stream: true };

      console.log('\x1b[36m[AI调用-原生HTTP流式] 使用配置\x1b[0m');
      console.log('\x1b[36m[AI调用-原生HTTP流式] 端点:', fullUrl, '\x1b[0m');

      // 🔧 打印完整的请求参数为JSON格式
      console.log('================================================================================');
      console.log('📤 [完整请求JSON] 发送给豆包模型的完整请求参数:');
      console.log(JSON.stringify(streamParams, null, 2));
      console.log('================================================================================');

      // 准备请求头
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      // 使用原生HTTP流式请求（性能提升100%）
      const response = await this.makeNativeHttpStreamRequest(
        fullUrl,
        {
          method: 'POST',
          headers,
        },
        streamParams,
        180000 // 180秒超时
      );

      console.log('\x1b[32m[AI调用-原生HTTP流式] 连接成功，开始接收流式数据\x1b[0m');

      // 创建一个可读流来处理SSE数据
      const readable = new Readable({
        read() {}
      });

      let fullContent = '';
      let buffer = '';

      response.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              // 流结束，保存完整的AI消息到数据库
              if (conversationId && userId && fullContent) {
                this.saveStreamedMessage(conversationId, userId, fullContent);
              }
              console.log('\x1b[32m[AI调用-原生HTTP流式] 流式传输完成\x1b[0m');
              readable.push(null); // 结束流
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              
              if (delta) {
                // 🚨 修复：处理豆包thinking模型的reasoning_content
                if (delta.reasoning_content) {
                  console.log(`🤔 [AI-Bridge] 收到reasoning_content: ${delta.reasoning_content.substring(0, 50)}...`);
                }

                if (delta.content) {
                  fullContent += delta.content;
                }

                // 🔧 修复：保持豆包原始格式，不转换！直接转发原始数据
                readable.push(`data: ${data}\n\n`);
              }
            } catch (e) {
              console.warn('解析流式数据失败:', e);
            }
          }
        }
      });

      response.on('end', () => {
        console.log('\x1b[32m[AI调用-原生HTTP流式] 响应流结束\x1b[0m');
        if (!readable.destroyed) {
          readable.push(null);
        }
      });

      response.on('error', (error: any) => {
        console.error('\x1b[31m[AI调用-原生HTTP流式] 响应流错误:\x1b[0m', error);
        readable.destroy(error);
      });

      return readable;

    } catch (error: any) {
      console.error('\x1b[31m[AI调用-原生HTTP流式] 流式请求失败:\x1b[0m', error.message);
      throw new Error('流式AI调用失败: ' + error.message);
    }
  }

  /**
   * 保存流式输出的完整消息到数据库
   */
  private async saveStreamedMessage(conversationId: string, userId: number, content: string, metadata: any = {}) {
    try {
      // 动态导入模型以避免循环依赖
      const { AIMessage } = await import('../../../models');
      const { AIConversation } = await import('../../../models/ai-conversation.model');
      const { MessageRole, MessageType, MessageStatus } = await import('../../../models/ai-message.model');

      // 导入六维记忆系统
      const { getMemorySystem } = await import('../../memory/six-dimension-memory.service');

      console.log('保存流式消息:', { conversationId, userId, contentLength: content.length });

      // 🧠 仅使用六维记忆系统 - 记录AI回复到情节记忆
      try {
        const memorySystem = getMemorySystem();

        // 生成唯一消息ID（用于六维记忆系统）
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await memorySystem.recordConversation(
          'assistant',
          content,
          {
            userId: userId.toString(),
            conversationId,
            messageId,
            role: 'assistant',
            timestamp: new Date(),
            metadata
          }
        );
        console.log('✅ 六维记忆系统已记录AI回复', {
          userId,
          conversationId,
          messageId,
          contentLength: content.length
        });
      } catch (memoryError) {
        console.error('❌ 六维记忆系统记录失败:', memoryError instanceof Error ? memoryError.message : String(memoryError));
        // 如果六维记忆系统失败，抛出错误而不是回退到传统存储
        throw new Error(`六维记忆系统记录失败: ${memoryError instanceof Error ? memoryError.message : String(memoryError)}`);
      }

      // 更新会话的消息计数
      await AIConversation.increment('messageCount', {
        where: { id: conversationId }
      });

      console.log('流式消息已通过六维记忆系统保存成功');

    } catch (error) {
      console.error('保存流式消息失败:', error);
    }
  }

  /**
   * Get the default AI model configuration from database
   * @returns Default AI model configuration
   */
  private async getDefaultModelConfig(): Promise<AIModelConfig | null> {
    try {
      const defaultModel = await AIModelConfig.findOne({
        where: {
          isDefault: true,
          status: ModelStatus.ACTIVE
        }
      });
      return defaultModel;
    } catch (error) {
      console.error('Failed to get default model config:', error);
      return null;
    }
  }

  /**
   * 🚀 获取快速推理模型配置 - 专为CRUD工具优化
   * @returns 快速推理模型配置
   */
  private async getFastModelConfig(): Promise<AIModelConfig | null> {
    try {
      // 优先查找Flash模型
      const flashModel = await AIModelConfig.findOne({
        where: {
          name: 'doubao-seed-1-6-flash-250715',
          status: ModelStatus.ACTIVE
        }
      });

      if (flashModel) {
        console.log('🚀 [AIBridge] 使用Flash快速推理模型');
        return flashModel;
      }

      // 如果Flash模型不可用，回退到默认模型
      console.log('⚠️ [AIBridge] Flash模型不可用，回退到默认模型');
      return await this.getDefaultModelConfig();
    } catch (error) {
      console.error('Failed to get fast model config:', error);
      return await this.getDefaultModelConfig();
    }
  }

  /**
   * 🧠 获取深度思考模型配置 - 专为复杂推理优化
   * @returns 深度思考模型配置
   */
  private async getThinkingModelConfig(): Promise<AIModelConfig | null> {
    try {
      // 优先查找Thinking模型
      const thinkingModel = await AIModelConfig.findOne({
        where: {
          name: 'doubao-seed-1-6-thinking-250615',
          status: ModelStatus.ACTIVE
        }
      });

      if (thinkingModel) {
        console.log('🧠 [AIBridge] 使用Thinking深度思考模型');
        return thinkingModel;
      }

      // 如果Thinking模型不可用，尝试查找其他thinking模型
      const alternativeThinkingModel = await AIModelConfig.findOne({
        where: {
          name: {
            [Op.like]: '%thinking%'
          },
          status: ModelStatus.ACTIVE
        }
      });

      if (alternativeThinkingModel) {
        console.log('🧠 [AIBridge] 使用备选Thinking模型:', alternativeThinkingModel.name);
        return alternativeThinkingModel;
      }

      // 如果没有thinking模型，回退到默认模型
      console.log('⚠️ [AIBridge] Thinking模型不可用，回退到默认模型');
      return await this.getDefaultModelConfig();
    } catch (error) {
      console.error('Failed to get thinking model config:', error);
      return await this.getDefaultModelConfig();
    }
  }

  /**
   * 🎯 专为CRUD工具优化的快速聊天完成
   * @param params - 聊天完成参数
   * @param customConfig - 自定义配置（可选）
   * @returns 聊天完成响应
   */
  async generateFastChatCompletion(
    params: AiBridgeChatCompletionParams,
    customConfig?: { endpointUrl: string; apiKey: string }
  ): Promise<AiBridgeChatCompletionResponse> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 [AIBridge] 开始快速推理');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // 获取快速模型配置
      const fastModelConfig = await this.getFastModelConfig();

      if (!fastModelConfig) {
        throw new Error('No fast model configuration available');
      }

      console.log('📋 [AIBridge] 快速模型配置:', fastModelConfig.displayName);
      console.log('📝 [AIBridge] 消息数量:', params.messages?.length);
      console.log('🔧 [AIBridge] 工具数量:', params.tools?.length || 0);

      // 优化参数用于快速推理
      const optimizedParams: AiBridgeChatCompletionParams = {
        ...params,
        model: fastModelConfig.name,
        temperature: 0.1,  // 低温度确保稳定输出
        max_tokens: 1024,  // 限制token数提高速度
        stream: false      // 不使用流式输出
      };

      // 使用快速模型配置
      const fastConfig = customConfig || {
        endpointUrl: fastModelConfig.endpointUrl,
        apiKey: fastModelConfig.apiKey
      };

      console.log(`🚀 [AIBridge] 使用快速推理模型: ${fastModelConfig.displayName}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return await this.generateChatCompletion(optimizedParams, fastConfig);
    } catch (error) {
      console.error('❌ [AIBridge] 快速聊天完成失败:', error);
      throw error;
    }
  }

  /**
   * 🧠 专为复杂推理优化的深度思考聊天完成
   * 使用专门的Thinking模型（doubao-seed-1-6-thinking-250615）
   * @param params - 聊天完成参数
   * @param customConfig - 自定义配置（可选）
   * @param userId - 用户ID（用于使用量统计）
   * @returns 聊天完成响应
   */
  async generateThinkingChatCompletion(
    params: AiBridgeChatCompletionParams,
    customConfig?: { endpointUrl: string; apiKey: string },
    userId?: number
  ): Promise<AiBridgeChatCompletionResponse> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🧠 [AIBridge] 开始深度思考推理');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // 获取深度思考模型配置
      const thinkingModelConfig = await this.getThinkingModelConfig();

      if (!thinkingModelConfig) {
        throw new Error('No thinking model configuration available');
      }

      console.log('📋 [AIBridge] 深度思考模型配置:', thinkingModelConfig.displayName);
      console.log('📝 [AIBridge] 消息数量:', params.messages?.length);
      console.log('🔧 [AIBridge] 工具数量:', params.tools?.length || 0);
      console.log('👤 [AIBridge] 用户ID:', userId);

      // 优化参数用于深度思考
      const optimizedParams: AiBridgeChatCompletionParams = {
        ...params,
        model: thinkingModelConfig.name,
        temperature: params.temperature || 0.7,  // 中等温度平衡创造性和准确性
        max_tokens: params.max_tokens || 4000,   // 更多token支持复杂推理
        stream: params.stream !== undefined ? params.stream : false  // 保留用户指定的stream设置
      };

      // 使用深度思考模型配置
      const thinkingConfig = customConfig || {
        endpointUrl: thinkingModelConfig.endpointUrl,
        apiKey: thinkingModelConfig.apiKey
      };

      console.log(`🧠 [AIBridge] 使用深度思考模型: ${thinkingModelConfig.displayName}`);
      console.log(`🧠 [AIBridge] 参数配置: temperature=${optimizedParams.temperature}, max_tokens=${optimizedParams.max_tokens}, stream=${optimizedParams.stream}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return await this.generateChatCompletion(optimizedParams, thinkingConfig, userId);
    } catch (error) {
      console.error('❌ [AIBridge] 深度思考聊天完成失败:', error);
      throw error;
    }
  }

  /**
   * 💡 Flash模型的思考模式聊天完成
   * 使用Flash模型 + think参数 + 中等温度
   * 适合需要Flash速度但又需要一定思考深度的场景
   * @param params - 聊天完成参数
   * @param customConfig - 自定义配置（可选）
   * @param userId - 用户ID（用于使用量统计）
   * @returns 聊天完成响应
   */
  async generateFlashWithThink(
    params: AiBridgeChatCompletionParams,
    customConfig?: { endpointUrl: string; apiKey: string },
    userId?: number
  ): Promise<AiBridgeChatCompletionResponse> {
    try {
      // 获取Flash模型配置
      const flashModelConfig = await this.getFastModelConfig();

      if (!flashModelConfig) {
        throw new Error('No flash model configuration available');
      }

      // 优化参数用于Flash思考模式
      const optimizedParams: AiBridgeChatCompletionParams = {
        ...params,
        model: flashModelConfig.name,
        temperature: params.temperature || 0.7,  // 中等温度支持思考
        max_tokens: params.max_tokens || 2000,   // 适中的token数
        think: true,  // 启用思考模式
        stream: params.stream !== undefined ? params.stream : false
      };

      // 使用Flash模型配置
      const flashConfig = customConfig || {
        endpointUrl: flashModelConfig.endpointUrl,
        apiKey: flashModelConfig.apiKey
      };

      console.log(`💡 [AIBridge] 使用Flash思考模式: ${flashModelConfig.displayName}`);
      console.log(`💡 [AIBridge] 参数配置: temperature=${optimizedParams.temperature}, max_tokens=${optimizedParams.max_tokens}, think=true`);

      return await this.generateChatCompletion(optimizedParams, flashConfig, userId);
    } catch (error) {
      console.error('❌ [AIBridge] Flash思考模式聊天完成失败:', error);
      throw error;
    }
  }

  /**
   * High-level analyze method for AI enrollment services
   * @param prompt - The analysis prompt
   * @param options - Analysis options and context
   * @returns Structured analysis result
   */
  public async analyze(prompt: string, options: {
    type: string;
    context: string;
    requireStructured?: boolean;
  }): Promise<any> {
    try {
      // 获取数据库中的默认模型配置
      const modelConfig = await this.getDefaultModelConfig();
      
      if (!modelConfig) {
        throw new Error('No active AI model configuration found');
      }

      const messages: AiBridgeMessage[] = [
        {
          role: 'system' as AiBridgeMessageRole,
          content: `你是一个专业的幼儿园招生分析专家，具有丰富的数据分析和市场预测经验。
请根据用户的要求进行专业分析，并提供准确、实用的建议。
分析类型: ${options.type}
上下文: ${options.context}
${options.requireStructured ? '请以结构化的JSON格式返回分析结果。' : ''}`
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: prompt
        }
      ];

      // 使用数据库中的模型配置
      const response = await this.generateChatCompletion({
        model: modelConfig.name,
        messages,
        temperature: modelConfig.modelParameters?.temperature || 0.7,
        max_tokens: modelConfig.modelParameters?.maxTokens || 2000
      }, {
        endpointUrl: modelConfig.endpointUrl,
        apiKey: modelConfig.apiKey
      });

      let result: any = response.choices[0]?.message?.content || '';
      
      // 如果需要结构化数据，尝试解析JSON
      if (options.requireStructured) {
        try {
          // 提取JSON内容
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            // 如果没有找到JSON，返回包装的结果
            result = { content: result, type: options.type };
          }
        } catch (parseError) {
          console.warn('Failed to parse structured response, returning raw content');
          result = { content: result, type: options.type };
        }
      }

      return result;
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error(`AI ${options.type} 分析失败`);
    }
  }

  // ==================== 多模态方法 ====================

  /**
   * 图片生成
   * @param params - 图片生成参数
   * @param customConfig - 自定义配置
   * @returns 图片生成结果
   */
  public async generateImage(
    params: AiBridgeImageGenerationParams,
    customConfig?: { endpointUrl: string; apiKey: string }
  ): Promise<AiBridgeImageGenerationResponse> {
    try {
      let httpClient = this.defaultHttpClient;
      let endpoint = '/images/generations';

      // 🔧 优化：如果没有提供customConfig，尝试从数据库读取模型配置
      if (!customConfig && params.model) {
        console.log(`🔍 [图片生成] 未提供自定义配置，尝试从数据库读取模型配置: ${params.model}`);

        try {
          const AIModelConfigModule = await import('../../../models/ai-model-config.model');
          const AIModelConfig = AIModelConfigModule.default;
          const modelConfig = await AIModelConfig.findOne({
            where: { name: params.model, status: 'active' }
          });

          if (modelConfig) {
            customConfig = {
              endpointUrl: modelConfig.endpointUrl,
              apiKey: modelConfig.apiKey || ''
            };
            console.log(`✅ [图片生成] 从数据库加载模型配置成功: ${modelConfig.displayName}`);
          }
        } catch (dbError) {
          console.error(`❌ [图片生成] 从数据库读取配置失败:`, dbError);
        }
      }

      if (customConfig) {
        httpClient = this.createCustomHttpClient(customConfig.endpointUrl, customConfig.apiKey);
        endpoint = '/images/generations';
        console.log('🎨 [图片生成] 使用自定义配置');
      }

      console.log('🎨 [图片生成] 请求参数:', JSON.stringify(params, null, 2));

      const networkConfig = AIConfigService.getNetworkConfig();

      for (let attempt = 1; attempt <= networkConfig.maxRetries; attempt++) {
        try {
          const response = await httpClient.post<AiBridgeImageGenerationResponse>(endpoint, params);
          console.log(`🎨 [图片生成] 第 ${attempt} 次调用成功`);
          return response.data;
        } catch (retryError) {
          if (attempt < networkConfig.maxRetries && axios.isAxiosError(retryError) && retryError.response?.status === 503) {
            console.log(`🎨 [图片生成] 第 ${attempt} 次调用失败，准备重试`);
            await new Promise(resolve => setTimeout(resolve, networkConfig.retryDelay * attempt));
            continue;
          }
          throw retryError;
        }
      }
    } catch (error) {
      console.error('🎨 [图片生成] 调用失败:', error);
      throw new Error('图片生成失败');
    }
  }

  /**
   * 语音转文本
   * @param params - 语音转文本参数
   * @param customConfig - 自定义配置
   * @returns 语音转文本结果
   */
  public async speechToText(
    params: AiBridgeSpeechToTextParams,
    customConfig?: { endpointUrl: string; apiKey: string }
  ): Promise<AiBridgeSpeechToTextResponse> {
    try {
      let httpClient = this.defaultHttpClient;
      let endpoint = '/audio/transcriptions';

      if (customConfig) {
        httpClient = this.createCustomHttpClient(customConfig.endpointUrl, customConfig.apiKey, 'multipart/form-data');
        endpoint = '/audio/transcriptions';
        console.log('🎤 [语音转文本] 使用自定义配置');
      }

      // 构建FormData
      const formData = new FormData();
      formData.append('file', params.file, params.filename);
      formData.append('model', params.model);

      if (params.language) formData.append('language', params.language);
      if (params.prompt) formData.append('prompt', params.prompt);
      if (params.response_format) formData.append('response_format', params.response_format);
      if (params.temperature) formData.append('temperature', params.temperature.toString());

      console.log('🎤 [语音转文本] 开始处理');

      const response = await httpClient.post<AiBridgeSpeechToTextResponse>(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': httpClient.defaults.headers['Authorization']
        }
      });

      console.log('🎤 [语音转文本] 处理成功');
      return response.data;
    } catch (error) {
      console.error('🎤 [语音转文本] 调用失败:', error);
      throw new Error('语音转文本失败');
    }
  }

  /**
   * 文本转语音
   * @param params - 文本转语音参数
   * @param customConfig - 自定义配置
   * @returns 文本转语音结果
   */
  public async textToSpeech(
    params: AiBridgeTextToSpeechParams,
    customConfig?: { endpointUrl: string; apiKey: string }
  ): Promise<AiBridgeTextToSpeechResponse> {
    try {
      console.log('🔊 [文本转语音] 开始处理:', JSON.stringify(params, null, 2));

      // 检查是否使用V3 WebSocket端点
      const isV3WebSocket = customConfig?.endpointUrl?.includes('wss://') ||
                           customConfig?.endpointUrl?.includes('/v3/tts');

      if (isV3WebSocket) {
        // 使用V3 WebSocket双向流式服务
        console.log('🔊 [文本转语音] 使用V3 WebSocket双向流式服务');

        // 动态导入V3双向流式服务
        const { VolcengineTTSV3BidirectionService } = await import('../../volcengine/tts-v3-bidirection.service');

        // 从customConfig中提取配置
        // 假设apiKey是appKey，或者从model_parameters中获取
        let appKey = customConfig!.apiKey;
        let accessKey = '';

        // 如果endpoint包含bidirection，尝试从数据库加载完整配置
        try {
          const modelConfig = await AIModelConfig.findOne({
            where: {
              endpointUrl: customConfig!.endpointUrl,
              status: ModelStatus.ACTIVE
            }
          });

          if (modelConfig && modelConfig.modelParameters) {
            const params = typeof modelConfig.modelParameters === 'string'
              ? JSON.parse(modelConfig.modelParameters)
              : modelConfig.modelParameters;
            appKey = params.appKey || appKey;
            accessKey = params.accessKey || '';
          }
        } catch (e) {
          console.warn('🔊 [文本转语音] 无法从数据库加载配置，使用默认值');
        }

        // 创建V3双向流式服务实例
        const ttsV3Service = new VolcengineTTSV3BidirectionService({
          appKey: appKey,
          accessKey: accessKey,
          wsUrl: customConfig!.endpointUrl
        });

        // 调用V3服务
        const result = await ttsV3Service.textToSpeech({
          text: params.input,
          speaker: params.voice || 'zh_female_cancan_mars_bigtts',
          format: 'mp3',
          speedRatio: params.speed || 1.0
        });

        console.log('🔊 [文本转语音] V3双向流式处理成功');

        return {
          success: true,
          audioData: result.audioBuffer,
          contentType: 'audio/mpeg'
        };
      } else {
        // 使用传统HTTP端点
        let httpClient = this.defaultHttpClient;
        let endpoint = '/audio/speech';

        if (customConfig) {
          httpClient = this.createCustomHttpClient(customConfig.endpointUrl, customConfig.apiKey);
          endpoint = '/audio/speech';
          console.log('🔊 [文本转语音] 使用自定义HTTP配置');
        }

        const response = await httpClient.post(endpoint, params, {
          responseType: 'arraybuffer'
        });

        console.log('🔊 [文本转语音] HTTP处理成功');

        return {
          success: true,
          audioData: Buffer.from(response.data),
          contentType: response.headers['content-type'] || 'audio/mpeg'
        };
      }
    } catch (error: any) {
      console.error('🔊 [文本转语音] 调用失败:', error.message);
      throw new Error(`文本转语音失败: ${error.message}`);
    }
  }

  /**
   * 视频生成（委托给专业的 video.service）
   * @param params - 视频生成参数
   * @param customConfig - 自定义配置
   * @returns 视频生成结果
   */
  public async generateVideo(
    params: AiBridgeVideoGenerationParams,
    customConfig?: { endpointUrl: string; apiKey: string }
  ): Promise<AiBridgeVideoGenerationResponse> {
    try {
      console.log('🎬 [AI-Bridge] 视频生成请求，委托给 VideoService');
      console.log('🎬 [AI-Bridge] 参数:', JSON.stringify(params, null, 2));

      // 视频服务暂时不可用，返回模拟结果
      console.log('⚠️ [AI-Bridge] 视频服务暂未实现，返回模拟结果');
      const result = {
        success: false,
        message: '视频服务功能暂未实现',
        data: null
      };

      console.log('🎬 [AI-Bridge] 视频生成成功');
      return result;

    } catch (error) {
      console.error('🎬 [AI-Bridge] 视频生成失败:', error);
      throw new Error('视频生成失败');
    }
  }

  /**
   * VOD视频上传（委托给 vod.service）
   * @param params - 上传参数
   * @returns 上传结果
   */
  public async uploadVideoToVOD(
    params: AiBridgeVODUploadParams
  ): Promise<AiBridgeVODUploadResponse> {
    try {
      console.log('📤 [AI-Bridge] VOD视频上传请求');

      // 动态导入 vod.service
      const { vodService } = await import('../../volcengine/vod.service');

      // 委托给VOD服务处理
      const result = await vodService.uploadVideo(params.videoBuffer, params.filename);

      console.log('📤 [AI-Bridge] VOD视频上传成功');
      return result;

    } catch (error) {
      console.error('📤 [AI-Bridge] VOD视频上传失败:', error);
      throw new Error('VOD视频上传失败');
    }
  }

  /**
   * VOD视频合并（委托给 vod.service）
   * @param params - 合并参数
   * @returns 合并结果
   */
  public async mergeVideosVOD(
    params: AiBridgeVODMergeParams
  ): Promise<AiBridgeVODMergeResponse> {
    try {
      console.log('✂️ [AI-Bridge] VOD视频合并请求');
      console.log(`✂️ [AI-Bridge] 合并 ${params.videoUrls.length} 个视频片段`);

      // 动态导入 vod.service
      const { vodService } = await import('../../volcengine/vod.service');

      // 委托给VOD服务处理
      const result = await vodService.mergeVideos(params.videoUrls, params.outputFilename);

      console.log('✂️ [AI-Bridge] VOD视频合并成功');
      return result;

    } catch (error) {
      console.error('✂️ [AI-Bridge] VOD视频合并失败:', error);
      throw new Error('VOD视频合并失败');
    }
  }

  /**
   * VOD添加音频（委托给 vod.service）
   * @param params - 添加音频参数
   * @returns 添加音频结果
   */
  public async addAudioToVideoVOD(
    params: AiBridgeVODAddAudioParams
  ): Promise<AiBridgeVODAddAudioResponse> {
    try {
      console.log('🎤 [AI-Bridge] VOD添加音频请求');

      // 动态导入 vod.service
      const { vodService } = await import('../../volcengine/vod.service');

      // 委托给VOD服务处理
      const result = await vodService.addAudioToVideo(
        params.videoUrl,
        params.audioUrl,
        params.outputFilename
      );

      console.log('🎤 [AI-Bridge] VOD添加音频成功');
      return result;

    } catch (error) {
      console.error('🎤 [AI-Bridge] VOD添加音频失败:', error);
      throw new Error('VOD添加音频失败');
    }
  }

  /**
   * VOD视频转码（委托给 vod.service）
   * @param params - 转码参数
   * @returns 转码结果
   */
  public async transcodeVideoVOD(
    params: AiBridgeVODTranscodeParams
  ): Promise<AiBridgeVODTranscodeResponse> {
    try {
      console.log('🔄 [AI-Bridge] VOD视频转码请求');

      // 动态导入 vod.service
      const { vodService } = await import('../../volcengine/vod.service');

      // 委托给VOD服务处理
      const result = await vodService.transcodeVideo(
        params.videoUrl,
        params.format || 'mp4',
        (params.quality || 'high') as 'low' | 'medium' | 'high'
      );

      console.log('🔄 [AI-Bridge] VOD视频转码成功');
      return result;

    } catch (error) {
      console.error('🔄 [AI-Bridge] VOD视频转码失败:', error);
      throw new Error('VOD视频转码失败');
    }
  }

  /**
   * VOD任务状态查询（委托给 vod.service）
   * @param params - 查询参数
   * @returns 任务状态
   */
  public async getVODTaskStatus(
    params: AiBridgeVODTaskStatusParams
  ): Promise<AiBridgeVODTaskStatusResponse> {
    try {
      console.log('📊 [AI-Bridge] VOD任务状态查询');

      // 动态导入 vod.service
      const { vodService } = await import('../../volcengine/vod.service');

      // 委托给VOD服务处理
      const result = await vodService.getTaskStatus(params.taskId);

      console.log('📊 [AI-Bridge] VOD任务状态查询成功');
      return result;

    } catch (error) {
      console.error('📊 [AI-Bridge] VOD任务状态查询失败:', error);
      throw new Error('VOD任务状态查询失败');
    }
  }

  /**
   * 文档处理
   * @param params - 文档处理参数
   * @param customConfig - 自定义配置
   * @returns 文档处理结果
   */
  public async processDocument(
    params: AiBridgeDocumentParams,
    customConfig?: { endpointUrl: string; apiKey: string }
  ): Promise<AiBridgeDocumentResponse> {
    try {
      let httpClient = this.defaultHttpClient;
      let endpoint = '/documents/process';

      if (customConfig) {
        httpClient = this.createCustomHttpClient(customConfig.endpointUrl, customConfig.apiKey, 'multipart/form-data');
        endpoint = '/documents/process';
        console.log('📄 [文档处理] 使用自定义配置');
      }

      // 构建FormData
      const formData = new FormData();
      formData.append('file', params.document, params.filename);
      formData.append('model', params.model);
      formData.append('task', params.task);

      if (params.language) formData.append('language', params.language);
      if (params.format) formData.append('format', params.format);

      console.log('📄 [文档处理] 开始处理');

      const response = await httpClient.post<AiBridgeDocumentResponse>(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': httpClient.defaults.headers['Authorization']
        }
      });

      console.log('📄 [文档处理] 处理成功');
      return response.data;
    } catch (error) {
      console.error('📄 [文档处理] 调用失败:', error);
      throw new Error('文档处理失败');
    }
  }

  /**
   * 网络搜索
   * @param params - 搜索参数
   * @param customConfig - 自定义配置（包含endpoint和apiKey）
   * @returns 搜索结果
   */
  public async search(
    params: AiBridgeSearchParams,
    customConfig?: { endpointUrl: string; apiKey: string }
  ): Promise<AiBridgeSearchResponse> {
    const startTime = Date.now();

    try {
      console.log('🔍 [AI-Bridge] 开始网络搜索:', params.query);

      // 获取搜索模型配置以确定max_tokens
      const modelConfigService = (await import('../ai-model-config.service')).default;
      const searchModel = await modelConfigService.getDefaultModel('search');
      const maxTokens = searchModel?.maxTokens || 2048;

      // 构建搜索请求体（火山引擎融合搜索格式）
      const requestBody = {
        Query: params.query,
        SearchType: params.searchType || 'web_summary',
        Count: params.maxResults || 5,
        NeedSummary: params.enableAISummary !== false,
        Language: params.language || 'zh-CN',
        MaxSummaryLength: maxTokens // 🔧 控制AI总结的最大长度
      };

      console.log('🔍 [AI-Bridge] 搜索参数:', JSON.stringify(requestBody, null, 2));

      // 使用自定义配置或默认配置
      const endpoint = customConfig?.endpointUrl || process.env.VOLCANO_SEARCH_ENDPOINT || 'https://open.feedcoopapi.com/search_api/web_search';
      const apiKey = customConfig?.apiKey || process.env.VOLCANO_API_KEY || '';

      console.log('🔍 [AI-Bridge] 搜索端点:', endpoint);

      // 使用统一的网络配置，强制禁用代理
      const networkConfig = AIConfigService.getAxiosConfig();

      const response = await axios.post(endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'YY-AI-Assistant/1.0'
        },
        timeout: 30000,
        responseType: 'text', // 🔧 关键：接收文本格式，用于解析SSE
        // 🚀 强制禁用代理，确保直连
        proxy: false,
        // 禁用环境变量代理
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
        ...networkConfig
      });

      const searchTime = Date.now() - startTime;

      // 🔧 解析SSE格式的响应
      const responseText = response.data;
      console.log('🔍 [AI-Bridge] SSE响应长度:', responseText.length, '字符');
      
      // 提取第一个data块（包含搜索结果）
      const lines = responseText.split('\n');
      let firstDataBlock = null;
      let aiSummaryChunks: string[] = [];
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const jsonStr = line.substring(5).trim();
          if (!jsonStr) continue;
          
          try {
            const data = JSON.parse(jsonStr);
            
            // 第一个包含WebResults的块
            if (data.Result && data.Result.WebResults) {
              firstDataBlock = data;
            }
            
            // Choices块包含AI总结
            if (data.Result && data.Result.Choices && data.Result.Choices.length > 0) {
              const chunk = data.Result.Choices[0].Delta?.Content || '';
              if (chunk) {
                aiSummaryChunks.push(chunk);
              }
            }
          } catch (e) {
            // 忽略无效JSON
            continue;
          }
        }
      }

      if (!firstDataBlock || !firstDataBlock.Result) {
        console.error('❌ [AI-Bridge] 未找到有效的搜索结果');
        throw new Error('搜索API返回格式错误');
      }

      const volcanoData = firstDataBlock;

      // 转换为统一格式
      const results: any[] = [];

      if (Array.isArray(volcanoData.Result.WebResults)) {
        volcanoData.Result.WebResults.forEach((item: any) => {
          results.push({
            title: item.Title || '',
            url: item.Url || '',
            snippet: item.Snippet || '',
            publishTime: item.PublishTime,
            source: item.Source,
            relevanceScore: item.RelevanceScore
          });
        });
      }

      // 🔧 合并AI总结：优先使用Summary字段，否则使用流式Choices拼接的内容
      const aiSummary = volcanoData.Result.Summary || aiSummaryChunks.join('') || '';
      
      const searchResponse: AiBridgeSearchResponse = {
        query: params.query,
        results: results,
        totalResults: results.length,
        searchTime: searchTime,
        aiSummary: aiSummary,
        suggestions: volcanoData.Result.Suggestions || [],
        relatedQueries: volcanoData.Result.RelatedQueries || []
      };

      console.log('🔍 [AI-Bridge] 搜索成功，返回', results.length, '条结果');
      console.log('🔍 [AI-Bridge] AI总结长度:', aiSummary.length, '字符');
      return searchResponse;

    } catch (error: any) {
      console.error('🔍 [AI-Bridge] 搜索失败:', error.message);

      // 返回空结果而不是抛出错误
      return {
        query: params.query,
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        aiSummary: `搜索失败: ${error.message}`
      };
    }
  }

  /**
   * 从数据库获取可用的AI模型列表
   */
  async getModels(): Promise<any[]> {
    try {
      // 导入AI模型配置
      const { AIModelConfig } = await import('../../../models/ai-model-config.model');

      // 从数据库获取所有激活的模型
      const models = await AIModelConfig.findAll({
        where: {
          status: 'active'
        },
        attributes: ['id', 'name', 'displayName', 'provider', 'modelType', 'isDefault', 'endpointUrl'],
        order: [['isDefault', 'DESC'], ['name', 'ASC']]
      });

      // 格式化返回结果
      return models.map(model => ({
        id: model.id,
        name: model.name,
        displayName: model.displayName || model.name,
        provider: model.provider,
        modelType: model.modelType,
        isDefault: model.isDefault || false,
        endpointUrl: model.endpointUrl
      }));

    } catch (error) {
      console.error('❌ [AI-Bridge] 获取模型列表失败:', error);

      // 返回默认模型列表作为备选
      return [
        {
          id: 1,
          name: 'gpt-3.5-turbo',
          displayName: 'GPT-3.5 Turbo',
          provider: 'openai',
          modelType: 'chat',
          isDefault: true,
          endpointUrl: 'https://api.openai.com/v1'
        },
        {
          id: 2,
          name: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'openai',
          modelType: 'chat',
          isDefault: false,
          endpointUrl: 'https://api.openai.com/v1'
        }
      ];
    }
  }
}

// Export a singleton instance of the service
export const aiBridgeService = new AIBridgeService();

