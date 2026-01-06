# 重启后继续任务指引

**创建日期**: 2024-11-27  
**用途**: 重启对话后，将此文件内容发送给AI助手，即可继续未完成的任务

---

## 🎯 当前任务状态

**任务**: 修复 k.yyup.com/server 的 TypeScript 编译错误  
**进度**: 约 60% 完成  
**错误数**: 从 ~87 个减少到约 ~50 个

---

## ✅ 已完成的修复

1. **AI 调用链修复** - `unified-intelligence.service.ts` 现在正确调用 AI 服务
2. **服务模块** - 创建了必要的占位符服务文件
3. **控制器** - 修复了 `inspection-ai`, `unified-ai`, `tenant-token` 等控制器
4. **中间件** - 修复了 `user.middleware`, `conversation.middleware` 等
5. **路由** - 修复了 `function-tools.routes`, `tenant-token.routes` 等

---

## ❌ 待修复的问题

### 1. 模型属性问题
- `conversation.service.ts`: `model` 属性不存在于 `AIConversation`
- `feedback.service.ts`: `messageId` 属性不存在于 `AIFeedback`

### 2. 路由参数错误
- `ai-billing.routes.ts`: 参数类型不匹配
- `ai-mock.routes.ts`: 参数类型错误
- `function-tools.routes.ts`: `ChatCompletionParams` 不支持 `tools`
- `smart-expert.routes.ts`: 方法调用参数错误
- `message.routes.ts`: 参数数量错误

### 3. 服务方法缺失
- `video.routes.ts`: `generateVideo` 方法不存在

### 4. 类型冲突
- `express-extensions.ts`: `user` 属性类型冲突

---

## 📋 继续修复的命令

```bash
# 进入项目目录
cd /home/zhgue/kyyupgame/k.yyup.com/server

# 检查当前错误数量
npx tsc --noEmit 2>&1 | wc -l

# 查看具体错误
npx tsc --noEmit 2>&1 | head -80
```

---

## 🏗️ 项目架构

```
kyyupgame/
├── k.yyup.com/           # 幼儿园业务系统 (k.yyup.cc:3000)
│   ├── client/           # Vue3 前端
│   └── server/           # Node.js 后端 ← 当前修复重点
└── unified-tenant-system/ # 统一租户系统 (rent.yyup.cc:3001)
    ├── client/
    └── server/
```

### AI 调用链
```
前端 → k.yyup.com API → unified-intelligence.service 
    → ai-bridge.service → unified-tenant-ai-client 
    → HTTP → rent.yyup.cc:3001 → AI 大模型
```

---

## 🔐 统一认证、租户系统与 AI Bridge 关系说明（持续修复必读）

> 这一节是对「统一租户管理中心 + 幼儿园租户系统 + AI Bridge」关系的简要总结，
> 后续如果对话上下文丢失，可以只看这里快速恢复架构记忆。

### 1. 两个系统的职责分工

- **unified-tenant-system（租户管理中心，rent.yyup.cc）**
  - 统一管理租户（开通、域名、数据库配置）
  - 统一管理帐号（global_users）和用户-租户关系（user_tenant_relations）
  - 提供**统一认证服务**（手机号 + 密码校验）
  - 提供**统一 AI 服务**：模型配置、计费、usage 统计等

- **k.yyup.com（幼儿园租户业务系统，k.yyup.cc）**
  - 每个幼儿园一个独立数据库，存业务数据（学生、班级、活动等）
  - 只保存「本租户内用户」，并通过 `global_user_id` 关联到统一中心
  - 所有登录都委托给统一中心校验，然后自己发本地 JWT
  - 所有 AI 调用都走本地 `ai-bridge.service` → 统一中心 AI 服务

### 2. 统一认证流程（高层时序）

1. 用户访问租户域名（如 `k001.yyup.cc`），中间件根据域名解析出 `tenantCode`
2. 前端在 k.yyup.com 发起登录：提交手机号 + 密码
3. k.yyup.com 后端调用 **统一租户管理中心** 的认证接口：
   - 验证帐号密码
   - 在 unified-tenant-system 里维护 / 返回 `globalUserId`
4. k.yyup.com 根据 `tenantCode` 连接对应幼儿园数据库：
   - 查找或创建本地用户记录，并写入 `global_user_id`
5. k.yyup.com 使用本地用户信息生成**租户内 JWT**，后续所有业务接口统一用这个 JWT 授权：
   - `auth.middleware.ts` / `verifyToken` 负责：
     - 校验 JWT
     - 识别当前用户、角色、权限
     - 挂载到 `req.user`、`req.tenant`、`req.tenantDb`

> 关键点：**帐号口径以 unified-tenant-system 为准**，k.yyup.com 只是「租户局部视角」。

### 3. AI Bridge 的角色

- k.yyup.com 不再直接调用具体大模型，只调用本地 **`ai-bridge.service`**：
  - 提供 `generateChatCompletion` / `generateChatCompletionStream`
  - 提供多模态接口：`generateImage` / `generateVideo` / `speechToText` / `textToSpeech` 等
  - 内部统一调用 **unified-tenant-system 的 AI 接口**，并携带当前租户/用户的 token
- unified-tenant-system 在 AI 层负责：
  - 选择具体模型（供应商、模型版本、温度等）
  - 统一记录 usage / 计费 / 日志
  - 做安全审计和错误处理

> 关键点：**所有 AI 请求必须经过 AI Bridge → unified-tenant-system**，不允许在 k.yyup.com 里直接调用具体模型供应商。

### 4. 修复 TS 错误时需要牢记的原则

1. 任何涉及用户身份的逻辑：
   - 只相信 `req.user` / `req.tenant` 这套统一中间件注入的上下文
   - 不再自己「重新做一套登录/鉴权」
2. 任何 AI 相关的服务 / 控制器 / 路由：
   - 只能通过 `ai-bridge.service` / 统一 AI 服务间接访问模型
   - 需要为 unified-tenant-system 提供足够的 **tenant / user / scene** 信息，用于计费和策略
3. 修改模型 / Service / Controller 之间的类型时：
   - 以 **Sequelize 模型定义** 和 **统一 AI / 统一认证的设计** 为准
   - 尽量不要引入新的字段，如果确实需要，应优先放到 `metadata` 这类 JSON 字段里

后续如果需要继续修复 TypeScript 错误，可以直接基于本节理解架构，无需重新查阅大量代码。

---

## 💬 重启后发送给AI的消息模板

```
请继续修复 TypeScript 编译错误。

当前状态：
- 错误从 ~87 个降到约 ~50 个
- 已修复 AI 调用链、控制器、中间件等

待修复：
1. AIConversation 模型缺少 model 属性
2. AIFeedback 模型缺少 messageId 属性
3. 多个路由文件的参数类型错误
4. multimodal.service 缺少 generateVideo 方法

请先运行 npx tsc --noEmit 查看当前错误，然后继续修复。
```

---

**Git 提交状态**: ✅ 已提交 (commit: 9f0ad96c)

