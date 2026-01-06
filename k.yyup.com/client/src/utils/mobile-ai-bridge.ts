/**
 * 移动端统一AI Bridge客户端
 *
 * 功能：
 * 1. 自动检测运行环境（本地/租户）
 * 2. 根据环境路由AI调用（本地AI Bridge / 统一认证AI Bridge）
 * 3. 提供统一的接口规范
 *
 * 环境规则：
 * - localhost / 127.0.0.1 / k.yyup.cc / k.yyup.com → 本地AI Bridge (开发/Demo)
 * - k001.yyup.cc / k002.yyup.cc → 统一认证AI Bridge (租户)
 *
 * @author Claude Code
 * @date 2026-01-03
 */

import request, { aiRequest } from './request';

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

// ==================== 环境检测 ====================

/**
 * 环境类型
 */
type EnvironmentType = 'local' | 'tenant';

/**
 * 检测当前运行环境
 */
function detectEnvironment(): EnvironmentType {
  // 客户端环境检测
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // 本地环境
    if (hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === 'k.yyup.cc' ||
        hostname === 'k.yyup.com' ||
        hostname.includes('localhost')) {
      console.log('🔧 [MobileAIBridge] 检测到本地环境:', hostname);
      return 'local';
    }

    // 租户环境 - 匹配 k001.yyup.cc 格式
    const tenantMatch = hostname.match(/^k\d+\.yyup\.cc$/);
    if (tenantMatch) {
      console.log('🏢 [MobileAIBridge] 检测到租户环境:', hostname);
      return 'tenant';
    }

    // 默认使用本地环境
    console.log('⚠️ [MobileAIBridge] 未识别的环境，使用本地环境:', hostname);
    return 'local';
  }

  // 服务端环境检测
  return 'local';
}

// ==================== AI Bridge 服务类 ====================

/**
 * 移动端统一AI Bridge服务
 */
class MobileAIBridge {
  private environment: EnvironmentType;
  private apiBaseUrl: string;

  constructor() {
    this.environment = detectEnvironment();
    this.apiBaseUrl = this.getApiBaseUrl();
    console.log('✅ [MobileAIBridge] 初始化完成', {
      environment: this.environment,
      apiBaseUrl: this.apiBaseUrl
    });
  }

  /**
   * 获取API基础URL
   */
  private getApiBaseUrl(): string {
    if (this.environment === 'tenant') {
      // 租户环境：使用统一认证AI Bridge
      return '/api/ai-bridge';
    } else {
      // 本地环境：使用本地AI服务
      return '/api/ai';
    }
  }

  /**
   * 发送聊天请求
   */
  async chat(request: UnifiedChatRequest): Promise<UnifiedChatResponse> {
    try {
      console.log('📤 [MobileAIBridge] 发送聊天请求', {
        environment: this.environment,
        endpoint: `${this.apiBaseUrl}/chat`
      });

      const response = await aiRequest.post(
        `${this.apiBaseUrl}/chat`,
        request,
        {
          timeout: 120000 // 2分钟超时
        }
      );

      console.log('📥 [MobileAIBridge] 收到响应', {
        success: response.data?.success
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [MobileAIBridge] 聊天请求失败', error);

      return {
        success: false,
        error: error.message || 'AI聊天请求失败'
      };
    }
  }

  /**
   * 流式聊天请求
   */
  async chatStream(
    request: UnifiedChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      console.log('📤 [MobileAIBridge] 发送流式聊天请求', {
        environment: this.environment,
        endpoint: `${this.apiBaseUrl}/chat/stream`
      });

      const response = await fetch(`${this.apiBaseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kindergarten_token') || ''}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('✅ [MobileAIBridge] 流式响应完成');
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // 处理SSE格式数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              console.warn('解析SSE数据失败:', data);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('❌ [MobileAIBridge] 流式聊天请求失败', error);
      onError(error.message || 'AI流式聊天请求失败');
    }
  }

  /**
   * 生成图片
   */
  async generateImage(request: UnifiedImageGenerateRequest): Promise<UnifiedImageGenerateResponse> {
    try {
      console.log('📤 [MobileAIBridge] 发送图片生成请求', {
        environment: this.environment,
        endpoint: `${this.apiBaseUrl}/generate-image`
      });

      const response = await aiRequest.post(
        `${this.apiBaseUrl}/generate-image`,
        request,
        {
          timeout: 180000 // 3分钟超时
        }
      );

      console.log('📥 [MobileAIBridge] 收到图片生成响应', {
        success: response.data?.success,
        imageCount: response.data?.data?.images?.length
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [MobileAIBridge] 图片生成失败', error);

      return {
        success: false,
        error: error.message || 'AI图片生成失败'
      };
    }
  }

  /**
   * 课程生成（移动端专用）
   */
  async generateCurriculum(
    request: {
      prompt: string;
      domain: string;
      ageGroup?: string;
      duration?: number;
    }
  ): Promise<any> {
    try {
      console.log('📤 [MobileAIBridge] 发送课程生成请求', {
        environment: this.environment
      });

      const systemPrompt = this.buildCurriculumSystemPrompt(request.domain, request.ageGroup);
      const userPrompt = request.prompt;

      const chatRequest: UnifiedChatRequest = {
        model: 'doubao-seed-1-6-thinking-250615',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 16384
      };

      return await this.chat(chatRequest);
    } catch (error: any) {
      console.error('❌ [MobileAIBridge] 课程生成失败', error);

      return {
        success: false,
        error: error.message || 'AI课程生成失败'
      };
    }
  }

  /**
   * 构建课程生成系统提示词
   */
  private buildCurriculumSystemPrompt(domain: string, ageGroup?: string): string {
    let prompt = `你是一个专业的幼儿园课程设计专家，擅长设计${domain}领域的互动课程。`;

    if (ageGroup) {
      prompt += `\n目标年龄段：${ageGroup}`;
    }

    prompt += `\n\n请生成一个包含以下内容的课程代码：
1. HTML结构代码
2. CSS样式代码
3. JavaScript交互代码
4. 课程说明文档

要求：
- 代码完整可运行
- 适合幼儿园儿童操作
- 界面友好、色彩鲜艳
- 包含适当的动画效果
- 教育意义明确

请以JSON格式返回，包含以下字段：
{
  "htmlCode": "HTML代码",
  "cssCode": "CSS代码",
  "jsCode": "JavaScript代码",
  "description": "课程说明"
}`;

    return prompt;
  }

  /**
   * 获取当前环境信息
   */
  getEnvironmentInfo() {
    return {
      environment: this.environment,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      apiBaseUrl: this.apiBaseUrl
    };
  }

  /**
   * 重新检测环境
   */
  refreshEnvironment() {
    this.environment = detectEnvironment();
    this.apiBaseUrl = this.getApiBaseUrl();
    console.log('🔄 [MobileAIBridge] 环境已刷新', {
      environment: this.environment,
      apiBaseUrl: this.apiBaseUrl
    });
  }
}

// ==================== 导出单例 ====================

/**
 * 移动端AI Bridge单例
 */
export const mobileAIBridge = new MobileAIBridge();

/**
 * 导出类（用于创建多个实例）
 */
export { MobileAIBridge };

// ==================== 便捷函数 ====================

/**
 * 发送聊天请求（便捷函数）
 */
export async function mobileAIChat(request: UnifiedChatRequest): Promise<UnifiedChatResponse> {
  return mobileAIBridge.chat(request);
}

/**
 * 生成图片（便捷函数）
 */
export async function mobileAIGenerateImage(request: UnifiedImageGenerateRequest): Promise<UnifiedImageGenerateResponse> {
  return mobileAIBridge.generateImage(request);
}

/**
 * 获取环境信息（便捷函数）
 */
export function getMobileAIEnvironment() {
  return mobileAIBridge.getEnvironmentInfo();
}
