/**
 * 智能工作流编排服务
 * 为复杂任务自动生成和管理执行工作流
 */

export interface WorkflowStep {
  id: string;
  type: 'analyze' | 'navigate' | 'scan' | 'click' | 'input' | 'validate' | 'wait' | 'todo_update';
  name: string;
  description: string;
  action: string;
  params: Record<string, any>;
  dependencies?: string[];
  estimatedTime?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  retryCount?: number;
  maxRetries?: number;
  result?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
}

export interface SmartWorkflow {
  id: string;
  name: string;
  description: string;
  userIntent: string;
  targetOutcome: string;
  pageContext: any;
  steps: WorkflowStep[];
  currentStepIndex: number;
  status: 'created' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  todoListId?: string;
  metadata: {
    complexity: 'low' | 'medium' | 'high' | 'expert';
    estimatedDuration: number;
    riskLevel: 'low' | 'medium' | 'high';
    successCriteria: string[];
    fallbackPlan?: string[];
  };
}

export class SmartWorkflowService {
  
  /**
   * 创建智能工作流
   */
  static async createSmartWorkflow(params: {
    userIntent: string;
    currentPage: any;
    availableTools: string[];
    expectedOutcome: string;
    context?: any;
  }): Promise<SmartWorkflow> {
    try {
      const { userIntent, currentPage, availableTools, expectedOutcome, context } = params;
      
      console.log('🚀 创建智能工作流:', { userIntent, currentPage: currentPage?.pageName });
      
      // 分析任务复杂度
      const complexity = this.analyzeTaskComplexity(userIntent, currentPage);
      
      // 生成工作流步骤
      const steps = await this.generateWorkflowSteps(userIntent, currentPage, availableTools, expectedOutcome);
      
      // 创建工作流对象
      const workflow: SmartWorkflow = {
        id: `workflow_${Date.now()}`,
        name: this.extractWorkflowName(userIntent),
        description: `智能执行: ${userIntent}`,
        userIntent,
        targetOutcome: expectedOutcome,
        pageContext: currentPage,
        steps,
        currentStepIndex: 0,
        status: 'created',
        progress: 0,
        startTime: new Date().toISOString(),
        metadata: {
          complexity,
          estimatedDuration: this.calculateEstimatedDuration(steps),
          riskLevel: this.assessRiskLevel(steps, currentPage),
          successCriteria: this.generateSuccessCriteria(userIntent, expectedOutcome),
          fallbackPlan: this.generateFallbackPlan(userIntent, currentPage)
        }
      };
      
      console.log('✅ 智能工作流创建完成:', {
        名称: workflow.name,
        步骤数: workflow.steps.length,
        复杂度: workflow.metadata.complexity,
        预计耗时: workflow.metadata.estimatedDuration + '分钟'
      });
      
      return workflow;
    } catch (error) {
      console.error('智能工作流创建失败:', error);
      throw error;
    }
  }
  
  /**
   * 执行工作流的下一步
   */
  static async executeNextStep(workflow: SmartWorkflow): Promise<{
    workflow: SmartWorkflow;
    stepResult: any;
    shouldContinue: boolean;
  }> {
    try {
      if (workflow.currentStepIndex >= workflow.steps.length) {
        workflow.status = 'completed';
        workflow.endTime = new Date().toISOString();
        workflow.progress = 100;
        
        return {
          workflow,
          stepResult: { message: '工作流执行完成' },
          shouldContinue: false
        };
      }
      
      const currentStep = workflow.steps[workflow.currentStepIndex];
      console.log(`🔧 执行工作流步骤 ${workflow.currentStepIndex + 1}/${workflow.steps.length}: ${currentStep.name}`);
      
      // 检查依赖
      const dependenciesMet = this.checkDependencies(currentStep, workflow.steps);
      if (!dependenciesMet) {
        currentStep.status = 'skipped';
        currentStep.error = '依赖条件未满足';
        workflow.currentStepIndex++;
        return this.executeNextStep(workflow);
      }
      
      // 标记步骤为运行中
      currentStep.status = 'running';
      currentStep.startTime = new Date().toISOString();
      workflow.status = 'running';
      
      let stepResult;
      
      try {
        // 根据步骤类型执行相应操作
        stepResult = await this.executeStep(currentStep, workflow);
        
        currentStep.status = 'completed';
        currentStep.result = stepResult;
        currentStep.endTime = new Date().toISOString();
        
      } catch (error) {
        console.error(`步骤执行失败: ${currentStep.name}`, error);
        
        currentStep.status = 'failed';
        currentStep.error = (error as Error).message;
        currentStep.endTime = new Date().toISOString();
        currentStep.retryCount = (currentStep.retryCount || 0) + 1;
        
        // 判断是否需要重试
        if (currentStep.retryCount < (currentStep.maxRetries || 2)) {
          console.log(`⏮️ 重试步骤: ${currentStep.name} (第${currentStep.retryCount}次重试)`);
          currentStep.status = 'pending';
          return this.executeNextStep(workflow);
        } else {
          // 重试次数用完，根据步骤重要性决定是否继续
          if (currentStep.priority === 'critical') {
            workflow.status = 'failed';
            return {
              workflow,
              stepResult: { error: `关键步骤失败: ${currentStep.name}` },
              shouldContinue: false
            };
          }
        }
        
        stepResult = { error: currentStep.error };
      }
      
      // 更新进度
      workflow.currentStepIndex++;
      workflow.progress = Math.round((workflow.currentStepIndex / workflow.steps.length) * 100);
      
      return {
        workflow,
        stepResult,
        shouldContinue: workflow.currentStepIndex < workflow.steps.length && workflow.status === 'running'
      };
      
    } catch (error) {
      console.error('工作流执行失败:', error);
      workflow.status = 'failed';
      throw error;
    }
  }
  
  // 私有方法实现
  
  private static analyzeTaskComplexity(userIntent: string, pageContext: any): 'low' | 'medium' | 'high' | 'expert' {
    let complexity: 'low' | 'medium' | 'high' | 'expert' = 'low';
    const intent = userIntent.toLowerCase();
    
    // 复杂度评估指标
    const indicators = {
      multiStep: /创建.*并.*|首先.*然后.*|步骤.*流程/.test(intent),
      dataInput: /填写|输入|提交|表单/.test(intent),
      navigation: /跳转|导航|页面|打开/.test(intent),
      validation: /检查|验证|确认|测试/.test(intent),
      workflow: /工作流|流程|批量|自动化/.test(intent),
      integration: /集成|同步|对接|导入/.test(intent)
    };
    
    const pageComplexity = pageContext?.currentState?.forms?.length > 2 || 
                          pageContext?.availableActions?.length > 10;
    
    const score = Object.values(indicators).filter(Boolean).length;
    
    if (score >= 4 || indicators.integration || indicators.workflow) {
      complexity = 'expert';
    } else if (score >= 3 || pageComplexity) {
      complexity = 'high';
    } else if (score >= 2 || indicators.multiStep) {
      complexity = 'medium';
    }
    
    return complexity;
  }
  
  private static async generateWorkflowSteps(
    userIntent: string,
    pageContext: any,
    availableTools: string[],
    expectedOutcome: string
  ): Promise<WorkflowStep[]> {
    const steps: WorkflowStep[] = [];
    const intent = userIntent.toLowerCase();
    
    // 1. 总是先分析任务复杂度
    steps.push({
      id: 'step_analyze',
      type: 'analyze',
      name: '任务复杂度分析',
      description: '分析用户请求的复杂度和所需工具',
      action: 'analyze_task_complexity',
      params: { userInput: userIntent },
      priority: 'high',
      status: 'pending',
      maxRetries: 1
    });
    
    // 2. 如果需要创建TodoList
    if (this.needsTodoList(userIntent)) {
      steps.push({
        id: 'step_create_todo',
        type: 'todo_update',
        name: '创建任务清单',
        description: '为复杂任务创建TodoList管理',
        action: 'create_todo_list',
        params: { task: userIntent },
        dependencies: ['step_analyze'],
        priority: 'high',
        status: 'pending',
        maxRetries: 2
      });
    }
    
    // 3. 如果涉及页面操作
    if (this.needsPageOperations(userIntent)) {
      // 获取页面结构
      steps.push({
        id: 'step_scan_page',
        type: 'scan',
        name: '页面结构扫描',
        description: '获取当前页面的详细结构信息',
        action: 'get_page_structure',
        params: { include_content: true },
        priority: 'medium',
        status: 'pending',
        maxRetries: 2
      });
      
      // 注意：导航工具（navigate_to_page）已移除
      
      // 如果需要表单操作
      if (intent.includes('填写') || intent.includes('提交') || intent.includes('创建')) {
        steps.push({
          id: 'step_fill_form',
          type: 'input',
          name: '表单填写',
          description: '填写页面表单数据',
          action: 'fill_form',
          params: { 
            form_data: this.extractFormData(userIntent),
            auto_submit: false 
          },
          dependencies: ['step_validate_nav'],
          priority: 'high',
          status: 'pending',
          maxRetries: 3
        });
        
        steps.push({
          id: 'step_submit',
          type: 'click',
          name: '提交表单',
          description: '提交填写完成的表单',
          action: 'submit_form',
          params: { confirm_before_submit: true },
          dependencies: ['step_fill_form'],
          priority: 'critical',
          status: 'pending',
          maxRetries: 2
        });
        
        // 提交后验证
        steps.push({
          id: 'step_validate_submit',
          type: 'validate',
          name: '提交结果验证',
          description: '验证表单提交是否成功',
          action: 'validate_page_state',
          params: { 
            expected_text: ['成功', '完成', '已保存'],
            expected_elements: ['.success', '.el-message--success'] 
          },
          dependencies: ['step_submit'],
          priority: 'medium',
          status: 'pending',
          maxRetries: 3
        });
      }
    }
    
    // 4. 如果是数据库直接操作
    if (this.needsDirectDatabaseOperation(userIntent)) {
      steps.push({
        id: 'step_db_operation',
        type: 'click',
        name: '数据库操作',
        description: '直接执行数据库操作',
        action: this.getDatabaseAction(userIntent),
        params: this.extractDatabaseParams(userIntent),
        priority: 'critical',
        status: 'pending',
        maxRetries: 2
      });
    }
    
    // 5. 最终状态更新
    if (this.needsTodoList(userIntent)) {
      steps.push({
        id: 'step_final_update',
        type: 'todo_update',
        name: '任务状态更新',
        description: '更新TodoList任务完成状态',
        action: 'update_todo_task',
        params: { 
          taskId: 'final_task',
          status: 'completed' 
        },
        dependencies: steps.slice(-2).map(s => s.id),
        priority: 'low',
        status: 'pending',
        maxRetries: 1
      });
    }
    
    return steps.filter(step => step); // 过滤空步骤
  }
  
  private static async executeStep(step: WorkflowStep, workflow: SmartWorkflow): Promise<any> {
    // 这里会调用对应的Function Tools
    // 实际实现中，这里会调用 FunctionToolsService.executeFunctionCall
    console.log(`🎯 执行步骤: ${step.action}`, step.params);

    // 模拟执行结果
    return {
      success: true,
      action: step.action,
      message: `步骤 ${step.name} 执行完成`,
      data: step.params
    };
  }

  private static formatWorkflowResult(workflow: SmartWorkflow, results: any[]): string {
    return `工作流 "${workflow.name}" 执行完成，共 ${results.length} 个步骤`;
  }

  // ========== 辅助方法 ==========

  /**
   * 提取工作流名称
   */
  private static extractWorkflowName(userIntent: string): string {
    // 从用户意图中提取简短的工作流名称
    const words = userIntent.split(/\s+/).slice(0, 5);
    return words.join(' ');
  }

  /**
   * 计算预计执行时间（分钟）
   */
  private static calculateEstimatedDuration(steps: WorkflowStep[]): number {
    return steps.reduce((total, step) => total + (step.estimatedTime || 1), 0);
  }

  /**
   * 评估风险等级
   */
  private static assessRiskLevel(steps: WorkflowStep[], currentPage: any): 'low' | 'medium' | 'high' {
    const criticalSteps = steps.filter(s => s.priority === 'critical').length;
    if (criticalSteps > 3) return 'high';
    if (criticalSteps > 1) return 'medium';
    return 'low';
  }

  /**
   * 生成成功标准
   */
  private static generateSuccessCriteria(userIntent: string, expectedOutcome: string): string[] {
    return [
      '所有步骤成功执行',
      expectedOutcome || '达到预期目标',
      '无错误或异常'
    ];
  }

  /**
   * 生成备用方案
   */
  private static generateFallbackPlan(userIntent: string, currentPage: any): string[] {
    return [
      '如果步骤失败，尝试重试',
      '如果多次失败，通知用户',
      '保存当前进度，等待人工介入'
    ];
  }

  /**
   * 检查步骤依赖
   */
  private static checkDependencies(currentStep: WorkflowStep, allSteps: WorkflowStep[]): boolean {
    if (!currentStep.dependencies || currentStep.dependencies.length === 0) {
      return true;
    }

    return currentStep.dependencies.every(depId => {
      const depStep = allSteps.find(s => s.id === depId);
      return depStep && depStep.status === 'completed';
    });
  }

  /**
   * 判断是否需要TodoList
   */
  private static needsTodoList(userIntent: string): boolean {
    const todoKeywords = ['待办', 'todo', '任务列表', '清单'];
    return todoKeywords.some(keyword => userIntent.toLowerCase().includes(keyword));
  }

  /**
   * 判断是否需要页面操作
   */
  private static needsPageOperations(userIntent: string): boolean {
    const pageKeywords = ['打开', '导航', '跳转', '页面', '查看'];
    return pageKeywords.some(keyword => userIntent.includes(keyword));
  }

  /**
   * 提取表单数据
   */
  private static extractFormData(userIntent: string): Record<string, any> {
    // 简单实现：从用户意图中提取可能的表单数据
    return {};
  }

  /**
   * 判断是否需要直接数据库操作
   */
  private static needsDirectDatabaseOperation(userIntent: string): boolean {
    const dbKeywords = ['创建', '添加', '更新', '删除', '查询'];
    return dbKeywords.some(keyword => userIntent.includes(keyword));
  }

  /**
   * 获取数据库操作类型
   */
  private static getDatabaseAction(userIntent: string): string {
    if (userIntent.includes('创建') || userIntent.includes('添加')) return 'create';
    if (userIntent.includes('更新') || userIntent.includes('修改')) return 'update';
    if (userIntent.includes('删除')) return 'delete';
    if (userIntent.includes('查询') || userIntent.includes('查找')) return 'query';
    return 'query';
  }

  /**
   * 提取数据库操作参数
   */
  private static extractDatabaseParams(userIntent: string): Record<string, any> {
    // 简单实现：从用户意图中提取可能的数据库参数
    return {};
  }
}