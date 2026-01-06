# Unified Intelligence Service 重构方案

## 🎯 目标
将8000行的巨大 `unified-intelligence.service.ts` 拆分为职责单一的小文件，提高可维护性和可读性。

## 📋 当前文件分析
- **文件大小**: 309KB, 8146行
- **主要职责**: AI智能决策、工具执行、流式处理、记忆管理
- **问题**: 单一文件承担过多职责，难以维护

## 🏗️ 拆分架构设计

### 📁 目录结构
```
server/src/services/ai-operator/
├── unified-intelligence.service.ts          # 主服务文件（重构后，只负责协调）
├── types/                                    # 类型定义
│   ├── ai-unified.types.ts                 # AI相关类型
│   ├── request.types.ts                    # 请求处理类型
│   └── response.types.ts                   # 响应处理类型
├── core/                                    # 核心服务
│   ├── model-selection.service.ts           # 模型选择服务
│   ├── prompt-builder.service.ts            # 提示词构建服务
│   ├── memory-integration.service.ts        # 记忆集成服务
│   ├── intent-recognition.service.ts        # 意图识别服务
│   └── security-checker.service.ts          # 安全检查服务
├── tools/                                   # 工具管理
│   ├── tool-loader.service.ts               # 工具加载器
│   ├── tool-executor.service.ts             # 工具执行器
│   ├── tool-validator.service.ts            # 工具验证器
│   └── tool-narrator.service.ts            # 工具解说器
├── streaming/                               # 流式处理
│   ├── sse-handler.service.ts               # SSE事件处理
│   ├── event-dispatcher.service.ts          # 事件分发器
│   └── response-formatter.service.ts        # 响应格式化
├── execution/                               # 执行引擎
│   ├── single-round.executor.ts             # 单次执行器
│   ├── multi-round.executor.ts              # 多轮执行器
│   └── workflow.executor.ts                 # 工作流执行器
├── utils/                                   # 工具函数
│   ├── token-estimator.util.ts             # Token估算器
│   ├── model-config.util.ts                # 模型配置工具
│   └── context-builder.util.ts              # 上下文构建器
└── config/                                  # 配置文件
    ├── ai-models.config.ts                 # AI模型配置
    └── tool-categories.config.ts            # 工具分类配置
```

## 📋 拆分计划

### 🎯 Phase 1: 类型定义拆分
1. **类型文件** (`types/`)
   - `ai-unified.types.ts` - AI相关接口和枚举
   - `request.types.ts` - 请求处理类型
   - `response.types.ts` - 响应处理类型

### 🎯 Phase 2: 核心服务拆分
2. **模型选择** (`core/model-selection.service.ts`)
   - `selectModelForTool()` 方法
   - `determineExecutionPhase()` 方法
   - `getDoubaoModelConfig()` 方法

3. **提示词构建** (`core/prompt-builder.service.ts`)
   - `buildSystemPrompt()` 方法
   - `buildToolSpecificPrompts()` 方法
   - `compressPrompt()` 方法

4. **记忆集成** (`core/memory-integration.service.ts`)
   - `retrieveRelevantMemories()` 方法
   - `storeMemory()` 方法

5. **意图识别** (`core/intent-recognition.service.ts`)
   - `analyzeRequest()` 方法
   - `extractActionFromQuery()` 方法
   - `evaluateQueryComplexity()` 方法

6. **安全检查** (`core/security-checker.service.ts`)
   - `performSecurityCheck()` 方法
   - `validateRequest()` 方法

### 🎯 Phase 3: 工具管理拆分
7. **工具执行** (`tools/tool-executor.service.ts`)
   - `executeFunctionTool()` 方法
   - `executeToolWithValidation()` 方法

8. **工具验证** (`tools/tool-validator.service.ts`)
   - `validateToolChoice()` 方法
   - `checkToolPermissions()` 方法

9. **工具解说** (`tools/tool-narrator.service.ts`)
   - `generateToolIntent()` 方法
   - `narrateToolIntent()` 方法

### 🎯 Phase 4: 流式处理拆分
10. **SSE处理** (`streaming/sse-handler.service.ts`)
    - `processUserRequestStreamSingleRound()` 方法
    - `processUserRequestStream()` 方法
    - SSE事件发送逻辑

11. **事件分发** (`streaming/event-dispatcher.service.ts`)
    - 事件类型处理
    - 事件路由逻辑

### 🎯 Phase 5: 执行引擎拆分
12. **单次执行** (`execution/single-round.executor.ts`)
    - `callDoubaoSingleRoundSSE()` 方法
    - `callDoubaoStreamAPI()` 方法
    - `callDoubaoAfcLoopSSE()` 方法

13. **多轮执行** (`execution/multi-round.executor.ts`)
    - 多轮执行逻辑
    - 上下文管理

### 🎯 Phase 6: 工具函数拆分
14. **Token估算** (`utils/token-estimator.util.ts`)
    - `estimateTokenCount()` 方法
    - Token使用统计

15. **上下文构建** (`utils/context-builder.util.ts`)
    - 上下文构建逻辑
    - 消息历史处理

### 🎯 Phase 7: 主服务重构
16. **主服务协调器** (`unified-intelligence.service.ts`)
    - 只保留核心协调逻辑
    - 作为各个服务的组合器
    - 提供统一的对外接口

## 🔧 重构原则

1. **单一职责**: 每个文件只负责一个明确的功能
2. **依赖注入**: 通过构造函数注入依赖
3. **接口抽象**: 定义清晰的接口契约
4. **参数传递**: 避免全局状态，通过参数传递数据
5. **错误处理**: 统一的错误处理机制
6. **日志记录**: 结构化的日志记录
7. **测试友好**: 易于单元测试

## 📊 预期效果

- **文件大小**: 主文件从8000行减少到500行以内
- **可维护性**: 每个文件职责单一，易于理解和修改
- **可测试性**: 每个模块可以独立测试
- **可扩展性**: 新功能可以独立模块开发
- **团队协作**: 不同功能可以并行开发

## 🚀 执行步骤

1. **备份原文件** ✅
2. **创建目录结构**
3. **按Phase顺序拆分**
4. **更新依赖注入**
5. **重构主服务文件**
6. **更新测试用例**
7. **验证功能正常**