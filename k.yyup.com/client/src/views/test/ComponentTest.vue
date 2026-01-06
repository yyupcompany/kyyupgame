<template>
  <div class="component-test">
    <UnifiedCenterLayout 
      title="组件测试中心"
      :tabs="tabs"
      default-tab="table"
      @tab-change="handleTabChange"
    >
      <!-- 数据表格测试 -->
      <template #tab-table>
        <div class="test-section">
          <h3>DataTable 组件测试</h3>
          <DataTable
            :data="tableData"
            :columns="tableColumns"
            :loading="tableLoading"
            :total="100"
            @create="handleCreate"
            @edit="handleEdit"
            @delete="handleDelete"
            @search="handleSearch"
          >
            <template #column-status="{ value }">
              <el-tag :type="getStatusType(value)">{{ value }}</el-tag>
            </template>
          </DataTable>
        </div>
      </template>

      <!-- 统计卡片测试 -->
      <template #tab-stats>
        <div class="test-section">
          <h3>StatCard 组件测试</h3>
          <div class="stats-grid">
            <StatCard
              v-for="stat in statCards"
              :key="stat.title"
              :title="stat.title"
              :value="stat.value"
              :unit="stat.unit"
              :trend="stat.trend"
              :type="stat.type"
              :icon="stat.icon"
              clickable
              @click="handleStatClick(stat)"
            />
          </div>
        </div>
      </template>

      <!-- 图表测试 -->
      <template #tab-charts>
        <div class="test-section">
          <h3>ChartContainer 组件测试</h3>
          <div class="charts-grid">
            <ChartContainer
              title="线性图表"
              subtitle="测试数据"
              :options="lineChartOptions"
              :loading="chartLoading"
              height="300px"
              @refresh="refreshChart"
            />
            <ChartContainer
              title="柱状图表"
              subtitle="测试数据"
              :options="barChartOptions"
              :loading="chartLoading"
              height="300px"
              @refresh="refreshChart"
            />
          </div>
        </div>
      </template>

      <!-- 表单测试 -->
      <template #tab-forms>
        <div class="test-section">
          <h3>FormModal 组件测试</h3>
          <el-button type="primary" @click="showFormModal = true">
            打开表单弹窗
          </el-button>
          
          <FormModal
            v-model="showFormModal"
            title="测试表单"
            :fields="formFields"
            :data="formData"
            @confirm="handleFormConfirm"
            @cancel="handleFormCancel"
          />
        </div>
      </template>

      <!-- 详情面板测试 -->
      <template #tab-detail>
        <div class="test-section">
          <h3>DetailPanel 组件测试</h3>
          <div style="display: flex; gap: var(--spacing-xl); min-height: 60px; height: auto;">
            <div style="flex: 1;">
              <DataTable
                :data="tableData.slice(0, 5)"
                :columns="tableColumns.slice(0, 3)"
                :show-pagination="false"
                @row-click="handleRowClick"
              />
            </div>
            <div style="flex: 1;">
              <DetailPanel
                title="详情信息"
                :data="selectedRow"
                :sections="detailSections"
                editable
                @save="handleDetailSave"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 工具栏测试 -->
      <template #tab-toolbar>
        <div class="test-section">
          <h3>ActionToolbar 组件测试</h3>
          <ActionToolbar
            :primary-actions="primaryActions"
            :secondary-actions="secondaryActions"
            :batch-actions="batchActions"
            :more-actions="moreActions"
            :selection="selectedItems"
            searchable
            :filters="filters"
            :active-filters="activeFilters"
            sortable
            :sort-options="sortOptions"
            @action-click="handleActionClick"
            @search="handleToolbarSearch"
            @filter="handleFilter"
          />
          
          <div style="margin-top: var(--spacing-5xl);">
            <el-checkbox-group v-model="selectedItems">
              <el-checkbox 
                v-for="item in tableData.slice(0, 3)"
                :key="item.id"
                :label="item.id"
              >
                {{ item.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </template>
    </UnifiedCenterLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UnifiedCenterLayout,
  DataTable,
  StatCard,
  ChartContainer,
  FormModal,
  DetailPanel,
  ActionToolbar,
  testUtils
} from '@/components/centers'

// 标签页配置
const tabs = [
  { key: 'table', label: '数据表格' },
  { key: 'stats', label: '统计卡片' },
  { key: 'charts', label: '图表组件' },
  { key: 'forms', label: '表单弹窗' },
  { key: 'detail', label: '详情面板' },
  { key: 'toolbar', label: '操作工具栏' }
]

// 表格相关
const tableLoading = ref(false)
const tableData = ref(testUtils.createTableData(20))
const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', minWidth: 120 },
  { prop: 'status', label: '状态', width: 100, type: 'tag' },
  { prop: 'createTime', label: '创建时间', width: 180, type: 'date' },
  { prop: 'value', label: '数值', width: 100 },
  { prop: 'actions', label: '操作', width: 150, type: 'actions', fixed: 'right' }
]

// 统计卡片
const statCards = ref(testUtils.createStatCards())

// 图表相关
const chartLoading = ref(false)
const lineChartOptions = ref(testUtils.createChartOptions('line'))
const barChartOptions = ref(testUtils.createChartOptions('bar'))

// 表单相关
const showFormModal = ref(false)
const formData = ref({})
const formFields = [
  { prop: 'name', label: '名称', type: 'input', required: true, span: 12 },
  { prop: 'type', label: '类型', type: 'select', span: 12, options: [
    { label: '类型1', value: 'type1' },
    { label: '类型2', value: 'type2' }
  ]},
  { prop: 'description', label: '描述', type: 'textarea', span: 24 },
  { prop: 'date', label: '日期', type: 'date', span: 12 },
  { prop: 'enabled', label: '启用', type: 'switch', span: 12 }
]

// 详情面板相关
const selectedRow = ref(null)
const detailSections = [
  {
    title: '基本信息',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '名称' },
      { key: 'status', label: '状态' }
    ]
  },
  {
    title: '其他信息',
    fields: [
      { key: 'createTime', label: '创建时间', type: 'date' },
      { key: 'value', label: '数值' }
    ]
  }
]

// 工具栏相关
const selectedItems = ref([])
const activeFilters = ref([])
const primaryActions = [
  { key: 'create', label: '新建', type: 'primary', icon: 'Plus' }
]
const secondaryActions = [
  { key: 'export', label: '导出', icon: 'Download' }
]
const batchActions = [
  { key: 'batch-delete', label: '批量删除', type: 'danger', icon: 'Delete' }
]
const moreActions = [
  { key: 'import', label: '导入数据', icon: 'Upload' },
  { key: 'settings', label: '设置', icon: 'Setting', divided: true }
]
const filters = [
  { key: 'active', label: '活跃状态' },
  { key: 'recent', label: '最近创建' }
]
const sortOptions = [
  { key: 'name-asc', label: '名称升序' },
  { key: 'name-desc', label: '名称降序' },
  { key: 'time-desc', label: '时间降序' }
]

// 事件处理
const handleTabChange = (tabKey: string) => {
  console.log('Tab changed:', tabKey)
}

const handleCreate = () => {
  ElMessage.success('创建操作')
}

const handleEdit = (row: any) => {
  ElMessage.info(`编辑: ${row.name}`)
}

const handleDelete = (row: any) => {
  ElMessage.warning(`删除: ${row.name}`)
}

const handleSearch = (keyword: string) => {
  console.log('Search:', keyword)
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning'
  }
  return typeMap[status] || 'default'
}

const handleStatClick = (stat: any) => {
  ElMessage.info(`点击统计卡片: ${stat.title}`)
}

const refreshChart = () => {
  chartLoading.value = true
  setTimeout(() => {
    chartLoading.value = false
    ElMessage.success('图表刷新完成')
  }, 1000)
}

const handleFormConfirm = (data: any) => {
  console.log('Form data:', data)
  showFormModal.value = false
  ElMessage.success('表单提交成功')
}

const handleFormCancel = () => {
  showFormModal.value = false
}

const handleRowClick = (row: any) => {
  selectedRow.value = row
}

const handleDetailSave = (data: any) => {
  console.log('Detail save:', data)
  ElMessage.success('详情保存成功')
}

const handleActionClick = (action: any) => {
  ElMessage.info(`操作: ${action.label}`)
}

const handleToolbarSearch = (keyword: string) => {
  console.log('Toolbar search:', keyword)
}

const handleFilter = (filterKey: string, active: boolean) => {
  if (active) {
    activeFilters.value.push(filterKey)
  } else {
    const index = activeFilters.value.indexOf(filterKey)
    if (index > -1) {
      activeFilters.value.splice(index, 1)
    }
  }
}
</script>

<style scoped lang="scss">
.component-test {
  height: 100vh;
  padding: var(--spacing-5xl);
}

.test-section {
  padding: var(--spacing-5xl);

  h3 {
    margin-bottom: var(--spacing-5xl);
    color: #1f2329;
    font-size: var(--text-lg);
    font-weight: 600;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-5xl);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
}

@media (max-width: var(--breakpoint-md)) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
