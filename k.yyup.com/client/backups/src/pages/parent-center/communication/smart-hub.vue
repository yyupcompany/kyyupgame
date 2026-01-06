<template>
  <div class="parent-communication-hub">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">智能家长沟通中心</h1>
        <p class="page-subtitle">AI驱动的个性化家长沟通平台</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="generateContent">
          <el-icon><MagicStick /></el-icon>
          AI内容生成
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 沟通概览仪表板 -->
    <div class="communication-dashboard">
      <div class="dashboard-cards">
        <div class="dashboard-card">
          <div class="card-icon engagement">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="card-content">
            <h3>整体参与度</h3>
            <div class="metric-value">{{ overallEngagement }}%</div>
            <div class="metric-trend">
              <el-icon :class="getTrendClass(engagementTrend)">
                <component :is="getTrendIcon(engagementTrend)" />
              </el-icon>
              <span>{{ getTrendText(engagementTrend) }}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-icon response">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="card-content">
            <h3>平均响应时间</h3>
            <div class="metric-value">{{ averageResponseTime }}h</div>
            <div class="metric-description">比目标快{{ responseTimeImprovement }}%</div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-icon satisfaction">
            <el-icon><Star /></el-icon>
          </div>
          <div class="card-content">
            <h3>家长满意度</h3>
            <div class="metric-value">{{ parentSatisfaction }}/5</div>
            <el-rate 
              :model-value="parentSatisfaction" 
              disabled 
              show-score 
              :max="5"
            />
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-icon automation">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="card-content">
            <h3>AI自动化率</h3>
            <div class="metric-value">{{ automationRate }}%</div>
            <div class="metric-description">{{ automatedMessages }}条智能回复</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 个性化内容生成 -->
    <div class="content-generation">
      <div class="section-header">
        <h2>AI个性化内容生成</h2>
        <div class="generation-controls">
          <el-select v-model="contentType" placeholder="选择内容类型" size="small">
            <el-option label="进度报告" value="progress_report" />
            <el-option label="活动建议" value="activity_suggestion" />
            <el-option label="成长里程碑" value="milestone_celebration" />
            <el-option label="行为更新" value="behavioral_update" />
            <el-option label="家长通讯" value="newsletter" />
          </el-select>
          <el-button size="small" type="primary" @click="generatePersonalizedContent">
            <el-icon><DocumentAdd /></el-icon>
            生成内容
          </el-button>
        </div>
      </div>
      
      <div class="content-grid">
        <div v-for="content in personalizedContents" :key="content.id" class="content-card">
          <div class="content-header">
            <div class="content-info">
              <h4>{{ content.title }}</h4>
              <div class="content-meta">
                <el-tag :type="getContentType(content.type)" size="small">
                  {{ getContentTypeName(content.type) }}
                </el-tag>
                <span class="relevance-score">相关度: {{ content.relevanceScore }}%</span>
              </div>
            </div>
            <div class="content-actions">
              <el-button size="small" @click="previewContent(content)">预览</el-button>
              <el-button size="small" type="primary" @click="sendContent(content)">发送</el-button>
            </div>
          </div>
          
          <div class="content-preview">
            <p>{{ truncateText(content.content, 150) }}</p>
          </div>
          
          <div class="content-targeting">
            <span class="targeting-label">目标家长:</span>
            <div class="parent-tags">
              <el-tag 
                v-for="preference in content.parentPreferences.slice(0, 3)" 
                :key="preference" 
                size="small"
                class="parent-tag"
              >
                {{ preference }}
              </el-tag>
            </div>
          </div>
          
          <div class="content-scheduling">
            <span class="schedule-label">建议发送时间:</span>
            <span class="schedule-time">{{ formatSendTime(content.sendTime) }}</span>
            <div class="engagement-prediction">
              <span class="prediction-label">预期参与度:</span>
              <el-progress 
                :percentage="content.engagementPrediction" 
                :color="getEngagementColor(content.engagementPrediction)"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能回复系统 -->
    <div class="smart-reply-system">
      <div class="section-header">
        <h2>智能回复系统</h2>
        <div class="reply-stats">
          <el-tag type="success" size="small">已处理 {{ processedMessages }} 条消息</el-tag>
          <el-tag type="info" size="small">准确率 {{ replyAccuracy }}%</el-tag>
        </div>
      </div>
      
      <div class="reply-interface">
        <div class="message-input">
          <h3>模拟家长消息</h3>
          <el-input
            v-model="testMessage"
            type="textarea"
            :rows="3"
            placeholder="输入家长消息以测试AI回复..."
          />
          <div class="input-actions">
            <el-button @click="clearTestMessage">清空</el-button>
            <el-button type="primary" @click="generateSmartReply">
              <el-icon><Send /></el-icon>
              生成智能回复
            </el-button>
          </div>
        </div>
        
        <div class="reply-suggestions" v-if="replySuggestions.length > 0">
          <h3>AI回复建议</h3>
          <div class="suggestions-list">
            <div v-for="(suggestion, index) in replySuggestions" :key="index" class="suggestion-item">
              <div class="suggestion-header">
                <span class="suggestion-type">{{ getSuggestionType(suggestion.tone) }}</span>
                <div class="suggestion-confidence">
                  <span class="confidence-label">可信度:</span>
                  <el-rate 
                    :model-value="suggestion.confidence / 20" 
                    disabled 
                    :max="5"
                    size="small"
                  />
                </div>
              </div>
              <div class="suggestion-content">
                <p>{{ suggestion.response }}</p>
              </div>
              <div class="suggestion-actions">
                <el-button size="small" @click="editSuggestion(suggestion)">编辑</el-button>
                <el-button size="small" type="primary" @click="adoptSuggestion(suggestion)">
                  采用
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 沟通效果分析 -->
    <div class="communication-analysis">
      <div class="section-header">
        <h2>沟通效果分析</h2>
        <el-button size="small" @click="generateAnalysisReport">
          <el-icon><Document /></el-icon>
          生成报告
        </el-button>
      </div>
      
      <div class="analysis-grid">
        <div class="analysis-card">
          <h3>沟通渠道偏好</h3>
          <div ref="channelPreferenceChart" class="chart-container"></div>
        </div>
        
        <div class="analysis-card">
          <h3>沟通时间分布</h3>
          <div ref="timeDistributionChart" class="chart-container"></div>
        </div>
        
        <div class="analysis-card">
          <h3>话题热度分析</h3>
          <div class="topic-analysis">
            <div v-for="topic in topicAnalysis" :key="topic.topic" class="topic-item">
              <div class="topic-header">
                <span class="topic-name">{{ topic.topic }}</span>
                <span class="topic-frequency">{{ topic.frequency }}次</span>
              </div>
              <div class="topic-sentiment">
                <span class="sentiment-label">情感倾向:</span>
                <el-progress 
                  :percentage="topic.sentiment" 
                  :color="getSentimentColor(topic.sentiment)"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 家长细分和画像 -->
    <div class="parent-segmentation">
      <div class="section-header">
        <h2>家长细分画像</h2>
        <el-button size="small" @click="updateSegmentation">
          <el-icon><UserFilled /></el-icon>
          更新画像
        </el-button>
      </div>
      
      <div class="segmentation-grid">
        <div v-for="segment in parentSegments" :key="segment.id" class="segment-card">
          <div class="segment-header">
            <h4>{{ segment.name }}</h4>
            <div class="segment-size">
              <span class="size-count">{{ segment.count }}位家长</span>
              <span class="size-percentage">({{ segment.percentage }}%)</span>
            </div>
          </div>
          
          <div class="segment-characteristics">
            <h5>特征描述</h5>
            <ul class="characteristics-list">
              <li v-for="characteristic in segment.characteristics" :key="characteristic">
                {{ characteristic }}
              </li>
            </ul>
          </div>
          
          <div class="segment-preferences">
            <h5>沟通偏好</h5>
            <div class="preferences-tags">
              <el-tag 
                v-for="preference in segment.communicationPreferences" 
                :key="preference" 
                size="small"
                class="preference-tag"
              >
                {{ preference }}
              </el-tag>
            </div>
          </div>
          
          <div class="segment-strategy">
            <h5>建议策略</h5>
            <p class="strategy-text">{{ segment.recommendedStrategy }}</p>
          </div>
          
          <div class="segment-actions">
            <el-button size="small" @click="viewSegmentDetails(segment)">查看详情</el-button>
            <el-button size="small" type="primary" @click="createTargetedContent(segment)">
              创建定向内容
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 沟通改进建议 -->
    <div class="improvement-suggestions">
      <div class="section-header">
        <h2>AI改进建议</h2>
        <el-tag type="warning" size="small">基于数据分析生成</el-tag>
      </div>
      
      <div class="suggestions-list">
        <div v-for="suggestion in improvementSuggestions" :key="suggestion.id" class="improvement-item">
          <div class="improvement-header">
            <div class="improvement-info">
              <h4>{{ suggestion.title }}</h4>
              <el-tag :type="getPriorityType(suggestion.priority)" size="small">
                {{ getPriorityText(suggestion.priority) }}
              </el-tag>
            </div>
            <div class="improvement-impact">
              <span class="impact-label">预期提升:</span>
              <span class="impact-value">{{ suggestion.expectedImprovement }}</span>
            </div>
          </div>
          
          <p class="improvement-description">{{ suggestion.description }}</p>
          
          <div class="improvement-steps">
            <h5>实施步骤</h5>
            <ol class="steps-list">
              <li v-for="step in suggestion.implementationSteps" :key="step">
                {{ step }}
              </li>
            </ol>
          </div>
          
          <div class="improvement-actions">
            <el-button size="small" @click="viewImprovementDetails(suggestion)">
              查看详情
            </el-button>
            <el-button size="small" type="primary" @click="implementSuggestion(suggestion)">
              开始实施
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay" v-loading="loading">
      <p>AI正在分析沟通数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  MagicStick, 
  Refresh, 
  ChatDotRound, 
  Clock, 
  Star, 
  DocumentAdd,
  Send,
  Document,
  UserFilled
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useSmartParentCommunication } from '@/composables/useSmartParentCommunication'
import type { 
  SmartCommunication,
  PersonalizedContent,
  CommunicationAnalysis
} from '@/types/ai-business-plus'

// 使用智能家长沟通组合式函数
const {
  communicationData,
  loading,
  generatePersonalizedContent: apiGeneratePersonalizedContent,
  generateResponseSuggestions,
  analyzeCommunicationEffectiveness
} = useSmartParentCommunication()

// 页面状态
const channelPreferenceChart = ref<HTMLDivElement>()
const timeDistributionChart = ref<HTMLDivElement>()

// 沟通概览数据
const overallEngagement = ref(87)
const engagementTrend = ref('up')
const averageResponseTime = ref(2.3)
const responseTimeImprovement = ref(25)
const parentSatisfaction = ref(4.6)
const automationRate = ref(73)
const automatedMessages = ref(142)

// 内容生成相关
const contentType = ref('progress_report')
const personalizedContents = ref<PersonalizedContent[]>([
  {
    id: '1',
    parentId: 'p1',
    type: 'progress_report',
    title: '小明本周学习进展报告',
    content: '小明这周在数学方面表现出色，能够独立完成10以内的加减法运算。在语言表达方面也有明显进步，能够完整地讲述一个简单的故事。建议家长在家中可以多进行数字游戏和故事分享活动...',
    relevanceScore: 92,
    sendTime: '2025-07-08T19:00:00',
    personalizedElements: ['学习进度', '具体表现', '家庭建议'],
    parentPreferences: ['详细报告', '具体数据', '可行建议'],
    childSpecificContent: true,
    engagementPrediction: 85
  },
  {
    id: '2',
    parentId: 'p2',
    type: 'activity_suggestion',
    title: '周末亲子活动推荐',
    content: '根据您孩子的兴趣特点和发展需求，我们为您推荐以下亲子活动：1. 制作简单科学小实验，培养观察能力；2. 一起阅读绘本故事，提升语言能力；3. 户外自然观察，增强好奇心...',
    relevanceScore: 78,
    sendTime: '2025-07-09T10:00:00',
    personalizedElements: ['兴趣匹配', '能力发展', '实用性强'],
    parentPreferences: ['实用建议', '简单易行', '寓教于乐'],
    childSpecificContent: true,
    engagementPrediction: 72
  }
])

// 智能回复相关
const testMessage = ref('')
const replySuggestions = ref<any[]>([])
const processedMessages = ref(89)
const replyAccuracy = ref(94)

// 分析数据
const topicAnalysis = ref([
  { topic: '学习进度', frequency: 45, sentiment: 75 },
  { topic: '行为表现', frequency: 32, sentiment: 68 },
  { topic: '健康状况', frequency: 28, sentiment: 82 },
  { topic: '社交能力', frequency: 21, sentiment: 71 },
  { topic: '特殊需求', frequency: 15, sentiment: 60 }
])

// 家长细分
const parentSegments = ref([
  {
    id: 'seg1',
    name: '关注型家长',
    count: 45,
    percentage: 35,
    characteristics: [
      '高度关注孩子发展',
      '经常主动询问进展',
      '喜欢详细的反馈信息',
      '愿意配合教育活动'
    ],
    communicationPreferences: ['详细报告', '及时反馈', '数据支持'],
    recommendedStrategy: '提供详细的数据分析和具体的改进建议，保持高频率的互动交流'
  },
  {
    id: 'seg2',
    name: '忙碌型家长',
    count: 38,
    percentage: 30,
    characteristics: [
      '工作繁忙时间有限',
      '偏好简洁的信息',
      '重视效率和重点',
      '需要灵活的沟通时间'
    ],
    communicationPreferences: ['简洁明了', '重点突出', '灵活时间'],
    recommendedStrategy: '提供精简的要点总结，选择合适的时间窗口进行重要沟通'
  },
  {
    id: 'seg3',
    name: '支持型家长',
    count: 44,
    percentage: 35,
    characteristics: [
      '信任教育机构',
      '配合度较高',
      '偶尔询问情况',
      '关注孩子整体发展'
    ],
    communicationPreferences: ['定期更新', '正面反馈', '全面发展'],
    recommendedStrategy: '定期提供综合性报告，重点突出孩子的进步和成长亮点'
  }
])

// 改进建议
const improvementSuggestions = ref([
  {
    id: 'imp1',
    title: '个性化内容推送时间优化',
    priority: 'high',
    description: '根据家长的在线活跃时间，优化内容推送时机，可以提升30%的阅读率和参与度',
    expectedImprovement: '参与度提升30%',
    implementationSteps: [
      '分析家长在线行为数据',
      '识别个人最佳互动时间',
      '建立智能推送时间算法',
      'A/B测试验证效果'
    ]
  },
  {
    id: 'imp2',
    title: '多媒体内容丰富化',
    priority: 'medium',
    description: '增加视频、图片等多媒体内容，使沟通更加生动直观，提升家长的理解度和参与感',
    expectedImprovement: '满意度提升25%',
    implementationSteps: [
      '制定多媒体内容标准',
      '培训教师多媒体制作',
      '建立内容审核流程',
      '收集家长反馈优化'
    ]
  }
])

// 页面方法
const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const generateContent = async () => {
  try {
    const newContent = await apiGeneratePersonalizedContent('all_parents')
    if (newContent) {
      personalizedContents.value.unshift(...newContent)
      ElMessage.success('AI内容生成完成')
    }
  } catch (error) {
    ElMessage.error('内容生成失败')
  }
}

const generatePersonalizedContent = async () => {
  ElMessage.info(`正在生成${getContentTypeName(contentType.value)}...`)
  
  // 模拟生成新内容
  const newContent: PersonalizedContent = {
    id: 'new-' + Date.now(),
    parentId: 'p-new',
    type: contentType.value as any,
    title: `${getContentTypeName(contentType.value)} - ${new Date().toLocaleDateString()}`,
    content: `这是一份基于AI分析生成的${getContentTypeName(contentType.value)}内容，根据您孩子的具体情况和最近表现进行个性化定制...`,
    relevanceScore: Math.floor(Math.random() * 20) + 80,
    sendTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    personalizedElements: ['个性化分析', '具体建议', '可行方案'],
    parentPreferences: ['相关性强', '实用性高', '可操作性强'],
    childSpecificContent: true,
    engagementPrediction: Math.floor(Math.random() * 20) + 70
  }
  
  personalizedContents.value.unshift(newContent)
  ElMessage.success('个性化内容生成完成')
}

const previewContent = (content: PersonalizedContent) => {
  ElMessageBox.alert(content.content, content.title, {
    confirmButtonText: '确定',
    type: 'info'
  })
}

const sendContent = async (content: PersonalizedContent) => {
  try {
    await ElMessageBox.confirm(
      `确定要发送"${content.title}"吗？`,
      '确认发送',
      { confirmButtonText: '发送', cancelButtonText: '取消' }
    )
    
    ElMessage.success('内容已发送给目标家长')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发送失败')
    }
  }
}

const clearTestMessage = () => {
  testMessage.value = ''
  replySuggestions.value = []
}

const generateSmartReply = async () => {
  if (!testMessage.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  
  try {
    const suggestions = await generateResponseSuggestions(testMessage.value, {})
    if (suggestions) {
      replySuggestions.value = suggestions
      ElMessage.success('智能回复建议已生成')
    }
  } catch (error) {
    // 生成模拟回复建议
    replySuggestions.value = [
      {
        response: '感谢您的关注！根据您提到的情况，我们建议您可以在家中多进行一些互动游戏，这对孩子的发展会有很好的帮助。如果您需要具体的游戏建议，我们很乐意为您提供。',
        tone: 'professional_friendly',
        confidence: 92
      },
      {
        response: '我们理解您的担心。每个孩子的发展节奏都不同，这是很正常的。我们会持续关注您孩子的情况，并及时与您沟通任何需要注意的方面。',
        tone: 'empathetic',
        confidence: 88
      },
      {
        response: '很高兴收到您的消息！针对您提到的问题，我们将安排专门的观察和记录，并在本周末前给您详细的反馈报告。',
        tone: 'professional',
        confidence: 85
      }
    ]
    ElMessage.success('智能回复建议已生成（演示数据）')
  }
}

const editSuggestion = (suggestion: any) => {
  ElMessage.info('编辑功能开发中')
}

const adoptSuggestion = (suggestion: any) => {
  ElMessage.success('已采用该回复建议')
}

const generateAnalysisReport = async () => {
  try {
    const analysis = await analyzeCommunicationEffectiveness()
    if (analysis) {
      ElMessage.success('分析报告已生成')
    }
  } catch (error) {
    ElMessage.success('分析报告已生成（演示数据）')
  }
}

const updateSegmentation = () => {
  ElMessage.success('家长画像已更新')
}

const viewSegmentDetails = (segment: any) => {
  ElMessage.info(`查看${segment.name}详情`)
}

const createTargetedContent = (segment: any) => {
  ElMessage.info(`为${segment.name}创建定向内容`)
}

const viewImprovementDetails = (suggestion: any) => {
  ElMessage.info(`查看改进建议详情: ${suggestion.title}`)
}

const implementSuggestion = async (suggestion: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要开始实施"${suggestion.title}"吗？`,
      '确认实施',
      { confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    
    ElMessage.success('改进建议已开始实施')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('实施失败')
    }
  }
}

// 初始化图表
const initChannelPreferenceChart = () => {
  if (!channelPreferenceChart.value) return
  
  const chart = echarts.init(channelPreferenceChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 35, name: '微信' },
          { value: 25, name: 'APP消息' },
          { value: 20, name: '电话' },
          { value: 15, name: '邮件' },
          { value: 5, name: '短信' }
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
  }
  
  chart.setOption(option)
}

const initTimeDistributionChart = () => {
  if (!timeDistributionChart.value) return
  
  const chart = echarts.init(timeDistributionChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['8时', '12时', '16时', '19时', '21时', '23时']
    },
    yAxis: {
      type: 'value',
      name: '消息数量'
    },
    series: [
      {
        data: [12, 8, 15, 42, 38, 6],
        type: 'bar',
        itemStyle: {
          color: 'var(--primary-color)'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 工具函数
const getTrendClass = (trend: string) => {
  return {
    'trend-up': trend === 'up',
    'trend-down': trend === 'down',
    'trend-stable': trend === 'stable'
  }
}

const getTrendIcon = (trend: string) => {
  // 这里需要导入对应的图标组件
  return 'ArrowUp' // 简化处理
}

const getTrendText = (trend: string) => {
  const textMap: Record<string, string> = {
    up: '持续上升',
    down: '有所下降',
    stable: '保持稳定'
  }
  return textMap[trend] || trend
}

const getContentType = (type: string) => {
  const typeMap: Record<string, string> = {
    progress_report: 'primary',
    activity_suggestion: 'success',
    milestone_celebration: 'warning',
    behavioral_update: 'info',
    newsletter: 'danger'
  }
  return typeMap[type] || 'info'
}

const getContentTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    progress_report: '进度报告',
    activity_suggestion: '活动建议',
    milestone_celebration: '成长里程碑',
    behavioral_update: '行为更新',
    newsletter: '家长通讯'
  }
  return nameMap[type] || type
}

const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatSendTime = (timeString: string) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEngagementColor = (percentage: number) => {
  if (percentage >= 80) return 'var(--success-color)'
  if (percentage >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getSuggestionType = (tone: string) => {
  const typeMap: Record<string, string> = {
    professional_friendly: '专业友好',
    empathetic: '共情理解',
    professional: '专业正式',
    casual: '轻松随意'
  }
  return typeMap[tone] || tone
}

const getSentimentColor = (sentiment: number) => {
  if (sentiment >= 70) return 'var(--success-color)'
  if (sentiment >= 40) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return textMap[priority] || priority
}

// 生命周期
onMounted(async () => {
  await nextTick()
  initChannelPreferenceChart()
  initTimeDistributionChart()
  
  // 响应式处理
  window.addEventListener('resize', () => {
    if (channelPreferenceChart.value) {
      echarts.getInstanceByDom(channelPreferenceChart.value)?.resize()
    }
    if (timeDistributionChart.value) {
      echarts.getInstanceByDom(timeDistributionChart.value)?.resize()
    }
  })
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.parent-communication-hub {
  padding: var(--spacing-lg);
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--text-3xl);
  background: var(--el-bg-color);
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.page-subtitle {
  font-size: var(--text-base);
  color: var(--el-text-color-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--text-xs);
}

.communication-dashboard {
  margin-bottom: var(--text-3xl);
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.dashboard-card {
  background: var(--el-bg-color);
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.card-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--text-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-2xl);
  color: var(--text-on-primary);
  
  &.engagement {
    background: var(--gradient-purple);
  }
  
  &.response {
    background: var(--gradient-danger);
  }
  
  &.satisfaction {
    background: var(--gradient-info);
  }
  
  &.automation {
    background: var(--gradient-success);
  }
}

.card-content {
  flex: 1;
  
  h3 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin: 0 0 var(--spacing-sm) 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.metric-value {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
  
  .el-icon {
    font-size: var(--text-sm);
    
    &.trend-up {
      color: var(--el-color-success);
    }
    
    &.trend-down {
      color: var(--el-color-danger);
    }
    
    &.trend-stable {
      color: var(--el-color-info);
    }
  }
}

.metric-description {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
}

.content-generation,
.smart-reply-system,
.communication-analysis,
.parent-segmentation,
.improvement-suggestions {
  background: var(--el-bg-color);
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  margin-bottom: var(--text-3xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  
  h2 {
    font-size: var(--spacing-lg);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.generation-controls,
.reply-stats {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.content-card {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--text-sm);
}

.content-info {
  flex: 1;
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
}

.content-meta {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  
  .relevance-score {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
}

.content-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.content-preview {
  margin-bottom: var(--text-sm);
  
  p {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    margin: 0;
    line-height: 1.4;
  }
}

.content-targeting,
.content-scheduling {
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.targeting-label,
.schedule-label,
.prediction-label {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
  font-weight: 600;
}

.parent-tags,
.preferences-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.parent-tag,
.preference-tag {
  font-size: var(--text-xs);
}

.schedule-time {
  font-size: var(--text-xs);
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.engagement-prediction {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;
}

.reply-interface {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--text-2xl);
}

.message-input {
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }
}

.input-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--text-sm);
}

.reply-suggestions {
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
}

.suggestion-item {
  background: var(--el-bg-color-page);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.suggestion-type {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--el-color-primary);
}

.suggestion-confidence {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  .confidence-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
}

.suggestion-content {
  margin-bottom: var(--text-sm);
  
  p {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    margin: 0;
    line-height: 1.4;
  }
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.analysis-card {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
  
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.chart-container {
  height: 200px;
}

.topic-analysis {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.topic-item {
  background: var(--el-bg-color);
  padding: var(--text-xs);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  .topic-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .topic-frequency {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
}

.topic-sentiment {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .sentiment-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
}

.segmentation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.segment-card {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.segment-size {
  text-align: right;
  
  .size-count {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .size-percentage {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
  }
}

.segment-characteristics,
.segment-preferences,
.segment-strategy {
  margin-bottom: var(--text-lg);
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
}

.characteristics-list {
  margin: 0;
  padding-left: var(--text-lg);
  
  li {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    margin-bottom: var(--spacing-xs);
  }
}

.strategy-text {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin: 0;
  line-height: 1.4;
}

.segment-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.improvement-item {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.improvement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--text-sm);
}

.improvement-info {
  flex: 1;
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
}

.improvement-impact {
  text-align: right;
  
  .impact-label {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
    display: block;
  }
  
  .impact-value {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-color-primary);
  }
}

.improvement-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin: 0 0 var(--text-lg) 0;
  line-height: 1.4;
}

.improvement-steps {
  margin-bottom: var(--text-lg);
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
}

.steps-list {
  margin: 0;
  padding-left: var(--text-lg);
  
  li {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    margin-bottom: var(--spacing-xs);
  }
}

.improvement-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--white-alpha-80);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  p {
    margin-top: var(--text-lg);
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-xl)) {
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .reply-interface {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .parent-communication-hub {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--text-base);
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
  
  .segmentation-grid {
    grid-template-columns: 1fr;
  }
  
  .generation-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
}
</style>