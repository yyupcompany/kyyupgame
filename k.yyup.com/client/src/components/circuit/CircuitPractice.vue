<template>
  <div class="circuit-practice">
    <div class="practice-header">
      <h3>🎯 电路图练习</h3>
      <p>通过互动练习掌握电路分析技能</p>
    </div>

    <div class="practice-content">
      <!-- 难度选择 -->
      <div class="difficulty-selector">
        <el-radio-group v-model="currentDifficulty" @change="loadNewQuestion">
          <el-radio-button label="beginner">🟢 入门</el-radio-button>
          <el-radio-button label="intermediate">🟡 中级</el-radio-button>
          <el-radio-button label="advanced">🔴 高级</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 练习区域 -->
      <div class="practice-area">
        <div class="question-section">
          <div class="question-card">
            <h4>📝 题目 {{ currentQuestionIndex + 1 }}</h4>
            <div class="question-content" v-html="currentQuestion.content"></div>

            <!-- 电路图显示 -->
            <div v-if="currentQuestion.circuit" class="circuit-display">
              <canvas
                ref="circuitCanvas"
                width="400"
                height="300"
                @load="drawQuestionCircuit"
              ></canvas>
            </div>
          </div>

          <!-- 答题区域 -->
          <div class="answer-section">
            <div v-if="currentQuestion.type === 'calculation'" class="calculation-answer">
              <div class="input-group">
                <label>{{ currentQuestion.answerLabel }}：</label>
                <el-input
                  v-model="userAnswer"
                  placeholder="输入答案"
                  @keyup.enter="checkAnswer"
                  style="width: 200px; margin-right: 10px;"
                />
                <span class="unit">{{ currentQuestion.unit }}</span>
              </div>
            </div>

            <div v-if="currentQuestion.type === 'choice'" class="choice-answer">
              <el-radio-group v-model="userAnswer">
                <el-radio
                  v-for="option in currentQuestion.options"
                  :key="option.value"
                  :label="option.value"
                  class="choice-option"
                >
                  {{ option.label }}
                </el-radio>
              </el-radio-group>
            </div>

            <div v-if="currentQuestion.type === 'circuit'" class="circuit-answer">
              <div class="circuit-builder-tools">
                <el-button @click="addPracticeComponent('resistor')" size="small">🔧 电阻</el-button>
                <el-button @click="addPracticeComponent('battery')" size="small">🔋 电源</el-button>
                <el-button @click="addPracticeComponent('bulb')" size="small">💡 灯泡</el-button>
                <el-button @click="addPracticeComponent('wire')" size="small">📏 导线</el-button>
                <el-button @click="clearPracticeCircuit" size="small" type="danger">🗑️ 清空</el-button>
              </div>
              <canvas
                ref="practiceCanvas"
                width="400"
                height="300"
                @mousedown="handlePracticeMouseDown"
                @mousemove="handlePracticeMouseMove"
                @mouseup="handlePracticeMouseUp"
                class="practice-canvas"
              ></canvas>
            </div>

            <div class="action-buttons">
              <el-button @click="checkAnswer" type="primary" :loading="isChecking">
                ✅ 检查答案
              </el-button>
              <el-button @click="showHint" :disabled="hintUsed">
                💡 提示 ({{ hintUsed ? '已使用' : '可用' }})
              </el-button>
              <el-button @click="loadNewQuestion" :icon="RefreshRight">
                🔄 下一题
              </el-button>
            </div>
          </div>
        </div>

        <!-- 反馈区域 -->
        <div v-if="feedback" class="feedback-section" :class="{ correct: isCorrect, incorrect: !isCorrect }">
          <div class="feedback-header">
            <span class="feedback-icon">{{ isCorrect ? '✅' : '❌' }}</span>
            <span class="feedback-title">{{ isCorrect ? '回答正确！' : '回答错误' }}</span>
          </div>
          <div class="feedback-content">
            <p v-if="feedback.explanation">{{ feedback.explanation }}</p>
            <div v-if="feedback.correctAnswer" class="correct-answer">
              <strong>正确答案：</strong>{{ feedback.correctAnswer }}
            </div>
            <div v-if="feedback.steps" class="solution-steps">
              <strong>解题步骤：</strong>
              <ol>
                <li v-for="step in feedback.steps" :key="step">{{ step }}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度统计 -->
      <div class="progress-section">
        <h4>📊 学习进度</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ totalQuestions }}</div>
            <div class="stat-label">总题数</div>
          </div>
          <div class="stat-card correct">
            <div class="stat-value">{{ correctAnswers }}</div>
            <div class="stat-label">正确</div>
          </div>
          <div class="stat-card incorrect">
            <div class="stat-value">{{ incorrectAnswers }}</div>
            <div class="stat-label">错误</div>
          </div>
          <div class="stat-card accuracy">
            <div class="stat-value">{{ accuracyPercentage }}%</div>
            <div class="stat-label">正确率</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Question {
  id: string
  type: 'calculation' | 'choice' | 'circuit'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  content: string
  answerLabel?: string
  unit?: string
  correctAnswer: any
  options?: Array<{ label: string; value: string }>
  circuit?: any
  explanation: string
  steps?: string[]
  hint?: string
}

interface Feedback {
  explanation: string
  correctAnswer?: string
  steps?: string[]
}

// 响应式数据
const currentDifficulty = ref<'beginner' | 'intermediate' | 'advanced'>('beginner')
const currentQuestion = ref<Question | null>(null)
const currentQuestionIndex = ref(0)
const userAnswer = ref('')
const feedback = ref<Feedback | null>(null)
const isCorrect = ref(false)
const isChecking = ref(false)
const hintUsed = ref(false)

// 练习电路相关
const practiceCanvas = ref<HTMLCanvasElement>()
const circuitCanvas = ref<HTMLCanvasElement>()
const practiceComponents = ref<any[]>([])
const isPracticeDrawing = ref(false)

// 统计数据
const totalQuestions = ref(0)
const correctAnswers = ref(0)
const incorrectAnswers = ref(0)

const accuracyPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctAnswers.value / totalQuestions.value) * 100)
})

// 题库
const questionBank: Question[] = [
  // 入门级题目
  {
    id: 'b1',
    type: 'calculation',
    difficulty: 'beginner',
    content: '一个电路中电源电压为12V，电阻为4Ω，求通过电路的电流。',
    answerLabel: '电流',
    unit: 'A',
    correctAnswer: 3,
    explanation: '根据欧姆定律 I = V/R = 12V/4Ω = 3A',
    steps: ['使用欧姆定律：I = V/R', '代入数值：I = 12V / 4Ω', '计算结果：I = 3A'],
    hint: '使用欧姆定律 I = V/R'
  },
  {
    id: 'b2',
    type: 'choice',
    difficulty: 'beginner',
    content: '在串联电路中，电流有什么特点？',
    correctAnswer: 'same',
    options: [
      { label: '各处电流相等', value: 'same' },
      { label: '越往后电流越小', value: 'decrease' },
      { label: '越往后电流越大', value: 'increase' },
      { label: '电流为零', value: 'zero' }
    ],
    explanation: '串联电路中电流处处相等，因为电流只有一条路径',
    hint: '思考串联电路的结构特点'
  },
  // 中级题目
  {
    id: 'i1',
    type: 'calculation',
    difficulty: 'intermediate',
    content: '一个10Ω的电阻和一个20Ω的电阻串联，接在30V的电源上，求总电流和10Ω电阻两端的电压。',
    answerLabel: '总电流',
    unit: 'A',
    correctAnswer: 1,
    explanation: '总电阻 Rₜ = 10Ω + 20Ω = 30Ω，总电流 I = 30V/30Ω = 1A，10Ω电阻电压 V₁ = 1A × 10Ω = 10V',
    steps: [
      '计算总电阻：Rₜ = R₁ + R₂ = 10Ω + 20Ω = 30Ω',
      '计算总电流：I = V/Rₜ = 30V/30Ω = 1A',
      '计算10Ω电阻电压：V₁ = I × R₁ = 1A × 10Ω = 10V'
    ],
    hint: '先计算总电阻，再用欧姆定律'
  },
  // 高级题目
  {
    id: 'a1',
    type: 'calculation',
    difficulty: 'advanced',
    content: '一个电容器容量为100μF，充电到50V，求储存的能量。如果通过一个10Ω的电阻放电，求放电时间常数。',
    answerLabel: '能量',
    unit: 'J',
    correctAnswer: 0.125,
    explanation: '能量 E = ½CV² = 0.5 × 100×10⁻⁶F × 2500V² = 0.125J，时间常数 τ = RC = 10Ω × 100×10⁻⁶F = 0.001s',
    steps: [
      '计算能量：E = ½CV² = 0.5 × 100μF × (50V)² = 0.125J',
      '计算时间常数：τ = RC = 10Ω × 100μF = 0.001s'
    ],
    hint: '使用电容储能公式和RC时间常数公式'
  }
]

// 加载新题目
const loadNewQuestion = () => {
  const availableQuestions = questionBank.filter(q => q.difficulty === currentDifficulty.value)
  if (availableQuestions.length === 0) return

  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  currentQuestion.value = availableQuestions[randomIndex]
  currentQuestionIndex.value++
  userAnswer.value = ''
  feedback.value = null
  hintUsed.value = false

  nextTick(() => {
    if (currentQuestion.value?.circuit) {
      drawQuestionCircuit()
    }
  })
}

// 检查答案
const checkAnswer = () => {
  if (!currentQuestion.value) return

  isChecking.value = true
  totalQuestions.value++

  setTimeout(() => {
    if (currentQuestion.value!.type === 'calculation') {
      const userNum = parseFloat(userAnswer.value)
      const correctNum = parseFloat(currentQuestion.value!.correctAnswer)
      isCorrect.value = Math.abs(userNum - correctNum) < 0.01
    } else if (currentQuestion.value!.type === 'choice') {
      isCorrect.value = userAnswer.value === currentQuestion.value!.correctAnswer
    }

    if (isCorrect.value) {
      correctAnswers.value++
    } else {
      incorrectAnswers.value++
    }

    // 生成反馈
    feedback.value = {
      explanation: currentQuestion.value!.explanation,
      steps: currentQuestion.value!.steps
    }

    if (!isCorrect.value && currentQuestion.value!.type === 'calculation') {
      feedback.value!.correctAnswer = `${currentQuestion.value!.correctAnswer} ${currentQuestion.value!.unit}`
    } else if (!isCorrect.value && currentQuestion.value!.type === 'choice') {
      const correctOption = currentQuestion.value!.options?.find(opt => opt.value === currentQuestion.value!.correctAnswer)
      feedback.value!.correctAnswer = correctOption?.label
    }

    isChecking.value = false
  }, 500)
}

// 显示提示
const showHint = () => {
  if (!currentQuestion.value?.hint || hintUsed.value) return

  hintUsed.value = true
  ElMessage({
    message: currentQuestion.value.hint,
    type: 'info',
    duration: 5000
  })
}

// 绘制题目电路图
const drawQuestionCircuit = () => {
  const canvas = circuitCanvas.value
  const ctx = canvas?.getContext('2d')
  if (!ctx || !canvas || !currentQuestion.value?.circuit) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 简单的示例电路绘制
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2

  // 绘制简单的串联电路示例
  ctx.beginPath()
  ctx.moveTo(50, 150)
  ctx.lineTo(150, 150)
  ctx.stroke()

  // 绘制电阻
  ctx.strokeRect(150, 140, 60, 20)
  ctx.fillStyle = '#333'
  ctx.font = '12px Arial'
  ctx.fillText('10Ω', 165, 155)

  ctx.beginPath()
  ctx.moveTo(210, 150)
  ctx.lineTo(310, 150)
  ctx.stroke()

  // 绘制第二个电阻
  ctx.strokeRect(310, 140, 60, 20)
  ctx.fillText('20Ω', 325, 155)

  ctx.beginPath()
  ctx.moveTo(370, 150)
  ctx.lineTo(370, 250)
  ctx.lineTo(50, 250)
  ctx.lineTo(50, 150)
  ctx.stroke()

  // 绘制电源
  ctx.strokeRect(30, 200, 40, 20)
  ctx.fillText('30V', 35, 215)
}

// 练习电路相关方法
const handlePracticeMouseDown = (e: MouseEvent) => {
  // 练习模式下的鼠标事件处理
}

const handlePracticeMouseMove = (e: MouseEvent) => {
  // 练习模式下的鼠标移动事件处理
}

const handlePracticeMouseUp = (e: MouseEvent) => {
  // 练习模式下的鼠标释放事件处理
}

const addPracticeComponent = (type: string) => {
  // 添加练习组件
}

const clearPracticeCircuit = () => {
  // 清空练习电路
  practiceComponents.value = []
}

onMounted(() => {
  loadNewQuestion()
})
</script>

<style scoped lang="scss">
.circuit-practice {
  width: 100%;
  padding: var(--spacing-2xl);
}

.practice-header {
  text-align: center;
  margin-bottom: var(--spacing-4xl);

  h3 {
    color: #333;
    margin-bottom: var(--spacing-sm);
    font-size: 1.8rem;
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }
}

.difficulty-selector {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-4xl);
}

.practice-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
}

.question-section {
  .question-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: var(--spacing-md);
    padding: var(--spacing-2xl);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h4 {
      color: #333;
      margin-bottom: var(--spacing-lg);
      font-size: 1.2rem;
    }

    .question-content {
      font-size: var(--text-base);
      line-height: 1.6;
      color: #333;
      margin-bottom: var(--spacing-lg);
    }

    .circuit-display {
      display: flex;
      justify-content: center;
      margin: var(--spacing-lg) 0;

      canvas {
        border: 1px solid #e0e0e0;
        border-radius: var(--spacing-sm);
      }
    }
  }
}

.answer-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: var(--spacing-md);
  padding: var(--spacing-2xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .calculation-answer {
    .input-group {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-2xl);

      label {
        min-width: 100px;
        font-weight: 600;
        color: #333;
      }

      .unit {
        margin-left: var(--spacing-sm);
        color: #666;
        font-weight: 600;
      }
    }
  }

  .choice-answer {
    margin-bottom: var(--spacing-2xl);

    .choice-option {
      display: block;
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-md);
      border: 1px solid #e0e0e0;
      border-radius: var(--spacing-sm);
      transition: all 0.3s ease;

      &:hover {
        background: #f8f9fa;
      }
    }
  }

  .circuit-answer {
    .circuit-builder-tools {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .practice-canvas {
      border: 1px solid #e0e0e0;
      border-radius: var(--spacing-sm);
      cursor: crosshair;
      display: block;
      margin: 0 auto;
    }
  }

  .action-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
  }
}

.feedback-section {
  grid-column: span 2;
  padding: var(--spacing-2xl);
  border-radius: var(--spacing-md);
  margin-top: var(--spacing-lg);

  &.correct {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
  }

  &.incorrect {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }

  .feedback-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .feedback-icon {
      font-size: var(--text-2xl);
      margin-right: var(--spacing-md);
    }

    .feedback-title {
      font-size: var(--text-lg);
      font-weight: 600;
    }
  }

  .feedback-content {
    p {
      margin-bottom: var(--spacing-md);
      line-height: 1.5;
    }

    .correct-answer {
      font-weight: 600;
      margin-bottom: var(--spacing-md);
    }

    .solution-steps {
      ol {
        padding-left: var(--spacing-lg);

        li {
          margin-bottom: var(--spacing-xs);
        }
      }
    }
  }
}

.progress-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: var(--spacing-md);
  padding: var(--spacing-2xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h4 {
    color: #333;
    margin-bottom: var(--spacing-lg);
    text-align: center;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);

    .stat-card {
      text-align: center;
      padding: var(--spacing-lg);
      border-radius: var(--spacing-sm);
      background: #f8f9fa;

      &.correct {
        background: #d4edda;
        color: #155724;
      }

      &.incorrect {
        background: #f8d7da;
        color: #721c24;
      }

      &.accuracy {
        background: #d1ecf1;
        color: #0c5460;
      }

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        opacity: 0.8;
      }
    }
  }
}

@media (max-width: var(--breakpoint-lg)) {
  .practice-area {
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
  }

  .feedback-section {
    grid-column: span 1;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .circuit-practice {
    padding: var(--spacing-lg);
  }

  .difficulty-selector {
    .el-radio-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }

  .answer-section {
    .action-buttons {
      flex-direction: column;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>