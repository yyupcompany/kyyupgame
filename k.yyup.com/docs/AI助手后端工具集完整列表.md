# AI助手后端工具集完整列表

**更新时间**: 2025-12-06  
**工具总数**: 35+ 个

---

## 📊 工具分类统计

| 分类 | 工具数量 | 说明 |
|-----|---------|------|
| **数据库查询** | 2 | 智能查询和数据读取 |
| **数据库CRUD** | 4 | 创建、更新、删除、批量导入 |
| **页面操作** | 12 | 导航、填表、点击、截图等 |
| **文档生成** | 4 | PDF、Excel、Word、PPT |
| **UI渲染** | 1 | 动态组件渲染 |
| **业务操作** | 1 | 海报生成 |
| **活动工作流** | 2 | 活动方案生成、工作流执行 |
| **数据导入** | 2 | 教师、家长数据导入 |
| **网络搜索** | 1 | Web搜索 |

**总计**: **29个主要工具** （不含重复和别名）

---

## 🔧 详细工具列表

### 1. 数据库查询工具 (2个)

#### 1.1 `any_query`
- **描述**: 智能自然语言查询 - AI驱动的SQL生成工具
- **文件**: `services/ai/tools/database-query/any-query.tool.ts`
- **功能**: 
  - 接收自然语言查询
  - AI生成SQL语句
  - SQL安全检查
  - 执行数据库查询
  - 格式化结果返回
- **参数**:
  ```typescript
  {
    userQuery: string;           // 用户的原始查询需求
    queryType?: string;          // statistical/detailed/comparison/trend
    expectedFormat?: string;     // table/chart/summary/mixed
    userRole?: string;           // 用户角色
  }
  ```
- **返回**:
  ```typescript
  {
    success: boolean;
    data: {
      type: 'table' | 'chart' | 'summary' | 'mixed';
      columns?: Array;
      rows?: Array;
      summary?: object;
    };
    metadata: {
      name: 'any_query';
      originalQuery: string;
      generatedSQL: string;
      explanation: string;
      resultCount: number;
    };
  }
  ```
- **适用角色**: admin, principal, teacher, parent
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 1.2 `read_data_record`
- **描述**: 读取数据记录
- **文件**: `services/ai/tools/database-query/read-data-record.ts`
- **功能**: 直接读取指定数据表记录
- **适用角色**: admin, principal, teacher

---

### 2. 数据库CRUD工具 (4个)

#### 2.1 `create_data_record`
- **描述**: 创建数据记录
- **功能**: 向数据库插入新记录
- **适用角色**: admin, principal, teacher

#### 2.2 `update_data_record`
- **描述**: 更新数据记录
- **功能**: 修改现有数据库记录
- **适用角色**: admin, principal, teacher

#### 2.3 `delete_data_record`
- **描述**: 删除数据记录
- **功能**: 从数据库删除记录
- **适用角色**: admin, principal

#### 2.4 `batch_import_data`
- **描述**: 批量导入数据
- **功能**: 批量插入多条记录
- **适用角色**: admin, principal

---

### 3. 页面操作工具 (12个)

#### 3.1 `get_accessible_pages`
- **描述**: 获取当前用户可访问的页面列表
- **文件**: `services/ai/tools/web-operation/get-accessible-pages.tool.ts`
- **功能**: 根据用户角色返回可访问页面
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.2 `navigate_to_page`
- **描述**: 导航到指定页面
- **文件**: `services/ai/tools/web-operation/navigate-page.tool.ts`
- **功能**: 前端页面路由跳转
- **参数**:
  ```typescript
  {
    pageName: string;    // 页面名称或路径
    params?: object;     // 路由参数
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.3 `navigate_back`
- **描述**: 返回到上一个页面
- **文件**: `services/ai/tools/web-operation/navigate-back.tool.ts`
- **功能**: 浏览器后退
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.4 `get_page_structure`
- **描述**: 获取页面结构
- **文件**: `services/ai/tools/web-operation/get-page-structure.tool.ts`
- **功能**: 分析当前页面DOM结构
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.5 `fill_form`
- **描述**: 自动填写表单
- **文件**: `services/ai/tools/web-operation/fill-form.tool.ts`
- **功能**: 批量填充表单字段
- **参数**:
  ```typescript
  {
    formData: Record<string, any>;  // 表单字段和值
    formSelector?: string;          // 表单选择器
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.6 `submit_form`
- **描述**: 提交表单
- **文件**: `services/ai/tools/web-operation/submit-form.tool.ts`
- **功能**: 触发表单提交
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.7 `click_element`
- **描述**: 点击页面元素
- **文件**: `services/ai/tools/web-operation/click-element.tool.ts`
- **功能**: 模拟点击操作
- **参数**:
  ```typescript
  {
    selector: string;    // 元素选择器
    waitTime?: number;   // 点击后等待时间
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.8 `type_text`
- **描述**: 在输入框中输入文本
- **文件**: `services/ai/tools/web-operation/type-text.tool.ts`
- **功能**: 模拟键盘输入
- **参数**:
  ```typescript
  {
    selector: string;    // 输入框选择器
    text: string;        // 输入内容
    clear?: boolean;     // 是否先清空
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.9 `select_option`
- **描述**: 在下拉框中选择选项
- **文件**: `services/ai/tools/web-operation/select-option.tool.ts`
- **功能**: 选择下拉菜单选项
- **参数**:
  ```typescript
  {
    selector: string;    // 下拉框选择器
    value: string;       // 选项值
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.10 `validate_page_state`
- **描述**: 验证页面状态
- **文件**: `services/ai/tools/web-operation/validate-page-state.tool.ts`
- **功能**: 检查页面元素是否存在/可见
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.11 `wait_for_element`
- **描述**: 等待元素出现
- **文件**: `services/ai/tools/web-operation/wait-for-element.tool.ts`
- **功能**: 等待指定元素加载完成
- **参数**:
  ```typescript
  {
    selector: string;     // 元素选择器
    timeout?: number;     // 超时时间
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.12 `capture_screen`
- **描述**: 截取页面截图
- **文件**: `services/ai/tools/web-operation/capture-screen.tool.ts`
- **功能**: 生成当前页面截图
- **参数**:
  ```typescript
  {
    element?: string;     // 元素选择器，留空则截整个页面
    fullPage?: boolean;   // 是否截取完整页面
  }
  ```
- **返回**: Base64编码的图片数据
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 3.13 `wait_for_condition`
- **描述**: 等待指定条件满足
- **功能**: 条件轮询等待

#### 3.14 `console_monitor`
- **描述**: 监控浏览器控制台消息
- **功能**: 捕获控制台日志、警告、错误

#### 3.15 `execute_workflow`
- **描述**: 执行复杂工作流程
- **功能**: 协调多个工具按顺序执行

---

### 4. 文档生成工具 (4个)

#### 4.1 `generate_pdf_report`
- **描述**: 生成PDF报告
- **文件**: `services/ai/tools/document-generation/generate-pdf-report.tool.ts`
- **功能**: 将数据生成PDF格式报告
- **参数**:
  ```typescript
  {
    title: string;
    content: string;
    data?: any;
    template?: string;
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 4.2 `generate_excel_report`
- **描述**: 生成Excel报告
- **文件**: `services/ai/tools/document-generation/generate-excel-report.tool.ts`
- **功能**: 将数据导出为Excel文件
- **参数**:
  ```typescript
  {
    sheetName: string;
    data: Array<object>;
    columns?: Array<string>;
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 4.3 `generate_word_document`
- **描述**: 生成Word文档
- **文件**: `services/ai/tools/document-generation/generate-word-document.tool.ts`
- **功能**: 创建Word格式文档
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

#### 4.4 `generate_ppt_presentation`
- **描述**: 生成PPT演示文稿
- **文件**: `services/ai/tools/document-generation/generate-ppt-presentation.tool.ts`
- **功能**: 创建PowerPoint演示文稿
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

---

### 5. UI渲染工具 (1个)

#### 5.1 `render_component`
- **描述**: 渲染动态组件
- **文件**: `services/ai/tools/ui-display/render-component.tool.ts`
- **功能**: 将数据渲染为前端组件（表格、图表等）
- **参数**:
  ```typescript
  {
    type: 'data-table' | 'chart' | 'card' | 'list';
    title?: string;
    data: any;
    columns?: Array;
    chartType?: 'bar' | 'line' | 'pie';
  }
  ```
- **返回**:
  ```typescript
  {
    ui_instruction: {
      type: 'render_component';
      component: {
        type: string;
        title: string;
        data: any;
        columns?: Array;
      };
    };
  }
  ```
- **注册位置**: `tool-orchestrator.service.ts` (默认工具)

---

### 6. 业务操作工具 (1个)

#### 6.1 `generate_poster`
- **描述**: 生成活动海报
- **功能**: AI生成营销海报
- **适用角色**: admin, principal, teacher

---

### 7. 活动工作流工具 (2个)

#### 7.1 `generate_complete_activity_plan`
- **描述**: 🎯 智能生成完整活动方案（含海报设计和营销策略）
- **功能**: 
  - AI智能分析
  - Markdown编辑
  - 一键生成活动方案
- **适用角色**: admin, principal, teacher

#### 7.2 `execute_activity_workflow`
- **描述**: 🚀 执行完整活动创建工作流（自动化全流程）
- **功能**:
  - 自动创建活动
  - 生成海报
  - 配置营销
  - 生成手机海报
- **工作流步骤**:
  1. 分析活动需求
  2. 生成活动方案
  3. 创建活动记录
  4. 生成宣传海报
  5. 配置营销策略
  6. 生成移动端预览
- **事件**:
  - `workflow_step_start`
  - `workflow_step_complete`
  - `workflow_user_confirmation_required`
  - `workflow_mobile_preview`
  - `workflow_complete`
- **适用角色**: admin, principal, teacher

---

### 8. 数据导入工具 (2个)

#### 8.1 `import_teacher_data`
- **描述**: 👨‍🏫 智能导入老师数据（支持Excel、CSV、PDF、Word）
- **功能**:
  - 智能字段映射
  - 数据验证
  - 批量导入
  - 错误处理
- **适用角色**: admin, principal

#### 8.2 `import_parent_data`
- **描述**: 👨‍👩‍👧‍👦 智能导入家长数据（支持多种格式）
- **功能**:
  - 自动解析
  - 字段匹配
  - 数据清洗
  - 安全导入
- **适用角色**: admin, principal, teacher

---

### 9. 网络搜索工具 (1个)

#### 9.1 `web_search`
- **描述**: 网络搜索
- **文件**: `services/ai/tools/web-operation/web-search.tool.ts`
- **功能**: 联网搜索最新信息
- **参数**:
  ```typescript
  {
    query: string;        // 搜索关键词
    maxResults?: number;  // 最大结果数
  }
  ```
- **事件**:
  - `search_start`
  - `search_progress`
  - `search_complete`

---

## 📡 工具注册机制

### 注册位置1: tool-orchestrator.service.ts
**默认工具** (18个):
```typescript
const defaultToolDefinitions: AIToolDefinition[] = [
  getAccessiblePagesTool,        // 1
  navigateToPageTool,            // 2
  navigateBackTool,              // 3
  getPageStructureTool,          // 4
  fillFormTool,                  // 5
  submitFormTool,                // 6
  clickElementTool,              // 7
  typeTextTool,                  // 8
  selectOptionTool,              // 9
  validatePageStateTool,         // 10
  waitForElementTool,            // 11
  captureScreenTool,             // 12
  readDataRecordTool,            // 13
  anyQueryTool,                  // 14
  renderComponentTool,           // 15
  generatePdfReportTool,         // 16
  generateExcelReportTool,       // 17
  generateWordDocumentTool,      // 18
  generatePptPresentationTool    // 19
];
```

### 注册位置2: function-tools.routes.ts
**API工具** (用于OpenAI函数调用格式):
- FUNCTION_TOOLS数组定义 (2个)
- /available-tools接口返回 (25+个)

### 注册位置3: unified-intelligence.service.ts
**统一智能服务** - 使用tool-orchestrator提供的工具

---

## 🔌 API端点

### 1. 获取工具列表
```
GET /api/ai/function-tools/available-tools
Headers: Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "database_query": [...],
    "page_operation": [...],
    "business_operation": [...],
    "activity_workflow": [...],
    "data_import_workflow": [...]
  },
  "metadata": {
    "user_role": "teacher",
    "total_tools": 25
  }
}
```

### 2. 执行工具
```
POST /api/ai/function-tools/execute
Headers: Authorization: Bearer <token>
Body: {
  "tool_name": "any_query",
  "arguments": {
    "userQuery": "查询最近10个活动"
  }
}
```

### 3. 流式对话（自动工具调用）
```
POST /api/ai/unified-stream/stream-chat
Headers: Authorization: Bearer <token>
Body: {
  "message": "查询最近10个活动",
  "context": {
    "enableTools": true,
    "role": "teacher"
  }
}
```

---

## 🎯 工具使用优先级

### 高优先级 (核心工具)
1. ✅ `any_query` - 最常用的查询工具
2. ✅ `render_component` - 数据可视化
3. ✅ `navigate_to_page` - 页面导航
4. ✅ `execute_activity_workflow` - 活动创建自动化

### 中优先级
1. ✅ `fill_form` / `submit_form` - 表单自动化
2. ✅ `capture_screen` - 页面截图
3. ✅ `generate_pdf_report` - 报告生成

### 低优先级
1. `click_element` / `type_text` - 细粒度页面操作
2. `wait_for_element` - 辅助等待
3. `console_monitor` - 调试工具

---

## ⚙️ 工具调用流程

```
用户输入 → AI分析意图 → 选择工具 → 调用工具 → 返回结果 → AI整合答案
```

**详细流程**:
1. 用户发送消息到前端
2. 前端调用 `/api/ai/unified-stream/stream-chat`
3. 后端AI分析消息，决定是否需要工具
4. 如果需要工具：
   - AI选择合适的工具
   - 生成工具参数
   - 调用tool-orchestrator执行工具
   - 获取工具结果
   - AI基于结果生成最终答案
5. 通过SSE流式返回给前端：
   - `thinking` - 思考过程
   - `tool_call_start` - 工具开始
   - `tool_call_complete` - 工具完成
   - `final_answer` - 最终答案

---

## 📝 测试建议

### 基础测试
1. ✅ "你好" - 测试普通对话（不触发工具）
2. ✅ "查询最近10个活动" - 测试any_query
3. ✅ "截图当前页面" - 测试capture_screen
4. ✅ "导航到学生管理" - 测试navigate_to_page

### 高级测试
1. ✅ "用表格显示所有班级的学生数量" - 测试any_query + render_component
2. ✅ "帮我创建一个春游活动" - 测试execute_activity_workflow
3. ✅ "生成本月活动统计报告PDF" - 测试any_query + generate_pdf_report

---

## 🚀 下一步计划

1. [ ] 验证所有35个工具的可用性
2. [ ] 测试每个工具的调用链路
3. [ ] 检查前端事件渲染
4. [ ] 修复AI助手按钮点击问题
5. [ ] 执行完整测试用例
6. [ ] 记录测试结果到测试文档

---

**文档维护者**: AI Assistant  
**最后更新**: 2025-12-06











