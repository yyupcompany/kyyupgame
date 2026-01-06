<template>
  <div class="lazy-data-table">
    <!-- 异步组件包装器 -->
    <AsyncComponentWrapper
      :component-config="tableComponentConfig"
      :data-config="tableDataConfig"
      :component-props="tableProps"
      :use-suspense="useSuspense"
      :show-progress="true"
      :show-data-loading="true"
      :cancelable="true"
      loading-text="正在加载表格组件..."
      loading-tip="首次加载可能需要几秒钟"
      @loading="handleComponentLoading"
      @error="handleError"
      @loaded="handleComponentLoaded"
      @data-loaded="handleDataLoaded"
      @cancelled="handleCancelled"
      ref="asyncWrapper"
    />

    <!-- 工具栏 -->
    <div v-if="showToolbar && !isLoading" class="table-toolbar">
      <el-space>
        <el-button 
          type="primary" 
          size="small" 
          @click="refreshData"
          :loading="refreshing"
        >
          刷新数据
        </el-button>
        
        <el-button 
          type="default" 
          size="small" 
          @click="exportData"
          :disabled="!hasData"
        >
          导出数据
        </el-button>
        
        <el-select
          v-model="pageSize"
          size="small"
          style="width: 100px"
          @change="handlePageSizeChange"
        >
          <el-option label="10" :value="10" />
          <el-option label="20" :value="20" />
          <el-option label="50" :value="50" />
          <el-option label="100" :value="100" />
        </el-select>
      </el-space>
    </div>

    <!-- 状态信息 -->
    <div v-if="showStats" class="table-stats">
      <el-tag v-if="hasData" type="success" size="small">
        已加载 {{ dataCount }} 条记录
      </el-tag>
      <el-tag v-if="isLoading" type="warning" size="small">
        加载中...
      </el-tag>
      <el-tag v-if="hasError" type="danger" size="small">
        加载失败
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import AsyncComponentWrapper from './AsyncComponentWrapper.vue'
import type { AsyncComponentConfig, DataLoaderConfig } from '@/utils/async-component-loader'

interface TableColumn {
  prop: string
  label: string
  width?: number
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => string
}

interface Props {
  // 数据API配置
  apiUrl: string
  apiParams?: Record<string, any>
  // 表格配置
  columns: TableColumn[]
  // 分页配置
  pagination?: boolean
  defaultPageSize?: number
  // 显示配置
  showToolbar?: boolean
  showStats?: boolean
  useSuspense?: boolean
  // 缓存配置
  cacheKey?: string
  cacheDuration?: number
  // 预加载
  preload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  apiParams: () => ({}),
  pagination: true,
  defaultPageSize: 20,
  showToolbar: true,
  showStats: true,
  useSuspense: false,
  cacheDuration: 5 * 60 * 1000,
  preload: false
})

const emit = defineEmits<{
  dataLoaded: [data: any[]]
  error: [error: Error]
  pageChange: [page: number]
  sizeChange: [size: number]
}>()

// 状态管理
const isLoading = ref(false)
const hasError = ref(false)
const hasData = ref(false)
const refreshing = ref(false)
const pageSize = ref(props.defaultPageSize)
const currentPage = ref(1)
const tableData = ref<any[]>([])
const totalCount = ref(0)
const asyncWrapper = ref()

// 计算属性
const dataCount = computed(() => tableData.value?.length || 0)

// 表格组件配置
const tableComponentConfig = computed<AsyncComponentConfig>(() => ({
  loader: () => import('element-plus').then(ep => ep.ElTable),
  delay: 100,
  timeout: 10000,
  cache: true,
  retryLimit: 2,
  minLoadTime: 300
}))

// 数据加载配置
const tableDataConfig = computed<DataLoaderConfig>(() => ({
  loader: async () => {
    const response = await fetch(`${props.apiUrl}?${new URLSearchParams({
      page: currentPage.value.toString(),
      size: pageSize.value.toString(),
      ...props.apiParams
    })}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // 更新状态
    totalCount.value = result.total || 0
    tableData.value = result.data || result.items || []
    
    return result
  },
  cacheKey: props.cacheKey ? `${props.cacheKey}-${currentPage.value}-${pageSize.value}` : undefined,
  cacheDuration: props.cacheDuration,
  timeout: 15000,
  retry: {
    times: 2,
    delay: 1000,
    backoff: 2
  },
  dependencies: [currentPage.value, pageSize.value, props.apiParams],
  preload: props.preload
}))

// 表格组件属性
const tableProps = computed(() => ({
  data: tableData.value,
  columns: props.columns,
  border: true,
  stripe: true,
  'highlight-current-row': true,
  'empty-text': '暂无数据',
  style: { width: '100%' }
}))

// 事件处理
const handleComponentLoading = (loading: boolean) => {
  isLoading.value = loading
}

const handleError = (error: Error) => {
  hasError.value = true
  ElMessage.error(`加载失败: ${error.message}`)
  emit('error', error)
}

const handleComponentLoaded = () => {
  console.log('表格组件加载完成')
}

const handleDataLoaded = (data: any) => {
  hasData.value = true
  hasError.value = false
  emit('dataLoaded', tableData.value)
  console.log('表格数据加载完成:', data)
}

const handleCancelled = () => {
  ElMessage.info('数据加载已取消')
}

const refreshData = async () => {
  refreshing.value = true
  try {
    await asyncWrapper.value?.refresh()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    refreshing.value = false
  }
}

const exportData = () => {
  if (!hasData.value) return
  
  // 简单的CSV导出
  const headers = props.columns.map(col => col.label).join(',')
  const rows = tableData.value.map(row => 
    props.columns.map(col => row[col.prop] || '').join(',')
  ).join('\n')
  
  const csv = `${headers}\n${rows}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `table-data-${Date.now()}.csv`
  link.click()
  
  ElMessage.success('数据导出成功')
}

const handlePageSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  emit('sizeChange', newSize)
}

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage
  emit('pageChange', newPage)
}

// 监听变化
watch([currentPage, pageSize], () => {
  refreshData()
})

// 暴露方法
defineExpose({
  refresh: refreshData,
  getData: () => tableData.value,
  getTotal: () => totalCount.value,
  changePage: handlePageChange,
  changeSize: handlePageSizeChange
})
</script>

<style scoped lang="scss">
.lazy-data-table {
  .table-toolbar {
    padding: 1rem 0;
    border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
    margin-bottom: 1rem;
  }
  
  .table-stats {
    padding: 0.5rem 0;
    text-align: right;
    
    .el-tag {
      margin-left: 0.5rem;
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .lazy-data-table {
    .table-toolbar {
      padding: 0.5rem 0;
      
      .el-space {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    }
    
    .table-stats {
      text-align: center;
    }
  }
}
</style>