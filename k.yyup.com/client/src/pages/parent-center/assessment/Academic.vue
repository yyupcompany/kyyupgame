<template>
  <div class="academic-assessment">
    <!-- 页面头部 -->
    <div class="assessment-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Reading /></el-icon>
          学科测评
        </h1>
        <p class="page-description">
          针对1-6年级学生的学科能力测评，涵盖语文、数学、英语等主要学科，全面评估学科知识掌握情况
        </p>
      </div>
    </div>

    <!-- 年级选择 -->
    <div class="grade-selection">
      <el-card class="selection-card">
        <template #header>
          <div class="card-header">
            <el-icon><Notebook /></el-icon>
            <span>选择年级</span>
          </div>
        </template>
        <div class="grade-content">
          <el-radio-group v-model="selectedGrade" @change="onGradeChange">
            <el-radio-button
              v-for="grade in grades"
              :key="grade.value"
              :label="grade.value"
            >
              {{ grade.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </el-card>
    </div>

    <!-- 学科选择 -->
    <div class="subject-selection" v-if="selectedGrade">
      <el-card class="selection-card">
        <template #header>
          <div class="card-header">
            <el-icon><Reading /></el-icon>
            <span>选择学科</span>
          </div>
        </template>
        <div class="subject-content">
          <el-row :gutter="20">
            <el-col
              :span="6"
              v-for="subject in subjects"
              :key="subject.key"
            >
              <div
                class="subject-card"
                :class="{ active: selectedSubject === subject.key }"
                @click="selectSubject(subject)"
              >
                <div class="subject-icon">
                  <el-icon :size="32" :color="subject.color">
                    <component :is="subject.icon" />
                  </el-icon>
                </div>
                <h3>{{ subject.name }}</h3>
                <p>{{ subject.description }}</p>
                <div class="subject-status" v-if="selectedSubject === subject.key">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 测评详情 -->
    <div class="assessment-details" v-if="selectedGrade && selectedSubject">
      <el-card class="details-card">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>测评详情</span>
          </div>
        </template>
        <div class="details-content">
          <div class="assessment-info">
            <h3>{{ getCurrentSubjectInfo().name }} - {{ getCurrentGradeInfo().label }}测评</h3>
            <p>{{ getCurrentSubjectInfo().fullDescription }}</p>

            <el-row :gutter="20" class="assessment-stats">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ getCurrentSubjectInfo().questionCount }}</div>
                  <div class="stat-label">题目数量</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ getCurrentSubjectInfo().duration }}分钟</div>
                  <div class="stat-label">测评时长</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ getCurrentSubjectInfo().difficulty }}</div>
                  <div class="stat-label">难度等级</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ getCurrentSubjectInfo().coverage }}</div>
                  <div class="stat-label">知识点覆盖</div>
                </div>
              </el-col>
            </el-row>

            <div class="knowledge-points">
              <h4>知识点覆盖</h4>
              <div class="points-list">
                <el-tag
                  v-for="point in getCurrentSubjectInfo().knowledgePoints"
                  :key="point"
                  type="info"
                  class="knowledge-tag"
                >
                  {{ point }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 开始测评 -->
    <div class="assessment-start" v-if="selectedGrade && selectedSubject">
      <el-card class="start-card">
        <template #header>
          <div class="card-header">
            <el-icon><VideoPlay /></el-icon>
            <span>开始测评</span>
          </div>
        </template>
        <div class="start-content">
          <div class="start-form">
            <el-form :model="assessmentForm" label-width="120px">
              <el-form-item label="选择孩子：">
                <el-select
                  v-model="assessmentForm.childId"
                  placeholder="请选择要测评的孩子"
                  style="width: 300px"
                >
                  <el-option
                    v-for="child in childrenList"
                    :key="child.id"
                    :label="child.name"
                    :value="child.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="测评模式：">
                <el-radio-group v-model="assessmentForm.mode">
                  <el-radio label="practice">练习模式</el-radio>
                  <el-radio label="test">正式测评</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>

          <div class="start-actions">
            <el-button
              type="primary"
              size="large"
              :disabled="!assessmentForm.childId"
              @click="startAssessment"
              :loading="startLoading"
            >
              <el-icon><VideoPlay /></el-icon>
              开始测评
            </el-button>

            <el-button
              size="large"
              @click="viewSample"
            >
              <el-icon><View /></el-icon>
              查看样题
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 历史记录 -->
    <div class="assessment-history">
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <el-icon><Clock /></el-icon>
            <span>测评历史</span>
            <el-button
              type="text"
              @click="refreshHistory"
              :loading="historyLoading"
            >
              刷新
            </el-button>
          </div>
        </template>
        <div class="history-content">
          <el-empty v-if="historyList.length === 0" description="暂无测评历史" />
          <div v-else class="history-list">
            <div
              v-for="record in historyList"
              :key="record.id"
              class="history-item"
              @click="viewReport(record)"
            >
              <div class="record-header">
                <h4>{{ record.childName }} - {{ getSubjectName(record.subject) }}</h4>
                <el-tag :type="getStatusType(record.status)">
                  {{ getStatusText(record.status) }}
                </el-tag>
              </div>
              <div class="record-info">
                <span class="date">{{ formatDate(record.createdAt) }}</span>
                <span class="grade">{{ getGradeName(record.grade) }}</span>
                <span class="duration">耗时：{{ record.duration }}分钟</span>
              </div>
              <div class="record-score" v-if="record.score">
                <el-progress
                  :percentage="record.score"
                  :color="getScoreColor(record.score)"
                  :stroke-width="8"
                />
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 样题弹窗 -->
    <el-dialog
      v-model="sampleDialogVisible"
      title="学科测评样题展示"
      width="60%"
      class="sample-dialog"
    >
      <div class="sample-content">
        <div class="sample-item" v-if="selectedSubject === 'chinese'">
          <h4>语文样题</h4>
          <div class="sample-question">
            <p>请选择下列词语的正确读音：</p>
            <div class="sample-options">
              <el-radio-group>
                <el-radio label="option1">学习 (xué xí)</el-radio>
                <el-radio label="option2">学习 (xué xi)</el-radio>
                <el-radio label="option3">学习 (xuè xí)</el-radio>
                <el-radio label="option4">学习 (xuě xi)</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>

        <div class="sample-item" v-else-if="selectedSubject === 'math'">
          <h4>数学样题</h4>
          <div class="sample-question">
            <p>计算：25 + 37 = ?</p>
            <div class="sample-options">
              <el-radio-group>
                <el-radio label="option1">52</el-radio>
                <el-radio label="option2">62</el-radio>
                <el-radio label="option3">72</el-radio>
                <el-radio label="option4">42</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>

        <div class="sample-item" v-else-if="selectedSubject === 'english'">
          <h4>英语样题</h4>
          <div class="sample-question">
            <p>What color is the sky?</p>
            <div class="sample-options">
              <el-radio-group>
                <el-radio label="option1">Red</el-radio>
                <el-radio label="option2">Blue</el-radio>
                <el-radio label="option3">Green</el-radio>
                <el-radio label="option4">Yellow</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Reading, Notebook, InfoFilled, VideoPlay, Clock, View,
  Check, ChatDotRound, Calculator, Brush
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const selectedGrade = ref('')
const selectedSubject = ref('')
const assessmentForm = reactive({
  childId: '',
  mode: 'practice'
})

const childrenList = ref([])
const historyList = ref([])
const startLoading = ref(false)
const historyLoading = ref(false)
const sampleDialogVisible = ref(false)

// 年级选项
const grades = [
  { value: 'grade1', label: '一年级' },
  { value: 'grade2', label: '二年级' },
  { value: 'grade3', label: '三年级' },
  { value: 'grade4', label: '四年级' },
  { value: 'grade5', label: '五年级' },
  { value: 'grade6', label: '六年级' }
]

// 学科选项
const subjects = [
  {
    key: 'chinese',
    name: '语文',
    description: '字词句篇、阅读理解',
    icon: 'ChatDotRound',
    color: 'var(--color-primary-500)',
    fullDescription: '测评学生的字词掌握、阅读理解、写作表达等语文核心素养',
    questionCount: 40,
    duration: 45,
    difficulty: '中等',
    coverage: '80%',
    knowledgePoints: ['字词认识', '句子理解', '阅读理解', '写作表达']
  },
  {
    key: 'math',
    name: '数学',
    description: '计算、逻辑、应用题',
    icon: 'Calculator',
    color: 'var(--color-primary-500)',
    fullDescription: '测评学生的计算能力、逻辑思维、空间想象和解决实际问题的数学能力',
    questionCount: 35,
    duration: 40,
    difficulty: '中等偏上',
    coverage: '85%',
    knowledgePoints: ['数与代数', '图形与几何', '统计与概率', '解决问题']
  },
  {
    key: 'english',
    name: '英语',
    description: '单词、语法、阅读',
    icon: 'Reading',
    color: 'var(--color-primary-500)',
    fullDescription: '测评学生的英语词汇量、语法掌握、阅读理解和综合运用能力',
    questionCount: 45,
    duration: 50,
    difficulty: '中等',
    coverage: '75%',
    knowledgePoints: ['词汇运用', '语法知识', '阅读理解', '书面表达']
  },
  {
    key: 'science',
    name: '科学',
    description: '自然、实验、探究',
    icon: 'eye',
    color: 'var(--color-primary-500)',
    fullDescription: '测评学生的科学知识掌握、实验操作、科学探究和创新能力',
    questionCount: 30,
    duration: 35,
    difficulty: '中等',
    coverage: '70%',
    knowledgePoints: ['生命科学', '物质科学', '地球科学', '科学探究']
  }
]

// 计算属性
const getCurrentGradeInfo = () => {
  return grades.find(g => g.value === selectedGrade.value) || { label: '未选择年级' }
}

const getCurrentSubjectInfo = () => {
  return subjects.find(s => s.key === selectedSubject.value) || {
    name: '未选择学科',
    knowledgePoints: []
  }
}

// 方法
const onGradeChange = () => {
  selectedSubject.value = ''
}

const selectSubject = (subject: any) => {
  selectedSubject.value = subject.key
}

const startAssessment = async () => {
  if (!assessmentForm.childId) {
    ElMessage.warning('请先选择要测评的孩子')
    return
  }

  if (!selectedGrade.value || !selectedSubject.value) {
    ElMessage.warning('请先选择年级和学科')
    return
  }

  startLoading.value = true
  try {
    // 调用开始测评的API
    const response = await fetch('/api/assessment/start-academic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        childId: assessmentForm.childId,
        grade: selectedGrade.value,
        subject: selectedSubject.value,
        mode: assessmentForm.mode
      })
    })

    if (response.ok) {
      const data = await response.json()
      ElMessage.success('测评开始成功')
      router.push(`/parent-center/assessment/doing/${data.recordId}`)
    } else {
      throw new Error('开始测评失败')
    }
  } catch (error) {
    console.error('开始测评失败:', error)
    ElMessage.error('开始测评失败，请重试')
  } finally {
    startLoading.value = false
  }
}

const viewSample = () => {
  if (!selectedSubject.value) {
    ElMessage.warning('请先选择学科')
    return
  }
  sampleDialogVisible.value = true
}

const viewReport = (record: any) => {
  if (record.status === 'completed') {
    router.push(`/parent-center/assessment/report/${record.id}`)
  } else {
    ElMessage.info('测评未完成，暂无报告')
  }
}

const refreshHistory = async () => {
  historyLoading.value = true
  try {
    // 这里应该调用真实的API
    historyList.value = []
  } catch (error) {
    console.error('获取历史记录失败:', error)
  } finally {
    historyLoading.value = false
  }
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'info',
    'in-progress': 'warning',
    'completed': 'success',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待开始',
    'in-progress': '进行中',
    'completed': '已完成',
    'failed': '已失败'
  }
  return statusMap[status] || status
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'var(--color-primary-500)'
  if (score >= 80) return 'var(--color-primary-500)'
  if (score >= 60) return 'var(--color-primary-500)'
  return 'var(--color-primary-500)'
}

const getSubjectName = (subject: string) => {
  const subjectMap: Record<string, string> = {
    'chinese': '语文',
    'math': '数学',
    'english': '英语',
    'science': '科学'
  }
  return subjectMap[subject] || subject
}

const getGradeName = (grade: string) => {
  const gradeMap: Record<string, string> = {
    'grade1': '一年级',
    'grade2': '二年级',
    'grade3': '三年级',
    'grade4': '四年级',
    'grade5': '五年级',
    'grade6': '六年级'
  }
  return gradeMap[grade] || grade
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.academic-assessment {
  padding: var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto;

  .assessment-header {
    margin-bottom: 32px;
    text-align: center;

    .page-title {
      font-size: var(--text-3xl);
      font-weight: var(--font-bold);
      color: var(--primary-color);
      margin-bottom: var(--spacing-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);

      .el-icon {
        color: var(--color-primary-500);
      }
    }

    .page-description {
      font-size: var(--spacing-lg);
      color: #666;
      line-height: 1.6;
    }
  }

  .grade-selection,
  .subject-selection,
  .assessment-details,
  .assessment-start {
    margin-bottom: 32px;

    .selection-card,
    .details-card,
    .start-card {
      border-radius: var(--spacing-md);
      box-shadow: 0 4px 12px var(--color-primary-500);

      .card-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: bold;
        font-size: var(--spacing-xl);

        .el-icon {
          color: var(--color-primary-500);
        }
      }

      .grade-content {
        text-align: center;

        .el-radio-group {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--spacing-md);

          .el-radio-button {
            margin-bottom: var(--spacing-md);
          }
        }
      }

      .subject-content {
        .subject-card {
          border: var(--spacing-xs) solid var(--color-primary-500);
          border-radius: var(--spacing-md);
          padding: var(--spacing-2xl);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          width: 100%;
          max-width: 100%;
          overflow: hidden;

          &:hover {
            border-color: var(--color-primary-500);
            box-shadow: 0 4px 12px var(--color-primary-500);
          }

          &.active {
            border-color: var(--color-primary-500);
            background-color: var(--color-primary-500);

            .subject-status {
              position: absolute;
              top: var(--spacing-md);
              right: var(--spacing-md);
              background: var(--color-primary-500);
              color: white;
              border-radius: 50%;
              width: var(--spacing-2xl);
              height: var(--spacing-2xl);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
          }

          .subject-icon {
            margin-bottom: var(--spacing-lg);
          }

          h3 {
            color: var(--color-primary-500);
            margin: var(--spacing-md) 0 8px 0;
            font-size: var(--spacing-xl);
            width: 100%;
            word-wrap: break-word;
            word-break: keep-word;
            overflow-wrap: break-word;
          }

          p {
            color: #666;
            font-size: var(--spacing-lg);
            margin: 0;
            width: 100%;
            word-wrap: break-word;
            word-break: keep-word;
            overflow-wrap: break-word;
            white-space: normal;
          }
        }
      }

      .details-content {
        .assessment-info {
          h3 {
            color: var(--color-primary-500);
            margin-bottom: var(--spacing-lg);
          }

          p {
            color: #666;
            line-height: 1.6;
            margin-bottom: var(--spacing-2xl);
          }

          .assessment-stats {
            margin-bottom: var(--spacing-2xl);

            .stat-item {
              text-align: center;
              padding: var(--spacing-lg);
              border: var(--spacing-xs) solid var(--color-primary-500);
              border-radius: var(--spacing-sm);

              .stat-value {
                font-size: var(--spacing-2xl);
                font-weight: bold;
                color: var(--color-primary-500);
                margin-bottom: var(--spacing-xs);
              }

              .stat-label {
                font-size: var(--spacing-lg);
                color: #666;
              }
            }
          }

          .knowledge-points {
            h4 {
              color: var(--color-primary-500);
              margin-bottom: var(--spacing-lg);
              width: 100%;
              word-wrap: break-word;
              word-break: keep-word;
              overflow-wrap: break-word;
            }

            .points-list {
              display: flex;
              flex-wrap: wrap;
              gap: var(--spacing-sm);
              width: 100%;

              .knowledge-tag {
                margin-bottom: var(--spacing-sm);
                max-width: 100%;
              }
            }
          }
        }
      }

      .start-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 40px;

        .start-form {
          flex: 1;

          .el-radio-group {
            .el-radio {
              margin-right: var(--spacing-xl);
            }
          }
        }

        .start-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          align-items: center;

          .el-button {
            min-width: 140px;
          }
        }
      }
    }
  }

  .assessment-history {
    .history-card {
      border-radius: var(--spacing-md);
      box-shadow: 0 4px 12px var(--color-primary-500);

      .history-content {
        .history-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--spacing-lg);

          .history-item {
            border: var(--spacing-xs) solid var(--color-primary-500);
            border-radius: var(--spacing-sm);
            padding: var(--spacing-xl);
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            max-width: 100%;
            overflow: hidden;

            &:hover {
              border-color: var(--color-primary-500);
              box-shadow: 0 2px 8px var(--color-primary-500);
            }

            .record-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--spacing-md);
              gap: var(--spacing-md);

              h4 {
                margin: 0;
                color: var(--color-primary-500);
                font-size: var(--spacing-lg);
                flex: 1;
                word-wrap: break-word;
                word-break: keep-word;
                overflow-wrap: break-word;
                white-space: normal;
              }
            }

            .record-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--spacing-lg);
              font-size: var(--spacing-lg);
              color: #666;
              flex-wrap: wrap;
              gap: var(--spacing-sm);

              span {
                word-wrap: break-word;
                word-break: keep-word;
                overflow-wrap: break-word;

                &:not(:last-child) {
                  position: relative;
                  padding-right: var(--spacing-sm);
                  margin-right: var(--spacing-sm);
                  border-right: var(--spacing-xs) solid var(--color-primary-500);
                }
              }
            }

            .record-score {
              width: 100%;
              overflow: hidden;

              .el-progress {
                width: 100%;

                :deep(.el-progress__text) {
                  font-size: var(--spacing-lg) !important;
                }
              }
            }
          }
        }
      }
    }
  }

  .sample-dialog {
    .sample-content {
      width: 100%;
      max-width: 100%;
      overflow: hidden;

      .sample-item {
        margin-bottom: 32px;
        width: 100%;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          color: var(--color-primary-500);
          margin-bottom: var(--spacing-lg);
          width: 100%;
          word-wrap: break-word;
          word-break: keep-word;
          overflow-wrap: break-word;
        }

        .sample-question {
          background: var(--color-primary-500);
          padding: var(--spacing-xl);
          border-radius: var(--spacing-sm);
          width: 100%;
          max-width: 100%;
          overflow: hidden;

          p {
            margin-bottom: var(--spacing-lg);
            color: #666;
            font-size: var(--spacing-lg);
            width: 100%;
            word-wrap: break-word;
            word-break: keep-word;
            overflow-wrap: break-word;
            white-space: normal;
          }

          .sample-options {
            width: 100%;

            .el-radio-group {
              display: flex;
              flex-direction: column;
              gap: var(--spacing-md);
              width: 100%;

              .el-radio {
                margin-right: 0;
                width: 100%;
                word-wrap: break-word;
                word-break: keep-word;
                overflow-wrap: break-word;
              }
            }
          }
        }
      }
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .el-icon {
      color: var(--color-primary-500);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .academic-assessment {
    padding: var(--spacing-lg);

    .assessment-header {
      .page-title {
        font-size: var(--spacing-2xl);
      }

      .page-description {
        font-size: var(--spacing-lg);
      }
    }

    .subject-content {
      .el-row {
        .el-col {
          margin-bottom: var(--spacing-lg);
        }
      }
    }

    .start-content {
      flex-direction: column;
      gap: var(--spacing-xl);

      .start-actions {
        flex-direction: row;
        justify-content: center;
      }
    }

    .history-list {
      grid-template-columns: 1fr !important;
    }

    .assessment-stats {
      .el-col {
        margin-bottom: var(--spacing-lg);
      }
    }
  }
}
</style>