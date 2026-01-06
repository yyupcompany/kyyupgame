<template>
  <div class="ai-predictions-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>AI预测分析</h1>
          <p>基于历史数据进行趋势预测和风险评估，为决策提供科学依据</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="createPrediction">
            <el-icon><Plus /></el-icon>
            创建预测
          </el-button>
          <el-button @click="refreshPredictions">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">🔮</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalPredictions }}</div>
          <div class="stat-label">总预测任务</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>18.5%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgAccuracy }}%</div>
          <div class="stat-label">平均准确率</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>5.2%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activePredictions }}</div>
          <div class="stat-label">活跃预测</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>12.3%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgProcessTime }}s</div>
          <div class="stat-label">平均处理时间</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon down"><ArrowDown /></el-icon>
          <span>8.7%</span>
        </div>
      </div>
    </div>

    <!-- 预测类型 -->
    <div class="prediction-types">
      <h2>预测分析类型</h2>
      <div class="types-grid">
        <div class="type-card" @click="navigateTo('/ai/analytics/predictive-analytics')">
          <div class="type-icon">👨‍🎓</div>
          <div class="type-content">
            <h3>学生成绩预测</h3>
            <p>基于学习行为预测学生成绩趋势</p>
            <div class="type-stats">
              <span>准确率: 94.2%</span>
              <span>12个模型</span>
            </div>
          </div>
        </div>
        <div class="type-card" @click="navigateTo('/ai/predictive/maintenance-optimizer')">
          <div class="type-icon">📊</div>
          <div class="type-content">
            <h3>招生需求预测</h3>
            <p>分析市场趋势预测招生需求</p>
            <div class="type-stats">
              <span>准确率: 91.7%</span>
              <span>8个模型</span>
            </div>
          </div>
        </div>
        <div class="type-card" @click="navigateTo('/ai/deep-learning/prediction-engine')">
          <div class="type-icon">⚠️</div>
          <div class="type-content">
            <h3>风险评估预测</h3>
            <p>预测学生学习风险和预警</p>
            <div class="type-stats">
              <span>准确率: 96.1%</span>
              <span>6个模型</span>
            </div>
          </div>
        </div>
        <div class="type-card" @click="navigateTo('/teacher/performance/ranking')">
          <div class="type-icon">👩‍🏫</div>
          <div class="type-content">
            <h3>教师绩效预测</h3>
            <p>预测教师教学效果和发展趋势</p>
            <div class="type-stats">
              <span>准确率: 89.3%</span>
              <span>4个模型</span>
            </div>
          </div>
        </div>
        <div class="type-card" @click="navigateTo('/customer/analytics/CustomerAnalytics')">
          <div class="type-icon">👥</div>
          <div class="type-content">
            <h3>客户行为预测</h3>
            <p>预测客户需求和满意度变化</p>
            <div class="type-stats">
              <span>准确率: 87.8%</span>
              <span>5个模型</span>
            </div>
          </div>
        </div>
        <div class="type-card" @click="navigateTo('/ai/visualization/3d-analytics')">
          <div class="type-icon">💰</div>
          <div class="type-content">
            <h3>财务预测分析</h3>
            <p>预测收入、支出和财务风险</p>
            <div class="type-stats">
              <span>准确率: 92.5%</span>
              <span>7个模型</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近预测任务 -->
    <div class="recent-predictions">
      <div class="section-header">
        <h2>最近预测任务</h2>
        <el-button text @click="viewAllPredictions">查看全部</el-button>
      </div>
      
      <div class="predictions-list">
        <div v-for="prediction in recentPredictions" :key="prediction.id" class="prediction-item">
          <div class="prediction-info">
            <div class="prediction-title">{{ prediction.title }}</div>
            <div class="prediction-desc">{{ prediction.description }}</div>
            <div class="prediction-meta">
              <span class="prediction-type">{{ prediction.type }}</span>
              <span class="prediction-time">{{ prediction.createdAt }}</span>
            </div>
          </div>
          
          <div class="prediction-status">
            <el-tag :type="getStatusType(prediction.status)">{{ prediction.status }}</el-tag>
          </div>
          
          <div class="prediction-metrics">
            <div class="metric">
              <span class="metric-label">准确率</span>
              <span class="metric-value">{{ prediction.accuracy }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">置信度</span>
              <span class="metric-value">{{ prediction.confidence }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">处理时间</span>
              <span class="metric-value">{{ prediction.processTime }}s</span>
            </div>
          </div>
          
          <div class="prediction-actions">
            <el-button size="small" @click="viewPrediction(prediction.id)">查看</el-button>
            <el-button size="small" type="primary" @click="runPrediction(prediction.id)">重新预测</el-button>
            <el-button size="small" @click="exportPrediction(prediction.id)">导出</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预测趋势图表 -->
    <div class="prediction-charts">
      <h2>预测趋势分析</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <h3>预测准确率趋势</h3>
          <div class="chart-placeholder">
            📈 准确率趋势图表
            <p>显示过去30天的预测准确率变化</p>
          </div>
        </div>
        <div class="chart-card">
          <h3>预测任务分布</h3>
          <div class="chart-placeholder">
            🥧 任务分布饼图
            <p>显示不同类型预测任务的分布情况</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const stats = ref({
  totalPredictions: 89,
  avgAccuracy: 92.4,
  activePredictions: 15,
  avgProcessTime: 3.2
})

// 最近预测任务
const recentPredictions = ref([
  {
    id: 1,
    title: '下学期招生需求预测',
    description: '基于历史招生数据和市场趋势预测下学期招生需求',
    type: '招生预测',
    status: '已完成',
    accuracy: 94.2,
    confidence: 89.5,
    processTime: 2.8,
    createdAt: '2024/3/1'
  },
  {
    id: 2,
    title: '学生期末成绩预测',
    description: '基于平时表现预测学生期末考试成绩',
    type: '成绩预测',
    status: '运行中',
    accuracy: 91.7,
    confidence: 87.3,
    processTime: 3.5,
    createdAt: '2024/2/28'
  },
  {
    id: 3,
    title: '教师离职风险预测',
    description: '分析教师工作满意度预测离职风险',
    type: '风险预测',
    status: '已完成',
    accuracy: 88.9,
    confidence: 92.1,
    processTime: 4.2,
    createdAt: '2024/2/25'
  }
])

// 页面方法
const navigateTo = (path: string) => {
  router.push(path)
}

const createPrediction = () => {
  ElMessage.info('创建预测任务功能开发中...')
}

const refreshPredictions = () => {
  ElMessage.success('预测数据已刷新')
}

const viewAllPredictions = () => {
  ElMessage.info('查看全部预测任务功能开发中...')
}

const viewPrediction = (id: number) => {
  ElMessage.info(`查看预测任务 ${id}`)
}

const runPrediction = (id: number) => {
  ElMessage.success(`预测任务 ${id} 已开始重新运行`)
}

const exportPrediction = (id: number) => {
  ElMessage.success(`预测结果 ${id} 导出成功`)
}

const getStatusType = (status: string) => {
  switch (status) {
    case '已完成': return 'success'
    case '运行中': return 'warning'
    case '失败': return 'danger'
    default: return 'info'
  }
}

onMounted(() => {
  console.log('AI预测分析页面已加载')
})
</script>

<style scoped lang="scss">
.ai-predictions-page {
  padding: var(--text-3xl);
  background: var(--bg-hover);
  min-height: 100vh;

  .page-header {
    background: white;
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
    margin-bottom: var(--text-3xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .header-info {
        h1 {
          margin: 0 0 var(--spacing-sm) 0;
          color: #1a1a1a;
          font-size: var(--text-3xl);
          font-weight: 600;
        }

        p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--text-lg);
          line-height: 1.5;
        }
      }

      .header-actions {
        display: flex;
        gap: var(--text-sm);
      }
    }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-3xl);

    .stat-card {
      background: white;
      border-radius: var(--text-sm);
      padding: var(--text-3xl);
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        font-size: var(--spacing-3xl);
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        border-radius: var(--text-sm);
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-base);
        font-weight: 500;

        .trend-icon {
          &.up {
            color: var(--success-color);
          }
          &.down {
            color: var(--brand-danger);
          }
        }
      }
    }
  }

  .prediction-types {
    background: white;
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
    margin-bottom: var(--spacing-3xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

    h2 {
      margin: 0 0 var(--text-2xl) 0;
      color: #1a1a1a;
      font-size: var(--text-2xl);
      font-weight: 600;
    }

    .types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--text-lg);

      .type-card {
        border: var(--border-width-base) solid #e8e8e8;
        border-radius: var(--spacing-sm);
        padding: var(--text-2xl);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(24, 144, 255, 0.15);
        }

        .type-icon {
          font-size: var(--spacing-3xl);
          margin-bottom: var(--text-sm);
        }

        .type-content {
          h3 {
            margin: 0 0 var(--spacing-sm) 0;
            color: #1a1a1a;
            font-size: var(--text-lg);
            font-weight: 600;
          }

          p {
            margin: 0 0 var(--text-sm) 0;
            color: var(--text-secondary);
            font-size: var(--text-base);
            line-height: 1.4;
          }

          .type-stats {
            display: flex;
            gap: var(--text-sm);
            font-size: var(--text-sm);

            span {
              color: var(--primary-color);
              background: #f0f9ff;
              padding: var(--spacing-sm) var(--spacing-sm);
              border-radius: var(--spacing-xs);
            }
          }
        }
      }
    }
  }

  .recent-predictions {
    background: white;
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
    margin-bottom: var(--spacing-3xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-2xl);

      h2 {
        margin: 0;
        color: #1a1a1a;
        font-size: var(--text-2xl);
        font-weight: 600;
      }
    }

    .predictions-list {
      .prediction-item {
        display: flex;
        align-items: center;
        gap: var(--text-2xl);
        padding: var(--text-lg);
        border: var(--border-width-base) solid var(--bg-gray-light);
        border-radius: var(--spacing-sm);
        margin-bottom: var(--text-sm);
        transition: border-color 0.2s ease;

        &:hover {
          border-color: var(--border-base);
        }

        .prediction-info {
          flex: 1;

          .prediction-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: var(--spacing-xs);
          }

          .prediction-desc {
            color: var(--text-secondary);
            font-size: var(--text-base);
            margin-bottom: var(--spacing-sm);
          }

          .prediction-meta {
            display: flex;
            gap: var(--text-sm);
            font-size: var(--text-sm);

            .prediction-type {
              color: var(--primary-color);
              background: #f0f9ff;
              padding: var(--spacing-sm) var(--spacing-sm);
              border-radius: var(--spacing-xs);
            }

            .prediction-time {
              color: var(--text-tertiary);
            }
          }
        }

        .prediction-status {
          min-width: 80px;
        }

        .prediction-metrics {
          display: flex;
          gap: var(--text-lg);

          .metric {
            text-align: center;

            .metric-label {
              display: block;
              font-size: var(--text-sm);
              color: var(--text-tertiary);
              margin-bottom: var(--spacing-sm);
            }

            .metric-value {
              font-weight: 600;
              color: #1a1a1a;
            }
          }
        }

        .prediction-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }
  }

  .prediction-charts {
    background: white;
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

    h2 {
      margin: 0 0 var(--text-2xl) 0;
      color: #1a1a1a;
      font-size: var(--text-2xl);
      font-weight: 600;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--text-2xl);

      .chart-card {
        border: var(--border-width-base) solid #e8e8e8;
        border-radius: var(--spacing-sm);
        padding: var(--text-2xl);

        h3 {
          margin: 0 0 var(--text-lg) 0;
          color: #1a1a1a;
          font-size: var(--text-lg);
          font-weight: 600;
        }

        .chart-placeholder {
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f9f9f9;
          border-radius: var(--spacing-sm);
          font-size: var(--text-3xl);
          color: var(--text-tertiary);

          p {
            margin: var(--spacing-sm) 0 0 0;
            font-size: var(--text-base);
            color: var(--text-secondary);
          }
        }
      }
    }
  }
}
</style>
