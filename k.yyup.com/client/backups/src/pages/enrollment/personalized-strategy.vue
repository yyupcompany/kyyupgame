<template>
  <div class="personalized-strategy-container">
    <div class="header">
      <h2>个性化招生策略引擎</h2>
      <p class="subtitle">AI驱动的客户细分与个性化策略生成，匹配度达92%</p>
    </div>

    <!-- 策略生成控制面板 -->
    <div class="strategy-controls">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <h3>策略生成控制</h3>
            <div class="header-actions">
              <el-button type="primary" @click="generateStrategies" :loading="loading">
                <el-icon><MagicStick /></el-icon>
                生成个性化策略
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="controls-grid">
          <div class="control-group">
            <label>目标市场</label>
            <el-select v-model="strategyParams.targetMarket" placeholder="选择目标市场">
              <el-option label="全部市场" value="all" />
              <el-option label="高端市场" value="premium" />
              <el-option label="中端市场" value="mid-tier" />
              <el-option label="经济型市场" value="budget" />
            </el-select>
          </div>
          
          <div class="control-group">
            <label>策略周期</label>
            <el-select v-model="strategyParams.period" placeholder="选择策略周期">
              <el-option label="短期 (1-3个月)" value="short" />
              <el-option label="中期 (3-6个月)" value="medium" />
              <el-option label="长期 (6-12个月)" value="long" />
            </el-select>
          </div>
          
          <div class="control-group">
            <label>营销预算</label>
            <el-input-number 
              v-model="strategyParams.budget" 
              :min="0" 
              :max="1000000"
              :step="5000"
              controls-position="right"
              placeholder="输入营销预算"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 客户细分分析 -->
    <div class="customer-segmentation">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <h3>AI客户细分分析</h3>
            <div class="header-actions">
              <el-button size="small" @click="refreshSegmentation">
                <el-icon><Refresh /></el-icon>
                重新分析
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="segmentation-overview">
          <div class="segment-stats">
            <div class="stat-item">
              <div class="stat-value">{{ segments.length }}</div>
              <div class="stat-label">客户群体</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalCustomers }}</div>
              <div class="stat-label">总客户数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ avgMatchScore }}%</div>
              <div class="stat-label">平均匹配度</div>
            </div>
          </div>
          
          <div class="segments-grid">
            <div 
              v-for="segment in segments" 
              :key="segment.id"
              class="segment-card"
              @click="selectSegment(segment)"
              :class="{ active: selectedSegment?.id === segment.id }"
            >
              <div class="segment-header">
                <div class="segment-name">{{ segment.name }}</div>
                <div class="segment-size">{{ segment.size }} 人</div>
              </div>
              
              <div class="segment-characteristics">
                <div class="demographic-info">
                  <div class="info-item">
                    <span class="label">年龄范围:</span>
                    <span class="value">{{ segment.characteristics.demographics.ageRange }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">收入水平:</span>
                    <span class="value">{{ segment.characteristics.demographics.incomeLevel }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">教育背景:</span>
                    <span class="value">{{ segment.characteristics.demographics.education }}</span>
                  </div>
                </div>
                
                <div class="psychographic-info">
                  <div class="info-item">
                    <span class="label">价值观:</span>
                    <span class="value">{{ segment.characteristics.psychographics.values }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">关注点:</span>
                    <span class="value">{{ segment.characteristics.psychographics.concerns }}</span>
                  </div>
                </div>
              </div>
              
              <div class="segment-metrics">
                <div class="metric">
                  <span class="metric-label">转化潜力</span>
                  <div class="metric-bar">
                    <div class="metric-fill" :style="{ width: segment.conversionPotential + '%' }"></div>
                  </div>
                  <span class="metric-value">{{ segment.conversionPotential }}%</span>
                </div>
                
                <div class="metric">
                  <span class="metric-label">生命周期价值</span>
                  <div class="metric-bar">
                    <div class="metric-fill" :style="{ width: (segment.lifetimeValue / 50000) * 100 + '%' }"></div>
                  </div>
                  <span class="metric-value">¥{{ segment.lifetimeValue.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 个性化策略展示 -->
    <div v-if="strategies.length > 0" class="personalized-strategies">
      <el-card shadow="never">
        <template #header>
          <h3>个性化策略方案</h3>
        </template>
        
        <div class="strategies-grid">
          <div 
            v-for="strategy in strategies" 
            :key="strategy.id"
            class="strategy-card"
          >
            <div class="strategy-header">
              <div class="strategy-title">
                <h4>{{ strategy.targetSegment.name }} 专属策略</h4>
                <el-tag :type="getSegmentType(strategy.targetSegment.name)">
                  {{ strategy.targetSegment.size }} 人群体
                </el-tag>
              </div>
              <div class="strategy-score">
                <div class="score-circle">
                  <span class="score-value">{{ strategy.matchScore }}%</span>
                </div>
                <span class="score-label">匹配度</span>
              </div>
            </div>

            <!-- 推荐渠道 -->
            <div class="strategy-section">
              <h5>推荐营销渠道</h5>
              <div class="channels-list">
                <div 
                  v-for="channel in strategy.recommendedChannels" 
                  :key="channel.id"
                  class="channel-item"
                >
                  <div class="channel-info">
                    <div class="channel-name">{{ channel.name }}</div>
                    <div class="channel-effectiveness">
                      <el-rate 
                        v-model="channel.effectiveness" 
                        :max="5" 
                        disabled 
                        show-score 
                        score-template="{value}/5"
                      />
                    </div>
                  </div>
                  <div class="channel-metrics">
                    <span class="metric">预期ROI: {{ channel.expectedROI }}%</span>
                    <span class="metric">成本: ¥{{ channel.cost.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 信息传递策略 -->
            <div class="strategy-section">
              <h5>信息传递策略</h5>
              <div class="messaging-strategy">
                <div class="messaging-item">
                  <span class="messaging-label">核心价值主张:</span>
                  <span class="messaging-value">{{ strategy.messagingStrategy.coreValue }}</span>
                </div>
                <div class="messaging-item">
                  <span class="messaging-label">沟通语调:</span>
                  <span class="messaging-value">{{ strategy.messagingStrategy.tone }}</span>
                </div>
                <div class="messaging-item">
                  <span class="messaging-label">关键词组:</span>
                  <div class="keywords">
                    <el-tag 
                      v-for="keyword in strategy.messagingStrategy.keywords" 
                      :key="keyword"
                      size="small"
                    >
                      {{ keyword }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 定价策略 -->
            <div class="strategy-section">
              <h5>定价策略</h5>
              <div class="pricing-strategy">
                <div class="pricing-item">
                  <span class="pricing-label">推荐价格:</span>
                  <span class="pricing-value">¥{{ strategy.pricingStrategy.recommendedPrice.toLocaleString() }}</span>
                </div>
                <div class="pricing-item">
                  <span class="pricing-label">定价策略:</span>
                  <span class="pricing-value">{{ strategy.pricingStrategy.strategy }}</span>
                </div>
                <div class="pricing-item">
                  <span class="pricing-label">价格敏感度:</span>
                  <div class="sensitivity-indicator">
                    <div class="sensitivity-bar">
                      <div 
                        class="sensitivity-fill" 
                        :style="{ width: strategy.pricingStrategy.priceSensitivity + '%' }"
                      ></div>
                    </div>
                    <span class="sensitivity-text">{{ strategy.pricingStrategy.priceSensitivity }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 预期结果 -->
            <div class="strategy-section">
              <h5>预期结果</h5>
              <div class="expected-outcomes">
                <div class="outcome-grid">
                  <div class="outcome-item">
                    <div class="outcome-value">{{ strategy.expectedOutcomes.leads }}</div>
                    <div class="outcome-label">潜在客户</div>
                  </div>
                  <div class="outcome-item">
                    <div class="outcome-value">{{ strategy.expectedOutcomes.conversions }}</div>
                    <div class="outcome-label">预期转化</div>
                  </div>
                  <div class="outcome-item">
                    <div class="outcome-value">¥{{ strategy.expectedOutcomes.revenue.toLocaleString() }}</div>
                    <div class="outcome-label">预期收入</div>
                  </div>
                  <div class="outcome-item">
                    <div class="outcome-value">{{ strategy.expectedOutcomes.roi }}%</div>
                    <div class="outcome-label">投资回报率</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 策略操作 -->
            <div class="strategy-actions">
              <el-button type="primary" @click="implementStrategy(strategy)">
                实施策略
              </el-button>
              <el-button @click="previewContent(strategy)">
                预览内容
              </el-button>
              <el-button @click="exportStrategy(strategy)">
                导出策略
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 动态内容个性化 -->
    <div v-if="selectedSegment" class="content-personalization">
      <el-card shadow="never">
        <template #header>
          <h3>{{ selectedSegment.name }} 个性化内容生成</h3>
        </template>
        
        <div class="content-generator">
          <div class="content-types">
            <div class="content-type-buttons">
              <el-button 
                v-for="type in contentTypes" 
                :key="type.value"
                :type="selectedContentType === type.value ? 'primary' : 'default'"
                @click="selectContentType(type.value)"
              >
                {{ type.label }}
              </el-button>
            </div>
          </div>
          
          <div class="content-generator-controls">
            <div class="generator-params">
              <div class="param-group">
                <label>内容语调</label>
                <el-select v-model="contentParams.tone" placeholder="选择语调">
                  <el-option label="专业正式" value="professional" />
                  <el-option label="亲切友好" value="friendly" />
                  <el-option label="活泼有趣" value="playful" />
                  <el-option label="温暖关怀" value="caring" />
                </el-select>
              </div>
              
              <div class="param-group">
                <label>内容长度</label>
                <el-select v-model="contentParams.length" placeholder="选择长度">
                  <el-option label="简短 (100-200字)" value="short" />
                  <el-option label="中等 (200-500字)" value="medium" />
                  <el-option label="详细 (500-1000字)" value="long" />
                </el-select>
              </div>
              
              <div class="param-group">
                <el-button 
                  type="primary" 
                  @click="generatePersonalizedContent"
                  :loading="contentGenerating"
                >
                  <el-icon><DocumentAdd /></el-icon>
                  生成内容
                </el-button>
              </div>
            </div>
          </div>
          
          <div v-if="generatedContent" class="generated-content">
            <div class="content-preview">
              <h4>生成的个性化内容</h4>
              <div class="content-text">
                <div v-html="generatedContent.content"></div>
              </div>
              <div class="content-metadata">
                <div class="metadata-item">
                  <span class="label">个性化程度:</span>
                  <span class="value">{{ generatedContent.personalizationScore }}%</span>
                </div>
                <div class="metadata-item">
                  <span class="label">预期效果:</span>
                  <span class="value">{{ generatedContent.expectedEngagement }}% 参与度</span>
                </div>
              </div>
              <div class="content-actions">
                <el-button @click="copyContent">复制内容</el-button>
                <el-button @click="editContent">编辑内容</el-button>
                <el-button type="primary" @click="publishContent">发布内容</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  MagicStick, 
  Refresh, 
  DocumentAdd, 
  TrendCharts,
  Star
} from '@element-plus/icons-vue';

// 类型定义
interface Demographics {
  ageRange: string;
  incomeLevel: string;
  education: string;
  location: string;
}

interface Psychographics {
  values: string;
  concerns: string;
  lifestyle: string;
  motivation: string;
}

interface BehaviorPattern {
  channelPreference: string;
  decisionMakingStyle: string;
  informationConsumption: string;
}

interface CustomerSegment {
  id: string;
  name: string;
  characteristics: {
    demographics: Demographics;
    psychographics: Psychographics;
    behaviorPatterns: BehaviorPattern[];
  };
  size: number;
  conversionPotential: number;
  lifetimeValue: number;
}

interface MarketingChannel {
  id: string;
  name: string;
  effectiveness: number;
  expectedROI: number;
  cost: number;
}

interface MessagingStrategy {
  coreValue: string;
  tone: string;
  keywords: string[];
}

interface PricingStrategy {
  recommendedPrice: number;
  strategy: string;
  priceSensitivity: number;
}

interface StrategyOutcome {
  leads: number;
  conversions: number;
  revenue: number;
  roi: number;
}

interface PersonalizedStrategy {
  id: string;
  targetSegment: CustomerSegment;
  recommendedChannels: MarketingChannel[];
  messagingStrategy: MessagingStrategy;
  pricingStrategy: PricingStrategy;
  expectedOutcomes: StrategyOutcome;
  matchScore: number;
}

interface GeneratedContent {
  content: string;
  personalizationScore: number;
  expectedEngagement: number;
}

// 响应式数据
const loading = ref(false);
const contentGenerating = ref(false);
const segments = ref<CustomerSegment[]>([]);
const strategies = ref<PersonalizedStrategy[]>([]);
const selectedSegment = ref<CustomerSegment | null>(null);
const selectedContentType = ref('email');
const generatedContent = ref<GeneratedContent | null>(null);

const strategyParams = ref({
  targetMarket: 'all',
  period: 'medium',
  budget: 100000
});

const contentParams = ref({
  tone: 'friendly',
  length: 'medium'
});

const contentTypes = [
  { label: '邮件营销', value: 'email' },
  { label: '落地页', value: 'landing_page' },
  { label: '广告文案', value: 'ad_copy' },
  { label: '宣传手册', value: 'brochure' }
];

// 计算属性
const totalCustomers = computed(() => {
  return segments.value.reduce((sum, segment) => sum + segment.size, 0);
});

const avgMatchScore = computed(() => {
  if (strategies.value.length === 0) return 0;
  const total = strategies.value.reduce((sum, strategy) => sum + strategy.matchScore, 0);
  return Math.round(total / strategies.value.length);
});

// AI客户细分
const performCustomerSegmentation = async () => {
  try {
    // 模拟AI客户细分API
    const mockResponse = await mockCustomerSegmentationAPI();
    
    if (mockResponse.success) {
      segments.value = mockResponse.data.segments;
      return mockResponse.data.segments;
    }
  } catch (error) {
    console.error('Customer segmentation failed:', error);
    ElMessage.error('客户细分失败，请重试');
  }
};

// 模拟客户细分API
const mockCustomerSegmentationAPI = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockSegments: CustomerSegment[] = [
    {
      id: 'seg1',
      name: '高端品质追求型',
      characteristics: {
        demographics: {
          ageRange: '30-40岁',
          incomeLevel: '年收入30-50万',
          education: '本科以上',
          location: '市中心'
        },
        psychographics: {
          values: '品质至上、精英教育',
          concerns: '教育质量、师资力量',
          lifestyle: '忙碌高效、追求卓越',
          motivation: '为孩子提供最好的教育'
        },
        behaviorPatterns: [
          {
            channelPreference: '线下咨询、口碑推荐',
            decisionMakingStyle: '深度调研、慎重决策',
            informationConsumption: '专业报告、权威媒体'
          }
        ]
      },
      size: 150,
      conversionPotential: 85,
      lifetimeValue: 45000
    },
    {
      id: 'seg2',
      name: '性价比关注型',
      characteristics: {
        demographics: {
          ageRange: '25-35岁',
          incomeLevel: '年收入15-30万',
          education: '大专以上',
          location: '近郊地区'
        },
        psychographics: {
          values: '务实理性、性价比优先',
          concerns: '价格合理、服务周到',
          lifestyle: '工作繁忙、注重效率',
          motivation: '在预算内选择最优方案'
        },
        behaviorPatterns: [
          {
            channelPreference: '在线搜索、比价平台',
            decisionMakingStyle: '多方比较、理性分析',
            informationConsumption: '详细对比、用户评价'
          }
        ]
      },
      size: 280,
      conversionPotential: 68,
      lifetimeValue: 28000
    },
    {
      id: 'seg3',
      name: '便民服务型',
      characteristics: {
        demographics: {
          ageRange: '28-38岁',
          incomeLevel: '年收入10-20万',
          education: '高中以上',
          location: '居住社区'
        },
        psychographics: {
          values: '便民实用、就近选择',
          concerns: '交通便利、服务贴心',
          lifestyle: '生活节奏适中、重视便利',
          motivation: '就近入学、方便接送'
        },
        behaviorPatterns: [
          {
            channelPreference: '社区推荐、朋友介绍',
            decisionMakingStyle: '快速决策、信任导向',
            informationConsumption: '简要介绍、实地考察'
          }
        ]
      },
      size: 320,
      conversionPotential: 75,
      lifetimeValue: 22000
    }
  ];
  
  return {
    success: true,
    data: { segments: mockSegments }
  };
};

// 生成个性化策略
const generatePersonalizedStrategies = async () => {
  try {
    const customerSegments = await performCustomerSegmentation();
    
    // 模拟策略生成API
    const mockResponse = await mockPersonalizedStrategiesAPI(customerSegments);
    
    if (mockResponse.success) {
      strategies.value = mockResponse.data.strategies;
      return mockResponse.data.strategies;
    }
  } catch (error) {
    console.error('Strategy generation failed:', error);
    ElMessage.error('策略生成失败，请重试');
  }
};

// 模拟个性化策略API
const mockPersonalizedStrategiesAPI = async (segments: CustomerSegment[]) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockStrategies: PersonalizedStrategy[] = segments.map(segment => ({
    id: `strategy_${segment.id}`,
    targetSegment: segment,
    recommendedChannels: getRecommendedChannels(segment),
    messagingStrategy: getMessagingStrategy(segment),
    pricingStrategy: getPricingStrategy(segment),
    expectedOutcomes: getExpectedOutcomes(segment),
    matchScore: Math.floor(Math.random() * 10) + 88 // 88-98%
  }));
  
  return {
    success: true,
    data: { strategies: mockStrategies }
  };
};

// 获取推荐渠道
const getRecommendedChannels = (segment: CustomerSegment): MarketingChannel[] => {
  const channelMap = {
    'seg1': [
      { id: 'ch1', name: '专业教育展会', effectiveness: 5, expectedROI: 280, cost: 15000 },
      { id: 'ch2', name: '高端媒体广告', effectiveness: 4, expectedROI: 220, cost: 25000 },
      { id: 'ch3', name: '口碑推荐计划', effectiveness: 5, expectedROI: 350, cost: 8000 }
    ],
    'seg2': [
      { id: 'ch4', name: '在线搜索广告', effectiveness: 4, expectedROI: 180, cost: 12000 },
      { id: 'ch5', name: '比价平台推广', effectiveness: 4, expectedROI: 160, cost: 8000 },
      { id: 'ch6', name: '社交媒体营销', effectiveness: 3, expectedROI: 140, cost: 6000 }
    ],
    'seg3': [
      { id: 'ch7', name: '社区活动推广', effectiveness: 5, expectedROI: 200, cost: 5000 },
      { id: 'ch8', name: '地推宣传', effectiveness: 4, expectedROI: 150, cost: 3000 },
      { id: 'ch9', name: '家长群分享', effectiveness: 4, expectedROI: 180, cost: 2000 }
    ]
  };
  
  return channelMap[segment.id as keyof typeof channelMap] || [];
};

// 获取信息传递策略
const getMessagingStrategy = (segment: CustomerSegment): MessagingStrategy => {
  const messagingMap = {
    'seg1': {
      coreValue: '精英教育，成就未来领袖',
      tone: '专业权威，品质保证',
      keywords: ['精英教育', '名师团队', '个性化培养', '国际视野']
    },
    'seg2': {
      coreValue: '优质教育，合理价格',
      tone: '务实诚恳，性价比突出',
      keywords: ['性价比', '全面发展', '贴心服务', '透明收费']
    },
    'seg3': {
      coreValue: '就近入学，贴心服务',
      tone: '亲切温暖，便民贴心',
      keywords: ['就近便利', '贴心服务', '家庭关怀', '安全可靠']
    }
  };
  
  return messagingMap[segment.id as keyof typeof messagingMap] || messagingMap.seg2;
};

// 获取定价策略
const getPricingStrategy = (segment: CustomerSegment): PricingStrategy => {
  const pricingMap = {
    'seg1': {
      recommendedPrice: 8000,
      strategy: '高端定价，突出价值',
      priceSensitivity: 25
    },
    'seg2': {
      recommendedPrice: 5500,
      strategy: '中档定价，强调性价比',
      priceSensitivity: 65
    },
    'seg3': {
      recommendedPrice: 4200,
      strategy: '亲民定价，提供便利',
      priceSensitivity: 45
    }
  };
  
  return pricingMap[segment.id as keyof typeof pricingMap] || pricingMap.seg2;
};

// 获取预期结果
const getExpectedOutcomes = (segment: CustomerSegment): StrategyOutcome => {
  const baseLeads = Math.floor(segment.size * 0.6);
  const conversionRate = segment.conversionPotential / 100;
  const conversions = Math.floor(baseLeads * conversionRate);
  const avgPrice = segment.id === 'seg1' ? 8000 : segment.id === 'seg2' ? 5500 : 4200;
  const revenue = conversions * avgPrice;
  const roi = Math.floor((revenue / strategyParams.value.budget) * 100);
  
  return {
    leads: baseLeads,
    conversions,
    revenue,
    roi
  };
};

// 生成个性化内容
const generatePersonalizedContent = async () => {
  if (!selectedSegment.value) {
    ElMessage.warning('请先选择客户群体');
    return;
  }
  
  try {
    contentGenerating.value = true;
    
    // 模拟内容生成API
    const mockResponse = await mockPersonalizedContentAPI(
      selectedSegment.value.id,
      selectedContentType.value,
      contentParams.value
    );
    
    if (mockResponse.success) {
      generatedContent.value = mockResponse.data;
      ElMessage.success('个性化内容生成成功');
    }
  } catch (error) {
    console.error('Content personalization failed:', error);
    ElMessage.error('内容生成失败，请重试');
  } finally {
    contentGenerating.value = false;
  }
};

// 模拟个性化内容API
const mockPersonalizedContentAPI = async (
  segmentId: string,
  contentType: string,
  params: any
) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const contentMap = {
    'seg1': {
      email: '尊敬的家长，我们的精英教育项目专为培养未来领袖而设计，拥有海归名师团队和国际化课程体系，为您的孩子提供卓越的学习体验。',
      landing_page: '<h3>精英教育，成就非凡未来</h3><p>专业名师团队，个性化培养方案，国际视野教育理念，让您的孩子在起跑线上就领先一步。</p>',
      ad_copy: '精英教育首选！名师团队，个性化培养，培养未来领袖从这里开始。',
      brochure: '我们致力于提供最优质的教育服务，通过科学的教学方法和个性化的培养方案，帮助每个孩子发掘潜能，成就卓越未来。'
    },
    'seg2': {
      email: '亲爱的家长，我们提供高质量的教育服务，收费透明合理，师资力量雄厚，是您为孩子选择优质教育的性价比之选。',
      landing_page: '<h3>优质教育，合理价格</h3><p>专业教学团队，全面发展课程，透明收费标准，让您的投资获得最大回报。</p>',
      ad_copy: '性价比之选！优质教育，合理价格，全面发展，值得信赖。',
      brochure: '我们坚持提供高质量、高性价比的教育服务，让每个家庭都能享受到优质的教育资源。'
    },
    'seg3': {
      email: '您好，我们位于您家附近，提供便利的接送服务和贴心的教育关怀，让您的孩子在家门口就能享受优质教育。',
      landing_page: '<h3>就近入学，贴心服务</h3><p>社区身边的好学校，便利的交通，贴心的服务，让您省心放心。</p>',
      ad_copy: '就近便利！社区好学校，贴心服务，让教育更便民。',
      brochure: '作为社区教育的贴心伙伴，我们致力于为附近家庭提供便利、优质的教育服务。'
    }
  };
  
  const content = contentMap[segmentId as keyof typeof contentMap]?.[contentType as keyof typeof contentMap['seg1']] || '内容生成中...';
  
  return {
    success: true,
    data: {
      content,
      personalizationScore: Math.floor(Math.random() * 8) + 90, // 90-98%
      expectedEngagement: Math.floor(Math.random() * 15) + 75 // 75-90%
    }
  };
};

// 事件处理
const generateStrategies = async () => {
  loading.value = true;
  try {
    await generatePersonalizedStrategies();
    ElMessage.success('个性化策略生成完成');
  } catch (error) {
    ElMessage.error('策略生成失败');
  } finally {
    loading.value = false;
  }
};

const refreshSegmentation = async () => {
  await performCustomerSegmentation();
  ElMessage.success('客户细分分析已更新');
};

const selectSegment = (segment: CustomerSegment) => {
  selectedSegment.value = segment;
  generatedContent.value = null;
};

const selectContentType = (type: string) => {
  selectedContentType.value = type;
  generatedContent.value = null;
};

const implementStrategy = async (strategy: PersonalizedStrategy) => {
  try {
    const confirm = await ElMessageBox.confirm(
      `确定要实施针对 "${strategy.targetSegment.name}" 的个性化策略吗？`,
      '确认实施策略',
      { type: 'warning' }
    );
    
    if (confirm) {
      ElMessage.success('策略实施已启动');
      // 实际实现中这里会调用API启动策略
    }
  } catch (error) {
    // 用户取消操作
  }
};

const previewContent = (strategy: PersonalizedStrategy) => {
  ElMessage.info(`预览 ${strategy.targetSegment.name} 的个性化内容`);
  // 实际实现中这里会打开内容预览
};

const exportStrategy = (strategy: PersonalizedStrategy) => {
  ElMessage.success(`策略导出成功: ${strategy.targetSegment.name}`);
  // 实际实现中这里会导出策略文档
};

const copyContent = () => {
  if (generatedContent.value) {
    navigator.clipboard.writeText(generatedContent.value.content);
    ElMessage.success('内容已复制到剪贴板');
  }
};

const editContent = () => {
  ElMessage.info('打开内容编辑器');
  // 实际实现中这里会打开编辑器
};

const publishContent = () => {
  ElMessage.success('内容发布成功');
  // 实际实现中这里会发布内容
};

// 工具函数
const getSegmentType = (segmentName: string) => {
  const typeMap = {
    '高端品质追求型': 'danger',
    '性价比关注型': 'primary',
    '便民服务型': 'success'
  };
  return typeMap[segmentName as keyof typeof typeMap] || 'info';
};

// 初始化
onMounted(() => {
  performCustomerSegmentation();
});
</script>

<style scoped>
.personalized-strategy-container {
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
}

.strategy-controls {
  margin-bottom: var(--spacing-8xl);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.customer-segmentation {
  margin-bottom: var(--spacing-8xl);
}

.segmentation-overview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.segment-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--text-2xl);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-4xl);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-color-light);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: var(--spacing-base);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-regular);
}

.segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.segment-card {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  cursor: pointer;
  transition: all 0.3s ease;
}

.segment-card:hover {
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
  transform: translateY(-2px);
}

.segment-card.active {
  border-color: var(--primary-color);
  background: #f0f9ff;
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.segment-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--text-base);
}

.segment-size {
  font-size: var(--text-sm);
  color: var(--text-regular);
}

.segment-characteristics {
  margin-bottom: var(--spacing-4xl);
}

.demographic-info,
.psychographic-info {
  margin-bottom: var(--spacing-2xl);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-base);
  font-size: var(--text-sm);
}

.info-item .label {
  color: var(--info-color);
}

.info-item .value {
  color: var(--text-primary);
  font-weight: 500;
}

.segment-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.metric {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.metric-label {
  font-size: var(--text-xs);
  color: var(--info-color);
  min-width: 80px;
}

.metric-bar {
  flex: 1;
  height: 6px;
  background: var(--border-color-light);
  border-radius: var(--radius-xs);
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.metric-value {
  font-size: var(--text-xs);
  color: var(--text-primary);
  font-weight: 500;
  min-width: 60px;
  text-align: right;
}

.personalized-strategies {
  margin-bottom: var(--spacing-8xl);
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-8xl);
}

.strategy-card {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-6xl);
  border: var(--border-width-base) solid var(--border-color-light);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.strategy-title h4 {
  margin: 0 0 var(--spacing-base) 0;
  color: var(--text-primary);
}

.strategy-score {
  text-align: center;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-base);
}

.score-value {
  color: var(--bg-white);
  font-weight: bold;
  font-size: var(--text-base);
}

.score-label {
  font-size: var(--text-xs);
  color: var(--text-regular);
}

.strategy-section {
  margin-bottom: var(--text-2xl);
}

.strategy-section h5 {
  margin: 0 0 var(--spacing-2xl) 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: 500;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.channel-item {
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
  padding: var(--text-xs);
  border: var(--border-width-base) solid var(--border-color-light);
}

.channel-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.channel-name {
  font-weight: 500;
  color: var(--text-primary);
}

.channel-effectiveness {
  font-size: var(--text-xs);
}

.channel-metrics {
  display: flex;
  gap: var(--spacing-4xl);
  font-size: var(--text-xs);
  color: var(--text-regular);
}

.messaging-strategy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.messaging-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.messaging-label {
  font-size: var(--text-sm);
  color: var(--text-regular);
  min-width: 80px;
}

.messaging-value {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-base);
}

.pricing-strategy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.pricing-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.pricing-label {
  font-size: var(--text-sm);
  color: var(--text-regular);
  min-width: 80px;
}

.pricing-value {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.sensitivity-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.sensitivity-bar {
  flex: 1;
  height: 6px;
  background: var(--border-color-light);
  border-radius: var(--radius-xs);
  overflow: hidden;
}

.sensitivity-fill {
  height: 100%;
  background: var(--warning-color);
  transition: width 0.3s ease;
}

.sensitivity-text {
  font-size: var(--text-xs);
  color: var(--text-primary);
  min-width: 40px;
}

.expected-outcomes {
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color-light);
}

.outcome-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4xl);
}

.outcome-item {
  text-align: center;
}

.outcome-value {
  font-size: var(--text-lg);
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: var(--spacing-base);
}

.outcome-label {
  font-size: var(--text-xs);
  color: var(--text-regular);
}

.strategy-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--text-2xl);
}

.content-personalization {
  margin-bottom: var(--spacing-8xl);
}

.content-generator {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.content-types {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.content-type-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.content-generator-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
}

.generator-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4xl);
  align-items: end;
}

.param-group {
  display: flex;
  flex-direction: column;
}

.param-group label {
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.generated-content {
  margin-top: var(--text-2xl);
}

.content-preview {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--border-color-light);
}

.content-preview h4 {
  margin: 0 0 var(--spacing-4xl) 0;
  color: var(--text-primary);
}

.content-text {
  background: var(--bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color-light);
  margin-bottom: var(--spacing-4xl);
  line-height: 1.6;
}

.content-metadata {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-4xl);
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.metadata-item .label {
  color: var(--text-regular);
  font-size: var(--text-sm);
}

.metadata-item .value {
  color: var(--text-primary);
  font-weight: 500;
}

.content-actions {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: var(--breakpoint-xl)) {
  .strategies-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .segments-grid {
    grid-template-columns: 1fr;
  }
  
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .generator-params {
    grid-template-columns: 1fr;
  }
  
  .segment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .strategy-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4xl);
  }
  
  .outcome-grid {
    grid-template-columns: 1fr;
  }
  
  .content-type-buttons {
    flex-direction: column;
  }
  
  .content-metadata {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>