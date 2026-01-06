<template>
  <div class="ai-data-table">
    <div class="table-header">
      <h3>{{ title }}</h3>
      <div class="table-toolbar" v-if="showToolbar">
        <div class="search-container" v-if="searchable">
          <el-input
            v-model="searchQuery"
            placeholder="搜索..."
            clearable
            size="default"
            style="width: 200px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="export-container" v-if="exportable">
          <el-button type="primary" @click="exportData" size="default">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <el-table
        :data="displayData"
        stripe
        border
        style="width: 100%"
        :empty-text="emptyText"
        :default-sort="{ prop: sortedColumn, order: sortDirection === 'asc' ? 'ascending' : 'descending' }"
        @sort-change="handleSortChange"
        max-height="500"
      >
        <el-table-column
          v-for="(column, index) in columns"
          :key="index"
          :prop="column.key"
          :label="column.title"
          :width="column.width"
          :sortable="column.sortable ? 'custom' : false"
          :align="isNumericColumn(column) ? 'right' : 'left'"
        >
          <template #default="{ row, $index }">
            <template v-if="column.render">
              <div v-html="column.render(row[column.key], row, $index)"></div>
            </template>
            <template v-else-if="column.type === 'date'">
              {{ formatDate(row[column.key]) }}
            </template>
            <template v-else-if="column.type === 'currency'">
              {{ formatCurrency(row[column.key]) }}
            </template>
            <template v-else-if="column.type === 'boolean'">
              <el-tag :type="row[column.key] ? 'success' : 'info'" size="small">
                {{ row[column.key] ? '是' : '否' }}
              </el-tag>
            </template>
            <template v-else-if="column.type === 'progress'">
              <el-progress :percentage="row[column.key]" :stroke-width="6" />
            </template>
            <template v-else-if="column.type === 'status'">
              <el-tag :type="getStatusType(row[column.key])" size="small">
                {{ getStatusLabel(row[column.key]) }}
              </el-tag>
            </template>
            <template v-else>
              {{ row[column.key] }}
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div class="table-footer" v-if="pagination && totalRows > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalRows"
        layout="prev, pager, next, jumper, total"
        @current-change="handlePageChange"
        background
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { Search, Download } from '@element-plus/icons-vue';

export default {
  name: 'AiDataTable',
  components: {
    Search,
    Download
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      required: true,
      // [{
      //   key: 'name',
      //   title: '姓名',
      //   sortable: true,
      //   width: '200px',
      //   type: 'text' | 'date' | 'currency' | 'boolean' | 'progress' | 'status'
      //   render: (value, row, index) => `<span>${value}</span>`
      // }]
    },
    title: {
      type: String,
      default: '数据表格'
    },
    searchable: {
      type: Boolean,
      default: true
    },
    pagination: {
      type: Boolean,
      default: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    exportable: {
      type: Boolean,
      default: true
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    }
  },
  
  setup(props) {
    const searchQuery = ref('');
    const sortedColumn = ref('');
    const sortDirection = ref('asc');
    const currentPage = ref(1);
    
    // 监听数据变化，重置分页
    watch(() => props.data, () => {
      currentPage.value = 1;
    });
    
    // 确保currentPage始终有效
    watch(currentPage, (newValue) => {
      if (!newValue || newValue < 1) {
        currentPage.value = 1;
      }
    });
    
    // 过滤后的数据
    const filteredData = computed(() => {
      if (!Array.isArray(props.data)) {
        console.warn('📊 [DataTable] props.data is not an array:', props.data)
        return []
      }

      console.log('📊 [DataTable] 原始数据:', {
        dataLength: props.data.length,
        data: props.data,
        columns: props.columns,
        title: props.title
      });

      if (!searchQuery.value) {
        return props.data;
      }

      const query = searchQuery.value.toLowerCase();
      const filtered = props.data.filter(row => {
        return Object.keys(row).some(key => {
          const value = row[key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(query);
        });
      });

      console.log('🔍 [DataTable] 搜索后数据:', filtered.length);
      return filtered;
    });
    
    // 排序后的数据
    const sortedData = computed(() => {
      if (!Array.isArray(filteredData.value)) {
        return []
      }
      
      if (!sortedColumn.value) {
        return filteredData.value;
      }
      
      return [...filteredData.value].sort((a, b) => {
        const aValue = a[sortedColumn.value];
        const bValue = b[sortedColumn.value];
        
        // 处理空值
        if (aValue === undefined || aValue === null) return sortDirection.value === 'asc' ? -1 : 1;
        if (bValue === undefined || bValue === null) return sortDirection.value === 'asc' ? 1 : -1;
        
        // 数字类型
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection.value === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // 日期类型
        if (isDate(aValue) && isDate(bValue)) {
          const dateA = new Date(aValue);
          const dateB = new Date(bValue);
          return sortDirection.value === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        // 字符串类型
        const strA = String(aValue).toLowerCase();
        const strB = String(bValue).toLowerCase();
        return sortDirection.value === 'asc' 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      });
    });
    
    // 分页后的数据
    const displayData = computed(() => {
      if (!props.pagination) {
        console.log('📄 [DataTable] 无分页，显示全部数据:', sortedData.value.length);
        return sortedData.value;
      }

      const start = (currentPage.value - 1) * props.pageSize;
      const end = start + props.pageSize;
      const paged = sortedData.value.slice(start, end);

      console.log('📄 [DataTable] 分页数据:', {
        currentPage: currentPage.value,
        pageSize: props.pageSize,
        start,
        end,
        totalRows: sortedData.value.length,
        displayRows: paged.length,
        data: paged
      });

      return paged;
    });
    
    // 总行数
    const totalRows = computed(() => filteredData.value.length);
    
    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(totalRows.value / props.pageSize);
    });
    
    // 排序功能
    const sortBy = (columnKey) => {
      if (sortedColumn.value === columnKey) {
        // 切换排序方向
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        // 新的排序列
        sortedColumn.value = columnKey;
        sortDirection.value = 'asc';
      }
      
      // 排序后回到第一页
      currentPage.value = 1;
    };
    
    // 切换页码
    const changePage = (page) => {
      if (!page || page < 1 || page > totalPages.value) return;
      currentPage.value = page;
    };
    
    // 导出数据
    const exportData = () => {
      const rows = [
        // 表头
        props.columns.map(col => col.title),
        // 数据行
        ...sortedData.value.map(row => 
          props.columns.map(col => {
            const value = row[col.key];
            if (col.type === 'date') {
              return formatDate(value);
            } else if (col.type === 'currency') {
              return formatCurrency(value);
            } else if (col.type === 'boolean') {
              return value ? '是' : '否';
            } else {
              return value;
            }
          })
        )
      ];
      
      // 创建CSV内容
      const csvContent = rows
        .map(row => row.map(value => `"${value}"`).join(','))
        .join('\n');
      
      // 创建Blob和下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${props.title || 'data'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date)) return dateStr;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 格式化货币
    const formatCurrency = (value) => {
      if (value === null || value === undefined) return '';
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY'
      }).format(value);
    };
    
    // 检查是否为数字类型
    const isNumeric = (value) => {
      return !isNaN(parseFloat(value)) && isFinite(value);
    };
    
    // 检查是否为日期
    const isDate = (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date);
    };
    
    // 获取状态标签
    const getStatusLabel = (status) => {
      const statusMap = {
        success: '成功',
        warning: '警告',
        danger: '危险',
        info: '信息',
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
        failed: '失败'
      };
      return statusMap[status] || status;
    };
    
    // 获取状态类型（用于el-tag）
    const getStatusType = (status) => {
      const typeMap = {
        success: 'success',
        warning: 'warning',
        danger: 'danger',
        info: 'info',
        pending: 'info',
        processing: 'primary',
        completed: 'success',
        failed: 'danger'
      };
      return typeMap[status] || 'info';
    };
    
    // 处理el-table的排序变化
    const handleSortChange = ({ prop, order }) => {
      if (!prop) {
        sortedColumn.value = '';
        sortDirection.value = 'asc';
        return;
      }
      
      sortedColumn.value = prop;
      sortDirection.value = order === 'ascending' ? 'asc' : 'desc';
      currentPage.value = 1; // 排序后回到第一页
    };
    
    // 处理分页变化
    const handlePageChange = (page) => {
      currentPage.value = page;
    };
    
    // 判断是否为数字列
    const isNumericColumn = (column) => {
      return column.type === 'currency' || column.key === 'id';
    };
    
    return {
      searchQuery,
      sortedColumn,
      sortDirection,
      currentPage,
      displayData,
      totalRows,
      totalPages,
      sortBy,
      changePage,
      exportData,
      formatDate,
      formatCurrency,
      isNumeric,
      getStatusLabel,
      getStatusType,
      handleSortChange,
      handlePageChange,
      isNumericColumn
    };
  }
};
</script>

<style scoped lang="scss">
.ai-data-table {
  background-color: var(--el-bg-color, var(--bg-card, var(--bg-white)));
  border-radius: var(--spacing-sm);
  margin-bottom: var(--text-lg);
  width: 100%;
  color: var(--el-text-color-primary, var(--text-primary, var(--text-primary)));
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg);
  border-bottom: var(--border-width-base) solid var(--el-border-color-light, var(--border-color, var(--shadow-light)));

  h3 {
    margin: 0;
    font-weight: 600;
    color: var(--el-text-color-primary, var(--text-primary, var(--text-primary)));
    font-size: var(--text-lg);
  }
}

.table-toolbar {
  display: flex;
  gap: var(--text-sm);
  align-items: center;
}

.table-container {
  padding: 0 var(--text-lg) var(--text-lg);
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--text-sm) var(--text-lg);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter, var(--border-color, var(--shadow-light)));
  background-color: var(--el-bg-color, var(--bg-card, var(--bg-white)));
}

/* Element Plus表格样式覆盖 */
:deep(.el-table) {
  font-size: var(--text-base);
  
  .el-table__header th {
    background-color: var(--el-fill-color-light, var(--bg-container));
    font-weight: 600;
  }
  
  .el-table__row:hover > td {
    background-color: var(--el-fill-color-lighter, var(--bg-page));
  }
}

/* 深色模式适配 - 使用统一的CSS变量系统 */
</style> 