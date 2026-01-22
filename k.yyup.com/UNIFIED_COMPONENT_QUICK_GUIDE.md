# 统一组件库快速参考指南

## 📚 组件库位置

```
/client/src/components/centers/
├── index.ts                    # 统一导出
├── DataTable.vue              # 数据表格
├── StatCard.vue               # 统计卡片
├── ChartContainer.vue         # 图表容器
├── DetailPanel.vue            # 详情面板
├── FormModal.vue              # 表单弹窗
├── ActionToolbar.vue          # 操作工具栏
├── TabContainer.vue           # 标签页容器
└── activity/                  # 活动专用组件
```

## 🚀 快速开始

### 1. 导入组件

```typescript
import {
  DataTable,
  StatCard,
  ChartContainer,
  DetailPanel,
  FormModal,
  ActionToolbar,
  TabContainer
} from '@/components/centers'
```

### 2. DataTable - 数据表格

#### 基础用法
```vue
<template>
  <DataTable
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :total="total"
    :current-page="page"
    :page-size="pageSize"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DataTable } from '@/components/centers'

const tableData = ref([
  { id: 1, name: '张三', status: 'active' },
  { id: 2, name: '李四', status: 'inactive' }
])

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'status', label: '状态', width: 100 }
]

const loading = ref(false)
const total = ref(2)
const page = ref(1)
const pageSize = ref(10)

const handleEdit = (row: any) => {
  console.log('编辑:', row)
}

const handleDelete = (row: any) => {
  console.log('删除:', row)
}
</script>
```

#### 自定义列插槽
```vue
<DataTable :data="data" :columns="columns">
  <!-- 自定义状态列 -->
  <template #column-status="{ row }">
    <el-tag :type="getStatusType(row.status)">
      {{ getStatusText(row.status) }}
    </el-tag>
  </template>

  <!-- 自定义操作列 -->
  <template #column-actions="{ row }">
    <el-button @click="handleEdit(row)">编辑</el-button>
    <el-button @click="handleDelete(row)">删除</el-button>
  </template>
</DataTable>
```

#### 列配置类型
```typescript
interface Column {
  prop: string                    // 字段名
  label: string                   // 列标题
  width?: string | number         // 固定宽度
  minWidth?: string | number      // 最小宽度
  fixed?: boolean | string        // 固定列
  sortable?: boolean | string     // 可排序
  align?: 'left' | 'center' | 'right'  // 对齐方式
  type?: 'text' | 'tag' | 'date' | 'actions'  // 列类型
  format?: string                 // 日期格式
  showOverflowTooltip?: boolean   // 显示溢出提示
  tagMap?: Record<string, string> // 标签类型映射
  formatter?: (value: any, row: any) => string  // 格式化函数
}
```

### 3. StatCard - 统计卡片

#### 基础用法
```vue
<template>
  <StatCard
    title="总用户数"
    :value="1234"
    unit="人"
    icon-name="User"
    type="primary"
    :trend="12.5"
    trend-text="较上月"
    clickable
    @click="handleCardClick"
  />
</template>

<script setup lang="ts">
import { StatCard } from '@/components/centers'

const handleCardClick = () => {
  console.log('卡片被点击')
}
</script>
```

#### Props 说明
```typescript
interface StatCardProps {
  title: string                  // 卡片标题
  value: number | string         // 数值
  unit?: string                  // 单位
  description?: string           // 描述
  icon?: string                  // 图标（已废弃，使用 iconName）
  iconName?: string              // 图标名称（使用 UnifiedIcon）
  iconVariant?: 'default' | 'filled' | 'outlined' | 'rounded'
  iconColor?: string             // 图标颜色
  iconSize?: number              // 图标大小
  trend?: number | 'up' | 'down' | 'stable'  // 趋势
  trendText?: string             // 趋势文本
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'default' | 'large'
  loading?: boolean              // 加载状态
  clickable?: boolean            // 可点击
  badge?: number | string        // 角标
  badgeMax?: number              // 角标最大值
  precision?: number             // 小数位数
  formatter?: (value: number | string) => string  // 格式化函数
}
```

#### 卡片类型
- `default` - 默认样式
- `primary` - 主要色（蓝色）
- `success` - 成功色（绿色）
- `warning` - 警告色（橙色）
- `danger` - 危险色（红色）
- `info` - 信息色（青色）

### 4. ChartContainer - 图表容器

#### 基础用法
```vue
<template>
  <ChartContainer
    title="招生趋势"
    subtitle="最近6个月"
    :options="chartOptions"
    :loading="loading"
    height="400px"
    @refresh="refreshChart"
    @chart-click="handleChartClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChartContainer } from '@/components/centers'
import * as echarts from 'echarts'

const loading = ref(false)

const chartOptions = ref({
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [120, 200, 150, 80, 70, 110],
    type: 'line'
  }]
})

const refreshChart = () => {
  console.log('刷新图表')
}

const handleChartClick = (params: any) => {
  console.log('图表点击:', params)
}
</script>
```

### 5. 其他组件

#### DetailPanel - 详情面板
```vue
<DetailPanel
  :item="selectedItem"
  @action="handleAction"
/>
```

#### FormModal - 表单弹窗
```vue
<FormModal
  v-model="visible"
  :title="formTitle"
  :fields="formFields"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

#### ActionToolbar - 操作工具栏
```vue
<ActionToolbar
  :primary-actions="primaryActions"
  :secondary-actions="secondaryActions"
  @action-click="handleActionClick"
/>
```

#### TabContainer - 标签页容器
```vue
<TabContainer
  v-model="activeTab"
  :tabs="tabs"
  @tab-change="handleTabChange"
>
  <template #tab-tab1>
    <!-- 标签页1内容 -->
  </template>
  <template #tab-tab2>
    <!-- 标签页2内容 -->
  </template>
</TabContainer>
```

## 🎨 设计令牌

### 颜色
```scss
// 主色系
--primary-color: #667eea;
--primary-hover: #5a67d8;
--primary-light: #a3bffa;

// 语义色
--success-color: #10b981;
--warning-color: #f59e0b;
--danger-color: #ef4444;
--info-color: #3b82f6;

// 文本色
--text-primary: #1f2937;
--text-secondary: #6b7280;
--text-muted: #9ca3af;
--text-disabled: #d1d5db;

// 背景色
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
--bg-card: #ffffff;

// 边框色
--border-color: #e5e7eb;
--border-focus: #667eea;
```

### 间距
```scss
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
--spacing-3xl: 32px;
```

### 圆角
```scss
--radius-xs: 2px;
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
```

### 阴影
```scss
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## 💡 最佳实践

### 1. 列配置复用
```typescript
// constants/columns.ts
export const USER_COLUMNS = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'email', label: '邮箱', minWidth: 180 }
]

// 在组件中使用
import { USER_COLUMNS } from '@/constants/columns'

const columns = ref([...USER_COLUMNS])
```

### 2. 类型安全
```typescript
interface TableRow {
  id: number
  name: string
  status: 'active' | 'inactive'
}

const tableData = ref<TableRow[]>([])
```

### 3. 响应式设计
```scss
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

### 4. 暗黑模式适配
```scss
.my-component {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  html.dark & {
    background: var(--bg-card);
    color: var(--text-primary);
    border-color: var(--border-color);
  }
}
```

## 🔧 常见问题

### Q: 如何自定义表格列渲染？
A: 使用 `<template #column-{prop}>` 插槽：
```vue
<template #column-status="{ row }">
  <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
    {{ row.status }}
  </el-tag>
</template>
```

### Q: 如何实现表格行选择？
A: 设置 `selectable` prop 并监听事件：
```vue
<DataTable
  :selectable="true"
  @selection-change="handleSelectionChange"
/>
```

### Q: 如何自定义卡片图标？
A: 使用 `iconName` prop 和 UnifiedIcon：
```vue
<StatCard
  iconName="User"
  :icon-size="32"
  icon-variant="filled"
/>
```

### Q: 如何实现响应式布局？
A: 使用 CSS Grid 和媒体查询：
```vue
<div class="stats-grid">
  <StatCard v-for="stat in stats" :key="stat.key" v-bind="stat" />
</div>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}
</style>
```

## 📚 更多资源

- **完整组件文档**: `/client/src/components/centers/index.ts`
- **设计令牌**: `/client/src/styles/design-tokens.scss`
- **示例页面**: `/client/src/pages/centers/TaskCenter.vue`
- **类型定义**: `/client/src/components/centers/DataTable.vue`

---

**最后更新**: 2026-01-10
**维护者**: 开发团队
**版本**: 1.0.0
