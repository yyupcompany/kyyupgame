<template>
  <div class="a2ui-page-container" :style="containerStyle">
    <!-- 头部 -->
    <div class="page-header" v-if="title">
      <div class="header-content">
        <h2 class="page-title">{{ title }}</h2>
        <p class="page-subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions">
        <el-button v-if="showBack" text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button v-if="showFullscreen" text @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-content" :style="contentStyle">
      <!-- 优先使用插槽内容（来自 A2UIRenderer 的递归渲染） -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { ArrowLeft, FullScreen } from '@element-plus/icons-vue';
import type { A2UIComponentNode, A2UIEvent, A2UIComponentAudio } from '@/types/a2ui-protocol';

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showFullscreen?: boolean;
  padding?: string;
  backgroundColor?: string;
  children?: A2UIComponentNode[];
  sessionId?: string;
  /** 🎵 音频配置（欢迎语音） */
  audio?: A2UIComponentAudio;
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  showFullscreen: false,
  padding: '20px',
  children: () => [],
  sessionId: ''
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
  (e: 'back'): void;
  (e: 'fullscreen', value: boolean): void;
}>();

const containerStyle = computed(() => ({
  padding: props.padding,
  backgroundColor: props.backgroundColor || 'transparent'
}));

const contentStyle = computed(() => ({
  padding: props.padding
}));

function emitEvent(event: A2UIEvent) {
  emit('event', event);
}

function handleBack() {
  emit('back');
}

function toggleFullscreen() {
  emit('fullscreen', true);
}

/**
 * 🎵 页面挂载时自动播放欢迎语音
 */
onMounted(() => {
  if (props.audio?.autoPlay && props.audio.ttsUrl) {
    const delay = props.audio.playDelay || 1000; // 默认延迟1秒
    setTimeout(() => {
      const audio = new Audio(props.audio!.ttsUrl!);
      if (props.audio?.volume) {
        audio.volume = props.audio.volume;
      }
      audio.play().catch(err => {
        console.warn('欢迎语音自动播放失败:', err);
      });
    }, delay);
  }
});
</script>

<style scoped lang="scss">
.a2ui-page-container {
  width: 100%;
  min-height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  border-radius: 16px;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.page-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.header-actions {
  display: flex;
  gap: 8px;

  :deep(.el-button) {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.5);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.page-content {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 40px;

  // 美化所有子组件卡片
  :deep(.a2ui-card) {
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .el-card__header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #ffffff;
      font-weight: 600;
      padding: 16px 20px;
      border: none;
    }
  }

  // 美化选择题
  :deep(.a2ui-choice-question) {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    padding: 24px;

    .question-header {
      margin-bottom: 20px;
    }

    .question-title {
      font-size: 20px;
      color: #333;
      font-weight: 600;
    }

    .option-item {
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 12px;
      border: 2px solid #e8e8e8;
      background: #fafafa;
      transition: all 0.3s ease;

      &:hover {
        border-color: #667eea;
        background: linear-gradient(135deg, #f5f7ff 0%, #ede9fe 100%);
        transform: translateX(4px);
      }
    }

    .option-content {
      font-size: 16px;
      font-weight: 500;
    }
  }

  // 美化拖拽排序
  :deep(.a2ui-drag-sort) {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    padding: 24px;

    .drag-instructions {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      border-radius: 12px;
      padding: 12px 16px;
      font-weight: 500;

      .el-icon {
        color: #ffffff;
      }
    }

    .drag-item {
      border-radius: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      border: 2px solid transparent;
      color: #5d4e37;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(252, 182, 159, 0.4);
      }

      &.dragging {
        opacity: 0.6;
        transform: scale(1.05);
      }

      .drag-handle {
        color: #5d4e37;
      }
    }
  }

  // 美化得分板
  :deep(.a2ui-score-board) {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    border-radius: 16px;
    padding: 24px;
    color: #ffffff;
    text-align: center;
    box-shadow: 0 4px 20px rgba(17, 153, 142, 0.3);

    .score-value {
      font-size: 48px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .score-label {
      font-size: 16px;
      opacity: 0.9;
    }
  }

  // 美化图片轮播
  :deep(.a2ui-carousel) {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

    .el-carousel {
      border-radius: 16px;
    }

    .carousel-image {
      border-radius: 0;
    }
  }
}
</style>
