/**
 * 财务模块第3批类型定义
 * 包含财务报表、分析、预测相关的类型
 */

// ========== 财务报表相关类型 ==========

/**
 * 报表模板
 */
export interface FinanceReportTemplate {
  id: string
  name: string
  description: string
  type: 'income' | 'expense' | 'balance' | 'cash_flow' | 'profit_loss' | 'custom'
  category: string
  fields: ReportField[]
  filters: ReportFilter[]
  charts: ReportChart[]
  status: 'active' | 'inactive'
  isSystem: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
}

/**
 * 报表字段定义
 */
export interface ReportField {
  id: string
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'amount' | 'percentage'
  format?: string
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  visible: boolean
  sortable: boolean
  filterable: boolean
}

/**
 * 报表过滤器
 */
export interface ReportFilter {
  id: string
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'like'
  value: any
  label: string
}

/**
 * 报表图表配置
 */
export interface ReportChart {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar'
  title: string
  dataSource: string
  xAxis?: string
  yAxis?: string
  series: ReportChartSeries[]
  options?: Record<string, any>
}

/**
 * 图表系列
 */
export interface ReportChartSeries {
  name: string
  field: string
  color?: string
  type?: string
}

/**
 * 自定义报表
 */
export interface CustomReport {
  id: string
  name: string
  description: string
  templateId?: string
  ownerId: string
  ownerName: string
  fields: ReportField[]
  filters: ReportFilter[]
  charts: ReportChart[]
  dateRange: string[]
  granularity: 'day' | 'week' | 'month' | 'quarter' | 'year'
  isPublic: boolean
  shareToken?: string
  tags: string[]
  status: 'draft' | 'active' | 'archived'
  createdAt: string
  updatedAt: string
  lastGeneratedAt?: string
}

/**
 * 报表数据
 */
export interface ReportData {
  id: string
  reportId: string
  reportName: string
  reportType: string
  generatedAt: string
  generatedBy: string
  dateRange: string[]
  granularity: string
  data: ReportDataRow[]
  summary: ReportSummary
  charts: ReportChartData[]
  metadata: ReportMetadata
  status: 'generating' | 'completed' | 'failed'
  error?: string
}

/**
 * 报表数据行
 */
export interface ReportDataRow {
  [key: string]: any
}

/**
 * 报表汇总
 */
export interface ReportSummary {
  totalAmount: number
  totalCount: number
  averageAmount: number
  growth: number
  comparison: {
    previous: number
    change: number
    changePercent: number
  }
  breakdown: Record<string, number>
}

/**
 * 报表图表数据
 */
export interface ReportChartData {
  chartId: string
  type: string
  title: string
  data: any[]
  options: Record<string, any>
}

/**
 * 报表元数据
 */
export interface ReportMetadata {
  totalRows: number
  generationTime: number
  dataSource: string
  version: string
  filters: ReportFilter[]
}

/**
 * 报表分享
 */
export interface ReportShare {
  id: string
  reportId: string
  reportName: string
  shareToken: string
  shareUrl: string
  sharedBy: string
  sharedByName: string
  sharedAt: string
  expiresAt?: string
  accessCount: number
  lastAccessedAt?: string
  permissions: SharePermission[]
  isActive: boolean
  description?: string
}

/**
 * 分享权限
 */
export interface SharePermission {
  action: 'view' | 'download' | 'export' | 'comment'
  allowed: boolean
}

/**
 * 生成报表参数
 */
export interface ReportGenerateParams {
  templateId?: string
  reportId?: string
  name?: string
  dateRange: string[]
  granularity: 'day' | 'week' | 'month' | 'quarter' | 'year'
  filters?: ReportFilter[]
  fields?: string[]
  includeCharts?: boolean
  format?: 'json' | 'excel' | 'pdf'
}

// ========== 财务分析相关类型 ==========

/**
 * 分析查询参数
 */
export interface AnalyticsQueryParams {
  dateRange: string[]
  granularity: 'day' | 'week' | 'month' | 'quarter' | 'year'
  metrics?: string[]
  dimensions?: string[]
  filters?: Record<string, any>
  compareWith?: string[]
}

/**
 * 财务分析响应
 */
export interface FinanceAnalyticsResponse {
  overview: AnalyticsOverview
  trends: AnalyticsTrend[]
  comparisons: AnalyticsComparison[]
  breakdown: AnalyticsBreakdown[]
  insights: AnalyticsInsight[]
  recommendations: AnalyticsRecommendation[]
  metadata: {
    dateRange: string[]
    granularity: string
    generatedAt: string
  }
}

/**
 * 分析概览
 */
export interface AnalyticsOverview {
  totalRevenue: number
  totalExpense: number
  netProfit: number
  profitMargin: number
  revenueGrowth: number
  expenseGrowth: number
  cashFlow: number
  outstandingAmount: number
}

/**
 * 分析趋势
 */
export interface AnalyticsTrend {
  metric: string
  label: string
  data: TrendDataPoint[]
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

/**
 * 趋势数据点
 */
export interface TrendDataPoint {
  date: string
  value: number
  label?: string
}

/**
 * 分析对比
 */
export interface AnalyticsComparison {
  metric: string
  label: string
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

/**
 * 分析细分
 */
export interface AnalyticsBreakdown {
  dimension: string
  label: string
  items: BreakdownItem[]
  total: number
}

/**
 * 细分项
 */
export interface BreakdownItem {
  name: string
  value: number
  percent: number
  trend?: 'up' | 'down' | 'stable'
  change?: number
}

/**
 * 分析洞察
 */
export interface AnalyticsInsight {
  id: string
  type: 'opportunity' | 'risk' | 'anomaly' | 'pattern'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  metrics: {
    name: string
    value: number
    trend?: string
  }[]
  actions: string[]
  createdAt: string
}

/**
 * 分析建议
 */
export interface AnalyticsRecommendation {
  id: string
  category: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  effort: 'high' | 'medium' | 'low'
  actions: RecommendationAction[]
}

/**
 * 建议操作
 */
export interface RecommendationAction {
  id: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  dueDate?: string
}

// ========== 财务预测相关类型 ==========

/**
 * 财务预测响应
 */
export interface FinanceForecastResponse {
  summary: ForecastSummary
  forecasts: Forecast[]
  scenarios: ForecastScenario[]
  assumptions: ForecastAssumption[]
  confidence: ForecastConfidence
  metadata: {
    generatedAt: string
    forecastPeriod: string[]
    model: string
    accuracy: number
  }
}

/**
 * 预测汇总
 */
export interface ForecastSummary {
  totalRevenueForecast: number
  totalExpenseForecast: number
  netProfitForecast: number
  cashFlowForecast: number
  growthRate: number
  confidenceLevel: number
}

/**
 * 预测数据
 */
export interface Forecast {
  metric: string
  label: string
  historical: ForecastDataPoint[]
  predicted: ForecastDataPoint[]
  confidence: {
    upper: number[]
    lower: number[]
  }
  accuracy: number
}

/**
 * 预测数据点
 */
export interface ForecastDataPoint {
  date: string
  value: number
  label?: string
}

/**
 * 预测场景
 */
export interface ForecastScenario {
  id: string
  name: string
  type: 'optimistic' | 'realistic' | 'pessimistic'
  probability: number
  forecasts: {
    metric: string
    value: number
    change: number
  }[]
  assumptions: string[]
}

/**
 * 预测假设
 */
export interface ForecastAssumption {
  id: string
  category: string
  description: string
  value: number
  unit: string
  confidence: number
  source: string
}

/**
 * 预测置信度
 */
export interface ForecastConfidence {
  overall: number
  byMetric: Record<string, number>
  factors: {
    historicalDataQuality: number
    modelAccuracy: number
    externalFactors: number
  }
}

/**
 * 预测生成参数
 */
export interface ForecastGenerateParams {
  forecastPeriod: string[]
  metrics: string[]
  model?: 'arima' | 'prophet' | 'lstm' | 'linear'
  scenarios?: ('optimistic' | 'realistic' | 'pessimistic')[]
  includeConfidenceInterval?: boolean
  configId?: string
}

/**
 * 预测结果
 */
export interface ForecastResult {
  id: string
  name: string
  generatedAt: string
  generatedBy: string
  forecastPeriod: string[]
  model: string
  accuracy: number
  forecasts: Forecast[]
  scenarios: ForecastScenario[]
  summary: ForecastSummary
  status: 'generating' | 'completed' | 'failed'
  error?: string
}

/**
 * 预测配置
 */
export interface ForecastConfig {
  id: string
  name: string
  description: string
  model: 'arima' | 'prophet' | 'lstm' | 'linear'
  parameters: Record<string, any>
  metrics: string[]
  forecastHorizon: number
  updateFrequency: 'daily' | 'weekly' | 'monthly'
  isActive: boolean
  ownerId: string
  ownerName: string
  createdAt: string
  updatedAt: string
  lastRunAt?: string
}
