/**
 * 🧠 AI任务规划器
 * 
 * 智能工作流编排引擎 - 类似Claude的多轮任务执行机制
 * 能够理解复杂任务、自动分解、动态规划、智能执行
 */

import { mobileAPIService } from './mobile-api.service'
import { mobileStorageService, StorageType } from './mobile-storage.service'
import { mobileNotificationService } from './mobile-notification.service'
import type { AgentType, ExpertConsultationType } from '../types/mobile-agents'

// 任务类型枚举
export enum TaskType {
  ACTIVITY_PLANNING = 'activity_planning',
  RECRUITMENT_STRATEGY = 'recruitment_strategy',
  CURRICULUM_DESIGN = 'curriculum_design',
  COST_ANALYSIS = 'cost_analysis',
  RISK_ASSESSMENT = 'risk_assessment',
  CONTENT_CREATION = 'content_creation',
  COMPREHENSIVE_REPORT = 'comprehensive_report'
}

// 工具类型枚举
export enum ToolType {
  IMAGE_GENERATION = 'image_generation',
  DOCUMENT_GENERATION = 'document_generation',
  DATA_VISUALIZATION = 'data_visualization',
  HISTORICAL_ANALYSIS = 'historical_analysis',
  EXPERT_CONSULTATION = 'expert_consultation',
  SMART_EXPERT = 'smart_expert'
}

// 任务步骤接口
export interface TaskStep {
  id: string
  name: string
  description: string
  type: 'expert' | 'tool' | 'analysis' | 'integration'
  dependencies: string[]
  inputs: Record<string, any>
  outputs: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
  executionTime?: number
  retryCount?: number
}

// 执行计划接口
export interface ExecutionPlan {
  id: string
  taskDescription: string
  taskType: TaskType
  steps: TaskStep[]
  context: TaskContext
  metadata: {
    estimatedDuration: number
    complexity: 'low' | 'medium' | 'high'
    requiredTools: ToolType[]
    requiredExperts: (AgentType | ExpertConsultationType)[]
    createdAt: string
  }
}

// 任务上下文接口
export interface TaskContext {
  originalRequest: string
  userRequirements: Record<string, any>
  intermediateResults: Record<string, any>
  sharedData: Record<string, any>
  constraints: Record<string, any>
}

// 执行结果接口
export interface ExecutionResult {
  planId: string
  status: 'completed' | 'failed' | 'partial'
  results: Record<string, any>
  summary: string
  recommendations: string[]
  artifacts: {
    documents: string[]
    images: string[]
    data: any[]
  }
  metrics: {
    totalSteps: number
    completedSteps: number
    failedSteps: number
    totalExecutionTime: number
    successRate: number
  }
}

export class AITaskPlannerService {
  private activePlans = new Map<string, ExecutionPlan>()
  private executionHistory: ExecutionResult[] = []

  constructor() {
    this.loadExecutionHistory()
  }

  // ==================== 核心规划方法 ====================

  /**
   * 智能生成执行计划
   */
  async generatePlan(taskDescription: string, userRequirements: Record<string, any> = {}): Promise<ExecutionPlan> {
    console.log('🧠 开始智能任务规划:', taskDescription)

    try {
      // 1. 任务理解和分类
      const taskType = await this.classifyTask(taskDescription)
      
      // 2. 需求分析
      const analyzedRequirements = await this.analyzeRequirements(taskDescription, userRequirements)
      
      // 3. 生成执行步骤
      const steps = await this.generateSteps(taskType, analyzedRequirements)
      
      // 4. 优化执行顺序
      const optimizedSteps = this.optimizeStepOrder(steps)
      
      // 5. 创建执行计划
      const plan: ExecutionPlan = {
        id: this.generatePlanId(),
        taskDescription,
        taskType,
        steps: optimizedSteps,
        context: {
          originalRequest: taskDescription,
          userRequirements: analyzedRequirements,
          intermediateResults: {},
          sharedData: {},
          constraints: this.extractConstraints(analyzedRequirements)
        },
        metadata: {
          estimatedDuration: this.estimateDuration(optimizedSteps),
          complexity: this.assessComplexity(optimizedSteps),
          requiredTools: this.extractRequiredTools(optimizedSteps),
          requiredExperts: this.extractRequiredExperts(optimizedSteps),
          createdAt: new Date().toISOString()
        }
      }

      // 6. 保存计划
      this.activePlans.set(plan.id, plan)
      await this.savePlan(plan)

      console.log('✅ 执行计划生成完成:', plan.id)
      return plan

    } catch (error) {
      console.error('❌ 执行计划生成失败:', error)
      throw error
    }
  }

  /**
   * 执行计划
   */
  async executePlan(planId: string, onProgress?: (step: TaskStep, progress: number) => void): Promise<ExecutionResult> {
    const plan = this.activePlans.get(planId)
    if (!plan) {
      throw new Error(`执行计划不存在: ${planId}`)
    }

    console.log('🚀 开始执行计划:', planId)

    const startTime = Date.now()
    let completedSteps = 0
    let failedSteps = 0

    try {
      // 按依赖关系执行步骤
      for (const step of plan.steps) {
        if (this.canExecuteStep(step, plan)) {
          await this.executeStep(step, plan)
          
          if (step.status === 'completed') {
            completedSteps++
          } else if (step.status === 'failed') {
            failedSteps++
          }

          // 进度回调
          const progress = ((completedSteps + failedSteps) / plan.steps.length) * 100
          onProgress?.(step, progress)

          // 更新计划
          await this.updatePlan(plan)
        }
      }

      // 整合最终结果
      const finalResults = await this.integrateResults(plan)

      // 生成执行结果
      const result: ExecutionResult = {
        planId,
        status: failedSteps === 0 ? 'completed' : (completedSteps > 0 ? 'partial' : 'failed'),
        results: finalResults,
        summary: await this.generateSummary(plan, finalResults),
        recommendations: await this.generateRecommendations(plan, finalResults),
        artifacts: this.extractArtifacts(finalResults),
        metrics: {
          totalSteps: plan.steps.length,
          completedSteps,
          failedSteps,
          totalExecutionTime: Date.now() - startTime,
          successRate: completedSteps / plan.steps.length
        }
      }

      // 保存执行历史
      this.executionHistory.push(result)
      await this.saveExecutionHistory()

      console.log('✅ 计划执行完成:', planId)
      return result

    } catch (error) {
      console.error('❌ 计划执行失败:', error)
      throw error
    }
  }

  // ==================== 任务理解和分析 ====================

  private async classifyTask(taskDescription: string): Promise<TaskType> {
    // 使用AI分析任务类型
    const response = await mobileAPIService.callSmartExpert({
      expert_id: 'activity_planner',
      task: `请分析以下任务的类型：${taskDescription}`,
      context: '任务分类分析'
    })

    // 简化的分类逻辑（实际应该更智能）
    if (taskDescription.includes('活动') || taskDescription.includes('策划')) {
      return TaskType.ACTIVITY_PLANNING
    } else if (taskDescription.includes('招生') || taskDescription.includes('营销')) {
      return TaskType.RECRUITMENT_STRATEGY
    } else if (taskDescription.includes('课程') || taskDescription.includes('教学')) {
      return TaskType.CURRICULUM_DESIGN
    } else if (taskDescription.includes('成本') || taskDescription.includes('预算')) {
      return TaskType.COST_ANALYSIS
    } else {
      return TaskType.COMPREHENSIVE_REPORT
    }
  }

  private async analyzeRequirements(taskDescription: string, userRequirements: Record<string, any>): Promise<Record<string, any>> {
    // 使用AI分析需求
    const response = await mobileAPIService.callSmartExpert({
      expert_id: 'education_expert',
      task: `请分析以下任务的具体需求：${taskDescription}`,
      context: '需求分析'
    })

    // 提取关键信息
    const requirements = {
      ...userRequirements,
      // 从描述中提取的信息
      participantCount: this.extractNumber(taskDescription, ['人', '参加', '参会']),
      budget: this.extractNumber(taskDescription, ['元', '预算', '成本']),
      timeline: this.extractTimeline(taskDescription),
      deliverables: this.extractDeliverables(taskDescription)
    }

    return requirements
  }

  private async generateSteps(taskType: TaskType, requirements: Record<string, any>): Promise<TaskStep[]> {
    const steps: TaskStep[] = []

    switch (taskType) {
      case TaskType.ACTIVITY_PLANNING:
        steps.push(
          this.createStep('analyze_history', '历史数据分析', 'analysis', [], {
            activityType: requirements.activityType || '开学活动',
            participantCount: requirements.participantCount
          }),
          this.createStep('theme_planning', '活动主题策划', 'expert', ['analyze_history'], {
            expert: 'activity_planner',
            requirements
          }),
          this.createStep('budget_analysis', '预算分析', 'expert', ['analyze_history'], {
            expert: 'cost_analyst',
            budget: requirements.budget
          }),
          this.createStep('poster_design', '海报设计', 'tool', ['theme_planning'], {
            tool: 'image_generation',
            theme: '${theme_planning.result.theme}'
          }),
          this.createStep('process_design', '流程设计', 'expert', ['theme_planning', 'budget_analysis'], {
            expert: 'activity_planner',
            theme: '${theme_planning.result}',
            budget: '${budget_analysis.result}'
          }),
          this.createStep('risk_assessment', '风险评估', 'expert', ['process_design'], {
            expert: 'risk_assessor',
            process: '${process_design.result}'
          }),
          this.createStep('final_report', '综合报告生成', 'integration', ['poster_design', 'process_design', 'risk_assessment'], {
            tool: 'document_generation',
            inputs: ['theme_planning', 'budget_analysis', 'poster_design', 'process_design', 'risk_assessment']
          })
        )
        break

      case TaskType.RECRUITMENT_STRATEGY:
        steps.push(
          this.createStep('market_analysis', '市场分析', 'expert', [], {
            expert: 'marketing_expert',
            requirements
          }),
          this.createStep('strategy_design', '策略设计', 'expert', ['market_analysis'], {
            expert: 'marketing_expert',
            marketData: '${market_analysis.result}'
          }),
          this.createStep('cost_planning', '成本规划', 'expert', ['strategy_design'], {
            expert: 'cost_analyst',
            strategy: '${strategy_design.result}'
          }),
          this.createStep('content_creation', '内容创作', 'tool', ['strategy_design'], {
            tool: 'image_generation',
            strategy: '${strategy_design.result}'
          })
        )
        break

      // 其他任务类型...
    }

    return steps
  }

  // ==================== 步骤执行 ====================

  private canExecuteStep(step: TaskStep, plan: ExecutionPlan): boolean {
    // 检查依赖是否完成
    return step.dependencies.every(depId => {
      const depStep = plan.steps.find(s => s.id === depId)
      return depStep?.status === 'completed'
    })
  }

  private async executeStep(step: TaskStep, plan: ExecutionPlan): Promise<void> {
    console.log(`🔄 执行步骤: ${step.name}`)
    
    step.status = 'running'
    const startTime = Date.now()

    try {
      switch (step.type) {
        case 'expert':
          step.result = await this.executeExpertStep(step, plan)
          break
        case 'tool':
          step.result = await this.executeToolStep(step, plan)
          break
        case 'analysis':
          step.result = await this.executeAnalysisStep(step, plan)
          break
        case 'integration':
          step.result = await this.executeIntegrationStep(step, plan)
          break
      }

      step.status = 'completed'
      step.executionTime = Date.now() - startTime

      // 更新上下文
      plan.context.intermediateResults[step.id] = step.result

      console.log(`✅ 步骤完成: ${step.name}`)

    } catch (error) {
      step.status = 'failed'
      step.error = error.message
      step.executionTime = Date.now() - startTime
      
      console.error(`❌ 步骤失败: ${step.name}`, error)

      // 重试逻辑
      if ((step.retryCount || 0) < 3) {
        step.retryCount = (step.retryCount || 0) + 1
        step.status = 'pending'
        console.log(`🔄 重试步骤: ${step.name} (第${step.retryCount}次)`)
      }
    }
  }

  private async executeExpertStep(step: TaskStep, plan: ExecutionPlan): Promise<any> {
    const expertId = step.inputs.expert as AgentType
    const task = this.resolveVariables(step.inputs.task || step.description, plan)
    
    const response = await mobileAPIService.callSmartExpert({
      expert_id: expertId,
      task,
      context: JSON.stringify(step.inputs)
    })

    return {
      expert: expertId,
      advice: response.advice,
      confidence: 0.95,
      timestamp: response.timestamp
    }
  }

  private async executeToolStep(step: TaskStep, plan: ExecutionPlan): Promise<any> {
    const toolType = step.inputs.tool as ToolType
    
    switch (toolType) {
      case ToolType.IMAGE_GENERATION:
        return await this.generateImage(step, plan)
      case ToolType.DOCUMENT_GENERATION:
        return await this.generateDocument(step, plan)
      case ToolType.DATA_VISUALIZATION:
        return await this.generateVisualization(step, plan)
      default:
        throw new Error(`不支持的工具类型: ${toolType}`)
    }
  }

  private async executeAnalysisStep(step: TaskStep, plan: ExecutionPlan): Promise<any> {
    // 执行历史数据分析
    const historicalData = await this.getHistoricalData(step.inputs)
    
    // 使用数据分析专家
    const response = await mobileAPIService.callSmartExpert({
      expert_id: 'cost_analyst',
      task: `请分析以下历史数据：${JSON.stringify(historicalData)}`,
      context: '历史数据分析'
    })

    return {
      historicalData,
      analysis: response.advice,
      insights: this.extractInsights(response.advice)
    }
  }

  private async executeIntegrationStep(step: TaskStep, plan: ExecutionPlan): Promise<any> {
    // 整合多个步骤的结果
    const inputSteps = step.inputs.inputs as string[]
    const results = {}

    for (const stepId of inputSteps) {
      const stepResult = plan.context.intermediateResults[stepId]
      if (stepResult) {
        results[stepId] = stepResult
      }
    }

    // 生成综合报告
    return await this.generateComprehensiveReport(results, plan)
  }

  // ==================== 工具实现 ====================

  private async generateImage(step: TaskStep, plan: ExecutionPlan): Promise<any> {
    // 这里应该调用实际的图片生成API
    // 暂时返回模拟结果
    const prompt = this.resolveVariables(step.inputs.prompt || '活动海报设计', plan)
    
    console.log(`🎨 生成图片: ${prompt}`)
    
    // 模拟图片生成
    return {
      imageUrl: `https://example.com/generated-image-${Date.now()}.png`,
      prompt,
      style: 'professional',
      dimensions: '1024x1024'
    }
  }

  private async generateDocument(step: TaskStep, plan: ExecutionPlan): Promise<any> {
    // 生成文档
    const inputs = step.inputs.inputs as string[]
    const content = []

    for (const stepId of inputs) {
      const result = plan.context.intermediateResults[stepId]
      if (result) {
        content.push({
          section: stepId,
          data: result
        })
      }
    }

    return {
      documentType: 'comprehensive_report',
      content,
      format: 'markdown',
      generatedAt: new Date().toISOString()
    }
  }

  private async generateVisualization(step: TaskStep, plan: ExecutionPlan): Promise<any> {
    // 生成数据可视化
    return {
      chartType: 'budget_breakdown',
      data: step.inputs.data,
      config: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '预算分析图表'
          }
        }
      }
    }
  }

  // ==================== 辅助方法 ====================

  private createStep(id: string, name: string, type: TaskStep['type'], dependencies: string[], inputs: Record<string, any>): TaskStep {
    return {
      id,
      name,
      description: name,
      type,
      dependencies,
      inputs,
      outputs: {},
      status: 'pending'
    }
  }

  private resolveVariables(text: string, plan: ExecutionPlan): string {
    // 解析变量引用，如 ${step_id.result.field}
    return text.replace(/\$\{([^}]+)\}/g, (match, path) => {
      const parts = path.split('.')
      let value = plan.context.intermediateResults
      
      for (const part of parts) {
        value = value?.[part]
      }
      
      return value || match
    })
  }

  private extractNumber(text: string, keywords: string[]): number | undefined {
    for (const keyword of keywords) {
      const regex = new RegExp(`(\\d+)\\s*${keyword}`, 'i')
      const match = text.match(regex)
      if (match) {
        return parseInt(match[1])
      }
    }
    return undefined
  }

  private extractTimeline(text: string): string | undefined {
    const timeRegex = /(\d{4}年\d{1,2}月|\d{1,2}月\d{1,2}日|明天|下周|下月)/g
    const matches = text.match(timeRegex)
    return matches?.[0]
  }

  private extractDeliverables(text: string): string[] {
    const deliverables = []
    if (text.includes('海报')) deliverables.push('poster')
    if (text.includes('流程')) deliverables.push('process')
    if (text.includes('预算')) deliverables.push('budget')
    if (text.includes('报告')) deliverables.push('report')
    return deliverables
  }

  private extractConstraints(requirements: Record<string, any>): Record<string, any> {
    return {
      budget: requirements.budget,
      timeline: requirements.timeline,
      participantCount: requirements.participantCount
    }
  }

  private optimizeStepOrder(steps: TaskStep[]): TaskStep[] {
    // 简单的拓扑排序
    return steps.sort((a, b) => a.dependencies.length - b.dependencies.length)
  }

  private estimateDuration(steps: TaskStep[]): number {
    // 估算执行时间（分钟）
    return steps.length * 2 // 每步骤平均2分钟
  }

  private assessComplexity(steps: TaskStep[]): 'low' | 'medium' | 'high' {
    if (steps.length <= 3) return 'low'
    if (steps.length <= 6) return 'medium'
    return 'high'
  }

  private extractRequiredTools(steps: TaskStep[]): ToolType[] {
    const tools = new Set<ToolType>()
    steps.forEach(step => {
      if (step.type === 'tool' && step.inputs.tool) {
        tools.add(step.inputs.tool as ToolType)
      }
    })
    return Array.from(tools)
  }

  private extractRequiredExperts(steps: TaskStep[]): (AgentType | ExpertConsultationType)[] {
    const experts = new Set<AgentType | ExpertConsultationType>()
    steps.forEach(step => {
      if (step.type === 'expert' && step.inputs.expert) {
        experts.add(step.inputs.expert)
      }
    })
    return Array.from(experts)
  }

  private async integrateResults(plan: ExecutionPlan): Promise<Record<string, any>> {
    // 整合所有步骤的结果
    const results = {}
    
    for (const step of plan.steps) {
      if (step.status === 'completed' && step.result) {
        results[step.id] = step.result
      }
    }

    return results
  }

  private async generateSummary(plan: ExecutionPlan, results: Record<string, any>): Promise<string> {
    // 生成执行摘要
    const response = await mobileAPIService.callSmartExpert({
      expert_id: 'education_expert',
      task: `请为以下任务执行结果生成摘要：${JSON.stringify(results)}`,
      context: '执行摘要生成'
    })

    return response.advice
  }

  private async generateRecommendations(plan: ExecutionPlan, results: Record<string, any>): Promise<string[]> {
    // 生成建议
    const response = await mobileAPIService.callSmartExpert({
      expert_id: 'education_expert',
      task: `基于执行结果，请提供改进建议：${JSON.stringify(results)}`,
      context: '改进建议生成'
    })

    return response.advice.split('\n').filter(line => line.trim())
  }

  private extractArtifacts(results: Record<string, any>): { documents: string[]; images: string[]; data: any[] } {
    const artifacts = {
      documents: [],
      images: [],
      data: []
    }

    Object.values(results).forEach(result => {
      if (result.imageUrl) artifacts.images.push(result.imageUrl)
      if (result.documentType) artifacts.documents.push(result.documentType)
      if (result.data) artifacts.data.push(result.data)
    })

    return artifacts
  }

  private async getHistoricalData(inputs: Record<string, any>): Promise<any> {
    // 获取历史数据
    const historicalData = await mobileStorageService.get('historical_activities', StorageType.LOCAL)
    return historicalData || []
  }

  private extractInsights(analysis: string): string[] {
    // 从分析中提取洞察
    return analysis.split('\n').filter(line => line.includes('洞察') || line.includes('发现'))
  }

  private async generateComprehensiveReport(results: Record<string, any>, plan: ExecutionPlan): Promise<any> {
    // 生成综合报告
    return {
      title: `${plan.taskDescription} - 执行报告`,
      sections: Object.keys(results).map(key => ({
        title: key,
        content: results[key]
      })),
      generatedAt: new Date().toISOString(),
      planId: plan.id
    }
  }

  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async savePlan(plan: ExecutionPlan): Promise<void> {
    await mobileStorageService.set(`plan_${plan.id}`, plan, {
      type: StorageType.LOCAL,
      ttl: 7 * 24 * 60 * 60 * 1000 // 7天
    })
  }

  private async updatePlan(plan: ExecutionPlan): Promise<void> {
    await this.savePlan(plan)
  }

  private async loadExecutionHistory(): Promise<void> {
    const history = await mobileStorageService.get<ExecutionResult[]>('execution_history', StorageType.LOCAL)
    this.executionHistory = history || []
  }

  private async saveExecutionHistory(): Promise<void> {
    await mobileStorageService.set('execution_history', this.executionHistory, {
      type: StorageType.LOCAL,
      ttl: 30 * 24 * 60 * 60 * 1000 // 30天
    })
  }

  // ==================== 公共方法 ====================

  /**
   * 获取执行历史
   */
  getExecutionHistory(): ExecutionResult[] {
    return [...this.executionHistory]
  }

  /**
   * 获取活动计划
   */
  getActivePlans(): ExecutionPlan[] {
    return Array.from(this.activePlans.values())
  }

  /**
   * 取消计划执行
   */
  async cancelPlan(planId: string): Promise<void> {
    const plan = this.activePlans.get(planId)
    if (plan) {
      // 停止正在执行的步骤
      plan.steps.forEach(step => {
        if (step.status === 'running') {
          step.status = 'failed'
          step.error = '用户取消'
        }
      })
      
      await this.updatePlan(plan)
      console.log(`⏹️ 计划已取消: ${planId}`)
    }
  }
}

// 导出单例实例
export const aiTaskPlannerService = new AITaskPlannerService()

export default aiTaskPlannerService
