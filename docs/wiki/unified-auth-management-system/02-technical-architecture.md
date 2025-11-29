# 技术架构

## 🏗️ 整体架构设计

统一认证管理系统采用现代化的微服务架构，基于分层设计和领域驱动开发（DDD）原则，确保系统的可扩展性、可维护性和高性能。

### 架构层次图

```mermaid
graph TB
    subgraph "前端层 Frontend Layer"
        WEB[Web管理端]
        MOBILE[移动端App]
        MINI[微信小程序]
    end

    subgraph "API网关层 API Gateway"
        GATEWAY[Nginx + API Gateway]
        LB[负载均衡]
        RATE[限流控制]
    end

    subgraph "应用服务层 Application Services"
        AUTH[认证服务]
        USER[用户服务]
        TENANT[租户服务]
        AI[AI服务]
        FILE[文件服务]
        NOTIFY[通知服务]
    end

    subgraph "基础设施层 Infrastructure"
        CACHE[Redis缓存]
        MQ[消息队列]
        MONITOR[监控系统]
        LOG[日志系统]
    end

    subgraph "数据层 Data Layer"
        PG[PostgreSQL主库]
        PG_RO[PostgreSQL从库]
        OSS[对象存储]
        ES[Elasticsearch]
    end

    WEB --> GATEWAY
    MOBILE --> GATEWAY
    MINI --> GATEWAY

    GATEWAY --> AUTH
    GATEWAY --> USER
    GATEWAY --> TENANT
    GATEWAY --> AI
    GATEWAY --> FILE
    GATEWAY --> NOTIFY

    AUTH --> CACHE
    USER --> PG
    TENANT --> PG
    AI --> ES
    FILE --> OSS
    NOTIFY --> MQ

    AUTH --> MONITOR
    USER --> LOG
```

## 🛠️ 技术栈选型

### 后端技术栈

| 技术领域 | 选型 | 版本 | 说明 |
|---------|------|------|------|
| **运行时** | Node.js | 18.x LTS | 高性能JavaScript运行时 |
| **框架** | NestJS | 10.x | 企业级Node.js框架 |
| **语言** | TypeScript | 5.x | 类型安全的JavaScript超集 |
| **数据库** | PostgreSQL | 15.x | 企业级关系型数据库 |
| **ORM** | Prisma | 5.x | 现代化数据库ORM |
| **缓存** | Redis | 7.x | 内存数据库缓存 |
| **消息队列** | RabbitMQ | 3.12 | 可靠的消息中间件 |
| **文档** | Swagger | 3.x | API文档自动生成 |
| **测试** | Jest | 29.x | 单元测试和集成测试 |

### 前端技术栈

| 技术领域 | 选型 | 版本 | 说明 |
|---------|------|------|------|
| **框架** | Vue.js | 3.3+ | 渐进式JavaScript框架 |
| **语言** | TypeScript | 5.x | 类型安全的JavaScript |
| **构建工具** | Vite | 4.x | 快速构建工具 |
| **UI库** | Element Plus | 2.x | Vue 3组件库 |
| **状态管理** | Pinia | 2.x | Vue状态管理库 |
| **路由** | Vue Router | 4.x | 官方路由管理器 |
| **HTTP客户端** | Axios | 1.x | Promise based HTTP客户端 |
| **图表库** | ECharts | 5.x | 数据可视化图表 |

### 基础设施技术栈

| 技术领域 | 选型 | 版本 | 说明 |
|---------|------|------|------|
| **容器化** | Docker | 24.x | 应用容器化 |
| **编排** | Docker Compose | 2.x | 多容器编排 |
| **反向代理** | Nginx | 1.24 | Web服务器和反向代理 |
| **监控** | Prometheus | 2.x | 时间序列数据库 |
| **可视化** | Grafana | 10.x | 监控数据可视化 |
| **日志** | ELK Stack | 8.x | 日志收集和分析 |
| **对象存储** | MinIO | RELEASE.2023 | S3兼容对象存储 |

## 🏛️ 系统架构设计

### 1. 微服务架构

系统采用微服务架构，将复杂的应用拆分为多个独立的服务：

#### 核心服务模块

```mermaid
graph LR
    subgraph "核心服务 Core Services"
        AUTH_SVC[认证服务<br/>Authentication Service]
        USER_SVC[用户服务<br/>User Service]
        TENANT_SVC[租户服务<br/>Tenant Service]
    end

    subgraph "业务服务 Business Services"
        PERMISSION_SVC[权限服务<br/>Permission Service]
        ROLE_SVC[角色服务<br/>Role Service]
        AUDIT_SVC[审计服务<br/>Audit Service]
    end

    subgraph "扩展服务 Extension Services"
        AI_SVC[AI服务<br/>AI Service]
        FILE_SVC[文件服务<br/>File Service]
        NOTIFY_SVC[通知服务<br/>Notification Service]
    end

    AUTH_SVC --> USER_SVC
    AUTH_SVC --> TENANT_SVC
    USER_SVC --> PERMISSION_SVC
    TENANT_SVC --> ROLE_SVC
    USER_SVC --> AUDIT_SVC
    USER_SVC --> AI_SVC
    USER_SVC --> FILE_SVC
    USER_SVC --> NOTIFY_SVC
```

### 2. 分层架构设计

每一层都有明确的职责，层与层之间通过接口进行通信：

```mermaid
graph TB
    subgraph "表现层 Presentation Layer"
        CONTROLLER[Controller层<br/>HTTP请求处理]
        DTO[DTO层<br/>数据传输对象]
        VALIDATION[Validation层<br/>数据验证]
    end

    subgraph "业务层 Business Layer"
        SERVICE[Service层<br/>业务逻辑]
        DOMAIN[Domain层<br/>领域模型]
        REPOSITORY[Repository层<br/>数据访问]
    end

    subgraph "基础设施层 Infrastructure Layer"
        DATABASE[数据库访问<br/>PostgreSQL]
        CACHE[缓存访问<br/>Redis]
        MQ[消息队列<br/>RabbitMQ]
        EXTERNAL[外部服务<br/>第三方API]
    end

    CONTROLLER --> SERVICE
    DTO --> VALIDATION
    SERVICE --> DOMAIN
    DOMAIN --> REPOSITORY
    REPOSITORY --> DATABASE
    REPOSITORY --> CACHE
    SERVICE --> MQ
    SERVICE --> EXTERNAL
```

### 3. 多租户架构

采用数据库级别的多租户隔离策略：

```mermaid
graph TB
    subgraph "应用层 Application"
        APP[统一认证应用]
        TENANT_Middleware[租户识别中间件]
    end

    subgraph "数据访问层 Data Access"
        CONNECTION_POOL[共享连接池]
        ROUTER[数据库路由器]
    end

    subgraph "数据库层 Database Layer"
        DB_MAIN[主数据库<br/>系统配置]
        DB_TENANT1[租户1数据库<br/>tenant_001]
        DB_TENANT2[租户2数据库<br/>tenant_002]
        DB_TENANT3[租户N数据库<br/>tenant_nnn]
    end

    APP --> TENANT_Middleware
    TENANT_Middleware --> CONNECTION_POOL
    CONNECTION_POOL --> ROUTER
    ROUTER --> DB_MAIN
    ROUTER --> DB_TENANT1
    ROUTER --> DB_TENANT2
    ROUTER --> DB_TENANT3
```

## 🔐 安全架构

### 1. 认证安全

```mermaid
sequenceDiagram
    participant C as 客户端
    participant G as API网关
    participant A as 认证服务
    participant R as Redis
    participant DB as 数据库

    C->>G: 1. 请求认证 (用户名/密码)
    G->>A: 2. 转发认证请求
    A->>DB: 3. 验证用户凭据
    DB-->>A: 4. 返回用户信息
    A->>R: 5. 生成并存储会话
    A->>A: 6. 生成JWT Token
    A-->>G: 7. 返回Token
    G-->>C: 8. 返回认证结果

    Note over C,DB: 后续请求携带Token进行身份验证
```

### 2. 权限控制

基于RBAC（Role-Based Access Control）模型的权限控制：

```mermaid
graph TB
    subgraph "权限模型 RBAC Model"
        USER[用户 User]
        ROLE[角色 Role]
        PERMISSION[权限 Permission]
        RESOURCE[资源 Resource]

        USER -->|拥有| ROLE
        ROLE -->|包含| PERMISSION
        PERMISSION -->|控制| RESOURCE
    end

    subgraph "权限检查流程 Permission Check Flow"
        REQUEST[用户请求]
        AUTH_TOKEN[Token验证]
        USER_ROLES[获取用户角色]
        ROLE_PERMISSIONS[获取角色权限]
        RESOURCE_ACCESS[检查资源权限]
        ALLOW[允许访问]
        DENY[拒绝访问]

        REQUEST --> AUTH_TOKEN
        AUTH_TOKEN --> USER_ROLES
        USER_ROLES --> ROLE_PERMISSIONS
        ROLE_PERMISSIONS --> RESOURCE_ACCESS
        RESOURCE_ACCESS --> ALLOW
        RESOURCE_ACCESS --> DENY
    end
```

### 3. 数据安全

- **传输加密**: HTTPS/TLS 1.3
- **存储加密**: 敏感字段AES-256加密
- **密码安全**: BCrypt哈希 + Salt
- **会话安全**: JWT + Redis会话管理

## 📊 数据架构

### 1. 数据库设计

采用多数据库架构，根据数据特性选择合适的存储方案：

```mermaid
graph LR
    subgraph "主数据库 Master Database"
        PG[PostgreSQL<br/>结构化数据]
        USERS[用户数据]
        TENANTS[租户数据]
        ROLES[角色权限]
        AUDIT[审计日志]
    end

    subgraph "缓存数据库 Cache Database"
        REDIS[Redis<br/>缓存数据]
        SESSION[会话缓存]
        TOKEN[令牌缓存]
        CONFIG[配置缓存]
        TEMP[临时数据]
    end

    subgraph "搜索数据库 Search Database"
        ES[Elasticsearch<br/>全文搜索]
        USER_INDEX[用户索引]
        LOG_INDEX[日志索引]
        CONTENT_INDEX[内容索引]
    end

    subgraph "文件存储 File Storage"
        OSS[MinIO<br/>对象存储]
        AVATAR[头像文件]
        DOCUMENT[文档文件]
        MEDIA[媒体文件]
    end
```

### 2. 数据流设计

```mermaid
flowchart TD
    A[用户请求] --> B{数据类型}

    B -->|读操作| C[检查缓存]
    C --> D{缓存命中?}
    D -->|是| E[返回缓存数据]
    D -->|否| F[查询数据库]
    F --> G[更新缓存]
    G --> H[返回数据]

    B -->|写操作| I[写入数据库]
    I --> J[更新缓存]
    J --> K[发送事件]
    K --> L[更新搜索索引]

    E --> M[响应结果]
    H --> M
```

## ⚡ 性能架构

### 1. 缓存策略

多级缓存架构确保系统高性能：

```mermaid
graph TB
    subgraph "缓存层级 Cache Layers"
        L1[浏览器缓存<br/>Browser Cache]
        L2[CDN缓存<br/>CDN Cache]
        L3[应用缓存<br/>Application Cache]
        L4[Redis缓存<br/>Redis Cache]
        L5[数据库缓存<br/>Database Cache]
    end

    subgraph "缓存策略 Cache Strategies"
        READ_WRITE[读写策略<br/>Read-Write Through]
        WRITE_BACK[写回策略<br/>Write-Back]
        CACHE_ASIDE[旁路缓存<br/>Cache-Aside]
        WRITE_THROUGH[写穿策略<br/>Write-Through]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5
```

### 2. 负载均衡

```mermaid
graph TB
    subgraph "负载均衡架构 Load Balancing"
        LB[Nginx负载均衡]

        subgraph "应用集群 Application Cluster"
            APP1[应用实例1]
            APP2[应用实例2]
            APP3[应用实例N]
        end

        subgraph "数据库集群 Database Cluster"
            DB_MASTER[主库<br/>Master]
            DB_SLAVE1[从库1<br/>Slave1]
            DB_SLAVE2[从库2<br/>Slave2]
        end
    end

    LB --> APP1
    LB --> APP2
    LB --> APP3

    APP1 --> DB_MASTER
    APP2 --> DB_MASTER
    APP3 --> DB_MASTER

    APP1 --> DB_SLAVE1
    APP2 --> DB_SLAVE2
    APP3 --> DB_SLAVE1
```

## 🔍 监控架构

### 1. 监控体系

```mermaid
graph TB
    subgraph "监控数据收集 Data Collection"
        APP_METRICS[应用指标]
        SYS_METRICS[系统指标]
        BUSINESS_METRICS[业务指标]
        LOG_DATA[日志数据]
    end

    subgraph "监控存储 Storage"
        PROMETHEUS[Prometheus<br/>指标存储]
        ELASTICSEARCH[Elasticsearch<br/>日志存储]
        INFLUXDB[InfluxDB<br/>时序数据]
    end

    subgraph "监控展示 Visualization"
        GRAFANA[Grafana<br/>监控面板]
        KIBANA[Kibana<br/>日志分析]
        ALERTMANAGER[AlertManager<br/>告警管理]
    end

    APP_METRICS --> PROMETHEUS
    SYS_METRICS --> PROMETHEUS
    BUSINESS_METRICS --> PROMETHEUS
    LOG_DATA --> ELASTICSEARCH

    PROMETHEUS --> GRAFANA
    ELASTICSEARCH --> KIBANA
    PROMETHEUS --> ALERTMANAGER
```

### 2. 告警策略

- **系统告警**: CPU > 80%, 内存 > 85%, 磁盘 > 90%
- **应用告警**: 错误率 > 5%, 响应时间 > 2s
- **业务告警**: 登录失败率 > 10%, API调用量异常

## 🚀 部署架构

### 1. 容器化部署

```mermaid
graph TB
    subgraph "容器编排 Container Orchestration"
        DOCKER_COMPOSE[Docker Compose]

        subgraph "应用容器 Application Containers"
            AUTH_CONTAINER[认证服务容器]
            USER_CONTAINER[用户服务容器]
            TENANT_CONTAINER[租户服务容器]
            AI_CONTAINER[AI服务容器]
        end

        subgraph "基础设施容器 Infrastructure Containers"
            PG_CONTAINER[PostgreSQL容器]
            REDIS_CONTAINER[Redis容器]
            RABBITMQ_CONTAINER[RabbitMQ容器]
            NGINX_CONTAINER[Nginx容器]
        end
    end

    DOCKER_COMPOSE --> AUTH_CONTAINER
    DOCKER_COMPOSE --> USER_CONTAINER
    DOCKER_COMPOSE --> TENANT_CONTAINER
    DOCKER_COMPOSE --> AI_CONTAINER
    DOCKER_COMPOSE --> PG_CONTAINER
    DOCKER_COMPOSE --> REDIS_CONTAINER
    DOCKER_COMPOSE --> RABBITMQ_CONTAINER
    DOCKER_COMPOSE --> NGINX_CONTAINER
```

### 2. 环境配置

- **开发环境**: Docker Compose本地部署
- **测试环境**: 容器化部署，模拟生产环境
- **生产环境**: Kubernetes集群部署（未来规划）

## 🔗 相关文档

- [部署架构详解](./03-deployment-architecture.md)
- [API接口文档](./04-api-overview.md)
- [数据库设计](./15-database-architecture.md)
- [安全配置指南](./43-security-configuration.md)

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0