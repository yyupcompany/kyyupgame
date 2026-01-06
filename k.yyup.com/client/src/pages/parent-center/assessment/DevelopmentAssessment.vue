<template>
  <div class="development-assessment">
    <!-- 页面头部 -->
    <div class="assessment-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><TrendCharts /></el-icon>
          2-6岁儿童发育商测评
        </h1>
        <p class="page-description">
          通过科学的评估体系，全面了解2-6岁儿童在五大能区的发展情况，助力家长科学育儿
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
            <h3>什么是发育商测评？</h3>
            <p>发育商测评是评估0-6岁儿童神经心理发育水平的科学方法，通过五大能区的综合评估，了解孩子的发育情况。</p>

            <h3>测评内容涵盖</h3>
            <el-row :gutter="20" class="assessment-dimensions">
              <el-col :span="12" v-for="dimension in assessmentDimensions" :key="dimension.key">
                <div class="dimension-item">
                  <div class="dimension-icon" :style="{ color: dimension.color }">
                    <span v-if="dimension.key === 'gross'">🏃</span>
                    <span v-else-if="dimension.key === 'fine'">✏️</span>
                    <span v-else-if="dimension.key === 'language'">💬</span>
                    <span v-else-if="dimension.key === 'social'">👥</span>
                    <span v-else>🧠</span>
                  </div>
                  <h4>{{ dimension.title }}</h4>
                  <p>{{ dimension.description }}</p>
                </div>
              </el-col>
            </el-row>

            <div class="assessment-time">
              <h3>测评信息</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="适合年龄">2-6岁</el-descriptions-item>
                <el-descriptions-item label="测评时长">15-25分钟</el-descriptions-item>
                <el-descriptions-item label="测评形式">互动游戏 + 观察评估</el-descriptions-item>
                <el-descriptions-item label="结果展示">发育商指数 + 能力分析报告</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 开始测评区域 -->
    <div class="start-assessment">
      <el-card class="start-card">
        <template #header>
          <div class="card-header">
            <el-icon><Flag /></el-icon>
            <span>开始测评</span>
          </div>
        </template>
        <div class="start-content">
          <div class="assessment-features">
            <div class="feature-item">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
              <span>专业科学的评估体系</span>
            </div>
            <div class="feature-item">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
              <span>趣味互动的测评方式</span>
            </div>
            <div class="feature-item">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
              <span>AI智能分析报告</span>
            </div>
            <div class="feature-item">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
              <span>个性化成长建议</span>
            </div>
          </div>

          <div class="start-actions">
            <el-button
              type="primary"
              size="large"
              @click="startAssessment"
              :loading="starting"
            >
              <el-icon><VideoPlay /></el-icon>
              立即开始测评
            </el-button>
            <el-button size="large" @click="viewReports">
              <el-icon><Document /></el-icon>
              查看历史报告
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 测评历史记录 -->
    <div class="assessment-history" v-if="historyData.length > 0">
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <el-icon><Clock /></el-icon>
            <span>最近测评记录</span>
            <el-button type="text" @click="viewAllHistory">查看全部</el-button>
          </div>
        </template>
        <div class="history-content">
          <el-table :data="historyData" style="width: 100%">
            <el-table-column prop="date" label="测评日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.date) }}
              </template>
            </el-table-column>
            <el-table-column prop="childName" label="孩子姓名" width="100" />
            <el-table-column prop="age" label="测评年龄" width="100">
              <template #default="{ row }">
                {{ row.age }}个月
              </template>
            </el-table-column>
            <el-table-column prop="dq" label="发育商" width="100">
              <template #default="{ row }">
                <el-tag :type="getDQType(row.dq)">{{ row.dq }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="测评状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
                  {{ row.status === 'completed' ? '已完成' : '进行中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewReport(row.id)">
                  查看报告
                </el-button>
                <el-button v-if="row.status !== 'completed'" type="primary" link @click="continueAssessment(row.id)">
                  继续测评
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  TrendCharts, InfoFilled, Flag, CircleCheck, VideoPlay,
  Document, Clock
} from '@element-plus/icons-vue'

const router = useRouter()

const starting = ref(false)
const historyData = ref([])

// 测评维度配置
const assessmentDimensions = [
  {
    key: 'gross',
    title: '大运动能力',
    description: '身体协调性、平衡能力、爬行、行走、跑跳等大肌肉发展',
    icon: 'IconParkRunning',
    color: '#409EFF'
  },
  {
    key: 'fine',
    title: '精细动作',
    description: '手眼协调、手指灵活性、抓握能力、书写准备等小肌肉发展',
    icon: 'EditPen',
    color: '#67C23A'
  },
  {
    key: 'language',
    title: '语言能力',
    description: '语言理解、表达能力、词汇量、语法结构等语言发展',
    icon: 'ChatDotRound',
    color: '#E6A23C'
  },
  {
    key: 'social',
    title: '社会适应',
    description: '人际交往、情绪管理、规则意识、独立性等社会能力发展',
    icon: 'User',
    color: '#F56C6C'
  },
  {
    key: 'cognitive',
    title: '认知能力',
    description: '注意力、记忆力、思维能力、问题解决等认知发展',
    icon: 'View',
    color: '#909399'
  }
]

// 开始测评
const startAssessment = async () => {
  try {
    starting.value = true
    // 跳转到测评开始页面
    await router.push('/parent-center/assessment/start')
  } catch (error) {
    ElMessage.error('跳转失败，请重试')
  } finally {
    starting.value = false
  }
}

// 查看历史报告
const viewReports = () => {
  router.push('/parent-center/assessment/growth-trajectory')
}

// 查看全部历史
const viewAllHistory = () => {
  router.push('/parent-center/assessment/growth-trajectory')
}

// 查看报告
const viewReport = (id: string) => {
  router.push(`/parent-center/assessment/report/${id}`)
}

// 继续测评
const continueAssessment = (id: string) => {
  router.push(`/parent-center/assessment/doing/${id}`)
}

// 获取发育商等级类型
const getDQType = (dq: number) => {
  if (dq >= 130) return 'success'
  if (dq >= 110) return ''
  if (dq >= 90) return 'warning'
  return 'danger'
}

// 格式化日期
const formatDate = (date: string) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}-${d.getDate()}`
}

// 加载历史数据
const loadHistory = async () => {
  try {
    // 模拟历史数据，实际应该从API获取
    historyData.value = [
      {
        id: '1',
        date: '2024-01-15',
        childName: '小明',
        age: 48,
        dq: 115,
        status: 'completed'
      },
      {
        id: '2',
        date: '2024-01-10',
        childName: '小明',
        age: 47,
        dq: 112,
        status: 'completed'
      }
    ]
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.development-assessment {
  padding: var(--spacing-xl);
  max-width: var(--container-2xl);
  margin: 0 auto;

  .assessment-header {
    margin-bottom: var(--spacing-xl);
    text-align: center;

    .header-content {
      .page-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        font-size: var(--text-4xl);
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
      }

      .page-description {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        max-width: 800px;
        margin: 0 auto;
        line-height: 1.6;
        width: 100%;
        word-wrap: break-word;
        word-break: keep-word;
        overflow-wrap: break-word;
        white-space: normal;
      }
    }
  }

  .assessment-intro {
    margin-bottom: var(--spacing-xl);

    .intro-card {
      .card-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        font-size: var(--text-lg);
      }

      .intro-content {
        .assessment-info {
          h3 {
            color: var(--text-primary);
            margin-bottom: var(--spacing-md);
          }

          p {
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: var(--spacing-xl);
          }

          .assessment-dimensions {
            margin-bottom: var(--spacing-xl);

            .dimension-item {
              text-align: center;
              padding: var(--spacing-lg);
              background: var(--bg-hover);
              border-radius: var(--radius-md);
              height: 100%;
              width: 100%;
              max-width: 100%;
              overflow: hidden;

              .dimension-icon {
                font-size: var(--text-2xl);
                margin-bottom: var(--spacing-md);
                display: flex;
                justify-content: center;
                line-height: 1;
              }

              h4 {
                color: var(--text-primary);
                margin-bottom: var(--spacing-sm);
                font-size: var(--text-base);
                width: 100%;
                word-wrap: break-word;
                word-break: keep-word;
                overflow-wrap: break-word;
              }

              p {
                color: var(--text-secondary);
                font-size: var(--text-sm);
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
            h3 {
              color: var(--text-primary);
              margin-bottom: var(--spacing-md);
            }
          }
        }
      }
    }
  }

  .start-assessment {
    margin-bottom: var(--spacing-xl);

    .start-card {
      .card-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        font-size: var(--text-lg);
      }

      .start-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xl);

        .assessment-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
          width: 100%;
          max-width: 600px;

          .feature-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            color: var(--text-primary);
            font-size: var(--text-base);
            width: 100%;

            span {
              word-wrap: break-word;
              word-break: keep-word;
              overflow-wrap: break-word;
              white-space: normal;
            }
          }
        }

        .start-actions {
          display: flex;
          gap: var(--spacing-lg);
        }
      }
    }
  }

  .assessment-history {
    .history-card {
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        font-size: var(--text-lg);

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .development-assessment {
    .assessment-intro {
      .assessment-dimensions {
        grid-template-columns: 1fr !important;
      }
    }

    .start-assessment {
      .start-content {
        .assessment-features {
          grid-template-columns: 1fr !important;
        }

        .start-actions {
          flex-direction: column;
          width: 100%;

          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>