<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="通话录音播放"
    width="600px"
    :before-close="handleClose"
  >
    <div v-if="recording" class="recording-content">
      <!-- 录音信息 -->
      <div class="recording-info">
        <div class="info-header">
          <h3>通话信息</h3>
          <el-tag :type="getStatusType(recording.status)" size="small">
            {{ getStatusText(recording.status) }}
          </el-tag>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">联系人:</span>
            <span class="value">{{ recording.contactName || recording.phoneNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">电话号码:</span>
            <span class="value">{{ recording.phoneNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">通话时间:</span>
            <span class="value">{{ formatDateTime(recording.startTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">通话时长:</span>
            <span class="value">{{ formatDuration(recording.duration) }}</span>
          </div>
          <div class="info-item">
            <span class="label">文件大小:</span>
            <span class="value">{{ formatFileSize(recording.fileSize) }}</span>
          </div>
          <div class="info-item">
            <span class="label">录音质量:</span>
            <span class="value">{{ recording.quality || '高清' }}</span>
          </div>
        </div>
      </div>

      <!-- 音频播放器 -->
      <div class="audio-player">
        <div class="player-header">
          <h3>音频播放器</h3>
          <div class="player-controls">
            <el-button-group>
              <el-button size="small" @click="handlePlay">
                <LucideIcon :name="isPlaying ? 'Pause' : 'Play'" :size="14" />
                {{ isPlaying ? '暂停' : '播放' }}
              </el-button>
              <el-button size="small" @click="handleStop">
                <LucideIcon name="Square" :size="14" />
                停止
              </el-button>
              <el-button size="small" @click="handleDownload">
                <LucideIcon name="Download" :size="14" />
                下载
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="progress-section">
          <div class="progress-bar">
            <el-slider
              v-model="progress"
              :max="100"
              :show-tooltip="false"
              @change="handleSeek"
            />
          </div>
          <div class="time-display">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="total-time">{{ formatTime(totalDuration) }}</span>
          </div>
        </div>

        <!-- 音频波形显示 -->
        <div class="waveform-container">
          <canvas ref="waveformRef" class="waveform-canvas" />
        </div>

        <!-- 音量控制 -->
        <div class="volume-control">
          <LucideIcon name="Volume2" :size="16" />
          <el-slider
            v-model="volume"
            :max="100"
            style="width: 120px; margin: 0 var(--text-sm)"
            @change="handleVolumeChange"
          />
          <span class="volume-value">{{ volume }}%</span>
        </div>

        <!-- 播放速度控制 -->
        <div class="speed-control">
          <span class="speed-label">播放速度:</span>
          <el-select v-model="playbackRate" size="small" style="width: 100px" @change="handleSpeedChange">
            <el-option label="0.5x" :value="0.5" />
            <el-option label="0.75x" :value="0.75" />
            <el-option label="1.0x" :value="1.0" />
            <el-option label="1.25x" :value="1.25" />
            <el-option label="1.5x" :value="1.5" />
            <el-option label="2.0x" :value="2.0" />
          </el-select>
        </div>
      </div>

      <!-- 转写内容 -->
      <div v-if="recording.transcript" class="transcript-section">
        <div class="transcript-header">
          <h3>通话转写</h3>
          <div class="transcript-actions">
            <el-button size="small" @click="handleCopyTranscript">
              <LucideIcon name="Copy" :size="12" />
              复制
            </el-button>
            <el-button size="small" @click="handleDownloadTranscript">
              <LucideIcon name="Download" :size="12" />
              下载
            </el-button>
          </div>
        </div>
        <div class="transcript-content">
          <div class="transcript-text">
            {{ recording.transcript }}
          </div>
        </div>
      </div>

      <!-- AI分析结果 -->
      <div v-if="recording.analysis" class="analysis-section">
        <div class="analysis-header">
          <h3>智能分析</h3>
          <el-button size="small" @click="handleRefreshAnalysis">
            <LucideIcon name="RefreshCw" :size="12" />
            刷新
          </el-button>
        </div>
        <div class="analysis-content">
          <div class="analysis-grid">
            <div class="analysis-item">
              <div class="analysis-label">情感倾向</div>
              <div class="analysis-value">
                <el-tag :type="getSentimentType(recording.analysis.sentiment)">
                  {{ getSentimentText(recording.analysis.sentiment) }}
                </el-tag>
              </div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label">客户满意度</div>
              <div class="analysis-value">
                {{ recording.analysis.satisfaction }}/100
              </div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label">关键词</div>
              <div class="analysis-value">
                <el-tag
                  v-for="keyword in recording.analysis.keywords"
                  :key="keyword"
                  size="small"
                  type="info"
                  class="keyword-tag"
                >
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="analysis-summary">
            <div class="summary-label">通话摘要</div>
            <div class="summary-content">
              {{ recording.analysis.summary }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-recording">
      <LucideIcon name="FileAudio" :size="48" />
      <p>暂无录音信息</p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="recording" type="primary" @click="handleDownload">
          下载录音
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import LucideIcon from '@/components/icons/LucideIcon.vue'

interface CallAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  satisfaction: number
  keywords: string[]
  summary: string
}

interface CallRecording {
  id: string
  phoneNumber: string
  contactName?: string
  startTime: Date
  duration: number
  status: 'connected' | 'missed' | 'ended'
  fileSize: number
  quality?: string
  transcript?: string
  analysis?: CallAnalysis
  audioUrl?: string
}

interface Props {
  visible: boolean
  recording: CallRecording | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
}>()

// 响应式数据
const isPlaying = ref(false)
const currentTime = ref(0)
const totalDuration = ref(0)
const progress = ref(0)
const volume = ref(80)
const playbackRate = ref(1.0)
const waveformRef = ref<HTMLCanvasElement>()
const audioRef = ref<HTMLAudioElement | null>(null)

// 计算属性
const recordingDuration = computed(() => {
  return props.recording?.duration || 0
})

// 方法
const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'connected': 'success',
    'missed': 'danger',
    'ended': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'connected': '已接通',
    'missed': '未接通',
    'ended': '已结束'
  }
  return textMap[status] || status
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

const handlePlay = () => {
  if (!audioRef.value) return

  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const handleStop = () => {
  if (!audioRef.value) return

  audioRef.value.pause()
  audioRef.value.currentTime = 0
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
}

const handleSeek = (value: number) => {
  if (!audioRef.value) return

  const time = (value / 100) * totalDuration.value
  audioRef.value.currentTime = time
  currentTime.value = time
}

const handleVolumeChange = (value: number) => {
  if (!audioRef.value) return

  audioRef.value.volume = value / 100
}

const handleSpeedChange = (rate: number) => {
  if (!audioRef.value) return

  audioRef.value.playbackRate = rate
}

const handleDownload = () => {
  if (!props.recording) return

  // 模拟下载
  ElMessage.success('开始下载录音文件...')

  const link = document.createElement('a')
  link.href = props.recording.audioUrl || '#'
  link.download = `recording_${props.recording.id}.mp3`
  link.click()
}

const handleCopyTranscript = async () => {
  if (!props.recording?.transcript) return

  try {
    await navigator.clipboard.writeText(props.recording.transcript)
    ElMessage.success('转写内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleDownloadTranscript = () => {
  if (!props.recording?.transcript) return

  const blob = new Blob([props.recording.transcript], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transcript_${props.recording.id}.txt`
  link.click()
  URL.revokeObjectURL(url)

  ElMessage.success('转写内容下载完成')
}

const handleRefreshAnalysis = () => {
  ElMessage.success('分析结果已刷新')
}

const drawWaveform = () => {
  if (!waveformRef.value) return

  const canvas = waveformRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  canvas.width = canvas.offsetWidth * 2
  canvas.height = canvas.offsetHeight * 2
  ctx.scale(2, 2)

  const width = canvas.offsetWidth
  const height = canvas.offsetHeight

  // 清除画布
  ctx.clearRect(0, 0, width, height)

  // 绘制模拟波形
  ctx.strokeStyle = 'var(--primary-color)'
  ctx.lineWidth = 2
  ctx.beginPath()

  const amplitude = height / 3
  const frequency = 0.02

  for (let x = 0; x < width; x++) {
    const y = height / 2 + amplitude * Math.sin(x * frequency) * Math.random()
    if (x === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()
}

const handleClose = () => {
  handleStop()
  emit('update:visible', false)
}

// 音频事件处理
const handleAudioLoaded = () => {
  if (!audioRef.value) return

  totalDuration.value = audioRef.value.duration
  currentTime.value = 0
  progress.value = 0
}

const handleAudioTimeUpdate = () => {
  if (!audioRef.value) return

  currentTime.value = audioRef.value.currentTime
  if (totalDuration.value > 0) {
    progress.value = (currentTime.value / totalDuration.value) * 100
  }
}

const handleAudioEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
}

// 生命周期
onMounted(async () => {
  await nextTick()
  drawWaveform()

  // 创建音频元素
  if (props.recording?.audioUrl) {
    audioRef.value = new Audio(props.recording.audioUrl)
    audioRef.value.addEventListener('loadedmetadata', handleAudioLoaded)
    audioRef.value.addEventListener('timeupdate', handleAudioTimeUpdate)
    audioRef.value.addEventListener('ended', handleAudioEnded)
    audioRef.value.volume = volume.value / 100
    audioRef.value.playbackRate = playbackRate.value
  }
})

onUnmounted(() => {
  handleStop()

  if (audioRef.value) {
    audioRef.value.removeEventListener('loadedmetadata', handleAudioLoaded)
    audioRef.value.removeEventListener('timeupdate', handleAudioTimeUpdate)
    audioRef.value.removeEventListener('ended', handleAudioEnded)
    audioRef.value = null
  }
})
</script>

<style scoped lang="scss">
.recording-content {
  .recording-info,
  .audio-player,
  .transcript-section,
  .analysis-section {
    background: var(--bg-secondary, #f9fafb);
    border-radius: var(--text-sm);
    padding: var(--text-2xl);
    margin-bottom: var(--text-2xl);
    border: var(--border-width-base) solid var(--border-primary, var(--border-color));
  }

  .info-header,
  .player-header,
  .transcript-header,
  .analysis-header {
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

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-sm);

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;

      .label {
        font-size: var(--text-base);
        color: var(--text-secondary, var(--text-secondary));
      }

      .value {
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--text-primary, var(--text-primary));
      }
    }
  }

  .progress-section {
    margin-bottom: var(--text-2xl);

    .progress-bar {
      margin-bottom: var(--spacing-sm);
    }

    .time-display {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-sm);
      color: var(--text-secondary, var(--text-secondary));
    }
  }

  .waveform-container {
    height: 80px;
    margin-bottom: var(--text-2xl);
    border: var(--border-width-base) solid var(--border-primary, var(--border-color));
    border-radius: var(--spacing-sm);
    overflow: hidden;
    background: white;
  }

  .waveform-canvas {
    width: 100%;
    height: 100%;
  }

  .volume-control,
  .speed-control {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--text-sm);

    .speed-label {
      font-size: var(--text-base);
      color: var(--text-secondary, var(--text-secondary));
    }

    .volume-value {
      font-size: var(--text-sm);
      color: var(--text-secondary, var(--text-secondary));
      min-width: 40px;
    }
  }

  .transcript-content {
    max-height: 200px;
    overflow-y: auto;
    padding: var(--text-lg);
    background: white;
    border-radius: var(--spacing-sm);
    border: var(--border-width-base) solid var(--border-primary, var(--border-color));

    .transcript-text {
      font-size: var(--text-base);
      line-height: 1.6;
      color: var(--text-primary, var(--text-primary));
      white-space: pre-wrap;
    }
  }

  .analysis-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--text-lg);
    margin-bottom: var(--text-2xl);

    .analysis-item {
      text-align: center;

      .analysis-label {
        font-size: var(--text-sm);
        color: var(--text-secondary, var(--text-secondary));
        margin-bottom: var(--spacing-sm);
      }

      .analysis-value {
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--text-primary, var(--text-primary));

        .keyword-tag {
          margin: var(--spacing-sm);
        }
      }
    }
  }

  .analysis-summary {
    .summary-label {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary, var(--text-primary));
      margin-bottom: var(--spacing-sm);
    }

    .summary-content {
      font-size: var(--text-base);
      line-height: 1.6;
      color: var(--text-primary, var(--text-primary));
      padding: var(--text-sm);
      background: white;
      border-radius: var(--spacing-sm);
      border: var(--border-width-base) solid var(--border-primary, var(--border-color));
    }
  }
}

.no-recording {
  text-align: center;
  padding: var(--spacing-10xl);
  color: var(--text-secondary, var(--text-secondary));

  p {
    margin-top: var(--text-sm);
    margin-bottom: 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
    gap: var(--text-sm);
  }
}

// 暗黑主题
.dark {
  .recording-info,
  .audio-player,
  .transcript-section,
  .analysis-section {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .info-header h3,
  .player-header h3,
  .transcript-header h3,
  .analysis-header h3 {
    color: var(--white-alpha-90);
  }

  .transcript-content,
  .summary-content {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .transcript-text {
    color: var(--white-alpha-90);
  }

  .waveform-container {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }
}

// html.dark 兼容性
html.dark {
  .recording-info,
  .audio-player,
  .transcript-section,
  .analysis-section {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .info-header h3,
  .player-header h3,
  .transcript-header h3,
  .analysis-header h3 {
    color: var(--white-alpha-90);
  }

  .transcript-content,
  .summary-content {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .transcript-text {
    color: var(--white-alpha-90);
  }

  .waveform-container {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }
}
</style>