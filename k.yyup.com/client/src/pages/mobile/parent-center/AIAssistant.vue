<template>
  <MobileMainLayout
    title="AI智能助手"
    :show-back="true"
    :show-footer="false"
    content-padding="0"
  >
    <div class="mobile-ai-assistant">
      <!-- AI助手特性介绍 -->
      <div class="ai-features">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="feature in aiFeatures"
            :key="feature.type"
            @click="startFeatureChat(feature.type)"
          >
            <div class="feature-card" :class="`feature-${feature.type}`">
              <div class="feature-icon">
                <van-icon :name="feature.icon" :color="feature.color" size="24" />
              </div>
              <div class="feature-content">
                <h4>{{ feature.title }}</h4>
                <p>{{ feature.description }}</p>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 对话区域 -->
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            :class="{ 'message-user': message.type === 'user', 'message-ai': message.type === 'ai' }"
          >
            <div class="message-avatar">
              <van-image
                v-if="message.type === 'user'"
                :src="userAvatar"
                width="40"
                height="40"
                round
                fit="cover"
              >
                <template #error>
                  <van-icon name="user-o" size="20" />
                </template>
              </van-image>
              <div v-else class="ai-avatar">
                <UnifiedIcon name="robot" class="ai-icon" />
              </div>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div v-if="message.type === 'text'" class="text-content">
                  {{ message.content }}
                </div>
                <div v-else-if="message.type === 'rich'" class="rich-content">
                  <div v-html="message.content"></div>
                </div>
                <div v-else-if="message.type === 'suggestions'" class="suggestions-content">
                  <div class="suggestions-list">
                    <div
                      v-for="suggestion in message.suggestions"
                      :key="suggestion.id"
                      class="suggestion-item"
                      @click="applySuggestion(suggestion)"
                    >
                      <div class="suggestion-icon">
                        <van-icon :name="suggestion.icon" size="16" />
                      </div>
                      <div class="suggestion-text">
                        <h5>{{ suggestion.title }}</h5>
                        <p>{{ suggestion.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- AI思考状态 -->
          <div v-if="isThinking" class="thinking-indicator">
            <div class="thinking-avatar">
              <div class="ai-avatar">
                <UnifiedIcon name="robot" class="ai-icon" />
              </div>
            </div>
            <div class="thinking-content">
              <div class="thinking-bubble">
                <div class="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="thinking-text">{{ thinkingText }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-wrapper">
          <van-field
            v-model="inputMessage"
            type="textarea"
            :autosize="{ minHeight: 40, maxHeight: 120 }"
            placeholder="请输入您的问题..."
            :disabled="isThinking"
            @keypress.enter.exact.prevent="sendMessage"
            @keypress.enter.shift.exact="inputMessage += '\n'"
          />
          <div class="input-actions">
            <!-- 图片上传 - 隐藏的上传组件，通过按钮触发 -->
            <van-uploader
              v-show="false"
              ref="uploaderRef"
              v-model="uploadedImages"
              :after-read="handleImageUpload"
              :max-count="1"
              accept="image/*"
              :max-size="5 * 1024 * 1024"
              @oversize="handleImageOversize"
            />
            <van-button
              icon="photograph"
              size="small"
              type="default"
              :disabled="isThinking"
              @click="triggerUpload"
            />
            <van-button
              icon="voice-o"
              size="small"
              type="default"
              @click="handleVoiceInput"
            />
            <van-button
              icon="send"
              size="small"
              type="primary"
              :loading="isThinking"
              :disabled="!inputMessage.trim() && uploadedImages.length === 0"
              @click="sendMessage"
            />
          </div>

          <!-- 上传的图片预览 -->
          <div v-if="uploadedImages.length > 0" class="uploaded-images">
            <div
              v-for="(image, index) in uploadedImages"
              :key="index"
              class="image-preview-item"
            >
              <img :src="image.url || image.content" alt="上传的图片" />
              <van-icon
                name="clear"
                class="remove-icon"
                @click="removeUploadedImage(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <van-button
          v-for="action in quickActions"
          :key="action.text"
          plain
          size="small"
          type="primary"
          @click="inputMessage = action.text"
        >
          {{ action.text }}
        </van-button>
      </div>

      <!-- 设置弹窗 -->
      <van-popup
        v-model:show="showSettings"
        position="bottom"
        :style="{ height: '60%' }"
        round
      >
        <div class="settings-popup">
          <div class="popup-header">
            <h3>AI助手设置</h3>
            <van-button
              icon="cross"
              size="small"
              type="default"
              @click="showSettings = false"
            />
          </div>
          <div class="settings-content">
            <van-cell-group inset>
              <van-cell title="回复速度" is-link @click="showSpeedPicker = true" :value="replySpeed" />
              <van-cell title="回复风格" is-link @click="showStylePicker = true" :value="replyStyle" />
              <van-cell title="语音播报">
                <template #right-icon>
                  <van-switch v-model="voiceEnabled" />
                </template>
              </van-cell>
              <van-cell title="智能提醒">
                <template #right-icon>
                  <van-switch v-model="smartReminder" />
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </div>
      </van-popup>

      <!-- 速度选择器 -->
      <van-popup v-model:show="showSpeedPicker" position="bottom">
        <van-picker
          :columns="speedColumns"
          @confirm="onSpeedConfirm"
          @cancel="showSpeedPicker = false"
        />
      </van-popup>

      <!-- 风格选择器 -->
      <van-popup v-model:show="showStylePicker" position="bottom">
        <van-picker
          :columns="styleColumns"
          @confirm="onStyleConfirm"
          @cancel="showStylePicker = false"
        />
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { showToast, showImagePreview } from 'vant'
import { CallingLogger, type LogContext } from '@/utils/CallingLogger'

interface Message {
  id: string
  type: 'user' | 'ai' | 'text' | 'rich' | 'suggestions'
  content: string
  timestamp: Date
  suggestions?: Array<{
    id: string
    title: string
    description: string
    icon: string
    action?: string
  }>
}

interface AIFeature {
  type: string
  icon: string
  title: string
  description: string
  color: string
}

// 创建日志上下文
const createLogContext = (operation?: string, additionalContext?: any): LogContext => {
  return CallingLogger.createComponentContext('MobileAIAssistant', {
    operation,
    ...additionalContext
  })
}

// 响应式数据
const messages = ref<Message[]>([])
const inputMessage = ref('')
const isThinking = ref(false)
const thinkingText = ref('AI正在思考中...')
const userAvatar = ref('/images/default-avatar.png')
const chatMessagesRef = ref<HTMLElement>()

// 图片上传相关
const uploaderRef = ref()
const uploadedImages = ref<any[]>([])

// 设置相关
const showSettings = ref(false)
const replySpeed = ref('标准')
const replyStyle = ref('友好')
const voiceEnabled = ref(false)
const smartReminder = ref(true)
const showSpeedPicker = ref(false)
const showStylePicker = ref(false)

// AI功能特性
const aiFeatures: AIFeature[] = [
  {
    type: 'qa',
    icon: 'chat-o',
    title: '智能问答',
    description: '教育咨询、育儿建议',
    color: '#409EFF'
  },
  {
    type: 'analysis',
    icon: 'chart-trending-o',
    title: '成长分析',
    description: '智能分析成长数据',
    color: '#67C23A'
  },
  {
    type: 'learning',
    icon: 'book-o',
    title: '学习建议',
    description: '个性化学习方案',
    color: '#E6A23C'
  },
  {
    type: 'activity',
    icon: 'calendar-o',
    title: '活动推荐',
    description: '亲子活动推荐',
    color: '#F56C6C'
  },
  {
    type: 'health',
    icon: 'heart-o',
    title: '健康管理',
    description: '营养建议、健康提醒',
    color: '#FF6B6B'
  },
  {
    type: 'emotion',
    icon: 'smile-o',
    title: '情感支持',
    description: '家庭关系建议',
    color: '#4ECDC4'
  }
]

// 快捷操作
const quickActions = [
  { text: '孩子不爱吃饭怎么办？' },
  { text: '如何培养孩子阅读习惯？' },
  { text: '孩子注意力不集中怎么办？' }
]

// 选择器选项
const speedColumns = ['快速', '标准', '详细']
const styleColumns = ['友好', '专业', '幽默', '温柔']

// 方法
const startFeatureChat = (featureType: string) => {
  const context = createLogContext('startFeatureChat', { featureType })
  const feature = aiFeatures.find(f => f.type === featureType)
  if (feature) {
    inputMessage.value = `我想了解${feature.title}`
    CallingLogger.logInfo(context, '启动AI功能对话', { featureType, featureTitle: feature.title })
    sendMessage()
  } else {
    CallingLogger.logWarn(context, '未找到指定AI功能', { featureType })
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isThinking.value) return

  const context = createLogContext('sendMessage', { messageLength: inputMessage.value.trim().length })

  const userMessage: Message = {
    id: Date.now().toString(),
    type: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const messageContent = inputMessage.value
  inputMessage.value = ''

  CallingLogger.logInfo(context, '用户发送消息', { messageContent })

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 开始AI回复
  isThinking.value = true
  thinkingText.value = 'AI正在思考中...'

  try {
    CallingLogger.logInfo(context, '开始AI回复处理', { messageContent })

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageContent)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }
      messages.value.push(aiMessage)
      isThinking.value = false
      scrollToBottom()

      CallingLogger.logSuccess(context, 'AI回复完成', { responseLength: aiResponse.length })
    }, 2000)
  } catch (error) {
    CallingLogger.logError(context, 'AI回复失败', error as Error, { messageContent })
    showToast('AI回复失败，请重试')
    isThinking.value = false
  }
}

const generateAIResponse = (userInput: string): string => {
  // 简单的回复生成逻辑
  if (userInput.includes('吃饭') || userInput.includes('饮食')) {
    return '关于孩子吃饭问题，我建议：\n1. 营造愉快的用餐氛围\n2. 控制零食摄入\n3. 让孩子参与食物制作\n4. 保持规律的用餐时间\n5. 不要强迫喂食'
  } else if (userInput.includes('阅读') || userInput.includes('学习')) {
    return '培养孩子阅读习惯的方法：\n1. 从小开始亲子阅读\n2. 选择适合年龄的书籍\n3. 建立固定的阅读时间\n4. 以身作则，多阅读\n5. 让孩子自己选择喜欢的书'
  } else if (userInput.includes('注意力')) {
    return '提高孩子注意力的建议：\n1. 减少干扰因素\n2. 分解任务，短时间专注\n3. 适当的体育锻炼\n4. 充足的睡眠\n5. 营养均衡的饮食'
  } else {
    return '感谢您的提问！作为AI育儿助手，我会尽力为您提供专业的建议。请告诉我更多具体问题，我会给出更针对性的回答。'
  }
}

const applySuggestion = (suggestion: any) => {
  const context = createLogContext('applySuggestion', { suggestionId: suggestion.id, title: suggestion.title })

  if (suggestion.action) {
    CallingLogger.logInfo(context, '应用AI建议', { suggestion })
    // 处理建议操作
    showToast(`执行操作: ${suggestion.title}`)
    CallingLogger.logSuccess(context, 'AI建议执行成功', { suggestion })
  } else {
    CallingLogger.logWarn(context, 'AI建议缺少操作', { suggestion })
  }
}

const formatTime = (timestamp: Date): string => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

const handleImageUpload = (file: any) => {
  const context = createLogContext('handleImageUpload', {
    fileName: file.file?.name || 'unknown',
    fileSize: file.file?.size || 0
  })

  CallingLogger.logInfo(context, '用户上传图片', {
    fileName: file.file?.name,
    fileSize: file.file?.size
  })

  // 文件已经在 uploadedImages 中，这里可以做额外的处理
  showToast('图片已选择，可以发送了')
  CallingLogger.logSuccess(context, '图片选择成功')
}

// 触发上传器
const triggerUpload = () => {
  const context = createLogContext('triggerUpload')
  CallingLogger.logInfo(context, '用户点击图片上传按钮')
  uploaderRef.value?.chooseFile()
}

// 处理图片过大
const handleImageOversize = () => {
  const context = createLogContext('handleImageOversize')
  CallingLogger.logWarn(context, '上传的图片超过大小限制')
  showToast('图片大小不能超过5MB')
}

// 移除上传的图片
const removeUploadedImage = (index: number) => {
  const context = createLogContext('removeUploadedImage', { index })
  CallingLogger.logInfo(context, '用户移除上传的图片', { index })
  uploadedImages.value.splice(index, 1)
  CallingLogger.logSuccess(context, '图片移除成功')
}

const handleVoiceInput = () => {
  const context = createLogContext('handleVoiceInput')
  CallingLogger.logInfo(context, '用户尝试语音输入功能')
  showToast('语音输入功能开发中')
}

const clearChatHistory = () => {
  const context = createLogContext('clearChatHistory', { messageCount: messages.value.length })
  CallingLogger.logInfo(context, '用户清空对话记录', { messageCount: messages.value.length })
  messages.value = []
  showToast('对话已清空')
  CallingLogger.logSuccess(context, '对话记录清空成功')
}

const onSpeedConfirm = (value: string) => {
  const context = createLogContext('onSpeedConfirm', { speed: value })
  CallingLogger.logInfo(context, '用户设置回复速度', { speed: value })
  replySpeed.value = value
  showSpeedPicker.value = false
  showToast(`回复速度已设置为: ${value}`)
  CallingLogger.logSuccess(context, '回复速度设置成功', { speed: value })
}

const onStyleConfirm = (value: string) => {
  const context = createLogContext('onStyleConfirm', { style: value })
  CallingLogger.logInfo(context, '用户设置回复风格', { style: value })
  replyStyle.value = value
  showStylePicker.value = false
  showToast(`回复风格已设置为: ${value}`)
  CallingLogger.logSuccess(context, '回复风格设置成功', { style: value })
}

// 生命周期
onMounted(() => {
  const context = createLogContext('onMounted')
  CallingLogger.logInfo(context, '移动端AI助手页面挂载完成')

  // 添加欢迎消息
  const welcomeMessage: Message = {
    id: 'welcome',
    type: 'ai',
    content: '您好！我是AI育儿助手，很高兴为您服务。我可以为您提供教育咨询、育儿建议、成长分析等帮助。请问有什么可以帮您的吗？',
    timestamp: new Date()
  }
  messages.value.push(welcomeMessage)

  CallingLogger.logSuccess(context, '移动端AI助手初始化完成', {
    aiFeaturesCount: aiFeatures.length,
    quickActionsCount: quickActions.length
  })
})
</script>

<style lang="scss" scoped>
.mobile-ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--van-background-color-light);

  .ai-features {
    padding: var(--van-padding-md);
    background: white;
    border-bottom: 1px solid var(--van-border-color);

    .feature-card {
      background: var(--van-background-color-light);
      border-radius: var(--van-border-radius-lg);
      padding: var(--van-padding-md);
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:active {
        transform: scale(0.95);
      }

      .feature-icon {
        margin-bottom: var(--van-padding-sm);
      }

      .feature-content {
        h4 {
          font-size: var(--van-font-size-md);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-text-color);
          margin: 0 0 4px 0;
        }

        p {
          font-size: var(--van-font-size-xs);
          color: var(--van-text-color-2);
          margin: 0;
          line-height: 1.3;
        }
      }
    }
  }

  .chat-container {
    flex: 1;
    overflow: hidden;

    .chat-messages {
      height: 100%;
      padding: var(--van-padding-md);
      overflow-y: auto;
      scroll-behavior: smooth;

      .message-item {
        display: flex;
        margin-bottom: var(--van-padding-md);

        &.message-user {
          flex-direction: row-reverse;

          .message-content {
            align-items: flex-end;
            margin-right: var(--van-padding-sm);

            .message-bubble {
              background: var(--van-primary-color);
              color: white;
            }
          }
        }

        &.message-ai {
          .message-content {
            align-items: flex-start;
            margin-left: var(--van-padding-sm);

            .message-bubble {
              background: var(--van-background-color-dark);
            }
          }
        }

        .message-avatar {
          .ai-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;

            .ai-icon {
              font-size: var(--text-xl);
            }
          }
        }

        .message-content {
          display: flex;
          flex-direction: column;
          max-width: 70%;

          .message-bubble {
            padding: var(--van-padding-sm);
            border-radius: var(--van-border-radius-lg);
            word-wrap: break-word;
            line-height: 1.4;

            .text-content {
              font-size: var(--van-font-size-sm);
            }

            .rich-content {
              font-size: var(--van-font-size-sm);
            }

            .suggestions-content {
              .suggestions-list {
                .suggestion-item {
                  display: flex;
                  align-items: center;
                  padding: var(--van-padding-xs);
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: var(--van-border-radius-md);
                  margin-bottom: var(--van-padding-xs);

                  &:last-child {
                    margin-bottom: 0;
                  }

                  .suggestion-icon {
                    margin-right: var(--van-padding-xs);
                  }

                  .suggestion-text {
                    flex: 1;

                    h5 {
                      margin: 0 0 2px 0;
                      font-size: var(--van-font-size-sm);
                      font-weight: var(--van-font-weight-bold);
                    }

                    p {
                      margin: 0;
                      font-size: var(--van-font-size-xs);
                      opacity: 0.8;
                    }
                  }
                }
              }
            }
          }

          .message-time {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-3);
            margin-top: 4px;
          }
        }
      }

      .thinking-indicator {
        display: flex;
        margin-bottom: var(--van-padding-md);

        .thinking-content {
          margin-left: var(--van-padding-sm);

          .thinking-bubble {
            padding: var(--van-padding-sm);
            background: var(--van-background-color-dark);
            border-radius: var(--van-border-radius-lg);

            .thinking-dots {
              display: flex;
              gap: var(--spacing-xs);
              margin-bottom: 8px;

              span {
                width: 6px;
                height: 6px;
                background: var(--van-text-color-3);
                border-radius: 50%;
                animation: thinking 1.4s infinite ease-in-out;

                &:nth-child(1) { animation-delay: -0.32s; }
                &:nth-child(2) { animation-delay: -0.16s; }
              }
            }

            .thinking-text {
              font-size: var(--van-font-size-xs);
              color: var(--van-text-color-2);
            }
          }
        }
      }
    }
  }

  .input-container {
    background: white;
    border-top: 1px solid var(--van-border-color);
    padding: var(--van-padding-sm);

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: var(--van-padding-xs);

      .van-field {
        flex: 1;
      }

      .input-actions {
        display: flex;
        gap: var(--van-padding-xs);
      }

      .uploaded-images {
        display: flex;
        gap: var(--van-padding-xs);
        padding: var(--van-padding-xs) 0;
        overflow-x: auto;

        .image-preview-item {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: var(--van-border-radius-md);
            border: 1px solid var(--van-border-color);
          }

          .remove-icon {
            position: absolute;
            top: -6px;
            right: -6px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            border-radius: 50%;
            padding: var(--spacing-xs);
            font-size: var(--text-xs);
            cursor: pointer;
            z-index: 1;
          }
        }
      }
    }
  }

  .quick-actions {
    background: white;
    border-top: 1px solid var(--van-border-color);
    padding: var(--van-padding-sm);
    display: flex;
    gap: var(--van-padding-xs);
    overflow-x: auto;
    white-space: nowrap;

    .van-button {
      flex-shrink: 0;
    }
  }

  .settings-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--van-padding-md);
      border-bottom: 1px solid var(--van-border-color);

      h3 {
        margin: 0;
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
      }
    }

    .settings-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--van-padding-sm);
    }
  }
}

@keyframes thinking {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>