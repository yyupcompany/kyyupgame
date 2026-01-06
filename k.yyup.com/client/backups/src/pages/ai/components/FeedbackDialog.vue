<template>
  <el-dialog
    v-model="visible"
    title="查询反馈"
    width="600px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="feedback-dialog">
      <el-form
        ref="formRef"
        :model="feedbackForm"
        :rules="formRules"
        label-width="100px"
      >
        <!-- 查询信息展示 -->
        <div class="query-info-section" v-if="queryInfo">
          <h4>查询信息</h4>
          <div class="query-content">
            <p class="query-text">{{ queryInfo.naturalQuery }}</p>
            <div class="query-meta">
              <el-tag :type="getStatusType(queryInfo.executionStatus)">
                {{ getStatusText(queryInfo.executionStatus) }}
              </el-tag>
              <span class="execution-time">
                执行时间: {{ queryInfo.executionTime || 0 }}ms
              </span>
              <span class="result-count">
                结果数量: {{ queryInfo.resultCount || 0 }}
              </span>
            </div>
          </div>
        </div>

        <!-- 反馈表单 -->
        <el-form-item label="反馈类型" prop="feedbackType">
          <el-select 
            v-model="feedbackForm.feedbackType" 
            placeholder="选择反馈类型"
            style="width: 100%"
          >
            <el-option
              v-for="type in feedbackTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            >
              <div class="feedback-type-option">
                <span class="type-label">{{ type.label }}</span>
                <span class="type-desc">{{ type.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="评分" prop="rating">
          <div class="rating-section">
            <el-rate
              v-model="feedbackForm.rating"
              :max="5"
              show-score
              score-template="{value}分"
              :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
            />
            <div class="rating-labels">
              <span class="rating-label">{{ getRatingLabel(feedbackForm.rating) }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="详细反馈">
          <el-input
            v-model="feedbackForm.comments"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的反馈意见..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- SQL相关反馈 -->
        <template v-if="feedbackForm.feedbackType === 'accuracy' && queryInfo?.generatedSql">
          <el-form-item label="生成的SQL">
            <div class="sql-display">
              <pre class="sql-code">{{ queryInfo.generatedSql }}</pre>
            </div>
          </el-form-item>

          <el-form-item label="修正SQL">
            <div class="sql-correction">
              <el-input
                v-model="feedbackForm.correctedSql"
                type="textarea"
                :rows="6"
                placeholder="如果生成的SQL有误，请提供正确的SQL语句..."
                class="sql-input"
              />
              <div class="sql-help">
                <el-button 
                  type="text" 
                  size="small" 
                  @click="validateSQL"
                  :loading="validating"
                >
                  验证SQL语法
                </el-button>
                <span v-if="sqlValidation.message" :class="sqlValidation.isValid ? 'success' : 'error'">
                  {{ sqlValidation.message }}
                </span>
              </div>
            </div>
          </el-form-item>
        </template>

        <!-- 改进建议 -->
        <el-form-item label="改进建议">
          <el-input
            v-model="feedbackForm.suggestedImprovement"
            type="textarea"
            :rows="3"
            placeholder="您对这个AI查询功能有什么改进建议..."
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <!-- 匿名反馈选项 -->
        <el-form-item>
          <el-checkbox v-model="feedbackForm.anonymous">
            匿名提交反馈
          </el-checkbox>
          <el-tooltip content="匿名反馈将不会记录您的用户信息" placement="top">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </el-form-item>
      </el-form>

      <!-- 快速反馈按钮 -->
      <div class="quick-feedback-section">
        <h4>快速反馈</h4>
        <div class="quick-buttons">
          <el-button
            v-for="quick in quickFeedbacks"
            :key="quick.type"
            size="small"
            :type="quick.type === selectedQuickFeedback ? 'primary' : 'default'"
            @click="selectQuickFeedback(quick)"
          >
            <el-icon>
              <component :is="quick.icon" />
            </el-icon>
            {{ quick.label }}
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitFeedback"
          :loading="submitting"
          :disabled="!feedbackForm.feedbackType || !feedbackForm.rating"
        >
          提交反馈
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { InfoFilled, Check, Close, Warning, Star } from '@element-plus/icons-vue'
import { useAIQuery } from '@/composables/useAIQuery'
import type { AIQueryLog, AIQueryFeedback } from '@/api/modules/ai-query'

// 定义Props
interface Props {
  modelValue: boolean
  queryInfo?: AIQueryLog | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  queryInfo: null
})

// 定义Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'feedback-submitted': [feedback: any]
}>()

// 使用AI查询组合式函数
const { submitQueryFeedback, validateSQL: validateSQLAPI } = useAIQuery()

// 响应式数据
const visible = ref(false)
const submitting = ref(false)
const validating = ref(false)
const formRef = ref<InstanceType<typeof ElForm>>()
const selectedQuickFeedback = ref('')

const feedbackForm = reactive({
  feedbackType: '',
  rating: 0,
  comments: '',
  correctedSql: '',
  suggestedImprovement: '',
  anonymous: false
})

const sqlValidation = reactive({
  isValid: false,
  message: ''
})

// 反馈类型选项
const feedbackTypes = [
  {
    value: 'accuracy',
    label: '准确性',
    description: '查询结果是否准确'
  },
  {
    value: 'speed',
    label: '速度',
    description: '查询执行速度体验'
  },
  {
    value: 'usefulness',
    label: '实用性',
    description: '查询功能的实用程度'
  },
  {
    value: 'ui_experience',
    label: '界面体验',
    description: '用户界面使用体验'
  }
]

// 快速反馈选项
const quickFeedbacks = [
  {
    type: 'excellent',
    label: '非常满意',
    icon: Star,
    rating: 5,
    feedbackType: 'usefulness',
    comments: '查询结果非常准确，使用体验很好！'
  },
  {
    type: 'good',
    label: '基本满意',
    icon: Check,
    rating: 4,
    feedbackType: 'usefulness',
    comments: '查询结果基本准确，整体体验不错。'
  },
  {
    type: 'average',
    label: '一般',
    icon: Warning,
    rating: 3,
    feedbackType: 'accuracy',
    comments: '查询结果还可以，有一些改进空间。'
  },
  {
    type: 'poor',
    label: '不满意',
    icon: Close,
    rating: 2,
    feedbackType: 'accuracy',
    comments: '查询结果不够准确，需要改进。'
  }
]

// 表单验证规则
const formRules = {
  feedbackType: [
    { required: true, message: '请选择反馈类型', trigger: 'change' }
  ],
  rating: [
    { required: true, message: '请给出评分', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '评分必须在1-5之间', trigger: 'change' }
  ]
}

// 方法
const selectQuickFeedback = (quick: any) => {
  selectedQuickFeedback.value = quick.type
  feedbackForm.feedbackType = quick.feedbackType
  feedbackForm.rating = quick.rating
  feedbackForm.comments = quick.comments
}

const validateSQL = async () => {
  if (!feedbackForm.correctedSql.trim()) {
    ElMessage.warning('请输入要验证的SQL语句')
    return
  }

  validating.value = true
  try {
    const result = await validateSQLAPI(feedbackForm.correctedSql)
    if (result?.success) {
      const data = result.data
      sqlValidation.isValid = data.isValid
      if (data.isValid) {
        sqlValidation.message = '✓ SQL语法正确'
      } else {
        sqlValidation.message = `✗ SQL语法错误: ${data.errors.join(', ')}`
      }
    }
  } catch (error: any) {
    console.error('SQL验证失败:', error)
    sqlValidation.isValid = false
    sqlValidation.message = '✗ SQL验证失败'
  } finally {
    validating.value = false
  }
}

const submitFeedback = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    if (!props.queryInfo?.id) {
      ElMessage.error('缺少查询信息，无法提交反馈')
      return
    }

    submitting.value = true

    const feedback: AIQueryFeedback = {
      queryLogId: props.queryInfo.id,
      rating: feedbackForm.rating,
      feedbackType: feedbackForm.feedbackType as any,
      comments: feedbackForm.comments || undefined,
      correctedSql: feedbackForm.correctedSql || undefined,
      suggestedImprovement: feedbackForm.suggestedImprovement || undefined
    }

    const result = await submitQueryFeedback(feedback)
    if (result?.success) {
      ElMessage.success('反馈提交成功，谢谢您的宝贵意见！')
      emit('feedback-submitted', feedback)
      handleClose()
    }
  } catch (error: any) {
    console.error('提交反馈失败:', error)
    ElMessage.error('提交反馈失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  feedbackForm.feedbackType = ''
  feedbackForm.rating = 0
  feedbackForm.comments = ''
  feedbackForm.correctedSql = ''
  feedbackForm.suggestedImprovement = ''
  feedbackForm.anonymous = false
  selectedQuickFeedback.value = ''
  sqlValidation.isValid = false
  sqlValidation.message = ''
  formRef.value?.resetFields()
}

const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

// 工具函数
const getStatusType = (status: string) => {
  const typeMap: { [key: string]: string } = {
    'success': 'success',
    'failed': 'danger',
    'pending': 'warning',
    'cancelled': 'info'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap: { [key: string]: string } = {
    'success': '成功',
    'failed': '失败',
    'pending': '执行中',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

const getRatingLabel = (rating: number) => {
  if (rating === 0) return '请评分'
  if (rating <= 1) return '非常不满意'
  if (rating <= 2) return '不满意'
  if (rating <= 3) return '一般'
  if (rating <= 4) return '满意'
  return '非常满意'
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
  if (newValue && props.queryInfo) {
    // 根据查询状态预设反馈类型
    if (props.queryInfo.executionStatus === 'failed') {
      feedbackForm.feedbackType = 'accuracy'
      feedbackForm.rating = 2
    }
  }
})

watch(visible, (newValue) => {
  if (!newValue) {
    emit('update:modelValue', false)
  }
})

// 生命周期
onMounted(() => {
  visible.value = props.modelValue
})
</script>

<style scoped lang="scss">
.feedback-dialog {
  .query-info-section {
    margin-bottom: var(--text-2xl);
    padding: var(--spacing-4xl);
    background: var(--bg-gray-light);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--primary-color);

    h4 {
      margin: 0 0 10px 0;
      font-size: var(--text-base);
      color: var(--text-primary);
    }

    .query-content {
      .query-text {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-base);
        color: var(--text-primary);
        line-height: 1.4;
      }

      .query-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-4xl);
        font-size: var(--text-sm);
        color: var(--info-color);

        .execution-time,
        .result-count {
          padding: var(--spacing-sm) 6px;
          background: var(--bg-white);
          border-radius: var(--radius-xs);
          border: var(--border-width-base) solid var(--border-color-light);
        }
      }
    }
  }

  .feedback-type-option {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    .type-label {
      font-size: var(--text-base);
      color: var(--text-primary);
    }

    .type-desc {
      font-size: var(--text-sm);
      color: var(--info-color);
    }
  }

  .rating-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-4xl);

    .rating-labels {
      .rating-label {
        font-size: var(--text-base);
        color: var(--text-regular);
        font-weight: 500;
      }
    }
  }

  .sql-display {
    margin-bottom: var(--spacing-2xl);

    .sql-code {
      background: var(--bg-gray-light);
      border: var(--border-width-base) solid #e9ecef;
      border-radius: var(--spacing-xs);
      padding: var(--text-sm);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: var(--text-sm);
      line-height: 1.4;
      overflow-x: auto;
      margin: 0;
      color: #495057;
      max-height: 200px;
      overflow-y: auto;
    }
  }

  .sql-correction {
    .sql-input {
      margin-bottom: var(--spacing-sm);

      :deep(textarea) {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: var(--text-sm);
      }
    }

    .sql-help {
      display: flex;
      align-items: center;
      gap: var(--spacing-2xl);
      font-size: var(--text-sm);

      .success {
        color: var(--success-color);
      }

      .error {
        color: var(--danger-color);
      }
    }
  }

  .info-icon {
    margin-left: var(--spacing-base);
    color: var(--info-color);
    cursor: help;
  }

  .quick-feedback-section {
    margin-top: var(--text-2xl);
    padding-top: var(--text-2xl);
    border-top: var(--border-width-base) solid #ebeef5;

    h4 {
      margin: 0 0 15px 0;
      font-size: var(--text-base);
      color: var(--text-primary);
    }

    .quick-buttons {
      display: flex;
      gap: var(--spacing-2xl);
      flex-wrap: wrap;

      .el-button {
        display: flex;
        align-items: center;
        gap: var(--spacing-base);
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .feedback-dialog {
    .query-info-section {
      .query-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }
    }

    .rating-section {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-2xl);
    }

    .quick-feedback-section {
      .quick-buttons {
        .el-button {
          flex: 1;
          min-width: 120px;
        }
      }
    }
  }
}
</style>