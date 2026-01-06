<template>
  <div class="conversation-timeline">
    <div class="timeline-container">
      <el-timeline>
        <el-timeline-item
          v-for="conversation in conversations"
          :key="conversation.id"
          :timestamp="formatTime(conversation.createdAt)"
          placement="top"
        >
          <el-card>
            <div class="conversation-item">
              <div class="speaker-info">
                <el-avatar :size="32">
                  {{ conversation.speakerType === 'teacher' ? '教' : '客' }}
                </el-avatar>
                <span class="speaker-name">
                  {{ conversation.speakerType === 'teacher' ? '教师' : '客户' }}
                </span>
              </div>
              <div class="conversation-content">
                {{ conversation.content }}
              </div>
              <div v-if="conversation.sentiment" class="conversation-meta">
                <el-tag :type="getSentimentType(conversation.sentiment)" size="small">
                  {{ conversation.sentiment }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
    
    <div class="conversation-input">
      <el-input
        v-model="newMessage"
        type="textarea"
        :rows="3"
        placeholder="输入对话内容..."
      />
      <div class="input-actions">
        <el-button @click="handleBatchImport">批量导入</el-button>
        <el-button type="primary" @click="handleSend">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ConversationRecord } from '@/api/modules/teacher-sop';

interface Props {
  customerId: number;
  conversations: ConversationRecord[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addConversation: [data: any];
  batchImport: [conversations: any[]];
}>();

const newMessage = ref('');

function formatTime(time?: string): string {
  if (!time) return '';
  return new Date(time).toLocaleString('zh-CN');
}

function getSentimentType(sentiment: string): string {
  const map: Record<string, string> = {
    '积极': 'success',
    '中性': 'info',
    '消极': 'warning'
  };
  return map[sentiment] || 'info';
}

function handleSend() {
  if (!newMessage.value.trim()) return;

  emit('addConversation', {
    speakerType: 'teacher',
    content: newMessage.value,
    messageType: 'text'
  });
  
  newMessage.value = '';
}

function handleBatchImport() {
  // TODO: 打开批量导入对话框
  console.log('批量导入');
}
</script>

<style scoped lang="scss">
.conversation-timeline {
  .timeline-container {
    max-min-height: 60px; height: auto;
    overflow-y: auto;
    margin-bottom: var(--text-2xl);
    
    .conversation-item {
      .speaker-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
        
        .speaker-name {
          font-weight: 600;
        }
      }
      
      .conversation-content {
        line-height: 1.6;
        color: var(--text-regular);
        margin-bottom: var(--spacing-sm);
      }
      
      .conversation-meta {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }
  
  .conversation-input {
    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      margin-top: var(--text-sm);
    }
  }
}
</style>
