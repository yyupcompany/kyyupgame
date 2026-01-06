<template>
  <div class="video-player">
    <!-- 视频播放器 -->
    <div class="player-container">
      <video
        v-if="video.url"
        ref="videoElement"
        class="video-element"
        controls
        :poster="videoPoster"
      >
        <source :src="video.url" type="video/mp4" />
        您的浏览器不支持视频播放
      </video>
      <div v-else class="video-placeholder">
        <UnifiedIcon name="default" />
        <p>视频加载中...</p>
      </div>
    </div>

    <!-- 视频信息 -->
    <div class="video-info">
      <div class="info-item">
        <span class="label">视频时长：</span>
        <span class="value">{{ video.duration }}秒</span>
      </div>
      <div class="info-item">
        <span class="label">视频脚本：</span>
        <span class="value">{{ video.script }}</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="player-controls">
      <el-button @click="playVideo" :disabled="!video.url">
        <UnifiedIcon name="default" />
        播放
      </el-button>
      <el-button @click="pauseVideo" :disabled="!video.url">
        <UnifiedIcon name="default" />
        暂停
      </el-button>
      <el-button @click="downloadVideo" :disabled="!video.url">
        <UnifiedIcon name="Download" />
        下载
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VideoPlay, VideoPause, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

interface Video {
  url: string;
  duration: number;
  script: string;
}

interface Props {
  video: Video;
}

const props = defineProps<Props>();

const videoElement = ref<HTMLVideoElement>();
const videoPoster = ref('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"%3E%3Crect fill="%23f0f0f0" width="1280" height="720"/%3E%3C/svg%3E');

function playVideo() {
  if (videoElement.value) {
    videoElement.value.play();
  }
}

function pauseVideo() {
  if (videoElement.value) {
    videoElement.value.pause();
  }
}

function downloadVideo() {
  if (!props.video.url) {
    ElMessage.warning('视频URL不可用');
    return;
  }

  const link = document.createElement('a');
  link.href = props.video.url;
  link.download = `curriculum-video-${Date.now()}.mp4`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success('视频下载已启动');
}
</script>

<style scoped lang="scss">
.video-player {
  display: flex;
  flex-direction: column;
  gap: var(--text-2xl);

  .player-container {
    background: var(--bg-primary);
    border-radius: var(--spacing-sm);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    aspect-ratio: 16 / 9;
    display: flex;
    align-items: center;
    justify-content: center;

    .video-element {
      width: 100%;
      height: 100%;
    }

    .video-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2xl);
      color: var(--text-secondary);
      width: 100%;
      height: 100%;

      .el-icon {
        font-size: var(--text-5xl);
      }
    }
  }

  .video-info {
    background: var(--bg-primary);
    border-radius: var(--spacing-xs);
    padding: var(--spacing-4xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);

    .info-item {
      display: flex;
      gap: var(--spacing-2xl);
      font-size: var(--text-base);

      .label {
        color: var(--text-secondary);
        min-width: auto;
      }

      .value {
        color: var(--text-primary);
        flex: 1;
        word-break: break-word;
      }
    }
  }

  .player-controls {
    display: flex;
    gap: var(--spacing-2xl);
    justify-content: center;
  }
}
</style>

