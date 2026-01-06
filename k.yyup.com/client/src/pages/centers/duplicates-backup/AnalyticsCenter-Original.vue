<template>
  <div class="analytics-center">
    <!-- 中心内容 -->
    <div class="center-content">
      <div class="welcome-section">
        <div class="welcome-content">
          <h2>
            <UnifiedIcon name="default" />
            欢迎来到数据分析中心
          </h2>
          <p>这里是数据分析和报表的中心枢纽，提供全面的业务数据分析、趋势预测和智能洞察。</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleRefresh" :loading="loading">
            <UnifiedIcon name="Refresh" />
            刷新数据
          </el-button>
          <el-dropdown trigger="click">
            <el-button>
              导出报表
              <UnifiedIcon name="ArrowDown" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="exportReport('xlsx')">Excel格式</el-dropdown-item>
                <el-dropdown-item @click="exportReport('pdf')">PDF格式</el-dropdown-item>
                <el-dropdown-item @click="exportReport('csv')">CSV格式</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 数据分析选项卡 -->
      <div class="analytics-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="center-tabs">
          <el-tab-pane label="概览" name="overview">
            <!-- 核心统计数据 -->
            <div class="stats-overview" v-loading="loading" element-loading-text="加载统计数据中...">
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

            <!-- 分析功能概览 -->
            <div class="analytics-features">
              <h3 class="section-title">
                <UnifiedIcon name="default" />
                分析功能概览
              </h3>
              <div class="features-grid">
                <div class="feature-card" @click="navigateToFeature('enrollment')">
                  <div class="feature-icon primary">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="feature-content">
                    <h4>招生分析</h4>
                    <p>学生招生数据统计与趋势分析，包括报名转化率、渠道效果等关键指标。</p>
                  </div>
                </div>

                <div class="feature-card" @click="navigateToFeature('financial')">
                  <div class="feature-icon success">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="feature-content">
                    <h4>财务分析</h4>
                    <p>收入支出分析、成本控制统计，提供详细的财务状况报告。</p>
                  </div>
                </div>

                <div class="feature-card" @click="navigateToFeature('performance')">
                  <div class="feature-icon info">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="feature-content">
                    <h4>绩效分析</h4>
                    <p>教师绩效评估、学生成长跟踪，全方位的绩效数据分析。</p>
                  </div>
                </div>

                <div class="feature-card" @click="navigateToFeature('activity')">
                  <div class="feature-icon warning">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="feature-content">
                    <h4>活动分析</h4>
                    <p>活动参与度统计、效果评估，帮助优化活动策划和执行。</p>
                  </div>
                </div>

                <div class="feature-card" @click="navigateToFeature('marketing')">
                  <div class="feature-icon danger">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="feature-content">
                    <h4>营销分析</h4>
                    <p>营销活动效果分析、客户转化统计，提升营销ROI。</p>
                  </div>
                </div>

                <div class="feature-card" @click="navigateToFeature('operations')">
                  <div class="feature-icon primary">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="feature-content">
                    <h4>运营分析</h4>
                    <p>系统运营数据分析、用户行为统计，优化运营策略。</p>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="数据报表" name="reports">
            <div class="reports-section">
              <div class="reports-header">
                <h3>数据报表</h3>
                <el-button type="primary" @click="createReport">
                  <UnifiedIcon name="Plus" />
                  新建报表
                </el-button>
              </div>
              
              <div class="reports-stats">
                <div class="report-stat-card">
                  <div class="stat-value">{{ stats.dailyReports }}</div>
                  <div class="stat-label">日报</div>
                  <div class="stat-trend positive">+5.2%</div>
                </div>
                <div class="report-stat-card">
                  <div class="stat-value">{{ stats.weeklyReports }}</div>
                  <div class="stat-label">周报</div>
                  <div class="stat-trend positive">+2.8%</div>
                </div>
                <div class="report-stat-card">
                  <div class="stat-value">{{ stats.monthlyReports }}</div>
                  <div class="stat-label">月报</div>
                  <div class="stat-trend neutral">0.0%</div>
                </div>
                <div class="report-stat-card">
                  <div class="stat-value">{{ stats.customReports }}</div>
                  <div class="stat-label">自定义</div>
                  <div class="stat-trend positive">+12.1%</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="数据可视化" name="visualization">
            <div class="visualization-section">
              <div class="charts-grid">
                <div class="chart-container">
                  <h4>数据趋势分析</h4>
                  <div class="chart-placeholder">
                    <div class="chart-trend-line"></div>
                    <div class="chart-info">数据量持续增长</div>
                  </div>
                </div>
                
                <div class="chart-container">
                  <h4>分析维度分布</h4>
                  <div class="chart-placeholder">
                    <div class="chart-pie">
                      <div class="pie-slice slice-1"></div>
                      <div class="pie-slice slice-2"></div>
                      <div class="pie-slice slice-3"></div>
                      <div class="pie-slice slice-4"></div>
                    </div>
                    <div class="chart-info">多维度数据分析</div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="智能洞察" name="insights">
            <div class="insights-section">
              <div class="insights-header">
                <h3>智能洞察</h3>
                <el-button type="primary" @click="generateInsights" :loading="insightsLoading">
                  <UnifiedIcon name="default" />
                  生成洞察
                </el-button>
              </div>
              
              <div class="insights-content">
                <div class="insight-card">
                  <div class="insight-icon">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="insight-content">
                    <h4>招生趋势洞察</h4>
                    <p>基于历史数据分析，预计下月招生人数将增长15%，建议加强师资配备。</p>
                    <div class="insight-meta">
                      <span class="confidence">置信度: 85%</span>
                      <span class="generated-time">2小时前</span>
                    </div>
                  </div>
                </div>

                <div class="insight-card">
                  <div class="insight-icon">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="insight-content">
                    <h4>成本优化建议</h4>
                    <p>通过优化教学资源配置，预计可节省运营成本8%，同时保持教学质量。</p>
                    <div class="insight-meta">
                      <span class="confidence">置信度: 92%</span>
                      <span class="generated-time">1天前</span>
                    </div>
                  </div>
                </div>

                <div class="insight-card">
                  <div class="insight-icon">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="insight-content">
                    <h4>教学质量分析</h4>
                    <p>学生满意度较上月提升12%，建议推广优秀教学方法到其他班级。</p>
                    <div class="insight-meta">
                      <span class="confidence">置信度: 78%</span>
                      <span class="generated-time">3小时前</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  Magic
} from '@element-plus/icons-vue'
import StatCard from '@/components/centers/StatCard.vue'

// 响应式数据
const loading = ref(false)
const insightsLoading = ref(false)
const activeTab = ref('overview')

// 统计数据
const stats = reactive({
  totalRecords: 1248567,
  dataGrowth: 12.5,
  totalReports: 342,
  reportGrowth: 8.3,
  analysisDimensions: 28,
  dimensionGrowth: 3.2,
  dataQuality: 94.8,
  qualityImprovement: 2.1,
  dailyReports: 15,
  weeklyReports: 8,
  monthlyReports: 12,
  customReports: 25
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

// 切换标签页
const handleTabClick = (tab: any) => {
  console.log('切换到标签页:', tab.props.name)
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 导航到详情
const navigateToDetail = (type: string) => {
  ElMessage.info(`导航到${type}详情页面`)
}

// 导航到功能页面
const navigateToFeature = (feature: string) => {
  ElMessage.info(`导航到${feature}分析页面`)
}

// 创建报表
const createReport = () => {
  ElMessage.info('打开创建报表对话框')
}

// 导出报表
const exportReport = (format: string) => {
  ElMessage.success(`开始导出${format.toUpperCase()}格式报表`)
}

// 生成洞察
const generateInsights = async () => {
  try {
    insightsLoading.value = true
    // 模拟AI分析
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('智能洞察生成完成')
  } catch (error) {
    ElMessage.error('洞察生成失败')
  } finally {
    insightsLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.analytics-center {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  padding: var(--spacing-xl);

  .center-content {
    background: var(--el-bg-color);
    border-radius: var(--text-sm);
    padding: var(--text-3xl);
    box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--shadow-light);
    margin: 0 auto;
    max-width: 100%; max-width: 1400px;
  }

  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-3xl);
    padding: var(--text-3xl);
    background: linear-gradient(135deg, var(--primary-color), var(--ai-primary));
    border-radius: var(--text-sm);
    color: white;

    .welcome-content {
      flex: 1;

      h2 {
        font-size: var(--text-3xl);
        font-weight: 600;
        margin: 0 0 var(--spacing-sm) 0;
        display: flex;
        align-items: center;
      }

      p {
        font-size: var(--text-lg);
        opacity: 0.9;
        margin: 0;
        line-height: 1.5;
      }
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .analytics-tabs {
    :deep(.center-tabs) {
      .el-tabs__header {
        background: var(--bg-color, var(--bg-white));
        border-radius: var(--spacing-sm);
        padding: var(--spacing-xs);
        margin-bottom: var(--spacing-xl);
      }

      .el-tabs__nav-wrap {
        &::after {
          display: none;
        }
      }

      .el-tabs__item {
        border-radius: var(--radius-md);
        margin: 0 var(--spacing-xs);
        transition: all 0.3s ease;

        &.is-active {
          background: var(--el-bg-color);
          box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
          color: var(--primary-color);
        }

        &:hover:not(.is-active) {
          color: var(--primary-color);
        }
      }
    }
  }

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-3xl);
  }

  .analytics-features {
    .section-title {
      font-size: var(--text-2xl);
      font-weight: 600;
      margin-bottom: var(--text-2xl);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--color-gray-700);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--text-2xl);
    }

    .feature-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-xl);
      background: var(--el-bg-color);
      border-radius: var(--text-sm);
      border: var(--border-width-base) solid var(--border-color);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(var(--transform-hover-lift));
        box-shadow: 0 var(--spacing-sm) 25px var(--shadow-light);
        border-color: var(--primary-color);
      }

      .feature-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--text-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-lg);
        font-size: var(--text-2xl);

        &.primary { background: linear-gradient(135deg, var(--primary-color), var(--ai-primary)); color: white; }
        &.success { background: linear-gradient(135deg, var(--el-color-success), var(--el-color-success-dark-2)); color: white; }
        &.info { background: linear-gradient(135deg, var(--el-color-info), var(--el-color-info-dark-2)); color: white; }
        &.warning { background: linear-gradient(135deg, var(--el-color-warning), var(--el-color-warning-dark-2)); color: white; }
        &.danger { background: linear-gradient(135deg, var(--el-color-danger), var(--el-color-danger-dark-2)); color: white; }
      }

      .feature-content {
        flex: 1;

        h4 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--color-gray-900);
        }

        p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }
      }
    }
  }

  .reports-section {
    .reports-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);

      h3 {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--color-gray-700);
        margin: 0;
      }
    }

    .reports-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);

      .report-stat-card {
        padding: var(--spacing-xl);
        background: var(--bg-color, var(--bg-white));
        border-radius: var(--spacing-sm);
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
            background: #dcfce7;
            color: #16a34a;
          }

          &.neutral {
            background: #f3f4f6;
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
        background: var(--bg-color, var(--bg-white));
        border-radius: var(--text-sm);
        border: var(--border-width-base) solid var(--border-color);

        h4 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--color-gray-700);
          margin: 0 0 var(--text-lg) 0;
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
            background: linear-gradient(90deg, var(--primary-color), var(--ai-primary));
            border-radius: var(--radius-xs);
            position: relative;

            &::before {
              content: '';
              position: absolute;
              top: -var(--text-2xl);
              left: 20%;
              width: 60%;
              min-height: 32px; height: auto;
              background: linear-gradient(90deg, var(--success-color), #059669);
              border-radius: var(--radius-xs);
            }

            &::after {
              content: '';
              position: absolute;
              top: var(--position-negative-10xl);
              left: 10%;
              width: 70%;
              min-height: 32px; height: auto;
              background: linear-gradient(90deg, var(--warning-color), #d97706);
              border-radius: var(--radius-xs);
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
      margin-bottom: var(--spacing-xl);

      h3 {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--color-gray-700);
        margin: 0;
      }
    }

    .insights-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);

      .insight-card {
        display: flex;
        padding: var(--spacing-xl);
        background: var(--bg-color, var(--bg-white));
        border-radius: var(--text-sm);
        border-left: var(--spacing-xs) solid var(--primary-color);

        .insight-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--spacing-sm);
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--spacing-lg);
          font-size: var(--text-xl);
        }

        .insight-content {
          flex: 1;

          h4 {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--color-gray-900);
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
            gap: var(--spacing-lg);
            font-size: var(--text-sm);

            .confidence {
              color: #16a34a;
              font-weight: 600;
            }

            .generated-time {
              color: var(--text-tertiary);
            }
          }
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .analytics-center {
    padding: var(--text-sm);

    .center-content {
      padding: var(--text-lg);
    }

    .welcome-section {
      flex-direction: column;
      gap: var(--spacing-lg);
      text-align: center;
    }

    .stats-overview {
      grid-template-columns: 1fr;
    }

    .features-grid {
      grid-template-columns: 1fr !important;
    }

    .charts-grid {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>