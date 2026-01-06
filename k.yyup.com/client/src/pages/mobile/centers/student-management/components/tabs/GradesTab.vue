<template>
  <div class="grades-tab">
    <!-- 学期选择 -->
    <van-cell-group inset>
      <van-field
        v-model="currentSemesterText"
        label="学期"
        placeholder="选择学期"
        readonly
        is-link
        @click="showSemesterPicker = true"
      />
    </van-cell-group>

    <!-- 总体成绩概览 -->
    <div class="grades-overview">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item>
          <div class="overview-item">
            <div class="overview-value">{{ averageScore }}</div>
            <div class="overview-label">平均分</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="overview-item">
            <div class="overview-value">{{ classRanking }}</div>
            <div class="overview-label">班级排名</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="overview-item">
            <div class="overview-value">{{ totalSubjects }}</div>
            <div class="overview-label">科目数量</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="overview-item">
            <div class="overview-value">{{ attendanceRate }}%</div>
            <div class="overview-label">出勤率</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 成绩雷达图 -->
    <div class="radar-chart-container">
      <van-cell-group title="能力分析" inset>
        <div class="chart-wrapper">
          <div id="gradesRadarChart" class="chart"></div>
        </div>
      </van-cell-group>
    </div>

    <!-- 各科成绩列表 -->
    <van-cell-group title="各科成绩" inset>
      <div class="subjects-list">
        <div
          v-for="subject in subjectScores"
          :key="subject.name"
          class="subject-item"
        >
          <div class="subject-header">
            <div class="subject-info">
              <h4 class="subject-name">{{ subject.name }}</h4>
              <span class="subject-teacher">{{ subject.teacher }}</span>
            </div>
            <div class="subject-score">
              <div class="score-value">{{ subject.score }}</div>
              <div class="score-level" :class="getScoreLevelClass(subject.score)">
                {{ getScoreLevelText(subject.score) }}
              </div>
            </div>
          </div>

          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${subject.score}%`, backgroundColor: getScoreColor(subject.score) }"
            ></div>
          </div>

          <div class="subject-details">
            <div class="detail-item">
              <span class="label">课堂表现</span>
              <van-rate
                v-model="subject.classPerformance"
                :size="14"
                color="#ffd21e"
                void-icon="star"
                readonly
              />
            </div>
            <div class="detail-item">
              <span class="label">作业完成</span>
              <span class="value">{{ subject.homeworkCompletion }}%</span>
            </div>
            <div class="detail-item" v-if="subject.comment">
              <span class="label">老师评语</span>
              <div class="comment">{{ subject.comment }}</div>
            </div>
          </div>
        </div>
      </div>
    </van-cell-group>

    <!-- 成绩趋势 -->
    <van-cell-group title="成绩趋势" inset>
      <div class="trend-chart">
        <div id="gradesTrendChart" class="chart"></div>
      </div>
    </van-cell-group>

    <!-- 学期对比 -->
    <van-cell-group title="学期对比" inset>
      <div class="semester-comparison">
        <div
          v-for="semester in semesterComparison"
          :key="semester.name"
          class="comparison-item"
        >
          <div class="semester-name">{{ semester.name }}</div>
          <div class="semester-score">{{ semester.averageScore }}</div>
          <div class="semester-change" :class="semester.change >= 0 ? 'positive' : 'negative'">
            {{ semester.change >= 0 ? '+' : '' }}{{ semester.change }}
          </div>
        </div>
      </div>
    </van-cell-group>

    <!-- 学期选择器 -->
    <van-popup v-model:show="showSemesterPicker" position="bottom">
      <van-picker
        :columns="semesterOptions"
        @confirm="onSemesterConfirm"
        @cancel="showSemesterPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { showToast } from 'vant'

interface Props {
  studentId: string
}

const props = defineProps<Props>()

// 响应式数据
const showSemesterPicker = ref(false)
const currentSemester = ref('2024-spring')

// 模拟数据
const semesterOptions = [
  { text: '2024年春季学期', value: '2024-spring' },
  { text: '2023年秋季学期', value: '2023-fall' },
  { text: '2023年春季学期', value: '2023-spring' }
]

const subjectScores = ref([
  {
    name: '语言表达',
    teacher: '王老师',
    score: 92,
    classPerformance: 5,
    homeworkCompletion: 98,
    comment: '表达能力优秀，词汇量丰富，善于沟通'
  },
  {
    name: '数学思维',
    teacher: '李老师',
    score: 88,
    classPerformance: 4,
    homeworkCompletion: 95,
    comment: '逻辑思维能力较强，计算准确'
  },
  {
    name: '艺术创作',
    teacher: '张老师',
    score: 95,
    classPerformance: 5,
    homeworkCompletion: 100,
    comment: '想象力丰富，色彩感知能力强'
  },
  {
    name: '体能发展',
    teacher: '赵老师',
    score: 86,
    classPerformance: 4,
    homeworkCompletion: 92,
    comment: '运动协调性良好，积极参与体育活动'
  },
  {
    name: '社会交往',
    teacher: '刘老师',
    score: 90,
    classPerformance: 5,
    homeworkCompletion: 96,
    comment: '团队合作能力强，乐于助人'
  }
])

const semesterComparison = ref([
  { name: '2023年秋季', averageScore: 89.5, change: 0 },
  { name: '2023年春季', averageScore: 87.2, change: 2.3 },
  { name: '2022年秋季', averageScore: 85.8, change: 1.4 }
])

// 计算属性
const currentSemesterText = computed(() => {
  const option = semesterOptions.find(item => item.value === currentSemester.value)
  return option?.text || ''
})

const averageScore = computed(() => {
  const scores = subjectScores.value.map(subject => subject.score)
  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
})

const classRanking = computed(() => {
  return '12/35'
})

const totalSubjects = computed(() => {
  return subjectScores.value.length
})

const attendanceRate = computed(() => {
  return 96
})

// 工具函数
const getScoreLevelClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'average'
  return 'needs-improvement'
}

const getScoreLevelText = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  return '需提高'
}

const getScoreColor = (score: number) => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#1890ff'
  if (score >= 70) return '#faad14'
  return '#ff4d4f'
}

// 事件处理
const onSemesterConfirm = ({ selectedOptions }: any) => {
  currentSemester.value = selectedOptions[0]?.value || '2024-spring'
  showSemesterPicker.value = false
  loadGradesData()
}

const loadGradesData = () => {
  // 根据选择的学期加载对应的成绩数据
  showToast('加载成绩数据...')
}

// 绘制图表
const drawRadarChart = () => {
  // 这里应该使用实际的图表库，如 ECharts 或 Chart.js
  // 暂时显示占位符
  const chartElement = document.getElementById('gradesRadarChart')
  if (chartElement) {
    chartElement.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">雷达图</div>'
  }
}

const drawTrendChart = () => {
  // 这里应该使用实际的图表库
  const chartElement = document.getElementById('gradesTrendChart')
  if (chartElement) {
    chartElement.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">趋势图</div>'
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    drawRadarChart()
    drawTrendChart()
  })
})
</script>

<style lang="scss" scoped>
.grades-tab {
  padding: var(--spacing-md) 0;

  .grades-overview {
    margin: 0 16px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: var(--spacing-md);

    .overview-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-md);

      .overview-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: white;
        margin-bottom: 4px;
      }

      .overview-label {
        font-size: var(--text-xs);
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .chart-wrapper {
    padding: var(--spacing-lg);
    display: flex;
    justify-content: center;

    .chart {
      width: 100%;
      height: 200px;
      background: #f8f9fa;
      border-radius: 8px;
    }
  }

  .subjects-list {
    padding: var(--spacing-sm);

    .subject-item {
      background: white;
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .subject-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .subject-info {
          flex: 1;

          .subject-name {
            margin: 0 0 4px 0;
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color);
          }

          .subject-teacher {
            font-size: var(--text-xs);
            color: var(--van-text-color-3);
          }
        }

        .subject-score {
          text-align: right;

          .score-value {
            font-size: var(--text-2xl);
            font-weight: bold;
            color: var(--van-text-color);
          }

          .score-level {
            font-size: var(--text-xs);
            margin-top: 4px;

            &.excellent { color: #52c41a; }
            &.good { color: #1890ff; }
            &.average { color: #faad14; }
            &.needs-improvement { color: #ff4d4f; }
          }
        }
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: #f0f0f0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 12px;

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
      }

      .subject-details {
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            min-width: 60px;
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
          }

          .value {
            font-size: var(--text-sm);
            color: var(--van-text-color);
            font-weight: 500;
          }

          .comment {
            flex: 1;
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            line-height: 1.4;
            background: #f8f9fa;
            padding: var(--spacing-sm);
            border-radius: 4px;
          }
        }
      }
    }
  }

  .trend-chart {
    padding: var(--spacing-lg);
    background: white;
    margin: var(--spacing-sm);
    border-radius: 8px;

    .chart {
      width: 100%;
      height: 180px;
      background: #f8f9fa;
      border-radius: 8px;
    }
  }

  .semester-comparison {
    padding: var(--spacing-sm);

    .comparison-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md) 16px;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;

      .semester-name {
        flex: 1;
        font-size: var(--text-sm);
        color: var(--van-text-color);
      }

      .semester-score {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin-right: 12px;
      }

      .semester-change {
        font-size: var(--text-xs);
        font-weight: 500;

        &.positive {
          color: #52c41a;
        }

        &.negative {
          color: #ff4d4f;
        }
      }
    }
  }
}

:deep(.van-cell-group) {
  margin: 0 16px 16px;
}
</style>