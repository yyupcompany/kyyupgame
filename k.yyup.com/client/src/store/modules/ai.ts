import { defineStore } from 'pinia';
import { aiApi } from '../../api/ai';

// 定义模型类型
interface AIModel {
  id: number;
  modelName: string;
  displayName: string;
  provider: string;
  version: string;
  contextWindow: number;
  maxTokens: number;
  isActive: boolean;
  isDefault: boolean;
  capabilities: string[];
}

// 用户配额信息
interface UserQuota {
  total: number;
  used: number;
  remaining: number;
  resetDate: string;
}

interface AIState {
  models: AIModel[];
  isLoading: boolean;
  error: string | null;
  userQuota: UserQuota | null;
}

export const useAIStore = defineStore('ai', {
  state: (): AIState => ({
    models: [],
    isLoading: false,
    error: null,
    userQuota: null
  }),
  
  getters: {
    availableModels(state) {
      return state.models.filter(model => model.isActive);
    },
    
    defaultModel(state) {
      return state.models.find(model => model.isDefault) || state.models[0];
    }
  },
  
  actions: {
    async getModelList() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // 调用API获取模型列表
        const apiModels = await aiApi.getModels();
        
        // 获取默认模型
        const defaultModel = await aiApi.getDefaultModel();
        
        // 转换API模型格式为前端使用的格式
        this.models = apiModels.map((apiModel: any) => ({
          id: apiModel.id,
          modelName: apiModel.name.split('/').pop() || apiModel.name,
          displayName: apiModel.name,
          provider: apiModel.provider,
          version: apiModel.description.includes('version') ? 
            apiModel.description.split('version')[1].trim().split(' ')[0] : '1.0',
          contextWindow: apiModel.contextWindow,
          maxTokens: apiModel.maxTokens,
          isActive: apiModel.isAvailable,
          isDefault: defaultModel.id === apiModel.id,
          capabilities: apiModel.capabilities
        }));
        
        return this.models;
      } catch (error: any) {
        this.error = error.message || '获取模型列表失败';
        console.error('获取模型列表失败:', error);
        
        // 如果API调用失败，但已有缓存数据，返回缓存
        if (this.models.length > 0) {
          return this.models;
        }
        
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getModelById(modelId: number) {
      // 先尝试从缓存中获取
      const cachedModel = this.models.find(model => model.id === modelId);
      if (cachedModel) {
        return cachedModel;
      }
      
      try {
        // 从API获取模型详情
        const apiModel = await aiApi.getModelDetails(modelId);
        
        // 转换为前端模型格式
        const model: AIModel = {
          id: apiModel.id,
          modelName: apiModel.name.split('/').pop() || apiModel.name,
          displayName: apiModel.name,
          provider: apiModel.provider,
          version: apiModel.description.includes('version') ? 
            apiModel.description.split('version')[1].trim().split(' ')[0] : '1.0',
          contextWindow: apiModel.contextWindow,
          maxTokens: apiModel.maxTokens,
          isActive: apiModel.isAvailable,
          isDefault: false, // 默认值，后续会更新
          capabilities: apiModel.capabilities
        };
        
        // 如果缓存为空，添加到缓存
        if (this.models.length === 0) {
          this.models.push(model);
        } else {
          // 否则替换或添加
          const index = this.models.findIndex(m => m.id === modelId);
          if (index >= 0) {
            this.models[index] = model;
          } else {
            this.models.push(model);
          }
        }
        
        return model;
      } catch (error) {
        console.error('获取模型详情失败:', error);
        
        // 如果API调用失败，尝试获取所有模型
      if (this.models.length === 0) {
        await this.getModelList();
        return this.models.find(model => model.id === modelId);
      }
      
      return null;
      }
    },
    
    async setDefaultModel(modelId: number) {
      try {
        // 调用API设置默认模型
        await aiApi.setDefaultModel(modelId);
        
        // 更新本地状态
        this.models.forEach(model => {
          model.isDefault = model.id === modelId;
        });
        
        return true;
      } catch (error) {
        console.error('设置默认模型失败:', error);
        throw error;
      }
    },
    
    async getUserQuota() {
      try {
        // 调用API获取用户配额
        const quota = await aiApi.getUserQuota();
        this.userQuota = quota;
        return quota;
      } catch (error) {
        console.error('获取用户配额失败:', error);
        throw error;
      }
    },
    
    async checkModelCapability(modelId: number, capability: string) {
      // 先检查缓存
      const model = this.models.find(m => m.id === modelId);
      if (model && model.capabilities) {
        return model.capabilities.includes(capability);
      }
      
      // 如果缓存中没有，从API获取
      try {
        return await aiApi.checkModelCapability(modelId, capability);
      } catch (error) {
        console.error(`检查模型能力失败: ${capability}`, error);
        return false;
      }
    }
  }
}); 