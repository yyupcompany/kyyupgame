/**
 * 客户跟进AI服务 - 简化版占位符
 */

export interface CustomerInfo {
  id: number;
  name: string;
  phone: string;
  status?: string;
  source?: string;
  followUpCount?: number;
  lastFollowUpDate?: Date;
}

export interface AISuggestionRequest {
  customerId?: number;
  customerInfo: CustomerInfo;
  context?: any;
  stage?: number;
  subStage?: string;
  currentContent?: string;
}

export interface AISuggestionResponse {
  success: boolean;
  suggestions?: string[];
  nextAction?: string;
  priority?: 'high' | 'medium' | 'low';
  error?: string;
}

export class CustomerFollowAIService {
  private static instance: CustomerFollowAIService;

  static getInstance(): CustomerFollowAIService {
    if (!CustomerFollowAIService.instance) {
      CustomerFollowAIService.instance = new CustomerFollowAIService();
    }
    return CustomerFollowAIService.instance;
  }

  /**
   * 获取AI跟进建议
   */
  async getSuggestions(request: AISuggestionRequest): Promise<AISuggestionResponse> {
    console.log('🤖 获取客户跟进AI建议:', request.customerId);

    // 简化版实现 - 返回占位符响应
    return {
      success: true,
      suggestions: [
        '建议在3天内进行回访',
        '可以询问客户对幼儿园的具体需求',
        '推荐介绍我们的特色课程'
      ],
      nextAction: '电话回访',
      priority: 'medium'
    };
  }

  /**
   * 获取跟进建议 - 别名方法
   */
  async getFollowUpSuggestions(request: AISuggestionRequest): Promise<AISuggestionResponse> {
    return this.getSuggestions(request);
  }

  /**
   * 分析客户意向
   */
  async analyzeIntent(customerInfo: CustomerInfo): Promise<{
    intentLevel: number;
    factors: string[];
  }> {
    console.log('🔍 分析客户意向:', customerInfo.id);
    
    return {
      intentLevel: 75,
      factors: ['多次咨询', '关注课程详情', '询问价格']
    };
  }

  /**
   * 生成跟进话术
   */
  async generateScript(customerInfo: CustomerInfo, scenario: string): Promise<string> {
    console.log('📝 生成跟进话术:', customerInfo.id, scenario);
    
    return `您好${customerInfo.name}，感谢您对我们幼儿园的关注。我是XX幼儿园的招生老师，想了解一下您对我们幼儿园还有什么疑问吗？`;
  }
}

export const customerFollowAIService = CustomerFollowAIService.getInstance();
export default customerFollowAIService;

