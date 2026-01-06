/**
 * 模型选择器服务
 * 根据请求类型和复杂度智能选择最优模型
 */

import { aiBridgeClient } from '../ai-bridge-client.service';

export interface ModelSelectionCriteria {
  taskType?: string;
  complexity?: 'low' | 'medium' | 'high';
  requiresThinking?: boolean;
  requiresVision?: boolean;
  maxResponseTime?: number;
}

class ModelSelectorService {
  /**
   * 选择最优模型
   */
  async selectModel(criteria: ModelSelectionCriteria): Promise<string> {
    console.log('🎯 [模型选择器] 选择模型，条件:', criteria);

    // 基于条件选择模型
    if (criteria.requiresThinking) {
      return 'doubao-seed-1-6-thinking-250615';
    }
    if (criteria.requiresVision) {
      return 'doubao-vision';
    }
    if (criteria.complexity === 'high') {
      return 'doubao-seed-1-6-thinking-250615';
    }

    // 🔧 修复：默认使用豆包 1.6 flash 模型（快速决策模型）
    return 'doubao-seed-1-6-flash-250715';
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(authToken?: string): Promise<string[]> {
    try {
      const models = await aiBridgeClient.getModels(authToken);
      return models.map(m => m.name);
    } catch (error) {
      console.error('获取模型列表失败:', error);
      // 🔧 修复：错误回退使用豆包 1.6 flash 模型
      return ['doubao-seed-1-6-flash-250715'];
    }
  }

  /**
   * 检查模型是否可用
   */
  async isModelAvailable(modelName: string): Promise<boolean> {
    const models = await this.getAvailableModels();
    return models.includes(modelName);
  }

  /**
   * 获取模型能力
   */
  getModelCapabilities(modelName: string): string[] {
    // 🔧 修复：添加豆包 1.6 flash 和 1.6 thinking 模型的能力定义
    const capabilities: Record<string, string[]> = {
      'doubao-seed-1-6-flash-250715': ['text', 'chat', 'analysis', 'fast', 'tool-calling'],
      'doubao-seed-1-6-thinking-250615': ['text', 'chat', 'thinking', 'analysis', 'reasoning'],
      'doubao-vision': ['text', 'chat', 'vision', 'image-analysis'],
      // 保留旧配置兼容性
      'doubao-pro-4k': ['text', 'chat', 'analysis'],
    };
    return capabilities[modelName] || ['text', 'chat'];
  }
}

export const modelSelectorService = new ModelSelectorService();
export default modelSelectorService;

