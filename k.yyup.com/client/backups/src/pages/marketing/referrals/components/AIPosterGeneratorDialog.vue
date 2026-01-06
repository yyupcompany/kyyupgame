<template>
  <el-dialog
    v-model="visible"
    title="AI智能推广海报生成器"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="ai-poster-generator-dialog"
  >
    <div class="generator-content" v-loading="loading">
      <!-- AI对话区域 -->
      <div class="ai-chat-section">
        <div class="chat-header">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI助手 - 推广海报设计师</span>
        </div>
        
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="message"
            :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
          >
            <div class="message-avatar">
              <el-avatar v-if="message.role === 'user'" :size="32">{{ userStore.user?.name?.charAt(0) || 'U' }}</el-avatar>
              <el-icon v-else size="32" class="ai-avatar"><MagicStick /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div v-if="message.posterData" class="message-poster-preview">
                <img :src="message.posterData.preview" alt="海报预览" />
                <el-button size="small" type="primary" @click="applyPosterDesign(message.posterData)">
                  应用此设计
                </el-button>
              </div>
            </div>
          </div>
          
          <div v-if="isAITyping" class="message ai-message">
            <div class="message-avatar">
              <el-icon size="32" class="ai-avatar"><MagicStick /></el-icon>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="描述您想要的推广海报风格，例如：我想要一个温馨的亲子活动海报，主色调是蓝色，包含孩子们玩耍的场景..."
            @keydown.ctrl.enter="sendMessage"
          />
          <div class="input-actions">
            <div class="quick-prompts">
              <el-tag
                v-for="prompt in quickPrompts"
                :key="prompt"
                @click="selectQuickPrompt(prompt)"
                class="quick-prompt"
                effect="plain"
              >
                {{ prompt }}
              </el-tag>
            </div>
            <el-button type="primary" @click="sendMessage" :loading="isAITyping">
              <el-icon><Promotion /></el-icon>
              发送 (Ctrl+Enter)
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 海报预览和编辑区域 -->
      <div class="poster-preview-section">
        <div class="preview-header">
          <h3>海报预览</h3>
          <div class="preview-actions">
            <el-button @click="regeneratePoster" :loading="generatingPoster">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
            <el-button type="primary" @click="downloadPoster" :disabled="!currentPoster">
              <el-icon><Download /></el-icon>
              下载海报
            </el-button>
          </div>
        </div>
        
        <div class="poster-container">
          <div v-if="currentPoster" class="poster-preview">
            <!-- 集成可拖拽缩放二维码组件 -->
            <DraggableResizableQR
              :poster-content="currentPoster"
              :qrcode-url="qrcodeUrl"
              :share-url="shareUrl"
              @poster-updated="handlePosterUpdated"
            />
          </div>
          <div v-else class="poster-placeholder">
            <el-icon size="64"><Picture /></el-icon>
            <p>与AI对话生成您的专属推广海报</p>
            <div class="starter-suggestions">
              <h4>试试这些开场白：</h4>
              <ul>
                <li>"我想要一个温馨的亲子活动海报"</li>
                <li>"帮我设计一个专业的招生海报"</li>
                <li>"创建一个活泼可爱的幼儿园宣传海报"</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 海报参数调整 -->
        <div v-if="currentPoster" class="poster-controls">
          <el-collapse v-model="activeControls">
            <el-collapse-item title="海报参数调整" name="controls">
              <el-form :model="posterParams" label-width="100px" size="small">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="主色调">
                      <el-color-picker v-model="posterParams.primaryColor" @change="updatePosterStyle" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="字体大小">
                      <el-slider v-model="posterParams.fontSize" :min="12" :max="24" @change="updatePosterStyle" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="海报风格">
                      <el-select v-model="posterParams.style" @change="updatePosterStyle">
                        <el-option label="温馨" value="warm" />
                        <el-option label="专业" value="professional" />
                        <el-option label="活泼" value="playful" />
                        <el-option label="简约" value="minimal" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="savePoster" :disabled="!currentPoster">
          保存海报
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound, MagicStick, Promotion, Refresh, Download, Picture
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import DraggableResizableQR from '@/components/preview/DraggableResizableQR.vue'
import request from '@/utils/request'

interface Props {
  modelValue: boolean
  referralCode?: string
  activityData?: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'poster-generated', poster: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()

// 基础状态
const loading = ref(false)
const isAITyping = ref(false)
const generatingPoster = ref(false)
const userInput = ref('')
const chatMessagesRef = ref<HTMLElement>()
const activeControls = ref(['controls'])

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// AI对话消息
const chatMessages = ref<any[]>([
  {
    role: 'assistant',
    content: '您好！我是AI推广海报设计师。我可以帮您创建专业的推广海报。请告诉我您想要什么样的海报风格？比如：温馨的亲子风格、专业的商务风格，或者活泼的卡通风格？'
  }
])

// 快捷提示词
const quickPrompts = [
  '温馨亲子风格',
  '专业商务风格', 
  '活泼卡通风格',
  '简约现代风格',
  '节日庆典风格'
]

// 当前海报数据
const currentPoster = ref<any>(null)
const qrcodeUrl = ref('')
const shareUrl = ref('')

// 海报参数
const posterParams = reactive({
  primaryColor: 'var(--primary-color)',
  fontSize: 16,
  style: 'warm'
})

// 方法
const sendMessage = async () => {
  if (!userInput.value.trim()) return
  
  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: userInput.value
  })
  
  const userMessage = userInput.value
  userInput.value = ''
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 显示AI正在输入
  isAITyping.value = true
  
  try {
    // 调用AI生成海报
    const response = await generateAIPoster(userMessage)
    
    // 添加AI回复
    chatMessages.value.push({
      role: 'assistant',
      content: response.message,
      posterData: response.posterData
    })
    
    // 如果生成了海报，自动应用
    if (response.posterData) {
      await applyPosterDesign(response.posterData)
    }
    
  } catch (error: any) {
    chatMessages.value.push({
      role: 'assistant',
      content: '抱歉，生成海报时出现了问题。请重新描述您的需求，我会尽力帮您创建满意的海报。'
    })
    ElMessage.error(error.message || 'AI生成失败')
  } finally {
    isAITyping.value = false
    await nextTick()
    scrollToBottom()
  }
}

const generateAIPoster = async (prompt: string) => {
  // 构建AI请求
  const aiPrompt = `
用户需求: ${prompt}
活动信息: ${props.activityData ? JSON.stringify(props.activityData) : '通用推广'}
推广码: ${props.referralCode || ''}

请根据用户需求生成一个推广海报设计方案，包括：
1. 海报的整体风格和色彩搭配
2. 文字内容和排版建议
3. 图片元素和布局
4. 二维码的最佳位置

请用友好的语气回复用户，说明设计思路。
`

  const response = await request.post('/ai/generate-poster', {
    prompt: aiPrompt,
    activityData: props.activityData,
    referralCode: props.referralCode,
    style: posterParams.style
  })

  return {
    message: response.data.message,
    posterData: response.data.posterData
  }
}

const selectQuickPrompt = (prompt: string) => {
  userInput.value = `我想要${prompt}的推广海报`
}

const applyPosterDesign = async (posterData: any) => {
  try {
    generatingPoster.value = true
    
    // 应用海报设计
    currentPoster.value = posterData
    
    // 生成二维码URL
    if (props.referralCode) {
      qrcodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/register?ref=${props.referralCode}`)}`
      shareUrl.value = `${window.location.origin}/register?ref=${props.referralCode}`
    }
    
    ElMessage.success('海报设计已应用！')
  } catch (error) {
    ElMessage.error('应用海报设计失败')
  } finally {
    generatingPoster.value = false
  }
}

const handlePosterUpdated = (updatedPoster: any) => {
  currentPoster.value = updatedPoster
}

const updatePosterStyle = () => {
  if (!currentPoster.value) return
  
  // 更新海报样式参数
  currentPoster.value.style = {
    ...currentPoster.value.style,
    primaryColor: posterParams.primaryColor,
    fontSize: posterParams.fontSize,
    styleType: posterParams.style
  }
}

const regeneratePoster = async () => {
  if (chatMessages.value.length < 2) return
  
  // 获取最后一个用户消息
  const lastUserMessage = [...chatMessages.value].reverse().find(msg => msg.role === 'user')
  if (lastUserMessage) {
    userInput.value = lastUserMessage.content
    await sendMessage()
  }
}

const downloadPoster = () => {
  if (!currentPoster.value) return
  
  // 触发海报下载
  const link = document.createElement('a')
  link.download = `推广海报_${props.referralCode || Date.now()}.png`
  link.href = currentPoster.value.imageUrl || currentPoster.value.preview
  link.click()
  
  ElMessage.success('海报下载成功！')
}

const savePoster = () => {
  if (!currentPoster.value) return
  
  emit('poster-generated', {
    ...currentPoster.value,
    referralCode: props.referralCode,
    qrcodeUrl: qrcodeUrl.value,
    shareUrl: shareUrl.value
  })
  
  ElMessage.success('海报已保存！')
  handleClose()
}

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

const formatMessage = (content: string) => {
  // 简单的markdown格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const handleClose = () => {
  // 重置状态
  chatMessages.value = [
    {
      role: 'assistant',
      content: '您好！我是AI推广海报设计师。我可以帮您创建专业的推广海报。请告诉我您想要什么样的海报风格？'
    }
  ]
  userInput.value = ''
  currentPoster.value = null
  qrcodeUrl.value = ''
  shareUrl.value = ''
  
  visible.value = false
}

// 初始化
onMounted(() => {
  if (props.referralCode) {
    qrcodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/register?ref=${props.referralCode}`)}`
    shareUrl.value = `${window.location.origin}/register?ref=${props.referralCode}`
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.ai-poster-generator-dialog {
  .generator-content {
    display: flex;
    gap: var(--spacing-xl);
    min-height: 600px;
  }
  
  .ai-chat-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: var(--border-width-base) solid var(--color-border-light);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    
    .chat-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--color-primary);
      color: white;
      font-weight: 600;
    }
    
    .chat-messages {
      flex: 1;
      padding: var(--spacing-md);
      overflow-y: auto;
      max-height: 400px;
      
      .message {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
        
        &.user-message {
          flex-direction: row-reverse;
          
          .message-content {
            background: var(--color-primary-light);
            border-radius: var(--border-radius-md) var(--border-radius-md) var(--border-radius-sm) var(--border-radius-md);
          }
        }
        
        &.ai-message {
          .message-content {
            background: var(--color-bg-soft);
            border-radius: var(--border-radius-md) var(--border-radius-md) var(--border-radius-md) var(--border-radius-sm);
          }
        }
        
        .message-avatar {
          flex-shrink: 0;
          
          .ai-avatar {
            color: var(--color-primary);
          }
        }
        
        .message-content {
          flex: 1;
          padding: var(--spacing-md);
          
          .message-text {
            line-height: 1.6;
            color: var(--color-text-primary);
          }
          
          .message-poster-preview {
            margin-top: var(--spacing-md);
            text-align: center;
            
            img {
              max-width: 200px;
              border-radius: var(--border-radius-md);
              margin-bottom: var(--spacing-sm);
            }
          }
        }
      }
      
      .typing-indicator {
        display: flex;
        gap: var(--spacing-xs);
        
        span {
          width: var(--spacing-sm);
          height: var(--spacing-sm);
          border-radius: var(--radius-full);
          background: var(--color-text-secondary);
          animation: typing 1.4s infinite ease-in-out;
          
          &:nth-child(1) { animation-delay: -0.32s; }
          &:nth-child(2) { animation-delay: -0.16s; }
        }
      }
    }
    
    .chat-input {
      border-top: var(--border-width-base) solid var(--color-border-light);
      padding: var(--spacing-md);
      
      .input-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--spacing-sm);
        
        .quick-prompts {
          display: flex;
          gap: var(--spacing-xs);
          flex-wrap: wrap;
          
          .quick-prompt {
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              background: var(--color-primary-light);
              border-color: var(--color-primary);
            }
          }
        }
      }
    }
  }
  
  .poster-preview-section {
    flex: 1;
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
      
      h3 {
        margin: 0;
        color: var(--color-text-primary);
      }
      
      .preview-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
    
    .poster-container {
      border: var(--border-width-base) solid var(--color-border-light);
      border-radius: var(--border-radius-lg);
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .poster-preview {
        width: 100%;
        height: 100%;
      }
      
      .poster-placeholder {
        text-align: center;
        color: var(--color-text-secondary);
        padding: var(--spacing-xl);
        
        .starter-suggestions {
          margin-top: var(--spacing-lg);
          text-align: left;
          
          h4 {
            color: var(--color-text-primary);
            margin-bottom: var(--spacing-sm);
          }
          
          ul {
            list-style: none;
            padding: 0;
            
            li {
              padding: var(--spacing-xs) 0;
              color: var(--color-text-secondary);
              font-style: italic;
              
              &:before {
                content: '"';
                color: var(--color-primary);
              }
              
              &:after {
                content: '"';
                color: var(--color-primary);
              }
            }
          }
        }
      }
    }
    
    .poster-controls {
      margin-top: var(--spacing-lg);
    }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-lg)) {
  .ai-poster-generator-dialog {
    .generator-content {
      flex-direction: column;
    }
    
    .ai-chat-section {
      .chat-messages {
        max-height: 300px;
      }
    }
  }
}
</style>
