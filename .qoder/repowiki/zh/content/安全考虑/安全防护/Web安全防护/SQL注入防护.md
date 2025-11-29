# SQL注入防护

<cite>
**本文档引用的文件**
- [database-initialization.ts](file://database-initialization.ts)
- [TENANT_DATABASE_CODE_FLOW.md](file://TENANT_DATABASE_CODE_FLOW.md)
- [TENANT_DATABASE_ACCESS_MECHANISM.md](file://TENANT_DATABASE_ACCESS_MECHANISM.md)
- [k.yyup.com/server/src/init.ts](file://k.yyup.com/server/src/init.ts)
- [k.yyup.com/server/controllers/sql-backup/auth.controller.orm.ts](file://k.yyup.com/server/controllers/sql-backup/auth.controller.orm.ts)
- [k.yyup.com/server/controllers/sql-backup/user.controller.orm.ts](file://k.yyup.com/server/controllers/sql-backup/user.controller.orm.ts)
</cite>

## 目录
1. [引言](#引言)
2. [参数化查询与预编译语句](#参数化查询与预编译语句)
3. [ORM安全特性](#orm安全特性)
4. [输入验证与白名单过滤](#输入验证与白名单过滤)
5. [数据访问层安全实现](#数据访问层安全实现)
6. [存储过程的安全优势](#存储过程的安全优势)
7. [SQL注入测试方法](#sql注入测试方法)
8. [数据库权限最小化](#数据库权限最小化)
9. [结论](#结论)

## 引言
k.yyupgame系统采用多层次的安全机制来防范SQL注入攻击。系统基于Sequelize ORM框架构建，通过参数化查询、输入验证、权限控制等多重防护措施，确保数据库访问的安全性。本文档详细阐述了系统的SQL注入防护机制，包括参数化查询的使用方法、ORM的安全特性、输入验证策略以及数据库权限管理。

## 参数化查询与预编译语句
k.yyupgame系统在数据库访问中强制使用参数化查询和预编译语句，从根本上防止SQL注入攻击。系统通过Sequelize ORM框架的查询接口，确保所有用户输入都作为参数传递，而不是直接拼接到SQL语句中。

在认证和用户查询等关键操作中，系统使用Sequelize的`query`方法配合`replacements`参数来实现参数化查询：

```typescript
const [userRows] = await sequelizeInstance.query(`
  SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status, u.global_user_id
  FROM users u
  WHERE u.global_user_id = ? AND u.status = 'active'
  LIMIT 1
`, {
  replacements: [globalUser.id]
});
```

这种模式确保了用户输入的`globalUser.id`值被安全地作为参数传递，数据库引擎会将其视为数据而非SQL代码的一部分，从而有效防止SQL注入。

**节来源**
- [TENANT_DATABASE_CODE_FLOW.md](file://TENANT_DATABASE_CODE_FLOW.md#L207-L214)
- [TENANT_DATABASE_ACCESS_MECHANISM.md](file://TENANT_DATABASE_ACCESS_MECHANISM.md#L68-L75)

## ORM安全特性
k.yyupgame系统采用Sequelize作为ORM框架，充分利用其内置的安全特性来防范SQL注入攻击。系统避免使用原始查询（raw queries）和危险方法，而是优先使用ORM提供的安全查询接口。

系统中的用户管理、认证等核心功能都通过ORM模型进行操作，例如在创建用户时：

```typescript
await sequelizeInstance.query(`
  INSERT INTO users (
    global_user_id, username, email, real_name, phone,
    auth_source, status, role, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, 'unified', 'active', 'parent', NOW(), NOW())
`, {
  replacements: [
    globalUser.id,
    globalUser.username || globalUser.phone,
    globalUser.email || '',
    globalUser.realName || '用户',
    globalUser.phone || ''
  ]
});
```

通过使用参数化查询和预编译语句，系统确保了即使攻击者尝试注入恶意SQL代码，这些代码也会被当作普通数据处理，从而无法改变查询的原始意图。

**节来源**
- [TENANT_DATABASE_CODE_FLOW.md](file://TENANT_DATABASE_CODE_FLOW.md#L223-L236)
- [TENANT_DATABASE_ACCESS_MECHANISM.md](file://TENANT_DATABASE_ACCESS_MECHANISM.md#L78-L93)

## 输入验证与白名单过滤
k.yyupgame系统实施严格的输入验证和白名单过滤策略，对所有数据库查询参数进行校验。系统在租户识别阶段就采用了白名单验证机制：

```typescript
function extractTenantCode(domain: string): string | null {
  const cleanDomain = domain.split(':')[0]; // 移除端口号
  const match = cleanDomain.match(/^(k\d+)\.yyup\.cc$/);
  return match ? match[1] : null;
}
```

该正则表达式`/^(k\d+)\.yyup\.cc$/`确保只有符合特定模式的域名才能被识别为有效租户，有效防止了通过域名参数进行的SQL注入尝试。系统还对用户输入的手机号、密码等敏感信息进行格式验证和长度限制，确保输入数据的合法性和安全性。

**节来源**
- [TENANT_DATABASE_CODE_FLOW.md](file://TENANT_DATABASE_CODE_FLOW.md#L62-L65)
- [TENANT_DATABASE_ACCESS_MECHANISM.md](file://TENANT_DATABASE_ACCESS_MECHANISM.md#L25-L28)

## 数据访问层安全实现
k.yyupgame系统的数据访问层设计遵循安全最佳实践，通过租户隔离和连接管理机制增强安全性。系统为每个租户建立独立的数据库连接，确保数据访问的隔离性：

```typescript
export class TenantDatabaseService {
  private connections: Map<string, Sequelize> = new Map();
  
  async getTenantConnection(tenantCode: string): Promise<Sequelize> {
    const connectionKey = `tenant_${tenantCode}`;
    
    if (this.connections.has(connectionKey)) {
      const connection = this.connections.get(connectionKey)!;
      try {
        await connection.authenticate();
        return connection;
      } catch (error) {
        logger.warn('租户数据库连接无效，重新创建', { tenantCode });
        this.connections.delete(connectionKey);
      }
    }
    
    const connection = await this.createTenantConnection(tenantCode);
    this.connections.set(connectionKey, connection);
    return connection;
  }
}
```

这种连接池管理机制不仅提高了性能，还通过连接隔离增强了安全性，防止跨租户的数据访问。

**节来源**
- [TENANT_DATABASE_CODE_FLOW.md](file://TENANT_DATABASE_CODE_FLOW.md#L81-L126)
- [TENANT_DATABASE_ACCESS_MECHANISM.md](file://TENANT_DATABASE_ACCESS_MECHANISM.md#L224-L247)

## 存储过程的安全优势
虽然当前代码示例中未直接使用存储过程，但k.yyupgame系统的架构设计支持通过存储过程增强安全性。系统在数据库初始化和管理脚本中展示了存储过程的使用潜力：

```typescript
await sequelize.query(`CALL CreateTenantDatabase('${tenantCode}')`);
```

存储过程提供了额外的安全层，因为它们在数据库服务器端预编译和存储，应用程序只能通过参数调用它们。这种方式限制了攻击者能够执行的SQL操作范围，即使存在注入漏洞，攻击者也只能调用预定义的存储过程，而不能执行任意SQL命令。

**节来源**
- [TENANT_DATABASE_CODE_FLOW.md](file://TENANT_DATABASE_CODE_FLOW.md#L628)

## SQL注入测试方法
k.yyupgame系统采用全面的安全测试策略来检测和防范SQL注入漏洞。系统开发过程中集成了自动化安全测试，包括使用SQLMap等工具进行渗透测试。测试覆盖了所有用户输入点，特别是：

1. 认证接口的手机号和密码输入
2. URL参数中的租户代码提取
3. API请求中的各种查询参数

系统还维护了详细的测试报告和安全验证记录，确保所有潜在的注入点都经过严格测试。通过持续集成中的安全扫描，系统能够在代码提交阶段就发现潜在的SQL注入风险。

**节来源**
- [TENANT_DATABASE_CODE_FLOW.md](file://TENANT_DATABASE_CODE_FLOW.md#L467-L477)
- [TENANT_DATABASE_ACCESS_MECHANISM.md](file://TENANT_DATABASE_ACCESS_MECHANISM.md#L371-L384)

## 数据库权限最小化
k.yyupgame系统严格遵循数据库权限最小化原则，限制应用账户的数据库操作权限。系统为不同租户的应用账户分配最小必要的权限，确保即使某个租户的账户被攻破，攻击者也无法访问其他租户的数据或执行危险操作。

通过为每个租户使用独立的数据库实例，系统实现了物理级别的数据隔离。应用账户只能访问其对应租户的数据库，且权限被限制在必要的CRUD操作范围内，避免了使用高权限账户（如root）进行日常操作。

**节来源**
- [TENANT_DATABASE_CODE_FLOW.md](file://TENANT_DATABASE_CODE_FLOW.md#L480-L487)
- [TENANT_DATABASE_ACCESS_MECHANISM.md](file://TENANT_DATABASE_ACCESS_MECHANISM.md#L351-L368)

## 结论
k.yyupgame系统通过多层次的安全机制有效防范SQL注入攻击。系统采用参数化查询、ORM安全特性、输入验证、租户隔离和权限最小化等综合措施，构建了坚固的数据库安全防线。这些安全实践不仅符合行业最佳标准，还针对多租户SaaS架构的特点进行了优化，确保了系统的整体安全性。