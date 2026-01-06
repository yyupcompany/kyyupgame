<template>
  <!-- Claude Code风格输入区域 -->
  <div class="claude-input-container" :class="{ 'web-search-enabled': webSearch }">
    <!-- 搜索状态提示条 -->
    <Transition name="slide-fade">
      <div v-if="webSearch" class="search-status-bar">
        <div class="search-indicator">
          <UnifiedIcon name="search" :size="14" class="search-icon-pulse" />
          <span class="search-text">已开启网络搜索</span>
        </div>
        <button class="close-search-btn" @click="$emit('update:webSearch', false)" title="关闭搜索">
          <UnifiedIcon name="close" :size="12" />
        </button>
      </div>
    </Transition>

    <div class="input-wrapper">
      <div class="top-row">
        <!-- 主输入框 -->
        <div class="main-input" :class="{ 'sending-state': sending, 'search-active': webSearch }">
          <el-input
            :model-value="inputMessage"
            @update:model-value="$emit('update:inputMessage', $event)"
            type="textarea"
            :rows="1"
            :maxlength="1000"
            :placeholder="getPlaceholder"
            @keydown.enter="handleKeyDown"
            @keydown.ctrl.enter="handleSendMessage"
            @keydown.meta.enter="handleSendMessage"
            @keydown.esc="handleCancelSend"
            resize="none"
            :autosize="{ minRows: 2, maxRows: 5 }"
            :disabled="sending"
          />
          <!-- 发送中的加载动画 -->
          <div v-if="sending" class="sending-indicator">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-row">
        <div class="controls-left">
          <!-- 功能按钮区域 -->
          <div class="feature-icons">
            <!-- 搜索按钮：所有模式均可用 -->
            <el-tooltip :content="webSearch ? '关闭网络搜索' : '开启网络搜索'" placement="top">
              <button
                class="icon-btn search-btn"
                :class="{ active: webSearch, 'search-pulse': webSearch }"
                :disabled="!isRegistered"
                @click="$emit('update:webSearch', !webSearch)"
                :title="webSearch ? '关闭网络搜索' : '开启网络搜索'"
              >
                <UnifiedIcon name="search" :size="16" />
              </button>
            </el-tooltip>

            <!-- 文件上传按钮：所有模式均可用 -->
            <el-tooltip content="上传文件" placement="top">
              <button class="icon-btn" :disabled="uploadingFile || sending" @click="triggerFileUpload" title="上传文件">
                <UnifiedIcon name="document" :size="16" />
              </button>
            </el-tooltip>
            
            <!-- 图片上传按钮：所有模式均可用 -->
            <el-tooltip content="上传图片" placement="top">
              <button class="icon-btn" :disabled="uploadingImage || sending" @click="triggerImageUpload" title="上传图片">
                <UnifiedIcon name="picture" :size="16" />
              </button>
            </el-tooltip>
            
            <!-- 字体大小按钮：简化模式下隐藏 -->
            <el-tooltip :content="`字体大小: ${fontSize}px`" placement="top" v-if="!props.simpleMode">
              <button class="font-size-btn" @click="handleFontSizeToggle" title="调整字体大小">
                <span class="font-icon-small">a</span>
                <span class="font-icon-large">A</span>
              </button>
            </el-tooltip>
          </div>
        </div>
        <div class="controls-right">
          <div class="right-actions">
            <!-- 简化模式：隐藏语音按钮 -->
            <template v-if="!props.simpleMode">
              <button
                class="voice-btn"
                :class="{ active: isListening }"
                @click="$emit('toggle-voice-input')"
                :title="isListening ? '停止录音' : '语音输入'"
              >
                <el-icon size="16">
                  <VideoPause v-if="isListening" />
                  <Microphone v-else />
                </el-icon>
              </button>
              <button
                class="voice-btn"
                :class="{ active: isSpeaking, disabled: !hasLastMessage || sending }"
                @click="$emit('toggle-voice-output')"
                :title="isSpeaking ? '停止播放' : '语音播放'"
              >
                <el-icon size="16">
                  <VideoPlay v-if="isSpeaking" />
                  <Headset v-else />
                </el-icon>
              </button>
            </template>

            <!-- 发送/停止按钮 -->
            <el-tooltip
              :content="sending ? '停止生成 (Esc)' : !inputMessage.trim() ? '请输入消息' : '发送消息 (Enter)'"
              placement="top"
            >
              <button
                class="send-btn"
                :class="{
                  disabled: !inputMessage.trim() && !sending,
                  stopping: sending
                }"
                @click="sending ? handleStopSending() : handleSendMessage()"
                :title="sending ? '停止生成' : '发送消息'"
              >
                <!-- 使用 v-show 确保两个图标都存在于 DOM 中，CSS 控制显示/隐藏 -->
                <UnifiedIcon name="send" :size="18" class="send-icon" />
                <UnifiedIcon name="close" :size="18" class="stop-icon" />
              </button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件上传输入框 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf,.doc,.docx,.txt,.json,.xml,.xlsx,.xls,.csv"
      style="display: none"
      @change="handleFileUpload"
    />
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageUpload"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Microphone,
  Headset,
  VideoPlay,
  VideoPause,
  Promotion
} from '@element-plus/icons-vue'

interface Props {
  inputMessage: string
  sending: boolean
  uploadingFile: boolean
  uploadingImage: boolean
  isListening: boolean
  isSpeaking: boolean
  hasLastMessage: boolean
  isRegistered: boolean
  webSearch: boolean
  fontSize: number
  speechStatus?: string
  simpleMode?: boolean  // 新增：简化模式(侧边栏)
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:inputMessage', value: string): void
  (e: 'update:webSearch', value: boolean): void
  (e: 'update:fontSize', value: number): void
  (e: 'send'): void
  (e: 'stop-sending'): void
  (e: 'cancel-send'): void
  (e: 'toggle-voice-input'): void
  (e: 'toggle-voice-output'): void
  (e: 'upload-file', file: File): void
  (e: 'upload-image', image: File): void
  (e: 'show-quick-query'): void
}

const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()
const imageInputRef = ref<HTMLInputElement>()
const fontSteps = [14, 16, 18]
const exampleText = '请帮我制定下周的幼儿园亲子活动方案'

// 动态placeholder，根据搜索状态变化
const getPlaceholder = computed(() => {
  if (props.sending) {
    return '正在发送中...'
  }
  if (props.webSearch) {
    return '🔍 已开启网络搜索，输入问题将自动搜索网络信息 (按 Enter 发送)'
  }
  return '例如：请帮我制定下周的幼儿园亲子活动方案 (按 Enter 发送，Shift+Enter 换行)'
})
const quickSuggestions = [
  '生成招生推文，突出亮点课程亮点',
  '制定家长会流程并输出提醒',
  '汇总今日出勤并给出家长通知'
]

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

const handleSendMessage = () => {
  console.log('🔵 [InputArea] handleSendMessage 被调用', {
    inputMessage: props.inputMessage,
    sending: props.sending,
    inputTrimmed: props.inputMessage.trim(),
    canSend: props.inputMessage.trim() && !props.sending
  })
  
  if (props.inputMessage.trim() && !props.sending) {
    console.log('✅ [InputArea] 发出 send 事件')
    emit('send')
  } else {
    console.warn('❌ [InputArea] 无法发送消息，原因:', {
      noInput: !props.inputMessage.trim(),
      isAlreadySending: props.sending
    })
  }
}

const handleStopSending = () => {
  emit('stop-sending')
}

const handleCancelSend = () => {
  emit('cancel-send')
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('upload-file', file)
  }
  target.value = ''
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('upload-image', file)
  }
  target.value = ''
}

const handleFontSizeToggle = () => {
  const currentIndex = fontSteps.indexOf(props.fontSize)
  const nextSize = fontSteps[(currentIndex + 1) % fontSteps.length]
  emit('update:fontSize', nextSize)
}

const handleShowQuickQuery = () => {
  emit('show-quick-query')
}

const handleSuggestionChip = (text: string) => {
  emit('update:inputMessage', text)
}

const handleExampleClick = () => {
  handleSuggestionChip(exampleText)
}
</script>

<style lang="scss" scoped>
// 使用全局设计令牌
// design-tokens 已通过 vite.config 全局注入

// ==================== 搜索状态过渡动画 ====================
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.claude-input-container {
  padding: var(--spacing-lg) var(--spacing-md);
  background: transparent;

  // ==================== 搜索开启时的容器样式 ====================
  &.web-search-enabled {
    .input-wrapper {
      border-color: var(--primary-color);
      box-shadow:
        var(--shadow-sm),
        0 0 20px rgba(59, 130, 246, 0.25),
        0 0 40px rgba(59, 130, 246, 0.15);
    }
  }

  // ==================== 搜索状态提示条 ====================
  .search-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-xs) var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: var(--radius-lg);

    .search-indicator {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);

      .search-icon-pulse {
        color: var(--primary-color);
        animation: searchPulse 2s ease-in-out infinite;
      }

      .search-text {
        font-size: var(--text-sm);
        color: var(--primary-color);
        font-weight: 500;
      }
    }

    .close-search-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: var(--radius-full);
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.1);
        color: var(--text-primary);
      }
    }
  }

  .input-wrapper {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
    background: linear-gradient(180deg, var(--bg-card), var(--bg-secondary));
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-2xl); // 增大圆角
    padding: var(--spacing-sm) var(--spacing-md); // 减小内部间距
    transition: all 0.3s ease;
    box-shadow: 
      var(--shadow-sm),
      0 0 20px rgba(59, 130, 246, 0.15), // 蓝色阴影
      0 0 40px rgba(147, 51, 234, 0.1);  // 紫色阴影
    animation: breathe 3s ease-in-out infinite; // 呼吸灯效果

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 
        var(--shadow-md),
        0 0 30px rgba(59, 130, 246, 0.25),
        0 0 60px rgba(147, 51, 234, 0.15);
      animation: breatheFast 2s ease-in-out infinite;
    }

    &:focus-within {
      border-color: var(--primary-color);
      box-shadow: 
        0 0 0 2px var(--primary-color-ultra-light),
        0 0 40px rgba(59, 130, 246, 0.3),
        0 0 80px rgba(147, 51, 234, 0.2);
      animation: breatheFast 2s ease-in-out infinite;
    }

    .top-row {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .main-input {
      width: 100%;
      position: relative;

      // 发送中状态
      &.sending-state {
        :deep(.el-textarea__inner) {
          background: var(--bg-secondary);
          opacity: 0.8;
          cursor: not-allowed;
        }
      }

      // 搜索激活状态
      &.search-active {
        :deep(.el-textarea__inner) {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 51, 234, 0.02) 100%);

          &::placeholder {
            color: var(--primary-color);
            opacity: 0.7;
          }
        }
      }

      // 发送中的加载指示器
      .sending-indicator {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        pointer-events: none;
        z-index: 10;

        .loading-dots {
          display: flex;
          gap: var(--spacing-xs);
          
          span {
            width: 6px;
            height: 6px;
            background: var(--primary-color);
            border-radius: 50%;
            animation: dotPulse 1.4s infinite ease-in-out;
            
            &:nth-child(1) {
              animation-delay: 0s;
            }
            &:nth-child(2) {
              animation-delay: 0.2s;
            }
            &:nth-child(3) {
              animation-delay: 0.4s;
            }
          }
        }
      }

      :deep(.el-textarea) {
        .el-textarea__inner {
          border: none;
          background: transparent;
          padding: var(--spacing-sm);
          font-size: var(--text-base);
          line-height: 1.5;
          resize: none;
          box-shadow: none;
          color: var(--text-primary);
          transition: all 0.3s ease;

          &::placeholder {
            color: var(--text-placeholder);
          }

          &:focus {
            box-shadow: none;
          }
          
          &:disabled {
            background: var(--bg-secondary);
            opacity: 0.8;
            cursor: not-allowed;
          }
        }
      }
    }

    .footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
      margin-top: var(--spacing-sm);
    }

    .controls-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-shrink: 0;
    }

    .controls-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-shrink: 0;
    }

    .feature-icons {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: auto; /* 使用固定值替代不存在的变量 */
      min-height: 32px; height: auto;
      border: var(--border-width-base) solid var(--border-color);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      cursor: pointer;
      position: relative;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      transition: all var(--transition-base);
      font-size: var(--text-sm);
      box-sizing: border-box;
      flex-shrink: 0;

      /* 确保图标正确显示 */
      .unified-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto;
        min-height: 32px; height: auto;
      }

      &:hover:not(:disabled) {
        background: var(--bg-hover);
        border-color: var(--primary-color);
        color: var(--primary-color);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      &:active {
        transform: translateY(0) scale(0.95);
      }

      &.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-on-primary);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* 图标悬停动画 */
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, var(--primary-light), transparent 70%);
        opacity: 0;
        transform: scale(0.6);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
      }

      &:hover:not(:disabled)::after {
        opacity: 1;
        transform: scale(1);
      }

      // 搜索按钮特殊样式
      &.search-btn {
        &.active {
          background: linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%);
          border-color: var(--primary-color);
          color: white;
        }

        &.search-pulse {
          animation: searchButtonPulse 2s ease-in-out infinite;
        }
      }
    }

    .font-size-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: auto;
      min-height: 32px; height: auto;
      border: var(--border-width-base) solid var(--border-color);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-base);
      box-sizing: border-box;
      flex-shrink: 0;

      &:hover {
        background: var(--bg-hover);
        border-color: var(--primary-color);
        color: var(--primary-color);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      .font-icon-small {
        font-size: var(--text-xs);
        font-weight: var(--font-light);
        line-height: 1;
        margin-bottom: 2px;
      }

      .font-icon-large {
        font-size: var(--text-sm);
        font-weight: var(--font-semibold);
        line-height: 1;
      }
    }

    .voice-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: auto;
      min-height: 32px; height: auto;
      border: var(--border-width-base) solid var(--border-color);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-base);
      font-size: var(--text-sm);
      box-sizing: border-box;
      flex-shrink: 0;

      &:hover:not(:disabled):not(.disabled) {
        background: var(--bg-hover);
        border-color: var(--primary-color);
        color: var(--primary-color);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      &:active {
        transform: translateY(0) scale(0.95);
      }

      &.active {
        background: var(--success-color);
        border-color: var(--success-color);
        color: var(--text-on-primary);
        animation: pulse 2s infinite;
      }

      &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .send-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      min-height: 40px;
      height: 40px;
      width: 40px;
      padding: 0;
      border: var(--border-width-base) solid var(--primary-color);
      background: var(--primary-color);
      border-radius: var(--radius-full); // 圆形按钮
      color: var(--text-on-primary);
      cursor: pointer;
      transition: all var(--transition-base);
      font-size: var(--text-lg);
      box-sizing: border-box;
      flex-shrink: 0;
      position: relative;
      outline: none;

      // 修复图标显示 - 确保图标是白色并显示
      :deep(.unified-icon) {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          color: var(--text-on-primary);
        }
      }

      // 默认显示发送图标，隐藏停止图标
      :deep(.send-icon) {
        display: flex;
      }

      :deep(.stop-icon) {
        display: none;
      }

      &:hover:not(.disabled) {
        background: var(--primary-hover);
        border-color: var(--primary-hover);
        transform: translateY(-2px) scale(1.08);
        box-shadow: 
          var(--shadow-md),
          0 0 20px rgba(59, 130, 246, 0.4);
      }

      &:active:not(.disabled) {
        transform: translateY(0) scale(0.92);
        animation: clickPulse 0.3s ease-out;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--bg-hover);
        border-color: var(--border-color);
        color: var(--text-placeholder);
      }

      &.stopping {
        background: var(--danger-color);
        border-color: var(--danger-color);
        color: var(--text-on-primary);
        animation: pulse 1s infinite;
        box-shadow:
          var(--shadow-md),
          0 0 30px rgba(220, 38, 38, 0.4);

        // 停止时显示关闭图标，隐藏发送图标
        :deep(.send-icon) {
          display: none;
        }

        :deep(.stop-icon) {
          display: flex;
        }

        &:hover {
          background: var(--danger-color-dark, #991b1b);
          box-shadow:
            var(--shadow-lg),
            0 0 40px rgba(220, 38, 38, 0.5);
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

// 加载点脉冲动画
@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 点击动画 - 按钮被点击时的脉冲效果
@keyframes clickPulse {
  0% {
    box-shadow: 
      var(--shadow-md),
      0 0 20px rgba(59, 130, 246, 0.6),
      inset 0 0 10px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 
      var(--shadow-lg),
      0 0 30px rgba(59, 130, 246, 0.8),
      inset 0 0 15px rgba(59, 130, 246, 0.5);
  }
  100% {
    box-shadow: 
      var(--shadow-md),
      0 0 20px rgba(59, 130, 246, 0.4);
  }
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.5;
  }
}

// 呼吸灯效果 - 慢速
@keyframes breathe {
  0%, 100% {
    box-shadow: 
      var(--shadow-sm),
      0 0 20px rgba(59, 130, 246, 0.15),
      0 0 40px rgba(147, 51, 234, 0.1);
  }
  50% {
    box-shadow: 
      var(--shadow-sm),
      0 0 30px rgba(59, 130, 246, 0.25),
      0 0 60px rgba(147, 51, 234, 0.15);
  }
}

// 呼吸灯效果 - 快速
@keyframes breatheFast {
  0%, 100% {
    box-shadow:
      var(--shadow-md),
      0 0 30px rgba(59, 130, 246, 0.25),
      0 0 60px rgba(147, 51, 234, 0.15);
  }
  50% {
    box-shadow:
      var(--shadow-md),
      0 0 40px rgba(59, 130, 246, 0.35),
      0 0 80px rgba(147, 51, 234, 0.25);
  }
}

// 搜索图标脉冲动画
@keyframes searchPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

// 搜索按钮脉冲动画
@keyframes searchButtonPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .claude-input-container {
    padding: var(--spacing-md) var(--spacing-sm);

    .input-wrapper {
      padding: var(--spacing-sm);

      .footer-row {
        flex-direction: column;
        gap: var(--spacing-sm);
        align-items: stretch;
      }

      .controls-left,
      .controls-right {
        justify-content: center;
      }

      .feature-icons {
        gap: var(--spacing-xs);
      }
    }
  }
}

/* 小屏幕设备优化 */
@media (max-width: var(--breakpoint-sm)) {
  .claude-input-container {
    padding: var(--spacing-sm) var(--spacing-xs);

    .input-wrapper {
      .footer-row {
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
      }

      .controls-left,
      .controls-right {
        gap: var(--spacing-xs);
      }

      .feature-icons {
        gap: var(--spacing-xs);
      }

      .icon-btn,
      .font-size-btn,
      .voice-btn {
        width: auto;
        min-height: 32px; height: auto;
      }

      .send-btn {
        min-width: auto;
        min-height: 32px; height: auto;
        font-size: var(--text-xs);
      }
    }
  }
}

// 导入类型选择对话框样式
.import-type-options {
  p {
    margin-bottom: 16px;
    color: #606266;
  }

  .import-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;

    :deep(.el-radio) {
      height: auto;
      padding: 12px 16px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-right: 0;

      &:hover {
        border-color: #409eff;
      }

      &.is-checked {
        border-color: #409eff;
        background: #ecf5ff;
      }
    }
  }

  .import-option {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon {
      font-size: 24px;
    }

    .label {
      font-size: 16px;
      font-weight: 500;
    }
  }
}
</style>