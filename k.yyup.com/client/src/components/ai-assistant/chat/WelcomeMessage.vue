<!--
  欢迎消息组件
  从 AIAssistant.vue 第70-85行模板提取
-->

<template>
  <div class="message-item assistant welcome-message">
    <div class="message-avatar">
      <UnifiedIcon name="ai-center" />
    </div>
    <div class="message-content welcome-card">
      <div class="message-text">
        <div class="welcome-title">
          <UnifiedIcon name="ai-center" />
          🌈 嗨，亲爱的园长/老师！
        </div>
        <div class="welcome-subtitle">
          我是你的AI小助手，有什么想知道的尽管问我，我会用最简单的方式回答你哦！✨
        </div>
      </div>
      <div class="suggestion-buttons">
        <!-- 原有功能提示词 -->
        <!-- 园长老师关心的日常问题 -->
        <button
          class="suggestion-btn"
          @click="handleSuggestion('现在有多少个小朋友呀？')"
          :title="'查看学生总数'"
          @mousedown="() => console.log('🔥 [按钮测试] 鼠标按下事件触发')"
          @mouseup="() => console.log('🔥 [按钮测试] 鼠标释放事件触发')"
        >
          <UnifiedIcon name="ai-center" />
          👶 有多少小朋友呀？
        </button>
        <button
          class="suggestion-btn"
          @click="handleSuggestion('哪个班级的小朋友最多？')"
          :title="'查看班级人数统计'"
        >
          <UnifiedIcon name="ai-center" />
          🏆 哪个班小朋友最多？
        </button>
        <button
          class="suggestion-btn"
          @click="handleSuggestion('最近有什么有趣的活动吗？')"
          :title="'查看近期活动安排'"
        >
          <UnifiedIcon name="Edit" />
          🎉 最近有什么好玩的活动？
        </button>

        <!-- 老师教学相关功能 -->
        <button
          class="suggestion-btn html-preview-btn"
          @click="handleSuggestion('帮我做个认识数字的小游戏')"
          :title="'生成数字认知游戏'"
        >
          <UnifiedIcon name="ai-center" />
          🔢 数字小游戏
        </button>
        <button
          class="suggestion-btn html-preview-btn"
          @click="handleSuggestion('给我讲讲小动物的故事吧')"
          :title="'动物认知教学内容'"
        >
          <UnifiedIcon name="ai-center" />
          🐾 小动物故事
        </button>
        <button
          class="suggestion-btn html-preview-btn"
          @click="handleSuggestion('帮小朋友认识形状和颜色')"
          :title="'形状颜色教学游戏'"
        >
          <UnifiedIcon name="ai-center" />
          🎨 形状颜色认知
        </button>
      </div>
      <div class="welcome-tips">
        <div class="tip-item">
          <UnifiedIcon name="ai-center" />
          <span>💬 用大白话聊天</span>
        </div>
        <div class="tip-item">
          <UnifiedIcon name="ai-center" />
          <span>🔧 会做各种事情</span>
        </div>
        <div class="tip-item">
          <UnifiedIcon name="microphone" :size="16" />
          <span>🎤 还能语音对话</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Service,
  School,
  TrendCharts,
  EditPen,
  ChatDotRound,
  Tools,
  Microphone,
  Histogram,
  Orange,
  Grid
} from '@element-plus/icons-vue'

// ==================== Emits ====================
interface Emits {
  'suggestion': [text: string]
}

const emit = defineEmits<Emits>()

// ==================== 事件处理 ====================
const handleSuggestion = (text: string) => {
  console.log('🔍 [WelcomeMessage] 建议按钮点击:', text)
  emit('suggestion', text)
}
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入

.welcome-message {
  margin-bottom: var(--text-3xl);

  /* 🎯 欢迎消息宽度控制：使用响应式变量 */
  width: var(--ai-content-width);
  max-width: var(--ai-content-max-width);
  margin: 0 auto var(--text-3xl);

  /* 🔧 防止缩放时变形 */
  transform-origin: center center;
  flex-shrink: 0;

  /* 🎨 平滑过渡 */
  transition: all var(--ai-transition-normal);
}

.message-item {
  display: flex;
  gap: var(--text-sm);
  margin-bottom: var(--text-lg);
}

.message-item.assistant {
  justify-content: flex-start;
}

.message-avatar {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--el-color-primary);
  font-size: var(--text-xl);
}

.message-content {
  flex: 1;
  min-width: 0;
}

// 🎨 3️⃣ 欢迎消息卡片 - 使用主题变量
.welcome-card {
  background: linear-gradient(135deg, var(--ai-welcome-bg-start) 0%, var(--ai-welcome-bg-end) 100%);
  border: var(--border-width) solid var(--ai-welcome-border);
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--text-sm) var(--ai-welcome-shadow);
  backdrop-filter: blur(var(--spacing-xl)) saturate(180%);
  transition: all var(--ai-transition-normal);
}

.message-text {
  margin-bottom: var(--spacing-xl);
}

.welcome-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-sm);
}

.welcome-icon {
  font-size: var(--spacing-xl);
  color: var(--el-color-primary);
}

.welcome-subtitle {
  font-size: var(--text-base);
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.suggestion-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
  margin-bottom: var(--spacing-xl);
}

.suggestion-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm) var(--text-lg);
  background: var(--el-bg-color);
  border: var(--border-width) solid var(--el-border-color-light);
  border-radius: var(--spacing-sm);
  color: var(--el-text-color-primary);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  width: 100%;
}

.suggestion-btn:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  transform: translateY(var(--z-index-below));
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
}

.suggestion-btn:active {
  transform: translateY(0);
}

// 🎨 HTML预览按钮特殊样式
.suggestion-btn.html-preview-btn {
  background: linear-gradient(135deg, var(--bg-white)5f5 0%, #ffe9f0 100%);
  border-color: var(--primary-color-ultra-light);
  color: var(--text-primary); // 🔧 修复：深紫色文字，确保在粉色背景上清晰可见

  &:hover {
    background: linear-gradient(135deg, #ffe9f0 0%, #ffd6e0 100%);
    border-color: var(--primary-color-light);
    color: var(--text-secondary); // 🔧 修复：悬停时更深的文字颜色

    .el-icon {
      color: var(--primary-color);
      transform: scale(1.1);
    }
  }

  .el-icon {
    color: var(--primary-color-light);
    transition: all var(--transition-fast);
  }
}

.welcome-tips {
  display: flex;
  gap: var(--text-lg);
  padding-top: var(--text-lg);
  border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

.tip-item .el-icon {
  font-size: var(--text-base);
  color: var(--el-color-primary);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .welcome-card {
    padding: var(--spacing-xl);
  }
  
  .welcome-tips {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .suggestion-btn {
    padding: var(--spacing-2xl) var(--text-base);
    font-size: var(--text-sm);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .welcome-card {
    padding: var(--text-lg);
  }
  
  .welcome-title {
    font-size: var(--text-lg);
  }
  
  .welcome-subtitle {
    font-size: var(--text-sm);
  }
}
</style>
