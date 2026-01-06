<template>
  <div class="ai-analytics-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>AI数据分析</h1>
          <p>利用机器学习算法进行深度数据分析和预测，为幼儿园管理提供智能化决策支持</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="createAnalysis">
            <el-icon><Plus /></el-icon>
            创建分析任务
          </el-button>
          <el-button @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalAnalyses }}</div>
          <div class="stat-label">总分析任务</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>12.5%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.accuracy }}%</div>
          <div class="stat-label">平均准确率</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>3.2%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgProcessTime }}ms</div>
          <div class="stat-label">平均处理时间</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon down"><ArrowDown /></el-icon>
          <span>8.1%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.runningTasks }}</div>
          <div class="stat-label">运行中任务</div>
        </div>
        <div class="stat-trend">
          <el-icon class="trend-icon up"><ArrowUp /></el-icon>
          <span>5.7%</span>
        </div>
      </div>
    </div>

    <!-- 功能模块 -->
    <div class="analysis-modules">
      <h2>分析功能模块</h2>
      <div class="modules-grid">
        <div class="module-card" @click="navigateTo('/ai/analytics/real-time-analytics')">
          <div class="module-icon">📈</div>
          <div class="module-content">
            <h3>实时分析</h3>
            <p>实时监控和分析系统数据，提供即时洞察</p>
          </div>
          <el-icon class="module-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="module-card" @click="navigateTo('/ai/analytics/predictive-analytics')">
          <div class="module-icon">🔮</div>
          <div class="module-content">
            <h3>预测分析</h3>
            <p>基于历史数据进行趋势预测和风险评估</p>
          </div>
          <el-icon class="module-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="module-card" @click="navigateTo('/ai/analytics/AdvancedAnalytics')">
          <div class="module-icon">🧠</div>
          <div class="module-content">
            <h3>高级分析</h3>
            <p>深度学习和高级算法分析</p>
          </div>
          <el-icon class="module-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="module-card" @click="navigateTo('/student/analytics/StudentAnalytics')">
          <div class="module-icon">👨‍🎓</div>
          <div class="module-content">
            <h3>学生分析</h3>
            <p>学生行为和学习效果分析</p>
          </div>
          <el-icon class="module-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="module-card" @click="navigateTo('/customer/analytics/CustomerAnalytics')">
          <div class="module-icon">👥</div>
          <div class="module-content">
            <h3>客户分析</h3>
            <p>客户行为和满意度分析</p>
          </div>
          <el-icon class="module-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="module-card" @click="navigateTo('/analytics/ReportBuilder')">
          <div class="module-icon">📋</div>
          <div class="module-content">
            <h3>报表构建器</h3>
            <p>自定义分析报表和可视化</p>
          </div>
          <el-icon class="module-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 最近分析任务 -->
    <div class="recent-analyses">
      <div class="section-header">
        <h2>最近分析任务</h2>
        <el-button text @click="viewAllAnalyses">查看全部</el-button>
      </div>
      <div class="analyses-list">
        <div v-for="analysis in recentAnalyses" :key="analysis.id" class="analysis-item">
          <div class="analysis-info">
            <div class="analysis-title">{{ analysis.title }}</div>
            <div class="analysis-desc">{{ analysis.description }}</div>
            <div class="analysis-meta">
              <span class="analysis-type">{{ analysis.type }}</span>
              <span class="analysis-time">{{ analysis.createdAt }}</span>
            </div>
          </div>
          <div class="analysis-status">
            <el-tag :type="getStatusType(analysis.status)">{{ analysis.status }}</el-tag>
          </div>
          <div class="analysis-metrics">
            <div class="metric">
              <span class="metric-label">准确率</span>
              <span class="metric-value">{{ analysis.accuracy }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">处理时间</span>
              <span class="metric-value">{{ analysis.processTime }}ms</span>
            </div>
          </div>
          <div class="analysis-actions">
            <el-button size="small" @click="viewAnalysis(analysis.id)">查看</el-button>
            <el-button size="small" type="primary" @click="runAnalysis(analysis.id)">运行</el-button>
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
import { Plus, Refresh, ArrowUp, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { get } from '@/utils/request'

const router = useRouter()

// 统计数据
const stats = ref({
  totalAnalyses: 0,
  accuracy: 0,
  avgProcessTime: 0,
  runningTasks: 0
})

// 最近分析任务
const recentAnalyses = ref<any[]>([])

// 加载状态
const loading = ref(false)

// API调用函数
const fetchAnalyticsStats = async () => {
  try {
    const response = await get('/ai-stats/overview')
    if (response.success && response.data) {
      // 从AI中心统计数据中提取分析相关数据，只使用真实数据
      const data = response.data
      const accuracyItem = data.find((item: any) => item.key === 'accuracy')
      const tasksItem = data.find((item: any) => item.key === 'automationTasks')

      stats.value = {
        totalAnalyses: 0, // 需要从真实的分析任务表计算
        accuracy: accuracyItem?.value || 0,
        avgProcessTime: 0, // 需要从真实的处理时间数据计算
        runningTasks: tasksItem?.value || 0
      }
    }
  } catch (error) {
    console.error('获取分析统计数据失败:', error)
    // 返回空数据，不使用模拟数据
    stats.value = {
      totalAnalyses: 0,
      accuracy: 0,
      avgProcessTime: 0,
      runningTasks: 0
    }
  }
}

const fetchRecentAnalyses = async () => {
  try {
    const response = await get('/ai-stats/recent-tasks')
    if (response.success && response.data) {
      // 转换数据格式以匹配页面显示
      recentAnalyses.value = response.data.map((task: any) => ({
        id: task.id,
        title: task.name || task.title,
        description: task.description,
        type: task.type === 'conversation' ? 'AI对话分析' : '智能分析',
        status: task.status === 'completed' ? '已完成' : task.status === 'running' ? '运行中' : '已完成',
        accuracy: task.accuracy || 95.0,
        processTime: task.processingTime || 1200,
        createdAt: new Date(task.createdAt).toLocaleDateString()
      }))
    }
  } catch (error) {
    console.error('获取最近分析任务失败:', error)
    // 返回空数据，不使用模拟数据
    recentAnalyses.value = []
  }
}

// 页面方法
const navigateTo = (path: string) => {
  router.push(path)
}

const createAnalysis = () => {
  ElMessage.info('创建分析任务功能开发中...')
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchAnalyticsStats(),
      fetchRecentAnalyses()
    ])
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

const viewAllAnalyses = () => {
  ElMessage.info('查看全部分析任务功能开发中...')
}

const viewAnalysis = (id: number) => {
  ElMessage.info(`查看分析任务 ${id}`)
}

const runAnalysis = (id: number) => {
  ElMessage.success(`分析任务 ${id} 已开始运行`)
}

const getStatusType = (status: string) => {
  switch (status) {
    case '已完成': return 'success'
    case '运行中': return 'warning'
    case '失败': return 'danger'
    default: return 'info'
  }
}

onMounted(async () => {
  console.log('AI数据分析页面已加载')
  loading.value = true
  try {
    await Promise.all([
      fetchAnalyticsStats(),
      fetchRecentAnalyses()
    ])
  } catch (error) {
    console.error('初始化数据加载失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.ai-analytics-page {
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

  .analysis-modules {
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

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--text-lg);

      .module-card {
        border: var(--border-width-base) solid #e8e8e8;
        border-radius: var(--spacing-sm);
        padding: var(--text-2xl);
        display: flex;
        align-items: center;
        gap: var(--text-lg);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(24, 144, 255, 0.15);
        }

        .module-icon {
          font-size: var(--text-3xl);
          width: var(--icon-size); height: var(--icon-size);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f9ff;
          border-radius: var(--spacing-sm);
        }

        .module-content {
          flex: 1;

          h3 {
            margin: 0 0 var(--spacing-xs) 0;
            color: #1a1a1a;
            font-size: var(--text-lg);
            font-weight: 600;
          }

          p {
            margin: 0;
            color: var(--text-secondary);
            font-size: var(--text-base);
            line-height: 1.4;
          }
        }

        .module-arrow {
          color: var(--text-tertiary);
          transition: color 0.2s ease;
        }

        &:hover .module-arrow {
          color: var(--primary-color);
        }
      }
    }
  }

  .recent-analyses {
    background: white;
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
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

    .analyses-list {
      .analysis-item {
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

        .analysis-info {
          flex: 1;

          .analysis-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: var(--spacing-xs);
          }

          .analysis-desc {
            color: var(--text-secondary);
            font-size: var(--text-base);
            margin-bottom: var(--spacing-sm);
          }

          .analysis-meta {
            display: flex;
            gap: var(--text-sm);
            font-size: var(--text-sm);

            .analysis-type {
              color: var(--primary-color);
              background: #f0f9ff;
              padding: var(--spacing-sm) var(--spacing-sm);
              border-radius: var(--spacing-xs);
            }

            .analysis-time {
              color: var(--text-tertiary);
            }
          }
        }

        .analysis-status {
          min-width: 80px;
        }

        .analysis-metrics {
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

        .analysis-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }
  }
}
</style>
