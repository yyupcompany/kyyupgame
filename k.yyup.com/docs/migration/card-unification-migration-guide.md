# 卡片统一化迁移指南

## 概述

本指南帮助开发者将现有的自定义卡片组件迁移到统一的卡片系统，确保整个应用的视觉一致性和代码可维护性。

## 迁移概览

### 迁移前后对比

**迁移前：**
- 各中心页面使用不同的卡片实现
- 样式不一致，维护困难
- 动画效果各异
- 响应式支持不完整

**迁移后：**
- 统一使用 StatCard 和 ActionCard 组件
- 一致的视觉效果和动画
- 完整的响应式支持
- 性能优化的动画效果

## 迁移步骤

### 第一步：识别现有卡片类型

#### 1. 统计类卡片
```vue
<!-- 迁移前 -->
<div class="stat-card">
  <div class="stat-icon">
    <el-icon><User /></el-icon>
  </div>
  <div class="stat-content">
    <div class="stat-value">456</div>
    <div class="stat-label">在校学生</div>
  </div>
</div>

<!-- 迁移后 -->
<StatCard
  title="在校学生"
  :value="456"
  unit="人"
  type="primary"
  icon-name="User"
/>
```

#### 2. 操作类卡片
```vue
<!-- 迁移前 -->
<div class="action-card" @click="handleAction">
  <div class="action-icon">
    <el-icon><Plus /></el-icon>
  </div>
  <div class="action-content">
    <h4>新建活动</h4>
    <p>创建新的活动计划</p>
  </div>
</div>

<!-- 迁移后 -->
<ActionCard
  title="新建活动"
  description="创建新的活动计划"
  icon-name="Plus"
  @click="handleAction"
/>
```

### 第二步：更新组件导入

```vue
<script setup>
// 添加新的组件导入
import StatCard from '@/components/centers/StatCard.vue'
import ActionCard from '@/components/centers/ActionCard.vue'

// 移除旧的自定义卡片组件导入
// import CustomStatCard from './CustomStatCard.vue' // 删除
</script>
```

### 第三步：更新网格布局

#### 统计卡片网格
```vue
<!-- 迁移前 -->
<div class="stats-grid">
  <!-- 自定义网格样式 -->
</div>

<!-- 迁移后 -->
<div class="stats-grid-unified">
  <!-- 使用统一网格系统 -->
</div>
```

#### 操作卡片网格
```vue
<!-- 迁移前 -->
<div class="actions-grid">
  <!-- 自定义网格样式 -->
</div>

<!-- 迁移后 -->
<div class="actions-grid-unified">
  <!-- 使用统一网格系统 -->
</div>
```

### 第四步：移除旧样式

```scss
// 删除这些自定义样式
.stat-card {
  // 删除自定义卡片样式
}

.action-card {
  // 删除自定义操作卡片样式
}

.stats-grid {
  // 删除自定义网格样式
}
```

## 具体迁移示例

### 人事中心迁移示例

#### 迁移前
```vue
<template>
  <div class="personnel-stats">
    <div class="stat-card" @click="viewStudents">
      <div class="stat-icon student-icon">
        <el-icon><User /></el-icon>
      </div>
      <div class="stat-content">
        <div class="stat-value">456</div>
        <div class="stat-label">在校学生</div>
        <div class="stat-trend">
          <span class="trend-up">↑ 12.0%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.personnel-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}
</style>
```

#### 迁移后
```vue
<template>
  <div class="stats-grid-unified">
    <StatCard
      title="在校学生"
      :value="456"
      unit="人"
      trend="up"
      trend-text="12.0%"
      type="primary"
      icon-name="User"
      clickable
      @click="viewStudents"
    />
  </div>
</template>

<script setup>
import StatCard from '@/components/centers/StatCard.vue'

const viewStudents = () => {
  // 处理点击事件
}
</script>
```

### 财务中心迁移示例

#### 迁移前
```vue
<template>
  <div class="finance-overview">
    <div class="revenue-card">
      <div class="card-header">
        <h3>本月收入</h3>
        <div class="amount">¥52,000</div>
      </div>
      <div class="card-footer">
        <span class="growth">+12.5%</span>
      </div>
    </div>
  </div>
</template>
```

#### 迁移后
```vue
<template>
  <div class="stats-grid-unified">
    <StatCard
      title="本月收入"
      :value="52000"
      unit="¥"
      trend="up"
      trend-text="12.5%"
      type="success"
      icon-name="Money"
    />
  </div>
</template>
```

## 数据适配

### 数值格式化
```javascript
// 迁移前：手动格式化
const formatCurrency = (value) => {
  return `¥${value.toLocaleString()}`
}

// 迁移后：使用组件内置格式化
const currencyValue = 52000 // 直接传入数值
const currencyUnit = '¥'    // 单位分离
```

### 趋势数据适配
```javascript
// 迁移前：自定义趋势显示
const trendDisplay = computed(() => {
  if (trend.value > 0) return `↑ ${trend.value}%`
  if (trend.value < 0) return `↓ ${Math.abs(trend.value)}%`
  return '→ 持平'
})

// 迁移后：使用标准趋势属性
const trendDirection = computed(() => {
  if (trend.value > 0) return 'up'
  if (trend.value < 0) return 'down'
  return 'stable'
})

const trendText = computed(() => {
  return `${Math.abs(trend.value)}%`
})
```

## 样式迁移

### CSS 类名映射

| 旧类名 | 新类名 | 说明 |
|--------|--------|------|
| `.stats-grid` | `.stats-grid-unified` | 统计卡片网格 |
| `.actions-grid` | `.actions-grid-unified` | 操作卡片网格 |
| `.charts-grid` | `.charts-grid-unified` | 图表网格 |
| `.overview-grid` | `.center-overview-grid-unified` | 概览网格 |

### 自定义样式保留

如果需要保留特定的自定义样式，可以通过以下方式：

```vue
<template>
  <StatCard
    class="custom-stat-card"
    title="特殊指标"
    :value="123"
  />
</template>

<style scoped>
.custom-stat-card {
  /* 在统一样式基础上添加自定义样式 */
  border: 2px solid var(--primary-color);
}
</style>
```

## 常见问题解决

### 1. 图标不显示
```vue
<!-- 问题：使用了不存在的图标名 -->
<StatCard icon-name="NonExistentIcon" />

<!-- 解决：使用 Element Plus 支持的图标 -->
<StatCard icon-name="User" />
```

### 2. 点击事件不触发
```vue
<!-- 问题：忘记设置 clickable 属性 -->
<StatCard @click="handleClick" />

<!-- 解决：添加 clickable 属性 -->
<StatCard clickable @click="handleClick" />
```

### 3. 样式不一致
```vue
<!-- 问题：混用旧的自定义样式 -->
<div class="old-stat-card">
  <StatCard />
</div>

<!-- 解决：移除旧样式，使用统一网格 -->
<div class="stats-grid-unified">
  <StatCard />
</div>
```

### 4. 响应式问题
```scss
/* 问题：自定义响应式样式冲突 */
@media (max-width: 768px) {
  .custom-grid {
    grid-template-columns: 1fr 1fr; /* 可能导致布局问题 */
  }
}

/* 解决：使用统一的响应式网格 */
.stats-grid-unified {
  /* 自动处理响应式布局 */
}
```

## 测试检查清单

### 功能测试
- [ ] 所有卡片正确显示数据
- [ ] 点击事件正常触发
- [ ] 趋势指示器显示正确
- [ ] 加载状态正常工作

### 视觉测试
- [ ] 卡片样式一致
- [ ] 动画效果流畅
- [ ] 颜色主题正确应用
- [ ] 图标显示正常

### 响应式测试
- [ ] 桌面端布局正常
- [ ] 平板端适配良好
- [ ] 移动端显示正确
- [ ] 动画在移动端正确禁用

### 性能测试
- [ ] 页面加载速度正常
- [ ] 动画性能良好
- [ ] 内存使用合理
- [ ] 无明显的重绘问题

## 迁移后维护

### 1. 代码审查要点
- 确保所有自定义卡片都已迁移
- 检查是否有遗留的旧样式
- 验证响应式布局的正确性
- 确认动画效果的一致性

### 2. 性能监控
- 监控页面加载时间
- 检查动画帧率
- 观察内存使用情况
- 测试不同设备的表现

### 3. 用户反馈收集
- 收集用户对新界面的反馈
- 监控用户交互行为
- 及时修复发现的问题
- 持续优化用户体验

---

**版本**: 1.0.0  
**最后更新**: 2025-09-08  
**适用范围**: 全系统卡片组件迁移
