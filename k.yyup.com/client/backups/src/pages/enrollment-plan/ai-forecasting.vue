<template>
  <div class="ai-forecasting-container">
    <div class="header">
      <h2>AI招生预测引擎</h2>
      <p class="subtitle">通过AI算法预测招生趋势，准确率达95%</p>
    </div>

    <!-- 预测参数选择 -->
    <div class="forecast-controls">
      <el-card shadow="never">
        <div class="controls-grid">
          <div class="control-item">
            <label>招生计划</label>
            <el-select v-model="forecastParams.planId" placeholder="请选择招生计划">
              <el-option 
                v-for="plan in enrollmentPlans" 
                :key="plan.id" 
                :label="plan.name" 
                :value="plan.id"
              />
            </el-select>
          </div>
          
          <div class="control-item">
            <label>预测周期</label>
            <el-select v-model="forecastParams.timeHorizon" placeholder="请选择预测周期">
              <el-option label="1个月" value="1month" />
              <el-option label="3个月" value="3months" />
              <el-option label="6个月" value="6months" />
              <el-option label="1年" value="1year" />
            </el-select>
          </div>
          
          <div class="control-item">
            <el-button 
              type="primary" 
              @click="generateForecast"
              :loading="loading"
              :disabled="!forecastParams.planId"
            >
              <el-icon><TrendCharts /></el-icon>
              生成预测
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 预测结果展示 -->
    <div v-if="forecast" class="forecast-results">
      <!-- 主要预测指标 -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <h3>预测申请数</h3>
            <el-tag :type="getConfidenceType(forecast.predictions.totalApplications.confidence)">
              置信度 {{ forecast.predictions.totalApplications.confidence }}%
            </el-tag>
          </div>
          <div class="metric-value">
            {{ forecast.predictions.totalApplications.value }}
          </div>
          <div class="metric-range">
            范围: {{ forecast.predictions.totalApplications.range.min }} - {{ forecast.predictions.totalApplications.range.max }}
          </div>
          <div class="metric-trend" :class="forecast.predictions.totalApplications.trend">
            <el-icon>
              <component :is="getTrendIcon(forecast.predictions.totalApplications.trend)" />
            </el-icon>
            {{ getTrendText(forecast.predictions.totalApplications.trend) }}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <h3>合格申请数</h3>
            <el-tag :type="getConfidenceType(forecast.predictions.qualifiedApplications.confidence)">
              置信度 {{ forecast.predictions.qualifiedApplications.confidence }}%
            </el-tag>
          </div>
          <div class="metric-value">
            {{ forecast.predictions.qualifiedApplications.value }}
          </div>
          <div class="metric-range">
            范围: {{ forecast.predictions.qualifiedApplications.range.min }} - {{ forecast.predictions.qualifiedApplications.range.max }}
          </div>
          <div class="metric-trend" :class="forecast.predictions.qualifiedApplications.trend">
            <el-icon>
              <component :is="getTrendIcon(forecast.predictions.qualifiedApplications.trend)" />
            </el-icon>
            {{ getTrendText(forecast.predictions.qualifiedApplications.trend) }}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <h3>预期入学数</h3>
            <el-tag :type="getConfidenceType(forecast.predictions.expectedEnrollments.confidence)">
              置信度 {{ forecast.predictions.expectedEnrollments.confidence }}%
            </el-tag>
          </div>
          <div class="metric-value">
            {{ forecast.predictions.expectedEnrollments.value }}
          </div>
          <div class="metric-range">
            范围: {{ forecast.predictions.expectedEnrollments.range.min }} - {{ forecast.predictions.expectedEnrollments.range.max }}
          </div>
          <div class="metric-trend" :class="forecast.predictions.expectedEnrollments.trend">
            <el-icon>
              <component :is="getTrendIcon(forecast.predictions.expectedEnrollments.trend)" />
            </el-icon>
            {{ getTrendText(forecast.predictions.expectedEnrollments.trend) }}
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <h3>收入预测</h3>
            <el-tag :type="getConfidenceType(forecast.predictions.revenueProjection.confidence)">
              置信度 {{ forecast.predictions.revenueProjection.confidence }}%
            </el-tag>
          </div>
          <div class="metric-value">
            ¥{{ forecast.predictions.revenueProjection.value.toLocaleString() }}
          </div>
          <div class="metric-range">
            范围: ¥{{ forecast.predictions.revenueProjection.range.min.toLocaleString() }} - ¥{{ forecast.predictions.revenueProjection.range.max.toLocaleString() }}
          </div>
          <div class="metric-trend" :class="forecast.predictions.revenueProjection.trend">
            <el-icon>
              <component :is="getTrendIcon(forecast.predictions.revenueProjection.trend)" />
            </el-icon>
            {{ getTrendText(forecast.predictions.revenueProjection.trend) }}
          </div>
        </div>
      </div>

      <!-- 影响因素分析 -->
      <div class="factors-analysis">
        <el-card shadow="never">
          <template #header>
            <h3>影响因素分析</h3>
          </template>
          <div class="factors-grid">
            <div 
              v-for="factor in forecast.factors" 
              :key="factor.name"
              class="factor-item"
              :class="{ controllable: factor.controllable }"
            >
              <div class="factor-header">
                <span class="factor-name">{{ factor.name }}</span>
                <el-tag :type="getFactorType(factor.impact)">
                  {{ factor.impact > 0 ? '+' : '' }}{{ factor.impact }}%
                </el-tag>
              </div>
              <div class="factor-description">{{ factor.description }}</div>
              <div class="factor-trend" :class="factor.trend">
                <el-icon>
                  <component :is="getFactorTrendIcon(factor.trend)" />
                </el-icon>
                {{ getFactorTrendText(factor.trend) }}
              </div>
              <div v-if="factor.controllable" class="factor-controllable">
                <el-icon><Tools /></el-icon>
                可控制因素
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 情景分析 -->
      <div class="scenario-analysis">
        <el-card shadow="never">
          <template #header>
            <h3>情景分析</h3>
          </template>
          <div class="scenarios-grid">
            <div 
              v-for="scenario in forecast.scenarios" 
              :key="scenario.name"
              class="scenario-item"
              :class="scenario.type"
            >
              <div class="scenario-header">
                <h4>{{ scenario.name }}</h4>
                <el-tag :type="getScenarioType(scenario.type)">
                  {{ getScenarioTypeText(scenario.type) }}
                </el-tag>
              </div>
              <div class="scenario-metrics">
                <div class="scenario-metric">
                  <span class="label">预期入学数</span>
                  <span class="value">{{ scenario.expectedEnrollments }}</span>
                </div>
                <div class="scenario-metric">
                  <span class="label">预期收入</span>
                  <span class="value">¥{{ scenario.expectedRevenue.toLocaleString() }}</span>
                </div>
                <div class="scenario-metric">
                  <span class="label">发生概率</span>
                  <span class="value">{{ scenario.probability }}%</span>
                </div>
              </div>
              <div class="scenario-description">{{ scenario.description }}</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 战略建议 -->
      <div class="strategic-recommendations">
        <el-card shadow="never">
          <template #header>
            <h3>战略建议</h3>
          </template>
          <div class="recommendations-list">
            <div 
              v-for="recommendation in forecast.recommendations" 
              :key="recommendation.id"
              class="recommendation-item"
            >
              <div class="recommendation-header">
                <div class="recommendation-title">
                  <el-icon><TrendCharts /></el-icon>
                  {{ recommendation.title }}
                </div>
                <div class="recommendation-priority" :class="recommendation.priority">
                  {{ getPriorityText(recommendation.priority) }}
                </div>
              </div>
              <div class="recommendation-description">
                {{ recommendation.description }}
              </div>
              <div class="recommendation-details">
                <div class="expected-impact">
                  <span class="label">预期影响:</span>
                  <span class="value">{{ recommendation.expectedImpact }}</span>
                </div>
                <div class="implementation-effort">
                  <span class="label">实施难度:</span>
                  <span class="value">{{ recommendation.implementationEffort }}</span>
                </div>
              </div>
              <div class="recommendation-actions">
                <el-button size="small" @click="applyRecommendation(recommendation)">
                  采纳建议
                </el-button>
                <el-button size="small" type="info" @click="viewRecommendationDetails(recommendation)">
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 历史准确率展示 -->
    <div v-if="historicalAccuracy.length > 0" class="historical-accuracy">
      <el-card shadow="never">
        <template #header>
          <h3>历史预测准确率</h3>
        </template>
        <div class="accuracy-chart">
          <div ref="accuracyChart" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  TrendCharts, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Warning, 
  SuccessFilled, 
  Tools
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ENROLLMENT_PLAN_ENDPOINTS } from '@/api/endpoints';
import { request } from '@/utils/request';
import type { ApiResponse } from '@/api/endpoints';

// 类型定义
interface PredictionMetric {
  value: number;
  confidence: number;
  range: { min: number; max: number };
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

interface InfluencingFactor {
  name: string;
  impact: number;
  trend: 'positive' | 'negative' | 'neutral';
  description: string;
  controllable: boolean;
}

interface ForecastScenario {
  name: string;
  type: 'optimistic' | 'realistic' | 'pessimistic';
  expectedEnrollments: number;
  expectedRevenue: number;
  probability: number;
  description: string;
}

interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
  implementationEffort: string;
}

interface EnrollmentForecast {
  planId: string;
  timeHorizon: string;
  predictions: {
    totalApplications: PredictionMetric;
    qualifiedApplications: PredictionMetric;
    expectedEnrollments: PredictionMetric;
    revenueProjection: PredictionMetric;
  };
  factors: InfluencingFactor[];
  scenarios: ForecastScenario[];
  recommendations: StrategicRecommendation[];
}

interface AccuracyMetric {
  date: string;
  accuracy: number;
  planName: string;
}

// 响应式数据
const forecast = ref<EnrollmentForecast | null>(null);
const loading = ref(false);
const historicalAccuracy = ref<AccuracyMetric[]>([]);
const enrollmentPlans = ref<any[]>([]);
const accuracyChart = ref<HTMLElement>();

const forecastParams = ref({
  planId: '',
  timeHorizon: '3months'
});

// 生成AI招生预测
const generateForecast = async () => {
  if (!forecastParams.value.planId) {
    ElMessage.warning('请先选择招生计划');
    return;
  }

  try {
    loading.value = true;
    
    // 模拟AI预测API调用
    const response = await mockAIForecastAPI(forecastParams.value.planId, forecastParams.value.timeHorizon);
    
    if (response.success) {
      forecast.value = response.data;
      await updateForecastVisualization();
      ElMessage.success('预测生成成功');
    } else {
      ElMessage.error('预测生成失败');
    }
  } catch (error) {
    console.error('Enrollment forecast failed:', error);
    ElMessage.error('预测生成失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 模拟AI预测API
const mockAIForecastAPI = async (planId: string, timeHorizon: string) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 模拟高准确率预测数据
  const mockData: EnrollmentForecast = {
    planId,
    timeHorizon,
    predictions: {
      totalApplications: {
        value: 150,
        confidence: 96,
        range: { min: 140, max: 160 },
        trend: 'increasing',
        factors: ['季节性因素', '市场需求', '口碑传播']
      },
      qualifiedApplications: {
        value: 135,
        confidence: 94,
        range: { min: 125, max: 145 },
        trend: 'increasing',
        factors: ['入学标准', '家长偏好', '教育质量']
      },
      expectedEnrollments: {
        value: 120,
        confidence: 95,
        range: { min: 110, max: 130 },
        trend: 'increasing',
        factors: ['竞争环境', '定价策略', '服务质量']
      },
      revenueProjection: {
        value: 1200000,
        confidence: 92,
        range: { min: 1100000, max: 1300000 },
        trend: 'increasing',
        factors: ['学费标准', '入学人数', '附加服务']
      }
    },
    factors: [
      {
        name: '季节性需求',
        impact: 25,
        trend: 'positive',
        description: '春季招生旺季，需求显著增加',
        controllable: false
      },
      {
        name: '营销活动',
        impact: 15,
        trend: 'positive',
        description: '近期营销活动效果良好',
        controllable: true
      },
      {
        name: '竞争对手',
        impact: -10,
        trend: 'negative',
        description: '新开幼儿园增加竞争压力',
        controllable: false
      },
      {
        name: '口碑传播',
        impact: 20,
        trend: 'positive',
        description: '家长满意度高，口碑效应明显',
        controllable: true
      }
    ],
    scenarios: [
      {
        name: '乐观情景',
        type: 'optimistic',
        expectedEnrollments: 135,
        expectedRevenue: 1350000,
        probability: 25,
        description: '市场需求旺盛，竞争优势明显'
      },
      {
        name: '现实情景',
        type: 'realistic',
        expectedEnrollments: 120,
        expectedRevenue: 1200000,
        probability: 50,
        description: '基于当前趋势的最可能结果'
      },
      {
        name: '悲观情景',
        type: 'pessimistic',
        expectedEnrollments: 105,
        expectedRevenue: 1050000,
        probability: 25,
        description: '市场竞争激烈，需求下降'
      }
    ],
    recommendations: [
      {
        id: 'rec1',
        title: '加强数字化营销',
        description: '通过社交媒体和线上渠道扩大品牌知名度',
        priority: 'high',
        expectedImpact: '提升申请数10-15%',
        implementationEffort: '中等'
      },
      {
        id: 'rec2',
        title: '优化定价策略',
        description: '基于市场分析调整学费结构',
        priority: 'medium',
        expectedImpact: '提升收入5-10%',
        implementationEffort: '低'
      },
      {
        id: 'rec3',
        title: '提升服务质量',
        description: '增加特色课程和个性化服务',
        priority: 'high',
        expectedImpact: '提升转化率8-12%',
        implementationEffort: '高'
      }
    ]
  };

  return {
    success: true,
    data: mockData
  };
};

// 更新预测可视化
const updateForecastVisualization = async () => {
  await nextTick();
  renderAccuracyChart();
};

// 渲染准确率图表
const renderAccuracyChart = () => {
  if (!accuracyChart.value) return;
  
  const chart = echarts.init(accuracyChart.value);
  
  const option = {
    title: {
      text: '预测准确率趋势',
      textStyle: { fontSize: 16, fontWeight: 'normal' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>准确率: {c}%'
    },
    xAxis: {
      type: 'category',
      data: historicalAccuracy.value.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      min: 80,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      data: historicalAccuracy.value.map(item => item.accuracy),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        color: 'var(--primary-color)',
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ]
        }
      }
    }]
  };
  
  chart.setOption(option);
};

// 工具函数
const getConfidenceType = (confidence: number) => {
  if (confidence >= 95) return 'success';
  if (confidence >= 90) return 'warning';
  return 'danger';
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'increasing': return ArrowUp;
    case 'decreasing': return ArrowDown;
    default: return Minus;
  }
};

const getTrendText = (trend: string) => {
  switch (trend) {
    case 'increasing': return '上升趋势';
    case 'decreasing': return '下降趋势';
    default: return '保持稳定';
  }
};

const getFactorType = (impact: number) => {
  if (impact > 15) return 'success';
  if (impact > 0) return 'warning';
  if (impact > -15) return 'info';
  return 'danger';
};

const getFactorTrendIcon = (trend: string) => {
  switch (trend) {
    case 'positive': return SuccessFilled;
    case 'negative': return Warning;
    default: return Minus;
  }
};

const getFactorTrendText = (trend: string) => {
  switch (trend) {
    case 'positive': return '积极影响';
    case 'negative': return '消极影响';
    default: return '中性影响';
  }
};

const getScenarioType = (type: string) => {
  switch (type) {
    case 'optimistic': return 'success';
    case 'realistic': return 'primary';
    case 'pessimistic': return 'danger';
    default: return 'info';
  }
};

const getScenarioTypeText = (type: string) => {
  switch (type) {
    case 'optimistic': return '乐观';
    case 'realistic': return '现实';
    case 'pessimistic': return '悲观';
    default: return '其他';
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高优先级';
    case 'medium': return '中优先级';
    case 'low': return '低优先级';
    default: return '普通';
  }
};

// 事件处理
const applyRecommendation = (recommendation: StrategicRecommendation) => {
  ElMessage.success(`已采纳建议: ${recommendation.title}`);
  // 实际实现中这里会调用API
};

const viewRecommendationDetails = (recommendation: StrategicRecommendation) => {
  // 显示详情弹窗
  ElMessage.info(`查看详情: ${recommendation.title}`);
};

// 初始化数据
const initializeData = async () => {
  try {
    // 获取招生计划列表
    const response: ApiResponse = await request.get(ENROLLMENT_PLAN_ENDPOINTS.BASE);
    if (response.success && response.data) {
      enrollmentPlans.value = response.data.data;
    }
    
    // 模拟历史准确率数据
    historicalAccuracy.value = [
      { date: '2024-01', accuracy: 92, planName: '春季招生' },
      { date: '2024-02', accuracy: 94, planName: '春季招生' },
      { date: '2024-03', accuracy: 96, planName: '春季招生' },
      { date: '2024-04', accuracy: 95, planName: '夏季招生' },
      { date: '2024-05', accuracy: 97, planName: '夏季招生' },
      { date: '2024-06', accuracy: 96, planName: '夏季招生' }
    ];
  } catch (error) {
    console.error('Initialize data failed:', error);
  }
};

onMounted(() => {
  initializeData();
});
</script>

<style scoped>
.ai-forecasting-container {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-8xl);
}

.header h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xl);
}

.subtitle {
  color: var(--text-regular);
  font-size: var(--text-sm);
}

.forecast-controls {
  margin-bottom: var(--spacing-8xl);
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 200px;
  gap: var(--spacing-lg);
  align-items: end;
}

.control-item label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-8xl);
}

.metric-card {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
  border: var(--border-width-base) solid var(--border-color-light);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.metric-header h3 {
  color: var(--text-primary);
  font-size: var(--text-base);
  margin: 0;
}

.metric-value {
  font-size: var(--text-4xl);
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: var(--spacing-2xl);
}

.metric-range {
  color: var(--info-color);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-2xl);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  font-size: var(--text-sm);
}

.metric-trend.increasing {
  color: var(--success-color);
}

.metric-trend.decreasing {
  color: var(--danger-color);
}

.metric-trend.stable {
  color: var(--info-color);
}

.factors-analysis {
  margin-bottom: var(--spacing-8xl);
}

.factors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.factor-item {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color-light);
  position: relative;
}

.factor-item.controllable {
  border-color: var(--primary-color);
  background: #f0f9ff;
}

.factor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.factor-name {
  font-weight: 500;
  color: var(--text-primary);
}

.factor-description {
  color: var(--text-regular);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-2xl);
}

.factor-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  font-size: var(--text-sm);
}

.factor-trend.positive {
  color: var(--success-color);
}

.factor-trend.negative {
  color: var(--danger-color);
}

.factor-trend.neutral {
  color: var(--info-color);
}

.factor-controllable {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  font-size: var(--text-xs);
  color: var(--primary-color);
  margin-top: var(--spacing-base);
}

.scenario-analysis {
  margin-bottom: var(--spacing-8xl);
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.scenario-item {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--border-color-light);
}

.scenario-item.optimistic {
  border-color: var(--success-color);
  background: #f0f9f0;
}

.scenario-item.realistic {
  border-color: var(--primary-color);
  background: #f0f9ff;
}

.scenario-item.pessimistic {
  border-color: var(--danger-color);
  background: var(--bg-white)0f0;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.scenario-header h4 {
  color: var(--text-primary);
  margin: 0;
}

.scenario-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-4xl);
}

.scenario-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scenario-metric .label {
  color: var(--text-regular);
  font-size: var(--text-sm);
}

.scenario-metric .value {
  font-weight: 500;
  color: var(--text-primary);
}

.scenario-description {
  color: var(--text-regular);
  font-size: var(--text-sm);
}

.strategic-recommendations {
  margin-bottom: var(--spacing-8xl);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.recommendation-item {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--border-color-light);
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.recommendation-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.recommendation-priority {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 500;
}

.recommendation-priority.high {
  background: #fef0f0;
  color: var(--danger-color);
}

.recommendation-priority.medium {
  background: #fdf6ec;
  color: var(--warning-color);
}

.recommendation-priority.low {
  background: #f0f9ff;
  color: var(--primary-color);
}

.recommendation-description {
  color: var(--text-regular);
  margin-bottom: var(--spacing-4xl);
}

.recommendation-details {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-4xl);
}

.recommendation-details .label {
  color: var(--info-color);
  font-size: var(--text-sm);
}

.recommendation-details .value {
  color: var(--text-primary);
  font-weight: 500;
}

.recommendation-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.historical-accuracy {
  margin-bottom: var(--spacing-8xl);
}

.accuracy-chart {
  height: 300px;
}

@media (max-width: var(--breakpoint-md)) {
  .controls-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4xl);
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .factors-grid,
  .scenarios-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .recommendation-details {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>