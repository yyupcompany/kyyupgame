# AI助手工具集全面测试文档

**创建时间**: 2025-12-06  
**测试目标**: 验证AI助手的工具调用功能是否正常，包括端点连接、链路通畅、前后端事件渲染  
**测试原则**: 不修改功能，只检测和修复链路问题

---

## 📋 测试准备

### 1. 环境检查
- [x] 前端服务运行中 (http://localhost:5173)
- [x] 后端服务运行中 (http://localhost:3000)
- [ ] Admin账号快捷登录可用
- [ ] AI助手入口可访问

### 2. 后端工具集清单

根据代码分析，后端工具集主要在以下位置定义：

**位置1**: `server/src/routes/ai/function-tools.routes.ts` - Function Tools
- ✅ `any_query` - 智能自然语言查询（AI生成SQL）
- ✅ `capture_screen` - 截取页面截图

**位置2**: 基于文档的完整工具列表（需要验证）
1. **数据库查询工具**
   - `query_past_activities` - 查询历史活动数据
   - `get_activity_statistics` - 获取活动统计信息
   - `any_query` - AI驱动的智能查询

2. **页面操作工具**
   - `navigate_to_page` - 导航到指定页面
   - `capture_screen` - 截取页面截图
   - `fill_form` - 自动填写表单
   - `submit_form` - 提交表单
   - `click_element` - 点击页面元素
   - `get_page_structure` - 获取页面结构
   - `validate_page_state` - 验证页面状态
   - `wait_for_element` - 等待元素出现

3. **TodoList管理工具**
   - `create_todo_list` - 创建待办事项列表
   - `update_todo_task` - 更新待办任务状态
   - `analyze_task_complexity` - 分析任务复杂度

4. **活动工作流工具**
   - `generate_complete_activity_plan` - 生成完整活动方案
   - `execute_activity_workflow` - 执行活动创建工作流

5. **UI渲染工具**
   - `render_component` - 渲染组件
   - `preview_html` - HTML预览

### 3. 前端事件类型清单

前端需要正确响应的事件类型（基于`AIAssistantCore.vue`）：

**思考事件**：
- `context_optimization_start` - 上下文优化开始
- `context_optimization_progress` - 上下文优化进度
- `context_optimization_complete` - 上下文优化完成
- `thinking_start` - 思考开始
- `thinking` - 思考中
- `thinking_update` - 思考更新
- `thinking_complete` - 思考完成

**工具调用事件**：
- `tool_intent` - 工具意图
- `tool_call_start` - 工具调用开始
- `tool_call_complete` - 工具调用完成
- `tool_call_error` - 工具调用错误
- `tool_narration` - 工具解说
- `progress` - 进度更新

**工作流事件**：
- `workflow_step_start` - 工作流步骤开始
- `workflow_step_complete` - 工作流步骤完成
- `workflow_step_failed` - 工作流步骤失败
- `workflow_user_confirmation_required` - 等待用户确认
- `workflow_mobile_preview` - 移动端预览
- `workflow_complete` - 工作流完成

**搜索事件**：
- `search_start` - 搜索开始
- `search_progress` - 搜索进度
- `search_complete` - 搜索完成

**答案事件**：
- `answer_chunk` - 答案分块
- `content_update` - 内容更新
- `answer_complete` - 答案完成
- `final_answer` - 最终答案
- `complete` - 完成

**错误事件**：
- `error` - 错误

---

## 🧪 测试用例

### 测试类别1：基础对话功能

#### 用例1.1：简单问候
**输入**: "你好"  
**预期结果**: 
- ✅ 不触发工具调用
- ✅ 直接返回AI回复
- ✅ 前端正确渲染消息

**检查点**:
- [ ] 发送成功
- [ ] 收到thinking事件
- [ ] 收到final_answer事件
- [ ] 消息正确显示在聊天窗口
- [ ] 没有报错

#### 用例1.2：普通问答
**输入**: "幼儿园管理系统可以做什么？"  
**预期结果**: 
- ✅ 不触发工具调用
- ✅ AI给出系统功能介绍
- ✅ 返回格式良好的答案

**检查点**:
- [ ] 发送成功
- [ ] 思考过程显示
- [ ] 答案内容合理
- [ ] 没有工具调用

---

### 测试类别2：数据查询工具

#### 用例2.1：any_query - 简单查询
**输入**: "查询最近10个活动"  
**预期结果**: 
- ✅ 触发`any_query`工具
- ✅ 返回活动列表数据
- ✅ 前端渲染表格组件

**后端检查点**:
- [ ] 收到工具调用请求
- [ ] 生成SQL查询
- [ ] SQL安全检查通过
- [ ] 执行数据库查询成功
- [ ] 返回数据格式正确

**前端检查点**:
- [ ] 收到tool_intent事件
- [ ] 收到tool_call_start事件
- [ ] 收到tool_call_complete事件
- [ ] 渲染ComponentRenderer组件
- [ ] 表格数据正确显示

#### 用例2.2：any_query - 统计查询
**输入**: "统计本月活动参与人数"  
**预期结果**: 
- ✅ 触发`any_query`工具
- ✅ 生成聚合SQL
- ✅ 返回统计数据

**检查点**:
- [ ] 生成包含COUNT/SUM的SQL
- [ ] 返回统计结果
- [ ] 前端显示统计卡片或图表

#### 用例2.3：any_query - 多表关联查询
**输入**: "查询每个班级的学生数量和教师数量"  
**预期结果**: 
- ✅ 触发`any_query`工具
- ✅ 生成JOIN查询
- ✅ 返回关联数据

**检查点**:
- [ ] SQL包含正确的JOIN
- [ ] 数据准确性
- [ ] 前端表格正确显示

---

### 测试类别3：页面操作工具

#### 用例3.1：capture_screen
**输入**: "截图当前页面"  
**预期结果**: 
- ✅ 触发`capture_screen`工具
- ✅ 返回截图数据
- ✅ 前端显示图片

**检查点**:
- [ ] 工具调用成功
- [ ] 返回Base64图片数据
- [ ] 前端正确渲染图片

#### 用例3.2：navigate_to_page（如果可用）
**输入**: "导航到学生管理页面"  
**预期结果**: 
- ✅ 触发`navigate_to_page`工具
- ✅ 页面成功跳转

**检查点**:
- [ ] 识别到导航意图
- [ ] 调用navigate工具
- [ ] 路由跳转成功

---

### 测试类别4：工作流工具

#### 用例4.1：execute_activity_workflow
**输入**: "帮我创建一个春游活动"  
**预期结果**: 
- ✅ 触发活动工作流
- ✅ 显示步骤进度
- ✅ 生成活动方案
- ✅ 显示移动端预览

**前端事件检查**:
- [ ] workflow_step_start
- [ ] workflow_step_complete
- [ ] workflow_user_confirmation_required
- [ ] workflow_mobile_preview
- [ ] workflow_complete

**检查点**:
- [ ] 步骤时间线正确显示
- [ ] 每个步骤有详细描述
- [ ] 最终生成完整活动方案
- [ ] 预览链接可用

---

### 测试类别5：UI渲染工具

#### 用例5.1：render_component - 表格
**输入**: "用表格显示最近10个学生"  
**预期结果**: 
- ✅ 调用查询工具获取数据
- ✅ 调用`render_component`渲染表格
- ✅ 前端显示DataTable组件

**检查点**:
- [ ] componentData包含type: 'data-table'
- [ ] 包含columns定义
- [ ] 包含rows数据
- [ ] ComponentRenderer正确渲染

#### 用例5.2：render_component - 图表
**输入**: "用柱状图显示各班级学生数量"  
**预期结果**: 
- ✅ 获取统计数据
- ✅ 渲染图表组件

**检查点**:
- [ ] componentData.type: 'chart'
- [ ] 包含chartType: 'bar'
- [ ] 图表数据格式正确
- [ ] 前端正确渲染图表

---

### 测试类别6：网络搜索

#### 用例6.1：联网搜索
**输入**: "搜索最新的幼儿教育政策"  
**预期结果**: 
- ✅ 识别为搜索查询
- ✅ 触发网络搜索
- ✅ 返回搜索结果

**前端事件检查**:
- [ ] search_start
- [ ] search_progress
- [ ] search_complete
- [ ] 显示搜索结果

---

### 测试类别7：错误处理

#### 用例7.1：工具调用失败
**输入**: "查询不存在的表数据"  
**预期结果**: 
- ✅ 检测到SQL错误
- ✅ 返回友好的错误提示
- ✅ 前端显示错误消息

**检查点**:
- [ ] 收到tool_call_error事件
- [ ] 错误消息友好清晰
- [ ] AI能给出解决建议

#### 用例7.2：权限不足
**输入**: "删除所有学生数据"  
**预期结果**: 
- ✅ SQL安全检查拦截
- ✅ 拒绝执行危险操作

**检查点**:
- [ ] 不执行DELETE操作
- [ ] 返回权限错误提示

---

## 🔍 测试执行记录

### 测试环境
- **日期**: ___________
- **测试人员**: ___________
- **前端版本**: ___________
- **后端版本**: ___________

### 测试结果汇总

| 用例编号 | 用例名称 | 状态 | 问题描述 | 修复方案 |
|---------|---------|------|---------|---------|
| 1.1 | 简单问候 | ⏳ | | |
| 1.2 | 普通问答 | ⏳ | | |
| 2.1 | any_query简单查询 | ⏳ | | |
| 2.2 | any_query统计查询 | ⏳ | | |
| 2.3 | any_query关联查询 | ⏳ | | |
| 3.1 | capture_screen | ⏳ | | |
| 3.2 | navigate_to_page | ⏳ | | |
| 4.1 | 活动工作流 | ⏳ | | |
| 5.1 | 渲染表格 | ⏳ | | |
| 5.2 | 渲染图表 | ⏳ | | |
| 6.1 | 网络搜索 | ⏳ | | |
| 7.1 | 工具调用失败 | ⏳ | | |
| 7.2 | 权限不足 | ⏳ | | |

**状态说明**:
- ⏳ 待测试
- ✅ 通过
- ❌ 失败
- ⚠️ 部分通过

---

## 🛠️ 问题追踪

### 问题模板
```markdown
**问题ID**: #001
**发现时间**: YYYY-MM-DD HH:mm
**用例**: 2.1 - any_query简单查询
**严重程度**: 高/中/低
**问题描述**: 
详细描述问题现象

**复现步骤**:
1. 步骤1
2. 步骤2
3. 步骤3

**预期结果**: 
应该发生什么

**实际结果**: 
实际发生了什么

**错误日志**: 
```
相关的错误日志
```

**修复方案**: 
建议的修复方法

**修复状态**: 待修复/修复中/已修复
```

---

## 📊 API端点清单

### 主要API端点

1. **SSE流式对话** (推荐)
   - URL: `POST /api/ai/unified-stream/stream-chat`
   - 支持: 工具调用、流式响应
   - 前端使用: `useMultiRoundToolCalling.ts`

2. **Function Tools**
   - URL: `POST /api/ai/function-tools/smart-chat`
   - 支持: 多轮对话、工具调用
   - 工具: any_query, capture_screen

3. **统一智能接口**
   - URL: `POST /api/ai/unified-intelligence/unified-chat-stream`
   - 支持: 智能路由、工具编排

### 健康检查端点
- `GET /api/ai/unified-stream/stream-health`
- `GET /api/health`

---

## 🎯 测试通过标准

### 基础标准
1. ✅ 普通对话能正常工作
2. ✅ 至少一个数据查询工具可用
3. ✅ 前端正确显示thinking过程
4. ✅ 前端正确显示final_answer
5. ✅ 工具调用状态正确显示

### 进阶标准
1. ✅ 工具调用意图正确识别
2. ✅ 工具执行进度实时显示
3. ✅ 组件渲染正确
4. ✅ 错误处理友好
5. ✅ 工作流步骤清晰

### 性能标准
1. ✅ 普通对话响应时间 < 3秒
2. ✅ 工具调用响应时间 < 10秒
3. ✅ 前端消息渲染流畅
4. ✅ 无明显卡顿

---

## 📝 测试注意事项

1. **逐步测试**: 从简单到复杂，先验证基础功能再测试高级功能
2. **记录日志**: 测试时打开浏览器控制台，记录所有错误和警告
3. **截图证据**: 对每个测试结果截图保存
4. **不修改功能**: 只修复链路和连接问题，不改变业务逻辑
5. **版本管理**: 每次修复后标记版本号

---

## 🔄 修复流程

1. **发现问题** → 记录到问题追踪
2. **分析原因** → 检查前端/后端/网络
3. **定位代码** → 找到具体文件和行号
4. **提出方案** → 讨论修复方法
5. **实施修复** → 修改代码
6. **验证修复** → 重新测试
7. **更新文档** → 标记已修复

---

## ✅ 测试完成检查清单

- [ ] 所有基础对话测试通过
- [ ] 至少3个工具调用测试通过
- [ ] 前端事件渲染正常
- [ ] 错误处理测试通过
- [ ] 性能测试达标
- [ ] 问题全部记录
- [ ] 修复方案已实施
- [ ] 回归测试通过
- [ ] 文档已更新
- [ ] 代码已提交

---

**测试负责人签字**: ___________  
**测试完成日期**: ___________
















