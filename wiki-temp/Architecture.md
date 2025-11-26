# 系统架构

## 🏗️ 整体架构

```mermaid
graph TB
    subgraph "前端层"
        A[Vue 3 应用]
        B[Element Plus UI]
        C[Pinia 状态管理]
        D[Vue Router 路由]
    end

    subgraph "API 网关层"
        E[Express.js 服务器]
        F[JWT 认证中间件]
        G[RBAC 权限中间件]
        H[API 验证中间件]
    end

    subgraph "业务层"
        I[用户管理服务]
        J[教育管理服务]
        K[招生管理服务]
        L[活动管理服务]
        M[AI 集成服务]
        N[租户管理服务]
    end

    subgraph "数据层"
        O[MySQL 数据库]
        P[Redis 缓存]
        Q[文件存储 OSS]
    end

    A --> E
    E --> I
    E --> J
    E --> K
    E --> L
    E --> M
    E --> N

    I --> O
    J --> O
    K --> O
    L --> O
    M --> P
    N --> Q
```

## 🎯 核心模块

### 统一租户架构
- **租户管理中心** (`rent.yyup.cc`)
- **租户业务系统** (`k.yyup.cc`)
- **跨租户认证** 和 **数据隔离**

### 动态权限系统
- **三级权限层次**：一级类目 → 二级页面 → 三级组件
- **动态路由**：基于权限的路由生成
- **细粒度控制**：页面级和功能级权限

### AI 集成架构
- **记忆系统**：六维记忆模型
- **智能助手**：多提供商 AI 模型
- **数据分析**：AI 渗透到各业务环节

## 📊 技术指标

- **代码规模**: ~150k 行
- **Vue 组件**: 80+ 个
- **页面数量**: 162+ 个
- **API 端点**: 155+ 个
- **数据模型**: 73+ 个
- **权限记录**: 95+ 个

---
*详细文档请参考 [Development Guide](Development-Guide.md)*
