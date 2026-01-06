<template>
  <div class="data-table">
    <!-- 表格工具栏 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <!-- 批量操作 -->
        <div class="batch-actions" v-if="selection.length > 0">
          <span class="selection-info">
            已选择 {{ selection.length }} 项
          </span>
          <slot name="batch-actions" :selection="selection">
            <el-button 
              type="danger" 
              size="small"
              @click="$emit('batch-delete', selection)"
            >
              批量删除
            </el-button>
          </slot>
        </div>
        
        <!-- 普通操作按钮 -->
        <div class="normal-actions" v-else>
          <slot name="toolbar-left">
            <el-button 
              type="primary" 
              :icon="Plus"
              @click="$emit('create')"
            >
              新建
            </el-button>
          </slot>
        </div>
      </div>

      <div class="toolbar-right">
        <!-- 搜索框 -->
        <el-input
          v-if="searchable"
          v-model="searchKeyword"
          placeholder="搜索姓名或学号..."
          :prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="handleSearch"
        />
        
        <!-- 筛选器 -->
        <el-dropdown v-if="filters.length > 0" @command="handleFilterCommand">
          <el-button :icon="Filter">
            筛选 <el-icon><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="filter in filters" 
                :key="filter.key"
                :command="filter.key"
              >
                {{ filter.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 刷新按钮 -->
        <el-button 
          :icon="Refresh" 
          @click="$emit('refresh')"
          :loading="loading"
        >
          刷新
        </el-button>

        <!-- 自定义工具栏按钮 -->
        <slot name="toolbar-right"></slot>
      </div>
    </div>

    <!-- 数据表格容器 -->
    <div ref="tableContainerRef" class="table-container">
      <el-table
        ref="tableRef"
        :data="tableData"
        :loading="loading"
        :height="tableHeight"
        :max-height="maxHeight"
        :stripe="stripe"
        :border="border"
        :size="size"
        :empty-text="emptyText"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
        v-bind="$attrs"
      >
      <!-- 选择列 -->
      <el-table-column 
        v-if="selectable"
        type="selection" 
        width="55"
        :selectable="selectableFunction"
      />

      <!-- 序号列 -->
      <el-table-column 
        v-if="showIndex"
        type="index" 
        label="序号"
        width="60"
        :index="getIndex"
      />

      <!-- 动态列 -->
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="getColumnWidth(column)"
        :min-width="column.minWidth || 80"
        :fixed="column.fixed"
        :sortable="column.sortable"
        :align="column.align || 'left'"
        :show-overflow-tooltip="column.showOverflowTooltip !== false"
      >
        <template #default="{ row, column: col, $index }">
          <slot 
            :name="`column-${column.prop}`" 
            :row="row" 
            :column="col" 
            :index="$index"
            :value="row[column.prop]"
          >
            <!-- 默认渲染 -->
            <span v-if="column.type === 'text'">
              {{ formatValue(row[column.prop], column) }}
            </span>
            
            <!-- 标签类型 -->
            <el-tag 
              v-else-if="column.type === 'tag'"
              :type="getTagType(row[column.prop], column)"
              size="small"
            >
              {{ formatValue(row[column.prop], column) }}
            </el-tag>
            
            <!-- 日期类型 -->
            <span v-else-if="column.type === 'date'">
              {{ formatDate(row[column.prop], column.format) }}
            </span>
            
            <!-- 操作按钮 -->
            <div v-else-if="column.type === 'actions'" class="table-actions">
              <slot
                :name="`actions`"
                :row="row"
                :index="$index"
              >
                <el-button
                  type="primary"
                  size="small"
                  plain
                  @click.stop="$emit('edit', row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  plain
                  @click.stop="$emit('delete', row)"
                >
                  删除
                </el-button>
              </slot>
            </div>
            
            <!-- 默认文本 -->
            <span v-else>
              {{ formatValue(row[column.prop], column) }}
            </span>
          </slot>
        </template>
      </el-table-column>
    </el-table>
    </div>

    <!-- 分页器 -->
    <div class="table-pagination" v-if="showPagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :background="true"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Plus, Search, Filter, Refresh, ArrowDown } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'
import dayjs from 'dayjs'

interface Column {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  flex?: number  // 新增flex属性用于响应式布局
  fixed?: boolean | string
  sortable?: boolean | string
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'tag' | 'date' | 'actions'
  format?: string
  showOverflowTooltip?: boolean
  tagMap?: Record<string, string>
  formatter?: (value: any, row: any) => string
}

interface Filter {
  key: string
  label: string
  value?: any
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  total?: number
  currentPage?: number
  pageSize?: number
  pageSizes?: number[]
  showPagination?: boolean
  paginationLayout?: string
  selectable?: boolean
  selectableFunction?: (row: any, index: number) => boolean
  showIndex?: boolean
  searchable?: boolean
  filters?: Filter[]
  showToolbar?: boolean
  tableHeight?: string | number
  maxHeight?: string | number
  stripe?: boolean
  border?: boolean
  size?: 'large' | 'default' | 'small'
  emptyText?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  showPagination: true,
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  selectable: false,
  showIndex: false,
  searchable: true,
  filters: () => [],
  showToolbar: true,
  stripe: true,
  border: true,
  size: 'default',
  emptyText: '暂无数据'
})

const emit = defineEmits<{
  create: []
  edit: [row: any]
  delete: [row: any]
  'batch-delete': [rows: any[]]
  refresh: []
  search: [keyword: string]
  filter: [filterKey: string]
  'sort-change': [sort: { prop: string; order: string }]
  'selection-change': [selection: any[]]
  'size-change': [size: number]
  'current-change': [page: number]
  'row-click': [row: any, column: any, event: Event]
  'row-dblclick': [row: any, column: any, event: Event]
}>()

const tableRef = ref()
const selection = ref<any[]>([])
const searchKeyword = ref('')

// 表格数据
const tableData = computed(() => props.data)

// 搜索处理
const handleSearch = debounce((keyword: string) => {
  emit('search', keyword)
}, 300)

// 筛选处理
const handleFilterCommand = (filterKey: string) => {
  emit('filter', filterKey)
}

// 选择变化处理
const handleSelectionChange = (val: any[]) => {
  selection.value = val
  emit('selection-change', val)
}

// 排序变化处理
const handleSortChange = (sort: { prop: string; order: string }) => {
  emit('sort-change', sort)
}

// 分页处理
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

// 行点击处理
const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handleRowDblClick = (row: any, column: any, event: Event) => {
  emit('row-dblclick', row, column, event)
}

// 序号计算
const getIndex = (index: number) => {
  return (props.currentPage - 1) * props.pageSize + index + 1
}

// 响应式表格容器引用
const tableContainerRef = ref()

// 列宽度计算 - 简化为自动宽度
const getColumnWidth = (column: Column) => {
  // 只有操作列等特殊列才设置固定宽度
  if (column.width && typeof column.width === 'number') {
    return column.width
  }

  // 其他列都使用自动宽度，让表格自适应
  return undefined
}

// 值格式化
const formatValue = (value: any, column: Column) => {
  if (column.formatter) {
    return column.formatter(value, column)
  }
  
  if (value === null || value === undefined) {
    return '-'
  }
  
  return String(value)
}

// 日期格式化
const formatDate = (value: any, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!value) return '-'
  return dayjs(value).format(format)
}

// 标签类型获取
const getTagType = (value: any, column: Column) => {
  if (column.tagMap && column.tagMap[value]) {
    return column.tagMap[value]
  }
  return 'default'
}

// 响应式列宽重新计算
const recalculateColumnWidths = () => {
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.doLayout()
    }
  })
}

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', recalculateColumnWidths)
})

onUnmounted(() => {
  window.removeEventListener('resize', recalculateColumnWidths)
})

// 暴露方法
defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) =>
    tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys?: string[]) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order),
  recalculateColumnWidths
})
</script>

<style scoped lang="scss">
.data-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; // 允许flex子项收缩
  background: transparent; // 使用透明背景，继承父容器的主题背景
  width: 100%; // 确保占满宽度
  overflow: hidden; // 防止内容溢出
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg);
  border-bottom: var(--border-width-base) solid #e8e9ea;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
  }

  .batch-actions {
    display: flex;
    align-items: center;
    gap: var(--text-sm);

    .selection-info {
      font-size: var(--text-base);
      color: #1677ff;
      font-weight: 500;
    }
  }
}

.table-container {
  flex: 1;
  overflow: auto; // 允许滚动
  min-height: 0; // 允许flex子项收缩
  width: 100%; // 确保容器宽度100%

  // 强制表格响应式
  :deep(.el-table) {
    width: 100% !important;
    min-width: 100% !important;
  }
}

// 响应式容器样式
.data-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  // 响应式调整
  @media (max-width: var(--breakpoint-xl)) {
    .table-toolbar {
      padding: var(--text-sm) var(--text-lg);

      .toolbar-right {
        gap: var(--spacing-sm);

        .el-input {
          width: 200px !important;
        }
      }
    }
  }

  @media (max-width: var(--breakpoint-md)) {
    .table-toolbar {
      padding: var(--spacing-sm) var(--text-sm);
      flex-direction: column;
      gap: var(--text-sm);

      .toolbar-left,
      .toolbar-right {
        width: 100%;
        justify-content: flex-start;
      }

      .toolbar-right {
        .el-input {
          width: 100% !important;
          max-width: 300px;
        }
      }
    }
  }
}

.table-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  align-items: center;

  .el-button {
    padding: var(--spacing-lg) var(--text-sm);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-var(--border-width-base));
    }
  }

  // 响应式操作按钮
  @media (max-width: var(--breakpoint-md)) {
    gap: var(--spacing-xs);

    .el-button {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--text-sm);
    }
  }
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: var(--text-lg);
  border-top: var(--border-width-base) solid #e8e9ea;
  flex-shrink: 0; // 防止分页被压缩
}

// Element Plus表格响应式优化
:deep(.el-table) {
  width: 100% !important;
  table-layout: auto !important;

  // 响应式处理
  @media (max-width: var(--breakpoint-xl)) {
    font-size: var(--text-sm);
  }

  @media (max-width: var(--breakpoint-md)) {
    font-size: var(--text-sm);
  }

  // 强制表格容器100%宽度
  .el-table__header-wrapper,
  .el-table__body-wrapper {
    width: 100% !important;
  }

  // 强制表格本身100%宽度并自适应
  .el-table__header,
  .el-table__body {
    width: 100% !important;
    table-layout: auto !important;
  }

  // 强制列自适应宽度
  .el-table__header-wrapper table,
  .el-table__body-wrapper table {
    width: 100% !important;
    table-layout: auto !important;
  }

  // 表格列自适应
  .el-table__header th,
  .el-table__body td {
    width: auto !important;
  }

  // 表格单元格响应式
  .el-table__cell {
    padding: var(--spacing-sm) var(--text-sm) !important;
    word-break: break-word;

    @media (max-width: var(--breakpoint-md)) {
      padding: var(--spacing-lg) var(--spacing-sm) !important;
      font-size: var(--text-sm);
    }
  }

  /* 只为表体启用滚动，不强制高度，避免出现表头下方的空白 */
  .el-table__body-wrapper {
    overflow-x: auto !important; // 允许横向滚动
    overflow-y: auto !important; // 允许纵向滚动
  }

  // 表格头部响应式
  .el-table__header {
    width: 100% !important;
    table-layout: fixed !important;
  }

  // 表格体响应式
  .el-table__body {
    width: 100% !important;
    table-layout: fixed !important;
  }

  // 单元格响应式
  .el-table th,
  .el-table td {
    padding: var(--text-sm) var(--text-lg) !important; // 增加内边距,让内容更舒适
    word-wrap: break-word !important; // 允许换行
    word-break: break-all !important; // 强制换行

    @media (max-width: var(--breakpoint-xl)) {
      padding: var(--spacing-2xl) var(--text-sm) !important; // 小屏幕下减少内边距
    }

    @media (max-width: var(--breakpoint-md)) {
      padding: var(--spacing-sm) 10px !important; // 更小屏幕下进一步减少内边距
    }
  }

  .el-table__header-wrapper {
    position: sticky;
    top: 0;
    z-index: 10;
    overflow: visible !important; // 确保表头不会被切断
  }

  // 确保表格内容不会被截断
  .el-table__body {
    width: 100% !important;
  }

  .el-table__row {
    width: 100% !important;
  }

  // 确保表头和表体列宽对齐
  .el-table__header {
    width: 100% !important;
  }

  .el-table__header-wrapper,
  .el-table__body-wrapper {
    .el-table__header,
    .el-table__body {
      table-layout: fixed !important;
    }
  }

  // 确保列宽稳定
  .el-table__header-wrapper {
    .el-table__header {
      .el-table__cell {
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .el-table__body-wrapper {
    .el-table__body {
      .el-table__cell {
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .table-toolbar {
    flex-direction: column;
    gap: var(--text-sm);
    align-items: stretch;

    .toolbar-left,
    .toolbar-right {
      justify-content: center;
    }
  }

  .table-pagination {
    justify-content: center;
  }
}
</style>
