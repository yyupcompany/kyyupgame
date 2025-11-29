# API调试

<cite>
**本文档引用的文件**
- [.env](file://k.yyup.com/.env)
- [.env.development](file://k.yyup.com/.env.development)
- [.env.production](file://k.yyup.com/.env.production)
- [error.middleware.ts](file://k.yyup.com/server/src/middlewares/error.middleware.ts)
- [debug-log.middleware.ts](file://k.yyup.com/server/src/middlewares/debug-log.middleware.ts)
- [auth.middleware.ts](file://k.yyup.com/server/src/middlewares/auth.middleware.ts)
- [api-route-scan.mjs](file://k.yyup.com/api-route-scan.mjs)
- [backend-route-scanner.py](file://k.yyup.com/backend-route-scanner.py)
</cite>

## 目录
1. [API调试概述](#api调试概述)
2. [API调用流程调试](#api调用流程调试)
3. [API配置调试](#api配置调试)
4. [端点调试技术](#端点调试技术)
5. [错误处理机制调试](#错误处理机制调试)
6. [性能监控技巧](#性能监控技巧)

## API调试概述

k.yyupgame系统提供了一套完整的API调试机制，包括请求拦截、参数解析、响应生成、错误处理和性能监控等功能。本指南详细说明了如何调试API调用流程，配置API参数，测试具体端点，分析错误处理机制以及监控系统性能。

**本节来源**
- [error.middleware.ts](file://k.yyup.com/server/src/middlewares/error.middleware.ts)
- [debug-log.middleware.ts](file://k.yyup.com/server/src/middlewares/debug-log.middleware.ts)
- [auth.middleware.ts](file://k.yyup.com/server/src/middlewares/auth.middleware.ts)

## API调用流程调试

### 请求拦截与日志记录

系统提供了调试日志中间件，用于拦截和记录API请求的详细信息。`apiDebugLogger`中间件会记录请求方法、URL、请求头和令牌信息。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant Middleware as "调试日志中间件"
participant Server as "服务器"
Client->>Middleware : 发送API请求
Middleware->>Middleware : 记录请求方法和URL
Middleware->>Middleware : 记录请求头信息
Middleware->>Middleware : 解析并记录令牌负载
Middleware->>Middleware : 验证令牌有效性
Middleware->>Server : 继续处理请求
```

**图示来源**
- [debug-log.middleware.ts](file://k.yyup.com/server/src/middlewares/debug-log.middleware.ts)

### 参数解析与验证

系统通过中间件链对请求参数进行解析和验证。`error.middleware.ts`文件中的`sanitizeBody`函数会清理请求体中的敏感信息，如密码和令牌。

```mermaid
flowchart TD
Start([开始]) --> ExtractHeaders["提取请求头"]
ExtractHeaders --> ExtractBody["提取请求体"]
ExtractBody --> Sanitize["清理敏感信息"]
Sanitize --> Validate["验证参数"]
Validate --> Process["处理请求"]
Process --> End([结束])
```

**图示来源**
- [error.middleware.ts](file://k.yyup.com/server/src/middlewares/error.middleware.ts)

### 响应生成流程

API响应生成遵循统一的格式标准，包括成功响应和错误响应。错误处理中间件会捕获异常，记录日志，并返回结构化的错误信息。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant Server as "服务器"
participant Logger as "日志系统"
Client->>Server : 发送请求
Server->>Server : 处理业务逻辑
alt 发生错误
Server->>Logger : 记录错误详情
Logger-->>Server : 确认记录
Server->>Client : 返回结构化错误响应
else 正常处理
Server->>Client : 返回成功响应
end
```

**图示来源**
- [error.middleware.ts](file://k.yyup.com/server/src/middlewares/error.middleware.ts)

## API配置调试

### 环境变量配置

系统使用环境变量进行API配置，主要配置文件包括`.env`、`.env.development`和`.env.production`。

```mermaid
graph TB
subgraph "环境配置"
DevEnv[".env.development"]
ProdEnv[".env.production"]
BaseEnv[".env"]
end
DevEnv --> |开发环境API基础URL| APIBaseURL["VITE_API_BASE_URL"]
ProdEnv --> |生产环境API基础URL| APIBaseURL
DevEnv --> |WebSocket URL| WSURL["VITE_WS_URL"]
ProdEnv --> |WebSocket URL| WSURL
BaseEnv --> |JWT密钥| JWTSecret["JWT_SECRET"]
```

**图示来源**
- [.env](file://k.yyup.com/.env)
- [.env.development](file://k.yyup.com/.env.development)
- [.env.production](file://k.yyup.com/.env.production)

### 路由配置检查

系统提供了路由扫描工具来检查API路由配置。可以使用`api-route-scan.mjs`和`backend-route-scanner.py`脚本分析路由定义。

```mermaid
flowchart LR
ScanScript["路由扫描脚本"] --> ReadFiles["读取路由文件"]
ReadFiles --> ParseRoutes["解析路由定义"]
ParseRoutes --> Validate["验证路由配置"]
Validate --> GenerateReport["生成路由报告"]
GenerateReport --> Output["输出结果"]
```

**图示来源**
- [api-route-scan.mjs](file://k.yyup.com/api-route-scan.mjs)
- [backend-route-scanner.py](file://k.yyup.com/backend-route-scanner.py)

### 中间件链检查

API请求经过一系列中间件处理，形成中间件链。认证中间件`auth.middleware.ts`实现了统一的认证流程。

```mermaid
flowchart TD
Request["API请求"] --> InternalCheck["检查内部服务调用"]
InternalCheck --> |是| SetInternalUser["设置内部用户信息"]
InternalCheck --> |否| CheckAuthHeader["检查认证头"]
CheckAuthHeader --> |无令牌| Return401["返回401"]
CheckAuthHeader --> |有令牌| CallUnifiedAuth["调用统一认证API"]
CallUnifiedAuth --> |验证成功| FindTenantUser["查找租户用户"]
CallUnifiedAuth --> |验证失败| Return401
FindTenantUser --> |用户存在| UseExistingUser["使用现有用户"]
FindTenantUser --> |用户不存在| CreateUser["创建新用户"]
UseExistingUser --> GetUserRole["获取用户角色"]
CreateUser --> GetUserRole
GetUserRole --> BuildUserObject["构建用户对象"]
BuildUserObject --> NextMiddleware["继续处理"]
```

**图示来源**
- [auth.middleware.ts](file://k.yyup.com/server/src/middlewares/auth.middleware.ts)

## 端点调试技术

### 使用Postman或curl测试

可以使用Postman或curl工具测试API端点。以下是使用curl测试的示例：

```bash
curl -X GET https://k.yyup.cc/api/users \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

### 请求头分析

调试时需要重点关注以下请求头：

- `Authorization`: 认证令牌，格式为"Bearer <token>"
- `Content-Type`: 请求体类型，通常为"application/json"
- `X-Internal-Service`: 内部服务调用标识

### 查询参数和请求体分析

系统对查询参数和请求体进行严格验证。调试时应注意：

1. 查询参数的格式和类型
2. 请求体的JSON结构
3. 必填字段和可选字段
4. 数据类型验证

## 错误处理机制调试

### 异常捕获与处理

错误处理中间件`error.middleware.ts`捕获所有未处理的异常，并返回统一格式的错误响应。

```mermaid
flowchart TD
Error["发生异常"] --> GenerateID["生成唯一错误ID"]
GenerateID --> AnalyzeError["分析错误类型和严重程度"]
AnalyzeError --> StructureContext["结构化错误上下文"]
StructureContext --> LogError["记录错误日志"]
LogError --> DetermineStatus["确定HTTP状态码"]
DetermineStatus --> GenerateMessage["生成用户友好消息"]
GenerateMessage --> BuildResponse["构建错误响应"]
BuildResponse --> SendResponse["发送响应"]
```

**图示来源**
- [error.middleware.ts](file://k.yyup.com/server/src/middlewares/error.middleware.ts)

### 错误日志记录

系统记录详细的错误日志，包括：

- 错误ID（用于追踪）
- 错误类型
- 请求信息（方法、URL、用户代理、IP）
- 请求参数（查询、参数、请求体）
- 错误详情（名称、消息、代码、堆栈）

### HTTP状态码分析

系统使用标准的HTTP状态码，并定义了对应的错误代码：

| 状态码 | 错误代码 | 用户消息 |
|--------|---------|---------|
| 400 | BAD_REQUEST | 请求参数错误，请检查输入信息 |
| 401 | UNAUTHORIZED | 登录已过期，请重新登录 |
| 403 | FORBIDDEN | 没有权限执行此操作 |
| 404 | NOT_FOUND | 请求的资源不存在 |
| 500 | INTERNAL_SERVER_ERROR | 服务器内部错误，我们将尽快修复 |

**图示来源**
- [error.middleware.ts](file://k.yyup.com/server/src/middlewares/error.middleware.ts)

## 性能监控技巧

### 响应时间测量

可以通过以下方法测量API响应时间：

1. 使用浏览器开发者工具的网络面板
2. 使用curl的`-w`参数
3. 在代码中添加时间戳日志

```bash
curl -w "响应时间: %{time_total}s\n" -o /dev/null -s https://k.yyup.cc/api/endpoint
```

### 瓶颈识别

通过分析日志和监控数据识别性能瓶颈：

1. 数据库查询性能
2. 外部API调用延迟
3. 复杂业务逻辑处理时间
4. 内存使用情况

```mermaid
flowchart LR
Monitor["性能监控"] --> Collect["收集指标"]
Collect --> Database["数据库查询时间"]
Collect --> ExternalAPI["外部API响应时间"]
Collect --> Processing["业务逻辑处理时间"]
Collect --> Memory["内存使用"]
Collect --> Analyze["分析瓶颈"]
Analyze --> Optimize["优化建议"]
```

**本节来源**
- [error.middleware.ts](file://k.yyup.com/server/src/middlewares/error.middleware.ts)
- [debug-log.middleware.ts](file://k.yyup.com/server/src/middlewares/debug-log.middleware.ts)
- [auth.middleware.ts](file://k.yyup.com/server/src/middlewares/auth.middleware.ts)