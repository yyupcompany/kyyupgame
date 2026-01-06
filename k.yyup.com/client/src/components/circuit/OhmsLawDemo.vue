<template>
  <div class="ohms-law-demo">
    <div class="demo-header">
      <h3>🔬 欧姆定律互动演示</h3>
      <p>V = I × R (电压 = 电流 × 电阻)</p>
    </div>

    <div class="interactive-demo">
      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="control-group">
          <label>电压 (V): {{ voltage }}V</label>
          <el-slider
            v-model="voltage"
            :min="0"
            :max="24"
            :step="0.5"
            @change="calculateCurrent"
            show-input
            :show-input-controls="false"
          />
        </div>

        <div class="control-group">
          <label>电阻 (R): {{ resistance }}Ω</label>
          <el-slider
            v-model="resistance"
            :min="1"
            :max="100"
            :step="1"
            @change="calculateCurrent"
            show-input
            :show-input-controls="false"
          />
        </div>

        <div class="control-group">
          <label>电流 (I): {{ current.toFixed(2) }}A</label>
          <div class="current-display">
            <div class="current-bar" :style="{ width: currentPercentage + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 电路可视化 -->
      <div class="circuit-visualization">
        <svg viewBox="0 0 600 400" width="600" height="400">
          <!-- 电路背景 -->
          <rect width="600" height="400" fill="#f8f9fa" rx="10"/>

          <!-- 电源 -->
          <g id="battery">
            <rect x="50" y="180" width="60" height="40" fill="#4CAF50" stroke="#333" stroke-width="2"/>
            <text x="80" y="205" text-anchor="middle" fill="white" font-weight="bold">电池</text>
            <text x="50" y="170" fill="#333" font-size="14" font-weight="bold">+</text>
            <text x="90" y="240" fill="#333" font-size="14" font-weight="bold">−</text>
            <text x="80" y="260" text-anchor="middle" fill="#666" font-size="12">{{ voltage }}V</text>
          </g>

          <!-- 导线 -->
          <path d="M 110 200 L 200 200" stroke="#333" stroke-width="3" fill="none"/>
          <path d="M 110 200 L 110 100 L 400 100 L 400 200" stroke="#333" stroke-width="3" fill="none"/>
          <path d="M 450 200 L 540 200 L 540 300 L 110 300 L 110 240" stroke="#333" stroke-width="3" fill="none"/>

          <!-- 电阻器 -->
          <g id="resistor">
            <rect x="200" y="185" width="250" height="30" fill="#FF9800" stroke="#333" stroke-width="2"/>
            <rect x="200" y="185" width="250" height="30" fill="url(#resistorPattern)" opacity="0.7"/>
            <text x="325" y="205" text-anchor="middle" fill="white" font-weight="bold">{{ resistance }}Ω</text>
            <text x="325" y="230" text-anchor="middle" fill="#666" font-size="12">电阻</text>
          </g>

          <!-- 电阻器图案 -->
          <defs>
            <pattern id="resistorPattern" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="10" height="10" fill="#FF5722"/>
              <rect x="10" y="0" width="10" height="10" fill="#FFC107"/>
            </pattern>
          </defs>

          <!-- 电流流动动画 -->
          <g id="current-flow" v-if="current > 0">
            <circle r="4" fill="#2196F3">
              <animateMotion dur="4s" repeatCount="indefinite">
                <mpath href="#currentPath"/>
              </animateMotion>
            </circle>
            <circle r="4" fill="#2196F3">
              <animateMotion dur="4s" repeatCount="indefinite" begin="1s">
                <mpath href="#currentPath"/>
              </animateMotion>
            </circle>
            <circle r="4" fill="#2196F3">
              <animateMotion dur="4s" repeatCount="indefinite" begin="2s">
                <mpath href="#currentPath"/>
              </animateMotion>
            </circle>
            <circle r="4" fill="#2196F3">
              <animateMotion dur="4s" repeatCount="indefinite" begin="3s">
                <mpath href="#currentPath"/>
              </animateMotion>
            </circle>
          </g>

          <!-- 电流路径（用于动画） -->
          <path id="currentPath" d="M 110 200 L 200 200 L 450 200 L 540 200 L 540 300 L 110 300 L 110 200"
                stroke="none" fill="none"/>

          <!-- 电压表 -->
          <g id="voltmeter">
            <circle cx="325" cy="50" r="30" fill="white" stroke="#333" stroke-width="2"/>
            <text x="325" y="55" text-anchor="middle" font-size="16" font-weight="bold">V</text>
            <line x1="325" y1="80" x2="200" y2="185" stroke="#333" stroke-width="1" stroke-dasharray="5,5"/>
            <line x1="325" y1="80" x2="450" y2="185" stroke="#333" stroke-width="1" stroke-dasharray="5,5"/>
            <text x="325" y="95" text-anchor="middle" fill="#666" font-size="12">{{ voltage }}V</text>
          </g>

          <!-- 电流表 -->
          <g id="ammeter">
            <circle cx="540" cy="350" r="30" fill="white" stroke="#333" stroke-width="2"/>
            <text x="540" y="355" text-anchor="middle" font-size="16" font-weight="bold">A</text>
            <text x="540" y="395" text-anchor="middle" fill="#666" font-size="12">{{ current.toFixed(2) }}A</text>
          </g>

          <!-- 功率显示 -->
          <g id="power-display">
            <rect x="450" y="50" width="120" height="60" fill="white" stroke="#333" stroke-width="1" rx="5"/>
            <text x="510" y="75" text-anchor="middle" font-size="14" font-weight="bold">功率</text>
            <text x="510" y="95" text-anchor="middle" font-size="16" fill="#FF5722">{{ power.toFixed(2) }}W</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- 关系图 -->
    <div class="relationship-chart">
      <h4>📊 三者关系</h4>
      <div class="chart-content">
        <div class="chart-item">
          <div class="icon">⚡</div>
          <div class="info">
            <strong>电压固定</strong>
            <p>电阻增大 → 电流减小</p>
          </div>
        </div>
        <div class="chart-item">
          <div class="icon">🔧</div>
          <div class="info">
            <strong>电阻固定</strong>
            <p>电压增大 → 电流增大</p>
          </div>
        </div>
        <div class="chart-item">
          <div class="icon">💡</div>
          <div class="info">
            <strong>电流固定</strong>
            <p>电阻增大 → 电压增大</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 练习题 -->
    <div class="practice-section">
      <h4>✏️ 练习计算</h4>
      <div class="practice-content">
        <div class="practice-question">
          <p><strong>题目：</strong>{{ currentQuestion.question }}</p>
          <div class="answer-input">
            <el-input
              v-model="userAnswer"
              placeholder="输入你的答案"
              @keyup.enter="checkAnswer"
              style="width: 200px; margin-right: 10px;"
            />
            <el-button @click="checkAnswer" type="primary">检查答案</el-button>
            <el-button @click="generateQuestion" :icon="RefreshRight">换一题</el-button>
          </div>
          <div v-if="feedback" class="feedback" :class="{ correct: isCorrect, incorrect: !isCorrect }">
            {{ feedback }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'

const voltage = ref(12)
const resistance = ref(10)
const current = ref(1.2)
const userAnswer = ref('')
const feedback = ref('')
const isCorrect = ref(false)
const currentQuestion = ref({
  question: '',
  answer: 0,
  unit: ''
})

const power = computed(() => voltage.value * current.value)
const currentPercentage = computed(() => Math.min((current.value / 2) * 100, 100))

const calculateCurrent = () => {
  current.value = voltage.value / resistance.value
}

const generateQuestion = () => {
  const questions = [
    {
      template: '如果电压是 {v}V，电阻是 {r}Ω，电流是多少？',
      calculate: (v: number, r: number) => v / r,
      unit: 'A'
    },
    {
      template: '如果电流是 {i}A，电阻是 {r}Ω，电压是多少？',
      calculate: (i: number, r: number) => i * r,
      unit: 'V'
    },
    {
      template: '如果电压是 {v}V，电流是 {i}A，电阻是多少？',
      calculate: (v: number, i: number) => v / i,
      unit: 'Ω'
    }
  ]

  const questionType = questions[Math.floor(Math.random() * questions.length)]
  const v = Math.round(Math.random() * 20 + 5)
  const r = Math.round(Math.random() * 50 + 5)
  const i = Number((v / r).toFixed(2))

  currentQuestion.value = {
    question: questionType.template
      .replace('{v}', v.toString())
      .replace('{r}', r.toString())
      .replace('{i}', i.toString()),
    answer: questionType.calculate(v, r, i),
    unit: questionType.unit
  }

  feedback.value = ''
  userAnswer.value = ''
}

const checkAnswer = () => {
  const userNum = parseFloat(userAnswer.value)
  if (isNaN(userNum)) {
    feedback.value = '请输入一个有效的数字'
    isCorrect.value = false
    return
  }

  const tolerance = 0.01
  if (Math.abs(userNum - currentQuestion.value.answer) < tolerance) {
    feedback.value = `✅ 正确！答案是 ${currentQuestion.value.answer.toFixed(2)}${currentQuestion.value.unit}`
    isCorrect.value = true
  } else {
    feedback.value = `❌ 错误。正确答案是 ${currentQuestion.value.answer.toFixed(2)}${currentQuestion.value.unit}`
    isCorrect.value = false
  }
}

// 监听变化，实时计算电流
watch([voltage, resistance], () => {
  calculateCurrent()
})

// 初始化
generateQuestion()
calculateCurrent()
</script>

<style scoped lang="scss">
.ohms-law-demo {
  width: 100%;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-4xl);

  h3 {
    color: #333;
    margin-bottom: var(--spacing-sm);
    font-size: 1.5rem;
  }

  p {
    color: #666;
    font-size: 1.1rem;
    font-family: 'Courier New', monospace;
    background: #f0f0f0;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--spacing-sm);
    display: inline-block;
  }
}

.interactive-demo {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
  align-items: start;
}

.control-panel {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--spacing-md);
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .control-group {
    margin-bottom: var(--spacing-2xl);

    label {
      display: block;
      margin-bottom: var(--spacing-sm);
      font-weight: 600;
      color: #333;
    }

    .el-slider {
      margin-bottom: var(--spacing-md);
    }

    .current-display {
      width: 100%;
      height: 20px;
      background: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      position: relative;

      .current-bar {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #2196F3);
        transition: width 0.3s ease;
        border-radius: 10px;
      }
    }
  }
}

.circuit-visualization {
  background: white;
  border-radius: var(--spacing-md);
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-lg);
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    max-width: 100%;
    height: auto;
  }
}

.relationship-chart {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--spacing-md);
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--spacing-4xl);

  h4 {
    color: #333;
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }

  .chart-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);

    .chart-item {
      text-align: center;
      padding: var(--spacing-lg);
      border-radius: var(--spacing-sm);
      background: #f8f9fa;

      .icon {
        font-size: 2rem;
        margin-bottom: var(--spacing-sm);
      }

      .info {
        strong {
          display: block;
          color: #333;
          margin-bottom: var(--spacing-xs);
        }

        p {
          color: #666;
          margin: 0;
          font-size: var(--text-sm);
        }
      }
    }
  }
}

.practice-section {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--spacing-md);
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h4 {
    color: #333;
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }

  .practice-content {
    max-width: 600px;
    margin: 0 auto;

    .practice-question {
      p {
        font-size: var(--text-base);
        color: #333;
        margin-bottom: var(--spacing-lg);
      }

      .answer-input {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-lg);
      }

      .feedback {
        padding: var(--spacing-md);
        border-radius: var(--spacing-sm);
        font-weight: 600;

        &.correct {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        &.incorrect {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-lg)) {
  .interactive-demo {
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
  }

  .relationship-chart .chart-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .demo-header h3 {
    font-size: 1.3rem;
  }

  .control-panel, .relationship-chart, .practice-section {
    padding: var(--spacing-lg);
  }
}
</style>