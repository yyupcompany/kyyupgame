/**
 * 中心化工作台通用组件库
 * 
 * 这个组件库为8个核心中心提供统一的UI组件，确保界面一致性和开发效率
 */

// Note: CenterContainer is replaced by UnifiedCenterLayout.vue
// import CenterContainer from './CenterContainer.vue'
import UnifiedCenterLayout from '../layout/UnifiedCenterLayout.vue'
import TabContainer from './TabContainer.vue'
import DataTable from './DataTable.vue'
import DetailPanel from './DetailPanel.vue'
import FormModal from './FormModal.vue'
import StatCard from './StatCard.vue'
import ChartContainer from './ChartContainer.vue'
import ActionToolbar from './ActionToolbar.vue'

// 组件类型定义
export interface CenterComponent {
  name: string
  component: any
  description: string
  props?: Record<string, any>
}

// 组件注册表
export const centerComponents: CenterComponent[] = [
  // Note: CenterContainer is replaced by UnifiedCenterLayout.vue
  // {
  //   name: 'CenterContainer',
  //   component: CenterContainer,
  //   description: '中心容器组件 - 提供统一的中心页面布局，包含标题栏、标签页导航、内容区域'
  // },
  {
    name: 'TabContainer',
    component: TabContainer,
    description: '标签页容器组件 - 管理标签页切换和内容显示，支持URL同步和过渡动画'
  },
  {
    name: 'DataTable',
    component: DataTable,
    description: '数据表格组件 - 统一的列表展示和操作，包含搜索、筛选、分页、批量操作'
  },
  {
    name: 'DetailPanel',
    component: DetailPanel,
    description: '详情面板组件 - 统一的详情信息展示，支持查看和编辑模式切换'
  },
  {
    name: 'FormModal',
    component: FormModal,
    description: '表单弹窗组件 - 统一的表单操作界面，支持多种字段类型和验证'
  },
  {
    name: 'StatCard',
    component: StatCard,
    description: '统计卡片组件 - 数据统计展示，支持趋势指示器和多种样式'
  },
  {
    name: 'ChartContainer',
    component: ChartContainer,
    description: '图表容器组件 - 统一的图表展示，基于ECharts，支持加载状态和工具栏'
  },
  {
    name: 'ActionToolbar',
    component: ActionToolbar,
    description: '操作工具栏组件 - 统一的操作按钮组，支持搜索、筛选、批量操作'
  }
]

// 导出所有组件
export {
  // Note: CenterContainer is replaced by UnifiedCenterLayout.vue
  // CenterContainer,
  UnifiedCenterLayout,
  TabContainer,
  DataTable,
  DetailPanel,
  FormModal,
  StatCard,
  ChartContainer,
  ActionToolbar
}

// 组件安装函数
export function installCenterComponents(app: any) {
  centerComponents.forEach(({ name, component }) => {
    app.component(name, component)
  })
}

// 默认导出
export default {
  install: installCenterComponents,
  components: centerComponents
}

// 组件使用示例和文档
export const componentExamples = {
  // Note: CenterContainer is replaced by UnifiedCenterLayout.vue
  // CenterContainer: {
  //   basic: `
  // <CenterContainer
  //   title="招生中心"
  //   :tabs="[
  //     { key: 'plans', label: '计划管理' },
  //     { key: 'applications', label: '申请管理' }
  //   ]"
  //   @create="handleCreate"
  //   @tab-change="handleTabChange"
  // >
  //   <template #tab-plans>
  //     <div>计划管理内容</div>
  //   </template>
  //   <template #tab-applications>
  //     <div>申请管理内容</div>
  //   </template>
  // </CenterContainer>
  //   `,
  //   props: {
  //     title: 'string - 中心标题',
  //     tabs: 'Tab[] - 标签页配置',
  //     defaultTab: 'string - 默认激活标签页',
  //     loading: 'boolean - 加载状态'
  //   }
  // },

  DataTable: {
    basic: `
<DataTable
  :data="tableData"
  :columns="columns"
  :loading="loading"
  :total="total"
  @create="handleCreate"
  @edit="handleEdit"
  @delete="handleDelete"
  @search="handleSearch"
>
  <template #column-status="{ value }">
    <el-tag :type="getStatusType(value)">{{ value }}</el-tag>
  </template>
</DataTable>
    `,
    props: {
      data: 'any[] - 表格数据',
      columns: 'Column[] - 列配置',
      loading: 'boolean - 加载状态',
      total: 'number - 总数据量',
      selectable: 'boolean - 是否可选择'
    }
  },

  StatCard: {
    basic: `
<StatCard
  title="总学生数"
  :value="1234"
  unit="人"
  description="本月新增 56 人"
  icon="User"
  type="primary"
  :trend="12.5"
  trend-text="较上月"
  @click="handleCardClick"
/>
    `,
    props: {
      title: 'string - 卡片标题',
      value: 'number|string - 数值',
      unit: 'string - 单位',
      icon: 'string - 图标',
      trend: 'number - 趋势百分比',
      type: 'string - 卡片类型'
    }
  },

  ChartContainer: {
    basic: `
<ChartContainer
  title="招生趋势"
  subtitle="最近6个月"
  :options="chartOptions"
  :loading="chartLoading"
  height="400px"
  @refresh="refreshChart"
  @chart-click="handleChartClick"
/>
    `,
    props: {
      title: 'string - 图表标题',
      options: 'object - ECharts配置',
      loading: 'boolean - 加载状态',
      height: 'string - 图表高度',
      showTools: 'boolean - 显示工具栏'
    }
  }
}

// 最佳实践指南
export const bestPractices = {
  layout: {
    title: '布局最佳实践',
    rules: [
      '使用 UnifiedCenterLayout 作为页面根容器',
      '标签页内容使用 TabContainer 管理',
      '列表页面使用 DataTable + DetailPanel 左右分栏布局',
      '统计数据使用 StatCard 网格布局',
      '图表使用 ChartContainer 统一样式'
    ]
  },
  
  responsive: {
    title: '响应式设计',
    rules: [
      '所有组件支持桌面端、平板、手机三种尺寸',
      '移动端自动调整布局为垂直排列',
      '表格在移动端支持横向滚动',
      '图表在小屏幕下自动调整大小'
    ]
  },
  
  performance: {
    title: '性能优化',
    rules: [
      '大数据量表格使用虚拟滚动',
      '图表使用懒加载和按需渲染',
      '组件支持按需导入',
      '合理使用 loading 状态避免白屏'
    ]
  },
  
  accessibility: {
    title: '无障碍访问',
    rules: [
      '所有交互元素支持键盘导航',
      '提供合适的 ARIA 标签',
      '颜色对比度符合 WCAG 标准',
      '支持屏幕阅读器'
    ]
  }
}

// 组件测试工具
export const testUtils = {
  /**
   * 创建测试用的表格数据
   */
  createTableData: (count: number = 10) => {
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `测试数据 ${index + 1}`,
      status: ['active', 'inactive', 'pending'][index % 3],
      createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 1000)
    }))
  },

  /**
   * 创建测试用的图表配置
   */
  createChartOptions: (type: 'line' | 'bar' | 'pie' = 'line') => {
    const baseData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
    
    if (type === 'pie') {
      return {
        series: [{
          type: 'pie',
          data: baseData.map((value, index) => ({
            name: `类别${index + 1}`,
            value
          }))
        }]
      }
    }
    
    return {
      xAxis: {
        type: 'category',
        data: Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        type,
        data: baseData
      }]
    }
  },

  /**
   * 创建测试用的统计卡片数据
   */
  createStatCards: () => [
    {
      title: '总用户数',
      value: 1234,
      unit: '人',
      trend: 12.5,
      type: 'primary',
      icon: 'User'
    },
    {
      title: '活跃用户',
      value: 856,
      unit: '人', 
      trend: -3.2,
      type: 'success',
      icon: 'UserFilled'
    },
    {
      title: '新增用户',
      value: 45,
      unit: '人',
      trend: 8.7,
      type: 'warning',
      icon: 'Plus'
    },
    {
      title: '转化率',
      value: 68.5,
      unit: '%',
      trend: 0,
      type: 'info',
      icon: 'TrendCharts'
    }
  ]
}
