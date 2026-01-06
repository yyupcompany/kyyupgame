<template>
  <div class="school-readiness-assessment">
    <!-- 页面头部 -->
    <div class="assessment-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Notebook /></el-icon>
          幼小衔接测评
        </h1>
        <p class="page-description">
          通过科学的评估体系，全面了解孩子的入学准备情况，包括学习能力、社交能力、自理能力等核心维度
        </p>
      </div>
    </div>

    <!-- 评估说明卡片 -->
    <div class="assessment-intro">
      <el-card class="intro-card">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>测评说明</span>
          </div>
        </template>
        <div class="intro-content">
          <div class="assessment-info">
            <h3>什么是幼小衔接测评？</h3>
            <p>幼小衔接测评是为即将进入小学的儿童设计的综合能力评估，帮助家长了解孩子的入学准备情况。</p>

            <h3>测评内容涵盖</h3>
            <el-row :gutter="20" class="assessment-dimensions">
              <el-col :span="6" v-for="dimension in assessmentDimensions" :key="dimension.key">
                <div class="dimension-item">
                  <el-icon :size="24" :color="dimension.color">
                    <component :is="dimension.icon" />
                  </el-icon>
                  <h4>{{ dimension.title }}</h4>
                  <p>{{ dimension.description }}</p>
                </div>
              </el-col>
            </el-row>

            <div class="assessment-time">
              <h3>测评信息</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="适合年龄">5-7岁</el-descriptions-item>
                <el-descriptions-item label="测评时长">20-30分钟</el-descriptions-item>
                <el-descriptions-item label="测评形式">互动游戏 + 观察评估</el-descriptions-item>
                <el-descriptions-item label="结果展示">详细分析报告 + 改进建议</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 开始测评区域 -->
    <div class="assessment-start">
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

              <el-form-item label="测评重点：">
                <el-checkbox-group v-model="assessmentForm.focusAreas">
                  <el-checkbox
                    v-for="area in focusAreas"
                    :key="area.key"
                    :label="area.key"
                  >
                    <el-icon><component :is="area.icon" /></el-icon>
                    {{ area.title }}
                  </el-checkbox>
                </el-checkbox-group>
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
                <h4>{{ record.childName }} - 幼小衔接测评</h4>
                <el-tag :type="getStatusType(record.status)">
                  {{ getStatusText(record.status) }}
                </el-tag>
              </div>
              <div class="record-info">
                <span class="date">{{ formatDate(record.createdAt) }}</span>
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
      title="幼小衔接测评样题展示"
      width="60%"
      class="sample-dialog"
    >
      <div class="sample-content">
        <div class="sample-item">
          <h4>样题1：注意力测试</h4>
          <div class="sample-question">
            <p>请观察下方的图形，找出与其他三个不同的一个：</p>
            <div class="sample-shapes">
              <div class="shape-item circle"></div>
              <div class="shape-item circle"></div>
              <div class="shape-item square"></div>
              <div class="shape-item circle"></div>
            </div>
          </div>
        </div>

        <div class="sample-item">
          <h4>样题2：逻辑思维测试</h4>
          <div class="sample-question">
            <p>请找出规律，选择下一个应该出现的图案：</p>
            <div class="sample-pattern">
              <span>△ ○ □ ○ △ ?</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Notebook, InfoFilled, VideoPlay, Clock, View,
  Reading, Brush, UserFilled, Trophy
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const assessmentForm = reactive({
  childId: '',
  focusAreas: [] as string[]
})

const childrenList = ref([])
const historyList = ref([])
const startLoading = ref(false)
const historyLoading = ref(false)
const sampleDialogVisible = ref(false)

// 评估维度
const assessmentDimensions = [
  {
    key: 'cognitive',
    title: '认知能力',
    description: '注意力、记忆力、逻辑思维',
    icon: 'Reading',
    color: 'var(--color-primary-500)'
  },
  {
    key: 'language',
    title: '语言表达',
    description: '听说能力、理解能力、表达能力',
    icon: 'ChatDotRound',
    color: 'var(--color-primary-500)'
  },
  {
    key: 'social',
    title: '社交能力',
    description: '人际交往、合作能力、情绪管理',
    icon: 'UserFilled',
    color: 'var(--color-primary-500)'
  },
  {
    key: 'selfcare',
    title: '自理能力',
    description: '生活自理、规则意识、时间管理',
    icon: 'star',
    color: 'var(--color-primary-500)'
  }
]

// 重点评估领域
const focusAreas = [
  { key: 'attention', title: '注意力', icon: 'eye' },
  { key: 'memory', title: '记忆力', icon: 'Reading' },
  { key: 'logic', title: '逻辑思维', icon: 'Brush' },
  { key: 'language', title: '语言表达', icon: 'ChatDotRound' },
  { key: 'social', title: '社交能力', icon: 'UserFilled' }
]

// 获取孩子列表
const fetchChildrenList = async () => {
  try {
    // 这里应该调用真实的API
    childrenList.value = [
      { id: '1', name: '小明', age: 6 },
      { id: '2', name: '小红', age: 5 }
    ]
  } catch (error) {
    console.error('获取孩子列表失败:', error)
  }
}

// 获取历史记录
const fetchHistoryList = async () => {
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

// 开始测评
const startAssessment = async () => {
  if (!assessmentForm.childId) {
    ElMessage.warning('请先选择要测评的孩子')
    return
  }

  startLoading.value = true
  try {
    // 调用开始测评的API
    const response = await fetch('/api/assessment/start-school-readiness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        childId: assessmentForm.childId,
        assessmentType: 'school-readiness',
        focusAreas: assessmentForm.focusAreas
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

// 查看样题
const viewSample = () => {
  sampleDialogVisible.value = true
}

// 查看报告
const viewReport = (record: any) => {
  if (record.status === 'completed') {
    router.push(`/parent-center/assessment/report/${record.id}`)
  } else {
    ElMessage.info('测评未完成，暂无报告')
  }
}

// 刷新历史记录
const refreshHistory = () => {
  fetchHistoryList()
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'info',
    'in-progress': 'warning',
    'completed': 'success',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待开始',
    'in-progress': '进行中',
    'completed': '已完成',
    'failed': '已失败'
  }
  return statusMap[status] || status
}

// 获取分数颜色
const getScoreColor = (score: number) => {
  if (score >= 80) return 'var(--color-primary-500)'
  if (score >= 60) return 'var(--color-primary-500)'
  return 'var(--color-primary-500)'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  fetchChildrenList()
  fetchHistoryList()
})
</script>

<style scoped lang="scss">
.school-readiness-assessment {
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

  .assessment-intro {
    margin-bottom: 32px;

    .intro-card {
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

      .intro-content {
        .assessment-info {
          h3 {
            color: var(--color-primary-500);
            margin-bottom: var(--spacing-md);
            margin-top: var(--spacing-2xl);

            &:first-child {
              margin-top: 0;
            }
          }

          p {
            color: #666;
            line-height: 1.6;
            margin-bottom: var(--spacing-lg);
          }

          .assessment-dimensions {
            margin: var(--spacing-2xl) 0;

            .dimension-item {
              text-align: center;
              padding: var(--spacing-xl);
              border: var(--spacing-xs) solid var(--color-primary-500);
              border-radius: var(--spacing-sm);
              transition: all 0.3s ease;
              width: 100%;
              max-width: 100%;
              overflow: hidden;

              &:hover {
                border-color: var(--color-primary-500);
                box-shadow: 0 2px 8px var(--color-primary-500);
              }

              h4 {
                color: var(--color-primary-500);
                margin: var(--spacing-md) 0 8px 0;
                font-size: var(--spacing-lg);
                width: 100%;
                word-wrap: break-word;
                word-break: keep-word;
                overflow-wrap: break-word;
              }

              p {
                font-size: var(--spacing-lg);
                color: #666;
                margin: 0;
                line-height: 1.4;
                width: 100%;
                word-wrap: break-word;
                word-break: keep-word;
                overflow-wrap: break-word;
                white-space: normal;
              }
            }
          }

          .assessment-time {
            margin-top: var(--spacing-2xl);
          }
        }
      }
    }
  }

  .assessment-start {
    margin-bottom: 32px;

    .start-card {
      border-radius: var(--spacing-md);
      box-shadow: 0 4px 12px var(--color-primary-500);

      .start-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 40px;

        .start-form {
          flex: 1;

          .el-checkbox-group {
            .el-checkbox {
              margin-right: var(--spacing-xl);
              margin-bottom: var(--spacing-md);

              .el-icon {
                margin-right: var(--spacing-xs);
              }
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
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
              width: 100%;
              gap: var(--spacing-sm);

              span {
                word-wrap: break-word;
                word-break: keep-word;
                overflow-wrap: break-word;
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
            width: 100%;
            word-wrap: break-word;
            word-break: keep-word;
            overflow-wrap: break-word;
            white-space: normal;
          }

          .sample-shapes {
            display: flex;
            gap: var(--spacing-xl);
            justify-content: center;
            margin-top: var(--spacing-lg);
            flex-wrap: wrap;
            width: 100%;

            .shape-item {
              width: 40px;
              height: 40px;
              flex-shrink: 0;

              &.circle {
                border-radius: 50%;
                background: var(--color-primary-500);
              }

              &.square {
                background: var(--color-primary-500);
              }
            }
          }

          .sample-pattern {
            text-align: center;
            font-size: var(--spacing-2xl);
            font-weight: bold;
            color: var(--color-primary-500);
            margin-top: var(--spacing-lg);
            width: 100%;
            word-wrap: break-word;
            word-break: keep-word;
            overflow-wrap: break-word;
            white-space: normal;
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
  .school-readiness-assessment {
    padding: var(--spacing-lg);

    .assessment-header {
      .page-title {
        font-size: var(--spacing-2xl);
      }

      .page-description {
        font-size: var(--spacing-lg);
      }
    }

    .assessment-start {
      .start-content {
        flex-direction: column;
        gap: var(--spacing-xl);

        .start-actions {
          flex-direction: row;
          justify-content: center;
        }
      }
    }

    .assessment-dimensions {
      grid-template-columns: repeat(2, 1fr) !important;
    }

    .history-list {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>