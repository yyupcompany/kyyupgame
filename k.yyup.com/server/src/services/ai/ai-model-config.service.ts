/**
 * AI模型配置服务 - 简化版占位符
 */

export class AIModelConfigService {
  private static instance: AIModelConfigService;

  static getInstance(): AIModelConfigService {
    if (!AIModelConfigService.instance) {
      AIModelConfigService.instance = new AIModelConfigService();
    }
    return AIModelConfigService.instance;
  }

  /**
   * 获取所有模型 - 静态方法
   */
  static async getAllModels(activeOnly: boolean = false): Promise<any[]> {
    console.log('📋 获取所有模型, activeOnly:', activeOnly);
    // 简化版实现 - 返回占位符数据
    return [
      {
        id: 1,
        name: 'GPT-4',
        provider: 'openai',
        status: 'active',
        isDefault: true
      },
      {
        id: 2,
        name: 'Claude-3',
        provider: 'anthropic',
        status: activeOnly ? 'active' : 'inactive',
        isDefault: false
      }
    ].filter(m => !activeOnly || m.status === 'active');
  }

  /**
   * 根据ID获取模型
   */
  static async getModelById(id: number): Promise<any> {
    console.log('🔍 获取模型:', id);
    return {
      id,
      name: 'GPT-4',
      provider: 'openai',
      status: 'active',
      isDefault: true
    };
  }

  /**
   * 创建模型
   */
  static async createModel(modelData: any): Promise<number> {
    console.log('➕ 创建模型:', modelData);
    return Date.now();
  }

  /**
   * 更新模型
   */
  static async updateModel(id: number, data: any): Promise<boolean> {
    console.log('📝 更新模型:', id, data);
    return true;
  }

  /**
   * 删除模型
   */
  static async deleteModel(id: number): Promise<boolean> {
    console.log('🗑️ 删除模型:', id);
    return true;
  }

  /**
   * 获取默认模型
   */
  static async getDefaultModel(modelType?: string): Promise<any> {
    console.log('🔍 获取默认模型, 类型:', modelType);
    // 返回占位符数据
    return {
      id: 1,
      name: modelType === 'search' ? 'Search-Model' : 'GPT-4',
      provider: 'openai',
      status: 'active',
      isDefault: true,
      maxTokens: modelType === 'search' ? 2048 : 4096
    };
  }

  async getConfig(modelId: string): Promise<any> {
    console.log('⚙️ 获取模型配置:', modelId);
    return {
      modelId,
      provider: 'openai',
      config: {}
    };
  }

  async updateConfig(modelId: string, config: any): Promise<any> {
    console.log('📝 更新模型配置:', modelId, config);
    return { updated: true };
  }
}

export const AIModelConfigServiceClass = AIModelConfigService.getInstance();
export default AIModelConfigService;
