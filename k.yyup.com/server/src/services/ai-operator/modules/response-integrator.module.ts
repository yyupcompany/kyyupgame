/**
 * 响应整合器模块
 * 
 * 职责：
 * - 整合工具执行结果
 * - 生成响应消息
 * - 构建UI组件
 * - 生成建议和下一步操作
 * - 创建错误响应
 * 
 * 从unified-intelligence.service.ts中提取
 */

// 导入类型（从主服务导入，避免类型重复定义）
import {
  TaskComplexity,
  IntentType,
  type ToolExecution,
  type RequestAnalysis,
  type UIComponent,
  type Recommendation,
  type IntelligentResponse
} from '../unified-intelligence.service';

/**
 * 响应整合器模块
 */
export class ResponseIntegratorModule {
  /**
   * 整合结果
   */
  integrateResults(
    results: ToolExecution[],
    analysis: RequestAnalysis,
    executionTime: number
  ): IntelligentResponse {
    const successfulResults = results.filter(r => r.status === 'completed');
    const failedResults = results.filter(r => r.status === 'failed');

    // 构建响应消息
    let message = this.generateResponseMessage(analysis, successfulResults);

    // 构建UI组件
    const uiComponents = this.generateUIComponents(successfulResults, analysis);

    // 构建建议
    const recommendations = this.generateRecommendations(analysis, results);

    // 计算置信度
    const confidenceScore = successfulResults.length / results.length * analysis.confidence;

    return {
      success: failedResults.length === 0,
      data: {
        message,
        toolExecutions: results,
        uiComponents,
        recommendations,
        todoList: this.extractTodoList(successfulResults),
        visualizations: this.extractVisualizations(successfulResults)
      },
      metadata: {
        executionTime,
        toolsUsed: results.map(r => r.toolName),
        confidenceScore,
        nextSuggestedActions: this.generateNextActions(analysis),
        complexity: analysis.complexity,
        approach: this.getIntentText(analysis.intent)
      }
    };
  }

  /**
   * 生成响应消息
   */
  private generateResponseMessage(analysis: RequestAnalysis, results: ToolExecution[]): string {
    let message = `我已经为您智能分析并处理了这个${this.getComplexityText(analysis.complexity)}请求。\n\n`;

    message += `🎯 **识别意图**: ${this.getIntentText(analysis.intent)}\n`;
    message += `📊 **复杂度评估**: ${this.getComplexityText(analysis.complexity)}\n`;
    message += `⚡ **执行方式**: ${this.getApproachDescription(analysis.intent)}\n\n`;

    if (results.length > 0) {
      message += `🛠️ **执行的操作**:\n`;
      results.forEach((result, index) => {
        message += `${index + 1}. ${this.getToolDisplayName(result.toolName)} ✅\n`;
      });
    }

    return message;
  }

  /**
   * 生成UI组件
   */
  private generateUIComponents(results: ToolExecution[], analysis?: RequestAnalysis): UIComponent[] {
    const components: UIComponent[] = [];

    // 首先从工具执行结果中提取组件
    results.forEach(result => {
      if (result.toolName === 'create_todo_list' && result.result.todoList) {
        components.push({
          type: 'todo-list',
          data: result.result.todoList,
          props: { interactive: true, animated: true },
          animation: 'fadeInUp'
        });
      }

      if (result.toolName === 'render_component' && result.result.componentData) {
        const componentData = result.result.componentData;

        // 根据实际组件类型生成UI组件
        components.push({
          type: componentData.type,
          data: componentData,
          props: {
            responsive: componentData.type === 'chart',
            interactive: result.result.renderInfo?.interactive || false,
            animated: true
          },
          animation: this.getComponentAnimation(componentData.type)
        });
      }
    });

    return components;
  }

  /**
   * 获取组件动画类型
   */
  private getComponentAnimation(componentType: string): string {
    const animationMap: Record<string, string> = {
      'chart': 'zoomIn',
      'table': 'slideInUp',
      'notification': 'bounceIn',
      'todo-list': 'fadeInUp'
    };
    return animationMap[componentType] || 'fadeIn';
  }

  /**
   * 生成建议
   */
  private generateRecommendations(analysis: RequestAnalysis, results: ToolExecution[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.complexity === TaskComplexity.VERY_COMPLEX) {
      recommendations.push({
        title: '复杂任务分解',
        description: '建议将当前任务进一步分解为更小的子任务',
        action: 'create_subtasks',
        priority: 'high'
      });
    }

    if (analysis.intent === IntentType.PAGE_OPERATION) {
      recommendations.push({
        title: '页面状态监控',
        description: '建议在操作后验证页面状态',
        action: 'validate_state',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * 提取TodoList
   */
  private extractTodoList(results: ToolExecution[]): any {
    const todoResult = results.find(r => r.toolName === 'create_todo_list');
    return todoResult?.result?.todoList || null;
  }

  /**
   * 提取可视化组件
   */
  private extractVisualizations(results: ToolExecution[]): any[] {
    return results
      .filter(r => r.toolName === 'render_component')
      .map(r => r.result);
  }

  /**
   * 生成下一步建议
   */
  private generateNextActions(analysis: RequestAnalysis): string[] {
    const actions: string[] = [];

    switch (analysis.intent) {
      case IntentType.PAGE_OPERATION:
        actions.push('验证操作结果', '继续下一步操作', '返回上一页');
        break;
      case IntentType.TASK_MANAGEMENT:
        actions.push('更新任务状态', '添加新任务', '查看任务详情');
        break;
      case IntentType.DATA_VISUALIZATION:
        actions.push('切换图表类型', '导出数据', '设置筛选条件');
        break;
      default:
        actions.push('继续对话', '查看详细信息', '获取更多帮助');
    }

    return actions;
  }

  /**
   * 创建错误响应
   */
  createErrorResponse(error: Error, executionTime: number): IntelligentResponse {
    const userFriendlyMessage = `AI服务暂时遇到了一些问题，请稍后重试。如果问题持续存在，请联系管理员。\n\n技术信息：${error.message}`;

    return {
      success: false,
      data: {
        message: userFriendlyMessage,
        toolExecutions: [],
        uiComponents: [],
        recommendations: [
          {
            title: '重试请求',
            description: '可以尝试重新发送请求',
            action: 'retry',
            priority: 'high'
          }
        ]
      },
      metadata: {
        executionTime,
        toolsUsed: [],
        confidenceScore: 0.1,
        nextSuggestedActions: ['重试', '简化请求', '寻求帮助'],
        complexity: TaskComplexity.SIMPLE,
        approach: 'error_handling'
      },
      error: error.message
    };
  }

  // 辅助方法
  private getIntentText(intent: IntentType): string {
    const intentMap = {
      [IntentType.PAGE_OPERATION]: '页面操作',
      [IntentType.DATA_VISUALIZATION]: '数据可视化',
      [IntentType.TASK_MANAGEMENT]: '任务管理',
      [IntentType.EXPERT_CONSULTATION]: '专家咨询',
      [IntentType.INFORMATION_QUERY]: '信息查询',
      [IntentType.COMPLEX_WORKFLOW]: '复杂工作流'
    };
    return intentMap[intent] || '未知意图';
  }

  private getComplexityText(complexity: TaskComplexity): string {
    const complexityMap = {
      [TaskComplexity.SIMPLE]: '简单',
      [TaskComplexity.MODERATE]: '中等',
      [TaskComplexity.COMPLEX]: '复杂',
      [TaskComplexity.VERY_COMPLEX]: '非常复杂'
    };
    return complexityMap[complexity] || '未知';
  }

  private getApproachDescription(intent: IntentType): string {
    const approachMap = {
      [IntentType.PAGE_OPERATION]: '页面感知 + DOM操作',
      [IntentType.DATA_VISUALIZATION]: '数据处理 + 图表渲染',
      [IntentType.TASK_MANAGEMENT]: '任务分解 + 进度管理',
      [IntentType.EXPERT_CONSULTATION]: '专家匹配 + 咨询分析',
      [IntentType.INFORMATION_QUERY]: '智能查询 + 结果整理',
      [IntentType.COMPLEX_WORKFLOW]: '多维分析 + 协同执行'
    };
    return approachMap[intent] || '标准处理';
  }

  private getToolDisplayName(toolName: string): string {
    const nameMap: Record<string, string> = {
      // 页面操作工具已移除
      'analyze_task_complexity': '复杂度分析',
      'create_todo_list': '任务清单创建',
      'render_component': '数据可视化',
      'call_expert': '专家咨询',
      'any_query': '智能查询'
    };
    return nameMap[toolName] || toolName;
  }
}

// 导出单例
export const responseIntegratorModule = new ResponseIntegratorModule();

