/**
 * 动态专家团队服务
 * 根据不同业务场景配置相应的专家团队
 */

export interface Expert {
  id: string
  name: string
  role: string
  avatar: string
  prompt: string
  specialties: string[]
}

export interface ExpertTeam {
  scenario: string
  planner: Expert
  reviewers: Expert[]
}

export interface ExpertResponse {
  expertId: string
  expertName: string
  message: string
  score?: number
  suggestions?: string[]
  timestamp: number
}

// 专家团队配置
export const expertTeamConfigs: Record<string, ExpertTeam> = {
  // 活动管理场景
  activity: {
    scenario: '活动管理',
    planner: {
      id: 'activity-planner',
      name: '活动策划专家',
      role: '主导活动方案制定和优化',
      avatar: '👨‍💼',
      prompt: '你是资深活动策划专家，擅长制定各类幼儿园活动方案，考虑教育价值、趣味性、安全性和成本控制。',
      specialties: ['活动策划', '项目管理', '教育设计', '预算控制']
    },
    reviewers: [
      {
        id: 'fun-expert',
        name: '趣味性评审专家',
        role: '评估活动吸引力和参与度',
        avatar: '🎯',
        prompt: '你是趣味性评审专家，专注评估活动的吸引力、参与度和娱乐价值。',
        specialties: ['用户体验', '游戏设计', '互动策划', '参与度分析']
      },
      {
        id: 'cost-expert',
        name: '成本控制专家',
        role: '分析预算合理性和资源配置',
        avatar: '💰',
        prompt: '你是成本控制专家，精通预算分析和资源优化配置。',
        specialties: ['预算管理', '成本分析', '资源配置', 'ROI评估']
      },
      {
        id: 'safety-expert',
        name: '安全评估专家',
        role: '评估活动风险和安全措施',
        avatar: '🛡️',
        prompt: '你是安全评估专家，专注活动安全风险评估和防护措施制定。',
        specialties: ['风险评估', '安全管理', '应急预案', '保险规划']
      },
      {
        id: 'edu-expert',
        name: '教育价值专家',
        role: '评估教育意义和发展价值',
        avatar: '🎓',
        prompt: '你是教育价值专家，评估活动的教育意义和儿童发展价值。',
        specialties: ['儿童发展', '教育心理学', '课程设计', '能力培养']
      }
    ]
  },

  // 招生中心场景
  enrollment: {
    scenario: '招生中心',
    planner: {
      id: 'enrollment-planner',
      name: '招生营销专家',
      role: '主导招生策略制定和优化',
      avatar: '📈',
      prompt: '你是资深招生营销专家，基于历史招生数据、广告效果、教师绩效等制定招生策略。',
      specialties: ['营销策略', '数据分析', '渠道管理', '转化优化']
    },
    reviewers: [
      {
        id: 'market-expert',
        name: '市场分析专家',
        role: '分析目标客户群体和市场趋势',
        avatar: '📊',
        prompt: '你是市场分析专家，擅长分析目标客户画像和市场竞争态势。',
        specialties: ['市场调研', '客户画像', '竞争分析', '趋势预测']
      },
      {
        id: 'channel-expert',
        name: '渠道优化专家',
        role: '评估招生渠道效果和ROI',
        avatar: '🎯',
        prompt: '你是渠道优化专家，基于历史招生渠道数据分析最优投放策略。',
        specialties: ['渠道管理', 'ROI分析', '投放优化', '效果追踪']
      },
      {
        id: 'content-expert',
        name: '内容营销专家',
        role: '优化宣传内容和广告创意',
        avatar: '📝',
        prompt: '你是内容营销专家，基于历史广告数据优化宣传文案和创意。',
        specialties: ['文案策划', '创意设计', '品牌传播', '内容运营']
      },
      {
        id: 'conversion-expert',
        name: '转化率专家',
        role: '分析招生漏斗和提升转化策略',
        avatar: '📈',
        prompt: '你是转化率专家，分析从线索到成交的完整转化路径。',
        specialties: ['转化分析', '漏斗优化', '用户行为', '成交策略']
      },
      {
        id: 'performance-expert',
        name: '教师绩效专家',
        role: '基于教师招生达标率给出任务分配建议',
        avatar: '👥',
        prompt: '你是教师绩效专家，基于各教师历史招生达标率和能力特长分配招生任务。',
        specialties: ['绩效管理', '任务分配', '能力评估', '培训规划']
      }
    ]
  }
}

// 页面到专家团队的映射
export const pageToExpertMapping: Record<string, string> = {
  '/centers/activity': 'activity',
  '/centers/enrollment': 'enrollment',
  '/activity': 'activity',
  '/enrollment': 'enrollment',
  '/demo/activity': 'activity',
  '/demo/enrollment': 'enrollment'
}

/**
 * 根据当前页面获取专家团队配置
 */
export function getExpertTeam(currentPage: string): ExpertTeam | null {
  const scenario = pageToExpertMapping[currentPage]
  return scenario ? expertTeamConfigs[scenario] : null
}

/**
 * 获取所有可用的专家团队场景
 */
export function getAvailableScenarios(): Array<{key: string, name: string}> {
  return Object.keys(expertTeamConfigs).map(key => ({
    key,
    name: expertTeamConfigs[key].scenario
  }))
}

/**
 * 模拟专家响应（DEMO用）
 */
export async function simulateExpertResponse(
  expert: Expert,
  _context: any,
  action: 'createPlan' | 'review' | 'optimize'
): Promise<ExpertResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  const responses = {
    'activity-planner': {
      createPlan: '基于春季环境和历史数据，我建议举办"春季亲子趣味运动会"。活动将包含分年龄段竞技、亲子协作项目和科学小实验，预计参与200人，预算2500元。',
      optimize: '根据专家建议，我已优化方案：增加医疗保障、完善安全预案、调整预算分配，并加入更多教育元素。'
    },
    'fun-expert': {
      review: '亲子互动设计很棒，建议增加更多年龄段适配的游戏项目，提升整体参与度。'
    },
    'cost-expert': {
      review: '预算控制合理，建议优化道具采购方案，可节省约500元成本。'
    },
    'safety-expert': {
      review: '需要增加现场医疗保障措施，建议制定详细的安全预案和应急流程。'
    },
    'edu-expert': {
      review: '教育价值丰富，建议融入更多科学探索元素，增强学习体验。'
    },
    'enrollment-planner': {
      createPlan: '基于历史数据分析，建议采用多渠道整合营销策略，重点加强老生推荐渠道，目标招生50名新生，预算8万元。',
      optimize: '根据专家建议优化策略：调整渠道配比、优化转化流程、重新分配教师任务，预期提升20%转化率。'
    },
    'market-expert': {
      review: '目标客户定位准确，建议深入分析3-6岁家长群体的决策因素。'
    },
    'channel-expert': {
      review: '建议加大老生推荐渠道投入，历史数据显示其转化率最高达35%。'
    }
  }
  
  const message = (responses as any)[expert.id]?.[action] || `${expert.name}正在分析中...`
  const score = action === 'review' ? Math.floor(7 + Math.random() * 3) : undefined
  
  return {
    expertId: expert.id,
    expertName: expert.name,
    message,
    score,
    suggestions: action === 'review' ? ['建议1', '建议2'] : undefined,
    timestamp: Date.now()
  }
}
