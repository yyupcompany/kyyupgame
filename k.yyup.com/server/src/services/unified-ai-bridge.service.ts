/**
 * 统一AI Bridge服务
 *
 * 功能：
 * 1. 自动检测运行环境（本地/租户）
 * 2. 根据环境路由AI调用（本地AI Bridge / 统一认证AI Bridge）
 * 3. 提供统一的接口规范
 * 4. 支持所有AI类型（文本、图片、音频、视频、文档、搜索）
 *
 * 环境规则：
 * - localhost / 127.0.0.1 / k.yyup.cc → 本地AI Bridge (开发/Demo)
 * - k001.yyup.cc / k002.yyup.cc → 统一认证AI Bridge (租户)
 */

import { Readable } from 'stream';
import { aiBridgeService as localFullAIBridge } from './ai/bridge/ai-bridge.service';
import { unifiedTenantAIClient } from './unified-tenant-ai-client.service';
import { aiBridgeClient } from './ai-bridge-client.service';

// ==================== 类型定义 ====================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface UnifiedChatRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  tools?: any[];
  response_format?: string;
  stream?: boolean;
}

export interface UnifiedChatResponse {
  success: boolean;
  data?: {
    content: string;
    message: string;
    reasoning_content?: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      reasoning_tokens?: number;
      cost: number;
      responseTime: number;
    };
  };
  error?: string;
}

export interface UnifiedImageGenerateRequest {
  model?: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  logo_info?: {
    add_logo: boolean;
    [key: string]: any;
  };
}

export interface UnifiedImageGenerateResponse {
  success: boolean;
  data?: {
    images: Array<{
      url: string;
      revised_prompt?: string;
    }>;
    usage?: {
      totalTokens: number;
      cost: number;
      responseTime: number;
    };
  };
  error?: string;
}

export interface UnifiedAudioProcessRequest {
  model?: string;
  file: Buffer | string;
  filename?: string;
  action: 'transcribe' | 'translate' | 'synthesize';
  language?: string;
  voice?: string;
  speed?: number;
}

export interface UnifiedAudioProcessResponse {
  success: boolean;
  data?: {
    text?: string;
    audio_url?: string;
    audioData?: Buffer;
    contentType?: string;
    duration?: number;
    usage?: any;
  };
  error?: string;
}

export interface UnifiedVideoProcessRequest {
  action: 'generate' | 'merge' | 'add_audio' | 'transcode';
  model?: string;
  prompt?: string;
  videoUrls?: string[];
  audioUrl?: string;
  format?: string;
  quality?: 'low' | 'medium' | 'high';
}

export interface UnifiedVideoProcessResponse {
  success: boolean;
  data?: {
    videoUrl?: string;
    taskId?: string;
    status?: string;
  };
  error?: string;
}

export interface UnifiedSearchRequest {
  query: string;
  searchType?: 'web' | 'news' | 'image';
  maxResults?: number;
  enableAISummary?: boolean;
  language?: string;
}

export interface UnifiedSearchResponse {
  success: boolean;
  data?: {
    query: string;
    results: Array<{
      title: string;
      url: string;
      snippet: string;
      publishTime?: string;
      source?: string;
    }>;
    totalResults: number;
    searchTime: number;
    aiSummary?: string;
  };
  error?: string;
}

export interface AIModel {
  id: number;
  name: string;
  displayName: string;
  modelType: string;
  provider: string;
  isDefault?: boolean;
}

// ==================== 统一AI Bridge服务 ====================

class UnifiedAIBridgeService {
  private currentEnvironment: 'local' | 'tenant' | null = null;

  constructor() {
    console.log('🌉 [统一AI Bridge] 初始化服务');
    this.detectEnvironment();
  }

  /**
   * 检测当前运行环境
   * @returns 'local' | 'tenant'
   */
  private detectEnvironment(): 'local' | 'tenant' {
    if (this.currentEnvironment) {
      return this.currentEnvironment;
    }

    // 优先级：HOSTNAME > HOST > localhost
    const hostname = process.env.HOSTNAME ||
                     process.env.HOST ||
                     'localhost';

    // 本地/Demo环境 - 使用本地AI Bridge
    const localPatterns = [
      'localhost',
      '127.0.0.1',
      'k.yyup.cc',
      'k.yyup.com'
    ];

    const isLocal = localPatterns.some(pattern => {
      if (pattern.includes('*')) {
        // 支持通配符匹配（例如 *.yyup.cc）
        const regex = new RegExp('^' + pattern.replace('.', '\\.').replace('*', '.*') + '$');
        return regex.test(hostname);
      }
      return hostname === pattern || hostname.includes(pattern);
    });

    if (isLocal) {
      console.log(`🔧 [统一AI Bridge] 环境: 本地/Demo (${hostname}) - 使用本地AI Bridge`);
      this.currentEnvironment = 'local';
      return 'local';
    }

    // 租户域名 - k开头.yyup.cc 或 k.yyup.com的子域名
    const tenantPattern = /^k\d{3}(\.\w+)*\.(yyup\.cc|yyup\.com)$/;
    if (tenantPattern.test(hostname)) {
      console.log(`🏢 [统一AI Bridge] 环境: 租户 (${hostname}) - 使用统一认证AI Bridge`);
      this.currentEnvironment = 'tenant';
      return 'tenant';
    }

    // 默认使用本地环境
    console.log(`⚠️  [统一AI Bridge] 未知域名 (${hostname})，默认使用本地AI Bridge`);
    this.currentEnvironment = 'local';
    return 'local';
  }

  /**
   * 获取当前环境
   */
  public getEnvironment(): 'local' | 'tenant' {
    return this.currentEnvironment || this.detectEnvironment();
  }

  /**
   * 路由AI调用到相应的Bridge
   */
  private async routeAIRequest(
    requestType: 'chat' | 'image' | 'audio' | 'video' | 'document' | 'search',
    params: any,
    authToken?: string
  ): Promise<any> {
    const env = this.detectEnvironment();

    if (env === 'tenant') {
      // 租户环境：使用统一认证AI Bridge
      console.log(`🏢 [统一AI Bridge] 路由到统一认证系统 (${requestType})`);
      return await this.callUnifiedAuth(requestType, params, authToken);
    } else {
      // 本地环境：使用本地AI Bridge
      console.log(`🔧 [统一AI Bridge] 路由到本地AI Bridge (${requestType})`);
      return await this.callLocalBridge(requestType, params);
    }
  }

  /**
   * 调用统一认证AI Bridge
   */
  private async callUnifiedAuth(
    requestType: string,
    params: any,
    authToken?: string
  ): Promise<any> {
    try {
      switch (requestType) {
        case 'chat':
          return await unifiedTenantAIClient.chat(params, authToken);

        case 'image':
          return await unifiedTenantAIClient.imageGenerate(params, authToken);

        case 'audio':
          return await unifiedTenantAIClient.processAudio(params, authToken);

        case 'video':
          // 统一认证暂不支持视频
          return {
            success: false,
            error: '统一认证系统暂不支持视频生成'
          };

        case 'search':
          // ✅ 统一认证现在支持网络搜索
          return await unifiedTenantAIClient.search(params, authToken);

        default:
          return {
            success: false,
            error: `不支持的请求类型: ${requestType}`
          };
      }
    } catch (error: any) {
      console.error('❌ [统一AI Bridge] 统一认证调用失败:', error.message);
      return {
        success: false,
        error: error.message || '统一认证调用失败'
      };
    }
  }

  /**
   * 调用本地AI Bridge
   */
  private async callLocalBridge(
    requestType: string,
    params: any
  ): Promise<any> {
    try {
      switch (requestType) {
        case 'chat':
          const chatResponse = await localFullAIBridge.generateChatCompletion(params);
          const message = chatResponse.choices?.[0]?.message as any;

          // 🔧 修复: 保留完整的 tool_calls 信息，不要丢弃
          // message 对象包含: content, tool_calls, reasoning_content
          const toolCalls = message?.tool_calls;
          const hasToolCalls = toolCalls && toolCalls.length > 0;

          console.log(`🔧 [统一AI Bridge-Debug] AI响应分析:`);
          console.log(`  - content: ${message?.content?.substring(0, 50) || 'empty'}...`);
          console.log(`  - tool_calls: ${hasToolCalls ? `检测到 ${toolCalls.length} 个工具调用` : '无'}`);
          console.log(`  - reasoning_content: ${message?.reasoning_content?.substring(0, 50) || 'none'}...`);

          return {
            success: true,
            data: {
              content: message?.content || '',
              message: message?.content || '',
              reasoning_content: message?.reasoning_content,
              // ✨ 新增: 传递 tool_calls 信息
              tool_calls: toolCalls || null,
              usage: chatResponse.usage ? {
                inputTokens: chatResponse.usage.prompt_tokens || 0,
                outputTokens: chatResponse.usage.completion_tokens || 0,
                totalTokens: chatResponse.usage.total_tokens || 0,
                reasoning_tokens: (chatResponse.usage as any)?.reasoning_tokens || 0,
                cost: 0,
                responseTime: 0
              } : undefined
            }
          };

        case 'image':
          const imageResponse = await localFullAIBridge.generateImage(params);
          return {
            success: true,
            data: {
              images: (imageResponse as any).data || [],
              usage: (imageResponse as any).usage
            }
          };

        case 'audio':
          if (params.action === 'transcribe') {
            const sttResponse = await localFullAIBridge.speechToText(params);
            return {
              success: true,
              data: {
                text: sttResponse.text
              }
            };
          } else if (params.action === 'synthesize') {
            const ttsResponse = await localFullAIBridge.textToSpeech({
              input: params.file,
              model: params.model,
              voice: params.voice,
              speed: params.speed
            });
            return {
              success: true,
              data: {
                audioData: ttsResponse.audioData,
                contentType: ttsResponse.contentType
              }
            };
          }
          return {
            success: false,
            error: `不支持的音频操作: ${params.action}`
          };

        case 'video':
          const videoResponse = await localFullAIBridge.generateVideo(params);
          return videoResponse;

        case 'search':
          const searchResponse = await localFullAIBridge.search(params);
          return {
            success: true,
            data: searchResponse
          };

        default:
          return {
            success: false,
            error: `不支持的请求类型: ${requestType}`
          };
      }
    } catch (error: any) {
      console.error('❌ [统一AI Bridge] 本地Bridge调用失败:', error.message);
      return {
        success: false,
        error: error.message || '本地Bridge调用失败'
      };
    }
  }

  // ==================== 统一接口 ====================

  /**
   * 文本/对话接口（非流式）
   */
  async chat(
    request: UnifiedChatRequest,
    authToken?: string
  ): Promise<UnifiedChatResponse> {
    console.log('💬 [统一AI Bridge] 发起对话请求');
    return await this.routeAIRequest('chat', request, authToken);
  }

  /**
   * 文本/对话接口（流式）
   */
  async streamChat(
    request: UnifiedChatRequest,
    authToken?: string
  ): Promise<Readable> {
    console.log('💬 [统一AI Bridge] 发起流式对话请求');

    // 流式只支持本地AI Bridge
    const env = this.detectEnvironment();
    if (env === 'tenant') {
      throw new Error('统一认证系统暂不支持流式对话，请使用非流式接口');
    }

    // 确保model参数存在（如果未提供，使用default）
    const streamParams = {
      ...request,
      model: request.model || 'default'
    };

    return await localFullAIBridge.generateChatCompletionStream(streamParams);
  }

  /**
   * 图片生成接口
   */
  async generateImage(
    request: UnifiedImageGenerateRequest,
    authToken?: string
  ): Promise<UnifiedImageGenerateResponse> {
    console.log('🖼️  [统一AI Bridge] 发起图片生成请求');
    return await this.routeAIRequest('image', request, authToken);
  }

  /**
   * 音频处理接口
   */
  async processAudio(
    request: UnifiedAudioProcessRequest,
    authToken?: string
  ): Promise<UnifiedAudioProcessResponse> {
    console.log('🎤 [统一AI Bridge] 发起音频处理请求');
    return await this.routeAIRequest('audio', request, authToken);
  }

  /**
   * 视频处理接口
   */
  async processVideo(
    request: UnifiedVideoProcessRequest,
    authToken?: string
  ): Promise<UnifiedVideoProcessResponse> {
    console.log('🎬 [统一AI Bridge] 发起视频处理请求');
    return await this.routeAIRequest('video', request, authToken);
  }

  /**
   * 网络搜索接口
   */
  async search(
    request: UnifiedSearchRequest,
    authToken?: string
  ): Promise<UnifiedSearchResponse> {
    console.log('🔍 [统一AI Bridge] 发起网络搜索请求');
    return await this.routeAIRequest('search', request, authToken);
  }

  /**
   * 获取可用模型列表
   */
  async getModels(authToken?: string): Promise<AIModel[]> {
    console.log('📋 [统一AI Bridge] 获取模型列表');

    const env = this.detectEnvironment();

    if (env === 'tenant') {
      // 从统一认证系统获取
      return await unifiedTenantAIClient.getModels(authToken);
    } else {
      // 从本地数据库获取
      return await localFullAIBridge.getModels();
    }
  }

  /**
   * 获取默认模型
   */
  async getDefaultModel(authToken?: string): Promise<AIModel | null> {
    console.log('📋 [统一AI Bridge] 获取默认模型');

    const env = this.detectEnvironment();

    if (env === 'tenant') {
      return await unifiedTenantAIClient.getDefaultModel(authToken);
    } else {
      const models = await localFullAIBridge.getModels();
      return models.find(m => m.isDefault) || models[0] || null;
    }
  }

  /**
   * 按类型获取模型
   */
  async getModelsByType(modelType: string, authToken?: string): Promise<AIModel[]> {
    console.log(`📋 [统一AI Bridge] 获取${modelType}类型模型`);

    const env = this.detectEnvironment();

    if (env === 'tenant') {
      if (!authToken) {
        console.warn('⚠️ [统一AI Bridge] 租户环境需要authToken');
        return [];
      }
      return await unifiedTenantAIClient.getModelsByType(authToken, modelType);
    } else {
      const models = await localFullAIBridge.getModels();
      return models.filter(m => m.modelType === modelType);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; environment: string; unifiedAuth: boolean; localBridge: boolean }> {
    const env = this.detectEnvironment();

    // 检查本地Bridge
    let localBridgeHealthy = false;
    try {
      await localFullAIBridge.getModels();
      localBridgeHealthy = true;
    } catch (error) {
      console.error('本地AI Bridge健康检查失败:', error);
    }

    // 检查统一认证
    let unifiedAuthHealthy = false;
    try {
      unifiedAuthHealthy = await unifiedTenantAIClient.healthCheck();
    } catch (error) {
      console.error('统一认证健康检查失败:', error);
    }

    return {
      status: (env === 'tenant' ? unifiedAuthHealthy : localBridgeHealthy) ? 'healthy' : 'unhealthy',
      environment: env,
      unifiedAuth: unifiedAuthHealthy,
      localBridge: localBridgeHealthy
    };
  }
}

// 导出类和单例
export { UnifiedAIBridgeService };
export const unifiedAIBridge = new UnifiedAIBridgeService();
export default UnifiedAIBridgeService;
