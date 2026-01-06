# API规范检查机制指南

## 概述

本项目建立了完整的API规范检查机制，用于检测和修复前端代码中的硬编码API调用，确保使用统一的端点配置。这个机制包括扫描工具、自动修复工具、Pre-commit检查和CI/CD检查。

## 🎯 目标

- 🔍 **检测硬编码API** - 自动发现所有硬编码的API调用
- 🔧 **自动修复** - 将硬编码API替换为端点常量
- 🛡️ **防止新增** - 通过Git钩子和CI检查防止新的硬编码API
- 📊 **质量监控** - 提供API使用质量的量化指标

## 🛠️ 工具概览

### 1. API硬编码扫描器 (`api-hardcoded-scanner.js`)

自动扫描前端代码，发现硬编码的API调用。

**功能特性：**
- 支持 Vue、JavaScript、TypeScript 文件
- 智能过滤误报（注释、端点配置等）
- 按严重程度分类问题
- 生成详细报告和统计

**使用方法：**
```bash
npm run api:hardcode:scan
```

**输出示例：**
```
📊 扫描结果统计:
总文件数: 2143
已扫描文件: 2143
发现问题文件: 129
总问题数: 584

📈 问题类型分布:
  rest-api: 350
  fetch-call: 230
  template-string: 4
```

### 2. API自动修复器 (`api-hardcoded-fixer.js`)

自动将硬编码API替换为对应的端点常量。

**功能特性：**
- 自动导入所需端点
- 智能替换API路径
- 支持预览模式（dry-run）
- 自动创建备份文件

**使用方法：**
```bash
# 预览修复（不会实际修改文件）
npm run api:hardcode:fix

# 应用修复
npm run api:hardcode:fix:apply
```

**支持的端点映射：**
```javascript
'/api/auth/login' → 'AUTH_ENDPOINTS.LOGIN'
'/api/activities' → 'ACTIVITY_ENDPOINTS.BASE'
'/api/marketing/group-buy' → 'GROUP_BUY_ENDPOINTS.BASE'
// ... 更多映射
```

### 3. Pre-commit检查 (`precommit-api-check.js`)

在代码提交前自动检查硬编码API，防止引入新的问题。

**功能特性：**
- 只检查暂存的文件
- 实时反馈检查结果
- 阻止包含问题的提交
- 提供修复建议

**使用方法：**
```bash
# 手动运行pre-commit检查
node scripts/precommit-api-check.js
```

### 4. CI/CD检查 (`ci-api-standards-check.js`)

在持续集成流程中执行全面的API规范检查。

**功能特性：**
- 综合评分机制（0-100分）
- 多维度检查（硬编码、端点一致性、类型安全）
- 支持多种输出格式（console、JSON、GitHub Actions）
- 可配置的失败阈值

**使用方法：**
```bash
# 标准检查
npm run api:standards:check

# 严格模式检查
npm run api:standards:check:strict

# JSON格式输出
node scripts/ci-api-standards-check.js --json

# GitHub Actions格式输出
node scripts/ci-api-standards-check.js --github --threshold=5
```

**评分标准：**
- 硬编码API：每个问题扣2分，最多扣40分
- 端点一致性问题：每个问题扣5分，最多扣30分
- 类型安全问题：每个问题扣3分，最多扣20分
- 高严重性问题：额外扣分

## 📁 端点配置文件

### 认证端点 (`client/src/api/endpoints/auth.ts`)
```typescript
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIX}auth/login`,
  LOGOUT: `${API_PREFIX}auth/logout`,
  REGISTER: `${API_PREFIX}auth/register`,
  // ... 其他认证相关端点
} as const;
```

### 活动端点 (`client/src/api/endpoints/activity.ts`)
```typescript
export const ACTIVITY_ENDPOINTS = {
  BASE: `${API_PREFIX}activities`,
  CREATE: `${API_PREFIX}activities`,
  // ... 其他活动相关端点
} as const;
```

### 营销端点 (`client/src/api/endpoints/marketing.ts`)
```typescript
export const GROUP_BUY_ENDPOINTS = {
  BASE: `${API_PREFIX}marketing/group-buy`,
  CREATE: `${API_PREFIX}marketing/group-buy`,
  // ... 其他团购相关端点
} as const;
```

## 🔧 集成到开发流程

### 1. 安装Git钩子

在 `.git/hooks/pre-commit` 中添加：
```bash
#!/bin/bash
echo "🔍 运行API规范检查..."
node scripts/precommit-api-check.js
if [ $? -ne 0 ]; then
  echo "❌ API规范检查未通过，请修复后再提交"
  exit 1
fi
```

### 2. GitHub Actions配置

在 `.github/workflows/api-standards.yml` 中：
```yaml
name: API Standards Check

on: [push, pull_request]

jobs:
  api-standards:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Run API Standards Check
      run: |
        npm install
        npm run api:standards:check -- --github --threshold=5
```

### 3. 代码审查检查清单

在PR模板中添加API规范检查项：
- [ ] 硬编码API已修复
- [ ] 使用了正确的端点常量
- [ ] 通过了API规范检查
- [ ] API类型定义完整

## 📊 报告和分析

### 1. 扫描报告

每次扫描都会生成详细报告：
- `api-hardcoded-scan-report.json` - 详细的扫描结果
- 控制台输出 - 实时检查结果

### 2. 质量趋势

可以设置定期运行检查，跟踪API质量趋势：
```bash
# 每周运行一次
0 0 * * 1 cd /path/to/project && npm run api:standards:check -- --json > reports/api-quality-$(date +%Y%m%d).json
```

## 🚨 常见问题和解决方案

### Q1: 为什么我的硬编码API没有被检测到？

**可能原因：**
- 文件不在扫描目录中
- API路径不匹配 `/api/` 模式
- 代码被注释掉了

**解决方案：**
- 确认文件路径正确
- 检查API路径格式
- 移除不必要的注释

### Q2: 自动修复工具修改了不应该修改的代码

**可能原因：**
- 字符串匹配过于宽泛
- 特殊的API使用模式

**解决方案：**
- 使用预览模式先检查修复内容
- 手动恢复特定文件
- 报告误报情况

### Q3: Pre-commit检查太慢

**优化方案：**
- 只检查修改的文件
- 使用缓存机制
- 并行执行检查

### Q4: CI检查失败但本地检查通过

**可能原因：**
- 环境差异
- 文件路径问题
- 版本不一致

**解决方案：**
- 检查CI环境配置
- 使用相对路径
- 同步依赖版本

## 📈 最佳实践

### 1. 开发阶段
- 使用IDE插件检测硬编码字符串
- 及时修复发现的硬编码API
- 遵循统一的API调用模式

### 2. 代码审查
- 重点关注新增的API调用
- 确保使用端点常量
- 检查类型定义是否完整

### 3. 测试阶段
- 在CI/CD中集成API检查
- 设置合理的质量阈值
- 定期分析质量趋势

### 4. 维护阶段
- 定期更新端点配置
- 清理不再使用的API
- 优化检查工具性能

## 🔮 未来计划

- [ ] 支持更多前端框架（React、Angular）
- [ ] 智能API重构建议
- [ ] 与Swagger/OpenAPI集成
- [ ] API使用性能分析
- [ ] 团队API使用报告

## 📞 支持和反馈

如果遇到问题或有改进建议，请：
1. 查看已有的Issue
2. 提交新的Issue，包含详细的错误信息
3. 提供修复建议或Pull Request

---

**记住：** 良好的API规范是高质量代码的基础。使用这些工具来保持代码的一致性和可维护性！