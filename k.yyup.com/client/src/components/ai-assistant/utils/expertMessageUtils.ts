/**
 * 专家消息工具函数
 * 从 AIAssistant.vue 第4000-4188行提取
 */

// 检测是否为专家消息
export const isExpertMessage = (message: any): boolean => {
  if (!message || message.role !== 'assistant') return false

  // 检查消息内容是否包含专家工具调用结果
  const content = message.content || ''

  // 方法1: 检查是否包含专家工具调用的特征标记
  if (content.includes('专家类型') || content.includes('expertType') ||
      content.includes('专家姓名') || content.includes('expertName') ||
      content.includes('专业分析') || content.includes('关键要点') ||
      content.includes('专业建议')) {
    return true
  }

  // 方法2: 检查工具调用历史中是否有专家工具
  if (message.toolCalls && Array.isArray(message.toolCalls)) {
    return message.toolCalls.some((call: any) =>
      call.name === 'consult_recruitment_planner' ||
      call.name === 'call_expert' ||
      call.name === 'get_expert_list'
    )
  }

  // 方法3: 检查消息元数据
  if (message.metadata && message.metadata.expertConsultation) {
    return true
  }

  return false
}

// 提取专家类型
export const getExpertType = (message: any): string => {
  // 从工具调用中提取
  if (message.toolCalls && Array.isArray(message.toolCalls)) {
    const expertCall = message.toolCalls.find((call: any) =>
      call.name === 'consult_recruitment_planner' ||
      call.name === 'call_expert'
    )
    if (expertCall) {
      if (expertCall.name === 'consult_recruitment_planner') {
        return 'recruitment_planner'
      }
      if (expertCall.arguments && expertCall.arguments.expert_id) {
        return expertCall.arguments.expert_id
      }
    }
  }

  // 从消息内容中提取
  const content = message.content || ''
  const expertTypeMatch = content.match(/专家类型[：:]\s*([^\n\r,，]+)/i) ||
                         content.match(/expertType[：:]\s*([^\n\r,，]+)/i)
  if (expertTypeMatch) {
    return expertTypeMatch[1].trim()
  }

  // 默认返回招生专家
  return 'recruitment_planner'
}

// 提取专家姓名
export const getExpertName = (message: any): string => {
  // 从消息内容中提取
  const content = message.content || ''
  const expertNameMatch = content.match(/专家姓名[：:]\s*([^\n\r,，]+)/i) ||
                         content.match(/expertName[：:]\s*([^\n\r,，]+)/i)
  if (expertNameMatch) {
    return expertNameMatch[1].trim()
  }

  // 根据专家类型返回默认名称
  const expertType = getExpertType(message)
  const defaultNames: { [key: string]: string } = {
    'recruitment_planner': '李招生',
    'marketing_expert': '王营销',
    'education_expert': '张教育',
    'cost_analyst': '陈财务',
    'risk_assessor': '刘风控',
    'creative_designer': '赵设计',
    'curriculum_expert': '孙课程'
  }

  return defaultNames[expertType] || '专业顾问'
}

// 提取专家分析内容
export const getExpertAnalysis = (message: any): string => {
  const content = message.content || ''

  // 方法1: 提取专业分析部分
  const analysisMatch = content.match(/专业分析[：:]\s*([\s\S]*?)(?=\n\n|关键要点|专业建议|$)/i)
  if (analysisMatch) {
    return analysisMatch[1].trim()
  }

  // 方法2: 提取分析内容
  const analysisMatch2 = content.match(/分析[：:]\s*([\s\S]*?)(?=\n\n|关键要点|建议|$)/i)
  if (analysisMatch2) {
    return analysisMatch2[1].trim()
  }

  // 方法3: 如果没有特定标记，返回主要内容
  const lines = content.split('\n').filter((line: string) => line.trim())
  if (lines.length > 0) {
    // 跳过标题行，返回主要内容
    const mainContent = lines.slice(1).join('\n').trim()
    if (mainContent.length > 50) {
      return mainContent
    }
  }

  return content.trim()
}

// 提取关键要点
export const getExpertKeyPoints = (message: any): string[] => {
  const content = message.content || ''
  const keyPoints: string[] = []

  // 方法1: 提取关键要点部分
  const keyPointsMatch = content.match(/关键要点[：:]\s*([\s\S]*?)(?=\n\n|专业建议|$)/i)
  if (keyPointsMatch) {
    const pointsText = keyPointsMatch[1].trim()
    const lines = pointsText.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        keyPoints.push(trimmed.substring(1).trim())
      } else if (trimmed.match(/^\d+\./)) {
        keyPoints.push(trimmed.replace(/^\d+\./, '').trim())
      }
    }
  }

  // 方法2: 从整个内容中提取列表项
  if (keyPoints.length === 0) {
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const point = trimmed.substring(1).trim()
        if (point.length > 5 && point.length < 100) {
          keyPoints.push(point)
        }
      } else if (trimmed.match(/^\d+\./)) {
        const point = trimmed.replace(/^\d+\./, '').trim()
        if (point.length > 5 && point.length < 100) {
          keyPoints.push(point)
        }
      }
    }
  }

  return keyPoints.slice(0, 5) // 最多返回5个要点
}

// 提取专业建议
export const getExpertRecommendations = (message: any): string[] => {
  const content = message.content || ''
  const recommendations: string[] = []

  // 方法1: 提取专业建议部分
  const recommendationsMatch = content.match(/专业建议[：:]\s*([\s\S]*?)$/i) ||
                              content.match(/建议[：:]\s*([\s\S]*?)$/i)
  if (recommendationsMatch) {
    const recText = recommendationsMatch[1].trim()
    const lines = recText.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        recommendations.push(trimmed.substring(1).trim())
      } else if (trimmed.match(/^\d+\./)) {
        recommendations.push(trimmed.replace(/^\d+\./, '').trim())
      }
    }
  }

  // 方法2: 查找包含建议关键词的句子
  if (recommendations.length === 0) {
    const sentences = content.split(/[。！？.!?]/)
    for (const sentence of sentences) {
      const trimmed = sentence.trim()
      if (trimmed.includes('建议') || trimmed.includes('推荐') ||
          trimmed.includes('应该') || trimmed.includes('可以考虑')) {
        if (trimmed.length > 10 && trimmed.length < 150) {
          recommendations.push(trimmed)
        }
      }
    }
  }

  return recommendations.slice(0, 3) // 最多返回3个建议
}

// 获取专家头像
export const getExpertAvatar = (expertType: string): string => {
  const avatars: { [key: string]: string } = {
    'recruitment_planner': '👨‍💼',
    'marketing_expert': '📊',
    'education_expert': '👩‍🏫',
    'cost_analyst': '💰',
    'risk_assessor': '🛡️',
    'creative_designer': '🎨',
    'curriculum_expert': '📚'
  }
  
  return avatars[expertType] || '🤖'
}

// 获取专家专业领域
export const getExpertDomain = (expertType: string): string => {
  const domains: { [key: string]: string } = {
    'recruitment_planner': '招生规划',
    'marketing_expert': '营销策略',
    'education_expert': '教育管理',
    'cost_analyst': '成本分析',
    'risk_assessor': '风险评估',
    'creative_designer': '创意设计',
    'curriculum_expert': '课程设计'
  }
  
  return domains[expertType] || '专业咨询'
}

// 获取专家简介
export const getExpertBio = (expertType: string): string => {
  const bios: { [key: string]: string } = {
    'recruitment_planner': '专注幼儿园招生策略规划，拥有10年招生经验',
    'marketing_expert': '精通教育行业营销，擅长品牌推广和市场分析',
    'education_expert': '资深教育管理专家，专注幼儿教育质量提升',
    'cost_analyst': '财务分析专家，擅长成本控制和预算规划',
    'risk_assessor': '风险管理专家，专注教育机构风险评估',
    'creative_designer': '创意设计师，专注教育品牌视觉设计',
    'curriculum_expert': '课程设计专家，专注幼儿课程体系构建'
  }
  
  return bios[expertType] || '专业领域顾问，提供专业咨询服务'
}

// 格式化专家消息
export const formatExpertMessage = (message: any) => {
  if (!isExpertMessage(message)) {
    return null
  }
  
  const expertType = getExpertType(message)
  const expertName = getExpertName(message)
  const analysis = getExpertAnalysis(message)
  const keyPoints = getExpertKeyPoints(message)
  const recommendations = getExpertRecommendations(message)
  
  return {
    expertType,
    expertName,
    expertAvatar: getExpertAvatar(expertType),
    expertDomain: getExpertDomain(expertType),
    expertBio: getExpertBio(expertType),
    analysis,
    keyPoints,
    recommendations,
    originalContent: message.content
  }
}
