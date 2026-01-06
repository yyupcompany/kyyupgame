<template>
  <div class="mobile-academic-assessment">
    <!-- 页面顶部 -->
    <div class="assessment-header">
      <div class="header-content">
        <h2 class="page-title">
          <van-icon name="book-o" size="20" />
          学科测评
        </h2>
        <p class="page-description">
          针对1-6年级学生的学科能力测评，涵盖语文、数学、英语等主要学科
        </p>
      </div>
    </div>

    <!-- 年级选择 -->
    <div class="grade-section">
      <van-cell-group inset title="选择年级">
        <van-grid :column-num="3" :gutter="12">
          <van-grid-item
            v-for="grade in grades"
            :key="grade.value"
            :class="{ active: selectedGrade === grade.value }"
            @click="selectGrade(grade)"
          >
            <div class="grade-item">
              <div class="grade-label">{{ grade.label }}</div>
            </div>
          </van-grid-item>
        </van-grid>
      </van-cell-group>
    </div>

    <!-- 学科选择 -->
    <div class="subject-section" v-if="selectedGrade">
      <van-cell-group inset title="选择学科">
        <div class="subject-list">
          <div
            v-for="subject in subjects"
            :key="subject.key"
            class="subject-card"
            :class="{ active: selectedSubject === subject.key }"
            @click="selectSubject(subject)"
          >
            <div class="subject-icon">
              <van-icon :name="subject.icon" size="28" :color="subject.color" />
            </div>
            <div class="subject-info">
              <h3 class="subject-name">{{ subject.name }}</h3>
              <p class="subject-desc">{{ subject.description }}</p>
            </div>
            <div class="subject-check" v-if="selectedSubject === subject.key">
              <van-icon name="success" color="#67c23a" size="20" />
            </div>
          </div>
        </div>
      </van-cell-group>
    </div>

    <!-- 测评详情 -->
    <div class="details-section" v-if="selectedGrade && selectedSubject">
      <van-cell-group inset title="测评详情">
        <van-cell>
          <template #title>
            <div class="assessment-title">
              {{ getCurrentSubjectInfo().name }} - {{ getCurrentGradeInfo().label }}测评
            </div>
          </template>
        </van-cell>

        <van-cell>
          <template #title>
            <p class="assessment-desc">{{ getCurrentSubjectInfo().fullDescription }}</p>
          </template>
        </van-cell>

        <!-- 测评统计 -->
        <div class="assessment-stats">
          <van-grid :column-num="2" :gutter="10">
            <van-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ getCurrentSubjectInfo().questionCount }}</div>
                <div class="stat-label">题目数量</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ getCurrentSubjectInfo().duration }}分钟</div>
                <div class="stat-label">测评时长</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ getCurrentSubjectInfo().difficulty }}</div>
                <div class="stat-label">难度等级</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ getCurrentSubjectInfo().coverage }}</div>
                <div class="stat-label">知识点覆盖</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>

        <!-- 知识点 -->
        <van-cell>
          <template #title>
            <div class="knowledge-section">
              <h4 class="knowledge-title">知识点覆盖</h4>
              <div class="knowledge-tags">
                <van-tag
                  v-for="point in getCurrentSubjectInfo().knowledgePoints"
                  :key="point"
                  type="primary"
                  size="medium"
                  plain
                  class="knowledge-tag"
                >
                  {{ point }}
                </van-tag>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 开始测评 -->
    <div class="start-section" v-if="selectedGrade && selectedSubject">
      <van-cell-group inset title="开始测评">
        <van-form @submit="startAssessment">
          <van-cell-group inset>
            <van-field
              v-model="assessmentForm.childName"
              name="childName"
              label="选择孩子"
              placeholder="请选择要测评的孩子"
              readonly
              is-link
              @click="showChildPicker = true"
              :rules="[{ required: true, message: '请选择要测评的孩子' }]"
            />

            <van-field name="mode" label="测评模式">
              <template #input>
                <van-radio-group v-model="assessmentForm.mode" direction="horizontal">
                  <van-radio name="practice">练习模式</van-radio>
                  <van-radio name="test">正式测评</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>

          <div class="start-actions">
            <van-button
              type="primary"
              size="large"
              native-type="submit"
              :disabled="!assessmentForm.childName"
              :loading="startLoading"
              block
            >
              <van-icon name="play" />
              开始测评
            </van-button>

            <van-button
              size="large"
              @click="viewSample"
              block
              style="margin-top: 12px;"
            >
              <van-icon name="eye-o" />
              查看样题
            </van-button>
          </div>
        </van-form>
      </van-cell-group>
    </div>

    <!-- 历史记录 -->
    <div class="history-section">
      <van-cell-group inset title="测评历史">
        <div v-if="historyList.length === 0" class="empty-history">
          <van-empty description="暂无测评历史" />
        </div>
        <div v-else class="history-list">
          <div
            v-for="record in historyList"
            :key="record.id"
            class="history-item"
            @click="viewHistory(record)"
          >
            <div class="history-info">
              <div class="history-title">{{ record.subjectName }} - {{ record.gradeLabel }}</div>
              <div class="history-meta">
                <span class="history-date">{{ formatDate(record.date) }}</span>
                <span class="history-score">{{ record.score }}分</span>
              </div>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </van-cell-group>
    </div>

    <!-- 孩子选择器 -->
    <van-popup v-model:show="showChildPicker" position="bottom">
      <van-picker
        :columns="childrenColumns"
        @confirm="onChildConfirm"
        @cancel="showChildPicker = false"
      />
    </van-popup>

    <!-- 样题弹窗 -->
    <SampleQuestionDialog
      v-model="sampleDialogVisible"
      type="academic"
      :subject="selectedSubject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import SampleQuestionDialog from './components/SampleQuestionDialog.vue'

interface Grade {
  value: string
  label: string
}

interface Subject {
  key: string
  name: string
  description: string
  fullDescription: string
  icon: string
  color: string
  questionCount: number
  duration: number
  difficulty: string
  coverage: string
  knowledgePoints: string[]
}

interface Child {
  id: number
  name: string
  age: number
  grade: string
}

interface AssessmentForm {
  childName: string
  childId: number | null
  mode: string
}

interface HistoryRecord {
  id: number
  subjectName: string
  gradeLabel: string
  date: Date
  score: number
  status: string
}

const router = useRouter()

const selectedGrade = ref<string>('')
const selectedSubject = ref<string>('')
const showChildPicker = ref(false)
const sampleDialogVisible = ref(false)
const startLoading = ref(false)

const grades: Grade[] = [
  { value: 'grade1', label: '一年级' },
  { value: 'grade2', label: '二年级' },
  { value: 'grade3', label: '三年级' },
  { value: 'grade4', label: '四年级' },
  { value: 'grade5', label: '五年级' },
  { value: 'grade6', label: '六年级' }
]

const subjects: Subject[] = [
  {
    key: 'chinese',
    name: '语文',
    description: '语言文字运用能力',
    fullDescription: '测评学生的语文基础知识和阅读理解能力，包括字词掌握、句子理解、篇章分析等方面。',
    icon: 'edit',
    color: '#409EFF',
    questionCount: 50,
    duration: 60,
    difficulty: '中等',
    coverage: '全面',
    knowledgePoints: ['字词基础', '句子理解', '阅读理解', '作文表达', '古诗词']
  },
  {
    key: 'math',
    name: '数学',
    description: '数学思维能力',
    fullDescription: '测评学生的数学基础知识和逻辑思维能力，包括计算能力、几何认知、应用题解答等。',
    icon: 'chart-trending-o',
    color: '#67C23A',
    questionCount: 40,
    duration: 50,
    difficulty: '中等',
    coverage: '全面',
    knowledgePoints: ['数与运算', '几何图形', '统计概率', '应用题', '逻辑推理']
  },
  {
    key: 'english',
    name: '英语',
    description: '英语语言能力',
    fullDescription: '测评学生的英语基础知识和语言运用能力，包括词汇、语法、阅读、写作等方面。',
    icon: 'label-o',
    color: '#E6A23C',
    questionCount: 45,
    duration: 45,
    difficulty: '适中',
    coverage: '基础',
    knowledgePoints: ['词汇', '语法', '阅读理解', '听力理解', '日常对话']
  }
]

const assessmentForm = reactive<AssessmentForm>({
  childName: '',
  childId: null,
  mode: 'practice'
})

const childrenList = ref<Child[]>([
  { id: 1, name: '小明', age: 8, grade: 'grade2' },
  { id: 2, name: '小红', age: 10, grade: 'grade4' }
])

const historyList = ref<HistoryRecord[]>([])

const childrenColumns = computed(() =>
  childrenList.value.map(child => ({
    text: child.name,
    value: child.id
  }))
)

const getCurrentGradeInfo = computed(() => {
  return grades.find(g => g.value === selectedGrade.value) || grades[0]
})

const getCurrentSubjectInfo = computed(() => {
  return subjects.find(s => s.key === selectedSubject.value) || subjects[0]
})

const selectGrade = (grade: Grade) => {
  selectedGrade.value = grade.value
  selectedSubject.value = '' // 重置学科选择
}

const selectSubject = (subject: Subject) => {
  selectedSubject.value = subject.key
}

const onChildConfirm = ({ selectedOptions }: any) => {
  const child = childrenList.value.find(c => c.id === selectedOptions[0].value)
  if (child) {
    assessmentForm.childName = child.name
    assessmentForm.childId = child.id
  }
  showChildPicker.value = false
}

const startAssessment = async () => {
  if (!assessmentForm.childId) {
    Toast.fail('请选择要测评的孩子')
    return
  }

  startLoading.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    Toast.success('测评创建成功')

    // 跳转到测评页面
    router.push({
      path: '/mobile/parent-center/assessment/doing',
      query: {
        type: 'academic',
        grade: selectedGrade.value,
        subject: selectedSubject.value,
        childId: assessmentForm.childId.toString(),
        mode: assessmentForm.mode
      }
    })
  } catch (error) {
    Toast.fail('创建测评失败')
  } finally {
    startLoading.value = false
  }
}

const viewSample = () => {
  if (!selectedSubject.value) {
    Toast('请先选择学科')
    return
  }
  sampleDialogVisible.value = true
}

const viewHistory = (record: HistoryRecord) => {
  router.push({
    path: '/mobile/parent-center/assessment/report',
    query: { id: record.id.toString() }
  })
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadHistory = async () => {
  // 模拟加载历史记录
  historyList.value = [
    {
      id: 1,
      subjectName: '数学',
      gradeLabel: '二年级',
      date: new Date('2024-01-15'),
      score: 85,
      status: 'completed'
    },
    {
      id: 2,
      subjectName: '语文',
      gradeLabel: '二年级',
      date: new Date('2024-01-10'),
      score: 92,
      status: 'completed'
    }
  ]
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.mobile-academic-assessment {
  min-height: 100vh;
  background: var(--van-background-color);
  padding-bottom: var(--van-padding-md);
}

.assessment-header {
  padding: var(--van-padding-lg);
  background: linear-gradient(135deg, var(--van-primary-color), var(--van-primary-color-light));
  color: white;

  .header-content {
    text-align: center;

    .page-title {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      margin: 0 0 var(--van-padding-sm) 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--van-padding-xs);

      .van-icon {
        margin-right: var(--van-padding-xs);
      }
    }

    .page-description {
      font-size: var(--van-font-size-md);
      opacity: 0.9;
      margin: 0;
      line-height: 1.5;
    }
  }
}

.grade-section {
  margin: var(--van-padding-md) 0;
}

.grade-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60px;
  border-radius: var(--van-radius-md);
  background: var(--van-background-color-light);
  transition: all 0.3s ease;

  .grade-label {
    font-size: var(--van-font-size-md);
    font-weight: 500;
    color: var(--van-text-color);
  }
}

.van-grid-item.active .grade-item {
  background: var(--van-primary-color);
  color: white;

  .grade-label {
    color: white;
  }
}

.subject-section {
  margin: var(--van-padding-md) 0;
}

.subject-list {
  padding: var(--van-padding-sm);
}

.subject-card {
  display: flex;
  align-items: center;
  padding: var(--van-padding-md);
  margin-bottom: var(--van-padding-sm);
  border-radius: var(--van-radius-lg);
  background: var(--van-background-color-light);
  transition: all 0.3s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &.active {
    background: var(--van-primary-color-light);
    border: 1px solid var(--van-primary-color);
  }

  .subject-icon {
    width: 50px;
    height: 50px;
    border-radius: var(--van-radius-lg);
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--van-padding-md);
    flex-shrink: 0;
  }

  .subject-info {
    flex: 1;

    .subject-name {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      margin: 0 0 var(--van-padding-xs) 0;
      color: var(--van-text-color);
    }

    .subject-desc {
      font-size: var(--van-font-size-md);
      color: var(--van-text-color-2);
      margin: 0;
    }
  }

  .subject-check {
    margin-left: var(--van-padding-sm);
  }
}

.details-section {
  margin: var(--van-padding-md) 0;
}

.assessment-title {
  font-size: var(--van-font-size-lg);
  font-weight: 600;
  color: var(--van-text-color);
}

.assessment-desc {
  font-size: var(--van-font-size-md);
  color: var(--van-text-color-2);
  line-height: 1.6;
  margin: var(--van-padding-sm) 0;
}

.assessment-stats {
  margin: var(--van-padding-md) 0;

  .stat-item {
    text-align: center;
    padding: var(--van-padding-md);

    .stat-value {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      color: var(--van-primary-color);
      margin-bottom: var(--van-padding-xs);
    }

    .stat-label {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
    }
  }
}

.knowledge-section {
  margin-top: var(--van-padding-md);

  .knowledge-title {
    font-size: var(--van-font-size-md);
    font-weight: 600;
    margin: 0 0 var(--van-padding-sm) 0;
    color: var(--van-text-color);
  }

  .knowledge-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--van-padding-xs);

    .knowledge-tag {
      margin: 0;
    }
  }
}

.start-section {
  margin: var(--van-padding-md) 0;
}

.start-actions {
  padding: var(--van-padding-lg);
}

.history-section {
  margin: var(--van-padding-md) 0;
}

.empty-history {
  padding: var(--van-padding-xl);
}

.history-list {
  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--van-padding-md);
    border-radius: var(--van-radius-md);
    background: var(--van-background-color-light);
    margin-bottom: var(--van-padding-sm);
    transition: all 0.3s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &:active {
      background: var(--van-background-color-dark);
    }

    .history-info {
      flex: 1;

      .history-title {
        font-size: var(--van-font-size-md);
        font-weight: 500;
        color: var(--van-text-color);
        margin-bottom: var(--van-padding-xs);
      }

      .history-meta {
        display: flex;
        align-items: center;
        gap: var(--van-padding-md);

        .history-date {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
        }

        .history-score {
          font-size: var(--van-font-size-sm);
          color: var(--van-primary-color);
          font-weight: 500;
        }
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .grade-item,
  .subject-card,
  .history-item {
    background: var(--van-background-color-dark);
  }

  .subject-card.active {
    background: var(--van-primary-color-dark);
  }
}
</style>