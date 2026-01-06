import { get, post, put, del, ApiResponse } from '@/utils/request';
import { API_PREFIX } from '@/api/endpoints';

/**
 * AI招生预测相关接口
 */

// 当前定价结构
export interface CurrentPricing {
  tuition: number;
  fees: {
    registration: number;
    materials: number;
    meals: number;
    transport?: number;
  };
  discounts: {
    earlyBird?: number;
    sibling?: number;
    loyalty?: number;
  };
}

// 市场条件
export interface MarketConditions {
  economicIndicators: {
    gdpGrowth: number;
    inflation: number;
    unemployment: number;
  };
  localFactors: {
    populationGrowth: number;
    competitorCount: number;
    averageIncome: number;
  };
  seasonality: {
    peakMonths: string[];
    lowMonths: string[];
  };
}

// 需求预测
export interface DemandForecast {
  projectedDemand: number;
  confidence: number;
  factors: {
    demographic: number;
    economic: number;
    competitive: number;
  };
  timeline: {
    shortTerm: number; // 3个月
    mediumTerm: number; // 6个月
    longTerm: number; // 12个月
  };
}

// 竞争对手定价
export interface CompetitorPricing {
  competitors: Array<{
    name: string;
    tuition: number;
    fees: number;
    qualityScore: number;
    marketShare: number;
  }>;
  averagePrice: number;
  priceRange: { min: number; max: number };
  positioningStrategy: 'premium' | 'competitive' | 'budget';
}

// 预测指标类型
export interface PredictionMetric {
  value: number;
  confidence: number; // 0-100
  range: { min: number; max: number };
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

// 影响因素类型
export interface InfluencingFactor {
  name: string;
  impact: number; // -100 to 100
  trend: 'positive' | 'negative' | 'neutral';
  description: string;
  controllable: boolean;
}

// 预测场景类型
export interface ForecastScenario {
  name: string;
  type: 'optimistic' | 'realistic' | 'pessimistic';
  expectedEnrollments: number;
  expectedRevenue: number;
  probability: number;
  description: string;
}

// 战略建议类型
export interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
  implementationEffort: string;
}

// 招生预测结果
export interface EnrollmentForecast {
  planId: string;
  timeHorizon: '1month' | '3months' | '6months' | '1year';
  predictions: {
    totalApplications: PredictionMetric;
    qualifiedApplications: PredictionMetric;
    expectedEnrollments: PredictionMetric;
    revenueProjection: PredictionMetric;
  };
  factors: InfluencingFactor[];
  scenarios: ForecastScenario[];
  recommendations: StrategicRecommendation[];
  generatedAt: string;
  modelVersion: string;
}

// 竞争对手分析
export interface CompetitorAnalysis {
  competitors: Array<{
    name: string;
    distance: string;
    pricing: number;
    strengths: string[];
    weaknesses: string[];
    marketShare: number;
  }>;
  marketPosition: {
    rank: number;
    score: number;
    advantages: string[];
    threats: string[];
  };
  pricingBenchmark: {
    average: number;
    range: { min: number; max: number };
    recommendation: string;
  };
}

// 定价建议
export interface PricingRecommendation {
  currentPricing: number;
  recommendedPricing: number;
  adjustmentReason: string;
  expectedImpact: {
    demandChange: number;
    revenueChange: number;
    competitivenessChange: number;
  };
  strategies: Array<{
    name: string;
    description: string;
    implementation: string;
  }>;
}

/**
 * AI招生预测API
 */
export const aiEnrollmentApi = {
  /**
   * 生成AI招生预测
   */
  generateForecast(params: {
    planId: string;
    timeHorizon: string;
    includeExternalFactors?: boolean;
    includeSeasonality?: boolean;
    includeCompetitorAnalysis?: boolean;
    modelVersion?: string;
  }): Promise<ApiResponse<EnrollmentForecast>> {
    return post(`${API_PREFIX}/ai/enrollment-forecast`, params);
  },

  /**
   * 获取历史预测准确率
   */
  getForecastAccuracy(params?: {
    timeRange?: string;
    planIds?: string[];
  }): Promise<ApiResponse<Array<{
    date: string;
    accuracy: number;
    planName: string;
    actualVsPredicted: {
      predicted: number;
      actual: number;
      variance: number;
    };
  }>>> {
    return get(`${API_PREFIX}/ai/forecast-accuracy`, { params });
  },

  /**
   * 竞争对手分析
   */
  analyzeCompetitors(params: {
    radius?: string;
    includeOnlineCompetitors?: boolean;
    analyzePricing?: boolean;
    analyzeServices?: boolean;
    includeReviews?: boolean;
  }): Promise<ApiResponse<CompetitorAnalysis>> {
    return post(`${API_PREFIX}/ai/competitor-analysis`, params);
  },

  /**
   * 动态定价建议
   */
  generatePricingRecommendations(params: {
    currentPricing: CurrentPricing;
    marketConditions: MarketConditions;
    demandForecast: DemandForecast;
    competitorPricing: CompetitorPricing;
  }): Promise<ApiResponse<PricingRecommendation>> {
    return post(`${API_PREFIX}/ai/dynamic-pricing`, params);
  }
};

/**
 * 漏斗分析相关接口
 */

// 漏斗洞察
export interface FunnelInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'success';
  impact: number;
  potential: number;
  actionable: boolean;
}

// 转化优化建议
export interface ConversionOptimization {
  id: string;
  stage: string;
  currentRate: number;
  targetRate: number;
  bottlenecks: Array<{
    id: string;
    name: string;
    severity: 'high' | 'medium' | 'low';
    impact: number;
  }>;
  recommendations: Array<{
    id: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: number;
    implementationCost: string;
  }>;
}

// A/B测试
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: {
    A: { name: string; description: string; conversionRate?: number };
    B: { name: string; description: string; conversionRate?: number };
  };
  trafficSplit: number;
  successMetric: string;
  minimumDetectableEffect: number;
  confidence: number;
  startDate?: string;
  endDate?: string;
  results?: {
    winner: 'A' | 'B' | 'inconclusive';
    significance: number;
    improvement: number;
  };
}

// 测试建议
export interface TestRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: string;
  requiredSampleSize: number;
  expectedImprovement: number;
  variants: Array<{
    name: string;
    description: string;
  }>;
}

/**
 * 漏斗分析API
 */
export const funnelAnalyticsApi = {
  /**
   * 执行漏斗分析
   */
  analyzeFunnel(params: {
    timeRange?: string;
    includeAttributionAnalysis?: boolean;
    includeSeasonalFactors?: boolean;
    includeChannelBreakdown?: boolean;
  }): Promise<ApiResponse<{
    insights: FunnelInsight[];
    optimizations: ConversionOptimization[];
    testRecommendations: TestRecommendation[];
    funnelData: Array<{
      stage: string;
      value: number;
      rate: number;
    }>;
  }>> {
    return post(`${API_PREFIX}/ai/funnel-analysis`, params);
  },

  /**
   * 创建A/B测试
   */
  createABTest(data: {
    name: string;
    description: string;
    variants: any;
    trafficSplit: number;
    successMetric: string;
    minimumDetectableEffect: number;
    confidence: number;
  }): Promise<ApiResponse<ABTest>> {
    return post(`${API_PREFIX}/enrollment/ab-test/create`, data);
  },

  /**
   * 获取活跃测试
   */
  getActiveTests(): Promise<ApiResponse<ABTest[]>> {
    return get(`${API_PREFIX}/enrollment/ab-test/active`);
  },

  /**
   * 结束A/B测试
   */
  concludeTest(testId: string): Promise<ApiResponse<ABTest>> {
    return put(`${API_PREFIX}/enrollment/ab-test/${testId}/conclude`);
  },

  /**
   * 实施优化建议
   */
  implementOptimization(data: {
    recommendationId: string;
    implementationType: 'immediate' | 'gradual';
    rolloutPercentage?: number;
  }): Promise<ApiResponse<any>> {
    return post(`${API_PREFIX}/enrollment/implement-optimization`, data);
  }
};

/**
 * 个性化策略相关接口
 */

// 客户细分
export interface CustomerSegment {
  id: string;
  name: string;
  characteristics: {
    demographics: {
      ageRange: string;
      incomeLevel: string;
      education: string;
      location: string;
    };
    psychographics: {
      values: string;
      concerns: string;
      lifestyle: string;
      motivation: string;
    };
    behaviorPatterns: Array<{
      channelPreference: string;
      decisionMakingStyle: string;
      informationConsumption: string;
    }>;
  };
  size: number;
  conversionPotential: number;
  lifetimeValue: number;
}

// 营销渠道
export interface MarketingChannel {
  id: string;
  name: string;
  type: string;
  effectiveness: number;
  expectedROI: number;
  cost: number;
}

// 信息传递策略
export interface MessagingStrategy {
  coreValue: string;
  tone: string;
  keywords: string[];
  emotionalTriggers: string[];
}

// 定价策略
export interface PricingStrategy {
  recommendedPrice: number;
  strategy: string;
  priceSensitivity: number;
  bundlingOptions: string[];
}

// 个性化策略
export interface PersonalizedStrategy {
  id: string;
  targetSegment: CustomerSegment;
  recommendedChannels: MarketingChannel[];
  messagingStrategy: MessagingStrategy;
  pricingStrategy: PricingStrategy;
  expectedOutcomes: {
    leads: number;
    conversions: number;
    revenue: number;
    roi: number;
  };
  matchScore: number;
}

// 个性化内容
export interface PersonalizedContent {
  content: string;
  contentType: string;
  personalizationScore: number;
  expectedEngagement: number;
  keyMessages: string[];
  callToAction: string;
}

/**
 * 个性化策略API
 */
export const personalizedStrategyApi = {
  /**
   * 执行客户细分
   */
  performSegmentation(params: {
    dataSource?: 'comprehensive' | 'basic';
    segmentationMethod?: 'advanced_clustering' | 'rule_based';
    includeExternalData?: boolean;
    validateSegments?: boolean;
  }): Promise<ApiResponse<{
    segments: CustomerSegment[];
    segmentationQuality: {
      score: number;
      silhouetteScore: number;
      withinClusterSum: number;
    };
  }>> {
    return post(`${API_PREFIX}/ai/customer-segmentation`, params);
  },

  /**
   * 生成个性化策略
   */
  generateStrategies(params: {
    segments: CustomerSegment[];
    businessGoals: any;
    resourceConstraints: any;
    competitorActivity: any;
  }): Promise<ApiResponse<{
    strategies: PersonalizedStrategy[];
    overallRecommendations: string[];
  }>> {
    return post(`${API_PREFIX}/ai/personalized-strategies`, params);
  },

  /**
   * 生成个性化内容
   */
  generateContent(params: {
    segmentId: string;
    contentType: 'email' | 'landing_page' | 'ad_copy' | 'brochure';
    tone?: string;
    includeEmotionalTriggers?: boolean;
    optimizeForAction?: boolean;
  }): Promise<ApiResponse<PersonalizedContent>> {
    return post(`${API_PREFIX}/ai/personalized-content`, params);
  },

  /**
   * 实施个性化策略
   */
  implementStrategy(params: {
    strategyId: string;
    implementationPlan: any;
    trackingParameters: any;
  }): Promise<ApiResponse<any>> {
    return post(`${API_PREFIX}/enrollment/implement-strategy`, params);
  }
};

/**
 * 自动化跟进相关接口
 */

// 跟进阶段
export interface LeadStage {
  name: string;
  progress: number;
  timeInStage: number;
  typicalDuration: number;
  nextStages: string[];
  exitRisk: number;
}

// 跟进动作
export interface FollowUpAction {
  type: 'call' | 'message' | 'email' | 'visit';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// 沟通渠道
export interface CommunicationChannel {
  name: string;
  type: string;
  effectiveness: number;
  responseRate: number;
}

// 自动化跟进
export interface AutomatedFollowUp {
  leadId: string;
  leadName: string;
  leadPhone: string;
  stage: LeadStage;
  nextAction: FollowUpAction;
  scheduledTime: string;
  personalizedMessage: string;
  channel: CommunicationChannel;
  priority: 'high' | 'medium' | 'low';
  expectedOutcome: string;
  personalizationScore: number;
  expectedResponseRate: number;
}

// 自动化规则
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: {
    type: string;
    conditions: any;
  };
  actions: Array<{
    type: string;
    parameters: any;
    delay?: number;
  }>;
  priority: number;
  statistics: {
    triggerCount: number;
    successCount: number;
    avgResponseTime: number;
  };
}

// 流失风险评估
export interface ChurnRisk {
  leadId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: Array<{
    factor: string;
    weight: number;
    contribution: number;
  }>;
  recommendations: Array<{
    action: string;
    urgency: 'immediate' | 'soon' | 'scheduled';
    expectedImpact: number;
  }>;
  nextReviewDate: string;
}

/**
 * 自动化跟进API
 */
export const automatedFollowUpApi = {
  /**
   * 智能跟进调度
   */
  scheduleFollowUp(params: {
    leadId: string;
    includePersonalityProfile?: boolean;
    includeCommunicationHistory?: boolean;
    includeEngagementPattern?: boolean;
    optimizeForConversion?: boolean;
  }): Promise<ApiResponse<AutomatedFollowUp>> {
    return post(`${API_PREFIX}/ai/intelligent-follow-up`, params);
  },

  /**
   * 生成个性化消息
   */
  generatePersonalizedMessage(params: {
    leadId: string;
    context: any;
    messageType: string;
    tone?: string;
    includeValueProposition?: boolean;
    includePersonalDetails?: boolean;
    callToAction?: string;
  }): Promise<ApiResponse<{
    personalizedMessage: string;
    personalizationScore: number;
    keyPersonalizationElements: string[];
    alternatives: string[];
  }>> {
    return post(`${API_PREFIX}/ai/personalized-message`, params);
  },

  /**
   * 预测最佳联系时间
   */
  predictOptimalContactTime(params: {
    leadId: string;
    analyzePreviousEngagement?: boolean;
    considerTimeZone?: boolean;
    includeExternalFactors?: boolean;
  }): Promise<ApiResponse<{
    optimalTimes: Array<{
      datetime: string;
      probability: number;
      channel: string;
      confidence: number;
    }>;
    timeZoneRecommendations: string[];
    channelPreferences: Array<{
      channel: string;
      effectiveness: number;
    }>;
  }>> {
    return post(`${API_PREFIX}/ai/optimal-contact-time`, params);
  },

  /**
   * 流失风险评估
   */
  assessChurnRisk(params: {
    leadId: string;
    includeEngagementMetrics?: boolean;
    includeCompetitorActivity?: boolean;
    includeBehaviorAnalysis?: boolean;
  }): Promise<ApiResponse<ChurnRisk>> {
    return post(`${API_PREFIX}/ai/churn-risk-assessment`, params);
  },

  /**
   * 获取跟进队列
   */
  getFollowUpQueue(params?: {
    priority?: 'high' | 'medium' | 'low';
    status?: 'pending' | 'scheduled' | 'completed';
    timeRange?: string;
    limit?: number;
  }): Promise<ApiResponse<AutomatedFollowUp[]>> {
    return get(`${API_PREFIX}/enrollment/follow-up-queue`, { params });
  },

  /**
   * 执行跟进
   */
  executeFollowUp(params: {
    followUpId: string;
    actualMessage?: string;
    actualChannel?: string;
    executionNotes?: string;
  }): Promise<ApiResponse<{
    success: boolean;
    responseReceived: boolean;
    nextFollowUpScheduled?: AutomatedFollowUp;
  }>> {
    return post(`${API_PREFIX}/enrollment/execute-follow-up`, params);
  },

  /**
   * 管理自动化规则
   */
  getAutomationRules(): Promise<ApiResponse<AutomationRule[]>> {
    return get(`${API_PREFIX}/enrollment/automation-rules`);
  },

  createAutomationRule(data: {
    name: string;
    description: string;
    trigger: any;
    actions: any[];
    priority?: number;
  }): Promise<ApiResponse<AutomationRule>> {
    return post(`${API_PREFIX}/enrollment/automation-rules`, data);
  },

  updateAutomationRule(ruleId: string, data: Partial<AutomationRule>): Promise<ApiResponse<AutomationRule>> {
    return put(`${API_PREFIX}/enrollment/automation-rules/${ruleId}`, data);
  },

  deleteAutomationRule(ruleId: string): Promise<ApiResponse<any>> {
    return del(`${API_PREFIX}/enrollment/automation-rules/${ruleId}`);
  },

  toggleAutomationRule(ruleId: string, enabled: boolean): Promise<ApiResponse<AutomationRule>> {
    return put(`${API_PREFIX}/enrollment/automation-rules/${ruleId}/toggle`, { enabled });
  }
};

/**
 * AI分析报告接口
 */
export const aiAnalyticsApi = {
  /**
   * 获取综合分析报告
   */
  getComprehensiveReport(params: {
    timeRange: string;
    includeForecasting?: boolean;
    includeFunnelAnalysis?: boolean;
    includePersonalization?: boolean;
    includeAutomation?: boolean;
  }): Promise<ApiResponse<{
    summary: {
      totalLeads: number;
      conversionRate: number;
      automationCoverage: number;
      aiAccuracy: number;
    };
    insights: Array<{
      category: string;
      insight: string;
      impact: string;
      recommendation: string;
    }>;
    trends: Array<{
      metric: string;
      trend: 'up' | 'down' | 'stable';
      change: number;
      period: string;
    }>;
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      title: string;
      description: string;
      expectedImpact: string;
    }>;
  }>> {
    return post(`${API_PREFIX}/ai/comprehensive-report`, params);
  },

  /**
   * 获取AI性能指标
   */
  getAIPerformanceMetrics(): Promise<ApiResponse<{
    forecastingAccuracy: number;
    personalizationEffectiveness: number;
    automationCoverage: number;
    responseRateImprovement: number;
    revenueImpact: number;
    modelPerformance: Array<{
      model: string;
      accuracy: number;
      lastTrainingDate: string;
      version: string;
    }>;
  }>> {
    return get(`${API_PREFIX}/ai/performance-metrics`);
  }
};

// API模块已通过export const导出，无需重复导出

// 类型定义已通过export interface导出，无需重复导出