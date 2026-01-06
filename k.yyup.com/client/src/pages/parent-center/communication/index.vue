<template>
  <div class="parent-communication">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">家校沟通</h1>
        <p class="page-subtitle">与老师保持密切联系，了解孩子的在校情况</p>
      </div>
    </div>

    <!-- 沟通主界面 -->
    <div class="communication-main">
      <!-- 左侧老师列表 -->
      <div class="teacher-sidebar">
        <div class="sidebar-header">
          <h3>老师列表</h3>
          <el-badge :value="unreadCount" class="unread-badge">
            <el-icon><Bell /></el-icon>
          </el-badge>
        </div>

        <div class="teacher-list">
          <div
            v-for="teacher in teachers"
            :key="teacher.id"
            :class="['teacher-item', { active: selectedTeacher?.id === teacher.id }]"
            @click="selectTeacher(teacher)"
          >
            <div class="teacher-avatar">
              <el-avatar :size="40" :src="teacher.avatar">{{ teacher.name[0] }}</el-avatar>
              <div v-if="teacher.online" class="online-indicator"></div>
            </div>
            <div class="teacher-info">
              <div class="teacher-name">{{ teacher.name }}</div>
              <div class="teacher-title">{{ teacher.title }}</div>
              <div class="last-message">{{ teacher.lastMessage }}</div>
            </div>
            <div class="teacher-meta">
              <div class="message-time">{{ formatTime(teacher.lastMessageTime) }}</div>
              <el-badge v-if="teacher.unreadCount" :value="teacher.unreadCount" type="danger" />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天界面 -->
      <div class="chat-area" v-if="selectedTeacher">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="teacher-info">
            <el-avatar :size="36" :src="selectedTeacher.avatar">{{ selectedTeacher.name[0] }}</el-avatar>
            <div class="teacher-details">
              <div class="teacher-name">{{ selectedTeacher.name }}</div>
              <div class="teacher-status">
                <span :class="['status-dot', { online: selectedTeacher.online }]"></span>
                {{ selectedTeacher.online ? '在线' : '离线' }}
              </div>
            </div>
          </div>
          <div class="chat-actions">
            <el-button size="small" @click="showVideoCall">
              <el-icon><VideoCamera /></el-icon>
              视频通话
            </el-button>
            <el-button size="small" @click="showVoiceCall">
              <el-icon><Phone /></el-icon>
              语音通话
            </el-button>
          </div>
        </div>

        <!-- 消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="['message-item', { 'self-message': message.sender === 'parent' }]"
          >
            <div class="message-avatar" v-if="message.sender === 'teacher'">
              <el-avatar :size="32" :src="selectedTeacher.avatar">{{ selectedTeacher.name[0] }}</el-avatar>
            </div>
            <div class="message-content">
              <div class="message-header" v-if="message.sender === 'teacher'">
                <span class="sender-name">{{ selectedTeacher.name }}</span>
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
              </div>
              <div class="message-bubble">
                <div v-if="message.type === 'text'" class="text-message">
                  {{ message.content }}
                </div>
                <div v-else-if="message.type === 'image'" class="image-message">
                  <el-image
                    :src="message.content"
                    fit="cover"
                    :preview-src-list="[message.content]"
                    style="max-width: 200px; max-height: 200px;"
                  />
                </div>
                <div v-else-if="message.type === 'file'" class="file-message">
                  <div class="file-info">
                    <el-icon><Document /></el-icon>
                    <span>{{ message.fileName }}</span>
                    <el-button size="small" text>下载</el-button>
                  </div>
                </div>
                <div v-else-if="message.type === 'voice'" class="voice-message">
                  <div class="voice-player">
                    <el-button size="small" circle>
                      <el-icon><Microphone /></el-icon>
                    </el-button>
                    <span>{{ message.duration }}s</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="message-avatar" v-if="message.sender === 'parent'">
              <el-avatar :size="32">{{ userInfo.name[0] }}</el-avatar>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-toolbar">
            <el-upload
              :show-file-list="false"
              :before-upload="handleImageUpload"
              accept="image/*"
            >
              <el-button size="small" text>
                <el-icon><Picture /></el-icon>
              </el-button>
            </el-upload>
            <el-upload
              :show-file-list="false"
              :before-upload="handleFileUpload"
            >
              <el-button size="small" text>
                <el-icon><Paperclip /></el-icon>
              </el-button>
            </el-upload>
            <el-button size="small" text @click="startVoiceRecord">
              <el-icon><Microphone /></el-icon>
            </el-button>
          </div>
          <div class="input-box">
            <el-input
              v-model="messageInput"
              type="textarea"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 4 }"
              placeholder="输入消息..."
              @keydown.enter.prevent="sendMessage"
            />
            <el-button
              type="primary"
              :disabled="!messageInput.trim()"
              @click="sendMessage"
            >
              <el-icon><Position /></el-icon>
              发送
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty description="选择一位老师开始沟通">
          <el-button type="primary">添加老师</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 视频通话弹窗 -->
    <el-dialog v-model="videoCallVisible" title="视频通话" width="600px">
      <div class="video-call-container">
        <div class="video-placeholder">
          <el-icon size="64"><VideoCamera /></el-icon>
          <p>视频通话功能开发中...</p>
        </div>
      </div>
    </el-dialog>

    <!-- 语音通话弹窗 -->
    <el-dialog v-model="voiceCallVisible" title="语音通话" width="400px">
      <div class="voice-call-container">
        <div class="voice-call-placeholder">
          <el-icon size="64"><Phone /></el-icon>
          <p>语音通话功能开发中...</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Bell,
  VideoCamera,
  Phone,
  Picture,
  Paperclip,
  Microphone,
  Document,
  Position
} from '@element-plus/icons-vue'

// 类型定义
interface Message {
  id: string
  sender: 'teacher' | 'parent'
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'voice'
  fileName?: string
  duration?: number
}

interface Teacher {
  id: string
  name: string
  title: string
  avatar: string
  online: boolean
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

// 用户信息
const userInfo = ref({
  name: '张三',
  avatar: '',
  id: 'parent_001'
})

// 老师列表
const teachers = ref<Teacher[]>([
  {
    id: 'teacher_001',
    name: '李老师',
    title: '班主任',
    avatar: '',
    online: true,
    lastMessage: '小明今天表现很好，积极参与课堂活动',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 10),
    unreadCount: 2
  },
  {
    id: 'teacher_002',
    name: '王老师',
    title: '数学老师',
    avatar: '',
    online: false,
    lastMessage: '作业已经批改完成，请查看',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0
  },
  {
    id: 'teacher_003',
    name: '张老师',
    title: '英语老师',
    avatar: '',
    online: true,
    lastMessage: '明天有英语小测验，请提醒孩子复习',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 1
  }
])

// 选中的老师
const selectedTeacher = ref<Teacher | null>(null)

// 消息列表
const messages = ref<Record<string, Message[]>>({
  'teacher_001': [
    {
      id: 'msg_001',
      sender: 'teacher',
      content: '早上好！小明今天表现很好，积极参与课堂活动',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      type: 'text'
    },
    {
      id: 'msg_002',
      sender: 'parent',
      content: '太好了，谢谢老师的反馈！',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      type: 'text'
    },
    {
      id: 'msg_003',
      sender: 'teacher',
      content: '/placeholder-image.svg',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: 'image'
    },
    {
      id: 'msg_004',
      sender: 'teacher',
      content: '最近在数学方面进步很大，建议在家多做一些练习',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      type: 'text'
    }
  ],
  'teacher_002': [
    {
      id: 'msg_005',
      sender: 'teacher',
      content: '作业已经批改完成，请查看',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: 'text'
    }
  ],
  'teacher_003': [
    {
      id: 'msg_006',
      sender: 'teacher',
      content: '明天有英语小测验，请提醒孩子复习',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: 'text'
    }
  ]
})

// 当前消息
const currentMessages = computed(() => {
  return selectedTeacher.value ? messages.value[selectedTeacher.value.id] || [] : []
})

// 输入框内容
const messageInput = ref('')

// 未读消息总数
const unreadCount = computed(() => {
  return teachers.value.reduce((total, teacher) => total + teacher.unreadCount, 0)
})

// 弹窗状态
const videoCallVisible = ref(false)
const voiceCallVisible = ref(false)

// 消息容器引用
const messagesContainer = ref<HTMLElement>()

// 选择老师
const selectTeacher = (teacher: Teacher) => {
  selectedTeacher.value = teacher
  // 标记已读
  teacher.unreadCount = 0
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 发送消息
const sendMessage = () => {
  if (!messageInput.value.trim() || !selectedTeacher.value) return

  const newMessage: Message = {
    id: 'msg_' + Date.now(),
    sender: 'parent' as const,
    content: messageInput.value.trim(),
    timestamp: new Date(),
    type: 'text' as const
  }

  messages.value[selectedTeacher.value.id].push(newMessage)

  // 更新老师的最后消息
  selectedTeacher.value.lastMessage = messageInput.value.trim()
  selectedTeacher.value.lastMessageTime = new Date()

  messageInput.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  // 模拟老师回复
  setTimeout(() => {
    simulateTeacherReply()
  }, 2000)
}

// 模拟老师回复
const simulateTeacherReply = () => {
  if (!selectedTeacher.value) return

  const replies = [
    '收到您的消息，我会及时处理。',
    '谢谢您的反馈，我会关注的。',
    '好的，我明白了。',
    '有什么问题随时联系我。'
  ]

  const replyMessage: Message = {
    id: 'msg_' + Date.now(),
    sender: 'teacher' as const,
    content: replies[Math.floor(Math.random() * replies.length)],
    timestamp: new Date(),
    type: 'text' as const
  }

  messages.value[selectedTeacher.value.id].push(replyMessage)
  selectedTeacher.value.lastMessage = replyMessage.content
  selectedTeacher.value.lastMessageTime = new Date()

  nextTick(() => {
    scrollToBottom()
  })

  ElMessage.success(`${selectedTeacher.value.name}回复了消息`)
}

// 处理图片上传
const handleImageUpload = (file: File) => {
  if (!selectedTeacher.value) return false
  
  // 这里应该上传到服务器，现在只是模拟
  const imageUrl = URL.createObjectURL(file)

  const imageMessage: Message = {
    id: 'msg_' + Date.now(),
    sender: 'parent' as const,
    content: imageUrl,
    timestamp: new Date(),
    type: 'image' as const
  }

  messages.value[selectedTeacher.value.id].push(imageMessage)

  nextTick(() => {
    scrollToBottom()
  })

  return false // 阻止默认上传
}

// 处理文件上传
const handleFileUpload = (file: File) => {
  if (!selectedTeacher.value) return false
  
  const fileMessage: Message = {
    id: 'msg_' + Date.now(),
    sender: 'parent' as const,
    content: file.name,
    fileName: file.name,
    timestamp: new Date(),
    type: 'file' as const
  }

  messages.value[selectedTeacher.value.id].push(fileMessage)

  nextTick(() => {
    scrollToBottom()
  })

  return false
}

// 开始语音录制
const startVoiceRecord = () => {
  ElMessage.info('语音录制功能开发中...')
}

// 显示视频通话
const showVideoCall = () => {
  videoCallVisible.value = true
}

// 显示语音通话
const showVoiceCall = () => {
  voiceCallVisible.value = true
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return time.toLocaleDateString()
}

// 格式化消息时间
const formatMessageTime = (time: Date) => {
  return time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  // 默认选择第一个老师
  if (teachers.value.length > 0) {
    selectTeacher(teachers.value[0])
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.parent-communication {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);

  .header-content {
    max-width: var(--container-xl);
    margin: 0 auto;
  }

  .page-title {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .page-subtitle {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}

.communication-main {
  flex: 1;
  display: flex;
  background: var(--el-bg-color-page);
}

.teacher-sidebar {
  width: 320px;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }

    .unread-badge {
      cursor: pointer;
    }
  }

  .teacher-list {
    flex: 1;
    overflow-y: auto;
  }

  .teacher-item {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.active {
      background: var(--el-color-primary-light-9);
      border-left: 3px solid var(--el-color-primary);
    }
  }

  .teacher-avatar {
    position: relative;

    .online-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background: var(--el-color-success);
      border-radius: 50%;
      border: 2px solid var(--el-bg-color);
    }
  }

  .teacher-info {
    flex: 1;

    .teacher-name {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: var(--spacing-xs);
    }

    .teacher-title {
      font-size: var(--text-sm);
      color: var(--el-text-color-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .last-message {
      font-size: var(--text-sm);
      color: var(--el-text-color-regular);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .teacher-meta {
    text-align: right;

    .message-time {
      font-size: var(--text-xs);
      color: var(--el-text-color-secondary);
      margin-bottom: var(--spacing-xs);
    }
  }
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;

  .chat-header {
    padding: var(--spacing-lg);
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .teacher-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .teacher-details {
        .teacher-name {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: var(--spacing-xs);
        }

        .teacher-status {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--el-text-color-placeholder);

            &.online {
              background: var(--el-color-success);
            }
          }
        }
      }
    }

    .chat-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);

    .message-item {
      display: flex;
      margin-bottom: var(--spacing-lg);

      &.self-message {
        flex-direction: row-reverse;

        .message-content {
          align-items: flex-end;

          .message-header {
            flex-direction: row-reverse;
          }
        }

        .message-bubble {
          background: var(--el-color-primary);
          color: white;
        }
      }
    }

    .message-avatar {
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
      margin: 0 var(--spacing-md);
      max-width: 70%;

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xs);

        .sender-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .message-time {
          font-size: var(--text-xs);
          color: var(--el-text-color-secondary);
        }
      }

      .message-bubble {
        background: var(--el-bg-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-sm);

        .text-message {
          font-size: var(--text-base);
          line-height: 1.4;
          word-wrap: break-word;
        }

        .file-message {
          .file-info {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
          }
        }

        .voice-message {
          .voice-player {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
          }
        }
      }
    }
  }

  .input-area {
    padding: var(--spacing-lg);
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);

    .input-toolbar {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .input-box {
      display: flex;
      gap: var(--spacing-md);
      align-items: flex-end;

      .el-textarea {
        flex: 1;
      }
    }
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-call-container,
.voice-call-container {
  text-align: center;
  padding: var(--spacing-3xl);

  .video-placeholder,
  .voice-call-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);

    .el-icon {
      color: var(--el-text-color-secondary);
    }
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .teacher-sidebar {
    width: 280px;
  }

  .chat-area {
    .message-content {
      max-width: 85%;
    }
  }

  .communication-main {
    .chat-area {
      .chat-header {
        .chat-actions {
          display: none;
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .communication-main {
    flex-direction: column;

    .teacher-sidebar {
      width: 100%;
      height: 200px;
      border-right: none;
      border-bottom: 1px solid var(--el-border-color-light);
    }

    .chat-area {
      flex: 1;
    }
  }
}
</style>