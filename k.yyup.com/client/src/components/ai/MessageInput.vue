<template>
  <div class="message-input">
    <div class="input-container">
      <el-input
        v-model="message"
        type="textarea"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        resize="none"
        @input="adjustTextareaHeight"
        @keydown.enter.exact.prevent="handleSend"
        ref="inputEl"
      />
      
      <div class="input-actions">
        <div class="left-actions">
          <el-popover
            placement="top"
            trigger="click"
            :width="300"
            v-model:visible="showEmojiPicker"
          >
            <template #reference>
              <el-button
                text
                :icon="Promotion"
                :disabled="disabled"
                title="表情"
              />
            </template>
            <div class="emoji-picker">
              <div
                v-for="emoji in commonEmojis"
                :key="emoji"
                class="emoji"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </div>
            </div>
          </el-popover>

          <el-upload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :accept="'image/*'"
            :disabled="disabled"
            :on-change="handleImageChange"
          >
            <el-button
              text
              :icon="Picture"
              :disabled="disabled"
              title="上传图片"
            />
          </el-upload>

          <el-upload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :accept="'.pdf,.doc,.docx,.txt,.md'"
            :disabled="disabled"
            :on-change="handleDocumentChange"
          >
            <el-button
              text
              :icon="Document"
              :disabled="disabled"
              title="上传文档"
            />
          </el-upload>

          <el-button
            text
            :icon="Microphone"
            :disabled="disabled || !isSpeechRecognitionSupported"
            title="语音输入"
            @click="handleVoiceInput"
            :class="{ 'recording': isRecording }"
          />

          <!-- 思考开关 -->
          <el-tooltip content="启用思考模式，AI会进行深度思考" placement="top">
            <el-switch
              v-model="thinkingMode"
              :disabled="disabled"
              size="small"
              style="margin-left: var(--spacing-sm);"
              @change="handleThinkingModeChange"
            />
          </el-tooltip>
          <span class="thinking-label">思考</span>
        </div>
        
        <div class="right-actions">
          <el-button
            type="primary"
            :disabled="!canSend"
            @click="handleSend"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
    
    <div v-if="isRecording" class="recording-indicator">
      <UnifiedIcon name="default" />
      <span>正在录音，请说话...</span>
      <el-button
        size="small"
        @click="stopRecording"
      >
        停止
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { ChatRound, Picture, Microphone, Document, Promotion } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'MessageInput',
  
  props: {
    placeholder: {
      type: String,
      default: '输入消息...'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['send', 'upload-image', 'upload-document', 'voice-input', 'thinking-mode-change'],
  
  setup(props, { emit }) {
    const message = ref('');
    const rows = ref(1);
    const inputEl = ref<HTMLTextAreaElement | null>(null);
    const showEmojiPicker = ref(false);
    const isRecording = ref(false);
    const mediaRecorder = ref<MediaRecorder | null>(null);
    const recordedChunks = ref<Blob[]>([]);
    const thinkingMode = ref(false);
    const uploadedFiles = ref<File[]>([]);
    
    // 常用表情符号
    const commonEmojis = [
      '😊', '😂', '🤔', '👍', '👎', '❤️', '🎉', '🔥', 
      '✨', '🙌', '🤝', '👀', '💡', '📝', '🚀', '💯'
    ];
    
    // 是否支持语音输入
    const isSpeechRecognitionSupported = computed(() => {
      return navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices;
    });
    
    // 是否可以发送消息
    const canSend = computed(() => {
      return !props.disabled && message.value.trim().length > 0;
    });
    
    // 调整文本域高度
    const adjustTextareaHeight = () => {
      if (!inputEl.value) return;
      
      const minRows = 1;
      const maxRows = 5;
      
      // 重置高度以获取正确的scrollHeight
      inputEl.value.style.height = 'auto';
      
      // 计算行数
      const lineHeight = parseInt(getComputedStyle(inputEl.value).lineHeight);
      const paddingTop = parseInt(getComputedStyle(inputEl.value).paddingTop);
      const paddingBottom = parseInt(getComputedStyle(inputEl.value).paddingBottom);
      const scrollHeight = inputEl.value.scrollHeight - paddingTop - paddingBottom;
      
      const calculatedRows = Math.floor(scrollHeight / lineHeight);
      rows.value = Math.max(minRows, Math.min(calculatedRows, maxRows));
      
      // 设置新高度
      inputEl.value.style.height = `${lineHeight * rows.value + paddingTop + paddingBottom}px`;
    };
    
    // 插入表情符号
    const insertEmoji = (emoji: string) => {
      message.value += emoji;
      showEmojiPicker.value = false;
      
      // 聚焦输入框
      if (inputEl.value) {
        inputEl.value.focus();
      }
    };
    
    // 处理图片选择
    const handleImageChange = (file: any) => {
      if (!file.raw) return;

      // 检查文件类型
      if (!file.raw.type.startsWith('image/')) {
        ElMessage.error('请选择图片文件');
        return;
      }

      // 检查文件大小 (最大10MB)
      if (file.raw.size > 10 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过10MB');
        return;
      }

      emit('upload-image', file.raw);
    };

    // 处理文档上传
    const handleDocumentChange = (file: any) => {
      if (!file.raw) return;

      // 验证文件类型
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
      ];

      if (!allowedTypes.includes(file.raw.type)) {
        ElMessage.error('只支持上传PDF、Word、TXT、Markdown文档');
        return;
      }

      // 验证文件大小（限制为10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.raw.size > maxSize) {
        ElMessage.error('文档大小不能超过10MB');
        return;
      }

      uploadedFiles.value.push(file.raw);
      emit('upload-document', file.raw);
      ElMessage.success(`文档 ${file.raw.name} 上传成功`);
    };

    // 处理思考模式切换
    const handleThinkingModeChange = (value: boolean) => {
      emit('thinking-mode-change', value);
      ElMessage.info(value ? '已启用思考模式' : '已关闭思考模式');
    };
    
    // 处理发送消息
    const handleSend = () => {
      if (!canSend.value) return;
      
      emit('send', message.value);
      message.value = '';
      rows.value = 1;
      
      // 重置文本域高度
      if (inputEl.value) {
        inputEl.value.style.height = 'auto';
      }
    };
    
    // 处理语音输入
    const handleVoiceInput = async () => {
      if (isRecording.value) {
        stopRecording();
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 创建媒体记录器
        mediaRecorder.value = new MediaRecorder(stream);
        recordedChunks.value = [];
        
        // 添加数据处理
        mediaRecorder.value.addEventListener('dataavailable', (e) => {
          if (e.data.size > 0) {
            recordedChunks.value.push(e.data);
          }
        });
        
        // 停止录制回调
        mediaRecorder.value.addEventListener('stop', () => {
          // 停止所有轨道
          stream.getTracks().forEach(track => track.stop());
          
          // 如果没有数据，不处理
          if (recordedChunks.value.length === 0) {
            isRecording.value = false;
            return;
          }
          
          // 创建音频Blob
          const audioBlob = new Blob(recordedChunks.value, { type: 'audio/webm' });
          
          // 发送给父组件
          emit('voice-input', audioBlob);
          
          // 重置状态
          isRecording.value = false;
          mediaRecorder.value = null;
          recordedChunks.value = [];
        });
        
        // 开始录制
        mediaRecorder.value.start();
        isRecording.value = true;
        
        // 设置最大录音时间 (10秒)
        setTimeout(() => {
          if (isRecording.value) {
            stopRecording();
          }
        }, 10000);
      } catch (err) {
        console.error('无法访问麦克风:', err);
        ElMessage.error('无法访问麦克风，请检查浏览器权限设置');
      }
    };
    
    // 停止录音
    const stopRecording = () => {
      if (mediaRecorder.value && isRecording.value) {
        mediaRecorder.value.stop();
      }
    };
    
    // 组件挂载后聚焦输入框
    onMounted(() => {
      if (inputEl.value) {
        inputEl.value.focus();
      }
    });
    
    // 组件卸载前停止录音
    onUnmounted(() => {
      if (isRecording.value) {
        stopRecording();
      }
    });
    
    return {
      message,
      rows,
      inputEl,
      showEmojiPicker,
      isRecording,
      thinkingMode,
      uploadedFiles,
      commonEmojis,
      isSpeechRecognitionSupported,
      canSend,
      adjustTextareaHeight,
      insertEmoji,
      handleImageChange,
      handleDocumentChange,
      handleThinkingModeChange,
      handleSend,
      handleVoiceInput,
      stopRecording,
      // 图标
      Promotion,
      Picture,
      Document,
      Microphone
    };
  }
});
</script>

<style lang="scss" scoped>
.message-input {
  width: 100%;
  
  .input-container {
    border: var(--border-width) solid var(--el-border-color);
    border-radius: var(--spacing-sm);
    background-color: var(--el-bg-color);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    
    .el-textarea {
      --el-input-border-color: transparent;
      --el-input-border-radius: 0;
      --el-input-hover-border-color: transparent;
      --el-input-focus-border-color: transparent;
      
      &.el-textarea--disabled {
        background-color: var(--el-disabled-bg-color);
      }
    }
  }
  
  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--text-sm);
    border-top: var(--z-index-dropdown) solid var(--el-border-color-light);
    
    .left-actions, .right-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .thinking-label {
      font-size: var(--text-sm);
      color: var(--el-text-color-regular);
      margin-left: var(--spacing-xs);
    }
    
    .el-button {
      padding: var(--spacing-lg);
      border-radius: var(--spacing-xs);
      
      &.recording {
        color: var(--el-color-danger);
        animation: pulse 1.5s infinite;
      }
    }
  }
  
  .recording-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
    padding: var(--spacing-sm);
    background-color: var(--el-color-danger-light-8);
    border-radius: var(--spacing-xs);
    
    .recording-icon {
      color: var(--el-color-danger);
      animation: pulse 1.5s infinite;
    }
  }
}

.emoji-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-sm);
  
  .emoji {
    display: flex;
    justify-content: center;
    align-items: center;
    width: auto;
    min-height: 32px; height: auto;
    border-radius: var(--spacing-xs);
    cursor: pointer;
    font-size: var(--text-lg);
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style> 