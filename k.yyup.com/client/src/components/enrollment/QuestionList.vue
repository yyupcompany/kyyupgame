<template>
  <div class="question-list">
    <!-- 搜索栏 -->
    <van-search
      v-model="searchKeyword"
      placeholder="搜索试题"
      @search="handleSearch"
      @clear="handleClear"
    />

    <!-- 难度筛选 -->
    <van-cell-group inset>
      <van-field name="difficulty" label="难度级别">
        <template #input>
          <van-radio-group v-model="filterDifficulty" direction="horizontal" @change="loadQuestions">
            <van-radio name="">全部</van-radio>
            <van-radio name="easy">简单</van-radio>
            <van-radio name="medium">中等</van-radio>
            <van-radio name="hard">困难</van-radio>
          </van-radio-group>
        </template>
      </van-field>
    </van-cell-group>

    <!-- 试题列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadQuestions"
      >
        <div v-for="question in questions" :key="question.id" class="question-item">
          <van-cell-group inset>
            <van-cell>
              <template #title>
                <div class="question-header">
                  <span class="question-title">{{ question.title }}</span>
                  <van-tag
                    :type="getDifficultyType(question.difficulty)"
                    size="small"
                  >
                    {{ getDifficultyText(question.difficulty) }}
                  </van-tag>
                </div>
              </template>
              <template #label>
                <div class="question-meta">
                  <span>创建时间：{{ formatDate(question.createdAt) }}</span>
                  <span>使用次数：{{ question.usageCount }}</span>
                </div>
              </template>
              <template #right-icon>
                <van-icon name="ellipsis" @click="showQuestionActions(question)" />
              </template>
            </van-cell>

            <van-cell title="问题内容">
              <template #value>
                <div class="question-content">{{ question.content }}</div>
              </template>
            </van-cell>

            <van-cell title="期望回答">
              <template #value>
                <div class="expected-answer">{{ question.expectedAnswer }}</div>
              </template>
            </van-cell>

            <van-cell title="评分标准">
              <template #value>
                <div class="scoring-criteria">{{ question.scoringCriteria }}</div>
              </template>
            </van-cell>

            <van-cell v-if="question.tags && question.tags.length > 0" title="标签">
              <template #value>
                <van-tag
                  v-for="tag in question.tags"
                  :key="tag"
                  type="primary"
                  size="small"
                  class="question-tag"
                >
                  {{ tag }}
                </van-tag>
              </template>
            </van-cell>

            <div class="question-actions">
              <van-button size="small" @click="editQuestion(question)">
                编辑
              </van-button>
              <van-button size="small" type="success" @click="previewQuestion(question)">
                预览
              </van-button>
              <van-button size="small" type="danger" @click="deleteQuestion(question)">
                删除
              </van-button>
            </div>
          </van-cell-group>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 添加试题浮动按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="plus"
      @click="showAddQuestionDialog = true"
    />

    <!-- 添加/编辑试题弹窗 -->
    <van-popup v-model:show="showAddQuestionDialog" position="bottom" :style="{ height: '90%' }">
      <div class="add-question-dialog">
        <van-nav-bar
          :title="editingQuestion ? '编辑试题' : '添加试题'"
          left-text="取消"
          right-text="保存"
          @click-left="showAddQuestionDialog = false"
          @click-right="saveQuestion"
        />
        <div class="question-form">
          <van-field
            v-model="questionForm.title"
            label="试题标题"
            placeholder="请输入试题标题"
            required
          />
          <van-field name="difficulty" label="难度级别">
            <template #input>
              <van-radio-group v-model="questionForm.difficulty" direction="horizontal">
                <van-radio name="easy">简单</van-radio>
                <van-radio name="medium">中等</van-radio>
                <van-radio name="hard">困难</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-model="questionForm.content"
            label="问题内容"
            placeholder="请输入问题内容"
            type="textarea"
            rows="3"
            required
          />
          <van-field
            v-model="questionForm.expectedAnswer"
            label="期望回答"
            placeholder="请输入期望的回答内容"
            type="textarea"
            rows="3"
          />
          <van-field
            v-model="questionForm.scoringCriteria"
            label="评分标准"
            placeholder="请输入评分标准"
            type="textarea"
            rows="3"
          />
          <van-field name="tags" label="标签">
            <template #input>
              <van-tag
                v-for="tag in questionForm.tags"
                :key="tag"
                closeable
                @close="removeTag(tag)"
                class="tag-item"
              >
                {{ tag }}
              </van-tag>
              <van-field
                v-model="newTag"
                placeholder="添加标签"
                @blur="addTag"
                class="tag-input"
              />
            </template>
          </van-field>
        </div>
      </div>
    </van-popup>

    <!-- 操作菜单 -->
    <van-action-sheet
      v-model:show="showActionSheet"
      :actions="questionActions"
      @select="handleActionSelect"
      cancel-text="取消"
    />

    <!-- 预览弹窗 -->
    <van-popup v-model:show="showPreviewDialog" position="center" :style="{ width: '90%' }">
      <div class="preview-dialog">
        <van-nav-bar
          title="试题预览"
          left-text="关闭"
          @click-left="showPreviewDialog = false"
        />
        <div class="preview-content">
          <h4>{{ previewingQuestionData?.title }}</h4>
          <div class="difficulty-tag">
            <van-tag :type="getDifficultyType(previewingQuestionData?.difficulty)">
              {{ getDifficultyText(previewingQuestionData?.difficulty) }}
            </van-tag>
          </div>
          <div class="preview-item">
            <strong>问题：</strong>
            <p>{{ previewingQuestionData?.content }}</p>
          </div>
          <div class="preview-item">
            <strong>期望回答：</strong>
            <p>{{ previewingQuestionData?.expectedAnswer }}</p>
          </div>
          <div class="preview-item">
            <strong>评分标准：</strong>
            <p>{{ previewingQuestionData?.scoringCriteria }}</p>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'

// Props
interface Props {
  category: string
}

const props = defineProps<Props>()

// 响应式数据
const questions = ref([])
const searchKeyword = ref('')
const filterDifficulty = ref('')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

// 弹窗状态
const showAddQuestionDialog = ref(false)
const showActionSheet = ref(false)
const showPreviewDialog = ref(false)

// 表单状态
const editingQuestion = ref(null)
const currentQuestion = ref(null)
const previewingQuestionData = ref(null)
const newTag = ref('')

// 试题表单
const questionForm = reactive({
  title: '',
  difficulty: 'medium',
  content: '',
  expectedAnswer: '',
  scoringCriteria: '',
  tags: []
})

// 操作菜单
const questionActions = [
  { name: '编辑', value: 'edit' },
  { name: '预览', value: 'preview' },
  { name: '复制', value: 'copy' },
  { name: '删除', value: 'delete' }
]

// 方法
const loadQuestions = async () => {
  try {
    loading.value = true
    // 模拟API调用
    // 这里应该调用实际的API获取试题列表
    const mockQuestions = [
      {
        id: '1',
        title: '自我介绍',
        difficulty: 'easy',
        content: '请小朋友介绍一下自己，包括名字、年龄和兴趣爱好。',
        expectedAnswer: '能够清晰地说出自己的名字、年龄，简单介绍1-2个兴趣爱好。',
        scoringCriteria: '表达清晰度(40分)，内容完整性(30分)，语言流畅性(30分)',
        category: props.category,
        tags: ['基础', '表达'],
        usageCount: 45,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: '家庭介绍',
        difficulty: 'medium',
        content: '请介绍一下你的家庭成员，说说你最喜欢和谁一起玩。',
        expectedAnswer: '能够说出家庭成员的基本情况，表达对家人的感情。',
        scoringCriteria: '家庭认知(30分)，情感表达(40分)，语言组织(30分)',
        category: props.category,
        tags: ['家庭', '情感'],
        usageCount: 32,
        createdAt: '2024-01-20'
      }
    ]

    if (!refreshing.value) {
      questions.value = [...questions.value, ...mockQuestions]
    } else {
      questions.value = mockQuestions
    }

    finished.value = true
  } catch (error) {
    console.error('Load questions error:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  finished.value = false
  loadQuestions()
}

const handleSearch = () => {
  // 实现搜索逻辑
  loadQuestions()
}

const handleClear = () => {
  searchKeyword.value = ''
  loadQuestions()
}

const getDifficultyText = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const getDifficultyType = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || 'primary'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const showQuestionActions = (question: any) => {
  currentQuestion.value = question
  showActionSheet.value = true
}

const handleActionSelect = (action: any) => {
  const { value } = action

  switch (value) {
    case 'edit':
      editQuestion(currentQuestion.value)
      break
    case 'preview':
      previewQuestion(currentQuestion.value)
      break
    case 'copy':
      copyQuestion(currentQuestion.value)
      break
    case 'delete':
      deleteQuestion(currentQuestion.value)
      break
  }

  showActionSheet.value = false
}

const editQuestion = (question: any) => {
  editingQuestion.value = question
  Object.assign(questionForm, {
    title: question.title,
    difficulty: question.difficulty,
    content: question.content,
    expectedAnswer: question.expectedAnswer,
    scoringCriteria: question.scoringCriteria,
    tags: [...question.tags]
  })
  showAddQuestionDialog.value = true
}

const previewQuestion = (question: any) => {
  previewingQuestionData.value = question
  showPreviewDialog.value = true
}

const copyQuestion = (question: any) => {
  Object.assign(questionForm, {
    title: question.title + ' - 副本',
    difficulty: question.difficulty,
    content: question.content,
    expectedAnswer: question.expectedAnswer,
    scoringCriteria: question.scoringCriteria,
    tags: [...question.tags]
  })
  editingQuestion.value = null
  showAddQuestionDialog.value = true
}

const deleteQuestion = async (question: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这道试题吗？删除后无法恢复。'
    })

    // 这里应该调用删除API
    const index = questions.value.findIndex((q: any) => q.id === question.id)
    if (index > -1) {
      questions.value.splice(index, 1)
    }

    showToast('删除成功')
  } catch (error) {
    console.error('Delete question error:', error)
  }
}

const saveQuestion = async () => {
  try {
    if (!questionForm.title || !questionForm.content) {
      showToast('请填写必填项')
      return
    }

    // 这里应该调用保存API
    const newQuestion = {
      id: editingQuestion.value?.id || Date.now().toString(),
      ...questionForm,
      category: props.category,
      usageCount: editingQuestion.value?.usageCount || 0,
      createdAt: editingQuestion.value?.createdAt || new Date().toISOString().split('T')[0]
    }

    if (editingQuestion.value) {
      const index = questions.value.findIndex((q: any) => q.id === editingQuestion.value!.id)
      if (index > -1) {
        questions.value[index] = newQuestion
      }
      showToast('更新成功')
    } else {
      questions.value.unshift(newQuestion)
      showToast('添加成功')
    }

    showAddQuestionDialog.value = false
    resetQuestionForm()
  } catch (error) {
    console.error('Save question error:', error)
    showToast('保存失败')
  }
}

const resetQuestionForm = () => {
  editingQuestion.value = null
  Object.assign(questionForm, {
    title: '',
    difficulty: 'medium',
    content: '',
    expectedAnswer: '',
    scoringCriteria: '',
    tags: []
  })
  newTag.value = ''
}

const addTag = () => {
  if (newTag.value.trim() && !questionForm.tags.includes(newTag.value.trim())) {
    questionForm.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = questionForm.tags.indexOf(tag)
  if (index > -1) {
    questionForm.tags.splice(index, 1)
  }
}

// 生命周期
onMounted(() => {
  loadQuestions()
})
</script>

<style scoped lang="scss">
.question-list {
  min-height: 100vh;
  background: var(--van-background-color-light);
  padding-bottom: 60px;

  .question-item {
    margin-bottom: var(--van-padding-md);

    .question-header {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);

      .question-title {
        flex: 1;
        font-weight: 500;
      }
    }

    .question-meta {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      margin-top: 8px;
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
    }

    .question-content,
    .expected-answer,
    .scoring-criteria {
      line-height: 1.5;
      color: var(--van-text-color-1);
    }

    .question-tag {
      margin-right: var(--van-padding-xs);
      margin-bottom: var(--van-padding-xs);
    }

    .question-actions {
      display: flex;
      gap: var(--van-padding-sm);
      padding: var(--van-padding-md);
      justify-content: center;
    }
  }

  .add-question-dialog {
    height: 100%;
    display: flex;
    flex-direction: column;

    .question-form {
      flex: 1;
      padding: var(--van-padding-md);
      overflow-y: auto;

      .tag-item {
        margin-right: var(--van-padding-xs);
        margin-bottom: var(--van-padding-xs);
      }

      .tag-input {
        display: inline-block;
        width: 100px;
        margin-left: var(--van-padding-xs);
      }
    }
  }

  .preview-dialog {
    background: white;
    border-radius: var(--van-border-radius-lg);
    overflow: hidden;

    .preview-content {
      padding: var(--van-padding-md);

      h4 {
        margin: 0 0 var(--van-padding-md);
        text-align: center;
        color: var(--van-primary-color);
      }

      .difficulty-tag {
        text-align: center;
        margin-bottom: var(--van-padding-md);
      }

      .preview-item {
        margin-bottom: var(--van-padding-lg);

        strong {
          display: block;
          margin-bottom: var(--van-padding-xs);
          color: var(--van-text-color-1);
        }

        p {
          margin: 0;
          line-height: 1.6;
          color: var(--van-text-color-2);
        }
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .question-list {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>