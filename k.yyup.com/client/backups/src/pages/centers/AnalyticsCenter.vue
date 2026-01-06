<template>
  <UnifiedCenterLayout
    title="数据分析中心"
    description="这里是数据分析和报表的中心枢纽，提供全面的业务数据分析、趋势预测和智能洞察"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleRefresh" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </template>

    <div class="center-container analytics-center-timeline">

    <!-- 主要内容区域 -->
    <div class="main-content">
        <!-- 欢迎词 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h2>欢迎来到数据分析中心</h2>
            <p>探索数据洞察，驱动智能决策</p>
          </div>
        </div>

        <!-- 统计卡片区域 -->
        <div class="stats-section">
          <div class="stats-grid-unified" v-loading="loading" element-loading-text="加载统计数据中...">
            <StatCard
              title="数据总量"
              :value="formatNumber(stats.totalRecords)"
              icon-name="database"
              :trend="stats.dataGrowth"
              trend-text="比上月增长"
              type="primary"
              clickable
              @click="navigateToDetail('data')"
            />
            <StatCard
              title="报表数量"
              :value="stats.totalReports"
              icon-name="document"
              :trend="stats.reportGrowth"
              trend-text="新增报表"
              type="success"
              clickable
              @click="navigateToDetail('reports')"
            />
            <StatCard
              title="分析维度"
              :value="stats.analysisDimensions"
              icon-name="grid"
              :trend="stats.dimensionGrowth"
              trend-text="新增维度"
              type="info"
              clickable
              @click="navigateToDetail('dimensions')"
            />
            <StatCard
              title="数据质量"
              :value="stats.dataQuality + '%'"
              icon-name="shield-check"
              :trend="stats.qualityImprovement"
              trend-text="质量提升"
              type="warning"
              clickable
              @click="navigateToDetail('quality')"
            />
          </div>
        </div>

        <!-- 分析功能概览 -->
        <div class="analytics-features">
          <h3>分析功能概览</h3>
          <div class="actions-grid-unified">
            <div class="module-item" @click="navigateToFeature('enrollment')">
              <div class="module-icon">📊</div>
              <div class="module-content">
                <h4>招生分析</h4>
                <p>学生招生数据统计与趋势分析，包括报名转化率、渠道效果等关键指标。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('financial')">
              <div class="module-icon">💰</div>
              <div class="module-content">
                <h4>财务分析</h4>
                <p>收入支出分析、成本控制统计，提供详细的财务状况报告。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('performance')">
              <div class="module-icon">🏆</div>
              <div class="module-content">
                <h4>绩效分析</h4>
                <p>教师绩效评估、学生成长跟踪，全方位的绩效数据分析。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('activity')">
              <div class="module-icon">📅</div>
              <div class="module-content">
                <h4>活动分析</h4>
                <p>活动参与度统计、效果评估，帮助优化活动策划和执行。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('marketing')">
              <div class="module-icon">📢</div>
              <div class="module-content">
                <h4>营销分析</h4>
                <p>营销活动效果分析、客户转化统计，提升营销ROI。</p>
              </div>
            </div>

            <div class="module-item" @click="navigateToFeature('operations')">
              <div class="module-icon">⚙️</div>
              <div class="module-content">
                <h4>运营分析</h4>
                <p>系统运营数据分析、用户行为统计，优化运营策略。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  ArrowDown,
  TrendCharts,
  UserFilled,
  Money,
  Trophy,
  Calendar,
  Promotion,
  Operation,
  Plus,
  MagicStick
} from '@element-plus/icons-vue'
import StatCard from '@/components/centers/StatCard.vue'

// 响应式数据
const loading = ref(false)


// 辅助函数：限制百分比在0-100范围内
const clampPercentage = (value: number): number => {
  return Math.min(100, Math.max(0, value))
}

// 统计数据
const stats = reactive({
  totalRecords: Math.max(0, 1248567),
  dataGrowth: Math.max(0, 12.5),
  totalReports: Math.max(0, 342),
  reportGrowth: Math.max(0, 8.3),
  analysisDimensions: Math.max(0, 28),
  dimensionGrowth: Math.max(0, 3.2),
  dataQuality: clampPercentage(94.8),
  qualityImprovement: Math.max(0, 2.1),
  dailyReports: Math.max(0, 15),
  weeklyReports: Math.max(0, 8),
  monthlyReports: Math.max(0, 12),
  customReports: Math.max(0, 25)
})

// 页面挂载
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    // 模拟数据加载
    await new Promise(resolve => setTimeout(resolve, 800))
    
    ElMessage.success('数据加载完成')
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const handleRefresh = async () => {
  await loadData()
}


// 格式化数字
const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

// 导航到详情
const navigateToDetail = (type: string) => {
  ElMessage.info(`导航到${type}详情页面`)
}

// 导航到功能页面
const navigateToFeature = (feature: string) => {
  ElMessage.info(`导航到${feature}分析页面`)
}

</script>

<style scoped lang="scss">
/* 数据分析中心根容器 - 完全参考活动中心的标准样式 */
.analytics-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--text-3xl);
  background: var(--bg-secondary, var(--bg-container));
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

.main-content {
  flex: 1;
  overflow-y: auto;
}

.analytics-features h3 {
  margin-bottom: var(--text-2xl);
  color: var(--text-primary);
  font-size: var(--text-2xl);
  font-weight: 600;
}

.reports-section {
  .reports-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-3xl);

    h3 {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .reports-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--text-lg);

    .report-stat-card {
      padding: var(--text-2xl);
      background: var(--bg-color);
      border-radius: var(--spacing-sm);
      border: var(--border-width-base) solid var(--border-color);
      text-align: center;

      .stat-value {
        font-size: var(--spacing-3xl);
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .stat-label {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-sm);
      }

      .stat-trend {
        font-size: var(--text-sm);
        font-weight: 600;
        padding: var(--spacing-sm) var(--spacing-sm);
        border-radius: var(--text-sm);

        &.positive {
          background: var(--success-bg);
          color: var(--success-color);
        }

        &.neutral {
          background: var(--bg-color-light);
          color: var(--text-secondary);
        }
      }
    }
  }
}

.visualization-section {
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--text-3xl);

    .chart-container {
      padding: var(--text-3xl);
      background: var(--bg-color);
      border-radius: var(--spacing-sm);
      border: var(--border-width-base) solid var(--border-color);

      h4 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--text-lg) 0;
      }

      .chart-placeholder {
        height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;

        .chart-trend-line {
          width: 80%;
          height: 2px;
          background: var(--primary-color);
          border-radius: var(--radius-xs);
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: -var(--text-2xl);
            left: 20%;
            width: 60%;
            height: 2px;
            background: var(--success-color);
            border-radius: var(--radius-xs);
          }

          &::after {
            content: '';
            position: absolute;
            top: var(--position-negative-10xl);
            left: 10%;
            width: 70%;
            height: 2px;
            background: var(--warning-color);
            border-radius: var(--radius-xs);
          }
        }

        .chart-pie {
          width: 100px;
          height: 100px;
          border-radius: var(--radius-full);
          position: relative;
          overflow: hidden;

          .pie-slice {
            position: absolute;
            width: 50%;
            height: 50%;
            transform-origin: 100% 100%;

            &.slice-1 {
              background: var(--primary-color);
              transform: rotate(0deg);
            }

            &.slice-2 {
              background: var(--success-color);
              transform: rotate(90deg);
            }

            &.slice-3 {
              background: var(--warning-color);
              transform: rotate(180deg);
            }

            &.slice-4 {
              background: var(--danger-color);
              transform: rotate(270deg);
            }
          }
        }

        .chart-info {
          margin-top: var(--text-lg);
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }
    }
  }
}

.insights-section {
  .insights-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-3xl);

    h3 {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .insights-content {
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);

    .insight-card {
      display: flex;
      padding: var(--text-2xl);
      background: var(--bg-color);
      border-radius: var(--spacing-sm);
      border-left: var(--spacing-xs) solid var(--primary-color);

      .insight-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-md);
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--text-lg);
        font-size: var(--text-xl);
      }

      .insight-content {
        flex: 1;

        h4 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--text-sm) 0;
          line-height: 1.5;
        }

        .insight-meta {
          display: flex;
          gap: var(--text-lg);
          font-size: var(--text-sm);

          .confidence {
            color: var(--success-color);
            font-weight: 600;
          }

          .generated-time {
            color: var(--text-secondary);
          }
        }
      }
    }
  }
}

// 响应式设计 - 完整的断点系统
@media (max-width: var(--breakpoint-xl)) {
  .analytics-center {
    padding: var(--text-xl);
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-2xl);
  }

  .actions-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-2xl);
  }

  .visualization-section {
    .charts-grid {
      grid-template-columns: 1fr;
      gap: var(--text-2xl);
    }
  }

  .reports-section {
    .reports-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--text-lg);
    }
  }
}

@media (max-width: 992px) {
  .analytics-center {
    padding: var(--text-lg);
  }

  .welcome-section {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .visualization-section {
    .charts-grid {
      grid-template-columns: 1fr;
      gap: var(--text-lg);
    }
  }

  .reports-section {
    .reports-stats {
      grid-template-columns: 1fr;
      gap: var(--text-lg);
    }
  }

  .insights-section {
    .insights-content {
      gap: var(--text-sm);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .analytics-center {
    padding: var(--text-lg);
  }

  .welcome-section {
    flex-direction: column;
    text-align: center;
    padding: var(--text-2xl);
    margin-bottom: var(--text-3xl);

    .welcome-content {
      text-align: center;
      margin-bottom: var(--text-lg);

      h2 {
        font-size: var(--text-3xl);
      }

      p {
        font-size: var(--text-base);
      }
    }

    .header-actions {
      margin-left: 0;
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .stats-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .visualization-section {
    .charts-grid {
      grid-template-columns: 1fr;
      gap: var(--text-lg);

      .chart-container {
        padding: var(--text-2xl);

        .chart-placeholder {
          height: 150px;
        }
      }
    }
  }

  .reports-section {
    .reports-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--text-lg);

      .el-button {
        width: 100%;
      }
    }

    .reports-stats {
      grid-template-columns: 1fr;
      gap: var(--text-lg);

      .report-stat-card {
        padding: var(--text-lg);

        .stat-value {
          font-size: var(--text-3xl);
        }
      }
    }
  }

  .insights-section {
    .insights-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--text-lg);

      .el-button {
        width: 100%;
      }
    }

    .insights-content {
      gap: var(--text-sm);

      .insight-card {
        flex-direction: column;
        padding: var(--text-lg);

        .insight-icon {
          margin-right: 0;
          margin-bottom: var(--text-sm);
          align-self: flex-start;
        }

        .insight-content {
          .insight-meta {
            flex-direction: column;
            gap: var(--spacing-sm);
          }
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .analytics-center {
    padding: var(--text-sm);
  }

  .welcome-section {
    padding: var(--text-lg);

    .welcome-content {
      h2 {
        font-size: var(--text-2xl);
      }

      p {
        font-size: var(--text-base);
      }
    }
  }

  .stats-grid-unified {
    gap: var(--text-sm);
  }

  .actions-grid-unified {
    gap: var(--text-sm);
  }

  .visualization-section {
    .charts-grid {
      gap: var(--text-sm);

      .chart-container {
        padding: var(--text-lg);

        .chart-placeholder {
          height: 120px;
        }
      }
    }
  }

  .reports-section {
    .reports-stats {
      gap: var(--text-sm);

      .report-stat-card {
        padding: var(--text-sm);

        .stat-value {
          font-size: var(--text-3xl);
        }
      }
    }
  }

  .insights-section {
    .insights-content {
      gap: var(--spacing-sm);

      .insight-card {
        padding: var(--text-sm);

        .insight-icon {
          width: var(--spacing-3xl);
          height: var(--spacing-3xl);
          font-size: var(--text-lg);
        }
      }
    }
  }
}
</style>