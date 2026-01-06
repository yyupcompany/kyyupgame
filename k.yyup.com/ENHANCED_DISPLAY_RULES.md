# 🎯 增强版展示工具决策规则

## 📊 工具分类与一对一映射

### 🔍 生产工具（数据获取与处理）
**工具列表**: any_query, read_data_record, create_data_record, update_data_record, delete_data_record, analyze_task_complexity, batch_import_data

**使用场景**: 查询、创建、更新、删除数据记录，分析任务复杂度，批量导入数据

### 📊 展示工具（数据可视化与输出）
**工具列表**: render_component, generate_pdf_report, generate_word_document, generate_excel_report, generate_ppt_presentation, generate_html_preview

## 🎯 一对一明确映射规则

| 用户明确关键词 | 对应展示工具 | 标准调用流程 |
|----------------|--------------|--------------|
| **"图表显示"** | render_component | 1. 查询数据 → 2. 渲染图表 |
| **"表格显示"** | render_component | 1. 查询数据 → 2. 渲染表格 |
| **"生成PDF报告"** | generate_pdf_report | 1. 查询数据 → 2. 生成PDF |
| **"创建Word文档"** | generate_word_document | 1. 查询数据 → 2. 生成Word |
| **"制作Excel报表"** | generate_excel_report | 1. 查询数据 → 2. 生成Excel |
| **"制作PPT演示"** | generate_ppt_presentation | 1. 查询数据 → 2. 生成PPT |
| **"生成HTML页面"** | generate_html_preview | 直接生成HTML |

## 🔄 决策流程

### 步骤1: 识别用户意图
- **查询意图**: 仅说"查询"、"统计"、"有多少" → 使用生产工具
- **展示意图**: 明确说"图表显示"、"生成PDF" → 使用展示工具

### 步骤2: 工具选择
- **生产工具**: 可以单独使用
- **展示工具**: 必须与生产工具配合，或用户明确要求

### 步骤3: 执行顺序
- **并发执行**: 无依赖关系的工具可以同时调用
- **顺序执行**: 有依赖关系的工具分两轮调用

## ✅ 正确示例

### 场景1: 仅查询
**用户**: "大班有多少学生？"
**流程**: read_data_record → 文字回答"45名学生"

### 场景2: 查询+展示
**用户**: "查询大班学生，并用图表显示"
**流程**: 
1. read_data_record 查询数据
2. render_component 生成图表

### 场景3: 生成报告
**用户**: "生成本学期教师工作总结PDF报告"
**流程**:
1. any_query 查询教师数据
2. generate_pdf_report 生成报告

## ❌ 错误示例

- **错误**: 用户说"查询学生" → 调用render_component
- **正确**: 用户说"查询学生" → 仅read_data_record

- **错误**: 用户说"统计教师" → 调用generate_pdf_report
- **正确**: 用户说"统计教师" → 仅any_query

## 🎯 关键词匹配表

| 用户请求 | 工具类别 | 是否调用展示工具 |
|----------|----------|------------------|
| "查询学生人数" | 生产工具 | ❌ 否 |
| "查询学生人数，用图表显示" | 展示工具 | ✅ 是 |
| "统计教师信息" | 生产工具 | ❌ 否 |
| "生成教师统计PDF" | 展示工具 | ✅ 是 |
| "制作招生报表" | 展示工具 | ✅ 是 |
| "有多少活动" | 生产工具 | ❌ 否 |

## ⚠️ 重要规则

1. **禁止**: 仅查询数据就调用展示工具
2. **必须**: 用户明确使用展示关键词时才调用
3. **精确**: 每个关键词对应特定工具，一对一映射
4. **清晰**: 用户意图必须明确，不能模糊判断
