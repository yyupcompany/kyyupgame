<template>
  <div class="mobile-school-readiness">
    <!-- 页面头部 -->
    <div class="assessment-header">
      <div class="header-content">
        <h2 class="page-title">
          <van-icon name="book-o" size="20" />
          幼小衔接测评
        </h2>
        <p class="page-description">
          通过科学的评估体系，全面了解孩子的入学准备情况，包括学习能力、社交能力、自理能力等核心维度
        </p>
      </div>
    </div>

    <!-- 评估说明卡片 -->
    <div class="assessment-intro">
      <van-cell-group inset title="测评说明">
        <van-cell class="intro-cell">
          <template #title>
            <div class="intro-section">
              <h3 class="section-title">什么是幼小衔接测评？</h3>
              <p class="section-text">
                幼小衔接测评是为即将进入小学的儿童设计的综合能力评估，帮助家长了解孩子的入学准备情况。
              </p>
            </div>
          </template>
        </van-cell>

        <!-- 评估维度 -->
        <van-cell>
          <template #title>
            <div class="dimensions-section">
              <h3 class="section-title">测评内容涵盖</h3>
              <div class="dimensions-grid">
                <div
                  v-for="dimension in assessmentDimensions"
                  :key="dimension.key"
                  class="dimension-item"
                >
                  <div class="dimension-icon" :style="{ color: dimension.color }">
                    <van-icon :name="dimension.icon" size="24" />
                  </div>
                  <h4 class="dimension-title">{{ dimension.title }}</h4>
                  <p class="dimension-desc">{{ dimension.description }}</p>
                </div>
              </div>
            </div>
          </template>
        </van-cell>

        <!-- 测评信息 -->
        <van-cell>
          <template #title>
            <div class="info-section">
              <h3 class="section-title">测评信息</h3>
              <van-cell-group inset>
                <van-cell title="适合年龄" value="5-7岁" />
                <van-cell title="测评时长" value="20-30分钟" />
                <van-cell title="测评形式" value="互动游戏 + 观察评估" />
                <van-cell title="结果展示" value="详细分析报告 + 改进建议" />
              </van-cell-group>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 准备能力自测 -->
    <div class="self-assessment">
      <van-cell-group inset title="入学准备能力自测">
        <van-cell>
          <template #title>
            <div class="self-check-section">
              <h3 class="section-title">快速自测</h3>
              <p class="section-desc">请根据孩子实际情况进行自测，了解当前的准备情况</p>

              <div class="checklist">
                <div
                  v-for="item in selfCheckList"
                  :key="item.id"
                  class="check-item"
                >
                  <div class="check-content">
                    <div class="check-question">{{ item.question }}</div>
                    <van-radio-group v-model="item.answer" direction="horizontal">
                      <van-radio name="yes">是</van-radio>
                      <van-radio name="partial">部分</van-radio>
                      <van-radio name="no">否</van-radio>
                    </van-radio-group>
                  </div>
                  <div class="check-hint" v-if="item.hint">
                    <van-icon name="info-o" size="14" />
                    <span>{{ item.hint }}</span>
                  </div>
                </div>
              </div>

              <div class="check-result">
                <van-button
                  type="primary"
                  @click="calculateReadiness"
                  :loading="calculating"
                  block
                >
                  计算准备度
                </van-button>
              </div>

              <div v-if="readinessResult" class="result-display">
                <div class="result-score">
                  <div class="score-circle">
                    <div class="score-value">{{ readinessResult.score }}</div>
                    <div class="score-label">准备度</div>
                  </div>
                  <div class="result-level" :class="readinessResult.level">
                    {{ readinessResult.label }}
                  </div>
                </div>
                <div class="result-advice">{{ readinessResult.advice }}</div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 开始测评区域 -->
    <div class="start-assessment">
      <van-cell-group inset title="开始正式测评">
        <!-- 测评特点 -->
        <van-cell>
          <template #title>
            <div class="features-section">
              <h3 class="section-title">测评特点</h3>
              <div class="features-list">
                <div class="feature-item">
                  <van-icon name="success" color="#67C23A" size="16" />
                  <span>专业科学的评估体系</span>
                </div>
                <div class="feature-item">
                  <van-icon name="success" color="#67C23A" size="16" />
                  <span>趣味互动的测评方式</span>
                </div>
                <div class="feature-item">
                  <van-icon name="success" color="#67C23A" size="16" />
                  <span>个性化的入学建议</span>
                </div>
                <div class="feature-item">
                  <van-icon name="success" color="#67C23A" size="16" />
                  <span>权威专业的数据分析</span>
                </div>
              </div>
            </div>
          </template>
        </van-cell>

        <!-- 孩子信息表单 -->
        <van-cell>
          <template #title>
            <div class="form-section">
              <h3 class="section-title">孩子信息</h3>
              <van-form @submit="startAssessment">
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

                <van-field
                  v-model="assessmentForm.targetSchool"
                  name="targetSchool"
                  label="目标学校"
                  placeholder="请输入目标学校（可选）"
                  clearable
                />

                <van-field
                  v-model="assessmentForm.expectedGrade"
                  name="expectedGrade"
                  label="入学年级"
                  placeholder="请选择入学年级"
                  readonly
                  is-link
                  @click="showGradePicker = true"
                  :rules="[{ required: true, message: '请选择入学年级' }]"
                />
              </van-form>
            </div>
          </template>
        </van-cell>

        <!-- 开始按钮 -->
        <van-cell>
          <div class="start-actions">
            <van-button
              type="primary"
              size="large"
              :disabled="!isFormValid"
              @click="startAssessment"
              :loading="startLoading"
              block
            >
              <van-icon name="play" />
              开始正式测评
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
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 入学准备指南 -->
    <div class="readiness-guide">
      <van-cell-group inset title="入学准备指南">
        <van-collapse v-model="activeGuide" accordion>
          <van-collapse-item
            v-for="guide in readinessGuides"
            :key="guide.category"
            :name="guide.category"
            :title="guide.category"
          >
            <div class="guide-content">
              <div class="guide-list">
                <div
                  v-for="(item, index) in guide.items"
                  :key="index"
                  class="guide-item"
                >
                  <van-icon name="check" color="#67c23a" size="16" />
                  <span>{{ item }}</span>
                </div>
              </div>
            </div>
          </van-collapse-item>
        </van-collapse>
      </van-cell-group>
    </div>

    <!-- 测评历史 -->
    <div class="assessment-history">
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
              <div class="history-title">{{ record.childName }} 入学准备测评</div>
              <div class="history-date">{{ formatDate(record.date) }}</div>
              <div class="history-score">准备度: {{ record.readinessScore }}分</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </van-cell-group>
    </div>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showChildPicker" position="bottom">
      <van-picker
        :columns="childrenColumns"
        @confirm="onChildConfirm"
        @cancel="showChildPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showGradePicker" position="bottom">
      <van-picker
        :columns="gradeColumns"
        @confirm="onGradeConfirm"
        @cancel="showGradePicker = false"
      />
    </van-popup>

    <!-- 样题弹窗 -->
    <SampleQuestionDialog
      v-model="sampleDialogVisible"
      type="school-readiness"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import SampleQuestionDialog from './components/SampleQuestionDialog.vue'

interface AssessmentDimension {
  key: string
  title: string
  description: string
  icon: string
  color: string
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
  targetSchool: string
  expectedGrade: string
}

interface SelfCheckItem {
  id: number
  question: string
  answer: 'yes' | 'partial' | 'no' | ''
  hint?: string
  category: string
}

interface ReadinessResult {
  score: number
  level: string
  label: string
  advice: string
}

interface HistoryRecord {
  id: number
  childName: string
  date: Date
  readinessScore: number
  status: string
}

interface ReadinessGuide {
  category: string
  items: string[]
}

const router = useRouter()

const showChildPicker = ref(false)
const showGradePicker = ref(false)
const sampleDialogVisible = ref(false)
const activeGuide = ref<string>('')
const calculating = ref(false)
const startLoading = ref(false)
const readinessResult = ref<ReadinessResult | null>(null)

const assessmentDimensions: AssessmentDimension[] = [
  {
    key: 'learning',
    title: '学习能力',
    description: '专注力、记忆力、思维能力',
    icon: 'edit',
    color: '#FF6B6B'
  },
  {
    key: 'social',
    title: '社交能力',
    description: '人际交往、情绪管理、合作意识',
    icon: 'friends-o',
    color: '#4ECDC4'
  },
  {
    key: 'selfcare',
    title: '自理能力',
    description: '生活自理、时间管理、责任心',
    icon: 'aim',
    color: '#45B7D1'
  },
  {
    key: 'physical',
    title: '身体素质',
    description: '协调性、耐力、健康习惯',
    icon: 'sport',
    color: '#96CEB4'
  },
  {
    key: 'language',
    title: '语言表达',
    description: '表达能力、理解能力、沟通技巧',
    icon: 'chat-o',
    color: '#DDA0DD'
  },
  {
    key: 'cognitive',
    title: '认知发展',
    description: '逻辑思维、问题解决、创造力',
    icon: 'bulb-o',
    color: '#FFB347'
  }
]

const selfCheckList = ref<SelfCheckItem[]>([
  {
    id: 1,
    question: '孩子能专注听课15-20分钟吗？',
    answer: '',
    category: 'learning',
    hint: '小学课堂通常需要较长的专注时间'
  },
  {
    id: 2,
    question: '孩子能独立完成穿衣、吃饭等日常事务吗？',
    answer: '',
    category: 'selfcare',
    hint: '自理能力是入学的重要基础'
  },
  {
    id: 3,
    question: '孩子能主动与同学交往和合作吗？',
    answer: '',
    category: 'social',
    hint: '良好的社交能力有助于适应新环境'
  },
  {
    id: 4,
    question: '孩子能听从老师指令并完成作业吗？',
    answer: '',
    category: 'learning',
    hint: '遵守规则和完成任务是学习的基础'
  },
  {
    id: 5,
    question: '孩子能清楚表达自己的想法和需求吗？',
    answer: '',
    category: 'language',
    hint: '语言能力直接影响学习和社交'
  }
])

const assessmentForm = reactive<AssessmentForm>({
  childName: '',
  childId: null,
  targetSchool: '',
  expectedGrade: ''
})

const childrenList = ref<Child[]>([
  { id: 1, name: '小明', age: 6, grade: 'kindergarten' },
  { id: 2, name: '小红', age: 5, grade: 'kindergarten' }
])

const historyList = ref<HistoryRecord[]>([])

const readinessGuides: ReadinessGuide[] = [
  {
    category: '学习能力准备',
    items: [
      '培养孩子专注听讲的习惯',
      '训练基本的手眼协调能力',
      '让孩子接触简单的数学概念',
      '培养良好的阅读习惯',
      '训练孩子的记忆力'
    ]
  },
  {
    category: '生活习惯准备',
    items: [
      '建立规律的作息时间',
      '培养独立吃饭的能力',
      '训练自己穿衣整理',
      '学会整理书包和文具',
      '养成主动如厕的习惯'
    ]
  },
  {
    category: '社交情感准备',
    items: [
      '教孩子基本的礼貌用语',
      '培养分享和合作意识',
      '学会表达自己的情绪',
      '懂得基本的交友技巧',
      '培养面对挫折的勇气'
    ]
  }
]

const childrenColumns = computed(() =>
  childrenList.value.map(child => ({
    text: child.name,
    value: child.id
  }))
)

const gradeColumns = [
  { text: '一年级', value: 'grade1' },
  { text: '二年级', value: 'grade2' }
]

const isFormValid = computed(() => {
  return assessmentForm.childName && assessmentForm.expectedGrade
})

const calculateReadiness = () => {
  calculating.value = true

  setTimeout(() => {
    const answered = selfCheckList.value.filter(item => item.answer)
    if (answered.length === 0) {
      Toast.fail('请先完成自测问卷')
      calculating.value = false
      return
    }

    const score = answered.reduce((total, item) => {
      const points = item.answer === 'yes' ? 20 : item.answer === 'partial' ? 10 : 0
      return total + points
    }, 0)

    const maxScore = answered.length * 20
    const percentage = Math.round((score / maxScore) * 100)

    let level, label, advice
    if (percentage >= 80) {
      level = 'excellent'
      label = '准备充分'
      advice = '孩子已经具备良好的入学准备能力，建议保持现有优势，适当增加学习挑战。'
    } else if (percentage >= 60) {
      level = 'good'
      label = '基本具备'
      advice = '孩子基本具备入学准备能力，建议在薄弱环节进行针对性训练。'
    } else if (percentage >= 40) {
      level = 'moderate'
      label = '需要加强'
      advice = '孩子在某些方面还需要提升，建议进行系统性的入学准备训练。'
    } else {
      level = 'insufficient'
      label = '准备不足'
      advice = '建议加强各方面的能力培养，可以考虑推迟入学或进行密集训练。'
    }

    readinessResult.value = {
      score: percentage,
      level,
      label,
      advice
    }

    calculating.value = false
  }, 1000)
}

const onChildConfirm = ({ selectedOptions }: any) => {
  const child = childrenList.value.find(c => c.id === selectedOptions[0].value)
  if (child) {
    assessmentForm.childName = child.name
    assessmentForm.childId = child.id
  }
  showChildPicker.value = false
}

const onGradeConfirm = ({ selectedOptions }: any) => {
  assessmentForm.expectedGrade = selectedOptions[0].text
  showGradePicker.value = false
}

const startAssessment = async () => {
  if (!isFormValid.value) {
    Toast.fail('请完整填写孩子信息')
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
        type: 'school-readiness',
        childId: assessmentForm.childId?.toString(),
        childName: assessmentForm.childName,
        grade: assessmentForm.expectedGrade
      }
    })
  } catch (error) {
    Toast.fail('创建测评失败')
  } finally {
    startLoading.value = false
  }
}

const viewSample = () => {
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
      childName: '小明',
      date: new Date('2024-01-15'),
      readinessScore: 85,
      status: 'completed'
    },
    {
      id: 2,
      childName: '小红',
      date: new Date('2024-01-10'),
      readinessScore: 72,
      status: 'completed'
    }
  ]
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.mobile-school-readiness {
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

.assessment-intro,
.self-assessment,
.start-assessment,
.readiness-guide,
.assessment-history {
  margin: var(--van-padding-md) 0;
}

.section-title {
  font-size: var(--van-font-size-md);
  font-weight: 600;
  margin: 0 0 var(--van-padding-md) 0;
  color: var(--van-text-color);
}

.section-text,
.section-desc {
  font-size: var(--van-font-size-md);
  line-height: 1.6;
  color: var(--van-text-color-2);
  margin: 0;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--van-padding-md);
  margin-top: var(--van-padding-md);
}

.dimension-item {
  background: var(--van-background-color-light);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-md);
  text-align: center;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }

  .dimension-icon {
    margin-bottom: var(--van-padding-sm);
  }

  .dimension-title {
    font-size: var(--van-font-size-md);
    font-weight: 600;
    margin: 0 0 var(--van-padding-xs) 0;
    color: var(--van-text-color);
  }

  .dimension-desc {
    font-size: var(--van-font-size-sm);
    color: var(--van-text-color-2);
    margin: 0;
    line-height: 1.4;
  }
}

.self-check-section {
  .checklist {
    .check-item {
      margin-bottom: var(--van-padding-lg);

      &:last-child {
        margin-bottom: var(--van-padding-md);
      }

      .check-content {
        margin-bottom: var(--van-padding-sm);

        .check-question {
          font-size: var(--van-font-size-md);
          color: var(--van-text-color);
          margin-bottom: var(--van-padding-sm);
          line-height: 1.5;
        }
      }

      .check-hint {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-radius-md);
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
      }
    }
  }

  .check-result {
    margin: var(--van-padding-lg) 0;
  }

  .result-display {
    margin-top: var(--van-padding-lg);
    padding: var(--van-padding-lg);
    background: var(--van-background-color-light);
    border-radius: var(--van-radius-lg);

    .result-score {
      display: flex;
      align-items: center;
      gap: var(--van-padding-lg);
      margin-bottom: var(--van-padding-md);

      .score-circle {
        text-align: center;

        .score-value {
          font-size: var(--text-4xl);
          font-weight: 600;
          color: var(--van-primary-color);
          margin-bottom: var(--van-padding-xs);
        }

        .score-label {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
        }
      }

      .result-level {
        flex: 1;
        padding: var(--van-padding-sm) var(--van-padding-md);
        border-radius: var(--van-radius-md);
        font-size: var(--van-font-size-lg);
        font-weight: 600;
        text-align: center;

        &.excellent {
          background: var(--van-success-color-light);
          color: var(--van-success-color);
        }

        &.good {
          background: var(--van-primary-color-light);
          color: var(--van-primary-color);
        }

        &.moderate {
          background: var(--van-warning-color-light);
          color: var(--van-warning-color);
        }

        &.insufficient {
          background: var(--van-danger-color-light);
          color: var(--van-danger-color);
        }
      }
    }

    .result-advice {
      font-size: var(--van-font-size-md);
      line-height: 1.6;
      color: var(--van-text-color-2);
      padding-top: var(--van-padding-md);
      border-top: 1px solid var(--van-border-color);
    }
  }
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--van-padding-sm);
  margin-top: var(--van-padding-md);

  .feature-item {
    display: flex;
    align-items: center;
    gap: var(--van-padding-sm);
    padding: var(--van-padding-sm);
    background: var(--van-background-color-light);
    border-radius: var(--van-radius-md);

    span {
      font-size: var(--van-font-size-md);
      color: var(--van-text-color);
    }
  }
}

.form-section {
  margin-top: var(--van-padding-md);
}

.start-actions {
  margin-top: var(--van-padding-lg);
  padding: 0 var(--van-padding-md);
}

.guide-content {
  padding: var(--van-padding-md);

  .guide-list {
    .guide-item {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-sm);
      font-size: var(--van-font-size-md);
      color: var(--van-text-color-2);
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
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

      .history-date {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
        margin-bottom: var(--van-padding-xs);
      }

      .history-score {
        font-size: var(--van-font-size-sm);
        color: var(--van-primary-color);
        font-weight: 500;
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .dimension-item,
  .feature-item,
  .check-hint,
  .result-display,
  .history-item {
    background: var(--van-background-color-dark);
  }
}

// 响应式设计
@media (min-width: 768px) {
  .dimensions-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .features-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .feature-item {
    flex: 1 1 calc(50% - var(--van-padding-sm));
  }
}
</style>