/**
 * AI 课程生成服务
 * 使用豆包 Think 1.6 模型生成课程代码
 */

import { aiRequest } from '../../../../utils/request';
import { useUserStore } from '../../../../stores/user';

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

class AICurriculumService {
  private modelName = 'doubao-seed-1-6-thinking-250615';
  private maxTokens = 20000;

  /**
   * 调用 AI 生成课程代码
   * 使用豆包 Think 1.6 模型
   * 通过后端 AIBridge 服务调用
   */
  async generateCurriculumCode(request: AICurriculumRequest): Promise<AICurriculumResponse> {
    try {
      // 构建系统提示词
      const systemPrompt = this.buildSystemPrompt(request.domain, request.ageGroup);

      // 构建用户提示词
      const userPrompt = this.buildUserPrompt(request);

      // 调用后端 API - 通过后端的 AIBridge 服务
      // 后端会处理认证、模型配置和 API 调用
      const response = await aiRequest.post(
        `/ai/curriculum/generate`,  // 相对于 baseURL '/api'，完整路由是 /api/ai/curriculum/generate
        {
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: this.maxTokens,
          top_p: 0.9
        },
        {
          timeout: 120000 // 120 秒超时，AI 生成可能需要较长时间
        }
      );

      // 解析响应
      return this.parseResponse(response.data);
    } catch (error) {
      console.error('❌ AI 课程生成失败:', error);
      // 提供更详细的错误信息
      if (error instanceof Error) {
        throw new Error(`AI 课程生成失败: ${error.message}`);
      }
      throw new Error('AI 课程生成失败，请重试');
    }
  }

  /**
   * 构建系统提示词
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

要求：
1. 代码必须是完整的、可直接运行的
2. 界面要色彩鲜艳、吸引幼儿注意力
3. 交互要简单直观、适合幼儿操作
4. 包含教学目标和学习要点
5. 代码要有详细注释

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
    return `请根据以下要求生成一个幼儿园课程：

提示词：${request.prompt}

课程领域：${request.domain}
${request.ageGroup ? `年龄段：${request.ageGroup}` : ''}
${request.duration ? `课程时长：${request.duration}分钟` : ''}

请生成完整的、可交互的课程代码。`;
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(data: any): AICurriculumResponse {
    try {
      // 如果响应是字符串，尝试解析 JSON
      let content = data.content || data.message?.content || data;
      
      if (typeof content === 'string') {
        // 尝试从字符串中提取 JSON
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
      console.error('❌ 解析 AI 响应失败:', error);
      throw new Error('解析 AI 响应失败');
    }
  }

  /**
   * 流式生成课程代码（用于打字效果）
   */
  async *generateCurriculumCodeStream(
    req: AICurriculumRequest
  ): AsyncGenerator<string, void, unknown> {
    try {
      const systemPrompt = this.buildSystemPrompt(req.domain, req.ageGroup);
      const userPrompt = this.buildUserPrompt(req);

      const response = await aiRequest.post(
        `/ai/curriculum/generate-stream`,
        {
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: this.maxTokens,
          top_p: 0.9,
          stream: true
        },
        {
          timeout: 60000,
          responseType: 'stream'
        }
      );

      // 处理流式响应
      for await (const chunk of response.data) {
        const text = chunk.toString();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('❌ AI 流式生成失败:', error);
      throw new Error('AI 流式生成失败');
    }
  }
}

export const aiCurriculumService = new AICurriculumService();

