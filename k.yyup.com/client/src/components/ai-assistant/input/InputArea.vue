<template>
  <!-- Claude Code 风格输入区域 -->
  <div class="claude-input-container" :class="{ 'web-search-enabled': webSearch }">
    <!-- 搜索状态提示条 -->
    <Transition name="slide-fade">
      <div v-if="webSearch" class="search-status-bar">
        <div class="search-indicator">
          <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="9" r="6" stroke-linecap="round"/>
            <path d="M13.5 13.5L17 17" stroke-linecap="round"/>
          </svg>
          <span class="search-text">已开启网络搜索</span>
        </div>
        <button class="close-search-btn" @click="$emit('update:webSearch', false)" title="关闭搜索">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 5l10 10M15 5L5 15" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </Transition>

    <div class="input-wrapper">
      <!-- 主输入框 -->
      <div class="main-input" :class="{ 'sending-state': sending }">
        <el-input
          :model-value="inputMessage"
          @update:model-value="$emit('update:inputMessage', $event)"
          type="textarea"
          :rows="1"
          :maxlength="4000"
          :placeholder="getPlaceholder"
          @keydown.enter="handleKeyDown"
          @keydown.ctrl.enter="handleSendMessage"
          @keydown.meta.enter="handleSendMessage"
          @keydown.esc="handleCancelSend"
          resize="none"
          :autosize="{ minRows: 2, maxRows: 6 }"
          :disabled="sending"
        />
      </div>

      <div class="footer-row">
        <div class="controls-left">
          <!-- 功能按钮区域 -->
          <div class="feature-icons">
            <!-- 搜索按钮 -->
            <el-tooltip :content="webSearch ? '关闭网络搜索' : '开启网络搜索'" placement="top">
              <button
                class="icon-btn"
                :class="{ active: webSearch }"
                :disabled="!isRegistered"
                @click="$emit('update:webSearch', !webSearch)"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="9" cy="9" r="6" stroke-linecap="round"/>
                  <path d="M13.5 13.5L17 17" stroke-linecap="round"/>
                </svg>
              </button>
            </el-tooltip>

            <!-- 文件上传按钮 -->
            <el-tooltip content="上传文件" placement="top">
              <button class="icon-btn" :disabled="uploadingFile || sending" @click="triggerFileUpload">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 14a7 7 0 0 1 14 0M10 3v10" stroke-linecap="round"/>
                </svg>
              </button>
            </el-tooltip>

            <!-- 图片上传按钮 -->
            <el-tooltip content="上传图片" placement="top">
              <button class="icon-btn" :disabled="uploadingImage || sending" @click="triggerImageUpload">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="14" height="14" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M17 7l-3 3-2-2" stroke-linecap="round"/>
                </svg>
              </button>
            </el-tooltip>

            <!-- 字体大小按钮 -->
            <el-tooltip :content="`字体大小: ${fontSize}px`" placement="top" v-if="!props.simpleMode">
              <button class="font-size-btn" @click="handleFontSizeToggle">
                <span class="font-icon-small">a</span>
                <span class="font-icon-large">A</span>
              </button>
            </el-tooltip>
          </div>
        </div>

        <div class="controls-right">
          <div class="right-actions">
            <!-- 语音按钮（简化模式下隐藏） -->
            <template v-if="!props.simpleMode">
              <button
                class="voice-btn"
                :class="{ active: isListening }"
                @click="$emit('toggle-voice-input')"
                :title="isListening ? '停止录音' : '语音输入'"
              >
                <svg v-if="isListening" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="6" height="6" rx="1"/>
                  <path d="M5 12h14" stroke-linecap="round"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" stroke-linecap="round"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke-linecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="22" stroke-linecap="round"/>
                </svg>
              </button>

              <button
                class="voice-btn"
                :class="{ active: isSpeaking, disabled: !hasLastMessage || sending }"
                @click="$emit('toggle-voice-output')"
                :title="isSpeaking ? '停止播放' : '语音播放'"
              >
                <svg v-if="isSpeaking" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </template>

            <!-- 发送/停止按钮 -->
            <button
              class="send-btn"
              :class="{
                disabled: !inputMessage.trim() && !sending,
                stopping: sending
              }"
              @click="sending ? handleStopSending() : handleSendMessage()"
              :title="sending ? '停止生成' : '发送消息'"
            >
              <svg v-if="!sending" class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13" stroke-linecap="round"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else class="stop-icon" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            </button>
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
  simpleMode?: boolean
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
}

const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()
const imageInputRef = ref<HTMLInputElement>()
const fontSteps = [14, 16, 18]

// 动态 placeholder
const getPlaceholder = computed(() => {
  if (props.sending) return '正在发送中...'
  if (props.webSearch) return '已开启网络搜索，输入问题将自动搜索网络信息'
  return '输入消息，按 Enter 发送，Shift+Enter 换行'
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

const handleSendMessage = () => {
  if (props.inputMessage.trim() && !props.sending) {
    emit('send')
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
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

// 搜索状态过渡动画
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}

.claude-input-container {
  padding: 0;
  background: transparent;
  position: sticky;
  bottom: 0;
  z-index: 10;

  // 搜索开启时的容器样式
  &.web-search-enabled {
    .input-wrapper {
      border-color: var(--primary-color);
      box-shadow: 0 0 15px var(--ai-primary-glow);
    }
  }
}

// 搜索状态提示条
.search-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--primary-light-bg);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-lg);

  .search-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .search-icon {
      width: 16px;
      height: 16px;
      color: var(--primary-color);
    }

    .search-text {
      font-size: var(--text-sm);
      color: var(--primary-color);
      font-weight: 500;
    }
  }

  .close-search-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--primary-color);
    transition: background-color 0.15s;

    svg {
      width: 14px;
      height: 14px;
      stroke: currentColor;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

.input-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-top: 2px solid var(--border-color-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all 0.3s var(--ai-transition-bounce);
  box-shadow: var(--shadow-sm);

  &:hover {
    border-color: var(--primary-light);
    box-shadow: var(--shadow-md);
  }

  &:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-light-bg), var(--shadow-md);
  }
}

/* 暗黑主题适配 */
:global([data-theme="dark"]) .input-wrapper,
:global(.theme-dark) .input-wrapper {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  &:focus-within {
    background: rgba(30, 41, 59, 1);
    border-color: var(--primary-color);
  }
}

.main-input {
  width: 100%;
  position: relative;

  &.sending-state {
    :deep(.el-textarea__inner) {
      background: var(--bg-secondary);
      opacity: 0.8;
      cursor: not-allowed;
    }
  }

  :deep(.el-textarea) {
    .el-textarea__inner {
      border: none;
      background: transparent;
      padding: var(--spacing-sm);
      font-size: var(--text-base);
      line-height: 1.6;
      resize: none;
      box-shadow: none;
      color: var(--text-primary);
      min-height: 52px !important;

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
  margin-top: var(--spacing-xs);
  border-top: 1px solid var(--border-color-light);
  padding-top: var(--spacing-sm);
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: nowrap;
}

.feature-icons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
  }

  &:hover:not(:disabled) {
    background: var(--bg-hover);
    color: var(--primary-color);
  }

  &.active {
    background: var(--primary-light-bg);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.font-size-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--primary-color);
  }

  .font-icon-small {
    font-size: 10px;
    line-height: 1;
  }

  .font-icon-large {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    margin-top: -2px;
  }
}

.voice-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
  }

  &:hover:not(:disabled):not(.disabled) {
    background: var(--bg-hover);
    color: var(--primary-color);
  }

  &.active {
    background: var(--success-light-bg);
    color: var(--success-color);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.send-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  border: none;
  border-radius: var(--radius-lg);
  color: var(--text-on-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }

  .send-icon {
    margin-left: 2px;
  }

  &:hover:not(.disabled) {
    background: var(--primary-hover);
    transform: scale(1.05);
  }

  &:active:not(.disabled) {
    transform: scale(0.95);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg-tertiary);
  }

  &.stopping {
    background: var(--danger-color);

    &:hover {
      background: var(--danger-dark, #d32f2f);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .claude-input-container {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .input-wrapper {
    padding: var(--spacing-xs);
  }

  .footer-row {
    flex-direction: row;
    gap: var(--spacing-xs);
  }
}
</style>
