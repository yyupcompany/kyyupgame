# AI助手提示词模板系统

本目录包含AI助手的所有提示词模板，采用模块化架构，便于维护和复用。

---

## 📁 目录结构

```
prompts/
├── base/                           # 基础提示词模板
│   ├── base-system.template.ts     # 基础系统提示词
│   ├── direct-mode.template.ts     # 直连模式提示词
│   └── index.ts                    # 导出文件
├── tools/                          # 工具相关提示词模板
│   ├── tool-calling-rules.template.ts      # 工具调用规则
│   ├── database-query-guide.template.ts    # 数据查询指南
│   ├── ui-rendering-guide.template.ts      # UI渲染指南
│   ├── navigation-guide.template.ts        # 页面导航指南
│   ├── workflow-guide.template.ts          # 工作流指南
│   ├── response-format-guide.template.ts   # 响应格式指南
│   └── index.ts                            # 导出文件
├── documents/                      # 文档生成提示词（在PromptBuilderService中定义）
└── index.ts                        # 统一导出入口
```

---

## 🎯 模板系统架构

### 核心原则

1. **分离关注点** - 提示词与业务逻辑完全分离
2. **模块化管理** - 每个功能模块独立的提示词文件
3. **易于维护** - 修改提示词不影响业务代码
4. **版本控制友好** - 提示词变更易于追踪和回滚
5. **可复用性** - 支持模板变量和组合使用

### 工作流程

```
用户请求
    ↓
统一智能服务 (unified-intelligence.service.ts)
    ↓
提示词构建服务 (PromptBuilderService)
    ↓
加载相关模板 (prompts/*.template.ts)
    ↓
组合生成完整提示词
    ↓
发送给AI模型
```

---

## 📋 模板说明

### 基础模板

#### 1. base-system.template.ts
**用途**: 定义AI助手的基本身份、核心能力和交互原则

**变量**:
- `currentDate` - 当前日期
- `userRole` - 用户角色

**使用场景**: 所有模式的基础提示词

#### 2. direct-mode.template.ts
**用途**: 直连聊天模式的系统提示词，引导用户开启智能代理

**变量**:
- `organizationStatus` - 机构现状数据
- `toolSelectionTree` - 工具选择决策树

**使用场景**: 当`enableTools=false`时使用

---

### 工具相关模板

#### 1. tool-calling-rules.template.ts
**用途**: 定义工具调用的基本规则和规范

**核心内容**:
- 并发执行 vs 顺序执行规则
- 依赖关系判断方法
- 工具失败降级策略
- 何时停止工具调用

#### 2. database-query-guide.template.ts
**用途**: 指导AI如何选择和使用数据查询工具

**核心内容**:
- read_data_record vs any_query 选择规则
- 工具选择决策树
- 支持的实体类型

#### 3. ui-rendering-guide.template.ts
**用途**: 指导AI如何使用render_component工具渲染UI组件

**核心内容**:
- 分两步调用：先查询数据，再渲染组件
- 支持的组件类型（data-table、chart、stat-card、todo-list）
- 正确和错误的调用示例

**⚠️ 关键修复**: 明确说明render_component不会自动查询数据

#### 4. navigation-guide.template.ts
**用途**: 指导AI如何使用navigate_to_page工具

**核心内容**:
- 支持的页面列表
- 调用方式示例
- 使用场景识别

#### 5. workflow-guide.template.ts
**用途**: 指导AI如何使用execute_activity_workflow工具

**核心内容**:
- 一键完成活动创建全流程
- 何时使用工作流工具
- 不要创建TodoList分解任务

#### 6. response-format-guide.template.ts
**用途**: 定义AI回复的格式规范

**核心内容**:
- 友好的用户交互方式
- 避免返回技术性JSON
- 数据呈现规范
- 错误处理规范

---

## 🔧 使用方法

### 在PromptBuilderService中

```typescript
// 构建智能代理模式提示词
const agentPrompt = promptBuilderService.buildAgentModePrompt(
  userRole,
  organizationStatus,
  toolSelectionTree
);

// 构建直连模式提示词
const directPrompt = promptBuilderService.buildDirectModePrompt(
  organizationStatus,
  toolSelectionTree
);
```

### 添加新模板

1. 在相应目录创建新的 `.template.ts` 文件
2. 导出模板对象（包含name、description、variables、template）
3. 在对应的 `index.ts` 中导出
4. 在 `PromptBuilderService.initializeDefaultTemplates()` 中注册
5. 在构建方法中使用新模板

---

## ✅ 优势

### 相比硬编码提示词

1. **易于维护** - 修改提示词只需编辑模板文件
2. **版本控制** - Git可以清晰追踪提示词变更
3. **团队协作** - 多人可以同时修改不同模板
4. **测试友好** - 可以独立测试每个模板
5. **代码整洁** - 业务逻辑文件保持简洁

### 模块化带来的好处

1. **按需组合** - 根据不同模式组合不同模板
2. **灵活替换** - 可以为不同场景使用不同模板
3. **重复利用** - 同一模板可在多个地方使用
4. **易于扩展** - 添加新功能只需添加新模板

---

## 📊 模板统计

- **基础模板**: 2个
- **工具模板**: 6个
- **文档模板**: 4个（在PromptBuilderService中定义）
- **总计**: 12个模板

---

## 🔄 迁移说明

### 原来的问题

- 提示词硬编码在 `unified-intelligence.service.ts` 的 `buildSystemPrompt` 方法中
- 约800行提示词代码混杂在业务逻辑中
- 难以维护、测试和协作

### 迁移后的改进

- 提示词独立在 `prompts/` 目录中
- 业务逻辑代码减少800行
- `unified-intelligence.service.ts` 只负责调用模板服务
- 提示词修改不影响业务逻辑

---

## 📝 后续优化建议

1. **添加提示词版本管理** - 记录每个模板的版本号
2. **支持A/B测试** - 同一模板的不同版本对比测试
3. **提示词性能分析** - 分析不同提示词对AI回答质量的影响
4. **动态模板加载** - 支持从配置文件或数据库加载模板
5. **提示词国际化** - 支持多语言提示词模板

---

**创建日期**: 2025-11-05  
**版本**: 1.0.0  
**状态**: ✅ 已完成重构

