<template>
  <div class="nlp-analytics-dashboard">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">智能对话分析系统</h1>
      <div class="page-actions">
        <el-button type="primary" @click="startRealTimeAnalysis" :loading="isAnalyzing">
          <UnifiedIcon name="default" />
          {{ isAnalyzing ? '分析中...' : '开始实时分析' }}
        </el-button>
        <el-button @click="exportAnalysisReport">
          <UnifiedIcon name="Download" />
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 对话智能分析概览 -->
    <div class="nlp-overview">
      <h3>对话智能分析概览</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">{{ sentimentScore.toFixed(1) }}</div>
          <div class="metric-label">整体情感评分</div>
          <div class="metric-trend" :class="sentimentTrend">
            <UnifiedIcon name="default" />
            {{ sentimentChange }}%
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ satisfactionRate }}%</div>
          <div class="metric-label">满意度</div>
          <div class="metric-trend positive">
            <UnifiedIcon name="ArrowUp" />
            +{{ satisfactionIncrease }}%
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ avgResponseTime }}s</div>
          <div class="metric-label">平均响应时间</div>
          <div class="metric-trend" :class="responseTimeTrend">
            <UnifiedIcon name="default" />
            {{ responseTimeChange }}s
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ resolutionRate }}%</div>
          <div class="metric-label">问题解决率</div>
          <div class="metric-trend positive">
            <UnifiedIcon name="ArrowUp" />
            +{{ resolutionIncrease }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 实时对话分析 -->
        <el-tab-pane label="实时对话分析" name="realtime">
          <div class="real-time-analysis">
            <div class="analysis-controls">
              <div class="control-group">
                <label>分析深度:</label>
                <el-select v-model="analysisDepth" placeholder="选择分析深度">
                  <el-option label="基础分析" value="basic" />
                  <el-option label="深度分析" value="deep" />
                  <el-option label="专家级分析" value="expert" />
                </el-select>
              </div>
              <div class="control-group">
                <label>实时监控:</label>
                <el-switch v-model="realTimeMonitoring" @change="toggleRealTimeMonitoring" />
              </div>
            </div>

            <div class="conversation-stream">
              <div class="stream-header">
                <h4>实时对话流</h4>
                <div class="stream-stats">
                  <span>活跃会话: {{ activeConversations }}</span>
                  <span>今日消息: {{ todayMessages }}</span>
                </div>
              </div>

              <div class="conversations-list">
                <div v-for="conversation in liveConversations" :key="conversation.id" class="conversation-item">
                  <div class="conversation-header">
                    <div class="participant-info">
                      <div class="participant-avatar">
                        <el-avatar :size="32" :src="conversation.participantAvatar" />
                      </div>
                      <div class="participant-details">
                        <span class="participant-name">{{ conversation.participantName }}</span>
                        <span class="participant-type">{{ conversation.participantType }}</span>
                      </div>
                    </div>
                    <div class="conversation-metrics">
                      <div class="sentiment" :class="conversation.sentiment">
                        <UnifiedIcon name="default" />
                        {{ conversation.sentimentScore.toFixed(1) }}
                      </div>
                      <div class="urgency" :class="conversation.urgency">
                        {{ getUrgencyLabel(conversation.urgency) }}
                      </div>
                      <div class="language-detected">
                        {{ conversation.language }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="conversation-content">
                    <div class="latest-message">
                      <div class="message-text">{{ conversation.latestMessage }}</div>
                      <div class="message-meta">
                        <span>{{ formatTimestamp(conversation.timestamp) }}</span>
                        <span>{{ conversation.messageCount }} 条消息</span>
                      </div>
                    </div>
                    
                    <div class="ai-insights">
                      <h5>AI洞察分析</h5>
                      <div class="insights-grid">
                        <div class="insight-item" v-for="insight in conversation.insights" :key="insight.type">
                          <div class="insight-type">{{ insight.type }}</div>
                          <div class="insight-content">{{ insight.content }}</div>
                          <div class="insight-confidence">置信度: {{ insight.confidence }}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="intent-classification">
                      <h5>意图识别</h5>
                      <div class="intent-tags">
                        <el-tag 
                          v-for="intent in conversation.intents" 
                          :key="intent.name"
                          :type="getIntentTagType(intent.confidence)"
                          size="small"
                        >
                          {{ intent.name }} ({{ intent.confidence }}%)
                        </el-tag>
                      </div>
                    </div>
                    
                    <div class="suggested-responses">
                      <h5>智能回复建议</h5>
                      <div class="response-options">
                        <div 
                          v-for="response in conversation.suggestedResponses" 
                          :key="response.id"
                          class="response-option"
                          @click="sendSuggestedResponse(conversation.id, response)"
                        >
                          <div class="response-content">
                            <div class="response-text">{{ response.text }}</div>
                            <div class="response-meta">
                              <span>{{ response.tone }}</span>
                              <span>预期效果: {{ response.expectedOutcome }}</span>
                            </div>
                          </div>
                          <div class="response-score">{{ response.score }}%</div>
                        </div>
                      </div>
                    </div>

                    <div class="emotion-analysis">
                      <h5>情感细分分析</h5>
                      <div class="emotion-wheel">
                        <div 
                          v-for="emotion in conversation.detailedEmotions" 
                          :key="emotion.name"
                          class="emotion-segment"
                          :style="{ 
                            '--intensity': emotion.intensity + '%',
                            '--color': getEmotionColor(emotion.name)
                          }"
                        >
                          <span class="emotion-name">{{ emotion.name }}</span>
                          <span class="emotion-intensity">{{ emotion.intensity }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 主题分析和趋势 -->
        <el-tab-pane label="主题分析" name="topics">
          <div class="topic-analysis">
            <div class="analysis-grid">
              <div class="topic-cloud-section">
                <h4>热门话题云</h4>
                <div class="chart-container">
                  <div ref="topicCloudChart" class="chart"></div>
                </div>
                <div class="topic-stats">
                  <div class="stat-item">
                    <span class="stat-label">识别话题数:</span>
                    <span class="stat-value">{{ topicStats.totalTopics }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">新兴话题:</span>
                    <span class="stat-value">{{ topicStats.emergingTopics }}</span>
                  </div>
                </div>
              </div>
              
              <div class="topic-trends-section">
                <h4>话题趋势演变</h4>
                <div class="chart-container">
                  <div ref="topicTrendsChart" class="chart"></div>
                </div>
                <div class="trend-insights">
                  <div class="insight" v-for="insight in topicTrendInsights" :key="insight.topic">
                    <div class="insight-topic">{{ insight.topic }}</div>
                    <div class="insight-trend" :class="insight.trend">
                      <UnifiedIcon name="default" />
                      {{ insight.change }}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="emotion-distribution-section">
                <h4>情感分布分析</h4>
                <div class="chart-container">
                  <div ref="emotionChart" class="chart"></div>
                </div>
                <div class="emotion-summary">
                  <div class="emotion-item" v-for="emotion in emotionDistribution" :key="emotion.name">
                    <div class="emotion-color" :style="{ backgroundColor: emotion.color }"></div>
                    <span class="emotion-label">{{ emotion.name }}</span>
                    <span class="emotion-percentage">{{ emotion.percentage }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="intent-classification-section">
                <h4>意图分类统计</h4>
                <div class="chart-container">
                  <div ref="intentChart" class="chart"></div>
                </div>
                <div class="intent-breakdown">
                  <div class="intent-category" v-for="category in intentCategories" :key="category.name">
                    <div class="category-header">
                      <span class="category-name">{{ category.name }}</span>
                      <span class="category-count">{{ category.count }}</span>
                    </div>
                    <div class="category-subcategories">
                      <div 
                        v-for="sub in category.subcategories" 
                        :key="sub.name"
                        class="subcategory-item"
                      >
                        <span>{{ sub.name }}</span>
                        <span>{{ sub.percentage }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 语言理解分析 -->
        <el-tab-pane label="语言理解" name="language">
          <div class="language-understanding">
            <div class="understanding-metrics">
              <div class="metric-card">
                <div class="metric-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ languageMetrics.comprehensionRate }}%</div>
                  <div class="metric-label">语言理解率</div>
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ languageMetrics.detectedLanguages }}</div>
                  <div class="metric-label">检测到的语言</div>
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ languageMetrics.contextAccuracy }}%</div>
                  <div class="metric-label">上下文准确率</div>
                </div>
              </div>
            </div>

            <div class="language-analysis-details">
              <div class="analysis-section">
                <h4>语义理解深度分析</h4>
                <div class="semantic-analysis">
                  <div class="analysis-item" v-for="analysis in semanticAnalysis" :key="analysis.text">
                    <div class="original-text">{{ analysis.text }}</div>
                    <div class="understanding-breakdown">
                      <div class="entities">
                        <h5>实体识别:</h5>
                        <el-tag 
                          v-for="entity in analysis.entities" 
                          :key="entity.text"
                          :type="getEntityType(entity.type)"
                          size="small"
                        >
                          {{ entity.text }} ({{ entity.type }})
                        </el-tag>
                      </div>
                      <div class="relations">
                        <h5>关系抽取:</h5>
                        <div class="relation-list">
                          <div v-for="relation in analysis.relations" :key="relation.id" class="relation-item">
                            <span class="subject">{{ relation.subject }}</span>
                            <span class="predicate">{{ relation.predicate }}</span>
                            <span class="object">{{ relation.object }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="syntax">
                        <h5>句法分析:</h5>
                        <div class="syntax-tree">{{ analysis.syntaxTree }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="analysis-section">
                <h4>多语言处理能力</h4>
                <div class="multilingual-stats">
                  <div class="language-support" v-for="lang in multilingualSupport" :key="lang.code">
                    <div class="language-info">
                      <span class="language-name">{{ lang.name }}</span>
                      <span class="language-code">{{ lang.code }}</span>
                    </div>
                    <div class="support-level">
                      <el-progress :percentage="lang.supportLevel" :color="getSupportLevelColor(lang.supportLevel)" />
                    </div>
                    <div class="usage-stats">
                      <span>使用率: {{ lang.usagePercentage }}%</span>
                      <span>准确率: {{ lang.accuracy }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 智能对话优化建议 -->
        <el-tab-pane label="优化建议" name="optimization">
          <div class="conversation-optimization">
            <div class="optimization-overview">
              <h3>智能对话优化建议</h3>
              <div class="optimization-stats">
                <div class="stat-card">
                  <div class="stat-value">{{ optimizationStats.totalSuggestions }}</div>
                  <div class="stat-label">优化建议数</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ optimizationStats.implementedSuggestions }}</div>
                  <div class="stat-label">已实施建议</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ optimizationStats.averageImpact }}%</div>
                  <div class="stat-label">平均效果提升</div>
                </div>
              </div>
            </div>

            <div class="optimization-cards">
              <div v-for="optimization in conversationOptimizations" :key="optimization.id" class="optimization-card">
                <div class="optimization-header">
                  <div class="optimization-title">
                    <h4>{{ optimization.title }}</h4>
                    <div class="priority" :class="optimization.priority">
                      {{ getPriorityLabel(optimization.priority) }}
                    </div>
                  </div>
                  <div class="optimization-category">
                    <el-tag :type="getCategoryType(optimization.category)">
                      {{ optimization.category }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="optimization-content">
                  <div class="optimization-description">
                    <p>{{ optimization.description }}</p>
                  </div>
                  
                  <div class="optimization-metrics">
                    <div class="metric">
                      <span class="label">预期影响:</span>
                      <span class="value positive">{{ optimization.expectedImpact }}</span>
                    </div>
                    <div class="metric">
                      <span class="label">实施难度:</span>
                      <span class="value" :class="getDifficultyClass(optimization.difficulty)">
                        {{ optimization.difficulty }}
                      </span>
                    </div>
                    <div class="metric">
                      <span class="label">预估时间:</span>
                      <span class="value">{{ optimization.estimatedTime }}</span>
                    </div>
                  </div>
                  
                  <div class="implementation-steps">
                    <h5>实施步骤:</h5>
                    <ol class="steps-list">
                      <li v-for="(step, index) in optimization.steps" :key="index">
                        {{ step }}
                      </li>
                    </ol>
                  </div>
                  
                  <div class="related-metrics">
                    <h5>相关指标预期变化:</h5>
                    <div class="metrics-grid">
                      <div 
                        v-for="metric in optimization.relatedMetrics" 
                        :key="metric.name"
                        class="metric-change"
                      >
                        <span class="metric-name">{{ metric.name }}</span>
                        <span class="metric-change-value" :class="metric.change > 0 ? 'positive' : 'negative'">
                          {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="optimization-actions">
                    <el-button 
                      type="primary" 
                      @click="implementOptimization(optimization)"
                      :loading="optimization.implementing"
                    >
                      立即实施
                    </el-button>
                    <el-button @click="scheduleOptimization(optimization)">
                      计划实施
                    </el-button>
                    <el-button @click="simulateOptimization(optimization)">
                      模拟测试
                    </el-button>
                    <el-button type="info" @click="viewOptimizationDetails(optimization)">
                      查看详情
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  ArrowUp,
  ArrowDown,
  Star,
  Close,
  Warning,
  Monitor,
  Download,
  ChatDotRound,
  Switch,
  DocumentCopy
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';

// 接口定义
interface ConversationAnalysis {
  id: string;
  participantName: string;
  participantType: string;
  participantAvatar: string;
  latestMessage: string;
  messageCount: number;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  language: string;
  insights: InsightItem[];
  intents: IntentClassification[];
  suggestedResponses: ResponseSuggestion[];
  detailedEmotions: EmotionAnalysis[];
}

interface InsightItem {
  type: string;
  content: string;
  confidence: number;
}

interface IntentClassification {
  name: string;
  confidence: number;
}

interface ResponseSuggestion {
  id: string;
  text: string;
  tone: string;
  expectedOutcome: string;
  score: number;
}

interface EmotionAnalysis {
  name: string;
  intensity: number;
}

interface ConversationOptimization {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  steps: string[];
  relatedMetrics: MetricChange[];
  implementing?: boolean;
}

interface MetricChange {
  name: string;
  change: number;
}

// 状态管理
const activeTab = ref('realtime');
const isAnalyzing = ref(false);
const realTimeMonitoring = ref(false);
const analysisDepth = ref('deep');

// NLP分析数据
const sentimentScore = ref(7.8);
const sentimentTrend = ref('positive');
const sentimentChange = ref(12);
const satisfactionRate = ref(89);
const satisfactionIncrease = ref(7);
const avgResponseTime = ref(2.3);
const responseTimeTrend = ref('negative');
const responseTimeChange = ref(-0.5);
const resolutionRate = ref(94);
const resolutionIncrease = ref(11);

const activeConversations = ref(23);
const todayMessages = ref(1542);

const liveConversations = ref<ConversationAnalysis[]>([
  {
    id: 'conv_1',
    participantName: '张小明家长',
    participantType: '家长',
    participantAvatar: '/avatars/parent1.jpg',
    latestMessage: '想了解一下贵园的课程安排和师资力量情况',
    messageCount: 5,
    timestamp: new Date().toISOString(),
    sentiment: 'positive',
    sentimentScore: 8.2,
    urgency: 'medium',
    language: 'zh-CN',
    insights: [
      { type: '咨询意图', content: '家长对教育质量很关注', confidence: 92 },
      { type: '决策阶段', content: '处于信息收集阶段', confidence: 87 },
      { type: '关注重点', content: '课程和师资是主要关注点', confidence: 95 }
    ],
    intents: [
      { name: '课程咨询', confidence: 85 },
      { name: '师资了解', confidence: 78 },
      { name: '入学意向', confidence: 62 }
    ],
    suggestedResponses: [
      {
        id: 'resp_1',
        text: '我们很乐意为您详细介绍我们的教育理念和课程体系，您方便安排时间实地参观吗？',
        tone: '专业热情',
        expectedOutcome: '促进实地参观',
        score: 94
      },
      {
        id: 'resp_2', 
        text: '我们的师资团队都拥有丰富的幼教经验，我可以先发一些课程介绍资料给您参考',
        tone: '细致专业',
        expectedOutcome: '建立信任',
        score: 88
      }
    ],
    detailedEmotions: [
      { name: '期待', intensity: 75 },
      { name: '关注', intensity: 85 },
      { name: '谨慎', intensity: 35 },
      { name: '友好', intensity: 70 }
    ]
  }
]);

const topicStats = ref({
  totalTopics: 45,
  emergingTopics: 8
});

const topicTrendInsights = ref([
  { topic: '课程质量', trend: 'positive', change: 15.2 },
  { topic: '师资力量', trend: 'positive', change: 12.8 },
  { topic: '费用问题', trend: 'negative', change: -8.5 },
  { topic: '环境设施', trend: 'positive', change: 22.1 }
]);

const emotionDistribution = ref([
  { name: '积极', percentage: 65, color: 'var(--success-color)' },
  { name: '中性', percentage: 25, color: 'var(--warning-color)' },
  { name: '消极', percentage: 10, color: 'var(--danger-color)' }
]);

const intentCategories = ref([
  {
    name: '咨询类',
    count: 156,
    subcategories: [
      { name: '课程咨询', percentage: 45 },
      { name: '费用咨询', percentage: 30 },
      { name: '师资咨询', percentage: 25 }
    ]
  },
  {
    name: '投诉类',
    count: 23,
    subcategories: [
      { name: '服务投诉', percentage: 60 },
      { name: '环境投诉', percentage: 40 }
    ]
  }
]);

const languageMetrics = ref({
  comprehensionRate: 96.2,
  detectedLanguages: 8,
  contextAccuracy: 94.5
});

const semanticAnalysis = ref([
  {
    text: '我想为我家3岁的孩子找一个好的幼儿园',
    entities: [
      { text: '3岁', type: '年龄' },
      { text: '孩子', type: '人员' },
      { text: '幼儿园', type: '机构' }
    ],
    relations: [
      { id: 1, subject: '我', predicate: '寻找', object: '幼儿园' },
      { id: 2, subject: '孩子', predicate: '年龄是', object: '3岁' }
    ],
    syntaxTree: '[我 [想 [为 [我家 [3岁的 孩子]] [找 [一个 [好的 幼儿园]]]]]]'
  }
]);

const multilingualSupport = ref([
  { name: '简体中文', code: 'zh-CN', supportLevel: 98, usagePercentage: 75, accuracy: 97.2 },
  { name: '英语', code: 'en-US', supportLevel: 95, usagePercentage: 15, accuracy: 94.8 },
  { name: '粤语', code: 'zh-HK', supportLevel: 85, usagePercentage: 8, accuracy: 87.5 },
  { name: '日语', code: 'ja-JP', supportLevel: 75, usagePercentage: 2, accuracy: 78.3 }
]);

const optimizationStats = ref({
  totalSuggestions: 12,
  implementedSuggestions: 8,
  averageImpact: 23.5
});

const conversationOptimizations = ref<ConversationOptimization[]>([
  {
    id: 'opt_1',
    title: '优化响应时间',
    description: '通过智能预测和预加载常用回复模板，可以将平均响应时间从2.3秒降低到1.5秒以下',
    category: '性能优化',
    priority: 'high',
    expectedImpact: '+35% 用户满意度提升',
    difficulty: 'medium',
    estimatedTime: '2-3天',
    steps: [
      '分析高频对话模式',
      '建立智能回复模板库',
      '实施预测性加载机制',
      '优化NLP处理管道',
      '进行A/B测试验证效果'
    ],
    relatedMetrics: [
      { name: '响应时间', change: -35 },
      { name: '用户满意度', change: 25 },
      { name: '对话完成率', change: 15 }
    ]
  },
  {
    id: 'opt_2',
    title: '情感理解精度提升',
    description: '集成多模态情感分析模型，结合语音语调、文本语义和上下文信息，提升情感识别准确率',
    category: '算法优化',
    priority: 'high',
    expectedImpact: '+28% 情感识别准确率',
    difficulty: 'hard',
    estimatedTime: '1-2周',
    steps: [
      '部署高级情感分析模型',
      '整合多模态数据源',
      '优化情感分类算法',
      '建立情感反馈机制',
      '持续模型训练优化'
    ],
    relatedMetrics: [
      { name: '情感识别准确率', change: 28 },
      { name: '回复匹配度', change: 22 },
      { name: '用户体验评分', change: 18 }
    ]
  }
]);

// 实时NLP分析
const useRealTimeNLPAnalysis = () => {
  let ws: WebSocket | null = null;
  
  const connectNLPStream = () => {
    try {
      // 模拟WebSocket连接
      console.log('连接到NLP实时分析流...');
      
      // 模拟接收实时数据
      const simulateRealTimeData = () => {
        if (realTimeMonitoring.value) {
          // 更新对话数据
          updateConversationAnalysis();
          updateSentimentMetrics();
          updateTopicTrends();
          
          setTimeout(simulateRealTimeData, 5000); // 每5秒更新一次
        }
      };
      
      simulateRealTimeData();
    } catch (error) {
      console.error('NLP流连接失败:', error);
      ElMessage.error('实时分析连接失败');
    }
  };
  
  const disconnectNLPStream = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    console.log('断开NLP分析流连接');
  };
  
  return { connectNLPStream, disconnectNLPStream };
};

const { connectNLPStream, disconnectNLPStream } = useRealTimeNLPAnalysis();

// 界面交互方法
const startRealTimeAnalysis = async () => {
  isAnalyzing.value = true;
  
  try {
    await performAdvancedNLPAnalysis();
    ElMessage.success('实时分析已启动');
  } catch (error) {
    ElMessage.error('启动分析失败');
  } finally {
    isAnalyzing.value = false;
  }
};

const toggleRealTimeMonitoring = (enabled: boolean) => {
  if (enabled) {
    connectNLPStream();
    ElMessage.success('实时监控已开启');
  } else {
    disconnectNLPStream();
    ElMessage.info('实时监控已关闭');
  }
};

const exportAnalysisReport = () => {
  // 模拟导出报告
  ElMessage.success('分析报告导出中...');
  setTimeout(() => {
    ElMessage.success('报告导出完成');
  }, 2000);
};

const sendSuggestedResponse = (conversationId: string, response: ResponseSuggestion) => {
  ElMessage.success(`已发送回复: ${response.text.substring(0, 20)}...`);
};

const implementOptimization = async (optimization: ConversationOptimization) => {
  try {
    optimization.implementing = true;
    
    await ElMessageBox.confirm(
      `确定要实施优化方案"${optimization.title}"吗？`,
      '确认实施',
      { type: 'warning' }
    );
    
    // 模拟实施过程
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    optimizationStats.value.implementedSuggestions++;
    ElMessage.success('优化方案实施成功');
    
  } catch {
    // 用户取消
  } finally {
    optimization.implementing = false;
  }
};

const scheduleOptimization = (optimization: ConversationOptimization) => {
  ElMessage.info(`已将"${optimization.title}"加入实施计划`);
};

const simulateOptimization = (optimization: ConversationOptimization) => {
  ElMessage.info(`正在模拟测试"${optimization.title}"的效果...`);
  setTimeout(() => {
    ElMessage.success('模拟测试完成，预期效果良好');
  }, 2000);
};

const viewOptimizationDetails = (optimization: ConversationOptimization) => {
  ElMessage.info(`查看"${optimization.title}"的详细信息`);
};

// 高级NLP分析
const performAdvancedNLPAnalysis = async () => {
  try {
    console.log('执行高级NLP分析...');
    
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 更新分析结果
    updateNLPCharts();
    
    return {
      success: true,
      analysis: {
        sentimentAnalysis: { accuracy: 94.2 },
        intentClassification: { accuracy: 91.8 },
        topicModeling: { topics: 45 },
        languageDetection: { languages: 8 },
        optimizations: conversationOptimizations.value
      }
    };
  } catch (error) {
    console.error('Advanced NLP analysis failed:', error);
    throw error;
  }
};

// 数据更新方法
const updateConversationAnalysis = () => {
  // 模拟更新对话分析数据
  console.log('更新对话分析数据');
};

const updateSentimentMetrics = () => {
  // 模拟更新情感指标
  sentimentScore.value += (Math.random() - 0.5) * 0.2;
  satisfactionRate.value += Math.floor((Math.random() - 0.5) * 2);
};

const updateTopicTrends = () => {
  // 模拟更新主题趋势
  console.log('更新主题趋势数据');
};

const updateNLPCharts = () => {
  // 更新图表
  console.log('更新NLP分析图表');
};

// 辅助方法
const getTrendIcon = (trend: string) => {
  return trend === 'positive' ? ArrowUp : ArrowDown;
};

const getSentimentIcon = (sentiment: string) => {
  const icons = {
    'positive': Star,
    'negative': Close,
    'neutral': Warning
  };
  return icons[sentiment] || Warning;
};

const getUrgencyLabel = (urgency: string) => {
  const labels = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'critical': '紧急'
  };
  return labels[urgency] || urgency;
};

const getIntentTagType = (confidence: number) => {
  if (confidence >= 80) return 'success';
  if (confidence >= 60) return 'primary';
  if (confidence >= 40) return 'warning';
  return 'info';
};

const getEmotionColor = (emotion: string) => {
  const colors = {
    '期待': 'var(--primary-color)',
    '关注': 'var(--success-color)',
    '谨慎': 'var(--warning-color)',
    '友好': 'var(--danger-color)'
  };
  return colors[emotion] || 'var(--info-color)';
};

const getEntityType = (type: string) => {
  const types = {
    '年龄': 'primary',
    '人员': 'success',
    '机构': 'warning'
  };
  return types[type] || 'info';
};

const getSupportLevelColor = (level: number) => {
  if (level >= 90) return 'var(--success-color)';
  if (level >= 80) return 'var(--warning-color)';
  return 'var(--danger-color)';
};

const getPriorityLabel = (priority: string) => {
  const labels = {
    'low': '低优先级',
    'medium': '中优先级',
    'high': '高优先级',
    'critical': '紧急'
  };
  return labels[priority] || priority;
};

const getCategoryType = (category: string) => {
  const types = {
    '性能优化': 'primary',
    '算法优化': 'success',
    '用户体验': 'warning'
  };
  return types[category] || 'info';
};

const getDifficultyClass = (difficulty: string) => {
  const classes = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  };
  return classes[difficulty] || 'info';
};

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN');
};

// 组件生命周期
onMounted(() => {
  console.log('NLP分析系统初始化完成');
});

onUnmounted(() => {
  disconnectNLPStream();
});
</script>

<style scoped lang="scss">
.nlp-analytics-dashboard {
  padding: var(--spacing-lg);
  min-height: 100vh;
  background: var(--bg-hover);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--text-xs);
}

.nlp-overview {
  margin-bottom: var(--text-3xl);
  
  h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--text-base);
}

.metric-card {
  background: white;
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  text-align: center;
}

.metric-value {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: #1d2129;
  margin-bottom: var(--spacing-sm);
}

.metric-label {
  font-size: var(--text-sm);
  color: #86909c;
  margin-bottom: var(--text-sm);
}

.metric-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 500;
}

.metric-trend.positive {
  color: #00b42a;
}

.metric-trend.negative {
  color: #f53f3f;
}

.metric-trend.warning {
  color: #ff7d00;
}

.main-content {
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
}

.real-time-analysis {
  padding: var(--spacing-lg);
}

.analysis-controls {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  margin-bottom: var(--text-2xl);
  padding: var(--text-base);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  label {
    font-size: var(--text-sm);
    color: #1d2129;
    min-width: auto;
  }
}

.conversation-stream {
  background: white;
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--text-xs);
  overflow: hidden;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-base) var(--text-2xl);
  background: var(--bg-gray-light);
  border-bottom: var(--z-index-dropdown) solid #e5e6eb;
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.stream-stats {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--text-sm);
  color: #86909c;
}

.conversations-list {
  max-min-height: 60px; height: auto;
  overflow-y: auto;
}

.conversation-item {
  border-bottom: var(--z-index-dropdown) solid var(--bg-gray-light);
  
  &:last-child {
    border-bottom: none;
  }
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-base) var(--text-2xl);
  background: var(--bg-gray-light);
}

.participant-info {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
}

.participant-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  
  .participant-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
  }
  
  .participant-type {
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.conversation-metrics {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
}

.sentiment {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 500;
  
  &.positive {
    background: #f0f9ff;
    color: #0369a1;
  }
  
  &.negative {
    background: #fef2f2;
    color: #dc2626;
  }
  
  &.neutral {
    background: #f9fafb;
    color: var(--text-secondary);
  }
}

.urgency {
  padding: var(--spacing-sm) 6px;
  border-radius: var(--radius-xs);
  font-size: var(--text-xs);
  font-weight: 500;
  
  &.low {
    background: #f0fdf4;
    color: #166534;
  }
  
  &.medium {
    background: #fefce8;
    color: #ca8a04;
  }
  
  &.high {
    background: #fef2f2;
    color: #dc2626;
  }
  
  &.critical {
    background: #fdf2f8;
    color: #be185d;
  }
}

.language-detected {
  font-size: var(--text-xs);
  color: #86909c;
  background: #f1f3f4;
  padding: var(--spacing-sm) 6px;
  border-radius: var(--radius-xs);
}

.conversation-content {
  padding: var(--spacing-lg);
}

.latest-message {
  margin-bottom: var(--text-2xl);
  
  .message-text {
    font-size: var(--text-sm);
    line-height: 1.6;
    color: #1d2129;
    margin-bottom: var(--spacing-sm);
  }
  
  .message-meta {
    display: flex;
    gap: var(--text-base);
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.ai-insights {
  margin-bottom: var(--text-2xl);
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-xs);
}

.insight-item {
  background: var(--bg-gray-light);
  padding: var(--text-xs);
  border-radius: var(--spacing-sm);
  border-left: 3px solid var(--primary-color);
  
  .insight-type {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
  }
  
  .insight-content {
    font-size: var(--text-sm);
    color: #1d2129;
    margin-bottom: var(--spacing-xs);
  }
  
  .insight-confidence {
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.intent-classification {
  margin-bottom: var(--text-2xl);
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.intent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.suggested-responses {
  margin-bottom: var(--text-2xl);
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.response-options {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.response-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-xs);
  background: var(--bg-gray-light);
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e7f4ff;
    border-color: var(--primary-color);
  }
}

.response-content {
  flex: 1;
  
  .response-text {
    font-size: var(--text-sm);
    color: #1d2129;
    margin-bottom: var(--spacing-xs);
  }
  
  .response-meta {
    display: flex;
    gap: var(--text-xs);
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.response-score {
  font-size: var(--text-sm);
  font-weight: 600;
  color: #00b42a;
}

.emotion-analysis {
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.emotion-wheel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-sm);
}

.emotion-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, var(--color) 0%, transparent 100%);
  border-radius: var(--spacing-sm);
  opacity: calc(var(--intensity) / 100);
  
  .emotion-name {
    font-size: var(--text-xs);
    font-weight: 500;
    color: #1d2129;
  }
  
  .emotion-intensity {
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.topic-analysis {
  padding: var(--spacing-lg);
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.topic-cloud-section,
.topic-trends-section,
.emotion-distribution-section,
.intent-classification-section {
  background: var(--bg-gray-light);
  padding: var(--spacing-lg);
  border-radius: var(--text-xs);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.chart-container {
  margin-bottom: var(--text-lg);
}

.chart {
  min-height: 60px; height: auto;
  background: white;
  border-radius: var(--spacing-sm);
}

.language-understanding {
  padding: var(--spacing-lg);
}

.understanding-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-base);
  margin-bottom: var(--text-3xl);
}

.understanding-metrics .metric-card {
  display: flex;
  align-items: center;
  gap: var(--text-base);
  text-align: left;
}

.metric-icon {
  font-size: var(--text-2xl);
  color: var(--primary-color);
}

.metric-info {
  .metric-value {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: #1d2129;
    margin-bottom: var(--spacing-xs);
  }
  
  .metric-label {
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.conversation-optimization {
  padding: var(--spacing-lg);
}

.optimization-overview {
  margin-bottom: var(--text-3xl);
  
  h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.optimization-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--text-base);
  margin-bottom: var(--text-3xl);
}

.stat-card {
  background: var(--bg-gray-light);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
  text-align: center;
  
  .stat-value {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: #1d2129;
    margin-bottom: var(--spacing-xs);
  }
  
  .stat-label {
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.optimization-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.optimization-card {
  background: white;
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--text-xs);
  padding: var(--text-2xl);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
}

.optimization-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--text-lg);
}

.optimization-title {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.priority {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 500;
  
  &.high {
    background: #fef2f2;
    color: #dc2626;
  }
  
  &.medium {
    background: #fefce8;
    color: #ca8a04;
  }
  
  &.low {
    background: #f0fdf4;
    color: #166534;
  }
}

.optimization-content {
  .optimization-description {
    margin-bottom: var(--text-lg);
    
    p {
      font-size: var(--text-sm);
      line-height: 1.6;
      color: #4e5969;
      margin: 0;
    }
  }
}

.optimization-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--text-xs);
  margin-bottom: var(--text-lg);
}

.metric {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--text-sm);
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
  
  .label {
    font-size: var(--text-xs);
    color: #86909c;
  }
  
  .value {
    font-size: var(--text-xs);
    font-weight: 500;
    
    &.positive {
      color: #00b42a;
    }
    
    &.success {
      color: #00b42a;
    }
    
    &.warning {
      color: #ff7d00;
    }
    
    &.danger {
      color: #f53f3f;
    }
  }
}

.implementation-steps {
  margin-bottom: var(--text-lg);
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--spacing-sm);
  }
}

.steps-list {
  margin: 0;
  padding-left: var(--text-2xl);
  
  li {
    font-size: var(--text-sm);
    color: #4e5969;
    margin-bottom: var(--spacing-xs);
  }
}

.optimization-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

@media (max-width: var(--breakpoint-md)) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .understanding-metrics {
    grid-template-columns: 1fr;
  }
  
  .optimization-metrics {
    grid-template-columns: 1fr;
  }
  
  .optimization-actions {
    flex-direction: column;
  }
}
</style>