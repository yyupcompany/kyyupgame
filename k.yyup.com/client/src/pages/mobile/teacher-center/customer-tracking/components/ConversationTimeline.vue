<template>
  <div class="mobile-conversation-timeline">
    <!-- 对话记录列表 -->
    <div class="conversation-list" ref="conversationListRef">
      <div v-if="conversations.length === 0" class="empty-conversations">
        <el-empty
          description="暂无对话记录"
          :image-size="100"
        >
          <el-button
            type="primary"
            @click="handleBatchImport"
            size="small"
          >
            导入对话记录
          </el-button>
        </el-empty>
      </div>

      <div v-else class="conversation-items">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          class="conversation-item"
          :class="conversation.speakerType"
        >
          <!-- 时间分隔线 -->
          <div class="time-divider">
            {{ formatTimeDivider(conversation.createdAt) }}
          </div>

          <!-- 对话气泡 -->
          <div class="conversation-bubble">
            <div class="bubble-header">
              <div class="speaker-avatar">
                <el-avatar :size="36">
                  {{ conversation.speakerType === 'teacher' ? '教' : '客' }}
                </el-avatar>
                <div class="speaker-info">
                  <span class="speaker-name">
                    {{ conversation.speakerType === 'teacher' ? '教师' : '客户' }}
                  </span>
                  <span class="conversation-time">
                    {{ formatTime(conversation.createdAt) }}
                  </span>
                </div>
              </div>
              <el-tag
                v-if="conversation.sentiment"
                :type="getSentimentType(conversation.sentiment)"
                size="small"
              >
                {{ conversation.sentiment }}
              </el-tag>
            </div>

            <div class="bubble-content">
              {{ conversation.content }}
            </div>

            <!-- 操作按钮 -->
            <div class="bubble-actions">
              <el-button
                text
                size="small"
                @click="handleEdit(conversation)"
              >
                编辑
              </el-button>
              <el-button
                text
                size="small"
                type="danger"
                @click="handleDelete(conversation.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速输入区域 -->
    <div class="quick-input">
      <div class="input-header">
        <span>快速记录对话</span>
        <el-button
          text
          size="small"
          @click="handleBatchImport"
        >
          批量导入
        </el-button>
      </div>

      <div class="input-content">
        <el-input
          v-model="newMessage"
          type="textarea"
          :rows="3"
          placeholder="记录这次对话的内容..."
          resize="none"
          maxlength="500"
          show-word-limit
        />

        <div class="speaker-type-selector">
          <span class="selector-label">说话人：</span>
          <el-radio-group v-model="speakerType" size="small">
            <el-radio-button label="teacher">教师</el-radio-button>
            <el-radio-button label="customer">客户</el-radio-button>
          </el-radio-group>
        </div>

        <div class="input-actions">
          <el-button @click="handleClear">清空</el-button>
          <el-button
            type="primary"
            @click="handleSend"
            :disabled="!newMessage.trim()"
            block
          >
            添加对话记录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入对话记录"
      width="90%"
      :fullscreen="isMobile"
    >
      <div class="import-dialog-content">
        <el-alert
          title="请按以下格式导入对话记录，每行一条对话："
          type="info"
          :closable="false"
          style="margin-bottom: var(--spacing-md);"
        />
        <div class="import-example">
          <div class="example-title">示例格式：</div>
          <pre class="example-code">
# 教师说的话
老师：您好，请问您对我们幼儿园有什么想了解的吗？

# 客户说的话
客户：我想了解一下你们的教学环境和师资力量。</pre>
        </div>
        <el-input
          v-model="importText"
          type="textarea"
          :rows="8"
          placeholder="请粘贴对话记录..."
        />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleImportConfirm"
            :disabled="!importText.trim()"
          >
            导入
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ElEmpty,
  ElButton,
  ElAvatar,
  ElTag,
  ElInput,
  ElRadioGroup,
  ElRadioButton,
  ElDialog,
  ElAlert
} from 'element-plus'
import type { ConversationRecord } from '@/api/modules/teacher-sop'

interface Props {
  customerId: number;
  conversations: ConversationRecord[];
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addConversation: [data: any];
  batchImport: [conversations: any[]];
  editConversation: [conversation: ConversationRecord];
  deleteConversation: [id: number];
}>()

const newMessage = ref('')
const speakerType = ref<'teacher' | 'customer'>('teacher')
const importDialogVisible = ref(false)
const importText = ref('')
const conversationListRef = ref()

const isMobile = computed(() => {
  return window.innerWidth < 768
})

function formatTime(time?: string): string {
  if (!time) return ''
  return new Date(time).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTimeDivider(time?: string): string {
  if (!time) return ''
  const date = new Date(time)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    })
  }
}

function getSentimentType(sentiment: string): string {
  const map: Record<string, string> = {
    '积极': 'success',
    '中性': 'info',
    '消极': 'warning',
    '负面': 'danger'
  }
  return map[sentiment] || 'info'
}

function handleSend() {
  if (!newMessage.value.trim()) return

  const conversation = {
    speakerType: speakerType.value,
    content: newMessage.value.trim(),
    messageType: 'text',
    sentiment: null
  }

  emit('addConversation', conversation)

  newMessage.value = ''
  speakerType.value = 'teacher'

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  ElMessage.success('对话记录已添加')
}

function handleClear() {
  newMessage.value = ''
  speakerType.value = 'teacher'
}

function handleEdit(conversation: ConversationRecord) {
  emit('editConversation', conversation)
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这条对话记录吗？', '确认删除', {
      type: 'warning'
    })
    emit('deleteConversation', id)
    ElMessage.success('对话记录已删除')
  } catch {
    // 用户取消删除
  }
}

function handleBatchImport() {
  importDialogVisible.value = true
  importText.value = ''
}

function handleImportConfirm() {
  if (!importText.value.trim()) return

  try {
    // 解析导入的文本
    const lines = importText.value.split('\n').filter(line => line.trim())
    const conversations: any[] = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      // 简单的格式解析
      if (trimmedLine.startsWith('老师：') || trimmedLine.startsWith('教师：')) {
        conversations.push({
          speakerType: 'teacher',
          content: trimmedLine.substring(3).trim(),
          messageType: 'text'
        })
      } else if (trimmedLine.startsWith('客户：')) {
        conversations.push({
          speakerType: 'customer',
          content: trimmedLine.substring(3).trim(),
          messageType: 'text'
        })
      }
    }

    if (conversations.length > 0) {
      emit('batchImport', conversations)
      importDialogVisible.value = false
      ElMessage.success(`成功导入 ${conversations.length} 条对话记录`)
    } else {
      ElMessage.warning('未找到有效的对话记录，请检查格式')
    }
  } catch (error) {
    ElMessage.error('导入失败，请检查格式是否正确')
  }
}

function scrollToBottom() {
  if (conversationListRef.value) {
    const container = conversationListRef.value
    container.scrollTop = container.scrollHeight
  }
}
</script>

<style scoped lang="scss">
.mobile-conversation-timeline {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color-page);

  .conversation-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) var(--spacing-md) 0;

    .empty-conversations {
      padding: var(--spacing-xl) var(--spacing-md);
      text-align: center;
    }

    .conversation-items {
      .conversation-item {
        margin-bottom: var(--spacing-lg);

        .time-divider {
          text-align: center;
          margin-bottom: var(--spacing-sm);

          span {
            background: var(--border-color);
            color: var(--text-secondary);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius-base);
            font-size: var(--font-size-small);
          }
        }

        .conversation-bubble {
          margin-bottom: var(--spacing-sm);

          .bubble-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);

            .speaker-avatar {
              display: flex;
              align-items: center;
              gap: var(--spacing-sm);

              .speaker-info {
                display: flex;
                flex-direction: column;
                gap: 2px;

                .speaker-name {
                  font-weight: 600;
                  color: var(--text-primary);
                  font-size: var(--font-size-base);
                }

                .conversation-time {
                  font-size: var(--font-size-small);
                  color: var(--text-secondary);
                }
              }
            }
          }

          .bubble-content {
            background: var(--bg-color);
            border: 1px solid var(--border-color-lighter);
            border-radius: var(--border-radius-lg);
            padding: var(--spacing-md);
            line-height: 1.6;
            color: var(--text-regular);
            margin-bottom: var(--spacing-sm);
            word-wrap: break-word;
          }

          .bubble-actions {
            display: flex;
            gap: var(--spacing-sm);
            justify-content: flex-end;

            .el-button {
              padding: var(--spacing-xs) var(--spacing-sm);
              font-size: var(--font-size-small);
            }
          }
        }

        // 教师和客户的样式差异
        &.teacher {
          .bubble-content {
            border-left: 3px solid var(--primary-color);
          }
        }

        &.customer {
          .bubble-content {
            border-left: 3px solid var(--success-color);
          }
        }
      }
    }
  }

  .quick-input {
    background: white;
    border-top: 1px solid var(--border-color-lighter);
    padding: var(--spacing-md);
    position: sticky;
    bottom: 0;

    .input-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);

      span {
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .input-content {
      .speaker-type-selector {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin: var(--spacing-sm) 0;

        .selector-label {
          font-size: var(--font-size-small);
          color: var(--text-regular);
          flex-shrink: 0;
        }

        .el-radio-group {
          flex: 1;
        }
      }

      .input-actions {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);

        .el-button {
          flex: 1;
        }
      }
    }
  }

  .import-dialog-content {
    .import-example {
      background: var(--bg-color);
      border: 1px solid var(--border-color-lighter);
      border-radius: var(--border-radius-base);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);

      .example-title {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .example-code {
        font-size: var(--font-size-small);
        line-height: 1.5;
        color: var(--text-regular);
        white-space: pre-wrap;
        margin: 0;
      }
    }
  }
}

// 移动端优化
@media (max-width: var(--breakpoint-md)) {
  .mobile-conversation-timeline {
    .conversation-list {
      padding: var(--spacing-sm) var(--spacing-sm) 0;

      .conversation-items {
        .conversation-item {
          .conversation-bubble {
            .bubble-header {
              .speaker-avatar {
                gap: var(--spacing-xs);

                .speaker-info {
                  .speaker-name {
                    font-size: var(--font-size-base);
                  }
                }
              }
            }

            .bubble-content {
              padding: var(--spacing-sm) var(--spacing-md);
              font-size: var(--font-size-base);
            }
          }
        }
      }
    }

    .quick-input {
      padding: var(--spacing-sm);

      .input-content {
        .speaker-type-selector {
          .selector-label {
            font-size: var(--font-size-small);
          }
        }
      }
    }
  }
}
</style>