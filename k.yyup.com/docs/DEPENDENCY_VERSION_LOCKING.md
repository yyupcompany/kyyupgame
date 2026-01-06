/**
 * 依赖版本锁定配置指南
 *
 * 确保依赖版本的一致性和安全性
 */

# 依赖版本锁定指南

## 原则

### 1. 使用 package-lock.json
- ✅ **必须提交** `package-lock.json` 到版本控制
- ✅ **不要修改** `package-lock.json` 手动
- ✅ 使用 `npm ci` 而不是 `npm install` 在CI/CD环境中

### 2. 版本范围规范

**生产依赖**：使用精确版本或波浪号(~)
```json
{
  "dependencies": {
    "express": "^4.18.0",          // ✅ 允许补丁更新
    "sequelize": "^6.35.0",        // ✅ 允许补丁更新
    "mysql2": "^3.6.0",            // ✅ 允许补丁更新
    "jsonwebtoken": "^9.0.0"       // ✅ 允许补丁更新
  }
}
```

**开发依赖**：可以使用脱字符(^)或波浪号(~)
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.50.0"
  }
}
```

### 3. 禁止的版本范围
```json
{
  "dependencies": {
    "package": "*"     // ❌ 禁止：可能引入破坏性更新
    "package": "latest" // ❌ 禁止：不可预测
    "package": ""      // ❌ 禁止：语义不明
  }
}
```

### 4. 安全依赖检查
- 使用 `npm audit` 检查安全漏洞
- 使用 `npm audit fix` 自动修复
- 严重漏洞必须修复后才能部署

### 5. 定期更新策略
- **每周**: 运行 `npm outdated` 检查更新
- **每月**: 审查并更新次要版本
- **每季度**: 审查并更新主要版本

## CI/CD 集成

```yaml
# .github/workflows/dependency-check.yml
name: Dependency Check
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - run: npm audit fix || true
```

## 文件模板

### package.json
```json
{
  "name": "kyyup-server",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "dependencies": {
    "express": "^4.18.0",
    "sequelize": "^6.35.0",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "multer": "^1.4.5-lts.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "@types/bcryptjs": "^2.4.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.0.0",
    "jest": "^29.7.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "audit:fix": "npm audit fix",
    "check:engines": "node --version && npm --version",
    "lock:check": "npm ls --json",
    "outdated": "npm outdated",
    "update:minor": "npx npm-check-updates -u && npm install"
  }
}
```

## 最佳实践

### 1. 提交前检查
```bash
# 检查依赖安全
npm audit

# 检查过时的依赖
npm outdated

# 确保锁定文件同步
npm ls
```

### 2. 更新依赖流程
```bash
# 1. 检查可用更新
npm outdated

# 2. 更新到兼容版本
npx npm-check-updates -u

# 3. 安装并测试
npm install
npm test

# 4. 提交 package.json 和 package-lock.json
git add package.json package-lock.json
git commit -m "chore: update dependencies"
```

### 3. 恢复依赖
```bash
# 生产环境
npm ci

# 开发环境
npm install
```

## 版本锁定说明

### package-lock.json 的作用
- 锁定每个依赖及其子依赖的确切版本
- 确保团队所有成员使用相同版本的依赖
- 加速 `npm install` 过程

### 为什么不使用 yarn.lock
- 项目已使用 npm
- 混用 npm 和 yarn 可能导致冲突
- package-lock.json 在 Node.js 8+ 中已是标准

## 安全注意事项

1. **审查 PR 中的依赖变更**
   - 检查是否添加了可疑的包
   - 验证新包的维护活跃度

2. **使用 npm token**
   - 在 CI/CD 中使用 `NPM_TOKEN`
   - 避免在代码中暴露敏感凭证

3. **定期运行审计**
   - `npm audit` 应该是CI流程的一部分
   - 严重漏洞必须立即修复

## 故障排除

### 依赖冲突
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 锁定文件损坏
```bash
# 重新生成
npm install
git checkout package-lock.json
```

---

**更新日期**: 2025-01-04
**维护者**: 开发团队
