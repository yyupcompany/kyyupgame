/**
 * AI 课程生成服务 - 移动端优化版本
 * 使用统一AI Bridge和豆包 Think 1.6 模型生成课程代码
 *
 * @update 2026-01-03: 使用统一AI Bridge进行环境检测和路由
 */

import { aiRequest } from '../../../../../../../utils/request';
import { useUserStore } from '../../../../../../../stores/user';
import { AI_ENDPOINTS } from '../../../../../../../api/endpoints';
import { mobileAIBridge } from '../../../../../../../utils/mobile-ai-bridge';

export interface AICurriculumRequest {
  prompt: string;
  domain: string;
  ageGroup?: string;
  duration?: number;
}

export interface AICurriculumResponse {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  description: string;
  thinking?: string;
}

export interface AICurriculumStreamChunk {
  type: 'thinking' | 'content' | 'done';
  content?: string;
  thinking?: string;
  fullContent?: string;
  progress?: number;
}

class AICurriculumService {
  private modelName = 'doubao-seed-1-6-thinking-250615';
  private maxTokens = 16384; // 移动端降低token数量以提高响应速度

  /**
   * 调用 AI 生成课程代码
   * 移动端优化：使用统一AI Bridge，自动检测环境并路由
   */
  async generateCurriculumCode(request: AICurriculumRequest): Promise<AICurriculumResponse> {
    try {
      // ✅ 使用统一AI Bridge
      const envInfo = mobileAIBridge.getEnvironmentInfo();
      console.log('🔧 [AI课程服务] 使用统一AI Bridge', {
        environment: envInfo.environment,
        domain: request.domain
      });

      // 构建请求消息
      const messages = [
        {
          role: 'system' as const,
          content: this.buildSystemPrompt(request.domain, request.ageGroup)
        },
        {
          role: 'user' as const,
          content: this.buildUserPrompt(request)
        }
      ];

      // 调用统一AI Bridge
      const response = await mobileAIBridge.chat({
        model: this.modelName,
        messages: messages,
        temperature: 0.7,
        max_tokens: this.maxTokens
      });

      if (response.success && response.data?.content) {
        console.log('✅ [AI课程服务] 课程生成成功');
        return this.parseResponse({ data: response.data });
      } else {
        throw new Error(response.error || 'AI课程生成失败');
      }
    } catch (error) {
      frontendLogger.error('❌ AI 课程生成失败:', error);

      // 移动端优化：提供更友好的错误信息
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('生成超时，请检查网络连接后重试');
        }
        throw new Error(`AI 课程生成失败: ${error.message}`);
      }
      throw new Error('AI 课程生成失败，请重试');
    }
  }

  /**
   * 流式生成课程代码（移动端优化版本）
   * 支持进度跟踪和思考过程展示
   */
  async *generateCurriculumCodeStream(
    request: AICurriculumRequest
  ): AsyncGenerator<AICurriculumStreamChunk, void, unknown> {
    try {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        throw new Error('未找到认证令牌，请重新登录');
      }

      const systemPrompt = this.buildSystemPrompt(request.domain, request.ageGroup);
      const userPrompt = this.buildUserPrompt(request);

      const response = await fetch(AI_ENDPOINTS.CURRICULUM_GENERATE_STREAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: this.maxTokens,
          top_p: 0.9,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let buffer = '';
      let fullContent = '';
      let charCount = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          yield { type: 'done' };
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 解析SSE格式的数据
        while (true) {
          let sepIndex = buffer.indexOf('\n\n');
          if (sepIndex === -1) sepIndex = buffer.indexOf('\r\n\r\n');
          if (sepIndex === -1) break;

          const eventBlock = buffer.slice(0, sepIndex);
          const sepSlice = buffer.slice(sepIndex, sepIndex + 4);
          const consumed = sepSlice.startsWith('\r\n') ? 4 : 2;
          buffer = buffer.slice(sepIndex + consumed);

          const lines = eventBlock.split(/\r?\n/);
          const dataLines = lines
            .filter(l => /^\s*data:\s*/.test(l))
            .map(l => l.replace(/^\s*data:\s*/, ''));

          if (dataLines.length === 0) continue;

          let normalizedPayload = dataLines.join('').trim();
          while (normalizedPayload.startsWith('data:')) {
            normalizedPayload = normalizedPayload.substring(5).trim();
          }

          if (normalizedPayload === '[DONE]') {
            yield { type: 'done' };
            return;
          }

          try {
            const evt = JSON.parse(normalizedPayload);

            // 处理思考过程
            if (evt.type === 'thinking' && typeof evt.thinking === 'string') {
              yield {
                type: 'thinking',
                thinking: evt.thinking,
                progress: Math.min(15, charCount / 100)
              };
              continue;
            }

            // 处理内容生成
            if (evt.type === 'content') {
              if (evt.fullContent && evt.fullContent.trim().length > 0) {
                fullContent = evt.fullContent;
                charCount = fullContent.length;
              } else if (evt.content) {
                fullContent += evt.content;
                charCount += evt.content.length;
              }

              // 计算进度（简化版）
              const progress = Math.min(95, (charCount / 2000) * 100);

              yield {
                type: 'content',
                content: evt.content || '',
                fullContent,
                progress
              };
            } else if (evt.choices?.[0]?.delta?.content) {
              const content = evt.choices[0].delta.content;
              fullContent += content;
              charCount += content.length;

              const progress = Math.min(95, (charCount / 2000) * 100);

              yield {
                type: 'content',
                content,
                fullContent,
                progress
              };
            }
          } catch (e) {
            frontendLogger.warn('⚠️ 解析流式数据失败:', e);
          }
        }
      }
    } catch (error) {
      frontendLogger.error('❌ AI 流式生成失败:', error);
      throw new Error('AI 流式生成失败');
    }
  }

  /**
   * 构建系统提示词 - 移动端优化版本
   */
  private buildSystemPrompt(domain: string, ageGroup?: string): string {
    const domainDescriptions: Record<string, string> = {
      health: '健康领域 - 关注幼儿身体健康、运动能力和卫生习惯',
      language: '语言领域 - 关注幼儿语言表达、理解和沟通能力',
      social: '社会领域 - 关注幼儿社交能力、情感发展和人际关系',
      science: '科学领域 - 关注幼儿科学探索、观察和实验能力',
      art: '艺术领域 - 关注幼儿创意表达、审美和艺术欣赏能力'
    };

    const ageDescription = ageGroup ? `年龄段：${ageGroup}` : '年龄段：3-6岁';

    return `你是一位专业的幼儿园课程设计师，擅长创建互动式、趣味性强的幼儿教育课程。

课程领域：${domainDescriptions[domain] || '通用领域'}
${ageDescription}

你需要生成一个完整的、可交互的 HTML/CSS/JavaScript 课程。

移动端优化要求：
1. 代码必须是完整的、可直接运行的
2. 界面要色彩鲜艳、吸引幼儿注意力
3. 交互要简单直观、适合幼儿操作
4. 支持触摸操作和移动设备
5. 响应式设计，适配不同屏幕尺寸
6. 优化性能，快速加载
7. 包含教学目标和学习要点
8. 代码要有详细注释

返回格式必须是 JSON，包含以下字段：
{
  "htmlCode": "完整的 HTML 代码",
  "cssCode": "完整的 CSS 代码",
  "jsCode": "完整的 JavaScript 代码",
  "description": "课程描述和教学建议",
  "thinking": "设计思路和考虑因素"
}`;
  }

  /**
   * 构建用户提示词
   */
  private buildUserPrompt(request: AICurriculumRequest): string {
    return `请根据以下要求生成一个幼儿园移动端课程：

提示词：${request.prompt}

课程领域：${request.domain}
${request.ageGroup ? `年龄段：${request.ageGroup}` : ''}
${request.duration ? `课程时长：${request.duration}分钟` : ''}

移动端特别要求：
- 适配触摸操作
- 响应式布局
- 优化性能和加载速度

请确保返回的是有效的 JSON 格式。`;
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(data: any): AICurriculumResponse {
    try {
      let content = data.content || data.message?.content || data;

      if (typeof content === 'string') {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = JSON.parse(jsonMatch[0]);
        }
      }

      return {
        htmlCode: content.htmlCode || '',
        cssCode: content.cssCode || '',
        jsCode: content.jsCode || '',
        description: content.description || '',
        thinking: content.thinking || ''
      };
    } catch (error) {
      frontendLogger.error('❌ 解析 AI 响应失败:', error);
      throw new Error('解析 AI 响应失败');
    }
  }

  /**
   * 移动端优化：快速生成简化版本
   * 用于网络较差或需要快速响应的场景
   */
  async generateSimpleCurriculum(request: AICurriculumRequest): Promise<AICurriculumResponse> {
    try {
      const simplifiedRequest = {
        ...request,
        prompt: request.prompt + ' (请生成简化版本，适合快速预览)'
      };

      const response = await aiRequest.post(
        `/ai/curriculum/generate-simple`,
        {
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: this.buildSimpleSystemPrompt(request.domain)
            },
            {
              role: 'user',
              content: `请生成简化版幼儿园课程：${simplifiedRequest.prompt}`
            }
          ],
          temperature: 0.8,
          max_tokens: 4096, // 进一步降低token数量
          top_p: 0.9
        },
        {
          timeout: 30000 // 30秒超时
        }
      );

      return this.parseResponse(response.data);
    } catch (error) {
      frontendLogger.error('❌ 简化课程生成失败:', error);
      throw new Error('简化课程生成失败');
    }
  }

  /**
   * 构建简化版系统提示词
   */
  private buildSimpleSystemPrompt(domain: string): string {
    return `生成一个简化版幼儿园${domain}课程。
要求：
1. 基础的HTML结构
2. 简单的CSS样式
3. 基础的JavaScript交互
4. 适合移动设备
5. 快速加载

返回JSON格式：{
  "htmlCode": "HTML代码",
  "cssCode": "CSS代码",
  "jsCode": "JavaScript代码",
  "description": "课程描述"
}`;
  }

  /**
   * 移动端优化：检查网络状态
   */
  checkNetworkStatus(): { isOnline: boolean; connectionType: string; isSlowConnection: boolean } {
    if (typeof navigator === 'undefined') {
      return { isOnline: true, connectionType: 'unknown', isSlowConnection: false };
    }

    const isOnline = navigator.onLine;
    let connectionType = 'unknown';
    let isSlowConnection = false;

    // @ts-ignore
    if (navigator.connection) {
      // @ts-ignore
      connectionType = navigator.connection.effectiveType || 'unknown';
      // @ts-ignore
      isSlowConnection = ['slow-2g', '2g', '3g'].includes(connectionType);
    }

    return { isOnline, connectionType, isSlowConnection };
  }

  /**
   * 移动端优化：根据网络状态选择生成策略
   */
  async generateWithNetworkOptimization(request: AICurriculumRequest): Promise<AICurriculumResponse> {
    const networkStatus = this.checkNetworkStatus();

    if (!networkStatus.isOnline) {
      throw new Error('网络连接不可用，请检查网络设置');
    }

    if (networkStatus.isSlowConnection) {
      console.log('🐌 检测到慢速网络，使用简化生成模式');
      return this.generateSimpleCurriculum(request);
    }

    return this.generateCurriculumCode(request);
  }
}

export const aiCurriculumService = new AICurriculumService();