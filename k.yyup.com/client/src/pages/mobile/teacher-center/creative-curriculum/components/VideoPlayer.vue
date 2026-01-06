<template>
  <div class="mobile-video-player">
    <!-- 视频播放区域 -->
    <div class="player-container" ref="playerContainer">
      <video
        v-if="video.url"
        ref="videoElement"
        class="video-element"
        :poster="videoPoster"
        :controls="showControls"
        :autoplay="autoplay"
        :muted="muted"
        :loop="loop"
        :playsinline="true"
        :webkit-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        @loadstart="handleLoadStart"
        @loadeddata="handleLoadedData"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        @timeupdate="handleTimeUpdate"
        @error="handleError"
        @fullscreenchange="handleFullscreenChange"
      >
        <source :src="video.url" type="video/mp4" />
        <source :src="video.url" type="video/webm" />
        您的浏览器不支持视频播放
      </video>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="video-loading">
        <van-loading type="spinner" color="#1989fa" vertical>
          视频加载中...
        </van-loading>
      </div>

      <!-- 视频占位符 -->
      <div v-if="!video.url && !isLoading" class="video-placeholder">
        <van-icon name="video-o" size="48" color="#c8c9cc" />
        <p>{{ errorMessage || '暂无视频内容' }}</p>
        <van-button
          v-if="errorMessage"
          type="primary"
          size="small"
          @click="retryLoad"
        >
          重试
        </van-button>
      </div>

      <!-- 自定义覆盖层 -->
      <div v-if="!showControls && !isLoading && video.url" class="video-overlay">
        <div class="overlay-controls">
          <van-button
            v-if="!isPlaying"
            type="primary"
            size="large"
            round
            icon="play"
            @click="playVideo"
          />
        </div>

        <!-- 视频信息 -->
        <div class="video-title">
          <h3>{{ video.name || '课程视频' }}</h3>
          <p v-if="video.description">{{ video.description }}</p>
        </div>
      </div>
    </div>

    <!-- 进度条 -->
    <div v-if="video.url && !isLoading" class="progress-bar">
      <van-slider
        v-model="currentTime"
        :max="duration"
        :step="1"
        @change="seekVideo"
        active-color="#1989fa"
        class="time-slider"
      />
      <div class="time-display">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <span class="duration">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- 播放控制按钮 -->
    <div v-if="video.url" class="player-controls">
      <van-button-group>
        <van-button
          :icon="isPlaying ? 'pause' : 'play'"
          @click="togglePlay"
          :disabled="isLoading"
        >
          {{ isPlaying ? '暂停' : '播放' }}
        </van-button>
        <van-button
          icon="replay"
          @click="restartVideo"
          :disabled="isLoading"
        >
          重播
        </van-button>
        <van-button
          :icon="muted ? 'volume-off' : 'volume'"
          @click="toggleMute"
        >
          {{ muted ? '静音' : '音量' }}
        </van-button>
        <van-button
          icon="expand"
          @click="toggleFullscreen"
        >
          全屏
        </van-button>
      </van-button-group>
    </div>

    <!-- 视频信息 -->
    <van-cell-group v-if="video.url" inset class="video-info">
      <van-cell title="视频时长" :value="formatDuration(video.duration)" />
      <van-cell title="文件大小" :value="formatFileSize(video.fileSize)" />
      <van-cell
        title="视频脚本"
        :label="video.script"
        :is-link="!!video.script"
        @click="showScript = true"
      />
    </van-cell-group>

    <!-- 操作按钮 -->
    <van-cell-group v-if="video.url" inset class="action-buttons">
      <van-grid :column-num="3" :gutter="12">
        <van-grid-item>
          <van-button
            type="primary"
            @click="downloadVideo"
            icon="download"
            block
            size="small"
          >
            下载
          </van-button>
        </van-grid-item>
        <van-grid-item>
          <van-button
            type="success"
            @click="shareVideo"
            icon="share-o"
            block
            size="small"
          >
            分享
          </van-button>
        </van-grid-item>
        <van-grid-item>
          <van-button
            type="warning"
            @click="showSettings = true"
            icon="setting-o"
            block
            size="small"
          >
            设置
          </van-button>
        </van-grid-item>
      </van-grid>
    </van-cell-group>

    <!-- 视频脚本弹窗 -->
    <van-popup
      v-model:show="showScript"
      position="bottom"
      :style="{ height: '60vh', borderRadius: '20px 20px 0 0' }"
      closeable
    >
      <div class="script-popup">
        <div class="script-header">
          <h3>视频脚本</h3>
        </div>
        <div class="script-content">
          <div v-if="video.script" class="script-text">
            {{ video.script }}
          </div>
          <van-empty
            v-else
            image="default"
            description="暂无脚本内容"
          />
        </div>
        <div class="script-actions">
          <van-button
            v-if="video.script"
            type="primary"
            @click="copyScript"
            icon="description"
          >
            复制脚本
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 设置弹窗 -->
    <van-popup
      v-model:show="showSettings"
      position="bottom"
      :style="{ height: '50vh', borderRadius: '20px 20px 0 0' }"
      closeable
    >
      <div class="settings-popup">
        <div class="settings-header">
          <h3>播放设置</h3>
        </div>
        <div class="settings-content">
          <van-cell-group inset>
            <van-cell title="自动播放">
              <template #right-icon>
                <van-switch v-model="autoplay" />
              </template>
            </van-cell>
            <van-cell title="循环播放">
              <template #right-icon>
                <van-switch v-model="loop" />
              </template>
            </van-cell>
            <van-cell title="显示控制条">
              <template #right-icon>
                <van-switch v-model="showControls" />
              </template>
            </van-cell>
            <van-cell title="播放速度">
              <template #right-icon>
                <van-picker
                  :columns="playbackRates"
                  @confirm="onPlaybackRateChange"
                  @cancel="showPlaybackRatePicker = false"
                  :show-toolbar="false"
                  :default-index="1"
                />
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 分享弹窗 -->
    <van-share-sheet
      v-model:show="showShare"
      title="分享视频"
      :options="shareOptions"
      @select="onShareSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'

interface Video {
  url?: string
  duration?: number
  script?: string
  name?: string
  description?: string
  fileSize?: number
}

interface Props {
  video: Video
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  showControls?: boolean
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  video: () => ({}),
  autoplay: false,
  muted: false,
  loop: false,
  showControls: true,
  maxHeight: '300px'
})

const emit = defineEmits<{
  'play': []
  'pause': []
  'ended': []
  'error': [error: Event]
  'timeupdate': [currentTime: number, duration: number]
}>()

// 响应式数据
const videoElement = ref<HTMLVideoElement>()
const playerContainer = ref<HTMLElement>()
const isLoading = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const errorMessage = ref('')
const autoplay = ref(props.autoplay)
const muted = ref(props.muted)
const loop = ref(props.loop)
const showControls = ref(props.showControls)

// 弹窗状态
const showScript = ref(false)
const showSettings = ref(false)
const showShare = ref(false)
const showPlaybackRatePicker = ref(false)

// 计算属性
const videoPoster = computed(() => {
  return props.video.url ? '' : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"%3E%3Crect fill="%23f5f5f5" width="1280" height="720"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%23999" text-anchor="middle" dy=".3em"%3E点击播放视频%3C/text%3E%3C/svg%3E'
})

const shareOptions = [
  { name: '微信', icon: 'wechat' },
  { name: '微博', icon: 'weibo' },
  { name: 'QQ', icon: 'qq' },
  { name: '复制链接', icon: 'link' }
]

const playbackRates = ref([
  { text: '0.5x', value: 0.5 },
  { text: '0.75x', value: 0.75 },
  { text: '1x', value: 1 },
  { text: '1.25x', value: 1.25 },
  { text: '1.5x', value: 1.5 },
  { text: '2x', value: 2 }
])

// 工具函数
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatDuration(duration?: number): string {
  if (!duration) return '未知'
  if (duration < 60) return `${duration}秒`
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分钟`
}

function formatFileSize(size?: number): string {
  if (!size) return '未知'
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

// 视频控制函数
function playVideo() {
  if (videoElement.value && props.video.url) {
    videoElement.value.play()
  }
}

function pauseVideo() {
  if (videoElement.value) {
    videoElement.value.pause()
  }
}

function togglePlay() {
  if (isPlaying.value) {
    pauseVideo()
  } else {
    playVideo()
  }
}

function restartVideo() {
  if (videoElement.value) {
    videoElement.value.currentTime = 0
    playVideo()
  }
}

function seekVideo(value: number) {
  if (videoElement.value) {
    videoElement.value.currentTime = value
  }
}

function toggleMute() {
  if (videoElement.value) {
    videoElement.value.muted = !videoElement.value.muted
    muted.value = videoElement.value.muted
  }
}

function toggleFullscreen() {
  if (!playerContainer.value) return

  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    playerContainer.value.requestFullscreen().catch(() => {
      // 降级处理：尝试全屏播放视频
      if (videoElement.value) {
        videoElement.value.requestFullscreen().catch(() => {
          showToast('无法进入全屏模式')
        })
      }
    })
  }
}

function retryLoad() {
  errorMessage.value = ''
  loadVideo()
}

// 加载视频
async function loadVideo() {
  if (!props.video.url) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 预加载视频
    if (videoElement.value) {
      await videoElement.value.load()
    }
  } catch (error) {
    errorMessage.value = '视频加载失败'
    console.error('Video load error:', error)
  } finally {
    isLoading.value = false
  }
}

// 事件处理
function handleLoadStart() {
  isLoading.value = true
  errorMessage.value = ''
}

function handleLoadedData() {
  isLoading.value = false
  if (videoElement.value) {
    duration.value = videoElement.value.duration || 0
  }
}

function handlePlay() {
  isPlaying.value = true
  emit('play')
}

function handlePause() {
  isPlaying.value = false
  emit('pause')
}

function handleEnded() {
  isPlaying.value = false
  emit('ended')
  if (loop.value) {
    playVideo()
  }
}

function handleTimeUpdate() {
  if (videoElement.value) {
    currentTime.value = Math.floor(videoElement.value.currentTime)
    emit('timeupdate', currentTime.value, duration.value)
  }
}

function handleError(event: Event) {
  isLoading.value = false
  errorMessage.value = '视频播放出错'
  emit('error', event)
  console.error('Video error:', event)
}

function handleFullscreenChange() {
  // 处理全屏状态变化
}

// 其他功能
async function downloadVideo() {
  if (!props.video.url) {
    showToast('视频不可用')
    return
  }

  try {
    const response = await fetch(props.video.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${props.video.name || 'video'}-${Date.now()}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
    showSuccessToast('视频下载已开始')
  } catch (error) {
    showFailToast('下载失败')
    console.error('Download error:', error)
  }
}

function shareVideo() {
  showShare.value = true
}

function onShareSelect(option: any) {
  showToast(`分享到: ${option.name}`)
  showShare.value = false
}

function onPlaybackRateChange({ selectedValues }: any) {
  if (videoElement.value && selectedValues[0]) {
    videoElement.value.playbackRate = selectedValues[0].value
    showSuccessToast(`播放速度: ${selectedValues[0].text}`)
  }
  showPlaybackRatePicker.value = false
}

async function copyScript() {
  if (!props.video.script) return

  try {
    await navigator.clipboard.writeText(props.video.script)
    showSuccessToast('脚本已复制到剪贴板')
  } catch (error) {
    showFailToast('复制失败')
  }
}

// 监听视频URL变化
watch(
  () => props.video.url,
  (newUrl) => {
    if (newUrl) {
      loadVideo()
    }
  },
  { immediate: true }
)

// 组件挂载和卸载
onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  // 清理资源
  if (videoElement.value) {
    videoElement.value.pause()
    videoElement.value.src = ''
  }
})

// 暴露方法给父组件
defineExpose({
  playVideo,
  pauseVideo,
  togglePlay,
  restartVideo,
  isPlaying: computed(() => isPlaying.value),
  currentTime: computed(() => currentTime.value),
  duration: computed(() => duration.value)
})
</script>

<style scoped lang="scss">
.mobile-video-player {
  padding: var(--van-padding-sm);
  background: var(--van-background-color);

  .player-container {
    position: relative;
    width: 100%;
    height: v-bind(maxHeight);
    background: #000;
    border-radius: var(--van-radius-lg);
    overflow: hidden;
    margin-bottom: var(--van-padding-sm);

    .video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }

    .video-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      color: white;
    }

    .video-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      color: var(--van-text-color-3);
      gap: var(--van-padding-md);

      p {
        margin: 0;
        font-size: var(--van-font-size-md);
      }
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5));
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--van-padding-md);

      .overlay-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
      }

      .video-title {
        color: white;
        text-align: center;

        h3 {
          margin: 0 0 var(--van-padding-xs) 0;
          font-size: var(--van-font-size-lg);
        }

        p {
          margin: 0;
          font-size: var(--van-font-size-sm);
          opacity: 0.8;
        }
      }
    }
  }

  .progress-bar {
    margin-bottom: var(--van-padding-sm);

    .time-slider {
      margin-bottom: var(--van-padding-xs);
    }

    .time-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--van-font-size-xs);
      color: var(--van-text-color-3);

      .current-time {
        color: var(--van-primary-color);
        font-weight: 500;
      }
    }
  }

  .player-controls {
    margin-bottom: var(--van-padding-sm);

    :deep(.van-button-group) {
      display: flex;

      .van-button {
        flex: 1;
        font-size: var(--van-font-size-sm);
      }
    }
  }

  .video-info {
    margin-bottom: var(--van-padding-sm);
  }

  .action-buttons {
    margin-bottom: var(--van-padding-sm);

    :deep(.van-grid) {
      .van-grid-item {
        .van-button {
          height: 40px;
          font-size: var(--van-font-size-sm);
        }
      }
    }
  }
}

// 脚本弹窗
.script-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .script-header {
    padding: var(--van-padding-lg) var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      text-align: center;
      font-size: var(--van-font-size-lg);
    }
  }

  .script-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-md);

    .script-text {
      font-size: var(--van-font-size-md);
      line-height: 1.6;
      color: var(--van-text-color-1);
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .script-actions {
    padding: var(--van-padding-md);
    background: var(--van-background-2);
    border-top: 1px solid var(--van-border-color);
  }
}

// 设置弹窗
.settings-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .settings-header {
    padding: var(--van-padding-lg) var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      text-align: center;
      font-size: var(--van-font-size-lg);
    }
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-sm);
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .mobile-video-player {
    padding: var(--van-padding-xs);

    .player-container {
      margin-bottom: var(--van-padding-xs);
    }

    .player-controls {
      :deep(.van-button-group) {
        .van-button {
          font-size: var(--van-font-size-xs);
          padding: var(--van-padding-xs);
        }
      }
    }

    .action-buttons {
      :deep(.van-grid) {
        .van-grid-item {
          .van-button {
            height: 36px;
            font-size: var(--van-font-size-xs);
          }
        }
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-video-player {
    background: var(--van-background-1);

    .video-placeholder {
      background: var(--van-background-2);
    }
  }
}
</style>