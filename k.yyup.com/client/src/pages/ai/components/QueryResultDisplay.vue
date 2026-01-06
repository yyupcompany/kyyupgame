<template>
  <div class="query-result-display">
    <el-card v-if="results" shadow="never">
      <template #header>
        <div class="result-header">
          <div class="result-info">
            <UnifiedIcon name="default" />
            <span class="result-title">查询结果</span>
            <el-tag size="small" :type="getStatusTagType()" class="result-count">
              {{ results.metadata?.rowCount || 0 }} 条记录
            </el-tag>
            <el-tag 
              v-if="results.metadata?.cacheHit" 
              size="small" 
              type="success"
              class="cache-tag"
            >
              <UnifiedIcon name="default" />
              缓存命中
            </el-tag>
          </div>
          
          <div class="result-actions">
            <el-button-group>
              <el-button 
                :type="displayMode === 'table' ? 'primary' : 'default'"
                @click="setDisplayMode('table')"
                size="small"
              >
                <UnifiedIcon name="default" />
                表格
              </el-button>
              <el-button 
                :type="displayMode === 'chart' ? 'primary' : 'default'"
                @click="setDisplayMode('chart')"
                size="small"
                :disabled="!canShowChart"
              >
                <UnifiedIcon name="default" />
                图表
              </el-button>
              <el-button 
                :type="displayMode === 'json' ? 'primary' : 'default'"
                @click="setDisplayMode('json')"
                size="small"
              >
                <UnifiedIcon name="default" />
                JSON
              </el-button>
            </el-button-group>
            
            <el-dropdown @command="handleAction" trigger="click">
              <el-button size="small">
                <UnifiedIcon name="default" />
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="refresh">
                    <UnifiedIcon name="Refresh" />
                    刷新查询
                  </el-dropdown-item>
                  <el-dropdown-item command="feedback">
                    <UnifiedIcon name="default" />
                    提交反馈
                  </el-dropdown-item>
                  <el-dropdown-item divided command="export-excel">
                    <UnifiedIcon name="Download" />
                    导出Excel
                  </el-dropdown-item>
                  <el-dropdown-item command="export-csv">
                    <UnifiedIcon name="Download" />
                    导出CSV
                  </el-dropdown-item>
                  <el-dropdown-item command="export-pdf">
                    <UnifiedIcon name="Download" />
                    导出PDF
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <!-- 表格显示 -->
      <div v-if="displayMode === 'table'" class="table-container">
        <div class="table-wrapper">
<el-table class="responsive-table" 
          :data="results.data" 
          style="width: 100%"
          :max-height="600"
          stripe
          border
          :loading="loading"
          empty-text="暂无数据"
          @sort-change="handleSortChange"
        >
          <el-table-column
            v-for="column in tableColumns"
            :key="column.name"
            :prop="column.name"
            :label="column.label"
            :width="column.width"
            :sortable="column.sortable"
            :fixed="column.fixed"
            show-overflow-tooltip
          >
            <template #default="{ row, column: tableColumn }">
              <span v-if="getColumnType(tableColumn.property) === 'number'" class="number-cell">
                {{ formatNumber(row[tableColumn.property]) }}
              </span>
              <span v-else-if="getColumnType(tableColumn.property) === 'date'" class="date-cell">
                {{ formatDate(row[tableColumn.property]) }}
              </span>
              <el-tag 
                v-else-if="getColumnType(tableColumn.property) === 'status'" 
                :type="getStatusTagTypeByValue(row[tableColumn.property])"
                size="small"
              >
                {{ row[tableColumn.property] }}
              </el-tag>
              <span v-else class="text-cell">
                {{ row[tableColumn.property] }}
              </span>
            </template>
          </el-table-column>
        </el-table>
</div>

        <!-- 分页器 -->
        <div v-if="showPagination" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 图表显示 -->
      <div v-if="displayMode === 'chart' && canShowChart" class="chart-container">
        <div class="chart-header">
          <h4 class="chart-title">{{ chartConfig?.title || '数据可视化' }}</h4>
          <div class="chart-controls">
            <el-select v-model="chartType" size="small" @change="updateChartType">
              <el-option label="柱状图" value="bar" />
              <el-option label="折线图" value="line" />
              <el-option label="饼图" value="pie" />
              <el-option label="面积图" value="area" />
            </el-select>
          </div>
        </div>
        <div ref="chartRef" class="chart-content" :style="{ height: chartHeight + 'px' }"></div>
      </div>

      <!-- JSON显示 -->
      <div v-if="displayMode === 'json'" class="json-container">
        <div class="json-header">
          <span class="json-title">JSON 数据</span>
          <el-button size="small" @click="copyJsonToClipboard">
            <UnifiedIcon name="default" />
            复制
          </el-button>
        </div>
        <pre class="json-content"><code>{{ formatJsonData }}</code></pre>
      </div>

      <!-- 执行信息 -->
      <div class="execution-info">
        <el-descriptions :column="4" size="small" border>
          <el-descriptions-item label="执行时间">
            <el-tag size="small" :type="getExecutionTimeTagType()">
              {{ results.metadata?.executionTime || 0 }}ms
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="返回行数">
            <span class="info-value">{{ results.metadata?.rowCount || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="查询时间">
            <span class="info-value">{{ formatTime(queryTime) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="缓存状态">
            <el-tag 
              size="small" 
              :type="results.metadata?.cacheHit ? 'success' : 'info'"
            >
              {{ results.metadata?.cacheHit ? '命中' : '未命中' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 空状态 -->
    <el-empty 
      v-else-if="!loading" 
      description="暂无查询结果"
      :image-size="120"
    >
      <el-button type="primary" @click="$emit('refresh')">
        <UnifiedIcon name="Search" />
        开始查询
      </el-button>
    </el-empty>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-loading :loading="true" text="正在执行查询...">
        <div style="min-height: 60px; height: auto;"></div>
      </el-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  DataAnalysis, Clock, Grid, TrendCharts, Document, MoreFilled, 
  Refresh, ChatLineRound, Download, Search, CopyDocument 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

// 定义Props
interface Props {
  results?: any
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 定义Emits
const emit = defineEmits<{
  export: [format: string]
  refresh: []
  feedback: []
}>()

// 响应式数据
const displayMode = ref<'table' | 'chart' | 'json'>('table')
const chartRef = ref<HTMLDivElement>()
const chartInstance = ref<ECharts>()
const chartType = ref('bar')
const chartHeight = ref(400)
const currentPage = ref(1)
const pageSize = ref(20)
const queryTime = ref(Date.now())

// 计算属性
const tableColumns = computed(() => {
  if (!props.results?.metadata?.columns) return []
  
  return props.results.metadata.columns.map((col: any) => ({
    name: col.name,
    label: col.label || col.name,
    type: col.type || 'string',
    width: getColumnWidth(col.type, col.name),
    sortable: col.type === 'number' || col.type === 'date',
    fixed: col.name === 'id' ? 'left' : false
  }))
})

const canShowChart = computed(() => {
  return props.results?.visualization || 
         (props.results?.data?.length > 0 && isChartableData())
})

const chartConfig = computed(() => {
  return props.results?.visualization || generateChartConfig()
})

const formatJsonData = computed(() => {
  if (!props.results) return ''
  return JSON.stringify(props.results, null, 2)
})

const showPagination = computed(() => {
  return props.results?.data?.length > pageSize.value
})

const totalCount = computed(() => {
  return props.results?.data?.length || 0
})

// 方法
const setDisplayMode = (mode: 'table' | 'chart' | 'json') => {
  displayMode.value = mode
  if (mode === 'chart') {
    nextTick(() => {
      initChart()
    })
  }
}

const getStatusTagType = () => {
  const count = props.results?.metadata?.rowCount || 0
  if (count === 0) return 'info'
  if (count < 10) return 'warning'
  return 'success'
}

const getExecutionTimeTagType = () => {
  const time = props.results?.metadata?.executionTime || 0
  if (time < 500) return 'success'
  if (time < 2000) return 'warning'
  return 'danger'
}

const getColumnWidth = (type: string, name: string) => {
  if (name === 'id') return 80
  if (type === 'number') return 120
  if (type === 'date') return 160
  if (name.includes('name') || name.includes('title')) return 200
  return undefined
}

const getColumnType = (propName: string) => {
  const column = tableColumns.value.find(col => col.name === propName)
  return column?.type || 'string'
}

const getStatusTagTypeByValue = (value: any) => {
  if (typeof value !== 'string') return 'default'
  
  const statusMap: { [key: string]: string } = {
    'active': 'success',
    'success': 'success',
    'completed': 'success',
    'pending': 'warning',
    'processing': 'warning',
    'failed': 'danger',
    'error': 'danger',
    'cancelled': 'info',
    'disabled': 'info'
  }
  
  return statusMap[value.toLowerCase()] || 'default'
}

const formatNumber = (value: any) => {
  if (value === null || value === undefined) return '-'
  const num = Number(value)
  if (isNaN(num)) return value
  
  // 格式化大数字
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  
  return num.toLocaleString()
}

const formatDate = (value: any) => {
  if (!value) return '-'
  
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return value
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

const handleAction = (command: string) => {
  switch (command) {
    case 'refresh':
      emit('refresh')
      break
    case 'feedback':
      emit('feedback')
      break
    case 'export-excel':
    case 'export-csv':
    case 'export-pdf':
      const format = command.split('-')[1]
      emit('export', format)
      break
  }
}

const handleSortChange = ({ column, prop, order }: any) => {
  // 客户端排序
  if (!props.results?.data) return
  
  const data = [...props.results.data]
  if (order === 'ascending') {
    data.sort((a, b) => {
      const aVal = a[prop]
      const bVal = b[prop]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return aVal - bVal
      }
      return String(aVal).localeCompare(String(bVal))
    })
  } else if (order === 'descending') {
    data.sort((a, b) => {
      const aVal = a[prop]
      const bVal = b[prop]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return bVal - aVal
      }
      return String(bVal).localeCompare(String(aVal))
    })
  }
  
  // 更新数据（这里应该通过emit通知父组件）
  console.log('排序结果:', { prop, order, data })
}

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

const copyJsonToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formatJsonData.value)
    ElMessage.success('JSON数据已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 图表相关方法
const isChartableData = () => {
  if (!props.results?.data?.length) return false
  
  const firstRow = props.results.data[0]
  const keys = Object.keys(firstRow)
  
  // 检查是否有数值列
  const hasNumberColumn = keys.some(key => {
    const value = firstRow[key]
    return typeof value === 'number' || !isNaN(Number(value))
  })
  
  return hasNumberColumn && keys.length >= 2
}

const generateChartConfig = () => {
  if (!props.results?.data?.length) return null
  
  const data = props.results.data
  const firstRow = data[0]
  const keys = Object.keys(firstRow)
  
  // 找到标签列和数值列
  const labelColumn = keys[0]
  const valueColumn = keys.find(key => {
    const value = firstRow[key]
    return typeof value === 'number' || !isNaN(Number(value))
  })
  
  if (!valueColumn) return null
  
  return {
    type: chartType.value,
    title: '数据可视化',
    xAxis: {
      data: data.map(row => row[labelColumn])
    },
    yAxis: {},
    series: [{
      name: tableColumns.value.find(col => col.name === valueColumn)?.label || valueColumn,
      type: chartType.value === 'pie' ? 'pie' : chartType.value,
      data: chartType.value === 'pie' 
        ? data.map(row => ({
            name: row[labelColumn],
            value: Number(row[valueColumn]) || 0
          }))
        : data.map(row => Number(row[valueColumn]) || 0)
    }]
  }
}

const initChart = () => {
  if (!chartRef.value || !canShowChart.value) return
  
  // 销毁现有图表
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  
  // 创建新图表
  chartInstance.value = echarts.init(chartRef.value)
  updateChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

const updateChart = () => {
  if (!chartInstance.value || !chartConfig.value) return
  
  const option = {
    title: {
      text: chartConfig.value.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: chartType.value === 'pie' ? 'item' : 'axis',
      formatter: chartType.value === 'pie' 
        ? '{a} <br/>{b}: {c} ({d}%)'
        : undefined
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      show: chartType.value === 'pie'
    },
    xAxis: chartType.value !== 'pie' ? {
      type: 'category',
      data: chartConfig.value.xAxis?.data || [],
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    } : undefined,
    yAxis: chartType.value !== 'pie' ? {
      type: 'value'
    } : undefined,
    series: chartConfig.value.series.map((s: any) => ({
      ...s,
      type: chartType.value === 'pie' ? 'pie' : chartType.value,
      radius: chartType.value === 'pie' ? '60%' : undefined,
      center: chartType.value === 'pie' ? ['50%', '60%'] : undefined,
      smooth: chartType.value === 'line',
      areaStyle: chartType.value === 'area' ? {} : undefined
    })),
    grid: chartType.value !== 'pie' ? {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    } : undefined
  }
  
  chartInstance.value.setOption(option, true)
}

const updateChartType = () => {
  if (chartInstance.value) {
    updateChart()
  }
}

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// 生命周期
onMounted(() => {
  queryTime.value = Date.now()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

// 监听结果变化
watch(() => props.results, (newResults) => {
  if (newResults) {
    queryTime.value = Date.now()
    currentPage.value = 1
    
    // 如果当前是图表模式，重新初始化图表
    if (displayMode.value === 'chart') {
      nextTick(() => {
        initChart()
      })
    }
  }
}, { immediate: true })

// 监听显示模式变化
watch(displayMode, (newMode) => {
  if (newMode === 'chart' && canShowChart.value) {
    nextTick(() => {
      initChart()
    })
  }
})
</script>

<style scoped lang="scss">
.query-result-display {
  margin-top: var(--text-2xl);

  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .result-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-2xl);

      .result-title {
        font-weight: 500;
        font-size: var(--text-lg);
      }

      .result-count {
        margin-left: var(--spacing-base);
      }

      .cache-tag {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }
    }

    .result-actions {
      display: flex;
      gap: var(--spacing-2xl);
    }
  }

  .table-container {
    .pagination-container {
      margin-top: var(--text-2xl);
      display: flex;
      justify-content: center;
    }
  }

  .chart-container {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-2xl);

      .chart-title {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 500;
      }

      .chart-controls {
        display: flex;
        gap: var(--spacing-2xl);
      }
    }

    .chart-content {
      width: 100%;
      min-min-height: 60px; height: auto;
    }
  }

  .json-container {
    .json-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4xl);

      .json-title {
        font-weight: 500;
      }
    }

    .json-content {
      background: var(--bg-gray-light);
      border: var(--border-width-base) solid #e9ecef;
      border-radius: var(--spacing-xs);
      padding: var(--spacing-4xl);
      max-min-height: 60px; height: auto;
      overflow-y: auto;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: var(--text-sm);
      line-height: 1.4;
      margin: 0;
    }
  }

  .execution-info {
    margin-top: var(--text-2xl);
    padding-top: var(--spacing-4xl);
    border-top: var(--z-index-dropdown) solid #ebeef5;

    .info-value {
      font-weight: 500;
    }
  }

  .loading-container {
    margin: var(--spacing-10xl) 0;
  }

  // 表格单元格样式
  .number-cell {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-weight: 500;
    color: var(--primary-color);
  }

  .date-cell {
    color: var(--success-color);
    font-size: var(--text-sm);
  }

  .text-cell {
    word-break: break-word;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .query-result-display {
    .result-header {
      flex-direction: column;
      gap: var(--spacing-4xl);
      align-items: stretch;

      .result-info {
        justify-content: center;
        flex-wrap: wrap;
      }

      .result-actions {
        justify-content: center;
      }
    }

    .chart-container .chart-header {
      flex-direction: column;
      gap: var(--spacing-2xl);
      align-items: stretch;

      .chart-controls {
        justify-content: center;
      }
    }

    .execution-info {
      :deep(.el-descriptions) {
        .el-descriptions__body .el-descriptions__table {
          .el-descriptions__cell {
            .el-descriptions__label,
            .el-descriptions__content {
              display: block;
              text-align: center;
            }
          }
        }
      }
    }
  }
}
</style>