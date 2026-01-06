/**
 * 租户AI模型配置服务
 * 从租户自己的数据库查询AI模型配置，然后传递给统一认证系统
 */

import AIModelConfig from '../models/ai-model-config.model';
import logger from '../utils/logger';
import { tenantDatabaseService } from './tenant-database.service';

export interface AIModelConfigData {
  id: number;
  name: string;
  displayName?: string;
  provider: string;
  modelType: string;
  endpointUrl: string;
  apiKey: string;
  modelParameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  isDefault: boolean;
  status: string;
  capabilities: string[];
  maxTokens: number;
  billing?: {
    inputTokenPrice?: number;
    outputTokenPrice?: number;
  };
}

export class TenantAIModelConfigService {
  /**
   * 获取所有可用的AI模型配置
   * @param tenantCode 租户代码，如 'k001'
   * @param activeOnly 是否只返回激活的模型
   */
  static async getAvailableModels(tenantCode: string, activeOnly: boolean = true): Promise<AIModelConfigData[]> {
    try {
      logger.info(`[租户AI模型配置] 获取租户 ${tenantCode} 的AI模型配置`);

      // 获取租户数据库连接
      const connection = await tenantDatabaseService.getTenantConnection(tenantCode);

      // 构建查询条件
      const whereClause: any = {};
      if (activeOnly) {
        whereClause.isActive = true;
        whereClause.status = 'active';
      }

      // 查询租户数据库中的AI模型配置
      const models = await AIModelConfig.findAll({
        where: whereClause,
        order: [
          ['isDefault', 'DESC'],
          ['createdAt', 'ASC']
        ],
        raw: false // 确保获取模型实例而不是原始数据
      });

      // 转换为标准格式
      const modelConfigs: AIModelConfigData[] = models.map(model => ({
        id: model.id,
        name: model.name,
        displayName: (model as any).displayName || (model as any).display_name || model.name,
        provider: model.provider,
        modelType: model.modelType || 'text',
        endpointUrl: model.endpointUrl || '',
        apiKey: model.apiKey || '',
        modelParameters: model.modelParameters || {
          temperature: 0.7,
          maxTokens: (model as any).maxTokens || 2000,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        isDefault: model.isDefault || false,
        status: model.status || 'active',
        capabilities: (model as any).capabilities || ['chat', 'completion'],
        maxTokens: (model as any).maxTokens || 4096,
        billing: {
          inputTokenPrice: 0.0001,
          outputTokenPrice: 0.0002
        }
      }));

      logger.info(`[租户AI模型配置] 成功获取 ${modelConfigs.length} 个模型配置`);

      // 如果没有找到模型配置，返回默认的豆包模型配置
      if (modelConfigs.length === 0) {
        logger.warn(`[租户AI模型配置] 租户 ${tenantCode} 没有配置AI模型，使用默认豆包模型`);
        return [this.getDefaultDoubaoModel()];
      }

      return modelConfigs;

    } catch (error) {
      logger.error(`[租户AI模型配置] 获取租户 ${tenantCode} 的AI模型配置失败:`, error);

      // 出错时返回默认配置
      logger.warn(`[租户AI模型配置] 使用默认豆包模型作为降级方案`);
      return [this.getDefaultDoubaoModel()];
    }
  }

  /**
   * 根据模型名称获取AI模型配置
   */
  static async getModelByName(tenantCode: string, modelName: string): Promise<AIModelConfigData | null> {
    try {
      const models = await this.getAvailableModels(tenantCode);
      return models.find(model => model.name === modelName) || null;
    } catch (error) {
      logger.error(`[租户AI模型配置] 获取模型 ${modelName} 配置失败:`, error);
      return null;
    }
  }

  /**
   * 获取默认的AI模型配置
   */
  static async getDefaultModel(tenantCode: string): Promise<AIModelConfigData | null> {
    try {
      const models = await this.getAvailableModels(tenantCode);
      return models.find(model => model.isDefault) || models[0] || null;
    } catch (error) {
      logger.error(`[租户AI模型配置] 获取默认模型配置失败:`, error);
      return this.getDefaultDoubaoModel();
    }
  }

  /**
   * 获取默认的豆包模型配置（降级方案）
   */
  private static getDefaultDoubaoModel(): AIModelConfigData {
    return {
      id: 1,
      name: 'doubao-seed-1-6-flash-250715',
      displayName: '豆包 1.6 Flash',
      provider: 'doubao',
      modelType: 'text',
      endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      apiKey: process.env.DOUBAO_API_KEY || 'your-real-doubao-api-key',
      modelParameters: {
        temperature: 0.7,
        maxTokens: 4096,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      isDefault: true,
      status: 'active',
      capabilities: ['chat', 'completion', 'fast', 'tool-calling'],
      maxTokens: 4096,
      billing: {
        inputTokenPrice: 0.0001,
        outputTokenPrice: 0.0002
      }
    };
  }

  /**
   * 检查模型是否可用
   */
  static async isModelAvailable(tenantCode: string, modelName: string): Promise<boolean> {
    try {
      const model = await this.getModelByName(tenantCode, modelName);
      return model !== null && model.status === 'active';
    } catch (error) {
      logger.error(`[租户AI模型配置] 检查模型可用性失败:`, error);
      return false;
    }
  }
}

export default TenantAIModelConfigService;