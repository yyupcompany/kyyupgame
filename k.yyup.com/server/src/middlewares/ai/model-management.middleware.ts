/**
 * AI模型管理中间层
 * 负责AI模型配置、使用统计和计费管理，组合模型配置服务、使用统计服务和计费服务
 */

import {
  modelService as aiModelService,
  messageService as aiMessageService
} from '../../services/ai';

// 模型配置服务占位符
const aiModelConfigService = {
  async getModelConfig(modelId: number) { return { id: modelId, name: 'default', config: {} }; },
  async updateModelConfig(modelId: number, config: any) { return true; },
  async getModelConfigs() { return []; }
};

// 模型计费服务占位符
const aiModelBillingService = {
  async getModelBilling(modelId: number) { return { modelId, cost: 0 }; },
  async updateModelBilling(modelId: number, billing: any) { return true; },
  async getModelBillings() { return []; },
  async calculateCost(modelId: number, tokens: number) { return 0; }
};

// 模型使用统计服务占位符
const aiModelUsageService = {
  async getModelUsage(modelId: number) { return { modelId, usage: 0 }; },
  async recordUsage(modelId: number, usage: any) { return true; },
  async getUsageStatistics(modelId: number) { return { total: 0, daily: [] }; }
};
import { 
  BaseMiddleware, 
  IMiddlewareResult, 
  MiddlewareError, 
  ERROR_CODES 
} from './base.middleware';

// 类型定义
interface ModelInfo {
  id: number;
  modelName: string;
  description?: string;
  provider: string;
  version: string;
  capabilities: string[];
  isActive: boolean;
  [key: string]: any;
}

interface UserModelPreference {
  userId: number;
  modelId: number;
}

interface UsageStats {
  modelId: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  timestamp: Date;
  [key: string]: any;
}

interface BillingDetails {
  totalCost: number;
  costByModel: Record<number, number>;
}

interface BillingInfo {
  inputTokenPrice: number;
  outputTokenPrice: number;
  currencyCode: string;
  [key: string]: any;
}

interface PaymentResult {
  id: string;
  userId: number;
  amount: number;
  status: string;
  createdAt: Date;
  [key: string]: any;
}

/**
 * AI模型管理中间层接口
 */
export interface IAiModelManagementMiddleware {
  // 模型配置
  getAvailableModels(userId: number): Promise<IMiddlewareResult<ModelInfo[]>>;
  getModelDetails(userId: number, modelId: number): Promise<IMiddlewareResult<any>>;
  updateUserModelPreference(userId: number, modelId: number): Promise<IMiddlewareResult<boolean>>;
  
  // 使用统计
  getUserModelUsage(userId: number, startDate: Date, endDate: Date): Promise<IMiddlewareResult<any>>;
  getModelUsageStats(modelId: number, startDate: Date, endDate: Date): Promise<IMiddlewareResult<any>>;
  
  // 计费管理
  getUserBillingInfo(userId: number): Promise<IMiddlewareResult<any>>;
  calculateCost(inputTokens: number, outputTokens: number, modelId: number): Promise<IMiddlewareResult<{cost: number}>>;
  processPayment(userId: number, amount: number, paymentMethod: string): Promise<IMiddlewareResult<PaymentResult>>;
}

/**
 * AI模型管理中间层实现
 */
class AiModelManagementMiddleware extends BaseMiddleware implements IAiModelManagementMiddleware {
  /**
   * 获取可用的AI模型列表
   * @param userId 用户ID
   * @returns 可用模型列表
   */
  async getAvailableModels(userId: number): Promise<IMiddlewareResult<ModelInfo[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:model:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看模型的权限',
          { userId }
        );
      }
      
      // 获取可用模型列表
      const models = await aiModelConfigService.getModelConfigs();

      // 由于服务层没有提供获取用户首选模型的方法，仅返回模型列表
      const result = (models as any[]).map((model: any) => ({
        id: model.id,
        modelName: model.modelName || model.name,
        provider: model.provider || 'default',
        version: model.version || '1.0',
        capabilities: model.capabilities || [],
        isActive: model.isActive !== false
      }));
      
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<ModelInfo[]>;
    }
  }
  
  /**
   * 获取模型详情
   * @param userId 用户ID
   * @param modelId 模型ID
   * @returns 模型详情
   */
  async getModelDetails(userId: number, modelId: number): Promise<IMiddlewareResult<any>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:model:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看模型详情的权限',
          { userId, modelId }
        );
      }
      
      // 获取模型详情
      const model = await aiModelConfigService.getModelConfig(modelId);

      if (!model) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '模型不存在',
          { modelId }
        );
      }

      // 获取时间范围
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 获取模型使用统计
      const usageStats = await aiModelUsageService.getUsageStatistics(modelId);

      // 获取用户对该模型的使用情况
      const userUsageStats = await aiModelUsageService.getModelUsage(modelId);
      
      // 获取计费信息
      const billingInfo = await aiModelBillingService.getModelBilling(modelId);

      // 组合结果，只包含服务层提供的真实数据
      const result = {
        ...model,
        usageStats: {
          totalRequests: (usageStats as any).totalRequests || (usageStats as any).total || 0,
          successfulRequests: (usageStats as any).successfulRequests || 0,
          totalTokens: (usageStats as any).totalTokens || 0,
          totalCost: (usageStats as any).totalCost || 0,
          averageProcessingTime: (usageStats as any).averageProcessingTime || 0
        },
        userUsageStats: {
          totalRequests: (userUsageStats as any).totalRequests || (userUsageStats as any).usage || 0,
          successfulRequests: (userUsageStats as any).successfulRequests || 0,
          totalTokens: (userUsageStats as any).totalTokens || 0,
          totalCost: (userUsageStats as any).totalCost || 0
        },
        billingInfo
      };
      
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * 更新用户模型偏好
   * @param userId 用户ID
   * @param modelId 模型ID
   * @returns 更新结果
   */
  async updateUserModelPreference(userId: number, modelId: number): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:model:update']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有更新模型偏好的权限',
          { userId, modelId }
        );
      }
      
      // 验证模型存在
      const model = await aiModelConfigService.getModelConfig(modelId);
      if (!model) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '模型不存在',
          { modelId }
        );
      }
      
      // 由于服务层没有提供更新用户模型偏好的方法
      throw new MiddlewareError(
        ERROR_CODES.SERVICE_UNAVAILABLE,
        '更新模型偏好功能暂不可用',
        { userId, modelId }
      );
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 获取用户模型使用情况
   * @param userId 用户ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 使用情况统计
   */
  async getUserModelUsage(userId: number, startDate: Date, endDate: Date): Promise<IMiddlewareResult<any>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:usage:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看使用情况的权限',
          { userId }
        );
      }
      
      // 获取用户在指定时间段内的使用情况
      const usageStats = await aiModelUsageService.getModelUsage(userId);

      // 只返回服务层提供的真实数据
      const result = {
        totalRequests: (usageStats as any).totalRequests || (usageStats as any).usage || 0,
        successfulRequests: (usageStats as any).successfulRequests || 0,
        totalTokens: (usageStats as any).totalTokens || 0,
        totalCost: (usageStats as any).totalCost || 0,
        usageByType: (usageStats as any).usageByType || {}
      };
      
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * 获取模型使用统计
   * @param modelId 模型ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 使用情况统计
   */
  async getModelUsageStats(modelId: number, startDate: Date, endDate: Date): Promise<IMiddlewareResult<any>> {
    try {
      // 检查权限（需要管理员权限）
      const hasPermission = await this.validatePermissions(0, ['ai:admin:usage:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看模型统计的权限'
        );
      }
      
      // 验证模型存在
      const model = await aiModelConfigService.getModelConfig(modelId);
      if (!model) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '模型不存在',
          { modelId }
        );
      }

      // 获取模型在指定时间段内的使用情况
      const usageStats = await aiModelUsageService.getUsageStatistics(modelId);

      // 由于服务层没有提供获取用户数量和计费信息的方法，只返回已有数据
      const result = {
        modelId,
        modelName: (model as any).modelName || (model as any).name || `Model-${modelId}`,
        totalRequests: (usageStats as any).totalRequests || (usageStats as any).total || 0,
        successfulRequests: (usageStats as any).successfulRequests || 0,
        totalTokens: (usageStats as any).totalTokens || 0,
        totalCost: (usageStats as any).totalCost || 0,
        averageProcessingTime: (usageStats as any).averageProcessingTime || 0
      };
      
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * 获取用户计费信息
   * @param userId 用户ID
   * @returns 计费信息
   */
  async getUserBillingInfo(userId: number): Promise<IMiddlewareResult<any>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:billing:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看计费信息的权限',
          { userId }
        );
      }
      
      // 服务层未提供获取用户计费信息的方法
      throw new MiddlewareError(
        ERROR_CODES.SERVICE_UNAVAILABLE,
        '计费信息查询功能暂不可用',
        { userId }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * 计算使用成本
   * @param inputTokens 输入标记数
   * @param outputTokens 输出标记数
   * @param modelId 模型ID
   * @returns 计算的成本
   */
  async calculateCost(inputTokens: number, outputTokens: number, modelId: number): Promise<IMiddlewareResult<{cost: number}>> {
    try {
      // 验证模型存在
      const model = await aiModelConfigService.getModelConfig(modelId);
      if (!model) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '模型不存在',
          { modelId }
        );
      }

      // 计算成本
      const totalTokens = inputTokens + outputTokens;
      const costResult = await aiModelBillingService.calculateCost(modelId, totalTokens);

      return this.createSuccessResponse({ cost: Number(costResult) });
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<{cost: number}>;
    }
  }
  
  /**
   * 处理付款
   * @param userId 用户ID
   * @param amount 金额
   * @param paymentMethod 支付方式
   * @returns 支付结果
   */
  async processPayment(userId: number, amount: number, paymentMethod: string): Promise<IMiddlewareResult<PaymentResult>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:billing:payment']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有支付权限',
          { userId }
        );
      }
      
      // 验证支付参数
      if (amount <= 0) {
        throw new MiddlewareError(
          ERROR_CODES.VALIDATION_FAILED,
          '支付金额必须大于0',
          { amount }
        );
      }
      
      // 验证支付方式
      const validPaymentMethods = ['credit_card', 'alipay', 'wechat_pay', 'bank_transfer'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        throw new MiddlewareError(
          ERROR_CODES.VALIDATION_FAILED,
          '无效的支付方式',
          { paymentMethod, validPaymentMethods }
        );
      }
      
      // 服务层未提供支付处理方法
      throw new MiddlewareError(
        ERROR_CODES.SERVICE_UNAVAILABLE,
        '支付处理功能暂不可用',
        { userId, amount, paymentMethod }
      );
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<PaymentResult>;
    }
  }
  
  /**
   * 按天聚合使用统计
   * @param usageStats 使用统计记录
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 按天聚合的使用统计
   * @private
   */
  private aggregateUsageByDay(usageStats: UsageStats[], startDate: Date, endDate: Date): any[] {
    const result: any[] = [];
    const dayMap = new Map<string, any>();
    
    // 初始化每天的数据
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      dayMap.set(dateString, {
        date: dateString,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0
      });
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
    
    // 聚合数据
    for (const stat of usageStats) {
      const dateString = new Date(stat.timestamp).toISOString().split('T')[0];
      const dayData = dayMap.get(dateString);
      if (dayData) {
        dayData.totalTokens += stat.totalTokens;
        dayData.inputTokens += stat.inputTokens;
        dayData.outputTokens += stat.outputTokens;
      }
    }
    
    // 转换为数组
    for (const dayData of dayMap.values()) {
      result.push(dayData);
    }
    
    // 按日期排序
    result.sort((a, b) => a.date.localeCompare(b.date));
    
    return result;
  }
}

// 导出单例实例
export const aiModelManagementMiddleware = new AiModelManagementMiddleware(); 