<template>
  <div class="report-builder-container">
    <!-- 页面头部 -->
    <div class="builder-header">
      <div class="header-content">
        <h1 class="page-title">报表构建器</h1>
        <p class="page-description">拖拽式创建自定义数据报表，支持多种图表类型和数据源</p>
      </div>
      <div class="header-actions">
        <el-button @click="loadTemplate" :disabled="loading.templates">
          <UnifiedIcon name="default" />
          加载模板
        </el-button>
        <el-button @click="saveAsTemplate" :disabled="!canSave">
          <UnifiedIcon name="default" />
          保存模板
        </el-button>
        <el-button type="primary" @click="saveReport" :loading="saving" :disabled="!canSave">
          <UnifiedIcon name="Check" />
          保存报表
        </el-button>
      </div>
    </div>

    <div class="builder-layout">
      <!-- 左侧工具面板 -->
      <div class="tools-panel">
        <!-- 数据源选择 -->
        <div class="tool-section">
          <h3 class="section-title">数据源</h3>
          <div class="data-sources">
            <div 
              v-for="source in dataSources" 
              :key="source.id"
              class="data-source-item"
              :class="{ 'selected': reportConfig.dataSource === source.id }"
              @click="selectDataSource(source.id)"
            >
              <UnifiedIcon name="default" />
              <div class="source-info">
                <div class="source-name">{{ source.name }}</div>
                <div class="source-desc">{{ source.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 字段列表 -->
        <div class="tool-section" v-if="reportConfig.dataSource">
          <h3 class="section-title">可用字段</h3>
          <div class="fields-container">
            <!-- 维度字段 -->
            <div class="field-group">
              <h4 class="group-title">维度字段</h4>
              <div class="field-list">
                <div 
                  v-for="field in availableFields.dimensions" 
                  :key="field.name"
                  class="field-item dimension-field"
                  draggable="true"
                  @dragstart="handleDragStart('dimension', field)"
                >
                  <UnifiedIcon name="default" />
                  <div class="field-info">
                    <div class="field-name">{{ field.label }}</div>
                    <div class="field-type">{{ field.type }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 度量字段 -->
            <div class="field-group">
              <h4 class="group-title">度量字段</h4>
              <div class="field-list">
                <div 
                  v-for="field in availableFields.metrics" 
                  :key="field.name"
                  class="field-item metric-field"
                  draggable="true"
                  @dragstart="handleDragStart('metric', field)"
                >
                  <UnifiedIcon name="default" />
                  <div class="field-info">
                    <div class="field-name">{{ field.label }}</div>
                    <div class="field-type">{{ field.type }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图表类型 -->
        <div class="tool-section">
          <h3 class="section-title">图表类型</h3>
          <div class="chart-types">
            <div 
              v-for="type in chartTypes" 
              :key="type.value"
              class="chart-type-item"
              :class="{ 'selected': reportConfig.chartType === type.value }"
              @click="selectChartType(type.value)"
            >
              <UnifiedIcon name="default" />
              <div class="chart-name">{{ type.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中央构建区域 -->
      <div class="builder-main">
        <!-- 配置面板 -->
        <div class="config-panel">
          <el-tabs v-model="activeConfigTab" class="config-tabs">
            <el-tab-pane label="基本设置" name="basic">
              <div class="config-content">
                <!-- 报表基本信息 -->
                <el-form :model="reportConfig" label-width="80px" size="small">
                  <el-form-item label="报表名称">
                    <el-input v-model="reportConfig.name" placeholder="请输入报表名称" />
                  </el-form-item>
                  <el-form-item label="报表描述">
                    <el-input 
                      v-model="reportConfig.description" 
                      type="textarea" 
                      :rows="2"
                      placeholder="请输入报表描述" 
                    />
                  </el-form-item>
                </el-form>

                <!-- 拖拽区域 -->
                <div class="drop-zones">
                  <!-- 维度拖拽区 -->
                  <div class="drop-zone dimensions-zone">
                    <div class="zone-header">
                      <UnifiedIcon name="default" />
                      <span>维度字段</span>
                    </div>
                    <div 
                      class="drop-area"
                      @dragover.prevent
                      @drop="handleDrop('dimensions', $event)"
                    >
                      <div 
                        v-if="reportConfig.dimensions.length === 0" 
                        class="drop-placeholder"
                      >
                        拖拽维度字段到此处
                      </div>
                      <div 
                        v-for="(dimension, index) in reportConfig.dimensions" 
                        :key="dimension.field"
                        class="dropped-field dimension-dropped"
                      >
                        <span class="field-label">{{ dimension.label }}</span>
                        <el-select 
                          v-if="dimension.type === 'date'" 
                          v-model="dimension.groupBy" 
                          size="small"
                          style="width: auto;"
                        >
                          <el-option label="日" value="day" />
                          <el-option label="周" value="week" />
                          <el-option label="月" value="month" />
                          <el-option label="年" value="year" />
                        </el-select>
                        <el-button 
                          @click="removeDimension(index)" 
                          size="small" 
                          type="danger" 
                          text
                        >
                          <UnifiedIcon name="Close" />
                        </el-button>
                      </div>
                    </div>
                  </div>

                  <!-- 度量拖拽区 -->
                  <div class="drop-zone metrics-zone">
                    <div class="zone-header">
                      <UnifiedIcon name="default" />
                      <span>度量字段</span>
                    </div>
                    <div 
                      class="drop-area"
                      @dragover.prevent
                      @drop="handleDrop('metrics', $event)"
                    >
                      <div 
                        v-if="reportConfig.metrics.length === 0" 
                        class="drop-placeholder"
                      >
                        拖拽度量字段到此处
                      </div>
                      <div 
                        v-for="(metric, index) in reportConfig.metrics" 
                        :key="metric.field"
                        class="dropped-field metric-dropped"
                      >
                        <span class="field-label">{{ metric.label }}</span>
                        <el-select v-model="metric.aggregation" size="small" style="width: auto;">
                          <el-option label="求和" value="sum" />
                          <el-option label="计数" value="count" />
                          <el-option label="平均" value="avg" />
                          <el-option label="最大" value="max" />
                          <el-option label="最小" value="min" />
                        </el-select>
                        <el-button 
                          @click="removeMetric(index)" 
                          size="small" 
                          type="danger" 
                          text
                        >
                          <UnifiedIcon name="Close" />
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="筛选条件" name="filters">
              <div class="config-content">
                <div class="filters-section">
                  <div class="section-header">
                    <h4>数据筛选</h4>
                    <el-button @click="addFilter" size="small" type="primary" plain>
                      <UnifiedIcon name="Plus" />
                      添加筛选
                    </el-button>
                  </div>
                  
                  <div class="filters-list">
                    <div 
                      v-for="(filter, index) in reportConfig.filters" 
                      :key="index"
                      class="filter-item"
                    >
                      <el-select v-model="filter.field" placeholder="选择字段" style="max-max-width: 150px; width: 100%; width: 100%;">
                        <el-option 
                          v-for="field in allFields" 
                          :key="field.name"
                          :label="field.label" 
                          :value="field.name" 
                        />
                      </el-select>
                      
                      <el-select v-model="filter.operator" placeholder="条件" style="max-width: 100px; width: 100%;">
                        <el-option label="等于" value="eq" />
                        <el-option label="不等于" value="ne" />
                        <el-option label="大于" value="gt" />
                        <el-option label="小于" value="lt" />
                        <el-option label="包含" value="like" />
                        <el-option label="在范围内" value="in" />
                      </el-select>
                      
                      <el-input 
                        v-model="filter.value" 
                        placeholder="筛选值" 
                        style="width: 150px;" 
                      />
                      
                      <el-button 
                        @click="removeFilter(index)" 
                        size="small" 
                        type="danger" 
                        text
                      >
                        <UnifiedIcon name="Delete" />
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="样式设置" name="styling">
              <div class="config-content">
                <el-form :model="reportConfig.layout" label-width="80px" size="small">
                  <el-form-item label="图表宽度">
                    <el-slider v-model="reportConfig.layout.width" :min="6" :max="24" show-stops />
                  </el-form-item>
                  <el-form-item label="图表高度">
                    <el-slider v-model="reportConfig.layout.height" :min="4" :max="16" show-stops />
                  </el-form-item>
                  <el-form-item label="主题色彩">
                    <el-color-picker v-model="reportConfig.theme.primaryColor" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="调度设置" name="schedule">
              <div class="config-content">
                <el-form :model="reportConfig.schedule" label-width="100px" size="small">
                  <el-form-item label="启用调度">
                    <el-switch v-model="reportConfig.schedule.enabled" />
                  </el-form-item>
                  <el-form-item label="执行频率" v-if="reportConfig.schedule.enabled">
                    <el-select v-model="reportConfig.schedule.frequency">
                      <el-option label="每日" value="daily" />
                      <el-option label="每周" value="weekly" />
                      <el-option label="每月" value="monthly" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="执行时间" v-if="reportConfig.schedule.enabled">
                    <el-time-picker v-model="reportConfig.schedule.time" placeholder="选择时间" />
                  </el-form-item>
                  <el-form-item label="发送邮箱" v-if="reportConfig.schedule.enabled">
                    <el-input 
                      v-model="reportConfig.schedule.recipients" 
                      placeholder="输入邮箱地址，多个用逗号分隔" 
                    />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 预览区域 -->
        <div class="preview-panel">
          <div class="preview-header">
            <h3>报表预览</h3>
            <div class="preview-actions">
              <el-button @click="refreshPreview" :loading="previewLoading" size="small">
                <UnifiedIcon name="Refresh" />
                刷新
              </el-button>
              <el-button @click="exportPreview" size="small">
                <UnifiedIcon name="Download" />
                导出
              </el-button>
            </div>
          </div>
          
          <div class="preview-content" v-loading="previewLoading">
            <div v-if="!hasValidConfig" class="preview-empty">
              <UnifiedIcon name="default" />
              <h4>开始构建您的报表</h4>
              <p>选择数据源，添加维度和度量字段，然后选择合适的图表类型</p>
            </div>
            
            <div v-else-if="previewData" class="preview-chart">
              <div ref="chartContainer" class="chart-container"></div>
              
              <!-- 数据表格 -->
              <div v-if="reportConfig.chartType === 'table'" class="preview-table">
                <div class="table-wrapper">
<el-table class="responsive-table" :data="previewData.tableData || []" stripe style="width: 100%">
                  <el-table-column 
                    v-for="column in previewData.columns || []" 
                    :key="column.prop"
                    :prop="column.prop" 
                    :label="column.label" 
                    :width="column.width"
                  />
                </el-table>
</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板选择对话框 -->
    <el-dialog v-model="templateDialogVisible" title="选择报表模板" width="800px">
      <div class="template-grid">
        <div 
          v-for="template in reportTemplates" 
          :key="template.id"
          class="template-card"
          @click="applyTemplate(template)"
        >
          <div class="template-preview">
            <UnifiedIcon name="default" />
          </div>
          <div class="template-info">
            <h4 class="template-name">{{ template.name }}</h4>
            <p class="template-desc">{{ template.description }}</p>
            <div class="template-meta">
              <span class="template-category">{{ template.category }}</span>
              <span class="template-usage">使用 {{ template.usageCount }} 次</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Folder, Collection, Check, Coin, Grid, TrendCharts,
  Plus, Close, Delete, Refresh, Download, DocumentAdd,
  Document, BarChart, LineChart, PieChart
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 报表配置接口
interface ReportConfig {
  id?: string
  name: string
  description: string
  dataSource: string
  dimensions: ReportDimension[]
  metrics: ReportMetric[]
  filters: ReportFilter[]
  chartType: ChartType
  layout: ReportLayout
  theme: ReportTheme
  schedule?: ReportSchedule
}

interface ReportDimension {
  field: string
  label: string
  type: 'date' | 'string' | 'number'
  groupBy?: 'day' | 'week' | 'month' | 'year'
  sort?: 'asc' | 'desc'
}

interface ReportMetric {
  field: string
  label: string
  type: string
  aggregation: 'sum' | 'count' | 'avg' | 'max' | 'min'
  format?: string
  color?: string
}

interface ReportFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like'
  value: any
  label?: string
}

interface ReportLayout {
  width: number
  height: number
  x?: number
  y?: number
}

interface ReportTheme {
  primaryColor: string
  backgroundColor?: string
  textColor?: string
}

interface ReportSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  recipients: string
  format: 'html' | 'pdf' | 'excel'
}

type ChartType = 'table' | 'line' | 'bar' | 'pie' | 'area' | 'scatter'

interface DataSource {
  id: string
  name: string
  description: string
  fields: {
    dimensions: FieldDefinition[]
    metrics: FieldDefinition[]
  }
}

interface FieldDefinition {
  name: string
  label: string
  type: string
  description?: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  config: ReportConfig
  usageCount: number
}

// 响应式数据
const reportConfig = ref<ReportConfig>({
  name: '',
  description: '',
  dataSource: '',
  dimensions: [],
  metrics: [],
  filters: [],
  chartType: 'table',
  layout: {
    width: 12,
    height: 8
  },
  theme: {
    primaryColor: 'var(--primary-color)'
  },
  schedule: {
    enabled: false,
    frequency: 'daily',
    time: '',
    recipients: '',
    format: 'excel'
  }
})

const activeConfigTab = ref('basic')
const previewLoading = ref(false)
const saving = ref(false)
const loading = ref({
  templates: false,
  dataSources: false
})

const templateDialogVisible = ref(false)
const chartContainer = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 数据源和字段
const dataSources = ref<DataSource[]>([
  {
    id: 'enrollment',
    name: '招生数据',
    description: '学生招生相关数据',
    fields: {
      dimensions: [
        { name: 'date', label: '日期', type: 'date' },
        { name: 'region', label: '地区', type: 'string' },
        { name: 'source', label: '来源渠道', type: 'string' },
        { name: 'grade', label: '年级', type: 'string' }
      ],
      metrics: [
        { name: 'count', label: '招生人数', type: 'number' },
        { name: 'revenue', label: '收入金额', type: 'number' },
        { name: 'cost', label: '成本费用', type: 'number' }
      ]
    }
  },
  {
    id: 'activities',
    name: '活动数据',
    description: '各类活动统计数据',
    fields: {
      dimensions: [
        { name: 'date', label: '活动日期', type: 'date' },
        { name: 'type', label: '活动类型', type: 'string' },
        { name: 'location', label: '活动地点', type: 'string' }
      ],
      metrics: [
        { name: 'participants', label: '参与人数', type: 'number' },
        { name: 'satisfaction', label: '满意度', type: 'number' },
        { name: 'cost', label: '活动成本', type: 'number' }
      ]
    }
  },
  {
    id: 'financial',
    name: '财务数据',
    description: '收入支出财务统计',
    fields: {
      dimensions: [
        { name: 'month', label: '月份', type: 'date' },
        { name: 'category', label: '分类', type: 'string' },
        { name: 'department', label: '部门', type: 'string' }
      ],
      metrics: [
        { name: 'income', label: '收入', type: 'number' },
        { name: 'expense', label: '支出', type: 'number' },
        { name: 'profit', label: '利润', type: 'number' }
      ]
    }
  }
])

const reportTemplates = ref<ReportTemplate[]>([])
const previewData = ref<any>(null)

// 图表类型配置
const chartTypes = [
  { value: 'table', label: '数据表格', icon: 'Grid' },
  { value: 'line', label: '折线图', icon: 'LineChart' },
  { value: 'bar', label: '柱状图', icon: 'BarChart' },
  { value: 'pie', label: '饼图', icon: 'PieChart' },
  { value: 'area', label: '面积图', icon: 'TrendCharts' },
  { value: 'scatter', label: '散点图', icon: 'TrendCharts' }
]

// 计算属性
const availableFields = computed(() => {
  const source = dataSources.value.find(s => s.id === reportConfig.value.dataSource)
  return source?.fields || { dimensions: [], metrics: [] }
})

const allFields = computed(() => {
  return [
    ...availableFields.value.dimensions,
    ...availableFields.value.metrics
  ]
})

const hasValidConfig = computed(() => {
  return reportConfig.value.dataSource && 
         (reportConfig.value.dimensions.length > 0 || reportConfig.value.metrics.length > 0)
})

const canSave = computed(() => {
  return reportConfig.value.name && 
         reportConfig.value.dataSource && 
         (reportConfig.value.dimensions.length > 0 || reportConfig.value.metrics.length > 0)
})

// 页面初始化
onMounted(() => {
  loadReportTemplates()
})

// 监听配置变化自动刷新预览
watch([
  () => reportConfig.value.dimensions,
  () => reportConfig.value.metrics,
  () => reportConfig.value.chartType,
  () => reportConfig.value.filters
], () => {
  if (hasValidConfig.value) {
    refreshPreview()
  }
}, { deep: true })

// 数据源选择
const selectDataSource = (sourceId: string) => {
  reportConfig.value.dataSource = sourceId
  // 清空已配置的字段
  reportConfig.value.dimensions = []
  reportConfig.value.metrics = []
  reportConfig.value.filters = []
}

// 拖拽处理
const handleDragStart = (type: 'dimension' | 'metric', field: FieldDefinition) => {
  // 存储拖拽数据
  const dragData = { type, field }
  // 在实际应用中，这里应该使用 DataTransfer API
  ;(window as any).dragData = dragData
}

const handleDrop = (zone: 'dimensions' | 'metrics', event: DragEvent) => {
  event.preventDefault()
  const dragData = (window as any).dragData
  
  if (!dragData) return
  
  if (zone === 'dimensions' && dragData.type === 'dimension') {
    addDimension(dragData.field)
  } else if (zone === 'metrics' && dragData.type === 'metric') {
    addMetric(dragData.field)
  }
  
  delete (window as any).dragData
}

// 添加维度
const addDimension = (field: FieldDefinition) => {
  // 检查是否已存在
  if (reportConfig.value.dimensions.find(d => d.field === field.name)) {
    ElMessage.warning('该维度字段已存在')
    return
  }
  
  reportConfig.value.dimensions.push({
    field: field.name,
    label: field.label,
    type: field.type as any,
    groupBy: field.type === 'date' ? 'month' : undefined
  })
}

// 添加度量
const addMetric = (field: FieldDefinition) => {
  // 检查是否已存在
  if (reportConfig.value.metrics.find(m => m.field === field.name)) {
    ElMessage.warning('该度量字段已存在')
    return
  }
  
  reportConfig.value.metrics.push({
    field: field.name,
    label: field.label,
    type: field.type,
    aggregation: 'sum'
  })
}

// 移除字段
const removeDimension = (index: number) => {
  reportConfig.value.dimensions.splice(index, 1)
}

const removeMetric = (index: number) => {
  reportConfig.value.metrics.splice(index, 1)
}

// 图表类型选择
const selectChartType = (type: ChartType) => {
  reportConfig.value.chartType = type
}

// 筛选条件管理
const addFilter = () => {
  reportConfig.value.filters.push({
    field: '',
    operator: 'eq',
    value: ''
  })
}

const removeFilter = (index: number) => {
  reportConfig.value.filters.splice(index, 1)
}

// 预览功能
const refreshPreview = async () => {
  if (!hasValidConfig.value) return
  
  previewLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 生成模拟数据
    const mockData = generateMockData()
    previewData.value = mockData
    
    // 渲染图表
    if (reportConfig.value.chartType !== 'table') {
      await nextTick()
      renderChart(mockData)
    }
  } catch (error) {
    ElMessage.error('预览生成失败')
  } finally {
    previewLoading.value = false
  }
}

// 生成模拟数据
const generateMockData = () => {
  const dimensions = reportConfig.value.dimensions
  const metrics = reportConfig.value.metrics
  
  if (reportConfig.value.chartType === 'table') {
    // 生成表格数据
    const columns = [
      ...dimensions.map(d => ({ prop: d.field, label: d.label, width: 120 })),
      ...metrics.map(m => ({ prop: m.field, label: m.label, width: 100 }))
    ]
    
    const tableData = Array.from({ length: 10 }, (_, i) => {
      const row: any = {}
      dimensions.forEach(d => {
        if (d.type === 'date') {
          row[d.field] = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString()
        } else {
          row[d.field] = `${d.label}_${i + 1}`
        }
      })
      metrics.forEach(m => {
        row[m.field] = Math.floor(Math.random() * 1000) + 100
      })
      return row
    })
    
    return { columns, tableData }
  } else {
    // 生成图表数据
    const categories = ['一月', '二月', '三月', '四月', '五月', '六月']
    const series = metrics.map(m => ({
      name: m.label,
      data: categories.map(() => Math.floor(Math.random() * 1000) + 100),
      type: reportConfig.value.chartType === 'pie' ? 'pie' : reportConfig.value.chartType
    }))
    
    return { categories, series }
  }
}

// 渲染图表
const renderChart = (data: any) => {
  if (!chartContainer.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartContainer.value)
  
  const option = generateChartOption(data)
  chartInstance.setOption(option)
  
  // 响应式处理
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

// 生成图表配置
const generateChartOption = (data: any) => {
  const { categories, series } = data
  const { chartType } = reportConfig.value
  
  const baseOption = {
    title: {
      text: reportConfig.value.name || '报表预览',
      left: 'center'
    },
    tooltip: {
      trigger: chartType === 'pie' ? 'item' : 'axis'
    },
    legend: {
      bottom: 0
    }
  }
  
  if (chartType === 'pie') {
    return {
      ...baseOption,
      series: [{
        name: series[0]?.name || '数据',
        type: 'pie',
        radius: '50%',
        data: categories.map((cat, index) => ({
          name: cat,
          value: series[0]?.data[index] || 0
        }))
      }]
    }
  } else {
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value'
      },
      series: series.map(s => ({
        ...s,
        type: chartType === 'area' ? 'line' : chartType,
        areaStyle: chartType === 'area' ? {} : undefined,
        smooth: chartType === 'line' || chartType === 'area'
      }))
    }
  }
}

// 模板管理
const loadReportTemplates = async () => {
  loading.value.templates = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    reportTemplates.value = [
      {
        id: '1',
        name: '招生趋势分析',
        description: '月度招生数据趋势分析报表',
        category: '招生管理',
        usageCount: 25,
        config: {
          name: '招生趋势分析',
          description: '月度招生数据趋势分析报表',
          dataSource: 'enrollment',
          dimensions: [{ field: 'date', label: '日期', type: 'date', groupBy: 'month' }],
          metrics: [{ field: 'count', label: '招生人数', type: 'number', aggregation: 'sum' }],
          filters: [],
          chartType: 'line',
          layout: { width: 12, height: 8 },
          theme: { primaryColor: 'var(--primary-color)' }
        }
      },
      {
        id: '2',
        name: '活动参与统计',
        description: '各类活动的参与度统计',
        category: '活动管理',
        usageCount: 18,
        config: {
          name: '活动参与统计',
          description: '各类活动的参与度统计',
          dataSource: 'activities',
          dimensions: [{ field: 'type', label: '活动类型', type: 'string' }],
          metrics: [{ field: 'participants', label: '参与人数', type: 'number', aggregation: 'sum' }],
          filters: [],
          chartType: 'bar',
          layout: { width: 12, height: 8 },
          theme: { primaryColor: 'var(--success-color)' }
        }
      },
      {
        id: '3',
        name: '财务收支分析',
        description: '月度收入支出对比分析',
        category: '财务管理',
        usageCount: 32,
        config: {
          name: '财务收支分析',
          description: '月度收入支出对比分析',
          dataSource: 'financial',
          dimensions: [{ field: 'month', label: '月份', type: 'date', groupBy: 'month' }],
          metrics: [
            { field: 'income', label: '收入', type: 'number', aggregation: 'sum' },
            { field: 'expense', label: '支出', type: 'number', aggregation: 'sum' }
          ],
          filters: [],
          chartType: 'bar',
          layout: { width: 12, height: 8 },
          theme: { primaryColor: 'var(--warning-color)' }
        }
      }
    ]
  } catch (error) {
    ElMessage.error('加载模板失败')
  } finally {
    loading.value.templates = false
  }
}

const loadTemplate = () => {
  templateDialogVisible.value = true
}

const applyTemplate = (template: ReportTemplate) => {
  reportConfig.value = { ...template.config }
  templateDialogVisible.value = false
  ElMessage.success('模板应用成功')
  refreshPreview()
}

const saveAsTemplate = async () => {
  try {
    const { value: templateName } = await ElMessageBox.prompt('请输入模板名称', '保存为模板', {
      confirmButtonText: '保存',
      cancelButtonText: '取消'
    })
    
    if (templateName) {
      // 模拟保存API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      ElMessage.success('模板保存成功')
    }
  } catch {
    // 用户取消
  }
}

// 报表保存
const saveReport = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('报表保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 导出功能
const exportPreview = async () => {
  try {
    ElMessage.success('导出功能开发中...')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped lang="scss">
.report-builder-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--el-bg-color);
  border-bottom: var(--border-width-base) solid var(--el-border-color);
  
  .header-content {
    .page-title {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .page-description {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: 0.875rem;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 0.75rem;
  }
}

.builder-layout {
  display: flex;
  flex: 1;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
}

.tools-panel {
  max-width: 280px; width: 100%;
  background: var(--el-bg-color);
  border-right: var(--border-width-base) solid var(--el-border-color);
  overflow-y: auto;
  
  .tool-section {
    padding: 1rem;
    border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
    
    .section-title {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .data-sources {
    .data-source-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 0.5rem;
      border: var(--border-width-base) solid transparent;
      
      &:hover {
        background: var(--el-color-primary-light-9);
      }
      
      &.selected {
        background: var(--el-color-primary-light-8);
        border-color: var(--el-color-primary-light-6);
      }
      
      .source-icon {
        color: var(--el-color-primary);
      }
      
      .source-info {
        .source-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 0.25rem;
        }
        
        .source-desc {
          font-size: 0.75rem;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
  
  .fields-container {
    .field-group {
      margin-bottom: 1rem;
      
      .group-title {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--el-text-color-regular);
      }
      
      .field-list {
        .field-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: grab;
          margin-bottom: 0.25rem;
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--el-fill-color-light);
          }
          
          &:active {
            cursor: grabbing;
          }
          
          &.dimension-field {
            border-left: 3px solid var(--el-color-success);
          }
          
          &.metric-field {
            border-left: 3px solid var(--el-color-warning);
          }
          
          .field-icon {
            color: var(--el-text-color-secondary);
          }
          
          .field-info {
            .field-name {
              font-size: 0.875rem;
              color: var(--el-text-color-primary);
            }
            
            .field-type {
              font-size: 0.75rem;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }
  }
  
  .chart-types {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    
    .chart-type-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: var(--border-width-base) solid var(--el-border-color);
      
      &:hover {
        background: var(--el-color-primary-light-9);
      }
      
      &.selected {
        background: var(--el-color-primary-light-8);
        border-color: var(--el-color-primary);
      }
      
      .chart-icon {
        margin-bottom: 0.25rem;
        color: var(--el-color-primary);
      }
      
      .chart-name {
        font-size: 0.75rem;
        text-align: center;
        color: var(--el-text-color-primary);
      }
    }
  }
}

.builder-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.config-panel {
  background: var(--el-bg-color);
  border-bottom: var(--border-width-base) solid var(--el-border-color);
  
  .config-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      background: var(--el-bg-color-page);
    }
    
    :deep(.el-tabs__content) {
      padding: 0;
    }
  }
  
  .config-content {
    padding: 1rem;
    max-min-height: 60px; height: auto;
    overflow-y: auto;
  }
  
  .drop-zones {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .drop-zone {
    border: 2px dashed var(--el-border-color);
    border-radius: 0.5rem;
    padding: 1rem;
    
    .zone-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .drop-area {
      min-min-height: 60px; height: auto;
      
      .drop-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px; height: auto;
        color: var(--el-text-color-placeholder);
        font-size: 0.875rem;
      }
      
      .dropped-field {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--el-fill-color-light);
        border-radius: 0.375rem;
        margin-bottom: 0.5rem;
        
        &.dimension-dropped {
          border-left: 3px solid var(--el-color-success);
        }
        
        &.metric-dropped {
          border-left: 3px solid var(--el-color-warning);
        }
        
        .field-label {
          flex: 1;
          font-size: 0.875rem;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
  
  .filters-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        color: var(--el-text-color-primary);
      }
    }
    
    .filters-list {
      .filter-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        padding: 0.75rem;
        background: var(--el-fill-color-lighter);
        border-radius: 0.375rem;
      }
    }
  }
}

.preview-panel {
  flex: 1;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: var(--border-width-base) solid var(--el-border-color);
    
    h3 {
      margin: 0;
      color: var(--el-text-color-primary);
    }
    
    .preview-actions {
      display: flex;
      gap: 0.5rem;
    }
  }
  
  .preview-content {
    flex: 1;
    padding: 1rem;
    overflow: auto;
    
    .preview-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      
      .empty-icon {
        color: var(--el-text-color-placeholder);
        margin-bottom: 1rem;
      }
      
      h4 {
        margin: 0 0 0.5rem 0;
        color: var(--el-text-color-primary);
      }
      
      p {
        margin: 0;
        color: var(--el-text-color-regular);
      }
    }
    
    .preview-chart {
      .chart-container {
        width: 100%;
        min-height: 60px; height: auto;
        border: var(--border-width-base) solid var(--el-border-color);
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .preview-table {
        border: var(--border-width-base) solid var(--el-border-color);
        border-radius: 0.5rem;
        overflow: hidden;
      }
    }
  }
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  
  .template-card {
    border: var(--border-width-base) solid var(--el-border-color);
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
    }
    
    .template-preview {
      min-height: 60px; height: auto;
      background: var(--el-fill-color-lighter);
      display: flex;
      align-items: center;
      justify-content: center;
      
      .template-icon {
        font-size: var(--text-5xl);
        color: var(--el-text-color-placeholder);
      }
    }
    
    .template-info {
      padding: 1rem;
      
      .template-name {
        margin: 0 0 0.5rem 0;
        color: var(--el-text-color-primary);
        font-size: 1rem;
      }
      
      .template-desc {
        margin: 0 0 0.75rem 0;
        color: var(--el-text-color-regular);
        font-size: 0.875rem;
        line-height: 1.4;
      }
      
      .template-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .template-category {
          background: var(--el-color-primary-light-8);
          color: var(--el-color-primary);
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
        
        .template-usage {
          color: var(--el-text-color-secondary);
          font-size: 0.75rem;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xl)) {
  .tools-panel {
    max-width: 250px; width: 100%;
  }
  
  .drop-zones {
    grid-template-columns: 1fr;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .builder-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    
    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .builder-layout {
    flex-direction: column;
  }
  
  .tools-panel {
    width: 100%;
    max-min-height: 60px; height: auto;
    order: 2;
  }
  
  .builder-main {
    order: 1;
  }
  
  .config-panel {
    .drop-zones {
      grid-template-columns: 1fr;
    }
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>