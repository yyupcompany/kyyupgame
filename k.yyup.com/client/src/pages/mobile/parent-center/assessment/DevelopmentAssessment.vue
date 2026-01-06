<template>
  <div class="mobile-development-assessment">
    <!-- 页面头部 -->
    <div class="assessment-header">
      <div class="header-content">
        <h2 class="page-title">
          <van-icon name="chart-trending-o" size="20" />
          2-6岁儿童发育商测评
        </h2>
        <p class="page-description">
          通过科学的评估体系，全面了解2-6岁儿童在五大能区的发展情况，助力家长科学育儿
        </p>
      </div>
    </div>

    <!-- 评估说明卡片 -->
    <div class="assessment-intro">
      <van-cell-group inset title="测评说明">
        <van-cell class="intro-cell">
          <template #title>
            <div class="intro-section">
              <h3 class="section-title">什么是发育商测评？</h3>
              <p class="section-text">
                发育商测评是评估0-6岁儿童神经心理发育水平的科学方法，通过五大能区的综合评估，了解孩子的发育情况。
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
                    <span>{{ dimension.emoji }}</span>
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
                <van-cell title="适合年龄" value="2-6岁" />
                <van-cell title="测评时长" value="15-25分钟" />
                <van-cell title="测评形式" value="互动游戏 + 观察评估" />
                <van-cell title="结果展示" value="发育商指数 + 能力分析报告" />
              </van-cell-group>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 开始测评区域 -->
    <div class="start-assessment">
      <van-cell-group inset title="开始测评">
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
                  <span>个性化的养育建议</span>
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
                  label="孩子姓名"
                  placeholder="请输入孩子姓名"
                  :rules="[{ required: true, message: '请输入孩子姓名' }]"
                />

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
                  v-model="assessmentForm.birthDate"
                  name="birthDate"
                  label="出生日期"
                  placeholder="请选择出生日期"
                  readonly
                  is-link
                  @click="showDatePicker = true"
                  :rules="[{ required: true, message: '请选择出生日期' }]"
                />

                <van-field
                  v-model="assessmentForm.gender"
                  name="gender"
                  label="性别"
                  placeholder="请选择性别"
                  readonly
                  is-link
                  @click="showGenderPicker = true"
                  :rules="[{ required: true, message: '请选择性别' }]"
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
        </van-cell>
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
              <div class="history-title">{{ record.childName }} 发育测评</div>
              <div class="history-date">{{ formatDate(record.date) }}</div>
              <div class="history-score">发育商: {{ record.developmentalQuotient }}</div>
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

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </van-popup>

    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <!-- 样题弹窗 -->
    <SampleQuestionDialog
      v-model="sampleDialogVisible"
      type="development"
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
  emoji: string
  color: string
}

interface Child {
  id: number
  name: string
  age: number
  birthDate: string
  gender: string
}

interface AssessmentForm {
  childName: string
  childId: number | null
  birthDate: string
  gender: string
}

interface HistoryRecord {
  id: number
  childName: string
  date: Date
  developmentalQuotient: number
  status: string
}

const router = useRouter()

const showChildPicker = ref(false)
const showDatePicker = ref(false)
const showGenderPicker = ref(false)
const sampleDialogVisible = ref(false)
const selectedDate = ref(new Date())
const startLoading = ref(false)

const assessmentDimensions: AssessmentDimension[] = [
  {
    key: 'gross',
    title: '大运动',
    description: '身体协调能力、平衡能力',
    emoji: '🏃',
    color: '#FF6B6B'
  },
  {
    key: 'fine',
    title: '精细动作',
    description: '手眼协调、动手能力',
    emoji: '✏️',
    color: '#4ECDC4'
  },
  {
    key: 'language',
    title: '语言能力',
    description: '语言理解、表达能力',
    emoji: '💬',
    color: '#45B7D1'
  },
  {
    key: 'social',
    title: '社交行为',
    description: '人际交往、情绪管理',
    emoji: '👥',
    color: '#96CEB4'
  },
  {
    key: 'cognitive',
    title: '认知能力',
    description: '思维理解、学习能力',
    emoji: '🧠',
    color: '#DDA0DD'
  }
]

const assessmentForm = reactive<AssessmentForm>({
  childName: '',
  childId: null,
  birthDate: '',
  gender: ''
})

const childrenList = ref<Child[]>([
  { id: 1, name: '小明', age: 4, birthDate: '2020-03-15', gender: '男' },
  { id: 2, name: '小红', age: 5, birthDate: '2019-07-22', gender: '女' }
])

const historyList = ref<HistoryRecord[]>([])

const childrenColumns = computed(() =>
  childrenList.value.map(child => ({
    text: child.name,
    value: child.id
  }))
)

const genderColumns = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]

const minDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 6)
  return date
})

const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 2)
  return date
})

const isFormValid = computed(() => {
  return assessmentForm.childName &&
         assessmentForm.birthDate &&
         assessmentForm.gender
})

const onChildConfirm = ({ selectedOptions }: any) => {
  const child = childrenList.value.find(c => c.id === selectedOptions[0].value)
  if (child) {
    assessmentForm.childName = child.name
    assessmentForm.childId = child.id
    assessmentForm.birthDate = child.birthDate
    assessmentForm.gender = child.gender
  }
  showChildPicker.value = false
}

const onDateConfirm = (value: Date) => {
  assessmentForm.birthDate = value.toISOString().split('T')[0]
  showDatePicker.value = false
}

const onGenderConfirm = ({ selectedOptions }: any) => {
  assessmentForm.gender = selectedOptions[0].value
  showGenderPicker.value = false
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
        type: 'development',
        childId: assessmentForm.childId?.toString(),
        childName: assessmentForm.childName
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
      developmentalQuotient: 105,
      status: 'completed'
    },
    {
      id: 2,
      childName: '小红',
      date: new Date('2024-01-10'),
      developmentalQuotient: 98,
      status: 'completed'
    }
  ]
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.mobile-development-assessment {
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
.start-assessment,
.assessment-history {
  margin: var(--van-padding-md) 0;
}

.section-title {
  font-size: var(--van-font-size-md);
  font-weight: 600;
  margin: 0 0 var(--van-padding-md) 0;
  color: var(--van-text-color);
}

.section-text {
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
    font-size: var(--text-2xl);
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

.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--van-padding-sm);
  margin-top: var(--van-padding-md);
}

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

.form-section {
  margin-top: var(--van-padding-md);
}

.start-actions {
  margin-top: var(--van-padding-lg);
  padding: 0 var(--van-padding-md);
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