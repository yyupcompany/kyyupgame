/**
 * AI模型管理服务
 * 通过AI桥接服务获取和管理模型列表
 */

import { aiBridgeClient } from '../ai-bridge-client.service';
import AIModelConfig from '../../models/ai-model-config.model';

export interface ModelInfo {
  id: number;
  name: string;
  displayName: string;
  provider: string;
  modelType: string;
  isDefault: boolean;
  status: string;
}

class ModelService {
  /**
   * 获取模型列表
   */
  async getModels(authToken?: string): Promise<ModelInfo[]> {
    try {
      // 优先从统一租户系统获取
      const models = await aiBridgeClient.getModels(authToken);
      return models.map(m => ({
        id: m.id,
        name: m.name,
        displayName: m.displayName,
        provider: m.provider,
        modelType: m.modelType,
        isDefault: m.isDefault || false,
        status: 'active'
      }));
    } catch (error) {
      console.error('从统一租户系统获取模型失败，尝试本地查询:', error);
      // 降级到本地数据库
      const localModels = await AIModelConfig.findAll({
        where: { status: 'active' }
      });
      return localModels.map((m: any) => ({
        id: m.id,
        name: m.name,
        displayName: m.displayName || m.name,
        provider: m.provider,
        modelType: m.modelType || 'text',
        isDefault: m.isDefault || false,
        status: m.status || 'active'
      }));
    }
  }

  /**
   * 获取模型详情
   */
  async getModel(modelId: number): Promise<ModelInfo | null> {
    try {
      const model = await AIModelConfig.findByPk(modelId);
      if (!model) return null;
      return {
        id: model.id,
        name: model.name,
        displayName: (model as any).displayName || model.name,
        provider: model.provider,
        modelType: model.modelType || 'text',
        isDefault: model.isDefault || false,
        status: model.status || 'active'
      };
    } catch (error) {
      console.error('获取模型详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取默认模型
   */
  async getDefaultModel(): Promise<ModelInfo | null> {
    try {
      const model = await AIModelConfig.findOne({
        where: { isDefault: true, status: 'active' }
      });
      if (!model) return null;
      return {
        id: model.id,
        name: model.name,
        displayName: (model as any).displayName || model.name,
        provider: model.provider,
        modelType: model.modelType || 'text',
        isDefault: true,
        status: model.status || 'active'
      };
    } catch (error) {
      console.error('获取默认模型失败:', error);
      throw error;
    }
  }

  /**
   * 刷新模型缓存
   */
  async refreshCache(authToken?: string): Promise<void> {
    await aiBridgeClient.refreshModelCache(authToken);
  }

  /**
   * 预加载模型
   */
  async preloadModels(authToken?: string): Promise<void> {
    await aiBridgeClient.preloadModels(authToken);
  }

  /**
   * 获取模型计费规则
   */
  async getModelBilling(modelId: number): Promise<any> {
    return {
      modelId,
      inputPrice: 0.001,
      outputPrice: 0.002,
      currency: 'CNY',
      unit: '1K tokens'
    };
  }
}

export const modelService = new ModelService();
export default modelService;

