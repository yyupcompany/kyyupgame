/**
 * 提示词优化组合式函数
 * 提供智能提示词推荐、优化和效果评估功能
 */

import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { promptOptimizationService } from '@/services/prompt-optimization.service'
import type { 
  PromptRecommendation, 
  PromptRecommendationRequest,
  PromptOptimizationSuggestion,
  PromptUsageStats 
} from '@/services/prompt-optimization.service'
import type { AIShortcut } from '@/api/ai-shortcuts'

/**
 * 提示词优化组合式函数返回值
 */
export interface UsePromptOptimizationReturn {
  // 状态
  loading: Ref<boolean>
  error: Ref<string>
  recommendations: Ref<PromptRecommendation[]>
  usageStats: Ref<PromptUsageStats | null>
  
  // 计算属性
  hasRecommendations: ComputedRef<boolean>
  topRecommendation: ComputedRef<PromptRecommendation | null>
  
  // 方法
  getSmartRecommendations: (context: string, userRole: string, category?: string) => Promise<void>
  applyRecommendation: (recommendation: PromptRecommendation) => Promise<void>
  getPromptUsageStats: (promptId: number) => Promise<void>
  recordPromptUsage: (promptId: number, context: string, result: any) => Promise<void>
  refreshRecommendations: () => Promise<void>
  clearError: () => void
}

/**
 * 智能提示词优化组合式函数
 */
export function usePromptOptimization() {
  // 状态
  const loading = ref(false)
  const error = ref('')
  const recommendations = ref<PromptRecommendation[]>([])
  const usageStats = ref<PromptUsageStats | null>(null)
  
  // 当前上下文缓存
  const currentContext = reactive({
    context: '',
    userRole: '',
    category: '' as string | undefined
  })
  
  // 计算属性
  const hasRecommendations = computed(() => recommendations.value.length > 0)
  const topRecommendation = computed(() => 
    recommendations.value.length > 0 ? recommendations.value[0] : null
  )
  
  /**
   * 获取智能推荐
   */
  const getSmartRecommendations = async (
    context: string, 
    userRole: string, 
    category?: string
  ) => {
    loading.value = true
    error.value = ''
    
    try {
      // 缓存当前上下文
      currentContext.context = context
      currentContext.userRole = userRole
      currentContext.category = category
      
      const request: PromptRecommendationRequest = {
        context,
        userRole,
        category,
        limit: 8
      }
      
      const newRecommendations = await promptOptimizationService.getSmartRecommendations(request)
      recommendations.value = newRecommendations
      
      if (newRecommendations.length === 0) {
        ElMessage.info('暂无相关推荐，请尝试其他关键词')
      }
      
    } catch (err) {
      error.value = '获取推荐失败，请稍后重试'
      console.error('获取智能推荐失败:', err)
      ElMessage.error('获取推荐失败')
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 应用推荐
   */
  const applyRecommendation = async (recommendation: PromptRecommendation) => {
    try {
      // 记录使用
      await promptOptimizationService.recordPromptUsage(
        recommendation.prompt.id,
        currentContext.context,
        { success: true, rating: 5 }
      )
      
      ElMessage.success(`已应用推荐提示词: ${recommendation.prompt.prompt_name}`)
      
      // 更新推荐分数（基于用户反馈）
      const index = recommendations.value.findIndex(r => r.prompt.id === recommendation.prompt.id)
      if (index !== -1) {
        recommendations.value[index].score = Math.min(1, recommendation.score * 1.1)
        // 重新排序
        recommendations.value.sort((a, b) => b.score - a.score)
      }
      
    } catch (err) {
      console.error('应用推荐失败:', err)
      ElMessage.error('应用推荐失败')
    }
  }
  
  /**
   * 获取提示词使用统计
   */
  const getPromptUsageStats = async (promptId: number) => {
    loading.value = true
    
    try {
      const stats = await promptOptimizationService.getPromptUsageStats(promptId)
      usageStats.value = stats
      
      if (!stats) {
        ElMessage.info('暂无使用统计')
      }
      
    } catch (err) {
      error.value = '获取使用统计失败'
      console.error('获取使用统计失败:', err)
      ElMessage.error('获取使用统计失败')
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 记录提示词使用
   */
  const recordPromptUsage = async (
    promptId: number, 
    context: string, 
    result: any
  ) => {
    try {
      await promptOptimizationService.recordPromptUsage(promptId, context, result)
    } catch (err) {
      console.error('记录使用失败:', err)
    }
  }
  
  /**
   * 刷新推荐
   */
  const refreshRecommendations = async () => {
    if (currentContext.context) {
      await getSmartRecommendations(
        currentContext.context,
        currentContext.userRole,
        currentContext.category
      )
    }
  }
  
  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = ''
  }
  
  /**
   * 智能推荐快捷方法
   */
  const quickRecommend = async (
    context: string,
    userRole: string,
    options?: {
      category?: string
      onSuccess?: (recommendations: PromptRecommendation[]) => void
      onError?: (error: string) => void
    }
  ) => {
    try {
      await getSmartRecommendations(context, userRole, options?.category)
      
      if (options?.onSuccess) {
        options.onSuccess(recommendations.value)
      }
      
      // 自动应用最佳推荐（如果分数足够高）
      if (topRecommendation.value && topRecommendation.value.score >= 0.8) {
        await applyRecommendation(topRecommendation.value)
      }
      
    } catch (err) {
      if (options?.onError) {
        options.onError(error.value)
      }
    }
  }
  
  /**
   * 基于用户行为学习
   */
  const learnFromUserBehavior = async (
    promptId: number,
    userAction: 'like' | 'dislike' | 'use' | 'ignore',
    context?: string
  ) => {
    try {
      // 记录用户行为用于改进推荐算法
      await promptOptimizationService.recordPromptUsage(promptId, context || '', {
        success: userAction !== 'dislike',
        userAction,
        timestamp: new Date().toISOString()
      })
      
      // 根据用户行为调整推荐权重
      const index = recommendations.value.findIndex(r => r.prompt.id === promptId)
      if (index !== -1) {
        const recommendation = recommendations.value[index]
        
        switch (userAction) {
          case 'like':
            recommendation.score = Math.min(1, recommendation.score * 1.2)
            break
          case 'dislike':
            recommendation.score = Math.max(0, recommendation.score * 0.8)
            break
          case 'use':
            recommendation.score = Math.min(1, recommendation.score * 1.1)
            break
          case 'ignore':
            recommendation.score = Math.max(0, recommendation.score * 0.95)
            break
        }
        
        // 重新排序
        recommendations.value.sort((a, b) => b.score - a.score)
      }
      
    } catch (err) {
      console.error('学习用户行为失败:', err)
    }
  }
  
  /**
   * 获取热门提示词
   */
  const getTrendingPrompts = async (userRole: string, limit = 5) => {
    loading.value = true
    
    try {
      const trendingPrompts = await promptOptimizationService.getTrendingPrompts(userRole, limit)
      return trendingPrompts
    } catch (err) {
      error.value = '获取热门提示词失败'
      console.error('获取热门提示词失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 搜索提示词
   */
  const searchPrompts = async (query: string, userRole: string) => {
    loading.value = true
    
    try {
      const results = await promptOptimizationService.searchPrompts(query, userRole)
      
      // 转换为推荐格式
      const searchRecommendations: PromptRecommendation[] = results.map(prompt => ({
        prompt,
        score: 0.7, // 基础分数
        reasons: [`匹配搜索关键词: "${query}"`],
        estimatedEffectiveness: 75,
        similarContexts: ['搜索结果']
      }))
      
      recommendations.value = searchRecommendations
      
    } catch (err) {
      error.value = '搜索提示词失败'
      console.error('搜索提示词失败:', err)
      ElMessage.error('搜索提示词失败')
    } finally {
      loading.value = false
    }
  }
  
  return {
    // 状态
    loading,
    error,
    recommendations,
    usageStats,
    
    // 计算属性
    hasRecommendations,
    topRecommendation,
    
    // 方法
    getSmartRecommendations,
    applyRecommendation,
    getPromptUsageStats,
    recordPromptUsage,
    refreshRecommendations,
    clearError,
    
    // 扩展方法
    quickRecommend,
    learnFromUserBehavior,
    getTrendingPrompts,
    searchPrompts
  }
}

/**
 * 提示词优化组合式函数 - 轻量级版本
 * 用于简单的推荐场景
 */
export function useSimplePromptOptimization() {
  const { 
    loading, 
    error, 
    recommendations, 
    getSmartRecommendations 
  } = usePromptOptimization()
  
  /**
   * 快速获取最佳推荐
   */
  const getBestRecommendation = async (
    context: string,
    userRole: string,
    category?: string
  ) => {
    await getSmartRecommendations(context, userRole, category)
    
    if (recommendations.value.length > 0) {
      return recommendations.value[0]
    }
    
    return null
  }
  
  return {
    loading,
    error,
    recommendations,
    getBestRecommendation
  }
}