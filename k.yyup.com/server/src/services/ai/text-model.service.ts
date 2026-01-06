/**
 * 文本模型服务 - 通过统一AI Bridge服务
 * 自动路由AI调用（本地/统一认证）
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';
import { AiBridgeMessage, AiBridgeMessageRole } from './bridge/ai-bridge.types';

/**
 * 消息角色类型
 */
export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  FUNCTION = 'function'
}

/**
 * 消息接口
 */
export interface Message {
  role: MessageRole | string;
  content: string;
  name?: string;
}

/**
 * 文本生成选项接口
 */
export interface TextGenerationOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  max_tokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  functions?: any[];
  functionCall?: string | { name: string };
  stream?: boolean;
}

/**
 * 文本生成结果接口
 */
export interface TextGenerationResult {
  id?: string;
  model?: string;
  content?: string;
  choices?: {
    index: number;
    message: Message;
    finishReason?: string;
    finish_reason?: string;
  }[];
  usage?: {
    promptTokens?: number;
    prompt_tokens?: number;
    completionTokens?: number;
    completion_tokens?: number;
    totalTokens?: number;
    total_tokens?: number;
  };
}

/**
 * 文本模型服务类 - 代理到统一租户系统
 */
class TextModelService {
  constructor() {
    console.log('🔗 [TextModelService] 初始化，代理到统一租户系统');
  }

  /**
   * 生成文本（兼容旧接口）
   * @param userIdOrPromptOrOptions - 用户ID（数字）、提示文本（字符串）或选项对象
   * @param options - 生成选项
   */
  async generateText(userIdOrPromptOrOptions: string | number | Partial<TextGenerationOptions>, options?: Partial<TextGenerationOptions>): Promise<TextGenerationResult> {
    console.log('📝 [TextModelService] 生成文本');

    // 兼容三种调用方式：
    // 1. generateText(options) - 直接传选项对象
    // 2. generateText(userId, options) - 新接口
    // 3. generateText(prompt, options) - 旧接口
    let messages: Message[];
    let finalOptions: Partial<TextGenerationOptions> = {};

    if (typeof userIdOrPromptOrOptions === 'object') {
      // 直接传选项对象
      finalOptions = userIdOrPromptOrOptions;
      messages = finalOptions.messages || [{ role: MessageRole.USER, content: '' }];
    } else if (typeof userIdOrPromptOrOptions === 'number' || !isNaN(Number(userIdOrPromptOrOptions))) {
      // 新接口：userId + options.messages
      finalOptions = options || {};
      messages = finalOptions.messages || [{ role: MessageRole.USER, content: '' }];
    } else {
      // 旧接口：prompt 作为消息内容
      finalOptions = options || {};
      messages = [{ role: MessageRole.USER, content: userIdOrPromptOrOptions as string }];
    }

    const result = await this.generateChatCompletion({
      model: finalOptions.model || 'doubao-seed-1-6-flash-250715',
      messages,
      temperature: finalOptions.temperature,
      maxTokens: finalOptions.maxTokens || finalOptions.max_tokens,
    });

    return result;
  }

  /**
   * 生成聊天完成 - 核心方法
   * 通过统一AI Bridge自动路由到本地/统一认证
   */
  async generateChatCompletion(options: TextGenerationOptions): Promise<TextGenerationResult> {
    console.log('💬 [TextModelService] 聊天完成请求通过统一AI Bridge');
    console.log(`   模型: ${options.model}, 消息数: ${options.messages?.length}`);

    try {
      // 转换消息格式为 AiBridgeMessage
      const messages: AiBridgeMessage[] = options.messages.map(msg => ({
        role: msg.role as AiBridgeMessageRole,
        content: msg.content,
      }));

      // 通过统一AI Bridge调用（自动路由）
      const response = await unifiedAIBridge.chat({
        model: options.model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || options.max_tokens || 2000,
      });

      // 提取内容 - 统一格式
      const content = response.data?.content || response.data?.message || '';

      return {
        content,
        choices: [{
          index: 0,
          message: {
            role: MessageRole.ASSISTANT,
            content,
          },
        }],
        usage: response.data?.usage ? {
          promptTokens: response.data.usage.inputTokens,
          prompt_tokens: response.data.usage.inputTokens,
          completionTokens: response.data.usage.outputTokens,
          completion_tokens: response.data.usage.outputTokens,
          totalTokens: response.data.usage.totalTokens,
          total_tokens: response.data.usage.totalTokens,
        } : undefined,
      };
    } catch (error: any) {
      console.error('❌ [TextModelService] 聊天完成请求失败:', error.message);
      throw error;
    }
  }

  /**
   * 流式生成文本
   */
  async streamGenerateText(options: TextGenerationOptions): Promise<any> {
    console.log('🌊 [TextModelService] 流式生成文本');

    const messages: AiBridgeMessage[] = options.messages.map(msg => ({
      role: msg.role as AiBridgeMessageRole,
      content: msg.content,
    }));

    return unifiedAIBridge.streamChat({
      model: options.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || options.max_tokens || 2000,
    });
  }

  /**
   * 计算文本中的token数量
   */
  countTokens(text: string): number {
    // 简单估算：每4个字符约为1个token
    return Math.ceil(text.length / 4);
  }
}

// 创建单例并导出
const textModelService = new TextModelService();
export default textModelService;
export { textModelService };
