<template>
  <div class="message-feedback">
    <div class="feedback-actions">
      <el-button
        :class="['feedback-btn', 'like-btn', { active: feedbackValue === 'like' }]"
        :icon="feedbackValue === 'like' ? CheckIcon : ThumbUpIcon"
        size="small"
        circle
        :type="feedbackValue === 'like' ? 'success' : 'default'"
        @click="handleFeedback('like')"
        :loading="isSubmitting"
        title="这条回答有用"
      />
      <el-button
        :class="['feedback-btn', 'dislike-btn', { active: feedbackValue === 'dislike' }]"
        :icon="feedbackValue === 'dislike' ? CloseIcon : ThumbDownIcon"
        size="small"
        circle
        :type="feedbackValue === 'dislike' ? 'danger' : 'default'"
        @click="handleFeedback('dislike')"
        :loading="isSubmitting"
        title="这条回答需要改进"
      />
    </div>
    
    <!-- 反馈评论弹窗 -->
    <el-dialog
      v-model="showCommentDialog"
      title="提供详细反馈"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form ref="feedbackFormRef" :model="feedbackForm" label-position="top">
        <el-form-item label="您的反馈（可选）">
          <el-input
            v-model="feedbackForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请告诉我们这条回答为什么有帮助或需要改进的地方..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item v-if="feedbackValue === 'dislike'" label="问题类型">
          <el-checkbox-group v-model="feedbackForm.issueTypes">
            <el-checkbox label="inaccurate">信息不准确</el-checkbox>
            <el-checkbox label="incomplete">信息不完整</el-checkbox>
            <el-checkbox label="unclear">表述不清楚</el-checkbox>
            <el-checkbox label="outdated">信息过时</el-checkbox>
            <el-checkbox label="irrelevant">与问题无关</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCommentDialog = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback" :loading="isSubmitting">
            提交反馈
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

// ==================== Props ====================
interface Props {
  messageId: string
  conversationId: string
  feedback?: 'like' | 'dislike' | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  feedback: null,
  disabled: false
})

// ==================== Emits ====================
interface Emits {
  'feedback-submitted': [feedback: any]
  'feedback-updated': [feedback: any]
}

const emit = defineEmits<Emits>()

// ==================== 状态管理 ====================
const feedbackValue = ref<'like' | 'dislike' | null>(props.feedback)
const isSubmitting = ref(false)
const showCommentDialog = ref(false)

const feedbackFormRef = ref()
const feedbackForm = reactive({
  comment: '',
  issueTypes: [] as string[]
})

// ==================== 监听 ====================
watch(() => props.feedback, (newVal) => {
  feedbackValue.value = newVal
})

// ==================== 方法 ====================
const handleFeedback = async (type: 'like' | 'dislike') => {
  if (props.disabled) return
  
  // 如果点击的是已选中的按钮，则取消选择
  if (feedbackValue.value === type) {
    feedbackValue.value = null
    return
  }
  
  feedbackValue.value = type
  
  // 如果是点赞，直接提交；如果是点踩，显示评论对话框
  if (type === 'like') {
    await submitFeedback()
  } else {
    showCommentDialog.value = true
  }
}

const submitFeedback = async () => {
  if (!feedbackValue.value) return
  
  isSubmitting.value = true
  
  try {
    const feedbackData = {
      messageId: props.messageId,
      conversationId: props.conversationId,
      feedback: feedbackValue.value,
      comment: feedbackForm.comment,
      issueTypes: feedbackValue.value === 'dislike' ? feedbackForm.issueTypes : undefined,
      timestamp: new Date().toISOString()
    }
    
    await aiService.post('/ai/feedback/submit', feedbackData)
    
    ElMessage.success('感谢您的反馈！')
    
    emit('feedback-submitted', feedbackData)
    emit('feedback-updated', { 
      messageId: props.messageId, 
      feedback: feedbackValue.value 
    })
    
    // 重置表单
    feedbackForm.comment = ''
    feedbackForm.issueTypes = []
    showCommentDialog.value = false
    
  } catch (error) {
    console.error('提交反馈失败:', error)
    ElMessage.error('提交反馈失败，请稍后重试')
    // 回滚状态
    feedbackValue.value = props.feedback
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.message-feedback {
  margin-top: var(--spacing-sm);
  display: flex;
  justify-content: flex-end;
}

.feedback-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.feedback-btn {
  transition: all 0.2s ease;
  
  &.like-btn.active {
    background-color: var(--el-color-success);
    border-color: var(--el-color-success);
    color: white;
  }
  
  &.dislike-btn.active {
    background-color: var(--el-color-danger);
    border-color: var(--el-color-danger);
    color: white;
  }
  
  &:hover:not(.active) {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 响应式设计
@media (max-width: var(--breakpoint-sm)) {
  .feedback-actions {
    gap: var(--spacing-lg);
  }
  
  .feedback-btn {
    width: var(--icon-size); height: var(--icon-size);
  }
}
</style>