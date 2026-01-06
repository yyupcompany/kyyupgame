# StatCard 组件使用指南

## 概述

StatCard 是一个用于显示统计数据的卡片组件，具有丰富的动画效果和交互功能。它是系统中所有数据展示卡片的标准组件。

## 基础用法

### 简单统计卡片

```vue
<template>
  <StatCard
    title="在校学生"
    :value="456"
    unit="人"
  />
</template>
```

### 带趋势的统计卡片

```vue
<template>
  <StatCard
    title="本月收入"
    :value="52000"
    unit="¥"
    trend="up"
    trend-text="12.5%"
    type="success"
  />
</template>
```

### 可点击的统计卡片

```vue
<template>
  <StatCard
    title="待处理任务"
    :value="23"
    unit="个"
    type="warning"
    icon-name="Task"
    clickable
    @click="handleTaskClick"
  />
</template>

<script setup>
const handleTaskClick = () => {
  // 处理点击事件
  console.log('跳转到任务详情页')
}
</script>
```

## 属性说明

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `title` | `string` | `''` | 卡片标题 |
| `value` | `string \| number` | `''` | 显示的数值 |
| `unit` | `string` | `''` | 数值单位 |
| `trend` | `'up' \| 'down' \| 'stable'` | `'stable'` | 趋势方向 |
| `trendText` | `string` | `''` | 趋势描述文本 |
| `type` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | 卡片类型 |
| `iconName` | `string` | `''` | 图标名称 |
| `clickable` | `boolean` | `false` | 是否可点击 |
| `loading` | `boolean` | `false` | 是否显示加载状态 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 卡片尺寸 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `click` | `Event` | 卡片点击事件（仅在 `clickable` 为 `true` 时触发） |

## 卡片类型

### Primary (主要)
```vue
<StatCard
  title="系统健康度"
  :value="98"
  unit="%"
  type="primary"
  icon-name="Shield"
/>
```
- 用于：系统状态、主要指标
- 颜色：蓝色渐变
- 场景：仪表板核心数据

### Success (成功)
```vue
<StatCard
  title="完成率"
  :value="87"
  unit="%"
  type="success"
  trend="up"
  trend-text="5.2%"
/>
```
- 用于：成功率、完成度、正向指标
- 颜色：绿色渐变
- 场景：任务完成、收入增长

### Warning (警告)
```vue
<StatCard
  title="待处理"
  :value="12"
  unit="项"
  type="warning"
  icon-name="Warning"
/>
```
- 用于：需要注意的指标、中等优先级
- 颜色：橙色渐变
- 场景：待办事项、中等风险

### Danger (危险)
```vue
<StatCard
  title="逾期任务"
  :value="3"
  unit="个"
  type="danger"
  trend="down"
  trend-text="减少2个"
/>
```
- 用于：错误、失败、高风险指标
- 颜色：红色渐变
- 场景：错误统计、逾期项目

### Info (信息)
```vue
<StatCard
  title="在线用户"
  :value="156"
  unit="人"
  type="info"
  icon-name="Users"
/>
```
- 用于：一般信息、中性指标
- 颜色：蓝色渐变
- 场景：用户统计、一般数据

## 尺寸规格

### Small (小尺寸)
```vue
<StatCard
  title="快速统计"
  :value="42"
  size="small"
/>
```
- 适用场景：侧边栏、紧凑布局
- 尺寸：较小的内边距和字体

### Medium (中等尺寸) - 默认
```vue
<StatCard
  title="标准统计"
  :value="123"
  size="medium"
/>
```
- 适用场景：主要内容区域
- 尺寸：标准的内边距和字体

### Large (大尺寸)
```vue
<StatCard
  title="重要指标"
  :value="999"
  size="large"
/>
```
- 适用场景：重点展示、首页关键数据
- 尺寸：较大的内边距和字体

## 图标使用

### 内置图标
组件支持 Element Plus 的所有图标：

```vue
<StatCard
  title="用户数量"
  :value="1234"
  icon-name="User"
/>

<StatCard
  title="订单统计"
  :value="567"
  icon-name="ShoppingCart"
/>

<StatCard
  title="收入统计"
  :value="89000"
  unit="¥"
  icon-name="Money"
/>
```

### 常用图标推荐

| 场景 | 推荐图标 | 图标名称 |
|------|----------|----------|
| 用户/人员 | 👤 | `User`, `Users`, `UserFilled` |
| 任务/待办 | ✅ | `Task`, `Check`, `List` |
| 收入/财务 | 💰 | `Money`, `Coin`, `CreditCard` |
| 活动/事件 | 📅 | `Calendar`, `Clock`, `Bell` |
| 系统/设置 | ⚙️ | `Setting`, `Tools`, `Gear` |
| 统计/分析 | 📊 | `DataAnalysis`, `TrendCharts`, `PieChart` |

## 趋势指示器

### 上升趋势
```vue
<StatCard
  title="月度增长"
  :value="15.8"
  unit="%"
  trend="up"
  trend-text="较上月"
  type="success"
/>
```

### 下降趋势
```vue
<StatCard
  title="错误率"
  :value="2.1"
  unit="%"
  trend="down"
  trend-text="较上周"
  type="success"
/>
```

### 稳定趋势
```vue
<StatCard
  title="系统负载"
  :value="45"
  unit="%"
  trend="stable"
  trend-text="保持稳定"
  type="info"
/>
```

## 加载状态

```vue
<template>
  <StatCard
    title="数据加载中"
    :value="loadingValue"
    :loading="isLoading"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isLoading = ref(true)
const loadingValue = ref(0)

onMounted(async () => {
  try {
    // 模拟数据加载
    const data = await fetchData()
    loadingValue.value = data.value
  } finally {
    isLoading.value = false
  }
})
</script>
```

## 网格布局

### 统一网格系统
```vue
<template>
  <div class="stats-grid-unified">
    <StatCard
      title="指标1"
      :value="123"
      type="primary"
    />
    <StatCard
      title="指标2"
      :value="456"
      type="success"
    />
    <StatCard
      title="指标3"
      :value="789"
      type="warning"
    />
    <StatCard
      title="指标4"
      :value="101"
      type="info"
    />
  </div>
</template>

<style scoped>
.stats-grid-unified {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .stats-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>
```

## 最佳实践

### 1. 数据格式化
```vue
<script setup>
import { computed } from 'vue'

const rawValue = ref(1234567)

// 格式化大数字
const formattedValue = computed(() => {
  if (rawValue.value >= 1000000) {
    return (rawValue.value / 1000000).toFixed(1) + 'M'
  } else if (rawValue.value >= 1000) {
    return (rawValue.value / 1000).toFixed(1) + 'K'
  }
  return rawValue.value.toString()
})
</script>

<template>
  <StatCard
    title="用户总数"
    :value="formattedValue"
    unit="人"
  />
</template>
```

### 2. 响应式设计
```vue
<template>
  <div class="responsive-stats">
    <StatCard
      v-for="stat in stats"
      :key="stat.id"
      :title="stat.title"
      :value="stat.value"
      :type="stat.type"
      :size="cardSize"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

const { isMobile, isTablet } = useBreakpoints()

const cardSize = computed(() => {
  if (isMobile.value) return 'small'
  if (isTablet.value) return 'medium'
  return 'large'
})
</script>
```

### 3. 错误处理
```vue
<template>
  <StatCard
    :title="stat.title"
    :value="displayValue"
    :loading="isLoading"
    :type="hasError ? 'danger' : 'primary'"
  />
</template>

<script setup>
const displayValue = computed(() => {
  if (hasError.value) return '--'
  if (isLoading.value) return '...'
  return stat.value
})
</script>
```

## 注意事项

1. **性能优化**：避免在短时间内频繁更新数值，使用防抖或节流
2. **可访问性**：确保卡片有适当的 ARIA 标签和键盘导航支持
3. **移动端**：在移动设备上，hover 效果会自动禁用
4. **数据精度**：注意数值的精度和格式化，避免显示过长的小数
5. **颜色使用**：根据数据的语义选择合适的卡片类型和颜色

---

**版本**: 1.0.0  
**最后更新**: 2025-09-08
