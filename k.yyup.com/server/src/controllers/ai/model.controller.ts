import { Request, Response, NextFunction } from 'express';
import modelService from '../../services/ai/model.service';
import { ModelType, ModelStatus } from '../../models/ai-model-config.model';
import { ApiError } from '../../utils/apiError';

/**
 * @openapi
 * tags:
 *   name: AI模型
 *   description: 管理AI系统支持的模型配置和计费规则
 */

/**
 * AI模型控制器
 * 负责处理模型配置和计费相关的HTTP请求
 */
export class ModelController {
  private modelService = modelService;

  /**
   * @openapi
   * /api/v1/ai/models:
   *   get:
   *     summary: 获取可用模型列表
   *     description: 获取系统中所有可用的AI模型配置，支持按类型和状态过滤
   *     tags:
   *       - AI模型
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [text, speech, image, video, multimodal]
   *         description: 模型类型过滤
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, inactive, testing]
   *         description: 模型状态过滤，默认只返回active状态
   *     responses:
   *       200:
   *         description: 成功获取模型列表
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/ModelConfig'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public listModels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, status } = req.query;
      const filters = {
        modelType: type as ModelType | undefined,
        status: status as ModelStatus | undefined,
      };
      const models = await this.modelService.getModels();
      res.status(200).json(models);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @openapi
   * /api/v1/ai/models/default:
   *   get:
   *     summary: 获取默认AI模型
   *     description: 获取系统设置的默认AI模型配置，如果没有设置默认模型则返回第一个可用模型
   *     tags:
   *       - AI模型
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 成功获取默认模型
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ModelConfig'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: 没有可用的AI模型
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 404
   *                 message:
   *                   type: string
   *                   example: 没有可用的AI模型
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public getDefaultModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const defaultModel = await this.modelService.getDefaultModel();
      res.status(200).json(defaultModel);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @openapi
   * /api/v1/ai/models/{modelId}/billing:
   *   get:
   *     summary: 获取模型计费规则
   *     description: 获取指定模型的计费规则详情
   *     tags:
   *       - AI模型
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: modelId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 模型ID
   *     responses:
   *       200:
   *         description: 成功获取计费规则
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/ModelBilling'
   *       400:
   *         description: 请求参数错误
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: 模型ID不能为空
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public getModelBilling = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { modelId } = req.params;
      if (!modelId) {
        return next(ApiError.badRequest('模型ID不能为空'));
      }
      
      const billingRules = await this.modelService.getModelBilling(Number(modelId) || 0);
      res.status(200).json(billingRules);
    } catch (error) {
      next(error);
    }
  };
} 