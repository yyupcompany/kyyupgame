/**
 * UI渲染指南模板
 * 指导AI如何使用render_component工具渲染UI组件
 */

export const uiRenderingGuideTemplate = {
  name: 'ui_rendering_guide',
  description: 'UI组件渲染指南 - 如何正确使用render_component',
  variables: [],
  
  template: `## 🎨 UI组件渲染工具使用指南

### 工具名称
render_component（渲染UI组件）

### 支持的组件类型

根据数据类型选择合适的组件：

1. **data-table（数据表格）**
   - 适用于：列表数据、多条记录、详细信息
   - 示例：学生列表、教师信息、班级数据

2. **chart（图表）**
   - 适用于：统计数据、趋势分析、数据对比
   - 图表类型：bar（柱状图）、line（折线图）、pie（饼图）、area（面积图）
   - 示例：学生人数统计、月度活动趋势

3. **stat-card（统计卡片）**
   - 适用于：关键指标、单个数值、快速概览
   - 示例：总学生数、教师数量、本月活动数

4. **todo-list（待办列表）**
   - 适用于：任务清单、待办事项
   - 示例：本周任务、待处理事项

### 参数说明

\`\`\`json
{
  "name": "render_component",
  "arguments": {
    "component_type": "data-table | chart | stat-card | todo-list",
    "title": "组件标题",
    "data": [数据数组],
    "chart_type": "bar | line | pie | area (仅chart类型需要)"
  }
}
\`\`\`

### 使用示例

**示例1：数据表格（data-table）**
适用于：多条记录的列表数据
\`\`\`json
{
  "name": "render_component",
  "arguments": {
    "component_type": "data-table",
    "title": "学生列表",
    "data": [
      {"name": "张三", "age": 5, "class": "大班"},
      {"name": "李四", "age": 6, "class": "中班"},
      {"name": "王五", "age": 4, "class": "小班"}
    ]
  }
}
\`\`\`

**示例2：柱状图（chart + bar）**
适用于：数值对比、分类统计
\`\`\`json
{
  "name": "render_component",
  "arguments": {
    "component_type": "chart",
    "chart_type": "bar",
    "title": "各班级人数统计",
    "data": [
      {"label": "大班", "value": 30},
      {"label": "中班", "value": 25},
      {"label": "小班", "value": 20}
    ]
  }
}
\`\`\`

**示例3：折线图（chart + line）**
适用于：趋势变化、时间序列
\`\`\`json
{
  "name": "render_component",
  "arguments": {
    "component_type": "chart",
    "chart_type": "line",
    "title": "月度招生趋势",
    "data": [
      {"label": "1月", "value": 10},
      {"label": "2月", "value": 15},
      {"label": "3月", "value": 20}
    ]
  }
}
\`\`\`

**示例4：饼图（chart + pie）**
适用于：占比分布、比例展示
\`\`\`json
{
  "name": "render_component",
  "arguments": {
    "component_type": "chart",
    "chart_type": "pie",
    "title": "学生性别分布",
    "data": [
      {"label": "男生", "value": 70},
      {"label": "女生", "value": 61}
    ]
  }
}
\`\`\`

**示例5：统计卡片（stat-card）**
适用于：单个关键指标
\`\`\`json
{
  "name": "render_component",
  "arguments": {
    "component_type": "stat-card",
    "title": "在读学生总数",
    "data": [
      {"value": 131, "label": "在读学生"}
    ]
  }
}
\`\`\`

**示例6：待办列表（todo-list）**
适用于：任务清单、待办事项
\`\`\`json
{
  "name": "render_component",
  "arguments": {
    "component_type": "todo-list",
    "title": "本周待办任务",
    "data": [
      {"text": "准备家长会资料", "completed": false},
      {"text": "审核教师考勤", "completed": true},
      {"text": "制定下月活动计划", "completed": false}
    ]
  }
}
\`\`\``
};

export default uiRenderingGuideTemplate;

