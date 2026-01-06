/**
 * 自动配图控制器
 * 处理AI自动生成图像的API请求
 */

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import autoImageGenerationService, { ImageGenerationRequest } from '../services/ai/auto-image-generation.service';
import { successResponse, errorResponse, ResponseHandler } from '../utils/response-handler';
import { logger } from '../utils/logger';

export class AutoImageController {
  /**
   * 生成单张图像
   */
  static async generateImage(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validation(res, '参数验证失败', errors.array());
      }

      const {
        prompt,
        category,
        style,
        size,
        quality,
        watermark
      } = req.body as ImageGenerationRequest;

      logger.info('收到图像生成请求', {
        userId: (req as any).user?.id,
        prompt,
        category,
        style
      });

      const result = await autoImageGenerationService.generateImage({
        prompt,
        category,
        style,
        size,
        quality,
        watermark
      });

      if (result.success) {
        return successResponse(res, {
          imageUrl: result.imageUrl,
          usage: result.usage,
          metadata: result.metadata
        }, '图像生成成功');
      } else {
        return errorResponse(res, result.error || '图像生成失败', 500);
      }

    } catch (error) {
      logger.error('图像生成控制器异常', { error });
      return errorResponse(res, '服务器内部错误');
    }
  }

  /**
   * 为活动生成配图
   */
  static async generateActivityImage(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validation(res, '参数验证失败', errors.array());
      }

      const { activityTitle, activityDescription } = req.body;

      logger.info('收到活动配图生成请求', {
        userId: (req as any).user?.id,
        activityTitle
      });

      const result = await autoImageGenerationService.generateActivityImage(
        activityTitle,
        activityDescription
      );

      if (result.success) {
        return successResponse(res, {
          imageUrl: result.imageUrl,
          usage: result.usage,
          metadata: result.metadata
        }, '活动配图生成成功');
      } else {
        return errorResponse(res, result.error || '活动配图生成失败', 500);
      }

    } catch (error) {
      logger.error('活动配图生成控制器异常', { error });
      return errorResponse(res, '服务器内部错误');
    }
  }

  /**
   * 为海报生成配图
   */
  static async generatePosterImage(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validation(res, '参数验证失败', errors.array());
      }

      const { posterTitle, posterContent, style, size, quality } = req.body;

      logger.info('收到海报配图生成请求', {
        userId: (req as any).user?.id,
        posterTitle,
        style
      });

      const result = await autoImageGenerationService.generatePosterImage(
        posterTitle,
        posterContent,
        { style, size, quality }
      );

      if (result.success) {
        return successResponse(res, {
          imageUrl: result.imageUrl,
          usage: result.usage,
          metadata: result.metadata
        }, '海报配图生成成功');
      } else {
        return errorResponse(res, result.error || '海报配图生成失败', 500);
      }

    } catch (error) {
      logger.error('海报配图生成控制器异常', { error });
      return errorResponse(res, '服务器内部错误');
    }
  }

  /**
   * 为模板生成配图 - 支持智能提示词生成
   */
  static async generateTemplateImage(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validation(res, '参数验证失败', errors.array());
      }

      const { templateName, templateDescription, templateData } = req.body;

      logger.info('收到模板配图生成请求', {
        userId: (req as any).user?.id,
        templateName,
        hasTemplateData: !!templateData
      });

      const result = await autoImageGenerationService.generateTemplateImage(
        templateName,
        templateDescription,
        templateData
      );

      if (result.success) {
        return successResponse(res, {
          imageUrl: result.imageUrl,
          usage: result.usage,
          metadata: result.metadata
        }, '模板配图生成成功');
      } else {
        return errorResponse(res, result.error || '模板配图生成失败', 500);
      }

    } catch (error) {
      logger.error('模板配图生成控制器异常', { error });
      return errorResponse(res, '服务器内部错误');
    }
  }

  /**
   * 批量生成图像
   */
  static async generateBatchImages(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validation(res, '参数验证失败', errors.array());
      }

      const { requests } = req.body;

      if (!Array.isArray(requests) || requests.length === 0) {
        return errorResponse(res, '请求列表不能为空', 400);
      }

      if (requests.length > 10) {
        return errorResponse(res, '批量生成最多支持10张图像', 400);
      }

      logger.info('收到批量图像生成请求', {
        userId: (req as any).user?.id,
        count: requests.length
      });

      const results = await autoImageGenerationService.generateBatchImages(requests);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return successResponse(res, {
        results,
        summary: {
          total: results.length,
          success: successCount,
          failure: failureCount
        }
      }, `批量生成完成，成功${successCount}张，失败${failureCount}张`);

    } catch (error) {
      logger.error('批量图像生成控制器异常', { error });
      return errorResponse(res, '服务器内部错误');
    }
  }

  /**
   * 检查服务状态
   */
  static async checkServiceStatus(req: Request, res: Response) {
    try {
      const status = await autoImageGenerationService.checkServiceStatus();

      return successResponse(res, status, '服务状态检查完成');

    } catch (error) {
      logger.error('服务状态检查异常', { error });
      return errorResponse(res, '服务状态检查失败');
    }
  }
}

// 验证规则
export const generateImageValidation = [
  body('prompt')
    .notEmpty()
    .withMessage('提示词不能为空')
    .isLength({ min: 1, max: 1000 })
    .withMessage('提示词长度应在1-1000字符之间'),
  body('category')
    .optional()
    .isIn(['activity', 'poster', 'template', 'marketing', 'education'])
    .withMessage('分类必须是有效值'),
  body('style')
    .optional()
    .isIn(['natural', 'cartoon', 'realistic', 'artistic'])
    .withMessage('风格必须是有效值'),
  body('size')
    .optional()
    .isIn(['512x512', '1024x1024', '1024x768', '768x1024', '1920x1920', '2048x2048', '1920x1080', '2560x1440'])
    .withMessage('尺寸必须是有效值'),
  body('quality')
    .optional()
    .isIn(['standard', 'hd'])
    .withMessage('质量必须是有效值'),
  body('watermark')
    .optional()
    .isBoolean()
    .withMessage('水印设置必须是布尔值')
];

export const generateActivityImageValidation = [
  body('activityTitle')
    .notEmpty()
    .withMessage('活动标题不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('活动标题长度应在1-100字符之间'),
  body('activityDescription')
    .notEmpty()
    .withMessage('活动描述不能为空')
    .isLength({ min: 1, max: 500 })
    .withMessage('活动描述长度应在1-500字符之间')
];

export const generatePosterImageValidation = [
  body('posterTitle')
    .notEmpty()
    .withMessage('海报标题不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('海报标题长度应在1-100字符之间'),
  body('posterContent')
    .notEmpty()
    .withMessage('海报内容不能为空')
    .isLength({ min: 1, max: 500 })
    .withMessage('海报内容长度应在1-500字符之间')
];

export const generateTemplateImageValidation = [
  body('templateName')
    .notEmpty()
    .withMessage('模板名称不能为空')
    .isLength({ min: 1, max: 100 })
    .withMessage('模板名称长度应在1-100字符之间'),
  body('templateDescription')
    .notEmpty()
    .withMessage('模板描述不能为空')
    .isLength({ min: 1, max: 500 })
    .withMessage('模板描述长度应在1-500字符之间')
];

export const generateBatchImagesValidation = [
  body('requests')
    .isArray({ min: 1, max: 10 })
    .withMessage('请求列表必须是1-10个元素的数组'),
  body('requests.*.prompt')
    .notEmpty()
    .withMessage('每个请求的提示词不能为空')
    .isLength({ min: 1, max: 1000 })
    .withMessage('提示词长度应在1-1000字符之间')
];
