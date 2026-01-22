<!--
  AI 助手聊天空状态组件
  当没有消息时显示，引导用户开始对话
-->

<template>
  <div class="ai-empty-state">
    <!-- 插图 -->
    <div class="ai-empty-state__illustration">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 背景圆圈 -->
        <circle cx="100" cy="100" r="80" fill="currentColor" fill-opacity="0.1" class="circle-bg"/>

        <!-- 机器人头部 -->
        <rect x="60" y="70" width="80" height="60" rx="10" fill="currentColor" class="robot-head"/>

        <!-- 眼睛 -->
        <circle cx="80" cy="95" r="8" fill="white" class="eye"/>
        <circle cx="120" cy="95" r="8" fill="white" class="eye"/>

        <!-- 天线 -->
        <line x1="100" y1="70" x2="100" y2="50" stroke="currentColor" stroke-width="3" class="antenna"/>
        <circle cx="100" cy="45" r="5" fill="currentColor" class="antenna-ball"/>

        <!-- 微笑 -->
        <path d="M 80 110 Q 100 120 120 110" stroke="white" stroke-width="2" fill="none" class="smile"/>

        <!-- 浮动元素 -->
        <g class="floating-elements">
          <!-- 星星 -->
          <path d="M 40 40 L 43 47 L 50 47 L 45 52 L 47 59 L 40 55 L 33 59 L 35 52 L 30 47 L 37 47 Z"
                fill="currentColor" fill-opacity="0.3" class="star star-1"/>
          <path d="M 160 60 L 162 65 L 167 65 L 163 69 L 165 74 L 160 71 L 155 74 L 157 69 L 153 65 L 158 65 Z"
                fill="currentColor" fill-opacity="0.3" class="star star-2"/>

          <!-- 对话气泡 -->
          <rect x="30" y="140" width="40" height="25" rx="5" fill="currentColor" fill-opacity="0.2" class="bubble bubble-1"/>
          <rect x="130" y="150" width="45" height="28" rx="5" fill="currentColor" fill-opacity="0.2" class="bubble bubble-2"/>
        </g>
      </svg>
    </div>

    <!-- 标题 -->
    <h3 class="ai-empty-state__title">开始你的第一次对话</h3>

    <!-- 描述 -->
    <p class="ai-empty-state__description">
      我是 AI 园长助理，可以帮你处理园务、生成报告、分析数据、家校沟通等
    </p>

    <!-- 快捷操作按钮 -->
    <div class="ai-empty-state__actions">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion.text"
        class="ai-empty-state__button"
        @click="$emit('select', suggestion.text)"
      >
        <span class="button-icon">{{ suggestion.icon }}</span>
        <span class="button-text">{{ suggestion.text }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Suggestion {
  icon: string
  text: string
}

interface Emits {
  select: [text: string]
}

const emit = defineEmits<Emits>()

const suggestions = ref<Suggestion[]>([
  { icon: '🎨', text: '创建活动方案' },
  { icon: '📊', text: '生成周报' },
  { icon: '📈', text: '分析考勤数据' },
  { icon: '👨‍👩‍👧‍👦', text: '家长沟通模板' },
  { icon: '📝', text: '撰写通知文案' },
  { icon: '🎯', text: '教学活动建议' }
])
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
@use '../styles/ai-assistant-enhanced.scss' as *;

.ai-empty-state {
  // 使用增强样式中的基础样式
  color: var(--primary-color);

  // SVG 样式
  svg {
    .circle-bg {
      color: var(--primary-color);
      animation: pulse-scale 2s ease-in-out infinite;
    }

    .robot-head {
      color: var(--primary-color);
    }

    .eye {
      animation: blink 3s ease-in-out infinite;
    }

    .antenna {
      animation: antenna-wave 1s ease-in-out infinite;
      transform-origin: bottom center;
    }

    .antenna-ball {
      color: var(--success-color);
      animation: glow 1.5s ease-in-out infinite;
    }

    .smile {
      stroke: var(--text-on-primary);
    }

    .floating-elements {
      .star {
        animation: float 3s ease-in-out infinite;
      }

      .star-1 {
        animation-delay: 0s;
      }

      .star-2 {
        animation-delay: 1s;
      }

      .bubble {
        animation: bubble-float 4s ease-in-out infinite;
      }

      .bubble-1 {
        animation-delay: 0.5s;
      }

      .bubble-2 {
        animation-delay: 1.5s;
      }
    }
  }

  &__button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);

    &:hover {
      background: var(--primary-light-bg);
      border-color: var(--primary-color);
    }
  }

    .button-icon {
      font-size: var(--text-xl);
      flex-shrink: 0;
    }

    .button-text {
      flex: 1;
      font-weight: 500;
    }
  }
}

// 自定义动画
@keyframes pulse-scale {
  0%, 100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.15;
  }
}

@keyframes blink {
  0%, 90%, 100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}

@keyframes antenna-wave {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 4px var(--success-color));
  }
  50% {
    filter: drop-shadow(0 0 8px var(--success-color));
  }
}

@keyframes bubble-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
