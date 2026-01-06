<template>
  <PageContainer
    title="数据分析中心"
    :show-breadcrumb="false"
    @create="handleCreate"
    @tab-change="handleTabChange"
  >
    <!-- 概览标签页 -->
    <template #tab-overview>
      <div class="overview-content">
        <!-- 欢迎词 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h2>欢迎来到数据分析中心</h2>
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

        <!-- 统计卡片区域 -->
        <div class="stats-section">
          <div class="cds-grid">
            <div class="cds-row">
              <div
                v-for="stat in overviewStats"
                :key="stat.key"
                class="cds-col-lg-4 cds-col-md-8 cds-col-sm-4"
              >
                <StatCard
                  :title="stat.title"
                  :value="stat.value"
                  :unit="stat.unit"
                  :trend="stat.trend"
                  :trend-text="stat.trendText"
                  :type="stat.type"
                  :icon-name="stat.iconName"
                  clickable
                  @click="handleStatClick(stat)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
          <div class="cds-grid">
            <div class="cds-row">
              <div class="cds-col-lg-8 cds-col-md-8 cds-col-sm-4">
                <ChartContainer
                  title="数据增长趋势"
                  subtitle="最近6个月数据量变化"
                  :options="dataGrowthChart"
                  :loading="chartsLoading"
                  height="var(--chart-height-sm)"
                  @refresh="refreshCharts"
                />
              </div>
              <div class="cds-col-lg-8 cds-col-md-8 cds-col-sm-4">
                <ChartContainer
                  title="分析维度分布"
                  subtitle="各业务模块数据占比"
                  :options="dimensionDistributionChart"
                  :loading="chartsLoading"
                  height="var(--chart-height-sm)"
                  @refresh="refreshCharts"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 快速分析功能 -->
        <div class="quick-analysis-section">
          <div class="section-header">
            <h3>快速分析</h3>
            <p>选择您需要分析的业务模块</p>
          </div>
          <div class="analysis-grid">
            <div
              v-for="analysis in quickAnalysisList"
              :key="analysis.key"
              class="analysis-card"
              @click="handleAnalysisClick(analysis)"
            >
              <div class="analysis-icon" :class="analysis.color">
                <UnifiedIcon name="default" />
              </div>
              <div class="analysis-content">
                <h4>{{ analysis.title }}</h4>
                <p>{{ analysis.description }}</p>
                <div class="analysis-stats">
                  <span class="stat-item">
                    <strong>{{ analysis.dataCount }}</strong> 数据点
                  </span>
                  <span class="stat-divider">|</span>
                  <span class="stat-item">
                    <strong>{{ analysis.reportCount }}</strong> 报表
                  </span>
                </div>
              </div>
              <div class="analysis-status" :class="analysis.status">
                {{ analysis.statusText }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 数据报表标签页 -->
    <template #tab-reports>
      <div class="reports-content">
        <div class="reports-header">
          <div class="header-info">
            <h3>数据报表</h3>
            <p>管理和生成各类业务报表</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="createReport">
              <UnifiedIcon name="Plus" />
              新建报表
            </el-button>
            <el-button @click="refreshReports" :loading="reportsLoading">
              <UnifiedIcon name="Refresh" />
              刷新
            </el-button>
          </div>
        </div>

        <!-- 报表统计 -->
        <div class="reports-stats">
          <div class="cds-grid">
            <div class="cds-row">
              <div class="cds-col-lg-4 cds-col-md-8 cds-col-sm-4">
                <div class="report-stat-card">
                  <div class="stat-icon daily">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ reportStats.daily }}</div>
                    <div class="stat-label">日报</div>
                    <div class="stat-trend positive">+5.2%</div>
                  </div>
                </div>
              </div>
              <div class="cds-col-lg-4 cds-col-md-8 cds-col-sm-4">
                <div class="report-stat-card">
                  <div class="stat-icon weekly">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ reportStats.weekly }}</div>
                    <div class="stat-label">周报</div>
                    <div class="stat-trend positive">+2.8%</div>
                  </div>
                </div>
              </div>
              <div class="cds-col-lg-4 cds-col-md-8 cds-col-sm-4">
                <div class="report-stat-card">
                  <div class="stat-icon monthly">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ reportStats.monthly }}</div>
                    <div class="stat-label">月报</div>
                    <div class="stat-trend neutral">0.0%</div>
                  </div>
                </div>
              </div>
              <div class="cds-col-lg-4 cds-col-md-8 cds-col-sm-4">
                <div class="report-stat-card">
                  <div class="stat-icon custom">
                    <UnifiedIcon name="default" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ reportStats.custom }}</div>
                    <div class="stat-label">自定义</div>
                    <div class="stat-trend positive">+12.1%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 报表列表 -->
        <div class="reports-list">
          <DataTable
            :data="reportsData"
            :columns="reportsColumns"
            :loading="reportsLoading"
            :total="reportsTotal"
            :page="reportsPage"
            :page-size="reportsPageSize"
            @page-change="handleReportsPageChange"
            @size-change="handleReportsPageSizeChange"
            @sort-change="handleReportsSort"
          >
            <template #actions="{ row }">
              <el-button link type="primary" @click="viewReport(row)">
                查看
              </el-button>
              <el-button link type="success" @click="downloadReport(row)">
                下载
              </el-button>
              <el-button link type="warning" @click="editReport(row)">
                编辑
              </el-button>
              <el-button link type="danger" @click="deleteReport(row)">
                删除
              </el-button>
            </template>
          </DataTable>
        </div>
      </div>
    </template>

    <!-- 数据可视化标签页 -->
    <template #tab-visualization>
      <div class="visualization-content">
        <div class="visualization-header">
          <div class="header-info">
            <h3>数据可视化</h3>
            <p>通过图表直观展示数据洞察</p>
          </div>
          <div class="header-controls">
            <el-select v-model="visualizationType" placeholder="选择图表类型" class="chart-type-select">
              <el-option label="趋势图" value="trend" />
              <el-option label="柱状图" value="bar" />
              <el-option label="饼图" value="pie" />
              <el-option label="散点图" value="scatter" />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="date-range-picker"
            />
            <el-button type="primary" @click="updateVisualization" class="update-chart-btn">
              <UnifiedIcon name="default" />
              更新图表
            </el-button>
          </div>
        </div>

        <!-- 图表展示区域 -->
        <div class="charts-display">
          <div class="cds-grid">
            <div class="cds-row">
              <div class="cds-col-lg-8 cds-col-md-8 cds-col-sm-4">
                <ChartContainer
                  title="业务数据趋势"
                  subtitle="各业务模块数据变化趋势"
                  :options="businessTrendChart"
                  :loading="chartsLoading"
                  height="var(--chart-height-md)"
                  @refresh="refreshCharts"
                />
              </div>
              <div class="cds-col-lg-8 cds-col-md-8 cds-col-sm-4">
                <ChartContainer
                  title="用户行为分析"
                  subtitle="用户使用各功能模块统计"
                  :options="userBehaviorChart"
                  :loading="chartsLoading"
                  height="var(--chart-height-md)"
                  @refresh="refreshCharts"
                />
              </div>
            </div>
            <div class="cds-row second-chart-row">
              <div class="cds-col-lg-8 cds-col-md-8 cds-col-sm-4">
                <ChartContainer
                  title="财务数据分析"
                  subtitle="收入支出及利润情况"
                  :options="financialChart"
                  :loading="chartsLoading"
                  height="var(--chart-height-sm)"
                  @refresh="refreshCharts"
                />
              </div>
              <div class="cds-col-lg-8 cds-col-md-8 cds-col-sm-4">
                <ChartContainer
                  title="运营效率指标"
                  subtitle="各项运营KPI表现"
                  :options="operationalChart"
                  :loading="chartsLoading"
                  height="var(--chart-height-sm)"
                  @refresh="refreshCharts"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 智能洞察标签页 -->
    <template #tab-insights>
      <div class="insights-content">
        <div class="insights-header">
          <div class="header-info">
            <h3>智能洞察</h3>
            <p>基于AI的数据分析洞察和建议</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="generateInsights" :loading="insightsLoading">
              <UnifiedIcon name="default" />
              生成洞察
            </el-button>
          </div>
        </div>

        <!-- AI洞察卡片 -->
        <div class="insights-grid">
          <div
            v-for="insight in intelligentInsights"
            :key="insight.id"
            class="insight-card"
            :class="insight.priority"
          >
            <div class="insight-header">
              <div class="insight-icon" :class="insight.type">
                <UnifiedIcon name="default" />
              </div>
              <div class="insight-meta">
                <h4>{{ insight.title }}</h4>
                <div class="insight-tags">
                  <el-tag :type="insight.priority === 'high' ? 'danger' : insight.priority === 'medium' ? 'warning' : 'info'" size="small">
                    {{ insight.priorityText }}
                  </el-tag>
                  <el-tag size="small" plain>{{ insight.category }}</el-tag>
                </div>
              </div>
            </div>
            <div class="insight-content">
              <p>{{ insight.description }}</p>
              <div class="insight-metrics">
                <div class="metric-item">
                  <span class="metric-label">置信度</span>
                  <el-progress :percentage="insight.confidence" :stroke-width="var(--progress-stroke-width-sm)" />
                </div>
                <div class="metric-item">
                  <span class="metric-label">影响力</span>
                  <div class="impact-level" :class="insight.impact">
                    {{ insight.impactText }}
                  </div>
                </div>
              </div>
            </div>
            <div class="insight-actions">
              <el-button link type="primary" @click="viewInsightDetail(insight)">
                查看详情
              </el-button>
              <el-button link type="success" @click="applyInsight(insight)">
                应用建议
              </el-button>
            </div>
          </div>
        </div>

        <!-- 智能推荐 -->
        <div class="recommendations-section">
          <h3>智能推荐</h3>
          <div class="recommendations-list">
            <div
              v-for="recommendation in recommendations"
              :key="recommendation.id"
              class="recommendation-item"
            >
              <div class="recommendation-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="recommendation-content">
                <h4>{{ recommendation.title }}</h4>
                <p>{{ recommendation.description }}</p>
                <div class="recommendation-meta">
                  <span class="expected-benefit">预期提升: {{ recommendation.expectedImprovement }}</span>
                  <span class="difficulty">难度: {{ recommendation.difficulty }}</span>
                </div>
              </div>
              <div class="recommendation-actions">
                <el-button size="small" type="primary" @click="implementRecommendation(recommendation)">
                  实施
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 自定义分析标签页 -->
    <template #tab-custom>
      <div class="custom-content">
        <div class="custom-header">
          <div class="header-info">
            <h3>自定义分析</h3>
            <p>创建个性化的数据分析报表</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="createCustomAnalysis">
              <UnifiedIcon name="Plus" />
              新建分析
            </el-button>
          </div>
        </div>

        <!-- 分析构建器 -->
        <div class="analysis-builder" v-if="showBuilder">
          <div class="builder-steps">
            <el-steps :active="builderStep" finish-status="success">
              <el-step title="数据源选择" description="选择要分析的数据" />
              <el-step title="维度配置" description="设置分析维度和指标" />
              <el-step title="可视化设置" description="选择图表类型和样式" />
              <el-step title="完成设置" description="保存并生成分析" />
            </el-steps>
          </div>
          
          <div class="builder-content">
            <!-- 步骤1: 数据源选择 -->
            <div v-if="builderStep === 0" class="step-content">
              <h4>选择数据源</h4>
              <div class="data-source-grid">
                <div
                  v-for="source in dataSources"
                  :key="source.key"
                  class="data-source-card"
                  :class="{ active: selectedDataSource === source.key }"
                  @click="selectDataSource(source.key)"
                >
                  <div class="source-icon">
                    <UnifiedIcon name="default" />
                  </div>
                  <h5>{{ source.name }}</h5>
                  <p>{{ source.description }}</p>
                  <div class="source-stats">
                    <span>{{ source.recordCount }} 条记录</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 步骤2: 维度配置 -->
            <div v-if="builderStep === 1" class="step-content">
              <h4>配置分析维度</h4>
              <div class="dimension-config">
                <div class="config-section">
                  <h5>选择维度</h5>
                  <el-checkbox-group v-model="selectedDimensions">
                    <el-checkbox
                      v-for="dimension in availableDimensions"
                      :key="dimension.key"
                      :label="dimension.key"
                    >
                      {{ dimension.name }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
                <div class="config-section">
                  <h5>选择指标</h5>
                  <el-checkbox-group v-model="selectedMetrics">
                    <el-checkbox
                      v-for="metric in availableMetrics"
                      :key="metric.key"
                      :label="metric.key"
                    >
                      {{ metric.name }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
            </div>

            <!-- 步骤3: 可视化设置 -->
            <div v-if="builderStep === 2" class="step-content">
              <h4>可视化设置</h4>
              <div class="visualization-config">
                <div class="config-item">
                  <label>图表类型</label>
                  <el-select v-model="customChartType" placeholder="选择图表类型">
                    <el-option label="柱状图" value="bar" />
                    <el-option label="折线图" value="line" />
                    <el-option label="饼图" value="pie" />
                    <el-option label="散点图" value="scatter" />
                    <el-option label="热力图" value="heatmap" />
                  </el-select>
                </div>
                <div class="config-item">
                  <label>时间范围</label>
                  <el-date-picker
                    v-model="customDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  />
                </div>
                <div class="config-item">
                  <label>刷新频率</label>
                  <el-select v-model="customRefreshRate" placeholder="选择刷新频率">
                    <el-option label="实时" value="realtime" />
                    <el-option label="每小时" value="hourly" />
                    <el-option label="每日" value="daily" />
                    <el-option label="每周" value="weekly" />
                  </el-select>
                </div>
              </div>
            </div>

            <!-- 步骤4: 完成设置 -->
            <div v-if="builderStep === 3" class="step-content">
              <h4>完成分析设置</h4>
              <div class="analysis-summary">
                <div class="summary-item">
                  <label>分析名称</label>
                  <el-input v-model="customAnalysisName" placeholder="输入分析名称" />
                </div>
                <div class="summary-item">
                  <label>描述</label>
                  <el-input
                    v-model="customAnalysisDescription"
                    type="textarea"
                    placeholder="输入分析描述"
                    :rows="var(--textarea-rows)"
                  />
                </div>
                <div class="summary-preview">
                  <h5>配置预览</h5>
                  <div class="preview-content">
                    <p><strong>数据源:</strong> {{ getDataSourceName(selectedDataSource) }}</p>
                    <p><strong>维度:</strong> {{ selectedDimensions.length }} 个</p>
                    <p><strong>指标:</strong> {{ selectedMetrics.length }} 个</p>
                    <p><strong>图表类型:</strong> {{ getChartTypeName(customChartType) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="builder-actions">
            <el-button v-if="builderStep > 0" @click="builderStep--">上一步</el-button>
            <el-button
              v-if="builderStep < 3"
              type="primary"
              @click="builderStep++"
              :disabled="!canProceedToNextStep"
            >
              下一步
            </el-button>
            <el-button
              v-if="builderStep === 3"
              type="success"
              @click="saveCustomAnalysis"
              :loading="savingCustomAnalysis"
            >
              保存分析
            </el-button>
            <el-button @click="cancelBuilder">取消</el-button>
          </div>
        </div>

        <!-- 已创建的自定义分析列表 -->
        <div class="custom-analysis-list" v-if="!showBuilder">
          <div class="analysis-grid">
            <div
              v-for="analysis in customAnalysisList"
              :key="analysis.id"
              class="custom-analysis-card"
            >
              <div class="analysis-preview">
                <div class="chart-thumbnail">
                  <UnifiedIcon name="default" />
                </div>
              </div>
              <div class="analysis-info">
                <h4>{{ analysis.name }}</h4>
                <p>{{ analysis.description }}</p>
                <div class="analysis-meta">
                  <span class="meta-item">
                    <UnifiedIcon name="default" />
                    {{ formatDate(analysis.createdAt) }}
                  </span>
                  <span class="meta-item">
                    <UnifiedIcon name="eye" />
                    {{ analysis.viewCount }} 次查看
                  </span>
                </div>
              </div>
              <div class="analysis-actions">
                <el-button link type="primary" @click="viewCustomAnalysis(analysis)">
                  查看
                </el-button>
                <el-button link type="warning" @click="editCustomAnalysis(analysis)">
                  编辑
                </el-button>
                <el-button link type="danger" @click="deleteCustomAnalysis(analysis)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Refresh,
  ArrowDown,
  TrendCharts,
  Calendar,
  Histogram,
  DataLine,
  Setting,
  Magic,
  Star,
  View,
  UserFilled,
  Money,
  Trophy,
  Promotion,
  Operation
} from '@element-plus/icons-vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import StatCard from '@/components/centers/StatCard.vue'
import ChartContainer from '@/components/centers/ChartContainer.vue'
import DataTable from '@/components/centers/DataTable.vue'
import { formatDate, formatNumber } from '@/utils/format'
import { resolveCssColor, getPrimaryColor, getSuccessColor, getWarningColor, getDangerColor } from '@/utils/color-tokens'

// 路由
const router = useRouter()

// 常量定义
const CONSTANTS = {
  GRID_MIN_WIDTH: {
    ANALYSIS: '300px',
    INSIGHT: '350px',
    DATA_SOURCE: '250px',
    CUSTOM_ANALYSIS: '300px'
  },
  MIN_HEIGHT: {
    STEP_CONTENT: '300px',
    ANALYSIS_PREVIEW: '120px'
  },
  BORDER_WIDTH: {
    DATA_SOURCE: '2px'
  },
  TIMING: {
    REFRESH_DELAY: 2000,
    CHART_DELAY: 1500,
    INSIGHTS_DELAY: 3000,
    REPORTS_DELAY: 1000
  }
}

// 标签页配置
const tabs = [
  { key: 'overview', label: '概览', icon: 'TrendCharts' },
  { key: 'reports', label: '数据报表', icon: 'Document' },
  { key: 'visualization', label: '数据可视化', icon: 'DataLine' },
  { key: 'insights', label: '智能洞察', icon: 'Magic' },
  { key: 'custom', label: '自定义分析', icon: 'Setting' }
]

// 当前活跃标签页
const activeTab = ref('overview')

// 加载状态
const loading = ref(false)
const chartsLoading = ref(false)
const reportsLoading = ref(false)
const insightsLoading = ref(false)

// 概览统计数据
const overviewStats = ref([
  {
    key: 'totalRecords',
    title: '数据总量',
    value: '2,847,692',
    unit: '条',
    trend: 8.5,
    trendText: '比上月增长',
    type: 'primary',
    iconName: 'Database'
  },
  {
    key: 'totalReports',
    title: '报表数量',
    value: '156',
    unit: '份',
    trend: 12.3,
    trendText: '新增报表',
    type: 'success',
    iconName: 'Document'
  },
  {
    key: 'analysisDimensions',
    title: '分析维度',
    value: '42',
    unit: '个',
    trend: 5.8,
    trendText: '新增维度',
    type: 'info',
    iconName: 'Grid'
  },
  {
    key: 'dataQuality',
    title: '数据质量',
    value: '94.2',
    unit: '%',
    trend: 2.1,
    trendText: '质量提升',
    type: 'warning',
    iconName: 'Shield'
  }
])

// 快速分析列表
const quickAnalysisList = ref([
  {
    key: 'enrollment',
    title: '招生分析',
    description: '学生招生数据统计与趋势分析，包括报名转化率、渠道效果等关键指标。',
    icon: 'UserFilled',
    color: 'primary',
    dataCount: '12,486',
    reportCount: '23',
    status: 'active',
    statusText: '运行中'
  },
  {
    key: 'financial',
    title: '财务分析',
    description: '收入支出分析、成本控制统计，提供详细的财务状况报告。',
    icon: 'Money',
    color: 'success',
    dataCount: '8,924',
    reportCount: '18',
    status: 'active',
    statusText: '运行中'
  },
  {
    key: 'performance',
    title: '绩效分析',
    description: '教师绩效评估、学生成长跟踪，全方位的绩效数据分析。',
    icon: 'star',
    color: 'info',
    dataCount: '5,672',
    reportCount: '15',
    status: 'pending',
    statusText: '待更新'
  },
  {
    key: 'marketing',
    title: '营销分析',
    description: '营销活动效果分析、客户转化统计，提升营销ROI。',
    icon: 'Promotion',
    color: 'danger',
    dataCount: '9,358',
    reportCount: '21',
    status: 'active',
    statusText: '运行中'
  },
  {
    key: 'operations',
    title: '运营分析',
    description: '系统运营数据分析、用户行为统计，优化运营策略。',
    icon: 'Operation',
    color: 'warning',
    dataCount: '15,742',
    reportCount: '27',
    status: 'active',
    statusText: '运行中'
  }
])

// 图表配置
const dataGrowthChart = ref({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: { type: 'value' },
  series: [{
    name: '数据量',
    type: 'line',
    data: [2100000, 2200000, 2350000, 2500000, 2680000, 2847692],
    smooth: true,
    itemStyle: { color: getPrimaryColor() }
  }]
})

const dimensionDistributionChart = ref({
  tooltip: { trigger: 'item' },
  series: [{
    name: '数据分布',
    type: 'pie',
    radius: '60%',
    data: [
      { value: 28, name: '招生数据' },
      { value: 22, name: '财务数据' },
      { value: 18, name: '用户数据' },
      { value: 15, name: '运营数据' },
      { value: 17, name: '其他数据' }
    ]
  }]
})

// 报表相关数据
const reportStats = ref({
  daily: 45,
  weekly: 12,
  monthly: 8,
  custom: 25
})

const reportsData = ref([])
const reportsColumns = ref([
  { prop: 'name', label: '报表名称', width: 'var(--table-column-width-lg)' },
  { prop: 'type', label: '类型', width: 'var(--table-column-width-sm)' },
  { prop: 'frequency', label: '频率', width: 'var(--table-column-width-sm)' },
  { prop: 'lastGenerated', label: '最后生成时间', width: 'var(--table-column-width-lg)' },
  { prop: 'status', label: '状态', width: 'var(--table-column-width-sm)' },
  { prop: 'actions', label: '操作', width: 'var(--table-actions-width)', slot: 'actions' }
])

// 智能洞察数据
const intelligentInsights = ref([
  {
    id: 1,
    title: '招生转化率异常',
    description: '最近一周招生转化率下降15%，建议检查营销渠道效果和优化报名流程。',
    type: 'warning',
    priority: 'high',
    priorityText: '高优先级',
    category: '招生分析',
    confidence: 87,
    impact: 'high',
    impactText: '高影响',
    icon: 'Warning'
  },
  {
    id: 2,
    title: '财务收入增长机会',
    description: '数据显示课外活动参与度提升，建议增加相关付费项目。',
    type: 'success',
    priority: 'medium',
    priorityText: '中优先级',
    category: '财务分析',
    confidence: 92,
    impact: 'medium',
    impactText: '中等影响',
    icon: 'TrendCharts'
  }
])

// 推荐列表
const recommendations = ref([
  {
    id: 1,
    title: '优化数据采集频率',
    description: '建议将关键业务数据采集频率从每日调整为实时，以提高决策时效性。',
    expectedImprovement: '25%',
    difficulty: '中等'
  },
  {
    id: 2,
    title: '建立预警机制',
    description: '针对关键指标建立自动预警机制，及时发现异常情况。',
    expectedImprovement: '40%',
    difficulty: '较低'
  }
])

// 自定义分析相关
const showBuilder = ref(false)
const builderStep = ref(0)
const selectedDataSource = ref('')
const selectedDimensions = ref([])
const selectedMetrics = ref([])
const customChartType = ref('')
const customDateRange = ref([])
const customRefreshRate = ref('')
const customAnalysisName = ref('')
const customAnalysisDescription = ref('')
const savingCustomAnalysis = ref(false)

// 数据源配置
const dataSources = ref([
  {
    key: 'enrollment',
    name: '招生数据',
    description: '学生报名、录取相关数据',
    icon: 'User',
    recordCount: '12,486'
  },
  {
    key: 'financial',
    name: '财务数据',
    description: '收支、费用相关数据',
    icon: 'Money',
    recordCount: '8,924'
  },
  {
    key: 'activity',
    name: '活动数据',
    description: '各类活动参与数据',
    icon: 'calendar',
    recordCount: '15,672'
  }
])

// 可用维度和指标
const availableDimensions = ref([
  { key: 'time', name: '时间维度' },
  { key: 'region', name: '地区维度' },
  { key: 'channel', name: '渠道维度' },
  { key: 'category', name: '分类维度' }
])

const availableMetrics = ref([
  { key: 'count', name: '数量' },
  { key: 'sum', name: '总和' },
  { key: 'avg', name: '平均值' },
  { key: 'rate', name: '比率' }
])

// 自定义分析列表
const customAnalysisList = ref([
  {
    id: 1,
    name: '招生渠道效果分析',
    description: '分析各招生渠道的转化效果',
    createdAt: new Date(Date.now() - 86400000 * 7),
    viewCount: 156
  },
  {
    id: 2,
    name: '月度财务报表',
    description: '每月收支情况详细分析',
    createdAt: new Date(Date.now() - 86400000 * 3),
    viewCount: 89
  }
])

// 计算属性
const canProceedToNextStep = computed(() => {
  switch (builderStep.value) {
    case 0:
      return selectedDataSource.value !== ''
    case 1:
      return selectedDimensions.value.length > 0 && selectedMetrics.value.length > 0
    case 2:
      return customChartType.value !== '' && customDateRange.value.length === 2
    case 3:
      return customAnalysisName.value.trim() !== ''
    default:
      return false
  }
})

// 方法
const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

const handleCreate = () => {
  ElMessage.success('创建新的数据分析')
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据刷新完成')
  }, CONSTANTS.TIMING.REFRESH_DELAY)
}

const exportReport = (format: string) => {
  ElMessage.success(`导出${format.toUpperCase()}格式报表`)
}

const handleStatClick = (stat: any) => {
  ElMessage.info(`查看${stat.title}详情`)
}

const refreshCharts = () => {
  chartsLoading.value = true
  setTimeout(() => {
    chartsLoading.value = false
  }, CONSTANTS.TIMING.CHART_DELAY)
}

const handleAnalysisClick = (analysis: any) => {
  router.push(`/analytics/detail/${analysis.key}`)
}

// 报表相关方法
const createReport = () => {
  ElMessage.success('创建新报表')
}

const refreshReports = () => {
  reportsLoading.value = true
  setTimeout(() => {
    reportsLoading.value = false
  }, CONSTANTS.TIMING.REPORTS_DELAY)
}

const viewReport = (report: any) => {
  ElMessage.info(`查看报表: ${report.name}`)
}

const downloadReport = (report: any) => {
  ElMessage.success(`下载报表: ${report.name}`)
}

const editReport = (report: any) => {
  ElMessage.info(`编辑报表: ${report.name}`)
}

const deleteReport = (report: any) => {
  ElMessage.warning(`删除报表: ${report.name}`)
}

// 可视化相关
const visualizationType = ref('trend')
const dateRange = ref([])

const updateVisualization = () => {
  chartsLoading.value = true
  setTimeout(() => {
    chartsLoading.value = false
    ElMessage.success('图表已更新')
  }, CONSTANTS.TIMING.CHART_DELAY)
}

// 智能洞察相关
const generateInsights = () => {
  insightsLoading.value = true
  setTimeout(() => {
    insightsLoading.value = false
    ElMessage.success('AI洞察生成完成')
  }, CONSTANTS.TIMING.INSIGHTS_DELAY)
}

const viewInsightDetail = (insight: any) => {
  ElMessage.info(`查看洞察详情: ${insight.title}`)
}

const applyInsight = (insight: any) => {
  ElMessage.success(`应用建议: ${insight.title}`)
}

const implementRecommendation = (recommendation: any) => {
  ElMessage.success(`实施推荐: ${recommendation.title}`)
}

// 自定义分析相关方法
const createCustomAnalysis = () => {
  showBuilder.value = true
  builderStep.value = 0
  // 重置表单
  selectedDataSource.value = ''
  selectedDimensions.value = []
  selectedMetrics.value = []
  customChartType.value = ''
  customDateRange.value = []
  customRefreshRate.value = ''
  customAnalysisName.value = ''
  customAnalysisDescription.value = ''
}

const cancelBuilder = () => {
  showBuilder.value = false
}

const selectDataSource = (sourceKey: string) => {
  selectedDataSource.value = sourceKey
}

const saveCustomAnalysis = () => {
  savingCustomAnalysis.value = true
  setTimeout(() => {
    savingCustomAnalysis.value = false
    showBuilder.value = false
    ElMessage.success('自定义分析创建成功')
    // 添加到列表
    customAnalysisList.value.unshift({
      id: Date.now(),
      name: customAnalysisName.value,
      description: customAnalysisDescription.value,
      createdAt: new Date(),
      viewCount: 0
    })
  }, CONSTANTS.TIMING.REFRESH_DELAY)
}

const getDataSourceName = (key: string) => {
  const source = dataSources.value.find(s => s.key === key)
  return source ? source.name : key
}

const getChartTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    bar: '柱状图',
    line: '折线图',
    pie: '饼图',
    scatter: '散点图',
    heatmap: '热力图'
  }
  return typeMap[type] || type
}

const viewCustomAnalysis = (analysis: any) => {
  ElMessage.info(`查看自定义分析: ${analysis.name}`)
}

const editCustomAnalysis = (analysis: any) => {
  ElMessage.info(`编辑自定义分析: ${analysis.name}`)
}

const deleteCustomAnalysis = (analysis: any) => {
  ElMessage.warning(`删除自定义分析: ${analysis.name}`)
}

// 组件挂载时初始化数据
onMounted(() => {
  console.log('数据分析中心已加载')
  // 初始化图表数据
  refreshCharts()
})
</script>

<style scoped lang="scss">
.overview-content {
  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-8xl);
    padding: var(--text-3xl);
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);

    .welcome-content {
      h2 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
        font-size: var(--text-3xl);
        font-weight: 600;
      }

      p {
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
      }
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .stats-section {
    margin-bottom: var(--spacing-8xl);
  }

  .charts-section {
    margin-bottom: var(--spacing-8xl);
  }

  .quick-analysis-section {
    .section-header {
      margin-bottom: var(--text-2xl);
      text-align: center;

      h3 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width-analysis), 1fr));
      gap: var(--text-2xl);
    }

    .analysis-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--text-3xl);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-var(--spacing-xs));
        box-shadow: var(--shadow-lg);
      }

      .analysis-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--text-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--text-lg);

        &.primary {
          background: var(--primary-bg);
          color: var(--primary-color);
        }

        &.success {
          background: var(--success-bg);
          color: var(--success-color);
        }

        &.info {
          background: var(--info-bg);
          color: var(--info-color);
        }

        &.danger {
          background: var(--danger-bg);
          color: var(--danger-color);
        }

        &.warning {
          background: var(--warning-bg);
          color: var(--warning-color);
        }
      }

      .analysis-content {
        h4 {
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
          font-size: var(--text-lg);
          font-weight: 600;
        }

        p {
          color: var(--text-secondary);
          margin-bottom: var(--text-lg);
          line-height: 1.6;
          font-size: var(--text-base);
        }

        .analysis-stats {
          display: flex;
          align-items: center;
          gap: var(--text-sm);
          font-size: var(--text-sm);

          .stat-item {
            color: var(--text-secondary);

            strong {
              color: var(--text-primary);
            }
          }

          .stat-divider {
            color: var(--border-color);
          }
        }
      }

      .analysis-status {
        margin-top: var(--text-lg);
        padding: var(--spacing-xs) var(--text-sm);
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
        font-weight: 500;
        text-align: center;

        &.active {
          background: var(--success-bg);
          color: var(--success-color);
        }

        &.pending {
          background: var(--warning-bg);
          color: var(--warning-color);
        }
      }
    }
  }
}

.reports-content {
  .reports-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-3xl);

    .header-info h3 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .header-info p {
      color: var(--text-secondary);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .reports-stats {
    margin-bottom: var(--spacing-8xl);

    .report-stat-card {
      display: flex;
      align-items: center;
      padding: var(--text-2xl);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);

      .stat-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--text-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--text-lg);

        &.daily {
          background: var(--primary-bg);
          color: var(--primary-color);
        }

        &.weekly {
          background: var(--success-bg);
          color: var(--success-color);
        }

        &.monthly {
          background: var(--info-bg);
          color: var(--info-color);
        }

        &.custom {
          background: var(--warning-bg);
          color: var(--warning-color);
        }
      }

      .stat-content {
        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-trend {
          font-size: var(--text-sm);
          font-weight: 600;

          &.positive {
            color: var(--success-color);
          }

          &.negative {
            color: var(--danger-color);
          }

          &.neutral {
            color: var(--text-muted);
          }
        }
      }
    }
  }
}

.visualization-content {
  .chart-type-select {
    width: var(--form-width-sm);
  }

  .date-range-picker {
    width: var(--form-width-lg);
    margin-left: var(--spacing-sm);
  }

  .update-chart-btn {
    margin-left: var(--spacing-sm);
  }

  .second-chart-row {
    margin-top: var(--text-2xl);
  }

  .visualization-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-3xl);

    .header-info h3 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .header-info p {
      color: var(--text-secondary);
      margin: 0;
    }

    .header-controls {
      display: flex;
      align-items: center;
    }
  }

  .charts-display {
    .cds-row + .cds-row {
      margin-top: var(--text-2xl);
    }
  }
}

.insights-content {
  .insights-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-3xl);

    .header-info h3 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .header-info p {
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width-insight), 1fr));
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);

    .insight-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--text-2xl);
      box-shadow: var(--shadow-sm);
      border-left: var(--spacing-xs) solid var(--border-color);

      &.high {
        border-left-color: var(--danger-color);
      }

      &.medium {
        border-left-color: var(--warning-color);
      }

      &.low {
        border-left-color: var(--info-color);
      }

      .insight-header {
        display: flex;
        align-items: center;
        margin-bottom: var(--text-lg);

        .insight-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--spacing-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--text-sm);

          &.warning {
            background: var(--warning-bg);
            color: var(--warning-color);
          }

          &.success {
            background: var(--success-bg);
            color: var(--success-color);
          }
        }

        .insight-meta {
          h4 {
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
            font-size: var(--text-lg);
          }

          .insight-tags {
            display: flex;
            gap: var(--spacing-sm);
          }
        }
      }

      .insight-content {
        p {
          color: var(--text-secondary);
          margin-bottom: var(--text-lg);
          line-height: 1.6;
        }

        .insight-metrics {
          display: grid;
          gap: var(--text-sm);

          .metric-item {
            .metric-label {
              display: block;
              font-size: var(--text-sm);
              color: var(--text-secondary);
              margin-bottom: var(--spacing-xs);
            }

            .impact-level {
              padding: var(--spacing-sm) var(--spacing-sm);
              border-radius: var(--radius-sm);
              font-size: var(--text-sm);
              font-weight: 500;

              &.high {
                background: var(--danger-bg);
                color: var(--danger-color);
              }

              &.medium {
                background: var(--warning-bg);
                color: var(--warning-color);
              }

              &.low {
                background: var(--info-bg);
                color: var(--info-color);
              }
            }
          }
        }
      }

      .insight-actions {
        margin-top: var(--text-lg);
        display: flex;
        gap: var(--text-sm);
      }
    }
  }

  .recommendations-section {
    h3 {
      color: var(--text-primary);
      margin-bottom: var(--text-lg);
    }

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: var(--text-lg);

      .recommendation-item {
        display: flex;
        align-items: center;
        padding: var(--text-lg);
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);

        .recommendation-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--radius-full);
          background: var(--primary-bg);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--text-lg);
        }

        .recommendation-content {
          flex: 1;

          h4 {
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
            font-size: var(--text-lg);
          }

          p {
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
            line-height: 1.5;
          }

          .recommendation-meta {
            font-size: var(--text-sm);
            color: var(--text-muted);

            span + span {
              margin-left: var(--text-sm);
            }
          }
        }

        .recommendation-actions {
          margin-left: var(--text-lg);
        }
      }
    }
  }
}

.custom-content {
  .custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-3xl);

    .header-info h3 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .header-info p {
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .analysis-builder {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--text-3xl);
    margin-bottom: var(--spacing-8xl);

    .builder-steps {
      margin-bottom: var(--spacing-8xl);
    }

    .step-content {
      min-height: var(--step-content-height);

      h4 {
        color: var(--text-primary);
        margin-bottom: var(--text-2xl);
      }

      .data-source-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width-data-source), 1fr));
        gap: var(--text-lg);

        .data-source-card {
          padding: var(--text-2xl);
          border: var(--data-source-border-width) solid var(--border-color);
          border-radius: var(--radius-lg);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover,
          &.active {
            border-color: var(--primary-color);
            background: var(--primary-bg);
          }

          .source-icon {
            color: var(--primary-color);
            margin-bottom: var(--text-sm);
          }

          h5 {
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
          }

          p {
            color: var(--text-secondary);
            font-size: var(--text-base);
            margin-bottom: var(--text-sm);
          }

          .source-stats {
            font-size: var(--text-sm);
            color: var(--text-muted);
          }
        }
      }

      .dimension-config {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-8xl);

        .config-section {
          h5 {
            color: var(--text-primary);
            margin-bottom: var(--text-lg);
          }
        }
      }

      .visualization-config {
        display: grid;
        gap: var(--text-2xl);

        .config-item {
          label {
            display: block;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
            font-weight: 500;
          }
        }
      }

      .analysis-summary {
        .summary-item {
          margin-bottom: var(--text-2xl);

          label {
            display: block;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
            font-weight: 500;
          }
        }

        .summary-preview {
          margin-top: var(--spacing-8xl);
          padding: var(--text-2xl);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);

          h5 {
            color: var(--text-primary);
            margin-bottom: var(--text-lg);
          }

          .preview-content p {
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
          }
        }
      }
    }

    .builder-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--text-sm);
      border-top: var(--border-width) solid var(--border-color);
      padding-top: var(--text-2xl);
    }
  }

  .custom-analysis-list {
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width-custom-analysis), 1fr));
      gap: var(--text-2xl);

      .custom-analysis-card {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        box-shadow: var(--shadow-sm);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(var(--transform-hover-lift));
          box-shadow: var(--shadow-lg);
        }

        .analysis-preview {
          height: var(--analysis-preview-height);
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .analysis-info {
          padding: var(--text-lg);

          h4 {
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
          }

          p {
            color: var(--text-secondary);
            font-size: var(--text-base);
            margin-bottom: var(--text-sm);
          }

          .analysis-meta {
            display: flex;
            gap: var(--text-lg);

            .meta-item {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
              font-size: var(--text-sm);
              color: var(--text-muted);
            }
          }
        }

        .analysis-actions {
          padding: 0 var(--text-lg) var(--text-lg);
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }
  }
}
</style>