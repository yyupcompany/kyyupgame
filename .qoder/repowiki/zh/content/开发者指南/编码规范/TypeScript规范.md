# TypeScript规范

<cite>
**本文档引用的文件**  
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts)
- [database-initialization.ts](file://database-initialization.ts)
- [tenant-database-shared-pool.service.ts](file://tenant-database-shared-pool.service.ts)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts)
- [tsconfig.json](file://unified-tenant-system/tsconfig.json)
</cite>

## 目录
1. [简介](#简介)
2. [类型定义规范](#类型定义规范)
3. [模块导入导出规范](#模块导入导出规范)
4. [异步函数处理规范](#异步函数处理规范)
5. [类型守卫实现规范](#类型守卫实现规范)
6. [null和undefined安全处理](#null和undefined安全处理)
7. [any类型使用限制](#any类型使用限制)
8. [联合类型与交叉类型使用指导](#联合类型与交叉类型使用指导)

## 简介
本规范旨在为项目中的TypeScript编码提供统一的标准和最佳实践。通过分析项目代码库，我们总结出适用于本项目的类型系统使用规范，涵盖类型定义、模块管理、异步处理、类型安全等多个方面，以确保代码的一致性、可维护性和类型安全性。

## 类型定义规范

在项目中，接口和类型定义遵循清晰的命名约定和使用原则。接口名称采用PascalCase命名法，确保命名的可读性和一致性。

对于类型别名的使用，主要在以下场景中使用：
- 定义复杂的函数签名
- 创建联合类型或映射类型的别名
- 简化深层嵌套的对象结构

泛型约束在项目中被广泛使用，特别是在处理数据库操作和中间件时。通过泛型约束，可以确保类型参数满足特定的结构要求，提高代码的类型安全性。

```mermaid
classDiagram
class RequestWithUser {
+user? : any
+tenant? : { code : string }
+tenantDb? : any
}
class RequestWithTenant {
+tenant? : { code : string; domain : string; databaseName : string }
+tenantDb? : any
}
class ApiResponse {
+success : boolean
+message : string
+error? : string
+data? : any
}
class TenantDatabaseSharedPoolService {
-globalConnection : Sequelize | null
+initializeGlobalConnection() : Promise~Sequelize~
+getGlobalConnection() : Sequelize
+queryTenantDatabase(tenantCode : string, sql : string, options? : any) : Promise~any~
+getPoolStats() : Promise~any~
+healthCheck() : Promise~boolean~
+closeGlobalConnection() : Promise~void~
}
```

**图示来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L10-L14)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts#L14-L21)
- [tenant-database-shared-pool.service.ts](file://tenant-database-shared-pool.service.ts#L9-L176)

**本节来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L10-L14)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts#L14-L21)
- [tenant-database-shared-pool.service.ts](file://tenant-database-shared-pool.service.ts#L9-L176)

## 模块导入导出规范

项目中优先使用ES6模块语法进行模块的导入和导出，避免使用默认导出（default export），以提高代码的可预测性和可维护性。

所有导入语句按照以下顺序组织：
1. 外部依赖（如express、sequelize等）
2. 内部路径别名导入（如@/*）
3. 相对路径导入

在导出方面，推荐使用命名导出（named export），这样可以清晰地表明模块提供的功能，并且便于进行树摇优化（tree-shaking）。

```mermaid
flowchart TD
A["导入语句"] --> B["外部依赖"]
A --> C["内部路径别名"]
A --> D["相对路径"]
E["导出语句"] --> F["命名导出"]
E --> G["避免默认导出"]
H["模块结构"] --> I["清晰的导入顺序"]
H --> J["一致的导出模式"]
H --> K["类型安全的模块边界"]
```

**图示来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L6-L8)
- [database-initialization.ts](file://database-initialization.ts#L6-L7)
- [tenant-database-shared-pool.service.ts](file://tenant-database-shared-pool.service.ts#L6-L8)

**本节来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L6-L8)
- [database-initialization.ts](file://database-initialization.ts#L6-L7)
- [tenant-database-shared-pool.service.ts](file://tenant-database-shared-pool.service.ts#L6-L8)

## 异步函数处理规范

项目中统一使用async/await模式处理异步操作，避免使用回调函数或直接链式调用Promise.then()。这种模式使异步代码看起来更像同步代码，提高了代码的可读性和可维护性。

所有异步函数都应明确返回Promise类型，并使用try-catch块处理可能的异常情况。错误处理应包含适当的日志记录和用户友好的错误响应。

```mermaid
sequenceDiagram
participant 函数 as 异步函数
participant try as try块
participant catch as catch块
participant 日志 as 日志服务
participant 响应 as 响应对象
函数->>try : 执行异步操作
try->>try : await 操作
try-->>catch : 抛出异常
catch->>日志 : 记录错误
catch->>响应 : 发送错误响应
try->>响应 : 发送成功响应
```

**图示来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L19-L136)
- [database-initialization.ts](file://database-initialization.ts#L13-L41)
- [tenant-database-shared-pool.service.ts](file://tenant-database-shared-pool.service.ts#L15-L56)

**本节来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L19-L136)
- [database-initialization.ts](file://database-initialization.ts#L13-L41)
- [tenant-database-shared-pool.service.ts](file://tenant-database-shared-pool.service.ts#L15-L56)

## 类型守卫实现规范

类型守卫在项目中用于在运行时验证对象的类型，确保类型安全。项目中通过自定义类型守卫函数来实现这一目的，这些函数返回类型谓词（type predicate）。

类型守卫主要用于：
- 验证API请求参数
- 检查数据库查询结果
- 确认配置对象的结构

```mermaid
flowchart TD
A["类型守卫函数"] --> B["参数: any"]
B --> C{"类型检查"}
C --> |是| D["返回 true"]
C --> |否| E["返回 false"]
D --> F["类型缩小"]
E --> G["保持原始类型"]
H["使用场景"] --> I["API参数验证"]
H --> J["数据库结果检查"]
H --> K["配置对象验证"]
```

**本节来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L10-L14)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts#L14-L21)

## null和undefined安全处理

项目强制启用strictNullChecks编译选项，确保对null和undefined的处理更加严格和安全。根据tsconfig.json配置，项目启用了"strict": true，这包括了strictNullChecks。

在代码中，必须显式处理可能为null或undefined的值，不能直接访问其属性或方法。推荐使用以下方式处理：
- 可选链操作符（?.）
- 空值合并操作符（??）
- 显式的null/undefined检查

```mermaid
flowchart TD
A["可能为空的值"] --> B{"检查 null/undefined"}
B --> |是| C["提供默认值"]
B --> |否| D["安全访问属性"]
E["语言特性"] --> F["可选链 ?. "]
E --> G["空值合并 ?? "]
E --> H["类型守卫"]
I["编译选项"] --> J["strict: true"]
I --> K["strictNullChecks: true"]
```

**图示来源**
- [tsconfig.json](file://unified-tenant-system/tsconfig.json#L7)
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L50-L53)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts#L44-L49)

**本节来源**
- [tsconfig.json](file://unified-tenant-system/tsconfig.json#L7)
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L50-L53)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts#L44-L49)

## any类型使用限制

项目中严格限制any类型的使用，以维护类型系统的完整性。any类型仅在以下特殊情况下允许使用：
- 与未类型化的第三方库交互
- 处理动态JSON数据的初始解析
- 实现通用工具函数

替代any类型的推荐方案包括：
- 使用unknown类型进行更安全的类型处理
- 定义具体的接口或类型
- 使用泛型创建可重用的类型定义

```mermaid
flowchart TD
A["any类型"] --> B["限制使用"]
B --> C["特殊情况"]
C --> D["第三方库交互"]
C --> E["动态JSON解析"]
C --> F["通用工具函数"]
G["替代方案"] --> H["unknown类型"]
G --> I["具体接口"]
G --> J["泛型"]
K["目标"] --> L["类型安全"]
K --> M["代码可维护性"]
K --> N["开发效率"]
```

**本节来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L11)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts#L16)
- [tenant-database-shared-pool.service.ts](file://tenant-database-shared-pool.service.ts#L10)

## 联合类型与交叉类型使用指导

联合类型和交叉类型在项目中被用于表示复杂的类型关系。联合类型（|）用于表示一个值可能是多种类型之一，而交叉类型（&）用于将多个类型合并为一个类型。

联合类型的典型使用场景：
- API响应的不同状态
- 配置选项的不同类型
- 事件处理的不同负载

交叉类型的典型使用场景：
- 扩展现有接口
- 组合多个功能接口
- 创建混合类型

```mermaid
classDiagram
class ApiResponseSuccess {
+success : true
+data : any
}
class ApiResponseError {
+success : false
+error : string
+message : string
}
class RequestWithUser {
+user? : User
}
class RequestWithTenant {
+tenant? : Tenant
}
class RequestWithUserAndTenant {
+user? : User
+tenant? : Tenant
}
ApiResponseSuccess <|-- ApiResponse
ApiResponseError <|-- ApiResponse
RequestWithUser <|-- RequestWithUserAndTenant
RequestWithTenant <|-- RequestWithUserAndTenant
note right of ApiResponse
联合类型示例 :
ApiResponse = ApiResponseSuccess | ApiResponseError
end note
note right of RequestWithUserAndTenant
交叉类型示例 :
RequestWithUserAndTenant = RequestWithUser & RequestWithTenant
end note
```

**图示来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L10-L14)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts#L14-L21)
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L28-L32)

**本节来源**
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L10-L14)
- [tenant-resolver-shared-pool.middleware.ts](file://tenant-resolver-shared-pool.middleware.ts#L14-L21)
- [auth-shared-pool-example.middleware.ts](file://auth-shared-pool-example.middleware.ts#L28-L32)