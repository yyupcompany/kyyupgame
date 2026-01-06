# YYAI智能助手系统介绍 - 集成指南

## 📋 概述

本文档说明如何在AI助手中集成系统介绍功能，当用户询问"你是谁"、"你能做什么"等问题时，自动返回友好的系统介绍。

---

## 📁 相关文件

### 1. 配置文件

**`server/src/services/ai/system-introduction.config.ts`**
- 系统介绍的核心配置
- 包含所有功能介绍、示例、FAQ等
- 提供检测和生成函数

### 2. 文档文件

**`docs/ai/SYSTEM_INTRODUCTION_PROMPT.md`**
- 完整的系统介绍文档
- 用户友好的语言
- 详细的功能说明

### 3. 测试文件

**`test-system-introduction.js`**
- 测试系统介绍检测功能
- 验证生成的介绍内容

---

## 🔧 集成方法

### 方法1: 在AI消息服务中集成

在 `server/src/services/ai/message.service.ts` 中添加检测逻辑:

```typescript
import { isAskingAboutSystem, generateSystemIntroduction } from './system-introduction.config';

// 在处理用户消息前检测
async processMessage(userId: string, message: string) {
  // 检测是否询问系统介绍
  if (isAskingAboutSystem(message)) {
    const introduction = generateSystemIntroduction();
    
    return {
      success: true,
      data: {
        response: introduction,
        type: 'system_introduction',
        ui_instruction: {
          type: 'render_markdown',
          content: introduction
        }
      }
    };
  }
  
  // 继续正常处理...
}
```

### 方法2: 作为工具集成

创建一个专门的系统介绍工具:

```typescript
// server/src/services/ai/tools/system-introduction.tool.ts
import { ToolDefinition, ToolResult } from './types/tool.types';
import { generateSystemIntroduction } from '../system-introduction.config';

const systemIntroductionTool: ToolDefinition = {
  name: "get_system_introduction",
  description: "获取YYAI智能助手的系统介绍，包括功能说明、使用示例等",
  category: "system",
  weight: 10,
  parameters: {
    type: "object",
    properties: {},
    required: []
  },
  
  implementation: async (args: any): Promise<ToolResult> => {
    const introduction = generateSystemIntroduction();
    
    return {
      name: "get_system_introduction",
      status: "success",
      result: {
        introduction,
        ui_instruction: {
          type: 'render_markdown',
          content: introduction
        }
      }
    };
  }
};

export default systemIntroductionTool;
```

### 方法3: 在直接响应服务中集成

在 `server/src/services/ai/direct-response.service.ts` 中添加:

```typescript
import { isAskingAboutSystem, generateSystemIntroduction } from './system-introduction.config';

canHandleDirectly(query: string): boolean {
  // 检测系统介绍问题
  if (isAskingAboutSystem(query)) {
    return true;
  }
  
  // 其他检测逻辑...
}

async handleDirectResponse(query: string) {
  // 处理系统介绍
  if (isAskingAboutSystem(query)) {
    return {
      canHandle: true,
      response: generateSystemIntroduction(),
      confidence: 1.0,
      type: 'system_introduction'
    };
  }
  
  // 其他处理逻辑...
}
```

---

## 🎯 检测逻辑

### 触发关键词

系统会检测以下关键词:

| 类别 | 关键词 |
|------|--------|
| 身份询问 | 你是谁、你是什么、你叫什么、你的名字 |
| 功能询问 | 你能做什么、你会做什么、你可以做什么 |
| 功能列表 | 有什么功能、有哪些功能、功能介绍 |
| 使用方法 | 怎么用、如何使用、使用方法 |
| 问候 | 你好、介绍一下、自我介绍 |

### 检测函数

```typescript
function isAskingAboutSystem(query: string): boolean {
  const keywords = [
    '你是谁', '你是什么', '你叫什么', '你的名字',
    '你能做什么', '你会做什么', '你可以做什么',
    '有什么功能', '有哪些功能', '功能介绍',
    '怎么用', '如何使用', '使用方法',
    '你好', '介绍一下', '自我介绍'
  ];
  
  const lowerQuery = query.toLowerCase().trim();
  return keywords.some(keyword => lowerQuery.includes(keyword));
}
```

---

## 📝 系统介绍内容结构

### 1. 简短自我介绍

```
你好！我是 **YYAI智能助手**，专门为幼儿园管理系统设计的AI助手。
我的使命是让幼儿园管理变得更简单、更智能！
```

### 2. 六大核心能力

- 📊 查询和统计数据
- 📝 管理数据
- 🎯 智能推荐和分析
- 🖼️ 生成海报和内容
- 📅 日程和任务管理
- 🔍 智能搜索

### 3. 四大特色功能

- ✨ 自然语言交流
- 🧠 智能理解
- 🚀 快速响应
- 📊 多种展示方式

### 4. 使用场景示例

- 园长查看运营数据
- 教师查询班级信息
- 招生老师跟进客户
- 活动策划

### 5. 限制说明

- 不能做的事情
- 安全提醒

### 6. 交流技巧

- 直接说出需求
- 可以追问和补充
- 可以要求不同展示方式

### 7. 优势

- 🎓 专业
- 🚀 高效
- 🧠 智能
- 🎨 友好

### 8. 常见问题 (FAQ)

- 我需要学习特殊的命令吗？
- 如果我说得不够清楚怎么办？
- 我可以问任何问题吗？
- 我的数据安全吗？
- 如果我不满意结果怎么办？

### 9. 开始使用建议

- 提供示例问题
- 鼓励用户尝试

---

## 🎨 展示方式

### 推荐展示格式

**Markdown格式** - 支持丰富的格式化:
- 标题层级
- 列表
- 粗体/斜体
- Emoji图标
- 代码块

### UI指令

```typescript
{
  type: 'render_markdown',
  content: introduction,
  title: 'YYAI智能助手介绍',
  showInPanel: true
}
```

---

## 🧪 测试

### 运行测试脚本

```bash
node test-system-introduction.js
```

### 测试用例

| 用户输入 | 应该触发 | 实际结果 |
|---------|---------|---------|
| "你是谁" | ✅ 是 | ✅ 触发 |
| "你能做什么" | ✅ 是 | ✅ 触发 |
| "有什么功能" | ✅ 是 | ✅ 触发 |
| "你好" | ✅ 是 | ✅ 触发 |
| "介绍一下自己" | ✅ 是 | ✅ 触发 |
| "查询学生" | ❌ 否 | ✅ 不触发 |
| "统计数据" | ❌ 否 | ✅ 不触发 |

---

## 📊 使用统计

建议记录系统介绍的使用情况:

```typescript
// 记录系统介绍查看次数
await logSystemIntroductionView({
  userId,
  timestamp: new Date(),
  query: message,
  source: 'chat' // 或 'tool', 'direct_response'
});
```

---

## 🔄 更新维护

### 何时更新系统介绍

1. **新增功能时** - 添加到相应的能力分类
2. **功能变更时** - 更新示例和说明
3. **用户反馈时** - 优化语言和示例
4. **FAQ增加时** - 添加新的常见问题

### 更新步骤

1. 修改 `server/src/services/ai/system-introduction.config.ts`
2. 更新 `docs/ai/SYSTEM_INTRODUCTION_PROMPT.md`
3. 运行测试脚本验证
4. 重新编译后端代码
5. 提交Git

---

## 💡 最佳实践

### 1. 语言风格

- ✅ 使用通俗易懂的语言
- ✅ 避免技术术语
- ✅ 使用友好的语气
- ✅ 提供具体示例

### 2. 内容组织

- ✅ 分类清晰
- ✅ 层次分明
- ✅ 重点突出
- ✅ 易于浏览

### 3. 示例选择

- ✅ 贴近实际使用场景
- ✅ 覆盖主要功能
- ✅ 简单易懂
- ✅ 可直接使用

### 4. 响应速度

- ✅ 优先检测系统介绍问题
- ✅ 直接返回，不调用AI
- ✅ 缓存生成的介绍内容

---

## 🎯 集成检查清单

在集成系统介绍功能时，确保：

- [ ] 导入了 `system-introduction.config.ts`
- [ ] 添加了 `isAskingAboutSystem()` 检测
- [ ] 调用了 `generateSystemIntroduction()` 生成内容
- [ ] 设置了正确的UI指令（Markdown渲染）
- [ ] 测试了各种触发关键词
- [ ] 验证了不会误触发普通查询
- [ ] 记录了使用统计
- [ ] 更新了相关文档

---

## 📚 相关文档

- `docs/ai/SYSTEM_INTRODUCTION_PROMPT.md` - 完整系统介绍文档
- `docs/ai/QUERY_TOOLS_FALLBACK_MECHANISM.md` - 查询工具回退机制
- `docs/ai/API_GROUPING_OPTIMIZATION_REPORT.md` - API分组优化报告

---

**版本**: 1.0.0  
**创建时间**: 2025-10-10  
**作者**: AI Assistant  
**状态**: ✅ 已实现

