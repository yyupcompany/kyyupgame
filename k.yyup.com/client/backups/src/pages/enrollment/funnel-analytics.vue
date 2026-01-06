<template>
  <div class="enrollment-funnel-analytics">
    <div class="header">
      <h2>智能招生漏斗分析</h2>
      <p class="subtitle">AI驱动的招生转化分析，优化转化率至35%</p>
    </div>

    <!-- 招生漏斗可视化 -->
    <div class="funnel-visualization">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <h3>招生漏斗分析</h3>
            <div class="header-actions">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="analyzeFunnelPerformance"
              />
              <el-button type="primary" @click="analyzeFunnelPerformance" :loading="loading">
                <el-icon><Refresh /></el-icon>
                刷新分析
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="funnel-container">
          <div class="funnel-chart">
            <div ref="funnelChart" class="chart"></div>
          </div>
          
          <div class="funnel-insights">
            <div class="insight-card" v-for="insight in funnelInsights" :key="insight.id">
              <div class="insight-icon" :class="insight.type">
                <el-icon><component :is="getInsightIcon(insight.type)" /></el-icon>
              </div>
              <div class="insight-content">
                <h4>{{ insight.title }}</h4>
                <p>{{ insight.description }}</p>
                <div class="insight-metrics">
                  <span class="metric">影响度: {{ insight.impact }}%</span>
                  <span class="metric">改进潜力: {{ insight.potential }}%</span>
                </div>
                <div class="insight-action" v-if="insight.actionable">
                  <el-button size="small" type="primary" @click="applyInsight(insight)">
                    应用建议
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 转化率优化建议 -->
    <div class="conversion-optimization">
      <el-card shadow="never">
        <template #header>
          <h3>转化率优化建议</h3>
        </template>
        
        <div class="optimization-grid">
          <div class="optimization-card" v-for="optimization in conversionOptimizations" :key="optimization.id">
            <div class="optimization-header">
              <h4>{{ optimization.stage }}</h4>
              <div class="conversion-rates">
                <div class="current-rate">
                  当前: <span class="rate">{{ optimization.currentRate }}%</span>
                </div>
                <div class="target-rate">
                  目标: <span class="rate target">{{ optimization.targetRate }}%</span>
                </div>
                <div class="improvement">
                  <el-icon><TrendCharts /></el-icon>
                  +{{ (optimization.targetRate - optimization.currentRate).toFixed(1) }}%
                </div>
              </div>
            </div>
            
            <div class="optimization-content">
              <div class="bottlenecks">
                <h5>瓶颈分析</h5>
                <div class="bottleneck-list">
                  <div v-for="bottleneck in optimization.bottlenecks" :key="bottleneck.id" class="bottleneck-item">
                    <div class="bottleneck-severity" :class="bottleneck.severity">
                      <el-icon><Warning /></el-icon>
                    </div>
                    <div class="bottleneck-content">
                      <span class="bottleneck-name">{{ bottleneck.name }}</span>
                      <span class="bottleneck-impact">影响: {{ bottleneck.impact }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="recommendations">
                <h5>优化建议</h5>
                <div class="recommendation-list">
                  <div v-for="rec in optimization.recommendations" :key="rec.id" class="recommendation-item">
                    <div class="recommendation-content">
                      <div class="recommendation-header">
                        <span class="recommendation-text">{{ rec.text }}</span>
                        <el-tag :type="getPriorityType(rec.priority)">{{ rec.priority }}</el-tag>
                      </div>
                      <div class="recommendation-metrics">
                        <span class="expected-impact">预期提升: {{ rec.expectedImpact }}%</span>
                        <span class="implementation-cost">实施成本: {{ rec.implementationCost }}</span>
                      </div>
                    </div>
                    <div class="recommendation-actions">
                      <el-button size="small" @click="implementRecommendation(rec)">
                        实施
                      </el-button>
                      <el-button size="small" type="info" @click="viewRecommendationDetails(rec)">
                        详情
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- A/B测试管理 -->
    <div class="ab-testing">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <h3>A/B测试管理</h3>
            <el-button type="primary" @click="showCreateTestDialog">
              <el-icon><Plus /></el-icon>
              创建测试
            </el-button>
          </div>
        </template>
        
        <div class="test-dashboard">
          <div class="active-tests">
            <h4>进行中的测试</h4>
            <div class="test-list">
              <div v-for="test in activeTests" :key="test.id" class="test-item">
                <div class="test-header">
                  <h5>{{ test.name }}</h5>
                  <div class="test-status" :class="test.status">
                    <el-icon><component :is="getStatusIcon(test.status)" /></el-icon>
                    {{ getStatusText(test.status) }}
                  </div>
                </div>
                
                <div class="test-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: test.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ test.progress }}% 完成</span>
                </div>
                
                <div class="test-metrics">
                  <div class="metric-group">
                    <div class="metric">
                      <span class="label">变体A转化率</span>
                      <span class="value" :class="{ winning: test.variantA.isWinning }">
                        {{ test.variantA.conversionRate }}%
                      </span>
                    </div>
                    <div class="metric">
                      <span class="label">变体B转化率</span>
                      <span class="value" :class="{ winning: test.variantB.isWinning }">
                        {{ test.variantB.conversionRate }}%
                      </span>
                    </div>
                  </div>
                  <div class="metric-group">
                    <div class="metric">
                      <span class="label">置信度</span>
                      <span class="value">{{ test.confidence }}%</span>
                    </div>
                    <div class="metric">
                      <span class="label">剩余时间</span>
                      <span class="value">{{ test.remainingTime }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="test-actions">
                  <el-button size="small" @click="viewTestDetails(test)">详情</el-button>
                  <el-button size="small" type="success" @click="concludeTest(test)" :disabled="test.confidence < 95">
                    结束测试
                  </el-button>
                  <el-button size="small" type="danger" @click="pauseTest(test)" v-if="test.status === 'running'">
                    暂停
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="test-recommendations">
            <h4>测试建议</h4>
            <div class="recommendation-list">
              <div v-for="testRec in testRecommendations" :key="testRec.id" class="test-recommendation">
                <div class="recommendation-header">
                  <h5>{{ testRec.title }}</h5>
                  <el-tag :type="getTestPriorityType(testRec.priority)">{{ testRec.priority }}</el-tag>
                </div>
                <p class="recommendation-description">{{ testRec.description }}</p>
                <div class="test-details">
                  <div class="test-metric">
                    <span class="label">预计周期:</span>
                    <span class="value">{{ testRec.estimatedDuration }}</span>
                  </div>
                  <div class="test-metric">
                    <span class="label">所需样本:</span>
                    <span class="value">{{ testRec.requiredSampleSize }}</span>
                  </div>
                  <div class="test-metric">
                    <span class="label">预期提升:</span>
                    <span class="value">{{ testRec.expectedImprovement }}%</span>
                  </div>
                </div>
                <div class="recommendation-actions">
                  <el-button size="small" type="primary" @click="createTest(testRec)">
                    创建测试
                  </el-button>
                  <el-button size="small" type="info" @click="viewTestRecommendationDetails(testRec)">
                    了解更多
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建测试对话框 -->
    <el-dialog v-model="createTestDialogVisible" title="创建A/B测试" width="600px">
      <el-form :model="newTestForm" label-width="120px">
        <el-form-item label="测试名称">
          <el-input v-model="newTestForm.name" placeholder="输入测试名称" />
        </el-form-item>
        <el-form-item label="测试描述">
          <el-input v-model="newTestForm.description" type="textarea" placeholder="描述测试目标和假设" />
        </el-form-item>
        <el-form-item label="测试类型">
          <el-select v-model="newTestForm.type" placeholder="选择测试类型">
            <el-option label="页面设计" value="page_design" />
            <el-option label="内容文案" value="content_copy" />
            <el-option label="表单优化" value="form_optimization" />
            <el-option label="价格策略" value="pricing_strategy" />
          </el-select>
        </el-form-item>
        <el-form-item label="流量分配">
          <el-slider v-model="newTestForm.trafficSplit" :min="10" :max="90" :step="10" />
          <div class="traffic-split-info">
            <span>变体A: {{ newTestForm.trafficSplit }}%</span>
            <span>变体B: {{ 100 - newTestForm.trafficSplit }}%</span>
          </div>
        </el-form-item>
        <el-form-item label="成功指标">
          <el-select v-model="newTestForm.successMetric" placeholder="选择成功指标">
            <el-option label="转化率" value="conversion_rate" />
            <el-option label="点击率" value="click_rate" />
            <el-option label="停留时间" value="dwell_time" />
            <el-option label="完成率" value="completion_rate" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createTestDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createNewTest">创建测试</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Refresh, 
  TrendCharts, 
  Warning, 
  Plus, 
  VideoPlay, 
  VideoPause, 
  CircleCheck,
  Clock
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';

// 类型定义
interface FunnelInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'success';
  impact: number;
  potential: number;
  actionable: boolean;
}

interface ConversionOptimization {
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

interface ABTest {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed';
  progress: number;
  variantA: {
    conversionRate: number;
    isWinning: boolean;
  };
  variantB: {
    conversionRate: number;
    isWinning: boolean;
  };
  confidence: number;
  remainingTime: string;
}

interface TestRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: string;
  requiredSampleSize: number;
  expectedImprovement: number;
}

// 响应式数据
const loading = ref(false);
const dateRange = ref<[Date, Date]>([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]);
const funnelChart = ref<HTMLElement>();
const funnelInsights = ref<FunnelInsight[]>([]);
const conversionOptimizations = ref<ConversionOptimization[]>([]);
const activeTests = ref<ABTest[]>([]);
const testRecommendations = ref<TestRecommendation[]>([]);
const createTestDialogVisible = ref(false);

const newTestForm = ref({
  name: '',
  description: '',
  type: '',
  trafficSplit: 50,
  successMetric: ''
});

// 漏斗分析核心逻辑
const analyzeFunnelPerformance = async () => {
  try {
    loading.value = true;
    
    // 模拟API调用
    const mockResponse = await mockFunnelAnalysisAPI();
    
    if (mockResponse.success) {
      const analysis = mockResponse.data;
      
      // 更新漏斗洞察
      funnelInsights.value = analysis.insights;
      
      // 更新转化优化建议
      conversionOptimizations.value = analysis.optimizations;
      
      // 更新测试建议
      testRecommendations.value = analysis.testRecommendations;
      
      // 渲染漏斗图表
      await nextTick();
      renderFunnelChart(analysis.funnelData);
    }
  } catch (error) {
    console.error('Funnel analysis failed:', error);
    ElMessage.error('漏斗分析失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 模拟漏斗分析API
const mockFunnelAnalysisAPI = async () => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockData = {
    insights: [
      {
        id: 'insight1',
        title: '信息收集阶段转化率低',
        description: '用户在填写详细信息时流失率较高，可能是表单过于复杂',
        type: 'warning',
        impact: 25,
        potential: 15,
        actionable: true
      },
      {
        id: 'insight2',
        title: '咨询预约转化表现优异',
        description: '电话咨询到预约参观的转化率达到78%，表现良好',
        type: 'success',
        impact: 35,
        potential: 5,
        actionable: false
      },
      {
        id: 'insight3',
        title: '移动端体验待优化',
        description: '移动端用户转化率比桌面端低12%，需要优化移动体验',
        type: 'opportunity',
        impact: 18,
        potential: 22,
        actionable: true
      }
    ],
    optimizations: [
      {
        id: 'opt1',
        stage: '首次访问',
        currentRate: 45,
        targetRate: 52,
        bottlenecks: [
          { id: 'btn1', name: '页面加载时间过长', severity: 'high', impact: 15 },
          { id: 'btn2', name: '首页内容不够吸引', severity: 'medium', impact: 8 }
        ],
        recommendations: [
          {
            id: 'rec1',
            text: '优化页面加载速度，压缩图片和代码',
            priority: 'high',
            expectedImpact: 12,
            implementationCost: '低'
          },
          {
            id: 'rec2',
            text: '重新设计首页banner，突出核心价值',
            priority: 'medium',
            expectedImpact: 8,
            implementationCost: '中'
          }
        ]
      },
      {
        id: 'opt2',
        stage: '信息收集',
        currentRate: 32,
        targetRate: 45,
        bottlenecks: [
          { id: 'btn3', name: '表单字段过多', severity: 'high', impact: 22 },
          { id: 'btn4', name: '缺少进度指示', severity: 'medium', impact: 10 }
        ],
        recommendations: [
          {
            id: 'rec3',
            text: '简化表单，分步骤收集信息',
            priority: 'high',
            expectedImpact: 18,
            implementationCost: '中'
          },
          {
            id: 'rec4',
            text: '添加表单进度条和激励文案',
            priority: 'medium',
            expectedImpact: 8,
            implementationCost: '低'
          }
        ]
      }
    ],
    testRecommendations: [
      {
        id: 'test1',
        title: '简化报名表单测试',
        description: '测试简化版表单vs完整版表单的转化率差异',
        priority: 'high',
        estimatedDuration: '14天',
        requiredSampleSize: 1000,
        expectedImprovement: 15
      },
      {
        id: 'test2',
        title: '价格展示策略测试',
        description: '测试不同价格展示方式对转化率的影响',
        priority: 'medium',
        estimatedDuration: '21天',
        requiredSampleSize: 1500,
        expectedImprovement: 8
      }
    ],
    funnelData: [
      { stage: '首次访问', value: 1000, rate: 100 },
      { stage: '了解详情', value: 450, rate: 45 },
      { stage: '信息收集', value: 280, rate: 28 },
      { stage: '咨询预约', value: 210, rate: 21 },
      { stage: '实地参观', value: 168, rate: 16.8 },
      { stage: '确认报名', value: 126, rate: 12.6 }
    ]
  };
  
  return { success: true, data: mockData };
};

// 渲染漏斗图表
const renderFunnelChart = (funnelData: any[]) => {
  if (!funnelChart.value) return;
  
  const chart = echarts.init(funnelChart.value);
  
  const option = {
    title: {
      text: '招生转化漏斗',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '招生漏斗',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}人 ({d}%)'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: 'var(--bg-white)',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: funnelData.map(item => ({
          value: item.value,
          name: item.stage
        }))
      }
    ]
  };
  
  chart.setOption(option);
  
  // 响应式处理
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

// 智能A/B测试管理
const createTest = async (testRecommendation: TestRecommendation) => {
  try {
    // 模拟API调用
    const mockResponse = await mockCreateTestAPI(testRecommendation);
    
    if (mockResponse.success) {
      ElMessage.success('A/B测试已创建');
      await loadActiveTests();
    }
  } catch (error) {
    ElMessage.error('测试创建失败');
  }
};

// 模拟创建测试API
const mockCreateTestAPI = async (testRecommendation: TestRecommendation) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

// 加载活跃测试
const loadActiveTests = async () => {
  // 模拟数据
  activeTests.value = [
    {
      id: 'test1',
      name: '简化报名表单测试',
      status: 'running',
      progress: 65,
      variantA: { conversionRate: 12.5, isWinning: false },
      variantB: { conversionRate: 18.2, isWinning: true },
      confidence: 92,
      remainingTime: '5天'
    },
    {
      id: 'test2',
      name: '首页banner优化测试',
      status: 'running',
      progress: 34,
      variantA: { conversionRate: 8.3, isWinning: true },
      variantB: { conversionRate: 7.9, isWinning: false },
      confidence: 68,
      remainingTime: '12天'
    }
  ];
};

// 创建新测试
const createNewTest = async () => {
  if (!newTestForm.value.name || !newTestForm.value.type) {
    ElMessage.warning('请填写必要信息');
    return;
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('测试创建成功');
    createTestDialogVisible.value = false;
    
    // 重置表单
    newTestForm.value = {
      name: '',
      description: '',
      type: '',
      trafficSplit: 50,
      successMetric: ''
    };
    
    await loadActiveTests();
  } catch (error) {
    ElMessage.error('测试创建失败');
  }
};

// 实施优化建议
const implementRecommendation = async (recommendation: any) => {
  try {
    const confirm = await ElMessageBox.confirm(
      `确定要实施这个优化建议吗？预期提升转化率 ${recommendation.expectedImpact}%`,
      '确认实施',
      { type: 'warning' }
    );
    
    if (confirm) {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      ElMessage.success('优化建议已开始实施');
      await analyzeFunnelPerformance();
    }
  } catch (error) {
    // 用户取消操作
  }
};

// 工具函数
const getInsightIcon = (type: string) => {
  switch (type) {
    case 'opportunity': return TrendCharts;
    case 'warning': return Warning;
    case 'success': return CircleCheck;
    default: return TrendCharts;
  }
};

const getPriorityType = (priority: string) => {
  switch (priority) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return '';
  }
};

const getTestPriorityType = (priority: string) => {
  switch (priority) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return '';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'running': return VideoPlay;
    case 'paused': return VideoPause;
    case 'completed': return CircleCheck;
    default: return Clock;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'running': return '进行中';
    case 'paused': return '已暂停';
    case 'completed': return '已完成';
    default: return '待开始';
  }
};

// 事件处理
const applyInsight = (insight: FunnelInsight) => {
  ElMessage.success(`正在应用洞察: ${insight.title}`);
  // 实际实现中这里会调用相应的API
};

const viewTestDetails = (test: ABTest) => {
  ElMessage.info(`查看测试详情: ${test.name}`);
  // 实际实现中这里会打开详情页面
};

const concludeTest = async (test: ABTest) => {
  try {
    const confirm = await ElMessageBox.confirm(
      `确定要结束测试 "${test.name}" 吗？`,
      '确认结束测试',
      { type: 'warning' }
    );
    
    if (confirm) {
      ElMessage.success('测试已结束');
      await loadActiveTests();
    }
  } catch (error) {
    // 用户取消操作
  }
};

const pauseTest = async (test: ABTest) => {
  try {
    const confirm = await ElMessageBox.confirm(
      `确定要暂停测试 "${test.name}" 吗？`,
      '确认暂停测试',
      { type: 'warning' }
    );
    
    if (confirm) {
      ElMessage.success('测试已暂停');
      await loadActiveTests();
    }
  } catch (error) {
    // 用户取消操作
  }
};

const viewRecommendationDetails = (recommendation: any) => {
  ElMessage.info(`查看建议详情: ${recommendation.text}`);
};

const showCreateTestDialog = () => {
  createTestDialogVisible.value = true;
};

const viewTestRecommendationDetails = (testRec: TestRecommendation) => {
  ElMessage.info(`了解更多: ${testRec.title}`);
};

// 初始化
onMounted(() => {
  analyzeFunnelPerformance();
  loadActiveTests();
});
</script>

<style scoped>
.enrollment-funnel-analytics {
  padding: var(--spacing-lg);
  max-width: 1400px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.funnel-visualization {
  margin-bottom: var(--spacing-8xl);
}

.funnel-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: var(--spacing-8xl);
}

.funnel-chart {
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.funnel-insights {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.insight-card {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color-light);
}

.insight-card .insight-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  border-radius: var(--radius-full);
  margin-bottom: var(--spacing-2xl);
}

.insight-icon.opportunity {
  background: #e1f3d8;
  color: var(--success-color);
}

.insight-icon.warning {
  background: #fdf6ec;
  color: var(--warning-color);
}

.insight-icon.success {
  background: #e1f3d8;
  color: var(--success-color);
}

.insight-content h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.insight-content p {
  margin: 0 0 10px 0;
  color: var(--text-regular);
  font-size: var(--text-sm);
  line-height: 1.4;
}

.insight-metrics {
  display: flex;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-2xl);
}

.insight-metrics .metric {
  font-size: var(--text-xs);
  color: var(--info-color);
}

.conversion-optimization {
  margin-bottom: var(--spacing-8xl);
}

.optimization-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.optimization-card {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--border-color-light);
}

.optimization-header {
  margin-bottom: var(--text-2xl);
}

.optimization-header h4 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.conversion-rates {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.current-rate .rate {
  font-weight: bold;
  color: var(--text-regular);
}

.target-rate .rate.target {
  font-weight: bold;
  color: var(--success-color);
}

.improvement {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--success-color);
  font-size: var(--text-sm);
}

.optimization-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.bottlenecks h5,
.recommendations h5 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.bottleneck-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.bottleneck-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--spacing-xs);
}

.bottleneck-severity {
  width: var(--text-2xl);
  height: var(--text-2xl);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
}

.bottleneck-severity.high {
  background: #fef0f0;
  color: var(--danger-color);
}

.bottleneck-severity.medium {
  background: #fdf6ec;
  color: var(--warning-color);
}

.bottleneck-severity.low {
  background: #f0f9ff;
  color: var(--primary-color);
}

.bottleneck-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bottleneck-name {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.bottleneck-impact {
  font-size: var(--text-xs);
  color: var(--info-color);
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.recommendation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--spacing-xs);
}

.recommendation-content {
  flex: 1;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-base);
}

.recommendation-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.recommendation-metrics {
  display: flex;
  gap: var(--spacing-4xl);
  font-size: var(--text-xs);
  color: var(--info-color);
}

.recommendation-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.ab-testing {
  margin-bottom: var(--spacing-8xl);
}

.test-dashboard {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-8xl);
}

.active-tests h4,
.test-recommendations h4 {
  margin: 0 0 var(--text-2xl) 0;
  color: var(--text-primary);
  font-size: var(--text-base);
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.test-item {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--border-color-light);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.test-header h5 {
  margin: 0;
  color: var(--text-primary);
}

.test-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  font-size: var(--text-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
}

.test-status.running {
  background: #e1f3d8;
  color: var(--success-color);
}

.test-status.paused {
  background: #fdf6ec;
  color: var(--warning-color);
}

.test-status.completed {
  background: #e1f3d8;
  color: var(--success-color);
}

.test-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-4xl);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border-color-light);
  border-radius: var(--radius-xs);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--text-xs);
  color: var(--text-regular);
}

.test-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-4xl);
}

.metric-group {
  display: flex;
  justify-content: space-between;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric .label {
  font-size: var(--text-xs);
  color: var(--info-color);
  margin-bottom: var(--spacing-xs);
}

.metric .value {
  font-size: var(--text-sm);
  font-weight: bold;
  color: var(--text-primary);
}

.metric .value.winning {
  color: var(--success-color);
}

.test-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.test-recommendations .recommendation-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
}

.test-recommendation {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color-light);
}

.test-recommendation .recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.test-recommendation .recommendation-header h5 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.test-recommendation .recommendation-description {
  color: var(--text-regular);
  font-size: var(--text-sm);
  line-height: 1.4;
  margin-bottom: var(--spacing-2xl);
}

.test-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  margin-bottom: var(--spacing-4xl);
}

.test-metric {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
}

.test-metric .label {
  color: var(--info-color);
}

.test-metric .value {
  color: var(--text-primary);
  font-weight: 500;
}

.test-recommendation .recommendation-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.traffic-split-info {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-2xl);
  font-size: var(--text-xs);
  color: var(--text-regular);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

@media (max-width: var(--breakpoint-xl)) {
  .funnel-container {
    grid-template-columns: 1fr;
  }
  
  .test-dashboard {
    grid-template-columns: 1fr;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .optimization-grid {
    grid-template-columns: 1fr;
  }
  
  .conversion-rates {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .recommendation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .metric-group {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .test-recommendation .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>