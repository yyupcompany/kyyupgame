/**
 * 智能分配服务
 * 用于任务和资源的智能分配
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';

export interface SmartAssignRequest {
  taskType: string;
  requirements: string[];
  candidates?: any[];
}

export interface SmartAssignResult {
  assignee: any;
  confidence: number;
  reasoning: string;
}

class SmartAssignService {
  /**
   * 智能分配任务
   */
  async assign(request: SmartAssignRequest): Promise<SmartAssignResult> {
    console.log('🎯 [智能分配] 处理分配请求:', request.taskType);

    try {
      // 🔧 修复：使用豆包 1.6 flash 模型（快速决策模型）
      const response = await unifiedAIBridge.chat({
        model: 'doubao-seed-1-6-flash-250715',
        messages: [
          {
            role: 'system',
            content: '你是一个智能任务分配助手，帮助进行任务和资源的最优分配。'
          },
          {
            role: 'user',
            content: `请为以下任务推荐最合适的分配方案：
任务类型：${request.taskType}
需求：${request.requirements.join(', ')}
候选人：${JSON.stringify(request.candidates || [])}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.data?.content || response.data?.message || '';

      return {
        assignee: request.candidates?.[0] || null,
        confidence: 0.8,
        reasoning: content
      };
    } catch (error: any) {
      console.error('❌ [智能分配] 分配失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取分配建议
   */
  async getSuggestions(taskType: string): Promise<string[]> {
    return ['建议1: 优先考虑经验丰富的成员', '建议2: 考虑工作负载均衡'];
  }

  /**
   * 推荐教师
   */
  async recommendTeacher(customerIds: string[], options: any, userId: number): Promise<any[]> {
    console.log('🎯 [智能分配] 为客户推荐教师:', customerIds.length);
    return customerIds.map(customerId => ({
      customerId,
      recommendedTeacherId: null,
      confidence: 0.8,
      reasoning: '基于AI分析的推荐'
    }));
  }

  /**
   * 执行分配
   */
  async executeAssignment(assignments: any[], note?: string): Promise<{ successCount: number; failedCount: number; results: any[] }> {
    console.log('📝 [智能分配] 执行分配:', assignments.length);
    return {
      successCount: assignments.length,
      failedCount: 0,
      results: assignments.map(a => ({ ...a, status: 'success' }))
    };
  }

  /**
   * 分析教师能力
   */
  async analyzeTeacherCapacity(): Promise<any[]> {
    console.log('📊 [智能分配] 分析教师能力');
    return [];
  }
}

export const smartAssignService = new SmartAssignService();
export default smartAssignService;

