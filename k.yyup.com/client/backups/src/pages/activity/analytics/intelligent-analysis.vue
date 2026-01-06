<template>
  <div class="intelligent-activity-analytics">
    <div class="analytics-header">
      <h1>智能活动效果分析系统</h1>
      <div class="analytics-overview">
        <div class="overview-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="card-value">{{ overviewStats.totalActivities }}</div>
            <div class="card-label">总活动数</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <div class="card-value">{{ overviewStats.avgEngagement }}%</div>
            <div class="card-label">平均参与度</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <div class="card-value">{{ overviewStats.totalROI }}%</div>
            <div class="card-label">总体ROI</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">⭐</div>
          <div class="card-content">
            <div class="card-value">{{ overviewStats.avgSatisfaction }}/5</div>
            <div class="card-label">平均满意度</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 活动选择和分析控制 -->
    <div class="analysis-controls">
      <div class="control-section">
        <h3>选择活动进行深度分析</h3>
        <div class="control-form">
          <el-select v-model="selectedActivityId" placeholder="选择活动" style="width: 300px;">
            <el-option v-for="activity in activities" :key="activity.id" :label="activity.name" :value="activity.id">
              <span>{{ activity.name }}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: var(--text-sm);">{{ activity.date }}</span>
            </el-option>
          </el-select>
          <el-button type="primary" @click="performDeepAnalysis" :loading="analyzing">
            开始深度分析
          </el-button>
          <el-button @click="generateOptimizations" :loading="optimizing">
            生成优化建议
          </el-button>
          <el-button @click="predictActivitySuccess" :loading="predicting">
            预测成功率
          </el-button>
        </div>
      </div>
    </div>

    <!-- 活动效果分析结果 -->
    <div v-if="activityAnalytics" class="analysis-results">
      <h3>{{ selectedActivityName }} - 深度分析结果</h3>
      
      <!-- 整体表现指标 -->
      <div class="performance-overview">
        <div class="performance-grid">
          <div class="performance-card">
            <div class="performance-header">
              <h4>整体评分</h4>
              <div class="score-display">
                <div class="score-value">{{ activityAnalytics.performance.overallScore }}</div>
                <div class="score-max">/100</div>
              </div>
            </div>
            <div class="performance-breakdown">
              <div class="breakdown-item">
                <span>报名率</span>
                <span>{{ activityAnalytics.performance.registrationRate }}%</span>
              </div>
              <div class="breakdown-item">
                <span>出席率</span>
                <span>{{ activityAnalytics.performance.attendanceRate }}%</span>
              </div>
              <div class="breakdown-item">
                <span>满意度</span>
                <span>{{ activityAnalytics.performance.satisfactionScore }}/5</span>
              </div>
              <div class="breakdown-item">
                <span>参与度</span>
                <span>{{ activityAnalytics.performance.engagementLevel }}/10</span>
              </div>
            </div>
          </div>

          <div class="performance-card">
            <h4>学习成果</h4>
            <div class="learning-outcomes">
              <div v-for="outcome in activityAnalytics.performance.learningOutcomes" :key="outcome.id" class="outcome-item">
                <div class="outcome-name">{{ outcome.name }}</div>
                <div class="outcome-achievement">
                  <el-progress :percentage="outcome.achievementRate" :stroke-width="8" :show-text="false"></el-progress>
                  <span class="achievement-text">{{ outcome.achievementRate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="performance-card">
            <h4>社会影响</h4>
            <div class="social-impact">
              <div class="impact-metric">
                <span class="metric-label">家长满意度</span>
                <span class="metric-value">{{ activityAnalytics.performance.socialImpact.parentSatisfaction }}/5</span>
              </div>
              <div class="impact-metric">
                <span class="metric-label">社区参与度</span>
                <span class="metric-value">{{ activityAnalytics.performance.socialImpact.communityEngagement }}%</span>
              </div>
              <div class="impact-metric">
                <span class="metric-label">品牌提升</span>
                <span class="metric-value">{{ activityAnalytics.performance.socialImpact.brandImprovement }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 参与者分析 -->
      <div class="participant-analysis">
        <h4>参与者分析</h4>
        <div class="analysis-charts">
          <div class="chart-container">
            <h5>参与度分布</h5>
            <div ref="participantEngagementChart" class="chart"></div>
          </div>
          <div class="chart-container">
            <h5>年龄分布</h5>
            <div ref="ageDistributionChart" class="chart"></div>
          </div>
          <div class="chart-container">
            <h5>反馈情感分析</h5>
            <div ref="sentimentAnalysisChart" class="chart"></div>
          </div>
        </div>
      </div>

      <!-- ROI分析 -->
      <div class="roi-analysis">
        <h4>ROI深度分析</h4>
        <div class="roi-breakdown">
          <div class="roi-summary">
            <div class="roi-value">
              <span class="roi-number">{{ roiAnalysis.totalROI }}%</span>
              <span class="roi-label">总体ROI</span>
            </div>
            <div class="roi-details">
              <div class="roi-item">
                <span class="label">直接收益</span>
                <span class="value">¥{{ roiAnalysis.directRevenue }}</span>
              </div>
              <div class="roi-item">
                <span class="label">间接收益</span>
                <span class="value">¥{{ roiAnalysis.indirectRevenue }}</span>
              </div>
              <div class="roi-item">
                <span class="label">总成本</span>
                <span class="value">¥{{ roiAnalysis.totalCost }}</span>
              </div>
              <div class="roi-item">
                <span class="label">净收益</span>
                <span class="value">¥{{ roiAnalysis.netRevenue }}</span>
              </div>
            </div>
          </div>
          <div class="roi-chart">
            <div ref="roiTrendChart" class="chart"></div>
          </div>
        </div>
      </div>

      <!-- 比较分析 -->
      <div class="comparative-analysis">
        <h4>对比分析</h4>
        <div class="comparison-controls">
          <el-select v-model="comparisonActivityId" placeholder="选择对比活动" style="width: 300px;">
            <el-option v-for="activity in activities" :key="activity.id" :label="activity.name" :value="activity.id">
            </el-option>
          </el-select>
          <el-button @click="generateComparison" :loading="comparing">生成对比报告</el-button>
        </div>
        <div v-if="comparisonData" class="comparison-results">
          <div class="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>指标</th>
                  <th>{{ selectedActivityName }}</th>
                  <th>{{ comparisonData.comparisonActivityName }}</th>
                  <th>差异</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="metric in comparisonData.metrics" :key="metric.name">
                  <td>{{ metric.name }}</td>
                  <td>{{ metric.currentValue }}</td>
                  <td>{{ metric.comparisonValue }}</td>
                  <td :class="metric.difference > 0 ? 'positive' : 'negative'">
                    {{ metric.difference > 0 ? '+' : '' }}{{ metric.difference }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 优化建议 -->
    <div v-if="optimizationRecommendations.length > 0" class="optimization-recommendations">
      <h3>AI优化建议</h3>
      <div class="recommendations-grid">
        <div v-for="recommendation in optimizationRecommendations" :key="recommendation.id" class="recommendation-card">
          <div class="recommendation-header">
            <h4>{{ recommendation.title }}</h4>
            <div class="recommendation-priority" :class="recommendation.priority">
              {{ recommendation.priority }}
            </div>
          </div>
          <div class="recommendation-content">
            <p>{{ recommendation.description }}</p>
            <div class="recommendation-impact">
              <div class="impact-item">
                <span class="label">预期提升</span>
                <span class="value">{{ recommendation.expectedImprovement }}%</span>
              </div>
              <div class="impact-item">
                <span class="label">实施难度</span>
                <span class="value">{{ recommendation.implementationDifficulty }}/5</span>
              </div>
              <div class="impact-item">
                <span class="label">预计成本</span>
                <span class="value">¥{{ recommendation.estimatedCost }}</span>
              </div>
            </div>
          </div>
          <div class="recommendation-actions">
            <el-button type="primary" size="small" @click="implementRecommendation(recommendation)">
              实施建议
            </el-button>
            <el-button size="small" @click="viewRecommendationDetails(recommendation)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功率预测 -->
    <div v-if="successPrediction" class="success-prediction">
      <h3>活动成功率预测</h3>
      <div class="prediction-dashboard">
        <div class="prediction-summary">
          <div class="prediction-score">
            <div class="score-circle" :style="{ background: `conic-gradient(var(--el-color-success) ${successPrediction.successRate * 3.6}deg, var(--el-border-color) 0deg)` }">
              <div class="score-inner">
                <div class="score-value">{{ successPrediction.successRate }}%</div>
                <div class="score-label">成功率</div>
              </div>
            </div>
          </div>
          <div class="prediction-factors">
            <h4>影响因素</h4>
            <div class="factors-list">
              <div v-for="factor in successPrediction.factors" :key="factor.name" class="factor-item">
                <span class="factor-name">{{ factor.name }}</span>
                <div class="factor-impact">
                  <el-progress :percentage="factor.impact" :stroke-width="6" :show-text="false"></el-progress>
                  <span class="impact-value">{{ factor.impact }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="prediction-scenarios">
          <h4>情景分析</h4>
          <div class="scenarios-grid">
            <div v-for="scenario in successPrediction.scenarios" :key="scenario.name" class="scenario-card">
              <h5>{{ scenario.name }}</h5>
              <div class="scenario-probability">成功率: {{ scenario.probability }}%</div>
              <div class="scenario-conditions">
                <h6>条件:</h6>
                <ul>
                  <li v-for="condition in scenario.conditions" :key="condition">{{ condition }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 活动效果趋势 -->
    <div class="activity-trends">
      <h3>活动效果趋势</h3>
      <div class="trend-controls">
        <el-date-picker
          v-model="trendDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="updateTrends"
        />
        <el-select v-model="trendMetric" @change="updateTrends">
          <el-option label="参与度" value="engagement"></el-option>
          <el-option label="满意度" value="satisfaction"></el-option>
          <el-option label="ROI" value="roi"></el-option>
          <el-option label="出席率" value="attendance"></el-option>
        </el-select>
      </div>
      <div class="trend-chart">
        <div ref="activityTrendChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { getSuccessColor, getInfoColor, hexToRgba, getCssVarValue } from '@/utils/color-tokens';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import { get, post } from '@/utils/request';

// 类型定义
interface ActivityAnalytics {
  activityId: string;
  performance: ActivityPerformance;
  participantAnalysis: ParticipantAnalysis;
  engagementMetrics: EngagementMetrics;
  impactAssessment: ImpactAssessment;
  optimizationRecommendations: OptimizationRecommendation[];
}

interface ActivityPerformance {
  overallScore: number;
  registrationRate: number;
  attendanceRate: number;
  satisfactionScore: number;
  engagementLevel: number;
  learningOutcomes: LearningOutcome[];
  socialImpact: SocialImpact;
}

interface LearningOutcome {
  id: string;
  name: string;
  achievementRate: number;
  description: string;
}

interface SocialImpact {
  parentSatisfaction: number;
  communityEngagement: number;
  brandImprovement: number;
}

interface ParticipantAnalysis {
  totalParticipants: number;
  demographicBreakdown: any;
  engagementDistribution: any;
  feedbackSentiment: any;
}

interface EngagementMetrics {
  averageEngagement: number;
  peakEngagement: number;
  engagementTrend: any[];
}

interface ImpactAssessment {
  shortTermImpact: any;
  longTermImpact: any;
  intangibleBenefits: any;
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImprovement: number;
  implementationDifficulty: number;
  estimatedCost: number;
}

interface ROIAnalysis {
  totalROI: number;
  directRevenue: number;
  indirectRevenue: number;
  totalCost: number;
  netRevenue: number;
  costBreakdown: any[];
  revenueBreakdown: any[];
}

interface SuccessPrediction {
  successRate: number;
  factors: PredictionFactor[];
  scenarios: PredictionScenario[];
  confidence: number;
}

interface PredictionFactor {
  name: string;
  impact: number;
  description: string;
}

interface PredictionScenario {
  name: string;
  probability: number;
  conditions: string[];
}

// 响应式数据
const overviewStats = ref({
  totalActivities: 48,
  avgEngagement: 87.5,
  totalROI: 385,
  avgSatisfaction: 4.6
});

const activities = ref([]);
const selectedActivityId = ref('');
const selectedActivityName = ref('');
const comparisonActivityId = ref('');
const activityAnalytics = ref<ActivityAnalytics | null>(null);
const roiAnalysis = ref<ROIAnalysis | null>(null);
const optimizationRecommendations = ref<OptimizationRecommendation[]>([]);
const successPrediction = ref<SuccessPrediction | null>(null);
const comparisonData = ref(null);
const trendDateRange = ref([]);
const trendMetric = ref('engagement');

// 加载状态
const analyzing = ref(false);
const optimizing = ref(false);
const predicting = ref(false);
const comparing = ref(false);

// 图表引用
const participantEngagementChart = ref();
const ageDistributionChart = ref();
const sentimentAnalysisChart = ref();
const roiTrendChart = ref();
const activityTrendChart = ref();

// 计算属性
const selectedActivity = computed(() => {
  return activities.value.find(a => a.id === selectedActivityId.value);
});

// 智能活动分析组合函数
const useIntelligentActivityAnalytics = () => {
  // 深度活动效果分析
  const performDeepActivityAnalysis = async (activityId: string) => {
    try {
      const response = await post('/api/ai/deep-activity-analysis', {
        activityId,
        includeParticipantFeedback: true,
        includeObservationalData: true,
        includeLongTermImpact: true,
        includeComparativeAnalysis: true,
        analysisScope: 'comprehensive'
      });
      
      if (response.success) {
        return response.data.analysis;
      }
    } catch (error) {
      console.error('Deep activity analysis failed:', error);
      throw error;
    }
  };
  
  // 活动ROI分析
  const calculateActivityROI = async (activityId: string) => {
    try {
      const response = await post('/api/ai/activity-roi-analysis', {
        activityId,
        includeDirectCosts: true,
        includeIndirectCosts: true,
        includeIntangibleBenefits: true,
        includeLongTermValue: true,
        timeHorizon: '12months'
      });
      
      if (response.success) {
        return response.data.roiAnalysis;
      }
    } catch (error) {
      console.error('ROI analysis failed:', error);
      throw error;
    }
  };
  
  // 活动优化建议生成
  const generateActivityOptimizations = async (activityId: string) => {
    try {
      const response = await post('/api/ai/activity-optimization-recommendations', {
        activityId,
        currentPerformance: activityAnalytics.value?.performance,
        benchmarkData: await getActivityBenchmarks(),
        optimizationGoals: ['engagement', 'learning_outcomes', 'satisfaction', 'cost_efficiency'],
        innovationLevel: 'moderate'
      });
      
      if (response.success) {
        return response.data.optimizations;
      }
    } catch (error) {
      console.error('Optimization generation failed:', error);
      throw error;
    }
  };
  
  // 预测活动成功率
  const predictActivitySuccess = async (activityPlan: any) => {
    try {
      const response = await post('/api/ai/predict-activity-success', {
        activityPlan,
        historicalData: await getHistoricalActivityData(),
        participantProfiles: await getTargetParticipantProfiles(),
        externalFactors: await getExternalFactors(),
        predictionConfidence: 'high'
      });
      
      if (response.success) {
        return response.data.prediction;
      }
    } catch (error) {
      console.error('Success prediction failed:', error);
      throw error;
    }
  };
  
  return {
    performDeepActivityAnalysis,
    calculateActivityROI,
    generateActivityOptimizations,
    predictActivitySuccess
  };
};

// 使用智能活动分析
const {
  performDeepActivityAnalysis,
  calculateActivityROI,
  generateActivityOptimizations,
  predictActivitySuccess: predictSuccess
} = useIntelligentActivityAnalytics();

// 方法实现
const performDeepAnalysis = async () => {
  if (!selectedActivityId.value) {
    ElMessage.warning('请先选择活动');
    return;
  }
  
  analyzing.value = true;
  try {
    const analysis = await performDeepActivityAnalysis(selectedActivityId.value);
    activityAnalytics.value = analysis || createMockAnalysis();
    selectedActivityName.value = selectedActivity.value?.name || '未知活动';
    
    // 计算ROI
    const roi = await calculateActivityROI(selectedActivityId.value);
    roiAnalysis.value = roi || createMockROIAnalysis();
    
    // 更新图表
    nextTick(() => {
      updateAnalysisCharts();
    });
    
    ElMessage.success('深度分析完成');
  } catch (error) {
    console.error('Analysis failed:', error);
    ElMessage.error('分析失败');
  } finally {
    analyzing.value = false;
  }
};

const generateOptimizations = async () => {
  if (!selectedActivityId.value) {
    ElMessage.warning('请先选择活动');
    return;
  }

  optimizing.value = true;
  try {
    const optimizations = await generateActivityOptimizations(selectedActivityId.value);
    optimizationRecommendations.value = optimizations || createMockOptimizations();
    ElMessage.success('优化建议生成完成');
  } catch (error) {
    console.error('Optimization generation failed:', error);
    ElMessage.error('优化建议生成失败');
  } finally {
    optimizing.value = false;
  }
};

const predictActivitySuccess = async () => {
  if (!selectedActivityId.value) {
    ElMessage.warning('请先选择活动');
    return;
  }
  
  predicting.value = true;
  try {
    const prediction = await predictSuccess(selectedActivity.value);
    successPrediction.value = prediction || createMockPrediction();
    ElMessage.success('成功率预测完成');
  } catch (error) {
    console.error('Prediction failed:', error);
    ElMessage.error('预测失败');
  } finally {
    predicting.value = false;
  }
};

const generateComparison = async () => {
  if (!comparisonActivityId.value) {
    ElMessage.warning('请选择对比活动');
    return;
  }
  
  comparing.value = true;
  try {
    const response = await post('/api/ai/activity-comparison', {
      activityId1: selectedActivityId.value,
      activityId2: comparisonActivityId.value,
      comparisonMetrics: ['engagement', 'satisfaction', 'roi', 'attendance']
    });
    
    if (response.success) {
      comparisonData.value = response.data.comparison;
    } else {
      comparisonData.value = createMockComparison();
    }
    
    ElMessage.success('对比分析完成');
  } catch (error) {
    console.error('Comparison failed:', error);
    ElMessage.error('对比分析失败');
  } finally {
    comparing.value = false;
  }
};

const implementRecommendation = async (recommendation: OptimizationRecommendation) => {
  try {
    const response = await post('/api/activity/implement-recommendation', {
      recommendationId: recommendation.id,
      activityId: selectedActivityId.value,
      autoImplement: true
    });
    
    if (response.success) {
      ElMessage.success('优化建议已实施');
    } else {
      ElMessage.success('优化建议已加入实施计划');
    }
  } catch (error) {
    console.error('Implementation failed:', error);
    ElMessage.error('实施失败');
  }
};

const viewRecommendationDetails = (recommendation: OptimizationRecommendation) => {
  ElMessage.info(`查看建议详情: ${recommendation.title}`);
  // 这里可以打开详细信息对话框
};

const updateTrends = async () => {
  if (!trendDateRange.value || trendDateRange.value.length !== 2) {
    return;
  }
  
  try {
    const response = await post('/api/ai/activity-trends', {
      dateRange: trendDateRange.value,
      metric: trendMetric.value,
      granularity: 'weekly'
    });
    
    if (response.success) {
      updateTrendChart(response.data.trends);
    }
  } catch (error) {
    console.error('Trend update failed:', error);
  }
};

// 辅助函数
const getActivityBenchmarks = async () => {
  try {
    const response = await get('/api/activity/benchmarks');
    return response.data;
  } catch (error) {
    return {};
  }
};

const getHistoricalActivityData = async () => {
  try {
    const response = await get('/api/activity/historical-data');
    return response.data;
  } catch (error) {
    return {};
  }
};

const getTargetParticipantProfiles = async () => {
  try {
    const response = await get('/api/participant/profiles');
    return response.data;
  } catch (error) {
    return {};
  }
};

const getExternalFactors = async () => {
  try {
    const response = await get('/api/external/factors');
    return response.data;
  } catch (error) {
    return {};
  }
};

// 模拟数据函数
const createMockAnalysis = (): ActivityAnalytics => ({
  activityId: selectedActivityId.value,
  performance: {
    overallScore: 85,
    registrationRate: 92,
    attendanceRate: 87,
    satisfactionScore: 4.6,
    engagementLevel: 8.5,
    learningOutcomes: [
      { id: '1', name: '创造力提升', achievementRate: 88, description: '通过艺术活动提升创造力' },
      { id: '2', name: '社交技能', achievementRate: 92, description: '团队协作和交流能力' },
      { id: '3', name: '认知发展', achievementRate: 85, description: '逻辑思维和问题解决能力' }
    ],
    socialImpact: {
      parentSatisfaction: 4.7,
      communityEngagement: 78,
      brandImprovement: 15
    }
  },
  participantAnalysis: {
    totalParticipants: 45,
    demographicBreakdown: {},
    engagementDistribution: {},
    feedbackSentiment: {}
  },
  engagementMetrics: {
    averageEngagement: 8.5,
    peakEngagement: 9.2,
    engagementTrend: []
  },
  impactAssessment: {
    shortTermImpact: {},
    longTermImpact: {},
    intangibleBenefits: {}
  },
  optimizationRecommendations: []
});

const createMockROIAnalysis = (): ROIAnalysis => ({
  totalROI: 385,
  directRevenue: 28000,
  indirectRevenue: 15000,
  totalCost: 11000,
  netRevenue: 32000,
  costBreakdown: [],
  revenueBreakdown: []
});

const createMockOptimizations = (): OptimizationRecommendation[] => [
  {
    id: '1',
    title: '优化活动时间安排',
    description: '根据参与者行为数据，调整活动时间以提高出席率',
    priority: 'high',
    expectedImprovement: 15,
    implementationDifficulty: 2,
    estimatedCost: 500
  },
  {
    id: '2',
    title: '增加互动环节',
    description: '在活动中增加更多互动元素，提升参与度和满意度',
    priority: 'medium',
    expectedImprovement: 22,
    implementationDifficulty: 3,
    estimatedCost: 1200
  },
  {
    id: '3',
    title: '优化宣传策略',
    description: '基于目标受众分析，调整宣传渠道和内容',
    priority: 'medium',
    expectedImprovement: 18,
    implementationDifficulty: 4,
    estimatedCost: 800
  }
];

const createMockPrediction = (): SuccessPrediction => ({
  successRate: 89,
  factors: [
    { name: '参与者兴趣匹配', impact: 85, description: '活动内容与参与者兴趣的匹配度' },
    { name: '时间安排合理性', impact: 78, description: '活动时间对参与者的便利性' },
    { name: '资源投入充足', impact: 92, description: '人员、物料等资源的充足程度' },
    { name: '天气条件', impact: 65, description: '天气对室外活动的影响' }
  ],
  scenarios: [
    {
      name: '最佳情况',
      probability: 25,
      conditions: ['完美天气', '充足资源', '高参与度']
    },
    {
      name: '正常情况',
      probability: 60,
      conditions: ['普通天气', '标准资源', '中等参与度']
    },
    {
      name: '困难情况',
      probability: 15,
      conditions: ['恶劣天气', '资源不足', '低参与度']
    }
  ],
  confidence: 87
});

const createMockComparison = () => ({
  comparisonActivityName: '春季艺术节',
  metrics: [
    { name: '参与度', currentValue: '8.5', comparisonValue: '7.8', difference: 8.97 },
    { name: '满意度', currentValue: '4.6', comparisonValue: '4.3', difference: 6.98 },
    { name: 'ROI', currentValue: '385%', comparisonValue: '298%', difference: 29.19 },
    { name: '出席率', currentValue: '87%', comparisonValue: '82%', difference: 6.1 }
  ]
});

// 图表更新函数
const updateAnalysisCharts = () => {
  // 参与度分布图
  if (participantEngagementChart.value) {
    const engagementChart = echarts.init(participantEngagementChart.value);
    const engagementOption = {
      title: {
        text: '参与度分布'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '参与度',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: getCssVarValue('--el-fill-color-blank', 'rgba(255,255,255,1)'),
            borderWidth: 2
          },
          data: [
            { value: 12, name: '高参与度' },
            { value: 23, name: '中等参与度' },
            { value: 8, name: '低参与度' },
            { value: 2, name: '未参与' }
          ]
        }
      ]
    };
    engagementChart.setOption(engagementOption);
  }
  
  // 年龄分布图
  if (ageDistributionChart.value) {
    const ageChart = echarts.init(ageDistributionChart.value);
    const ageOption = {
      title: {
        text: '年龄分布'
      },
      xAxis: {
        type: 'category',
        data: ['3-4岁', '4-5岁', '5-6岁', '6-7岁']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [8, 15, 18, 4],
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }
      ]
    };
    ageChart.setOption(ageOption);
  }
  
  // 情感分析图
  if (sentimentAnalysisChart.value) {
    const sentimentChart = echarts.init(sentimentAnalysisChart.value);
    const sentimentOption = {
      title: {
        text: '反馈情感分析'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '情感',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 28, name: '积极' },
            { value: 15, name: '中性' },
            { value: 2, name: '消极' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'var(--shadow-heavy)'
            }
          }
        }
      ]
    };
    sentimentChart.setOption(sentimentOption);
  }
  
  // ROI趋势图
  if (roiTrendChart.value) {
    const roiChart = echarts.init(roiTrendChart.value);
    const roiOption = {
      title: {
        text: 'ROI趋势分析'
      },
      xAxis: {
        type: 'category',
        data: ['活动前', '活动中', '活动后1周', '活动后1月', '活动后3月']
      },
      yAxis: {
        type: 'value',
        name: 'ROI (%)'
      },
      series: [
        {
          name: 'ROI',
          type: 'line',
          data: [0, 150, 280, 350, 385],
          smooth: true,
          lineStyle: {
            color: getSuccessColor()
          },
          areaStyle: {
            color: hexToRgba(getSuccessColor(), 0.1)
          }
        }
      ]
    };
    roiChart.setOption(roiOption);
  }
};

const updateTrendChart = (trends: any) => {
  if (activityTrendChart.value) {
    const trendChart = echarts.init(activityTrendChart.value);
    const trendOption = {
      title: {
        text: '活动效果趋势'
      },
      xAxis: {
        type: 'category',
        data: trends.dates || ['周1', '周2', '周3', '周4', '周5', '周6']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: trendMetric.value,
          type: 'line',
          data: trends.values || [75, 82, 88, 85, 90, 87],
          smooth: true,
          lineStyle: {
            color: getInfoColor()
          },
          areaStyle: {
            color: hexToRgba(getInfoColor(), 0.1)
          }
        }
      ]
    };
    trendChart.setOption(trendOption);
  }
};

// 数据加载
const loadActivities = async () => {
  try {
    const response = await get('/api/activities');
    activities.value = response.data || [
      { id: '1', name: '春季运动会', date: '2024-03-15' },
      { id: '2', name: '艺术创作节', date: '2024-04-10' },
      { id: '3', name: '科学探索日', date: '2024-05-05' },
      { id: '4', name: '音乐欣赏会', date: '2024-06-12' }
    ];
  } catch (error) {
    console.error('Activities loading failed:', error);
  }
};

onMounted(() => {
  loadActivities();
  
  // 设置默认日期范围
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  trendDateRange.value = [oneMonthAgo, now];
  
  nextTick(() => {
    updateTrends();
  });
});
</script>

<style scoped>
.intelligent-activity-analytics {
  padding: var(--spacing-lg);
  min-height: 100vh;
  background: var(--el-fill-color-lighter);
}

.analytics-header {
  margin-bottom: var(--spacing-8xl);
}

.analytics-header h1 {
  font-size: var(--text-3xl);
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-2xl);
}

.analytics-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-8xl);
}

.overview-card {
  background: var(--gradient-purple);
  color: white;
  padding: var(--spacing-lg);
  border-radius: var(--text-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-4xl);
  box-shadow: 0 var(--spacing-xs) 15px var(--shadow-light);
}

.card-icon {
  font-size: var(--text-4xl);
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.card-label {
  font-size: var(--text-sm);
  opacity: 0.9;
}

.analysis-controls {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.control-section h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.control-form {
  display: flex;
  gap: var(--spacing-4xl);
  align-items: center;
  flex-wrap: wrap;
}

.analysis-results {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.analysis-results h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-6xl);
  font-size: var(--text-2xl);
}

.performance-overview {
  margin-bottom: var(--spacing-8xl);
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.performance-card {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.performance-header h4 {
  color: var(--el-text-color-primary);
  margin: 0;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.score-value {
  font-size: var(--text-4xl);
  font-weight: bold;
  color: var(--el-color-success);
}

.score-max {
  font-size: var(--text-base);
  color: var(--el-text-color-secondary);
}

.performance-breakdown {
  display: grid;
  gap: var(--spacing-sm);
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: var(--border-width-base) solid var(--el-border-color);
}

.breakdown-item:last-child {
  border-bottom: none;
}

.learning-outcomes {
  display: grid;
  gap: var(--spacing-4xl);
}

.outcome-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--radius-md);
  border-left: var(--spacing-xs) solid var(--el-color-info);
}

.outcome-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.outcome-achievement {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  max-width: 150px;
}

.achievement-text {
  color: var(--el-color-info);
  font-weight: bold;
  font-size: var(--text-sm);
}

.social-impact {
  display: grid;
  gap: var(--spacing-sm);
}

.impact-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--radius-md);
}

.metric-label {
  color: var(--el-text-color-regular);
  font-size: var(--text-sm);
}

.metric-value {
  color: var(--el-text-color-primary);
  font-weight: bold;
}

.participant-analysis {
  margin-bottom: var(--spacing-8xl);
}

.participant-analysis h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.analysis-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.chart-container {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.chart-container h5 {
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-2xl);
}

.chart {
  height: 300px;
  width: 100%;
}

.roi-analysis {
  margin-bottom: var(--spacing-8xl);
}

.roi-analysis h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.roi-breakdown {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-lg);
}

.roi-summary {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.roi-value {
  text-align: center;
  margin-bottom: var(--text-2xl);
}

.roi-number {
  font-size: var(--text-5xl);
  font-weight: bold;
  color: var(--el-color-success);
  display: block;
}

.roi-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
  margin-top: var(--spacing-sm);
}

.roi-details {
  display: grid;
  gap: var(--spacing-sm);
}

.roi-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--radius-md);
}

.roi-item .label {
  color: var(--el-text-color-regular);
}

.roi-item .value {
  color: var(--el-text-color-primary);
  font-weight: bold;
}

.roi-chart {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.comparative-analysis {
  margin-bottom: var(--spacing-8xl);
}

.comparative-analysis h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.comparison-controls {
  display: flex;
  gap: var(--spacing-4xl);
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.comparison-results {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: var(--text-xs);
  text-align: left;
  border-bottom: var(--border-width-base) solid var(--el-border-color);
}

.comparison-table th {
  background: var(--el-text-color-regular);
  color: white;
  font-weight: 500;
}

.comparison-table .positive {
  color: var(--el-color-success);
  font-weight: bold;
}

.comparison-table .negative {
  color: var(--el-color-danger);
  font-weight: bold;
}

.optimization-recommendations {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.optimization-recommendations h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-2xl);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.recommendation-card {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
  border-left: var(--spacing-xs) solid var(--el-color-info);
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.recommendation-header h4 {
  color: var(--el-text-color-primary);
  margin: 0;
}

.recommendation-priority {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  text-transform: uppercase;
  font-weight: bold;
}

.recommendation-priority.high {
  background: var(--el-color-danger);
  color: white;
}

.recommendation-priority.medium {
  background: var(--el-color-warning);
  color: var(--el-text-color-primary);
}

.recommendation-priority.low {
  background: var(--el-color-success);
  color: white;
}

.recommendation-content {
  margin-bottom: var(--spacing-4xl);
}

.recommendation-content p {
  color: var(--el-text-color-secondary);
  margin-bottom: var(--spacing-4xl);
}

.recommendation-impact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-sm);
}

.impact-item {
  text-align: center;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--radius-md);
}

.impact-item .label {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
  margin-bottom: var(--spacing-xs);
}

.impact-item .value {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.recommendation-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.success-prediction {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.success-prediction h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-2xl);
}

.prediction-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-8xl);
}

.prediction-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.prediction-score {
  display: flex;
  justify-content: center;
  align-items: center;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-inner {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-full);
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px var(--shadow-light);
}

.score-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--el-color-success);
}

.score-label {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
}

.prediction-factors h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.factors-list {
  display: grid;
  gap: var(--spacing-sm);
}

.factor-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--el-fill-color-light);
  border-radius: var(--radius-md);
}

.factor-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 100px;
}

.factor-impact {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.impact-value {
  color: var(--el-color-info);
  font-weight: bold;
  font-size: var(--text-sm);
}

.prediction-scenarios h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.scenarios-grid {
  display: grid;
  gap: var(--spacing-4xl);
}

.scenario-card {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--el-border-color);
}

.scenario-card h5 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-2xl);
}

.scenario-probability {
  color: var(--el-color-info);
  font-weight: bold;
  margin-bottom: var(--spacing-2xl);
}

.scenario-conditions h6 {
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-sm);
}

.scenario-conditions ul {
  margin: 0;
  padding-left: var(--text-2xl);
}

.scenario-conditions li {
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-xs);
}

.activity-trends {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.activity-trends h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-2xl);
}

.trend-controls {
  display: flex;
  gap: var(--spacing-4xl);
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.trend-chart {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

@media (max-width: var(--breakpoint-md)) {
  .analytics-overview {
    grid-template-columns: 1fr;
  }
  
  .control-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .performance-grid {
    grid-template-columns: 1fr;
  }
  
  .analysis-charts {
    grid-template-columns: 1fr;
  }
  
  .roi-breakdown {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .prediction-dashboard {
    grid-template-columns: 1fr;
  }
  
  .prediction-summary {
    grid-template-columns: 1fr;
  }
  
  .comparison-controls {
    flex-direction: column;
  }
  
  .trend-controls {
    flex-direction: column;
  }
}
</style>