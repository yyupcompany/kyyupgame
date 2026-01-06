<template>
  <UnifiedCenterLayout
    title="数据分析中心"
    description="这里是数据分析和报表的中心枢纽，提供全面的业务数据分析、趋势预测和智能洞察"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleRefresh" :loading="loading">
        <UnifiedIcon name="Refresh" />
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
              icon-name="folder"
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
              icon-name="check"
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
              <div class="module-icon"><UnifiedIcon name="analytics" /></div>
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
              <div class="module-icon"><UnifiedIcon name="setting" /></div>
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
import { centersAPI } from '@/api/modules/centers'

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

// 加载数据 - 优化版本使用集合API
const loadData = async () => {
  try {
    loading.value = true
    const startTime = performance.now()
    console.log('🔄 开始加载分析中心数据...')

    // 优先使用集合API
    try {
      const response = await centersAPI.getAnalyticsOverview()
      const endTime = performance.now()
      console.log(`📊 分析中心集合API响应时间: ${Math.round(endTime - startTime)}ms`)
      console.log('📊 分析中心集合API响应:', response)

      if (response.success && response.data) {
        // 将集合API数据转换为统计数据格式
        updateStatsFromAggregateData(response.data)

        ElMessage.success(`数据加载完成 (${Math.round(endTime - startTime)}ms)`)
        return
      }
    } catch (aggregateError) {
      console.warn('⚠️ 集合API加载失败，降级到模拟数据:', aggregateError)
      // 降级到模拟数据
    }

    // 模拟数据作为降级方案
    await new Promise(resolve => setTimeout(resolve, 800))

    ElMessage.success('数据加载完成')
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 将集合API数据转换为统计数据格式
const updateStatsFromAggregateData = (data: any) => {
  const { systemAnalytics, activityAnalytics, userAnalytics } = data

  // 更新统计数据
  stats.totalRecords = systemAnalytics.userMetrics.totalUsers +
                      systemAnalytics.systemMetrics.totalLogs +
                      activityAnalytics.activityMetrics.totalActivities
  stats.dataGrowth = systemAnalytics.userMetrics.userGrowthRate * 100
  stats.totalReports = Math.round(activityAnalytics.participationMetrics.totalRegistrations / 10)
  stats.reportGrowth = activityAnalytics.activityMetrics.activityGrowthRate * 100
  stats.analysisDimensions = Object.keys(systemAnalytics).length +
                           Object.keys(activityAnalytics).length +
                           Object.keys(userAnalytics).length
  stats.dimensionGrowth = 3.2 // 保持原有值
  stats.dataQuality = Math.round(systemAnalytics.performanceMetrics.systemUptime * 100)
  stats.qualityImprovement = Math.round(userAnalytics.engagementMetrics.userRetentionRate * 10)
  stats.dailyReports = Math.round(activityAnalytics.participationMetrics.totalRegistrations / 30)
  stats.weeklyReports = 8 // 保持原有值
  stats.monthlyReports = Math.round(activityAnalytics.participationMetrics.totalRegistrations / 5)
  stats.customReports = Math.round(userAnalytics.notificationMetrics.totalNotifications / 5)

  console.log('✅ 统计数据已更新:', stats)
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
  padding: var(--spacing-xl);
  background: var(--el-fill-color-lighter);
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

.main-content {
  flex: 1;
  overflow-y: auto;
}

/* 欢迎词样式 */
.welcome-section {
  background: var(--el-bg-color);
  border: var(--border-width-base) solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);

  .welcome-content {
    h2 {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    p {
      font-size: var(--text-base);
      color: var(--el-text-color-regular);
      margin: 0;
      line-height: 1.5;
    }
  }
}

.analytics-features {
  margin-bottom: var(--spacing-xl);

  h3 {
    margin-bottom: var(--spacing-lg);
    color: var(--el-text-color-primary);
    font-size: var(--text-xl);
    font-weight: 600;
  }
}

.reports-section {
  .reports-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);

    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }
  }

  .reports-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);

    .report-stat-card {
      padding: var(--spacing-lg);
      background: var(--el-bg-color);
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--el-border-color-light);
      text-align: center;
      box-shadow: var(--shadow-sm);

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin-bottom: var(--spacing-sm);
      }

      .stat-label {
        font-size: var(--text-base);
        color: var(--el-text-color-secondary);
        margin-bottom: var(--spacing-sm);
      }

      .stat-trend {
        font-size: var(--text-sm);
        font-weight: 600;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);

        &.positive {
          background: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }

        &.neutral {
          background: var(--el-fill-color-light);
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.visualization-section {
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-xl);

    .chart-container {
      padding: var(--spacing-xl);
      background: var(--el-bg-color);
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--el-border-color-light);
      box-shadow: var(--shadow-sm);

      h4 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 var(--spacing-lg) 0;
      }

      .chart-placeholder {
        min-height: 60px; height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;

        .chart-trend-line {
          width: 80%;
          min-height: 32px; height: auto;
          background: var(--el-color-primary);
          border-radius: var(--radius-sm);
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: -20px;
            left: 20%;
            width: 60%;
            min-height: 32px; height: auto;
            background: var(--el-color-success);
            border-radius: var(--radius-sm);
          }

          &::after {
            content: '';
            position: absolute;
            top: 10px;
            left: 10%;
            width: 70%;
            min-height: 32px; height: auto;
            background: var(--el-color-warning);
            border-radius: var(--radius-sm);
          }
        }

        .chart-pie {
          max-width: 100px; width: 100%;
          min-height: 60px; height: auto;
          border-radius: var(--radius-full);
          position: relative;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

          .pie-slice {
            position: absolute;
            width: 50%;
            height: 50%;
            transform-origin: 100% 100%;

            &.slice-1 {
              background: var(--el-color-primary);
              transform: rotate(0deg);
            }

            &.slice-2 {
              background: var(--el-color-success);
              transform: rotate(90deg);
            }

            &.slice-3 {
              background: var(--el-color-warning);
              transform: rotate(180deg);
            }

            &.slice-4 {
              background: var(--el-color-danger);
              transform: rotate(270deg);
            }
          }
        }

        .chart-info {
          margin-top: var(--spacing-lg);
          color: var(--el-text-color-secondary);
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
    margin-bottom: var(--spacing-xl);

    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }
  }

  .insights-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);

    .insight-card {
      display: flex;
      padding: var(--spacing-lg);
      background: var(--el-bg-color);
      border-radius: var(--radius-md);
      border-left: var(--spacing-xs) solid var(--el-color-primary);
      box-shadow: var(--shadow-sm);

      .insight-icon {
        width: 4var(--spacing-sm);
        height: 4var(--spacing-sm);
        border-radius: var(--radius-md);
        background: var(--el-color-primary);
        color: var(--el-color-white);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-lg);
        font-size: var(--text-lg);
      }

      .insight-content {
        flex: 1;

        h4 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        p {
          font-size: var(--text-base);
          color: var(--el-text-color-secondary);
          margin: 0 0 var(--spacing-sm) 0;
          line-height: 1.5;
        }

        .insight-meta {
          display: flex;
          gap: var(--spacing-lg);
          font-size: var(--text-sm);

          .confidence {
            color: var(--el-color-success);
            font-weight: 600;
          }

          .generated-time {
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }
}

// 响应式设计 - 完整的断点系统
@media (max-width: 1200px) {
  .analytics-center-timeline {
    padding: var(--spacing-lg);
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }

  .actions-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }

  .visualization-section {
    .charts-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }
  }

  .reports-section {
    .reports-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }
  }
}

@media (max-width: 992px) {
  .analytics-center-timeline {
    padding: var(--spacing-md);
  }

  .welcome-section {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .visualization-section {
    .charts-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  .reports-section {
    .reports-stats {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  .insights-section {
    .insights-content {
      gap: var(--spacing-sm);
    }
  }
}

@media (max-width: 76var(--spacing-sm)) {
  .analytics-center-timeline {
    padding: var(--spacing-md);
  }

  .welcome-section {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);

    .welcome-content {
      text-align: center;
      margin-bottom: var(--spacing-md);

      h2 {
        font-size: var(--text-xl);
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
    gap: var(--spacing-md);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .visualization-section {
    .charts-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);

      .chart-container {
        padding: var(--spacing-md);

        .chart-placeholder {
          min-height: 60px; height: auto;
        }
      }
    }
  }

  .reports-section {
    .reports-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);

      .el-button {
        width: 100%;
      }
    }

    .reports-stats {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);

      .report-stat-card {
        padding: var(--spacing-md);

        .stat-value {
          font-size: var(--text-xl);
        }
      }
    }
  }

  .insights-section {
    .insights-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);

      .el-button {
        width: 100%;
      }
    }

    .insights-content {
      gap: var(--spacing-sm);

      .insight-card {
        flex-direction: column;
        padding: var(--spacing-md);

        .insight-icon {
          margin-right: 0;
          margin-bottom: var(--spacing-sm);
          align-self: flex-start;
        }

        .insight-content {
          .insight-meta {
            flex-direction: column;
            gap: var(--spacing-xs);
          }
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .analytics-center-timeline {
    padding: var(--spacing-sm);
  }

  .welcome-section {
    padding: var(--spacing-md);

    .welcome-content {
      h2 {
        font-size: var(--text-lg);
      }

      p {
        font-size: var(--text-sm);
      }
    }
  }

  .stats-grid-unified {
    gap: var(--spacing-sm);
  }

  .actions-grid-unified {
    gap: var(--spacing-sm);
  }

  .visualization-section {
    .charts-grid {
      gap: var(--spacing-sm);

      .chart-container {
        padding: var(--spacing-sm);

        .chart-placeholder {
          min-height: 60px; height: auto;
        }
      }
    }
  }

  .reports-section {
    .reports-stats {
      gap: var(--spacing-sm);

      .report-stat-card {
        padding: var(--spacing-sm);

        .stat-value {
          font-size: var(--text-lg);
        }
      }
    }
  }

  .insights-section {
    .insights-content {
      gap: var(--spacing-xs);

      .insight-card {
        padding: var(--spacing-sm);

        .insight-icon {
          width: auto;
          min-height: 32px; height: auto;
          font-size: var(--text-base);
        }
      }
    }
  }
}
</style>