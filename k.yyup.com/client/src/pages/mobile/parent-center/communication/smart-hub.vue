<template>
  <MobileMainLayout
    title="智能沟通中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <!-- 页面内容 -->
    <div class="mobile-communication-hub">
      <!-- 沟通概览仪表板 -->
      <div class="dashboard-section">
        <div class="section-title">
          <h3>沟通概览</h3>
          <van-button size="small" type="primary" @click="refreshData">
            <van-icon name="replay" />
            刷新
          </van-button>
        </div>

        <div class="dashboard-cards">
          <div class="dashboard-card engagement">
            <div class="card-icon">
              <van-icon name="chart-trending-o" />
            </div>
            <div class="card-content">
              <div class="metric-value">{{ overallEngagement }}%</div>
              <div class="metric-label">整体参与度</div>
              <div class="metric-trend" :class="getTrendClass(engagementTrend)">
                <van-icon :name="getTrendIcon(engagementTrend)" />
                <span>{{ getTrendText(engagementTrend) }}</span>
              </div>
            </div>
          </div>

          <div class="dashboard-card response">
            <div class="card-icon">
              <van-icon name="clock-o" />
            </div>
            <div class="card-content">
              <div class="metric-value">{{ averageResponseTime }}h</div>
              <div class="metric-label">平均响应时间</div>
              <div class="metric-desc">比目标快{{ responseTimeImprovement }}%</div>
            </div>
          </div>

          <div class="dashboard-card satisfaction">
            <div class="card-icon">
              <van-icon name="star" />
            </div>
            <div class="card-content">
              <div class="metric-value">{{ parentSatisfaction }}/5</div>
              <div class="metric-label">家长满意度</div>
              <van-rate
                :model-value="parentSatisfaction"
                disabled
                size="12"
              />
            </div>
          </div>

          <div class="dashboard-card automation">
            <div class="card-icon">
              <van-icon name="bulb-o" />
            </div>
            <div class="card-content">
              <div class="metric-value">{{ automationRate }}%</div>
              <div class="metric-label">AI自动化率</div>
              <div class="metric-desc">{{ automatedMessages }}条智能回复</div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI内容生成 -->
      <div class="content-generation-section">
        <div class="section-title">
          <h3>AI个性化内容</h3>
          <van-button size="small" type="primary" @click="generatePersonalizedContent">
            <van-icon name="add-o" />
            生成内容
          </van-button>
        </div>

        <div class="content-type-selector">
          <van-field
            v-model="contentType"
            label="内容类型"
            placeholder="选择内容类型"
            readonly
            is-link
            @click="showContentTypePicker = true"
          />
        </div>

        <div class="content-list">
          <div
            v-for="content in personalizedContents"
            :key="content.id"
            class="content-item"
            @click="previewContent(content)"
          >
            <div class="content-header">
              <div class="content-info">
                <h4 class="content-title">{{ content.title }}</h4>
                <div class="content-meta">
                  <van-tag :type="getContentType(content.type)" size="small">
                    {{ getContentTypeName(content.type) }}
                  </van-tag>
                  <span class="relevance-score">相关度 {{ content.relevanceScore }}%</span>
                </div>
              </div>
              <van-icon name="arrow" class="arrow-icon" />
            </div>

            <div class="content-preview">
              <p>{{ truncateText(content.content, 80) }}</p>
            </div>

            <div class="content-footer">
              <div class="target-info">
                <van-icon name="friends-o" size="14" />
                <span class="target-label">目标家长</span>
              </div>
              <div class="engagement-info">
                <span class="engagement-label">预期参与度</span>
                <van-progress
                  :percentage="content.engagementPrediction"
                  stroke-width="4"
                  :color="getEngagementColor(content.engagementPrediction)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 智能回复系统 -->
      <div class="smart-reply-section">
        <div class="section-title">
          <h3>智能回复助手</h3>
          <van-tag type="success" size="small">已处理 {{ processedMessages }} 条</van-tag>
        </div>

        <div class="message-input-area">
          <van-field
            v-model="testMessage"
            type="textarea"
            label="模拟消息"
            placeholder="输入家长消息以测试AI回复..."
            :rows="3"
            maxlength="200"
            show-word-limit
          />
          <div class="input-actions">
            <van-button size="small" @click="clearTestMessage">清空</van-button>
            <van-button size="small" type="primary" @click="generateSmartReply">
              <van-icon name="bulb-o" />
              生成回复
            </van-button>
          </div>
        </div>

        <div v-if="replySuggestions.length > 0" class="reply-suggestions">
          <h4>AI回复建议</h4>
          <div
            v-for="(suggestion, index) in replySuggestions"
            :key="index"
            class="suggestion-item"
          >
            <div class="suggestion-header">
              <span class="suggestion-type">{{ getSuggestionType(suggestion.tone || suggestion.category) }}</span>
              <div class="suggestion-confidence">
                <span class="confidence-label">可信度</span>
                <van-rate
                  :model-value="Math.round((suggestion.confidence || 0) / 20)"
                  disabled
                  size="12"
                />
              </div>
            </div>
            <div class="suggestion-content">
              <p>{{ suggestion.response }}</p>
            </div>
            <div class="suggestion-actions">
              <van-button size="small" @click="editSuggestion(suggestion)">编辑</van-button>
              <van-button size="small" type="primary" @click="adoptSuggestion(suggestion)">
                采用
              </van-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 话题分析 -->
      <div class="topic-analysis-section">
        <div class="section-title">
          <h3>话题热度分析</h3>
          <van-button size="small" @click="generateAnalysisReport">
            <van-icon name="chart-trending-o" />
            生成报告
          </van-button>
        </div>

        <div class="topic-list">
          <div v-for="topic in topicAnalysis" :key="topic.topic" class="topic-item">
            <div class="topic-header">
              <span class="topic-name">{{ topic.topic }}</span>
              <span class="topic-frequency">{{ topic.frequency }}次</span>
            </div>
            <div class="topic-sentiment">
              <span class="sentiment-label">情感倾向</span>
              <van-progress
                :percentage="topic.sentiment"
                stroke-width="4"
                :color="getSentimentColor(topic.sentiment)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 改进建议 -->
      <div class="improvements-section">
        <div class="section-title">
          <h3>AI改进建议</h3>
          <van-tag type="warning" size="small">基于数据分析</van-tag>
        </div>

        <div class="improvements-list">
          <div
            v-for="suggestion in improvementSuggestions"
            :key="suggestion.id"
            class="improvement-item"
            @click="viewImprovementDetails(suggestion)"
          >
            <div class="improvement-header">
              <h4 class="improvement-title">{{ suggestion.title }}</h4>
              <van-tag :type="getPriorityType(suggestion.priority)" size="small">
                {{ getPriorityText(suggestion.priority) }}
              </van-tag>
            </div>
            <p class="improvement-description">{{ truncateText(suggestion.description, 100) }}</p>
            <div class="improvement-impact">
              <span class="impact-label">预期提升:</span>
              <span class="impact-value">{{ suggestion.expectedImprovement }}</span>
            </div>
            <div class="improvement-actions">
              <van-button size="small" type="primary" @click.stop="implementSuggestion(suggestion)">
                开始实施
              </van-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容类型选择器 -->
      <van-popup v-model:show="showContentTypePicker" position="bottom">
        <van-picker
          :columns="contentTypeOptions"
          @confirm="onContentTypeConfirm"
          @cancel="showContentTypePicker = false"
        />
      </van-popup>

      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" color="#1989fa" size="24px">
        AI正在分析数据...
      </van-loading>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog, showDialog } from 'vant'
import { useSmartParentCommunication } from '@/composables/useSmartParentCommunication'
import type {
  PersonalizedContent,
  CommunicationAnalysis,
  AutoResponse
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
const showContentTypePicker = ref(false)

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
const contentTypeOptions = [
  { text: '进度报告', value: 'progress_report' },
  { text: '活动建议', value: 'activity_suggestion' },
  { text: '成长里程碑', value: 'milestone_celebration' },
  { text: '行为更新', value: 'behavioral_update' },
  { text: '家长通讯', value: 'newsletter' }
]

const personalizedContents = ref<PersonalizedContent[]>([
  {
    id: '1',
    parentId: 'p1',
    type: 'progress_report',
    title: '小明本周学习进展报告',
    content: '小明这周在数学方面表现出色，能够独立完成10以内的加减法运算。在语言表达方面也有明显进步，能够完整地讲述一个简单的故事...',
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
    content: '根据您孩子的兴趣特点和发展需求，我们为您推荐以下亲子活动：1. 制作简单科学小实验，培养观察能力...',
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
const replySuggestions = ref<AutoResponse[]>([])
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
  showToast('数据已刷新')
}

const onContentTypeConfirm = ({ selectedValues }: any) => {
  contentType.value = selectedValues[0]
  showContentTypePicker.value = false
}

const generatePersonalizedContent = async () => {
  showToast.info(`正在生成${getContentTypeName(contentType.value)}...`)

  try {
    const newContent = await apiGeneratePersonalizedContent('all_parents')
    if (newContent && newContent.length > 0) {
      personalizedContents.value.unshift(...newContent)
      showToast.success('AI内容生成完成')
    }
  } catch (error) {
    // 生成模拟内容
    const mockContent: PersonalizedContent = {
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

    personalizedContents.value.unshift(mockContent)
    showToast.success('个性化内容生成完成（演示数据）')
  }
}

const previewContent = async (content: PersonalizedContent) => {
  try {
    await showDialog({
      title: content.title,
      message: content.content,
      confirmButtonText: '确定'
    })
  } catch (error) {
    // 用户取消或其他错误
  }
}

const sendContent = async (content: PersonalizedContent) => {
  try {
    await showConfirmDialog({
      title: '确认发送',
      message: `确定要发送"${content.title}"吗？`,
      confirmButtonText: '发送',
      cancelButtonText: '取消'
    })

    showToast.success('内容已发送给目标家长')
  } catch (error) {
    if (error !== 'cancel') {
      showToast.fail('发送失败')
    }
  }
}

const clearTestMessage = () => {
  testMessage.value = ''
  replySuggestions.value = []
}

const generateSmartReply = async () => {
  if (!testMessage.value.trim()) {
    showToast('请输入消息内容')
    return
  }

  try {
    const suggestions = await generateResponseSuggestions(testMessage.value, {})
    if (suggestions && suggestions.length > 0) {
      replySuggestions.value = suggestions
      showToast.success('智能回复建议已生成')
    }
  } catch (error) {
    // 生成模拟回复建议
    replySuggestions.value = [
      {
        id: 'response-1',
        trigger: testMessage.value,
        response: '感谢您的关注！根据您提到的情况，我们建议您可以在家中多进行一些互动游戏，这对孩子的发展会有很好的帮助。如果您需要具体的游戏建议，我们很乐意为您提供。',
        confidence: 92,
        category: 'general',
        requiresHumanReview: false,
        alternativeResponses: [
          '我们理解您的关切，会立即安排个别关注计划。',
          '这是一个很好的观察，让我们一起制定改进策略。'
        ]
      },
      {
        id: 'response-2',
        trigger: testMessage.value,
        response: '我们理解您的担心。每个孩子的发展节奏都不同，这是很正常的。我们会持续关注您孩子的情况，并及时与您沟通任何需要注意的方面。',
        confidence: 88,
        category: 'academic',
        requiresHumanReview: false,
        alternativeResponses: [
          '每个孩子都有自己的发展时间表，我们一起努力支持他/她。',
          '您的观察很细致，让我们共同关注孩子的这个发展方面。'
        ]
      }
    ]
    showToast.success('智能回复建议已生成（演示数据）')
  }
}

const editSuggestion = (suggestion: AutoResponse) => {
  showToast.info('编辑功能开发中')
}

const adoptSuggestion = (suggestion: AutoResponse) => {
  showToast.success('已采用该回复建议')
}

const generateAnalysisReport = async () => {
  try {
    const analysis = await analyzeCommunicationEffectiveness()
    if (analysis) {
      showToast.success('分析报告已生成')
    }
  } catch (error) {
    showToast.success('分析报告已生成（演示数据）')
  }
}

const viewImprovementDetails = (suggestion: any) => {
  showToast.info(`查看改进建议详情: ${suggestion.title}`)
}

const implementSuggestion = async (suggestion: any) => {
  try {
    await showConfirmDialog({
      title: '确认实施',
      message: `确定要开始实施"${suggestion.title}"吗？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    showToast.success('改进建议已开始实施')
  } catch (error) {
    if (error !== 'cancel') {
      showToast.fail('实施失败')
    }
  }
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
  const iconMap: Record<string, string> = {
    up: 'arrow-up',
    down: 'arrow-down',
    stable: 'minus'
  }
  return iconMap[trend] || 'minus'
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
  return typeMap[type] || 'default'
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

const getEngagementColor = (percentage: number) => {
  if (percentage >= 80) return '#07c160'
  if (percentage >= 60) return '#ff976a'
  return '#ee0a24'
}

const getSuggestionType = (type: string) => {
  const typeMap: Record<string, string> = {
    general: '通用',
    academic: '学术',
    behavioral: '行为',
    administrative: '行政',
    professional_friendly: '专业友好',
    empathetic: '共情理解',
    professional: '专业正式',
    casual: '轻松随意'
  }
  return typeMap[type] || type
}

const getSentimentColor = (sentiment: number) => {
  if (sentiment >= 70) return '#07c160'
  if (sentiment >= 40) return '#ff976a'
  return '#ee0a24'
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'default'
  }
  return typeMap[priority] || 'default'
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
onMounted(() => {
  // 初始化页面数据
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-communication-hub {
  padding: var(--spacing-md);
  background: var(--app-bg-color);
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
}

// 通用样式
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: #323233;
    margin: 0;
  }
}

// 仪表板样式
.dashboard-section {
  margin-bottom: 24px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.dashboard-card {
  background: var(--card-bg);
  padding: var(--spacing-md);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  &.engagement .card-icon {
    background: linear-gradient(135deg, #1989fa, #40a9ff);
  }

  &.response .card-icon {
    background: linear-gradient(135deg, #ff6b6b, #ff8787);
  }

  &.satisfaction .card-icon {
    background: linear-gradient(135deg, #ffc107, #ffcd38);
  }

  &.automation .card-icon {
    background: linear-gradient(135deg, #07c160, #38d9a9);
  }
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  color: var(--text-white);

  .van-icon {
    color: var(--text-white);
  }
}

.card-content {
  flex: 1;
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: #323233;
  line-height: 1;
  margin-bottom: 4px;
}

.metric-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: #969799;
  margin-bottom: 4px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 11px;
  color: #969799;

  &.trend-up {
    color: #07c160;
  }

  &.trend-down {
    color: #ee0a24;
  }

  .van-icon {
    font-size: var(--text-xs);
  }
}

.metric-desc {
  font-size: 11px;
  color: #969799;
}

// 内容生成区域
.content-generation-section {
  margin-bottom: 24px;
}

.content-type-selector {
  margin-bottom: 16px;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.content-item {
  background: var(--card-bg);
  padding: var(--spacing-md);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.content-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: #323233;
  margin: 0 0 6px 0;
}

.content-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .relevance-score {
    font-size: var(--text-xs);
    color: #969799;
  }
}

.arrow-icon {
  color: #c8c9cc;
  font-size: var(--text-base);
}

.content-preview {
  margin-bottom: 12px;

  p {
    font-size: var(--text-sm);
    color: #646566;
    margin: 0;
    line-height: 1.4;
  }
}

.content-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.target-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  .target-label {
    font-size: var(--text-xs);
    color: #969799;
  }
}

.engagement-info {
  flex: 1;
  margin-left: 16px;

  .engagement-label {
    font-size: var(--text-xs);
    color: #969799;
    display: block;
    margin-bottom: 4px;
  }
}

// 智能回复区域
.smart-reply-section {
  margin-bottom: 24px;
}

.message-input-area {
  background: var(--card-bg);
  padding: var(--spacing-md);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
  margin-bottom: 16px;
}

.input-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: 12px;
  justify-content: flex-end;
}

.reply-suggestions {
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #323233;
    margin: 0 0 12px 0;
  }
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.suggestion-item {
  background: var(--card-bg);
  padding: var(--spacing-md);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.suggestion-type {
  font-size: var(--text-xs);
  font-weight: 600;
  color: #1989fa;
}

.suggestion-confidence {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  .confidence-label {
    font-size: var(--text-xs);
    color: #969799;
  }
}

.suggestion-content {
  margin-bottom: 12px;

  p {
    font-size: var(--text-sm);
    color: #646566;
    margin: 0;
    line-height: 1.4;
  }
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-sm);
}

// 话题分析区域
.topic-analysis-section {
  margin-bottom: 24px;
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.topic-item {
  background: var(--card-bg);
  padding: var(--spacing-md);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .topic-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #323233;
  }

  .topic-frequency {
    font-size: var(--text-xs);
    color: #969799;
  }
}

.topic-sentiment {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .sentiment-label {
    font-size: var(--text-xs);
    color: #969799;
  }
}

// 改进建议区域
.improvements-section {
  margin-bottom: 24px;
}

.improvements-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.improvement-item {
  background: var(--card-bg);
  padding: var(--spacing-md);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.improvement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.improvement-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: #323233;
  margin: 0;
}

.improvement-description {
  font-size: var(--text-sm);
  color: #646566;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.improvement-impact {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: 12px;

  .impact-label {
    font-size: var(--text-xs);
    color: #969799;
  }

  .impact-value {
    font-size: var(--text-xs);
    font-weight: 600;
    color: #1989fa;
  }
}

.improvement-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

// 加载状态
.van-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #1989fa;
  font-size: var(--text-sm);
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-communication-hub {
    max-width: 768px;
    margin: 0 auto;
  }

  .dashboard-cards {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }

  .content-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .engagement-info {
    margin-left: 0;
    width: 100%;
  }
}
</style>