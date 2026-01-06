<template>
  <div class="automated-follow-up-container">
    <div class="header">
      <h2>智能自动化跟进系统</h2>
      <p class="subtitle">AI驱动的个性化跟进策略，自动化覆盖率达90%</p>
    </div>

    <!-- 系统控制台 -->
    <div class="system-dashboard">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <h3>跟进系统控制台</h3>
            <div class="header-actions">
              <el-button type="primary" @click="refreshFollowUpQueue">
                <UnifiedIcon name="Refresh" />
                刷新队列
              </el-button>
              <el-button @click="toggleAutomation" :type="automationEnabled ? 'danger' : 'success'">
                <UnifiedIcon name="default" />
                {{ automationEnabled ? '暂停自动化' : '启动自动化' }}
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-value">{{ followUpQueue.length }}</div>
            <div class="stat-label">待跟进</div>
            <div class="stat-icon pending"><UnifiedIcon name="default" /></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ todayCompletedCount }}</div>
            <div class="stat-label">今日完成</div>
            <div class="stat-icon completed"><UnifiedIcon name="Check" /></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ automationCoverage }}%</div>
            <div class="stat-label">自动化覆盖率</div>
            <div class="stat-icon automation"><UnifiedIcon name="default" /></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ avgResponseRate }}%</div>
            <div class="stat-label">平均响应率</div>
            <div class="stat-icon response"><UnifiedIcon name="default" /></div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 跟进队列 -->
    <div class="follow-up-queue">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <h3>智能跟进队列</h3>
            <div class="header-controls">
              <el-select v-model="queueFilter" placeholder="筛选条件" style="max-width: 150px; width: 100%;">
                <el-option label="全部" value="all" />
                <el-option label="高优先级" value="high" />
                <el-option label="中优先级" value="medium" />
                <el-option label="低优先级" value="low" />
                <el-option label="今日待处理" value="today" />
              </el-select>
            </div>
          </div>
        </template>
        
        <div class="queue-timeline">
          <div 
            v-for="(followUp, index) in filteredFollowUpQueue" 
            :key="followUp.leadId"
            class="follow-up-item"
            :class="{ 'urgent': followUp.priority === 'high', 'due-soon': isDueSoon(followUp.scheduledTime) }"
          >
            <div class="timeline-marker" :class="followUp.priority">
              <UnifiedIcon name="default" />
            </div>
            
            <div class="follow-up-content">
              <div class="follow-up-header">
                <div class="lead-info">
                  <h4>{{ followUp.leadName }}</h4>
                  <div class="lead-details">
                    <span class="lead-stage">{{ followUp.stage.name }}</span>
                    <span class="lead-phone">{{ followUp.leadPhone }}</span>
                  </div>
                </div>
                <div class="follow-up-time">
                  <div class="scheduled-time">
                    <UnifiedIcon name="default" />
                    {{ formatTime(followUp.scheduledTime) }}
                  </div>
                  <div class="time-remaining" :class="{ 'overdue': isOverdue(followUp.scheduledTime) }">
                    {{ getTimeRemaining(followUp.scheduledTime) }}
                  </div>
                </div>
              </div>
              
              <div class="follow-up-body">
                <div class="lead-progress">
                  <div class="progress-info">
                    <span class="progress-label">跟进进度</span>
                    <span class="progress-percentage">{{ followUp.stage.progress }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: followUp.stage.progress + '%' }"></div>
                  </div>
                  <div class="stage-info">
                    <span class="time-in-stage">停留 {{ followUp.stage.timeInStage }} 天</span>
                    <span class="exit-risk" :class="getRiskLevel(followUp.stage.exitRisk)">
                      流失风险: {{ followUp.stage.exitRisk }}%
                    </span>
                  </div>
                </div>
                
                <div class="next-action">
                  <div class="action-info">
                    <div class="action-title">
                      <UnifiedIcon name="default" />
                      {{ followUp.nextAction.title }}
                    </div>
                    <div class="action-channel">
                      通过 {{ followUp.channel.name }} 联系
                    </div>
                  </div>
                  <div class="action-description">
                    {{ followUp.nextAction.description }}
                  </div>
                </div>
                
                <div class="personalized-message">
                  <h5>个性化消息预览</h5>
                  <div class="message-content">
                    {{ followUp.personalizedMessage }}
                  </div>
                  <div class="message-metadata">
                    <span class="personalization-score">个性化程度: {{ followUp.personalizationScore }}%</span>
                    <span class="expected-response">预期响应率: {{ followUp.expectedResponseRate }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="follow-up-actions">
                <el-button size="small" type="primary" @click="executeFollowUp(followUp)">
                  <UnifiedIcon name="default" />
                  立即执行
                </el-button>
                <el-button size="small" @click="editMessage(followUp)">
                  <UnifiedIcon name="Edit" />
                  编辑消息
                </el-button>
                <el-button size="small" @click="reschedule(followUp)">
                  <UnifiedIcon name="default" />
                  重新安排
                </el-button>
                <el-button size="small" type="info" @click="viewLeadHistory(followUp)">
                  <UnifiedIcon name="default" />
                  查看历史
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="filteredFollowUpQueue.length === 0" class="empty-queue">
          <el-empty description="暂无待跟进的客户" />
        </div>
      </el-card>
    </div>

    <!-- 自动化规则管理 -->
    <div class="automation-rules">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <h3>自动化规则管理</h3>
            <el-button type="primary" @click="showCreateRuleDialog">
              <UnifiedIcon name="Plus" />
              创建规则
            </el-button>
          </div>
        </template>
        
        <div class="rules-grid">
          <div 
            v-for="rule in automationRules" 
            :key="rule.id"
            class="rule-card"
            :class="{ 'disabled': !rule.enabled }"
          >
            <div class="rule-header">
              <div class="rule-info">
                <h4>{{ rule.name }}</h4>
                <div class="rule-trigger">
                  触发条件: {{ rule.trigger.description }}
                </div>
              </div>
              <el-switch v-model="rule.enabled" @change="toggleRule(rule)" />
            </div>
            
            <div class="rule-body">
              <div class="rule-conditions">
                <h5>执行条件</h5>
                <ul class="conditions-list">
                  <li v-for="condition in rule.conditions" :key="condition.id">
                    {{ condition.description }}
                  </li>
                </ul>
              </div>
              
              <div class="rule-actions">
                <h5>执行动作</h5>
                <div class="actions-list">
                  <div v-for="action in rule.actions" :key="action.id" class="action-item">
                    <div class="action-icon">
                      <UnifiedIcon name="default" />
                    </div>
                    <div class="action-details">
                      <span class="action-name">{{ action.name }}</span>
                      <span class="action-description">{{ action.description }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="rule-stats">
              <div class="stat">
                <span class="stat-label">触发次数</span>
                <span class="stat-value">{{ rule.triggerCount }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">成功率</span>
                <span class="stat-value">{{ rule.successRate }}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">平均响应时间</span>
                <span class="stat-value">{{ rule.avgResponseTime }}</span>
              </div>
            </div>
            
            <div class="rule-actions-buttons">
              <el-button size="small" @click="editRule(rule)">编辑</el-button>
              <el-button size="small" @click="duplicateRule(rule)">复制</el-button>
              <el-button size="small" type="danger" @click="deleteRule(rule)">删除</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 智能分析报告 -->
    <div class="analytics-report">
      <el-card shadow="never">
        <template #header>
          <h3>跟进效果分析</h3>
        </template>
        
        <div class="analytics-grid">
          <div class="chart-container">
            <h4>跟进响应率趋势</h4>
            <div ref="responseRateChart" class="chart"></div>
          </div>
          
          <div class="chart-container">
            <h4>最佳联系时间分析</h4>
            <div ref="contactTimeChart" class="chart"></div>
          </div>
          
          <div class="insights-panel">
            <h4>AI洞察建议</h4>
            <div class="insights-list">
              <div v-for="insight in aiInsights" :key="insight.id" class="insight-item">
                <div class="insight-icon" :class="insight.type">
                  <UnifiedIcon name="default" />
                </div>
                <div class="insight-content">
                  <h5>{{ insight.title }}</h5>
                  <p>{{ insight.description }}</p>
                  <div class="insight-impact">
                    预期影响: {{ insight.expectedImpact }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建规则对话框 -->
    <el-dialog v-model="createRuleDialogVisible" title="创建自动化规则" width="600px">
      <el-form :model="newRuleForm" label-width="120px">
        <el-form-item label="规则名称">
          <el-input v-model="newRuleForm.name" placeholder="输入规则名称" />
        </el-form-item>
        <el-form-item label="触发条件">
          <el-select v-model="newRuleForm.trigger" placeholder="选择触发条件">
            <el-option label="客户进入特定阶段" value="stage_enter" />
            <el-option label="超过指定时间未响应" value="no_response_timeout" />
            <el-option label="客户完成特定行为" value="behavior_trigger" />
            <el-option label="风险评分达到阈值" value="risk_threshold" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行动作">
          <el-checkbox-group v-model="newRuleForm.actions">
            <el-checkbox label="send_personalized_message">发送个性化消息</el-checkbox>
            <el-checkbox label="schedule_call">安排电话回访</el-checkbox>
            <el-checkbox label="assign_to_agent">分配给专员</el-checkbox>
            <el-checkbox label="update_priority">更新优先级</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="执行延迟">
          <el-input-number v-model="newRuleForm.delay" :min="0" :max="72" /> 小时
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createRuleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createNewRule">创建规则</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  nextTick } from 'vue'; import { ElMessage,
  ElMessageBox } from 'element-plus'; import { Refresh,
  VideoPlay,
  VideoPause,
  Clock,
  CircleCheck,
  Operation,
  MessageBox,
  Promotion,
  Edit,
  Calendar,
  Document,
  Plus,
  Warning,
  TrendCharts,
  Star,
  Phone,
  Message,
  User,
  Notification
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getSuccessColor } from '@/utils/color-tokens';

// 类型定义
interface LeadStage {
  name: string;
  progress: number;
  timeInStage: number;
  typicalDuration: number;
  nextStages: string[];
  exitRisk: number;
}

interface FollowUpAction {
  type: string;
  title: string;
  description: string;
}

interface CommunicationChannel {
  name: string;
  type: string;
  effectiveness: number;
}

interface AutomatedFollowUp {
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

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: string;
    description: string;
  };
  conditions: Array<{
    id: string;
    description: string;
  }>;
  actions: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
  }>;
  triggerCount: number;
  successRate: number;
  avgResponseTime: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'success';
  expectedImpact: string;
}

// 响应式数据
const automationEnabled = ref(true);
const followUpQueue = ref<AutomatedFollowUp[]>([]);
const automationRules = ref<AutomationRule[]>([]);
const aiInsights = ref<AIInsight[]>([]);
const queueFilter = ref('all');
const createRuleDialogVisible = ref(false);

const todayCompletedCount = ref(28);
const automationCoverage = ref(92);
const avgResponseRate = ref(76);

const responseRateChart = ref<HTMLElement>();
const contactTimeChart = ref<HTMLElement>();

const newRuleForm = ref({
  name: '',
  trigger: '',
  actions: [],
  delay: 0
});

// 计算属性
const filteredFollowUpQueue = computed(() => {
  if (queueFilter.value === 'all') return followUpQueue.value;
  if (queueFilter.value === 'today') {
    const today = new Date().toDateString();
    return followUpQueue.value.filter(item => 
      new Date(item.scheduledTime).toDateString() === today
    );
  }
  return followUpQueue.value.filter(item => item.priority === queueFilter.value);
});

// 智能跟进调度
const scheduleIntelligentFollowUp = async (leadId: string) => {
  try {
    // 模拟AI跟进调度API
    const mockResponse = await mockIntelligentFollowUpAPI(leadId);
    
    if (mockResponse.success) {
      const followUp = mockResponse.data.followUpPlan;
      followUpQueue.value.push(followUp);
      return followUp;
    }
  } catch (error) {
    console.error('Follow-up scheduling failed:', error);
    ElMessage.error('跟进调度失败，请重试');
  }
};

// 模拟AI跟进调度API
const mockIntelligentFollowUpAPI = async (leadId: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 生成模拟跟进数据
  const mockFollowUp: AutomatedFollowUp = {
    leadId,
    leadName: '张女士',
    leadPhone: '138****5678',
    stage: {
      name: '咨询阶段',
      progress: 45,
      timeInStage: 3,
      typicalDuration: 7,
      nextStages: ['预约参观', '深度咨询'],
      exitRisk: 25
    },
    nextAction: {
      type: 'call',
      title: '电话回访',
      description: '了解具体需求，解答疑问'
    },
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2小时后
    personalizedMessage: '张女士您好，感谢您对我们幼儿园的关注。根据您之前咨询的情况，我为您准备了一些针对3-4岁孩子的特色课程介绍，方便时可以详细沟通一下吗？',
    channel: {
      name: '电话',
      type: 'phone',
      effectiveness: 85
    },
    priority: 'high',
    expectedOutcome: '预约参观',
    personalizationScore: 94,
    expectedResponseRate: 78
  };
  
  return {
    success: true,
    data: { followUpPlan: mockFollowUp }
  };
};

// 初始化模拟数据
const initializeMockData = () => {
  // 模拟跟进队列数据
  followUpQueue.value = [
    {
      leadId: 'lead1',
      leadName: '王女士',
      leadPhone: '138****1234',
      stage: {
        name: '初步了解',
        progress: 20,
        timeInStage: 1,
        typicalDuration: 3,
        nextStages: ['深度咨询'],
        exitRisk: 15
      },
      nextAction: {
        type: 'message',
        title: '发送资料',
        description: '发送幼儿园介绍资料'
      },
      scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30分钟后
      personalizedMessage: '王女士您好，根据您对蒙氏教育的兴趣，我为您准备了我们幼儿园的蒙氏课程详细介绍...',
      channel: { name: '微信', type: 'wechat', effectiveness: 75 },
      priority: 'high',
      expectedOutcome: '预约咨询',
      personalizationScore: 89,
      expectedResponseRate: 72
    },
    {
      leadId: 'lead2',
      leadName: '李先生',
      leadPhone: '139****5678',
      stage: {
        name: '咨询阶段',
        progress: 60,
        timeInStage: 5,
        typicalDuration: 7,
        nextStages: ['预约参观'],
        exitRisk: 35
      },
      nextAction: {
        type: 'call',
        title: '电话回访',
        description: '确认参观时间'
      },
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2小时后
      personalizedMessage: '李先生您好，上次您提到想了解我们的双语课程，现在方便安排时间来园参观吗？',
      channel: { name: '电话', type: 'phone', effectiveness: 85 },
      priority: 'medium',
      expectedOutcome: '预约参观',
      personalizationScore: 91,
      expectedResponseRate: 68
    },
    {
      leadId: 'lead3',
      leadName: '陈女士',
      leadPhone: '137****9012',
      stage: {
        name: '参观阶段',
        progress: 85,
        timeInStage: 2,
        typicalDuration: 5,
        nextStages: ['确认报名'],
        exitRisk: 20
      },
      nextAction: {
        type: 'email',
        title: '发送报名表',
        description: '提供报名表和优惠信息'
      },
      scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4小时后
      personalizedMessage: '陈女士您好，昨天参观后您对我们的环境很满意，现在为您提供专属的报名优惠...',
      channel: { name: '邮件', type: 'email', effectiveness: 65 },
      priority: 'low',
      expectedOutcome: '确认报名',
      personalizationScore: 95,
      expectedResponseRate: 85
    }
  ];

  // 模拟自动化规则数据
  automationRules.value = [
    {
      id: 'rule1',
      name: '新客户欢迎流程',
      enabled: true,
      trigger: {
        type: 'stage_enter',
        description: '客户进入初步了解阶段'
      },
      conditions: [
        { id: 'cond1', description: '首次咨询后1小时内' },
        { id: 'cond2', description: '未接到回访电话' }
      ],
      actions: [
        {
          id: 'act1',
          type: 'send_message',
          name: '发送欢迎消息',
          description: '自动发送个性化欢迎消息和基础资料'
        }
      ],
      triggerCount: 45,
      successRate: 78,
      avgResponseTime: '15分钟'
    },
    {
      id: 'rule2',
      name: '高风险客户挽回',
      enabled: true,
      trigger: {
        type: 'risk_threshold',
        description: '流失风险超过60%'
      },
      conditions: [
        { id: 'cond3', description: '超过7天未响应' },
        { id: 'cond4', description: '之前有过积极互动' }
      ],
      actions: [
        {
          id: 'act2',
          type: 'assign_to_agent',
          name: '分配给资深顾问',
          description: '立即分配给经验丰富的招生顾问'
        },
        {
          id: 'act3',
          type: 'schedule_call',
          name: '安排回访电话',
          description: '在最佳时间安排个性化回访'
        }
      ],
      triggerCount: 12,
      successRate: 65,
      avgResponseTime: '30分钟'
    }
  ];

  // 模拟AI洞察数据
  aiInsights.value = [
    {
      id: 'insight1',
      title: '周二下午2-4点响应率最高',
      description: '数据显示，周二下午2-4点是客户响应率最高的时间段，建议将重要跟进安排在此时间。',
      type: 'opportunity',
      expectedImpact: '提升响应率15%'
    },
    {
      id: 'insight2',
      title: '咨询阶段停留时间过长',
      description: '客户在咨询阶段平均停留8.5天，超过正常水平，建议优化咨询流程。',
      type: 'warning',
      expectedImpact: '减少流失率20%'
    },
    {
      id: 'insight3',
      title: '个性化消息效果显著',
      description: '包含孩子年龄和兴趣信息的个性化消息比标准消息响应率高35%。',
      type: 'success',
      expectedImpact: '提升转化率35%'
    }
  ];
};

// 渲染图表
const renderCharts = async () => {
  await nextTick();
  
  // 响应率趋势图
  if (responseRateChart.value) {
    const chart1 = echarts.init(responseRateChart.value);
    const option1 = {
      title: { text: '最近7天响应率', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [{
        data: [68, 85, 72, 78, 65, 58, 62],
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(64, 158, 255, 0.2)' }
      }]
    };
    chart1.setOption(option1);
  }
  
  // 最佳联系时间图
  if (contactTimeChart.value) {
    const chart2 = echarts.init(contactTimeChart.value);
    const option2 = {
      title: { text: '24小时响应率分布', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: Array.from({length: 24}, (_, i) => i + ':00')
      },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [{
        data: [15, 12, 8, 5, 8, 12, 25, 45, 65, 75, 80, 85, 88, 92, 95, 88, 75, 65, 55, 45, 35, 28, 22, 18],
        type: 'bar',
        itemStyle: { color: getSuccessColor() }
      }]
    };
    chart2.setOption(option2);
  }
};

// 事件处理函数
const refreshFollowUpQueue = async () => {
  try {
    // 模拟刷新API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('跟进队列已刷新');
  } catch (error) {
    ElMessage.error('刷新失败，请重试');
  }
};

const toggleAutomation = () => {
  automationEnabled.value = !automationEnabled.value;
  ElMessage.success(automationEnabled.value ? '自动化已启动' : '自动化已暂停');
};

const executeFollowUp = async (followUp: AutomatedFollowUp) => {
  try {
    const confirm = await ElMessageBox.confirm(
      `确定要立即执行对 ${followUp.leadName} 的跟进吗？`,
      '确认执行',
      { type: 'warning' }
    );
    
    if (confirm) {
      // 模拟执行跟进
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 从队列中移除
      const index = followUpQueue.value.findIndex(item => item.leadId === followUp.leadId);
      if (index > -1) {
        followUpQueue.value.splice(index, 1);
      }
      
      ElMessage.success('跟进已执行');
      todayCompletedCount.value++;
    }
  } catch (error) {
    // 用户取消操作
  }
};

const editMessage = (followUp: AutomatedFollowUp) => {
  ElMessage.info(`编辑 ${followUp.leadName} 的个性化消息`);
  // 实际实现中这里会打开消息编辑器
};

const reschedule = (followUp: AutomatedFollowUp) => {
  ElMessage.info(`重新安排 ${followUp.leadName} 的跟进时间`);
  // 实际实现中这里会打开时间选择器
};

const viewLeadHistory = (followUp: AutomatedFollowUp) => {
  ElMessage.info(`查看 ${followUp.leadName} 的跟进历史`);
  // 实际实现中这里会打开历史记录页面
};

const createNewRule = async () => {
  if (!newRuleForm.value.name || !newRuleForm.value.trigger) {
    ElMessage.warning('请填写必要信息');
    return;
  }
  
  try {
    // 模拟创建规则API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('自动化规则创建成功');
    createRuleDialogVisible.value = false;
    
    // 重置表单
    newRuleForm.value = {
      name: '',
      trigger: '',
      actions: [],
      delay: 0
    };
    
    // 刷新规则列表
    // 在实际应用中会重新加载数据
  } catch (error) {
    ElMessage.error('规则创建失败');
  }
};

const toggleRule = (rule: AutomationRule) => {
  ElMessage.success(`规则 "${rule.name}" 已${rule.enabled ? '启用' : '禁用'}`);
};

const editRule = (rule: AutomationRule) => {
  ElMessage.info(`编辑规则: ${rule.name}`);
};

const duplicateRule = (rule: AutomationRule) => {
  ElMessage.success(`规则 "${rule.name}" 已复制`);
};

const deleteRule = async (rule: AutomationRule) => {
  try {
    const confirm = await ElMessageBox.confirm(
      `确定要删除规则 "${rule.name}" 吗？此操作不可撤销。`,
      '确认删除',
      { type: 'warning' }
    );
    
    if (confirm) {
      const index = automationRules.value.findIndex(r => r.id === rule.id);
      if (index > -1) {
        automationRules.value.splice(index, 1);
      }
      ElMessage.success('规则已删除');
    }
  } catch (error) {
    // 用户取消操作
  }
};

const showCreateRuleDialog = () => {
  createRuleDialogVisible.value = true;
};

// 工具函数
const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTimeRemaining = (timeString: string) => {
  const now = new Date();
  const scheduled = new Date(timeString);
  const diff = scheduled.getTime() - now.getTime();
  
  if (diff < 0) {
    return '已逾期';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟后`;
  } else {
    return `${minutes}分钟后`;
  }
};

const isDueSoon = (timeString: string) => {
  const now = new Date();
  const scheduled = new Date(timeString);
  const diff = scheduled.getTime() - now.getTime();
  return diff < 60 * 60 * 1000 && diff > 0; // 1小时内
};

const isOverdue = (timeString: string) => {
  const now = new Date();
  const scheduled = new Date(timeString);
  return scheduled.getTime() < now.getTime();
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high': return Warning;
    case 'medium': return Clock;
    case 'low': return CircleCheck;
    default: return Clock;
  }
};

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'call': return Phone;
    case 'message': return Message;
    case 'email': return MessageBox;
    case 'visit': return User;
    default: return Notification;
  }
};

const getRiskLevel = (risk: number) => {
  if (risk > 60) return 'high-risk';
  if (risk > 30) return 'medium-risk';
  return 'low-risk';
};

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'opportunity': return TrendCharts;
    case 'warning': return Warning;
    case 'success': return Star;
    default: return TrendCharts;
  }
};

// 初始化
onMounted(() => {
  initializeMockData();
  renderCharts();
});
</script>

<style scoped>
.automated-follow-up-container {
  padding: var(--spacing-lg);
  max-width: 100%; max-width: 1400px;
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

.header-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.system-dashboard {
  margin-bottom: var(--spacing-8xl);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  text-align: center;
  position: relative;
  border: var(--border-width-base) solid var(--border-color-light);
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: var(--spacing-base);
}

.stat-label {
  color: var(--text-regular);
  font-size: var(--text-sm);
}

.stat-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  width: var(--text-3xl);
  height: var(--text-3xl);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.pending {
  background: #fdf6ec;
  color: var(--warning-color);
}

.stat-icon.completed {
  background: #e1f3d8;
  color: var(--success-color);
}

.stat-icon.automation {
  background: #f0f9ff;
  color: var(--primary-color);
}

.stat-icon.response {
  background: #fef0f0;
  color: var(--danger-color);
}

.follow-up-queue {
  margin-bottom: var(--spacing-8xl);
}

.queue-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.follow-up-item {
  display: flex;
  gap: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  position: relative;
}

.follow-up-item.urgent {
  border-color: var(--danger-color);
  background: #fef0f0;
}

.follow-up-item.due-soon {
  border-color: var(--warning-color);
  background: #fdf6ec;
}

.timeline-marker {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.timeline-marker.high {
  background: var(--danger-color);
  color: var(--bg-white);
}

.timeline-marker.medium {
  background: var(--warning-color);
  color: var(--bg-white);
}

.timeline-marker.low {
  background: var(--success-color);
  color: var(--bg-white);
}

.follow-up-content {
  flex: 1;
}

.follow-up-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4xl);
}

.lead-info h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.lead-details {
  display: flex;
  gap: var(--spacing-4xl);
  font-size: var(--text-sm);
  color: var(--text-regular);
}

.follow-up-time {
  text-align: right;
}

.scheduled-time {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  color: var(--text-regular);
  margin-bottom: var(--spacing-base);
}

.time-remaining {
  font-size: var(--text-xs);
  color: var(--success-color);
}

.time-remaining.overdue {
  color: var(--danger-color);
  font-weight: bold;
}

.follow-up-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
}

.lead-progress {
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
  padding: var(--text-xs);
  border: var(--border-width-base) solid var(--border-color-light);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.progress-label {
  font-size: var(--text-sm);
  color: var(--text-regular);
}

.progress-percentage {
  font-weight: 500;
  color: var(--text-primary);
}

.progress-bar {
  min-height: 32px; height: auto;
  background: var(--border-color-light);
  border-radius: var(--radius-xs);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.stage-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
}

.time-in-stage {
  color: var(--text-regular);
}

.exit-risk {
  font-weight: 500;
}

.exit-risk.high-risk {
  color: var(--danger-color);
}

.exit-risk.medium-risk {
  color: var(--warning-color);
}

.exit-risk.low-risk {
  color: var(--success-color);
}

.next-action {
  background: #f0f9ff;
  border-radius: var(--radius-md);
  padding: var(--text-xs);
  border: var(--border-width-base) solid #d9ecff;
}

.action-info {
  margin-bottom: var(--spacing-sm);
}

.action-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.action-channel {
  font-size: var(--text-xs);
  color: var(--text-regular);
}

.action-description {
  font-size: var(--text-sm);
  color: var(--text-regular);
}

.personalized-message {
  background: #e1f3d8;
  border-radius: var(--radius-md);
  padding: var(--text-xs);
  border: var(--border-width-base) solid #c2e7b0;
}

.personalized-message h5 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.message-content {
  background: var(--bg-white);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: var(--border-width-base) solid #d9ecff;
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
  color: var(--text-primary);
}

.message-metadata {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-regular);
}

.follow-up-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.empty-queue {
  text-align: center;
  padding: var(--spacing-10xl);
}

.automation-rules {
  margin-bottom: var(--spacing-8xl);
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.rule-card {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-base) solid var(--border-color-light);
}

.rule-card.disabled {
  opacity: 0.6;
  background: var(--bg-hover);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4xl);
}

.rule-info h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.rule-trigger {
  font-size: var(--text-sm);
  color: var(--text-regular);
}

.rule-body {
  margin-bottom: var(--spacing-4xl);
}

.rule-conditions,
.rule-actions {
  margin-bottom: var(--spacing-4xl);
}

.rule-conditions h5,
.rule-actions h5 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.conditions-list {
  margin: 0;
  padding-left: var(--spacing-4xl);
  color: var(--text-regular);
}

.conditions-list li {
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-xs);
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-item {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  background: var(--bg-gray-light);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-color-light);
}

.action-icon {
  width: var(--text-3xl);
  height: var(--text-3xl);
  border-radius: var(--radius-full);
  background: var(--primary-color);
  color: var(--bg-white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-details {
  flex: 1;
}

.action-name {
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.action-description {
  font-size: var(--text-xs);
  color: var(--text-regular);
}

.rule-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-4xl);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-color-light);
}

.stat {
  text-align: center;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-regular);
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  font-weight: 500;
  color: var(--text-primary);
}

.rule-actions-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.analytics-report {
  margin-bottom: var(--spacing-8xl);
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 350px;
  gap: var(--spacing-8xl);
}

.chart-container {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color-light);
}

.chart-container h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: var(--text-base);
}

.chart {
  min-height: 60px; height: auto;
}

.insights-panel {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color-light);
}

.insights-panel h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: var(--text-base);
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
}

.insight-item {
  background: var(--bg-white);
  border-radius: var(--radius-md);
  padding: var(--text-xs);
  border: var(--border-width-base) solid var(--border-color-light);
  display: flex;
  gap: var(--spacing-sm);
}

.insight-icon {
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  background: #f0f9ff;
  color: var(--primary-color);
}

.insight-content {
  flex: 1;
}

.insight-content h5 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.insight-content p {
  margin: 0 0 5px 0;
  color: var(--text-regular);
  font-size: var(--text-sm);
  line-height: 1.4;
}

.insight-impact {
  font-size: var(--text-xs);
  color: var(--success-color);
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

@media (max-width: var(--breakpoint-xl)) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .rules-grid {
    grid-template-columns: 1fr;
  }
  
  .follow-up-item {
    flex-direction: column;
    gap: var(--spacing-4xl);
  }
  
  .timeline-marker {
    align-self: flex-start;
  }
  
  .follow-up-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .follow-up-time {
    text-align: left;
  }
  
  .lead-details {
    flex-direction: column;
    gap: var(--spacing-base);
  }
  
  .rule-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .stat {
    text-align: left;
  }
  
  .follow-up-actions {
    justify-content: flex-start;
  }
  
  .rule-actions-buttons {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>