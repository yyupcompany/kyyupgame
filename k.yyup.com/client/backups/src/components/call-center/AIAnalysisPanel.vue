<template>
  <div class="ai-analysis-panel">
    <!-- AI语音合成控制 -->
    <div class="voice-synthesis-card">
      <div class="synthesis-header">
        <h3>AI语音合成</h3>
        <el-tag :type="getSynthesisStatusType()" size="small">
          {{ getSynthesisStatusText() }}
        </el-tag>
      </div>
      <div class="synthesis-controls">
        <div class="model-selection">
          <label>语音模型:</label>
          <el-select v-model="selectedModel" size="small" style="width: 120px">
            <el-option label="豆包" value="doubao" />
            <el-option label="Azure" value="azure" />
          </el-select>
        </div>
        <div class="voice-selection">
          <label>语音音色:</label>
          <el-select v-model="selectedVoice" size="small" style="120: var(--container-lg)">
            <el-option label="女声" value="female" />
            <el-option label="男声" value="male" />
            <el-option label="童声" value="child" />
          </el-select>
        </div>
      </div>
      <div class="text-input-area">
        <el-input
          v-model="synthesisText"
          type="textarea"
          :rows="4"
          placeholder="输入要合成的文本内容..."
          maxlength="500"
          show-word-limit
        />
        <div class="synthesis-actions">
          <el-button
            type="primary"
            size="small"
            :loading="isSynthesizing"
            @click="handleSynthesize"
          >
            <LucideIcon name="Play" :size="14" />
            合成语音
          </el-button>
          <el-button
            v-if="synthesizedAudio"
            type="success"
            size="small"
            @click="playSynthesizedAudio"
          >
            <LucideIcon name="Volume2" :size="14" />
            播放
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI话术生成 -->
    <div class="script-generation-card">
      <div class="script-header">
        <h3>AI话术生成</h3>
        <el-tag type="primary" size="small">智能助手</el-tag>
      </div>
      <div class="script-controls">
        <el-form :model="scriptForm" label-width="80px" size="small">
          <el-form-item label="呼叫目的">
            <el-select v-model="scriptForm.callPurpose" placeholder="请选择呼叫目的">
              <el-option label="招生咨询" value="enrollment" />
              <el-option label="课程介绍" value="course" />
              <el-option label="活动邀请" value="activity" />
              <el-option label="回访跟进" value="followup" />
              <el-option label="满意度调查" value="survey" />
            </el-select>
          </el-form-item>
          <el-form-item label="客户姓名">
            <el-input v-model="scriptForm.customerName" placeholder="选填" />
          </el-form-item>
          <el-form-item label="孩子年龄">
            <el-input v-model="scriptForm.childAge" placeholder="选填，如：3岁" />
          </el-form-item>
        </el-form>
        <div class="script-actions">
          <el-button
            type="primary"
            size="small"
            :loading="isGeneratingScript"
            @click="handleGenerateScript"
          >
            <LucideIcon name="Sparkles" :size="14" />
            生成话术
          </el-button>
        </div>
      </div>
      <div v-if="generatedScript" class="generated-script">
        <div class="script-content">
          {{ generatedScript }}
        </div>
        <div class="script-actions">
          <el-button size="small" @click="handleCopyScript">
            <LucideIcon name="Copy" :size="12" />
            复制
          </el-button>
          <el-button size="small" @click="handleUseScript">
            <LucideIcon name="Check" :size="12" />
            使用此话术
          </el-button>
        </div>
      </div>
    </div>

    <!-- 合规审查 -->
    <div class="compliance-card">
      <div class="compliance-header">
        <h3>合规审查</h3>
        <el-tag v-if="complianceResult" :type="getComplianceType()" size="small">
          {{ getComplianceText() }}
        </el-tag>
      </div>
      <div class="compliance-controls">
        <el-input
          v-model="complianceText"
          type="textarea"
          :rows="3"
          placeholder="输入需要审查的内容..."
          maxlength="500"
          show-word-limit
        />
        <div class="compliance-actions">
          <el-button
            type="primary"
            size="small"
            :loading="isCheckingCompliance"
            @click="handleCheckCompliance"
          >
            <LucideIcon name="Shield" :size="14" />
            审查内容
          </el-button>
        </div>
      </div>
      <div v-if="complianceResult" class="compliance-result">
        <div class="compliance-score">
          <span class="label">合规分数:</span>
          <el-progress
            :percentage="complianceResult.complianceScore"
            :color="getComplianceColor()"
            :stroke-width="12"
          />
        </div>
        <div v-if="complianceResult.detectedWords.length > 0" class="detected-words">
          <span class="label">检测到敏感词:</span>
          <el-tag
            v-for="word in complianceResult.detectedWords"
            :key="word"
            type="danger"
            size="small"
            style="margin: var(--spacing-sm)"
          >
            {{ word }}
          </el-tag>
        </div>
        <div v-if="complianceResult.suggestions.length > 0" class="suggestions">
          <span class="label">修改建议:</span>
          <ul>
            <li v-for="(suggestion, index) in complianceResult.suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 实时转写 -->
    <div class="transcription-card">
      <div class="transcription-header">
        <h3>实时转写</h3>
        <el-tag v-if="isTranscribing" type="success" size="small">
          转写中
        </el-tag>
      </div>
      <div class="transcription-content">
        <div v-if="transcription" class="transcription-text">
          {{ transcription }}
        </div>
        <div v-else class="transcription-placeholder">
          暂无转写内容
        </div>
      </div>
      <div class="transcription-actions">
        <el-button size="small" @click="handleClearTranscription">
          <LucideIcon name="Trash2" :size="12" />
          清空
        </el-button>
        <el-button size="small" @click="handleCopyTranscription">
          <LucideIcon name="Copy" :size="12" />
          复制
        </el-button>
      </div>
    </div>

    <!-- 通话分析 -->
    <div v-if="callAnalysis" class="analysis-card">
      <div class="analysis-header">
        <h3>智能分析</h3>
        <el-button size="small" @click="handleRefreshAnalysis">
          <LucideIcon name="RefreshCw" :size="12" />
          刷新
        </el-button>
      </div>

      <!-- 情感分析 -->
      <div class="sentiment-analysis">
        <h4>情感分析</h4>
        <div class="sentiment-result">
          <el-tag :type="getSentimentType(callAnalysis.sentiment)" size="large">
            {{ getSentimentText(callAnalysis.sentiment) }}
          </el-tag>
          <div class="sentiment-score">
            满意度: {{ callAnalysis.customerSatisfaction }}/100
          </div>
        </div>
      </div>

      <!-- 关键词提取 -->
      <div class="keywords-analysis">
        <h4>关键词提取</h4>
        <div class="keywords-list">
          <el-tag
            v-for="keyword in callAnalysis.keywords"
            :key="keyword"
            type="info"
            size="small"
            class="keyword-tag"
          >
            {{ keyword }}
          </el-tag>
        </div>
      </div>

      <!-- 通话摘要 -->
      <div class="summary-analysis">
        <h4>通话摘要</h4>
        <div class="summary-content">
          {{ callAnalysis.summary }}
        </div>
      </div>

      <!-- 行动建议 -->
      <div class="action-items">
        <h4>行动建议</h4>
        <ul class="action-list">
          <li v-for="item in callAnalysis.actionItems" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <!-- AI辅助功能 -->
    <div class="ai-assistant-card">
      <div class="assistant-header">
        <h3>AI辅助</h3>
        <el-button size="small" @click="showAssistantDialog = true">
          <LucideIcon name="MessageCircle" :size="12" />
          对话
        </el-button>
      </div>
      <div class="quick-actions">
        <div class="action-button" @click="handleGenerateResponse">
          <LucideIcon name="Wand2" :size="16" />
          <span>生成回复</span>
        </div>
        <div class="action-button" @click="handleTranslateContent">
          <LucideIcon name="Languages" :size="16" />
          <span>翻译内容</span>
        </div>
        <div class="action-button" @click="handleExtractInfo">
          <LucideIcon name="FileText" :size="16" />
          <span>提取信息</span>
        </div>
        <div class="action-button" @click="handleSentimentAnalysis">
          <LucideIcon name="Heart" :size="16" />
          <span>情感分析</span>
        </div>
      </div>
    </div>

    <!-- AI助手对话框 -->
    <el-dialog
      v-model="showAssistantDialog"
      title="AI通话助手"
      width="500px"
      :before-close="handleAssistantDialogClose"
    >
      <div class="assistant-dialog-content">
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="message"
            :class="{ 'user': message.role === 'user', 'assistant': message.role === 'assistant' }"
          >
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        <div class="chat-input">
          <el-input
            v-model="chatInput"
            placeholder="输入您的问题..."
            @keyup.enter="handleSendMessage"
          >
            <template #append>
              <el-button @click="handleSendMessage" :loading="isSendingMessage">
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import LucideIcon from '@/components/icons/LucideIcon.vue'
import request from '@/utils/request'

interface CallAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  keywords: string[]
  summary: string
  actionItems: string[]
  customerSatisfaction: number
}

interface VoiceSynthesisStatus {
  enabled: boolean
  model: string
  status: string
}

interface Props {
  callAnalysis: CallAnalysis | null
  voiceSynthesisStatus: VoiceSynthesisStatus
  transcription: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  generateResponse: [callId: string]
  synthesizeVoice: [text: string]
}>()

// 响应式数据
const selectedModel = ref('doubao')
const selectedVoice = ref('female')
const synthesisText = ref('')
const isSynthesizing = ref(false)
const synthesizedAudio = ref<string | null>(null)

const isTranscribing = ref(false)

// AI话术生成
const scriptForm = ref({
  callPurpose: '',
  customerName: '',
  childAge: ''
})
const isGeneratingScript = ref(false)
const generatedScript = ref('')

// 合规审查
const complianceText = ref('')
const isCheckingCompliance = ref(false)
const complianceResult = ref<{
  isCompliant: boolean
  complianceScore: number
  detectedWords: string[]
  suggestions: string[]
  riskLevel: string
} | null>(null)

const showAssistantDialog = ref(false)
const chatMessages = ref([
  {
    role: 'assistant',
    content: '您好！我是您的AI通话助手，可以帮助您进行通话分析、生成回复、翻译内容等。请问有什么可以帮助您的吗？',
    timestamp: new Date()
  }
])
const chatInput = ref('')
const isSendingMessage = ref(false)
const chatMessagesRef = ref()

// 方法
const getSynthesisStatusType = () => {
  const statusMap: Record<string, string> = {
    'ready': 'success',
    'synthesizing': 'warning',
    'error': 'danger',
    'disabled': 'info'
  }
  return statusMap[props.voiceSynthesisStatus.status] || 'info'
}

const getSynthesisStatusText = () => {
  const textMap: Record<string, string> = {
    'ready': '就绪',
    'synthesizing': '合成中',
    'error': '错误',
    'disabled': '未启用'
  }
  return textMap[props.voiceSynthesisStatus.status] || '未知'
}

const getSentimentType = (sentiment: string) => {
  const typeMap: Record<string, string> = {
    'positive': 'success',
    'neutral': 'info',
    'negative': 'danger'
  }
  return typeMap[sentiment] || 'info'
}

const getSentimentText = (sentiment: string) => {
  const textMap: Record<string, string> = {
    'positive': '积极',
    'neutral': '中性',
    'negative': '消极'
  }
  return textMap[sentiment] || sentiment
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleSynthesize = async () => {
  if (!synthesisText.value.trim()) {
    ElMessage.warning('请输入要合成的文本')
    return
  }

  isSynthesizing.value = true
  try {
    console.log('🎤 [呼叫中心] 开始TTS语音合成测试')
    console.log(`   文本: ${synthesisText.value}`)
    console.log(`   模型: ${selectedModel.value}`)
    console.log(`   音色: ${selectedVoice.value}`)

    // 映射音色到火山引擎音色名称
    const voiceMap: Record<string, string> = {
      'female': 'zh_female_cancan_mars_bigtts',      // 灿灿女声
      'male': 'zh_male_qingsecunzheng_mars_bigtts',  // 青涩男声
      'child': 'zh_female_qingxin_mars_bigtts'       // 清新女声
    }

    const volcengineVoice = voiceMap[selectedVoice.value] || 'zh_female_cancan_mars_bigtts'
    console.log(`   火山引擎音色: ${volcengineVoice}`)

    // 调用呼叫中心TTS测试API
    const response = await request.post('/call-center/ai/tts/test', {
      text: synthesisText.value,
      voice: volcengineVoice,
      speed: 1.0,
      format: 'mp3'
    }, {
      responseType: 'arraybuffer',
      timeout: 60000
    })

    console.log('✅ [呼叫中心] TTS语音合成成功')
    console.log(`   音频大小: ${response.byteLength} bytes`)

    // 将ArrayBuffer转换为Blob
    const audioBlob = new Blob([response], { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(audioBlob)
    synthesizedAudio.value = audioUrl

    ElMessage.success(`语音合成完成 (${(response.byteLength / 1024).toFixed(2)} KB)`)

    // 触发父组件事件
    emit('synthesizeVoice', synthesisText.value)
  } catch (error: any) {
    console.error('❌ [呼叫中心] TTS语音合成失败:', error)
    ElMessage.error(error.message || '语音合成失败')
  } finally {
    isSynthesizing.value = false
  }
}

const playSynthesizedAudio = () => {
  if (synthesizedAudio.value) {
    const audio = new Audio(synthesizedAudio.value)
    audio.play().catch(error => {
      console.error('播放失败:', error)
      ElMessage.error('播放失败')
    })
  }
}

const handleClearTranscription = () => {
  emit('synthesizeVoice', '')
  ElMessage.success('转写内容已清空')
}

const handleCopyTranscription = async () => {
  if (props.transcription) {
    try {
      await navigator.clipboard.writeText(props.transcription)
      ElMessage.success('转写内容已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }
}

const handleRefreshAnalysis = () => {
  ElMessage.success('分析结果已刷新')
  // 这里可以触发父组件重新分析
}

const handleGenerateResponse = () => {
  ElMessage.info('正在生成智能回复...')
  emit('generateResponse', 'current-call-id')
}

const handleTranslateContent = () => {
  ElMessage.info('正在翻译内容...')
  // 这里可以实现翻译功能
}

const handleExtractInfo = () => {
  ElMessage.info('正在提取关键信息...')
  // 这里可以实现信息提取功能
}

const handleSentimentAnalysis = () => {
  ElMessage.info('正在进行情感分析...')
  // 这里可以实现情感分析功能
}

const handleSendMessage = async () => {
  if (!chatInput.value.trim()) return

  const userMessage = {
    role: 'user',
    content: chatInput.value,
    timestamp: new Date()
  }

  chatMessages.value.push(userMessage)
  const messageContent = chatInput.value
  chatInput.value = ''
  isSendingMessage.value = true

  // 滚动到底部
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }

  // 模拟AI回复
  setTimeout(() => {
    const aiResponse = {
      role: 'assistant',
      content: `根据您的通话内容，我建议您可以这样回复：这是一个很好的问题，让我为您详细解答...`,
      timestamp: new Date()
    }

    chatMessages.value.push(aiResponse)
    isSendingMessage.value = false

    // 滚动到底部
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  }, 1500)
}

const handleAssistantDialogClose = () => {
  showAssistantDialog.value = false
}

// AI话术生成
const handleGenerateScript = async () => {
  if (!scriptForm.value.callPurpose) {
    ElMessage.warning('请选择呼叫目的')
    return
  }

  isGeneratingScript.value = true
  try {
    console.log('🤖 [AI话术生成] 开始生成话术')
    console.log(`   呼叫目的: ${scriptForm.value.callPurpose}`)

    const response = await request.post('/call-center/ai/generate-script', {
      callPurpose: scriptForm.value.callPurpose,
      customerInfo: {
        name: scriptForm.value.customerName,
        childAge: scriptForm.value.childAge
      }
    })

    if (response.success) {
      generatedScript.value = response.data.script
      console.log('✅ [AI话术生成] 话术生成成功')
      ElMessage.success('话术生成成功')
    } else {
      throw new Error(response.message || '话术生成失败')
    }
  } catch (error: any) {
    console.error('❌ [AI话术生成] 失败:', error)
    ElMessage.error(error.message || 'AI话术生成失败')
  } finally {
    isGeneratingScript.value = false
  }
}

const handleCopyScript = async () => {
  if (generatedScript.value) {
    try {
      await navigator.clipboard.writeText(generatedScript.value)
      ElMessage.success('话术已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }
}

const handleUseScript = () => {
  if (generatedScript.value) {
    synthesisText.value = generatedScript.value
    ElMessage.success('话术已应用到语音合成')
  }
}

// 合规审查
const handleCheckCompliance = async () => {
  if (!complianceText.value.trim()) {
    ElMessage.warning('请输入需要审查的内容')
    return
  }

  isCheckingCompliance.value = true
  try {
    console.log('🔍 [合规审查] 开始审查内容')

    const response = await request.post('/call-center/ai/check-compliance', {
      content: complianceText.value
    })

    if (response.success) {
      complianceResult.value = response.data
      console.log('✅ [合规审查] 审查完成')
      console.log(`   合规分数: ${response.data.complianceScore}`)
      console.log(`   风险等级: ${response.data.riskLevel}`)

      if (response.data.isCompliant) {
        ElMessage.success('内容合规，可以使用')
      } else {
        ElMessage.warning(`检测到${response.data.detectedWords.length}个敏感词，请修改后使用`)
      }
    } else {
      throw new Error(response.message || '合规审查失败')
    }
  } catch (error: any) {
    console.error('❌ [合规审查] 失败:', error)
    ElMessage.error(error.message || '合规审查失败')
  } finally {
    isCheckingCompliance.value = false
  }
}

const getComplianceType = () => {
  if (!complianceResult.value) return 'info'
  return complianceResult.value.isCompliant ? 'success' : 'danger'
}

const getComplianceText = () => {
  if (!complianceResult.value) return '未审查'
  return complianceResult.value.isCompliant ? '合规' : '不合规'
}

const getComplianceColor = () => {
  if (!complianceResult.value) return 'var(--info-color)'
  const score = complianceResult.value.complianceScore
  if (score >= 80) return 'var(--success-color)'
  if (score >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}
</script>

<style scoped lang="scss">
.ai-analysis-panel {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
  height: 100%;
}

.voice-synthesis-card,
.script-generation-card,
.compliance-card,
.transcription-card,
.analysis-card,
.ai-assistant-card {
  background: var(--bg-color);
  border-radius: var(--text-sm);
  padding: var(--text-2xl);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
}

.synthesis-header,
.script-header,
.compliance-header,
.transcription-header,
.analysis-header,
.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);

  h3 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary, var(--text-primary));
  }
}

.synthesis-controls {
  display: flex;
  gap: var(--text-lg);
  margin-bottom: var(--text-lg);

  .model-selection,
  .voice-selection {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    label {
      font-size: var(--text-base);
      color: var(--text-secondary, var(--text-secondary));
      white-space: nowrap;
    }
  }
}

.text-input-area {
  .synthesis-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--text-sm);
    justify-content: flex-end;
  }
}

.transcription-content {
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
  padding: var(--text-sm);
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
  margin-bottom: var(--text-sm);

  .transcription-text {
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--text-primary, var(--text-primary));
    white-space: pre-wrap;
  }

  .transcription-placeholder {
    font-size: var(--text-base);
    color: var(--text-secondary, var(--text-secondary));
    font-style: italic;
    text-align: center;
    padding: var(--spacing-10xl) 0;
  }
}

.transcription-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

// AI话术生成样式
.script-controls {
  .script-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--text-sm);
    justify-content: flex-end;
  }
}

.generated-script {
  margin-top: var(--text-lg);
  padding: var(--text-sm);
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));

  .script-content {
    font-size: var(--text-base);
    line-height: 1.8;
    color: var(--text-primary, var(--text-primary));
    white-space: pre-wrap;
    margin-bottom: var(--text-sm);
  }

  .script-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
}

// 合规审查样式
.compliance-controls {
  .compliance-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--text-sm);
    justify-content: flex-end;
  }
}

.compliance-result {
  margin-top: var(--text-lg);
  padding: var(--text-sm);
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));

  .compliance-score {
    margin-bottom: var(--text-sm);

    .label {
      display: block;
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--text-primary, var(--text-primary));
      margin-bottom: var(--spacing-sm);
    }
  }

  .detected-words {
    margin-bottom: var(--text-sm);

    .label {
      display: block;
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--text-primary, var(--text-primary));
      margin-bottom: var(--spacing-sm);
    }
  }

  .suggestions {
    .label {
      display: block;
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--text-primary, var(--text-primary));
      margin-bottom: var(--spacing-sm);
    }

    ul {
      margin: 0;
      padding-left: var(--text-2xl);

      li {
        font-size: var(--text-sm);
        line-height: 1.6;
        color: var(--text-secondary, var(--text-secondary));
        margin-bottom: var(--spacing-xs);
      }
    }
  }
}

.sentiment-analysis,
.keywords-analysis,
.summary-analysis,
.action-items {
  margin-bottom: var(--text-2xl);

  h4 {
    margin: 0 0 var(--text-sm) 0;
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary, var(--text-primary));
  }
}

.sentiment-result {
  display: flex;
  align-items: center;
  gap: var(--text-lg);

  .sentiment-score {
    font-size: var(--text-base);
    color: var(--text-secondary, var(--text-secondary));
  }
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);

  .keyword-tag {
    margin: 0;
  }
}

.summary-content {
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text-primary, var(--text-primary));
  padding: var(--text-sm);
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
}

.action-list {
  margin: 0;
  padding-left: var(--text-2xl);

  li {
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--text-primary, var(--text-primary));
    margin-bottom: var(--spacing-sm);

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--text-sm);
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-lg) var(--text-sm);
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-color, var(--primary-color));
    border-color: var(--primary-color, var(--primary-color));
    color: white;

    .lucide-icon {
      color: white;
    }
  }

  span {
    font-size: var(--text-sm);
    font-weight: 500;
    text-align: center;
  }

  .lucide-icon {
    color: var(--text-secondary, var(--text-secondary));
  }
}

.assistant-dialog-content {
  .chat-messages {
    height: 400px;
    overflow-y: auto;
    padding: var(--text-lg);
    background: var(--bg-secondary, #f9fafb);
    border-radius: var(--spacing-sm);
    margin-bottom: var(--text-lg);

    .message {
      margin-bottom: var(--text-lg);

      &.user {
        text-align: right;

        .message-content {
          background: var(--primary-color, var(--primary-color));
          color: white;
          margin-left: auto;
        }
      }

      &.assistant {
        text-align: left;

        .message-content {
          background: white;
          color: var(--text-primary, var(--text-primary));
          margin-right: auto;
        }
      }

      .message-content {
        display: inline-block;
        max-width: 80%;
        padding: var(--text-sm) var(--text-lg);
        border-radius: var(--text-sm);
        font-size: var(--text-base);
        line-height: 1.5;
        box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
      }

      .message-time {
        font-size: var(--text-sm);
        color: var(--text-secondary, var(--text-secondary));
        margin-top: var(--spacing-xs);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .synthesis-controls {
    flex-direction: column;
    gap: var(--text-sm);
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .sentiment-result {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}

// 暗黑主题
.dark {
  .voice-synthesis-card,
  .transcription-card,
  .analysis-card,
  .ai-assistant-card {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
    box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--shadow-heavy);
  }

  .synthesis-header h3,
  .transcription-header h3,
  .analysis-header h3,
  .assistant-header h3 {
    color: var(--white-alpha-90);
  }

  .transcription-content {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .transcription-text {
    color: var(--white-alpha-90);
  }

  .summary-content {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .action-button {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .chat-messages {
    background: rgba(71, 85, 105, 0.2);
  }

  .message.assistant .message-content {
    background: rgba(30, 41, 59, 0.8);
    color: var(--white-alpha-90);
  }
}

// html.dark 兼容性
html.dark {
  .voice-synthesis-card,
  .transcription-card,
  .analysis-card,
  .ai-assistant-card {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
    box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--shadow-heavy);
  }

  .synthesis-header h3,
  .transcription-header h3,
  .analysis-header h3,
  .assistant-header h3 {
    color: var(--white-alpha-90);
  }

  .transcription-content {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .transcription-text {
    color: var(--white-alpha-90);
  }

  .summary-content {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .action-button {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .chat-messages {
    background: rgba(71, 85, 105, 0.2);
  }

  .message.assistant .message-content {
    background: rgba(30, 41, 59, 0.8);
    color: var(--white-alpha-90);
  }
}
</style>