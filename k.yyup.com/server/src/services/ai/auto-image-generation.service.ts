/**
 * 自动图片生成服务
 * 通过统一租户系统调用AI图片生成
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';

// 图片生成请求参数
export interface ImageGenerationRequest {
  prompt: string;
  category?: 'activity' | 'poster' | 'template' | 'marketing' | 'education';
  style?: 'natural' | 'cartoon' | 'realistic' | 'artistic';
  size?: '512x512' | '1024x1024' | '1024x768' | '768x1024';
  quality?: 'standard' | 'hd';
  watermark?: boolean;
}

// 图片生成结果
export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  usage?: {
    model?: string;
    tokens?: number;
    generated_images?: number;
  };
  metadata?: {
    prompt: string;
    style?: string;
    size?: string;
    quality?: string;
    generatedAt: string;
  };
}

// 服务状态
export interface ServiceStatus {
  available: boolean;
  provider: string;
  message: string;
}

export class AutoImageGenerationService {
  /**
   * 生成单张图片
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    console.log('🖼️ [自动配图服务] 生成图片请求', { category: request.category, style: request.style });

    try {
      const enhancedPrompt = this.buildEnhancedPrompt(request);

      const result = await unifiedAIBridge.generateImage({
        prompt: enhancedPrompt,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        style: request.style,
      });

      // 获取第一个生成的图片
      const imageData = result.data?.images?.[0];
      const imageUrl = imageData?.url;

      if (result.success && imageUrl) {
        return {
          success: true,
          imageUrl: imageUrl,
          thumbnailUrl: imageUrl,
          usage: {
            model: result.data?.usage ? 'dall-e' : undefined,
            tokens: result.data?.usage?.totalTokens || 0,
            generated_images: 1,
          },
          metadata: {
            prompt: enhancedPrompt,
            style: request.style,
            size: request.size,
            quality: request.quality,
            generatedAt: new Date().toISOString(),
          },
        };
      }

      return { success: false, error: result.error || '图片生成失败' };
    } catch (error: any) {
      console.error('❌ [自动配图服务] 图片生成失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 为活动生成配图
   */
  async generateActivityImage(
    activityTitle: string,
    activityDescription: string,
    options?: { style?: string; size?: string }
  ): Promise<ImageGenerationResult> {
    console.log('🎨 [自动配图服务] 为活动生成配图:', activityTitle);

    const prompt = `
幼儿园活动海报背景图，活动主题：${activityTitle}。
活动描述：${activityDescription}。
风格要求：温馨、活泼、适合家长和儿童观看，色彩明亮，
适合放置文字和二维码，专业设计质量。
`.trim();

    return this.generateImage({
      prompt,
      category: 'activity',
      style: (options?.style as any) || 'natural',
      size: (options?.size as any) || '1024x768',
      quality: 'hd',
    });
  }

  /**
   * 为海报生成配图
   */
  async generatePosterImage(
    posterTitle: string,
    posterContent: string,
    options?: { style?: string; size?: string; quality?: string }
  ): Promise<ImageGenerationResult> {
    console.log('📋 [自动配图服务] 为海报生成配图:', posterTitle);

    const prompt = `
专业宣传海报背景图，主题：${posterTitle}。
内容描述：${posterContent}。
设计风格：现代、专业，留有足够空白区域用于文字排版，
高品质渲染，适合打印和数字展示。
`.trim();

    return this.generateImage({
      prompt,
      category: 'poster',
      style: (options?.style as any) || 'realistic',
      size: (options?.size as any) || '1024x768',
      quality: (options?.quality as any) || 'hd',
    });
  }

  /**
   * 为模板生成配图
   */
  async generateTemplateImage(
    templateName: string,
    templateDescription: string,
    templateData?: any
  ): Promise<ImageGenerationResult> {
    console.log('📝 [自动配图服务] 为模板生成配图:', templateName);

    const dataContext = templateData ? JSON.stringify(templateData).substring(0, 200) : '';
    const prompt = `
模板配图，模板名称：${templateName}。
模板描述：${templateDescription}。
${dataContext ? `相关数据：${dataContext}` : ''}
风格要求：简洁、现代、专业，适合作为模板背景或配图。
`.trim();

    return this.generateImage({
      prompt,
      category: 'template',
      style: 'realistic',
      size: '1024x1024',
      quality: 'standard',
    });
  }

  /**
   * 批量生成图片
   */
  async generateBatchImages(requests: ImageGenerationRequest[]): Promise<ImageGenerationResult[]> {
    console.log('📦 [自动配图服务] 批量生成图片，数量:', requests.length);

    const results = await Promise.all(
      requests.map(request => this.generateImage(request))
    );
    return results;
  }

  /**
   * 检查服务状态
   */
  async checkServiceStatus(): Promise<ServiceStatus> {
    try {
      // 尝试获取模型列表来验证服务是否可用
      const models = await unifiedAIBridge.getModels();
      return {
        available: true,
        provider: '统一租户系统',
        message: `服务正常，可用模型数量：${models?.length || 0}`,
      };
    } catch (error: any) {
      return {
        available: false,
        provider: '统一租户系统',
        message: `服务不可用：${error.message}`,
      };
    }
  }

  /**
   * 构建增强的提示词
   */
  private buildEnhancedPrompt(request: ImageGenerationRequest): string {
    let prompt = request.prompt;

    // 根据分类添加上下文
    const categoryContext: Record<string, string> = {
      activity: '幼儿园活动场景，温馨活泼，适合家庭观看。',
      poster: '专业宣传海报，现代简洁，留有文字排版空间。',
      template: '通用模板背景，简洁专业，适合多种用途。',
      marketing: '营销推广素材，吸引眼球，强调重点。',
      education: '教育主题，知识性强，生动有趣。',
    };

    // 根据风格添加描述
    const styleContext: Record<string, string> = {
      natural: '自然风格，真实质感。',
      cartoon: '卡通风格，可爱活泼。',
      realistic: '写实风格，专业品质。',
      artistic: '艺术风格，创意独特。',
    };

    if (request.category && categoryContext[request.category]) {
      prompt = `${prompt}。${categoryContext[request.category]}`;
    }

    if (request.style && styleContext[request.style]) {
      prompt = `${prompt}。${styleContext[request.style]}`;
    }

    // 添加质量要求
    if (request.quality === 'hd') {
      prompt = `${prompt}。高清画质，细节丰富。`;
    }

    return prompt;
  }
}

export const autoImageGenerationService = new AutoImageGenerationService();
export default autoImageGenerationService;

