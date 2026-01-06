<template>
  <el-dialog
    v-model="visible"
    title="查询历史"
    width="1200px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="history-dialog">
      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索查询内容..."
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="filters.status"
              placeholder="执行状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
              <el-option label="执行中" value="pending" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
          </el-col>
          <el-col :span="4">
            <el-button @click="resetFilters">重置</el-button>
            <el-button type="primary" @click="exportHistory">导出</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 查询历史表格 -->
      <div class="table-section">
        <div class="table-wrapper">
<el-table class="responsive-table"
          :data="queryHistory"
          v-loading="loading"
          height="500"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="查询内容" min-width="200">
            <template #default="{ row }">
              <div class="query-content">
                <p class="natural-query">{{ row.naturalQuery }}</p>
                <el-tag 
                  v-if="row.queryComplexity" 
                  size="small" 
                  :type="getComplexityType(row.queryComplexity)"
                >
                  复杂度: {{ getComplexityLabel(row.queryComplexity) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="执行状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.executionStatus)">
                {{ getStatusText(row.executionStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="结果数量" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.resultCount !== null">{{ row.resultCount.toLocaleString() }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="执行时间" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.executionTime">{{ row.executionTime }}ms</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="AI处理" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.aiProcessingTime">{{ row.aiProcessingTime }}ms</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="缓存命中" width="80" align="center">
            <template #default="{ row }">
              <UnifiedIcon name="default" />
              <UnifiedIcon name="Close" />
            </template>
          </el-table-column>
          
          <el-table-column label="创建时间" width="150">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="text" 
                size="small" 
                @click.stop="viewDetail(row)"
              >
                详情
              </el-button>
              <el-button 
                type="text" 
                size="small" 
                :disabled="row.executionStatus !== 'success'"
                @click.stop="reExecute(row)"
              >
                重新执行
              </el-button>
            </template>
          </el-table-column>
        </el-table>
</div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetail"
      title="查询详情"
      width="800px"
      destroy-on-close
    >
      <div v-if="selectedQuery" class="query-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="查询ID">
            {{ selectedQuery.id }}
          </el-descriptions-item>
          <el-descriptions-item label="执行状态">
            <el-tag :type="getStatusType(selectedQuery.executionStatus)">
              {{ getStatusText(selectedQuery.executionStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="结果数量">
            {{ selectedQuery.resultCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="执行时间">
            {{ selectedQuery.executionTime || 0 }}ms
          </el-descriptions-item>
          <el-descriptions-item label="AI处理时间">
            {{ selectedQuery.aiProcessingTime || 0 }}ms
          </el-descriptions-item>
          <el-descriptions-item label="使用模型">
            {{ selectedQuery.modelUsed || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Token消耗">
            {{ selectedQuery.tokensUsed || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="缓存命中">
            <el-tag :type="selectedQuery.cacheHit ? 'success' : 'danger'">
              {{ selectedQuery.cacheHit ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDate(selectedQuery.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="query-content-section">
          <h4>自然语言查询:</h4>
          <div class="content-box">
            {{ selectedQuery.naturalQuery }}
          </div>
        </div>

        <div v-if="selectedQuery.generatedSql" class="sql-section">
          <h4>生成的SQL:</h4>
          <pre class="sql-code">{{ selectedQuery.generatedSql }}</pre>
        </div>

        <div v-if="selectedQuery.finalSql && selectedQuery.finalSql !== selectedQuery.generatedSql" class="sql-section">
          <h4>最终执行SQL:</h4>
          <pre class="sql-code">{{ selectedQuery.finalSql }}</pre>
        </div>

        <div v-if="selectedQuery.errorMessage" class="error-section">
          <h4>错误信息:</h4>
          <div class="error-box">
            <p><strong>错误类型:</strong> {{ selectedQuery.errorType }}</p>
            <p><strong>错误详情:</strong> {{ selectedQuery.errorMessage }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
        <el-button 
          v-if="selectedQuery?.executionStatus === 'success'" 
          type="primary" 
          @click="reuseQuery"
        >
          重用查询
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { useAIQuery } from '@/composables/useAIQuery'
import type { AIQueryLog, QueryHistoryParams } from '@/api/modules/ai-query'

// 定义Props
interface Props {
  modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// 定义Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'reuse-query': [query: string]
}>()

// 使用AI查询组合式函数
const { getQueryHistory, reExecuteQuery } = useAIQuery()

// 响应式数据
const visible = ref(false)
const loading = ref(false)
const queryHistory = ref<AIQueryLog[]>([])
const selectedQueries = ref<AIQueryLog[]>([])
const selectedQuery = ref<AIQueryLog | null>(null)
const showDetail = ref(false)
const dateRange = ref<[string, string] | null>(null)

const filters = reactive({
  keyword: '',
  status: '',
  startDate: '',
  endDate: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 方法
const fetchHistory = async () => {
  loading.value = true
  try {
    const params: QueryHistoryParams = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    if (filters.keyword) {
      params.keyword = filters.keyword
    }
    if (filters.status) {
      params.status = filters.status
    }
    if (filters.startDate) {
      params.startDate = filters.startDate
    }
    if (filters.endDate) {
      params.endDate = filters.endDate
    }

    const result = await getQueryHistory(params)
    if (result?.data) {
      queryHistory.value = result.data.data
      pagination.total = result.data.total
    }
  } catch (error: any) {
    console.error('获取查询历史失败:', error)
    ElMessage.error('获取查询历史失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchHistory()
}

const handleDateChange = (dates: [string, string] | null) => {
  if (dates) {
    filters.startDate = dates[0]
    filters.endDate = dates[1]
  } else {
    filters.startDate = ''
    filters.endDate = ''
  }
  handleSearch()
}

const resetFilters = () => {
  filters.keyword = ''
  filters.status = ''
  filters.startDate = ''
  filters.endDate = ''
  dateRange.value = null
  pagination.page = 1
  fetchHistory()
}

const handleRowClick = (row: AIQueryLog) => {
  selectedQuery.value = row
  showDetail.value = true
}

const handleSelectionChange = (selection: AIQueryLog[]) => {
  selectedQueries.value = selection
}

const viewDetail = (row: AIQueryLog) => {
  selectedQuery.value = row
  showDetail.value = true
}

const reExecute = async (row: AIQueryLog) => {
  try {
    await ElMessageBox.confirm('确定要重新执行这个查询吗？', '确认', {
      type: 'warning'
    })

    const result = await reExecuteQuery(row.id)
    if (result?.success) {
      ElMessage.success('查询重新执行成功')
      fetchHistory()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重新执行查询失败:', error)
      ElMessage.error('重新执行查询失败')
    }
  }
}

const reuseQuery = () => {
  if (selectedQuery.value) {
    emit('reuse-query', selectedQuery.value.naturalQuery)
    showDetail.value = false
    handleClose()
  }
}

const exportHistory = async () => {
  try {
    if (selectedQueries.value.length === 0) {
      ElMessage.warning('请先选择要导出的查询记录')
      return
    }

    // 这里可以实现导出功能
    ElMessage.success('导出功能开发中...')
  } catch (error: any) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const handleSizeChange = (newSize: number) => {
  pagination.pageSize = newSize
  pagination.page = 1
  fetchHistory()
}

const handleCurrentChange = (newPage: number) => {
  pagination.page = newPage
  fetchHistory()
}

const handleClose = () => {
  emit('update:modelValue', false)
  selectedQuery.value = null
  selectedQueries.value = []
}

// 工具函数
const getStatusType = (status: string) => {
  const typeMap: { [key: string]: string } = {
    'success': 'success',
    'failed': 'danger',
    'pending': 'warning',
    'cancelled': 'info'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap: { [key: string]: string } = {
    'success': '成功',
    'failed': '失败',
    'pending': '执行中',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

const getComplexityType = (complexity: number) => {
  if (complexity <= 3) return 'success'
  if (complexity <= 6) return 'warning'
  return 'danger'
}

const getComplexityLabel = (complexity: number) => {
  if (complexity <= 3) return '简单'
  if (complexity <= 6) return '中等'
  return '复杂'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
  if (newValue) {
    fetchHistory()
  }
})

watch(visible, (newValue) => {
  if (!newValue) {
    emit('update:modelValue', false)
  }
})

// 生命周期
onMounted(() => {
  visible.value = props.modelValue
})
</script>

<style scoped lang="scss">
.history-dialog {
  .filter-section {
    margin-bottom: var(--text-2xl);
    padding-bottom: var(--spacing-4xl);
    border-bottom: var(--z-index-dropdown) solid #ebeef5;
  }

  .table-section {
    margin-bottom: var(--text-2xl);

    .query-content {
      .natural-query {
        margin: 0 0 5px 0;
        font-size: var(--text-base);
        color: var(--text-primary);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
    }
  }

  .pagination-section {
    text-align: center;
    padding-top: var(--spacing-4xl);
    border-top: var(--z-index-dropdown) solid #ebeef5;
  }
}

.query-detail {
  .query-content-section,
  .sql-section,
  .error-section {
    margin-top: var(--text-2xl);

    h4 {
      margin: 0 0 10px 0;
      font-size: var(--text-base);
      color: var(--text-primary);
    }
  }

  .content-box {
    background: var(--bg-gray-light);
    border: var(--border-width-base) solid #e9ecef;
    border-radius: var(--spacing-xs);
    padding: var(--text-sm);
    font-size: var(--text-base);
    line-height: 1.6;
    color: #495057;
  }

  .sql-code {
    background: var(--bg-gray-light);
    border: var(--border-width-base) solid #e9ecef;
    border-radius: var(--spacing-xs);
    padding: var(--text-sm);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: var(--text-sm);
    line-height: 1.4;
    overflow-x: auto;
    margin: 0;
    color: #495057;
  }

  .error-box {
    background: #fef2f2;
    border: var(--border-width-base) solid #fecaca;
    border-radius: var(--spacing-xs);
    padding: var(--text-sm);
    color: #dc2626;

    p {
      margin: 0 0 var(--spacing-sm) 0;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .history-dialog {
    .filter-section {
      .el-row {
        .el-col {
          margin-bottom: var(--spacing-2xl);
        }
      }
    }
  }
}
</style>