/**
 * 统一AI控制器
 * 通过统一租户中心提供AI服务
 */

import { Request, Response } from 'express';
import unifiedTenantAIService from '../services/unified-tenant-ai.service';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * 统一AI控制器类
 */
export class UnifiedAIController {
  /**
   * 获取可用AI模型列表
   */
  static async getAvailableModels(req: Request, res: Response) {
    try {
      const { activeOnly = 'true' } = req.query;

      const models = await unifiedTenantAIService.getAvailableModels(
        activeOnly === 'true'
      );

      return ApiResponse.success(res, models, '获取AI模型列表成功');
    } catch (error: any) {
      logger.error('获取AI模型列表失败', error);
      return ApiResponse.error(
        res,
        error.message || '获取AI模型列表失败',
        'AI_MODELS_FETCH_FAILED'
      );
    }
  }

  /**
   * 获取AI模型详情
   */
  static async getModelById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const model = await unifiedTenantAIService.getModelById(id);

      if (!model) {
        return ApiResponse.notFound(res, 'AI模型不存在');
      }

      return ApiResponse.success(res, model, '获取AI模型详情成功');
    } catch (error: any) {
      logger.error('获取AI模型详情失败', error);
      return ApiResponse.error(
        res,
        error.message || '获取AI模型详情失败',
        'AI_MODEL_FETCH_FAILED'
      );
    }
  }

  /**
   * AI文本生成
   */
  static async generateText(req: Request, res: Response) {
    try {
      const { modelId, messages, prompt, maxTokens, temperature, stream } = req.body;

      if (!modelId) {
        return ApiResponse.error(res, '模型ID不能为空', 'MISSING_MODEL_ID');
      }

      if (!messages && !prompt) {
        return ApiResponse.error(res, '消息或提示词不能为空', 'MISSING_CONTENT');
      }

      const params = {
        modelId,
        messages: messages || [{ role: 'user', content: prompt }],
        maxTokens,
        temperature,
        stream: stream || false
      };

      const result = await unifiedTenantAIService.generateText(params);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.error || 'AI文本生成失败',
          'AI_TEXT_GENERATION_FAILED'
        );
      }

      return ApiResponse.success(res, { ...result.data, usage: result.usage }, 'AI文本生成成功');
    } catch (error: any) {
      logger.error('AI文本生成失败', error);
      return ApiResponse.error(
        res,
        error.message || 'AI文本生成失败',
        'AI_TEXT_GENERATION_FAILED'
      );
    }
  }

  /**
   * AI图像生成
   */
  static async generateImage(req: Request, res: Response) {
    try {
      const { prompt, modelId, size = '1024x1024', quality = 'standard' } = req.body;

      if (!prompt) {
        return ApiResponse.error(res, '图像描述不能为空', 'MISSING_PROMPT');
      }

      const params = {
        prompt,
        modelId,
        size,
        quality
      };

      const result = await unifiedTenantAIService.generateImage(params);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.error || 'AI图像生成失败',
          'AI_IMAGE_GENERATION_FAILED'
        );
      }

      return ApiResponse.success(res, { ...result.data, usage: result.usage }, 'AI图像生成成功');
    } catch (error: any) {
      logger.error('AI图像生成失败', error);
      return ApiResponse.error(
        res,
        error.message || 'AI图像生成失败',
        'AI_IMAGE_GENERATION_FAILED'
      );
    }
  }

  /**
   * AI语音合成
   */
  static async synthesizeSpeech(req: Request, res: Response) {
    try {
      const { text, modelId, voice = 'alloy', speed = 1.0 } = req.body;

      if (!text) {
        return ApiResponse.error(res, '文本内容不能为空', 'MISSING_TEXT');
      }

      const params = {
        text,
        modelId,
        voice,
        speed
      };

      const result = await unifiedTenantAIService.synthesizeSpeech(params);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.error || 'AI语音合成失败',
          'AI_SPEECH_SYNTHESIS_FAILED'
        );
      }

      return ApiResponse.success(res, { ...result.data, usage: result.usage }, 'AI语音合成成功');
    } catch (error: any) {
      logger.error('AI语音合成失败', error);
      return ApiResponse.error(
        res,
        error.message || 'AI语音合成失败',
        'AI_SPEECH_SYNTHESIS_FAILED'
      );
    }
  }

  /**
   * 获取AI使用统计
   */
  static async getUsageStats(req: Request, res: Response) {
    try {
      const { start, end } = req.query;

      const period = start || end ? {
        start: start as string,
        end: end as string
      } : undefined;

      const stats = await unifiedTenantAIService.getUsageStats(period);

      if (!stats) {
        return ApiResponse.error(res, '获取使用统计失败', 'USAGE_STATS_FETCH_FAILED');
      }

      return ApiResponse.success(res, stats, '获取AI使用统计成功');
    } catch (error: any) {
      logger.error('获取AI使用统计失败', error);
      return ApiResponse.error(
        res,
        error.message || '获取AI使用统计失败',
        'USAGE_STATS_FETCH_FAILED'
      );
    }
  }

  /**
   * AI服务健康检查
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      const isHealthy = await unifiedTenantAIService.healthCheck();

      return ApiResponse.success(res, {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'unified-tenant-ai'
      }, 'AI服务健康检查完成');
    } catch (error: any) {
      logger.error('AI服务健康检查失败', error);
      return ApiResponse.error(
        res,
        error.message || 'AI服务健康检查失败',
        'AI_HEALTH_CHECK_FAILED'
      );
    }
  }

  /**
   * 批量获取模型信息
   */
  static async batchGetModels(req: Request, res: Response) {
    try {
      const { modelIds } = req.body;

      if (!Array.isArray(modelIds) || modelIds.length === 0) {
        return ApiResponse.error(res, '模型ID列表不能为空', 'MISSING_MODEL_IDS');
      }

      const models = await unifiedTenantAIService.batchGetModels(modelIds);

      return ApiResponse.success(res, models, '批量获取模型信息成功');
    } catch (error: any) {
      logger.error('批量获取模型信息失败', error);
      return ApiResponse.error(
        res,
        error.message || '批量获取模型信息失败',
        'BATCH_MODELS_FETCH_FAILED'
      );
    }
  }

  /**
   * 获取模型使用限制
   */
  static async getModelLimits(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const limits = await unifiedTenantAIService.getModelLimits(id);

      if (!limits) {
        return ApiResponse.error(res, '获取模型限制失败', 'MODEL_LIMITS_FETCH_FAILED');
      }

      return ApiResponse.success(res, limits, '获取模型使用限制成功');
    } catch (error: any) {
      logger.error('获取模型使用限制失败', error);
      return ApiResponse.error(
        res,
        error.message || '获取模型使用限制失败',
        'MODEL_LIMITS_FETCH_FAILED'
      );
    }
  }

  /**
   * 新媒体中心文案生成
   */
  static async generateMarketingCopy(req: Request, res: Response) {
    try {
      const { type, target, requirements, modelId } = req.body;

      if (!type || !target) {
        return ApiResponse.error(
          res,
          '文案类型和目标受众不能为空',
          'MISSING_REQUIRED_FIELDS'
        );
      }

      // 构建专业的提示词
      const prompt = `请为幼儿园的${type}生成营销文案，目标受众是${target}。

要求：
${requirements ? requirements + '\n' : ''}

请生成专业、吸引人且符合教育行业规范的营销文案。`;

      const params = {
        modelId: modelId || 'doubao-pro-128k',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        maxTokens: 1000
      };

      const result = await unifiedTenantAIService.generateText(params);

      if (!result.success) {
        return ApiResponse.error(
          res,
          result.error || '文案生成失败',
          'COPY_GENERATION_FAILED'
        );
      }

      return ApiResponse.success(res, {
        copy: result.data.content || result.data.choices?.[0]?.message?.content,
        type,
        target,
        requirements,
        usage: result.usage
      }, '营销文案生成成功');
    } catch (error: any) {
      logger.error('营销文案生成失败', error);
      return ApiResponse.error(
        res,
        error.message || '营销文案生成失败',
        'COPY_GENERATION_FAILED'
      );
    }
  }
}

export default UnifiedAIController;