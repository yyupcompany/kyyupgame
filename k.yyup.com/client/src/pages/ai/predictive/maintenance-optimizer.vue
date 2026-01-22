<template>
  <div class="predictive-maintenance-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">预测性维护与智能优化</h1>
      <div class="page-actions">
        <el-button type="primary" @click="startSystemMonitor" :loading="monitorRunning">
          <UnifiedIcon name="default" />
          {{ monitorRunning ? '系统监控中...' : '系统监控' }}
        </el-button>
        <el-button @click="generateOptimizationReport">
          <UnifiedIcon name="default" />
          生成优化报告
        </el-button>
        <el-button @click="enableAutoMaintenance" :type="autoMaintenanceEnabled ? 'success' : 'info'">
          <UnifiedIcon name="default" />
          {{ autoMaintenanceEnabled ? '自动维护已启用' : '启用自动维护' }}
        </el-button>
      </div>
    </div>

    <!-- 系统监控总览 -->
    <div class="health-overview">
      <div class="health-score-card">
        <div class="score-circle">
          <el-progress 
            type="circle" 
            :percentage="systemHealth.overallScore" 
            :width="120"
            :color="getHealthColor(systemHealth.overallScore)"
          />
        </div>
        <div class="score-info">
          <h3>系统健康评分</h3>
          <div class="score-details">
            <div class="detail-item">
              <span class="label">状态:</span>
              <span class="value" :class="getHealthStatus(systemHealth.overallScore)">
                {{ getHealthStatusText(systemHealth.overallScore) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">上次检查:</span>
              <span class="value">{{ formatTime(systemHealth.lastCheck) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="health-metrics">
        <div class="metric-card" v-for="metric in healthMetrics" :key="metric.name">
          <div class="metric-icon" :class="metric.status">
            <UnifiedIcon name="default" />
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-trend" :class="metric.trend">
              <UnifiedIcon name="default" />
              {{ metric.change }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 预测性问题检测 -->
        <el-tab-pane label="问题预测" name="prediction">
          <div class="prediction-workspace">
            <div class="prediction-controls">
              <div class="control-group">
                <label>预测时间范围:</label>
                <el-select v-model="predictionHorizon">
                  <el-option label="未来7天" value="7days" />
                  <el-option label="未来30天" value="30days" />
                  <el-option label="未来90天" value="90days" />
                </el-select>
              </div>
              <div class="control-group">
                <label>风险阈值:</label>
                <el-slider v-model="riskThreshold" :min="0" :max="100" />
              </div>
              <div class="control-group">
                <el-button type="primary" @click="runPredictionAnalysis" :loading="predictionRunning">
                  运行预测分析
                </el-button>
              </div>
            </div>

            <div class="predicted-issues" v-if="predictedIssues.length > 0">
              <h4>预测到的潜在问题</h4>
              <div class="issues-list">
                <div 
                  v-for="issue in predictedIssues" 
                  :key="issue.id"
                  class="issue-card"
                  :class="issue.severity"
                >
                  <div class="issue-header">
                    <div class="issue-title">
                      <h5>{{ issue.type }}</h5>
                      <el-tag :type="getSeverityTagType(issue.severity)">
                        {{ getSeverityText(issue.severity) }}
                      </el-tag>
                    </div>
                    <div class="issue-probability">
                      <span class="label">发生概率:</span>
                      <span class="value">{{ issue.probability }}%</span>
                    </div>
                  </div>

                  <div class="issue-content">
                    <div class="issue-description">
                      <p>{{ issue.description }}</p>
                    </div>

                    <div class="issue-timeline">
                      <div class="timeline-item">
                        <span class="label">预计发生时间:</span>
                        <span class="value">{{ issue.timeToOccurrence }}</span>
                      </div>
                      <div class="timeline-item">
                        <span class="label">影响程度:</span>
                        <span class="value" :class="getImpactClass(issue.impactLevel)">
                          {{ issue.impactLevel }}
                        </span>
                      </div>
                    </div>

                    <div class="impact-assessment">
                      <h6>影响评估</h6>
                      <div class="impact-grid">
                        <div class="impact-item" v-for="impact in issue.impactAssessment" :key="impact.area">
                          <div class="impact-area">{{ impact.area }}</div>
                          <div class="impact-level">
                            <el-progress 
                              :percentage="impact.level" 
                              :color="getImpactColor(impact.level)"
                              :show-text="false"
                              :stroke-width="8"
                            />
                            <span class="impact-value">{{ impact.level }}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="preventive-actions">
                      <h6>预防性措施</h6>
                      <div class="actions-list">
                        <div 
                          v-for="action in issue.preventiveActions" 
                          :key="action.id"
                          class="action-item"
                        >
                          <div class="action-content">
                            <div class="action-title">{{ action.title }}</div>
                            <div class="action-description">{{ action.description }}</div>
                            <div class="action-meta">
                              <span>难度: {{ action.difficulty }}</span>
                              <span>预估时间: {{ action.estimatedTime }}</span>
                              <span>成本: {{ action.cost }}</span>
                            </div>
                          </div>
                          <div class="action-controls">
                            <el-button size="small" type="primary" @click="implementAction(action)">
                              立即执行
                            </el-button>
                            <el-button size="small" @click="scheduleAction(action)">
                              计划执行
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="prediction-charts">
              <div class="chart-container">
                <h4>风险趋势预测</h4>
                <div ref="riskTrendChart" class="chart"></div>
              </div>
              <div class="chart-container">
                <h4>故障概率分布</h4>
                <div ref="failureProbabilityChart" class="chart"></div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 性能瓶颈分析 -->
        <el-tab-pane label="性能分析" name="performance">
          <div class="performance-workspace">
            <div class="performance-overview">
              <div class="performance-metrics">
                <div class="metric-card" v-for="metric in performanceMetrics" :key="metric.name">
                  <div class="metric-header">
                    <h5>{{ metric.name }}</h5>
                    <div class="metric-status" :class="metric.status">
                      {{ getPerformanceStatus(metric.status) }}
                    </div>
                  </div>
                  <div class="metric-chart">
                    <div class="chart-mini" :ref="`chart_${metric.id}`"></div>
                  </div>
                  <div class="metric-details">
                    <div class="detail-row">
                      <span>当前值: {{ metric.currentValue }}</span>
                      <span>目标值: {{ metric.targetValue }}</span>
                    </div>
                    <div class="detail-row">
                      <span>变化: {{ metric.change }}%</span>
                      <span>阈值: {{ metric.threshold }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bottleneck-detection">
              <h4>检测到的性能瓶颈</h4>
              <div class="bottlenecks-list">
                <div 
                  v-for="bottleneck in detectedBottlenecks" 
                  :key="bottleneck.id"
                  class="bottleneck-card"
                >
                  <div class="bottleneck-header">
                    <div class="bottleneck-title">
                      <h5>{{ bottleneck.component }}</h5>
                      <el-tag :type="getBottleneckSeverityType(bottleneck.severity)">
                        {{ bottleneck.severity }}
                      </el-tag>
                    </div>
                    <div class="bottleneck-impact">
                      影响程度: {{ bottleneck.impact }}%
                    </div>
                  </div>

                  <div class="bottleneck-content">
                    <div class="bottleneck-description">
                      <p>{{ bottleneck.description }}</p>
                    </div>

                    <div class="bottleneck-metrics">
                      <div class="metric-item" v-for="metric in bottleneck.metrics" :key="metric.name">
                        <span class="metric-name">{{ metric.name }}:</span>
                        <span class="metric-value" :class="getMetricStatusClass(metric.status)">
                          {{ metric.value }}
                        </span>
                      </div>
                    </div>

                    <div class="optimization-suggestions">
                      <h6>优化建议</h6>
                      <ul>
                        <li v-for="suggestion in bottleneck.suggestions" :key="suggestion">
                          {{ suggestion }}
                        </li>
                      </ul>
                    </div>

                    <div class="bottleneck-actions">
                      <el-button size="small" type="primary" @click="optimizeBottleneck(bottleneck)">
                        自动优化
                      </el-button>
                      <el-button size="small" @click="analyzeBottleneck(bottleneck)">
                        深度分析
                      </el-button>
                      <el-button size="small" @click="monitorBottleneck(bottleneck)">
                        持续监控
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 自动修复系统 -->
        <el-tab-pane label="自动修复" name="auto-fix">
          <div class="auto-fix-workspace">
            <div class="auto-fix-config">
              <h4>自动修复配置</h4>
              <div class="config-grid">
                <div class="config-item">
                  <label>修复策略:</label>
                  <el-select v-model="autoFixConfig.strategy">
                    <el-option label="保守策略" value="conservative" />
                    <el-option label="平衡策略" value="balanced" />
                    <el-option label="积极策略" value="aggressive" />
                  </el-select>
                </div>
                <div class="config-item">
                  <label>修复范围:</label>
                  <el-checkbox-group v-model="autoFixConfig.scope">
                    <el-checkbox label="performance">性能问题</el-checkbox>
                    <el-checkbox label="security">安全漏洞</el-checkbox>
                    <el-checkbox label="compatibility">兼容性问题</el-checkbox>
                    <el-checkbox label="resource">资源使用</el-checkbox>
                  </el-checkbox-group>
                </div>
                <div class="config-item">
                  <label>自动备份:</label>
                  <el-switch v-model="autoFixConfig.createBackup" />
                </div>
                <div class="config-item">
                  <label>回滚机制:</label>
                  <el-switch v-model="autoFixConfig.enableRollback" />
                </div>
              </div>
            </div>

            <div class="fix-history">
              <h4>修复历史记录</h4>
              <div class="history-filters">
                <el-date-picker 
                  v-model="historyDateRange" 
                  type="daterange"
                  placeholder="选择日期范围"
                  size="small"
                />
                <el-select v-model="historyStatusFilter" placeholder="修复状态" size="small">
                  <el-option label="全部" value="" />
                  <el-option label="成功" value="success" />
                  <el-option label="失败" value="failed" />
                  <el-option label="回滚" value="rollback" />
                </el-select>
              </div>

              <div class="history-list">
                <div 
                  v-for="record in filteredFixHistory" 
                  :key="record.id"
                  class="history-item"
                  :class="record.status"
                >
                  <div class="history-header">
                    <div class="history-title">
                      <h6>{{ record.issueType }}</h6>
                      <el-tag :type="getFixStatusType(record.status)">
                        {{ getFixStatusText(record.status) }}
                      </el-tag>
                    </div>
                    <div class="history-time">
                      {{ formatTime(record.timestamp) }}
                    </div>
                  </div>

                  <div class="history-content">
                    <div class="history-description">
                      <p>{{ record.description }}</p>
                    </div>

                    <div class="history-details">
                      <div class="detail-row">
                        <span>修复方法: {{ record.method }}</span>
                        <span>耗时: {{ record.duration }}</span>
                      </div>
                      <div class="detail-row">
                        <span>影响范围: {{ record.scope }}</span>
                        <span>成功率: {{ record.successRate }}%</span>
                      </div>
                    </div>

                    <div class="history-actions">
                      <el-button size="small" @click="viewFixDetails(record)">
                        查看详情
                      </el-button>
                      <el-button 
                        size="small" 
                        v-if="record.status === 'success' && record.canRollback"
                        type="warning"
                        @click="rollbackFix(record)"
                      >
                        回滚修复
                      </el-button>
                      <el-button 
                        size="small" 
                        v-if="record.status === 'failed'"
                        type="primary"
                        @click="retryFix(record)"
                      >
                        重试修复
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 智能优化建议 -->
        <el-tab-pane label="优化建议" name="optimization">
          <div class="optimization-workspace">
            <div class="optimization-overview">
              <div class="optimization-stats">
                <div class="stat-card">
                  <div class="stat-value">{{ optimizationStats.totalSuggestions }}</div>
                  <div class="stat-label">优化建议</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ optimizationStats.implementedCount }}</div>
                  <div class="stat-label">已实施</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ optimizationStats.averageImprovement }}%</div>
                  <div class="stat-label">平均提升</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${{ optimizationStats.costSavings }}</div>
                  <div class="stat-label">成本节省</div>
                </div>
              </div>
            </div>

            <div class="optimization-recommendations">
              <h4>智能优化推荐</h4>
              <div class="recommendations-list">
                <div 
                  v-for="recommendation in optimizationRecommendations" 
                  :key="recommendation.id"
                  class="recommendation-card"
                  :class="recommendation.priority"
                >
                  <div class="recommendation-header">
                    <div class="recommendation-title">
                      <h5>{{ recommendation.title }}</h5>
                      <div class="priority-badge" :class="recommendation.priority">
                        {{ getPriorityText(recommendation.priority) }}
                      </div>
                    </div>
                    <div class="recommendation-impact">
                      <span class="impact-label">预期提升:</span>
                      <span class="impact-value">{{ recommendation.expectedImprovement }}%</span>
                    </div>
                  </div>

                  <div class="recommendation-content">
                    <div class="recommendation-description">
                      <p>{{ recommendation.description }}</p>
                    </div>

                    <div class="recommendation-metrics">
                      <div class="metric-row">
                        <div class="metric-item">
                          <span class="label">实施难度:</span>
                          <span class="value" :class="getDifficultyClass(recommendation.difficulty)">
                            {{ recommendation.difficulty }}
                          </span>
                        </div>
                        <div class="metric-item">
                          <span class="label">预估时间:</span>
                          <span class="value">{{ recommendation.estimatedTime }}</span>
                        </div>
                        <div class="metric-item">
                          <span class="label">资源需求:</span>
                          <span class="value">{{ recommendation.resourceRequirement }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="recommendation-benefits">
                      <h6>预期收益</h6>
                      <div class="benefits-grid">
                        <div 
                          v-for="benefit in recommendation.benefits" 
                          :key="benefit.type"
                          class="benefit-item"
                        >
                          <div class="benefit-type">{{ benefit.type }}</div>
                          <div class="benefit-value">{{ benefit.value }}</div>
                        </div>
                      </div>
                    </div>

                    <div class="recommendation-steps">
                      <h6>实施步骤</h6>
                      <ol class="steps-list">
                        <li v-for="step in recommendation.implementationSteps" :key="step">
                          {{ step }}
                        </li>
                      </ol>
                    </div>

                    <div class="recommendation-actions">
                      <el-button 
                        type="primary" 
                        @click="implementRecommendation(recommendation)"
                        :loading="recommendation.implementing"
                      >
                        {{ recommendation.implementing ? '实施中...' : '立即实施' }}
                      </el-button>
                      <el-button @click="simulateRecommendation(recommendation)">
                        模拟测试
                      </el-button>
                      <el-button @click="scheduleRecommendation(recommendation)">
                        计划实施
                      </el-button>
                      <el-button type="info" @click="getMoreDetails(recommendation)">
                        详细信息
                      </el-button>
                    </div>
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
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Monitor,
  Document,
  Setting,
  ArrowUp,
  ArrowDown,
  Cpu,
  Folder,
  Connection,
  Clock,
  Warning
} from '@element-plus/icons-vue';

// 接口定义
interface PredictedIssue {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  timeToOccurrence: string;
  impactLevel: string;
  impactAssessment: ImpactAssessment[];
  preventiveActions: PreventiveAction[];
}

interface ImpactAssessment {
  area: string;
  level: number;
  description: string;
}

interface PreventiveAction {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  cost: string;
}

interface PerformanceBottleneck {
  id: string;
  component: string;
  severity: string;
  impact: number;
  description: string;
  metrics: BottleneckMetric[];
  suggestions: string[];
}

interface BottleneckMetric {
  name: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
}

interface FixRecord {
  id: string;
  issueType: string;
  description: string;
  status: 'success' | 'failed' | 'rollback';
  timestamp: string;
  method: string;
  duration: string;
  scope: string;
  successRate: number;
  canRollback: boolean;
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedImprovement: number;
  difficulty: string;
  estimatedTime: string;
  resourceRequirement: string;
  benefits: Benefit[];
  implementationSteps: string[];
  implementing?: boolean;
}

interface Benefit {
  type: string;
  value: string;
}

// 状态管理
const activeTab = ref('prediction');
const monitorRunning = ref(false);
const autoMaintenanceEnabled = ref(true);
const predictionRunning = ref(false);
const predictionHorizon = ref('30days');
const riskThreshold = ref(75);

// 系统健康数据
const systemHealth = ref({
  overallScore: 87,
  lastCheck: new Date().toISOString()
});

const healthMetrics = ref([
  {
    name: 'cpu_usage',
    label: 'CPU使用率',
    value: '68%',
    status: 'normal',
    trend: 'positive',
    change: '-5%',
    icon: Cpu
  },
  {
    name: 'memory_usage',
    label: '内存使用',
    value: '4.2GB',
    status: 'warning',
    trend: 'negative',
    change: '+12%',
    icon: Monitor
  },
  {
    name: 'disk_usage',
    label: '磁盘使用',
    value: '78%',
    status: 'normal',
    trend: 'positive',
    change: '-2%',
    icon: Folder
  },
  {
    name: 'network_latency',
    label: '网络延迟',
    value: '45ms',
    status: 'normal',
    trend: 'positive',
    change: '-8%',
    icon: Connection
  }
]);

const predictedIssues = ref<PredictedIssue[]>([
  {
    id: 'issue_1',
    type: '数据库性能下降',
    description: '基于当前的查询负载和数据增长趋势，预测数据库在未来2周内可能出现性能瓶颈',
    severity: 'high',
    probability: 85,
    timeToOccurrence: '14天内',
    impactLevel: '中等',
    impactAssessment: [
      { area: '响应速度', level: 75, description: '查询响应时间可能增加3倍' },
      { area: '用户体验', level: 60, description: '页面加载时间延长' },
      { area: '系统稳定性', level: 40, description: '可能出现间歇性服务中断' }
    ],
    preventiveActions: [
      {
        id: 'action_1',
        title: '数据库索引优化',
        description: '分析查询模式并优化索引结构',
        difficulty: '中等',
        estimatedTime: '4-6小时',
        cost: '低'
      },
      {
        id: 'action_2',
        title: '查询缓存配置',
        description: '配置Redis缓存层以减少数据库压力',
        difficulty: '简单',
        estimatedTime: '2-3小时',
        cost: '低'
      }
    ]
  }
]);

const performanceMetrics = ref([
  {
    id: 'response_time',
    name: '响应时间',
    currentValue: '245ms',
    targetValue: '200ms',
    threshold: '500ms',
    status: 'warning',
    change: '+15'
  },
  {
    id: 'throughput',
    name: '吞吐量',
    currentValue: '1,250 req/s',
    targetValue: '1,500 req/s',
    threshold: '800 req/s',
    status: 'normal',
    change: '+8'
  },
  {
    id: 'error_rate',
    name: '错误率',
    currentValue: '0.15%',
    targetValue: '0.10%',
    threshold: '1.00%',
    status: 'normal',
    change: '-25'
  }
]);

const detectedBottlenecks = ref<PerformanceBottleneck[]>([
  {
    id: 'bottleneck_1',
    component: 'API网关',
    severity: 'medium',
    impact: 35,
    description: 'API网关在高并发情况下出现处理延迟，影响整体响应时间',
    metrics: [
      { name: 'CPU使用率', value: '85%', status: 'warning' },
      { name: '内存使用', value: '78%', status: 'normal' },
      { name: '连接数', value: '450/500', status: 'warning' }
    ],
    suggestions: [
      '增加API网关实例数量',
      '优化路由配置和负载均衡策略',
      '启用请求缓存机制',
      '调整连接池配置'
    ]
  }
]);

const autoFixConfig = ref({
  strategy: 'balanced',
  scope: ['performance', 'security'],
  createBackup: true,
  enableRollback: true
});

const historyDateRange = ref<[Date, Date]>([new Date(), new Date()]);
const historyStatusFilter = ref('');

const fixHistory = ref<FixRecord[]>([
  {
    id: 'fix_1',
    issueType: '内存泄漏修复',
    description: '检测到Node.js进程存在内存泄漏，已自动重启相关服务',
    status: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    method: '自动重启',
    duration: '30秒',
    scope: '后端服务',
    successRate: 100,
    canRollback: false
  },
  {
    id: 'fix_2',
    issueType: '数据库连接优化',
    description: '自动调整数据库连接池配置以提高性能',
    status: 'success',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    method: '配置调整',
    duration: '5分钟',
    scope: '数据库层',
    successRate: 95,
    canRollback: true
  }
]);

const optimizationStats = ref({
  totalSuggestions: 15,
  implementedCount: 8,
  averageImprovement: 23,
  costSavings: 12500
});

const optimizationRecommendations = ref<OptimizationRecommendation[]>([
  {
    id: 'opt_1',
    title: 'API响应缓存优化',
    description: '通过实施智能缓存策略，可以显著减少数据库查询次数并提升API响应速度',
    priority: 'high',
    expectedImprovement: 40,
    difficulty: '中等',
    estimatedTime: '1-2天',
    resourceRequirement: '1名开发人员',
    benefits: [
      { type: '响应速度提升', value: '40%' },
      { type: '数据库负载减少', value: '60%' },
      { type: '用户体验改善', value: '35%' }
    ],
    implementationSteps: [
      '分析API调用模式和数据访问频率',
      '设计缓存键策略和过期策略',
      '实施Redis缓存层',
      '配置缓存预热机制',
      '监控缓存命中率和性能指标'
    ]
  },
  {
    id: 'opt_2',
    title: '数据库查询优化',
    description: '通过分析慢查询日志和执行计划，优化数据库查询性能',
    priority: 'medium',
    expectedImprovement: 25,
    difficulty: '简单',
    estimatedTime: '半天',
    resourceRequirement: '1名DBA',
    benefits: [
      { type: '查询速度提升', value: '25%' },
      { type: 'CPU使用率降低', value: '15%' },
      { type: '并发能力提升', value: '30%' }
    ],
    implementationSteps: [
      '分析慢查询日志',
      '优化查询语句和索引',
      '调整数据库配置参数',
      '测试优化效果'
    ]
  }
]);

// 计算属性
const filteredFixHistory = computed(() => {
  let filtered = fixHistory.value;
  
  if (historyStatusFilter.value) {
    filtered = filtered.filter(record => record.status === historyStatusFilter.value);
  }
  
  return filtered;
});

// 预测性维护核心功能
const usePredictiveMaintenance = () => {
  // 系统监控分析
  const performSystemMonitorAnalysis = async () => {
    try {
      monitorRunning.value = true;
      
      // 模拟系统监控过程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 更新系统指标
      systemHealth.value.overallScore = 85 + Math.floor(Math.random() * 10);
      systemHealth.value.lastCheck = new Date().toISOString();
      
      ElMessage.success('系统监控完成');
      return {
        success: true,
        data: systemHealth.value
      };
      
    } catch (error) {
      console.error('System monitor analysis failed:', error);
      ElMessage.error('系统监控失败');
    } finally {
      monitorRunning.value = false;
    }
  };

  // 性能瓶颈预测
  const predictPerformanceBottlenecks = async () => {
    try {
      predictionRunning.value = true;
      
      // 模拟预测过程
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // 生成新的预测问题
      const newIssue: PredictedIssue = {
        id: `issue_${Date.now()}`,
        type: '存储空间不足',
        description: '根据当前数据增长趋势，预测存储空间将在30天内达到95%使用率',
        severity: 'medium',
        probability: 78,
        timeToOccurrence: '30天内',
        impactLevel: '中等',
        impactAssessment: [
          { area: '数据写入', level: 80, description: '可能无法写入新数据' },
          { area: '备份操作', level: 90, description: '备份操作可能失败' }
        ],
        preventiveActions: [
          {
            id: 'action_storage_1',
            title: '清理历史数据',
            description: '清理过期的日志和临时文件',
            difficulty: '简单',
            estimatedTime: '1-2小时',
            cost: '无'
          }
        ]
      };
      
      predictedIssues.value.push(newIssue);
      
      ElMessage.success('性能瓶颈预测完成');
      return {
        success: true,
        data: { bottleneckPredictions: detectedBottlenecks.value }
      };
      
    } catch (error) {
      console.error('Bottleneck prediction failed:', error);
      ElMessage.error('瓶颈预测失败');
    } finally {
      predictionRunning.value = false;
    }
  };

  // 自动修复系统
  const implementAutomaticFixes = async (issueId: string) => {
    try {
      console.log(`实施自动修复: ${issueId}`);
      
      // 模拟自动修复过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 创建修复记录
      const fixRecord: FixRecord = {
        id: `fix_${Date.now()}`,
        issueType: '自动性能优化',
        description: '系统自动检测并修复了性能问题',
        status: 'success',
        timestamp: new Date().toISOString(),
        method: '自动调优',
        duration: '2分钟',
        scope: '全系统',
        successRate: 95,
        canRollback: true
      };
      
      fixHistory.value.unshift(fixRecord);
      
      ElMessage.success('自动修复已应用');
      
    } catch (error) {
      ElMessage.error('自动修复失败');
      console.error('Auto-fix failed:', error);
    }
  };

  return {
    performSystemMonitorAnalysis,
    predictPerformanceBottlenecks,
    implementAutomaticFixes
  };
};

const { 
  performSystemMonitorAnalysis, 
  predictPerformanceBottlenecks, 
  implementAutomaticFixes 
} = usePredictiveMaintenance();

// 界面交互方法
const startSystemMonitor = async () => {
  await performSystemMonitorAnalysis();
};

const generateOptimizationReport = () => {
  ElMessage.success('正在生成优化报告...');
  setTimeout(() => {
    ElMessage.success('优化报告生成完成');
  }, 2000);
};

const enableAutoMaintenance = () => {
  autoMaintenanceEnabled.value = !autoMaintenanceEnabled.value;
  ElMessage.success(`自动维护已${autoMaintenanceEnabled.value ? '启用' : '禁用'}`);
};

const runPredictionAnalysis = async () => {
  await predictPerformanceBottlenecks();
};

const implementAction = async (action: PreventiveAction) => {
  try {
    await ElMessageBox.confirm(
      `确定要执行预防性措施"${action.title}"吗？`,
      '确认执行',
      { type: 'warning' }
    );
    
    ElMessage.success('预防性措施执行中...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    ElMessage.success('预防性措施执行完成');
    
  } catch {
    // 用户取消
  }
};

const scheduleAction = (action: PreventiveAction) => {
  ElMessage.info(`已将"${action.title}"加入执行计划`);
};

const optimizeBottleneck = async (bottleneck: PerformanceBottleneck) => {
  ElMessage.info(`正在优化${bottleneck.component}...`);
  await new Promise(resolve => setTimeout(resolve, 3000));
  ElMessage.success('优化完成');
};

const analyzeBottleneck = (bottleneck: PerformanceBottleneck) => {
  ElMessage.info(`正在深度分析${bottleneck.component}...`);
};

const monitorBottleneck = (bottleneck: PerformanceBottleneck) => {
  ElMessage.info(`已为${bottleneck.component}启用持续监控`);
};

const viewFixDetails = (record: FixRecord) => {
  ElMessage.info(`查看修复详情: ${record.issueType}`);
};

const rollbackFix = async (record: FixRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要回滚修复"${record.issueType}"吗？`,
      '确认回滚',
      { type: 'warning' }
    );
    
    ElMessage.info('正在回滚修复...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    ElMessage.success('修复已回滚');
    
  } catch {
    // 用户取消
  }
};

const retryFix = async (record: FixRecord) => {
  ElMessage.info(`重试修复: ${record.issueType}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  ElMessage.success('修复重试成功');
};

const implementRecommendation = async (recommendation: OptimizationRecommendation) => {
  try {
    recommendation.implementing = true;
    
    await ElMessageBox.confirm(
      `确定要实施优化建议"${recommendation.title}"吗？`,
      '确认实施',
      { type: 'warning' }
    );
    
    // 模拟实施过程
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    optimizationStats.value.implementedCount++;
    ElMessage.success('优化建议实施成功');
    
  } catch {
    // 用户取消
  } finally {
    recommendation.implementing = false;
  }
};

const simulateRecommendation = (recommendation: OptimizationRecommendation) => {
  ElMessage.info(`正在模拟测试"${recommendation.title}"...`);
  setTimeout(() => {
    ElMessage.success('模拟测试完成，预期效果良好');
  }, 2000);
};

const scheduleRecommendation = (recommendation: OptimizationRecommendation) => {
  ElMessage.info(`已将"${recommendation.title}"加入实施计划`);
};

const getMoreDetails = (recommendation: OptimizationRecommendation) => {
  ElMessage.info(`查看"${recommendation.title}"的详细信息`);
};

// 辅助方法
const getHealthColor = (score: number) => {
  if (score >= 90) return 'var(--el-color-success)';
  if (score >= 70) return 'var(--el-color-warning)';
  return 'var(--el-color-danger)';
};

const getHealthStatus = (score: number) => {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
};

const getHealthStatusText = (score: number) => {
  const statusMap = {
    excellent: '优秀',
    good: '良好',
    warning: '警告',
    critical: '危险'
  };
  return statusMap[getHealthStatus(score)];
};

const getTrendIcon = (trend: string) => {
  return trend === 'positive' ? ArrowUp : ArrowDown;
};

const getSeverityTagType = (severity: string) => {
  const typeMap = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  };
  return typeMap[severity] || 'info';
};

const getSeverityText = (severity: string) => {
  const textMap = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  };
  return textMap[severity] || severity;
};

const getImpactClass = (level: string) => {
  const classMap = {
    '低': 'low-impact',
    '中等': 'medium-impact',
    '高': 'high-impact'
  };
  return classMap[level] || 'medium-impact';
};

const getImpactColor = (level: number) => {
  if (level <= 30) return 'var(--el-color-success)';
  if (level <= 60) return 'var(--el-color-warning)';
  return 'var(--el-color-danger)';
};

const getPerformanceStatus = (status: string) => {
  const statusMap = {
    normal: '正常',
    warning: '警告',
    critical: '严重'
  };
  return statusMap[status] || status;
};

const getBottleneckSeverityType = (severity: string) => {
  const typeMap = {
    low: 'success',
    medium: 'warning',
    high: 'danger'
  };
  return typeMap[severity] || 'info';
};

const getMetricStatusClass = (status: string) => {
  const classMap = {
    normal: 'metric-normal',
    warning: 'metric-warning',
    critical: 'metric-critical'
  };
  return classMap[status] || 'metric-normal';
};

const getFixStatusType = (status: string) => {
  const typeMap = {
    success: 'success',
    failed: 'danger',
    rollback: 'warning'
  };
  return typeMap[status] || 'info';
};

const getFixStatusText = (status: string) => {
  const textMap = {
    success: '成功',
    failed: '失败',
    rollback: '已回滚'
  };
  return textMap[status] || status;
};

const getPriorityText = (priority: string) => {
  const textMap = {
    low: '低优先级',
    medium: '中优先级',
    high: '高优先级',
    critical: '紧急'
  };
  return textMap[priority] || priority;
};

const getDifficultyClass = (difficulty: string) => {
  const classMap = {
    '简单': 'difficulty-easy',
    '中等': 'difficulty-medium',
    '困难': 'difficulty-hard'
  };
  return classMap[difficulty] || 'difficulty-medium';
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

// 组件生命周期
onMounted(() => {
  console.log('预测性维护系统初始化完成');
});
</script>

<style scoped lang="scss">
.predictive-maintenance-container {
  padding: var(--spacing-lg);
  min-height: 100vh;
  background: var(--bg-page);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--text-xs);
  box-shadow: var(--shadow-md);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--text-xs);
}

.health-overview {
  display: flex;
  gap: var(--text-2xl);
  margin-bottom: var(--text-3xl);
}

.health-score-card {
  display: flex;
  align-items: center;
  gap: var(--text-2xl);
  padding: var(--text-2xl);
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  min-width: 100%; max-width: 320px;
}

.score-info {
  h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-item {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  
  .label {
    color: #86909c;
  }
  
  .value {
    color: #1d2129;
    font-weight: 500;
    
    &.excellent { color: var(--success-color); }
    &.good { color: var(--primary-color); }
    &.warning { color: var(--warning-color); }
    &.critical { color: var(--danger-color); }
  }
}

.health-metrics {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-base);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--text-base);
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.metric-icon {
  width: var(--icon-size); height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-size: var(--text-2xl);
  
  &.normal {
    background: #f0f9ff;
    color: #0369a1;
  }
  
  &.warning {
    background: #fefce8;
    color: #ca8a04;
  }
  
  &.critical {
    background: #fef2f2;
    color: #dc2626;
  }
}

.metric-info {
  flex: 1;
  
  .metric-value {
    font-size: var(--text-lg);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--spacing-xs);
  }
  
  .metric-label {
    font-size: var(--text-xs);
    color: #86909c;
    margin-bottom: var(--spacing-sm);
  }
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 500;
  
  &.positive {
    color: #00b42a;
  }
  
  &.negative {
    color: #f53f3f;
  }
}

.main-content {
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.prediction-workspace,
.performance-workspace,
.auto-fix-workspace,
.optimization-workspace {
  padding: var(--spacing-lg);
}

.prediction-controls,
.flow-controls {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding: var(--text-base);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  label {
    font-size: var(--text-xs);
    color: #86909c;
    min-width: auto;
  }
}

.predicted-issues {
  margin-bottom: var(--text-3xl);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
}

.issue-card {
  background: var(--bg-gray-light);
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--text-xs);
  padding: var(--spacing-lg);
  
  &.high {
    border-left: var(--spacing-xs) solid var(--danger-color);
  }
  
  &.medium {
    border-left: var(--spacing-xs) solid var(--warning-color);
  }
  
  &.low {
    border-left: var(--spacing-xs) solid var(--success-color);
  }
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
}

.issue-title {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  
  h5 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.issue-probability {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  
  .label {
    color: #86909c;
  }
  
  .value {
    color: #1d2129;
    font-weight: 600;
  }
}

.issue-content {
  .issue-description {
    margin-bottom: var(--text-lg);
    
    p {
      font-size: var(--text-sm);
      line-height: 1.6;
      color: #4e5969;
      margin: 0;
    }
  }
}

.issue-timeline {
  display: flex;
  gap: var(--text-2xl);
  margin-bottom: var(--text-lg);
  font-size: var(--text-sm);
}

.timeline-item {
  .label {
    color: #86909c;
    margin-right: var(--spacing-sm);
  }
  
  .value {
    color: #1d2129;
    font-weight: 500;
  }
}

.impact-assessment {
  margin-bottom: var(--text-lg);
  
  h6 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-xs);
}

.impact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--text-sm);
  background: white;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
}

.impact-area {
  color: #1d2129;
  font-weight: 500;
}

.impact-level {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-max-width: 100px; width: 100%;
}

.impact-value {
  font-size: var(--text-xs);
  color: #86909c;
}

.preventive-actions {
  h6 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-xs);
  background: white;
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid #e5e6eb;
}

.action-content {
  flex: 1;
  
  .action-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--spacing-xs);
  }
  
  .action-description {
    font-size: var(--text-xs);
    color: #4e5969;
    margin-bottom: var(--spacing-sm);
  }
  
  .action-meta {
    display: flex;
    gap: var(--text-base);
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.action-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.prediction-charts,
.performance-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.chart-container {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-base);
  
  h4 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.chart {
  min-min-height: 60px; height: auto; height: auto;
  background: white;
  border-radius: var(--spacing-xs);
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--text-base);
  margin-bottom: var(--text-3xl);
}

.performance-metrics .metric-card {
  flex-direction: column;
  align-items: stretch;
  gap: var(--text-xs);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.metric-status {
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 500;
  
  &.normal {
    background: #f0f9ff;
    color: #0369a1;
  }
  
  &.warning {
    background: #fefce8;
    color: #ca8a04;
  }
  
  &.critical {
    background: #fef2f2;
    color: #dc2626;
  }
}

.metric-chart {
  height: 60px;
}

.chart-mini {
  width: 100%;
  height: 100%;
  background: var(--bg-gray-light);
  border-radius: var(--spacing-xs);
}

.metric-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  color: #86909c;
}

.bottleneck-detection {
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.bottlenecks-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
}

.bottleneck-card {
  background: var(--bg-gray-light);
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--text-xs);
  padding: var(--spacing-lg);
}

.bottleneck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
}

.bottleneck-title {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  
  h5 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.bottleneck-impact {
  font-size: var(--text-sm);
  color: #86909c;
}

.bottleneck-content {
  .bottleneck-description {
    margin-bottom: var(--text-lg);
    
    p {
      font-size: var(--text-sm);
      line-height: 1.6;
      color: #4e5969;
      margin: 0;
    }
  }
}

.bottleneck-metrics {
  display: flex;
  gap: var(--text-base);
  margin-bottom: var(--text-lg);
  font-size: var(--text-xs);
}

.metric-item {
  .metric-name {
    color: #86909c;
    margin-right: var(--spacing-xs);
  }
  
  .metric-value {
    color: #1d2129;
    font-weight: 500;
    
    &.metric-normal { color: var(--success-color); }
    &.metric-warning { color: var(--warning-color); }
    &.metric-critical { color: var(--danger-color); }
  }
}

.optimization-suggestions {
  margin-bottom: var(--text-lg);
  
  h6 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--spacing-sm);
  }
  
  ul {
    margin: 0;
    padding-left: var(--text-lg);
    
    li {
      font-size: var(--text-sm);
      color: #4e5969;
      margin-bottom: var(--spacing-xs);
    }
  }
}

.bottleneck-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.auto-fix-config {
  margin-bottom: var(--text-3xl);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-base);
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  
  label {
    font-size: var(--text-xs);
    color: #86909c;
    font-weight: 500;
  }
}

.fix-history {
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.history-filters {
  display: flex;
  gap: var(--text-xs);
  margin-bottom: var(--text-lg);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.history-item {
  background: var(--bg-gray-light);
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--spacing-sm);
  padding: var(--text-base);
  
  &.success {
    border-left: var(--spacing-xs) solid var(--success-color);
  }
  
  &.failed {
    border-left: var(--spacing-xs) solid var(--danger-color);
  }
  
  &.rollback {
    border-left: var(--spacing-xs) solid var(--warning-color);
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.history-title {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  
  h6 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.history-time {
  font-size: var(--text-xs);
  color: #86909c;
}

.history-content {
  .history-description {
    margin-bottom: var(--text-sm);
    
    p {
      font-size: var(--text-sm);
      color: #4e5969;
      margin: 0;
    }
  }
}

.history-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--text-sm);
  font-size: var(--text-xs);
}

.history-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.optimization-overview {
  margin-bottom: var(--text-3xl);
}

.optimization-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--text-base);
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

.optimization-recommendations {
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.recommendation-card {
  background: white;
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--text-xs);
  padding: var(--text-2xl);
  
  &.high {
    border-left: var(--spacing-xs) solid var(--danger-color);
  }
  
  &.medium {
    border-left: var(--spacing-xs) solid var(--warning-color);
  }
  
  &.low {
    border-left: var(--spacing-xs) solid var(--success-color);
  }
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
}

.recommendation-title {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  
  h5 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.priority-badge {
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

.recommendation-impact {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  
  .impact-label {
    color: #86909c;
  }
  
  .impact-value {
    color: #00b42a;
    font-weight: 600;
  }
}

.recommendation-content {
  .recommendation-description {
    margin-bottom: var(--text-lg);
    
    p {
      font-size: var(--text-sm);
      line-height: 1.6;
      color: #4e5969;
      margin: 0;
    }
  }
}

.recommendation-metrics {
  margin-bottom: var(--text-lg);
}

.metric-row {
  display: flex;
  gap: var(--text-2xl);
}

.metric-row .metric-item {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  
  .label {
    color: #86909c;
  }
  
  .value {
    color: #1d2129;
    font-weight: 500;
    
    &.difficulty-easy { color: var(--success-color); }
    &.difficulty-medium { color: var(--warning-color); }
    &.difficulty-hard { color: var(--danger-color); }
  }
}

.recommendation-benefits {
  margin-bottom: var(--text-lg);
  
  h6 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--spacing-sm);
  }
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-sm);
}

.benefit-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-sm);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  
  .benefit-type {
    color: #86909c;
  }
  
  .benefit-value {
    color: #00b42a;
    font-weight: 500;
  }
}

.recommendation-steps {
  margin-bottom: var(--text-lg);
  
  h6 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--spacing-sm);
  }
}

.steps-list {
  margin: 0;
  padding-left: var(--text-lg);
  
  li {
    font-size: var(--text-sm);
    color: #4e5969;
    margin-bottom: var(--spacing-xs);
  }
}

.recommendation-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

@media (max-width: var(--breakpoint-md)) {
  .health-overview {
    flex-direction: column;
  }
  
  .health-metrics {
    grid-template-columns: 1fr;
  }
  
  .prediction-controls,
  .flow-controls {
    flex-direction: column;
    gap: var(--text-xs);
  }
  
  .prediction-charts,
  .performance-overview {
    grid-template-columns: 1fr;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .optimization-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metric-row {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .recommendation-actions {
    flex-direction: column;
  }
}
</style>