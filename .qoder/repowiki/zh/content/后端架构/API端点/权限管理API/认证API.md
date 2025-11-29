# 认证API

<cite>
**本文档引用的文件**  
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)
- [auth.ts](file://k.yyup.com/client/src/api/modules/auth.ts)
- [auth.ts](file://unified-tenant-system/client/src/api/modules/auth.ts)
- [endpoints/auth.ts](file://k.yyup.com/client/src/api/endpoints/auth.ts)
- [types/auth.ts](file://k.yyup.com/client/src/types/auth.ts)
- [utils/auth.ts](file://k.yyup.com/client/src/utils/auth.ts)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构概述](#架构概述)
5. [详细组件分析](#详细组件分析)
6. [依赖分析](#依赖分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)

## 简介
本文档详细描述了系统的认证API，涵盖用户登录、登出、令牌刷新和会话管理等核心功能。文档重点说明了JWT令牌的生成与验证流程、多租户环境下的用户身份映射机制以及安全最佳实践。系统采用统一认证服务与租户本地用户数据库相结合的方式，确保跨租户身份的一致性与安全性。

## 项目结构
认证功能分布在客户端与服务端多个模块中，采用分层架构设计，分离接口定义、业务逻辑与工具函数。

```mermaid
flowchart TD
subgraph "客户端"
A["api/modules/auth.ts<br/>认证接口定义"]
B["api/endpoints/auth.ts<br/>API端点配置"]
C["utils/auth.ts<br/>本地存储工具"]
D["types/auth.ts<br/>类型定义"]
end
subgraph "服务端"
E["auth-shared-pool-example.middleware.ts<br/>认证中间件"]
end
A --> C
A --> B
E --> A
```

**Diagram sources**
- [auth.ts](file://k.yyup.com/client/src/api/modules/auth.ts)
- [endpoints/auth.ts](file://k.yyup.com/client/src/api/endpoints/auth.ts)
- [utils/auth.ts](file://k.yyup.com/client/src/utils/auth.ts)
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)

**Section sources**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)
- [auth.ts](file://k.yyup.com/client/src/api/modules/auth.ts)
- [endpoints/auth.ts](file://k.yyup.com/client/src/api/endpoints/auth.ts)

## 核心组件
系统认证体系由客户端API封装、服务端中间件和统一认证服务三部分构成。客户端负责发起认证请求并管理本地会话状态，服务端中间件验证JWT令牌并映射租户用户上下文，统一认证服务处理核心的身份验证逻辑。

**Section sources**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)
- [auth.ts](file://k.yyup.com/client/src/api/modules/auth.ts)

## 架构概述
系统采用基于JWT的无状态认证架构，结合多租户数据库隔离策略，实现安全高效的用户身份验证。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant Gateway as "API网关"
participant AuthService as "统一认证服务"
participant TenantDB as "租户数据库"
Client->>Gateway : POST /api/auth/login<br/>{phone, password}
Gateway->>AuthService : 验证用户凭证
AuthService-->>Gateway : 返回全局用户信息和JWT
Gateway->>TenantDB : 查询租户内用户映射
alt 用户存在
TenantDB-->>Gateway : 返回租户用户信息
else 用户不存在
Gateway->>TenantDB : 自动创建租户用户
TenantDB-->>Gateway : 返回新用户信息
end
Gateway-->>Client : 返回token和用户信息
Client->>Gateway : 带Bearer Token的请求
Gateway->>AuthService : 验证JWT有效性
AuthService-->>Gateway : 验证结果
Gateway->>TenantDB : 根据全局ID查询租户用户
TenantDB-->>Gateway : 返回用户上下文
Gateway->>Client : 处理原始请求
```

**Diagram sources**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)
- [auth.ts](file://k.yyup.com/client/src/api/modules/auth.ts)

## 详细组件分析

### 客户端认证模块分析
客户端通过模块化方式组织认证逻辑，分离接口、类型和本地状态管理。

#### 接口定义
```mermaid
classDiagram
class LoginRequest {
+username : string
+password : string
}
class LoginResponse {
+token : string
+refreshToken? : string
+user : User
}
class User {
+id : string | number
+username : string
+email? : string
+realName? : string
+phone? : string
+role? : string
+roles : Role[]
+permissions? : string[]
}
class Role {
+id : string | number
+name : string
+code : string
}
class authApi {
+login(data : LoginRequest) : Promise~ApiResponse~LoginResponse~~
+logout() : Promise~ApiResponse~
+getUserInfo() : Promise~ApiResponse~User~~
+refreshToken(data : { refreshToken : string }) : Promise~ApiResponse~{ token : string; refreshToken? : string }~~
}
LoginResponse --> User
User --> Role : "包含"
authApi --> LoginRequest : "使用"
authApi --> LoginResponse : "返回"
```

**Diagram sources**
- [auth.ts](file://k.yyup.com/client/src/api/modules/auth.ts)
- [types/auth.ts](file://k.yyup.com/client/src/types/auth.ts)

#### 本地状态管理
```mermaid
flowchart TD
Start([应用启动]) --> CheckLogin["检查本地登录状态"]
CheckLogin --> HasToken{"存在token?"}
HasToken --> |是| ValidateToken["验证token有效性"]
HasToken --> |否| ShowLogin["显示登录界面"]
ValidateToken --> TokenValid{"token有效?"}
TokenValid --> |是| FetchUserInfo["获取用户信息"]
TokenValid --> |否| ShowLogin
FetchUserInfo --> StoreInfo["存储用户信息"]
StoreInfo --> Home["跳转至首页"]
ShowLogin --> UserLogin["用户输入凭证"]
UserLogin --> SubmitLogin["提交登录请求"]
SubmitLogin --> LoginSuccess{"登录成功?"}
LoginSuccess --> |是| SaveToken["保存token"]
LoginSuccess --> |否| ShowError["显示错误信息"]
SaveToken --> StoreInfo
```

**Diagram sources**
- [utils/auth.ts](file://k.yyup.com/client/src/utils/auth.ts)

### 服务端认证中间件分析
服务端认证中间件实现了JWT验证、租户用户映射和上下文注入的完整流程。

#### Token验证流程
```mermaid
flowchart TD
A([接收请求]) --> B["获取Authorization头"]
B --> C{"头存在且以Bearer开头?"}
C --> |否| D["返回401 - 缺少令牌"]
C --> |是| E["提取JWT令牌"]
E --> F["调用统一认证服务验证令牌"]
F --> G{"验证成功?"}
G --> |否| H["返回401 - 令牌无效"]
G --> |是| I["获取全局用户信息"]
I --> J["获取租户代码"]
J --> K{"租户信息存在?"}
K --> |否| L["返回400 - 缺少租户信息"]
K --> |是| M["在租户数据库查询用户映射"]
M --> N{"用户存在?"}
N --> |否| O["在租户数据库创建新用户"]
N --> |是| P["获取现有用户信息"]
O --> Q["构建用户上下文对象"]
P --> Q
Q --> R["将用户上下文注入请求"]
R --> S["调用next()继续处理"]
```

**Diagram sources**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L19-L136)

#### 登录处理流程
```mermaid
flowchart TD
A([接收登录请求]) --> B["解析手机号和密码"]
B --> C{"凭证完整?"}
C --> |否| D["返回400 - 缺少凭证"]
C --> |是| E["调用统一认证服务验证用户"]
E --> F{"验证成功?"}
F --> |否| G["返回401 - 凭证无效"]
F --> |是| H["获取全局用户和JWT令牌"]
H --> I["在租户数据库查询用户映射"]
I --> J{"用户存在?"}
J --> |是| K["获取现有用户信息"]
J --> |否| L["在租户数据库创建新用户"]
L --> M["获取新用户信息"]
K --> N["构建响应数据"]
M --> N
N --> O["返回token和用户信息"]
O --> P([登录成功])
```

**Diagram sources**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L140-L253)

## 依赖分析
认证系统依赖多个外部服务和内部组件，形成清晰的依赖关系。

```mermaid
graph TD
Client --> AuthApi
AuthApi --> RequestUtil
AuthApi --> Endpoints
AuthApi --> Types
AuthApi --> LocalStorageUtil
LocalStorageUtil --> BrowserStorage
ServerMiddleware --> UnifiedAuthService
ServerMiddleware --> TenantDatabase
UnifiedAuthService --> UserDatabase
UnifiedAuthService --> TokenService
```

**Diagram sources**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)
- [auth.ts](file://k.yyup.com/client/src/api/modules/auth.ts)
- [utils/auth.ts](file://k.yyup.com/client/src/utils/auth.ts)

**Section sources**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)
- [auth.ts](file://k.yyup.com/client/src/api/modules/auth.ts)
- [utils/auth.ts](file://k.yyup.com/client/src/utils/auth.ts)

## 性能考虑
认证流程经过优化，采用连接池和缓存策略减少数据库查询开销。JWT验证为无状态操作，不依赖服务器会话存储，支持水平扩展。租户数据库查询使用参数化语句和索引，确保查询效率。

## 故障排除指南
常见认证问题包括令牌无效、租户信息缺失和用户映射失败。排查时应首先检查请求头格式，确认Authorization头以"Bearer "开头。其次验证租户上下文是否正确传递。最后检查统一认证服务的可用性及网络连通性。

**Section sources**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)
- [utils/auth.ts](file://k.yyup.com/client/src/utils/auth.ts)

## 结论
本认证系统通过JWT令牌、统一认证服务和租户用户映射机制，实现了安全、可扩展的多租户身份验证解决方案。系统设计考虑了自动用户创建、上下文注入和错误处理等关键场景，为应用程序提供了可靠的认证基础。