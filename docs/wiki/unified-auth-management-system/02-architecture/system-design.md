# 系统设计文档

## 🏗️ 系统架构概述

统一认证管理系统采用前后端分离的微服务架构设计，基于领域驱动设计(DDD)思想，将复杂的业务系统划分为多个独立的业务域，每个域负责特定的业务功能。

## 🎯 设计原则

### 1. 单一职责原则 (SRP)
每个模块、类、函数只负责一个明确的职责，确保系统的可维护性和可测试性。

### 2. 开放封闭原则 (OCP)
系统对扩展开放，对修改封闭。通过接口和抽象类，支持功能的扩展而不影响现有代码。

### 3. 依赖倒置原则 (DIP)
高层模块不依赖低层模块，两者都依赖于抽象。通过依赖注入实现松耦合。

### 4. 高内聚低耦合
模块内部功能高度相关，模块之间依赖性最小，提高系统的可维护性。

## 📐 整体架构设计

### 系统分层架构

```mermaid
graph TB
    subgraph "表现层 Presentation Layer"
        A[Vue.js 前端应用]
        B[移动端应用]
        C[管理后台]
    end

    subgraph "网关层 Gateway Layer"
        D[Nginx 反向代理]
        E[API 网关]
        F[负载均衡]
    end

    subgraph "应用层 Application Layer"
        G[认证服务]
        H[用户管理服务]
        I[权限管理服务]
        J[业务服务]
    end

    subgraph "领域层 Domain Layer"
        K[用户领域]
        L[权限领域]
        M[教育领域]
        N[活动领域]
        O[财务领域]
    end

    subgraph "基础设施层 Infrastructure Layer"
        P[MySQL 数据库]
        Q[Redis 缓存]
        R[OSS 存储]
        S[外部服务]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    G --> K
    H --> K
    I --> L
    J --> M
    J --> N
    J --> O
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    G --> Q
    H --> Q
    I --> Q
    J --> R
    J --> S
```

### 前端架构设计

```mermaid
graph LR
    subgraph "前端架构 Frontend Architecture"
        A[路由层 Router] --> B[页面层 Pages]
        B --> C[组件层 Components]
        C --> D[状态层 Stores]
        D --> E[API层 Services]
        E --> F[工具层 Utils]

        subgraph "核心模块"
            G[动态路由]
            H[权限控制]
            I[主题系统]
            J[国际化]
        end

        A --> G
        C --> H
        A --> I
        C --> J
    end
```

### 后端架构设计

```mermaid
graph TB
    subgraph "后端架构 Backend Architecture"
        A[控制器层 Controllers] --> B[服务层 Services]
        B --> C[仓储层 Repositories]
        C --> D[模型层 Models]

        subgraph "横切关注点 Cross-cutting Concerns"
            E[认证中间件]
            F[权限中间件]
            G[日志中间件]
            H[异常处理]
            I[数据验证]
        end

        A --> E
        A --> F
        A --> G
        B --> H
        B --> I
    end
```

## 🔐 认证与授权设计

### JWT认证流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant A as 认证服务
    participant R as Redis缓存
    participant D as 数据库

    C->>A: 登录请求 (用户名/密码)
    A->>D: 验证用户凭据
    D-->>A: 返回用户信息
    A->>R: 存储用户会话
    A-->>C: 返回JWT令牌

    Note over C,D: 后续请求携带JWT令牌
    C->>A: 业务请求 (JWT: Bearer token)
    A->>A: 验证JWT令牌
    A->>R: 检查令牌有效性
    R-->>A: 返回会话信息
    A->>D: 执行业务逻辑
    D-->>A: 返回业务数据
    A-->>C: 返回响应结果
```

### RBAC权限模型

```mermaid
erDiagram
    USER {
        bigint id PK
        string username
        string email
        string password_hash
        enum status
        timestamp created_at
        timestamp updated_at
    }

    ROLE {
        bigint id PK
        string name
        string description
        enum status
        timestamp created_at
    }

    PERMISSION {
        bigint id PK
        string name
        string resource
        string action
        string description
        enum status
    }

    USER_ROLE {
        bigint user_id FK
        bigint role_id FK
        timestamp assigned_at
    }

    ROLE_PERMISSION {
        bigint role_id FK
        bigint permission_id FK
        timestamp granted_at
    }

    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : assigned_to
    ROLE ||--o{ ROLE_PERMISSION : has
    PERMISSION ||--o{ ROLE_PERMISSION : granted_to
```

### 动态权限路由系统

```mermaid
graph TD
    A[用户登录] --> B[获取用户权限]
    B --> C[生成动态路由]
    C --> D[注册路由表]
    D --> E[权限守卫]
    E --> F{权限验证}
    F -->|通过| G[访问页面]
    F -->|拒绝| H[重定向到403]

    subgraph "权限数据结构"
        I[一级类目权限]
        J[二级页面权限]
        K[三级组件权限]
    end

    B --> I
    I --> J
    J --> K
    C --> I
    E --> K
```

## 🗄️ 数据库设计

### 核心数据模型

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : "拥有"
    ROLE ||--o{ USER_ROLE : "分配给"
    ROLE ||--o{ ROLE_PERMISSION : "包含"
    PERMISSION ||--o{ ROLE_PERMISSION : "授予"

    USER ||--o{ TEACHER : "是"
    USER ||--o{ PARENT : "是"
    USER ||--o{ STUDENT : "是"

    KINDERGARTEN ||--o{ CLASS : "包含"
    CLASS ||--o{ STUDENT : "包含"
    TEACHER ||--o{ CLASS_TEACHER : "任教"
    CLASS ||--o{ CLASS_TEACHER : "有教师"

    ACTIVITY ||--o{ ACTIVITY_REGISTRATION : "报名"
    USER ||--o{ ACTIVITY_REGISTRATION : "参与"

    ENROLLMENT_PLAN ||--o{ ENROLLMENT_APPLICATION : "申请"
    USER ||--o{ ENROLLMENT_APPLICATION : "提交"
```

### 数据库优化策略

#### 1. 索引优化
```sql
-- 用户表索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_status ON users(status);
CREATE INDEX idx_user_created_at ON users(created_at);

-- 角色权限关联表索引
CREATE INDEX idx_user_role_user_id ON user_roles(user_id);
CREATE INDEX idx_user_role_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permission_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permission_permission_id ON role_permissions(permission_id);

-- 业务表索引
CREATE INDEX idx_activity_status ON activities(status);
CREATE INDEX idx_activity_created_at ON activities(created_at);
CREATE INDEX idx_enrollment_application_status ON enrollment_applications(status);
```

#### 2. 分表分库策略
```sql
-- 按年份分表的日志表
CREATE TABLE system_logs_2024 LIKE system_logs;
CREATE TABLE system_logs_2025 LIKE system_logs;

-- 按园所分表的业务数据
CREATE TABLE students_kindergarten_1 LIKE students;
CREATE TABLE students_kindergarten_2 LIKE students;
```

## 🔄 业务流程设计

### 用户注册与激活流程

```mermaid
flowchart TD
    A[开始注册] --> B[填写基本信息]
    B --> C[发送验证邮件]
    C --> D[用户验证邮箱]
    D --> E{验证成功?}
    E -->|是| F[激活账号]
    E -->|否| G[重新发送验证]
    G --> D
    F --> H[分配默认角色]
    H --> I[注册完成]

    I --> J[发送欢迎短信]
    I --> K[创建个人档案]
    I --> L[记录注册日志]
```

### 活动创建与管理流程

```mermaid
flowchart TD
    A[创建活动] --> B[填写活动信息]
    B --> C[设置报名规则]
    C --> D[上传活动资源]
    D --> E[预览活动]
    E --> F{确认发布?}
    F -->|是| G[发布活动]
    F -->|否| H[修改活动]
    H --> B
    G --> I[发送通知]
    I --> J[收集报名]
    J --> K[活动进行中]
    K --> L[活动评估]
    L --> M[生成报告]
    M --> N[活动归档]
```

### 招生管理流程

```mermaid
flowchart TD
    A[制定招生计划] --> B[设置招生指标]
    B --> C[开通报名通道]
    C --> D[收集报名信息]
    D --> E[初步筛选]
    E --> F[安排面试]
    F --> G[面试评估]
    G --> H[综合评分]
    H --> I[录取决策]
    I --> J{是否录取}
    J -->|是| K[发送录取通知]
    J -->|否| L[发送婉拒通知]
    K --> M[办理入学手续]
    L --> N[结束流程]
    M --> O[分配班级]
    O --> P[建立学籍档案]
```

## 🌐 API设计规范

### RESTful API设计

#### URL命名规范
```
GET    /api/users              # 获取用户列表
GET    /api/users/:id          # 获取特定用户
POST   /api/users              # 创建用户
PUT    /api/users/:id          # 更新用户
DELETE /api/users/:id          # 删除用户

GET    /api/users/:id/roles    # 获取用户角色
POST   /api/users/:id/roles    # 分配角色
DELETE /api/users/:id/roles/:roleId  # 移除角色
```

#### 统一响应格式
```typescript
// 成功响应
interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
  requestId: string;
}

// 错误响应
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}
```

#### 分页响应格式
```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message: string;
  timestamp: string;
}
```

## 🔧 缓存策略设计

### 多级缓存架构

```mermaid
graph TD
    A[用户请求] --> B[浏览器缓存]
    B --> C[CDN缓存]
    C --> D[Nginx缓存]
    D --> E[应用缓存 Redis]
    E --> F[数据库缓存]
    F --> G[数据库]

    subgraph "缓存策略"
        H[静态资源缓存]
        I[API响应缓存]
        J[数据库查询缓存]
        K[页面缓存]
    end

    B --> H
    C --> H
    D --> I
    E --> J
    E --> K
```

### 缓存键命名规范
```typescript
// 缓存键命名规范
const CacheKeys = {
  // 用户相关
  USER_INFO: (userId: number) => `user:info:${userId}`,
  USER_PERMISSIONS: (userId: number) => `user:permissions:${userId}`,
  USER_ROLES: (userId: number) => `user:roles:${userId}`,

  // 系统配置
  SYSTEM_CONFIG: 'system:config',
  PERMISSION_TREE: 'system:permissions:tree',

  // 业务数据
  ACTIVITY_LIST: (page: number) => `activities:list:${page}`,
  ENROLLMENT_STATS: (date: string) => `enrollment:stats:${date}`,

  // 会话管理
  USER_SESSION: (token: string) => `session:${token}`,

  // 缓存时间设置
  TTL: {
    SHORT: 5 * 60,      // 5分钟
    MEDIUM: 30 * 60,    // 30分钟
    LONG: 2 * 60 * 60,  // 2小时
    DAILY: 24 * 60 * 60 // 1天
  }
};
```

## 📊 监控与日志设计

### 日志分级策略
```typescript
enum LogLevel {
  ERROR = 'ERROR',    // 系统错误，需要立即处理
  WARN = 'WARN',      // 警告信息，可能影响功能
  INFO = 'INFO',      // 一般信息，业务流程记录
  DEBUG = 'DEBUG',    // 调试信息，开发和排错使用
  TRACE = 'TRACE'     // 详细跟踪信息，性能分析使用
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  module: string;
  message: string;
  data?: any;
  userId?: number;
  requestId?: string;
  ip?: string;
  userAgent?: string;
}
```

### 监控指标设计
```typescript
// 业务监控指标
interface BusinessMetrics {
  // 用户相关
  userRegistrations: number;
  activeUsers: number;
  userRetention: number;

  // 业务相关
  enrollmentConversion: number;
  activityParticipation: number;
  aiAssistantUsage: number;

  // 系统相关
  apiResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
}
```

## 🚀 性能优化设计

### 前端性能优化

#### 1. 代码分割策略
```typescript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    component: () => import('@/pages/user-management.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  }
];

// 组件懒加载
const HeavyComponent = defineAsyncComponent({
  loader: () => import('@/components/HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
});
```

#### 2. 虚拟滚动
```vue
<template>
  <div class="virtual-list" :style="{ height: containerHeight + 'px' }">
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
      <div v-for="item in visibleItems" :key="item.id" class="list-item">
        {{ item.content }}
      </div>
    </div>
  </div>
</template>
```

### 后端性能优化

#### 1. 数据库查询优化
```typescript
// 使用索引优化查询
const users = await User.findAll({
  where: {
    status: 'active',
    created_at: {
      [Op.gte]: new Date('2024-01-01')
    }
  },
  include: [
    {
      model: Role,
      as: 'roles',
      attributes: ['id', 'name'],
      through: { attributes: [] }
    }
  ],
  attributes: ['id', 'username', 'email', 'created_at'],
  order: [['created_at', 'DESC']],
  limit: 20,
  offset: (page - 1) * 20
});
```

#### 2. 连接池配置
```typescript
// 数据库连接池配置
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
    max: 20,        // 最大连接数
    min: 5,         // 最小连接数
    acquire: 30000, // 获取连接超时时间
    idle: 10000     // 连接空闲时间
  },
  logging: process.env.NODE_ENV === 'development'
});
```

## 🔄 扩展性设计

### 微服务拆分策略

```mermaid
graph TB
    subgraph "API网关 API Gateway"
        A[路由转发]
        B[认证授权]
        C[限流熔断]
        D[监控日志]
    end

    subgraph "核心服务 Core Services"
        E[用户服务 User Service]
        F[权限服务 Permission Service]
        G[认证服务 Auth Service]
    end

    subgraph "业务服务 Business Services"
        H[教育服务 Education Service]
        I[招生服务 Enrollment Service]
        J[活动服务 Activity Service]
        K[财务服务 Finance Service]
    end

    subgraph "支撑服务 Support Services"
        L[通知服务 Notification Service]
        M[文件服务 File Service]
        N[AI服务 AI Service]
        O[报表服务 Report Service]
    end

    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    A --> L
    A --> M
    A --> N
    A --> O
```

### 配置管理设计
```typescript
// 分层配置管理
interface AppConfig {
  // 数据库配置
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };

  // Redis配置
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };

  // 外部服务配置
  external: {
    ai: {
      apiUrl: string;
      apiKey: string;
      timeout: number;
    };
    sms: {
      provider: string;
      apiKey: string;
      secretKey: string;
    };
    email: {
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
    };
  };

  // 业务配置
  business: {
    maxFileSize: number;
    allowedFileTypes: string[];
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
}
```

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0
**维护团队**: 统一认证管理系统开发团队