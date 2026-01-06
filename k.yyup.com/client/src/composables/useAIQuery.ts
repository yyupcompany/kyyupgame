import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
// 🔧 已移除 useWebSocketProgress - 不再使用WebSocket
// import { aiQueryApi } from '../api/modules/ai-query'
// import type { AIQueryRequest } from '../api/modules/ai-query'

// Mock API and types
const aiQueryApi = {
  query: async (_request: any) => ({
    success: true,
    data: { type: 'data_query', data: [], metadata: {} },
    message: 'Success'
  }),
  executeQuery: async (_request: any) => ({
    success: true,
    data: { type: 'data_query', data: [], metadata: {} },
    message: 'Success'
  }),
  getQueryHistory: async (_params?: any) => ({
    success: true,
    data: { data: [], total: 0 },
    message: 'Success'
  }),
  getStatistics: async () => ({
    success: true,
    data: {},
    message: 'Success'
  })
}
type AIQueryRequest = any

/**
 * AI查询组合式函数
 */
export function useAIQuery() {
  // 响应式状态
  const naturalLanguageQuery = ref('')
  const generatedSQL = ref('')
  const queryResults = ref(null)
  const processing = ref(false)
  const querying = ref(false)
  const currentStep = ref(0)
  const processingMessage = ref('')
  const processingProgress = ref(0)
  const processingTime = ref(0)
  const currentSessionId = ref('')
  const queryHistory = ref([])
  const queryStatistics = ref(null)

  // 🔧 已移除WebSocket进度监听 - 使用模拟进度
  // 保持兼容性的空状态
  const wsConnected = ref(false)
  const currentProgress = ref(null)

  // 计算属性
  const hasResults = computed(() => !!queryResults.value)
  const isSuccessful = computed(() => queryResults.value?.success)
  const resultCount = computed(() => queryResults.value?.metadata?.rowCount || 0)
  const hasRealTimeProgress = computed(() => false) // 始终使用模拟进度

  // 优化后的8步执行流程配置
  const steps = [
    { message: '正在获取AI模型...', progress: 12 },
    { message: '正在获取用户权限表...', progress: 24 },
    { message: '正在分析查询意图和选择表...', progress: 36 },
    { message: '正在获取相关表结构...', progress: 48 },
    { message: '正在生成优化SQL语句...', progress: 60 },
    { message: '正在执行SQL查询...', progress: 72 },
    { message: '正在生成智能可视化...', progress: 84 },
    { message: '正在组装最终响应...', progress: 100 }
  ]

  // 🔧 已移除WebSocket进度回调和连接状态监听
  // 现在始终使用模拟进度
  console.log('✅ [AIQuery] 使用HTTP API模式，采用模拟进度显示')

  /**
   * 执行AI查询 (支持实时进度)
   */
  const executeQuery = async (customQuery?: string, context?: any) => {
    const query = customQuery || naturalLanguageQuery.value
    
    if (!query.trim()) {
      ElMessage.warning('请输入查询内容')
      return
    }

    try {
      // 重置状态
      resetQueryState()
      
      // 开始处理
      processing.value = true
      querying.value = true
      const startTime = Date.now()
      
      // 生成会话ID
      if (!currentSessionId.value) {
        currentSessionId.value = uuidv4()
      }

      // 🔧 已移除WebSocket实时进度订阅
      // 始终使用模拟进度显示
      console.log(`📊 [AIQuery] 使用模拟进度模式: ${currentSessionId.value}`)

      // 模拟AI处理步骤
      await simulateProcessingSteps()

      // 调用API执行查询
      const response = await executeQueryAPI(query, context)
      
      // 处理响应
      if (response.success) {
        // 适配后端返回的优化数据结构
        const apiResponse = response.data || {}

        // 检查是否为数据查询
        if ((apiResponse as any).type === 'data_query') {
          queryResults.value = {
            success: true,
            type: 'data_query',
            data: (apiResponse as any).data || [],
            metadata: {
              rowCount: (apiResponse as any).metadata?.rowCount || 0,
              executionTime: (apiResponse as any).metadata?.executionTime || 0,
              cacheHit: (apiResponse as any).metadata?.cacheHit || false,
              generatedSQL: (apiResponse as any).metadata?.generatedSQL || '',
              usedModel: (apiResponse as any).metadata?.usedModel,
              queryAnalysis: (apiResponse as any).metadata?.queryAnalysis,
              requiredTables: (apiResponse as any).metadata?.requiredTables,
              columns: (apiResponse as any).metadata?.columns || [] // 确保包含列信息
            },
            visualization: (apiResponse as any).visualization,
            sessionId: (apiResponse as any).sessionId,
            queryLogId: (apiResponse as any).queryLogId
          }
          generatedSQL.value = (apiResponse as any).metadata?.generatedSQL || ''
          ElMessage.success('数据查询执行成功')
        } else if ((apiResponse as any).type === 'ai_response') {
          // 处理非数据库查询的AI回答
          queryResults.value = {
            success: true,
            type: 'ai_response',
            response: (apiResponse as any).response,
            isDataQuery: false,
            sessionId: (apiResponse as any).sessionId
          }
          generatedSQL.value = ''
          ElMessage.success('AI回答生成成功')
        } else {
          throw new Error('未知的响应类型')
        }
      } else {
        throw new Error(response.message || '查询执行失败')
      }

      processingTime.value = Date.now() - startTime

    } catch (error: any) {
      console.error('AI查询执行错误:', error)
      ElMessage.error(error.message || '查询执行失败')
      queryResults.value = null
    } finally {
      processing.value = false
      querying.value = false

      // 🔧 已移除WebSocket进度取消订阅
      // 直接重置处理状态
      resetProcessingState()
    }
  }

  /**
   * 模拟AI处理步骤
   */
  const simulateProcessingSteps = async () => {
    for (let i = 0; i < steps.length; i++) {
      currentStep.value = i
      processingMessage.value = steps[i].message
      processingProgress.value = steps[i].progress
      
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
    }
  }

  /**
   * 调用后端API执行查询
   */
  const executeQueryAPI = async (query: string, context?: any) => {
    try {
      const requestData: AIQueryRequest = {
        query,
        context: {
          ...context,
          userRole: context?.userRole || 'admin', // 默认admin权限支持所有表查询
          userId: context?.userId || 1,
          timestamp: new Date().toISOString()
        },
        sessionId: currentSessionId.value
      }

      const response = await aiQueryApi.executeQuery(requestData)
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        }
      } else {
        throw new Error(response.message || '查询执行失败')
      }
    } catch (error: any) {
      console.error('API调用失败:', error)

      // 构造详细的错误信息
      let errorMessage = '网络错误，请稍后重试'

      // 优先使用后端返回的详细错误信息
      const backendErrorMessage = error.response?.data?.message || error.response?.data?.error
      if (backendErrorMessage && typeof backendErrorMessage === 'string') {
        errorMessage = `❌ 查询失败\n\n🔍 详细错误信息：\n${backendErrorMessage}\n\n💡 这是来自服务器的真实错误信息。`
      } else if (error.response?.status) {
        errorMessage = `❌ 查询失败 (状态码: ${error.response.status})\n\n🔍 错误详情：${error.message}\n\n⏰ 发生时间：${new Date().toLocaleString()}`
      } else if (error.message) {
        errorMessage = `❌ 查询失败\n\n🔍 错误详情：${error.message}`
      }

      // 如果API调用失败，返回详细的错误信息
      return {
        success: false,
        message: errorMessage,
        errorDetails: {
          status: error.response?.status,
          code: error.response?.data?.code,
          originalError: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  /**
   * 重新执行查询
   */
  const refreshQuery = async () => {
    if (!naturalLanguageQuery.value) {
      ElMessage.warning('没有可重新执行的查询')
      return
    }
    await executeQuery()
  }

  /**
   * 清空查询
   */
  const clearQuery = () => {
    naturalLanguageQuery.value = ''
    generatedSQL.value = ''
    queryResults.value = null
    currentSessionId.value = ''
    resetProcessingState()
  }

  /**
   * 重置查询状态
   */
  const resetQueryState = () => {
    queryResults.value = null
    generatedSQL.value = ''
  }

  /**
   * 重置处理状态
   */
  const resetProcessingState = () => {
    currentStep.value = 0
    processingMessage.value = ''
    processingProgress.value = 0
  }

  /**
   * 获取查询历史 - 使用真实API
   */
  const fetchQueryHistory = async (page = 1, pageSize = 20, queryType?: 'data_query' | 'ai_response') => {
    try {
      const response = await aiQueryApi.getQueryHistory({ 
        page, 
        pageSize,
        queryType 
      })
      
      if (response.success && response.data) {
        queryHistory.value = response.data.data || []
        return response.data
      } else {
        throw new Error(response.message || '获取查询历史失败')
      }
    } catch (error: any) {
      console.error('获取查询历史失败:', error)
      ElMessage.error('获取查询历史失败')
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      }
    }
  }

  /**
   * 获取查询统计 - 使用真实API
   */
  const fetchQueryStatistics = async () => {
    try {
      const response = await aiQueryApi.getStatistics()
      
      if (response.success && response.data) {
        queryStatistics.value = response.data
        return response.data
      } else {
        throw new Error(response.message || '获取查询统计失败')
      }
    } catch (error: any) {
      console.error('获取查询统计失败:', error)
      ElMessage.error('获取查询统计失败')
      return {
        totalQueries: 0,
        recentQueries: 0,
        cacheHits: 0,
        cacheHitRate: '0%'
      }
    }
  }

  /**
   * 提交查询反馈
   */
  const submitFeedback = async (_feedbackData: {
    queryLogId: number
    rating: number
    feedbackType: string
    comments?: string
    correctedSql?: string
    suggestedImprovement?: string
  }) => {
    try {
      // TODO: 替换为实际的API调用
      // const response = await aiQueryApi.submitFeedback(feedbackData)
      
      ElMessage.success('反馈提交成功，感谢您的建议！')
      return { success: true }
    } catch (error: any) {
      console.error('提交反馈失败:', error)
      ElMessage.error('提交反馈失败')
      return { success: false }
    }
  }

  /**
   * 提交查询反馈 (新方法名)
   */
  const submitQueryFeedback = async (feedbackData: {
    queryLogId: number
    rating: number
    feedbackType: string
    comments?: string
    correctedSql?: string
    suggestedImprovement?: string
  }) => {
    return await submitFeedback(feedbackData)
  }

  /**
   * 验证SQL语法
   */
  const validateSQL = async (sql: string) => {
    try {
      // TODO: 替换为实际的API调用
      // const response = await aiQueryApi.validateSQL(sql)
      
      // 临时模拟验证逻辑
      const trimmedSql = sql.trim().toUpperCase()
      if (!trimmedSql) {
        return {
          success: true,
          data: {
            isValid: false,
            errors: ['SQL语句不能为空']
          }
        }
      }

      // 简单的SQL语法检查
      const isValid = trimmedSql.startsWith('SELECT') || 
                      trimmedSql.startsWith('WITH') ||
                      trimmedSql.startsWith('SHOW')
      
      return {
        success: true,
        data: {
          isValid,
          errors: isValid ? [] : ['SQL语句必须以SELECT、WITH或SHOW开头']
        }
      }
    } catch (error: any) {
      console.error('SQL验证失败:', error)
      return {
        success: false,
        data: {
          isValid: false,
          errors: ['验证服务暂时不可用']
        }
      }
    }
  }

  /**
   * 导出查询结果
   */
  const exportQueryResult = async (_queryLogId: number, format: 'excel' | 'csv' | 'pdf') => {
    try {
      // TODO: 替换为实际的API调用
      // const response = await aiQueryApi.exportResult(queryLogId, format)
      
      ElMessage.success(`${format.toUpperCase()}文件准备中，请稍后下载`)
      return true
    } catch (error: any) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
      return false
    }
  }

  /**
   * 获取查询建议
   */
  const getSuggestions = async (query: string) => {
    try {
      if (query.length < 3) return []

      // TODO: 替换为实际的API调用
      // const response = await aiQueryApi.getSuggestions({ query })
      // return response.data

      // 临时模拟数据
      const suggestions = [
        {
          id: 1,
          displayName: '学生人数统计',
          description: '统计在校学生总数',
          score: 95
        },
        {
          id: 2,
          displayName: '按班级统计学生',
          description: '按班级分组统计学生分布',
          score: 85
        },
        {
          id: 3,
          displayName: '月度入学趋势',
          description: '查看每月学生入学趋势',
          score: 75
        }
      ]

      return suggestions.filter(s => 
        s.displayName.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error: any) {
      console.error('获取建议失败:', error)
      return []
    }
  }

  /**
   * 获取查询模板
   */
  const getQueryTemplates = async (category?: string) => {
    try {
      // TODO: 替换为实际的API调用
      // const response = await aiQueryApi.getTemplates({ category })
      // return response.data

      // 临时模拟数据
      const templates = [
        {
          id: 1,
          name: 'student_count_basic',
          displayName: '学生人数统计',
          description: '统计学生数量的基础模板',
          category: '学生管理',
          exampleQueries: [
            '统计现在有多少学生',
            '查询本月新入学的学生人数',
            '大班有多少学生'
          ],
          usageCount: 156,
          successRate: 95.5
        },
        {
          id: 2,
          name: 'class_analysis',
          displayName: '班级分析',
          description: '班级相关统计分析',
          category: '班级管理',
          exampleQueries: [
            '按班级统计学生数量',
            '查询班级容量情况',
            '哪个班级学生最多'
          ],
          usageCount: 89,
          successRate: 92.1
        }
      ]

      return category 
        ? templates.filter(t => t.category === category)
        : templates
    } catch (error: any) {
      console.error('获取模板失败:', error)
      return []
    }
  }

  return {
    // 状态
    naturalLanguageQuery,
    generatedSQL,
    queryResults,
    processing,
    querying,
    currentStep,
    processingMessage,
    processingProgress,
    processingTime,
    currentSessionId,
    queryHistory,
    queryStatistics,

    // 🔧 保持兼容性的WebSocket状态（始终为false/null）
    wsConnected,
    currentProgress,

    // 计算属性
    hasResults,
    isSuccessful,
    resultCount,
    hasRealTimeProgress,

    // 方法
    executeQuery,
    refreshQuery,
    clearQuery,
    fetchQueryHistory,
    fetchQueryStatistics,
    submitFeedback,
    submitQueryFeedback,
    validateSQL,
    exportQueryResult,
    getSuggestions,
    getQueryTemplates

    // 🔧 已移除WebSocket方法: subscribeQueryProgress, unsubscribeQueryProgress
  }
}

export default useAIQuery