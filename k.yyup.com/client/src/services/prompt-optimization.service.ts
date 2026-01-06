/**
 * 提示词优化服务
 * 提供智能提示词推荐、优化和效果评估功能
 */

import { aiService } from '@/utils/request'
import type { 
  AIShortcut, 
  AIShortcutQuery,
  AIShortcutForm 
} from '@/api/ai-shortcuts'
import { getAIShortcuts, getUserShortcuts } from '@/api/ai-shortcuts'

/**
 * 提示词使用统计
 */
export interface PromptUsageStats {
  promptId: number
  usageCount: number
  successRate: number
  averageRating: number
  lastUsedAt: string
  feedbackCount: {
    positive: number
    negative: number
  }
}

/**
 * 提示词推荐请求
 */
export interface PromptRecommendationRequest {
  context: string
  userRole: string
  category?: string
  previousPrompts?: number[]
  excludeIds?: number[]
  limit?: number
}

/**
 * 提示词推荐结果
 */
export interface PromptRecommendation {
  prompt: AIShortcut
  score: number
  reasons: string[]
  estimatedEffectiveness: number
  similarContexts: string[]
}

/**
 * 提示词优化建议
 */
export interface PromptOptimizationSuggestion {
  type: 'clarity' | 'specificity' | 'structure' | 'tone' | 'length'
  description: string
  originalText: string
  suggestedText: string
  impact: 'high' | 'medium' | 'low'
  reasoning: string
}

/**
 * 提示词效果分析
 */
export interface PromptEffectiveness {
  promptId: number
  overallScore: number
  metrics: {
    clarity: number
    specificity: number
    completeness: number
    userSatisfaction: number
    taskCompletion: number
  }
  recommendations: PromptOptimizationSuggestion[]
  usageTrend: {
    date: string
    usageCount: number
    averageRating: number
  }[]
}

/**
 * 智能提示词服务
 */
export class PromptOptimizationService {
  private static instance: PromptOptimizationService
  private promptCache: Map<string, AIShortcut[]> = new Map()
  private usageStatsCache: Map<number, PromptUsageStats> = new Map()

  private constructor() {}

  public static getInstance(): PromptOptimizationService {
    if (!PromptOptimizationService.instance) {
      PromptOptimizationService.instance = new PromptOptimizationService()
    }
    return PromptOptimizationService.instance
  }

  /**
   * 获取智能提示词推荐
   */
  async getSmartRecommendations(
    request: PromptRecommendationRequest
  ): Promise<PromptRecommendation[]> {
    try {
      // 获取用户可用的提示词
      const availablePrompts = await this.getAvailablePrompts(request.userRole, request.category)
      
      // 调用AI服务进行智能推荐
      const response = await aiService.post('/ai/prompts/recommendations', {
        context: request.context,
        userRole: request.userRole,
        availablePrompts: availablePrompts.map(p => ({
          id: p.id,
          name: p.prompt_name,
          category: p.category,
          systemPrompt: p.system_prompt
        })),
        previousPrompts: request.previousPrompts,
        excludeIds: request.excludeIds,
        limit: request.limit || 5
      })

      return response.data?.recommendations || []
    } catch (error) {
      console.error('获取智能提示词推荐失败:', error)
      // 降级到基于规则的推荐
      return this.getRuleBasedRecommendations(request)
    }
  }

  /**
   * 获取基于规则的推荐（降级方案）
   */
  private async getRuleBasedRecommendations(
    request: PromptRecommendationRequest
  ): Promise<PromptRecommendation[]> {
    const availablePrompts = await this.getAvailablePrompts(request.userRole, request.category)
    
    // 简单的关键词匹配算法
    const recommendations: PromptRecommendation[] = availablePrompts
      .filter(prompt => !request.excludeIds?.includes(prompt.id))
      .map(prompt => {
        const score = this.calculateRelevanceScore(request.context, prompt)
        return {
          prompt,
          score,
          reasons: this.generateRecommendationReasons(request.context, prompt),
          estimatedEffectiveness: Math.min(90, score * 100),
          similarContexts: this.extractSimilarContexts(request.context, prompt)
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, request.limit || 5)

    return recommendations
  }

  /**
   * 计算相关性分数
   */
  private calculateRelevanceScore(context: string, prompt: AIShortcut): number {
    const contextWords = context.toLowerCase().split(/\s+/)
    const promptWords = prompt.system_prompt.toLowerCase().split(/\s+/)
    const promptNameWords = prompt.prompt_name.toLowerCase().split(/\s+/)
    
    let score = 0
    
    // 关键词匹配
    contextWords.forEach(word => {
      if (promptWords.includes(word) || promptNameWords.includes(word)) {
        score += 1
      }
    })
    
    // 类别匹配
    if (context.toLowerCase().includes(prompt.category.toLowerCase())) {
      score += 5
    }
    
    // 归一化分数
    const maxPossibleScore = contextWords.length + 5
    return Math.min(1, score / maxPossibleScore)
  }

  /**
   * 生成推荐原因
   */
  private generateRecommendationReasons(context: string, prompt: AIShortcut): string[] {
    const reasons: string[] = []
    
    const contextLower = context.toLowerCase()
    const promptLower = prompt.system_prompt.toLowerCase()
    const nameLower = prompt.prompt_name.toLowerCase()
    
    if (contextLower.includes(nameLower) || nameLower.includes(contextLower)) {
      reasons.push('与当前需求高度匹配')
    }
    
    if (prompt.category && contextLower.includes(prompt.category.toLowerCase())) {
      reasons.push(`适用于${prompt.category}场景`)
    }
    
    const commonWords = contextLower.split(/\s+/).filter(word => 
      promptLower.includes(word) && word.length > 2
    )
    
    if (commonWords.length > 0) {
      reasons.push(`包含相关关键词: ${commonWords.slice(0, 3).join(', ')}`)
    }
    
    return reasons.length > 0 ? reasons : ['通用推荐']
  }

  /**
   * 提取相似场景
   */
  private extractSimilarContexts(context: string, prompt: AIShortcut): string[] {
    // 基于关键词提取相似场景
    const keywords = context.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    const similarContexts: string[] = []
    
    // 预定义的场景映射
    const scenarioMap: Record<string, string[]> = {
      '招生': ['招生计划制定', '招生渠道分析', '招生效果评估'],
      '活动': ['活动策划方案', '活动执行监控', '活动效果分析'],
      '教学': ['课程设计', '教学评估', '学习进度跟踪'],
      '管理': ['园务管理', '人员管理', '财务管理'],
      '家长': ['家长沟通', '家长满意度', '家园共育']
    }
    
    keywords.forEach(keyword => {
      if (scenarioMap[keyword]) {
        similarContexts.push(...scenarioMap[keyword])
      }
    })
    
    return [...new Set(similarContexts)].slice(0, 3)
  }

  /**
   * 获取可用的提示词
   */
  private async getAvailablePrompts(userRole: string, category?: string): Promise<AIShortcut[]> {
    const cacheKey = `${userRole}-${category || 'all'}`
    
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey)!
    }

    try {
      const params: AIShortcutQuery = {
        role: userRole === 'all' ? undefined : userRole,
        category,
        is_active: true,
        pageSize: 100
      }
      
      const response = await getAIShortcuts(params)
      const prompts = response.data?.list || []
      
      this.promptCache.set(cacheKey, prompts)
      return prompts
    } catch (error) {
      console.error('获取可用提示词失败:', error)
      return []
    }
  }

  /**
   * 获取提示词使用统计
   */
  async getPromptUsageStats(promptId: number): Promise<PromptUsageStats | null> {
    if (this.usageStatsCache.has(promptId)) {
      return this.usageStatsCache.get(promptId)!
    }

    try {
      const response = await aiService.get(`/ai/prompts/${promptId}/stats`)
      const stats = response.data
      
      this.usageStatsCache.set(promptId, stats)
      return stats
    } catch (error) {
      console.error(`获取提示词 ${promptId} 使用统计失败:`, error)
      return null
    }
  }

  /**
   * 分析提示词效果
   */
  async analyzePromptEffectiveness(promptId: number): Promise<PromptEffectiveness | null> {
    try {
      const response = await aiService.get(`/ai/prompts/${promptId}/effectiveness`)
      return response.data
    } catch (error) {
      console.error(`分析提示词 ${promptId} 效果失败:`, error)
      return null
    }
  }

  /**
   * 获取提示词优化建议
   */
  async getOptimizationSuggestions(promptText: string): Promise<PromptOptimizationSuggestion[]> {
    try {
      const response = await aiService.post('/ai/prompts/optimize-suggestions', {
        promptText,
        analysisType: 'comprehensive'
      })
      
      return response.data?.suggestions || []
    } catch (error) {
      console.error('获取提示词优化建议失败:', error)
      return this.getBasicOptimizationSuggestions(promptText)
    }
  }

  /**
   * 获取基础优化建议（降级方案）
   */
  private getBasicOptimizationSuggestions(promptText: string): PromptOptimizationSuggestion[] {
    const suggestions: PromptOptimizationSuggestion[] = []
    
    // 长度检查
    if (promptText.length < 50) {
      suggestions.push({
        type: 'length',
        description: '提示词过短',
        originalText: promptText,
        suggestedText: promptText + ' 请提供更详细的背景信息和具体要求。',
        impact: 'medium',
        reasoning: '更长的提示词通常能提供更清晰的指导'
      })
    }
    
    if (promptText.length > 1000) {
      suggestions.push({
        type: 'length',
        description: '提示词过长',
        originalText: promptText,
        suggestedText: promptText.substring(0, 500) + '...',
        impact: 'low',
        reasoning: '过长的提示词可能导致AI理解困难'
      })
    }
    
    // 结构性检查
    if (!promptText.includes('请') && !promptText.includes('需要')) {
      suggestions.push({
        type: 'clarity',
        description: '缺乏明确的指令',
        originalText: promptText,
        suggestedText: '请' + promptText,
        impact: 'high',
        reasoning: '明确的指令有助于AI理解任务要求'
      })
    }
    
    // 具体性检查
    const vagueWords = ['一些', '几个', '相关', '适当', '合适']
    const hasVagueWords = vagueWords.some(word => promptText.includes(word))
    
    if (hasVagueWords) {
      suggestions.push({
        type: 'specificity',
        description: '提示词过于模糊',
        originalText: promptText,
        suggestedText: promptText.replace(/一些/g, '具体的').replace(/相关/g, '相关的'),
        impact: 'medium',
        reasoning: '具体的描述能获得更准确的回答'
      })
    }
    
    return suggestions
  }

  /**
   * 记录提示词使用
   */
  async recordPromptUsage(promptId: number, context: string, result: any): Promise<void> {
    try {
      await aiService.post('/ai/prompts/usage', {
        promptId,
        context,
        result: {
          success: result?.success || false,
          rating: result?.rating,
          feedback: result?.feedback
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('记录提示词使用失败:', error)
    }
  }

  /**
   * 获取热门提示词
   */
  async getTrendingPrompts(userRole: string, limit: number = 10): Promise<AIShortcut[]> {
    try {
      const response = await aiService.get('/ai/prompts/trending', {
        params: { userRole, limit }
      })
      
      return response.data?.prompts || []
    } catch (error) {
      console.error('获取热门提示词失败:', error)
      return []
    }
  }

  /**
   * 搜索提示词
   */
  async searchPrompts(query: string, userRole: string): Promise<AIShortcut[]> {
    try {
      const response = await aiService.get('/ai/prompts/search', {
        params: { query, userRole }
      })
      
      return response.data?.results || []
    } catch (error) {
      console.error('搜索提示词失败:', error)
      // 降级到本地搜索
      return this.localSearchPrompts(query, userRole)
    }
  }

  /**
   * 本地搜索提示词（降级方案）
   */
  private async localSearchPrompts(query: string, userRole: string): Promise<AIShortcut[]> {
    const availablePrompts = await this.getAvailablePrompts(userRole)
    const queryLower = query.toLowerCase()
    
    return availablePrompts.filter(prompt => 
      prompt.prompt_name.toLowerCase().includes(queryLower) ||
      prompt.system_prompt.toLowerCase().includes(queryLower) ||
      prompt.category.toLowerCase().includes(queryLower)
    )
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.promptCache.clear()
    this.usageStatsCache.clear()
  }
}

// 导出单例实例
export const promptOptimizationService = PromptOptimizationService.getInstance()

export default promptOptimizationService