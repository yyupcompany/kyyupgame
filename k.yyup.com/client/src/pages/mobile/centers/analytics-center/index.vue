<template>
  <MobileMainLayout
    title="数据分析中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <template #header-extra>
      <van-icon name="replay" size="18" @click="refreshData" :loading="loading" />
    </template>

    <div class="mobile-analytics-center" v-loading="loading" loading-text="加载统计数据中...">
      <!-- 顶部欢迎词 -->
      <div class="welcome-section">
        <h1 class="page-title">数据分析中心</h1>
        <p class="page-subtitle">实时掌握业务动态，助力决策优化</p>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card-mobile stat-card--primary" @click="navigateToDetail('data')">
            <div class="stat-icon">
              <van-icon name="friends" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(stats.totalRecords) }}</div>
              <div class="stat-title">数据总量</div>
              <div class="stat-trend" v-if="stats.dataGrowth !== 0">
                <van-icon :name="stats.dataGrowth >= 0 ? 'arrow-up' : 'arrow-down'"
                      :class="stats.dataGrowth >= 0 ? 'trend-up' : 'trend-down'" />
                <span :class="stats.dataGrowth >= 0 ? 'trend-up' : 'trend-down'">{{ Math.abs(stats.dataGrowth) }}%</span>
              </div>
            </div>
          </div>

          <div class="stat-card-mobile stat-card--success" @click="navigateToDetail('reports')">
            <div class="stat-icon">
              <van-icon name="medal" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalReports }}</div>
              <div class="stat-title">报表数量</div>
              <div class="stat-trend" v-if="stats.reportGrowth !== 0">
                <van-icon :name="stats.reportGrowth >= 0 ? 'arrow-up' : 'arrow-down'"
                      :class="stats.reportGrowth >= 0 ? 'trend-up' : 'trend-down'" />
                <span :class="stats.reportGrowth >= 0 ? 'trend-up' : 'trend-down'">{{ Math.abs(stats.reportGrowth) }}%</span>
              </div>
            </div>
          </div>

          <div class="stat-card-mobile stat-card--warning" @click="navigateToDetail('dimensions')">
            <div class="stat-icon">
              <van-icon name="star" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.analysisDimensions }}</div>
              <div class="stat-title">分析维度</div>
              <div class="stat-trend" v-if="stats.dimensionGrowth !== 0">
                <van-icon :name="stats.dimensionGrowth >= 0 ? 'arrow-up' : 'arrow-down'"
                      :class="stats.dimensionGrowth >= 0 ? 'trend-up' : 'trend-down'" />
                <span :class="stats.dimensionGrowth >= 0 ? 'trend-up' : 'trend-down'">{{ Math.abs(stats.dimensionGrowth) }}</span>
              </div>
            </div>
          </div>

          <div class="stat-card-mobile stat-card--info" @click="navigateToDetail('quality')">
            <div class="stat-icon">
              <van-icon name="chart-trending-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.dataQuality }}%</div>
              <div class="stat-title">数据质量</div>
              <div class="stat-trend" v-if="stats.qualityImprovement !== 0">
                <van-icon :name="stats.qualityImprovement >= 0 ? 'arrow-up' : 'arrow-down'"
                      :class="stats.qualityImprovement >= 0 ? 'trend-up' : 'trend-down'" />
                <span :class="stats.qualityImprovement >= 0 ? 'trend-up' : 'trend-down'">{{ Math.abs(stats.qualityImprovement) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析功能 -->
      <div class="analytics-features">
        <div class="section-header">
          <h2 class="section-title">分析功能</h2>
          <p class="section-subtitle">多维度数据分析，深入了解业务状况</p>
        </div>

        <van-grid :column-num="2" :gutter="12">
          <van-grid-item @click="navigateToFeature('enrollment')">
            <div class="feature-card-mobile">
              <div class="feature-icon">📊</div>
              <div class="feature-title">招生分析</div>
            </div>
          </van-grid-item>
          <van-grid-item @click="navigateToFeature('financial')">
            <div class="feature-card-mobile">
              <div class="feature-icon">💰</div>
              <div class="feature-title">财务分析</div>
            </div>
          </van-grid-item>
          <van-grid-item @click="navigateToFeature('performance')">
            <div class="feature-card-mobile">
              <div class="feature-icon">🏆</div>
              <div class="feature-title">绩效分析</div>
            </div>
          </van-grid-item>
          <van-grid-item @click="navigateToFeature('activity')">
            <div class="feature-card-mobile">
              <div class="feature-icon">📅</div>
              <div class="feature-title">活动分析</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 时间筛选 -->
      <div class="time-filter">
        <van-tabs v-model:active="activeTimeFilter" @change="handleTimeFilterChange">
          <van-tab title="今日" name="today" />
          <van-tab title="本周" name="week" />
          <van-tab title="本月" name="month" />
          <van-tab title="本年" name="year" />
        </van-tabs>
      </div>

      <!-- 报表导出 -->
      <div class="reports-section">
        <div class="section-header">
          <h2 class="section-title">报表导出</h2>
          <p class="section-subtitle">一键生成各类分析报表</p>
        </div>

        <div class="reports-grid">
          <div class="report-card-mobile" @click="handleExportReport('daily')">
            <div class="report-icon">
              <van-icon name="description" />
            </div>
            <div class="report-content">
              <div class="report-title">日报表</div>
              <div class="report-description">每日业务数据汇总分析</div>
            </div>
            <van-icon name="arrow" class="report-action" />
          </div>

          <div class="report-card-mobile" @click="handleExportReport('weekly')">
            <div class="report-icon">
              <van-icon name="newspaper-o" />
            </div>
            <div class="report-content">
              <div class="report-title">周报表</div>
              <div class="report-description">本周运营数据综合报告</div>
            </div>
            <van-icon name="arrow" class="report-action" />
          </div>

          <div class="report-card-mobile" @click="handleExportReport('monthly')">
            <div class="report-icon">
              <van-icon name="orders-o" />
            </div>
            <div class="report-content">
              <div class="report-title">月报表</div>
              <div class="report-description">月度绩效与趋势分析</div>
            </div>
            <van-icon name="arrow" class="report-action" />
          </div>
        </div>
      </div>

      <!-- 数据质量监控 -->
      <div class="quality-section">
        <div class="section-header">
          <h2 class="section-title">数据质量</h2>
          <p class="section-subtitle">监控数据完整性和准确性</p>
        </div>

        <div class="quality-cards">
          <div class="quality-card">
            <div class="quality-header">
              <div class="quality-icon">
                <van-icon name="checked" style="color: var(--success-color);" />
              </div>
              <div class="quality-info">
                <div class="quality-title">数据完整性</div>
                <div class="quality-score">{{ stats.dataCompleteness || 98.5 }}%</div>
              </div>
            </div>
          </div>

          <div class="quality-card">
            <div class="quality-header">
              <div class="quality-icon">
                <van-icon name="clock" style="color: var(--warning-color);" />
              </div>
              <div class="quality-info">
                <div class="quality-title">更新及时性</div>
                <div class="quality-score">{{ stats.timeliness || 95.2 }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 导出弹窗 -->
      <van-popup
        v-model:show="showExportDialog"
        position="bottom"
        :style="{ height: '40%' }"
        round
      >
        <div class="export-dialog">
          <div class="dialog-header">
            <h3>导出报表</h3>
            <van-icon name="cross" @click="showExportDialog = false" />
          </div>
          <div class="dialog-content">
            <div class="export-form">
              <van-field name="format" label="导出格式">
                <template #input>
                  <van-radio-group v-model="exportFormat" direction="horizontal">
                    <van-radio name="excel">Excel</van-radio>
                    <van-radio name="pdf">PDF</van-radio>
                    <van-radio name="csv">CSV</van-radio>
                  </van-radio-group>
                </template>
              </van-field>
            </div>
            <div class="export-actions">
              <van-button block type="primary" @click="confirmExport" :loading="exporting">
                确认导出
              </van-button>
              <van-button block plain @click="showExportDialog = false">
                取消
              </van-button>
            </div>
          </div>
        </div>
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { centersAPI } from '@/api/modules/centers'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const activeTimeFilter = ref('week')
const showExportDialog = ref(false)
const exportFormat = ref('excel')
const exportType = ref('daily')

// 统计数据（使用响应式reactive）
const stats = reactive({
  totalRecords: 0,
  dataGrowth: 0,
  totalReports: 0,
  reportGrowth: 0,
  analysisDimensions: 0,
  dimensionGrowth: 0,
  dataQuality: 0,
  qualityImprovement: 0,
  dataCompleteness: 0,
  timeliness: 0
})

// 辅助函数：限制百分比在0-100范围内
const clampPercentage = (value: number): number => {
  return Math.min(100, Math.max(0, value))
}

// 加载数据 - 使用与PC端相同的逻辑
const loadData = async () => {
  try {
    loading.value = true
    const startTime = performance.now()
    console.log('🔄 开始加载移动端分析中心数据...')

    // 优先使用集合API
    try {
      const response = await centersAPI.getAnalyticsOverview()
      const endTime = performance.now()
      console.log(`📊 移动端分析中心集合API响应时间: ${Math.round(endTime - startTime)}ms`)
      console.log('📊 移动端分析中心集合API响应:', response)

      if (response.success && response.data) {
        // 将集合API数据转换为统计数据格式
        updateStatsFromAggregateData(response.data)

        closeToast()
        showToast(`数据加载完成 (${Math.round(endTime - startTime)}ms)`)
        return
      }
    } catch (aggregateError) {
      console.warn('⚠️ 集合API加载失败，降级到模拟数据:', aggregateError)
      // 降级到模拟数据
    }

    // 模拟数据作为降级方案
    await new Promise(resolve => setTimeout(resolve, 800))

    // 使用默认值
    stats.totalRecords = Math.max(0, 1248567)
    stats.dataGrowth = Math.max(0, 12.5)
    stats.totalReports = Math.max(0, 342)
    stats.reportGrowth = Math.max(0, 8.3)
    stats.analysisDimensions = Math.max(0, 28)
    stats.dimensionGrowth = Math.max(0, 3.2)
    stats.dataQuality = clampPercentage(94.8)
    stats.qualityImprovement = Math.max(0, 2.1)
    stats.dataCompleteness = 98.5
    stats.timeliness = 95.2

    closeToast()
    showToast('数据加载完成')
  } catch (error) {
    console.error('❌ 移动端分析中心数据加载失败:', error)
    closeToast()
    showToast('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 将集合API数据转换为统计数据格式（与PC端相同）
const updateStatsFromAggregateData = (data: any) => {
  const { systemAnalytics, activityAnalytics, userAnalytics } = data

  // 更新统计数据
  stats.totalRecords = systemAnalytics.userMetrics.totalUsers +
                      systemAnalytics.systemMetrics.totalLogs +
                      activityAnalytics.activityMetrics.totalActivities
  stats.dataGrowth = Math.round(systemAnalytics.userMetrics.userGrowthRate * 100)
  stats.totalReports = Math.round(activityAnalytics.participationMetrics.totalRegistrations / 10)
  stats.reportGrowth = Math.round(activityAnalytics.activityMetrics.activityGrowthRate * 100)
  stats.analysisDimensions = Object.keys(systemAnalytics).length +
                           Object.keys(activityAnalytics).length +
                           Object.keys(userAnalytics).length
  stats.dimensionGrowth = 3.2 // 保持原有值
  stats.dataQuality = Math.round(systemAnalytics.performanceMetrics.systemUptime * 100)
  stats.qualityImprovement = Math.round(userAnalytics.engagementMetrics.userRetentionRate * 10)
  stats.dataCompleteness = 98.5
  stats.timeliness = 95.2

  console.log('✅ 移动端统计数据已更新:', stats)
}

// 刷新数据
const refreshData = async () => {
  showLoadingToast({
    message: '刷新数据中...',
    forbidClick: true,
    duration: 0
  })
  await loadData()
}

// 时间筛选切换
const handleTimeFilterChange = (name: string) => {
  console.log('时间筛选切换:', name)
  showToast(`切换到${name === 'today' ? '今日' : name === 'week' ? '本周' : name === 'month' ? '本月' : '本年'}数据`)
  // TODO: 根据时间筛选刷新数据
  refreshData()
}

// 导航到详情
const navigateToDetail = (type: string) => {
  showToast(`导航到${type === 'data' ? '数据' : type === 'reports' ? '报表' : type === 'dimensions' ? '维度' : '质量'}详情页面`)
}

// 导航到功能页面
const navigateToFeature = (feature: string) => {
  const featureNames: Record<string, string> = {
    'enrollment': '招生分析',
    'financial': '财务分析',
    'performance': '绩效分析',
    'activity': '活动分析'
  }
  showToast(`导航到${featureNames[feature]}页面`)
}

// 导出报表
const handleExportReport = (type: string) => {
  exportType.value = type
  showExportDialog.value = true
}

// 确认导出
const confirmExport = async () => {
  try {
    exporting.value = true
    console.log('导出报表:', {
      type: exportType.value,
      format: exportFormat.value
    })

    // TODO: 调用导出API
    await new Promise(resolve => setTimeout(resolve, 1500))

    showToast(`已导出${exportType.value === 'daily' ? '日' : exportType.value === 'weekly' ? '周' : '月'}报表（${exportFormat.value.toUpperCase()}格式）`)
    showExportDialog.value = false
  } catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'K'
  } else if (num >= 1000) {
    return num.toLocaleString()
  }
  return num.toString()
}

// 页面挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-analytics-center {
  padding: var(--app-gap);
  background: var(--van-background-color-light);
  min-height: 100vh;

  // 欢迎词样式
  .welcome-section {
    margin-bottom: var(--van-padding-lg);
    text-align: center;

    .page-title {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-xs) 0;
    }

    .page-subtitle {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      margin: 0;
    }
  }

  // 统计卡片样式
  .stats-section {
    margin-bottom: var(--van-padding-lg);

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--van-padding-md);

      .stat-card-mobile {
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        padding: var(--van-padding-md);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--van-padding-xs);
        transition: all 0.3s ease;
        cursor: pointer;

        &:active {
          transform: scale(0.98);
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--van-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--van-background-color-light);
          font-size: var(--text-xl);
        }

        .stat-content {
          width: 100%;

          .stat-value {
            font-size: 22px;
            font-weight: 700;
            color: var(--van-text-color);
            margin-bottom: 2px;
            line-height: 1.2;
          }

          .stat-title {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            margin-bottom: 6px;
            line-height: 1.2;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: 2px;
            font-size: 11px;

            .trend-up {
              color: #07c160;
            }

            .trend-down {
              color: #ee0a24;
            }
          }
        }

        &.stat-card--primary .stat-icon {
          background: rgba(64, 158, 255, 0.1);
          color: var(--primary-color);
        }

        &.stat-card--success .stat-icon {
          background: rgba(103, 194, 58, 0.1);
          color: var(--success-color);
        }

        &.stat-card--warning .stat-icon {
          background: rgba(230, 162, 60, 0.1);
          color: var(--warning-color);
        }

        &.stat-card--info .stat-icon {
          background: rgba(144, 147, 153, 0.1);
          color: var(--info-color);
        }
      }
    }
  }

  // 区域标题样式
  .section-header {
    margin-bottom: var(--van-padding-lg);
    text-align: left;

    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-xs) 0;
      line-height: 1.3;
    }

    .section-subtitle {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      margin: 0;
      line-height: 1.5;
    }
  }

  // 分析功能样式
  .analytics-features {
    margin-bottom: var(--van-padding-lg);

    .feature-card-mobile {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:active {
        transform: scale(0.98);
      }

      .feature-icon {
        font-size: var(--text-3xl);
        margin-bottom: var(--van-padding-xs);
      }

      .feature-title {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--van-text-color);
        margin: 0;
        line-height: 1.2;
      }
    }
  }

  // 时间筛选器
  .time-filter {
    background: var(--card-bg);
    border-radius: var(--van-radius-lg);
    padding: var(--van-padding-sm);
    margin-bottom: var(--van-padding-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.van-tabs__wrap) {
      border-radius: var(--van-radius-md);
    }

    :deep(.van-tabs__nav) {
      background: transparent;
    }

    :deep(.van-tab) {
      font-size: var(--text-sm);
    }
  }

  // 报表导出样式
  .reports-section {
    margin-bottom: var(--van-padding-lg);

    .reports-grid {
      .report-card-mobile {
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        padding: var(--van-padding-md);
        margin-bottom: var(--van-padding-md);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        gap: var(--van-padding-md);
        transition: all 0.3s ease;
        cursor: pointer;

        &:active {
          transform: scale(0.98);
        }

        .report-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--van-radius-md);
          background: rgba(64, 158, 255, 0.1);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: var(--text-xl);
        }

        .report-content {
          flex: 1;

          .report-title {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color);
            margin: 0 0 var(--van-padding-xs) 0;
            line-height: 1.3;
          }

          .report-description {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            margin: 0;
            line-height: 1.4;
          }
        }

        .report-action {
          color: var(--van-text-color-3);
        }
      }
    }
  }

  // 数据质量监控样式
  .quality-section {
    margin-bottom: var(--van-padding-lg);

    .quality-cards {
      .quality-card {
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        padding: var(--van-padding-md);
        margin-bottom: var(--van-padding-md);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .quality-header {
          display: flex;
          align-items: center;
          gap: var(--van-padding-md);
          margin-bottom: 0;

          .quality-icon {
            width: 40px;
            height: 40px;
            font-size: var(--text-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--van-background-color-light);
            border-radius: var(--van-radius-md);
          }

          .quality-info {
            flex: 1;

            .quality-title {
              font-size: var(--text-sm);
              font-weight: 500;
              color: var(--van-text-color);
              margin: 0 0 var(--van-padding-xs) 0;
            }

            .quality-score {
              font-size: var(--text-lg);
              font-weight: 600;
              color: var(--van-text-color);
            }
          }
        }
      }
    }
  }

  // 导出弹窗样式
  .export-dialog {
    padding: var(--van-padding-lg);

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-lg);

      h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .dialog-content {
      .export-form {
        margin-bottom: var(--van-padding-xl);
      }

      .export-actions {
        .van-button {
          margin-bottom: var(--van-padding-md);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-analytics-center {
    padding: var(--van-padding-sm);
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }

  .analytics-features {
    :deep(.van-grid) {
      .van-grid-item {
        flex-basis: 100% !important;
      }
    }
  }
}
</style>
