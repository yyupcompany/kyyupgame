<!--
  欢迎消息组件
  从 AIAssistant.vue 第70-85行模板提取
-->

<template>
  <div class="message-item assistant welcome-message">
    <div class="message-avatar">
      <el-icon><Service /></el-icon>
    </div>
    <div class="message-content welcome-card">
      <div class="message-text">
        <div class="welcome-title">
          <el-icon class="welcome-icon"><Service /></el-icon>
          欢迎使用AI桌面助手！
        </div>
        <div class="welcome-subtitle">
          您可以通过对话或点击下方建议快速开始。
        </div>
      </div>
      <div class="suggestion-buttons">
        <!-- 原有功能提示词 -->
        <button
          class="suggestion-btn"
          @click="handleSuggestion('打开招生中心并输入你好')"
          :title="'快速导航到招生中心'"
          @mousedown="() => console.log('🔥 [按钮测试] 鼠标按下事件触发')"
          @mouseup="() => console.log('🔥 [按钮测试] 鼠标释放事件触发')"
        >
          <el-icon><School /></el-icon>
          打开招生中心并输入"你好"
        </button>
        <button
          class="suggestion-btn"
          @click="handleSuggestion('做一次活动分析：近期活动')"
          :title="'分析近期活动数据'"
        >
          <el-icon><TrendCharts /></el-icon>
          做一次活动分析 · 近期活动
        </button>
        <button
          class="suggestion-btn"
          @click="handleSuggestion('管理招生宣发文案')"
          :title="'管理招生宣传文案'"
        >
          <el-icon><EditPen /></el-icon>
          管理招生宣发文案
        </button>

        <!-- HTML预览功能提示词 -->
        <button
          class="suggestion-btn html-preview-btn"
          @click="handleSuggestion('创建一个认识数字1-10的互动游戏')"
          :title="'生成互动数字学习游戏'"
        >
          <el-icon><Histogram /></el-icon>
          创建数字学习游戏 · 1-10
        </button>
        <button
          class="suggestion-btn html-preview-btn"
          @click="handleSuggestion('生成一个认识常见动物的互动课程')"
          :title="'生成动物认知互动课程'"
        >
          <el-icon><Orange /></el-icon>
          生成动物认知课程
        </button>
        <button
          class="suggestion-btn html-preview-btn"
          @click="handleSuggestion('制作一个学习基本形状的网页游戏')"
          :title="'生成形状学习互动游戏'"
        >
          <el-icon><Grid /></el-icon>
          制作形状学习游戏
        </button>
      </div>
      <div class="welcome-tips">
        <div class="tip-item">
          <el-icon><ChatDotRound /></el-icon>
          <span>支持自然语言对话</span>
        </div>
        <div class="tip-item">
          <el-icon><Tools /></el-icon>
          <span>智能工具调用</span>
        </div>
        <div class="tip-item">
          <UnifiedIcon name="microphone" :size="16" />
          <span>语音输入输出</span>
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
// 🎨 导入主题变量
@import '@/styles/design-tokens.scss';

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
  border: var(--border-width-base) solid var(--ai-welcome-border);
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--text-sm) var(--ai-welcome-shadow);
  backdrop-filter: blur(var(--text-2xl)) saturate(180%);
  transition: all var(--ai-transition-normal);
}

.message-text {
  margin-bottom: var(--text-2xl);
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
  font-size: var(--text-2xl);
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
  margin-bottom: var(--text-2xl);
}

.suggestion-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm) var(--text-lg);
  background: var(--el-bg-color);
  border: var(--border-width-base) solid var(--el-border-color-light);
  border-radius: var(--spacing-sm);
  color: var(--el-text-color-primary);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.suggestion-btn:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  transform: translateY(-var(--border-width-base));
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
}

.suggestion-btn:active {
  transform: translateY(0);
}

// 🎨 HTML预览按钮特殊样式
.suggestion-btn.html-preview-btn {
  background: linear-gradient(135deg, var(--bg-white)5f5 0%, #ffe9f0 100%);
  border-color: #ffc0cb;
  color: #4a1942; // 🔧 修复：深紫色文字，确保在粉色背景上清晰可见

  &:hover {
    background: linear-gradient(135deg, #ffe9f0 0%, #ffd6e0 100%);
    border-color: #ff69b4;
    color: #3d0e36; // 🔧 修复：悬停时更深的文字颜色

    .el-icon {
      color: #ff1493;
      transform: scale(1.1);
    }
  }

  .el-icon {
    color: #ff69b4;
    transition: all 0.2s;
  }
}

.welcome-tips {
  display: flex;
  gap: var(--text-lg);
  padding-top: var(--text-lg);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
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
    padding: var(--text-2xl);
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
