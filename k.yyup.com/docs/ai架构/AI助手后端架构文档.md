# AI助手后端架构文档

**版本**: 3.0.0 (API分组模式)  
**最后更新**: 2025-01-24  
**状态**: ✅ 生产就绪

---

## 📋 目录

- [架构概述](#架构概述)
- [核心服务](#核心服务)
- [工具系统](#工具系统)
- [API架构](#api架构)
- [数据流向](#数据流向)
- [技术栈](#技术栈)

---

## 🎯 架构概述

### 系统定位

AI助手后端是幼儿园管理系统的智能化核心，提供：
- 🤖 **AI对话服务** - 多轮对话、上下文理解
- 🔧 **工具调用系统** - 33+个智能工具
- 📊 **数据查询服务** - API分组智能映射
- 🧠 **记忆系统** - 六维记忆模型
- 📈 **性能监控** - 完整的监控和追踪

### 架构特点

- ✅ **模块化设计** - 60+个独立服务
- ✅ **API优先架构** - 基于现有API端点
- ✅ **智能工具编排** - 统一工具注册中心
- ✅ **高性能** - 原生HTTP、连接池优化
- ✅ **高可用** - 降级策略、错误恢复
- ✅ **可观测** - 完整的监控和追踪

---

## 🏗️ 核心服务

### 服务目录结构

```
server/src/services/ai/
├── bridge/                            # 🌉 AI桥接服务
│   ├── ai-bridge.service.ts          # AIBridge核心服务
│   └── ai-bridge.types.ts            # 类型定义
│
├── tools/                             # 🔧 工具系统
│   ├── core/                         # 核心工具服务
│   │   ├── tool-registry.service.ts  # 工具注册中心
│   │   └── tool-executor.service.ts  # 工具执行器
│   ├── database-crud/                # 数据库CRUD工具
│   │   ├── create-data-record.tool.ts
│   │   ├── update-data-record.tool.ts
│   │   ├── delete-data-record.tool.ts
│   │   └── read-data-record.tool.ts
│   ├── database-query/               # 数据库查询工具
│   │   └── any-query.tool.ts
│   ├── ui-display/                   # UI显示工具
│   │   └── render-component.tool.ts
│   ├── web-operation/                # 网页操作工具
│   │   ├── navigate-to-page.tool.ts
│   │   ├── click-element.tool.ts
│   │   └── fill-form.tool.ts
│   ├── workflow/                     # 工作流工具
│   │   └── activity-planner.tool.ts
│   └── types/                        # 工具类型定义
│       └── tool.types.ts
│
├── tool-calling.service.ts           # 工具调用服务
├── api-group-mapping.service.ts      # API分组映射服务
├── conversation.service.ts           # 对话管理服务
├── message.service.ts                # 消息管理服务
├── model-selector.service.ts         # 模型选择服务
├── ai-config.service.ts              # AI配置服务
└── index.ts                          # 服务导出
```

### 1. AIBridge服务

**文件**: `server/src/services/ai/bridge/ai-bridge.service.ts`

**职责**: 与外部AI模型提供商交互的桥接服务

**核心功能**:
```typescript
class AIBridgeService {
  // 聊天补全（支持工具调用）
  generateChatCompletion(params: AiBridgeChatCompletionParams)
  
  // 快速推理（Flash模型）
  generateFastChatCompletion(params: AiBridgeChatCompletionParams)
  
  // 深度思考（Thinking模型）
  generateThinkingChatCompletion(params: AiBridgeChatCompletionParams)
  
  // 图片生成
  generateImage(params: AiBridgeImageGenerationParams)
  
  // 语音转文字
  speechToText(params: AiBridgeSpeechToTextParams)
  
  // 文字转语音
  textToSpeech(params: AiBridgeTextToSpeechParams)
  
  // 网络搜索
  search(params: AiBridgeSearchParams)
}
```

**性能优化**:
- ✅ 原生HTTP/HTTPS模块（性能提升40%）
- ✅ 连接池复用
- ✅ 超时控制（默认180秒）
- ✅ 请求重试机制

**模型支持**:
```typescript
// Flash模型 - 快速推理
model: "doubao-1.5-flash-32k"
// Thinking模型 - 深度思考
model: "doubao-1.5-thinking-32k"
// Pro模型 - 工具调用
model: "doubao-1.5-pro-32k"
```

### 2. 工具调用服务

**文件**: `server/src/services/ai/tool-calling.service.ts`

**职责**: 管理和执行AI工具调用

**核心功能**:
```typescript
class ToolCallingService {
  // 获取可用工具列表
  getAvailableTools(): ToolFunction[]
  
  // 执行工具调用
  async executeToolCall(functionCall: FunctionCall): Promise<ToolResult>
  
  // 批量执行工具调用
  async executeToolCalls(functionCalls: FunctionCall[]): Promise<ToolResult[]>
}
```

**工具注册机制**:
```typescript
// 使用统一工具注册中心
const { toolRegistry, ToolScenario } = require('./tools/core/tool-registry.service');
const tools = toolRegistry.getToolsForScenario(ToolScenario.TOOL_CALLING);
```

### 3. API分组映射服务

**文件**: `server/src/services/ai/api-group-mapping.service.ts`

**职责**: 智能识别查询意图并映射到API分组

**核心功能**:
```typescript
class ApiGroupMappingService {
  // 识别查询意图并返回API分组
  async identifyApiGroups(query: string): Promise<ApiGroup[]>
  
  // 生成API调用计划
  async generateApiCallPlan(query: string, groups: ApiGroup[]): Promise<ApiCallPlan>
  
  // 执行API调用计划
  async executeApiCallPlan(plan: ApiCallPlan): Promise<any>
  
  // 整合多个API结果
  async aggregateResults(results: any[]): Promise<any>
}
```

**API分组定义**:
```typescript
// 业务中心分组
const API_GROUPS = {
  PERSONNEL: {
    name: '人员中心',
    apis: ['/api/students', '/api/teachers', '/api/parents', '/api/users']
  },
  ENROLLMENT: {
    name: '招生中心',
    apis: ['/api/enrollment-*']
  },
  EDUCATION: {
    name: '教学中心',
    apis: ['/api/classes', '/api/courses', '/api/schedules']
  },
  ACTIVITY: {
    name: '活动中心',
    apis: ['/api/activities', '/api/activity-*']
  },
  MARKETING: {
    name: '营销中心',
    apis: ['/api/marketing-*', '/api/advertisements']
  },
  FINANCE: {
    name: '财务中心',
    apis: ['/api/finance/*']
  },
  SYSTEM: {
    name: '系统中心',
    apis: ['/api/system/*']
  }
}
```

### 4. 对话管理服务

**文件**: `server/src/services/ai/conversation.service.ts`

**职责**: 管理AI对话会话

**核心功能**:
```typescript
class ConversationService {
  // 创建新会话
  async createConversation(userId: string): Promise<Conversation>
  
  // 获取会话详情
  async getConversation(conversationId: string): Promise<Conversation>
  
  // 获取用户会话列表
  async getUserConversations(userId: string): Promise<Conversation[]>
  
  // 删除会话
  async deleteConversation(conversationId: string): Promise<void>
}
```

### 5. 消息管理服务

**文件**: `server/src/services/ai/message.service.ts`

**职责**: 管理对话消息

**核心功能**:
```typescript
class MessageService {
  // 保存用户消息
  async saveUserMessage(conversationId: string, content: string): Promise<Message>
  
  // 保存AI消息
  async saveAIMessage(conversationId: string, content: string): Promise<Message>
  
  // 获取会话消息列表
  async getConversationMessages(conversationId: string): Promise<Message[]>
  
  // 删除消息
  async deleteMessage(messageId: string): Promise<void>
}
```

### 6. 模型选择服务

**文件**: `server/src/services/ai/model-selector.service.ts`

**职责**: 根据查询复杂度选择合适的AI模型

**核心功能**:
```typescript
class ModelSelectorService {
  // 分析查询复杂度
  async analyzeQueryComplexity(query: string): Promise<ComplexityLevel>
  
  // 选择最佳模型
  async selectBestModel(complexity: ComplexityLevel): Promise<ModelConfig>
  
  // 获取模型配置
  async getModelConfig(modelName: string): Promise<ModelConfig>
}
```

**复杂度级别**:
```typescript
enum ComplexityLevel {
  SIMPLE = 'simple',       // 简单查询 → Flash模型
  MEDIUM = 'medium',       // 中等查询 → Pro模型
  COMPLEX = 'complex',     // 复杂查询 → Thinking模型
  VERY_COMPLEX = 'very_complex'  // 极复杂 → Thinking模型
}
```

---

## 🔧 工具系统

### 工具注册中心

**文件**: `server/src/services/ai/tools/core/tool-registry.service.ts`

**职责**: 统一管理所有AI工具

**工具场景**:
```typescript
enum ToolScenario {
  TOOL_CALLING = 'tool_calling',           // 工具调用场景
  SMART_AGENT = 'smart_agent',             // 智能代理场景
  WORKFLOW = 'workflow',                   // 工作流场景
  DATA_ANALYSIS = 'data_analysis'          // 数据分析场景
}
```

**注册机制**:
```typescript
class ToolRegistry {
  // 注册工具
  registerTool(tool: ToolDefinition, scenarios: ToolScenario[]): void
  
  // 获取场景工具
  getToolsForScenario(scenario: ToolScenario): ToolDefinition[]
  
  // 获取所有工具
  getAllTools(): ToolDefinition[]
  
  // 查找工具
  findTool(toolName: string): ToolDefinition | undefined
}
```

### 工具分类

#### 1. 上下文注入工具 (1个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| inject_context | 注入页面上下文信息 | context-injection.tool.ts |

#### 2. 智能查询工具 (1个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| any_query | 通用数据查询工具 | any-query.tool.ts |

#### 3. 页面操作工具 (8个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| navigate_to_page | 导航到指定页面 | navigate-to-page.tool.ts |
| click_element | 点击页面元素 | click-element.tool.ts |
| fill_form | 填写表单 | fill-form.tool.ts |
| scroll_page | 滚动页面 | scroll-page.tool.ts |
| get_page_info | 获取页面信息 | get-page-info.tool.ts |
| wait_for_element | 等待元素出现 | wait-for-element.tool.ts |
| take_screenshot | 截图 | take-screenshot.tool.ts |
| execute_script | 执行脚本 | execute-script.tool.ts |

#### 4. 任务管理工具 (6个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| create_task | 创建任务 | create-task.tool.ts |
| update_task | 更新任务 | update-task.tool.ts |
| delete_task | 删除任务 | delete-task.tool.ts |
| list_tasks | 列出任务 | list-tasks.tool.ts |
| complete_task | 完成任务 | complete-task.tool.ts |
| assign_task | 分配任务 | assign-task.tool.ts |

#### 5. UI展示工具 (1个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| render_component | 渲染UI组件 | render-component.tool.ts |

#### 6. 专家咨询工具 (3个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| consult_expert | 咨询专家 | consult-expert.tool.ts |
| list_experts | 列出专家 | list-experts.tool.ts |
| create_expert | 创建专家 | create-expert.tool.ts |

#### 7. 网络搜索工具 (1个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| web_search | 网络搜索 | web-search.tool.ts |

#### 8. 工作流工具 (2个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| activity_planner | 活动策划 | activity-planner.tool.ts |
| workflow_executor | 工作流执行 | workflow-executor.tool.ts |

#### 9. 数据库CRUD工具 (4个)

| 工具名 | 描述 | 文件 |
|--------|------|------|
| create_data_record | 创建数据记录 | create-data-record.tool.ts |
| read_data_record | 读取数据记录 | read-data-record.tool.ts |
| update_data_record | 更新数据记录 | update-data-record.tool.ts |
| delete_data_record | 删除数据记录 | delete-data-record.tool.ts |

### 工具执行流程

```
工具调用请求
  ↓
ToolCallingService.executeToolCall()
  ↓
ToolRegistry.findTool(toolName)
  ↓
Tool.execute(params)
  ↓
┌─────────────────────────────────────┐
│ 工具执行逻辑                          │
│ - 参数验证                            │
│ - 业务逻辑处理                        │
│ - 错误处理                            │
│ - 结果格式化                          │
└─────────────────────────────────────┘
  ↓
返回ToolResult
  ↓
{
  name: string,
  status: 'success' | 'error',
  result: any,
  error?: string
}
```

---

## 📡 API架构

### API路由结构

```
/api/ai/
├── /chat                              # 基础聊天
├── /direct-chat-sse                   # 直连聊天SSE
├── /unified-intelligence-stream       # 统一智能流式接口
├── /conversations                     # 会话管理
│   ├── POST /                        # 创建会话
│   ├── GET /:id                      # 获取会话
│   ├── GET /user/:userId             # 获取用户会话列表
│   └── DELETE /:id                   # 删除会话
├── /messages                          # 消息管理
│   ├── POST /                        # 保存消息
│   ├── GET /conversation/:id         # 获取会话消息
│   └── DELETE /:id                   # 删除消息
├── /models                            # 模型管理
│   ├── GET /                         # 获取模型列表
│   ├── GET /:id                      # 获取模型详情
│   └── POST /select                  # 选择模型
└── /tools                             # 工具管理
    ├── GET /                         # 获取工具列表
    └── POST /execute                 # 执行工具
```

### 核心API端点

#### 1. 统一智能流式接口

**端点**: `POST /api/ai/unified-intelligence-stream`

**功能**: 支持工具调用的流式AI对话接口

**请求参数**:
```typescript
{
  message: string,              // 用户消息
  conversationId?: string,      // 会话ID
  userId?: string,              // 用户ID
  enableTools?: boolean,        // 启用工具调用
  maxRounds?: number,           // 最大轮次
  model?: string                // 指定模型
}
```

**响应格式** (SSE流):
```typescript
// 思考阶段
data: {"type":"thinking","content":"正在思考..."}

// 工具调用阶段
data: {"type":"tool_call","name":"query_data","arguments":{...}}
data: {"type":"tool_result","name":"query_data","result":{...}}

// 答案阶段
data: {"type":"answer","content":"根据查询结果..."}
data: {"type":"done"}
```

#### 2. 直连聊天SSE接口

**端点**: `POST /api/ai/direct-chat-sse`

**功能**: 不支持工具调用的简单聊天接口

**请求参数**:
```typescript
{
  message: string,              // 用户消息
  conversationId?: string,      // 会话ID
  userId?: string               // 用户ID
}
```

**响应格式** (SSE流):
```typescript
data: {"type":"content","content":"你好"}
data: {"type":"content","content":"，我"}
data: {"type":"content","content":"是AI"}
data: {"type":"content","content":"助手"}
data: {"type":"done"}
```

---

## 🔄 数据流向

### 完整请求流程

```
前端发起请求
  ↓
Express路由 (/api/ai/unified-intelligence-stream)
  ↓
AI Controller
  ↓
┌─────────────────────────────────────┐
│ 1. 会话管理                          │
│    ConversationService               │
│    - 创建/获取会话                    │
│    - 保存用户消息                     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 2. 模型选择                          │
│    ModelSelectorService              │
│    - 分析查询复杂度                   │
│    - 选择最佳模型                     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 3. 工具准备                          │
│    ToolCallingService                │
│    - 获取可用工具列表                 │
│    - 构建工具定义                     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 4. AI调用                            │
│    AIBridgeService                   │
│    - 调用AI模型                       │
│    - 处理流式响应                     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 5. 工具执行（如果有工具调用）          │
│    ToolCallingService                │
│    - 解析工具调用                     │
│    - 执行工具                         │
│    - 返回结果                         │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 6. 多轮循环（如果需要）                │
│    - 将工具结果发送给AI               │
│    - AI生成下一步操作                 │
│    - 重复直到任务完成                 │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 7. 结果保存                          │
│    MessageService                    │
│    - 保存AI消息                       │
│    - 更新会话状态                     │
└─────────────────────────────────────┘
  ↓
SSE流式返回给前端
```

---

## 🛠️ 技术栈

### 核心技术

```
Node.js 18+          - 运行时
Express.js 4.18+     - Web框架
TypeScript 5.0+      - 类型安全
Sequelize 6.32+      - ORM框架
MySQL 8.0+           - 关系数据库
Redis 7.0+           - 缓存数据库
```

### AI集成

```
OpenAI API           - AI模型接口
豆包API              - 国产AI模型
Axios                - HTTP客户端
原生HTTP/HTTPS       - 性能优化
```

### 开发工具

```
Jest                 - 单元测试
Swagger              - API文档
Winston              - 日志管理
PM2                  - 进程管理
```

---

## 📚 相关文档

- [AI助手前端架构文档](./AI助手前端架构文档.md)
- [AI助手前后端交互文档](./AI助手前后端交互文档.md)
- [系统架构总览](./00-系统架构总览.md)
- [工具调用服务文档](./05-工具编排服务.md)
- [API分组映射服务文档](./15-API分组映射服务.md)

---

**文档维护**: AI助手开发团队  
**最后更新**: 2025-01-24

