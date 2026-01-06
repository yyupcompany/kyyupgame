<template>
  <div class="customer-lifecycle-management">
    <!-- 客户生命周期概览 -->
    <div class="lifecycle-overview">
      <h3>客户生命周期智能管理</h3>
      <div class="lifecycle-metrics">
        <div class="metric-card" v-for="stage in lifecycleStages" :key="stage.name">
          <div class="stage-header">
            <h4>{{ stage.name }}</h4>
            <div class="stage-count">{{ stage.customerCount }}</div>
          </div>
          <div class="stage-metrics">
            <div class="metric">
              <span class="label">平均停留时间</span>
              <span class="value">{{ stage.avgDuration }}天</span>
            </div>
            <div class="metric">
              <span class="label">转化率</span>
              <span class="value">{{ stage.conversionRate }}%</span>
            </div>
            <div class="metric">
              <span class="label">流失风险</span>
              <div class="risk-indicator" :class="stage.churnRisk">
                {{ stage.churnRisk }}
              </div>
            </div>
          </div>
          <div class="stage-actions">
            <el-button size="small" @click="optimizeStage(stage)">优化阶段</el-button>
            <el-button size="small" @click="viewStageDetails(stage)">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能客户洞察 -->
    <div class="customer-insights">
      <h3>AI客户洞察</h3>
      <div class="insights-grid">
        <div class="insight-card">
          <h4>客户价值分析</h4>
          <div ref="customerValueChart" class="chart"></div>
          <div class="value-insights">
            <div v-for="insight in valueInsights" :key="insight.id" class="insight-item">
              <div class="insight-title">{{ insight.title }}</div>
              <div class="insight-description">{{ insight.description }}</div>
              <div class="insight-action">
                <el-button size="small" type="primary" @click="applyInsight(insight)">
                  应用洞察
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="insight-card">
          <h4>流失预警</h4>
          <div class="churn-alerts">
            <div v-for="alert in churnAlerts" :key="alert.customerId" class="churn-alert">
              <div class="customer-info">
                <div class="customer-name">{{ alert.customerName }}</div>
                <div class="churn-probability">流失概率: {{ alert.churnProbability }}%</div>
              </div>
              <div class="churn-factors">
                <h5>主要因素:</h5>
                <ul>
                  <li v-for="factor in alert.factors" :key="factor">{{ factor }}</li>
                </ul>
              </div>
              <div class="retention-strategies">
                <h5>建议策略:</h5>
                <div class="strategy-list">
                  <el-button 
                    v-for="strategy in alert.retentionStrategies" 
                    :key="strategy.id"
                    size="small" 
                    @click="executeRetentionStrategy(alert.customerId, strategy)"
                  >
                    {{ strategy.name }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="insight-card">
          <h4>增值机会识别</h4>
          <div class="upsell-opportunities">
            <div v-for="opportunity in upsellOpportunities" :key="opportunity.id" class="opportunity-item">
              <div class="opportunity-header">
                <h5>{{ opportunity.title }}</h5>
                <div class="opportunity-score">机会评分: {{ opportunity.score }}/100</div>
              </div>
              <div class="opportunity-details">
                <div class="potential-revenue">潜在收入: ¥{{ opportunity.potentialRevenue }}</div>
                <div class="success-probability">成功概率: {{ opportunity.successProbability }}%</div>
              </div>
              <div class="opportunity-strategy">
                <p>{{ opportunity.strategy }}</p>
                <el-button size="small" type="success" @click="pursueOpportunity(opportunity)">
                  追求机会
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能客户沟通 -->
    <div class="intelligent-communication">
      <h3>智能客户沟通</h3>
      <div class="communication-dashboard">
        <div class="communication-queue">
          <h4>智能沟通队列</h4>
          <div class="queue-list">
            <div v-for="comm in communicationQueue" :key="comm.id" class="communication-item">
              <div class="customer-info">
                <div class="customer-name">{{ comm.customerName }}</div>
                <div class="communication-type">{{ comm.type }}</div>
              </div>
              <div class="communication-content">
                <div class="ai-generated-message">
                  <h5>AI生成消息:</h5>
                  <p>{{ comm.aiMessage }}</p>
                </div>
                <div class="personalization-notes">
                  <h5>个性化要点:</h5>
                  <ul>
                    <li v-for="note in comm.personalizationNotes" :key="note">{{ note }}</li>
                  </ul>
                </div>
              </div>
              <div class="communication-actions">
                <el-button size="small" type="primary" @click="sendCommunication(comm)">
                  发送
                </el-button>
                <el-button size="small" @click="editCommunication(comm)">
                  编辑
                </el-button>
                <el-button size="small" @click="scheduleCommunication(comm)">
                  定时发送
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 客户生命周期分析图表 -->
    <div class="lifecycle-analytics">
      <h3>生命周期分析</h3>
      <div class="analytics-charts">
        <div class="chart-container">
          <h4>客户价值分布</h4>
          <div ref="valueDistributionChart" class="chart"></div>
        </div>
        <div class="chart-container">
          <h4>流失风险趋势</h4>
          <div ref="churnTrendChart" class="chart"></div>
        </div>
        <div class="chart-container">
          <h4>生命周期阶段流转</h4>
          <div ref="stageFlowChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 客户360度视图对话框 -->
    <el-dialog v-model="showCustomer360Dialog" title="客户360度视图" width="80%">
      <div v-if="selectedCustomer360" class="customer-360-view">
        <div class="customer-summary">
          <div class="summary-header">
            <h3>{{ selectedCustomer360.name }}</h3>
            <div class="customer-tags">
              <el-tag v-for="tag in selectedCustomer360.tags" :key="tag" type="info">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="summary-metrics">
            <div class="metric">
              <div class="metric-label">客户价值</div>
              <div class="metric-value">¥{{ selectedCustomer360.totalValue }}</div>
            </div>
            <div class="metric">
              <div class="metric-label">生命周期阶段</div>
              <div class="metric-value">{{ selectedCustomer360.stage }}</div>
            </div>
            <div class="metric">
              <div class="metric-label">流失风险</div>
              <div class="metric-value" :class="selectedCustomer360.churnRisk">{{ selectedCustomer360.churnRisk }}</div>
            </div>
          </div>
        </div>
        
        <div class="customer-timeline">
          <h4>客户时间线</h4>
          <div class="timeline-items">
            <div v-for="event in selectedCustomer360.timeline" :key="event.id" class="timeline-item">
              <div class="timeline-date">{{ event.date }}</div>
              <div class="timeline-content">
                <h5>{{ event.title }}</h5>
                <p>{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="customer-recommendations">
          <h4>AI推荐行动</h4>
          <div class="recommendations-list">
            <div v-for="rec in selectedCustomer360.recommendations" :key="rec.id" class="recommendation-item">
              <div class="recommendation-header">
                <h5>{{ rec.title }}</h5>
                <div class="recommendation-priority" :class="rec.priority">{{ rec.priority }}</div>
              </div>
              <p>{{ rec.description }}</p>
              <div class="recommendation-actions">
                <el-button size="small" type="primary" @click="executeRecommendation(rec)">
                  执行
                </el-button>
                <el-button size="small" @click="scheduleRecommendation(rec)">
                  定时执行
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';
import { get, post } from '@/utils/request';

// 类型定义
interface LifecycleStage {
  name: string;
  customerCount: number;
  avgDuration: number;
  conversionRate: number;
  churnRisk: 'low' | 'medium' | 'high';
}

interface CustomerInsight {
  id: string;
  title: string;
  description: string;
  actionType: string;
  priority: 'low' | 'medium' | 'high';
}

interface ChurnAlert {
  customerId: string;
  customerName: string;
  churnProbability: number;
  factors: string[];
  retentionStrategies: RetentionStrategy[];
}

interface RetentionStrategy {
  id: string;
  name: string;
  description: string;
  expectedEffectiveness: number;
  cost: number;
}

interface UpsellOpportunity {
  id: string;
  title: string;
  score: number;
  potentialRevenue: number;
  successProbability: number;
  strategy: string;
}

interface CommunicationItem {
  id: string;
  customerName: string;
  type: string;
  aiMessage: string;
  personalizationNotes: string[];
}

interface Customer360 {
  id: string;
  name: string;
  tags: string[];
  totalValue: number;
  stage: string;
  churnRisk: string;
  timeline: TimelineEvent[];
  recommendations: Recommendation[];
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// 响应式数据
const lifecycleStages = ref<LifecycleStage[]>([]);
const valueInsights = ref<CustomerInsight[]>([]);
const churnAlerts = ref<ChurnAlert[]>([]);
const upsellOpportunities = ref<UpsellOpportunity[]>([]);
const communicationQueue = ref<CommunicationItem[]>([]);
const selectedCustomer360 = ref<Customer360 | null>(null);
const showCustomer360Dialog = ref(false);

// 图表引用
const customerValueChart = ref();
const valueDistributionChart = ref();
const churnTrendChart = ref();
const stageFlowChart = ref();

// 客户生命周期分析
const analyzeCustomerLifecycle = async () => {
  try {
    const response = await post('/api/ai/customer-lifecycle-analysis', {
      includeValueAnalysis: true,
      includeChurnPrediction: true,
      includeUpsellOpportunities: true,
      analysisDepth: 'comprehensive',
      timeHorizon: '12months'
    });
    
    if (response.success) {
      const analysis = response.data;
      
      lifecycleStages.value = analysis.stages || [
        {
          name: '潜在客户',
          customerCount: 245,
          avgDuration: 12,
          conversionRate: 35.2,
          churnRisk: 'low'
        },
        {
          name: '新客户',
          customerCount: 156,
          avgDuration: 45,
          conversionRate: 68.5,
          churnRisk: 'medium'
        },
        {
          name: '活跃客户',
          customerCount: 89,
          avgDuration: 180,
          conversionRate: 85.7,
          churnRisk: 'low'
        },
        {
          name: '忠诚客户',
          customerCount: 34,
          avgDuration: 365,
          conversionRate: 92.3,
          churnRisk: 'low'
        }
      ];
      
      valueInsights.value = analysis.valueInsights || [
        {
          id: '1',
          title: '高价值客户增长机会',
          description: '通过优化服务体验，可将中等价值客户转化为高价值客户',
          actionType: 'upsell',
          priority: 'high'
        },
        {
          id: '2',
          title: '客户满意度提升',
          description: '改善客户服务响应时间，可显著提升客户满意度',
          actionType: 'service',
          priority: 'medium'
        }
      ];
      
      churnAlerts.value = analysis.churnAlerts || [
        {
          customerId: '1',
          customerName: '张女士',
          churnProbability: 78,
          factors: ['服务响应慢', '价格敏感', '竞争对手活动'],
          retentionStrategies: [
            {
              id: '1',
              name: '专属服务',
              description: '安排专属客服提供一对一服务',
              expectedEffectiveness: 85,
              cost: 500
            },
            {
              id: '2',
              name: '优惠活动',
              description: '提供特别优惠吸引客户续费',
              expectedEffectiveness: 65,
              cost: 300
            }
          ]
        }
      ];
      
      upsellOpportunities.value = analysis.upsellOpportunities || [
        {
          id: '1',
          title: '升级至高端服务',
          score: 85,
          potentialRevenue: 8000,
          successProbability: 72,
          strategy: '基于客户历史行为和偏好，推荐高端服务套餐'
        },
        {
          id: '2',
          title: '增值服务推广',
          score: 65,
          potentialRevenue: 3000,
          successProbability: 58,
          strategy: '向现有客户推广补充服务，提升整体价值'
        }
      ];
      
      // 更新图表
      updateLifecycleCharts(analysis);
    }
  } catch (error) {
    console.error('Lifecycle analysis failed:', error);
    ElMessage.error('生命周期分析失败');
  }
};

// 智能客户沟通生成
const generateIntelligentCommunication = async () => {
  try {
    const response = await post('/api/ai/intelligent-communication-queue', {
      prioritizeByCriticalness: true,
      includeEmotionalContext: true,
      personalizationLevel: 'high',
      maxQueueSize: 50
    });
    
    if (response.success) {
      communicationQueue.value = response.data.queue || [
        {
          id: '1',
          customerName: '李先生',
          type: '挽留沟通',
          aiMessage: '李先生，您好！我们注意到您最近对我们的服务关注度有所下降。作为我们的重要客户，我们希望了解您的具体需求，并为您提供更好的服务体验。',
          personalizationNotes: ['强调客户重要性', '询问具体需求', '提供个性化解决方案']
        },
        {
          id: '2',
          customerName: '王女士',
          type: '增值推荐',
          aiMessage: '王女士，基于您的使用习惯和偏好，我们为您推荐一项增值服务，这将进一步提升您的体验效果。',
          personalizationNotes: ['基于行为分析', '突出价值点', '强调个性化推荐']
        }
      ];
    }
  } catch (error) {
    console.error('Communication generation failed:', error);
    ElMessage.error('智能沟通生成失败');
  }
};

// 执行客户挽留策略
const executeRetentionStrategy = async (customerId: string, strategy: RetentionStrategy) => {
  try {
    const response = await post('/api/customer/execute-retention-strategy', {
      customerId,
      strategyId: strategy.id,
      autoImplement: true,
      trackEffectiveness: true
    });
    
    if (response.ok) {
      ElMessage.success('挽留策略已执行');
      await analyzeCustomerLifecycle();
    }
  } catch (error) {
    ElMessage.error('策略执行失败');
  }
};

// 追求增值机会
const pursueOpportunity = async (opportunity: UpsellOpportunity) => {
  try {
    const response = await post('/api/customer/pursue-upsell-opportunity', {
      opportunityId: opportunity.id,
      autoImplement: true,
      trackConversion: true
    });
    
    if (response.success) {
      ElMessage.success('增值机会已启动');
      await analyzeCustomerLifecycle();
    }
  } catch (error) {
    ElMessage.error('机会追求失败');
  }
};

// 应用客户洞察
const applyInsight = async (insight: CustomerInsight) => {
  try {
    const response = await post('/api/customer/apply-insight', {
      insightId: insight.id,
      autoImplement: true
    });
    
    if (response.success) {
      ElMessage.success('洞察已应用');
      await analyzeCustomerLifecycle();
    }
  } catch (error) {
    ElMessage.error('洞察应用失败');
  }
};

// 优化生命周期阶段
const optimizeStage = async (stage: LifecycleStage) => {
  try {
    const response = await post('/api/customer/optimize-lifecycle-stage', {
      stageName: stage.name,
      optimizationGoals: ['conversion_rate', 'retention', 'value_increase']
    });
    
    if (response.success) {
      ElMessage.success(`${stage.name}阶段优化已启动`);
      await analyzeCustomerLifecycle();
    }
  } catch (error) {
    ElMessage.error('阶段优化失败');
  }
};

// 查看阶段详情
const viewStageDetails = async (stage: LifecycleStage) => {
  try {
    const response = await get(`/api/customer/stage-details/${stage.name}`);
    if (response.success) {
      selectedCustomer360.value = response.data;
      showCustomer360Dialog.value = true;
    }
  } catch (error) {
    ElMessage.error('获取阶段详情失败');
  }
};

// 发送客户沟通
const sendCommunication = async (comm: CommunicationItem) => {
  try {
    const response = await post('/api/customer/send-communication', {
      communicationId: comm.id,
      immediate: true
    });
    
    if (response.success) {
      ElMessage.success('沟通已发送');
      await generateIntelligentCommunication();
    }
  } catch (error) {
    ElMessage.error('沟通发送失败');
  }
};

// 编辑客户沟通
const editCommunication = (comm: CommunicationItem) => {
  // 打开编辑对话框
  ElMessageBox.prompt('请编辑沟通内容:', '编辑沟通', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: comm.aiMessage
  }).then(({ value }) => {
    comm.aiMessage = value;
    ElMessage.success('沟通内容已更新');
  }).catch(() => {
    // 取消编辑
  });
};

// 定时发送沟通
const scheduleCommunication = async (comm: CommunicationItem) => {
  try {
    const response = await post('/api/customer/schedule-communication', {
      communicationId: comm.id,
      scheduleTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后
    });
    
    if (response.success) {
      ElMessage.success('沟通已定时发送');
    }
  } catch (error) {
    ElMessage.error('定时发送失败');
  }
};

// 执行推荐行动
const executeRecommendation = async (recommendation: Recommendation) => {
  try {
    const response = await post('/api/customer/execute-recommendation', {
      recommendationId: recommendation.id,
      autoImplement: true
    });
    
    if (response.success) {
      ElMessage.success('推荐行动已执行');
    }
  } catch (error) {
    ElMessage.error('推荐行动执行失败');
  }
};

// 定时执行推荐
const scheduleRecommendation = async (recommendation: Recommendation) => {
  try {
    const response = await post('/api/customer/schedule-recommendation', {
      recommendationId: recommendation.id,
      scheduleTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后
    });
    
    if (response.success) {
      ElMessage.success('推荐行动已定时执行');
    }
  } catch (error) {
    ElMessage.error('定时执行失败');
  }
};

// 更新生命周期图表
const updateLifecycleCharts = (analysis: any) => {
  nextTick(() => {
    // 客户价值分布图
    if (customerValueChart.value) {
      const valueChart = echarts.init(customerValueChart.value);
      const valueOption = {
        title: {
          text: '客户价值分布'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '客户价值',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 34, name: '高价值客户' },
              { value: 89, name: '中等价值客户' },
              { value: 156, name: '低价值客户' },
              { value: 245, name: '潜在客户' }
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
      valueChart.setOption(valueOption);
    }
    
    // 价值分布图
    if (valueDistributionChart.value) {
      const distChart = echarts.init(valueDistributionChart.value);
      const distOption = {
        title: {
          text: '客户价值分布'
        },
        xAxis: {
          type: 'category',
          data: ['0-1千', '1-5千', '5-1万', '1-5万', '5万+']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [245, 156, 89, 34, 12],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)'
            }
          }
        ]
      };
      distChart.setOption(distOption);
    }
    
    // 流失风险趋势图
    if (churnTrendChart.value) {
      const churnChart = echarts.init(churnTrendChart.value);
      const churnOption = {
        title: {
          text: '流失风险趋势'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '流失风险',
            type: 'line',
            data: [15, 12, 18, 8, 6, 5],
            smooth: true,
            lineStyle: {
              color: '#ff6b6b'
            }
          }
        ]
      };
      churnChart.setOption(churnOption);
    }
    
    // 生命周期阶段流转图
    if (stageFlowChart.value) {
      const flowChart = echarts.init(stageFlowChart.value);
      const flowOption = {
        title: {
          text: '生命周期阶段流转'
        },
        series: [
          {
            type: 'sankey',
            data: [
              { name: '潜在客户' },
              { name: '新客户' },
              { name: '活跃客户' },
              { name: '忠诚客户' },
              { name: '流失客户' }
            ],
            links: [
              { source: '潜在客户', target: '新客户', value: 156 },
              { source: '新客户', target: '活跃客户', value: 89 },
              { source: '活跃客户', target: '忠诚客户', value: 34 },
              { source: '新客户', target: '流失客户', value: 23 },
              { source: '活跃客户', target: '流失客户', value: 12 }
            ]
          }
        ]
      };
      flowChart.setOption(flowOption);
    }
  });
};

onMounted(() => {
  analyzeCustomerLifecycle();
  generateIntelligentCommunication();
});
</script>

<style scoped>
.customer-lifecycle-management {
  padding: var(--spacing-lg);
}

.lifecycle-overview {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.lifecycle-overview h3 {
  color: #2c3e50;
  font-size: var(--text-2xl);
  margin-bottom: var(--text-2xl);
}

.lifecycle-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.metric-card {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid #e9ecef;
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 var(--spacing-xs) 15px var(--shadow-light);
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.stage-header h4 {
  color: #2c3e50;
  margin: 0;
}

.stage-count {
  background: #007bff;
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-weight: bold;
}

.stage-metrics {
  margin-bottom: var(--spacing-4xl);
}

.metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.metric .label {
  color: #6c757d;
  font-size: var(--text-sm);
}

.metric .value {
  color: #495057;
  font-weight: 500;
}

.risk-indicator {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.risk-indicator.low {
  background: #d4edda;
  color: #155724;
}

.risk-indicator.medium {
  background: var(--bg-white)3cd;
  color: #856404;
}

.risk-indicator.high {
  background: #f8d7da;
  color: #721c24;
}

.stage-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.customer-insights {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.customer-insights h3 {
  color: #2c3e50;
  font-size: var(--text-2xl);
  margin-bottom: var(--text-2xl);
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.insight-card {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid #e9ecef;
}

.insight-card h4 {
  color: #2c3e50;
  margin-bottom: var(--spacing-4xl);
}

.chart {
  height: 300px;
  margin-bottom: var(--spacing-4xl);
}

.value-insights {
  max-height: 200px;
  overflow-y: auto;
}

.insight-item {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  margin-bottom: var(--spacing-2xl);
  border-left: var(--spacing-xs) solid #007bff;
}

.insight-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: var(--spacing-sm);
}

.insight-description {
  color: #6c757d;
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-2xl);
}

.churn-alerts {
  max-height: 400px;
  overflow-y: auto;
}

.churn-alert {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
  border-left: var(--spacing-xs) solid var(--danger-color);
}

.customer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
}

.customer-name {
  font-weight: 500;
  color: #2c3e50;
}

.churn-probability {
  color: var(--danger-color);
  font-weight: bold;
}

.churn-factors h5,
.retention-strategies h5 {
  color: #495057;
  margin-bottom: var(--spacing-sm);
}

.churn-factors ul {
  list-style: none;
  padding: 0;
  margin-bottom: var(--spacing-2xl);
}

.churn-factors li {
  background: #f8d7da;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  color: #721c24;
}

.strategy-list {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.upsell-opportunities {
  max-height: 400px;
  overflow-y: auto;
}

.opportunity-item {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
  border-left: var(--spacing-xs) solid #28a745;
}

.opportunity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.opportunity-header h5 {
  color: #2c3e50;
  margin: 0;
}

.opportunity-score {
  background: #28a745;
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
}

.opportunity-details {
  display: flex;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-sm);
}

.potential-revenue {
  color: #28a745;
  font-weight: bold;
}

.success-probability {
  color: #007bff;
  font-weight: bold;
}

.opportunity-strategy {
  color: #6c757d;
  font-size: var(--text-sm);
}

.intelligent-communication {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.intelligent-communication h3 {
  color: #2c3e50;
  font-size: var(--text-2xl);
  margin-bottom: var(--text-2xl);
}

.communication-queue h4 {
  color: #495057;
  margin-bottom: var(--spacing-4xl);
}

.queue-list {
  max-height: 500px;
  overflow-y: auto;
}

.communication-item {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-4xl);
  border: var(--border-width-base) solid #e9ecef;
}

.communication-item .customer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-4xl);
}

.customer-name {
  font-weight: 500;
  color: #2c3e50;
}

.communication-type {
  background: #007bff;
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
}

.communication-content {
  margin-bottom: var(--spacing-4xl);
}

.ai-generated-message,
.personalization-notes {
  margin-bottom: var(--spacing-2xl);
}

.ai-generated-message h5,
.personalization-notes h5 {
  color: #495057;
  margin-bottom: var(--spacing-sm);
}

.ai-generated-message p {
  background: white;
  padding: var(--spacing-sm);
  border-radius: var(--spacing-xs);
  border-left: var(--spacing-xs) solid #28a745;
  margin: 0;
}

.personalization-notes ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.personalization-notes li {
  background: var(--bg-white)3cd;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  color: #856404;
}

.communication-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.lifecycle-analytics {
  background: white;
  border-radius: var(--text-xs);
  padding: var(--spacing-6xl);
  margin-bottom: var(--spacing-8xl);
  box-shadow: 0 2px 10px var(--shadow-light);
}

.lifecycle-analytics h3 {
  color: #2c3e50;
  font-size: var(--text-2xl);
  margin-bottom: var(--text-2xl);
}

.analytics-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.chart-container {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid #e9ecef;
}

.chart-container h4 {
  color: #495057;
  margin-bottom: var(--spacing-4xl);
}

.customer-360-view {
  max-height: 600px;
  overflow-y: auto;
}

.customer-summary {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  margin-bottom: var(--text-2xl);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.summary-header h3 {
  color: #2c3e50;
  margin: 0;
}

.customer-tags {
  display: flex;
  gap: var(--spacing-sm);
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-4xl);
}

.summary-metrics .metric {
  background: white;
  padding: var(--spacing-4xl);
  border-radius: var(--radius-md);
  text-align: center;
}

.metric-label {
  color: #6c757d;
  font-size: var(--text-xs);
  margin-bottom: var(--spacing-base);
}

.metric-value {
  color: #2c3e50;
  font-weight: bold;
  font-size: var(--text-base);
}

.customer-timeline {
  margin-bottom: var(--text-2xl);
}

.customer-timeline h4 {
  color: #2c3e50;
  margin-bottom: var(--spacing-4xl);
}

.timeline-items {
  max-height: 300px;
  overflow-y: auto;
}

.timeline-item {
  display: flex;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
  padding-bottom: var(--spacing-4xl);
  border-bottom: var(--border-width-base) solid #e9ecef;
}

.timeline-date {
  color: #6c757d;
  font-size: var(--text-xs);
  min-width: 80px;
}

.timeline-content h5 {
  color: #2c3e50;
  margin-bottom: var(--spacing-base);
}

.timeline-content p {
  color: #6c757d;
  margin: 0;
}

.customer-recommendations h4 {
  color: #2c3e50;
  margin-bottom: var(--spacing-4xl);
}

.recommendations-list {
  max-height: 200px;
  overflow-y: auto;
}

.recommendation-item {
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
  border-left: var(--spacing-xs) solid #007bff;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.recommendation-header h5 {
  color: #2c3e50;
  margin: 0;
}

.recommendation-priority {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.recommendation-priority.high {
  background: var(--danger-color);
  color: white;
}

.recommendation-priority.medium {
  background: var(--warning-color);
  color: #212529;
}

.recommendation-priority.low {
  background: #28a745;
  color: white;
}

.recommendation-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-2xl);
}

@media (max-width: var(--breakpoint-md)) {
  .lifecycle-metrics {
    grid-template-columns: 1fr;
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-charts {
    grid-template-columns: 1fr;
  }
  
  .summary-metrics {
    grid-template-columns: 1fr;
  }
  
  .opportunity-details {
    flex-direction: column;
    gap: var(--spacing-base);
  }
}
</style>