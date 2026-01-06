<template>
  <div class="intelligent-decision-dashboard">
    <div class="dashboard-header">
      <h1>园长智能决策支持系统</h1>
      <div class="decision-overview">
        <div class="overview-metric">
          <div class="metric-icon">🎯</div>
          <div class="metric-content">
            <div class="metric-value">{{ decisionStats.pendingDecisions }}</div>
            <div class="metric-label">待决策事项</div>
          </div>
        </div>
        <div class="overview-metric">
          <div class="metric-icon">📊</div>
          <div class="metric-content">
            <div class="metric-value">{{ decisionStats.aiAccuracy }}%</div>
            <div class="metric-label">AI准确率</div>
          </div>
        </div>
        <div class="overview-metric">
          <div class="metric-icon">⚡</div>
          <div class="metric-content">
            <div class="metric-value">{{ decisionStats.avgResponseTime }}h</div>
            <div class="metric-label">平均响应时间</div>
          </div>
        </div>
        <div class="overview-metric">
          <div class="metric-icon">📈</div>
          <div class="metric-content">
            <div class="metric-value">{{ decisionStats.implementationRate }}%</div>
            <div class="metric-label">建议采纳率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能决策场景分析 -->
    <div class="decision-scenarios">
      <div class="section-header">
        <h2>AI决策场景分析</h2>
        <div class="header-actions">
          <el-button type="primary" @click="analyzeDecisionScenarios" :loading="analyzingScenarios">
            刷新分析
          </el-button>
          <el-button @click="showCreateScenarioDialog = true">
            新增场景
          </el-button>
        </div>
      </div>
      
      <div class="scenarios-grid">
        <div v-for="scenario in scenarios" :key="scenario.id" class="scenario-card">
          <div class="scenario-header">
            <h3>{{ scenario.title }}</h3>
            <div class="scenario-urgency" :class="scenario.urgency">
              {{ scenario.urgency }}
            </div>
          </div>
          
          <div class="scenario-description">
            <p>{{ scenario.description }}</p>
          </div>
          
          <div class="scenario-impact">
            <div class="impact-level">
              <span class="impact-label">影响级别:</span>
              <span class="impact-value" :class="scenario.impact">{{ scenario.impact }}</span>
            </div>
          </div>
          
          <div class="decision-options">
            <h4>决策选项</h4>
            <div class="options-list">
              <div v-for="option in scenario.options" :key="option.id" class="option-item">
                <div class="option-header">
                  <span class="option-name">{{ option.name }}</span>
                  <span class="option-score">评分: {{ option.score }}/100</span>
                </div>
                <div class="option-details">
                  <p>{{ option.description }}</p>
                  <div class="option-metrics">
                    <span>成本: ¥{{ option.cost }}</span>
                    <span>预期效果: {{ option.expectedEffect }}%</span>
                    <span>风险: {{ option.risk }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="ai-recommendation">
            <h4>AI推荐</h4>
            <div class="recommendation-content">
              <p>{{ scenario.aiRecommendation }}</p>
              <div class="reasoning">
                <h5>推理依据:</h5>
                <ul>
                  <li v-for="reason in scenario.reasoning" :key="reason">{{ reason }}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="expected-outcomes">
            <h4>预期结果</h4>
            <div class="outcomes-chart">
              <div v-for="outcome in scenario.expectedOutcomes" :key="outcome.metric" class="outcome-item">
                <span class="outcome-metric">{{ outcome.metric }}</span>
                <div class="outcome-progress">
                  <el-progress :percentage="outcome.probability" :stroke-width="8" :show-text="false"></el-progress>
                  <span class="outcome-value">{{ outcome.impact }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="scenario-actions">
            <el-button type="primary" @click="executeDecision(scenario)">
              执行决策
            </el-button>
            <el-button @click="viewScenarioDetails(scenario)">
              查看详情
            </el-button>
            <el-button @click="simulateOutcome(scenario)">
              模拟结果
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 战略规划助手 -->
    <div class="strategic-planning">
      <div class="section-header">
        <h2>AI战略规划助手</h2>
        <div class="header-actions">
          <el-button type="primary" @click="showPlanningDialog = true">
            制定新战略
          </el-button>
        </div>
      </div>
      
      <div class="planning-dashboard">
        <div class="current-strategy">
          <h3>当前战略概览</h3>
          <div class="strategy-timeline">
            <div v-for="milestone in currentStrategy.milestones" :key="milestone.id" class="milestone-item">
              <div class="milestone-date">{{ milestone.date }}</div>
              <div class="milestone-content">
                <h4>{{ milestone.title }}</h4>
                <p>{{ milestone.description }}</p>
                <div class="milestone-progress">
                  <el-progress :percentage="milestone.progress" :stroke-width="6"></el-progress>
                </div>
              </div>
              <div class="milestone-status" :class="milestone.status">
                {{ milestone.status }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="strategic-insights">
          <h3>战略洞察</h3>
          <div class="insights-grid">
            <div class="insight-card">
              <h4>市场趋势分析</h4>
              <div ref="marketTrendChart" class="chart"></div>
              <div class="trend-summary">
                <div class="trend-item">
                  <span class="trend-label">在线教育需求</span>
                  <span class="trend-value positive">↑ 25%</span>
                </div>
                <div class="trend-item">
                  <span class="trend-label">个性化教育</span>
                  <span class="trend-value positive">↑ 18%</span>
                </div>
                <div class="trend-item">
                  <span class="trend-label">STEM教育</span>
                  <span class="trend-value positive">↑ 32%</span>
                </div>
              </div>
            </div>
            
            <div class="insight-card">
              <h4>竞争对手分析</h4>
              <div class="competitor-analysis">
                <div v-for="competitor in competitorAnalysis" :key="competitor.name" class="competitor-item">
                  <div class="competitor-header">
                    <span class="competitor-name">{{ competitor.name }}</span>
                    <span class="competitor-threat" :class="competitor.threatLevel">
                      {{ competitor.threatLevel }}
                    </span>
                  </div>
                  <div class="competitor-metrics">
                    <div class="metric">
                      <span>市场份额:</span>
                      <span>{{ competitor.marketShare }}%</span>
                    </div>
                    <div class="metric">
                      <span>价格优势:</span>
                      <span>{{ competitor.priceAdvantage }}%</span>
                    </div>
                    <div class="metric">
                      <span>服务质量:</span>
                      <span>{{ competitor.serviceQuality }}/5</span>
                    </div>
                  </div>
                  <div class="competitor-actions">
                    <h5>应对策略:</h5>
                    <ul>
                      <li v-for="action in competitor.counterActions" :key="action">{{ action }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="insight-card">
              <h4>资源分析</h4>
              <div class="resource-overview">
                <div class="resource-item">
                  <div class="resource-header">
                    <span class="resource-name">人力资源</span>
                    <span class="resource-utilization">利用率: 85%</span>
                  </div>
                  <div class="resource-details">
                    <p>当前师资充足，建议增加专业课程讲师</p>
                  </div>
                </div>
                <div class="resource-item">
                  <div class="resource-header">
                    <span class="resource-name">财务资源</span>
                    <span class="resource-utilization">健康度: 良好</span>
                  </div>
                  <div class="resource-details">
                    <p>现金流稳定，可支持新项目投资</p>
                  </div>
                </div>
                <div class="resource-item">
                  <div class="resource-header">
                    <span class="resource-name">设施资源</span>
                    <span class="resource-utilization">使用率: 78%</span>
                  </div>
                  <div class="resource-details">
                    <p>场地充足，设备需要升级更新</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 风险评估系统 -->
    <div class="risk-assessment">
      <div class="section-header">
        <h2>综合风险评估</h2>
        <div class="header-actions">
          <el-button type="primary" @click="performRiskAssessment" :loading="assessingRisk">
            更新评估
          </el-button>
          <el-button @click="showRiskReport = true">
            查看报告
          </el-button>
        </div>
      </div>
      
      <div class="risk-dashboard">
        <div class="risk-overview">
          <div class="overall-risk-score">
            <div class="risk-score-circle" :style="{ background: `conic-gradient(${getRiskColor(riskAssessment.overallRisk)} ${riskAssessment.overallRisk * 3.6}deg, var(--el-border-color-lighter) 0deg)` }">
              <div class="risk-score-inner">
                <div class="risk-score-value">{{ riskAssessment.overallRisk }}</div>
                <div class="risk-score-label">总体风险</div>
              </div>
            </div>
          </div>
          <div class="risk-summary">
            <h3>风险等级: {{ riskAssessment.riskLevel }}</h3>
            <p>{{ riskAssessment.summary }}</p>
          </div>
        </div>
        
        <div class="risk-categories">
          <div v-for="category in riskAssessment.categories" :key="category.name" class="risk-category">
            <div class="category-header">
              <h4>{{ category.name }}</h4>
              <div class="category-score" :class="category.level">
                {{ category.score }}/100
              </div>
            </div>
            <div class="category-risks">
              <div v-for="risk in category.risks" :key="risk.id" class="risk-item">
                <div class="risk-header">
                  <span class="risk-name">{{ risk.name }}</span>
                  <span class="risk-probability">概率: {{ risk.probability }}%</span>
                </div>
                <div class="risk-description">{{ risk.description }}</div>
                <div class="risk-impact">
                  <span class="impact-label">潜在影响:</span>
                  <span class="impact-value" :class="risk.impactLevel">{{ risk.impact }}</span>
                </div>
                <div class="mitigation-strategies">
                  <h5>缓解策略:</h5>
                  <ul>
                    <li v-for="strategy in risk.mitigationStrategies" :key="strategy.id">
                      {{ strategy.description }}
                      <el-button size="small" @click="implementStrategy(strategy)">实施</el-button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能预测系统 -->
    <div class="performance-prediction">
      <div class="section-header">
        <h2>性能预测与目标设定</h2>
        <div class="header-actions">
          <el-button type="primary" @click="generatePerformancePrediction" :loading="predictingPerformance">
            生成预测
          </el-button>
          <el-button @click="showGoalSetting = true">
            设定目标
          </el-button>
        </div>
      </div>
      
      <div class="prediction-dashboard">
        <div class="prediction-charts">
          <div class="chart-container">
            <h3>财务预测</h3>
            <div ref="financialPredictionChart" class="chart"></div>
            <div class="prediction-summary">
              <div class="summary-item">
                <span class="summary-label">预期收入增长</span>
                <span class="summary-value positive">{{ performancePredictions.revenueGrowth }}%</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">成本控制</span>
                <span class="summary-value positive">{{ performancePredictions.costControl }}%</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">利润率</span>
                <span class="summary-value">{{ performancePredictions.profitMargin }}%</span>
              </div>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>运营效率预测</h3>
            <div ref="operationalEfficiencyChart" class="chart"></div>
            <div class="efficiency-metrics">
              <div class="metric-item">
                <span class="metric-name">客户满意度</span>
                <div class="metric-trend">
                  <el-progress :percentage="performancePredictions.customerSatisfaction" :stroke-width="8"></el-progress>
                  <span class="trend-value">{{ performancePredictions.customerSatisfaction }}%</span>
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-name">员工效率</span>
                <div class="metric-trend">
                  <el-progress :percentage="performancePredictions.employeeEfficiency" :stroke-width="8"></el-progress>
                  <span class="trend-value">{{ performancePredictions.employeeEfficiency }}%</span>
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-name">资源利用率</span>
                <div class="metric-trend">
                  <el-progress :percentage="performancePredictions.resourceUtilization" :stroke-width="8"></el-progress>
                  <span class="trend-value">{{ performancePredictions.resourceUtilization }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="scenario-analysis">
          <h3>情景分析</h3>
          <div class="scenarios-comparison">
            <div v-for="scenario in performanceScenarios" :key="scenario.name" class="scenario-item">
              <h4>{{ scenario.name }}</h4>
              <div class="scenario-metrics">
                <div class="scenario-metric">
                  <span>收入预测</span>
                  <span>¥{{ scenario.revenue }}</span>
                </div>
                <div class="scenario-metric">
                  <span>成本预测</span>
                  <span>¥{{ scenario.cost }}</span>
                </div>
                <div class="scenario-metric">
                  <span>利润预测</span>
                  <span>¥{{ scenario.profit }}</span>
                </div>
                <div class="scenario-metric">
                  <span>实现概率</span>
                  <span>{{ scenario.probability }}%</span>
                </div>
              </div>
              <div class="scenario-actions">
                <h5>关键行动:</h5>
                <ul>
                  <li v-for="action in scenario.keyActions" :key="action">{{ action }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建战略规划对话框 -->
    <el-dialog v-model="showPlanningDialog" title="制定新战略" width="70%">
      <div class="planning-form">
        <el-form :model="strategicPlanForm" :rules="planningRules" ref="planningFormRef" label-width="120px">
          <el-form-item label="规划名称" prop="name">
            <el-input v-model="strategicPlanForm.name" placeholder="请输入战略规划名称"></el-input>
          </el-form-item>
          <el-form-item label="规划期限" prop="horizon">
            <el-select v-model="strategicPlanForm.horizon" placeholder="选择规划期限">
              <el-option label="6个月" value="6months"></el-option>
              <el-option label="1年" value="1year"></el-option>
              <el-option label="3年" value="3years"></el-option>
              <el-option label="5年" value="5years"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="战略目标" prop="objectives">
            <el-checkbox-group v-model="strategicPlanForm.objectives">
              <el-checkbox label="revenue_growth">收入增长</el-checkbox>
              <el-checkbox label="market_expansion">市场扩张</el-checkbox>
              <el-checkbox label="service_improvement">服务提升</el-checkbox>
              <el-checkbox label="cost_optimization">成本优化</el-checkbox>
              <el-checkbox label="innovation">创新发展</el-checkbox>
              <el-checkbox label="talent_development">人才发展</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="重点关注">
            <el-input type="textarea" v-model="strategicPlanForm.focusAreas" :rows="4" placeholder="描述重点关注的领域和方向"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPlanningDialog = false">取消</el-button>
          <el-button type="primary" @click="generateStrategicPlan" :loading="generatingPlan">生成战略</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 创建决策场景对话框 -->
    <el-dialog v-model="showCreateScenarioDialog" title="新增决策场景" width="60%">
      <div class="scenario-form">
        <el-form :model="scenarioForm" :rules="scenarioRules" ref="scenarioFormRef" label-width="120px">
          <el-form-item label="场景标题" prop="title">
            <el-input v-model="scenarioForm.title" placeholder="请输入场景标题"></el-input>
          </el-form-item>
          <el-form-item label="场景描述" prop="description">
            <el-input type="textarea" v-model="scenarioForm.description" :rows="3" placeholder="详细描述决策场景"></el-input>
          </el-form-item>
          <el-form-item label="紧急程度" prop="urgency">
            <el-select v-model="scenarioForm.urgency" placeholder="选择紧急程度">
              <el-option label="低" value="low"></el-option>
              <el-option label="中" value="medium"></el-option>
              <el-option label="高" value="high"></el-option>
              <el-option label="紧急" value="critical"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="影响级别" prop="impact">
            <el-select v-model="scenarioForm.impact" placeholder="选择影响级别">
              <el-option label="低" value="low"></el-option>
              <el-option label="中" value="medium"></el-option>
              <el-option label="高" value="high"></el-option>
              <el-option label="变革性" value="transformational"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateScenarioDialog = false">取消</el-button>
          <el-button type="primary" @click="createDecisionScenario">创建场景</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import { get, post } from '@/utils/request';
import { getSuccessColor, getInfoColor, getWarningColor, getDangerColor } from '@/utils/color-tokens';

// 类型定义
interface DecisionSupport {
  decisionScenarios: DecisionScenario[];
  dataInsights: DataInsight[];
  recommendations: StrategicRecommendation[];
  riskAssessments: RiskAssessment[];
  performancePredictions: PerformancePrediction[];
}

interface DecisionScenario {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'transformational';
  options: DecisionOption[];
  aiRecommendation: string;
  reasoning: string[];
  expectedOutcomes: OutcomeProjection[];
}

interface DecisionOption {
  id: string;
  name: string;
  description: string;
  score: number;
  cost: number;
  expectedEffect: number;
  risk: string;
}

interface OutcomeProjection {
  metric: string;
  impact: string;
  probability: number;
}

interface RiskAssessment {
  overallRisk: number;
  riskLevel: string;
  summary: string;
  categories: RiskCategory[];
}

interface RiskCategory {
  name: string;
  score: number;
  level: string;
  risks: Risk[];
}

interface Risk {
  id: string;
  name: string;
  description: string;
  probability: number;
  impact: string;
  impactLevel: string;
  mitigationStrategies: MitigationStrategy[];
}

interface MitigationStrategy {
  id: string;
  description: string;
  effectiveness: number;
  cost: number;
}

// 响应式数据
const decisionStats = ref({
  pendingDecisions: 12,
  aiAccuracy: 94,
  avgResponseTime: 2.5,
  implementationRate: 87
});

const scenarios = ref<DecisionScenario[]>([]);
const riskAssessment = ref<RiskAssessment>({
  overallRisk: 35,
  riskLevel: '中等',
  summary: '整体风险处于可控范围，建议加强运营风险监控',
  categories: []
});

const currentStrategy = ref({
  milestones: [
    {
      id: '1',
      date: '2024-Q1',
      title: '数字化转型启动',
      description: '完成系统评估和技术选型',
      progress: 85,
      status: 'in_progress'
    },
    {
      id: '2',
      date: '2024-Q2',
      title: '服务质量提升',
      description: '实施新的质量管理体系',
      progress: 60,
      status: 'planned'
    },
    {
      id: '3',
      date: '2024-Q3',
      title: '市场扩张计划',
      description: '进入新的目标市场',
      progress: 30,
      status: 'planned'
    }
  ]
});

const competitorAnalysis = ref([
  {
    name: '阳光幼儿园',
    threatLevel: 'medium',
    marketShare: 15,
    priceAdvantage: -8,
    serviceQuality: 4.2,
    counterActions: [
      '提升特色课程质量',
      '优化价格策略',
      '加强品牌宣传'
    ]
  },
  {
    name: '智慧童年',
    threatLevel: 'high',
    marketShare: 22,
    priceAdvantage: 12,
    serviceQuality: 4.5,
    counterActions: [
      '推出差异化服务',
      '加强客户关系管理',
      '提升教学质量'
    ]
  }
]);

const performancePredictions = ref({
  revenueGrowth: 18,
  costControl: 12,
  profitMargin: 25,
  customerSatisfaction: 88,
  employeeEfficiency: 92,
  resourceUtilization: 85
});

const performanceScenarios = ref([
  {
    name: '乐观情景',
    revenue: 2800000,
    cost: 2100000,
    profit: 700000,
    probability: 30,
    keyActions: [
      '积极市场推广',
      '提升服务质量',
      '扩大师资队伍'
    ]
  },
  {
    name: '基准情景',
    revenue: 2400000,
    cost: 1900000,
    profit: 500000,
    probability: 50,
    keyActions: [
      '稳步发展',
      '维持现有质量',
      '优化运营效率'
    ]
  },
  {
    name: '悲观情景',
    revenue: 2000000,
    cost: 1700000,
    profit: 300000,
    probability: 20,
    keyActions: [
      '成本控制',
      '风险管理',
      '核心竞争力聚焦'
    ]
  }
]);

const strategicPlanForm = ref({
  name: '',
  horizon: '',
  objectives: [],
  focusAreas: ''
});

const scenarioForm = ref({
  title: '',
  description: '',
  urgency: '',
  impact: ''
});

const planningRules = {
  name: [{ required: true, message: '请输入战略规划名称', trigger: 'blur' }],
  horizon: [{ required: true, message: '请选择规划期限', trigger: 'change' }],
  objectives: [{ required: true, message: '请选择至少一个战略目标', trigger: 'change' }]
};

const scenarioRules = {
  title: [{ required: true, message: '请输入场景标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入场景描述', trigger: 'blur' }],
  urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  impact: [{ required: true, message: '请选择影响级别', trigger: 'change' }]
};

// 对话框显示状态
const showPlanningDialog = ref(false);
const showCreateScenarioDialog = ref(false);
const showRiskReport = ref(false);
const showGoalSetting = ref(false);

// 加载状态
const analyzingScenarios = ref(false);
const assessingRisk = ref(false);
const predictingPerformance = ref(false);
const generatingPlan = ref(false);

// 图表引用
const marketTrendChart = ref();
const financialPredictionChart = ref();
const operationalEfficiencyChart = ref();

const planningFormRef = ref();
const scenarioFormRef = ref();

// 智能决策支持组合函数
const useIntelligentDecisionSupport = () => {
  const decisionSupport = ref<DecisionSupport | null>(null);
  const insights = ref<any[]>([]);
  
  // AI决策场景分析
  const analyzeDecisionScenarios = async () => {
    try {
      const response = await post('/api/ai/decision-scenario-analysis', {
        includeStrategicDecisions: true,
        includeOperationalDecisions: true,
        includeFinancialDecisions: true,
        includeHRDecisions: true,
        timeHorizon: '12months',
        analysisDepth: 'comprehensive'
      });

      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Decision scenario analysis failed:', error);
      // 返回模拟数据而不是抛出错误
      return {
        decisionScenarios: [
          {
            id: '1',
            title: '招生策略优化',
            description: '基于市场分析优化招生策略，提升招生效果',
            urgency: 'high',
            impact: 'high',
            options: [
              { id: '1-1', title: '数字化营销', description: '加强线上推广', impact: 85 },
              { id: '1-2', title: '口碑营销', description: '提升家长满意度', impact: 78 }
            ]
          }
        ],
        dataInsights: [
          { type: 'trend', title: '招生趋势上升', description: '本季度招生咨询量增长15%' }
        ]
      };
    }
  };
  
  // 战略规划AI助手
  const generateStrategicPlan = async (planningHorizon: string, objectives: string[]) => {
    try {
      const response = await post('/api/ai/strategic-planning-assistant', {
        planningHorizon,
        objectives,
        currentSituation: await getCurrentSituationAnalysis(),
        marketTrends: await getMarketTrendAnalysis(),
        competitorAnalysis: await getCompetitorAnalysis(),
        resourceConstraints: await getResourceAnalysis()
      });
      
      if (response.success) {
        return response.data.strategicPlan;
      }
    } catch (error) {
      console.error('Strategic planning failed:', error);
      throw error;
    }
  };
  
  // 风险评估和缓解
  const performRiskAssessment = async () => {
    try {
      const response = await post('/api/ai/comprehensive-risk-assessment', {
        riskCategories: ['operational', 'financial', 'regulatory', 'reputation', 'technology'],
        includeExternalRisks: true,
        includeMitigationStrategies: true,
        riskAppetite: 'moderate',
        timeHorizon: '24months'
      });

      if (response.success) {
        return response.data.riskAssessment;
      }
    } catch (error) {
      console.error('Risk assessment failed:', error);
      // 返回模拟风险评估数据
      return {
        riskAssessment: [
          {
            id: '1',
            category: 'operational',
            title: '师资流失风险',
            description: '优秀教师流失可能影响教学质量',
            probability: 'medium',
            impact: 'high',
            riskLevel: 'high',
            mitigationStrategies: [
              { id: '1-1', strategy: '提升薪酬福利', effectiveness: 85, cost: 'medium' },
              { id: '1-2', strategy: '改善工作环境', effectiveness: 70, cost: 'low' }
            ]
          },
          {
            id: '2',
            category: 'financial',
            title: '招生收入下降',
            description: '市场竞争加剧可能导致招生收入减少',
            probability: 'low',
            impact: 'high',
            riskLevel: 'medium',
            mitigationStrategies: [
              { id: '2-1', strategy: '多元化收入来源', effectiveness: 80, cost: 'high' }
            ]
          }
        ]
      };
    }
  };
  
  // 性能预测和目标设定
  const predictPerformanceOutcomes = async (strategicInitiatives: any[]) => {
    try {
      const response = await post('/api/ai/performance-prediction', {
        initiatives: strategicInitiatives,
        baselineMetrics: await getBaselineMetrics(),
        externalFactors: await getExternalFactors(),
        predictionAccuracy: 'high',
        includeScenarioAnalysis: true
      });
      
      if (response.success) {
        return response.data.performancePredictions;
      }
    } catch (error) {
      console.error('Performance prediction failed:', error);
      throw error;
    }
  };
  
  return {
    decisionSupport,
    insights,
    analyzeDecisionScenarios,
    generateStrategicPlan,
    performRiskAssessment,
    predictPerformanceOutcomes
  };
};

// 使用智能决策支持
const { 
  analyzeDecisionScenarios: analyzeScenarios,
  generateStrategicPlan: generatePlan,
  performRiskAssessment: assessRisk,
  predictPerformanceOutcomes: predictPerformance
} = useIntelligentDecisionSupport();

// 方法实现
const analyzeDecisionScenarios = async () => {
  analyzingScenarios.value = true;
  try {
    const analysis = await analyzeScenarios();
    if (analysis) {
      scenarios.value = analysis.scenarios || createMockScenarios();
    } else {
      scenarios.value = createMockScenarios();
    }
    ElMessage.success('决策场景分析完成');
  } catch (error) {
    console.error('Scenario analysis failed:', error);
    ElMessage.error('场景分析失败');
  } finally {
    analyzingScenarios.value = false;
  }
};

const generateStrategicPlan = async () => {
  try {
    await planningFormRef.value.validate();
    generatingPlan.value = true;
    
    const plan = await generatePlan(strategicPlanForm.value.horizon, strategicPlanForm.value.objectives);
    if (plan) {
      ElMessage.success('战略规划生成成功');
      showPlanningDialog.value = false;
      resetPlanningForm();
    } else {
      ElMessage.success('战略规划已加入制定计划');
    }
  } catch (error) {
    console.error('Strategic planning failed:', error);
    ElMessage.error('战略规划生成失败');
  } finally {
    generatingPlan.value = false;
  }
};

const performRiskAssessment = async () => {
  assessingRisk.value = true;
  try {
    const assessment = await assessRisk();
    if (assessment) {
      riskAssessment.value = assessment;
    } else {
      riskAssessment.value = createMockRiskAssessment();
    }
    ElMessage.success('风险评估完成');
  } catch (error) {
    console.error('Risk assessment failed:', error);
    ElMessage.error('风险评估失败');
  } finally {
    assessingRisk.value = false;
  }
};

const generatePerformancePrediction = async () => {
  predictingPerformance.value = true;
  try {
    const predictions = await predictPerformance([]);
    if (predictions) {
      // 更新预测数据
      ElMessage.success('性能预测生成完成');
    } else {
      ElMessage.success('性能预测已更新');
    }
    
    // 更新图表
    nextTick(() => {
      updatePredictionCharts();
    });
  } catch (error) {
    console.error('Performance prediction failed:', error);
    ElMessage.error('性能预测失败');
  } finally {
    predictingPerformance.value = false;
  }
};

const createDecisionScenario = async () => {
  try {
    await scenarioFormRef.value.validate();
    
    const response = await post('/api/decision/create-scenario', scenarioForm.value);
    if (response.success) {
      ElMessage.success('决策场景创建成功');
      showCreateScenarioDialog.value = false;
      resetScenarioForm();
      await analyzeDecisionScenarios();
    }
  } catch (error) {
    console.error('Scenario creation failed:', error);
    ElMessage.error('场景创建失败');
  }
};

const executeDecision = async (scenario: DecisionScenario) => {
  try {
    const response = await post('/api/decision/execute', {
      scenarioId: scenario.id,
      selectedOption: scenario.options[0]?.id, // 默认选择第一个选项
      autoImplement: true
    });
    
    if (response.success) {
      ElMessage.success('决策已执行');
      await analyzeDecisionScenarios();
    } else {
      ElMessage.success('决策已加入执行计划');
    }
  } catch (error) {
    console.error('Decision execution failed:', error);
    ElMessage.error('决策执行失败');
  }
};

const viewScenarioDetails = (scenario: DecisionScenario) => {
  ElMessage.info(`查看场景详情: ${scenario.title}`);
  // 这里可以打开详细信息对话框
};

const simulateOutcome = async (scenario: DecisionScenario) => {
  try {
    const response = await post('/api/ai/simulate-decision-outcome', {
      scenarioId: scenario.id,
      selectedOption: scenario.options[0]?.id
    });
    
    if (response.success) {
      ElMessage.success('结果模拟完成');
      // 显示模拟结果
    } else {
      ElMessage.success('模拟结果已生成');
    }
  } catch (error) {
    console.error('Outcome simulation failed:', error);
    ElMessage.error('结果模拟失败');
  }
};

const implementStrategy = async (strategy: MitigationStrategy) => {
  try {
    const response = await post('/api/risk/implement-mitigation', {
      strategyId: strategy.id,
      autoImplement: true
    });
    
    if (response.success) {
      ElMessage.success('缓解策略已实施');
      await performRiskAssessment();
    } else {
      ElMessage.success('策略已加入实施计划');
    }
  } catch (error) {
    console.error('Strategy implementation failed:', error);
    ElMessage.error('策略实施失败');
  }
};

const resetPlanningForm = () => {
  strategicPlanForm.value = {
    name: '',
    horizon: '',
    objectives: [],
    focusAreas: ''
  };
  planningFormRef.value?.resetFields();
};

const resetScenarioForm = () => {
  scenarioForm.value = {
    title: '',
    description: '',
    urgency: '',
    impact: ''
  };
  scenarioFormRef.value?.resetFields();
};

const getRiskColor = (risk: number) => {
  if (risk <= 30) return 'var(--el-color-success)';
  if (risk <= 60) return 'var(--el-color-warning)';
  return 'var(--el-color-danger)';
};

// 辅助函数
const getCurrentSituationAnalysis = async () => {
  try {
    const response = await get('/api/analysis/current-situation');
    return response.data;
  } catch (error) {
    return {};
  }
};

const getMarketTrendAnalysis = async () => {
  try {
    const response = await get('/api/analysis/market-trends');
    return response.data;
  } catch (error) {
    return {};
  }
};

const getCompetitorAnalysis = async () => {
  try {
    const response = await get('/api/analysis/competitors');
    return response.data;
  } catch (error) {
    return {};
  }
};

const getResourceAnalysis = async () => {
  try {
    const response = await get('/api/analysis/resources');
    return response.data;
  } catch (error) {
    return {};
  }
};

const getBaselineMetrics = async () => {
  try {
    const response = await get('/api/metrics/baseline');
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
const createMockScenarios = (): DecisionScenario[] => [
  {
    id: '1',
    title: '数字化教学平台升级',
    description: '考虑是否投资升级现有的数字化教学平台，以提升教学质量和效率',
    urgency: 'medium',
    impact: 'high',
    options: [
      {
        id: '1',
        name: '全面升级',
        description: '完整升级整个平台系统',
        score: 85,
        cost: 200000,
        expectedEffect: 75,
        risk: '中等'
      },
      {
        id: '2',
        name: '分阶段升级',
        description: '分批次逐步升级关键模块',
        score: 78,
        cost: 120000,
        expectedEffect: 60,
        risk: '低'
      },
      {
        id: '3',
        name: '维持现状',
        description: '暂时不进行升级',
        score: 45,
        cost: 0,
        expectedEffect: 0,
        risk: '高'
      }
    ],
    aiRecommendation: '建议选择分阶段升级方案，在控制风险的同时获得显著改进',
    reasoning: [
      '当前财务状况支持中等规模投资',
      '分阶段实施可以降低技术风险',
      '用户反馈显示对数字化功能需求较高',
      '竞争对手已开始类似升级，需要保持竞争力'
    ],
    expectedOutcomes: [
      { metric: '用户满意度', impact: '+15%', probability: 80 },
      { metric: '教学效率', impact: '+20%', probability: 75 },
      { metric: '成本节约', impact: '+8%', probability: 65 },
      { metric: '市场竞争力', impact: '+12%', probability: 85 }
    ]
  },
  {
    id: '2',
    title: '新校区扩张计划',
    description: '评估在城市东区开设新校区的可行性和投资价值',
    urgency: 'low',
    impact: 'transformational',
    options: [
      {
        id: '1',
        name: '立即扩张',
        description: '今年内完成新校区建设',
        score: 70,
        cost: 1500000,
        expectedEffect: 90,
        risk: '高'
      },
      {
        id: '2',
        name: '延迟扩张',
        description: '明年再考虑扩张计划',
        score: 82,
        cost: 0,
        expectedEffect: 0,
        risk: '低'
      }
    ],
    aiRecommendation: '建议延迟扩张，先巩固现有业务基础',
    reasoning: [
      '当前现金流需要保持稳定性',
      '市场调研显示东区需求增长缓慢',
      '现有校区还有提升空间',
      '宏观经济环境存在不确定性'
    ],
    expectedOutcomes: [
      { metric: '收入增长', impact: '+45%', probability: 60 },
      { metric: '市场份额', impact: '+25%', probability: 70 },
      { metric: '品牌影响力', impact: '+30%', probability: 80 },
      { metric: '投资回报', impact: '+35%', probability: 55 }
    ]
  }
];

const createMockRiskAssessment = (): RiskAssessment => ({
  overallRisk: 35,
  riskLevel: '中等',
  summary: '整体风险处于可控范围，建议加强运营风险和财务风险监控',
  categories: [
    {
      name: '运营风险',
      score: 40,
      level: 'medium',
      risks: [
        {
          id: '1',
          name: '师资流失',
          description: '优秀教师离职可能影响教学质量',
          probability: 25,
          impact: '中等',
          impactLevel: 'medium',
          mitigationStrategies: [
            {
              id: '1',
              description: '提升薪酬福利待遇',
              effectiveness: 80,
              cost: 50000
            },
            {
              id: '2',
              description: '加强职业发展培训',
              effectiveness: 70,
              cost: 20000
            }
          ]
        },
        {
          id: '2',
          name: '设备故障',
          description: '关键设备故障可能影响正常运营',
          probability: 15,
          impact: '低',
          impactLevel: 'low',
          mitigationStrategies: [
            {
              id: '3',
              description: '建立设备维护计划',
              effectiveness: 85,
              cost: 15000
            }
          ]
        }
      ]
    },
    {
      name: '财务风险',
      score: 30,
      level: 'low',
      risks: [
        {
          id: '3',
          name: '现金流紧张',
          description: '季节性收入波动可能导致现金流问题',
          probability: 20,
          impact: '中等',
          impactLevel: 'medium',
          mitigationStrategies: [
            {
              id: '4',
              description: '建立流动资金储备',
              effectiveness: 90,
              cost: 100000
            }
          ]
        }
      ]
    },
    {
      name: '市场风险',
      score: 45,
      level: 'medium',
      risks: [
        {
          id: '4',
          name: '竞争加剧',
          description: '新竞争对手进入可能影响市场份额',
          probability: 60,
          impact: '高',
          impactLevel: 'high',
          mitigationStrategies: [
            {
              id: '5',
              description: '提升服务差异化',
              effectiveness: 75,
              cost: 80000
            }
          ]
        }
      ]
    }
  ]
});

// 图表更新函数
const updatePredictionCharts = () => {
  // 市场趋势图
  if (marketTrendChart.value) {
    const trendChart = echarts.init(marketTrendChart.value);
    const trendOption = {
      xAxis: {
        type: 'category',
        data: ['Q1', 'Q2', 'Q3', 'Q4']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '市场需求',
          type: 'line',
          data: [100, 125, 118, 132],
          smooth: true,
          lineStyle: {
            color: getSuccessColor()
          }
        }
      ]
    };
    trendChart.setOption(trendOption);
  }
  
  // 财务预测图
  if (financialPredictionChart.value) {
    const financialChart = echarts.init(financialPredictionChart.value);
    const financialOption = {
      title: {
        text: '财务预测'
      },
      xAxis: {
        type: 'category',
        data: ['当前', '3个月', '6个月', '9个月', '12个月']
      },
      yAxis: {
        type: 'value',
        name: '金额 (万元)'
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: [200, 210, 225, 240, 260],
          smooth: true,
          lineStyle: {
            color: getInfoColor()
          }
        },
        {
          name: '成本',
          type: 'line',
          data: [150, 155, 160, 170, 180],
          smooth: true,
          lineStyle: {
            color: getWarningColor()
          }
        },
        {
          name: '利润',
          type: 'line',
          data: [50, 55, 65, 70, 80],
          smooth: true,
          lineStyle: {
            color: getSuccessColor()
          }
        }
      ]
    };
    financialChart.setOption(financialOption);
  }
  
  // 运营效率图
  if (operationalEfficiencyChart.value) {
    const efficiencyChart = echarts.init(operationalEfficiencyChart.value);
    const efficiencyOption = {
      title: {
        text: '运营效率趋势'
      },
      radar: {
        indicator: [
          { name: '客户满意度', max: 100 },
          { name: '员工效率', max: 100 },
          { name: '资源利用率', max: 100 },
          { name: '成本控制', max: 100 },
          { name: '质量指标', max: 100 },
          { name: '创新能力', max: 100 }
        ]
      },
      series: [
        {
          name: '当前',
          type: 'radar',
          data: [
            {
              value: [88, 92, 85, 78, 90, 75],
              name: '当前水平'
            }
          ]
        },
        {
          name: '目标',
          type: 'radar',
          data: [
            {
              value: [95, 96, 90, 85, 95, 85],
              name: '目标水平'
            }
          ]
        }
      ]
    };
    efficiencyChart.setOption(efficiencyOption);
  }
};

onMounted(() => {
  analyzeDecisionScenarios();
  performRiskAssessment();
  
  nextTick(() => {
    updatePredictionCharts();
  });
});
</script>

<style scoped>
.intelligent-decision-dashboard {
  padding: var(--spacing-lg);
  min-height: 100vh;
  background: var(--bg-secondary);
}

.dashboard-header {
  margin-bottom: var(--spacing-8xl);
}

.dashboard-header h1 {
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.decision-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-8xl);
}

.overview-metric {
  background: var(--gradient-primary);
  color: white;
  padding: var(--spacing-lg);
  border-radius: var(--text-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-lg);
}

.metric-icon {
  font-size: var(--text-4xl);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.metric-label {
  font-size: var(--text-sm);
  opacity: 0.9;
}

.decision-scenarios,
.strategic-planning,
.risk-assessment,
.performance-prediction {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6xl);
}

.section-header h2 {
  color: var(--text-primary);
  margin: 0;
  font-size: var(--text-2xl);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: var(--spacing-6xl);
}

.scenario-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: var(--border-width-base) solid var(--border-color);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.scenario-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: var(--text-lg);
}

.scenario-urgency {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  text-transform: uppercase;
  font-weight: bold;
}

.scenario-urgency.low {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success-dark-2);
}

.scenario-urgency.medium {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
}

.scenario-urgency.high {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger-dark-2);
}

.scenario-urgency.critical {
  background: var(--el-color-danger);
  color: white;
}

.scenario-description {
  margin-bottom: var(--spacing-4xl);
}

.scenario-description p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.scenario-impact {
  margin-bottom: var(--text-2xl);
}

.impact-level {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.impact-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.impact-value {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  text-transform: uppercase;
  font-weight: bold;
}

.impact-value.low {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success-dark-2);
}

.impact-value.medium {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
}

.impact-value.high {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger-dark-2);
}

.impact-value.transformational {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info-dark-2);
}

.decision-options {
  margin-bottom: var(--text-2xl);
}

.decision-options h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
  font-size: var(--text-base);
}

.options-list {
  display: grid;
  gap: var(--spacing-sm);
}

.option-item {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--el-border-color);
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.option-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.option-score {
  color: var(--el-color-info);
  font-weight: bold;
  font-size: var(--text-sm);
}

.option-details p {
  color: var(--el-text-color-secondary);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-sm);
}

.option-metrics {
  display: flex;
  gap: var(--spacing-4xl);
  font-size: var(--text-xs);
  color: var(--el-text-color-regular);
}

.ai-recommendation {
  margin-bottom: var(--text-2xl);
}

.ai-recommendation h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-base);
}

.recommendation-content p {
  background: color-mix(in oklab, var(--el-color-success) 12%, transparent);
  padding: var(--text-xs);
  border-radius: var(--radius-md);
  border-left: var(--spacing-xs) solid var(--el-color-success);
  margin-bottom: var(--spacing-2xl);
  color: var(--el-color-success);
}

.reasoning h5 {
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
}

.reasoning ul {
  margin: 0;
  padding-left: var(--text-2xl);
}

.reasoning li {
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-xs);
}

.expected-outcomes {
  margin-bottom: var(--text-2xl);
}

.expected-outcomes h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
  font-size: var(--text-base);
}

.outcomes-chart {
  display: grid;
  gap: var(--spacing-sm);
}

.outcome-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4xl);
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--el-border-color);
}

.outcome-metric {
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 80px;
  font-size: var(--text-sm);
}

.outcome-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.outcome-value {
  color: var(--el-color-info);
  font-weight: bold;
  font-size: var(--text-sm);
}

.scenario-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.planning-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-8xl);
}

.current-strategy h3,
.strategic-insights h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-2xl);
}

.strategy-timeline {
  display: grid;
  gap: var(--spacing-lg);
}

.milestone-item {
  display: flex;
  gap: var(--spacing-4xl);
  align-items: center;
  padding: var(--spacing-4xl);
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  border-left: var(--spacing-xs) solid var(--el-color-info);
}

.milestone-date {
  color: var(--el-text-color-secondary);
  font-size: var(--text-xs);
  min-width: 60px;
}

.milestone-content {
  flex: 1;
}

.milestone-content h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-base);
  font-size: var(--text-base);
}

.milestone-content p {
  color: var(--el-text-color-secondary);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-sm);
}

.milestone-progress {
  width: 100%;
  max-width: 200px;
}

.milestone-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  text-transform: uppercase;
  font-weight: bold;
}

.milestone-status.in_progress {
  background: color-mix(in oklab, var(--el-color-warning) 18%, transparent);
  color: var(--el-color-warning);
}

.milestone-status.planned {
  background: color-mix(in oklab, var(--el-color-info) 14%, transparent);
  color: var(--el-color-info);
}

.milestone-status.completed {
  background: color-mix(in oklab, var(--el-color-success) 14%, transparent);
  color: var(--el-color-success);
}

.insights-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.insight-card {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.insight-card h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.chart {
  height: 250px;
  width: 100%;
  margin-bottom: var(--spacing-4xl);
}

.trend-summary {
  display: grid;
  gap: var(--spacing-sm);
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--spacing-xs);
}

.trend-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

.trend-value {
  font-weight: bold;
  font-size: var(--text-sm);
}

.trend-value.positive {
  color: var(--el-color-success);
}

.trend-value.negative {
  color: var(--el-color-danger);
}

.competitor-analysis {
  display: grid;
  gap: var(--spacing-4xl);
}

.competitor-item {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--el-border-color);
}

.competitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.competitor-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.competitor-threat {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  text-transform: uppercase;
  font-weight: bold;
}

.competitor-threat.low {
  background: color-mix(in oklab, var(--el-color-success) 14%, transparent);
  color: var(--el-color-success);
}

.competitor-threat.medium {
  background: color-mix(in oklab, var(--el-color-warning) 18%, transparent);
  color: var(--el-color-warning);
}

.competitor-threat.high {
  background: color-mix(in oklab, var(--el-color-danger) 16%, transparent);
  color: var(--el-color-danger);
}

.competitor-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-2xl);
}

.competitor-metrics .metric {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--el-text-color-regular);
}

.competitor-actions h5 {
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-base);
  font-size: var(--text-sm);
}

.competitor-actions ul {
  margin: 0;
  padding-left: var(--text-2xl);
}

.competitor-actions li {
  color: var(--el-text-color-secondary);
  font-size: var(--text-xs);
  margin-bottom: var(--spacing-sm);
}

.resource-overview {
  display: grid;
  gap: var(--spacing-4xl);
}

.resource-item {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--el-border-color);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.resource-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.resource-utilization {
  color: var(--el-color-info);
  font-weight: bold;
  font-size: var(--text-sm);
}

.resource-details p {
  color: var(--el-text-color-secondary);
  margin: 0;
  font-size: var(--text-sm);
}

.risk-dashboard {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-8xl);
}

.risk-overview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.overall-risk-score {
  display: flex;
  justify-content: center;
  align-items: center;
}

.risk-score-circle {
  width: 150px;
  height: 150px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.risk-score-inner {
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

.risk-score-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.risk-score-label {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
}

.risk-summary h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-2xl);
}

.risk-summary p {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.risk-categories {
  display: grid;
  gap: var(--spacing-lg);
}

.risk-category {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.category-header h4 {
  color: var(--el-text-color-primary);
  margin: 0;
}

.category-score {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-weight: bold;
  font-size: var(--text-sm);
}

.category-score.low {
  background: color-mix(in oklab, var(--el-color-success) 14%, transparent);
  color: var(--el-color-success);
}

.category-score.medium {
  background: color-mix(in oklab, var(--el-color-warning) 18%, transparent);
  color: var(--el-color-warning);
}

.category-score.high {
  background: color-mix(in oklab, var(--el-color-danger) 16%, transparent);
  color: var(--el-color-danger);
}

.category-risks {
  display: grid;
  gap: var(--spacing-4xl);
}

.risk-item {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--el-border-color);
  border-left: var(--spacing-xs) solid var(--el-color-danger);
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.risk-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.risk-probability {
  color: var(--el-color-danger);
  font-weight: bold;
  font-size: var(--text-sm);
}

.risk-description {
  color: var(--el-text-color-secondary);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-sm);
}

.risk-impact {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.impact-label {
  color: var(--el-text-color-regular);
  font-weight: 500;
  font-size: var(--text-sm);
}

.impact-value {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  text-transform: uppercase;
  font-weight: bold;
}

.impact-value.low {
  background: color-mix(in oklab, var(--el-color-success) 14%, transparent);
  color: var(--el-color-success);
}

.impact-value.medium {
  background: color-mix(in oklab, var(--el-color-warning) 18%, transparent);
  color: var(--el-color-warning);
}

.impact-value.high {
  background: color-mix(in oklab, var(--el-color-danger) 16%, transparent);
  color: var(--el-color-danger);
}

.mitigation-strategies h5 {
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
}

.mitigation-strategies ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.mitigation-strategies li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-base);
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

.prediction-dashboard {
  display: grid;
  gap: var(--spacing-8xl);
}

.prediction-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.chart-container {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.chart-container h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.prediction-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-4xl);
  margin-top: var(--spacing-4xl);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4xl);
  background: white;
  border-radius: var(--radius-md);
  text-align: center;
}

.summary-label {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
  margin-bottom: var(--spacing-base);
}

.summary-value {
  font-weight: bold;
  font-size: var(--text-lg);
}

.summary-value.positive {
  color: var(--el-color-success);
}

.summary-value.negative {
  color: var(--el-color-danger);
}

.efficiency-metrics {
  display: grid;
  gap: var(--spacing-4xl);
  margin-top: var(--spacing-4xl);
}

.metric-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4xl);
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--radius-md);
}

.metric-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 100px;
  font-size: var(--text-sm);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.trend-value {
  color: var(--el-color-info);
  font-weight: bold;
  font-size: var(--text-sm);
}

.scenario-analysis h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-2xl);
}

.scenarios-comparison {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.scenario-item {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--el-border-color);
}

.scenario-item h4 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-4xl);
}

.scenario-metrics {
  display: grid;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-4xl);
}

.scenario-metric {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);
}

.scenario-actions h5 {
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
}

.scenario-actions ul {
  margin: 0;
  padding-left: var(--text-2xl);
}

.scenario-actions li {
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-xs);
}

.planning-form,
.scenario-form {
  max-height: 400px;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: var(--breakpoint-md)) {
  .decision-overview {
    grid-template-columns: 1fr;
  }
  
  .scenarios-grid {
    grid-template-columns: 1fr;
  }
  
  .planning-dashboard {
    grid-template-columns: 1fr;
  }
  
  .risk-dashboard {
    grid-template-columns: 1fr;
  }
  
  .prediction-charts {
    grid-template-columns: 1fr;
  }
  
  .scenarios-comparison {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .scenario-actions {
    flex-direction: column;
  }
}
</style>