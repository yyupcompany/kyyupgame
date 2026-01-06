# Bug 修复指南索引

本目录包含项目中发现的所有 bug 的详细修复指南。

## 📊 修复进度统计

| 级别 | 总数 | 已完成 | 待创建 | 完成率 |
|------|------|--------|--------|--------|
| 🔴 严重 | 15 | 10 | 5 | 67% |
| 🟠 高 | 23 | 17 | 6 | 74% |
| 🟡 中 | 18 | 0 | 18 | 0% |
| 🟢 低 | 12 | 0 | 12 | 0% |
| **总计** | **68** | **27** | **41** | **40%** |

---

## 🎯 修复计划总览

### 第一阶段修复文档（9个）- 已完成 ✅
高优先级安全修复，不涉及公共基础设施修改：

1. **[BUG_011_TOKEN_REFRESH_FIX.md](./BUG_011_TOKEN_REFRESH_FIX.md)** - Token刷新竞态条件
   - 位置: `client/src/utils/request.ts`
   - 预计时间: 6-9 小时
   - 风险: 中（需要谨慎处理认证逻辑）

2. **[BUG_012_ERROR_STACK_FIX.md](./BUG_012_ERROR_STACK_FIX.md)** - 错误处理堆栈暴露
   - 位置: `server/src/app.ts`
   - 预计时间: 2-3 小时
   - 风险: 低

3. **[BUG_013_ROUTER_LOOP_FIX.md](./BUG_013_ROUTER_LOOP_FIX.md)** - Router无限循环风险
   - 位置: `server/src/app.ts`
   - 预计时间: 2-3 小时
   - 风险: 低

4. **[BUG_014_ENV_INJECTION_FIX.md](./BUG_014_ENV_INJECTION_FIX.md)** - 环境变量注入
   - 位置: `server/src/app.ts`
   - 预计时间: 3-4 小时
   - 风险: 低

5. **[BUG_015_LOG_SANITIZATION_FIX.md](./BUG_015_LOG_SANITIZATION_FIX.md)** - 日志敏感信息
   - 位置: `server/src/app.ts`, `server/src/middlewares/auth.middleware.ts`
   - 预计时间: 5-7 小时
   - 风险: 低（不修改logger.ts）

6. **[BUG_016_DATA_RACE_FIX.md](./BUG_016_DATA_RACE_FIX.md)** - 并发数据竞态
   - 位置: `server/src/controllers/`, `server/src/services/`
   - 预计时间: 10-14 小时
   - 风险: 中（业务逻辑层）

7. **[BUG_017_LOCALSTORAGE_FIX.md](./BUG_017_LOCALSTORAGE_FIX.md)** - localStorage安全
   - 位置: `client/src/utils/request.ts`
   - 预计时间: 6-9 小时
   - 风险: 中（保持现有方式作为默认）

8. **[BUG_018_RATE_LIMIT_FIX.md](./BUG_018_RATE_LIMIT_FIX.md)** - 请求速率限制
   - 位置: `server/src/app.ts`
   - 预计时间: 6-9 小时
   - 风险: 低（添加新中间件）

9. **[BUG_019_INPUT_VALIDATION_FIX.md](./BUG_019_INPUT_VALIDATION_FIX.md)** - 输入验证
   - 位置: `server/src/controllers/`
   - 预计时间: 9-12 小时
   - 风险: 低（不修改validator.ts）

**第一阶段总工时**: 约 50-70 小时

### 第二阶段修复文档（8个）- 已完成 ✅
数据层和业务逻辑修复：

10. **[BUG_020_CSRF_FIX.md](./BUG_020_CSRF_FIX.md)** - CSRF保护
    - 位置: `server/src/app.ts`
    - 预计时间: 5-7 小时
    - 风险: 低（开发环境可选）

11. **[BUG_021_STATIC_FILE_FIX.md](./BUG_021_STATIC_FILE_FIX.md)** - 静态文件路径遍历
    - 位置: `server/src/app.ts`
    - 预计时间: 3-5 小时
    - 风险: 低

12. **[BUG_022_CSP_FIX.md](./BUG_022_CSP_FIX.md)** - 内容安全策略
    - 位置: `server/src/app.ts`, `client/index.html`
    - 预计时间: 5-7 小时
    - 风险: 低（开发环境宽松配置）

13. **[BUG_023_DB_TIMEOUT_FIX.md](./BUG_023_DB_TIMEOUT_FIX.md)** - 数据库查询超时
    - 位置: `server/src/controllers/`, `server/src/services/`
    - 预计时间: 6-9 小时
    - 风险: 低（开发环境宽松超时）

14. **[BUG_024_ERROR_HANDLING_FIX.md](./BUG_024_ERROR_HANDLING_FIX.md)** - 错误处理一致性
    - 位置: `client/src/utils/request.ts`
    - 预计时间: 6-9 小时
    - 风险: 低

15. **[BUG_025_TYPE_SAFETY_FIX.md](./BUG_025_TYPE_SAFETY_FIX.md)** - 类型安全
    - 位置: `server/src/middlewares/auth.middleware.ts`
    - 预计时间: 9-12 小时
    - 风险: 低（只修改类型定义）

16. **[BUG_026_HARDCODED_URL_FIX.md](./BUG_026_HARDCODED_URL_FIX.md)** - 硬编码域名路径
    - 位置: `client/src/utils/request.ts`, `client/src/api/endpoints/`
    - 预计时间: 6-9 小时
    - 风险: 低（有默认值fallback）

17. **[BUG_027_CONSOLE_LOG_FIX.md](./BUG_027_CONSOLE_LOG_FIX.md)** - Console.log清理
    - 位置: `client/src/utils/request.ts`
    - 预计时间: 5-7 小时
    - 风险: 低（开发环境保留日志）

**第二阶段总工时**: 约 45-65 小时

---

## 🔴 严重级别 Bug 修复指南（已完成 10/15）

### ✅ 已完成的修复指南

1. **[BUG_001_SQL_INJECTION_FIX.md](./BUG_001_SQL_INJECTION_FIX.md)** - SQL注入漏洞
   - 位置: `server/src/seeders/20240318000000-init.ts`
   - 预计时间: 3-6 小时

2. **[BUG_002_PASSWORD_SECURITY_FIX.md](./BUG_002_PASSWORD_SECURITY_FIX.md)** - 明文密码传输和存储风险
   - 位置: `server/src/middlewares/auth.middleware.ts`, `server/src/controllers/user.controller.ts`
   - 预计时间: 6-9 小时

3. **[BUG_003_JWT_SECURITY_FIX.md](./BUG_003_JWT_SECURITY_FIX.md)** - JWT密钥硬编码和不安全配置
   - 位置: `server/src/middlewares/auth.middleware.ts`, `server/.env`
   - 预计时间: 9-12 小时

4. **[BUG_004_INTERNAL_SERVICE_BYPASS_FIX.md](./BUG_004_INTERNAL_SERVICE_BYPASS_FIX.md)** - 未验证的内部服务绕过认证
   - 位置: `server/src/middlewares/auth.middleware.ts`
   - 预计时间: 4-12 小时（取决于方案）

5. **[BUG_005_DATABASE_POOL_FIX.md](./BUG_005_DATABASE_POOL_FIX.md)** - 数据库连接池耗尽风险
   - 位置: `server/src/app.ts`, `server/src/middlewares/auth.middleware.ts`
   - 预计时间: 12-18 小时

6. **[BUG_006_CORS_SECURITY_FIX.md](./BUG_006_CORS_SECURITY_FIX.md)** - CORS配置过于宽松
   - 位置: `server/src/app.ts`
   - 预计时间: 6-9 小时

7. **[BUG_007_PROMISE_REJECTION_FIX.md](./BUG_007_PROMISE_REJECTION_FIX.md)** - 未处理的Promise拒绝
   - 位置: `server/src/app.ts`
   - 预计时间: 9-12 小时

8. **[BUG_008_INFO_LEAK_FIX.md](./BUG_008_INFO_LEAK_FIX.md)** - 敏感信息泄露到前端
   - 位置: `server/src/app.ts`, 多个控制器文件
   - 预计时间: 6-9 小时

9. **[BUG_009_TENANT_ISOLATION_FIX.md](./BUG_009_TENANT_ISOLATION_FIX.md)** - 租户隔离不完整
   - 位置: `server/src/middlewares/auth.middleware.ts`, `server/src/app.ts`
   - 预计时间: 15-23 小时

10. **[BUG_010_JSON_PARSE_FIX.md](./BUG_010_JSON_PARSE_FIX.md)** - JSON.parse没有异常处理
    - 位置: `server/src/services/ai/bridge/ai-bridge.service.ts` 等
    - 预计时间: 6-9 小时

### ⏳ 待创建的严重级别修复指南

11-15. **[待创建]** 其他严重级别问题
    - 每个预计: 2-6 小时

---

## 🟠 高优先级 Bug 修复指南（已完成 17/23）

### ✅ 已完成（见第一、二阶段列表）

以上 17 个修复指南已全部完成，包括：
- Token刷新竞态条件
- 错误处理堆栈暴露
- Router无限循环风险
- 环境变量注入
- 日志敏感信息
- 并发数据竞态
- localStorage安全
- 请求速率限制
- 输入验证
- CSRF保护
- 静态文件路径遍历
- 内容安全策略
- 数据库查询超时
- 错误处理一致性
- 类型安全
- 硬编码域名路径
- Console.log清理

### ⏳ 待创建的高优先级修复指南

18-23. **[待创建]** 其他高优先级问题
    - 每个预计: 2-4 小时

---

## 🟡 中优先级 Bug 修复指南（待创建 0/18）

### 错误处理和类型

1. **[待创建] 魔法数字和硬编码值**
   - 位置: 多个文件
   - 预计时间: 4-6 小时

2. **[待创建] 注释掉的代码过多**
   - 位置: 多个文件
   - 预计时间: 2-3 小时

### 数据库和架构

3. **[待创建] 缺少数据库迁移版本控制**
   - 位置: `server/src/migrations/`
   - 预计时间: 4-6 小时

4. **[待创建] 缺少API文档验证**
   - 位置: `server/src/config/swagger.config.ts`
   - 预计时间: 3-4 小时

5. **[待创建] 缺少数据库索引**
   - 位置: `server/src/models/`
   - 预计时间: 4-6 小时

6. **[待创建] 缺少缓存机制**
   - 位置: 多个API端点
   - 预计时间: 6-8 小时

### 测试和监控

7. **[待创建] 缺少单元测试和集成测试**
   - 位置: 项目整体
   - 预计时间: 20-30 小时

8. **[待创建] 缺少日志级别控制**
   - 位置: `server/src/utils/logger.ts`
   - 预计时间: 3-4 小时

9. **[待创建] 缺少健康检查端点的详细检查**
   - 位置: `server/src/app.ts`
   - 预计时间: 2-3 小时

10-18. **[待创建]** 其他中优先级问题
    - 每个预计: 2-4 小时

---

## 🟢 低优先级 Bug 修复指南（待创建 0/12）

1. **[待创建] 缺少性能监控**
2. **[待创建] 缺少国际化支持**
3. **[待创建] 缺少代码格式化工具配置**
4-12. **[待创建]** 其他低优先级优化
    - 每个预计: 1-3 小时

---

## 📋 使用说明

### 如何使用修复指南

1. **查看完整 bug 报告**
   ```bash
   cat bug001.md
   ```

2. **查看特定 bug 的修复指南**
   ```bash
   cat fix-guides/BUG_001_SQL_INJECTION_FIX.md
   ```

3. **按优先级修复**
   - 优先修复 🔴 严重级别的 bug
   - 然后修复 🟠 高优先级的 bug
   - 最后处理 🟡 中优先级和 🟢 低优先级的问题

### 修复流程建议

#### 第一阶段（紧急）- 1-2周 ✅
修复所有严重级别的安全漏洞：
- SQL注入
- 认证绕过后门
- CORS配置
- JWT安全
- 其他严重问题...

#### 第二阶段（高优先级）- 2-4周 ✅
完善安全机制：
- ✅ 第一阶段修复（9个）：Token刷新、错误处理、Router安全等
- ✅ 第二阶段修复（8个）：CSRF、CSP、输入验证等
- 其他高优先级问题...

#### 第三阶段（中优先级）- 1-2月
提升代码质量：
- 类型安全
- 错误处理
- 单元测试
- 性能优化

#### 第四阶段（低优先级）- 持续改进
- 代码风格统一
- 性能监控
- 国际化支持

### 修复完成检查

每个修复指南都包含一个"修复完成检查清单"，确保：
- ✅ 代码已修改
- ✅ 测试已通过
- ✅ 文档已更新
- ✅ 安全验证已完成

### 本地调试保证

所有修复指南都遵循以下原则：
1. **环境变量fallback**: 所有环境变量都有默认值
2. **开发环境检测**: 通过`NODE_ENV`或`import.meta.env.DEV`检测
3. **向后兼容**: 保持现有API接口不变
4. **可选功能**: 新增功能通过环境变量控制

---

## 🔧 修复原则总结

### ✅ 可以修复的Bug（27个已修复）

**第一、二阶段修复（17个）**:
- 不涉及公共基础设施修改
- 在业务层或配置层添加新功能
- 使用环境变量控制，带默认值fallback
- 开发环境宽松配置，不影响调试

**已完成的10个严重bug修复**:
- SQL注入
- 密码安全
- JWT安全
- 认证绕过
- 数据库连接池
- CORS配置
- Promise处理
- 信息泄露
- 租户隔离
- JSON解析

### 🚫 暂不修复的Bug（41个）

**涉及公共工具/中间件深层修改**:
- 需要修改 `validator.ts`
- 需要修改 `logger.ts`
- 需要修改 `security.middleware.ts`
- 需要修改 `jwt.ts`
- 需要修改 `session.service.ts`
- 需要修改认证核心逻辑

**建议**: 这些bug需要全局架构设计，建议后续单独规划修复。

---

**最后更新**: 2026-01-04
**已完成修复文档**: 27个
**总修复时间估计**: 约 95-135 小时（已完成部分）
**建议团队规模**: 3-5 名开发人员
**预计完成时间**: 3-6 个月（按优先级分阶段进行）
