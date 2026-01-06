<template>
  <div class="tts-timeline">
    <!-- 左侧Timeline区域 -->
    <div class="timeline-section">
      <div class="timeline-header">
        <h3>文字转语音</h3>
        <p>5步完成语音生成</p>
      </div>
      
      <div class="timeline-container">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="timeline-item"
          :class="{
            'active': currentStep === step.id,
            'completed': step.status === 'completed',
            'in-progress': step.status === 'in-progress',
            'pending': step.status === 'pending'
          }"
          @click="goToStep(step.id)"
        >
          <div class="timeline-marker">
            <div class="timeline-dot">
              <UnifiedIcon name="Check" />
              <UnifiedIcon name="default" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="timeline-line" v-if="index < steps.length - 1"></div>
          </div>
          
          <div class="timeline-content">
            <div class="timeline-title">{{ step.title }}</div>
            <div class="timeline-description">{{ step.description }}</div>
            <div class="timeline-meta">
              <span class="timeline-status" :class="step.status">
                {{ getStatusText(step.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="content-section">
      <!-- 步骤1: 输入文本 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="step-header">
          <h3>步骤1: 输入文本</h3>
          <p>输入要转换为语音的文字内容</p>
        </div>

        <el-form :model="formData" label-width="100px" class="step-form">
          <el-form-item label="文本内容" required>
            <el-input
              v-model="formData.text"
              type="textarea"
              :rows="10"
              placeholder="请输入要转换为语音的文字内容（最多4096个字符）"
              maxlength="4096"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="快速模板">
            <div class="template-buttons">
              <el-button size="small" @click="applyTemplate('enrollment')">
                招生宣传语音
              </el-button>
              <el-button size="small" @click="applyTemplate('activity')">
                活动通知语音
              </el-button>
            </div>
          </el-form-item>

          <div class="step-actions">
            <el-button type="primary" size="large" @click="nextStep" :disabled="!formData.text">
              下一步
              <UnifiedIcon name="ArrowRight" />
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 步骤2: 选择音色 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="step-header">
          <h3>步骤2: 选择音色</h3>
          <p>选择适合的语音音色</p>
        </div>

        <el-form :model="formData" label-width="100px" class="step-form">
          <el-form-item label="音色选择" required>
            <el-radio-group v-model="formData.voice" size="large" class="voice-group">
              <el-radio-button value="alloy">
                <div class="voice-option">
                  <span class="voice-icon">👩</span>
                  <span class="voice-name">女声-温柔</span>
                </div>
              </el-radio-button>
              <el-radio-button value="nova">
                <div class="voice-option">
                  <span class="voice-icon">👩‍🦰</span>
                  <span class="voice-name">女声-活泼</span>
                </div>
              </el-radio-button>
              <el-radio-button value="shimmer">
                <div class="voice-option">
                  <span class="voice-icon">👩‍💼</span>
                  <span class="voice-name">女声-专业</span>
                </div>
              </el-radio-button>
              <el-radio-button value="echo">
                <div class="voice-option">
                  <span class="voice-icon">👨</span>
                  <span class="voice-name">男声-沉稳</span>
                </div>
              </el-radio-button>
              <el-radio-button value="fable">
                <div class="voice-option">
                  <span class="voice-icon">👨‍🦱</span>
                  <span class="voice-name">男声-年轻</span>
                </div>
              </el-radio-button>
              <el-radio-button value="onyx">
                <div class="voice-option">
                  <span class="voice-icon">👨‍💼</span>
                  <span class="voice-name">男声-磁性</span>
                </div>
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <div class="step-actions">
            <el-button size="large" @click="prevStep">
              <UnifiedIcon name="ArrowLeft" />
              上一步
            </el-button>
            <el-button type="primary" size="large" @click="nextStep">
              下一步
              <UnifiedIcon name="ArrowRight" />
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 步骤3: 调节参数 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="step-header">
          <h3>步骤3: 调节参数</h3>
          <p>设置语速和输出格式</p>
        </div>

        <el-form :model="formData" label-width="100px" class="step-form">
          <el-form-item label="语速">
            <div class="speed-control">
              <el-slider
                v-model="formData.speed"
                :min="0.25"
                :max="4"
                :step="0.25"
                show-stops
              />
              <div class="speed-display">
                当前语速：<strong>{{ formData.speed }}x</strong>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="输出格式">
            <el-radio-group v-model="formData.format" size="large">
              <el-radio-button value="mp3">MP3</el-radio-button>
              <el-radio-button value="opus">Opus</el-radio-button>
              <el-radio-button value="aac">AAC</el-radio-button>
              <el-radio-button value="flac">FLAC</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <div class="step-actions">
            <el-button size="large" @click="prevStep">
              <UnifiedIcon name="ArrowLeft" />
              上一步
            </el-button>
            <el-button type="primary" size="large" @click="nextStep">
              下一步
              <UnifiedIcon name="ArrowRight" />
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 步骤4: 生成语音 -->
      <div v-show="currentStep === 4" class="step-content">
        <div class="step-header">
          <h3>步骤4: 生成语音</h3>
          <p>AI正在为您生成语音文件</p>
        </div>

        <div class="generation-area">
          <div v-if="!audioUrl && !generating" class="generation-prompt">
            <UnifiedIcon name="default" />
            <h4>准备就绪</h4>
            <p>点击下方按钮开始生成语音</p>
            <el-button type="primary" size="large" @click="generateSpeech">
              <UnifiedIcon name="default" />
              开始生成
            </el-button>
          </div>

          <div v-else-if="generating" class="generating-state">
            <UnifiedIcon name="default" />
            <h4>语音生成中...</h4>
            <p>正在将文字转换为语音</p>
            <el-progress :percentage="generationProgress" :stroke-width="8" />
          </div>

          <div v-else-if="audioUrl" class="generation-success">
            <el-result icon="success" title="语音生成成功！" sub-title="正在自动跳转到预览页面...">
              <template #extra>
                <div class="auto-redirect-hint">
                  <UnifiedIcon name="default" />
                  <span>1秒后自动跳转...</span>
                </div>
              </template>
            </el-result>
          </div>
        </div>

        <div class="step-actions" v-if="!generating">
          <el-button size="large" @click="prevStep">
            <UnifiedIcon name="ArrowLeft" />
            上一步
          </el-button>
        </div>
      </div>

      <!-- 步骤5: 预览和下载 -->
      <div v-show="currentStep === 5" class="step-content">
        <div class="step-header">
          <h3>步骤5: 预览和下载</h3>
          <p>播放预览并下载语音文件</p>
        </div>

        <div class="preview-area">
          <div class="audio-player-card">
            <div class="audio-info">
              <UnifiedIcon name="default" />
              <div class="audio-details">
                <div class="audio-title">生成的语音文件</div>
                <div class="audio-meta">
                  <span>音色: {{ getVoiceLabel(formData.voice) }}</span>
                  <span>语速: {{ formData.speed }}x</span>
                  <span>格式: {{ formData.format.toUpperCase() }}</span>
                </div>
              </div>
            </div>
            
            <audio v-if="audioUrl" :src="audioUrl" controls class="audio-player"></audio>
            
            <div class="audio-actions">
              <el-button type="primary" size="large" @click="downloadAudio">
                <UnifiedIcon name="Download" />
                下载语音文件
              </el-button>
              <el-button type="success" size="large" @click="saveAudio">
                <UnifiedIcon name="Check" />
                保存到历史
              </el-button>
              <el-button size="large" @click="resetForm">
                <UnifiedIcon name="Refresh" />
                生成新语音
              </el-button>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <el-button size="large" @click="prevStep">
            <UnifiedIcon name="ArrowLeft" />
            上一步
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Check,
  Loading,
  ArrowRight,
  ArrowLeft,
  Microphone,
  Refresh,
  Download
} from '@element-plus/icons-vue'
import { request } from '@/utils/request'

// Props and Emits
const emit = defineEmits(['audio-created'])

// 步骤定义
const steps = ref([
  {
    id: 1,
    title: '输入文本',
    description: '输入要转换的文字内容',
    status: 'in-progress'
  },
  {
    id: 2,
    title: '选择音色',
    description: '选择适合的语音音色',
    status: 'pending'
  },
  {
    id: 3,
    title: '调节参数',
    description: '设置语速和输出格式',
    status: 'pending'
  },
  {
    id: 4,
    title: '生成语音',
    description: 'AI生成语音文件',
    status: 'pending'
  },
  {
    id: 5,
    title: '预览和下载',
    description: '播放预览并下载',
    status: 'pending'
  }
])

// 当前步骤
const currentStep = ref(1)

// 表单数据
const formData = ref({
  text: '',
  voice: 'nova',
  speed: 1.0,
  format: 'mp3'
})

// 生成状态
const generating = ref(false)
const generationProgress = ref(0)
const audioUrl = ref('')

// 模板
const templates = {
  enrollment: `亲爱的家长朋友们，我们幼儿园春季招生火热进行中！我们拥有优质的教育资源、专业的师资力量、丰富的课程特色。欢迎您带着宝贝来参观体验！`,
  activity: `各位家长请注意，本周六上午9点，我们将举办亲子运动会。请家长们准时参加，和孩子们一起享受快乐时光！`
}

// 步骤导航
const goToStep = (stepId: number) => {
  const targetStep = steps.value.find(s => s.id === stepId)
  if (targetStep && (targetStep.status === 'completed' || targetStep.status === 'in-progress')) {
    currentStep.value = stepId
  }
}

const nextStep = () => {
  if (currentStep.value < steps.value.length) {
    const current = steps.value.find(s => s.id === currentStep.value)
    if (current) current.status = 'completed'

    currentStep.value++

    const next = steps.value.find(s => s.id === currentStep.value)
    if (next) next.status = 'in-progress'
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    const current = steps.value.find(s => s.id === currentStep.value)
    if (current) current.status = 'pending'

    currentStep.value--

    const prev = steps.value.find(s => s.id === currentStep.value)
    if (prev) prev.status = 'in-progress'
  }
}

// 应用模板
const applyTemplate = (templateKey: string) => {
  formData.value.text = templates[templateKey as keyof typeof templates]
  ElMessage.success('模板已应用')
}

// 生成语音
const generateSpeech = async () => {
  generating.value = true
  generationProgress.value = 0

  const progressInterval = setInterval(() => {
    if (generationProgress.value < 90) {
      generationProgress.value += 10
    }
  }, 300)

  try {
    const response = await request.post('/ai/text-to-speech', {
      text: formData.value.text,
      voice: formData.value.voice,
      speed: formData.value.speed,
      format: formData.value.format
    }, {
      responseType: 'blob'
    })

    const blob = new Blob([response], { type: `audio/${formData.value.format}` })
    audioUrl.value = URL.createObjectURL(blob)
    generationProgress.value = 100
    ElMessage.success('语音生成成功！')

    // 等待一下让用户看到成功提示，然后自动跳转到预览步骤
    setTimeout(() => {
      nextStep()
    }, 1000)
  } catch (error) {
    console.error('生成语音失败:', error)
    ElMessage.error('生成失败，使用模拟音频')

    // 使用模拟音频数据作为降级方案
    // 创建一个简单的静音音频（1秒）
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const sampleRate = audioContext.sampleRate
    const duration = 1 // 1秒
    const numSamples = sampleRate * duration
    const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate)

    // 将AudioBuffer转换为WAV格式的Blob
    const wavBlob = audioBufferToWav(audioBuffer)
    audioUrl.value = URL.createObjectURL(wavBlob)
    generationProgress.value = 100

    // 即使使用模拟数据也自动跳转
    setTimeout(() => {
      nextStep()
    }, 1000)
  } finally {
    clearInterval(progressInterval)
    generating.value = false
  }
}

// 将AudioBuffer转换为WAV格式
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44
  const arrayBuffer = new ArrayBuffer(length)
  const view = new DataView(arrayBuffer)
  const channels: Float32Array[] = []
  let offset = 0
  let pos = 0

  // 写入WAV文件头
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true)
    pos += 2
  }
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true)
    pos += 4
  }

  // RIFF标识符
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // 文件长度
  setUint32(0x45564157) // "WAVE"

  // fmt子块
  setUint32(0x20746d66) // "fmt "
  setUint32(16) // 子块大小
  setUint16(1) // 音频格式 (PCM)
  setUint16(buffer.numberOfChannels)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels) // 字节率
  setUint16(buffer.numberOfChannels * 2) // 块对齐
  setUint16(16) // 位深度

  // data子块
  setUint32(0x61746164) // "data"
  setUint32(length - pos - 4) // 数据长度

  // 写入音频数据
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  offset = pos
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

// 重新生成
const regenerate = () => {
  audioUrl.value = ''
  generateSpeech()
}

// 下载音频
const downloadAudio = () => {
  if (!audioUrl.value) return

  const link = document.createElement('a')
  link.href = audioUrl.value
  link.download = `语音_${Date.now()}.${formData.value.format}`
  link.click()

  ElMessage.success('下载成功')
}

// 保存音频
const saveAudio = () => {
  if (!audioUrl.value) return

  const audio = {
    text: formData.value.text,
    voice: formData.value.voice,
    speed: formData.value.speed,
    format: formData.value.format
  }

  emit('audio-created', audio)
  ElMessage.success('已保存到历史记录')
}

// 重置表单
const resetForm = () => {
  formData.value = {
    text: '',
    voice: 'nova',
    speed: 1.0,
    format: 'mp3'
  }
  audioUrl.value = ''
  currentStep.value = 1

  steps.value.forEach((step, index) => {
    if (index === 0) {
      step.status = 'in-progress'
    } else {
      step.status = 'pending'
    }
  })

  ElMessage.success('已重置，可以开始新的生成')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待处理'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 获取音色标签
const getVoiceLabel = (voice: string) => {
  const voiceMap = {
    'alloy': '女声-温柔',
    'nova': '女声-活泼',
    'shimmer': '女声-专业',
    'echo': '男声-沉稳',
    'fable': '男声-年轻',
    'onyx': '男声-磁性'
  }
  return voiceMap[voice as keyof typeof voiceMap] || voice
}
</script>

<style scoped lang="scss">
// 复用文案创作的timeline样式
.tts-timeline {
  display: flex;
  height: calc(100vh - 120px);
  gap: var(--text-3xl);
  background: var(--el-bg-color-page);
}

.timeline-section {
  flex: 0 0 40%;
  max-width: 100%; max-width: 480px;
  min-width: 100%; max-width: 360px;
  background: var(--el-bg-color);
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--text-sm) var(--black-alpha-8);
  overflow-y: auto;
  border: var(--border-width-base) solid var(--el-border-color-light);

  // 暗黑模式优化
  html.dark & {
    background: var(--white-alpha-5);
    border-color: var(--white-alpha-10);
  }
}

.timeline-header {
  margin-bottom: var(--text-3xl);

  h3 {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;

    html.dark & {
      color: var(--white-alpha-95);
    }
  }

  p {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: 0;

    html.dark & {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

.timeline-item {
  display: flex;
  margin-bottom: var(--text-3xl);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(var(--spacing-xs));
  }

  &.active {
    .timeline-content {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(99, 102, 241, 0.15);
    }

    .timeline-dot {
      background: linear-gradient(135deg, var(--primary-color), var(--ai-primary));
      color: white;
      transform: scale(1.2);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(99, 102, 241, 0.3);
    }
  }

  &.completed .timeline-dot {
    background: linear-gradient(135deg, var(--success-color), #059669);
    color: white;
    box-shadow: 0 2px var(--spacing-sm) rgba(16, 185, 129, 0.3);
  }

  &.in-progress .timeline-dot {
    background: linear-gradient(135deg, var(--warning-color), #d97706);
    color: white;
    box-shadow: 0 2px var(--spacing-sm) rgba(245, 158, 11, 0.3);
  }

  &.pending .timeline-dot {
    background: var(--el-fill-color);
    color: var(--el-text-color-secondary);
  }
}

.timeline-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: var(--text-lg);
}

.timeline-dot {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-base);
  transition: all 0.3s ease;
  z-index: var(--z-index-dropdown);
}

.timeline-line {
  width: auto;
  flex: 1;
  min-height: var(--button-height-lg);
  background: var(--el-border-color);
  margin-top: var(--spacing-sm);
}

.timeline-content {
  flex: 1;
  padding: var(--text-sm) var(--text-lg);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
  border-radius: var(--spacing-sm);
  background: var(--el-bg-color);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--el-color-primary-light-7);
    box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-8);
  }

  html.dark & {
    background: var(--white-alpha-3);
    border-color: var(--white-alpha-8);

    &:hover {
      background: var(--white-alpha-5);
      border-color: var(--el-color-primary);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy);
    }
  }
}

.timeline-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-base);

  html.dark & {
    color: var(--white-alpha-90);
  }
}

.timeline-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-sm);

  html.dark & {
    color: var(--white-alpha-60);
  }
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-status {
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--text-sm);
  font-size: var(--text-xs);
  font-weight: 500;

  &.completed {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
    border: var(--border-width-base) solid rgba(16, 185, 129, 0.2);
  }

  &.in-progress {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
    border: var(--border-width-base) solid rgba(245, 158, 11, 0.2);
  }

  &.pending {
    background: rgba(107, 114, 128, 0.1);
    color: var(--text-secondary);
    border: var(--border-width-base) solid rgba(107, 114, 128, 0.2);
  }
}

.content-section {
  flex: 1;
  background: var(--el-bg-color);
  border-radius: var(--text-sm);
  padding: var(--spacing-3xl);
  box-shadow: 0 2px var(--text-sm) var(--black-alpha-8);
  overflow-y: auto;
  border: var(--border-width-base) solid var(--el-border-color-light);

  html.dark & {
    background: var(--white-alpha-5);
    border-color: var(--white-alpha-10);
  }
}

.step-content {
  max-width: 100%; max-width: 800px;
  margin: 0 auto;
}

.step-header {
  margin-bottom: var(--spacing-3xl);

  h3 {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;

    html.dark & {
      color: var(--white-alpha-95);
    }
  }

  p {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: 0;

    html.dark & {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

.step-form {
  .el-form-item {
    margin-bottom: var(--text-3xl);
  }

  // 暗黑模式下的表单优化
  html.dark & {
    :deep(.el-input__wrapper) {
      background-color: var(--white-alpha-8);
      box-shadow: 0 0 0 var(--border-width-base) var(--glass-bg-medium) inset;

      &:hover {
        box-shadow: 0 0 0 var(--border-width-base) var(--glass-bg-heavy) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 var(--border-width-base) var(--el-color-primary) inset;
      }
    }

    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
      color: var(--white-alpha-90);
      background-color: transparent;

      &::placeholder {
        color: var(--white-alpha-40);
      }
    }

    :deep(.el-select .el-input__inner) {
      color: var(--white-alpha-90);
    }

    :deep(.el-form-item__label) {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-3xl);
  padding-top: var(--text-3xl);
  border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
}

.template-buttons {
  display: flex;
  gap: var(--text-sm);
}

.voice-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--text-sm);
  width: 100%;
}

.voice-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);

  .voice-icon {
    font-size: var(--text-3xl);
  }

  .voice-name {
    font-size: var(--text-sm);
  }
}

.speed-control {
  width: 100%;

  .speed-display {
    margin-top: var(--text-sm);
    text-align: center;
    font-size: var(--text-base);
    color: var(--el-text-color-regular);

    strong {
      color: var(--el-color-primary);
      font-size: var(--text-lg);
    }
  }
}

.generation-area,
.preview-area {
  min-min-height: 60px; height: auto;
}

.generation-prompt,
.generating-state {
  text-align: center;
  padding: var(--spacing-15xl) var(--text-2xl);

  .prompt-icon,
  .loading-icon {
    font-size: var(--text-6xl);
    color: var(--el-color-primary);
    margin-bottom: var(--text-3xl);
  }

  h4 {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }

  p {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: 0 0 var(--text-3xl) 0;
  }
}

.audio-player-card {
  background: var(--el-fill-color-light);
  border-radius: var(--text-sm);
  padding: var(--spacing-3xl);

  .audio-info {
    display: flex;
    align-items: center;
    gap: var(--text-lg);
    margin-bottom: var(--text-3xl);

    .audio-icon {
      font-size: var(--text-5xl);
      color: var(--el-color-primary);
    }

    .audio-details {
      flex: 1;

      .audio-title {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: var(--spacing-sm);
      }

      .audio-meta {
        display: flex;
        gap: var(--text-lg);
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }
  }

  .audio-player {
    width: 100%;
    margin-bottom: var(--text-3xl);
  }

  .audio-actions {
    display: flex;
    gap: var(--text-sm);
    justify-content: center;
    flex-wrap: wrap;
  }
}

.generation-success {
  .auto-redirect-hint {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    justify-content: center;
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);

    .loading-icon {
      font-size: var(--text-2xl);
      color: var(--el-color-primary);
      animation: rotate 1s linear infinite;
    }

    html.dark & {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>


