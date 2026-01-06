<template>
  <!-- Claude Code风格输入区域 -->
  <div class="claude-input-container">
    <div class="input-wrapper">
      <div class="top-row">
      <!-- 主输入框 -->
      <div class="main-input">
        <el-input
          :model-value="inputMessage"
          @update:model-value="$emit('update:inputMessage', $event)"
          type="textarea"
          :rows="1"
          :maxlength="1000"
          placeholder="请输入您的问题（Enter 发送，Shift+Enter 换行，ESC 取消）"
          @keydown.enter="handleKeyDown"
          @keydown.ctrl.enter="handleSendMessage"
          @keydown.meta.enter="handleSendMessage"
          @keydown.esc="handleCancelSend"

          resize="none"
          :autosize="{ minRows: 2, maxRows: 5 }"
        />
      </div>
      </div>

      <div class="footer-row">
        <div class="controls-left">
          <div class="feature-icons">
            <el-tooltip content="搜索" placement="top">
              <button
                class="icon-btn"
                :class="{ active: webSearch }"
                :disabled="!isRegistered"
                @click="$emit('update:webSearch', !webSearch)"
                title="搜索"
              >
                <UnifiedIcon name="search" :size="16" />
              </button>
            </el-tooltip>

            <el-tooltip content="上传文件" placement="top">
              <button class="icon-btn" :disabled="uploadingFile || sending" @click="triggerFileUpload" title="上传文件">
                <UnifiedIcon name="document" :size="16" />
              </button>
            </el-tooltip>
            <el-tooltip content="上传图片" placement="top">
              <button class="icon-btn" :disabled="uploadingImage || sending" @click="triggerImageUpload" title="上传图片">
                <UnifiedIcon name="picture" :size="16" />
              </button>
            </el-tooltip>
            <el-tooltip :content="`字体大小: ${fontSize}px`" placement="top">
              <button class="font-size-btn" @click="increaseFontSize" title="调整字体大小">
                <span class="font-icon-small">a</span>
                <span class="font-icon-large">A</span>
              </button>
            </el-tooltip>
          </div>
        </div>
        <div class="controls-right">
          <div class="right-actions">
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

            <button
              class="send-btn"
              :class="{
                disabled: !inputMessage.trim() && !sending,
                stopping: sending
              }"
              @click="sending ? handleStopSending() : handleSendMessage()"
              :title="sending ? '停止生成' : '发送消息'"
            >
              <el-icon size="16" v-if="!sending">
                <Promotion />
              </el-icon>
              <el-icon size="16" v-else>
                <CircleClose />
              </el-icon>
            </button>
          </div>
        </div>
      </div>
      </div>
    <!-- 语音状态提示 -->
    <div class="voice-status" v-if="speechStatus !== 'idle'">
      <div class="status-indicator" :class="speechStatus">
        <el-icon size="16">
          <component :is="isListening ? 'Microphone' : 'VideoPlay'" />
        </el-icon>
        <span class="status-text">
          {{ isListening ? '正在听取语音...' : '正在播放语音...' }}
        </span>
        <div class="voice-wave" v-if="isListening">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      @change="onFileSelected"
      accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
    />
    <input
      ref="imageInput"
      type="file"
      style="display: none"
      @change="onImageSelected"
      accept="image/*"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Picture,
  Search,
  Operation,
  Promotion,
  VideoPause,
  Microphone,
  VideoPlay,
  Headset,
  Loading,
  CircleClose
} from '@element-plus/icons-vue'
import { fileUploadManager } from '@/utils/fileUpload'

// Props
interface Props {
  inputMessage: string
  sending: boolean
  webSearch: boolean
  isRegistered: boolean
  isListening: boolean
  isSpeaking: boolean
  speechStatus: string
  hasLastMessage: boolean
  fontSize?: number // 🔧 新增：字体大小
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 16 // 默认var(--text-lg)
})

// 🔧 调试：监听 sending 状态变化
watch(() => props.sending, (newVal, oldVal) => {
  console.log('🔵 [InputArea] sending 状态变化:', { oldVal, newVal })
})

// Emits
const emit = defineEmits<{
  'update:inputMessage': [value: string]
  'update:webSearch': [value: boolean]
  'update:fontSize': [value: number] // 🔧 新增：字体大小更新事件
  'send': []
  'cancel-send': [] // 🔧 新增：取消发送事件
  'stop-sending': [] // 🔧 新增：停止发送事件
  'toggle-voice-input': []
  'toggle-voice-output': []
  'show-quick-query': []
}>()

// 使用 toRefs 保持 props 的响应式引用，避免打断 v-model
const { inputMessage, webSearch, fontSize } = toRefs(props)

// 文件输入框引用
const fileInput = ref<HTMLInputElement>()
const imageInput = ref<HTMLInputElement>()
const uploadingFile = ref(false)
const uploadingImage = ref(false)

// 🔧 智能代理提示 - 优化权限检查和状态提示


// 🔧 字体大小调整
const increaseFontSize = () => {
  const currentSize = fontSize?.value || 16
  let newSize = currentSize + 1

  // 限制字体大小范围：var(--text-sm) - var(--text-3xl)
  if (newSize > 24) {
    newSize = 12 // 循环回到最小值
  }

  emit('update:fontSize', newSize)
  ElMessage.success(`字体大小: ${newSize}px`)
}

// 处理键盘按下事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 如果按下Shift+Enter，允许换行，不发送消息
  if (event.shiftKey) {
    return
  }

  // 普通Enter键发送消息
  event.preventDefault()
  handleSendMessage()
}

// 处理发送消息
const handleSendMessage = () => {
  // 🔧 修复：使用 inputMessage.value 而不是 props.inputMessage
  if (!inputMessage.value.trim() || props.sending) return

  const messageContent = inputMessage.value.trim()

  console.log('🚀 InputArea: 处理发送消息:', messageContent)

  // 检查是否是快捷查询命令
  if (messageContent === '/查询' || messageContent === '/query') {
    console.log('✅ InputArea: 检测到快捷查询命令，触发show-quick-query事件')
    emit('show-quick-query')
    emit('update:inputMessage', '')
    return
  }

  // 普通消息发送
  console.log('📤 InputArea: 发送普通消息')
  emit('send')
}

// 🔧 处理取消发送（ESC键）
const handleCancelSend = () => {
  if (props.sending) {
    console.log('🛑 InputArea: 用户按下ESC键，取消发送')
    emit('cancel-send')
    ElMessage.info('已取消发送')
  }
}

// 🔧 处理停止发送（点击停止按钮）
const handleStopSending = () => {
  console.log('🛑 InputArea: 用户点击停止按钮')
  emit('stop-sending')
  ElMessage.info('正在停止AI响应...')
}



// 触发文件上传
const triggerFileUpload = () => {
  try {
    if (fileInput.value) {
      fileInput.value.click()
    } else {
      ElMessage.warning('文件上传功能暂时不可用，请刷新页面后重试')
    }
  } catch (error) {
    console.error('文件上传触发失败:', error)
    ElMessage.error('文件选择器无法打开，请检查浏览器设置')
  }
}

// 触发图片上传
const triggerImageUpload = () => {
  try {
    if (imageInput.value) {
      imageInput.value.click()
    } else {
      ElMessage.warning('图片上传功能暂时不可用，请刷新页面后重试')
    }
  } catch (error) {
    console.error('图片上传触发失败:', error)
    ElMessage.error('图片选择器无法打开，请检查浏览器设置')
  }
}

// 文件选择处理（内置上传并更新输入框内容）
const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  try {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过10MB')
      return
    }
    uploadingFile.value = true
    const res: any = await fileUploadManager.uploadFile(file, { module: 'ai-assistant', isPublic: false })
    const data = res?.data || res
    const url = data?.accessUrl || data?.access_url
    const name = data?.originalName || file.name
    if (!url) {
      ElMessage.error('上传失败')
      return
    }
    const link = `[📄 ${name}](${url})`
    const newVal = inputMessage.value ? `${inputMessage.value}\n${link}` : link
    emit('update:inputMessage', newVal)
    ElMessage.success('上传成功')
  } catch (e) {
    ElMessage.error('上传失败')
  } finally {
    uploadingFile.value = false
    if (target) target.value = ''
  }
}

// 图片选择处理（内置上传并更新输入框内容）
const onImageSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  try {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过5MB')
      return
    }
    uploadingImage.value = true
    const res: any = await fileUploadManager.uploadFile(file, { module: 'ai-assistant', isPublic: false })
    const data = res?.data || res
    const url = data?.accessUrl || data?.access_url
    const name = data?.originalName || file.name
    if (!url) {
      ElMessage.error('上传失败')
      return
    }
    const md = `![${name}](${url})`
    const newVal = inputMessage.value ? `${inputMessage.value}\n${md}` : md
    emit('update:inputMessage', newVal)
    ElMessage.success('上传成功')
  } catch (e) {
    ElMessage.error('上传失败')
  } finally {
    uploadingImage.value = false
    if (target) target.value = ''
  }
}
</script>

<style lang="scss" scoped>
// 🎨 导入主题变量
@import '@/styles/design-tokens.scss';

/* 🔧 呼吸灯动画 */
@keyframes breathing {
  0%, 100% {
    opacity: 1;
    transform: translateX(var(--text-base)) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translateX(var(--text-base)) scale(1.1);
  }
}

.claude-input-container {
  padding: var(--text-lg) var(--text-sm);
  background: transparent;

  // 🎨 5️⃣ 输入框区域 - 使用主题变量
  .input-wrapper {
    position: relative;
    z-index: 1100;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, var(--ai-input-bg-start) 0%, var(--ai-input-bg-end) 100%);
    backdrop-filter: blur(var(--text-2xl)) saturate(180%);
    border: 1.5px solid var(--ai-input-border);
    border-radius: var(--text-2xl);
    padding: var(--text-sm) var(--text-base);
    gap: var(--spacing-sm);

    /* 🎯 输入框宽度比对话框窄一些，居中显示 */
    width: var(--ai-content-width) !important;
    max-width: var(--ai-content-max-width) !important;
    margin: 0 auto !important;

    // 🔧 防止缩放时变形
    transform-origin: center center;
    flex-shrink: 0;
    box-shadow:
      0 var(--spacing-sm) var(--spacing-3xl) var(--ai-input-shadow),
      inset 0 var(--border-width-base) 0 var(--glass-bg-light),
      inset 0 -var(--border-width-base) 0 var(--shadow-heavy);
    transition: all var(--ai-transition-normal);

    &:hover {
      border-color: var(--ai-input-border-hover);
      box-shadow:
        0 var(--text-sm) 40px var(--ai-input-shadow-hover),
        inset 0 var(--border-width-base) 0 var(--glass-bg-medium),
        inset 0 -var(--border-width-base) 0 var(--shadow-heavy);
    }

    &:focus-within {
      border-color: var(--accent-marketing-hover-medium); // 🎨 聚焦时边框更亮
      box-shadow:
        0 var(--text-sm) 4var(--spacing-sm) var(--accent-marketing-heavy), // 🎨 更强的紫色光晕
        0 0 0 3px var(--accent-marketing-light), // 🎨 外圈光晕
        inset 0 var(--border-width-base) 0 var(--glass-bg-heavy),
        inset 0 -var(--border-width-base) 0 var(--shadow-heavy);
    }
    .top-row {
      display: block;
      width: 100%;
    }

    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-xs) var(--spacing-xs) 6px; // 增加顶部内边距，给输入框和图标之间留出空间
      .footer-row .controls-left {
        display: flex;
        align-items: center;
        gap: var(--text-sm);
        margin-left: var(--spacing-sm); /* 左侧留出空间 */
      }

      .footer-row .controls-right {
        display: flex;
        align-items: center;
      }

    }

    /* Feature icon group */
    .footer-row .feature-icons {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm); // 增加按钮间距，更易区分
      margin-left: var(--spacing-sm); /* 左侧留出空间 */
    }
    .footer-row .icon-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      36: 12682px !important;
      36: 12712px !important;
      36: 12743px !important;
      36: 12777px !important;
      border: 1.5px solid var(--accent-marketing-light) !important; // 🎨 紫色半透明边框
      background: var(--gradient-glass) !important; // 🎨 玻璃态渐变
      backdrop-filter: blur(10px) !important; // 🎨 毛玻璃效果
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy), inset 0 var(--border-width-base) 0 var(--glass-bg-medium) !important; // 🎨 内外阴影
      10: 13129px !important;
      color: var(--text-on-primary-secondary) !important; // 🎨 白色半透明图标
      cursor: pointer !important;
      position: relative !important;
      overflow: hidden !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      padding: 0 !important;
      margin: 0 !important;
      font-size: var(--text-base) !important;
    }
    /* 悬停动画：轻微上浮 + 波纹 */
    .footer-row .icon-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, var(--accent-marketing-medium), transparent 70%);
      opacity: 0;
      transform: scale(0.6);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }
    .footer-row .icon-btn:hover:not(:disabled) {
      background: var(--gradient-accent-hover) !important; // 🎨 紫色渐变
      border-color: var(--accent-marketing-hover-heavy) !important; // 🎨 亮紫色边框
      color: var(--text-on-primary) !important; // 🎨 更亮的白色图标
      transform: translateY(-3px) !important; // 🎨 更明显的上浮
      box-shadow: 0 6px var(--text-2xl) var(--accent-marketing-heavy), inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important; // 🎨 紫色光晕
    }
    .footer-row .icon-btn:hover:not(:disabled)::after {
      opacity: 1;
      transform: scale(1);
    }
    /* 图标平滑浮动 + 统一放大 */
    .footer-row .icon-btn :deep(.el-icon) {
      font-size: var(--text-xl) !important;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .footer-row .icon-btn :deep(.el-icon svg) {
      width: var(--text-xl) !important;
      height: var(--text-xl) !important;
    }
    .footer-row .icon-btn:hover :deep(.el-icon) {
      transform: scale(1.2) !important; // 🎨 悬停时图标放大
    }
    /* 选中状态：高亮+外圈光晕，明显区分 */
    .footer-row .icon-btn.active {
      background: var(--gradient-accent-hover) !important; // 🎨 紫色渐变
      border-color: var(--accent-marketing-hover-heavy) !important; // 🎨 亮紫色边框
      color: var(--bg-color) !important;
      box-shadow: 0 0 0 3px var(--accent-marketing-medium), 0 var(--spacing-xs) var(--text-sm) var(--accent-marketing-heavy) !important; // 🎨 紫色光晕
      transform: translateY(-2px);
    }
    .footer-row .icon-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      filter: grayscale(0.5); // 🎨 禁用时灰度效果
    }

    /* 🔧 字体大小调整按钮样式 */
    .footer-row .font-size-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      2: 15619px !important;
      42: 1566var(--spacing-xs) !important;
      36: 1569var(--spacing-xs) !important;
      42: 15725px !important;
      36: 15759px !important;
      border: 1.5px solid var(--accent-marketing-light) !important; // 🎨 紫色半透明边框
      background: var(--gradient-glass) !important; // 🎨 玻璃态
      backdrop-filter: blur(10px) !important;
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy), inset 0 var(--border-width-base) 0 var(--glass-bg-medium) !important;
      10: 16076px !important;
      cursor: pointer !important;
      position: relative !important;
      overflow: hidden !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      padding: 0 6px !important;
      margin: 0 !important;

      .font-icon-small {
        font-size: var(--text-sm) !important;
        font-weight: 500 !important;
        color: var(--text-on-primary-secondary) !important; // 🎨 白色半透明
        transition: all 0.3s ease !important;
      }

      .font-icon-large {
        font-size: var(--text-xl) !important;
        font-weight: 600 !important;
        color: rgba(255, 255, 255, 0.85) !important; // 🎨 白色半透明
        transition: all 0.3s ease !important;
      }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--radial-ai), transparent 70%);
        opacity: 0;
        transform: scale(0.6);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
      }

      &:hover {
        background: var(--gradient-accent-hover) !important; // 🎨 紫色渐变
        border-color: rgba(167, 139, 250, 0.6) !important;
        transform: translateY(-3px) !important;
        box-shadow: 0 6px var(--text-2xl) var(--accent-marketing-heavy), inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;

        .font-icon-small {
          color: var(--white-alpha-95) !important;
          transform: scale(1.15) !important;
        }

        .font-icon-large {
          color: rgba(255, 255, 255, 1) !important;
          transform: scale(1.15) !important;
        }

        &::after {
          opacity: 1;
          transform: scale(1);
        }
      }

      &:active {
        transform: translateY(0) scale(0.95) !important;
        box-shadow: 0 2px var(--spacing-sm) var(--accent-marketing-heavy), inset 0 var(--border-width-base) 0 var(--glass-bg-medium) !important;
      }
    }

    /* 智能代理开关样式 */
    .footer-row .smart-agent-toggle {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: var(--spacing-sm) !important;
      6: 18263px 10px !important;
      height: var(--spacing-3xl) !important;
      min-height: var(--spacing-3xl) !important;
      border: none !important;
      background: #1e3a5f !important;
      border-radius: var(--text-base) !important;
      color: var(--bg-color) !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      font-size: var(--text-sm) !important;
      font-weight: 500 !important;
      white-space: nowrap !important;
    }

    .footer-row .smart-agent-toggle:hover:not(:disabled) {
      background: #2a4a75 !important;
      transform: translateY(-var(--border-width-base));
    }

    .footer-row .smart-agent-toggle .toggle-label {
      color: var(--bg-color);
      font-size: var(--text-sm);
      font-weight: 500;
      1: 18997;
    }

    .footer-row .smart-agent-toggle .toggle-switch {
      position: relative;
      width: var(--spacing-3xl);
      height: var(--text-xl);
      background: var(--white-alpha-30);
      9: 19226px;
      transition: background 0.3s ease;
    }

    .footer-row .smart-agent-toggle .toggle-circle {
      position: absolute;
      2: 1937var(--spacing-sm);
      2: 1939var(--spacing-xs);
      width: var(--text-base);
      height: var(--text-base);
      background: var(--bg-color);
      border-radius: var(--radius-full);
      transition: transform 0.3s ease;
      box-shadow: 0 var(--border-width-base) 3px var(--shadow-heavy);
    }

    /* 激活状态 */
    .footer-row .smart-agent-toggle.active .toggle-switch {
      background: rgba(34, 197, 94, 0.3); // 🔧 绿色背景
    }

    .footer-row .smart-agent-toggle.active .toggle-circle {
      transform: translateX(var(--text-base));
      background: var(--success-color); // 🔧 绿色圆圈
      animation: breathing 2s ease-in-out infinite; // 🔧 呼吸灯动画
      box-shadow: 0 0 var(--spacing-sm) rgba(34, 197, 94, 0.6), 0 0 var(--text-lg) rgba(34, 197, 94, 0.4); // 🔧 绿色光晕
    }

    /* 禁用状态 */
    .footer-row .smart-agent-toggle:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--text-secondary) !important;
    }

    .footer-row .smart-agent-toggle:disabled:hover {
      transform: none;
    }

    .footer-row .chip {
      display: inline-flex;
      align-items: center;
      6: 2042var(--border-width-base);
      6: 20460px var(--text-sm);
      border: var(--border-width-base) solid var(--border-color);
      background: var(--bg-color);
      border-radius: var(--text-sm);
      font-size: var(--text-sm);
      color: var(--color-gray-700);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #f9fafb;
        border-color: var(--border-color);
      }

      &.active {
        background: #eef2ff;
        border-color: #c7d2fe;
        color: var(--text-primary);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }


    .left-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);

      .action-btn {
        display: flex;
        align-items: center;
        1: 21182px; // 最小化图标间距
        2: 21236px var(--spacing-xs); // 进一步减少按钮内边距，与LobeChat保持一致
        border: none;
        background: transparent;
        border-radius: var(--spacing-xs); // 进一步减少圆角
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: var(--text-base); // 统一字体大小，保持一致性

        &:hover {
          background: var(--bg-hover);
          color: var(--color-gray-700);
        }

        &.search-btn {
          6: 21683px var(--text-sm);
          background: #f9fafb;
          border: var(--border-width-base) solid var(--border-color);

          &:hover {
            background: var(--bg-hover);
            border-color: var(--border-color);
          }
        }
      }
    }

    .main-input {
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
      margin: 0;

      :deep(.el-textarea) {
        .el-textarea__inner {
        width: 100%;

          border: none;
          background: var(--white-alpha-3); // 🎨 极浅的白色背景
          10: 22212px var(--text-base);
          font-size: var(--text-base);
          1.6: 22268;
          resize: none;
          color: var(--white-alpha-90); // 🎨 白色文字
          48: 22419px;
          border-radius: var(--text-sm);
          caret-color: rgba(167, 139, 250, 0.8); // 🎨 紫色光标
          transition: all 0.3s ease;

          &:focus {
            outline: none;
            box-shadow: none;
            background: var(--white-alpha-5); // 🎨 聚焦时背景稍亮
          }

          &::placeholder {
            color: var(--white-alpha-40); // 🎨 白色半透明占位符
            font-size: var(--text-base);
      /*   */
      pointer-events: auto;
      position: relative;
      z-index: 1;
      :deep(.el-textarea), :deep(.el-textarea__inner) { pointer-events: auto; }

          }
        }
      }
    }

    .right-actions {
      display: flex;
      align-items: center;
      10: 23120px; // 增加右侧按钮间距



      .send-btn {
        44: 2322var(--spacing-sm) !important; // 🎨 更大的发送按钮（比其他按钮大）
        44: 23282px !important;
        44: 23315px !important;
        44: 2335var(--border-width-base) !important;
        border: none !important;
        background: var(--gradient-purple) !important; // 🎨 紫色渐变（更鲜艳）
        padding: 0 !important;
        margin: 0 !important;
        font-size: 0 !important;
        0: 23528;
        border-radius: var(--text-sm) !important;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        color: var(--bg-color) !important;
        box-shadow:
          0 var(--spacing-xs) var(--text-lg) var(--accent-marketing-heavy), // 🎨 紫色光晕
          0 2px var(--spacing-sm) var(--shadow-heavy),
          inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important; // 🎨 顶部内光
        position: relative !important;
        overflow: hidden !important;

        // 🎨 光泽扫过效果
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, var(--white-alpha-40), transparent);
          transition: left 0.6s ease;
        }

        &:hover:not(.disabled) {
          background: var(--gradient-purple-hover) !important; // 🎨 更亮的紫色渐变
          transform: translateY(-3px) scale(1.08) !important; // 🎨 更明显的上浮和放大
          box-shadow:
            0 var(--spacing-sm) 2var(--spacing-sm) var(--accent-marketing-heavy), // 🎨 更强的紫色光晕
            0 var(--spacing-xs) var(--text-sm) rgba(0, 0, 0, 0.25),
            inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;

          &::before {
            left: 100%; // 🎨 光泽扫过
          }

          :deep(.el-icon) {
            transform: scale(1.15) rotate(5deg) !important; // 🎨 图标放大+轻微旋转
          }
        }

        &:active:not(.disabled) {
          transform: translateY(-var(--border-width-base)) scale(1.02) !important; // 🎨 点击时轻微回弹
          box-shadow:
            0 var(--spacing-xs) var(--text-lg) var(--accent-marketing-heavy),
            0 2px var(--spacing-sm) var(--shadow-heavy),
            inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;
        }

        &.disabled:not(.stopping) {
          opacity: 0.4 !important;
          cursor: not-allowed !important;
          background: var(--gradient-glass) !important; // 🎨 禁用时半透明
          box-shadow: 0 2px var(--spacing-sm) var(--shadow-medium) !important;
          color: var(--white-alpha-40) !important;
          filter: grayscale(0.5);

          &:hover {
            transform: none !important;
          }
        }

        // 🔴 停止状态优先级最高 - 必须放在最后
        &.stopping {
          opacity: 1 !important; // 覆盖disabled的opacity
          cursor: pointer !important; // 覆盖disabled的cursor
          filter: none !important; // 覆盖disabled的filter
          background: linear-gradient(135deg, var(--danger-color) 0%, #dc2626 100%) !important; // 🔴 红色渐变
          box-shadow:
            0 var(--spacing-xs) var(--text-lg) rgba(239, 68, 68, 0.5), // 🔴 红色光晕
            0 2px var(--spacing-sm) var(--shadow-heavy),
            inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;
          color: var(--bg-color) !important; // 覆盖disabled的color

          &:hover {
            background: linear-gradient(135deg, var(--status-error) 0%, var(--danger-color) 100%) !important; // 🔴 悬停时更亮的红色
            box-shadow:
              0 var(--spacing-sm) 2var(--spacing-sm) rgba(239, 68, 68, 0.6),
              0 var(--spacing-xs) var(--text-sm) rgba(0, 0, 0, 0.25),
              inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;
            transform: translateY(-2px) scale(1.05) !important;
          }

          &:active {
            transform: translateY(0) scale(0.98) !important;
          }
        }

        .loading {
          animation: spin 1s linear infinite;
        }
      }

      /* 🎨 放大发送按钮图标 */
      .send-btn :deep(.el-icon) {
        font-size: var(--text-2xl) !important; // 🎨 更大的图标
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .send-btn :deep(.el-icon svg) {
        22: 27356px !important;
        22: 2738var(--spacing-sm) !important;
      }

    }
  }

  /* 语音按钮已并入右侧操作区 */
  .right-actions .voice-btn {
    36: 2748var(--spacing-sm) !important;
    36: 275var(--spacing-md) !important;
    36: 27545px !important;
    36: 27577px !important;
    border: 1.5px solid rgba(139, 92, 246, 0.35) !important; // 🎨 紫色半透明边框
    background: var(--gradient-glass) !important; // 🎨 玻璃态
    backdrop-filter: blur(10px) !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: var(--text-base) !important;
    10: 27833px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    color: rgba(255, 255, 255, 0.75) !important; // 🎨 白色半透明
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy), inset 0 var(--border-width-base) 0 var(--glass-bg-medium) !important;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--radial-ai), transparent 70%);
      opacity: 0;
      transform: scale(0.6);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }

    &:hover:not(.disabled) {
      background: var(--gradient-accent-hover) !important; // 🎨 紫色渐变
      border-color: rgba(167, 139, 250, 0.6) !important;
      color: var(--white-alpha-95) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px var(--text-2xl) var(--accent-marketing-heavy), inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;

      &::before {
        opacity: 1;
        transform: scale(1);
      }

      :deep(.el-icon) {
        transform: scale(1.15) !important;
      }
      border-color: var(--primary-color) !important;
      color: var(--primary-color) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--accent-enrollment-light) !important;
    }

    &.active {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.25) 100%) !important; // 🎨 蓝色半透明渐变
      border-color: rgba(59, 130, 246, 0.6) !important;
      color: var(--bg-color) !important;
      box-shadow:
        0 0 0 3px var(--accent-enrollment-medium),
        0 var(--spacing-xs) var(--text-lg) var(--accent-enrollment-heavy),
        inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important; // 🎨 蓝色光晕
    }

    &.disabled {
      opacity: 0.3;
      cursor: not-allowed;
      filter: grayscale(0.5);

      &:hover {
        background: var(--gradient-glass) !important;
        border-color: rgba(139, 92, 246, 0.35) !important;
        color: rgba(255, 255, 255, 0.75) !important;
        transform: none !important;
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy), inset 0 var(--border-width-base) 0 var(--glass-bg-medium) !important;
      }
    }
  }

  /* 🎨 语音按钮图标大小 */
  .right-actions .voice-btn :deep(.el-icon) {
    font-size: var(--text-xl) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .right-actions .voice-btn :deep(.el-icon svg) {
    width: var(--text-xl) !important;
    height: var(--text-xl) !important;
  }
  .voice-status .status-indicator :deep(.el-icon) {
    font-size: var(--text-xl) !important;
  }
  .voice-status .status-indicator :deep(.el-icon svg) {
    width: var(--text-xl) !important;
    height: var(--text-xl) !important;
  }


  .voice-status {
    margin-top: var(--spacing-xs); // 进一步减少顶部间距
    padding: var(--spacing-xs) var(--spacing-sm); // 进一步减少内边距
    background: #f9fafb;
    border-radius: var(--spacing-sm); // 减少圆角，让设计更紧凑
    border-3: 30982px solid var(--primary-color);

    .status-indicator {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-base); // 统一语音状态文字大小
      color: var(--text-secondary);

      .voice-wave {
        display: flex;
        2: 312var(--spacing-xl);

        span {
          3: 31352px;
          height: var(--text-sm);
          background: var(--primary-color);
          2: 31400px;
          animation: wave 1.5s ease-in-out infinite;

          &:nth-child(1) { animation-delay: 0s; }
          &:nth-child(2) { animation-delay: 0.1s; }
          &:nth-child(3) { animation-delay: 0.2s; }
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes wave {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}

// 暗色主题适配
.theme-dark .claude-input-container {
  .input-wrapper {
    background: transparent; // 🔧 暗黑主题下也设置为透明
    border-color: transparent; // 🔧 边框也透明

    &:hover {
      border-color: transparent; // 🔧 悬停时边框也透明
    }

    &:focus-within {
      border-color: transparent; // 🔧 聚焦时边框也透明
    }

    .left-actions .action-btn {
      color: var(--text-tertiary);

      &:hover {
        background: var(--color-gray-700);
        color: var(--border-color);
      }

      &.search-btn {
        background: var(--color-gray-700);
        border-color: var(--color-gray-600);

        &:hover {
          background: var(--color-gray-600);
        }
      }
    }

    .main-input :deep(.el-textarea) .el-textarea__inner {
      color: var(--white-alpha-90); // 🎨 白色文字
      background: var(--white-alpha-3); // 🎨 极浅背景

      &::placeholder {
        color: var(--white-alpha-40); // 🎨 白色半透明占位符
      }
    }

    .right-actions {

    }
  }

  .footer-row .chip {
    background: var(--color-gray-700);
    border-color: var(--color-gray-600);
    color: var(--border-color);

    &:hover:not(:disabled) {
      background: var(--color-gray-600);
    }

    &.active {
      background: var(--text-primary);
      border-color: var(--primary-color);
      color: var(--border-color);
    }
  }

  /* 🎨 暗黑主题下的样式已统一到玻璃态设计中，无需额外覆盖 */

  /* 暗色主题下的智能代理开关 */
  .footer-row .smart-agent-toggle {
    background: #2a4a75 !important;
  }

  .footer-row .smart-agent-toggle:hover:not(:disabled) {
    background: #3a5a85 !important;
  }

  .footer-row .smart-agent-toggle:disabled {
    background: var(--color-gray-600) !important;
  }

  .voice-status {
    background: var(--color-gray-700);
  }
}

/* ========================================
   🌞 明亮主题样式
   ======================================== */
[data-theme="light"],
.theme-light,
:root:not([data-theme="dark"]):not(.theme-dark) {
  .claude-input-container {
    .input-wrapper {
      background: linear-gradient(135deg, var(--white-alpha-95) 0%, rgba(248, 250, 252, 0.9) 100%); // 🎨 白色半透明渐变
      backdrop-filter: blur(var(--text-2xl)) saturate(180%);
      border: 1.5px solid var(--accent-marketing-medium); // 🎨 浅紫色边框
      box-shadow:
        0 var(--spacing-sm) var(--spacing-3xl) var(--black-alpha-8), // 🎨 轻柔的外阴影
        inset 0 var(--border-width-base) 0 var(--white-alpha-80), // 🎨 顶部内光
        inset 0 -var(--border-width-base) 0 var(--shadow-lighter); // 🎨 底部内阴影

      &:hover {
        border-color: rgba(139, 92, 246, 0.35);
        box-shadow:
          0 var(--text-sm) 40px rgba(139, 92, 246, 0.12),
          inset 0 var(--border-width-base) 0 var(--text-on-primary),
          inset 0 -var(--border-width-base) 0 var(--shadow-lighter);
      }

      &:focus-within {
        border-color: rgba(139, 92, 246, 0.5);
        box-shadow:
          0 var(--text-sm) 4var(--spacing-sm) rgba(139, 92, 246, 0.18),
          0 0 0 3px var(--accent-marketing-light),
          inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1),
          inset 0 -var(--border-width-base) 0 var(--shadow-lighter);
      }
    }

    /* 🎨 输入框文字 */
    .main-input :deep(.el-textarea) .el-textarea__inner {
      background: rgba(248, 250, 252, 0.5); // 🎨 极浅的灰色背景
      color: var(--text-primary-dark); // 🎨 深色文字
      caret-color: var(--accent-marketing); // 🎨 紫色光标

      &:focus {
        background: var(--white-alpha-80);
      }

      &::placeholder {
        color: rgba(100, 116, 139, 0.5); // 🎨 灰色占位符
      }
    }

    /* 🎨 左侧功能按钮 */
    .footer-row .icon-btn {
      border: 1.5px solid var(--accent-marketing-medium) !important;
      background: var(--gradient-light-glass) !important;
      backdrop-filter: blur(10px) !important;
      color: var(--dark-text-1) !important; // 🎨 灰蓝色图标
      box-shadow:
        0 2px var(--spacing-sm) var(--black-alpha-6),
        inset 0 var(--border-width-base) 0 var(--text-on-primary) !important;

      &::before {
        background: var(--radial-ai), transparent 70%);
      }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.08) 100%) !important;
        border-color: var(--accent-marketing) !important;
        color: var(--accent-marketing) !important; // 🎨 紫色图标
        box-shadow:
          0 6px var(--text-2xl) var(--accent-marketing-medium),
          inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1) !important;
      }

      :deep(.el-icon) {
        color: inherit;
      }
    }

    .footer-row .icon-btn.active {
      background: var(--gradient-purple) !important;
      border-color: var(--accent-marketing) !important;
      color: var(--accent-marketing) !important;
      box-shadow:
        0 0 0 3px var(--accent-marketing-light),
        0 var(--spacing-xs) var(--text-lg) var(--accent-marketing-medium),
        inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1) !important;
    }

    /* 🎨 字体大小按钮 */
    .footer-row .font-size-btn {
      border: 1.5px solid var(--accent-marketing-medium) !important;
      background: var(--gradient-light-glass) !important;
      backdrop-filter: blur(10px) !important;
      box-shadow:
        0 2px var(--spacing-sm) var(--black-alpha-6),
        inset 0 var(--border-width-base) 0 var(--text-on-primary) !important;

      .font-icon-small {
        color: var(--text-muted) !important;
      }

      .font-icon-large {
        color: var(--dark-text-1) !important;
      }

      &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.08) 100%) !important;
        border-color: rgba(139, 92, 246, 0.4) !important;
        box-shadow:
          0 6px var(--text-2xl) var(--accent-marketing-medium),
          inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1) !important;

        .font-icon-small,
        .font-icon-large {
          color: var(--accent-marketing) !important;
        }
      }
    }

    /* 🎨 语音按钮 */
    .right-actions .voice-btn {
      border: 1.5px solid var(--accent-marketing-medium) !important;
      background: var(--gradient-light-glass) !important;
      backdrop-filter: blur(10px) !important;
      color: var(--dark-text-1) !important;
      box-shadow:
        0 2px var(--spacing-sm) var(--black-alpha-6),
        inset 0 var(--border-width-base) 0 var(--text-on-primary) !important;

      &:hover:not(.disabled) {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.08) 100%) !important;
        border-color: rgba(139, 92, 246, 0.4) !important;
        color: var(--accent-marketing) !important;
        box-shadow:
          0 6px var(--text-2xl) var(--accent-marketing-medium),
          inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1) !important;
      }

      &.active {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.12) 100%) !important;
        border-color: rgba(59, 130, 246, 0.5) !important;
        color: var(--primary-color) !important;
        box-shadow:
          0 0 0 3px var(--accent-enrollment-light),
          0 var(--spacing-xs) var(--text-lg) var(--accent-enrollment-medium),
          inset 0 var(--border-width-base) 0 rgba(255, 255, 255, 1) !important;
      }
    }

    /* 🎨 发送按钮 - 明亮主题下更鲜艳 */
    .right-actions .send-btn {
      background: var(--gradient-purple) !important;
      box-shadow:
        0 var(--spacing-xs) var(--text-lg) var(--accent-marketing-heavy),
        0 2px var(--spacing-sm) var(--shadow-light),
        inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;

      &:hover:not(.disabled):not(.stopping) {
        background: var(--gradient-purple-hover) !important;
        box-shadow:
          0 var(--spacing-sm) 2var(--spacing-sm) var(--accent-marketing-heavy),
          0 var(--spacing-xs) var(--text-sm) var(--shadow-medium),
          inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;
      }

      /* 🔴 停止状态 - 明亮主题下的红色按钮 */
      &.stopping {
        background: linear-gradient(135deg, var(--danger-color) 0%, #dc2626 100%) !important;
        box-shadow:
          0 var(--spacing-xs) var(--text-lg) rgba(239, 68, 68, 0.5),
          0 2px var(--spacing-sm) var(--shadow-medium),
          inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;
        cursor: pointer !important;

        &:hover {
          background: linear-gradient(135deg, var(--status-error) 0%, var(--danger-color) 100%) !important;
          box-shadow:
            0 var(--spacing-sm) 2var(--spacing-sm) rgba(239, 68, 68, 0.6),
            0 var(--spacing-xs) var(--text-sm) var(--shadow-heavy),
            inset 0 var(--border-width-base) 0 var(--glass-bg-heavy) !important;
          transform: translateY(-2px) scale(1.05) !important;
        }

        &:active {
          transform: translateY(0) scale(0.98) !important;
        }
      }

      &.disabled {
        background: linear-gradient(135deg, #e2e8f0 0%, var(--dark-border) 100%) !important;
        box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-8) !important;
        color: var(--text-muted) !important;
      }
    }
  }
}
</style>
