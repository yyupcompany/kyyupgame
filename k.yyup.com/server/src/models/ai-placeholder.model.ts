/**
 * AI模型占位符
 * 已迁移到统一租户中心，这里提供兼容性接口
 */

import { ModelCtor, Sequelize } from 'sequelize';

export interface AIModelConfig {
  id: string;
  modelName: string;
  provider: string;
  isActive: boolean;
}

export interface AIModelUsage {
  id: number;
  modelId: string;
  tokensUsed: number;
  cost: number;
}

export const createAIModelPlaceholder = (sequelize: Sequelize): ModelCtor<any> => {
  // 返回空模型，仅用于兼容性
  return sequelize.define('ai_model_placeholder', {} as any);
};

export const createAIUsagePlaceholder = (sequelize: Sequelize): ModelCtor<any> => {
  // 返回空模型，仅用于兼容性
  return sequelize.define('ai_usage_placeholder', {} as any);
};